const test = require('node:test');
const assert = require('node:assert/strict');
const {createState, dispatch, recover, validateState} = require('../electron/engine.cjs');
const at = day => new Date(day + 'T12:00:00').getTime();

test('old backups begin a mentor cycle without claiming a report happened', () => {
  const old = createState(at('2026-10-01'));
  delete old.mentor;
  const state = recover(old, at('2026-10-04'));
  assert.equal(state.mentor.startedOn, '2026-10-04');
  assert.deepEqual(state.mentor.reports, []);
});

test('reporting resets the cycle while retaining study time and report history', () => {
  let state = createState(at('2026-10-01'));
  state.days['2026-10-01']={research:{focusMs:60000,breakMs:0,completed:false,records:[],overruns:0}};
  state = dispatch(state, {type:'mentor-report', date:'2026-10-04', note:'跑通了 baseline'}, at('2026-10-04'));
  assert.equal(state.mentor.reports[0].date, '2026-10-04');
  assert.equal(state.active, null);
  assert.ok(state.days['2026-10-01'].research.focusMs > 0);
  state = dispatch(state, {type:'mentor-report', date:'2026-10-02', note:'补记'}, at('2026-10-04'));
  assert.equal(state.mentor.reports[0].date, '2026-10-04');
  const restored = recover(state, at('2026-10-06'));
  assert.equal(restored.mentor.reports.length, 2);
  assert.throws(() => dispatch(state, {type:'mentor-report', date:'2026-10-05'}, at('2026-10-04')), /未来/);
  assert.throws(() => validateState({...state, mentor:{...state.mentor, reports:[{id:'bad',date:'2026-02-30',note:'',at:1}]}}), /汇报/);
});

test('elapsed days remain neutral and silent on days 3, 4, 5 and beyond', () => {
  const {mentorStatus, collectMentorReminder} = require('../electron/mentor.cjs');
  const state = createState(at('2026-10-01'));
  const mentor = state.mentor;
  for (const [day, level] of [[2,'calm'],[3,'calm'],[4,'calm'],[5,'calm'],[8,'calm']]) {
    assert.equal(mentorStatus(mentor, `2026-10-${String(1+day).padStart(2,'0')}`).level, level);
  }
  assert.equal(collectMentorReminder(mentor, '2026-10-03'), null);
  assert.equal(collectMentorReminder(mentor, '2026-10-06'), null);
  assert.equal(collectMentorReminder(mentor, '2026-10-06'), null);
  assert.equal(collectMentorReminder(recover(state, at('2026-10-06')).mentor, '2026-10-06'), null);
  assert.equal(collectMentorReminder(mentor, '2026-10-09'), null);
  const reported = dispatch(state, {type:'mentor-report'}, at('2026-10-09'));
  assert.equal(mentorStatus(reported.mentor, '2026-10-09').elapsed, 0);
  assert.equal(collectMentorReminder(reported.mentor, '2026-10-09'), null);
  reported.mentor.reminder = false;
  assert.equal(collectMentorReminder(reported.mentor, '2026-10-14'), null);
});

test('undoing a report recalculates elapsed days across months', () => {
  const {mentorStatus} = require('../electron/mentor.cjs');
  let state = createState(at('2026-09-29'));
  state = dispatch(state, {type:'mentor-report'}, at('2026-10-04'));
  state = dispatch(state, {type:'mentor-remove', id:state.mentor.reports[0].id}, at('2026-10-04'));
  assert.equal(mentorStatus(state.mentor, '2026-10-04').elapsed, 5);
  assert.equal(mentorStatus(state.mentor, '2026-10-04').level, 'calm');
});

test('quick report is idempotent and backfilling an older report does not repeat notifications', () => {
  const {collectMentorReminder} = require('../electron/mentor.cjs');
  let state = createState(at('2026-10-01'));
  state = dispatch(state, {type:'mentor-report'}, at('2026-10-02'));
  state = dispatch(state, {type:'mentor-report'}, at('2026-10-02')+1);
  assert.equal(state.mentor.reports.length,1);
  assert.equal(collectMentorReminder(state.mentor,'2026-10-05'),null);
  state = dispatch(state, {type:'mentor-report',date:'2026-10-01',note:'补记更早的汇报'},at('2026-10-05'));
  assert.equal(collectMentorReminder(state.mentor,'2026-10-05'),null);
});
