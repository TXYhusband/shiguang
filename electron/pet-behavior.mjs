// Adapted from tonybaloney/vscode-pets (MIT), commit 15f13bc96cb8bade1aff2d49e363cd332b18536b.
// Sources: src/panel/pets/cat.ts sequence; src/panel/states.ts WalkLeftState/WalkRightState.
// Copyright (c) 2022 Anthony Shaw. See public/licenses/vscode-pets-MIT.txt.
// Adaptations: time-based states, explicit interactions, native desktop bounds, original SVG renderer.
export const catSequence={
 'sit-idle':['walk-right','run-right'],
 'walk-right':['walk-left','run-left'],
 'run-right':['walk-left','run-left'],
 'walk-left':['sit-idle','walk-right','run-right'],
 'run-left':['sit-idle','walk-right','run-right'],
};
export function createPet(now=Date.now()){return {state:'sit-idle',since:now,until:now+6000,manualSleep:false};}
export function commandPet(p,command,now=Date.now()){
 const map={feed:'eat',pet:'happy',play:'play',sleep:'sleep',wake:'sit-idle',walk:'walk-right',rest:'sit-idle'};
 const state=map[command];if(!state)throw Error('未知桌宠动作');
 return {state,since:now,until:now+(state==='eat'?4200:state==='happy'?2400:state==='play'?5500:6000),manualSleep:command==='sleep'};
}
export function tickPet(p,now=Date.now(),random=Math.random){
 if(p.manualSleep||now<p.until)return p;
 const choices=catSequence[p.state];
 if(!choices)return createPet(now);
 const roll=Math.max(0,Math.min(.999999,random()));
 if(p.state==='sit-idle'&&roll>.88)return {state:'sleep',since:now,until:now+7000,manualSleep:false};
 const state=choices[Math.floor(roll*choices.length)];
 return {state,since:now,until:now+(state==='sit-idle'?6500:3500),manualSleep:false};
}
export function moveWithinBounds(x,direction,distance,bounds,width){
 const left=bounds.left,right=Math.max(left,bounds.right-width),next=x+Math.sign(direction)*Math.max(0,distance);
 if(next>=right)return {x:right,direction:-1};
 if(next<=left)return {x:left,direction:1};
 return {x:next,direction:Math.sign(direction)||1};
}
