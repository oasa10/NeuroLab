import { h, poner, cabeza, recuadro, dialogo, pasos, toggles, descargar, fecha, inline, corta, shuffle, plural, idear, chipUso, USOS, CODIGOS, SEIS, SALTOS, FAMILIAS } from '../lib.js';
import * as cuaderno from '../cuaderno.js';
import { EJES, PELDANOS, INSIGNIAS } from '../cuaderno.js';
import * as metodo from '../metodo.js';

// Pensar y aplicar: siete actividades que siguen el recorrido de cinco pasos y dejan huella en el cuaderno.
// Leen situaciones, nunca personas: no diagnostican ni etiquetan a nadie.
const ACT = { termometro, laboratorio, caza, situaciones, ciclo, relato, paso };

export async function render(root, ctx, parts, q) {
  const P = await ctx.pensar();
  const k = parts[0];
  if (k && ACT[k]) {
    const a = P.actividades.find(x => x.id === k);
    document.title = `${a.n} · NeuroLab`;
    root.append(h('nav', { class: 'crumbs', 'aria-label': 'Ruta' }, h('a', { href: '#/pensar' }, 'Pensar y aplicar'), ' › ', a.n));
    const r = ACT[k](root, ctx, P, q, a);
    root.append(otras(P, k));
    return r;
  }
  document.title = 'Pensar y aplicar · NeuroLab';
  return portada(root, ctx, P);
}

// ── Utilidades ──────────────────────────────────────────────
const SALTO = Object.fromEntries(SALTOS.map(s => [s.id, s]));
const nEntradas = (c, tipo) => c.entradas.filter(e => e.tipo === tipo).length;
const insignia = id => INSIGNIAS.find(i => i.id === id) || { n: id };
const tiene = (c, id) => !!c.insignias[id];
const pasoHref = (s, o) => `#/pensar/paso${s ? `?s=${encodeURIComponent(corta(s, 120))}${o ? `&o=${encodeURIComponent(o)}` : ''}` : ''}`;
// Enlace a una ficha en otra pestaña, para no perder lo que se está escribiendo
function enlaceFicha(ctx, id, texto) {
  const t = ctx.byId.get(id);
  return t ? h('a', { href: `#/termino/${encodeURIComponent(t.id)}`, target: '_blank', rel: 'noopener' }, texto || t.lema, ' ↗') : null;
}
function cabezaAct(a, ...extra) {
  return cabeza(2, a.n, a.d, h('div', { class: 'chips', style: { marginTop: '10px' } },
    a.ejes.map(e => cuaderno.chipEje(e)), h('span', { class: 'chip' }, `Unos ${a.min} minutos`)), ...extra);
}
function textarea(placeholder, valor = '', label) { return h('textarea', { placeholder, 'aria-label': label || placeholder }, valor); }
function campo(label, ayuda, control) { return h('div', { class: 'campo' }, h('label', null, label), ayuda ? h('p', { class: 'ayuda' }, ayuda) : null, control); }
function rango(valor, label, alCambiar) {
  const out = h('output', { class: 'rango-v' }, `${valor}`);
  const inp = h('input', { type: 'range', min: 0, max: 10, step: 1, value: valor, 'aria-label': label });
  inp.addEventListener('input', () => { out.textContent = inp.value; alCambiar(+inp.value); });
  return h('div', { class: 'rango' }, h('span', { class: 'small muted' }, '0'), inp, h('span', { class: 'small muted' }, '10'), out);
}
function selectorTermino(ctx, inicial, alCambiar) {
  const lista = ctx.terms.filter(t => t.estado !== 'dudosa' && t.tipo !== 'persona');
  const grupos = FAMILIAS.map(f => [f, lista.filter(t => t.familia === f).sort((a, b) => a.lema.localeCompare(b.lema, 'es'))]).filter(([, ts]) => ts.length);
  const sel = h('select', { 'aria-label': 'Elige un término' }, h('option', { value: '' }, 'Elige un término…'),
    grupos.map(([f, ts]) => h('optgroup', { label: f }, ts.map(t => h('option', { value: t.id, selected: t.id === inicial ? true : null }, t.lema)))));
  sel.addEventListener('change', () => alCambiar(ctx.byId.get(sel.value) || null));
  const azar = h('button', { class: 'btn small', type: 'button', onclick: () => { const t = lista[Math.floor(Math.random() * lista.length)]; if (!t) return; sel.value = t.id; alCambiar(t); } }, '🎲 Uno al azar');
  return h('div', { class: 'sel-term' }, sel, azar);
}
function fichaMini(t) {
  return t ? h('div', { class: 'card ficha-mini' }, h('b', null, t.lema), ' ', idear(t.usos), h('p', { class: 'small', style: { margin: '6px 0 0' } }, corta(t.definicion, 180))) : null;
}
// Una cuenta atrás sobre una barra; devuelve la función que la para
function cuentaAtras(seg, barra, alAcabar) {
  let quedan = seg;
  barra.style.setProperty('--w', '100%');
  requestAnimationFrame(() => requestAnimationFrame(() => barra.style.setProperty('--w', `${100 * (quedan - 1) / seg}%`)));
  const id = setInterval(() => {
    quedan--;
    barra.style.setProperty('--w', `${Math.max(0, 100 * (quedan - 1) / seg)}%`);
    if (quedan <= 0) { clearInterval(id); alAcabar(); }
  }, 1000);
  return () => clearInterval(id);
}
function reloj(texto) {
  const i = h('i', { class: 'reloj-i' });
  return { i, el: h('div', { class: 'reloj' }, h('div', { class: 'barra', role: 'timer', 'aria-label': 'Tiempo restante' }, i), h('p', { class: 'small muted', style: { margin: '4px 0 0' } }, texto)) };
}

// Cierre de cada actividad: lo que sube en el cuaderno, cómo vas y un enlace al paso mínimo
function cierre(a, { sube = a.sube, nota, sugerencia, origen = a.id, sinPaso = false } = {}) {
  const c = cuaderno.leer();
  const ejes = Object.entries(sube).filter(([, n]) => n);
  return h('section', { class: 'cierre', 'aria-label': 'Lo que sube en tu cuaderno' },
    h('h3', null, 'Lo que sube en tu cuaderno'),
    h('div', { class: 'chips' }, ejes.map(([e, n]) => h('span', { class: 'chip chip-e', 'data-eje': e }, `${EJES[e].nombre} +${n}`))),
    h('p', { class: 'small', style: { margin: '8px 0 0' } }, h('b', null, 'Dónde estás: '),
      [...new Set([...a.ejes, ...ejes.map(([e]) => e)])].map(e => { const p = cuaderno.peldano(e, c); return `${EJES[e].nombre}, ${p >= 0 ? PELDANOS[e][p].n.toLowerCase() : 'sin empezar'}`; }).join(' · '), '.'),
    nota ? h('p', { class: 'small', style: { margin: '6px 0 0' } }, nota) : null,
    h('div', { class: 'btns', style: { marginTop: '12px' } },
      sinPaso ? null : h('a', { class: 'btn primary', href: pasoHref(sugerencia, origen) }, 'Convertirlo en un paso mínimo →'),
      h('a', { class: 'btn', href: '#/cuaderno' }, 'Ver mi cuaderno'), h('a', { class: 'btn', href: '#/pensar' }, 'Otra actividad')));
}
function otras(P, k) {
  return h('nav', { class: 'otras no-print', 'aria-label': 'Otras actividades' }, h('p', { class: 'small muted', style: { margin: '0 0 6px' } }, 'Más actividades'),
    h('div', { class: 'subtabs' }, P.actividades.map(a => h('a', { href: `#/pensar/${a.id}`, 'aria-current': a.id === k ? 'page' : null }, a.n))));
}

// ── Portada ─────────────────────────────────────────────────
const COLOR_RUTA = { A: '#2E9E5B', B: '#3B6CC4', C: '#D89614' };
const REC_ACT = [['termometro', 'ciclo'], ['laboratorio', 'situaciones'], ['paso'], ['caza'], ['paso', 'relato']];
function estadoAct(c, id) {
  const n = t => nEntradas(c, t);
  if (id === 'termometro') return n('sap') ? [true, n('sap') >= 3 ? '✓ Hecha (3 o más)' : `✓ ${plural(n('sap'), 'termómetro', 'termómetros')}`] : null;
  if (id === 'laboratorio') return n('seis') ? [true, `✓ ${plural(n('seis'), 'análisis', 'análisis')}`] : null;
  if (id === 'caza') return n('caza') >= 3 ? [true, '✓ Tres presas'] : n('caza') ? [false, `${n('caza')} de 3 presas`] : null;
  if (id === 'situaciones') { const s = Object.keys(c.situaciones).length; return s >= 6 ? [true, '✓ Las seis'] : s ? [false, `${s} de 6`] : null; }
  if (id === 'ciclo') return n('ciclo') ? [true, `✓ ${plural(n('ciclo'), 'ciclo', 'ciclos')}`] : null;
  if (id === 'relato') return c.relato.texto && c.creencias.despues ? [true, '✓ Con antes y después'] : c.creencias.antes ? [false, 'Empezado'] : null;
  if (id === 'paso') {
    const amv = c.entradas.filter(e => e.tipo === 'amv'), pend = amv.filter(e => !e.revision).length;
    return amv.length ? [!pend, pend ? `${pend} sin retorno` : '✓ Con retorno'] : null;
  }
  return null;
}

