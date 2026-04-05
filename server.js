'use strict';
const express  = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const path   = require('path');
const fs     = require('fs');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');

const CONFIG = (() => {
  try { return JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8')); }
  catch { return {}; }
})();
const googleClient = CONFIG.googleClientId && !CONFIG.googleClientId.startsWith('YOUR_')
  ? new OAuth2Client(CONFIG.googleClientId)
  : null;

const app  = express();
const http = createServer(app);
const io   = new Server(http, { cors: { origin: '*' } });

app.use(express.static(path.join(__dirname)));
app.use(express.json());

const ACCOUNTS_FILE = process.env.DATA_DIR
  ? path.join(process.env.DATA_DIR, 'accounts.json')
  : path.join(__dirname, 'accounts.json');

// ─── ACCOUNTS (file-backed) ───────────────────────────────────────────────────
function loadAccounts() {
  try { return JSON.parse(fs.readFileSync(ACCOUNTS_FILE, 'utf8')); }
  catch { return {}; }
}
function saveAccounts(accs) {
  fs.writeFileSync(ACCOUNTS_FILE, JSON.stringify(accs, null, 2));
}
function hashPw(password, salt) {
  return crypto.scryptSync(password, salt, 32).toString('hex');
}

// ─── IN-MEMORY STATE ─────────────────────────────────────────────────────────
const sessions = {};   // token → name
const queue    = [];
const rooms    = {};

// Load players from persisted accounts
const players = {};
Object.values(loadAccounts()).forEach(acc => {
  players[acc.name] = { name: acc.name, elo: acc.elo, wins: acc.wins, losses: acc.losses };
});

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function broadcastLeaderboard() {
  const board = Object.values(players)
    .sort((a, b) => b.elo - a.elo)
    .slice(0, 25)
    .map(({ name, elo, wins, losses }) => ({ name, elo, wins, losses }));
  io.emit('leaderboard', board);
}

function calcElo(myElo, oppElo, result) {
  const K = 32;
  const exp = 1 / (1 + Math.pow(10, (oppElo - myElo) / 400));
  return Math.round(myElo + K * (result - exp));
}

function persistPlayer(name) {
  const p = players[name]; if (!p) return;
  const accs = loadAccounts();
  const key  = name.toLowerCase();
  if (accs[key]) {
    accs[key].elo    = p.elo;
    accs[key].wins   = p.wins;
    accs[key].losses = p.losses;
    saveAccounts(accs);
  }
}

function makeToken() { return crypto.randomBytes(24).toString('hex'); }

// ─── CLIENT CONFIG (exposes non-secret config to frontend) ───────────────────
app.get('/client-config.js', (_req, res) => {
  const id = (CONFIG.googleClientId && !CONFIG.googleClientId.startsWith('YOUR_'))
    ? CONFIG.googleClientId : '';
  res.type('application/javascript');
  res.send(`window.GOOGLE_CLIENT_ID = ${JSON.stringify(id)};`);
});

// ─── AUTH ENDPOINTS ──────────────────────────────────────────────────────────
app.post('/register', (req, res) => {
  const { name, password } = req.body || {};
  if (!name || !password)         return res.json({ error: 'Name and password required.' });
  if (name.length < 2 || name.length > 16) return res.json({ error: 'Name must be 2–16 characters.' });
  if (!/^[a-zA-Z0-9_]+$/.test(name))       return res.json({ error: 'Letters, numbers, underscores only.' });
  if (password.length < 4)        return res.json({ error: 'Password must be at least 4 characters.' });

  const accs = loadAccounts();
  if (accs[name.toLowerCase()])   return res.json({ error: 'Username already taken.' });

  const salt = crypto.randomBytes(16).toString('hex');
  const hash = hashPw(password, salt);
  accs[name.toLowerCase()] = { name, salt, hash, elo: 1000, wins: 0, losses: 0 };
  saveAccounts(accs);

  players[name] = { name, elo: 1000, wins: 0, losses: 0 };
  const token = makeToken();
  sessions[token] = name;
  broadcastLeaderboard();
  res.json({ ok: true, name, elo: 1000, wins: 0, losses: 0, token });
});

app.post('/login', (req, res) => {
  const { name, password } = req.body || {};
  if (!name || !password) return res.json({ error: 'Name and password required.' });

  const accs = loadAccounts();
  const acc  = accs[name.toLowerCase()];
  if (!acc)                         return res.json({ error: 'Account not found.' });
  if (hashPw(password, acc.salt) !== acc.hash) return res.json({ error: 'Incorrect password.' });

  players[acc.name] = { name: acc.name, elo: acc.elo, wins: acc.wins, losses: acc.losses };
  const token = makeToken();
  sessions[token] = acc.name;
  broadcastLeaderboard();
  res.json({ ok: true, name: acc.name, elo: acc.elo, wins: acc.wins, losses: acc.losses, token });
});

app.post('/verify_token', (req, res) => {
  const { token } = req.body || {};
  const name = sessions[token];
  if (!name) return res.json({ error: 'Session expired.' });
  const p = players[name];
  if (!p)    return res.json({ error: 'Account not found.' });
  res.json({ ok: true, name: p.name, elo: p.elo, wins: p.wins, losses: p.losses });
});

// Google OAuth
app.post('/auth/google', async (req, res) => {
  if (!googleClient) return res.json({ error: 'Google login not configured.' });
  const { credential } = req.body || {};
  if (!credential) return res.json({ error: 'No credential provided.' });
  try {
    const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: CONFIG.googleClientId });
    const payload = ticket.getPayload();
    const googleId = payload.sub;

    const accs = loadAccounts();
    // Find existing account tied to this Google ID
    let acc = Object.values(accs).find(a => a.googleId === googleId);
    if (!acc) {
      // New Google user — derive a username from their Google display name
      let base = (payload.name || 'Trainer').replace(/[^a-zA-Z0-9_]/g, '').slice(0, 14) || 'Trainer';
      if (!base) base = 'Trainer';
      let name = base, suffix = 2;
      while (accs[name.toLowerCase()]) name = base + suffix++;
      acc = { name, googleId, elo: 1000, wins: 0, losses: 0 };
      accs[name.toLowerCase()] = acc;
      saveAccounts(accs);
      players[name] = { name, elo: 1000, wins: 0, losses: 0 };
    } else {
      players[acc.name] = { name: acc.name, elo: acc.elo, wins: acc.wins, losses: acc.losses };
    }

    const token = makeToken();
    sessions[token] = acc.name;
    broadcastLeaderboard();
    res.json({ ok: true, name: acc.name, elo: acc.elo, wins: acc.wins, losses: acc.losses, token });
  } catch (e) {
    console.error('Google auth error:', e.message);
    res.json({ error: 'Google sign-in failed. Try again.' });
  }
});

