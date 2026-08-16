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
    await import('../src/practices/02-server-start/src/server.js');
  candidates.serverStart = { createApp };
}

if (includes('03')) {
  const { createApp } =
    await import('../src/practices/03-routing/src/server.js');
  candidates.routing = { createApp };
}

if (includes('04')) {
  const { createApp } =
    await import('../src/practices/04-router-split/src/server.js');
  const root = new URL(
    '../src/practices/04-router-split/src/',
    import.meta.url,
  );
  candidates.routerSplit = {
    createApp,
    serverSource: new URL('server.js', root),
    routeSources: [
      new URL('routes/index.js', root),
      new URL('routes/users.js', root),
      new URL('routes/search.js', root),
    ],
  };
}

if (includes('05')) {
  const { createApp } =
    await import('../src/practices/05-memory-crud/src/server.js');
  candidates.memoryCrud = { createApp };
}

if (includes('06')) {
  const [{ createApp }, { createLogger }, { createRequestTimer }] =
    await Promise.all([
      import('../src/practices/06-middleware/src/server.js'),
      import('../src/practices/06-middleware/src/middlewares/logger.js'),
      import('../src/practices/06-middleware/src/middlewares/requestTimer.js'),
    ]);
  candidates.middleware = { createApp, createLogger, createRequestTimer };
}

if (includes('07')) {
  const [
    { createApp },
    { HttpException },
    { BadRequestException },
    { NotFoundException },
    { ConflictException },
    { errorHandler },
  ] = await Promise.all([
    import('../src/practices/07-error-handling/src/server.js'),
    import('../src/practices/07-error-handling/src/errors/httpException.js'),
    import('../src/practices/07-error-handling/src/errors/badRequestException.js'),
    import('../src/practices/07-error-handling/src/errors/notFoundException.js'),
    import('../src/practices/07-error-handling/src/errors/conflictException.js'),
    import('../src/practices/07-error-handling/src/middlewares/errorHandler.js'),
  ]);
  candidates.errorHandling = {
    createApp,
    HttpException,
    BadRequestException,
    NotFoundException,
    ConflictException,
    errorHandler,
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
      new URL('fixtures/env/invalid-low-port.env', root),
      new URL('fixtures/env/invalid-port.env', root),
    ],
  };
}

if (includes('09')) {
  const [lifecycle, database, model] = await Promise.all([
    import('../src/practices/09-mongodb/src/server.js'),
    import('../src/practices/09-mongodb/src/db/index.js'),
    import('../src/practices/09-mongodb/src/models/user.js'),
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
    createApp: lifecycle.createApp,
    connectDB: database.connectDB,
    disconnectDB: database.disconnectDB,
    User: model.User,
    startServer: lifecycle.startServer,
    fixture,
  };
}

registerContracts(candidates, selectedUnit);
