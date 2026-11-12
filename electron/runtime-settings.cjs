const {collectReminders}=require('./countdown.cjs');
function collectVisibleReminders(state,today){return state.settings.showCountdowns===false?[]:collectReminders(state.countdowns,today);}
module.exports={collectVisibleReminders};
