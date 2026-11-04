import test from 'node:test';
import assert from 'node:assert/strict';
import {server,rooms} from '../server.js';
test('private room API: identity, spectators, reconnect, private fleets and cleanup',async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base='http://127.0.0.1:'+server.address().port;
 const call=async(path,b={})=>{const response=await fetch(base+'/api/'+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b)});return {status:response.status,data:await response.json()}};
 const open=async(session)=>{const controller=new AbortController();const response=await fetch(base+'/api/events?'+new URLSearchParams(session),{signal:controller.signal});const reader=response.body.getReader();let buffer='';while(!buffer.includes('\n\n'))buffer+=new TextDecoder().decode((await reader.read()).value);return {controller,data:JSON.parse(buffer.split('data: ')[1].split('\n')[0])}};
 const connections=[];try{
  const {data:host}=await call('create',{gameId:'battleship',name:'Host',mode:'online'});const {data:guest}=await call('join',{code:host.code,name:'Guest'});const {data:watcher}=await call('join',{code:host.code,name:'Watcher'});
  assert.equal((await call('start',guest)).status,400);assert.equal((await call('start',host)).status,200);
  assert.equal((await call('move',{...watcher,action:{type:'place',ships:[]}})).status,400);
  const ships=[[0,1,2,3,4],[10,11,12,13],[20,21,22],[30,31,32],[40,41]];
  assert.equal((await call('move',{...host,action:{type:'place',ships}})).status,200);
  const conn=await open(guest);connections.push(conn);assert.equal(conn.data.game.fleets[0],true);assert.ok(conn.data.game.players.every(p=>!('token'in p)));assert.ok(!JSON.stringify(conn.data).includes(host.token));
  const own=await open(host);connections.push(own);assert.deepEqual(own.data.game.fleets[0],ships);
  assert.equal((await call('resume',host)).status,200);assert.equal((await call('resume',{...host,token:'wrong'})).status,400);
  for(const s of [host,guest,watcher])assert.equal((await call('leave',s)).status,200);
  assert.ok(!rooms.has(host.code));assert.equal((await call('resume',host)).status,400);
 }finally{connections.forEach(c=>c.controller.abort());server.closeAllConnections();await new Promise(resolve=>server.close(resolve))}
});
