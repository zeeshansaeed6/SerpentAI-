// Anonymous, random per-browser id sent as X-Client-Id. It scopes private scan history and lets
// people delete only their own sightings. It is not a login: clearing site data starts a new identity.
const KEY = 'serpentai.clientId';

const uuid = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
        (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
      );

let memoryId = null; // used when localStorage is unavailable (private mode, blocked storage)

export const getClientId = () => {
  try {
    let id = localStorage.getItem(KEY);
    if (!id) {
      id = uuid();
      localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    memoryId = memoryId || uuid();
    return memoryId;
  }
};
