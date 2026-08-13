# Express 프로젝트 기본 설정

`workspace/`는 설치 전의 독립 프로젝트 뼈대입니다. `workspace/package.json`, `workspace/eslint.config.js`, `workspace/.prettierrc`, `workspace/src/server.js`를 수정하세요.

1. `package.json`을 ESM 프로젝트로 설정하고 Node.js 26, Express 5.2.1, ESLint 10.8.1, Prettier 3.9.6 및 `dev`·`lint`·`format:check` 스크립트를 선언합니다.
2. ESLint와 Prettier 설정을 완성합니다.
3. `node workspace/src/server.js`가 `hello world`를 출력하게 합니다.

`npm run check:01`이 설정 누락 없이 종료 코드 0으로 끝나면 성공입니다. 필수 설정이나 출력이 다르면 실패합니다.
