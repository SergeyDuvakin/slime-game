'use strict';
window.__ASSET_V='4.3.0';
/* FB14: долгое нажатие — без выделения текста, лупы и контекстного меню (Telegram WebView / iOS / Android); поля ввода не трогаем */
(()=>{ const editable=t=>!!(t&&t.closest&&t.closest('input,textarea,select,[contenteditable]')); const stop=e=>{ if(!editable(e.target)) e.preventDefault(); };
 ['contextmenu','selectstart','dragstart','gesturestart'].forEach(k=>document.addEventListener(k,stop,{passive:false,capture:true}));
 document.addEventListener('touchstart',e=>{ if(e.target&&e.target.tagName==='CANVAS') e.preventDefault(); },{passive:false,capture:true});
 document.addEventListener('touchmove',e=>{ if(!editable(e.target)) e.preventDefault(); },{passive:false,capture:true});
 document.addEventListener('selectionchange',()=>{ const sl=window.getSelection&&window.getSelection(); if(sl&&sl.rangeCount&&!editable(document.activeElement)) sl.removeAllRanges(); }); })();
/* ШМЯКОДРОМ — пиксельная мини-игра про слизней-рогаток. Vanilla JS + Canvas. */
(()=>{
const K=4/3; let LW=320, LH=588; const R=13, RB=13, MAXDRAG=104, G0=620*K;
// Ф1м (ТЗ 26.9.6 + 26.10.11): магнит Медка — захват насовсем, разгон, радиус +бонус за скорость. Скорости/радиусы ×K
const MAG={R0:80,RBK:.05,RBMAX:40,V0:150,ACC:1800,VMAX:1000,MARGIN:120,PICK:17,RESET_T:.25,TRAIL:6,POP_GAP:.06};
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
 {id:'slug46',name:'Медок',perk:'Пчёлка-магнит',desc:'Тянет конфеты даже на лету',col:'#f0a828',ab:'magnet'},
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
 const st=sv.set&&typeof sv.set==='object'?sv.set:{}; sv.set={vib:st.vib!==false,gyro:!!st.gyro,mic:!!st.mic,night:['auto','on','off'].includes(st.night)?st.night:'auto',rm:!!st.rm,mfl:st.mfl!==false}; { const mf=sv.mfl&&typeof sv.mfl==='object'?sv.mfl:{}; sv.mfl={d:typeof mf.d==='string'?mf.d.slice(0,10):'',n:num(mf.n),egg:num(mf.egg)&255,let:num(mf.let)&511}; }
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
function tone(f,d,type='square',v=.3,slide=0,delay=0){ if(!AC)return; const t=AC.currentTime+delay; { const m=typeof chaosRun!=='undefined'&&chaosRun&&chaosRun.mod; if(m&&m.ts) f*=m.ts<1?.7:1.2; }
 const o=AC.createOscillator(),g=AC.createGain(); o.type=type; o.frequency.setValueAtTime(f,t);
 if(slide) o.frequency.exponentialRampToValueAtTime(Math.max(30,f*slide),t+d);
 g.gain.setValueAtTime(v,t); g.gain.exponentialRampToValueAtTime(.001,t+d); o.connect(g); g.connect(master); o.start(t); o.stop(t+d+.02); }
let noiseBuf=null;
function noise(d,v=.3,fc=1200,delay=0){ if(!AC)return; if(!noiseBuf){noiseBuf=AC.createBuffer(1,AC.sampleRate*.5,AC.sampleRate);const a=noiseBuf.getChannelData(0);for(let i=0;i<a.length;i++)a[i]=Math.random()*2-1;}
 const t=AC.currentTime+delay,s=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain(); s.buffer=noiseBuf; f.type='lowpass'; f.frequency.setValueAtTime(fc,t); f.frequency.exponentialRampToValueAtTime(80,t+d);
 g.gain.setValueAtTime(v,t); g.gain.exponentialRampToValueAtTime(.001,t+d); s.connect(f);f.connect(g);g.connect(master); s.start(t); s.stop(t+d); }
const SFX={
 uiDown:()=>tone(520,.03,'square',.06,.9), uiUp:()=>tone(780,.05,'triangle',.08,1.25), uiNo:()=>{tone(180,.07,'square',.08,.8); tone(150,.08,'square',.07,.8,.08);},
 uiOpen:()=>{tone(440,.05,'triangle',.07,1.5); tone(660,.06,'triangle',.06,1.3,.04);}, uiClose:()=>tone(520,.06,'triangle',.06,.6),
 uiToggle:on=>tone(on?880:440,.05,'square',.06,on?1.2:.8), count:()=>tone(1320,.018,'square',.035,1), countEnd:()=>{tone(990,.06,'triangle',.08,1.3);},
 logoBonk:i=>{tone(300+(i|0)*40,.08,'square',.1,.7); noise(.05,.06,1500);}, fling:()=>{noise(.12,.06,2200); tone(330,.1,'triangle',.06,1.8);},
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
 pop:n=>{tone(1320*Math.pow(2,(n|0)*2/12),.035,'square',.084,.35);tone(2200,.02,'triangle',.06,.5,.01)},
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
function setMute(m){ if(m&&!save.mute) muteT=now; save.mute=m; store(); if(master) master.gain.value=m?0:.5; }

// ---------- canvas ----------
const cv=document.getElementById('c'), ctx=cv.getContext('2d');
// A1: отдельный слой текста в нативных device-пикселях (чёткий текст)
const tcv=document.getElementById('t'), tctx=tcv?tcv.getContext('2d'):null; let coverMode=false;
let W=320,H=624,SC=1,DPR=1, ox=0, oy=0;
let lastWH=null;
// высота: максимум из innerHeight и обеих высот Telegram (нули/undefined игнорируем) — никогда только viewportStableHeight
function viewH(){ const c=[window.innerHeight]; if(tg){ c.push(tg.viewportHeight, tg.viewportStableHeight); } return Math.max(...c.filter(v=>v&&isFinite(v)&&v>0)); }
/* Ф0п: поле 390×760 без камеры; старые уровни 320×588 центрированы (+35,+172); масштаб по физ. пикселям + фолбэк (ТЗ 26.10.3) */
const FIELD_V2=true, FW=FIELD_V2?390:LW, FH=FIELD_V2?760:LH, HUD_TOP=44, HUD_BOT=8, S_KEEP=.9;
let fx=0, fy=0, SCS=1, FOX=FIELD_V2?35:0, FOY=FIELD_V2?172:0;
/* Ф0п П3: формат уровня — fw/fh (390×760 для перенесённых), без них — старое поле 320×588, центрированное (+35,+172) */
function setField(L){ const v2=FIELD_V2&&L&&L.fw===FW&&L.fh===FH; const nw=v2?FW:320, nh=v2?FH:588; if(nw!==LW||nh!==LH){ LW=nw; LH=nh; nightC=null; } FOX=FIELD_V2?(FW-LW)>>1:0; FOY=FIELD_V2?FH-LH:0; if(FIELD_V2){ ox=fx+FOX; oy=fy+FOY; } }
function resize(){ const d0=window.devicePixelRatio||1, vw=window.innerWidth, vh=viewH(); const key=vw+'x'+vh+'@'+d0; if(key===lastWH) return false; lastWH=key; DPR=d0;
 const dw=Math.round(vw*DPR), dh=Math.round(vh*DPR);
 if(FIELD_V2){ const s0=Math.min(vw/FW,(vh-HUD_TOP-HUD_BOT)/FH); let p=Math.floor(Math.min(s0,1)*DPR+1e-6), s=p/DPR;
  if(!(p>=1&&(s>=1||s>=S_KEEP*Math.min(s0,1)))) s=Math.max(.3,Math.floor(Math.min(s0,1)*100)/100); SCS=s; SC=s*DPR; }
 else SC=Math.max(1,Math.floor(Math.min(dw/LW,dh/(LH+36))));
 W=Math.floor(dw/SC); H=Math.floor(dh/SC); cv.width=W; cv.height=H;
 const cw=Math.round(W*SC)/DPR, ch=Math.round(H*SC)/DPR;
 cv.style.width=cw+'px'; cv.style.height=ch+'px';
 cv.style.left=Math.floor((vw-cw)/2)+'px'; cv.style.top='0px';
 if(tcv){ tcv.width=Math.round(W*SC); tcv.height=Math.round(H*SC); tcv.style.width=cv.style.width; tcv.style.height=cv.style.height; tcv.style.left=cv.style.left; tcv.style.top='0px'; }
 ctx.imageSmoothingEnabled=false;
 if(FIELD_V2){ fx=Math.floor((W-FW)/2); fy=Math.max(0,H-FH-Math.ceil(HUD_BOT*DPR/SC)); ox=fx+FOX; oy=fy+FOY; }
 else { ox=Math.floor((W-LW)/2); oy=Math.max(30,Math.floor((H-LH)/2)+14); if(oy+LH>H) oy=H-LH; fx=ox; fy=oy; }
 TMIN=Math.max(11,Math.ceil(9*DPR/SC));
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
let TMIN=11; const tMeasure=new Map();
function textClear(){ if(tctx) tctx.clearRect(0,0,tcv.width,tcv.height); }
/* FB16: обрезка текста по ширине (логич. px) */
function textW(s,size){ const px=Math.round(Math.max(TMIN,size)*SC); tctx.font=`900 ${px}px "Trebuchet MS","Verdana","DejaVu Sans","Arial Black",Arial,sans-serif`; return tctx.measureText(s).width/SC+2; }
/* FB24: перенос по словам без многоточия; wrapOvf>0 если слово шире строки */
let wrapOvf=0; function wrapTxt(s,size,maxW){ s=String(s); if(!tctx) return [s]; const out=[]; let cur=''; const ws=[]; for(let w of s.split(' ')){ while(w.length>4&&textW(w,size)>maxW){ let n=w.length-2; while(n>2&&textW(w.slice(0,n)+'-',size)>maxW) n--; ws.push(w.slice(0,n)+'-\u200b'); w=w.slice(n); } ws.push(w); } for(const w0 of ws){ const w=w0.replace('\u200b',''); const t=cur?cur+' '+w:w; if(w0.endsWith('\u200b')&&cur&&textW(t,size)<=maxW){ cur=t; out.push(cur); cur=''; continue; } if(w0.endsWith('\u200b')){ if(cur) out.push(cur); out.push(w); cur=''; continue; } if(!cur||textW(t,size)<=maxW) cur=t; else { out.push(cur); cur=w; } } if(cur) out.push(cur); for(const l of out) if(textW(l,size)>maxW) wrapOvf++; return out; }
function fitTxt(s,size,maxW){ s=String(s); if(!tctx||textW(s,size)<=maxW) return s; while(s.length>1&&textW(s+'…',size)>maxW) s=s.slice(0,-1); return s.trimEnd()+'…'; }
function T(s,x,y,size,col,align='c',out,shadow){ if(tctx&&!coverMode&&tcv.width){ return TV(String(s),x,y,size,col,align,out); }
 return TP(s,x,y,size,col,align,out,shadow); }
// векторный текст в device-пикселях: позиции/кегль в целых device px
/* FB25: прямоугольник на текстовом слое (поверх всего текста), логич. px, целые */
function TR(x,y,w,h,col){ if(!tctx||coverMode||!tcv.width){ ctx.fillStyle=col; ctx.fillRect(x,y,w,h); return; } const m=ctx.getTransform(); const x0=Math.round((m.a*x+m.e)*SC), y0=Math.round((m.d*y+m.f)*SC), x1=Math.round((m.a*(x+w)+m.e)*SC), y1=Math.round((m.d*(y+h)+m.f)*SC); tctx.globalAlpha=ctx.globalAlpha; tctx.fillStyle=col; tctx.fillRect(x0,y0,x1-x0,y1-y0); tctx.globalAlpha=1; }
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
function loadSprites(){ return Promise.all(CHARS.map(ch=>new Promise(res=>{const im=new Image(); im.onload=()=>{SPR[ch.id]=im;res();}; im.onerror=()=>res(); im.src='assets/'+ch.id+'_atlas.png'+(window.__ASSET_V&&window.__ASSET_V!=='dev'?'?v='+window.__ASSET_V:'');}))); }
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
/* шипы: зубцы как в живой версии (spikeTeethOld), столб под выдвижными шипами — ровная колонна в цветах темы уровня */
let bpSolids=[];
function spikeTeeth(x,X,Y,w,down){ const n=Math.max(1,Math.round(w/8)), pw=w/n; for(let i=0;i<n;i++){ const x0=Math.round(X+i*pw), x1=Math.round(X+(i+1)*pw), tw=x1-x0, mid=(tw-1)/2;
  for(let k=0;k<tw;k++){ const hh=Math.max(1,Math.round(8-Math.abs(k-mid)*(14/Math.max(4,tw)))); const yy=down?Y:Y+8-hh; x.fillStyle='#1a1020'; x.fillRect(x0+k,down?Y+hh:yy-1,1,1); x.fillStyle=k<mid?'#eef2fa':k-mid<1?'#c8d0e0':'#8a96b0'; x.fillRect(x0+k,yy,1,hh); if(hh>=7){ x.fillStyle='#ff4a6a'; x.fillRect(x0+k,down?Y+hh-2:yy,1,2); } } } }
function spikeTeethOld(x,X,Y,w){ const n=Math.max(1,Math.ceil(w/8-.01)), X0=Math.round(X+(w-n*8)/2); /* зубцы ровно по центру ширины */ for(let i=0;i<n;i++){ const sx=X0+i*8; for(let k=0;k<8;k++){ const hh=Math.max(0,8-Math.abs(k-3.5)*2.2)|0; x.fillStyle=k<4?'#e8eef8':'#9aa6c0'; x.fillRect(sx+k,Y+8-hh,1,hh); x.fillStyle='#ff4a6a'; if(hh>=7) x.fillRect(sx+k,Y,1,2);} x.fillStyle='#1a1020'; x.fillRect(sx,Y+7,8,1); } }
/* Электростолб (вертикальные шипы-столбы): тонкий 6px, хитбокс = рисунок. poleR сужает прямоугольник столба (у края поля — прижимает к краю) */
const POLE_W=6;
const isPole=r=>r[4]==='s'&&r[3]>14&&r[3]>r[2]*2;
function poleR(r,L){ if(!isPole(r)||r[2]<=POLE_W) return r; const fw=L.fw||320, q=r.slice(); q[2]=POLE_W;
 q[0]=r[0]<=0?r[0]:r[0]+r[2]>=fw?r[0]+r[2]-POLE_W:r[0]+((r[2]-POLE_W)>>1); return q; }
function polePaint(x,X,Y,w,h){ const O='#1a0c22', R=(a,b,c,d,col)=>{x.fillStyle=col;x.fillRect(a,b,c,d);};
 R(X,Y,w,h,O);
 for(let yy=Y+6;yy<Y+h-3;yy++) for(let k=1;k<w-1;k++){ const y=((yy-k)%8+8)%8<4; /* диагональная лента, свет слева */
  R(X+k,yy,1,1, y?(k===1?'#fff3a0':k===w-2?'#c8a020':'#ffd93c'):(k===1?'#4a4e58':k===w-2?'#24182c':'#3a3e48')); }
 R(X+1,Y+h-3,w-2,2,'#3a3e48'); R(X+1,Y+h-3,1,2,'#4a4e58');
 /* изолятор: 2 голубых ребра */ for(const yy of [Y+1,Y+4]){ R(X+1,yy,w-2,2,'#8af0ff'); R(X+1,yy,1,2,'#e8ffff'); R(X+w-2,yy,1,2,'#2aa0d0'); } }
/* кадр: искры ползут по столбу + свечение изолятора поверх ночи */
function poleFX(){ if(!world||!world.solids) return; const t=now, nt=isNight(); ctx.save();
 for(const o of world.solids){ if(o.type!=='s'||!(o.h>14&&o.h>o.w*2)) continue; const X=o.x,Y=o.y,w=o.w,h=o.h, R=(a,b,c,d,col)=>{ctx.fillStyle=col;ctx.fillRect(Math.round(a),Math.round(b),c,d);};
  if(nt){ ctx.globalAlpha=.85; for(const yy of [Y+1,Y+4]){ R(X+1,yy,w-2,2,'#8af0ff'); R(X+1,yy,1,2,'#e8ffff'); } ctx.globalAlpha=.22; R(X-1,Y-1,w+2,8,'#8af0ff'); ctx.globalAlpha=.1; R(X-2,Y-2,w+4,10,'#8af0ff'); ctx.globalAlpha=.3; for(let yy=Y+6;yy<Y+h-3;yy++) for(let k=1;k<w-1;k++) if(((yy-k)%8+8)%8<4) R(X+k,yy,1,1,'#ffd93c'); }
  const n=Math.max(1,Math.round(h/40)), span=h-16;
  for(let k=0;k<n;k++){ const fr=Math.floor(t*4+k*3), on=(fr*7+k*5)%5!==0; if(!on) continue;
   const yy=Y+9+((t*7+k*span/n+o.x)%span|0), side=(Math.floor(t*.65+k)%2)?-1:1, bx=side<0?X-1:X+w, sh=fr%3;
   ctx.globalAlpha=nt?.95:1; /* зигзаг 3 сегмента наружу, белое ядро */
   const pts=[[0,0],[side*3,1+sh%2],[side*1,3],[side*4,5],[side*2,6+(sh>1)]], L=(a,b)=>{ let [x0,y0]=a,[x1,y1]=b; const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0)); for(let j=0;j<=n;j++) R(bx+Math.round(x0+(x1-x0)*j/n),yy+Math.round(y0+(y1-y0)*j/n),1,1,'#8af0ff'); };
   for(let i=0;i<pts.length-1;i++) L(pts[i],pts[i+1]); R(bx+pts[1][0],yy+pts[1][1],1,1,'#ffffff'); R(bx+pts[3][0],yy+pts[3][1],1,1,'#ffffff');
   if(sh===0){ R(bx+side*4,yy+2,1,1,'#ffd93c'); } }
  /* искра над колпаком */ const tf=Math.floor(t*3)%4; ctx.globalAlpha=nt?.9:1; if(tf<2){ const cx=X+(w>>1)-(tf?1:0); R(cx,Y-2-tf,1,2,'#ffffff'); R(cx+(tf?2:-1),Y-3,1,1,'#8af0ff'); } }
 ctx.restore(); }
function spikePaint(x,X,Y,w,h,th){
 if(h>14&&h>w*2){ polePaint(x,X,Y,w,h); return; }
 if(h>14&&th){ /* столб под шипами: ровный, в цветах темы уровня, без подчёркиваний снизу */ const by=Y+7, bh=h-7; x.fillStyle=th.out; x.fillRect(X,by,w,bh); if(w>2){ x.fillStyle=th.body; x.fillRect(X+1,by,w-2,bh); x.fillStyle=th.bodyHi; x.fillRect(X+1,by,1,bh); x.fillStyle=th.body2; x.fillRect(X+w-2,by,1,bh); } }
 else { x.fillStyle='#3a2a44'; x.fillRect(X,Y+6,w,h-6); x.fillStyle='#24182c'; x.fillRect(X,Y+h-3,w,3); }
 spikeTeethOld(x,X,Y,w); }
function blockPaint(x,r,th,type,sd){ const [X,Y,w,h]=r; seed=sd;
 if(type==='s'){ spikePaint(x,X,Y,w,h,th); return; }
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
 bpSolids=L.p; L.p.forEach((r0,i)=>{ const r=poleR(r0,L); if('gbswo'.includes(r[4])||sh(r)) blockPaint(x,r,th,sh(r)?'g':r[4],1000+i*37); }); return c; }

// ---------- мир/физика ----------
function circRect(px,py,r,X,Y,w,h){ const cx=Math.max(X,Math.min(px,X+w)), cy=Math.max(Y,Math.min(py,Y+h)); let dx=px-cx, dy=py-cy; const d2=dx*dx+dy*dy;
 if(d2>=r*r) return null;
 if(d2===0){ const l=px-X, rr=X+w-px, t=py-Y, b=Y+h-py, m=Math.min(l,rr,t,b); if(m===t) return {nx:0,ny:-1,pen:t+r}; if(m===b) return {nx:0,ny:1,pen:b+r}; if(m===l) return {nx:-1,ny:0,pen:l+r}; return {nx:1,ny:0,pen:rr+r}; }
 const d=Math.sqrt(d2); return {nx:dx/d,ny:dy/d,pen:r-d}; }
const inRect=(x,y,r)=>x>=r[0]&&x<=r[0]+r[2]&&y>=r[1]&&y<=r[1]+r[3];
// Типы блоков: g земля, b батут, s шипы, i лёд (скользкий, тает от Лампы), c ящик (ломается), d дверь (id в [5]), v конвейер (направление в [5]), w липкая стена
const BOSS=[
 {id:'leech',intro:'Присосётся и тормозит — бей с разгона!',name:'Гигантская Пиявка',r:16,ax:40,ay:0,T:6,col:'#8a3a6a',mech:'липнет и тормозит',say:['Чмок!','Ай, присоски!','Отлипни!']},
 {id:'vac',intro:'Всасывает всё рядом. Не зевай вблизи!',name:'Пылесос «Вихрь-3000»',r:18,ax:0,ay:4,T:2,col:'#c83a4a',mech:'засасывает рядом',say:['АПЧХИ!','Фильтр забит!','Ж-ж-ж…']},
 {id:'cat',intro:'Лупит лапой вверх — заходи сбоку!',name:'Кот Бегемотыч',r:17,ax:0,ay:3,T:3,col:'#ff9a3c',mech:'бьёт лапой вверх',say:['ШШШ!','Мяу?!','Фыр!']},
 {id:'snow',intro:'Швыряется снежками. Береги макушку!',name:'Снеговик Хрустыч',r:17,ax:0,ay:0,T:1,col:'#e8f4ff',mech:'кидается снежками',say:['Мой нос!','Пуговица!','Таю…']},
 {id:'press',intro:'Плющит к полу. Бей, пока поднят!',name:'Робо-Пресс',r:16,ax:0,ay:30,T:3,col:'#8a92a8',mech:'прижимает вниз',say:['БЗЗТ!','ОШИБКА 404','ИСКРЮ!']},
 {id:'golem',intro:'Каменный: отскок от него ×1.3!',name:'Голем Булыжник',r:19,ax:0,ay:0,T:1,col:'#8a8478',mech:'отскок ×1.3',say:['Хрусть!','Трещинка…','КАМЕНЬ НЕ ПЛАЧЕТ']},
 {id:'bat',intro:'Рикошетит куда попало. Голова кругом!',name:'Мышь Шуршалка',r:13,ax:50,ay:18,T:5,fig:1,col:'#6a4aa0',mech:'рикошет куда попало',say:['Пи-пи!','Голова кружится','Ой, звёздочки']},
 {id:'crab',intro:'Отбивает вбок под диско-бит!',name:'Диско-Краб',r:15,ax:50,ay:0,T:5,col:'#ff4a3a',mech:'отражает по горизонтали',say:['Щёлк!','Клешни дрожат!','Не по ритму!']},
 {id:'drag',intro:'Дует порывами — лови ветер!',name:'Туча-Дракон',r:18,ax:30,ay:10,T:7,col:'#c8d4ee',mech:'порывы ветра',say:['Пф-ф-ф!','Гроза отменяется','Хмурюсь!']},
 {id:'king',intro:'Глотает слизней и плюётся. Фу!',name:'Король Слизней',r:19,ax:0,ay:6,T:2,col:'#4ed05a',mech:'глотает и выплёвывает',say:['Невкусно!','Корона!','ТЬФУ!']}];
// FB10: тап-способности гибрида — список по порядку родителей (1-й тап = A, 2-й тап = B); слоу-мо — удержание пальца, работает всегда вместе с ними
function tapList(ch){ if(Array.isArray(ch.taps)) return ch.taps; return ch.tap&&ch.ab&&ch.ab!=='slowmo'?[ch.ab]:[]; }
class World{
 constructor(li,ci,L){ this.li=li; this.L=L||LV[li]; setField(this.L); this.ch=(ci&&typeof ci==='object')?ci:CHARS[ci]; this.ab=this.ch.ab||''; this.abs=new Set(this.ch.abs||(this.ch.ab?[this.ch.ab]:[])); this.taps=tapList(this.ch); this.mod=null; this.t=0; L=this.L;
  this.solids=L.p.map(r=>poleR(r,L)).map(r=>({x:r[0],y:r[1],w:r[2],h:r[3],type:r[4],arg:r[5],alive:true,hit:0}));
  this.movers=(L.m||[]).map(m=>({...m,bx:m.x,by:m.y,type:m.s?'s':'g',vx:0,vy:0,mover:true,alive:true}));
  this.bumpers=(L.bu||[]).map(b=>({x:b[0],y:b[1],r:b[2],hit:0}));
  this.portals=(L.po||[]); this.fans=(L.fa||[]); this.water=(L.wa||[]);
  this.buttons=(L.bt||[]).map(b=>({x:b[0],y:b[1],id:b[2],on:false}));
  this.candies=L.c.map(c=>({x:c[0],y:c[1],x0:c[0],y0:c[1],got:false,cap:false,hv:0,rt:0,rx:0,ry:0,tr:new Float32Array(MAG.TRAIL*2),trN:0,trI:0,trT:0})); this.gem=L.gm?{x:L.gm[0],y:L.gm[1],got:false}:null;
  this.shots=L.shots+(this.ch.extra||0); this.used=0; this.got=0; this.shield=this.has('shield')?1:0;
  this.s=this.mkBody(L.start[0],L.start[1]); this.clone=null;
  this.ev=[]; this.result=null; this.slow=false; this.tilt=0; this.wind=0; this.v4init(); this.updMovers(0); }
 has(a){ return this.abs.has(a); }
 /* FB12: прицел-диско шагает ровно как игровой цикл (кадр 1/60, те же адаптивные подшаги) — путь = физика */
 previewPath(dx,dy,frames=150){ const w=this.snapshot(); const pts=[], ev=[]; if(!w.launch(dx,dy)) return {pts,ev,w}; for(let f=0;f<frames&&w.s.st==='fly'&&!w.result;f++){ const sd=(1/60)*(w.mod&&w.mod.ts||1), n=Math.min(24,Math.max(4,Math.ceil(Math.hypot(w.s.vx,w.s.vy)*sd/5))); for(let i=0;i<n&&w.s.st==='fly'&&!w.result;i++){ w.step(sd/n); for(const e of w.ev) ev.push(e[0]); w.ev.length=0; } pts.push([w.s.x,w.s.y]); } return {pts,ev,w}; }
 softZone(s,wat){ if(s.fly<.15) return null; if(!this.has('sponge')){ const w=wat||(s.flo&&s.x>=s.flo[0]&&s.x<=s.flo[0]+s.flo[2]&&s.y<s.flo[1]&&s.y>s.flo[1]-2.4*R?s.flo:null); if(wat) s.flo=wat; if(w&&!(s.vy<-330*K&&s.y<w[1])) return {k:'water',ty:w[1]+4}; if(!w) s.flo=null; }
  for(const f of this.fans){ if(s.x>=f[0]&&s.x<=f[0]+f[2]&&s.y>f[1]-2.2*R&&s.y<f[1]+2.6*R&&Math.abs(s.vy)<330*K&&s.fly>.3) return {k:'fan',ty:f[1]+2}; } return null; }
 touchSpike(x,y){ const R=RB*(this.mod&&this.mod.hit||1); for(const o of this.allSolids()) if(o.type==='s'&&circRect(x,y,R-1,o.x,o.y,o.w,o.h)) return true; return false; }
 keyOK(k){ const c=this.ch; return c.id===k||!!(c.fuse&&c.fuse.some(i=>CHARS[i].id===k)); }
 mkBody(x,y){ return {x,y,vx:0,vy:0,st:'idle',at:0,lx:x,ly:y,ground:null,pcd:0,fly:0,padN:0,padT:0,bumpN:0,gs:1,used:false,chute:false,ghost:0,hover:false,wall:false,hist:[],histT:0}; }
 updMovers(dt){ for(const m of this.movers){ const a=(this.t/m.t)*Math.PI*2+(m.ph||0)/m.t*Math.PI*2; const nx=m.bx+Math.sin(a)*m.ax, ny=m.by+Math.sin(a)*m.ay;
  m.vx=dt?(nx-m.x)/dt:0; m.vy=dt?(ny-m.y)/dt:0; m.dx=nx-m.x; m.dy=ny-m.y; m.x=nx; m.y=ny; } }
 allSolids(){ return this.solids.filter(o=>o.alive).concat(this.movers); }
 canLaunch(){ const s=this.s; return s.st==='idle'&&this.shots>0&&!this.result; }
 launch(dx,dy){ const s=this.s; if(!this.canLaunch()) return false; if(this.mod&&this.mod.inv){ dx=-dx; dy=-dy; } let l=Math.hypot(dx,dy); if(l<8) return false; const k=Math.min(l,MAXDRAG)/l;
  const v=560*K*this.ch.power*(this.mod&&this.mod.pw||1)/MAXDRAG; s.vx=-dx*k*v; s.vy=-dy*k*v; s.st='fly'; s.fly=0; s.lx=s.x; s.ly=s.y; s.used=false; s.chute=false; s.gs=1; s.ghost=0; s.hover=false; s.wall=false; s.padN=0; s.bumpN=0; s.spN=0; s.flo=null; s.zone=null; s.zoneT=0; s.hist=[]; s.histT=0; s.shout=false; s.gp=0; s.eat=0; s.tapI=0;
  if(!this.inf) this.shots--; this.used++; this.ev.push(['launch']); return true; }
 // активная способность (тап в полёте)
 ability(){ const s=this.s; if(s.st!=='fly'||s.used) return false; const a=this.taps[s.tapI|0]; if(!a) return false; const ok=this.ability1(a); if(ok){ s.tapI=(s.tapI|0)+1; s.used=s.tapI>=this.taps.length; } return ok; }
 ability1(a){ const s=this.s;
  if(a==='djump'){ s.vy=-340*K*(s.gs); s.used=true; this.ev.push(['ab','djump',s.x,s.y]); return true; }
  if(a==='split'){ const c=this.mkBody(s.x,s.y); Object.assign(c,{st:'fly',vx:-s.vx*0.6+(s.vx>=0?-40:40)*K,vy:s.vy-120*K,fly:0}); this.clone=c; s.vy-=60*K; s.used=true; this.ev.push(['ab','split',s.x,s.y]); return true; }
  if(a==='chute'){ s.chute=true; s.vx*=.6; s.used=true; this.ev.push(['ab','chute',s.x,s.y]); return true; }
  if(a==='dive'){ s.vx=0; s.vy=700*K; s.used=true; this.ev.push(['ab','dive',s.x,s.y]); return true; }
  if(a==='ghost'){ s.ghost=.45; s.used=true; this.ev.push(['ab','ghost',s.x,s.y]); return true; }
  if(a==='gflip'){ s.gs=-1; s.vy=Math.min(s.vy,0)-60*K; s.used=true; this.ev.push(['ab','gflip',s.x,s.y]); return true; }
  return false; }
 support(b){ const R=RB*(this.mod&&this.mod.hit||1); if(b.wall||b.hover) return true; if(b.y>=LH-R-.5) return true; if(this.inWater(b)) return true;
  for(const o of this.allSolids()){ if(o.type==='s') continue; if(o.type==='o'&&b.y>o.y-R+3) continue; if(circRect(b.x,b.y+2.5,R,o.x,o.y,o.w,o.h)){ if(o.mover||o.type==='v') b.ground=o; return true;} } return false; }
 inWater(b){ for(const w of this.water) if(inRect(b.x,b.y,w)) return w; return null; }
 settle(b,why){ b.vx=0; b.vy=0; b.st='idle'; b.gs=1; b.chute=false; b.ghost=0; if(why==='hover') b.hover=true; this.ev.push(['rest',why||'']); }
 step(dt){ this.t+=dt; this.updMovers(dt); this.v4pre(dt);
  for(const b of this.bumpers) b.hit=Math.max(0,b.hit-dt);
  for(const o of this.solids) o.hit=Math.max(0,o.hit-dt);
  const n0=this.ev.length, st0=this.s.st; this.body(this.s,dt,true); this.v4post(this.s,dt); this.comboTick(n0,st0);
  if(this.clone){ const c=this.clone; this.body(c,dt,false); if(c.st!=='fly'||c.fly>6||this.s.st==='idle'){ this.ev.push(['poofclone',c.x,c.y]); this.clone=null; } }
  // магнит (Ф1м, ТЗ 26.9): только главный слизень this.s, только конфеты
  if(this.has('magnet')) this.magStep(dt);
 }
 pickCandy(c,mag){ c.got=true; c.cap=false; this.got++; if(this.has('juicy')){ this.shots++; this.ev.push(['juicy',c.x,c.y]); } this.ev.push(['candy',c.x,c.y,this.got,mag?1:0]); }
 /* прямая видимость: отрезок не пересекает твёрдые блоки (кроме шипов 's' и односторонних 'o'); проверка только при захвате */
 losFree(x1,y1,x2,y2){ const dx=x2-x1, dy=y2-y1; for(const o of this.allSolids()){ if(o.type==='s'||o.type==='o') continue; let t0=0,t1=1; const P=[-dx,dx,-dy,dy], Q=[x1-o.x,o.x+o.w-x1,y1-o.y,o.y+o.h-y1]; let hit=true;
   for(let i=0;i<4;i++){ if(P[i]===0){ if(Q[i]<0){ hit=false; break; } } else { const r=Q[i]/P[i]; if(P[i]<0){ if(r>t1){ hit=false; break; } if(r>t0) t0=r; } else { if(r<t0){ hit=false; break; } if(r<t1) t1=r; } } }
   if(hit&&t0<=t1) return false; } return true; }
 magStep(dt){ const s=this.s, M=MAG, sp=Math.hypot(s.vx,s.vy);
  for(const c of this.candies){ if(c.got) continue;
   if(s.st==='poof'&&c.cap){ c.cap=false; c.hv=0; c.rt=M.RESET_T; c.rx=c.x; c.ry=c.y; }
   if(c.rt>0){ c.rt=Math.max(0,c.rt-dt); const k=c.rt/M.RESET_T, e=k*k; c.x=c.x0+(c.rx-c.x0)*e; c.y=c.y0+(c.ry-c.y0)*e; this.magTrail(c,dt); continue; }
   if(s.st==='poof'||s.st==='win'){ if(c.trN) this.magTrail(c,dt,true); continue; }
   let dx=s.x-c.x, dy=s.y-c.y, d=Math.hypot(dx,dy);
   if(!c.cap){ if(c.trN) this.magTrail(c,dt,true); const r=(M.R0+(s.st==='fly'?Math.min(M.RBMAX,sp/K*M.RBK):0))*K; if(d>=r||!this.losFree(s.x,s.y,c.x,c.y)) continue; c.cap=true; c.hv=M.V0*K; this.ev.push(['magcap',c.x,c.y]); }
   const fl=sp+M.MARGIN*K, vmax=Math.max(M.VMAX*K,fl); c.hv=Math.min(vmax,Math.max(c.hv+M.ACC*K*dt,fl));
   const stp=Math.min(d,c.hv*dt); if(d>0){ c.x+=dx/d*stp; c.y+=dy/d*stp; } this.magTrail(c,dt);
   if(Math.hypot(s.x-c.x,s.y-c.y)<M.PICK) this.pickCandy(c,true); } }
 /* шлейф: кольцо из MAG.TRAIL точек, шаг 1/60 с, без аллокаций; fade — точки гаснут */
 magTrail(c,dt,fade){ c.trT+=dt; if(c.trT<1/60) return; c.trT=0; if(fade){ c.trN=Math.max(0,c.trN-1); return; } c.tr[c.trI*2]=c.x; c.tr[c.trI*2+1]=c.y; c.trI=(c.trI+1)%MAG.TRAIL; if(c.trN<MAG.TRAIL) c.trN++; }
 // B3: комбо-рикошеты (только главный слизень, только в одном полёте)
 comboTick(n0,st0){ const s=this.s; if(this.comboPend===undefined){ this.combo=0; this.comboPend=0; this.comboBank=0; this.comboMax=0; this.lastBT=-9; }
  if(st0==='fly'||s.st==='fly') for(let i=n0;i<this.ev.length;i++){ const e=this.ev[i]; const k=e[0];
   const obj=k==='bounce'?(e[6]||'?'):k==='boing'?(e[3]||'water'):e[3]; if((k==='bounce'||k==='boing'||k==='bumper')&&(this.t-this.lastBT>.12)&&obj!==this.lastBO){ this.lastBT=this.t; this.lastBO=obj; this.combo++; this.comboPend+=25*this.combo*(this.comboMul||1); if(this.combo>this.comboMax) this.comboMax=this.combo; if(this.combo>=2) this.ev.push(['combo',this.combo,s.x,s.y]); } }
  if(st0!=='fly'&&s.st==='fly'){ this.lastBO=null; }
  if(st0==='fly'&&s.st!=='fly'){ if(s.st==='poof'){ if(this.combo>=2) this.ev.push(['combolost',this.combo,s.x,s.y]); } else this.comboBank+=this.comboPend; this.comboPend=0; this.combo=0; } }
 scoreNow(){ return (this.result==='win'?1000:0)+(this.has('lucky')?350:250)*this.got+(this.result==='win'?300*Math.max(0,this.shots):0)+(this.comboBank||0)+(this.result==='win'?(this.comboPend||0):0); }
 body(s,dt,main){ const ch=this.ch; const R=RB*(this.mod&&this.mod.hit||1), HK=R/RB; /* Х-4: хитбокс великана/крошки */
  if(s.inv>0) s.inv-=dt;
  if(s.st==='idle'){ const ox0=s.x, oy0=s.y; if(s.ground&&(s.ground.mover)&&!s.wall&&!s.hover){ s.x+=s.ground.dx; s.y+=s.ground.dy; }
   if(s.ground&&s.ground.type==='v'&&!s.wall&&!s.hover) s.x+=s.ground.arg*38*K*dt;
   /* FB12: лента/платформа не затаскивает слизня в шипы — упирается у края */ if((s.x!==ox0||s.y!==oy0)&&!this.ch.spiky&&this.touchSpike(s.x,s.y)&&!this.touchSpike(ox0,oy0)){ s.x=ox0; if(!s.ground||!s.ground.mover) s.y=oy0; }
   if(s.x<R) s.x=R; if(s.x>LW-R) s.x=LW-R;
   if(!this.support(s)) { s.st='fly'; s.vx=0; s.vy=0; s.fly=0; s.used=true; s.hist=[]; }
   const g1=this.L.goal; if(main&&s.st==='idle'&&Math.abs(s.x-g1[0])<14&&s.y>g1[1]-36&&s.y<g1[1]+2){ s.st='win'; s.at=0; this.result='win'; this.ev.push(['win']); return; } }
  if((s.st==='splat'||s.st==='recover')&&s.ground&&s.ground.mover){ s.x+=s.ground.dx; s.y+=s.ground.dy; }
  if(s.st==='poof'){ s.at-=dt; if(s.at<=0){ /* FB12: после шипов — всегда на старт уровня + 0.6 с неуязвимости */ s.x=this.L.start[0]; s.y=this.L.start[1]; s.lx=s.x; s.ly=s.y; s.inv=.6; s.vx=s.vy=0; s.st='idle'; s.ground=null; s.wall=false; s.hover=false; this.ev.push(['respawn']); } return; }
  if(s.st!=='fly') return;
  if(s.eat>0){ this.eatTick(s,dt); return; }
  s.fly+=dt; s.pcd-=dt; s.padT+=dt; if(s.padT>2.6) s.padN=0;
  // гравитация, вода, ветер
  let g=G0*ch.grav*s.gs*(this.mod&&this.mod.g||1); if(this.has('glide')) g*=.5; { const wsum=this.windSum(); if(wsum) s.vx+=wsum*K*dt; } /* Х-2: ветер Хаоса + погода, |w|≤300 */ if(this.tilt) s.vx+=this.tilt*K*dt; if(s.chute){ g*=.4; }
  const wat=this.inWater(s);
  /* FB19: вода/вентилятор — мягкая пружина к точке покоя: 2–3 затухающих покачивания и плавная остановка */
  const zn=this.softZone(s,wat); s.zone=zn;
  if(zn){ g=0; const dy=s.y-zn.ty, w=2*Math.PI*1.1, ze=.5; let ay=-w*w*dy-2*ze*w*(s.vy-0); ay=Math.max(-G0*.7,Math.min(G0*.7,ay)); s.vy+=ay*dt; s.vx*=Math.pow(zn.k==='water'?.2:.3,dt); if(zn.k==='water'&&Math.abs(s.vy)>120*K) s.vy*=Math.pow(.15,dt); s.zoneT=(s.zoneT||0)+dt; }
  else { s.zoneT=0;
  if(wat&&!this.has('sponge')){ g=-G0*.5; s.vx*=Math.pow(.25,dt); s.vy*=Math.pow(.15,dt); }
  for(const f of this.fans) if(inRect(s.x,s.y,f)){ s.vy-=(f[4]||900)*K*dt*(this.has('glide')||s.chute?1.4:1); } }
  s.vy+=g*dt; if(s.chute&&s.vy>70*K) s.vy=70*K; { const vc=900*K*(this.mod&&this.mod.vcap||1); if(s.vy>vc) s.vy=vc; } if(s.vy<-900*K) s.vy=-900*K; if(s.vx>1100*K) s.vx=1100*K; if(s.vx<-1100*K) s.vx=-1100*K;
  s.x+=s.vx*dt; s.y+=s.vy*dt;
  if(!isFinite(s.x)||!isFinite(s.y)){ s.x=this.touchSpike(s.lx,s.ly)?this.L.start[0]:s.lx; s.y=this.touchSpike(s.lx,s.ly)?this.L.start[1]:s.ly; this.settle(s,'nan'); return; }
  let grounded=null;
  if(s.ghost>0){ s.ghost-=dt; if(s.ghost<=0){ for(const o of this.allSolids()) if(circRect(s.x,s.y,R-2,o.x,o.y,o.w,o.h)){ s.ghost=.05; break; } if(s.fly>8) s.ghost=0; } }
  // кнопки
  for(const bt of this.buttons) if(!bt.on&&Math.hypot(s.x-bt.x,s.y-bt.y)<16){ bt.on=true; for(const o of this.solids) if(o.type==='d'&&o.arg===bt.id) o.alive=false; this.ev.push(['button',bt.x,bt.y]); }
  // губка: вода как батут
  if(wat&&this.has('sponge')&&s.vy>0){ s.vy=-Math.max(s.vy*.95,330*K); s.y=wat[1]-1; this.ev.push(['boing',s.x,s.y,null]); }
  for(const o of this.allSolids()){ const c=circRect(s.x,s.y,R,o.x,o.y,o.w,o.h); if(!c) continue; if(o.type==='o'&&!(c.ny<-.6&&s.vy*s.gs>=0&&s.y<o.y)) continue; if(o.type==='h'&&o.arg!=='shell'&&!this.keyOK(o.arg)&&main&&!this.secHint){ this.secHint=1; this.ev.push(['secbump',o.x+o.w/2,o.y]); } if(o.type==='h'&&o.arg!=='shell'&&this.keyOK(o.arg)){ o.alive=false; this.ev.push(['secret',o.x+o.w/2,o.y+o.h/2,o]); continue; }
   if(s.ghost>0&&o.type!=='h'&&!(c.ny<-.6&&c.pen<8&&o.type!=='s')){ if(main&&!s.gp){ s.gp=1; this.ev.push(['ghostpass',s.x,s.y]); } continue; }
   if(o.type==='s'&&!ch.spiky&&!(s.inv>0)){
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
    if(o.type==='s'){ s.spN=(s.spN|0)+1; const n2=s.spN, out=n2<=1?Math.max(imp*.8,300*K):n2===2?Math.max(imp*.5,150*K):imp*.35; s.vx-=vn*c.nx; s.vy-=vn*c.ny;
     if(out<70*K&&c.ny<-.6){ s.vx*=.5; grounded=o; continue; } /* FB19: ёжик на шипах — 2 отскока поменьше и мягкая посадка */
     s.vx+=c.nx*out; s.vy+=c.ny*out; this.ev.push(['bounce',s.x,s.y,imp,c.nx,c.ny,o]); continue; }
    if(this.has('wall')&&Math.abs(c.nx)>.7&&main){ this.settle(s,'wall'); s.wall=true; s.ground=o; this.ev.push(['stick',s.x,s.y]); return; }
    if(o.type==='w'&&Math.abs(c.nx)>.7&&main){ this.settle(s,'wall'); s.wall=true; s.ground=o; this.ev.push(['stick',s.x,s.y]); return; }
    if(s.gs<0&&c.ny>.6){ s.gs=1; }
    if(this.mod&&this.mod.sticky&&imp>40*K){ /* Х-1: липучка гасит любой отскок */ this.ev.push(['goo',s.x-c.nx*R,s.y-c.ny*R,imp,c.nx,c.ny]);
     if(Math.abs(c.nx)>.7&&main&&!o.mover){ this.settle(s,'wall'); s.wall=true; s.ground=o; this.ev.push(['stick',s.x,s.y]); return; }
     if(c.ny<-.6&&s.gs>0){ s.vx=(o.vx||0); s.vy=(o.vy||0); s.ground=o; if(main) this.settle(s,''); else s.st='dead'; return; }
     s.vx-=vn*c.nx; s.vy-=vn*c.ny; continue; }
    if(c.ny<-.6&&imp>SPLAT_V*ch.splat&&main&&s.gs>0){ s.vx=0; s.vy=0; s.st='splat'; s.at=0; s.ground=o; this.ev.push(['splat',s.x,s.y,imp]); return; }
    const rest=imp<90*K?0:ch.rest; s.vx-=(1+rest)*vn*c.nx; s.vy-=(1+rest)*vn*c.ny;
    if(imp>70*K) this.ev.push(['bounce',s.x,s.y,imp,c.nx,c.ny,o]); }
   if(c.ny<-.6) grounded=o; }
  // границы
  const stk=this.mod&&this.mod.sticky;
  if(s.x<R){s.x=R; if(s.vx<0){ if((this.has('wall')||stk&&-s.vx>40*K)&&main){ if(stk) this.ev.push(['goo',0,s.y,-s.vx,1,0]); this.settle(s,'wall'); s.wall=true; this.ev.push(['stick',s.x,s.y]); return; } if(-s.vx>70)this.ev.push(['bounce',s.x,s.y,-s.vx,1,0,'L']); s.vx=stk?0:-s.vx*ch.rest;}}
  if(s.x>LW-R){s.x=LW-R; if(s.vx>0){ if((this.has('wall')||stk&&s.vx>40*K)&&main){ if(stk) this.ev.push(['goo',LW,s.y,s.vx,-1,0]); this.settle(s,'wall'); s.wall=true; this.ev.push(['stick',s.x,s.y]); return; } if(s.vx>70)this.ev.push(['bounce',s.x,s.y,s.vx,-1,0,'R']); s.vx=stk?0:-s.vx*ch.rest;}}
  if(s.y<R){s.y=R; if(s.vy<0){ if(stk){ if(-s.vy>40*K) this.ev.push(['goo',s.x,0,-s.vy,0,1]); s.vy=0; } else { s.vy=-s.vy*ch.rest; this.ev.push(['bounce',s.x,s.y,60,0,1,'T']); } if(s.gs<0) s.gs=1; }}
  if(s.y>LH-R){s.y=LH-R; if(s.vy>0){ if(stk){ if(s.vy>40*K) this.ev.push(['goo',s.x,LH,s.vy,0,-1]); s.vy=0; if(s.gs>0){ s.vx=0; if(main) this.settle(s,''); else s.st='dead'; return; } } else s.vy=-s.vy*ch.rest;} grounded=grounded||{x:0,y:LH,w:LW,h:1};}
  for(const b of this.bumpers){ const dx=s.x-b.x, dy=s.y-b.y, d=Math.hypot(dx,dy); if(d<b.r+R&&d>0){ const nx=dx/d, ny=dy/d; s.x=b.x+nx*(b.r+R); s.y=b.y+ny*(b.r+R); const vn=s.vx*nx+s.vy*ny; if(vn<0){s.vx-=2*vn*nx; s.vy-=2*vn*ny;}
   s.bumpN++; if(s.bumpN<=6){ s.vx+=nx*140*K; s.vy+=ny*140*K; const sp=Math.hypot(s.vx,s.vy); if(sp<360*K){s.vx*=360*K/sp;s.vy*=360*K/sp;} } else { s.vx*=.7; s.vy*=.7; }
   b.hit=.25; this.ev.push(['bumper',b.x,b.y,b]); } }
  if(s.pcd<=0) for(const p of this.portals){ for(let k=0;k<2;k++){ const ax=p[k*2],ay=p[k*2+1]; if(Math.hypot(s.x-ax,s.y-ay)<13){ const bx=p[2-k*2],by=p[3-k*2]; this.ev.push(['portal',ax,ay,bx,by]); s.x=bx; s.y=by; s.pcd=.6; break; } } }
  for(const c of this.candies) if(!c.got&&Math.hypot(s.x-c.x,s.y-c.y)<MAG.PICK*HK) this.pickCandy(c,c.cap);
  if(this.gem&&!this.gem.got&&Math.hypot(s.x-this.gem.x,s.y-this.gem.y)<17*HK){ this.gem.got=true; this.ev.push(['gem',this.gem.x,this.gem.y]); }
  const g0=this.L.goal; if(Math.abs(s.x-g0[0])<14*HK&&s.y>g0[1]-36&&s.y<g0[1]+2){ if(!main){ this.s.x=s.x; this.s.y=s.y; this.s.vx=this.s.vy=0; this.clone=null; } const m=this.s; m.st='win'; m.at=0; m.vx=m.vy=0; this.result='win'; this.ev.push(['win']); return; }
  // отдых
  if(s.zone){ const zn=s.zone; const slow=Math.abs(s.vy)<6*K&&Math.abs(s.vx)<10*K; s.stillT=slow?(s.stillT||0)+dt:0; if((Math.abs(s.y-zn.ty)<1&&slow)||s.stillT>.35||s.zoneT>6){ if(main){ if(Math.abs(zn.ty-s.y)<1) s.y=zn.ty; this.settle(s,zn.k==='water'?'water':'hover'); } else s.st='dead'; return; } }
  else if(wat&&!this.has('sponge')&&Math.hypot(s.vx,s.vy)<35*K&&s.fly>.4){ if(main) this.settle(s,'water'); else s.st='dead'; return; }
  if(grounded){ s.ground=grounded; const fr=this.mod&&this.mod.sticky?4:(grounded.type==='i'||this.wxNow==='ice')?.08:ch.fric*(this.wxNow==='rain'?.3:1); const gvx=(grounded.vx||0)+(grounded.type==='v'?grounded.arg*38*K:0); s.vx=gvx+(s.vx-gvx)*(grounded.mover?Math.pow(1e-4,dt):Math.pow(.25*(1/Math.max(.2,fr)),dt*fr)); const rvx=s.vx-gvx;
   if(Math.abs(rvx)<26*K&&Math.abs(s.vy-(grounded.vy||0))<40*K){ if(main) this.settle(s,''); else s.st='dead'; return; } }
  // анти-залипание: нет прогресса
  s.histT+=dt; if(s.histT>.25){ s.histT=0; s.hist.push([s.x,s.y]); if(s.hist.length>12) s.hist.shift();
   if(s.hist.length>=12&&s.fly>3&&!s.zone){ let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9; for(const [hx,hy] of s.hist){x0=Math.min(x0,hx);x1=Math.max(x1,hx);y0=Math.min(y0,hy);y1=Math.max(y1,hy);} if(x1-x0<32&&y1-y0<80){ if(main) this.settle(s,'hover'); else s.st='dead'; return; } } }
  if(s.fly>(s.zone?12:9)){ if(main) this.settle(s,'hover'); else s.st='dead'; }
 }
 // ---------- v4: боссы, погода, наклон, крик ----------
 v4init(){ const L=this.L; const bd=L.boss&&BOSS[L.boss.k];
  this.boss=bd?{k:L.boss.k,x0:L.boss.x,y0:L.boss.y,x:L.boss.x,y:L.boss.y,r:bd.r,hp:3,cd:0,dead:false,react:0,balls:[],ballT:1.2,paw:0,ax:L.boss.ax??bd.ax,hang:!!L.boss.hang}:null;
  this.wx=L.wx?{i:0,t:0,warned:false}:null; this.wxNow=L.wx?L.wx[0][0]:''; this.gust=0; }
 setChar(ch){ this.ch=ch; this.ab=ch.ab||''; this.abs=new Set(ch.abs||(ch.ab?[ch.ab]:[])); this.taps=tapList(ch); }
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
 windSum(){ const w=(this.mod&&this.mod.wind||0)+(this.wind||0); return this.mod&&this.mod.wind?Math.max(-300,Math.min(300,w)):w; }
 snapshot(){ const w=new World(this.li,this.ch,this.L); w.mod=this.mod; w.t=this.t; w.updMovers(0);
  this.solids.forEach((o,i)=>{w.solids[i].alive=o.alive}); this.buttons.forEach((b,i)=>{w.buttons[i].on=b.on}); this.candies.forEach((c,i)=>{ const tr=w.candies[i].tr; Object.assign(w.candies[i],c); w.candies[i].tr=tr; w.candies[i].trN=0; }); if(this.gem) w.gem={...this.gem};
  Object.assign(w.s,JSON.parse(JSON.stringify({...this.s,ground:null}))); w.s.ground=null; w.shots=this.shots; w.got=this.got; w.shield=this.shield; w.tilt=this.tilt; if(this.boss) w.boss=JSON.parse(JSON.stringify(this.boss)); if(this.wx) w.wx={...this.wx}; w.wxNow=this.wxNow; return w; }
}

// ---------- игра / экраны ----------
let scene='menu', world=null, curLevel=0, lvlCanvas=null, T0=performance.now()/1000, now=0;
let parts=[], decals=[], floats=[], shake=0, flash=0, pops=[];
let drag=null, lastPullF=-1, overlay=null, overlayT=0, squash=0, sqDir=[0,1], sAnim={a:'idle',t:0};
let buttons=[], pressed=null, selPick=save.char||0, menuSlugs=[];
let btnSilent=false; let hoverLbl=null, cbLabel=null; const tabA={v:-1,from:0,t0:-9}; const togA={}; let muteT=-9;
/* Ф1у: анимация кнопок (26.12.3). Зона тапа не меняется, сдвиги целые. */
const RM=()=>!!(save.set&&save.set.rm); const bRel={}, bNo={}; let uiPrime=null;
function bAnim(label,x){ const k=label+'@'+(x|0); const pr=pressed&&pressed.label===label&&pressed.x===x; if(pr) return {ox:0,oy:2,sw:RM()?0:2,sh:RM()?0:-1,pr:1};
 const n=bNo[label]; if(n!==undefined&&now-n<.24){ const f=(now-n)/.24; return {ox:RM()?0:Math.round(Math.sin(f*Math.PI*6)*2),oy:0,sw:0,sh:0}; }
 const r=bRel[k]; if(r!==undefined&&now-r<UIA.release&&!RM()){ const f=(now-r)/UIA.release; return {ox:0,oy:f<.5?-1:0,sw:0,sh:0}; } return {ox:0,oy:0,sw:0,sh:0}; }
const nbA={n:-1,t:-9}; function numBadge(cx,cy,n){ if(nbA.n!==n){ if(nbA.n>=0) nbA.t=now; nbA.n=n; } const pf=RM()?1:Math.min(1,(now-nbA.t)/.2); const r0=Math.max(6,Math.round(Math.max(TMIN,9)/2)+2), r=pf<1?Math.round(r0+4-4*EASE.outBack(pf)):r0; const bob=!RM()&&(now%2.4)<.2?2:0; cx=Math.round(cx); cy=Math.round(cy)-bob; disc(cx,cy,r+1,'#120818'); disc(cx,cy,r,'#ff3a5a'); const tsz=pf<1?13:9, eff=Math.max(TMIN,tsz); T(String(n),cx,cy-Math.round(eff/2)-1,tsz,'#fff'); }
function uiNo(label){ bNo[label]=now; sfx('uiNo'); }
function lockNo(){ if(cbLabel) bNo[cbLabel]=now; sfx('uiNo'); }
function btn(x,y,w,h,label,cb,col='#ffd23c',size=12){ x=Math.round(x); y=Math.round(y); w=Math.round(w); h=Math.round(h); const x00=x, w00=w, h00=h, A=bAnim(label,x); const yy=y+A.oy; x=x+A.ox-(A.sw>>1); w=w+A.sw; h=h+A.sh;
 ctx.fillStyle='#1a0c22'; ctx.fillRect(x+1,y+2,w-2,h); ctx.fillRect(x,y+3,w,h-2);
 ctx.fillStyle='#1a0c22'; ctx.fillRect(x+1,yy-1,w-2,h+1); ctx.fillRect(x-1+1,yy,w,h-1);
 ctx.fillRect(x,yy,w,h);
 const c=hex(col); const dk=`rgb(${c[0]*.7|0},${c[1]*.6|0},${c[2]*.6|0})`;
 ctx.fillStyle=dk; ctx.fillRect(x+1,yy+1,w-2,h-2); ctx.fillStyle=col; ctx.fillRect(x+1,yy+1,w-2,h-5);
 ctx.fillStyle='rgba(255,255,255,.55)'; ctx.fillRect(x+2,yy+2,w-4,1); ctx.fillRect(x+2,yy+2,1,3);
 if(hoverLbl===label&&!A.pr&&label){ ctx.fillStyle='rgba(255,255,255,.7)'; ctx.fillRect(x+2,yy+1,w-4,1); }
 if(uiPrime===label&&!RM()&&!A.pr){ const ph=(now%UIA.shine)/UIA.shineT; if(ph<1){ const sx=Math.round(x+2+(w-10)*ph); ctx.fillStyle='rgba(255,255,255,.55)'; ctx.fillRect(sx,yy+2,4,h-7); ctx.fillRect(sx+5,yy+2,1,h-7); } }
 if(label&&!btnSilent) T(label,x+w/2,yy+(h-4)/2-size*.55,size,'#fff','c','#1a0c22');
 buttons.push({x:x00,y,w:w00,h:h00,label,cb}); }
const TAP=()=>Math.max(30,Math.ceil(44*DPR/SC)); // 44 CSS px в логических пикселях
function iconBtn(x,y,draw,cb,label,sz=TAP()){ btn(x,y,sz,sz-2,'',cb,'#6a4fd8'); { const hb=buttons[buttons.length-1]; hb.label=label; hb.x-=2; hb.y-=2; hb.w+=4; hb.h+=6; /* FB22: зона тапа ≥44px */ } const pr=pressed&&pressed.label===label; const ik=Math.max(1,Math.floor(sz/22)); ctx.save(); ctx.translate(x+(sz>>1),y+((sz-4)>>1)+(pr?2:0)); ctx.scale(ik,ik); draw(); ctx.restore(); }
const icMute=()=>{ ctx.fillStyle='#fff'; ctx.fillRect(-6,-2,3,5); ctx.fillRect(-3,-4,2,9); ctx.fillRect(-1,-5,1,11); if(save.mute){ ctx.fillStyle='#ff4a6a'; for(let i=0;i<6;i++){ctx.fillRect(2+i,-3+i,1,1);ctx.fillRect(7-i,-3+i,1,1);} } else { ctx.fillRect(2,-2,1,5); ctx.fillRect(4,-4,1,9); ctx.fillRect(3,-3,1,1);ctx.fillRect(3,3,1,1);} if(save.mute&&!RM()&&now-muteT<.16){ ctx.fillStyle='#fff'; if(now-muteT<.08) ctx.fillRect(4,-4,1,9); ctx.fillRect(2,-2,1,5); } };
const icPause=()=>{ ctx.fillStyle='#fff'; ctx.fillRect(-4,-5,3,10); ctx.fillRect(2,-5,3,10); };
const icBack=()=>{ ctx.fillStyle='#fff'; for(let i=0;i<5;i++) ctx.fillRect(-3+i,-i,2,1+i*2); ctx.fillRect(1,-1,5,3); };
const icRetry=()=>{ ctx.fillStyle='#fff'; ctx.fillRect(-4,-4,7,2); ctx.fillRect(-5,-3,2,7); ctx.fillRect(-4,3,8,2); ctx.fillRect(3,-1,2,5); ctx.fillRect(2,-6,1,6); ctx.fillRect(3,-5,1,4); };

function panel(x,y,w,h,col='#2b1a4a'){ x=Math.round(x); y=Math.round(y); w=Math.round(w); h=Math.round(h); ctx.fillStyle='rgba(10,4,20,.35)'; ctx.fillRect(x+3,y+4,w,h); ctx.fillStyle='#120818'; ctx.fillRect(x+1,y,w-2,h); ctx.fillRect(x,y+1,w,h-2); ctx.fillStyle=col; ctx.fillRect(x+1,y+1,w-2,h-2); ctx.fillStyle='rgba(255,255,255,.12)'; ctx.fillRect(x+2,y+2,w-4,1); ctx.fillStyle='rgba(0,0,0,.25)'; ctx.fillRect(x+2,y+h-3,w-4,1); }
function starIcon(x,y,on,s=1){ x=Math.round(x); y=Math.round(y); const P=['..#..','..#..','#####','.###.','##.##']; const P2=['....#....','...###...','...###...','#########','.#######.','..#####..','..##.##..','.##...##.','##.....##'];
 const pat=s>1?P2:P; const cOn=['#fff3a0','#ffd23c','#ff9a1c'];
 for(let j=0;j<pat.length;j++)for(let i=0;i<pat[j].length;i++) if(pat[j][i]==='#'){ ctx.fillStyle=on?(j<2?cOn[0]:j<pat.length-2?cOn[1]:cOn[2]):'#3a2a52'; ctx.fillRect(x+i-(pat[0].length>>1),y+j,1,1);} }
// FB7: конфета-бонбон 19×11 (тот же габарит): круглая карамелька с завитком-полоской, блик, тень, фантик-«бантики» со складками
const CANDY_PAL=[{d:'#b0185a',m:'#ff4a8a',l:'#ff8ab8',w:'#ffe0ee',s:'#fff2f8',r:'#ffd23c',rd:'#d09a10'},{d:'#c07a08',m:'#ffd23c',l:'#ffe88a',w:'#fffbe0',s:'#ff6a3a',r:'#4ef0b0',rd:'#20a878'},{d:'#16906a',m:'#4ef0b0',l:'#a0ffd8',w:'#eafff6',s:'#ffffff',r:'#ff7ab8',rd:'#c0407a'}];
const candyCache={};
function candySprite(v){ if(candyCache[v]) return candyCache[v]; const P=CANDY_PAL[v], Wd=19, Hd=11, g=[]; for(let y=0;y<Hd;y++) g.push(Array(Wd).fill(''));
 for(let y=1;y<=9;y++) for(let x=4;x<=14;x++){ const dx=(x-9)/5.6, dy=(y-5)/4.6; const r2=dx*dx+dy*dy; if(r2>1) continue; let c='m'; const sh=dx*.7+dy*.7; if(sh>.45) c='d'; else if(sh<-.35) c='l'; if((x+y*2)%5===0&&r2<.8) c=(sh>.45?'m':'s'); if(x===7&&y===3||x===6&&y===3||x===6&&y===4) c='w'; g[y][x]=c; }
 for(let x=1;x<=3;x++){ const hh=x===3?1:x===2?2:3; for(let y=5-hh;y<=5+hh;y++){ g[y][x]=(y===5||x===3)?'rd':((y+x)%2?'r':'rd'); g[y][18-x]=(y===5||x===3)?'rd':((y+x)%2?'r':'rd'); } }
 const [c,x]=mk(Wd,Hd); for(let y=0;y<Hd;y++)for(let q=0;q<Wd;q++){ if(g[y][q]) continue; let nb=false; for(const [a,b] of [[1,0],[-1,0],[0,1],[0,-1]]){ const yy=y+b, xx=q+a; if(yy>=0&&yy<Hd&&xx>=0&&xx<Wd&&g[yy][xx]&&g[yy][xx]!=='o') nb=true; } if(nb) g[y][q]='o'; }
 for(let y=0;y<Hd;y++)for(let q=0;q<Wd;q++){ const k=g[y][q]; if(!k) continue; x.fillStyle=k==='o'?'#1a0c22':P[k]; x.fillRect(q,y,1,1); }
 return candyCache[v]=c; }
let magPopT=-9;
/* Ф1м: золотой шлейф захваченной конфеты — пиксели 3→1, #ffd23c → #f0a828, гаснет по альфе; ночью ярче (+.15) */
function drawMagTrails(){ const nb=isNight()?.15:0, N=MAG.TRAIL; for(const c of world.candies){ if(c.got||!c.trN) continue; let px=c.x, py=c.y, L=0; const tot=c.trN*12;
  for(let j=0;j<c.trN;j++){ const idx=((c.trI-1-j)%N+N)%N, qx=c.tr[idx*2], qy=c.tr[idx*2+1], sl=Math.hypot(qx-px,qy-py), n=Math.max(1,Math.ceil(sl/2));
   for(let k=1;k<=n;k++){ const d=L+sl*k/n; if(d<5) continue; const f=Math.max(0,1-d/Math.max(36,tot)), sz=f>.6?3:f>.3?2:1; if(f<=0) break; ctx.globalAlpha=Math.min(1,.2+.7*f+nb); ctx.fillStyle=f>.5?'#ffd23c':'#f0a828'; ctx.fillRect(Math.round(px+(qx-px)*k/n-sz/2),Math.round(py+(qy-py)*k/n-sz/2),sz,sz); }
   L+=sl; px=qx; py=qy; } } ctx.globalAlpha=1; }
function candy(x,y,t,i){ const b=Math.round(Math.sin(t*3+i)*2); const v=i%3, c=CANDY_PAL[v].m;
 x=Math.round(x); y=Math.round(y)+b;
 ctx.globalAlpha=.22+.13*Math.sin(t*5+i); ctx.fillStyle=c; ctx.fillRect(x-7,y-1,15,3); ctx.fillRect(x-1,y-7,3,15); ctx.globalAlpha=1;
 ctx.drawImage(candySprite(v),x-9,y-5); const tw=(Math.sin(t*4+i*1.7)+1)/2; if(tw>.85){ ctx.fillStyle='#fff'; ctx.fillRect(x+3,y-5,1,3); ctx.fillRect(x+2,y-4,3,1); } }
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
/* FB15: кнопка стоит на поверхности под ней (раньше висела в воздухе на ~13 px) */
function btnY(b){ if(b._vy!==undefined) return b._vy; let best=null; for(const o of world.solids) if(o.type!=='d'&&b.x>=o.x&&b.x<=o.x+o.w&&o.y>=b.y-2&&o.y-b.y<=30&&(best===null||o.y<best)) best=o.y; return b._vy=best===null?(b.y|0):best-7; }
function drawButton(b){ const x=b.x|0,y=btnY(b); ctx.fillStyle='#120818'; ctx.fillRect(x-7,y+3,14,4); ctx.fillStyle='#6a6e78'; ctx.fillRect(x-6,y+4,12,2); ctx.fillStyle='#120818'; const hh=b.on?1:4; ctx.fillRect(x-4,y+3-hh,8,hh+1); ctx.fillStyle=b.on?'#4ed05a':DOOR_COL[b.id%3||0]; ctx.fillRect(x-3,y+4-hh,6,hh); if(!b.on){ ctx.fillStyle='#fff'; ctx.fillRect(x-2,y+4-hh,2,1); } }
const DOOR_COL=['#ff4a6a','#4ef0ff','#ffd23c'];
// FB23: нити кнопка→дверь убраны; вместо них НЕнажатая кнопка чуть подсвечена ореолом цвета своей двери (целые пиксели). Ореол всегда ПОД объектами; ночью виден через просвет в ночном слое.
function drawBtnGlow(b,t,nt){ if(b.on) return; const x=b.x|0,y=btnY(b), col=DOOR_COL[b.id%3||0], br=.85+.15*Math.sin(t*2.4); ctx.fillStyle=col;
 const R=nt?[[11,6,.10],[8,4,.15]]:[[9,5,.07],[7,3,.11]]; for(const [rx,ry,a] of R){ ctx.globalAlpha=a*br; ctx.fillRect(x-rx,y-ry,rx*2,ry+4); ctx.fillRect(x-rx+2,y-ry-2,rx*2-4,2); }
 ctx.globalAlpha=1; }
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
   const ex=n>3?sx/n:mx, ey=n>3?sy/n:y0+(y1-y0)*.38;
   // FB9: рот — центр «внутренних» тёмных пикселей ниже глаз (не контур, не зрачки); глаза — рамка белков
   let ex0=1e9,ex1=-1,ey0=1e9,ey1=-1; for(let y=y0;y<=ylim;y++)for(let xx=x0;xx<=x1;xx++){ const i=((cy0+y)*1024+cx0+xx)*4; if(d[i+3]<200) continue; if(d[i]>215&&d[i+1]>215&&d[i+2]>215){ ex0=Math.min(ex0,xx); ex1=Math.max(ex1,xx); ey0=Math.min(ey0,y); ey1=Math.max(ey1,y); } }
   const opq=(xx,y)=>xx>=0&&xx<An.w&&y>=0&&y<64&&d[((cy0+y)*1024+cx0+xx)*4+3]>128; let mx2=0,my2=0,mn=0;
   for(let y=Math.round(Math.max(ey,ey1>=0?ey1:ey)+1);y<=y1-2;y++)for(let xx=x0+2;xx<=x1-2;xx++){ const i=((cy0+y)*1024+cx0+xx)*4; if(d[i+3]<200) continue; if(lum(d[i],d[i+1],d[i+2])>72) continue; if(ex1>=0&&xx>=ex0-2&&xx<=ex1+2&&y<=ey1+2) continue; if(!(opq(xx-2,y)&&opq(xx+2,y)&&opq(xx,y-2)&&opq(xx,y+2))) continue; mx2+=xx; my2+=y; mn++; }
   const mox=mn>=2?Math.round(mx2/mn):Math.round(mx+(ex-mx)*.35), moy=mn>=2?Math.round(my2/mn):Math.round(ey+(y1-ey)*.4+2);
   let lx=0,ly=0,ln=0,rx=0,ry=0,rn=0; const emid=(ex0+ex1)/2; if(ex1>=0) for(let y=y0;y<=ylim;y++)for(let xx=ex0;xx<=ex1;xx++){ const i=((cy0+y)*1024+cx0+xx)*4; if(d[i+3]<200) continue; if(d[i]>215&&d[i+1]>215&&d[i+2]>215){ if(xx<emid){lx+=xx;ly+=y;ln++;} else {rx+=xx;ry+=y;rn++;} } }
   const el=ln>2?[Math.round(lx/ln),Math.round(ly/ln)]:[Math.round(ex),Math.round(ey)], er=rn>2?[Math.round(rx/rn),Math.round(ry/rn)]:[Math.round(ex),Math.round(ey)];
   let ml=0,mc=0; for(let y=moy-3;y<=moy+3;y++)for(let xx=mox-4;xx<=mox+4;xx++){ if(xx<0||xx>=An.w||y<0||y>=64) continue; const i=((cy0+y)*1024+cx0+xx)*4; if(d[i+3]<200) continue; ml+=lum(d[i],d[i+1],d[i+2]); mc++; }
   A[k].push({hx:Math.round(hx),hy,ex:Math.round(ex),ey:Math.round(ey),top:y0,by:y1,mx:Math.round(mx),mox,moy,mf:mn>=2,ew:ex1>=0?ex1-ex0+1:0,el,er,mlum:mc?ml/mc:128}); } }
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
// FB9: точка для лицевого аксессуара: усы — над ртом (верхняя губа), нос — между глазами и ртом, очки — на глаза
function accPos(a,it){ if(it.id==='stache') return [a.mox, a.moy-1]; if(it.id==='nose') return [Math.round(a.mox*.6+a.ex*.4), Math.round(Math.max(a.ey+4, a.moy-5))]; return [a.ex,a.ey]; }
// FB12: лицевой предмет с учётом формы: очки на далеко расставленных/стебельчатых глазах → по линзе на каждый глаз; усы на тёмном теле → светлая обводка
const isGlasses=it=>it.id==='shades'||it.id==='g1c';
function glassesSplit(a,it){ if(!isGlasses(it)||!a.el||!a.er) return false; const dx=Math.abs(a.er[0]-a.el[0]), dy=Math.abs(a.er[1]-a.el[1]); const w=it.id==='g1c'?12:15; return dx>w-2||dy>4; }
function lens(x,y,it,g=ctx){ x=Math.round(x); y=Math.round(y); const red=it.id==='g1c'; g.fillStyle=red?'#3a0a0a':'#000'; g.fillRect(x-4,y-3,9,7); g.fillStyle=red?'#c8e8ff':'#1a1a2a'; g.fillRect(x-3,y-2,7,5); g.fillStyle=red?'#ffffff':'#5a6a9a'; g.fillRect(x-2,y-2,2,1); g.fillRect(x-2,y-1,1,1); if(red){ g.fillStyle='#8a1a1a'; g.fillRect(x-4,y-3,9,1); } }
const outlCache={};
function outlined(it){ if(outlCache[it.id]) return outlCache[it.id]; const c0=pixItem(it); const [c,x]=mk(c0.width+2,c0.height+2); x.globalAlpha=.85; for(const [a,b] of [[0,1],[2,1],[1,0],[1,2]]) x.drawImage(c0,a,b); x.globalCompositeOperation='source-in'; x.fillStyle='#ffe6c8'; x.fillRect(0,0,c.width,c.height); x.globalCompositeOperation='source-over'; x.globalAlpha=1; x.drawImage(c0,1,1); return outlCache[it.id]=c; }
function drawFace(a,it,px,py,g=ctx){ if(glassesSplit(a,it)){ lens(a.el[0]-px,a.el[1]-py,it,g); lens(a.er[0]-px,a.er[1]-py,it,g); return; }
 const dark=(it.id==='stache'||it.id==='nose')&&a.mlum<95; const c=dark?outlined(it):pixItem(it); const [ax,ay]=accPos(a,it); g.drawImage(c,Math.round(ax-px-c.width/2+(it.dx||0)),Math.round(ay-py-c.height/2+(it.dy||0))); }