function portada(root, ctx, P) {
  const c = cuaderno.leer();
  const tarjetas = h('div', { class: 'actividades' });
  const hoy = h('div', { 'aria-live': 'polite' });
  const byId = Object.fromEntries(P.actividades.map(a => [a.id, a]));

  function pintarTarjetas(ruta) {
    const dest = ruta && P.rutas[ruta] ? P.rutas[ruta].ids : [];
    poner(hoy, ruta && P.rutas[ruta] ? h('div', { class: 'hoy-box', style: { '--oc': COLOR_RUTA[ruta] } },
      h('b', null, `Hoy, en Pensar y aplicar (${metodo.RUTAS[ruta].ruta.toLowerCase()})`),
      h('p', { style: { margin: '4px 0 8px' } }, P.rutas[ruta].por),
      h('div', { class: 'btns' }, dest.map((id, i) => h('a', { class: `btn small${i === 0 ? ' primary' : ''}`, href: `#/pensar/${id}` }, byId[id].n)))) : null);
    poner(tarjetas, P.actividades.map((a, i) => {
      const est = estadoAct(c, a.id), d = dest.includes(a.id);
      return h('a', { class: `actividad${d ? ' destacada' : ''}`, href: `#/pensar/${a.id}`, style: d ? { '--oc': COLOR_RUTA[ruta] } : null },
        h('span', { class: 'num', 'aria-hidden': 'true' }, i + 1),
        d ? h('span', { class: 'hoy-tag' }, 'Te conviene hoy') : null,
        h('h3', null, a.n), h('p', null, a.d),
        h('div', { class: 'pie' }, a.ejes.map(e => cuaderno.chipEje(e)), h('span', null, `≈ ${a.min} min`),
          est ? h('span', { class: est[0] ? 'hecha' : '' }, est[1]) : null));
    }));
  }

  // El recorrido de cinco pasos, con un ejemplo que se puede recorrer
  let ir = 0;
  const rec = h('div');
  function pintarRec(foco) {
    const R = metodo.recorrido(ir);
    [...R.children].forEach((d, k) => {
      d.setAttribute('role', 'button'); d.setAttribute('tabindex', '0'); d.setAttribute('aria-pressed', String(k === ir));
      d.setAttribute('aria-label', `Paso ${k + 1}: ${metodo.RECORRIDO[k].n}`);
      const elegir = () => { ir = k; pintarRec(true); };
      d.addEventListener('click', elegir);
      d.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); elegir(); } });
    });
    poner(rec, R,
      h('div', { class: 'card rec-ej', 'aria-live': 'polite' },
        h('p', { class: 'nivel', style: { margin: '0 0 4px' } }, `${P.recorrido.titulo} · paso ${ir + 1} de 5`),
        h('h3', { style: { margin: '0 0 6px' } }, metodo.RECORRIDO[ir].n),
        h('p', { style: { margin: '0 0 8px' } }, P.recorrido.pasos[ir]),
        h('p', { class: 'small muted', style: { margin: 0 } }, 'En NeuroLab: ', REC_ACT[ir].map((id, k) => [k ? ' · ' : '', h('a', { href: `#/pensar/${id}` }, byId[id].n)]),
          ir === 3 ? ' (y, sobre todo, fuera de la pantalla)' : ''),
        h('div', { class: 'btns', style: { marginTop: '10px' } },
          h('button', { class: 'btn small', type: 'button', disabled: ir === 0 ? true : null, onclick: () => { ir--; pintarRec(); } }, '← Anterior'),
          h('button', { class: 'btn small', type: 'button', disabled: ir === 4 ? true : null, onclick: () => { ir++; pintarRec(); } }, 'Siguiente →'))));
    if (foco) R.children[ir]?.focus({ preventScroll: true });
  }
  pintarRec();

  root.append(
    cabeza(2, 'Pensar y aplicar', 'Aquí no se viene a leer más, sino a usar lo que sabes: separar lo que sientes de lo que piensas, preguntar para qué se usa una etiqueta, cazar saltos fuera de la pantalla y dar un paso pequeño. Todo lo que hagas queda en tu cuaderno.'),
    dialogo([['moda', '¿Pensar? Si total, todo esto es una moda.'], ['cerebro', 'De moda nada: es el cerebro. Y el cerebro no se piensa, se escanea.'], ['uso', 'Antes de discutir, ¿probamos a preguntar para qué queremos la etiqueta? Luego ya nos peleamos.']]),
    metodo.preguntaEntrada({ compacta: true, alElegir: k => pintarTarjetas(k) }),
    hoy,
    h('section', null, h('h2', null, 'Cinco pasos, de la pantalla a tu vida'),
      h('p', { class: 'muted', style: { maxWidth: '46em' } }, 'Todas las actividades siguen el mismo recorrido. Pulsa cada paso para ver cómo funciona con un caso de verdad.'), rec),
    h('h2', null, 'Siete actividades'),
    tarjetas,
    h('h2', null, 'Siempre hay salida'),
    h('p', { class: 'muted', style: { maxWidth: '46em' } }, 'Pensar con calma sirve para mucho, pero no para todo. Si algo de lo que haces aquí te remueve, este semáforo te dice qué hacer.'),
    metodo.semaforo(),
    recuadro('aclaracion', 'Tus respuestas son tuyas', 'Lo que escribes aquí no sale de tu navegador: no hay cuentas, ni servidores, ni nadie leyendo por encima del hombro. Puedes descargarlo o borrarlo cuando quieras desde ', h('a', { href: '#/cuaderno' }, 'tu cuaderno'), '.'),
  );
  pintarTarjetas(cuaderno.llegadaHoy());
}

