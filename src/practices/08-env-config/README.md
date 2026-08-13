# 환경 변수 구성

1. `workspace/src/config/config.js`의 환경 변수 schema와 변환을 완성합니다.
2. `workspace/package.json`에 `engines.node`를 `>=26 <27`, `engines.npm`을 `>=11`로 먼저 설정합니다. `dev`는 `node --watch --env-file-if-exists=./env/.env.development src/server.js`, `start`는 `node --env-file-if-exists=./env/.env.production src/server.js`로 선언합니다.
3. `cd src/practices/08-env-config/workspace`에서 `npm install zod@4.4.3`을 실행해 package와 lockfile을 함께 갱신합니다.
4. `workspace/.gitignore`와 `workspace/env/.env.example`을 완성합니다. 실제 `.env.development`와 `.env.production`은 만들더라도 Git에 포함하지 않습니다.

`NODE_ENV`는 `development` 또는 `production`, `PORT`는 1~65535의 정수여야 합니다. 로컬 환경 파일이 없을 때는 안전한 개발 기본값을 사용하고, 파일이 있으면 `--env-file-if-exists`로 읽으세요. 파일이 없으면 Node.js가 계속 실행한다는 진단을 stderr에 남기는 것은 정상입니다. 설치를 마치면 `cd ../../../..`로 저장소 루트에 돌아와 `npm run check:08`을 실행합니다. 이 검사는 fixture를 subprocess의 `--env-file`로 읽어 정상 설정과 시작 전 검증 실패를 확인합니다.
