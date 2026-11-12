export const weekLabels=['日','一','二','三','四','五','六'];
export const todayKey=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
export const frequencyLabel=(days:number[])=>days.length===7?'每天':days.length===5&&[1,2,3,4,5].every(d=>days.includes(d))?'工作日':'每周'+[1,2,3,4,5,6,0].filter(d=>days.includes(d)).map(d=>weekLabels[d]).join('、');
export const artChoices=[{id:'chiikawa',name:'伙伴 1'},{id:'hachiware',name:'伙伴 2'},{id:'usagi',name:'伙伴 3'},{id:'rakko',name:'伙伴 4'},{id:'momonga',name:'伙伴 5'}];
