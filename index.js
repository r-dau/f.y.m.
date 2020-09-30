const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server, { origins: "localhost:8080" });
const db = require("./db");
const cookieSession = require("cookie-session");
const { hash, compare } = require("./bc");
const compression = require("compression");
const csurf = require("csurf");
const cryptoRandomString = require("crypto-random-string");
const { sendEmail } = require("./ses");
const s3 = require("./s3");
const { s3Url } = require("./config.json");
const multer = require("multer");
const uidSafe = require("uid-safe");
const path = require("path");

const { CLIENT_ID, CLIENT_SECRET, YTB_KEY } = require("./secrets");
const SpotifyWebApi = require("spotify-web-api-node");
const YouTube = require("youtube-node");

const youTube = new YouTube();
youTube.setKey(YTB_KEY);

const spotifyApi = new SpotifyWebApi({
    clientId: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
});

const diskStorage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, __dirname + "/uploads");
    },
    filename: function (req, file, callback) {
        uidSafe(24).then(function (uid) {
            callback(null, uid + path.extname(file.originalname));
        });
    },
});

const uploader = multer({
    storage: diskStorage,
    limits: {
        fileSize: 2097152,
    },
});

app.use(compression());

app.use(express.json());

app.use(express.static("public"));

const cookieSessionMiddleware = cookieSession({
    secret: `I'm always angry.`,
    maxAge: 1000 * 60 * 60 * 24 * 90,
});

app.use(cookieSessionMiddleware);
io.use(function (socket, next) {
    cookieSessionMiddleware(socket.request, socket.request.res, next);
});

app.use(csurf());

app.use(function (req, res, next) {
    res.cookie("mytoken", req.csrfToken());
    next();
});

if (process.env.NODE_ENV != "production") {
    app.use(
        "/bundle.js",
        require("http-proxy-middleware")({
            target: "http://localhost:8081/",
        })
    );
} else {
    app.use("/bundle.js", (req, res) => res.sendFile(`${__dirname}/bundle.js`));
}

///// ROUTES /////

app.post("/register", (req, res) => {
    hash(req.body.password)
        .then((hashedPw) => {
            return db
                .addUsersInput(
                    req.body.first,
                    req.body.last,
                    req.body.email,
                    hashedPw
                )
                .then((results) => {
                    req.session.userId = results.rows[0].id;
                    res.json({ success: true });
                });
        })
        .catch((err) => {
            console.log("err in hash: ", err);
            res.json({ success: false });
        });
});

app.post("/login", (req, res) => {
    return db.getUsersPw(req.body.email).then((results) => {
        compare(req.body.password, results.rows[0].password)
            .then((match) => {
                console.log("match: ", match);
                if (match == true) {
                    req.session.userId = results.rows[0].id;
                    res.json({ success: true });
                } else {
                    res.json({ success: false });
                }
            })
            .catch((err) => {
                console.log("err in post login", err);
            });
    });
});

app.post("/reset", (req, res) => {
    return db
        .getUsersEmail(req.body.email)
        .then((results) => {
            if (results.rows[0].email) {
                const secretCode = cryptoRandomString({
                    length: 6,
                });
                db.addSecretCode(results.rows[0].email, secretCode);

                const recipient = req.body.email;
                const message = `Hello, here is your code to update your ${secretCode} password`;
                const subject = `Reset Password`;
                sendEmail(recipient, message, subject);
            }
        })
        .then(() => {
            res.json({ success: true });
        })
        .catch((err) => {
            console.log("err in post reset", err);
            res.json({ success: false });
        });
});

app.post("/reset/verify", (req, res) => {
    db.getSecretCode(req.body.email)
        .then((data) => {
            if (req.body.code === data.rows[0].code) {
                hash(req.body.password).then((hashedPw) => {
                    db.updatePassword(req.body.email, hashedPw)
                        .then(() => {
                            res.json({ success: true });
                        })
                        .catch((err) => {
                            console.log("err in post updatePassword: ", err);
                        });
                });
            }
        })
        .catch((err) => {
            console.log("err in getSecretCode: ", err);
        });
});

