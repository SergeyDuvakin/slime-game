// Ф1у: модуль «живого UI» (ТЗ 26.12.11, 27.11). Только целые пиксели, все анимации гаснут при «Меньше движения» (RM()).
(function(){
const EASE={linear:t=>t,outQuad:t=>1-(1-t)*(1-t),inQuad:t=>t*t,outCubic:t=>1-Math.pow(1-t,3),inOutQuad:t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2,outBack:(t,s=1.70158)=>{const c=s+1;return 1+c*Math.pow(t-1,3)+s*Math.pow(t-1,2);}};
const UIA={press:.05,release:.14,toggle:.12,scene:.18,sceneRM:.12,iris:.25,popIn:.22,popOut:.14,star:.25,countMax:.8,countPer:.04,shakeMax:7,shine:3.2,shineT:.4};
const cl=t=>t<0?0:t>1?1:t;
// tw: значение анимации по времени старта t0, длительности d и изингу → [0..1]
function tw(now,t0,d,e){ return (EASE[e]||EASE.linear)(cl((now-t0)/d)); }
// count-up: всегда кончается точным значением
const CU={};
function countUp(key,target,now,onTick){ target=target|0; let c=CU[key]; if(!c){ CU[key]={v:target,from:target,to:target,t0:now,d:0,last:target}; return target; }
 if(c.to!==target){ c.from=c.v; c.to=target; c.t0=now; c.d=Math.min(UIA.countMax,UIA.countPer*Math.abs(target-c.from)); }
 const k=c.d>0?EASE.outQuad(cl((now-c.t0)/c.d)):1; c.v=Math.round(c.from+(c.to-c.from)*k); if(k>=1) c.v=c.to;
 if(onTick&&c.v!==c.last){ onTick(c.v===c.to); } c.last=c.v; return c.v; }
window.UIA=UIA; window.EASE=EASE; window.uiTw=tw; window.uiCount=countUp; window.uiCU=CU;
})();
