# 환경 변수 구성

1. `workspace/src/config/config.js`의 환경 변수 schema와 변환을 완성합니다.
2. `workspace/package.json`에 `engines.node`를 `>=26 <27`, `engines.npm`을 `>=11`로 먼저 설정합니다. `dev`는 `node --watch --env-file=./env/.env.development src/server.js`, `start`는 `node --env-file=./env/.env.production src/server.js`로 선언합니다. 제공된 `format`·`format:check` script, Prettier devDependency와 `.prettierrc`는 유지합니다.
3. `cd src/practices/08-env-config/workspace`에서 `npm install zod`를 실행해 패키지를 설치합니다.
4. `workspace/.gitignore`에는 `env/*`로 환경 파일을 제외하고 `!env/.env.example`로 예시 파일만 다시 포함합니다. `workspace/env/.env.example`은 `NODE_ENV=development`와 `PORT=5001`을 담도록 완성합니다. `dev`나 `start`를 직접 실행할 때는 예시 파일을 바탕으로 실제 `.env.development`와 `.env.production`을 만들되 Git에는 포함하지 않습니다.

`NODE_ENV`는 `development`, `production`, `test` 중 하나이고 `PORT`는 1000~65535의 정수여야 합니다. 두 환경 변수가 없으면 각각 `development`와 `5001`을 기본값으로 사용합니다. `--env-file`로 지정한 파일이 없으면 Node.js 실행은 실패합니다. 설치를 마치면 `cd ../../../..`로 저장소 루트에 돌아와 `npm run check:08`을 실행합니다. 이 검사는 공개 fixture를 subprocess의 `--env-file`로 읽어 정상 설정과 시작 전 검증 실패를 확인합니다.
