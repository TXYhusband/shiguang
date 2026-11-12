const {randomUUID}=require('node:crypto');
const localDate=t=>{const d=new Date(t);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
function validDate(v){return typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&Number.isFinite(Date.parse(v))&&new Date(v).toISOString().slice(0,10)===v;}
function text(v,max,required=true){return typeof v==='string'&&v.length<=max&&(!required||!!v.trim());}
function validateEntry(e){
 if(!e||!text(e.id,100)||!validDate(e.date)||!text(e.category,30)||!text(e.title,200)||!text(e.note,10000,false)||!Number.isFinite(e.createdAt)||e.createdAt<0||e.createdAt>9e15)throw Error('请填写有效的日期、分类和收获内容');
 if(e.quantity!==undefined||e.unit!==undefined){if(typeof e.quantity!=='number'||!Number.isFinite(e.quantity)||e.quantity<=0||e.quantity>1e9||!text(e.unit,12))throw Error('数量需大于 0，且填写对应单位');}
 return e;
}
function validateAccumulations(items){if(!Array.isArray(items)||items.length>100000)throw Error('积累数据无效');items.forEach(validateEntry);if(new Set(items.map(e=>e.id)).size!==items.length)throw Error('积累记录重复');return items;}
function updateAccumulations(items=[],a,now=Date.now()){
 const index=items.findIndex(e=>e.id===a.id);
 if(a.type!=='accumulation-add'&&index<0)throw Error('这条积累不存在');
 if(a.type==='accumulation-remove')return items.filter(e=>e.id!==a.id);
 if(a.type==='accumulation-add'&&items.length>=100000)throw Error('积累数量已达上限，请先导出备份');
 const clean=v=>typeof v==='string'?v.trim():v;
 const entry=validateEntry({id:a.type==='accumulation-add'?randomUUID():a.id,date:a.date,category:clean(a.category),title:clean(a.title),note:clean(a.note??''),createdAt:a.type==='accumulation-add'?now:items[index].createdAt,...(a.quantity!==undefined||a.unit!==undefined?{quantity:a.quantity,unit:clean(a.unit)}:{})});
 if(entry.date>localDate(now))throw Error('积累日期不能晚于今天');
 return a.type==='accumulation-add'?[...items,entry]:items.map((e,i)=>i===index?entry:e);
}
module.exports={validateAccumulations,updateAccumulations};
