# Express 프로젝트 기본 설정

`workspace/`는 설치 전의 독립 프로젝트 뼈대입니다. `workspace/package.json`, `workspace/eslint.config.js`, `workspace/.prettierrc`, `workspace/src/server.js`를 수정하세요. `package.json`의 `"type": "module"`은 이미 제공되므로 유지합니다.

1. `workspace/package.json`에 `engines.node`를 `>=26 <27`, `engines.npm`을 `>=11`로 먼저 설정합니다. `dev`는 `node src/server.js`, `lint`는 `eslint "src/**/*.js"`, `format`은 `prettier --write .`, `format:check`는 `prettier --check .`로 선언합니다.
2. `cd src/practices/01-project-setup/workspace`에서 `npm install express`, `npm install -D eslint @eslint/js`, `npm install -D prettier`를 차례로 실행해 패키지를 설치합니다.
3. `eslint.config.js`는 `@eslint/js`의 `recommended` 설정을 적용합니다. `languageOptions`에는 `ecmaVersion: 2024`, `sourceType: 'module'`, 읽기 전용 `console`·`process` 전역을 두고, `rules`에는 `no-unused-vars: 'warn'`, `no-console: 'off'`, `prefer-const: 'error'`, `no-var: 'error'`, `semi: ['error', 'always']`, `quotes: ['error', 'single']`을 설정합니다. `.prettierrc`는 `{ "printWidth": 80, "bracketSpacing": true, "trailingComma": "all", "semi": true, "singleQuote": true }`로 완성합니다.
4. `cd ../../../..`로 저장소 루트에 돌아와 `node src/practices/01-project-setup/workspace/src/server.js`를 실행했을 때 `hello world`를 출력하게 합니다.

`npm run check:01`이 설정 누락 없이 종료 코드 0으로 끝나면 성공입니다. 필수 설정이나 출력이 다르면 실패합니다.
