const spicedPg = require("spiced-pg");

let db;
if (process.env.DATABASE_URL) {
    // this will run if petition is running on heroku
    db = spicedPg(process.env.DATABASE_URL);
} else {
    // this will run if petition is running on localhost
    db = spicedPg("postgres:postgres:password@localhost:5432/socialnetwork");
}

module.exports.addUsersInput = (first, last, email, hash) => {
    return db.query(
        `INSERT INTO users (first, last, email, password) VALUES ($1, $2, $3, $4) RETURNING id, first`,
        [first, last, email, hash]
    );
};

module.exports.getUsersInfo = (id) => {
    return db.query(`SELECT * FROM users WHERE id = $1`, [id]);
};

module.exports.getUsersPw = (email) => {
    return db.query(`SELECT id, password FROM users WHERE email=$1`, [email]);
};

module.exports.getUsersEmail = (email) => {
    return db.query(`SELECT first, last, email FROM users WHERE email=$1`, [
        email,
    ]);
};

module.exports.getUserById = (id) => {
    return db.query(
        `SELECT id, first, last, url, bio
        FROM users 
        WHERE id = $1`,
        [id]
    );
};

module.exports.addSecretCode = (email, code) => {
    return db.query(
        `INSERT INTO reset_codes (email, code) VALUES ($1, $2) RETURNING *`,
        [email, code]
    );
};

module.exports.getSecretCode = (email) => {
    return db.query(
        `SELECT code 
        FROM reset_codes  
        WHERE email=$1 
        AND CURRENT_TIMESTAMP - created_at < INTERVAL '10 minutes'
        ORDER BY created_at DESC
        LIMIT 3 `,
        [email]
    );
};

module.exports.updatePassword = (email, hashedPw) => {
    return db.query(
        `UPDATE users 
        SET password = $2
        WHERE email = $1`,
        [email, hashedPw]
    );
};

module.exports.addImage = (id, url) => {
    return db.query(
        `UPDATE users
        SET url = $2
        WHERE id = $1 
        RETURNING *`,
        [id, url]
    );
};

module.exports.saveBio = (id, bio) => {
    return db.query(
        `UPDATE users
        SET bio = $2
        WHERE id = $1
        RETURNING bio`,
        [id, bio]
    );
};

module.exports.getMatchingUsers = (val) => {
    return db.query(
        `SELECT first, last, url, bio FROM users WHERE first ILIKE $1;`,
        [val + "%"]
    );
};

module.exports.getRecentUsers = () => {
    return db.query(`SELECT * FROM users ORDER BY id DESC LIMIT 3`);
};

module.exports.getFriendshipStatus = (id, userId) => {
    return db.query(
        `SELECT * FROM friendships
        WHERE (receiver_id = $1 AND sender_id = $2)
        OR (receiver_id = $2 AND sender_id = $1);`,
        [id, userId]
    );
};

module.exports.makeFriendRequest = (sender_id, receiver_id) => {
    return db.query(
        `INSERT INTO friendships (sender_id, receiver_id) VALUES ($1, $2) RETURNING *`,
        [sender_id, receiver_id]
    );
};

module.exports.acceptFriendRequest = (sender_id, receiver_id) => {
    return db.query(
        `UPDATE friendships
        SET accepted = true
        WHERE (receiver_id = $1 AND sender_id = $2)`,
        [sender_id, receiver_id]
    );
};

module.exports.deleteFriendship = (sender_id, receiver_id) => {
    return db.query(
        `DELETE FROM friendships 
        WHERE (receiver_id = $1 AND sender_id = $2)
        OR (receiver_id = $2 AND sender_id = $1)`,
        [sender_id, receiver_id]
    );
};

module.exports.friendsWannabes = (id) => {
    return db.query(
        `SELECT users.id, first, last, url, accepted
        FROM friendships
        JOIN users
        ON (accepted = false AND receiver_id = $1 AND sender_id = users.id)
        OR (accepted = true AND receiver_id = $1 AND sender_id = users.id)
        OR (accepted = true AND sender_id = $1 AND receiver_id = users.id)`,
        [id]
    );
};

module.exports.getLastTenMsgs = () => {
    return db.query(
        `SELECT users.id, first, last, url, message, chat.sender_id
        FROM chat
        JOIN users
        ON (sender_id = users.id)
        ORDER BY chat.id DESC
        LIMIT 10`
    );
};

module.exports.addNewMessage = (message, sender_id) => {
    return db.query(
        `INSERT INTO chat (message, sender_id) VALUES ($1, $2) RETURNING *`,
        [message, sender_id]
    );
};

module.exports.getNewMessage = (chat_id) => {
    return db.query(
        `SELECT users.id, users.first, users.last, users.url, chat.message, chat.sender_id
        FROM chat
        JOIN users
        ON (sender_id = users.id)
        WHERE chat.id = $1`,
        [chat_id]
    );
};
