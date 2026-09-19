# The Three Bankers

A browser game for 1–4 people sharing a screen. Open `index.html` directly, or serve this folder with `python3 -m http.server 8080` and visit http://localhost:8080.

No build step or dependencies. An optional Google Fonts stylesheet falls back to system fonts offline. Character pictures use emoji. Games last 15 rounds and remain in memory; refreshing starts over.

The automatic judge enforces purchases and trades. Cards are permanent, player-to-player trading is unavailable, and banker IDs unlock separately for each player after buying an object and viewing a trade offer. Close an offer to decline without spending a turn. Banker preferences are randomized each game. This is a local pass-and-play game: players should look away during another person's turn to preserve secrets.

Run rule checks with `node --test engine.test.js`.
