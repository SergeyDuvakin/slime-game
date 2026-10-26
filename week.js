/* Ф3 «Гибрид недели» (ТЗ раздел 1): рецепт недели, 5 побед на разных уровнях, сундук, серия, заморозка.
   Сейв: save.wk={k:'2026-W43',a,b,wins:[],done,streak,last,frz,hist:[],frames:[]} (схема v:5+vx:6). */
window.WEEK_MOD=function(G){
const {T,btn,panel,fitTxt,textW,TAP,sfx,haptic,store,today,lockNo,drawBG,iconBtn,icBack,frameOf}=G;
const ctx=new Proxy({},{get:(t,k)=>{ const c=G.ctx, v=c[k]; return typeof v==='function'?v.bind(c):v; },set:(t,k,v)=>{ G.ctx[k]=v; return true; }});
const WK={need:5,base:80,dupe:60,stars:40,hist:12,streak:[0,0,20,40,60,60]};
const pad=n=>String(n).padStart(2,'0');
function keyOf(d){ const t=new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())); const dn=(t.getUTCDay()+6)%7; t.setUTCDate(t.getUTCDate()-dn+3); const y=t.getUTCFullYear(); const w=Math.ceil(((t-Date.UTC(y,0,1))/864e5+1)/7); return y+'-W'+pad(w); }
const keyAgo=(n,d=today())=>{ const x=new Date(d); x.setDate(x.getDate()-7*n); return keyOf(x); };
const monthOf=(d=today())=>d.getFullYear()+'-'+pad(d.getMonth()+1);
function hash(s){ let h=2166136261>>>0; for(let i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619)>>>0; } return h; }
function mulberry32(a){ return ()=>{ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
/* рецепт: перемешиваем 420 пар ГПСЧ недели; первая с открытыми родителями и не из истории; иначе первая с открытыми */
function recipeFor(k,hist){ const L=G.hybAll().slice(), r=mulberry32(hash('wk'+k)); for(let i=L.length-1;i>0;i--){ const j=Math.floor(r()*(i+1)); [L[i],L[j]]=[L[j],L[i]]; }
 const op=p=>G.unlocked(p[0])&&G.unlocked(p[1]); const H=new Set((hist||[]).slice(-WK.hist)); return L.find(p=>op(p)&&!H.has(p[0]+'_'+p[1]))||L.find(op)||null; }
const visible=()=>G.totalStars()>=WK.stars;
/* ленивое создание/смена недели (при открытии ЗАДАНИЙ); часы назад — оставляем старую неделю */
function state(){ if(!visible()) return null; const sv=G.save, k=keyOf(today()); let w=sv.wk;
 if(w&&w.k&&k<=w.k) return w;
 const old=w||{}; const p=recipeFor(k,old.hist);
 if(!p) return w||null;
 w=sv.wk={k,a:p[0],b:p[1],wins:[],done:false,streak:old.streak|0,last:old.last||'',frz:old.frz||'',hist:(old.hist||[]).concat(p[0]+'_'+p[1]).slice(-WK.hist),frames:old.frames||[],legend:!!old.legend,t:Date.now()};
 /* пропущенные недели обнуляют серию (с учётом одной заморозки) */
 if(w.last&&w.last!==keyAgo(1)&&!(w.last===keyAgo(2)&&w.frz!==monthOf())) w.streak=0;
 store(); return w; }
const isTarget=w=>{ const f=G.fusion; return !!(w&&f&&f.a===w.a&&f.b===w.b); };
/* победа: засчитывается по неделе старта уровня; Хаос — нет; повтор уровня — нет */
function onWin(lvl,startK,lines){ const w=G.save.wk; if(!w||w.done||G.chaos||!isTarget(w)) return false; if(startK&&startK!==w.k) return false; if(w.wins.length>=WK.need||w.wins.includes(lvl)) return false;
 w.wins.push(lvl); store(); const s='Гибрид недели: '+w.wins.length+'/'+WK.need+'!'; if(lines) lines.splice(0,0,[s,'#7affe0',12]); return s; }
const ready=w=>w&&!w.done&&w.wins.length>=WK.need;
const badge=()=>{ const w=visible()&&G.save.wk; return !!(visible()&&(!w||!w.done)); };
const hasFrame=(a,b)=>{ const w=G.save.wk; return !!(w&&Array.isArray(w.frames)&&w.frames.includes(a+'_'+b)); };
/* сундук: 80 + эксклюзив недели (или +60, если уже есть) + рамка + бонус серии */
let chest=null;
function openChest(){ const w=G.save.wk; if(!ready(w)) return null; const S=window.SHOP; const sv=G.save;
 let st; if(w.last===keyAgo(1)) st=(w.streak|0)+1; else if(w.last&&w.last===keyAgo(2)&&w.frz!==monthOf()){ st=(w.streak|0)+1; w.frz=monthOf(); } else st=1;
 w.streak=st; w.last=w.k; w.done=true; const add=WK.streak[Math.min(5,st)]; let candy=WK.base+add; const R={lines:[],item:null,st,add};
 R.lines.push(['+'+WK.base+' 🍬','#ffd23c']);
 const ex=S&&S.roll().wkx; if(ex&&S.BY[ex]){ if(S.owns(ex)){ candy+=WK.dupe; R.lines.push(['Эксклюзив уже есть: +'+WK.dupe+' 🍬','#ffb0d8']); } else { sv.shop.own.push(ex); R.item=ex; R.lines.push(['Эксклюзив: '+S.BY[ex].name,'#ff8ad0']); } }
 const key=w.a+'_'+w.b; if(!w.frames.includes(key)) w.frames.push(key); if(S&&!S.owns('frweek')) sv.shop.own.push('frweek'); R.lines.push(['Рамка «Гибрид недели»','#7affe0']);
 if(st>=2) R.lines.push(['Серия: '+st+' '+(st<5?'недели':'недель')+' (+'+add+' 🍬)','#9af0ff']);
 if(st>=5&&!w.legend){ w.legend=true; if(S&&!S.owns('frlegend')) sv.shop.own.push('frlegend'); R.lines.push(['Золотая рамка «Неделька-легенда»','#ffd23c']); }
 sv.candy=(sv.candy|0)+candy; R.candy=candy; store(); chest={R,t0:G.now}; return R; }
function daysLeft(){ const d=today(); const dn=(d.getDay()+6)%7; const nx=new Date(d.getFullYear(),d.getMonth(),d.getDate()+7-dn); return Math.max(1,Math.ceil((nx-d)/864e5)); }
/* карточка в ЗАДАНИЯХ: 92 px, ширина W-24 */
const CARD_H=92;
function drawCard(y){ const W=G.W, x=12, cw=W-24, tp=TAP(), h=Math.max(CARD_H,tp+64); if(!visible()){ panel(x,y,cw,48,'#1e1430'); T('ГИБРИД НЕДЕЛИ',x+10,y+8,12,'#8a7aa8','l'); T(fitTxt('Гибрид недели откроется на ★'+WK.stars,10,cw-20),x+10,y+28,10,'#a898c8','l'); return 48; }
 const w=state(); if(!w) return 0; const F=G.fusedChar(w.a,w.b), A=G.CHARS[w.a], B=G.CHARS[w.b];
 panel(x,y,cw,h,w.done?'#1e2a2a':ready(w)?'#2a4a3a':'#2b1a4a'); if(window.SHOP) SHOP.frameRect(x,y,cw,h,'frweek',G.now);
 T('ГИБРИД НЕДЕЛИ',x+10,y+7,12,'#ffd23c','l'); T('ещё '+daysLeft()+' дн.',x+cw-10,y+9,10,'#d8c8f0','r');
 ctx.save(); ctx.beginPath(); ctx.rect(x+6,y+22,64,h-26); ctx.clip(); if(G.SPR[F.id]) G.drawSlug(F.id,'idle',frameOf('idle',G.now),x+38,y+h-22); ctx.restore();
 const tx=x+76, tw=cw-86; T(fitTxt(F.name,13,tw),tx,y+24,13,'#fff','l'); T(fitTxt(A.name+' + '+B.name,10,tw),tx,y+41,10,'#c8b8e0','l');
 const n=Math.min(WK.need,w.wins.length), by=y+56, bw=Math.min(118,tw-110>40?110:tw-104), sw=Math.floor((bw-8)/5);
 for(let i=0;i<5;i++){ ctx.fillStyle='#1a0c22'; ctx.fillRect(tx+i*(sw+2),by,sw,8); ctx.fillStyle=i<n?(n>=5?'#4ed05a':'#ffd23c'):'#3a2a52'; ctx.fillRect(tx+i*(sw+2)+1,by+1,sw-2,6); }
 T(n+'/'+WK.need+' уровней',tx,by+12,10,'#fff','l');
 const need=[w.a,w.b].find(i=>!G.unlocked(i)); const bW=96, bx=x+cw-bW-8, byy=y+h-tp-6;
 if(need!==undefined){ T(fitTxt('Нужен слизень: '+G.CHARS[need].name+' (★'+G.CHARS[need].cost+')',10,cw-20),x+cw/2,y+h-14,10,'#ff9a9a'); return h; }
 const has=G.hybList().includes(w.a+'_'+w.b);
 if(w.done){ btn(bx,byy,bW,tp,'ГОТОВО ✓',()=>lockNo(),'#3a5a4a',13); G.buttons[G.buttons.length-1].label='wkdone'; }
 else if(ready(w)){ const pu=1+Math.sin(G.now*6)*.04; btn(bx,byy,bW,tp,'ОТКРЫТЬ',()=>{ sfx('win'); haptic('success'); openChest(); G.scene='wkchest'; },'#e0a020',13); G.buttons[G.buttons.length-1].label='wkopen'; }
 else if(!has){ btn(bx,byy,bW,tp,'СОЗДАТЬ',()=>{ sfx('tap'); G.fusePick=[w.a,w.b]; G.scene='fuse'; },'#7a5ae8',13); G.buttons[G.buttons.length-1].label='wkmake'; }
 else { btn(bx,byy,bW,tp,'ИГРАТЬ',()=>{ sfx('tap'); G.selectHybrid(w.a,w.b); G.relayTeam=null; G.scene='levels'; },'#4ed05a',13); G.buttons[G.buttons.length-1].label='wkplay'; }
 return h; }
/* экран сундука: тряска 3× за 0,6 с, крышка, салют */
function drawChest(){ const W=G.W,H=G.H,tp=TAP(); drawBG(4,0,G.now); if(!chest){ G.scene='quests'; return; } const R=chest.R, t=G.now-chest.t0;
 T('СУНДУК НЕДЕЛИ',W/2,tp/2-8,17,['#fff','#ffd23c']);
 const cx=W/2, cy=Math.round(H*.30), sh=t<.6?Math.round(Math.sin(t/.6*Math.PI*6)*4):0, open=t>=.6;
 const S=4; const px=(x,y,w,h,c)=>{ ctx.fillStyle=c; ctx.fillRect(Math.round(cx-16*S+sh+x*S),Math.round(cy+y*S),w*S,h*S); };
 px(0,0,32,16,'#1a0c22'); px(1,1,30,14,'#a0602a'); px(1,1,30,2,'#d08a50'); px(1,7,30,2,'#ffd23c'); px(14,5,4,6,'#ffd23c'); px(15,6,2,3,'#1a0c22');
 if(!open){ px(0,-8,32,9,'#1a0c22'); px(1,-7,30,7,'#b8703a'); px(1,-7,30,2,'#e0a060'); }
 else { const lift=Math.min(1,(t-.6)/.25); px(0,-8-10*lift,32,6,'#1a0c22'); px(1,-7-10*lift,30,4,'#b8703a'); if(t<1.8){ for(let i=0;i<14;i++){ const a=i/14*Math.PI*2+t, r=(t-.6)*90; ctx.fillStyle=['#ffd23c','#ff4a8a','#4ef0b0','#fff'][i%4]; ctx.fillRect(Math.round(cx+Math.cos(a)*r),Math.round(cy-10+Math.sin(a)*r*.7),3,3); } } ctx.fillStyle='rgba(255,230,120,.25)'; ctx.fillRect(cx-60,cy-60,120,60); }
 if(open){ let y=cy+16*S+18; for(const [s,c] of R.lines){ T(fitTxt(s,13,W-32),W/2,y,13,c); y+=22; }
  const bw=Math.min(136,Math.floor((W-36)/2)), by=Math.min(H-tp-16,y+14);
  if(R.item){ btn(W/2-bw-6,by,bw,tp,'ЗАБРАТЬ',()=>{ sfx('tap'); chest=null; G.scene='quests'; },'#4ed05a',13); G.buttons[G.buttons.length-1].label='wktake';
   btn(W/2+6,by,bw,tp,'НАДЕТЬ',()=>{ sfx('candy',2); if(window.SHOP) SHOP.equip(R.item); store(); chest=null; G.scene='quests'; },'#c04a9a',13); G.buttons[G.buttons.length-1].label='wkwear'; }
  else { btn(W/2-bw/2,by,bw,tp,'ЗАБРАТЬ',()=>{ sfx('tap'); chest=null; G.scene='quests'; },'#4ed05a',13); G.buttons[G.buttons.length-1].label='wktake'; } } }
return {WK,keyOf,keyAgo,recipeFor,state,onWin,ready,badge,hasFrame,openChest,drawCard,drawChest,daysLeft,CARD_H,get chest(){return chest},set chest(v){chest=v},visible,isTarget};
};
