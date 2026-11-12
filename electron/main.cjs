const {createPetWalker}=require('./pet-window.cjs');

const {collectVisibleReminders}=require('./runtime-settings.cjs');
const {app,BrowserWindow,ipcMain,Menu,Tray,nativeImage,Notification,dialog,shell,screen,protocol,net,globalShortcut}=require('electron');
const fs=require('node:fs');const path=require('node:path');const {pathToFileURL}=require('node:url');
const {createState,dispatch,snapshot,recover,validateState,dateKey}=require('./engine.cjs');const {Store}=require('./store.cjs');


const {resolveStoragePaths,assertRelocationTarget,writeDataProfile,copyDataDirectory}=require('./data-path.cjs');const themes=require('./themes.cjs');
protocol.registerSchemesAsPrivileged([{scheme:'shiguang-art',privileges:{standard:true,secure:true,supportFetchAPI:true}}]);
const root=app.isPackaged?(process.env.PORTABLE_EXECUTABLE_DIR||path.dirname(process.execPath)):path.resolve(__dirname,'..');const {mode,profileRoot,dataDir}=resolveStoragePaths(root,{appData:app.getPath('appData'),packaged:app.isPackaged});
fs.mkdirSync(path.join(dataDir,'chromium'),{recursive:true});app.setPath('userData',dataDir);app.setPath('sessionData',path.join(dataDir,'chromium'));app.setPath('logs',path.join(dataDir,'logs'));app.setAppUserModelId('local.study.companion');
let main,pet,tray,store,state,timer,quitting=false,saveError=false;const index=path.resolve(__dirname,'../dist/index.html');
let petRoamingMode=null,fixedPetPosition=null,lastBackupDay=null;
function syncLogin(){if(process.env.STUDY_TEST)return;app.setLoginItemSettings({openAtLogin:Boolean(state.settings.launchAtLogin),path:process.env.PORTABLE_EXECUTABLE_FILE||process.execPath,args:[]});}
const petWalker=createPetWalker(()=>pet,()=>Boolean(state?.settings.petRoaming),screen);
function imageIcon(){const iconPath=app.isPackaged?path.join(process.resourcesPath,'branding/shiguang.png'):path.resolve(__dirname,'../public/branding/pet.png');if(fs.existsSync(iconPath))return nativeImage.createFromPath(iconPath).resize({width:32,height:32});const size=32,b=Buffer.alloc(size*size*4);for(let y=0;y<size;y++)for(let x=0;x<size;x++){const i=(y*size+x)*4;const inside=(x-16)**2+(y-16)**2<220;const eye=(y>=12&&y<=16&&(x===11||x===21));b[i]=eye?236:91;b[i+1]=eye?244:113;b[i+2]=eye?244:51;b[i+3]=inside?255:0;}return nativeImage.createFromBitmap(b,{width:size,height:size});}
function broadcast(){for(const w of BrowserWindow.getAllWindows())if(!w.isDestroyed())w.webContents.send('state-updated',state);}
function broadcastArtwork(){for(const w of BrowserWindow.getAllWindows())if(!w.isDestroyed())w.webContents.send('artwork-updated');}
function save(next){store.save(next);state=next;broadcast();return state;}
function showMain(){if(main&&!main.isDestroyed()){if(main.isMinimized())main.restore();main.show();main.focus();}}
function setupWindow(opts,hash){const w=new BrowserWindow({...opts,icon:imageIcon(),webPreferences:{preload:path.join(__dirname,'preload.cjs'),contextIsolation:true,nodeIntegration:false,sandbox:true}});w.webContents.setWindowOpenHandler(()=>({action:'deny'}));w.webContents.on('will-navigate',e=>e.preventDefault());w.webContents.session.setPermissionRequestHandler((_wc,_p,cb)=>cb(false));w.loadFile(index,hash?{hash}:undefined);return w;}
function syncPet(){
 if(!state.settings.pet){if(pet&&!pet.isDestroyed())pet.hide();petWalker.stop();return;}
 const roaming=Boolean(state.settings.petRoaming),size=roaming?{width:220,height:235}:{width:280,height:440};
 if(!pet||pet.isDestroyed()){
  const area=screen.getPrimaryDisplay().workArea;
  pet=setupWindow({...size,x:area.x+Math.max(0,area.width-size.width-25),y:area.y+Math.max(0,area.height-size.height-25),frame:false,transparent:true,alwaysOnTop:true,resizable:false,skipTaskbar:true},'pet');
  petRoamingMode=roaming;pet.on('closed',()=>{pet=null;petRoamingMode=null;petWalker.stop();});
 }else{
  if(petRoamingMode!==roaming){const old=pet.getBounds();if(roaming)fixedPetPosition={x:old.x,y:old.y};const area=screen.getDisplayMatching(old).workArea,preferred=!roaming&&fixedPetPosition?fixedPetPosition:old;
   pet.setBounds({...size,x:Math.max(area.x,Math.min(preferred.x,area.x+area.width-size.width)),y:Math.max(area.y,Math.min(preferred.y,area.y+area.height-size.height))},false);petRoamingMode=roaming;petWalker.stop();
  }if(!pet.isVisible())pet.showInactive();
 }
}

