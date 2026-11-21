'use strict';
(() => {
  const {questions, routes, guide} = scienceContent;
  const byId = id => document.getElementById(id);
  const qById = new Map(questions.map(q => [q.id, q]));
  const rById = new Map(routes.map(r => [r.id, r]));
  const storeKey = 'gabri.science.geology.v1';
  const fail = 'Mistakes help you learn. Think again, use a hint and try once more!';
  const improved = 'Great progress! Your practice is paying off.';
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char =>
    ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const button = (id, label, primary=false) =>
    '<button type="button" id="'+id+'" class="'+(primary?'primary':'secondary')+'">'+label+'</button>';
  const on = (id, action) => byId(id)?.addEventListener('click', action);
  const initial = {record:{}, drafts:{}, reflections:{}, lastRoute:routes[0].id, mock:null};
  let state = {...initial};
  try {
    const data = JSON.parse(localStorage.getItem(storeKey) || '{}');
    state = {...initial, ...data};
    for (const key of ['record','drafts','reflections']) {
      if (!state[key] || typeof state[key] !== 'object' || Array.isArray(state[key])) state[key]={};
    }
  } catch { /* A fresh session also works without browser storage. */ }
  let canSave = true;
  function save() {
    try { localStorage.setItem(storeKey, JSON.stringify(state)); }
    catch { canSave=false; byId('save-note').textContent='This browser can keep your work only until you close the page. You can also use the printable workbook.'; }
  }
  const shuffled = items => {
    const out=[...items];
    for(let i=out.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[out[i],out[j]]=[out[j],out[i]];}
    return out;
  };
  const dateKey = () => { const d=new Date(); return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-'); };
  function focusFresh(id) { const h=byId(id); if(h){h.setAttribute('tabindex','-1');h.focus({preventScroll:true});} }
  function guideNotes() {
    byId('guide-notes').innerHTML=guide.map(g=>'<details class="note"><summary>'+escape(g.hook)+'<small>'+escape(g.name)+'</small></summary><dl>'+g.notes.map(([term,def])=>'<dt>'+escape(term)+'</dt><dd>'+escape(def)+'</dd>').join('')+'</dl></details>').join('');
  }
  function choiceList(q, group, selected=null) {
    return '<div class="choices">'+q.choices.map((text,i)=>'<label class="choice"><input type="radio" name="'+group+'" value="'+i+'" '+(selected===i?'checked':'')+'><span>'+escape(text)+'</span></label>').join('')+'</div>';
  }
  const checkedValue = name => { const el=document.querySelector('input[name="'+name+'"]:checked'); return el ? Number(el.value) : null; };
  const statusBox = id => '<div class="message" id="'+id+'" role="status" aria-live="polite"></div>';

  let practice=null;
  function practiceMenu() {
    const review = questions.filter(q=>state.record[q.id]?.review);
    const independent = questions.filter(q=>state.record[q.id]?.independent).length;
    byId('practice-app').innerHTML='<p>Choose a topic. Take your time and name the clue behind your answer.</p><div class="card"><h3>Choose a set</h3><div class="links">'+guide.map(g=>'<button type="button" data-topic="'+escape(g.name)+'">'+escape(g.name)+' <span>'+questions.filter(q=>q.area===g.name).length+' questions</span></button>').join('')+'</div><div class="actions">'+button('p-review','Revisit my questions ('+review.length+')')+'</div><p class="quiet">Your review set keeps questions you missed or used a hint for. A fresh answer without help clears the question.</p></div><p class="quiet" style="margin-top:12px">Answered on your own at least once: '+independent+' of '+questions.length+'.</p>';
    byId('practice-app').querySelectorAll('[data-topic]').forEach(b=>b.onclick=()=>startPractice(questions.filter(q=>q.area===b.dataset.topic)));
    byId('p-review').disabled=!review.length; on('p-review',()=>startPractice(review));
  }
  function startPractice(list) {
    if(!list.length)return;
    practice={list:list.map(q=>q.id),pos:0, tries:0,hint:false,done:false,feedback:'',selected:null};
    renderPractice(); focusFresh('p-title');
  }
  function renderPractice() {
    if(!practice){practiceMenu();return;}
    const p=practice;
    if(p.pos>=p.list.length){
      byId('practice-app').innerHTML='<div class="card"><h3 id="p-title">Pause and explain</h3><p>Choose one answer from this set. What clue helped you decide?</p><div class="actions">'+button('p-back','Choose a set',true)+'<a class="button" href="#challenge">Write my reflection</a></div></div>';
      on('p-back',()=>{practice=null;practiceMenu();});return;
    }
    const q=qById.get(p.list[p.pos]);
    byId('practice-app').innerHTML='<div class="card"><p class="progress-line">'+escape(q.area)+' · '+(p.pos+1)+' of '+p.list.length+'</p><fieldset id="p-field"><legend id="p-title" class="question-title">'+escape(q.prompt)+'</legend>'+choiceList(q,'practice-choice',p.selected)+'</fieldset><div class="actions">'+(p.done?button('p-next','Continue',true):button('p-check','Check my answer',true)+button('p-hint','Use a hint')+button('p-later','Keep for later'))+'</div><div class="hint" id="p-clue">'+(p.hint?escape(q.hint):'')+'</div>'+statusBox('p-status')+'</div><div class="actions">'+button('p-menu','Choose another set')+'</div>';
    byId('p-status').textContent=p.feedback;
    byId('p-field').disabled=p.done;
    if(!p.done){
      byId('p-hint').disabled=p.tries===0 || p.hint;
      on('p-hint',()=>{p.hint=true;byId('p-clue').textContent=q.hint;byId('p-hint').disabled=true;});
      on('p-check',()=>checkPractice(q));
      on('p-later',()=>{const rec=state.record[q.id]||{};rec.review=true;state.record[q.id]=rec;save();nextPractice();});
    }
    on('p-next',nextPractice);on('p-menu',()=>{practice=null;practiceMenu();});
  }
  function checkPractice(q) {
    const p=practice, selected=checkedValue('practice-choice');
    if(selected===null){byId('p-status').textContent='Choose an answer after reading the clue in the question.';return;}
    p.selected=selected;p.tries++;
    const rec=state.record[q.id]||{};
    if(selected!==q.answer){
      p.feedback=fail;rec.review=true;rec.missed=true;
      byId('p-status').textContent=fail;byId('p-hint').disabled=p.hint;
    }else{
      const first=p.tries===1 && !p.hint;
      const prior=rec.review;
      if(first)rec.independent=true;
      rec.review=!first;
      const praise=first?(prior?improved+' You answered a review question without a hint.':'You chose the answer independently.'):(improved+' You went back to your answer and corrected it.');
      p.done=true;p.feedback=praise+' '+q.why;renderPractice();
    }
    state.record[q.id]=rec;save();
  }
  function nextPractice(){
    Object.assign(practice,{pos:practice.pos+1,tries:0,hint:false,done:false,feedback:'',selected:null});
    renderPractice();focusFresh('p-title');
  }

  let routeId=rById.has(state.lastRoute)?state.lastRoute:routes[0].id;
  let writeMode='write', exercise=null;
  function draftFor(id){
    state.drafts[id]??={text:'',first:'',last:'',checked:[],model:false,usedSupport:false};
    return state.drafts[id];
  }
  const routeName = r => r.start+' → '+r.end;
  function initLab(){
    byId('route').innerHTML=routes.map(r=>'<option value="'+r.id+'">'+escape(routeName(r))+'</option>').join('');
    byId('route').value=routeId;
    byId('route').onchange=e=>{routeId=e.target.value;state.lastRoute=routeId;exercise=null;save();renderLab();};
    byId('write-modes').querySelectorAll('button').forEach(b=>b.onclick=()=>{
      writeMode=b.dataset.mode;exercise=null;
      renderLab();
    });
  }
  function checkList(r, picks){
    return '<fieldset><legend class="question-title">Check the science in your own answer</legend>'+r.checks.map((t,i)=>'<label class="check"><input type="checkbox" value="'+i+'" '+(picks.includes(i)?'checked':'')+'><span>'+escape(t)+'</span></label>').join('')+'</fieldset>';
  }
  function renderLab(){
    const r=rById.get(routeId), d=draftFor(routeId);
    byId('write-modes').querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===writeMode)));
    if(writeMode!=='write'){renderSupport(r);return;}
    const reviewed=Boolean(d.first);
    byId('writing-app').innerHTML='<div class="card"><h3>'+escape(r.challenge)+'</h3><label class="block-label" for="rock-text">My explanation in English</label><textarea id="rock-text" rows="4" placeholder="Start with the rock. Tell its story in your own words."></textarea><div class="actions">'+button('w-review',reviewed?'Save my revision':'Review my first attempt',true)+button('w-hint','Think with a hint')+'</div><div id="w-clue" class="hint" role="status"></div>'+statusBox('w-status')+'</div><div id="w-compare"></div>';
    byId('rock-text').value=d.text;
    byId('rock-text').oninput=e=>{d.text=e.target.value;save();};
    on('w-hint',()=>{if(!d.text.trim()){byId('w-clue').textContent='Try a few words first. Which rock do you start with?';return;}d.usedSupport=true;save();byId('w-clue').textContent=r.hint;});
    on('w-review',()=>{
      const answer=d.text.trim();
      if(answer.split(/\s+/).length<3){byId('w-status').textContent='Write a sentence of your own first. What changes the starting rock?';byId('rock-text').focus();return;}
      let msg;
      if(!d.first){d.first=answer;d.last=answer;msg=d.usedSupport?'You used support and wrote your own explanation. Now check each stage.':'You wrote your first explanation independently. Now check each stage.';}
      else if(answer!==d.last){d.last=answer;msg='You revised your explanation. Read the changed sentence aloud and check the science again.';d.checked=[];}
      else {msg='Your draft is saved. Choose a stage below and check that your sentence explains it.';}
      save();renderLab();byId('w-status').textContent=msg;
    });
    if(reviewed){
      const div=byId('w-compare');
      div.innerHTML='<div class="card">'+checkList(r,d.checked)+'<p id="w-self" class="quiet" role="status"></p><div class="actions">'+button('w-model',d.model?'Hide model answer':'Compare with a model answer')+'</div><div id="w-modeltext"></div><details class="note"><summary>Read my first draft</summary><p id="first-draft"></p></details></div>';
      byId('first-draft').textContent=d.first;
      const self=()=>{byId('w-self').textContent=d.checked.length===r.checks.length?'You checked every stage yourself. Could you explain the route with the model closed?':'Tick only the stages you can point to in your own writing.';};
      self();
      div.querySelectorAll('input[type=checkbox]').forEach(box=>box.onchange=()=>{d.checked=Array.from(div.querySelectorAll('input:checked'),x=>Number(x.value));save();self();});
      const model=()=>{byId('w-modeltext').innerHTML=d.model?'<div class="model"><strong>One possible explanation</strong><p>'+escape(r.model)+'</p><p class="quiet">Find one idea you explained differently. Then close the model and revise your own sentence.</p></div>':'';byId('w-model').textContent=d.model?'Hide model answer':'Compare with a model answer';byId('w-model').setAttribute('aria-expanded',String(d.model));};
      model();on('w-model',()=>{d.model=!d.model;if(d.model)d.usedSupport=true;save();model();});
    }
  }
  function renderSupport(r){
    const draft=draftFor(r.id);
    if(!draft.usedSupport){draft.usedSupport=true;save();}
    const build=writeMode==='build';
    const key=r.id+writeMode;
    if(!exercise || exercise.key!==key){
      const words=build?r.steps:[...r.words,'lava','wind'];
      exercise={key,options:shuffled([...new Set(words)]),attempts:0};
    }
    const items=build?r.steps:r.words;
    const opt='<option value="">Choose…</option>'+exercise.options.map(x=>'<option value="'+escape(x)+'">'+escape(x)+'</option>').join('');
    const labelFor=i=>(build?'Stage ':'Gap ')+(i+1);
    let gap=0;
    byId('writing-app').innerHTML='<div class="card"><p class="subhead">'+escape(routeName(r))+'</p><h3>'+(build?'Put the stages in order':'Fill the two gaps')+'</h3><p>'+(build?'Build the journey from the starting rock to the final rock.':escape(r.cloze).replace(/\[ \]/g,()=>'<strong>('+ ++gap +')</strong>'))+'</p>'+items.map((_,i)=>'<div class="select-row"><label for="step-'+i+'">'+labelFor(i)+'</label><select id="step-'+i+'">'+opt+'</select></div>').join('')+'<div class="actions">'+button('w-check','Check my work',true)+button('s-hint','Use a hint')+'</div><div class="hint" id="s-clue" role="status"></div>'+statusBox('s-status')+'</div>';
    byId('s-hint').disabled=true;
    on('s-hint',()=>{byId('s-clue').textContent=r.hint;byId('s-hint').disabled=true;});
    on('w-check',()=>{
      const selections=items.map((_,i)=>byId('step-'+i).value);
      if(selections.some(x=>!x)){byId('s-status').textContent='Choose an answer in each space first.';return;}
      exercise.attempts++;
      const i=items.findIndex((x,i)=>x!==selections[i]);
      if(i>=0){byId('s-status').textContent=fail+' Look again at '+labelFor(i).toLowerCase()+'.';byId('s-hint').disabled=false;return;}
      byId('s-status').textContent=(exercise.attempts>1?improved+' ':'')+(build?'You ordered the changes from start to finish.':'You chose the two science words that complete the explanation.')+' Now tell the journey in your own words.';
      byId('w-check').disabled=true;byId('s-hint').disabled=true;items.forEach((_,i)=>byId('step-'+i).disabled=true);
      const proceed=document.createElement('button');proceed.type='button';proceed.textContent='Write it myself';proceed.onclick=()=>{writeMode='write';exercise=null;renderLab();byId('rock-text').focus();};byId('s-status').after(proceed);
    });
  }

  function newMock() {
    const ids=guide.map(g=>shuffled(questions.filter(q=>q.area===g.name))[0].id);
    const others=routes.filter(r=>r.id!==state.mock?.route);
    state.mock={ids, route:shuffled(others)[0].id, answers:{},text:'',pos:0,finished:false,self:[]};
    save();renderMock();focusFresh('m-title');
  }
  function validMock(m){
    return m && Array.isArray(m.ids) && m.ids.length===4 && m.ids.every(x=>qById.has(x)) && rById.has(m.route) && Number.isInteger(m.pos) && m.pos>=0 && m.pos<=4 && m.answers && typeof m.answers==='object' && typeof m.text==='string' && Array.isArray(m.self);
  }
  function renderMock() {
    const app=byId('mock-app'), m=state.mock;
    if(!validMock(m)){
      app.innerHTML='<div class="card"><h3>Try it on your own</h3><p>Answer four questions and write one rock journey in English. You can go back and change your answers. The explanations appear when you finish.</p><div class="actions">'+button('m-start','Start mock exam',true)+'</div></div>';on('m-start',newMock);return;
    }
    if(m.finished){mockResults(m);return;}
    const writing=m.pos===4, q=writing?null:qById.get(m.ids[m.pos]), r=rById.get(m.route);
    app.innerHTML='<div class="card"><p class="progress-line">Mock exam · '+(m.pos+1)+' of 5</p>'+(writing?'<h3 id="m-title">'+escape(r.challenge)+'</h3><label for="m-text" class="block-label">Explain the changes in English.</label><textarea id="m-text" rows="5"></textarea>':'<fieldset><legend id="m-title" class="question-title">'+escape(q.prompt)+'</legend>'+choiceList(q,'mock-choice',m.answers[q.id])+'</fieldset>')+'<div class="actions">'+(m.pos>0?button('m-prev','Go back'):'')+button('m-next',writing?'Finish and review':'Continue',true)+'</div>'+statusBox('m-status')+'</div>';
    if(writing){byId('m-text').value=m.text;byId('m-text').oninput=e=>{m.text=e.target.value;save();};}
    else {app.querySelectorAll('input').forEach(el=>el.onchange=()=>{m.answers[q.id]=Number(el.value);save();});}
    on('m-prev',()=>{m.pos--;save();renderMock();focusFresh('m-title');});
    on('m-next',()=>{
      if(!writing && !Number.isInteger(m.answers[q.id])){byId('m-status').textContent='Choose your answer first.';return;}
      if(writing && m.text.trim().split(/\s+/).length<3){byId('m-status').textContent='Write a sentence about the journey before you finish.';return;}
      if(writing){
        m.finished=true;
        m.ids.forEach(id=>{
          const qq=qById.get(id),rec=state.record[id]||{};
          if(m.answers[id]!==qq.answer){rec.review=true;rec.missed=true;}
          else {rec.independent=true;rec.review=false;}
          state.record[id]=rec;
        });
      }else m.pos++;
      save();renderMock();focusFresh('m-title');
    });
  }
  function mockResults(m){
    const r=rById.get(m.route), missed=m.ids.filter(id=>m.answers[id]!==qById.get(id).answer);
    const items=m.ids.map(id=>{
      const q=qById.get(id),correct=m.answers[id]===q.answer;
      return '<section class="entry"><strong>'+escape(q.prompt)+'</strong><p>Your answer: '+escape(q.choices[m.answers[id]])+'. '+(correct?'You worked this out independently.':'Revisit this idea. The answer is '+escape(q.choices[q.answer])+'.')+'</p><p class="quiet">'+escape(q.why)+'</p></section>';
    }).join('');
    byId('mock-app').innerHTML='<div class="result-box"><h3 id="m-title">What you can explain today</h3><p>Your score shows what you know today. Keep practising to improve tomorrow.</p><p><strong>'+(4-missed.length)+' of 4</strong> independent short answers. Review your writing separately below.</p></div><div class="card"><h3>My written explanation</h3><p>'+escape(r.challenge)+'</p><p class="model" id="m-original"></p>'+checkList(r,m.self)+'<details class="note"><summary>Compare with one possible explanation</summary><p>'+escape(r.model)+'</p></details><p id="m-self-status" class="quiet" role="status"></p></div><details class="note"><summary>Review the four short answers</summary>'+items+'</details><div class="actions">'+(missed.length?button('m-missed','Practise my missed questions'):'')+'<a href="#challenge" class="button">My learning challenge</a>'+button('m-new','Try a new mock exam')+'</div>';
    byId('m-original').textContent=m.text;
    const boxes=byId('mock-app').querySelectorAll('input[type=checkbox]');
    const selfNote=()=>byId('m-self-status').textContent=m.self.length===r.checks.length?'You reviewed all three parts of your explanation. What will you practise next?':'Point to the words in your own draft before you tick each statement.';
    selfNote();boxes.forEach(b=>b.onchange=()=>{m.self=Array.from(boxes).filter(x=>x.checked).map(x=>Number(x.value));save();selfNote();});
    on('m-missed',()=>{startPractice(missed.map(id=>qById.get(id)));location.hash='practice';});on('m-new',newMock);
  }

  function reflections(){
    const today=dateKey(), selector=byId('reflection-day');
    const days=[...new Set([today,...Object.keys(state.reflections)])].sort().reverse();
    selector.innerHTML=days.map(k=>'<option value="'+escape(k)+'">'+escape(k)+(k===today?' · Today':'')+'</option>').join('');
    selector.value=today;
    const show=()=>{
      const entry=state.reflections[selector.value]||{};
      ['learned','difficult','tomorrow'].forEach(k=>{
        const field=byId(k);field.value=entry[k]||'';
        field.oninput=()=>{state.reflections[selector.value]??={};state.reflections[selector.value][k]=field.value;save();byId('reflection-status').textContent=canSave?'Saved in this browser.':'Kept for this session.';};
      });
      byId('reflection-status').textContent=Object.values(entry).some(Boolean)?'Your reflection for this day.':'Write a few words in any language to get started.';
    };
    selector.onchange=show;show();
  }
  const sectionNames=['start','guide','practice','write','mock','challenge'];
  function showPage(scroll=false){
    const hash=location.hash.slice(1), name=sectionNames.includes(hash)?hash:'start';
    sectionNames.forEach(n=>byId(n).hidden=n!==name);
    byId('nav').querySelectorAll('a').forEach(a=>{
      if(a.hash==='#'+name)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');
    });
    if(name==='practice')renderPractice(); if(name==='write')renderLab(); if(name==='mock')renderMock(); if(name==='challenge')reflections();
    if(scroll){focusFresh(name+'-title');window.scrollTo({top:0,behavior:'instant'});}
  }
  guideNotes();initLab();showPage();window.addEventListener('hashchange',()=>showPage(true));
})();
