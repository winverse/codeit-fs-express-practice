export function errorHandler(error, _req, res, _next) {
  res.status(500).json({ success: false, message: error.message });
}
