export function createLogger({ write = console.log, trace = () => {} } = {}) {
  // TODO: 요청이 들어오면 ISO 시각·method·URL을 기록하세요.
  return (req, _res, next) => {
    trace('logger');
    write(`${req.method} ${req.url}`);
    next();
  };
}
