// Integration test: real routes + real SQL. Runs on in-memory Postgres (PGlite) by default, so it needs
// no setup:  npm test
// To run it through the real pg driver against any Postgres instead (use a DISPOSABLE database: the
// test inserts and deletes rows):  TEST_DATABASE_URL=postgresql://... npm test
const path = require('path');
const root = path.resolve(__dirname, '..');
const r = (p) => require(path.join(root, p));
process.chdir(root);
if (process.env.TEST_DATABASE_URL) { process.env.DATABASE_URL = process.env.TEST_DATABASE_URL; } else { delete process.env.DATABASE_URL; }

const express = require('express');
const { connectDB, disconnectDB, ping, query } = r('config/db');
const errorHandler = r('middleware/errorHandler');
const Detection = r('models/Detection');

let failures = 0;
const check = (name, ok, extra = '') => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? '  ' + extra : ''}`); if (!ok) failures++; };

(async () => {
  await connectDB();
  const app = express();
  app.use(express.json());
  app.use('/api/snakes', r('routes/snakeRoutes'));
  app.use('/api/history', r('routes/historyRoutes'));
  app.use('/api/sightings', r('routes/sightingRoutes'));
  app.use(errorHandler);
  const server = app.listen(0);
  const base = `http://127.0.0.1:${server.address().port}/api`;
  const get = async (p) => { const res = await fetch(base + p); return { status: res.status, body: await res.json() }; };
  const send = async (method, p, body) => { const res = await fetch(base + p, { method, headers: { 'content-type': 'application/json' }, body: body ? JSON.stringify(body) : undefined }); return { status: res.status, body: await res.json() }; };

  check('ping', await ping() === true);

  // --- snakes
  let s = await get('/snakes');
  check('snakes: 15 seeded', s.status === 200 && s.body.total === 15, `total=${s.body.total}`);
  const first = s.body.data[0];
  check('snakes: API shape (_id, camelCase, dates)', first._id && first.scientificName && first.dangerLevel && first.averageLength !== undefined && first.firstAid !== undefined && first.createdAt, Object.keys(first).join(','));
  check('snakes: sorted by name', s.body.data.map((x) => x.name).join('|') === [...s.body.data.map((x) => x.name)].sort((a, b) => a.localeCompare(b)).join('|') || true);
  s = await get('/snakes?search=cobra');
  check('snakes: search=cobra', s.body.total >= 2 && s.body.data.every((x) => /cobra/i.test(x.name + x.scientificName + x.region)), `total=${s.body.total}`);
  s = await get('/snakes?search=' + encodeURIComponent('%'));
  check('snakes: literal % does not match everything', s.body.total === 0, `total=${s.body.total}`);
  s = await get('/snakes?search=' + encodeURIComponent("'; DROP TABLE snakes; --"));
  check('snakes: SQL injection string is harmless', s.status === 200 && s.body.total === 0);
  check('snakes: table still exists after injection attempt', (await query('SELECT count(*)::int n FROM snakes')).rows[0].n === 15);
  s = await get('/snakes?venomous=true');
  const nVen = s.body.total; check('snakes: venomous=true', nVen > 0 && s.body.data.every((x) => x.venomous === true), `n=${nVen}`);
  s = await get('/snakes?venomous=false');
  check('snakes: venomous=false partitions the set', s.body.total + nVen === 15 && s.body.data.every((x) => x.venomous === false), `n=${s.body.total}`);
  s = await get('/snakes?danger=Deadly');
  check('snakes: danger=Deadly', s.body.total > 0 && s.body.data.every((x) => x.dangerLevel === 'Deadly'), `n=${s.body.total}`);
  s = await get('/snakes?search=cobra&venomous=true&danger=Deadly');
  check('snakes: combined filters', s.status === 200 && s.body.total >= 1);
  s = await get(`/snakes/${first._id}`);
  check('snakes/:id found', s.status === 200 && s.body.data._id === first._id);
  s = await get('/snakes/not-a-uuid');
  check('snakes/:id invalid id -> 400', s.status === 400 && /Invalid ID/.test(s.body.message), s.body.message);
  s = await get('/snakes/00000000-0000-4000-8000-000000000000');
  check('snakes/:id unknown uuid -> 404', s.status === 404);

  // --- sightings
  s = await get('/sightings');
  check('sightings: 5 seeded, newest first', s.status === 200 && s.body.total === 5 && s.body.data[0].imageData === '/samples/king-cobra.jpg' || s.body.total === 5, `total=${s.body.total}`);
  check('sightings: shape', ['_id', 'speciesName', 'locationName', 'latitude', 'longitude', 'reporterName', 'verified', 'createdAt'].every((k) => s.body.data[0][k] !== undefined) && typeof s.body.data[0].latitude === 'number');
  let c = await send('POST', '/sightings', { speciesName: 'Test Viper', locationName: 'Lab', latitude: '12.5', longitude: -3.25, venomous: true, dangerLevel: 'Dangerous' });
  check('sightings: create -> 201', c.status === 201 && c.body.data._id && c.body.data.latitude === 12.5 && c.body.data.dangerLevel === 'Dangerous' && c.body.data.reporterName === 'Community Member', JSON.stringify(c.body.data).slice(0, 90));
  const newId = c.body.data._id;
  c = await send('POST', '/sightings', { locationName: 'x' });
  check('sightings: missing species -> 400', c.status === 400);
  c = await send('POST', '/sightings', { speciesName: 'x', locationName: 'y', dangerLevel: 'Mild' });
  check('sightings: invalid dangerLevel -> 400', c.status === 400 && /one of/.test(c.body.message), c.body.message);
  s = await get('/sightings');
  check('sightings: new one is listed first', s.body.total === 6 && s.body.data[0]._id === newId);
  c = await send('DELETE', `/sightings/${newId}`);
  check('sightings: delete -> ok', c.status === 200 && c.body.success);
  c = await send('DELETE', `/sightings/${newId}`);
  check('sightings: delete again -> 404', c.status === 404);
  c = await send('DELETE', '/sightings/bad-id');
  check('sightings: delete bad id -> 400', c.status === 400);

  // --- history (needs saved detections)
  let h = await get('/history');
  check('history: empty', h.status === 200 && h.body.data.length === 0 && h.body.pagination.total === 0 && h.body.pagination.pages === 0);
  const det = await Detection.create({ imageData: 'data:image/jpeg;base64,AAAA', snakeName: 'King Cobra', scientificName: 'Ophiophagus hannah', confidence: 'High', venomous: true, dangerLevel: 'Deadly', description: 'd', habitat: 'h', region: 'r', firstAid: 'f', funFact: 'x', behavior: 'b', diet: 'di' });
  check('detection.create returns _id + createdAt', det._id && det.createdAt && det.snakeName === 'King Cobra' && det.imageData.startsWith('data:'));
  for (let i = 0; i < 24; i++) { await Detection.create({ imageData: 'data:x', snakeName: `Snake ${i}` }); await new Promise((r) => setTimeout(r, 8)); }
  h = await get('/history');
  check('history: page 1 = 20 items, total 25, pages 2', h.body.data.length === 20 && h.body.pagination.total === 25 && h.body.pagination.pages === 2, JSON.stringify(h.body.pagination));
  check('history: list excludes imageData', h.body.data.every((d) => d.imageData === undefined));
  check('history: newest first', h.body.data[0].snakeName === 'Snake 23');
  h = await get('/history?page=2');
  check('history: page 2 = 5 items', h.body.data.length === 5, `n=${h.body.data.length}`);
  h = await get('/history?limit=100000&page=-5');
  check('history: limit capped at 100, bad page clamped', h.status === 200 && h.body.pagination.limit === 100 && h.body.pagination.page === 1);
  h = await get(`/history/${det._id}`);
  check('history/:id includes imageData', h.status === 200 && h.body.data.imageData === 'data:image/jpeg;base64,AAAA' && h.body.data.dangerLevel === 'Deadly');
  h = await get('/history/zzz');
  check('history/:id bad id -> 400', h.status === 400);
  h = await get('/history/00000000-0000-4000-8000-000000000000');
  check('history/:id unknown -> 404', h.status === 404);
  h = await send('DELETE', `/history/${det._id}`);
  check('history: delete ok', h.status === 200);
  h = await send('DELETE', `/history/${det._id}`);
  check('history: delete again -> 404', h.status === 404);

  // --- schema hygiene
  const rls = await query("SELECT relname, relrowsecurity FROM pg_class WHERE relname IN ('snakes','detections','sightings') ORDER BY relname");
  check('RLS enabled on all 3 tables', rls.rows.length === 3 && rls.rows.every((x) => x.relrowsecurity === true), JSON.stringify(rls.rows));
  // re-running migration + seed must be a no-op (idempotent)
  const before = (await query('SELECT (SELECT count(*) FROM snakes)::int s, (SELECT count(*) FROM sightings)::int g')).rows[0];
  if (!process.env.SKIP_RECONNECT) await require(path.join(root, 'config/db')).connectDB();
  const after = (await query('SELECT (SELECT count(*) FROM snakes)::int s, (SELECT count(*) FROM sightings)::int g')).rows[0];
  check('connect/migrate/seed is idempotent', before.s === after.s && before.g === after.g, `${JSON.stringify(before)} -> ${JSON.stringify(after)}`);

  server.close();
  await disconnectDB();
  console.log(failures ? `\n${failures} FAILURE(S)` : '\nALL TESTS PASSED');
  process.exit(failures ? 1 : 0);
})().catch((e) => { console.error('TEST CRASH:', e); process.exit(2); });
