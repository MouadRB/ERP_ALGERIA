const { v4: uuidv4 } = require('uuid');

const ANSI = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  gray: '\x1b[90m',
};

const methodColor = (method) => {
  const map = {
    GET: ANSI.green,
    POST: ANSI.cyan,
    PATCH: ANSI.yellow,
    PUT: ANSI.yellow,
    DELETE: ANSI.red,
  };
  return map[method] ?? ANSI.gray;
};

const statusColor = (status) => {
  if (status >= 500) return ANSI.red;
  if (status >= 400) return ANSI.yellow;
  if (status >= 300) return ANSI.cyan;
  return ANSI.green;
};

/**
 * Attaches a unique requestId to every request and logs
 * METHOD URL → STATUS in Xms on response finish.
 */
const logger = (req, res, next) => {
  const requestId = uuidv4();
  const startAt = process.hrtime.bigint();

  req.requestId = requestId;
  res.setHeader('X-Request-Id', requestId);

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - startAt) / 1_000_000;
    const mc = methodColor(req.method);
    const sc = statusColor(res.statusCode);

    // eslint-disable-next-line no-console
    console.log(
      `${ANSI.gray}[${new Date().toISOString()}]${ANSI.reset} ` +
      `${ANSI.bold}${mc}${req.method.padEnd(7)}${ANSI.reset} ` +
      `${req.originalUrl.padEnd(50)} ` +
      `${ANSI.bold}${sc}${res.statusCode}${ANSI.reset} ` +
      `${ANSI.gray}${durationMs.toFixed(2)}ms${ANSI.reset} ` +
      `${ANSI.magenta}[${requestId.slice(0, 8)}]${ANSI.reset}`
    );
  });

  next();
};

module.exports = logger;