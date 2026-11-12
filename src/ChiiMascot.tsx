import {useId} from 'react';
import type {PetState} from '../electron/pet-behavior.mjs';
export type ChiiVariant='chiikawa'|'hachiware'|'usagi';
export function ChiiMascot({variant='chiikawa',state='sit-idle',compact=false}:{variant?:ChiiVariant;state?:PetState;compact?:boolean}){
 const id=useId().replaceAll(':',''),sleeping=state==='sleep',happy=state==='happy',eating=state==='eat',walking=/^(walk|run)-/.test(state)||state==='play',rabbit=variant==='usagi',blue=variant==='hachiware',fur=rabbit?'#fff0bd':'#fffefa',line='#735b52';
 return <svg className={`animated-cat chii-mascot chii-${variant} ${walking?'cat-walking':''} ${eating?'cat-eating':''} ${sleeping?'cat-sleeping':''} ${happy?'cat-happy':''}`} viewBox={compact?'35 8 130 132':'0 0 200 160'} role="img" aria-label={blue?'小八':rabbit?'乌萨奇':'吉伊'} data-chii={variant}>
 <defs><clipPath id={`chii-head-${id}`}><path d="M48 81C45 57 68 49 100 49S155 59 152 82C159 109 141 127 101 127S41 110 48 81Z"/></clipPath></defs>
 {!compact&&<ellipse cx="100" cy="148" rx="43" ry="5" fill="#b79a8520"/>}
 <g className="cat-body-group">
 {blue&&<path className="cat-tail kitty-tail" d="M130 124Q159 128 154 112Q151 104 147 110" fill="none" stroke="#735b52" strokeWidth="11" strokeLinecap="round"/>}
 {blue&&<path className="cat-tail" d="M130 124Q159 128 154 112Q151 104 147 110" fill="none" stroke="#afcde1" strokeWidth="6" strokeLinecap="round"/>}
 <path d="M74 109Q64 122 70 137Q77 145 88 137L100 133L113 138Q125 144 132 134Q135 120 126 109Z" fill={fur} stroke={line} strokeWidth="2.5" strokeLinejoin="round"/>
 <g className="cat-leg leg-a"><path d="M77 132Q70 139 77 145Q88 149 91 140" fill={fur} stroke={line} strokeWidth="2.4" strokeLinecap="round"/></g><g className="cat-leg leg-b"><path d="M110 139Q115 149 125 144Q132 138 123 132" fill={fur} stroke={line} strokeWidth="2.4" strokeLinecap="round"/></g>
 <g className="cat-head">
 {rabbit?<g className="chii-ears"><path d="M68 58Q51 11 65 8Q78 5 83 54M114 53Q119 5 131 8Q144 13 130 61" fill={fur} stroke={line} strokeWidth="2.5"/><path d="M67 20L74 48M128 20L122 47" stroke="#efd0a4" strokeWidth="6" strokeLinecap="round"/></g>:blue?<g className="chii-ears"><path d="M57 65L53 32Q56 26 76 52M123 52Q146 27 148 34L144 70" fill="#b9d5e7" stroke={line} strokeWidth="2.5" strokeLinejoin="round"/><path d="M60 43L62 57L69 53M133 53L140 42L139 59" fill="#f2d1d0"/></g>:<g className="chii-ears"><circle cx="65" cy="53" r="15" fill={fur} stroke={line} strokeWidth="2.5"/><circle cx="136" cy="53" r="15" fill={fur} stroke={line} strokeWidth="2.5"/><circle cx="65" cy="53" r="7.5" fill="#f9e5e4"/><circle cx="136" cy="53" r="7.5" fill="#f9e5e4"/></g>}
 <path d="M48 81C45 57 68 49 100 49S155 59 152 82C159 109 141 127 101 127S41 110 48 81Z" fill={fur} stroke={line} strokeWidth="2.7" strokeLinejoin="round"/>
 {blue&&<g clipPath={`url(#chii-head-${id})`}><path d="M43 52L157 51L158 86Q138 82 123 68L102 86L80 68Q64 83 43 86Z" fill="#b7d2e5"/><path d="M86 48L101 76L116 48" fill="#fffefa"/></g>}
 {(sleeping||happy||eating)?<path d="M72 89Q79 95 85 88M117 88Q123 95 130 89" fill="none" stroke={line} strokeWidth="2.7" strokeLinecap="round"/>:<g className="cat-open-eyes"><ellipse cx="79" cy="89" rx="3.7" ry="4.7" fill="#55433e"/><ellipse cx="124" cy="89" rx="3.7" ry="4.7" fill="#55433e"/><circle cx="80" cy="87.5" r="1" fill="#fff"/><circle cx="125" cy="87.5" r="1" fill="#fff"/></g>}
 {!sleeping&&<path d={rabbit?'M72 79L82 77M120 77L130 80':'M73 78Q78 75 84 77M118 77Q124 75 130 78'} fill="none" stroke={line} strokeWidth="2" strokeLinecap="round"/>}
 <ellipse cx="63" cy="103" rx="10" ry="5.5" fill="#f1bcc0" opacity=".8"/><ellipse cx="140" cy="103" rx="10" ry="5.5" fill="#f1bcc0" opacity=".8"/>
 <path d="M57 102L59 105M63 102L65 105M135 102L137 105M141 102L143 105" stroke="#d893a3" strokeWidth="1.3" strokeLinecap="round"/>
 {rabbit&&!sleeping?<path className="cat-mouth" d="M94 101Q102 99 109 101Q107 112 102 112Q96 112 94 101Z" fill="#efb9b4" stroke={line} strokeWidth="2"/>:<g><ellipse cx="102" cy="98" rx="2" ry="1.4" fill={line}/><path className="cat-mouth" d="M102 100Q99 106 95 102M102 100Q105 106 109 102" fill="none" stroke={line} strokeWidth="2" strokeLinecap="round"/></g>}
 {blue&&<path d="M53 94L64 97M52 105L64 104M140 97L151 94M140 104L152 105" stroke={line} strokeWidth="1.7" strokeLinecap="round"/>}
 </g><path d="M68 119Q58 114 57 121Q58 129 70 127M133 120Q145 115 145 123Q143 130 132 127" fill={fur} stroke={line} strokeWidth="2.4" strokeLinecap="round"/>
 </g>
 {eating&&<g className="cat-food"><ellipse cx="147" cy="145" rx="26" ry="4" fill="#c4a7aa30"/><path d="M121 130L174 130L169 144L126 144Z" fill="#efc0c9" stroke={line} strokeWidth="2"/><ellipse cx="147" cy="130" rx="26" ry="5" fill="#ffedf0" stroke={line} strokeWidth="2"/><g className="food-fish"><ellipse cx="149" cy="128" rx="12" ry="5" fill="#a9cadd"/><path d="M138 128L131 123L131 132Z" fill="#a9cadd"/><circle cx="155" cy="127" r="1.3" fill={line}/></g></g>}
 {sleeping&&<g className="cat-zzz" fill="#a5bad2" fontFamily="sans-serif" fontWeight="700"><text x="149" y="64" fontSize="17">z</text><text x="165" y="45" fontSize="23">Z</text></g>}
 {happy&&<g className="cat-hearts" fill="#e7a8b4" stroke="#bb8091" strokeWidth="1.5"><path d="M43 47C23 31 35 23 43 30C53 20 65 32 43 47Z"/><path d="M157 30C141 17 152 10 158 17C167 8 178 21 157 30Z"/></g>}
 </svg>;
}
