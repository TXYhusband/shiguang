const {test}=require('node:test');
const assert=require('node:assert/strict');
const {createState,dispatch,recover,validateState}=require('../electron/engine.cjs');
const now=new Date(2026,10,9,12).getTime();
const add=(s,fields={})=>dispatch(s,{type:'accumulation-add',category:'AI 知识',title:'理解了注意力机制',note:'Q 和 K 决定权重',date:'2026-11-09',...fields},now);
test('积累兼容旧存档，新增内容不改变每日待办与旧记录',()=>{
 const old=createState(now);delete old.accumulations;const migrated=recover(old,now);assert.deepEqual(migrated.accumulations,[]);
 const result=add(migrated);assert.equal(result.accumulations.length,1);assert.equal(result.accumulations[0].quantity,undefined);assert.equal(result.accumulations[0].note,'Q 和 K 决定权重');assert.deepEqual(result.days,old.days);assert.deepEqual(result.todos,old.todos);assert.equal(migrated.accumulations.length,0);validateState(result);
});
test('积累支持自定义分类、小数数量、补记、编辑及删除，保留原始时间',()=>{
 let s=add(createState(now),{category:'读书',title:'读了半章',quantity:0.5,unit:'章',date:'2026-11-08'});const first=s.accumulations[0];
 s=dispatch(s,{type:'accumulation-update',id:first.id,category:'读书',title:'读完一章',note:'新的收获',quantity:1,unit:'章',date:'2026-11-08'},now+1000);
 assert.equal(s.accumulations[0].createdAt,first.createdAt);assert.equal(s.accumulations[0].quantity,1);validateState(s);
 s=dispatch(s,{type:'accumulation-remove',id:first.id},now);assert.deepEqual(s.accumulations,[]);
 assert.throws(()=>dispatch(s,{type:'accumulation-update',id:first.id,category:'读书',title:'丢失',note:'',date:'2026-11-09'},now),/不存在/);
});
test('积累拒绝无效日期、空内容、不匹配的数量单位及损坏备份，原数据保持不变',()=>{
 const s=createState(now);
 for(const fields of [{title:' '},{category:''},{date:'2026-02-30'},{date:'2026-11-10'},{quantity:0,unit:'个'},{quantity:-1,unit:'个'},{quantity:Infinity,unit:'个'},{quantity:1},{unit:'个'},{quantity:1e10,unit:'个'}])assert.throws(()=>add(s,fields));
 const valid=add(s);assert.throws(()=>validateState({...valid,accumulations:[...valid.accumulations,...valid.accumulations]}));assert.throws(()=>validateState({...valid,accumulations:{}}));assert.equal(s.accumulations.length,0);
 const bad=structuredClone(valid);bad.accumulations[0].quantity='3';bad.accumulations[0].unit='条';assert.throws(()=>validateState(bad));
});
test('积累在 JSON 备份往返后保留，数量记录可改为纯文字且不会留下旧数量',()=>{
 let s=add(createState(now),{quantity:30,unit:'个',category:'单词'});const id=s.accumulations[0].id;
 const restored=recover(JSON.parse(JSON.stringify(s)),now);assert.deepEqual(restored.accumulations,s.accumulations);
 s=dispatch(restored,{type:'accumulation-update',id,date:'2026-11-09',category:'单词',title:'记住了一个词的用法',note:''},now);
 assert.equal(s.accumulations[0].quantity,undefined);assert.equal(s.accumulations[0].unit,undefined);assert.equal(restored.accumulations[0].quantity,30);validateState(s);
});
