const {test}=require('node:test');
const assert=require('node:assert/strict');
const {createState,dispatch,recover,validateState}=require('../electron/engine.cjs');
const at=date=>new Date(date+'T12:00:00').getTime();
const monday=at('2026-11-02'), tuesday=at('2026-11-03');

test('migration adds default routines without overwriting history or intentionally empty templates',()=>{
 const legacy=createState(monday);delete legacy.routines;
 legacy.checkins={'2026-11-01':{words:true,exercise:true}};legacy.days={'2026-11-01':{}};
 const migrated=recover(legacy,tuesday);
 assert.equal(migrated.routines?.length,5);
 assert.deepEqual(migrated.checkins,legacy.checkins);assert.deepEqual(migrated.days,legacy.days);
 assert.equal(legacy.routines,undefined);
 migrated.routines=[];assert.deepEqual(recover(migrated,tuesday).routines,[]);
});

test('routine edits retain historic names and schedules, pauses and archives keep checkins',()=>{
 const {routinesForDate}=require('../electron/routines.mjs');
 let s=dispatch(createState(monday),{type:'routine-edit',id:'words',name:'周一单词',weekdays:[1]},monday);
 s=dispatch(s,{type:'checkin',id:'words',completed:true},monday);
 s=dispatch(s,{type:'routine-edit',id:'words',name:'新版单词',weekdays:[2]},tuesday);
 assert.equal(routinesForDate(s.routines,'2026-11-02').find(r=>r.id==='words').name,'周一单词');
 assert.equal(routinesForDate(s.routines,'2026-11-03').find(r=>r.id==='words').name,'新版单词');
 s=dispatch(s,{type:'routine-edit',id:'words',enabled:false},tuesday);
 assert.equal(s.routines.find(r=>r.id==='words').versions.length,3);
 assert.equal(routinesForDate(s.routines,'2026-11-03').some(r=>r.id==='words'),false);
 s=dispatch(s,{type:'routine-archive',id:'words'},tuesday);
 s=dispatch(s,{type:'routine-restore',id:'words'},at('2026-11-10'));
 assert.equal(routinesForDate(s.routines,'2026-11-10').some(r=>r.id==='words'),true);
 assert.equal(routinesForDate(s.routines,'2026-11-03').some(r=>r.id==='words'),false);
 assert.equal(s.checkins['2026-11-02'].words,true);
});

test('new routines start today; arbitrary stored IDs survive backup and full-set reordering',()=>{
 const {routinesForDate}=require('../electron/routines.mjs');
 let s=dispatch(createState(monday),{type:'routine-add',name:'阅读',art:'cat',color:'#445566',weekdays:[0,1,2,3,4,5,6],date:'2001-01-01'},tuesday);
 const added=s.routines.at(-1);assert.equal(added.versions[0].from,'2026-11-03');
 assert.equal(routinesForDate(s.routines,'2026-11-02').some(r=>r.id===added.id),false);
 added.id='my-routine_123';s=dispatch(s,{type:'checkin',id:added.id,completed:true},tuesday);
 assert.equal(recover(s,tuesday).checkins['2026-11-03']['my-routine_123'],true);
 const ids=s.routines.map(r=>r.id).reverse();s=dispatch(s,{type:'routine-reorder',ids},tuesday);
 assert.deepEqual(routinesForDate(s.routines,'2026-11-03').map(r=>r.id),ids);
 const before=structuredClone(s);assert.throws(()=>dispatch(s,{type:'routine-reorder',ids:ids.slice(1)},tuesday));
 assert.throws(()=>dispatch(s,{type:'checkin',id:'not-stored',completed:true},tuesday));assert.deepEqual(s,before);
});

test('malformed routine revisions and unsafe identifiers fail backup validation',()=>{
 const {validateRoutines,createRoutines,updateRoutines}=require('../electron/routines.mjs');
 for(const mutate of [r=>r[0].id='__proto__',r=>r[0].versions[0].weekdays=[1,1],r=>r[0].versions[0].from='2026-02-30',r=>r[0].versions.push({...r[0].versions[0]}),r=>r[0].order=-1]){
  const routines=createRoutines();mutate(routines);assert.throws(()=>validateRoutines(routines));
 }
 let routines=[];for(let n=0;n<100;n++)routines=updateRoutines(routines,{type:'routine-add',name:'阅读',art:'cat',color:'#445566',weekdays:[1]},monday);
 assert.throws(()=>updateRoutines(routines,{type:'routine-add',name:'过量',art:'cat',color:'#445566',weekdays:[1]},monday));
 const s=createState(monday);s.routines=[];s.checkins={'2026-11-02':{'__proto__':true,'unknown':true}};assert.throws(()=>validateState(s));
});

