import {StarterPlans} from './StarterPlans';
import './public-v04.css';
import {Accumulation} from './Accumulation';
import {useEffect,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Leaf,ListTodo,MessageCircle,CalendarDays,Settings,ChevronRight,Cat,ArrowUpRight,X} from 'lucide-react';
import {Todos} from './Todos';
import {MentorBanner,MentorPage,mentorCopy} from './Mentor';
import {Countdowns} from './Countdowns';
import {FocusGarden} from './FocusGarden';
import {Kitty} from './Kitty';
import {ArtworkProvider,useArtwork} from './ChiiArt';
import {Preferences} from './Preferences';
import {RoutineManager} from './RoutineManager';
import {PetWidget} from './PetWidget';
import {useDialogAccessibility} from './useDialogAccessibility';
import {calendarDay} from '../electron/mentor-view.mjs';
import {createRoutines,routinesForDate} from '../electron/routines.mjs';
import type {State,StudyAction} from './types';
import './style.css';
import './polish.css';
import './checklist.css';
import './chiikawa.css';
import './chii-art.css';
import './public-ready.css';
type Page='accumulation'|'todos'|'mentor'|'countdowns'|'settings';
function App(){
 useDialogAccessibility();

 const [state,setState]=useState<State|null>(null),[page,setPage]=useState<Page>('todos'),[toast,setToast]=useState(''),[quickAdd,setQuickAdd]=useState(0),[managing,setManaging]=useState(false);
 const {custom,theme,refresh}=useArtwork(),pet=location.hash==='#pet';
 useEffect(()=>{if(!pet)window.scrollTo(0,0)},[page,pet]);
 useEffect(()=>{if(!window.study)return;let active=true;const update=(s:State)=>{if(active)setState(s)};window.study.getState().then(update).catch(e=>setToast(String(e)));const off=window.study.subscribe(update),poll=setInterval(()=>window.study?.getState().then(update).catch(()=>{}),1000);return()=>{active=false;off();clearInterval(poll)}},[]);
 useEffect(()=>{if(pet)return;return window.study?.subscribeQuickAdd(()=>{if(state?.settings.showTodos===false){setToast('临时待办已关闭，可在偏好设置重新开启。');return}if(document.querySelector('.modal')){setToast('先保存或关闭当前编辑，再快速添加。');return}setPage('todos');setQuickAdd(n=>n+1)})},[pet,state?.settings.showTodos]);
 useEffect(()=>{if(!toast)return;const id=setTimeout(()=>setToast(''),6000);return()=>clearTimeout(id)},[toast]);
 useEffect(()=>{document.documentElement.dataset.reduceMotion=state?.settings.animations===false?'true':'false';document.body.classList.toggle('theme-custom',custom);document.body.classList.toggle('theme-original',!custom)},[state?.settings.animations,custom]);
 useEffect(()=>{if(state)void refresh().catch(()=>{})},[state?.settings.theme,refresh]);
 const act=async(action:StudyAction)=>{try{setState(await window.study!.action(action));return true}catch(e){setToast(e instanceof Error?e.message:String(e));return false}};
 const backup=async(kind:'exportBackup'|'importBackup')=>{try{const path=await window.study![kind]();if(path){setState(await window.study!.getState());setToast(kind==='importBackup'?'备份已恢复':'已保存：'+path)}}catch(e){setToast(e instanceof Error?e.message:String(e))}};
 if(!state)return <div className="loading"><Leaf size={42}/><h1>拾光</h1><p>{window.study?'正在打开你的每日事项…':'请通过桌面应用打开拾光。'}</p></div>;
 const label=state.settings.mentorLabel||'导师汇报',mentor=mentorCopy(state.mentor,label),routines=state.routines??createRoutines(),today=calendarDay(),todayRoutines=routinesForDate(routines,today),done=todayRoutines.filter(r=>state.checkins?.[today]?.[r.id]).length;
 if(pet)return <PetWidget state={state} done={done} total={todayRoutines.length} mentorTitle={mentor.title} act={act}/>;
 const pages={accumulation:{label:'今日积累',title:'把今天的收获，存成小小的光。',description:'读过的书、学到的知识、生活里的小进步，都值得留下。',Icon:Leaf},todos:{label:'今日待办',title:'今天也要，小小地努力一下。',description:'一件一件来，完成一点也值得开心。',Icon:ListTodo},mentor:{label,title:label==='导师汇报'?'小小的进展，也记下来。':label+'，记一下。',description:'只记录上次的日期，看看已经过去多少天。',Icon:MessageCircle},countdowns:{label:'倒数日',title:'把期待的日子，圈起来。',description:'考试、生日、旅行，把重要日期记在这里。',Icon:CalendarDays},settings:{label:'偏好设置',title:'把小窝，布置成喜欢的样子。',description:'自己的计划、桌面陪伴、图片和数据备份。',Icon:Settings}};
 const visible=(['todos','accumulation','mentor','countdowns','settings'] as Page[]).filter(p=>(p!=='accumulation'||state.settings.showAccumulation!==false)&&(p!=='mentor'||state.settings.showMentor!==false)&&(p!=='countdowns'||state.settings.showCountdowns!==false)),active=visible.includes(page)?page:'todos',current=pages[active];
 return <div className="app checklist-app"><aside className="sidebar"><div className="brand"><span className="chii-brand-face"><Kitty compact/></span><div>拾光<small>LITTLE DAILY JOYS</small></div></div><div className="side-label">属于自己的每日计划</div><nav>{visible.map(id=>{const {label,Icon}=pages[id];return <button key={id} aria-label={label} aria-current={active===id?'page':undefined} className={active===id?'active':''} onClick={()=>setPage(id)}><Icon size={19}/><span className="nav-label">{label}</span>{active===id&&<span className="nav-dot"/>}</button>})}</nav><div className="side-bottom"><div className="side-cat"><Kitty/><span>{theme==='chiikawa'?'ちいかわ':custom?'我的小伙伴':'拾光小伙伴'}</span></div><p>慢慢来也没关系呀。</p><button className="pet-toggle" onClick={()=>window.study?.togglePet()}><Cat size={16}/>桌面陪伴<ArrowUpRight size={15}/></button><small>Ctrl + Alt + N · 快速添加</small></div></aside><main><header><div className="breadcrumb">我的空间<ChevronRight size={13}/>{current.label}</div><div className="header-date"><CalendarDays size={16}/>{new Date().toLocaleDateString('zh-CN',{month:'long',day:'numeric',weekday:'long'})}<span className="local-dot"/>本地模式</div></header><div className="content"><div className={'page-heading chii-photo-heading heading-'+active}><div className="eyebrow">{theme==='chiikawa'?'CHIIKAWA · LITTLE DAILY JOYS':custom?'MY LITTLE WORLD':'SHIGUANG · LITTLE DAILY JOYS'}</div><h1>{current.title}</h1><p>{current.description}</p><FocusGarden page={active==='accumulation'?'todos':active}/></div>
 {active==='todos'&&<>{state.settings.welcomeDismissed===false&&<StarterPlans act={act} welcome/>}{state.settings.showMentor!==false&&<MentorBanner label={label} mentor={state.mentor} act={act} onOpen={()=>setPage('mentor')}/>}{state.settings.showDaily===false&&state.settings.showTodos===false?<div className="modules-empty"><h2>留一点空白，也很好。</h2><p>可以在偏好设置开启每日事项或临时待办，也可以去记录积累与倒数日。</p><button className="soft-button" onClick={()=>setPage('settings')}>选择想用的功能</button></div>:<Todos showDaily={state.settings.showDaily!==false} showTodos={state.settings.showTodos!==false} routines={routines} todos={state.todos||{}} checkins={state.checkins||{}} act={act} quickAdd={quickAdd}/>}</>}
 {active==='accumulation'&&<Accumulation entries={state.accumulations||[]} act={act}/>}
 {active==='mentor'&&<MentorPage label={label} mentor={state.mentor} act={act}/>}
 {active==='countdowns'&&<Countdowns events={state.countdowns||[]} petIds={state.settings.petCountdownIds} act={act}/>}
 <div hidden={active!=='settings'}><Preferences state={state} act={act} backup={backup} onCountdowns={()=>setPage('countdowns')} onManage={()=>setManaging(true)}/></div>
 <footer>小小一只，也在好好生活。<span>拾光 0.4 · 本地优先 · 每天一点进展</span></footer></div></main>{managing&&<RoutineManager routines={routines} act={act} onClose={()=>setManaging(false)}/>} {toast&&<div className="toast" role="status">{toast}<button aria-label="关闭提示" onClick={()=>setToast('')}><X size={16}/></button></div>}</div>;
}
createRoot(document.getElementById('root')!).render(<ArtworkProvider><App/></ArtworkProvider>);