/* праздник: если шапка не выбрана — на уровнях носим праздничную (как в меню); выбранная шапка всегда главнее */
/* посадка праздничной шапки на купол головы: первая сверху строка, где сплошной кусок тела ≥45% ширины спрайта, ширина ≥8..13 px и под якорем головы anchors().hx (стебли глаз, ряды глаз без тела под ними и тонкие детали пропускаем) */
const seatCache={};
function hatSeat(id){ if(seatCache[id]) return seatCache[id]; const im=SPR[id]; if(!im) return null; const [c,x]=mk(1024,320); x.drawImage(im,0,0); const d=x.getImageData(0,0,1024,320).data; const S={};
 for(const k in ANIM){ const An=ANIM[k]; S[k]=[]; for(let f=0;f<An.n;f++){ const cx0=f*An.w, cy0=An.row*64, op=(xx,y)=>d[((cy0+y)*1024+cx0+xx)*4+3]>128; let x0=1e9,x1=-1; for(let y=0;y<64;y++)for(let xx=0;xx<An.w;xx++) if(op(xx,y)){ if(xx<x0)x0=xx; if(xx>x1)x1=xx; }
  const A0=anchors(id), hx=A0&&A0[k][f]?A0[k][f].hx:An.w/2; const find=strict=>{ if(x1<0) return null; const need=Math.max(8,Math.min(13,(x1-x0+1)*.45)); for(let y=0;y<64;y++){ let rs=-1; for(let xx=0;xx<=An.w;xx++){ const o=xx<An.w&&op(xx,y); if(o&&rs<0) rs=xx; if(!o&&rs>=0){ const L=xx-rs; let wh=0; for(let q=rs;q<xx;q++){ const i=((cy0+y)*1024+cx0+q)*4; if(d[i]>215&&d[i+1]>215&&d[i+2]>215) wh++; }
    const sx2=Math.max(rs+5,Math.min(xx-6,hx)), runAt=yy=>{ if(yy>=64||!op(sx2,yy)) return 0; let a=sx2,b=sx2; while(a>0&&op(a-1,yy)) a--; while(b<An.w-1&&op(b+1,yy)) b++; return b-a+1; };
    if(L>=need&&hx>=rs-6&&hx<xx+6&&(!strict||(wh<L*.3&&runAt(y+2)>=need&&runAt(y+4)>=need))) return {x:sx2,y}; rs=-1; } } } return null; };
  const seat=find(true)||find(false);
  S[k].push(seat); }
  const R=S[k]; for(let f=0;f<R.length;f++) if(!R[f]){ for(let o=1;o<R.length&&!R[f];o++) R[f]=R[(f+o)%R.length]||R[(f-o+R.length)%R.length]||null; }
  /* без скачков между кадрами: смещение от якоря anchors() — медиана по кадрам анимации */ const A1=anchors(id)[k], med=v=>v.slice().sort((a,b)=>a-b)[v.length>>1]; if(R.every(Boolean)){ const mdx=med(R.map((q,f)=>q.x-A1[f].hx)), mdy=med(R.map((q,f)=>q.y-A1[f].hy)); for(let f=0;f<R.length;f++) R[f]={x:A1[f].hx+mdx,y:A1[f].hy+mdy}; } }
 return seatCache[id]=S; }
