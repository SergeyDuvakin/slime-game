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
const hadSave=!!(function(){try{return localStorage.getItem('shmyak_v1')}catch(e){return null}})(); if(!hadSave) save.v=3;
if(!Array.isArray(save.stars)) save.stars=[]; if(!(save.char>=0&&save.char<22)) save.char=0;
// Миграция сейва v3 (100 уровней): старые звёзды относились к другим уровням. Переносим их как бонус
// (save.legacy — слизни не закрываются) и сохраняем прогресс: save.open = сколько старых уровней было пройдено.
function migrateSave(sv,nLevels){ if(sv.v===3) return sv; const old=(sv.stars||[]).map(x=>Math.max(0,Math.min(3,x|0)));
 const oldTotal=old.reduce((a,b)=>a+b,0)+(sv.legacy|0); const cleared=old.filter(x=>x>0).length;
 sv.legacyFrom=sv.v||1; sv.legacy=oldTotal; sv.open=Math.min(nLevels,Math.max(sv.open|0,cleared)); sv.stars=[]; sv.v=3; return sv; }
const wasV=save.v; migrateSave(save,(window.LEVELS||[]).length); save.stars=save.stars.slice(0,(window.LEVELS||[]).length);
const store=()=>{try{localStorage.setItem('shmyak_v1',JSON.stringify(save))}catch(e){}}; if(hadSave&&wasV!==3) store();

// ---------- telegram ----------
const tg=(window.Telegram&&window.Telegram.WebApp&&window.Telegram.WebApp.initData!==undefined)?window.Telegram.WebApp:null;
const inTG=!!(tg&&tg.initData);
function tgInit(){ if(!tg) return;
 try{tg.ready();}catch(e){} try{tg.expand();}catch(e){}
 try{ if(tg.isVersionAtLeast&&tg.isVersionAtLeast('7.7')) tg.disableVerticalSwipes(); }catch(e){}
 try{ if(tg.isVersionAtLeast&&tg.isVersionAtLeast('6.1')){tg.setHeaderColor('#1a1030');tg.setBackgroundColor('#1a1030');} }catch(e){}
 try{ if(tg.isVersionAtLeast&&tg.isVersionAtLeast('6.1')) tg.BackButton.onClick(()=>goBack()); }catch(e){}
}
function haptic(kind){ if(!inTG) return; try{const h=tg.HapticFeedback; if(!h)return;
 if(kind==='success'||kind==='error')h.notificationOccurred(kind); else if(kind==='tick')h.selectionChanged(); else h.impactOccurred(kind);}catch(e){} }
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
let W=320,H=624,SC=1,DPR=1, ox=0, oy=0, fitW=0, fitH=0;
function tgViewH(){ let h=window.innerHeight||0;
 if(inTG){ const cur=Number(tg.viewportHeight)||0, stable=Number(tg.viewportStableHeight)||0; if(cur>h)h=cur; if(stable>h)h=stable; }
 return h||window.innerHeight; }
function resize(){ DPR=window.devicePixelRatio||1; const vw=window.innerWidth, vh=tgViewH();
 if(vw===fitW && vh===fitH) return false; fitW=vw; fitH=vh;
 const dw=Math.round(vw*DPR), dh=Math.round(vh*DPR);
 SC=Math.max(1,Math.floor(Math.min(dw/LW,dh/(LH+36))));
 W=Math.floor(dw/SC); H=Math.floor(dh/SC); cv.width=W; cv.height=H;
 cv.style.width=(W*SC/DPR)+'px'; cv.style.height=(H*SC/DPR)+'px';
 cv.style.left=Math.floor((vw-W*SC/DPR)/2)+'px'; cv.style.top='0px';
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
function T(s,x,y,size,col,align='c',out,shadow){ const c=txt(s,size,col,out,shadow); const dx=align==='c'?x-(c.width>>1):align==='r'?x-c.width:x; ctx.drawImage(c,Math.round(dx),Math.round(y)); return c; }

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
 x.fillStyle='rgba(0,0,0,.18)'; L.p.forEach(r=>{ if('gbswo'.includes(r[4])) x.fillRect(r[0]+3,r[1]+3,r[2],r[3]); });
 L.p.forEach((r,i)=>{ if('gbswo'.includes(r[4])) blockPaint(x,r,th,r[4],1000+i*37); }); return c; }

// ---------- мир/физика ----------
function circRect(px,py,r,X,Y,w,h){ const cx=Math.max(X,Math.min(px,X+w)), cy=Math.max(Y,Math.min(py,Y+h)); let dx=px-cx, dy=py-cy; const d2=dx*dx+dy*dy;
 if(d2>=r*r) return null;
 if(d2===0){ const l=px-X, rr=X+w-px, t=py-Y, b=Y+h-py, m=Math.min(l,rr,t,b); if(m===t) return {nx:0,ny:-1,pen:t+r}; if(m===b) return {nx:0,ny:1,pen:b+r}; if(m===l) return {nx:-1,ny:0,pen:l+r}; return {nx:1,ny:0,pen:rr+r}; }
 const d=Math.sqrt(d2); return {nx:dx/d,ny:dy/d,pen:r-d}; }
