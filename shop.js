/* 5.0 / Ф2 — Лавка (ТЗ раздел 2). Только конфеты 🍬: никаких реальных денег, Stars и рекламы.
   Подключается ДО game.js: объявляет фабрику SHOP_MOD(G); game.js в конце своего замыкания вызывает её с мостом G (функции + геттеры now/W/H/save/buttons/ctx …).
   Цены и правила — только в ECON. Сейв: save.shop / save.cos.{neck,trail,splat,voice} (схема в migrateV6, v:5+vx:6). */
window.SHOP_MOD=function(G){
'use strict';
const {textClear,T,btn,panel,pixItem,COSI,anchors,SPR,today,sfx,haptic,tone,noise,mk,ANIM,EGG_ITEMS,candy,TAP,iconBtn,icBack,drawBG,fitTxt,textW,wrapTxt,PC,drawSlugC,frameOf,lockNo,cosGet,cosOpen,cosNeedTxt,skinSprite,store,qEv}=G; const ctx=new Proxy({},{get:(t,k)=>{ const c=G.ctx, v=c[k]; return typeof v==='function'?v.bind(c):v; },set:(t,k,v)=>{ G.ctx[k]=v; return true; }});
const ECON={ tier:{com:40,rare:90,epic:150,set:120,excl:180}, discount:.30, allMarkup:1.25, confirmFrom:150, priceLockMs:120000, vitN:6, trailMax:24, trailLife:.6 };
const O='#1a0c22';
const rnd5=v=>Math.ceil(v/5)*5;
/* ---------- каталог: id, name, slot, price, p (пиксели), pal, [season], [excl] ---------- */
const HD=(id,name,price,pal,p,x={})=>Object.assign({id,name,slot:'head',price,pal:Object.assign({o:O},pal),p},x);
const F=(id,name,price,pal,p,x={})=>Object.assign({id,name,slot:'face',price,pal:Object.assign({o:O},pal),p},x);
const N=(id,name,price,x)=>Object.assign({id,name,slot:'neck',price},x);
const TR=(id,name,price,x)=>Object.assign({id,name,slot:'trail',price},x);
const SP=(id,name,price,x)=>Object.assign({id,name,slot:'splat',price},x);
const FT=(id,name,price,pal,p,x={})=>Object.assign({id,name,slot:'feet',price,pal:Object.assign({o:O},pal),p},x);
const FR=(id,name,price,x)=>Object.assign({id,name,slot:'frame',price},x);
const VO=(id,name,price,x)=>Object.assign({id,name,slot:'voice',price},x);
const CAT=[
 // ---- Шапки (11)
 HD('panama','Панамка',40,{a:'#f2e2b4',b:'#fff8dc',s:'#c4a86e',c:'#4aa8e0',d:'#2a70b0'},[
  '....ooooo....',
  '...obbaaso...',
  '..obaaaaaso..',
  '..occccccdo..',
  'oobaaaaaaasoo',
  'obbaaaaaaaaso',
  '.ooooooooooo.']),
 HD('bandana','Бандана',40,{a:'#e0303a',b:'#ff7a7a',w:'#ffffff',s:'#a01a2a'},[
  '...ooooooo.....',
  '..obawaaabo....',
  '.obaaaawaaso...',
  'obawaaaaawaso..',
  'oaaaawaaaaasooo',
  'ossssssssssoaso',
  '.ooooooooooosao',
  '............oo.']),
 HD('bucket','Ведёрко',40,{a:'#a8b0c0',b:'#e6ecf6',s:'#6a7286',h:'#4a4a5a',r:'#8a92a6'},[
  '.....ooo.....',
  '...oo.h.oo...',
  '..o.ooooo.o..',
  '..oobbaaso...',
  '..obbaaasso..',
  '.orrrrrrrrro.',
  '.obbaaaaasso.',
  'obbaaaaaaasso',
  'ooooooooooooo']),
 HD('capback','Кепка задом',40,{a:'#3a7ae0',b:'#8ab8ff',s:'#2450a0',w:'#ffffff',r:'#e0303a'},[
  '......ooo....',
  '....oowwoo...',
  '...obbaaaso..',
  '..obaaaaaaso.',
  '.obaaaaaaaaso',
  '.orrrrrrrrrro',
  'ossoooooooooo',
  'ooo..........']),
 HD('banana','Шапка-банан',90,{y:'#ffe04a',b:'#fff6a8',s:'#d8a420',t:'#6a4210',g:'#8ac040'},[
  '.oo..........',
  'otgo.........',
  '.oyyoo....oo.',
  '.obyyyooooyto',
  '..obbyyyyyyo.',
  '...oobbyyyso.',
  '.....ooosso..',
  '........oo...']),
 HD('beret','Берет художника',90,{a:'#c02a3a',b:'#ff6070',s:'#801020',t:'#5a0a18'},[
  '.......oo....',
  '.......oto...',
  '...ooooooooo.',
  '.oobbbaaaaaoo',
  'obbaaaaaaaaso',
  'oaaaaaaaaasso',
  '.osssssssssso',
  '..oooooooooo.']),
 HD('beehelm','Пчелиный шлем',90,{y:'#ffd23c',b:'#fff2a0',k:'#2a1a10',s:'#c89a10',e:'#ffffff'},[
  'oo.........oo',
  'oko.......oko',
  '.oo.......oo.',
  '...o.ooo.o...',
  '...oobyyoo...',
  '..obyyyyyso..',
  '.okkkkkkkkko.',
  '.obyyyyyyyso.',
  'okkkkkkkkkkko',
  'ooooooooooooo']),
 HD('mushroom','Шляпа-грибочек',90,{r:'#e0303a',b:'#ff8080',w:'#ffffff',s:'#a01a20',c:'#f6e6c8',d:'#c8b48a'},[
  '....ooooo....',
  '..oobwwrroo..',
  '.obrrwwrrwro.',
  'obwwrrrrrrrso',
  'orwwrrwwrrsso',
  'orrrrrwwrsrso',
  '.ooooooooooo.',
  '....occdo....',
  '....ooooo....']),
 HD('viking','Шлем викинга',150,{g:'#a8b0c0',b:'#eef2f8',s:'#6a7286',h:'#fff4dc',k:'#c8b48a',r:'#c89a3a'},[
  'o...........o',
  'ho.........oh',
  'hko.ooooo.okh',
  '.hkobbgggoko.',
  '..obggggggso.',
  '.obgggggggsso',
  '.orrrrrrrrrro',
  'obgrgrgrgrgso',
  'ooooooooooooo']),
 HD('bowler','Котелок',150,{k:'#2a2a3a',b:'#5a5a72',r:'#a03040',w:'#8a8aa2'},[
  '....ooooo....',
  '...obbkkko...',
  '..obkkkkkko..',
  '..obkkkkkko..',
  '..orrrrrrro..',
  'ooowkkkkkkooo',
  'obbkkkkkkkkko',
  '.ooooooooooo.']),
 HD('foilcrown','Корона из фольги',150,{a:'#c8d0e0',b:'#ffffff',s:'#8a92a6',c:'#ff5aa8',d:'#4ef0ff'},[
  'o...o...o...o',
  'ob.obo.oao.bo',
  'oaoabaoaaaoso',
  'oabaaasabaaso',
  'osacaadaacaso',
  'oaabaasabaaso',
  'ooooooooooooo']),
 // ---- Очки и маски (7)
 F('roundgl','Круглые очки',40,{a:'#c89a3a',b:'#e8f6ff',c:'#ffffff'},[
  '.ooo.....ooo.',
  'oacbo...oacbo',
  'obbbaoooabbbo',
  'obbbo...obbbo',
  '.ooo.....ooo.'],{gl:1,lens:['#c89a3a','#e8f6ff','#ffffff'],eye:['..ooo..', '.oaaao.', 'oacbbao', 'oabbbao', 'oabbbao', '.oaaao.', '..ooo..'],epal:{a:'#c89a3a',b:'rgba(200,236,255,.45)',c:'#ffffff'}}),
 F('heartgl','Очки-сердечки',40,{a:'#ff4a9a',b:'#ff9ac8',c:'#ffffff'},[
  'oo.oo...oo.oo',
  'oacaao.oacaao',
  'oaaaaaoaaaaao',
  '.oaaao.oaaao.',
  '..oao...oao..',
  '...o.....o...'],{gl:1,lens:['#c0206a','#ff4a9a','#ffffff'],eye:['.oo.oo.', 'oaaoaao', 'oacbbao', 'oabbbao', '.oabao.', '..oao..', '...o...'],epal:{a:'#ff4a9a',b:'rgba(255,120,190,.5)',c:'#ffffff'}}),
 F('skimask','Лыжная маска',90,{a:'#ff9a2a',b:'#ffd27a',c:'#ffffff',k:'#3a3a5a'},[
  'kkkooooooookkk',
  'kkoabbaaaaaokk',
  'kkoacaaaaaaokk',
  '..oaaaaaaaso..',
  '...oooooooo...'],{lens:['#3a3a5a','#ff9a2a','#ffffff'],eye:['ooooooooo', 'oaaaaaaao', 'oacbbbbao', 'oabbbbbao', 'oaaaaaaao', '.ooooooo.'],epal:{a:'#ff9a2a',b:'rgba(255,190,90,.55)',c:'#ffffff'}}),
 F('stargl','Очки-звёзды',90,{a:'#ffd23c',b:'#fff6b0',s:'#c89a10'},[
  '..o.......o..',
  '.oao.....oao.',
  'oabaooooabaao',
  '.oaao...oaao.',
  'oao.o...oao.o',
  'o...o...o...o'],{gl:1,lens:['#c89a10','#ffd23c','#fff6b0'],eye:['...o...', '..oao..', 'ooacaoo', 'oabbbao', '.oabao.', 'oaoooao', 'oo...oo'],epal:{a:'#ffd23c',b:'rgba(255,240,140,.5)',c:'#ffffff'}}),
 F('heromask','Маска супергероя',90,{r:'#e0303a',b:'#ff7a7a',s:'#901020'},[
  'oooooooooooooo',
  'orbbrrrrrrrrso',
  'oo..oorrro..oo',
  'or..orrrro..so',
  '.oooo.ooo.ooo.'],{lens:['#901020','#e0303a','#ff7a7a'],eye:['ooooooooo', 'orbrrrrso', 'orr...rso', 'orr...rso', 'orrrrrrso', '.ooooooo.'],epal:{r:'#e0303a',b:'#ff7a7a',s:'#901020'}}),
 F('pincenez','Пенсне',150,{a:'#ffd23c',b:'#d8f0ff',c:'#ffffff',g:'#c89a3a'},[
  '.ooo...ooo..',
  'obcao.obcao.',
  'obbaoooobbao',
  '.ooo...ooo.g',
  '..........g.',
  '.........g..'],{gl:1,lens:['#c89a3a','#d8f0ff','#ffffff'],eye:['.ooo..', 'oacao.', 'oabao.', '.ooo..', '...g..', '....g.'],epal:{a:'#ffd23c',b:'rgba(216,240,255,.45)',c:'#ffffff',g:'#c89a3a'}}),
 F('kaleido','Очки-калейдоскоп',150,{a:'#ff4a6a',b:'#ffd23c',c:'#4ef0ff',d:'#7aff7a',e:'#c87aff',k:'#5a3a8a'},[
  '.ooo.....ooo.',
  'oabco...odeao',
  'oecdkkkkkbcdo',
  'odeao...oabco',
  '.ooo.....ooo.'],{gl:1,anim:1,lens:['#5a3a8a','#c87aff','#ffffff'],eye:['..ooo..', '.oabco.', 'oedcbao', 'oacdeao', 'oabcdeo', '.oedao.', '..ooo..'],epal:{a:'rgba(255,74,106,.7)',b:'rgba(255,210,60,.7)',c:'rgba(78,240,255,.7)',d:'rgba(122,255,122,.7)',e:'rgba(200,122,255,.7)'}}),
 // ---- Усы (5)
 F('brush','Усы-щёточка',40,{a:'#4a2a14',b:'#7a4a24'},[
  '.ooooooo.',
  'obabababo',
  'oaaaaaaao',
  '.ooooooo.'],{st:1}),
 F('horseshoe','Усы-подкова',40,{a:'#5a3018',b:'#8a5028'},[
  '.ooooooooooo.',
  'obaaaaaaaaabo',
  'oaaooooooaaao',
  'oaao.....oaao',
  'oaao.....oaao',
  'oaao.....oaao',
  '.oo.......oo.'],{st:1,top:-3}),
 F('curls','Усы-завитки',90,{a:'#3a2010',b:'#6a4020'},[
  'oo.........oo',
  'oao.ooooo.oao',
  '.oaoabbbaoao.',
  '..oaaaoaaao..',
  '...ooo.ooo...'],{st:1}),
 F('beard','Борода-лопата',90,{a:'#7a4a24',b:'#a87040',s:'#5a3018'},[
  'oo.......oo',
  'obo.....oso',
  'oaaooooooao',
  'obaaaaaaaso',
  'oaabaaaasso',
  '.oaaaaaaso.',
  '.obaaaasso.',
  '..oaaasso..',
  '...oooo....'],{st:1,top:1}),
 F('handlebar','Усы-руль',150,{a:'#2a1a10',b:'#5a3a20'},[
  'o...........o',
  'oo..ooooo..oo',
  '.oaoabbbaoao.',
  '.oaaaaoaaaao.',
  '..oooo.oooo..'],{st:1}),
 // ---- Шея (5)
 N('scarf','Шарф в полоску',40,{kind:'scarf',c:['#e0303a','#ffffff'],sh:'#a01a2a'}),
 N('bowtie','Бабочка',40,{kind:'spr',pal:{o:O,a:'#e0303a',b:'#ff7a7a',s:'#a01a2a'},p:['oo.....oo','obao.oabo','oaaoooaao','oaso.osao','oo.....oo'],dy:-1}),
 N('tie','Галстук',90,{kind:'spr',pal:{o:O,a:'#3a6ae0',b:'#8ab0ff',s:'#2040a0',y:'#ffd23c'},p:['.ooo.','obaso','.oao.','obyao','oaaso','oayso','obaso','.oso.','..o..'],dy:-1}),
 N('bell','Ошейник с колокольчиком',90,{kind:'collar',band:'#c02a3a',bh:'#ff6a6a',pal:{o:O,a:'#ffd23c',b:'#fff6b0',s:'#c89a10',k:'#5a3008'},p:['.ooo.','obaao','oaaso','osaso','.oko.']}),
 N('cape','Плащ-накидка',150,{kind:'cape',out:'#3a6ae0',in:'#e0303a',hi:'#8ab0ff',clasp:'#ffd23c'}),
 // ---- Шлейфы (8)
 TR('bubbles','Пузырьки',40,{fx:'bubble'}),
 TR('pollen','Пыльца',40,{fx:'pollen'}),
 TR('notes','Ноты',90,{fx:'note'}),
 TR('tstars','Звёздочки',90,{fx:'star'}),
 TR('hearts','Сердечки',90,{fx:'heart'}),
 TR('confetti','Конфетти',90,{fx:'confetti'}),
 TR('rainbow','Радуга',150,{fx:'rainbow'}),
 TR('sparks','Искры',150,{fx:'spark'}),
 // ---- Плюхи (6)
 SP('ink','Чернильная клякса',40,{fx:'ink'}),
 SP('sstars','Звёздочки',40,{fx:'star'}),
 SP('sconfetti','Конфетти',90,{fx:'confetti'}),
 SP('pancake','Блин-смайлик',90,{fx:'pancake'}),
 SP('petals','Взрыв лепестков',90,{fx:'petal'}),
 SP('srainbow','Радуга',150,{fx:'rainbow'}),
 // ---- Крики (5 + бесплатный писк)
 VO('hurray','Ура!',40,{snd:'hurray'}),
 VO('quack','Кря',40,{snd:'quack'}),
 VO('yodel','Йодль',90,{snd:'yodel'}),
 VO('riff','Гитарный рифф',90,{snd:'riff'}),
 VO('robot','Робот',90,{snd:'robot'}),
 // ---- Эксклюзивы недели (пул; 180 🍬, ТЗ 2.7)
 HD('tricorne','Пиратская треуголка',180,{k:'#2a1a2a',b:'#5a4a5a',w:'#ffffff',g:'#ffd23c'},[
  'oo.........oo',
  'obo.ooooo.obo',
  'okkobbkkkokko',
  'okkkkkwkkkkko',
  '.okkkwkwkkko.',
  '.ogggggggggo.',
  'ooooooooooooo'],{excl:1}),
 HD('pilot','Шлем пилота',180,{a:'#8a5a2a',b:'#c08a4a',s:'#5a3418',g:'#7ad8ff',w:'#ffffff',k:'#3a3a4a'},[
  '...ooooooo...',
  '..obbaaaaso..',
  '.obaaaaaaaso.',
  'okkokkkkkokko',
  'ogwokkkkkogwo',
  'okkoaaaaaokko',
  'oaso.....oaso',
  'ooo.......ooo'],{excl:1}),
 HD('pumpcrown','Корона-тыква',180,{a:'#ff8a1c',b:'#ffc06a',s:'#c85a10',g:'#ffd23c',l:'#7fd64a',y:'#ffe066'},[
  '......ol.....',
  'o...o.o.o...o',
  'ogo.ogogo.ogo',
  'ogggggggggggo',
  'obaaayaayaaso',
  'oaaasaasaaaso',
  'oaaasaasaasso',
  'ooooooooooooo'],{excl:1}),
 // ---- ещё 9 эксклюзивов (пул 12 → вещь возвращается через 12 недель, ≥ 8 по ТЗ)
 HD('unicorn','Рог единорога',180,{y:'#ffe066',b:'#fff6c0',s:'#e0a020',p:'#ff9ad0',w:'#ffffff'},[
  '......o......',
  '.....oyo.....',
  '.....obso....',
  '....oyyso....',
  '....obsso....',
  '.oo.oyyyo.oo.',
  'opwooooooowpo',
  'oppo.....oppo',
  '.oo.......oo.'],{excl:1}),
 HD('icecrown','Ледяная корона',180,{a:'#9ad8ff',b:'#e8f8ff',s:'#5aa0d8',c:'#4ef0ff',w:'#ffffff'},[
  '..o...o...o..',
  '.obo.obo.obo.',
  '.oaaoaaaoaaso',
  'oaaaaacaaaaso',
  'obaaccwccaaso',
  'oaaaaacaaaaso',
  'ooooooooooooo'],{excl:1}),
 HD('propcap','Кепка с пропеллером',180,{y:'#ffd23c',r:'#ff4a6a',k:'#3a3a4a',a:'#4ab0ff',b:'#9ad8ff',s:'#2a70c0',g:'#ffd23c',d:'#2a70c0'},[
  '.ooooo.ooooo.',
  'oyyyyyokrrrro',
  '.ooooo.ooooo.',
  '.....oko.....',
  '...obaaaso...',
  '..obaagaaso..',
  '.obaaaaaaaso.',
  'ooooooooooooo',
  '.....oddddddo'],{excl:1}),
 HD('wizard','Шляпа волшебника',180,{a:'#5a3ab0',b:'#8a6ae0',s:'#3a2480',y:'#ffd23c',g:'#ffd23c'},[
  '.......oo....',
  '......obao...',
  '.....obaso...',
  '....obaasyo..',
  '....obyaaso..',
  '...obaaaaso..',
  '..oggggggggo.',
  'obbaaaaaaaaso',
  'ooooooooooooo'],{excl:1}),
 HD('knight','Шлем рыцаря',180,{r:'#ff4a6a',a:'#b8c0d0',b:'#eef2fa',s:'#6a7286',k:'#2a2a3a'},[
  '.....ooo.....',
  '....orrro....',
  '...ooorooo...',
  '..obbaaaaso..',
  '.obaaaaaaaso.',
  '.oaakkkkkaso.',
  '.oaaaaaaaaso.',
  '.okakakakaso.',
  'ooooooooooooo'],{excl:1}),
 HD('froghat','Шапка-лягушка',180,{w:'#ffffff',k:'#1a0c22',g:'#5ad84a',b:'#9aff8a',s:'#2a9a3a',r:'#ff8ad0'},[
  '..ooo...ooo..',
  '.owkwo.owkwo.',
  '.owwwooowwwo.',
  '.ogggggggggo.',
  'obgggggggggso',
  'oggrrrrrrrgso',
  'ogggggggggsso',
  'ooooooooooooo'],{excl:1}),
 HD('wreath','Венок',180,{g:'#5ab04a',p:'#ff9ad0',w:'#ffffff',y:'#ffd23c',d:'#3a8a3a'},[
  '.oo.oo.oo.oo.',
  'opgwgygpgwgyo',
  'odgdgdgdgdgdo',
  '.ooooooooooo.'],{excl:1}),
 HD('catears','Ушки котика',180,{a:'#8a8aa0',p:'#ff9ad0',s:'#5a5a70'},[
  '.o.........o.',
  'oao.......oao',
  'oapo.....opao',
  'oappo...oppao',
  'oaaaaoooaaaso',
  '.ooooooooooo.'],{excl:1}),
 HD('cloudhat','Облачко',180,{w:'#ffffff',b:'#ffffff',s:'#c8d8f0',y:'#ffd23c'},[
  '....ooo......',
  '..oowwwoooo..',
  '.owwwwwwwwwo.',
  'owwbwwwwwwwso',
  'owwwwwwwwwsso',
  '.ossssssssso.',
  '..ooooooooo..'],{excl:1}),
 // ---- Сезон: Хэллоуин 25.10–03.11 (ТЗ 2.8)
 HD('pumphat','Тыква-шапка',90,{},null,{season:'hw',egg:'pumpkin'}),
 N('vampcape','Плащ вампира',120,{season:'hw',kind:'cape',out:'#1a1028',in:'#c0102a',hi:'#3a2a5a',clasp:'#ffd23c',collar:1}),
 TR('bats','Летучие мышки',90,{season:'hw',fx:'bat'}),
 SP('web','Паутина',90,{season:'hw',fx:'web'}),
 // ---- Сезон: 8 Марта 01.03–10.03
 HD('tulip','Тюльпан на макушке',40,{r:'#ff4a7a',b:'#ff9ab8',s:'#c0205a',g:'#5ac84a',d:'#2a8a2a'},[
  '..o.o.o..',
  '.orobror.',
  '.orrbrro.',
  '.osrrrso.',
  '..osrso..',
  '...ogo...',
  '.oogdoo..',
  'ogdoooo..',
  '.oo......'],{season:'m8'}),
 HD('daisybow','Бантик-ромашка',40,{w:'#ffffff',g:'#d8d8e8',y:'#ffd23c',s:'#e0a010'},[
  '...ooo...',
  '.oowwwoo.',
  'owwoyoowo',
  'owoyysowo',
  'owwoosowo',
  '.oowwwoo.',
  '...ooo...'],{season:'m8'}),
 TR('mpetals','Лепестки',90,{season:'m8',fx:'petal'}),
 // ---- Низ / тапочки (6): левый башмачок, правый — зеркально; низ спрайта = нижняя строка тела (якорь ft)
 FT('bunny','Тапки-зайцы',40,{w:'#ffffff',p:'#ff9ad0',s:'#d8c8e0'},['o..o....','opopo...','opo.o...','owwwwo..','owwwpwo.','owwwwwo.','ooooooo.']),
 FT('sneak','Кеды',40,{r:'#ff4a6a',w:'#ffffff',s:'#c8c8d8'},['.oooo...','orwwro..','orrrrwo.','orrrrrwo','owwwwwso','oooooooo']),
 FT('flip','Ласты',90,{a:'#2ab0d0',b:'#7ae8ff',s:'#1a7890'},['.ooo.....','obaao....','oaaaaoo..','oaaaaaaoo','oababababo','oooooooooo']),
 FT('boots','Сапожки',90,{a:'#a0603a',b:'#d08a50',s:'#6a3a1a',y:'#ffd23c'},['ooooo...','obaao...','oaaao...','oyyyao..','oaaaaaoo','oaaaaaso','oooooooo']),
 FT('skates','Роликовые',150,{a:'#ff5aa8',b:'#ffb0d8',w:'#ffffff',k:'#3a3a4a',g:'#c8c8d8'},['.oooo...','obaao...','oaaaaoo.','oaaaaaao','owwwwwwo','oooooooo','.okg.okg']),
 FT('valenki','Валенки',90,{a:'#8a8aa0',b:'#b8b8cc',s:'#5a5a70',r:'#ff4a6a'},['ooooo...','obaao...','oaaao...','orrro...','oaaaaoo.','oaaaaaso','oooooooo']),

 // ---- Сеты (ТЗ 2.5): 6 сетов × 3 вещи по 120 🍬; бонус — только когда надеты все 3
 HD('bicorne','Треуголка пирата',120,{k:'#2a1a2a',w:'#ffffff',g:'#ffd23c',r:'#e0303a'},[
  '...ooooooo...',
  '.ookkkkkkkoo.',
  'okkkkwwwkkkko',
  'okkkkwkwkkkko',
  'okkkkkwkkkkko',
  '.orrrrrrrrro.',
  'ooooooooooooo'],{set:'pirate'}),
 F('eyepatch','Повязка на глаз',120,{k:'#2a1a2a',s:'#5a4a5a'},[
  '.ooo.........',
  'okkko........',
  'okkkooooooooo',
  'oksko........',
  '.ooo.........'],{set:'pirate',gl:1,one:1,lens:['#2a1a2a','#2a1a2a','#5a4a5a'],eye:['.ooooo.','okkkkko','okkskko','okkkkko','okkkkko','.ooooo.'],epal:{k:'#2a1a2a',s:'#5a4a5a'}}),
 N('parrot','Попугай на плече',120,{set:'pirate',kind:'spr',side:1,pal:{o:O,r:'#e0303a',w:'#ffffff',y:'#ffd23c',g:'#3ac84a',b:'#2a7aff'},p:['.ooo..','orrwo.','orrryo','oggoo.','oggbo.','.oggo.','..oo..'],dy:-6}),
 HD('aquahelm','Шлем-аквариум',120,{b:'rgba(170,230,255,.55)',w:'#ffffff',g:'#c8c8d8',s:'#8a8aa0'},[
  '....ooooo....',
  '..oobwbbboo..',
  '.obwbbbbbbbo.',
  'obwbbbbbbbbbo',
  'obbbbbbbbbbbo',
  'ogggsgggsgggo',
  'ooooooooooooo'],{set:'cosmo'}),
 N('jetpack','Ранец со звёздами',120,{set:'cosmo',kind:'jet',a:'#c8c8d8',b:'#ffffff',s:'#8a8aa0',y:'#ffd23c',f:'#ff8a2a'}),
 TR('stardust','Звёздная пыль',120,{set:'cosmo',fx:'stardust'}),
 HD('chefhat','Колпак шефа',120,{w:'#ffffff',s:'#d8d8e8'},[
  '...oo.oo.oo..',
  '..owwowwowwo.',
  '.owwwwwwwwwso',
  '.owwwwwwwwwso',
  '..owwwwwwwso.',
  '..ossssssso..',
  '..ooooooooo..'],{set:'chef'}),
 F('chefmust','Усы-щётка шефа',120,{a:'#3a2010',b:'#6a4020'},[
  'oo.......oo',
  'obooooooobo',
  '.obababab o',
  '..ooooooo..'].map(r=>r.replace(' ','a')),{set:'chef',st:1}),
 SP('flour','Мука',120,{set:'chef',fx:'flour'}),
 HD('mohawk','Ирокез',120,{r:'#ff3a8a',p:'#ff9ad0',k:'#2a1a2a'},[
  '.....oo......',
  '....orpo.....',
  '....orrpo....',
  '...orrrrpo...',
  '...orrrrro...',
  '..okkkkkkko..',
  '..ooooooooo..'],{set:'rock'}),
 F('boltgl','Очки-молнии',120,{y:'#ffd23c',k:'#2a1a2a',w:'#fff6b0'},[
  'ooooo...ooooo',
  'oywko...oywko',
  'okyyooooookyy',
  'oyyko...oyyko',
  'ooooo...ooooo'].map(r=>r.slice(0,13)),{set:'rock',gl:1,lens:['#2a1a2a','#ffd23c','#fff6b0'],eye:['ooooo','oywko','okyyo','oyyko','ooooo'],epal:{y:'#ffd23c',k:'#2a1a2a',w:'#fff6b0'}}),
 VO('rriff','Рифф рокера',120,{set:'rock',snd:'riff2'}),
 HD('fedora','Шляпа-федора',120,{a:'#8a6a4a',b:'#b08a60',k:'#2a1a2a',s:'#5a4028'},[
  '...ooooooo...',
  '..oabaoaaao..',
  '..oaaaaaaao..',
  '..okkkkkkko..',
  'ooaaaaaaaaaoo',
  'obaaaaaaaaaso',
  '.ooooooooooo.'],{set:'detective'}),
 F('magnif','Лупа',120,{a:'#c89a3a',b:'rgba(216,240,255,.5)',c:'#ffffff',g:'#5a3018'},[
  '.........ooo.',
  '........oacao',
  '........oabao',
  '.........ooo.',
  '........g....',
  '.......g.....'],{set:'detective',gl:1,lens:['#c89a3a','#d8f0ff','#ffffff'],eye:['.ooo.','oacao','oabao','.ooo.','g....'],epal:{a:'#c89a3a',b:'rgba(216,240,255,.5)',c:'#ffffff',g:'#5a3018'}}),
 N('trench','Плащ сыщика',120,{set:'detective',kind:'cape',out:'#a0805a',in:'#6a4a2a',hi:'#c8a878',clasp:'#5a3018',collar:1}),
 HD('santahat','Шапка Деда Мороза',120,{r:'#e0303a',s:'#a01a2a',w:'#ffffff',g:'#d8e0f0'},[
  '..........oo.',
  '.......ooowwo',
  '.....oorrrowo',
  '...oorrrrso..',
  '..orrrrrrrso.',
  '.owwwwwwwwwo.',
  'owwgwwwwgwwwo',
  '.ooooooooooo.'],{set:'ny',season:'ny'}),
 N('garland','Шарф-гирлянда',120,{set:'ny',season:'ny',kind:'scarf',c:['#2aa04a','#ffd23c'],sh:'#1a6a2a'}),
 TR('snowfl','Снежинки',120,{set:'ny',season:'ny',fx:'snow'}),
 // ---- День рождения (±3 дня от даты в Настройках)
 HD('cakehat','Колпак-тортик',0,{y:'#ffd23c',r:'#ff8a2a',w:'#ffffff',s:'#ff9ac8',p:'#ff8ad0',k:'#8a4a2a',c:'#ffe8f4'},[
  '.....y.....',
  '....yry....',
  '.....w.....',
  '.....s.....',
  '..ooooooo..',
  '.occcccccp.',
  '.okkkkkkko.',
  '.owpwpwpwo.',
  'ooooooooooo'],{season:'bd',gift:1}),
 SP('candles','Свечки',40,{season:'bd',fx:'candles'}),
 // ---- 5.1 Гибридариум: награды глав (не продаются, выдаются за босса главы)
 HD('hzflask','Шапка «Пробирка»',0,{c:'#b8783c',d:'#d89a58',e:'#8a5428',b:'#9ad8ff',w:'#ffffff',g:'#2ad0a0',l:'#7affe0',y:'#c8f0ff',s:'#5a6278',h:'#8a92a8',k:'#3a4258'},[
  '.....oooooo.....',
  '.....oddddo.....',
  '.....ocecco.....',
  '....oooooooo....',
  '....obwbbbbo....',
  '....obwbbybo....',
  '....owbbbbbo....',
  '....ollllllo....',
  '....oglgygyo....',
  '....oggygggo....',
  '....oglggggo....',
  '....ogggglgo....',
  '.oooooooooooooo.',
  'ohhhhhhhhhhhhhso',
  'oskskskskskskkso',
  '.oooooooooooooo.'],{season:'hz',gift:1,hz:1}),
 TR('hzsoap','Мыльные пузыри',0,{fx:'soap',season:'hz',gift:1,hz:1}),
 F('hzweld','Очки «Сварщик»',0,{a:'#8a92a8',b:'#1e6a4a',c:'#9affc8',d:'#5a6278'},[
  '.oooo...oooo.',
  'oacbao.oacbao',
  'obbbbaoabbbbo',
  'obbbbdddbbbbo',
  'odbbdo.odbbdo',
  '.oooo...oooo.'],{gl:1,lens:['#8a92a8','#1e6a4a','#9affc8'],eye:['..ooo..','.oaaao.','oacbbao','oabbbao','oabbbao','.oaaao.','..ooo..'],epal:{a:'#8a92a8',b:'rgba(30,106,74,.85)',c:'#9affc8'},season:'hz',gift:1,hz:1}),
 N('hzbee','Пчелиный шарфик',0,{kind:'scarf',c:['#ffd23c','#1a0c22'],sh:'#c89a10',season:'hz',gift:1,hz:1}),
 SP('hzgum','Жвачный пузырь',0,{fx:'gumbub',season:'hz',gift:1,hz:1}),
 // ---- Рамки (6): карточка выбора, бестиарий, гардероб
 FR('frwood','Деревянная',40,{fr:'wood'}), FR('frsilver','Серебряная',90,{fr:'silver'}), FR('frneon','Неоновая',90,{fr:'neon'}), FR('frjelly','Мармеладная',90,{fr:'jelly'}), FR('frgold','Золотая',150,{fr:'gold'}), FR('frlegend','Неделька-легенда',180,{fr:'gold',chest:1}), FR('frweek','Гибрид недели',180,{fr:'week',chest:1}),
];
const SEASONS=[{id:'bd',name:'День рождения',from:[0,0],to:[0,0]},{id:'hw',name:'Хэллоуин',from:[10,25],to:[11,3]},{id:'ny',name:'Новый год',from:[12,20],to:[1,10]},{id:'m8',name:'8 Марта',from:[3,1],to:[3,10]}];
for(const it of CAT){ if(it.egg) Object.defineProperty(it,'p',{get:()=>EGG_ITEMS[it.egg].p}), Object.defineProperty(it,'pal',{get:()=>EGG_ITEMS[it.egg].pal});
 else if(it.p){ const w=Math.max(...it.p.map(r=>r.length)); it.p=it.p.map(r=>r.padEnd(w,'.')); }
 if(it.kind==='spr'||it.kind==='collar'){ const w=Math.max(...it.p.map(r=>r.length)); it.p=it.p.map(r=>r.padEnd(w,'.')); }
 if(it.eye){ const w=Math.max(...it.eye.map(r=>r.length)); it.eyeItem={id:it.id+'_eye',p:it.eye.map(r=>r.padEnd(w,'.')),pal:Object.assign({o:O},it.epal)}; }
 it.shop=1; it.need={shop:1}; }
const BY={}; for(const it of CAT) BY[it.id]=it;
const SETS=[{id:'pirate',name:'Пират',bonus:'флаг и «Йо-хо-хо!» на победу'},{id:'cosmo',name:'Космонавт',bonus:'отсчёт 3-2-1 на запуске, пыль ярче'},{id:'chef',name:'Повар',bonus:'«Вкуснотища!» за конфету'},{id:'rock',name:'Рокер',bonus:'соло гитары на комбо ×3'},{id:'detective',name:'Детектив',bonus:'тайник «zZ» виден издалека'},{id:'ny',name:'Новый год',bonus:'снег и бубенцы на победу'}];
for(const S of SETS) S.items=CAT.filter(i=>i.set===S.id).map(i=>i.id);
function setOn(id){ const S=SETS.find(s=>s.id===id); if(!S) return false; const cz=cosGet(); return S.items.every(i=>cz[BY[i].slot]===i); }
function setsWorn(){ return SETS.filter(s=>setOn(s.id)).map(s=>s.id); }
window.SHOP_CAT=CAT;
/* шапки/лица из Лавки — в общий COSI, чтобы гардероб, якоря и drawSlugC работали как раньше */
for(const it of CAT) if(it.slot==='head'||it.slot==='face') COSI[it.slot].push(it);
const SLOTS=['neck','feet','trail','splat','voice','frame']; for(const s of SLOTS) COSI[s]=CAT.filter(i=>i.slot===s);
/* ---------- даты, сид, ротация ---------- */
const ymd=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
function hash(s){ let h=2166136261>>>0; for(let i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619)>>>0; } return h>>>0; }
function rng(seed){ let a=seed>>>0; return ()=>{ a=(a+0x6D2B79F5)>>>0; let t=a; t=Math.imul(t^(t>>>15),t|1); t^=t+Math.imul(t^(t>>>7),t|61); return ((t^(t>>>14))>>>0)/4294967296; }; }
function isoWeek(d){ const t=new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())); const dn=(t.getUTCDay()+6)%7; t.setUTCDate(t.getUTCDate()-dn+3); const y=t.getUTCFullYear(); const f=new Date(Date.UTC(y,0,4)); return {y,w:1+Math.round(((t-f)/864e5-3+((f.getUTCDay()+6)%7))/7)}; }
function bdayOn(d=today()){ const b=G.save.set&&G.save.set.bday; if(!b||!/^\d\d-\d\d$/.test(b)) return false; const m=+b.slice(0,2)-1, dd=+b.slice(3); const t0=new Date(d.getFullYear(),d.getMonth(),d.getDate()); for(const y of [d.getFullYear()-1,d.getFullYear(),d.getFullYear()+1]){ const bd=new Date(y,m,dd); if(bd.getMonth()!==m) bd.setDate(0); if(Math.abs(Math.round((t0-bd)/864e5))<=3) return true; } return false; }
function bdTick(){ if(!bdayOn()) return false; if(owns('cakehat')) return false; sh().own.push('cakehat'); store(); G.floats.push({s:'С днём рождения! Подарок: Колпак-тортик 🎂',x:G.W/2-G.ox,y:G.H*.2-G.oy,t:0,life:3,size:13,col:['#fff','#ffd23c']}); try{ sfx('win'); }catch(e){} return true; }
function seasonOn(id,d=today()){ if(id==='bd') return bdayOn(d); const S=SEASONS.find(s=>s.id===id); if(!S) return false; const v=(d.getMonth()+1)*100+d.getDate(), a=S.from[0]*100+S.from[1], b=S.to[0]*100+S.to[1]; return a<=b?(v>=a&&v<=b):(v>=a||v<=b); }
function curSeason(d=today()){ const s=SEASONS.find(x=>seasonOn(x.id,d)&&CAT.some(i=>i.season===x.id)); return s||null; }
const sh=()=>{ if(!G.save.shop||typeof G.save.shop!=='object') G.save.shop={own:[],day:'',vit:[],disc:0,wkx:'',wkk:0,seen:[]}; return G.save.shop; };
const owns=id=>sh().own.includes(id);
const basePool=()=>CAT.filter(i=>!i.season&&!i.excl&&!i.chest);
const EXCL=()=>CAT.filter(i=>i.excl);
/* витрина дня: 6 некупленных, сид hash("shop"+YYYY-MM-DD); скидка −30 % на одну; фиксируется в G.save.shop при смене дня */
function vitFor(dateStr,own){ const r=rng(hash('shop'+dateStr)); const pool=basePool().filter(i=>!own.includes(i.id)).map(i=>i.id).sort(); for(let i=pool.length-1;i>0;i--){ const j=Math.floor(r()*(i+1)); [pool[i],pool[j]]=[pool[j],pool[i]]; } const vit=pool.slice(0,ECON.vitN); return {vit,disc:vit.length?Math.floor(r()*vit.length):0}; }
function weekKey(d=today()){ const {y,w}=isoWeek(d); return y*100+w; }
function exclFor(wk){ const P=EXCL(); if(!P.length) return null; const n=Math.floor(wk/100)*53+wk%100; return P[n%P.length].id; }
function roll(){ const s=sh(), d=today(), k=ymd(d); let ch=false; if(s.day!==k){ const v=vitFor(k,s.own); s.day=k; s.vit=v.vit; s.disc=v.disc; ch=true; } const wk=weekKey(d); if(s.wkk!==wk){ s.wkk=wk; s.wkx=exclFor(wk)||''; ch=true; } if(ch) store(); return s; }
function msToMidnight(){ const d=today(), m=new Date(d.getFullYear(),d.getMonth(),d.getDate()+1); return m-d; }
function daysToMonday(){ const d=today(); const dn=(d.getDay()+6)%7; return 7-dn; }
/* цена вещи в контексте: vit (витрина, со скидкой), all (каталог ×1.25, если не на витрине), season, excl */
function priceOf(id,where){ const it=BY[id]; if(!it) return Infinity; const s=roll(); const vi=s.vit.indexOf(id);
 if(it.excl) return ECON.tier.excl;
 if(it.season) return it.price;
 if(vi>=0) return vi===s.disc?rnd5(it.price*(1-ECON.discount)):it.price;
 return rnd5(it.price*ECON.allMarkup); }
