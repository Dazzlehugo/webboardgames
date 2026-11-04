import { randomInt } from 'node:crypto';
export const catalog = [
 {id:'ludo',name:'Ludo',icon:'✣',tag:'The family favorite',players:'2–4',max:4,color:'lilac',description:'A little luck. A lot of friendly rivalry.'},
 {id:'estate',name:'Pocket Estates',icon:'⌂',tag:'Buy • trade • build',players:'2–6',max:6,color:'peach',description:'Big dreams, little streets. Build your empire.'},
 {id:'battleship',name:'Battleship',icon:'⚓',tag:'A battle of wits',players:'2',max:2,color:'blue',description:'Keep your fleet close. Your guesses closer.'},
 {id:'guess',name:'Who’s Who?',icon:'☺',tag:'Ask the right questions',players:'2',max:2,color:'yellow',description:'So many faces. One mystery person.'},
 {id:'quiz',name:'Quiz Party',icon:'?',tag:'Something for everyone',players:'2–8',max:8,color:'mint',description:'Tiny facts. Big “I knew that!” energy.'},
 {id:'draw',name:'Doodle Club',icon:'✎',tag:'Online • humans only',players:'2–8',max:8,color:'pink',description:'Draw something. Guess anything. Laugh a lot.'},
 {id:'connect',name:'Four in a Row',icon:'⠿',tag:'Easy to learn, hard to leave',players:'2',max:2,color:'peach',description:'Find your line before they find theirs.'},
 {id:'reversi',name:'Reversi',icon:'◐',tag:'Turn the tables',players:'2',max:2,color:'mint',description:'One smart move can change everything.'},
 {id:'snakes',name:'Snakes & Ladders',icon:'↗',tag:'Ups, downs & one more go',players:'2–6',max:6,color:'yellow',description:'Climb a little higher. Slide a little farther.'}
];
export const people = [
 ['Milo','🧑🏻','red',true,false],['Luna','👩🏽','brown',false,true],['Oscar','👨🏻','brown',true,true],['Zara','👩🏿','black',false,false],['Leo','👨🏼','blond',false,false],['Ivy','👩🏻','red',true,true],['Max','👨🏾','black',false,true],['Ada','👩🏼','blond',true,false],['Finn','🧔🏻','brown',false,false],['Nora','👩🏽‍🦱','black',true,false],['Kai','👨🏻‍🦱','black',true,true],['Ruby','👩🏻‍🦰','red',false,false]
].map(([name,face,hair,glasses,hat])=>({name,face,hair,glasses,hat}));
const quizzes=[
 ['Science','Which planet is known as the Red Planet?',['Venus','Mars','Jupiter','Neptune'],1],['Animals','How many hearts does an octopus have?',['One','Two','Three','Eight'],2],['Nature','What do bees collect from flowers?',['Salt','Nectar','Sand','Seeds'],1],['Geography','Which is the largest ocean?',['Atlantic','Indian','Arctic','Pacific'],3],['Food','Which fruit grows in bunches on a vine?',['Apples','Grapes','Peaches','Pears'],1],['Space','What is the closest star to Earth?',['Sirius','Polaris','The Sun','Vega'],2],['Science','Water freezes at how many degrees Celsius?',['0','10','32','100'],0],['Animals','What is a baby frog called?',['Cub','Chick','Tadpole','Calf'],2],['Sports','How many rings are on the Olympic symbol?',['Three','Four','Five','Six'],2],['Nature','Which of these is a mammal?',['Shark','Dolphin','Trout','Octopus'],1],['World','Which country has the city of Tokyo?',['Japan','China','Thailand','India'],0],['Art','Mixing blue and yellow paint makes…',['Purple','Orange','Green','Pink'],2],['Food','What is the main ingredient in guacamole?',['Peas','Avocado','Cucumber','Lime'],1],['Science','Which part of a plant takes in water?',['Flower','Leaf','Roots','Fruit'],2],['Animals','Which animal is the tallest?',['Elephant','Giraffe','Camel','Ostrich'],1],['Space','How many planets are in our solar system?',['Seven','Eight','Nine','Ten'],1],['Music','A piano has black keys and…',['Red keys','White keys','Blue keys','Green keys'],1],['World','Which continent is Egypt in?',['Europe','Asia','Africa','Australia'],2],['Nature','A caterpillar becomes a…',['Bee','Butterfly','Spider','Beetle'],1],['Science','Which gas do humans need to breathe?',['Helium','Oxygen','Neon','Hydrogen'],1],['Sports','In football, who can use their hands in their own penalty area?',['Striker','Referee only','Goalkeeper','Everyone'],2],['Animals','What do pandas mostly eat?',['Bamboo','Fish','Apples','Grass'],0],['Math','What is 7 × 8?',['48','54','56','64'],2],['Nature','What is the largest land animal?',['Hippo','Elephant','Rhino','Giraffe'],1]
];
const words=['rainbow','elephant','bicycle','pizza','rocket','snowman','butterfly','castle','penguin','volcano','guitar','sunflower','robot','watermelon','umbrella','dinosaur','lighthouse','octopus','helicopter','turtle'];
export const streets=['GO','Maple Lane','Chance','Cherry Court','Station','Sunset Walk','Tax','Ocean Drive','Picnic','Willow Way','Chance','Market Square','Station','Moonlight Mile','Tax','Starlight Place','GO TO PICNIC','Garden Grove','Chance','Rainbow Road','Station','Cloud Corner','Tax','Golden Gate'];
const roll=()=>randomInt(1,7);
const shuffle=a=>a.map(v=>[Math.random(),v]).sort((a,b)=>a[0]-b[0]).map(x=>x[1]);
const assert=(v,m='That move is not allowed.')=>{if(!v)throw Error(m)};
export function createGame(id,players,rules={}){
 const meta=catalog.find(x=>x.id===id);assert(meta,'Unknown game');assert(players.length>=2&&players.length<=meta.max,'Wrong player count');
 const g={id,players:players.map(({id,name,bot})=>({id,name,bot:!!bot})),turn:0,winner:null,log:['Let the good times roll!'],rules};
 if(id==='connect')g.board=Array(42).fill(null);
 if(id==='reversi'){g.board=Array(64).fill(null);g.board[27]=0;g.board[36]=0;g.board[28]=1;g.board[35]=1;}
 if(id==='ludo'){g.tokens=players.map(()=>[-1,-1,-1,-1]);g.die=null;g.sixes=0;}
 if(id==='snakes'){g.positions=players.map(()=>0);g.die=null;}
 if(id==='quiz'){g.order=shuffle(quizzes.map((_,i)=>i)).slice(0,Number(rules.rounds)||10);g.round=0;g.scores=players.map(()=>0);g.answers={};g.reveal=false;}
 if(id==='guess'){g.secrets=shuffle(people.map((_,i)=>i)).slice(0,2);g.eliminated=[[],[]];g.history=[];g.pending=null;}
 if(id==='battleship'){g.fleets=players.map(()=>null);g.shots=[[],[]];g.phase='setup';}
 if(id==='estate'){g.positions=players.map(()=>0);g.money=players.map(()=>1500);g.owners=Array(24).fill(null);g.houses=Array(24).fill(0);g.out=players.map(()=>false);g.phase='roll';g.round=0;g.jail=players.map(()=>0);g.trade=null;}
 if(id==='draw'){g.round=0;g.total=players.length*2;g.scores=players.map(()=>0);g.word=words[randomInt(words.length)];g.choices=shuffle(words).slice(0,3);g.phase='choose';g.lines=[];g.guessed=[];g.deadline=null;}
 return g;
}
function next(g){g.turn=(g.turn+1)%g.players.length}
function log(g,s){g.log.push(s);g.log=g.log.slice(-12)}
export function reversiFlips(board,pos,p){if(!Number.isInteger(pos)||pos<0||pos>=64||board[pos]!==null)return [];const out=[];for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,-1],[1,-1],[-1,1]]){let x=pos%8+dx,y=Math.floor(pos/8)+dy,tmp=[];while(x>=0&&x<8&&y>=0&&y<8){let n=y*8+x;if(board[n]===1-p)tmp.push(n);else {if(board[n]===p)out.push(...tmp);break}x+=dx;y+=dy;}}return out}
function finishDraw(g){g.round++;if(g.round>=g.total){endScores(g);return}next(g);g.phase='choose';g.choices=shuffle(words).slice(0,3);g.lines=[];g.guessed=[];g.word='';g.deadline=null;}
function endScores(g){let max=Math.max(...g.scores);g.winner=g.scores.map((s,i)=>s===max?i:null).filter(i=>i!==null);}
function estateFinish(g){let alive=g.out.map((o,i)=>!o?i:null).filter(i=>i!==null);if(alive.length===1)g.winner=alive;}
function pay(g,p,amount,to=null){let payment=Math.min(g.money[p],amount);g.money[p]-=payment;if(to!==null)g.money[to]+=payment;if(g.money[p]===0){g.out[p]=true;g.owners=g.owners.map((v,i)=>{if(v===p){g.houses[i]=0;return null}return v});log(g,`${g.players[p].name} is bankrupt.`);estateFinish(g)}}
export function act(g,p,a){
 assert(!g.winner,'This game has finished.');assert(Number.isInteger(p)&&p>=0&&p<g.players.length,'Spectators cannot play.');assert(a&&typeof a==='object','Invalid move');
 if(g.id==='draw'){
  if(a.type==='choose'){assert(p===g.turn&&g.phase==='choose');assert(g.choices.includes(a.word));g.word=a.word;g.phase='drawing';g.deadline=Date.now()+90000;return}
  if(a.type==='stroke'){assert(p===g.turn&&g.phase==='drawing');assert(Array.isArray(a.points)&&a.points.length>=2&&a.points.length<=200);assert(g.lines.length<1500,'Canvas is full');assert(a.points.every(v=>Array.isArray(v)&&v.length===2&&v.every(n=>Number.isFinite(n)&&n>=0&&n<=1)));assert(/^#[0-9a-f]{6}$/i.test(a.color));g.lines.push({points:a.points,color:a.color,width:Math.max(1,Math.min(20,Number(a.width)||4))});return}
  if(a.type==='clear'){assert(p===g.turn&&g.phase==='drawing');g.lines=[];return}
  if(a.type==='guess'){assert(p!==g.turn&&g.phase==='drawing'&&!g.guessed.includes(p));let s=String(a.text||'').trim().slice(0,80);assert(s);if(s.toLowerCase()===g.word.toLowerCase()){g.guessed.push(p);g.scores[p]+=Math.max(50,150-g.guessed.length*10);g.scores[g.turn]+=50;log(g,`${g.players[p].name} guessed it!`);if(g.guessed.length===g.players.length-1){g.phase='reveal';g.deadline=null}}else log(g,`${g.players[p].name} guessed: ${s}`);return}
  if(a.type==='next'){assert(p===g.turn&&g.phase==='reveal');finishDraw(g);return}throw Error('Invalid drawing action')
 }
 if(g.id==='quiz'){
  if(a.type==='answer'){assert(!g.reveal&&g.answers[p]===undefined);assert(Number.isInteger(a.answer)&&a.answer>=0&&a.answer<4);g.answers[p]=a.answer;if(Object.keys(g.answers).length===g.players.length){g.reveal=true;let q=quizzes[g.order[g.round]];for(let i=0;i<g.players.length;i++)if(g.answers[i]===q[3])g.scores[i]++;}return}
  if(a.type==='next'){assert(g.reveal);g.round++;if(g.round>=g.order.length)endScores(g);else{g.answers={};g.reveal=false}return}throw Error('Invalid quiz action');
 }
 if(g.id==='battleship'&&a.type==='place'){
  assert(!g.fleets[p]&&g.phase==='setup');assert(Array.isArray(a.ships)&&a.ships.length===5,'Place all five ships');let all=[];a.ships.forEach((s,i)=>{assert(Array.isArray(s)&&s.length===[5,4,3,3,2][i],'Invalid ship length');assert(s.every(n=>Number.isInteger(n)&&n>=0&&n<100));let sorted=[...s].sort((a,b)=>a-b),step=sorted[1]-sorted[0];assert((step===1&&Math.floor(sorted[0]/10)===Math.floor(sorted.at(-1)/10))||step===10,'Ships must be straight');assert(sorted.every((v,j)=>j===0||v-sorted[j-1]===step));all.push(...s)});assert(new Set(all).size===17,'Ships overlap');g.fleets[p]=a.ships;if(g.fleets.every(Boolean))g.phase='battle';return;
 }
 if(g.id==='guess'&&a.type==='eliminate'){assert(Number.isInteger(a.index)&&a.index>=0&&a.index<people.length);let e=g.eliminated[p],i=e.indexOf(a.index);if(i<0)e.push(a.index);else e.splice(i,1);return}
 if(g.id==='estate'&&a.type==='tradeReply'){assert(g.trade&&p===g.trade.to);if(a.accept){const t=g.trade;assert(g.money[p]>=t.price&&!g.out[p]);g.money[p]-=t.price;g.money[t.from]+=t.price;g.owners[t.property]=p;log(g,`${g.players[p].name} bought ${streets[t.property]} from ${g.players[t.from].name}.`)}g.trade=null;return}
 assert(p===g.turn,'Wait for your turn.');const name=g.players[p].name;
 if(g.id==='connect'){
  assert(Number.isInteger(a.col)&&a.col>=0&&a.col<7);let row=5;while(row>=0&&g.board[row*7+a.col]!==null)row--;assert(row>=0,'That column is full.');g.board[row*7+a.col]=p;
  for(const [dx,dy] of [[1,0],[0,1],[1,1],[1,-1]]){let count=1;for(const sign of [-1,1]){let x=a.col+dx*sign,y=row+dy*sign;while(x>=0&&x<7&&y>=0&&y<6&&g.board[y*7+x]===p){count++;x+=dx*sign;y+=dy*sign}}if(count>=4)g.winner=[p]}
  if(!g.winner&&g.board.every(x=>x!==null))g.winner=[0,1];next(g);return;
 }
 if(g.id==='reversi'){
  const flips=reversiFlips(g.board,a.index,p);assert(flips.length,'Choose a highlighted legal square.');g.board[a.index]=p;flips.forEach(n=>g.board[n]=p);next(g);
  if(!g.board.some((_,i)=>reversiFlips(g.board,i,g.turn).length)){next(g);log(g,'No legal moves — turn passed.');if(!g.board.some((_,i)=>reversiFlips(g.board,i,g.turn).length)){let counts=[0,0];g.board.forEach(v=>{if(v!==null)counts[v]++});g.winner=counts[0]===counts[1]?[0,1]:[counts[0]>counts[1]?0:1]}}return;
 }
 if(g.id==='snakes'){
  assert(a.type==='roll');g.die=roll();let n=g.positions[p]+g.die;if(n>100){if(g.rules.exact!==false){log(g,`${name} needs an exact roll.`);next(g);return}n=100}const jumps={4:14,9:31,20:38,28:84,40:59,51:67,63:81,71:91,17:7,54:34,62:19,64:60,87:24,93:73,95:75,99:78};g.positions[p]=jumps[n]||n;log(g,`${name} rolled ${g.die} → ${g.positions[p]}${jumps[n]?(jumps[n]>n?' · up the ladder!':' · a slippery snake!'):''}`);if(g.positions[p]===100)g.winner=[p];next(g);return;
 }
 if(g.id==='ludo'){
  const can=t=>t===-1?g.die===6:t<57&&t+g.die<=57;
  if(a.type==='roll'){assert(g.die===null);g.die=roll();g.sixes=g.die===6?g.sixes+1:0;log(g,`${name} rolled ${g.die}.`);if(g.sixes===3){log(g,'Three sixes — turn forfeited.');g.die=null;g.sixes=0;next(g)}else if(!g.tokens[p].some(can)){g.die=null;g.sixes=0;next(g)}return}
  assert(a.type==='move'&&g.die!==null);assert(Number.isInteger(a.token)&&a.token>=0&&a.token<4);let t=g.tokens[p][a.token];assert(can(t));let six=g.die===6;g.tokens[p][a.token]=t===-1?0:t+g.die;let pos=g.tokens[p][a.token];if(pos<52){let absolute=(pos+p*13)%52;let safe=[0,8,13,21,26,34,39,47];if(!safe.includes(absolute))g.tokens.forEach((tokens,j)=>{if(j!==p)tokens.forEach((v,k)=>{if(v>=0&&v<52&&(v+j*13)%52===absolute){tokens[k]=-1;log(g,`${name} sent a token home!`)}})})}g.die=null;if(g.tokens[p].every(t=>t===57))g.winner=[p];if(!six){g.sixes=0;next(g)}return;
 }
 if(g.id==='battleship'){
  assert(g.phase==='battle');assert(Number.isInteger(a.index)&&a.index>=0&&a.index<100);assert(!g.shots[p].includes(a.index),'You already fired there.');g.shots[p].push(a.index);const hit=g.fleets[1-p].some(s=>s.includes(a.index));log(g,`${name}: ${String.fromCharCode(65+Math.floor(a.index/10))}${a.index%10+1} — ${hit?'hit!':'miss'}`);if(g.fleets[1-p].flat().every(n=>g.shots[p].includes(n)))g.winner=[p];if(!hit||!g.rules.hitAgain)next(g);return;
 }
 if(g.id==='guess'){
  if(a.type==='ask'){assert(!g.pending);assert(['red','brown','black','blond','glasses','hat'].includes(a.trait));const c=people[g.secrets[1-p]],yes=['glasses','hat'].includes(a.trait)?c[a.trait]:c.hair===a.trait;g.history.push({player:p,trait:a.trait,yes});log(g,`${name}: ${a.trait}? ${yes?'Yes!':'No.'}`);next(g);return}
  assert(a.type==='guess'&&Number.isInteger(a.index)&&a.index>=0&&a.index<people.length);g.winner=[a.index===g.secrets[1-p]?p:1-p];log(g,`${name} guessed ${people[a.index].name}.`);return;
 }
 if(g.id==='estate'){
  assert(!g.trade,'Wait for the trade response.');let pos=g.positions[p];
  if(a.type==='trade'){assert(Number.isInteger(a.property)&&g.owners[a.property]===p&&g.houses[a.property]===0,'Trade an unimproved property you own.');assert(Number.isInteger(a.to)&&a.to>=0&&a.to<g.players.length&&a.to!==p&&!g.out[a.to]);assert(Number.isInteger(a.price)&&a.price>=1&&a.price<=g.money[a.to]);g.trade={from:p,to:a.to,property:a.property,price:a.price};return}
  if(a.type==='build'){assert(Number.isInteger(a.property)&&g.owners[a.property]===p&&g.houses[a.property]<3);let group=Math.floor(a.property/4);assert(g.owners.every((v,i)=>Math.floor(i/4)!==group||!purchasable(i)||v===p),'Own all properties in this color district first.');assert(g.money[p]>=100);g.money[p]-=100;g.houses[a.property]++;return}
  if(a.type==='buy'){assert(g.phase==='buy'&&g.owners[pos]===null);let price=priceOf(pos);assert(g.money[p]>=price,'Not enough coins');g.money[p]-=price;g.owners[pos]=p;g.phase='end';log(g,`${name} bought ${streets[pos]}.`);return}
  if(a.type==='end'){assert(g.phase==='buy'||g.phase==='end');g.phase='roll';do{next(g)}while(g.out[g.turn]&&!g.winner);g.round++;if(g.round>=Number(g.rules.turns||120)&&!g.winner){const wealth=g.money.map((m,i)=>g.out[i]?-1:m+g.owners.reduce((s,v,j)=>s+(v===i?priceOf(j)+100*g.houses[j]:0),0));let max=Math.max(...wealth);g.winner=wealth.map((v,i)=>v===max?i:null).filter(v=>v!==null)}return}
  assert(a.type==='roll'&&g.phase==='roll');const d1=roll(),d2=roll();g.dice=[d1,d2];if(g.jail[p]>0){g.jail[p]--;g.phase='end';log(g,`${name} takes a picnic break.`);return}let raw=pos+d1+d2;if(raw>=24)g.money[p]+=200;pos=raw%24;g.positions[p]=pos;log(g,`${name} rolled ${d1+d2} → ${streets[pos]}`);g.phase='end';if(purchasable(pos)){if(g.owners[pos]===null)g.phase='buy';else if(g.owners[pos]!==p){let rent=(20+pos*3)*(1+g.houses[pos]);pay(g,p,rent,g.owners[pos]);log(g,`Rent: ${rent} coins.`)}}else if(streets[pos]==='Tax')pay(g,p,100);else if(streets[pos]==='Chance'){let amount=[-100,50,100,150][randomInt(4)];if(amount<0)pay(g,p,-amount);else g.money[p]+=amount;log(g,`Chance: ${amount>0?'+':''}${amount} coins.`)}else if(pos===16){g.positions[p]=8;g.jail[p]=1;}if(g.out[p]&&!g.winner){g.phase='roll';do{next(g)}while(g.out[g.turn])}return;
 }
 throw Error('Unknown action');
}
export const purchasable=i=>!['GO','Chance','Tax','Picnic','GO TO PICNIC'].includes(streets[i]);
export const priceOf=i=>100+i*15;
export function tick(g){if(g.id==='draw'&&g.phase==='drawing'&&g.deadline<Date.now()){g.phase='reveal';g.deadline=null;return true}return false}
export function view(g,p){const v=structuredClone(g);if(g.id==='battleship'){v.fleets=g.fleets.map((f,i)=>i===p||g.winner?f:(f?true:null));v.hits=g.shots.map((shots,i)=>shots.filter(n=>g.fleets[1-i]?.flat().includes(n)));}if(g.id==='guess')v.secrets=g.secrets.map((s,i)=>i===p||g.winner?s:null);if(g.id==='quiz'){const q=quizzes[g.order[g.round]||0];v.question=q.slice(0,3);v.correct=g.reveal||g.winner?q[3]:null;v.answered=Object.keys(g.answers).map(Number);if(!g.reveal)v.answers={};delete v.order;v.total=g.order.length;}if(g.id==='draw'){if(p!==g.turn&&g.phase!=='reveal'&&!g.winner)v.word='•'.repeat(g.word.length);if(p!==g.turn)v.choices=[];}return v}
export function botAction(g,p){
 if(g.id==='quiz')return {type:'answer',answer:Math.random()<.65?quizzes[g.order[g.round]][3]:randomInt(4)};
 if(g.id==='battleship'){if(!g.fleets[p])return {type:'place',ships:randomFleet()};const free=Array.from({length:100},(_,i)=>i).filter(i=>!g.shots[p].includes(i));const hits=g.shots[p].filter(i=>g.fleets[1-p].flat().includes(i));const near=hits.flatMap(i=>[i-10,i+10,...(i%10>0?[i-1]:[]),...(i%10<9?[i+1]:[])]).filter(i=>free.includes(i));return {index:(near.length?near:free)[randomInt((near.length?near:free).length)]};}
 if(g.id==='connect'){const cols=Array.from({length:7},(_,i)=>i).filter(i=>g.board[i]===null);for(const who of [p,1-p])for(const col of cols){const clone=structuredClone(g);clone.turn=who;act(clone,who,{col});if(clone.winner?.includes(who))return {col}}return {col:cols.sort((a,b)=>Math.abs(a-3)-Math.abs(b-3))[0]};}
 if(g.id==='reversi'){const moves=g.board.map((_,i)=>({index:i,n:reversiFlips(g.board,i,p).length})).filter(v=>v.n);moves.sort((a,b)=>(b.n+([0,7,56,63].includes(b.index)?100:0))-(a.n+([0,7,56,63].includes(a.index)?100:0)));return {index:moves[0].index};}
 if(g.id==='ludo'){if(g.die===null)return {type:'roll'};let token=g.tokens[p].findIndex(t=>t===-1?g.die===6:t<57&&t+g.die<=57);return {type:'move',token};}
 if(g.id==='snakes')return {type:'roll'};
 if(g.id==='guess'){let candidates=people.map((_,i)=>i).filter(i=>g.history.filter(h=>h.player===p).every(h=>((['glasses','hat'].includes(h.trait)?people[i][h.trait]:people[i].hair===h.trait)===h.yes)));if(candidates.length<=1)return {type:'guess',index:candidates[0]??0};const traits=['glasses','hat','red','brown','black','blond'].filter(t=>!g.history.some(h=>h.player===p&&h.trait===t));if(!traits.length)return {type:'guess',index:candidates[0]};traits.sort((a,b)=>Math.abs(candidates.filter(i=>['glasses','hat'].includes(a)?people[i][a]:people[i].hair===a).length-candidates.length/2)-Math.abs(candidates.filter(i=>['glasses','hat'].includes(b)?people[i][b]:people[i].hair===b).length-candidates.length/2));return {type:'ask',trait:traits[0]};}
 if(g.id==='estate'){if(g.trade)return {type:'tradeReply',accept:g.trade.price<=priceOf(g.trade.property)};if(g.phase==='buy'&&g.money[p]>priceOf(g.positions[p])+200)return {type:'buy'};return {type:g.phase==='roll'?'roll':'end'};}
}
export function randomFleet(){let used=new Set();return [5,4,3,3,2].map(len=>{for(let tries=0;tries<10000;tries++){let start=randomInt(100),vertical=Math.random()<.5;if(vertical?Math.floor(start/10)+len>10:start%10+len>10)continue;let cells=Array.from({length:len},(_,j)=>start+j*(vertical?10:1));if(cells.some(n=>used.has(n)))continue;cells.forEach(n=>used.add(n));return cells}throw Error('Could not place fleet')})}