const inRect=(x,y,r)=>x>=r[0]&&x<=r[0]+r[2]&&y>=r[1]&&y<=r[1]+r[3];
// Типы блоков: g земля, b батут, s шипы, i лёд (скользкий, тает от Лампы), c ящик (ломается), d дверь (id в [5]), v конвейер (направление в [5]), w липкая стена
class World{
 constructor(li,ci,L){ this.li=li; this.L=L||LV[li]; this.ch=CHARS[ci]; this.ab=this.ch.ab||''; this.t=0; L=this.L;
  this.solids=L.p.map(r=>({x:r[0],y:r[1],w:r[2],h:r[3],type:r[4],arg:r[5],alive:true,hit:0}));
  this.movers=(L.m||[]).map(m=>({...m,bx:m.x,by:m.y,type:m.s?'s':'g',vx:0,vy:0,mover:true,alive:true}));
  this.bumpers=(L.bu||[]).map(b=>({x:b[0],y:b[1],r:b[2],hit:0}));
  this.portals=(L.po||[]); this.fans=(L.fa||[]); this.water=(L.wa||[]);
  this.buttons=(L.bt||[]).map(b=>({x:b[0],y:b[1],id:b[2],on:false}));
  this.candies=L.c.map(c=>({x:c[0],y:c[1],got:false}));
  this.shots=L.shots+(this.ch.extra||0); this.used=0; this.got=0; this.shield=this.ab==='shield'?1:0;
  this.s=this.mkBody(L.start[0],L.start[1]); this.clone=null;
  this.ev=[]; this.result=null; this.slow=false; this.updMovers(0); }
 mkBody(x,y){ return {x,y,vx:0,vy:0,st:'idle',at:0,lx:x,ly:y,ground:null,pcd:0,fly:0,padN:0,padT:0,bumpN:0,gs:1,used:false,chute:false,ghost:0,hover:false,wall:false,hist:[],histT:0}; }
 updMovers(dt){ for(const m of this.movers){ const a=(this.t/m.t)*Math.PI*2+(m.ph||0)/m.t*Math.PI*2; const nx=m.bx+Math.sin(a)*m.ax, ny=m.by+Math.sin(a)*m.ay;
  m.vx=dt?(nx-m.x)/dt:0; m.vy=dt?(ny-m.y)/dt:0; m.dx=nx-m.x; m.dy=ny-m.y; m.x=nx; m.y=ny; } }
 allSolids(){ return this.solids.filter(o=>o.alive).concat(this.movers); }
 canLaunch(){ const s=this.s; return s.st==='idle'&&this.shots>0&&!this.result; }
 launch(dx,dy){ const s=this.s; if(!this.canLaunch()) return false; let l=Math.hypot(dx,dy); if(l<8) return false; const k=Math.min(l,MAXDRAG)/l;
  const v=560*K*this.ch.power/MAXDRAG; s.vx=-dx*k*v; s.vy=-dy*k*v; s.st='fly'; s.fly=0; s.lx=s.x; s.ly=s.y; s.used=false; s.chute=false; s.gs=1; s.ghost=0; s.hover=false; s.wall=false; s.padN=0; s.bumpN=0; s.hist=[]; s.histT=0;
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
 step(dt){ this.t+=dt; this.updMovers(dt);
  for(const b of this.bumpers) b.hit=Math.max(0,b.hit-dt);
  for(const o of this.solids) o.hit=Math.max(0,o.hit-dt);
  this.body(this.s,dt,true);
  if(this.clone){ const c=this.clone; this.body(c,dt,false); if(c.st!=='fly'||c.fly>6||this.s.st==='idle'){ this.ev.push(['poofclone',c.x,c.y]); this.clone=null; } }
  // магнит
  if(this.ab==='magnet'&&this.s.st!=='poof') for(const c of this.candies) if(!c.got){ const dx=this.s.x-c.x, dy=this.s.y-c.y, d=Math.hypot(dx,dy); if(d<64&&d>1){ c.x+=dx/d*90*K*dt; c.y+=dy/d*90*K*dt; } }
 }
 body(s,dt,main){ const ch=this.ch;
  if(s.st==='idle'){ if(s.ground&&(s.ground.mover)&&!s.wall&&!s.hover){ s.x+=s.ground.dx; s.y+=s.ground.dy; }
   if(s.ground&&s.ground.type==='v'&&!s.wall&&!s.hover) s.x+=s.ground.arg*38*K*dt;
   if(s.x<R) s.x=R; if(s.x>LW-R) s.x=LW-R;
   if(!this.support(s)) { s.st='fly'; s.vx=0; s.vy=0; s.fly=0; s.used=true; s.hist=[]; }
   const g1=this.L.goal; if(main&&s.st==='idle'&&Math.abs(s.x-g1[0])<14&&s.y>g1[1]-36&&s.y<g1[1]+2){ s.st='win'; s.at=0; this.result='win'; this.ev.push(['win']); return; } }
  if((s.st==='splat'||s.st==='recover')&&s.ground&&s.ground.mover){ s.x+=s.ground.dx; s.y+=s.ground.dy; }
  if(s.st==='poof'){ s.at-=dt; if(s.at<=0){ s.x=s.lx; s.y=s.ly; s.vx=s.vy=0; s.st='idle'; s.ground=null; s.wall=false; s.hover=false; this.ev.push(['respawn']); } return; }
  if(s.st!=='fly') return;
  s.fly+=dt; s.pcd-=dt; s.padT+=dt; if(s.padT>2.6) s.padN=0;
  // гравитация, вода, ветер
  let g=G0*ch.grav*s.gs; if(this.ab==='glide') g*=.5; if(s.chute){ g*=.4; }
  const wat=this.inWater(s);
  if(wat&&this.ab!=='sponge'){ g=-G0*.5; s.vx*=Math.pow(.25,dt); s.vy*=Math.pow(.15,dt); }
  for(const f of this.fans) if(inRect(s.x,s.y,f)){ s.vy-=(f[4]||900)*K*dt*(this.ab==='glide'||s.chute?1.4:1); }
  s.vy+=g*dt; if(s.chute&&s.vy>70*K) s.vy=70*K; if(s.vy>900*K) s.vy=900*K; if(s.vy<-900*K) s.vy=-900*K;
  s.x+=s.vx*dt; s.y+=s.vy*dt;
  if(!isFinite(s.x)||!isFinite(s.y)){ s.x=s.lx; s.y=s.ly; this.settle(s,'nan'); return; }
  let grounded=null;
  if(s.ghost>0){ s.ghost-=dt; if(s.ghost<=0){ for(const o of this.allSolids()) if(circRect(s.x,s.y,R-2,o.x,o.y,o.w,o.h)){ s.ghost=.05; break; } if(s.fly>8) s.ghost=0; } }
  // кнопки
  for(const bt of this.buttons) if(!bt.on&&Math.hypot(s.x-bt.x,s.y-bt.y)<16){ bt.on=true; for(const o of this.solids) if(o.type==='d'&&o.arg===bt.id) o.alive=false; this.ev.push(['button',bt.x,bt.y]); }
  // губка: вода как батут
  if(wat&&this.ab==='sponge'&&s.vy>0){ s.vy=-Math.max(s.vy*.95,330*K); s.y=wat[1]-1; this.ev.push(['boing',s.x,s.y,null]); }
  for(const o of this.allSolids()){ const c=circRect(s.x,s.y,R,o.x,o.y,o.w,o.h); if(!c) continue; if(o.type==='o'&&!(c.ny<-.6&&s.vy*s.gs>=0&&s.y<o.y)) continue; if(s.ghost>0&&!(c.ny<-.6&&c.pen<8&&o.type!=='s')) continue;
   if(o.type==='s'&&!ch.spiky){
    if(this.shield>0){ this.shield=0; this.ev.push(['shield',s.x,s.y]); }
    else if(!main){ s.st='dead'; return; }
    else { s.st='poof'; s.at=.7; if(this.ab==='refund'){ this.shots++; this.used--; this.ev.push(['refund',s.x,s.y]); } this.ev.push(['ouch',s.x,s.y]); return; } }
   if(o.type==='i'&&this.ab==='melt'){ o.alive=false; this.ev.push(['melt',o.x+o.w/2,o.y+o.h/2,o]); continue; }
   const rvx=s.vx-(o.vx||0), rvy=s.vy-(o.vy||0); const vn=rvx*c.nx+rvy*c.ny;
   if(o.type==='c'&&vn<0&&(this.ab==='crush'||-vn>300*K)){ o.alive=false; s.vx*=.8; s.vy*=.8; this.ev.push(['crate',o.x+o.w/2,o.y+o.h/2,o]); continue; }
   s.x+=c.nx*c.pen; s.y+=c.ny*c.pen;
   if(vn<0){ const imp=-vn;
    if(o.type==='b'){ s.padN++; s.padT=0; const damp=Math.pow(.72,Math.max(0,s.padN-1)); const out=Math.max(imp*.92,380*K*damp);
     s.vx-=vn*c.nx; s.vy-=vn*c.ny; s.vx+=c.nx*out; s.vy+=c.ny*out; o.hit=.3; this.ev.push(['boing',s.x,s.y,o]);
     if(s.padN>=4&&c.ny<-.6&&Math.abs(s.vx)<80*K){ s.y=o.y-R; this.settle(s,'pad'); s.ground=o; return; }
     continue; }
    if(o.type==='s'){ const out=Math.max(imp*.8,300*K); s.vx-=vn*c.nx; s.vy-=vn*c.ny; s.vx+=c.nx*out; s.vy+=c.ny*out; this.ev.push(['bounce',s.x,s.y,imp,c.nx,c.ny]); continue; }
    if(this.ab==='wall'&&Math.abs(c.nx)>.7&&main){ this.settle(s,'wall'); s.wall=true; s.ground=o; this.ev.push(['stick',s.x,s.y]); return; }
    if(o.type==='w'&&Math.abs(c.nx)>.7&&main){ this.settle(s,'wall'); s.wall=true; s.ground=o; this.ev.push(['stick',s.x,s.y]); return; }
    if(s.gs<0&&c.ny>.6){ s.gs=1; }
    if(c.ny<-.6&&imp>SPLAT_V*ch.splat&&main&&s.gs>0){ s.vx=0; s.vy=0; s.st='splat'; s.at=0; s.ground=o; this.ev.push(['splat',s.x,s.y,imp]); return; }
    const rest=imp<90*K?0:ch.rest; s.vx-=(1+rest)*vn*c.nx; s.vy-=(1+rest)*vn*c.ny;
    if(imp>70*K) this.ev.push(['bounce',s.x,s.y,imp,c.nx,c.ny]); }
   if(c.ny<-.6) grounded=o; }
  // границы
  if(s.x<R){s.x=R; if(s.vx<0){ if(this.ab==='wall'&&main){ this.settle(s,'wall'); s.wall=true; this.ev.push(['stick',s.x,s.y]); return; } if(-s.vx>70)this.ev.push(['bounce',s.x,s.y,-s.vx,1,0]); s.vx=-s.vx*ch.rest;}}
  if(s.x>LW-R){s.x=LW-R; if(s.vx>0){ if(this.ab==='wall'&&main){ this.settle(s,'wall'); s.wall=true; this.ev.push(['stick',s.x,s.y]); return; } if(s.vx>70)this.ev.push(['bounce',s.x,s.y,s.vx,-1,0]); s.vx=-s.vx*ch.rest;}}
  if(s.y<R){s.y=R; if(s.vy<0){ s.vy=-s.vy*ch.rest; if(s.gs<0) s.gs=1; this.ev.push(['bounce',s.x,s.y,60,0,1]);}}
  if(s.y>LH-R){s.y=LH-R; if(s.vy>0){ s.vy=-s.vy*ch.rest;} grounded=grounded||{x:0,y:LH,w:LW,h:1};}
  for(const b of this.bumpers){ const dx=s.x-b.x, dy=s.y-b.y, d=Math.hypot(dx,dy); if(d<b.r+R&&d>0){ const nx=dx/d, ny=dy/d; s.x=b.x+nx*(b.r+R); s.y=b.y+ny*(b.r+R); const vn=s.vx*nx+s.vy*ny; if(vn<0){s.vx-=2*vn*nx; s.vy-=2*vn*ny;}
   s.bumpN++; if(s.bumpN<=6){ s.vx+=nx*140*K; s.vy+=ny*140*K; const sp=Math.hypot(s.vx,s.vy); if(sp<360*K){s.vx*=360*K/sp;s.vy*=360*K/sp;} } else { s.vx*=.7; s.vy*=.7; }
   b.hit=.25; this.ev.push(['bumper',b.x,b.y]); } }
  if(s.pcd<=0) for(const p of this.portals){ for(let k=0;k<2;k++){ const ax=p[k*2],ay=p[k*2+1]; if(Math.hypot(s.x-ax,s.y-ay)<13){ const bx=p[2-k*2],by=p[3-k*2]; this.ev.push(['portal',ax,ay,bx,by]); s.x=bx; s.y=by; s.pcd=.6; break; } } }
  for(const c of this.candies) if(!c.got&&Math.hypot(s.x-c.x,s.y-c.y)<17){ c.got=true; this.got++; if(this.ab==='juicy'){ this.shots++; this.ev.push(['juicy',c.x,c.y]); } this.ev.push(['candy',c.x,c.y,this.got]); }
  const g0=this.L.goal; if(Math.abs(s.x-g0[0])<14&&s.y>g0[1]-36&&s.y<g0[1]+2){ if(!main){ this.s.x=s.x; this.s.y=s.y; this.s.vx=this.s.vy=0; this.clone=null; } const m=this.s; m.st='win'; m.at=0; m.vx=m.vy=0; this.result='win'; this.ev.push(['win']); return; }
  // отдых
  if(wat&&this.ab!=='sponge'&&Math.hypot(s.vx,s.vy)<35*K&&s.fly>.4){ if(main) this.settle(s,'water'); else s.st='dead'; return; }
  if(grounded){ s.ground=grounded; const fr=grounded.type==='i'?.08:ch.fric; const gvx=(grounded.vx||0)+(grounded.type==='v'?grounded.arg*38*K:0); s.vx=gvx+(s.vx-gvx)*(grounded.mover?Math.pow(1e-4,dt):Math.pow(.25*(1/Math.max(.2,fr)),dt*fr)); const rvx=s.vx-gvx;
   if(Math.abs(rvx)<26*K&&Math.abs(s.vy-(grounded.vy||0))<40*K){ if(main) this.settle(s,''); else s.st='dead'; return; } }
  // анти-залипание: нет прогресса
  s.histT+=dt; if(s.histT>.25){ s.histT=0; s.hist.push([s.x,s.y]); if(s.hist.length>12) s.hist.shift();
   if(s.hist.length>=12&&s.fly>3){ let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9; for(const [hx,hy] of s.hist){x0=Math.min(x0,hx);x1=Math.max(x1,hx);y0=Math.min(y0,hy);y1=Math.max(y1,hy);} if(x1-x0<32&&y1-y0<80){ if(main) this.settle(s,'hover'); else s.st='dead'; return; } } }
  if(s.fly>9){ if(main) this.settle(s,'hover'); else s.st='dead'; }
 }
 // полная симуляция для диско-прицела и солвера
 snapshot(){ const w=new World(this.li,CHARS.indexOf(this.ch),this.L); w.t=this.t; w.updMovers(0);
  this.solids.forEach((o,i)=>{w.solids[i].alive=o.alive}); this.buttons.forEach((b,i)=>{w.buttons[i].on=b.on}); this.candies.forEach((c,i)=>Object.assign(w.candies[i],c));
  Object.assign(w.s,JSON.parse(JSON.stringify({...this.s,ground:null}))); w.s.ground=null; w.shots=this.shots; w.got=this.got; w.shield=this.shield; return w; }
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
function iconBtn(x,y,draw,cb,label){ btn(x,y,22,20,'',cb,'#6a4fd8'); buttons[buttons.length-1].label=label; const pr=pressed&&pressed.label===label; ctx.save(); ctx.translate(x+11,y+8+(pr?2:0)); draw(); ctx.restore(); }
const icMute=()=>{ ctx.fillStyle='#fff'; ctx.fillRect(-6,-2,3,5); ctx.fillRect(-3,-4,2,9); ctx.fillRect(-1,-5,1,11); if(save.mute){ ctx.fillStyle='#ff4a6a'; for(let i=0;i<6;i++){ctx.fillRect(2+i,-3+i,1,1);ctx.fillRect(7-i,-3+i,1,1);} } else { ctx.fillRect(2,-2,1,5); ctx.fillRect(4,-4,1,9); ctx.fillRect(3,-3,1,1);ctx.fillRect(3,3,1,1);} };
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
function startLevel(i){ curLevel=i; world=new World(i,selPick); const ti=themeOf(i); lvlCanvas=buildLevelCanvas(LV[i],ti); parts=[];decals=[];floats=[];overlay=null;drag=null;sAnim={a:'idle',t:0};
 scene='play'; tgBack(true); floats.push({s:LV[i].hint,x:LW/2,y:150,t:0,life:2.6,size:11,col:'#fff'}); }
function goBack(){ sfx('tap'); if(scene==='play'){scene='levels';} else if(scene==='levels'){scene='select';} else if(scene==='select'){scene='menu'; tgBack(false);} }
function burst(x,y,n,cols,sp=90,up=0,life=.6,g=300){ for(let i=0;i<n;i++){ const a=Math.random()*Math.PI*2, v=sp*(.3+Math.random()); parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-up,life:life*(.6+Math.random()*.6),t:0,c:cols[i%cols.length],g,s:Math.random()<.3?2:1}); } }
function handleEvents(){ const ch=CHARS[selPick]; for(const e of world.ev){ const [k,x,y]=e;
 if(k==='launch'){ sfx('launch'); haptic('medium'); burst(world.s.x,world.s.y+10,10,['#fff',ch.col],60,20,.4); shake=Math.max(shake,1.5); }
 if(k==='bounce'){ sfx('bounce',e[3]); squash=Math.min(1,e[3]/450); sqDir=[e[4],e[5]]; burst(x-e[4]*R,y-e[5]*R,4+(e[3]/80|0),[ch.col,'#fff'],e[3]*.25,0,.4); if(e[3]>300){shake=Math.max(shake,2);haptic('light');} }
 if(k==='boing'){ sfx('boing'); squash=1; sqDir=[0,-1]; burst(x,y+10,14,['#ff4fa8','#ff9ad0','#fff'],140,60,.6); if(e[3])e[3].hit=.3; shake=Math.max(shake,2); haptic('light'); }
 if(k==='splat'){ sfx('splat'); haptic('heavy'); shake=5; flash=.08; burst(x,y+10,26,[ch.col,ch.col,'#fff','#1a0c22'],170,80,.8); for(let i=0;i<7;i++) decals.push({x:x+(Math.random()*44-22)|0,y:y+R-1+(Math.random()*2|0),w:2+Math.random()*4|0,c:ch.col}); floats.push({s:['ШМЯК!','ПЛЮХ!','ХЛЮП!'][Math.random()*3|0],x,y:y-30,t:0,life:.9,size:14,col:['#fff','#ffd23c']}); sAnim={a:'splat',t:0}; }
 if(k==='candy'){ sfx('candy',e[3]); haptic('light'); burst(x,y,16,['#ffd23c','#fff','#ff4a8a','#4ef0b0'],120,40,.7,120); floats.push({s:'+'+e[3],x,y:y-14,t:0,life:.8,size:11,col:'#ffd23c'}); }
 if(k==='bumper'){ sfx('bumper'); burst(x,y,8,['#ff4a6a','#fff'],110,0,.4); shake=Math.max(shake,2.5); haptic('light'); }
 if(k==='portal'){ sfx('portal'); burst(x,y,14,['#7a5aff','#4ef0ff'],90,0,.5,0); burst(e[3],e[4],14,['#ffb03c','#ffe066'],90,0,.5,0); }
 if(k==='ouch'){ sfx('ouch'); haptic('error'); shake=5; burst(x,y,30,[ch.col,'#fff','#ff4a6a'],200,60,.8); floats.push({s:'АЙ! НА СТАРТ!',x,y:y-24,t:0,life:1,size:11,col:'#ff4a6a'}); }
 if(k==='respawn'){ burst(world.s.x,world.s.y,16,['#fff',ch.col],80,0,.5,0); sAnim={a:'recover',t:0}; }
 if(k==='rest'){ if(sAnim.a!=='splat'&&sAnim.a!=='recover') sAnim={a:'idle',t:0}; }
 if(k==='win'){ sfx('win'); haptic('success'); shake=3; burst(LV[curLevel].goal[0],LV[curLevel].goal[1]-20,50,['#ffd23c','#fff','#ff4a8a','#4ef0b0','#7a5aff'],220,120,1.4,200); setTimeout(()=>{ const st=1+world.got>3?3:Math.max(1,world.got); const stars=Math.min(3,Math.max(1,world.got)); const before=CHARS.filter((c,i)=>unlocked(i)).length; save.stars[curLevel]=Math.max(save.stars[curLevel]||0,stars); store(); const nu=CHARS.filter((c,i)=>unlocked(i)).slice(before); overlay={k:'win',stars,phrase:WINS[Math.random()*WINS.length|0],nu}; overlayT=0; },900); }

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
 if(k==='stick'){ sfx('bounce',100); burst(x,y,8,[ch.col,'#fff'],60,0,.3,0); sAnim={a:'idle',t:0}; }
 } world.ev.length=0; }