function canBuy(id){ const it=BY[id]; if(!it||owns(id)||it.chest||it.gift) return false; if(it.season&&!seasonOn(it.season)) return false; if(it.excl&&roll().wkx!==id) return false; return true; }
/* покупка атомарна: проверка → candy -= → own.push → store() в одном тике; баланс в минус не уходит */
function buy(id,price){ if(!canBuy(id)) return {ok:false,why:'nope'}; price=Math.round(+price); if(!(price>0)||!isFinite(price)) return {ok:false,why:'price'}; const c=G.save.candy|0; if(c<price) return {ok:false,why:'candy',need:price-c};
 G.save.candy=c-price; sh().own.push(id); store(); return {ok:true}; }
function equip(id){ const it=BY[id]; if(!it) return; const cz=cosGet(); const k=it.slot; if(!owns(id)) return; cz[k]=cz[k]===id?'':id; store(); }
/* ---------- шея: геометрия от атласа (якорь nk = между ртом и низом тела) ---------- */
const aCache={};
function alphaOf(id){ if(aCache[id]) return aCache[id]; const im=SPR[id]; if(!im||!im.width) return null; const [c,x]=mk(1024,320); x.drawImage(im,0,0); const d=x.getImageData(0,0,1024,320).data; const a=new Uint8Array(1024*320); for(let i=0;i<a.length;i++) a[i]=d[i*4+3]>128?1:0; return aCache[id]=a; }
function neckGeo(id,anim,f){ const A=anchors(id), al=alphaOf(id); if(!A||!al||!A[anim]||!A[anim][f]) return null; const a=A[anim][f], An=ANIM[anim], cx0=f*An.w, cy0=An.row*64; const op=(x,y)=>x>=0&&x<An.w&&y>=0&&y<64&&al[(cy0+y)*1024+cx0+x];
 const nk=Math.round(Math.min(a.by-7,a.moy+4)); const run=y=>{ let s=Math.round(a.mx); if(!op(s,y)){ let k=0; while(k<12&&!op(s+k,y)&&!op(s-k,y)) k++; s=op(s+k,y)?s+k:s-k; if(!op(s,y)) return null; } let L=s,R=s; while(op(L-1,y)) L--; while(op(R+1,y)) R++; return [L,R]; };
 const rows={}; for(let y=nk-8;y<=Math.min(63,a.by+1);y++) rows[y]=run(y); return {a,nk,op,rows,w:An.w}; }
