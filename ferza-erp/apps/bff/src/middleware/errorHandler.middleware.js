export function errorHandler(err, req, res, next) {
  // eslint-disable-line no-unused-vars
  const status = err?.statusCode || err?.status || 500;
  const message = err?.message || "Internal Server Error";
  if (status >= 500) {
    // Keep details server-side; client gets a stable response.
    // eslint-disable-next-line no-console
    console.error(err);
  }
  res.status(status).json({ error: message });
}
