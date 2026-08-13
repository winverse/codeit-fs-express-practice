import { readFileSync } from 'node:fs';
import { registerContracts } from './contracts.js';

const selectedUnit = process.env.PRACTICE_UNIT;
const candidates = {};
const includes = (unit) => !selectedUnit || selectedUnit === unit;

if (includes('01')) {
  candidates.projectSetup = {
    workspace: new URL(
      '../src/practices/01-project-setup/workspace/',
      import.meta.url,
    ),
  };
}

if (includes('02')) {
  const { createApp } =
    await import('../src/practices/02-server-start/src/app.js');
  candidates.serverStart = { createApp };
}

if (includes('03')) {
  const { createApp } = await import('../src/practices/03-routing/src/app.js');
  candidates.routing = { createApp };
}

if (includes('04')) {
  const { createApp } =
    await import('../src/practices/04-router-split/src/app.js');
  const root = new URL(
    '../src/practices/04-router-split/src/',
    import.meta.url,
  );
  candidates.routerSplit = {
    createApp,
    appSource: new URL('app.js', root),
    routeSources: [
      new URL('routes/index.js', root),
      new URL('routes/users.js', root),
      new URL('routes/search.js', root),
    ],
  };
}

if (includes('05')) {
  const { createApp } =
    await import('../src/practices/05-memory-crud/src/app.js');
  candidates.memoryCrud = { createApp };
}

if (includes('06')) {
  const { createApp } =
    await import('../src/practices/06-middleware/src/app.js');
  const root = new URL(
    '../src/practices/06-middleware/src/middlewares/',
    import.meta.url,
  );
  candidates.middleware = {
    createApp,
    loggerSource: new URL('logger.js', root),
    timerSource: new URL('requestTimer.js', root),
  };
}

if (includes('07')) {
  const { createApp } =
    await import('../src/practices/07-error-handling/src/app.js');
  const root = new URL(
    '../src/practices/07-error-handling/src/',
    import.meta.url,
  );
  candidates.errorHandling = {
    createApp,
    appSource: new URL('app.js', root),
    errorSources: [
      new URL('errors/httpException.js', root),
      new URL('errors/badRequestException.js', root),
      new URL('errors/notFoundException.js', root),
      new URL('errors/conflictException.js', root),
    ],
    validateSource: new URL('middlewares/validateUser.js', root),
    errorHandlerSource: new URL('middlewares/errorHandler.js', root),
    routeSource: new URL('routes/users.js', root),
  };
}

if (includes('08')) {
  const { parseConfig } =
    await import('../src/practices/08-env-config/workspace/src/config/config.js');
  const root = new URL('../src/practices/08-env-config/', import.meta.url);
  candidates.envConfig = {
    parseConfig,
    moduleUrl: new URL('workspace/src/config/config.js', root),
    workspace: new URL('workspace/', root),
    prettierConfig: new URL('workspace/.prettierrc', root),
    validFixture: new URL('fixtures/env/valid.env', root),
    invalidFixtures: [
      new URL('fixtures/env/invalid-node-env.env', root),
      new URL('fixtures/env/invalid-port.env', root),
    ],
  };
}

if (includes('09')) {
  const [{ createApp }, database, model, lifecycle] = await Promise.all([
    import('../src/practices/09-mongodb/src/app.js'),
    import('../src/practices/09-mongodb/src/db/index.js'),
    import('../src/practices/09-mongodb/src/models/user.js'),
    import('../src/practices/09-mongodb/src/server.js'),
  ]);
  const fixture = JSON.parse(
    readFileSync(
      new URL(
        '../src/practices/09-mongodb/fixtures/users.json',
        import.meta.url,
      ),
      'utf8',
    ),
  );
  candidates.mongodb = {
    createApp,
    connectDB: database.connectDB,
    disconnectDB: database.disconnectDB,
    User: model.User,
    startServer: lifecycle.startServer,
    fixture,
  };
}

registerContracts(candidates, selectedUnit);
