// Runs the real pet renderer with isolated data and fixtures, never account requests.
const path=require('node:path'),fs=require('node:fs'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),out=path.join(root,'qa-output','quota-redesign');
fs.mkdirSync(out,{recursive:true});
process.env.PET_TEST_DATA_DIR=path.join(out,'preview-data');process.env.CODEX_HOME=path.join(out,'codex-home');
delete process.env.PET_DEV_MODE;delete process.env.PET_DEV_DATA_DIR;delete process.env.PET_INTEGRATION_VERIFY;delete process.env.PET_DEMO_RECORD;
process.argv.push('--background');
const {app,BrowserWindow}=require('electron');
app.disableHardwareAcceleration();require('../main.cjs');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const fixture={ok:true,kind:'codex',provider:'Codex',windows:[{minutes:300,percent:44,resetsAt:'2026-10-25T00:05:31+08:00'},{minutes:10080,percent:10,resetsAt:'2026-10-31T11:00:36+08:00'}],availableResetCount:2,queriedAt:Date.parse('2026-10-24T23:17:54+08:00')};
(async()=>{
  await app.whenReady();let pet;
  for(let i=0;i<100;i++){pet=BrowserWindow.getAllWindows().find(w=>!w.isDestroyed());if(pet&&!pet.webContents.isLoading()){try{if(await pet.webContents.executeJavaScript('typeof sprites!=="undefined"&&sprites.length>0'))break;}catch{}}await sleep(200);}
  assert.ok(pet,'pet window loaded');
  const run=code=>pet.webContents.executeJavaScript(code);
  await run(`(()=>{const s=sprites[0];s.stopMove();s.stopThrow();s.workOn=false;s.workNative=null;s.errorNotice='';s.closeReply();s.pet.workStatusEnabled=false;s.pet.whisperEnabled=false;window.petPreferences.quotaMode='permanent';s.resizePet(462);const a=PRIMARY_AREA;s.sendBounds(a.x+a.width/2-s.halfW,a.y+a.height-80-s.height);s.rememberSizePosition();s.explicitQuota=true;s.showBalanceNow(${JSON.stringify(fixture)});})()`);
  await sleep(1500);
  const metrics=await run(`(()=>{const s=sprites[0],b=s.bubble,r=b.getBoundingClientRect(),c=b.querySelector('.cq-content'),v=s.stage.getBoundingClientRect();return {width:r.width,height:r.height,noScroll:c.scrollHeight<=c.clientHeight,noHorizontal:c.scrollWidth<=c.clientWidth,text:c.textContent,artLoaded:b.querySelector('img').naturalWidth>0,capture:{x:Math.max(0,Math.floor(Math.min(r.x,v.x)-14)),y:Math.max(0,Math.floor(r.y-14)),width:Math.ceil(Math.max(r.right,v.right)-Math.min(r.x,v.x)+28),height:Math.ceil(v.bottom-r.y+28)}}})()`);
  assert.ok(Math.abs(metrics.width-216)<1&&metrics.height<=290,'approved compact card scale');assert.ok(metrics.noScroll);assert.ok(metrics.noHorizontal);assert.ok(metrics.artLoaded);assert.match(metrics.text,/可用重置次数2 次/);
  await run("document.body.style.background='#ffffff'");
  const viewport=await run('({width:innerWidth,height:innerHeight})');
  const full=await pet.webContents.capturePage();const ratio=full.getSize().width/viewport.width;
  const crop=Object.fromEntries(Object.entries(metrics.capture).map(([k,v])=>[k,Math.round(v*ratio)]));
  fs.writeFileSync(path.join(out,'quota-with-pet.png'),full.crop(crop).toPNG());
  for(const size of [180,300,462,900]){
    await run(`(()=>{const s=sprites[0];s.resizePet(${size});s.renderBubble()})()`);await sleep(120);
    const result=await run(`(()=>{const b=sprites[0].bubble,c=b.querySelector('.cq-content');return {width:b.offsetWidth,scroll:c.scrollHeight>c.clientHeight,horizontal:c.scrollWidth>c.clientWidth}})()`);
    assert.equal(result.width,360,`readable width at pet size ${size}`);assert.equal(result.horizontal,false);assert.equal(result.scroll,false);
  }
  for(const width of [240,280,320]){
    await run(`(()=>{const s=sprites[0];s.testOriginalClamp??=s.visibleClampRect;s.visibleClampRect=()=>({x:30,y:30,w:${width}+20,h:700});s.renderBubble()})()`);await sleep(120);
    const compact=await run(`(()=>{const b=sprites[0].bubble,c=b.querySelector('.cq-content'),t=b.querySelector('.cq-title');return {width:b.offsetWidth,contentOverflow:c.scrollWidth>c.clientWidth,titleOverflow:t.scrollWidth>t.clientWidth}})()`);
    assert.equal(compact.width,Math.min(360,width/.6));assert.equal(compact.contentOverflow,false);assert.equal(compact.titleOverflow,false);
  }
  await run(`(()=>{const s=sprites[0];s.visibleClampRect=()=>({x:30,y:30,w:380,h:280});s.renderBubble()})()`);await sleep(100);
  assert.equal(await run(`(()=>{const s=sprites[0],r=s.bubble.getBoundingClientRect(),b=s.bubble.querySelector('.quota-close').getBoundingClientRect();return r.height<=280&&b.top>=r.top&&b.bottom<=r.bottom})()`),true);
  await run(`(()=>{const s=sprites[0];s.visibleClampRect=s.testOriginalClamp;delete s.testOriginalClamp;s.renderBubble()})()`);
  for(const corner of ['top-left','top-right','bottom-left','bottom-right']){
    await run(`(()=>{const s=sprites[0],a=PRIMARY_AREA;s.resizePet(462);s.sendBounds(a.x+(${JSON.stringify(corner)}.endsWith('right')?a.width-s.size:0),a.y+(${JSON.stringify(corner)}.startsWith('bottom')?a.height-s.height:0));s.renderBubble()})()`);await sleep(150);
    const edge=await run(`(()=>{const s=sprites[0],b=s.visibleClampRect(),r=s.bubble.getBoundingClientRect();return {left:r.left-b.x,right:b.x+b.w-r.right,top:r.top-b.y,bottom:b.y+b.h-r.bottom}})()`);
    for(const value of Object.values(edge))assert.ok(value>=-1,corner+' card stays in visible window: '+JSON.stringify(edge));
  }
  await run(`(()=>{const s=sprites[0];s.resizePet(462);s.showBalanceNow({...${JSON.stringify(fixture)},windows:[{minutes:300,percent:100}],availableResetCount:0});})()`);
  assert.match(await run('sprites[0].bubble.textContent'),/0 次/);assert.match(await run('sprites[0].bubble.textContent'),/用量未提供/);
  await run(`sprites[0].bubble.querySelector('.quota-close').click()`);assert.equal(await run('sprites[0].bubble.hidden'),true);
  await run(`(()=>{const s=sprites[0];s.explicitQuota=true;s.showBalanceNow(${JSON.stringify(fixture)});window.petPreferences.quotaMode='timed';window.petPreferences.quotaSeconds=10;s.bubbleHover=true;s.updateQuotaTimer()})()`);assert.equal(await run('sprites[0].bubbleTimer===null'),true);
  await run('sprites[0].bubbleHover=false;sprites[0].updateQuotaTimer()');assert.equal(await run('sprites[0].bubbleTimer!==null'),true);
  fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify({passed:true,metrics,checks:['360px card at 180/300/462/900 pet sizes','full data without scrolling','PNG loaded','240/280/320px available width','280px available height','four screen corners','zero and missing data','close','hover timer pause']},null,2));
  console.log('Quota preview verified: '+path.join(out,'quota-with-pet.png'));app.quit();
})().catch(e=>{console.error(e);app.exit(1)});
