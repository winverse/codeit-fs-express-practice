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
    const packageLock = readJson(new URL('package-lock.json', workspace));
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
    assert.equal(packageLock.lockfileVersion, 3);
    assert.equal(packageLock.packages[''].dependencies.express, '^5.2.1');
    assert.equal(packageLock.packages[''].devDependencies.eslint, '^10.8.1');
    assert.equal(packageLock.packages[''].devDependencies.prettier, '3.9.6');
    assert.match(packageJson.scripts.dev, /node --watch src\/server\.js/);
    assert.match(packageJson.scripts.lint, /eslint/);
    assert.match(packageJson.scripts['format:check'], /prettier --check/);
    assert.deepEqual(prettier, {
      printWidth: 80,
      bracketSpacing: true,
      singleQuote: true,
      semi: true,
      trailingComma: 'all',
    });
    assert.match(eslintSource, /@eslint\/js/);
    assert.match(eslintSource, /recommended/);

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
      await api.get('/missing').expect(404);
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
      await api.get('/search?limit=not-a-number').expect(400);
      await api.get('/search?limit=1&limit=2').expect(400);
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
      await api.get('/unknown').expect(404);
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
      await api.get('/search?q=router&q=duplicate').expect(400);
      await api.get('/missing').expect(404);
    });

    const appSource = readFileSync(candidates.routerSplit.appSource, 'utf8');
    const routeSources = candidates.routerSplit.routeSources.map((url) =>
      readFileSync(url, 'utf8'),
    );
    assert.doesNotMatch(appSource, /app\.get\s*\(/);
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
        .expect(400);
      assert.match(invalid.body.message, /required/i);
      await api.post('/users').expect(400);
      await api
        .post('/users')
        .set('Content-Type', 'application/json')
        .send('{"name":')
        .expect('Content-Type', /json/)
        .expect(400, { message: 'Malformed JSON body' });

      const created = await api
        .post('/users')
        .send({ name: 'Carol', email: 'carol@example.com' })
        .expect(201);
      assert.equal(created.body.user.id, 3);

      await api.get('/users/3').expect(200, { user: created.body.user });
      const updated = await api
        .patch('/users/3')
        .send({ name: 'Caroline' })
        .expect(200);
      assert.equal(updated.body.user.name, 'Caroline');
      await api.patch('/users/3').expect(400, {
        message: 'Updates are required',
      });
      await api.delete('/users/3').expect(200);
      await api.get('/users/3').expect(404);
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

      await api.post('/users').send({ name: 'Missing email' }).expect(400);
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
        .expect(403);
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
        .expect(204);
      assert.deepEqual(trace.splice(0), ['cors']);

      await api
        .post('/users')
        .set('Origin', 'https://evil.example')
        .send({ name: 'Alice', email: 'alice@example.com' })
        .expect(403);
      assert.deepEqual(trace.splice(0), ['cors']);
    });
    assert.ok(logs.some((message) => /POST \/users 201/.test(message)));
    assert.ok(logs.some((message) => /completed in/.test(message)));
  });

  register('07', 'Express 에러 처리', async () => {
    await withServer(candidates.errorHandling.createApp(), async (api) => {
      const found = await api.get('/users/1').expect(200);
      assert.equal(found.body.user.email, 'alice@example.com');

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
      const unexpected = await api.get('/users/boom').expect(500);
      assert.deepEqual(unexpected.body, {
        success: false,
        message: 'Internal server error',
      });
      assert.equal('stack' in unexpected.body, false);
    });
  });

  register('08', '환경 변수 구성', () => {
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
    assert.equal(packageJson.dependencies?.zod, '^4.4.3');
    assert.equal(packageLock.lockfileVersion, 3);
    assert.equal(packageLock.packages[''].dependencies.zod, '^4.4.3');
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
    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri('express_practice');
    try {
      await candidates.mongodb.connectDB(uri);
      await candidates.mongodb.User.syncIndexes();
      await candidates.mongodb.User.deleteMany({});
      await candidates.mongodb.User.insertMany(candidates.mongodb.fixture);

      await withServer(candidates.mongodb.createApp(), async (api) => {
        const initial = await api.get('/users').expect(200);
        assert.equal(initial.body.users.length, 2);

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
          .send({ name: 'Carol', email: 'carol@example.com' })
          .expect(201);
        assert.ok(mongoose.isValidObjectId(created.body.user._id));
        await api
          .post('/users')
          .send({ name: 'Carol 2', email: 'carol@example.com' })
          .expect(409);
        await api.get('/users/not-an-id').expect(400);
        await api.get(`/users/${created.body.user._id}`).expect(200);
        const updated = await api
          .patch(`/users/${created.body.user._id}`)
          .send({ name: 'Caroline' })
          .expect(200);
        assert.equal(updated.body.user.name, 'Caroline');
        await api
          .patch(`/users/${created.body.user._id}`)
          .expect(400, { message: 'Updates are required' });
        await api.delete(`/users/${created.body.user._id}`).expect(200);
        await api.get(`/users/${created.body.user._id}`).expect(404);
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
    } finally {
      if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
      }
      await mongod.stop();
    }
  });
}
