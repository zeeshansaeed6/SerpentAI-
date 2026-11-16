const { query, serialize } = require('../config/db');

const DANGER_LEVELS = ['Harmless', 'Moderate', 'Dangerous', 'Deadly'];

const list = async () => {
  const { rows } = await query('SELECT * FROM sightings ORDER BY created_at DESC');
  return rows.map(serialize);
};

const create = async (s) => {
  const { rows } = await query(
    `INSERT INTO sightings (species_name, scientific_name, venomous, danger_level, location_name,
       latitude, longitude, notes, image_data, reporter_name)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
     RETURNING *`,
    [s.speciesName, s.scientificName, s.venomous, s.dangerLevel, s.locationName,
      s.latitude, s.longitude, s.notes, s.imageData, s.reporterName]
  );
  return serialize(rows[0]);
};

const remove = async (id) => {
  const { rowCount } = await query('DELETE FROM sightings WHERE id = $1', [id]);
  return rowCount > 0;
};

module.exports = { DANGER_LEVELS, list, create, remove };
