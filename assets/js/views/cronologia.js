import { h, FAMILIAS, FAM_CORTA, FASES, USOS, anio, tip, tipTerm, famColor, famVar, marcaEstado, plural, cabeza, inline, corta, poner } from '../lib.js';
import * as cuaderno from '../cuaderno.js';

// Viajar: una máquina del tiempo desde 1798 hasta hoy. Cada término en su año, una fila por familia y los hitos arriba.
const DESDE = 1790;
const HOY = new Date().getFullYear();
const FIN = HOY + 4;

const TIPOS_HITO = { clasificacion: 'Clasificación', ciencia: 'Ciencia', movimiento: 'Movimiento', ley: 'Ley o norma', sociedad: 'Sociedad' };
const tipoHito = k => (TIPOS_HITO[k] ? k : 'sociedad');
const colorHito = k => `var(--h-${tipoHito(k)})`;
const AMBITOS = { 'españa': 'España', internacional: 'Internacional' };
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const fechaHito = x => (x.mes >= 1 && x.mes <= 12 ? `${MESES[x.mes - 1]} de ${anio(x.anio)}` : anio(x.anio));

// Viaje guiado: una parada por fase, con lo que pasaba en cada una (hechos comprobados)
const ETAPAS = [
  { d: [DESDE, 1905], t: 'En 1798, el médico escocés Alexander Crichton describe en *An inquiry into the nature and origin of mental derangement* una «inquietud mental» que impide sostener la atención. No hay manuales ni diagnósticos oficiales: hay observaciones sueltas que mucho después se leerán como precedentes.' },
  { d: [1897, 1983], t: 'En 1902, George Still describe en *The Lancet* a niños con una incapacidad anormal para mantener la atención. En 1911, Eugen Bleuler difunde «autismo», palabra que había acuñado un año antes para un síntoma de la esquizofrenia. Grunya Sukhareva retrata a seis niños en 1925; Leo Kanner, a once en 1943, y Hans Asperger, a cuatro en 1944. Son retratos clínicos, aún sin criterios comunes.' },
  { d: [1977, 1996], t: 'El DSM-III (1980) estrena listas de criterios para que dos profesionales coincidan: el autismo infantil tiene categoría propia y aparece el trastorno por déficit de atención, con o sin hiperactividad. En 1981, Lorna Wing populariza en inglés el «síndrome de Asperger». En España, la LOGSE (1990) habla de alumnado con necesidades educativas especiales y pide atenderlo según los principios de normalización e integración escolar.' },
  { d: [1991, 2015], t: 'El DSM-IV (1994) incorpora el trastorno de Asperger y divide el TDAH en tres subtipos. A finales de los noventa, Judy Singer y Harvey Blume ponen por escrito «neurodiversidad» (hoy se discute cuánto le debe la idea a las comunidades autistas en línea). En España, la LOE (2006) reúne como alumnado con necesidad específica de apoyo educativo a quien requiere una atención diferente a la ordinaria, también por altas capacidades.' },
  { d: [2010, HOY + 2], t: 'El DSM-5 (2013) reúne el autismo en un solo espectro, retira el Asperger como diagnóstico aparte y permite diagnosticar a la vez autismo y TDAH. La CIE-11 de la OMS, aprobada en 2019, está en vigor desde 2022. En España, la LOMLOE (2020) reforma la LOE; su lista de necesidades específicas incluye, entre otras, el retraso madurativo, los trastornos del lenguaje, de atención o de aprendizaje y la vulnerabilidad socioeducativa.' },
];

const VISTAS = [{ k: 'todo', l: 'Todo', d: [DESDE, FIN] }, ...FASES.map((f, i) => ({ k: `f${f.n}`, l: f.corto, nombre: f.nombre, d: ETAPAS[i].d }))];

// Rótulo corto para los gráficos: «TDAH (trastorno por…)» → «TDAH»
const rotulo = s => {
  const m = /^(.*?)\s*\(([^)]*)\)\s*$/.exec(s || '');
  if (!m) return s;
  return /^[A-ZÁÉÍÓÚÑ0-9-]{2,8}$/.test(m[2]) && m[1].length > 22 ? m[2] : m[1];
};

