import {useEffect,useState} from 'react';
import {CalendarDays,ChevronLeft,ChevronRight} from 'lucide-react';
import {routinesForDate} from '../electron/routines.mjs';
import type {Routine} from './types';
import {todayKey} from './routine-utils';
export function ReviewCalendar({routines,checkins,date,onSelect}:{routines:Routine[];checkins:Record<string,Record<string,boolean>>;date:string;onSelect:(date:string)=>void}){
 const [month,setMonth]=useState(date.slice(0,7));useEffect(()=>setMonth(date.slice(0,7)),[date]);
 const [year,mon]=month.split('-').map(Number),length=new Date(year,mon,0).getDate(),start=(new Date(year,mon-1,1).getDay()+6)%7;
 const shift=(offset:number)=>{const d=new Date(year,mon-1+offset,1);setMonth(d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0'))};
 return <details className="review-calendar"><summary><CalendarDays size={15}/>月历回顾<span>看看每一天的小小进展</span></summary><div className="review-calendar-body"><div className="calendar-top"><button aria-label="上个月" onClick={()=>shift(-1)}><ChevronLeft size={17}/></button><strong>{year} 年 {mon} 月</strong><button aria-label="下个月" onClick={()=>shift(1)}><ChevronRight size={17}/></button></div><div className="calendar-grid">{['一','二','三','四','五','六','日'].map(d=><span key={d} className="calendar-week">{d}</span>)}{Array.from({length:start},(_,i)=><span key={'blank'+i}/>)}{Array.from({length},(_,i)=>{const value=month+'-'+String(i+1).padStart(2,'0'),items=routinesForDate(routines,value),done=items.filter(r=>checkins[value]?.[r.id]).length;return <button key={value} className={(value===date?'selected ':'')+(value===todayKey()?'is-today ':'')+(value>todayKey()?'is-future':'')} aria-label={value+' 每日事项 '+done+'/'+items.length} aria-pressed={value===date} onClick={()=>onSelect(value)}><b>{i+1}</b><small>{items.length?done+'/'+items.length:'—'}</small><i style={{width:(items.length?done/items.length*100:0)+'%'}}/></button>})}</div><p>显示每日事项的完成数量。点击日期可查看当日清单，计划改名与暂停不会改写过去。</p></div></details>;
}
