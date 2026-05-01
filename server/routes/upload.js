const express = require('express');
const multer = require('multer');
const path = require('path');
const { db, bucket, admin } = require('../firebase');
const config = require('../config/env');
const httpError = require('../utils/httpError');

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: config.maxUploadMb * 1024 * 1024 },
});

router.post('/', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) throw httpError(400, 'No file uploaded.');

    const mimeType = req.file.mimetype;
    const type = mimeType.startsWith('video/') ? 'video' : 'document';
    const contentRef = db.collection('content').doc();
    const ext = path.extname(req.file.originalname) || '';
    const safeName = req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `uploads/${type}/${new Date().toISOString().slice(0, 10)}/${contentRef.id}${ext || ''}-${safeName}`;

    const file = bucket.file(storagePath);
    await file.save(req.file.buffer, {
      metadata: {
        contentType: mimeType,
        cacheControl: 'private, max-age=0, no-transform',
      },
      resumable: false,
    });

    await contentRef.set({
      id: contentRef.id,
      type,
      fileUrl: null,
      storagePath,
      originalName: req.file.originalname,
      sizeBytes: req.file.size,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(201).json({ message: 'Upload successful', content: { id: contentRef.id, type, originalName: req.file.originalname } });
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit || 25), 100);
    const snapshot = await db.collection('content').orderBy('createdAt', 'desc').limit(limit).get();
    const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