const nkCache={};
function neckLayer(id,anim,f,it,layer){ const key=id+'|'+anim+'|'+f+'|'+it.id+'|'+layer; if(nkCache[key]!==undefined) return nkCache[key]; const G=neckGeo(id,anim,f); if(!G) return null; const {a,nk,op,rows,w}=G; const [c,x]=mk(w,64); const px=(xx,yy,col)=>{ x.fillStyle=col; x.fillRect(xx,yy,1,1); };
 const r0=rows[nk]; if(!r0){ return nkCache[key]=null; } const fl=anim==='fly'?(f%2):0;
 /* ровная симметричная полоса: ширина = самая широкая строка тела в полосе, центр = центр тела на строке nk */
 const band=(y0b,y1b)=>{ const c0=(r0[0]+r0[1])/2; let hw=1e9; for(let y=y0b;y<=y1b;y++){ const r=rows[y]; if(!r) continue; hw=Math.min(hw,r[1]-c0,c0-r[0]); } if(hw>=1e9) hw=(r0[1]-r0[0])/2; return [Math.round(c0-hw),Math.round(c0+hw)]; }; /* самая узкая строка полосы: ровно, симметрично и нигде не висит в воздухе */
 if(it.kind==='scarf'&&layer==='front'){ const [L,R]=band(nk-1,nk+2); for(let y=nk-1;y<=nk+2;y++) for(let xx=L-1;xx<=R+1;xx++){ const edge=xx<L||xx>R; if(y===nk-1||y===nk+2||edge) px(xx,y,O); else px(xx,y,xx>R-2?it.sh:it.c[((xx-L)>>1)%2]); }
   const tx=Math.round((L+R)/2)+3+fl; const tl=Math.max(3,Math.min(6,a.by-nk-3)); for(let k=0;k<tl;k++){ const y=nk+3+k; px(tx-1,y,O); px(tx+4,y,O); for(let q=0;q<4;q++) px(tx+q,y,k===tl-1?(q%2?O:it.c[0]):q===3?it.sh:it.c[(k>>1)%2]); } px(tx,nk+3+tl,O); px(tx+2,nk+3+tl,O); }
 if(it.kind==='collar'&&layer==='front'){ const [L,R]=band(nk-1,nk+1); for(let y=nk-2;y<=nk+1;y++) for(let xx=L-1;xx<=R+1;xx++) px(xx,y,y===nk-2||y===nk+1||xx<L||xx>R?O:y===nk-1?it.bh:it.band); const pc=pixItem(it); x.drawImage(pc,Math.round((L+R)/2-pc.width/2),nk+1); }
 if(it.kind==='jet'&&layer==='back'){ for(const sd of [-1,1]){ const bx=sd<0?r0[0]-3:r0[1]-1; for(let y=nk-1;y<=nk+7;y++) for(let q=0;q<5;q++){ const e=q===0||q===4||y===nk-1||y===nk+7; px(bx+q,y,e?O:q===1?it.b:q===3?it.s:(y===nk+2?it.y:it.a)); } if(fl||anim==='fly'){ px(bx+1,nk+8,it.f); px(bx+2,nk+8,it.y); px(bx+3,nk+8,it.f); px(bx+2,nk+9,it.f); } } }
 if(it.kind==='spr'&&layer==='front'){ const pc=pixItem(it); x.drawImage(pc,Math.round((r0[0]+r0[1])/2-pc.width/2+(it.side?(r0[1]-r0[0])/2-1:0)),nk-Math.floor(pc.height/2)+(it.dy||0)+(it.id==='tie'?2:0)); }
 if(it.kind==='cape'){ if(layer==='back'){ let last=r0; const yb=Math.min(63,a.by+3); for(let y=nk;y<=yb;y++){ const r=rows[y]||last; last=r; const sp=3+Math.floor((y-nk)/3); const L=r[0]-sp, R=r[1]+sp; const bottom=y===yb; for(let xx=L;xx<=R;xx++){ const wave=fl&&bottom&&((xx>>1)%2); if(bottom) px(xx,y-(wave?1:0),O); else px(xx,y,xx===L||xx===R?O:xx===L+1?it.hi:xx===R-1?it.in:it.out); } }
    if(it.collar){ const rr=rows[nk-1]||r0; for(const s of [-1,1]){ const bx=s<0?rr[0]-1:rr[1]+1; for(let k=0;k<7;k++){ const wdt=Math.max(1,4-Math.floor(k/2)); for(let q=0;q<wdt;q++){ const xx=bx+s*q; px(xx,nk-k,q===wdt-1?O:k===0?O:it.in); } } } } }
   else { const cx=Math.round((r0[0]+r0[1])/2); x.fillStyle=O; x.fillRect(cx-2,nk-1,5,4); x.fillStyle=it.clasp; x.fillRect(cx-1,nk,3,2); x.fillStyle='#fff6b0'; x.fillRect(cx-1,nk,1,1); } }
 return nkCache[key]=c; }