// ── 1. El termómetro (Ser y Saber) ──────────────────────────
function termometro(root, ctx, P, q, a) {
  const T = P.termometro;
  const EMO = Object.fromEntries(T.emociones), CUE = Object.fromEntries(T.cuerpo), ACC = Object.fromEntries(T.acciones);
  const NOMBRES = ['Elegir', 'Sentir', 'Actuar', 'Pensar', 'Lectura'];
  const t0 = q.get('t') ? ctx.byId.get(q.get('t')) || null : null;
  const nuevo = () => ({ t: t0, situacion: '', emociones: [], intensidad: 5, cuerpo: [], acciones: [], empuje: 5, se: '', supongo: '', pregunta: '', haria: '', claridad: 5 });
  let r = nuevo(), modo = 'termino', paso = 0, guardado = false, reto = false, parar = () => {};
  const cuerpo = h('div', { class: 'panel' });
  root.append(cabezaAct(a),
    recuadro('aclaracion', 'Por qué este orden', 'Ante algo que nos toca solemos sentir primero, actuar después y pensar al final, si llegamos. El termómetro no te pide que dejes de sentir: te ayuda a notar el orden y a darle la vuelta cuando conviene. Actuar es lo que sale solo; hacer es lo que eliges.'),
    cuerpo);
  const tema = () => (modo === 'termino' ? r.t?.lema : r.situacion.trim()) || '';
  const lectura = () => {
    const v = [['sentir', r.intensidad], ['actuar', r.empuje], ['pensar', r.claridad]].sort((x, y) => y[1] - x[1]);
    return v[0][1] - v[1][1] <= 1 ? { k: 'empate', con: v.filter(x => v[0][1] - x[1] <= 1).map(x => x[0]) } : { k: v[0][0] };
  };

  function pintar() {
    parar(); parar = () => {};
    const sig = (ok, txt = 'Siguiente →') => h('button', { class: 'btn primary', type: 'button', disabled: ok ? null : true, onclick: () => { paso++; pintar(); } }, txt);
    const atras = paso > 0 && paso < 4 ? h('button', { class: 'btn', type: 'button', onclick: () => { paso--; pintar(); } }, '← Anterior') : null;
    const sobre = paso > 0 ? h('p', { class: 'tema-sap' }, h('span', { class: 'small muted' }, 'Te tomas la temperatura ante: '), h('b', null, modo === 'termino' ? tema() : `«${tema()}»`)) : null;
    let contenido;
    if (paso === 0) {
      const boton = sig(false, 'Empezar →');
      const listo = () => { boton.disabled = !tema(); };
      let entrada;
      if (modo === 'termino') {
        entrada = h('div', null, selectorTermino(ctx, r.t?.id, x => { r.t = x; pintar(); }), fichaMini(r.t));
      } else {
        const ta = textarea('Por ejemplo: «La tutora me dice que mi hijo no para quieto»', r.situacion, 'Tu situación');
        ta.addEventListener('input', () => { r.situacion = ta.value; listo(); });
        entrada = h('div', null, ta, h('div', { class: 'chips', style: { marginTop: '8px' } }, h('span', { class: 'small muted' }, 'Ideas:'),
          T.ideas.map(f => h('button', { class: 'chip', type: 'button', onclick: () => { r.situacion = f; pintar(); } }, f))));
      }
      contenido = [h('h2', { style: { marginTop: 0 } }, '¿Ante qué te tomas la temperatura?'),
        h('p', null, 'Un término que te provoque algo, a favor o en contra, o una situación que te ronde estos días.'),
        toggles([['termino', 'Un término de NeuroLab'], ['situacion', 'Una situación tuya']], { valor: modo, alCambiar: v => { if (v) modo = v; pintar(); } }),
        entrada,
        campo('Modo reto (opcional)', 'Diez segundos para sentir y diez para actuar: lo automático sale rápido, y así se ve mejor. Para pensar, en cambio, tómate el tiempo que necesites.',
          toggles([['no', 'Sin reloj'], ['si', 'Con reloj']], { valor: reto ? 'si' : 'no', alCambiar: v => { reto = v === 'si'; } })),
        h('div', { class: 'btns' }, boton)];
      listo();
    } else if (paso === 1) {
      const boton = sig(r.emociones.length);
      const aviso = h('p', { class: 'small', 'aria-live': 'polite', style: { fontWeight: 600 } });
      const tg = toggles(T.emociones, { multiple: true, valor: r.emociones, alCambiar: v => { r.emociones = v; boton.disabled = !v.length; } });
      const rel = reto ? reloj('Lo primero que te venga. El reloj corre.') : null;
      contenido = [h('h2', { style: { marginTop: 0 } }, 'Sentir'), sobre, rel?.el,
        h('p', null, 'Sin pensarlo mucho: ¿qué te provoca? Marca una o varias.'), tg,
        campo('¿Con qué intensidad?', '0 es «ni fu ni fa»; 10, «no puedo dejar de pensar en ello».', rango(r.intensidad, 'Intensidad de lo que sientes', v => { r.intensidad = v; })),
        campo('¿Dónde lo notas? (si lo notas)', null, toggles(T.cuerpo, { multiple: true, valor: r.cuerpo, alCambiar: v => { r.cuerpo = v; } })),
        aviso, h('div', { class: 'btns' }, atras, boton)];
      if (rel) parar = cuentaAtras(10, rel.i, () => { if (r.emociones.length) { paso++; pintar(); } else aviso.textContent = 'Se acabó el tiempo. Marca lo primero que te venga: en la vida real, el cuerpo no espera a que lo pensemos.'; });
    } else if (paso === 2) {
      const boton = sig(r.acciones.length);
      const aviso = h('p', { class: 'small', 'aria-live': 'polite', style: { fontWeight: 600 } });
      const rel = reto ? reloj('De primeras. El reloj corre.') : null;
      contenido = [h('h2', { style: { marginTop: 0 } }, 'Actuar'), sobre, rel?.el,
        h('p', null, 'Y ahora, de primeras: si te lo encontraras hoy, en una conversación o en el móvil, ¿qué te saldría hacer?'),
        toggles(T.acciones, { multiple: true, valor: r.acciones, alCambiar: v => { r.acciones = v; boton.disabled = !v.length; } }),
        campo('¿Con cuánta fuerza te empuja?', '0: podría no hacer nada; 10: ya lo estaría haciendo.', rango(r.empuje, 'Fuerza del impulso', v => { r.empuje = v; })),
        recuadro('aclaracion', null, 'Actuar no es hacer. Actuar es lo que sale solo; hacer es lo que eliges después de pensarlo. Aquí buscamos lo primero, sin juzgarlo.'),
        aviso, h('div', { class: 'btns' }, atras, boton)];
      if (rel) parar = cuentaAtras(10, rel.i, () => { if (r.acciones.length) { paso++; pintar(); } else aviso.textContent = 'Se acabó el tiempo. ¿Qué habrías hecho? Márcalo igualmente.'; });
    } else if (paso === 3) {
      const boton = sig(r.se.trim() && r.haria.trim(), 'Ver la lectura →');
      const areas = T.pensar.map(p => { const ta = textarea(p.ayuda, r[p.k], p.l); ta.addEventListener('input', () => { r[p.k] = ta.value; boton.disabled = !(r.se.trim() && r.haria.trim()); }); return campo(p.l, null, ta); });
      contenido = [h('h2', { style: { marginTop: 0 } }, 'Pensar'), sobre,
        h('p', null, 'Ahora sí, con calma. ', modo === 'termino' && r.t ? ['Si quieres, abre la ficha para documentarte: ', enlaceFicha(ctx, r.t.id), '.'] : 'No hace falta saberlo todo: basta con separar lo que sabes de lo que supones.'),
        ...areas,
        campo('¿Cuánta claridad tienes ahora?', '0: ninguna, todo es niebla; 10: lo veo claro.', rango(r.claridad, 'Claridad al pensarlo', v => { r.claridad = v; })),
        h('p', { class: 'small muted' }, 'Hacen falta al menos lo que sabes y lo que harías.'),
        h('div', { class: 'btns' }, atras, boton)];
    } else {
      const L = lectura(), lec = T.lecturas[L.k];
      const NOM = { sentir: 'Sentir', actuar: 'Actuar', pensar: 'Pensar' };
      const automatico = r.acciones.map(x => ACC[x]).join(', ');
      if (!guardado) {
        guardado = true;
        cuaderno.entrada('sap', modo === 'termino' ? r.t.lema : corta(r.situacion.trim(), 70), {
          modo, id: modo === 'termino' ? r.t.id : null, situacion: modo === 'situacion' ? r.situacion.trim() : '',
          emociones: r.emociones, intensidad: r.intensidad, cuerpo: r.cuerpo, acciones: r.acciones, empuje: r.empuje,
          se: r.se.trim(), supongo: r.supongo.trim(), pregunta: r.pregunta.trim(), haria: r.haria.trim(), claridad: r.claridad, delante: L.k, reto,
          resumen: [
            ['Ante', modo === 'termino' ? r.t.lema : r.situacion.trim()],
            ['Sentí', `${r.emociones.map(e => EMO[e]).join(', ')} (${r.intensidad} de 10)`],
            ...(r.cuerpo.length ? [['Lo noté', r.cuerpo.map(x => CUE[x]).join(', ')]] : []),
            ['Me salía', `${automatico} (${r.empuje} de 10)`],
            ['Sé', r.se.trim()], ['Supongo', r.supongo.trim() || '—'], ['Mi pregunta', r.pregunta.trim() || '—'],
            ['Pensándolo, haría', r.haria.trim()], ['Iba delante', L.k === 'empate' ? `${L.con.map(k => NOM[k].toLowerCase()).join(' y ')}, a la par` : lec.t.replace(/^Va delante /, '')]],
        }, a.sube);
      }
      const n = nEntradas(cuaderno.leer(), 'sap');
      const tubo = (k, v, c) => h('div', { class: `tubo${L.k === k || (L.k === 'empate' && L.con.includes(k)) ? ' delante' : ''}`, style: { '--c': c, '--h': `${v * 10}%` } },
        h('div', { class: 'col', role: 'img', 'aria-label': `${NOM[k]}: ${v} de 10` }, h('i')), h('span', { class: 'bulbo', 'aria-hidden': 'true' }),
        h('b', null, NOM[k]), h('span', { class: 'small muted' }, `${v} de 10`));
      contenido = [h('h2', { style: { marginTop: 0 } }, 'Tu lectura'), sobre,
        h('div', { class: 'termo3' }, tubo('sentir', r.intensidad, 'var(--e-ser)'), tubo('actuar', r.empuje, 'var(--n2)'), tubo('pensar', r.claridad, 'var(--e-saber)')),
        recuadro('piensa', lec.t, lec.pista),
        h('div', { class: 'comparar' },
          h('div', null, h('p', { class: 'nivel', style: { color: 'var(--e-ser)' } }, 'En automático'),
            h('p', null, h('b', null, 'Sentías: '), r.emociones.map(e => EMO[e].toLowerCase()).join(', '), '.'),
            h('p', { style: { margin: 0 } }, h('b', null, 'Te salía: '), automatico.toLowerCase(), '.')),
          h('div', { class: 'modelo' }, h('p', { class: 'nivel' }, 'Pensándolo'),
            h('p', null, h('b', null, 'Sabes: '), r.se.trim()), r.supongo.trim() ? h('p', null, h('b', null, 'Supones: '), r.supongo.trim()) : null,
            r.pregunta.trim() ? h('p', null, h('b', null, 'Tu pregunta: '), r.pregunta.trim()) : null,
            h('p', { style: { margin: 0 } }, h('b', null, 'Harías: '), r.haria.trim()))),
        r.intensidad >= 8 ? recuadro('atencion', 'Si lo que sientes pesa mucho', 'Una intensidad tan alta merece cuidado. No tienes por qué gestionarlo a solas: háblalo con alguien de confianza o con un profesional. ', metodo.semaforo({ compacto: true })) : null,
        h('p', { class: 'small muted' }, 'Esta lectura describe cómo has llegado hoy a este tema, no cómo eres. Mañana, con otro tema, puede salir al revés.'),
        cierre(a, {
          sugerencia: r.haria.trim(), origen: 'termometro',
          nota: n >= 3 ? `Llevas ${plural(n, 'termómetro', 'termómetros')}${tiene(cuaderno.leer(), 'termometro') ? ` y tienes la insignia «${insignia('termometro').n}»` : ''}. Para el último peldaño de Ser, resuelve tres situaciones con el reloj en marcha.`
            : `Llevas ${plural(n, 'termómetro', 'termómetros')}. Con tres, de temas distintos, subes a «${PELDANOS.ser[3].n}» y ganas la insignia «${insignia('termometro').n}».`,
        }),
        h('div', { class: 'btns', style: { marginTop: '10px' } }, h('button', { class: 'btn', type: 'button', onclick: () => { r = nuevo(); r.t = null; paso = 0; guardado = false; pintar(); } }, 'Tomarme otra temperatura'))];
    }
    poner(cuerpo, pasos(NOMBRES, paso), ...contenido.flat(Infinity));
  }
  pintar();
  return { destroy: () => parar() };
}

