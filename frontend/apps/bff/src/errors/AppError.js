class AppError extends Error {
  /**
   * @param {string} code    - Machine-readable code e.g. "FORBIDDEN", "SOD_VIOLATION"
   * @param {string} message - Human-readable message
   * @param {number} status  - HTTP status code
   * @param {string} [field] - Field name for validation errors
   */
  constructor(code, message, status = 400, field = undefined) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.status = status;
    this.field = field;
  }
}

module.exports = { AppError };