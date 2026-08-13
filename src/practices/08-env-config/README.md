# 환경 변수 구성

1. `workspace/src/config/config.js`의 환경 변수 schema와 변환을 완성합니다.
2. `workspace/package.json`에 개발·운영 실행 명령을 추가합니다.
3. `workspace/.gitignore`와 `workspace/env/.env.example`을 완성합니다. 실제 `.env.development`와 `.env.production`은 만들더라도 Git에 포함하지 않습니다.

`NODE_ENV`는 `development` 또는 `production`, `PORT`는 1~65535의 정수여야 합니다. 로컬 환경 파일이 없을 때는 안전한 개발 기본값을 사용하고, 파일이 있으면 `--env-file-if-exists`로 읽으세요. `npm run check:08`이 fixture를 subprocess의 `--env-file`로 읽어 정상 설정과 시작 전 검증 실패를 확인합니다.
