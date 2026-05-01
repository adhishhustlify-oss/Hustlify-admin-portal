const express = require('express');
const { db, bucket, admin } = require('../firebase');
const config = require('../config/env');
const httpError = require('../utils/httpError');

const router = express.Router();

router.get('/:token', async (req, res, next) => {
  const { token } = req.params;

  try {
    const linkRef = db.collection('links').doc(token);
    const result = await db.runTransaction(async (tx) => {
      const linkSnap = await tx.get(linkRef);
      if (!linkSnap.exists) throw httpError(404, 'Invalid link');

      const linkData = linkSnap.data();
      if (linkData.used) throw httpError(410, 'Link expired');
      if (!linkData.expiresAt || linkData.expiresAt.toDate() < new Date()) {
        tx.update(linkRef, { used: true, usedAt: admin.firestore.FieldValue.serverTimestamp() });
        throw httpError(410, 'Link expired');
      }

      tx.update(linkRef, { used: true, usedAt: admin.firestore.FieldValue.serverTimestamp() });
      return { contentId: linkData.contentId };
    });

    const contentSnap = await db.collection('content').doc(result.contentId).get();
    if (!contentSnap.exists) throw httpError(404, 'Content not found');
    const content = contentSnap.data();

    const file = bucket.file(content.storagePath);
    const [signedUrl] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + config.signedUrlMinutes * 60 * 1000,
      version: 'v4',
    });

    await db.collection('linkLogs').add({
      token,
      contentId: result.contentId,
      openedAt: admin.firestore.FieldValue.serverTimestamp(),
      ip: req.ip,
      userAgent: req.get('user-agent') || 'unknown',
    });

    res.json({ token, content: { id: content.id, type: content.type, originalName: content.originalName, fileUrl: signedUrl } });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