/* вызывается из drawSlugC (внутри уже сдвинутого/отражённого ctx): layer back — до спрайта, front — после */
function drawNeck(id,anim,f,layer,px0,py0,tryIt){ const cz=cosGet(); const nid=tryIt&&tryIt.slot==='neck'?tryIt.id:cz.neck; if(!nid) return; const it=BY[nid]; if(!it) return; const c=neckLayer(id,anim,f,it,layer); if(c) ctx.drawImage(c,-px0,-py0); }
/* ---------- Низ: якорь ft = нижняя строка основного тела (самый длинный сплошной кусок ≥ 30 % ширины тела), 2 точки симметрично от центра этой строки ---------- */
const ftCache={};
function feetGeo(id,anim,f){ const k=id+'|'+anim+'|'+f; if(ftCache[k]!==undefined) return ftCache[k]; const al=alphaOf(id), An=ANIM[anim]; if(!al||!An) return ftCache[k]=null; const cx0=f*An.w, cy0=An.row*64, W=An.w;
 const raw=(x,y)=>x>=0&&x<W&&y>=0&&y<64&&al[(cy0+y)*1024+cx0+x];
 // главное тело = самая большая связная область (шлейфы, капли, глаза-на-стебельках отдельно не считаются)
 const lab=new Int32Array(W*64).fill(-1); let best=-1,bestN=0,nl=0; for(let y=0;y<64;y++) for(let x=0;x<W;x++){ if(!raw(x,y)||lab[y*W+x]>=0) continue; const st=[y*W+x]; lab[y*W+x]=nl; let n=0; while(st.length){ const q=st.pop(); n++; const qx=q%W, qy=(q-qx)/W; for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const X=qx+dx,Y=qy+dy; if(raw(X,Y)&&lab[Y*W+X]<0){ lab[Y*W+X]=nl; st.push(Y*W+X); } } } if(n>bestN){ bestN=n; best=nl; } nl++; }
 if(best<0) return ftCache[k]=null; const op=(x,y)=>x>=0&&x<W&&y>=0&&y<64&&lab[y*W+x]===best;
 const runs=y=>{ const R=[]; let s=-1; for(let x=0;x<=W;x++){ const o=x<W&&op(x,y); if(o&&s<0) s=x; if(!o&&s>=0){ R.push([s,x-1]); s=-1; } } return R; };
 let maxW=0,y0=64,y1=-1; for(let y=0;y<64;y++) for(const r of runs(y)){ maxW=Math.max(maxW,r[1]-r[0]+1); y0=Math.min(y0,y); y1=Math.max(y1,y); } const need=Math.max(6,Math.round(maxW*.3));
 let sx=0,sn=0; const ym=(y0+y1)/2; for(let y=Math.ceil(ym);y<=y1;y++) for(let x=0;x<W;x++) if(op(x,y)){ sx+=x; sn++; } const mx=sn?sx/sn:W/2;
 let yb=-1, run=null; for(let y=y1;y>=0;y--){ const R=runs(y).filter(r=>r[1]-r[0]+1>=need&&r[0]<=mx+4&&r[1]>=mx-4); if(R.length){ yb=y; run=R[0]; break; } } if(yb<0) return ftCache[k]=null;
 const ups=runs(yb-1).filter(r=>r[0]<=run[1]&&r[1]>=run[0]); const L=ups.length?Math.max(run[0],ups[0][0]):run[0], R=ups.length?Math.min(run[1],ups[ups.length-1][1]):run[1]; const c=(L+R)/2, w=R-L+1;
 const off=w>=16?Math.round(w*.22):w>=10?3:1; const cb=[]; for(let x=0;x<W;x++){ let b=-1; for(let y=yb;y>=0;y--) if(op(x,y)){ b=y; break; } cb.push(b); } return ftCache[k]={yb,L,R,c,w,cl:Math.round(c-off),cr:Math.round(c+off),cb}; }
/* позиция каждого башмачка: x прижат к опоре [L..R], низ = самая высокая из нижних кромок тела под башмачком + 1 (ни один столбец не висит) */
function feetPos(G,w){ const cl=(v,a,b)=>Math.max(a,Math.min(b,v)); const xr=cl(G.cr-2,G.L-1,G.R+2-w), xl=cl(G.cl+3-w,G.L-1,G.R+2-w); const yb=x0=>{ let m=99; for(let i=0;i<w;i++){ const b=G.cb[x0+i]; if(b>=0) m=Math.min(m,b); } return m===99?G.yb:Math.max(G.yb-6,m); }; const y=Math.min(yb(xr),yb(xl)); /* обе на одной высоте — без перекоса */ return [{x0:xr,mir:false,yb:y},{x0:xl,mir:true,yb:y}]; }
function drawFeet(id,anim,f,px0,py0,tryIt){ const cz=cosGet(); const fid=tryIt&&tryIt.slot==='feet'?tryIt.id:cz.feet; if(!fid) return; const it=BY[fid]; if(!it||it.slot!=='feet') return; const g=feetGeo(id,anim,f); if(!g) return; const sp=pixItem(it), h=sp.height, w=sp.width;
 // правый (по экрану) — оригинал, носком вправо; левый — зеркало
 for(const q of feetPos(g,w)){ const t=q.yb+2-h; if(q.mir){ ctx.save(); ctx.translate(q.x0+w-px0,t-py0); ctx.scale(-1,1); ctx.drawImage(sp,0,0); ctx.restore(); } else ctx.drawImage(sp,q.x0-px0,t-py0); } }
