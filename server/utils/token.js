const crypto = require('crypto');

function generateToken(length = 12) {
  return crypto.randomBytes(length).toString('base64url').slice(0, length);
}

module.exports = { generateToken };
