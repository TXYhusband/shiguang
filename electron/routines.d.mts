export interface RoutineVersion {from:string;name:string;art:string;color:string;weekdays:number[];enabled:boolean;archived:boolean}
export interface Routine {id:string;order:number;versions:RoutineVersion[]}
export interface ResolvedRoutine extends RoutineVersion {id:string;order:number}
export type RoutineAction =
 | {type:'routine-add';name:string;art:string;color:string;weekdays:number[]}
 | ({type:'routine-edit';id:string}&Partial<Pick<RoutineVersion,'name'|'art'|'color'|'weekdays'|'enabled'>>)
 | {type:'routine-archive'|'routine-restore';id:string}
 | {type:'routine-preset';preset:string}
 | {type:'routine-reorder';ids:string[]};
export function createRoutines(preset?:string):Routine[];
export function routineVersion(routine:Routine,date:string):RoutineVersion|undefined;
export function routinesForDate(routines:Routine[],date:string):ResolvedRoutine[];
export function validateRoutines(routines:unknown):Routine[];
export function updateRoutines(routines:Routine[],action:RoutineAction,now?:number):Routine[];