/* ---------- частицы шлейфа и плюха ---------- */
const FXP=[], DEC=[]; let fxT=null, fxAcc=0;
const SPRS={
 star:{p:['..o..','.oyo.','oyyyo','.oyo.','o.o.o'].map(r=>r),pal:{o:O,y:'#ffd23c'}},
 heart:{p:['oo.oo','oaoao','oaaao','.oao.','..o..'],pal:{o:O,a:'#ff5aa8'}},
 note:{p:['..oo','..ow','..o.','oow.','oww.','.o..'],pal:{o:O,w:'#ffffff'}},
 bubble:{p:['.ccc.','cw..c','c...c','c...c','.ccc.'],pal:{c:'#9af0ff',w:'#ffffff'}},
 bat0:{p:['o.....o','oo.o.oo','ooooooo','.oo.oo.','...o...'],pal:{o:'#1a1028'}},
 bat1:{p:['...o...','.oooooo','ooooooo','o..o..o','...o...'],pal:{o:'#1a1028'}},
 petal:{p:['.pp','ppw','pp.'],pal:{p:'#ff9ac8',w:'#ffd8ea'}},
 candles:{p:['.y.','yry','.o.','owo','opo','owo','opo','ooo'],pal:{o:O,y:'#ffd23c',r:'#ff8a2a',w:'#ffffff',p:'#ff8ad0'}},
 ink:{p:['....ooo......','..oobbaao.o..','.obbaaaaaaao.','oaaaaaaaaaao.','.oaaaaaaaaao.','...oo..ooo...'],pal:{o:O,a:'#3a3ab0',b:'#8a8af0'}},
 pancake:{p:['...ooooooooo...','.oobbbaaaaaaoo.','obaakaaaaakaaso','oaaaakkkkkaaaso','.ossaaaaaaassso.','...ooooooooo...'],pal:{o:O,a:'#f0b050',b:'#ffd890',s:'#c07a20',k:'#5a2a08'}},
 flake:{p:['.w.w.','w.w.w','.www.','w.w.w','.w.w.'],pal:{w:'#ffffff'}},
 flour:{p:['...wwww....','.wwwwwwwww.','wwwswwwwwsw','.wwwwswwww.','...wwww....'],pal:{w:'#fffaf0',s:'#e8dcc8'}},
 flag:{p:['ooooooooo','okkkkkkko','okkwwwkko','okkwkwkko','okkkwkkko','okwkwkwko','ooooooooo','o........','o........','o........','o........','o........'],pal:{o:O,k:'#1a1028',w:'#ffffff'}},
 web:{p:['w.....w.....w','.w....w....w.','..wwwwwwwww..','..w.w.w.w.w..','wwwwwwwwwwwww','..w.w.w.w.w..','..wwwwwwwww..','.w....w....w.','w.....w.....w'],pal:{w:'#e8e8f8'}},
};
for(const k in SPRS) SPRS[k].id='fx_'+k;
const CONF=['#ff4a6a','#ffd23c','#4ef0ff','#7aff7a','#c87aff','#ff9a2a'], RAIN=['#ff4a4a','#ff9a2a','#ffe04a','#5ad84a','#4a9aff','#a05aff'];
function spawn(k,x,y,o={}){ const p=Object.assign({k,x,y,vx:0,vy:0,g:0,t:0,life:ECON.trailLife,c:null},o); FXP.push(p); if(FXP.length>48) FXP.shift(); }
function trailSpawn(fx,s,i){ const x=s.x+(Math.random()-.5)*6, y=s.y+(Math.random()-.5)*6;
 if(fx==='rainbow'){ spawn('rain',Math.round(s.x),Math.round(s.y)-3,{life:.6}); return; }
 if(fx==='soap'){ if(i%3) return; spawn('soap',x,y,{vy:-14-Math.random()*10,vx:(Math.random()-.5)*16,r:2+(i%4),life:1.1}); return; }
 if(fx==='bubble') spawn('spr',x,y,{s:'bubble',vy:-18,vx:(Math.random()-.5)*10});
 else if(fx==='pollen') spawn('dot',x,y,{c:Math.random()<.5?'#ffe04a':'#fff6a0',vy:-8,vx:(Math.random()-.5)*16,sz:2});
 else if(fx==='note') spawn('spr',x,y,{s:'note',vy:-24,vx:(Math.random()-.5)*14});
 else if(fx==='star') spawn('spr',x,y,{s:'star',vy:-6});
 else if(fx==='heart') spawn('spr',x,y,{s:'heart',vy:-16});
 else if(fx==='confetti') spawn('dot',x,y,{c:CONF[i%CONF.length],vx:(Math.random()-.5)*40,vy:-20,g:120,sz:3,h:2});
 else if(fx==='spark') spawn('dot',x,y,{c:Math.random()<.5?'#ffffff':'#ffe04a',vx:(Math.random()-.5)*80,vy:(Math.random()-.5)*80,sz:Math.random()<.3?2:1,life:.35});
 else if(fx==='bat') spawn('bat',x,y,{vx:(Math.random()-.5)*30,vy:-26,life:.8});
 else if(fx==='petal') spawn('spr',x,y,{s:'petal',vx:(Math.random()-.5)*20,vy:4,g:30});
 else if(fx==='stardust'){ const br=setOn('cosmo'); spawn('dot',x,y,{c:['#ffffff','#9af0ff','#ffd23c','#c8a8ff'][i%4],vx:(Math.random()-.5)*14,vy:(Math.random()-.5)*14,sz:br&&i%3===0?2:1,life:br?.8:.5}); if(br&&i%4===0) spawn('spr',x,y,{s:'star',vy:-4,life:.5}); }
 else if(fx==='snow') spawn('spr',x,y,{s:'flake',vx:(Math.random()-.5)*16,vy:14,g:10,life:.8}); }
function splatFx(fx,x,y){ x=Math.round(x); y=Math.round(y);
 if(fx==='ink'||fx==='pancake'||fx==='web'){ DEC.push({s:fx,x,y,t:0,life:fx==='web'?1.6:1.4}); if(fx==='ink') for(let i=0;i<6;i++) spawn('dot',x,y-2,{c:'#3a3ab0',vx:(Math.random()-.5)*90,vy:-40-Math.random()*50,g:300,sz:2,life:.6}); return; }
 if(fx==='rainbow'){ DEC.push({s:'ring',x,y,t:0,life:.6}); return; }
 if(fx==='gumbub'){ DEC.push({s:'gumbub',x,y,t:0,life:.9}); return; }
 if(fx==='flour'){ DEC.push({s:'flour',x,y,t:0,life:1.3}); for(let i=0;i<14;i++) spawn('dot',x+(Math.random()-.5)*10,y-3,{c:i%3?'#ffffff':'#f0e8d8',vx:(Math.random()-.5)*70,vy:-30-Math.random()*50,g:-10,sz:2,life:.9}); return; }
 const n=fx==='confetti'?16:fx==='petal'?12:8; for(let i=0;i<n;i++){ const a=-Math.PI*(i+.5)/n, v=50+Math.random()*50;
  if(fx==='star') spawn('spr',x,y-4,{s:'star',vx:Math.cos(a)*v,vy:Math.sin(a)*v,g:160,life:.7});
  else if(fx==='confetti') spawn('dot',x,y-4,{c:CONF[i%CONF.length],vx:Math.cos(a)*v,vy:Math.sin(a)*v*1.3,g:200,sz:3,h:2,life:.9});
  else if(fx==='petal') spawn('spr',x,y-4,{s:'petal',vx:Math.cos(a)*v*.8,vy:Math.sin(a)*v,g:110,life:1});
  else if(fx==='candles'){ if(i%2) spawn('spr',x,y-6,{s:'candles',vx:Math.cos(a)*v*.7,vy:Math.sin(a)*v*1.2,g:220,life:.9}); else spawn('dot',x,y-6,{c:i%4?'#ffd23c':'#ff8ad0',vx:Math.cos(a)*v,vy:Math.sin(a)*v*1.3,g:200,sz:2,life:.7}); } } }
function fxStep(dt){ for(const p of FXP){ p.t+=dt; p.vy+=p.g*dt; p.x+=p.vx*dt; p.y+=p.vy*dt; if(p.k==='spr'&&p.s==='petal') p.x+=Math.sin(p.t*9)*.4; } for(let i=FXP.length-1;i>=0;i--) if(FXP[i].t>=FXP[i].life) FXP.splice(i,1); for(const d of DEC) d.t+=dt; for(let i=DEC.length-1;i>=0;i--) if(DEC[i].t>=DEC[i].life) DEC.splice(i,1); }
function fxPaint(g=ctx){ for(const d of DEC){ const a=Math.min(1,(d.life-d.t)/.4); g.globalAlpha=a;
  if(d.s==='gumbub'){ g.globalAlpha=1; gumBub(g,d.x,d.y,d.t/d.life); }
  else if(d.s==='ring'){ const r=Math.round(4+d.t/d.life*16); RAIN.forEach((c,k)=>{ g.fillStyle=c; const rr=r-k; if(rr<1) return; for(let q=0;q<=16;q++){ const an=Math.PI+Math.PI*q/16; g.fillRect(Math.round(d.x+Math.cos(an)*rr),Math.round(d.y+Math.sin(an)*rr*.7),2,1); } }); }
  else { const c=pixItem(SPRS[d.s]); g.drawImage(c,Math.round(d.x-c.width/2),Math.round(d.y-c.height+2)); } }
 for(const p of FXP){ const a=Math.min(1,(p.life-p.t)/(p.life*.4)); g.globalAlpha=Math.max(0,a);
  if(p.k==='dot'){ g.fillStyle=p.c; g.fillRect(Math.round(p.x),Math.round(p.y),p.sz||1,p.h||p.sz||1); }
  else if(p.k==='soap'){ soapDraw(g,p.x+Math.sin(p.t*6+p.r)*1.5,p.y,p.r+(p.t>p.life*.85?1:0),p.t*3,p.t>p.life*.85); }
  else if(p.k==='rain'){ RAIN.forEach((c,k)=>{ g.fillStyle=c; g.fillRect(p.x-1,p.y+k,3,1); }); }
  else if(p.k==='bat'){ const c=pixItem(SPRS[(Math.floor(p.t*10)%2)?'bat1':'bat0']); g.drawImage(c,Math.round(p.x-3),Math.round(p.y-2)); g.fillStyle='#ff3a4a'; g.fillRect(Math.round(p.x-1),Math.round(p.y),1,1); g.fillRect(Math.round(p.x+1),Math.round(p.y),1,1); }
  else { const c=pixItem(SPRS[p.s]); g.drawImage(c,Math.round(p.x-c.width/2),Math.round(p.y-c.height/2)); } }
 g.globalAlpha=1; }
/* «Жвачный пузырь»: розовый пузырь надувается из лужицы и лопается брызгами (u = 0..1) */
function gumBub(g,x,y,u){ x=Math.round(x); y=Math.round(y); const P=(a,b,c,d,col)=>{ g.fillStyle=col; g.fillRect(a,b,c,d); };
 P(x-9,y-1,18,3,'#1a0c22'); P(x-8,y-1,16,2,'#ff8fc8'); P(x-7,y-1,5,1,'#ffd0ea');
 if(u<.72){ const r=Math.max(2,Math.round(2+u/.72*9)), cy=y-r-1; for(let a=0;a<r*8;a++){ const t=a/(r*8)*Math.PI*2; P(Math.round(x+Math.cos(t)*(r+1)),Math.round(cy+Math.sin(t)*(r+1)),1,1,'#1a0c22'); }
  g.save(); g.beginPath(); g.arc(x,cy,r,0,7); g.fillStyle='#ff8fc8'; g.fill(); g.restore(); P(x-Math.ceil(r/2),cy-Math.ceil(r/2),2,2,'#ffffff'); P(x+Math.floor(r/3),cy+Math.floor(r/3),2,1,'#e05a9a'); }
 else { const k=(u-.72)/.28; for(let i=0;i<8;i++){ const t=-Math.PI*(i+.5)/8, rr=6+k*10; P(Math.round(x+Math.cos(t)*rr),Math.round(y-7+Math.sin(t)*rr*.8),2,2,i%2?'#ff8fc8':'#ffd0ea'); } } }