// ── 2. Laboratorio de las seis preguntas (Saber y Hacer) ────
function laboratorio(root, ctx, P, q, a) {
  const NOMBRES = ['Elegir', 'Seis preguntas', 'Comparar'];
  const caso0 = P.casos.find(x => x.id === q.get('caso'));
  const t0 = q.get('t') ? ctx.byId.get(q.get('t')) || null : null;
  let modo = t0 ? 'termino' : 'caso', caso = caso0 || null, t = t0, uso = t0 ? (CODIGOS.includes(q.get('uso')) ? q.get('uso') : t0.usos[0] || 'D') : null;
  let propio = { etiqueta: '', situacion: '' }, actual = 0, guardado = false;
  const resp = SEIS.map(() => '');
  const cuerpo = h('div', { class: 'panel' });
  root.append(cabezaAct(a), cuerpo);
  const usoActual = () => (modo === 'caso' ? caso?.uso : uso);
  const titulo = () => (modo === 'caso' ? caso.titulo : modo === 'termino' ? `${t.lema} · ${USOS[uso].nombre}` : `«${propio.etiqueta.trim()}» · ${USOS[uso].nombre}`);
  const listo = () => (modo === 'caso' ? !!caso : modo === 'termino' ? !!(t && uso) : !!(propio.etiqueta.trim() && uso));
  const modelo = k => (modo === 'caso' ? caso.modelo[k] : P.guia[usoActual()][k]);

  function elegir() {
    const boton = h('button', { class: 'btn primary', type: 'button', disabled: listo() ? null : true, onclick: () => { actual = 0; preguntas(); } }, 'Empezar las seis preguntas →');
    const refrescar = () => { boton.disabled = !listo(); };
    let zona;
    if (modo === 'caso') {
      zona = h('div', { class: 'casos' }, P.casos.map(x => h('button', { class: 'caso', type: 'button', 'aria-pressed': String(caso?.id === x.id), onclick: () => { caso = x; elegir(); } },
        h('span', { class: 'chips' }, chipUso(x.uso)), h('b', null, x.titulo), h('span', { class: 'small' }, x.situacion))));
    } else if (modo === 'termino') {
      const tgUso = toggles(CODIGOS.map(c => [c, `${c} · ${USOS[c].nombre}`]), { valor: uso, alCambiar: v => { uso = v; elegir(); } });
      zona = h('div', null, selectorTermino(ctx, t?.id, x => { t = x; uso = x ? x.usos[0] || uso || 'D' : uso; elegir(); }), fichaMini(t),
        t ? campo('¿En qué uso la miras?', null, h('div', null, tgUso,
          uso ? h('p', { class: 'small muted', style: { margin: 0 } }, h('b', null, `${USOS[uso].nombre}: `), USOS[uso].para, '. ',
            !t.usos.includes(uso) ? 'Según su ficha, esta etiqueta no suele circular en este uso. Puedes analizarlo igualmente: a veces lo interesante es justo eso.' : '') : null)) : null);
    } else {
      const inp = h('input', { type: 'text', value: propio.etiqueta, placeholder: 'TDAH, autismo, altas capacidades, «neurodivergente»…', 'aria-label': 'La etiqueta' });
      inp.addEventListener('input', () => { propio.etiqueta = inp.value; refrescar(); });
      const ta = textarea('Dónde la has visto usar y para qué: un informe, una conversación, una ley, un perfil…', propio.situacion, 'La situación');
      ta.addEventListener('input', () => { propio.situacion = ta.value; });
      zona = h('div', null, campo('La etiqueta', null, inp), campo('La situación', 'Opcional, pero ayuda: cuanto más concreta, mejores respuestas.', ta),
        campo('¿En qué uso?', null, toggles(CODIGOS.map(c => [c, `${c} · ${USOS[c].nombre}`]), { valor: uso, alCambiar: v => { uso = v; refrescar(); } })));
    }
    poner(cuerpo, pasos(NOMBRES, 0),
      h('h2', { style: { marginTop: 0 } }, '¿Qué analizas?'),
      h('p', null, 'Una etiqueta no se analiza en el aire, sino en un uso: para investigar, diagnosticar, educar, acceder o reconocerse. Elige un caso preparado (tiene respuesta modelo) o trae el tuyo.'),
      toggles([['caso', 'Un caso preparado'], ['termino', 'Un término y un uso'], ['propio', 'Tu caso']], { valor: modo, alCambiar: v => { if (v) modo = v; elegir(); } }),
      zona,
      h('div', { class: 'btns', style: { marginTop: '14px' } }, boton),
      recuadro('recuerda', 'Cambia el uso, cambia la prueba', 'Las seis preguntas son siempre las mismas; lo que cambia es lo que cada uso necesita para responderlas bien. Por eso empiezas eligiendo uno.'));
  }

  function preguntas() {
    const s = SEIS[actual], u = usoActual();
    const comparar = h('button', { class: 'btn primary', type: 'button', disabled: resp.some(x => !x.trim()) ? true : null, onclick: final }, 'Comparar con NeuroLab →');
    const caras = h('div', { class: 'seis-caras', role: 'group', 'aria-label': 'Las seis preguntas' }, SEIS.map((x, i) => h('button', { type: 'button', 'aria-pressed': String(i === actual), onclick: () => { actual = i; preguntas(); } },
      h('b', null, i + 1), h('span', null, x.p.replace(/^¿|\?$/g, '')), resp[i].trim() ? h('i', { class: 'ok', 'aria-label': 'respondida' }, '✓') : null)));
    const ta = textarea('Tu respuesta, con tus palabras', resp[actual], s.p);
    const cuenta = h('p', { class: 'small muted' });
    const contar = () => {
      cuenta.textContent = `${resp.filter(x => x.trim()).length} de 6 respondidas. «No lo sé» cuenta: saber qué no sabes también es saber.`;
      const b = caras.children[actual], ok = b.querySelector('.ok');
      if (resp[actual].trim() && !ok) b.append(h('i', { class: 'ok', 'aria-label': 'respondida' }, '✓')); else if (!resp[actual].trim() && ok) ok.remove();
    };
    ta.addEventListener('input', () => { resp[actual] = ta.value; comparar.disabled = resp.some(x => !x.trim()); contar(); });
    contar();
    const pista = h('div', { hidden: true }, recuadro('recuerda', `Lo que suele pedir el uso «${USOS[u].nombre}»`, P.guia[u][s.k]));
    const contexto = modo === 'caso' ? caso.situacion : modo === 'propio' ? propio.situacion.trim() : t ? corta(t.definicion, 160) : '';
    poner(cuerpo, pasos(NOMBRES, 1),
      h('h2', { style: { marginTop: 0 } }, titulo()),
      h('div', { class: 'chips' }, chipUso(u), modo === 'caso' ? enlaceFicha(ctx, caso.termino, 'Ver la ficha') : modo === 'termino' ? enlaceFicha(ctx, t.id, 'Ver la ficha') : null),
      contexto ? h('p', { class: 'small', style: { margin: '8px 0 0' } }, contexto) : null,
      caras,
      h('h3', { style: { marginTop: 0 } }, `${actual + 1}. ${s.p}`), h('p', { class: 'ayuda small muted' }, s.ayuda), ta,
      h('div', { class: 'btns', style: { marginTop: '8px' } },
        h('button', { class: 'btn small', type: 'button', onclick: () => { pista.hidden = !pista.hidden; } }, 'Ver la pista'),
        h('button', { class: 'btn small', type: 'button', onclick: () => { resp[actual] = 'No lo sé.'; actual = (actual + 1) % 6; preguntas(); } }, 'No lo sé (también vale)'),
        actual < 5 ? h('button', { class: 'btn small', type: 'button', onclick: () => { actual++; preguntas(); } }, 'Siguiente pregunta →') : null),
      pista,
      h('div', { class: 'btns', style: { marginTop: '16px', borderTop: '1px solid var(--line)', paddingTop: '14px' } },
        h('button', { class: 'btn', type: 'button', onclick: elegir }, '← Cambiar de caso'), comparar),
      cuenta);
    ta.focus({ preventScroll: true });
  }

  function final() {
    const u = usoActual();
    if (!guardado) {
      guardado = true;
      cuaderno.entrada('seis', titulo(), {
        caso: modo === 'caso' ? caso.id : null, id: modo === 'caso' ? caso.termino : modo === 'termino' ? t.id : null, uso: u,
        etiqueta: modo === 'propio' ? propio.etiqueta.trim() : '', situacion: modo === 'propio' ? propio.situacion.trim() : '', respuestas: resp.map(x => x.trim()),
        resumen: [['Uso', USOS[u].nombre], ...SEIS.map((s, i) => [s.p, resp[i].trim()])],
      }, a.sube);
    }
    const sal = modo === 'caso' ? SALTO[caso.salto] : null;
    poner(cuerpo, pasos(NOMBRES, 2),
      h('h2', { style: { marginTop: 0 } }, 'Tus respuestas frente a las de NeuroLab'),
      h('p', { class: 'small muted' }, modo === 'caso' ? 'No hay una única respuesta buena. La de NeuroLab es un modelo: la tuya puede ser más fina, sobre todo si conoces el contexto.'
        : 'Para tu caso no hay respuesta modelo, pero sí lo que cada uso suele pedir. Compara y mira qué te falta o qué has visto tú que la guía no dice.'),
      SEIS.map((s, i) => h('div', { class: 'par' }, h('b', null, `${i + 1}. ${s.p}`), h('div', { class: 'comparar', style: { marginTop: '6px' } },
        h('div', null, h('p', { class: 'small muted', style: { margin: '0 0 4px' } }, 'Tú'), resp[i].trim()),
        h('div', { class: 'modelo' }, h('p', { class: 'small muted', style: { margin: '0 0 4px' } }, modo === 'caso' ? 'NeuroLab' : `Lo que suele pedir «${USOS[u].nombre}»`), modelo(s.k))))),
      modo === 'caso' ? recuadro('piensa', 'La clave', caso.clave) : null,
      sal ? h('div', null, h('h3', null, 'El salto que acecha'), h('div', { class: 'salto-box' }, h('span', { class: 'orilla' }, sal.de), h('span', { class: 'vacio', 'aria-hidden': 'true' }, '⤳'), h('span', { class: 'orilla' }, sal.a),
        h('span', { class: 'falta' }, h('b', null, 'Lo que falta para cruzarlo: '), sal.falta))) : null,
      modo === 'caso' && caso.sabias ? recuadro('sabias', null, caso.sabias) : null,
      h('h3', null, 'Cambia el uso, cambia la prueba'),
      h('p', { class: 'small muted' }, 'La misma etiqueta, en cada uno de los cinco trabajos, necesita una prueba distinta. Este análisis vale para el uso resaltado.'),
      h('div', { class: 'usos-tabla' }, CODIGOS.map(c => h('div', { class: c === u ? 'on' : 'off', 'data-v': c },
        h('b', null, USOS[c].nombre, h('small', null, USOS[c].para)), h('span', null, USOS[c].prueba)))),
      cierre(a, {
        sugerencia: `Preguntar «¿quién puede revisar esto?» la próxima vez que vea una etiqueta usada para ${USOS[u].verbo}`, origen: 'laboratorio',
        nota: tiene(cuaderno.leer(), 'seis') ? `Tienes la insignia «${insignia('seis').n}». Con el detector de saltos (9 de 12) y un juego al 60 %, llegas a «${PELDANOS.saber[4].n}» en Saber.` : null,
      }),
      h('div', { class: 'btns', style: { marginTop: '10px' } }, h('button', { class: 'btn', type: 'button', onclick: () => { resp.fill(''); caso = null; t = null; guardado = false; actual = 0; elegir(); } }, 'Analizar otro caso')));
    cuerpo.scrollIntoView?.({ block: 'start', behavior: 'smooth' });
  }
  if (listo() && (caso0 || t0)) preguntas(); else elegir();
}

