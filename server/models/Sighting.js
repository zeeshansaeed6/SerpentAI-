const { query, serialize } = require('../config/db');

const DANGER_LEVELS = ['Harmless', 'Moderate', 'Dangerous', 'Deadly'];

// Sightings are public (community radar). `mine` tells the caller which ones they may delete.
const list = async (clientId) => {
  const { rows } = await query(
    'SELECT *, COALESCE(client_id = $1::uuid, false) AS mine FROM sightings ORDER BY created_at DESC',
    [clientId]
  );
  return rows.map(serialize);
};

const create = async (s) => {
  const { rows } = await query(
    `INSERT INTO sightings (client_id, species_name, scientific_name, venomous, danger_level, location_name,
       latitude, longitude, notes, image_data, reporter_name)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
     RETURNING *, true AS mine`,
    [s.clientId, s.speciesName, s.scientificName, s.venomous, s.dangerLevel, s.locationName,
      s.latitude, s.longitude, s.notes, s.imageData, s.reporterName]
  );
  return serialize(rows[0]);
};

// Only the poster can delete (seeded sightings have no owner, so nobody can)
const remove = async (id, clientId) => {
  const { rowCount } = await query('DELETE FROM sightings WHERE id = $1 AND client_id = $2', [id, clientId]);
  return rowCount > 0;
};

module.exports = { DANGER_LEVELS, list, create, remove };
