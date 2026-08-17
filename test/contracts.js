import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { ESLint } from 'eslint';
import request from 'supertest';

const versionRangePattern = /^[~^]?\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;

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

function assertDependency(packageJson, section, name) {
  const version = packageJson[section]?.[name];
  assert.equal(typeof version, 'string', `${name} must be in ${section}`);
  assert.match(
    version,
    versionRangePattern,
    `${name} must have a valid saved version`,
  );
}

function assertHeaderIncludes(response, name, expectedValues) {
  const actual = response.headers[name.toLowerCase()];
  assert.equal(typeof actual, 'string', `${name} header is required`);
  const values = actual.split(',').map((value) => value.trim().toLowerCase());
  for (const expected of expectedValues) {
    assert.ok(values.includes(expected.toLowerCase()), `${name}: ${expected}`);
  }
}

export function registerContracts(candidates, selectedUnit) {
  const register = (unit, name, callback) => {
    if (!selectedUnit || selectedUnit === unit) {
      test(`${unit} ${name}`, callback);
    }
  };

  register('01', 'Express 프로젝트 기본 설정', async () => {
    const workspace = candidates.projectSetup.workspace;
    const packageJson = readJson(new URL('package.json', workspace));
    const prettier = readJson(new URL('.prettierrc', workspace));
    const eslint = new ESLint({ cwd: fileURLToPath(workspace) });
    const eslintConfig = await eslint.calculateConfigForFile(
      fileURLToPath(new URL('src/server.js', workspace)),
    );

    assert.equal(packageJson.type, 'module');
    assert.equal(packageJson.engines?.node, '>=26 <27');
    assert.equal(packageJson.engines?.npm, '>=11');
    assertDependency(packageJson, 'dependencies', 'express');
    assertDependency(packageJson, 'devDependencies', '@eslint/js');
    assertDependency(packageJson, 'devDependencies', 'eslint');
    assertDependency(packageJson, 'devDependencies', 'prettier');
    assert.equal(packageJson.scripts.dev, 'node src/server.js');
    assert.equal(packageJson.scripts.lint, 'eslint "src/**/*.js"');
    assert.equal(packageJson.scripts.format, 'prettier --write .');
    assert.equal(packageJson.scripts['format:check'], 'prettier --check .');
    assert.equal(prettier.printWidth, 80);
    assert.equal(prettier.bracketSpacing, true);
    assert.equal(prettier.singleQuote, true);
    assert.equal(prettier.semi, true);
    assert.equal(prettier.trailingComma, 'all');
    assert.equal(eslintConfig.languageOptions.ecmaVersion, 2024);
    assert.equal(eslintConfig.languageOptions.sourceType, 'module');
    assert.equal(eslintConfig.languageOptions.globals.console, 'readonly');
    assert.equal(eslintConfig.languageOptions.globals.process, 'readonly');
    assert.equal(eslintConfig.rules['no-undef'][0], 2);
    assert.equal(eslintConfig.rules['no-unused-vars'][0], 1);
    assert.equal(eslintConfig.rules['no-console'][0], 0);
    assert.equal(eslintConfig.rules['prefer-const'][0], 2);
    assert.equal(eslintConfig.rules['no-var'][0], 2);
    assert.deepEqual(eslintConfig.rules.semi.slice(0, 2), [2, 'always']);
    assert.deepEqual(eslintConfig.rules.quotes.slice(0, 2), [2, 'single']);

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

    const serverSource = readFileSync(
      candidates.routerSplit.serverSource,
      'utf8',
    );
    const routeSources = candidates.routerSplit.routeSources.map((url) =>
      readFileSync(url, 'utf8'),
    );
    assert.doesNotMatch(
      serverSource,
      /app\.(?:get|post|put|patch|delete|route|all)\s*\(/,
    );
    assert.match(serverSource, /app\.use\s*\(/);
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
      assert.deepEqual(trace.splice(0), ['cors', 'logger', 'route']);

      await api
        .post('/users')
        .send({ name: 'Missing email' })
        .expect(400, { message: 'Name and email are required' });
      assert.deepEqual(trace.splice(0), ['cors', 'logger']);

      await api.post('/users').expect(400);
      assert.deepEqual(trace.splice(0), ['cors', 'logger']);

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
      assert.deepEqual(trace.splice(0), ['cors', 'logger', 'route']);

      const preflight = await api
        .options('/users')
        .set('Origin', 'http://localhost:3000')
        .expect('Access-Control-Allow-Origin', 'http://localhost:3000')
        .expect('Vary', /Origin/)
        .expect(204);
      assertHeaderIncludes(preflight, 'Access-Control-Allow-Methods', [
        'GET',
        'POST',
        'PUT',
        'PATCH',
        'DELETE',
        'OPTIONS',
      ]);
      assertHeaderIncludes(preflight, 'Access-Control-Allow-Headers', [
        'Content-Type',
        'Authorization',
      ]);
      assert.deepEqual(trace.splice(0), ['cors']);

      await api
        .post('/users')
        .set('Origin', 'https://evil.example')
        .send({ name: 'Alice', email: 'alice@example.com' })
        .expect(403, { message: 'Origin is not allowed' });
      assert.deepEqual(trace.splice(0), ['cors']);
    });
    const logPattern =
      /^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] POST \/users$/;
    assert.ok(logs.some((message) => logPattern.test(message)));

    const requestLogs = [];
    const order = [];
    let nextCalls = 0;
    const write = (message) => {
      requestLogs.push(message);
      order.push('write');
    };
    const next = () => {
      nextCalls += 1;
      order.push('next');
    };
    candidates.middleware.createLogger({ write })(
      { method: 'POST', url: '/users' },
      {},
      next,
    );
    assert.equal(nextCalls, 1);
    assert.equal(requestLogs.length, 1);
    assert.match(requestLogs[0], logPattern);
    assert.deepEqual(order, ['write', 'next']);
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

    const httpError = new candidates.errorHandling.HttpException(418, 'Teapot');
    assert.ok(httpError instanceof Error);
    assert.equal(httpError.name, 'HttpException');
    assert.equal(httpError.statusCode, 418);
    assert.equal(httpError.message, 'Teapot');

    for (const [Exception, status, message] of [
      [candidates.errorHandling.BadRequestException, 400, 'BAD_REQUEST'],
      [candidates.errorHandling.NotFoundException, 404, 'NOT_FOUND'],
      [candidates.errorHandling.ConflictException, 409, 'CONFLICT'],
    ]) {
      const error = new Exception();
      assert.ok(error instanceof candidates.errorHandling.HttpException);
      assert.equal(error.name, Exception.name);
      assert.equal(error.statusCode, status);
      assert.equal(error.message, message);
    }
    assert.equal(candidates.errorHandling.errorHandler.length, 4);
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
    assert.deepEqual(
      candidates.envConfig.parseConfig({ NODE_ENV: 'test', PORT: '1000' }),
      { nodeEnv: 'test', port: 1000 },
    );
    assert.throws(() =>
      candidates.envConfig.parseConfig({ NODE_ENV: 'preview', PORT: '5001' }),
    );
    assert.throws(() =>
      candidates.envConfig.parseConfig({
        NODE_ENV: 'development',
        PORT: '999',
      }),
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
      'node --watch --env-file=./env/.env.development src/server.js',
    );
    assert.equal(
      packageJson.scripts.start,
      'node --env-file=./env/.env.production src/server.js',
    );
    assert.equal(packageJson.scripts.format, 'prettier --write .');
    assert.equal(packageJson.scripts['format:check'], 'prettier --check .');
    assert.equal(packageJson.engines?.node, '>=26 <27');
    assert.equal(packageJson.engines?.npm, '>=11');
    assertDependency(packageJson, 'dependencies', 'zod');
    assertDependency(packageJson, 'devDependencies', 'prettier');
    assert.equal(prettier.printWidth, 80);
    assert.equal(prettier.bracketSpacing, true);
    assert.equal(prettier.trailingComma, 'all');
    assert.equal(prettier.semi, true);
    assert.equal(prettier.singleQuote, true);
    assert.match(gitignore, /env\/\*/);
    assert.match(gitignore, /!env\/\.env\.example/);
    assert.match(example, /NODE_ENV=development/);
    assert.match(example, /PORT=5001/);

    const inheritedEnv = { ...process.env };
    delete inheritedEnv.NODE_ENV;
    delete inheritedEnv.PORT;
    const workspaceStart = spawnSync(
      process.execPath,
      [
        `--env-file=${candidates.envConfig.validFixture.pathname}`,
        'src/server.js',
      ],
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

        await mongoose.disconnect();
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
      await mongoose.disconnect();
      assert.equal(mongoose.connection.readyState, 0);

      await candidates.mongodb.connectDB(uri);
      assert.equal(await candidates.mongodb.User.countDocuments(), 2);
      await candidates.mongodb.User.init();
      assert.equal(mongoose.connection.readyState, 1);
    } finally {
      if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
      }
      await mongod.stop();
    }
  });
}
