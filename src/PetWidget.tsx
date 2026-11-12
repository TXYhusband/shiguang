import {useEffect,useRef,useState} from 'react';
import {Fish,Heart,Volleyball,Moon,Sun,Footprints,Pin,X,MessageCircle} from 'lucide-react';
import {createPet,commandPet,tickPet,type PetCommand,type PetBehavior} from '../electron/pet-behavior.mjs';
import {AnimatedCat} from './AnimatedCat';
import {ChiiSticker,useArtwork} from './ChiiArt';
import {PetCountdowns} from './PetCountdowns';
import type {State,StudyAction} from './types';
import './pet.css';
const labels:Record<string,string>={'sit-idle':'今天也一起加油呀','walk-left':'散散步，伸伸腿','walk-right':'散散步，伸伸腿','run-left':'跑起来啦','run-right':'跑起来啦',eat:'小鱼真好吃呀！',happy:'呼噜呼噜～',play:'来一起玩球！',sleep:'嘘，小伙伴睡着啦'};
export function PetWidget({state,done,total,mentorTitle,act}:{state:State;done:number;total:number;mentorTitle:string;act:(a:StudyAction)=>Promise<boolean>}){
 const {theme}=useArtwork();
 const [behavior,setBehavior]=useState<PetBehavior>(()=>createPet()),[hover,setHover]=useState(false),[offset,setOffset]=useState(0),[error,setError]=useState('');
 const previousDone=useRef(done),roaming=Boolean(state.settings.petRoaming),walking=/^(walk|run)-/.test(behavior.state),reduced=useRef(false);
 useEffect(()=>{const query=matchMedia('(prefers-reduced-motion: reduce)');const update=()=>{reduced.current=query.matches||state.settings.animations===false};update();query.addEventListener('change',update);const interval=setInterval(()=>setBehavior(p=>tickPet(p)),150);return()=>{query.removeEventListener('change',update);clearInterval(interval)}},[state.settings.animations]);
 useEffect(()=>{if(done>previousDone.current)setBehavior(p=>commandPet(p,'pet'));previousDone.current=done},[done]);
 useEffect(()=>{const off=window.study?.subscribePetDirection(direction=>setBehavior(p=>{if(!/^(walk|run)-/.test(p.state))return p;return {...p,state:`${p.state.startsWith('run')?'run':'walk'}-${direction<0?'left':'right'}` as PetBehavior['state']}}));return off},[]);
 useEffect(()=>{void window.study?.petMotion({state:reduced.current?'sit-idle':behavior.state,hover}).catch(e=>setError(String(e)))},[behavior.state,hover,roaming,state.settings.pet,state.settings.animations]);
 useEffect(()=>{if(!walking||roaming)return;const direction=behavior.state.endsWith('left')?-1:1,interval=setInterval(()=>{if(reduced.current)return;setOffset(x=>Math.max(-42,Math.min(42,x+direction*2)))},70);return()=>clearInterval(interval)},[walking,behavior.state,roaming]);
 const command=(c:PetCommand)=>setBehavior(p=>commandPet(p,c));
 const toggleMode=async()=>{if(await act({type:'settings',settings:{petRoaming:!roaming}})){setOffset(0);command(roaming?'rest':'walk')}};
 return <div className={`pet pet-checklist pet-animated ${roaming?'pet-roaming':''}`} onPointerEnter={()=>setHover(true)} onPointerLeave={()=>setHover(false)}>
 <div className="pet-drag">拾光 · {roaming?'自由散步':theme==='chiikawa'?'小八陪伴':'小伙伴陪伴'}</div><button className="pet-hide" aria-label="隐藏桌宠" onClick={()=>window.study?.togglePet()}><X size={14}/></button>
 <div className="pet-playground" data-pet-state={behavior.state} onDoubleClick={()=>window.study?.showMain()}><span className="pet-speech" role="status">{error||labels[behavior.state]}</span><button className={`pet-character ${behavior.state.endsWith('left')?'face-left':''} ${walking&&hover&&roaming?'legs-paused':''}`} aria-label="摸摸小猫" style={{left:`calc(50% + ${roaming?0:offset}px)`}} onClick={()=>command('pet')}><AnimatedCat key={behavior.since} state={behavior.state}/></button>{behavior.state==='play'&&<span className="pet-ball"/>}</div>
 <div className="pet-interactions"><button aria-label="喂食" title="喂小鱼" onClick={()=>command('feed')}><Fish size={17}/><span>喂食</span></button><button aria-label="摸头" onClick={()=>command('pet')}><Heart size={17}/><span>摸摸</span></button><button aria-label="玩球" onClick={()=>command('play')}><Volleyball size={17}/><span>玩球</span></button><button aria-label={behavior.state==='sleep'?'叫醒':'睡觉'} onClick={()=>command(behavior.state==='sleep'?'wake':'sleep')}>{behavior.state==='sleep'?<Sun size={17}/>:<Moon size={17}/>}<span>{behavior.state==='sleep'?'叫醒':'睡觉'}</span></button></div>
 <div className="pet-mode-controls"><button aria-label={roaming?'固定在角落':'自由活动'} onClick={toggleMode}>{roaming?<Pin size={13}/>:<Footprints size={13}/>} {roaming?'固定在角落':'自由活动'}</button>{roaming&&<button aria-label="开始散步" onClick={()=>command('walk')}>散步</button>}</div>
 {state.settings.showDaily!==false&&<strong className="pet-daily"><ChiiSticker variant="hachiware"/>今日已完成 {done} / {total}</strong>}<div className="pet-actions"><button onClick={()=>window.study?.showMain()}>打开今日待办</button></div>{state.settings.showMentor!==false&&<button className="pet-mentor" onClick={()=>window.study?.showMain()}><MessageCircle size={13}/>{mentorTitle}</button>}{state.settings.showCountdowns!==false&&<PetCountdowns events={state.countdowns||[]} ids={state.settings.petCountdownIds}/>}
 </div>;
}