// ── 3. Cazadores de saltos (Hacer y Saber, fuera de la pantalla) ──
function caza(root, ctx, P, q, a) {
  const C = P.caza, LUG = Object.fromEntries(C.lugares);
  const NOMBRES = ['Dónde', 'La frase', 'El salto', 'Lo que falta', 'Dilo mejor'];
  const misiones = h('div'), coleccion = h('div'), form = h('div', { class: 'panel' }), mias = h('div');
  const nuevo = () => ({ lugar: null, frase: '', salto: null, falta: '', mejor: '' });
  let r = nuevo(), ultimo = null;
  root.append(cabezaAct(a),
    recuadro('atencion', 'Se cazan frases, no personas', C.nota),
    misiones,
    h('section', null, h('h2', null, 'Antes de salir, calienta'),
      h('p', { class: 'muted' }, 'Tres frases inventadas, de las que se oyen a diario. ¿Qué salto dan? Piénsalo y luego destápalo.'),
      h('div', { class: 'grid g3' }, C.practica.map(x => {
        const res = h('div', { hidden: true }, h('p', { class: 'small', style: { margin: '8px 0 4px' } }, h('b', null, `${SALTO[x.salto].de} ${SALTO[x.salto].a}. `), x.por));
        return h('div', { class: 'card practica' }, h('p', { class: 'frase' }, x.frase),
          h('button', { class: 'btn small', type: 'button', 'aria-expanded': 'false', onclick: e => { res.hidden = !res.hidden; e.currentTarget.setAttribute('aria-expanded', String(!res.hidden)); e.currentTarget.textContent = res.hidden ? '¿Qué salto es?' : 'Ocultar'; } }, '¿Qué salto es?'), res);
      }))),
    h('h2', null, 'Anota tu presa'), form, coleccion, mias);

  function estado() {
    const cs = cuaderno.leer().entradas.filter(e => e.tipo === 'caza');
    const tipos = new Set(cs.map(e => e.datos.salto).filter(s => SALTO[s]));
    const ok = [cs.length >= 1, new Set(cs.map(e => e.datos.lugar)).size >= 2, tipos.size >= 2];
    poner(misiones, h('h2', null, 'Tus tres misiones ', h('span', { class: 'muted', style: { fontSize: '1rem' } }, `${Math.min(cs.length, 3)} de 3 presas`)),
      h('div', { class: 'grid g3' }, C.misiones.map((m, i) => h('div', { class: `card mision${ok[i] ? ' ok' : ''}` },
        h('b', null, ok[i] ? '✓ ' : `${i + 1}. `, m.n), h('p', { class: 'small', style: { margin: '4px 0 0' } }, m.d)))));
    poner(coleccion, h('h2', null, 'Tu colección de saltos ', h('span', { class: 'muted', style: { fontSize: '1rem' } }, `${tipos.size} de ${SALTOS.length}`)),
      h('p', { class: 'muted small' }, 'Cada tipo de salto que cazas se enciende. Completar la colección no es obligatorio, pero entrena el ojo.'),
      h('div', { class: 'coleccion' }, SALTOS.map(s => {
        const n = cs.filter(e => e.datos.salto === s.id).length;
        return h('div', { class: `pieza${n ? ' on' : ''}`, title: s.falta }, h('span', null, s.de), h('b', null, s.a), n ? h('i', null, `× ${n}`) : null);
      })));
    poner(mias, ...(cs.length ? [h('h2', null, `Tus presas (${cs.length})`), h('div', { class: 'entradas' }, cs.map(e => h('article', { class: `cu-nota${e.id === ultimo ? ' nueva' : ''}` },
      h('div', { class: 'meta' }, h('span', { class: 'chip' }, LUG[e.datos.lugar] || 'Otro sitio'), h('span', { class: 'muted small' }, fecha(e.fecha))),
      h('p', { class: 'frase-caza' }, `«${corta(e.datos.frase, 180)}»`),
      SALTO[e.datos.salto] ? h('p', { class: 'small', style: { margin: '0 0 4px' } }, h('b', null, 'Salto: '), `${SALTO[e.datos.salto].de} ${SALTO[e.datos.salto].a}`) : null,
      e.datos.mejor ? h('p', { class: 'small', style: { margin: 0 } }, h('b', null, 'Mejor dicho: '), e.datos.mejor) : null)))] : []));
  }

  function pintar(msg = '') {
    const pasosBox = h('div');
    const n = () => { const v = [r.lugar, r.frase.trim(), r.salto, r.falta.trim(), r.mejor.trim()]; let k = 0; while (k < 5 && v[k]) k++; return k; };
    const refrescar = () => poner(pasosBox, pasos(NOMBRES, n()));
    const fr = textarea('Copia la frase tal cual, o resúmela si era larga', r.frase, 'La frase');
    fr.addEventListener('input', () => { r.frase = fr.value; refrescar(); });
    const fa = textarea('¿Qué haría falta para que esa conclusión se sostuviera?', r.falta, 'Lo que falta para cruzar el salto');
    fa.addEventListener('input', () => { r.falta = fa.value; refrescar(); });
    const me = textarea('La misma idea, sin saltar. Por ejemplo: «Hay más diagnósticos; habría que ver cuánto se debe a que ahora se detecta mejor»', r.mejor, 'Cómo lo dirías mejor');
    me.addEventListener('input', () => { r.mejor = me.value; refrescar(); });
    const ayudaSalto = h('div', { 'aria-live': 'polite' });
    const pintarSalto = () => {
      const s = SALTO[r.salto];
      if (!s) { poner(ayudaSalto, r.salto === 'nose' ? h('details', { open: true }, h('summary', { class: 'small' }, 'Repasar los diez saltos'), h('dl', { class: 'datos' }, SALTOS.map(x => [h('dt', null, `${x.de} ${x.a}`), h('dd', null, x.ej)]))) : null); return; }
      const falta = h('span', { class: 'falta', hidden: true }, h('b', null, 'Lo que dice NeuroLab que falta: '), s.falta);
      poner(ayudaSalto, h('div', { class: 'salto-box' }, h('span', { class: 'orilla' }, s.de), h('span', { class: 'vacio', 'aria-hidden': 'true' }, '⤳'), h('span', { class: 'orilla' }, s.a),
        h('span', { class: 'falta' }, h('b', null, 'Un ejemplo típico: '), s.ej), falta),
        h('button', { class: 'btn small', type: 'button', style: { marginTop: '8px' }, onclick: e => { falta.hidden = false; e.currentTarget.remove(); } }, 'Ver lo que falta según NeuroLab'));
    };
    const aviso = h('p', { class: 'small', 'aria-live': 'polite', style: { margin: '8px 0 0', fontWeight: 600 } }, msg);
    const guardar = h('button', { class: 'btn primary', type: 'button', onclick: () => {
      const falta = [!r.lugar && 'dónde lo viste', !r.frase.trim() && 'la frase', !r.salto && 'el salto', !r.falta.trim() && 'lo que falta', !r.mejor.trim() && 'cómo lo dirías mejor'].filter(Boolean);
      if (falta.length) { aviso.textContent = `Te falta: ${falta.join(', ')}.`; return; }
      const s = SALTO[r.salto];
      ultimo = cuaderno.entrada('caza', corta(r.frase.trim(), 70), { ...r, frase: r.frase.trim(), falta: r.falta.trim(), mejor: r.mejor.trim(), resumen: [
        ['Dónde', LUG[r.lugar]], ['La frase', r.frase.trim()], ['El salto', s ? `${s.de} ${s.a}` : 'Sin decidir'], ['Lo que falta', r.falta.trim()], ['Dicho mejor', r.mejor.trim()]] }, a.sube);
      r = nuevo();
      const k = nEntradas(cuaderno.leer(), 'caza');
      pintar(k >= 3 ? '¡Cazado! Ya tienes tres presas. Puedes seguir: la colección tiene diez saltos.' : `¡Cazado! Va a tu cuaderno. Te ${k === 2 ? 'falta una' : `faltan ${3 - k}`} para la insignia «${insignia('cazador').n}».`);
      estado();
    } }, 'Guardar la presa');
    poner(form, pasosBox,
      campo('1. ¿Dónde lo has visto u oído?', null, toggles(C.lugares, { valor: r.lugar, alCambiar: v => { r.lugar = v; refrescar(); } })),
      campo('2. ¿Qué decía?', null, fr),
      campo('3. ¿Qué salto es?', 'El salto es la conclusión que va más allá de lo que se sabe. Si dudas entre dos, elige el que más pese.',
        h('div', null, toggles([...SALTOS.map(s => [s.id, `${s.de} ${s.a}`]), ['nose', 'No estoy seguro']], { valor: r.salto, alCambiar: v => { r.salto = v; pintarSalto(); refrescar(); } }), ayudaSalto)),
      campo('4. ¿Qué falta para cruzarlo?', 'Lo que haría falta saber o comprobar para que la conclusión se sostuviera.', fa),
      campo('5. ¿Cómo lo dirías mejor?', 'Cazar es observar; esto ya es hacer.', me),
      h('div', { class: 'btns' }, guardar), aviso);
    refrescar(); pintarSalto();
    const k = nEntradas(cuaderno.leer(), 'caza');
    if (msg && k) form.append(cierre(a, { nota: k >= 3 ? null : `Una caza, tres situaciones y un paso mínimo te llevan a «${PELDANOS.hacer[3].n}» en Hacer.`, sugerencia: 'Preguntar «¿qué falta para cruzar el salto?» la próxima vez que oiga una conclusión rápida', origen: 'caza' }));
  }
  estado(); pintar();
}

