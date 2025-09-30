/* =========================
   WEB-CALC fx-AI (vanilla JS)
   ========================= */

// Helpers cortos
const qs  = (s, el=document) => el.querySelector(s);
const qsa = (s, el=document) => [...el.querySelectorAll(s)];

const screen      = qs('#screen');
const info        = qs('#info');
const toggleBtn   = qs('#toggle-mode');
const toggleLabel = qs('#toggle-label');

const panelCalc = qs('#panel-calc');
const panelCSV  = qs('#panel-csv');

const logsModal   = qs('#logs-modal');
const logsList    = qs('#logs-list');
const showLogsBtn = qs('#show-logs');
const closeLogsBtn= qs('#close-logs');
const exportLogsBtn = qs('#export-logs');
const downloadLogsA = qs('#download-logs');

let errorLogs = [];                  // registro de errores
let mem = { first: null, op: null }; // estado de operación binaria

// ---- Utilidades numéricas/validación
const toNumber = (s) => {
  if (s === null || s === undefined) return NaN;
  return Number(String(s).replace(',', '.'));
};
const isNum = (v) => Number.isFinite(v);
const validar = (input) => {
  const txt = String(input ?? '').trim();
  if (txt === '') return { ok:false, type:'empty', val:NaN };
  const n = toNumber(txt);
  return isNum(n) ? { ok:true, type:'number', val:n } : { ok:false, type:'nan', val:NaN };
};

// ---- Campo informativo
function rellenar_info(operacion, resultado){
  if (!isNum(resultado)){
    info.textContent = `Info: Error en ${operacion}`;
    return;
  }
  const rango = (resultado < 100) ? 'El resultado es menor que 100'
                : (resultado <= 200) ? 'El resultado está entre 100 y 200'
                : 'El resultado es superior a 200';
  info.textContent = `Operación: ${operacion}. ${rango}`;
}

// ---- Manejo de errores centralizado
function logError(contexto, detalle){
  const stamp = new Date().toLocaleString();
  errorLogs.push(`[${stamp}] ${contexto}: ${detalle}`);
  info.textContent = `⚠️ ${contexto}: ${detalle}`;
}
function flashPress(btn){
  btn.classList.add('active-press');
  setTimeout(()=>btn.classList.remove('active-press'), 120);
}

// ================== LÓGICA ==================

