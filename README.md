# The Three Bankers

[Play the game](https://garymeyerca.github.io/three-bankers/)

A browser game for 1–4 people sharing a screen. Open `index.html` directly, or serve this folder with `python3 -m http.server 8080` and visit http://localhost:8080.

No build step or dependencies. An optional Google Fonts stylesheet falls back to system fonts offline. Character pictures use emoji. Games last 15 rounds. Progress saves automatically after each action and secret-ID unlock. Use **Resume saved game** on the welcome screen after refreshing or reopening. Saves stay in this browser on this device and site address; they do not sync between devices. Clearing browser data removes the save. Starting a new game asks before replacing the previous save. Completed results are saved too. If storage is blocked or full, the game remains playable and shows a save warning.

The automatic judge enforces purchases and trades. Cards are permanent, player-to-player trading is unavailable, and banker IDs unlock separately for each player after buying an object and viewing a trade offer. Close an offer to decline without spending a turn. Banker preferences are randomized each game. This is a local pass-and-play game: players should look away during another person's turn to preserve secrets.

Run rule checks with `node --test`.

GitHub Pages publishes the root of `main`. Push changes to `main` to update the live game.