export function render(root, ctx, parts, q) {
  document.title = 'Viajar · NeuroLab';
  const d3 = window.d3;
  const enlace = t => h('a', { href: `#/termino/${encodeURIComponent(t.id)}` }, t.lema);
  const foco = q.get('t') ? ctx.byId.get(q.get('t')) : null;
  const datos = ctx.cronologico.filter(t => t.anio >= DESDE && t.anio <= FIN);
  const antiguos = ctx.cronologico.filter(t => t.anio < DESDE);
  const sinFecha = ctx.terms.filter(t => t.anio === null);
  const hitosTodos = (ctx.hitos || []).filter(x => x.anio !== null && x.anio >= DESDE && x.anio <= FIN)
    .sort((a, b) => a.anio - b.anio || (a.mes || 0) - (b.mes || 0));
  const nEsp = hitosTodos.filter(x => x.ambito === 'españa').length;
  let ambito = 'todos';
  const hitosVis = () => hitosTodos.filter(x => ambito === 'todos' || x.ambito === ambito);
  // Filas: las ocho familias, en el orden de lib.FAMILIAS (y «Otras» si alguna ficha trae una familia desconocida)
  const filas = FAMILIAS.concat(datos.some(t => !FAMILIAS.includes(t.familia)) ? ['Otras'] : []);
  const fila = t => (FAMILIAS.includes(t.familia) ? t.familia : 'Otras');
  const colorFila = f => (f === 'Otras' ? 'var(--line-strong)' : famVar(f));

  let zoom, svg, xBase, W, M, LANE, LBL, TOP, Hh, zx, pintar = null;

  // Controles
  const botones = VISTAS.map(v => h('button', { class: 'btn small', type: 'button', 'aria-pressed': 'false', title: v.nombre ? `${v.nombre} (${v.l})` : 'De 1798 a hoy', onclick: () => irA(v.d, v.k) },
    v.l, v.nombre ? h('span', { class: 'tl-nombre' }, ` · ${v.nombre}`) : null));
  const verLista = h('button', { class: 'btn small', type: 'button', 'aria-pressed': 'false', onclick: () => alternarLista() }, 'Ver como lista');
  // Filtro de ámbito: dos juegos de botones (junto a la máquina y junto a la lista) que se mueven a la vez
  const OPC_AMBITO = [['todos', 'Todos'], ['españa', `España (${nEsp})`], ['internacional', `Internacional (${hitosTodos.length - nEsp})`]];
  const grupos = [];
  const filtroAmbito = () => {
    const g = h('div', { class: 'toggles', role: 'group', 'aria-label': 'Filtrar los hitos por ámbito' },
      OPC_AMBITO.map(([v, l]) => h('button', { class: 'toggle', type: 'button', 'data-amb': v, 'aria-pressed': String(v === ambito),
        onclick: () => { ambito = v; grupos.forEach(x => x.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.amb === ambito)))); pintarHitos(); if (pintar) pintar(); } }, l)));
    grupos.push(g);
    return g;
  };
  const caja = h('div', { class: 'viz tl-viz' });
  const lista = h('div', { hidden: true });
  const listaHitos = h('ul', { class: 'hitos-list nl-hitos' });
  const cuentaHitos = h('p', { class: 'muted', 'aria-live': 'polite' });

  // Viaje guiado
  const vEtapa = h('div', { class: 'etapa', 'aria-hidden': 'true' }, '◷');
  const vTexto = h('div', null, h('b', null, '¿Te subes al viaje guiado?'),
    h('div', { class: 'small' }, `Cinco paradas, de 1798 a hoy, una por cada época: qué se nombraba, quién lo hacía y para qué. Tú decides cuándo seguir.`));
  const vBtns = h('div', { class: 'btns' });
  const viaje = h('div', { class: 'viaje', 'aria-live': 'polite' }, vEtapa, vTexto, vBtns);
  const parada = i => {
    const e = ETAPAS[i], f = FASES[i];
    const ts = datos.filter(t => t.fase === f.n).sort((p, r) => (ctx.vecinos.get(r.id)?.size || 0) - (ctx.vecinos.get(p.id)?.size || 0));
    const hs = hitosTodos.filter(x => x.anio >= f.desde && x.anio <= f.hasta);
    vEtapa.textContent = f.corto;
    poner(vTexto, h('b', null, `Parada ${i + 1} de ${ETAPAS.length} · ${f.nombre}`), h('div', null, inline(e.t)),
      ts.length || hs.length ? h('div', { class: 'small', style: { marginTop: '4px' } },
        ts.length ? [`En esta época nacen ${plural(ts.length, 'término', 'términos')} de NeuroLab. Los más conectados: `,
          ts.slice(0, 3).map((t, k) => [k ? (k === ts.slice(0, 3).length - 1 ? ' y ' : ', ') : '', enlace(t)]), '. '] : '',
        hs.length ? `En la máquina verás ${plural(hs.length, 'hito', 'hitos')} de esta época.` : '') : null);
    poner(vBtns,
      i > 0 ? h('button', { class: 'btn small', type: 'button', onclick: () => parada(i - 1) }, '← Anterior') : null,
      i < ETAPAS.length - 1 ? h('button', { class: 'btn small primary', type: 'button', onclick: () => parada(i + 1) }, 'Siguiente →')
        : h('button', { class: 'btn small primary', type: 'button', onclick: fin }, 'Bajar del tren'));
    irA(e.d, VISTAS[i + 1].k);
    if (i === ETAPAS.length - 1) cuaderno.vista('viaje');
  };
  const fin = () => {
    vEtapa.textContent = '✓';
    poner(vTexto, h('b', null, 'Has llegado al presente.'),
      h('div', { class: 'small' }, 'Más de dos siglos en cinco paradas: las palabras cambian, y con ellas lo que permiten hacer. Ahora te toca a ti: elige una etiqueta y descríbela como un ciclo, no como una persona.'));
    poner(vBtns, h('button', { class: 'btn small', type: 'button', onclick: () => parada(0) }, 'Repetir el viaje'),
      h('a', { class: 'btn small primary', href: '#/pensar/ciclo' }, 'De la etiqueta al ciclo'), h('a', { class: 'btn small', href: '#/pensar' }, 'Pensar y aplicar'));
    cuaderno.vista('viaje');
    irA(VISTAS[0].d, 'todo');
  };
  vBtns.append(h('button', { class: 'btn small primary', type: 'button', onclick: () => parada(0) }, 'Empezar el viaje'));

  const avisoFoco = q.get('t') ? (foco
    ? h('p', { class: 'note' }, foco.anio !== null && foco.anio >= DESDE
      ? ['Estás viendo ', h('b', null, foco.lema), `, de ${anio(foco.anio)}, resaltado en su fila. `, h('a', { href: `#/termino/${encodeURIComponent(foco.id)}` }, 'Volver a su ficha'), ' · ', h('a', { href: '#/viajar' }, 'Ver todo el viaje')]
      : [h('b', null, foco.lema), foco.anio === null ? ' no tiene una fecha fiable, así que no sube a la máquina. ' : ` es anterior a ${DESDE} y queda fuera de la máquina. `, h('a', { href: `#/termino/${encodeURIComponent(foco.id)}` }, 'Volver a su ficha')])
    : h('p', { class: 'note warn' }, 'No encuentro ese término. Te enseño el viaje completo.')) : null;

  poner(root,
    cabeza(1, 'Viajar', `Una máquina del tiempo de 1798 a hoy con ${plural(datos.length, 'término', 'términos')}: cada uno está en el año de la obra, la persona o el hito que lo fija, y cada fila es una familia. Arriba, los hitos que cambiaron cómo se nombra, se diagnostica o se apoya. Arrastra para moverte, acércate con la rueda o los dedos, o súbete al viaje guiado.`),
    avisoFoco,
    viaje,
    h('div', { class: 'tl-tools tl-fases', role: 'group', 'aria-label': 'Ir a una época' }, botones, h('span', { style: { flex: 1 } }), verLista),
    hitosTodos.length ? h('div', { class: 'tl-filtro' }, h('span', { class: 'small muted' }, 'Hitos:'), filtroAmbito()) : null,
    hitosTodos.length ? h('div', { class: 'legend', 'aria-hidden': 'true' },
      Object.entries(TIPOS_HITO).map(([k, l]) => h('span', null, h('i', { class: 'rombo', style: { '--c': colorHito(k) } }), l)),
      h('span', null, h('i', { class: 'rombo', style: { '--c': 'var(--muted)' } }), 'Internacional'),
      h('span', null, h('i', { class: 'rombo hueco', style: { '--c': 'var(--muted)' } }), 'España')) : null,
    caja, lista,
    antiguos.length || sinFecha.length ? h('p', { class: 'small muted' },
      antiguos.length ? [`${plural(antiguos.length, 'término es anterior', 'términos son anteriores')} a ${DESDE} y no sube${antiguos.length === 1 ? '' : 'n'} a la máquina (`, antiguos.map((t, i) => [i ? ', ' : '', enlace(t)]), '). '] : '',
      sinFecha.length ? `${plural(sinFecha.length, 'término no tiene', 'términos no tienen')} una fecha fiable y no aparece${sinFecha.length === 1 ? '' : 'n'} aquí.` : '') : null,
    h('h2', null, 'Los hitos del camino'),
    h('p', { class: 'muted' }, 'Manuales, leyes, estudios y movimientos que cambiaron el uso de las etiquetas, cada uno con su fuente. Pulsa un término para ver su ficha.'),
    hitosTodos.length ? h('div', { class: 'tl-filtro' }, h('span', { class: 'small muted' }, 'Mostrar:'), filtroAmbito()) : null,
    cuentaHitos,
    listaHitos,
  );

  function pintarHitos() {
    const hs = hitosVis();
    if (!hitosTodos.length) {
      cuentaHitos.textContent = 'Los hitos todavía están en camino: aparecerán aquí, con su fuente, en cuanto estén verificados.';
      listaHitos.replaceChildren();
      return;
    }
    cuentaHitos.textContent = ambito === 'todos'
      ? `${plural(hs.length, 'hito', 'hitos')}, ${nEsp} de España.`
      : `${plural(hs.length, 'hito', 'hitos')} ${ambito === 'españa' ? 'de España' : 'internacionales'}.`;
    listaHitos.replaceChildren(...hs.map(x => h('li', null,
      h('span', { class: 'y' }, anio(x.anio), x.mes >= 1 && x.mes <= 12 ? h('small', null, MESES[x.mes - 1]) : null),
      h('div', null,
        h('b', null, x.titulo), ' ', marcaEstado(x.estado),
        x.texto ? h('p', { class: 'small', style: { margin: '2px 0 6px' } }, inline(x.texto)) : null,
        h('div', { class: 'chips' },
          h('span', { class: 'chip' }, h('span', { class: 'dot rombo', style: { '--c': colorHito(x.tipo) } }), TIPOS_HITO[tipoHito(x.tipo)]),
          h('span', { class: 'chip' }, AMBITOS[x.ambito] || 'Internacional'),
          (x.terminos || []).map(id => ctx.byId.get(id)).filter(Boolean).map(t => h('a', { class: 'chip', href: `#/termino/${encodeURIComponent(t.id)}`, title: t.lema }, rotulo(t.lema)))),
        x.fuente?.url ? h('div', { class: 'small', style: { marginTop: '4px' } }, 'Fuente: ', h('a', { href: x.fuente.url, rel: 'noopener', target: '_blank' }, x.fuente.titulo || 'Fuente')) : null))));
  }
  pintarHitos();

  // Lista accesible: la máquina como tabla
  lista.append(h('div', { class: 'table-wrap' }, h('table', null,
    h('caption', { class: 'sr-only' }, 'Términos por año'),
    h('thead', null, h('tr', null, ['Año', 'Término', 'Familia', 'Usos', 'Obra o hito'].map(x => h('th', { scope: 'col' }, x)))),
    h('tbody', null, datos.map(t => h('tr', { class: foco && foco.id === t.id ? 'nl-foco' : null }, h('td', { class: 'num' }, anio(t.anio)),
      h('td', null, enlace(t)), h('td', null, t.familia || '—'),
      h('td', null, t.usos.map(u => USOS[u]?.nombre).filter(Boolean).join(', ') || '—'), h('td', null, t.obra || '—')))))));
  function alternarLista() {
    const on = lista.hidden;
    lista.hidden = !on; caja.hidden = on;
    verLista.setAttribute('aria-pressed', String(on)); verLista.textContent = on ? 'Ver como gráfico' : 'Ver como lista';
  }

  if (!datos.length && !hitosTodos.length) {
    caja.append(h('p', { class: 'empty' }, 'Todavía no hay términos con fecha para subir a la máquina.'));
    botones.forEach(b => { b.disabled = true; });
    return { destroy: () => tip.hide() };
  }

  // Gráfico
  let dominio = foco && foco.anio >= DESDE && foco.anio <= FIN ? [foco.anio - 15, foco.anio + 15] : (root.clientWidth < 600 ? [1895, FIN] : VISTAS[0].d);
  const FILAS_H = 4, PASO_H = 12;

  function dibujar() {
    caja.replaceChildren();
    W = Math.max(300, caja.clientWidth - 28);
    const movil = W < 600;
    M = { l: movil ? 4 : 150, r: 10 };
    LANE = movil ? 46 : 50; LBL = movil ? 14 : 0;
    TOP = 10 + FILAS_H * PASO_H + 22;
    Hh = TOP + filas.length * LANE + 26;
    const ultimo = datos.at(-1)?.anio ?? HOY;
    svg = d3.select(caja).append('svg').attr('viewBox', `0 0 ${W} ${Hh}`).attr('role', 'img')
      .attr('aria-label', `Máquina del tiempo con ${plural(datos.length, 'término', 'términos')} entre ${datos[0]?.anio ?? DESDE} y ${ultimo}, en una fila por familia, con las cinco épocas sombreadas${hitosTodos.length ? ` y ${plural(hitosTodos.length, 'hito', 'hitos')} arriba` : ''}. Hay una versión en lista.`);
    xBase = d3.scaleLinear().domain(VISTAS[0].d).range([M.l, W - M.r]);
    const clipId = `tlclip${Math.random().toString(36).slice(2, 7)}`;
    svg.append('defs').append('clipPath').attr('id', clipId).append('rect').attr('x', M.l).attr('y', 0).attr('width', W - M.l - M.r).attr('height', Hh);
    const fases = svg.append('g').attr('clip-path', `url(#${clipId})`);
    const rejilla = svg.append('g').attr('class', 'grid');
    const ejes = svg.append('g').attr('class', 'axis').attr('transform', `translate(0,${Hh - 22})`);
    const capaHitos = svg.append('g').attr('clip-path', `url(#${clipId})`);
    const capa = svg.append('g').attr('clip-path', `url(#${clipId})`);
    const lab = svg.append('g');
    filas.forEach((f, i) => {
      const y0 = TOP + i * LANE;
      svg.append('line').attr('x1', M.l).attr('x2', W - M.r).attr('y1', y0).attr('y2', y0).style('stroke', 'var(--line)');
      if (movil) {
        const g = lab.append('g').attr('transform', `translate(${M.l + 4},${y0 + 9})`);
        g.append('circle').attr('r', 3.5).attr('cx', 3).style('fill', colorFila(f));
        g.append('text').attr('x', 11).attr('dy', '0.35em').attr('class', 'lbl').style('font-size', '10.5px').text(f === 'Otras' ? 'Otras familias' : FAM_CORTA[f]);
      } else {
        const g = lab.append('g').attr('transform', `translate(4,${y0 + LANE / 2})`);
        g.append('circle').attr('r', 5).attr('cx', 5).style('fill', colorFila(f));
        g.append('text').attr('x', 15).attr('dy', '0.35em').attr('class', 'lbl-strong').text(f === 'Otras' ? 'Otras familias' : FAM_CORTA[f]).append('title').text(f);
      }
    });
    if (hitosTodos.length && !movil) svg.append('text').attr('x', 4).attr('y', 10 + PASO_H * 1.5).attr('dy', '0.35em').attr('class', 'lbl').style('fill', 'var(--muted)').text('Hitos ◆');

    zx = xBase.copy();
    const fasesVis = FASES.map(f => ({ ...f, a: Math.max(f.desde, DESDE), b: Math.min(f.hasta + 1, FIN) }));
    const xh = d => d.anio + (d.mes >= 1 && d.mes <= 12 ? (d.mes - 1) / 12 : 0);
    pintar = function () {
      const x = zx;
      // épocas
      fases.selectAll('rect').data(fasesVis).join('rect')
        .attr('x', f => x(f.a)).attr('width', f => Math.max(0, x(f.b) - x(f.a)))
        .attr('y', 0).attr('height', Hh - 22).style('fill', (f, i) => (i % 2 ? 'var(--surface-2)' : 'transparent')).attr('opacity', 0.9);
      fases.selectAll('line').data(fasesVis.slice(1)).join('line').attr('x1', f => x(f.a)).attr('x2', f => x(f.a)).attr('y1', TOP - 18).attr('y2', Hh - 22)
        .style('stroke', 'var(--line-strong)').attr('stroke-dasharray', '3 3');
      fases.selectAll('text').data(fasesVis).join('text')
        .attr('x', f => Math.max(M.l + 4, x(f.a) + 6)).attr('y', TOP - 6).attr('class', 'lbl').style('fill', 'var(--muted)').style('font-size', '11px')
        .text(f => {
          const w = Math.min(W - M.r, x(f.b)) - Math.max(M.l, x(f.a));
          const largo = `${f.corto} · ${f.nombre}`;
          return w > largo.length * 6 + 14 ? largo : w > f.corto.length * 6 + 12 ? f.corto : '';
        });
      // eje
      const ticks = Math.max(3, Math.floor((W - M.l) / 80));
      ejes.call(d3.axisBottom(x).ticks(ticks).tickFormat(d3.format('d')).tickSizeOuter(0));
      rejilla.selectAll('line').data(x.ticks(ticks)).join('line').attr('x1', d => x(d)).attr('x2', d => x(d)).attr('y1', TOP).attr('y2', Hh - 22);
      // hitos: en cuatro filas, cada uno en la primera donde no pisa al anterior
      const hs = hitosVis();
      const finFila = Array(FILAS_H).fill(-1e9), filaDe = new Map();
      for (const d of hs) {
        const x0 = x(xh(d));
        let k = finFila.findIndex(f => x0 - f >= 11);
        if (k < 0) k = finFila.indexOf(Math.min(...finFila));
        finFila[k] = x0; filaDe.set(d, k);
      }
      capaHitos.selectAll('g.h').data(hs, d => `${d.anio}|${d.mes}|${d.titulo}`).join(enter => {
        const g = enter.append('g').attr('class', 'h').style('cursor', 'help');
        g.append('rect').attr('class', 'r').attr('width', 8).attr('height', 8).attr('x', -4).attr('y', -4).attr('transform', 'rotate(45)');
        g.append('rect').attr('class', 'hit').attr('x', -8).attr('y', -7).attr('width', 16).attr('height', 14).style('fill', 'transparent');
        g.on('mousemove', (e, d) => tip.show([h('b', null, fechaHito(d)), h('div', null, d.titulo),
          h('div', { class: 'm' }, `${AMBITOS[d.ambito] || 'Internacional'} · ${TIPOS_HITO[tipoHito(d.tipo)]}`), d.texto ? h('div', null, corta(d.texto, 150)) : null], e.clientX, e.clientY))
          .on('mouseleave', () => tip.hide());
        return g;
      }).attr('transform', d => `translate(${x(xh(d))},${10 + filaDe.get(d) * PASO_H + PASO_H / 2})`)
        .select('rect.r')
        .style('fill', d => (d.ambito === 'españa' ? 'var(--surface)' : colorHito(d.tipo)))
        .style('stroke', d => (d.ambito === 'españa' ? colorHito(d.tipo) : 'var(--surface)'))
        .attr('stroke-width', d => (d.ambito === 'españa' ? 2 : 1.2));
      // términos: apilados sin solapes dentro de cada fila
      const r = movil ? 4 : 5, paso = r * 2 + 1.5;
      const pos = new Map();
      filas.forEach((f, i) => {
        const y0 = TOP + i * LANE + LBL, alto = LANE - LBL, yc = y0 + alto / 2, maxOff = alto / 2 - r - 2;
        const colocados = [];
        for (const t of datos.filter(t => fila(t) === f)) {
          const px = x(t.anio);
          let off = 0;
          for (let k = 0; k < 40; k++) {
            off = (k % 2 ? 1 : -1) * Math.ceil(k / 2) * paso;
            if (Math.abs(off) > maxOff) { off = 0; break; }
            if (!colocados.some(p => Math.abs(p.x - px) < paso && Math.abs(p.y - (yc + off)) < paso)) break;
          }
          colocados.push({ x: px, y: yc + off });
          pos.set(t.id, [px, yc + off]);
        }
      });
      const esFoco = d => foco && d.id === foco.id;
      capa.selectAll('circle').data(datos, d => d.id).join(enter => enter.append('circle').style('cursor', 'pointer')
        .on('mousemove', (e, d) => tip.show(tipTerm(d), e.clientX, e.clientY)).on('mouseleave', () => tip.hide())
        .on('click', (e, d) => { tip.hide(); location.hash = `#/termino/${encodeURIComponent(d.id)}`; }))
        .attr('r', d => (esFoco(d) ? r + 3 : r))
        .attr('cx', d => pos.get(d.id)[0]).attr('cy', d => pos.get(d.id)[1])
        .style('fill', d => colorFila(fila(d)))
        .style('stroke', d => (esFoco(d) ? 'var(--ink)' : 'var(--surface)')).attr('stroke-width', d => (esFoco(d) ? 2.5 : 1.5));
      capa.selectAll('circle').filter(esFoco).raise();
      // etiquetas directas cuando hay sitio
      const vis = datos.filter(t => { const p = pos.get(t.id); return p[0] >= M.l && p[0] <= W - M.r; });
      const etiquetas = foco ? vis.filter(esFoco) : [];
      const pxAnio = (x(2000) - x(1990)) / 10;
      const peso = t => ctx.vecinos.get(t.id)?.size || 0;
      if (pxAnio > 9) for (const t of vis.slice().sort((a, b) => peso(b) - peso(a))) if (!etiquetas.includes(t)) etiquetas.push(t);
      const usadas = [], puntos = vis.map(t => [t.id, ...pos.get(t.id)]);
      capa.selectAll('text.tl').data(etiquetas.filter(t => {
        const [px, py] = pos.get(t.id), x0 = px + r + 2, w = rotulo(t.lema).length * 6.3 + 4;
        if (x0 + w > W - M.r) return false;
        if (usadas.some(u => x0 < u.x + u.w && x0 + w > u.x && Math.abs(py - u.y) < 13)) return false;
        if (!esFoco(t) && puntos.some(([id, qx, qy]) => id !== t.id && qx + r > x0 && qx - r < x0 + w && Math.abs(qy - py) < r + 6)) return false;
        usadas.push({ x: x0, y: py, w }); return true;
      }), d => d.id).join('text').attr('class', d => (esFoco(d) ? 'tl lbl-strong nl-halo' : 'tl lbl nl-halo'))
        .attr('x', d => pos.get(d.id)[0] + r + 3).attr('y', d => pos.get(d.id)[1]).attr('dy', '0.35em').style('pointer-events', 'none').text(d => rotulo(d.lema));
    };
    zoom = d3.zoom().scaleExtent([1, 30]).translateExtent([[M.l, 0], [W - M.r, Hh]]).extent([[M.l, 0], [W - M.r, Hh]])
      .filter(e => (!e.ctrlKey || e.type === 'wheel') && !e.button)
      .on('zoom', e => { zx = e.transform.rescaleX(xBase); pintar(); if (e.sourceEvent) for (const b of botones) b.setAttribute('aria-pressed', 'false'); });
    svg.call(zoom).on('dblclick.zoom', null);
    pintar();
    aplicar(dominio, false);
  }

  function aplicar(d, animar = true) {
    dominio = d;
    const k = (xBase.range()[1] - xBase.range()[0]) / (xBase(d[1]) - xBase(d[0]));
    const t = d3.zoomIdentity.scale(k).translate(-xBase(d[0]) + M.l / k, 0);
    (animar && !matchMedia('(prefers-reduced-motion: reduce)').matches ? svg.transition().duration(450) : svg).call(zoom.transform, t);
  }
  function irA(d, k) {
    if (caja.hidden) alternarLista();
    aplicar(d);
    botones.forEach((b, i) => b.setAttribute('aria-pressed', String(VISTAS[i].k === k)));
  }

  dibujar();
  if (!foco && root.clientWidth >= 600) botones[0].setAttribute('aria-pressed', 'true');
  // En el móvil, si llegas desde una ficha, la máquina queda a la vista
  const tFoco = foco && avisoFoco && innerWidth < 700 ? setTimeout(() => avisoFoco.scrollIntoView({ block: 'start' }), 120) : 0;
  let ancho = caja.clientWidth;
  const ro = new ResizeObserver(() => { if (!caja.hidden && Math.abs(caja.clientWidth - ancho) > 20) { ancho = caja.clientWidth; dibujar(); } });
  ro.observe(caja);
  return { destroy: () => { ro.disconnect(); clearTimeout(tFoco); tip.hide(); }, retema: () => dibujar() };
}
