export function errorHandler(error, _req, res, _next) {
  // TODO: malformed JSON, HttpException, 예상 밖 오류를 구분해 JSON으로 응답하세요.
  res.status(500).json({ success: false, message: error.message });
}
