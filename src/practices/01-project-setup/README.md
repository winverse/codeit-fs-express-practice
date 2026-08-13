# Express 프로젝트 기본 설정

`workspace/`는 설치 전의 독립 프로젝트 뼈대입니다. `workspace/package.json`, `workspace/package-lock.json`, `workspace/eslint.config.js`, `workspace/.prettierrc`, `workspace/src/server.js`를 수정하세요.

1. `cd src/practices/01-project-setup/workspace`에서 `npm install express@5.2.1`, `npm install -D eslint@10.8.1 @eslint/js@10.0.1`, `npm install -D --save-exact prettier@3.9.6`을 실행해 package와 lockfile을 함께 갱신합니다.
2. `package.json`을 ESM·Node.js 26·npm 11 프로젝트로 설정하고 `dev`·`lint`·`format:check` 스크립트를 선언합니다.
3. ESLint와 Prettier 설정을 완성합니다.
4. 저장소 루트로 돌아와 `node src/practices/01-project-setup/workspace/src/server.js`를 실행했을 때 `hello world`를 출력하게 합니다.

`npm run check:01`이 설정 누락 없이 종료 코드 0으로 끝나면 성공입니다. 필수 설정이나 출력이 다르면 실패합니다.
