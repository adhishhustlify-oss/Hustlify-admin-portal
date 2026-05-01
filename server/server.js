require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');

const config = require('./config/env');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const uploadRoutes = require('./routes/upload');
const generateLinkRoutes = require('./routes/generateLink');
const watchRoutes = require('./routes/watch');

const app = express();

app.set('trust proxy', 1);
app.use(cors());
app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(express.static(path.join(__dirname, '..', 'public'), { maxAge: '1h' }));

app.use('/api/upload', uploadRoutes);
app.use('/api/generate-link', generateLinkRoutes);
app.use('/api/watch', watchRoutes);

app.get('/admin', (_req, res) => res.sendFile(path.join(__dirname, '..', 'public', 'admin.html')));
app.get('/watch/:token', (_req, res) => res.sendFile(path.join(__dirname, '..', 'public', 'player.html')));
app.get('/health', (_req, res) => res.json({ status: 'ok', env: config.nodeEnv }));

app.use(notFound);
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Hustlify Portal running on http://localhost:${config.port}`);
});
