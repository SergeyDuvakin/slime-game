/* 5.0 / Ф2 — Ремонт Домика (ТЗ 2.6). Только конфеты 🍬: никаких денег, Stars и рекламы.
   Подключается ДО game.js: объявляет фабрику HOME_MOD(G); game.js вызывает её в конце замыкания.
   Сейв: save.home = {wall,floor,win,furn:[…],track} (migrateV6, v:5+vx:6); купленное — в save.shop.own с префиксами hw_/hf_/ho_/hm_. */
window.HOME_MOD=function(G){
'use strict';
const O='#1a0c22';
const ctx=new Proxy({},{get:(t,k)=>{ const c=G.ctx, v=c[k]; return typeof v==='function'?v.bind(c):v; },set:(t,k,v)=>{ G.ctx[k]=v; return true; }});
const R=(x,y,w,h,c)=>{ if(c) ctx.fillStyle=c; ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h)); };
/* ---------- каталог ---------- */
const WALLS=[['stripe','Полоска',0],['daisy','Ромашки',200],['brick','Кирпич',200],['stars','Звёздное небо',200],['grid','Пиксель-клетка',200],['candy','Конфетная',200],['sea','Подводная',250],['neon','Неон',250],['xmas','Ёлочные',200,'','ny'],['abyss','Аквариумная',300,'Награда главы 6 «Тёмный аквариум»','gift']];
const FLOORS=[['rug','Доски',0],['round','Ковёр-круг',200],['tile','Плитка',200],['grass','Трава',200],['cloud','Облако',200],['jelly','Мармелад',200],['chess','Шахматы',200],['sand','Песчаное дно',300,'Награда главы 6 «Тёмный аквариум»','gift']];
const WINS=[['square','Квадрат',0],['port','Иллюминатор',250],['glass','Витраж',250],['arch','Арка',250]];
const FURN=[['bed','Кроватки',300,'Ночью слизни спят в кроватках, сытость падает на 25 % медленнее'],['shelf','Полка трофеев',250,'Трофеи боссов, медали храбрости и золотые колбы глав'],['aqua','Аквариум',300,'3 рыбки. Тап — покормить рыбок (бесплатно)'],['player','Проигрыватель',250,'Музыка в меню и уровнях: 4 мелодии на выбор'],['scope','Телескоп',400,'Падающая звезда 2 раза в день (+1 🍬)'],['incub','Инкубатор +2',300,'4 слота на Ферме генов вместо 2']];
const TRACKS=[['classic','Классика'],['lullaby','Колыбельная'],['factory','Фабрика'],['jazz','Ночной джаз']];
const PFX={wall:'hw_',floor:'hf_',win:'ho_',furn:'hm_'};
const LIST={wall:WALLS,floor:FLOORS,win:WINS,furn:FURN};
const ITEMS=[]; for(const k in LIST) for(const r of LIST[k]) ITEMS.push({key:PFX[k]+r[0],tab:k,id:r[0],name:r[1],price:r[2],desc:r[3]||'',season:r[4]||''});
const BY={}; for(const it of ITEMS) BY[it.key]=it;
const hm=()=>{ const s=G.save; if(!s.home||typeof s.home!=='object') s.home={wall:'stripe',floor:'rug',win:'square',furn:[],track:'classic'}; if(!Array.isArray(s.home.furn)) s.home.furn=[]; return s.home; };
const own=()=>{ const s=G.save; if(!s.shop||typeof s.shop!=='object') s.shop={own:[],day:'',vit:[],disc:0,wkx:'',wkk:0,seen:[]}; if(!Array.isArray(s.shop.own)) s.shop.own=[]; return s.shop.own; };
function owns(key){ const it=BY[key]; if(!it) return false; if(it.price===0) return true; return own().includes(key); }
const has=f=>hm().furn.includes(f)&&owns('hm_'+f);
function cur(tab){ const h=hm(); return tab==='wall'?h.wall:tab==='floor'?h.floor:tab==='win'?h.win:null; }
/* атомарная покупка: проверка → списание → own → store в одном тике */
const seasonOk=it=>!it.season||it.season!=='gift'&&(window.SHOP&&SHOP.seasonOn(it.season));
/* 5.2: подарок за главу (тема «Аквариумная»): выдать и сразу поставить */
function give(key){ const it=BY[key]; if(!it||owns(key)) return false; own().push(key); const h=hm(); if(it.tab==='wall'||it.tab==='floor'||it.tab==='win') h[it.tab]=it.id; if(G.store) G.store(); return true; }
function buy(key){ const it=BY[key]; if(!it||it.price<=0||owns(key)) return {ok:false,why:'nope'}; if(!seasonOk(it)) return {ok:false,why:'season'}; const c=G.save.candy|0; if(c<it.price) return {ok:false,why:'candy',need:it.price-c}; G.save.candy=c-it.price; own().push(key); applyOwned(it); G.store(); return {ok:true}; }
function applyOwned(it){ const h=hm(); if(it.tab==='furn'){ if(!h.furn.includes(it.id)) h.furn.push(it.id); if(it.id==='incub'){ const f=G.save.farm; if(f&&typeof f==='object'){ f.max=4; if(!Array.isArray(f.slots)) f.slots=[]; while(f.slots.length<4) f.slots.push(null); } else G.save.farm={slots:[null,null,null,null],max:4,cnt:0}; } } else put(it.key); }
function put(key){ const it=BY[key]; if(!it||!owns(key)||it.tab==='furn') return false; hm()[it.tab]=it.id; G.store(); return true; }
function track(){ const t=G.save.set&&G.save.set.track; return has('player')&&TRACKS.some(x=>x[0]===t)?t:'classic'; }
function setTrack(t){ if(!TRACKS.some(x=>x[0]===t)) return; G.save.set.track=t; if(G.save.set6) G.save.set6.track=t; hm().track=t; G.store(); G.musicReset&&G.musicReset(); }
function nextTrack(){ const i=TRACKS.findIndex(x=>x[0]===track()); setTrack(TRACKS[(i+1)%TRACKS.length][0]); return TRACKS[(i+1)%TRACKS.length][1]; }
/* ---------- пиксельные «спаны» (клип без сглаживания) ---------- */
function spans(id,pad){ const out=[]; for(let y=-pad;y<60+pad;y++){ let x0=-pad,x1=80+pad;
  if(id==='port'){ const r=30+pad, dy=y-30+.5; if(Math.abs(dy)>r) continue; const w=Math.floor(Math.sqrt(r*r-dy*dy)); x0=40-w; x1=40+w; }
  else if(id==='arch'){ if(y<40){ const r=40+pad, dy=40-y-.5; if(dy>r) continue; const w=Math.floor(Math.sqrt(Math.max(0,r*r-dy*dy))); x0=40-w; x1=40+w; } }
  out.push([y,x0,x1]); } return out; }
