const {test}=require('node:test');const assert=require('node:assert/strict');
const {createState,recover,dispatch,validateState}=require('../electron/engine.cjs');
test('新用户使用通用清单与可选间隔记录，旧用户保持清单和导师设置',()=>{
 const fresh=createState();assert.equal(fresh.routines[0].versions[0].name,'喝水');assert.equal(fresh.settings.showMentor,false);assert.equal(fresh.settings.mentorLabel,'间隔记录');assert.equal(fresh.settings.welcomeDismissed,false);
 const old=createState();old.routines=require('../electron/routines.mjs').createRoutines();old.settings.mentorLabel='导师汇报';old.settings.showMentor=true;delete old.settings.welcomeDismissed;const restored=recover(old);assert.deepEqual(restored.routines,old.routines);assert.equal(restored.settings.mentorLabel,'导师汇报');assert.equal(restored.settings.showMentor,true);assert.equal(restored.settings.welcomeDismissed,true);
});
test('模板追加去重且不改变现有记录，未知模板和容量不足保持原状态',()=>{
 let s=createState();s=dispatch(s,{type:'routine-preset',preset:'work'});assert.ok(s.routines.some(r=>r.versions.at(-1).name==='整理今日重点'));const length=s.routines.length;s=dispatch(s,{type:'routine-preset',preset:'work'});assert.equal(s.routines.length,length);assert.deepEqual(s.days,{});validateState(s);assert.throws(()=>dispatch(s,{type:'routine-preset',preset:'nope'}));
 const full=structuredClone(s);while(full.routines.length<100){const i=full.routines.length;full.routines.push({...structuredClone(full.routines[0]),id:'full-'+i,order:i})}const before=JSON.stringify(full);assert.throws(()=>dispatch(full,{type:'routine-preset',preset:'research'}));assert.equal(JSON.stringify(full),before);
});
test('模块开关验证、旧备份默认和无损重新开启',()=>{
 let s=createState();const keys=['showDaily','showTodos','showAccumulation','showMusic'];for(const k of keys){delete s.settings[k]}const restored=recover(s);for(const k of keys)assert.equal(restored.settings[k],true);
 for(const k of keys){assert.throws(()=>dispatch(restored,{type:'settings',settings:{[k]:'false'}}));const off=dispatch(restored,{type:'settings',settings:{[k]:false}});const on=dispatch(off,{type:'settings',settings:{[k]:true}});assert.deepEqual(on.routines,restored.routines);assert.deepEqual(on.todos,restored.todos);validateState(on)}
});
