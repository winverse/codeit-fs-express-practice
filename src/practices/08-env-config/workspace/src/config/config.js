export function parseConfig(env = process.env) {
  return {
    nodeEnv: env.NODE_ENV,
    port: env.PORT,
  };
}
