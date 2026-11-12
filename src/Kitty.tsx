import {ChiiSticker} from './ChiiArt';
export function Kitty({compact=false}:{sleep?:boolean;compact?:boolean}){return <ChiiSticker className={compact?'chii-portrait-compact':''}/>}
