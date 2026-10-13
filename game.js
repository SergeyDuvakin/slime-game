'use strict';
/* ШМЯКОДРОМ — пиксельная мини-игра про слизней-рогаток. Vanilla JS + Canvas. */
(()=>{
const LW=240, LH=440, R=13, MAXDRAG=78, G0=620;
const SPLAT_V=470;
const CHARS=[
 {id:'slug01',name:'Желейка',perk:'Супер-прыгучая',desc:'Отскакивает как мячик',col:'#a57af0',rest:.72,fric:.6,power:1,grav:1,splat:1.25},
 {id:'slug34',name:'Лужица',perk:'Не отскакивает',desc:'Ворчит и прилипает',col:'#ff9a3c',rest:.18,fric:1.4,power:1,grav:1,splat:.85},
 {id:'slug36',name:'Ёжик',perk:'Шипы не страшны',desc:'Отпрыгивает от шипов',col:'#ffd93c',rest:.5,fric:1,power:1,grav:1,splat:1,spiky:true},
 {id:'slug41',name:'Пончик',perk:'+1 бросок',desc:'Катится колесом',col:'#ff7ab8',rest:.5,fric:.35,power:1,grav:1,splat:1,extra:1},
 {id:'slug53',name:'Лавыч',perk:'Мощный бросок',desc:'Тяжёлый, но злой',col:'#ff5a2a',rest:.4,fric:1,power:1.13,grav:1.12,splat:1.1},
];
const THEMES=[
 {sky:['#24163f','#43215c','#7a2f6c','#b5456c','#e8705c','#f8a65e','#ffd27c'],far:'#7a3c78',farRim:'#a8558a',mid:'#4a2a62',midRim:'#6d3d78',near:'#2a1838',
  top:'#7fd64a',topHi:'#c4f56a',topLo:'#4fa03a',body:'#8c5a3c',body2:'#70442f',bodyHi:'#a8714c',out:'#26131f',sun:'#ffe9a0',ui:'#ffd27c'},
 {sky:['#130d26','#1e1440','#2c1a58','#3e1f6a','#5a2a7a','#7a3486'],far:'#3a1f5e',farRim:'#6a3a90',mid:'#2a1648',midRim:'#ff7ac0',near:'#170c2a',
  top:'#ff8fc8',topHi:'#ffd0ea',topLo:'#d0569c',body:'#6e3d2c',body2:'#55291f',bodyHi:'#8a5238',out:'#1c0c14',sun:'#7affe0',ui:'#ff8fc8'},
 {sky:['#070a1e','#0c1230','#121c46','#1a2a5e','#24407a','#2e5a8e'],far:'#1a2550',farRim:'#3c5aa0',mid:'#121a3c',midRim:'#4ef0ff',near:'#0a0e24',
  top:'#4ef0ff',topHi:'#c8ffff',topLo:'#2aa0d0',body:'#2c3266',body2:'#1f2450',bodyHi:'#3e468a',out:'#05061a',sun:'#e8f4ff',ui:'#4ef0ff'},
];
const themeOf=i=>i<4?0:i<7?1:2;
const LV=window.LEVELS;
const WINS=['Шмяк засчитан!','Слизь-легенда!','В банку как родной!','Чистая слизь!','Мама гордится!','Гравитация в шоке'];
const FAILS=['Слизень выдохся','Шмяк не туда','Слизь устала','Попробуй с душой'];

// ---------- storage ----------
let save={stars:[],char:0,mute:false};
try{Object.assign(save,JSON.parse(localStorage.getItem('shmyak_v1')||'{}'))}catch(e){}
const store=()=>{try{localStorage.setItem('shmyak_v1',JSON.stringify(save))}catch(e){}};

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
let W=240,H=470,SC=1,DPR=1, ox=0, oy=0;
function resize(){ DPR=window.devicePixelRatio||1; const vw=window.innerWidth, vh=(inTG&&tg.viewportStableHeight)||window.innerHeight;
 const dw=Math.round(vw*DPR), dh=Math.round(vh*DPR);
 SC=Math.max(1,Math.floor(Math.min(dw/LW,dh/(LH+36))));
 W=Math.floor(dw/SC); H=Math.floor(dh/SC); cv.width=W; cv.height=H;
 cv.style.width=(W*SC/DPR)+'px'; cv.style.height=(H*SC/DPR)+'px';
 cv.style.left=Math.floor((vw-W*SC/DPR)/2)+'px'; cv.style.top='0px';
 ctx.imageSmoothingEnabled=false;
 ox=Math.floor((W-LW)/2); oy=Math.max(30,Math.floor((H-LH)/2)+14); if(oy+LH>H) oy=H-LH;
 bgCache={}; }
window.addEventListener('resize',resize);
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
  if(ti===2){ // северное сияние
   for(let xx=0;xx<BW;xx++){ const yb=H*.18+Math.sin(xx*.03)*14+Math.sin(xx*.011)*20; for(let k=0;k<26;k++){ if(BAYER[((yb+k)&3)*4+(xx&3)]/16< (1-k/26)*.5){ x.fillStyle=k<8?'#5effc0':'#3ab0c0'; x.globalAlpha=.35*(1-k/26); x.fillRect(xx,yb+k|0,1,1);} } } x.globalAlpha=1; }
  layers.push({c,sp:.05}); }
 // облака
 { const [c,x]=mk(BW,H); for(let i=0;i<7;i++){ const cx=rnd()*BW, cy=H*(.08+rnd()*.35), w=30+rnd()*50; cloud(x,cx,cy,w,ti); } layers.push({c,sp:.12,drift:4}); }
 // дальние горы
 layers.push({c:ridge(BW,H,H*.58,46,.022,th.far,th.farRim,ti,0),sp:.2});
 layers.push({c:ridge(BW,H,H*.7,34,.04,th.mid,th.midRim,ti,1),sp:.38});
 layers.push({c:ridge(BW,H,H*.84,22,.07,th.near,null,ti,2),sp:.6});
 return layers; }