function holidayHat(){ return isNewYear()?EGG_ITEMS.santa:isHalloween()?EGG_ITEMS.pumpkin:null; }
function drawSlugC(id,anim,f,x,y,flip=false,sx=1,sy=1){ const cz=cosGet(); const sid=cz.skin?id+'#'+cz.skin:id; if(cz.skin&&!SPR[sid]){ const s=skinSprite(id,cz.skin); if(s) SPR[sid]=s; }
 drawSlug(SPR[sid]?sid:id,anim,f,x,y,flip,sx,sy); const fc=cz.face||(isApril1()?'stache':''); const hol=cz.head?null:holidayHat(); if(!cz.head&&!fc&&!hol) return; const A=anchors(id); if(!A) return; const a=A[anim][f]; if(!a) return;
 const px=anim==='pull'?96:32, py=40; ctx.save(); ctx.translate(Math.round(x),Math.round(y)); if(flip) ctx.scale(-1,1); if(sx!==1||sy!==1){ ctx.translate(0,16); ctx.scale(sx,sy); ctx.translate(0,-16); }
 if(fc){ const it=COSI.face.find(i=>i.id===fc); drawFace(a,it,px,py); }
 if(hol&&!cz.head){ const S=hatSeat(id), q=S&&S[anim]&&S[anim][f]; const c=pixItem(hol); if(q) ctx.drawImage(c,Math.round(q.x-px-c.width/2),Math.round(q.y-py-c.height+1)); else ctx.drawImage(c,Math.round(a.hx-px-c.width/2),Math.round(a.hy-py-c.height+2)); /* нет купола — как шапки гардероба */ }
 if(cz.head){ const it=COSI.head.find(i=>i.id===cz.head); const c=pixItem(it); const bob=it.float?Math.round(Math.sin(now*3)):0; ctx.drawImage(c,Math.round(a.hx-px-c.width/2),Math.round(a.hy-py-c.height+2-(it.float||0)+bob)); }
 ctx.restore(); }
function drawWardrobe(){ drawBG(3,0,now); swipePager=null; const tp=TAP(); iconBtn(4,4,icBack,()=>{sfx('tap');scene='select';},'back'); const cz=cosGet();
 T('Гардероб',W/2,tp/2-9,16,['#fff','#ffd23c']); T('★ '+totalStars()+'   ◆ '+gemsHave().length+'/'+SECRETS.length,W/2,tp/2+9,10,'#d8c8f0');
 const c=PC(); const py=tp+120; panel(W/2-90,tp+22,180,130,'#22143e'); ctx.save(); ctx.translate(Math.round(W/2),Math.round(py)); ctx.scale(2,2); drawSlugC(c.id,'idle',frameOf('idle',now),0,0); ctx.restore(); T(c.name,W/2,tp+136,11,'#fff');
 let y=tp+164; const cols=8, cw=Math.floor((W-16)/cols), chh=Math.max(TAP(),40);
 for(const [slot,title] of [['head','Голова'],['face','Лицо'],['skin','Скин']]){ T(title,12,y,12,'#ffd23c','l'); y+=16; const list=[{id:'',name:'нет'}].concat(COSI[slot]);
  list.forEach((it,k)=>{ const x=8+(k%cols)*cw, yy=y+Math.floor(k/cols)*chh; const op=!it.need||cosOpen(it), sel=cz[slot]===it.id;
   panel(x+1,yy,cw-2,chh-3,sel?'#2a6a5a':op?'#2b1a4a':'#1a1020'); const cx=x+cw/2|0, cy=yy+chh/2-3|0;
   if(!it.id){ T('—',cx,cy-6,12,'#a898c8'); }
   else if(slot==='skin'){ const sp=op?skinSprite('slug01',it.id):null; if(sp){ ctx.save(); ctx.beginPath(); ctx.rect(x+2,yy+1,cw-4,chh-5); ctx.clip(); ctx.drawImage(sp,0,0,64,64,cx-32,cy-28,64,64); ctx.restore(); } }
   else { const pc=pixItem(it); const k2=pc.width>14?1:2; if(!op) ctx.globalAlpha=.3; ctx.drawImage(pc,Math.round(cx-pc.width*k2/2),Math.round(cy-pc.height*k2/2),pc.width*k2,pc.height*k2); ctx.globalAlpha=1; }
   if(!op) T(cosNeedTxt(it.need),cx,yy+chh-16,9,it.need.gem?'#7affff':'#ffd23c');
   buttons.push({x,y:yy,w:cw,h:chh-3,label:'cos'+slot+k,cb:()=>{ if(!op){ lockNo(); haptic('error'); floats.push({s:it.name+': нужно '+cosNeedTxt(it.need),x:W/2-ox,y:yy-oy-6,t:0,life:1.3,size:11,col:'#ffd23c'}); return; } cz[slot]=it.id; store(); sfx('candy',k%4); haptic('tick'); if(it.id) floats.push({s:it.name,x:W/2-ox,y:tp+40-oy,t:0,life:1,size:12,col:'#fff'}); }}); });
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
 const abs=[...new Set([A.ab,B.ab].filter(Boolean))]; const taps=[A,B].filter(x=>x.tap&&x.ab&&x.ab!=='slowmo').map(x=>x.ab); const tapAb=taps[0]||(abs.includes('slowmo')?'slowmo':'');
 const c={id:'fuse_'+key,name:fuseName(A,B),fuse:[a,b],col:B.col,col2:A.col,rest:avg('rest'),fric:avg('fric'),power:avg('power'),grav:avg('grav'),splat:avg('splat'),spiky:!!(A.spiky||B.spiky),extra:Math.max(A.extra||0,B.extra||0),ab:tapAb,tap:tapAb?1:0,abs,taps};
 const perks=abs.map(x=>ABN[x]||x); if(taps.length===2){ perks.length=0; perks.push('тап1: '+(ABN[taps[0]]||taps[0]),'тап2: '+(ABN[taps[1]]||taps[1])); abs.filter(x=>!taps.includes(x)).forEach(x=>perks.push(ABN[x]||x)); } if(c.spiky) perks.push('шипы не страшны'); if(c.extra) perks.push('+'+c.extra+' бросок'); if(!perks.length) perks.push('прыгучесть '+Math.round(c.rest*100)+'%');
 c.perk=perks.join(' + '); { const tl=taps.length?taps:(tapAb?[tapAb]:[]); const H=[]; tl.forEach((x,i)=>H.push((tl.length>1?'тап'+(i+1):'тап в полёте')+': '+(ABN[x]||x))); const pas=abs.filter(x=>!tl.includes(x)).map(x=>ABN[x]||x); if(c.spiky) pas.push('шипы не страшны'); if(c.extra) pas.push('+'+c.extra+' бросок'); if(pas.length) H.push('всегда: '+pas.join(', ')); c.howto=H.length?H.join(' • '):c.perk; } c.desc=A.name+' + '+B.name+' • гибрид навсегда'; c.cost=0;
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
  buttons.push({x,y,w:cw,h:chh-3,label:'f'+i,cb:()=>{ sfx('tap'); const j=fusePick.indexOf(i); if(j>=0){ fusePick.splice(j,1); return; } if(fusePick.length===1){ const why=fuseCheck(fusePick[0],i); if(why){ lockNo(); haptic('error'); floats.push({s:why,x:W/2-ox,y:H*.62-oy,t:0,life:1.4,size:11,col:'#ff8a9a'}); return; } } if(fusePick.length>=2) fusePick=[]; fusePick.push(i); haptic('tick'); }}); });
 const y0=tp+22+Math.ceil(pool.length/cols)*chh+8; const ph=Math.max(270,H-y0-tp-24); panel(10,y0,W-20,ph,'#22143e');
 if(fusePick.length<2){ T(fusePick.length?'теперь второй слизень':'первый даёт форму, второй — цвет и макушку',W/2,y0+ph/2-6,11,'#e8dcff');
  T('одна тап-способность на гибрида, пассивки складываются',W/2,y0+ph/2+12,10,'#a898c8'); }
 else { const F=fusedChar(fusePick[0],fusePick[1]); const A=CHARS[fusePick[0]],B=CHARS[fusePick[1]];
  T(F.name,W/2,y0+8,18,['#fff','#7affe0']); const ry=y0+70;
  drawSlug(A.id,'idle',frameOf('idle',now),W/2-80,ry); T('+',W/2-40,ry-26,16,'#fff'); drawSlug(B.id,'idle',frameOf('idle',now+.5),W/2,ry); T('=',W/2+40,ry-26,16,'#fff'); drawSlug(F.id,'idle',frameOf('idle',now),W/2+80,ry);
  const cy=ry+100; ctx.save(); ctx.translate(W/2,cy); ctx.scale(2,2); drawSlug(F.id,'idle',frameOf('idle',now),0,0); ctx.restore();
  T(F.perk,W/2,cy+54,11,F.col); const known=hybList().includes(hybKey(fusePick[0],fusePick[1])); T('прыгучесть '+Math.round(F.rest*100)+'% • сила '+Math.round(F.power*100)+'%',W/2,cy+70,10,'#d8c8f0'); T(known?'уже в коллекции — просто выбрать':'после слияния останется в коллекции навсегда',W/2,cy+86,10,known?'#a898c8':'#7affe0');
  btn(W/2-90,Math.min(H-tp-8,y0+ph+6),180,tp,known?'ВЫБРАТЬ':'СЛИТЬ!',()=>{ const a=fusePick[0],b=fusePick[1]; fusePick=[]; selectHybrid(a,b); if(hybDiscover(a,b)){ qEv('fuse'); sfx('secret'); haptic('success'); showReveal('hyb',fusedChar(a,b)); } else { sfx('tap'); scene='levels'; } },'#4ed05a',14); buttons[buttons.length-1].label='fusego'; }
 for(const f of floats){ const k=f.t/f.life; T(f.s,f.x+ox,f.y+oy-k*14,f.size,f.col); } }
function startLevel(i){ idleT=0; bossLbl=null; impStage=0; bubble=null; if(fusion&&!chaosRun) fusion.level=i; curLevel=i; if(relayTeam&&!chaosRun){ relay={i:0,sw:0}; } else relay=null; world=new World(i,PC()); if(nastya) world.inf=true; if(relay) world.shots+=1;
 if(!chaosRun&&!relay&&!nastya){ const ch0=PC(); if(!ch0.fuse&&save.house&&save.house[ch0.id]){ const h=houseOf(ch0.id); let n=fedSess.has(ch0.id)?fedSess.get(ch0.id):fedN(h.full); if(n>0){ world.shots+=n; world.fedBonus=n; if(!fedSess.has(ch0.id)){ fedSess.set(ch0.id,n); save.fedUsed=[...fedSess]; store(); } } } } wxP=[]; wxPrev=''; if(chaosRun){ world.shots+=2; const c=chaosRun; if(!c.mod||!chaosModOK(c.mod,world.L)){ c.mod=chaosPick(c.mod,world.L); c.fx=0; } if(!c.next||!chaosModOK(c.next,world.L)) c.next=chaosPick(c.mod,world.L); world.mod=c.mod; world.comboMul=1.5; } const ti=themeOf(i); lvlCanvas=buildLevelCanvas(LV[i],ti); if(world.boss) bossLbl={t0:now,w:world}; parts=[];decals=[];floats=[];overlay=null;drag=null;sAnim={a:'idle',t:0};
 scene='play'; tgBack(true); floats.push({s:LV[i].hint,x:LW/2,y:150,t:0,life:2.6,size:11,col:'#fff'}); if(world.fedBonus) floats.push({s:'Сытый: +'+world.fedBonus+' '+brosk(world.fedBonus)+' — до выхода в меню',x:LW/2,y:128,t:0,life:2.4,size:12,col:['#fff','#7affe0'],pop:1}); if(nastya) floats.push({s:'Режим Насти: ♥ ∞',x:LW/2,y:106,t:0,life:2.4,size:13,col:['#ffd0ea','#ff4a8a'],pop:1});
 /* FB17: представление босса — табличка над самим боссом (drawBossLabel) */
 if(world.wx){ const nm=WXN[world.wxNow]; floats.push({s:'Погода: '+nm[0],x:LW/2,y:world.boss?236:190,t:0,life:2.4,size:12,col:nm[1]}); }
 if(relay) floats.push({s:'ЭСТАФЕТА: '+relayTeam.map(j=>CHARS[j].name).join(' → '),x:LW/2,y:world.boss?258:212,t:0,life:2.6,size:11,col:'#ffb03c'}); }
function goBack(){ uiTr.back=true; sfx('tap'); if(scene==='play'&&chaosRun){ chaosEnd(); return; } if(scene==='play'){scene='levels'; relay=null;} else if(scene==='fuse'||scene==='wardrobe'){scene='select';} else if(scene==='levels'){ if(relayTeam){ scene='relay'; } else scene='select';} else if(scene==='relay'){ relayTeam=null; scene='menu'; tgBack(false);} else if(scene==='reveal'){ const k=reveal&&reveal.kind; reveal=null; if(k==='hyb'){ selTab=1; scene='select'; } else { scene='menu'; tgBack(false); } } else if(scene==='select'||scene==='house'||scene==='bestiary'||scene==='quests'||scene==='settings'){scene='menu'; tgBack(false);} }
function burst(x,y,n,cols,sp=90,up=0,life=.6,g=300){ for(let i=0;i<n;i++){ const a=Math.random()*Math.PI*2, v=sp*(.3+Math.random()); parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-up,life:life*(.6+Math.random()*.6),t:0,c:cols[i%cols.length],g,s:Math.random()<.3?2:1}); } }
const COMBO_TXT=['','','ДВОЙНОЙ ШМЯК!','ТРОЙНОЙ ШМЯК!','МЕГАРИКОШЕТ!','УЛЬТРАШМЯК!','ШМЯК-ЛЕГЕНДА!','СЛИЗЕПОКАЛИПСИС!'];
const COMBO_COL=['','','#7affe0','#4ef0ff','#ffe066','#ff9a1c','#ff5aa8','#ff3a3a'];
function comboText(k){ return k<COMBO_TXT.length?COMBO_TXT[k]:'БОГ РИКОШЕТА ×'+k+'!'; }
function handleEvents(){ const ch=PC(); for(const e of world.ev){ const [k,x,y]=e; if(k==='secbump'){ const rd=(world.L.sec&&world.L.sec.riddle)||''; sfx('bounce',30); floats.push({s:'Портал спит… проснётся только для особенного слизня',x:LW/2,y:Math.max(70,Math.min(LH-80,y-40)),t:0,life:3.2,size:10,col:['#fff','#7affff']}); if(rd) floats.push({s:'«'+rd+'»',x:LW/2,y:Math.max(86,Math.min(LH-64,y-24)),t:0,life:3.2,size:9,col:'#c8f0ff'}); continue; }
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
 if(k==='candy'&&!chaosRun){ const add=world.has('lucky')?2:1; world.cGot=(world.cGot||0)+add; save.candy=(save.candy|0)+add; qEv('candy'); if(add>1) floats.push({s:'×2 удача!',x,y:y-28,t:0,life:.8,size:10,col:'#ffd23c'}); }
 if(k==='combo'){ const n=e[1]; sfx('combo',n); haptic(n>=4?'medium':'light'); floats=floats.filter(f=>!f.combo); const cs=Math.min(20,12+n*1.5), ct=comboText(n), hw=Math.min(LW/2-4,ct.length*cs*.44); floats.push({s:ct,x:Math.max(hw+4,Math.min(LW-hw-4,e[2])),y:Math.max(40,e[3]-34),t:0,life:1.1,size:ct.length*cs*.62>LW-8?Math.floor((LW-8)/(ct.length*.62)):cs,col:COMBO_COL[Math.min(n,7)]||'#ff3a3a',combo:1,pop:1});
  if(n>=4){ shake=Math.max(shake,1+n*.5); if(n>=5) flash=.08; } burst(e[2],e[3],6+n*3,[COMBO_COL[Math.min(n,7)]||'#fff','#fff'],90+n*20,0,.6,0); }
 if(k==='secret'){ sfx('secret'); haptic('success'); shake=Math.max(shake,3); burst(x,y,30,['#4ef0ff','#fff','#ff5aa8'],140,20,.8,0); floats.push({s:'ТАЙНИК ОТКРЫТ!',x:Math.max(60,Math.min(LW-60,x)),y:y-22,t:0,life:1.4,size:13,col:['#fff','#4ef0ff']}); }
 if(k==='gem'){ sfx('gem'); haptic('success'); flash=.1; burst(x,y,36,['#7affff','#2ab0e0','#fff'],160,40,1,0); if(!chaosRun&&!gemOf(curLevel)){ if(!Array.isArray(save.gems)) save.gems=[]; save.gems.push(curLevel); store(); world.gemNew=true; floats.push({s:'◆ САМОЦВЕТ '+gemsHave().length+'/'+SECRETS.length+'!',x:LW/2,y:Math.max(60,y-30),t:0,life:2,size:15,col:['#fff','#7affff'],pop:1}); } else floats.push({s:'◆ уже твой',x,y:y-20,t:0,life:1,size:11,col:'#7affff'}); }
 if(k==='combolost'){ floats.push({s:'комбо сгорело…',x:Math.max(60,Math.min(LW-60,x)),y:y-30,t:0,life:.9,size:11,col:'#c8b8e0'}); }
 if(k==='launch'){ sfx('launch'); haptic('medium'); burst(world.s.x,world.s.y+10,10,['#fff',ch.col],60,20,.4); shake=Math.max(shake,1.5); }
 if(k==='bounce'){ sfx('bounce',e[3]); squash=Math.min(1,e[3]/450); sqDir=[e[4],e[5]]; burst(x-e[4]*R,y-e[5]*R,4+(e[3]/80|0),[ch.col,'#fff'],e[3]*.25,0,.4); if(e[3]>300){shake=Math.max(shake,2);haptic('light');} }
 if(k==='boing'){ sfx('boing'); squash=1; sqDir=[0,-1]; burst(x,y+10,14,['#ff4fa8','#ff9ad0','#fff'],140,60,.6); if(e[3])e[3].hit=.3; shake=Math.max(shake,2); haptic('light'); }
 if(k==='splat'){ grafAdd(curLevel,x,y+R-2,ch.col,0); sfx('splat'); haptic('heavy'); shake=5; flash=.08; burst(x,y+10,26,[ch.col,ch.col,'#fff','#1a0c22'],170,80,.8); for(let i=0;i<7;i++) decals.push({x:x+(Math.random()*44-22)|0,y:y+R-1+(Math.random()*2|0),w:2+Math.random()*4|0,c:ch.col}); floats.push({s:['ШМЯК!','ПЛЮХ!','ХЛЮП!'][Math.random()*3|0],x,y:y-30,t:0,life:.9,size:14,col:['#fff','#ffd23c']}); sAnim={a:'splat',t:0}; }
 if(k==='candy'&&e[4]){ if(now-magPopT>=MAG.POP_GAP){ magPopT=now; sfx('pop',e[3]); } for(let i=0;i<6;i++){ const a=i/6*Math.PI*2+Math.random()*.5, v=(20+Math.random()*10)/.3; parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:.3,t:0,c:i%2?'#fff4b0':'#ffd23c',g:0,s:2}); } }
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
 store(); const nu=CHARS.filter((c,i)=>unlocked(i)).slice(before); overlay={k:'win',stars,phrase:WINS[Math.random()*WINS.length|0],nu,lines,cg:chaosRun?0:(world.cGot||0),c1:save.candy|0}; overlayT=0; },900); }

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
 if(k==='goo'){ sfx('bounce',Math.min(160,e[3]*.3)); { const n0=parts.length; burst(x,y,8+(e[3]/120|0),['#c8e040','#c8e040','#8ab020'],Math.min(140,e[3]*.25),0,.55); for(let i=n0;i<parts.length;i++){ parts[i].s=3+(Math.random()*2|0); parts[i].o=1; } } for(let i=0;i<4;i++) decals.push({x:Math.round(x+(Math.random()*24-12)),y:Math.round(Math.max(2,Math.min(LH-1,y+(e[5]<-.6?0:Math.random()*12-6)))),w:5+(Math.random()*5|0),h:3+(Math.random()*2|0),c:'#c8e040',hl:1}); }
 if(k==='rest'&&world.mod&&world.mod.id==='heavy'){ shake=Math.max(shake,1)+1; }
 if(k==='stick'){ grafAdd(curLevel,x+(x<LW/2?-R+2:R-2),y,ch.col,x<LW/2?1:2); sfx('bounce',100); burst(x,y,8,[ch.col,'#fff'],60,0,.3,0); sAnim={a:'idle',t:0}; }
 } world.ev.length=0; }

let FIXDT=0; // только для записи видео/тестов
function update(dt){ if(FIXDT) dt=FIXDT; now+=dt; if(RM()) shake=0; shake=Math.max(0,shake-dt*20); flash=Math.max(0,flash-dt); squash=Math.max(0,squash-dt*5); overlayT+=dt;
 gyroTick(dt); micTick(dt); if(scene==='play'&&world&&!overlay){ world.tilt=gyro.ax; relayTick(); wxFX(dt); const sd=((world.slow&&world.s.st==='fly')?dt*.33:dt)*(world.mod&&world.mod.ts||1); const sp=Math.max(Math.hypot(world.s.vx,world.s.vy),world.clone?Math.hypot(world.clone.vx,world.clone.vy):0); const n=Math.min(24,Math.max(4,Math.ceil(sp*sd/5))); if(chaosRun) chaosTick(dt); for(let i=0;i<n;i++) world.step(sd/n); /* FB2: шаг ≤5 px — без туннелирования */ handleEvents(); impTick(dt);
  const s=world.s; sAnim.t+=dt;
  if(s.st==='splat'){ if(sAnim.a!=='splat'&&sAnim.a!=='recover') sAnim={a:'splat',t:0}; if(sAnim.a==='splat'&&sAnim.t>.3+.35){ sAnim={a:'recover',t:0}; } if(sAnim.a==='recover'&&sAnim.t>.72){ s.st='idle'; sAnim={a:'idle',t:0}; } }
  else if(s.st==='fly') { if(sAnim.a!=='fly') sAnim={a:'fly',t:0}; }
  else if(s.st==='idle'&&sAnim.a==='recover'&&sAnim.t>.72) sAnim={a:'idle',t:0};
  else if(s.st==='idle'&&sAnim.a==='fly') sAnim={a:'idle',t:0};
  if(s.st==='idle'&&world.shots<=0&&!world.result&&!drag&&!world.clone){ world.result='fail'; setTimeout(()=>{ if(scene==='play'&&world.result==='fail'){ sfx('fail'); haptic('error'); overlay={k:'fail',phrase:FAILS[Math.random()*FAILS.length|0]}; if(chaosRun){ if(!nastya) chaosRun.lives--; overlay.over=chaosRun.lives<=0; overlay.sub=nastya?'Режим Насти: жизни бесконечные ♥':overlay.over?'Жизни кончились! Счёт: '+chaosRun.score:'−1 жизнь, осталось '+chaosRun.lives; } overlayT=0; } },700); }
  if(s.st==='fly'&&Math.random()<.5) parts.push({x:s.x+(Math.random()*8-4),y:s.y+(Math.random()*8-4),vx:0,vy:0,life:.35,t:0,c:PC().col,g:0,s:1,trail:1});
 }
 for(const p of parts){ p.t+=dt; p.vy+=p.g*dt; p.x+=p.vx*dt; p.y+=p.vy*dt; } parts=parts.filter(p=>p.t<p.life);
 for(const f of floats) f.t+=dt; floats=floats.filter(f=>f.t<f.life); toastQueue();
 if(scene==='menu') mflUpdate(dt); if(scene==='menu') for(const m of menuSlugs){ if(m.fl||m.ret) continue; m.vy+=500*dt; m.y+=m.vy*dt; m.x+=m.vx*dt; if(m.y>m.gy){ m.y=m.gy; if(m.vy>200){ m.sq=1; } m.vy=0; m.vx=0; if(!mflSleep(m)&&!(m.rest>now)&&Math.random()<dt*.6){ m.vy=-180-Math.random()*120; m.vx=(Math.random()-.5)*60; m.flip=m.vx<0; } } if(m.x<20)m.x=20; if(m.x>W-20)m.x=W-20; m.sq=Math.max(0,(m.sq||0)-dt*4); }
}
function frameOf(a,t){ const A=ANIM[a]; const f=Math.floor(t*1000/A.ms); return (a==='idle'||a==='fly')?f%A.n:Math.min(A.n-1,f); }

/* FB18: на тёмных (ночных) уровнях точки прицела ярче + мягкий светлый ореол; днём без изменений */
function mixHex(a,b,k){ const A=hex(a),B=hex(b); return 'rgb('+A.map((v,i)=>Math.round(v+(B[i]-v)*k)).join(',')+')'; }
let aimPts=null;
function aimDark(){ if(isNight()) return true; const th=THEMES[themeOf(curLevel)]; if(!th||!th.sky) return false; const L=th.sky.slice(0,2).map(c=>{ const q=hex(c); return lum(q[0],q[1],q[2]); }); return (L[0]+L[1])/2<70; }
function drawPlay(){ const s=world.s, ti=themeOf(curLevel), th=THEMES[ti], ch=PC();
 drawBG(ti,s.x-LW/2,now);
 const sx=(Math.random()-.5)*shake*2|0, sy=(Math.random()-.5)*shake*2|0;
 ctx.save(); ctx.translate(ox+sx,oy+sy);
 // рамка поля
 ctx.fillStyle='rgba(0,0,0,.25)'; ctx.fillRect(-3,-3,LW+6,LH+6); ctx.fillStyle=th.out; ctx.fillRect(-2,-2,LW+4,2); ctx.fillRect(-2,LH,LW+4,2); ctx.fillRect(-2,0,2,LH); ctx.fillRect(LW,0,2,LH);
 ctx.fillStyle=th.ui; ctx.globalAlpha=.5; ctx.fillRect(-1,-1,LW+2,1); ctx.globalAlpha=1;
 ctx.fillStyle='rgba(8,2,20,.18)'; ctx.fillRect(0,0,LW,LH); ctx.drawImage(lvlCanvas,0,0); { const gc=grafCanvas(curLevel); if(gc){ ctx.globalAlpha=overlay&&overlay.k==='grafview'?1:.85; ctx.drawImage(gc,0,0); ctx.globalAlpha=1; } }
 for(const d of decals){ const h=d.h||2; ctx.fillStyle='#1a0c22'; ctx.fillRect(d.x-1,d.y-1,d.w+2,h+1); ctx.fillStyle=d.c; ctx.fillRect(d.x,d.y-1,d.w,h); if(d.hl){ ctx.fillStyle='#f0ffa0'; ctx.fillRect(d.x+1,d.y-1,1,1); } }
 for(const w of world.water) drawWater(w,now); for(const f of world.fans) drawFan(f,now);
 for(const o of world.solids){ if(!o.alive) continue; if(o.type==='c') drawCrate(o); else if(o.type==='i') drawIce(o); else if(o.type==='d') drawDoor(o); else if(o.type==='v') drawConv(o,now); else if(o.type==='b'&&o.hit>0){ ctx.fillStyle='#fff'; ctx.globalAlpha=o.hit*2; ctx.fillRect(o.x,o.y-1,o.w,2); ctx.globalAlpha=1; } }
 for(const o of world.solids) if(o.alive&&o.type==='h'&&o.arg!=='shell'){ drawSecretDoor(o,now,(world.L.sec||{}).style); { const zx=Math.round(o.x+o.w/2+2), zy=Math.round(o.y-6-((now*8)%10)); ctx.globalAlpha=.85-((now*8)%10)/14; ctx.fillStyle='#c8f0ff'; ctx.fillRect(zx,zy,4,1); ctx.fillRect(zx+2,zy+1,1,1); ctx.fillRect(zx+1,zy+2,1,1); ctx.fillRect(zx,zy+3,4,1); const z2=Math.round(o.y-10-((now*8+5)%10)); ctx.globalAlpha=.85-((now*8+5)%10)/14; ctx.fillRect(zx+6,z2,3,1); ctx.fillRect(zx+7,z2+1,1,1); ctx.fillRect(zx+6,z2+2,3,1); ctx.globalAlpha=1; } }
 if(world.gem&&!world.gem.got) drawGem(world.gem.x,world.gem.y,now,gemOf(curLevel)&&!chaosRun);
 for(const b of world.buttons){ drawBtnGlow(b,now,isNight()); drawButton(b); }
 for(const m of world.movers) mover(m);
 for(const b of world.bumpers) bumper(b,now);
 for(const p of world.portals){ portal(p[0],p[1],now,0); portal(p[2],p[3],now,1); }
 jar(world.L.goal[0],world.L.goal[1],now,world.result==='win');
 if(world.has('magnet')) drawMagTrails(); world.candies.forEach((c,i)=>{ if(!c.got) candy(c.x,c.y,now,i); }); drawBoss();
 for(const p of parts) if(p.trail){ ctx.globalAlpha=1-p.t/p.life; ctx.fillStyle=p.c; ctx.fillRect(p.x|0,p.y|0,1,1);} ctx.globalAlpha=1;
 // траектория
 if(drag&&s.st==='idle'){ let dx=drag.cx-drag.x0, dy=drag.cy-drag.y0; const l=Math.hypot(dx,dy); if(l>8){
   const pts=[]; if(world.has('preview')){ const key=(dx|0)+','+(dy|0); if(!drawPlay.pc||drawPlay.pc.k!==key){ const pp=world.previewPath(dx,dy).pts; drawPlay.pc={k:key,pp}; } pts.push(...drawPlay.pc.pp.filter((_,i)=>i%2===0)); }
   else { const k=Math.min(l,MAXDRAG)/l, v=560*K*ch.power*(world.mod&&world.mod.pw||1)/MAXDRAG; const iv=world.mod&&world.mod.inv?-1:1; let vx=-dx*k*v*iv, vy=-dy*k*v*iv, px=s.x, py=s.y; const gg=G0*ch.grav*(world.has('glide')?.5:1)*(world.mod&&world.mod.g||1);
    for(let i=0;i<60;i++){ vy+=gg/60; px+=vx/60; py+=vy/60; if(px<0||px>LW||py>LH||py<0) break; let hit=false; for(const o of world.solids) if(o.alive&&px>o.x&&px<o.x+o.w&&py>o.y&&py<o.y+o.h) hit=true; if(hit)break; if(i%3===1) pts.push([px,py]); } }
   const dk=aimDark(); const cL=world.mod&&world.mod.id==='moon'?'#9ad8ff':dk?mixHex(ch.col,'#ffffff',.45):ch.col; if(chaosRun&&chaosRun.blink>0&&(now*16|0)%2) pts.length=0; aimPts=dk?{pts,cL}:null; if(!dk) pts.forEach(([px,py],i)=>{ const a=1-i/pts.length, z=i<8?3:2; if(dk){ ctx.globalAlpha=Math.max(.12,a*.26); ctx.fillStyle='#fff2c8'; ctx.fillRect((px|0)-2,(py|0)-2,z+4,z+4); } ctx.globalAlpha=Math.max(dk?.6:.35,a); ctx.fillStyle='#1a0c22'; ctx.fillRect((px|0)-1,(py|0)-1,z+2,z+2); ctx.fillStyle=i%2?cL:'#fff'; ctx.fillRect(px|0,py|0,z,z); ctx.globalAlpha=1; }); } }
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
 for(const p of parts) if(!p.trail){ if(p.o){ ctx.fillStyle='#1a0c22'; ctx.fillRect((p.x|0)-1,(p.y|0)-1,p.s+2,p.s+2); } ctx.fillStyle=p.c; ctx.fillRect(p.x|0,p.y|0,p.s,p.s); }
 chaosFXDraw(); drawWeather(); drawNight(); poleFX(); if(aimPts&&drag){ const {pts,cL}=aimPts; pts.forEach(([px,py],i)=>{ const a=1-i/pts.length, z=i<8?3:2; ctx.globalAlpha=Math.max(.14,a*.34); ctx.fillStyle='#fff2c8'; ctx.fillRect((px|0)-2,(py|0)-2,z+4,z+4); ctx.globalAlpha=Math.max(.75,a); ctx.fillStyle='#1a0c22'; ctx.fillRect((px|0)-1,(py|0)-1,z+2,z+2); ctx.fillStyle=i%2?cL:'#fff'; ctx.fillRect(px|0,py|0,z,z); ctx.globalAlpha=1; }); } aimPts=null; { let cy=4; if(chaosRun&&oy+LH+4>H-30) cy=CHAOS_HB+2; drawWxChip(cy); relayHud(cy); const by2=(world.wx||relay)?cy+28:cy;
  if(world.boss&&!world.boss.dead&&!world.result){ const B=BOSS[world.boss.k]; ctx.fillStyle='rgba(12,4,24,.55)'; ctx.fillRect(4,by2,LW-8,22); T('БОСС: '+B.name,10,by2+3,11,'#ffb03c','l'); for(let i=0;i<3;i++){ const hx=LW-40+i*11, on=i<world.boss.hp; ctx.fillStyle='#1a0c22'; ctx.fillRect(hx-1,by2+6,9,8); ctx.fillStyle=on?'#ff4a6a':'#4a3a5a'; ctx.fillRect(hx,by2+7,3,2); ctx.fillRect(hx+4,by2+7,3,2); ctx.fillRect(hx,by2+9,7,2); ctx.fillRect(hx+1,by2+11,5,1); ctx.fillRect(hx+2,by2+12,3,1); } }
  if(mic.on){ ctx.fillStyle='#1a0c22'; ctx.fillRect(LW-10,LH-60,6,52); ctx.fillStyle=mic.lvl>.16?'#ff3a3a':'#4ed05a'; const mh=Math.min(50,Math.round(mic.lvl*300)); ctx.fillRect(LW-9,LH-9-mh,4,mh); } }
 drawBossLabel();
 for(const f of floats){ const k=f.t/f.life; const yy=f.y-k*14; if(k>.75&&((f.t*20|0)%2)) continue; const sz=f.pop?Math.round(f.size*(1+Math.max(0,.35-f.t)*1.6)):f.size; T(f.s,f.x,yy,sz,f.col); }
 drawBubble(); if((world.combo||0)>=2&&s.st==='fly'){ T('×'+world.combo,s.x+18,s.y-30,14,COMBO_COL[Math.min(world.combo,7)]||'#ff3a3a','l'); }
 ctx.restore();
 if(flash>0){ ctx.fillStyle='rgba(255,255,255,.35)'; ctx.fillRect(0,0,W,H); }
 // HUD
 const tp=TAP(), roomy=fy>=tp+8, hy=roomy?Math.max(4,Math.min(fy-tp-6,Math.ceil(6*DPR/SC))):2; if(!roomy) ctx.globalAlpha=.8;
 iconBtn(4,hy,icBack,()=>goBack(),'back'); iconBtn(8+tp,hy,icRetry,()=>{sfx('tap');startLevel(curLevel);},'retry');
 iconBtn(W-4-tp,hy,icMute,()=>{setMute(!save.mute);},'mute'); iconBtn(W-8-2*tp,hy,icPause,()=>{sfx('tap');openPause();},'pause'); ctx.globalAlpha=1;
 const midW=W-4*tp-28; const nm=(curLevel+1)+'. '+world.L.name; T(nm.length*7>midW?nm.slice(0,Math.max(4,midW/7|0))+'…':nm,W/2,hy+1,12,'#fff');
 const total=world.shots, ns=nastya?0:Math.max(total,world.L.shots+(ch.extra||0)); const bx=W/2-(ns*9)/2; if(nastya){ const pu=1+Math.abs(Math.sin(now*3))*.0; T('♥ ∞',W/2,hy+15,13,['#ffd0ea','#ff4a8a']); }
 if(hudShots.w!==world){ hudShots.w=world; hudShots.n=total; } if(total<hudShots.n){ hudShots.t=now; hudShots.i=total; floats.push({s:'−1',x:bx+ns*9+14-ox,y:hy+18-oy,t:0,life:.6,size:11,col:'#ff4a6a'}); } hudShots.n=total;
 for(let i=0;i<ns;i++){ const on=i<total; const red=i===hudShots.i&&now-hudShots.t<.3; const x=(bx+i*9+4|0)+(red&&!RM()?(((now*40)|0)%2?1:-1):0), y=hy+20; if(red){ ctx.fillStyle='#1a0c22'; ctx.fillRect(x-3,y-1,8,7); ctx.fillStyle='#ff4a6a'; ctx.fillRect(x-2,y,6,5); continue; } ctx.fillStyle='#1a0c22'; ctx.fillRect(x-3,y-1,8,7); ctx.fillStyle=on?ch.col:'#3a2a52'; ctx.fillRect(x-2,y,6,5); if(on){ctx.fillStyle='#fff';ctx.fillRect(x-1,y+1,1,1);} }
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
 const tot=uiCount('stars',save.stars.reduce((a,b)=>a+(b||0),0),now,cuTick); const s1=tot+' / '+LV.length*3; starIcon(W/2-68,my+27,true); T(s1,W/2-58,my+24,12,'#ffd23c','l'); T('◆ '+gemsHave().length+'/'+SECRETS.length,W/2+30,my+24,12,'#7affff','l'); if(save.legacy) T('+'+save.legacy+' ★ из старой версии',W/2,my+44,10,'#d8c8f0');
}
const totalStars=()=>save.stars.reduce((a,b)=>a+(b||0),0)+(save.legacy|0);
const levelStars=()=>save.stars.reduce((a,b)=>a+(b||0),0);
const isOpen=i=>i===0||i<(save.open|0)||(save.stars[i-1]||0)>0;
const unlocked=i=>totalStars()>=CHARS[i].cost;
let selPage=0, lvlPage=0; const silCache={};
function silhouette(id,col='#1a1030'){ const ck=id+'|'+col; if(silCache[ck]) return silCache[ck]; const [c,x]=mk(64,64); x.drawImage(SPR[id],0,0,64,64,0,0,64,64); x.globalCompositeOperation='source-atop'; x.fillStyle=col; x.fillRect(0,0,64,64); silCache[ck]=c; return c; }
let swipePager=null;
function pager(y,page,pages,set,lbl){ if(pages<2) return; const tp=Math.max(44,TAP()); swipePager={page,pages,set};
 btn(8,y,tp,tp-4,'‹',()=>{sfx('tap');set((page+pages-1)%pages);},'#6a4fd8',22); buttons[buttons.length-1].label=lbl+'p';
 btn(W-8-tp,y,tp,tp-4,'›',()=>{sfx('tap');set((page+1)%pages);},'#6a4fd8',22); buttons[buttons.length-1].label=lbl+'n';
 const dw=Math.min(12,Math.floor((W-2*tp-40)/pages)); for(let i=0;i<pages;i++){ const xx=Math.round(W/2-pages*dw/2+i*dw); ctx.fillStyle='#1a0c22'; ctx.fillRect(xx-1,y+tp/2-6,dw-2,dw-2); ctx.fillStyle=i===page?'#ffd23c':'#5a4a7a'; ctx.fillRect(xx,y+tp/2-5,dw-4,dw-4);} }
