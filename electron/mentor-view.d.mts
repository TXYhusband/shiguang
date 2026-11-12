import type {Mentor, MentorReport} from '../src/types';
export function calendarDay(now?:number):string;
export function createMentor(today?:string):Mentor;
export function mentorStatus(mentor?:Mentor,today?:string):{
  latest:MentorReport|null;anchor:string;elapsed:number;level:'calm'|'gentle'|'warning'|'urgent';title:string;message:string;remaining:number;
};
