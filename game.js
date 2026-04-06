'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// PIECE DEFINITIONS  (verified national dex IDs via PokéAPI)
// ─────────────────────────────────────────────────────────────────────────────
const DEFS = {
  koraidon:     { name:'Koraidon',     side:'scarlet', hp:10, dmg:4, move:'legendary',    label:'KOR', legendary:true,  bikeDmg:2, bikeSide:1, bikeCdMax:3, dexId:1007 },
  miraidon:     { name:'Miraidon',     side:'violet',  hp:10, dmg:4, move:'legendary',    label:'MIR', legendary:true,  bikeDmg:2, bikeSide:1, bikeCdMax:3, dexId:1008 },
  flutter_mane: { name:'Flutter Mane', side:'scarlet', hp:7,  dmg:3, move:'leap_bishop',  label:'FLM', dexId:987,
    special:{ name:'Phantom Strike', type:'ranged', dmg:4, cd:1 } },
  iron_crown:   { name:'Iron Crown',   side:'violet',  hp:7,  dmg:3, move:'leap_bishop',  label:'ICR', dexId:1023,
    special:{ name:'Phantom Strike', type:'ranged', dmg:4, cd:1 } },
  roaring_moon: { name:'Roaring Moon', side:'scarlet', hp:9,  dmg:4, move:'queen',        label:'ROM', dexId:1005,
    special:{ name:'Dragon Breath', type:'ranged', dmg:4, cd:2 } },
  iron_jugulis: { name:'Iron Jugulis', side:'violet',  hp:9,  dmg:4, move:'queen',        label:'IJU', dexId:993,
    special:{ name:'Hyper Voice', type:'ranged', dmg:4, cd:2 } },
  scream_tail:  { name:'Scream Tail',  side:'scarlet', hp:6,  dmg:2, move:'knight',       label:'SCT', dexId:985,
    special:{ name:'Stun Aura', type:'aoe_stun', cd:3 } },
  iron_bundle:  { name:'Iron Bundle',  side:'violet',  hp:6,  dmg:2, move:'knight',       label:'IBU', dexId:991,
    special:{ name:'Freeze', type:'freeze', dmg:0, cd:3 } },                      // nerfed: dmg 2→0, cd 2→3
  raging_bolt:  { name:'Raging Bolt',  side:'scarlet', hp:9,  dmg:4, move:'rook',         label:'RGB', dexId:1021 },
  iron_boulder: { name:'Iron Boulder', side:'violet',  hp:9,  dmg:4, move:'rook',         label:'IBL', dexId:1022 },
  sandy_shocks: { name:'Sandy Shocks', side:'scarlet', hp:7,  dmg:2, move:'king',         label:'SAS', dexId:989,  pawn:true, promRow:0 },
  iron_moth:    { name:'Iron Moth',    side:'violet',  hp:7,  dmg:2, move:'king',         label:'IMO', dexId:994,  pawn:true, promRow:7 },

  // ── UNLOCKABLE PIECES ──
  walking_wake: { name:'Walking Wake', side:'scarlet', hp:8,  dmg:3, move:'leap_bishop',  label:'WAW', dexId:1009,
    special:{ name:'Hydro Pump', type:'ranged', dmg:5, cd:2 } },
  slither_wing: { name:'Slither Wing', side:'scarlet', hp:9,  dmg:4, move:'rook',         label:'SLW', dexId:988,
    special:{ name:'Hurricane', type:'ranged_stun', dmg:3, cd:3 } },
  gouging_fire: { name:'Gouging Fire', side:'scarlet', hp:8,  dmg:4, move:'knight',       label:'GOF', dexId:1020,
    special:{ name:'Inferno', type:'aoe_dmg', dmg:2, cd:3 } },
  brute_bonnet: { name:'Brute Bonnet', side:'scarlet', hp:8,  dmg:3, move:'leap_bishop',  label:'BRB', dexId:986,
    special:{ name:'Spore', type:'freeze', dmg:0, cd:4 } },

  iron_valiant: { name:'Iron Valiant', side:'violet',  hp:8,  dmg:4, move:'queen',        label:'IVA', dexId:1006,
    special:{ name:'Sacred Sword', type:'ranged', dmg:5, cd:2 } },
  iron_hands:   { name:'Iron Hands',   side:'violet',  hp:11, dmg:4, move:'rook',         label:'IHA', dexId:992  },
  iron_thorns:  { name:'Iron Thorns',  side:'violet',  hp:8,  dmg:3, move:'knight',       label:'ITH', dexId:995,
    special:{ name:'Thunder Cage', type:'ranged', dmg:4, cd:2 } },
  iron_treads:  { name:'Iron Treads',  side:'violet',  hp:9,  dmg:4, move:'leap_bishop',  label:'ITR', dexId:990  },

  // ── 1250 ELO ──
  great_tusk:  { name:'Great Tusk',   side:'scarlet', hp:11, dmg:4, move:'rook',         label:'GRT', dexId:984,
    special:{ name:'Headlong Rush', type:'ranged_stun', dmg:4, cd:3 } },
  ting_lu:     { name:'Ting-Lu',      side:'violet',  hp:12, dmg:4, move:'rook',         label:'TLU', dexId:1001,
    special:{ name:'Ruinous Shock', type:'aoe_dmg', dmg:3, cd:3 } },

  // ── 1500 ELO ──
  chi_yu:      { name:'Chi-Yu',       side:'scarlet', hp:8,  dmg:5, move:'queen',        label:'CHY', dexId:1004,
    special:{ name:'Ruinous Flame', type:'ranged', dmg:6, cd:2 } },
  iron_leaves: { name:'Iron Leaves',  side:'violet',  hp:9,  dmg:4, move:'queen',        label:'ILE', dexId:1010,
    special:{ name:'Psycho Cut', type:'ranged', dmg:5, cd:2 } },

  // ── 1750 ELO ──
  glimmora:    { name:'Glimmora',     side:'scarlet', hp:9,  dmg:4, move:'leap_bishop',  label:'GLM', dexId:970,
    special:{ name:'Mortal Spin', type:'aoe_dmg', dmg:3, cd:2 } },
  chien_pao:   { name:'Chien-Pao',    side:'violet',  hp:8,  dmg:5, move:'leap_bishop',  label:'CHP', dexId:1002,
    special:{ name:'Ruinous Ice', type:'ranged_stun', dmg:5, cd:3 } },

  // ── 2000 ELO ──
  salamence:   { name:'Salamence',    side:'scarlet', hp:10, dmg:5, move:'queen',        label:'SAL', dexId:373,
    special:{ name:'Outrage', type:'aoe_dmg', dmg:4, cd:4 } },
  hydreigon:   { name:'Hydreigon',    side:'violet',  hp:9,  dmg:5, move:'queen',        label:'HYD', dexId:635,
    special:{ name:'Hyper Voice', type:'aoe_dmg', dmg:4, cd:4 } },

  // ── EXTRA UNLOCKABLES ──
  armarouge:   { name:'Armarouge',    side:'scarlet', hp:8,  dmg:2, move:'king',         label:'ARR', dexId:968,  pawn:true, promRow:0,
    special:{ name:'Armor Cannon', type:'ranged', dmg:4, cd:2 } },
  annihilape:  { name:'Annihilape',   side:'scarlet', hp:8,  dmg:3, move:'knight',       label:'ANH', dexId:979,
    special:{ name:'Rage Fist', type:'ranged', dmg:4, cd:2 } },
  meowscarada: { name:'Meowscarada',  side:'scarlet', hp:7,  dmg:4, move:'queen',        label:'MEW', dexId:908,
    special:{ name:'Flower Trick', type:'ranged', dmg:4, cd:1 } },
  tinkaton:    { name:'Tinkaton',     side:'scarlet', hp:10, dmg:3, move:'rook',         label:'TIN', dexId:959,
    special:{ name:'Gigaton Hammer', type:'ranged_stun', dmg:5, cd:3 } },

  ceruledge:   { name:'Ceruledge',    side:'violet',  hp:7,  dmg:3, move:'king',         label:'CER', dexId:969,  pawn:true, promRow:7,
    special:{ name:'Bitter Blade', type:'ranged', dmg:4, cd:2 } },
  skeledirge:  { name:'Skeledirge',   side:'violet',  hp:9,  dmg:3, move:'leap_bishop',  label:'SKD', dexId:911,
    special:{ name:'Torch Song', type:'ranged', dmg:4, cd:2 } },
  pawmot:      { name:'Pawmot',       side:'violet',  hp:7,  dmg:3, move:'knight',       label:'PAW', dexId:923,
    special:{ name:'Revival Blessing', type:'aoe_stun', cd:4 } },
  palafin:     { name:'Palafin',      side:'violet',  hp:10, dmg:4, move:'rook',         label:'PAL', dexId:964,
    special:{ name:'Jet Punch', type:'ranged', dmg:3, cd:1 } },
  veluza:      { name:'Veluza',       side:'violet',  hp:7,  dmg:4, move:'queen',        label:'VEL', dexId:976,
    special:{ name:'Fillet Away', type:'ranged', dmg:5, cd:2 } },
};

const PVAL       = { legendary:100, queen:9, leap_bishop:6, rook:6, knight:5, king:2 };
const AI_ELO_MAP = { 1:400, 2:550, 3:700, 4:850, 5:1000, 6:1150, 7:1350, 8:1550, 9:1800, 10:2200 };
const TIMES      = { short:600, medium:1500, long:2700 };
const TOKEN_KEY  = 'pokechess_token';

const START = [
  ['iron_boulder','iron_bundle','iron_jugulis','iron_crown','miraidon','iron_jugulis','iron_bundle','iron_boulder'],
  Array(8).fill('iron_moth'),
  null,null,null,null,
  Array(8).fill('sandy_shocks'),
  ['raging_bolt','scream_tail','roaring_moon','flutter_mane','koraidon','roaring_moon','scream_tail','raging_bolt'],
];

// Which pieces can be unlocked, at what ELO, and which slot they replace
const UNLOCK_POOL = [
  // ── PAWN ──
  { type:'armarouge',    side:'scarlet', slot:'pawn',   eloReq:150  },
  { type:'ceruledge',    side:'violet',  slot:'pawn',   eloReq:150  },
  // ── QUEEN ──
  { type:'meowscarada',  side:'scarlet', slot:'queen',  eloReq:250  },
  { type:'iron_valiant', side:'violet',  slot:'queen',  eloReq:250  },
  { type:'chi_yu',       side:'scarlet', slot:'queen',  eloReq:1000 },
  { type:'veluza',       side:'violet',  slot:'queen',  eloReq:600  },
  { type:'iron_leaves',  side:'violet',  slot:'queen',  eloReq:1500 },
  { type:'salamence',    side:'scarlet', slot:'queen',  eloReq:2000 },
  { type:'hydreigon',    side:'violet',  slot:'queen',  eloReq:2000 },
  // ── BISHOP ──
  { type:'walking_wake', side:'scarlet', slot:'bishop', eloReq:250  },
  { type:'skeledirge',   side:'violet',  slot:'bishop', eloReq:350  },
  { type:'brute_bonnet', side:'scarlet', slot:'bishop', eloReq:750  },
  { type:'chien_pao',    side:'violet',  slot:'bishop', eloReq:1000 },
  { type:'glimmora',     side:'scarlet', slot:'bishop', eloReq:1500 },
  { type:'iron_treads',  side:'violet',  slot:'bishop', eloReq:1750 },
  // ── ROOK ──
  { type:'slither_wing', side:'scarlet', slot:'rook',   eloReq:500  },
  { type:'iron_hands',   side:'violet',  slot:'rook',   eloReq:500  },
  { type:'tinkaton',     side:'scarlet', slot:'rook',   eloReq:900  },
  { type:'palafin',      side:'violet',  slot:'rook',   eloReq:900  },
  { type:'great_tusk',   side:'scarlet', slot:'rook',   eloReq:1250 },
  { type:'ting_lu',      side:'violet',  slot:'rook',   eloReq:1250 },
  // ── KNIGHT ──
  { type:'annihilape',   side:'scarlet', slot:'knight', eloReq:350  },
  { type:'pawmot',       side:'violet',  slot:'knight', eloReq:350  },
  { type:'gouging_fire', side:'scarlet', slot:'knight', eloReq:750  },
  { type:'iron_thorns',  side:'violet',  slot:'knight', eloReq:750  },
];

const DEFAULT_TEAM = {
  scarlet:{ queen:'roaring_moon', bishop:'flutter_mane', knight:'scream_tail', rook:'raging_bolt', pawn:'sandy_shocks' },
  violet: { queen:'iron_jugulis', bishop:'iron_crown',   knight:'iron_bundle', rook:'iron_boulder', pawn:'iron_moth'   },
};

// Bot loadouts per difficulty tier — violet team only, ELO validation bypassed
const BOT_LOADOUTS = {
  Rookie: [
    { queen:'iron_jugulis', bishop:'iron_crown',   knight:'iron_bundle', rook:'iron_boulder', pawn:'iron_moth'   },
    { queen:'iron_valiant', bishop:'iron_crown',   knight:'iron_bundle', rook:'iron_boulder', pawn:'iron_moth'   },
  ],
  Trainer: [
    { queen:'iron_valiant', bishop:'skeledirge',   knight:'pawmot',      rook:'iron_boulder', pawn:'ceruledge'   },
    { queen:'veluza',       bishop:'iron_crown',   knight:'pawmot',      rook:'iron_hands',   pawn:'ceruledge'   },
    { queen:'iron_jugulis', bishop:'skeledirge',   knight:'iron_thorns', rook:'iron_boulder', pawn:'iron_moth'   },
  ],
  Veteran: [
    { queen:'veluza',       bishop:'chien_pao',    knight:'iron_thorns', rook:'palafin',      pawn:'ceruledge'   },
    { queen:'iron_valiant', bishop:'chien_pao',    knight:'pawmot',      rook:'ting_lu',      pawn:'ceruledge'   },
    { queen:'iron_leaves',  bishop:'skeledirge',   knight:'iron_thorns', rook:'iron_hands',   pawn:'ceruledge'   },
  ],
  Champion: [
    { queen:'iron_leaves',  bishop:'iron_treads',  knight:'iron_thorns', rook:'ting_lu',      pawn:'ceruledge'   },
    { queen:'hydreigon',    bishop:'chien_pao',    knight:'iron_thorns', rook:'palafin',      pawn:'ceruledge'   },
    { queen:'iron_leaves',  bishop:'chien_pao',    knight:'iron_thorns', rook:'ting_lu',      pawn:'ceruledge'   },
  ],
  Paradox: [
    { queen:'hydreigon',    bishop:'iron_treads',  knight:'iron_thorns', rook:'ting_lu',      pawn:'ceruledge'   },
    { queen:'hydreigon',    bishop:'chien_pao',    knight:'iron_thorns', rook:'ting_lu',      pawn:'ceruledge'   },
  ],
};

function getBotLoadout(tier){
  const opts=BOT_LOADOUTS[tier]||BOT_LOADOUTS.Rookie;
  return opts[Math.floor(Math.random()*opts.length)];
}

function buildStart(team={}, botViolet=null) {
  const elo=ACCOUNT?.elo||0;
  const unlockedTypes=new Set(UNLOCK_POOL.filter(u=>elo>=u.eloReq).map(u=>u.type));
  function safeSlot(side,slot,val,skipLock=false){
    const def=DEFAULT_TEAM[side][slot];
    if(!val||val===def)return def;
    const entry=UNLOCK_POOL.find(u=>u.type===val&&u.side===side&&u.slot===slot);
    if(!entry)return def;
    return (skipLock||unlockedTypes.has(val))?val:def;
  }
  const raw_s=Object.assign({},DEFAULT_TEAM.scarlet,team.scarlet||{});
  const raw_v=botViolet||Object.assign({},DEFAULT_TEAM.violet,team.violet||{});
  const skipV=!!botViolet;
  const s={
    queen: safeSlot('scarlet','queen', raw_s.queen),
    rook:  safeSlot('scarlet','rook',  raw_s.rook),
    knight:safeSlot('scarlet','knight',raw_s.knight),
    bishop:safeSlot('scarlet','bishop',raw_s.bishop),
    pawn:  safeSlot('scarlet','pawn',  raw_s.pawn),
  };
  const v={
    queen: safeSlot('violet','queen', raw_v.queen, skipV),
    rook:  safeSlot('violet','rook',  raw_v.rook,  skipV),
    knight:safeSlot('violet','knight',raw_v.knight,skipV),
    bishop:safeSlot('violet','bishop',raw_v.bishop,skipV),
    pawn:  safeSlot('violet','pawn',  raw_v.pawn,  skipV),
  };
  return [
    [v.rook,v.knight,v.bishop,v.queen,'miraidon',v.bishop,v.knight,v.rook],
    Array(8).fill(v.pawn),
    null,null,null,null,
    Array(8).fill(s.pawn),
    [s.rook,s.knight,s.bishop,s.queen,'koraidon',s.bishop,s.knight,s.rook],
  ];
}

