// TODO: Zod schema로 NODE_ENV와 PORT의 기본값·범위를 검증하고 변환하세요.
export function parseConfig(env = process.env) {
  return {
    nodeEnv: env.NODE_ENV,
    port: env.PORT,
  };
}