function cloud(x,cx,cy,w,ti){ const cols=ti===0?['#ffb38a','#f07e7e','#c45a7a']:ti===1?['#5a2e80','#46236a','#351a54']:['#2a3c70','#203060','#18244c'];
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
 x.fillStyle='rgba(0,0,0,.18)'; L.p.forEach(r=>{ x.fillRect(r[0]+3,r[1]+3,r[2],r[3]); });
 L.p.forEach((r,i)=>blockPaint(x,r,th,r[4],1000+i*37)); return c; }

// ---------- мир/физика ----------
function circRect(px,py,r,X,Y,w,h){ const cx=Math.max(X,Math.min(px,X+w)), cy=Math.max(Y,Math.min(py,Y+h)); let dx=px-cx, dy=py-cy; const d2=dx*dx+dy*dy;
 if(d2>=r*r) return null;
 if(d2===0){ const l=px-X, rr=X+w-px, t=py-Y, b=Y+h-py, m=Math.min(l,rr,t,b); if(m===t) return {nx:0,ny:-1,pen:t+r}; if(m===b) return {nx:0,ny:1,pen:b+r}; if(m===l) return {nx:-1,ny:0,pen:l+r}; return {nx:1,ny:0,pen:rr+r}; }
 const d=Math.sqrt(d2); return {nx:dx/d,ny:dy/d,pen:r-d}; }
