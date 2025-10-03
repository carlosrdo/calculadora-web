/* =========================================================
   WEB-CALC fx-AI — JavaScript desde cero (robusto y funcional)
   ========================================================= */

window.addEventListener('DOMContentLoaded', () => {
  "use strict";

  // ---------- Utilidades ----------
  const $  = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const on = (el, ev, fn) => el && el.addEventListener(ev, fn, false);

  const toNumber = (s) => Number(String(s ?? "").replace(",", "."));
  const isNum    = (v) => Number.isFinite(v);

  // ---------- Referencias seguras ----------
  const screen = $('#screen') || $('input.screen');     // pantalla
  const info   = $('#info');                            // campo informativo (opcional)

  const panelCalc = $('#panel-calc');
  const panelCSV  = $('#panel-csv');
  const toggleBtn = $('#toggle-mode');
  const toggleLbl = $('#toggle-label');

  // Si no hay pantalla, no hacemos nada (pero no rompemos la página)
  if (!screen) {
    console.error('[fx-AI] No se encontró #screen. Revisa el HTML.');
    return;
  }

  // ---------- Estado ----------
  let mem = { first: null, op: null }; // para operaciones binarias
  const setInfo = (operacion, resultado) => {
    if (!info) return;
    if (!isNum(resultado)) { info.textContent = `Info: Error en ${operacion}`; return; }
    const rango = resultado < 100 ? 'El resultado es menor que 100'
                : resultado <= 200 ? 'El resultado está entre 100 y 200'
                : 'El resultado es superior a 200';
    info.textContent = `Operación: ${operacion}. ${rango}`;
  };

  const validar = (txt) => {
    const t = String(txt ?? '').trim();
    if (!t) return { ok:false, type:'empty', val:NaN };
    const n = toNumber(t);
    return isNum(n) ? { ok:true, type:'number', val:n } : { ok:false, type:'nan', val:NaN };
  };

  // ---------- Operaciones ----------
  const unarias = {
    sqrt : (x) => (x < 0 ? NaN : Math.sqrt(x)),
    sq   : (x) => x * x,
    cube : (x) => x * x * x,
    abs  : (x) => Math.abs(x),
    log  : (x) => (x <= 0 ? NaN : Math.log10(x)),
    fact : (x) => {
      if (!Number.isInteger(x) || x < 0 || x > 170) return NaN;
      let r = 1; for (let i = 2; i <= x; i++) r *= i; return r;
    },
    mod  : (x) => (x < 0 ? -x : x),
    pow  : (x, y) => Math.pow(x, y),
  };

  const binarias = {
    plus     : (a, b) => a + b,
    minus    : (a, b) => a - b,
    multiply : (a, b) => a * b,
    divide   : (a, b) => (b === 0 ? NaN : a / b),
  };

  // ---------- Interacción (delegación) ----------
  function handleButtonClick(btn) {
    // 1) Dígitos
    if (btn.dataset.digit != null) {
      screen.value += btn.dataset.digit;
      return;
    }

    // 2) Acciones de punto / AC
    const act = btn.dataset.action;
    if (act === 'dot') {
      if (!screen.value.includes('.')) {
        screen.value = screen.value || '0';
        screen.value += '.';
      }
      return;
    }
    if (act === 'ac') {
      screen.value = '';
      mem = { first: null, op: null };
      if (info) info.textContent = 'Info sobre el número';
      return;
    }

    // 3) Operadores binarios
    if (btn.dataset.op) {
      const v = validar(screen.value);
      if (!v.ok) { setInfo('Operador', NaN); return; }
      mem = { first: v.val, op: btn.dataset.op };
      screen.value = '';
      return;
    }

    // 4) Igual
    if (act === 'eq') {
      if (mem.first === null || !mem.op) { setInfo('Igual', NaN); return; }
      const v = validar(screen.value);
      if (!v.ok) { setInfo('Igual', NaN); return; }
      const res = (binarias[mem.op] || (()=>NaN))(mem.first, v.val);
      if (!isNum(res)) { setInfo('Cálculo', NaN); return; }
      screen.value = String(res);
      const name = {plus:'Suma', minus:'Resta', multiply:'Multiplicación', divide:'División'}[mem.op] || 'Operación';
      setInfo(name, res);
      mem = { first: null, op: null };
      return;
    }

    // 5) Unarias (incluida potencia xʸ)
    if (act) {
      const v = validar(screen.value);
      if (!v.ok) { setInfo('Entrada inválida', NaN); return; }

      if (act === 'pow') {
        const yRaw = prompt('Introduzca el exponente (y):');
        const y = toNumber(yRaw);
        if (!isNum(y)) { setInfo('Potencia', NaN); return; }
        const res = unarias.pow(v.val, y);
        if (!isNum(res)) { setInfo('Potencia', NaN); return; }
        screen.value = String(res);
        setInfo('Potencia', res);
        return;
      }

      const fn = unarias[act];
      if (!fn) return;
      const res = fn(v.val);
      if (!isNum(res)) {
        const nm = act==='sqrt'?'Raíz cuadrada'
                 : act==='log' ?'Logaritmo'
                 : act==='fact'?'Factorial'
                 : act==='mod' ?'Módulo'
                 : 'Operación';
        setInfo(nm, NaN);
        return;
      }
      screen.value = String(res);
      const nameMap = { sqrt:'Raíz', sq:'Cuadrado', cube:'Cubo', abs:'|x|', log:'Log', fact:'Factorial', mod:'Módulo' };
      setInfo(nameMap[act] || 'Operación', res);
    }
  }

  // Delegación global: cualquier botón con clase .btn responde
  on(document, 'click', (ev) => {
    const btn = ev.target.closest('button.btn, [data-digit], [data-action], [data-op], [data-csv]');
    if (!btn) return;

    // pequeño feedback visual si tiene clase .btn
    if (btn.classList && btn.classList.contains('btn')) {
      btn.classList.add('active-press');
      setTimeout(() => btn.classList.remove('active-press'), 120);
    }

    // Calculadora
    if (btn.matches('[data-digit], [data-action], [data-op]')) {
      handleButtonClick(btn);
      return;
    }

    // CSV
    if (btn.matches('[data-csv]')) {
      csvAction(btn.dataset.csv);
      return;
    }
  });

  // ---------- Teclado ----------
  on(window, 'keydown', (e) => {
    if (e.key === 'Escape') { const b = $('[data-action="ac"]'); b && b.click(); return; }
    if (e.key === 'Enter' || e.key === '=') { const b = $('[data-action="eq"]'); b && b.click(); return; }
    if ('0123456789'.includes(e.key)) { screen.value += e.key; return; }
    if (e.key === '.') { const b = $('[data-action="dot"]'); b && b.click(); }

    if (e.key === '+') { const b = $('[data-op="plus"]'); b && b.click(); }
    if (e.key === '-') { const b = $('[data-op="minus"]'); b && b.click(); }
    if (e.key === '*') { const b = $('[data-op="multiply"]'); b && b.click(); }
    if (e.key === '/') { const b = $('[data-op="divide"]'); b && b.click(); }

    if (e.altKey) {
      const map = {
        c: () => toggleBtn && toggleBtn.click(),
        q: () => $('[data-action="sq"]')?.click(),
        r: () => $('[data-action="sqrt"]')?.click(),
        '3': () => $('[data-action="cube"]')?.click(),
        f: () => $('[data-action="fact"]')?.click(),
        m: () => $('[data-action="mod"]')?.click(),
        l: () => $('[data-action="log"]')?.click(),
        y: () => $('[data-action="pow"]')?.click(),
        b: () => $('[data-action="abs"]')?.click(),
      };
      const f = map[e.key.toLowerCase()];
      if (f) { e.preventDefault(); f(); }
    }
  });

  // ---------- Toggle Calculator / CSV ----------
  on(toggleBtn, 'click', () => {
    if (!panelCalc || !panelCSV) return; // si no hay paneles, ignorar
    const csvMode = !panelCSV.classList.contains('visible');
    panelCalc.classList.toggle('visible', !csvMode);
    panelCSV.classList.toggle('visible', csvMode);
    panelCSV.setAttribute('aria-hidden', (!csvMode).toString());
    toggleBtn.setAttribute('aria-pressed', csvMode.toString());
    if (toggleLbl) toggleLbl.textContent = csvMode ? 'Calculator' : 'CSV Mode';
  });

  // ---------- CSV ----------
  const csvIn  = $('#csv-input');
  const csvOut = $('#csv-output');
  const csvIdx = $('#csv-index');

  const parseCSV = () => {
    if (!csvIn) throw new Error('No existe el campo CSV');
    const raw = (csvIn.value || '').trim();
    if (!raw) throw new Error('Lista CSV vacía');
    const arr = raw.split(',').map(s => s.trim()).filter(Boolean);
    if (!arr.length) throw new Error('Lista CSV incompleta');
    const nums = arr.map(toNumber);
    if (nums.some(n => !isNum(n))) throw new Error('La lista contiene valores no numéricos');
    return nums;
  };
  const setCSV = (a) => { if (csvIn) csvIn.value = a.join(', '); };
  const outCSV = (txt) => { if (csvOut) csvOut.textContent = txt; };

  function csvAction(kind) {
    try {
      const arr = parseCSV();
      switch (kind) {
        case 'sum': {
          const s = arr.reduce((acc, n) => acc + n, 0);
          outCSV(`Suma = ${s}`); setInfo('CSV Sumatorio', s); break;
        }
        case 'avg': {
          const s = arr.reduce((acc, n) => acc + n, 0) / arr.length;
          outCSV(`Media = ${s}`); setInfo('CSV Media', s); break;
        }
        case 'sort': {
          const sorted = [...arr].sort((a, b) => a - b);
          setCSV(sorted); outCSV('Lista ordenada ascendente');
          setInfo('CSV Ordenar', sorted.at(-1) ?? 0); break;
        }
        case 'rev': {
          const rev = [...arr].reverse();
          setCSV(rev); outCSV('Lista invertida');
          setInfo('CSV Revertir', rev[0] ?? 0); break;
        }
        case 'pop': {
          if (!arr.length) throw new Error('Nada que quitar');
          arr.pop(); setCSV(arr); outCSV('Quitado último elemento');
          setInfo('CSV Quitar', arr.at(-1) ?? 0); break;
        }
        case 'removeAt': {
          const idx = Number(csvIdx?.value);
          if (!Number.isInteger(idx)) throw new Error('Índice no válido');
          if (idx < 0 || idx >= arr.length) throw new Error('Índice fuera de rango');
          arr.splice(idx, 1); setCSV(arr); outCSV(`Quitado elemento en índice ${idx}`);
          setInfo('CSV Quitar por índice', arr[idx] ?? 0); break;
        }
      }
    } catch (err) {
      outCSV(`⚠️ ${err.message}`);
      setInfo('CSV', NaN);
    }
  }

  // ---------- Estado inicial ----------
  screen.value = '';
  if (panelCalc && !panelCalc.classList.contains('visible')) panelCalc.classList.add('visible');
});
