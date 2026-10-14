'use strict';
/* ШМЯКОДРОМ — пиксельная мини-игра про слизней-рогаток. Vanilla JS + Canvas. */
(()=>{
const K=4/3, LW=320, LH=588, R=13, MAXDRAG=104, G0=620*K;
const SPLAT_V=470*K;
const CHARS=[
 {id:'slug01',name:'Желейка',perk:'Супер-прыгучая',desc:'Отскакивает как мячик',col:'#a57af0',rest:.72,fric:.6,power:1,grav:1,splat:1.25},
 {id:'slug34',name:'Лужица',perk:'Не отскакивает',desc:'Ворчит и прилипает к полу',col:'#ff9a3c',rest:.18,fric:1.4,power:1,grav:1,splat:.85},
 {id:'slug36',name:'Ёжик',perk:'Шипы не страшны',desc:'Отпрыгивает от шипов',col:'#ffd93c',rest:.5,fric:1,power:1,grav:1,splat:1,spiky:true},
 {id:'slug41',name:'Пончик',perk:'+1 бросок',desc:'Катится колесом',col:'#ff7ab8',rest:.5,fric:.35,power:1,grav:1,splat:1,extra:1},
 {id:'slug53',name:'Лавыч',perk:'Мощный бросок',desc:'Тяжёлый, но злой',col:'#ff5a2a',rest:.4,fric:1,power:1.13,grav:1.12,splat:1.1},
 {id:'slug02',name:'Рюкзачок',perk:'Реактивный рюкзак',desc:'Тап в полёте — ещё прыжок',col:'#f4842c',ab:'djump',tap:1},
 {id:'slug03',name:'Языкастый',perk:'Липкий язык',desc:'Прилипает языком к стенам',col:'#36c0c0',ab:'wall'},
 {id:'slug04',name:'Пропеллер',perk:'Планирование',desc:'Кепка-пропеллер: летит далеко',col:'#7ed08a',ab:'glide'},
 {id:'slug05',name:'Капелька',perk:'Слоу-мо',desc:'Держи палец — время замедлится',col:'#62acff',ab:'slowmo',tap:1},
 {id:'slug06',name:'Губка',perk:'Водный батут',desc:'Отскакивает от воды, не тонет',col:'#f0d040',ab:'sponge'},
 {id:'slug39',name:'Близнецы',perk:'Раздвоение',desc:'Тап в полёте — делятся',col:'#ff4048',ab:'split',tap:1},
 {id:'slug43',name:'Лампа',perk:'Горячая лава',desc:'Растапливает лёд касанием',col:'#b48ae0',ab:'melt'},
 {id:'slug44',name:'Мумия',perk:'Бинты',desc:'Шипы не отнимают бросок',col:'#e8e2d8',ab:'refund'},
 {id:'slug45',name:'Парашютист',perk:'Парашют',desc:'Тап в полёте — плавный спуск',col:'#4a9aff',ab:'chute',tap:1},
 {id:'slug46',name:'Медок',perk:'Пчёлка-магнит',desc:'Притягивает конфеты к себе',col:'#f0a828',ab:'magnet'},
 {id:'slug47',name:'Тучка',perk:'Ливень',desc:'Тап в полёте — камнем вниз',col:'#c8d0e0',ab:'dive',tap:1},
 {id:'slug48',name:'Кактус',perk:'Колючки',desc:'Ломает ящики касанием',col:'#62bc34',ab:'crush'},
 {id:'slug49',name:'Баночник',perk:'Банка-щит',desc:'Раз за уровень спасает от шипов',col:'#78c840',ab:'shield'},
 {id:'slug50',name:'Диско',perk:'Диско-прицел',desc:'Видит путь с отскоками',col:'#b0b0c8',ab:'preview'},
 {id:'slug51',name:'Арбузик',perk:'Сладкоежка',desc:'Каждая конфета = +1 бросок',col:'#ff6070',ab:'juicy'},
 {id:'slug52',name:'Призрак',perk:'Сквозь стены',desc:'Тап в полёте — сквозь блоки',col:'#b8dcff',ab:'ghost',tap:1},
 {id:'slug54',name:'Полосатик',perk:'Антигравитация',desc:'Тап в полёте — падает вверх',col:'#f03040',ab:'gflip',tap:1},
];
CHARS.forEach((c,i)=>{ c.rest=c.rest??.5; c.fric=c.fric??1; c.power=c.power??1; c.grav=c.grav??1; c.splat=c.splat??1; c.cost=i<5?0:[2,4,6,8,10,13,16,19,22,25,28,32,36,40,45,50,55][i-5]; });

const THEMES=[
 {sky:['#24163f','#43215c','#7a2f6c','#b5456c','#e8705c','#f8a65e','#ffd27c'],far:'#7a3c78',farRim:'#a8558a',mid:'#4a2a62',midRim:'#6d3d78',near:'#2a1838',
  top:'#7fd64a',topHi:'#c4f56a',topLo:'#4fa03a',body:'#8c5a3c',body2:'#70442f',bodyHi:'#a8714c',out:'#26131f',sun:'#ffe9a0',ui:'#ffd27c'},
 {sky:['#130d26','#1e1440','#2c1a58','#3e1f6a','#5a2a7a','#7a3486'],far:'#3a1f5e',farRim:'#6a3a90',mid:'#2a1648',midRim:'#ff7ac0',near:'#170c2a',
  top:'#ff8fc8',topHi:'#ffd0ea',topLo:'#d0569c',body:'#6e3d2c',body2:'#55291f',bodyHi:'#8a5238',out:'#1c0c14',sun:'#7affe0',ui:'#ff8fc8'},
 {sky:['#070a1e','#0c1230','#121c46','#1a2a5e','#24407a','#2e5a8e'],far:'#1a2550',farRim:'#3c5aa0',mid:'#121a3c',midRim:'#4ef0ff',near:'#0a0e24',
  top:'#4ef0ff',topHi:'#c8ffff',topLo:'#2aa0d0',body:'#2c3266',body2:'#1f2450',bodyHi:'#3e468a',out:'#05061a',sun:'#e8f4ff',ui:'#4ef0ff'},
 {sky:['#0c1a3a','#16305a','#24507a','#3a7aa0','#6aaac8','#a8d8e8'],far:'#5a7aa8',farRim:'#c8e8ff',mid:'#3a5a88',midRim:'#e8f8ff',near:'#1e3058',
  top:'#f0f8ff',topHi:'#ffffff',topLo:'#a8c8e8',body:'#4a6a9a',body2:'#3a5888',bodyHi:'#6a8ab8',out:'#0c1430',sun:'#fff8e0',ui:'#a8e8ff'},
 {sky:['#0a1410','#10201a','#163024','#1e4030','#2a5a3a','#3a7a44'],far:'#1a3024',farRim:'#4aa060',mid:'#14261c',midRim:'#8aff5a',near:'#0a140e',
  top:'#8aff5a',topHi:'#d0ffb0',topLo:'#4ab040',body:'#4a4e58',body2:'#3a3e48',bodyHi:'#6a6e78',out:'#0a0c10',sun:'#c8ff8a',ui:'#8aff5a'}
];
const themeOf=i=>Math.floor(i/10)%5; const WORLDS=['Луг','Город','Неон','Лёд','Фабрика','Сад камней','Ночной город','Неон-2','Вершина','Шмякодром'];
const LV=window.LEVELS;
const WINS=['Шмяк засчитан!','Слизь-легенда!','В банку как родной!','Чистая слизь!','Мама гордится!','Гравитация в шоке'];
const FAILS=['Слизень выдохся','Шмяк не туда','Слизь устала','Попробуй с душой'];

// ---------- storage ----------
let save={stars:[],char:0,mute:false};
try{Object.assign(save,JSON.parse(localStorage.getItem('shmyak_v1')||'{}'))}catch(e){}
const hadSave=!!(function(){try{return localStorage.getItem('shmyak_v1')}catch(e){return null}})(); if(!hadSave) save.v=5;
if(!Array.isArray(save.stars)) save.stars=[]; if(!(save.char>=0&&save.char<CHARS.length)) save.char=0;
// Миграция сейва v3 (100 уровней): старые звёзды относились к другим уровням. Переносим их как бонус
// (save.legacy — слизни не закрываются) и сохраняем прогресс: save.open = сколько старых уровней было пройдено.
function migrateSave(sv,nLevels){
 if(sv.v!==3&&sv.v!==4&&sv.v!==5){ const old=(sv.stars||[]).map(x=>Math.max(0,Math.min(3,x|0)));
  const oldTotal=old.reduce((a,b)=>a+b,0)+(sv.legacy|0); const cleared=old.filter(x=>x>0).length;
  sv.legacyFrom=sv.v||1; sv.legacy=oldTotal; sv.open=Math.min(nLevels,Math.max(sv.open|0,cleared)); sv.stars=[]; sv.v=3; }
 // v3 → v4: только ДОБАВЛЯЕМ новые поля (звёзды/слизни/звук не трогаем) + чиним мусор
 const arr=(v,f)=>Array.isArray(v)?v:f; const num=v=>isFinite(+v)&&+v>=0?Math.floor(+v):0;
 sv.stars=arr(sv.stars,[]).map(x=>Math.max(0,Math.min(3,x|0)));
 sv.score=arr(sv.score,[]).map(num); sv.combo=num(sv.combo); sv.wins=arr(sv.wins,[]).map(num);
 const gf={}; if(sv.graf&&typeof sv.graf==='object'&&!Array.isArray(sv.graf)) for(const k in sv.graf){ const L=arr(sv.graf[k],[]).filter(e=>Array.isArray(e)&&e.length>=5&&isFinite(e[0])&&isFinite(e[1])&&typeof e[2]==='string').slice(-60); if(L.length&&+k>=0&&+k<nLevels) gf[k]=L; } sv.graf=gf;
 sv.gems=[...new Set(arr(sv.gems,[]).map(x=>x|0).filter(x=>x>=0&&x<nLevels))];
 const c=sv.cos&&typeof sv.cos==='object'?sv.cos:{}; sv.cos={head:typeof c.head==='string'?c.head:'',face:typeof c.face==='string'?c.face:'',skin:typeof c.skin==='string'?c.skin:''};
 const ch=sv.chaos&&typeof sv.chaos==='object'?sv.chaos:{}; sv.chaos={best:num(ch.best),runs:num(ch.runs),lvls:num(ch.lvls)};
 sv.grafOff=!!sv.grafOff;
 // v4 → v5: конфеты, домик, гибриды, задания, настройки, эстафета, боссы, пасхалки, статистика
 sv.candy=num(sv.candy);
 const hs={}; if(sv.house&&typeof sv.house==='object'&&!Array.isArray(sv.house)) for(const k in sv.house){ const h=sv.house[k]; if(!/^slug\w+$/.test(k)||!h||typeof h!=='object') continue; hs[k]={fed:num(h.fed),full:Math.min(5,num(h.full)),ts:isFinite(+h.ts)&&+h.ts>0?+h.ts:Date.now(),pets:num(h.pets)}; } sv.house=hs;
 sv.hyb=[...new Set(arr(sv.hyb,[]).filter(k=>typeof k==='string'&&/^\d+_\d+$/.test(k)))];
 const q=sv.quests; sv.quests=(q&&typeof q==='object'&&Array.isArray(q.ids)&&Array.isArray(q.prog)&&Array.isArray(q.got)&&q.ids.length===q.prog.length&&q.ids.length===q.got.length)?{day:num(q.day),ids:q.ids.map(String),prog:q.prog.map(num),got:q.got.map(Boolean)}:null;
 const st=sv.set&&typeof sv.set==='object'?sv.set:{}; sv.set={vib:st.vib!==false,gyro:!!st.gyro,mic:!!st.mic,night:['auto','on','off'].includes(st.night)?st.night:'auto'};
 sv.relay=arr(sv.relay,[]).map(num); sv.boss=arr(sv.boss,[]).map(Boolean).slice(0,10);
 const eg=sv.eggs&&typeof sv.eggs==='object'?sv.eggs:{}; sv.eggs={secret:!!eg.secret,master:!!eg.master,sleep:!!eg.sleep};
 const ss=sv.stats&&typeof sv.stats==='object'?sv.stats:{}; sv.stats={splats:num(ss.splats),launches:num(ss.launches),bosses:num(ss.bosses)};
 sv.v=5; return sv; }
const wasV=save.v; migrateSave(save,(window.LEVELS||[]).length); save.stars=save.stars.slice(0,(window.LEVELS||[]).length);
const store=()=>{try{localStorage.setItem('shmyak_v1',JSON.stringify(save))}catch(e){}}; if(hadSave&&wasV!==5) store();

// ---------- telegram ----------
const tg=(window.Telegram&&window.Telegram.WebApp&&window.Telegram.WebApp.initData!==undefined)?window.Telegram.WebApp:null;
const inTG=!!(tg&&tg.initData);
function tgInit(){ if(!tg) return;
 try{tg.ready();}catch(e){} try{tg.expand();}catch(e){}
 try{ if(tg.isVersionAtLeast&&tg.isVersionAtLeast('7.7')) tg.disableVerticalSwipes(); }catch(e){}
 try{ if(tg.isVersionAtLeast&&tg.isVersionAtLeast('6.1')){tg.setHeaderColor('#1a1030');tg.setBackgroundColor('#1a1030');} }catch(e){}
 try{ if(tg.isVersionAtLeast&&tg.isVersionAtLeast('6.1')) tg.BackButton.onClick(()=>goBack()); }catch(e){}
}
function tgBack(show){ if(!inTG) return; try{ if(tg.isVersionAtLeast('6.1')) show?tg.BackButton.show():tg.BackButton.hide(); }catch(e){} }

// ---------- audio ----------
let AC=null, master=null, musicGain=null;
function audioInit(){ if(AC) { if(AC.state==='suspended')AC.resume(); return; }
 try{AC=new (window.AudioContext||window.webkitAudioContext)();}catch(e){return;}
 master=AC.createGain(); master.gain.value=save.mute?0:.5; master.connect(AC.destination);
 musicGain=AC.createGain(); musicGain.gain.value=.11; musicGain.connect(master); startMusic(); }
function tone(f,d,type='square',v=.3,slide=0,delay=0){ if(!AC)return; const t=AC.currentTime+delay;
 const o=AC.createOscillator(),g=AC.createGain(); o.type=type; o.frequency.setValueAtTime(f,t);
 if(slide) o.frequency.exponentialRampToValueAtTime(Math.max(30,f*slide),t+d);
 g.gain.setValueAtTime(v,t); g.gain.exponentialRampToValueAtTime(.001,t+d); o.connect(g); g.connect(master); o.start(t); o.stop(t+d+.02); }
let noiseBuf=null;
function noise(d,v=.3,fc=1200,delay=0){ if(!AC)return; if(!noiseBuf){noiseBuf=AC.createBuffer(1,AC.sampleRate*.5,AC.sampleRate);const a=noiseBuf.getChannelData(0);for(let i=0;i<a.length;i++)a[i]=Math.random()*2-1;}
 const t=AC.currentTime+delay,s=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain(); s.buffer=noiseBuf; f.type='lowpass'; f.frequency.setValueAtTime(fc,t); f.frequency.exponentialRampToValueAtTime(80,t+d);
 g.gain.setValueAtTime(v,t); g.gain.exponentialRampToValueAtTime(.001,t+d); s.connect(f);f.connect(g);g.connect(master); s.start(t); s.stop(t+d); }
const SFX={
 combo:k=>{const b=392*Math.pow(2,Math.min(k,9)/6); tone(b,.1,'square',.16,1.6); tone(b*1.5,.12,'triangle',.12,1.3,.06); if(k>=4) tone(b*2,.18,'square',.1,2,.12);},
 grumble:i=>{tone(110+i*30,.25,'sawtooth',.12,.7); tone(90+i*20,.2,'square',.08,.8,.1);},
 secret:()=>{[0,7,12,16,19,24].forEach((s,i)=>tone(660*Math.pow(2,s/12),.12,'triangle',.14,1,i*.06));},
 gem:()=>{[12,16,19,24,28].forEach((s,i)=>tone(523*Math.pow(2,s/12),.14,'square',.12,1.2,i*.07));},
 tick:()=>tone(1200,.05,'square',.12,1),
 tap:()=>tone(660,.06,'square',.15,1.5),
 stretch:i=>tone(180+i*45,.04,'triangle',.18),
 launch:()=>{tone(220,.25,'square',.2,4);noise(.15,.15,3000)},
 bounce:v=>tone(300+Math.min(v,600)*.4,.08,'square',.14,.6),
 boing:()=>{tone(150,.35,'triangle',.35,3.5);tone(300,.2,'square',.1,2.5)},
 splat:()=>{noise(.35,.5,900);tone(120,.3,'sawtooth',.25,.35)},
 candy:n=>{[0,4,7,12].forEach((s,i)=>tone(880*Math.pow(2,(s+n*2)/12),.09,'square',.12,1,i*.05))},
 bumper:()=>{tone(520,.12,'square',.2,1.8);tone(780,.1,'triangle',.15,1.4,.04)},
 portal:()=>{tone(300,.35,'sine',.3,4);tone(450,.35,'triangle',.15,.3)},
 ouch:()=>{tone(400,.08,'sawtooth',.25,.5);tone(200,.25,'square',.2,.4,.08);noise(.2,.25,2000)},
 win:()=>{[0,4,7,12,7,12,16].forEach((s,i)=>tone(523*Math.pow(2,s/12),.16,'square',.16,1,i*.09));tone(130,.8,'triangle',.3,1,0)},
 fail:()=>{[7,6,5,0].forEach((s,i)=>tone(330*Math.pow(2,s/12),.25,'triangle',.25,.98,i*.18))},
 star:i=>tone(990+i*220,.15,'square',.14,1.3),
};
function sfx(n,a){ try{SFX[n]&&SFX[n](a)}catch(e){} }
// чиптюн-луп
const MEL=[12,0,16,0,19,0,16,12, 14,0,17,0,21,0,17,14, 12,0,16,0,19,0,24,0, 23,21,19,17,16,14,12,0];
const BAS=[0,0,7,7,5,5,7,7];
let musT=0,musStep=0,musTimer=null;
function startMusic(){ if(musTimer)return; musT=AC.currentTime+.1;
 musTimer=setInterval(()=>{ if(!AC)return; while(musT<AC.currentTime+.25){ const st=.16, i=musStep%32;
  const m=MEL[i]; if(m){ mn(261.6*Math.pow(2,m/12),st*.9,'square',.25,musT); }
  if(i%4===0) mn(65.4*Math.pow(2,BAS[(i/4)|0]/12),st*3.6,'triangle',.6,musT);
  if(i%4===2) mnN(musT);
  musT+=st; musStep++; } },60); }
function mn(f,d,type,v,t){ const o=AC.createOscillator(),g=AC.createGain(); o.type=type;o.frequency.value=f; g.gain.setValueAtTime(v,t); g.gain.exponentialRampToValueAtTime(.001,t+d); o.connect(g);g.connect(musicGain);o.start(t);o.stop(t+d+.02); }
function mnN(t){ if(!noiseBuf)return; const s=AC.createBufferSource(),g=AC.createGain(),f=AC.createBiquadFilter(); f.type='highpass';f.frequency.value=5000; s.buffer=noiseBuf; g.gain.setValueAtTime(.25,t); g.gain.exponentialRampToValueAtTime(.001,t+.05); s.connect(f);f.connect(g);g.connect(musicGain); s.start(t);s.stop(t+.06); }
function setMute(m){ save.mute=m; store(); if(master) master.gain.value=m?0:.5; }

// ---------- canvas ----------
const cv=document.getElementById('c'), ctx=cv.getContext('2d');
// A1: отдельный слой текста в нативных device-пикселях (чёткий текст)
const tcv=document.getElementById('t'), tctx=tcv?tcv.getContext('2d'):null; let coverMode=false;
let W=320,H=624,SC=1,DPR=1, ox=0, oy=0;
let lastWH=null;
// высота: максимум из innerHeight и обеих высот Telegram (нули/undefined игнорируем) — никогда только viewportStableHeight
function viewH(){ const c=[window.innerHeight]; if(tg){ c.push(tg.viewportHeight, tg.viewportStableHeight); } return Math.max(...c.filter(v=>v&&isFinite(v)&&v>0)); }
function resize(){ const d0=window.devicePixelRatio||1, vw=window.innerWidth, vh=viewH(); const key=vw+'x'+vh+'@'+d0; if(key===lastWH) return false; lastWH=key; DPR=d0;
 const dw=Math.round(vw*DPR), dh=Math.round(vh*DPR);
 SC=Math.max(1,Math.floor(Math.min(dw/LW,dh/(LH+36))));
 W=Math.floor(dw/SC); H=Math.floor(dh/SC); cv.width=W; cv.height=H;
 cv.style.width=(W*SC/DPR)+'px'; cv.style.height=(H*SC/DPR)+'px';
 cv.style.left=Math.floor((vw-W*SC/DPR)/2)+'px'; cv.style.top='0px';
 if(tcv){ tcv.width=W*SC; tcv.height=H*SC; tcv.style.width=cv.style.width; tcv.style.height=cv.style.height; tcv.style.left=cv.style.left; tcv.style.top='0px'; }
 ctx.imageSmoothingEnabled=false;
 ox=Math.floor((W-LW)/2); oy=Math.max(30,Math.floor((H-LH)/2)+14); if(oy+LH>H) oy=H-LH;
 bgCache={}; return true; }
const mk=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');x.imageSmoothingEnabled=false;return [c,x];};
const hex=h=>{ if(h.length===4) h='#'+h[1]+h[1]+h[2]+h[2]+h[3]+h[3]; return [parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];};
const BAYER=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
let seed=1; const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;

// ---------- pixel text (порог альфы => чёткие пиксели) ----------
const txtCache=new Map();
function txt(s,size=10,col='#fff',out='#1a0c22',shadow=true){
 const key=s+'|'+size+'|'+col+'|'+out+'|'+shadow; let c=txtCache.get(key); if(c) return c;
 const font=`bold ${size}px "Trebuchet MS","Verdana","DejaVu Sans",Arial,sans-serif`;
 const [m,mx]=mk(4,4); mx.font=font; const tw=Math.ceil(mx.measureText(s).width)+6, th=Math.ceil(size*1.5)+4;
 const [a,ax]=mk(tw,th); ax.font=font; ax.textBaseline='middle'; ax.fillStyle='#fff'; ax.fillText(s,3,th/2);
 const d=ax.getImageData(0,0,tw,th).data, on=new Uint8Array(tw*th);
 for(let i=0;i<tw*th;i++) on[i]=d[i*4+3]>=120?1:0;
 // обрезка по вертикали
 let y0=th,y1=0; for(let y=0;y<th;y++)for(let x=0;x<tw;x++) if(on[y*tw+x]){y0=Math.min(y0,y);y1=Math.max(y1,y);}
 if(y1<y0){y0=0;y1=th-1;}
 const ow=tw+2, oh=y1-y0+1+3+(shadow?1:0);
 const [o,oxx]=mk(ow,oh); const img=oxx.createImageData(ow,oh), p=img.data;
 const cols=Array.isArray(col)?col.map(hex):[hex(col)], oc=hex(out);
 const isOn=(x,y)=>x>=0&&y>=y0&&x<tw&&y<=y1&&on[y*tw+x];
 const put=(x,y,c)=>{const i=(y*ow+x)*4;p[i]=c[0];p[i+1]=c[1];p[i+2]=c[2];p[i+3]=255;};
 for(let y=0;y<oh;y++)for(let x=0;x<ow;x++){ const sx=x-1, sy=y-1+y0;
  if(isOn(sx,sy)){ const k=Math.min(cols.length-1,Math.floor((sy-y0)/(y1-y0+1)*cols.length)); put(x,y,cols[k]); }
  else if(isOn(sx-1,sy)||isOn(sx+1,sy)||isOn(sx,sy-1)||isOn(sx,sy+1)||(shadow&&(isOn(sx,sy-2)||isOn(sx-1,sy-2)))) put(x,y,oc); }
 oxx.putImageData(img,0,0); txtCache.set(key,o); return o; }
const TMIN=11; const tMeasure=new Map();
function textClear(){ if(tctx) tctx.clearRect(0,0,tcv.width,tcv.height); }
function T(s,x,y,size,col,align='c',out,shadow){ if(tctx&&!coverMode&&tcv.width){ return TV(String(s),x,y,size,col,align,out); }
 return TP(s,x,y,size,col,align,out,shadow); }
// векторный текст в device-пикселях: позиции/кегль в целых device px
function TV(s,x,y,size,col,align,out){ const m=ctx.getTransform(); const sz=Math.max(TMIN,size); const px=Math.round(sz*SC);
 const font=`900 ${px}px "Trebuchet MS","Verdana","DejaVu Sans","Arial Black",Arial,sans-serif`; tctx.font=font;
 const key=s+'|'+px; let w=tMeasure.get(key); if(w===undefined){ w=tctx.measureText(s).width; if(tMeasure.size>3000) tMeasure.clear(); tMeasure.set(key,w); }
 const lx=(m.a*x+m.e)*SC, ly=(m.d*y+m.f)*SC; let dx=align==='c'?lx-w/2:align==='r'?lx-w:lx; dx=Math.round(dx); const by=Math.round(ly+px*.86);
 const ow=Math.max(2,Math.round(px*.16));
 tctx.globalAlpha=ctx.globalAlpha; tctx.lineJoin='round'; tctx.miterLimit=2; tctx.textBaseline='alphabetic';
 tctx.strokeStyle=(out&&typeof out==='string')?out:'#1a0c22'; tctx.lineWidth=ow*2;
 tctx.strokeText(s,dx,by+Math.max(1,Math.round(SC*.8))); tctx.strokeText(s,dx,by);
 if(Array.isArray(col)){ const gr=tctx.createLinearGradient(0,by-px*.8,0,by); col.forEach((c,i)=>gr.addColorStop(col.length>1?i/(col.length-1):0,c)); tctx.fillStyle=gr; } else tctx.fillStyle=col||'#fff';
 tctx.fillText(s,dx,by); tctx.globalAlpha=1; return {width:Math.ceil((w+ow*2)/SC)}; }
function TP(s,x,y,size,col,align='c',out,shadow){ const c=txt(s,size,col,out,shadow); const dx=align==='c'?x-(c.width>>1):align==='r'?x-c.width:x; ctx.drawImage(c,Math.round(dx),Math.round(y)); return c; }

// ---------- sprites ----------
const SPR={};
const ANIM={idle:{row:0,n:6,w:64,ms:150},pull:{row:1,n:8,w:128},fly:{row:2,n:6,w:64,ms:70},splat:{row:3,n:6,w:64,ms:50},recover:{row:4,n:8,w:64,ms:90}};
function loadSprites(){ return Promise.all(CHARS.map(ch=>new Promise(res=>{const im=new Image(); im.onload=()=>{SPR[ch.id]=im;res();}; im.onerror=()=>res(); im.src='assets/'+ch.id+'_atlas.png';}))); }
function drawSlug(id,anim,f,x,y,flip=false,sx=1,sy=1){ const im=SPR[id]; if(!im) return; const A=ANIM[anim];
 const px=anim==='pull'?96:32, py=40; ctx.save(); ctx.translate(Math.round(x),Math.round(y)); if(flip) ctx.scale(-1,1);
 if(sx!==1||sy!==1){ ctx.translate(0,16); ctx.scale(sx,sy); ctx.translate(0,-16); }
 ctx.drawImage(im,f*A.w,A.row*64,A.w,64,-px,-py,A.w,64); ctx.restore(); }

// ---------- backgrounds ----------
let bgCache={};
function genBG(ti){ const th=THEMES[ti], BW=W+80, layers=[]; seed=77+ti*13;
 // небо с дизерингом
 { const [c,x]=mk(BW,H); const img=x.createImageData(BW,H),p=img.data, cs=th.sky.map(hex), n=cs.length-1;
  for(let y=0;y<H;y++){ const tt=y/(H*.78)*n; for(let xx=0;xx<BW;xx++){ let v=Math.min(n,tt); const b=(BAYER[(y&3)*4+(xx&3)]+.5)/16; let k=Math.floor(v)+((v%1)>b?1:0); k=Math.min(n,k); const cc=cs[k], i=(y*BW+xx)*4; p[i]=cc[0];p[i+1]=cc[1];p[i+2]=cc[2];p[i+3]=255; } }
  x.putImageData(img,0,0);
  // звёзды
  for(let i=0;i<(ti===0?40:140);i++){ const sx=rnd()*BW|0, sy=rnd()*H*(ti===0?.35:.7)|0; x.fillStyle=rnd()<.2?'#fff':'rgba(255,255,255,.55)'; x.fillRect(sx,sy,1,1); if(rnd()<.06){x.fillRect(sx-1,sy,3,1);x.fillRect(sx,sy-1,1,3);} }
  // солнце/луна
  const sxc=BW*.68|0, syc=ti===0?H*.52|0:H*.2|0, sr=ti===0?34:ti===1?0:18;
  if(sr){ for(let yy=-sr;yy<=sr;yy++)for(let xx=-sr;xx<=sr;xx++){ if(xx*xx+yy*yy<=sr*sr){ if(ti===0&&yy>4&&((yy+sr)%7<(yy>14?3:2)))continue; x.fillStyle=ti===0?(yy<-12?'#fff4c0':yy<6?th.sun:'#ffb070'):th.sun; x.fillRect(sxc+xx,syc+yy,1,1);} }
   if(ti===2){ x.fillStyle='#c8d4ee'; [[-6,-4,5],[5,6,3],[-2,8,2]].forEach(([a,b,r])=>{for(let yy=-r;yy<=r;yy++)for(let xx=-r;xx<=r;xx++)if(xx*xx+yy*yy<=r*r)x.fillRect(sxc+a+xx,syc+b+yy,1,1);}); }
   x.globalAlpha=.12; x.fillStyle=th.sun; for(let r=sr+6;r<sr+30;r+=6){x.beginPath();x.arc(sxc,syc,r,0,7);x.fill();} x.globalAlpha=1; }
  if(ti===2||ti===3){ // северное сияние
   for(let xx=0;xx<BW;xx++){ const yb=H*.18+Math.sin(xx*.03)*14+Math.sin(xx*.011)*20; for(let k=0;k<26;k++){ if(BAYER[((yb+k)&3)*4+(xx&3)]/16< (1-k/26)*.5){ x.fillStyle=k<8?'#5effc0':'#3ab0c0'; x.globalAlpha=.35*(1-k/26); x.fillRect(xx,yb+k|0,1,1);} } } x.globalAlpha=1; }
  layers.push({c,sp:.05}); }
 // облака
 { const [c,x]=mk(BW,H); for(let i=0;i<7;i++){ const cx=rnd()*BW, cy=H*(.08+rnd()*.35), w=30+rnd()*50; cloud(x,cx,cy,w,ti); } layers.push({c,sp:.12,drift:4}); }
 // дальние горы
 layers.push({c:ridge(BW,H,H*.58,46,.022,th.far,th.farRim,ti,0),sp:.2});
 layers.push({c:ridge(BW,H,H*.7,34,.04,th.mid,th.midRim,ti,1),sp:.38});
 layers.push({c:ridge(BW,H,H*.84,22,.07,th.near,null,ti,2),sp:.6});
 return layers; }
function cloud(x,cx,cy,w,ti){ const cols=ti===0?['#ffb38a','#f07e7e','#c45a7a']:ti===1?['#5a2e80','#46236a','#351a54']:ti===3?['#e8f4ff','#b8d4ee','#8aaed0']:ti===4?['#2a4a30','#203a26','#162a1c']:['#2a3c70','#203060','#18244c'];
 for(let k=0;k<3;k++){ x.fillStyle=cols[k]; for(let i=0;i<5;i++){ const r=(w/6)*(1-Math.abs(i-2)*.22), px=cx-w/2+i*w/5+w/10, py=cy+k*2-(k===0?2:0);
  for(let yy=-r;yy<=0;yy++)for(let xx=-r;xx<=r;xx++) if(xx*xx+yy*yy<=r*r) x.fillRect(px+xx|0,py+yy|0,1,1);} } }
function ridge(BW,H,base,amp,fr,col,rim,ti,lvl){ const [c,x]=mk(BW,H); const ph=rnd()*100;
 const hgt=xx=>base-amp*(.55*Math.sin(xx*fr+ph)+.3*Math.sin(xx*fr*2.3+ph*2)+.15*Math.sin(xx*fr*5.1));
 for(let xx=0;xx<BW;xx++){ const top=hgt(xx)|0; x.fillStyle=col; x.fillRect(xx,top,1,H-top); if(rim){ x.fillStyle=rim; x.fillRect(xx,top,1,1); if(hgt(xx-1)>hgt(xx)+.5) x.fillRect(xx,top+1,1,2);} }
 // декор
 for(let i=0;i<BW/14;i++){ const xx=rnd()*BW|0, top=hgt(xx)|0;
  if(ti===0&&lvl===1&&rnd()<.6){ mush(x,xx,top,6+rnd()*6|0,col,rim); }
  else if(ti===0&&lvl===2){ x.fillStyle=col; const h=8+rnd()*14|0; x.fillRect(xx,top-h,2,h); for(let k=0;k<3;k++){x.fillRect(xx-3+k,top-h-2+k*3,7-2*k,2);} }
  else if(ti===1&&lvl>=1&&rnd()<.5){ x.fillStyle=lvl===1?'#ff7ac0':'#7affe0'; const h=5+rnd()*10|0; for(let k=0;k<h;k++) x.fillRect(xx-((h-k)/3|0),top-k,1+((h-k)/1.5|0),1); x.fillStyle='#fff'; x.fillRect(xx,top-h+1,1,1); }
  else if(ti===3&&lvl>=1){ const h=(lvl===1?14:8)+rnd()*10|0; for(let k=0;k<h;k++){ const w=((h-k)/2.2|0)+1; x.fillStyle=col; x.fillRect(xx-w,top-k,w*2+1,1); if(k%4===0){x.fillStyle=rim||'#e8f8ff'; x.fillRect(xx-w,top-k,w*2+1,1);} } }
  else if(ti===3&&lvl===0){ x.fillStyle='#e8f8ff'; x.fillRect(xx-3,top,7,2); }
  else if(ti===4&&lvl===1&&rnd()<.6){ const w=6+rnd()*8|0,h=20+rnd()*36|0; x.fillStyle=col; x.fillRect(xx,top-h,w,h+40); x.fillStyle=rim; x.fillRect(xx,top-h,w,1); x.fillRect(xx+1,top-h+4,w-2,1); if(rnd()<.6){ x.fillStyle='#ffd23c'; x.fillRect(xx+2,top-h+8,2,2);} }
  else if(ti===4&&lvl===2){ x.fillStyle=col; x.fillRect(xx,top-10,12,3); x.fillRect(xx+9,top-10,3,12); }
  else if(ti===2&&lvl===1){ const w=10+rnd()*14|0,h=20+rnd()*40|0; x.fillStyle=col; x.fillRect(xx,top-h,w,h+40); for(let wy=top-h+3;wy<top;wy+=5)for(let wx=xx+2;wx<xx+w-2;wx+=4) if(rnd()<.45){x.fillStyle=rnd()<.7?'#ffd86a':'#4ef0ff';x.fillRect(wx,wy,2,2);} x.fillStyle=rim; x.fillRect(xx,top-h,w,1); }
 }
 if(ti===1&&lvl===0){ // сталактиты
  x.fillStyle=col; for(let xx=0;xx<BW;xx+=3){ const h=(10+18*Math.abs(Math.sin(xx*.09+ph))+rnd()*10)|0; x.fillRect(xx,0,3,h); x.fillRect(xx+1,h,1,4); } }
 return c; }
function mush(x,xx,top,s,col,rim){ x.fillStyle=col; x.fillRect(xx-1,top-s,3,s); for(let yy=-s/2;yy<=0;yy++)for(let k=-s;k<=s;k++) if(k*k/(s*s)+yy*yy/((s/2)*(s/2))<=1) x.fillRect(xx+k,top-s+yy|0,1,1); x.fillStyle=rim; x.fillRect(xx-s+2,top-s-(s/2|0),s*2-3,1); }
function drawBG(ti,camx,t){ const L=bgCache[ti]||(bgCache[ti]=genBG(ti));
 for(const l of L){ let dx=-40+(-(camx)*l.sp); if(l.drift) dx=((dx+t*l.drift)%(W+80)+(W+80))%(W+80)-(W+80); ctx.drawImage(l.c,Math.round(dx),0); if(l.drift) ctx.drawImage(l.c,Math.round(dx+W+80),0); }
 // пылинки/светлячки
 const pc=ti===0?'#ffe9a0':ti===1?'#7affe0':'#9ff6ff';
 for(let i=0;i<22;i++){ const s=i*97.13; const px=((s*13.7+t*(6+i%5))%(W+20))-10, py=(H*.15+((s*7.3)%(H*.8))+Math.sin(t*1.3+i)*6); const a=.5+.5*Math.sin(t*3+i*2);
  ctx.globalAlpha=a; ctx.fillStyle=pc; ctx.fillRect(px|0,py|0,1,1); if(i%4===0){ctx.globalAlpha=a*.35;ctx.fillRect((px|0)-1,(py|0),3,1);ctx.fillRect(px|0,(py|0)-1,1,3);} }
 ctx.globalAlpha=1; }

// ---------- блоки ----------
function blockPaint(x,r,th,type,sd){ const [X,Y,w,h]=r; seed=sd;
 if(type==='s'){ // шипы
  x.fillStyle='#3a2a44'; x.fillRect(X,Y+6,w,h-6); x.fillStyle='#24182c'; x.fillRect(X,Y+h-3,w,3);
  for(let sx=X;sx<X+w;sx+=8){ for(let k=0;k<8;k++){ const hh=Math.max(0,8-Math.abs(k-3.5)*2.2)|0; x.fillStyle=k<4?'#e8eef8':'#9aa6c0'; x.fillRect(sx+k,Y+8-hh,1,hh); x.fillStyle='#ff4a6a'; if(hh>=7) x.fillRect(sx+k,Y,1,2);} x.fillStyle='#1a1020'; x.fillRect(sx,Y+7,8,1); }
  return; }
 if(type==='w'){ x.fillStyle='#0e3a1a'; x.fillRect(X,Y,w,h); x.fillStyle='#3ac060'; x.fillRect(X+1,Y+1,w-2,h-2); x.fillStyle='#8af0a0'; for(let yy=Y+2;yy<Y+h-2;yy+=5) x.fillRect(X+2+((yy/5|0)%2),yy,w-4>2?2:1,2); x.fillStyle='#1a7a3a'; for(let yy=Y+4;yy<Y+h-2;yy+=7) x.fillRect(X+w-3,yy,2,3); return; }
 if(type==='o'){ x.fillStyle='#2a1a10'; x.fillRect(X,Y,w,Math.min(h,6)); x.fillStyle='#d8a060'; x.fillRect(X+1,Y+1,w-2,2); x.fillStyle='#a06a30'; x.fillRect(X+1,Y+3,w-2,Math.min(h,6)-4); x.fillStyle='#fff3c0'; for(let i=X+4;i<X+w-4;i+=10){ x.fillRect(i,Y+1,3,1); x.fillRect(i+1,Y,1,1);} return; }
 if(type==='b'){ // батут-желе
  x.fillStyle='#5a1440'; x.fillRect(X,Y,w,h); x.fillStyle='#ff4fa8'; x.fillRect(X+1,Y+1,w-2,h-2); x.fillStyle='#ff9ad0'; x.fillRect(X+1,Y+1,w-2,2); x.fillStyle='#c02a7a'; x.fillRect(X+1,Y+h-2,w-2,1);
  x.fillStyle='#fff'; if(w>h){ for(let i=X+3;i<X+w-3;i+=7) x.fillRect(i,Y+2,2,1);} else { for(let i=Y+4;i<Y+h-4;i+=9){x.fillRect(X+2,i,1,3);} }
  return; }
 x.fillStyle=th.out; x.fillRect(X,Y,w,h);
 x.fillStyle=th.body; x.fillRect(X+1,Y+1,w-2,h-2);
 // текстура
 for(let yy=Y+5;yy<Y+h-1;yy++)for(let xx=X+1;xx<X+w-1;xx++){ const v=Math.sin(xx*.7+yy*.3)+Math.sin(xx*.23-yy*.61)*1.3+rnd()*.8; if(v>1.6){x.fillStyle=th.body2;x.fillRect(xx,yy,1,1);} else if(v<-1.9){x.fillStyle=th.bodyHi;x.fillRect(xx,yy,1,1);} }
 for(let i=0;i<w*h/180;i++){ const xx=X+3+rnd()*(w-7)|0, yy=Y+8+rnd()*Math.max(1,h-12)|0; x.fillStyle=th.body2; x.fillRect(xx,yy,3,2); x.fillStyle=th.bodyHi; x.fillRect(xx,yy,2,1); }
 x.fillStyle=th.body2; x.fillRect(X+1,Y+h-2,w-2,1); x.fillRect(X+w-2,Y+1,1,h-2);
 // верхушка (трава / глазурь / неон) с подтёками
 const tt=Math.min(5,h-1); x.fillStyle=th.top; x.fillRect(X+1,Y+1,w-2,tt-1); x.fillStyle=th.topHi; x.fillRect(X+1,Y+1,w-2,1);
 for(let xx=X+1;xx<X+w-1;xx++){ const d=(rnd()<.18)?(2+rnd()*4|0):(rnd()<.5?1:0); if(d){ x.fillStyle=th.top; x.fillRect(xx,Y+tt,1,d); x.fillStyle=th.topLo; x.fillRect(xx,Y+tt+d,1,1);} else { x.fillStyle=th.topLo; x.fillRect(xx,Y+tt,1,1);} }
 if(themeOfCur===1){ for(let i=0;i<w/6;i++){ x.fillStyle=['#fff','#7affe0','#ffe066','#9a7aff'][i%4]; x.fillRect(X+2+rnd()*(w-5)|0,Y+2+rnd()*2|0,2,1);} }
 if(themeOfCur===0){ for(let i=0;i<w/10;i++){ const xx=X+2+rnd()*(w-5)|0; x.fillStyle=th.topHi; x.fillRect(xx,Y-1,1,2); if(rnd()<.3){x.fillStyle=['#ff6a8a','#ffe066','#fff'][i%3];x.fillRect(xx,Y-2,1,1);} } }
 if(themeOfCur===2){ x.fillStyle='#ff4fd8'; x.fillRect(X+1,Y+h-3,w-2,1); }
}
let themeOfCur=0;
function buildLevelCanvas(L,ti){ themeOfCur=ti; const th=THEMES[ti]; const [c,x]=mk(LW,LH);
 // боковые колонны-рамки
 const sh=r=>r[4]==='h'&&r[5]==='shell'; x.fillStyle='rgba(0,0,0,.18)'; L.p.forEach(r=>{ if('gbswo'.includes(r[4])||sh(r)) x.fillRect(r[0]+3,r[1]+3,r[2],r[3]); });
 L.p.forEach((r,i)=>{ if('gbswo'.includes(r[4])||sh(r)) blockPaint(x,r,th,sh(r)?'g':r[4],1000+i*37); }); return c; }

// ---------- мир/физика ----------
function circRect(px,py,r,X,Y,w,h){ const cx=Math.max(X,Math.min(px,X+w)), cy=Math.max(Y,Math.min(py,Y+h)); let dx=px-cx, dy=py-cy; const d2=dx*dx+dy*dy;
 if(d2>=r*r) return null;
 if(d2===0){ const l=px-X, rr=X+w-px, t=py-Y, b=Y+h-py, m=Math.min(l,rr,t,b); if(m===t) return {nx:0,ny:-1,pen:t+r}; if(m===b) return {nx:0,ny:1,pen:b+r}; if(m===l) return {nx:-1,ny:0,pen:l+r}; return {nx:1,ny:0,pen:rr+r}; }
 const d=Math.sqrt(d2); return {nx:dx/d,ny:dy/d,pen:r-d}; }
const inRect=(x,y,r)=>x>=r[0]&&x<=r[0]+r[2]&&y>=r[1]&&y<=r[1]+r[3];
// Типы блоков: g земля, b батут, s шипы, i лёд (скользкий, тает от Лампы), c ящик (ломается), d дверь (id в [5]), v конвейер (направление в [5]), w липкая стена
const BOSS=[
 {id:'leech',name:'Гигантская Пиявка',r:16,ax:40,ay:0,T:6,col:'#8a3a6a',mech:'липнет и тормозит',say:['Чмок!','Ай, присоски!','Отлипни!']},
 {id:'vac',name:'Пылесос «Вихрь-3000»',r:18,ax:0,ay:4,T:2,col:'#c83a4a',mech:'засасывает рядом',say:['АПЧХИ!','Фильтр забит!','Ж-ж-ж…']},
 {id:'cat',name:'Кот Бегемотыч',r:17,ax:0,ay:3,T:3,col:'#ff9a3c',mech:'бьёт лапой вверх',say:['ШШШ!','Мяу?!','Фыр!']},
 {id:'snow',name:'Снеговик Хрустыч',r:17,ax:0,ay:0,T:1,col:'#e8f4ff',mech:'кидается снежками',say:['Мой нос!','Пуговица!','Таю…']},
 {id:'press',name:'Робо-Пресс',r:16,ax:0,ay:30,T:3,col:'#8a92a8',mech:'прижимает вниз',say:['БЗЗТ!','ОШИБКА 404','ИСКРЮ!']},
 {id:'golem',name:'Голем Булыжник',r:19,ax:0,ay:0,T:1,col:'#8a8478',mech:'отскок ×1.3',say:['Хрусть!','Трещинка…','КАМЕНЬ НЕ ПЛАЧЕТ']},
 {id:'bat',name:'Мышь Шуршалка',r:13,ax:50,ay:18,T:5,fig:1,col:'#6a4aa0',mech:'рикошет куда попало',say:['Пи-пи!','Голова кружится','Ой, звёздочки']},
 {id:'crab',name:'Диско-Краб',r:15,ax:50,ay:0,T:5,col:'#ff4a3a',mech:'отражает по горизонтали',say:['Щёлк!','Клешни дрожат!','Не по ритму!']},
 {id:'drag',name:'Туча-Дракон',r:18,ax:30,ay:10,T:7,col:'#c8d4ee',mech:'порывы ветра',say:['Пф-ф-ф!','Гроза отменяется','Хмурюсь!']},
 {id:'king',name:'Король Слизней',r:19,ax:0,ay:6,T:2,col:'#4ed05a',mech:'глотает и выплёвывает',say:['Невкусно!','Корона!','ТЬФУ!']}];
class World{
 constructor(li,ci,L){ this.li=li; this.L=L||LV[li]; this.ch=(ci&&typeof ci==='object')?ci:CHARS[ci]; this.ab=this.ch.ab||''; this.abs=new Set(this.ch.abs||(this.ch.ab?[this.ch.ab]:[])); this.mod=null; this.t=0; L=this.L;
  this.solids=L.p.map(r=>({x:r[0],y:r[1],w:r[2],h:r[3],type:r[4],arg:r[5],alive:true,hit:0}));
  this.movers=(L.m||[]).map(m=>({...m,bx:m.x,by:m.y,type:m.s?'s':'g',vx:0,vy:0,mover:true,alive:true}));
  this.bumpers=(L.bu||[]).map(b=>({x:b[0],y:b[1],r:b[2],hit:0}));
  this.portals=(L.po||[]); this.fans=(L.fa||[]); this.water=(L.wa||[]);
  this.buttons=(L.bt||[]).map(b=>({x:b[0],y:b[1],id:b[2],on:false}));
  this.candies=L.c.map(c=>({x:c[0],y:c[1],got:false})); this.gem=L.gm?{x:L.gm[0],y:L.gm[1],got:false}:null;
  this.shots=L.shots+(this.ch.extra||0); this.used=0; this.got=0; this.shield=this.has('shield')?1:0;
  this.s=this.mkBody(L.start[0],L.start[1]); this.clone=null;
  this.ev=[]; this.result=null; this.slow=false; this.tilt=0; this.wind=0; this.v4init(); this.updMovers(0); }
 has(a){ return this.abs.has(a); }
 keyOK(k){ const c=this.ch; return c.id===k||!!(c.fuse&&c.fuse.some(i=>CHARS[i].id===k)); }
 mkBody(x,y){ return {x,y,vx:0,vy:0,st:'idle',at:0,lx:x,ly:y,ground:null,pcd:0,fly:0,padN:0,padT:0,bumpN:0,gs:1,used:false,chute:false,ghost:0,hover:false,wall:false,hist:[],histT:0}; }
 updMovers(dt){ for(const m of this.movers){ const a=(this.t/m.t)*Math.PI*2+(m.ph||0)/m.t*Math.PI*2; const nx=m.bx+Math.sin(a)*m.ax, ny=m.by+Math.sin(a)*m.ay;
  m.vx=dt?(nx-m.x)/dt:0; m.vy=dt?(ny-m.y)/dt:0; m.dx=nx-m.x; m.dy=ny-m.y; m.x=nx; m.y=ny; } }
 allSolids(){ return this.solids.filter(o=>o.alive).concat(this.movers); }
 canLaunch(){ const s=this.s; return s.st==='idle'&&this.shots>0&&!this.result; }
 launch(dx,dy){ const s=this.s; if(!this.canLaunch()) return false; if(this.mod&&this.mod.inv){ dx=-dx; dy=-dy; } let l=Math.hypot(dx,dy); if(l<8) return false; const k=Math.min(l,MAXDRAG)/l;
  const v=560*K*this.ch.power/MAXDRAG; s.vx=-dx*k*v; s.vy=-dy*k*v; s.st='fly'; s.fly=0; s.lx=s.x; s.ly=s.y; s.used=false; s.chute=false; s.gs=1; s.ghost=0; s.hover=false; s.wall=false; s.padN=0; s.bumpN=0; s.hist=[]; s.histT=0; s.shout=false; s.gp=0; s.eat=0;
  this.shots--; this.used++; this.ev.push(['launch']); return true; }
 // активная способность (тап в полёте)
 ability(){ const s=this.s; if(s.st!=='fly'||s.used) return false; const a=this.ab;
  if(a==='djump'){ s.vy=-340*K*(s.gs); s.used=true; this.ev.push(['ab','djump',s.x,s.y]); return true; }
  if(a==='split'){ const c=this.mkBody(s.x,s.y); Object.assign(c,{st:'fly',vx:-s.vx*0.6+(s.vx>=0?-40:40)*K,vy:s.vy-120*K,fly:0}); this.clone=c; s.vy-=60*K; s.used=true; this.ev.push(['ab','split',s.x,s.y]); return true; }
  if(a==='chute'){ s.chute=true; s.vx*=.6; s.used=true; this.ev.push(['ab','chute',s.x,s.y]); return true; }
  if(a==='dive'){ s.vx=0; s.vy=700*K; s.used=true; this.ev.push(['ab','dive',s.x,s.y]); return true; }
  if(a==='ghost'){ s.ghost=.45; s.used=true; this.ev.push(['ab','ghost',s.x,s.y]); return true; }
  if(a==='gflip'){ s.gs=-1; s.vy=Math.min(s.vy,0)-60*K; s.used=true; this.ev.push(['ab','gflip',s.x,s.y]); return true; }
  return false; }
 support(b){ if(b.wall||b.hover) return true; if(b.y>=LH-R-.5) return true; if(this.inWater(b)) return true;
  for(const o of this.allSolids()){ if(o.type==='s') continue; if(o.type==='o'&&b.y>o.y-R+3) continue; if(circRect(b.x,b.y+2.5,R,o.x,o.y,o.w,o.h)){ if(o.mover||o.type==='v') b.ground=o; return true;} } return false; }
 inWater(b){ for(const w of this.water) if(inRect(b.x,b.y,w)) return w; return null; }
 settle(b,why){ b.vx=0; b.vy=0; b.st='idle'; b.gs=1; b.chute=false; b.ghost=0; if(why==='hover') b.hover=true; this.ev.push(['rest',why||'']); }
 step(dt){ this.t+=dt; this.updMovers(dt); this.v4pre(dt);
  for(const b of this.bumpers) b.hit=Math.max(0,b.hit-dt);
  for(const o of this.solids) o.hit=Math.max(0,o.hit-dt);
  const n0=this.ev.length, st0=this.s.st; this.body(this.s,dt,true); this.v4post(this.s,dt); this.comboTick(n0,st0);
  if(this.clone){ const c=this.clone; this.body(c,dt,false); if(c.st!=='fly'||c.fly>6||this.s.st==='idle'){ this.ev.push(['poofclone',c.x,c.y]); this.clone=null; } }
  // магнит
  if(this.has('magnet')&&this.s.st!=='poof') for(const c of this.candies) if(!c.got){ const dx=this.s.x-c.x, dy=this.s.y-c.y, d=Math.hypot(dx,dy); if(d<64&&d>1){ c.x+=dx/d*90*K*dt; c.y+=dy/d*90*K*dt; } }
 }
 // B3: комбо-рикошеты (только главный слизень, только в одном полёте)
 comboTick(n0,st0){ const s=this.s; if(this.comboPend===undefined){ this.combo=0; this.comboPend=0; this.comboBank=0; this.comboMax=0; this.lastBT=-9; }
  if(st0==='fly'||s.st==='fly') for(let i=n0;i<this.ev.length;i++){ const e=this.ev[i]; const k=e[0];
   const obj=k==='bounce'?(e[6]||'?'):k==='boing'?(e[3]||'water'):e[3]; if((k==='bounce'||k==='boing'||k==='bumper')&&(this.t-this.lastBT>.12)&&obj!==this.lastBO){ this.lastBT=this.t; this.lastBO=obj; this.combo++; this.comboPend+=25*this.combo*(this.comboMul||1); if(this.combo>this.comboMax) this.comboMax=this.combo; if(this.combo>=2) this.ev.push(['combo',this.combo,s.x,s.y]); } }
  if(st0!=='fly'&&s.st==='fly'){ this.lastBO=null; }
  if(st0==='fly'&&s.st!=='fly'){ if(s.st==='poof'){ if(this.combo>=2) this.ev.push(['combolost',this.combo,s.x,s.y]); } else this.comboBank+=this.comboPend; this.comboPend=0; this.combo=0; } }
 scoreNow(){ return (this.result==='win'?1000:0)+(this.has('lucky')?350:250)*this.got+(this.result==='win'?300*Math.max(0,this.shots):0)+(this.comboBank||0)+(this.result==='win'?(this.comboPend||0):0); }
 body(s,dt,main){ const ch=this.ch;
  if(s.st==='idle'){ if(s.ground&&(s.ground.mover)&&!s.wall&&!s.hover){ s.x+=s.ground.dx; s.y+=s.ground.dy; }
   if(s.ground&&s.ground.type==='v'&&!s.wall&&!s.hover) s.x+=s.ground.arg*38*K*dt;
   if(s.x<R) s.x=R; if(s.x>LW-R) s.x=LW-R;
   if(!this.support(s)) { s.st='fly'; s.vx=0; s.vy=0; s.fly=0; s.used=true; s.hist=[]; }
   const g1=this.L.goal; if(main&&s.st==='idle'&&Math.abs(s.x-g1[0])<14&&s.y>g1[1]-36&&s.y<g1[1]+2){ s.st='win'; s.at=0; this.result='win'; this.ev.push(['win']); return; } }
  if((s.st==='splat'||s.st==='recover')&&s.ground&&s.ground.mover){ s.x+=s.ground.dx; s.y+=s.ground.dy; }
  if(s.st==='poof'){ s.at-=dt; if(s.at<=0){ s.x=s.lx; s.y=s.ly; s.vx=s.vy=0; s.st='idle'; s.ground=null; s.wall=false; s.hover=false; this.ev.push(['respawn']); } return; }
  if(s.st!=='fly') return;
  if(s.eat>0){ this.eatTick(s,dt); return; }
  s.fly+=dt; s.pcd-=dt; s.padT+=dt; if(s.padT>2.6) s.padN=0;
  // гравитация, вода, ветер
  let g=G0*ch.grav*s.gs*(this.mod&&this.mod.g||1); if(this.has('glide')) g*=.5; if(this.mod&&this.mod.wind) s.vx+=this.mod.wind*K*dt; if(this.wind) s.vx+=this.wind*K*dt; if(this.tilt) s.vx+=this.tilt*K*dt; if(s.chute){ g*=.4; }
  const wat=this.inWater(s);
  if(wat&&!this.has('sponge')){ g=-G0*.5; s.vx*=Math.pow(.25,dt); s.vy*=Math.pow(.15,dt); }
  for(const f of this.fans) if(inRect(s.x,s.y,f)){ s.vy-=(f[4]||900)*K*dt*(this.has('glide')||s.chute?1.4:1); }
  s.vy+=g*dt; if(s.chute&&s.vy>70*K) s.vy=70*K; if(s.vy>900*K) s.vy=900*K; if(s.vy<-900*K) s.vy=-900*K;
  s.x+=s.vx*dt; s.y+=s.vy*dt;
  if(!isFinite(s.x)||!isFinite(s.y)){ s.x=s.lx; s.y=s.ly; this.settle(s,'nan'); return; }
  let grounded=null;
  if(s.ghost>0){ s.ghost-=dt; if(s.ghost<=0){ for(const o of this.allSolids()) if(circRect(s.x,s.y,R-2,o.x,o.y,o.w,o.h)){ s.ghost=.05; break; } if(s.fly>8) s.ghost=0; } }
  // кнопки
  for(const bt of this.buttons) if(!bt.on&&Math.hypot(s.x-bt.x,s.y-bt.y)<16){ bt.on=true; for(const o of this.solids) if(o.type==='d'&&o.arg===bt.id) o.alive=false; this.ev.push(['button',bt.x,bt.y]); }
  // губка: вода как батут
  if(wat&&this.has('sponge')&&s.vy>0){ s.vy=-Math.max(s.vy*.95,330*K); s.y=wat[1]-1; this.ev.push(['boing',s.x,s.y,null]); }
  for(const o of this.allSolids()){ const c=circRect(s.x,s.y,R,o.x,o.y,o.w,o.h); if(!c) continue; if(o.type==='o'&&!(c.ny<-.6&&s.vy*s.gs>=0&&s.y<o.y)) continue; if(o.type==='h'&&o.arg!=='shell'&&this.keyOK(o.arg)){ o.alive=false; this.ev.push(['secret',o.x+o.w/2,o.y+o.h/2,o]); continue; }
   if(s.ghost>0&&o.type!=='h'&&!(c.ny<-.6&&c.pen<8&&o.type!=='s')){ if(main&&!s.gp){ s.gp=1; this.ev.push(['ghostpass',s.x,s.y]); } continue; }
   if(o.type==='s'&&!ch.spiky){
    if(this.shield>0){ this.shield=0; this.ev.push(['shield',s.x,s.y]); }
    else if(!main){ s.st='dead'; return; }
    else { s.st='poof'; s.at=.7; if(this.has('refund')){ this.shots++; this.used--; this.ev.push(['refund',s.x,s.y]); } this.ev.push(['ouch',s.x,s.y]); return; } }
   if(o.type==='i'&&this.has('melt')){ o.alive=false; this.ev.push(['melt',o.x+o.w/2,o.y+o.h/2,o]); continue; }
   const rvx=s.vx-(o.vx||0), rvy=s.vy-(o.vy||0); const vn=rvx*c.nx+rvy*c.ny;
   if(o.type==='c'&&vn<0&&(this.has('crush')||-vn>300*K)){ o.alive=false; s.vx*=.8; s.vy*=.8; this.ev.push(['crate',o.x+o.w/2,o.y+o.h/2,o]); continue; }
   s.x+=c.nx*c.pen; s.y+=c.ny*c.pen;
   if(vn<0){ const imp=-vn;
    if(o.type==='b'){ s.padN++; s.padT=0; const damp=Math.pow(.72,Math.max(0,s.padN-1)); const out=Math.max(imp*.92,380*K*damp)*(this.mod&&this.mod.pad||1);
     s.vx-=vn*c.nx; s.vy-=vn*c.ny; s.vx+=c.nx*out; s.vy+=c.ny*out; o.hit=.3; this.ev.push(['boing',s.x,s.y,o]);
     if(s.padN>=4&&c.ny<-.6&&Math.abs(s.vx)<80*K){ s.y=o.y-R; this.settle(s,'pad'); s.ground=o; return; }
     continue; }
    if(o.type==='s'){ const out=Math.max(imp*.8,300*K); s.vx-=vn*c.nx; s.vy-=vn*c.ny; s.vx+=c.nx*out; s.vy+=c.ny*out; this.ev.push(['bounce',s.x,s.y,imp,c.nx,c.ny,o]); continue; }
    if(this.has('wall')&&Math.abs(c.nx)>.7&&main){ this.settle(s,'wall'); s.wall=true; s.ground=o; this.ev.push(['stick',s.x,s.y]); return; }
    if(o.type==='w'&&Math.abs(c.nx)>.7&&main){ this.settle(s,'wall'); s.wall=true; s.ground=o; this.ev.push(['stick',s.x,s.y]); return; }
    if(s.gs<0&&c.ny>.6){ s.gs=1; }
    if(c.ny<-.6&&imp>SPLAT_V*ch.splat&&main&&s.gs>0){ s.vx=0; s.vy=0; s.st='splat'; s.at=0; s.ground=o; this.ev.push(['splat',s.x,s.y,imp]); return; }
    const rest=imp<90*K?0:(this.mod&&this.mod.sticky?.04:ch.rest); s.vx-=(1+rest)*vn*c.nx; s.vy-=(1+rest)*vn*c.ny;
    if(imp>70*K) this.ev.push(['bounce',s.x,s.y,imp,c.nx,c.ny,o]); }
   if(c.ny<-.6) grounded=o; }
  // границы
  if(s.x<R){s.x=R; if(s.vx<0){ if(this.has('wall')&&main){ this.settle(s,'wall'); s.wall=true; this.ev.push(['stick',s.x,s.y]); return; } if(-s.vx>70)this.ev.push(['bounce',s.x,s.y,-s.vx,1,0,'L']); s.vx=-s.vx*ch.rest;}}
  if(s.x>LW-R){s.x=LW-R; if(s.vx>0){ if(this.has('wall')&&main){ this.settle(s,'wall'); s.wall=true; this.ev.push(['stick',s.x,s.y]); return; } if(s.vx>70)this.ev.push(['bounce',s.x,s.y,s.vx,-1,0,'R']); s.vx=-s.vx*ch.rest;}}
  if(s.y<R){s.y=R; if(s.vy<0){ s.vy=-s.vy*ch.rest; if(s.gs<0) s.gs=1; this.ev.push(['bounce',s.x,s.y,60,0,1,'T']);}}
  if(s.y>LH-R){s.y=LH-R; if(s.vy>0){ s.vy=-s.vy*ch.rest;} grounded=grounded||{x:0,y:LH,w:LW,h:1};}
  for(const b of this.bumpers){ const dx=s.x-b.x, dy=s.y-b.y, d=Math.hypot(dx,dy); if(d<b.r+R&&d>0){ const nx=dx/d, ny=dy/d; s.x=b.x+nx*(b.r+R); s.y=b.y+ny*(b.r+R); const vn=s.vx*nx+s.vy*ny; if(vn<0){s.vx-=2*vn*nx; s.vy-=2*vn*ny;}
   s.bumpN++; if(s.bumpN<=6){ s.vx+=nx*140*K; s.vy+=ny*140*K; const sp=Math.hypot(s.vx,s.vy); if(sp<360*K){s.vx*=360*K/sp;s.vy*=360*K/sp;} } else { s.vx*=.7; s.vy*=.7; }
   b.hit=.25; this.ev.push(['bumper',b.x,b.y,b]); } }
  if(s.pcd<=0) for(const p of this.portals){ for(let k=0;k<2;k++){ const ax=p[k*2],ay=p[k*2+1]; if(Math.hypot(s.x-ax,s.y-ay)<13){ const bx=p[2-k*2],by=p[3-k*2]; this.ev.push(['portal',ax,ay,bx,by]); s.x=bx; s.y=by; s.pcd=.6; break; } } }
  for(const c of this.candies) if(!c.got&&Math.hypot(s.x-c.x,s.y-c.y)<17){ c.got=true; this.got++; if(this.has('juicy')){ this.shots++; this.ev.push(['juicy',c.x,c.y]); } this.ev.push(['candy',c.x,c.y,this.got]); }
  if(this.gem&&!this.gem.got&&Math.hypot(s.x-this.gem.x,s.y-this.gem.y)<17){ this.gem.got=true; this.ev.push(['gem',this.gem.x,this.gem.y]); }
  const g0=this.L.goal; if(Math.abs(s.x-g0[0])<14&&s.y>g0[1]-36&&s.y<g0[1]+2){ if(!main){ this.s.x=s.x; this.s.y=s.y; this.s.vx=this.s.vy=0; this.clone=null; } const m=this.s; m.st='win'; m.at=0; m.vx=m.vy=0; this.result='win'; this.ev.push(['win']); return; }
  // отдых
  if(wat&&!this.has('sponge')&&Math.hypot(s.vx,s.vy)<35*K&&s.fly>.4){ if(main) this.settle(s,'water'); else s.st='dead'; return; }
  if(grounded){ s.ground=grounded; const fr=(grounded.type==='i'||this.wxNow==='ice')?.08:(this.mod&&this.mod.sticky?3:ch.fric*(this.wxNow==='rain'?.3:1)); const gvx=(grounded.vx||0)+(grounded.type==='v'?grounded.arg*38*K:0); s.vx=gvx+(s.vx-gvx)*(grounded.mover?Math.pow(1e-4,dt):Math.pow(.25*(1/Math.max(.2,fr)),dt*fr)); const rvx=s.vx-gvx;
   if(Math.abs(rvx)<26*K&&Math.abs(s.vy-(grounded.vy||0))<40*K){ if(main) this.settle(s,''); else s.st='dead'; return; } }
  // анти-залипание: нет прогресса
  s.histT+=dt; if(s.histT>.25){ s.histT=0; s.hist.push([s.x,s.y]); if(s.hist.length>12) s.hist.shift();
   if(s.hist.length>=12&&s.fly>3){ let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9; for(const [hx,hy] of s.hist){x0=Math.min(x0,hx);x1=Math.max(x1,hx);y0=Math.min(y0,hy);y1=Math.max(y1,hy);} if(x1-x0<32&&y1-y0<80){ if(main) this.settle(s,'hover'); else s.st='dead'; return; } } }
  if(s.fly>9){ if(main) this.settle(s,'hover'); else s.st='dead'; }
 }
 // ---------- v4: боссы, погода, наклон, крик ----------
 v4init(){ const L=this.L; const bd=L.boss&&BOSS[L.boss.k];
  this.boss=bd?{k:L.boss.k,x0:L.boss.x,y0:L.boss.y,x:L.boss.x,y:L.boss.y,r:bd.r,hp:3,cd:0,dead:false,react:0,balls:[],ballT:1.2,paw:0,ax:L.boss.ax??bd.ax,hang:!!L.boss.hang}:null;
  this.wx=L.wx?{i:0,t:0,warned:false}:null; this.wxNow=L.wx?L.wx[0][0]:''; this.gust=0; }
 setChar(ch){ this.ch=ch; this.ab=ch.ab||''; this.abs=new Set(ch.abs||(ch.ab?[ch.ab]:[])); }
 shout(){ const s=this.s; if(s.st!=='fly'||s.shout||s.eat>0) return false; s.shout=true; s.vx*=1.22; s.vy=s.vy*1.22-50*K; this.ev.push(['shout',s.x,s.y]); return true; }
 v4pre(dt){ // погода по расписанию
  if(this.wx){ const S=this.L.wx, w=this.wx; w.t+=dt; const dur=S[w.i][1]; if(!w.warned&&S.length>1&&dur-w.t<=2){ w.warned=true; this.ev.push(['wxwarn',S[(w.i+1)%S.length][0]]); }
   if(w.t>=dur&&S.length>1){ w.t-=dur; w.i=(w.i+1)%S.length; w.warned=false; this.wxNow=S[w.i][0]; this.ev.push(['wx',this.wxNow]); } }
  let wind=this.wxNow==='wind+'?170:this.wxNow==='wind-'?-170:0;
  const b=this.boss; if(b&&!b.dead){ const D=BOSS[b.k]; const a=this.t/D.T*Math.PI*2; b.x=b.x0+Math.sin(a)*b.ax; b.y=b.y0+(D.fig?Math.sin(2*a):Math.sin(a))*D.ay; b.cd=Math.max(0,b.cd-dt); b.react=Math.max(0,b.react-dt);
   if(b.k===8){ this.gust=Math.sin(this.t*.9)*150; wind+=this.gust; }
   if(b.k===3){ b.ballT-=dt; if(b.ballT<=0){ b.ballT=2.4; const dir=this.s.x>=b.x?1:-1; b.balls.push({x:b.x+dir*10,y:b.y-b.r-4,vx:dir*150*K,vy:-200*K,t:0}); }
    for(const o of b.balls){ o.t+=dt; o.vy+=G0*.5*dt; o.x+=o.vx*dt; o.y+=o.vy*dt; } b.balls=b.balls.filter(o=>o.t<3&&o.y<LH&&o.x>-10&&o.x<LW+10&&!o.dead); } }
  this.wind=wind; }
 v4post(s,dt){ const b=this.boss; if(!b||b.dead||s.st!=='fly'||s.eat>0) return; const D=BOSS[b.k];
  if(b.k===1){ const dx=b.x-s.x, dy=b.y-s.y, d=Math.hypot(dx,dy); if(d<120&&d>1){ const f=300*K*(1-d/120); s.vx+=dx/d*f*dt; s.vy+=dy/d*f*dt; } }
  if(b.k===3) for(const o of b.balls){ if(!o.dead&&Math.hypot(o.x-s.x,o.y-s.y)<R+5){ o.dead=true; s.vx+=Math.sign(o.vx)*170*K; s.vy-=60*K; this.ev.push(['snowhit',o.x,o.y]); } }
  const dx=s.x-b.x, dy=s.y-b.y, d=Math.hypot(dx,dy); if(d>=b.r+R||d<=0) return;
  const nx=dx/d, ny=dy/d; s.x=b.x+nx*(b.r+R); s.y=b.y+ny*(b.r+R); const vn=s.vx*nx+s.vy*ny, sp=Math.hypot(s.vx,s.vy);
  if(b.k===9){ if(b.cd>0){ if(vn<0){ s.vx-=1.6*vn*nx; s.vy-=1.6*vn*ny; } return; } s.eat=.5; s.x=b.x; s.y=b.y; s.vx=s.vy=0; this.bossHit(b,sp); return; }
  if(vn<0){ const k=b.k===5?2.3:1.6; s.vx-=k*vn*nx; s.vy-=k*vn*ny; }
  if(b.k===0){ s.vx*=.45; s.vy*=.45; }
  else if(b.k===2){ s.vy=-430*K; s.vx+=nx*80*K; b.paw=.35; }
  else if(b.k===4){ s.vy=Math.abs(s.vy)*.3+300*K; }
  else if(b.k===5){ const v=Math.hypot(s.vx,s.vy); if(v>700*K){ s.vx*=700*K/v; s.vy*=700*K/v; } }
  else if(b.k===6){ const a=Math.atan2(ny,nx)+Math.sin(this.t*91.7)*1.2, v=Math.max(sp,300*K); s.vx=Math.cos(a)*v; s.vy=Math.sin(a)*v; }
  else if(b.k===7){ s.vx=(nx>=0?1:-1)*Math.max(Math.abs(s.vx),200*K); }
  if(sp>110*K||b.k===2) this.bossHit(b,sp); else this.ev.push(['bpoke',b.x,b.y]); }
 bossHit(b,sp){ if(b.cd>0) return; b.cd=.6; b.react=.6; b.hp--; this.ev.push(['bhit',b.x,b.y,b.hp,b.k]); if(b.hp<=0){ b.dead=true; this.ev.push(['bdown',b.x,b.y,b.k]); } }
 eatTick(s,dt){ const b=this.boss; s.eat-=dt; if(b){ s.x=b.x; s.y=b.y; } if(s.eat<=0){ s.eat=0; s.vy=-520*K; s.vx=(s.x<LW/2?1:-1)*120*K; s.y-=(b?b.r:0)+R+2; s.hist=[]; s.histT=0; if(b) b.cd=1.2; this.ev.push(['spit',s.x,s.y]); } }
 // полная симуляция для диско-прицела и солвера
 snapshot(){ const w=new World(this.li,this.ch,this.L); w.mod=this.mod; w.t=this.t; w.updMovers(0);
  this.solids.forEach((o,i)=>{w.solids[i].alive=o.alive}); this.buttons.forEach((b,i)=>{w.buttons[i].on=b.on}); this.candies.forEach((c,i)=>Object.assign(w.candies[i],c)); if(this.gem) w.gem={...this.gem};
  Object.assign(w.s,JSON.parse(JSON.stringify({...this.s,ground:null}))); w.s.ground=null; w.shots=this.shots; w.got=this.got; w.shield=this.shield; w.tilt=this.tilt; if(this.boss) w.boss=JSON.parse(JSON.stringify(this.boss)); if(this.wx) w.wx={...this.wx}; w.wxNow=this.wxNow; return w; }
}

// ---------- игра / экраны ----------
let scene='menu', world=null, curLevel=0, lvlCanvas=null, T0=performance.now()/1000, now=0;
let parts=[], decals=[], floats=[], shake=0, flash=0, pops=[];
let drag=null, lastPullF=-1, overlay=null, overlayT=0, squash=0, sqDir=[0,1], sAnim={a:'idle',t:0};
let buttons=[], pressed=null, selPick=save.char||0, menuSlugs=[];
function btn(x,y,w,h,label,cb,col='#ffd23c',size=12){ const pr=pressed&&pressed.label===label&&pressed.x===x; const yy=pr?y+2:y;
 ctx.fillStyle='#1a0c22'; ctx.fillRect(x+1,y+2,w-2,h); ctx.fillRect(x,y+3,w,h-2);
 ctx.fillStyle='#1a0c22'; ctx.fillRect(x+1,yy-1,w-2,h+1); ctx.fillRect(x-1+1,yy,w,h-1);
 ctx.fillRect(x,yy,w,h);
 const c=hex(col); const dk=`rgb(${c[0]*.7|0},${c[1]*.6|0},${c[2]*.6|0})`;
 ctx.fillStyle=dk; ctx.fillRect(x+1,yy+1,w-2,h-2); ctx.fillStyle=col; ctx.fillRect(x+1,yy+1,w-2,h-5);
 ctx.fillStyle='rgba(255,255,255,.55)'; ctx.fillRect(x+2,yy+2,w-4,1); ctx.fillRect(x+2,yy+2,1,3);
 if(label) T(label,x+w/2,yy+(h-4)/2-size*.55,size,'#fff','c','#1a0c22');
 buttons.push({x,y,w,h,label,cb}); }
const TAP=()=>Math.max(30,Math.ceil(44*DPR/SC)); // 44 CSS px в логических пикселях
function iconBtn(x,y,draw,cb,label,sz=TAP()){ btn(x,y,sz,sz-2,'',cb,'#6a4fd8'); buttons[buttons.length-1].label=label; const pr=pressed&&pressed.label===label; const ik=Math.max(1,Math.floor(sz/22)); ctx.save(); ctx.translate(x+(sz>>1),y+((sz-4)>>1)+(pr?2:0)); ctx.scale(ik,ik); draw(); ctx.restore(); }
const icMute=()=>{ ctx.fillStyle='#fff'; ctx.fillRect(-6,-2,3,5); ctx.fillRect(-3,-4,2,9); ctx.fillRect(-1,-5,1,11); if(save.mute){ ctx.fillStyle='#ff4a6a'; for(let i=0;i<6;i++){ctx.fillRect(2+i,-3+i,1,1);ctx.fillRect(7-i,-3+i,1,1);} } else { ctx.fillRect(2,-2,1,5); ctx.fillRect(4,-4,1,9); ctx.fillRect(3,-3,1,1);ctx.fillRect(3,3,1,1);} };
const icPause=()=>{ ctx.fillStyle='#fff'; ctx.fillRect(-4,-5,3,10); ctx.fillRect(2,-5,3,10); };
const icBack=()=>{ ctx.fillStyle='#fff'; for(let i=0;i<5;i++) ctx.fillRect(-3+i,-i,2,1+i*2); ctx.fillRect(1,-1,5,3); };
const icRetry=()=>{ ctx.fillStyle='#fff'; ctx.fillRect(-4,-4,7,2); ctx.fillRect(-5,-3,2,7); ctx.fillRect(-4,3,8,2); ctx.fillRect(3,-1,2,5); ctx.fillRect(2,-6,1,6); ctx.fillRect(3,-5,1,4); };

function panel(x,y,w,h,col='#2b1a4a'){ ctx.fillStyle='rgba(10,4,20,.35)'; ctx.fillRect(x+3,y+4,w,h); ctx.fillStyle='#120818'; ctx.fillRect(x+1,y,w-2,h); ctx.fillRect(x,y+1,w,h-2); ctx.fillStyle=col; ctx.fillRect(x+1,y+1,w-2,h-2); ctx.fillStyle='rgba(255,255,255,.12)'; ctx.fillRect(x+2,y+2,w-4,1); ctx.fillStyle='rgba(0,0,0,.25)'; ctx.fillRect(x+2,y+h-3,w-4,1); }
function starIcon(x,y,on,s=1){ const P=['..#..','..#..','#####','.###.','##.##']; const P2=['....#....','...###...','...###...','#########','.#######.','..#####..','..##.##..','.##...##.','##.....##'];
 const pat=s>1?P2:P; const cOn=['#fff3a0','#ffd23c','#ff9a1c'];
 for(let j=0;j<pat.length;j++)for(let i=0;i<pat[j].length;i++) if(pat[j][i]==='#'){ ctx.fillStyle=on?(j<2?cOn[0]:j<pat.length-2?cOn[1]:cOn[2]):'#3a2a52'; ctx.fillRect(x+i-(pat[0].length>>1),y+j,1,1);} }
function candy(x,y,t,i){ const b=Math.round(Math.sin(t*3+i)*2); const cols=['#ff4a8a','#ffd23c','#4ef0b0']; const c=cols[i%3];
 x=Math.round(x); y=Math.round(y)+b;
 ctx.globalAlpha=.25+.15*Math.sin(t*5+i); ctx.fillStyle=c; ctx.fillRect(x-7,y-1,15,3); ctx.fillRect(x-1,y-7,3,15); ctx.globalAlpha=1;
 ctx.fillStyle='#1a0c22'; ctx.fillRect(x-5,y-4,11,9); ctx.fillRect(x-4,y-5,9,11); ctx.fillRect(x-9,y-3,4,7); ctx.fillRect(x+6,y-3,4,7);
 ctx.fillStyle=c; ctx.fillRect(x-4,y-4,9,9); ctx.fillRect(x-8,y-2,3,5); ctx.fillRect(x+6,y-2,3,5);
 ctx.fillStyle='#fff'; ctx.fillRect(x-3,y-3,2,1); ctx.fillRect(x-3,y-2,1,1); ctx.fillStyle='rgba(0,0,0,.25)'; ctx.fillRect(x-4,y+3,9,1);
 ctx.fillStyle='#fff'; for(let k=-3;k<4;k+=3) ctx.fillRect(x+k,y+k*0-((k+3)%2),1,4); }
function jar(x,y,t,win){ x=Math.round(x); y=Math.round(y);
 const gl=.35+.25*Math.sin(t*4); ctx.globalAlpha=gl*.5; ctx.fillStyle='#fff3a0'; ctx.fillRect(x-20,y-44,41,46); ctx.globalAlpha=gl; ctx.fillRect(x-16,y-40,33,40); ctx.globalAlpha=1;
 ctx.fillStyle='#14202a'; ctx.fillRect(x-15,y-34,31,34); ctx.fillRect(x-13,y-38,27,5);
 ctx.fillStyle='#9fe8ff'; ctx.globalAlpha=.55; ctx.fillRect(x-14,y-33,29,32); ctx.globalAlpha=1;
 ctx.fillStyle='#4ec8a0'; ctx.fillRect(x-14,y-12,29,11); ctx.fillStyle='#8af0c0'; ctx.fillRect(x-14,y-12,29,2);
 ctx.fillStyle='#d8f8ff'; ctx.fillRect(x-12,y-30,2,16); ctx.fillRect(x-12,y-32,6,1); ctx.fillStyle='#fff'; ctx.fillRect(x+10,y-28,1,4);
 ctx.fillStyle='#c08a3c'; ctx.fillRect(x-12,y-37,25,3); ctx.fillStyle='#e8b860'; ctx.fillRect(x-12,y-37,25,1);
 ctx.fillStyle='#ffe066'; ctx.fillRect(x-8,y-25,17,9); ctx.fillStyle='#1a0c22'; ctx.fillRect(x-8,y-25,17,1); ctx.fillRect(x-8,y-17,17,1);
 T('ДОМ',x+1,y-26,7,'#7a2a1a','c','#ffe066',false);
 const a=(Math.sin(t*6)>0); ctx.fillStyle='#fff'; if(a){ctx.fillRect(x+15,y-44,1,3);ctx.fillRect(x+14,y-43,3,1);} else {ctx.fillRect(x-18,y-30,1,3);ctx.fillRect(x-19,y-29,3,1);}
 // стрелка
 if(!win){ const b=Math.round(Math.sin(t*5)*2); ctx.fillStyle='#1a0c22'; ctx.fillRect(x-4,y-56+b,9,5); ctx.fillRect(x-2,y-51+b,5,3); ctx.fillStyle='#ffd23c'; ctx.fillRect(x-3,y-55+b,7,3); ctx.fillRect(x-1,y-52+b,3,2); } }
function bumper(b,t){ const x=Math.round(b.x),y=Math.round(b.y), r=b.r+(b.hit>0?2:0);
 for(let yy=-r-1;yy<=r+1;yy++)for(let xx=-r-1;xx<=r+1;xx++){ const d=Math.sqrt(xx*xx+yy*yy); if(d>r+1)continue; let c;
  if(d>r) c='#1a0c22'; else if(d>r-3) c=b.hit>0?'#fff':((Math.atan2(yy,xx)*4/Math.PI+t*2|0)%2?'#ff4a6a':'#fff3e0'); else if(d>r-5) c='#1a0c22'; else c=(xx+yy<-2)?'#7affe0':'#3ab0a0';
  ctx.fillStyle=c; ctx.fillRect(x+xx,y+yy,1,1);} ctx.fillStyle='#fff'; ctx.fillRect(x-3,y-3,2,2); }
function portal(x,y,t,k){ x=Math.round(x);y=Math.round(y); const cols=k?['#ffb03c','#ff6a1c','#ffe066']:['#7a5aff','#4ef0ff','#d0b0ff'];
 for(let i=0;i<14;i++){ const a=t*3*(k?-1:1)+i/14*Math.PI*2, rr=11+Math.sin(t*5+i)*1.5; ctx.fillStyle=cols[i%3]; ctx.fillRect(x+Math.cos(a)*rr|0,y+Math.sin(a)*rr*1.25|0,2,2); }
 ctx.fillStyle='#120818'; for(let yy=-10;yy<=10;yy++){ const w=Math.sqrt(1-(yy/10.5)**2)*8|0; ctx.fillRect(x-w,y+yy,w*2+1,1);} 
 ctx.fillStyle=cols[0]; for(let i=0;i<5;i++){ const a=-t*4+i*1.3, rr=(t*8+i*3)%8; ctx.fillRect(x+Math.cos(a)*rr|0,y+Math.sin(a)*rr|0,1,1);} }
function mover(m){ const x=Math.round(m.x), y=Math.round(m.y);
 if(m.type==='s'){ const cx=x+m.w/2, cy=y+m.h/2, r=m.w/2, a=world.t*9; ctx.fillStyle='#1a0c22'; ctx.beginPath(); ctx.arc(cx,cy,r,0,7); ctx.fill();
  for(let k=0;k<8;k++){ const an=a+k*Math.PI/4; ctx.fillStyle=k%2?'#c8d0e0':'#ffffff'; ctx.fillRect(Math.round(cx+Math.cos(an)*(r-2))-2,Math.round(cy+Math.sin(an)*(r-2))-2,4,4); }
  ctx.fillStyle='#9aa6c0'; ctx.beginPath(); ctx.arc(cx,cy,r-3,0,7); ctx.fill(); ctx.fillStyle='#ff4a6a'; ctx.fillRect(Math.round(cx)-2,Math.round(cy)-2,4,4); return; } ctx.fillStyle='#1a0c22'; ctx.fillRect(x,y,m.w,m.h); ctx.fillStyle='#ffb03c'; ctx.fillRect(x+1,y+1,m.w-2,m.h-2); ctx.fillStyle='#ffe066'; ctx.fillRect(x+1,y+1,m.w-2,1);
 ctx.fillStyle='#c0601c'; ctx.fillRect(x+1,y+m.h-2,m.w-2,1); for(let i=x+3;i<x+m.w-3;i+=6){ ctx.fillStyle='#1a0c22'; ctx.fillRect(i,y+3,3,m.h-5>0?Math.min(3,m.h-5):1); }
 ctx.fillStyle='#fff'; ctx.fillRect(x+2,y+2,1,1); ctx.fillRect(x+m.w-3,y+2,1,1); }


function drawCrate(o){ const x=o.x|0,y=o.y|0,w=o.w,h=o.h; ctx.fillStyle='#2a1408'; ctx.fillRect(x,y,w,h); ctx.fillStyle='#b8783c'; ctx.fillRect(x+1,y+1,w-2,h-2); ctx.fillStyle='#d89a58'; ctx.fillRect(x+1,y+1,w-2,1); ctx.fillStyle='#8a5428'; ctx.fillRect(x+2,y+2,w-4,h-4); ctx.fillStyle='#c88848';
 for(let i=0;i<Math.min(w,h)-4;i++){ ctx.fillRect(x+2+i*(w-4)/(Math.min(w,h)-4)|0,y+2+i*(h-4)/(Math.min(w,h)-4)|0,2,2); }
 ctx.fillStyle='#2a1408'; ctx.fillRect(x+2,y+2,w-4,1); ctx.fillRect(x+2,y+h-3,w-4,1); ctx.fillStyle='#e8d0a0'; ctx.fillRect(x+2,y+2,1,1); ctx.fillRect(x+w-3,y+2,1,1); ctx.fillRect(x+2,y+h-3,1,1); ctx.fillRect(x+w-3,y+h-3,1,1); }
function drawIce(o){ const x=o.x|0,y=o.y|0,w=o.w,h=o.h; ctx.fillStyle='#1a3a6a'; ctx.fillRect(x,y,w,h); ctx.fillStyle='#8ad0ff'; ctx.fillRect(x+1,y+1,w-2,h-2); ctx.fillStyle='#c8ecff'; ctx.fillRect(x+1,y+1,w-2,2); ctx.fillStyle='#5aa8e8'; ctx.fillRect(x+1,y+h-2,w-2,1);
 ctx.fillStyle='#ffffff'; for(let i=0;i<w-6;i+=9){ ctx.fillRect(x+3+i,y+4,1,3); ctx.fillRect(x+4+i,y+3,1,1);} ctx.fillStyle='rgba(255,255,255,.35)'; for(let k=0;k<Math.min(w,h)-4;k++) ctx.fillRect(x+w-4-k,y+2+k,1,1); }
function drawDoor(o){ const x=o.x|0,y=o.y|0,w=o.w,h=o.h; const col=['#ff4a6a','#4ef0ff','#ffd23c'][o.arg||0]; ctx.fillStyle='#120818'; ctx.fillRect(x,y,w,h); ctx.fillStyle='#3a3048'; ctx.fillRect(x+1,y+1,w-2,h-2); ctx.fillStyle=col;
 if(h>w){ for(let yy=y+3;yy<y+h-2;yy+=6) ctx.fillRect(x+1,yy,w-2,2); } else { for(let xx=x+3;xx<x+w-2;xx+=6) ctx.fillRect(xx,y+1,2,h-2); } ctx.fillStyle='#fff'; ctx.fillRect(x+1,y+1,1,1); }
function drawConv(o,t){ const x=o.x|0,y=o.y|0,w=o.w,h=o.h; ctx.fillStyle='#0a0c10'; ctx.fillRect(x,y,w,h); ctx.fillStyle='#3a3e48'; ctx.fillRect(x+1,y+1,w-2,h-2); const off=((t*38*o.arg)%8+8)%8|0;
 ctx.fillStyle='#ffd23c'; for(let xx=x+2-8+off;xx<x+w-2;xx+=8){ for(let k=0;k<3;k++){ const px=xx+(o.arg>0?k:2-k); if(px>=x+2&&px<x+w-2) ctx.fillRect(px,y+2+k,1,1), (px>=x+2&&px<x+w-2)&&ctx.fillRect(px,y+6-k,1,1);} }
 ctx.fillStyle='#6a6e78'; ctx.fillRect(x+1,y+1,w-2,1); disc2(x+3,y+h/2|0,2,'#1a1a1a'); disc2(x+w-4,y+h/2|0,2,'#1a1a1a'); }
function disc2(x,y,r,col){ ctx.fillStyle=col; for(let yy=-r;yy<=r;yy++){ const w=Math.sqrt(r*r-yy*yy)|0; ctx.fillRect(x-w,y+yy,w*2+1,1);} }
function drawFan(f,t){ const [x,y,w,h]=f; const bx=x+w/2|0, by=y+h; ctx.globalAlpha=.18; ctx.fillStyle='#e8f8ff'; ctx.fillRect(x,y,w,h); ctx.globalAlpha=1;
 for(let i=0;i<8;i++){ const sx=x+3+((i*37)%Math.max(4,w-6)), sy=y+((by-y)-((t*90+i*53)%(h)))|0; ctx.globalAlpha=.6; ctx.fillStyle='#ffffff'; ctx.fillRect(sx,sy,1,5); ctx.globalAlpha=1; }
 ctx.fillStyle='#120818'; ctx.fillRect(bx-12,by-5,24,6); ctx.fillStyle='#6a6e78'; ctx.fillRect(bx-11,by-4,22,4); const a=(t*20|0)%2; ctx.fillStyle='#c8ccd8'; if(a){ctx.fillRect(bx-9,by-3,7,2);ctx.fillRect(bx+2,by-3,7,2);} else {ctx.fillRect(bx-5,by-3,3,2);ctx.fillRect(bx+2,by-3,3,2);} ctx.fillStyle='#ffd23c'; ctx.fillRect(bx-1,by-3,2,2); }
function drawWater(w,t){ const [x,y,ww,h]=w; ctx.globalAlpha=.55; ctx.fillStyle='#1a6ad0'; ctx.fillRect(x,y,ww,h); ctx.globalAlpha=.35; ctx.fillStyle='#0a2a6a'; ctx.fillRect(x,y+h*.5|0,ww,h/2|0); ctx.globalAlpha=1;
 for(let xx=x;xx<x+ww;xx++){ const yy=y+Math.round(Math.sin(xx*.3+t*4)*1); ctx.fillStyle='#a8e0ff'; ctx.fillRect(xx,yy,1,1); } ctx.fillStyle='rgba(255,255,255,.5)'; for(let i=0;i<4;i++){ const bx=x+((i*53+t*10)%ww)|0, by=y+h-((t*20+i*30)%h)|0; ctx.fillRect(bx,by,1,1);} }
function drawButton(b){ const x=b.x|0,y=b.y|0; ctx.fillStyle='#120818'; ctx.fillRect(x-7,y+3,14,4); ctx.fillStyle='#6a6e78'; ctx.fillRect(x-6,y+4,12,2); ctx.fillStyle='#120818'; const hh=b.on?1:4; ctx.fillRect(x-4,y+3-hh,8,hh+1); ctx.fillStyle=b.on?'#4ed05a':'#ff4a6a'; ctx.fillRect(x-3,y+4-hh,6,hh); }
function drawChute(x,y){ const C=['...OOOOOOOOO...','.OOrrWWWWWrrOO.','OrrrrWWWWWrrrrO','OOOOOOOOOOOOOOO','.O...........O.','..O.........O..','...O.......O...'];
 const m={O:'#1a0c22',r:'#e03030',W:'#ffffff'}; for(let j=0;j<C.length;j++)for(let i=0;i<15;i++){ const c=C[j][i]; if(c!=='.'){ ctx.fillStyle=m[c]; ctx.fillRect((x|0)-7+i,(y|0)-40+j,1,1);} } }


// ---------- B8: ТАЙНЫЕ ДВЕРИ ----------
const SECRETS=LV.map((l,i)=>l.sec?{li:i,...l.sec}:null).filter(Boolean);
const gemsHave=()=>(Array.isArray(save.gems)?save.gems:[]).filter(i=>LV[i]&&LV[i].sec);
const gemOf=i=>Array.isArray(save.gems)&&save.gems.includes(i);
const DOORCOL={crack:['#6a6070','#9a90a0','#2a2030'],vent:['#4a5a6a','#8aa0b0','#1a2028'],neon:['#ff3ad0','#ffb0f0','#3a0a3a'],ice:['#8ad0ff','#e0f4ff','#2a5a8a'],honey:['#e8a020','#ffd870','#6a3a08'],moss:['#3a8a3a','#8ae070','#143a14'],hatch:['#8a5a2a','#c8904a','#3a2008'],mirror:['#b0b8d0','#ffffff','#40485a'],snow:['#e8f0ff','#ffffff','#8aa0c0'],twin:['#c03040','#ff8a90','#401018']};
function drawSecretDoor(o,t,style){ const x=o.x|0,y=o.y|0,w=o.w,h=o.h; const [c0,c1,c2]=DOORCOL[style]||DOORCOL.crack; ctx.fillStyle=c2; ctx.fillRect(x,y,w,h); ctx.fillStyle=c0; ctx.fillRect(x+1,y+1,w-2,h-2);
 const vert=h>w; ctx.fillStyle=c1;
 if(style==='crack'){ for(let i=0;i<(vert?h:w);i+=7){ if(vert) ctx.fillRect(x+1+(i%2),y+i,1,4); else ctx.fillRect(x+i,y+1+(i%2),4,1);} }
 else if(style==='vent'||style==='hatch'){ for(let i=2;i<(vert?h:w);i+=4){ if(vert) ctx.fillRect(x+1,y+i,w-2,1); else ctx.fillRect(x+i,y+1,1,h-2);} }
 else if(style==='neon'){ ctx.globalAlpha=.5+.5*Math.sin(t*6); ctx.fillRect(x,y,w,h); ctx.globalAlpha=1; }
 else if(style==='honey'){ for(let i=1;i<(vert?h:w);i+=5){ if(vert) ctx.fillRect(x+1+((i/5|0)%2)*2,y+i,2,3); else ctx.fillRect(x+i,y+1+((i/5|0)%2)*2,3,2);} }
 else if(style==='mirror'){ const k=(t*40|0)%((vert?h:w)+20)-10; if(vert) ctx.fillRect(x+1,y+Math.max(0,k),w-2,3); else ctx.fillRect(x+Math.max(0,k),y+1,3,h-2); }
 else if(style==='twin'){ const m=vert?[x+w/2|0,y+h/3|0,x+w/2|0,y+2*h/3|0]:[x+w/3|0,y+h/2|0,x+2*w/3|0,y+h/2|0]; ctx.fillStyle='#ffd23c'; ctx.fillRect(m[0]-2,m[1]-2,4,4); ctx.fillRect(m[2]-2,m[3]-2,4,4); }
 else { ctx.globalAlpha=.6; for(let i=0;i<(vert?h:w);i+=6){ if(vert) ctx.fillRect(x+1,y+i,w-2,2); else ctx.fillRect(x+i,y+1,2,h-2);} ctx.globalAlpha=1; }
 // замочная скважина-«?»
 const cx=x+w/2|0, cy=y+h/2|0; ctx.fillStyle='#1a0c22'; ctx.fillRect(cx-1,cy-3,3,3); ctx.fillRect(cx,cy,1,3); }
function drawGem(x,y,t,ghost){ x=Math.round(x); y=Math.round(y+Math.sin(t*3)*2); const P=['...#...','..#a#..','.#aab#.','#aaabb#','.#abb#.','..#b#..','...#...']; if(ghost) ctx.globalAlpha=.35;
 for(let j=0;j<7;j++)for(let i=0;i<7;i++){ const ch=P[j][i]; if(ch==='.') continue; ctx.fillStyle=ch==='#'?'#0a2a3a':ch==='a'?'#7affff':'#2ab0e0'; ctx.fillRect(x-3+i,y-3+j,1,1); }
 if(!ghost&&((t*2|0)%3===0)){ ctx.fillStyle='#fff'; ctx.fillRect(x-1,y-2,1,1); ctx.fillRect(x+3,y-5,1,3); ctx.fillRect(x+2,y-4,3,1); } ctx.globalAlpha=1; }

const IMP_LINES=[["Ну что, прыгаем?", "Я тут вообще-то желе, а не памятник…", "ЖЕЛЕ ПРОСТАИВАЕТ! Это преступление!"], ["Мне и тут неплохо…", "Растекаюсь от скуки.", "Всё, я лужа. Навсегда. Хмпф."], ["Колючки чешутся…", "Сейчас как фыркну!", "ФЫР-ФЫР-ФЫР! Кидай уже!"], ["Покатимся?", "Я круглый, мне нельзя стоять!", "Начинка стынет! Стынет, слышишь?!"], ["Хрусть-хрусть кулаками.", "Я начинаю закипать.", "ВСЁ. ЛАВА В ГОЛОВУ. ЗАПУСКАЙ!"], ["Двигатель прогрет.", "Топливо улетучивается…", "Сейчас улечу без тебя!"], ["Бл-бл-бл языком…", "Лизну стену от скуки.", "Язык затёк! Ну давай же!"], ["Пропеллер крутится…", "Ж-ж-ж… вхолостую…", "Я сейчас вертолёт, а не слизень!"], ["Кап.", "Кап. Кап.", "КАП-КАП-КАП! Я так испарюсь!"], ["Впитываю тишину.", "Я уже впитал всю скуку мира.", "Выжми меня уже в полёт!"], ["Мы ждём. Вдвоём.", "Брат, он заснул?", "ДВОЙНОЕ НЕТЕРПЕНИЕ!"], ["Тепло… уютно…", "Лампочка мигает от скуки.", "Я ЩАС ПЕРЕГОРЮ!"], ["Бинты поправлю…", "Три тысячи лет ждал, и снова жду.", "Проклятие ожидания! Кидай!"], ["Проверяю стропы.", "Ветер уходит!", "Прыжок отменяется? НЕТ!"], ["Ж-ж… пчёлка скучает.", "Пчела предлагает уйти.", "Ж-Ж-Ж! Мы обиделись!"], ["Тучка задумалась.", "Скоро пойдёт дождь… из слёз.", "ГРОМ И МОЛНИЯ! ЗАПУСКАЙ!"], ["Цвету терпеливо.", "Колючки засохнут…", "Я кактус, но даже я не железный!"], ["В банке тихо.", "Крышка запотела…", "Открой банку и швырни!"], ["Диско-шар крутится.", "Музыка играет, а мы стоим.", "ТАНЦПОЛ ЗОВЁТ! ПОЕХАЛИ!"], ["Семечки считаю.", "Корочка сохнет…", "Сок кипит! Кидай арбуз!"], ["Бууу…", "Я так-то не страшный, а скучающий.", "БУУУ! ДАВАЙ УЖЕ!"], ["Полоски выравниваю.", "Вверх ногами было бы веселее.", "ПЕРЕВЕРНУ ВЕСЬ УРОВЕНЬ!"]];
// B7: нетерпеливый слизень (чисто косметика: на физику и счёт не влияет)
let idleT=0, impStage=0, bubble=null, impNext=0;
function impTick(dt){ const s=world.s; const waiting=scene==='play'&&!overlay&&!drag&&!world.result&&s.st==='idle'&&world.shots>0&&(sAnim.a==='idle');
 if(!waiting){ idleT=0; impStage=0; if(bubble&&(drag||s.st==='fly')) bubble=null; return; }
 idleT+=dt; const ch=PC(); const ci=ch.fuse?ch.fuse[0]:CHARS.indexOf(ch); const L=IMP_LINES[Math.max(0,ci)]||IMP_LINES[0];
 const st=idleT>=8?3:idleT>=5?2:idleT>=2.5?1:0;
 if(st>impStage){ impStage=st; bubble={s:L[st-1],t:0,life:st===3?3.2:2.6,st}; if(st===3){ sfx('grumble'); haptic('light'); impNext=idleT+7; } else sfx('tap'); }
 if(impStage===3&&idleT>impNext){ impNext=idleT+7; bubble={s:L[2],t:0,life:3.2,st:3}; sfx('grumble'); }
 if(impStage>=2&&Math.random()<dt*(impStage===3?9:4)){ const side=Math.random()<.5?-1:1; parts.push({x:s.x+side*(6+Math.random()*4),y:s.y-14-Math.random()*6,vx:side*20,vy:-30,life:.7,t:0,c:'#8ad8ff',g:260,s:2}); } }
function impJitter(){ return impStage===3&&!drag?Math.round(Math.sin(now*40)*1):0; }
function drawBubble(){ if(!bubble) return; bubble.t+=1/60; if(bubble.t>bubble.life){ bubble=null; return; } const s=world.s; const tw=Math.min(LW-8,Math.round(bubble.s.length*(bubble.st===3?7.4:6.4))+18), bx=Math.max(4,Math.min(LW-4-tw,s.x-tw/2))|0, by=Math.max(4,s.y-80)|0;
 const a=Math.min(1,bubble.t*6,(bubble.life-bubble.t)*4); const bg=bubble.st===3?'#5a1a2a':'#2b1a4a', rim=bubble.st===3?'#ff8a9a':'#d8c8f0'; ctx.globalAlpha=a; ctx.fillStyle=rim; ctx.fillRect(bx-1,by-1,tw+2,22); ctx.fillStyle=bg; ctx.fillRect(bx,by,tw,20);
 const tx=Math.max(bx+6,Math.min(bx+tw-8,s.x))|0; ctx.fillStyle=rim; ctx.fillRect(tx-3,by+20,7,3); ctx.fillRect(tx-2,by+23,5,2); ctx.fillRect(tx-1,by+25,3,1); ctx.fillStyle=bg; ctx.fillRect(tx-2,by+20,5,2); ctx.fillRect(tx-1,by+22,3,2);
 T(bubble.s,bx+tw/2,by+4,10,bubble.st===3?'#ffd0d0':'#fff'); ctx.globalAlpha=1; }

// ---------- B9: ШАПКИ И СКИНЫ ----------
// пиксельные шаблоны; '.' — пусто. Точка привязки: низ-центр (голова) / центр (лицо)
const COSI={
 head:[
  {id:'party',name:'Колпак',need:{st:0},pal:{a:'#ff4fa8',b:'#ffd23c',c:'#4ef0ff',o:'#1a0c22',w:'#fff'},p:['....w....','...owo...','...oao...','..oabao..','..oaaao..','.oaccaao.','.oaaaabo.','oabbaaaao','oaaaccaao','ooooooooo']},
  {id:'bow',name:'Бантик',need:{st:5},pal:{a:'#ff5aa8',b:'#ffb0d8',o:'#1a0c22'},p:['oo.....oo','oboo.oobo','obaaoaabo','oaaaoaaao','obaooobao','oo.....oo']},
  {id:'cowboy',name:'Ковбойская',need:{st:15},pal:{a:'#a0602a',b:'#d08a40',c:'#5a2a10',o:'#1a0c22'},p:['....ooooo....','...oabbbao...','...oaaaaao...','...occcccoo..','o.oaaaaaaao.o','obaaaaaaaaabo','.ooooooooooo.']},
  {id:'tophat',name:'Цилиндр',need:{st:30},pal:{a:'#2a2a3a',b:'#4a4a62',c:'#e0304a',o:'#0a0610'},p:['..oooooooo..','..oabaaaao..','..oabaaaao..','..oabaaaao..','..occccccо..'.replace('о','o'),'..oaaaaaao..','oooooooooooo','oaaaaaaaaaao','oooooooooooo']},
  {id:'ushanka',name:'Ушанка',need:{gem:2},pal:{a:'#8a5a3a',b:'#e8dcc8',c:'#ffd23c',o:'#1a0c22'},p:['...ooooooo...','..obbbbbbbo..','.obbbbcbbbbo.','oaaaaaaaaaaao','oaaaaaaaaaaao','oboooooooooboo'.slice(0,13),'obo.......obo','obo.......obo','.o.........o.']},
  {id:'halo',name:'Нимб',need:{gem:5},float:6,pal:{a:'#ffe066',b:'#fff6b0',o:'#c08a10'},p:['...oooooo...','.oabbbbbbao.','oa........ao','.oaaaaaaaao.','...oooooo...']},
  {id:'crown',name:'Корона',need:{st:150},pal:{a:'#ffd23c',b:'#fff6b0',c:'#ff3a5a',d:'#4ef0ff',o:'#5a3008'},p:['o...o...o...o','ob.oao.oao.bo','oaoaaaoaaaoao','oaaaaaaaaaaao','oacaadaadaaco','oaaaaaaaaaaao','ooooooooooooo']},
 ],
 face:[
  {id:'stache',name:'Усы',need:{st:0},mouth:.4,pal:{a:'#5a3018',b:'#8a5028',o:'#1a0c22'},p:['.oo.....oo.','obao.o.oabo','oaaaoaoaaao','.ooaaaaaoo.','...ooooo...']},
  {id:'shades',name:'Тёмные очки',need:{st:10},pal:{a:'#1a1a2a',b:'#5a6a9a',o:'#000'},p:['ooooooooooooooo','oabaaoooobabaao','oaabaooooaabao.'.slice(0,15),'.oaao...oaao...'.slice(0,15).replace('...','.').ljust?0:'.oaao...oaao...','..oo.....oo....']},
  {id:'nose',name:'Клоунский нос',need:{st:20},mouth:.2,pal:{a:'#ff2a3a',b:'#ff9aa0',o:'#5a0a10'},p:['.ooo.','oabao','oaaao','oaaao','.ooo.']},
  {id:'monocle',name:'Монокль',need:{st:45},dx:4,pal:{a:'#ffd23c',b:'#c8f0ff',o:'#5a3008'},p:['.aaa..','a.b.a.','a..ba.','a...a.','.aaa..','....a.','.....a','....a.','.....a']},
  {id:'g1c',name:'Очки аналитика 1С',need:{st:60},dx:5,dy:-1,pal:{a:'#8a1a1a',b:'#c8e8ff',c:'#ffd23c',d:'#d0101a',o:'#3a0a0a'},p:['.............ccccccccc','.............ccdcccddc','.ooooo.ooooo.cddccdccc','oabbbaoabbbaaccdccdccc','oabbbaaabbbaoccdccdccc','oabbbaoabbbaocdddccddc','.ooooo.ooooo.ccccccccc']},
 ],
 skin:[
  {id:'zombie',name:'Зомби',need:{st:25}},
  {id:'neon',name:'Неон-контур',need:{gem:3}},
  {id:'gold',name:'Золото',need:{st:200}},
  {id:'rainbow',name:'Радуга',need:{gem:10}},
 ]};
// чистка шаблонов (выровнять ширину)
for(const k of ['head','face']) for(const it of COSI[k]){ it.p=it.p.map(r=>String(r)); const w=Math.max(...it.p.map(r=>r.length)); it.p=it.p.map(r=>r.padEnd(w,'.')); }
// исправление очков (без хитростей с JS-строками выше)
COSI.face[1].p=['ooooooo.ooooooo','oabaaao.oabaaao','oaabaaoooaabaao','oaaaaao.oaaaaao','.oaaao...oaaao.','..ooo.....ooo..'];
const cosNeedTxt=n=>n.gem?'◆ '+n.gem:'★ '+n.st;
const cosOpen=it=>!it.need||(it.need.gem?gemsHave().length>=it.need.gem:totalStars()>=it.need.st);
function cosGet(){ const c=save.cos&&typeof save.cos==='object'?save.cos:(save.cos={head:'',face:'',skin:''}); for(const k of ['head','face','skin']){ const it=COSI[k].find(i=>i.id===c[k]); if(c[k]&&(!it||!cosOpen(it))) c[k]=''; } return c; }
const pixCache={};
function pixItem(it){ if(pixCache[it.id]) return pixCache[it.id]; const w=it.p[0].length,h=it.p.length; const [c,x]=mk(w,h); for(let j=0;j<h;j++)for(let i=0;i<w;i++){ const ch=it.p[j][i]; if(ch==='.'||!it.pal[ch]) continue; x.fillStyle=it.pal[ch]; x.fillRect(i,j,1,1);} return pixCache[it.id]=c; }
// якоря из пикселей атласа: макушка (центральная полоса) и глаза (самые яркие пиксели в верхней половине)
const ancCache={};
function anchors(id){ if(ancCache[id]) return ancCache[id]; const im=SPR[id]; if(!im) return null; const [c,x]=mk(1024,320); x.drawImage(im,0,0); const d=x.getImageData(0,0,1024,320).data; const A={};
 for(const k in ANIM){ const An=ANIM[k]; A[k]=[]; for(let f=0;f<An.n;f++){ const cx0=f*An.w, cy0=An.row*64; let x0=1e9,x1=-1,y0=1e9,y1=-1;
   for(let y=0;y<64;y++)for(let xx=0;xx<An.w;xx++) if(d[((cy0+y)*1024+cx0+xx)*4+3]>128){ if(xx<x0)x0=xx; if(xx>x1)x1=xx; if(y<y0)y0=y; if(y>y1)y1=y; }
   if(x1<0){ A[k].push({hx:An.w/2,hy:20,ex:An.w/2,ey:30}); continue; }
   const mx=(x0+x1)/2, bw=Math.max(6,(x1-x0)*.22); let hy=y1, hx=mx; for(let y=y0;y<=y1&&hy===y1;y++) for(let xx=Math.round(mx-bw);xx<=Math.round(mx+bw);xx++) if(d[((cy0+y)*1024+cx0+xx)*4+3]>128){ hy=y; break; }
   let sx=0,sy=0,n=0; const ylim=y0+(y1-y0)*.6; for(let y=y0;y<=ylim;y++)for(let xx=x0;xx<=x1;xx++){ const i=((cy0+y)*1024+cx0+xx)*4; if(d[i+3]<200) continue; const r=d[i],g2=d[i+1],b=d[i+2]; if(r>215&&g2>215&&b>215){ sx+=xx; sy+=y; n++; } }
   const ex=n>3?sx/n:mx, ey=n>3?sy/n:y0+(y1-y0)*.38; A[k].push({hx:Math.round(hx),hy,ex:Math.round(ex),ey:Math.round(ey),top:y0,by:y1,mx:Math.round(mx)}); } }
 return ancCache[id]=A; }
// перекраска атласа под скин
const skinCache={};
function skinSprite(id,skin){ const key=id+'#'+skin; if(skinCache[key]) return skinCache[key]; const im=SPR[id]; if(!im) return null; const [c,x]=mk(1024,320); x.drawImage(im,0,0); const D=x.getImageData(0,0,1024,320), p=D.data;
 const GOLD=[[90,50,8],[176,110,20],[240,180,40],[255,226,110],[255,248,200]];
 const at=(xx,yy)=>xx<0||yy<0||xx>=1024||yy>=320?0:p[(yy*1024+xx)*4+3];
 const a0=new Uint8Array(1024*320); for(let i=0;i<a0.length;i++) a0[i]=p[i*4+3];
 for(let yy=0;yy<320;yy++)for(let xx=0;xx<1024;xx++){ const i=(yy*1024+xx)*4; if(p[i+3]<10) continue; const r=p[i],g2=p[i+1],b=p[i+2], L=lum(r,g2,b), sat=Math.max(r,g2,b)-Math.min(r,g2,b);
  if(sat<20&&L>200) continue; // белки глаз
  if(skin==='gold'){ if(L<40) continue; const q=GOLD[Math.min(4,Math.floor(L/52))]; p[i]=q[0];p[i+1]=q[1];p[i+2]=q[2]; }
  else if(skin==='zombie'){ if(L<40) continue; const v=L*.75; p[i]=v*.55; p[i+1]=Math.min(255,v*1.05+20); p[i+2]=v*.45; if(((xx*7+yy*13)%29)===0){ p[i]=110;p[i+1]=40;p[i+2]=60; } }
  else if(skin==='rainbow'){ if(L<40) continue; const h=((xx%64)+(yy%64))/128*6+0; const k=[0,2,4].map(o=>{ const t=(h+o)%6; return t<1?t:t<3?1:t<4?4-t:0; }); const v=.45+L/255*.6; p[i]=Math.min(255,k[0]*255*v+30); p[i+1]=Math.min(255,k[1]*255*v+30); p[i+2]=Math.min(255,k[2]*255*v+30); }
  else if(skin==='neon'){ const edge=!a0[yy*1024+xx-1]||!a0[yy*1024+xx+1]||!a0[(yy-1)*1024+xx]||!a0[(yy+1)*1024+xx]; if(L<40||edge){ p[i]=78;p[i+1]=255;p[i+2]=230; } else { p[i]=r*.25+10; p[i+1]=g2*.2+8; p[i+2]=b*.35+30; } } }
 x.putImageData(D,0,0); return skinCache[key]=c; }
// отрисовка слизня игрока с косметикой
function drawSlugC(id,anim,f,x,y,flip=false,sx=1,sy=1){ const cz=cosGet(); const sid=cz.skin?id+'#'+cz.skin:id; if(cz.skin&&!SPR[sid]){ const s=skinSprite(id,cz.skin); if(s) SPR[sid]=s; }
 drawSlug(SPR[sid]?sid:id,anim,f,x,y,flip,sx,sy); const fc=cz.face||(isApril1()?'stache':''); if(!cz.head&&!fc) return; const A=anchors(id); if(!A) return; const a=A[anim][f]; if(!a) return;
 const px=anim==='pull'?96:32, py=40; ctx.save(); ctx.translate(Math.round(x),Math.round(y)); if(flip) ctx.scale(-1,1); if(sx!==1||sy!==1){ ctx.translate(0,16); ctx.scale(sx,sy); ctx.translate(0,-16); }
 if(fc){ const it=COSI.face.find(i=>i.id===fc); const c=pixItem(it); ctx.drawImage(c,Math.round((it.mouth&&a.mx!=null?a.mx+(a.ex-a.mx)*.35:a.ex)-px-c.width/2+(it.dx||0)),Math.round((it.mouth&&a.by?a.ey+(a.by-a.ey)*it.mouth+2:a.ey)-py-c.height/2+(it.dy||0))); }
 if(cz.head){ const it=COSI.head.find(i=>i.id===cz.head); const c=pixItem(it); const bob=it.float?Math.round(Math.sin(now*3)):0; ctx.drawImage(c,Math.round(a.hx-px-c.width/2),Math.round(a.hy-py-c.height+2-(it.float||0)+bob)); }
 ctx.restore(); }
function drawWardrobe(){ drawBG(3,0,now); swipePager=null; const tp=TAP(); iconBtn(4,4,icBack,()=>{sfx('tap');scene='select';},'back'); const cz=cosGet();
 T('Гардероб',W/2,tp/2-9,16,['#fff','#ffd23c']); T('★ '+totalStars()+'   ◆ '+gemsHave().length+'/'+SECRETS.length,W/2,tp/2+9,10,'#d8c8f0');
 const c=PC(); const py=tp+120; panel(W/2-90,tp+22,180,130,'#22143e'); ctx.save(); ctx.translate(W/2,py); ctx.scale(2,2); drawSlugC(c.id,'idle',frameOf('idle',now),0,0); ctx.restore(); T(c.name,W/2,tp+136,11,'#fff');
 let y=tp+164; const cols=8, cw=Math.floor((W-16)/cols), chh=Math.max(TAP(),40);
 for(const [slot,title] of [['head','Голова'],['face','Лицо'],['skin','Скин']]){ T(title,12,y,12,'#ffd23c','l'); y+=16; const list=[{id:'',name:'нет'}].concat(COSI[slot]);
  list.forEach((it,k)=>{ const x=8+(k%cols)*cw, yy=y+Math.floor(k/cols)*chh; const op=!it.need||cosOpen(it), sel=cz[slot]===it.id;
   panel(x+1,yy,cw-2,chh-3,sel?'#2a6a5a':op?'#2b1a4a':'#1a1020'); const cx=x+cw/2|0, cy=yy+chh/2-3|0;
   if(!it.id){ T('—',cx,cy-6,12,'#a898c8'); }
   else if(slot==='skin'){ const sp=op?skinSprite('slug01',it.id):null; if(sp){ ctx.save(); ctx.beginPath(); ctx.rect(x+2,yy+1,cw-4,chh-5); ctx.clip(); ctx.drawImage(sp,0,0,64,64,cx-32,cy-28,64,64); ctx.restore(); } }
   else { const pc=pixItem(it); const k2=pc.width>14?1:2; if(!op) ctx.globalAlpha=.3; ctx.drawImage(pc,Math.round(cx-pc.width*k2/2),Math.round(cy-pc.height*k2/2),pc.width*k2,pc.height*k2); ctx.globalAlpha=1; }
   if(!op) T(cosNeedTxt(it.need),cx,yy+chh-16,9,it.need.gem?'#7affff':'#ffd23c');
   buttons.push({x,y:yy,w:cw,h:chh-3,label:'cos'+slot+k,cb:()=>{ if(!op){ sfx('bounce',40); haptic('error'); floats.push({s:it.name+': нужно '+cosNeedTxt(it.need),x:W/2-ox,y:yy-oy-6,t:0,life:1.3,size:11,col:'#ffd23c'}); return; } cz[slot]=it.id; store(); sfx('candy',k%4); haptic('tick'); if(it.id) floats.push({s:it.name,x:W/2-ox,y:tp+40-oy,t:0,life:1,size:12,col:'#fff'}); }}); });
  y+=Math.ceil(list.length/cols)*chh+8; }
 for(const f of floats){ const k=f.t/f.life; T(f.s,f.x+ox,f.y+oy-k*14,f.size,f.col); } }

// ---------- B6: ГРАФФИТИ ШМЯКОВ ----------
const GRAF_CAP=60; const grafCache={};
function grafList(li){ if(!save.graf||typeof save.graf!=='object') save.graf={}; return save.graf[li]||(save.graf[li]=[]); }
function grafAdd(li,x,y,col,orient){ if(chaosRun||save.grafOff) return; const L=grafList(li); L.push([Math.round(x),Math.round(y),col,(Math.random()*3)|0,orient,(Math.random()*1e4)|0]); while(L.length>GRAF_CAP) L.shift(); delete grafCache[li]; store(); }
function grafClear(li){ if(save.graf) delete save.graf[li]; delete grafCache[li]; store(); }
function grafCanvas(li){ const L=(save.graf&&save.graf[li])||[]; if(!L.length) return null; const c0=grafCache[li]; if(c0&&c0.n===L.length) return c0.c;
 const [c,x]=mk(LW,LH); for(const [gx,gy,col,shape,orient,sd] of L){ seed=sd+1; const pts=[];
  // форма: 0 — клякса, 1 — звёздный брызг, 2 — мазок
  const n=shape===1?7:shape===2?4:5; for(let i=0;i<n;i++){ const a=rnd()*7, d=shape===1?9+rnd()*12:5+rnd()*8; let px=Math.cos(a)*d, py=Math.sin(a)*d*.5; if(shape===2){ px=(i-1.5)*8+rnd()*2; py=rnd()*2-1; } pts.push([px,py,shape===1?2+rnd()*2|0:3+rnd()*3|0]); }
  pts.push([0,0,shape===2?5:8]);
  const tr=(px,py)=> orient===1?[gx+py*1.2,gy+px]:orient===2?[gx-py*1.2,gy+px]:orient===3?[gx+px,gy-py]:[gx+px,gy+py];
  for(const pass of [0,1]){ x.fillStyle=pass?col:'#1a0c22'; for(const [px,py,r] of pts){ const [X,Y]=tr(px,py); const rr=r+(pass?0:1); for(let yy=-rr;yy<=rr;yy++){ const w=Math.sqrt(rr*rr-yy*yy)|0; x.fillRect(Math.round(X-w),Math.round(Y+yy*.6),w*2+1,1); } } }
  // подтёки
  if(orient===0||orient===3){} else { x.fillStyle=col; for(let k=0;k<2;k++) x.fillRect(Math.round(gx+(rnd()*6-3)),Math.round(gy+4),1,3+rnd()*6|0); }
  x.fillStyle='rgba(255,255,255,.55)'; const [hx,hy]=tr(-1,-1); x.fillRect(Math.round(hx),Math.round(hy),2,1); }
 grafCache[li]={c,n:L.length}; return c; }

// ---------- B4: СЛИЯНИЕ СЛИЗНЕЙ ----------
const FUSE_STARS=40; let fusion=null, fusePick=[];
const PC=()=> relay? CHARS[relayTeam[relay.i]] : fusion? fusedChar(fusion.a,fusion.b) : (useSecret&&save.eggs.secret? SECRET : CHARS[selPick]);
const ABN={djump:'реактивный прыжок',slowmo:'слоу-мо',split:'раздвоение',chute:'парашют',dive:'ливень-пике',ghost:'сквозь стены',gflip:'антигравитация',wall:'липкий язык',glide:'планирование',sponge:'водный батут',melt:'растапливает лёд',refund:'бинты',magnet:'магнит конфет',crush:'ломает ящики',shield:'банка-щит',preview:'прицел с отскоками',juicy:'конфета = бросок'};
function fuseCheck(a,b){ const A=CHARS[a],B=CHARS[b]; if(a===b) return 'это один и тот же слизень';
 if(A.tap&&B.tap) return 'две тап-способности подерутся'; return ''; }
function fuseName(A,B){ const a=A.name, b=B.name; const ha=Math.ceil(a.length/2), hb=Math.floor(b.length/2); let n=a.slice(0,ha)+b.slice(hb); if(n.length<5) n=a.slice(0,ha)+b.slice(Math.max(1,hb-1)); return n[0].toUpperCase()+n.slice(1).toLowerCase(); }
const fuseCache={};
function fusedChar(a,b){ const key=a+'_'+b; if(fuseCache[key]) return fuseCache[key]; const A=CHARS[a],B=CHARS[b]; const avg=k=>Math.round((A[k]+B[k])/2*100)/100;
 const abs=[A.ab,B.ab].filter(Boolean); const tapAb=A.tap?A.ab:B.tap?B.ab:'';
 const c={id:'fuse_'+key,name:fuseName(A,B),fuse:[a,b],col:B.col,col2:A.col,rest:avg('rest'),fric:avg('fric'),power:avg('power'),grav:avg('grav'),splat:avg('splat'),spiky:!!(A.spiky||B.spiky),extra:Math.max(A.extra||0,B.extra||0),ab:tapAb,tap:tapAb?1:0,abs};
 const perks=abs.map(x=>ABN[x]||x); if(c.spiky) perks.push('шипы не страшны'); if(c.extra) perks.push('+'+c.extra+' бросок'); if(!perks.length) perks.push('прыгучесть '+Math.round(c.rest*100)+'%');
 c.perk=perks.join(' + '); c.desc=A.name+' + '+B.name+' (на 1 уровень)'; c.cost=0;
 if(!SPR[c.id]&&SPR[A.id]&&SPR[B.id]) SPR[c.id]=makeHybrid(A,B); fuseCache[key]=c; return c; }
// гибрид: силуэт и анимация A, перекрашенные палитрой B + «макушка» B (глаза/шапка/рожки) пересажена сверху
function lum(r,g,b){ return .3*r+.59*g+.11*b; }

// ---------- v3.1: черты B у гибрида: деталь + узор + аура ----------
// det: пиксельный шаблон (низ-центр на макушке тела, или side:1 — парит у правого бока); pat: узор (null — нет); aura: цвет ореола; pc: цвета частиц; iris: цвет «чужого» глаза
const FD=(p,pal,side)=>({p,pal,side});
const FUSE_SPEC={
 slug01:{det:FD(['..oo..','.oaao.','oabaao','oaaaao','.oooo.'],{o:'#3a1a6a',a:'#a57af0',b:'#e8d8ff'}),pat:{t:'spots',c:['#c8a8ff','#7a4ad0']},aura:'#b88aff',pc:['#d8c0ff','#a57af0'],iris:'#9a6aff'},
 slug34:{det:FD(['...o...','..oao..','.oaaao.','.oabao.','..ooo..'],{o:'#6a2a08',a:'#ff9a3c',b:'#ffd8a0'}),pat:{t:'drips',c:['#ffb060','#c05a10']},aura:'#ff9a3c',pc:['#ffc070','#ff8a2c'],iris:'#ff8a2c'},
 slug36:{det:FD(['o.....o..','ao..o.ao.','.ao.ao.ao','..aaaaaa.','..oooooo.'].map(r=>r.slice(0,9)),{o:'#6a4a00',a:'#ffd93c'}),pat:null,aura:'#ffd93c',pc:['#fff08a','#ffd93c'],iris:'#e0a000'},
 slug41:{det:FD(['.ooooooo.','oapacapao','oaaaaaaao','.oa.oa.o.','..o..o...'],{o:'#8a2a5a',a:'#ff8ac8',p:'#7affe0',c:'#ffe066'}),pat:{t:'sprinkle',c:['#7affe0','#ffe066','#ffffff','#4a9aff']},aura:'#ff7ab8',pc:['#7affe0','#ffe066','#ff8ac8'],iris:'#ff5aa8'},
 slug53:{det:FD(['....s.s....','...s.s.....','....s......','..ooo.ooo..','.oyyyoyyyo.','oorryyyrroo','odrrrrrrrdo','oddrdddrddo','.oddddddo..'],{s:'#c8c0d0',o:'#1a0c10',r:'#ff6a1c',y:'#ffe066',d:'#4a3a44'}),pat:{t:'cracks',c:['#ffd23c','#ff6a1c']},aura:'#ff6a1c',pc:['#ff4a1a','#ff9a2c','#ffe066'],iris:'#ff5a1a'},
 slug02:{det:FD(['.oooooooo.','oaaoaaoaao','obbobbobbo','.oooooooo.'],{o:'#3a1a08',a:'#c8e8ff',b:'#4a9ad0'}),pat:null,aura:'#f4842c',pc:['#ffe066','#ff8a2c','#ff4a1a'],iris:'#f4842c'},
 slug03:{det:FD(['..ooo..','.oaaao.','oaabaao','oaaaaao','.oaaao.','..oao..','...o...'],{o:'#5a1a2a',a:'#ff6a8a',b:'#ffb0c0'},1),pat:{t:'spots',c:['#7ae0e0','#1a8a8a']},aura:'#36c0c0',pc:['#8af0f0','#36c0c0'],iris:'#1aa0a0'},
 slug04:{det:FD(['oooo.oooo','oaaaoaaao','.oooboo..','...obo...','..ooooo..','.occcccco'.slice(0,9)],{o:'#1a3a1a',a:'#ff5a5a',b:'#ffe066',c:'#7ed08a'}),pat:null,aura:'#7ed08a',pc:['#c8f0c8','#7ed08a'],iris:'#3aa04a'},
 slug05:{det:FD(['...o...','..oao..','..oao..','.oaabo.','oaaaabo','oaaaaao','.oaaao.','..ooo..'],{o:'#1a3a7a',a:'#62acff',b:'#e0f0ff'},1),pat:null,aura:'#62acff',pc:['#a8d4ff','#62acff','#ffffff'],iris:'#2a7aff'},
 slug06:{det:FD(['.oo...oo.','oabo.oabo','oaao.oaao','.oo.o.oo.','...oao...','...oao...','....o....'],{o:'#5a7aa8',a:'#e8f4ff',b:'#ffffff'},1),pat:{t:'holes',c:['#a08a10','#d8b820']},aura:'#f0d040',pc:['#e8f4ff','#ffffff'],iris:'#c0a000'},
 slug39:{det:null,pat:{t:'split',c:['#3a8aff','#ff4048']},aura:'#ff4048',pc:['#ff4048','#3a8aff'],iris:'#3a8aff'},
 slug43:{det:FD(['..ooooo..','.oaaaaao.','.oabbbao.','.oacbbao.','.oaabaao.','..ooooo..','...odo...'],{o:'#3a1a5a',a:'#d8c8ff',b:'#ff8ad8',c:'#ffe0f8',d:'#8a6aa0'}),pat:{t:'blobs',c:['#ff7ac8','#c04aa0']},aura:'#b48ae0',pc:['#ff8ad8','#d8b0ff'],iris:'#c060e0'},
 slug44:{det:FD(['oooooo....','oaabaaoo..','oaaaaaaao.','.oooooaao.','......oao.','.......o..'],{o:'#5a5040',a:'#e8e2d8',b:'#b8b0a0'}),pat:{t:'bands',c:['#d8d0c0','#a8a090']},aura:'#e8e2d8',pc:['#f4f0e8','#c8c0b0'],iris:'#8a8070'},
 slug45:{det:FD(['..ooooooo..','.oawawawao.','oawawawawao','ooooooooooo','.o...o...o.','..o..o..o..','...o.o.o...'],{o:'#5a1a1a',a:'#ff4a4a',w:'#ffffff'}),pat:null,aura:'#4a9aff',pc:['#ffffff','#a8d0ff'],iris:'#2a6aff'},
 slug46:{det:FD(['.ww.ww.','.wwoww.','oyykyyo','oykyyko','.ooooo.'],{w:'#e8f4ff',o:'#3a2a08',y:'#ffd23c',k:'#2a1a08'},1),pat:{t:'drips',c:['#ffd060','#c07a10']},aura:'#f0a828',pc:['#ffd060','#ffe8a0'],iris:'#e08a00'},
 slug47:{det:FD(['..oooo...','.oaaaao..','oaaaaaaoo','oaabaaaao','.ooooooo.','..y..y...','.y..y....'],{o:'#5a6a8a',a:'#e8eef8',b:'#ffffff',y:'#62acff'},1),pat:null,aura:'#c8d0e0',pc:['#62acff','#e8eef8'],iris:'#5a8ad0'},
 slug48:{det:FD(['.p.p.','ppypp','.ppp.','..g..','.ggg.'],{p:'#ff6ab0',y:'#ffe066',g:'#3a8a2a'}),pat:{t:'spines',c:['#2a6a1a','#e8f0c0']},aura:'#62bc34',pc:['#ff8ac8','#a8e070'],iris:'#3a9a2a'},
 slug49:{det:FD(['..oooooo..','.oaaaaaao.','oabbbbbbao','oaaaaaaaao','.oooooooo.'],{o:'#2a2a2a',a:'#a8a8b0',b:'#e0e0e8'}),pat:{t:'glass',c:['#e8fff0','#b8f0c8']},aura:'#78c840',pc:['#c8f0a8','#e8fff0'],iris:'#4aa020'},
 slug50:{det:FD(['...o...','..oao..','.oabao.','oababao','.oabao.','..oao..','...o...'],{o:'#40485a',a:'#d0d8f0',b:'#ffffff'}),pat:{t:'facets',c:['#ffffff','#8a90b0']},aura:'#d0b0ff',pc:['#ffffff','#ff8ad8','#7affff','#ffe066'],iris:'#a070ff'},
 slug51:{det:FD(['....ooo','...ogro','..ogrko','.ogrrro','ogrkrro','oooooo.'],{o:'#2a0a10',g:'#3a9a3a',r:'#ff5a6a',k:'#1a0a0a'}),pat:{t:'seeds',c:['#1a0a0a','#3a1a1a']},aura:'#ff6070',pc:['#ff6070','#7ae07a'],iris:'#e03040'},
 slug52:{det:FD(['....oooo....','...obbbbo...','..obbbbbbo..','.obbkbbkbbo.','.obbkbbkbbo.','.obbbbbbbbo.','.obbbmmbbbo.','.obbbbbbbbo.','.obobbobbobo','..o.oo.oo.o.'],{o:'#5a7aa8',b:'#eef6ff',k:'#1a2a4a',m:'#ff8ab0'},1),pat:{t:'ghost',c:['#ffffff','#ffffff']},aura:'#b8dcff',pc:['#d8ecff','#a8ccff','#ffffff'],iris:'#6ab8ff'},
 slug54:{det:FD(['...ooo...','..owrwo..','.owrwrwo.','owrwrwrwo','ooooooooo'],{o:'#3a0a10',w:'#ffffff',r:'#f03040'}),pat:{t:'stripes',c:['#ffffff','#f03040']},aura:'#f03040',pc:['#ffffff','#ff7a80'],iris:'#f03040'},
};
// исправление ширины строк шаблонов
for(const k in FUSE_SPEC){ const d=FUSE_SPEC[k].det; if(d){ const w=Math.max(...d.p.map(r=>r.length)); d.p=d.p.map(r=>r.padEnd(w,'.')); } }
function fuseDecorate(p,IW,cells,A,B){ const S=FUSE_SPEC[B.id]; if(!S) return; let rs=7; const R=()=>(rs=(rs*16807)%2147483647)/2147483647;
 const rgb=h=>hex(h); const lumi=(i)=>.3*p[i]+.59*p[i+1]+.11*p[i+2];
 const set=(i,c,a=1)=>{ p[i]=p[i]*(1-a)+c[0]*a; p[i+1]=p[i+1]*(1-a)+c[1]*a; p[i+2]=p[i+2]*(1-a)+c[2]*a; p[i+3]=Math.max(p[i+3],255*a); };
 const pc=(S.pat&&S.pat.c||[]).map(rgb);
 // контраст узора: средний цвет тела гибрида (кадр idle 0) против главного цвета узора
 let patOK=!!S.pat; if(S.pat&&!['ghost','split','sprinkle','seeds','facets'].includes(S.pat.t)){ let r=0,g2=0,b=0,n=0; for(let y=0;y<64;y++)for(let x=0;x<64;x++){ const i=(y*IW+x)*4; if(p[i+3]<200) continue; const L=lumi(i); if(L<45||L>235) continue; r+=p[i];g2+=p[i+1];b+=p[i+2];n++; }
  if(n){ r/=n;g2/=n;b/=n; const d=Math.max(...pc.map(c=>Math.hypot(c[0]-r,c[1]-g2,c[2]-b))); if(d<90) patOK=false; } }

 for(const [cx,cy,w] of cells){ rs=7+cx*3+cy; const at=(x,y)=>(x<0||y<0||x>=w||y>=64)?-1:((cy+y)*IW+cx+x)*4;
  // классы пикселей
  const body=new Uint8Array(w*64), eye=new Uint8Array(w*64); let x0=1e9,x1=-1,y0=1e9,y1=-1;
  for(let y=0;y<64;y++)for(let x=0;x<w;x++){ const i=at(x,y); if(p[i+3]<128) continue; if(x<x0)x0=x; if(x>x1)x1=x; if(y<y0)y0=y; if(y>y1)y1=y; const L=lumi(i), sat=Math.max(p[i],p[i+1],p[i+2])-Math.min(p[i],p[i+1],p[i+2]); if(L>200&&sat<25) eye[y*w+x]=1; else if(L>=45) body[y*w+x]=1; }
  if(x1<0) continue; const BW=x1-x0, BH=y1-y0; const inner=(x,y)=>x>0&&y>0&&x<w-1&&y<63&&body[y*w+x]&&body[y*w+x-1]&&body[y*w+x+1]&&body[(y-1)*w+x]&&body[(y+1)*w+x];
  // 1) узор
  if(patOK){ const t=S.pat.t;
   if(t==='cracks'){ const D=[[1,0],[1,1],[0,1],[-1,1],[-1,0],[-1,-1],[0,-1],[1,-1]]; const path=new Set();
    for(const [sx,sy,d0] of [[.22,.88,7],[.78,.86,5],[.5,.95,6]]){ let x=Math.round(x0+sx*BW), y=Math.round(y0+sy*BH), d=d0; for(let k=0;k<12&&!inner(x,y);k++){ x+=Math.sign((x0+x1)/2-x); y--; } const n=8+(R()*5|0); for(let k=0;k<n&&inner(x,y);k++){ path.add(y*w+x); if(R()<.22) d=(d+(R()<.5?1:7))%8; x+=D[d][0]; y+=D[d][1]; } }
    for(const q of path){ const x=q%w,y=q/w|0; for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]) if(!path.has((y+dy)*w+x+dx)&&inner(x+dx,y+dy)) set(at(x+dx,y+dy),pc[1],.45); } for(const q of path) set(at(q%w,q/w|0),pc[0]); }
   else if(t==='spots'||t==='blobs'||t==='holes'){ for(let k=0;k<5;k++){ const x=Math.round(x0+BW*(.2+R()*.6)), y=Math.round(y0+BH*(.45+R()*.45)); if(!inner(x,y)) continue; set(at(x,y),pc[1]); if(t!=='holes'){ if(inner(x+1,y)) set(at(x+1,y),pc[0]); if(t==='blobs'&&inner(x,y+1)) set(at(x,y+1),pc[0]); } } }
   else if(t==='sprinkle'||t==='seeds'){ for(let k=0;k<(t==='seeds'?6:9);k++){ const x=Math.round(x0+BW*(.15+R()*.7)), y=Math.round(y0+BH*(.35+R()*.55)); if(!inner(x,y)||!inner(x+1,y)) continue; const c=pc[k%pc.length]; set(at(x,y),c); if(t==='sprinkle') set(at(x+1,y),c); else if(inner(x,y+1)) set(at(x,y+1),c); } }
   else if(t==='drips'){ for(let k=0;k<4;k++){ const x=Math.round(x0+BW*(.2+R()*.6)); let y=-1; for(let yy=y0;yy<=y1;yy++) if(inner(x,yy)){ y=yy; break; } if(y<0) continue; const L=2+(R()*4|0); for(let j=0;j<L&&inner(x,y+j);j++) set(at(x,y+j),j===L-1?pc[1]:pc[0],.85); } }
   else if(t==='bands'){ for(let y=y0+4;y<=y1;y+=5) for(let x=x0;x<=x1;x++){ const yy=y+((x>>2)&1); if(inner(x,yy)) set(at(x,yy),pc[(x>>3)&1],.65); } }
   else if(t==='stripes'){ for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){ if(!inner(x,y)) continue; if(((x+y)>>2)%2===0) set(at(x,y),pc[0],.55); } }
   else if(t==='split'){ const mx=(x0+x1)/2; for(let y=y0;y<=y1;y++)for(let x=Math.ceil(mx);x<=x1;x++) if(body[y*w+x]) set(at(x,y),pc[0],.45); }
   else if(t==='facets'){ for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){ if(!inner(x,y)) continue; if(x%4===0||y%4===0) set(at(x,y),pc[1],.35); else if(x%4===1&&y%4===1&&R()<.3) set(at(x,y),pc[0],.8); } }
   else if(t==='spines'){ for(let k=0;k<7;k++){ const x=Math.round(x0+BW*(.15+R()*.7)), y=Math.round(y0+BH*(.3+R()*.6)); if(!inner(x,y)) continue; set(at(x,y),pc[0]); if(inner(x,y-1)) set(at(x,y-1),pc[1]); } }
   else if(t==='glass'){ for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){ if(!inner(x,y)) continue; const e=!inner(x-2,y); if(e&&y<y0+BH*.7) set(at(x,y),pc[0],.55); } }
   else if(t==='ghost'){ for(let y=y0;y<=y1;y++){ const t2=(y-y0)/Math.max(1,BH); const a=1-.45*Math.max(0,(t2-.35)/.65); for(let x=x0;x<=x1;x++){ const i=at(x,y); if(p[i+3]>128) p[i+3]=Math.round(p[i+3]*a); } } } }
  // 2) деталь: на «макушке тела» (ниже глаз-стебельков) или парит у правого бока
  if(S.det){ const d=S.det, dw=d.p[0].length, dh=d.p.length; let hx=Math.round((x0+x1)/2), hy=y0; const bw=Math.max(3,BW*.2|0);
   for(let y=y0;y<y1;y++){ let n=0; for(let x=hx-bw;x<=hx+bw;x++) if(body[y*w+x]) n++; if(n>=bw){ hy=y; break; } }
   let ox=hx-(dw>>1), oy=hy-dh+3; if(d.side){ ox=Math.min(w-dw-1,x1-2); oy=Math.max(1,y0+Math.round(BH*.35)-dh+((cx>>6)&1)); }
   for(let j=0;j<dh;j++)for(let i=0;i<dw;i++){ const ch=d.p[j][i]; if(ch==='.'||!d.pal[ch]) continue; const ii=at(ox+i,oy+j); if(ii<0) continue; const c=rgb(d.pal[ch]); p[ii]=c[0];p[ii+1]=c[1];p[ii+2]=c[2];p[ii+3]=255; } }
  // 3) один глаз цвета B: самое правое «белое» пятно, тёмные пиксели внутри его рамки
  { const seen=new Uint8Array(w*64); let best=null;
   for(let y=0;y<64;y++)for(let x=0;x<w;x++){ if(!eye[y*w+x]||seen[y*w+x]) continue; const st=[[x,y]], pts=[]; seen[y*w+x]=1; while(st.length){ const [qx,qy]=st.pop(); pts.push([qx,qy]); for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nx=qx+dx, ny=qy+dy; if(nx>=0&&ny>=0&&nx<w&&ny<64&&eye[ny*w+nx]&&!seen[ny*w+nx]){ seen[ny*w+nx]=1; st.push([nx,ny]); } } }
    if(pts.length>=6){ const mx=pts.reduce((s,q)=>s+q[0],0)/pts.length; if(!best||mx>best.mx) best={mx,pts}; } }
   if(best){ let ex0=1e9,ex1=-1,ey0=1e9,ey1=-1; for(const [qx,qy] of best.pts){ ex0=Math.min(ex0,qx);ex1=Math.max(ex1,qx);ey0=Math.min(ey0,qy);ey1=Math.max(ey1,qy); } const ic=rgb(S.iris);
    for(let y=ey0;y<=ey1;y++)for(let x=ex0;x<=ex1;x++){ const i=at(x,y); if(p[i+3]<128) continue; if(lumi(i)<70&&!eye[y*w+x]){ let l=0,r=0; for(let k=1;k<4;k++){ if(x-k>=0&&eye[y*w+x-k]) l=1; if(x+k<w&&eye[y*w+x+k]) r=1; } if(l||r){ const dk=lumi(i)<30?.7:1; p[i]=ic[0]*dk;p[i+1]=ic[1]*dk;p[i+2]=ic[2]*dk; } } } } }
  // 4) аура: контур 1px + мягкий 2-й, частицы B
  { const al=new Uint8Array(w*64); for(let y=0;y<64;y++)for(let x=0;x<w;x++) al[y*w+x]=p[at(x,y)+3]>128?1:0; const ac=rgb(S.aura); const near=(x,y,r)=>{ for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){ if(Math.abs(dx)+Math.abs(dy)>r) continue; const nx=x+dx, ny=y+dy; if(nx>=0&&ny>=0&&nx<w&&ny<64&&al[ny*w+nx]) return true; } return false; };
   const ring=[]; for(let y=1;y<63;y++)for(let x=1;x<w-1;x++){ if(al[y*w+x]) continue; if(near(x,y,1)) ring.push([x,y,1]); else if(near(x,y,2)) ring.push([x,y,2]); }
   for(const [x,y,r] of ring) set(at(x,y),ac,r===1?.9:.35);
   const PC=S.pc.map(rgb); let n=0; for(let k=0;k<60&&n<6;k++){ const x=1+(R()*(w-2)|0), y=1+(R()*62|0); if(al[y*w+x]||near(x,y,2)||!near(x,y,7)) continue; const c=PC[n%PC.length]; set(at(x,y),c); if(n%3===0&&y>1) set(at(x,y-1),c,.5); n++; } } } }
function makeHybrid(A,B){ const IW=1024,IH=320; const [c,x]=mk(IW,IH); x.drawImage(SPR[A.id],0,0); const da=x.getImageData(0,0,IW,IH);
 const [cb,xb]=mk(IW,IH); xb.drawImage(SPR[B.id],0,0); const db=xb.getImageData(0,0,IW,IH).data; const p=da.data;
 // палитра B (кадр idle 0), отсортированная по яркости
 const pal=[]; const seen=new Set(); for(let y=0;y<64;y++)for(let xx=0;xx<64;xx++){ const i=(y*IW+xx)*4; if(db[i+3]<200) continue; const L=lum(db[i],db[i+1],db[i+2]); if(L<45) continue; const k=db[i]<<16|db[i+1]<<8|db[i+2]; if(seen.has(k)) continue; seen.add(k); pal.push([L,db[i],db[i+1],db[i+2]]); }
 pal.sort((u,v)=>u[0]-v[0]); if(!pal.length) pal.push([128,...hex(B.col)]);
 // яркостный диапазон A
 let lo=255,hi=0; for(let i=0;i<p.length;i+=4){ if(p[i+3]<200) continue; const L=lum(p[i],p[i+1],p[i+2]); if(L<45||L>235) continue; lo=Math.min(lo,L); hi=Math.max(hi,L); }
 for(let i=0;i<p.length;i+=4){ if(p[i+3]<10) continue; const L=lum(p[i],p[i+1],p[i+2]); if(L<45||L>235) continue; // контур и блики оставляем
  const sat=Math.max(p[i],p[i+1],p[i+2])-Math.min(p[i],p[i+1],p[i+2]); if(sat<18&&L>150) continue; // белки глаз
  const t=(L-lo)/Math.max(1,hi-lo); const q=pal[Math.min(pal.length-1,Math.max(0,Math.round(t*(pal.length-1))))]; p[i]=q[1]; p[i+1]=q[2]; p[i+2]=q[3]; }
 // v3.1: макушка B больше НЕ пересаживается. Вместо неё — фирменная деталь, узор и аура B (FUSE_SPEC)
 const cells=[]; for(const k in ANIM){ const An=ANIM[k]; for(let f=0;f<An.n;f++) cells.push([f*An.w,An.row*64,An.w]); }
 const bbox=(d,cx,cy,w)=>{ let x0=1e9,x1=-1,y0=1e9,y1=-1; for(let y=0;y<64;y++)for(let xx=0;xx<w;xx++){ if(d[((cy+y)*IW+cx+xx)*4+3]>128){ if(xx<x0)x0=xx; if(xx>x1)x1=xx; if(y<y0)y0=y; if(y>y1)y1=y; } } return x1<0?null:[x0,y0,x1,y1]; };
 fuseDecorate(p,IW,cells,A,B);
 x.putImageData(da,0,0); return c; }
function drawFuse(){ drawBG(4,0,now); swipePager=null; const tp=TAP(); iconBtn(4,4,icBack,()=>{sfx('tap');scene='select';},'back');
 T('Слияние слизней',W/2,tp/2-9,16,['#fff','#7affe0']); T('выбери двух',W/2,tp/2+9,10,'#d8c8f0');
 const pool=CHARS.map((c,i)=>i).filter(i=>unlocked(i)); const cols=6, cw=Math.floor((W-16)/cols), chh=Math.max(TAP(),46);
 pool.forEach((i,k)=>{ const c=CHARS[i], x=8+(k%cols)*cw, y=tp+22+Math.floor(k/cols)*chh; const sel=fusePick.indexOf(i); const bad=fusePick.length===1&&sel<0&&fuseCheck(fusePick[0],i);
  panel(x+1,y,cw-2,chh-3,sel>=0?'#2a6a5a':bad?'#1a1020':'#2b1a4a'); if(bad) ctx.globalAlpha=.35; ctx.save(); ctx.beginPath(); ctx.rect(x+2,y+1,cw-4,chh-5); ctx.clip(); drawSlug(c.id,'idle',frameOf('idle',now+i*.3),x+cw/2,y+chh-8); ctx.restore(); ctx.globalAlpha=1;
  if(c.tap) T('ТАП',x+cw-3,y+2,9,'#4ef0ff','r'); if(sel>=0) T(sel===0?'A':'B',x+4,y+2,11,'#ffd23c','l');
  buttons.push({x,y,w:cw,h:chh-3,label:'f'+i,cb:()=>{ sfx('tap'); const j=fusePick.indexOf(i); if(j>=0){ fusePick.splice(j,1); return; } if(fusePick.length===1){ const why=fuseCheck(fusePick[0],i); if(why){ sfx('bounce',40); haptic('error'); floats.push({s:why,x:W/2-ox,y:H*.62-oy,t:0,life:1.4,size:11,col:'#ff8a9a'}); return; } } if(fusePick.length>=2) fusePick=[]; fusePick.push(i); haptic('tick'); }}); });
 const y0=tp+22+Math.ceil(pool.length/cols)*chh+8; const ph=Math.max(270,H-y0-tp-24); panel(10,y0,W-20,ph,'#22143e');
 if(fusePick.length<2){ T(fusePick.length?'теперь второй слизень':'первый даёт форму, второй — цвет и макушку',W/2,y0+ph/2-6,11,'#e8dcff');
  T('одна тап-способность на гибрида, пассивки складываются',W/2,y0+ph/2+12,10,'#a898c8'); }
 else { const F=fusedChar(fusePick[0],fusePick[1]); const A=CHARS[fusePick[0]],B=CHARS[fusePick[1]];
  T(F.name,W/2,y0+8,18,['#fff','#7affe0']); const ry=y0+70;
  drawSlug(A.id,'idle',frameOf('idle',now),W/2-80,ry); T('+',W/2-40,ry-26,16,'#fff'); drawSlug(B.id,'idle',frameOf('idle',now+.5),W/2,ry); T('=',W/2+40,ry-26,16,'#fff'); drawSlug(F.id,'idle',frameOf('idle',now),W/2+80,ry);
  const cy=ry+100; ctx.save(); ctx.translate(W/2,cy); ctx.scale(2,2); drawSlug(F.id,'idle',frameOf('idle',now),0,0); ctx.restore();
  T(F.perk,W/2,cy+54,11,F.col); T('прыгучесть '+Math.round(F.rest*100)+'% • сила '+Math.round(F.power*100)+'% • 1 уровень',W/2,cy+70,10,'#d8c8f0');
  btn(W/2-90,Math.min(H-tp-8,y0+ph+6),180,tp,'СЛИТЬ И ИГРАТЬ',()=>{ sfx('win'); haptic('success'); fusion={a:fusePick[0],b:fusePick[1],level:null,used:false}; fusePick=[]; scene='levels'; },'#4ed05a',14); }
 for(const f of floats){ const k=f.t/f.life; T(f.s,f.x+ox,f.y+oy-k*14,f.size,f.col); } }
function startLevel(i){ idleT=0; impStage=0; bubble=null; if(fusion&&!chaosRun){ if(fusion.level==null) fusion.level=i; else if(fusion.level!==i||fusion.used){ fusion=null; floats.push({s:'слияние распалось',x:LW/2,y:190,t:0,life:1.6,size:11,col:'#c8b8e0'}); } } curLevel=i; if(relayTeam&&!chaosRun){ relay={i:0,sw:0}; fusion=null; } else relay=null; world=new World(i,PC()); if(relay) world.shots+=1; wxP=[]; wxPrev=''; if(chaosRun){ world.shots+=2; world.mod=chaosRun.mod; world.comboMul=1.5; } const ti=themeOf(i); lvlCanvas=buildLevelCanvas(LV[i],ti); parts=[];decals=[];floats=[];overlay=null;drag=null;sAnim={a:'idle',t:0};
 scene='play'; tgBack(true); floats.push({s:LV[i].hint,x:LW/2,y:150,t:0,life:2.6,size:11,col:'#fff'});
 if(world.boss){ const B=BOSS[world.boss.k]; floats.push({s:'БОСС: '+B.name,x:LW/2,y:190,t:0,life:2.8,size:15,col:['#fff','#ff9a1c'],pop:1}); floats.push({s:B.mech,x:LW/2,y:214,t:0,life:2.8,size:11,col:'#ffe0c0'}); }
 if(world.wx){ const nm=WXN[world.wxNow]; floats.push({s:'Погода: '+nm[0],x:LW/2,y:world.boss?236:190,t:0,life:2.4,size:12,col:nm[1]}); }
 if(relay) floats.push({s:'ЭСТАФЕТА: '+relayTeam.map(j=>CHARS[j].name).join(' → '),x:LW/2,y:world.boss?258:212,t:0,life:2.6,size:11,col:'#ffb03c'}); }
function goBack(){ sfx('tap'); if(scene==='play'&&chaosRun){ chaosEnd(); return; } if(scene==='play'){scene='levels'; relay=null;} else if(scene==='fuse'||scene==='wardrobe'){scene='select';} else if(scene==='levels'){ if(relayTeam){ scene='relay'; } else scene='select';} else if(scene==='relay'){ relayTeam=null; scene='menu'; tgBack(false);} else if(scene==='select'||scene==='house'||scene==='bestiary'||scene==='quests'||scene==='settings'){scene='menu'; tgBack(false);} }
function burst(x,y,n,cols,sp=90,up=0,life=.6,g=300){ for(let i=0;i<n;i++){ const a=Math.random()*Math.PI*2, v=sp*(.3+Math.random()); parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-up,life:life*(.6+Math.random()*.6),t:0,c:cols[i%cols.length],g,s:Math.random()<.3?2:1}); } }
const COMBO_TXT=['','','ДВОЙНОЙ ШМЯК!','ТРОЙНОЙ ШМЯК!','МЕГАРИКОШЕТ!','УЛЬТРАШМЯК!','ШМЯК-ЛЕГЕНДА!','СЛИЗЕПОКАЛИПСИС!'];
const COMBO_COL=['','','#7affe0','#4ef0ff','#ffe066','#ff9a1c','#ff5aa8','#ff3a3a'];
function comboText(k){ return k<COMBO_TXT.length?COMBO_TXT[k]:'БОГ РИКОШЕТА ×'+k+'!'; }
function handleEvents(){ const ch=PC(); for(const e of world.ev){ const [k,x,y]=e;
 if(k==='bhit'){ const B=BOSS[e[4]]; sfx('bumper'); sfx('ouch'); haptic('heavy'); shake=Math.max(shake,4); flash=.06; burst(x,y,24,[B.col,'#fff','#ffd23c'],170,40,.7,0); floats.push({s:B.say[(3-e[3]+2)%3]||'Ай!',x:Math.max(50,Math.min(LW-50,x)),y:y-40,t:0,life:1.1,size:13,col:['#fff',B.col],pop:1}); }
 if(k==='bdown'){ const B=BOSS[e[3]]; sfx('win'); haptic('success'); shake=7; flash=.15; world.bossDown=true; burst(x,y,70,['#ffd23c','#fff','#ff4a8a','#4ef0ff',B.col],240,80,1.4,150); floats.push({s:B.name+' ПОВЕРЖЕН!',x:LW/2,y:Math.max(80,y-60),t:0,life:2.4,size:15,col:['#fff','#ffd23c'],pop:1}); floats.push({s:'+1500',x,y:y-20,t:0,life:1.6,size:14,col:'#fff6b0'}); qEv('boss'); }
 if(k==='bpoke'){ }
 if(k==='snowhit'){ sfx('splat'); burst(x,y,14,['#fff','#c8ecff'],110,20,.5,200); floats.push({s:'ХРУСТЬ!',x,y:y-16,t:0,life:.7,size:10,col:'#c8ecff'}); haptic('light'); }
 if(k==='spit'){ sfx('boing'); shake=4; burst(x,y,20,['#4ed05a','#8af08a','#fff'],150,60,.6); floats.push({s:'ТЬФУ!',x,y:y-24,t:0,life:.8,size:13,col:'#8af08a'}); }
 if(k==='shout'){ sfx('launch'); haptic('heavy'); shake=Math.max(shake,3); burst(x,y,20,['#fff','#ffe066',ch.col],160,0,.5,0); floats.push({s:'АААА!',x,y:y-28,t:0,life:.8,size:15,col:['#fff','#ff9a1c'],pop:1}); }
 if(k==='wxwarn'){ sfx('tick'); floats.push({s:'Погода меняется… '+(WXN[e[1]]||['?'])[0],x:LW/2,y:120,t:0,life:1.8,size:12,col:(WXN[e[1]]||['','#fff'])[1]}); }
 if(k==='wx'){ sfx('combo',3); haptic('medium'); flash=.06; floats.push({s:(WXN[e[1]]||['?'])[0]+'!',x:LW/2,y:150,t:0,life:1.5,size:17,col:['#fff',(WXN[e[1]]||['','#fff'])[1]],pop:1}); }
 if(k==='ghostpass') qEv('ghostpass');
 if(k==='combo'&&e[1]>=4) qEv('combo4'); if(k==='melt') qEv('melt'); if(k==='crate'&&world.has('crush')) qEv('crate'); if(k==='boing') qEv('boing'); if(k==='ab'&&e[1]==='djump') qEv('djump');
 if(k==='launch'){ save.stats.launches++; }
 if(k==='splat'){ save.stats.splats++; qEv('splat'); if(save.stats.splats>=100&&!save.eggs.master){ save.eggs.master=true; store(); setTimeout(()=>{ sfx('secret'); floats.push({s:'100 ШМЯКОВ! Ты — МАСТЕР ШМЯКА',x:LW/2,y:180,t:0,life:3,size:14,col:['#fff','#ffd23c'],pop:1}); },300); } }
 if(k==='candy'&&!chaosRun){ const add=world.has('lucky')?2:1; save.candy=(save.candy|0)+add; qEv('candy'); if(add>1) floats.push({s:'×2 удача!',x,y:y-28,t:0,life:.8,size:10,col:'#ffd23c'}); }
 if(k==='combo'){ const n=e[1]; sfx('combo',n); haptic(n>=4?'medium':'light'); floats=floats.filter(f=>!f.combo); const cs=Math.min(20,12+n*1.5), ct=comboText(n), hw=Math.min(LW/2-4,ct.length*cs*.44); floats.push({s:ct,x:Math.max(hw+4,Math.min(LW-hw-4,e[2])),y:Math.max(40,e[3]-34),t:0,life:1.1,size:ct.length*cs*.62>LW-8?Math.floor((LW-8)/(ct.length*.62)):cs,col:COMBO_COL[Math.min(n,7)]||'#ff3a3a',combo:1,pop:1});
  if(n>=4){ shake=Math.max(shake,1+n*.5); if(n>=5) flash=.08; } burst(e[2],e[3],6+n*3,[COMBO_COL[Math.min(n,7)]||'#fff','#fff'],90+n*20,0,.6,0); }
 if(k==='secret'){ sfx('secret'); haptic('success'); shake=Math.max(shake,3); burst(x,y,30,['#4ef0ff','#fff','#ff5aa8'],140,20,.8,0); floats.push({s:'ТАЙНИК ОТКРЫТ!',x:Math.max(60,Math.min(LW-60,x)),y:y-22,t:0,life:1.4,size:13,col:['#fff','#4ef0ff']}); }
 if(k==='gem'){ sfx('gem'); haptic('success'); flash=.1; burst(x,y,36,['#7affff','#2ab0e0','#fff'],160,40,1,0); if(!chaosRun&&!gemOf(curLevel)){ if(!Array.isArray(save.gems)) save.gems=[]; save.gems.push(curLevel); store(); world.gemNew=true; floats.push({s:'◆ САМОЦВЕТ '+gemsHave().length+'/'+SECRETS.length+'!',x:LW/2,y:Math.max(60,y-30),t:0,life:2,size:15,col:['#fff','#7affff'],pop:1}); } else floats.push({s:'◆ уже твой',x,y:y-20,t:0,life:1,size:11,col:'#7affff'}); }
 if(k==='combolost'){ floats.push({s:'комбо сгорело…',x:Math.max(60,Math.min(LW-60,x)),y:y-30,t:0,life:.9,size:11,col:'#c8b8e0'}); }
 if(k==='launch'){ sfx('launch'); haptic('medium'); burst(world.s.x,world.s.y+10,10,['#fff',ch.col],60,20,.4); shake=Math.max(shake,1.5); }
 if(k==='bounce'){ sfx('bounce',e[3]); squash=Math.min(1,e[3]/450); sqDir=[e[4],e[5]]; burst(x-e[4]*R,y-e[5]*R,4+(e[3]/80|0),[ch.col,'#fff'],e[3]*.25,0,.4); if(e[3]>300){shake=Math.max(shake,2);haptic('light');} }
 if(k==='boing'){ sfx('boing'); squash=1; sqDir=[0,-1]; burst(x,y+10,14,['#ff4fa8','#ff9ad0','#fff'],140,60,.6); if(e[3])e[3].hit=.3; shake=Math.max(shake,2); haptic('light'); }
 if(k==='splat'){ grafAdd(curLevel,x,y+R-2,ch.col,0); sfx('splat'); haptic('heavy'); shake=5; flash=.08; burst(x,y+10,26,[ch.col,ch.col,'#fff','#1a0c22'],170,80,.8); for(let i=0;i<7;i++) decals.push({x:x+(Math.random()*44-22)|0,y:y+R-1+(Math.random()*2|0),w:2+Math.random()*4|0,c:ch.col}); floats.push({s:['ШМЯК!','ПЛЮХ!','ХЛЮП!'][Math.random()*3|0],x,y:y-30,t:0,life:.9,size:14,col:['#fff','#ffd23c']}); sAnim={a:'splat',t:0}; }
 if(k==='candy'){ sfx('candy',e[3]); haptic('light'); burst(x,y,16,['#ffd23c','#fff','#ff4a8a','#4ef0b0'],120,40,.7,120); floats.push({s:'+'+e[3],x,y:y-14,t:0,life:.8,size:11,col:'#ffd23c'}); }
 if(k==='bumper'){ sfx('bumper'); burst(x,y,8,['#ff4a6a','#fff'],110,0,.4); shake=Math.max(shake,2.5); haptic('light'); }
 if(k==='portal'){ sfx('portal'); burst(x,y,14,['#7a5aff','#4ef0ff'],90,0,.5,0); burst(e[3],e[4],14,['#ffb03c','#ffe066'],90,0,.5,0); }
 if(k==='ouch'){ sfx('ouch'); haptic('error'); shake=5; burst(x,y,30,[ch.col,'#fff','#ff4a6a'],200,60,.8); floats.push({s:'АЙ! НА СТАРТ!',x,y:y-24,t:0,life:1,size:11,col:'#ff4a6a'}); }
 if(k==='respawn'){ burst(world.s.x,world.s.y,16,['#fff',ch.col],80,0,.5,0); sAnim={a:'recover',t:0}; }
 if(k==='rest'){ if(sAnim.a!=='splat'&&sAnim.a!=='recover') sAnim={a:'idle',t:0}; }
 if(k==='win'){ sfx('win'); haptic('success'); shake=3; burst(LV[curLevel].goal[0],LV[curLevel].goal[1]-20,50,['#ffd23c','#fff','#ff4a8a','#4ef0b0','#7a5aff'],220,120,1.4,200); setTimeout(()=>{ const st=1+world.got>3?3:Math.max(1,world.got); const stars=Math.min(3,Math.max(1,world.got)); const before=CHARS.filter((c,i)=>unlocked(i)).length; const sc=world.scoreNow()+(world.bossDown?1500:0); const lines=[]; if(fusion&&fusion.level===curLevel) fusion.used=true; if(chaosRun){ chaosWin(sc,lines); } else { if(!relay) save.stars[curLevel]=Math.max(save.stars[curLevel]||0,stars); if(!Array.isArray(save.score)) save.score=[]; const rec=!relay&&sc>(save.score[curLevel]||0); if(rec) save.score[curLevel]=sc; if((world.comboMax||0)>(save.combo||0)) save.combo=world.comboMax; save.wins=save.wins||{}; save.wins[curLevel]=(save.wins[curLevel]||0)+1;
 if(relay){ if(!Array.isArray(save.relay)) save.relay=[]; const rr=sc>(save.relay[curLevel]||0); if(rr) save.relay[curLevel]=sc; lines.push(['Эстафета: '+sc,'#ffb03c',14]); lines.push([rr?'РЕКОРД ЭСТАФЕТЫ!':'рекорд эстафеты: '+save.relay[curLevel],rr?'#ff5aa8':'#c8b8e0',11]); }
 else { lines.push(['Очки: '+sc,'#fff6b0',14]); if(rec) lines.push(['НОВЫЙ РЕКОРД!','#ff5aa8',13]); else lines.push(['рекорд: '+save.score[curLevel],'#c8b8e0',11]); if((world.comboMax||0)>=2) lines.push(['лучшее комбо: ×'+world.comboMax,'#7affe0',11]); } if(world.gemNew) lines.push(['◆ самоцвет найден!','#4ef0ff',12]); }
 v4Win(lines,stars);
 store(); const nu=CHARS.filter((c,i)=>unlocked(i)).slice(before); overlay={k:'win',stars,phrase:WINS[Math.random()*WINS.length|0],nu,lines}; overlayT=0; },900); }

 if(k==='ab'){ const a=e[1]; const col={djump:'#7aa0e8',split:'#3a8aff',chute:'#fff',dive:'#ffe066',ghost:'#b8dcff',gflip:'#ff7a80'}[a]||'#fff';
  burst(e[2],e[3],18,[col,'#fff',ch.col],130,0,.5,0); haptic('medium');
  if(a==='djump'){ sfx('launch'); } else if(a==='split'){ sfx('portal'); floats.push({s:'ДВОЕ!',x:e[2],y:e[3]-26,t:0,life:.8,size:11,col:'#fff'}); } else if(a==='chute'){ sfx('tap'); } else if(a==='dive'){ sfx('bumper'); flash=.06; shake=2; floats.push({s:'БАХ!',x:e[2],y:e[3]-26,t:0,life:.7,size:12,col:'#ffe066'}); } else if(a==='ghost'){ sfx('portal'); } else if(a==='gflip'){ sfx('boing'); } }
 if(k==='poofclone'){ burst(x,y,12,[ch.col,'#fff'],70,0,.4,0); }
 if(k==='button'){ sfx('candy',3); haptic('medium'); shake=2; burst(x,y,12,['#4ed05a','#fff'],90,30,.5); floats.push({s:'ДВЕРЬ ОТКРЫТА!',x,y:y-20,t:0,life:1.1,size:10,col:'#4ed05a'}); }
 if(k==='shield'){ sfx('ouch'); burst(x,y,22,['#a8e0f0','#fff'],160,40,.6); floats.push({s:'ДЗЫНЬ! Стекло спасло',x,y:y-24,t:0,life:1.1,size:10,col:'#a8e0f0'}); }
 if(k==='refund'){ floats.push({s:'бросок вернули',x,y:y-40,t:0,life:1.1,size:9,col:'#e8e2d8'}); }
 if(k==='melt'){ sfx('splat'); burst(x,y,24,['#8ad0ff','#fff','#c8ecff'],110,30,.7); floats.push({s:'ТАЕТ!',x,y:y-14,t:0,life:.8,size:10,col:'#c8ecff'}); }
 if(k==='crate'){ sfx('splat'); shake=Math.max(shake,3); haptic('medium'); burst(x,y,26,['#b8783c','#8a5428','#d89a58','#2a1408'],170,80,.8,400); floats.push({s:'ХРЯСЬ!',x,y:y-14,t:0,life:.8,size:11,col:'#ffd23c'}); }
 if(k==='juicy'){ floats.push({s:'+1 бросок',x,y:y-28,t:0,life:.9,size:9,col:'#ff6070'}); }
 if(k==='stick'){ grafAdd(curLevel,x+(x<LW/2?-R+2:R-2),y,ch.col,x<LW/2?1:2); sfx('bounce',100); burst(x,y,8,[ch.col,'#fff'],60,0,.3,0); sAnim={a:'idle',t:0}; }
 } world.ev.length=0; }

let FIXDT=0; // только для записи видео/тестов
function update(dt){ if(FIXDT) dt=FIXDT; now+=dt; shake=Math.max(0,shake-dt*20); flash=Math.max(0,flash-dt); squash=Math.max(0,squash-dt*5); overlayT+=dt;
 gyroTick(dt); micTick(dt); if(scene==='play'&&world&&!overlay){ world.tilt=gyro.ax; relayTick(); wxFX(dt); const n=4, sd=((world.slow&&world.s.st==='fly')?dt*.33:dt)*(world.mod&&world.mod.ts||1); if(chaosRun) chaosTick(dt); for(let i=0;i<n;i++) world.step(sd/n); handleEvents(); impTick(dt);
  const s=world.s; sAnim.t+=dt;
  if(s.st==='splat'){ if(sAnim.a!=='splat'&&sAnim.a!=='recover') sAnim={a:'splat',t:0}; if(sAnim.a==='splat'&&sAnim.t>.3+.35){ sAnim={a:'recover',t:0}; } if(sAnim.a==='recover'&&sAnim.t>.72){ s.st='idle'; sAnim={a:'idle',t:0}; } }
  else if(s.st==='fly') { if(sAnim.a!=='fly') sAnim={a:'fly',t:0}; }
  else if(s.st==='idle'&&sAnim.a==='recover'&&sAnim.t>.72) sAnim={a:'idle',t:0};
  else if(s.st==='idle'&&sAnim.a==='fly') sAnim={a:'idle',t:0};
  if(s.st==='idle'&&world.shots<=0&&!world.result&&!drag&&!world.clone){ world.result='fail'; setTimeout(()=>{ if(scene==='play'&&world.result==='fail'){ sfx('fail'); haptic('error'); overlay={k:'fail',phrase:FAILS[Math.random()*FAILS.length|0]}; if(chaosRun){ chaosRun.lives--; overlay.over=chaosRun.lives<=0; overlay.sub=overlay.over?'Жизни кончились! Счёт: '+chaosRun.score:'−1 жизнь, осталось '+chaosRun.lives; } overlayT=0; } },700); }
  if(s.st==='fly'&&Math.random()<.5) parts.push({x:s.x+(Math.random()*8-4),y:s.y+(Math.random()*8-4),vx:0,vy:0,life:.35,t:0,c:PC().col,g:0,s:1,trail:1});
 }
 for(const p of parts){ p.t+=dt; p.vy+=p.g*dt; p.x+=p.vx*dt; p.y+=p.vy*dt; } parts=parts.filter(p=>p.t<p.life);
 for(const f of floats) f.t+=dt; floats=floats.filter(f=>f.t<f.life);
 if(scene==='menu') for(const m of menuSlugs){ m.vy+=500*dt; m.y+=m.vy*dt; m.x+=m.vx*dt; if(m.y>m.gy){ m.y=m.gy; if(m.vy>200){ m.sq=1; } m.vy=0; m.vx=0; if(Math.random()<dt*.6){ m.vy=-180-Math.random()*120; m.vx=(Math.random()-.5)*60; m.flip=m.vx<0; } } if(m.x<20)m.x=20; if(m.x>W-20)m.x=W-20; m.sq=Math.max(0,(m.sq||0)-dt*4); }
}
function frameOf(a,t){ const A=ANIM[a]; const f=Math.floor(t*1000/A.ms); return (a==='idle'||a==='fly')?f%A.n:Math.min(A.n-1,f); }

function drawPlay(){ const s=world.s, ti=themeOf(curLevel), th=THEMES[ti], ch=PC();
 drawBG(ti,s.x-LW/2,now);
 const sx=(Math.random()-.5)*shake*2|0, sy=(Math.random()-.5)*shake*2|0;
 ctx.save(); ctx.translate(ox+sx,oy+sy);
 // рамка поля
 ctx.fillStyle='rgba(0,0,0,.25)'; ctx.fillRect(-3,-3,LW+6,LH+6); ctx.fillStyle=th.out; ctx.fillRect(-2,-2,LW+4,2); ctx.fillRect(-2,LH,LW+4,2); ctx.fillRect(-2,0,2,LH); ctx.fillRect(LW,0,2,LH);
 ctx.fillStyle=th.ui; ctx.globalAlpha=.5; ctx.fillRect(-1,-1,LW+2,1); ctx.globalAlpha=1;
 ctx.fillStyle='rgba(8,2,20,.18)'; ctx.fillRect(0,0,LW,LH); ctx.drawImage(lvlCanvas,0,0); { const gc=grafCanvas(curLevel); if(gc){ ctx.globalAlpha=overlay&&overlay.k==='grafview'?1:.85; ctx.drawImage(gc,0,0); ctx.globalAlpha=1; } }
 for(const d of decals){ ctx.fillStyle='#1a0c22'; ctx.fillRect(d.x-1,d.y-1,d.w+2,3); ctx.fillStyle=d.c; ctx.fillRect(d.x,d.y-1,d.w,2); }
 for(const w of world.water) drawWater(w,now); for(const f of world.fans) drawFan(f,now);
 for(const o of world.solids){ if(!o.alive) continue; if(o.type==='c') drawCrate(o); else if(o.type==='i') drawIce(o); else if(o.type==='d') drawDoor(o); else if(o.type==='v') drawConv(o,now); else if(o.type==='b'&&o.hit>0){ ctx.fillStyle='#fff'; ctx.globalAlpha=o.hit*2; ctx.fillRect(o.x,o.y-1,o.w,2); ctx.globalAlpha=1; } }
 for(const o of world.solids) if(o.alive&&o.type==='h'&&o.arg!=='shell') drawSecretDoor(o,now,(world.L.sec||{}).style);
 if(world.gem&&!world.gem.got) drawGem(world.gem.x,world.gem.y,now,gemOf(curLevel)&&!chaosRun);
 for(const b of world.buttons) drawButton(b);
 for(const m of world.movers) mover(m);
 for(const b of world.bumpers) bumper(b,now);
 for(const p of world.portals){ portal(p[0],p[1],now,0); portal(p[2],p[3],now,1); }
 jar(world.L.goal[0],world.L.goal[1],now,world.result==='win');
 world.candies.forEach((c,i)=>{ if(!c.got) candy(c.x,c.y,now,i); }); drawBoss();
 for(const p of parts) if(p.trail){ ctx.globalAlpha=1-p.t/p.life; ctx.fillStyle=p.c; ctx.fillRect(p.x|0,p.y|0,1,1);} ctx.globalAlpha=1;
 // траектория
 if(drag&&s.st==='idle'){ let dx=drag.cx-drag.x0, dy=drag.cy-drag.y0; const l=Math.hypot(dx,dy); if(l>8){
   const pts=[]; if(world.has('preview')){ const key=(dx|0)+','+(dy|0); if(!drawPlay.pc||drawPlay.pc.k!==key){ const w=world.snapshot(); w.launch(dx,dy); const pp=[]; for(let i=0;i<300&&w.s.st==='fly'&&!w.result;i++){ w.step(1/120); if(i%2===0) pp.push([w.s.x,w.s.y]); } drawPlay.pc={k:key,pp}; } pts.push(...drawPlay.pc.pp.filter((_,i)=>i%2===0)); }
   else { const k=Math.min(l,MAXDRAG)/l, v=560*K*ch.power/MAXDRAG; const iv=world.mod&&world.mod.inv?-1:1; let vx=-dx*k*v*iv, vy=-dy*k*v*iv, px=s.x, py=s.y; const gg=G0*ch.grav*(world.has('glide')?.5:1)*(world.mod&&world.mod.g||1);
    for(let i=0;i<60;i++){ vy+=gg/60; px+=vx/60; py+=vy/60; if(px<0||px>LW||py>LH||py<0) break; let hit=false; for(const o of world.solids) if(o.alive&&px>o.x&&px<o.x+o.w&&py>o.y&&py<o.y+o.h) hit=true; if(hit)break; if(i%3===1) pts.push([px,py]); } }
   pts.forEach(([px,py],i)=>{ const a=1-i/pts.length, z=i<8?3:2; ctx.globalAlpha=Math.max(.35,a); ctx.fillStyle='#1a0c22'; ctx.fillRect((px|0)-1,(py|0)-1,z+2,z+2); ctx.fillStyle=i%2?ch.col:'#fff'; ctx.fillRect(px|0,py|0,z,z); ctx.globalAlpha=1; }); } }
 // слизень
 if(s.st!=='poof'){ let a=sAnim.a, f=frameOf(a,sAnim.t), flip=false, scx=(world.mod&&world.mod.size)||1, scy=scx, dx=s.x+impJitter(), dy=s.y-3; if(impStage===3&&a==='idle'){ scy=1-.06*Math.abs(Math.sin(now*9)); scx=2-scy; }
  if(drag&&s.st==='idle'){ const ddx=drag.cx-drag.x0, ddy=drag.cy-drag.y0, l=Math.min(1,Math.hypot(ddx,ddy)/MAXDRAG); a='pull'; f=Math.round(l*7); flip=ddx>0; }
  if(a==='fly'){ flip=s.vx<0; const q=squash*.35, z=(world.mod&&world.mod.size)||1; scx=(1+q)*z; scy=(1-q)*z; if(Math.abs(sqDir[0])>.6){scx=(1-q)*z;scy=(1+q)*z;} }
  if(s.st==='win'){ const k=Math.max(0,1-world.s.at); }
  // тень
  ctx.fillStyle='rgba(0,0,0,.25)'; ctx.fillRect(s.x-10|0,(s.y+R)|0,20,2);
  if(world.result==='win'){ const g=world.L.goal; const k=Math.max(.15,1-overlayT*0); }
  if(s.ghost>0) ctx.globalAlpha=.45;
  if(s.chute&&s.st==='fly') drawChute(s.x,s.y);
  if(s.gs<0&&s.st==='fly'){ ctx.save(); ctx.translate(Math.round(dx),Math.round(dy)); ctx.scale(1,-1); drawSlugC(ch.id,a,f,0,-8,flip); ctx.restore(); } else drawSlugC(ch.id,a,f,dx,dy,flip,scx,scy);
  ctx.globalAlpha=1;
  if(s.hover&&s.st==='idle'&&world.shots>0){ T('тяни!',s.x,s.y-46+Math.sin(now*6)*2,9,'#fff'); }
  if(s.wall&&s.st==='idle'){ ctx.fillStyle=ch.col; ctx.fillRect(s.x-1|0,s.y+8|0,3,4); } }
 if(world.clone){ const c=world.clone; drawSlugC(ch.id,'fly',frameOf('fly',now+.2),c.x,c.y-3,c.vx<0); }
 for(const p of parts) if(!p.trail){ ctx.fillStyle=p.c; ctx.fillRect(p.x|0,p.y|0,p.s,p.s); }
 drawWeather(); drawNight(); { let cy=4; if(chaosRun&&oy+LH+4>H-30) cy=34; drawWxChip(cy); relayHud(cy); const by2=(world.wx||relay)?cy+28:cy;
  if(world.boss&&!world.boss.dead&&!world.result){ const B=BOSS[world.boss.k]; ctx.fillStyle='rgba(12,4,24,.55)'; ctx.fillRect(4,by2,LW-8,22); T('БОСС: '+B.name,10,by2+3,11,'#ffb03c','l'); for(let i=0;i<3;i++){ const hx=LW-40+i*11, on=i<world.boss.hp; ctx.fillStyle='#1a0c22'; ctx.fillRect(hx-1,by2+6,9,8); ctx.fillStyle=on?'#ff4a6a':'#4a3a5a'; ctx.fillRect(hx,by2+7,3,2); ctx.fillRect(hx+4,by2+7,3,2); ctx.fillRect(hx,by2+9,7,2); ctx.fillRect(hx+1,by2+11,5,1); ctx.fillRect(hx+2,by2+12,3,1); } }
  if(mic.on){ ctx.fillStyle='#1a0c22'; ctx.fillRect(LW-10,LH-60,6,52); ctx.fillStyle=mic.lvl>.16?'#ff3a3a':'#4ed05a'; const mh=Math.min(50,Math.round(mic.lvl*300)); ctx.fillRect(LW-9,LH-9-mh,4,mh); } }
 for(const f of floats){ const k=f.t/f.life; const yy=f.y-k*14; if(k>.75&&((f.t*20|0)%2)) continue; const sz=f.pop?Math.round(f.size*(1+Math.max(0,.35-f.t)*1.6)):f.size; T(f.s,f.x,yy,sz,f.col); }
 drawBubble(); if((world.combo||0)>=2&&s.st==='fly'){ T('×'+world.combo,s.x+18,s.y-30,14,COMBO_COL[Math.min(world.combo,7)]||'#ff3a3a','l'); }
 ctx.restore();
 if(flash>0){ ctx.fillStyle='rgba(255,255,255,.35)'; ctx.fillRect(0,0,W,H); }
 // HUD
 const tp=TAP(), roomy=oy>=tp+8, hy=roomy?oy-tp-6:2; if(!roomy) ctx.globalAlpha=.8;
 iconBtn(4,hy,icBack,()=>goBack(),'back'); iconBtn(8+tp,hy,icRetry,()=>{sfx('tap');startLevel(curLevel);},'retry');
 iconBtn(W-4-tp,hy,icMute,()=>{setMute(!save.mute);},'mute'); iconBtn(W-8-2*tp,hy,icPause,()=>{sfx('tap');openPause();},'pause'); ctx.globalAlpha=1;
 const midW=W-4*tp-28; const nm=(curLevel+1)+'. '+world.L.name; T(nm.length*7>midW?nm.slice(0,Math.max(4,midW/7|0))+'…':nm,W/2,hy+1,12,'#fff');
 const total=world.shots, ns=world.L.shots+(ch.extra||0); const bx=W/2-(ns*9)/2;
 for(let i=0;i<ns;i++){ const on=i<total; const x=bx+i*9+4|0, y=hy+20; ctx.fillStyle='#1a0c22'; ctx.fillRect(x-3,y-1,8,7); ctx.fillStyle=on?ch.col:'#3a2a52'; ctx.fillRect(x-2,y,6,5); if(on){ctx.fillStyle='#fff';ctx.fillRect(x-1,y+1,1,1);} }
 for(let i=0;i<3;i++) starIcon(W/2-11+i*10+4,hy+31,i<world.got);
 if(drawPlay.hud) drawPlay.hud(hy,tp);
}
function drawMenu(){ drawBG(0,Math.sin(now*.2)*30,now);
 const gy=H-60; ctx.fillStyle='#2a1838'; ctx.fillRect(0,gy+16,W,H-gy);
 themeOfCur=0; if(!bgCache.menuGround){ const [c,x]=mk(W,60); blockPaint(x,[-2,0,W+4,60],THEMES[0],'g',5); bgCache.menuGround=c; } ctx.drawImage(bgCache.menuGround,0,gy+16);
 for(const m of menuSlugs){ const a=m.vy<0||m.y<m.gy-1?'fly':'idle'; drawSlug(m.id,a,frameOf(a,now+m.o),m.x,m.y,m.flip,1+(m.sq||0)*.25,1-(m.sq||0)*.25); }
 // логотип
 const title='ШМЯКОДРОМ'; const ty=Math.floor(H*.2);
 let x0=W/2- title.length*14/2; const glyphs=[...title];
 let tw=0; const cs=glyphs.map(g=>txt(g,26,['#fff6b0','#ffd23c','#ff9a1c','#ff5a3c'],'#2a0c22')); cs.forEach(c=>tw+=c.width-3); x0=W/2-tw/2;
 cs.forEach((c,i)=>{ const b=Math.round(Math.sin(now*4+i*.6)*3); ctx.drawImage(c,Math.round(x0),ty+b); x0+=c.width-3; });
 T('слизни-рогатки',W/2,ty+44,13,'#7affe0');
 const tp=TAP(), by=Math.floor(H*.42); btn(W/2-75,by,150,tp+2,'ИГРАТЬ',()=>{sfx('tap');scene='levels';tgBack(true);},'#4ed05a',18);
 btn(W/2-75,by+tp+10,150,tp,'СЛИЗНИ',()=>{sfx('tap');scene='select';tgBack(true);},'#ff5aa8',15); let my=by+2*tp+22; if(drawMenu.extra) my=drawMenu.extra(my,tp);
 iconBtn(W-4-TAP(),4,icMute,()=>setMute(!save.mute),'mute');
 T('тяни • целься • шмякай',W/2,my+4,12,'#fff3d8');
 const tot=save.stars.reduce((a,b)=>a+(b||0),0); const s1=tot+' / '+LV.length*3; starIcon(W/2-68,my+27,true); T(s1,W/2-58,my+24,12,'#ffd23c','l'); T('◆ '+gemsHave().length+'/'+SECRETS.length,W/2+30,my+24,12,'#7affff','l'); if(save.legacy) T('+'+save.legacy+' ★ из старой версии',W/2,my+44,10,'#d8c8f0');
}
const totalStars=()=>save.stars.reduce((a,b)=>a+(b||0),0)+(save.legacy|0);
const levelStars=()=>save.stars.reduce((a,b)=>a+(b||0),0);
const isOpen=i=>i===0||i<(save.open|0)||(save.stars[i-1]||0)>0;
const unlocked=i=>totalStars()>=CHARS[i].cost;
let selPage=0, lvlPage=0; const silCache={};
function silhouette(id){ if(silCache[id]) return silCache[id]; const [c,x]=mk(64,64); x.drawImage(SPR[id],0,0,64,64,0,0,64,64); x.globalCompositeOperation='source-atop'; x.fillStyle='#1a1030'; x.fillRect(0,0,64,64); silCache[id]=c; return c; }
let swipePager=null;
function pager(y,page,pages,set,lbl){ if(pages<2) return; const tp=Math.max(44,TAP()); swipePager={page,pages,set};
 btn(8,y,tp,tp-4,'‹',()=>{sfx('tap');set((page+pages-1)%pages);},'#6a4fd8',22); buttons[buttons.length-1].label=lbl+'p';
 btn(W-8-tp,y,tp,tp-4,'›',()=>{sfx('tap');set((page+1)%pages);},'#6a4fd8',22); buttons[buttons.length-1].label=lbl+'n';
 const dw=Math.min(12,Math.floor((W-2*tp-40)/pages)); for(let i=0;i<pages;i++){ const xx=Math.round(W/2-pages*dw/2+i*dw); ctx.fillStyle='#1a0c22'; ctx.fillRect(xx-1,y+tp/2-6,dw-2,dw-2); ctx.fillStyle=i===page?'#ffd23c':'#5a4a7a'; ctx.fillRect(xx,y+tp/2-5,dw-4,dw-4);} }
function drawSelect(){ drawBG(1,0,now); swipePager=null; const tp=TAP(); T('Выбери слизня',W/2,tp/2-9,16,['#fff','#ff8fc8']); T('★ '+totalStars(),W-8,tp/2-6,11,'#ffd23c','r');
 iconBtn(4,4,icBack,()=>goBack(),'back');
 const per=12, pages=Math.ceil(CHARS.length/per); if(selPage>=pages) selPage=0;
 const cols=3, cw=Math.floor((W-24)/cols), chh=Math.max(54,Math.min(76,Math.floor((H-200)/4)));
 for(let k=0;k<per;k++){ const i=selPage*per+k; if(i>=CHARS.length) break; const c=CHARS[i], x=12+(k%cols)*cw, y=tp+10+Math.floor(k/cols)*chh, sel=i===selPick, op=unlocked(i);
  panel(x+2,y,cw-4,chh-4,sel?'#5a2a8a':op?'#2b1a4a':'#1e1430'); if(sel){ ctx.fillStyle=c.col; ctx.fillRect(x+3,y+1,cw-6,2);} 
  ctx.save(); ctx.beginPath(); ctx.rect(x+3,y+1,cw-6,chh-6); ctx.clip();
  const sy=y+chh-26; if(op) (sel?drawSlugC:drawSlug)(c.id,sel?'fly':'idle',frameOf(sel?'fly':'idle',now+i*.37),x+cw/2,sy); else ctx.drawImage(silhouette(c.id),Math.round(x+cw/2-32),Math.round(sy-40));
  ctx.restore();
  if(op) T(c.name,x+cw/2,y+chh-17,10,sel?'#ffd23c':'#fff'); else { T('★ '+c.cost,x+cw/2,y+chh/2-10,11,'#ffd23c'); T('???',x+cw/2,y+chh-17,9,'#8a7aa8'); }
  buttons.push({x,y,w:cw,h:chh-4,label:'c'+i,cb:()=>{ if(!unlocked(i)){ sfx('bounce',40); haptic('error'); floats.push({s:'Нужно ★ '+c.cost,x:x+cw/2-ox,y:y-oy+10,t:0,life:1,size:10,col:'#ffd23c'}); return; } selPick=i; useSecret=false; save.char=i; store(); sfx('candy',i%4); haptic('tick'); }}); }
 const py=tp+10+4*chh+2; pager(py,selPage,pages,v=>selPage=v,'sel');
 const c=PC(); const dy=py+Math.max(44,tp)+4; panel(12,dy,W-24,48,'#2b1a4a'); ctx.fillStyle=c.col; ctx.fillRect(13,dy+1,3,46);
 T(c.name,22,dy+5,13,['#fff','#ffd23c'],'l'); T(c.perk,22,dy+21,11,c.col,'l'); T(c.desc,22,dy+34,10,'#e8dcff','l'); if(c.tap) T('ТАП',W-18,dy+6,9,'#4ef0ff','r');
 btn(W/2-70,Math.min(H-tp-4,dy+58),140,tp,'ПОГНАЛИ',()=>{sfx('tap');scene='levels';},'#4ed05a',16); if(drawSelect.extra) drawSelect.extra(dy+58+tp+10,tp);
 for(const f of floats){ const k=f.t/f.life; T(f.s,f.x+ox,f.y+oy-k*14,f.size,f.col); }
}
drawSelect.extra=(y,tp)=>{ const ok=totalStars()>=FUSE_STARS; y=Math.min(H-tp-4,y); if(save.eggs.secret){ btn(W/2+76,Math.min(H-tp-4,y-tp-10),W/2-84,tp,useSecret?'✦ ШМЯКС':'ШМЯКС',()=>{ sfx('secret'); useSecret=!useSecret; fusion=null; },useSecret?'#ffb03c':'#5a3a8a',12); buttons[buttons.length-1].label='secretpick'; } btn(W/2+4,y,130,tp,'ГАРДЕРОБ',()=>{sfx('tap');scene='wardrobe';},'#c04a9a',13); buttons[buttons.length-1].label='wardrobe'; btn(W/2-134,y,130,tp,ok?'СЛИЯНИЕ':'слияние ★'+FUSE_STARS,()=>{ if(!ok){ sfx('bounce',40); haptic('error'); return; } sfx('tap'); fusePick=[]; scene='fuse'; },ok?'#2ab0a0':'#4a3a5a',13); buttons[buttons.length-1].label='fuse'; };
let lvlPageInit=false;
function drawLevels(){ drawBG(2,0,now); swipePager=null; const tp=TAP(); iconBtn(4,4,icBack,()=>goBack(),'back');
 const pages=Math.ceil(LV.length/10);
 if(!lvlPageInit){ lvlPageInit=true; let f=0; while(f<LV.length-1&&(save.stars[f]||0)>0) f++; lvlPage=Math.floor(f/10); }
 if(lvlPage>=pages) lvlPage=pages-1;
 const w0=lvlPage*10, ti=themeOf(w0), wcol=['#ff9a5c','#ff5aa8','#4ea0ff','#7ac8e8','#5ac05a'][ti];
 let ws=0; for(let i=w0;i<w0+10;i++) ws+=save.stars[i]||0;
 T('Мир '+(lvlPage+1),W/2,4,11,'#d8c8f0'); T(WORLDS[lvlPage]||'',W/2,20,16,['#fff',wcol]);
 T('★ '+ws+'/30',W-8,8,11,'#ffd23c','r'); T('◆ '+gemsHave().length+'/'+SECRETS.length,8+TAP()+6,14,11,'#7affff','l'); T('всего '+totalStars(),W-8,24,10,'#e8d8ff','r');
 const cols=2, cw=Math.floor((W-24)/cols), top=Math.max(48,tp+8), chh=Math.max(48,Math.min(84,Math.floor((H-170)/5)));
 for(let k=0;k<10;k++){ const i=w0+k; if(i>=LV.length) break; const x=12+(k%cols)*cw+2, y=top+Math.floor(k/cols)*chh; const open=isOpen(i); const st=save.stars[i]||0; const boss=k===9;
  const col=open?(boss?'#ffb03c':wcol):'#4a3a5a';
  btn(x,y,cw-4,chh-8,'',open?()=>{sfx('tap');startLevel(i);}:()=>{sfx('bounce',50);haptic('error');},col); buttons[buttons.length-1].label='L'+i;
  const pr=pressed&&pressed.label==='L'+i?2:0;
  if(open){ T(String(i+1),x+8,y+5+pr,15,'#fff','l'); const nm=LV[i].name||''; T(nm.length>21?nm.slice(0,20)+'…':nm,x+8,y+28+pr,11,'#fff','l'); const scv=(save.score||[])[i]; if(scv) T(scv+' оч.',x+8,y+chh-26+pr,10,'#fff6b0','l');
   for(let q=0;q<3;q++) starIcon(x+cw-62+q*18,y+10+pr,q<st,2); if(boss) T('БОСС',x+cw-12,y+chh-26+pr,10,'#fff6b0','r'); if(LV[i].sec) T(gemOf(i)?'◆':'◇',x+cw-12,y+chh-26+pr,12,gemOf(i)?'#7affff':'#c8e8ff','r'); }
  else { ctx.fillStyle='#1a0c22'; const lx=x+(cw-4)/2|0, ly=y+(chh-8)/2-4|0; ctx.fillRect(lx-5,ly,11,9); ctx.fillRect(lx-3,ly-5,7,6); ctx.fillStyle='#4a3a5a'; ctx.fillRect(lx-1,ly-3,3,4); ctx.fillStyle='#ffd23c'; ctx.fillRect(lx-4,ly+1,9,7); ctx.fillStyle='#1a0c22'; ctx.fillRect(lx,ly+3,1,3); T(String(i+1),x+8,y+5,12,'#8a7aa8','l'); } }
 pager(top+5*chh,lvlPage,pages,v=>lvlPage=v,'lv');
 const c=PC(); drawSlugC(c.id,'idle',frameOf('idle',now),W/2-40,H-22); T((fusion?'Гибрид: ':'Играет: ')+c.name,W/2-14,H-44,11,fusion?'#7affe0':'#fff','l'); if(fusion){ btn(8,H-tp-6,tp,tp,'×',()=>{sfx('tap');fusion=null;},'#a04a6a',18); buttons[buttons.length-1].label='unfuse'; } T(c.perk,W/2-14,H-28,10,c.col,'l');
 btn(W-96,H-tp-6,88,tp,'',()=>{sfx('tap');scene='select';},'#ff5aa8'); buttons[buttons.length-1].label='chg'; T('сменить',W-52,H-tp/2-13,12,'#fff');
}
function openPause(){ if(!world||world.result||overlay) return; drag=null; overlay={k:'pause'}; overlayT=1; }
function drawOverlay(){ const k=Math.min(1,overlayT*4); if(overlay.k!=='grafview'){ ctx.fillStyle=`rgba(12,4,24,${.6*k})`; ctx.fillRect(0,0,W,H); }
 const tp=TAP(); if(overlay.k==='pause'){ drawPause(tp); return; } if(overlay.k==='grafview'){ ctx.fillStyle='rgba(12,4,24,.55)'; ctx.fillRect(0,0,W,Math.max(tp+12,oy)); T('Граффити: '+(((save.graf||{})[curLevel]||[]).length)+' шмяков',W/2,4,14,['#fff','#ffb0d8']); T('тапни, чтобы вернуться',W/2,22,10,'#e8d8ff'); buttons.push({x:0,y:0,w:W,h:H,label:'gvback',cb:()=>{overlay={k:'pause'};}}); return; }
 const win=overlay.k==='win'; const extra=win?(overlay.lines||[]).length*16:0;
 const pw=Math.min(W-20,260), ph=(win?150:120)+tp+extra, px=(W-pw)/2|0, py=Math.floor(H/2-ph/2+(1-k)*40);
 panel(px,py,pw,ph,win?'#3a1f6a':'#4a1a3a'); const bw=(pw-36)/2|0;
 if(win){ T('ПОБЕДА!',W/2,py+8,20,['#fff6b0','#ffd23c','#ff9a1c']); T(overlay.phrase,W/2,py+36,11,'#7affe0');
  for(let i=0;i<3;i++){ const on=i<overlay.stars&&overlayT>.4+i*.3; if(on&&!pops[i]){pops[i]=1; sfx('star',i); burst(W/2-30+i*30-ox,py+64-oy,10,['#ffd23c','#fff'],80,0,.5,0); }
   const sc=on?Math.max(1,2.2-(overlayT-.4-i*.3)*4):1; ctx.save(); ctx.translate(W/2-30+i*30,py+64); ctx.scale(sc>1.01?Math.round(sc*2)/2:1,sc>1.01?Math.round(sc*2)/2:1); ctx.scale(2,2); starIcon(0,0,on,2); ctx.restore(); }
  let ly=py+86; for(const L of (overlay.lines||[])){ T(L[0],W/2,ly,L[2]||12,L[1]||'#fff'); ly+=16; }
  if(overlay.nu&&overlay.nu.length){ const c=overlay.nu[0]; T('Новый слизень: '+c.name+'!',W/2,ly+2,11,'#4ef0ff'); }
  else if(curLevel===LV.length-1&&!chaosRun) T('Все уровни пройдены!',W/2,ly+2,11,'#ffd23c');
  const byy=py+ph-tp-10;
  if(chaosRun){ btn(px+12,byy,pw-24,tp,'ДАЛЬШЕ',()=>{sfx('tap');chaosNext();},'#4ed05a',15); return; }
  btn(px+12,byy,bw,tp,'ЕЩЁ',()=>{sfx('tap');startLevel(curLevel);},'#6a4fd8',15);
  if(curLevel<LV.length-1) btn(px+pw-12-bw,byy,bw,tp,'ДАЛЬШЕ',()=>{sfx('tap');startLevel(curLevel+1);},'#4ed05a',15); else btn(px+pw-12-bw,byy,bw,tp,'МЕНЮ',()=>{sfx('tap');scene='menu';tgBack(false);},'#4ed05a',15);
 } else { T(overlay.phrase,W/2,py+12,16,['#fff','#ff8fc8']); drawSlug(PC().id,'splat',5,W/2,py+62); T(overlay.sub||'Броски кончились. Ещё разок?',W/2,py+84,11,'#e8d8ff');
  const byy=py+ph-tp-10;
  if(chaosRun){ btn(px+12,byy,pw-24,tp,overlay.over?'ИТОГИ':'ДАЛЬШЕ',()=>{sfx('tap');chaosAfterFail();},'#4ed05a',15); return; }
  btn(px+12,byy,bw,tp,'ЗАНОВО',()=>{sfx('tap');startLevel(curLevel);},'#4ed05a',15); btn(px+pw-12-bw,byy,bw,tp,'УРОВНИ',()=>{sfx('tap');scene='levels';},'#6a4fd8',15); }
}
let lastScene='menu';
function render(){ buttons=[]; ctx.imageSmoothingEnabled=false; textClear(); if(scene!==lastScene){ lastScene=scene; floats=floats.filter(f=>f.t<.05); }
 if(scene==='menu') drawMenuV4(); else if(scene==='select') drawSelect(); else if(scene==='levels') drawLevels(); else if(scene==='fuse') drawFuse(); else if(scene==='wardrobe') drawWardrobe(); else if(scene==='house') drawHouse(); else if(scene==='bestiary') drawBestiary(); else if(scene==='quests') drawQuests(); else if(scene==='settings') drawSettings(); else if(scene==='relay') drawRelayPick(); else if(scene==='play'){ const b0=buttons.length; drawPlay(); if(overlay){ buttons.splice(b0); textClear(); drawOverlay(); } }
 if(scene!=='play'||!overlay) pops=[];
 // частицы меню поверх
 if(scene!=='play') for(const p of parts){ ctx.fillStyle=p.c; ctx.fillRect(p.x+ox|0,p.y+oy|0,p.s,p.s); }
}

let chaosRun=null; let chaosNext=function(){}, chaosAfterFail=function(){}, chaosWin=function(){};
// ---------- B10: ХАОС-РЕЖИМ ----------
const CHAOS_STARS=15, CHAOS_T=10, CHAOS_WARN=3;
const MODS=[
 {id:'moon',name:'ЛУНА',sub:'гравитация ×0.45',col:'#e8f0ff',g:.45},
 {id:'heavy',name:'ТЯЖЕСТЬ',sub:'гравитация ×1.6',col:'#ff9a5c',g:1.6},
 {id:'windl',name:'ВЕТЕР ←',sub:'сдувает влево',col:'#8ad8ff',wind:-260},
 {id:'windr',name:'ВЕТЕР →',sub:'сдувает вправо',col:'#8ad8ff',wind:260},
 {id:'mega',name:'МЕГА-БАТУТ',sub:'батуты ×1.5',col:'#ff5aa8',pad:1.5},
 {id:'sticky',name:'ЛИПУЧКА',sub:'никаких отскоков',col:'#c8e040',sticky:1},
 {id:'slow',name:'СЛОУ-МО',sub:'время ×0.55',col:'#62acff',ts:.55},
 {id:'turbo',name:'ТУРБО',sub:'время ×1.5',col:'#ff3a3a',ts:1.5},
 {id:'mirror',name:'ЗЕРКАЛО',sub:'рогатка наоборот',col:'#d0b0ff',inv:1},
 {id:'giant',name:'ВЕЛИКАН',sub:'только вид, не хитбокс',col:'#ffd23c',size:1.6},
 {id:'tiny',name:'КРОШКА',sub:'только вид, не хитбокс',col:'#7affe0',size:.6}];
function chaosPick(not){ const pool=MODS.filter(m=>!not||m.id!==not.id&&!(m.size&&not.size)); return pool[Math.random()*pool.length|0]; }
function chaosStart(){ chaosRun={lives:3,score:0,n:0,t:0,nextAt:CHAOS_T,mod:null,next:chaosPick(null),last:-1,best:0}; fusion=null; chaosNext(); }
function chaosLevel(){ const pool=[]; for(let i=0;i<LV.length;i++) if((save.stars[i]||0)>0) pool.push(i); const P=pool.length>=5?pool:Array.from({length:30},(_,i)=>i); let li; do{ li=P[Math.random()*P.length|0]; }while(P.length>1&&li===chaosRun.last); return li; }
chaosNext=function(){ if(!chaosRun) return; const li=chaosLevel(); chaosRun.last=li; startLevel(li); };
chaosWin=function(sc,lines){ const add=Math.round(sc*1.5); chaosRun.score+=add; chaosRun.n++; lines.push(['+'+add+' (×1.5)','#fff6b0',14]); lines.push(['Забег: '+chaosRun.score+' • уровней '+chaosRun.n,'#ffb0ff',11]); };
chaosAfterFail=function(){ if(!chaosRun) return; if(overlay&&overlay.over){ chaosEnd(); return; } chaosNext(); };
function chaosEnd(){ const r=chaosRun; chaosRun=null; if(!save.chaos||typeof save.chaos!=='object') save.chaos={best:0,runs:0,lvls:0}; save.chaos.runs++; const rec=r.score>save.chaos.best; if(rec) save.chaos.best=r.score; save.chaos.lvls=Math.max(save.chaos.lvls||0,r.n); store();
 overlay=null; scene='menu'; tgBack(false); floats.push({s:(rec?'РЕКОРД ХАОСА! ':'Хаос: ')+r.score,x:W/2-ox,y:H*.33-oy,t:0,life:3,size:16,col:['#fff','#ff5aff'],pop:1}); }
function chaosTick(dt){ const c=chaosRun; c.t+=dt; if(c.t>=c.nextAt){ c.mod=c.next; c.next=chaosPick(c.mod); c.nextAt+=CHAOS_T; if(world){ world.mod=c.mod; } sfx('combo',4); haptic('medium'); shake=Math.max(shake,3); flash=.08; floats.push({s:c.mod.name+'!',x:LW/2,y:220,t:0,life:1.3,size:20,col:['#fff',c.mod.col],pop:1}); }
 else if(c.nextAt-c.t<=CHAOS_WARN){ const k=Math.ceil(c.nextAt-c.t); if(k!==c.lastTick){ c.lastTick=k; sfx('tick'); } } }
drawPlay.hud=(hy,tp)=>{ if(!chaosRun) return; const c=chaosRun; const y=oy+LH+4>H-30?oy+4:oy+LH+6; const inField=y===oy+4;
 if(inField) { ctx.fillStyle='rgba(12,4,24,.6)'; ctx.fillRect(ox,y-2,LW,30); }
 T('ХАОС',ox+6,y,12,['#fff','#ff5aff'],'l'); T('♥'.repeat(c.lives)+'♡'.repeat(Math.max(0,3-c.lives)),ox+52,y,12,'#ff4a6a','l'); T(String(c.score),ox+LW-6,y,12,'#fff6b0','r');
 const left=c.nextAt-c.t, frac=Math.max(0,Math.min(1,left/CHAOS_T)); ctx.fillStyle='#1a0c22'; ctx.fillRect(ox+4,y+17,LW-8,6); ctx.fillStyle=left<=CHAOS_WARN?((now*8|0)%2?'#ff3a3a':'#ffd23c'):(c.mod?c.mod.col:'#7a5aff'); ctx.fillRect(ox+5,y+18,Math.round((LW-10)*frac),4);
 if(c.mod) T(c.mod.name+' — '+c.mod.sub,ox+LW/2,y+26,10,c.mod.col);
 if(left<=CHAOS_WARN&&!overlay){ const k=Math.ceil(left); const p=1+(1-(left%1))*.3; T('через '+k+'… '+c.next.name,ox+LW/2,oy+120,Math.round(15*p),['#fff',c.next.col]); } };
drawMenu.extra=(my,tp)=>{ const ok=totalStars()>=CHAOS_STARS; btn(W/2-75,my,150,tp,ok?'ХАОС':'ХАОС ★'+CHAOS_STARS,()=>{ if(!ok){ sfx('bounce',40); haptic('error'); floats.push({s:'Хаос откроется на ★'+CHAOS_STARS,x:W/2-ox,y:my-oy-8,t:0,life:1.4,size:11,col:'#ffd23c'}); return; } sfx('win'); chaosStart(); },ok?'#c03ad0':'#4a3a5a',16); buttons[buttons.length-1].label='chaos';
 if(save.chaos&&save.chaos.best) T('рекорд хаоса: '+save.chaos.best,W/2,my+tp+4,10,'#ffb0ff'); return my+tp+(save.chaos&&save.chaos.best?26:12); };

function drawPause(tp){ const pw=Math.min(W-20,260), ph=tp*3+90+(drawPause.h?drawPause.h(tp):0), px=(W-pw)/2|0, py=Math.floor(H/2-ph/2); panel(px,py,pw,ph,'#2b1a4a'); T('ПАУЗА',W/2,py+10,20,['#fff','#ffd23c']);
 btn(px+12,py+44,pw-24,tp,'ПРОДОЛЖИТЬ',()=>{sfx('tap');overlay=null;},'#4ed05a',16); const bw=(pw-36)/2|0;
 btn(px+12,py+54+tp,bw,tp,'ЗАНОВО',()=>{sfx('tap');startLevel(curLevel);},'#6a4fd8',15); btn(px+pw-12-bw,py+54+tp,bw,tp,chaosRun?'ВЫЙТИ':'УРОВНИ',()=>{sfx('tap'); if(chaosRun){ chaosEnd(); return; } overlay=null;scene='levels';},'#6a4fd8',15); if(drawPause.extra) drawPause.extra(px,py+64+2*tp,pw,tp); }
let grafConfirm=0;
drawPause.rows=[]; drawPause.h=tp=>drawPause.rows.reduce((a,r)=>a+r.h(tp),0);
drawPause.extra=(px,y,pw,tp)=>{ for(const r of drawPause.rows){ r.draw(px,y,pw,tp); y+=r.h(tp); } };
drawPause.rows.push({h:tp=>tp+26,draw:(px,y,pw,tp)=>{ const n=((save.graf||{})[curLevel]||[]).length; T('Граффити уровня: '+n+'/'+GRAF_CAP,px+pw/2,y,11,'#ffb0d8'); const bw=(pw-36)/3|0, yy=y+16;
 btn(px+12,yy,bw,tp,save.grafOff?'ВЫКЛ.':'ВКЛ.',()=>{sfx('tap');save.grafOff=!save.grafOff;store();},save.grafOff?'#6a5a7a':'#c04a9a',13); buttons[buttons.length-1].label='grafon';
 btn(px+18+bw,yy,bw,tp,'СМОТРЕТЬ',()=>{sfx('tap');overlay={k:'grafview'};overlayT=0;},'#6a4fd8',11); buttons[buttons.length-1].label='grafview';
 const conf=now-grafConfirm<2.5; btn(px+24+2*bw,yy,bw,tp,conf?'ТОЧНО?':'СТЕРЕТЬ',()=>{ if(!n) return; if(now-grafConfirm<2.5){ grafClear(curLevel); grafConfirm=0; sfx('splat'); floats.push({s:'стёрто!',x:LW/2,y:300,t:0,life:1,size:12,col:'#ffb0d8'}); } else { grafConfirm=now; sfx('tap'); } },conf?'#e04a4a':'#8a3a5a',conf?13:11); buttons[buttons.length-1].label='grafclr'; }});
drawPause.rows.push({h:tp=>LV[curLevel]&&LV[curLevel].sec&&!chaosRun?44:0,draw:(px,y,pw,tp)=>{ const sc=LV[curLevel]&&LV[curLevel].sec; if(!sc||chaosRun) return; const got=gemOf(curLevel); const won=(save.stars[curLevel]||0)>0;
 T(got?'◆ Тайник найден':'◇ Здесь есть тайник',px+pw/2,y+4,11,'#7affff'); const kc=CHARS.find(c=>c.id===sc.key);
 T(got||won?'Ключ: '+kc.name+(unlocked(CHARS.indexOf(kc))?'':' (ещё закрыт)'):sc.riddle,px+pw/2,y+20,sc.riddle.length>40&&!(got||won)?9:10,'#d8f8ff'); }});
// =================== v4 ===================
// ---------- даты / пасхалки по календарю ----------
let DATE_OVR=null; const today=()=>DATE_OVR?new Date(DATE_OVR):new Date();
const dayKey=d=>d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate();
const isApril1=()=>{ const d=today(); return d.getMonth()===3&&d.getDate()===1; };
const isHalloween=()=>{ const d=today(), m=d.getMonth(), q=d.getDate(); return (m===9&&q>=25)||(m===10&&q<=1); };
const isNewYear=()=>{ const d=today(), m=d.getMonth(), q=d.getDate(); return (m===11&&q>=25)||(m===0&&q<=7); };
const SET=()=>save.set;
const isNight=()=>{ const n=SET().night; if(n==='on') return true; if(n==='off') return false; const h=today().getHours(); return h>=20||h<6; };
// ---------- 14: вибро по слизню ----------
// [лёгкий, средний, сильный, множитель, узор]
const HAPT={slug01:['soft','soft','medium',.8,'bouncy'],slug34:['soft','medium','medium',1,'flat'],slug36:['rigid','rigid','heavy',1,'spiky'],slug41:['light','medium','medium',1,'roll'],slug53:['medium','heavy','heavy',1.6,'thud'],
 slug02:['light','rigid','heavy',1.1,'jet'],slug03:['soft','light','medium',.9,'lick'],slug04:['soft','soft','light',.6,'buzz'],slug05:['soft','soft','light',.5,'drip'],slug06:['soft','soft','medium',.7,'squish'],
 slug39:['light','light','medium',1,'double'],slug43:['light','medium','heavy',1.2,'warm'],slug44:['soft','light','medium',.8,'wrap'],slug45:['light','light','medium',.8,'flap'],slug46:['light','light','medium',.9,'buzz'],
 slug47:['soft','medium','heavy',1.3,'thunder'],slug48:['rigid','rigid','heavy',1.1,'spiky'],slug49:['rigid','medium','heavy',1,'glass'],slug50:['light','rigid','medium',1,'disco'],slug51:['soft','medium','medium',1,'juicy'],
 slug52:['soft','soft','soft',.4,'ghost'],slug54:['rigid','medium','heavy',1,'flip'],slugX:['rigid','heavy','heavy',1.2,'lucky']};
const PAT={bouncy:[8,40,6],flat:[18],spiky:[6,20,6,20,6],roll:[12,15,12],thud:[45],jet:[10,10,25],lick:[6,30,14],buzz:[4,8,4,8,4,8,4],drip:[5,60,5],squish:[20,10,8],double:[10,30,10],warm:[30],wrap:[8,20,8],flap:[6,40,6,40],
 thunder:[15,20,50],glass:[4,10,4],disco:[8,20,8,20,8,20],juicy:[14,20,20],ghost:[3],flip:[12,40,24],lucky:[10,20,10,20,40]};
let hLast=null;
function haptic(kind){ if(save.set&&save.set.vib===false) return; const ch=(typeof PC==='function'&&scene==='play')?PC():null; const id=ch?(ch.fuse?CHARS[ch.fuse[0]].id:ch.id):'slug01'; const P=HAPT[id]||HAPT.slug01;
 let style=kind; if(kind==='light') style=P[0]; else if(kind==='medium') style=P[1]; else if(kind==='heavy') style=P[2];
 let pat; if(kind==='success') pat=[20,60,20,60,40]; else if(kind==='error') pat=[50,40,50]; else if(kind==='tick') pat=[5]; else { const base=PAT[P[4]]||[10]; const s=(kind==='heavy'?1.6:kind==='medium'?1:.6)*P[3]; pat=base.map((v,i)=>i%2?v:Math.max(2,Math.round(v*s))); }
 hLast={kind,style,pat,id,via:inTG?'tg':'vibrate'};
 if(inTG){ try{ const h=tg.HapticFeedback; if(!h) return; if(kind==='success'||kind==='error') h.notificationOccurred(kind); else if(kind==='tick') h.selectionChanged(); else h.impactOccurred(style); return; }catch(e){} }
 try{ if(navigator.vibrate) navigator.vibrate(pat); }catch(e){} }
// ---------- 12: гироскоп ----------
const gyro={on:false,g:0,ax:0,msg:'',events:0,tried:false};
function onOri(e){ let g=e&&e.gamma; if(g==null||!isFinite(g)) return; gyro.events++; gyro.g=g; }
function gyroStop(){ try{ window.removeEventListener('deviceorientation',onOri); }catch(e){} try{ if(tg&&tg.DeviceOrientation&&gyro.tgOn){ tg.DeviceOrientation.stop(); gyro.tgOn=false; } }catch(e){} gyro.on=false; gyro.ax=0; gyro.g=0; }
function gyroStart(){ gyro.tried=true; gyro.msg='';
 const fail=m=>{ gyroStop(); gyro.msg=m; SET().gyro=false; store(); };
 const attach=()=>{ gyro.on=true; gyro.events=0; window.addEventListener('deviceorientation',onOri);
  try{ if(tg&&tg.DeviceOrientation&&tg.isVersionAtLeast&&tg.isVersionAtLeast('8.0')){ tg.DeviceOrientation.start({refresh_rate:60},ok=>{ if(ok) gyro.tgOn=true; }); tg.onEvent('deviceOrientationChanged',()=>{ const gm=tg.DeviceOrientation.gamma; if(gm!=null){ gyro.events++; gyro.g=Math.abs(gm)<3.3?gm*180/Math.PI:gm; } }); } }catch(e){}
  setTimeout(()=>{ if(gyro.on&&!gyro.events) fail('датчик наклона молчит — выключен'); },1600); };
 try{ if(typeof DeviceOrientationEvent==='undefined'&&!(tg&&tg.DeviceOrientation)){ fail('нет датчика наклона'); return; }
  if(typeof DeviceOrientationEvent!=='undefined'&&typeof DeviceOrientationEvent.requestPermission==='function'){ DeviceOrientationEvent.requestPermission().then(r=>{ if(r==='granted') attach(); else fail('наклон не разрешён'); }).catch(()=>fail('наклон не разрешён')); }
  else attach(); }catch(e){ fail('наклон недоступен'); } }
function gyroTick(dt){ const tgt=gyro.on?Math.max(-1,Math.min(1,gyro.g/30))*70:0; gyro.ax+=(tgt-gyro.ax)*Math.min(1,dt*8); if(Math.abs(gyro.ax)<1.5) gyro.ax=0; }
// ---------- 13: крик в микрофон ----------
const mic={on:false,lvl:0,msg:'',an:null,buf:null,stream:null,tried:false,cd:0};
function micStop(){ try{ if(mic.stream) mic.stream.getTracks().forEach(t=>t.stop()); }catch(e){} mic.stream=null; mic.an=null; mic.on=false; mic.lvl=0; }
function micStart(){ mic.tried=true; mic.msg=''; const fail=m=>{ micStop(); mic.msg=m; SET().mic=false; store(); };
 try{ if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){ fail('микрофон недоступен'); return; } audioInit();
  navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:false}}).then(st=>{ if(!SET().mic){ st.getTracks().forEach(t=>t.stop()); return; } mic.stream=st; try{ const src=AC.createMediaStreamSource(st); mic.an=AC.createAnalyser(); mic.an.fftSize=512; mic.buf=new Float32Array(512); src.connect(mic.an); mic.on=true; }catch(e){ fail('микрофон недоступен'); } }).catch(()=>fail('микрофон не разрешён')); }catch(e){ fail('микрофон недоступен'); } }
function micTick(dt){ mic.cd=Math.max(0,mic.cd-dt); if(!mic.on||!mic.an) return; try{ mic.an.getFloatTimeDomainData(mic.buf); let s=0; for(const v of mic.buf) s+=v*v; const r=Math.sqrt(s/mic.buf.length); mic.lvl=Math.max(r,mic.lvl*.9); }catch(e){} 
 if(scene==='play'&&world&&!overlay&&mic.lvl>.16&&mic.cd<=0&&world.shout()){ mic.cd=1.2; } }
// ---------- 11: ежедневные задания ----------
const QUESTS=[
 {id:'combo4',t:'Сделай комбо ×4',n:1,rw:20},{id:'candy',t:'Собери 10 конфет',n:10,rw:10},{id:'win',t:'Пройди 3 уровня',n:3,rw:15},
 {id:'melt',t:'Лампой растопи 3 льдины',n:3,rw:20,need:'melt'},{id:'win_slowmo',t:'Пройди уровень Капелькой',n:1,rw:15,need:'slowmo'},{id:'crate',t:'Кактусом сломай 2 ящика',n:2,rw:20,need:'crush'},
 {id:'boss',t:'Победи любого босса',n:1,rw:30,needBoss:1},{id:'relaywin',t:'Пройди уровень эстафетой',n:1,rw:20},{id:'feed',t:'Покорми слизней 3 раза',n:3,rw:10},
 {id:'pet',t:'Погладь слизней 10 раз',n:10,rw:10},{id:'wxwin',t:'Пройди уровень в непогоду',n:1,rw:20,needWx:1},{id:'win3star',t:'Пройди уровень на 3★',n:1,rw:15},
 {id:'hybwin',t:'Пройди уровень гибридом',n:1,rw:25,needFuse:1},{id:'chaoswin',t:'Пройди 2 уровня в хаосе',n:2,rw:25,needChaos:1},{id:'ghostpass',t:'Призраком пролети сквозь блок',n:1,rw:20,need:'ghost'},
 {id:'djump',t:'Рюкзачком сделай 5 доп. прыжков',n:5,rw:15,need:'djump'},{id:'splat',t:'Шмякнись 5 раз',n:5,rw:10},{id:'boing',t:'Отскочи от батута 8 раз',n:8,rw:10}];
function questAvail(q){ if(q.need){ const i=CHARS.findIndex(c=>c.ab===q.need); if(i<0||!unlocked(i)) return false; } if(q.needBoss&&!isOpen(9)) return false; if(q.needWx&&!isOpen(2)) return false;
 if(q.needFuse&&totalStars()<FUSE_STARS) return false; if(q.needChaos&&totalStars()<CHAOS_STARS) return false; return true; }
function questsToday(){ const k=dayKey(today()); let Q=save.quests; if(!Q||Q.day!==k){ let sd=k%2147483647||1; const r=()=>(sd=(sd*16807)%2147483647)/2147483647; const pool=QUESTS.filter(questAvail); const ids=[];
  while(ids.length<3&&ids.length<pool.length){ const q=pool[r()*pool.length|0]; if(!ids.includes(q.id)) ids.push(q.id); } Q=save.quests={day:k,ids,prog:ids.map(()=>0),got:ids.map(()=>false)}; store(); } return Q; }
function qEv(id,n=1){ if(id!=='feed'&&id!=='pet'&&!world) return; const Q=questsToday(); const i=Q.ids.indexOf(id); if(i<0||Q.got[i]) return; const q=QUESTS.find(x=>x.id===id); const was=Q.prog[i]; Q.prog[i]=Math.min(q.n,Q.prog[i]+n); if(Q.prog[i]!==was) store();
 if(was<q.n&&Q.prog[i]>=q.n){ sfx('secret'); haptic('success'); const msg={s:'Задание выполнено!',x:LW/2,y:110,t:0,life:2,size:14,col:['#fff','#7affe0'],pop:1}; if(scene==='play') floats.push(msg); else { msg.x=W/2-ox; msg.y=H*.3-oy; floats.push(msg); } } }
const questReady=()=>{ const Q=questsToday(); return Q.ids.filter((id,i)=>!Q.got[i]&&Q.prog[i]>=QUESTS.find(q=>q.id===id).n).length; };
// ---------- 10: бестиарий ----------
const BIO={slug01:['Родилась в банке с вареньем.','Мечтает стать батутом.','любит: прыгать'],slug34:['Ворчит, даже когда спит.','Растекается по любому поводу.','любит: лежать'],slug36:['Колючий снаружи, мягкий внутри.','Шипы ему щекотно.','любит: кактусы'],
 slug41:['Глазурь — его гордость.','Катится быстрее, чем думает.','любит: какао'],slug53:['Горячий парень с тёплым сердцем.','Однажды растопил сковородку.','любит: вулканы'],slug02:['Собрал рюкзак из банки газировки.','Пилотское удостоверение — фальшивое.','любит: облака'],
 slug03:['Язык длиннее, чем терпение.','Лизнул все стены Шмякодрома.','любит: мороженое'],slug04:['Носит кепку с пропеллером с рождения.','Летает, если не думать о падении.','любит: ветер'],slug05:['Видит мир в замедленной съёмке.','Пьёт только росу.','любит: дождик'],
 slug06:['Впитала знания всего океана.','Не умеет тонуть. Пробовала.','любит: ванны'],slug39:['Двое в одном, спорят оба.','Никто не знает, кто старший.','любит: зеркала'],slug43:['Светится от счастья (и от лавы).','Работает ночником по выходным.','любит: тёплый чай'],
 slug44:['Три тысячи лет в бинтах.','Ещё не нашёл ножницы.','любит: пирамиды'],slug45:['Прыгает только с парашютом.','Даже с табуретки.','любит: высоту'],slug46:['Дружит с пчелой Жужей.','Конфеты сами липнут к нему.','любит: мёд'],
 slug47:['Хмурится — пойдёт ливень.','Улыбнётся — будет радуга.','любит: грозы'],slug48:['Никто не обнимает. Сам виноват.','Поливают раз в месяц.','любит: пустыню'],slug49:['Живёт в банке, но выходит гулять.','Крышку носит как шлем.','любит: соленья'],
 slug50:['Танцует, даже когда стоит.','Видит будущее в отражениях.','любит: 80-е'],slug51:['Сладкий, как и его мечты.','Семечки — для красоты.','любит: лето'],slug52:['Проходит сквозь стены и проблемы.','Пугает только из вежливости.','любит: чердаки'],
 slug54:['Полоски — для скорости.','Иногда падает вверх.','любит: потолки'],slugX:['Никто не знает, откуда он взялся.','Говорят, приносит удачу.','любит: секреты']};
const hybKey=(a,b)=>a+'_'+b; const hybList=()=>Array.isArray(save.hyb)?save.hyb:(save.hyb=[]);
let HYB_ALL=null; function hybAll(){ if(HYB_ALL) return HYB_ALL; HYB_ALL=[]; for(let a=0;a<22;a++)for(let b=0;b<22;b++) if(!fuseCheck(a,b)) HYB_ALL.push([a,b]); return HYB_ALL; }
function hybDiscover(a,b){ const k=hybKey(a,b), L=hybList(); if(L.includes(k)) return false; L.push(k); store(); return true; }
// ---------- 17: секретный слизень ----------
const SECRET={id:'slugX',name:'Шмякс',perk:'Везунчик',desc:'Конфеты ×2, удача ×3',col:'#ffd23c',ab:'lucky',rest:.62,fric:.8,power:1.05,grav:1,splat:1.2,cost:0,secret:1};
let useSecret=false;
function buildSecretSprite(){ const im=SPR.slug41; if(!im||SPR.slugX) return; const [c,x]=mk(1024,320); x.drawImage(im,0,0); const D=x.getImageData(0,0,1024,320), p=D.data; let sd=99; const r=()=>(sd=(sd*16807)%2147483647)/2147483647;
 const PAL=[[40,10,70],[90,30,140],[150,70,210],[90,180,255],[200,240,255]];
 for(let i=0;i<p.length;i+=4){ if(p[i+3]<10) continue; const L=lum(p[i],p[i+1],p[i+2]), sat=Math.max(p[i],p[i+1],p[i+2])-Math.min(p[i],p[i+1],p[i+2]); if(sat<20&&L>200) continue; if(L<40) continue; const q=PAL[Math.min(4,Math.floor(L/56))]; p[i]=q[0];p[i+1]=q[1];p[i+2]=q[2]; if(r()<.02){ p[i]=255;p[i+1]=230;p[i+2]=120; } }
 x.putImageData(D,0,0); SPR.slugX=c; }
let logoTaps=[];
function logoTap(){ logoTaps=logoTaps.filter(t=>now-t<3); logoTaps.push(now); sfx('candy',logoTaps.length%4); haptic('tick'); burst(W/2-ox,Math.floor(H*.2)+10-oy,6,['#ffd23c','#fff'],80,30,.5);
 if(logoTaps.length>=7){ logoTaps=[]; const was=!!save.eggs.secret; save.eggs.secret=true; store(); sfx('secret'); haptic('success'); flash=.15; burst(W/2-ox,H*.25-oy,60,['#ffd23c','#b48cff','#4ef0ff','#fff'],220,60,1.2,0);
  floats.push({s:was?'Шмякс уже с тобой ✦':'✦ СЕКРЕТНЫЙ СЛИЗЕНЬ: ШМЯКС! ✦',x:W/2-ox,y:H*.33-oy,t:0,life:3,size:15,col:['#fff','#ffd23c'],pop:1}); if(!was) initMenuSlugs(); } }
// ---------- 17: аксессуары-пасхалки ----------
const EGG_ITEMS={
 santa:{id:'santa',pal:{a:'#e02a3a',b:'#ff6a6a',w:'#ffffff',o:'#1a0c22'},p:['......oo...','.....owwo..','....oaao...','...oaabo...','..oaaaao...','.oaaaaabo..','owwwwwwwwo.','owwwwwwwwo.','.oooooooo..']},
 pumpkin:{id:'pumpkin',pal:{a:'#ff8a1c',b:'#ffb85a',c:'#3a8a2a',d:'#1a0c22',o:'#5a2a08'},p:['....cc.....','...occo....','.ooaaoaao..','oabaaaabao.','oaadaadaao.','oaaaaaaaao.','oadadadaao.','.oaaaaaao..','..oooooo...']}};
for(const k in EGG_ITEMS){ const it=EGG_ITEMS[k]; const w=Math.max(...it.p.map(r=>r.length)); it.p=it.p.map(r=>r.padEnd(w,'.')); }
function drawAcc(id,anim,f,x,y,flip,it,kind,sx=1,sy=1){ const A=anchors(id); if(!A) return; const a=A[anim]&&A[anim][f]; if(!a) return; const c=pixItem(it); const px=anim==='pull'?96:32, py=40;
 ctx.save(); ctx.translate(Math.round(x),Math.round(y)); if(flip) ctx.scale(-1,1); if(sx!==1||sy!==1){ ctx.translate(0,16); ctx.scale(sx,sy); ctx.translate(0,-16); }
 if(kind==='face'){ ctx.drawImage(c,Math.round((it.mouth&&a.mx!=null?a.mx+(a.ex-a.mx)*.35:a.ex)-px-c.width/2),Math.round((it.mouth&&a.by?a.ey+(a.by-a.ey)*it.mouth+2:a.ey)-py-c.height/2)); }
 else ctx.drawImage(c,Math.round(a.hx-px-c.width/2),Math.round(a.hy-py-c.height+2)); ctx.restore(); }
function drawSlugM(id,anim,f,x,y,flip,sx,sy){ drawSlug(id,anim,f,x,y,flip,sx,sy); if(isApril1()) drawAcc(id,anim,f,x,y,flip,COSI.face[0],'face',sx,sy); if(isNewYear()) drawAcc(id,anim,f,x,y,flip,EGG_ITEMS.santa,'head',sx,sy); else if(isHalloween()) drawAcc(id,anim,f,x,y,flip,EGG_ITEMS.pumpkin,'head',sx,sy); }
// ---------- 8: погода — визуал ----------
const WXN={'wind+':['ВЕТЕР →','#8ad8ff'],'wind-':['← ВЕТЕР','#8ad8ff'],rain:['ДОЖДЬ · скользко','#62acff'],ice:['ГОЛОЛЁД','#c8ecff'],clear:['ЯСНО','#ffe066']};
let wxP=[], wxFade=0, wxPrev='';
function wxFX(dt){ const w=world.wxNow; if(!world.wx){ wxP=[]; return; } if(w!==wxPrev){ wxPrev=w; wxFade=0; } wxFade=Math.min(1,wxFade+dt*1.5);
 const want=w==='rain'?90:w==='ice'?50:(w==='wind+'||w==='wind-')?34:0; let n=wxP.filter(p=>!p.dead).length; const dir=(world.wind||0)/170;
 while(n<want){ n++; const t=w; wxP.push({k:t==='rain'?'r':t==='ice'?'s':(Math.random()<.25?'l':'w'),x:Math.random()*(LW+80)-40,y:Math.random()*LH*(wxP.length<want?1:0)-10,v:.6+Math.random()*.6,ph:Math.random()*6,c:['#7fd64a','#ffb03c','#e85a3a'][Math.random()*3|0]}); }
 for(const p of wxP){ if(p.k==='r'){ p.y+=520*p.v*dt; p.x+=(dir*120-30)*dt; if(p.y>LH){ if(Math.random()<.4) parts.push({x:p.x,y:LH-2,vx:(Math.random()-.5)*40,vy:-50,life:.25,t:0,c:'#a8d8ff',g:300,s:1}); p.dead=w!=='rain'; p.y=-10; p.x=Math.random()*(LW+80)-40; } }
  else if(p.k==='s'){ p.y+=40*p.v*dt; p.x+=(Math.sin(now*1.5+p.ph)*14+dir*80)*dt; if(p.y>LH){ p.dead=w!=='ice'; p.y=-6; p.x=Math.random()*LW; } }
  else { const sp=(p.k==='l'?160:300)*p.v*Math.sign(dir||1); p.x+=sp*dt; p.y+=(p.k==='l'?Math.sin(now*4+p.ph)*40:0)*dt; if(p.x>LW+40||p.x<-40){ p.dead=!(w==='wind+'||w==='wind-'); p.x=dir>0?-30:LW+30; p.y=Math.random()*LH; } } }
 wxP=wxP.filter(p=>!p.dead||false); if(wxP.length>140) wxP.length=140; }
function drawWeather(){ if(!world.wx) return; const w=world.wxNow, a=wxFade;
 if(w==='rain'){ ctx.fillStyle=`rgba(30,50,110,${.16*a})`; ctx.fillRect(0,0,LW,LH); }
 if(w==='ice'){ ctx.fillStyle=`rgba(180,220,255,${.12*a})`; ctx.fillRect(0,0,LW,LH); }
 // мокрые/заиндевевшие края блоков
 if(w==='rain'||w==='ice') for(const o of world.solids){ if(!o.alive||o.type==='s'||o.type==='h') continue; ctx.globalAlpha=a; ctx.fillStyle=w==='ice'?'#e8f8ff':'#9ad0ff'; ctx.fillRect(o.x,o.y,o.w,1);
   if(w==='ice'){ ctx.fillStyle='#ffffff'; for(let i=(o.x*7)%9;i<o.w;i+=9) ctx.fillRect(o.x+i,o.y+1,1,2); } else { const sh=(now*30+o.x)%Math.max(8,o.w); ctx.fillStyle='rgba(255,255,255,.7)'; ctx.fillRect(o.x+(sh|0),o.y,4,1); } ctx.globalAlpha=1; }
 for(const p of wxP){ if(p.k==='r'){ ctx.fillStyle='rgba(170,215,255,.75)'; const dx=((world.wind||0)/170)*2; ctx.fillRect(p.x|0,p.y|0,1,5); ctx.fillRect((p.x+dx)|0,(p.y+5)|0,1,2); }
  else if(p.k==='s'){ ctx.fillStyle='#fff'; ctx.fillRect(p.x|0,p.y|0,1,1); if(p.v>.9){ ctx.fillRect((p.x|0)-1,p.y|0,3,1); ctx.fillRect(p.x|0,(p.y|0)-1,1,3); } }
  else if(p.k==='w'){ ctx.fillStyle='rgba(255,255,255,.45)'; ctx.fillRect(p.x|0,p.y|0,10+p.v*14|0,1); }
  else { ctx.fillStyle='#1a0c22'; ctx.fillRect((p.x|0)-1,(p.y|0)-1,5,4); ctx.fillStyle=p.c; ctx.fillRect(p.x|0,p.y|0,3,2); ctx.fillRect((p.x|0)+1,(p.y|0)+Math.round(Math.sin(now*6+p.ph)),1,1); } } }
function drawWxChip(y){ if(!world.wx) return y; const S=world.L.wx, w=world.wx; const [nm,col]=WXN[world.wxNow]||['?','#fff']; const left=S.length>1?S[w.i][1]-w.t:0;
 ctx.fillStyle='rgba(12,4,24,.55)'; ctx.fillRect(LW-112,y,108,24); T(nm,LW-58,y+2,11,col); if(S.length>1){ ctx.fillStyle='#1a0c22'; ctx.fillRect(LW-108,y+18,100,4); ctx.fillStyle=left<2?((now*8|0)%2?'#ff3a3a':'#ffd23c'):col; ctx.fillRect(LW-107,y+19,Math.round(98*Math.max(0,left/S[w.i][1])),2); } return y+28; }
// ---------- 16: ночь ----------
let nightC=null, nightX=null;
function drawNight(){ if(!isNight()) return; if(!nightC){ [nightC,nightX]=mk(LW,LH); } const x=nightX; x.globalCompositeOperation='source-over'; x.clearRect(0,0,LW,LH); x.fillStyle='rgba(6,6,30,.74)'; x.fillRect(0,0,LW,LH);
 x.globalCompositeOperation='destination-out'; const hole=(cx,cy,r,k=1)=>{ for(const [f,al] of [[1,.35],[.78,.35],[.56,.5]]){ x.globalAlpha=al*k; x.beginPath(); x.arc(Math.round(cx),Math.round(cy),Math.round(r*f),0,7); x.fill(); } x.globalAlpha=1; };
 const s=world.s, fl=1+Math.sin(now*9)*.03+Math.sin(now*23)*.02; if(s.st!=='poof') hole(s.x,s.y-6,72*fl); if(world.clone) hole(world.clone.x,world.clone.y,40*fl);
 const g=world.L.goal; hole(g[0],g[1]-20,42+Math.sin(now*3)*3,.9); for(const c of world.candies) if(!c.got) hole(c.x,c.y,16,.8); for(const p of world.portals){ hole(p[0],p[1],24,.7); hole(p[2],p[3],24,.7); }
 if(world.gem&&!world.gem.got) hole(world.gem.x,world.gem.y,18,.8); if(world.boss&&!world.boss.dead) hole(world.boss.x,world.boss.y,world.boss.r+16,.6); for(const b of world.bumpers) hole(b.x,b.y,b.r+8,.5);
 x.globalCompositeOperation='source-over'; ctx.drawImage(nightC,0,0);
 // светлячки
 seed=7; for(let i=0;i<10;i++){ const fx=(rnd()*LW+Math.sin(now*.7+i)*20)|0, fy=(rnd()*LH*.8+Math.cos(now*.9+i*2)*14)|0; if((now*2+i)%3<2){ ctx.fillStyle='#d8ff7a'; ctx.fillRect(fx,fy,1,1); ctx.globalAlpha=.3; ctx.fillRect(fx-1,fy-1,3,3); ctx.globalAlpha=1; } }
 // фонарик у слизня
 if(s.st!=='poof'){ const sw=Math.sin(now*3+(s.vx||0)*.01)*3, lx=Math.round(s.x+14+sw), ly=Math.round(s.y-22); ctx.fillStyle='#1a0c22'; ctx.fillRect(lx-1,ly-6,1,6); ctx.fillRect(s.x+9|0,ly-6,lx-(s.x+9|0),1);
  ctx.fillStyle='#1a0c22'; ctx.fillRect(lx-4,ly-1,8,9); ctx.fillStyle='#5a3a1a'; ctx.fillRect(lx-3,ly,6,1); ctx.fillRect(lx-3,ly+6,6,1); ctx.fillStyle=(now*12|0)%7?'#ffe066':'#fff6b0'; ctx.fillRect(lx-2,ly+1,4,5); ctx.fillStyle='#fff'; ctx.fillRect(lx-1,ly+2,1,2);
  ctx.globalAlpha=.25; ctx.fillStyle='#ffe066'; ctx.fillRect(lx-6,ly-2,12,12); ctx.globalAlpha=1; } }
// ---------- 6: боссы — рисунок ----------
function dsc(x,y,r,col,out='#1a0c22'){ if(out) disc(Math.round(x),Math.round(y),Math.round(r)+1,out); disc(Math.round(x),Math.round(y),Math.round(r),col); }
function eyes(x,y,sep,r,b,mood){ const s=world.s, a=Math.atan2(s.y-y,s.x-x), px=Math.round(Math.cos(a)*r*.4), py=Math.round(Math.sin(a)*r*.4);
 for(const sx of [-1,1]){ const ex=Math.round(x+sx*sep), ey=Math.round(y); if(mood==='x'){ ctx.fillStyle='#1a0c22'; for(let i=-2;i<=2;i++){ ctx.fillRect(ex+i,ey+i,1,1); ctx.fillRect(ex+i,ey-i,1,1);} continue; }
  if(mood==='><'){ ctx.fillStyle='#1a0c22'; for(let i=0;i<3;i++){ ctx.fillRect(ex+(sx<0?i:-i),ey-i,1,1); ctx.fillRect(ex+(sx<0?i:-i),ey+i,1,1);} continue; }
  dsc(ex,ey,r,'#fff'); ctx.fillStyle='#1a0c22'; ctx.fillRect(ex+px-1,ey+py-1,2,2); if(mood==='angry'){ ctx.fillRect(ex-r,ey-r-1+(sx<0?0:0),r*2,1); ctx.fillRect(ex+(sx<0?r-1:-r),ey-r,2,2); } } }
function bossHearts(b,y){ for(let i=0;i<3;i++){ const x=Math.round(b.x-12+i*10), on=i<b.hp; ctx.fillStyle='#1a0c22'; ctx.fillRect(x-1,y-1,9,8); ctx.fillStyle=on?'#ff4a6a':'#4a3a5a'; ctx.fillRect(x,y,3,2); ctx.fillRect(x+4,y,3,2); ctx.fillRect(x,y+2,7,2); ctx.fillRect(x+1,y+4,5,1); ctx.fillRect(x+2,y+5,3,1); if(on){ ctx.fillStyle='#ffb0c0'; ctx.fillRect(x+1,y,1,1);} } }
function drawBoss(){ const b=world.boss; if(!b) return; const t=world.t, x=Math.round(b.x), y=Math.round(b.y), r=b.r, hit=b.react>0, wob=hit?Math.round(Math.sin(now*60)*1.5):0, k=b.k, dmg=3-b.hp;
 if(b.dead){ if(!b.gone){ b.fade=(b.fade||0)+1/60; if(b.fade>1.2) b.gone=1; ctx.globalAlpha=Math.max(0,1-b.fade); dsc(x,y+b.fade*20,r*(1-b.fade*.5),'#c8b8e0'); ctx.globalAlpha=1; } return; }
 ctx.save(); ctx.translate(wob,0); const mood=hit?'><':dmg>=2?'angry':'';
 if(k===0){ // пиявка
  const sp=hit?6:9, dir=Math.cos(t/6*Math.PI*2)>=0?1:-1; for(let i=4;i>=0;i--){ const sx=x-dir*(i-2)*sp, sy=y+Math.sin(t*5+i)*2*(b.hang?-1:1); dsc(sx,sy,r*.62-(i===4?3:0),i%2?'#8a3a6a':'#a04a7a'); ctx.fillStyle='rgba(255,255,255,.25)'; ctx.fillRect(sx-3,sy-r*.5|0,5,1); }
  const hx=x+dir*2*sp; dsc(hx+dir*6,y,6,hit?'#ff4a6a':'#c05a8a'); ctx.fillStyle='#1a0c22'; ctx.fillRect(hx+dir*8-2,y-2,4,4); ctx.fillStyle=hit?'#ffb0c0':'#ff8ab0'; for(let i=0;i<4;i++){ const sx=x+dir*(i-1.5)*sp|0; ctx.fillRect(sx-1,y+(b.hang?-r*.62-1:r*.62)|0,3,2); }
  eyes(hx,y-6,4,3,b,mood); }
 else if(k===1){ // пылесос
  ctx.fillStyle='#1a0c22'; ctx.fillRect(x-r-1,y-r+3,2*r+2,2*r-2); ctx.fillStyle='#c83a4a'; ctx.fillRect(x-r,y-r+4,2*r,2*r-4); ctx.fillStyle='#ff6a7a'; ctx.fillRect(x-r,y-r+4,2*r,2); ctx.fillStyle='#8a2030'; ctx.fillRect(x-r,y+r-4,2*r,2);
  dsc(x-r+5,y+r-1,4,'#2a2a3a'); dsc(x+r-5,y+r-1,4,'#2a2a3a'); const s=world.s, a=Math.atan2(s.y-y,s.x-x); for(let i=0;i<14;i++){ const px=x+Math.cos(a)*(r-2+i), py=y+Math.sin(a)*(r-2+i)+Math.sin(i*.5+t*20)*.6; ctx.fillStyle='#1a0c22'; ctx.fillRect(px-2|0,py-2|0,4,4); ctx.fillStyle=i>11?'#5a5a6a':'#9a9aaa'; ctx.fillRect(px-1|0,py-1|0,3,3); }
  ctx.fillStyle='#1a0c22'; ctx.fillRect(x-6,y-r-2,12,6); ctx.fillStyle=(now*6|0)%2?'#4ef0ff':'#2ab0c0'; ctx.fillRect(x-5,y-r-1,10,4); eyes(x,y-2,6,4,b,mood);
  if(hit&&Math.random()<.5) parts.push({x:x+(Math.random()-.5)*r*2,y:y-r,vx:(Math.random()-.5)*60,vy:-40,life:.6,t:0,c:'#a8a0a0',g:-20,s:2});
  const s2=world.s; if(s2.st==='fly'&&Math.hypot(s2.x-x,s2.y-y)<120&&Math.random()<.6){ const aa=Math.random()*6.28, d=60+Math.random()*50; parts.push({x:x+Math.cos(aa)*d,y:y+Math.sin(aa)*d,vx:-Math.cos(aa)*120,vy:-Math.sin(aa)*120,life:.45,t:0,c:'rgba(255,255,255,.7)',g:0,s:1}); } }
 else if(k===2){ // кот
  const fur=hit?2:0; dsc(x,y,r+fur,'#ff9a3c'); for(const sx of [-1,1]){ ctx.fillStyle='#1a0c22'; for(let i=0;i<8;i++) ctx.fillRect(x+sx*(r-8)+(sx<0?-1:0)-i*sx*0+(sx>0?-i/2:i/2)|0,y-r-6+i,Math.max(2,i+2)-0,1); ctx.fillStyle='#ff9a3c'; for(let i=1;i<7;i++) ctx.fillRect(x+sx*(r-8)+(sx>0?-i/2:i/2)|0,y-r-5+i,Math.max(1,i),1); }
  ctx.fillStyle='#c86a1c'; for(let i=-1;i<=1;i++) ctx.fillRect(x+i*6-1,y-r+2,2,6); if(fur){ ctx.fillStyle='#ff9a3c'; for(let a=0;a<6.28;a+=.5) ctx.fillRect(x+Math.cos(a)*(r+3)|0,y+Math.sin(a)*(r+3)|0,2,2); }
  eyes(x,y-3,6,4,b,mood==='><'?'><':'cat'); ctx.fillStyle='#ff5a8a'; ctx.fillRect(x-1,y+3,3,2); ctx.fillStyle='#1a0c22'; ctx.fillRect(x-4,y+6,3,1); ctx.fillRect(x+2,y+6,3,1); ctx.fillStyle='#fff'; for(const sx of [-1,1]) for(let i=0;i<2;i++) ctx.fillRect(sx<0?x-r-4:x+r-4,y+3+i*3,8,1);
  const pw=b.paw>0?(b.paw-=1/60,1):0; const pyy=y+r-4-(pw?14:0); dsc(x+r-2,pyy,5,'#ffb85a'); ctx.fillStyle='#ff8ab0'; ctx.fillRect(x+r-4,pyy,4,2); }
 else if(k===3){ // снеговик
  dsc(x,y+4,r*.95,'#e8f4ff'); dsc(x,y-r*.65,r*.62,'#f4faff'); ctx.fillStyle='#b8d4ee'; ctx.fillRect(x-r*.6|0,y+r*.6|0,r*1.2|0,2);
  ctx.fillStyle='#1a0c22'; ctx.fillRect(x-8,y-r*1.3-6|0,16,3); ctx.fillRect(x-5,y-r*1.3-15|0,10,10); ctx.fillStyle='#c83a4a'; ctx.fillRect(x-5,y-r*1.3-8|0,10,2);
  eyes(x,y-r*.75,4,2,b,mood); if(b.hp>=3){ ctx.fillStyle='#ff8a1c'; ctx.fillRect(x,y-r*.6|0,8,2); ctx.fillRect(x+8,y-r*.6|0,3,1); }
  if(b.hp>=2) for(let i=0;i<3;i++){ ctx.fillStyle='#1a0c22'; ctx.fillRect(x-1,y-4+i*6,3,3); }
  for(const sx of [-1,1]){ ctx.fillStyle='#6a3a1a'; for(let i=0;i<9;i++) ctx.fillRect(x+sx*(r*.9+i)|0,y-2-i+(sx>0&&world.boss.ballT<.4?-4:0),2,1); }
  for(const o of b.balls){ dsc(o.x,o.y,4,'#ffffff','#5a7aa0'); } }
 else if(k===4){ // пресс
  ctx.fillStyle='#4a4e5a'; ctx.fillRect(x-3,0,6,y-r); ctx.fillStyle='#6a6e78'; ctx.fillRect(x-2,0,2,y-r);
  ctx.fillStyle='#1a0c22'; ctx.fillRect(x-r-5,y-r,2*r+10,2*r); ctx.fillStyle='#8a92a8'; ctx.fillRect(x-r-4,y-r+1,2*r+8,2*r-2); ctx.fillStyle='#b8c0d0'; ctx.fillRect(x-r-4,y-r+1,2*r+8,2);
  for(let i=0;i<2*r+8;i+=6){ ctx.fillStyle='#ffd23c'; ctx.fillRect(x-r-4+i,y+r-6,3,4); ctx.fillStyle='#1a0c22'; ctx.fillRect(x-r-1+i,y+r-6,3,4); }
  ctx.fillStyle=(b.hp<3&&(now*10|0)%2)||hit?'#ff3a3a':'#4ed05a'; ctx.fillRect(x+r-2,y-r+4,4,4); eyes(x-2,y-3,6,3,b,mood);
  if(dmg&&Math.random()<.1*dmg) burst(x+(Math.random()-.5)*r*2,y-r,3,['#ffe066','#fff'],80,20,.3,200); }
 else if(k===5){ // голем
  seed=31; dsc(x,y,r,'#8a8478'); for(let i=0;i<7;i++){ const a=rnd()*6.28, d=rnd()*r*.7; dsc(x+Math.cos(a)*d,y+Math.sin(a)*d,2+rnd()*3,i%2?'#7a7468':'#9a9488',null); }
  ctx.fillStyle='#4a8a3a'; ctx.fillRect(x-r+4,y-r+3,8,2); ctx.fillRect(x+3,y-r+1,6,2); ctx.fillStyle=hit?'#fff':'#4ef0ff'; ctx.fillRect(x-7,y-4,4,3); ctx.fillRect(x+3,y-4,4,3); ctx.fillStyle='#1a0c22'; ctx.fillRect(x-5,y+5,10,2);
  ctx.fillStyle='#2a2420'; const cr=[[[-2,-r],[0,-8],[-3,-2]],[[r-2,0],[8,2],[4,8]],[[-r+2,4],[-8,6],[-6,12]]]; for(let c=0;c<dmg+(hit?1:0)&&c<3;c++){ for(const [a1,a2] of [[cr[c][0],cr[c][1]],[cr[c][1],cr[c][2]]]){ const st=12; for(let i=0;i<=st;i++) ctx.fillRect(x+a1[0]+(a2[0]-a1[0])*i/st|0,y+a1[1]+(a2[1]-a1[1])*i/st|0,1,1); } } }
 else if(k===6){ // мышь
  const fl=Math.sin(now*18)*5; for(const sx of [-1,1]){ ctx.fillStyle='#1a0c22'; for(let i=0;i<15;i++){ const h=Math.max(1,6-Math.abs(i-6)*.6+(i%4===3?-2:0))|0; ctx.fillRect(x+sx*(r-4+i)-(sx<0?1:0)|0,y-4+fl*(i/14)-(i>9?2:0)|0,2,h+2);} ctx.fillStyle='#9a7ae0'; for(let i=0;i<13;i++){ const h=Math.max(1,5-Math.abs(i-6)*.6+(i%4===3?-2:0))|0; ctx.fillRect(x+sx*(r-4+i)|0,y-3+fl*(i/14)-(i>9?2:0)|0,1,h);} }
  dsc(x,y,r,'#6a4aa0'); ctx.fillStyle='#6a4aa0'; ctx.fillRect(x-7,y-r-3,3,4); ctx.fillRect(x+4,y-r-3,3,4); eyes(x,y-2,5,3,b,mood); ctx.fillStyle='#fff'; ctx.fillRect(x-3,y+5,1,2); ctx.fillRect(x+2,y+5,1,2);
  if(hit||dmg>=2) for(let i=0;i<3;i++){ const a=now*5+i*2.1; ctx.fillStyle='#ffe066'; const sx=x+Math.cos(a)*12|0, sy=y-r-6+Math.sin(a)*3|0; ctx.fillRect(sx,sy-1,1,3); ctx.fillRect(sx-1,sy,3,1); } }
 else if(k===7){ // краб
  const sh=hit?Math.round(Math.sin(now*50)*2):0; for(const sx of [-1,1]){ for(let i=0;i<3;i++) for(let j=0;j<2;j++){ ctx.fillStyle='#1a0c22'; ctx.fillRect(x+sx*(6+i*4)-1,y+r-6+j*3+i,3,3); ctx.fillStyle='#c83020'; ctx.fillRect(x+sx*(6+i*4),y+r-5+j*3+i,1,2);} 
   const cx=x+sx*(r+6), cy=y-6+sh*sx; dsc(cx,cy,6,'#ff5a3a'); ctx.fillStyle='#1a0c22'; ctx.fillRect(cx-1,cy-6,2,5+(Math.sin(now*6)>0?2:0)); }
  for(let yy=-r-1;yy<=5;yy++){ const w=Math.sqrt(Math.max(0,(r+1)*(r+1)-yy*yy))|0; ctx.fillStyle='#1a0c22'; ctx.fillRect(x-w,y+2+yy,2*w+1,1); }
  for(let yy=-r;yy<=4;yy++){ const w=Math.sqrt(Math.max(0,r*r-yy*yy))-1|0; ctx.fillStyle=yy<-r+4?'#ff8a6a':yy>1?'#c83020':'#ff4a3a'; ctx.fillRect(x-w,y+2+yy,2*w+1,1); }
  for(const sx of [-1,1]){ ctx.fillStyle='#1a0c22'; ctx.fillRect(x+sx*5-1,y-r-6,3,8); dsc(x+sx*5,y-r-7,3,'#fff'); ctx.fillStyle='#1a0c22'; ctx.fillRect(x+sx*5,y-r-7,1,1); }
  ctx.fillStyle=['#ff5aff','#4ef0ff','#ffe066'][(now*4|0)%3]; ctx.fillRect(x-2,y-2,4,4); ctx.fillStyle='#1a0c22'; ctx.fillRect(x-4,y+4,8,1); }
 else if(k===8){ // туча-дракон
  const g=world.gust||0, dir=g>=0?1:-1; for(const [ox2,oy2,rr] of [[-12,4,10],[0,-2,13],[12,4,10],[-4,8,9],[8,9,8]]) dsc(x+ox2,y+oy2,rr,dmg>=2?'#9aa4c0':'#c8d4ee'); for(const [ox2,oy2,rr] of [[-12,4,10],[0,-2,13],[12,4,10]]) disc(x+ox2,y+oy2-2,rr-3,dmg>=2?'#aab4d0':'#e8f0ff');
  const hx=x+dir*14, hy=y-6; dsc(hx,hy,7,'#c8d4ee'); ctx.fillStyle='#ffd23c'; ctx.fillRect(hx-4,hy-10,2,4); ctx.fillRect(hx+3,hy-10,2,4); dsc(hx+dir*7,hy+2,4,'#dde6f8'); ctx.fillStyle='#1a0c22'; ctx.fillRect(hx+dir*9,hy+1,1,1);
  eyes(hx,hy-2,3,2,b,mood||(dmg?'angry':'')); if(Math.abs(g)>40) for(let i=0;i<3;i++){ const lx=hx+dir*(14+((now*80+i*12)%30)); ctx.fillStyle='rgba(255,255,255,.7)'; ctx.fillRect(lx|0,hy-3+i*3,6,1); } }
 else if(k===9){ // король
  const s=world.s, eating=s.eat>0, sq=eating?Math.sin(now*30)*2:0; dsc(x,y+2,r+sq,'#4ed05a'); ctx.fillStyle='#1a0c22'; ctx.fillRect(x-r-1,y+r-2,2*r+3,4); ctx.fillStyle='#3aa04a'; ctx.fillRect(x-r,y+r-3,2*r+1,3);
  ctx.fillStyle='#8af08a'; ctx.fillRect(x-r+5,y-r+8,4,6); ctx.fillRect(x-r+10,y-r+5,3,2); eyes(x,y-2,7,4,b,eating?'><':mood);
  ctx.fillStyle='#1a0c22'; if(eating){ ctx.fillRect(x-6,y+6,12,6); ctx.fillStyle=PC().col; ctx.fillRect(x-4,y+7,8,4); } else ctx.fillRect(x-4,y+8,8,2);
  const ct=dmg*.25+(hit?.3:0), cx=x+dmg*3, cy=y-r-2+dmg; ctx.save(); ctx.translate(cx,cy); ctx.rotate(ct); ctx.fillStyle='#5a3008'; ctx.fillRect(-9,-9,18,10); ctx.fillStyle='#ffd23c'; ctx.fillRect(-8,-4,16,4); for(let i=0;i<3;i++) ctx.fillRect(-8+i*7,-8,3,4); ctx.fillStyle='#ff3a5a'; ctx.fillRect(-1,-3,2,2); ctx.restore();
  if(eating){ T('ГЛЫК!',x,y-r-28,11,'#fff'); } }
 ctx.restore(); if(!world.result) bossHearts(b,Math.round(b.y-b.r-(k===3?r*1.3+24:k===4?14:16))); }
// ---------- 7: эстафета ----------
let relayTeam=null, relay=null, relayPick=[];
function relayHud(y){ if(!relay) return y; const n=relayTeam.length; ctx.fillStyle='rgba(12,4,24,.55)'; ctx.fillRect(4,y,LW-120,24); let xx=10;
 for(let i=0;i<n;i++){ const c=CHARS[relayTeam[i]], on=i===relay.i; let nm=c.name; if(nm.length>7) nm=nm.slice(0,6)+'.'; const w=Math.round(nm.length*(on?7:6.4)); if(on){ ctx.fillStyle=c.col; ctx.fillRect(xx-2,y+19,w+4,2); }
  T(nm,xx,y+3,on?11:10,on?'#fff':'#a898c8','l'); xx+=w+4; if(i<n-1){ T('›',xx+3,y+3,11,'#ffb03c','l'); xx+=14; } }
 return y+28; }
// ---------- 9: домик ----------
const HOUSE_DECAY=3*3600*1000; let houseSel=0, housePage=0, petCombo={id:null,n:0}, feedAnim=null, houseFX=[];
function houseOf(id){ if(!save.house||typeof save.house!=='object') save.house={}; const h=save.house[id]||(save.house[id]={fed:0,full:2,ts:Date.now(),pets:0}); const nowMs=Date.now(); if(nowMs-h.ts>HOUSE_DECAY){ const k=Math.floor((nowMs-h.ts)/HOUSE_DECAY); h.full=Math.max(0,h.full-k); h.ts+=k*HOUSE_DECAY; } return h; }
const hatTier=f=>f>=30?3:f>=15?2:f>=5?1:0;
const HAT_NEXT=f=>f<5?5:f<15?15:f<30?30:null;
function houseRoster(){ const L=CHARS.filter((c,i)=>unlocked(i)); if(save.eggs&&save.eggs.secret) L.push(SECRET); return L; }
function squeak(c){ const i=Math.max(0,CHARS.indexOf(c)); const f=420+((i*97)%380); tone(f,.09,'square',.18,f*.6); tone(f*1.5,.08,'triangle',.12,f*.4,.07); }
function drawHat(x,y,tier,c,k){ x=Math.round(x); y=Math.round(y); const col=c.col; ctx.fillStyle='#1a0c22';
 if(tier===1){ ctx.fillRect(x-1,y-8,3,8); ctx.fillRect(x-5,y-11,6,4); ctx.fillRect(x+1,y-12,6,4); ctx.fillStyle='#4ed05a'; ctx.fillRect(x,y-7,1,7); ctx.fillStyle='#7fd64a'; ctx.fillRect(x-4,y-10,4,2); ctx.fillRect(x+2,y-11,4,2); return; }
 if(tier===2){ ctx.fillRect(x-9,y-8,18,9); ctx.fillRect(x-2,y-11,5,4); ctx.fillStyle=col; ctx.fillRect(x-8,y-7,16,6); ctx.fillStyle='#fff'; ctx.fillRect(x-8,y-2,16,2); ctx.fillRect(x-1,y-10,3,3); ctx.fillStyle='rgba(255,255,255,.4)'; ctx.fillRect(x-6,y-6,3,1); return; }
 const v=k%3; if(v===0){ ctx.fillRect(x-12,y-3,24,4); ctx.fillRect(x-7,y-17,14,15); ctx.fillStyle='#2a2a3a'; ctx.fillRect(x-11,y-2,22,2); ctx.fillRect(x-6,y-16,12,14); ctx.fillStyle=col; ctx.fillRect(x-6,y-6,12,3); ctx.fillStyle='#4a4a62'; ctx.fillRect(x-5,y-15,1,8); }
 else if(v===1){ ctx.fillRect(x-15,y-3,30,4); ctx.fillRect(x-6,y-12,12,10); ctx.fillStyle='#e8c060'; ctx.fillRect(x-14,y-2,28,2); ctx.fillRect(x-5,y-11,10,9); ctx.fillStyle=col; ctx.fillRect(x-5,y-5,10,2); ctx.fillStyle='#c89a40'; for(let i=-13;i<14;i+=4) ctx.fillRect(x+i,y-2,1,2); }
 else { ctx.fillRect(x-9,y-11,18,12); ctx.fillStyle='#ffd23c'; ctx.fillRect(x-8,y-6,16,6); for(let i=0;i<3;i++) ctx.fillRect(x-8+i*6,y-10,4,5); ctx.fillStyle=col; ctx.fillRect(x-1,y-4,3,2); ctx.fillStyle='#fff6b0'; ctx.fillRect(x-7,y-6,14,1); } }
function drawHouse(){ const night=isNight(); const tp=TAP(); swipePager=null;
 // комната
 const wall=night?['#2a2050','#241a46']:['#ffd6a8','#f6c690'], fy=Math.round(Math.max(TAP()+150,Math.min(H*.36,H-360)));
 for(let y=0;y<fy;y+=4){ ctx.fillStyle=wall[(y/4|0)%2]; ctx.fillRect(0,y,W,4); } ctx.fillStyle=night?'#3a2e66':'#ffe4c0'; for(let x=10;x<W;x+=28) for(let y=tp+20;y<fy-20;y+=28){ ctx.fillRect(x,y,2,2); }
 ctx.fillStyle='#1a0c22'; ctx.fillRect(0,fy-4,W,4); ctx.fillStyle=night?'#4a2e2a':'#a0603a'; ctx.fillRect(0,fy,W,H-fy); ctx.fillStyle=night?'#3a2420':'#8a4e2c'; for(let x=0;x<W;x+=24) ctx.fillRect(x,fy,1,H-fy); for(let y=fy+12;y<H;y+=12) ctx.fillRect(0,y,W,1);
 // окно
 const wx=W-110, wy=tp+24; ctx.fillStyle='#1a0c22'; ctx.fillRect(wx-3,wy-3,86,66); ctx.fillStyle=night?'#0a0c2a':'#8ad0ff'; ctx.fillRect(wx,wy,80,60); if(night){ ctx.fillStyle='#fff6b0'; disc(wx+56,wy+18,8,'#fff6b0'); disc(wx+60,wy+15,7,'#0a0c2a'); seed=4; for(let i=0;i<10;i++){ ctx.fillStyle='#fff'; ctx.fillRect(wx+rnd()*80|0,wy+rnd()*60|0,1,1);} } else { disc(wx+60,wy+16,8,'#ffe066'); ctx.fillStyle='#fff'; ctx.fillRect(wx+10+((now*6)%60|0),wy+30,16,4); ctx.fillRect(wx+14+((now*6)%60|0),wy+27,8,3); }
 ctx.fillStyle='#c8a070'; ctx.fillRect(wx+38,wy,4,60); ctx.fillRect(wx,wy+28,80,4); ctx.fillStyle='#e05a7a'; ctx.fillRect(wx-8,wy-4,10,70); ctx.fillRect(wx+78,wy-4,10,70);
 // лампа
 const lx=60, ly=tp+30; ctx.fillStyle='#1a0c22'; ctx.fillRect(lx-1,0,2,ly); ctx.fillRect(lx-12,ly,24,10); ctx.fillStyle=night?'#ffe066':'#ffb03c'; ctx.fillRect(lx-11,ly+1,22,8); if(night){ for(const [rr,al] of [[40,.06],[28,.07],[18,.08]]){ ctx.globalAlpha=al; disc(lx,ly+12,rr,'#ffe066'); } ctx.globalAlpha=1; }
 // ковёр
 ctx.fillStyle='#1a0c22'; ctx.fillRect(14,fy+122,W-28,30); ctx.fillStyle='#c04a9a'; ctx.fillRect(16,fy+124,W-32,26); ctx.fillStyle='#ff8ad0'; for(let x=20;x<W-20;x+=8) ctx.fillRect(x,fy+136,4,2);
 iconBtn(4,4,icBack,()=>goBack(),'back'); T('Домик',W/2,tp/2-10,17,['#fff','#ffd23c']); candy(W-50,tp/2,now,0); T(String(save.candy|0),W-40,tp/2-8,14,'#ff8ad0','l');
 const R0=houseRoster(), per=6, pages=Math.max(1,Math.ceil(R0.length/per)); if(housePage>=pages) housePage=0; const L=R0.slice(housePage*per,housePage*per+per); if(houseSel>=L.length) houseSel=0;
 const sel=L[houseSel]; L.forEach((c,k)=>{ const h=houseOf(c.id), col=k%3, row=k/3|0, x=Math.round(W*(col+1)/4), y=Math.round(row?fy+118:fy-4);
  const asleep=h.sleep&&Date.now()<h.sleep; const bob=asleep?0:Math.round(Math.sin(now*2+k)*1); const hop=h.hop&&now-h.hop<.4?Math.round(Math.sin((now-h.hop)/.4*Math.PI)*8):0; const fl=k%2===1;
  ctx.fillStyle='rgba(0,0,0,.25)'; ctx.fillRect(x-20,y+24,40,3); const chew=feedAnim&&feedAnim.id===c.id&&now-feedAnim.t<1.2; const an=asleep?'splat':'idle', fr=asleep?5:frameOf('idle',now+k*.4);
  ctx.save(); ctx.translate(x,y-hop*2+bob); ctx.scale(2,2); drawSlugM(c.id,an,fr,0,0,fl,chew?1+Math.abs(Math.sin(now*14))*.08:1,chew?1-Math.abs(Math.sin(now*14))*.08:1);
  const A=anchors(c.id); const a=A&&A.idle[fr]; const tier=hatTier(h.fed); if(tier&&a&&!asleep) drawHat((a.hx-32)*(fl?-1:1),a.hy-40+2,tier,c,CHARS.indexOf(c)+1); ctx.restore();
  if(asleep){ T('Z',x+18+Math.sin(now*2)*2,y-40-((now*10)%10),12,'#d8c8f0','l'); T('z',x+26,y-50-((now*10+5)%10),10,'#d8c8f0','l'); }
  if(k===houseSel){ ctx.fillStyle='#ffd23c'; const ay=y-60+Math.round(Math.sin(now*5)*2); ctx.fillRect(x-4,ay,9,2); ctx.fillRect(x-3,ay+2,7,2); ctx.fillRect(x-2,ay+4,5,2); ctx.fillRect(x-1,ay+6,3,1); }
  for(let i=0;i<5;i++){ ctx.fillStyle='#1a0c22'; ctx.fillRect(x-15+i*6,y+28,6,5); ctx.fillStyle=i<h.full?'#ff4a6a':'#4a3a5a'; ctx.fillRect(x-14+i*6,y+29,4,3); }
  T(c.name,x,y+34,11,k===houseSel?'#ffd23c':'#fff');
  buttons.push({x:x-W/8,y:y-56,w:W/4,h:84,label:'h'+k,cb:()=>{ if(houseSel!==k){ houseSel=k; sfx('tap'); } petSlug(c,h,x,y-20); }}); });
 for(const f of houseFX){ f.t+=1/60; f.y-=20/60; if(f.k==='heart'){ ctx.globalAlpha=Math.max(0,1-f.t/1.2); ctx.fillStyle='#ff4a6a'; ctx.fillRect(f.x-2,f.y,2,2); ctx.fillRect(f.x+1,f.y,2,2); ctx.fillRect(f.x-2,f.y+2,5,1); ctx.fillRect(f.x-1,f.y+3,3,1); ctx.fillRect(f.x,f.y+4,1,1); ctx.globalAlpha=1; } else if(f.k==='candy'){ f.y+=f.t*6; candy(f.x,f.y,now,f.i); } else T(f.s,f.x,f.y,f.size||11,f.col||'#fff'); }
 houseFX=houseFX.filter(f=>f.t<(f.life||1.2));
 // панель
 const py=fy+174; if(sel){ const h=houseOf(sel.id), nx=HAT_NEXT(h.fed); T(sel.name+': сытость '+h.full+'/5',W/2,py-4,12,'#fff'); T(nx?'шапка растёт: '+h.fed+'/'+nx+' конфет':'шапка выросла полностью!',W/2,py+12,10,nx?'#ffe0f0':'#ffd23c'); }
 const bw=Math.min(150,(W-36)/2|0), by=Math.min(H-tp-8,py+30); const can=(save.candy|0)>0&&sel;
 btn(W/2-bw-6,by,bw,tp,'КОРМИТЬ',()=>{ if(!sel) return; if((save.candy|0)<=0){ sfx('bounce',40); haptic('error'); houseFX.push({k:'t',s:'нет конфет — играй уровни!',x:W/2,y:by-10,t:0,life:1.4,col:'#ff8ab0'}); return; } feedSlug(sel); },can?'#ff5aa8':'#5a4a6a',14); buttons[buttons.length-1].label='feed';
 btn(W/2+6,by,bw,tp,'ПОГЛАДИТЬ',()=>{ if(sel){ const k=houseSel; petSlug(sel,houseOf(sel.id),Math.round(W*((k%3)+1)/4),Math.round((k/3|0)?fy+98:fy-24)); } },'#6a4fd8',14); buttons[buttons.length-1].label='pet';
 if(pages>1) pager(Math.min(H-tp-4,by+tp+8),housePage,pages,v=>{housePage=v;houseSel=0;},'hs');
 else T('тапни слизня — погладить',W/2,by+tp+10,10,night?'#c8b8e0':'#5a3a2a'); }
function petSlug(c,h,x,y){ const asleep=h.sleep&&Date.now()<h.sleep; if(asleep){ houseFX.push({k:'t',s:'тсс… спит',x,y:y-40,t:0,life:1,col:'#d8c8f0'}); return; }
 h.pets=(h.pets|0)+1; h.hop=now; squeak(c); haptic('light'); for(let i=0;i<3;i++) houseFX.push({k:'heart',x:x+(Math.random()-.5)*24,y:y-30-i*6,t:-i*.1}); houseFX.push({k:'t',s:['пи!','мур','хи-хи','ещё!','ня'][Math.random()*5|0],x:x+14,y:y-40,t:0,life:.9,size:10,col:'#fff'});
 if(petCombo.id===c.id) petCombo.n++; else petCombo={id:c.id,n:1}; if(petCombo.n>=20){ h.sleep=Date.now()+20000; petCombo.n=0; save.eggs.sleep=true; houseFX.push({k:'t',s:'Загладили до сна! Ззз…',x:W/2,y:H*.4,t:0,life:2,size:13,col:'#d8c8f0'}); }
 qEv('pet'); store(); }
function feedSlug(c){ const h=houseOf(c.id); save.candy=(save.candy|0)-1; h.fed++; h.full=Math.min(5,h.full+1); h.ts=Date.now(); feedAnim={id:c.id,t:now}; const k=houseSel, x=Math.round(W*((k%3)+1)/4);
 houseFX.push({k:'candy',x,y:Math.round(Math.max(TAP()+150,Math.min(H*.36,H-360)))-70+((k/3|0)?122:0),t:0,i:h.fed%3,life:.6}); sfx('candy',h.fed%4); setTimeout(()=>{ sfx('splat'); },400); haptic('medium'); const tier0=hatTier(h.fed-1), tier1=hatTier(h.fed);
 if(tier1>tier0){ setTimeout(()=>{ sfx('win'); houseFX.push({k:'t',s:['','Проросла шапка!','Шапочка подросла!','ШЛЯПА ВЫРОСЛА!'][tier1],x:W/2,y:H*.35,t:0,life:2,size:14,col:'#ffd23c'}); },500); }
 qEv('feed'); store(); }
// ---------- 10: бестиарий ----------
let bestTab=0, bestPage=0;
function charSeen(i){ return unlocked(i); }
function drawBestiary(){ drawBG(1,0,now); swipePager=null; const tp=TAP(); iconBtn(4,4,icBack,()=>goBack(),'back'); T('Бестиарий',W/2,tp/2-10,17,['#fff','#7affe0']);
 const bw=(W-36)/2|0; btn(12,tp+8,bw,tp-4,'СЛИЗНИ',()=>{sfx('tap');bestTab=0;bestPage=0;},bestTab===0?'#c04a9a':'#4a3a6a',13); buttons[buttons.length-1].label='bt0';
 btn(24+bw,tp+8,bw,tp-4,'ГИБРИДЫ '+hybList().length,()=>{sfx('tap');bestTab=1;bestPage=0;},bestTab===1?'#2ab0a0':'#4a3a6a',13); buttons[buttons.length-1].label='bt1';
 const y0=tp*2+12;
 if(bestTab===0){ const R0=CHARS.map((c,i)=>({c,i})); if(save.eggs.secret) R0.push({c:SECRET,i:-1}); else R0.push({c:SECRET,i:-2});
  const ch=Math.max(78,Math.min(104,Math.floor((H-y0-tp-24)/4))), per=Math.max(3,Math.floor((H-y0-tp-24)/ch)), pages=Math.ceil(R0.length/per); if(bestPage>=pages) bestPage=0;
  R0.slice(bestPage*per,bestPage*per+per).forEach(({c,i},k)=>{ const y=y0+k*ch, op=i===-1||(i>=0&&charSeen(i)); panel(10,y,W-20,ch-6,op?'#2b1a4a':'#1e1430'); ctx.fillStyle=op?c.col:'#3a2a52'; ctx.fillRect(11,y+1,3,ch-8);
   ctx.save(); ctx.beginPath(); ctx.rect(14,y+1,64,ch-8); ctx.clip(); if(op) drawSlugM(c.id,'idle',frameOf('idle',now+k*.3),46,y+ch-24); else if(SPR[c.id]||c.id==='slugX') ctx.drawImage(silhouette(c.id==='slugX'?'slug41':c.id),14,y+ch-70); ctx.restore();
   const B=BIO[c.id]||['','','']; if(op){ T(c.name,84,y+5,14,['#fff','#ffd23c'],'l'); T(c.perk,W-16,y+7,10,c.col,'r'); T(B[0],84,y+25,10,'#e8dcff','l'); T(B[1],84,y+39,10,'#e8dcff','l'); T(B[2],84,y+55,10,'#ffb0d8','l'); if(save.house&&save.house[c.id]&&ch>84) T('гладили: '+(save.house[c.id].pets|0)+' • съел: '+(save.house[c.id].fed|0),84,y+69,9,'#a898c8','l'); }
   else { T('???',84,y+8,14,'#8a7aa8','l'); T(i===-2?'секрет: что будет, если тапать логотип…':'откроется на ★ '+c.cost,84,y+30,10,'#a898c8','l'); } });
  pager(H-tp-8,bestPage,pages,v=>bestPage=v,'bp'); }
 else { const all=hybAll(), got=new Set(hybList()); T('открыто '+got.size+' из '+all.length+' — играй гибридами, ищи редкие находки',W/2,y0,10,'#d8c8f0');
  const cols=4, cw=Math.floor((W-20)/cols), chh=70, rows=Math.max(2,Math.floor((H-y0-tp-36)/chh)), per=cols*rows, list=[...got].map(k=>k.split('_').map(Number)).filter(p=>p.length===2&&CHARS[p[0]]&&CHARS[p[1]]), pages=Math.max(1,Math.ceil(list.length/per)); if(bestPage>=pages) bestPage=0;
  if(!list.length){ T('пока ни одного гибрида',W/2,y0+60,13,'#fff'); T('сделай слияние (★'+FUSE_STARS+') и пройди уровень,',W/2,y0+84,10,'#e8dcff'); T('или жди редкую находку после побед',W/2,y0+100,10,'#e8dcff'); }
  list.slice(bestPage*per,bestPage*per+per).forEach(([a,b],k)=>{ const x=10+(k%cols)*cw, y=y0+16+Math.floor(k/cols)*chh, F=fusedChar(a,b); panel(x+2,y,cw-4,chh-4,'#22143e'); ctx.save(); ctx.beginPath(); ctx.rect(x+3,y+1,cw-6,chh-6); ctx.clip(); if(SPR[F.id]) drawSlug(F.id,'idle',frameOf('idle',now+k*.2),x+cw/2,y+chh-30); ctx.restore(); T(F.name.length>9?F.name.slice(0,8)+'…':F.name,x+cw/2,y+chh-20,9,'#7affe0'); });
  if(pages>1) pager(H-tp-8,bestPage,pages,v=>bestPage=v,'hp'); }
 if(save.eggs.master) T('★ Мастер шмяка',W-8,tp/2+8,10,'#ffd23c','r'); }
// ---------- 11: экран заданий ----------
function drawQuests(){ drawBG(4,0,now); swipePager=null; const tp=TAP(); iconBtn(4,4,icBack,()=>goBack(),'back'); T('Задания дня',W/2,tp/2-10,17,['#fff','#ffe066']); const Q=questsToday();
 const d=today(); T(d.getDate()+'.'+String(d.getMonth()+1).padStart(2,'0')+' • новые в полночь',W/2,tp/2+10,10,'#d8c8f0');
 const ch=Math.max(92,tp+52); Q.ids.forEach((id,i)=>{ const q=QUESTS.find(x=>x.id===id), y=tp+24+i*(ch+8), pr=Q.prog[i], done=pr>=q.n, got=Q.got[i];
  panel(12,y,W-24,ch,got?'#1e2a2a':done?'#2a4a3a':'#2b1a4a'); T(q.t,22,y+8,13,got?'#8aa8a0':'#fff','l'); ctx.fillStyle='#1a0c22'; ctx.fillRect(22,y+32,W-140,10); ctx.fillStyle=done?'#4ed05a':'#ffd23c'; ctx.fillRect(23,y+33,Math.round((W-142)*pr/q.n),8); T(pr+'/'+q.n,W-112,y+29,11,'#fff','l');
  T('награда: '+q.rw+' конфет',22,y+48,11,'#ffb0d8','l');
  if(got) T('✓ ПОЛУЧЕНО',W-24,y+ch-tp-2,12,'#7affe0','r'); else btn(W-132,y+ch-tp-6,112,tp,done?'ЗАБРАТЬ':'В ПУТИ',()=>{ if(!done){ sfx('bounce',40); return; } Q.got[i]=true; save.candy=(save.candy|0)+q.rw; store(); sfx('win'); haptic('success'); burst(W-76-ox,y+ch-20-oy,30,['#ff4a8a','#ffd23c','#4ef0b0','#fff'],150,60,1,200); floats.push({s:'+'+q.rw+' конфет!',x:W/2-ox,y:y+ch/2-oy,t:0,life:1.6,size:15,col:['#fff','#ff8ad0'],pop:1}); },done?'#4ed05a':'#4a3a5a',14); buttons[buttons.length-1].label='q'+i; });
 const yb=tp+24+3*(ch+8)+6; T('Конфеты: '+(save.candy|0)+' — трать в Домике',W/2,yb,12,'#ff8ad0'); for(const f of floats){ const k=f.t/f.life; T(f.s,f.x+ox,f.y+oy-k*14,f.size,f.col); } }
// ---------- настройки (12,13,14,16) ----------
function drawSettings(){ drawBG(2,0,now); swipePager=null; const tp=TAP(); iconBtn(4,4,icBack,()=>goBack(),'back'); T('Настройки',W/2,tp/2-10,17,['#fff','#4ef0ff']); const S=SET();
 const rows=[
  ['Звук',save.mute?'ВЫКЛ':'ВКЛ',!save.mute,()=>setMute(!save.mute),''],
  ['Вибро',S.vib?'ВКЛ':'ВЫКЛ',S.vib,()=>{ S.vib=!S.vib; store(); if(S.vib) haptic('medium'); },inTG?'Telegram HapticFeedback':(navigator.vibrate?'вибромотор телефона':'нет вибро на этом устройстве')],
  ['Ночь',{auto:'АВТО',on:'ВКЛ',off:'ВЫКЛ'}[S.night],S.night!=='off',()=>{ S.night={auto:'on',on:'off',off:'auto'}[S.night]; store(); },S.night==='auto'?'по часам: 20:00–6:00'+(isNight()?' (сейчас ночь)':''):'фонарики у слизней'],
  ['Наклон',S.gyro?(gyro.on?'ВКЛ':'…'):'ВЫКЛ',S.gyro,()=>{ S.gyro=!S.gyro; store(); if(S.gyro) gyroStart(); else gyroStop(); },gyro.msg||(gyro.on?'наклон: '+Math.round(gyro.g)+'°':'наклоняй телефон — гравитация чуть съедет')],
  ['Крик',S.mic?(mic.on?'ВКЛ':'…'):'ВЫКЛ',S.mic,()=>{ S.mic=!S.mic; store(); if(S.mic) micStart(); else micStop(); },mic.msg||(mic.on?'громкость: '+'▮'.repeat(Math.min(10,Math.round(mic.lvl*40)))+(mic.lvl>.16?' АААА!':''):'крикни в полёте — слизень ускорится')]];
 const rh=Math.max(tp+30,74); rows.forEach(([nm,val,on,cb,sub],i)=>{ const y=tp+20+i*rh; panel(12,y,W-24,rh-8,'#2b1a4a'); T(nm,24,y+8,15,'#fff','l'); T(sub,24,y+rh-28,10,sub===gyro.msg||sub===mic.msg?'#ff8ab0':'#c8b8e0','l');
  btn(W-118,y+6,96,tp,val,()=>{sfx('tap');cb();},on?'#4ed05a':'#6a5a7a',14); buttons[buttons.length-1].label='set'+i; });
 T('микрофон и датчики — только по твоему тапу',W/2,tp+20+rows.length*rh+4,10,'#a898c8'); }
function icGear(){ ctx.fillStyle='#fff'; ctx.fillRect(-3,-6,6,12); ctx.fillRect(-6,-3,12,6); ctx.fillRect(-5,-5,10,10); ctx.fillStyle='#6a4fd8'; ctx.fillRect(-2,-2,4,4); }
// ---------- 7: выбор команды эстафеты ----------
function drawRelayPick(){ drawBG(0,0,now); swipePager=null; const tp=TAP(); iconBtn(4,4,icBack,()=>goBack(),'back'); T('Эстафета',W/2,tp/2-10,17,['#fff','#ffb03c']); T('собери команду из 3 слизней',W/2,tp/2+10,10,'#fff3d8');
 const pool=CHARS.map((c,i)=>i).filter(i=>unlocked(i)), cols=4, cw=Math.floor((W-16)/cols), chh=Math.max(TAP()+12,58), rows=Math.min(Math.ceil(pool.length/cols),Math.max(3,Math.floor((H-tp*3-150)/chh)));
 const per=cols*rows, pages=Math.ceil(pool.length/per); if(selPage>=pages) selPage=0;
 pool.slice(selPage*per,selPage*per+per).forEach((i,k)=>{ const c=CHARS[i], x=8+(k%cols)*cw, y=tp+24+Math.floor(k/cols)*chh, n=relayPick.indexOf(i); panel(x+1,y,cw-2,chh-3,n>=0?'#6a3a1a':'#2b1a4a');
  ctx.save(); ctx.beginPath(); ctx.rect(x+2,y+1,cw-4,chh-5); ctx.clip(); drawSlug(c.id,'idle',frameOf('idle',now+i*.3),x+cw/2,y+chh-20); ctx.restore(); T(c.name.length>9?c.name.slice(0,8)+'…':c.name,x+cw/2,y+chh-16,9,'#fff'); if(n>=0) T(String(n+1),x+6,y+3,14,'#ffd23c','l');
  buttons.push({x,y,w:cw,h:chh-3,label:'r'+i,cb:()=>{ const j=relayPick.indexOf(i); if(j>=0) relayPick.splice(j,1); else if(relayPick.length<3) relayPick.push(i); else { relayPick.shift(); relayPick.push(i); } sfx('candy',relayPick.length); haptic('tick'); }}); });
 let y=tp+24+rows*chh+4; if(pages>1){ pager(y,selPage,pages,v=>selPage=v,'rp'); y+=tp+4; }
 panel(12,y,W-24,40,'#22143e'); T(relayPick.length?relayPick.map(i=>CHARS[i].name).join(' → '):'тапни трёх по порядку',W/2,y+12,12,relayPick.length===3?'#ffd23c':'#e8dcff');
 const ok=relayPick.length===3; btn(W/2-80,Math.min(H-tp-6,y+50),160,tp,ok?'ПОЕХАЛИ':'нужно 3',()=>{ if(!ok){ sfx('bounce',40); return; } sfx('win'); relayTeam=relayPick.slice(); fusion=null; useSecret=false; scene='levels'; },ok?'#ff9a1c':'#4a3a5a',16); buttons[buttons.length-1].label='relaygo';
 const hy=Math.min(H-30,y+56+tp); T('каждый бросок — следующий слизень,',W/2,hy,10,'#c8b8e0'); T('с того места, где шмякнулся прошлый. +1 бросок',W/2,hy+14,10,'#c8b8e0'); }
// ---------- меню v4 ----------
function drawMenuV4(){ drawBG(0,Math.sin(now*.2)*30,now); const night=isNight();
 const gy=H-60; ctx.fillStyle='#2a1838'; ctx.fillRect(0,gy+16,W,H-gy);
 themeOfCur=0; if(!bgCache.menuGround){ const [c,x]=mk(W,60); blockPaint(x,[-2,0,W+4,60],THEMES[0],'g',5); bgCache.menuGround=c; } ctx.drawImage(bgCache.menuGround,0,gy+16);
 if(night){ ctx.fillStyle='rgba(6,6,30,.55)'; ctx.fillRect(0,0,W,H); seed=12; for(let i=0;i<30;i++){ const sx=rnd()*W|0, sy=rnd()*H*.5|0; if((now*2+i)%5>.6){ ctx.fillStyle='#fff'; ctx.fillRect(sx,sy,1,1);} } }
 if(isHalloween()) for(let i=0;i<4;i++){ const px=Math.round(W*(i+.5)/4), py=gy+14; dsc(px,py,6,'#ff8a1c'); ctx.fillStyle='#3a8a2a'; ctx.fillRect(px-1,py-9,2,3); ctx.fillStyle='#1a0c22'; ctx.fillRect(px-3,py-2,2,2); ctx.fillRect(px+2,py-2,2,2); ctx.fillRect(px-2,py+2,5,1); if(night){ ctx.fillStyle='#ffe066'; ctx.fillRect(px-3,py-2,1,1); ctx.fillRect(px+2,py-2,1,1);} }
 if(isNewYear()){ seed=5; for(let i=0;i<50;i++){ const sx=(rnd()*W+now*10*(rnd()+.2))%W|0, sy=(rnd()*H+now*30*(rnd()+.3))%H|0; ctx.fillStyle='#fff'; ctx.fillRect(sx,sy,1,1); if(i%5===0){ ctx.fillRect(sx-1,sy,3,1); ctx.fillRect(sx,sy-1,1,3);} } }
 for(const m of menuSlugs){ const a=m.vy<0||m.y<m.gy-1?'fly':'idle'; drawSlugM(m.id,a,frameOf(a,now+m.o),m.x,m.y,m.flip,1+(m.sq||0)*.25,1-(m.sq||0)*.25); if(night&&a==='idle'){ const lx=Math.round(m.x+12), ly=Math.round(m.y-14); ctx.fillStyle='#1a0c22'; ctx.fillRect(lx-3,ly,6,7); ctx.fillStyle=(now*10+m.o*7|0)%9?'#ffe066':'#fff6b0'; ctx.fillRect(lx-2,ly+1,4,5); ctx.globalAlpha=.2; ctx.fillRect(lx-6,ly-3,12,13); ctx.globalAlpha=1; } }
 // логотип (тап ×7 — секрет)
 const title='ШМЯКОДРОМ'; const ty=Math.floor(H*.13); const cs=[...title].map(g=>txt(g,26,['#fff6b0','#ffd23c','#ff9a1c','#ff5a3c'],'#2a0c22')); let tw=0; cs.forEach(c=>tw+=c.width-3); let x0=W/2-tw/2; const L0=x0;
 cs.forEach((c,i)=>{ const hop=logoTaps.length&&now-logoTaps[logoTaps.length-1]<.25&&i===(logoTaps.length-1)%9?-6:0; const b=Math.round(Math.sin(now*4+i*.6)*3)+hop; ctx.drawImage(c,Math.round(x0),ty+b); x0+=c.width-3; });
 buttons.push({x:L0,y:ty-4,w:tw,h:44,label:'logo',cb:()=>logoTap()});
 T(isHalloween()?'слизни-рогатки • ШМЯКОУИН!':isNewYear()?'слизни-рогатки • С НОВЫМ ШМЯКОМ!':isApril1()?'слизни-рогатки • усатые с 1 апреля':'слизни-рогатки',W/2,ty+44,13,'#7affe0');
 const tp=TAP(), gap=8, by=Math.floor(Math.max(ty+70,H*.3)); const pw=Math.min(W-40,240);
 btn(W/2-pw/2,by,pw,tp+6,'ИГРАТЬ',()=>{sfx('tap');relayTeam=null;scene='levels';tgBack(true);},'#4ed05a',19); buttons[buttons.length-1].label='play';
 const cw=Math.floor((Math.min(W-24,300)-gap)/2), gx=Math.round(W/2-cw-gap/2); const chaosOk=totalStars()>=CHAOS_STARS, qr=questReady();
 const G=[['СЛИЗНИ','#ff5aa8',()=>{scene='select';},'slugs'],[chaosOk?'ХАОС':'ХАОС ★'+CHAOS_STARS,chaosOk?'#c03ad0':'#4a3a5a',()=>{ if(!chaosOk){ sfx('bounce',40); haptic('error'); floats.push({s:'Хаос откроется на ★'+CHAOS_STARS,x:W/2-ox,y:by-oy-8,t:0,life:1.4,size:11,col:'#ffd23c'}); return 'x'; } sfx('win'); relayTeam=null; chaosStart(); return 'x'; },'chaos'],
  ['ЭСТАФЕТА','#ff9a1c',()=>{ relayPick=relayTeam?relayTeam.slice():[]; selPage=0; scene='relay'; },'relay'],['ДОМИК','#e0607a',()=>{ scene='house'; },'house'],
  [qr?'ЗАДАНИЯ ('+qr+')':'ЗАДАНИЯ',qr?'#2ab05a':'#3a8a7a',()=>{ scene='quests'; },'quests'],['БЕСТИАРИЙ','#6a4fd8',()=>{ bestPage=0; scene='bestiary'; },'bestiary']];
 G.forEach(([lb,col,cb,id],k)=>{ const x=gx+(k%2)*(cw+gap), y=by+tp+6+gap+Math.floor(k/2)*(tp+gap); btn(x,y,cw,tp,lb,()=>{ const r=cb(); if(r!=='x'){ sfx('tap'); tgBack(true); } },col,lb.length>9?13:15); buttons[buttons.length-1].label=id; if(id==='quests'&&qr){ ctx.fillStyle='#ff3a5a'; disc(x+cw-4,y+2,5,'#ff3a5a'); } });
 iconBtn(W-4-TAP(),4,icMute,()=>setMute(!save.mute),'mute'); iconBtn(4,4,icGear,()=>{sfx('tap');scene='settings';tgBack(true);},'settings');
 let my=by+tp+6+gap+3*(tp+gap)+4; if(save.chaos&&save.chaos.best){ T('рекорд хаоса: '+save.chaos.best,W/2,my,10,'#ffb0ff'); my+=14; }
 const tot=save.stars.reduce((a,b)=>a+(b||0),0); const s1=tot+' / '+LV.length*3; starIcon(W/2-98,my+7,true); T(s1,W/2-88,my+4,12,'#ffd23c','l'); T('◆ '+gemsHave().length+'/'+SECRETS.length,W/2-12,my+4,12,'#7affff','l'); candy(W/2+50,my+11,now,0); T(String(save.candy|0),W/2+58,my+4,12,'#ff8ad0','l');
 if(save.legacy) T('+'+save.legacy+' ★ из старой версии',W/2,my+22,10,'#d8c8f0');
 for(const f of floats){ const k=f.t/f.life; T(f.s,f.x+ox,f.y+oy-k*14,f.size,f.col); } }

function relayTick(){ if(!relay||!world||world.result) return; const s=world.s; if(s.st==='idle'&&world.used>relay.sw&&!world.clone&&sAnim.a!=='recover'&&sAnim.a!=='splat'&&!drag&&world.shots>0){ relay.sw=world.used; relay.i=(relay.i+1)%relayTeam.length; const c=CHARS[relayTeam[relay.i]]; world.setChar(c); world.shield=world.has('shield')?1:0; sfx('portal'); haptic('medium'); burst(s.x,s.y,24,[c.col,'#fff','#ffb03c'],120,30,.6); floats.push({s:'Эстафета → '+c.name+'!',x:Math.max(70,Math.min(LW-70,s.x)),y:Math.max(60,s.y-44),t:0,life:1.3,size:13,col:['#fff',c.col],pop:1}); sAnim={a:'recover',t:.3}; } }
function v4Win(lines,stars){ const ch=PC();
 if(world.bossDown&&world.boss){ const k=world.boss.k; if(!Array.isArray(save.boss)) save.boss=[]; const first=!save.boss[k]; save.boss[k]=true; save.stats.bosses++; lines.unshift([(first?'БОСС ПОВЕРЖЕН ВПЕРВЫЕ! ':'Босс повержен! ')+'+1500','#ffd23c',12]); }
 if(chaosRun){ qEv('chaoswin'); return; } qEv('win'); if(stars>=3) qEv('win3star'); if(relay) qEv('relaywin'); if(world.wx) qEv('wxwin'); if(world.ab==='slowmo'&&!relay) qEv('win_slowmo');
 if(fusion&&fusion.level===curLevel){ qEv('hybwin'); if(hybDiscover(fusion.a,fusion.b)) lines.push(['✦ '+ch.name+' — в бестиарии!','#7affe0',11]); }
 const luck=world.has('lucky')?3:1; if(Math.random()<.08*luck){ const all=hybAll(), got=new Set(hybList()), left=all.filter(([a,b])=>!got.has(hybKey(a,b))); if(left.length){ const [a,b]=left[Math.random()*left.length|0]; hybDiscover(a,b); lines.push(['✦ Редкая находка: '+fusedChar(a,b).name+'!','#ff9aff',12]); sfx('secret'); } }
 if(lines.length>5) lines.length=5; store(); }
// ---------- ввод ----------
function lp(e){ const r=cv.getBoundingClientRect(); return [(e.clientX-r.left)*W/r.width,(e.clientY-r.top)*H/r.height]; }
const hit=(x,y)=>{ for(let i=buttons.length-1;i>=0;i--){const b=buttons[i]; if(x>=b.x&&x<b.x+b.w&&y>=b.y-1&&y<b.y+b.h+2) return b;}
 // A2: страховка — цель касания не меньше 44 CSS px (расширяем вокруг центра, ближайшая кнопка)
 const m=TAP(); let best=null, bd=1e9; for(const b of buttons){ const cx=b.x+b.w/2, cy=b.y+b.h/2, hw=Math.max(b.w,m)/2, hh=Math.max(b.h,m)/2; if(Math.abs(x-cx)<=hw&&Math.abs(y-cy)<=hh){ const d=Math.hypot(x-cx,y-cy); if(d<bd){bd=d;best=b;} } } return best; };
let swipe=null;
cv.addEventListener('pointerdown',e=>{ audioInit(); if(SET().gyro&&!gyro.on&&!gyro.tried) gyroStart(); if(SET().mic&&!mic.on&&!mic.tried) micStart(); const [x,y]=lp(e); swipe=(scene!=='play'||overlay)?{x,y,t:performance.now()}:null; const b=hit(x,y); if(b){ pressed=b; return; }
 if(scene==='play'&&world&&!overlay&&world.s.st==='fly'&&PC().tap){ if(world.has('slowmo')) world.slow=true; else world.ability(); return; }
 if(scene==='play'&&world&&!overlay&&world.canLaunch()){ drag={x0:x-ox,y0:y-oy,cx:x-ox,cy:y-oy,id:e.pointerId}; lastPullF=-1; try{cv.setPointerCapture(e.pointerId)}catch(_){} } });
cv.addEventListener('pointermove',e=>{ const [x,y]=lp(e); if(drag){ drag.cx=x-ox; drag.cy=y-oy; const f=Math.round(Math.min(1,Math.hypot(drag.cx-drag.x0,drag.cy-drag.y0)/MAXDRAG)*7); if(f!==lastPullF){ if(lastPullF>=0) {sfx('stretch',f); if(f%2===0)haptic('tick');} lastPullF=f; } }
 else if(pressed){ const b=hit(x,y); if(b!==pressed&&!(b&&b.label===pressed.label)) pressed=null; if(swipe&&Math.abs(x-swipe.x)>24) pressed=null; } });
function up(e){ const [x,y]=lp(e); if(swipe&&swipePager&&scene!=='play'){ const dx=x-swipe.x, dy=y-swipe.y; const sw=swipe; swipe=null; if(Math.abs(dx)>40&&Math.abs(dx)>Math.abs(dy)*1.5&&performance.now()-sw.t<800){ pressed=null; const P=swipePager; sfx('tap'); P.set(dx<0?(P.page+1)%P.pages:(P.page+P.pages-1)%P.pages); return; } } if(world) world.slow=false; if(drag){ const d=drag; drag=null; if(world&&world.launch(d.cx-d.x0,d.cy-d.y0)){ } return; }
 if(pressed){ const b=hit(x,y); const p=pressed; pressed=null; if(b&&b.label===p.label) p.cb(); } }
cv.addEventListener('pointerup',up); cv.addEventListener('pointercancel',()=>{drag=null;pressed=null;});
window.addEventListener('keydown',e=>{ if(e.key==='r'&&scene==='play')startLevel(curLevel); if(e.key==='Escape')goBack(); });


function drawCover(){ W=320; H=180; cv.width=W; cv.height=H; cv.style.width='640px'; cv.style.height='360px'; cv.style.left='0px'; bgCache={}; ctx.imageSmoothingEnabled=false; now=2.1;
 drawBG(0,20,now);
 themeOfCur=0; const [gc,gx]=mk(W+4,40); blockPaint(gx,[0,0,W+4,40],THEMES[0],'g',11); ctx.drawImage(gc,-2,143);
 // лужицы слизи
 [[150,143,'#ff7ab8'],[176,143,'#ff7ab8'],[128,143,'#ffd93c']].forEach(([x,y,c])=>{ ctx.fillStyle='#1a0c22'; ctx.fillRect(x-9,y-1,19,3); ctx.fillStyle=c; ctx.fillRect(x-8,y-1,17,2); ctx.fillRect(x+12,y,3,1); ctx.fillRect(x-14,y,2,1); });
 jar(280,143,1.3,true);
 candy(160,74,.4,0); candy(246,70,1.1,1); candy(92,80,2.2,2);
 // траектория для летящего
 ctx.fillStyle='#fff'; [[120,108],[134,96],[150,88],[166,84],[182,84]].forEach(([x,y],i)=>{ ctx.fillStyle='#1a0c22'; ctx.fillRect(x-1,y-1,4,4); ctx.fillStyle=i%2?'#ffd93c':'#fff'; ctx.fillRect(x,y,2,2); });
 drawSlug('slug34','pull',6,108,130,false);            // Лужица оттягивается
 drawSlug('slug36','fly',2,210,94,false,1.15,.88);   // Ёжик в полёте
 for(let i=0;i<14;i++){ ctx.fillStyle=i%2?'#ffd93c':'#fff'; ctx.fillRect(190-i*3,98+((i*7)%9)-4,1,1); }
 drawSlug('slug41','splat',5,160,130,false);           // Пончик-блин
 drawSlug('slug01','idle',2,28,130,false);             // Желейка
 drawSlug('slug53','idle',4,246,130,true);             // Лавыч у банки
 T('ПЛЮХ!',160,104,11,['#fff','#ffd23c']);
 // лого
 const cs=[...'ШМЯКОДРОМ'].map(g=>txt(g,25,['#fff6b0','#ffd23c','#ff9a1c','#ff5a3c'],'#2a0c22')); let tw=0; cs.forEach(c=>tw+=c.width-3); let x0=W/2-tw/2;
 cs.forEach((c,i)=>{ ctx.drawImage(c,Math.round(x0),12+Math.round(Math.sin(i*.9)*2)); x0+=c.width-3; });
 T('слизни-рогатки',W/2,47,12,'#7affe0');
}

function calmBG(sunX,sunY){ const cs=['#2a1848','#4a2462','#7c3270','#b44a6e','#e3705e','#f6a463'].map(hex),n=cs.length-1; const img=ctx.createImageData(W,H),p=img.data;
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){ const v=y/(H*.86)*n; const b=(BAYER[(y&3)*4+(x&3)]+.5)/16; let k=Math.min(n,Math.floor(v)+((v%1)>b?1:0)); const c=cs[k],i=(y*W+x)*4; p[i]=c[0];p[i+1]=c[1];p[i+2]=c[2];p[i+3]=255; }
 ctx.putImageData(img,0,0);
 const r=26; for(let yy=-r;yy<=r;yy++)for(let xx=-r;xx<=r;xx++) if(xx*xx+yy*yy<=r*r){ if(yy>6&&((yy+r)%7<2))continue; ctx.fillStyle=yy<-10?'#fff0b8':yy<4?'#ffe08a':'#ffb070'; ctx.fillRect(sunX+xx,sunY+yy,1,1);} 
 for(let x=0;x<W;x++){ const t1=H-46-10*Math.sin(x*.025+1)-6*Math.sin(x*.06); ctx.fillStyle='#6a2f6c'; ctx.fillRect(x,t1|0,1,H); ctx.fillStyle='#8a4080'; ctx.fillRect(x,t1|0,1,1);
  const t2=H-26-4*Math.sin(x*.05+3); ctx.fillStyle='#3a1a4a'; ctx.fillRect(x,t2|0,1,H); } }
function logo(cx,y,size){ const cs=[...'ШМЯКОДРОМ'].map(g=>txt(g,size,['#fff6b0','#ffd23c','#ff9a1c','#ff5a3c'],'#2a0c22')); let tw=0; cs.forEach(c=>tw+=c.width-3); let x0=cx-tw/2; cs.forEach(c=>{ctx.drawImage(c,Math.round(x0),y); x0+=c.width-3;}); return tw; }
function big(id,a,f,x,y,k,flip){ ctx.save(); ctx.translate(x,y); ctx.scale(k,k); drawSlug(id,a,f,0,0,flip); ctx.restore(); }
window.__cover2=v=>{ coverMode=true; W=320;H=180; cv.width=W;cv.height=H; ctx.imageSmoothingEnabled=false;
 if(v==='A'){ calmBG(160,128); logo(160,14,28); T('слизни-рогатки',160,47,12,'#ffffff'); big('slug01','pull',4,198,132,2); ctx.fillStyle='rgba(20,6,30,.35)'; }
 if(v==='B'){ calmBG(250,120); logo(108,34,19); T('слизни-рогатки',108,62,11,'#ffffff');
  for(let i=0;i<9;i++){ const t=i/8, x=28+t*180, y=160-Math.sin(t*Math.PI*.62)*62; ctx.fillStyle='#2a0c22'; ctx.fillRect(x-2|0,y-2|0,5,5); ctx.fillStyle='#fff'; ctx.fillRect(x-1|0,y-1|0,3,3); }
  candy(150,112,0,1); big('slug01','fly',2,262,104,2); }
 if(v==='C'){ calmBG(160,150); logo(160,22,28); T('слизни-рогатки',160,60,12,'#ffffff'); ['slug01','slug34','slug36','slug41','slug53'].forEach((id,i)=>drawSlug(id,'idle',(i*2)%6,40+i*60,140)); }
};

function bgLayers(ti,dx=0){ const L=bgCache[ti]||(bgCache[ti]=genBG(ti)); for(const l of L) ctx.drawImage(l.c,Math.round(-40-dx*l.sp),0); }
function logoL(cx,y,size,cols,out,skip){ const g=[...'ШМЯКОДРОМ'], cs=g.map(c=>txt(c,size,cols,out)); let tw=0; cs.forEach(c=>tw+=c.width-3); let x0=cx-tw/2; const pos=[];
 cs.forEach((c,i)=>{ pos.push([Math.round(x0),y,c.width,c.height]); if(!(skip&&skip.includes(i))) ctx.drawImage(c,Math.round(x0),y); x0+=c.width-3; }); return pos; }
function drips(pos,col,dark,seedv,idx){ seed=seedv; pos.forEach((p,i)=>{ if(idx&&!idx.includes(i))return; const n=1+(rnd()*2|0); for(let k=0;k<n;k++){ const x=p[0]+4+rnd()*(p[2]-10)|0, y=p[1]+p[3]-4, l=4+rnd()*12|0;
  ctx.fillStyle=dark; ctx.fillRect(x-1,y,5,l+1); ctx.fillRect(x,y+l,3,2); ctx.fillStyle=col; ctx.fillRect(x,y,3,l); ctx.fillRect(x+1,y+l,1,1); ctx.fillStyle='#fff'; ctx.fillRect(x,y+1,1,2); } }); }
function glow(x,y,r,col,a=.12){ ctx.fillStyle=col; for(let k=r;k>4;k-=5){ ctx.globalAlpha=a; ctx.beginPath(); ctx.arc(x,y,k,0,7); ctx.fill(); } ctx.globalAlpha=1; }
function vign(){ for(let i=0;i<10;i++){ ctx.fillStyle='rgba(10,2,20,.06)'; ctx.fillRect(0,0,W,i*1+1); ctx.fillRect(0,H-i-1,W,i+1); ctx.fillRect(0,0,i+1,H); ctx.fillRect(W-i-1,0,i+1,H);} }
const GOLD=['#fff6b0','#ffd23c','#ff9a1c','#ff5a3c'];
window.__cover3=n=>{ coverMode=true; W=320;H=180; cv.width=W;cv.height=H; ctx.imageSmoothingEnabled=false; bgCache={};
 if(n===1){ bgLayers(0,10); glow(230,110,70,'#ffd27c',.07);
  // ground
  themeOfCur=0; const [gc,gx]=mk(W+4,30); blockPaint(gx,[0,0,W+4,30],THEMES[0],'g',3); ctx.drawImage(gc,-2,156);
  // рогатка-вилка из ветки (Y)
  const tw='#5a3020', tl='#8a5434', th='#b87a48', ol='#1e0e12';
  const seg=(x0,y0,x1,y1,w)=>{ const st=Math.max(Math.abs(x1-x0),Math.abs(y1-y0)); for(let i=0;i<=st;i++){ const x=x0+(x1-x0)*i/st|0, y=y0+(y1-y0)*i/st|0; ctx.fillStyle=ol; ctx.fillRect(x-w/2-1,y-1,w+2,3); } for(let i=0;i<=st;i++){ const x=x0+(x1-x0)*i/st|0, y=y0+(y1-y0)*i/st|0; ctx.fillStyle=tw; ctx.fillRect(x-w/2,y,w,1); ctx.fillStyle=tl; ctx.fillRect(x-w/2+1,y,Math.max(1,w/2-1),1); ctx.fillStyle=th; ctx.fillRect(x-w/2+1,y,1,1);} };
  seg(262,158,262,118,10); seg(262,120,242,84,7); seg(262,120,286,82,7);
  ctx.fillStyle='#7fd64a'; ctx.fillRect(279,94,6,3); ctx.fillRect(282,91,3,3);
  // резинка: от рогов к слизню
  const sx=120, sy=126; ctx.fillStyle='#1e0e12'; const band=(x0,y0)=>{ const st=Math.max(Math.abs(sx-x0),Math.abs(sy-y0)); for(let i=0;i<=st;i++){ ctx.fillStyle='#1e0e12'; ctx.fillRect(x0+(sx-x0)*i/st-1|0,y0+(sy-y0)*i/st-1|0,3,4);} for(let i=0;i<=st;i++){ ctx.fillStyle='#ff4fa8'; ctx.fillRect(x0+(sx-x0)*i/st|0,y0+(sy-y0)*i/st|0,1,2);} };
  band(286,84);
  big('slug01','pull',7,196,142,2);
  band(242,86);
  // лого вверху, капли
  const p=logoL(160,12,28,GOLD,'#2a0c22'); drips(p,'#b48cff','#3a1a5a',5,[1,3,6,8]); T('тяни • целься • ШМЯК!',160,48,10,'#fff');
  vign(); }
 if(n===2){ bgLayers(2,0); glow(160,70,90,'#4ef0ff',.05);
  const p=logoL(160,60,30,GOLD,'#2a0c22');
  // лава-подтёки из удара
  drips(p,'#ff7a2a','#5a1a0a',9,[3,4,5]);
  // трещины-лучи удара
  ctx.fillStyle='#fff6b0'; [[-1,-1],[1,-1],[-1.4,0],[1.4,0],[0,-1.3]].forEach(([a,b])=>{ for(let i=10;i<22;i++) ctx.fillRect(166+a*i|0,58+b*i|0,2,2); });
  big('slug53','splat',5,166,38,2);
  // выглядывают снизу
  ctx.fillStyle='#0a0e24'; ctx.fillRect(0,160,W,20);
  ctx.save(); ctx.beginPath(); ctx.rect(0,0,W,163); ctx.clip(); drawSlug('slug01','idle',3,70,164); drawSlug('slug36','idle',1,250,166,true); ctx.restore();
  ctx.fillStyle='#4ef0ff'; ctx.fillRect(0,162,W,1);
  T('ПЛЮХ!',236,30,12,['#fff','#ff9a1c'],'c','#2a0c22');
  vign(); }
 if(n===3){ // половина болото, половина неон
  bgLayers(0,0); ctx.save(); ctx.beginPath(); ctx.rect(160,0,160,H); ctx.clip(); bgLayers(2,0); ctx.restore();
  // портал
  const px=160, py=104; glow(px,py,60,'#b06aff',.08);
  for(let a=0;a<6.28;a+=.02){ for(let r=26;r<34;r++){ const k=(Math.sin(a*6+r*.6)+1)/2; ctx.fillStyle=r<28?'#ffffff':k>.5?'#b06aff':'#4ef0ff'; ctx.fillRect(px+Math.cos(a)*r*.62|0,py+Math.sin(a)*r|0,1,1);} }
  ctx.fillStyle='#120818'; for(let yy=-25;yy<=25;yy++){ const w=Math.sqrt(1-(yy/26)**2)*16|0; ctx.fillRect(px-w,py+yy,w*2+1,1);} 
  // speed lines
  seed=4; for(let i=0;i<18;i++){ const y=50+rnd()*110|0, x=170+rnd()*60|0, l=20+rnd()*40|0; ctx.fillStyle=i%3?'rgba(255,255,255,.7)':'#4ef0ff'; ctx.fillRect(x,y,l,1); }
  big('slug36','fly',2,226,108,2);
  // лого аркада
  const p=logoL(160,10,28,['#ffffff','#9ff6ff','#4ef0ff','#2a7ad0'],'#120626'); T('ИЗ БОЛОТА — В НЕОН',160,46,10,'#ffd23c');
  vign(); }
 if(n===4){ bgLayers(1,0); glow(160,80,100,'#ff7ac0',.05);
  const p=logoL(160,62,30,['#e8d8ff','#b48cff','#8a5ae0','#5a2ab0'],'#1e0a30',[4]);
  drips(p,'#b48cff','#1e0a30',21,[0,2,6,8]);
  // Пончик вместо первой О
  const o=p[4]; drawSlug('slug41','idle',0,o[0]+o[2]/2-2,o[1]+o[3]/2-2);
  // Желейка сидит на букве Я
  drawSlug('slug01','idle',2,p[2][0]+p[2][2]/2,p[2][1]-14);
  T('слизни-рогатки',160,124,12,'#ffd23c');
  vign(); }
};

const GL={'Ш':['#.#.#','#.#.#','#.#.#','#.#.#','#.#.#','#.#.#','#####'],'М':['#...#','##.##','#.#.#','#.#.#','#...#','#...#','#...#'],
 'Я':['.####','#...#','#...#','.####','..#.#','.#..#','#...#'],'К':['#...#','#..#.','#.#..','##...','#.#..','#..#.','#...#'],
 'О':['.###.','#...#','#...#','#...#','#...#','#...#','.###.'],'Д':['.###.','.#.#.','.#.#.','.#.#.','.#.#.','#####','#...#'],'Р':['####.','#...#','#...#','####.','#....','#....','#....']};
function bigLogo(cx,y,c=4,pal=['#fff6b0','#ffd23c','#ff8a1c','#d0401c'],out='#2a0c22',word='ШМЯКОДРОМ',wob=0){
 const lw=5*c, gap=c, tw=word.length*(lw+gap)-gap; let x0=Math.round(cx-tw/2); const cells=[];
 [...word].forEach((ch,i)=>{ const g=GL[ch], dy=Math.round(Math.sin(i*1.1+wob)*wob); for(let r=0;r<7;r++)for(let k=0;k<5;k++) if(g[r][k]==='#') cells.push([x0+i*(lw+gap)+k*c,y+dy+r*c,i,r,k]); });
 // тень, обводка, заливка
 ctx.fillStyle='rgba(10,0,20,.45)'; for(const [x,y2] of cells) ctx.fillRect(x+2,y2+4,c,c);
 ctx.fillStyle=out; for(const [x,y2] of cells) ctx.fillRect(x-2,y2-2,c+4,c+4);
 for(const [x,y2,i,r] of cells){ const t=r/6; ctx.fillStyle=t<.3?pal[0]:t<.55?pal[1]:t<.85?pal[2]:pal[3]; ctx.fillRect(x,y2,c,c); }
 for(const [x,y2,i,r,k] of cells){ const g=GL[[...word][i]]; if(r===0||g[r-1][k]!=='#'){ ctx.fillStyle='#ffffff'; ctx.fillRect(x,y2,c,1);} if(k===0||g[r][k-1]!=='#'){ ctx.fillStyle='rgba(255,255,255,.5)'; ctx.fillRect(x,y2,1,c);} }
 return {x:x0,w:tw,h:7*c}; }
function scale2x(src){ const w=src.width,h=src.height, sx=src.getContext('2d').getImageData(0,0,w,h).data; const [o,ox2]=mk(w*2,h*2); const img=ox2.createImageData(w*2,h*2), d=img.data;
 const P=(x,y)=>{ x=Math.max(0,Math.min(w-1,x)); y=Math.max(0,Math.min(h-1,y)); const i=(y*w+x)*4; return (sx[i]<<24|sx[i+1]<<16|sx[i+2]<<8|sx[i+3])>>>0; };
 const put=(x,y,v)=>{ const i=(y*w*2+x)*4; d[i]=v>>>24; d[i+1]=v>>>16&255; d[i+2]=v>>>8&255; d[i+3]=v&255; };
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){ const E=P(x,y),B=P(x,y-1),D=P(x-1,y),F=P(x+1,y),H2=P(x,y+1); let e0=E,e1=E,e2=E,e3=E;
  if(B!==H2&&D!==F){ e0=D===B?D:E; e1=B===F?F:E; e2=D===H2?D:E; e3=H2===F?F:E; } put(x*2,y*2,e0);put(x*2+1,y*2,e1);put(x*2,y*2+1,e2);put(x*2+1,y*2+1,e3); }
 ox2.putImageData(img,0,0); return o; }
function hero(id,anim,f,x,y,flip,k2=1){ const A=ANIM[anim]; const [c,cx]=mk(A.w,64); cx.drawImage(SPR[id],f*A.w,A.row*64,A.w,64,0,0,A.w,64); const s2=scale2x(c);
 const px=(anim==='pull'?96:32)*2, py=80; ctx.save(); ctx.translate(Math.round(x),Math.round(y)); if(flip)ctx.scale(-1,1); if(k2!==1)ctx.scale(k2,k2); ctx.drawImage(s2,-px,-py); ctx.restore(); }
function sky(cols){ const cs=cols.map(hex),n=cs.length-1, img=ctx.createImageData(W,H),p=img.data; for(let y=0;y<H;y++)for(let x=0;x<W;x++){ const v=y/H*n, b=(BAYER[(y&3)*4+(x&3)]+.5)/16; const k=Math.min(n,Math.floor(v)+((v%1)>b?1:0)); const c=cs[k],i=(y*W+x)*4; p[i]=c[0];p[i+1]=c[1];p[i+2]=c[2];p[i+3]=255;} ctx.putImageData(img,0,0); }
function disc(x,y,r,col){ ctx.fillStyle=col; for(let yy=-r;yy<=r;yy++){ const w=Math.sqrt(r*r-yy*yy)|0; ctx.fillRect(x-w,y+yy,w*2+1,1);} }
window.__logo=()=>{ coverMode=true; W=236;H=44; cv.width=W;cv.height=H; ctx.clearRect(0,0,W,H); bigLogo(118,6,4); return cv.toDataURL(); };
window.__cover4=n=>{ coverMode=true; W=320;H=180; cv.width=W;cv.height=H; ctx.imageSmoothingEnabled=false; bgCache={};
 if(n===5){ // лицо прижато к стеклу
  bgLayers(0,0); ctx.fillStyle='rgba(20,6,40,.35)'; ctx.fillRect(0,0,W,H);
  // слизь-пятно на стекле
  seed=8; disc(160,132,58,'#5a3aa0'); disc(160,132,54,'#7a52d0'); for(let i=0;i<10;i++){ const a=rnd()*6.28; disc(160+Math.cos(a)*56|0,132+Math.sin(a)*44|0,5+rnd()*7|0,'#7a52d0'); }
  for(let i=0;i<5;i++){ const x=110+i*24+(rnd()*8|0), l=10+rnd()*22|0; ctx.fillStyle='#8a62e0'; ctx.fillRect(x,170,5,10); ctx.fillRect(x,180,5,l);} 
  hero('slug01','idle',2,160,138,false,1);
  // блики стекла
  ctx.fillStyle='rgba(255,255,255,.18)'; for(let i=0;i<40;i++){ ctx.fillRect(20+i,170-i*2,3,2); ctx.fillRect(270+i*.5|0,120-i*2,2,2);} ctx.fillStyle='rgba(255,255,255,.5)'; ctx.fillRect(60,150,2,2); ctx.fillRect(266,60,2,6);
  bigLogo(160,14,4); T('...прилип к экрану',160,50,10,'#fff'); vign(); }
 if(n===6){ // консоль
  sky(['#1a0f30','#2c1650','#45207a']); glow(160,110,120,'#ff7ac0',.05);
  const dx=70,dy=64,dw=180,dh=106; ctx.fillStyle='#120818'; ctx.fillRect(dx-2,dy-2,dw+4,dh+4); ctx.fillStyle='#7a5ae0'; ctx.fillRect(dx,dy,dw,dh); ctx.fillStyle='#9a7af8'; ctx.fillRect(dx,dy,dw,3); ctx.fillStyle='#5a3ab0'; ctx.fillRect(dx,dy+dh-4,dw,4);
  ctx.fillStyle='#2a1a40'; ctx.fillRect(dx+40,dy+8,100,74);
  // экран: мини-игра
  ctx.save(); ctx.beginPath(); ctx.rect(dx+44,dy+12,92,66); ctx.clip(); ctx.translate(dx+44,dy+12); const L=bgCache[0]||(bgCache[0]=genBG(0)); ctx.drawImage(L[0].c,-60,-40); ctx.drawImage(L[2].c,-60,-70); ctx.drawImage(L[3].c,-60,-80);
  themeOfCur=0; const [g,gx]=mk(100,14); blockPaint(gx,[0,0,100,14],THEMES[0],'g',3); ctx.drawImage(g,-4,56); jar(78,56,1,true); candy(46,22,0,0); ctx.restore();
  // кнопки
  ctx.fillStyle='#120818'; ctx.fillRect(dx+12,dy+40,20,6); ctx.fillRect(dx+19,dy+33,6,20); ctx.fillStyle='#2a1a40'; ctx.fillRect(dx+13,dy+41,18,4); ctx.fillRect(dx+20,dy+34,4,18);
  disc(dx+156,dy+38,6,'#120818'); disc(dx+156,dy+38,5,'#ff4a8a'); disc(dx+168,dy+48,6,'#120818'); disc(dx+168,dy+48,5,'#ffd23c');
  // Пончик вылезает из экрана
  hero('slug41','idle',1,dx+92,dy+56,false); 
  ctx.fillStyle='#120818'; ctx.fillRect(dx+40,dy+82,100,2);
  bigLogo(160,10,4); T('карманный шмяк',160,44,10,'#7affe0'); vign(); }
 if(n===7){ // в космос
  sky(['#05051a','#0a0c2a','#141a44','#20306a']); seed=3; for(let i=0;i<120;i++){ ctx.fillStyle=rnd()<.2?'#fff':'#8a9ad0'; const x=rnd()*W|0,y=rnd()*H|0; ctx.fillRect(x,y,1,1); if(rnd()<.06){ctx.fillRect(x-1,y,3,1);ctx.fillRect(x,y-1,1,3);} }
  glow(262,52,40,'#e8f4ff',.08); disc(262,52,22,'#c8d4ee'); disc(256,46,16,'#e8f4ff'); disc(268,58,4,'#a8b4ce'); disc(254,58,3,'#a8b4ce'); disc(270,44,2,'#a8b4ce');
  // крошечное болото внизу
  for(let x=0;x<W;x++){ const t=H-10-3*Math.sin(x*.05); ctx.fillStyle='#24183a'; ctx.fillRect(x,t|0,1,20); ctx.fillStyle='#7fd64a'; ctx.fillRect(x,t|0,1,1);} drawSlug('slug34','idle',1,40,H-27); 
  // хвост-след
  for(let i=0;i<26;i++){ const t=i/25, x=60+t*130, y=H-30-t*t*82; ctx.fillStyle='#120818'; ctx.fillRect(x-2|0,y-2|0,5,5); ctx.fillStyle=i%2?'#b48cff':'#fff'; ctx.fillRect(x-1|0,y-1|0,3,3);} 
  hero('slug01','fly',2,222,108,false);
  bigLogo(118,12,4); T('до луны и обратно',118,46,10,'#ffd23c'); vign(); }
 if(n===8){ // VS
  ctx.fillStyle='#d0306a'; ctx.fillRect(0,0,W,H); ctx.fillStyle='#2a6ad0'; ctx.beginPath(); ctx.moveTo(180,0); ctx.lineTo(W,0); ctx.lineTo(W,H); ctx.lineTo(140,H); ctx.fill();
  for(let i=0;i<30;i++){ ctx.fillStyle='rgba(255,255,255,.08)'; ctx.fillRect(0,60+i*4,W,1);} 
  ctx.fillStyle='#fff6b0'; ctx.beginPath(); ctx.moveTo(176,50); ctx.lineTo(150,110); ctx.lineTo(164,110); ctx.lineTo(146,170); ctx.lineTo(186,96); ctx.lineTo(170,96); ctx.lineTo(190,50); ctx.fill();
  hero('slug53','idle',4,74,128,false); hero('slug01','idle',2,250,128,true);
  bigLogo(160,10,4); T('VS',162,104,28,['#fff','#ffd23c'],'c','#2a0c22'); T('ЛАВЫЧ',74,162,10,'#ffd23c'); T('ЖЕЛЕЙКА',250,162,10,'#ffd23c'); vign(); }
};
window.__cover=()=>{ coverMode=true; drawCover(); };
// ---------- цикл ----------
let last=performance.now();
function loop(t){ if(coverMode) return; let dt=Math.min(.05,(t-last)/1000); last=t; update(dt); render(); requestAnimationFrame(loop); }
function initMenuSlugs(){ const pool=CHARS.filter((c,i)=>unlocked(i)); if(save.eggs&&save.eggs.secret&&SPR.slugX) pool.push(SECRET); const pick=pool.length<=5?pool:[...pool.slice(0,3),...pool.slice(-2)]; menuSlugs=pick.map((c,i)=>({id:c.id,x:W*(i+1)/6,y:H-60+3,gy:H-60+3,vy:0,vx:0,o:i*.37,flip:i%2===1})); }
let spritesReady=false;
function rescale(){ const ch=resize(); if(ch&&spritesReady&&scene==='menu') initMenuSlugs(); return ch; }
tgInit(); rescale();
// первый запуск из кнопки TG «Играть»: expand() меняет высоту чуть позже — пересчитываем на всех событиях
try{ if(tg&&tg.onEvent) tg.onEvent('viewportChanged',rescale); }catch(e){}
window.addEventListener('resize',rescale); for(const ms of [50,300,800]) setTimeout(rescale,ms);
loadSprites().then(()=>{ buildSecretSprite(); if(!unlocked(selPick)) selPick=0; spritesReady=true; initMenuSlugs(); requestAnimationFrame(loop); });
// хуки для тестов
window.__game={get ox(){return ox},get oy(){return oy},v4:{BOSS,WXN,QUESTS,HAPT,PAT,SECRET,BIO,get gyro(){return gyro},get mic(){return mic},get hLast(){return hLast},haptic:k=>haptic(k),isNight:()=>isNight(),setDate:d=>{DATE_OVR=d;},questsToday:()=>questsToday(),qEv:(i,n)=>qEv(i,n),hybAll:()=>hybAll(),hybList:()=>hybList(),houseOf:id=>houseOf(id),feedSlug:c=>feedSlug(c),petSlug:(c,h)=>petSlug(c,h,100,300),logoTap:()=>logoTap(),get relay(){return relay},get relayTeam(){return relayTeam},set relayTeam(v){relayTeam=v},relayTick:()=>relayTick(),gyroStart:()=>gyroStart(),micStart:()=>micStart(),set gyroG(v){gyro.on=true;gyro.g=v},set useSecret(v){useSecret=v},get useSecret(){return useSecret},wxFX:dt=>wxFX(dt),isApril1:()=>isApril1(),isHalloween:()=>isHalloween(),isNewYear:()=>isNewYear(),set houseSel(v){houseSel=v},set bestTab(v){bestTab=v},set bestPage(v){bestPage=v},set relayPick(v){relayPick=v}},FUSE_SPEC, fuseCheck:(a,b)=>fuseCheck(a,b), grafList:li=>grafList(li), GRAF_CAP, get chaos(){return chaosRun}, chaosStart:()=>chaosStart(), MODS, COSI, cos:()=>cosGet(), anchors:id=>anchors(id), drawSlugC:(...a)=>drawSlugC(...a), SECRETS:()=>SECRETS, gemsHave:()=>gemsHave(), get imp(){return {idleT,impStage,bubble}}, IMP_LINES, grafAdd:(...a)=>grafAdd(...a), grafClear:li=>grafClear(li), rescale:()=>rescale(), get menuSlugs(){return menuSlugs}, get H(){return H}, get W(){return W},get fusion(){return fusion}, set fusion(v){fusion=v}, get fusePick(){return fusePick}, set fusePick(v){fusePick=v}, fusedChar:(a,b)=>fusedChar(a,b), PC:()=>PC(), set fixDt(v){FIXDT=v}, openPause:()=>openPause(), get buttons(){return buttons}, TAP:()=>TAP(), get SC(){return SC}, get DPR(){return DPR},set selPage(v){selPage=v}, set lvlPage(v){lvlPage=v;lvlPageInit=true}, get lvlPage(){return lvlPage}, migrateSave, levelStars, isOpen, pc:()=>drawPlay.pc, unlocked, totalStars, save, get scene(){return scene}, set scene(v){scene=v}, startLevel, get world(){return world}, World, LV, CHARS, setChar:i=>{selPick=i}, get overlay(){return overlay}, toLevel:(x,y)=>[x*W/ (cv.getBoundingClientRect().width)]};
})();
