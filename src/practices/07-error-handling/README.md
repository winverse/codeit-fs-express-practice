# Express 에러 처리

1. `src/errors/`의 HTTP 오류 클래스를 완성합니다.
2. `src/middlewares/`의 입력 검증과 중앙 에러 처리 미들웨어를 완성합니다.
3. `src/routes/users.js`에서 오류를 중앙 처리 흐름으로 전달합니다. 제공된 `src/app.js`에는 에러 처리 미들웨어가 이미 마지막에 연결되어 있으므로 순서를 확인하고 수정하지 않습니다.

`HttpException`은 `Error`를 상속하고 `name`을 실제 하위 클래스 이름으로, `statusCode`를 전달받은 상태 코드로 저장합니다. 생성자는 `(description, statusCode)` 순서로 값을 받습니다. `BadRequestException`, `NotFoundException`, `ConflictException`은 이를 상속해 각각 400·404·409와 기본 message `BAD_REQUEST`·`NOT_FOUND`·`CONFLICT`를 전달합니다. 입력 검증과 route는 이 오류 인스턴스를 `next(error)`로 넘기고, 마지막 4인자 `errorHandler`가 예상 오류와 예상 밖 오류를 구분해 JSON으로 응답합니다.

계약은 다음과 같습니다.

- `GET /users/1` → 200과 fixture 사용자; `GET /users/999` → 404 `{ "success": false, "message": "User not found" }`
- `POST /users`의 `{ "name": "Bob", "email": "bob@example.com" }` → 201 `{ "user": { "id": 2, "name": "Bob", "email": "bob@example.com" } }`
- `POST /users`의 누락·빈 body → 400 `{ "success": false, "message": "Name and email are required" }`; malformed JSON → 400 `{ "success": false, "message": "Malformed JSON body" }`; 중복 email → 409 `{ "success": false, "message": "Email already exists" }`
- `GET /users/boom`의 예상하지 못한 비동기 오류 → 500 `{ "success": false, "message": "Internal server error" }`이며 내부 message와 stack을 노출하지 않습니다.
- 모든 오류는 `Content-Type: application/json`과 `{ "success": false, "message": "..." }` 형식을 사용하고 정상 요청도 유지합니다.

`npm run check:07`이 정상·400·404·409·500 응답, 마지막 4인자 에러 미들웨어와 서버 종료를 확인합니다.