app.post("/upload", uploader.single("file"), s3.upload, (req, res) => {
    if (req.file) {
        db.addImage(req.session.userId, `${s3Url}${req.file.filename}`)
            .then(() => {
                res.json(`${s3Url}${req.file.filename}`);
            })
            .catch((err) => {
                console.log(err);
            });
    } else {
        res.json({ success: false });
    }
});

app.post("/save", (req, res) => {
    console.log("req.body in post /save: ", req.body);
    if (req.session.userId) {
        db.saveBio(req.session.userId, req.body.currentBio)
            .then((data) => {
                console.log("update bio!!");
                console.log("data in post /save: ", data);
                res.json(data.rows[0].bio);
            })
            .catch((err) => {
                console.log("err in post /save: ", err);
            });
    } else {
        res.json({ success: false });
    }
});

app.get("/user", (req, res) => {
    if (req.session.userId) {
        db.getUsersInfo(req.session.userId)
            .then((data) => {
                res.json(data.rows[0]);
            })
            .catch((err) => {
                console.log("err in getUsersInfo: ", err);
            });
    } else {
        res.sendFile(__dirname + "/index.html");
    }
});

app.get("/user/:id.json", async (req, res) => {
    if (req.session.userId == req.params.id) {
        res.json({ self: true });
    } else {
        try {
            const data = await db.getUserById(req.params.id);
            res.json(data.rows[0]);
        } catch (err) {
            console.log(err);
            res.json({ error: "User does not exits." });
        }
    }
});

app.get("/users/:name", async (req, res) => {
    if (req.params.name == "+") {
        try {
            const data = await db.getRecentUsers();
            console.log("data in /users: ", data);
            res.json(data.rows);
        } catch (err) {
            console.log(err);
            res.json({ err: "User does not exits." });
        }
    } else {
        try {
            const data = await db.getMatchingUsers(req.params.name);
            console.log("data in /users getMatchingUsers: ", data);
            res.json(data.rows);
        } catch (err) {
            console.log(err);
            res.json({ err: "User does not exits." });
        }
    }
});

app.get("/friendship-status/:id", async (req, res) => {
    try {
        const data = await db.getFriendshipStatus(
            req.params.id,
            req.session.userId
        );
        console.log("data in friendship-status GET: ", data);
        res.json(data.rows);
    } catch (err) {
        console.log(err);
    }
});

app.post("/make-friend-request/:id", async (req, res) => {
    try {
        const data = await db.makeFriendRequest(
            req.session.userId,
            req.params.id
        );
        console.log("data in /make-friend-request POST: ", data);
        res.json(data.rows);
    } catch (err) {
        console.log("err in /make-friend-request POST: ", err);
    }
});

app.post("/accept-friend-request/:id", async (req, res) => {
    try {
        const data = await db.acceptFriendRequest(
            req.session.userId,
            req.params.id
        );
        console.log("data in accept friends: ", data);
        res.json({ data: true });
    } catch (err) {
        console.log(err);
    }
});

app.post("/delete-friendship/:id", async (req, res) => {
    console.log("req.body in accept friends: ", req.body);
    console.log("req.params in accept friends: ", req.params);
    try {
        const data = await db.acceptFriendRequest(
            req.session.userId,
            req.params.id
        );
        console.log("data in accept friends: ", data);
        res.json({ data: true });
    } catch (err) {
        console.log(err);
    }
});

app.get("/friends-wannabes", async (req, res) => {
    try {
        const data = await db.friendsWannabes(req.session.userId);
        console.log("data in /friends-wannabes GET: ", data);
        res.json(data.rows);
    } catch (err) {
        console.log("err in /friends-wannabes GET: ", err);
    }
});

app.get("/get-messages", async (req, res) => {
    try {
        const data = await db.getLastTenMsgs(req.session.userId);
        console.log("data in /get-messages GET: ", data);
        res.json(data.rows);
    } catch (err) {
        console.log("err in /get-messages GET: ", err);
    }
});

