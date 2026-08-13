export function createLogger({ write = console.log, trace = () => {} } = {}) {
  return (_req, _res, next) => {
    trace('logger');
    write('logger를 완성하세요.');
    next();
  };
}
