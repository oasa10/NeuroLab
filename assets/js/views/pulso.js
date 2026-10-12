import { h, CODIGOS, USOS, FAMILIAS, FAM_CORTA, FASES, SALTOS, tip, usoColor, famColor, cssVar, plural, recuadro, poner, anio } from '../lib.js';

// El pulso de las etiquetas: cada término que nace es un latido
export function render(root, ctx) {
  document.title = 'El pulso de las etiquetas · NeuroLab';
  const d3 = window.d3;
  const HOY = new Date().getFullYear();
  const fechados = ctx.terms.filter(t => t.anio !== null && t.anio <= HOY).sort((a, b) => a.anio - b.anio);
  const primero = fechados[0]?.anio;
  const desde = primero === undefined || primero >= 1900 ? 1900 : Math.max(1790, Math.floor(primero / 10) * 10);
  const hasta = HOY;
  const antiguos = fechados.filter(t => t.anio < desde);
  const salto = SALTOS.find(s => s.id === 'cosa');
  let filtro = null; // { k: 'uso' | 'fam', v }
  const pasa = t => !filtro || (filtro.k === 'uso' ? t.usos.includes(filtro.v) : t.familia === filtro.v);
  const anual = () => {
    const ts = fechados.filter(t => t.anio >= desde && pasa(t));
    return d3.range(desde, hasta + 1).map(a => ({ a, ts: ts.filter(t => t.anio === a) }));
  };
  const nombreFiltro = () => (!filtro ? '' : filtro.k === 'uso' ? `para ${USOS[filtro.v].verbo}` : `de ${filtro.v}`);

  const caja = h('div', { class: 'ecg-scroll' });
  const leer = h('p', { class: 'small', 'aria-live': 'polite', style: { minHeight: '1.5em', margin: '8px 0 0' } });
  const stats = h('div', { class: 'grid g3', style: { margin: '6px 0 4px' } });
  const otraVez = h('button', { class: 'btn small', type: 'button', onclick: () => dibujar(true) }, '♥ Volver a tomar el pulso');
  const usoBtns = h('div', { class: 'toggles nl-uso', role: 'group', 'aria-label': 'Mirar solo los términos de un uso' });
  const famSel = h('select', { 'aria-label': 'Mirar solo los términos de una familia' }, h('option', { value: '' }, 'Todas las familias'),
    FAMILIAS.filter(f => fechados.some(t => t.familia === f)).map(f => h('option', { value: f }, f)));
  famSel.addEventListener('change', () => { filtro = famSel.value ? { k: 'fam', v: famSel.value } : null; pintarUso(); dibujar(true); });
  const tablaBody = h('tbody');

  root.append(
    h('h2', { class: 'vis-h' }, 'El pulso de las etiquetas'),
    h('p', { class: 'vis-lead' }, `Si la historia de las etiquetas tuviera electrocardiograma, sería este. Cada pico es un año en que nace al menos un término de NeuroLab; su altura, cuántos. Donde la línea va plana, ese año no se fijó ninguno (o no lo hemos encontrado). Tranquilidad: un pulso acelerado aquí no necesita diagnóstico.`),
    stats,
    h('section', { class: 'viz ecg' },
      h('div', { class: 'viz-head' }, h('h3', null, `Términos nuevos por año, ${desde}–${hasta}`), otraVez),
      h('p', { class: 'small', style: { color: 'var(--text-2)', margin: '4px 0 6px' } }, '¿Y si miramos solo un uso de IDEAR, o una familia?'),
      usoBtns,
      h('label', { class: 'small nl-fam' }, 'O una familia: ', famSel),
      caja,
      leer,
      h('details', { style: { marginTop: '8px' } }, h('summary', { class: 'small' }, 'Ver los latidos en una tabla'),
        h('div', { class: 'table-wrap' }, h('table', null,
          h('thead', null, h('tr', null, h('th', { scope: 'col' }, 'Año'), h('th', { scope: 'col', class: 'num' }, 'Términos'), h('th', { scope: 'col' }, 'Cuáles'))), tablaBody)))),
    recuadro('aclaracion', 'Cómo leerlo',
      h('p', null, 'Es un cardiograma de nombres, no de personas: cuenta el año que fija cada término de NeuroLab (una obra, una persona, una ley, un manual). La línea plana no significa que no pasara nada, sino que ese año no nació ninguna de las palabras que recogemos. Y que haya pocos picos en los últimos años no quiere decir que el tema se calme: a muchas palabras les cuesta años llegar a los libros.')),
    recuadro('atencion', `Ojo con el salto: ${salto.de.toLowerCase()} ${salto.a}`,
      h('p', null, `Un pico de nombres nuevos no es un pico de personas ni una explicación. Nombrar algo no lo explica: ${salto.ej} repite lo observado con otra palabra. Las etiquetas sirven para ordenar, investigar o pedir apoyos; los mecanismos hay que probarlos aparte.`),
      h('p', { class: 'small' }, h('b', null, 'Lo que falta para cruzar: '), salto.falta)),
    fechados.length ? recuadro('sabias', null, sabias()) : null,
    antiguos.length ? h('div', { class: 'chips' }, antiguos.map(t => h('a', { class: 'chip', href: `#/termino/${encodeURIComponent(t.id)}` }, t.lema, h('span', { class: 'muted' }, anio(t.anio))))) : null,
  );

  function sabias() {
    const p = fechados[0];
    const pre = fechados.filter(t => t.anio < 1900).length, post = fechados.length - pre;
    if (p.anio >= 1900) return `El latido más antiguo de NeuroLab es de ${p.anio}: ${p.lema}. Desde entonces, ${plural(fechados.length - 1, 'término más', 'términos más')}.`;
    return `El latido más antiguo de NeuroLab es de ${anio(p.anio)}: ${p.lema}. Antes de 1900 hay ${plural(pre, 'latido', 'latidos')} en total; desde 1900, ${post}.${post > pre * 2 ? ' Casi todos los nombres llegan con el siglo XX, cuando la infancia empieza a mirarse en consultas y escuelas.' : ''}`;
  }

  function pintarUso() {
    const ops = [[null, 'Todos'], ...CODIGOS.map(c => [c, USOS[c].nombre])];
    poner(usoBtns, ops.map(([c, l]) => h('button', { class: 'toggle', type: 'button', 'data-v': c, 'aria-pressed': String(c === null ? !filtro : filtro?.k === 'uso' && filtro.v === c),
      onclick: () => { filtro = c ? { k: 'uso', v: c } : null; famSel.value = ''; pintarUso(); dibujar(true); } },
      c ? h('span', { class: 'dot', 'aria-hidden': 'true' }) : null, l)));
  }

  function pintarStats(datos) {
    const conLatido = datos.filter(x => x.ts.length);
    const decadas = d3.rollups(conLatido, v => d3.sum(v, x => x.ts.length), x => Math.floor(x.a / 10) * 10).sort((a, b) => b[1] - a[1] || a[0] - b[0]);
    const record = conLatido.reduce((m, x) => (!m || x.ts.length > m.ts.length ? x : m), null);
    // la racha más larga sin latidos, desde el primer latido
    let mejor = { n: 0, a: desde }, n = 0, empezado = false;
    datos.forEach(x => { if (x.ts.length) { empezado = true; n = 0; } else if (empezado) { n++; if (n > mejor.n) mejor = { n, a: x.a - n + 1 }; } });
    poner(stats,
      stat(decadas[0]?.[1] ?? 0, decadas.length ? `latidos en los años ${decadas[0][0]}, la década más agitada` : 'latidos: la línea va plana'),
      stat(record?.ts.length ?? 0, record ? `en ${record.a}, el año récord` : 'años con latido'),
      stat(mejor.n, mejor.n ? `años seguidos de línea plana (${mejor.a}–${mejor.a + mejor.n - 1})` : 'años de línea plana entre latidos'));
  }

  let raf = 0;
  function dibujar(animar) {
    cancelAnimationFrame(raf);
    tip.hide();
    const datos = anual();
    pintarStats(datos);
    caja.replaceChildren();
    tablaBody.replaceChildren(...datos.filter(x => x.ts.length).map(x => h('tr', null, h('td', null, x.a), h('td', { class: 'num' }, x.ts.length),
      h('td', null, x.ts.map((t, i) => [i ? ', ' : '', h('a', { href: `#/termino/${encodeURIComponent(t.id)}` }, t.lema)])))));
    const anios = hasta - desde + 1;
    const W = Math.max(640, caja.clientWidth || 640, Math.round(anios * 5.2)), H = 260, M = { t: 44, r: 10, b: 26, l: 10 };
    const base = H - M.b - 50;
    const x = d3.scaleLinear().domain([desde, hasta + 1]).range([M.l, W - M.r]);
    const max = Math.max(4, d3.max(datos, d => d.ts.length));
    const y = n => base - (n / max) * (base - M.t);
    const color = !filtro ? cssVar('--accent') : filtro.k === 'uso' ? usoColor(filtro.v) : famColor(filtro.v);
    const total = d3.sum(datos, d => d.ts.length);
    const svg = d3.select(caja).append('svg').attr('viewBox', `0 0 ${W} ${H}`).attr('width', W).style('min-width', `${W}px`).attr('role', 'img')
      .attr('aria-label', `Cardiograma de términos nuevos por año entre ${desde} y ${hasta}${filtro ? `, solo los ${nombreFiltro()}` : ''}: ${plural(total, 'término', 'términos')}. La tabla de abajo tiene los datos.`);
    // papel milimetrado
    const rej = svg.append('g').attr('class', 'rejilla');
    rej.selectAll('line.v').data(d3.range(Math.ceil(desde / 5) * 5, hasta + 1, 5)).join('line').attr('class', 'v').attr('x1', x).attr('x2', x).attr('y1', M.t - 14).attr('y2', H - M.b)
      .attr('stroke-width', a => (a % 10 ? 0.5 : 1));
    rej.selectAll('line.h').data(d3.range(M.t - 14, H - M.b + 1, (H - M.b - M.t + 14) / 8)).join('line').attr('class', 'h').attr('x1', M.l).attr('x2', W - M.r).attr('y1', d => d).attr('y2', d => d).attr('stroke-width', 0.5);
    // épocas
    FASES.map(f => ({ ...f, a: Math.max(f.desde, desde), b: Math.min(f.hasta + 1, hasta + 1) })).filter(f => f.b > f.a).forEach((f, i) => {
      if (i % 2) svg.append('rect').attr('x', x(f.a)).attr('width', x(f.b) - x(f.a)).attr('y', M.t - 14).attr('height', H - M.b - M.t + 14).style('fill', color).attr('opacity', 0.07);
      const w = x(f.b) - x(f.a);
      if (w > f.nombre.length * 6 + 10) svg.append('text').attr('x', x(f.a) + 4).attr('y', H - M.b - 6).style('font-size', '11px').style('fill', 'var(--muted)').text(f.nombre);
    });
    svg.append('g').attr('class', 'axis').attr('transform', `translate(0,${H - M.b})`)
      .call(d3.axisBottom(x).tickValues(d3.range(Math.ceil(desde / 10) * 10, hasta + 1, 10)).tickFormat(d => d).tickSizeOuter(0));
    // la línea: un complejo QRS por cada año con términos
    const p = d3.path();
    p.moveTo(M.l, base);
    const paso = x(desde + 1) - x(desde);
    datos.forEach(d => {
      const cx = x(d.a) + paso / 2, n = d.ts.length;
      if (!n) return;
      const a = Math.min(paso * 0.9, 6);
      p.lineTo(cx - a, base); p.lineTo(cx - a * 0.55, base + 4); p.lineTo(cx, y(n)); p.lineTo(cx + a * 0.55, base + 10 + n * 1.5); p.lineTo(cx + a, base);
    });
    p.lineTo(W - M.r, base);
    const linea = svg.append('path').attr('class', 'linea').attr('d', p.toString()).style('stroke', color);
    if (caja.scrollWidth > caja.clientWidth) caja.scrollLeft = caja.scrollWidth; // en el móvil, empezar por los años con más latidos
    const len = linea.node().getTotalLength();
    const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;
    // rótulos de los tres años con más latidos; si dos se pisan, el de menos latidos sube un renglón
    const top = datos.filter(d => d.ts.length).sort((a, b) => b.ts.length - a.ts.length || a.a - b.a).slice(0, 3);
    const puestos = [];
    top.forEach(d => {
      const r = { cx: x(d.a) + paso / 2, w: `${d.a} · ${d.ts.length}`.length * 7, y: y(d.ts.length) - 6 };
      while (puestos.some(o => Math.abs(o.cx - r.cx) < (o.w + r.w) / 2 + 4 && Math.abs(o.y - r.y) < 14)) r.y -= 14;
      d.ly = Math.max(12, r.y); puestos.push(r);
    });
    const etiquetas = svg.append('g').selectAll('text').data(top).join('text').attr('class', 'lbl-strong').attr('text-anchor', 'middle')
      .attr('x', d => Math.min(W - M.r - 30, Math.max(M.l + 30, x(d.a) + paso / 2))).attr('y', d => d.ly).text(d => `${d.a} · ${d.ts.length}`);
    const punto = svg.append('g').attr('class', 'latido').append('circle').attr('r', 5).style('fill', color).attr('opacity', 0);
    if (animar && !quieto && len > 0) {
      linea.classed('anim', true).style('--len', len);
      etiquetas.attr('opacity', 0).transition().delay(3600).duration(400).attr('opacity', 1);
      const t0 = performance.now(), dur = 4000;
      const mover = now => {
        const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3);
        const pt = linea.node().getPointAtLength(e * len);
        punto.attr('cx', pt.x).attr('cy', pt.y).attr('opacity', k < 1 ? 1 : 0);
        if (k < 1) raf = requestAnimationFrame(mover);
      };
      raf = requestAnimationFrame(mover);
    }
    // cursor y lectura
    const cursor = svg.append('line').attr('y1', M.t - 14).attr('y2', H - M.b).style('stroke', 'var(--ink)').attr('stroke-width', 1).attr('stroke-dasharray', '3 3').attr('opacity', 0);
    const cerca = px => {
      const a = Math.floor(x.invert(px));
      for (const dd of [0, -1, 1, -2, 2]) { const d = datos.find(z => z.a === a + dd); if (d && d.ts.length) return d; }
      return datos.find(z => z.a === a);
    };
    svg.append('rect').attr('x', M.l).attr('y', M.t - 14).attr('width', W - M.l - M.r).attr('height', H - M.b - M.t + 14).style('fill', 'transparent')
      .on('mousemove', e => {
        const [px] = d3.pointer(e); const d = cerca(px); if (!d) return;
        cursor.attr('x1', x(d.a) + paso / 2).attr('x2', x(d.a) + paso / 2).attr('opacity', 0.6);
        tip.show([h('b', null, `${d.a} · ${d.ts.length ? plural(d.ts.length, 'latido', 'latidos') : 'línea plana'}`),
          d.ts.length ? h('div', null, d.ts.map(t => t.lema).join(', ')) : null], e.clientX, e.clientY);
      })
      .on('mouseleave', () => { cursor.attr('opacity', 0); tip.hide(); })
      .on('click', e => { const d = cerca(d3.pointer(e)[0]); if (d?.ts.length === 1) location.hash = `#/termino/${encodeURIComponent(d.ts[0].id)}`; });
    leer.textContent = filtro
      ? `${plural(total, 'término', 'términos')} ${nombreFiltro()} desde ${desde}. ${total ? `Su año más intenso: ${top[0].a}.` : 'Ninguno tiene fecha todavía.'}`
      : `${plural(total, 'término', 'términos')} desde ${desde}. Pasa por encima para ver qué nació cada año; en el móvil, desliza la gráfica hacia atrás para ver los primeros años.`;
  }

  pintarUso();
  dibujar(true);
  let ancho = root.clientWidth;
  const ro = new ResizeObserver(() => { if (Math.abs(root.clientWidth - ancho) > 30) { ancho = root.clientWidth; dibujar(false); } });
  ro.observe(root);
  return { destroy: () => { ro.disconnect(); cancelAnimationFrame(raf); tip.hide(); }, retema: () => dibujar(false) };
}

function stat(n, texto) {
  return h('div', { class: 'card stat' }, h('b', null, n), h('span', null, texto));
}