app.get("/search/:artist", (req, res) => {
    let generateRandomCountry = function () {
        let number = "";
        const availableMarkets = [
            "AD",
            "AE",
            "AL",
            "AR",
            "AT",
            "AU",
            "BA",
            "BE",
            "BG",
            "BH",
            "BO",
            "BR",
            "BY",
            "CA",
            "CH",
            "CL",
            "CO",
            "CR",
            "CY",
            "CZ",
            "DE",
            "DK",
            "DO",
            "DZ",
            "EC",
            "EE",
            "EG",
            "ES",
            "FI",
            "FR",
            "GB",
            "GR",
            "GT",
            "HK",
            "HN",
            "HR",
            "HU",
            "ID",
            "IE",
            "IL",
            "IN",
            "IS",
            "IT",
            "JO",
            "JP",
            "KW",
            "KZ",
            "LB",
            "LI",
            "LT",
            "LU",
            "LV",
            "MA",
            "MC",
            "MD",
            "ME",
            "MK",
            "MT",
            "MX",
            "MY",
            "NI",
            "NL",
            "NO",
            "NZ",
            "OM",
            "PA",
            "PE",
            "PH",
            "PL",
            "PS",
            "PT",
            "PY",
            "QA",
            "RO",
            "RS",
            "RU",
            "SA",
            "SE",
            "SG",
            "SI",
            "SK",
            "SV",
            "TH",
            "TN",
            "TR",
            "TW",
            "UA",
            "US",
            "UY",
            "VN",
            "XK",
            "ZA",
        ];

        for (let i = 0; i < availableMarkets.length - 1; i++) {
            number = Math.floor(Math.random() * availableMarkets.length);
        }
        return availableMarkets[number];
    };

    spotifyApi.clientCredentialsGrant().then(
        function (data) {
            spotifyApi.setAccessToken(data.body["access_token"]);
            getNewReleases();
        },
        function (err) {
            console.log(
                "Something went wrong when retrieving an access token",
                err
            );
        }
    );
    function getNewReleases() {
        if (req.params.artist == "+") {
            spotifyApi
                .getNewReleases({
                    limit: 20,
                    offset: 0,
                    country: generateRandomCountry(),
                })
                .then(
                    function (data) {
                        res.json(data.body.albums.items);
                    },
                    function (err) {
                        console.log("Something went wrong!", err);
                    }
                );
        } else {
            spotifyApi.searchArtists(`${req.params.artist}`).then(
                function (data) {
                    res.json(data.body.artists.items);
                    return res.sendStatus(200);
                },
                function (err) {
                    console.log("Something went wrong!", err);
                }
            );
        }
    }
});

app.get("/youtube/:name", (req, res) => {
    youTube.search(req.params.name, 8, function (error, result) {
        if (error) {
            console.log(error);
        } else {
            res.json(result.items);
        }
    });
});

app.get("/logout", (req, res) => {
    req.session = null;
    res.redirect("/welcome");
});

app.get("/welcome", (req, res) => {
    if (req.session.userId) {
        res.redirect("/");
    } else {
        res.sendFile(__dirname + "/index.html");
    }
});

app.get("*", function (req, res) {
    if (!req.session.userId) {
        res.redirect("/welcome");
    } else {
        res.sendFile(__dirname + "/index.html");
    }
});

server.listen(8080, function () {
    console.log("I'm listening.");
});

io.on("connection", async (socket) => {
    if (!socket.request.session.userId) {
        return socket.disconnect(true);
    }

    const userId = socket.request.session.userId;

    try {
        const data = await db.getLastTenMsgs();
        io.sockets.emit("chatMessages", data.rows.reverse());
    } catch (err) {
        console.log("err in io.on: ", err);
    }

    socket.on("chat message", async (newMsg) => {
        try {
            const message = await db.addNewMessage(newMsg, userId);

            const newMessage = await db.getNewMessage(message.rows[0].id);

            io.sockets.emit("chatMessage", newMessage.rows[0]);
        } catch (err) {
            console.log("err in io.on: ", err);
        }
    });
});
