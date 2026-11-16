// Anonymous per-browser identity. The client generates a random UUID once and sends it as
// `X-Client-Id`. It is not authentication (anyone can invent one), but it scopes private data
// (scan history) and lets people delete only the sightings they posted. Stored hashed-free:
// it is a random value with no personal meaning.
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const attach = (req, res, next) => {
  const id = req.get('x-client-id');
  req.clientId = id && UUID.test(id) ? id.toLowerCase() : null;
  next();
};

const requireClient = (req, res, next) => {
  if (!req.clientId) {
    return res.status(400).json({ success: false, message: 'Missing or invalid client id.' });
  }
  next();
};

module.exports = { attach, requireClient };