test('persistent todo selector carries pending work forward once and reports real source and completion dates',()=>{
 const {todosForDate}=require('../electron/todos-view.mjs');
 let s=dispatch(createState(monday),{type:'todo-add',date:'2026-11-02',title:'旧任务',note:'资料',dueDate:'2026-11-04',important:true},monday);
 const id=s.todos['2026-11-02'][0].id;
 assert.deepEqual(todosForDate(s.todos,'2026-11-03').map(t=>[t.title,t.sourceDate,t.note,t.dueDate,t.important]),[['旧任务','2026-11-02','资料','2026-11-04',true]]);
 const untouched=structuredClone(s.todos);todosForDate(s.todos,'2026-11-03');assert.deepEqual(s.todos,untouched);
 s=dispatch(s,{type:'todo-toggle',date:'2026-11-02',id,completed:true},tuesday);
 assert.equal(s.todos['2026-11-02'][0].completedOn,'2026-11-03');
 assert.equal(todosForDate(s.todos,'2026-11-02').length,1);assert.equal(todosForDate(s.todos,'2026-11-03').length,1);assert.equal(todosForDate(s.todos,'2026-11-04').length,0);
 s=dispatch(s,{type:'todo-toggle',date:'2026-11-02',id,completed:false},tuesday);
 assert.equal(s.todos['2026-11-02'][0].completedOn,undefined);assert.equal(todosForDate(s.todos,'2026-11-04').length,1);
});

test('todo rich edit, move, archive and restore preserve identity and allow clearing optional fields',()=>{
 const {todosForDate}=require('../electron/todos-view.mjs');
 let s=dispatch(createState(monday),{type:'todo-add',date:'2026-11-02',title:'任务',note:'原文',dueDate:'2026-11-03',important:true},monday);
 const id=s.todos['2026-11-02'][0].id;
 s=dispatch(s,{type:'todo-edit',date:'2026-11-02',id,note:'',dueDate:'',important:false},tuesday);
 assert.equal(s.todos['2026-11-02'][0].title,'任务');assert.equal(s.todos['2026-11-02'][0].dueDate,undefined);
 s=dispatch(s,{type:'todo-move',date:'2026-11-02',id,targetDate:'2026-11-04'},tuesday);
 assert.equal(s.todos['2026-11-02'].length,0);assert.equal(todosForDate(s.todos,'2026-11-03').length,0);
 assert.equal(todosForDate(s.todos,'2026-11-04')[0].id,id);
 s=dispatch(s,{type:'todo-archive',date:'2026-11-04',id,archived:true},tuesday);
 assert.equal(todosForDate(s.todos,'2026-11-05')[0].archived,true);
 s=dispatch(s,{type:'todo-archive',date:'2026-11-04',id,archived:false},tuesday);
 assert.equal(todosForDate(s.todos,'2026-11-05')[0].archived,false);
});

test('todo conversion atomically creates a daily routine and archives source once',()=>{
 let s=dispatch(createState(monday),{type:'todo-add',date:'2026-11-02',title:'每日阅读'},monday);
 const id=s.todos['2026-11-02'][0].id;
 s=dispatch(s,{type:'todo-to-routine',date:'2026-11-02',id},tuesday);
 assert.equal(s.routines.length,6);assert.equal(s.routines.at(-1).versions[0].name,'每日阅读');
 assert.deepEqual(s.routines.at(-1).versions[0].weekdays,[0,1,2,3,4,5,6]);assert.equal(s.todos['2026-11-02'][0].archived,true);
 const before=structuredClone(s);assert.throws(()=>dispatch(s,{type:'todo-to-routine',date:'2026-11-02',id},tuesday));assert.deepEqual(s,before);
});

