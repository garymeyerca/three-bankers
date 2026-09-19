const app = document.querySelector('#app');
const modal = document.querySelector('#modal');
const { objects, matches } = Bankers;
const avatars = ['🦊', '🐱', '🐸', '🐼', '🐰', '🐻', '🦁', '🐨'];
const bankerIcons = ['🦉', '🦁', '🐸'];
const roles = ['Object shop', 'Card bank', 'Coin bank'];
let state;
let notice = 'Welcome to the market! Buy an object to begin your collection.';
const esc = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const current = () => state.players[state.turn % state.players.length];
const unlocked = () => current().bought && current().attempted;
function showModal(title, content) {
  modal.innerHTML = `<div class="modal-head"><h2>${title}</h2><button class="close" aria-label="Close dialog">×</button></div>${content}`;
  modal.querySelector('.close').onclick = () => modal.close();
  modal.showModal();
}
document.querySelector('#rules-button').onclick = () => showModal('A little trading know-how', `<ol class="rules"><li>Play solo for a high score, or share this screen with up to 4 players. Everyone starts with <strong>30 coins = $150</strong>.</li><li>Take one action each turn: buy an object, trade an object for cards or coins, or pass. Play 15 rounds.</li><li>The Object Banker charges 3 coins, or 2 for a favourite. The Card Banker gives 1 card, or 2 for a favourite. The Coin Banker gives 1 coin, or 2 for a favourite.</li><li>An object matches a favourite if its hobby <em>or</em> thing matches the banker’s ID. Matching both still gives the same bonus. Offers are visible before you accept.</li><li>Buy an object and try a trade to unlock the bankers’ IDs for yourself. Viewing an offer counts as trying a trade; it does not spend your turn.</li><li><strong>Collected cards cannot be sold or traded. Players cannot trade with each other.</strong> Your own ID is for your character and does not count as a scoring card.</li><li>The automatic judge checks every transaction. Objects are always in stock. Most cards after 15 rounds wins; coins break ties. Exact ties share the win.</li></ol>`);
function setup() {
  app.innerHTML = `<section class="setup"><div class="setup-hero"><div class="eyebrow">Welcome to the little market</div><h1>Small trades.<br>Big collections.</h1><p>Meet three curious bankers, discover their favourite things,<br>and turn your pocket money into a winning hand.</p><div class="setup-art" aria-hidden="true">🦉 🦁 🐸</div></div><form class="setup-box" id="setup-form"><div class="setup-top"><h2>Who’s coming to market?</h2><label>Players <select id="player-count"><option value="1">1 · Solo</option><option value="2" selected>2 players</option><option value="3">3 players</option><option value="4">4 players</option></select></label></div><div class="profiles" id="profiles"></div><div class="setup-bottom"><p>🪙 30 coins each &nbsp; · &nbsp; 15 rounds &nbsp; · &nbsp; Pass & play<br>One screen, a few friends, and a friendly automatic judge.</p><button class="primary" type="submit">Let’s play →</button></div></form></section>`;
  const profiles = document.querySelector('#profiles');
  function updateProfiles() {
    const count = Number(document.querySelector('#player-count').value);
    while (profiles.children.length > count) profiles.lastElementChild.remove();
    for (let i = profiles.children.length; i < count; i++) {
      const div = document.createElement('div'); div.className = 'profile';
      div.innerHTML = `<h3>PLAYER ${i + 1} · CHARACTER ID</h3><div class="fields"><label>Name<input name="name-${i}" maxlength="24" required value="Player ${i + 1}"></label><label>Character<select name="avatar-${i}">${avatars.map((a, j) => `<option ${i === j ? 'selected' : ''}>${a}</option>`).join('')}</select></label><label>Favourite hobby<input name="hobby-${i}" maxlength="40" required placeholder="e.g. Drawing" value="${objects[i].hobby}"></label><label>Favourite thing<input name="thing-${i}" maxlength="40" required placeholder="e.g. Dinosaurs" value="${objects[i].thing}"></label></div>`;
      profiles.append(div);
    }
  }
  document.querySelector('#player-count').onchange = updateProfiles; updateProfiles();
  document.querySelector('#setup-form').onsubmit = event => {
    event.preventDefault(); const data = new FormData(event.target);
    state = Bankers.create([...profiles.children].map((_, i) => ({ name: data.get(`name-${i}`).trim() || `Player ${i + 1}`, avatar: data.get(`avatar-${i}`), hobby: data.get(`hobby-${i}`).trim(), thing: data.get(`thing-${i}`).trim() })));
    notice = 'Welcome to the market! Buy an object, then try a trade to unlock the secret IDs.';
    render();
  };
}
function render() {
  const p = current(); const round = Math.floor(state.turn / state.players.length) + 1;
  app.innerHTML = `<div class="intro"><div><div class="eyebrow">The market is open</div><h1>A good day for a good trade.</h1><p>It’s ${esc(p.name)}’s turn. What will you add to your collection?</p></div><div class="round"><small>Your adventure</small>Round ${round} <span class="muted">/ 15</span></div></div><div class="layout"><section><div class="bankers">${state.bankers.map((b, i) => `<article class="banker"><div class="banker-top"><div class="shop-label">0${i + 1} / ${roles[i].toUpperCase()}</div><div class="portrait" role="img" aria-label="${['Owl', 'Lion', 'Frog'][i]} character">${bankerIcons[i]}</div><h3>${b.name}</h3><p>${['A little something for everyone.', 'Your next treasure awaits.', 'A little jingle for your pocket.'][i]}</p></div><div class="banker-body"><p>${['Spend coins on objects.<br>Every collection starts here.', 'Trade objects for cards.<br>Find a favourite, earn a bonus.', 'Trade objects for coins.<br>Give your purse a little boost.'][i]}</p><button class="primary" data-shop="${i}">${['Buy objects', 'Get cards', 'Get coins'][i]} <span aria-hidden="true">→</span></button><button class="id-button" data-id="${i}" ${unlocked() ? '' : 'disabled'}>${unlocked() ? '▣ View secret ID' : '🔒 Secret ID locked'}</button></div></article>`).join('')}</div><div class="judge" role="status" aria-live="polite"><div class="judge-icon">⚖️</div><div><strong>JUDGE PIP · FAIR TRADES, EVERY TIME</strong><p>${esc(notice)}</p></div></div><div class="section-title"><h2>Your object bag</h2><span class="muted">${p.objects.length} objects · ready to trade</span></div><div class="bag">${p.objects.length ? [...new Set(p.objects)].map(id => { const o = objects.find(o => o.id === id); return `<div class="object-chip"><span>${o.icon}</span>${o.name} <strong>×${p.objects.filter(x => x === id).length}</strong></div>`; }).join('') : '<div class="empty">🛍️ &nbsp; A little empty, a lot of possibility. Visit the Object Shop!</div>'}</div><div class="section-title"><h2>Your card collection</h2><span class="muted">🔒 Yours to keep. Always.</span></div><div class="collection">${p.cards.length ? p.cards.map(c => { const o = objects.find(o => o.id === c.object); return `<div class="collectible"><small>№ ${String(c.number).padStart(2, '0')} ✦</small><span>${o.icon}</span><b>${o.name}</b><small>Market treasure</small></div>`; }).join('') : '<div class="empty">Trade an object with Jasper to collect your first card.</div>'}</div><div class="game-actions"><button class="quiet" id="pass">Pass this turn →</button><button class="quiet" id="restart">New game</button></div></section><aside><div class="player-panel"><div class="player-id"><div class="eyebrow">Your character ID</div><div class="portrait">${p.avatar}</div><h3>${esc(p.name)}</h3><div class="detail">FAVOURITE HOBBY<strong>${esc(p.hobby)}</strong></div><div class="detail">FAVOURITE THING<strong>${esc(p.thing)}</strong></div></div><div><div class="stats"><div class="stat"><b>🪙 ${p.coins}</b><small>COINS · $${p.coins * 5}</small></div><div class="stat"><b>▣ ${p.cards.length}</b><small>CARDS COLLECTED</small></div></div><div class="eyebrow">Secret ID checklist</div><p class="lock-note">${p.bought ? '✓' : '○'} Buy an object<br>${p.attempted ? '✓' : '○'} Try a trade<br>${unlocked() ? '🔓 Banker IDs are yours to peek at!' : 'Complete both to discover their favourites.'}</p><div class="eyebrow">Around the table</div>${state.players.map(other => `<div class="score-row ${other === p ? 'active' : ''}"><span>${other.avatar} ${esc(other.name)}</span><span>${other.cards.length} ▣</span></div>`).join('')}</div></div></aside></div>`;
  app.querySelectorAll('[data-shop]').forEach(b => b.onclick = () => shop(Number(b.dataset.shop)));
  app.querySelectorAll('[data-id]').forEach(b => b.onclick = () => showIDs(Number(b.dataset.id)));
  document.querySelector('#pass').onclick = () => transact('pass');
  document.querySelector('#restart').onclick = () => { showModal('Start a fresh adventure?', '<p>This ends your current game.</p><button class="primary" id="confirm-restart">Start a new game</button>'); document.querySelector('#confirm-restart').onclick = () => { modal.close(); setup(); }; };
}
function shop(index) {
  const p = current(); const banker = state.bankers[index];
  const stock = index === 0 ? objects : objects.filter(o => p.objects.includes(o.id));
  if (index !== 0 && stock.length) {
    const wasLocked = !unlocked(); p.attempted = true;
    if (wasLocked && unlocked()) notice = 'Trade attempt checked! You can now open the bankers’ secret IDs, even if you decline this offer.';
    render();
  }
  showModal(`${banker.name}’s ${roles[index].toLowerCase()}`, `<p>${index === 0 ? 'Pick an object. Buying uses your turn. 1 coin = $5.' : 'Here are your offers. Accept one to use your turn, or close to keep exploring.'}</p>${!stock.length ? '<div class="empty">Your bag is empty. Buy an object before trying a trade.</div>' : `<div class="shop-grid">${stock.map(o => { const amount = index === 0 ? (matches(o, banker) ? 2 : 3) : (matches(o, banker) ? 2 : 1); return `<div class="shop-item"><div class="emoji">${o.icon}</div><h3>${o.name}</h3><p>${o.hobby}<br>${o.thing}</p><button class="primary" data-object="${o.id}" ${index === 0 && p.coins < amount ? 'disabled' : ''}>${index === 0 ? `Buy · ${amount} coins` : `Get ${amount} ${index === 1 ? 'card' : 'coin'}${amount > 1 ? 's' : ''}`}</button></div>`; }).join('')}</div>`}<p class="error" id="trade-error" role="alert"></p>`);
  modal.querySelectorAll('[data-object]').forEach(b => b.onclick = () => transact(['buy', 'cards', 'coins'][index], b.dataset.object));
}
function showIDs(index) {
  if (!unlocked()) return;
  const b = state.bankers[index];
  showModal('A peek behind the counter', `<p>This secret is for ${esc(current().name)}. Keep it to yourself!</p><div class="reveal"><div class="portrait">${bankerIcons[index]}</div><div class="eyebrow">${roles[index]} · CHARACTER ID</div><h3>${b.name}</h3><div class="detail">FAVOURITE HOBBY<strong>${b.hobby}</strong></div><div class="detail">FAVOURITE THING<strong>${b.thing}</strong></div></div><p style="margin-top:18px">Bring an object that matches either favourite for a better deal.</p>`);
}
function transact(kind, id) {
  const result = Bankers.act(state, kind, id);
  if (!result.ok) { notice = result.message; const error = document.querySelector('#trade-error'); if (error) error.textContent = result.message; else render(); return; }
  modal.close(); notice = result.message;
  if (state.done) { results(); return; }
  app.innerHTML = `<section class="handoff"><div class="eyebrow">${state.players.length > 1 ? 'Pass the screen' : 'Ready for your next turn?'}</div><div class="portrait">${current().avatar}</div><h1>You’re up, ${esc(current().name)}.</h1><p>Round ${Math.floor(state.turn / state.players.length) + 1} of 15${state.players.length > 1 ? '<br>Hand over the screen before continuing.' : ''}</p><div class="receipt">⚖️ ${esc(notice)}</div><button class="primary" id="continue">${state.players.length > 1 ? 'This is me — let’s trade' : 'Continue'} →</button></section>`;
  document.querySelector('#continue').onclick = render;
  window.scrollTo(0, 0);
}
function results() {
  const ranked = [...state.players].sort((a, b) => b.cards.length - a.cards.length || b.coins - a.coins);
  const winners = ranked.filter(p => p.cards.length === ranked[0].cards.length && p.coins === ranked[0].coins);
  app.innerHTML = `<section class="handoff"><div class="eyebrow">The market is closed · 15 rounds complete</div><div class="portrait">🏆</div><h1>${state.players.length === 1 ? 'What a collection!' : `${winners.map(p => esc(p.name)).join(' & ')} ${winners.length > 1 ? 'win' : 'wins'}!`}</h1><p>${state.players.length === 1 ? `You collected ${ranked[0].cards.length} cards. Play again to beat your score!` : 'Most cards wins. Coins break a tie.'}</p>${ranked.map(p => `<div class="result-row"><strong>${p.avatar} ${esc(p.name)}</strong><span>${p.cards.length} cards · ${p.coins} coins</span></div>`).join('')}<p class="receipt" style="margin-top:20px">⚖️ ${esc(notice)}</p><button class="primary" id="again">Another trip to the market →</button></section>`;
  document.querySelector('#again').onclick = setup;
}
setup();
