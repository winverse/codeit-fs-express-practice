# Express 미들웨어

1. `src/middlewares/`의 CORS, logger, request timer와 사용자 입력 검증 미들웨어를 완성합니다.
2. 제공된 `src/routes/users.js`는 입력 검증 미들웨어가 이미 연결되어 있습니다. 이 파일은 route와 trace 진입점을 확인할 때 참고하고 수정하지 않습니다.
3. `src/app.js`에서 CORS를 JSON parser보다 앞에 두고 CORS→logger→timer→route 순서로 연결합니다.

계약은 다음과 같습니다.

- 허용 Origin `http://localhost:3000`의 `POST /users`와 `{ "name": "Alice", "email": "alice@example.com" }` → 201 `{ "user": body }`, `Access-Control-Allow-Origin`과 `Vary: Origin`, trace `cors→logger→timer→route`
- 누락·빈 body → 400 `{ "message": "Name and email are required" }`, trace `cors→logger→timer`; 허용 Origin의 malformed JSON → CORS·Vary가 있는 400 `{ "message": "Malformed JSON body" }`, trace `cors`
- 금지 Origin `https://evil.example` → body 형식과 관계없이 403 `{ "message": "Origin is not allowed" }`와 `Vary: Origin`, trace `cors`
- Origin이 없으면 CORS 허용 헤더 없이 정상 처리하되 `Vary: Origin`을 응답합니다.
- 허용 Origin의 `OPTIONS /users` → 204와 CORS·`Vary: Origin`, trace `cors`
- 성공 응답이 끝난 뒤 logger와 timer는 `POST /users 201`, `completed in` 로그를 남깁니다.

`npm run check:06`이 status·Content-Type·header·body·로그·실행 순서와 서버 종료를 확인합니다.
