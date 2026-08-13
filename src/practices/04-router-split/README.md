# 라우터 분리

1. `src/routes/users.js`와 `src/routes/search.js`에 각 endpoint를 옮깁니다.
2. `src/routes/index.js`에서 기능별 Router를 연결합니다.
3. `src/app.js`에는 JSON 파서와 루트 Router 연결만 남깁니다. `GET /`, `GET /users/:userId`, `GET /search`의 응답은 분리 전 계약을 유지해야 합니다.

계약은 다음과 같습니다.

- `GET /` → 200 `{ "message": "Hello Express!" }`
- `GET /users/42` → 200 `{ "userId": "42" }`
- `GET /search?q=router&limit=5` → 200 `{ "query": "router", "limit": 5 }`; 생략 시 `{ "query": "", "limit": 20 }`; `limit`은 1 이상의 유한한 숫자여야 하며, 이 조건을 어기거나 `q`·`limit`을 여러 번 전달하면 400 `{ "message": "Invalid query" }`
- 알 수 없는 경로 → 404 `{ "message": "Route not found" }`

`npm run check:04`가 status·Content-Type·본문, Router 분리 구조와 확인 뒤 테스트 서버 종료를 함께 검사합니다.
