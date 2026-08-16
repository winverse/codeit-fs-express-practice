import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import net from 'node:net';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';

async function withServer(app, assertion) {
  const server = app.listen(0);
  try {
    await assertion(request(server));
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
  assert.equal(server.listening, false);
}

function readJson(url) {
  return JSON.parse(readFileSync(url, 'utf8'));
}

export function registerContracts(candidates, selectedUnit) {
  const register = (unit, name, callback) => {
    if (!selectedUnit || selectedUnit === unit) {
      test(`${unit} ${name}`, callback);
    }
  };

  register('01', 'Express 프로젝트 기본 설정', () => {
    const workspace = candidates.projectSetup.workspace;
    const packageJson = readJson(new URL('package.json', workspace));
    const prettier = readJson(new URL('.prettierrc', workspace));
    const eslintSource = readFileSync(
      new URL('eslint.config.js', workspace),
      'utf8',
    );

    assert.equal(packageJson.type, 'module');
    assert.equal(packageJson.engines?.node, '>=26 <27');
    assert.equal(packageJson.engines?.npm, '>=11');
    assert.equal(packageJson.dependencies.express, '^5.2.1');
    assert.equal(packageJson.devDependencies['@eslint/js'], '^10.0.1');
    assert.equal(packageJson.devDependencies.eslint, '^10.8.1');
    assert.equal(packageJson.devDependencies.prettier, '3.9.6');
    assert.equal(packageJson.scripts.dev, 'node src/server.js');
    assert.equal(packageJson.scripts.lint, 'eslint "src/**/*.js"');
    assert.equal(
      packageJson.scripts.format,
      'prettier --write . --ignore-unknown',
    );
    assert.equal(
      packageJson.scripts['format:check'],
      'prettier --check . --ignore-unknown',
    );
    assert.deepEqual(prettier, {
      printWidth: 80,
      bracketSpacing: true,
      singleQuote: true,
      semi: true,
      trailingComma: 'all',
    });
    assert.match(eslintSource, /@eslint\/js/);
    assert.match(eslintSource, /recommended/);
    assert.match(eslintSource, /ecmaVersion[\s\S]*2024/);
    assert.match(eslintSource, /sourceType[\s\S]*module/);
    assert.match(eslintSource, /console[\s\S]*readonly/);
    assert.match(eslintSource, /process[\s\S]*readonly/);
    assert.match(eslintSource, /no-unused-vars[\s\S]*warn/);
    assert.match(eslintSource, /no-console[\s\S]*off/);
    assert.match(eslintSource, /prefer-const[\s\S]*error/);
    assert.match(eslintSource, /no-var[\s\S]*error/);
    assert.match(eslintSource, /semi[\s\S]*always/);
    assert.match(eslintSource, /quotes[\s\S]*single/);

    const stdout = execFileSync(
      process.execPath,
      [fileURLToPath(new URL('src/server.js', workspace))],
      {
        encoding: 'utf8',
      },
    );
    assert.equal(stdout.trim(), 'hello world');
  });

  register('02', 'Express 서버 시작하기', async () => {
    await withServer(candidates.serverStart.createApp(), async (api) => {
      const root = await api
        .get('/')
        .expect('Content-Type', /json/)
        .expect(200);
      assert.equal(root.body.message, 'Hello Express!');
      assert.equal(
        new Date(root.body.timestamp).toISOString(),
        root.body.timestamp,
      );
      await api
        .get('/missing')
        .expect('Content-Type', /json/)
        .expect(404, { message: 'Route not found' });
    });
  });

  register('03', 'Express 라우팅', async () => {
    await withServer(candidates.routing.createApp(), async (api) => {
      await api.get('/users/123').expect(200, { userId: '123' });
      await api.get('/search?q=express&limit=10').expect(200, {
        query: 'express',
        limit: 10,
      });
      await api.get('/search').expect(200, { query: '', limit: 20 });
      for (const query of [
        'limit=not-a-number',
        'limit=Infinity',
        'limit=0',
        'limit=-1',
        'limit=1&limit=2',
        'q=one&q=two',
      ]) {
        await api.get(`/search?${query}`).expect(400, {
          message: 'Invalid query',
        });
      }
      await api
        .get('/users/1/posts/20')
        .expect(200, { userId: '1', postId: '20' });
      await api
        .post('/users')
        .send({ name: 'Alice', email: 'alice@example.com' })
        .expect(201, {
          user: { name: 'Alice', email: 'alice@example.com' },
        });
      await api.post('/users').expect(400, {
        message: 'Name and email are required',
      });
      await api
        .post('/users')
        .set('Content-Type', 'application/json')
        .send('{"name":')
        .expect('Content-Type', /json/)
        .expect(400, { message: 'Malformed JSON body' });
      await api
        .put('/users/7')
        .send({ name: 'Alicia' })
        .expect(200, {
          userId: '7',
          updates: { name: 'Alicia' },
        });
      await api.put('/users/7').expect(400, {
        message: 'Updates are required',
      });
      await api.delete('/users/7').expect(200, {
        message: 'User deleted',
        userId: '7',
      });
      await api
        .get('/unknown')
        .expect('Content-Type', /json/)
        .expect(404, { message: 'Route not found' });
    });
  });

  register('04', '라우터 분리', async () => {
    await withServer(candidates.routerSplit.createApp(), async (api) => {
      await api.get('/').expect(200, { message: 'Hello Express!' });
      await api.get('/users/42').expect(200, { userId: '42' });
      await api.get('/search?q=router&limit=5').expect(200, {
        query: 'router',
        limit: 5,
      });
      await api.get('/search').expect(200, { query: '', limit: 20 });
      for (const query of [
        'limit=not-a-number',
        'limit=Infinity',
        'limit=0',
        'limit=-1',
        'limit=1&limit=2',
        'q=router&q=duplicate',
      ]) {
        await api.get(`/search?${query}`).expect(400, {
          message: 'Invalid query',
        });
      }
      await api
        .get('/missing')
        .expect('Content-Type', /json/)
        .expect(404, { message: 'Route not found' });
    });

    const appSource = readFileSync(candidates.routerSplit.appSource, 'utf8');
    const routeSources = candidates.routerSplit.routeSources.map((url) =>
      readFileSync(url, 'utf8'),
    );
    assert.doesNotMatch(
      appSource,
      /app\.(?:get|post|put|patch|delete|route|all)\s*\(/,
    );
    assert.match(appSource, /app\.use\s*\(/);
    assert.ok(routeSources.every((source) => /Router/.test(source)));
    assert.ok(routeSources.some((source) => /\.get\s*\(/.test(source)));
  });

  register('05', '메모리 데이터 CRUD', async () => {
    await withServer(candidates.memoryCrud.createApp(), async (api) => {
      const initial = await api.get('/users').expect(200);
      assert.equal(initial.body.users.length, 2);

      const invalid = await api
        .post('/users')
        .send({ name: 'Missing email' })
        .expect('Content-Type', /json/)
        .expect(400, { message: 'Name and email are required' });
      assert.deepEqual(invalid.body, {
        message: 'Name and email are required',
      });
      await api.post('/users').expect(400, {
        message: 'Name and email are required',
      });
      await api
        .post('/users')
        .set('Content-Type', 'application/json')
        .send('{"name":')
        .expect('Content-Type', /json/)
        .expect(400, { message: 'Malformed JSON body' });

      const created = await api
        .post('/users')
        .send({ name: 'Carol', email: 'carol@example.com' })
        .expect(201, {
          user: { id: 3, name: 'Carol', email: 'carol@example.com' },
        });

      await api.get('/users/3').expect(200, { user: created.body.user });
      await api
        .patch('/users/3')
        .send({ name: 'Caroline' })
        .expect(200, {
          user: { id: 3, name: 'Caroline', email: 'carol@example.com' },
        });
      await api.patch('/users/3').expect(400, {
        message: 'Updates are required',
      });
      await api.delete('/users/3').expect(200, {
        message: 'User deleted',
        user: { id: 3, name: 'Caroline', email: 'carol@example.com' },
      });
      await api.get('/users/3').expect(404, { message: 'User not found' });
      await api
        .patch('/users/999')
        .send({ name: 'Missing' })
        .expect(404, { message: 'User not found' });
      await api.delete('/users/999').expect(404, { message: 'User not found' });
      const final = await api.get('/users').expect(200);
      assert.equal(final.body.users.length, 2);
    });

    await withServer(candidates.memoryCrud.createApp(), async (api) => {
      const reset = await api.get('/users').expect(200);
      assert.equal(reset.body.users.length, 2);
      assert.deepEqual(
        reset.body.users.map(({ id }) => id),
        [1, 2],
      );
    });
  });

  register('06', 'Express 미들웨어', async () => {
    const trace = [];
    const logs = [];
    const app = candidates.middleware.createApp({
      allowedOrigins: ['http://localhost:3000'],
      trace: (event) => trace.push(event),
      write: (message) => logs.push(message),
    });

    await withServer(app, async (api) => {
      const success = await api
        .post('/users')
        .set('Origin', 'http://localhost:3000')
        .send({ name: 'Alice', email: 'alice@example.com' })
        .expect('Access-Control-Allow-Origin', 'http://localhost:3000')
        .expect('Vary', /Origin/)
        .expect(201);
      assert.equal(success.body.user.email, 'alice@example.com');
      assert.deepEqual(trace.splice(0), ['cors', 'logger', 'timer', 'route']);

      await api
        .post('/users')
        .send({ name: 'Missing email' })
        .expect(400, { message: 'Name and email are required' });
      assert.deepEqual(trace.splice(0), ['cors', 'logger', 'timer']);

      await api.post('/users').expect(400);
      assert.deepEqual(trace.splice(0), ['cors', 'logger', 'timer']);

      await api
        .post('/users')
        .set('Origin', 'http://localhost:3000')
        .set('Content-Type', 'application/json')
        .send('{"name":')
        .expect('Access-Control-Allow-Origin', 'http://localhost:3000')
        .expect('Vary', /Origin/)
        .expect('Content-Type', /json/)
        .expect(400, { message: 'Malformed JSON body' });
      assert.deepEqual(trace.splice(0), ['cors']);

      await api
        .post('/users')
        .set('Origin', 'https://evil.example')
        .set('Content-Type', 'application/json')
        .send('{"name":')
        .expect('Vary', /Origin/)
        .expect(403, { message: 'Origin is not allowed' });
      assert.deepEqual(trace.splice(0), ['cors']);

      const noOrigin = await api
        .post('/users')
        .send({ name: 'Alice', email: 'alice@example.com' })
        .expect('Vary', /Origin/)
        .expect(201);
      assert.equal(noOrigin.headers['access-control-allow-origin'], undefined);
      assert.deepEqual(trace.splice(0), ['cors', 'logger', 'timer', 'route']);

      await api
        .options('/users')
        .set('Origin', 'http://localhost:3000')
        .expect('Access-Control-Allow-Origin', 'http://localhost:3000')
        .expect('Vary', /Origin/)
        .expect(
          'Access-Control-Allow-Methods',
          'GET,POST,PUT,PATCH,DELETE,OPTIONS',
        )
        .expect('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        .expect(204);
      assert.deepEqual(trace.splice(0), ['cors']);

      await api
        .post('/users')
        .set('Origin', 'https://evil.example')
        .send({ name: 'Alice', email: 'alice@example.com' })
        .expect(403, { message: 'Origin is not allowed' });
      assert.deepEqual(trace.splice(0), ['cors']);
    });
    assert.ok(logs.some((message) => /^POST \/users 201 \d+ms$/.test(message)));
    assert.ok(logs.some((message) => /^completed in \d+ms$/.test(message)));
    const loggerSource = readFileSync(
      candidates.middleware.loggerSource,
      'utf8',
    );
    const timerSource = readFileSync(candidates.middleware.timerSource, 'utf8');
    assert.match(loggerSource, /res\.on\(['"]finish['"]/);
    assert.match(loggerSource, /Date\.now\(\)/);
    assert.match(timerSource, /res\.on\(['"]finish['"]/);
    assert.match(timerSource, /Date\.now\(\)/);
  });

  register('07', 'Express 에러 처리', async () => {
    await withServer(candidates.errorHandling.createApp(), async (api) => {
      await api.get('/users/1').expect(200, {
        user: { id: 1, name: 'Alice', email: 'alice@example.com' },
      });

      await api
        .post('/users')
        .send({ name: 'Bob', email: 'bob@example.com' })
        .expect(201, {
          user: { id: 2, name: 'Bob', email: 'bob@example.com' },
        });

      await api.get('/users/999').expect(404, {
        success: false,
        message: 'User not found',
      });
      await api.post('/users').send({ name: 'Missing email' }).expect(400, {
        success: false,
        message: 'Name and email are required',
      });
      await api.post('/users').expect(400, {
        success: false,
        message: 'Name and email are required',
      });
      const malformed = await api
        .post('/users')
        .set('Content-Type', 'application/json')
        .send('{"name":')
        .expect('Content-Type', /json/)
        .expect(400);
      assert.deepEqual(malformed.body, {
        success: false,
        message: 'Malformed JSON body',
      });
      await api
        .post('/users')
        .send({ name: 'Alice 2', email: 'alice@example.com' })
        .expect(409, { success: false, message: 'Email already exists' });
      const unexpected = await api
        .get('/users/boom')
        .expect('Content-Type', /json/)
        .expect(500);
      assert.deepEqual(unexpected.body, {
        success: false,
        message: 'Internal server error',
      });
      assert.equal('stack' in unexpected.body, false);
    });

    const appSource = readFileSync(candidates.errorHandling.appSource, 'utf8');
    const errorSources = candidates.errorHandling.errorSources.map((url) =>
      readFileSync(url, 'utf8'),
    );
    const validateSource = readFileSync(
      candidates.errorHandling.validateSource,
      'utf8',
    );
    const errorHandlerSource = readFileSync(
      candidates.errorHandling.errorHandlerSource,
      'utf8',
    );
    const routeSource = readFileSync(
      candidates.errorHandling.routeSource,
      'utf8',
    );
    assert.match(appSource, /app\.use\(errorHandler\)/);
    assert.match(errorSources[0], /extends Error/);
    assert.match(errorSources[0], /this\.status\s*=\s*status/);
    assert.match(errorSources[0], /this\.name\s*=\s*this\.constructor\.name/);
    assert.match(errorSources[1], /super\(400,/);
    assert.match(errorSources[1], /Bad request/);
    assert.match(errorSources[2], /super\(404,/);
    assert.match(errorSources[2], /Not found/);
    assert.match(errorSources[3], /super\(409,/);
    assert.match(errorSources[3], /Conflict/);
    assert.match(validateSource, /BadRequestException/);
    assert.match(validateSource, /next\s*\(/);
    assert.match(routeSource, /NotFoundException/);
    assert.match(routeSource, /ConflictException/);
    assert.match(routeSource, /next\s*\(/);
    assert.match(errorHandlerSource, /instanceof HttpException/);
    assert.match(
      errorHandlerSource,
      /function errorHandler\s*\([^,]+,[^,]+,[^,]+,[^)]+\)/,
    );
  });

  register('08', '환경 변수 구성', () => {
    assert.deepEqual(candidates.envConfig.parseConfig({}), {
      nodeEnv: 'development',
      port: 5001,
    });
    assert.deepEqual(
      candidates.envConfig.parseConfig({
        NODE_ENV: 'development',
        PORT: '5001',
      }),
      { nodeEnv: 'development', port: 5001 },
    );
    assert.throws(() =>
      candidates.envConfig.parseConfig({ NODE_ENV: 'preview', PORT: '5001' }),
    );
    assert.throws(() =>
      candidates.envConfig.parseConfig({
        NODE_ENV: 'development',
        PORT: '70000',
      }),
    );

    const packageJson = readJson(
      new URL('package.json', candidates.envConfig.workspace),
    );
    const packageLock = readJson(
      new URL('package-lock.json', candidates.envConfig.workspace),
    );
    const prettier = readJson(candidates.envConfig.prettierConfig);
    const gitignore = readFileSync(
      new URL('.gitignore', candidates.envConfig.workspace),
      'utf8',
    );
    const example = readFileSync(
      new URL('env/.env.example', candidates.envConfig.workspace),
      'utf8',
    );
    assert.equal(
      packageJson.scripts.dev,
      'node --watch --env-file-if-exists=./env/.env.development src/server.js',
    );
    assert.equal(
      packageJson.scripts.start,
      'node --env-file-if-exists=./env/.env.production src/server.js',
    );
    assert.equal(
      packageJson.scripts.format,
      'prettier --write . --ignore-unknown',
    );
    assert.equal(
      packageJson.scripts['format:check'],
      'prettier --check . --ignore-unknown',
    );
    assert.deepEqual(packageJson.engines, {
      node: '>=26 <27',
      npm: '>=11',
    });
    assert.equal(packageJson.dependencies?.zod, '^4.4.3');
    assert.equal(packageJson.devDependencies?.prettier, '3.9.6');
    assert.equal(packageLock.lockfileVersion, 3);
    assert.deepEqual(packageLock.packages[''].engines, {
      node: '>=26 <27',
      npm: '>=11',
    });
    assert.equal(packageLock.packages[''].dependencies.zod, '^4.4.3');
    assert.equal(packageLock.packages[''].devDependencies.prettier, '3.9.6');
    assert.deepEqual(prettier, {
      printWidth: 80,
      bracketSpacing: true,
      trailingComma: 'all',
      semi: true,
      singleQuote: true,
    });
    assert.match(gitignore, /env\/\*/);
    assert.match(gitignore, /!env\/\.env\.example/);
    assert.match(example, /NODE_ENV=development/);
    assert.match(example, /PORT=5001/);

    const inheritedEnv = { ...process.env };
    delete inheritedEnv.NODE_ENV;
    delete inheritedEnv.PORT;
    const workspaceStart = spawnSync(
      process.execPath,
      ['--env-file-if-exists=./env/.env.production', 'src/server.js'],
      {
        cwd: fileURLToPath(candidates.envConfig.workspace),
        encoding: 'utf8',
        env: inheritedEnv,
      },
    );
    assert.equal(workspaceStart.status, 0, workspaceStart.stderr);
    assert.deepEqual(JSON.parse(workspaceStart.stdout), {
      nodeEnv: 'development',
      port: 5001,
    });

    const moduleUrl = candidates.envConfig.moduleUrl.href;
    const evalSource = `import(${JSON.stringify(moduleUrl)}).then(({ parseConfig }) => console.log(JSON.stringify(parseConfig())))`;
    const valid = spawnSync(
      process.execPath,
      [
        `--env-file=${candidates.envConfig.validFixture.pathname}`,
        '--input-type=module',
        '--eval',
        evalSource,
      ],
      { encoding: 'utf8', env: inheritedEnv },
    );
    assert.equal(valid.status, 0, valid.stderr);
    assert.deepEqual(JSON.parse(valid.stdout), {
      nodeEnv: 'development',
      port: 5001,
    });

    for (const fixture of candidates.envConfig.invalidFixtures) {
      const invalid = spawnSync(
        process.execPath,
        [
          `--env-file=${fixture.pathname}`,
          '--input-type=module',
          '--eval',
          evalSource,
        ],
        { encoding: 'utf8', env: inheritedEnv },
      );
      assert.notEqual(invalid.status, 0);
    }
  });

  register('09', 'MongoDB 연동', async () => {
    const routeSource = readFileSync(candidates.mongodb.routeSource, 'utf8');
    assert.match(
      routeSource,
      /returnDocument\s*:\s*['"]after['"]/,
      "PATCH must use returnDocument: 'after'",
    );
    assert.doesNotMatch(
      routeSource,
      /\bnew\s*:\s*true\b/,
      'PATCH must not use deprecated new: true',
    );

    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri('express_practice');
    try {
      await candidates.mongodb.connectDB(uri);
      await candidates.mongodb.User.syncIndexes();
      await candidates.mongodb.User.deleteMany({});
      await candidates.mongodb.User.insertMany(candidates.mongodb.fixture);

      assert.equal(
        candidates.mongodb.User.schema.path('name').options.required,
        true,
      );
      assert.equal(
        candidates.mongodb.User.schema.path('name').options.trim,
        true,
      );
      assert.equal(
        candidates.mongodb.User.schema.path('email').options.required,
        true,
      );
      assert.equal(
        candidates.mongodb.User.schema.path('email').options.trim,
        true,
      );
      assert.equal(
        candidates.mongodb.User.schema.path('email').options.lowercase,
        true,
      );
      assert.equal(
        candidates.mongodb.User.schema.path('email').options.unique,
        true,
      );
      assert.equal(candidates.mongodb.User.schema.options.timestamps, true);
      assert.equal(candidates.mongodb.User.collection.collectionName, 'users');

      await withServer(candidates.mongodb.createApp(), async (api) => {
        const initial = await api.get('/users').expect(200);
        assert.equal(initial.body.users.length, 2);
        assert.deepEqual(
          initial.body.users.map(({ email }) => email),
          ['alice@example.com', 'bob@example.com'],
        );

        await api.post('/users').send({ name: 'Missing email' }).expect(400);
        await api.post('/users').expect(400);
        await api
          .post('/users')
          .set('Content-Type', 'application/json')
          .send('{"name":')
          .expect('Content-Type', /json/)
          .expect(400, { message: 'Malformed JSON body' });
        const created = await api
          .post('/users')
          .send({ name: ' Carol ', email: 'CAROL@EXAMPLE.COM ' })
          .expect(201);
        assert.ok(mongoose.isValidObjectId(created.body.user._id));
        assert.equal(created.body.user.name, 'Carol');
        assert.equal(created.body.user.email, 'carol@example.com');
        assert.equal(
          new Date(created.body.user.createdAt).toISOString(),
          created.body.user.createdAt,
        );
        assert.equal(
          new Date(created.body.user.updatedAt).toISOString(),
          created.body.user.updatedAt,
        );

        await candidates.mongodb.disconnectDB();
        assert.equal(mongoose.connection.readyState, 0);
        await candidates.mongodb.connectDB(uri);
        const persisted = await api
          .get(`/users/${created.body.user._id}`)
          .expect(200);
        assert.equal(persisted.body.user.email, 'carol@example.com');
        const persistedDocument = await candidates.mongodb.User.findById(
          created.body.user._id,
        );
        assert.ok(persistedDocument?._id instanceof mongoose.Types.ObjectId);

        await api
          .post('/users')
          .send({ name: 'Carol 2', email: 'carol@example.com' })
          .expect(409);
        await api
          .get('/users/not-an-id')
          .expect(400, { message: 'Invalid user id' });
        await api
          .patch('/users/not-an-id')
          .send({ name: 'Invalid' })
          .expect(400, { message: 'Invalid user id' });
        await api
          .delete('/users/not-an-id')
          .expect(400, { message: 'Invalid user id' });
        await api.get(`/users/${created.body.user._id}`).expect(200, {
          user: persisted.body.user,
        });
        const updated = await api
          .patch(`/users/${created.body.user._id}`)
          .send({ name: 'Caroline' })
          .expect(200);
        assert.equal(updated.body.user.name, 'Caroline');
        assert.equal(updated.body.user.email, 'carol@example.com');
        await api
          .patch(`/users/${created.body.user._id}`)
          .send({ email: '' })
          .expect(400, { message: 'Name and email are required' });
        await api
          .patch(`/users/${created.body.user._id}`)
          .send({ email: 'alice@example.com' })
          .expect(409, { message: 'Email already exists' });
        await api
          .patch(`/users/${created.body.user._id}`)
          .expect(400, { message: 'Updates are required' });
        await api.delete(`/users/${created.body.user._id}`).expect(200, {
          message: 'User deleted',
          user: updated.body.user,
        });
        await api
          .get(`/users/${created.body.user._id}`)
          .expect(404, { message: 'User not found' });
        const missingId = new mongoose.Types.ObjectId().toString();
        await api
          .get(`/users/${missingId}`)
          .expect(404, { message: 'User not found' });
        await api
          .patch(`/users/${missingId}`)
          .send({ name: 'Missing' })
          .expect(404, { message: 'User not found' });
        await api
          .delete(`/users/${missingId}`)
          .expect(404, { message: 'User not found' });
      });

      const originalFind = candidates.mongodb.User.find;
      candidates.mongodb.User.find = () => {
        throw new Error('database unavailable');
      };
      try {
        await withServer(candidates.mongodb.createApp(), async (api) => {
          await api
            .get('/users')
            .expect('Content-Type', /json/)
            .expect(500, { message: 'Internal server error' });
        });
      } finally {
        candidates.mongodb.User.find = originalFind;
      }

      assert.equal(await candidates.mongodb.User.countDocuments(), 2);
      await candidates.mongodb.disconnectDB();
      assert.equal(mongoose.connection.readyState, 0);

      await candidates.mongodb.connectDB(uri);
      assert.equal(await candidates.mongodb.User.countDocuments(), 2);
      await candidates.mongodb.disconnectDB();

      const events = [];
      const lifecycle = await candidates.mongodb.startServer({
        uri,
        port: 0,
        onEvent: (event) => events.push(event),
      });
      assert.equal(lifecycle.server.listening, true);
      await lifecycle.close();
      assert.equal(lifecycle.server.listening, false);
      assert.equal(mongoose.connection.readyState, 0);
      assert.deepEqual(events, [
        'db:connected',
        'db:indexes-ready',
        'http:listening',
        'http:closed',
        'db:closed',
      ]);

      const occupied = net.createServer();
      await new Promise((resolve, reject) => {
        occupied.once('error', reject);
        occupied.listen(0, resolve);
      });
      const address = occupied.address();
      assert.ok(address && typeof address === 'object');
      const failedEvents = [];
      try {
        await assert.rejects(
          candidates.mongodb.startServer({
            uri,
            port: address.port,
            onEvent: (event) => failedEvents.push(event),
          }),
          (error) => error?.code === 'EADDRINUSE',
        );
      } finally {
        await new Promise((resolve, reject) => {
          occupied.close((error) => (error ? reject(error) : resolve()));
        });
      }
      assert.deepEqual(failedEvents, [
        'db:connected',
        'db:indexes-ready',
        'db:closed',
      ]);
      assert.equal(mongoose.connection.readyState, 0);

      const invalidPortEvents = [];
      await assert.rejects(
        candidates.mongodb.startServer({
          uri,
          port: 70000,
          onEvent: (event) => invalidPortEvents.push(event),
        }),
        RangeError,
      );
      assert.deepEqual(invalidPortEvents, [
        'db:connected',
        'db:indexes-ready',
        'db:closed',
      ]);
      assert.equal(mongoose.connection.readyState, 0);

      const originalInit = candidates.mongodb.User.init;
      const indexFailureEvents = [];
      candidates.mongodb.User.init = async () => {
        throw new Error('index preparation failed');
      };
      try {
        await assert.rejects(
          candidates.mongodb.startServer({
            uri,
            port: 0,
            onEvent: (event) => indexFailureEvents.push(event),
          }),
          /index preparation failed/,
        );
      } finally {
        candidates.mongodb.User.init = originalInit;
      }
      assert.deepEqual(indexFailureEvents, ['db:connected', 'db:closed']);
      assert.equal(mongoose.connection.readyState, 0);

      const connectionFailureEvents = [];
      await assert.rejects(
        candidates.mongodb.startServer({
          uri: 'invalid://localhost',
          port: 0,
          onEvent: (event) => connectionFailureEvents.push(event),
        }),
      );
      assert.deepEqual(connectionFailureEvents, ['db:closed']);
      assert.equal(mongoose.connection.readyState, 0);
    } finally {
      if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
      }
      await mongod.stop();
    }
  });
}