function fillSpans(S,wx,wy,col){ ctx.fillStyle=col; for(const [y,a,b] of S) ctx.fillRect(wx+a,wy+y,b-a,1); }
function clipSpans(S,wx,wy){ ctx.beginPath(); for(const [y,a,b] of S) ctx.rect(wx+a,wy+y,b-a,1); ctx.clip(); }
/* ---------- обои ---------- */
function wall(id,x0,y0,w,h,night,t){ ctx.save(); ctx.beginPath(); ctx.rect(x0,y0,w,h); ctx.clip(); const X=x0, Y=y0;
 if(id==='daisy'){ for(let y=0;y<h;y+=4){ R(X,Y+y,w,4,(y/4|0)%2?'#fff2cc':'#fdebb8'); } for(let j=0;j*26<h+26;j++) for(let i=-1;i*30<w+30;i++){ const cx=X+i*30+(j%2?15:0)+8, cy=Y+j*26+10; R(cx-1,cy-3,3,2,'#fff'); R(cx-1,cy+2,3,2,'#fff'); R(cx-3,cy-1,2,3,'#fff'); R(cx+2,cy-1,2,3,'#fff'); R(cx-1,cy-1,3,3,'#ffc83c'); R(cx,cy,1,1,'#e89a20'); R(cx+3,cy+5,1,3,'#7ac850'); R(cx+4,cy+6,2,1,'#7ac850'); } }
 else if(id==='brick'){ R(X,Y,w,h,'#e8b48a'); for(let j=0;j*10<h+10;j++) for(let i=-1;i*20<w+20;i++){ const bx=X+i*20+(j%2?10:0), by=Y+j*10; R(bx+1,by+1,18,8,(i*7+j*3)%5===0?'#b85438':'#c8643e'); R(bx+1,by+1,18,1,'#e0845a'); R(bx+1,by+8,18,1,'#9a4430'); } }
 else if(id==='stars'){ const B=['#1a1e5a','#1e2468','#232a74','#283080']; for(let y=0;y<h;y+=6) R(X,Y+y,w,6,B[Math.min(3,(y/(h/4))|0)]); let s=7; const rr=()=>(s=(s*16807)%2147483647)/2147483647; for(let i=0;i<w*h/500;i++){ const sx=X+rr()*w|0, sy=Y+rr()*h|0, tw=Math.sin((t||0)*2+i)>.7; R(sx,sy,1,1,tw?'#fff':'#a8b0ff'); } for(let i=0;i<w*h/6000;i++){ const sx=X+rr()*w|0, sy=Y+rr()*h|0; R(sx-2,sy,5,1,'#ffe066'); R(sx,sy-2,1,5,'#ffe066'); R(sx,sy,1,1,'#fff'); } }
 else if(id==='grid'){ for(let j=0;j*8<h;j++) for(let i=0;i*8<w;i++) R(X+i*8,Y+j*8,8,8,(i+j)%2?'#bfe4ff':'#a6d4fa'); for(let i=0;i*32<w;i++) R(X+i*32,Y,1,h,'#86b8e8'); for(let j=0;j*32<h;j++) R(X,Y+j*32,w,1,'#86b8e8'); for(let j=0;j*32<h;j++) for(let i=0;i*32<w;i++) if((i*3+j)%4===0) R(X+i*32+12,Y+j*32+12,8,8,'#ff9ad0'); }
 else if(id==='candy'){ for(let y=0;y<h;y++){ for(let x=0;x<w;x+=2){ const v=((x+y)>>3)%3; R(X+x,Y+y,2,1,v===0?'#ffc6e0':v===1?'#fff0f6':'#ffd8ea'); } } for(let j=0;j*30<h+30;j++) for(let i=-1;i*36<w+36;i++){ const cx=X+i*36+(j%2?18:0)+10, cy=Y+j*30+12; R(cx-3,cy-2,7,5,O); R(cx-2,cy-1,5,3,['#ff5aa8','#4ec0ff','#ffd23c'][(i+j+9)%3]); R(cx-2,cy-1,2,1,'#fff'); R(cx-6,cy-1,3,3,O); R(cx+4,cy-1,3,3,O); R(cx-5,cy,2,1,'#ff8ad0'); R(cx+4,cy,2,1,'#ff8ad0'); } }
 else if(id==='sea'){ const B=['#3a9ae0','#3290d6','#2a84ca','#2478bc','#1e6aae']; for(let y=0;y<h;y+=4) R(X,Y+y,w,4,B[Math.min(4,(y/h*5)|0)]); for(let i=0;i<w;i+=18){ const k=(i*7)%5; const ph=Math.sin((t||0)*1.5+i)*1.5; for(let j=0;j<14+k*2;j+=2) R(X+i+4+Math.round(Math.sin(j*.5+(t||0)*2+i)*1.5+ph*0),Y+h-j-2,2,2,j%4?'#2ab070':'#3ad088'); } for(let i=0;i<w*h/2500;i++){ const bx=X+((i*53)%w), ph=(((t||0)*.25+i*.37)%1), by=Y+h-ph*h; R(bx,by|0,2,2,'#bfeaff'); R(bx,by|0,1,1,'#fff'); } for(let y=6;y<h;y+=22) for(let x=(y%44?0:12);x<w;x+=26) R(X+x,Y+y,6,1,'#5ab0ee'); }
 else if(id==='xmas'){ for(let y=0;y<h;y+=4) R(X,Y+y,w,4,(y/4|0)%2?'#2a7a4a':'#2f8452'); for(let j=0;j*34<h+34;j++) for(let i=-1;i*40<w+40;i++){ const cx=X+i*40+(j%2?20:0)+12, cy=Y+j*34+6; for(let k=0;k<4;k++) R(cx-k*2-1,cy+k*3,k*4+3,3,k%2?'#4ac070':'#3aa860'); R(cx-1,cy+12,3,3,'#8a5a32'); R(cx,cy-2,1,2,'#ffd23c'); R(cx-3,cy+5,1,1,'#ff4a6a'); R(cx+3,cy+8,1,1,'#4ec0ff'); R(cx-5,cy+10,1,1,'#ffd23c'); } for(let i=0;i<w*h/1500;i++){ const sx=X+((i*71)%w), sy=Y+((((t||0)*12+i*37)|0)%h); R(sx,sy,2,2,'#fff'); } }
 else if(id==='abyss'){ const B=['#0a1a3a','#081634','#06122c','#050e24','#040a1c']; for(let y=0;y<h;y+=4) R(X,Y+y,w,4,B[Math.min(4,(y/h*5)|0)]); const tt=t||0; for(let i=0;i<w;i+=22){ const k=(i*7)%5; for(let j=0;j<16+k*3;j+=2) R(X+i+6+Math.round(Math.sin(j*.45+tt*1.6+i)*2),Y+h-j-2,2,2,j%4?'#1a6a6a':'#2ab8a8'); } for(let n=0;n<Math.max(2,w/70|0);n++){ const jx=X+((n*97+30)%Math.max(1,w-20))+10, jy=Y+20+((n*61)%Math.max(1,h-60))+Math.sin(tt*.9+n)*6; ctx.globalAlpha=.25; R(jx-7,jy-7,14,14,'#c8a8ff'); ctx.globalAlpha=1; R(jx-4,jy-3,8,5,n%2?'#d8b8ff':'#8ff0ff'); R(jx-3,jy-4,6,1,'#fff'); for(let q=0;q<3;q++) R(jx-3+q*3,jy+2+((tt*4+q)|0)%2,1,4,'#b8a0ff'); } for(let i=0;i<w*h/3000;i++){ const bx=X+((i*53)%w), ph=((tt*.2+i*.37)%1); R(bx,(Y+h-ph*h)|0,1,1,'#8ff0ff'); } }
 else if(id==='neon'){ R(X,Y,w,h,'#160a2a'); const p=.6+.4*Math.sin((t||0)*2); for(let i=0;i*24<w+24;i++){ R(X+i*24,Y,1,h,'rgba(255,58,208,'+(.35*p).toFixed(2)+')'); R(X+i*24,Y,1,h,null); } for(let j=0;j*24<h+24;j++){ R(X,Y+j*24,w,1,'rgba(78,240,255,'+(.35*p).toFixed(2)+')'); } for(let j=0;j*48<h;j++) for(let i=0;i*48<w;i++){ const cx=X+i*48+24, cy=Y+j*48+24; R(cx-1,cy-1,3,3,'rgba(255,240,255,'+(.5+.5*p).toFixed(2)+')'); } R(X,Y+h-3,w,1,'#ff3ad0'); R(X,Y+h-2,w,1,'#ff8ae8'); }
 else { const c=['#ffd6a8','#f6c690']; for(let y=0;y<h;y+=4) R(X,Y+y,w,4,c[(y/4|0)%2]); for(let x=10;x<w;x+=28) for(let y=20;y<h-20;y+=28) R(X+x,Y+y,2,2,'#ffe4c0'); }
 if(night) R(X,Y,w,h,id==='stars'||id==='neon'?'rgba(6,4,30,.25)':'rgba(16,10,60,.55)');
 ctx.restore(); }
