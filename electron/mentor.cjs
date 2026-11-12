const {randomUUID} = require('node:crypto');
const {createMentor, mentorStatus, calendarDay} = require('./mentor-view.mjs');
const validDate = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
  && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0,10) === value;

function validateMentor(mentor) {
  if (!mentor || !validDate(mentor.startedOn) || typeof mentor.reminder !== 'boolean'
    || !Array.isArray(mentor.reports) || (mentor.notifiedOn !== undefined && !validDate(mentor.notifiedOn))) {
    throw Error('导师汇报数据无效');
  }
  const ids = new Set();
  for (const report of mentor.reports) {
    if (!report || typeof report.id !== 'string' || !report.id || ids.has(report.id) || !validDate(report.date)
      || typeof report.note !== 'string' || report.note.length > 2000 || !Number.isFinite(report.at) || report.at < 0) {
      throw Error('导师汇报记录无效');
    }
    ids.add(report.id);
  }
  return mentor;
}

function updateMentor(mentor, action, now) {
  const next = structuredClone(mentor || createMentor(calendarDay(now)));
  if (action.type === 'mentor-report') {
    const date = action.date || calendarDay(now);
    if (!validDate(date)) throw Error('请选择有效的汇报日期');
    if (date > calendarDay(now)) throw Error('不能记录未来的汇报');
    const note = String(action.note || '').trim();
    if (note.length > 2000) throw Error('汇报备注最多 2000 字');
    if (!action.date && !note && mentorStatus(next,calendarDay(now)).latest?.date === date) return next;
    next.reports.push({id:randomUUID(), date, note, at:now});
    next.reports.sort((a,b) => b.date.localeCompare(a.date) || b.at-a.at);
  } else if (action.type === 'mentor-remove') {
    if (!next.reports.some(report => report.id === action.id)) throw Error('这条汇报记录已不存在');
    next.reports = next.reports.filter(report => report.id !== action.id);
  } else if (action.type === 'mentor-settings') {
    if (typeof action.reminder !== 'boolean') throw Error('提醒设置无效');
    next.reminder = false;
  }
  if (mentorStatus(next).anchor !== mentorStatus(mentor).anchor) delete next.notifiedOn;
  next.reminder = false;
  return validateMentor(next);
}

function collectMentorReminder() { return null; }

module.exports = {createMentor, mentorStatus, validateMentor, updateMentor, collectMentorReminder};
