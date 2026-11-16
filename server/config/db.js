const { Pool } = require('pg');

// Active database adapter: { query(text, params), exec(sql), close() }
let adapter = null;

const camelCase = (key) => key.replace(/_([a-z])/g, (_, char) => char.toUpperCase());

// Postgres row (snake_case, `id`) -> API object (camelCase, `_id`).
// Keeps API responses in the shape the frontend expects (`_id`, camelCase keys).
const serialize = (row) => {
  if (!row) return row;
  const out = {};
  for (const [key, value] of Object.entries(row)) {
    if (key === 'client_id') continue; // owner identity never leaves the server
    out[key === 'id' ? '_id' : camelCase(key)] = value;
  }
  return out;
};

// Idempotent schema. Row Level Security is enabled with no policies: this server connects as the
// table owner (bypasses RLS), while Supabase's public REST API (anon key) gets no access at all.
const SCHEMA = `
CREATE TABLE IF NOT EXISTS snakes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  scientific_name text NOT NULL,
  family text NOT NULL DEFAULT '',
  venomous boolean NOT NULL DEFAULT false,
  danger_level text NOT NULL DEFAULT 'Harmless'
    CHECK (danger_level IN ('Harmless', 'Mild', 'Moderate', 'Dangerous', 'Deadly')),
  description text NOT NULL DEFAULT '',
  habitat text NOT NULL DEFAULT '',
  region text NOT NULL DEFAULT '',
  diet text NOT NULL DEFAULT '',
  average_length text NOT NULL DEFAULT '',
  color text NOT NULL DEFAULT '',
  first_aid text NOT NULL DEFAULT '',
  fun_fact text NOT NULL DEFAULT '',
  image_url text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS snakes_scientific_name_key ON snakes (scientific_name);

CREATE TABLE IF NOT EXISTS detections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_data text NOT NULL,
  snake_name text NOT NULL,
  scientific_name text NOT NULL DEFAULT 'Unknown',
  confidence text NOT NULL DEFAULT 'Medium',
  venomous boolean NOT NULL DEFAULT false,
  danger_level text NOT NULL DEFAULT 'Harmless',
  description text NOT NULL DEFAULT '',
  habitat text NOT NULL DEFAULT '',
  region text NOT NULL DEFAULT '',
  first_aid text NOT NULL DEFAULT '',
  fun_fact text NOT NULL DEFAULT '',
  behavior text NOT NULL DEFAULT '',
  diet text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS detections_created_at_idx ON detections (created_at DESC);

CREATE TABLE IF NOT EXISTS sightings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  species_name text NOT NULL,
  scientific_name text NOT NULL DEFAULT 'Unknown',
  venomous boolean NOT NULL DEFAULT false,
  danger_level text NOT NULL DEFAULT 'Harmless'
    CHECK (danger_level IN ('Harmless', 'Moderate', 'Dangerous', 'Deadly')),
  location_name text NOT NULL,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  notes text NOT NULL DEFAULT '',
  image_data text NOT NULL DEFAULT '',
  reporter_name text NOT NULL DEFAULT 'Anonymous Explorer',
  verified boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS sightings_created_at_idx ON sightings (created_at DESC);

-- Anonymous owner (X-Client-Id). Nullable: seeded sightings have no owner and can't be deleted.
ALTER TABLE detections ADD COLUMN IF NOT EXISTS client_id uuid;
CREATE INDEX IF NOT EXISTS detections_client_idx ON detections (client_id, created_at DESC);
ALTER TABLE sightings ADD COLUMN IF NOT EXISTS client_id uuid;

ALTER TABLE snakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE detections ENABLE ROW LEVEL SECURITY;
ALTER TABLE sightings ENABLE ROW LEVEL SECURITY;
`;

const isLocalUrl = (url) => /@(localhost|127\.0\.0\.1|\[::1\])[:/]/.test(url);

