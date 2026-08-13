# Express 미들웨어

1. `src/middlewares/`의 CORS, logger, request timer와 사용자 입력 검증 미들웨어를 완성합니다.
2. `src/routes/users.js`에 입력 검증 미들웨어를 연결합니다.
3. `src/app.js`에서 CORS를 JSON parser보다 앞에 두고 CORS→logger→timer→route 순서로 연결합니다.

정상 POST는 201, 잘못된 입력은 400, 허용되지 않은 Origin은 403이어야 합니다. 허용된 OPTIONS 요청은 204와 CORS·`Vary: Origin` 헤더를 응답해야 합니다. `npm run check:06`이 응답과 미들웨어 실행 순서를 확인합니다.