let FIXDT=0; // только для записи видео/тестов
function update(dt){ if(FIXDT) dt=FIXDT; now+=dt; shake=Math.max(0,shake-dt*20); flash=Math.max(0,flash-dt); squash=Math.max(0,squash-dt*5); overlayT+=dt;
 if(scene==='play'&&world&&!overlay){ const n=4, sd=(world.slow&&world.s.st==='fly')?dt*.33:dt; for(let i=0;i<n;i++) world.step(sd/n); handleEvents();
  const s=world.s; sAnim.t+=dt;
  if(s.st==='splat'){ if(sAnim.a!=='splat'&&sAnim.a!=='recover') sAnim={a:'splat',t:0}; if(sAnim.a==='splat'&&sAnim.t>.3+.35){ sAnim={a:'recover',t:0}; } if(sAnim.a==='recover'&&sAnim.t>.72){ s.st='idle'; sAnim={a:'idle',t:0}; } }
  else if(s.st==='fly') { if(sAnim.a!=='fly') sAnim={a:'fly',t:0}; }
  else if(s.st==='idle'&&sAnim.a==='recover'&&sAnim.t>.72) sAnim={a:'idle',t:0};
  else if(s.st==='idle'&&sAnim.a==='fly') sAnim={a:'idle',t:0};
  if(s.st==='idle'&&world.shots<=0&&!world.result&&!drag&&!world.clone){ world.result='fail'; setTimeout(()=>{ if(scene==='play'&&world.result==='fail'){ sfx('fail'); haptic('error'); overlay={k:'fail',phrase:FAILS[Math.random()*FAILS.length|0]}; overlayT=0; } },700); }
  if(s.st==='fly'&&Math.random()<.5) parts.push({x:s.x+(Math.random()*8-4),y:s.y+(Math.random()*8-4),vx:0,vy:0,life:.35,t:0,c:CHARS[selPick].col,g:0,s:1,trail:1});
 }
 for(const p of parts){ p.t+=dt; p.vy+=p.g*dt; p.x+=p.vx*dt; p.y+=p.vy*dt; } parts=parts.filter(p=>p.t<p.life);
 for(const f of floats) f.t+=dt; floats=floats.filter(f=>f.t<f.life);
 if(scene==='menu') for(const m of menuSlugs){ m.vy+=500*dt; m.y+=m.vy*dt; m.x+=m.vx*dt; if(m.y>m.gy){ m.y=m.gy; if(m.vy>200){ m.sq=1; } m.vy=0; m.vx=0; if(Math.random()<dt*.6){ m.vy=-180-Math.random()*120; m.vx=(Math.random()-.5)*60; m.flip=m.vx<0; } } if(m.x<20)m.x=20; if(m.x>W-20)m.x=W-20; m.sq=Math.max(0,(m.sq||0)-dt*4); }
}
function frameOf(a,t){ const A=ANIM[a]; const f=Math.floor(t*1000/A.ms); return (a==='idle'||a==='fly')?f%A.n:Math.min(A.n-1,f); }