const createPgAdapter = (url) => {
  // Supabase's certificate chain is not in Node's trust store, and newer `pg` versions treat
  // sslmode=require as verify-full. Drop sslmode from the URL and set `ssl` explicitly instead.
  const connectionString = url.replace(/([?&])sslmode=[^&]*&?/, '$1').replace(/[?&]$/, '');
  const pool = new Pool({
    connectionString,
    ssl: isLocalUrl(url) ? false : { rejectUnauthorized: false },
    max: Number(process.env.DB_POOL_MAX) || 10,
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000
  });
  // An idle client dropping (e.g. pooler restart) must not crash the process
  pool.on('error', (err) => console.error('Idle database client error:', err.message));

  return {
    query: (text, params) => pool.query(text, params),
    exec: (sql) => pool.query(sql),
    close: () => pool.end()
  };
};

const createPgliteAdapter = async () => {
  const { PGlite } = require('@electric-sql/pglite'); // dev dependency: loaded lazily
  const db = new PGlite();
  await db.waitReady;
  return {
    query: (text, params) => db.query(text, params),
    exec: (sql) => db.exec(sql),
    close: () => db.close()
  };
};

const query = (text, params) => {
  if (!adapter) throw new Error('Database is not connected');
  return adapter.query(text, params);
};

const ping = async () => {
  try {
    await query('SELECT 1');
    return true;
  } catch {
    return false;
  }
};

const seedIfEmpty = async () => {
  const { snakeData } = require('../data/seedSnakes');
  const { initialSightings } = require('../data/seedSightings');

  const snakes = await query('SELECT count(*)::int AS n FROM snakes');
  if (snakes.rows[0].n === 0) {
    console.log('🌱 Seeding snake encyclopedia data...');
    for (const s of snakeData) {
      // ON CONFLICT keeps seeding safe if two instances start at once
      await query(
        `INSERT INTO snakes (name, scientific_name, family, venomous, danger_level, description, habitat,
           region, diet, average_length, color, first_aid, fun_fact, image_url)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
         ON CONFLICT (scientific_name) DO NOTHING`,
        [
          s.name, s.scientificName, s.family ?? '', Boolean(s.venomous), s.dangerLevel ?? 'Harmless',
          s.description ?? '', s.habitat ?? '', s.region ?? '', s.diet ?? '', s.averageLength ?? '',
          s.color ?? '', s.firstAid ?? '', s.funFact ?? '', s.imageUrl ?? ''
        ]
      );
    }
    console.log(`✅ Seeded ${snakeData.length} snake species`);
  }

  const sightings = await query('SELECT count(*)::int AS n FROM sightings');
  if (sightings.rows[0].n === 0) {
    for (const s of initialSightings) {
      await query(
        `INSERT INTO sightings (species_name, scientific_name, venomous, danger_level, location_name,
           latitude, longitude, notes, image_data, reporter_name)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [s.speciesName, s.scientificName, s.venomous, s.dangerLevel, s.locationName,
          s.latitude, s.longitude, s.notes, s.imageData, s.reporterName]
      );
    }
    console.log('📍 Seeded initial community sightings');
  }
};

const connectDB = async () => {
  try {
    await disconnectDB(); // calling connectDB twice must not leak the previous pool
    const url = process.env.DATABASE_URL;

    if (url) {
      adapter = createPgAdapter(url);
    } else {
      // The in-memory database is a dev convenience: all data is lost on restart,
      // so production must be configured with a real database (e.g. Supabase).
      if (process.env.NODE_ENV === 'production') {
        throw new Error('DATABASE_URL is required when NODE_ENV=production (use your Supabase connection string)');
      }
      console.log('🧠 No DATABASE_URL set: starting in-memory Postgres (PGlite) for development...');
      adapter = await createPgliteAdapter();
    }

    await adapter.query('SELECT 1'); // fail fast if unreachable or credentials are wrong
    if (url) {
      let host = 'database';
      try { host = new URL(url).host; } catch { /* keep generic label; never log credentials */ }
      console.log(`📦 PostgreSQL connected: ${host}`);
    } else {
      console.log('✅ In-memory Postgres ready');
    }

    await adapter.exec(SCHEMA);
    await seedIfEmpty();
  } catch (error) {
    console.error(`❌ Database Connection Error: ${error.message}`);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  if (adapter) {
    await adapter.close();
    adapter = null;
  }
};

module.exports = { connectDB, disconnectDB, query, ping, serialize };
