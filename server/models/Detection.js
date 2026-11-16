const { query, serialize } = require('../config/db');

// History list excludes the large base64 image column
const LIST_COLUMNS = `id, snake_name, scientific_name, confidence, venomous, danger_level, description,
  habitat, region, first_aid, fun_fact, behavior, diet, created_at, updated_at`;

const create = async (d) => {
  const { rows } = await query(
    `INSERT INTO detections (image_data, snake_name, scientific_name, confidence, venomous, danger_level,
       description, habitat, region, first_aid, fun_fact, behavior, diet)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
     RETURNING *`,
    [
      d.imageData, d.snakeName, d.scientificName ?? 'Unknown', d.confidence ?? 'Medium',
      Boolean(d.venomous), d.dangerLevel ?? 'Harmless', d.description ?? '', d.habitat ?? '',
      d.region ?? '', d.firstAid ?? '', d.funFact ?? '', d.behavior ?? '', d.diet ?? ''
    ]
  );
  return serialize(rows[0]);
};

const list = async ({ limit, offset }) => {
  const { rows } = await query(
    `SELECT ${LIST_COLUMNS} FROM detections ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  return rows.map(serialize);
};

const count = async () => {
  const { rows } = await query('SELECT count(*)::int AS n FROM detections');
  return rows[0].n;
};

const findById = async (id) => {
  const { rows } = await query('SELECT * FROM detections WHERE id = $1', [id]);
  return serialize(rows[0]) || null;
};

const remove = async (id) => {
  const { rowCount } = await query('DELETE FROM detections WHERE id = $1', [id]);
  return rowCount > 0;
};

module.exports = { create, list, count, findById, remove };