// Delegación de eventos (garantiza funcionamiento de todas las teclas)
document.addEventListener('click', (ev)=>{
  const btn = ev.target.closest('button');
  if (!btn) return;

  // Resalte breve
  if (btn.classList.contains('btn')) flashPress(btn);

  // Digitos
  if (btn.dataset.digit){
    screen.value += btn.dataset.digit;
    return;
  }

  // Punto decimal
  if (btn.dataset.action === 'dot'){
    if (!screen.value.includes('.')){
      screen.value = screen.value || '0';
      screen.value += '.';
    }
    return;
  }

  // AC
  if (btn.dataset.action === 'ac'){
    screen.value = '';
    mem = { first:null, op:null };
    info.textContent = 'Info sobre el número';
    return;
  }

  // Operadores binarios
  if (btn.dataset.op){
    const v = validar(screen.value);
    if (!v.ok){ logError('Operador', 'Necesita un número primero'); return; }
    mem = { first:v.val, op:btn.dataset.op };
    screen.value = '';
    return;
  }

  // Igual
  if (btn.dataset.action === 'eq'){
    if (mem.first === null || !mem.op){ logError('Igual', 'No hay operación pendiente'); return; }
    const v = validar(screen.value);
    if (!v.ok){ logError('Igual', 'Segundo operando inválido'); return; }
    const ops = {
      plus:(a,b)=>a+b,
      minus:(a,b)=>a-b,
      multiply:(a,b)=>a*b,
      divide:(a,b)=> (b===0 ? NaN : a/b)
    };
    const res = ops[mem.op](mem.first, v.val);
    if (!isNum(res)){ logError('Cálculo', 'Resultado no válido (¿división por cero?)'); return; }
    screen.value = String(res);
    const name = {plus:'Suma', minus:'Resta', multiply:'Multiplicación', divide:'División'}[mem.op] || 'Operación';
    rellenar_info(name, res);
    mem = { first:null, op:null };
    return;
  }

  // Unarias y otras
  if (btn.dataset.action){
    const action = btn.dataset.action;
    const v = validar(screen.value);
    if (!v.ok){ logError('Entrada inválida', v.type === 'empty' ? 'Campo vacío' : 'No es número'); return; }

    const un = {
      sqrt:(x)=> (x<0 ? NaN : Math.sqrt(x)),
      sq:(x)=> x*x,
      cube:(x)=> x*x*x,
      abs:(x)=> Math.abs(x),
      log:(x)=> (x<=0 ? NaN : Math.log10(x)),
      fact:(x)=> {
        if (!Number.isInteger(x) || x<0 || x>170) return NaN;
        let r=1; for(let i=2;i<=x;i++) r*=i; return r;
      },
      mod:(x)=> (x<0 ? -x : x)
    };

    if (action === 'pow'){
      const yRaw = prompt('Introduzca el exponente (y):');
      const y = toNumber(yRaw);
      if (!isNum(y)){ logError('Potencia', 'Exponente no válido'); return; }
      const res = Math.pow(v.val, y);
      if (!isNum(res)){ logError('Potencia', 'Resultado no válido'); return; }
      screen.value = String(res);
      rellenar_info('Potencia', res);
      return;
    }

    const fn = un[action];
    if (!fn){ return; }
    const res = fn(v.val);
    if (!isNum(res)){
      const name = action==='sqrt'?'Raíz cuadrada':action==='log'?'Logaritmo':action==='fact'?'Factorial':action==='mod'?'Módulo':'Operación';
      logError(name, 'No definida para ese valor');
      return;
    }
    screen.value = String(res);
    const nameMap = { sqrt:'Raíz', sq:'Cuadrado', cube:'Cubo', abs:'|x|', log:'Log', fact:'Factorial', mod:'Módulo' };
    rellenar_info(nameMap[action] || 'Operación', res);
    return;
  }
});

// Atajos de teclado
window.addEventListener('keydown', (e)=>{
  if (e.key === 'Escape') { document.querySelector('[data-action="ac"]').click(); return; }
  if (e.key === 'Enter' || e.key === '=') { document.querySelector('[data-action="eq"]').click(); return; }
  if ('0123456789'.includes(e.key)){ screen.value += e.key; return; }
  if (e.key === '.') document.querySelector('[data-action="dot"]').click();
  if (e.key === '+') document.querySelector('[data-op="plus"]').click();
  if (e.key === '-') document.querySelector('[data-op="minus"]').click();
  if (e.key === '*') document.querySelector('[data-op="multiply"]').click();
  if (e.key === '/') document.querySelector('[data-op="divide"]').click();

  if (e.altKey){
    const map = {
      c: () => toggleBtn.click(),
      q: () => document.querySelector('[data-action="sq"]').click(),
      r: () => document.querySelector('[data-action="sqrt"]').click(),
      '3': () => document.querySelector('[data-action="cube"]').click(),
      f: () => document.querySelector('[data-action="fact"]').click(),
      m: () => document.querySelector('[data-action="mod"]').click(),
      l: () => document.querySelector('[data-action="log"]').click(),
      y: () => document.querySelector('[data-action="pow"]').click(),
      b: () => document.querySelector('[data-action="abs"]').click()
    };
    const f = map[e.key.toLowerCase()];
    if (f){ e.preventDefault(); f(); }
  }
});

// ---------- MODO CSV ----------
const csvIn   = qs('#csv-input');
const csvOut  = qs('#csv-output');
const csvIdx  = qs('#csv-index');

