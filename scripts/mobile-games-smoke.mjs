const {chromium}=await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH || '/usr/bin/chromium',args:['--no-sandbox']});let errors=[];
for(const id of ['ludo','estate','battleship','guess','quiz','connect','reversi','snakes']){
 const ctx=await browser.newContext({viewport:{width:390,height:844}});const p=await ctx.newPage();p.on('pageerror',e=>errors.push(id+': '+e.message));
 await p.goto('http://127.0.0.1:3000');await p.locator(`[data-game="${id}"]`).click();await p.locator('[name=name]').fill('Alex');await p.locator('[name=mode][value=local]').check();await p.locator('#create-form button').click();await p.locator('#add-bot').click();await p.locator('#start-game:not([disabled])').click();await p.locator('#unlock').click();
 if(id==='ludo'||id==='snakes'){await p.locator('#roll').click();await p.waitForTimeout(250)}
 if(id==='battleship'){await p.locator('#random-fleet').click();await p.locator('#lock-fleet').click();await p.waitForTimeout(1400);if(await p.locator('#unlock').count())await p.locator('#unlock').click();await p.locator('[data-shot]').first().waitFor();await p.locator('[data-shot]').first().click()}
 if(id==='guess'){await p.locator('[data-person]').first().click();await p.locator('#ask').click()}
 if(id==='estate'){await p.locator('#roll').click();}
 if(id==='connect'){await p.locator('[data-col]').first().click()}
 if(id==='reversi'){await p.locator('[data-cell]:has(.legal-dot)').first().click()}
 if(id==='quiz'){await p.locator('[data-answer]').first().click();await p.locator('#quiz-next').waitFor()}
 assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),id+' overflows');
 console.log('PASS: '+id+' mobile controls and bot/shared-device startup');await ctx.close();
}
assert.deepEqual(errors,[]);await browser.close();