function drawPlay(){ const s=world.s, ti=themeOf(curLevel), th=THEMES[ti], ch=CHARS[selPick];
 drawBG(ti,s.x-LW/2,now);
 const sx=(Math.random()-.5)*shake*2|0, sy=(Math.random()-.5)*shake*2|0;
 ctx.save(); ctx.translate(ox+sx,oy+sy);
 // рамка поля
 ctx.fillStyle='rgba(0,0,0,.25)'; ctx.fillRect(-3,-3,LW+6,LH+6); ctx.fillStyle=th.out; ctx.fillRect(-2,-2,LW+4,2); ctx.fillRect(-2,LH,LW+4,2); ctx.fillRect(-2,0,2,LH); ctx.fillRect(LW,0,2,LH);
 ctx.fillStyle=th.ui; ctx.globalAlpha=.5; ctx.fillRect(-1,-1,LW+2,1); ctx.globalAlpha=1;
 ctx.fillStyle='rgba(8,2,20,.18)'; ctx.fillRect(0,0,LW,LH); ctx.drawImage(lvlCanvas,0,0);
 for(const d of decals){ ctx.fillStyle='#1a0c22'; ctx.fillRect(d.x-1,d.y-1,d.w+2,3); ctx.fillStyle=d.c; ctx.fillRect(d.x,d.y-1,d.w,2); }
 for(const w of world.water) drawWater(w,now); for(const f of world.fans) drawFan(f,now);
 for(const o of world.solids){ if(!o.alive) continue; if(o.type==='c') drawCrate(o); else if(o.type==='i') drawIce(o); else if(o.type==='d') drawDoor(o); else if(o.type==='v') drawConv(o,now); else if(o.type==='b'&&o.hit>0){ ctx.fillStyle='#fff'; ctx.globalAlpha=o.hit*2; ctx.fillRect(o.x,o.y-1,o.w,2); ctx.globalAlpha=1; } }
 for(const b of world.buttons) drawButton(b);
 for(const m of world.movers) mover(m);
 for(const b of world.bumpers) bumper(b,now);
 for(const p of world.portals){ portal(p[0],p[1],now,0); portal(p[2],p[3],now,1); }
 jar(world.L.goal[0],world.L.goal[1],now,world.result==='win');
 world.candies.forEach((c,i)=>{ if(!c.got) candy(c.x,c.y,now,i); });
 for(const p of parts) if(p.trail){ ctx.globalAlpha=1-p.t/p.life; ctx.fillStyle=p.c; ctx.fillRect(p.x|0,p.y|0,1,1);} ctx.globalAlpha=1;
 // траектория
 if(drag&&s.st==='idle'){ let dx=drag.cx-drag.x0, dy=drag.cy-drag.y0; const l=Math.hypot(dx,dy); if(l>8){
   const pts=[]; if(world.ab==='preview'){ const key=(dx|0)+','+(dy|0); if(!drawPlay.pc||drawPlay.pc.k!==key){ const w=world.snapshot(); w.launch(dx,dy); const pp=[]; for(let i=0;i<300&&w.s.st==='fly'&&!w.result;i++){ w.step(1/120); if(i%2===0) pp.push([w.s.x,w.s.y]); } drawPlay.pc={k:key,pp}; } pts.push(...drawPlay.pc.pp.filter((_,i)=>i%2===0)); }
   else { const k=Math.min(l,MAXDRAG)/l, v=560*K*ch.power/MAXDRAG; let vx=-dx*k*v, vy=-dy*k*v, px=s.x, py=s.y; const gg=G0*ch.grav*(world.ab==='glide'?.5:1);
    for(let i=0;i<60;i++){ vy+=gg/60; px+=vx/60; py+=vy/60; if(px<0||px>LW||py>LH||py<0) break; let hit=false; for(const o of world.solids) if(o.alive&&px>o.x&&px<o.x+o.w&&py>o.y&&py<o.y+o.h) hit=true; if(hit)break; if(i%3===1) pts.push([px,py]); } }
   pts.forEach(([px,py],i)=>{ const a=1-i/pts.length, z=i<8?3:2; ctx.globalAlpha=Math.max(.35,a); ctx.fillStyle='#1a0c22'; ctx.fillRect((px|0)-1,(py|0)-1,z+2,z+2); ctx.fillStyle=i%2?ch.col:'#fff'; ctx.fillRect(px|0,py|0,z,z); ctx.globalAlpha=1; }); } }
 // слизень
 if(s.st!=='poof'){ let a=sAnim.a, f=frameOf(a,sAnim.t), flip=false, scx=1, scy=1, dx=s.x, dy=s.y-3;
  if(drag&&s.st==='idle'){ const ddx=drag.cx-drag.x0, ddy=drag.cy-drag.y0, l=Math.min(1,Math.hypot(ddx,ddy)/MAXDRAG); a='pull'; f=Math.round(l*7); flip=ddx>0; }
  if(a==='fly'){ flip=s.vx<0; const q=squash*.35; scx=1+q; scy=1-q; if(Math.abs(sqDir[0])>.6){scx=1-q;scy=1+q;} }
  if(s.st==='win'){ const k=Math.max(0,1-world.s.at); }
  // тень
  ctx.fillStyle='rgba(0,0,0,.25)'; ctx.fillRect(s.x-10|0,(s.y+R)|0,20,2);
  if(world.result==='win'){ const g=world.L.goal; const k=Math.max(.15,1-overlayT*0); }
  if(s.ghost>0) ctx.globalAlpha=.45;
  if(s.chute&&s.st==='fly') drawChute(s.x,s.y);
  if(s.gs<0&&s.st==='fly'){ ctx.save(); ctx.translate(Math.round(dx),Math.round(dy)); ctx.scale(1,-1); drawSlug(ch.id,a,f,0,-8,flip); ctx.restore(); } else drawSlug(ch.id,a,f,dx,dy,flip,scx,scy);
  ctx.globalAlpha=1;
  if(s.hover&&s.st==='idle'&&world.shots>0){ T('тяни!',s.x,s.y-46+Math.sin(now*6)*2,9,'#fff'); }
  if(s.wall&&s.st==='idle'){ ctx.fillStyle=ch.col; ctx.fillRect(s.x-1|0,s.y+8|0,3,4); } }
 if(world.clone){ const c=world.clone; drawSlug(ch.id,'fly',frameOf('fly',now+.2),c.x,c.y-3,c.vx<0); }
 for(const p of parts) if(!p.trail){ ctx.fillStyle=p.c; ctx.fillRect(p.x|0,p.y|0,p.s,p.s); }
 for(const f of floats){ const k=f.t/f.life; const yy=f.y-k*14; if(k>.75&&((f.t*20|0)%2)) continue; T(f.s,f.x,yy,f.size,f.col); }
 ctx.restore();
 if(flash>0){ ctx.fillStyle='rgba(255,255,255,.35)'; ctx.fillRect(0,0,W,H); }
 // HUD
 const hy=Math.max(4,oy-28);
 iconBtn(4,hy,icBack,()=>goBack(),'back'); iconBtn(30,hy,icRetry,()=>{sfx('tap');startLevel(curLevel);},'retry'); iconBtn(W-26,hy,icMute,()=>{setMute(!save.mute);},'mute');
 T((curLevel+1)+'. '+world.L.name,W/2,hy+1,10,'#fff'); 
 const total=world.shots; const bx=W/2-((world.L.shots+(ch.extra||0))*9)/2;
 for(let i=0;i<world.L.shots+(ch.extra||0);i++){ const on=i<total; const x=bx+i*9+4|0, y=hy+15; ctx.fillStyle='#1a0c22'; ctx.fillRect(x-3,y-1,8,7); ctx.fillStyle=on?ch.col:'#3a2a52'; ctx.fillRect(x-2,y,6,5); if(on){ctx.fillStyle='#fff';ctx.fillRect(x-1,y+1,1,1);} }
 for(let i=0;i<3;i++) starIcon(W-80+i*10+4,hy+5,i<world.got);
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
 const by=Math.floor(H*.47); btn(W/2-60,by,120,30,'ИГРАТЬ',()=>{sfx('tap');scene='levels';tgBack(true);},'#4ed05a',16);
 btn(W/2-60,by+40,120,26,'СЛИЗНИ',()=>{sfx('tap');scene='select';tgBack(true);},'#ff5aa8',13);
 iconBtn(W-28,6,icMute,()=>setMute(!save.mute),'mute');
 T('тяни • целься • шмякай',W/2,by+78,11,'#fff3d8');
 const tot=save.stars.reduce((a,b)=>a+(b||0),0); const s1=tot+' / '+LV.length*3; starIcon(W/2-28,by+101,true); T(s1,W/2-18,by+97,12,'#ffd23c','l'); if(save.legacy) T('+'+save.legacy+' ★ из старой версии',W/2,by+116,10,'#d8c8f0');
}
const totalStars=()=>save.stars.reduce((a,b)=>a+(b||0),0)+(save.legacy|0);
const levelStars=()=>save.stars.reduce((a,b)=>a+(b||0),0);
const isOpen=i=>i===0||i<(save.open|0)||(save.stars[i-1]||0)>0;
const unlocked=i=>totalStars()>=CHARS[i].cost;
let selPage=0, lvlPage=0; const silCache={};
function silhouette(id){ if(silCache[id]) return silCache[id]; const [c,x]=mk(64,64); x.drawImage(SPR[id],0,0,64,64,0,0,64,64); x.globalCompositeOperation='source-atop'; x.fillStyle='#1a1030'; x.fillRect(0,0,64,64); silCache[id]=c; return c; }
function pager(y,page,pages,set,lbl){ if(pages<2) return; btn(12,y,30,22,'‹',()=>{sfx('tap');set((page+pages-1)%pages);},'#6a4fd8',14); buttons[buttons.length-1].label=lbl+'p';
 btn(W-42,y,30,22,'›',()=>{sfx('tap');set((page+1)%pages);},'#6a4fd8',14); buttons[buttons.length-1].label=lbl+'n';
 for(let i=0;i<pages;i++){ ctx.fillStyle='#1a0c22'; ctx.fillRect(W/2-pages*6+i*12-1,y+8,8,8); ctx.fillStyle=i===page?'#ffd23c':'#5a4a7a'; ctx.fillRect(W/2-pages*6+i*12,y+9,6,6);} }
