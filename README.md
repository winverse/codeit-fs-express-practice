# JavaScript Backend Express Practice

`자바스크립트 백엔드 개발 시작하기` 과정의 독립 문제 해결 실습입니다. 각 폴더는 다른 실습의 결과에 의존하지 않으며, 제공된 실행 가능한 뼈대에서 학습 목표에 해당하는 부분만 완성합니다.

## 시작하기

```bash
git clone https://github.com/winverse/codeit-fs-express-practice.git
cd codeit-fs-express-practice
npm install
```

Node.js 26과 npm 11을 사용합니다. 원하는 실습의 안내를 읽고 문제 파일을 수정한 다음 해당 확인 명령을 실행하세요.
각 확인 명령은 처음에는 해당 실습의 TODO 때문에 실패하는 것이 정상입니다. 각 실습 README가 지정한 문제 파일만 수정하고, `fixtures/`와 `test/`는 입력·판정 코드로 그대로 사용합니다. `answers/`는 직접 구현하고 확인한 뒤에만 비교합니다.

| 실습                       | 문제 폴더                         | 확인 명령          |
| -------------------------- | --------------------------------- | ------------------ |
| Express 프로젝트 기본 설정 | `src/practices/01-project-setup`  | `npm run check:01` |
| Express 서버 시작하기      | `src/practices/02-server-start`   | `npm run check:02` |
| Express 라우팅             | `src/practices/03-routing`        | `npm run check:03` |
| 라우터 분리                | `src/practices/04-router-split`   | `npm run check:04` |
| 메모리 데이터 CRUD         | `src/practices/05-memory-crud`    | `npm run check:05` |
| Express 미들웨어           | `src/practices/06-middleware`     | `npm run check:06` |
| Express 에러 처리          | `src/practices/07-error-handling` | `npm run check:07` |
| 환경 변수 구성             | `src/practices/08-env-config`     | `npm run check:08` |
| MongoDB 연동               | `src/practices/09-mongodb`        | `npm run check:09` |

확인 명령은 문제 코드만 불러오며 `answers/`를 자동 실행하거나 탐색하지 않습니다. `npm run test:answers`는 모든 답안의 성공·실패 계약을 확인하는 별도 명령입니다.
