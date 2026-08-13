export function createRequestTimer({
  write = console.log,
  trace = () => {},
} = {}) {
  return (_req, _res, next) => {
    trace('timer');
    write('request timer를 완성하세요.');
    next();
  };
}