function drawSelect(){ drawBG(1,0,now); T('Выбери слизня',W/2,6,16,['#fff','#ff8fc8']); T('★ '+totalStars(),W-8,10,10,'#ffd23c','r');
 iconBtn(4,6,icBack,()=>goBack(),'back');
 const per=12, pages=Math.ceil(CHARS.length/per); if(selPage>=pages) selPage=0;
 const cols=3, cw=Math.floor((W-24)/cols), chh=Math.max(54,Math.min(76,Math.floor((H-200)/4)));
 for(let k=0;k<per;k++){ const i=selPage*per+k; if(i>=CHARS.length) break; const c=CHARS[i], x=12+(k%cols)*cw, y=32+Math.floor(k/cols)*chh, sel=i===selPick, op=unlocked(i);
  panel(x+2,y,cw-4,chh-4,sel?'#5a2a8a':op?'#2b1a4a':'#1e1430'); if(sel){ ctx.fillStyle=c.col; ctx.fillRect(x+3,y+1,cw-6,2);} 
  ctx.save(); ctx.beginPath(); ctx.rect(x+3,y+1,cw-6,chh-6); ctx.clip();
  const sy=y+chh-26; if(op) drawSlug(c.id,sel?'fly':'idle',frameOf(sel?'fly':'idle',now+i*.37),x+cw/2,sy); else ctx.drawImage(silhouette(c.id),Math.round(x+cw/2-32),Math.round(sy-40));
  ctx.restore();
  if(op) T(c.name,x+cw/2,y+chh-17,10,sel?'#ffd23c':'#fff'); else { T('★ '+c.cost,x+cw/2,y+chh/2-10,11,'#ffd23c'); T('???',x+cw/2,y+chh-17,9,'#8a7aa8'); }
  buttons.push({x,y,w:cw,h:chh-4,label:'c'+i,cb:()=>{ if(!unlocked(i)){ sfx('bounce',40); haptic('error'); floats.push({s:'Нужно ★ '+c.cost,x:x+cw/2-ox,y:y-oy+10,t:0,life:1,size:10,col:'#ffd23c'}); return; } selPick=i; save.char=i; store(); sfx('candy',i%4); haptic('tick'); }}); }
 const py=32+4*chh+2; pager(py,selPage,pages,v=>selPage=v,'sel');
 const c=CHARS[selPick]; const dy=py+28; panel(12,dy,W-24,48,'#2b1a4a'); ctx.fillStyle=c.col; ctx.fillRect(13,dy+1,3,46);
 T(c.name,22,dy+5,13,['#fff','#ffd23c'],'l'); T(c.perk,22,dy+21,11,c.col,'l'); T(c.desc,22,dy+34,10,'#e8dcff','l'); if(c.tap) T('ТАП',W-18,dy+6,9,'#4ef0ff','r');
 btn(W/2-55,Math.min(H-34,dy+58),110,28,'ПОГНАЛИ',()=>{sfx('tap');scene='levels';},'#4ed05a',14);
 for(const f of floats){ const k=f.t/f.life; T(f.s,f.x+ox,f.y+oy-k*14,f.size,f.col); }
}
let lvlPageInit=false;
function drawLevels(){ drawBG(2,0,now); iconBtn(4,8,icBack,()=>goBack(),'back');
 const pages=Math.ceil(LV.length/10);
 if(!lvlPageInit){ lvlPageInit=true; let f=0; while(f<LV.length-1&&(save.stars[f]||0)>0) f++; lvlPage=Math.floor(f/10); }
 if(lvlPage>=pages) lvlPage=pages-1;
 const w0=lvlPage*10, ti=themeOf(w0), wcol=['#ff9a5c','#ff5aa8','#4ea0ff','#7ac8e8','#5ac05a'][ti];
 let ws=0; for(let i=w0;i<w0+10;i++) ws+=save.stars[i]||0;
 T('Мир '+(lvlPage+1),W/2,6,10,'#d8c8f0'); T(WORLDS[lvlPage]||'',W/2,18,16,['#fff',wcol]);
 T('★ '+ws+'/30',W-8,8,11,'#ffd23c','r'); T('всего '+totalStars(),W-8,24,10,'#e8d8ff','r');
 const cols=2, cw=Math.floor((W-24)/cols), top=46, chh=Math.max(48,Math.min(84,Math.floor((H-170)/5)));
 for(let k=0;k<10;k++){ const i=w0+k; if(i>=LV.length) break; const x=12+(k%cols)*cw+2, y=top+Math.floor(k/cols)*chh; const open=isOpen(i); const st=save.stars[i]||0; const boss=k===9;
  const col=open?(boss?'#ffb03c':wcol):'#4a3a5a';
  btn(x,y,cw-4,chh-8,'',open?()=>{sfx('tap');startLevel(i);}:()=>{sfx('bounce',50);haptic('error');},col); buttons[buttons.length-1].label='L'+i;
  const pr=pressed&&pressed.label==='L'+i?2:0;
  if(open){ T(String(i+1),x+8,y+5+pr,15,'#fff','l'); const nm=LV[i].name||''; T(nm.length>16?nm.slice(0,15)+'…':nm,x+8,y+26+pr,10,'#fff','l');
   for(let q=0;q<3;q++) starIcon(x+cw-46+q*12,y+8+pr,q<st); if(boss) T('БОСС',x+cw-12,y+chh-26+pr,10,'#fff6b0','r'); }
  else { ctx.fillStyle='#1a0c22'; const lx=x+(cw-4)/2|0, ly=y+(chh-8)/2-4|0; ctx.fillRect(lx-5,ly,11,9); ctx.fillRect(lx-3,ly-5,7,6); ctx.fillStyle='#4a3a5a'; ctx.fillRect(lx-1,ly-3,3,4); ctx.fillStyle='#ffd23c'; ctx.fillRect(lx-4,ly+1,9,7); ctx.fillStyle='#1a0c22'; ctx.fillRect(lx,ly+3,1,3); T(String(i+1),x+8,y+5,12,'#8a7aa8','l'); } }
 pager(top+5*chh,lvlPage,pages,v=>lvlPage=v,'lv');
 const c=CHARS[selPick]; drawSlug(c.id,'idle',frameOf('idle',now),W/2-40,H-22); T('Играет: '+c.name,W/2-14,H-44,11,'#fff','l'); T(c.perk,W/2-14,H-28,10,c.col,'l');
 btn(W-62,H-40,54,24,'',()=>{sfx('tap');scene='select';},'#ff5aa8'); buttons[buttons.length-1].label='chg'; T('сменить',W-35,H-34,10,'#fff');
}
function drawOverlay(){ const k=Math.min(1,overlayT*4); ctx.fillStyle=`rgba(12,4,24,${.6*k})`; ctx.fillRect(0,0,W,H);
 const pw=200, ph=overlay.k==='win'?170:140, px=(W-pw)/2|0, py=Math.floor(H/2-ph/2+(1-k)*40);
 panel(px,py,pw,ph,overlay.k==='win'?'#3a1f6a':'#4a1a3a');
 if(overlay.k==='win'){ T('ПОБЕДА!',W/2,py+8,20,['#fff6b0','#ffd23c','#ff9a1c']); T(overlay.phrase,W/2,py+34,10,'#7affe0');
  for(let i=0;i<3;i++){ const on=i<overlay.stars&&overlayT>.4+i*.3; if(on&&!pops[i]){pops[i]=1; sfx('star',i); burst(W/2-30+i*30-ox,py+60-oy,10,['#ffd23c','#fff'],80,0,.5,0); }
   const sc=on?Math.max(1,2.2-(overlayT-.4-i*.3)*4):1; ctx.save(); ctx.translate(W/2-30+i*30,py+58); ctx.scale(sc>1.01?Math.round(sc*2)/2:1,sc>1.01?Math.round(sc*2)/2:1); ctx.scale(2,2); starIcon(0,0,on,2); ctx.restore(); }
  btn(px+14,py+ph-44,80,28,'ЕЩЁ',()=>{sfx('tap');startLevel(curLevel);},'#6a4fd8',13);
  if(curLevel<LV.length-1) btn(px+pw-94,py+ph-44,80,28,'ДАЛЬШЕ',()=>{sfx('tap');startLevel(curLevel+1);},'#4ed05a',13); else btn(px+pw-94,py+ph-44,80,28,'МЕНЮ',()=>{sfx('tap');scene='menu';tgBack(false);},'#4ed05a',13);
  if(overlay.nu&&overlay.nu.length){ const c=overlay.nu[0]; T('Новый слизень: '+c.name+'!',W/2,py+ph-62,10,'#4ef0ff'); drawSlug(c.id,'idle',frameOf('idle',now),px+pw-22,py+ph-56); }
  else if(curLevel===LV.length-1) T('Все уровни пройдены!',W/2,py+ph-60,9,'#ffd23c');
 } else { T(overlay.phrase,W/2,py+12,16,['#fff','#ff8fc8']); drawSlug(CHARS[selPick].id,'splat',5,W/2,py+60); T('Броски кончились. Ещё разок?',W/2,py+82,9,'#e8d8ff');
  btn(px+14,py+ph-40,80,26,'ЗАНОВО',()=>{sfx('tap');startLevel(curLevel);},'#4ed05a',12); btn(px+pw-94,py+ph-40,80,26,'УРОВНИ',()=>{sfx('tap');scene='levels';},'#6a4fd8',12); }
}
function render(){ buttons=[]; ctx.imageSmoothingEnabled=false;
 if(scene==='menu') drawMenu(); else if(scene==='select') drawSelect(); else if(scene==='levels') drawLevels(); else if(scene==='play'){ const b0=buttons.length; drawPlay(); if(overlay){ buttons.splice(b0); drawOverlay(); } }
 if(scene!=='play'||!overlay) pops=[];
 // частицы меню поверх
 if(scene!=='play') for(const p of parts){ ctx.fillStyle=p.c; ctx.fillRect(p.x+ox|0,p.y+oy|0,p.s,p.s); }
}

