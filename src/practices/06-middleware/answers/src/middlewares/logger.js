export function createLogger({ write = console.log, trace = () => {} } = {}) {
  return (req, _res, next) => {
    trace('logger');
    const timestamp = new Date().toISOString();
    write(`[${timestamp}] ${req.method} ${req.url}`);
    next();
  };
}