// ── 4. ¿Y tú qué harías? (Hacer y Ser) ──────────────────────
function situaciones(root, ctx, P, q, a) {
  const SEG = 30;
  let reto = false, parar = () => {};
  const cuerpo = h('div');
  root.append(cabezaAct(a), cuerpo);

  function lista() {
    parar();
    const hechas = cuaderno.leer().situaciones, n = Object.keys(hechas).length;
    poner(cuerpo,
      dialogo([['moda', 'Para estas cosas no hace falta pensar: se nota a la legua.'], ['uso', 'Se nota después. Cuando ya lo has dicho.']]),
      h('div', { class: 'panel', style: { marginBottom: '16px' } }, h('b', null, 'Modo reto'),
        h('p', { class: 'small', style: { margin: '4px 0 8px' } }, `${SEG} segundos por situación. En la vida real casi nunca hay más, y con prisa es cuando el automático toma el mando. Tres situaciones con reloj te llevan al último peldaño de Ser.`),
        toggles([['no', 'Sin reloj'], ['si', `Con reloj: ${SEG} segundos`]], { valor: reto ? 'si' : 'no', alCambiar: v => { reto = v === 'si'; } })),
      h('p', { class: 'muted' }, `${n} de ${P.situaciones.length} resueltas.`),
      h('div', { class: 'actividades' }, P.situaciones.map((s, i) => {
        const k = hechas[s.id], ok = k !== undefined && s.opciones[k]?.ok;
        return h('button', { class: 'actividad sit', type: 'button', onclick: () => jugar(i) },
          h('span', { class: 'num', 'aria-hidden': 'true' }, i + 1), h('span', { class: 'chip ambito' }, s.ambito), h('h3', null, s.titulo), h('p', null, s.pregunta),
          h('span', { class: 'pie' }, k !== undefined ? h('span', { class: ok ? 'hecha' : '' }, ok ? '✓ Con la mejor respuesta' : '↻ Resuelta: ¿la repites?') : h('span', null, 'Sin resolver')));
      })),
      n ? cierre(a, { nota: n >= 6 ? `Las seis resueltas: tienes la insignia «${insignia('consejo').n}».` : `Con las seis resueltas ganas la insignia «${insignia('consejo').n}».`, sugerencia: 'Hacer una pregunta antes de contestar la próxima vez que alguien dé un salto delante de mí', origen: 'situaciones' }) : null);
  }

  function jugar(i) {
    parar();
    const s = P.situaciones[i], sal = SALTO[s.salto];
    const ops = shuffle(s.opciones.map((o, k) => ({ ...o, k })));
    const fb = h('div', { 'aria-live': 'polite' });
    const pasosBox = h('div', null, pasos(['Lee la escena', 'Elige', 'Entiende por qué'], 0));
    let tarde = false, resuelta = false;
    const botones = ops.map((o, n) => h('button', { class: 'opt', type: 'button', onclick: () => elegir(o, botones[n]) }, h('span', { class: 'k' }, 'ABCD'[n]), h('span', null, o.t)));
    function elegir(o, b) {
      if (resuelta) return; resuelta = true; parar();
      botones.forEach((x, n) => { x.disabled = true; if (ops[n].ok) x.classList.add('ok'); });
      if (!o.ok) b.classList.add('ko');
      const conReto = reto && !tarde;
      cuaderno.situacion(s.id, o.k, conReto);
      const mejor = ops.find(x => x.ok), otrasMal = ops.filter(x => !x.ok && x !== o);
      poner(pasosBox, pasos(['Lee la escena', 'Elige', 'Entiende por qué'], 2));
      poner(fb,
        h('div', { class: `feedback ${o.ok ? 'ok' : 'ko'}` }, h('b', { class: 't' }, o.ok ? (tarde ? 'Buena respuesta, aunque fuera de tiempo.' : conReto ? '¡Buena respuesta, y a tiempo!' : '¡Buena respuesta!') : 'Pensémoslo otra vez.'), o.fb),
        o.ok ? null : h('div', { class: 'feedback ok' }, h('b', { class: 't' }, 'La que mejor funciona'), mejor.t, h('div', { class: 'small', style: { marginTop: '4px' } }, mejor.fb)),
        otrasMal.length ? h('details', { class: 'otras-op' }, h('summary', null, otrasMal.length === 1 ? 'Por qué la otra no' : 'Por qué las otras no'),
          otrasMal.map(x => h('div', { class: 'small', style: { margin: '8px 0' } }, h('b', null, x.t), h('br'), x.fb))) : null,
        sal ? recuadro('recuerda', `El salto: ${sal.de.toLowerCase()} ${sal.a}`, h('b', null, 'Lo que falta para cruzarlo: '), sal.falta) : null,
        s.ruta && metodo.RUTAS[s.ruta] ? recuadro('aclaracion', `Y la ruta: ${metodo.RUTAS[s.ruta].ruta.toLowerCase()}`, s.ruta_t) : null,
        h('div', { class: 'btns', style: { marginTop: '12px' } },
          i < P.situaciones.length - 1 ? h('button', { class: 'btn primary', type: 'button', onclick: () => jugar(i + 1) }, 'Siguiente situación →') : null,
          h('button', { class: 'btn', type: 'button', onclick: lista }, 'Ver todas'), enlaceFicha(ctx, s.termino) ? h('a', { class: 'btn', href: `#/termino/${encodeURIComponent(s.termino)}` }, `Ficha: ${corta(ctx.byId.get(s.termino).lema, 40)}`) : null),
        cierre(a, { sube: { hacer: 4, crear: 2, ser: conReto ? 3 : 0 }, sugerencia: 'Hacer una pregunta antes de contestar la próxima vez que alguien dé un salto delante de mí', origen: 'situaciones',
          nota: `${Object.keys(cuaderno.leer().situaciones).length} de ${P.situaciones.length} situaciones resueltas.${conReto ? ' Y con reloj: eso cuenta para el eje Ser.' : ''}` }));
      fb.querySelector('.feedback')?.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' });
    }
    const rel = reto ? reloj('El reloj corre.') : null;
    poner(cuerpo, h('div', { class: 'panel' }, pasosBox,
      h('p', { class: 'nivel' }, `Situación ${i + 1} de ${P.situaciones.length} · ${s.ambito}`),
      h('h2', { style: { marginTop: 0 } }, s.titulo),
      h('p', null, s.escena),
      dialogo(s.dialogo),
      rel?.el,
      h('p', { style: { fontWeight: 600, marginTop: '14px' } }, s.pregunta),
      h('div', { class: 'quiz-opts' }, botones), fb));
    setTimeout(() => { if (!resuelta) poner(pasosBox, pasos(['Lee la escena', 'Elige', 'Entiende por qué'], 1)); }, 2500);
    if (rel) parar = cuentaAtras(SEG, rel.i, () => { tarde = true; if (!resuelta) poner(fb, recuadro('atencion', 'Se acabó el tiempo', 'En la vida real, a veces también. Elige igualmente: ¿qué te habría salido?')); });
    cuerpo.scrollIntoView?.({ block: 'start' });
  }
  const k = P.situaciones.findIndex(s => s.id === q.get('s'));
  if (k >= 0) jugar(k); else lista();
  return { destroy: () => parar() };
}

