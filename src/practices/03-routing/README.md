# Express 라우팅

`src/app.js`에서 params, query, JSON body를 사용하는 라우트를 완성하세요.

- `GET /users/:userId`
- `GET /search?q=express&limit=10` (`limit` 기본값 20, 숫자로 응답)
- `GET /users/:userId/posts/:postId`
- `POST /users`, `PUT /users/:userId`, `DELETE /users/:userId`

계약은 다음과 같습니다.

- `GET /users/123` → 200 `{ "userId": "123" }`
- `GET /search?q=express&limit=10` → 200 `{ "query": "express", "limit": 10 }`; 생략 시 `{ "query": "", "limit": 20 }`; `limit`은 1 이상의 유한한 숫자여야 하며, 이 조건을 어기거나 `q`·`limit`을 여러 번 전달하면 400 `{ "message": "Invalid query" }`
- `GET /users/1/posts/20` → 200 `{ "userId": "1", "postId": "20" }`
- `POST /users`의 body `{ "name": "Alice", "email": "alice@example.com" }` → 201 `{ "user": body }`; 빈·누락 body → 400 `{ "message": "Name and email are required" }`; malformed JSON → 400 `{ "message": "Malformed JSON body" }`
- `PUT /users/7`의 body `{ "name": "Alicia" }` → 200 `{ "userId": "7", "updates": body }`; 빈 body → 400 `{ "message": "Updates are required" }`
- `DELETE /users/7` → 200 `{ "message": "User deleted", "userId": "7" }`; 알 수 없는 경로는 404 `{ "message": "Route not found" }`

`npm run check:03`이 모든 method·path·입력·상태·Content-Type·본문과 확인 뒤 테스트 서버 종료를 검사합니다.
