const admin = require('firebase-admin');

const serviceAccount = require("./firebase-admin-key.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://toy-troopers-7f1a6-default-rtdb.firebaseio.com",
    storageBucket: "toy-troopers-7f1a6.appspot.com"
});

const db = admin.database();
const storage = admin.storage();

module.exports = { db, storage };
