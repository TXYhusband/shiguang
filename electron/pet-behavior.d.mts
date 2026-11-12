export type PetState='sit-idle'|'walk-left'|'walk-right'|'run-left'|'run-right'|'eat'|'happy'|'play'|'sleep';
export type PetCommand='feed'|'pet'|'play'|'sleep'|'wake'|'walk'|'rest';
export interface PetBehavior {state:PetState;since:number;until:number;manualSleep:boolean}
export const catSequence:Record<string,PetState[]>;
export function createPet(now?:number):PetBehavior;
export function commandPet(p:PetBehavior,command:PetCommand,now?:number):PetBehavior;
export function tickPet(p:PetBehavior,now?:number,random?:()=>number):PetBehavior;
export function moveWithinBounds(x:number,direction:number,distance:number,bounds:{left:number;right:number},width:number):{x:number;direction:number};