/* ---------- пол ---------- */
function planks(X,Y,w,h,a,b){ R(X,Y,w,h,a); ctx.fillStyle=b; for(let x=0;x<w;x+=24) ctx.fillRect(X+x,Y,1,h); for(let y=12;y<h;y+=12) ctx.fillRect(X,Y+y,w,1); }
function floor(id,X,Y,w,h,night,rugY,t){ ctx.save(); ctx.beginPath(); ctx.rect(X,Y,w,h); ctx.clip(); rugY=rugY===undefined?Y+130:rugY;
 if(id==='round'){ planks(X,Y,w,h,'#a0603a','#8a4e2c'); const cx=X+w/2, cy=rugY+11, rx=Math.min(w/2-10,170), ry=Math.min(40,Math.max(14,(Y+h-cy)-6)); const C=[O,'#e0703a','#ffb84a','#ff7a9a','#ffd890','#e0703a']; C.forEach((c,i)=>{ const ax=rx-i*Math.max(3,rx/9), ay=ry-i*Math.max(2,ry/7); if(ax<4||ay<2) return; ctx.fillStyle=c; for(let yy=-ay;yy<=ay;yy++){ const ww=Math.floor(ax*Math.sqrt(1-(yy*yy)/(ay*ay))); ctx.fillRect(Math.round(cx-ww),Math.round(cy+yy),ww*2,1); } }); }
 else if(id==='tile'){ for(let j=0;j*16<h;j++) for(let i=0;i*16<w;i++){ R(X+i*16,Y+j*16,16,16,'#d8e8f0'); R(X+i*16+1,Y+j*16+1,14,14,(i+j)%2?'#f4fbff':'#bcdcef'); R(X+i*16+2,Y+j*16+2,3,1,'#fff'); } }
 else if(id==='grass'){ R(X,Y,w,h,'#5ab04a'); for(let y=0;y<h;y+=3) for(let x=((y/3)%2)*3;x<w;x+=6) R(X+x,Y+y,1,2,(x*y)%7?'#4a9a3e':'#7ad05a'); for(let i=0;i<w*h/900;i++){ const fx=X+((i*97)%w), fy=Y+((i*61)%h); R(fx-1,fy,3,1,['#fff','#ffe066','#ff8ad0'][i%3]); R(fx,fy-1,1,3,['#fff','#ffe066','#ff8ad0'][i%3]); R(fx,fy,1,1,'#ffc83c'); } }
 else if(id==='cloud'){ R(X,Y,w,h,'#9ad8ff'); for(let j=0;j*30<h+30;j++) for(let i=-1;i*70<w+70;i++){ const cx=X+i*70+(j%2?35:0)+((t||0)*4%70|0), cy=Y+j*30+10; R(cx,cy+4,34,6,'#fff'); R(cx+6,cy,14,6,'#fff'); R(cx+16,cy-3,10,6,'#fff'); R(cx,cy+9,34,1,'#d8eefc'); R(cx+7,cy,4,1,'#f6fbff'); } }
 else if(id==='jelly'){ const C=[['#ff5a8a','#ffa0c0'],['#ffb03c','#ffe08a'],['#5ad84a','#b0ff9a'],['#4ab0ff','#b0e0ff'],['#b05aff','#e0b0ff']]; for(let j=0;j*14<h;j++) for(let i=0;i*14<w;i++){ const c=C[(i*2+j*3)%5]; R(X+i*14,Y+j*14,14,14,O); R(X+i*14+1,Y+j*14+1,12,12,c[0]); R(X+i*14+2,Y+j*14+2,4,2,c[1]); R(X+i*14+2,Y+j*14+4,1,2,c[1]); } }
 else if(id==='sand'){ for(let j=0;j<h;j+=3) R(X,Y+j,w,3,j%6?'#c8a868':'#bc9c5c'); for(let i=0;i<w*h/180;i++){ R(X+((i*37)%w),Y+((i*23)%h),1,1,i%3?'#a88848':'#e8d098'); } for(let i=0;i*60<w;i++){ const sx=X+i*60+20, sy=Y+10+((i*17)%Math.max(1,h-20)); R(sx,sy,6,3,'#f0e0c0'); R(sx+1,sy-1,4,1,'#fff4e0'); R(sx+2,sy+1,1,1,'#d89870'); } }
 else if(id==='chess'){ for(let j=0;j*18<h;j++) for(let i=0;i*18<w;i++){ R(X+i*18,Y+j*18,18,18,(i+j)%2?'#2a1e3a':'#f2ecdc'); } for(let j=0;j*18<h;j++) R(X,Y+j*18,w,1,'rgba(0,0,0,.15)'); }
 else { planks(X,Y,w,h,'#a0603a','#8a4e2c'); R(X+14,rugY,w-28,22,O); R(X+16,rugY+2,w-32,18,'#c04a9a'); ctx.fillStyle='#ff8ad0'; for(let x=20;x<w-20;x+=8) ctx.fillRect(X+x,rugY+10,4,2); }
 if(night) R(X,Y,w,h,'rgba(16,8,40,.5)'); ctx.restore(); }
