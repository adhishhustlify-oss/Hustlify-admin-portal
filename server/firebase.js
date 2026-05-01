const admin = require('firebase-admin');
const fs = require('fs');
const config = require('./config/env');

if (!fs.existsSync(config.firebaseServiceAccountPath)) {
  throw new Error(`Firebase service account file not found at: ${config.firebaseServiceAccountPath}`);
}

const serviceAccount = require(config.firebaseServiceAccountPath);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: config.firebaseStorageBucket,
  });
}

const db = admin.firestore();
db.settings({ ignoreUndefinedProperties: true });

const bucket = admin.storage().bucket();

module.exports = { admin, db, bucket };
