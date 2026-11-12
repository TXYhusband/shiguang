// Explicit legacy-user fixture: existing personal plans and terminology survive upgrades.
const {createState:fresh}=require('../electron/engine.cjs');const {createRoutines}=require('../electron/routines.mjs');
function createState(now){const s=fresh(now);s.routines=createRoutines();Object.assign(s.settings,{mentorLabel:'导师汇报',showMentor:true,welcomeDismissed:true});return s}
module.exports={createState};
