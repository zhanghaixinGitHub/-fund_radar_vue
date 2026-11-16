const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=__dirname;
const baseline=path.resolve(root,'../../mocks/interactive-baseline');
const pine=fs.readFileSync('D:/AppData-97956/Codex/Home/visualizations/2026/11/13/01a1d2be-c856-7d10-873e-5d829e11bcae/fund-radar-pine.html','utf8');
const raw=pine.match(/const metadata=([\s\S]*?);\r?\nconst fundTypes/)[1];
const menus=vm.runInNewContext('('+raw+')');
let runtime=fs.readFileSync(path.join(root,'interactive.js'),'utf8');
runtime=runtime.replace('/*PROTOTYPE_MENUS*/ null',JSON.stringify(menus));
new vm.Script(runtime);
fs.writeFileSync(path.join(root,'runtime.js'),runtime);
for(const variant of ['workbook','overview','research']){
  const html=fs.readFileSync(path.join(baseline,variant+'.html'),'utf8');
  const css=[...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m=>m[1]).join('\n');
  const body=/<body[^>]*>([\s\S]*?)<\/body>/i.exec(html)?.[1]||html.replace(/<style>[\s\S]*?<\/style>/g,'');
  const title={workbook:'持仓工作簿',overview:'资产总览',research:'基金研究台'}[variant];
  const output='<!doctype html>\n<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>基金雷达 · '+title+' · 可点击预览</title><style>'+css+'</style><link rel="stylesheet" href="interactive.css"><script src="runtime.js" defer></script></head><body data-scheme="'+variant+'">'+body+'</body></html>\n';
  fs.writeFileSync(path.join(root,variant+'.html'),output);
}
console.log(JSON.stringify({variants:3,syntax:'passed',businessApiCalls:/\bfetch\s*\(|XMLHttpRequest|WebSocket/.test(runtime)}));
