export const routinePresets=[
 {id:'daily',name:'日常生活',description:'给身体、生活和自己留一点时间',items:['喝水','读几页书','活动一下','推进一件小事','留点自己的时间']},
 {id:'study',name:'学习成长',description:'复习、练习、阅读，慢慢积累',items:['背单词','复习笔记','做练习题','阅读学习','整理今日收获']},
 {id:'work',name:'工作安排',description:'明确重点，留出收尾和休息的时间',items:['整理今日重点','推进核心任务','处理消息','整理工作记录','下班前收尾']},
 {id:'research',name:'科研求职',description:'论文、项目与求职准备，自由选择',items:['阅读论文','推进实验','刷力扣','背八股','整理项目']},
];
export function presetItems(id){const preset=routinePresets.find(p=>p.id===id);if(!preset)throw Error('没有这个清单模板');return preset.items;}
