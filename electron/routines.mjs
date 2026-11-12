import {presetItems} from './presets.mjs';
const defaults=[
 ['words','背单词','chiikawa','#bd7c68'],
 ['papers','做真题','hachiware','#6797ae'],
 ['leetcode','刷力扣','usagi','#c79952'],
 ['fullstack','背八股','rakko','#65917a'],
 ['project','背项目','momonga','#9c86b9'],
];
const everyDay=[0,1,2,3,4,5,6];
function dateKey(now){const d=new Date(now);if(!Number.isFinite(d.getTime()))throw Error('日期无效');return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
function validDate(v){return typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&Number.isFinite(Date.parse(v))&&new Date(v).toISOString().slice(0,10)===v;}
function safeId(v){return typeof v==='string'&&/^[A-Za-z0-9_-]{1,100}$/.test(v)&&!['__proto__','prototype','constructor'].includes(v);}
function validateVersion(v){
 if(!v||!validDate(v.from)||typeof v.name!=='string'||!v.name.trim()||v.name.length>300||!safeId(v.art)||typeof v.color!=='string'||!/^#(?:[\da-f]{3}|[\da-f]{6})$/i.test(v.color)||!Array.isArray(v.weekdays)||!v.weekdays.length||v.weekdays.some(d=>!Number.isInteger(d)||d<0||d>6)||new Set(v.weekdays).size!==v.weekdays.length||typeof v.enabled!=='boolean'||typeof v.archived!=='boolean')throw Error('每日事项版本无效');
}
export function createRoutines(preset){const names=preset?presetItems(preset):null;return defaults.map(([id,name,art,color],order)=>({id,order,versions:[{from:'2000-01-01',name:names?names[order]:name,art,color,weekdays:[...everyDay],enabled:true,archived:false}]}));}
export function routineVersion(routine,date){
 if(!validDate(date))throw Error('每日事项日期无效');
 return routine.versions.findLast(v=>v.from<=date);
}
export function routinesForDate(routines,date){
 if(!validDate(date))throw Error('每日事项日期无效');
 const weekday=new Date(date+'T12:00:00').getDay();
 return routines.flatMap(r=>{const v=routineVersion(r,date);return v&&v.enabled&&!v.archived&&v.weekdays.includes(weekday)?[{id:r.id,order:r.order,...v,weekdays:[...v.weekdays]}]:[];}).sort((a,b)=>a.order-b.order);
}
export function validateRoutines(routines){
 if(!Array.isArray(routines)||routines.length>100)throw Error('每日事项数量无效');
 const ids=new Set(),orders=new Set();
 for(const r of routines){
  if(!r||!safeId(r.id)||ids.has(r.id)||!Number.isSafeInteger(r.order)||r.order<0||orders.has(r.order)||!Array.isArray(r.versions)||!r.versions.length)throw Error('每日事项格式无效');
  ids.add(r.id);orders.add(r.order);
  let previous='';for(const v of r.versions){validateVersion(v);if(v.from<=previous)throw Error('每日事项版本日期重复或未排序');previous=v.from;}
 }
 return routines;
}
export function updateRoutines(routines,action,now=Date.now()){
 validateRoutines(routines);const next=structuredClone(routines),today=dateKey(now);
 if(action.type==='routine-preset'){
  const currentNames=new Set(next.map(r=>routineVersion(r,today)).filter(v=>v&&!v.archived).map(v=>v.name.trim()));
  const names=presetItems(action.preset).filter(name=>!currentNames.has(name));if(next.length+names.length>100)throw Error('每日事项模板数量已达上限（100 项）');
  let result=next;for(const [i,name] of names.entries())result=updateRoutines(result,{type:'routine-add',name,art:defaults[i%5][2],color:defaults[i%5][3],weekdays:[...everyDay]},now);return result;
 }else if(action.type==='routine-add'){
  if(next.length>=100)throw Error('每日事项最多100项');
  const version={from:today,name:action.name,art:action.art,color:action.color,weekdays:structuredClone(action.weekdays),enabled:true,archived:false};validateVersion(version);version.name=version.name.trim();
  next.push({id:globalThis.crypto.randomUUID(),order:next.length?Math.max(...next.map(r=>r.order))+1:0,versions:[version]});
 }else if(action.type==='routine-reorder'){
  if(!Array.isArray(action.ids)||action.ids.length!==next.length||new Set(action.ids).size!==next.length||action.ids.some(id=>!next.some(r=>r.id===id)))throw Error('事项排序必须包含全部不同项目');
  action.ids.forEach((id,order)=>{next.find(r=>r.id===id).order=order;});
 }else{
  const routine=next.find(r=>r.id===action.id);if(!routine)throw Error('每日事项不存在');
  const current=routineVersion(routine,today);if(!current)throw Error('每日事项尚未开始');
  const version={...current,weekdays:[...current.weekdays],from:today};
  if(action.type==='routine-edit'){
   for(const key of ['name','art','color','weekdays','enabled'])if(Object.hasOwn(action,key))version[key]=structuredClone(action[key]);
  }else if(action.type==='routine-archive')version.archived=true;
  else if(action.type==='routine-restore'){version.archived=false;version.enabled=true;}
  else throw Error('未知每日事项操作');
  validateVersion(version);version.name=version.name.trim();
  routine.versions=routine.versions.filter(v=>v.from!==today);routine.versions.push(version);routine.versions.sort((a,b)=>a.from.localeCompare(b.from));
 }
 validateRoutines(next);return next;
}