let selTab=0;
function selectHybrid(a,b){ fusion={a,b,level:null,used:false}; useSecret=false; save.selHyb=hybKey(a,b); save.selSecret=false; store(); }
function selectChar(i){ selPick=i; useSecret=false; fusion=null; save.char=i; save.selHyb=null; save.selSecret=false; store(); }
function selectSecret(){ useSecret=true; fusion=null; save.selHyb=null; save.selSecret=true; store(); }
function hybPairs(){ return hybList().map(k=>k.split('_').map(Number)).filter(p=>p.length===2&&CHARS[p[0]]&&CHARS[p[1]]&&!fuseCheck(p[0],p[1])); }
// FB13: рисует слизня так, чтобы макушка (стебельки/шапка гибрида) не вылезала за верх клетки — при нужде чуть уменьшает от ног
function fitDraw(fn,id,anim,f,x,sy,yTop){ const A=anchors(id), a=A&&A[anim]&&A[anim][f]; if(!a){ fn(id,anim,f,x,sy); return; } const top=sy-40+a.top, feet=sy-40+a.by; if(top>=yTop){ fn(id,anim,f,x,sy); return; } const k=Math.max(.6,(feet-yTop)/Math.max(1,feet-top)); ctx.save(); ctx.translate(Math.round(x),feet); ctx.scale(k,k); ctx.translate(-Math.round(x),-feet); fn(id,anim,f,x,sy); ctx.restore(); }
function drawSelect(){ drawBG(1,0,now); swipePager=null; const tp=TAP(); T('Выбери слизня',W/2,tp/2-9,16,['#fff','#ff8fc8']); T('★ '+totalStars(),W-8,tp/2-6,11,'#ffd23c','r');
 iconBtn(4,4,icBack,()=>goBack(),'back');
 const HP=hybPairs(), tw=(W-36)/2|0, ty=tp+4, th=Math.max(34,tp-8);
 btn(12,ty,tw,th,'СЛИЗНИ',()=>{ sfx('tap'); selTab=0; selPage=0; },selTab===0?'#c04a9a':'#4a3a6a',13); buttons[buttons.length-1].label='st0';
 btn(24+tw,ty,tw,th,'ГИБРИДЫ '+HP.length+'/'+hybAll().length,()=>{ sfx('tap'); selTab=1; selPage=0; save.hybNew=0; store(); },selTab===1?'#2ab0a0':'#4a3a6a',13); buttons[buttons.length-1].label='st1';
 { if(tabA.v!==selTab){ tabA.from=tabA.v<0?selTab:tabA.v; tabA.v=selTab; tabA.t0=now; } const f=RM()?1:EASE.outQuad(Math.min(1,(now-tabA.t0)/UIA.tab)); const x0=12+tabA.from*(12+tw), x1=12+selTab*(12+tw), ux=Math.round(x0+(x1-x0)*f); ctx.fillStyle='#120818'; ctx.fillRect(ux+5,ty+th+1,tw-10,4); ctx.fillStyle='#fff'; ctx.fillRect(ux+6,ty+th+2,tw-12,2); if(!RM()&&now-tabA.t0<UIA.tab&&tabA.from!==selTab){ const g=EASE.outQuad((now-tabA.t0)/UIA.tab); ctx.save(); tabA.slid=1; ctx.translate(Math.round((selTab>tabA.from?12:-12)*(1-g)),0); ctx.globalAlpha=.4+.6*g; } }
 if(save.hybNew>0&&selTab!==1){ const bx=24+tw*2-6, by=ty-2-(!RM()&&(now%2.4)<.2?2:0); ctx.fillStyle='#120818'; ctx.fillRect(bx-9,by-1,20,14); ctx.fillStyle='#ff3a6a'; ctx.fillRect(bx-8,by,18,12); T('NEW',bx+1,by+1,9,'#fff'); }
 const g0=ty+th+8, cols=3, cw=Math.floor((W-24)/cols), chh=Math.max(54,Math.min(88,Math.floor((H-g0-tp*3-124)/4))), per=12;
 const cell=(k,x,y,sel,col)=>{ panel(x+2,y,cw-4,chh-4,sel?'#5a2a8a':col); if(sel){ ctx.fillStyle='#ffd23c'; ctx.fillRect(x+3,y+1,cw-6,2);} };
 let pages=1;
 if(selTab===0){ const R0=CHARS.map((c,i)=>({c,i})); R0.push({c:SECRET,i:-1}); pages=Math.ceil(R0.length/per); if(selPage>=pages) selPage=0;
  R0.slice(selPage*per,selPage*per+per).forEach(({c,i},k)=>{ const x=12+(k%cols)*cw, y=g0+Math.floor(k/cols)*chh; const sy=y+chh-26;
   if(i===-1){ const op=!!save.eggs.secret&&!!SPR.slugX, sel=op&&useSecret&&!fusion; cell(k,x,y,sel,op?'#3a2a12':'#1e1430'); ctx.save(); ctx.beginPath(); ctx.rect(x+3,y+1,cw-6,chh-6); ctx.clip();
    if(op){ (sel?drawSlugC:drawSlug)('slugX',sel?'fly':'idle',frameOf(sel?'fly':'idle',now),x+cw/2,sy); secretTwinkle(x+cw/2,sy,now); } else if(SPR.slugX) ctx.drawImage(silhouette('slugX'),Math.round(x+cw/2-32),Math.round(sy-40)); ctx.restore();
    if(op) T('✦ Шмякс',x+cw/2,y+chh-17,10,sel?'#ffd23c':'#ffe9a0'); else { T('секрет',x+cw/2,y+chh/2-10,10,'#ffd23c'); T('???',x+cw/2,y+chh-17,9,'#8a7aa8'); }
    buttons.push({x,y,w:cw,h:chh-4,label:'secretpick',cb:()=>{ if(!op){ lockNo(); haptic('error'); floats.push({s:'Секретный! Подсказка: потыкай в логотип',x:W/2-ox,y:y-oy+10,t:0,life:1.8,size:10,col:'#ffd23c'}); return; } selectSecret(); sfx('secret'); haptic('tick'); }}); return; }
   const sel=i===selPick&&!useSecret&&!fusion, op=unlocked(i); cell(k,x,y,sel,op?'#2b1a4a':'#1e1430'); if(sel){ ctx.fillStyle=c.col; ctx.fillRect(x+3,y+1,cw-6,2);} 
   ctx.save(); ctx.beginPath(); ctx.rect(x+3,y+1,cw-6,chh-6); ctx.clip();
   if(op) fitDraw(sel?drawSlugC:drawSlug,c.id,sel?'fly':'idle',frameOf(sel?'fly':'idle',now+i*.37),x+cw/2,sy,y+3); else ctx.drawImage(silhouette(c.id),Math.round(x+cw/2-32),Math.round(sy-40)); ctx.restore();
   if(op) T(c.name,x+cw/2,y+chh-17,10,sel?'#ffd23c':'#fff'); else { T('★ '+c.cost,x+cw/2,y+chh/2-10,11,'#ffd23c'); T('???',x+cw/2,y+chh-17,9,'#8a7aa8'); }
   buttons.push({x,y,w:cw,h:chh-4,label:'c'+i,cb:()=>{ if(!unlocked(i)){ lockNo(); haptic('error'); floats.push({s:'Нужно ★ '+c.cost,x:x+cw/2-ox,y:y-oy+10,t:0,life:1,size:10,col:'#ffd23c'}); return; } selectChar(i); sfx('candy',i%4); haptic('tick'); }}); }); }
 else { const NA=hybAll().length; const slots=Math.max(per,Math.ceil((HP.length+1)/per)*per); pages=Math.max(1,Math.ceil(slots/per)); if(selPage>=pages) selPage=0;
  for(let k=0;k<per;k++){ const idx=selPage*per+k, x=12+(k%cols)*cw, y=g0+Math.floor(k/cols)*chh;
   if(idx<HP.length){ const [a,b]=HP[idx], F=fusedChar(a,b), sel=!!fusion&&fusion.a===a&&fusion.b===b; cell(k,x,y,sel,'#1e3440'); if(sel){ ctx.fillStyle=F.col; ctx.fillRect(x+3,y+1,cw-6,2);} 
    ctx.save(); ctx.beginPath(); ctx.rect(x+3,y+1,cw-6,chh-6); ctx.clip(); if(SPR[F.id]) fitDraw(drawSlug,F.id,sel?'fly':'idle',frameOf(sel?'fly':'idle',now+k*.3),x+cw/2,y+chh-26,y+3); ctx.restore();
    T(fitTxt(F.name,10,cw-6),x+cw/2,y+chh-17,10,sel?'#ffd23c':'#7affe0');
    buttons.push({x,y,w:cw,h:chh-4,label:'h'+a+'_'+b,cb:()=>{ selectHybrid(a,b); sfx('candy',k%4); haptic('tick'); }}); }
   else { cell(k,x,y,false,'#181026'); ctx.globalAlpha=.55; if(SPR.slug01) ctx.drawImage(silhouette('slug01'),Math.round(x+cw/2-32),Math.round(y+chh-66)); ctx.globalAlpha=1; T('?',x+cw/2,y+chh/2-16,18,'#5a4a7a'); T(idx===HP.length?'слей двух!':'???',x+cw/2,y+chh-17,9,idx===HP.length?'#7affe0':'#6a5a8a');
    buttons.push({x,y,w:cw,h:chh-4,label:'hq'+k,cb:()=>{ if(totalStars()<FUSE_STARS){ lockNo(); floats.push({s:'Слияние откроется на ★'+FUSE_STARS,x:W/2-ox,y:y-oy+10,t:0,life:1.4,size:10,col:'#ffd23c'}); return; } sfx('tap'); fusePick=[]; scene='fuse'; }}); } }
  }
 const py=g0+4*chh+2; if(pages>1) pager(py,selPage,pages,v=>selPage=v,'sel');
 const c=PC(); const dy=py+(pages>1?Math.max(44,tp)+4:6); const PTL=wrapTxt(c.howto||c.perk,10,W-44-(c.tap||c.fuse?56:0)), ex=(PTL.length-1)*12; /* FB24: способности целиком, перенос строк */ panel(12,dy,W-24,48+ex,'#2b1a4a'); ctx.fillStyle=c.col; ctx.fillRect(13,dy+1,3,46+ex);
 T(c.name,22,dy+5,13,['#fff','#ffd23c'],'l'); PTL.forEach((ln,i)=>T(ln,22,dy+21+i*12,10,c.col,'l')); T(fitTxt(c.desc,10,W-44),22,dy+34+ex,10,'#e8dcff','l'); if(c.tap) T('ТАП',W-18,dy+6,9,'#4ef0ff','r'); if(c.fuse) T('ГИБРИД',W-18,c.tap?dy+20:dy+6,9,'#7affe0','r');
 btn(W/2-70,Math.min(H-tp*2-14,dy+56+ex),140,tp,'ПОГНАЛИ',()=>{sfx('tap');scene='levels';},'#4ed05a',16); if(drawSelect.extra) drawSelect.extra(Math.min(H-tp-6,dy+56+ex+tp+8),tp);
 for(const f of floats){ const k=f.t/f.life; T(f.s,f.x+ox,f.y+oy-k*14,f.size,f.col); }
}
drawSelect.extra=(y,tp)=>{ const ok=totalStars()>=FUSE_STARS; btn(W/2+4,y,130,tp,'ГАРДЕРОБ',()=>{sfx('tap');scene='wardrobe';},'#c04a9a',13); buttons[buttons.length-1].label='wardrobe'; btn(W/2-134,y,130,tp,ok?'СЛИЯНИЕ':'слияние ★'+FUSE_STARS,()=>{ if(!ok){ lockNo(); haptic('error'); return; } sfx('tap'); fusePick=[]; scene='fuse'; },ok?'#2ab0a0':'#4a3a5a',13); buttons[buttons.length-1].label='fuse'; };
// ---------- FB3/FB4: момент открытия (новый гибрид / секретный слизень) ----------
let reveal=null;
function showReveal(kind,ch){ reveal={kind,ch,t:0,from:scene}; scene='reveal'; parts=[]; for(let i=0;i<3;i++) setTimeout(()=>{ if(scene==='reveal') burst(W/2-ox+(i-1)*70,H*.36-oy,40,['#ffd23c','#ff5aa8','#7affe0','#fff','#b48cff'],200,80,1.3,260); },i*220); }
function drawReveal(){ const r=reveal; if(!r){ scene='menu'; return; } r.t+=1/60; drawBG(2,0,now); const tp=TAP(), cx=W/2, cy=Math.floor(H*.40);
 ctx.fillStyle='rgba(10,4,24,.55)'; ctx.fillRect(0,0,W,H);
 ctx.save(); ctx.translate(cx,cy-20); for(let i=0;i<12;i++){ ctx.rotate(Math.PI/6); ctx.fillStyle=i%2?'rgba(255,210,60,.10)':'rgba(122,255,224,.08)'; ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(-18,-H); ctx.lineTo(18,-H); ctx.fill(); } ctx.restore();
 const k=Math.min(1,r.t*3), bounce=1+Math.sin(Math.min(1,r.t*2.5)*Math.PI)*.25;
 const title=r.kind==='hyb'?'НОВЫЙ ГИБРИД!':'Открыт секретный слизень!'; T(title,cx,Math.floor(H*.13),r.kind==='hyb'?20:16,['#fff','#ffd23c'],'c','#2a0c22');
 const c=r.ch; T(c.name,cx,Math.floor(H*.13)+30,16,['#fff',c.col||'#7affe0']);
 ctx.save(); ctx.translate(cx,cy+30); const sc=3*k*bounce; ctx.scale(Math.max(.01,sc)/1,Math.max(.01,sc)/1); drawSlug(c.id,'idle',frameOf('idle',now),0,0); ctx.restore(); if(r.kind==='secret') secretTwinkle(cx,cy+10,now*1.3);
 const yy=cy+80; if(r.kind==='hyb'){ const [a,b]=c.fuse; T(CHARS[a].name+' + '+CHARS[b].name,cx,yy,12,'#e8dcff'); const PLs=wrapTxt(c.perk,11,W-32); PLs.forEach((ln,i)=>T(ln,cx,yy+18+i*14,11,c.col)); var rvExtra=(PLs.length-1)*14; T('открыт навсегда • гибридов: '+hybPairs().length+' из '+hybAll().length,cx,yy+36+rvExtra,10,'#7affe0'); }
 else { T(c.perk+': '+c.desc,cx,yy,11,'#ffd23c'); T('теперь живёт среди всех слизней',cx,yy+18,10,'#e8dcff'); }
 const bw=Math.min(150,(W-36)/2|0), by=Math.min(H-tp-16,yy+64+(typeof rvExtra==='number'?rvExtra:0));
 if(r.kind==='hyb'){ btn(cx-bw-6,by,bw,tp,'ИГРАТЬ',()=>{ sfx('tap'); reveal=null; scene='levels'; },'#4ed05a',15); buttons[buttons.length-1].label='rv_play'; btn(cx+6,by,bw,tp,'КОЛЛЕКЦИЯ',()=>{ sfx('tap'); reveal=null; selTab=1; selPage=0; save.hybNew=0; scene='select'; },'#2ab0a0',13); buttons[buttons.length-1].label='rv_col'; }
 else { btn(cx-bw-6,by,bw,tp,'ВЫБРАТЬ',()=>{ sfx('tap'); reveal=null; selectSecret(); selTab=0; selPage=1; scene='select'; },'#ffb03c',15); buttons[buttons.length-1].label='rv_pick'; btn(cx+6,by,bw,tp,'ПОТОМ',()=>{ sfx('tap'); reveal=null; scene='menu'; initMenuSlugs(); },'#6a4fd8',13); buttons[buttons.length-1].label='rv_later'; }
 for(const p of parts){ ctx.fillStyle=p.c; ctx.fillRect(p.x+ox|0,p.y+oy|0,p.s,p.s); } }
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
function openPause(){ if(!world||world.result||overlay) return; drag=null; overlay={k:'pause'}; overlayT=0; sfx('uiOpen'); }
/* 26.12.6 «полёт награды»: в HUD уровня счётчика 🍬 нет, поэтому минимальный вариант по ТЗ — счётчик 🍬 в углу панели победы; 3–8 конфет летят в него дугой (0,5 с, inOutQuad, разброс 40 мс), каждая +1 */
function winCandyFly(px,py,pw,ly,tc){ const o=overlay, n=Math.max(3,Math.min(8,o.cg)), per=o.cg/n, c0=o.c1-o.cg; const tx=px+pw-30, ty2=py+10; let got=0;
 for(let i=0;i<n;i++){ const t0=tc+.15+i*.04, f=(overlayT-t0)/.5; if(f>=1){ got=Math.round((i+1)*per); continue; } if(f<0||RM()) continue; const e=EASE.inOutQuad(f), sx=W/2+(i-n/2)*8, sy=ly-8; const x=Math.round(sx+(tx-sx)*e), y=Math.round(sy+(ty2-sy)*e-Math.sin(e*Math.PI)*30); ctx.fillStyle='#1a0c22'; ctx.fillRect(x-3,y-2,7,5); ctx.fillStyle='#ff8ab0'; ctx.fillRect(x-2,y-1,5,3); ctx.fillStyle='#ff4a8a'; ctx.fillRect(x-4,y,1,1); ctx.fillRect(x+4,y,1,1); }
 if(RM()||overlayT>tc+.15+n*.04+.5) got=o.cg; const v=c0+got; if(o.cv!==v){ if(o.cv!==undefined){ cuTick(v===o.c1); o.cpop=now; } o.cv=v; }
 const sz=now-(o.cpop||-9)<.2&&!RM()?13:11; T('🍬 '+v,tx+14,ty2-4,sz,'#ffd0ea','r'); }
function loseDrop(t,ph){ /* 26.12.5: панель «шмякается» сверху, 1 отскок */ if(t<.22){ const f=t/.22; return -Math.round((1-f*f)*(H/2+ph/2)); } if(t<.38) return -Math.round(Math.sin((t-.22)/.16*Math.PI)*6); return 0; }
function drawOverlay(){ const k=Math.min(1,overlayT*4); if(overlay.k!=='grafview'){ ctx.fillStyle=`rgba(12,4,24,${.6*k})`; ctx.fillRect(0,-40,W,H+80); }
 const tp=TAP(); if(overlay.k==='pause'){ drawPause(tp); return; } if(overlay.k==='grafview'){ ctx.fillStyle='rgba(12,4,24,.55)'; ctx.fillRect(0,0,W,Math.max(tp+12,oy)); T('Граффити: '+(((save.graf||{})[curLevel]||[]).length)+' шмяков',W/2,4,14,['#fff','#ffb0d8']); T('тапни, чтобы вернуться',W/2,22,10,'#e8d8ff'); buttons.push({x:0,y:0,w:W,h:H,label:'gvback',cb:()=>{overlay={k:'pause'};}}); return; }
 const win=overlay.k==='win'; const pw0=Math.min(W-20,260); const wrapL=L=>{ let z=L[2]||12; while(z>9&&textW(L[0],z)>pw0-14) z--; return textW(L[0],z)>pw0-14?wrapTxt(L[0],9,pw0-14).slice(0,2):null; }; const extra=win?(overlay.lines||[]).reduce((a,L)=>a+(wrapL(L)?16+Math.max(TMIN,9)+3:16),0):0;
 const pw=Math.min(W-20,260), ph=(win?150:120)+tp+extra, px=(W-pw)/2|0, py=Math.floor(H/2-ph/2+(win||RM()?(1-k)*40:loseDrop(overlayT,ph)));
 { const sq=!win&&!RM()&&overlayT>=.22&&overlayT<.3?2:0; panel(px-sq,py+sq,pw+sq*2,ph-sq,win?'#3a1f6a':'#4a1a3a'); } const bw=(pw-36)/2|0;
 if(win){ T('ПОБЕДА!',W/2,py+8,20,['#fff6b0','#ffd23c','#ff9a1c']); T(overlay.phrase,W/2,py+36,11,'#7affe0');
  for(let i=0;i<3;i++){ const on=i<overlay.stars&&overlayT>.4+i*UIA.star; if(on&&!pops[i]){pops[i]=1; sfx('star',i); burst(W/2-30+i*30-ox,py+64-oy,10,['#ffd23c','#fff'],80,0,.5,0); }
   const sc=on?Math.max(1,2.2-(overlayT-.4-i*UIA.star)*4):1; ctx.save(); ctx.translate(W/2-30+i*30,py+64); ctx.scale(sc>1.01?Math.round(sc*2)/2:1,sc>1.01?Math.round(sc*2)/2:1); ctx.scale(2,2); starIcon(0,0,on,2); ctx.restore(); }
  let ly=py+86; const tc=.4+Math.max(1,overlay.stars)*UIA.star; let cuEnd=tc; for(const [li,L] of (overlay.lines||[]).entries()){ let txt=L[0]; const mm=/^(.*?)(\d+)$/.exec(txt);
   if(mm&&/Очки|Эстафета|🍬/.test(txt)&&!RM()){ const N=+mm[2], d=Math.min(UIA.countMax,UIA.countPer*N), f=Math.max(0,Math.min(1,(overlayT-tc)/Math.max(.01,d))); const v=f>=1?N:Math.round(N*EASE.outQuad(f)); cuEnd=Math.max(cuEnd,tc+d); txt=mm[1]+v; const key='w'+li; if(overlay.cu===undefined) overlay.cu={}; if(overlay.cu[key]!==v){ overlay.cu[key]=v; cuTick(v===N); } }
   if(/РЕКОРД/.test(txt)){ const tw2=Math.min(pw-16,textW(txt,L[2]||12)+16), rx=Math.round(W/2-tw2/2), ry=ly-2; ctx.fillStyle='#120818'; ctx.fillRect(rx,ry,tw2,(L[2]||12)+7); ctx.fillStyle='#6a1a4a'; ctx.fillRect(rx+1,ry+1,tw2-2,(L[2]||12)+5);
    if(!RM()){ const ph2=((overlayT-tc)%1.4)/.5; if(ph2>=0&&ph2<1){ const sx=Math.round(rx+2+(tw2-8)*ph2); ctx.fillStyle='rgba(255,255,255,.5)'; ctx.fillRect(sx,ry+1,3,(L[2]||12)+5); ctx.fillRect(sx+4,ry+1,1,(L[2]||12)+5); } if(!overlay.conf&&overlayT>tc){ overlay.conf=1; const th=THEMES[themeOf(curLevel)]||{}; const pal=[...(th.pal||[]).slice(0,4),'#ffd23c','#fff','#ff5aa8']; burst(W/2-ox,ry-oy,24,pal,160,140,1.2); } } }
   let lsz=L[2]||12; while(lsz>9&&textW(txt,lsz)>pw-14) lsz--; const WL=textW(txt,lsz)>pw-14?wrapTxt(txt,9,pw-14).slice(0,2):null; if(WL){ const lh=Math.max(TMIN,9)+3; WL.forEach((t2,j)=>T(t2,W/2,ly+j*lh,9,L[1]||'#fff')); ly+=16+lh; } else { T(txt,W/2,ly,lsz,L[1]||'#fff'); ly+=16; } }
  if(overlay.cg>0) winCandyFly(px,py,pw,ly,tc);
  overlay.wave=cuEnd;
  if(overlay.nu&&overlay.nu.length){ const c=overlay.nu[0]; T('Новый слизень: '+c.name+'!',W/2,ly+2,11,'#4ef0ff'); }
  else if(curLevel===LV.length-1&&!chaosRun) T('Все уровни пройдены!',W/2,ly+2,11,'#ffd23c');
  const byy0=py+ph-tp-10; const wv=i=>{ if(RM()) return 0; const f=Math.max(0,Math.min(1,(overlayT-(overlay.wave||0)-i*.05)/.2)); return Math.round(10*(1-EASE.outBack(f,1.6))); }; let byy=byy0+wv(0);
  if(chaosRun){ btn(px+12,byy,pw-24,tp,'ДАЛЬШЕ',()=>{sfx('tap');chaosNext();},'#4ed05a',15); return; }
  btn(px+12,byy,bw,tp,'ЕЩЁ',()=>{sfx('tap');startLevel(curLevel);},'#6a4fd8',15); byy=byy0+wv(1);
  if(curLevel<LV.length-1) btn(px+pw-12-bw,byy,bw,tp,'ДАЛЬШЕ',()=>{sfx('tap');startLevel(curLevel+1);},'#4ed05a',15); else btn(px+pw-12-bw,byy,bw,tp,'МЕНЮ',()=>{sfx('tap');scene='menu';tgBack(false);},'#4ed05a',15);
 } else { T(overlay.phrase,W/2,py+12,16,['#fff','#ff8fc8']); drawSlug(PC().id,'splat',5,W/2,py+62); T(overlay.sub||'Броски кончились. Ещё разок?',W/2,py+84,11,'#e8d8ff');
  const byy=py+ph-tp-10;
  if(chaosRun){ btn(px+12,byy,pw-24,tp,overlay.over?'ИТОГИ':'ДАЛЬШЕ',()=>{sfx('tap');chaosAfterFail();},'#4ed05a',15); return; }
  btn(px+12,byy,bw,tp,'ЗАНОВО',()=>{sfx('tap');startLevel(curLevel);},'#4ed05a',15); btn(px+pw-12-bw,byy,bw,tp,'УРОВНИ',()=>{sfx('tap');scene='levels';},'#6a4fd8',15); }
}
let lastScene='menu'; const hudShots={w:null,n:0,t:-9,i:-1}; let toastQ=[];
/* 26.12.5: в одной зоне одновременно ≤ 1 тост, следующий ждёт */
function toastQueue(){ if(scene==='play'){ if(toastQ.length){ floats.push(...toastQ); toastQ=[]; } return; } const zone=(a,b)=>Math.abs((a.y|0)-(b.y|0))<26&&Math.abs((a.x|0)-(b.x|0))<160;
 for(let i=floats.length-1;i>0;i--){ const f=floats[i]; if(f.t>.05||f.combo) continue; if(floats.slice(0,i).some(g=>zone(g,f))){ floats.splice(i,1); f.t=0; toastQ.push(f); } }
 for(let i=0;i<toastQ.length;i++){ const f=toastQ[i]; if(!floats.some(g=>zone(g,f))){ toastQ.splice(i,1); f.t=0; floats.push(f); break; } } }
function render(){ if(scene!==lastScene) uiSnapTake(); buttons=[]; ctx.setTransform(1,0,0,1,0,0); ctx.globalAlpha=1; ctx.globalCompositeOperation='source-over'; ctx.fillStyle='#1a1030'; ctx.fillRect(0,0,cv.width,cv.height); ctx.imageSmoothingEnabled=false; textClear(); if(scene!==lastScene){ uiSceneChange(lastScene,scene); lastScene=scene; floats=floats.filter(f=>f.t<.05); } const trO=uiTrOff(); if(trO) ctx.translate(trO,0);
 if(scene==='menu') drawMenuV4(); else if(scene==='select'){ tabA.slid=0; drawSelect(); if(tabA.slid){ ctx.restore(); tabA.slid=0; } } else if(scene==='reveal') drawReveal(); else if(scene==='levels') drawLevels(); else if(scene==='fuse') drawFuse(); else if(scene==='wardrobe') drawWardrobe(); else if(scene==='house') drawHouse(); else if(scene==='bestiary') drawBestiary(); else if(scene==='quests') drawQuests(); else if(scene==='settings') drawSettings(); else if(scene==='relay') drawRelayPick(); else if(scene==='play'){ const b0=buttons.length; drawPlay(); if(overlay){ buttons.splice(b0); textClear(); const po=uiPopOff(); if(po) ctx.translate(0,po); drawOverlay(); if(po) ctx.translate(0,-po); } }
 if(scene!=='play'||!overlay) pops=[];
 // частицы меню поверх
 if(scene!=='play') for(const p of parts){ ctx.fillStyle=p.c; ctx.fillRect(p.x+ox|0,p.y+oy|0,p.s,p.s); }
 if(trO) ctx.translate(-trO,0); uiSnapDraw(); uiTrDraw();
}

let chaosRun=null; let chaosNext=function(){}, chaosAfterFail=function(){}, chaosWin=function(){};
// ---------- B10: ХАОС-РЕЖИМ ----------
const CHAOS_STARS=15, CHAOS_T=10, CHAOS_WARN=3, CHAOS_HB=46;
/* Ф0х: пиксельные иконки 8×8 (рисуются ×2 = 16×16), 1 — цвет эффекта, 2 — белый */
const CHAOS_ICO={moon:['..111...','.11.....','11......','11......','11......','.11...2.','..111...','........'],
 heavy:['...11...','..1..1..','.111111.','11111111','11122111','11111111','.111111.','........'],
 windl:['........','..1.....','.1......','11111111','.1......','..1.222.','........','..2222..'],
 windr:['........','.....1..','......1.','11111111','......1.','.222.1..','........','..2222..'],
 mega:['...22...','..2..2..','........','.111111.','11111111','.1....1.','.1....1.','........'],
 sticky:['.111111.','11111111','11211211','.1.11.1.','.1..1.1.','.1....1.','......1.','........'],
 slow:['.111111.','.1....1.','..1221..','...11...','...11...','..1..1..','.122221.','.111111.'],
 turbo:['....11..','...11...','..11....','.111111.','....11..','...11...','..11....','.11.....'],
 mirror:['...22...','.1.22.1.','11.22.11','11122111','11.22.11','.1.22.1.','...22...','........'],
 giant:['.11..11.','1......1','1......1','...22...','...22...','1......1','1......1','.11..11.'],
 tiny:['........','.1....1.','..1..1..','...22...','...22...','..1..1..','.1....1.','........']};
function chaosIcon(id,x,y,col){ const P=CHAOS_ICO[id]; if(!P) return; x=Math.round(x); y=Math.round(y); ctx.fillStyle='#1a0c22'; for(let j=0;j<8;j++) for(let i=0;i<8;i++) if(P[j][i]!=='.') ctx.fillRect(x+i*2-1,y+j*2-1,4,4);
 for(let j=0;j<8;j++) for(let i=0;i<8;i++){ const c=P[j][i]; if(c==='.') continue; ctx.fillStyle=c==='2'?'#fff':col; ctx.fillRect(x+i*2,y+j*2,2,2); } }
const MODS=[
 {id:'moon',name:'ЛУНА',sub:'гравитация ×0.45',col:'#e8f0ff',g:.45,vcap:.7},
 {id:'heavy',name:'ТЯЖЕСТЬ',sub:'гравитация ×1.6',col:'#ff9a5c',g:1.6,pw:1.1},
 {id:'windl',name:'ВЕТЕР ←',sub:'сдувает влево',col:'#8ad8ff',wind:-220},
 {id:'windr',name:'ВЕТЕР →',sub:'сдувает вправо',col:'#8ad8ff',wind:220},
 {id:'mega',name:'МЕГА-БАТУТ',sub:'батуты ×1.5',col:'#ff5aa8',pad:1.5},
 {id:'sticky',name:'ЛИПУЧКА',sub:'никаких отскоков',col:'#c8e040',sticky:1},
 {id:'slow',name:'СЛОУ-МО',sub:'время ×0.55',col:'#62acff',ts:.55},
 {id:'turbo',name:'ТУРБО',sub:'время ×1.5',col:'#ff3a3a',ts:1.5},
 {id:'mirror',name:'ЗЕРКАЛО',sub:'рогатка наоборот',col:'#d0b0ff',inv:1},
 {id:'giant',name:'ВЕЛИКАН',sub:'слизень ×1.35',col:'#ffd23c',size:1.35,hit:1.35},
 {id:'tiny',name:'КРОШКА',sub:'пролезет в щель',col:'#7affe0',size:.7,hit:.7}];
/* Ф0х Х-3: эффект не выпадает, если на уровне он бессмыслен (26.11.7 п.1) */
const chaosNarrowC={};
function chaosNarrow(L){ const k=L.name+'|'+(L.p||[]).length; if(k in chaosNarrowC) return chaosNarrowC[k]; const P=(L.p||[]).filter(o=>o[4]!=='s'&&o[4]!=='o'); let nar=false;
 for(let i=0;i<P.length&&!nar;i++) for(let j=0;j<P.length;j++){ if(i===j) continue; const a=P[i],b=P[j];
  const gx=b[0]-(a[0]+a[2]), oy=Math.min(a[1]+a[3],b[1]+b[3])-Math.max(a[1],b[1]); if(gx>=2*RB&&gx<40&&oy>8){ nar=true; break; }
  const gy=b[1]-(a[1]+a[3]), ox=Math.min(a[0]+a[2],b[0]+b[2])-Math.max(a[0],b[0]); if(gy>=2*RB&&gy<40&&ox>8){ nar=true; break; } }
 return chaosNarrowC[k]=nar; }
