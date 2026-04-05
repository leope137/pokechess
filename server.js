'use strict';
const express  = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const path   = require('path');
const crypto = require('crypto');
const { Pool } = require('pg');

const app  = express();
const http = createServer(app);
const io   = new Server(http, { cors: { origin: '*' } });

app.use(express.static(path.join(__dirname)));
app.use(express.json());

// ─── DATABASE ─────────────────────────────────────────────────────────────────
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('railway.internal') ? false : { rejectUnauthorized: false },
});

async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS accounts (
      key      TEXT PRIMARY KEY,
      name     TEXT NOT NULL,
      salt     TEXT,
      hash     TEXT,
      elo      INTEGER DEFAULT 1000,
      wins     INTEGER DEFAULT 0,
      losses   INTEGER DEFAULT 0
    )
  `);
}

async function dbGetAccount(key) {
  const { rows } = await pool.query('SELECT * FROM accounts WHERE key=$1', [key]);
  return rows[0] || null;
}

async function dbGetAllAccounts() {
  const { rows } = await pool.query('SELECT * FROM accounts');
  return rows;
}

async function dbSaveAccount(acc) {
  await pool.query(`
    INSERT INTO accounts (key, name, salt, hash, elo, wins, losses)
    VALUES ($1,$2,$3,$4,$5,$6,$7)
    ON CONFLICT (key) DO UPDATE SET
      name=EXCLUDED.name, salt=EXCLUDED.salt, hash=EXCLUDED.hash,
      elo=EXCLUDED.elo, wins=EXCLUDED.wins, losses=EXCLUDED.losses
  `, [acc.name.toLowerCase(), acc.name, acc.salt||null, acc.hash||null, acc.elo, acc.wins, acc.losses]);
}

async function dbUpdateStats(name, elo, wins, losses) {
  await pool.query(
    'UPDATE accounts SET elo=$1, wins=$2, losses=$3 WHERE key=$4',
    [elo, wins, losses, name.toLowerCase()]
  );
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function hashPw(password, salt) {
  return crypto.scryptSync(password, salt, 32).toString('hex');
}

const sessions = {};
const queue    = [];
const rooms    = {};
const players  = {};

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

function makeToken() { return crypto.randomBytes(24).toString('hex'); }

// ─── LEADERBOARD REST ────────────────────────────────────────────────────────
app.get('/leaderboard', (_req, res) => {
  const board = Object.values(players)
    .sort((a, b) => b.elo - a.elo)
    .slice(0, 25)
    .map(({ name, elo, wins, losses }) => ({ name, elo, wins, losses }));
  res.json(board);
});

// ─── AUTH ENDPOINTS ──────────────────────────────────────────────────────────
app.post('/register', async (req, res) => {
  const { name, password } = req.body || {};
  if (!name || !password)         return res.json({ error: 'Name and password required.' });
  if (name.length < 2 || name.length > 16) return res.json({ error: 'Name must be 2–16 characters.' });
  if (!/^[a-zA-Z0-9_]+$/.test(name))       return res.json({ error: 'Letters, numbers, underscores only.' });
  if (password.length < 4)        return res.json({ error: 'Password must be at least 4 characters.' });

  try {
    const existing = await dbGetAccount(name.toLowerCase());
    if (existing) return res.json({ error: 'Username already taken.' });

    const salt = crypto.randomBytes(16).toString('hex');
    const hash = hashPw(password, salt);
    const acc  = { name, salt, hash, elo: 1000, wins: 0, losses: 0 };
    await dbSaveAccount(acc);

    players[name] = { name, elo: 1000, wins: 0, losses: 0 };
    const token = makeToken();
    sessions[token] = name;
    broadcastLeaderboard();
    res.json({ ok: true, name, elo: 1000, wins: 0, losses: 0, token });
  } catch (e) {
    console.error('Register error:', e.message);
    res.json({ error: 'Server error. Try again.' });
  }
});

app.post('/login', async (req, res) => {
  const { name, password } = req.body || {};
  if (!name || !password) return res.json({ error: 'Name and password required.' });

  try {
    const acc = await dbGetAccount(name.toLowerCase());
    if (!acc)                                    return res.json({ error: 'Account not found.' });
    if (hashPw(password, acc.salt) !== acc.hash) return res.json({ error: 'Incorrect password.' });

    players[acc.name] = { name: acc.name, elo: acc.elo, wins: acc.wins, losses: acc.losses };
    const token = makeToken();
    sessions[token] = acc.name;
    broadcastLeaderboard();
    res.json({ ok: true, name: acc.name, elo: acc.elo, wins: acc.wins, losses: acc.losses, token });
  } catch (e) {
    console.error('Login error:', e.message);
    res.json({ error: 'Server error. Try again.' });
  }
});

app.post('/verify_token', (req, res) => {
  const { token } = req.body || {};
  const name = sessions[token];
  if (!name) return res.json({ error: 'Session expired.' });
  const p = players[name];
  if (!p)    return res.json({ error: 'Account not found.' });
  res.json({ ok: true, name: p.name, elo: p.elo, wins: p.wins, losses: p.losses });
});

app.post('/save_result', async (req, res) => {
  const { token, elo, wins, losses } = req.body || {};
  const name = sessions[token];
  if (!name)            return res.json({ error: 'Not authenticated.' });
  if (!players[name])   return res.json({ error: 'Player not found.' });

  players[name].elo    = Math.max(100, Math.round(elo));
  players[name].wins   = Math.max(0, Math.round(wins));
  players[name].losses = Math.max(0, Math.round(losses));

  try {
    await dbUpdateStats(name, players[name].elo, players[name].wins, players[name].losses);
    broadcastLeaderboard();
    res.json({ ok: true });
  } catch (e) {
    console.error('Save result error:', e.message);
    res.json({ error: 'Server error.' });
  }
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

  socket.on('game_over', async ({ roomId, winnerName, loserName }) => {
    const room = rooms[roomId]; if (!room) return;
    const winner = players[winnerName], loser = players[loserName];
    if (winner && loser) {
      const newWinnerElo = calcElo(winner.elo, loser.elo, 1);
      const newLoserElo  = calcElo(loser.elo,  winner.elo, 0);
      const gain = newWinnerElo - winner.elo;
      const loss = loser.elo - newLoserElo;

      winner.elo = newWinnerElo; winner.wins  += 1;
      loser.elo  = Math.max(100, newLoserElo); loser.losses += 1;

      try {
        await dbUpdateStats(winnerName, winner.elo, winner.wins, winner.losses);
        await dbUpdateStats(loserName,  loser.elo,  loser.wins,  loser.losses);
      } catch (e) { console.error('DB update error:', e.message); }

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

// ─── START ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;

async function start() {
  // Debug: show which DB-related env vars exist
  const dbVars = Object.keys(process.env).filter(k => k.includes('DATABASE') || k.includes('POSTGRES') || k.includes('PG'));
  console.log('DB env vars found:', dbVars);

  const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.DATABASE_PRIVATE_URL;
  if (dbUrl) process.env.DATABASE_URL = dbUrl;

  if (process.env.DATABASE_URL) {
    try {
      await initDB();
      const rows = await dbGetAllAccounts();
      rows.forEach(acc => {
        players[acc.name] = { name: acc.name, elo: acc.elo, wins: acc.wins, losses: acc.losses };
      });
      console.log(`Loaded ${rows.length} accounts from DB`);
    } catch (e) {
      console.error('DB init error:', e.message);
    }
  } else {
    console.warn('No DATABASE_URL set — accounts will not persist.');
  }
  http.listen(PORT, () => console.log(`\n🟡 PokéChess running → http://localhost:${PORT}\n`));
}

start().catch(err => { console.error('Startup error:', err); process.exit(1); });
