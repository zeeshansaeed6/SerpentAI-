const { query, serialize } = require('../config/db');

// Keeps database size bounded: each visitor retains only their newest scans
const MAX_HISTORY_PER_CLIENT = 50;

// History list excludes the large base64 image column
const LIST_COLUMNS = `id, snake_name, scientific_name, confidence, venomous, danger_level, description,
  habitat, region, first_aid, fun_fact, behavior, diet, created_at, updated_at`;

const create = async (d) => {
  const { rows } = await query(
    `INSERT INTO detections (client_id, image_data, snake_name, scientific_name, confidence, venomous,
       danger_level, description, habitat, region, first_aid, fun_fact, behavior, diet)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
     RETURNING *`,
    [
      d.clientId, d.imageData, d.snakeName, d.scientificName ?? 'Unknown', d.confidence ?? 'Medium',
      Boolean(d.venomous), d.dangerLevel ?? 'Harmless', d.description ?? '', d.habitat ?? '',
      d.region ?? '', d.firstAid ?? '', d.funFact ?? '', d.behavior ?? '', d.diet ?? ''
    ]
  );

  await query(
    `DELETE FROM detections
     WHERE client_id = $1
       AND id NOT IN (SELECT id FROM detections WHERE client_id = $1 ORDER BY created_at DESC LIMIT $2)`,
    [d.clientId, MAX_HISTORY_PER_CLIENT]
  );

  return serialize(rows[0]);
};

// Every read/delete is scoped to the owner: one visitor can never see another's scans
const list = async ({ clientId, limit, offset }) => {
  const { rows } = await query(
    `SELECT ${LIST_COLUMNS} FROM detections WHERE client_id = $1
     ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
    [clientId, limit, offset]
  );
  return rows.map(serialize);
};

const count = async (clientId) => {
  const { rows } = await query('SELECT count(*)::int AS n FROM detections WHERE client_id = $1', [clientId]);
  return rows[0].n;
};

const findById = async (id, clientId) => {
  const { rows } = await query('SELECT * FROM detections WHERE id = $1 AND client_id = $2', [id, clientId]);
  return serialize(rows[0]) || null;
};

const remove = async (id, clientId) => {
  const { rowCount } = await query('DELETE FROM detections WHERE id = $1 AND client_id = $2', [id, clientId]);
  return rowCount > 0;
};

module.exports = { MAX_HISTORY_PER_CLIENT, create, list, count, findById, remove };
