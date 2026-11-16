// Integration test: real routes + real SQL. Runs on in-memory Postgres (PGlite) by default, so it needs
// no setup:  npm test
// To run it through the real pg driver against any Postgres instead (use a DISPOSABLE database: the
// test inserts and deletes rows):  TEST_DATABASE_URL=postgresql://... npm test
const path = require('path');
const crypto = require('crypto');
const root = path.resolve(__dirname, '..');
const r = (p) => require(path.join(root, p));
process.chdir(root);
if (process.env.TEST_DATABASE_URL) { process.env.DATABASE_URL = process.env.TEST_DATABASE_URL; } else { delete process.env.DATABASE_URL; }

const express = require('express');
const { connectDB, disconnectDB, ping, query } = r('config/db');
const errorHandler = r('middleware/errorHandler');
const { attach } = r('middleware/clientId');
const Detection = r('models/Detection');

let failures = 0;
const check = (name, ok, extra = '') => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? '  ' + extra : ''}`); if (!ok) failures++; };
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

(async () => {
  await connectDB();
  const app = express();
  app.use(express.json({ limit: '1mb' }));
  app.use(attach);
  app.use('/api/snakes', r('routes/snakeRoutes'));
  app.use('/api/history', r('routes/historyRoutes'));
  app.use('/api/sightings', r('routes/sightingRoutes'));
  app.use(errorHandler);
  const server = app.listen(0);
  const base = `http://127.0.0.1:${server.address().port}/api`;

  const A = crypto.randomUUID(); // two different visitors
  const B = crypto.randomUUID();
  const call = async (method, p, { cid, body } = {}) => {
    const headers = { 'content-type': 'application/json' };
    if (cid) headers['x-client-id'] = cid;
    const res = await fetch(base + p, { method, headers, body: body ? JSON.stringify(body) : undefined });
    return { status: res.status, body: await res.json() };
  };
  const get = (p, cid) => call('GET', p, { cid });

  check('ping', await ping() === true);

  // --- snakes (public)
  let s = await get('/snakes');
  check('snakes: 15 seeded', s.status === 200 && s.body.total === 15, `total=${s.body.total}`);
  const first = s.body.data[0];
  check('snakes: API shape (_id, camelCase, dates)', first._id && first.scientificName && first.dangerLevel && first.averageLength !== undefined && first.firstAid !== undefined && first.createdAt);
  s = await get('/snakes?search=cobra');
  check('snakes: search=cobra', s.body.total >= 2 && s.body.data.every((x) => /cobra/i.test(x.name + x.scientificName + x.region)), `total=${s.body.total}`);
  s = await get('/snakes?search=' + encodeURIComponent('%'));
  check('snakes: literal % does not match everything', s.body.total === 0);
  s = await get('/snakes?search=' + encodeURIComponent("'; DROP TABLE snakes; --"));
  check('snakes: SQL injection string is harmless', s.status === 200 && s.body.total === 0);
  check('snakes: table still exists after injection attempt', (await query('SELECT count(*)::int n FROM snakes')).rows[0].n === 15);
  s = await get('/snakes?venomous=true');
  const nVen = s.body.total; check('snakes: venomous=true', nVen > 0 && s.body.data.every((x) => x.venomous === true));
  s = await get('/snakes?venomous=false');
  check('snakes: venomous=false partitions the set', s.body.total + nVen === 15);
  s = await get('/snakes?danger=Deadly');
  check('snakes: danger=Deadly', s.body.total > 0 && s.body.data.every((x) => x.dangerLevel === 'Deadly'));
  s = await get(`/snakes/${first._id}`);
  check('snakes/:id found', s.status === 200 && s.body.data._id === first._id);
  s = await get('/snakes/not-a-uuid');
  check('snakes/:id invalid id -> 400', s.status === 400 && /Invalid ID/.test(s.body.message));
  s = await get('/snakes/00000000-0000-4000-8000-000000000000');
  check('snakes/:id unknown uuid -> 404', s.status === 404);

  // --- sightings: public feed, ownership, validation
  s = await get('/sightings');
  check('sightings: 5 seeded', s.status === 200 && s.body.total === 5, `total=${s.body.total}`);
  const seeded = s.body.data[0];
  check('sightings: shape + numeric coordinates', ['_id', 'speciesName', 'locationName', 'latitude', 'longitude', 'reporterName', 'verified', 'createdAt', 'mine'].every((k) => seeded[k] !== undefined) && typeof seeded.latitude === 'number');
  check('sightings: owner identity is never exposed', s.body.data.every((x) => x.clientId === undefined && x.client_id === undefined));
  check('sightings: seeded ones are not "mine"', s.body.data.every((x) => x.mine === false));

  let c = await call('POST', '/sightings', { cid: A, body: { speciesName: 'Test Viper', locationName: 'Lab', latitude: '12.5', longitude: -3.25, venomous: true, dangerLevel: 'Dangerous' } });
  check('sightings: create -> 201 and mine', c.status === 201 && c.body.data._id && c.body.data.latitude === 12.5 && c.body.data.mine === true && c.body.data.clientId === undefined);
  const mineId = c.body.data._id;
  s = await get('/sightings', A);
  check('sightings: owner sees it as mine', s.body.data.find((x) => x._id === mineId)?.mine === true);
  s = await get('/sightings', B);
  check('sightings: another visitor sees it, but not as mine', s.body.data.find((x) => x._id === mineId)?.mine === false);
  s = await get('/sightings');
  check('sightings: anonymous reader can list', s.status === 200 && s.body.total === 6);

  c = await call('DELETE', `/sightings/${mineId}`, { cid: B });
  check('sightings: another visitor cannot delete it (404)', c.status === 404);
  c = await call('DELETE', `/sightings/${mineId}`);
  check('sightings: delete without client id -> 400', c.status === 400);
  c = await call('DELETE', `/sightings/${seeded._id}`, { cid: A });
  check('sightings: nobody can delete seeded sightings', c.status === 404);
  check('sightings: ...and it is still there', (await get('/sightings')).body.total === 6);
  c = await call('DELETE', `/sightings/${mineId}`, { cid: A });
  check('sightings: owner can delete', c.status === 200 && c.body.success);
  c = await call('DELETE', `/sightings/${mineId}`, { cid: A });
  check('sightings: delete again -> 404', c.status === 404);
  c = await call('DELETE', '/sightings/bad-id', { cid: A });
  check('sightings: delete bad id -> 400', c.status === 400);

  const ok = { speciesName: 'x', locationName: 'y' };
  c = await call('POST', '/sightings', { body: ok });
  check('sightings: create without client id -> 400', c.status === 400);
  c = await call('POST', '/sightings', { cid: 'not-a-uuid', body: ok });
  check('sightings: create with malformed client id -> 400', c.status === 400);
  c = await call('POST', '/sightings', { cid: A, body: { locationName: 'y' } });
  check('sightings: missing species -> 400', c.status === 400);
  c = await call('POST', '/sightings', { cid: A, body: { ...ok, dangerLevel: 'Mild' } });
  check('sightings: invalid dangerLevel -> 400', c.status === 400 && /one of/.test(c.body.message));
  c = await call('POST', '/sightings', { cid: A, body: { ...ok, notes: 'n'.repeat(1001) } });
  check('sightings: notes over 1000 chars -> 400', c.status === 400 && /notes/.test(c.body.message));
  c = await call('POST', '/sightings', { cid: A, body: { ...ok, speciesName: 's'.repeat(121) } });
  check('sightings: species over 120 chars -> 400', c.status === 400);
  c = await call('POST', '/sightings', { cid: A, body: { ...ok, latitude: 91, longitude: 0 } });
  check('sightings: latitude out of range -> 400', c.status === 400 && /Latitude/.test(c.body.message));
  c = await call('POST', '/sightings', { cid: A, body: { ...ok, latitude: 10, longitude: 181 } });
  check('sightings: longitude out of range -> 400', c.status === 400);
  c = await call('POST', '/sightings', { cid: A, body: { ...ok, imageData: 'https://evil.example/x.jpg' } });
  check('sightings: image URL (not a data URI) -> 400', c.status === 400);
  c = await call('POST', '/sightings', { cid: A, body: { ...ok, imageData: 'data:text/html;base64,PHNjcmlwdD4=' } });
  check('sightings: non-image data URI -> 400', c.status === 400);
  c = await call('POST', '/sightings', { cid: A, body: { ...ok, imageData: 'data:image/jpeg;base64,/9j/4AAQSkZJRg==' } });
  check('sightings: valid tiny JPEG data URI accepted', c.status === 201);
  await call('DELETE', `/sightings/${c.body.data._id}`, { cid: A });
  c = await call('POST', '/sightings', { cid: A, body: { ...ok, imageData: 'data:image/jpeg;base64,' + 'A'.repeat(900001) } });
  check('sightings: oversized image -> 400', c.status === 400);
  s = await get('/sightings');
  check('sightings: back to the 5 seeded after cleanup', s.body.total === 5, `total=${s.body.total}`);

  // --- history: private per visitor
  let h = await get('/history');
  check('history: no client id -> 400', h.status === 400);
  h = await get('/history', 'garbage');
  check('history: malformed client id -> 400', h.status === 400);
  h = await get('/history', A);
  check('history: empty at start', h.status === 200 && h.body.data.length === 0 && h.body.pagination.total === 0 && h.body.pagination.pages === 0);

  const det = await Detection.create({ clientId: A, imageData: 'data:image/jpeg;base64,AAAA', snakeName: 'King Cobra', scientificName: 'Ophiophagus hannah', confidence: 'High', venomous: true, dangerLevel: 'Deadly', description: 'd', habitat: 'h', region: 'r', firstAid: 'f', funFact: 'x', behavior: 'b', diet: 'di' });
  check('detection.create returns _id + createdAt, no owner', det._id && det.createdAt && det.snakeName === 'King Cobra' && det.clientId === undefined);
  for (let i = 0; i < 24; i++) { await Detection.create({ clientId: A, imageData: 'data:x', snakeName: `Snake ${i}` }); await sleep(8); }
  h = await get('/history', A);
  check('history: page 1 = 20 items, total 25, pages 2', h.body.data.length === 20 && h.body.pagination.total === 25 && h.body.pagination.pages === 2, JSON.stringify(h.body.pagination));
  check('history: list excludes imageData and owner', h.body.data.every((d) => d.imageData === undefined && d.clientId === undefined));
  check('history: newest first', h.body.data[0].snakeName === 'Snake 23');
  h = await get('/history?page=2', A);
  check('history: page 2 = 5 items', h.body.data.length === 5);
  h = await get('/history?limit=100000&page=-5', A);
  check('history: limit capped at 100, bad page clamped', h.status === 200 && h.body.pagination.limit === 100 && h.body.pagination.page === 1);

  h = await get('/history', B);
  check('privacy: another visitor sees an empty history', h.status === 200 && h.body.pagination.total === 0 && h.body.data.length === 0);
  h = await get(`/history/${det._id}`, B);
  check('privacy: another visitor cannot open my scan (404)', h.status === 404);
  h = await call('DELETE', `/history/${det._id}`, { cid: B });
  check('privacy: another visitor cannot delete my scan (404)', h.status === 404);
  h = await get(`/history/${det._id}`, A);
  check('history/:id: owner gets full image data', h.status === 200 && h.body.data.imageData === 'data:image/jpeg;base64,AAAA' && h.body.data.dangerLevel === 'Deadly' && h.body.data.clientId === undefined);
  h = await get('/history/zzz', A);
  check('history/:id bad id -> 400', h.status === 400);
  h = await get('/history/00000000-0000-4000-8000-000000000000', A);
  check('history/:id unknown -> 404', h.status === 404);
  h = await call('DELETE', `/history/${det._id}`, { cid: A });
  check('history: owner can delete', h.status === 200);
  h = await call('DELETE', `/history/${det._id}`, { cid: A });
  check('history: delete again -> 404', h.status === 404);

  // --- retention: each visitor keeps only their newest scans
  for (let i = 0; i < 30; i++) { await Detection.create({ clientId: A, imageData: 'data:x', snakeName: `Extra ${i}` }); await sleep(8); }
  const kept = (await query('SELECT count(*)::int n FROM detections WHERE client_id = $1', [A])).rows[0].n;
  check(`retention: capped at ${Detection.MAX_HISTORY_PER_CLIENT} scans per visitor`, kept === Detection.MAX_HISTORY_PER_CLIENT, `kept=${kept}`);
  h = await get('/history?limit=100', A);
  check('retention: the newest scans were kept', h.body.data[0].snakeName === 'Extra 29');
  await Detection.create({ clientId: B, imageData: 'data:x', snakeName: 'B scan' });
  check('retention: one visitor does not evict another', (await get('/history', B)).body.pagination.total === 1);

  // --- schema hygiene
  const rls = await query("SELECT relname, relrowsecurity FROM pg_class WHERE relname IN ('snakes','detections','sightings') ORDER BY relname");
  check('RLS enabled on all 3 tables', rls.rows.length === 3 && rls.rows.every((x) => x.relrowsecurity === true));
  const before = (await query('SELECT (SELECT count(*) FROM snakes)::int s, (SELECT count(*) FROM sightings)::int g')).rows[0];
  if (!process.env.SKIP_RECONNECT) await connectDB();
  const after = (await query('SELECT (SELECT count(*) FROM snakes)::int s, (SELECT count(*) FROM sightings)::int g')).rows[0];
  check('connect/migrate/seed is idempotent', before.s === after.s && before.g === after.g);

  server.close();
  await disconnectDB();
  console.log(failures ? `\n${failures} FAILURE(S)` : '\nALL TESTS PASSED');
  process.exit(failures ? 1 : 0);
})().catch((e) => { console.error('TEST CRASH:', e); process.exit(2); });
