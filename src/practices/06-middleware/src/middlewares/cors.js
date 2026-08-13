export function createCors({ trace = () => {} } = {}) {
  return (_req, _res, next) => {
    trace('cors');
    next();
  };
}
