const {randomUUID}=require('node:crypto');
function validDate(date){return typeof date==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(date)&&Number.isFinite(Date.parse(date))&&new Date(date).toISOString().slice(0,10)===date;}
function dateKey(now){const d=new Date(now);if(!Number.isFinite(d.getTime()))throw Error('日期无效');return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
function checkTitle(title){if(typeof title!=='string'||!title.trim()||title.length>300)throw Error('请输入1–300字的待办事项');return title.trim();}
function checkMetadata(item){
 if(item.note!==undefined&&(typeof item.note!=='string'||item.note.length>10000))throw Error('待办备注最多10000字');
 if(item.dueDate!==undefined&&!validDate(item.dueDate))throw Error('待办截止日期无效');
 if(item.completedOn!==undefined&&!validDate(item.completedOn))throw Error('待办完成日期无效');
 for(const key of ['important','archived'])if(item[key]!==undefined&&typeof item[key]!=='boolean')throw Error('待办状态无效');
}
function validateTodos(todos){
 if(!todos||typeof todos!=='object'||Array.isArray(todos))throw Error('待办数据格式无效');
 const ids=new Set();
 for(const [date,items] of Object.entries(todos)){
  if(!validDate(date)||!Array.isArray(items)||items.length>500)throw Error('待办日期或数量无效');
  for(const item of items){
   if(!item||typeof item.id!=='string'||!item.id||item.id.length>200||ids.has(item.id)||typeof item.completed!=='boolean'||!Number.isFinite(item.createdAt)||item.createdAt<0)throw Error('待办事项无效');
   checkTitle(item.title);checkMetadata(item);ids.add(item.id);
  }
 }
 return todos;
}
function applyMetadata(item,action){
 for(const key of ['note','dueDate','important'])if(Object.hasOwn(action,key)){
  if((key==='dueDate'||key==='note')&&action[key]==='')delete item[key];else item[key]=action[key];
 }
 checkMetadata(item);
}
function moveTodo(next,items,item,date,targetDate){
 if(!validDate(targetDate))throw Error('目标日期无效');
 if(targetDate!==date){const destination=next[targetDate]??=[];if(destination.length>=500)throw Error('目标日期最多500条待办');next[date]=items.filter(v=>v.id!==item.id);destination.push(item);}
}
function updateTodos(todos,action,now=Date.now()){
 if(!validDate(action.date))throw Error('请选择有效日期');
 const next=structuredClone(todos||{});validateTodos(next);const items=next[action.date]??=[];
 if(action.type==='todo-add'){
  if(items.length>=500)throw Error('当天最多500条待办');
  const item={id:randomUUID(),title:checkTitle(action.title),completed:false,createdAt:now};applyMetadata(item,action);items.push(item);validateTodos(next);return next;
 }
 const item=items.find(v=>v.id===action.id);if(!item)throw Error('这条待办已不存在');
 if(action.type==='todo-toggle'){
  if(typeof action.completed!=='boolean')throw Error('完成状态无效');
  if(action.completedOn!==undefined&&!validDate(action.completedOn))throw Error('完成日期无效');
  item.completed=action.completed;if(item.completed)item.completedOn=action.completedOn??dateKey(now);else delete item.completedOn;
 }else if(action.type==='todo-edit'){
  if(Object.hasOwn(action,'title'))item.title=checkTitle(action.title);applyMetadata(item,action);
  if(Object.hasOwn(action,'targetDate'))moveTodo(next,items,item,action.date,action.targetDate);
 }else if(action.type==='todo-move'){
  moveTodo(next,items,item,action.date,action.targetDate);
 }else if(action.type==='todo-archive'){
  if(typeof action.archived!=='boolean')throw Error('归档状态无效');item.archived=action.archived;
 }else if(action.type==='todo-remove')next[action.date]=items.filter(v=>v.id!==action.id);
 else throw Error('未知待办操作');
 validateTodos(next);return next;
}
module.exports={validateTodos,updateTodos};