// ── 5. De la etiqueta al ciclo (Creer y crear, y Ser) ───────
const SVGNS = 'http://www.w3.org/2000/svg';
function S(tag, attrs = {}, ...kids) {
  const el = document.createElementNS(SVGNS, tag);
  for (const [k, v] of Object.entries(attrs)) if (v !== null && v !== undefined) el.setAttribute(k, v);
  for (const k of kids.flat()) if (k !== null && k !== undefined) el.append(k);
  return el;
}
function partir(texto, max, n) {
  const lineas = []; let cur = '';
  for (let p of String(texto || '').trim().split(/\s+/).filter(Boolean)) {
    if (p.length > max) p = p.slice(0, max - 1) + '…';
    if (!cur) cur = p; else if (cur.length + 1 + p.length <= max) cur += ' ' + p; else { lineas.push(cur); cur = p; }
  }
  if (cur) lineas.push(cur);
  if (lineas.length > n) { lineas.length = n; lineas[n - 1] = lineas[n - 1].slice(0, max - 1).replace(/[\s,.;:]+$/, '') + '…'; }
  return lineas;
}
const NODO = { situacion: [210, 56, 136, 92], siente: [346, 220, 136, 92], hace: [210, 384, 136, 92], consecuencia: [74, 220, 136, 92], cambia: [210, 220, 120, 104] };
const COLOR_NODO = { situacion: 'var(--n1)', siente: 'var(--e-ser)', hace: 'var(--e-hacer)', consecuencia: 'var(--e-saber)', cambia: 'var(--e-crear)' };
function diagramaCiclo(campos, v, titulo = 'El ciclo') {
  const svg = S('svg', { viewBox: '0 0 420 440', class: 'ciclo-svg', role: 'img', 'aria-label': `${titulo}. ${campos.map(c => `${c.n}: ${(v[c.k] || '').trim() || 'sin rellenar'}`).join('. ')}.` });
  const mid = `m${Math.random().toString(36).slice(2, 8)}`;
  svg.append(S('defs', {}, S('marker', { id: mid, viewBox: '0 0 10 10', refX: 8, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' }, S('path', { d: 'M0,0 L10,5 L0,10 z', class: 'punta' }))));
  for (const d of ['M280 56 Q346 56 346 168', 'M346 272 Q346 384 284 384', 'M140 384 Q74 384 74 272', 'M74 168 Q74 56 136 56']) svg.append(S('path', { d, class: 'arco', 'marker-end': `url(#${mid})` }));
  for (const c of campos) {
    const [cx, cy, w, hh] = NODO[c.k], max = c.k === 'cambia' ? 15 : 18;
    const txt = (v[c.k] || '').trim(), lineas = txt ? partir(txt, max, 3) : ['…'];
    svg.append(S('g', { class: `nodo-c${c.k === 'cambia' ? ' cambio' : ''}${txt ? ' lleno' : ''}`, transform: `translate(${cx - w / 2},${cy - hh / 2})`, style: `--c:${COLOR_NODO[c.k]}` },
      S('rect', { width: w, height: hh, rx: 12 }),
      S('text', { x: 10, y: 20, class: 'lab' }, c.n.toUpperCase()),
      S('text', { x: 10, y: 40, class: txt ? 'txt' : 'txt vacio' }, lineas.map((l, i) => S('tspan', { x: 10, dy: i ? 17 : 0 }, l)))));
  }
  return svg;
}
function ciclo(root, ctx, P, q, a) {
  const C = P.ciclo, NOMBRES = ['La frase', 'El ciclo', 'Lo que cambia'];
  const nuevo = () => ({ frase: '', situacion: '', siente: '', hace: '', consecuencia: '', cambia: '' });
  let r = nuevo(), paso = 0, guardado = false;
  const cuerpo = h('div', { class: 'panel ancho' });
  root.append(cabezaAct(a),
    recuadro('aclaracion', 'Ciclos, no personas', 'Una frase como «es que es TDAH» parece explicarlo todo, pero no dice qué hacer mañana. Un ciclo describe lo que pasa (cuándo, qué se siente, qué se hace y qué viene después) y deja ver dónde se puede cambiar algo. No niega ningún diagnóstico: el diagnóstico sirve en la consulta; el ciclo, en la vida diaria.'),
    cuerpo);
  const completo = () => C.campos.every(c => r[c.k].trim());

  function pintar() {
    let contenido;
    if (paso === 0) {
      const boton = h('button', { class: 'btn primary', type: 'button', disabled: r.frase.trim() ? null : true, onclick: () => { paso = 1; pintar(); } }, 'Convertirla en un ciclo →');
      const inp = h('input', { type: 'text', value: r.frase, placeholder: 'O escribe la tuya: «es que es…», «soy muy… para esto»', 'aria-label': 'Tu frase-etiqueta' });
      inp.addEventListener('input', () => { r.frase = inp.value; boton.disabled = !inp.value.trim(); });
      const E = C.ejemplo;
      contenido = [h('h2', { style: { marginTop: 0 } }, 'Elige una frase-etiqueta'),
        h('p', null, 'Una de esas frases que lo cierran todo con una palabra. Puede ser sobre otra persona o sobre ti.'),
        h('div', { class: 'chips', style: { gap: '8px' } }, C.frases.map(f => h('button', { class: 'chip frase-chip', type: 'button', 'aria-pressed': String(r.frase === f), onclick: () => { r.frase = f; pintar(); } }, f))),
        h('div', { style: { marginTop: '10px' } }, inp),
        h('div', { class: 'btns', style: { marginTop: '12px' } }, boton),
        h('details', { class: 'ejemplo-ciclo' }, h('summary', null, `Ver un ejemplo resuelto: ${E.frase}`),
          h('div', { class: 'ciclo-dos' }, diagramaCiclo(C.campos, E, `Ejemplo: ${E.frase}`),
            h('div', null, h('dl', { class: 'datos' }, C.campos.map(c => [h('dt', null, c.n), h('dd', null, E[c.k])])),
              recuadro('recuerda', 'Lo que se gana', E.gana))))];
    } else if (paso === 1) {
      const zonaDiag = h('div', { class: 'diag-vivo' }, diagramaCiclo(C.campos, r, 'Tu ciclo'));
      const boton = h('button', { class: 'btn primary', type: 'button', disabled: completo() ? null : true, onclick: () => { paso = 2; pintar(); } }, 'Ver mi ciclo →');
      const campos = C.campos.map(c => {
        const ta = h('textarea', { rows: 2, placeholder: c.ph, 'aria-label': `${c.n}: ${c.q}`, class: 'corto' }, r[c.k]);
        ta.addEventListener('input', () => { r[c.k] = ta.value; poner(zonaDiag, diagramaCiclo(C.campos, r, 'Tu ciclo')); boton.disabled = !completo(); });
        return h('div', { class: 'campo', style: { '--c': COLOR_NODO[c.k] } }, h('label', { class: 'lbl-c' }, h('span', { class: 'punto', 'aria-hidden': 'true' }), c.n), h('p', { class: 'ayuda' }, c.q), ta);
      });
      contenido = [h('h2', { style: { marginTop: 0 } }, 'De la frase al ciclo'),
        h('p', null, h('span', { class: 'muted' }, 'Partes de: '), h('b', null, r.frase.trim())),
        h('p', { class: 'small muted' }, 'Piensa en una vez concreta, no en «siempre». El diagrama se rellena mientras escribes.'),
        h('div', { class: 'ciclo-dos' }, h('div', null, campos), zonaDiag),
        h('div', { class: 'btns' }, h('button', { class: 'btn', type: 'button', onclick: () => { paso = 0; pintar(); } }, '← Cambiar la frase'), boton)];
    } else {
      if (!guardado) {
        guardado = true;
        cuaderno.entrada('ciclo', r.frase.trim(), { ...Object.fromEntries(Object.entries(r).map(([k, x]) => [k, x.trim()])),
          resumen: [['Antes', r.frase.trim()], ...C.campos.map(c => [c.n, r[c.k].trim()])] }, a.sube);
      }
      const c0 = cuaderno.leer();
      contenido = [h('h2', { style: { marginTop: 0 } }, 'Tu ciclo'),
        h('div', { class: 'antes-ahora' },
          h('div', null, h('p', { class: 'nivel', style: { color: 'var(--muted)' } }, 'Antes'), h('p', { class: 'grande' }, r.frase.trim())),
          h('div', null, h('p', { class: 'nivel' }, 'Ahora'), h('p', null, `Cuando ${r.situacion.trim().replace(/[.]$/, '')} → ${r.siente.trim().replace(/[.]$/, '')} → ${r.hace.trim().replace(/[.]$/, '')} → ${r.consecuencia.trim().replace(/[.]$/, '')}.`),
            h('p', { style: { margin: 0 } }, h('b', null, 'Lo que lo cambia: '), r.cambia.trim()))),
        h('div', { class: 'diag-final' }, diagramaCiclo(C.campos, r, 'Tu ciclo')),
        recuadro('piensa', 'Ponlo a prueba', 'Un ciclo es una hipótesis, no una sentencia. Prueba el cambio una o dos veces y mira qué pasa: si el ciclo cambia, has encontrado algo; si no, ajusta la situación y vuelve a probar.'),
        cierre(a, { sugerencia: r.cambia.trim(), origen: 'ciclo', nota: tiene(c0, 'ciclo') ? `Tienes la insignia «${insignia('ciclo').n}».` : null }),
        h('div', { class: 'btns', style: { marginTop: '10px' } }, h('button', { class: 'btn', type: 'button', onclick: () => { r = nuevo(); paso = 0; guardado = false; pintar(); } }, 'Otro ciclo'))];
    }
    poner(cuerpo, pasos(NOMBRES, paso), ...contenido.flat(Infinity));
  }
  pintar();
}

// ── 6. Tu relato (Creer y crear, y vuelta a Ser) ────────────
function relato(root, ctx, P, q, a) {
  const R = P.relato, CR = P.creencias;
  const NOMBRES = ['Lo que creo', 'Reencuadrar', 'Recontextualizar', 'Resignificar', 'Crear', 'Otra vez', 'Antes y después'];
  const cuerpo = h('div', { class: 'panel' });
  root.append(cabezaAct(a), cuerpo);
  const c0 = cuaderno.leer();
  let paso = !c0.creencias.antes ? 0 : !c0.relato.reencuadre ? 1 : !c0.relato.contexto ? 2 : !c0.relato.sentido ? 3 : !c0.relato.texto ? 4 : !c0.creencias.despues ? 5 : 6;

  function likert(resp, alCambiar) {
    return h('div', null, CR.map((x, i) => {
      const esc = h('div', { class: 'esc', role: 'group', 'aria-label': `${x.texto} De 1 a 5` }, [1, 2, 3, 4, 5].map(n => h('button', { type: 'button', 'aria-pressed': String(resp[i] === n), 'aria-label': `${n}`, onclick: () => {
        resp[i] = n; esc.querySelectorAll('button').forEach((b, k) => b.setAttribute('aria-pressed', String(k + 1 === n))); alCambiar();
      } }, n)));
      return h('div', { class: 'likert' }, h('span', null, x.texto), esc);
    }), h('p', { class: 'small muted' }, '1: nada de acuerdo · 3: ni sí ni no · 5: muy de acuerdo'));
  }
  const elegida = () => {
    const c = cuaderno.leer(), ant = c.creencias.antes?.resp || [];
    if (c.relato.afirmacion) { const k = CR.findIndex(x => x.id === c.relato.afirmacion); if (k >= 0) return k; }
    let mejor = 0; ant.forEach((v, i) => { if (Math.abs((v ?? 3) - 3) > Math.abs((ant[mejor] ?? 3) - 3)) mejor = i; });
    return mejor;
  };

  function pintar() {
    const c = cuaderno.leer();
    const nav = (ok, f, txt = 'Guardar y seguir →') => h('div', { class: 'btns', style: { marginTop: '12px' } },
      paso > 0 && paso < 6 ? h('button', { class: 'btn', type: 'button', onclick: () => { paso--; pintar(); } }, '← Anterior') : null,
      h('button', { class: 'btn primary', type: 'button', disabled: ok ? null : true, onclick: () => { f(); paso++; pintar(); } }, txt));
    let contenido;
    if (paso === 0 || paso === 5) {
      const resp = Array(CR.length).fill(null);
      const boton = nav(false, () => cuaderno.creencias(paso === 0 ? 'antes' : 'despues', resp.slice()), paso === 0 ? 'Guardar y seguir →' : 'Comparar →');
      const b = boton.querySelector('.primary');
      contenido = [paso === 0 ? dialogo(R.intro) : null,
        h('h2', { style: { marginTop: 0 } }, paso === 0 ? 'Lo que creo sobre los diagnósticos de hoy…' : 'Lo que creo ahora…'),
        h('p', null, paso === 0 ? 'Ocho afirmaciones que se oyen mucho. Sin pensarlo demasiado ni buscar la respuesta correcta, que no la hay: ¿cuánto estás de acuerdo?'
          : 'Las mismas ocho afirmaciones. No mires lo que respondiste antes: contesta desde donde estás ahora.'),
        likert(resp, () => { b.disabled = resp.some(x => x === null); }), boton];
    } else if (paso >= 1 && paso <= 3) {
      const st = R.pasos[paso - 1], i = elegida(), cr = CR[i];
      const ta = textarea(st.ej, c.relato[st.k] || '', st.n);
      const boton = nav(!!(c.relato[st.k] || '').trim(), () => cuaderno.relato({ [st.k]: ta.value.trim(), afirmacion: cr.id }));
      ta.addEventListener('input', () => { boton.querySelector('.primary').disabled = !ta.value.trim(); });
      const sel = paso === 1 ? h('select', { 'aria-label': 'Afirmación con la que trabajar' }, CR.map((x, k) => h('option', { value: k, selected: k === i ? true : null }, `${x.texto} (tu respuesta: ${c.creencias.antes?.resp[k] ?? '—'})`))) : null;
      sel?.addEventListener('change', () => { cuaderno.relato({ afirmacion: CR[+sel.value].id }); pintar(); });
      const nota = h('div');
      if (paso === 2) ctx.contenido().then(m => { const x = m.get(cr.termino); if (x?.sabias_que) poner(nota, recuadro('sabias', null, inline(x.sabias_que))); }).catch(() => {});
      contenido = [h('h2', { style: { marginTop: 0 } }, st.n), h('p', null, h('b', null, 'Trabajas con: '), `«${cr.texto}»`, ctx.byId.get(cr.termino) ? [' · ', enlaceFicha(ctx, cr.termino, 'abrir la ficha')] : null), sel,
        h('p', { style: { marginTop: '12px' } }, st.q), nota, ta, boton];
    } else if (paso === 4) {
      const ta = textarea(R.crear.ph, c.relato.texto || '', 'Tu relato');
      const bol = h('input', { type: 'text', value: c.relato.bolsillo || '', placeholder: R.crear.bolsillo_ej, 'aria-label': R.crear.bolsillo });
      const boton = nav(!!(c.relato.texto || '').trim(), () => cuaderno.relato({ texto: ta.value.trim(), bolsillo: bol.value.trim() }));
      ta.addEventListener('input', () => { boton.querySelector('.primary').disabled = !ta.value.trim(); });
      contenido = [h('h2', { style: { marginTop: 0 } }, 'Crear: tu relato'), h('p', null, R.crear.q),
        h('div', { class: 'card', style: { margin: '8px 0' } }, h('p', { class: 'small', style: { margin: 0 } }, h('b', null, 'Lo que has ido anotando. '),
          `Reencuadre: ${c.relato.reencuadre || '—'} · Contexto: ${c.relato.contexto || '—'} · Sentido: ${c.relato.sentido || '—'}`)),
        campo('Tu relato', null, ta), campo(R.crear.bolsillo, null, bol), boton];
    } else {
      const ant = c.creencias.antes?.resp || [], des = c.creencias.despues?.resp || [];
      const movidas = CR.filter((x, i) => ant[i] !== des[i]).length;
      const txt = () => ['LO QUE CREO SOBRE LAS ETIQUETAS', fecha(new Date().toISOString()), '', c.relato.texto || '', c.relato.bolsillo ? `\n${c.relato.bolsillo}` : '', '',
        ...CR.map((x, i) => `${x.texto} · antes ${ant[i] ?? '—'}, después ${des[i] ?? '—'}`), '', 'NeuroLab · https://oasa10.github.io/NeuroLab/'].join('\n');
      contenido = [h('h2', { style: { marginTop: 0 } }, 'Antes y después'),
        h('p', null, movidas ? `Has movido ${movidas} de ${CR.length} respuestas. Pensar a veces cambia lo que crees.` : 'No has movido ninguna respuesta. También vale: confirmar una creencia después de examinarla no es lo mismo que no haberla mirado nunca.'),
        h('div', { class: 'table-wrap' }, h('table', null, h('thead', null, h('tr', null, h('th', { scope: 'col' }, 'Afirmación'), h('th', { scope: 'col', class: 'num' }, 'Antes'), h('th', { scope: 'col', class: 'num' }, 'Después'), h('th', { scope: 'col', class: 'num' }, 'Cambio'))),
          h('tbody', null, CR.map((x, i) => {
            const d = (des[i] ?? 0) - (ant[i] ?? 0);
            return h('tr', null, h('td', null, ctx.byId.get(x.termino) ? h('a', { href: `#/termino/${encodeURIComponent(x.termino)}` }, x.texto) : x.texto), h('td', { class: 'num' }, ant[i] ?? '—'), h('td', { class: 'num' }, des[i] ?? '—'),
              h('td', { class: 'num', style: { fontWeight: 700, color: d ? 'var(--ink)' : 'var(--muted)' } }, d > 0 ? `↑ ${d}` : d < 0 ? `↓ ${-d}` : '='));
          })))),
        h('div', { class: 'tarjeta-relato' },
          h('p', { class: 'nivel', style: { color: 'var(--e-crear)' } }, 'Lo que creo ahora'),
          h('p', { class: 'texto' }, c.relato.texto),
          c.relato.bolsillo ? h('p', { class: 'bolsillo' }, c.relato.bolsillo) : null),
        recuadro('piensa', 'Vuelve dentro de un mes', 'Los relatos se revisan. Repite «Lo que creo» más adelante y mira si tu historia sigue siendo la misma.'),
        h('div', { class: 'btns', style: { marginTop: '10px' } },
          h('button', { class: 'btn', type: 'button', onclick: () => descargar('lo-que-creo-neurolab.txt', txt()) }, 'Descargar'),
          h('button', { class: 'btn', type: 'button', onclick: () => print() }, 'Imprimir o guardar en PDF'),
          h('button', { class: 'btn', type: 'button', onclick: () => { paso = 5; pintar(); } }, 'Repetir «Lo que creo»'),
          h('button', { class: 'btn', type: 'button', onclick: () => { paso = 1; pintar(); } }, 'Revisar los pasos')),
        cierre(a, { sube: { crear: 6 }, sugerencia: c.relato.sentido || '', origen: 'relato', nota: `Cada paso de tu relato suma en Creer y crear. Ahora estás en «${PELDANOS.crear[Math.max(0, cuaderno.peldano('crear'))].n}».` })];
    }
    poner(cuerpo, pasos(NOMBRES, paso), ...contenido.flat(Infinity).filter(Boolean));
  }
  pintar();
}

// ── 7. Tu paso mínimo y tu retorno (Hacer y Creer y crear) ──
function paso(root, ctx, P, q, a) {
  const S0 = P.paso.sugerencias;
  const origen = q.get('o') || '';
  let sugerencia = q.get('s') || '', msg = '', abiertos = new Set(), cambiarRuta = false;
  const cuerpo = h('div');
  root.append(cabezaAct(a), cuerpo);

  function pintar() {
    const c = cuaderno.leer(), ruta = cuaderno.llegadaHoy();
    const amv = c.entradas.filter(e => e.tipo === 'amv'), pend = amv.filter(e => !e.revision), hechos = amv.filter(e => e.revision);
    const etapa = !ruta ? 0 : !amv.length ? 1 : pend.length ? 2 : 3;
    const sugs = S0[ruta] || S0.ninguna;
    const r = ruta ? metodo.RUTAS[ruta] : null;
    poner(cuerpo,
      h('div', { class: 'panel ancho' }, pasos(['Cómo llegas', 'Elige un paso', 'Hazlo fuera', 'Cuenta qué pasó'], etapa),
        !ruta || cambiarRuta ? metodo.preguntaEntrada({ compacta: true, titulo: 'Antes de elegir: ¿cómo llegas hoy?', alElegir: () => { cambiarRuta = false; pintar(); } })
          : h('p', { class: 'ruta-hoy-linea', style: { '--oc': COLOR_RUTA[ruta] } }, h('span', { class: 'punto', 'aria-hidden': 'true' }), 'Hoy llegas ', h('b', null, r.opcion.toLowerCase()), ` (${r.ruta.toLowerCase()}). `,
            h('button', { class: 'linkbtn', type: 'button', onclick: () => { cambiarRuta = true; pintar(); } }, 'Cambiar')),
        h('h2', null, 'Elige un paso pequeño'),
        h('p', { class: 'muted' }, r ? `Ideas para hoy, pensadas para la ${r.ruta.toLowerCase()}. ${ruta === 'C' ? 'Uno solo, y que no consista en leer más.' : ruta === 'B' ? 'Que quepa en cinco minutos.' : 'Algo que pongas a prueba fuera de aquí.'}` : 'Algunas ideas. Cuando digas cómo llegas, se ajustarán a tu día.',
          ' Pulsa una para usarla o escribe la tuya.'),
        h('div', { class: 'chips sugs' }, sugs.map(s => h('button', { class: 'chip', type: 'button', 'aria-pressed': String(sugerencia === s), onclick: () => { sugerencia = s; msg = ''; pintar(); document.querySelector('.amv input')?.focus({ preventScroll: true }); } }, s))),
        msg ? h('p', { class: 'feedback ok', role: 'status' }, msg, ' ', h('a', { href: '#/cuaderno' }, 'Verlo en tu cuaderno'), '.') : null,
        metodo.pasoMinimo({ sugerencia, titulo: 'Tu paso mínimo', origen: origen || (ruta ? `ruta ${ruta}` : 'pensar'), alGuardar: () => {
          sugerencia = ''; msg = 'Anotado. Ahora toca lo importante: hacerlo fuera de la pantalla. Cuando lo hayas hecho, vuelve aquí y cuenta qué pasó.'; pintar();
        } }),
        recuadro('piensa', 'Por qué tan pequeño', 'Un paso mínimo antes que diez lecturas. Lo pequeño se hace, y lo que se hace se puede revisar. Si sale bien, das el siguiente; si no, has aprendido algo barato.'),
        metodo.transversales()),
      h('h2', null, 'Pendientes de retorno ', h('span', { class: 'muted', style: { fontSize: '1rem' } }, pend.length ? `${pend.length}` : '')),
      pend.length ? h('div', { class: 'entradas' }, pend.map(e => tarjetaPaso(e))) : h('p', { class: 'muted' }, amv.length ? 'Ninguno: has vuelto a contar qué pasó con todos tus pasos. Bien hecho.' : 'Aún no has guardado ningún paso. Cuando guardes uno, aparecerá aquí hasta que cuentes qué pasó.'),
      hechos.length ? h('section', null, h('h2', null, 'Con retorno'), h('div', { class: 'entradas' }, hechos.map(e => tarjetaPaso(e)))) : null,
      cierre(a, { sinPaso: true, nota: hechos.length ? `Has contado qué pasó en ${plural(hechos.length, 'paso', 'pasos')}: eso es lo que convierte la práctica en experiencia (y la insignia «${insignia('revision').n}»).`
        : `Guardar un paso te da la insignia «${insignia('paso').n}». Contar qué pasó, «${insignia('revision').n}»: ahí está el último peldaño del eje Hacer.` }));
  }

  function tarjetaPaso(e) {
    const d = e.datos || {};
    const abierto = abiertos.has(e.id);
    const ta = h('textarea', { 'aria-label': '¿Qué cambió fuera de tu explicación?', placeholder: 'Lo que hiciste, lo que viste y lo que cambió fuera de lo que te cuentas. Si no lo hiciste, también vale: ¿qué lo impidió?' });
    const dec = toggles(P.paso.decisiones, { valor: null });
    return h('article', { class: 'cu-nota' },
      h('div', { class: 'meta' }, h('span', { class: 'chip chip-e', 'data-eje': 'hacer' }, 'Paso mínimo'), h('span', { class: 'muted small' }, fecha(e.fecha))),
      h('h3', null, `Haré ${d.hare || e.titulo}`),
      h('p', { class: 'small', style: { margin: '0 0 6px' } }, [d.dia && `El día ${d.dia}`, d.durante && `durante ${d.durante}`, d.comprobare && `y comprobaré ${d.comprobare}`].filter(Boolean).join(', ') || null),
      d.rev ? h('p', { class: 'small muted', style: { margin: '0 0 6px' } }, h('b', null, 'Qué cambiaría fuera: '), d.rev) : null,
      e.revision ? recuadro('recuerda', `Lo que pasó (${fecha(e.revision.fecha)})`, e.revision.texto) : null,
      abierto ? h('div', { class: 'revisar' },
        h('label', { class: 'small', style: { fontWeight: 600, display: 'block', marginBottom: '4px' } }, metodo.REV.replace('cambiará', 'ha cambiado').replace('funciona', 'ha funcionado')), ta,
        h('p', { class: 'small', style: { margin: '8px 0 0' } }, '¿Y ahora qué decides?'), dec,
        h('div', { class: 'btns', style: { marginTop: '6px' } },
          h('button', { class: 'btn small primary', type: 'button', onclick: () => {
            const t = ta.value.trim(); if (!t) { ta.focus(); return; }
            const v = dec.valor(), l = P.paso.decisiones.find(x => x[0] === v)?.[1];
            abiertos.delete(e.id); cuaderno.revisar(e.id, l ? `${t} (Decido: ${l.toLowerCase()}.)` : t); msg = ''; pintar();
          } }, 'Guardar el retorno'),
          h('button', { class: 'btn small', type: 'button', onclick: () => { abiertos.delete(e.id); pintar(); } }, 'Cancelar')))
        : h('div', { class: 'btns' }, h('button', { class: 'btn small', type: 'button', onclick: () => { abiertos.add(e.id); pintar(); setTimeout(() => document.querySelector('.revisar textarea')?.focus(), 0); } }, e.revision ? 'Contar algo más' : '¿Qué pasó?')));
  }
  pintar();
}