function soapDraw(g,x,y,r,ph,pop){ x=Math.round(x); y=Math.round(y); const C=['#ff8fc8','#7affe0','#c8f0ff','#ffe04a','#c8f0ff','#9ad8ff'];
 if(pop){ g.fillStyle='#c8f0ff'; for(let a=0;a<8;a++){ const t=a/8*Math.PI*2; g.fillRect(Math.round(x+Math.cos(t)*(r+1)),Math.round(y+Math.sin(t)*(r+1)),1,1); } return; }
 g.save(); const ga=g.globalAlpha; g.globalAlpha=ga*.2; g.fillStyle='#c8f0ff'; g.beginPath(); g.arc(x,y,r,0,7); g.fill(); g.globalAlpha=ga;
 const n=Math.max(8,r*6); for(let a=0;a<n;a++){ const t=a/n*Math.PI*2; g.fillStyle=C[(Math.floor(a/n*6+ph)%6+6)%6]; g.fillRect(Math.round(x+Math.cos(t)*r),Math.round(y+Math.sin(t)*r),1,1); }
 g.fillStyle='#fff'; g.fillRect(x-Math.ceil(r/2),y-Math.ceil(r/2),1,1); if(r>3) g.fillRect(x-Math.ceil(r/2)+1,y-Math.ceil(r/2),1,1); g.restore(); }
let trI=0;
function fxDraw(s,tryIt){ const t=G.now; const dt=fxT===null?0:Math.max(0,Math.min(.05,t-fxT)); fxT=t; const cz=cosGet(); const tid=tryIt&&tryIt.slot==='trail'?tryIt.id:cz.trail;
 if(tid&&s&&s.st==='fly'){ const it=BY[tid]; const rate=it&&it.fx==='rainbow'?60:30; fxAcc+=dt*rate; while(fxAcc>=1){ fxAcc-=1; if(FXP.filter(p=>p.k!=='dot'||p.life>.4).length<ECON.trailMax||it.fx==='rainbow') trailSpawn(it.fx,s,trI++); } } else fxAcc=0;
 fxStep(dt); fxPaint(); }
function splat(x,y){ const cz=cosGet(); if(!cz.splat) return; const it=BY[cz.splat]; if(it) splatFx(it.fx,x,y); }
/* ---------- крики (синтез tone/noise, ≤0,4 с, громкость ≤0,2) ---------- */
const VOX={
 hurray:()=>{ tone(523,.07,'square',.14); tone(659,.07,'square',.14,0,.07); tone(784,.07,'square',.14,0,.14); tone(1046,.16,'square',.16,1.06,.21); },
 quack:()=>{ tone(360,.11,'sawtooth',.16,.6); noise(.06,.08,1800); tone(330,.13,'sawtooth',.15,.55,.16); },
 yodel:()=>{ [440,660,440,660,880].forEach((f,i)=>tone(f,.07,'triangle',.18,1,i*.07)); },
 riff:()=>{ tone(196,.11,'sawtooth',.13); tone(294,.11,'sawtooth',.08); tone(233,.1,'sawtooth',.13,1,.11); tone(262,.17,'sawtooth',.14,.94,.22); noise(.05,.06,4000,.22); },
 riff2:()=>{ [[196,0],[247,.08],[294,.16],[392,.24]].forEach(([f,d])=>tone(f,.1,'sawtooth',.13,1,d)); tone(370,.16,'sawtooth',.14,1.06,.32); noise(.05,.06,4000,.32); },
 solo:()=>{ [330,392,440,523,587,523,659,784].forEach((f,i)=>tone(f,.09,'sawtooth',.11,i===7?1.12:1,i*.1)); noise(.04,.05,5000,.7); },
 bells:()=>{ [1568,1319,1568,1319,1760].forEach((f,i)=>tone(f,.12,'triangle',.1,1,i*.12)); },
 robot:()=>{ tone(620,.05,'square',.12); tone(410,.05,'square',.12,1,.07); tone(820,.07,'square',.12,1,.14); tone(300,.12,'square',.12,.7,.24); },
};
function voice(force){ const cz=cosGet(); const id=force||cz.voice; if(!id) return false; const it=BY[id]; if(!it||!VOX[it.snd]) return false; try{ VOX[it.snd](); }catch(e){} return true; }
/* ---------- иконки вещей для сетки и карточек ---------- */
const ICP={
 scarf:{p:['..........','oooooooooo','orwrwrwrso','orwrwrwrso','oooooooooo','....orwo..','....owro..','....orwo..','....oooo..'],pal:{o:O,r:'#e0303a',w:'#ffffff',s:'#a01a2a'}},
 cape:{p:['...oooo...','..oayyao..','.oaaaaaao.','.oaaaaaao.','obaaaaaaio','obaaaaaaio','obaaaaaaaio','oooooooooo'],pal:{o:O,a:'#3a6ae0',b:'#8ab0ff',i:'#e0303a',y:'#ffd23c'}},
 vampcape:{p:['o........o','oio....oio','oiioooooiio','.oaayyaao.','.oaaaaaao.','obaaaaaaio','obaaaaaaio','oooooooooo'],pal:{o:O,a:'#2a1a40',b:'#4a3a6a',i:'#c0102a',y:'#ffd23c'}},
 voice:{p:['....o.....','...oo..o..','oooao...o.','oaaao.o.o.','oaaao.o.o.','oooao...o.','...oo..o..','....o.....'],pal:{o:O,a:'#ffd23c'}},
 mini:{p:['oo..ooo..oo','oaooabbooao','oaaoaaaoaao','oaooaaaooao','oo..ooo..oo'],pal:{o:O,a:'#ff5aa8',b:'#ffd0e8'}},
};
for(const k in ICP) ICP[k].id='ic_'+k;
/* ---------- Рамки: 2 px + уголки, контур #1a0c22 ---------- */
const FRP={wood:{a:'#b07a48',b:'#d8a46a',s:'#7a4e2a',c:'#e8c070'},silver:{a:'#a8b0c0',b:'#eef2fa',s:'#6a7286',c:'#ffffff'},neon:{a:'#ff3ad0',b:'#ffb0f0',s:'#4ef0ff',c:'#4ef0ff'},jelly:{a:'#ff5a8a',b:'#ffe08a',s:'#5ad84a',c:'#4ab0ff'},gold:{a:'#ffc83c',b:'#fff6b0',s:'#c8901a',c:'#ff4a6a'},week:{a:'#7affe0',b:'#e0fff8',s:'#2ab0a0',c:'#ffd23c'}};
function frameRect(x,y,w,h,fid,t){ const it=BY[fid]; if(!it||it.slot!=='frame') return; const P=FRP[it.fr]; if(!P) return; x=Math.round(x); y=Math.round(y); w=Math.round(w); h=Math.round(h); const R=(a,b,c,d,col)=>{ ctx.fillStyle=col; ctx.fillRect(a,b,c,d); }; const k=3;
 if(it.fr==='neon'){ const p=.5+.5*Math.sin((t||0)*3); ctx.globalAlpha=.18+.22*p; R(x-4,y-4,w+8,2,P.a); R(x-4,y+h+2,w+8,2,P.a); R(x-4,y-2,2,h+4,P.a); R(x+w+2,y-2,2,h+4,P.a); ctx.globalAlpha=1; }
 R(x-1,y-1,w+2,1,O); R(x-1,y+h,w+2,1,O); R(x-1,y,1,h,O); R(x+w,y,1,h,O); // контур снаружи
 const seg=(cA,cB)=>{ R(x,y,w,k,cA); R(x,y,k,h,cA); R(x,y+h-k,w,k,cB); R(x+w-k,y,k,h,cB); };
 if(it.fr==='jelly'){ const C=['#ff5a8a','#ffb03c','#5ad84a','#4ab0ff','#b05aff']; for(let i=0;i<w;i+=8){ R(x+i,y,Math.min(8,w-i),k,C[(i/8)%5]); R(x+i,y+h-k,Math.min(8,w-i),k,C[(i/8+2)%5]); } for(let j=0;j<h;j+=8){ R(x,y+j,k,Math.min(8,h-j),C[(j/8+1)%5]); R(x+w-k,y+j,k,Math.min(8,h-j),C[(j/8+3)%5]); } R(x,y,w,1,'rgba(255,255,255,.5)'); }
 else { seg(P.a,P.s); R(x,y,w,1,P.b); R(x,y,1,h,P.b); if(it.fr==='neon'){ seg(P.a,P.a); R(x+1,y+1,w-2,1,P.b); R(x+1,y+h-2,w-2,1,P.s); R(x+1,y+1,1,h-2,P.s); R(x+w-2,y+1,1,h-2,P.b); } if(it.fr==='wood') for(let i=6;i<w-6;i+=10) R(x+i,y+1,4,1,P.s); }
 // внутренний контур, чтобы рамка читалась на любом фоне карточки
 R(x+k,y+k,w-2*k,1,O); R(x+k,y+h-k-1,w-2*k,1,O); R(x+k,y+k,1,h-2*k,O); R(x+w-k-1,y+k,1,h-2*k,O);
 for(const [cx,cy] of [[x-2,y-2],[x+w-6,y-2],[x-2,y+h-6],[x+w-6,y+h-6]]){ R(cx,cy,8,8,O); R(cx+1,cy+1,6,6,P.c); R(cx+1,cy+1,3,1,'#fff'); R(cx+1,cy+1,1,3,'#fff'); if(it.fr==='gold'||it.fr==='week'){ R(cx+3,cy+3,2,2,it.fr==='gold'?'#ff4a6a':'#ffd23c'); } }
 if(it.fr==='week'){ const mx=x+w/2|0; R(mx-6,y-5,13,8,O); R(mx-5,y-4,11,6,P.c); R(mx-2,y-4,5,1,'#fff'); R(mx-1,y-2,3,2,'#2ab0a0'); } }
function frame(x,y,w,h,tryF){ const id=tryF&&tryF.slot==='frame'?tryF.id:cosGet().frame; if(id) frameRect(x,y,w,h,id,G.now); }
const icCache={};
function iconOf(it){ if(!it||!it.id) return null; if(icCache[it.id]) return icCache[it.id]; let c=null;
 if(!it.slot||it.slot==='head'||it.slot==='face'||it.kind==='spr'||it.kind==='collar'){ c=it.p&&it.pal?pixItem(it):null; }
 else if(it.slot==='neck'){ c=pixItem(ICP[it.id==='vampcape'?'vampcape':it.kind==='cape'?'cape':'scarf']); }
 else if(it.slot==='feet'){ const sp=pixItem(it); const [cc,x]=mk(sp.width*2+3,sp.height); x.drawImage(sp,0,0); x.save(); x.translate(sp.width*2+3,0); x.scale(-1,1); x.drawImage(sp,0,0); x.restore(); c=cc; }
 else if(it.slot==='frame'){ const [cc,x]=mk(20,16); const sv=ctx; /* рисуем рамку в мини-канвас */ const P=FRP[it.fr]; x.fillStyle=O; x.fillRect(1,1,18,14); x.fillStyle='#2b1a4a'; x.fillRect(4,4,12,8); x.fillStyle=P.a; x.fillRect(2,2,16,2); x.fillRect(2,2,2,12); x.fillStyle=P.s; x.fillRect(2,12,16,2); x.fillRect(16,2,2,12); x.fillStyle=P.c; for(const [a,b] of [[1,1],[16,1],[1,12],[16,12]]) x.fillRect(a,b,3,3); c=cc; }
 else if(it.slot==='voice'){ const b=pixItem(ICP.voice); const [cc,x]=mk(12,10); x.drawImage(b,0,1); c=cc; }
 else if(it.slot==='trail'||it.slot==='splat'){ const [cc,x]=mk(18,14); const fx=it.fx;
  if(fx==='rainbow'){ for(let i=0;i<14;i++) RAIN.forEach((col,k)=>{ x.fillStyle=col; x.fillRect(2+i,Math.round(9-Math.sin(i/13*Math.PI)*6)+k-2,1,1); }); }
  else if(fx==='ink'||fx==='pancake'||fx==='web'||fx==='flour'){ const s=pixItem(SPRS[fx]); x.drawImage(s,Math.round(9-s.width/2),Math.round(7-s.height/2)); }
  else if(fx==='confetti'){ [[2,3],[7,1],[12,4],[4,8],[10,9],[15,7],[8,12]].forEach(([a,b],i)=>{ x.fillStyle=CONF[i%6]; x.fillRect(a,b,3,2); }); }
  else if(fx==='gumbub'){ gumBub(x,9,12,.55); }
  else if(fx==='soap'){ [[5,7,4],[12,4,3],[13,11,2],[3,2,1]].forEach(([a,b,r],i)=>soapDraw(x,a,b,r,i*1.5,false)); }
  else if(fx==='pollen'||fx==='spark'){ [[3,3],[8,6],[13,2],[5,10],[12,10],[15,6],[9,1]].forEach(([a,b],i)=>{ x.fillStyle=fx==='spark'?(i%2?'#ffffff':'#ffe04a'):(i%2?'#ffe04a':'#fff6a0'); x.fillRect(a,b,2,2); }); }
  else { const key=fx==='bat'?'bat0':fx==='stardust'?'star':fx==='snow'?'flake':fx; const s=pixItem(SPRS[key]); [[1,6],[7,1],[12,7]].forEach(([a,b])=>x.drawImage(s,Math.min(18-s.width,a),Math.min(14-s.height,b))); }
  c=cc; }
 return icCache[it.id]=c; }
