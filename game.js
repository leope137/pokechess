'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// PIECE DEFINITIONS  (verified national dex IDs via PokéAPI)
// ─────────────────────────────────────────────────────────────────────────────
const DEFS = {
  koraidon:     { name:'Koraidon',     side:'scarlet', hp:10, dmg:4, move:'legendary',    label:'KOR', legendary:true,  bikeDmg:2, bikeSide:1, bikeCdMax:3, dexId:1007 },
  miraidon:     { name:'Miraidon',     side:'violet',  hp:10, dmg:4, move:'legendary',    label:'MIR', legendary:true,  bikeDmg:2, bikeSide:1, bikeCdMax:3, dexId:1008 },
  flutter_mane: { name:'Flutter Mane', side:'scarlet', hp:8,  dmg:3, move:'queen',        label:'FLM', dexId:987,
    special:{ name:'Phantom Strike', type:'ranged', dmg:4, cd:1 } },              // buffed: 3→4 dmg
  iron_crown:   { name:'Iron Crown',   side:'violet',  hp:8,  dmg:3, move:'queen',        label:'ICR', dexId:1023,
    special:{ name:'Phantom Strike', type:'ranged', dmg:4, cd:1 } },              // buffed
  roaring_moon: { name:'Roaring Moon', side:'scarlet', hp:7,  dmg:3, move:'leap_bishop',  label:'ROM', dexId:1005 },
  iron_jugulis: { name:'Iron Jugulis', side:'violet',  hp:7,  dmg:3, move:'leap_bishop',  label:'IJU', dexId:993  },
  scream_tail:  { name:'Scream Tail',  side:'scarlet', hp:6,  dmg:2, move:'knight',       label:'SCT', dexId:985,
    special:{ name:'Stun Aura', type:'aoe_stun', cd:3 } },
  iron_bundle:  { name:'Iron Bundle',  side:'violet',  hp:6,  dmg:2, move:'knight',       label:'IBU', dexId:991,
    special:{ name:'Freeze', type:'freeze', dmg:0, cd:3 } },                      // nerfed: dmg 2→0, cd 2→3
  raging_bolt:  { name:'Raging Bolt',  side:'scarlet', hp:9,  dmg:4, move:'rook',         label:'RGB', dexId:1021 },
  iron_boulder: { name:'Iron Boulder', side:'violet',  hp:9,  dmg:4, move:'rook',         label:'IBL', dexId:1022 },
  sandy_shocks: { name:'Sandy Shocks', side:'scarlet', hp:7,  dmg:2, move:'king',         label:'SAS', dexId:989,  pawn:true, promRow:0 },
  iron_moth:    { name:'Iron Moth',    side:'violet',  hp:7,  dmg:2, move:'king',         label:'IMO', dexId:994,  pawn:true, promRow:7 },
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

const spriteUrl = t =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${DEFS[t].dexId}.png`;

// ─────────────────────────────────────────────────────────────────────────────
// GLOBAL STATE
// ─────────────────────────────────────────────────────────────────────────────
let G = {};
let socket = null;
let ACCOUNT = null;  // persists across game resets — never wiped by startGame()

// ─────────────────────────────────────────────────────────────────────────────
// BOARD
// ─────────────────────────────────────────────────────────────────────────────
const mkPiece = t => {
  const d = DEFS[t];
  return { type:t, side:d.side, hp:d.hp, maxHp:d.hp, dmg:d.dmg,
           spCd:0, status:null, stTurns:0, bike:false, bikeTr:false, bikeCd:0 };
};

function initBoard() {
  const b = Array.from({length:8},()=>Array(8).fill(null));
  START.forEach((row,r)=>{ if(row) row.forEach((t,c)=>{ b[r][c]=mkPiece(t); }); });
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
  if(d.special.type==='ranged'||d.special.type==='freeze'){
    for(let dr=-1;dr<=1;dr++) for(let dc=-1;dc<=1;dc++){
      if(!dr&&!dc)continue;
      const nr=r+dr,nc=c+dc;
      if(!OB(nr,nc))continue;
      const t=b[nr][nc];
      if(t&&t.side!==p.side)tgts.push({row:nr,col:nc,type:'special'});
    }
  }else if(d.special.type==='aoe_stun'){
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
    if(DEFS[piece.type].legendary)endGame(piece.side==='scarlet'?'Violet':'Scarlet');
  }
}

function checkPromotion(r,c,p){
  const d=DEFS[p.type];
  if(!d.pawn||r!==d.promRow||p.promoted)return;
  p.promoted=true;p.maxHp+=2;p.hp=p.maxHp;p.dmg+=1;
  addLog(`${d.name} promoted! Max HP +2, HP restored, DMG +1!`);
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
    hit(tgt,tr,tc,p.dmg);
    if(G.over)return;
    if(!G.board[tr][tc]){G.board[tr][tc]=p;G.board[fr][fc]=null;checkPromotion(tr,tc,p);}
    if(bigHit)triggerShake();
  }else{
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
  triggerShake();
}

function doSpecial(fr,fc,tr,tc){
  if(G.over)return;
  const p=G.board[fr][fc],d=DEFS[p.type],spec=d.special;
  if(spec.type==='ranged'){
    const tgt=G.board[tr][tc];
    if(tgt){addLog(`${d.name} → ${spec.name} on ${DEFS[tgt.type].name} for ${spec.dmg} dmg!`);hit(tgt,tr,tc,spec.dmg);}
  }else if(spec.type==='aoe_stun'){
    let n=0;
    for(let dr=-1;dr<=1;dr++) for(let dc=-1;dc<=1;dc++){
      if(!dr&&!dc)continue;
      const nr=fr+dr,nc=fc+dc;
      if(!OB(nr,nc))continue;
      const t=G.board[nr][nc];
      if(t&&t.side!==p.side){t.status='stunned';t.stTurns=1;n++;flashCell(nr,nc,'anim-stun');}
    }
    addLog(`${d.name} → ${spec.name}! ${n} enem${n===1?'y':'ies'} stunned!`);
  }else if(spec.type==='freeze'){
    const tgt=G.board[tr][tc];
    if(tgt){
      if(spec.dmg>0){addLog(`${d.name} → ${spec.name} on ${DEFS[tgt.type].name}!`);hit(tgt,tr,tc,spec.dmg);}
      if(!G.over&&G.board[tr][tc]){tgt.status='frozen';tgt.stTurns=1;addLog(`${DEFS[tgt.type].name} is frozen!`);}
      else if(!G.over)addLog(`${d.name} → ${spec.name} on ${DEFS[tgt.type].name}!`);
    }
  }
  p.spCd=spec.cd;
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
  if((spec.type==='ranged'||spec.type==='freeze')&&nb[tr][tc]){
    if(spec.dmg>0){nb[tr][tc].hp-=spec.dmg;if(nb[tr][tc].hp<=0)nb[tr][tc]=null;}
    if(spec.type==='freeze'&&nb[tr][tc]){nb[tr][tc].status='frozen';nb[tr][tc].stTurns=1;}
  }else if(spec.type==='aoe_stun'){
    for(let dr=-1;dr<=1;dr++) for(let dc=-1;dc<=1;dc++){
      if(!dr&&!dc)continue;const nr=fr+dr,nc=fc+dc;
      if(nr>=0&&nr<8&&nc>=0&&nc<8&&nb[nr][nc]&&nb[nr][nc].side!==p.side){nb[nr][nc].status='stunned';nb[nr][nc].stTurns=1;}
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

function aiTurn(){
  if(G.over)return;
  const diff=G.difficulty,depth=diff<=3?1:diff<=7?2:3;
  const noise=Math.pow(11-diff,2)*8;
  // Lower difficulties skip their turn occasionally (feels less relentless)
  const skipChance=diff<=3?0.30:diff<=5?0.18:diff<=7?0.08:0;
  if(Math.random()<skipChance){endTurn();return;}
  const moves=getAIMoves('violet',G.board);
  if(moves.length===0){endTurn();return;}
  let bestScore=-Infinity,bestMove=moves[0];
  for(const m of moves){
    const nb=m.kind==='special'?simSpecial(G.board,m.fr,m.fc,m.tr,m.tc):simMove(G.board,m.fr,m.fc,m.mv);
    const score=minimax(nb,depth-1,-Infinity,Infinity,false)+(Math.random()-0.3)*noise;
    if(score>bestScore){bestScore=score;bestMove=m;}
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
    if(atype==='attack')spawnEffect(center,'attack',28);
    else if(atype==='move')spawnEffect(center,'move',14);
    renderWithAnim(afr,afc,atr,atc,atype);
    setTimeout(endTurn,340);
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
    ACCOUNT={name:data.name,elo:data.elo,wins:data.wins,losses:data.losses,token:data.token};
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
    if(data.ok){ACCOUNT={name:data.name,elo:data.elo,wins:data.wins,losses:data.losses,token};return true;}
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
    if(atype==='attack')spawnEffect(center,'attack',24);
    renderWithAnim(afr,afc,atr,atc,atype);
    G.animPending=true;
    setTimeout(()=>{G.animPending=false;endTurn();},340);
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
  render();updateUI();
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
const effects=[];

function getCellCenter(r,c){
  const board=document.getElementById('board');if(!board)return{x:0,y:0};
  const rect=board.getBoundingClientRect();
  const CELL=88;
  return{x:rect.left+c*CELL+CELL/2,y:rect.top+r*CELL+CELL/2};
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
  for(let i=0;i<count;i++){
    const angle=Math.random()*Math.PI*2,speed=Math.random()*5+(type==='attack'?2:1);
    effects.push({
      x:center.x+(Math.random()-0.5)*16,y:center.y+(Math.random()-0.5)*16,
      vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed-1.5,
      color:cl[Math.floor(Math.random()*cl.length)],
      life:1,decay:0.024+Math.random()*0.022,size:Math.random()*5+2,grav:0.09,
    });
  }
}

function drawEffects(){
  const cv=document.getElementById('effect-canvas');if(!cv)return;
  cv.width=window.innerWidth;cv.height=window.innerHeight;
  const ctx=cv.getContext('2d');ctx.clearRect(0,0,cv.width,cv.height);
  for(let i=effects.length-1;i>=0;i--){
    const e=effects[i];
    e.x+=e.vx;e.y+=e.vy;e.vy+=e.grav;e.life-=e.decay;
    if(e.life<=0){effects.splice(i,1);continue;}
    ctx.save();ctx.globalAlpha=e.life;ctx.fillStyle=e.color;
    ctx.shadowBlur=8;ctx.shadowColor=e.color;
    ctx.beginPath();ctx.arc(e.x,e.y,e.size*e.life,0,Math.PI*2);ctx.fill();
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
  else if(actionType==='attack'||actionType==='special'){dest.classList.add('anim-hurt');if(src)src.classList.add('anim-attack');}
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
        spawnEffect(getCellCenter(r,c),'special',22);
        renderWithAnim(fr,fc,r,c,'special');G.animPending=true;
        setTimeout(()=>{G.animPending=false;endTurn();},340);
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
  if(d.special.type==='aoe_stun'){
    doSpecial(r,c,r,c);
    sendAction({type:'special',fr:r,fc:c,tr:r,tc:c});
    if(!G.over){render();for(let dr=-1;dr<=1;dr++) for(let dc=-1;dc<=1;dc++){if(!dr&&!dc)continue;flashCell(r+dr,c+dc,'anim-stun');spawnEffect(getCellCenter(r+dr,c+dc),'special',12);}
      G.animPending=true;setTimeout(()=>{G.animPending=false;endTurn();},420);}
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
  sendAction({type:'bike_transform',r,c});
  spawnEffect(getCellCenter(r,c),'promote',18);
  flashCell(r,c,'anim-bike');G.animPending=true;
  setTimeout(()=>{G.animPending=false;endTurn();},520);
}

// ─────────────────────────────────────────────────────────────────────────────
// RENDERING
// ─────────────────────────────────────────────────────────────────────────────
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
  td.textContent=`${G.currentTurn==='scarlet'?'Scarlet':'Violet'}'s Turn`;
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
      <div style="background:#050e05;border:1px solid rgba(34,197,94,0.4);border-radius:16px;padding:36px 44px;max-width:680px;width:92%;max-height:85vh;overflow-y:auto;color:#d1fae5;line-height:1.6">
        <h2 style="color:#ffd700;font-size:1.6rem;margin-bottom:18px;text-align:center">📖 PokéChess — Rulebook</h2>

        <h3 style="color:#22c55e;margin:14px 0 6px">🎯 Objective</h3>
        <p>Defeat the opponent's legendary (Koraidon or Miraidon) by reducing its HP to 0.</p>

        <h3 style="color:#22c55e;margin:14px 0 6px">⚔️ Combat System</h3>
        <p>Pieces are NOT removed on contact. Every attack deals HP damage. A piece is eliminated only when its HP reaches 0. If you attack an enemy that survives, your piece stays in place.</p>

        <h3 style="color:#22c55e;margin:14px 0 6px">♟️ Pieces & Movement</h3>
        <table style="width:100%;border-collapse:collapse;font-size:0.85rem">
          <tr style="color:#ffd700"><th style="text-align:left;padding:4px 8px">Piece</th><th style="text-align:left;padding:4px 8px">Movement</th><th style="text-align:left;padding:4px 8px">HP / DMG</th><th style="text-align:left;padding:4px 8px">Special</th></tr>
          <tr style="border-top:1px solid #1a3a1a"><td style="padding:4px 8px">Koraidon / Miraidon</td><td style="padding:4px 8px">Rook + Bishop + Knight</td><td style="padding:4px 8px">10 HP / 4 DMG</td><td style="padding:4px 8px">Bike Mode (see below)</td></tr>
          <tr style="border-top:1px solid #1a3a1a"><td style="padding:4px 8px">Flutter Mane / Iron Crown</td><td style="padding:4px 8px">Queen (all 8 dirs)</td><td style="padding:4px 8px">8 HP / 3 DMG</td><td style="padding:4px 8px">Phantom Strike: 4 dmg, 1-tile, CD1</td></tr>
          <tr style="border-top:1px solid #1a3a1a"><td style="padding:4px 8px">Roaring Moon / Iron Jugulis</td><td style="padding:4px 8px">Bishop + leaps over pieces*</td><td style="padding:4px 8px">7 HP / 3 DMG</td><td style="padding:4px 8px">—</td></tr>
          <tr style="border-top:1px solid #1a3a1a"><td style="padding:4px 8px">Scream Tail</td><td style="padding:4px 8px">Knight (L-shape, leaps)</td><td style="padding:4px 8px">6 HP / 2 DMG</td><td style="padding:4px 8px">Stun Aura: stun all adjacent enemies 1 turn, CD3</td></tr>
          <tr style="border-top:1px solid #1a3a1a"><td style="padding:4px 8px">Iron Bundle</td><td style="padding:4px 8px">Knight (L-shape, leaps)</td><td style="padding:4px 8px">6 HP / 2 DMG</td><td style="padding:4px 8px">Freeze: 1-tile enemy frozen 1 turn, CD3 (no damage)</td></tr>
          <tr style="border-top:1px solid #1a3a1a"><td style="padding:4px 8px">Raging Bolt / Iron Boulder</td><td style="padding:4px 8px">Rook (orthogonal, any distance)</td><td style="padding:4px 8px">9 HP / 4 DMG</td><td style="padding:4px 8px">—</td></tr>
          <tr style="border-top:1px solid #1a3a1a"><td style="padding:4px 8px">Sandy Shocks / Iron Moth</td><td style="padding:4px 8px">King (1 square any direction)</td><td style="padding:4px 8px">7 HP / 2 DMG</td><td style="padding:4px 8px">Promotion on reaching far end</td></tr>
        </table>
        <p style="color:#4a7a4a;font-size:0.78rem;margin-top:6px">* Leaping Bishop: can jump over any piece for movement, but can only capture the FIRST enemy in each diagonal direction (can't capture through a jumped piece).</p>

        <h3 style="color:#22c55e;margin:14px 0 6px">🚲 Bike Mode (Koraidon / Miraidon)</h3>
        <p>Spend 1 turn to transform. Next turn: charge in any cardinal direction, dealing 2 damage to all enemies in the path and 1 damage to enemies 1 tile to the side. The legendary lands at the last empty square in the path. 3-turn cooldown after use.</p>

        <h3 style="color:#22c55e;margin:14px 0 6px">⭐ Promotion (Sandy Shocks / Iron Moth)</h3>
        <p>When a Sandy Shocks or Iron Moth reaches the opposite end of the board: HP fully restored, Max HP +2, Damage +1. Losing these does NOT end the game.</p>

        <h3 style="color:#22c55e;margin:14px 0 6px">🌀 Status Effects</h3>
        <p><b style="color:#faff00">Stunned</b> — Cannot move for 1 turn. Applied by Scream Tail's Stun Aura.<br>
        <b style="color:#00d4ff">Frozen</b> — Cannot move for 1 turn. Applied by Iron Bundle's Freeze. Clears after their next turn.</p>

        <h3 style="color:#22c55e;margin:14px 0 6px">⏱ Timer</h3>
        <p>Each player has a personal clock (Short=10min, Medium=25min, Long=45min). Running out of time = loss.</p>

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

  G={
    board:initBoard(),currentTurn:'scarlet',
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
  render();updateUI();
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
  sl.addEventListener('input',()=>{
    sv.textContent=sl.value;
    document.getElementById('ai-elo-hint').textContent=`AI Rating: ~${AI_ELO_MAP[parseInt(sl.value)]||1000}`;
  });

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

  // ── Keyboard ──
  document.addEventListener('keydown',e=>{if(e.key==='Escape')cancelSelection();});
});
