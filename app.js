'use strict';
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
let toastTimer;
function toast(text){ $('#toast').textContent=text;$('#toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),3000); }
document.addEventListener('click',e=>{const figure=e.target.closest('[data-figure]');if(figure){$('#dialog-image').src=figure.dataset.figure;$('#dialog-image').alt=figure.querySelector('img')?.alt||'Paper figure';$('#figure-dialog').showModal();}const resource=e.target.closest('[data-resource]');if(resource)toast(`${resource.dataset.resource} will be released. The link is not available yet.`);});
$('#close-figure').addEventListener('click',()=>$('#figure-dialog').close());
$('#figure-dialog').addEventListener('click',e=>{if(e.target===$('#figure-dialog'))$('#figure-dialog').close();});

const esc=(text)=>String(text).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

// Coordinates align with the unchanged 1400 × 1319 RC paper illustration.
// The heading arrow shows the reference frame BEFORE each indicated turn.
const illustratedRoute=[
  {current:[374,762],next:[704,762],segment:'M 418 762 L 655 762',heading:'M 374 715 L 374 657'},
  {current:[704,762],next:[704,488],segment:'M 704 716 L 704 537',heading:'M 751 762 L 809 762'},
  {current:[704,488],next:[704,249],segment:'M 704 442 L 704 298',heading:'M 704 441 L 704 393'}
];
let illustratedStep=null;
function renderIllustratedRoute(){
  $$('[data-rc-illustration]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.rcIllustration)===illustratedStep)));
  $('#rc-route-active').setAttribute('visibility',illustratedStep===null?'hidden':'visible');
  if(illustratedStep!==null){
    const step=illustratedRoute[illustratedStep];
    for(const [id,point] of [['rc-current-position',step.current],['rc-next-position',step.next]]){
      const circle=document.getElementById(id);circle.setAttribute('cx',point[0]);circle.setAttribute('cy',point[1]);
    }
    $('#rc-active-segment').setAttribute('d',step.segment);
    $('#rc-current-heading').setAttribute('d',step.heading);
  }
}
$$('[data-rc-illustration]').forEach(b=>b.addEventListener('click',()=>{
  const step=Number(b.dataset.rcIllustration);
  illustratedStep=illustratedStep===step?null:step;
  renderIllustratedRoute();
}));
let resultView='spatial';
const spatialRows=[
  ['Qwen2.5-VL-7B',40.31,29.30,26.80,36.00,36.80,37.60,75.40],
  ['Qwen3-VL-8B',47.73,57.90,28.80,29.80,39.00,45.80,85.10],
  ['Cambrian-S-7B',47.28,67.50,25.80,39.60,40.90,33.00,76.90],
  ['VLM-3R-7B',45.40,60.90,27.90,40.00,40.50,31.30,71.80],
  ['VG-LLM-8B',51.05,62.20,30.00,36.10,45.80,50.50,81.70],
  ['GeoThinker-7B',60.43,68.50,31.70,83.60,41.90,54.80,82.10],
  ['GeoThinker-8B',62.23,72.60,30.90,83.00,45.90,55.90,85.10],
  ['DK-VLM-7B',60.84,69.42,29.95,83.81,44.98,57.47,79.38],
  ['DK-VLM-8B',64.09,74.33,30.79,83.83,51.25,59.81,84.52]
];
const rcResults=[['VSI · Route',51.21,60.31],['ReVSI · Route',43.48,47.67],['MMSI · Multi-Step',29.19,34.34],['ViewSpatial · Person',56.32,61.72]];
function renderResults(){
  const root=$('#result-panel');
  if(resultView==='spatial'){
    const headers=['Model','Avg.','VSI-Bench','MMSI-Bench','MindCube','ViewSpatial','SITE','CV-Bench'];
    const maxima=headers.map((_,i)=>i?Math.max(...spatialRows.map(r=>r[i])):0);
    root.innerHTML=`<div class="table-scroll" tabindex="0" aria-label="${'Six-benchmark comparison, scroll horizontally on small screens'}"><table class="results-table"><thead><tr>${headers.map((h,i)=>`<th scope="col">${i===0?'Model':h}</th>`).join('')}</tr></thead><tbody>${spatialRows.map(row=>`<tr class="${row[0].startsWith('DK-VLM')?'ours':''}">${row.map((v,i)=>i?`<td class="${v===maxima[i]?'best':''}">${v.toFixed(2)}</td>`:`<td>${v}</td>`).join('')}</tr>`).join('')}</tbody></table></div><div class="result-note"><p>${'<b>DK-VLM-8B ranks first on four of six benchmarks.</b> Avg. is the mean of the six overall scores; higher is better.'}</p></div>`;
  }else if(resultView==='rc'){
    root.innerHTML=`<div class="result-two-col"><div><h3 class="chart-heading">${'RC improves stepwise spatial reasoning'}</h3><div class="chart-legend"><span>${'Without RC'}</span><span>${'With RC'}</span></div>${rcResults.map(([name,a,b])=>`<div class="bar-row double"><span>${name}</span><div class="double-bars"><div class="bar-track"><div class="bar-fill without" style="--bar:${a}%"></div></div><div class="bar-track"><div class="bar-fill with" style="--bar:${b}%"></div></div></div><div class="bar-number-pair">${a.toFixed(2)}<br><b>${b.toFixed(2)}</b></div></div>`).join('')}<p class="chart-sub">${'Both variants retain DKA and pairwise geometric supervision.'}</p></div><div><h3 class="chart-heading">${'Geometric modeling components'}</h3><p class="chart-sub">${'Qwen3-VL-8B · VSI-Bench overall score'}</p>${[['Full DK-VLM',74.33],['w/o Point GTA',71.81],['w/o Camera GTA',72.46],['w/o both GTAs',70.02],['w/o pairwise loss',73.20]].map(([name,v],i)=>`<div class="bar-row"><span>${name}</span><div class="bar-track"><div class="bar-fill ${i===0?'ours':''}" style="--bar:${v}%"></div></div><strong>${v.toFixed(2)}</strong></div>`).join('')}</div></div><div class="result-divider"><h3 class="chart-heading">${'Generalization to unseen chain lengths'}</h3><div class="table-scroll compact-table"><table class="results-table"><thead><tr><th>${'Chain length'}</th><th>${'Without RC · Chain Acc.'}</th><th>${'With RC · Chain Acc.'}</th></tr></thead><tbody><tr><td>${'2 steps'}</td><td>2.2%</td><td class="best">45.6%</td></tr><tr><td>${'3 steps'}</td><td>0.3%</td><td class="best">37.5%</td></tr><tr class="ours"><td>${'4 steps · unseen during RC training'}</td><td>0.0%</td><td class="best">20.6%</td></tr></tbody></table></div></div>`;
  }else{
    root.innerHTML=`<div class="video-result-cards">${[['VideoMME','64.59','66.22','+1.63',false],['MVBench','68.42','67.93','−0.49',true]].map(([name,a,b,d,neutral])=>`<article class="video-result"><h3>${name}</h3><div class="video-metric-pair"><div><span>Qwen3-VL-8B + SFT</span><strong>${a}</strong></div><div class="dk"><span>DK-VLM-8B</span><strong>${b}</strong></div></div><span class="delta ${neutral?'neutral':''}">${d} ${'percentage points'}</span></article>`).join('')}</div><div class="result-note"><p>${'The SFT baseline is trained on the same data, including RC samples. DK-VLM retains comparable general video performance.'}</p></div>`;
  }
}
$$('[data-result]').forEach(button=>button.addEventListener('click',()=>{resultView=button.dataset.result;$$('[data-result]').forEach(b=>{b.setAttribute('aria-selected',String(b===button));b.tabIndex=b===button?0:-1;});$('#result-panel').setAttribute('aria-labelledby',button.id);renderResults();}));

const demo={scenes:[],kind:'vsi',index:{vsi:0,rc:0},question:0,step:0};
const currentScenes=()=>demo.scenes.filter(s=>s.kind===demo.kind);
const currentScene=()=>currentScenes()[demo.index[demo.kind]];
const currentQuestion=()=>currentScene()?.rows[demo.question];
const taskNames={route_planning:'Route planning',object_rel_direction_hard:'Relative direction',object_rel_distance:'Relative distance',object_counting:'Object counting',object_size_estimation:'Object size',obj_appearance_order:'Appearance order',object_abs_distance:'Absolute distance',rc_composition_action:'Turn actions',rc_composition_angle:'Clockwise angles'};
const taskName=row=>taskNames[row.type];
const actionNames={left:'Left',right:'Right',back:'Back',straight:'Straight'};
function renderSceneSelector(){
  const scenes=currentScenes();const root=$('#scene-selector');root.classList.toggle('rc-scenes',demo.kind==='rc');
  root.innerHTML=scenes.map((scene,index)=>`<button class="scene-button" aria-pressed="${index===demo.index[demo.kind]}" data-scene="${index}" aria-label="${'Select scene'} ${index+1}"><img src="${scene.poster}" width="60" height="46" loading="lazy" alt=""><span><b>${'Scene'} ${String(index+1).padStart(2,'0')}</b><small>${demo.kind==='rc'?`${scene.chain_length} ${'steps'}`:'2 spatial questions'}</small></span></button>`).join('');
  root.querySelectorAll('[data-scene]').forEach(button=>button.addEventListener('click',()=>{demo.index[demo.kind]=Number(button.dataset.scene);demo.question=0;demo.step=0;renderDemo(true);}));
}
function renderQuestionTabs(){
  const scene=currentScene();const root=$('#question-tabs');
  root.innerHTML=scene.rows.map((row,index)=>`<button role="tab" id="question-tab-${index}" aria-selected="${index===demo.question}" aria-controls="prediction-panel" tabindex="${index===demo.question?0:-1}" data-question="${index}">${taskName(row)}</button>`).join('');
  root.querySelectorAll('[data-question]').forEach(button=>button.addEventListener('click',()=>{demo.question=Number(button.dataset.question);demo.step=0;renderQuestionTabs();renderPrediction();document.getElementById(button.id)?.focus({preventScroll:true});}));
}
function rcQuestion(row){
  const r=row.route,angle=row.type==='rc_composition_angle';
  const noun=name=>`the ${name==='tv'?'TV':name}`;
  const sequence=new Intl.ListFormat('en',{style:'long',type:'conjunction'}).format(r.landmarks.map(noun));
  return `Start beside ${noun(r.start)}, facing ${noun(r.facing)}. Visit ${sequence}, in that order. ${angle?'How many degrees should you turn clockwise at each step?':'Which way should you turn at each step?'}`;
}
function renderPrediction(){
  const row=currentQuestion();if(!row)return;
  const root=$('#prediction-panel');root.setAttribute('aria-labelledby',`question-tab-${demo.question}`);
  if(demo.kind==='vsi'){
    const answer=row.answer_en,question=row.question_en,options=row.options_en;
    root.innerHTML=`<p class="question-kicker">QUESTION · ${row.source_id}</p><p class="demo-question">${esc(question)}</p>${options.length?`<div class="demo-options">${options.map(v=>`<div class="demo-option">${esc(v)}</div>`).join('')}</div>`:''}<div class="prediction-box"><div class="prediction-top"><span>DK-VLM PREDICTION</span><span class="match-mark">✓ Correct</span></div><div class="prediction-value">${esc(answer)}</div></div><div class="ground-truth"><span>Ground truth</span><b>${esc(answer)}</b></div>`;
  }else{
    const route=row.route;const angle=row.type==='rc_composition_angle';
    const landmarks=route.landmarks;
    const formatted=row.prediction.map(v=>angle?`${v}°`:actionNames[v]);
    const targets=angle?JSON.parse(row.answer_en):[];
    const errors=angle?row.prediction.map((value,i)=>{const delta=Math.abs(value-targets[i])%360;return Math.min(delta,360-delta);}):[];
    root.innerHTML=`<p class="question-kicker">QUESTION</p><div class="rc-question-block"><p class="demo-question">${esc(rcQuestion(row))}</p></div><div class="prediction-top"><span>DK-VLM · STEPWISE PREDICTIONS</span><span class="match-mark">${row.chain_length} steps</span></div><div class="rc-prediction-steps">${formatted.map((value,i)=>`<button class="rc-prediction-step ${i===demo.step?'active':''}" data-step="${i}" aria-pressed="${i===demo.step}" aria-label="Step ${i+1}: ${value}"><span class="step-index">${String(i+1).padStart(2,'0')}</span><span class="step-detail"><b>${esc(value)}</b><small>${angle?`Ground truth: ${targets[i]}°`:`Turn toward ${esc(landmarks[i])}`}</small></span>${angle?`<span class="angle-error">Error ${errors[i]}°</span>`:`<span class="step-match" aria-label="Matches ground truth">✓</span>`}</button>`).join('')}</div><div class="rc-output-array">${esc(JSON.stringify(row.prediction))}</div>${angle?`<p class="rc-angle-reference">Ground truth: ${esc(JSON.stringify(targets))}°</p>`:`<p class="rc-gt">✓ All step predictions match the ground truth.</p>`}`;
    root.querySelectorAll('[data-step]').forEach(b=>b.addEventListener('click',()=>{demo.step=Number(b.dataset.step);renderPrediction();root.querySelector(`[data-step="${demo.step}"]`)?.focus({preventScroll:true});}));
  }
}
function renderDemo(changeVideo=false){
  const scene=currentScene();if(!scene)return;
  $('#scene-source').textContent=demo.kind==='vsi'?'VSI-BENCH':`RC · ${scene.chain_length} STEPS`;
  $('#scene-counter').textContent=`${String(demo.index[demo.kind]+1).padStart(2,'0')} / ${String(currentScenes().length).padStart(2,'0')}`;
  $('#scene-name').textContent=scene.scene;
  if(changeVideo){const video=$('#demo-video');video.pause();video.poster=scene.poster;video.src=scene.video;video.load();video.playbackRate=Number($('#playback-rate').value);$('#video-error').hidden=true;}
  renderSceneSelector();renderQuestionTabs();renderPrediction();
}
$$('[data-demo]').forEach(button=>button.addEventListener('click',()=>{demo.kind=button.dataset.demo;demo.question=0;demo.step=0;$$('[data-demo]').forEach(b=>{b.setAttribute('aria-selected',String(b===button));b.tabIndex=b===button?0:-1;});$('#demo-panel').setAttribute('aria-labelledby',button.id);renderDemo(true);}));
$('#playback-rate').addEventListener('change',()=>{$('#demo-video').playbackRate=Number($('#playback-rate').value);});
$('#demo-video').addEventListener('error',()=>{$('#video-error').hidden=false;});
// Load only the selected clip. The other six clips stay unloaded until selected.
const videoObserver=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){$('#demo-video').preload='metadata';videoObserver.disconnect();}},{rootMargin:'250px'});
videoObserver.observe($('#demo-video'));
document.addEventListener('keydown',e=>{
  const tab=e.target.closest('[role="tab"]');if(!tab||!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;
  const siblings=[...tab.closest('[role="tablist"]').querySelectorAll('[role="tab"]')];const i=siblings.indexOf(tab);
  const next=e.key==='Home'?0:e.key==='End'?siblings.length-1:(i+(e.key==='ArrowRight'?1:-1)+siblings.length)%siblings.length;
  e.preventDefault();siblings[next].click();siblings[next].focus({preventScroll:true});
});
$('#copy-citation').addEventListener('click',async()=>{const text=$('#bibtex').textContent;try{await navigator.clipboard.writeText(text);toast('Citation copied.');}catch{const selection=window.getSelection();const range=document.createRange();range.selectNodeContents($('#bibtex'));selection.removeAllRanges();selection.addRange(range);toast('Citation selected. Press ⌘C / Ctrl+C to copy.');}});
const navObserver=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){$$('.site-nav nav a').forEach(a=>a.classList.toggle('active',a.hash===`#${entry.target.id}`));}}},{rootMargin:'-15% 0px -60% 0px'});
$$('#abstract,#method,#results,#demos').forEach(s=>navObserver.observe(s));
renderIllustratedRoute();
renderResults();
function showDemoData(data){demo.scenes=data.scenes;renderDemo(true);}
if(location.protocol==='file:'){
  showDemoData(window.DK_VLM_DEMO_DATA);
}else{
  fetch('site-data.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error('Could not load demo data');return r.json();}).catch(()=>window.DK_VLM_DEMO_DATA).then(showDemoData).catch(()=>{$('#prediction-panel').textContent='Demo data could not be loaded. Please reload the page.';});
}
