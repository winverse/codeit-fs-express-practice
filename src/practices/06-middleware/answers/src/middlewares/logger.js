export function createLogger({ write = console.log, trace = () => {} } = {}) {
  return (req, res, next) => {
    trace('logger');
    const startedAt = Date.now();
    res.on('finish', () => {
      write(
        `${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - startedAt}ms`,
      );
    });
    next();
  };
}