/* ---------- окно: рамка + небо внутри формы ---------- */
function windowDraw(wx,wy,sky,night,dark,id){ id=id||hm().win; if(!WINS.some(w=>w[0]===id)) id='square'; const wood=dark?'#4a3e6a':'#c8a070', wood2=dark?'#3a3058':'#a07a4c', cur=dark?'#4a2448':'#e05a7a', cur2=dark?'#381a38':'#b8405e';
 if(id==='square'){ R(wx-3,wy-3,86,66,dark?'#3a2a5a':O); ctx.save(); clipSpans(spans(id,0),wx,wy); sky(wx,wy); ctx.restore(); R(wx+38,wy,4,60,wood); R(wx,wy+28,80,4,wood); R(wx-8,wy-4,10,70,cur); R(wx+78,wy-4,10,70,cur); return; }
 if(id==='port'){ fillSpans(spans('port',6),wx,wy,O); fillSpans(spans('port',5),wx,wy,dark?'#5a5070':'#c89a3a'); fillSpans(spans('port',2),wx,wy,dark?'#3a3050':'#8a6420'); fillSpans(spans('port',1),wx,wy,O); ctx.save(); clipSpans(spans('port',0),wx,wy); sky(wx,wy); R(wx+14,wy+8,3,10,'rgba(255,255,255,.25)'); R(wx+18,wy+5,6,2,'rgba(255,255,255,.25)'); ctx.restore();
  for(let i=0;i<8;i++){ const a=i*Math.PI/4, rx=Math.round(wx+40+Math.cos(a)*33)-1, ry=Math.round(wy+30+Math.sin(a)*33)-1; R(rx,ry,3,3,O); R(rx,ry,2,2,dark?'#8a80a0':'#ffe08a'); } R(wx+20,wy-4,8,1,dark?'#8a80a0':'#ffe8a0'); return; }
 if(id==='glass'){ R(wx-5,wy-5,90,70,O); R(wx-4,wy-4,88,68,wood); R(wx-2,wy-2,84,64,O); ctx.save(); clipSpans(spans(id,0),wx,wy); sky(wx,wy); const P=['#ff4a6a','#ffd23c','#4ec0ff','#5ad84a','#c87aff','#ff9a2a']; ctx.globalAlpha=dark?.22:.38; for(let j=0;j<3;j++) for(let i=0;i<4;i++){ R(wx+i*20,wy+j*20,20,20,P[(i+j*2)%6]); } ctx.globalAlpha=1; ctx.restore();
  ctx.fillStyle=dark?'#2a2040':O; for(let i=1;i<4;i++) ctx.fillRect(wx+i*20-1,wy,2,60); for(let j=1;j<3;j++) ctx.fillRect(wx,wy+j*20-1,80,2); for(let k=0;k<20;k++){ ctx.fillRect(wx+30+k,wy+10+Math.abs(k-10),1,1); ctx.fillRect(wx+30+k,wy+50-Math.abs(k-10),1,1); } R(wx-6,wy+61,92,4,wood2); R(wx-6,wy+61,92,1,wood); return; }
 if(id==='arch'){ fillSpans(spans('arch',4),wx,wy,O); fillSpans(spans('arch',3),wx,wy,wood); fillSpans(spans('arch',1),wx,wy,O); ctx.save(); clipSpans(spans('arch',0),wx,wy); sky(wx,wy); ctx.restore(); R(wx+39,wy,2,60,wood); R(wx,wy+38,80,2,wood); R(wx+39,wy+38,2,2,wood2);
  R(wx-8,wy+62,96,4,O); R(wx-7,wy+62,94,3,wood); R(wx-9,wy+8,8,58,cur); R(wx+81,wy+8,8,58,cur); R(wx-9,wy+40,8,3,cur2); R(wx+81,wy+40,8,3,cur2); R(wx-9,wy+6,98,3,dark?'#5a5070':'#8a6420'); return; } }
/* ---------- мебель: места (на всех экранах — боковые полосы шириной W/8 и стена над слизнями) ---------- */
function spots(fy,tp){ const W=G.W, s=Math.min(50,Math.floor(W/8)-2); const x0=92, x1=W-128; const sw=Math.max(60,Math.min(118,x1-x0)); return {
  shelf:{x:Math.round((x0+x1)/2-sw/2),y:tp+30,w:sw,h:38},
  aqua:{x:W-s-2,y:fy-78,w:s,h:82},
  player:{x:2,y:fy-62,w:s,h:66},
  incub:{x:2,y:fy+62,w:s,h:48},
  scope:{x:W-110+46,y:tp+24+22,w:32,h:38} }; }
