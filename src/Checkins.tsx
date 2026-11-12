import {ChiiSticker,type ChiiCharacter} from './ChiiArt';
import {useRef,useState} from 'react';
import {useRoutineDrag} from './useRoutineDrag';
import {Check,GripVertical,Settings2,Plus} from 'lucide-react';
import {createRoutines,routinesForDate} from '../electron/routines.mjs';
import {frequencyLabel,todayKey} from './routine-utils';
import type {Routine,StudyAction} from './types';
export function Checkins({values,readOnly,act,date=todayKey(),routines=createRoutines(),onManage}:{values:Record<string,boolean>;readOnly:boolean;act:(a:StudyAction)=>Promise<boolean>;date?:string;routines?:Routine[];onManage?:()=>void}){
 const [busy,setBusy]=useState(false),lock=useRef(false);
 const items=routinesForDate(routines,date);
 const reorder=async(source:string,target:string)=>{if(source===target||busy)return;const ids=[...routines].sort((a,b)=>a.order-b.order).map(r=>r.id);const from=ids.indexOf(source),to=ids.indexOf(target);if(from<0||to<0)return;ids.splice(from,1);ids.splice(to,0,source);setBusy(true);try{await act({type:'routine-reorder',ids})}finally{setBusy(false)}};
 const {bind,dragged,target}=useRoutineDrag(reorder);
 return <section className="checkins daily-routine"><div className="section-head"><h2>{date===todayKey()?'每日事项':'当日事项'}<small>点击完成 · 按计划重复</small></h2><div className="routine-head-actions"><span>{items.filter(i=>values[i.id]).length}/{items.length} 已完成</span>{onManage&&<button className="text-button" onClick={onManage}><Settings2 size={15}/>管理每日事项</button>}</div></div><div className="checkin-grid">{items.map(({id,name,art,color,weekdays})=><button type="button" key={id} data-item={id} role="checkbox" aria-label={name+'打卡'} aria-checked={!!values[id]} disabled={readOnly||busy} {...(!readOnly&&!busy?bind(id):{})} data-drop-target={target===id||undefined} className={'checkin-card '+(values[id]?'checked':'')} onClick={async()=>{if(dragged.current||lock.current)return;lock.current=true;setBusy(true);try{await act({type:'checkin',id,date,completed:!values[id]})}finally{lock.current=false;setBusy(false)}}}><span className="routine-grip" title="按住拖动排序"><GripVertical size={15}/></span><span className="chii-task-face" style={{backgroundColor:color}}><ChiiSticker variant={art as ChiiCharacter}/></span><span className="checkin-info"><strong>{name}</strong><small>{values[id]?'已完成 · 点击撤销':frequencyLabel(weekdays)}</small></span><span className="checkin-check">{values[id]&&<Check size={17}/>}</span></button>)}</div>{!items.length&&<div className="routine-empty"><ChiiSticker variant="usagi"/><div><h3>今天没有安排每日事项</h3><p>可以添加新的计划，或在临时待办里记下一件小事。</p></div>{onManage&&<button className="soft-button" onClick={onManage}><Plus size={15}/>添加计划</button>}</div>}</section>;
}
