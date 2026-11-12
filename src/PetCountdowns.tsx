import type {Countdown,StudyAction} from './types';
import {sortCountdowns,countdownLabel} from './Countdowns';

export function chosenCountdowns(events:Countdown[],ids?:string[]){return ids===undefined?sortCountdowns(events).slice(0,2):ids.map(id=>events.find(e=>e.id===id)).filter((e):e is Countdown=>!!e).slice(0,2)}
export function PetCountdowns({events,ids}:{events:Countdown[];ids?:string[]}){
 const selected=chosenCountdowns(events,ids);
 return <div className="pet-countdowns">{selected.length?selected.map(e=><div key={e.id} className="pet-countdown-row" title={`${e.title} · ${e.date}`}><span>{e.title}</span><b>{countdownLabel(e.date)}</b></div>):<span className="pet-countdown-empty">在「倒数日」中选择桌宠展示的日子</span>}</div>
}
export function PetCountdownSettings({events,ids,act}:{events:Countdown[];ids?:string[];act:(a:StudyAction)=>Promise<boolean>}){
 const selected=chosenCountdowns(events,ids).map(e=>e.id);
 return <section className="pet-countdown-settings"><div><h3>桌宠上的倒数日</h3><p>最多展示两个，选择后自动保存。</p></div><div className="pet-countdown-selects">{[0,1].map(i=><label key={i}>位置 {i+1}<select aria-label={`桌宠倒数日${i+1}`} value={selected[i]||''} onChange={e=>{const next=[selected[0]||'',selected[1]||''];next[i]=e.target.value;void act({type:'settings',settings:{petCountdownIds:next.filter(Boolean)}})}}><option value="">不显示</option>{events.filter(e=>e.id!==selected[1-i]).map(e=><option key={e.id} value={e.id}>{e.title}</option>)}</select></label>)}</div></section>
}