function chaosModOK(m,L){ if(!m||!L) return true; if(m.pad&&!(L.p||[]).some(o=>o[4]==='b')) return false; if(m.wind&&L.boss&&L.boss.k===8) return false; if(m.hit>1&&chaosNarrow(L)) return false; return true; }
function chaosPick(not,L){ let pool=MODS.filter(m=>(!not||m.id!==not.id&&!(m.size&&not.size))&&chaosModOK(m,L)); if(!pool.length) pool=MODS.filter(m=>!not||m.id!==not.id); return pool[Math.random()*pool.length|0]; }
function chaosStart(){ chaosRun={lives:3,score:0,n:0,t:0,nextAt:CHAOS_T,mod:null,next:null,last:-1,best:0,fx:0,dly:0}; chaosRun.fus=fusion; fusion=null; chaosNext(); }
function chaosLevel(){ const pool=[]; for(let i=0;i<LV.length;i++) if((save.stars[i]||0)>0) pool.push(i); const P=pool.length>=5?pool:Array.from({length:30},(_,i)=>i); let li; do{ li=P[Math.random()*P.length|0]; }while(P.length>1&&li===chaosRun.last); return li; }
chaosNext=function(){ if(!chaosRun) return; const li=chaosLevel(); chaosRun.last=li; startLevel(li); };
chaosWin=function(sc,lines){ const add=Math.round(sc*1.5); chaosRun.score+=add; chaosRun.n++; lines.push(['+'+add+' (×1.5)','#fff6b0',14]); lines.push(['Забег: '+chaosRun.score+' • уровней '+chaosRun.n,'#ffb0ff',11]); };
chaosAfterFail=function(){ if(!chaosRun) return; if(overlay&&overlay.over){ chaosEnd(); return; } chaosNext(); };
function chaosEnd(){ const r=chaosRun; chaosRun=null; if(r&&r.fus) fusion=r.fus; if(!save.chaos||typeof save.chaos!=='object') save.chaos={best:0,runs:0,lvls:0}; save.chaos.runs++; const rec=r.score>save.chaos.best; if(rec) save.chaos.best=r.score; save.chaos.lvls=Math.max(save.chaos.lvls||0,r.n); store();
 overlay=null; scene='menu'; tgBack(false); floats.push({s:(rec?'РЕКОРД ХАОСА! ':'Хаос: ')+r.score,x:W/2-ox,y:H*.33-oy,t:0,life:3,size:16,col:['#fff','#ff5aff'],pop:1}); }
let chaosStat={hud:'',fx:'',n:0}, chaosP=[], chaosLastT=0;
function chaosFXDraw(){ chaosStat.fx=''; chaosStat.n=0; if(!chaosRun||!world||!world.mod) return; const m=world.mod, s=world.s, c=chaosRun; const dt=Math.min(.05,Math.max(0,now-(chaosLastT||now))); chaosLastT=now; const id=m.id; chaosStat.fx=id; const px=(x,y,w,h,col)=>{ ctx.fillStyle=col; ctx.fillRect(Math.round(x),Math.round(y),w,h); };
 if(id==='moon'){ while(chaosP.length<28) chaosP.push({x:Math.random()*LW,y:Math.random()*LH,v:8+Math.random()*14,p:Math.random()*6}); for(const p of chaosP){ p.y+=p.v*dt; if(p.y>LH){ p.y=-4; p.x=Math.random()*LW; } const tw=(Math.sin(now*3+p.p)>0), x0=Math.round(p.x), y0=Math.round(p.y); px(x0-3,y0-1,7,3,'#1a0c22'); px(x0-1,y0-3,3,7,'#1a0c22'); px(x0-2,y0,5,1,'#e8f0ff'); px(x0,y0-2,1,5,'#e8f0ff'); px(x0,y0,1,1,tw?'#fff':'#ffe066'); } chaosStat.n=chaosP.length; }
 else chaosP.length=0;
 if(id==='heavy'&&s.st==='fly'&&s.vy>120*K){ if(Math.random()<.6) parts.push({x:s.x+(Math.random()*16-8),y:s.y-R,vx:0,vy:-30,life:.35,t:0,c:Math.random()<.5?'#c8b8a8':'#8a7a6a',g:0,s:2}); chaosStat.n=1;  chaosStat.dust=(chaosStat.dust|0)+1; } if(id==='heavy'&&chaosStat.dust) chaosStat.n=Math.max(chaosStat.n,1);
 if(id==='mega'){ const a=.6+.35*Math.sin(now*6), e=2+Math.round(1+Math.sin(now*6)); for(const o of world.solids) if(o.alive&&o.type==='b'){ ctx.globalAlpha=1; px(o.x-e-1,o.y-e-1,o.w+2*e+2,1,'#1a0c22'); ctx.globalAlpha=a; px(o.x-e,o.y-e,o.w+2*e,2,'#ff5aa8'); px(o.x-e,o.y-e,2,o.h+2*e,'#ff5aa8'); px(o.x+o.w+e-2,o.y-e,2,o.h+2*e,'#ff5aa8'); ctx.globalAlpha=a*.5; px(o.x,o.y-e-6,o.w,4,'#ffb0d8'); chaosStat.n++; } ctx.globalAlpha=1; }
 if(id==='slow'){ ctx.globalAlpha=.12; for(let i=0;i<4;i++){ const b=6+i*6; px(0,0,LW,b,'#62acff'); px(0,LH-b,LW,b,'#62acff'); px(0,b,b,LH-2*b,'#62acff'); px(LW-b,b,b,LH-2*b,'#62acff'); } ctx.globalAlpha=1; chaosStat.n=1; }
 if(id==='turbo'&&s.st==='fly'){ const v=Math.hypot(s.vx,s.vy); if(v>60){ const ux=s.vx/v, uy=s.vy/v; for(let i=-1;i<=1;i++){ const ox2=-uy*i*7, oy2=ux*i*7; for(let k=0;k<5;k++){ const d=R+6+k*5+(i===0?4:0); ctx.globalAlpha=.75-k*.13; px(s.x-ux*d+ox2-1,s.y-6-uy*d+oy2-1,3,3,k%2?'#ff3a3a':'#ffd23c'); } } ctx.globalAlpha=1; chaosStat.n=3; } }
 if(id==='mirror'&&s.st==='idle'){ const yy=s.y-R-34, xx=s.x; px(xx-8,yy-1,17,4,'#1a0c22'); px(xx-7,yy,15,2,'#d0b0ff'); px(xx-9,yy-3,4,8,'#1a0c22'); px(xx+6,yy-3,4,8,'#1a0c22'); px(xx-8,yy-2,2,6,'#d0b0ff'); px(xx+7,yy-2,2,6,'#d0b0ff'); chaosStat.n=1; }
 if((id==='giant'||id==='tiny')&&c.fx<.5&&s.st!=='poof'){ const r=R*m.hit; ctx.globalAlpha=1-c.fx*1.6; for(let a=0;a<64;a++){ const t=a/64*Math.PI*2; px(s.x+Math.cos(t)*r-1,s.y+Math.sin(t)*r-1,2,2,a%4<2?m.col:'#1a0c22'); } ctx.globalAlpha=1; chaosStat.n=1; }
 if(id==='sticky'&&s.st!=='poof'){ const ph=(now/.3|0); const z=m.size||1; for(let i=0;i<3;i++){ const a=((ph*7+i*5)%11)/11*Math.PI*1.1+Math.PI*1.05; px(s.x+Math.cos(a)*R*.7-1,s.y-4+Math.sin(a)*R*.6,i?1:2,1,i===1?'#c8e040':'#fff'); } chaosStat.n=1; }
 if(c.blink>0){ c.blink-=dt; } }
function chaosTick(dt){ const c=chaosRun; c.fx=(c.fx||0)+dt; c.t+=dt*(c.mod&&c.mod.ts||1); /* Х-5: таймер в игровом времени */ if(c.t>=c.nextAt&&drag&&(c.dly||0)<2){ c.dly=(c.dly||0)+dt; return; } /* Х-5: не меняем под пальцем, максимум 2 с */ if(c.t>=c.nextAt){ const was=c.mod; c.dly=0; c.mod=c.next&&chaosModOK(c.next,world&&world.L)?c.next:chaosPick(c.mod,world&&world.L); c.next=chaosPick(c.mod,world&&world.L); c.nextAt=c.t+CHAOS_T; c.fx=0; c.prev=was; c.blink=drag?.5:0; if(world){ world.mod=c.mod; } if(c.mod&&c.mod.wind) noise(.6,.05,2400); sfx('combo',4); haptic('medium'); shake=Math.max(shake,3); flash=.08; floats.push({s:c.mod.name+'!',x:LW/2,y:220,t:0,life:1.3,size:20,col:['#fff',c.mod.col],pop:1}); }
 else if(c.nextAt-c.t<=CHAOS_WARN){ const k=Math.ceil(c.nextAt-c.t); if(k!==c.lastTick){ c.lastTick=k; sfx('tick'); } } }
drawPlay.hud=(hy,tp)=>{ if(!chaosRun) return; const c=chaosRun; const y=oy+LH+4>H-30?oy+4:oy+LH+6; const inField=y===oy+4;
 if(inField) { ctx.fillStyle='rgba(12,4,24,.6)'; ctx.fillRect(ox,y-2,LW,CHAOS_HB); }
 T('ХАОС',ox+6,y,12,['#fff','#ff5aff'],'l'); T('♥'.repeat(c.lives)+'♡'.repeat(Math.max(0,3-c.lives)),ox+Math.max(52,6+textW('ХАОС',12)+8),y,12,'#ff4a6a','l'); T(String(c.score),ox+LW-6,y,12,'#fff6b0','r');
 const left=c.nextAt-c.t, frac=Math.max(0,Math.min(1,left/CHAOS_T)); ctx.fillStyle='#1a0c22'; ctx.fillRect(ox+4,y+17,LW-8,6); ctx.fillStyle=left<=CHAOS_WARN?((now*8|0)%2?'#ff3a3a':'#ffd23c'):(c.mod?c.mod.col:'#7a5aff'); ctx.fillRect(ox+5,y+18,Math.round((LW-10)*frac),4);
 if(c.mod){ let txt=c.mod.name+' — '+c.mod.sub, sz=12; if(textW(txt,sz)+22>LW-8) txt=c.mod.name; const tw=textW(txt,sz); const ix=ox+LW/2-tw/2-11; chaosIcon(c.mod.id,ix,y+25,c.mod.col); T(txt,ix+20,y+27,12,c.mod.col,'l'); chaosStat.hud=c.mod.id; }
 if(left<=CHAOS_WARN&&!overlay){ const k=Math.ceil(left); const p=1+(1-(left%1))*.3; T('через '+k+'… '+c.next.name,ox+LW/2,oy+120,Math.round(15*p),['#fff',c.next.col]); } };
drawMenu.extra=(my,tp)=>{ const ok=totalStars()>=CHAOS_STARS; btn(W/2-75,my,150,tp,ok?'ХАОС':'ХАОС ★'+CHAOS_STARS,()=>{ if(!ok){ lockNo(); haptic('error'); floats.push({s:'Хаос откроется на ★'+CHAOS_STARS,x:W/2-ox,y:my-oy-8,t:0,life:1.4,size:11,col:'#ffd23c'}); return; } sfx('win'); chaosStart(); },ok?'#c03ad0':'#4a3a5a',16); buttons[buttons.length-1].label='chaos';
 if(save.chaos&&save.chaos.best) T('рекорд хаоса: '+save.chaos.best,W/2,my+tp+4,10,'#ffb0ff'); return my+tp+(save.chaos&&save.chaos.best?26:12); };

function drawPause(tp){ const pw=Math.min(W-20,Math.max(260,Math.ceil(260*TMIN/11))), ph=tp*3+90+(drawPause.h?drawPause.h(tp):0), px=(W-pw)/2|0, py=Math.floor(H/2-ph/2); panel(px,py,pw,ph,'#2b1a4a'); T('ПАУЗА',W/2,py+10,20,['#fff','#ffd23c']);
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
 {id:'pet',t:'Погладь слизней 10 раз',n:10,rw:10},{id:'mfl5',t:'Запусти слизня в меню 5 раз',n:5,rw:10,needMfl:1},{id:'wxwin',t:'Пройди уровень в непогоду',n:1,rw:20,needWx:1},{id:'win3star',t:'Пройди уровень на 3★',n:1,rw:15},
 {id:'hybwin',t:'Пройди уровень гибридом',n:1,rw:25,needFuse:1},{id:'chaoswin',t:'Пройди 2 уровня в хаосе',n:2,rw:25,needChaos:1},{id:'ghostpass',t:'Призраком пролети сквозь блок',n:1,rw:20,need:'ghost'},
 {id:'djump',t:'Рюкзачком сделай 5 доп. прыжков',n:5,rw:15,need:'djump'},{id:'splat',t:'Шмякнись 5 раз',n:5,rw:10},{id:'boing',t:'Отскочи от батута 8 раз',n:8,rw:10}];
function questAvail(q){ if(q.needMfl&&!(save.set&&save.set.mfl!==false)) return false; if(q.need){ const i=CHARS.findIndex(c=>c.ab===q.need); if(i<0||!unlocked(i)) return false; } if(q.needBoss&&!isOpen(9)) return false; if(q.needWx&&!isOpen(2)) return false;
 if(q.needFuse&&totalStars()<FUSE_STARS) return false; if(q.needChaos&&totalStars()<CHAOS_STARS) return false; return true; }
function questsToday(){ const k=dayKey(today()); let Q=save.quests; if(!Q||Q.day!==k){ let sd=k%2147483647||1; const r=()=>(sd=(sd*16807)%2147483647)/2147483647; const pool=QUESTS.filter(questAvail); const ids=[];
  while(ids.length<3&&ids.length<pool.length){ const q=pool[r()*pool.length|0]; if(!ids.includes(q.id)) ids.push(q.id); } Q=save.quests={day:k,ids,prog:ids.map(()=>0),got:ids.map(()=>false)}; store(); } return Q; }
