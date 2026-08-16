export function createRequestTimer({
  write = console.log,
  trace = () => {},
} = {}) {
  // TODO: 응답 완료 시 실제 경과 시간을 completed in <정수>ms로 기록하세요.
  return (_req, _res, next) => {
    trace('timer');
    write('request timer를 완성하세요.');
    next();
  };
}