function notify(title,body){if(process.env.STUDY_TEST)return;if(Notification.isSupported())new Notification({title,body}).show();}
function heartbeat(){try{const next=snapshot(state);const reminders=collectVisibleReminders(next,dateKey(Date.now()));save(next);for(const message of reminders)notify('拾光 · 倒数日',message);const day=dateKey(Date.now());if(lastBackupDay!==day){store.backup(next);lastBackupDay=day;}saveError=false;}catch(e){if(!saveError){saveError=true;notify('保存失败','请检查数据文件夹空间或文件权限。');}}}
function trusted(event){const url=event.senderFrame?.url||'';if(url.split('#')[0]!==pathToFileURL(index).href)throw Error('页面来源无效');}
function handle(name,fn){ipcMain.handle(name,async(event,...args)=>{trusted(event);return fn(...args);});}
if(!app.requestSingleInstanceLock()){app.quit();}else{app.on('second-instance',showMain);app.whenReady().then(()=>{
protocol.handle('shiguang-art',request=>{const file=themes.artworkFile(dataDir,request.url);return file?net.fetch(pathToFileURL(file).href):new Response('Not found',{status:404});});
try{store=new Store(dataDir);const loaded=store.load();if(loaded&&!fs.existsSync(path.join(dataDir,'backups','study-before-upgrade-0.2.0.json')))store.backup(loaded,'before-upgrade-0.2.0');state=recover(loaded||createState());store.save(state);store.backup(state);lastBackupDay=dateKey(Date.now());syncLogin();}catch(e){dialog.showErrorBox('无法读取学习数据',`数据文件未被覆盖。请从备份恢复，或检查文件权限。\n${e.message}`);app.quit();return;}
main=setupWindow({width:1280,height:860,minWidth:940,minHeight:690,backgroundColor:'#fffaf2',title:'拾光 · 每日陪伴',show:false});main.once('ready-to-show',()=>main.show());main.on('close',e=>{if(!quitting){e.preventDefault();main.hide();}});Menu.setApplicationMenu(null);
tray=new Tray(imageIcon());tray.setToolTip('拾光 · 每日陪伴');tray.setContextMenu(Menu.buildFromTemplate([{label:'打开拾光',click:showMain},{label:'显示 / 隐藏桌宠',click:()=>{save(dispatch(state,{type:'settings',settings:{pet:!state.settings.pet}}));syncPet();}},{type:'separator'},{label:'退出拾光',click:()=>app.quit()}]));tray.on('double-click',showMain);
ipcMain.handle('pet-motion',(event,motion)=>{trusted(event);if(event.sender!==pet?.webContents)throw Error('只能控制当前桌宠');petWalker.set(motion);});
handle('state',()=>snapshot(state));handle('action',action=>{const next=save(dispatch(state,action));syncPet();if(action.type==='settings'){syncLogin();if(action.settings?.theme!==undefined)broadcastArtwork();}return next;});handle('pet',()=>{save(dispatch(state,{type:'settings',settings:{pet:!state.settings.pet}}));syncPet();});handle('show',showMain);
handle('external',url=>{const u=new URL(url);if(u.protocol!=='https:')throw Error('仅支持 HTTPS 链接');return shell.openExternal(u.href);});
handle('export',async kind=>{if(kind!=='json')throw Error('格式无效');const next=save(snapshot(state));const result=await dialog.showSaveDialog(main,{defaultPath:path.join(dataDir,`拾光-${dateKey(Date.now())}.${kind}`),filters:[{name:kind.toUpperCase(),extensions:[kind]}]});if(result.canceled)return null;fs.writeFileSync(result.filePath,JSON.stringify(next,null,2),'utf8');return result.filePath;});
handle('import',async()=>{const result=await dialog.showOpenDialog(main,{defaultPath:path.join(dataDir,'backups'),properties:['openFile'],filters:[{name:'拾光备份',extensions:['json']}]});if(result.canceled)return null;const file=result.filePaths[0];if(fs.statSync(file).size>20000000)throw Error('备份文件过大');const imported=validateState(JSON.parse(fs.readFileSync(file,'utf8').replace(/^\uFEFF/,'')));const answer=await dialog.showMessageBox(main,{type:'question',buttons:['取消','恢复此备份'],defaultId:0,cancelId:0,message:'将用此备份替换当前数据',detail:'当前数据会先自动备份。'});if(answer.response!==1)return null;store.backup(snapshot(state),`before-restore-${Date.now()}`);save(recover(imported));syncPet();syncLogin();broadcastArtwork();return file;});
handle('artwork',()=>({...themes.getArtwork(dataDir,state.settings.theme==='custom'),theme:state.settings.theme||'chiikawa'}));
handle('theme-import',async()=>{const result=await dialog.showOpenDialog(main,{title:'选择本地主题图片文件夹',properties:['openDirectory']});if(result.canceled)return false;themes.importTheme(result.filePaths[0],dataDir,bytes=>!nativeImage.createFromBuffer(bytes).isEmpty());save(dispatch(state,{type:'settings',settings:{theme:'custom'}}));broadcastArtwork();return true;});
handle('theme-reset',()=>{save(dispatch(state,{type:'settings',settings:{theme:'chiikawa'}}));broadcastArtwork();});
handle('data-open',async()=>{const error=await shell.openPath(dataDir);if(error)throw Error(error);});
handle('data-change',async()=>{const result=await dialog.showOpenDialog(main,{title:'选择新的空数据文件夹（完成后重启）',properties:['openDirectory','createDirectory']});if(result.canceled)return false;const target=path.resolve(result.filePaths[0]);assertRelocationTarget(root,target,mode);save(snapshot(state));store.backup(state,'before-relocate-'+Date.now());store.db.exec('PRAGMA wal_checkpoint(FULL)');copyDataDirectory(dataDir,target);let check;try{check=new Store(target);if(!check.load())throw Error('复制的数据校验失败');}finally{check?.close();}writeDataProfile(profileRoot,target);if(!process.env.STUDY_TEST){app.relaunch();app.quit();}return true;});
if(!process.env.STUDY_TEST)globalShortcut.register('Control+Alt+N',()=>{showMain();main?.webContents.send('quick-add');});
syncPet();timer=setInterval(heartbeat,15000);
}).catch(e=>{dialog.showErrorBox('启动失败',e.stack||e.message);app.quit();});}
app.on('before-quit',()=>{quitting=true;globalShortcut.unregisterAll();petWalker.close();clearInterval(timer);if(store){try{if(state){save(snapshot(state));store.backup(state,`exit-${dateKey(Date.now())}`);}}finally{store.close();store=null;}}});app.on('window-all-closed',()=>{});
