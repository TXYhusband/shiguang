const fs=require('node:fs');const path=require('node:path');const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),version=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8')).version;
const stage=path.join(root,'.cache','source-export-'+Date.now()),output=path.join(root,'release',`StudyCompanion-${version}-source.zip`);
const {sourceFiles}=require('./source-inventory.cjs');
fs.mkdirSync(stage,{recursive:true});const files=sourceFiles(root);let count=0;
for(const file of new Set(files)){const from=path.join(root,file);if(!fs.existsSync(from)||fs.lstatSync(from).isSymbolicLink()||!fs.statSync(from).isFile())continue;const target=path.join(stage,file);fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(from,target);count++;}
if(fs.existsSync(path.join(stage,'.git'))||fs.existsSync(path.join(stage,'data')))throw Error('Private path in source snapshot');
fs.mkdirSync(path.dirname(output),{recursive:true});
execFileSync('powershell.exe',['-NoProfile','-ExecutionPolicy','Bypass','-File',path.join(__dirname,'zip-source.ps1'),'-Source',stage,'-Destination',output],{stdio:'inherit'});
if(process.argv.includes('--verify')){const verified=path.join(root,'.cache','source-verify-'+Date.now());execFileSync('powershell.exe',['-NoProfile','-ExecutionPolicy','Bypass','-File',path.join(__dirname,'zip-source.ps1'),'-Source',stage,'-Destination',output,'-VerifyAndExtractTo',verified],{stdio:'inherit'});const cache=path.join(root,'.cache');for(const folder of ['tmp','electron','electron-builder'])fs.mkdirSync(path.join(cache,folder),{recursive:true});const npm=process.platform==='win32'?'npm.cmd':'npm';const options={cwd:verified,stdio:'inherit',shell:process.platform==='win32',env:{...process.env,npm_config_cache:path.join(root,'.cache','npm'),ELECTRON_CACHE:path.join(cache,'electron'),electron_config_cache:path.join(cache,'electron'),ELECTRON_BUILDER_CACHE:path.join(cache,'electron-builder'),TEMP:path.join(cache,'tmp'),TMP:path.join(cache,'tmp')}};execFileSync(npm,['ci'],options);execFileSync(npm,['test'],options);execFileSync(npm,['run','build'],options);}

console.log(JSON.stringify({output,stage,files:count},null,2));
