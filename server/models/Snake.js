const { query, serialize } = require('../config/db');

// Escape LIKE wildcards so user input is matched literally
const escapeLike = (value) => value.replace(/[\\%_]/g, '\\$&');

const list = async ({ search, venomous, danger } = {}) => {
  const where = [];
  const params = [];

  if (search) {
    params.push(`%${escapeLike(String(search))}%`);
    const n = params.length;
    where.push(`(name ILIKE $${n} ESCAPE '\\' OR scientific_name ILIKE $${n} ESCAPE '\\' OR region ILIKE $${n} ESCAPE '\\')`);
  }
  if (venomous !== undefined) {
    params.push(venomous === 'true');
    where.push(`venomous = $${params.length}`);
  }
  if (danger) {
    params.push(String(danger));
    where.push(`danger_level = $${params.length}`);
  }

  const sql = `SELECT * FROM snakes${where.length ? ` WHERE ${where.join(' AND ')}` : ''} ORDER BY name ASC`;
  const { rows } = await query(sql, params);
  return rows.map(serialize);
};

const findById = async (id) => {
  const { rows } = await query('SELECT * FROM snakes WHERE id = $1', [id]);
  return serialize(rows[0]) || null;
};

module.exports = { list, findById };
