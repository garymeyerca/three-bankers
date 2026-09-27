const { test } = require('node:test');
const assert = require('node:assert/strict');
const { create, act } = require('./engine');
const Save = require('./save');
const game = () => create([{ name: 'A', avatar: '🦊', hobby: 'Reading', thing: 'Books' }]);
function storage() { const values = new Map(); return { getItem: k => values.get(k) ?? null, setItem: (k,v) => values.set(k,v) }; }
test('save and reload preserve progress, banker secrets, and ID unlocks', () => {
  const s = game(); act(s, 'buy', 'book'); s.players[0].attempted = true;
  const store = storage(); assert.equal(Save.write(store, s, 'Trade tried'), true);
  assert.deepEqual(Save.read(store).save, { version: 1, state: s, notice: 'Trade tried' });
  act(s, 'cards', 'book'); Save.write(store, s, 'Traded');
  assert.deepEqual(Save.read(store).save.state, s);
});
test('finished games survive reload', () => {
  const s = game(); for(let i=0;i<15;i++) act(s,'pass');
  const store = storage(); assert.equal(Save.write(store,s,'Done'),true);
  assert.equal(Save.read(store).save.state.done,true);
});
test('missing, malformed, unknown-version, and invalid inventory saves are handled', () => {
  const store = storage(); assert.equal(Save.read(store).save,null);
  for(const raw of ['{', 'null', JSON.stringify({version:2,state:game(),notice:''})]) {
    store.setItem(Save.key,raw); assert.equal(Save.read(store).save,null); assert.ok(Save.read(store).error);
  }
  const s=game();s.players[0].objects.push('unknown');
  store.setItem(Save.key,JSON.stringify({version:1,state:s,notice:''}));
  assert.equal(Save.read(store).save,null);
});
test('blocked storage reports failure without crashing or losing in-memory state', () => {
  const s=game(); const before=JSON.stringify(s);
  const blocked={getItem(){throw Error('Blocked')},setItem(){throw Error('Full')}};
  assert.equal(Save.write(blocked,s,''),false); assert.ok(Save.read(blocked).error);
  assert.equal(JSON.stringify(s),before);
  assert.equal(Save.write(undefined,s,''),false);
});
