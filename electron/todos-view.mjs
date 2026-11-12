function validDate(date){return typeof date==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(date)&&Number.isFinite(Date.parse(date))&&new Date(date).toISOString().slice(0,10)===date;}
// Return copies: querying another day must never migrate or mutate archived records.
export function todosForDate(todos,date){
 if(!validDate(date))throw Error('待办日期无效');
 const seen=new Set(),result=[];
 for(const [sourceDate,items] of Object.entries(todos||{}).sort(([a],[b])=>a.localeCompare(b))){
  for(const item of items){
   const visible=item.archived?sourceDate<=date:item.completed?(sourceDate===date||item.completedOn===date):sourceDate<=date;
   if(!visible||seen.has(item.id))continue;
   seen.add(item.id);result.push({...item,sourceDate});
  }
 }
 return result;
}
