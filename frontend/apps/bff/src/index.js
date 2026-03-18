const path = require('path');
const dotenv = require('dotenv');

const nodeEnv = process.env.NODE_ENV ?? 'development';
dotenv.config({ path: path.resolve(__dirname, '..', `.env.${nodeEnv}`) });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const env = require('./config/env');
const logger = require('./middleware/logger.middleware');
const auth = require('./middleware/auth.middleware');
const errorHandler = require('./middleware/errorHandler.middleware');
const authRoutes = require('./routes/auth.routes');
const routes = require('./routes/index.routes');

const app = express();

// ─── Security headers ────────────────────────────────────────────────────────
app.use(helmet());

// ─── CORS ────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: env.corsOrigin,
    credentials: true,
  }),
);

// ─── Body parsing ────────────────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));

// ─── Request logging ─────────────────────────────────────────────────────────
app.use(logger);

// ─── Rate limiting ───────────────────────────────────────────────────────────
app.use(
  '/bff/auth',
  rateLimit({ windowMs: 60_000, max: 10, message: { error: { code: 'RATE_LIMITED', message: 'Trop de tentatives.' } } }),
);
app.use(
  '/bff',
  rateLimit({ windowMs: 60_000, max: 300, message: { error: { code: 'RATE_LIMITED', message: 'Trop de requêtes.' } } }),
);

// ─── Health check (no auth) ──────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    env: env.nodeEnv,
    useMock: env.useMock,
    timestamp: new Date().toISOString(),
  });
});

// ─── Public auth routes (login/roles/debug) ─────────────────────────────────
app.use('/bff/auth', authRoutes);

// ─── Auth middleware — applied to all other /bff/* routes ───────────────────
app.use('/bff', auth);

// ─── BFF routes ──────────────────────────────────────────────────────────────
app.use('/bff', routes);

// ─── 404 fallback ────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route inexistante.' } });
});

// ─── Global error handler (must be last) ─────────────────────────────────────
app.use(errorHandler);

// ─── Start ───────────────────────────────────────────────────────────────────
app.listen(env.port, () => {
  // eslint-disable-next-line no-console
  console.log(`\n  🚀  BFF listening on http://localhost:${env.port}`);
  // eslint-disable-next-line no-console
  console.log(`  📦  Mode: ${env.useMock ? 'MOCK' : 'REAL'} | Env: ${env.nodeEnv}\n`);
});
