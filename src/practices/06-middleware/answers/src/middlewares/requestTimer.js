export function createRequestTimer({
  write = console.log,
  trace = () => {},
} = {}) {
  return (_req, res, next) => {
    trace('timer');
    const startedAt = Date.now();
    res.on('finish', () => {
      write(`completed in ${Date.now() - startedAt}ms`);
    });
    next();
  };
}