const fish=[{x:.2,d:1,c:'#ff9a2a'},{x:.6,d:-1,c:'#ffd23c'},{x:.4,d:1,c:'#ff5a8a'}]; let flakes=[], fishFed=-9;
function drawAqua(r,night,t){ const {x,y,w,h}=r; const th=Math.round(h*.55);
 R(x,y,w,th,O); R(x+1,y+1,w-2,th-2,'#bfeaff'); R(x+2,y+5,w-4,th-7,night?'#1e4a6a':'#6aaccc'); R(x+2,y+5,w-4,1,'#a8d4e8'); R(x+2,y+th-6,w-4,4,'#e8c890'); R(x+4,y+th-6,2,1,'#c8a060'); R(x+w-9,y+th-5,3,1,'#c8a060');
 for(let i=0;i<7;i++) R(x+5+Math.round(Math.sin(t*2+i*.7)),y+th-7-i*2,2,2,'#3ad088'); for(let i=0;i<5;i++) R(x+w-8+Math.round(Math.sin(t*1.6+i)),y+th-7-i*2,2,2,'#2ab070');
 const fd=t-fishFed<3; fish.forEach((f,i)=>{ const span=w-12; let px=(f.x+t*.08*(i+1)*f.d)%1; if(px<0) px+=1; const dir=((Math.floor((f.x+t*.08*(i+1)*f.d)))%2===0)===(f.d>0)?1:-1; const ph=px; const fxp=x+6+Math.round((dir>0?ph:1-ph)*span); const fyp=fd?y+8+i:y+9+i*5+Math.round(Math.sin(t*2+i)*1.5); R(fxp-2,fyp,5,3,O); R(fxp-1,fyp+1,3,1,f.c); R(dir>0?fxp-4:fxp+3,fyp,2,3,f.c); R(dir>0?fxp+1:fxp-1,fyp+1,1,1,O); });
 flakes=flakes.filter(p=>t-p.t<3); for(const p of flakes){ const k=t-p.t; R(p.x,Math.min(y+th-7,y+6+k*8)|0,1,1,'#ffb03c'); }
 const b=((t*.6)%1); R(x+w/2|0,(y+th-8-b*(th-14))|0,2,2,'#e0f8ff'); R(x+1,y+1,1,th-2,'rgba(255,255,255,.5)');
 R(x-1,y+th,w+2,3,O); R(x,y+th,w,2,'#8a5a3a'); R(x+2,y+th+3,4,h-th-3,O); R(x+w-6,y+th+3,4,h-th-3,O); R(x+3,y+th+3,2,h-th-4,'#a0703e'); R(x+w-5,y+th+3,2,h-th-4,'#a0703e'); R(x+2,y+th+10,w-4,2,'#8a5a3a'); }
function drawPlayer(r,night,t){ const {x,y,w,h}=r; const ty=y+18; R(x,ty,w,h-18,O); R(x+1,ty+1,w-2,h-20,'#b07a48'); R(x+1,ty+1,w-2,2,'#d09a60'); R(x+3,ty+6,w-6,h-28,'#8a5a32'); R(x+w/2-1|0,ty+8,2,2,'#ffd23c'); R(x+3,ty+h-24,w-6,1,'#8a5a32');
 R(x+1,y+8,w-2,10,O); R(x+2,y+9,w-4,8,'#a87070'); R(x+2,y+9,w-4,1,'#c89090'); const cx=x+Math.round(w*.42), cy=y+9; const sp=G.save.mute?0:t*6; R(cx-8,cy-3,16,4,O); R(cx-7,cy-3,14,3,'#2a1e3a'); const k=Math.floor(sp)%4; R(cx-6+k*3,cy-2,2,1,'#6a5a8a'); R(cx-1,cy-2,2,1,'#ffd23c'); R(x+w-6,y+3,2,7,'#c8c8d8'); R(x+w-9,y+3,4,1,'#c8c8d8'); R(x+w-7,y+10,3,2,O);
 if(!G.save.mute){ for(let i=0;i<2;i++){ const ph=(t*.5+i*.5)%1; const nx=x+w/2+Math.round(Math.sin(ph*6+i)*4)+i*6-3, ny=y-ph*22|0; ctx.globalAlpha=Math.min(1,(1-ph)*2); R(nx,ny,1,5,'#ffe066'); R(nx-2,ny+4,3,2,'#ffe066'); R(nx+1,ny,3,1,'#ffe066'); ctx.globalAlpha=1; } } }
function drawShelf(r,night){ const {x,y,w,h}=r; const S=G.save; const B=Array.isArray(S.boss)?S.boss:[], HB=S.hz&&Array.isArray(S.hz.boss)?S.hz.boss:[]; const nb=B.filter(Boolean).length, nh=HB.filter(Boolean).length;
 let med=0; for(const k in (S.house||{})) med+=(S.house[k]&&S.house[k].med)|0; let fl=0; if(S.hz&&Array.isArray(S.hz.st)) for(let c=0;c<10;c++){ const a=S.hz.st.slice(c*10,c*10+10); if(a.length===10&&a.every(v=>v>=3)) fl++; }
 const sy=y+h-6; R(x,sy,w,5,O); R(x+1,sy,w-2,3,'#b07a48'); R(x+1,sy,w-2,1,'#d8a46a'); R(x+6,sy+5,3,5,O); R(x+w-9,sy+5,3,5,O); R(x+7,sy+5,1,4,'#8a5a32'); R(x+w-8,sy+5,1,4,'#8a5a32');
 const items=[]; for(let i=0;i<B.length&&items.length<20;i++) if(B[i]) items.push('cup'); for(let i=0;i<HB.length&&items.length<20;i++) if(HB[i]) items.push('cupt'); if(med) items.push('med'); if(fl) items.push('flask');
 if(!items.length){ R(x+8,sy-2,4,2,'#c8b8a0'); R(x+w-16,sy-2,5,2,'#c8b8a0'); if(G.save.houseLight!==false) G.T('тут будут трофеи',x+w/2,sy-13,9,night?'#8a7aa8':'#7a4a2a'); return {nb,nh,med,fl}; }
 const step=Math.max(7,Math.min(13,Math.floor((w-8)/Math.max(1,items.length)))); let ix=x+4+Math.max(0,Math.floor((w-8-step*items.length)/2));
 for(const k of items){ if(k==='cup'||k==='cupt'){ const g=k==='cup'?['#ffd23c','#fff6b0','#c89a20']:['#4ef0ff','#d0fcff','#20a0b8']; R(ix,sy-14,9,8,O); R(ix+1,sy-13,7,6,g[0]); R(ix+1,sy-13,2,3,g[1]); R(ix-2,sy-13,2,3,O); R(ix+9,sy-13,2,3,O); R(ix+3,sy-6,3,2,O); R(ix+1,sy-4,7,4,O); R(ix+2,sy-4,5,3,g[2]); }
  else if(k==='med'){ R(ix+1,sy-14,2,5,'#4a7aff'); R(ix+4,sy-14,2,5,'#ff4a6a'); R(ix,sy-9,7,7,O); R(ix+1,sy-8,5,5,'#ffd23c'); R(ix+2,sy-7,1,1,'#fff6b0'); }
  else { R(ix+2,sy-13,3,3,O); R(ix,sy-10,7,10,O); R(ix+1,sy-9,5,8,'#ffd23c'); R(ix+1,sy-5,5,4,'#ff9a2a'); R(ix+1,sy-9,1,3,'#fff6b0'); }
  ix+=step; }
 if(med>1&&G.save.houseLight!==false) G.T('×'+med,x+w-2,y-2,9,'#ffd23c','r'); return {nb,nh,med,fl}; }