function qEv(id,n=1){ if(id!=='feed'&&id!=='pet'&&id!=='mfl5'&&!world) return; const Q=questsToday(); const i=Q.ids.indexOf(id); if(i<0||Q.got[i]) return; const q=QUESTS.find(x=>x.id===id); const was=Q.prog[i]; Q.prog[i]=Math.min(q.n,Q.prog[i]+n); if(Q.prog[i]!==was) store();
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
function buildSecretSprite(){ const im=SPR.slug01; if(!im||SPR.slugX) return; const [c,x]=mk(1024,320); x.drawImage(im,0,0); const D=x.getImageData(0,0,1024,320), p=D.data;
 // FB4: Шмякс — золотой король-слизень: золото с фиолетовым отливом, корона с рубином, звёздные искры
 const GOLD=[[196,104,28],[236,152,34],[255,198,52],[255,226,110],[255,248,200]];
 for(let i=0;i<p.length;i+=4){ if(p[i+3]<10) continue; const L=lum(p[i],p[i+1],p[i+2]), sat=Math.max(p[i],p[i+1],p[i+2])-Math.min(p[i],p[i+1],p[i+2]); if(sat<24&&L>200) continue; if(L<34){ p[i]=70;p[i+1]=20;p[i+2]=60; continue; }
  const k=Math.min(4,Math.floor(L/52)); const q=GOLD[k]; p[i]=q[0];p[i+1]=q[1];p[i+2]=q[2]; }
 // искры на теле (детерминированные, у края блика)
 let sd=99; const r=()=>(sd=(sd*16807)%2147483647)/2147483647;
 for(let i=0;i<p.length;i+=4){ if(p[i]===255&&p[i+1]===198&&r()<.03){ p[i]=255;p[i+1]=255;p[i+2]=255; } }
 x.putImageData(D,0,0);
 const A=anchors('slug01'); const CR=['y...y...y','yY.yYy.Yy','yYyYrYyYy','yyyyyyyyy','oyoyoyoyo','.ooooooo.'], CC={y:'#ffd23c',Y:'#fff8c8',r:'#ff2a6a',o:'#c06a10'}; const src=im; const [tc,tx]=mk(1024,320); tx.drawImage(src,0,0); const SD=tx.getImageData(0,0,1024,320).data; const op=(X,Y)=>SD[(Y*1024+X)*4+3]>128;
 if(A) for(const k in ANIM){ const An=ANIM[k]; A[k].forEach((a,f)=>{ if(!a||a.top==null) return; const cx0=f*An.w+(a.mx??a.hx); let ty=-1; for(let yy=0;yy<64&&ty<0;yy++) if(op(cx0,An.row*64+yy)&&op(cx0-1,An.row*64+yy)&&op(cx0+1,An.row*64+yy)) ty=yy; if(ty<0) ty=a.hy; const bx=cx0-4, by=An.row*64+Math.max(0,ty-5);
  x.fillStyle='#30101e'; for(let j=0;j<CR.length;j++)for(let q=0;q<9;q++) if(CR[j][q]!=='.'){ x.fillRect(bx+q-1,by+j,1,1); x.fillRect(bx+q+1,by+j,1,1); x.fillRect(bx+q,by+j-1,1,1); }
  for(let j=0;j<CR.length;j++)for(let q=0;q<9;q++){ const ch=CR[j][q]; if(ch==='.') continue; x.fillStyle=CC[ch]; x.fillRect(bx+q,by+j,1,1); } }); }
 delete ancCache.slugX; SPR.slugX=c; }
function secretTwinkle(x,y,t){ for(let i=0;i<3;i++){ const a=t*1.6+i*2.1, rr=20+Math.sin(t*2+i)*3; const px=Math.round(x+Math.cos(a)*rr), py=Math.round(y-14+Math.sin(a)*rr*.6); const on=(Math.sin(t*5+i*1.7)+1)/2; ctx.globalAlpha=.4+.6*on; ctx.fillStyle=i===1?'#b48cff':'#fff3a0'; ctx.fillRect(px,py-1,1,3); ctx.fillRect(px-1,py,3,1); } ctx.globalAlpha=1; }
let logoTaps=[];
function logoTap(){ logoTaps=logoTaps.filter(t=>now-t<3); logoTaps.push(now); sfx('candy',logoTaps.length%4); haptic('tick'); burst(W/2-ox,Math.floor(H*.2)+10-oy,6,['#ffd23c','#fff'],80,30,.5);
 if(logoTaps.length>=7){ logoTaps=[]; const was=!!save.eggs.secret; save.eggs.secret=true; store(); sfx('secret'); haptic('success'); flash=.15; burst(W/2-ox,H*.25-oy,60,['#ffd23c','#b48cff','#4ef0ff','#fff'],220,60,1.2,0);
  if(was) floats.push({s:'Шмякс уже с тобой ✦',x:W/2-ox,y:H*.33-oy,t:0,life:3,size:15,col:['#fff','#ffd23c'],pop:1}); else { initMenuSlugs(); showReveal('secret',SECRET); } } }
// ---------- 17: аксессуары-пасхалки ----------
const EGG_ITEMS={
 santa:{id:'santa',pal:{a:'#e02a3a',b:'#ff6a6a',r:'#a01a2a',w:'#ffffff',g:'#c8d0e0',o:'#1a0c22'},p:['.....ooo...','....owwgo..','...oboggo..','...obaro...','..obaaro...','.obaaaarro.','owwwwwwwggo','owwgwwgwggo','.ooooooooo.']},
 pumpkin:{id:'pumpkin',pal:{a:'#ff8a1c',b:'#ffb85a',s:'#c85a10',y:'#ffe066',d:'#4a1008',t:'#6a4a1a',l:'#7fd64a',o:'#1a0c22'},p:['....otll...','..oootooo..','.obasaasao.','obaddsddaso','obaayayaaso','obasasasaso','obdadddadso','.oadyyydso.','..ooooooo..']}};
for(const k in EGG_ITEMS){ const it=EGG_ITEMS[k]; const w=Math.max(...it.p.map(r=>r.length)); it.p=it.p.map(r=>r.padEnd(w,'.')); }
function drawAcc(id,anim,f,x,y,flip,it,kind,sx=1,sy=1){ const A=anchors(id); if(!A) return; const a=A[anim]&&A[anim][f]; if(!a) return; const c=pixItem(it); const px=anim==='pull'?96:32, py=40;
 ctx.save(); ctx.translate(Math.round(x),Math.round(y)); if(flip) ctx.scale(-1,1); if(sx!==1||sy!==1){ ctx.translate(0,16); ctx.scale(sx,sy); ctx.translate(0,-16); }
 if(kind==='face'){ drawFace(a,it,px,py); }
 else ctx.drawImage(c,Math.round(a.hx-px-c.width/2),Math.round(a.hy-py-c.height+2)); ctx.restore(); }
const TIMID=new Set(['slug45','slug46','slug49']); /* характер «Трусишка» (11.1): Парашютист, Медок, Баночник */
function squint(id,anim,f,x,y,flip){ const A=anchors(id); const a=A&&A[anim]&&A[anim][f]; if(!a||!a.el||!a.er) return; const col=(CHARS.find(c=>c.id===id)||{}).col||'#fff'; ctx.save(); ctx.translate(x,y); if(flip) ctx.scale(-1,1);
 const wp=eyeWhite(id,anim,f); ctx.fillStyle=col; for(const [px,py] of wp) ctx.fillRect(px-32,py-40,1,1);
 for(const e of [a.el,a.er]){ const ex=Math.round(e[0]-32), ey=Math.round(e[1]-40); ctx.fillStyle='#1a0c22'; ctx.fillRect(ex-3,ey-1,2,1); ctx.fillRect(ex-1,ey,3,1); ctx.fillRect(ex+2,ey-1,2,1); } ctx.restore(); }
const ewCache={}; function eyeWhite(id,anim,f){ const k=id+anim+f; if(ewCache[k]) return ewCache[k]; const im=SPR[id], A=ANIM[anim]; const out=[]; if(!im||!A) return out; const [c,x]=mk(A.w,64); x.drawImage(im,f*A.w,A.row*64,A.w,64,0,0,A.w,64); const d=x.getImageData(0,0,A.w,64).data; let y0=64,y1=0; for(let y=0;y<64;y++)for(let i=0;i<A.w;i++) if(d[(y*A.w+i)*4+3]>128){ y0=Math.min(y0,y); y1=Math.max(y1,y); }
 const yl=y0+(y1-y0)*.6; for(let y=y0;y<=yl;y++)for(let i=0;i<A.w;i++){ const j=(y*A.w+i)*4; if(d[j+3]>200&&d[j]>215&&d[j+1]>215&&d[j+2]>215) out.push([i,y]); } for(let y=y0;y<=yl;y++)for(let i=0;i<A.w;i++){ const j=(y*A.w+i)*4; if(d[j+3]>200&&d[j]<60&&d[j+1]<60&&d[j+2]<60&&out.some(([a2,b2])=>Math.abs(a2-i)<=1&&Math.abs(b2-y)<=1)) out.push([i,y]); } return ewCache[k]=out; }
/* лицо «ой» (26.13.5): глаза-«><», рот-«О», без новых спрайтов-файлов — по якорям лица */
function ojFace(id,anim,f,x,y,flip){ const A=anchors(id); const a=A&&A[anim]&&A[anim][f]; if(!a||!a.el||!a.er) return; const col=(CHARS.find(c=>c.id===id)||SECRET).col||'#fff'; ctx.save(); ctx.translate(x,y); if(flip) ctx.scale(-1,1);
 const wp=eyeWhite(id,anim,f); ctx.fillStyle=col; for(const [px,py] of wp) ctx.fillRect(px-32,py-40,1,1); ctx.fillStyle='#1a0c22';
 const L=[Math.round(a.el[0]-32),Math.round(a.el[1]-40)], R=[Math.round(a.er[0]-32),Math.round(a.er[1]-40)]; const lft=L[0]<=R[0]?L:R, rgt=L[0]<=R[0]?R:L;
 ctx.fillRect(lft[0]-2,lft[1]-2,1,1); ctx.fillRect(lft[0]-1,lft[1]-1,1,1); ctx.fillRect(lft[0],lft[1],1,1); ctx.fillRect(lft[0]-1,lft[1]+1,1,1); ctx.fillRect(lft[0]-2,lft[1]+2,1,1);
 ctx.fillRect(rgt[0]+2,rgt[1]-2,1,1); ctx.fillRect(rgt[0]+1,rgt[1]-1,1,1); ctx.fillRect(rgt[0],rgt[1],1,1); ctx.fillRect(rgt[0]+1,rgt[1]+1,1,1); ctx.fillRect(rgt[0]+2,rgt[1]+2,1,1);
 const mx=Math.round((a.mox!==undefined?a.mox:a.mx)-32), my=Math.round((a.moy!==undefined?a.moy:a.ey+8)-40); ctx.fillRect(mx-1,my-2,3,1); ctx.fillRect(mx-2,my-1,1,3); ctx.fillRect(mx+2,my-1,1,3); ctx.fillRect(mx-1,my+2,3,1); ctx.fillStyle='#ff6a8a'; ctx.fillRect(mx-1,my-1,3,3); ctx.restore(); }
function drawSlugM(id,anim,f,x,y,flip,sx,sy){ drawSlug(id,anim,f,x,y,flip,sx,sy); if(isApril1()) drawAcc(id,anim,f,x,y,flip,COSI.face[0],'face',sx,sy); if(isNewYear()) drawAcc(id,anim,f,x,y,flip,EGG_ITEMS.santa,'head',sx,sy); else if(isHalloween()) drawAcc(id,anim,f,x,y,flip,EGG_ITEMS.pumpkin,'head',sx,sy); }
// ---------- 8: погода — визуал ----------
const WXN={'wind+':['ВЕТЕР →','#8ad8ff'],'wind-':['← ВЕТЕР','#8ad8ff'],rain:['ДОЖДЬ · скользко','#62acff'],ice:['ГОЛОЛЁД','#c8ecff'],clear:['ЯСНО','#ffe066']};
let wxP=[], wxFade=0, wxPrev='';
/* Ф0х Х-2: ветер Хаоса рисуется той же погодой (листья и штрихи) */
function wxKind(){ const cw=world.mod&&world.mod.wind; if(!world.wx) return cw?(cw>0?'wind+':'wind-'):''; const w=world.wxNow; if(cw&&(w==='clear'||w==='wind+'||w==='wind-')) return world.windSum()>=0?'wind+':'wind-'; return w; }
function wxFX(dt){ const w=wxKind(); if(!w){ wxP=[]; return; } if(w!==wxPrev){ wxPrev=w; wxFade=0; } wxFade=Math.min(1,wxFade+dt*1.5);
 const want=w==='rain'?90:w==='ice'?50:(w==='wind+'||w==='wind-')?(world.wx&&world.mod&&world.mod.wind?48:34):0; let n=wxP.filter(p=>!p.dead).length; const dir=world.windSum()/170;
 while(n<want){ n++; const t=w; wxP.push({k:t==='rain'?'r':t==='ice'?'s':(Math.random()<.25?'l':'w'),x:Math.random()*(LW+80)-40,y:Math.random()*LH*(wxP.length<want?1:0)-10,v:.6+Math.random()*.6,ph:Math.random()*6,c:['#7fd64a','#ffb03c','#e85a3a'][Math.random()*3|0]}); }
 for(const p of wxP){ if(p.k==='r'){ p.y+=520*p.v*dt; p.x+=(dir*120-30)*dt; if(p.y>LH){ if(Math.random()<.4) parts.push({x:p.x,y:LH-2,vx:(Math.random()-.5)*40,vy:-50,life:.25,t:0,c:'#a8d8ff',g:300,s:1}); p.dead=w!=='rain'; p.y=-10; p.x=Math.random()*(LW+80)-40; } }
  else if(p.k==='s'){ p.y+=40*p.v*dt; p.x+=(Math.sin(now*1.5+p.ph)*14+dir*80)*dt; if(p.y>LH){ p.dead=w!=='ice'; p.y=-6; p.x=Math.random()*LW; } }
  else { const sp=(p.k==='l'?160:300)*p.v*Math.sign(dir||1); p.x+=sp*dt; p.y+=(p.k==='l'?Math.sin(now*4+p.ph)*40:0)*dt; if(p.x>LW+40||p.x<-40){ p.dead=!(w==='wind+'||w==='wind-'); p.x=dir>0?-30:LW+30; p.y=Math.random()*LH; } } }
 wxP=wxP.filter(p=>!p.dead||false); if(wxP.length>140) wxP.length=140; }
function drawWeather(){ const w=wxKind(); if(!w) return; ctx.save(); ctx.beginPath(); ctx.rect(0,0,LW,LH); ctx.clip(); drawWeather0(w); ctx.restore(); }
function drawWeather0(w){ const a=wxFade;
 if(w==='rain'){ ctx.fillStyle=`rgba(30,50,110,${.16*a})`; ctx.fillRect(0,0,LW,LH); }
 if(w==='ice'){ ctx.fillStyle=`rgba(180,220,255,${.12*a})`; ctx.fillRect(0,0,LW,LH); }
 // мокрые/заиндевевшие края блоков
 if(w==='rain'||w==='ice') for(const o of world.solids){ if(!o.alive||o.type==='s'||o.type==='h') continue; ctx.globalAlpha=a; ctx.fillStyle=w==='ice'?'#e8f8ff':'#9ad0ff'; ctx.fillRect(o.x,o.y,o.w,1);
   if(w==='ice'){ ctx.fillStyle='#ffffff'; for(let i=(o.x*7)%9;i<o.w;i+=9) ctx.fillRect(o.x+i,o.y+1,1,2); } else { const sh=(now*30+o.x)%Math.max(8,o.w); ctx.fillStyle='rgba(255,255,255,.7)'; ctx.fillRect(o.x+(sh|0),o.y,4,1); } ctx.globalAlpha=1; }
 for(const p of wxP){ if(p.k==='r'){ ctx.fillStyle='rgba(170,215,255,.75)'; const dx=(world.windSum()/170)*2; ctx.fillRect(p.x|0,p.y|0,1,5); ctx.fillRect((p.x+dx)|0,(p.y+5)|0,1,2); }
  else if(p.k==='s'){ ctx.fillStyle='#fff'; ctx.fillRect(p.x|0,p.y|0,1,1); if(p.v>.9){ ctx.fillRect((p.x|0)-1,p.y|0,3,1); ctx.fillRect(p.x|0,(p.y|0)-1,1,3); } }
  else if(p.k==='w'){ ctx.fillStyle='rgba(255,255,255,.45)'; ctx.fillRect(p.x|0,p.y|0,10+p.v*14|0,1); }
  else { ctx.fillStyle='#1a0c22'; ctx.fillRect((p.x|0)-1,(p.y|0)-1,5,4); ctx.fillStyle=p.c; ctx.fillRect(p.x|0,p.y|0,3,2); ctx.fillRect((p.x|0)+1,(p.y|0)+Math.round(Math.sin(now*6+p.ph)),1,1); } } }
function drawWxChip(y){ if(!world.wx) return y; const S=world.L.wx, w=world.wx; const [nm,col]=WXN[world.wxNow]||['?','#fff']; const left=S.length>1?S[w.i][1]-w.t:0;
 ctx.fillStyle='rgba(12,4,24,.55)'; ctx.fillRect(LW-112,y,108,24); T(nm,LW-58,y+2,11,col); if(S.length>1){ ctx.fillStyle='#1a0c22'; ctx.fillRect(LW-108,y+18,100,4); ctx.fillStyle=left<2?((now*8|0)%2?'#ff3a3a':'#ffd23c'):col; ctx.fillRect(LW-107,y+19,Math.round(98*Math.max(0,left/S[w.i][1])),2); } return y+28; }
// ---------- 16: ночь ----------
var nightC=null, nightX=null;
function drawNight(){ if(!isNight()) return; if(!nightC){ [nightC,nightX]=mk(LW,LH); } const x=nightX; x.globalCompositeOperation='source-over'; x.clearRect(0,0,LW,LH); x.fillStyle='rgba(6,6,30,.74)'; x.fillRect(0,0,LW,LH);
 x.globalCompositeOperation='destination-out'; const hole=(cx,cy,r,k=1)=>{ for(const [f,al] of [[1,.35],[.78,.35],[.56,.5]]){ x.globalAlpha=al*k; x.beginPath(); x.arc(Math.round(cx),Math.round(cy),Math.round(r*f),0,7); x.fill(); } x.globalAlpha=1; };
 const s=world.s, fl=1+Math.sin(now*9)*.03+Math.sin(now*23)*.02; if(s.st!=='poof') hole(s.x,s.y-6,72*fl); if(world.buttons) for(const b of world.buttons) if(!b.on) hole(b.x,btnY(b)+1,14,.9); /* FB23: только НЕнажатая кнопка видна сквозь ночь */ if(world.clone) hole(world.clone.x,world.clone.y,40*fl);
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
/* FB17: имя босса + смешная строчка прямо над боссом при входе в уровень (без паузы, ввод не блокируется) */
let bossLbl=null;
function drawBossLabel(){ const b=world&&world.boss; if(!b||b.dead||!bossLbl||bossLbl.w!==world) return; const bd=BOSS[b.k]; const t=now-bossLbl.t0; if(world.used>0&&bossLbl.fl===undefined) bossLbl.fl=t; const end=Math.max(5.5,(bossLbl.fl===undefined?0:bossLbl.fl)+2); /* ждём первый бросок (+2 с), минимум 5.5 с, максимум 12 с */ const stop=bossLbl.fl===undefined?Math.max(end,Math.min(12,t)):end; const al=t<.35?t/.35:t>stop?Math.max(0,1-(t-stop)/.8):1; if(al<=0){ if(t>stop) bossLbl=null; return; }
 const nm=bd.name, ds0=bd.intro||bd.mech, nW=textW(nm,13), DL=textW(ds0,9)>LW-20?wrapTxt(ds0,9,LW-20):[ds0], w=Math.min(LW-6,Math.ceil(Math.max(nW,...DL.map(l=>textW(l,9))))+14), h=34+(DL.length-1)*12; const lay=bossLblPlace(b,w,h); bossLbl.lay=lay; const above=lay.above, cx=lay.cx, y0=lay.y0, x0=cx-(w>>1);
 const pu=(Math.sin(t*4.2)+1)/2, blink=(t%1.6)<.12; ctx.globalAlpha=al*.82; ctx.fillStyle='#120818'; ctx.fillRect(x0,y0,w,h); ctx.globalAlpha=al; ctx.fillStyle=bd.col; ctx.fillRect(x0,y0,w,1); ctx.fillRect(x0,y0+h-1,w,1); ctx.fillRect(x0,y0,1,h); ctx.fillRect(x0+w-1,y0,1,h); ctx.fillStyle='#120818'; ctx.fillRect(x0-1,y0+1,1,h-2); ctx.fillRect(x0+w,y0+1,1,h-2);
 ctx.fillStyle=bd.col; const ty=above?y0+h:y0-4; if(above){ ctx.fillRect(cx-3,ty,7,1); ctx.fillRect(cx-2,ty+1,5,1); ctx.fillRect(cx-1,ty+2,3,1); ctx.fillRect(cx,ty+3,1,1); } else { ctx.fillRect(cx,ty,1,1); ctx.fillRect(cx-1,ty+1,3,1); ctx.fillRect(cx-2,ty+2,5,1); ctx.fillRect(cx-3,ty+3,7,1); }
 ctx.globalAlpha=al*(.18+.22*pu); ctx.fillStyle=bd.col; ctx.fillRect(x0+2,y0+2,w-4,15); ctx.globalAlpha=al*(blink?1:.82+.18*pu);
 T(nm,cx,y0+3,13,blink?['#ffffff','#ffffff']:['#ffffff',bd.col==='#e8f4ff'?'#9ad0ff':bd.col]); ctx.globalAlpha=al; DL.forEach((l,i)=>T(l,cx,y0+19+i*12,9,'#ffe9a0')); ctx.globalAlpha=1; }
/* FB25: место таблички босса — выше/ниже/сбоку, без наложения на HUD, конфеты, слизня, банку ДОМ и всплывающие надписи; гистерезис + плавное следование, целые px */
function bossLblObst(){ const R=[], w=world; const hb=((w.wx||relay)?62:30)+(chaosRun&&oy+LH+4>H-30?CHAOS_HB:0); R.push([0,0,LW,hb]); for(const c of w.candies) if(!c.got) R.push([c.x-12,c.y-9,24,18]); if(w.s&&w.s.st!=='poof') R.push([w.s.x-18,w.s.y-30,36,40]); const g=w.L.goal; R.push([g[0]-20,g[1]-48,40,52]);
 for(const f of floats){ if(f.t>=f.life) continue; const tw=textW(f.s,f.size||11), yy=f.y-(f.t/f.life)*14; R.push([f.x-tw/2-2,yy-2,tw+4,(f.size||11)+6]); } return R; }
function bossLblPlace(b,w,h){ const R=bossLblObst(), ov=(x,y)=>{ let a=0; for(const r of R){ const ix=Math.min(x+w,r[0]+r[2])-Math.max(x,r[0]), iy=Math.min(y+h,r[1]+r[3])-Math.max(y,r[1]); if(ix>0&&iy>0) a+=ix*iy; } return a; };
 const C=[], bx=b.x, by=b.y, r=b.r; for(const [mode,yy] of [['a',by-r-h-13],['b',by+r+10],['a2',by-r-h-40],['b2',by+r+36]]) for(const dx of [0,-60,60,-110,110]){ const cx=Math.round(Math.max(w/2+3,Math.min(LW-w/2-3,bx+dx))), y0=Math.round(Math.max(4,Math.min(LH-h-6,yy))); const sc=ov(cx-w/2,y0)*10+Math.abs(dx)*2+(mode[0]==='b'?30:0)+(mode.length>1?60:0)+(Math.abs(y0-yy)>2?400:0); C.push({mode,dx,cx,y0,sc,above:mode[0]==='a'&&y0+h+4<=by-r}); }
 for(let yy=34;yy<=LH-h-6;yy+=12) for(const dx of [0,-80,80]){ const cx=Math.round(Math.max(w/2+3,Math.min(LW-w/2-3,bx+dx))); const o=ov(cx-w/2,yy); C.push({mode:'g'+yy,dx,cx,y0:yy,sc:o*10+150+Math.abs(yy-(by-r-h-13))*.8+Math.abs(dx),above:yy+h+4<=by-r}); }
 const prev=bossLbl.lay; if(FIELD_V2&&prev&&prev.w===w&&prev.h===h&&ov(prev.cx-w/2,prev.y0)===0) return prev;
 C.sort((p,q)=>p.sc-q.sc); let best=C[0]; if(prev){ const same=C.find(c=>c.mode===prev.mode&&c.dx===prev.dx); if(same&&(same.sc<=best.sc+300||ov(same.cx-w/2,same.y0)===0)) best=same; }
 if(prev&&prev.mode===best.mode&&prev.dx===best.dx){ const k=.25; best={...best,cx:Math.round(prev.cx+(best.cx-prev.cx)*k),y0:Math.round(prev.y0+(best.y0-prev.y0)*k)}; } best.ov=ov(best.cx-w/2,best.y0); best.w=w; best.h=h; return best; }
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
/* FB21: сытость = бонус бросков на ВСЮ игровую сессию (от выхода из меню/домика в уровни до возврата в меню/домик); 3/5 → +1, 5/5 → +2 */
const fedN=f=>f>=5?2:f>=3?1:0; const brosk=n=>n===1?'бросок':'броска';
let fedSess=new Map(Array.isArray(save.fedUsed)?save.fedUsed.filter(q=>Array.isArray(q)&&typeof q[0]==='string').map(q=>[q[0],q[1]|0]):[]);
function endFedSession(){ if(!fedSess.size) return; for(const id of fedSess.keys()){ if(save.house&&save.house[id]){ save.house[id].full=0; } } fedSess.clear(); save.fedUsed=[]; store(); }
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
 const lx=60, ly=tp+30, lit=save.houseLight!==false; ctx.fillStyle='#1a0c22'; ctx.fillRect(lx-1,0,2,ly); ctx.fillRect(lx-12,ly,24,10); ctx.fillRect(lx-5,ly+9,10,5); ctx.fillStyle=lit?(night?'#ffe066':'#ffb03c'):'#6a5a7a'; ctx.fillRect(lx-11,ly+1,22,8); ctx.fillStyle=lit?'#fff6b0':'#8a7a9a'; ctx.fillRect(lx-4,ly+10,8,3); ctx.fillStyle=lit?'#ffd890':'#5a4a6a'; ctx.fillRect(lx-9,ly+2,6,1);
 // шнурок-выключатель
 const pull=houseLampT&&now-houseLampT<.25?3:0; ctx.fillStyle='#1a0c22'; ctx.fillRect(lx+9,ly+10,1,12+pull); ctx.fillStyle='#ffd23c'; ctx.fillRect(lx+8,ly+22+pull,3,3);
 if(lit){ for(const [rr,al] of [[46,.07],[32,.08],[20,.10]]){ ctx.globalAlpha=night?al:al*.6; disc(lx,ly+14,rr,'#ffe066'); } ctx.globalAlpha=1; }
 { const lx0=Math.max(lx-26,4+TAP()+3), ly0=TAP()+8; buttons.push({x:lx0,y:ly0,w:Math.max(lx+26-lx0,52,TAP()),h:Math.max(ly+30-ly0,TAP()),label:'lamp',cb:()=>toggleLamp()}); /* FB22: не перекрывает кнопку «назад» */ }
 // ковёр
 ctx.fillStyle='#1a0c22'; ctx.fillRect(14,fy+130,W-28,22); ctx.fillStyle='#c04a9a'; ctx.fillRect(16,fy+132,W-32,18); ctx.fillStyle='#ff8ad0'; for(let x=20;x<W-20;x+=8) ctx.fillRect(x,fy+140,4,2);
 iconBtn(4,4,icBack,()=>goBack(),'back'); T('Домик',W/2,tp/2-10,17,['#fff','#ffd23c']); candy(W-50,tp/2,now,0); T(String(save.candy|0),W-40,tp/2-8,14,'#ff8ad0','l');
 const R0=houseRoster(), per=6, pages=Math.max(1,Math.ceil(R0.length/per)); if(housePage>=pages) housePage=0; const L=R0.slice(housePage*per,housePage*per+per); if(houseSel>=L.length) houseSel=0;
 const sel=L[houseSel]; const hNames=[]; L.forEach((c,k)=>{ const h=houseOf(c.id), col=k%3, row=k/3|0, x=Math.round(W*(col+1)/4), y=Math.round(row?fy+118:fy-4);
  const asleep=h.sleep&&Date.now()<h.sleep; const bob=asleep?0:Math.round(Math.sin(now*2+k)*1); const hop=h.hop&&now-h.hop<.4?Math.round(Math.sin((now-h.hop)/.4*Math.PI)*8):0; const fl=k%2===1;
  ctx.fillStyle='rgba(0,0,0,.25)'; ctx.fillRect(x-20,y+24,40,3); const chew=feedAnim&&feedAnim.id===c.id&&now-feedAnim.t<1.2; const an=asleep?'splat':'idle', fr=asleep?5:frameOf('idle',now+k*.4);
  const dark=save.houseLight===false; if(!dark){ ctx.save(); ctx.translate(x,y-hop*2+bob); ctx.scale(2,2); drawSlugM(c.id,an,fr,0,0,fl,chew?1+Math.abs(Math.sin(now*14))*.08:1,chew?1-Math.abs(Math.sin(now*14))*.08:1);
  const A=anchors(c.id); const a=A&&A.idle[fr]; const tier=hatTier(h.fed); if(tier&&a&&!asleep) drawHat((a.hx-32)*(fl?-1:1),a.hy-40+2,tier,c,CHARS.indexOf(c)+1); ctx.restore(); }
  if(asleep&&!dark){ T('Z',x+18+Math.sin(now*2)*2,y-40-((now*10)%10),12,'#d8c8f0','l'); T('z',x+26,y-50-((now*10+5)%10),10,'#d8c8f0','l'); }
  if(k===houseSel){ ctx.fillStyle='#ffd23c'; const ay=y-60+Math.round(Math.sin(now*5)*2); ctx.fillRect(x-4,ay,9,2); ctx.fillRect(x-3,ay+2,7,2); ctx.fillRect(x-2,ay+4,5,2); ctx.fillRect(x-1,ay+6,3,1); }
  for(let i=0;i<5;i++){ ctx.fillStyle='#1a0c22'; ctx.fillRect(x-15+i*6,y+28,6,5); ctx.fillStyle=i<h.full?'#ff4a6a':'#4a3a5a'; ctx.fillRect(x-14+i*6,y+29,4,3); }
  hNames.push([c.name,x,y+34,k===houseSel?'#ffd23c':'#fff']);
  buttons.push({x:x-W/8,y:y-56,w:W/4,h:84,label:'h'+k,cb:()=>{ if(houseSel!==k){ houseSel=k; sfx('tap'); } petSlug(c,h,x,y-20); }}); });
 for(const n of hNames) T(n[0],n[1],n[2],11,n[3]); /* имена поверх второго ряда */
 if(save.houseLight===false) drawHouseNight(L,fy,tp,night);
 for(const f of houseFX){ f.t+=1/60; if(f.k==='bub') continue; f.y-=20/60; if(f.k==='heart'){ ctx.globalAlpha=Math.max(0,1-f.t/1.2); ctx.fillStyle='#ff4a6a'; ctx.fillRect(f.x-2,f.y,2,2); ctx.fillRect(f.x+1,f.y,2,2); ctx.fillRect(f.x-2,f.y+2,5,1); ctx.fillRect(f.x-1,f.y+3,3,1); ctx.fillRect(f.x,f.y+4,1,1); ctx.globalAlpha=1; } else if(f.k==='candy'){ f.y+=f.t*6; candy(f.x,f.y,now,f.i); } else T(f.s,f.x,f.y,f.size||11,f.col||'#fff'); }
 for(const f of houseFX) if(f.k==='bub') drawHouseBubble(f); /* FB25: пузыри последними */
 houseFX=houseFX.filter(f=>f.t<(f.life||1.2));
 // панель
 const py=fy+198; if(sel){ const h=houseOf(sel.id), nx=HAT_NEXT(h.fed); T(sel.name+': сытость '+h.full+'/5',W/2,py-6,12,'#fff'); { const n=fedN(h.full); const t1=n>0?'+'+n+' '+brosk(n)+' в каждом уровне, пока не вернёшься в меню':h.full>0?'ещё '+(3-h.full)+' — и будет +1 бросок (5/5 → +2)':'голодный: 3/5 → +1 бросок, 5/5 → +2'; T(fitTxt(textW(t1,10)>W-16&&n>0?'+'+n+' '+brosk(n)+' в уровне, до выхода в меню':t1,10,W-16),W/2,py+9,10,n>0?'#7affe0':'#ffb0d8'); } T(nx?'шапка растёт: '+h.fed+'/'+nx+' конфет':'шапка выросла полностью!',W/2,py+23,10,nx?'#ffe0f0':'#ffd23c'); }
 const bw=Math.min(150,(W-36)/2|0), by=Math.min(H-tp-8,py+40); const zz=!!sel&&houseAsleep(sel), can=(save.candy|0)>0&&sel&&!zz;
 btn(W/2-bw-6,by,bw,tp,zz?'СПЯТ zZ':'КОРМИТЬ',()=>{ if(!sel) return; if(houseAsleep(sel)){ sfx('bounce',30); haptic('error'); const k=houseSel; houseBubble([save.houseLight===false?'Тсс, спят! Включи свет, чтобы покормить':'Тсс, спит! Покормишь, когда проснётся'],Math.round(W*((k%3)+1)/4),Math.round((k/3|0)?fy+118:fy-4),'#d8c8f0'); return; } if((save.candy|0)<=0){ lockNo(); haptic('error'); houseFX.push({k:'t',s:'нет конфет — играй уровни!',x:W/2,y:by-10,t:0,life:1.4,col:'#ff8ab0'}); return; } feedSlug(sel); },zz?'#3a3052':can?'#ff5aa8':'#5a4a6a',zz?13:14); buttons[buttons.length-1].label='feed';
 btn(W/2+6,by,bw,tp,'ПОГЛАДИТЬ',()=>{ if(sel){ const k=houseSel; petSlug(sel,houseOf(sel.id),Math.round(W*((k%3)+1)/4),Math.round((k/3|0)?fy+98:fy-24)); } },'#6a4fd8',14); buttons[buttons.length-1].label='pet';
 if(pages>1) pager(Math.min(H-tp-4,by+tp+8),housePage,pages,v=>{housePage=v;houseSel=0;},'hs');
 else T('тапни слизня — погладить',W/2,by+tp+10,10,night?'#c8b8e0':'#5a3a2a'); }
/* NIGHT: ночной режим домика (свет выключен) */
let houseDarkT=-99, nightPop=[-99,-99,-99], starWish=-99; const sleepCache={}, capCache={};
const rgbA=(c,a)=>'rgba('+c[0]+','+c[1]+','+c[2]+','+a+')';
function sleepSprite(id){ if(sleepCache[id]) return sleepCache[id]; const im=SPR[id]; if(!im) return null; const [c,x]=mk(64,64); x.drawImage(im,0,0,64,64,0,0,64,64); const g=x.getImageData(0,0,64,64), d=g.data;
 const cnt={}; let best=null,bn=0, y0=99,y1=-1; for(let i=0;i<d.length;i+=4){ if(d[i+3]<200) continue; const yy=(i/4/64)|0; if(yy<y0)y0=yy; if(yy>y1)y1=yy; const L=lum(d[i],d[i+1],d[i+2]); if(L<72||(d[i]>215&&d[i+1]>215&&d[i+2]>215)) continue; const k=(d[i]>>3)+','+(d[i+1]>>3)+','+(d[i+2]>>3); const n=cnt[k]=(cnt[k]||0)+1; if(n>bn){bn=n;best=[d[i],d[i+1],d[i+2]];} }
 const body=best||[165,122,240], W8=(xx,yy)=>{ const i=(yy*64+xx)*4; return d[i+3]>=200&&d[i]>215&&d[i+1]>215&&d[i+2]>215; }, ylim=y0+(y1-y0)*.6, seen=new Uint8Array(4096), eyes=[];
 for(let yy=0;yy<=ylim;yy++) for(let xx=0;xx<64;xx++){ if(seen[yy*64+xx]||!W8(xx,yy)) continue; const st=[[xx,yy]]; seen[yy*64+xx]=1; let n=0,bx0=xx,bx1=xx,by0=yy,by1=yy; while(st.length){ const [px,py]=st.pop(); n++; bx0=Math.min(bx0,px); bx1=Math.max(bx1,px); by0=Math.min(by0,py); by1=Math.max(by1,py); for(const [qx,qy] of [[px+1,py],[px-1,py],[px,py+1],[px,py-1]]) if(qx>=0&&qx<64&&qy>=0&&qy<64&&!seen[qy*64+qx]&&W8(qx,qy)){ seen[qy*64+qx]=1; st.push([qx,qy]); } } if(n>=3&&n<=70&&bx1-bx0<=13&&by1-by0<=13){ let pu=0; for(let yy=by0;yy<=by1;yy++) for(let xx=bx0;xx<=bx1;xx++){ const i=(yy*64+xx)*4; if(d[i+3]>=200&&lum(d[i],d[i+1],d[i+2])<72) pu++; } if(pu>0) eyes.push([bx0,bx1,by0,by1]); } }
 if(id==='slug44'&&eyes.length>2){ /* мумия: бинты тоже белые — глаза только самые верхние */ const t0=Math.min(...eyes.map(e=>e[2])); for(let i=eyes.length-1;i>=0;i--) if(eyes[i][2]>t0+4) eyes.splice(i,1); }
 for(let m=true;m;){ m=false; for(let i=0;i<eyes.length&&!m;i++) for(let j=i+1;j<eyes.length&&!m;j++){ const A2=eyes[i],B2=eyes[j]; if(A2[0]<=B2[1]+2&&B2[0]<=A2[1]+2&&A2[2]<=B2[3]+2&&B2[2]<=A2[3]+2){ eyes[i]=[Math.min(A2[0],B2[0]),Math.max(A2[1],B2[1]),Math.min(A2[2],B2[2]),Math.max(A2[3],B2[3])]; eyes.splice(j,1); m=true; } } }
 const src=new Uint8ClampedArray(d); for(const [bx0,bx1,by0,by1] of eyes){ const rc={}; let lid=null,ln=0; for(let yy=Math.max(0,by0-5);yy<=Math.min(63,by1+5);yy++) for(let xx=Math.max(0,bx0-5);xx<=Math.min(63,bx1+5);xx++){ if(xx>=bx0-2&&xx<=bx1+2&&yy>=by0-1&&yy<=by1+1) continue; const i=(yy*64+xx)*4; if(src[i+3]<200) continue; const r=src[i],g2=src[i+1],b=src[i+2], L=lum(r,g2,b); if(L<72||(r>215&&g2>215&&b>215)) continue; const mxc=Math.max(r,g2,b), sat=(mxc-Math.min(r,g2,b))/mxc, kk=(r>>3)+','+(g2>>3)+','+(b>>3); const n=rc[kk]=(rc[kk]||0)+(sat>.18?3:1); if(n>ln){ ln=n; lid=[r,g2,b]; } } lid=lid||body;
  for(let yy=Math.max(0,by0-1);yy<=Math.min(63,by1+1);yy++) for(let xx=Math.max(0,bx0-2);xx<=Math.min(63,bx1+2);xx++){ const i=(yy*64+xx)*4; if(d[i+3]<200) continue; const inb=xx>=bx0&&xx<=bx1&&yy>=by0&&yy<=by1; if(!inb&&lum(src[i],src[i+1],src[i+2])<72) continue; d[i]=lid[0]; d[i+1]=lid[1]; d[i+2]=lid[2]; }
  const cy=Math.round((by0+by1)/2); for(let xx=bx0;xx<=bx1;xx++){ const e=(xx===bx0||xx===bx1)&&bx1-bx0>=2; const i=((cy+(e?0:1))*64+xx)*4; d[i]=26; d[i+1]=12; d[i+2]=34; d[i+3]=255; } }
 x.putImageData(g,0,0); return sleepCache[id]={c,body,eyes}; }
const CAP_COL=[['#5a6ae0','#4250b8'],['#e05a9a','#b84278'],['#3ab8a0','#2a8a78'],['#f0a040','#c07a28']];
function capSprite(k){ if(capCache[k]) return capCache[k]; const [C1,C2]=CAP_COL[k%4]; const [c0,x0]=mk(24,20), P=(xx,yy,col)=>{ x0.fillStyle=col; x0.fillRect(xx,yy,1,1); };
 for(let r=0;r<10;r++){ const w=Math.max(3,13-r), l=Math.round(5+r*.8); for(let xx=l;xx<l+w;xx++) P(xx,14-r,(r%3===2)?'#fff4fa':(xx===l?C2:C1)); }
 for(const [xx,yy] of [[16,4],[17,4],[17,5],[18,5],[18,6],[19,6],[19,7]]) P(xx,yy,C1);
 for(let yy=15;yy<=17;yy++) for(let xx=3;xx<=19;xx++) P(xx,yy,yy===15?'#ffffff':'#e6dcf0');
 for(let yy=7;yy<=10;yy++) for(let xx=19;xx<=22;xx++) if(!((yy===7||yy===10)&&(xx===19||xx===22))) P(xx,yy,yy===7?'#ffffff':'#f0e8ff');
 const [c,x]=mk(26,22); for(const [a,b] of [[0,1],[2,1],[1,0],[1,2]]) x.drawImage(c0,a,b); x.globalCompositeOperation='source-in'; x.fillStyle='#1a0c22'; x.fillRect(0,0,26,22); x.globalCompositeOperation='source-over'; x.drawImage(c0,1,1); return capCache[k]=c; }
function nightState(k,id){ if(save.houseLight!==false) return -1; const h=id&&houseOf(id); if(h&&h.sleep&&Date.now()<h.sleep) return 2; const dk=now-houseDarkT, ys=.6+k*.35; return dk<ys?0:dk<ys+1.4?1:2; }
const STAR_P=7; const starPh=()=>(now+2)%STAR_P;
function ffPos(i,fy,tp){ const sp=[1,1.27,.83][i]; return [Math.round(W*(.14+.72*((Math.sin(now*.21*sp+i*2.1)+1)/2))), Math.round(tp+78+(fy+92-tp-78)*((Math.sin(now*.33*sp+i*1.7)+1)/2)+Math.sin(now*2.3+i)*3)]; }
function nightGift(key,x,y,line){ const d=dayKey(today()); if(save[key]!==d){ save[key]=d; save.candy=(save.candy|0)+1; store(); houseFX.push({k:'candy',x,y,t:0,i:(Math.random()*3)|0,life:1.1}); houseFX.push({k:'t',s:line,x:Math.max(70,Math.min(W-70,x)),y:y-18,t:0,life:1.8,size:11,col:'#ffe9a0'}); tone(1320,.06,'square',.12,1760); haptic('success'); return true; } return false; }
function tapFirefly(i,x,y){ if(now-nightPop[i]<8) return; nightPop[i]=now; for(let j=0;j<6;j++) houseFX.push({k:'t',s:'·',x:x+(Math.random()-.5)*18,y:y+(Math.random()-.5)*10,t:-j*.03,life:.6,size:12,col:'#e8ff7a'}); tone(1600,.04,'square',.1,2200);
 if(!nightGift('ffDay',x,y,'+1 конфета от светлячка!')) houseFX.push({k:'t',s:'светлячок: «завтра ещё!»',x:Math.max(80,Math.min(W-80,x)),y:y-14,t:0,life:1.4,size:10,col:'#d8f0a0'}); }
function tapStar(){ const wx=W-110, wy=TAP()+24; if(starPh()<1.8||now-starWish<1.8){ starWish=now; houseFX.push({k:'t',s:'загадай желание!',x:W-120,y:wy+70,t:0,life:2,size:13,col:'#fff6b0'}); if(!nightGift('starDay',wx+30,wy+108,'+1 конфета — сбудется!')) tone(990,.05,'triangle',.1,1320); }
 else houseFX.push({k:'t',s:'жди падающую звезду…',x:W-110,y:wy+74,t:0,life:1.2,size:10,col:'#c8c0f0'}); }
const MUMBLE=['мм… ещё пять минуточек…','хр-р… конфетка…','не буди… я летаю…','мням… желе…','кто тут… а, ты… хрр','*сопит* мур-мур…','шмяк… шмяк… хрр','я не сплю, я думаю…'];
function drawHouseNight(L,fy,tp,night){ const dk=now-houseDarkT; ctx.fillStyle=night?'rgba(4,2,16,.82)':'rgba(8,4,26,.78)'; ctx.fillRect(0,0,W,H);
 const wx=W-110, wy=tp+24; ctx.fillStyle='#3a2a5a'; ctx.fillRect(wx-3,wy-3,86,66); ctx.fillStyle='#0c1036'; ctx.fillRect(wx,wy,80,60);
 seed=4; for(let i=0;i<14;i++){ const sx=wx+rnd()*80|0, sy=wy+rnd()*60|0, tw=Math.sin(now*2+i*1.7); ctx.fillStyle=tw>.6?'#ffffff':'#8a8ac8'; ctx.fillRect(sx,sy,1,1); }
 for(const [rr,al] of [[20,.06],[15,.10],[11,.16]]){ ctx.globalAlpha=al; disc(wx+56,wy+18,rr,'#fff6c8'); } ctx.globalAlpha=1; disc(wx+56,wy+18,9,'#fffbe0'); disc(wx+61,wy+15,8,'#0c1036');
 { const ph=starPh(); if(ph<1.1){ const q=ph/1.1, hx=Math.round(wx+74-q*58), hy=Math.round(wy+5+q*24); ctx.save(); ctx.beginPath(); ctx.rect(wx,wy,80,60); ctx.clip(); for(let j=1;j<12;j++){ ctx.globalAlpha=(1-j/12)*(1-q*.4)*.8; ctx.fillStyle=j<4?'#ffffff':'#bfe0ff'; ctx.fillRect(hx+Math.round(j*2.4),hy-Math.round(j),1,1); } ctx.globalAlpha=1; ctx.fillStyle='#ffffff'; ctx.fillRect(hx-1,hy-1,2,2); ctx.restore(); } }
 ctx.fillStyle='#4a3e6a'; ctx.fillRect(wx+38,wy,4,60); ctx.fillRect(wx,wy+28,80,4); ctx.fillStyle='#4a2448'; ctx.fillRect(wx-8,wy-4,10,70); ctx.fillRect(wx+78,wy-4,10,70);
 ctx.fillStyle='rgba(200,210,255,.045)'; ctx.beginPath(); ctx.moveTo(wx,wy+60); ctx.lineTo(wx+80,wy+60); ctx.lineTo(wx+30,fy+150); ctx.lineTo(wx-70,fy+150); ctx.closePath(); ctx.fill();
 buttons.push({x:wx-10,y:wy-6,w:100,h:72,label:'star',cb:()=>tapStar()});
 { const lx=60, ly=tp+30, pu=(Math.sin(now*3)+1)/2; ctx.fillStyle='#3a3a6a'; ctx.fillRect(lx-12,ly,24,1); ctx.fillRect(lx-12,ly,1,10); ctx.fillRect(lx+11,ly,1,10); ctx.fillStyle='#7a7ab8'; ctx.fillRect(lx-11,ly+1,22,1); ctx.fillStyle='#4a4a80'; ctx.fillRect(lx,0,1,ly);
  ctx.fillStyle='#8a8ac8'; ctx.fillRect(lx+9,ly+10,1,12); ctx.globalAlpha=.25+.35*pu; disc(lx+9,ly+23,4,'#ffd23c'); ctx.globalAlpha=1; ctx.fillStyle='#ffd23c'; ctx.fillRect(lx+8,ly+22,3,3);
  if(!save.lampHint) T('дёрни',lx+18,ly+18,10,'#ffe9a0','l'); }
 const nN=[]; L.forEach((c,k)=>{ const col=k%3, row=k/3|0, x=Math.round(W*(col+1)/4), y=Math.round(row?fy+118:fy-4), fl=k%2===1; const st=nightState(k,c.id); const S=sleepSprite(c.id), A=anchors(c.id); if(!S||!A) return; const body=S.body, pul=.8+.2*Math.sin(now*1.3+k*1.1);
  for(const [rr,al] of [[32,.07],[24,.09],[16,.11]]){ ctx.globalAlpha=al*pul; disc(x,y-12,rr,rgbA(body,1)); } ctx.globalAlpha=.22*pul; ctx.fillStyle=rgbA(body,1); ctx.fillRect(x-22,y+24,44,3); ctx.globalAlpha=1;
  const fr=st===0?frameOf('idle',now+k*.4):0, a=A.idle[fr]; let sx=1,sy=1; if(st===1){ const q=Math.sin(Math.PI*Math.min(1,(dk-.6-k*.35)/1.4)); sx=1-.06*q; sy=1+.11*q; } else if(st===2){ const q=Math.sin(now*1.7+k); sx=1-.025*q; sy=1+.045*q; }
  ctx.save(); ctx.translate(x,y); ctx.scale(2,2); ctx.globalAlpha=.62; if(st===2){ ctx.save(); if(fl) ctx.scale(-1,1); ctx.translate(0,16); ctx.scale(sx,sy); ctx.translate(0,-16); ctx.drawImage(S.c,-32,-40); ctx.restore(); } else drawSlug(c.id,'idle',fr,0,0,fl,sx,sy);
  ctx.globalAlpha=.9; if(a){ ctx.save(); ctx.translate(0,16); ctx.scale(sx,sy); ctx.translate(0,-16); ctx.translate((a.hx-32)*(fl?-1:1),a.hy-40+3); const cb=y+(a.hy-40+3)*2, csc=row?Math.max(.6,Math.min(.75,(cb-(fy+38))/38)):.75; ctx.scale(fl?-csc:csc,csc); ctx.drawImage(capSprite(k),-12,-19); ctx.restore(); } ctx.globalAlpha=1; ctx.restore();
  if(st===0&&a&&((now*.7+k*1.3)%4)>=.12){ for(const e2 of [a.el||[a.ex,a.ey],a.er||[a.ex,a.ey]]){ const qx=Math.round(x+(e2[0]-32+.5)*(fl?-1:1)*2), qy=Math.round(y+(e2[1]-40)*2); ctx.globalAlpha=.35; ctx.fillStyle='#fff6a0'; ctx.fillRect(qx-3,qy-2,6,5); ctx.globalAlpha=1; ctx.fillStyle='#fffbd0'; ctx.fillRect(qx-2,qy-1,4,3); ctx.fillStyle='#1a0c22'; ctx.fillRect(qx,qy,1,1); } }
  if(st===1){ const q=(dk-.6-k*.35)/1.4; ctx.globalAlpha=Math.max(0,Math.min(1,Math.sin(Math.PI*q)*1.6)); T('а-ах…',x,y-58,10,'#d8c8f0'); ctx.globalAlpha=1; }
  if(st===2&&a){ const zx=x+30*(fl?-1:1), zy=y-14, rise=22; for(let i=0;i<3;i++){ const ph=(now*.45+i/3+k*.17)%1; ctx.globalAlpha=Math.min(1,(1-ph)*1.6)*Math.min(1,ph*5); T(i%2?'z':'Z',Math.round(zx+(ph*8+Math.sin(ph*6+i)*2)*(fl?-1:1)),Math.round(zy-ph*rise),Math.round(9+ph*4),'#d8c8f0'); } ctx.globalAlpha=1; }
  nN.push([c.name,x,y+34,k===houseSel?'#b8a050':'#8a80b0']); }); for(const n of nN) T(n[0],n[1],n[2],11,n[3]);
 for(let i=0;i<3;i++){ if(now-nightPop[i]<8) continue; const [fx,fy2]=ffPos(i,fy,tp), bl=.55+.45*Math.sin(now*4+i*2); ctx.globalAlpha=.16*bl; disc(fx,fy2,9,'#e8ff7a'); ctx.globalAlpha=.4*bl; disc(fx,fy2,5,'#e8ff7a'); ctx.globalAlpha=1; ctx.fillStyle=bl>.5?'#fbffd0':'#c8e060'; ctx.fillRect(fx-1,fy2-1,3,3); ctx.fillStyle='rgba(220,230,255,.5)'; ctx.fillRect(fx-3,fy2-3+(((now*20)|0)%2),2,1); ctx.fillRect(fx+2,fy2-3+(((now*20+1)|0)%2),2,1);
  buttons.push({x:fx-22,y:fy2-22,w:44,h:44,label:'ff'+i,cb:()=>tapFirefly(i,fx,fy2)}); } }
let houseLampT=0;
function houseBubble(arr,x,y,col,big){ houseFX=houseFX.filter(f=>f.k!=='bub'&&!f.fh); houseFX.push({k:'bub',s:arr[(Math.random()*arr.length)|0],x,y:y-62,t:0,life:big?3:2.4,col,big}); if(big){ tone(988,.07,'square',.12,1320); tone(1318,.08,'square',.1,1760,.08); } }
/* FB25: пузырь — непрозрачная плашка с обводкой #1a0c22 и хвостиком, на текстовом слое ПОВЕРХ имён/слизней; перенос до 2 строк; кламп в экран */
function bubLayout(f){ const sz=f.big?12:11, maxW=Math.min(W-24,220); let L=[f.s]; if(textW(f.s,sz)>maxW-12) L=wrapTxt(f.s,sz,maxW-12); if(L.length>2) L=[L[0],L.slice(1).join(' ')]; const tw=Math.min(W-8,Math.ceil(Math.max(...L.map(l=>textW(l,sz))))+14), lh=sz+4, hh=L.length*lh+8; const bx=Math.round(Math.max(4,Math.min(W-4-tw,f.x-tw/2))), by=Math.round(Math.max(TAP()+6,Math.min(H-hh-12,f.y-hh))); return {sz,L,tw,hh,lh,bx,by}; }
function drawHouseBubble(f){ const {sz,L,tw,hh,lh,bx,by}=bubLayout(f); f._b=[bx,by,tw,hh]; const a=Math.min(1,f.t*6,(f.life-f.t)*4); const pop=f.t<.12?Math.round((1-f.t/.12)*2):0; const col=f.col||'#d8c8f0';
 ctx.globalAlpha=Math.max(0,a); TR(bx-2-pop,by-2-pop,tw+4+pop*2,hh+4+pop*2,'#1a0c22'); TR(bx-1-pop,by-1-pop,tw+2+pop*2,hh+2+pop*2,col); TR(bx-pop,by-pop,tw+pop*2,hh+pop*2,'#2b1a4a');
 const tx=Math.max(bx+6,Math.min(bx+tw-8,f.x))|0; TR(tx-4,by+hh,9,4,'#1a0c22'); TR(tx-3,by+hh+4,7,2,'#1a0c22'); TR(tx-2,by+hh+6,5,2,'#1a0c22'); TR(tx-3,by+hh,7,3,col); TR(tx-2,by+hh+3,5,2,col); TR(tx-1,by+hh+5,3,2,col); TR(tx-2,by+hh-1,5,2,'#2b1a4a'); TR(tx-1,by+hh+1,3,2,'#2b1a4a');
 L.forEach((ln,i)=>T(ln,bx+tw/2,by+4+i*lh,sz,'#fff')); ctx.globalAlpha=1; }
function toggleLamp(){ const on=save.houseLight===false; save.houseLight=on; if(on) save.lampHint=1; store(); houseLampT=now; if(!on){ houseDarkT=now; nightPop=[-99,-99,-99]; } sfx('tap'); tone(on?880:440,.05,'square',.15,on?1200:300); haptic('light');
 const R0=houseRoster(), L=R0.slice(housePage*6,housePage*6+6); L.forEach((c,k)=>{ const h=houseOf(c.id); if(h.sleep&&Date.now()<h.sleep) return; h.hop=now; });
 const lines=on?['ура, свет!','я всё видел!','ааа, глаза!']:['ой, темно!','кто выключил?!','мне страшно…','бу!']; houseFX.push({k:'t',s:lines[Math.random()*lines.length|0],x:W/2,y:H*.3,t:0,life:1.4,size:13,col:on?'#ffd23c':'#d8c8f0'}); }
function petSlug(c,h,x,y){ if(save.houseLight===false){ const k=houseRoster().slice(housePage*6,housePage*6+6).findIndex(q=>q.id===c.id); if(nightState(k<0?0:k,c.id)===2){ h.pets=(h.pets|0)+1; houseFX.push({k:'t',s:MUMBLE[(Math.random()*MUMBLE.length)|0],x:Math.max(84,Math.min(W-84,x)),y:y-44,t:0,life:1.8,size:10,col:'#d8c8f0'}); tone(220,.08,'triangle',.08,180); haptic('light'); qEv('pet'); store(); return; } }
 const asleep=h.sleep&&Date.now()<h.sleep; if(asleep){ houseFX.push({k:'t',s:'тсс… спит',x,y:y-40,t:0,life:1,col:'#d8c8f0'}); return; }
 h.pets=(h.pets|0)+1; h.hop=now; squeak(c); haptic('light'); for(let i=0;i<3;i++) houseFX.push({k:'heart',x:x+(Math.random()-.5)*24,y:y-30-i*6,t:-i*.1}); houseFX.push({k:'t',s:['пи!','мур','хи-хи','ещё!','ня'][Math.random()*5|0],x:x+14,y:y-40,t:0,life:.9,size:10,col:'#fff'});
 if(petCombo.id===c.id) petCombo.n++; else petCombo={id:c.id,n:1}; if(petCombo.n>=20){ h.sleep=Date.now()+20000; petCombo.n=0; save.eggs.sleep=true; houseFX.push({k:'t',s:'Загладили до сна! Ззз…',x:W/2,y:H*.4,t:0,life:2,size:13,col:'#d8c8f0'}); }
 qEv('pet'); store(); }
/* FB25: ночью (свет выключен) или когда заглажен до сна — кормить нельзя */
function houseAsleep(c){ if(save.houseLight===false) return true; const h=houseOf(c.id); return !!(h.sleep&&Date.now()<h.sleep); }
function feedSlug(c){ if(houseAsleep(c)) return false; const h=houseOf(c.id); save.candy=(save.candy|0)-1; h.fed++; const wasFull=h.full>=5; h.full=Math.min(5,h.full+1); { const kk=houseSel, bx=Math.round(W*((kk%3)+1)/4), fy0=Math.round(Math.max(TAP()+150,Math.min(H*.36,H-360))), byy=(kk/3|0)?fy0+118:fy0-4; const f1=h.full; setTimeout(()=>{ if(wasFull){ houseBubble(['Больше не лезет! Запас полон','Я круглый! Хватит-хватит','Ик! Уже +2 броска, честно'],bx,byy,'#ffb0d8'); }
  else if(f1===5){ houseBubble(['Объелся! +2 броска в запасе!','Я теперь суперпрыгун! +2!','Пузико полное — +2 броска!','Всё, я шарик! +2 броска!'],bx,byy,'#ffe066',1); }
  else if(f1===3){ houseBubble(['Ням! Уже +1 бросок!','Вкусно! +1 бросок есть','Ещё парочку — и будет +2!'],bx,byy,'#7affe0'); }
  else { houseFX=houseFX.filter(f=>f.k!=='bub'&&!f.fh); houseFX.push({fh:1,k:'t',s:f1<3?'ещё '+(3-f1)+' — и +1 бросок':'ещё 1 — и +2 броска!',x:W/2,y:TAP()+96,t:0,life:1.6,size:11,col:'#7affe0'}); } },450); } h.ts=Date.now(); feedAnim={id:c.id,t:now}; const k=houseSel, x=Math.round(W*((k%3)+1)/4);
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
  pager(H-tp-8,bestPage,pages,v=>bestPage=v,'bp'); T('✦ тайные порталы будит только особенный слизень',W/2,H-tp-22,9,'#7affff'); }
 else { const all=hybAll(), got=new Set(hybList()), list=hybPairs(); T('открыто '+list.length+' из '+all.length+' • рецепт: форма + цвет',W/2,y0,10,'#d8c8f0');
  // подсказки: 2 неоткрытых рецепта дня — виден только один родитель
  const k0=dayKey(today()); const left=all.filter(([a,b])=>!got.has(hybKey(a,b))&&unlocked(a)&&unlocked(b)); const hints=[]; if(left.length){ let sd=k0%2147483647||1; const r=()=>(sd=(sd*16807)%2147483647)/2147483647; for(let q=0;q<Math.min(2,left.length);q++) hints.push(left[r()*left.length|0]); }
  const items=list.map(p=>({p,h:false})).concat(hints.map(p=>({p,h:true})));
  const cols=2, cw=Math.floor((W-20)/cols), PL=list.map(([a,b])=>wrapTxt(fusedChar(a,b).perk,9,cw-70).length).reduce((m,v)=>Math.max(m,v),1), chh=96+Math.max(0,PL-3)*11, rows=Math.max(2,Math.floor((H-y0-tp-30)/chh)), per=cols*rows, pages=Math.max(1,Math.ceil(items.length/per)); if(bestPage>=pages) bestPage=0;
  const mini=(id,x,y,sil)=>{ ctx.save(); ctx.translate(x,y); ctx.scale(.5,.5); if(sil){ if(SPR[id]) ctx.drawImage(silhouette(id),-32,-40); } else drawSlug(id,'idle',frameOf('idle',now),0,0); ctx.restore(); };
  if(!list.length) T('пока ни одного — слей двух слизней в СЛИЯНИИ',W/2,y0+14,10,'#ffe0f0');
  items.slice(bestPage*per,bestPage*per+per).forEach(({p:[a,b],h},k)=>{ const x=10+(k%cols)*cw, y=y0+(list.length?14:28)+Math.floor(k/cols)*chh, F=fusedChar(a,b); panel(x+2,y,cw-4,chh-6,h?'#1a1430':'#22143e');
   ctx.save(); ctx.beginPath(); ctx.rect(x+3,y+1,cw-6,chh-8); ctx.clip(); if(h){ if(SPR[F.id]){ ctx.drawImage(silhouette(F.id,'#3a2e5a'),x+6,y+chh-84); } T('?',x+36,y+chh/2-14,20,'#7a6aa0'); } else if(SPR[F.id]) drawSlug(F.id,'idle',frameOf('idle',now+k*.2),x+36,y+chh-40); ctx.restore();
   const tx=x+64, tmw=x+cw-6-tx; T(h?'???':fitTxt(F.name,12,tmw),tx,y+6,12,h?'#8a7aa8':'#7affe0','l'); if(h) T('подсказка рецепта',tx,y+22,9,'#a898c8','l'); else wrapTxt(F.perk,9,tmw).forEach((ln,i)=>T(ln,tx,y+20+i*11,9,F.col,'l'));
   const ry=y+chh-20, rx=Math.min(tx,x+cw-6-92); /* FB24: рецепт не вылезает за карточку на узких экранах */ mini(CHARS[a].id,rx+10,ry,false); T('+',rx+26,ry-14,12,'#fff'); mini(CHARS[b].id,rx+44,ry,h); if(h) T('?',rx+44,ry-18,14,'#ffd23c'); T('=',rx+60,ry-14,12,'#fff'); if(h) T('?',rx+74,ry-14,12,'#ffd23c'); else mini(F.id,rx+76,ry,false);
   if(!h) buttons.push({x,y,w:cw,h:chh-6,label:'bh'+a+'_'+b,cb:()=>{ selectHybrid(a,b); sfx('candy',k%4); floats.push({s:F.name+' выбран!',x:W/2-ox,y:y-oy,t:0,life:1.2,size:11,col:'#7affe0'}); }}); });
  if(pages>1) pager(H-tp-8,bestPage,pages,v=>bestPage=v,'hp');
  { const ft='редкая находка = случайный рецепт, сразу в коллекции'; T(textW(ft,9)<=W-16?ft:'редкая находка = случайный рецепт',W/2,H-tp-22,9,'#a898c8'); } }
 if(save.eggs.master) T('★ Мастер шмяка',W-8,tp/2+8,10,'#ffd23c','r'); for(const f of floats){ const k=f.t/f.life; T(f.s,f.x+ox,f.y+oy-k*14,f.size,f.col); } }
