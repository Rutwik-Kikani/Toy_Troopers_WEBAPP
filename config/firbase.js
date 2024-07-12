const admin = require('firebase-admin');
const dotenv = require('dotenv');

dotenv.config();

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://toy-troopers-7f1a6-default-rtdb.firebaseio.com"
});

const db = admin.database();
const storage = admin.storage();

module.export = { db, storage };
