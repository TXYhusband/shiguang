const {moveWithinBounds}=require('./pet-behavior.mjs');
function createPetWalker(getWindow,isRoaming,screen){
 let moving=false,direction=1,hover=false,speed=45,last=Date.now();
 const timer=setInterval(()=>{
  const now=Date.now(),dt=Math.min(100,now-last)/1000;last=now;
  const win=getWindow();if(!win||win.isDestroyed()||!win.isVisible()||!isRoaming()||!moving||hover)return;
  const current=win.getBounds(),area=screen.getDisplayMatching(current).workArea;
  const step=moveWithinBounds(current.x,direction,speed*dt,{left:area.x,right:area.x+area.width},current.width);
  const y=Math.max(area.y,Math.min(current.y,area.y+area.height-current.height));
  win.setPosition(Math.round(step.x),Math.round(y),false);
  if(step.direction!==direction){direction=step.direction;win.webContents.send('pet-direction',direction);}
 },50);
 return {
  set(payload){if(!payload||typeof payload!=='object')throw Error('桌宠动作无效');if('hover' in payload){if(typeof payload.hover!=='boolean')throw Error('桌宠状态无效');hover=payload.hover;}if('state' in payload){if(!['sit-idle','walk-left','walk-right','run-left','run-right','eat','happy','play','sleep'].includes(payload.state))throw Error('桌宠动作无效');moving=/^(walk|run)-/.test(payload.state);if(moving){direction=payload.state.endsWith('left')?-1:1;speed=payload.state.startsWith('run')?75:45;}}},
  stop(){moving=false;hover=false;},
  close(){clearInterval(timer);}
 };
}
module.exports={createPetWalker};
