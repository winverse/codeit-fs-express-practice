export function createRequestTimer({
  write = console.log,
  trace = () => {},
} = {}) {
  return (_req, res, next) => {
    trace('timer');
    const startedAt = process.hrtime.bigint();
    res.on('finish', () => {
      const elapsedMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
      write(`completed in ${elapsedMs.toFixed(2)}ms`);
    });
    next();
  };
}
