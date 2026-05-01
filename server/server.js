require('dotenv').config();

const express = require('express');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');

const config = require('./config/env');
const { notFound, errorHandler } = require('./middleware/errorHandler');

// Routes
const uploadRoutes = require('./routes/upload');
const generateLinkRoutes = require('./routes/generateLink');
const watchRoutes = require('./routes/watch');
const contentRoutes = require('./routes/content'); // ✅ REQUIRED

const app = express();

// ===== STATIC FILES =====
app.use("/storage", express.static(path.join(__dirname, "..", "storage")));
app.use(express.static(path.join(__dirname, '..', 'public'), { maxAge: '1h' }));

// ===== MIDDLEWARE =====
app.set('trust proxy', 1);
app.use(cors());
app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ===== API ROUTES =====
app.use('/api/upload', uploadRoutes);
app.use('/api/generate-link', generateLinkRoutes);
app.use('/api/watch', watchRoutes);
app.use('/api/content', contentRoutes); // ✅ THIS IS WHAT YOUR UI NEEDS

// ===== PAGES =====
app.get('/admin', (_req, res) =>
  res.sendFile(path.join(__dirname, '..', 'public', 'admin.html'))
);

app.get('/watch/:token', (_req, res) =>
  res.sendFile(path.join(__dirname, '..', 'public', 'player.html'))
);

// ===== HEALTH =====
app.get('/health', (_req, res) =>
  res.json({ status: 'ok', env: config.nodeEnv })
);

// ===== ERROR HANDLING =====
app.use(notFound);
app.use(errorHandler);

// ===== START SERVER =====
app.listen(config.port, () => {
  console.log(`🚀 Hustlify Portal running on http://localhost:${config.port}`);
});