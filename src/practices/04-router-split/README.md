# 라우터 분리

1. `src/routes/users.js`와 `src/routes/search.js`에 각 endpoint를 옮깁니다.
2. `src/routes/index.js`에서 기능별 Router를 연결합니다.
3. `src/app.js`에는 JSON 파서와 루트 Router 연결만 남깁니다. `GET /`, `GET /users/:userId`, `GET /search`의 응답은 분리 전 계약을 유지해야 합니다.

`npm run check:04`가 정상 응답, 중복 query의 400과 Router 분리 구조를 함께 확인합니다.
