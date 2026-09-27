(function (root) {
  const key = 'three-bankers.save.v1';
  const ids = ['paint', 'ball', 'book', 'plant', 'guitar', 'bear'];
  const text = value => typeof value === 'string' && value.length <= 500;
  const integer = value => Number.isSafeInteger(value) && value >= 0;
  function valid(save) {
    const s = save?.state;
    return save?.version === 1 && text(save.notice) && s && s.rounds === 15 &&
      Array.isArray(s.players) && s.players.length >= 1 && s.players.length <= 4 &&
      integer(s.turn) && s.turn <= s.players.length * 15 && s.done === (s.turn === s.players.length * 15) &&
      s.players.every(p => p && ['name', 'avatar', 'hobby', 'thing'].every(k => text(p[k])) &&
        integer(p.coins) && typeof p.bought === 'boolean' && typeof p.attempted === 'boolean' &&
        Array.isArray(p.objects) && p.objects.length <= 15 && p.objects.every(id => ids.includes(id)) &&
        Array.isArray(p.cards) && p.cards.length <= 30 && p.cards.every((c, i) => c && ids.includes(c.object) && c.number === i + 1)) &&
      Array.isArray(s.bankers) && s.bankers.length === 3 &&
      s.bankers.every(b => b && ['name', 'hobby', 'thing'].every(k => text(b[k])));
  }
  function read(storage) {
    try {
      const raw = storage.getItem(key);
      if (!raw) return { save: null };
      const save = JSON.parse(raw);
      return valid(save) ? { save } : { save: null, error: 'Your saved game could not be loaded. You can start a new game.' };
    } catch { return { save: null, error: 'Saved games are unavailable. Your browser may be blocking storage, or the save is damaged.' }; }
  }
  function write(storage, state, notice) {
    try {
      const save = { version: 1, state, notice };
      if (!valid(save)) throw new Error('Invalid game');
      storage.setItem(key, JSON.stringify(save));
      return true;
    } catch { return false; }
  }
  const api = { key, read, write };
  if (typeof module !== 'undefined') module.exports = api;
  else root.GameSave = api;
})(globalThis);
