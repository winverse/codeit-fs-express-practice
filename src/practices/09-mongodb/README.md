# MongoDB 연동

1. 제공된 `src/db`는 테스트가 만드는 격리 DB에 연결하는 도우미입니다. 이 파일은 수정하지 않습니다. `src/models/user.js`의 `TODO`에서 `name`은 required·trim, `email`은 required·trim·lowercase·unique로 정의하고 timestamps를 켭니다. `unique`는 validator가 아니라 MongoDB 고유 index 선언입니다.
2. `src/routes/users.js`의 `TODO`를 따라 CRUD를 완성합니다.
3. `src/server.js`의 `TODO`에서 malformed JSON은 400, 예상 밖 오류는 내부 정보를 숨긴 500 JSON으로 응답하도록 완성합니다. 테스트가 매 실행마다 만든 격리 MongoDB에 연결하므로 개인 Atlas 주소나 비밀값을 입력하지 않습니다.

계약은 다음과 같습니다.

- 테스트가 매번 만드는 `express_practice` DB를 fixture 사용자 2명으로 reset하고 고유 index를 준비합니다. 개인 Atlas나 기존 로컬 DB에 의존하지 않습니다.
- `GET /users` → email 오름차순의 200 `{ "users": [...] }`; `POST /users`의 `{ "name": " Carol ", "email": "CAROL@EXAMPLE.COM " }` → 201과 ObjectId·`createdAt`·`updatedAt`이 있고 name·email이 `Carol`·`carol@example.com`으로 정규화된 `{ "user": ... }`
- `GET /users/:userId` → 200 `{ "user": ... }`; `PATCH /users/:userId`의 `{ "name": "Caroline" }` → 200과 수정된 `{ "user": ... }`; `DELETE /users/:userId` → 200 `{ "message": "User deleted", "user": ... }`
- 빈·누락 body → 400 `{ "message": "Name and email are required" }`; malformed JSON → 400 `{ "message": "Malformed JSON body" }`; 빈 PATCH body → 400 `{ "message": "Updates are required" }`; 잘못된 ObjectId → 400 `{ "message": "Invalid user id" }`
- 없는 문서 → 404 `{ "message": "User not found" }`; 생성·수정의 빈 필수 값과 Mongoose validation 오류 → 400 `{ "message": "Name and email are required" }`; 생성·수정의 중복 email과 고유 index 오류 → 409 `{ "message": "Email already exists" }`
- 생성 문서는 재연결 후에도 유지되고 수정·삭제 전후 문서 수와 값이 맞아야 합니다. 예상 밖 DB 오류 → 500 `{ "message": "Internal server error" }`이며 내부 message·stack을 노출하지 않습니다.

`npm run check:09`가 schema validation·고유 index·fixture/reset·CRUD 전후 데이터·오류 응답·재연결을 확인합니다.
