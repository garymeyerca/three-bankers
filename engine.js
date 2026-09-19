(function (root) {
  const objects = [
    { id: 'paint', name: 'Paint set', icon: '🎨', hobby: 'Making art', thing: 'Rainbows' },
    { id: 'ball', name: 'Football', icon: '⚽', hobby: 'Playing sports', thing: 'Football' },
    { id: 'book', name: 'Storybook', icon: '📚', hobby: 'Reading', thing: 'Stories' },
    { id: 'plant', name: 'Little plant', icon: '🪴', hobby: 'Gardening', thing: 'Flowers' },
    { id: 'guitar', name: 'Guitar', icon: '🎸', hobby: 'Making music', thing: 'Songs' },
    { id: 'bear', name: 'Teddy bear', icon: '🧸', hobby: 'Collecting toys', thing: 'Teddy bears' }
  ];
  const matches = (object, banker) => object.hobby === banker.hobby || object.thing === banker.thing;
  function create(profiles, random = Math.random) {
    const pool = [...objects].sort(() => random() - .5);
    return { turn: 0, rounds: 15, done: false, players: profiles.map(p => ({ ...p, coins: 30, objects: [], cards: [], bought: false, attempted: false })), bankers: ['Mabel', 'Jasper', 'Clover'].map((name, i) => ({ name, hobby: pool[i].hobby, thing: pool[(i + 2) % pool.length].thing })) };
  }
  function act(state, kind, id) {
    if (state.done) return { ok: false, message: 'This game has finished.' };
    const player = state.players[state.turn % state.players.length];
    const object = objects.find(o => o.id === id);
    if (!['buy', 'cards', 'coins', 'pass'].includes(kind)) return { ok: false, message: 'Players can only trade objects with bankers. Cards are yours to keep.' };
    if (kind !== 'pass' && !object) return { ok: false, message: 'Choose an object first.' };
    let message;
    if (kind === 'buy') {
      const price = matches(object, state.bankers[0]) ? 2 : 3;
      if (player.coins < price) return { ok: false, message: 'You need more coins. Trade an object at the Coin Bank or pass.' };
      player.coins -= price; player.objects.push(id); player.bought = true;
      message = `Approved! ${player.name} bought ${object.name.toLowerCase()} for ${price} coins ($${price * 5}).`;
    } else if (kind !== 'pass') {
      const index = player.objects.indexOf(id);
      if (index < 0) return { ok: false, message: 'You can only trade objects in your own bag.' };
      const amount = matches(object, state.bankers[kind === 'cards' ? 1 : 2]) ? 2 : 1;
      player.objects.splice(index, 1); player.attempted = true;
      if (kind === 'cards') for (let i = 0; i < amount; i++) player.cards.push({ object: id, number: player.cards.length + 1 });
      else player.coins += amount;
      message = `Approved! ${player.name} traded ${object.name.toLowerCase()} for ${amount} ${kind === 'cards' ? 'card' : 'coin'}${amount > 1 ? 's' : ''}.`;
    } else message = `${player.name} passed. No coins or objects spent.`;
    state.turn++; state.done = state.turn >= state.rounds * state.players.length;
    return { ok: true, message };
  }
  const api = { objects, matches, create, act };
  if (typeof module !== 'undefined') module.exports = api;
  else root.Bankers = api;
})(globalThis);
