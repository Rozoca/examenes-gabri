'use strict';
(() => {
  const {chapters, lessons, reflections} = classBook;
  const {questions, routes, guide} = scienceContent;
  const routeMap = new Map(routes.map(r => [r.id, r]));
  const questionMap = new Map(questions.map(q => [q.id, q]));
  const sections = new Map(chapters.map(ch => [ch.id, ch]));
  const nodes = new Map();
  const mainPath = [];
  const bookKeys = {work:'gabri.science.geology.v1', walk:'gabri.science.geology.guided.v2'};
  const blank = {work:{record:{},drafts:{},reflections:{},mock:null},walk:{place:'',mainPlace:'',attempts:{},helpers:{},revisited:{}}};
  let storageOK = true;
  function readBook(kind, fallback = blank[kind]) {
    if (!storageOK) return fallback;
    try {
      const parsed = JSON.parse(localStorage.getItem(bookKeys[kind]) || 'null');
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return fallback;
      const result = {...blank[kind], ...parsed};
      const maps = kind === 'work' ? ['record','drafts','reflections'] : ['attempts','helpers','revisited'];
      for (const key of maps) if (!result[key] || typeof result[key] !== 'object' || Array.isArray(result[key])) result[key]={};
      return result;
    } catch { return fallback; }
  }
  const state = {work:readBook('work'), walk:readBook('walk')};
  const $ = id => document.getElementById(id);
  function update(kind, change) {
    const current = readBook(kind, state[kind]);
    change(current);
    state[kind] = current;
    try { localStorage.setItem(bookKeys[kind], JSON.stringify(current)); }
    catch { storageOK=false; $('storage-note').textContent='Este navegador conserva el trabajo solo mientras esta página esté abierta.'; }
  }
  const esc = text => String(text??'').replace(/[&<>"']/g,k=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[k]));
  const en = text => '<span lang="en">'+esc(text)+'</span>';
  const link = (key,label) => '<a href="#'+esc(key)+'">'+esc(label)+'</a>';
  const action = (key,label) => '<div class="actions"><a class="primary-link" href="#'+esc(key)+'">'+esc(label)+'</a></div>';
  const primary = (id,label) => '<div class="actions"><button type="button" class="primary" id="'+id+'">'+esc(label)+'</button></div>';
  const heading = (text, lang='en') => '<h1 id="heading" tabindex="-1" lang="'+lang+'">'+esc(text)+'</h1>';
  const today = () => {const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');};
  const randomItem = list => list[Math.floor(Math.random()*list.length)];
  const routeTitle = r => r.start+' → '+r.end;
  const dateLabel = d => /^\d{4}-\d{2}-\d{2}$/.test(d) ? d.split('-').reverse().join('/') : d;
  const mainRoutes = ['ig-sed','sed-ig'];
  const extras = routes.filter(r=>!mainRoutes.includes(r.id)).map(r=>r.id);
  const mistake = 'Mistakes help you learn. Think again, use a hint and try once more!';
  const progressMessage = 'Great progress! Your practice is paying off.';
  const motto = 'Practise to learn. Learn to improve. Be proud of your effort.';
  let place='', reviewSession=null;
  function group(items, chapter, core) {
    items.forEach((item,i)=>{
      const node={...item, chapter, pos:i+1, count:items.length, prev:items[i-1]?.id, next:items[i+1]?.id};
      nodes.set(node.id,node);
      if(core)mainPath.push(node.id);
    });
  }
  function addRoute(id,core){
    const route=classBook.routes[id];
    const steps=route.clues.map((clue,i)=>({...clue,id:id+'-'+(i+1),type:'choice',title:route.title,route:id}));
    steps.push({id:id+'-write',type:'write',route:id,title:route.title},{id:id+'-check',type:'check',route:id,title:route.title});
    group(steps,'1.3',core);
  }
  for(const ch of chapters){
    if(ch.id==='1.3')mainRoutes.forEach(id=>addRoute(id,true));
    else group(lessons.filter(l=>l.chapter===ch.id).map(l=>({...l,type:'choice'})),ch.id,true);
  }
  extras.forEach(id=>addRoute(id,false));
  group(reflections.map(r=>({...r,id:'reflect-'+r.id,type:'reflection',key:r.id})),'reflect',false);
  mainPath.push('mock',...reflections.map(r=>'reflect-'+r.id),'finish');
  const special=new Set(['cover','mock','finish','archive','review','routes']);
  const aliases={start:'cover',main:'cover',guide:'rocks',practice:'rocks',write:'ig-sed-1',challenge:'reflect-learned'};
  function validPlace(key) {
    return typeof key==='string' && (nodes.has(key)||special.has(key)||(key.startsWith('help-') && routeMap.has(key.slice(5))));
  }
  function resolveHash(){
    const raw=location.hash.slice(1);
    if(raw==='current')return place||'cover';
    const key=Object.prototype.hasOwnProperty.call(aliases,raw)?aliases[raw]:raw;
    return validPlace(key)?key:'cover';
  }
  function go(key){if(resolveHash()===key){render(false);return;} location.hash=key;}
  function remember(key){
    if(key==='cover'||key==='archive'||key==='routes'||key==='review')return;
    if(state.walk.place===key)return;
    update('walk',w=>{w.place=key;if(mainPath.includes(key))w.mainPlace=key;});
  }
  function onward(node){
    if(node.next)return node.next;
    const i=mainPath.indexOf(node.id);
    if(i>=0)return mainPath[i+1]||'finish';
    return validPlace(state.walk.mainPlace||'')?state.walk.mainPlace:'rocks';
  }
  function back(node){
    if(place==='cover')return null;
    if(place==='mock' && validMock(state.work.mock) && !state.work.mock.finished && state.work.mock.pos>0)return 'mock-back';
    if(place.startsWith('help-'))return place.slice(5)+'-write';
    if(node?.prev)return node.prev;
    const i=mainPath.indexOf(place);
    if(i>=0)return mainPath[i-1]||'cover';
    if(node?.route)return 'routes';
    return 'cover';
  }
  const introFor = key => {
    const n=nodes.get(key);
    if(n?.chapter==='reflect')return 'My Learning Challenge';
    if(n)return n.chapter+' '+sections.get(n.chapter).name;
    if(key.startsWith('help-'))return '1.3 Rock Cycle';
    return key==='mock'?'el simulacro':key==='finish'?'mi cierre':'mi cuaderno';
  };
  function setStatus(chapter,pos,count,custom){
    const ch=sections.get(chapter);
    const label=ch?'<b>'+esc(ch.id)+'</b> · '+en(ch.name):esc(custom||'');
    const stepLabel=(chapter==='1.3'?'Esta ruta · ':'')+'Paso '+pos+' de '+count;
    $('status-line').innerHTML=label?'<div class="progress"><span>'+label+'</span>'+(count?'<span>'+stepLabel+'</span>':'')+'</div>'+(count?'<progress value="'+pos+'" max="'+count+'" aria-label="'+stepLabel+'"></progress>':''):'';
  }
  function art(name){
    return name?'<div class="art '+name+'" role="img" aria-label="'+esc(classBook.art[name])+'"></div>':'';
  }
  function trail(id, full=false){
    const steps=classBook.routes[id].terms;
    const visible=full?steps:[steps[0],steps[steps.length-1]];
    return '<div class="route-line" lang="en" aria-label="'+esc(visible.join(' to '))+'">'+visible.map((v,i)=>(i?'<span aria-hidden="true">›</span>':'')+'<b>'+esc(v)+'</b>').join('')+'</div>';
  }
  function pageRef(ch){const s=sections.get(ch);return s?'<p class="panel-foot">Cuaderno del colegio · '+(s.pages.includes('–')?'págs. ':'pág. ')+s.pages+' del PDF</p>':'';}
  function pending(){
    return Object.keys(state.work.record).filter(k=>state.work.record[k]?.review && (questionMap.has(k) || nodes.get(k)?.type==='choice'));
  }
  function contents(){
    const p=pending().length;
    $('contents-links').innerHTML=chapters.map(c=>link(c.first,c.id+' '+c.name+' · '+c.es)).join('')+
      '<details><summary>Las seis transformaciones del 1.3</summary>'+routes.map(r=>link(r.id+'-1',routeTitle(r))).join('')+'</details>'+
      link('mock','Simulacro')+link('reflect-learned','My Learning Challenge')+(p?link('review','Repasar mis dudas ('+p+')'):'')+
      link('archive','Mis escritos y reflexiones')+
      '<details><summary>Consultar definiciones del tema</summary>'+guide.map(g=>'<details><summary>'+en(g.name)+'</summary>'+g.notes.map(([name,text])=>'<p lang="en"><strong>'+esc(name)+'</strong><br>'+esc(text)+'</p>').join('')+'</details>').join('')+'</details>'+
      '<a href="science/Science_Fieldbook.pdf">Cuaderno para imprimir (PDF)</a>';
  }
  function renderCover(){
    const saved=state.walk.place, resume=Boolean(saved&&validPlace(saved));
    $('current').innerHTML='<div class="cover"><p class="kicker">Science · Unit 1 · Geology</p>'+heading('Mi cuaderno de rocas','es')+
      '<p class="intro">'+(resume?'Tu marcapáginas está en <strong>'+esc(introFor(saved))+'</strong>.':'Empieza con el granito de tu cuaderno. Mira sus tres minerales.')+'</p>'+
      art('granite')+action(resume?saved:'rocks',resume?'Continuar donde lo dejé':'Empezar')+
      '<p class="fine">Puedes cerrar y volver a este paso en el mismo navegador.</p>'+
      '<p class="en-quote" lang="en">Your brain gets stronger when you practise. Ready to learn?</p></div>';
  }
  function renderChoice(item, review=false){
    const attempt=review?reviewSession.attempt:state.walk.attempts[item.id]||{};
    const complete=!!attempt.done, wasWrong=Number.isInteger(attempt.last)&&!complete;
    let text='';
    if(complete){
      let feedback=review?'You solved this review question without a hint.':'You worked it out on your own.';
      if(attempt.help)feedback='You used a hint to work this out.';
      if(attempt.attempts>1)feedback=progressMessage;
      text=feedback+' '+item.why;
    }else if(wasWrong)text=mistake;
    const target=review?'review':onward(item);
    const choiceButtons=item.choices.map((c,i)=>{
      const tone=complete&&i===item.answer?' chosen':wasWrong&&i===attempt.last?' bad':'';
      return '<button type="button" class="option'+tone+'" data-answer="'+i+'" '+(complete?'disabled':'')+' lang="en">'+esc(c)+'</button>';
    }).join('');
    $('current').innerHTML=heading(review?'Repaso de una duda':item.title,review?'es':'en')+
      (item.idea&&!review?'<p class="core-idea" lang="en">'+esc(item.idea)+'</p>':'')+
      (!review?art(item.art):'')+'<p class="task">Elige una respuesta.</p><fieldset><legend lang="en">'+esc(item.prompt)+'</legend><div class="options">'+choiceButtons+'</div></fieldset>'+
      '<p class="msg '+(!complete?'try':'')+'" role="status" id="feedback" lang="en">'+esc(text)+'</p>'+
      (!complete?'<details class="hint" id="clue" '+(attempt.open?'open':'')+'><summary>Ver una pista</summary><p '+(review&&questionMap.has(item.id)?'lang="en"':'')+'>'+esc(item.hint)+'</p></details>':'')+
      (complete?(review?primary('review-next','Continuar'):action(target,'Siguiente')+'<button type="button" class="quiet-link" id="retry-choice">Volver a practicar esta pregunta</button>'):'')+pageRef(item.chapter);
    $('current').querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>submitChoice(item,Number(b.dataset.answer),review));
    const hint=$('clue');
    if(hint)hint.ontoggle=()=>{
      if(!hint.open || !hint.isConnected)return;
      if(review)reviewSession.attempt.help=true;
      else update('walk',w=>{const a=w.attempts[item.id]||{};w.attempts[item.id]={...a,help:true};});
    };
    if(review&&complete)$('review-next').onclick=()=>{reviewSession.index++;reviewSession.attempt={};render(true);};
    if(complete&&!review)$('retry-choice').onclick=()=>{update('walk',w=>{delete w.attempts[item.id];});render(true);};
  }
  function submitChoice(item,selection,review){
    const last=review?reviewSession.attempt:state.walk.attempts[item.id]||{};
    if(last.done)return;
    const correct=selection===item.answer;
    const a={...last,last:selection,attempts:(last.attempts||0)+1,open:!!$('clue')?.open,done:correct};
    a.help=!!(last.help||a.open);
    const independent=correct&&a.attempts===1&&!a.help;
    if(review)reviewSession.attempt=a;
    else update('walk',w=>{w.attempts[item.id]=a;});
    update('work',w=>{
      const rec=w.record[item.id]||{};
      w.record[item.id]={...rec,review:!independent,missed:rec.missed||!correct,independent:!!(rec.independent||independent)};
    });
    renderChoice(item,review);contents();
    const msg=$('feedback');msg.tabIndex=-1;msg.focus({preventScroll:true});
  }
  function draft(id){
    return {text:'',first:'',last:'',checked:[],...(state.work.drafts[id]||{})};
  }
  function updateDraft(id, fn){
    update('work',w=>{
      w.drafts[id]??={text:'',first:'',last:'',checked:[],model:false,usedSupport:false};
      fn(w.drafts[id]);w.lastRoute=id;
    });
  }
  function hasText(text){return typeof text==='string' && text.trim().length>0;}
  function renderWriting(node){
    const id=node.route,r=classBook.routes[id],d=draft(id);
    const checking=node.type==='check';
    if(checking && !hasText(d.first)){location.replace('#'+id+'-write');return;}
    if(!checking){
      $('current').innerHTML=heading(r.title)+trail(id)+'<p class="task">Explica la transformación en inglés con tus palabras.</p>'+
        '<label class="ask" for="draft" lang="en">'+esc(r.task)+'</label><textarea id="draft" lang="en" rows="3"></textarea>'+
        '<details class="hint" id="write-help"><summary>Necesito una pista</summary>'+trail(id,true)+'<p>Puedes empezar así: '+en(r.starter)+'</p>'+link('help-'+id,'Ordenar las fases y completar una frase')+'</details>'+
        '<p class="msg" id="feedback" role="status"></p>'+primary('review-writing','Revisar mi explicación')+pageRef('1.3');
      const field=$('draft');field.value=d.text;
      field.oninput=()=>updateDraft(id,t=>{t.text=field.value;});
      $('write-help').ontoggle=e=>{if(e.target.open&&e.target.isConnected)updateDraft(id,t=>{t.usedSupport=true;});};
      $('review-writing').onclick=()=>{
        const answer=field.value.trim();
        if(!answer){$('feedback').textContent='Empieza por el nombre de la roca o abre la pista.';field.focus();return;}
        updateDraft(id,t=>{if(!t.first)t.first=answer;t.text=field.value;t.last=answer;});
        go(id+'-check');
      };
      return;
    }
    $('current').innerHTML=heading('Revisa una idea','es')+'<p class="core-idea">'+esc(r.focus)+'</p>'+
      '<label class="task" for="revision">Relee tu frase. Puedes cambiar una palabra o añadir un paso.</label><textarea id="revision" lang="en" rows="3"></textarea>'+
      '<details class="hint" id="model"><summary>Comparar con el ejemplo</summary><p class="model" lang="en">'+esc(routeMap.get(id).model)+'</p></details>'+
      '<p class="msg" id="feedback" role="status"></p>'+primary('finish-writing','Guardar y continuar')+pageRef('1.3');
    const field=$('revision');field.value=d.text;
    field.oninput=()=>{updateDraft(id,t=>{t.text=field.value;});$('feedback').textContent=field.value.trim()&&field.value.trim()!==d.first?'Has vuelto sobre tu primera explicación. Lee el cambio en voz alta.':'';};
    $('model').ontoggle=e=>{if(e.target.open&&e.target.isConnected)updateDraft(id,t=>{t.usedSupport=true;});};
    $('finish-writing').onclick=()=>{
      const answer=field.value.trim();
      if(!answer){$('feedback').textContent='Escribe una frase antes de continuar. Tu primer intento está en Mis escritos.';field.focus();return;}
      updateDraft(id,t=>{const revised=answer!==t.last;t.text=field.value;t.last=answer;if(revised)t.checked=[];});
      update('walk',w=>{w.revisited[id]=true;});go(onward(node));
    };
  }
  function helper(id){
    const r=routeMap.get(id), total=r.steps.length+2;
    const step=state.walk.helpers[id]||{i:0};
    const i=Number.isInteger(step.i)?Math.min(step.i,total):0;
    setStatus('1.3',Math.min(i+1,total),total);
    if(i===total){
      $('current').innerHTML=heading('Tu frase, ahora','es')+'<p>Ya has ordenado los pasos y completado las dos palabras. Prueba a contarlo a tu manera.</p>'+action(id+'-write','Volver a mi explicación')+'<button type="button" class="quiet-link" id="repeat-helper">Repetir los pasos</button>'+pageRef('1.3');
      $('repeat-helper').onclick=()=>{update('walk',w=>{delete w.helpers[id];});helper(id);focusHeading();};return;
    }
    const sorting=i<r.steps.length;
    const index=sorting?i:i-r.steps.length;
    const answer=sorting?r.steps[i]:r.words[index];
    const alternative={Sedimentary:'Magma cools into igneous rock.',Metamorphic:'The rock melts into magma.',Igneous:'Weathering breaks the rock into loose grains.'};
    const other=sorting?(r.steps[i+1]||alternative[r.end]):r.words[1-index];
    const opts=i%2===0?[other,answer]:[answer,other];
    const before=sorting&&i?'<p class="sub">Paso anterior: '+en(r.steps[i-1])+'</p>':'';
    let blank=0;
    const exercise=sorting?(i===0?'¿Qué ocurre primero?':'¿Qué ocurre ahora?'):r.cloze.replace(/\[ \]/g,()=>{const n=blank++;return n===index?'_____':n<index?r.words[n]:'[…]';});
    $('current').innerHTML=heading(classBook.routes[id].title)+before+'<p class="task">'+(sorting?'Ordena la ruta, un paso cada vez.':'Elige la palabra que completa el hueco.')+'</p><fieldset><legend '+(sorting?'':'lang="en"')+'>'+esc(exercise)+'</legend><div class="options">'+opts.map((s,n)=>'<button type="button" class="option" data-part="'+n+'" lang="en">'+esc(s)+'</button>').join('')+'</div></fieldset><p class="msg" id="feedback" role="status"></p><div id="helper-next"></div>'+pageRef('1.3');
    $('current').querySelectorAll('[data-part]').forEach(b=>b.onclick=()=>{
      if(opts[Number(b.dataset.part)]!==answer){$('feedback').textContent='Piensa en el material que tienes en este paso y vuelve a intentarlo.';return;}
      $('feedback').textContent=sorting?'Has colocado este paso en su sitio.':'La palabra encaja en esta frase.';
      $('current').querySelectorAll('[data-part]').forEach(o=>o.disabled=true);
      $('helper-next').innerHTML=primary('helper-next-button','Siguiente');
      $('helper-next-button').onclick=()=>{update('walk',w=>{w.helpers[id]={i:i+1};});helper(id);focusHeading();};
    });
  }
  function validMock(m){
    return m&&Array.isArray(m.ids)&&m.ids.length===4&&m.ids.every(id=>questionMap.has(id))&&routeMap.has(m.route)&&m.answers&&typeof m.answers==='object'&&Number.isInteger(m.pos)&&m.pos>=0&&m.pos<=4&&typeof m.text==='string';
  }
  function newMock(){
    const ids=guide.map(g=>randomItem(questions.filter(q=>q.area===g.name)).id);
    const previous=state.work.mock?.route;
    const pick=mainRoutes.includes(previous)?mainRoutes.find(id=>id!==previous):'ig-sed';
    update('work',w=>{w.mock={ids,route:pick,answers:{},text:'',pos:0,finished:false,self:[]};});render(true);
  }
  function renderMock(){
    const m=state.work.mock;
    if(!validMock(m)){
      setStatus(null,0,0,'Simulacro');
      $('current').innerHTML=heading('Prueba tú solo','es')+'<p>Cuatro preguntas cortas y una explicación escrita. Verás las soluciones al terminar.</p>'+primary('start-exam','Empezar simulacro');
      $('start-exam').onclick=newMock;return;
    }
    if(m.finished){renderResults(m);return;}
    setStatus(null,m.pos+1,5,'Simulacro');
    const writing=m.pos===4,q=questionMap.get(m.ids[m.pos]);
    $('current').innerHTML=heading(writing?'Una explicación escrita':'Elige una respuesta','es')+
      (writing?'<label for="mock-draft" class="ask" lang="en">'+esc(classBook.routes[m.route].task)+'</label><textarea id="mock-draft" lang="en" rows="4"></textarea>':
        '<fieldset><legend lang="en">'+esc(q.prompt)+'</legend><div class="options">'+q.choices.map((a,i)=>'<label class="option"><input name="mock-answer" type="radio" value="'+i+'" '+(m.answers[q.id]===i?'checked':'')+'> '+en(a)+'</label>').join('')+'</div></fieldset>')+
      '<p class="msg" id="feedback" role="status"></p>'+primary('next-exam',writing?'Terminar el simulacro':'Siguiente');
    if(writing){const field=$('mock-draft');field.value=m.text;field.oninput=()=>update('work',w=>{w.mock.text=field.value;});}
    else $('current').querySelectorAll('input').forEach(o=>o.onchange=()=>update('work',w=>{w.mock.answers[q.id]=Number(o.value);}));
    $('next-exam').onclick=()=>{
      const current=state.work.mock;
      if(writing?!hasText(current.text):!Number.isInteger(current.answers[q.id])){$('feedback').textContent=writing?'Escribe tu idea en una frase.':'Elige una opción primero.';return;}
      update('work',w=>{
        if(!writing){w.mock.pos++;return;}
        w.mock.finished=true;
        for(const id of w.mock.ids){const ok=w.mock.answers[id]===questionMap.get(id).answer;const rec=w.record[id]||{};w.record[id]={...rec,review:!ok,missed:!!(rec.missed||!ok),independent:!!(rec.independent||ok)};}
      });render(true);
    };
  }
  function renderResults(m){
    setStatus(null,0,0,'Simulacro');
    const score=m.ids.filter(id=>m.answers[id]===questionMap.get(id).answer).length;
    const r=routeMap.get(m.route);
    $('current').innerHTML=heading('Mi revisión','es')+'<p><strong>'+score+' de 4</strong> preguntas cortas.</p><p class="en-quote" lang="en">Your score shows what you know today. Keep practising to improve tomorrow.</p>'+
      '<details class="extra"><summary>Revisar mis respuestas cortas</summary>'+m.ids.map(id=>{const q=questionMap.get(id);return '<div class="review-line"><strong lang="en">'+esc(q.prompt)+'</strong><p>Mi respuesta: '+en(q.choices[m.answers[id]])+'</p><p lang="en">'+esc(q.why)+'</p></div>';}).join('')+'</details>'+
      '<details class="extra"><summary>Revisar mi explicación escrita</summary><p class="saved-text" lang="en">'+esc(m.text)+'</p><p>'+esc(classBook.routes[m.route].focus)+'</p><details class="hint"><summary>Ver el ejemplo</summary><p lang="en">'+esc(r.model)+'</p></details>'+r.checks.map((c,i)=>'<label class="check"><input type="checkbox" value="'+i+'" '+((m.self||[]).includes(i)?'checked':'')+'>'+en(c)+'</label>').join('')+'</details>'+
      action('reflect-learned','Ir a mi reflexión')+'<button class="quiet-link" id="new-exam" type="button">Practicar con otro simulacro</button>';
    $('new-exam').onclick=newMock;
    $('current').querySelectorAll('input[type=checkbox]').forEach(el=>el.onchange=()=>{const values=Array.from($('current').querySelectorAll('input:checked'),n=>Number(n.value));update('work',w=>{w.mock.self=values;});});
  }
  function renderReflection(node){
    const day=today();setStatus(null,node.pos,node.count,'MY LEARNING CHALLENGE');
    $('current').innerHTML=heading(node.question)+'<label for="note" class="block-label">'+esc(node.support)+'</label><textarea id="note" rows="2" placeholder="Puedes escribir unas palabras en español o en inglés."></textarea>'+action(onward(node),node.pos===3?'Terminar por hoy':'Siguiente');
    const field=$('note');field.value=state.work.reflections[day]?.[node.key]||'';
    field.oninput=()=>update('work',w=>{w.reflections[day]??={};w.reflections[day][node.key]=field.value;});
  }
  function renderFinish(){
    setStatus(null,0,0,'MY LEARNING CHALLENGE');
    const entry=state.work.reflections[today()]||{};
    const next=routes.find(r=>!state.walk.revisited[r.id])?.id||'ig-sed';
    $('current').innerHTML=heading('Por hoy, terminado','es')+(hasText(entry.tomorrow)?'<p>Mañana quieres practicar:</p><p class="core-idea saved-text">'+esc(entry.tomorrow)+'</p>':'<p>La próxima vez puedes elegir otra transformación.</p>')+
      '<p class="en-quote" lang="en">'+motto+'</p><p class="fine" lang="en">Success comes from learning, practising and never giving up.</p>'+action(next+'-1','Practicar otra transformación');
  }
  function renderArchive(){
    setStatus(null,0,0,'Mi cuaderno');
    const writings=routes.filter(r=>{const d=draft(r.id);return hasText(d.text)||hasText(d.first);});
    const days=Object.keys(state.work.reflections).filter(k=>Object.values(state.work.reflections[k]||{}).some(hasText)).sort().reverse();
    $('current').innerHTML=heading('Mis escritos y reflexiones','es')+(writings.length||days.length?'':'<p>Aquí aparecerán tus frases cuando empieces a escribir.</p>')+
      writings.map(r=>{const d=draft(r.id);return '<details class="extra"><summary>'+esc(routeTitle(r))+'</summary><p class="saved-text" lang="en">'+esc(d.text||d.first)+'</p>'+(d.first&&d.first!==d.text?'<p class="fine">Mi primer intento</p><p class="saved-text" lang="en">'+esc(d.first)+'</p>':'')+link(r.id+'-write','Seguir escribiendo')+'</details>';}).join('')+
      days.map(day=>'<details class="extra"><summary>'+esc(dateLabel(day))+'</summary>'+reflections.filter(r=>hasText(state.work.reflections[day][r.id])).map(r=>'<p><strong lang="en">'+esc(r.question)+'</strong></p><p class="saved-text">'+esc(state.work.reflections[day][r.id])+'</p>').join('')+'</details>').join('')+action('cover','Volver a mi cuaderno');
  }
  function renderReview(){
    const ids=pending();
    if(!reviewSession)reviewSession={ids,index:0,attempt:{}};
    const key=reviewSession.ids[reviewSession.index],item=nodes.get(key)||questionMap.get(key);
    if(!item){setStatus(null,0,0,'Repaso');$('current').innerHTML=heading('Has terminado este repaso','es')+'<p>Piensa en una pista que ahora puedas explicar con tus palabras.</p>'+action('cover','Volver a mi cuaderno');return;}
    setStatus(null,reviewSession.index+1,reviewSession.ids.length,'Repaso de dudas');renderChoice(item,true);
  }
  function focusHeading(){const h=$('heading');if(h){h.focus({preventScroll:true});window.scrollTo(0,0);}}
  function render(focus=true){
    const last=place;place=resolveHash();
    if(last!==place){if(place!=='review')reviewSession=null;$('contents').open=false;}
    state.work=readBook('work',state.work);state.walk=readBook('walk',state.walk);
    remember(place);contents();setStatus(null,0,0,'');
    const node=nodes.get(place);
    if(node&&sections.has(node.chapter))setStatus(node.chapter,node.pos,node.count);
    if(node?.type==='choice')renderChoice(node);
    else if(node?.type==='write'||node?.type==='check')renderWriting(node);
    else if(node?.type==='reflection')renderReflection(node);
    else if(place==='mock')renderMock();
    else if(place.startsWith('help-'))helper(place.slice(5));
    else if(place==='finish')renderFinish();
    else if(place==='archive')renderArchive();
    else if(place==='review')renderReview();
    else if(place==='routes'){
      setStatus(null,0,0,'1.3 · Rock Cycle');
      $('current').innerHTML=heading('Elige una transformación','es')+'<div class="route-list">'+routes.map(r=>link(r.id+'-1',routeTitle(r))).join('')+'</div>';
    }else renderCover();
    const prev=back(node),prevButton=$('previous');
    prevButton.hidden=!prev;prevButton.onclick=()=>{if(prev==='mock-back'){update('work',w=>w.mock.pos--);render(true);}else go(prev);};
    if(focus)focusHeading();
  }
  document.querySelector('.skip').onclick=e=>{e.preventDefault();$('current').focus();};
  $('contents-links').addEventListener('click',e=>{if(e.target.closest('a'))$('contents').open=false;});
  window.addEventListener('hashchange',()=>render());
  render(false);
})();
