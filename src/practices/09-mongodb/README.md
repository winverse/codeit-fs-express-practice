# MongoDB 연동

1. 제공된 `src/db`는 격리 DB 연결·종료 함수를 포함합니다. 이 파일은 연결 생명주기를 확인할 때 참고하고 수정하지 않습니다. `src/models/user.js`의 schema와 고유 index를 완성합니다.
2. `src/routes/users.js`와 `src/app.js`의 CRUD·JSON 오류 응답을 완성합니다.
3. `src/server.js`에서 index 준비 뒤 HTTP 서버를 열고 모든 시작 실패와 종료에서 HTTP 서버와 DB 연결을 정리합니다. 테스트가 매 실행마다 만든 격리 MongoDB에 연결하므로 개인 Atlas 주소나 비밀값을 입력하지 않습니다.

계약은 다음과 같습니다.

- 테스트가 매번 만드는 `express_practice` DB를 fixture 사용자 2명으로 reset하고 고유 index를 준비합니다. 개인 Atlas나 기존 로컬 DB에 의존하지 않습니다.
- `GET /users` → 200 `{ "users": [...] }`; `POST /users`의 `{ "name": "Carol", "email": "carol@example.com" }` → 201과 ObjectId가 있는 `{ "user": ... }`
- 빈·누락·malformed JSON, 빈 PATCH body, 잘못된 ObjectId → 400 JSON; 없는 문서 → 404; 중복 email과 고유 index 오류 → 409
- 생성 문서는 재연결 후에도 유지되고 수정·삭제 전후 문서 수와 값이 맞아야 합니다. 예상 밖 DB 오류는 내부 message·stack을 숨긴 500 JSON입니다.
- `startServer()`는 DB 연결→index 준비→HTTP listen 순서로 시작합니다. 정상 종료는 HTTP→DB 순서이며, 점유 포트·범위 밖 포트·index 준비 실패를 포함한 모든 시작 실패에서 DB 연결과 열린 server handle이 남지 않습니다.

`npm run check:09`가 schema validation·고유 index·fixture/reset·CRUD 전후 데이터·오류 응답·재연결·시작 실패·정상 종료를 확인합니다.