class World{
 constructor(li,ci){ this.li=li; this.L=LV[li]; this.ch=CHARS[ci]; this.t=0; const L=this.L;
  this.solids=L.p.map(r=>({x:r[0],y:r[1],w:r[2],h:r[3],type:r[4]}));
  this.movers=(L.m||[]).map(m=>({...m,bx:m.x,by:m.y,type:'g',vx:0,vy:0,mover:true}));
  this.bumpers=(L.bu||[]).map(b=>({x:b[0],y:b[1],r:b[2],hit:0}));
  this.portals=(L.po||[]); this.candies=L.c.map(c=>({x:c[0],y:c[1],got:false}));
  this.shots=L.shots+(this.ch.extra||0); this.used=0; this.got=0;
  this.s={x:L.start[0],y:L.start[1],vx:0,vy:0,st:'idle',at:0,lx:L.start[0],ly:L.start[1],ground:null,pcd:0,fly:0};
  this.ev=[]; this.result=null; this.updMovers(0); }
 updMovers(dt){ for(const m of this.movers){ const a=(this.t/m.t)*Math.PI*2+(m.ph||0)/m.t*Math.PI*2; const nx=m.bx+Math.sin(a)*m.ax, ny=m.by+Math.sin(a)*m.ay;
  m.vx=dt?(nx-m.x)/dt:0; m.vy=dt?(ny-m.y)/dt:0; m.dx=nx-m.x; m.dy=ny-m.y; m.x=nx; m.y=ny; } }
 launch(dx,dy){ const s=this.s; if(s.st!=='idle'||this.shots<=0) return false; let l=Math.hypot(dx,dy); if(l<8) return false; const k=Math.min(l,MAXDRAG)/l;
  const v=560*this.ch.power/MAXDRAG; s.vx=-dx*k*v; s.vy=-dy*k*v; s.st='fly'; s.fly=0; s.lx=s.x; s.ly=s.y; this.shots--; this.used++; this.ev.push(['launch']); return true; }
 step(dt){ this.t+=dt; this.updMovers(dt); const s=this.s, ch=this.ch;
  for(const b of this.bumpers) b.hit=Math.max(0,b.hit-dt);
  if(s.st==='idle'){ if(s.ground&&s.ground.mover){ s.x+=s.ground.dx; s.y+=s.ground.dy; }
   // проверка опоры
   if(!this.support()) { s.st='fly'; s.vx=0; s.vy=0; s.fly=0; } }
  if(s.st==='splat'||s.st==='recover'){ if(s.ground&&s.ground.mover){ s.x+=s.ground.dx; s.y+=s.ground.dy; } }
  if(s.st==='poof'){ s.at-=dt; if(s.at<=0){ s.x=s.lx; s.y=s.ly; s.vx=s.vy=0; s.st='idle'; s.ground=null; this.ev.push(['respawn']); } return; }
  if(s.st==='win') return;
  if(s.st!=='fly') return;
  s.fly+=dt; s.pcd-=dt;
  s.vy+=G0*ch.grav*dt; s.x+=s.vx*dt; s.y+=s.vy*dt;
  let grounded=null;
  const all=this.solids.concat(this.movers);
  for(const o of all){ const c=circRect(s.x,s.y,R,o.x,o.y,o.w,o.h); if(!c) continue;
   if(o.type==='s'&&!ch.spiky){ s.st='poof'; s.at=.7; this.ev.push(['ouch',s.x,s.y]); return; }
   s.x+=c.nx*c.pen; s.y+=c.ny*c.pen;
   const rvx=s.vx-(o.vx||0), rvy=s.vy-(o.vy||0); const vn=rvx*c.nx+rvy*c.ny;
   if(vn<0){ const imp=-vn;
    if(o.type==='b'){ const out=Math.max(imp*1.05,380); s.vx-= vn*c.nx; s.vy-=vn*c.ny; s.vx+=c.nx*out; s.vy+=c.ny*out; this.ev.push(['boing',s.x,s.y,o]); continue; }
    if(o.type==='s'){ const out=Math.max(imp*.8,300); s.vx-=vn*c.nx; s.vy-=vn*c.ny; s.vx+=c.nx*out; s.vy+=c.ny*out; this.ev.push(['bounce',s.x,s.y,imp,c.nx,c.ny]); continue; }
    if(c.ny<-.6&&imp>SPLAT_V*ch.splat){ s.vx=0; s.vy=0; s.st='splat'; s.at=0; s.ground=o; this.ev.push(['splat',s.x,s.y,imp]); return; }
    const rest=imp<60?0:ch.rest; s.vx-=(1+rest)*vn*c.nx; s.vy-=(1+rest)*vn*c.ny;
    if(imp>70) this.ev.push(['bounce',s.x,s.y,imp,c.nx,c.ny]); }
   if(c.ny<-.6) grounded=o; }
  // границы поля
  if(s.x<R){s.x=R; if(s.vx<0){ if(-s.vx>70)this.ev.push(['bounce',s.x,s.y,-s.vx,1,0]); s.vx=-s.vx*ch.rest;}}
  if(s.x>LW-R){s.x=LW-R; if(s.vx>0){ if(s.vx>70)this.ev.push(['bounce',s.x,s.y,s.vx,-1,0]); s.vx=-s.vx*ch.rest;}}
  if(s.y<R){s.y=R; if(s.vy<0){ s.vy=-s.vy*ch.rest; this.ev.push(['bounce',s.x,s.y,60,0,1]);}}
  if(s.y>LH-R){s.y=LH-R; if(s.vy>0){ s.vy=-s.vy*ch.rest;} grounded=grounded||{x:0,y:LH,w:LW,h:1};}
  for(const b of this.bumpers){ const dx=s.x-b.x, dy=s.y-b.y, d=Math.hypot(dx,dy); if(d<b.r+R&&d>0){ const nx=dx/d, ny=dy/d; s.x=b.x+nx*(b.r+R); s.y=b.y+ny*(b.r+R); const vn=s.vx*nx+s.vy*ny; if(vn<0){s.vx-=2*vn*nx; s.vy-=2*vn*ny;} s.vx+=nx*140; s.vy+=ny*140; const sp=Math.hypot(s.vx,s.vy); if(sp<360){s.vx*=360/sp;s.vy*=360/sp;} b.hit=.25; this.ev.push(['bumper',b.x,b.y]); } }
  if(s.pcd<=0) for(const p of this.portals){ for(let k=0;k<2;k++){ const ax=p[k*2],ay=p[k*2+1]; if(Math.hypot(s.x-ax,s.y-ay)<13){ const bx=p[2-k*2],by=p[3-k*2]; this.ev.push(['portal',ax,ay,bx,by]); s.x=bx; s.y=by; s.pcd=.6; break; } } }
  for(const c of this.candies) if(!c.got&&Math.hypot(s.x-c.x,s.y-c.y)<17){ c.got=true; this.got++; this.ev.push(['candy',c.x,c.y,this.got]); }
  const g=this.L.goal; if(Math.abs(s.x-g[0])<14&&s.y>g[1]-36&&s.y<g[1]+2){ s.st='win'; s.at=0; s.vx=s.vy=0; this.result='win'; this.ev.push(['win']); return; }
  if(grounded){ s.ground=grounded; s.vx*=Math.pow(.25*(1/ch.fric),dt*(ch.fric)); const rvx=s.vx-(grounded.vx||0);
   if(Math.abs(rvx)<26&&Math.abs(s.vy-(grounded.vy||0))<40){ s.vx=0; s.vy=0; s.st='idle'; this.ev.push(['rest']); } }
  if(s.fly>12){ s.st='idle'; s.vx=s.vy=0; }
 }
 support(){ const s=this.s; if(s.y>=LH-R-.5) return true; for(const o of this.solids.concat(this.movers)){ if(o.type==='s'&&!this.ch.spiky) continue; if(circRect(s.x,s.y+2.5,R,o.x,o.y,o.w,o.h)){ if(o.mover)s.ground=o; return true;} } return false; }
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
function mover(m){ const x=Math.round(m.x), y=Math.round(m.y); ctx.fillStyle='#1a0c22'; ctx.fillRect(x,y,m.w,m.h); ctx.fillStyle='#ffb03c'; ctx.fillRect(x+1,y+1,m.w-2,m.h-2); ctx.fillStyle='#ffe066'; ctx.fillRect(x+1,y+1,m.w-2,1);
 ctx.fillStyle='#c0601c'; ctx.fillRect(x+1,y+m.h-2,m.w-2,1); for(let i=x+3;i<x+m.w-3;i+=6){ ctx.fillStyle='#1a0c22'; ctx.fillRect(i,y+3,3,m.h-5>0?Math.min(3,m.h-5):1); }
 ctx.fillStyle='#fff'; ctx.fillRect(x+2,y+2,1,1); ctx.fillRect(x+m.w-3,y+2,1,1); }

function startLevel(i){ curLevel=i; world=new World(i,selPick); const ti=themeOf(i); lvlCanvas=buildLevelCanvas(LV[i],ti); parts=[];decals=[];floats=[];overlay=null;drag=null;sAnim={a:'idle',t:0};
 scene='play'; tgBack(true); floats.push({s:LV[i].hint,x:LW/2,y:150,t:0,life:2.6,size:11,col:'#fff'}); }
function goBack(){ sfx('tap'); if(scene==='play'){scene='levels';} else if(scene==='levels'){scene='select';} else if(scene==='select'){scene='menu'; tgBack(false);} }
function burst(x,y,n,cols,sp=90,up=0,life=.6,g=300){ for(let i=0;i<n;i++){ const a=Math.random()*Math.PI*2, v=sp*(.3+Math.random()); parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-up,life:life*(.6+Math.random()*.6),t:0,c:cols[i%cols.length],g,s:Math.random()<.3?2:1}); } }
function handleEvents(){ const ch=CHARS[selPick]; for(const e of world.ev){ const [k,x,y]=e;
 if(k==='launch'){ sfx('launch'); haptic('medium'); burst(world.s.x,world.s.y+10,10,['#fff',ch.col],60,20,.4); shake=Math.max(shake,1.5); }
 if(k==='bounce'){ sfx('bounce',e[3]); squash=Math.min(1,e[3]/450); sqDir=[e[4],e[5]]; burst(x-e[4]*R,y-e[5]*R,4+(e[3]/80|0),[ch.col,'#fff'],e[3]*.25,0,.4); if(e[3]>300){shake=Math.max(shake,2);haptic('light');} }
 if(k==='boing'){ sfx('boing'); squash=1; sqDir=[0,-1]; burst(x,y+10,14,['#ff4fa8','#ff9ad0','#fff'],140,60,.6); e[3].hit=.3; shake=Math.max(shake,2); haptic('light'); }
 if(k==='splat'){ sfx('splat'); haptic('heavy'); shake=5; flash=.08; burst(x,y+10,26,[ch.col,ch.col,'#fff','#1a0c22'],170,80,.8); for(let i=0;i<7;i++) decals.push({x:x+(Math.random()*44-22)|0,y:y+R-1+(Math.random()*2|0),w:2+Math.random()*4|0,c:ch.col}); floats.push({s:['ШМЯК!','ПЛЮХ!','ХЛЮП!'][Math.random()*3|0],x,y:y-30,t:0,life:.9,size:14,col:['#fff','#ffd23c']}); sAnim={a:'splat',t:0}; }
 if(k==='candy'){ sfx('candy',e[3]); haptic('light'); burst(x,y,16,['#ffd23c','#fff','#ff4a8a','#4ef0b0'],120,40,.7,120); floats.push({s:'+'+e[3],x,y:y-14,t:0,life:.8,size:11,col:'#ffd23c'}); }
 if(k==='bumper'){ sfx('bumper'); burst(x,y,8,['#ff4a6a','#fff'],110,0,.4); shake=Math.max(shake,2.5); haptic('light'); }
 if(k==='portal'){ sfx('portal'); burst(x,y,14,['#7a5aff','#4ef0ff'],90,0,.5,0); burst(e[3],e[4],14,['#ffb03c','#ffe066'],90,0,.5,0); }
 if(k==='ouch'){ sfx('ouch'); haptic('error'); shake=5; burst(x,y,30,[ch.col,'#fff','#ff4a6a'],200,60,.8); floats.push({s:'АЙ! НА СТАРТ!',x,y:y-24,t:0,life:1,size:11,col:'#ff4a6a'}); }
 if(k==='respawn'){ burst(world.s.x,world.s.y,16,['#fff',ch.col],80,0,.5,0); sAnim={a:'recover',t:0}; }
 if(k==='rest'){ if(sAnim.a!=='splat'&&sAnim.a!=='recover') sAnim={a:'idle',t:0}; }
 if(k==='win'){ sfx('win'); haptic('success'); shake=3; burst(LV[curLevel].goal[0],LV[curLevel].goal[1]-20,50,['#ffd23c','#fff','#ff4a8a','#4ef0b0','#7a5aff'],220,120,1.4,200); setTimeout(()=>{ const st=1+world.got>3?3:Math.max(1,world.got); const stars=Math.min(3,Math.max(1,world.got)); save.stars[curLevel]=Math.max(save.stars[curLevel]||0,stars); store(); overlay={k:'win',stars,phrase:WINS[Math.random()*WINS.length|0]}; overlayT=0; },900); }
 } world.ev.length=0; }