const spriteUrl = t =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${DEFS[t].dexId}.png`;

// ─────────────────────────────────────────────────────────────────────────────
// SOUND EFFECTS  (Web Audio API — no external files)
// ─────────────────────────────────────────────────────────────────────────────
const SFX = (() => {
  let ctx = null;
  let muted = false;

  function ac() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone(freq, type, dur, vol, delay = 0, freqEnd = null) {
    if (muted) return;
    try {
      const c = ac(), t = c.currentTime + delay;
      const osc = c.createOscillator(), g = c.createGain();
      osc.connect(g); g.connect(c.destination);
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t);
      if (freqEnd) osc.frequency.exponentialRampToValueAtTime(freqEnd, t + dur);
      g.gain.setValueAtTime(vol, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      osc.start(t); osc.stop(t + dur + 0.02);
    } catch(e) {}
  }

  function noise(dur, vol, delay = 0) {
    if (muted) return;
    try {
      const c = ac(), t = c.currentTime + delay;
      const sr = c.sampleRate, buf = c.createBuffer(1, sr * dur, sr);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      const src = c.createBufferSource(), g = c.createGain();
      src.buffer = buf; src.connect(g); g.connect(c.destination);
      g.gain.setValueAtTime(vol, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      src.start(t); src.stop(t + dur + 0.02);
    } catch(e) {}
  }

  return {
    toggle() { muted = !muted; return muted; },
    isMuted() { return muted; },

    select()      { tone(900, 'sine', 0.07, 0.12); tone(1200, 'sine', 0.05, 0.08, 0.04); },
    move()        { tone(320, 'sine', 0.10, 0.10); tone(480, 'sine', 0.07, 0.07, 0.06); },
    attack()      { noise(0.07, 0.22); tone(140, 'sawtooth', 0.14, 0.20); tone(75, 'sine', 0.18, 0.14, 0.06); },
    death()       { tone(220, 'sawtooth', 0.28, 0.18); tone(110, 'sine', 0.38, 0.14, 0.08); noise(0.09, 0.08); },
    hit()         { noise(0.05, 0.12); tone(200, 'sine', 0.08, 0.10); },
    special()     { tone(660, 'sine', 0.14, 0.13); tone(990, 'sine', 0.11, 0.10, 0.08); tone(1320, 'sine', 0.09, 0.08, 0.16); },
    rangedStun()  { tone(440, 'square', 0.05, 0.14); tone(880, 'square', 0.05, 0.10, 0.05); tone(220, 'square', 0.10, 0.09, 0.08); noise(0.06, 0.10, 0.04); },
    freeze()      { tone(1600, 'sine', 0.10, 0.10); tone(2100, 'sine', 0.08, 0.08, 0.05); tone(1000, 'sine', 0.12, 0.06, 0.09); },
    aoe()         { noise(0.14, 0.28); tone(95, 'sawtooth', 0.32, 0.24); tone(55, 'sine', 0.38, 0.18, 0.06); },
    aoeStun()     { tone(380, 'square', 0.05, 0.14); tone(760, 'square', 0.05, 0.11, 0.04); tone(190, 'square', 0.12, 0.09, 0.07); noise(0.06, 0.12, 0.03); },
    promote()     { [523, 659, 784, 1047].forEach((f, i) => tone(f, 'sine', 0.22, 0.16, i * 0.10)); },
    bike()        { tone(180, 'sawtooth', 0.38, 0.14, 0, 520); tone(320, 'square', 0.28, 0.09, 0.12); },
    bikeCharge()  { noise(0.18, 0.22); tone(130, 'sawtooth', 0.28, 0.22); tone(90, 'sine', 0.32, 0.18, 0.10); },
    win()         { [[523,0],[659,0.12],[784,0.24],[1047,0.36],[784,0.50],[1047,0.60]].forEach(([f,t])=>tone(f,'sine',0.20,0.17,t)); },
    lose()        { [[380,0],[280,0.22],[190,0.44],[140,0.68]].forEach(([f,t])=>tone(f,'sine',0.28,0.14,t)); },
    turnTick()    { tone(440, 'sine', 0.05, 0.07); },
  };
})();

// ─────────────────────────────────────────────────────────────────────────────
// GLOBAL STATE
// ─────────────────────────────────────────────────────────────────────────────
let G = {};
let socket = null;
let ACCOUNT = null;  // persists across game resets — never wiped by startGame()
let _pendingTeam = null; // pending team customizer state across re-renders

// ─────────────────────────────────────────────────────────────────────────────
// BOARD
// ─────────────────────────────────────────────────────────────────────────────
const mkPiece = t => {
  const d = DEFS[t];
  return { type:t, side:d.side, hp:d.hp, maxHp:d.hp, dmg:d.dmg,
           spCd:0, status:null, stTurns:0, bike:false, bikeTr:false, bikeCd:0 };
};

function initBoard(team={}, botViolet=null) {
  const b = Array.from({length:8},()=>Array(8).fill(null));
  buildStart(team, botViolet).forEach((row,r)=>{ if(row) row.forEach((t,c)=>{ b[r][c]=mkPiece(t); }); });
  return b;
}

// ─────────────────────────────────────────────────────────────────────────────
// MOVEMENT
// ─────────────────────────────────────────────────────────────────────────────
const OB = (r,c) => r>=0&&r<8&&c>=0&&c<8;

function slideRay(r,c,p,b,dirs) {
  const mv=[];
  for(const [dr,dc] of dirs){
    let nr=r+dr,nc=c+dc;
    while(OB(nr,nc)){
      const t=b[nr][nc];
      if(t){if(t.side!==p.side)mv.push({row:nr,col:nc,type:'attack'});break;}
      mv.push({row:nr,col:nc,type:'move'});
      nr+=dr;nc+=dc;
    }
  }
  return mv;
}

const rookMoves   = (r,c,p,b) => slideRay(r,c,p,b,[[-1,0],[1,0],[0,-1],[0,1]]);
const bishopMoves = (r,c,p,b) => slideRay(r,c,p,b,[[-1,-1],[-1,1],[1,-1],[1,1]]);

function knightMoves(r,c,p,b){
  const mv=[];
  for(const [dr,dc] of [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]]){
    const nr=r+dr,nc=c+dc;
    if(!OB(nr,nc))continue;
    const t=b[nr][nc];
    if(!t)mv.push({row:nr,col:nc,type:'move'});
    else if(t.side!==p.side)mv.push({row:nr,col:nc,type:'attack'});
  }
  return mv;
}

function kingMoves(r,c,p,b){
  const mv=[];
  for(let dr=-1;dr<=1;dr++) for(let dc=-1;dc<=1;dc++){
    if(!dr&&!dc)continue;
    const nr=r+dr,nc=c+dc;
    if(!OB(nr,nc))continue;
    const t=b[nr][nc];
    if(!t)mv.push({row:nr,col:nc,type:'move'});
    else if(t.side!==p.side)mv.push({row:nr,col:nc,type:'attack'});
  }
  return mv;
}

function leapBishopMoves(r,c,p,b){
  const mv=[];
  for(const [dr,dc] of [[-1,-1],[-1,1],[1,-1],[1,1]]){
    let nr=r+dr,nc=c+dc,jumped=false;
    while(OB(nr,nc)){
      const t=b[nr][nc];
      if(t){if(!jumped&&t.side!==p.side)mv.push({row:nr,col:nc,type:'attack'});jumped=true;}
      else mv.push({row:nr,col:nc,type:'move'});
      nr+=dr;nc+=dc;
    }
  }
  return mv;
}

function bikeMoves(r,c,p,b){
  const mv=[];
  for(const [dr,dc] of [[-1,0],[1,0],[0,-1],[0,1]]){
    let nr=r+dr,nc=c+dc,last=null;
    while(OB(nr,nc)){
      const t=b[nr][nc];
      if(t&&t.side===p.side)break;
      last={row:nr,col:nc};
      nr+=dr;nc+=dc;
    }
    if(last)mv.push({...last,type:'bike_charge',dr,dc});
  }
  return mv;
}

const legendaryMoves = (r,c,p,b) =>
  p.bike ? bikeMoves(r,c,p,b)
         : [...rookMoves(r,c,p,b),...bishopMoves(r,c,p,b),...knightMoves(r,c,p,b)];

function getLegalMoves(r,c,b){
  const p=b[r][c];
  if(!p||p.status==='stunned'||p.status==='frozen'||p.bikeTr)return[];
  switch(DEFS[p.type].move){
    case 'king':        return kingMoves(r,c,p,b);
    case 'leap_bishop': return leapBishopMoves(r,c,p,b);
    case 'knight':      return knightMoves(r,c,p,b);
    case 'queen':       return [...rookMoves(r,c,p,b),...bishopMoves(r,c,p,b)];
    case 'rook':        return rookMoves(r,c,p,b);
    case 'legendary':   return legendaryMoves(r,c,p,b);
    default:            return[];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SPECIALS
// ─────────────────────────────────────────────────────────────────────────────
function getSpecialTargets(r,c,p,b){
  const d=DEFS[p.type];
  if(!d.special||p.spCd>0)return[];
  const tgts=[];
  if(d.special.type==='ranged'||d.special.type==='freeze'||d.special.type==='ranged_stun'){
    for(let dr=-1;dr<=1;dr++) for(let dc=-1;dc<=1;dc++){
      if(!dr&&!dc)continue;
      const nr=r+dr,nc=c+dc;
      if(!OB(nr,nc))continue;
      const t=b[nr][nc];
      if(t&&t.side!==p.side)tgts.push({row:nr,col:nc,type:'special'});
    }
  }else if(d.special.type==='aoe_stun'||d.special.type==='aoe_dmg'){
    tgts.push({row:r,col:c,type:'special_self'});
  }
  return tgts;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMBAT
// ─────────────────────────────────────────────────────────────────────────────
function hit(piece,r,c,amt){
  if(!piece||G.over)return;
  piece.hp=Math.max(0,piece.hp-amt);
  if(piece.hp<=0){
    G.board[r][c]=null;
    addLog(`${DEFS[piece.type].name} was defeated!`);
    SFX.death();
    if(DEFS[piece.type].legendary)endGame(piece.side==='scarlet'?'Violet':'Scarlet');
  } else {
    SFX.hit();
  }
}

function checkPromotion(r,c,p){
  const d=DEFS[p.type];
  if(!d.pawn||r!==d.promRow||p.promoted)return;
  p.promoted=true;p.maxHp+=2;p.hp=p.maxHp;p.dmg+=1;
  addLog(`${d.name} promoted! Max HP +2, HP restored, DMG +1!`);
  SFX.promote();
  flashCell(r,c,'anim-promo');
  spawnEffect(getCellCenter(r,c),'promote',30);
}

// ─────────────────────────────────────────────────────────────────────────────
// EXECUTE ACTIONS
// ─────────────────────────────────────────────────────────────────────────────
function doMove(fr,fc,tr,tc,mv){
  if(G.over)return;
  if(mv.type==='bike_charge'){doBike(fr,fc,mv);return;}
  const p=G.board[fr][fc];
  if(mv.type==='attack'){
    const tgt=G.board[tr][tc];
    const bigHit=p.dmg>=4;
    SFX.attack();
    hit(tgt,tr,tc,p.dmg);
    if(G.over)return;
    if(!G.board[tr][tc]){G.board[tr][tc]=p;G.board[fr][fc]=null;checkPromotion(tr,tc,p);}
    if(bigHit)triggerShake();
  }else{
    SFX.move();
    G.board[tr][tc]=p;G.board[fr][fc]=null;checkPromotion(tr,tc,p);
  }
}

function doBike(fr,fc,mv){
  if(G.over)return;
  const p=G.board[fr][fc],d=DEFS[p.type];
  const{dr,dc}=mv;
  const perp=dr===0?[[-1,0],[1,0]]:[[0,-1],[0,1]];
  let lastEmpty=null,r=fr+dr,c=fc+dc;
  while(OB(r,c)){
    const t=G.board[r][c];
    if(t&&t.side===p.side)break;
    if(t){hit(t,r,c,d.bikeDmg);if(G.over)return;if(!G.board[r][c])lastEmpty={r,c};}
    else lastEmpty={r,c};
    for(const[pr,pc]of perp){
      const sr=r+pr,sc=c+pc;
      if(!OB(sr,sc))continue;
      const st=G.board[sr][sc];
      if(st&&st.side!==p.side){hit(st,sr,sc,d.bikeSide);if(G.over)return;}
    }
    r+=dr;c+=dc;
  }
  const land=lastEmpty||{r:fr,c:fc};
  G.board[fr][fc]=null;G.board[land.r][land.c]=p;
  p.bike=false;p.bikeCd=d.bikeCdMax;
  addLog(`${d.name} bike charge complete!`);
  SFX.bikeCharge();
  triggerShake();
}

function doSpecial(fr,fc,tr,tc){
  if(G.over)return;
  const p=G.board[fr][fc],d=DEFS[p.type],spec=d.special;
  if(spec.type==='ranged'){
    const tgt=G.board[tr][tc];
    if(tgt){SFX.special();addLog(`${d.name} → ${spec.name} on ${DEFS[tgt.type].name} for ${spec.dmg} dmg!`);hit(tgt,tr,tc,spec.dmg);}
  }else if(spec.type==='ranged_stun'){
    const tgt=G.board[tr][tc];
    if(tgt){
      SFX.rangedStun();
      addLog(`${d.name} → ${spec.name} on ${DEFS[tgt.type].name} for ${spec.dmg} dmg!`);
      hit(tgt,tr,tc,spec.dmg);
      if(!G.over&&G.board[tr][tc]){tgt.status='stunned';tgt.stTurns=1;}
    }
  }else if(spec.type==='aoe_dmg'){
    SFX.aoe();
    let n=0;
    for(let dr=-1;dr<=1;dr++) for(let dc=-1;dc<=1;dc++){
      if(!dr&&!dc)continue;
      const nr=fr+dr,nc=fc+dc;
      if(!OB(nr,nc))continue;
      const t=G.board[nr][nc];
      if(t&&t.side!==p.side){n++;hit(t,nr,nc,spec.dmg);if(G.over)return;}
    }
    addLog(`${d.name} → ${spec.name}! Hit ${n} enemies for ${spec.dmg} dmg each!`);
  }else if(spec.type==='aoe_stun'){
    SFX.aoeStun();
    let n=0;
    for(let dr=-1;dr<=1;dr++) for(let dc=-1;dc<=1;dc++){
      if(!dr&&!dc)continue;
      const nr=fr+dr,nc=fc+dc;
      if(!OB(nr,nc))continue;
      const t=G.board[nr][nc];
      if(t){t.status='stunned';t.stTurns=1;n++;}
    }
    addLog(`${d.name} → ${spec.name}! ${n} piece${n===1?'':'s'} stunned (including allies)!`);
  }else if(spec.type==='freeze'){
    const tgt=G.board[tr][tc];
    if(tgt){
      SFX.freeze();
      if(spec.dmg>0){addLog(`${d.name} → ${spec.name} on ${DEFS[tgt.type].name}!`);hit(tgt,tr,tc,spec.dmg);}
      if(!G.over&&G.board[tr][tc]){tgt.status='frozen';tgt.stTurns=1;addLog(`${DEFS[tgt.type].name} is frozen!`);}
      else if(!G.over)addLog(`${d.name} → ${spec.name} on ${DEFS[tgt.type].name}!`);
    }
  }
  p.spCd=spec.cd;
  playSpecialFX(fr,fc,tr,tc,spec);
}

// ─────────────────────────────────────────────────────────────────────────────
// TURN
// ─────────────────────────────────────────────────────────────────────────────
function endTurn(){
  if(G.over)return;
  const cur=G.currentTurn;
  for(let r=0;r<8;r++) for(let c=0;c<8;c++){
    const p=G.board[r][c];
    if(!p||p.side!==cur)continue;
    if(p.spCd>0)p.spCd--;
    if(p.bikeCd>0)p.bikeCd--;
    if(p.bikeTr){p.bikeTr=false;p.bike=true;addLog(`${DEFS[p.type].name} → Bike Mode!`);}
    if(p.status&&p.stTurns>0){p.stTurns--;if(p.stTurns<=0)p.status=null;}
  }
  G.currentTurn=cur==='scarlet'?'violet':'scarlet';
  G.sel=null;G.legalMoves=[];G.specMode=false;G.specTargets=[];G.animPending=false;
  if(G.mode==='ai'&&G.currentTurn==='violet')setTimeout(aiTurn,520);
  render();updateUI();
}

// ─────────────────────────────────────────────────────────────────────────────
// TIMER
// ─────────────────────────────────────────────────────────────────────────────
function tickTimer(){
  if(G.over)return;
  G.timers[G.currentTurn]--;
  if(G.timers[G.currentTurn]<=0){
    addLog(`${G.currentTurn==='scarlet'?'Scarlet':'Violet'} ran out of time!`);
    endGame(G.currentTurn==='scarlet'?'Violet':'Scarlet');return;
  }
  updateTimers();
}
const fmt=s=>`${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;

// ─────────────────────────────────────────────────────────────────────────────
// AI — MINIMAX + ALPHA-BETA
// ─────────────────────────────────────────────────────────────────────────────
const cloneBoard=b=>b.map(row=>row.map(p=>p?{...p}:null));

function simMove(b,fr,fc,mv){
  const nb=cloneBoard(b),p=nb[fr][fc];
  if(!p)return nb;
  const d=DEFS[p.type];
  if(mv.type==='attack'){
    const tgt=nb[mv.row][mv.col];
    if(tgt){
      tgt.hp-=p.dmg;
      if(tgt.hp<=0){nb[mv.row][mv.col]={...p};nb[fr][fc]=null;
        if(d.pawn&&mv.row===d.promRow&&!p.promoted){nb[mv.row][mv.col].promoted=true;nb[mv.row][mv.col].maxHp+=2;nb[mv.row][mv.col].hp=nb[mv.row][mv.col].maxHp;nb[mv.row][mv.col].dmg+=1;}}
    }
  }else if(mv.type==='move'){
    nb[mv.row][mv.col]={...p};nb[fr][fc]=null;
    if(d.pawn&&mv.row===d.promRow&&!p.promoted){nb[mv.row][mv.col].promoted=true;nb[mv.row][mv.col].maxHp+=2;nb[mv.row][mv.col].hp=nb[mv.row][mv.col].maxHp;nb[mv.row][mv.col].dmg+=1;}
  }else if(mv.type==='bike_charge'){
    const{dr,dc}=mv;let r=fr+dr,c=fc+dc,last=null;
    while(r>=0&&r<8&&c>=0&&c<8){
      const t=nb[r][c];if(t&&t.side===p.side)break;
      if(t){t.hp-=d.bikeDmg;if(t.hp<=0){nb[r][c]=null;last={r,c};}}else last={r,c};
      r+=dr;c+=dc;
    }
    if(last){nb[fr][fc]=null;nb[last.r][last.c]={...p,bike:false,bikeCd:d.bikeCdMax};}
  }
  return nb;
}

function simSpecial(b,fr,fc,tr,tc){
  const nb=cloneBoard(b),p=nb[fr][fc];
  if(!p)return nb;
  const d=DEFS[p.type],spec=d.special;if(!spec)return nb;
  if((spec.type==='ranged'||spec.type==='freeze'||spec.type==='ranged_stun')&&nb[tr][tc]){
    if(spec.dmg>0){nb[tr][tc].hp-=spec.dmg;if(nb[tr][tc].hp<=0)nb[tr][tc]=null;}
    if(spec.type==='freeze'&&nb[tr][tc]){nb[tr][tc].status='frozen';nb[tr][tc].stTurns=1;}
    if(spec.type==='ranged_stun'&&nb[tr][tc]){nb[tr][tc].status='stunned';nb[tr][tc].stTurns=1;}
  }else if(spec.type==='aoe_dmg'){
    for(let dr=-1;dr<=1;dr++) for(let dc=-1;dc<=1;dc++){
      if(!dr&&!dc)continue;const nr=fr+dr,nc=fc+dc;
      if(nr>=0&&nr<8&&nc>=0&&nc<8&&nb[nr][nc]&&nb[nr][nc].side!==p.side){nb[nr][nc].hp-=spec.dmg;if(nb[nr][nc].hp<=0)nb[nr][nc]=null;}
    }
  }else if(spec.type==='aoe_stun'){
    for(let dr=-1;dr<=1;dr++) for(let dc=-1;dc<=1;dc++){
      if(!dr&&!dc)continue;const nr=fr+dr,nc=fc+dc;
      if(nr>=0&&nr<8&&nc>=0&&nc<8&&nb[nr][nc]){nb[nr][nc].status='stunned';nb[nr][nc].stTurns=1;}
    }
  }
  if(nb[fr][fc])nb[fr][fc].spCd=spec.cd;
  return nb;
}

function evaluate(b){
  let score=0,scarletLeg=false,violetLeg=false;
  for(let r=0;r<8;r++) for(let c=0;c<8;c++){
    const p=b[r][c];if(!p)continue;
    const d=DEFS[p.type];
    if(d.legendary){if(p.side==='scarlet')scarletLeg=true;else violetLeg=true;}
    let val=(PVAL[d.move]||2)*90*(p.hp/p.maxHp);
    if(d.legendary)val+=p.hp*40;
    if(!d.legendary){if(p.side==='violet')val+=r*3;else val+=(7-r)*3;}
    val+=(3.5-Math.abs(c-3.5))*1.5;
    if(p.status)val*=0.6;
    if(p.side==='violet')score+=val;else score-=val;
  }
  if(!scarletLeg)return 999999;if(!violetLeg)return -999999;
  return score;
}

function getAIMoves(side,b){
  const moves=[];
  for(let r=0;r<8;r++) for(let c=0;c<8;c++){
    const p=b[r][c];if(!p||p.side!==side)continue;
    const d=DEFS[p.type];
    getLegalMoves(r,c,b).forEach(mv=>{
      let pri=0;
      if(mv.type==='attack'){const t=b[mv.row][mv.col];if(t){pri=(PVAL[DEFS[t.type].move]||2)*20+(t.maxHp-t.hp)*2;if(DEFS[t.type].legendary)pri+=1000;}}
      else if(mv.type==='bike_charge')pri=30;
      moves.push({fr:r,fc:c,mv,kind:'move',pri});
    });
    if(d.special&&p.spCd===0){
      getSpecialTargets(r,c,p,b).forEach(t=>{
        let pri=20;
        if(t.type!=='special_self'&&b[t.row]&&b[t.row][t.col]){const tgt=b[t.row][t.col];pri+=(PVAL[DEFS[tgt.type].move]||2)*15;if(DEFS[tgt.type].legendary)pri+=800;}
        else if(t.type==='special_self'){let n=0;for(let dr=-1;dr<=1;dr++) for(let dc=-1;dc<=1;dc++){if(!dr&&!dc)continue;if(OB(r+dr,c+dc)&&b[r+dr][c+dc]&&b[r+dr][c+dc].side!==side)n++;}pri=n*30;}
        moves.push({fr:r,fc:c,mv:t,kind:'special',tr:t.row,tc:t.col,pri});
      });
    }
  }
  moves.sort((a,b)=>b.pri-a.pri);
  return moves;
}

function minimax(b,depth,alpha,beta,maximizing){
  const ev=evaluate(b);
  if(Math.abs(ev)>=999990||depth===0)return ev;
  const side=maximizing?'violet':'scarlet';
  const moves=getAIMoves(side,b);
  if(moves.length===0)return maximizing?-900000:900000;
  if(maximizing){
    let best=-Infinity;
    for(const m of moves){
      const nb=m.kind==='special'?simSpecial(b,m.fr,m.fc,m.tr,m.tc):simMove(b,m.fr,m.fc,m.mv);
      best=Math.max(best,minimax(nb,depth-1,alpha,beta,false));
      alpha=Math.max(alpha,best);if(beta<=alpha)break;
    }
    return best;
  }else{
    let best=Infinity;
    for(const m of moves){
      const nb=m.kind==='special'?simSpecial(b,m.fr,m.fc,m.tr,m.tc):simMove(b,m.fr,m.fc,m.mv);
      best=Math.min(best,minimax(nb,depth-1,alpha,beta,true));
      beta=Math.min(beta,best);if(beta<=alpha)break;
    }
    return best;
  }
}

function getDiffTier(d){
  return d<=2?'Rookie':d<=4?'Trainer':d<=6?'Veteran':d<=8?'Champion':'Paradox';
}

const TIER_PARAMS={
  Rookie:   {depth:1, noise:3500, randChance:0.58, skipSpec:0.72},
  Trainer:  {depth:1, noise:950,  randChance:0.28, skipSpec:0.45},
  Veteran:  {depth:2, noise:175,  randChance:0.07, skipSpec:0.14},
  Champion: {depth:3, noise:40,   randChance:0.00, skipSpec:0.03},
  Paradox:  {depth:3, noise:7,    randChance:0.00, skipSpec:0.00},
};

function aiTurn(){
  if(G.over)return;
  const tier=getDiffTier(G.difficulty);
  const{depth,noise,randChance,skipSpec}=TIER_PARAMS[tier];

  const all=getAIMoves('violet',G.board);
  if(!all.length){endTurn();return;}

  // Filter specials based on difficulty
  const moves=(Math.random()<skipSpec&&all.filter(m=>m.kind!=='special').length)
    ?all.filter(m=>m.kind!=='special'):all;

  let bestMove;
  if(Math.random()<randChance){
    // Low difficulties: prefer aimless non-capture moves to feel dumb
    const aimless=moves.filter(m=>m.kind==='move'&&m.mv.type==='move');
    const pool=aimless.length&&Math.random()<0.65?aimless:moves;
    bestMove=pool[Math.floor(Math.random()*pool.length)];
  }else{
    let bestScore=-Infinity;
    bestMove=moves[0];
    for(const m of moves){
      const nb=m.kind==='special'?simSpecial(G.board,m.fr,m.fc,m.tr,m.tc):simMove(G.board,m.fr,m.fc,m.mv);
      const score=minimax(nb,depth-1,-Infinity,Infinity,false)+(Math.random()-0.3)*noise;
      if(score>bestScore){bestScore=score;bestMove=m;}
    }
  }

  let afr=bestMove.fr,afc=bestMove.fc,atr,atc,atype;
  if(bestMove.kind==='special'){
    atr=bestMove.tr;atc=bestMove.tc;atype='special';
    if(bestMove.mv.type==='special_self')doSpecial(bestMove.fr,bestMove.fc,bestMove.fr,bestMove.fc);
    else doSpecial(bestMove.fr,bestMove.fc,bestMove.tr,bestMove.tc);
  }else{
    atr=bestMove.mv.row;atc=bestMove.mv.col;atype=bestMove.mv.type;
    doMove(bestMove.fr,bestMove.fc,bestMove.mv.row,bestMove.mv.col,bestMove.mv);
  }
  if(!G.over){
    const center=getCellCenter(atr,atc);
    if(atype==='attack')spawnEffect(center,'attack',35);
    else if(atype==='move')spawnEffect(center,'move',14);
    renderWithAnim(afr,afc,atr,atc,atype);
    setTimeout(endTurn,atype==='special'?520:340);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ACCOUNT / ELO
// ─────────────────────────────────────────────────────────────────────────────
// ACCOUNT = { name, elo, wins, losses, token } — set after login

function getRank(elo){
  if(elo<600) return'Rookie';if(elo<800) return'Novice';if(elo<1000)return'Trainer';
  if(elo<1200)return'Veteran';if(elo<1400)return'Expert';if(elo<1600)return'Master';
  if(elo<1800)return'Grandmaster';if(elo<2000)return'Champion';return'✦ Paradox ✦';
}
function calcNewElo(me,opp,result){const K=32,exp=1/(1+Math.pow(10,(opp-me)/400));return Math.round(me+K*(result-exp));}

function refreshEloDisplay(){
  const acc=ACCOUNT;if(!acc)return;
  const el1=document.getElementById('elo-rank-label'),el2=document.getElementById('elo-num');
  const rec=document.getElementById('elo-record');
  if(el1)el1.textContent=getRank(acc.elo);
  if(el2)el2.textContent=acc.elo;
  if(rec)rec.textContent=`${acc.wins}W / ${acc.losses}L`;
}

// ─────────────────────────────────────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────────────────────────────────────
let authMode='login'; // 'login' | 'register'

async function doAuth(){
  const name=(document.getElementById('auth-name').value||'').trim();
  const pass= document.getElementById('auth-pass').value||'';
  const errEl=document.getElementById('auth-error');
  errEl.style.display='none';
  if(!name||!pass){errEl.textContent='Fill in both fields.';errEl.style.display='block';return;}
  const btn=document.getElementById('auth-submit-btn');
  btn.textContent='…';btn.disabled=true;
  try{
    const res=await fetch(`/${authMode}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,password:pass})});
    const data=await res.json();
    if(data.error){errEl.textContent=data.error;errEl.style.display='block';return;}
    // Success
    ACCOUNT={name:data.name,elo:data.elo,wins:data.wins,losses:data.losses,token:data.token,team:data.team||{}};
    localStorage.setItem(TOKEN_KEY,data.token);
    enterMenu();
  }catch(e){errEl.textContent='Server unreachable. Is node server.js running?';errEl.style.display='block';}
  finally{btn.textContent=authMode==='login'?'Login':'Create Account';btn.disabled=false;}
}

async function tryAutoLogin(){
  const token=localStorage.getItem(TOKEN_KEY);
  if(!token)return false;
  try{
    const res=await fetch('/verify_token',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token})});
    const data=await res.json();
    if(data.ok){ACCOUNT={name:data.name,elo:data.elo,wins:data.wins,losses:data.losses,token,team:data.team||{}};return true;}
  }catch{}
  localStorage.removeItem(TOKEN_KEY);
  return false;
}

async function saveResultToServer(elo,wins,losses){
  console.log('[ELO] saveResult called, account=',ACCOUNT,'elo=',elo);
  if(!ACCOUNT?.token){console.log('[ELO] no token, aborting');return;}
  try{
    const r=await fetch('/save_result',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({token:ACCOUNT.token,elo,wins,losses})});
    const d=await r.json();
    console.log('[ELO] server response=',d);
  }catch(e){console.log('[ELO] fetch error',e);}
}

async function saveTeamToServer(team){
  if(!ACCOUNT?.token)return;
  try{
    await fetch('/save_team',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({token:ACCOUNT.token,team})});
    if(ACCOUNT)ACCOUNT.team=team;
  }catch{}
}

function showTeamCustomizer(){
  const elo=ACCOUNT?.elo||0;
  // Use pending state if it exists (re-render after swap), otherwise fresh copy from account
  if(!_pendingTeam){
    _pendingTeam=JSON.parse(JSON.stringify(ACCOUNT?.team||{}));
  }
  const team=_pendingTeam;
  if(!team.scarlet)team.scarlet={};
  if(!team.violet)team.violet={};

  const unlocked=UNLOCK_POOL.filter(u=>elo>=u.eloReq);
  const nextUnlock=UNLOCK_POOL.filter(u=>elo<u.eloReq).sort((a,b)=>a.eloReq-b.eloReq)[0];

  function pieceCard(type,isActive,onSwap){
    const d=DEFS[type];
    return`<div class="tc-card${isActive?' tc-active':''}" onclick="${onSwap}" title="${d.name}&#10;HP:${d.hp} DMG:${d.dmg}${d.special?'&#10;'+d.special.name+(d.special.dmg?' ('+d.special.dmg+'dmg':' (')+'CD'+d.special.cd+')':''}">
      <img src="${spriteUrl(type)}" style="width:54px;height:54px;object-fit:contain">
      <div style="font-size:0.65rem;color:#d1fae5;font-weight:700;margin-top:2px">${d.name}</div>
      <div style="font-size:0.6rem;color:#4a7a4a">${d.hp}HP ${d.dmg}ATK</div>
      ${d.special?`<div style="font-size:0.55rem;color:#a855f7">${d.special.name}</div>`:''}
    </div>`;
  }

  function lockedCard(type,eloReq){
    const d=DEFS[type];
    return`<div class="tc-card" style="opacity:0.35;cursor:not-allowed;position:relative" title="Unlocks at ${eloReq} ELO&#10;${d.name}&#10;HP:${d.hp} DMG:${d.dmg}">
      <img src="${spriteUrl(type)}" style="width:54px;height:54px;object-fit:contain;filter:grayscale(1)">
      <div style="font-size:0.65rem;color:#d1fae5;font-weight:700;margin-top:2px">${d.name}</div>
      <div style="font-size:0.6rem;color:#4a7a4a">${d.hp}HP ${d.dmg}ATK</div>
      <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;flex-direction:column;background:rgba(0,0,0,0.45);border-radius:8px">
        <div style="font-size:1rem">🔒</div>
        <div style="font-size:0.55rem;color:#ffd700;font-weight:700">${eloReq} ELO</div>
      </div>
    </div>`;
  }

  function slotRow(side,slot,defaultType){
    const cur=team[side][slot]||defaultType;
    const alts=unlocked.filter(u=>u.side===side&&u.slot===slot);
    const lockedAlts=UNLOCK_POOL.filter(u=>u.side===side&&u.slot===slot&&elo<u.eloReq).sort((a,b)=>a.eloReq-b.eloReq);
    let html=`<div style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid rgba(34,197,94,0.1);flex-wrap:wrap">
      <div style="font-size:0.68rem;color:#4a7a4a;width:48px;text-transform:capitalize">${slot}</div>`;
    html+=pieceCard(defaultType,cur===defaultType,`teamSwap('${side}','${slot}','${defaultType}')`);
    alts.forEach(alt=>{
      html+=`<div style="color:#ffd700;font-size:0.75rem">⇄</div>`;
      html+=pieceCard(alt.type,cur===alt.type,`teamSwap('${side}','${slot}','${alt.type}')`);
    });
    lockedAlts.forEach(alt=>{
      html+=`<div style="color:#ffd700;font-size:0.75rem">⇄</div>`;
      html+=lockedCard(alt.type,alt.eloReq);
    });
    html+=`</div>`;
    return html;
  }

  let modal=document.getElementById('team-modal');
  if(modal)modal.remove();
  modal=document.createElement('div');
  modal.id='team-modal';
  modal.style.cssText='position:fixed;inset:0;z-index:600;background:rgba(0,0,0,0.9);display:flex;align-items:center;justify-content:center;backdrop-filter:blur(6px)';

  const scarletSlots=[['pawn','sandy_shocks'],['queen','flutter_mane'],['rook','raging_bolt'],['knight','scream_tail'],['bishop','roaring_moon']];
  const violetSlots= [['pawn','iron_moth'],   ['queen','iron_crown'],  ['rook','iron_boulder'],['knight','iron_bundle'],['bishop','iron_jugulis']];

  modal.innerHTML=`
    <div style="background:#050e05;border:1px solid rgba(34,197,94,0.4);border-radius:16px;padding:32px 36px;max-width:700px;width:95%;max-height:88vh;overflow-y:auto;color:#d1fae5">
      <h2 style="color:#ffd700;text-align:center;margin-bottom:4px">⚙️ Customize Team</h2>
      <p style="color:#3a6a3a;font-size:0.75rem;text-align:center;margin-bottom:18px">Your ELO: <b style="color:#22c55e">${elo}</b>${nextUnlock?` · Next unlock at <b style="color:#ffd700">${nextUnlock.eloReq}</b>`:' · All unlocked!'}</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px">
        <div>
          <div style="color:#e63946;font-weight:800;margin-bottom:8px">🔴 Scarlet Team</div>
          ${scarletSlots.map(([slot,def])=>slotRow('scarlet',slot,def)).join('')}
        </div>
        <div>
          <div style="color:#9b8dff;font-weight:800;margin-bottom:8px">🟣 Violet Team</div>
          ${violetSlots.map(([slot,def])=>slotRow('violet',slot,def)).join('')}
        </div>
      </div>
      <div style="text-align:center;margin-top:22px;display:flex;gap:12px;justify-content:center">
        <button onclick="saveCustomTeam()" style="background:linear-gradient(135deg,#22c55e,#fbbf24);color:#031a03;border:none;border-radius:8px;padding:10px 28px;font-weight:800;cursor:pointer">💾 Save Team</button>
        <button onclick="closeTeamCustomizer()" style="background:rgba(34,197,94,0.08);color:#4ade80;border:1px solid rgba(34,197,94,0.3);border-radius:8px;padding:10px 22px;font-weight:700;cursor:pointer">Close</button>
      </div>
    </div>`;
  document.body.appendChild(modal);

  // expose helpers to onclick
  window.teamSwap=(side,slot,type)=>{
    _pendingTeam[side][slot]=type;
    showTeamCustomizer(); // re-render (will reuse _pendingTeam)
  };
  window.saveCustomTeam=async()=>{
    await saveTeamToServer(_pendingTeam);
    _pendingTeam=null;
    document.getElementById('team-modal').remove();
    addLog?.('Team saved!');
  };
  window.closeTeamCustomizer=()=>{
    _pendingTeam=null;
    document.getElementById('team-modal').remove();
  };
}

function enterMenu(){
  document.getElementById('auth-screen').style.display='none';
  document.getElementById('menu').style.display='flex';
  document.getElementById('logged-in-name').textContent=ACCOUNT.name;
  refreshEloDisplay();
}


// ─────────────────────────────────────────────────────────────────────────────
// SOCKET.IO
// ─────────────────────────────────────────────────────────────────────────────
function initSocket(name){
  if(typeof io==='undefined'){addLog('Socket.io unavailable — run: npm install && node server.js');return;}
  if(socket&&socket.connected)return;
  socket=io();
  socket.on('connect',()=>{
    socket.emit('register',{name,elo:ACCOUNT?.elo||1000});
    socket.emit('join_queue');
  });
  socket.on('queued',({position})=>{
    document.getElementById('queue-pos').textContent=`You are #${position} in queue`;
  });
  socket.on('match_found',({roomId,side,opponent,opponentElo})=>{
    G.roomId=roomId;G.mySide=side;G.opponentName=opponent;
    showMatchFound(opponent,opponentElo,side);
  });
  socket.on('opponent_action',action=>applyOpponentAction(action));
  socket.on('opponent_disconnected',()=>{
    addLog('Opponent disconnected. You win!');
    endGame(G.mySide==='scarlet'?'Scarlet':'Violet');
  });
  socket.on('leaderboard',data=>{G.leaderboard=data;renderLeaderboard(data);});
  socket.on('viewer_count',n=>{const el=document.getElementById('viewer-count');if(el)el.textContent=`● ${n} online`;});
  socket.on('elo_update',({elo,delta,wins,losses})=>{
    if(ACCOUNT){ACCOUNT.elo=elo;ACCOUNT.wins=wins??ACCOUNT.wins;ACCOUNT.losses=losses??ACCOUNT.losses;}
    G.onlineEloDelta={elo,delta};
  });
}

function sendAction(action){
  if(socket&&G.mode==='online'&&G.roomId)socket.emit('game_action',{roomId:G.roomId,action});
}

function applyOpponentAction(action){
  if(G.over)return;
  let afr=action.fr,afc=action.fc,atr=action.tr??action.fr,atc=action.tc??action.fc,atype=action.mv?.type||action.type;
  if(action.type==='move'||action.type==='bike_charge'){
    doMove(action.fr,action.fc,action.mv.row,action.mv.col,action.mv);
    atr=action.mv.row;atc=action.mv.col;atype=action.mv.type;
  }else if(action.type==='special'){
    doSpecial(action.fr,action.fc,action.tr,action.tc);
    atr=action.tr;atc=action.tc;atype='special';
  }else if(action.type==='bike_transform'){
    const p=G.board[action.r][action.c];
    if(p){p.bikeTr=true;addLog(`${DEFS[p.type].name} begins transforming…`);}
    afr=action.r;afc=action.c;atr=action.r;atc=action.c;atype='bike';
  }
  if(!G.over){
    const center=getCellCenter(atr,atc);
    if(atype==='attack')spawnEffect(center,'attack',35);
    else if(atype==='move')spawnEffect(center,'move',14);
    renderWithAnim(afr,afc,atr,atc,atype);
    G.animPending=true;
    setTimeout(()=>{G.animPending=false;endTurn();},atype==='special'?520:340);
  }
}

function showMatchFound(opponent,opponentElo,side){
  document.getElementById('match-found-banner').style.display='block';
  document.getElementById('queue-status-text').textContent='Match Found!';
  document.getElementById('queue-opp-name').textContent=opponent;
  document.getElementById('queue-opp-silhouette').textContent='⚔️';
  document.getElementById('queue-opp-silhouette').style.fontSize='4rem';
  document.getElementById('queue-pos').textContent=`${opponentElo} ELO — You play as ${side}`;
  const cd=document.getElementById('queue-countdown');
  cd.style.display='block';
  let n=3;cd.textContent=n;
  const iv=setInterval(()=>{n--;if(n>0)cd.textContent=n;else{clearInterval(iv);launchGame();}},1000);
}

function launchGame(){
  document.getElementById('queue-screen').style.display='none';
  document.getElementById('game').style.display='flex';
  renderBoardCoords();render();updateUI();
  addLog(`Game started! You are ${G.mySide}. Scarlet moves first.`);
  G.timerInt=setInterval(tickTimer,1000);
  // Set player labels
  const me=G.playerName;const opp=G.opponentName;
  if(G.mySide==='scarlet'){
    document.getElementById('scarlet-label').textContent=me;
    document.getElementById('violet-label').textContent=opp;
  }else{
    document.getElementById('violet-label').textContent=me;
    document.getElementById('scarlet-label').textContent=opp;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// BACKGROUND ANIMATION
// ─────────────────────────────────────────────────────────────────────────────
const bgParticles=[];

function mkBgParticle(){
  const type=Math.random()<0.45?'bolt':Math.random()<0.6?'leaf':'star';
  return{
    type,x:Math.random()*window.innerWidth,y:Math.random()*window.innerHeight,
    vx:(Math.random()-0.5)*0.4,vy:(type==='leaf'?1:-1)*(Math.random()*0.3+0.1),
    alpha:Math.random()*0.18+0.04,size:Math.random()*14+6,
    rot:Math.random()*360,rotV:(Math.random()-0.5)*0.7,life:Math.random(),
    decay:Math.random()*0.0025+0.0008,
  };
}

function animateBg(){
  const cv=document.getElementById('bg-canvas');if(!cv)return;
  const ctx=cv.getContext('2d');
  cv.width=window.innerWidth;cv.height=window.innerHeight;
  const grad=ctx.createLinearGradient(0,0,0,cv.height);
  grad.addColorStop(0,'#020702');grad.addColorStop(0.5,'#040c04');grad.addColorStop(1,'#020702');
  ctx.fillStyle=grad;ctx.fillRect(0,0,cv.width,cv.height);
  bgParticles.forEach(p=>{
    p.x+=p.vx;p.y+=p.vy;p.rot+=p.rotV;p.life-=p.decay;
    if(p.life<=0||p.x<-60||p.x>cv.width+60||p.y<-60||p.y>cv.height+60){
      Object.assign(p,mkBgParticle());p.life=0.4+Math.random()*0.6;
      p.x=Math.random()*cv.width;p.y=p.vy>0?-20:cv.height+20;
    }
    ctx.save();ctx.globalAlpha=p.alpha*p.life;
    ctx.translate(p.x,p.y);ctx.rotate(p.rot*Math.PI/180);
    if(p.type==='bolt'){
      ctx.fillStyle='#ffd700';ctx.beginPath();
      const s=p.size;ctx.moveTo(s*.2,-s*.5);ctx.lineTo(s*.5,0);ctx.lineTo(s*.1,0);
      ctx.lineTo(s*.3,s*.5);ctx.lineTo(-s*.1,0);ctx.lineTo(s*.2,0);ctx.closePath();ctx.fill();
    }else if(p.type==='leaf'){
      ctx.fillStyle='#22c55e';ctx.beginPath();
      ctx.ellipse(0,0,p.size*.3,p.size*.65,0,0,Math.PI*2);ctx.fill();
    }else{
      ctx.fillStyle='rgba(255,255,255,0.8)';ctx.beginPath();
      ctx.arc(0,0,p.size*.15,0,Math.PI*2);ctx.fill();
    }
    ctx.restore();
  });
  requestAnimationFrame(animateBg);
}

function initBg(){
  for(let i=0;i<65;i++)bgParticles.push(mkBgParticle());
  animateBg();
}

// ─────────────────────────────────────────────────────────────────────────────
// EFFECT PARTICLES
// ─────────────────────────────────────────────────────────────────────────────
const effects=[], beams=[], shockwaves=[], lightnings=[];

function getCellCenter(r,c){
  const board=document.getElementById('board');if(!board)return{x:0,y:0};
  const rect=board.getBoundingClientRect();
  const CELL=88;
  return{x:rect.left+c*CELL+CELL/2,y:rect.top+r*CELL+CELL/2};
}

const ABILITY_PALETTES={
  'Dragon Breath':   ['#c084fc','#7b2fff','#ff4500','#ffd700'],
  'Hyper Voice':     ['#c084fc','#e879f9','#fff','#a855f7'],
  'Stun Aura':       ['#faff00','#ffd700','#fff','#a0a0ff'],
  'Freeze':          ['#00d4ff','#7ee8ff','#fff','#b3f0ff'],
  'Hydro Pump':      ['#00bfff','#00d4ff','#7ee8ff','#fff'],
  'Hurricane':       ['#a8edea','#ffffff','#00d4ff','#e0f7fa'],
  'Inferno':         ['#ff4500','#ff6a00','#ff0000','#ffa500'],
  'Spore':           ['#22c55e','#4ade80','#86efac','#d4edda'],
  'Sacred Sword':    ['#ffd700','#ffffff','#c084fc','#e0e0e0'],
  'Thunder Cage':    ['#faff00','#ffd700','#ffffff','#ffec8b'],
  'Headlong Rush':   ['#ff6a00','#ff8c00','#cc4400','#ffd700'],
  'Ruinous Shock':   ['#faff00','#ffd700','#fff700','#ffffff'],
  'Ruinous Flame':   ['#ff4500','#ff6a00','#ff8c00','#ffdc00'],
  'Psycho Cut':      ['#ff69b4','#da70d6','#c084fc','#ffffff'],
  'Mortal Spin':     ['#aaaaaa','#cccccc','#4ade80','#ffffff'],
  'Ruinous Ice':     ['#00d4ff','#7ee8ff','#ffffff','#b3f0ff'],
  'Outrage':         ['#ff2200','#ff6a00','#7b2fff','#ffd700'],
  'Armor Cannon':    ['#ff4500','#ffd700','#888888','#ffffff'],
  'Rage Fist':       ['#ff2200','#ff6a00','#ffffff','#cc4400'],
  'Flower Trick':    ['#ff69b4','#ff1493','#22c55e','#ffffff'],
  'Gigaton Hammer':  ['#888888','#cccccc','#ffffff','#ffd700'],
  'Bitter Blade':    ['#ffd700','#fff700','#ff8c00','#ffffff'],
  'Torch Song':      ['#ff4500','#ff6a00','#ffd700','#ffffff'],
  'Revival Blessing':['#22c55e','#ffd700','#ffffff','#ff69b4'],
  'Jet Punch':       ['#00bfff','#ffffff','#7ee8ff','#00d4ff'],
  'Fillet Away':     ['#00bfff','#7ee8ff','#c084fc','#ffffff'],
  'Phantom Strike':  ['#7b2fff','#c084fc','#ffffff','#1a0030'],
};

function getAbilityPalette(name){
  return ABILITY_PALETTES[name]||['#c084fc','#a855f7','#e879f9','#fff'];
}

function spawnEffect(center,type,count=20){
  const palettes={
    attack:['#ffd700','#fbbf24','#fff','#ffec8b','#ff8c00'],
    move:  ['#22c55e','#4ade80','#86efac','#fff'],
    special:['#c084fc','#a855f7','#e879f9','#fff'],
    freeze:['#00d4ff','#7ee8ff','#fff','#b3f0ff'],
    promote:['#ffd700','#fff','#22c55e','#ffd000'],
  };
  const cl=palettes[type]||palettes.attack;
  spawnEffectPalette(center,cl,count);
}

const ABILITY_CATEGORY={
  electric:['Thunder Cage','Ruinous Shock','Stun Aura'],
  fire:    ['Ruinous Flame','Torch Song','Inferno','Dragon Breath','Armor Cannon','Outrage'],
  ice:     ['Freeze','Ruinous Ice'],
  water:   ['Hydro Pump','Hurricane','Jet Punch'],
  ghost:   ['Phantom Strike'],
  psychic: ['Psycho Cut','Sacred Sword','Hyper Voice','Revival Blessing'],
  grass:   ['Spore','Flower Trick','Mortal Spin'],
  fighting:['Headlong Rush','Rage Fist','Gigaton Hammer','Bitter Blade','Fillet Away'],
};
function getAbilityCategory(name){
  for(const[cat,names]of Object.entries(ABILITY_CATEGORY))if(names.includes(name))return cat;
  return 'normal';
}

function screenFlash(color,alpha=0.35,duration=280){
  const el=document.createElement('div');
  el.style.cssText=`position:fixed;inset:0;background:${color};opacity:${alpha};pointer-events:none;z-index:8500;transition:opacity ${duration}ms ease-out;`;
  document.body.appendChild(el);
  requestAnimationFrame(()=>requestAnimationFrame(()=>{el.style.opacity='0';}));
  setTimeout(()=>el.remove(),duration+80);
}

function triggerShakeBig(){
  const el=document.getElementById('main-area');if(!el)return;
  el.style.animation='none';el.offsetHeight;el.style.animation='screenShakeBig 0.55s ease';
  setTimeout(()=>{el.style.animation='';},560);
}

function drawStar(ctx,x,y,r,pts=5){
  ctx.beginPath();
  for(let i=0;i<pts*2;i++){
    const a=i*Math.PI/pts-Math.PI/2;
    const rad=i%2===0?r:r*0.38;
    i===0?ctx.moveTo(x+Math.cos(a)*rad,y+Math.sin(a)*rad):ctx.lineTo(x+Math.cos(a)*rad,y+Math.sin(a)*rad);
  }
  ctx.closePath();ctx.fill();
}

function spawnEffectPalette(center,palette,count=30,opts={}){
  const{fireMode,iceMode,upward}=opts;
  for(let i=0;i<count;i++){
    const angle=Math.random()*Math.PI*2;
    const speed=Math.random()*(fireMode?9:iceMode?4:8)+(fireMode?3:2);
    const big=Math.random()<0.25;
    const star=Math.random()<0.3;
    let vx=Math.cos(angle)*speed,vy=Math.sin(angle)*speed-(fireMode?6:upward?4:2.5);
    if(iceMode){vx*=0.5;vy=-(Math.random()*2+0.5);}
    effects.push({
      x:center.x+(Math.random()-0.5)*24,y:center.y+(Math.random()-0.5)*24,
      vx,vy,
      color:palette[Math.floor(Math.random()*palette.length)],
      life:1,
      decay:fireMode?0.028+Math.random()*0.02:iceMode?0.010+Math.random()*0.010:0.016+Math.random()*0.016,
      size:big?Math.random()*11+6:Math.random()*5+2,
      grav:fireMode?0.03:iceMode?0.005:0.12,
      star,spin:Math.random()*0.3-0.15,rot:Math.random()*Math.PI*2,
    });
  }
}

function spawnEffect(center,type,count=20){
  const palettes={
    attack:['#ffd700','#fbbf24','#fff','#ffec8b','#ff8c00'],
    move:  ['#22c55e','#4ade80','#86efac','#fff'],
    special:['#c084fc','#a855f7','#e879f9','#fff'],
    freeze:['#00d4ff','#7ee8ff','#fff','#b3f0ff'],
    promote:['#ffd700','#fff','#22c55e','#ffd000'],
  };
  const cl=palettes[type]||palettes.attack;
  spawnEffectPalette(center,cl,count);
}

// Recursive zigzag for lightning
function _zigzag(x1,y1,x2,y2,depth,pts){
  if(depth===0){if(!pts.length)pts.push([x1,y1]);pts.push([x2,y2]);return;}
  const d=Math.hypot(x2-x1,y2-y1);
  const mx=(x1+x2)/2+(Math.random()-0.5)*d*0.45;
  const my=(y1+y2)/2+(Math.random()-0.5)*d*0.45;
  _zigzag(x1,y1,mx,my,depth-1,pts);
  _zigzag(mx,my,x2,y2,depth-1,pts);
}

function spawnLightning(from,to,palette,branches=3){
  for(let b=0;b<branches;b++){
    const pts=[];
    if(b===0){
      _zigzag(from.x,from.y,to.x,to.y,4,pts);
      lightnings.push({pts,color:palette[0],glow:palette[1]||palette[0],life:1,decay:0.07,width:3});
    }else{
      // branch from a random point on main path to an offset
      const ox=to.x+(Math.random()-0.5)*100,oy=to.y+(Math.random()-0.5)*100;
      const bpts=[];_zigzag(from.x,from.y,ox,oy,3,bpts);
      lightnings.push({pts:bpts,color:palette[0],glow:palette[1]||palette[0],life:0.7,decay:0.09,width:1.5});
    }
  }
}

function spawnBeam(from,to,palette){
  beams.push({from,to,palette,start:performance.now(),duration:280,done:false,trailTime:0});
}

function spawnShockwave(center,palette,count=4){
  const delays=[0,55,110,180];
  const maxRs=[180,130,90,60];
  for(let i=0;i<count;i++){
    setTimeout(()=>shockwaves.push({
      x:center.x,y:center.y,r:8,maxR:maxRs[i],
      color:palette[i%palette.length]||palette[0],
      glow:palette[0],alpha:1-i*0.15,
    }),delays[i]);
  }
}

function spawnDmgNum(r,c,dmg,color){
  const center=getCellCenter(r,c);
  const el=document.createElement('div');
  el.textContent=`-${dmg}`;
  el.style.cssText=`position:fixed;left:${center.x}px;top:${center.y-18}px;color:${color};font-size:1.7rem;font-weight:900;pointer-events:none;z-index:9999;text-shadow:0 0 20px ${color},0 2px 10px rgba(0,0,0,0.95);transform:translate(-50%,-50%);animation:dmgFloat 0.95s ease forwards;font-family:monospace;letter-spacing:-1px;`;
  document.body.appendChild(el);
  setTimeout(()=>el.remove(),960);
}

function playSpecialFX(fr,fc,tr,tc,spec){
  const palette=getAbilityPalette(spec.name);
  const cat=getAbilityCategory(spec.name);
  const from=getCellCenter(fr,fc);
  flashCell(fr,fc,'anim-special-cast');
  screenFlash(palette[0],cat==='electric'?0.45:cat==='fire'?0.38:0.22,240);

  if(spec.type==='ranged'||spec.type==='ranged_stun'||spec.type==='freeze'){
    const to=getCellCenter(tr,tc);
    // Charge burst at caster
    spawnEffectPalette(from,palette,35,{fireMode:cat==='fire',iceMode:cat==='ice'});
    if(cat==='electric'){
      spawnLightning(from,to,palette,3);
      spawnEffectPalette(to,palette,30,{});
    }else{
      spawnBeam(from,to,palette);
    }
    if(spec.dmg>0)setTimeout(()=>{
      spawnDmgNum(tr,tc,spec.dmg,palette[0]);
      screenFlash(palette[0],0.18,150);
    },300);
  }else if(spec.type==='aoe_dmg'||spec.type==='aoe_stun'){
    spawnShockwave(from,palette,4);
    spawnEffectPalette(from,palette,90,{fireMode:cat==='fire',iceMode:cat==='ice',upward:cat==='fire'});
    if(cat==='electric')spawnLightning(from,{x:from.x+(Math.random()-0.5)*200,y:from.y+(Math.random()-0.5)*200},palette,4);
    for(let dr=-1;dr<=1;dr++) for(let dc=-1;dc<=1;dc++){
      if(!dr&&!dc)continue;
      const nr=fr+dr,nc=fc+dc;if(!OB(nr,nc))continue;
      const to=getCellCenter(nr,nc);
      const delay=60+Math.random()*60;
      setTimeout(()=>{
        spawnEffectPalette(to,palette,28,{fireMode:cat==='fire'});
        flashCell(nr,nc,spec.type==='aoe_stun'?'anim-stun':'anim-hurt');
        if(spec.dmg>0)spawnDmgNum(nr,nc,spec.dmg,palette[0]);
        if(cat==='electric')spawnLightning(from,to,palette,1);
      },delay);
    }
    triggerShakeBig();
  }
}

function drawEffects(){
  const cv=document.getElementById('effect-canvas');if(!cv)return;
  cv.width=window.innerWidth;cv.height=window.innerHeight;
  const ctx=cv.getContext('2d');ctx.clearRect(0,0,cv.width,cv.height);

  // lightnings
  for(let i=lightnings.length-1;i>=0;i--){
    const l=lightnings[i];
    l.life-=l.decay;
    if(l.life<=0){lightnings.splice(i,1);continue;}
    ctx.save();
    ctx.globalAlpha=l.life*0.9;ctx.lineCap='round';ctx.lineJoin='round';
    // fat glow
    ctx.strokeStyle=l.glow;ctx.lineWidth=l.width*4+l.life*4;ctx.shadowBlur=35;ctx.shadowColor=l.glow;
    ctx.beginPath();ctx.moveTo(l.pts[0][0],l.pts[0][1]);
    for(let j=1;j<l.pts.length;j++)ctx.lineTo(l.pts[j][0],l.pts[j][1]);ctx.stroke();
    // mid
    ctx.strokeStyle=l.color;ctx.lineWidth=l.width+l.life*2;ctx.shadowBlur=15;
    ctx.beginPath();ctx.moveTo(l.pts[0][0],l.pts[0][1]);
    for(let j=1;j<l.pts.length;j++)ctx.lineTo(l.pts[j][0],l.pts[j][1]);ctx.stroke();
    // white core
    ctx.strokeStyle='#fff';ctx.lineWidth=l.life*1.5;ctx.shadowBlur=0;ctx.globalAlpha=l.life*0.6;
    ctx.beginPath();ctx.moveTo(l.pts[0][0],l.pts[0][1]);
    for(let j=1;j<l.pts.length;j++)ctx.lineTo(l.pts[j][0],l.pts[j][1]);ctx.stroke();
    ctx.restore();
  }

  // shockwaves
  for(let i=shockwaves.length-1;i>=0;i--){
    const s=shockwaves[i];
    s.r+=11;s.alpha=Math.max(0,1-s.r/s.maxR);
    if(s.alpha<=0){shockwaves.splice(i,1);continue;}
    ctx.save();
    ctx.globalAlpha=s.alpha*0.92;ctx.strokeStyle=s.color;ctx.lineWidth=4+s.alpha*8;
    ctx.shadowBlur=32;ctx.shadowColor=s.glow;
    ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.stroke();
    if(s.r>30){ctx.globalAlpha=s.alpha*0.3;ctx.lineWidth=1.5;ctx.shadowBlur=0;
      ctx.beginPath();ctx.arc(s.x,s.y,s.r*0.6,0,Math.PI*2);ctx.stroke();}
    ctx.restore();
  }

  // beams
  const now=performance.now();
  for(let i=beams.length-1;i>=0;i--){
    const b=beams[i];
    const t=Math.min(1,(now-b.start)/b.duration);
    if(b.done){beams.splice(i,1);continue;}
    const tipX=b.from.x+(b.to.x-b.from.x)*t;
    const tipY=b.from.y+(b.to.y-b.from.y)*t;
    // trail particles
    if(now-b.trailTime>18){b.trailTime=now;spawnEffectPalette({x:tipX,y:tipY},b.palette,4);}
    const alpha=t>0.72?1-(t-0.72)*3.5:1;
    ctx.save();ctx.globalAlpha=alpha;ctx.lineCap='round';
    // fat outer glow
    ctx.strokeStyle=b.palette[1]||b.palette[0];ctx.lineWidth=22;ctx.shadowBlur=50;ctx.shadowColor=b.palette[0];
    ctx.beginPath();ctx.moveTo(b.from.x,b.from.y);ctx.lineTo(tipX,tipY);ctx.stroke();
    // mid layer
    ctx.strokeStyle=b.palette[0];ctx.lineWidth=9;ctx.shadowBlur=25;
    ctx.beginPath();ctx.moveTo(b.from.x,b.from.y);ctx.lineTo(tipX,tipY);ctx.stroke();
    // thin inner
    ctx.strokeStyle=b.palette[2]||b.palette[0];ctx.lineWidth=4;ctx.shadowBlur=10;
    ctx.beginPath();ctx.moveTo(b.from.x,b.from.y);ctx.lineTo(tipX,tipY);ctx.stroke();
    // white core
    ctx.strokeStyle='#ffffff';ctx.lineWidth=1.5;ctx.shadowBlur=0;
    ctx.beginPath();ctx.moveTo(b.from.x,b.from.y);ctx.lineTo(tipX,tipY);ctx.stroke();
    ctx.restore();
    if(t>=1){
      b.done=true;
      spawnEffectPalette(b.to,b.palette,70);
      spawnShockwave(b.to,b.palette,2);
    }
  }

  // particles
  for(let i=effects.length-1;i>=0;i--){
    const e=effects[i];
    e.x+=e.vx;e.y+=e.vy;e.vy+=e.grav;e.vx*=0.98;e.life-=e.decay;
    if(e.rot!==undefined)e.rot+=e.spin;
    if(e.life<=0){effects.splice(i,1);continue;}
    ctx.save();ctx.globalAlpha=e.life;ctx.fillStyle=e.color;
    ctx.shadowBlur=16;ctx.shadowColor=e.color;
    if(e.star){
      ctx.translate(e.x,e.y);if(e.rot)ctx.rotate(e.rot);
      drawStar(ctx,0,0,e.size*e.life*1.4,5);
    }else{
      ctx.beginPath();ctx.arc(e.x,e.y,e.size*e.life,0,Math.PI*2);ctx.fill();
    }
    ctx.restore();
  }
  requestAnimationFrame(drawEffects);
}

// ─────────────────────────────────────────────────────────────────────────────
// CONFETTI
// ─────────────────────────────────────────────────────────────────────────────
function launchConfetti(side){
  const cv=document.getElementById('confetti-canvas');
  cv.width=window.innerWidth;cv.height=window.innerHeight;cv.style.display='block';
  const ctx=cv.getContext('2d');
  const c1=side==='scarlet'?'#e63946':'#9b8dff',c2=side==='scarlet'?'#ff9999':'#c084fc';
  const cols=[c1,c2,'#ffd700','#22c55e','#ffffff',c1];
  const parts=Array.from({length:240},()=>({
    x:Math.random()*cv.width,y:-40-Math.random()*200,
    vx:(Math.random()-0.5)*7,vy:Math.random()*5+2,grav:.1,
    color:cols[Math.floor(Math.random()*cols.length)],
    w:Math.random()*14+6,h:Math.random()*7+3,rot:Math.random()*360,
    rotV:(Math.random()-0.5)*10,alpha:1,
  }));
  let frame=0;
  (function draw(){
    ctx.clearRect(0,0,cv.width,cv.height);
    parts.forEach(p=>{
      p.x+=p.vx;p.y+=p.vy;p.vy+=p.grav;p.rot+=p.rotV;
      if(frame>180)p.alpha=Math.max(0,p.alpha-.015);
      ctx.save();ctx.globalAlpha=p.alpha;ctx.translate(p.x,p.y);ctx.rotate(p.rot*Math.PI/180);
      ctx.fillStyle=p.color;ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h);ctx.restore();
    });
    frame++;if(frame<290)requestAnimationFrame(draw);else cv.style.display='none';
  })();
}

// HOW TO PLAY
// ─────────────────────────────────────────────────────────────────────────────
let htpSlide=0, htpAnimId=null;

const HTP_SLIDES=[
  {title:'Welcome to PokéChess!',
   body:'Chess movement meets Pokémon battles. Move pieces like chess, but enemies have HP — deal enough damage to destroy them. Protect your Legendary Pokémon at all costs.',
   draw(ctx,W,H,t){
    _htpBg(ctx,W,H);
    [{x:W*.22,y:H*.42,col:'#e63946',lbl:'KOR',b:0},{x:W*.5,y:H*.42,col:'#ffd700',lbl:'VS',b:1},{x:W*.78,y:H*.42,col:'#9b8dff',lbl:'MIR',b:2}]
    .forEach(p=>{const by=Math.sin(t*.04+p.b*1.5)*6;_htpPiece(ctx,p.x,p.y+by,p.col,p.lbl,34);});
    ctx.font='bold 11px Orbitron,monospace';ctx.textAlign='center';
    ctx.fillStyle='rgba(230,57,70,0.7)';ctx.fillText('Scarlet',W*.22,H*.8);
    ctx.fillStyle='rgba(155,141,255,0.7)';ctx.fillText('Violet',W*.78,H*.8);
  }},
  {title:'The Board',
   body:'8×8 grid. Scarlet attacks from the bottom, Violet from the top. Each team has a Legendary (your King), Queen, Rooks, Bishops, Knights, and Pawns — each with unique HP and DMG stats.',
   draw(ctx,W,H,t){
    _htpBg(ctx,W,H);
    const cs=30,ox=(W-cs*8)/2,oy=(H-cs*5)/2;
    for(let r=0;r<5;r++) for(let c=0;c<8;c++){
      ctx.fillStyle=(r+c)%2===0?'#192b19':'#0d1a0d';ctx.fillRect(ox+c*cs,oy+r*cs,cs,cs);
    }
    const glow=Math.sin(t*.05)*.5+.5;
    [[0,3,'#9b8dff','Q'],[0,4,'#9b8dff','MIR'],[4,3,'#e63946','Q'],[4,4,'#e63946','KOR']].forEach(([r,c,col,lbl])=>{
      ctx.globalAlpha=glow*.3;ctx.fillStyle=col;ctx.fillRect(ox+c*cs,oy+r*cs,cs,cs);ctx.globalAlpha=1;
      ctx.fillStyle=col;ctx.font='bold 9px monospace';ctx.textAlign='center';ctx.fillText(lbl,ox+c*cs+cs/2,oy+r*cs+cs/2+3);
    });
  }},
  {title:'Moving Pieces',
   body:'Click a piece to select it, then click a green-highlighted square to move. Queens go any direction any distance. Rooks go straight lines. Knights jump in an L-shape. Bishops go diagonally.',
   draw(ctx,W,H,t){
    _htpBg(ctx,W,H);
    const cs=38,ox=W/2-cs*1.5,oy=H/2-cs*1.5;
    for(let r=0;r<3;r++) for(let c=0;c<3;c++){ctx.fillStyle=(r+c)%2===0?'#192b19':'#0d1a0d';ctx.fillRect(ox+c*cs,oy+r*cs,cs,cs);}
    const pulse=Math.sin(t*.08)*.4+.6;
    [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[-1,1],[1,-1],[1,1]].forEach(([dr,dc])=>{
      const mx=ox+(1+dc)*cs+cs/2,my=oy+(1+dr)*cs+cs/2;
      ctx.globalAlpha=pulse;ctx.fillStyle='#22c55e';ctx.shadowBlur=12;ctx.shadowColor='#22c55e';
      ctx.beginPath();ctx.arc(mx,my,8,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;ctx.globalAlpha=1;
    });
    _htpPiece(ctx,ox+cs+cs/2,oy+cs+cs/2,'#e63946','Q',15);
  }},
  {title:'HP & Attacking',
   body:'Move onto an enemy square to attack — dealing your DMG to their HP. Pieces survive until HP hits 0. Watch the HP bars: green = healthy, yellow = wounded, red = critical danger!',
   draw(ctx,W,H,t){
    _htpBg(ctx,W,H);
    const hp=Math.max(.06,.9-((t%180)/180)*.84);
    const cx=W*.56,cy=H*.42;
    _htpPiece(ctx,cx,cy,'#9b8dff','KNI',30);
    const bw=80,bh=10,bx=cx-bw/2,by=cy+36;
    ctx.fillStyle='rgba(0,0,0,.6)';ctx.beginPath();ctx.roundRect(bx,by,bw,bh,4);ctx.fill();
    ctx.fillStyle=hp>.55?'#22c55e':hp>.25?'#fbbf24':'#e63946';
    ctx.beginPath();ctx.roundRect(bx,by,bw*hp,bh,4);ctx.fill();
    if(t%60<30){
      ctx.fillStyle='#ffd700';ctx.font='bold 20px monospace';ctx.textAlign='center';
      ctx.fillText('-3',cx+48,cy-8);
    }
    _htpPiece(ctx,W*.24,cy,'#e63946','ROK',24);
    const prog=Math.min(1,(t%60)/30);
    ctx.strokeStyle='#ffd700';ctx.lineWidth=2;ctx.setLineDash([5,4]);
    ctx.beginPath();ctx.moveTo(W*.24+20,cy);ctx.lineTo(W*.24+20+prog*50,cy);ctx.stroke();ctx.setLineDash([]);
  }},
  {title:'Special Abilities ✨',
   body:'Each piece has a unique Special. Select a piece and press "✨ Special". Types: Ranged blasts, AOE explosions, Stuns (skip turn), Freezes (skip turn + can\'t use specials). CD means turns until reuse.',
   draw(ctx,W,H,t){
    _htpBg(ctx,W,H);
    const cx=W*.3,cy=H*.44;
    _htpPiece(ctx,cx,cy,'#e63946','CHY',28);
    const prog=(t%80)/55;
    if(prog<=1){
      const tx=cx+prog*(W*.38);
      ctx.save();ctx.lineCap='round';
      ctx.strokeStyle='#ff4500';ctx.lineWidth=10;ctx.shadowBlur=28;ctx.shadowColor='#ff4500';
      ctx.beginPath();ctx.moveTo(cx+22,cy);ctx.lineTo(Math.min(tx,W*.72),cy);ctx.stroke();
      ctx.strokeStyle='#ffffff';ctx.lineWidth=2;ctx.shadowBlur=0;
      ctx.beginPath();ctx.moveTo(cx+22,cy);ctx.lineTo(Math.min(tx,W*.72),cy);ctx.stroke();
      ctx.restore();
    }
    _htpPiece(ctx,W*.72,cy,'#9b8dff','ILE',28);
    ctx.fillStyle='rgba(255,100,0,.6)';ctx.font='bold 9px monospace';ctx.textAlign='center';
    ctx.fillText('RUINOUS FLAME — 6 DMG · CD2',cx,cy+54);
  }},
  {title:'The Legendary — Your King',
   body:'Koraidon (Scarlet) and Miraidon (Violet) are your Kings. They have the most HP and can transform into Bike Mode. If your Legendary\'s HP reaches 0 — you lose the game!',
   draw(ctx,W,H,t){
    _htpBg(ctx,W,H);
    const cx=W/2,cy=H*.4;
    const glow=Math.sin(t*.06)*.5+.5;
    ctx.save();ctx.shadowBlur=20+glow*20;ctx.shadowColor='#e63946';
    _htpPiece(ctx,cx,cy,'#e63946','KOR',40);ctx.restore();
    const bw=140,bh=14,bx=cx-bw/2,by=cy+52;
    ctx.fillStyle='rgba(0,0,0,.7)';ctx.beginPath();ctx.roundRect(bx,by,bw,bh,5);ctx.fill();
    const hp=.45+Math.sin(t*.02)*.1;
    ctx.fillStyle='#fbbf24';ctx.beginPath();ctx.roundRect(bx,by,bw*hp,bh,5);ctx.fill();
    ctx.fillStyle='rgba(255,255,255,.5)';ctx.font='9px monospace';ctx.textAlign='center';
    ctx.fillText(`${Math.round(hp*10)}/10 HP`,cx,by+bh-2);
    ctx.fillStyle='rgba(230,57,70,.6)';ctx.font='bold 9px monospace';
    ctx.fillText('⚠ LOSE IF THIS REACHES 0 HP',cx,by+30);
  }},
  {title:'Bike Mode & Winning',
   body:'Transform your Legendary into Bike Mode (costs 1 turn). Next turn, charge in a straight line, smashing through enemies! Win by reducing the enemy Legendary\'s HP to 0.',
   draw(ctx,W,H,t){
    _htpBg(ctx,W,H);
    const phase=Math.floor(t/70)%3,cy=H*.45;
    if(phase===0){_htpPiece(ctx,W*.2,cy,'#e63946','KOR',28);ctx.fillStyle='#ffd700';ctx.font='bold 9px monospace';ctx.textAlign='center';ctx.fillText('SELECT → BIKE MODE',W*.2,cy+46);}
    else if(phase===1){ctx.save();ctx.shadowBlur=20;ctx.shadowColor='#ffd700';_htpPiece(ctx,W*.2,cy,'#ffd700','⚡',28);ctx.restore();ctx.fillStyle='#ffd700';ctx.font='bold 9px monospace';ctx.textAlign='center';ctx.fillText('TRANSFORMING…',W*.2,cy+46);}
    else{
      const prog=(t%70)/70;const px=W*.2+prog*(W*.65);
      [W*.42,W*.57,W*.72].forEach(tx=>{
        _htpPiece(ctx,tx,cy,'#9b8dff','•',14);
        if(px>tx-8){ctx.fillStyle='#ffd700';ctx.font='bold 14px monospace';ctx.textAlign='center';ctx.fillText('-2',tx,cy-22);}
      });
      _htpPiece(ctx,px,cy,'#ffd700','⚡',22);
      ctx.save();ctx.globalAlpha=.25;ctx.strokeStyle='#ffd700';ctx.lineWidth=5;ctx.shadowBlur=15;ctx.shadowColor='#ffd700';
      ctx.beginPath();ctx.moveTo(W*.2,cy);ctx.lineTo(px,cy);ctx.stroke();ctx.restore();
    }
  }},
  {title:'Ranks & ELO',
   body:'Win matches to earn ELO. Climb from Rookie → Novice → Trainer → Veteran → Expert → Master → Grandmaster → Champion → ✦ Paradox ✦. Higher ELO unlocks better team pieces!',
   draw(ctx,W,H,t){
    _htpBg(ctx,W,H);
    const ranks=[['Rookie','#22c55e'],['Trainer','#3b82f6'],['Veteran','#f59e0b'],['Champion','#ef4444'],['✦ Paradox ✦','#c084fc']];
    const active=Math.floor(t/60)%ranks.length;
    ranks.forEach(([r,col],i)=>{
      const isA=i===active;
      if(isA){ctx.save();ctx.shadowBlur=18;ctx.shadowColor=col;}
      ctx.fillStyle=isA?col:'rgba(255,255,255,0.22)';
      ctx.font=`${isA?'bold ':''} ${isA?13:10}px Orbitron,monospace`;ctx.textAlign='center';
      ctx.fillText(r,W/2,20+i*38);
      if(isA)ctx.restore();
    });
  }},
];

function _htpBg(ctx,W,H){
  ctx.clearRect(0,0,W,H);
  const g=ctx.createLinearGradient(0,0,W,H);
  g.addColorStop(0,'#020a02');g.addColorStop(1,'#02080e');
  ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
}
function _htpPiece(ctx,x,y,col,lbl,size){
  ctx.save();const r=size*.42;
  ctx.shadowBlur=14;ctx.shadowColor=col;
  ctx.fillStyle=col==='#e63946'?'#1e0510':col==='#9b8dff'?'#06081a':col==='#ffd700'?'#1a1400':'#080808';
  ctx.strokeStyle=col;ctx.lineWidth=1.5;
  ctx.beginPath();ctx.roundRect(x-r,y-r,r*2,r*2,5);ctx.fill();ctx.stroke();
  ctx.shadowBlur=0;ctx.fillStyle=col;
  ctx.font=`bold ${Math.max(7,size*.36)}px monospace`;ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText(lbl,x,y);ctx.textBaseline='alphabetic';ctx.restore();
}
function openHowToPlay(){
  document.getElementById('htp-modal').style.display='flex';
  htpSlide=0;_renderHTPSlide();
}
function closeHowToPlay(){
  document.getElementById('htp-modal').style.display='none';
  if(htpAnimId){cancelAnimationFrame(htpAnimId);htpAnimId=null;}
}
function htpNav(dir){htpSlide=Math.max(0,Math.min(HTP_SLIDES.length-1,htpSlide+dir));_renderHTPSlide();}
function _renderHTPSlide(){
  const slide=HTP_SLIDES[htpSlide];
  document.getElementById('htp-slide-title').textContent=slide.title;
  document.getElementById('htp-slide-body').textContent=slide.body;
  document.getElementById('htp-counter').textContent=`${htpSlide+1} / ${HTP_SLIDES.length}`;
  document.getElementById('htp-prev').disabled=htpSlide===0;
  document.getElementById('htp-next').disabled=htpSlide===HTP_SLIDES.length-1;
  const dots=document.getElementById('htp-dots');
  dots.innerHTML=HTP_SLIDES.map((_,i)=>`<div class="htp-dot${i===htpSlide?' active':''}" onclick="htpSlide=${i};_renderHTPSlide()" style="display:inline-block"></div>`).join('');
  if(htpAnimId){cancelAnimationFrame(htpAnimId);htpAnimId=null;}
  const cv=document.getElementById('htp-canvas');if(!cv)return;
  cv.width=cv.offsetWidth||640;cv.height=220;
  const ctx=cv.getContext('2d');let frame=0;const thisSlide=htpSlide;
  function loop(){if(htpSlide!==thisSlide)return;slide.draw(ctx,cv.width,cv.height,frame++);htpAnimId=requestAnimationFrame(loop);}
  loop();
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN SHAKE
// ─────────────────────────────────────────────────────────────────────────────
function triggerShake(){
  const el=document.getElementById('main-area');if(!el)return;
  el.style.animation='none';el.offsetHeight;el.style.animation='screenShake 0.35s ease';
  setTimeout(()=>{el.style.animation='';},350);
}

// ─────────────────────────────────────────────────────────────────────────────
// ANIMATION HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function renderWithAnim(fr,fc,tr,tc,actionType){
  render();
  const cells=document.getElementById('board').children;
  const dest=cells[tr*8+tc],src=cells[fr*8+fc];
  if(!dest)return;
  if(actionType==='move'||actionType==='bike_charge')dest.classList.add('anim-arrive');
  else if(actionType==='attack'){dest.classList.add('anim-hurt');if(src)src.classList.add('anim-attack');}
  else if(actionType==='special'){dest.classList.add('anim-hurt');if(src)src.classList.add('anim-special-cast');}
  else if(actionType==='bike')if(src)src.classList.add('anim-bike');
}

function flashCell(r,c,cls){
  const cells=document.getElementById('board')?.children;if(!cells)return;
  const cell=cells[r*8+c];if(cell){cell.classList.add(cls);setTimeout(()=>cell.classList.remove(cls),500);}
}

// ─────────────────────────────────────────────────────────────────────────────
// UI INTERACTION
// ─────────────────────────────────────────────────────────────────────────────
function selectPiece(r,c){
  const p=G.board[r][c];if(!p||p.side!==G.currentTurn)return;
  SFX.select();
  if(G.mode==='ai'&&G.currentTurn==='violet')return;
  if(G.mode==='online'&&G.currentTurn!==G.mySide)return;
  G.sel={r,c};G.legalMoves=getLegalMoves(r,c,G.board);
  G.specMode=false;G.specTargets=[];render();updateSidebar();
}

function cancelSelection(){G.sel=null;G.legalMoves=[];G.specMode=false;G.specTargets=[];render();updateSidebar();}

function handleClick(r,c){
  if(G.over||G.animPending)return;
  if(G.mode==='ai'&&G.currentTurn==='violet')return;
  if(G.mode==='online'&&G.currentTurn!==G.mySide)return;
  const p=G.board[r][c];

  if(G.specMode){
    const tgt=G.specTargets.find(t=>t.row===r&&t.col===c);
    if(tgt){
      const{r:fr,c:fc}=G.sel;
      if(tgt.type==='special_self')doSpecial(fr,fc,fr,fc);else doSpecial(fr,fc,r,c);
      sendAction({type:'special',fr,fc,tr:r,tc:c});
      if(!G.over){
        renderWithAnim(fr,fc,r,c,'special');G.animPending=true;
        setTimeout(()=>{G.animPending=false;endTurn();},480);
      }
    }else{G.specMode=false;G.specTargets=[];render();updateSidebar();}
    return;
  }

  if(G.sel){
    const{r:fr,c:fc}=G.sel;
    const mv=G.legalMoves.find(m=>m.row===r&&m.col===c);
    if(mv){
      doMove(fr,fc,r,c,mv);
      sendAction({type:mv.type==='bike_charge'?'bike_charge':'move',fr,fc,tr:r,tc:c,mv});
      if(!G.over){
        const center=getCellCenter(r,c);
        if(mv.type==='attack')spawnEffect(center,'attack',26);else spawnEffect(center,'move',14);
        renderWithAnim(fr,fc,r,c,mv.type);G.animPending=true;
        setTimeout(()=>{G.animPending=false;endTurn();},340);
      }
      return;
    }
    if(fr===r&&fc===c){cancelSelection();return;}
    if(p&&p.side===G.currentTurn){selectPiece(r,c);return;}
    cancelSelection();return;
  }
  if(p&&p.side===G.currentTurn)selectPiece(r,c);
}

function useSpecial(){
  if(!G.sel||G.over||G.animPending)return;
  const{r,c}=G.sel,p=G.board[r][c],d=DEFS[p.type];
  if(!d.special||p.spCd>0)return;
  if(d.special.type==='aoe_stun'||d.special.type==='aoe_dmg'){
    doSpecial(r,c,r,c);
    sendAction({type:'special',fr:r,fc:c,tr:r,tc:c});
    if(!G.over){
      render();G.animPending=true;
      setTimeout(()=>{G.animPending=false;endTurn();},520);
    }
    return;
  }
  G.specMode=true;G.specTargets=getSpecialTargets(r,c,p,G.board);
  if(!G.specTargets.length){G.specMode=false;addLog('No valid targets.');}
  render();updateSidebar();
}

function activateBike(){
  if(!G.sel||G.over||G.animPending)return;
  const{r,c}=G.sel,p=G.board[r][c],d=DEFS[p.type];
  if(!d.legendary||p.bikeCd>0||p.bike||p.bikeTr)return;
  p.bikeTr=true;addLog(`${d.name} begins transforming into Bike Mode!`);
  SFX.bike();
  sendAction({type:'bike_transform',r,c});
  spawnEffect(getCellCenter(r,c),'promote',18);
  flashCell(r,c,'anim-bike');G.animPending=true;
  setTimeout(()=>{G.animPending=false;endTurn();},520);
}

// ─────────────────────────────────────────────────────────────────────────────
// RENDERING
// ─────────────────────────────────────────────────────────────────────────────
function renderBoardCoords(){
  const files='abcdefgh';
  const top=document.getElementById('board-coords-top');
  const bot=document.getElementById('board-coords-bottom');
  const left=document.getElementById('board-coords-left');
  const right=document.getElementById('board-coords-right');
  if(!top)return;
  top.innerHTML=files.split('').map(f=>`<span>${f}</span>`).join('');
  bot.innerHTML=top.innerHTML;
  left.innerHTML=[8,7,6,5,4,3,2,1].map(n=>`<span>${n}</span>`).join('');
  right.innerHTML=left.innerHTML;
}

function render(){
  const boardEl=document.getElementById('board');if(!boardEl)return;
  boardEl.innerHTML='';
  const lmMap={};G.legalMoves.forEach(m=>{lmMap[`${m.row},${m.col}`]=m;});
  const spSet=new Set((G.specTargets||[]).map(t=>`${t.row},${t.col}`));

  for(let r=0;r<8;r++) for(let c=0;c<8;c++){
    const cell=document.createElement('div');
    const key=`${r},${c}`;
    cell.className='cell '+((r+c)%2===0?'light':'dark');
    const isSel=G.sel&&G.sel.r===r&&G.sel.c===c;
    const mv=lmMap[key];
    if(isSel)cell.classList.add('sel');
    else if(spSet.has(key))cell.classList.add('spec-tgt');
    else if(mv){if(mv.type==='attack')cell.classList.add('attackable');else if(mv.type==='bike_charge')cell.classList.add('bike-tgt');else cell.classList.add('movable');}

    const p=G.board[r][c];
    if(p){
      const d=DEFS[p.type],pct=Math.round(p.hp/p.maxHp*100);
      const pe=document.createElement('div');
      pe.className=`piece ${p.side}${p.bike?' bike-mode':''}${p.status?` st-${p.status}`:''}`;
      const img=document.createElement('img');
      img.src=spriteUrl(p.type);img.alt=d.name;
      img.title=`${d.name}\nHP: ${p.hp}/${p.maxHp}  DMG: ${p.dmg}`;
      img.onerror=function(){this.style.display='none';pe.querySelector('.plabel').style.opacity='1';};
      const lbl=document.createElement('div');lbl.className='plabel';lbl.textContent=d.label;
      const hpBar=document.createElement('div');hpBar.className='hpbar';
      const hpFill=document.createElement('div');hpFill.className=`hpfill${pct<30?' low':pct<60?' mid':''}`;
      hpFill.style.width=pct+'%';hpBar.appendChild(hpFill);
      const hpTxt=document.createElement('div');hpTxt.className='hptext';hpTxt.textContent=`${p.hp}/${p.maxHp}`;
      pe.appendChild(img);pe.appendChild(lbl);pe.appendChild(hpBar);pe.appendChild(hpTxt);
      if(p.status){const si=document.createElement('div');si.className='sticon';si.textContent=p.status==='stunned'?'⚡':'❄';pe.appendChild(si);}
      if(p.bike){const bi=document.createElement('div');bi.className='bikeicon';bi.textContent='🚲';pe.appendChild(bi);}
      cell.appendChild(pe);
    }
    cell.addEventListener('click',()=>handleClick(r,c));
    boardEl.appendChild(cell);
  }
}

function updateUI(){
  const td=document.getElementById('turn-display');if(!td)return;
  if(G.mode==='online'&&G.mySide){
    td.textContent=G.currentTurn===G.mySide?'Your Turn!':'Opponent\'s Turn';
  }else{
    td.textContent=`${G.currentTurn==='scarlet'?'Scarlet':'Violet'}'s Turn`;
  }
  td.className=G.currentTurn;updateTimers();updateSidebar();
}

function updateTimers(){
  document.getElementById('scarlet-timer').textContent=fmt(G.timers.scarlet);
  document.getElementById('violet-timer').textContent=fmt(G.timers.violet);
  document.getElementById('scarlet-panel').classList.toggle('active',G.currentTurn==='scarlet');
  document.getElementById('violet-panel').classList.toggle('active',G.currentTurn==='violet');
}

function updateSidebar(){
  const info=document.getElementById('sel-info'),spBtn=document.getElementById('special-btn'),
        bkBtn=document.getElementById('bike-btn'),canBtn=document.getElementById('cancel-btn');
  if(!info)return;
  spBtn.style.display=bkBtn.style.display=canBtn.style.display='none';
  if(!G.sel){info.innerHTML='<p class="hint">Click a piece to select.</p>';return;}
  const{r,c}=G.sel,p=G.board[r][c];if(!p){info.innerHTML='';return;}
  const d=DEFS[p.type];
  canBtn.style.display='block';
  let html=`<div class="pname ${p.side}">${d.name}</div>`;
  html+=`<div class="pstats"><span>HP:<b> ${p.hp}/${p.maxHp}</b></span><span>DMG:<b> ${p.dmg}</b></span></div>`;
  if(p.status)html+=`<div class="pstatus ${p.status}">${p.status.toUpperCase()} (${p.stTurns}t)</div>`;
  if(p.bike)html+=`<div class="pstatus bike">🚲 BIKE MODE</div>`;
  if(p.bikeTr)html+=`<div class="pstatus transforming">TRANSFORMING…</div>`;
  if(p.spCd>0)html+=`<div class="pcd">Special CD: ${p.spCd}</div>`;
  if(p.bikeCd>0)html+=`<div class="pcd">Bike CD: ${p.bikeCd}</div>`;
  if(G.specMode)html+=`<div class="pcd" style="color:#9b8dff">▶ Click target</div>`;
  info.innerHTML=html;
  const myTurn=(G.mode!=='online')||(G.currentTurn===G.mySide);
  if(myTurn&&p.side===G.currentTurn){
    if(d.special&&p.spCd===0&&!G.specMode){spBtn.textContent=`✨ ${d.special.name}`;spBtn.style.display='block';}
    if(d.legendary&&p.bikeCd===0&&!p.bike&&!p.bikeTr)bkBtn.style.display='block';
  }
}

function addLog(msg){
  if(!G.log)G.log=[];G.log.unshift(msg);if(G.log.length>30)G.log.pop();
  const el=document.getElementById('log');if(el)el.innerHTML=G.log.map(m=>`<div>${m}</div>`).join('');
}

// ─────────────────────────────────────────────────────────────────────────────
// LEADERBOARD
// ─────────────────────────────────────────────────────────────────────────────
function renderLeaderboard(data){
  const list=document.getElementById('lb-list');if(!list)return;
  const medals=['🥇','🥈','🥉'];
  const myName=G.playerName||ACCOUNT?.name||'';
  list.innerHTML=data.map((p,i)=>{
    const medal=i<3?medals[i]:`#${i+1}`;
    const isMe=p.name===myName;
    return`<div class="lb-row${i===0?' top1':i===1?' top2':i===2?' top3':''}${isMe?' is-me':''}">
      <div class="lb-rank">${medal}</div>
      <div class="lb-name">${p.name}${isMe?' (you)':''}</div>
      <div class="lb-elo">${p.elo}</div>
      <div class="lb-record">${p.wins}W / ${p.losses}L</div>
    </div>`;
  }).join('');
}

// ─────────────────────────────────────────────────────────────────────────────
// RULEBOOK
// ─────────────────────────────────────────────────────────────────────────────
function showRulebook(){
  let modal=document.getElementById('rulebook-modal');
  if(!modal){
    modal=document.createElement('div');modal.id='rulebook-modal';
    modal.style.cssText='position:fixed;inset:0;z-index:600;background:rgba(0,0,0,0.9);display:flex;align-items:center;justify-content:center;backdrop-filter:blur(6px)';
    modal.innerHTML=`
      <div style="background:#050e05;border:1px solid rgba(34,197,94,0.4);border-radius:16px;padding:36px 44px;max-width:720px;width:92%;max-height:88vh;overflow-y:auto;color:#d1fae5;line-height:1.6">
        <h2 style="color:#ffd700;font-size:1.6rem;margin-bottom:18px;text-align:center">📖 PokéChess — Rulebook</h2>

        <h3 style="color:#22c55e;margin:14px 0 6px">🎯 Objective</h3>
        <p>Defeat the opponent's legendary (Koraidon or Miraidon) by reducing its HP to 0.</p>

        <h3 style="color:#22c55e;margin:14px 0 6px">⚔️ Combat System</h3>
        <p>Pieces are NOT removed on contact — every attack deals HP damage. A piece is only eliminated when its HP reaches 0. If an attacked piece survives, your piece stays where it is.</p>

        <h3 style="color:#22c55e;margin:14px 0 6px">♟️ Movement Types</h3>
        <table style="width:100%;border-collapse:collapse;font-size:0.83rem;margin-bottom:6px">
          <tr style="color:#ffd700"><th style="text-align:left;padding:4px 8px">Type</th><th style="text-align:left;padding:4px 8px">How it moves</th></tr>
          <tr style="border-top:1px solid #1a3a1a"><td style="padding:4px 8px">Queen</td><td style="padding:4px 8px">Any direction, any distance (blocked by pieces in the way)</td></tr>
          <tr style="border-top:1px solid #1a3a1a"><td style="padding:4px 8px">Rook</td><td style="padding:4px 8px">Orthogonal (up/down/left/right), any distance</td></tr>
          <tr style="border-top:1px solid #1a3a1a"><td style="padding:4px 8px">Leaping Bishop</td><td style="padding:4px 8px">Diagonal any distance, leaps over pieces — but can only attack the first enemy per diagonal</td></tr>
          <tr style="border-top:1px solid #1a3a1a"><td style="padding:4px 8px">Knight</td><td style="padding:4px 8px">L-shape (2+1 squares), always leaps over pieces</td></tr>
          <tr style="border-top:1px solid #1a3a1a"><td style="padding:4px 8px">Pawn (King-step)</td><td style="padding:4px 8px">1 square in any direction — promotes when reaching the far end</td></tr>
          <tr style="border-top:1px solid #1a3a1a"><td style="padding:4px 8px">Legendary</td><td style="padding:4px 8px">Rook + Bishop + Knight combined</td></tr>
        </table>

        <h3 style="color:#22c55e;margin:14px 0 6px">🔴 Scarlet Starters</h3>
        <table style="width:100%;border-collapse:collapse;font-size:0.82rem">
          <tr style="color:#ffd700"><th style="text-align:left;padding:3px 6px">Piece</th><th style="padding:3px 6px">HP/DMG</th><th style="text-align:left;padding:3px 6px">Special</th></tr>
          <tr style="border-top:1px solid #1a3a1a"><td style="padding:3px 6px">Koraidon</td><td style="padding:3px 6px;text-align:center">10/4</td><td style="padding:3px 6px">⚡ Bike Mode</td></tr>
          <tr style="border-top:1px solid #1a3a1a"><td style="padding:3px 6px">Roaring Moon (Queen)</td><td style="padding:3px 6px;text-align:center">9/4</td><td style="padding:3px 6px">Dragon Breath — 4 dmg to 1 adjacent enemy, CD2</td></tr>
          <tr style="border-top:1px solid #1a3a1a"><td style="padding:3px 6px">Flutter Mane (Leaping Bishop)</td><td style="padding:3px 6px;text-align:center">7/3</td><td style="padding:3px 6px">Phantom Strike — 4 dmg to 1 adjacent enemy, CD1</td></tr>
          <tr style="border-top:1px solid #1a3a1a"><td style="padding:3px 6px">Scream Tail (Knight)</td><td style="padding:3px 6px;text-align:center">6/2</td><td style="padding:3px 6px">Stun Aura — stuns ALL adjacent pieces (including allies!) 1 turn, CD3</td></tr>
          <tr style="border-top:1px solid #1a3a1a"><td style="padding:3px 6px">Raging Bolt (Rook)</td><td style="padding:3px 6px;text-align:center">9/4</td><td style="padding:3px 6px">—</td></tr>
          <tr style="border-top:1px solid #1a3a1a"><td style="padding:3px 6px">Sandy Shocks (Pawn)</td><td style="padding:3px 6px;text-align:center">7/2</td><td style="padding:3px 6px">Promotes at far end: +2 max HP, +1 dmg, full heal</td></tr>
        </table>

        <h3 style="color:#22c55e;margin:14px 0 6px">🟣 Violet Starters</h3>
        <table style="width:100%;border-collapse:collapse;font-size:0.82rem">
          <tr style="color:#ffd700"><th style="text-align:left;padding:3px 6px">Piece</th><th style="padding:3px 6px">HP/DMG</th><th style="text-align:left;padding:3px 6px">Special</th></tr>
          <tr style="border-top:1px solid #1a3a1a"><td style="padding:3px 6px">Miraidon</td><td style="padding:3px 6px;text-align:center">10/4</td><td style="padding:3px 6px">⚡ Bike Mode</td></tr>
          <tr style="border-top:1px solid #1a3a1a"><td style="padding:3px 6px">Iron Jugulis (Queen)</td><td style="padding:3px 6px;text-align:center">9/4</td><td style="padding:3px 6px">Hyper Voice — 4 dmg to 1 adjacent enemy, CD2</td></tr>
          <tr style="border-top:1px solid #1a3a1a"><td style="padding:3px 6px">Iron Crown (Leaping Bishop)</td><td style="padding:3px 6px;text-align:center">7/3</td><td style="padding:3px 6px">Phantom Strike — 4 dmg to 1 adjacent enemy, CD1</td></tr>
          <tr style="border-top:1px solid #1a3a1a"><td style="padding:3px 6px">Iron Bundle (Knight)</td><td style="padding:3px 6px;text-align:center">6/2</td><td style="padding:3px 6px">Freeze — freezes 1 adjacent enemy for 1 turn (no dmg), CD3</td></tr>
          <tr style="border-top:1px solid #1a3a1a"><td style="padding:3px 6px">Iron Boulder (Rook)</td><td style="padding:3px 6px;text-align:center">9/4</td><td style="padding:3px 6px">—</td></tr>
          <tr style="border-top:1px solid #1a3a1a"><td style="padding:3px 6px">Iron Moth (Pawn)</td><td style="padding:3px 6px;text-align:center">7/2</td><td style="padding:3px 6px">Promotes at far end: +2 max HP, +1 dmg, full heal</td></tr>
        </table>

        <h3 style="color:#22c55e;margin:14px 0 6px">🔓 Unlockable Pieces (earn ELO to unlock)</h3>
        <table style="width:100%;border-collapse:collapse;font-size:0.8rem">
          <tr style="color:#ffd700"><th style="text-align:left;padding:3px 6px">ELO</th><th style="text-align:left;padding:3px 6px">Scarlet Unlock</th><th style="text-align:left;padding:3px 6px">Violet Unlock</th></tr>
          <tr style="border-top:1px solid #1a3a1a"><td style="padding:3px 6px">150</td><td style="padding:3px 6px">Armarouge (Pawn) — Armor Cannon: 4 dmg ranged, CD2</td><td style="padding:3px 6px">Ceruledge (Pawn) — Bitter Blade: 4 dmg ranged, CD2</td></tr>
          <tr style="border-top:1px solid #1a3a1a"><td style="padding:3px 6px">250</td><td style="padding:3px 6px">Walking Wake (Queen) — Hydro Pump: 5 dmg ranged, CD2</td><td style="padding:3px 6px">Iron Valiant (Queen) — Sacred Sword: 5 dmg ranged, CD2</td></tr>
          <tr style="border-top:1px solid #1a3a1a"><td style="padding:3px 6px">350</td><td style="padding:3px 6px">Annihilape (Knight) — Rage Fist: 4 dmg ranged, CD2</td><td style="padding:3px 6px">Pawmot (Knight) — Revival Blessing: stuns all adjacent, CD4 &nbsp;/&nbsp; Skeledirge (Bishop) — Torch Song: 4 dmg, CD2</td></tr>
          <tr style="border-top:1px solid #1a3a1a"><td style="padding:3px 6px">500</td><td style="padding:3px 6px">Slither Wing (Rook) — Hurricane: 3 dmg + stun, CD3</td><td style="padding:3px 6px">Iron Hands (Rook) — 11 HP tank, no special</td></tr>
          <tr style="border-top:1px solid #1a3a1a"><td style="padding:3px 6px">600</td><td style="padding:3px 6px">Meowscarada (Queen) — Flower Trick: 4 dmg, CD1</td><td style="padding:3px 6px">Veluza (Queen) — Fillet Away: 5 dmg, CD2</td></tr>
          <tr style="border-top:1px solid #1a3a1a"><td style="padding:3px 6px">750</td><td style="padding:3px 6px">Gouging Fire (Knight) — Inferno: 2 dmg to ALL adjacent enemies, CD3</td><td style="padding:3px 6px">Iron Thorns (Knight) — Thunder Cage: 4 dmg ranged, CD2</td></tr>
          <tr style="border-top:1px solid #1a3a1a"><td style="padding:3px 6px">900</td><td style="padding:3px 6px">Tinkaton (Rook) — Gigaton Hammer: 5 dmg + stun, CD3</td><td style="padding:3px 6px">Palafin (Rook) — Jet Punch: 3 dmg, CD1</td></tr>
          <tr style="border-top:1px solid #1a3a1a"><td style="padding:3px 6px">1000</td><td style="padding:3px 6px">Brute Bonnet (Bishop) — Spore: freezes 1 adjacent, CD4</td><td style="padding:3px 6px">Chien-Pao (Bishop) — Ruinous Ice: 5 dmg + stun, CD3</td></tr>
          <tr style="border-top:1px solid #1a3a1a"><td style="padding:3px 6px">1250</td><td style="padding:3px 6px">Great Tusk (Rook) — Headlong Rush: 4 dmg + stun, CD3</td><td style="padding:3px 6px">Ting-Lu (Rook) — Ruinous Shock: 3 dmg to ALL adjacent enemies, CD3</td></tr>
          <tr style="border-top:1px solid #1a3a1a"><td style="padding:3px 6px">1500</td><td style="padding:3px 6px">Chi-Yu (Queen) — Ruinous Flame: 6 dmg ranged, CD2</td><td style="padding:3px 6px">Iron Leaves (Queen) — Psycho Cut: 5 dmg ranged, CD2</td></tr>
          <tr style="border-top:1px solid #1a3a1a"><td style="padding:3px 6px">1750</td><td style="padding:3px 6px">Glimmora (Bishop) — Mortal Spin: 3 dmg to ALL adjacent enemies, CD2</td><td style="padding:3px 6px">Iron Treads (Bishop) — no special, 9 HP</td></tr>
          <tr style="border-top:1px solid #1a3a1a"><td style="padding:3px 6px">2000</td><td style="padding:3px 6px">Salamence (Queen) — Outrage: 4 dmg to ALL adjacent enemies, CD4</td><td style="padding:3px 6px">Hydreigon (Queen) — Hyper Voice: 4 dmg to ALL adjacent enemies, CD4</td></tr>
        </table>

        <h3 style="color:#22c55e;margin:14px 0 6px">✨ Special Ability Types</h3>
        <p><b style="color:#ffd700">Ranged</b> — targets 1 adjacent enemy square, deals damage.<br>
        <b style="color:#ffd700">Ranged + Stun</b> — damages and stuns the target for 1 turn.<br>
        <b style="color:#ffd700">AOE Damage</b> — instantly hits ALL adjacent enemies for damage. Just press ✨ Special, no targeting needed.<br>
        <b style="color:#ffd700">AOE Stun</b> — stuns ALL adjacent pieces (including your own!) for 1 turn.<br>
        <b style="color:#ffd700">Freeze</b> — targets 1 adjacent enemy, freezes them for 1 turn (no damage).<br>
        All specials share a cooldown (CD) — the number of turns before it can be used again.</p>

        <h3 style="color:#22c55e;margin:14px 0 6px">🚲 Bike Mode (Koraidon / Miraidon)</h3>
        <p>Spend 1 turn transforming. Next turn: charge in a cardinal direction, dealing 2 dmg to all enemies in the path and 1 dmg to enemies 1 tile to the side. Legendary lands at the last empty square. 3-turn cooldown.</p>

        <h3 style="color:#22c55e;margin:14px 0 6px">⭐ Promotion (Pawns)</h3>
        <p>When any pawn reaches the opposite end of the board: full HP restore, Max HP +2, Damage +1. The game does NOT end if a pawn is eliminated.</p>

        <h3 style="color:#22c55e;margin:14px 0 6px">🌀 Status Effects</h3>
        <p><b style="color:#faff00">Stunned</b> — Cannot move for 1 turn.<br>
        <b style="color:#00d4ff">Frozen</b> — Cannot move for 1 turn. Clears after the frozen piece's next turn.</p>

        <h3 style="color:#22c55e;margin:14px 0 6px">⏱ Timer</h3>
        <p>Each player has a personal clock (Short=10min, Medium=25min, Long=45min). Running out of time = loss.</p>

        <h3 style="color:#22c55e;margin:14px 0 6px">🏆 ELO & Ranking</h3>
        <p>Win matches to earn ELO. New unlockable Pokémon appear every 150–250 ELO. Customize your team from the menu before starting a game.</p>

        <div style="text-align:center;margin-top:20px">
          <button onclick="document.getElementById('rulebook-modal').style.display='none'" style="background:linear-gradient(135deg,#22c55e,#fbbf24);color:#031a03;border:none;border-radius:8px;padding:10px 28px;font-weight:800;cursor:pointer;font-size:0.95rem">Got it!</button>
        </div>
      </div>`;
    document.body.appendChild(modal);
  }
  modal.style.display='flex';
}

// ─────────────────────────────────────────────────────────────────────────────
// GAME FLOW
// ─────────────────────────────────────────────────────────────────────────────
function startGame(){
  const length=document.getElementById('gameLength').value;
  const mode  =document.getElementById('gameMode').value;
  const diff  =parseInt(document.getElementById('difficulty').value);
  const rawName=(ACCOUNT?.name||'Player');
  clearInterval(G.timerInt);

  const botViolet=mode==='ai'?getBotLoadout(getDiffTier(diff)):null;
  G={
    board:initBoard(ACCOUNT?.team||{},botViolet),currentTurn:'scarlet',
    sel:null,legalMoves:[],specMode:false,specTargets:[],
    mode,difficulty:diff,mySide:null,roomId:null,
    playerName:rawName,opponentName:null,
    timers:{scarlet:TIMES[length],violet:TIMES[length]},
    over:false,log:[],timerInt:null,animPending:false,
    leaderboard:[],onlineEloDelta:null,
  };

  if(mode==='online'){
    document.getElementById('menu').style.display='none';
    document.getElementById('queue-screen').style.display='flex';
    document.getElementById('queue-my-name').textContent=rawName;
    document.getElementById('match-found-banner').style.display='none';
    document.getElementById('queue-countdown').style.display='none';
    document.getElementById('queue-pos').textContent='';
    document.getElementById('queue-status-text').textContent='Searching…';
    initSocket(rawName);
    return;
  }

  // AI or PvP — start immediately
  document.getElementById('menu').style.display='none';
  document.getElementById('game').style.display='flex';
  document.getElementById('game-over').style.display='none';
  document.getElementById('scarlet-label').textContent=mode==='pvp'?'Player 1':'You';
  document.getElementById('violet-label').textContent=mode==='pvp'?'Player 2':'AI';
  G.mySide='scarlet';
  renderBoardCoords();render();updateUI();
  addLog('Game started! Scarlet moves first.');
  G.timerInt=setInterval(tickTimer,1000);
}

function showMenu(){
  clearInterval(G.timerInt);
  if(socket){socket.emit('leave_queue');socket.disconnect();socket=null;}
  ['game-over','game','queue-screen'].forEach(id=>{const el=document.getElementById(id);if(el)el.style.display='none';});
  document.getElementById('menu').style.display='flex';
  refreshEloDisplay();
}

function logout(){
  localStorage.removeItem(TOKEN_KEY);
  ACCOUNT=null;
  if(socket){socket.emit('leave_queue');socket.disconnect();socket=null;}
  clearInterval(G.timerInt);
  ['game-over','game','queue-screen','menu'].forEach(id=>{const el=document.getElementById(id);if(el)el.style.display='none';});
  document.getElementById('auth-screen').style.display='flex';
  // Reset auth form
  document.getElementById('auth-name').value='';
  document.getElementById('auth-pass').value='';
  document.getElementById('auth-error').style.display='none';
}

function endGame(winner){
  G.over=true;clearInterval(G.timerInt);
  const side=winner.toLowerCase();
  // Play win or lose sound based on whether local player won
  if(G.mode==='pvp'){SFX.win();}
  else{const mySide=G.mySide||'scarlet';(side===mySide)?SFX.win():SFX.lose();}
  document.getElementById('winner-emoji').textContent=side==='scarlet'?'🔴':'🟣';
  const wt=document.getElementById('winner-text');wt.textContent=`${winner} Wins!`;wt.className=side;

  console.log('[ELO] endGame winner=',winner,'mode=',G.mode,'account=',ACCOUNT);
  const eloEl=document.getElementById('elo-change-display');
  if(G.mode==='ai'&&ACCOUNT){
    const oldElo=ACCOUNT.elo,aiElo=AI_ELO_MAP[G.difficulty]||1000;
    const result=winner.toLowerCase()==='scarlet'?1:0;
    const newElo=calcNewElo(oldElo,aiElo,result);
    const delta=newElo-oldElo;
    const newWins  =ACCOUNT.wins  +(result===1?1:0);
    const newLosses=ACCOUNT.losses+(result===0?1:0);
    ACCOUNT.elo=newElo;ACCOUNT.wins=newWins;ACCOUNT.losses=newLosses;
    saveResultToServer(newElo,newWins,newLosses);
    eloEl.innerHTML=`${oldElo} → <b>${newElo}</b> (${delta>=0?'+':''}${delta}) — ${getRank(newElo)}`;
    eloEl.style.display='block';
  }else if(G.mode==='ai'){
    eloEl.style.display='none';
  }else if(G.mode==='online'&&G.onlineEloDelta){
    const{elo,delta}=G.onlineEloDelta;
    eloEl.innerHTML=`ELO: <b>${elo}</b> (${delta>=0?'+':''}${delta}) — ${getRank(elo)}`;
    eloEl.style.display='block';
    if(socket)socket.emit('game_over',{roomId:G.roomId,winnerName:winner==='Scarlet'?
      (G.mySide==='scarlet'?G.playerName:G.opponentName):(G.mySide==='violet'?G.playerName:G.opponentName),
      loserName:winner==='Scarlet'?(G.mySide==='violet'?G.playerName:G.opponentName):(G.mySide==='scarlet'?G.playerName:G.opponentName)});
  }else{eloEl.style.display='none';}

  document.getElementById('game-over').style.display='flex';
  launchConfetti(side);
}

// ─────────────────────────────────────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded',async ()=>{
  initBg();drawEffects();

  // ── Auth screen wiring ──
  document.getElementById('tab-login').addEventListener('click',()=>{
    authMode='login';
    document.getElementById('tab-login').classList.add('active');
    document.getElementById('tab-register').classList.remove('active');
    document.getElementById('auth-submit-btn').textContent='Login';
    document.getElementById('auth-error').style.display='none';
  });
  document.getElementById('tab-register').addEventListener('click',()=>{
    authMode='register';
    document.getElementById('tab-register').classList.add('active');
    document.getElementById('tab-login').classList.remove('active');
    document.getElementById('auth-submit-btn').textContent='Create Account';
    document.getElementById('auth-error').style.display='none';
  });
  document.getElementById('auth-submit-btn').addEventListener('click',doAuth);
  document.getElementById('auth-pass').addEventListener('keydown',e=>{if(e.key==='Enter')doAuth();});
  document.getElementById('auth-name').addEventListener('keydown',e=>{if(e.key==='Enter')doAuth();});

  // ── Try auto-login ──
  const ok=await tryAutoLogin();
  if(ok){enterMenu();}
  // else auth-screen is already visible (default)


  // ── Difficulty slider ──
  const sl=document.getElementById('difficulty'),sv=document.getElementById('difficultyVal');
  function updateDiffDisplay(){
    const v=parseInt(sl.value);
    sv.textContent=v;
    const tier=getDiffTier(v);
    const badge=document.getElementById('ai-tier-badge');
    badge.textContent=tier;
    badge.className='ai-tier-badge tier-'+tier.toLowerCase();
    document.getElementById('ai-elo-hint').textContent=`AI Rating: ~${AI_ELO_MAP[v]||1000}`;
  }
  sl.addEventListener('input',updateDiffDisplay);
  updateDiffDisplay();

  // ── Mode selector → show/hide difficulty ──
  const modeSel=document.getElementById('gameMode');
  const diffGroup=document.getElementById('difficultyGroup');
  modeSel.addEventListener('change',e=>{
    diffGroup.style.display=e.target.value==='ai'?'block':'none';
  });
  diffGroup.style.display=modeSel.value==='ai'?'block':'none';

  // ── Menu / game buttons ──
  document.getElementById('startBtn').addEventListener('click',startGame);
  document.getElementById('logoutBtn').addEventListener('click',logout);
  document.getElementById('special-btn').addEventListener('click',useSpecial);
  document.getElementById('bike-btn').addEventListener('click',activateBike);
  document.getElementById('cancel-btn').addEventListener('click',cancelSelection);
  document.getElementById('mute-btn').addEventListener('click',()=>{
    const muted=SFX.toggle();
    document.getElementById('mute-btn').textContent=muted?'🔇 Muted':'🔊 Sound';
  });
  document.getElementById('playAgainBtn').addEventListener('click',showMenu);
  document.getElementById('cancelQueueBtn').addEventListener('click',()=>{
    if(socket){socket.emit('leave_queue');socket.disconnect();socket=null;}
    showMenu();
  });
  document.getElementById('lbBtn').addEventListener('click',async()=>{
    document.getElementById('lb-modal').style.display='flex';
    document.getElementById('lb-list').innerHTML='<div style="color:#3a5a3a;text-align:center;padding:20px">Loading…</div>';
    try{
      const res=await fetch('/leaderboard');
      const data=await res.json();
      if(data.length)renderLeaderboard(data);
      else document.getElementById('lb-list').innerHTML='<div style="color:#3a5a3a;text-align:center;padding:20px">No players yet.</div>';
    }catch{
      document.getElementById('lb-list').innerHTML='<div style="color:#3a5a3a;text-align:center;padding:20px">Could not load leaderboard.</div>';
    }
  });
  document.getElementById('lb-close-btn').addEventListener('click',()=>{document.getElementById('lb-modal').style.display='none';});

  // ── Rules button ──
  const rulesBtn=document.createElement('button');
  rulesBtn.textContent='📖 Rules';rulesBtn.className='btn-secondary';
  rulesBtn.addEventListener('click',showRulebook);
  document.querySelector('.menu-options').appendChild(rulesBtn);

  // ── Team button ──
  const teamBtn=document.createElement('button');
  teamBtn.textContent='⚙️ My Team';teamBtn.className='btn-secondary';
  teamBtn.addEventListener('click',showTeamCustomizer);
  document.querySelector('.menu-options').appendChild(teamBtn);

  // ── Keyboard ──
  document.addEventListener('keydown',e=>{if(e.key==='Escape')cancelSelection();});
});
