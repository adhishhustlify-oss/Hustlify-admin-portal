const express = require('express');
const { db, admin } = require('../firebase');
const { generateToken } = require('../utils/token');
const config = require('../config/env');
const httpError = require('../utils/httpError');

const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    const { contentId, expiresInMinutes } = req.body;
    if (!contentId) throw httpError(400, 'contentId is required');

    const contentDoc = await db.collection('content').doc(contentId).get();
    if (!contentDoc.exists) throw httpError(404, 'Content not found');

    let token;
    let tokenExists = true;
    for (let i = 0; i < 5 && tokenExists; i += 1) {
      token = generateToken(12);
      const existing = await db.collection('links').doc(token).get();
      tokenExists = existing.exists;
    }
    if (tokenExists) throw httpError(500, 'Failed to allocate token');

    const now = Date.now();
    const ttl = Number.isFinite(Number(expiresInMinutes)) ? Number(expiresInMinutes) : config.defaultLinkExpiryMinutes;
    const expiresAt = new Date(now + Math.max(1, ttl) * 60 * 1000);

    await db.collection('links').doc(token).set({
      token,
      contentId,
      used: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      expiresAt: admin.firestore.Timestamp.fromDate(expiresAt),
    });

    const baseUrl = config.appBaseUrl || `${req.protocol}://${req.get('host')}`;
    res.json({ token, url: `${baseUrl}/watch/${token}`, expiresAt: expiresAt.toISOString() });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