function parseCSV(){
  const raw = (csvIn.value || '').trim();
  if (raw === '') throw new Error('Lista CSV vacía');
  const arr = raw.split(',').map(s => s.trim()).filter(Boolean);
  if (!arr.length) throw new Error('Lista CSV incompleta');
  const nums = arr.map(n => toNumber(n));
  if (nums.some(n => !isNum(n))) throw new Error('La lista contiene valores no numéricos');
  return nums;
}
const setCSV = (a)=> csvIn.value = a.join(', ');

function csvAction(kind){
  try{
    const arr = parseCSV();
    switch(kind){
      case 'sum':{
        const s = arr.reduce((acc,n)=>acc+n,0);
        csvOut.textContent = `Suma = ${s}`;
        rellenar_info('CSV Sumatorio', s);
        break;
      }
      case 'avg':{
        const s = arr.reduce((acc,n)=>acc+n,0)/arr.length;
        csvOut.textContent = `Media = ${s}`;
        rellenar_info('CSV Media', s);
        break;
      }
      case 'sort':{
        const sorted = [...arr].sort((a,b)=>a-b);
        setCSV(sorted);
        csvOut.textContent = 'Lista ordenada ascendente';
        rellenar_info('CSV Ordenar', sorted.at(-1) ?? 0);
        break;
      }
      case 'rev':{
        const rev = [...arr].reverse();
        setCSV(rev);
        csvOut.textContent = 'Lista invertida';
        rellenar_info('CSV Revertir', rev[0] ?? 0);
        break;
      }
      case 'pop':{
        if (!arr.length) throw new Error('Nada que quitar');
        arr.pop();
        setCSV(arr);
        csvOut.textContent = 'Quitado último elemento';
        rellenar_info('CSV Quitar', arr.at(-1) ?? 0);
        break;
      }
      case 'removeAt':{
        const idx = Number(csvIdx.value);
        if (!Number.isInteger(idx)) throw new Error('Índice no válido');
        if (idx < 0 || idx >= arr.length) throw new Error('Índice fuera de rango');
        arr.splice(idx,1);
        setCSV(arr);
        csvOut.textContent = `Quitado elemento en índice ${idx}`;
        rellenar_info('CSV Quitar por índice', arr[idx] ?? 0);
        break;
      }
    }
  }catch(err){
    logError('CSV', err.message);
    csvOut.textContent = `⚠️ ${err.message}`;
  }
}

// Botones CSV (delegación)
document.addEventListener('click', (ev)=>{
  const b = ev.target.closest('[data-csv]');
  if (!b) return;
  csvAction(b.dataset.csv);
});

// Toggle Calculator/CSV
toggleBtn.addEventListener('click', ()=>{
  const csvMode = !panelCSV.classList.contains('visible');
  panelCalc.classList.toggle('visible', !csvMode);
  panelCSV.classList.toggle('visible', csvMode);
  panelCSV.setAttribute('aria-hidden', (!csvMode).toString());
  toggleBtn.setAttribute('aria-pressed', csvMode.toString());
  toggleLabel.textContent = csvMode ? 'Calculator' : 'CSV Mode';
});

// ---------- LOGS ----------
showLogsBtn.addEventListener('click', ()=>{
  logsList.innerHTML = errorLogs.length
    ? errorLogs.map(l=>`<li>${l}</li>`).join('')
    : '<li>(Sin errores registrados)</li>';
  logsModal.showModal();
});
qs('#close-logs').addEventListener('click', ()=> logsModal.close());
exportLogsBtn.addEventListener('click', ()=>{
  const blob = new Blob([errorLogs.join('\n') || '(Sin errores)'], { type:'text/plain' });
  const url = URL.createObjectURL(blob);
  downloadLogsA.href = url;
  downloadLogsA.hidden = false;
  downloadLogsA.click();
  setTimeout(()=>URL.revokeObjectURL(url), 4000);
});

// Estado inicial
screen.value = '';
