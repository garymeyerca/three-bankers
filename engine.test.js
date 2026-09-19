const { test } = require('node:test');
const assert = require('node:assert/strict');
const { create, act, objects, matches } = require('./engine');
const profile = { name: 'A', avatar: '🦊', hobby: 'Reading', thing: 'Books' };
test('buying and trading conserve inventory and award the advertised amount', () => {
  const s = create([profile]); const p = s.players[0]; const o = objects[0];
  const price = matches(o, s.bankers[0]) ? 2 : 3;
  assert.equal(act(s, 'buy', o.id).ok, true); assert.equal(p.coins, 30 - price);
  assert.equal(p.bought, true); assert.equal(p.attempted, false);
  const award = matches(o, s.bankers[1]) ? 2 : 1;
  assert.equal(act(s, 'cards', o.id).ok, true); assert.equal(p.cards.length, award); assert.deepEqual(p.objects, []);
  assert.equal(p.attempted, true);
  const before = JSON.stringify(s);
  assert.equal(act(s, 'coins', o.id).ok, false);
  assert.equal(act(s, 'sell-card', o.id).ok, false);
  assert.equal(JSON.stringify(s), before);
});
test('coin trades return coins and remove exactly one object', () => {
  const s = create([profile]); const p = s.players[0]; p.objects = ['book', 'book'];
  const award = matches(objects[2], s.bankers[2]) ? 2 : 1;
  act(s, 'coins', 'book'); assert.equal(p.coins, 30 + award); assert.deepEqual(p.objects, ['book']);
});
test('insufficient money and other players objects cannot be used', () => {
  const s = create([profile, { ...profile, name: 'B' }]); s.players[0].coins = 0; s.players[1].objects = ['paint'];
  assert.equal(act(s, 'buy', 'paint').ok, false); assert.equal(act(s, 'cards', 'paint').ok, false);
  assert.equal(s.turn, 0); assert.deepEqual(s.players[1].objects, ['paint']);
});
test('each player gets exactly 15 turns and completed games reject actions', () => {
  const s = create([profile, profile, profile, profile]);
  for (let i = 0; i < 60; i++) { assert.equal(s.done, false); assert.equal(act(s, 'pass').ok, true); }
  assert.equal(s.done, true); assert.equal(act(s, 'pass').ok, false); assert.equal(s.turn, 60);
});