// ---------- 11: экран заданий ----------
function drawQuests(){ drawBG(4,0,now); swipePager=null; const tp=TAP(); iconBtn(4,4,icBack,()=>goBack(),'back'); T('Задания дня',W/2,tp/2-10,17,['#fff','#ffe066']); const Q=questsToday();
 const d=today(); T(d.getDate()+'.'+String(d.getMonth()+1).padStart(2,'0')+' • новые в полночь',W/2,tp/2+10,10,'#d8c8f0');
 const ch=Math.max(92,tp+52); Q.ids.forEach((id,i)=>{ const q=QUESTS.find(x=>x.id===id), y=tp+24+i*(ch+8), pr=Q.prog[i], done=pr>=q.n, got=Q.got[i];
  panel(12,y,W-24,ch,got?'#1e2a2a':done?'#2a4a3a':'#2b1a4a'); T(q.t,22,y+8,13,got?'#8aa8a0':'#fff','l'); ctx.fillStyle='#1a0c22'; ctx.fillRect(22,y+32,W-140,10); ctx.fillStyle=done?'#4ed05a':'#ffd23c'; ctx.fillRect(23,y+33,Math.round((W-142)*pr/q.n),8); T(pr+'/'+q.n,W-112,y+29,11,'#fff','l');
  T('награда: '+q.rw+' конфет',22,y+48,11,'#ffb0d8','l');
  if(got) T('✓ ПОЛУЧЕНО',W-24,y+ch-tp-2,12,'#7affe0','r'); else btn(W-132,y+ch-tp-6,112,tp,done?'ЗАБРАТЬ':'В ПУТИ',()=>{ if(!done){ lockNo(); return; } Q.got[i]=true; save.candy=(save.candy|0)+q.rw; store(); sfx('win'); haptic('success'); burst(W-76-ox,y+ch-20-oy,30,['#ff4a8a','#ffd23c','#4ef0b0','#fff'],150,60,1,200); floats.push({s:'+'+q.rw+' конфет!',x:W/2-ox,y:y+ch/2-oy,t:0,life:1.6,size:15,col:['#fff','#ff8ad0'],pop:1}); },done?'#4ed05a':'#4a3a5a',14); buttons[buttons.length-1].label='q'+i; });
 const yb=tp+24+3*(ch+8)+6; T('Конфеты: '+(save.candy|0)+' — трать в Домике',W/2,yb,12,'#ff8ad0'); T('✦ Тайные порталы спят и просыпаются',W/2,yb+22,10,'#7affff'); T('только для особенных слизней. Загадка — в паузе',W/2,yb+36,10,'#7affff'); for(const f of floats){ const k=f.t/f.life; T(f.s,f.x+ox,f.y+oy-k*14,f.size,f.col); } }
// ---------- настройки (12,13,14,16) ----------
/* текст не залезает под кнопку значения: режем по ширине с «…» */
function fitTxt(t,sz,mw){ t=String(t); if(textW(t,sz)<=mw) return t; while(t.length>1&&textW(t+'…',sz)>mw) t=t.slice(0,-1); return t.replace(/\s+$/,'')+'…'; }
function drawSettings(){ drawBG(2,0,now); swipePager=null; const tp=TAP(); iconBtn(4,4,icBack,()=>goBack(),'back'); T('Настройки',W/2,tp/2-10,17,['#fff','#4ef0ff']); const S=SET();
 const rows=[
  ['Звук',save.mute?'ВЫКЛ':'ВКЛ',!save.mute,()=>setMute(!save.mute),''],
  ['Вибро',S.vib?'ВКЛ':'ВЫКЛ',S.vib,()=>{ S.vib=!S.vib; store(); if(S.vib) haptic('medium'); },inTG?'Telegram HapticFeedback':(navigator.vibrate?'вибромотор телефона':'нет вибро на этом устройстве')],
  ['Ночь',{auto:'АВТО',on:'ВКЛ',off:'ВЫКЛ'}[S.night],S.night!=='off',()=>{ S.night={auto:'on',on:'off',off:'auto'}[S.night]; store(); },S.night==='auto'?'по часам: 20:00–6:00'+(isNight()?' (сейчас ночь)':''):'фонарики у слизней'],
  ['Наклон',S.gyro?(gyro.on?'ВКЛ':'…'):'ВЫКЛ',S.gyro,()=>{ S.gyro=!S.gyro; store(); if(S.gyro) gyroStart(); else gyroStop(); },gyro.msg||(gyro.on?'наклон: '+Math.round(gyro.g)+'°':'наклоняй телефон — гравитация чуть съедет')],
  ['Меньше движения',S.rm?'ВКЛ':'ВЫКЛ',S.rm,()=>{ S.rm=!S.rm; store(); sfx('uiToggle',S.rm); },'без тряски и качания, быстрые переходы'],
  ['Слизни в меню',S.mfl?'ВКЛ':'ВЫКЛ',S.mfl,()=>{ S.mfl=!S.mfl; store(); sfx('uiToggle',S.mfl); },'можно оттянуть и запустить, как в игре'],
  ['Крик',S.mic?(mic.on?'ВКЛ':'…'):'ВЫКЛ',S.mic,()=>{ S.mic=!S.mic; store(); if(S.mic) micStart(); else micStop(); },mic.msg||(mic.on?'громкость: '+'▮'.repeat(Math.min(10,Math.round(mic.lvl*40)))+(mic.lvl>.16?' АААА!':''):'крикни в полёте — слизень ускорится')]];
 const rh=Math.max(tp+16,Math.min(74,Math.floor((H-tp-44)/rows.length))); const cmp=rh<tp+30; rows.forEach(([nm,val,on,cb,sub],i)=>{ const y=tp+20+i*rh; panel(12,y,W-24,rh-6,'#2b1a4a'); T(nm,24,y+(cmp?4:8),cmp?13:15,'#fff','l'); const ssz=cmp?9:10, SL=textW(sub,ssz)>W-176&&rh-6>=40?wrapTxt(sub,ssz,W-176).slice(0,2):null; if(SL){ const lh=Math.max(TMIN,ssz)+3; SL.forEach((ln,j)=>T(ln,24,y+rh-6-4-lh*(SL.length-j),ssz,sub===gyro.msg||sub===mic.msg?'#ff8ab0':'#c8b8e0','l')); } else T(fitTxt(sub,cmp?9:10,W-176),24,y+rh-(cmp?22:28),cmp?9:10,sub===gyro.msg||sub===mic.msg?'#ff8ab0':'#c8b8e0','l');
  const by=y+Math.max(2,Math.round((rh-6-tp)/2)); btn(W-118,by,96,tp,val,()=>{ const was=!!on; cb(); if(i!==4&&i!==5) sfx('uiToggle',!was); },on?'#4ed05a':'#6a5a7a',14); buttons[buttons.length-1].label='set'+i;
  { const A=togA[i]||(togA[i]={on:!!on,t0:-9}); if(A.on!==!!on){ A.on=!!on; A.t0=now; } const f=RM()?1:EASE.outQuad(Math.min(1,(now-A.t0)/UIA.toggle)), p=A.on?f:1-f; const sx=W-148, sy=by+((tp-12)>>1); ctx.fillStyle='#120818'; ctx.fillRect(sx,sy,24,12); ctx.fillStyle=p>=.5?'#4ed05a':'#6a5a7a'; ctx.fillRect(sx+1,sy+1,22,10); const kx=sx+1+Math.round(p*12); ctx.fillStyle='#120818'; ctx.fillRect(kx,sy+1,10,10); ctx.fillStyle='#fff'; ctx.fillRect(kx+1,sy+2,8,8); } });
 T('микрофон и датчики — только по твоему тапу',W/2,tp+20+rows.length*rh+4,10,'#a898c8'); }
const GEARF=[0,1,2,3].map(k=>{ const a=-k*Math.PI/12, ca=Math.cos(a), sa=Math.sin(a); const inG=(x,y)=>(Math.abs(x)<3&&Math.abs(y)<6)||(Math.abs(x)<6&&Math.abs(y)<3)||(Math.abs(x)<5&&Math.abs(y)<5); const hole=(x,y)=>Math.abs(x)<2&&Math.abs(y)<2; const P=[],H=[]; for(let y=-7;y<7;y++)for(let x=-7;x<7;x++){ const cx=x+.5, cy=y+.5, rx=cx*ca-cy*sa, ry=cx*sa+cy*ca; if(hole(rx,ry)) H.push([x,y]); else if(inG(rx,ry)) P.push([x,y]); } return [P,H]; });
let gearT=-9, gearP=false;
function icGear(){ const pr=pressed&&pressed.label==='settings'; if(pr&&!gearP) gearT=now; gearP=!!pr; if(!RM()&&(pr||now-gearT<.24)){ const k=pr?Math.min(3,Math.floor((now-gearT)/.03)):Math.max(0,3-Math.floor((now-gearT-.12)/.03)); const [P,H]=GEARF[Math.max(0,Math.min(3,k))]; ctx.fillStyle='#fff'; for(const [x,y] of P) ctx.fillRect(x,y,1,1); ctx.fillStyle='#6a4fd8'; for(const [x,y] of H) ctx.fillRect(x,y,1,1); return; }
 if(false){ ctx.fillStyle='#fff'; ctx.fillRect(-1,-7,2,14); ctx.fillRect(-7,-1,14,2); for(let k=-4;k<=4;k++){ ctx.fillRect(k-1,-Math.abs(k)+(-4+Math.abs(k))*0,2,1); } ctx.fillRect(-5,-5,10,10); ctx.fillRect(-6,-6,2,2); ctx.fillRect(4,-6,2,2); ctx.fillRect(-6,4,2,2); ctx.fillRect(4,4,2,2); ctx.fillStyle='#6a4fd8'; ctx.fillRect(-2,-2,4,4); return; } ctx.fillStyle='#fff'; ctx.fillRect(-3,-6,6,12); ctx.fillRect(-6,-3,12,6); ctx.fillRect(-5,-5,10,10); ctx.fillStyle='#6a4fd8'; ctx.fillRect(-2,-2,4,4); }
// ---------- 7: выбор команды эстафеты ----------
function drawRelayPick(){ drawBG(0,0,now); swipePager=null; const tp=TAP(); iconBtn(4,4,icBack,()=>goBack(),'back'); T('Эстафета',W/2,tp/2-10,17,['#fff','#ffb03c']); T('собери команду из 3 слизней',W/2,tp/2+10,10,'#fff3d8');
 const pool=CHARS.map((c,i)=>i).filter(i=>unlocked(i)), cols=4, cw=Math.floor((W-16)/cols), chh=Math.max(TAP()+12,58), rows=Math.min(Math.ceil(pool.length/cols),Math.max(3,Math.floor((H-tp*3-150)/chh)));
 const per=cols*rows, pages=Math.ceil(pool.length/per); if(selPage>=pages) selPage=0;
 pool.slice(selPage*per,selPage*per+per).forEach((i,k)=>{ const c=CHARS[i], x=8+(k%cols)*cw, y=tp+24+Math.floor(k/cols)*chh, n=relayPick.indexOf(i); panel(x+1,y,cw-2,chh-3,n>=0?'#6a3a1a':'#2b1a4a');
  ctx.save(); ctx.beginPath(); ctx.rect(x+2,y+1,cw-4,chh-5); ctx.clip(); drawSlug(c.id,'idle',frameOf('idle',now+i*.3),x+cw/2,y+chh-20); ctx.restore(); T(c.name.length>9?c.name.slice(0,8)+'…':c.name,x+cw/2,y+chh-16,9,'#fff'); if(n>=0) T(String(n+1),x+6,y+3,14,'#ffd23c','l');
  buttons.push({x,y,w:cw,h:chh-3,label:'r'+i,cb:()=>{ const j=relayPick.indexOf(i); if(j>=0) relayPick.splice(j,1); else if(relayPick.length<3) relayPick.push(i); else { relayPick.shift(); relayPick.push(i); } sfx('candy',relayPick.length); haptic('tick'); }}); });
 let y=tp+24+rows*chh+4; if(pages>1){ pager(y,selPage,pages,v=>selPage=v,'rp'); y+=tp+4; }
 panel(12,y,W-24,40,'#22143e'); T(relayPick.length?relayPick.map(i=>CHARS[i].name).join(' → '):'тапни трёх по порядку',W/2,y+12,12,relayPick.length===3?'#ffd23c':'#e8dcff');
 const ok=relayPick.length===3; btn(W/2-80,Math.min(H-tp-6,y+50),160,tp,ok?'ПОЕХАЛИ':'нужно 3',()=>{ if(!ok){ lockNo(); return; } sfx('win'); relayTeam=relayPick.slice(); fusion=null; useSecret=false; scene='levels'; },ok?'#ff9a1c':'#4a3a5a',16); buttons[buttons.length-1].label='relaygo';
 const hy=Math.min(H-30,y+56+tp); T('каждый бросок — следующий слизень,',W/2,hy,10,'#c8b8e0'); T('с того места, где шмякнулся прошлый. +1 бросок',W/2,hy+14,10,'#c8b8e0'); }
// ---------- меню v4 ----------
// ---------- FB8: «Режим Насти» — 5 быстрых тапов по любому слизню внизу главного меню → бесконечные жизни до закрытия игры (НЕ сохраняется) ----------
let nastya=false, nTaps=[];
function nastyaTap(m){ m.vy=-210; m.vx=0; nTaps=nTaps.filter(t=>now-t<2.5); nTaps.push(now); const n=nTaps.length; sfx('candy',n%4); haptic('tick'); const mx=m.x-ox, my=m.y-40-oy;
 if(nastya){ floats.push({s:'♥ Режим Насти уже включён ♥',x:W/2-ox,y:H*.62-oy,t:0,life:1.2,size:11,col:'#ff8ad0'}); nTaps=[]; return; }
 floats.push({s:'♥'.repeat(n),x:mx,y:my,t:0,life:.9,size:11,col:'#ff5aa8'}); burst(mx,my+20,4+n*2,['#ff4a8a','#ffb0d8'],70,40,.6);
 if(n>=5){ nTaps=[]; nastya=true; sfx('win'); haptic('success'); flash=.12; for(let k=0;k<4;k++) setTimeout(()=>burst(W*(k+1)/5-ox,H*.45-oy,26,['#ff4a8a','#ff8ad0','#ffd0ea','#fff'],180,70,1.2,120),k*120);
  floats.push({s:'Режим Насти: ♥ ∞',x:W/2-ox,y:H*.70-oy,t:0,life:3.2,size:18,col:['#ffd0ea','#ff4a8a'],pop:1}); floats.push({s:'бесконечные жизни — до выхода из игры',x:W/2-ox,y:H*.70-oy+26,t:0,life:3.2,size:10,col:'#ffe0f0'}); } }
/* FB22: главное меню — группы вместо 6 одинаковых радужных кнопок: ИГРАТЬ (герой) + МОИ СЛИЗНИ / РЕЖИМЫ / КОЛЛЕКЦИЯ, по одному цветовому семейству на группу, пиксельные иконки */
let MENU_VAR='A';
const MICON={play:['11......','1111....','111111..','11111111','111111..','1111....','11......'],
 slug:['..1.1...','..1.1...','.11111..','1111111.','1121211.','1111111.','.111111.'],
 house:['...11...','..1111..','.111111.','11111111','.112211.','.112211.','.111111.'],
 chaos:['....111.','...111..','..111...','.111111.','...111..','..111...','.111....'],
 relay:['1.......','1111....','11111...','1111111.','1.......','1.......','1.......'],
 quests:['.111111.','1122221.','1111111.','1122221.','1111111.','1122211.','.111111.'],
 book:['1111111.','1211111.','1212221.','1211111.','1212221.','1211111.','1111111.'],
 lock:['..111...','.1...1..','.1...1..','1111111.','1112111.','1112111.','1111111.']};
function micon(k,x,y,c1='#fff',c2='#1a0c22',sc=1){ const P=MICON[k]; if(!P) return; for(let r=0;r<P.length;r++) for(let q=0;q<P[r].length;q++){ const ch=P[r][q]; if(ch==='.') continue; ctx.fillStyle='#1a0c22'; ctx.fillRect(x+q*sc+1,y+r*sc+1,sc,sc); } for(let r=0;r<P.length;r++) for(let q=0;q<P[r].length;q++){ const ch=P[r][q]; if(ch==='.') continue; ctx.fillStyle=ch==='1'?c1:c2; ctx.fillRect(x+q*sc,y+r*sc,sc,sc); } }
function mbtn(x,y,w,h,id,label,icon,col,cb,size=14,tile=false){ const A=bAnim(id,x); btnSilent=true; btn(x,y,w,h,id,cb,col,size); btnSilent=false; const yy=y+A.oy; x+=A.ox; const sc=h>=22?2:1;
 if(tile){ micon(icon,Math.round(x+w/2-8*sc/2),Math.round(yy+5),'#fff','#1a0c22',sc); T(label,x+w/2,yy+h-size-8,size,'#fff','c','#1a0c22'); }
 else { const tw=textW(label,size), iw=8*sc+5, x0=Math.round(x+w/2-(tw+iw)/2); micon(icon,x0,Math.round(yy+(h-4)/2-3.5*sc),'#fff','#1a0c22',sc); T(label,x0+iw,yy+(h-4)/2-size*.55,size,'#fff','l','#1a0c22'); } }
function secHead(t,x,w,y,col){ x=Math.round(x); y=Math.round(y); w=Math.round(w); const tw=Math.round(textW(t,9)); ctx.fillStyle=col; const cx=Math.round(x+w/2); ctx.fillRect(x+2,y+6,Math.max(0,Math.round(w/2-tw/2-8)),1); ctx.fillRect(Math.round(cx+tw/2+6),y+6,Math.max(0,Math.round(w/2-tw/2-8)),1); ctx.fillRect(x,y+5,2,3); ctx.fillRect(x+w-2,y+5,2,3); T(t,cx,y,9,col); }
function menuButtons(ty,v){ const tp=TAP(), gap=8, chaosOk=totalStars()>=CHAOS_STARS, qr=questReady();
 const act={ slugs:()=>{scene='select';}, house:()=>{scene='house';}, chaos:()=>{ if(!chaosOk){ uiNo('chaos'); haptic('error'); floats.push({s:'Хаос откроется на ★'+CHAOS_STARS,x:W/2-ox,y:ty+60-oy,t:0,life:1.4,size:11,col:'#ffd23c'}); return 'x'; } sfx('win'); relayTeam=null; chaosStart(); return 'x'; },
  relay:()=>{ relayPick=relayTeam?relayTeam.slice():[]; selPage=0; scene='relay'; }, quests:()=>{ scene='quests'; }, bestiary:()=>{ bestPage=0; scene='bestiary'; } };
 const go=id=>()=>{ const r=act[id](); if(r!=='x'){ sfx('tap'); tgBack(true); } };
 const GR=[['МОИ СЛИЗНИ','#ffb0d8',[['slugs','СЛИЗНИ','slug','#ff5aa8'],['house','ДОМИК','house','#e0508c']]],
  ['РЕЖИМЫ','#d8b8ff',[['chaos',chaosOk?'ХАОС':'ХАОС ★'+CHAOS_STARS,chaosOk?'chaos':'lock',chaosOk?'#9a4ae0':'#4a3a5a'],['relay','ЭСТАФЕТА','relay','#7a5ae8']]],
  ['КОЛЛЕКЦИЯ','#9af0e0',[['quests','ЗАДАНИЯ','quests',qr?'#22b07a':'#2a9a88'],['bestiary','БЕСТИАРИЙ','book','#2a88a8']]]];
 const tw0=Math.min(W-24,312), gx=Math.round(W/2-tw0/2), cw=Math.floor((tw0-gap)/2);
 const avail=(H-62)-(ty+60); // до земли с гуляющими слизнями
 if(v==='A'){ const ex0=avail-(tp+10+gap+3*(15+tp+2+gap)+34), grow=Math.max(0,Math.min(8,Math.floor(ex0/10))); const hh=tp+10+grow, bh=tp+2+grow, sh=15, rowH=sh+bh+gap; const need=hh+gap+3*rowH+34; const by=Math.round(ty+60+Math.max(4,Math.min(40,(avail-need)/3)));
  uiPrime='play'; mbtn(W/2-Math.min(tw0,250)/2,by,Math.min(tw0,250),hh,'play','ИГРАТЬ','play','#4ed05a',()=>{sfx('tap');relayTeam=null;scene='levels';tgBack(true);},20);
  let y=by+hh+gap+2; for(const [hd,hc,items] of GR){ secHead(hd,gx,tw0,y,hc); y+=sh; items.forEach(([id,lb,ic,col],k)=>{ const x=gx+k*(cw+gap); mbtn(x,y,cw,bh,id,lb,ic,col,go(id),lb.length>9?12:14); if(id==='quests'&&qr) numBadge(x+cw-8,y+7,qr); }); y+=bh+gap; }
  return y+2; }
 // B: три панели-рамки, внутри плитки (иконка сверху, подпись снизу)
 const hh=tp+10, th2=Math.max(tp+8,Math.min(58,Math.floor((avail-hh-60)/3)-20)), ph=th2+24; const need=hh+gap+3*(ph+6)+30; const by=Math.round(ty+60+Math.max(4,Math.min(24,(avail-need)/2)));
 uiPrime='play'; mbtn(W/2-Math.min(tw0,250)/2,by,Math.min(tw0,250),hh,'play','ИГРАТЬ','play','#4ed05a',()=>{sfx('tap');relayTeam=null;scene='levels';tgBack(true);},20);
 let y=by+hh+gap+2; for(const [hd,hc,items] of GR){ ctx.fillStyle='#120818'; ctx.fillRect(gx-4,y,tw0+8,ph); ctx.fillStyle='rgba(30,16,52,.85)'; ctx.fillRect(gx-3,y+1,tw0+6,ph-2); ctx.fillStyle=hc; ctx.fillRect(gx-3,y+1,tw0+6,1); const tw=Math.ceil(textW(hd,9))+10; ctx.fillStyle='#120818'; ctx.fillRect(gx+4,y-5,tw+2,13); ctx.fillStyle=hc; ctx.fillRect(gx+5,y-4,tw,11); T(hd,gx+5+tw/2,y-4,9,'#1a0c22','c','#ffffff');
  items.forEach(([id,lb,ic,col],k)=>{ const x=gx+k*(cw+gap); mbtn(x,y+12,cw,th2,id,lb,ic,col,go(id),lb.length>9?11:13,true); if(id==='quests'&&qr) numBadge(x+cw-8,y+19,qr); }); y+=ph+6; }
 return y+2; }
function drawMenuV4(){ drawBG(0,Math.sin(now*.2)*30,now); const night=isNight();
 const gy=H-60; ctx.fillStyle='#2a1838'; ctx.fillRect(0,gy+16,W,H-gy);
 themeOfCur=0; if(!bgCache.menuGround){ const [c,x]=mk(W,60); blockPaint(x,[-2,0,W+4,60],THEMES[0],'g',5); bgCache.menuGround=c; } ctx.drawImage(bgCache.menuGround,0,gy+16);
 if(night){ ctx.fillStyle='rgba(6,6,30,.55)'; ctx.fillRect(0,0,W,H); seed=12; for(let i=0;i<30;i++){ const sx=rnd()*W|0, sy=rnd()*H*.5|0; if((now*2+i)%5>.6){ ctx.fillStyle='#fff'; ctx.fillRect(sx,sy,1,1);} } }
 if(isHalloween()) for(let i=0;i<4;i++){ const px=Math.round(W*(i+.5)/4), py=gy+14; dsc(px,py,6,'#ff8a1c'); ctx.fillStyle='#3a8a2a'; ctx.fillRect(px-1,py-9,2,3); ctx.fillStyle='#1a0c22'; ctx.fillRect(px-3,py-2,2,2); ctx.fillRect(px+2,py-2,2,2); ctx.fillRect(px-2,py+2,5,1); if(night){ ctx.fillStyle='#ffe066'; ctx.fillRect(px-3,py-2,1,1); ctx.fillRect(px+2,py-2,1,1);} }
 if(isNewYear()){ seed=5; for(let i=0;i<50;i++){ const sx=(rnd()*W+now*10*(rnd()+.2))%W|0, sy=(rnd()*H+now*30*(rnd()+.3))%H|0; ctx.fillStyle='#fff'; ctx.fillRect(sx,sy,1,1); if(i%5===0){ ctx.fillRect(sx-1,sy,3,1); ctx.fillRect(sx,sy-1,1,3);} } }
 mflDrawAim(); mflDrawExtra(); for(const m of menuSlugs){ const a=m.fl||m.vy<0||m.y<m.gy-1?'fly':'idle'; mflTrail(m); drawSlugM(m.id,a,frameOf(a,now+m.o),Math.round(m.x),Math.round(m.y),m.flip,1+(m.sq||0)*.25,1-(m.sq||0)*.25); if(now-(m.oj||-9)<.6) ojFace(m.id,a,frameOf(a,now+m.o),Math.round(m.x)+(!RM()&&now-(m.sh||-9)<.15?(((now*50)|0)%2?1:-1):0),Math.round(m.y),m.flip); else if(m.fl&&TIMID.has(m.id)) squint(m.id,a,frameOf(a,now+m.o),Math.round(m.x),Math.round(m.y),m.flip); if(m.id==='slugX') secretTwinkle(m.x,m.y,now); mflHint(m,night||mflSleep(m)); if(!m.fl) buttons.push({x:Math.round(m.x-Math.max(20,TAP()/2)),y:Math.round(m.gy-44),w:Math.max(40,TAP()),h:52,label:'ms_'+m.id,cb:()=>mflTap(m,night)}); if(nastya&&a==='idle'){ ctx.fillStyle='#ff4a8a'; const hx=Math.round(m.x-2), hy=Math.round(m.y-46+Math.sin(now*3+m.o)*2); ctx.fillRect(hx,hy,2,2); ctx.fillRect(hx+3,hy,2,2); ctx.fillRect(hx,hy+2,5,1); ctx.fillRect(hx+1,hy+3,3,1); ctx.fillRect(hx+2,hy+4,1,1); } if(night&&a==='idle'){ const lx=Math.round(m.x+12), ly=Math.round(m.y-14); ctx.fillStyle='#1a0c22'; ctx.fillRect(lx-3,ly,6,7); ctx.fillStyle=(now*10+m.o*7|0)%9?'#ffe066':'#fff6b0'; ctx.fillRect(lx-2,ly+1,4,5); ctx.globalAlpha=.2; ctx.fillRect(lx-6,ly-3,12,13); ctx.globalAlpha=1; } }
 // логотип (тап ×7 — секрет)
 const title='ШМЯКОДРОМ'; const ty=Math.floor(H*.13); const cs=[...title].map(g=>txt(g,26,['#fff6b0','#ffd23c','#ff9a1c','#ff5a3c'],'#2a0c22')); let tw=0; cs.forEach(c=>tw+=c.width-3); let x0=W/2-tw/2; const L0=x0;
 cs.forEach((c,i)=>{ const hop=logoTaps.length&&now-logoTaps[logoTaps.length-1]<.25&&i===(logoTaps.length-1)%9?-6:0; const lh=mfl.hop[i]!==undefined&&now-mfl.hop[i]<.25?-6:0; const b=Math.round(Math.sin(now*4+i*.6)*3)+hop+lh; ctx.drawImage(c,Math.round(x0),ty+b); if(mfl.blink&&now-mfl.blink<1.2&&((now*10)|0)%2){ ctx.globalAlpha=.5; ctx.fillStyle='#fff'; ctx.fillRect(Math.round(x0)+2,ty+b+2,c.width-7,c.height-6); ctx.globalAlpha=1; } x0+=c.width-3; });
 mfl.logo={x:L0,y:ty,w:tw,h:cs[0].height,n:9};
 buttons.push({x:L0,y:ty-4,w:tw,h:44,label:'logo',cb:()=>logoTap()});
 T(isHalloween()?'слизни-рогатки • ШМЯКОУИН!':isNewYear()?'слизни-рогатки • С НОВЫМ ШМЯКОМ!':isApril1()?'слизни-рогатки • усатые с 1 апреля':'слизни-рогатки',W/2,ty+44,13,'#7affe0');
 const tp=TAP(); let my=menuButtons(ty, MENU_VAR);
 iconBtn(W-4-TAP(),4,icMute,()=>setMute(!save.mute),'mute'); iconBtn(4,4,icGear,()=>{sfx('tap');scene='settings';tgBack(true);},'settings');
 if(save.chaos&&save.chaos.best){ T('рекорд хаоса: '+save.chaos.best,W/2,my,10,'#ffb0ff'); my+=14; }
 const tot=uiCount('stars',save.stars.reduce((a,b)=>a+(b||0),0),now,cuTick); const s1=tot+' / '+LV.length*3; starIcon(W/2-98,my+7,true); T(s1,W/2-88,my+4,12,'#ffd23c','l'); T('◆ '+uiCount('gems',gemsHave().length,now,cuTick)+'/'+SECRETS.length,W/2-12,my+4,12,'#7affff','l'); candy(W/2+50,my+11,now,0); { const cv0=uiCount('candy',save.candy|0,now,cuTick), pop=uiCU.candy&&now-uiCU.candy.t0-uiCU.candy.d<.2&&uiCU.candy.d>0&&!RM(); T(String(cv0),W/2+58,my+4,pop?14:12,'#ff8ad0','l'); }
 if(save.legacy) T('+'+save.legacy+' ★ из старой версии',W/2,my+22,10,'#d8c8f0');
 for(const f of floats){ const k=f.t/f.life; T(f.s,f.x+ox,f.y+oy-k*14,f.size,f.col); } }

function relayTick(){ if(!relay||!world||world.result) return; const s=world.s; if(s.st==='idle'&&world.used>relay.sw&&!world.clone&&sAnim.a!=='recover'&&sAnim.a!=='splat'&&!drag&&world.shots>0){ relay.sw=world.used; relay.i=(relay.i+1)%relayTeam.length; const c=CHARS[relayTeam[relay.i]]; world.setChar(c); world.shield=world.has('shield')?1:0; sfx('portal'); haptic('medium'); burst(s.x,s.y,24,[c.col,'#fff','#ffb03c'],120,30,.6); floats.push({s:'Эстафета → '+c.name+'!',x:Math.max(70,Math.min(LW-70,s.x)),y:Math.max(60,s.y-44),t:0,life:1.3,size:13,col:['#fff',c.col],pop:1}); sAnim={a:'recover',t:.3}; } }
function v4Win(lines,stars){ const ch=PC();
 if(world.bossDown&&world.boss){ const k=world.boss.k; if(!Array.isArray(save.boss)) save.boss=[]; const first=!save.boss[k]; save.boss[k]=true; save.stats.bosses++; lines.unshift([(first?'БОСС ПОВЕРЖЕН ВПЕРВЫЕ! ':'Босс повержен! ')+'+1500','#ffd23c',12]); }
 if(chaosRun){ qEv('chaoswin'); return; } qEv('win'); if(stars>=3) qEv('win3star'); if(relay) qEv('relaywin'); if(world.wx) qEv('wxwin'); if(world.has('slowmo')&&!relay) qEv('win_slowmo');
 if(fusion&&!relay&&fusion.level===curLevel){ qEv('hybwin'); if(hybDiscover(fusion.a,fusion.b)) lines.push(['✦ '+ch.name+' — в бестиарии!','#7affe0',11]); }
 const luck=world.has('lucky')?3:1; if(Math.random()<.08*luck){ const all=hybAll(), got=new Set(hybList()), left=all.filter(([a,b])=>!got.has(hybKey(a,b))); if(left.length){ const [a,b]=left[Math.random()*left.length|0]; hybDiscover(a,b); lines.push(['✦ Редкая находка: '+fusedChar(a,b).name+' ('+CHARS[a].name+'+'+CHARS[b].name+')','#ff9aff',11]); lines.push(['гибрид уже ждёт во вкладке ГИБРИДЫ','#e8dcff',10]); save.hybNew=(save.hybNew|0)+1; sfx('secret'); } }
 if(lines.length>5) lines.length=5; store(); }
// ---------- ввод ----------
function lp(e){ const r=cv.getBoundingClientRect(); return [(e.clientX-r.left)*W/r.width,(e.clientY-r.top)*H/r.height]; }
const hit=(x,y)=>{ for(let i=buttons.length-1;i>=0;i--){const b=buttons[i]; if(x>=b.x&&x<b.x+b.w&&y>=b.y-1&&y<b.y+b.h+2) return b;}
 // A2: страховка — цель касания не меньше 44 CSS px (расширяем вокруг центра, ближайшая кнопка)
 const m=TAP(); let best=null, bd=1e9; for(const b of buttons){ const cx=b.x+b.w/2, cy=b.y+b.h/2, hw=Math.max(b.w,m)/2, hh=Math.max(b.h,m)/2; if(Math.abs(x-cx)<=hw&&Math.abs(y-cy)<=hh){ const d=Math.hypot(x-cx,y-cy); if(d<bd){bd=d;best=b;} } } return best; };
let swipe=null;
cv.addEventListener('pointerdown',e=>{ if(drag&&e.pointerId!==drag.id) return; audioInit(); if(SET().gyro&&!gyro.on&&!gyro.tried) gyroStart(); if(SET().mic&&!mic.on&&!mic.tried) micStart(); const [x,y]=lp(e); if(uiBusy()) return; swipe=(scene!=='play'||overlay)?{x,y,t:performance.now()}:null;
 if(scene==='menu'&&!overlay&&!mfl.drag&&mflFlyTap(x,y)){ mfl.slowId=e.pointerId; return; }
 if(scene==='menu'&&!overlay&&!mfl.drag){ const ms=mflGrab(x,y,e.pointerId); if(ms){ pressed=ms; try{cv.setPointerCapture(e.pointerId)}catch(_){} return; } }
 const b=hit(x,y); if(b){ if(mfl.drag||performance.now()<mfl.ignoreUp) return; pressed=b; sfx('uiDown'); return; }
 if(scene==='play'&&world&&!overlay&&world.s.st==='fly'&&PC().tap){ if(world.has('slowmo')) world.slow=true; world.ability(); return; }
 if(scene==='play'&&world&&!overlay&&world.canLaunch()){ drag={x0:x-ox,y0:y-oy,cx:x-ox,cy:y-oy,id:e.pointerId}; lastPullF=-1; try{cv.setPointerCapture(e.pointerId)}catch(_){} } });
