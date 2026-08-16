export function createCors({ trace = () => {} } = {}) {
  // TODO: Origin을 확인하고 허용·거부·preflight CORS 응답을 구현하세요.
  return (_req, _res, next) => {
    trace('cors');
    next();
  };
}
