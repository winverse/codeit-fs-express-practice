# Express 미들웨어

1. `src/middlewares/`의 `TODO`를 따라 CORS, logger와 사용자 입력 검증 미들웨어를 완성합니다.
2. 제공된 `src/routes/users.js`는 입력 검증 미들웨어가 이미 연결되어 있습니다. 이 파일은 route와 trace 진입점을 확인할 때 참고하고 수정하지 않습니다.
3. `src/server.js`에서 CORS를 JSON parser보다 앞에 두고 CORS→logger→route 순서로 연결합니다.

계약은 다음과 같습니다.

- 허용 Origin `http://localhost:3000`의 `POST /users`와 `{ "name": "Alice", "email": "alice@example.com" }` → 201 `{ "user": body }`, `Access-Control-Allow-Origin`과 `Vary: Origin`, trace `cors→logger→route`
- 누락·빈 body → 400 `{ "message": "Name and email are required" }`, trace `cors→logger`; 허용 Origin의 malformed JSON → CORS·Vary가 있는 400 `{ "message": "Malformed JSON body" }`, trace `cors`
- 금지 Origin `https://evil.example` → body 형식과 관계없이 403 `{ "message": "Origin is not allowed" }`와 `Vary: Origin`, trace `cors`
- Origin이 없으면 CORS 허용 헤더 없이 정상 처리하되 `Vary: Origin`을 응답합니다.
- 허용 Origin의 `OPTIONS /users` → 204, `Access-Control-Allow-Origin: http://localhost:3000`, `Vary: Origin`, 필수 method·header를 포함한 CORS 헤더, trace `cors`. CORS 헤더 안의 값 순서는 의미에 영향을 주지 않습니다.
- logger는 요청이 들어오면 ISO 시각·메서드·URL을 `[<ISO 시각>] POST /users` 형식으로 기록한 뒤 다음 단계로 넘깁니다.

`npm run check:06`이 status·Content-Type·header·body·요청 로그·실행 순서와 서버 종료를 확인합니다.