function drawIcon(it,cx,cy,maxW,maxH){ const c=iconOf(it); if(!c) return; const k=Math.max(1,Math.min(4,Math.floor(Math.min(maxW/c.width,maxH/c.height)))); ctx.drawImage(c,Math.round(cx-c.width*k/2),Math.round(cy-c.height*k/2),c.width*k,c.height*k); }
function miniCandy(x,y,k=1){ const c=pixItem(ICP.mini); ctx.drawImage(c,Math.round(x),Math.round(y),c.width*k,c.height*k); }
/* ---------- экран Гардероб: вкладки НАДЕТЬ · ЛАВКА ---------- */
const UI={tab:'wear',slot:'head',sub:'vit',flt:'all',page:0,card:null,confirm:false,fly:[],shakeT:-9,demoT:0,orb:0};
const WSLOTS=[['head','Голова'],['face','Лицо'],['neck','Шея'],['feet','Низ'],['trail','Шлейф'],['splat','Плюх'],['voice','Крик'],['frame','Рамка'],['skin','Скин']];
const FSLOTS=[['all','Все'],['head','Голова'],['face','Лицо'],['neck','Шея'],['feet','Низ'],['trail','Шлейф'],['splat','Плюх'],['voice','Крик'],['frame','Рамка']];
let tryIt=null;
function chipRows(L,y,on,cb,pfx){ const per=Math.ceil(L.length/2), cw=Math.floor((G.W-16)/per), h=TAP()-6; L.forEach(([k,t],i)=>{ const r=i<per?0:1, j=r?i-per:i, n=r?L.length-per:per, x0=8+Math.floor((G.W-16-n*cw)/2); chip(x0+j*cw,y+r*(h+4),cw-3,h,t,on(k),()=>cb(k),pfx+k); }); return 2*(h+4); }
function chip(x,y,w,h,label,on,cb,id){ btn(x,y,w,h,'',cb,on?'#c04a9a':'#3a2a5a',10); G.buttons[G.buttons.length-1].label=id; const b=G.buttons[G.buttons.length-1]; T(fitTxt(label,10,w-6),x+w/2,y+(h-4)/2-6,10,on?'#fff':'#d8c8f0'); }
function header(tp){ iconBtn(4,4,icBack,()=>{ if(!back()) { sfx('tap'); G.scene='select'; } },'back'); T('Гардероб',G.W/2,tp/2-9,16,['#fff','#ffd23c']);
 const bal=String(G.save.candy|0); const shk=G.now-UI.shakeT<.35?Math.round(Math.sin((G.now-UI.shakeT)*60)*2):0; candy(G.W-18-textW(bal,13)-14+shk,tp/2,G.now,0); T(bal,G.W-14+shk,tp/2-8,13,'#ff8ad0','r'); }
function previewSlug(cx,cy,k,withTry){ const c=PC(); const t=G.now; const fly=withTry&&tryIt&&tryIt.slot==='trail'||(!withTry&&UI.tab==='wear'&&UI.slot==='trail'&&cosGet().trail);
 ctx.save(); ctx.translate(Math.round(cx),Math.round(cy)); ctx.scale(k,k);
 if(fly){ const a=t*3.4; const s={x:Math.round(Math.cos(a)*34),y:Math.round(Math.sin(a)*9)+6,st:'fly'}; fxDraw(s,withTry?tryIt:null); drawSlugC(c.id,'fly',frameOf('fly',t),s.x,s.y+4,Math.sin(a)>0); }
 else { const sp=withTry?(tryIt&&tryIt.slot==='splat'?tryIt:null):(UI.slot==='splat'&&cosGet().splat?BY[cosGet().splat]:null); if(sp&&t-UI.demoT>1.6){ UI.demoT=t; splatFx(sp.fx,0,12); } fxDraw(null,null); drawSlugC(c.id,'idle',frameOf('idle',t),0,0); }
 ctx.restore(); }
function drawWear(tp,y){ const cz=cosGet(); UI.prevY=y+70; panel(G.W/2-110,y,220,150,'#22143e'); frame(G.W/2-110,y,220,150); previewSlug(G.W/2,y+86,2,false); { const sp=setProgress(); T(PC().name,G.W/2,sp?y+124:y+130,11,'#fff'); if(sp){ const C=sp.n===3?['Сет «'+sp.name+'» собран!','«'+sp.name+'» собран!','Сет собран!']:['Сет «'+sp.name+'»: '+sp.n+' из 3','«'+sp.name+'»: '+sp.n+' из 3','Сет: '+sp.n+' из 3']; const txt=C.find(t=>textW(t,10)<=196)||C[2], sz=10; UI.setTxt=txt; T(txt,G.W/2,y+138,sz,sp.n===3?'#ffd23c':'#c8b8e0'); } else UI.setTxt=''; } y+=158;
 y+=chipRows(WSLOTS,y,k=>UI.slot===k,k=>{ sfx('tap'); UI.slot=k; UI.demoT=0; },'wslot_')+4;
 const slot=UI.slot; let list=COSI[slot].filter(it=>!it.shop||owns(it.id)); list=[{id:'',name:slot==='voice'?'Писк':'нет'}].concat(list);
 const cols=6, cw2=Math.floor((G.W-16)/cols), rows=Math.ceil(list.length/cols), chh=Math.max(40,Math.min(Math.max(TAP(),52),Math.floor((G.H-8-y)/rows)));
 list.forEach((it,k)=>{ const x=8+(k%cols)*cw2, yy=y+Math.floor(k/cols)*chh; const op=!it.id||cosOpen(it), sel=(cz[slot]||'')===it.id;
  panel(x+1,yy,cw2-2,chh-3,sel?'#2a6a5a':op?'#2b1a4a':'#1a1020'); const cx=x+cw2/2|0, cy=yy+chh/2-3|0;
  if(!it.id){ if(slot==='voice') drawIcon({id:'_v',slot:'voice'},cx,cy-4,cw2-8,chh-20); else T('—',cx,cy-6,12,'#a898c8'); if(slot==='voice') T('Писк',cx,yy+chh-17,9,'#d8c8f0'); }
  else if(slot==='skin'){ const sp=op?skinSprite('slug01',it.id):null; if(sp){ ctx.save(); ctx.beginPath(); ctx.rect(x+2,yy+1,cw2-4,chh-5); ctx.clip(); ctx.drawImage(sp,0,0,64,64,cx-32,cy-28,64,64); ctx.restore(); } }
  else { if(!op) ctx.globalAlpha=.3; drawIcon(it,cx,cy,cw2-10,chh-14); ctx.globalAlpha=1; }
  if(it.id&&!op) T(cosNeedTxt(it.need),cx,yy+chh-16,9,it.need.gem?'#7affff':'#ffd23c');
  G.buttons.push({x,y:yy,w:cw2,h:chh-3,label:'cos'+slot+k,cb:()=>{ if(it.id&&!op){ lockNo(); haptic('error'); G.floats.push({s:it.name+': нужно '+cosNeedTxt(it.need),x:G.W/2-G.ox,y:yy-G.oy-6,t:0,life:1.3,size:11,col:'#ffd23c'}); return; } cz[slot]=it.id; store(); if(it.id&&G.topBurst) G.topBurst(G.W/2,UI.prevY||200,12,[it.col||'#ffd23c','#fff','#7affe0'],90,20,.5,0); if(slot==='voice'){ if(!voice(it.id||null)) sfx('launch'); } else sfx('candy',k%4); haptic('tick'); UI.demoT=0; if(it.id) G.floats.push({s:it.name,x:G.W/2-G.ox,y:tp+60-G.oy,t:0,life:1,size:12,col:'#fff'}); }}); });
 y+=Math.ceil(list.length/cols)*chh+6;
 if(slot!=='skin'&&!COSI[slot].some(it=>it.shop&&owns(it.id))&&y+TAP()<G.H-8){ if(G.emptyHang&&y+TAP()+56<G.H-8){ G.emptyHang(G.W/2,y,'Загляни в Лавку'); y+=42; } btn(G.W/2-90,y,180,TAP(),'В ЛАВКУ',()=>{ sfx('tap'); UI.tab='shop'; UI.sub='all'; UI.flt=slot==='head'||slot==='face'||SLOTS.includes(slot)?slot:'all'; UI.page=0; },'#3aa86a',12); G.buttons[G.buttons.length-1].label='toshop'; } }
function openCard(id,where){ const it=BY[id]; if(!it) return; sfx('tap'); UI.card={id,where,price:priceOf(id,where),t0:Date.now()}; UI.confirm=false; tryIt=null; }
function cardPrice(){ const c=UI.card; if(!c) return 0; if(Date.now()-c.t0>ECON.priceLockMs){ c.price=priceOf(c.id,c.where); c.t0=Date.now(); } return c.price; }
function itemCard(x,y,w,h,id,where,lbl){ const it=BY[id]; const s=roll(); const own=owns(id); const pr=priceOf(id,where); const disc=s.vit.indexOf(id)===s.disc&&where==='vit';
 panel(x,y,w,h,own?'#1e3a34':'#2b1a4a'); drawIcon(it,x+w/2,y+Math.round(h*.36),w-20,Math.round(h*.46));
 T(fitTxt(it.name,10,w-8),x+w/2,y+h-34,10,'#fff');
 if(own) T('✓ куплено',x+w/2,y+h-19,11,'#7affe0'); else { const ps=String(pr); const tw=textW(ps,11); T(ps,x+w/2-10,y+h-19,11,'#ffd23c','c'); miniCandy(Math.round(x+w/2-10+tw/2+4),y+h-15,1); }
 if(disc&&!own){ ctx.fillStyle=O; ctx.fillRect(x+w-42,y+5,38,16); ctx.fillStyle='#e0303a'; ctx.fillRect(x+w-41,y+6,36,14); ctx.fillStyle='#ff7a7a'; ctx.fillRect(x+w-41,y+6,36,1); T('−30 %',x+w-23,y+7,9,'#fff'); }
 if(it.season&&!own){ ctx.fillStyle='#ff8a1c'; ctx.fillRect(x+4,y+4,6,6); ctx.fillStyle=O; ctx.fillRect(x+4,y+4,6,1); }
 G.buttons.push({x,y,w,h,label:lbl,cb:()=>openCard(id,where)}); }
function hrsLeft(){ const ms=msToMidnight(); const h=Math.floor(ms/36e5); return h>=1?h+' ч':Math.max(1,Math.ceil(ms/6e4))+' мин'; }
function drawShop(tp,y){ const s=roll(); const se=curSeason(); const subs=[['vit','ВИТРИНА'],['all','ВСЁ']].concat(se?[['season','СЕЗОН']]:[]); if(UI.sub==='season'&&!se) UI.sub='vit';
 const sw=Math.floor((G.W-16)/subs.length); subs.forEach(([k,t],i)=>chip(8+i*sw,y,sw-4,TAP(),t,UI.sub===k,()=>{ sfx('tap'); UI.sub=k; UI.page=0; },'sub_'+k)); y+=TAP()+4;
 T('новая витрина через '+hrsLeft(),G.W/2,y,10,'#a898c8'); y+=16;
 const big=G.W>=390, cw=big?112:92, ch=big?110:96, gap=Math.floor((G.W-3*cw)/4);
 if(UI.sub==='vit'){ s.vit.forEach((id,i)=>itemCard(gap+(i%3)*(cw+gap),y+Math.floor(i/3)*(ch+8),cw,ch,id,'vit','vit'+i)); y+=2*(ch+8)+4;
  if(!s.vit.length) T('Всё куплено! Загляни во «ВСЁ»',G.W/2,y-ch,11,'#d8c8f0');
  const ex=BY[s.wkx]; if(ex){ const own=owns(ex.id), x=gap, w=G.W-2*gap, h=Math.max(64,TAP()+16); panel(x,y,w,h,own?'#1e3a34':'#3a1a4a'); ctx.fillStyle='#ffd23c'; ctx.fillRect(x+2,y+2,w-4,1); drawIcon(ex,x+36,y+h/2,52,h-12);
   T('ЭКСКЛЮЗИВ НЕДЕЛИ · ещё '+daysToMonday()+' дн.',x+70,y+10,10,'#ffd23c','l'); T(fitTxt(ex.name,12,w-80),x+70,y+26,12,'#fff','l'); if(own) T('✓ куплено',x+70,y+44,11,'#7affe0','l'); else { T(String(ECON.tier.excl),x+70,y+44,11,'#ffd23c','l'); miniCandy(x+74+textW(String(ECON.tier.excl),11),y+48,1); }
   G.buttons.push({x,y,w,h,label:'excl',cb:()=>openCard(ex.id,'excl')}); } }
 else { const pool=UI.sub==='season'?CAT.filter(i=>i.season===se.id):CAT.filter(i=>!i.season&&!i.excl&&!i.chest&&(UI.flt==='all'||i.slot===UI.flt));
  if(UI.sub==='all'){ y+=chipRows(FSLOTS,y,k=>UI.flt===k,k=>{ sfx('tap'); UI.flt=k; UI.page=0; },'flt_')+4; }
  else { const d=se.to; T(se.name+' · до '+String(d[1]).padStart(2,'0')+'.'+String(d[0]).padStart(2,'0'),G.W/2,y,12,'#ff8a1c'); y+=20; }
  const ch2=big?100:90, rows=Math.max(1,Math.floor((G.H-y-TAP()-14)/(ch2+8))), per=rows*3, pages=Math.max(1,Math.ceil(pool.length/per)); UI.page=Math.min(UI.page,pages-1);
  pool.slice(UI.page*per,UI.page*per+per).forEach((it,i)=>itemCard(gap+(i%3)*(cw+gap),y+Math.floor(i/3)*(ch2+8),cw,ch2,it.id,UI.sub==='season'?'season':'all','all'+i));
  if(pages>1){ const by=G.H-TAP()-8; btn(gap,by,64,TAP(),'',()=>{ sfx('tap'); UI.page=(UI.page+pages-1)%pages; },'#6a4fd8'); G.buttons[G.buttons.length-1].label='pgL'; arrow(gap+32,by+TAP()/2-2,-1);
   btn(G.W-gap-64,by,64,TAP(),'',()=>{ sfx('tap'); UI.page=(UI.page+1)%pages; },'#6a4fd8'); G.buttons[G.buttons.length-1].label='pgR'; arrow(G.W-gap-32,by+TAP()/2-2,1); T((UI.page+1)+' / '+pages,G.W/2,by+TAP()/2-8,12,'#fff'); } } }
