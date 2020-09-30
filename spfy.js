// const express = require("express");
// const app = express();
// const { SPFY_ID, SPFY_KEY } = require("./secrets.json");
// const SpotifyWebApi = require("spotify-web-api-node");

// var spotifyApi = new SpotifyWebApi({
//     clientId: SPFY_ID,
//     clientSecret: SPFY_KEY,
//     redirectUri: "http://localhost:8888/callback",
// });

// app.get("/accestoken", (req, res) => {
//     spotifyApi.clientCredentialsGrant().then(
//         function (data) {
//             console.log(
//                 "The access token expires in " + data.body["expires_in"]
//             );
//             console.log("The access token is " + data.body["access_token"]);
//             // Save the access token so that it's used in future calls
//             spotifyApi.setAccessToken(data.body["access_token"]);
//             spotifyApi.searchTracks("artist:yakoto").then((data) => {
//                 console.log("data from spotify:", data);
//             });
//         },
//         function (err) {
//             console.log(
//                 "Something went wrong when retrieving an access token",
//                 err
//             );
//         }
//     );
//     res.sendStatus(200);
// });
// app.get("/test-artist", (req, res) => {
//     spotifyApi.searchTracks("artist:Love").then(
//         function (data) {
//             console.log(data.body);
//         },
//         function (err) {
//             console.log("Something went wrong!", err);
//         }
//     );
//     res.sendStatus(200);
// });
// app.listen(8080, () => {
//     console.log("spotify api server running");
// });