cv.addEventListener('pointermove',e=>{ if(drag&&e.pointerId!==drag.id) return; const [x,y]=lp(e); if(e.pointerType==='mouse'&&!e.buttons){ const hb=hit(x,y); hoverLbl=hb?hb.label:null; cv.style.cursor=hb?'pointer':''; } if(mfl.drag&&e.pointerId===mfl.drag.id){ mflMove(x,y); return; } if(drag){ drag.cx=x-ox; drag.cy=y-oy; const f=Math.round(Math.min(1,Math.hypot(drag.cx-drag.x0,drag.cy-drag.y0)/MAXDRAG)*7); if(f!==lastPullF){ if(lastPullF>=0) {sfx('stretch',f); if(f%2===0)haptic('tick');} lastPullF=f; } }
 else if(pressed){ const b=hit(x,y); if(b!==pressed&&!(b&&b.label===pressed.label)) pressed=null; if(swipe&&Math.abs(x-swipe.x)>24) pressed=null; } });
function up(e){ if(mfl.slowId===e.pointerId){ mfl.slowId=null; for(const m of menuSlugs) m.slow=false; } if(drag&&e.pointerId!==drag.id) return; const [x,y]=lp(e); if(mfl.drag){ if(e.pointerId!==mfl.drag.id) return; if(mflUp(x,y)){ pressed=null; swipe=null; return; } } if(swipe&&swipePager&&scene!=='play'){ const dx=x-swipe.x, dy=y-swipe.y; const sw=swipe; swipe=null; if(Math.abs(dx)>40&&Math.abs(dx)>Math.abs(dy)*1.5&&performance.now()-sw.t<800){ pressed=null; const P=swipePager; sfx('tap'); P.set(dx<0?(P.page+1)%P.pages:(P.page+P.pages-1)%P.pages); return; } } if(world) world.slow=false; if(drag){ const d=drag; drag=null; if(world&&world.launch(d.cx-d.x0,d.cy-d.y0)){ } return; }
 if(pressed){ const b=hit(x,y); const p=pressed; pressed=null; if(performance.now()<mfl.ignoreUp&&!/^ms_/.test(p.label)) return; if(b&&b.label===p.label){ bRel[p.label+'@'+(p.x|0)]=now; if(!/^ms_/.test(p.label)) sfx('uiUp'); cbLabel=p.label; p.cb(); cbLabel=null; } } }
cv.addEventListener('pointerup',up); cv.addEventListener('pointercancel',e=>{ if(mfl.drag&&e.pointerId===mfl.drag.id){ mfl.drag=null; pressed=null; return; } if(drag&&e.pointerId!==drag.id) return; drag=null;pressed=null;});
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
function loop(t){ if(coverMode) return; let dt=(t-last)/1000; if(!(dt>0)) dt=0; dt=Math.min(.05,dt); last=t; if(!document.hidden){ if(fedSess.size&&(scene==='menu'||scene==='house')) endFedSession(); probeTick(dt); update(dt); render(); } requestAnimationFrame(loop); }
function initMenuSlugs(){ const pool=CHARS.filter((c,i)=>unlocked(i)&&!c.fuse); /* гибриды в меню не выходят (26.13.1) */ if(save.eggs&&save.eggs.secret&&SPR.slugX) pool.push(SECRET); let pick=pool.length<=5?pool:[...pool.slice(0,3),...pool.slice(-2)]; { const me=CHARS[save.char]; if(me&&!me.fuse&&pool.includes(me)){ pick=pick.filter(c=>c!==me); if(pick.length>=5) pick.length=4; pick.splice(Math.floor((pick.length+1)/2),0,me); } } mfl.drag=null; mfl.aim=null; menuSlugs=pick.map((c,i)=>({id:c.id,x0:W*(i+1)/(pick.length+1),x:W*(i+1)/(pick.length+1),y:H-60+3,gy:H-60+3,vy:0,vx:0,o:i*.37,flip:i%2===1})); }
let spritesReady=false;
function rescale(){ const ch=resize(); if(ch&&spritesReady&&scene==='menu') initMenuSlugs(); return ch; }
// ---------- FB1: возврат из фона (iOS/Telegram выгружает память канвасов, вьюпорт меняется, пока свёрнуто) ----------
let hiddenAt=0, resumes=0; const probe=mk(2,2); probe[1].fillStyle='#f00'; probe[1].fillRect(0,0,2,2);
function gfxReset(){ bgCache={}; txtCache.clear(); tMeasure.clear(); for(const C of [outlCache,silCache,skinCache,pixCache,grafCache,fuseCache,ancCache]) for(const k in C) delete C[k]; nightC=null; nightX=null;
 for(const k in SPR) if(!(SPR[k] instanceof HTMLImageElement)) delete SPR[k]; buildSecretSprite(); if(typeof candyCache==='object') for(const k in candyCache) delete candyCache[k];
 if(world&&lvlCanvas) lvlCanvas=buildLevelCanvas(LV[curLevel],themeOf(curLevel)); probe[1].fillStyle='#f00'; probe[1].fillRect(0,0,2,2); }
function onHide(){ if(!hiddenAt) hiddenAt=performance.now(); drag=null; pressed=null; swipe=null; if(world) world.slow=false; if(scene==='play'&&world&&!world.result&&!overlay) openPause(); }
function onResume(){ const away=hiddenAt?performance.now()-hiddenAt:0; hiddenAt=0; resumes++; drag=null; pressed=null; swipe=null;
 lastWH=null; resize(); gfxReset(); parts=[]; pops=[]; shake=0; flash=0; last=performance.now(); if(spritesReady&&scene==='menu') initMenuSlugs();
 for(const ms of [50,300,800]) setTimeout(()=>{ if(rescale()) gfxReset(); },ms); return away; }
document.addEventListener('visibilitychange',()=>{ if(document.hidden) onHide(); else onResume(); });
window.addEventListener('pagehide',onHide); window.addEventListener('pageshow',e=>{ if(e.persisted) onResume(); });
try{ cv.addEventListener('contextlost',e=>{ try{e.preventDefault()}catch(_){} }); cv.addEventListener('contextrestored',()=>{ gfxReset(); }); }catch(e){}
try{ if(tg&&tg.onEvent){ tg.onEvent('deactivated',onHide); tg.onEvent('activated',()=>{ if(hiddenAt) onResume(); }); } }catch(e){}
// страховка: если система тихо выкинула память канвасов (проба стала прозрачной) — перестраиваем кэши
let probeT=0; function probeTick(dt){ probeT+=dt; if(probeT<1) return; probeT=0; try{ if(probe[1].getImageData(0,0,1,1).data[3]<255) gfxReset(); }catch(e){} }
tgInit(); rescale();
// первый запуск из кнопки TG «Играть»: expand() меняет высоту чуть позже — пересчитываем на всех событиях
try{ if(tg&&tg.onEvent) tg.onEvent('viewportChanged',rescale); }catch(e){}
window.addEventListener('resize',rescale); for(const ms of [50,300,800]) setTimeout(rescale,ms);
loadSprites().then(()=>{ buildSecretSprite(); if(!unlocked(selPick)) selPick=0; try{ if(save.selHyb&&hybList().includes(save.selHyb)){ const [a,b]=save.selHyb.split('_').map(Number); if(CHARS[a]&&CHARS[b]&&!fuseCheck(a,b)) fusion={a,b,level:null,used:false}; } else if(save.selSecret&&save.eggs&&save.eggs.secret) useSecret=true; }catch(e){} spritesReady=true; initMenuSlugs(); requestAnimationFrame(loop); });
// хуки для тестов
// ---------- Ф1у: переходы, попапы, счётчики ----------
const uiTr={t0:-9,dir:1,iris:0,back:false,from:'',to:'',x:0,y:0};
function uiDur(){ return uiTr.iris?UIA.iris:RM()?UIA.sceneRM:UIA.scene; }
function uiSceneChange(a,b){ uiTr.t0=now; uiTr.dir=uiTr.back?-1:1; uiTr.back=false; uiTr.from=a; uiTr.to=b; uiTr.iris=(b==='play'&&!RM())?1:0; if(world&&b==='play'){ uiTr.x=world.s.x+ox; uiTr.y=world.s.y+oy; }
 if(a==='menu'){ for(const m of menuSlugs){ if(m.fl||m.ret){ m.fl=false; m.ret=false; m.x=m.x0; m.y=m.gy; m.vx=m.vy=0; } } mfl.drag=null; mfl.aim=null; }
 if(b!=='play'&&a!=='play'&&!RM()) sfx('uiUp'); }
const uiSnap={c:null,ok:false}; function uiSnapTake(){ uiSnap.ok=false; if(RM()||scene==='play'||lastScene==='play') return; try{ if(!uiSnap.c) uiSnap.c=document.createElement('canvas'); const c=uiSnap.c; c.width=cv.width; c.height=cv.height; const x=c.getContext('2d'); x.drawImage(cv,0,0); if(tcv&&tcv.width) x.drawImage(tcv,0,0,tcv.width,tcv.height,0,0,c.width,c.height); uiSnap.ok=true; }catch(e){ uiSnap.ok=false; } }
function uiSnapDraw(){ if(!uiSnap.ok||uiTr.iris) return; const f=(now-uiTr.t0)/UIA.scene; if(f>=1||f<0){ if(f>=1) uiSnap.ok=false; return; } const k=cv.width/Math.max(1,cv.getBoundingClientRect().width||cv.width); const e=EASE.outCubic(f); const dx=-Math.round(12*uiTr.dir*e)*Math.max(1,Math.round(cv.width/W)); ctx.save(); ctx.setTransform(1,0,0,1,0,0); ctx.globalAlpha=1-e; ctx.drawImage(uiSnap.c,dx,0); ctx.restore(); }
function uiBusy(){ return now-uiTr.t0<Math.min(.45,uiDur())*.6; }
function uiTrOff(){ if(RM()||uiTr.iris) return 0; const f=(now-uiTr.t0)/UIA.scene; if(f>=1||f<0) return 0; return Math.round(24*uiTr.dir*(1-EASE.outCubic(f))); }
function uiTrDraw(){ const d=uiDur(), f=(now-uiTr.t0)/d; if(f>=1||f<0){ if(tcv) tcv.style.opacity=''; return; }
 if(uiTr.iris){ const r=Math.round(Math.hypot(W,H)*EASE.outQuad(f)); const cx=Math.round(uiTr.x), cy=Math.round(uiTr.y); ctx.fillStyle='#1a0c22'; const st=4; for(let y=0;y<H;y+=st){ const dy=Math.abs(y+st/2-cy); const hw=dy<r?Math.round(Math.sqrt(r*r-dy*dy)/st)*st:-1; if(hw<0){ ctx.fillRect(0,y,W,st); } else { ctx.fillRect(0,y,Math.max(0,cx-hw),st); ctx.fillRect(cx+hw,y,W,st); } } if(tcv) tcv.style.opacity=String(Math.min(1,f*1.5)); return; }
 const a=1-EASE.outCubic(f); ctx.fillStyle=`rgba(26,12,34,${(a*.85).toFixed(3)})`; ctx.fillRect(0,0,W,H); if(tcv) tcv.style.opacity=String((1-a*.85).toFixed(3)); }
function uiPopOff(){ if(RM()||!overlay||overlay.k==='grafview') return 0; const f=Math.min(1,overlayT/UIA.popIn); return Math.round(16*(1-EASE.outBack(f,1.4))); }
let cuLast=0; function cuTick(end){ if(RM()) return; if(end){ sfx('countEnd'); return; } if(performance.now()-cuLast>50){ cuLast=performance.now(); sfx('count'); } }
// ---------- Ф1с: слизни-рогатки в главном меню (26.13) ----------
const mfl={drag:null,aim:null,ignoreUp:0,hop:{},logo:null,blink:0,tw:[],dc:[],dcT:0};
const mflCh=id=>CHARS.find(c=>c.id===id)||(typeof SECRET!=='undefined'&&SECRET.id===id?SECRET:CHARS[0]);
const MFL_R=13;
function mflDay(){ const d=today(); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
function mflGrab(x,y,id){ if(!SET().mfl) return null; for(let i=menuSlugs.length-1;i>=0;i--){ const m=menuSlugs[i]; if(m.fl) continue; const hw=Math.max(20,TAP()/2); if(Math.abs(x-m.x)<=hw&&y>=m.gy-46&&y<=m.gy+10){ mfl.drag={m,x0:x,y0:y,cx:x,cy:y,id,t:performance.now(),act:false}; return buttons.find(b=>b.label==='ms_'+m.id)||{label:'ms_'+m.id,x:m.x,cb:()=>{}}; } } return null; }
function mflMove(x,y){ const d=mfl.drag; d.cx=x; d.cy=y; const l=Math.hypot(x-d.x0,y-d.y0); if(!d.act&&l>=8){ const m=d.m; if(mflSleep(m)){ return; } if(menuSlugs.filter(q=>q.fl).length>=3){ m.nudge=now; return; } d.act=true; pressed=null; lastPullF=-1; } if(d.act){ const f=Math.round(Math.min(1,l/MAXDRAG)*7); if(f!==lastPullF){ if(lastPullF>=0){ sfx('stretch',f); if(f%2===0) haptic('tick'); } lastPullF=f; } mfl.aim=mflCh(d.m.id).ab==='preview'?mflPathB(d.m,d.cx-d.x0,d.cy-d.y0,70):mflPath(d.m,d.cx-d.x0,d.cy-d.y0,40); } }
function mflVel(m,dx,dy){ const l=Math.hypot(dx,dy); if(l<8) return null; const k=Math.min(l,MAXDRAG)/l, v=560*K*mflCh(m.id).power/MAXDRAG; return [-dx*k*v,-dy*k*v]; }
/* тот же шаг, что World.previewPath: 1/60 с, подшаги ≤5 px, 4..24 */
function mflStep(b,g,dt){ const n=Math.min(24,Math.max(4,Math.ceil(Math.hypot(b.vx,b.vy)*dt/5))), h=dt/n; for(let i=0;i<n;i++){ b.vy+=g*h; if(b.vy>900*K) b.vy=900*K; if(b.vy<-900*K) b.vy=-900*K; if(b.vx>1100*K) b.vx=1100*K; if(b.vx<-1100*K) b.vx=-1100*K; b.x+=b.vx*h; b.y+=b.vy*h; if(b.coll&&b.coll(b)) return; } }
function mflPath(m,dx,dy,N){ const v=mflVel(m,dx,dy); if(!v) return null; const ch=mflCh(m.id); const b={x:m.x,y:m.y-MFL_R,vx:v[0],vy:v[1]}; const pts=[]; for(let i=0;i<N;i++){ mflStep(b,G0*ch.grav,1/60); if(b.x<MFL_R||b.x>W-MFL_R||b.y<MFL_R||b.y>m.gy-MFL_R+1) break; pts.push([b.x,b.y]); } return pts; }
function mflPathB(m,dx,dy,N){ const v=mflVel(m,dx,dy); if(!v) return null; const ch=mflCh(m.id); const b={x:m.x,y:m.y-MFL_R,vx:v[0],vy:v[1]}; const pts=[]; for(let i=0;i<N;i++){ mflStep(b,G0*ch.grav,1/60); if(b.x<MFL_R){b.x=MFL_R;b.vx=-b.vx*(ch.rest||.4);} if(b.x>W-MFL_R){b.x=W-MFL_R;b.vx=-b.vx*(ch.rest||.4);} if(b.y<MFL_R){b.y=MFL_R;b.vy=-b.vy*(ch.rest||.4);} if(b.y>m.gy-MFL_R+1) break; pts.push([b.x,b.y]); } return pts; }
function mflUp(x,y){ const d=mfl.drag; mfl.drag=null; mfl.aim=null; if(!d||!d.act) return false; const m=d.m, v=mflVel(m,d.cx-d.x0,d.cy-d.y0); mfl.ignoreUp=performance.now()+150; if(!v) return true; m.fl=true; m.ret=false; m.vx=v[0]; m.vy=v[1]; m.y-=MFL_R; m.cy=true; m.bn=0; m.stuck=0; m.flip=m.vx<0; m.trail=[]; sfx('fling'); haptic('light');
 const sv=save.mfl, dk=mflDay(); if(sv.d!==dk){ sv.d=dk; sv.n=0; } sv.n++; store(); qEv('mfl5'); return true; }
/* 26.13.5: способности по тапу в полёте; остальные — ловим в воздухе (P2) */
function mflFlyTap(x,y){ if(!SET().mfl) return false; for(const m of menuSlugs){ if(!m.fl||Math.hypot(x-m.x,y-m.y)>Math.max(26,TAP()/2)) continue; const ch=mflCh(m.id), ab=ch.ab;
  if(m.abU&&ab!=='slowmo') return true;
  if(ab==='chute'){ m.chute=true; } else if(ab==='ghost'){ m.ghost=true; } else if(ab==='gflip'){ m.gf=-1; } else if(ab==='dive'){ m.vx*=.2; m.vy=900*K; if(!RM()) burst(m.x-ox,m.y-oy,6,['#7ac8ff','#fff'],50,60,.4); }
  else if(ab==='split'){ mfl.tw.push({id:m.id,x:m.x,y:m.y,vx:-m.vx,vy:m.vy,t0:now,col:ch.col}); } else if(ab==='slowmo'){ m.slow=true; return true; }
  else { m.vx=0; m.vy=0; floats.push({s:'поймал!',x:m.x-ox,y:Math.max(30,m.y-30)-oy,t:0,life:.8,size:10,col:'#fff'}); }
  m.abU=true; sfx('boing'); haptic('light'); return true; } return false; }
function mflSleep(m){ if(m.awake) return false; if(isNight()) return true; try{ return !!houseAsleep(mflCh(m.id)); }catch(e){ return false; } }
function mflExtra(dt){ const g=G0; for(let i=mfl.tw.length-1;i>=0;i--){ const q=mfl.tw[i]; mflStep(q,g,dt); if(q.x<MFL_R){q.x=MFL_R;q.vx=-q.vx*.5;} if(q.x>W-MFL_R){q.x=W-MFL_R;q.vx=-q.vx*.5;} if(q.y<MFL_R){q.y=MFL_R;q.vy=Math.abs(q.vy)*.5;} if(q.y>H-60+3-MFL_R){q.y=H-60+3-MFL_R;q.vy=-Math.abs(q.vy)*.4;q.vx*=.7;} if(now-q.t0>1.5){ if(!RM()) burst(q.x-ox,q.y-oy,10,[q.col,'#fff'],70,0,.4); sfx('pop'); mfl.tw.splice(i,1); } }
 const mg=menuSlugs.find(m=>mflCh(m.id).ab==='magnet'); if(!mg){ mfl.dc=[]; return; } if(now>mfl.dcT){ mfl.dcT=now+20; if(mfl.dc.length<3) mfl.dc.push({x:Math.round(40+Math.random()*(W-80)),y:Math.round(H*.55+Math.random()*H*.15),o:Math.random()*6,v:0}); }
 for(let i=mfl.dc.length-1;i>=0;i--){ const c=mfl.dc[i]; if(mg.fl){ const dx=mg.x-c.x, dy=mg.y-c.y, d=Math.hypot(dx,dy); if(d<90){ c.v=Math.min(600,c.v+1400*dt); c.x+=dx/d*c.v*dt; c.y+=dy/d*c.v*dt; c.tr=1; } if(d<MFL_R+4){ mfl.dc.splice(i,1); sfx('candy'); if(!RM()) burst(c.x-ox,c.y-oy,6,['#ffd23c','#fff'],50,0,.3); floats.push({s:'чпок',x:c.x-ox,y:c.y-20-oy,t:0,life:.6,size:9,col:'#ffd23c',combo:1}); } } } }
function mflDrawExtra(){ for(const q of mfl.tw){ ctx.globalAlpha=now-q.t0>1.2?.5:1; drawSlugM(q.id,'fly',frameOf('fly',now),Math.round(q.x),Math.round(q.y+MFL_R),q.vx<0,1,1); ctx.globalAlpha=1; }
 for(const c of mfl.dc){ const cx=Math.round(c.x), cy=Math.round(c.y+(c.tr?0:Math.sin(now*2+c.o)*3)); if(c.tr){ ctx.fillStyle='#ffd23c'; ctx.fillRect(cx-1,cy+4,2,2); } ctx.fillStyle='#1a0c22'; ctx.fillRect(cx-4,cy-3,8,6); ctx.fillStyle='#ff8ab0'; ctx.fillRect(cx-3,cy-2,6,4); ctx.fillStyle='#fff'; ctx.fillRect(cx-2,cy-2,2,1); ctx.fillStyle='#ff4a8a'; ctx.fillRect(cx-6,cy-1,2,2); ctx.fillRect(cx+4,cy-1,2,2); }
 for(const m of menuSlugs){ if(!m.fl) continue; const x=Math.round(m.x), y=Math.round(m.y); if(m.chute){ ctx.fillStyle='#1a0c22'; ctx.fillRect(x-11,y-31,22,7); ctx.fillStyle='#ff6a3c'; ctx.fillRect(x-10,y-30,20,5); ctx.fillStyle='#fff'; ctx.fillRect(x-4,y-30,8,5); ctx.fillStyle='#e8dcff'; ctx.fillRect(x-9,y-25,1,10); ctx.fillRect(x+8,y-25,1,10); } if(m.ghost){ ctx.fillStyle='rgba(232,220,255,.5)'; ctx.fillRect(x-1,y+12,2,2); ctx.fillRect(x-5,y+16,2,2); } } }
function mflTap(m,night){ if((night||mflSleep(m))&&!m.awake){ m.awake=true; m.wake=now; m.vy=-120; floats.push({s:'Ммм… зачем?',x:m.x-ox,y:m.gy-64-oy,t:0,life:1.4,size:10,col:'#e8dcff'}); sfx('grumble',1); return; } m.wake=now; nastyaTap(m); }
function mflUpdate(dt){ mflExtra(dt); mflMeet(); const night=isNight(); for(const m of menuSlugs){ if(m.awake&&now-(m.wake||0)>15&&!m.fl&&!m.ret) m.awake=false; if(!m.fl&&!m.ret) continue;
  if(m.ret){ if(m.rest>now) continue; const dx=m.x0-m.x; if(Math.abs(dx)<1){ m.x=m.x0; m.ret=false; m.rsp=undefined; continue; } if(m.rsp===undefined) m.rsp=Math.max(40,Math.abs(dx)/3.5); m.x+=Math.sign(dx)*Math.min(Math.abs(dx),m.rsp*dt); if(Math.abs(m.x0-m.x)<1) m.rsp=undefined; m.flip=dx<0; continue; }
  const ch=mflCh(m.id), b={x:m.x,y:m.y,vx:m.vx,vy:m.vy,coll:null}; let hitW=null; b.coll=q=>{ const L=mfl.logo; if(L&&q.x>L.x-MFL_R&&q.x<L.x+L.w+MFL_R&&q.y>L.y-MFL_R&&q.y<L.y+L.h+MFL_R&&!m.ghost){ hitW=L; return true; } return false; };
  if(m.stick){ if(now<m.stick) continue; m.stick=0; m.vy=40; }
  const sd=m.slow?dt*.35:dt; mflStep(b,G0*ch.grav*(m.gf||1),sd); if(ch.ab==='glide'&&b.vy>70*K) b.vy=70*K; if(m.chute&&b.vy>50*K){ b.vy=50*K; b.vx*=.98; } m.x=b.x; m.y=b.y; m.vx=b.vx; m.vy=b.vy; const rest=Math.max(.25,ch.rest||.4);
  if(hitW){ const L=hitW; const cx=Math.max(L.x,Math.min(L.x+L.w,m.x)), cyy=Math.max(L.y,Math.min(L.y+L.h,m.y)); let nx=m.x-cx, ny=m.y-cyy; const dd=Math.hypot(nx,ny)||1; if(dd<1e-3){ ny=m.vy>0?-1:1; nx=0; } else { nx/=dd; ny/=dd; } m.x=cx+nx*(MFL_R+1); m.y=cyy+ny*(MFL_R+1); const vn=m.vx*nx+m.vy*ny; if(vn<0){ m.vx-=(1+rest)*vn*nx; m.vy-=(1+rest)*vn*ny; }
   const li=Math.max(0,Math.min(8,Math.floor((cx-L.x)/(L.w/9)))); mfl.hop[li]=now; sfx('logoBonk',li); haptic('light'); mflLetter(li); m.bn++; }
  if(m.x<MFL_R){ m.x=MFL_R; if(m.vx<0){ m.vx=-m.vx*rest; mflBump(m,-1,0); mflWall(m,ch); } } if(m.x>W-MFL_R){ m.x=W-MFL_R; if(m.vx>0){ m.vx=-m.vx*rest; mflBump(m,1,0); mflWall(m,ch); } } if(m.y<MFL_R){ m.y=MFL_R; if(m.vy<0||m.gf<0){ const iv=Math.abs(m.vy); m.vy=Math.abs(m.vy)*rest; mflBump(m,0,-1,iv); if(m.gf<0){ m.gf=1; m.vy=Math.max(m.vy,40); } } }
  const gy=m.gy-MFL_R; if(m.y>gy){ m.y=gy; const imp=m.vy; if(m.vy>0){ m.vy=-m.vy*rest; m.vx*=.7; if(imp>120) mflBump(m,0,1,imp); } if(Math.abs(m.vy)<90){ m.fl=false; m.chute=false; m.ghost=false; m.gf=1; m.slow=false; m.abU=false; m.y=m.gy; m.vx=m.vy=0; m.sq=1; m.ret=true; m.rest=now+2; if(!RM()) burst(m.x-ox,m.gy-oy,8,[ch.col,'#fff'],70,40,.4); } }
  if(m.fl){ const sp=Math.hypot(m.vx,m.vy); m.stuck=sp<5?(m.stuck||0)+dt:0; if(m.stuck>1){ m.vy=60; m.y+=1; } if(isNight()){ m.trail=m.trail||[]; m.trail.push([m.x|0,m.y|0]); if(m.trail.length>14) m.trail.shift(); } } } }
function mflWall(m,ch){ if(ch.ab==='wall'&&!m.abU){ m.abU=true; m.stick=now+1; m.vx=0; m.vy=0; } }
function mflMeet(){ const F=menuSlugs.filter(m=>m.fl&&!m.stick); for(let i=0;i<F.length;i++)for(let j=i+1;j<F.length;j++){ const a=F[i], b=F[j]; const dx=b.x-a.x, dy=b.y-a.y, d=Math.hypot(dx,dy); if(d>=MFL_R*2||d<1e-3) continue; const nx=dx/d, ny=dy/d, pen=MFL_R*2-d; a.x-=nx*pen/2; a.y-=ny*pen/2; b.x+=nx*pen/2; b.y+=ny*pen/2; const vr=(b.vx-a.vx)*nx+(b.vy-a.vy)*ny; if(vr>=0) continue; const e=.55, jv=-(1+e)*vr/2; a.vx-=jv*nx; a.vy-=jv*ny; b.vx+=jv*nx; b.vy+=jv*ny; a.oj=b.oj=now; a.sq=b.sq=.8; mfl.meet=(mfl.meet|0)+1; sfx('bounce',Math.min(300,Math.abs(vr))); haptic('light'); if(!RM()) burst((a.x+b.x)/2-ox,(a.y+b.y)/2-oy,8,[mflCh(a.id).col,mflCh(b.id).col,'#fff'],70,0,.35); } }
function mflBump(m,nx,ny,imp){ const iv=Math.abs(imp||Math.hypot(m.vx,m.vy)); if(iv>=600*K){ m.oj=now; if(!RM()) m.sh=now; } sfx('bounce',Math.min(300,Math.abs(imp||Math.hypot(m.vx,m.vy)))); m.sq=.8; m.bn=(m.bn|0)+1; if(!RM()) burst(m.x+nx*MFL_R-ox,m.y+ny*MFL_R-oy,8,[mflCh(m.id).col,'#fff'],60,10,.35); if(m.bn===3) floats.push({s:'Карамболь!',x:m.x-ox,y:Math.max(40,m.y-36)-oy,t:0,life:1,size:12,col:['#fff','#ffd23c']}); }
function mflLetter(i){ const sv=save.mfl; if(sv.egg&1) return; sv.let|=1<<i; if(sv.let===511){ sv.egg|=1; save.candy=(save.candy|0)+10; mfl.blink=now; sfx('secret'); haptic('success'); floats.push({s:'ШМЯКОДРОМ собран! +10 🍬',x:W/2-ox,y:Math.floor(H*.13)+70-oy,t:0,life:2.6,size:14,col:['#fff','#ffd23c'],pop:1}); } store(); }
function mflDrawAim(){ const d=mfl.drag; if(!d||!d.act||!mfl.aim) return; const col=mflCh(d.m.id).col; mfl.aim.forEach(([px,py],i)=>{ if(i%3!==1) return; const z=i<12?3:2; ctx.fillStyle='#1a0c22'; ctx.fillRect((px|0)-1,(py|0)-1,z+2,z+2); ctx.fillStyle=(i>>1)%2?col:'#fff'; ctx.fillRect(px|0,py|0,z,z); }); }
function mflTrail(m){ if(!m.fl||!m.trail||!isNight()) return; ctx.fillStyle=mflCh(m.id).col; for(const [x,y] of m.trail) ctx.fillRect(x,y,1,1); }
function mflHint(m,night){ if(m.nudge&&now-m.nudge<.2) m.x+=Math.round(Math.sin((now-m.nudge)*60)); if(night&&!m.awake&&!m.fl){ const zx=Math.round(m.x-14), zy=Math.round(m.gy-40-((now*6+m.o*3)%8)); ctx.globalAlpha=.8; ctx.fillStyle='#c8f0ff'; ctx.fillRect(zx,zy,4,1); ctx.fillRect(zx+2,zy+1,1,1); ctx.fillRect(zx+1,zy+2,1,1); ctx.fillRect(zx,zy+3,4,1); ctx.globalAlpha=1; }
 if(SET().mfl&&!m.fl&&!m.ret&&CHARS[save.char]&&CHARS[save.char].id===m.id&&save.mfl.d!==mflDay()&&!night){ const ax=Math.round(m.x)-2, ay=Math.round(m.gy-52+Math.sin(now*5)*2); ctx.fillStyle='#1a0c22'; ctx.fillRect(ax-1,ay-1,7,4); ctx.fillStyle='#ffd23c'; ctx.fillRect(ax,ay,5,1); ctx.fillRect(ax+1,ay+1,3,1); ctx.fillRect(ax+2,ay+2,1,1); } }
window.__game={get mfl(){return mfl}, mflPath:(m,dx,dy,n)=>mflPath(m,dx,dy,n), mflVel:(m,dx,dy)=>mflVel(m,dx,dy), mflUp:(x,y)=>mflUp(x,y), mflGrab:(x,y,i)=>mflGrab(x,y,i), mflMove:(x,y)=>mflMove(x,y), get uiTr(){return uiTr}, uiPopOff:()=>uiPopOff(), bAnim:(l,x)=>bAnim(l,x), get now(){return now}, get pressed(){return pressed}, get fx(){return fx},get fy(){return fy},get SCS(){return SCS},get TMIN(){return TMIN},wrapTxt:(a,b,c)=>wrapTxt(a,b,c),get wrapOvf(){return wrapOvf},set wrapOvf(v){wrapOvf=v},get ox(){return ox},get oy(){return oy},v4:{BOSS,WXN,QUESTS,HAPT,PAT,SECRET,BIO,get gyro(){return gyro},get mic(){return mic},get hLast(){return hLast},haptic:k=>haptic(k),isNight:()=>isNight(),setDate:d=>{DATE_OVR=d;},questsToday:()=>questsToday(),qEv:(i,n)=>qEv(i,n),hybAll:()=>hybAll(),hybList:()=>hybList(),houseOf:id=>houseOf(id),feedSlug:c=>feedSlug(c),petSlug:(c,h)=>petSlug(c,h,100,300),logoTap:()=>logoTap(),get relay(){return relay},get relayTeam(){return relayTeam},set relayTeam(v){relayTeam=v},relayTick:()=>relayTick(),gyroStart:()=>gyroStart(),micStart:()=>micStart(),set gyroG(v){gyro.on=true;gyro.g=v},set useSecret(v){useSecret=v},get useSecret(){return useSecret},wxFX:dt=>wxFX(dt),isApril1:()=>isApril1(),isHalloween:()=>isHalloween(),isNewYear:()=>isNewYear(),set houseSel(v){houseSel=v},set bestTab(v){bestTab=v},set bestPage(v){bestPage=v},set relayPick(v){relayPick=v}},FUSE_SPEC, fuseCheck:(a,b)=>fuseCheck(a,b), grafList:li=>grafList(li), GRAF_CAP, get chaos(){return chaosRun}, chaosStart:()=>chaosStart(), MODS, chaosModOK:(m,L)=>chaosModOK(m,L), chaosPick:(n,L)=>chaosPick(n,L), chaosTick:dt=>chaosTick(dt), get chaosStat(){return chaosStat}, get wxP(){return wxP}, textW:(a,b)=>textW(a,b), CHAOS_HB, wxKind:()=>wxKind(), set drag(v){drag=v}, get drag(){return drag}, CHAOS_ICO, COSI, cos:()=>cosGet(), anchors:id=>anchors(id), drawSlugC:(...a)=>drawSlugC(...a), SECRETS:()=>SECRETS, gemsHave:()=>gemsHave(), get imp(){return {idleT,impStage,bubble}}, IMP_LINES, grafAdd:(...a)=>grafAdd(...a), grafClear:li=>grafClear(li), rescale:()=>rescale(), get menuSlugs(){return menuSlugs}, get H(){return H}, get W(){return W},get fusion(){return fusion}, set fusion(v){fusion=v}, get fusePick(){return fusePick}, set fusePick(v){fusePick=v}, fusedChar:(a,b)=>fusedChar(a,b), PC:()=>PC(), set fixDt(v){FIXDT=v}, openPause:()=>openPause(), get buttons(){return buttons}, TAP:()=>TAP(), get SC(){return SC}, get DPR(){return DPR},set selPage(v){selPage=v}, set lvlPage(v){lvlPage=v;lvlPageInit=true}, get lvlPage(){return lvlPage}, migrateSave, levelStars, isOpen, pc:()=>drawPlay.pc, unlocked, totalStars, save, get scene(){return scene}, set scene(v){scene=v}, startLevel, get world(){return world}, World, LV, CHARS, setChar:i=>{selPick=i}, get overlay(){return overlay}, toLevel:(x,y)=>[x*W/ (cv.getBoundingClientRect().width)]};
window.__fb={get hover(){return hoverLbl}, nbA, uiSnap, houseAsleep:c=>houseAsleep(c),bubLayout:f=>bubLayout(f),get houseFX(){return houseFX},houseBubble:(a,x,y,c,b)=>houseBubble(a,x,y,c,b),get menuVar(){return MENU_VAR},set menuVar(v){MENU_VAR=v},get bossLbl(){return bossLbl},fed:{get sess(){return fedSess},fedN,end:()=>endFedSession()},bossLblDraw:()=>drawBossLabel(),night:{tapFirefly:(i)=>{ const fy=Math.round(Math.max(TAP()+150,Math.min(H*.36,H-360))); const p=ffPos(i,fy,TAP()); tapFirefly(i,p[0],p[1]); return p; },tapStar:()=>tapStar(),starPh:()=>starPh(),state:(k,id)=>nightState(k,id),get darkT(){return houseDarkT},set darkT(v){houseDarkT=v},sleepSprite:id=>sleepSprite(id),capSprite:k=>capSprite(k),MUMBLE,get fx(){return houseFX},pop:()=>nightPop,ffPos:i=>{ const fy=Math.round(Math.max(TAP()+150,Math.min(H*.36,H-360))); return ffPos(i,fy,TAP()); }},spr:id=>SPR[id],drawFace:(a,it,px,py,g)=>drawFace(a,it,px,py,g),get nastya(){return nastya},set nastya(v){nastya=v},nastyaTap:m=>nastyaTap(m),toggleLamp:()=>toggleLamp(),showReveal:(k,c)=>showReveal(k,c),get reveal(){return reveal},selectHybrid:(a,b)=>selectHybrid(a,b),hybPairs:()=>hybPairs(),set selTab(v){selTab=v},get selTab(){return selTab},set fusePick(v){fusePick=v},anchors:id=>anchors(id),COSI,accPos:(a,it)=>accPos(a,it),SECRET,get fusion(){return fusion},candySprite:v=>candySprite(v),houseOf:id=>houseOf(id),drawSlugC:(...a)=>drawSlugC(...a),get ctx(){return ctx},gfxReset:()=>gfxReset(),onHide:()=>onHide(),onResume:()=>onResume(),get resumes(){return resumes},get floats(){return floats}};
})();