function update(dt){ now+=dt; shake=Math.max(0,shake-dt*20); flash=Math.max(0,flash-dt); squash=Math.max(0,squash-dt*5); overlayT+=dt;
 if(scene==='play'&&world&&!overlay){ const n=4; for(let i=0;i<n;i++) world.step(dt/n); handleEvents();
  const s=world.s; sAnim.t+=dt;
  if(s.st==='splat'){ if(sAnim.a!=='splat'&&sAnim.a!=='recover') sAnim={a:'splat',t:0}; if(sAnim.a==='splat'&&sAnim.t>.3+.35){ sAnim={a:'recover',t:0}; } if(sAnim.a==='recover'&&sAnim.t>.72){ s.st='idle'; sAnim={a:'idle',t:0}; } }
  else if(s.st==='fly') { if(sAnim.a!=='fly') sAnim={a:'fly',t:0}; }
  else if(s.st==='idle'&&sAnim.a==='recover'&&sAnim.t>.72) sAnim={a:'idle',t:0};
  else if(s.st==='idle'&&sAnim.a==='fly') sAnim={a:'idle',t:0};
  if(s.st==='idle'&&world.shots<=0&&!world.result&&!drag){ world.result='fail'; setTimeout(()=>{ if(scene==='play'&&world.result==='fail'){ sfx('fail'); haptic('error'); overlay={k:'fail',phrase:FAILS[Math.random()*FAILS.length|0]}; overlayT=0; } },700); }
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
 for(const m of world.movers) mover(m);
 for(const b of world.bumpers) bumper(b,now);
 for(const p of world.portals){ portal(p[0],p[1],now,0); portal(p[2],p[3],now,1); }
 jar(world.L.goal[0],world.L.goal[1],now,world.result==='win');
 world.candies.forEach((c,i)=>{ if(!c.got) candy(c.x,c.y,now,i); });
 for(const p of parts) if(p.trail){ ctx.globalAlpha=1-p.t/p.life; ctx.fillStyle=p.c; ctx.fillRect(p.x|0,p.y|0,1,1);} ctx.globalAlpha=1;
 // траектория
 if(drag&&s.st==='idle'){ let dx=drag.cx-drag.x0, dy=drag.cy-drag.y0; const l=Math.hypot(dx,dy); if(l>8){ const k=Math.min(l,MAXDRAG)/l, v=560*ch.power/MAXDRAG; let vx=-dx*k*v, vy=-dy*k*v, px=s.x, py=s.y;
   for(let i=0;i<60;i++){ vy+=G0*ch.grav/60; px+=vx/60; py+=vy/60; if(px<0||px>LW||py>LH||py<0) break; let hit=false; for(const o of world.solids) if(px>o.x&&px<o.x+o.w&&py>o.y&&py<o.y+o.h) hit=true; if(hit)break;
    if(i%3===1){ const a=1-i/60, z=i<24?3:2; ctx.globalAlpha=Math.max(.35,a); ctx.fillStyle='#1a0c22'; ctx.fillRect((px|0)-1,(py|0)-1,z+2,z+2); ctx.fillStyle=(i/3|0)%2?ch.col:'#fff'; ctx.fillRect(px|0,py|0,z,z); ctx.globalAlpha=1; } } } }
 // слизень
 if(s.st!=='poof'){ let a=sAnim.a, f=frameOf(a,sAnim.t), flip=false, scx=1, scy=1, dx=s.x, dy=s.y-3;
  if(drag&&s.st==='idle'){ const ddx=drag.cx-drag.x0, ddy=drag.cy-drag.y0, l=Math.min(1,Math.hypot(ddx,ddy)/MAXDRAG); a='pull'; f=Math.round(l*7); flip=ddx>0; }
  if(a==='fly'){ flip=s.vx<0; const q=squash*.35; scx=1+q; scy=1-q; if(Math.abs(sqDir[0])>.6){scx=1-q;scy=1+q;} }
  if(s.st==='win'){ const k=Math.max(0,1-world.s.at); }
  // тень
  ctx.fillStyle='rgba(0,0,0,.25)'; ctx.fillRect(s.x-10|0,(s.y+R)|0,20,2);
  if(world.result==='win'){ const g=world.L.goal; const k=Math.max(.15,1-overlayT*0); }
  drawSlug(ch.id,a,f,dx,dy,flip,scx,scy); }
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
 T('тяни • целься • шмякай',W/2,by+80,9,'#ffe9c0');
 const tot=save.stars.reduce((a,b)=>a+(b||0),0); starIcon(W/2-26,by+100,true); T(tot+' / '+LV.length*3,W/2-18,by+97,10,'#ffd23c','l');
}
function drawSelect(){ drawBG(1,0,now); T('Выбери слизня',W/2,8,16,['#fff','#ff8fc8']);
 const cw=W-24, chh=Math.min(66,Math.floor((H-90)/5)); let y=36;
 CHARS.forEach((c,i)=>{ const sel=i===selPick; const x=12; panel(x,y,cw,chh-6,sel?'#5a2a8a':'#2b1a4a'); if(sel){ ctx.fillStyle=c.col; ctx.fillRect(x+1,y+1,3,chh-8);}
  ctx.save(); ctx.beginPath(); ctx.rect(x,y,cw,chh-6); ctx.clip(); drawSlug(c.id,sel?'fly':'idle',frameOf(sel?'fly':'idle',now+i*.3),x+34,y+(chh-6)/2+(chh>56?2:-2),false,chh<56?.75:1,chh<56?.75:1); ctx.restore();
  T(c.name,x+66,y+6,13,sel?['#fff','#ffd23c']:'#fff','l'); T(c.perk,x+66,y+23,9,c.col,'l'); if(chh>52) T(c.desc,x+66,y+36,8,'#c8b8e8','l');
  buttons.push({x,y,w:cw,h:chh-6,label:'c'+i,cb:()=>{ selPick=i; save.char=i; store(); sfx('candy',i); haptic('tick'); }});
  y+=chh; });
 btn(W/2-55,H-44,110,28,'ПОГНАЛИ',()=>{sfx('tap');scene='levels';},'#4ed05a',14);
}
function drawLevels(){ drawBG(2,0,now); T('Уровни',W/2,8,16,['#fff','#4ef0ff']); iconBtn(4,8,icBack,()=>goBack(),'back');
 const cols=3, cw=Math.floor((W-30)/cols), chh=Math.min(70,Math.floor((H-80)/4)); 
 LV.forEach((L,i)=>{ const x=12+(i%cols)*cw+3, y=40+Math.floor(i/cols)*chh; const open=i===0||(save.stars[i-1]||0)>0; const st=save.stars[i]||0; const ti=themeOf(i);
  const col=open?(['#ff9a5c','#ff5aa8','#4ea0ff'][ti]):'#4a3a5a';
  btn(x,y,cw-6,chh-10,'',open?()=>{sfx('tap');startLevel(i);}:()=>{sfx('bounce',50);haptic('error');},col); buttons[buttons.length-1].label='L'+i;
  const pr=pressed&&pressed.label==='L'+i?2:0;
  if(open){ T(String(i+1),x+(cw-6)/2,y+5+pr,18,'#fff'); for(let k=0;k<3;k++) starIcon(x+(cw-6)/2-10+k*10,y+chh-26+pr,k<st); }
  else { ctx.fillStyle='#1a0c22'; const lx=x+(cw-6)/2|0, ly=y+(chh-10)/2-4|0; ctx.fillRect(lx-5,ly,11,9); ctx.fillRect(lx-3,ly-5,7,6); ctx.fillStyle='#4a3a5a'; ctx.fillRect(lx-1,ly-3,3,4); ctx.fillStyle='#ffd23c'; ctx.fillRect(lx-4,ly+1,9,7); ctx.fillStyle='#1a0c22'; ctx.fillRect(lx,ly+3,1,3); }
 });
 const c=CHARS[selPick]; drawSlug(c.id,'idle',frameOf('idle',now),W/2-30,H-26); T('Играет: '+c.name,W/2-6,H-40,10,'#fff','l'); T(c.perk,W/2-6,H-26,9,c.col,'l');
}
function drawOverlay(){ const k=Math.min(1,overlayT*4); ctx.fillStyle=`rgba(12,4,24,${.6*k})`; ctx.fillRect(0,0,W,H);
 const pw=200, ph=overlay.k==='win'?170:140, px=(W-pw)/2|0, py=Math.floor(H/2-ph/2+(1-k)*40);
 panel(px,py,pw,ph,overlay.k==='win'?'#3a1f6a':'#4a1a3a');
 if(overlay.k==='win'){ T('ПОБЕДА!',W/2,py+8,20,['#fff6b0','#ffd23c','#ff9a1c']); T(overlay.phrase,W/2,py+34,10,'#7affe0');
  for(let i=0;i<3;i++){ const on=i<overlay.stars&&overlayT>.4+i*.3; if(on&&!pops[i]){pops[i]=1; sfx('star',i); burst(W/2-30+i*30-ox,py+60-oy,10,['#ffd23c','#fff'],80,0,.5,0); }
   const sc=on?Math.max(1,2.2-(overlayT-.4-i*.3)*4):1; ctx.save(); ctx.translate(W/2-30+i*30,py+58); ctx.scale(sc>1.01?Math.round(sc*2)/2:1,sc>1.01?Math.round(sc*2)/2:1); ctx.scale(2,2); starIcon(0,0,on,2); ctx.restore(); }
  btn(px+14,py+ph-44,80,28,'ЕЩЁ',()=>{sfx('tap');startLevel(curLevel);},'#6a4fd8',13);
  if(curLevel<LV.length-1) btn(px+pw-94,py+ph-44,80,28,'ДАЛЬШЕ',()=>{sfx('tap');startLevel(curLevel+1);},'#4ed05a',13); else btn(px+pw-94,py+ph-44,80,28,'МЕНЮ',()=>{sfx('tap');scene='menu';tgBack(false);},'#4ed05a',13);
  if(curLevel===LV.length-1) T('Все уровни пройдены!',W/2,py+ph-60,9,'#ffd23c');
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
 if(scene==='play'&&world&&!overlay&&world.s.st==='idle'&&world.shots>0){ drag={x0:x-ox,y0:y-oy,cx:x-ox,cy:y-oy,id:e.pointerId}; lastPullF=-1; try{cv.setPointerCapture(e.pointerId)}catch(_){} } });
cv.addEventListener('pointermove',e=>{ const [x,y]=lp(e); if(drag){ drag.cx=x-ox; drag.cy=y-oy; const f=Math.round(Math.min(1,Math.hypot(drag.cx-drag.x0,drag.cy-drag.y0)/MAXDRAG)*7); if(f!==lastPullF){ if(lastPullF>=0) {sfx('stretch',f); if(f%2===0)haptic('tick');} lastPullF=f; } }
 else if(pressed){ const b=hit(x,y); if(b!==pressed&&!(b&&b.label===pressed.label)) pressed=null; } });
function up(e){ const [x,y]=lp(e); if(drag){ const d=drag; drag=null; if(world&&world.launch(d.cx-d.x0,d.cy-d.y0)){ } return; }
 if(pressed){ const b=hit(x,y); const p=pressed; pressed=null; if(b&&b.label===p.label) p.cb(); } }
cv.addEventListener('pointerup',up); cv.addEventListener('pointercancel',()=>{drag=null;pressed=null;});
window.addEventListener('keydown',e=>{ if(e.key==='r'&&scene==='play')startLevel(curLevel); if(e.key==='Escape')goBack(); });

// ---------- цикл ----------
let last=performance.now();
function loop(t){ let dt=Math.min(.05,(t-last)/1000); last=t; update(dt); render(); requestAnimationFrame(loop); }
function initMenuSlugs(){ menuSlugs=CHARS.map((c,i)=>({id:c.id,x:W*(i+1)/6,y:H-60+3,gy:H-60+3,vy:0,vx:0,o:i*.37,flip:i%2===1})); }
tgInit(); resize();
loadSprites().then(()=>{ initMenuSlugs(); requestAnimationFrame(loop); });
window.addEventListener('resize',()=>initMenuSlugs());
// хуки для тестов
window.__game={get scene(){return scene}, set scene(v){scene=v}, startLevel, get world(){return world}, World, LV, CHARS, setChar:i=>{selPick=i}, get overlay(){return overlay}, toLevel:(x,y)=>[x*W/ (cv.getBoundingClientRect().width)]};
})();
