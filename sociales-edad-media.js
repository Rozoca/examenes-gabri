(() => {
  'use strict';
  const D = window.SOCIALES_CONTENT;
  if (!D) return;
  const $ = id => document.getElementById(id);
  const esc = v => String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const KEY = 'gabri-sociales-edad-media-v1';
  const byId = Object.fromEntries(D.questions.map(q => [q.id, q]));
  const fresh = () => ({version:1, answers:{}, active:null, bestExam:null});
  const shuffle = values => {
    const a = [...values];
    for (let i=a.length-1;i>0;i--) { const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]; }
    return a;
  };
  let storageOK = true;
  let state = fresh();
  function validAnswer(a) { return a && typeof a.correct === 'boolean' && typeof a.hint === 'boolean' && (typeof a.response === 'string' || Array.isArray(a.response)); }
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    if (saved && saved.version === 1 && saved.answers && typeof saved.answers === 'object') {
      state.answers = Object.fromEntries(Object.entries(saved.answers).filter(([id,a]) => byId[id] && typeof a === 'boolean'));
      state.bestExam = Number.isInteger(saved.bestExam) && saved.bestExam >= 0 && saved.bestExam <= 20 ? saved.bestExam : null;
      const s = saved.active;
      if (s && ['mission','quick','exam','retry'].includes(s.mode) && Array.isArray(s.ids) && s.ids.length>0 && s.ids.length<=20 && s.ids.every(id=>byId[id]) && new Set(s.ids).size === s.ids.length && Number.isInteger(s.pos) && s.pos>=0 && s.pos<s.ids.length && s.responses && typeof s.responses === 'object' && Object.entries(s.responses).every(([id,a])=>s.ids.includes(id)&&validAnswer(a)) && s.ids.slice(0,s.pos).every(id=>s.responses[id])) {
        state.active = s;
      }
    }
  } catch (_) { storageOK = false; }
  let view = 'home';
  let draft = null;
  let hintUsed = false;
  let cardIndex = 0;
  let lastResult = null;
  let pendingAction = null;
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); }
    catch (_) { storageOK=false; }
    $('storageStatus').textContent = storageOK ? 'Guardado solo en este navegador. Puedes parar y continuar cuando quieras.' : 'Este navegador no permite guardar. Puedes jugar; al cerrar la página podrías perder el progreso.';
  }
  function screen(name) {
    view=name;
    ['home','play','result','card'].forEach(s=>$(`${s}Screen`).hidden=s!==name);
    if ('speechSynthesis' in window) speechSynthesis.cancel();
    window.scrollTo({top:0,behavior:'instant'});
  }
  function focus(id) { requestAnimationFrame(()=>$(id)?.focus({preventScroll:true})); }
  function currentQuestion() { const s=state.active;return s ? byId[s.ids[s.pos]] : null; }
  function correctText(q) {
    if (q.kind==='match') return q.pairs.map(([a,b])=>`${a}: ${b}`).join(' · ');
    if (q.kind==='order') return q.items.join(' → ');
    if (q.kind==='multi') return q.answers.join(' + ');
    return q.answer;
  }
  function makeDialog(title,text,action,label='Continuar') {
    $('dialogTitle').textContent=title;$('dialogText').textContent=text;$('acceptDialog').textContent=label;
    pendingAction=action;
    $('confirmDialog').showModal();document.body.classList.add('modal-open');$('cancelDialog').focus();
  }
  function closeDialog() { $('confirmDialog').close();document.body.classList.remove('modal-open');pendingAction=null; }
  $('cancelDialog').addEventListener('click',closeDialog);
  $('confirmDialog').addEventListener('cancel',()=>{document.body.classList.remove('modal-open');pendingAction=null;});
  $('acceptDialog').addEventListener('click',()=>{const action=pendingAction;closeDialog();action?.();});
  function start(mode,level) {
    const launch=()=>{
      let ids;
      if (mode==='mission') ids=D.questions.filter(q=>q.level===level).map(q=>q.id);
      else if (mode==='quick') ids=shuffle(D.levels.flatMap(l=>shuffle(D.questions.filter(q=>q.level===l.id)).slice(0,2).map(q=>q.id)));
      else if (mode==='retry') ids=shuffle(D.questions.filter(q=>state.answers[q.id]===false).map(q=>q.id));
      else ids=shuffle(D.questions.map(q=>q.id));
      if (!ids.length) return;
      state.active={mode,level:level||null,ids,pos:0,responses:{}};
      save();renderQuestion();
    };
    if (state.active) makeDialog('¿Empezar otra sesión?','Tu progreso por pregunta se mantiene. La sesión que has dejado a medias será sustituida.',launch,'Empezar otra sesión');
    else launch();
  }
  function updateHome() {
    const count=Object.values(state.answers).filter(Boolean).length;
    const done=D.levels.filter(l=>D.questions.filter(q=>q.level===l.id).every(q=>state.answers[q.id]===true));
    $('masteryCount').textContent=`${count} de 20`;$('masteryBar').value=count;$('keyCount').textContent=`${done.length} / 5 llaves`;
    $('missions').innerHTML=D.levels.map(l=>{
      const n=D.questions.filter(q=>q.level===l.id&&state.answers[q.id]===true).length;
      return `<article class="mission ${n===4?'done':''}" style="--accent:${l.color}"><div class="mission-number"><span>PUERTA ${l.icon}</span><span class="mission-key" aria-label="${n===4?'Llave conseguida':'Llave por conseguir'}">${n===4?'✓':'◇'}</span></div><h3>${esc(l.name)}</h3><p>${esc(l.topic)}</p><span class="small">${n} / 4 últimas respuestas correctas</span><button class="outline" data-mission="${l.id}">${n===4?'Repetir misión':'Jugar misión'} →</button></article>`;
    }).join('');
    const errors=D.questions.filter(q=>state.answers[q.id]===false).length;
    $('retry').disabled=errors===0;$('retry').textContent=errors?`Repasar ${errors} ${errors===1?'pregunta':'preguntas'}`:'Sin errores pendientes';
    $('resume').hidden=!state.active;
    $('startAdventure').textContent=count===0?'Conseguir la primera llave →':'Seguir consiguiendo llaves →';
    $('bestExam').textContent=state.bestExam===null?'':`Mejor simulacro: ${state.bestExam} / 20 correctas`;
    save();
  }
  $('missions').addEventListener('click',e=>{const b=e.target.closest('[data-mission]');if(b)start('mission',b.dataset.mission);});
  $('startAdventure').addEventListener('click',()=>{
    if(state.active){renderQuestion();return;}
    const l=D.levels.find(l=>D.questions.some(q=>q.level===l.id&&state.answers[q.id]!==true));
    start('mission',(l||D.levels[0]).id);
  });
  $('resume').addEventListener('click',()=>renderQuestion());
  $('quick').addEventListener('click',()=>start('quick'));
  $('exam').addEventListener('click',()=>start('exam'));
  $('retry').addEventListener('click',()=>start('retry'));
  $('pause').addEventListener('click',()=>{save();updateHome();screen('home');focus('startAdventure');});
  $('reset').addEventListener('click',()=>makeDialog('¿Borrar esta aventura?','Se borrarán las respuestas, las llaves y el mejor simulacro de esta aventura en este navegador.',()=>{state=fresh();save();updateHome();},'Borrar progreso'));

  $('lessons').innerHTML=D.levels.map(l=>`<details class="lesson"><summary><span>${l.icon}</span>${esc(l.topic)}</summary><div class="lesson-content">${l.facts.map(([h,p])=>`<article><h3>${esc(h)}</h3><p>${esc(p)}</p></article>`).join('')}<p class="lesson-source">${esc(l.pages)}. Resumen adaptado para repasar.</p></div></details>`).join('');
  function art(type) {
    const common='class="art-example" viewBox="0 0 140 136" role="img"';
    if(type==='romanico')return `<svg ${common} aria-label="Esquema de un arco de medio punto, de forma semicircular"><rect x="16" y="12" width="108" height="119" rx="5" fill="#8795bd"/><path d="M44 131V69a26 26 0 0 1 52 0v62Z" fill="#182144"/><path d="M44 69a26 26 0 0 1 52 0" fill="none" stroke="#ffc85c" stroke-width="4"/></svg>`;
    if(type==='gotico')return `<svg ${common} aria-label="Esquema de un arco apuntado que termina en punta"><path d="M27 131V69Q27 40 70 9Q113 40 113 69V131Z" fill="#8795bd"/><path d="M41 131V71Q41 49 70 27Q99 49 99 71V131Z" fill="#182144"/><path d="M41 71Q41 49 70 27Q99 49 99 71" fill="none" stroke="#ffc85c" stroke-width="4"/><path d="M70 28V131M42 84H98" stroke="#6fe0f2" stroke-width="2"/></svg>`;
    return `<svg ${common} aria-label="Esquema de un arco de herradura, cerrado hacia dentro en su parte baja"><rect x="15" y="10" width="110" height="121" rx="4" fill="#8795bd"/><path d="M45 131V92a37 37 0 1 1 50 0V131Z" fill="#182144"/><path d="M45 92a37 37 0 1 1 50 0" fill="none" stroke="#ffc85c" stroke-width="4"/></svg>`;
  }
  function renderQuestion() {
    const s=state.active;if(!s){updateHome();screen('home');return;}
    const q=currentQuestion(),l=D.levels.find(l=>l.id===q.level),a=s.responses[q.id];
    hintUsed=a?.hint||false;
    draft=q.kind==='multi'||q.kind==='order'?[]:q.kind==='match'?q.pairs.map(()=> ''):'';
    screen('play');
    $('modeLabel').textContent=s.mode==='exam'?'SIMULACRO · SOLUCIONES AL FINAL':s.mode==='quick'?'ENTRENAMIENTO RÁPIDO':s.mode==='retry'?'REPASO DE ERRORES':l.name;
    $('questionCount').textContent=`RETO ${s.pos+1} DE ${s.ids.length}`;$('sessionBar').max=s.ids.length;$('sessionBar').value=s.pos;
    const action=s.mode==='exam'?'Guardar respuesta':'Comprobar respuesta';
    const instruction=q.kind==='order'?'Pulsa las fichas en orden. Puedes deshacer.':q.kind==='match'?'Elige una respuesta en cada fila.':q.kind==='multi'?`Marca dos respuestas y pulsa «${action}».`:q.kind==='text'?'Una palabra. Las tildes y mayúsculas no cambian el resultado.':`Elige una respuesta y pulsa «${action}».`;
    $('questionStage').innerHTML=`<article class="qcard"><div class="qmeta"><span class="eyebrow">${esc(l.topic)}</span>${'speechSynthesis' in window?'<button class="text-button" id="speakQuestion" aria-label="Escuchar la pregunta">Escuchar pregunta</button>':''}</div><h2 id="questionTitle" tabindex="-1">${esc(q.prompt)}</h2>${q.visual?art(q.visual):''}<p class="instruction">${instruction}</p><div id="answerArea"></div><p id="validation" class="status-message" role="status" hidden></p><div id="feedback" hidden aria-live="polite"></div><div id="hintText" class="hint" hidden></div><div class="qactions"><button class="outline compact" id="showHint" ${s.mode==='exam'?'hidden':''}>Necesito una pista</button><button class="primary" id="check">${s.mode==='exam'?'Guardar respuesta':'Comprobar respuesta'}</button><button class="primary" id="next" hidden>Siguiente reto →</button></div></article>`;
    $('speakQuestion')?.addEventListener('click',()=>{speechSynthesis.cancel();const msg=new SpeechSynthesisUtterance(q.prompt);msg.lang='es-ES';msg.rate=.9;speechSynthesis.speak(msg);});
    const area=$('answerArea');
    if(q.kind==='choice'||q.kind==='multi'){
      area.className='options';area.innerHTML=shuffle(q.options).map((o,i)=>`<button class="option" data-option="${esc(o)}" aria-pressed="false"><span class="option-mark">${q.kind==='multi'?'□':String.fromCharCode(65+i)}</span><span>${esc(o)}</span></button>`).join('');
      area.addEventListener('click',e=>{const b=e.target.closest('[data-option]');if(!b||b.disabled)return;const v=b.dataset.option;
        if(q.kind==='choice')draft=v;
        else draft=draft.includes(v)?draft.filter(x=>x!==v):[...draft,v];
        [...area.children].forEach(n=>{const selected=q.kind==='choice'?draft===n.dataset.option:draft.includes(n.dataset.option);n.classList.toggle('chosen',selected);n.setAttribute('aria-pressed',selected);});
      });
    } else if(q.kind==='text'){
      area.innerHTML='<label class="input-label" for="textAnswer">La capital era…</label><input id="textAnswer" type="text" maxlength="80" autocomplete="off" autocapitalize="words" spellcheck="false" placeholder="Escribe aquí">';
      $('textAnswer').addEventListener('input',()=>draft=$('textAnswer').value);
      $('textAnswer').addEventListener('keydown',e=>{if(e.key==='Enter'&&!s.responses[q.id])check();});
    } else if(q.kind==='match'){
      const opts=shuffle(q.pairs.map(p=>p[1]));
      area.innerHTML=q.pairs.map(([a],i)=>`<div class="match-row"><label for="match${i}">${esc(a)}</label><select id="match${i}" data-match="${i}"><option value="">Elige una opción…</option>${opts.map(o=>`<option value="${esc(o)}">${esc(o)}</option>`).join('')}</select></div>`).join('');
      area.addEventListener('change',e=>{if(e.target.matches('select'))draft[Number(e.target.dataset.match)]=e.target.value;});
    } else {
      area.innerHTML='<div class="order-slots" id="orderSlots" aria-live="polite"></div><div class="options" id="orderOptions"></div><div class="order-tools"><button class="outline compact" id="undoOrder">Deshacer última</button><button class="outline compact" id="clearOrder">Vaciar orden</button></div>';
      $('orderOptions').innerHTML=shuffle(q.items).map(o=>`<button class="option" data-order="${esc(o)}">${esc(o)}</button>`).join('');
      const draw=()=>{
        $('orderSlots').innerHTML=draft.length?`<ol>${draft.map(o=>`<li>${esc(o)}</li>`).join('')}</ol>`:'<p>Aquí aparecerá tu secuencia.</p>';
        document.querySelectorAll('[data-order]').forEach(b=>{b.disabled=draft.includes(b.dataset.order);});
        $('undoOrder').disabled=$('clearOrder').disabled=draft.length===0;
      };
      $('orderOptions').addEventListener('click',e=>{const b=e.target.closest('[data-order]');if(b&&!b.disabled){draft.push(b.dataset.order);draw();}});
      $('undoOrder').addEventListener('click',()=>{draft.pop();draw();});$('clearOrder').addEventListener('click',()=>{draft=[];draw();});draw();
    }
    $('showHint').addEventListener('click',()=>{hintUsed=true;$('hintText').textContent=q.hint;$('hintText').hidden=false;$('showHint').hidden=true;});
    $('check').addEventListener('click',check);
    $('next').addEventListener('click',nextQuestion);
    if(a){draft=a.response;restoreDraft(q);showFeedback(q,a);}
    focus('questionTitle');
  }
  function restoreDraft(q) {
    if(q.kind==='choice'||q.kind==='multi')document.querySelectorAll('[data-option]').forEach(b=>{const chosen=q.kind==='choice'?draft===b.dataset.option:draft.includes(b.dataset.option);b.classList.toggle('chosen',chosen);b.setAttribute('aria-pressed',chosen);});
    if(q.kind==='text')$('textAnswer').value=draft;
    if(q.kind==='match')q.pairs.forEach((_,i)=>$('match'+i).value=draft[i]||'');
    if(q.kind==='order')$('orderSlots').innerHTML=`<ol>${draft.map(o=>`<li>${esc(o)}</li>`).join('')}</ol>`;
  }
  const norm=v=>String(v).trim().toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[.,;:!?]/g,'').replace(/\s+/g,' ');
  function check() {
    const q=currentQuestion(),s=state.active;if(!q||s.responses[q.id])return;
    const complete=q.kind==='multi'?draft.length===q.answers.length:q.kind==='match'?draft.every(Boolean):q.kind==='order'?draft.length===q.items.length:typeof draft==='string'&&draft.trim().length>0;
    if(!complete){$('validation').hidden=false;$('validation').textContent=q.kind==='multi'?'Elige exactamente dos respuestas.':q.kind==='order'?'Coloca todas las fichas antes de comprobar.':q.kind==='match'?'Elige una respuesta en cada fila.':'Primero escribe o elige tu respuesta.';return;}
    const correct=q.kind==='choice'?draft===q.answer:q.kind==='text'?q.answers.some(a=>norm(a)===norm(draft)):q.kind==='multi'?draft.length===q.answers.length&&draft.every(a=>q.answers.includes(a)):q.kind==='match'?q.pairs.every((p,i)=>p[1]===draft[i]):q.items.every((p,i)=>p===draft[i]);
    const answer={correct,response:Array.isArray(draft)?[...draft]:draft,hint:hintUsed};
    s.responses[q.id]=answer;
    // En el simulacro el progreso solo se publica al finalizar, para no revelar soluciones al salir.
    if(s.mode!=='exam')state.answers[q.id]=correct;
    save();showFeedback(q,answer);
  }
  function showFeedback(q,a) {
    const s=state.active;
    $('validation').hidden=true;$('check').hidden=true;$('showHint').hidden=true;
    $('hintText').hidden=true;
    $('answerArea').querySelectorAll('button,input,select').forEach(el=>el.disabled=true);
    const box=$('feedback');box.hidden=false;
    if(s.mode==='exam'){
      box.className='exam-saved';box.textContent='Respuesta guardada. La solución aparecerá al terminar el simulacro.';
    } else {
      box.className='feedback'+(a.correct?'':' wrong');
      box.innerHTML=`<h3>${a.correct?'✓ Bien razonado.':'Una pista para la próxima.'}</h3>${!a.correct?`<p><strong>Solución:</strong> ${esc(correctText(q))}</p>`:''}<p>${esc(q.why)}</p>${a.hint?'<p class="small muted">Has usado una pista. Prueba a recordarlo sin ayuda la próxima vez.</p>':''}<p class="source">Fuente: ${esc(q.source)}.</p>`;
      if(q.kind==='choice'||q.kind==='multi')document.querySelectorAll('[data-option]').forEach(b=>{
        const good=q.kind==='choice'?q.answer===b.dataset.option:q.answers.includes(b.dataset.option);
        b.classList.toggle('good',good);b.classList.toggle('bad',!good&&b.classList.contains('chosen'));
        if(good)b.querySelector('.option-mark').textContent='✓';
        else if(b.classList.contains('chosen'))b.querySelector('.option-mark').textContent='×';
      });
    }
    $('next').hidden=false;$('next').textContent=s.pos===s.ids.length-1?'Ver mi resultado →':'Siguiente reto →';
    $('sessionBar').value=s.pos+1;
  }
  function nextQuestion() {
    const s=state.active;if(!s||!s.responses[s.ids[s.pos]])return;
    if(s.pos<s.ids.length-1){s.pos++;save();renderQuestion();}
    else finish();
  }
  function finish() {
    const s=state.active;if(!s)return;
    const correct=s.ids.filter(id=>s.responses[id]?.correct).length;
    if(s.mode==='exam'){
      s.ids.forEach(id=>state.answers[id]=s.responses[id].correct);
      state.bestExam=Math.max(state.bestExam===null?0:state.bestExam,correct);
    }
    lastResult=JSON.parse(JSON.stringify(s));state.active=null;save();updateHome();renderResult(correct);
  }
  function renderResult(correct) {
    const s=lastResult,wrong=s.ids.filter(id=>!s.responses[id].correct),hints=s.ids.filter(id=>s.responses[id].hint).length;
    const nextLevel=s.mode==='mission'?D.levels[D.levels.findIndex(l=>l.id===s.level)+1]:null;
    const missedTopics=[...new Set(wrong.map(id=>byId[id].level))];
    screen('result');
    $('resultScreen').innerHTML=`<div class="result-banner"><div class="result-seal" aria-hidden="true">${wrong.length?'◇':'✓'}</div><span class="eyebrow">${s.mode==='exam'?'SIMULACRO TERMINADO':'SESIÓN TERMINADA'}</span><h2 id="resultTitle" tabindex="-1">${wrong.length?'Ya sabes por dónde seguir.':s.mode==='mission'?'¡Llave recuperada!':'¡Buen viaje por la historia!'}</h2><div class="score">${correct} / ${s.ids.length}</div><p>Respuestas correctas en esta sesión${hints?` · ${hints} con pista`:''}. ${wrong.length?'Repasar una duda es una parte del aprendizaje.':'Ahora intenta explicar una de ellas con tus propias palabras.'}</p>${missedTopics.length?`<div class="result-topics">${missedTopics.map(id=>`<span>${esc(D.levels.find(l=>l.id===id).topic)}</span>`).join('')}</div>`:''}<div class="result-actions">${wrong.length?'<button class="primary" id="retryResult">Practicar los errores</button>':nextLevel?`<button class="primary" id="nextMission">Siguiente puerta →</button>`:'<button class="primary" id="resultCards">Repasar con tarjetas</button>'}<button class="outline" id="resultHome">Volver al mapa</button></div></div><section class="review"><h3>${s.mode==='exam'?'Soluciones del simulacro':'Lo que te llevas de esta misión'}</h3><p class="muted small">${s.mode==='exam'?'Revisa qué respondiste y compara con la solución.':'Aquí puedes comprobar cada respuesta de la sesión.'}</p>${s.ids.map(id=>{const q=byId[id],a=s.responses[id];return `<article class="review-item"><h4>${a.correct?'✓':'↺'} ${esc(q.prompt)}</h4><p><strong>Tu respuesta:</strong> ${esc(responseText(q,a.response))}</p><p><strong>Solución:</strong> ${esc(correctText(q))}</p><p>${esc(q.why)}</p><p class="source">${esc(q.source)}.</p></article>`;}).join('')}</section>`;
    $('resultHome').addEventListener('click',()=>{updateHome();screen('home');focus('startAdventure');});
    $('retryResult')?.addEventListener('click',()=>start('retry'));
    $('nextMission')?.addEventListener('click',()=>start('mission',nextLevel.id));
    $('resultCards')?.addEventListener('click',openCards);
    focus('resultTitle');
  }
  function responseText(q,response) {
    if(q.kind==='match')return q.pairs.map((p,i)=>`${p[0]}: ${response[i]}`).join(' · ');
    return Array.isArray(response)?response.join(q.kind==='order'?' → ':' + '):response;
  }
  function renderCard() {
    const [a,b]=D.cards[cardIndex];$('cardFront').textContent=a;$('cardBack').textContent=b;$('cardBack').hidden=true;
    $('cardCount').textContent=`TARJETA ${cardIndex+1} / ${D.cards.length}`;$('flipCard').textContent='Ver respuesta';$('flipCard').setAttribute('aria-expanded','false');
    $('prevCard').disabled=cardIndex===0;$('nextCard').disabled=cardIndex===D.cards.length-1;
  }
  function openCards(){screen('card');cardIndex=0;renderCard();focus('cardsTitle');}
  $('openCards').addEventListener('click',openCards);
  $('flipCard').addEventListener('click',()=>{const hide=!$('cardBack').hidden;$('cardBack').hidden=hide;$('flipCard').textContent=hide?'Ver respuesta':'Ocultar respuesta';$('flipCard').setAttribute('aria-expanded',String(!hide));});
  $('prevCard').addEventListener('click',()=>{if(cardIndex>0){cardIndex--;renderCard();}});
  $('nextCard').addEventListener('click',()=>{if(cardIndex<D.cards.length-1){cardIndex++;renderCard();}});
  $('closeCards').addEventListener('click',()=>{screen('home');focus('openCards');});
  updateHome();
})();
