import {defineConfig} from 'vite';
import {copyFileSync,mkdirSync,readdirSync} from 'node:fs';
import {resolve} from 'node:path';
// Copy the selected Chiikawa branding plus optional original branding and notices.
export default defineConfig({base:'./',publicDir:false,plugins:[{name:'public-allowlist',closeBundle(){for(const folder of ['branding','licenses'])mkdirSync(resolve('dist',folder),{recursive:true});for(const file of ['pet.svg','pet.png','pet.ico','chiikawa-icon.svg','shiguang.png','shiguang.ico'])copyFileSync(resolve('public/branding',file),resolve('dist/branding',file));for(const file of readdirSync('public/licenses'))copyFileSync(resolve('public/licenses',file),resolve('dist/licenses',file));}}]});