const SCOPE=['..........oo..','.........obbo.','........obaao.','.......obaaso.','......obaaso..','.....obaaso...','....oyaaso....','...obaaso.....','..obaaso......','..osaso.......','...ooo........','...o.o........','..o...o.......','.o.....o......'];
function drawScope(r,night,t){ const P={o:O,a:'#5a6ad0',b:'#9aa8ff',s:'#3a4290',y:'#ffd23c'}; for(let j=0;j<SCOPE.length;j++) for(let i=0;i<SCOPE[j].length;i++){ const ch=SCOPE[j][i]; if(ch==='.') continue; R(r.x+i*2,r.y+10+j*2,2,2,P[ch]); } if(night&&Math.sin(t*3)>.5){ R(r.x+26,r.y+4,2,2,'#fff'); R(r.x+24,r.y+6,1,1,'#fff6b0'); } }
function drawIncub(r,night,t){ const {x,y,w,h}=r; const gl=.5+.5*Math.sin(t*2); R(x+2,y+h-12,w-4,12,O); R(x+3,y+h-11,w-6,10,'#8a92a6'); R(x+3,y+h-11,w-6,2,'#c0c8d8'); R(x+6,y+h-7,3,3,gl>.5?'#7aff7a':'#3a8a3a'); R(x+11,y+h-7,3,3,'#ffd23c');
 const cx=x+w/2|0, top=y+4; for(let yy=0;yy<h-16;yy++){ const ww=Math.round(Math.sqrt(Math.max(0,1-Math.pow((h-16-yy)/(h-16),2)))*(w/2-3)); R(cx-ww-1,top+yy,ww*2+2,1,O); R(cx-ww,top+yy,ww*2,1,'rgba(200,240,255,.55)'); } ctx.globalAlpha=.25+.2*gl; R(cx-8,y+h-24,16,10,'#ffb03c'); ctx.globalAlpha=1; R(cx-4,y+h-24,8,10,O); R(cx-3,y+h-23,6,8,'#fff6e0'); R(cx-2,y+h-21,2,2,'#ff8ad0'); R(cx+1,y+h-18,2,1,'#ff8ad0'); R(cx-6,top+4,1,6,'rgba(255,255,255,.7)'); if(G.save.houseLight!==false) G.T('+2',x+w-2,y-2,9,'#7aff7a','r'); }
function drawBed(x,y,k,night){ const hw=Math.min(40,Math.floor(G.W/8)-4); const C=[['#ff8ad0','#ffc0e4'],['#7ac8ff','#c0e4ff'],['#ffd23c','#fff0a0'],['#7aff7a','#c8ffc0'],['#c87aff','#e4c0ff'],['#ff9a2a','#ffd090']][k%6]; x=Math.round(x); y=Math.round(y);
 R(x-hw,y-10,6,32,O); R(x-hw+1,y-9,4,30,'#b07a48'); R(x-hw+1,y-9,4,2,'#d8a46a'); R(x-hw-1,y-12,8,3,O); R(x-hw,y-11,6,1,'#d8a46a'); R(x+hw-6,y-10,6,32,O); R(x+hw-5,y-9,4,30,'#b07a48'); R(x+hw-5,y-9,4,2,'#d8a46a'); R(x+hw-7,y-12,8,3,O); R(x+hw-6,y-11,6,1,'#d8a46a');
 R(x-hw+5,y+8,hw*2-10,15,O); R(x-hw+6,y+9,hw*2-12,5,'#fff6ec'); R(x-hw+6,y+14,hw*2-12,7,C[0]); R(x-hw+6,y+14,hw*2-12,1,C[1]); for(let i=-hw+10;i<hw-8;i+=6) R(x+i,y+17,2,2,C[1]); R(x-hw+6,y+21,hw*2-12,1,'#8a5a32'); }
function blanket(x,y,k){ const C=['#ff8ad0','#7ac8ff','#ffd23c','#7aff7a','#c87aff','#ff9a2a'][k%6]; x=Math.round(x); y=Math.round(y); R(x-23,y+9,46,9,O); R(x-22,y+10,44,7,C); R(x-22,y+10,44,1,'rgba(255,255,255,.6)'); for(let i=-18;i<19;i+=6) R(x+i,y+13,2,2,'rgba(255,255,255,.45)'); }
/* рисует мебель и регистрирует тапы (вызывается из drawHouse после слизней) */
function drawFurn(fy,tp,night,t,try_){ const S=spots(fy,tp); const hv=f=>has(f)||(try_&&try_.tab==='furn'&&try_.id===f); const R0={};
 if(hv('shelf')){ R0.shelf=drawShelf(S.shelf,night); if(!try_) G.buttons.push({x:S.shelf.x,y:S.shelf.y,w:S.shelf.w,h:S.shelf.h,label:'hShelf',cb:()=>{ const r=R0.shelf||{}; G.sfx('tap'); G.houseFX.push({k:'t',s:'Трофеи: боссы '+r.nb+'/10 · Гибридариум '+r.nh+'/10',x:G.W/2,y:S.shelf.y+S.shelf.h+10,t:0,life:2,size:10,col:'#ffd23c'}); if(r.med||r.fl) G.houseFX.push({k:'t',s:'медалей '+r.med+' · золотых колб '+r.fl,x:G.W/2,y:S.shelf.y+S.shelf.h+24,t:0,life:2,size:10,col:'#fff6b0'}); }}); }
 if(hv('aqua')){ drawAqua(S.aqua,night,t); if(!try_) G.buttons.push({x:S.aqua.x-4,y:S.aqua.y,w:S.aqua.w+6,h:S.aqua.h,label:'hAqua',cb:()=>{ fishFed=t; for(let i=0;i<5;i++) flakes.push({x:S.aqua.x+6+Math.random()*(S.aqua.w-12)|0,t:G.now+i*.05}); G.tone(1200,.04,'square',.08,1600); G.haptic('light'); G.houseFX.push({k:'t',s:'ням-ням!',x:Math.max(40,S.aqua.x-10),y:S.aqua.y-8,t:0,life:1.2,size:10,col:'#bfeaff'}); }}); }
 if(hv('player')){ drawPlayer(S.player,night,t); if(!try_) G.buttons.push({x:S.player.x,y:S.player.y-6,w:S.player.w+4,h:S.player.h+6,label:'hPlayer',cb:()=>{ const n=nextTrack(); G.sfx('tap'); G.haptic('light'); G.houseFX.push({k:'t',s:'♪ '+n,x:Math.min(G.W-60,Math.max(60,S.player.x+50)),y:S.player.y-14,t:0,life:1.6,size:11,col:'#ffe066'}); }}); }
 if(hv('incub')){ drawIncub(S.incub,night,t); if(!try_) G.buttons.push({x:S.incub.x,y:S.incub.y,w:S.incub.w+4,h:S.incub.h,label:'hIncub',cb:()=>{ G.sfx('tap'); G.houseFX.push({k:'t',s:'Ферма генов: 4 слота',x:Math.min(G.W-70,S.incub.x+70),y:S.incub.y-8,t:0,life:1.6,size:10,col:'#7aff7a'}); }}); }
 return S; }
