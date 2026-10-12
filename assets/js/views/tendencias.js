import { h, FAMILIAS, FAM_CORTA, SALTOS, famVar, tip, plural, recuadro, poner, inline } from '../lib.js';

// Tendencias: las cifras que cambian con los años (con su unidad y su fuente) y los términos de NeuroLab por década y familia
const num = (v, max = 2) => (typeof v === 'number' ? v.toLocaleString('es-ES', { maximumFractionDigits: max }) : '—');
// Rótulos cortos para el eje: 450 mil, 1,2 M
function corto(v) {
  const a = Math.abs(v);
  if (a >= 1e6) return `${(v / 1e6).toLocaleString('es-ES', { maximumFractionDigits: 1 })} M`;
  if (a >= 1e4) return `${(v / 1e3).toLocaleString('es-ES', { maximumFractionDigits: 0 })} mil`;
  return v.toLocaleString('es-ES', { maximumFractionDigits: 2 });
}

export function render(root, ctx) {
  document.title = 'Tendencias · NeuroLab';
  const d3 = window.d3;
  const { terms } = ctx;
  const series = (ctx.series || []).filter(s => Array.isArray(s?.puntos) && s.puntos.some(p => Array.isArray(p) && Number.isFinite(+p[0]) && Number.isFinite(+p[1])))
    .map(s => ({ ...s, puntos: s.puntos.filter(p => Array.isArray(p) && Number.isFinite(+p[0]) && Number.isFinite(+p[1])).map(p => [+p[0], +p[1]]).sort((a, b) => a[0] - b[0]) }));
  const moda = SALTOS.find(s => s.id === 'moda');
  let actual = 0, comparar = null;

  // Términos por década y familia
  const hoy = new Date().getFullYear();
  const fechados = terms.filter(t => t.anio !== null && t.anio <= hoy + 1);
  const familias = FAMILIAS.concat(fechados.some(t => !FAMILIAS.includes(t.familia)) ? ['Otras'] : []);
  const famDe = t => (FAMILIAS.includes(t.familia) ? t.familia : 'Otras');
  const colorF = f => (f === 'Otras' ? 'var(--line-strong)' : famVar(f));
  const antes = fechados.filter(t => t.anio < 1900);
  const d0 = 1900, d1 = Math.floor(Math.max(hoy, ...fechados.map(t => t.anio)) / 10) * 10;
  const columnas = (antes.length ? [{ k: 'antes', l: 'Antes de 1900', corto: '<1900', ts: antes }] : [])
    .concat(d3.range(d0, d1 + 10, 10).map(d => ({ k: d, l: `Años ${d}`, corto: `${d}`, ts: fechados.filter(t => t.anio >= d && t.anio < d + 10) })));
  for (const c of columnas) c.por = familias.map(f => ({ f, ts: c.ts.filter(t => famDe(t) === f) }));
  const pico = columnas.reduce((a, b) => (b.ts.length > a.ts.length ? b : a), columnas[0]);

  const cajaSerie = h('div', { class: 'viz-body' });
  const cajaDec = h('div', { class: 'viz-body' });
  const infoSerie = h('div');
  const tablaSerie = h('div');
  const selector = h('div', { class: 'nl-selector' });

  poner(root,
    h('h2', { class: 'vis-h' }, 'Tendencias'),
    h('p', { class: 'vis-lead' }, 'Lo que cuentan las cifras cuando pasan los años: cuántos diagnósticos se registran, cuánta gente cumple criterios cuando se mide siempre igual y cuánto alumnado recibe apoyos. Y, debajo, cuándo nacen los términos de NeuroLab. Primero, el dato; después, la pregunta de siempre: ¿qué ha cambiado, las personas o la manera de contarlas?'),
    series.length
      ? h('section', { class: 'viz' },
        h('div', { class: 'viz-head' }, h('h3', null, 'Las cifras, año a año')),
        selector,
        infoSerie, cajaSerie, tablaSerie)
      : h('section', { class: 'card nl-vacio' }, h('h3', { style: { marginTop: 0 } }, 'Las cifras están en camino'),
        h('p', { style: { margin: 0 } }, 'Aquí verás series como el alumnado con necesidad específica de apoyo educativo en España curso a curso o las prevalencias estimadas, cada una con su unidad y su fuente. Mientras llegan, debajo tienes cómo han ido naciendo los términos.')),
    series.length ? recuadro('aclaracion', 'Cómo leerlo',
      h('p', null, 'Cada línea es una serie con su unidad y su fuente. El eje vertical empieza en cero, para que una subida no parezca más grande de lo que es. Lee la nota: dice qué se cuenta y si se ha contado siempre igual. Pasa el dedo o el ratón por la línea para ver cada valor y, si dos series tienen la misma unidad, ponlas juntas: a veces una sube mucho y la otra apenas se mueve.')) : null,
    recuadro('atencion', `Ojo con el salto: ${moda.de.toLowerCase()} ${moda.a}`,
      h('p', null, 'Más casos registrados no dice por sí solo si hay más personas, mejor detección o criterios distintos. Una cifra que sube puede ser una buena noticia (se ve a quien antes no se veía), una mala (se etiqueta de más) o un cambio de regla (se cuenta otra cosa).'),
      h('p', { class: 'small' }, h('b', null, 'Lo que falta para cruzar: '), moda.falta)),
    h('section', { class: 'viz' },
      h('div', { class: 'viz-head' }, h('h3', null, 'Términos por década y familia')),
      h('p', { class: 'small', style: { color: 'var(--text-2)', margin: '4px 0 10px' } }, fechados.length
        ? `${plural(fechados.length, 'término con fecha', 'términos con fecha')}. La década con más es la de ${pico.k === 'antes' ? 'antes de 1900' : `los años ${pico.k}`} (${pico.ts.length}).${antes.length ? ` Antes de 1900 hay ${plural(antes.length, 'término', 'términos')}, en la primera barra.` : ''}`
        : 'Todavía no hay términos con fecha.'),
      h('div', { class: 'legend', 'aria-hidden': 'true' }, familias.filter(f => fechados.some(t => famDe(t) === f)).map(f => h('span', null, h('i', { style: { '--c': colorF(f) } }), f === 'Otras' ? 'Otras' : FAM_CORTA[f]))),
      cajaDec,
      h('details', { style: { marginTop: '8px' } }, h('summary', { class: 'small' }, 'Ver los datos en una tabla'),
        tabla(['Década', ...familias.map(f => (f === 'Otras' ? 'Otras' : FAM_CORTA[f])), 'Total'],
          columnas.map(c => [c.l, ...c.por.map(p => p.ts.length), c.ts.length])))),
    recuadro('aclaracion', 'Cómo leerlo',
      h('p', null, 'Cada barra es una década y cada color, una familia. Contamos los términos de NeuroLab por el año que los fija (una obra, una persona, una ley), no cuántas veces se dice cada palabra ni cuántas personas hay.')),
    recuadro('atencion', 'Ojo con el salto: de la fecha del nombre a la fecha de la cosa',
      h('p', null, 'Que un nombre nazca en una década no quiere decir que antes no hubiera personas así: quiere decir que antes no había esa palabra, o ese uso, para nombrarlas. Y al revés: muchos nombres nuevos no prueban que haya más personas, sino más maneras de clasificar.')),
  );

  // Series que se pueden poner juntas: misma unidad
  const pares = i => (series[i].unidad ? series.map((x, j) => j).filter(j => j !== i && series[j].unidad === series[i].unidad) : []);
  function pintarSelector() {
    const sel = h('select', { class: 'nl-estrecho', 'aria-label': 'Elige una serie' }, series.map((x, i) => h('option', { value: i, selected: i === actual }, x.titulo || `Serie ${i + 1}`)));
    sel.addEventListener('change', () => { actual = +sel.value; comparar = null; pintarSelector(); dibujarSerie(); });
    poner(selector,
      series.length > 1 ? h('div', { class: 'toggles nl-ancho', role: 'group', 'aria-label': 'Elige una serie' }, series.map((x, i) => h('button', { class: 'toggle', type: 'button', 'aria-pressed': String(i === actual),
        onclick: () => { actual = i; comparar = null; pintarSelector(); dibujarSerie(); } }, x.titulo || `Serie ${i + 1}`))) : null,
      series.length > 1 ? sel : null,
      pares(actual).length ? h('div', { class: 'toggles nl-comparar', role: 'group', 'aria-label': 'Comparar con otra serie de la misma unidad' },
        pares(actual).map(j => h('button', { class: 'toggle', type: 'button', 'aria-pressed': String(comparar === j),
          onclick: () => { comparar = comparar === j ? null : j; pintarSelector(); dibujarSerie(); } }, h('span', { class: 'nl-linea2', 'aria-hidden': 'true' }), `Comparar con: ${series[j].titulo}`))) : null);
  }

  function dibujarSerie() {
    if (!series.length) return;
    const s = series[actual], P = s.puntos, s2 = comparar !== null ? series[comparar] : null;
    const [a0, v0] = P[0], [a1, v1] = P.at(-1);
    const lineas = [{ s, P, color: 'var(--accent)' }, ...(s2 ? [{ s: s2, P: s2.puntos, color: 'var(--n2)', dash: '6 4' }] : [])];
    const fuente = x => (x.fuente?.url || x.fuente?.titulo ? h('p', { class: 'small', style: { margin: '4px 0 0' } }, 'Fuente: ',
      x.fuente.url ? h('a', { href: x.fuente.url, rel: 'noopener', target: '_blank' }, x.fuente.titulo || x.fuente.url) : x.fuente.titulo) : null);
    const anios = [...new Set(lineas.flatMap(l => l.P.map(p => p[0])))].sort((p, q) => p - q);
    const valor = (l, a) => l.P.find(p => p[0] === a)?.[1];
    poner(infoSerie,
      series.length === 1 ? h('p', { style: { margin: '0 0 4px', fontWeight: 600 } }, s.titulo) : null,
      h('div', { class: 'grid nl-cifras' },
        h('div', { class: 'stat' }, h('b', null, num(v0)), h('span', null, `en ${a0}`)),
        P.length > 1 ? h('div', { class: 'stat' }, h('b', null, num(v1)), h('span', null, `en ${a1}`)) : null,
        h('div', { class: 'stat' }, h('b', null, P.length), h('span', null, P.length === 1 ? 'dato' : `datos, ${a0}–${a1}`))),
      s2 ? h('div', { class: 'legend' }, lineas.map(l => h('span', null, h('i', { class: l.dash ? 'nl-linea2' : 'nl-linea1', 'aria-hidden': 'true' }), l.s.titulo))) : null,
      s.unidad ? h('p', { class: 'small muted', style: { margin: '2px 0 0' } }, `En ${s.unidad}`) : null);
    poner(tablaSerie,
      s.nota ? h('p', { class: 'small', style: { margin: '8px 0 0', color: 'var(--text-2)' } }, h('b', null, s2 ? `Nota (${s.titulo}): ` : 'Nota: '), inline(s.nota)) : null,
      s2?.nota ? h('p', { class: 'small', style: { margin: '6px 0 0', color: 'var(--text-2)' } }, h('b', null, `Nota (${s2.titulo}): `), inline(s2.nota)) : null,
      fuente(s), s2 && (s2.fuente?.url !== s.fuente?.url || s2.fuente?.titulo !== s.fuente?.titulo) ? fuente(s2) : null,
      h('details', { style: { marginTop: '8px' } }, h('summary', { class: 'small' }, 'Ver los datos en una tabla'),
        s2 ? tabla(['Año', s.titulo, s2.titulo], anios.map(a => [a, num(valor(lineas[0], a)), num(valor(lineas[1], a))]))
          : tabla(['Año', s.unidad ? `Valor (${s.unidad})` : 'Valor'], P.map(([a, v]) => [a, num(v)]))));

    cajaSerie.replaceChildren();
    const W = Math.max(280, cajaSerie.clientWidth), movil = W < 560, H = movil ? 240 : 280;
    const todos = lineas.flatMap(l => l.P.map(p => p[1]));
    const ymax = d3.max(todos), ymin = Math.min(0, d3.min(todos));
    const y = d3.scaleLinear().domain([ymin, ymax > 0 ? ymax * 1.12 : 1]).nice().range([H - 26, 20]);
    const anchoEje = Math.max(...y.ticks(4).map(v => corto(v).length)) * 6.6 + 10;
    const M = { t: 20, r: movil ? 14 : 24, b: 26, l: anchoEje };
    const A0 = anios[0], A1 = anios.at(-1);
    const x = d3.scaleLinear().domain(A0 === A1 ? [A0 - 1, A1 + 1] : [A0, A1]).range([M.l, W - M.r]);
    const svg = d3.select(cajaSerie).append('svg').attr('viewBox', `0 0 ${W} ${H}`).attr('role', 'img')
      .attr('aria-label', lineas.map(l => `${l.s.titulo}: de ${num(l.P[0][1])} en ${l.P[0][0]} a ${num(l.P.at(-1)[1])} en ${l.P.at(-1)[0]}`).join('. ') + `${s.unidad ? ` (${s.unidad})` : ''}. Los datos están en la tabla de abajo.`);
    svg.append('g').attr('class', 'grid').selectAll('line').data(y.ticks(4)).join('line').attr('x1', M.l).attr('x2', W - M.r).attr('y1', d => y(d)).attr('y2', d => y(d));
    svg.append('g').attr('class', 'axis').attr('transform', `translate(${M.l},0)`).call(d3.axisLeft(y).ticks(4).tickFormat(corto).tickSize(0).tickPadding(6)).call(g => g.select('.domain').remove());
    // eje de años: los años con dato si caben; si no, unos pocos años redondos
    const ejeX = d3.axisBottom(x).tickFormat(d3.format('d')).tickSizeOuter(0);
    const anchoMin = anios.reduce((m, a, i) => (i ? Math.min(m, x(a) - x(anios[i - 1])) : m), Infinity);
    if (anios.length <= 12 && anchoMin >= 34) ejeX.tickValues(anios); else ejeX.ticks(Math.min(anios.length, movil ? 4 : 8));
    svg.append('g').attr('class', 'axis').attr('transform', `translate(0,${H - M.b})`).call(ejeX);
    const linea = d3.line().x(p => x(p[0])).y(p => y(p[1]));
    for (const l of lineas.slice().reverse()) {
      svg.append('path').attr('d', linea(l.P)).style('fill', 'none').style('stroke', l.color).attr('stroke-width', 2.5).attr('stroke-dasharray', l.dash || null)
        .attr('stroke-linejoin', 'round').attr('stroke-linecap', 'round');
      svg.append('g').selectAll('circle').data(l.P).join('circle').attr('cx', p => x(p[0])).attr('cy', p => y(p[1])).attr('r', l.P.length > 30 ? 2 : 3.5)
        .style('fill', l.color).style('stroke', 'var(--surface)').attr('stroke-width', 1.5);
    }
    // rótulos: primer y último valor de la serie principal; último de la comparada (debajo si se pisan)
    const rot = [[P[0], 'start', -9], ...(P.length > 1 ? [[P.at(-1), 'end', -9]] : [])];
    if (s2) { const q = s2.puntos.at(-1); rot.push([q, 'end', Math.abs(y(q[1]) - y(v1)) < 16 && q[0] === a1 ? 18 : -9]); }
    svg.append('g').selectAll('text').data(rot).join('text').attr('class', 'lbl-strong nl-halo')
      .attr('x', ([p, a]) => x(p[0]) + (a === 'start' ? 4 : -4)).attr('y', ([p, , dy]) => y(p[1]) + dy).attr('text-anchor', ([, a]) => a).text(([p]) => num(p[1]));
    // cursor
    const guia = svg.append('line').attr('y1', M.t).attr('y2', H - M.b).style('stroke', 'var(--ink)').attr('stroke-dasharray', '3 3').attr('opacity', 0);
    const marcas = lineas.map(() => svg.append('circle').attr('r', 6).style('fill', 'none').style('stroke', 'var(--ink)').attr('stroke-width', 2).attr('opacity', 0));
    svg.append('rect').attr('x', M.l).attr('y', M.t).attr('width', W - M.l - M.r).attr('height', H - M.t - M.b).style('fill', 'transparent')
      .on('mousemove', e => {
        const [px] = d3.pointer(e);
        const a = anios.reduce((m, q) => (Math.abs(x(q) - px) < Math.abs(x(m) - px) ? q : m));
        guia.attr('x1', x(a)).attr('x2', x(a)).attr('opacity', 0.5);
        lineas.forEach((l, i) => { const v = valor(l, a); marcas[i].attr('cx', x(a)).attr('cy', v === undefined ? 0 : y(v)).attr('opacity', v === undefined ? 0 : 1); });
        tip.show(s2
          ? [h('b', null, String(a)), ...lineas.map(l => { const v = valor(l, a); return h('div', null, `${l.s.titulo}: `, h('strong', null, v === undefined ? 'sin dato' : num(v))); }),
            s.unidad ? h('div', { class: 'm' }, s.unidad) : null]
          : [h('b', null, String(a)), h('div', null, `${num(valor(lineas[0], a))}${s.unidad ? ` ${s.unidad}` : ''}`)], e.clientX, e.clientY);
      })
      .on('mouseleave', () => { guia.attr('opacity', 0); marcas.forEach(m => m.attr('opacity', 0)); tip.hide(); });
  }

  function dibujarDecadas() {
    cajaDec.replaceChildren();
    if (!fechados.length) return;
    const W = Math.max(280, cajaDec.clientWidth), movil = W < 560, H = 280, M = { t: 22, r: 6, b: 26, l: 28 };
    const x = d3.scaleBand().domain(columnas.map(c => c.k)).range([M.l, W - M.r]).padding(0.22);
    const y = d3.scaleLinear().domain([0, d3.max(columnas, c => c.ts.length) * 1.12 || 1]).nice().range([H - M.b, M.t]);
    const svg = d3.select(cajaDec).append('svg').attr('viewBox', `0 0 ${W} ${H}`).attr('role', 'img')
      .attr('aria-label', `Términos por década, apilados por familia. Máximo en ${pico.k === 'antes' ? 'antes de 1900' : `los años ${pico.k}`}: ${pico.ts.length}. Los datos están en la tabla.`);
    svg.append('g').attr('class', 'grid').selectAll('line').data(y.ticks(4).slice(1)).join('line').attr('x1', M.l).attr('x2', W - M.r).attr('y1', d => y(d)).attr('y2', d => y(d));
    svg.append('g').attr('class', 'axis').attr('transform', `translate(${M.l},0)`).call(d3.axisLeft(y).ticks(4).tickFormat(d3.format('d')).tickSize(0).tickPadding(6)).call(g => g.select('.domain').remove());
    const etiqueta = c => (c.k === 'antes' ? (movil ? '<1900' : 'Antes') : String(c.k));
    svg.append('g').attr('class', 'axis').attr('transform', `translate(0,${H - M.b})`)
      .call(d3.axisBottom(x).tickFormat(k => etiqueta(columnas.find(c => c.k === k))).tickSizeOuter(0))
      .call(g => { if (movil && columnas.length > 7) g.selectAll('.tick text').attr('opacity', (k, i) => ((columnas.length - 1 - i) % 2 ? 0 : 1)); });
    for (const c of columnas) {
      let acc = 0;
      const g = svg.append('g');
      for (const p of c.por) {
        if (!p.ts.length) continue;
        const y0 = y(acc), y1 = y(acc + p.ts.length);
        g.append('rect').attr('x', x(c.k)).attr('width', x.bandwidth()).attr('y', y1).attr('height', Math.max(0, y0 - y1 - 1)).attr('rx', 1.5)
          .style('fill', colorF(p.f))
          .on('mousemove', e => tip.show([h('b', null, `${c.l} · ${p.f === 'Otras' ? 'Otras familias' : p.f}`), h('div', { class: 'm' }, plural(p.ts.length, 'término', 'términos')),
            h('div', null, p.ts.slice(0, 8).map(t => t.lema).join(', ') + (p.ts.length > 8 ? '…' : ''))], e.clientX, e.clientY))
          .on('mouseleave', () => tip.hide());
        acc += p.ts.length;
      }
    }
    const top = columnas.slice().sort((a, b) => b.ts.length - a.ts.length).slice(0, 3).filter(c => c.ts.length);
    svg.append('g').selectAll('text').data(top).join('text').attr('class', 'lbl-strong').attr('text-anchor', 'middle')
      .attr('x', c => x(c.k) + x.bandwidth() / 2).attr('y', c => y(c.ts.length) - 5).text(c => c.ts.length);
  }

  function dibujar() { dibujarSerie(); dibujarDecadas(); }
  if (series.length) pintarSelector();
  dibujar();
  let ancho = root.clientWidth;
  const ro = new ResizeObserver(() => { if (Math.abs(root.clientWidth - ancho) > 20) { ancho = root.clientWidth; dibujar(); } });
  ro.observe(root);
  return { destroy: () => { ro.disconnect(); tip.hide(); }, retema: dibujar };
}

function tabla(cabeza, filas) {
  return h('div', { class: 'table-wrap' }, h('table', null,
    h('thead', null, h('tr', null, cabeza.map((c, i) => h('th', { scope: 'col', class: i ? 'num' : null }, c)))),
    h('tbody', null, filas.map(f => h('tr', null, f.map((c, i) => h('td', { class: i ? 'num' : null }, c)))))));
}
