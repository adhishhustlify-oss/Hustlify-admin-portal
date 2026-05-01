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
const contentRoutes = require('./routes/content');

const app = express();

// =============================
// 🔧 BASIC MIDDLEWARE
// =============================
app.set('trust proxy', 1);
app.use(cors());
app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// =============================
// 📁 STATIC FILES (IMPORTANT)
// =============================
app.use("/storage", express.static(path.join(__dirname, "..", "storage")));
app.use(express.static(path.join(__dirname, '..', 'public')));

// =============================
// 🔌 API ROUTES
// =============================
app.use('/api/upload', uploadRoutes);
app.use('/api/generate-link', generateLinkRoutes);
app.use('/api/watch', watchRoutes);
app.use('/api/content', contentRoutes);

// =============================
// 🌐 PAGE ROUTES
// =============================

// Homepage → redirect to admin
app.get('/', (req, res) => {
  res.redirect('/admin');
});

// Admin panel
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'admin.html'));
});

// Player page
app.get('/watch/:token', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'player.html'));
});

// =============================
// ❤️ HEALTH CHECK
// =============================
app.get('/health', (req, res) => {
  res.json({ status: 'ok', env: config.nodeEnv });
});

// =============================
// ❌ ERROR HANDLING
// =============================
app.use(notFound);
app.use(errorHandler);

// =============================
// 🚀 START SERVER (Render safe)
// =============================
const PORT = process.env.PORT || config.port || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Hustlify Portal running on port ${PORT}`);
});