// ---------- ввод ----------
function lp(e){ const r=cv.getBoundingClientRect(); return [(e.clientX-r.left)*W/r.width,(e.clientY-r.top)*H/r.height]; }
const hit=(x,y)=>{ for(let i=buttons.length-1;i>=0;i--){const b=buttons[i]; if(x>=b.x&&x<b.x+b.w&&y>=b.y-1&&y<b.y+b.h+2) return b;} return null; };
cv.addEventListener('pointerdown',e=>{ audioInit(); const [x,y]=lp(e); const b=hit(x,y); if(b){ pressed=b; return; }
 if(scene==='play'&&world&&!overlay&&world.s.st==='fly'&&CHARS[selPick].tap){ if(world.ab==='slowmo') world.slow=true; else world.ability(); return; }
 if(scene==='play'&&world&&!overlay&&world.canLaunch()){ drag={x0:x-ox,y0:y-oy,cx:x-ox,cy:y-oy,id:e.pointerId}; lastPullF=-1; try{cv.setPointerCapture(e.pointerId)}catch(_){} } });
cv.addEventListener('pointermove',e=>{ const [x,y]=lp(e); if(drag){ drag.cx=x-ox; drag.cy=y-oy; const f=Math.round(Math.min(1,Math.hypot(drag.cx-drag.x0,drag.cy-drag.y0)/MAXDRAG)*7); if(f!==lastPullF){ if(lastPullF>=0) {sfx('stretch',f); if(f%2===0)haptic('tick');} lastPullF=f; } }
 else if(pressed){ const b=hit(x,y); if(b!==pressed&&!(b&&b.label===pressed.label)) pressed=null; } });
