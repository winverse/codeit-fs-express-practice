# Express 라우팅

`src/app.js`에서 params, query, JSON body를 사용하는 라우트를 완성하세요.

- `GET /users/:userId`
- `GET /search?q=express&limit=10` (`limit` 기본값 20, 숫자로 응답)
- `GET /users/:userId/posts/:postId`
- `POST /users`, `PUT /users/:userId`, `DELETE /users/:userId`

빈 PUT body와 빈·잘못된 POST JSON은 400이어야 합니다. `npm run check:03`이 모든 method·path·입력·응답 계약, 숫자가 아니거나 여러 번 전달된 query의 400, 알 수 없는 경로의 404를 확인합니다.
