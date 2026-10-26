/* Ф0 (ТЗ 21/28): пиксельные иконки 12×12 способностей и черт — ABICON[ab]. Символы: k контур, w блик, a основной, b светлый, c акцент, '.' пусто. */
window.ABICON=(function(){const I={
djump:{p:{a:'#7ad7ff',b:'#d4f4ff'},r:['.....kk.....','....kaak....','...kabbak...','..kak..kak..','.kk......kk.','.....kk.....','....kaak....','...kabbak...','..kak..kak..','.kk......kk.','............','............']},
split:{p:{a:'#8fe36b',b:'#d6ffc4'},r:['............','..kkk..kkk..','.kaaak.kaak.','kabwaakbwaak','kaaaaakaaaak','kaaaaakaaaak','.kaaak.kaak.','..kkk...kk..','.....k......','....k.k.....','...k...k....','............']},
chute:{p:{a:'#ff7a7a',b:'#ffd0d0'},r:['...kkkkkk...','..kabababk..','.kabababab k','kkkkkkkkkkkk','.k...k....k.','..k..k...k..','...k.k..k...','....kkkk....','....kaak....','....kaak....','.....kk.....','............']},
dive:{p:{a:'#ffb14a',b:'#ffe2b0'},r:['....kkkk....','....kabk....','....kabk....','....kabk....','....kabk....','.kkkkabkkkk.','..kaaabaak..','...kaabak...','....kaak....','.....kk.....','..k..kk..k..','.k........k.']},
ghost:{p:{a:'#b8dcff',b:'#eef7ff'},r:['....kkkk....','..kkbbbbkk..','.kbbbbbbbbk.','.kbkkbbkkbk.','kbbkkbbkkbbk','kbbbbbbbbbbk','kbbbbaabbbbk','kbbbbbbbbbbk','kbbbbbbbbbbk','kbkbbkkbbkbk','kk.kk..kk.kk','............']},
gflip:{p:{a:'#c99bff',b:'#efe0ff'},r:['..kk........','.kabk.......','kabbak......','.kak........','.kak....kak.','.kak....kak.','.kak....kak.','.kak....kak.','........kak.','......kabbak','.......kbak.','........kk..']},
glide:{p:{a:'#9fe0d0',b:'#e0fff6'},r:['............','k...........','kak.........','kbaak.......','kbbaaakk....','.kbbbaaaakk.','..kbbbbaaaak','...kkbbbbbak','.....kkkbbk.','........kk..','............','............']},
juicy:{p:{a:'#ff5ea8',b:'#ffc6e0'},r:['.....kk.....','.....kk.....','....kaak....','....kaak....','...kaaaak...','..kawaaaak..','..kawaaaak..','.kaaaaaaaak.','.kaaaaaaaak.','..kaaaaaak..','...kkkkkk...','............']},
lucky:{p:{a:'#5fd36b',b:'#c5f5c9'},r:['.kkk....kkk.','kabak..kbaak','kaaak..kaaak','.kaaakkaaak.','..kkkaakkk..','..kkkaakkk..','.kaaakkaaak.','kaaak.kkaaak','kabak.k.kbak','.kkk..k..kk.','......k.....','.....k......']},
magnet:{p:{a:'#ff5a5a',b:'#ffffff',c:'#7a8aa0'},r:['............','.kkkk..kkkk.','.kbbk..kbbk.','.kccк..kcck.','.kaak..kaak.','.kaak..kaak.','.kaakkkkaak.','.kaaaaaaaak.','..kaaaaaak..','...kkkkkk...','............','............']},
melt:{p:{a:'#ffd93c',b:'#fff6c0',c:'#ff8a2a'},r:['.....k......','....kck.....','....kcak....','...kcabak...','...kabbak...','..kabwbak...','..kabbbbak..','...kabbak...','....kkkk....','....kcck....','....kkkk....','............']},
preview:{p:{a:'#7ad7ff',b:'#ffffff'},r:['............','............','...kkkkkk...','.kkbbbbbbkk.','kbbbkkkkbbbk','kbbkaaakkbbk','kbbkaaakkbbk','kbbbkkkkbbbk','.kkbbbbbbkk.','...kkkkkk...','............','............']},
refund:{p:{a:'#5fd36b',b:'#c5f5c9'},r:['....kkkk.k..','..kkaaaakak.','.kaak..kaak.','.kak..kaaak.','kak....kkkk.','kak.........','kak.........','kak....kak..','.kak..kaak..','.kaakkaak...','..kkaaak....','....kkk.....']},
shield:{p:{a:'#5aa8ff',b:'#cfe6ff'},r:['.kkkkkkkkkk.','kbbbbaaaaaak','kbwbbaaaaaak','kbbbbaaaaaak','kbbbbaaaaaak','kaaaaabbbbbk','kaaaaabbbbbk','.kaaaabbbbk.','.kaaaabbbbk.','..kaaabbbk..','...kkaabk...','.....kk.....']},
slowmo:{p:{a:'#ffd93c',b:'#fff6c0'},r:['kkkkkkkkkkkk','.kbbbbbbbbk.','.kbaaaaaabk.','..kbaaaabk..','...kbaabk...','....kaak....','....kbbk....','...kbbabk...','..kbbaaabk..','.kbaaaaaabk.','.kaaaaaaaak.','kkkkkkkkkkkk']},
sponge:{p:{a:'#ffd93c',b:'#c9a020'},r:['............','.kkkkkkkkkk.','kaaaaaabaaak','kabaaaaaaaak','kaaaabaaabak','kaaaaaaaaaak','kaabaaabaaak','kaaaaaaaaaak','kaaaaabaaabk','kabaaaaaaaak','.kkkkkkkkkk.','............']},
wall:{p:{a:'#c87850',b:'#e8a880',c:'#8fe36b'},r:['kkkkkkkkkkkk','kaaakbbbkaak','kkkkkkkkkkkk','kbkaaakbbbak','kkkkkkkkkkck','kaakbbbkkcck','kkkkkkkkkcck','kbbbkaaakkck','kkkkkkkkkkkk','kaakbbbkaaak','kkkkkkkkkkkk','............']},
crush:{p:{a:'#9aa0b0',b:'#e0e4ee',c:'#c87850'},r:['.kkkkkkk....','kbbbbbbbk...','kbaaaaaak...','kaaaaaaakk..','.kkkkkkkk.k.','....kck..kk.','....kck.....','....kck.....','....kck.....','....kck.....','....kkk.....','............']},
bouncy:{p:{a:'#a57af0',b:'#e2d4ff',c:'#d8dee8'},r:['k...kkkk....','...kbbaak...','k.kbwaaaak..','..kaaaaaak..','...kkkkkk...','....kcccck..','...kcckkk...','....kkcccck.','...kcckkk...','....kkcccck.','..kkkkkkkk..','.kccccccccck']},
sticky:{p:{a:'#ff9a3c',b:'#ffd8b0',c:'#8a90a0'},r:['cccccccccccc','kkkkkkkkkkkk','kaaaaaaaaaak','kabbaaaaaaak','.kaaaaaaaak.','.kaakaakaak.','.kak.kak.kak','.kak.kak..k.','..k..kak....','.....kak....','......k.....','............']},
spiky:{p:{a:'#9aa0b0',b:'#e0e4ee',c:'#6a7080'},r:['............','.....kk.....','.....bk.....','....kbak....','.k..kbak..k.','.kk.kbaak.kk','kbk.kbaak.kb','kbakkbaakkba','kbaakbaaakba','kbaakbaaakba','kkkkkkkkkkkk','kccccccccccc']},
extra:{p:{a:'#ff7ab8',b:'#ffd0e6'},r:['............','...kk....k..','...kak..kak.','.kkkakkkaak.','kaaaaaak.ak.','kbbbaabk.ak.','.kkkakkk.ak.','...kak...ak.','...kk...kaak','........kkkk','............','............']},
power:{p:{a:'#ff5a2a',b:'#ffc080'},r:['......kkkk..','.....kbak...','....kbak....','...kbak.....','..kbaakkkk..','.kkkkbbaak..','....kbak....','...kbak.....','..kbak......','..kak.......','..kk........','............']}};
for(const k in I){ I[k].r=I[k].r.map(s=>(s.replace(/[^.kwabc]/g,'k')+'............').slice(0,12)); }
return I;})();
window.ABICON_TRAITS=['bouncy','sticky','spiky','extra','power'];
window.drawAbIcon=function(ctx,ab,x,y,s){ const I=ABICON[ab]; if(!I) return false; s=s||1; const P=Object.assign({k:'#1a1426',w:'#ffffff'},I.p);
 for(let j=0;j<12;j++){ const r=I.r[j]; for(let i=0;i<12;i++){ const ch=r[i]; if(ch==='.') continue; ctx.fillStyle=P[ch]||P.k; ctx.fillRect(Math.round(x)+i*s,Math.round(y)+j*s,s,s); } } return true; };