function up(e){ const [x,y]=lp(e); if(world) world.slow=false; if(drag){ const d=drag; drag=null; if(world&&world.launch(d.cx-d.x0,d.cy-d.y0)){ } return; }
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
let coverMode=false;
// ---------- цикл ----------
let last=performance.now();
function loop(t){ if(coverMode) return; let dt=Math.min(.05,(t-last)/1000); last=t; update(dt); render(); requestAnimationFrame(loop); }
function initMenuSlugs(){ const pool=CHARS.filter((c,i)=>unlocked(i)); const pick=pool.length<=5?pool:[...pool.slice(0,3),...pool.slice(-2)]; menuSlugs=pick.map((c,i)=>({id:c.id,x:W*(i+1)/6,y:H-60+3,gy:H-60+3,vy:0,vx:0,o:i*.37,flip:i%2===1})); }
function refit(){ if(resize()&&scene==='menu') initMenuSlugs(); }
tgInit(); resize();
if(inTG){ try{ tg.onEvent('viewportChanged', refit); }catch(e){}
 [50,300,800].forEach(ms=>setTimeout(refit,ms)); }
loadSprites().then(()=>{ if(!unlocked(selPick)) selPick=0; initMenuSlugs(); requestAnimationFrame(loop); });
window.addEventListener('resize',refit);
// хуки для тестов
window.__game={set fixDt(v){FIXDT=v},set selPage(v){selPage=v}, set lvlPage(v){lvlPage=v;lvlPageInit=true}, get lvlPage(){return lvlPage}, migrateSave, levelStars, isOpen, pc:()=>drawPlay.pc, unlocked, totalStars, save, get scene(){return scene}, set scene(v){scene=v}, startLevel, get world(){return world}, World, LV, CHARS, setChar:i=>{selPick=i}, get overlay(){return overlay}, toLevel:(x,y)=>[x*W/ (cv.getBoundingClientRect().width)]};
})();
