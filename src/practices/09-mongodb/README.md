# MongoDB 연동

1. `src/db`와 `src/models/user.js`의 연결·schema·고유 index를 완성합니다.
2. `src/routes/users.js`와 `src/app.js`의 CRUD·오류 응답을 완성합니다.
3. `src/server.js`에서 index 준비 뒤 HTTP 서버를 열고 모든 시작 실패와 종료에서 HTTP 서버와 DB 연결을 정리합니다. 테스트가 매 실행마다 만든 격리 MongoDB에 연결하므로 개인 Atlas 주소나 비밀값을 입력하지 않습니다.

사용자 CRUD는 DB에 유지되어야 하며 빈 수정·잘못된 입력·잘못된 ObjectId는 400, 없는 사용자는 404, 중복 이메일은 409, 예상 밖 DB 오류는 내부 정보를 숨긴 500 JSON이어야 합니다. `npm run check:09`가 fixture reset, Mongoose validation·unique index, CRUD 전후 데이터와 시작 실패·HTTP→DB 순서의 정상 종료를 확인합니다.
