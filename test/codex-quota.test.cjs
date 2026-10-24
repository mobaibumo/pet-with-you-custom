const test=require('node:test'),assert=require('node:assert/strict');
const {model,timestamp}=require('../runtime/codex-quota.js');
test('account card uses remaining percentage and preserves zero reset credits',()=>{
  const m=model({windows:[{minutes:300,percent:44},{minutes:10080,percent:10}],availableResetCount:0});
  assert.deepEqual(m.windows.map(w=>[w.used,w.remaining]),[[44,56],[10,90]]);assert.equal(m.resets,'0 次');
});
test('missing values stay unknown; percentages stay in valid range',()=>{
  const m=model({windows:[{minutes:300,percent:105}],availableResetCount:null});
  assert.equal(m.windows[0].remaining,0);assert.equal(m.windows[1].remaining,null);assert.equal(m.resets,'未提供');assert.equal(timestamp(null),'未提供');assert.equal(timestamp('invalid'),'未提供');
});
