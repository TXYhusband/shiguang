const {createState}=require('./legacy-fixture.cjs');
const {_electron:electron}=require('playwright');
const assert=require('node:assert/strict');
const path=require('node:path');
const fs=require('node:fs');

const {calendarDay}=require('../electron/mentor-view.mjs');
const {Store}=require('../electron/store.cjs');
const root=path.resolve(__dirname,'..');
const dir=path.join(root,'.cache','mentor-desktop-'+Date.now());
fs.mkdirSync(dir,{recursive:true});
fs.mkdirSync(path.join(root,'test-results'),{recursive:true});
const ago=days=>{const date=new Date();date.setDate(date.getDate()-days);return calendarDay(date.getTime())};
const initial=createState(new Date(ago(5)+'T12:00:00').getTime());
initial.countdowns=[{id:'exam',title:'毕业答辩',date:'2027-06-01',remindDays:7,reminder:true},{id:'paper',title:'论文投稿',date:'2027-05-01',remindDays:7,reminder:true}];
let store=new Store(dir);store.save(initial);store.close();
async function launch(){return electron.launch({...(process.env.STUDY_PACKAGED?{executablePath:path.join(root,'release/win-unpacked/StudyCompanion.exe'),args:[]}:{args:[root]}),env:{...process.env,STUDY_DATA_DIR:dir,STUDY_TEST:'1'},timeout:60000})}
async function mainPage(app){for(let i=0;i<100;i++){const page=app.windows().find(w=>w.url().includes('index.html')&&!w.url().endsWith('#pet'));if(page)return page;await new Promise(r=>setTimeout(r,100))}throw Error('main page missing')}
(async()=>{let app;try{
  app=await launch();let page=await mainPage(app);const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.waitForSelector('.mentor-banner');
  assert.ok((await page.locator('.mentor-banner').innerText()).includes('尚未记录汇报'));
  await page.screenshot({path:path.join(root,'test-results/mentor-home-urgent.png'),fullPage:true});
  const pet=app.windows().find(w=>w.url().endsWith('#pet'));await pet.waitForSelector('.pet-mentor');
  const fits=await pet.evaluate(()=>{const box=document.querySelector('.pet').getBoundingClientRect();return [...document.querySelectorAll('.pet-countdown-row')].every(el=>el.getBoundingClientRect().bottom<=box.bottom)});
  assert.equal(fits,true,'both pet countdowns remain visible');
  await pet.screenshot({path:path.join(root,'test-results/mentor-pet.png')});
  await page.getByRole('button',{name:'导师汇报',exact:true}).click();await page.waitForSelector('.mentor-cycle');
  async function record(days,note){await page.getByRole('button',{name:'记录 / 补记汇报',exact:true}).click();await page.locator('.modal input[name=date]').fill(ago(days));await page.locator('.modal textarea[name=note]').fill(note);await page.getByRole('button',{name:'保存汇报记录',exact:true}).click();await page.waitForSelector('.modal',{state:'hidden'})}
  await record(4,'已跑通 baseline');await page.waitForSelector('.mentor-cycle');
  await record(3,'整理了新的实验结果');await page.waitForSelector('.mentor-cycle');
  await page.screenshot({path:path.join(root,'test-results/mentor-day3.png'),fullPage:true});
  await page.getByRole('button',{name:'今天已汇报',exact:true}).click();await page.waitForSelector('.mentor-cycle');
  let state=await page.evaluate(()=>window.study.getState());assert.equal(state.mentor.reports[0].date,ago(0));assert.equal(state.mentor.reports.length,3);assert.equal(state.active,null);
  await page.getByRole('button',{name:`删除汇报：${ago(0)}`,exact:true}).click();await page.getByRole('button',{name:'取消',exact:true}).click();assert.equal((await page.evaluate(()=>window.study.getState())).mentor.reports.length,3);
  await page.getByRole('button',{name:`删除汇报：${ago(0)}`,exact:true}).click();await page.getByRole('button',{name:'确认删除汇报',exact:true}).click();await page.waitForSelector('.mentor-cycle');
  assert.equal(await page.getByRole('checkbox',{name:'启用桌面通知',exact:true}).count(),0);await page.waitForFunction(async()=>!(await window.study.getState()).mentor.reminder);
  await page.screenshot({path:path.join(root,'test-results/mentor-history.png'),fullPage:true});
  await page.getByRole('button',{name:'今日待办',exact:true}).click();await page.getByRole('button',{name:'今天已汇报',exact:true}).click();await page.waitForSelector('.mentor-banner');
  await page.setViewportSize({width:940,height:690});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await page.screenshot({path:path.join(root,'test-results/mentor-small.png'),fullPage:true});
  await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await page.locator('.chii-sticker').first().evaluate(el=>getComputedStyle(el).animationName),'none');
  assert.deepEqual(errors,[]);
  await app.close();app=await launch();page=await mainPage(app);await page.waitForSelector('.mentor-banner');
  state=await page.evaluate(()=>window.study.getState());assert.equal(state.mentor.reminder,false);assert.equal(state.mentor.reports.length,3);assert.equal(state.mentor.reports[0].date,ago(0));
  console.log('PASS: neutral elapsed days, one-click report, notes, backfill, undo confirmation, no mentor notifications, restart persistence, pet layout and reduced motion');
}finally{if(app)await app.close()}})().catch(e=>{console.error(e);process.exitCode=1});
