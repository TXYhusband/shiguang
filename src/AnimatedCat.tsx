import {useArtwork} from './ChiiArt';
import {ChiiMascot} from './ChiiMascot';
import type {PetState} from '../electron/pet-behavior.mjs';
function OriginalCat({state}:{state:PetState}){
 const walking=/^(walk|run)-/.test(state)||state==='play',sleeping=state==='sleep',eating=state==='eat',happy=state==='happy';
 return <svg className={`animated-cat ${walking?'cat-walking':''} ${eating?'cat-eating':''} ${sleeping?'cat-sleeping':''} ${happy?'cat-happy':''}`} viewBox="0 0 200 160" aria-label={eating?'小猫正在吃鱼':sleeping?'小猫正在睡觉':happy?'小猫开心地被摸头':walking?'小猫正在活动':'陪伴你的小猫'}>
 <ellipse cx="100" cy="145" rx="56" ry="6" fill="#2b4b3218"/>
 <g className="cat-body-group">
 <path className="cat-tail" d="M63 116 Q33 133 30 111 Q25 96 34 91" fill="none" stroke="#dba16f" strokeWidth="12" strokeLinecap="round"/>
 <ellipse cx="103" cy="117" rx="43" ry="26" fill="#e7b381"/>
 <g className="cat-leg leg-a"><path d="M73 115 L71 139 Q77 144 84 139 L83 119" fill="#eac08f"/><path d="M73 139 L82 139" stroke="#bd8d65" strokeWidth="2" strokeLinecap="round"/></g>
 <g className="cat-leg leg-b"><path d="M116 115 L117 139 Q123 144 130 139 L126 117" fill="#eac08f"/><path d="M118 139 L127 139" stroke="#bd8d65" strokeWidth="2" strokeLinecap="round"/></g>
 <g className="cat-head"><path d="M57 76 L55 28 L83 48 Q102 41 120 49 L146 29 L144 78 Q141 111 102 112 Q63 113 57 76" fill="#f0c693"/>
 <path d="M63 42 L65 65 L78 54 M127 55 L139 41 L137 66" fill="#dc9a82"/>
 <path d="M90 46 L93 61 M103 45 L103 61 M116 48 L113 62" stroke="#c28e61" strokeWidth="5" strokeLinecap="round"/>
 {(sleeping||happy||eating)?<path d="M74 81 Q81 87 88 80 M117 80 Q124 87 131 80" fill="none" stroke="#534135" strokeWidth="3" strokeLinecap="round"/>:<g className="cat-open-eyes"><ellipse cx="81" cy="81" rx="3.5" ry="5" fill="#534135"/><ellipse cx="125" cy="81" rx="3.5" ry="5" fill="#534135"/></g>}
 <path d="M98 89 L106 89 L102 94 Z" fill="#ae7468"/>
 <path className="cat-mouth" d="M102 94 Q98 101 93 96 M102 94 Q106 101 111 96" fill="none" stroke="#815d45" strokeWidth="2"/>
 <ellipse cx="70" cy="94" rx="9" ry="4" fill="#e3a483" opacity=".45"/><ellipse cx="135" cy="94" rx="9" ry="4" fill="#e3a483" opacity=".45"/>
 <path d="M51 91 L70 94 M136 94 L155 89 M52 102 L71 99 M136 99 L153 103" stroke="#a98661" strokeWidth="1.7" strokeLinecap="round"/>
 </g></g>
 {eating&&<g className="cat-food"><ellipse cx="147" cy="143" rx="30" ry="5" fill="#59795d20"/><path d="M118 128 L176 128 L170 143 L125 143 Z" fill="#8daf9c"/><ellipse cx="147" cy="128" rx="29" ry="6" fill="#cee0d4"/><g className="food-fish"><ellipse cx="148" cy="126" rx="12" ry="5" fill="#dc9b66"/><path d="M137 126 L130 120 L130 131 Z" fill="#dc9b66"/><circle cx="154" cy="125" r="1.2" fill="#654733"/></g><path d="M139 115 L141 110 M153 113 L155 108" stroke="#d3ba8b" strokeWidth="2" strokeLinecap="round"/></g>}
 {sleeping&&<g className="cat-zzz" fill="#9db1a0" fontFamily="sans-serif" fontWeight="700"><text x="145" y="58" fontSize="17">z</text><text x="164" y="40" fontSize="23">Z</text></g>}
 {happy&&<g className="cat-hearts" fill="#dca29e"><path d="M48 56 C25 38 40 28 48 37 C57 26 72 39 48 56"/><path d="M153 32 C136 18 148 11 153 18 C161 10 172 21 153 32"/></g>}
 </svg>;
}

export function AnimatedCat({state}:{state:PetState}){const {theme}=useArtwork();return theme==='original'?<OriginalCat state={state}/>:<ChiiMascot variant="hachiware" state={state}/>;}