function drawScopeOn(fy,tp,night,t,try_){ if(has('scope')||(try_&&try_.tab==='furn'&&try_.id==='scope')) drawScope(spots(fy,tp).scope,night,t); }
/* ---------- экран «РЕМОНТ» ---------- */
const UI={tab:'wall',sel:null,confirm:false,shakeT:-9,boughtT:-9};
const TABS=[['wall','ОБОИ'],['floor','ПОЛ'],['win','ОКНО'],['furn','МЕБЕЛЬ']];
function open(){ UI.tab='wall'; UI.sel=null; UI.confirm=false; G.scene='repair'; G.sfx('tap'); }
function back(){ if(UI.confirm){ UI.confirm=false; return true; } return false; }
function tryItem(){ return UI.sel?BY[UI.sel]:null; }
function miniCandy(x,y){ R(x,y+1,7,4,O); R(x+1,y,5,6,O); R(x+1,y+1,5,4,'#ff5aa8'); R(x+2,y+1,2,1,'#fff'); R(x-2,y+2,2,2,O); R(x+7,y+2,2,2,O); }
function preview(it,x,y,w,h,t){ ctx.save(); ctx.beginPath(); ctx.rect(x,y,w,h); ctx.clip();
 if(it.tab==='wall'){ wall(it.id,x,y,w,h,false,t); }
 else if(it.tab==='floor'){ floor(it.id,x,y,w,h,false,y+Math.round(h*.35),t); }
 else if(it.tab==='win'){ wall(hm().wall,x,y,w,h,false,t); ctx.save(); const s=Math.min((w-6)/96,(h-4)/72); ctx.translate(Math.round(x+w/2-40*s),Math.round(y+h/2-30*s)); ctx.scale(s,s); windowDraw(0,0,(a,b)=>{ R(a,b,80,60,'#8ad0ff'); G.disc(a+60,b+16,8,'#ffe066'); R(a+12,b+34,16,4,'#fff'); },false,false,it.id); ctx.restore(); }
 else { R(x,y,w,h,'#3a2a5a'); const cx=x+w/2, cy=y+h/2; ctx.save(); const map={shelf:[{x:0,y:0,w:70,h:32},drawShelf,70,32],aqua:[{x:0,y:0,w:36,h:62},drawAqua,36,62],player:[{x:0,y:0,w:36,h:54},drawPlayer,36,54],incub:[{x:0,y:0,w:36,h:40},drawIncub,36,40],scope:[{x:0,y:0,w:34,h:36},drawScope,34,36]};
  if(it.id==='bed'){ const s=Math.min(1,(w-4)/56); ctx.translate(Math.round(cx),Math.round(cy-10*s)); ctx.scale(s,s); drawBed(0,0,0,false); blanket(0,0,0); }
  else { const m=map[it.id]; const s=Math.min(1,(w-6)/m[2],(h-4)/m[3]); ctx.translate(Math.round(cx-m[2]*s/2),Math.round(cy-m[3]*s/2)); ctx.scale(s,s); if(it.id==='shelf') R(0,0,70,32,'#3a2a5a'); m[1](m[0],false,t); } ctx.restore(); }
 ctx.restore(); }
