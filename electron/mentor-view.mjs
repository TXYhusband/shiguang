export function calendarDay(now = Date.now()) {
  const date = new Date(now);
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}

export function createMentor(today = calendarDay()) {
  return {startedOn: today, reports: [], reminder: false};
}

export function mentorStatus(mentor, today = calendarDay()) {
  const latest = (mentor?.reports || []).reduce((last, report) =>
    !last || report.date > last.date || (report.date === last.date && report.at > last.at) ? report : last, null);
  const anchor = latest?.date || mentor?.startedOn || today;
  const elapsed = Math.max(0, Math.round((Date.parse(today+'T00:00:00Z')-Date.parse(anchor+'T00:00:00Z'))/86400000));
  const level = 'calm';
  const title = latest ? '距上次汇报 '+elapsed+' 天' : '尚未记录汇报';
  const message = latest ? '上次汇报：'+latest.date : '记录一次已完成的汇报，即可查看间隔天数。';
  return {latest, anchor, elapsed, level, title, message, remaining:0};
}
