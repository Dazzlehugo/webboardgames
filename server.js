import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {randomBytes,randomInt} from 'node:crypto';
import {catalog,createGame,act,view,botAction,tick,people,streets,priceOf,purchasable} from './games.js';
export const rooms=new Map();
const token=()=>randomBytes(24).toString('hex');
const clean=(s,n=24)=>String(s||'').replace(/[\x00-\x1f<>]/g,'').trim().slice(0,n);
function publicRoom(r,member,localPlayer=-1){let p=r.game?.players.findIndex(x=>x.id===member.id)??-1;if(r.mode==='local')p=Number.isInteger(localPlayer)?localPlayer:-1;return {code:r.code,mode:r.mode,host:r.host,me:member.id,players:r.members.map(({id,name,bot,connected})=>({id,name,bot,connected})),game:r.game?view(r.game,p):null,chat:r.chat,rules:r.rules,gameId:r.gameId,viewer:p};}
function send(res,v){res.write(`data: ${JSON.stringify(v)}\n\n`)}
function broadcast(r){for(const [res,c] of r.streams){try{send(res,publicRoom(r,c.member,c.localPlayer))}catch{r.streams.delete(res)}}}
function auth(body){const r=rooms.get(String(body.code).toUpperCase());if(!r)throw Error('Room not found. It may have closed.');const m=r.members.find(x=>x.token===body.token&&!x.bot);if(!m)throw Error('Your seat could not be verified. Join this room again.');return [r,m];}
function mark(r,m){m.connected=true;r.emptySince=null;}
async function body(req){let data='';for await(const chunk of req){data+=chunk;if(data.length>50000)throw Error('Request too large')}return JSON.parse(data||'{}')}
export const server=http.createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,'http://localhost');
  if(req.method==='GET'&&url.pathname==='/api/catalog'){res.setHeader('Content-Type','application/json');res.end(JSON.stringify({catalog,people,streets,prices:streets.map((_,i)=>priceOf(i)),buyable:streets.map((_,i)=>purchasable(i))}));return}
  if(req.method==='GET'&&url.pathname==='/api/events'){
   const [r,m]=auth(Object.fromEntries(url.searchParams));const localPlayer=Number(url.searchParams.get('player')??-1);mark(r,m);res.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-cache','Connection':'keep-alive','X-Accel-Buffering':'no'});r.streams.set(res,{member:m,localPlayer});send(res,publicRoom(r,m,localPlayer));broadcast(r);
   req.on('close',()=>{r.streams.delete(res);if(![...r.streams.values()].some(c=>c.member===m)){m.connected=false;if(!r.members.some(x=>!x.bot&&x.connected))r.emptySince=Date.now();}broadcast(r)});return;
  }
  if(req.method==='POST'&&url.pathname.startsWith('/api/')){
   if(req.headers.origin&&req.headers.origin!==`http://${req.headers.host}`&&req.headers.origin!==`https://${req.headers.host}`)throw Error('Invalid request origin');
   const b=await body(req),action=url.pathname.slice(5);let result={ok:true};
   if(action==='create'){
    if(rooms.size>=500)throw Error('All tables are busy. Please try again shortly.');const meta=catalog.find(x=>x.id===b.gameId);if(!meta)throw Error('Pick a game');if(b.mode==='local'&&meta.id==='draw')throw Error('Doodle Club is online only.');let code;do{code=Array.from({length:6},()=> 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[randomInt(32)]).join('')}while(rooms.has(code));const m={id:token(),token:token(),name:clean(b.name)||'Player 1',connected:false,bot:false};
    const r={code,mode:b.mode==='local'?'local':'online',host:m.id,members:[m],streams:new Map(),chat:[],rules:{},gameId:meta.id,game:null,emptySince:Date.now(),created:Date.now()};rooms.set(code,r);result={code,token:m.token};
   }else if(action==='join'){
    const r=rooms.get(String(b.code).toUpperCase());if(!r||r.mode==='local')throw Error('Room not found. Check your code.');if(r.members.filter(x=>!x.bot).length>=20)throw Error('Room is full.');const m={id:token(),token:token(),name:clean(b.name)||'Guest',connected:false,bot:false};r.members.push(m);result={code:r.code,token:m.token};broadcast(r);
   }else{
    const [r,m]=auth(b);
    if(action==='chat'){let text=clean(b.text,240);if(!text)throw Error('Write a message first');if(Date.now()-(m.lastChat||0)<500)throw Error('Give the table a moment.');m.lastChat=Date.now();r.chat.push({name:m.name,text,time:Date.now()});r.chat=r.chat.slice(-60);broadcast(r)}
    else if(action==='add'){
     if(m.id!==r.host||r.game)throw Error('Only the host can arrange the lobby.');const meta=catalog.find(x=>x.id===r.gameId);if(r.members.length>=meta.max)throw Error('This game has enough players.');if(r.gameId==='draw'&&b.bot)throw Error('Doodle Club has no bots.');if(r.mode==='online'&&!b.bot)throw Error('Share the room code to invite friends.');r.members.push({id:token(),name:clean(b.name)||(b.bot?['Pip','Clover','Sunny','Bean','Coco','Pebble'][r.members.length-1]:'Player '+(r.members.length+1)),bot:!!b.bot,connected:true});broadcast(r);
    }else if(action==='remove'){if(m.id!==r.host||r.game)throw Error('Only the host can arrange the lobby');r.members=r.members.filter(x=>x.id!==b.id||x.id===r.host);broadcast(r)}
    else if(action==='start'){
     if(m.id!==r.host||r.game)throw Error('Only the host can start.');let meta=catalog.find(x=>x.id===r.gameId);let players=r.members.slice(0,meta.max);if(players.length<2)throw Error('Invite a friend or add a bot first.');r.rules={exact:b.rules?.exact!==false,hitAgain:!!b.rules?.hitAgain,rounds:[5,10,15].includes(Number(b.rules?.rounds))?Number(b.rules.rounds):10,turns:[40,80,120].includes(Number(b.rules?.turns))?Number(b.rules.turns):80};r.game=createGame(r.gameId,players,r.rules);broadcast(r);
    }else if(action==='move'){
     if(!r.game)throw Error('The game has not started');let p=r.game.players.findIndex(x=>x.id===m.id);if(r.mode==='local'){p=Number(b.player);if(!Number.isInteger(p)||!r.game.players[p]||r.game.players[p].bot)throw Error('Invalid seat');}act(r.game,p,b.action);broadcast(r);
    }else if(action==='lobby'){if(m.id!==r.host)throw Error('Only the host can return the table to the lobby.');r.game=null;if(b.gameId){const meta=catalog.find(x=>x.id===b.gameId);if(!meta||r.mode==='local'&&meta.id==='draw')throw Error('Choose a supported game');r.gameId=meta.id;}broadcast(r)}
    else if(action==='resume'){mark(r,m);result={ok:true};}
    else if(action==='leave'){for(const [s,c] of r.streams)if(c.member===m){r.streams.delete(s);s.end()}r.members=r.members.filter(x=>x!==m);if(r.game?.players.some(p=>p.id===m.id)){r.game=null;r.chat.push({name:'Tableclub',text:m.name+' left the game. Back to the lobby for a fresh round.',time:Date.now()})}if(r.host===m.id)r.host=r.members.find(x=>!x.bot)?.id;if(!r.members.some(x=>!x.bot))rooms.delete(r.code);else{m.connected=false;broadcast(r)}}
    else throw Error('Unknown request');
   }
   res.setHeader('Content-Type','application/json');res.end(JSON.stringify(result));return;
  }
  if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405);res.end();return}
  const files={'/':'index.html','/app.js':'app.js','/style.css':'style.css'};const file=files[url.pathname];if(!file){res.writeHead(404);res.end('Not found');return}const content=await readFile(new URL('./public/'+file,import.meta.url));res.setHeader('Content-Type',file.endsWith('.css')?'text/css':file.endsWith('.js')?'text/javascript':'text/html');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','same-origin');res.setHeader('Content-Security-Policy',"default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; img-src 'self' data:; base-uri 'none'; frame-ancestors 'none'");res.end(content);
 }catch(e){res.writeHead(400,{'Content-Type':'application/json'});res.end(JSON.stringify({error:e.message||'Something went wrong'}));}
});
const heartbeat=setInterval(()=>{for(const r of rooms.values())for(const s of r.streams.keys())s.write(': heartbeat\n\n')},15000);heartbeat.unref();
const timer=setInterval(()=>{for(const [code,r] of rooms){if(r.emptySince&&Date.now()-r.emptySince>60000){for(const s of r.streams.keys())s.end();rooms.delete(code);continue}if(!r.members.some(m=>!m.bot&&m.connected))continue;if(!r.game||r.game.winner)continue;const g=r.game;let changed=tick(g);try{
 let p=-1;
 if(g.id==='battleship'&&g.phase==='setup')p=g.players.findIndex((x,i)=>x.bot&&!g.fleets[i]);
 else if(g.id==='quiz'){p=g.players.findIndex((x,i)=>x.bot&&!g.reveal&&g.answers[i]===undefined)}
 else if(g.id==='estate'&&g.trade)p=g.players[g.trade.to].bot?g.trade.to:-1;
 else if(g.players[g.turn].bot)p=g.turn;
 if(p>=0&&g.id!=='draw'){const a=botAction(g,p);if(a){act(g,p,a);changed=true}}
 }catch(e){console.error('Bot:',e.message)}if(changed)broadcast(r);}},1100);timer.unref();
if(process.argv[1]===new URL(import.meta.url).pathname)server.listen(Number(process.env.PORT)||3000,'0.0.0.0',()=>console.log('Tableclub listening on port '+(process.env.PORT||3000)));
