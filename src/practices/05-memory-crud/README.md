# 메모리 데이터 CRUD

`fixtures/users.json`을 매 실행마다 새 배열로 복사하는 `src/routes/users.js`를 완성하세요. 목록·상세·생성·수정·삭제가 한 요청 흐름에서 상태를 올바르게 바꾸고, 새 앱을 만들면 fixture 상태로 초기화되어야 합니다.

계약은 다음과 같습니다.

- 각 app은 `fixtures/users.json`의 사용자 2명으로 시작하고 `GET /users`는 200 `{ "users": [...] }`를 응답합니다.
- `POST /users`의 `{ "name": "Carol", "email": "carol@example.com" }`은 id 3의 사용자를 만들고 201 `{ "user": ... }`를 응답합니다. 빈·누락 body → 400 `{ "message": "Name and email are required" }`; malformed JSON → 400 `{ "message": "Malformed JSON body" }`입니다.
- `GET /users/3`은 생성한 사용자를, `PATCH /users/3`의 `{ "name": "Caroline" }`은 수정한 사용자를 200으로 응답합니다. 빈 PATCH body → 400 `{ "message": "Updates are required" }`입니다.
- `DELETE /users/3`은 200 `{ "message": "User deleted", "user": ... }`로 삭제하고 이후 조회는 404입니다. 없는 사용자의 조회·수정·삭제 → 404 `{ "message": "User not found" }`입니다.
- 요청 흐름이 끝난 뒤 fixture 사용자 수는 2명이고, 새 app을 만들면 id 1·2의 fixture 상태로 초기화됩니다.

`npm run check:05`가 상태·Content-Type·본문, CRUD 전후 상태·nextId·재시작 초기화와 각 확인 뒤 테스트 서버 종료를 검사합니다.