test('invalid todo metadata, duplicate identities and conversion capacity leave input intact',()=>{
 let s=dispatch(createState(monday),{type:'todo-add',date:'2026-11-02',title:'任务'},monday);const id=s.todos['2026-11-02'][0].id;
 for(const fields of [{note:3},{dueDate:'2026-02-30'},{important:'yes'},{archived:'yes'},{completedOn:'2026-02-30'}]){
  const invalid=structuredClone(s);Object.assign(invalid.todos['2026-11-02'][0],fields);assert.throws(()=>validateState(invalid));
 }
 for(const action of [{type:'todo-edit',note:3},{type:'todo-edit',dueDate:'2026-02-30'},{type:'todo-move',targetDate:'bad'},{type:'todo-archive',archived:1},{type:'todo-toggle',completed:true,completedOn:'bad'}]){
  const before=structuredClone(s);assert.throws(()=>dispatch(s,{...action,date:'2026-11-02',id},tuesday));assert.deepEqual(s,before);
 }
 const duplicate=structuredClone(s);duplicate.todos['2026-11-03']=[{...duplicate.todos['2026-11-02'][0]}];assert.throws(()=>validateState(duplicate));
 const {updateRoutines}=require('../electron/routines.mjs');while(s.routines.length<100)s.routines=updateRoutines(s.routines,{type:'routine-add',name:'已有',art:'cat',color:'#445566',weekdays:[1]},monday);
 const before=structuredClone(s);assert.throws(()=>dispatch(s,{type:'todo-to-routine',date:'2026-11-02',id},tuesday));assert.deepEqual(s,before);
});

test('optional settings migrate to visible modules and validate each persisted field',()=>{
 const s=createState(monday);assert.equal(s.settings.mentorLabel,'间隔记录');assert.equal(s.settings.showMentor,false);assert.equal(s.settings.showCountdowns,true);assert.equal(s.settings.animations,true);assert.equal(s.settings.theme,'chiikawa');
 const next=dispatch(s,{type:'settings',settings:{mentorLabel:'每周交流',showMentor:false,showCountdowns:false,animations:false,theme:'custom',launchAtLogin:true}},tuesday);
 assert.equal(next.settings.mentorLabel,'每周交流');assert.equal(recover(next,tuesday).settings.launchAtLogin,true);
 for(const settings of [{mentorLabel:''},{showMentor:1},{showCountdowns:'yes'},{animations:null},{theme:'remote'},{launchAtLogin:1}]){assert.throws(()=>dispatch(s,{type:'settings',settings},tuesday));const invalid=structuredClone(s);Object.assign(invalid.settings,settings);assert.throws(()=>validateState(invalid));}
});

test('editing a todo and changing its source date is atomic for invalid or full destinations',()=>{
 const s=dispatch(createState(monday),{type:'todo-add',date:'2026-11-02',title:'原始标题',note:'原始备注'},monday);
 const id=s.todos['2026-11-02'][0].id;
 s.todos['2026-11-04']=Array.from({length:500},(_,n)=>({id:`destination-${n}`,title:'已有',completed:false,createdAt:monday}));
 for(const targetDate of ['2026-02-30','2026-11-04']){
  const before=structuredClone(s);
  assert.throws(()=>dispatch(s,{type:'todo-edit',date:'2026-11-02',id,targetDate,title:'新标题',note:'新备注'},tuesday));
  assert.deepEqual(s,before);
 }
});

test('a single todo edit and move preserves identity completion and rich fields',()=>{
 let s=dispatch(createState(monday),{type:'todo-add',date:'2026-11-02',title:'任务',note:'旧备注',dueDate:'2026-11-05',important:true},monday);
 const original=s.todos['2026-11-02'][0],id=original.id;
 s=dispatch(s,{type:'todo-toggle',date:'2026-11-02',id,completed:true},tuesday);
 const next=dispatch(s,{type:'todo-edit',date:'2026-11-02',id,targetDate:'2026-11-04',title:'新标题',note:'新备注'},tuesday);
 assert.equal(next.todos['2026-11-02'].length,0);
 assert.deepEqual(next.todos['2026-11-04'],[{...original,title:'新标题',note:'新备注',completed:true,completedOn:'2026-11-03'}]);
 assert.equal(s.todos['2026-11-02'][0].title,'任务');assert.equal(s.todos['2026-11-04'],undefined);
});

test('empty routine schedules fail mutation and backup validation; pause uses enabled',()=>{
 const s=createState(monday),before=structuredClone(s);
 assert.throws(()=>dispatch(s,{type:'routine-edit',id:'words',weekdays:[]},tuesday));assert.deepEqual(s,before);
 const invalid=structuredClone(s);invalid.routines[0].versions[0].weekdays=[];assert.throws(()=>validateState(invalid));
 const paused=dispatch(s,{type:'routine-edit',id:'words',enabled:false},tuesday);
 assert.equal(paused.routines[0].versions.at(-1).enabled,false);
 assert.deepEqual(paused.routines[0].versions.at(-1).weekdays,[0,1,2,3,4,5,6]);
});
