import {useState} from 'react';
import {Check,Plus,X} from 'lucide-react';
import {routinePresets} from '../electron/presets.mjs';
import type {StudyAction} from './types';
export function StarterPlans({act,welcome=false}:{act:(a:StudyAction)=>Promise<boolean>;welcome?:boolean}){
 const [selected,setSelected]=useState('daily'),[busy,setBusy]=useState(false),[message,setMessage]=useState('');
 const preset=routinePresets.find(p=>p.id===selected)!;
 return <section className={'starter-plans '+(welcome?'welcome-plans':'')} aria-label={welcome?'开始使用拾光':'清单模板'}>
 {welcome&&<button className="welcome-close" aria-label="关闭上手提示" onClick={()=>act({type:'settings',settings:{welcomeDismissed:true}})}><X size={17}/></button>}
 <h2>{welcome?'把日子，过成自己喜欢的样子。':'选一套清单，从这里开始'}</h2><p>{welcome?'每日事项会按设定的星期重复；临时待办会保留到完成。所有名称都能修改，不需要的功能在偏好设置关闭。':'模板会追加到已有清单，同名事项会跳过。原来的事项与打卡记录保留。'}</p>
 <div className="starter-options">{routinePresets.map(p=><button key={p.id} aria-pressed={selected===p.id} onClick={()=>{setSelected(p.id);setMessage('')}}><strong>{p.name}</strong><small>{p.description}</small></button>)}</div>
 <div className="starter-preview">{preset.items.map(n=><span key={n}><Check size={12}/>{n}</span>)}</div><div className="starter-bottom"><button className="soft-button" disabled={busy} onClick={async()=>{if(busy)return;setBusy(true);try{if(await act({type:'routine-preset',preset:selected}))setMessage('已添加，已有同名事项已跳过。')}finally{setBusy(false)}}}><Plus size={15}/>{busy?'正在添加…':'添加这套事项'}</button>{welcome&&<button className="text-button" onClick={()=>act({type:'settings',settings:{welcomeDismissed:true}})}>先用现在的清单</button>}<span role="status">{message}</span></div>
 </section>;
}