function arrow(cx,cy,d){ ctx.fillStyle='#fff'; for(let i=0;i<5;i++) ctx.fillRect(Math.round(cx-d*(i-2))-(d<0?0:0),Math.round(cy-i),1,i*2+1); }
function drawCard(tp){ const c=UI.card, it=BY[c.id]; if(!it){ UI.card=null; tryIt=null; return; } const own=owns(c.id); textClear(); ctx.fillStyle='rgba(8,4,20,.78)'; ctx.fillRect(0,0,G.W,G.H); G.buttons.length=0;
 G.buttons.push({x:0,y:0,w:G.W,h:G.H,label:'cardBg',cb:()=>{ sfx('tap'); UI.card=null; tryIt=null; }});
 const w=Math.min(G.W-24,300), h=Math.min(G.H-tp-20,330), x=Math.round((G.W-w)/2), y=Math.round(Math.max(tp+8,(G.H-h)/2)); panel(x,y,w,h,'#22143e'); G.buttons.push({x,y,w,h,label:'cardPanel',cb:()=>{}});
 iconBtn(x+w-TAP()-4,y+4,()=>{ ctx.fillStyle='#fff'; for(let i=-3;i<=3;i++){ ctx.fillRect(i,i,1,1); ctx.fillRect(i,-i,1,1); ctx.fillRect(i+1,i,1,1); ctx.fillRect(i+1,-i,1,1); } },()=>{ sfx('tap'); UI.card=null; tryIt=null; },'cardX');
 T(fitTxt(it.name,14,w-TAP()-24),x+14,y+14,14,'#fff','l'); const sl=WSLOTS.find(q=>q[0]===it.slot); T((sl?sl[1]:'')+(it.season?' · сезон':'')+(it.excl?' · эксклюзив':''),x+14,y+32,10,'#a898c8','l');
 ctx.fillStyle='#160c2a'; ctx.fillRect(x+12,y+48,w-24,124); if(it.slot==='frame') frameRect(x+16,y+52,w-32,116,it.id,G.now); previewSlug(x+w/2,y+122,2,true); if(!tryIt) drawIcon(it,x+w-40,y+70,40,30);
 const pr=cardPrice(); const sv=roll(); const disc=c.where==='vit'&&sv.vit.indexOf(c.id)===sv.disc; let yy=y+176;
 if(!own){ const t1='Цена: '+pr; T(t1,x+w/2-8,yy,13,'#ffd23c'); miniCandy(Math.round(x+w/2-8+textW(t1,13)/2+4),yy+5,1); if(disc){ T('было '+it.price+' · скидка дня',x+w/2,yy+17,10,'#ff8a9a'); } else if(c.where==='all'&&sv.vit.indexOf(c.id)<0&&!it.season&&!it.excl) T('на витрине дешевле: '+it.price,x+w/2,yy+17,10,'#a898c8'); }
 else T('Уже у тебя',x+w/2,yy,13,'#7affe0');
 yy+=34; const bw=w-28, have=G.save.candy|0, lack=Math.max(0,pr-have);
 if(own){ const on=cosGet()[it.slot]===c.id; btn(x+14,yy,bw,TAP(),on?'СНЯТЬ':'НАДЕТЬ',()=>{ equip(c.id); sfx('candy',1); haptic('tick'); if(it.slot==='voice'&&!on) voice(c.id); },'#3aa86a',13); G.buttons[G.buttons.length-1].label='cardEquip'; }
 else { const shk=G.now-UI.shakeT<.35?Math.round(Math.sin((G.now-UI.shakeT)*60)*3):0; btn(x+14+shk,yy,bw,TAP(),'КУПИТЬ ЗА '+pr,()=>tryBuy(),lack?'#5a5a6a':'#3aa86a',13); G.buttons[G.buttons.length-1].label='cardBuy'; miniCandy(Math.round(x+14+shk+bw/2+textW('КУПИТЬ ЗА '+pr,13)/2+4),yy+Math.round(TAP()/2)-6,1);
  if(lack) T('не хватает '+lack,x+w/2,yy+TAP()+3,10,'#ff6a7a'); }
 yy+=TAP()+18; btn(x+14,yy,bw,TAP(),tryIt?'СНЯТЬ ПРИМЕРКУ':'ПРИМЕРИТЬ',()=>{ sfx('tap'); tryIt=tryIt?null:it; UI.demoT=0; if(tryIt&&it.slot==='voice'){ voice(it.id); for(let i=0;i<4;i++) spawn('spr',-14+i*9,-30,{s:'note',vy:-26,vx:(i-1.5)*8,life:.9}); } },'#6a4fd8',12); G.buttons[G.buttons.length-1].label='cardTry';
 if(UI.confirm) drawConfirm(it,pr);
 for(const f of UI.fly){ const k=Math.min(1,(G.now-f.t0)/.5); if(k<0) continue; const e=1-(1-k)*(1-k); const fx=f.x0+(f.x1-f.x0)*e, fy=f.y0+(f.y1-f.y0)*e-Math.sin(k*Math.PI)*30; candy(Math.round(fx),Math.round(fy),G.now,f.i); } UI.fly=UI.fly.filter(f=>G.now-f.t0<.5); }
function drawConfirm(it,pr){ textClear(); ctx.fillStyle='rgba(8,4,20,.82)'; ctx.fillRect(0,0,G.W,G.H); G.buttons.length=0; G.buttons.push({x:0,y:0,w:G.W,h:G.H,label:'cfBg',cb:()=>{ UI.confirm=false; }}); const w=Math.min(G.W-40,270), h=150, x=Math.round((G.W-w)/2), y=Math.round((G.H-h)/2); panel(x,y,w,h,'#2b1a4a'); G.buttons.push({x,y,w,h,label:'cfPanel',cb:()=>{}});
 const L=wrapTxt('Купить «'+it.name+'» за '+pr+'?',13,w-24); L.slice(0,3).forEach((s,i)=>T(s,x+w/2,y+16+i*18,13,'#fff')); const bw=(w-36)/2|0;
 btn(x+12,y+h-TAP()-12,bw,TAP(),'ДА',()=>{ UI.confirm=false; doBuy(); },'#3aa86a',13); G.buttons[G.buttons.length-1].label='cfYes'; btn(x+24+bw,y+h-TAP()-12,bw,TAP(),'НЕТ',()=>{ sfx('tap'); UI.confirm=false; },'#a04a6a',13); G.buttons[G.buttons.length-1].label='cfNo'; }
function tryBuy(){ const c=UI.card; if(!c) return; const pr=cardPrice(); if((G.save.candy|0)<pr){ UI.shakeT=G.now; lockNo(); haptic('error'); return; } if(pr>=ECON.confirmFrom){ sfx('tap'); UI.confirm=true; return; } doBuy(); }
function doBuy(){ const c=UI.card; if(!c) return; const pr=cardPrice(); const r=buy(c.id,pr); if(!r.ok){ UI.shakeT=G.now; lockNo(); haptic('error'); return; } sfx('secret'); haptic('success'); if(G.topBurst) G.topBurst(G.W/2,G.H*.45,12,[(BY[c.id]&&BY[c.id].col)||'#ffd23c','#fff','#7affe0'],120,20,.6,0); const tp=TAP();
 for(let i=0;i<6;i++) UI.fly.push({x0:G.W-30,y0:tp/2,x1:G.W/2,y1:G.H/2-40,t0:G.now+i*.05,i}); G.floats.push({s:'Куплено!',x:G.W/2-G.ox,y:G.H/2-90-G.oy,t:0,life:1.2,size:15,col:['#fff','#7affe0']}); qEvShop(); }
function qEvShop(){ try{ if(typeof qEv==='function') qEv('shop'); }catch(e){} }
function back(){ if(UI.confirm){ UI.confirm=false; return true; } if(UI.card){ UI.card=null; tryIt=null; return true; } return false; }
function draw(){ drawBG(3,0,G.now); G.swipePager=null; const tp=TAP(); header(tp); const tw=Math.floor((G.W-24)/2); let y=tp+6;
 chip(8,y,tw,TAP(),'НАДЕТЬ',UI.tab==='wear',()=>{ sfx('tap'); UI.tab='wear'; UI.card=null; tryIt=null; },'tab_wear'); chip(16+tw,y,tw,TAP(),'ЛАВКА',UI.tab==='shop',()=>{ sfx('tap'); UI.tab='shop'; },'tab_shop');
 if(UI.tab==='shop'){ const s=roll(); const nn=s.vit.filter(id=>!(s.seen||[]).includes(id)).length; if(nn){ ctx.fillStyle=O; ctx.fillRect(16+tw*2-14,y+3,12,12); ctx.fillStyle='#e0303a'; ctx.fillRect(16+tw*2-13,y+4,10,10); } }
 y+=TAP()+8; if(UI.tab==='wear') drawWear(tp,y); else { const s=roll(); if(s.vit.some(id=>!s.seen.includes(id))){ s.seen=[...new Set(s.seen.concat(s.vit))].slice(-200); store(); } drawShop(tp,y); }
 if(UI.card) drawCard(tp);
 for(const f of G.floats){ const k=f.t/f.life; T(f.s,f.x+G.ox,f.y+G.oy-k*14,f.size,f.col); } }
/* ---------- бонусы сетов (только косметика) ---------- */
const setFx={ win(gx,gy){ if(setOn('pirate')){ DEC.push({s:'flag',x:Math.round(gx+10),y:Math.round(gy-14),t:0,life:2.4}); G.floats.push({s:'Йо-хо-хо!',x:gx,y:gy-60,t:0,life:1.8,size:16,col:['#fff','#ffd23c'],pop:1}); VOX.yodel&&tone(220,.14,'square',.12,1.2); }
  if(setOn('ny')){ for(let i=0;i<40;i++) spawn('spr',Math.random()*(G.W||390),-10-Math.random()*120,{s:'flake',vx:(Math.random()-.5)*20,vy:40+Math.random()*40,g:0,life:3.5}); try{ VOX.bells(); }catch(e){} } },
 launch(x,y){ if(setOn('cosmo')) G.floats.push({s:'3·2·1… ПУСК!',x,y:y-40,t:0,life:1.1,size:14,col:['#fff','#9af0ff'],pop:1}); },
 candy(x,y){ if(setOn('chef')&&(!setFx.ct||G.now-setFx.ct>.8)){ setFx.ct=G.now; G.floats.push({s:'Вкуснотища!',x,y:y-30,t:0,life:.9,size:11,col:'#fff6e0'}); } },
 combo(n){ if(n>=3&&setOn('rock')&&(!setFx.rt||G.now-setFx.rt>1.2)){ setFx.rt=G.now; try{ VOX.solo(); }catch(e){} return true; } return false; },
 detective:()=>setOn('detective') };
function skate(x,y,dir){ if(cosGet().feet!=='skates') return false; if(Math.random()<.6) spawn('dot',x+(Math.random()-.5)*10,y,{c:Math.random()<.5?'#ffffff':'#ffe04a',vx:-dir*(30+Math.random()*50),vy:-20-Math.random()*40,g:220,sz:1,life:.3}); return true; }
/* прогресс сета в гардеробе: собранный сет главнее, иначе тот, где надето больше (≥2) */
function setProgress(){ const cz=cosGet(); let best=null; for(const S of SETS){ const n=S.items.filter(i=>cz[BY[i].slot]===i).length; if(n>=2&&(!best||n>best.n)) best={id:S.id,name:S.name,n}; } return best; }
function give(id){ if(!BY[id]||owns(id)) return false; sh().own.push(id); store(); return true; }
return {gumBub,give,setProgress,skate,SETS,setOn,setsWorn,setFx,feetPos,feetGeo,drawFeet,bdayOn,bdTick,frame,frameRect,FRP,ECON,CAT,BY,SEASONS,draw,back,fxDraw,splat,voice,drawNeck,roll,vitFor,priceOf,buy,canBuy,equip,owns,seasonOn,curSeason,exclFor,weekKey,isoWeek,ymd,UI,neckGeo,iconOf,setTry:i=>{tryIt=i?BY[i]:null;},get tryIt(){return tryIt},fxCount:()=>FXP.length+DEC.length,splatFx,trailSpawn,clearFx:()=>{FXP.length=0;DEC.length=0;}};
};
