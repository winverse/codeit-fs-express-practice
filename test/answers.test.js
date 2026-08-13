import { readFileSync } from 'node:fs';
import { registerContracts } from './contracts.js';
import { createApp as createServerStartApp } from '../src/practices/02-server-start/answers/src/app.js';
import { createApp as createRoutingApp } from '../src/practices/03-routing/answers/src/app.js';
import { createApp as createRouterSplitApp } from '../src/practices/04-router-split/answers/src/app.js';
import { createApp as createMemoryCrudApp } from '../src/practices/05-memory-crud/answers/src/app.js';
import { createApp as createMiddlewareApp } from '../src/practices/06-middleware/answers/src/app.js';
import { createApp as createErrorHandlingApp } from '../src/practices/07-error-handling/answers/src/app.js';
import { parseConfig } from '../src/practices/08-env-config/answers/workspace/src/config/config.js';
import { createApp as createMongoApp } from '../src/practices/09-mongodb/answers/src/app.js';
import {
  connectDB,
  disconnectDB,
} from '../src/practices/09-mongodb/answers/src/db/index.js';
import { User } from '../src/practices/09-mongodb/answers/src/models/user.js';
import { startServer } from '../src/practices/09-mongodb/answers/src/server.js';

const routerSplitRoot = new URL(
  '../src/practices/04-router-split/answers/src/',
  import.meta.url,
);
const envRoot = new URL('../src/practices/08-env-config/', import.meta.url);
const mongoFixture = JSON.parse(
  readFileSync(
    new URL('../src/practices/09-mongodb/fixtures/users.json', import.meta.url),
    'utf8',
  ),
);

registerContracts({
  projectSetup: {
    workspace: new URL(
      '../src/practices/01-project-setup/answers/workspace/',
      import.meta.url,
    ),
  },
  serverStart: { createApp: createServerStartApp },
  routing: { createApp: createRoutingApp },
  routerSplit: {
    createApp: createRouterSplitApp,
    appSource: new URL('app.js', routerSplitRoot),
    routeSources: [
      new URL('routes/index.js', routerSplitRoot),
      new URL('routes/users.js', routerSplitRoot),
      new URL('routes/search.js', routerSplitRoot),
    ],
  },
  memoryCrud: { createApp: createMemoryCrudApp },
  middleware: {
    createApp: createMiddlewareApp,
    loggerSource: new URL(
      '../src/practices/06-middleware/answers/src/middlewares/logger.js',
      import.meta.url,
    ),
    timerSource: new URL(
      '../src/practices/06-middleware/answers/src/middlewares/requestTimer.js',
      import.meta.url,
    ),
  },
  errorHandling: {
    createApp: createErrorHandlingApp,
    appSource: new URL(
      '../src/practices/07-error-handling/answers/src/app.js',
      import.meta.url,
    ),
    errorSources: [
      new URL(
        '../src/practices/07-error-handling/answers/src/errors/httpException.js',
        import.meta.url,
      ),
      new URL(
        '../src/practices/07-error-handling/answers/src/errors/badRequestException.js',
        import.meta.url,
      ),
      new URL(
        '../src/practices/07-error-handling/answers/src/errors/notFoundException.js',
        import.meta.url,
      ),
      new URL(
        '../src/practices/07-error-handling/answers/src/errors/conflictException.js',
        import.meta.url,
      ),
    ],
    validateSource: new URL(
      '../src/practices/07-error-handling/answers/src/middlewares/validateUser.js',
      import.meta.url,
    ),
    errorHandlerSource: new URL(
      '../src/practices/07-error-handling/answers/src/middlewares/errorHandler.js',
      import.meta.url,
    ),
    routeSource: new URL(
      '../src/practices/07-error-handling/answers/src/routes/users.js',
      import.meta.url,
    ),
  },
  envConfig: {
    parseConfig,
    moduleUrl: new URL(
      '../src/practices/08-env-config/answers/workspace/src/config/config.js',
      import.meta.url,
    ),
    workspace: new URL('answers/workspace/', envRoot),
    validFixture: new URL('fixtures/env/valid.env', envRoot),
    invalidFixtures: [
      new URL('fixtures/env/invalid-node-env.env', envRoot),
      new URL('fixtures/env/invalid-port.env', envRoot),
    ],
  },
  mongodb: {
    createApp: createMongoApp,
    connectDB,
    disconnectDB,
    User,
    startServer,
    fixture: mongoFixture,
  },
});