function layout(){ const W=G.W,H=G.H,tp=G.TAP(); const cols=4, gap=6, cw=Math.floor((W-16-gap*(cols-1))/cols), ch=62; const n=LIST[UI.tab].length, rows=Math.ceil(n/cols); const ph=8+tp+8+2*(ch+gap)+34+tp+12; const py=H-ph; return {W,H,tp,cols,gap,cw,ch,rows,ph,py,tx:8,ty:py+8,gy:py+8+tp+8,dy:py+8+tp+8+2*(ch+gap)+2,by:H-tp-10}; }
function itemsOf(tab){ return LIST[tab].map(r=>BY[PFX[tab]+r[0]]).filter(it=>seasonOk(it)||owns(it.key)); }
function drawRepair(){ const t=G.now, night=G.isNight(), L=layout(), {W,H,tp}=L; const tr=tryItem(); const fy=G.houseFloorY();
 G.drawRoom(fy,tp,night,tr);
 G.iconBtn(4,4,G.icBack,()=>G.goBack(),'back'); G.T('Ремонт',W/2,tp/2-10,17,['#fff','#ffd23c']); G.candy(W-50,tp/2,t,0); G.T(String(G.save.candy|0),W-40,tp/2-8,14,'#ff8ad0','l');
 if(tr&&!owns(tr.key)) { const lbl='ПРИМЕРКА'; const tw=G.textW(lbl,10)+12; R(W/2-tw/2-1,tp+3,tw+2,15,O); R(W/2-tw/2,tp+4,tw,13,'#ff5aa8'); G.T(lbl,W/2,tp+5,10,'#fff'); }
 G.panel(4,L.py,W-8,L.ph,'#22143e');
 const tw=Math.floor((W-16-3*4)/4); TABS.forEach(([k,lb],i)=>{ G.btn(8+i*(tw+4),L.ty,tw,tp,lb,()=>{ if(UI.tab!==k){ UI.tab=k; UI.sel=null; G.sfx('tap'); } },UI.tab===k?'#c04a9a':'#3a2a5a',11); G.buttons[G.buttons.length-1].label='rt_'+k; });
 const its=itemsOf(UI.tab); its.forEach((it,i)=>{ const cx=8+(i%L.cols)*(L.cw+L.gap), cy=L.gy+((i/L.cols)|0)*(L.ch+L.gap); const on=UI.tab==='furn'?has(it.id):cur(UI.tab)===it.id, sel=UI.sel===it.key, ow=owns(it.key);
  R(cx-1,cy-1,L.cw+2,L.ch+2,sel?'#ffd23c':O); R(cx,cy,L.cw,L.ch,'#2b1a4a'); preview(it,cx+2,cy+2,L.cw-4,32,t); R(cx+2,cy+34,L.cw-4,1,O);
  G.T(G.fitTxt(it.name,9,L.cw-4),cx+L.cw/2,cy+37,9,'#fff');
  if(on){ G.T('✓ стоит',cx+L.cw/2,cy+49,9,'#7affe0'); } else if(ow){ G.T(it.tab==='furn'?'куплено':'есть',cx+L.cw/2,cy+49,9,'#b0a0d0'); } else { const s=String(it.price), w2=G.textW(s,10); miniCandy(Math.round(cx+L.cw/2-(w2+10)/2),cy+51); G.T(s,cx+L.cw/2+5,cy+48,10,(G.save.candy|0)>=it.price?'#ffd23c':'#ff8ab0'); }
  G.buttons.push({x:cx,y:cy,w:L.cw,h:L.ch,label:'ri'+i,cb:()=>{ UI.sel=it.key; G.sfx('tap'); if(owns(it.key)&&it.tab!=='furn'&&cur(it.tab)!==it.id){ put(it.key); } }}); });
 const it=tr||null; let desc=''; if(it){ desc=it.tab==='furn'?it.desc:it.name+(owns(it.key)?'':' — примерка, видно сверху'); if(it.tab==='furn'&&it.id==='player'&&has('player')) desc='Сейчас играет: «'+TRACKS.find(x=>x[0]===track())[1]+'». Тап по кнопке — следующая'; } else desc=UI.tab==='furn'?'Мебель с пользой. Тапни вещь, чтобы узнать, что она делает':'Тапни вещь — примеришь её в комнате';
 if(it&&it.tab==='furn') desc=it.name+': '+desc; const dl=G.wrapTxt(desc,10,W-24).slice(0,2); dl.forEach((s,i)=>G.T(s,W/2,L.dy+i*13,10,i?'#d8c8f0':'#fff'));
 let lbl='', col='#5a4a6a', cb=()=>{}; const cnd=G.save.candy|0;
 if(!it){ lbl='ВЫБЕРИ ВЕЩЬ'; }
 else if(it.tab==='furn'&&it.id==='player'&&has('player')){ lbl='♪ '+TRACKS.find(x=>x[0]===track())[1]+'  ▸'; col='#6a4fd8'; cb=()=>{ nextTrack(); G.sfx('tap'); }; }
 else if(owns(it.key)){ if(it.tab==='furn'||cur(it.tab)===it.id){ lbl='✓ УЖЕ СТОИТ'; col='#3a7a6a'; } else { lbl='ПОСТАВИТЬ'; col='#ff5aa8'; cb=()=>{ put(it.key); G.sfx('tap'); }; } }
 else if(cnd<it.price){ lbl='НЕ ХВАТАЕТ '+(it.price-cnd)+' 🍬'; col='#5a4a6a'; cb=()=>{ UI.shakeT=t; G.lockNo(); G.haptic('error'); }; }
 else { lbl='КУПИТЬ ЗА '+it.price+' 🍬'; col='#ff5aa8'; cb=()=>{ UI.confirm=true; G.sfx('tap'); }; }
 const sh=t-UI.shakeT<.3?Math.round(Math.sin((t-UI.shakeT)*60)*3):0; G.btn(12+sh,L.by,W-24,tp,lbl,cb,col,13); G.buttons[G.buttons.length-1].label='rBuy';
 if(t-UI.boughtT<1.4){ const a=Math.min(1,(1.4-(t-UI.boughtT))*2); ctx.globalAlpha=a; G.T('Куплено!',W/2,L.py-30-(t-UI.boughtT)*14,16,['#fff','#ffd23c']); ctx.globalAlpha=1; }
 if(UI.confirm&&it) drawConfirm(it); }
function drawConfirm(it){ const W=G.W,H=G.H,tp=G.TAP(); G.textClear(); ctx.fillStyle='rgba(8,4,20,.82)'; ctx.fillRect(0,0,W,H); G.buttons.length=0; G.buttons.push({x:0,y:0,w:W,h:H,label:'cfBg',cb:()=>{}});
 const pw=Math.min(W-24,300), ph=150, px=(W-pw)/2|0, py=(H-ph)/2|0; G.panel(px,py,pw,ph,'#2b1a4a'); preview(it,px+pw/2-30,py+10,60,40,G.now); R(px+pw/2-31,py+9,62,1,O);
 const q=G.wrapTxt('Купить «'+it.name+'» за '+it.price+' 🍬?',12,pw-20); q.slice(0,2).forEach((s,i)=>G.T(s,W/2,py+58+i*16,12,'#fff'));
 const bw=(pw-36)/2|0; G.btn(px+12,py+ph-tp-10,bw,tp,'ДА',()=>doBuy(),'#ff5aa8',14); G.buttons[G.buttons.length-1].label='cfYes'; G.btn(px+24+bw,py+ph-tp-10,bw,tp,'НЕТ',()=>{ UI.confirm=false; G.sfx('tap'); },'#5a4a6a',14); G.buttons[G.buttons.length-1].label='cfNo'; }
function doBuy(){ const it=tryItem(); UI.confirm=false; if(!it) return; const r=buy(it.key); if(!r.ok){ UI.shakeT=G.now; G.lockNo(); G.haptic('error'); return; } UI.boughtT=G.now; G.sfx('win'); G.haptic('success'); try{ G.qEv&&G.qEv('shop'); }catch(e){} }
/* Бульк любит аквариум: +1 к привязанности за визит (раз в день) */
function visit(){ if(!has('aqua')) return; const S=G.save; const id=['bulk','slugBulk'].find(k=>S.house&&S.house[k]); if(!id) return; const h=S.house[id], d=String(G.dayKey(G.today())); if(h.aqD===d) return; h.aqD=d; h.aff=Math.min(100,(h.aff|0)+1); G.store(); }
function decayMul(){ return has('bed')?1.25:1; }
function starTimes(){ return has('scope')?2:1; }
return {ITEMS,BY,WALLS,FLOORS,WINS,FURN,TRACKS,UI,owns,has,buy,give,put,cur,track,setTrack,nextTrack,wall,floor,windowDraw,drawFurn,drawScopeOn,drawBed,blanket,spots,open,back,drawRepair,tryItem,visit,decayMul,starTimes,layout,hm};
};
