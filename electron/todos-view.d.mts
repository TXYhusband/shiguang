export interface Todo {id:string;title:string;completed:boolean;createdAt:number;note?:string;dueDate?:string;important?:boolean;archived?:boolean;completedOn?:string}
export interface DatedTodo extends Todo {sourceDate:string}
export function todosForDate(todos:Record<string,Todo[]>|undefined,date:string):DatedTodo[];