// Save ELO for AI / local PvP games
app.post('/save_result', (req, res) => {
  const { token, elo, wins, losses } = req.body || {};
  const name = sessions[token];
  if (!name) return res.json({ error: 'Not authenticated.' });
  if (!players[name]) return res.json({ error: 'Player not found.' });
  players[name].elo    = Math.max(100, Math.round(elo));
  players[name].wins   = Math.max(0, Math.round(wins));
  players[name].losses = Math.max(0, Math.round(losses));
  persistPlayer(name);
  broadcastLeaderboard();
  res.json({ ok: true });
});

// ─── SOCKET LOGIC ────────────────────────────────────────────────────────────
io.on('connection', socket => {
  console.log('[+]', socket.id);

  socket.on('register', ({ name, elo }) => {
    if (!players[name]) players[name] = { name, elo: elo || 1000, wins: 0, losses: 0 };
    players[name].socketId = socket.id;
    socket.data.name = name;
    broadcastLeaderboard();
  });

  socket.on('join_queue', () => {
    const name = socket.data.name;
    if (!name) return;
    if (queue.find(p => p.socket.id === socket.id)) return;

    if (queue.length > 0) {
      const opp    = queue.shift();
      const roomId = `r_${Date.now()}`;

      rooms[roomId] = {
        players: [
          { socket: opp.socket, name: opp.name, side: 'scarlet' },
          { socket,             name,            side: 'violet'  },
        ],
        startTime: Date.now(),
      };

      opp.socket.join(roomId);
      socket.join(roomId);

      const oppElo = players[opp.name]?.elo ?? 1000;
      const myElo  = players[name]?.elo   ?? 1000;

      opp.socket.emit('match_found', { roomId, side: 'scarlet', opponent: name,     opponentElo: myElo  });
      socket.emit    ('match_found', { roomId, side: 'violet',  opponent: opp.name, opponentElo: oppElo });
      console.log(`Matched: ${opp.name} (scarlet) vs ${name} (violet) — room ${roomId}`);
    } else {
      queue.push({ socket, name });
      socket.emit('queued', { position: queue.length });
      console.log(`Queued: ${name} (#${queue.length})`);
    }
  });

  socket.on('leave_queue', () => {
    const idx = queue.findIndex(p => p.socket.id === socket.id);
    if (idx >= 0) { queue.splice(idx, 1); console.log(`Left queue: ${socket.data.name}`); }
  });

  socket.on('game_action', ({ roomId, action }) => {
    socket.to(roomId).emit('opponent_action', action);
  });

  socket.on('game_over', ({ roomId, winnerName, loserName }) => {
    const room = rooms[roomId]; if (!room) return;
    const winner = players[winnerName], loser = players[loserName];
    if (winner && loser) {
      const newWinnerElo = calcElo(winner.elo, loser.elo, 1);
      const newLoserElo  = calcElo(loser.elo,  winner.elo, 0);
      const gain = newWinnerElo - winner.elo;
      const loss = loser.elo - newLoserElo;

      winner.elo = newWinnerElo; winner.wins  += 1;
      loser.elo  = Math.max(100, newLoserElo); loser.losses += 1;

      persistPlayer(winnerName);
      persistPlayer(loserName);

      const winSock  = room.players.find(p => p.name === winnerName)?.socket;
      const loseSock = room.players.find(p => p.name === loserName)?.socket;
      if (winSock)  winSock.emit ('elo_update', { elo: newWinnerElo, delta: +gain, wins: winner.wins,  losses: winner.losses });
      if (loseSock) loseSock.emit('elo_update', { elo: newLoserElo,  delta: -loss, wins: loser.wins,   losses: loser.losses  });
    }
    delete rooms[roomId];
    broadcastLeaderboard();
  });

  socket.on('disconnect', () => {
    const qi = queue.findIndex(p => p.socket.id === socket.id);
    if (qi >= 0) queue.splice(qi, 1);
    Object.entries(rooms).forEach(([roomId, room]) => {
      if (room.players.some(p => p.socket.id === socket.id)) {
        socket.to(roomId).emit('opponent_disconnected');
        delete rooms[roomId];
      }
    });
    console.log('[-]', socket.id, socket.data.name);
    broadcastLeaderboard();
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => console.log(`\n🟡 PokéChess running → http://localhost:${PORT}\n`));
