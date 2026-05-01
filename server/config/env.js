const path = require('path');

function required(name, value) {
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 3000),
  appBaseUrl: process.env.APP_BASE_URL || '',
  firebaseServiceAccountPath: path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './serviceAccountKey.json'),
  firebaseStorageBucket: required('FIREBASE_STORAGE_BUCKET', process.env.FIREBASE_STORAGE_BUCKET),
  signedUrlMinutes: Number(process.env.SIGNED_URL_MINUTES || 10),
  defaultLinkExpiryMinutes: Number(process.env.DEFAULT_LINK_EXPIRY_MINUTES || 60 * 24),
  maxUploadMb: Number(process.env.MAX_UPLOAD_MB || 200),
};

module.exports = config;
