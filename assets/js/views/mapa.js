import cytoscape from '../../vendor/cytoscape-3.34.3.esm.min.js';
import { h, anio, idear, famTag, famColor, famVar, usoColor, cssVar, FAM_ANILLO, FAM_CORTA, CODIGOS, USOS, SALTOS, corta, plural, recuadro, poner } from '../lib.js';

// Mapa de relaciones: cada término, del color de su familia, unido a los que conviene leer con él
// Rótulo corto para los gráficos: «TDAH (trastorno por…)» → «TDAH»
const rotulo = s => {
  const m = /^(.*?)\s*\(([^)]*)\)\s*$/.exec(s || '');
  if (!m) return s;
  return /^[A-ZÁÉÍÓÚÑ0-9-]{2,8}$/.test(m[2]) && m[1].length > 22 ? m[2] : m[1];
};

export function render(root, ctx, parts, q) {
  document.title = 'Mapa de relaciones · NeuroLab';
  const { terms, rels, byId, vecinos } = ctx;
  const familias = FAM_ANILLO.filter(f => terms.some(t => t.familia === f));
  const grado = id => vecinos.get(id)?.size || 0;
  const maxG = Math.max(1, ...terms.map(t => grado(t.id)));
  const famDe = id => byId.get(id)?.familia;
  const puentes = rels.filter(r => famDe(r.o) !== famDe(r.d));
  const salto = SALTOS.find(s => s.id === 'causa');
  let soloPuentes = false, famSolo = null, uso = null;

  // Puentes por pares de familias
  const pares = new Map();
  for (const r of puentes) {
    const k = [famDe(r.o), famDe(r.d)].map(f => FAM_CORTA[f] || f || '—').sort().join(' ↔ ');
    pares.set(k, (pares.get(k) || 0) + 1);
  }
  const topPares = [...pares.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);

  const buscar = h('select', { 'aria-label': 'Elige un término para verlo en el mapa' },
    h('option', { value: '' }, 'Elige un término…'), [...terms].sort((a, b) => a.lema.localeCompare(b.lema, 'es')).map(t => h('option', { value: t.id }, t.lema)));
  const bPuentes = h('button', { class: 'btn small', type: 'button', 'aria-pressed': 'false' }, 'Solo puentes entre familias');
  const bReset = h('button', { class: 'btn small', type: 'button' }, 'Ver todo');
  const usoBtns = h('div', { class: 'toggles nl-uso', role: 'group', 'aria-label': 'Filtrar por uso: atenúa los términos que no circulan en ese uso' });
  const usoTexto = h('p', { class: 'small', 'aria-live': 'polite', style: { margin: '0 0 8px', color: 'var(--text-2)' } });
  const leyenda = h('div', { class: 'legend', role: 'group', 'aria-label': 'Familias: pulsa una para destacarla' });
  const cyEl = h('div', { id: 'cy', role: 'img', 'aria-label': `Red de ${plural(terms.length, 'término', 'términos')} y ${plural(rels.length, 'conexión', 'conexiones')}, agrupados por familias. Usa el selector para elegir un término; su ficha lista sus conexiones.` });
  const panel = h('div', { class: 'card' });

  poner(root,
    h('h2', { class: 'vis-h' }, 'Mapa de relaciones'),
    h('p', { class: 'vis-lead' }, `Cada punto es un término y cada línea, una relación (${rels.length} en total). Los términos se juntan por familias, como en una boda: cada cual con los suyos. Las líneas más oscuras son los puentes entre familias, y suelen ser lo más interesante de la fiesta.`),
    h('div', { class: 'map-tools' }, buscar, bPuentes, bReset),
    h('div', { class: 'nl-uso-wrap' }, h('span', { class: 'small muted' }, '¿En qué uso circula?'), usoBtns),
    usoTexto,
    leyenda,
    h('div', { class: 'map-wrap' }, cyEl, h('div', { class: 'map-panel' }, panel)),
    recuadro('aclaracion', 'Cómo leerlo',
      h('p', null, 'Cada punto es un término de NeuroLab, del color de su familia; cuantas más relaciones tiene, más grande se ve. Una línea une dos términos que se entienden mejor juntos: la relación la propone la ficha, no un algoritmo. La posición acerca cada término a su familia y a sus vecinos, pero las distancias no son una medida.'),
      h('p', null, 'Con «¿En qué uso circula?» se apagan los términos que no se usan para eso. Es la idea de IDEAR: la misma red cambia según para qué se use la palabra.')),
    recuadro('atencion', `Ojo con el salto: ${salto.de.toLowerCase()} ${salto.a}`,
      h('p', null, 'Que dos términos estén unidos solo dice que conviene leerlos juntos. No dice que uno cause el otro, ni que compartan mecanismo, ni que quien lleva una etiqueta lleve también la vecina.'),
      h('p', { class: 'small' }, h('b', null, 'Lo que falta para cruzar: '), salto.falta)),
  );

  if (!terms.length) {
    poner(cyEl, h('p', { class: 'empty' }, 'Todavía no hay términos para dibujar el mapa.'));
    return {};
  }

  function panelInicio() {
    poner(panel,
      h('h3', { style: { marginTop: 0, fontSize: '1.1rem' } }, 'Pulsa un punto'),
      h('p', { class: 'small' }, 'Verás el término, sus usos y sus vecinos. Pulsa una familia en la leyenda para destacarla. Arrastra y pellizca para moverte: el mapa no muerde.'),
      h('h3', { style: { fontSize: '1rem' } }, 'Puentes más transitados'),
      topPares.length ? h('div', { class: 'table-wrap' }, h('table', null,
        h('thead', null, h('tr', null, h('th', { scope: 'col' }, 'Familias'), h('th', { scope: 'col', class: 'num' }, 'Relaciones'))),
        h('tbody', null, topPares.map(([k, n]) => h('tr', null, h('td', null, k), h('td', { class: 'num' }, n)))))) : h('p', { class: 'small muted' }, 'Todavía no hay relaciones entre familias.'),
      h('p', { class: 'small muted', style: { marginTop: '10px' } }, `${plural(puentes.length, 'puente', 'puentes')} de ${plural(rels.length, 'relación', 'relaciones')}.`));
  }

  function panelTermino(t) {
    const vs = [...(vecinos.get(t.id) || [])].map(id => byId.get(id)).filter(Boolean).sort((a, b) => a.lema.localeCompare(b.lema, 'es'));
    poner(panel,
      h('p', { class: 'small muted', style: { margin: 0 } }, anio(t.anio)),
      h('h3', { style: { marginTop: '2px', fontSize: '1.3rem' } }, t.lema),
      h('div', { class: 'chips', style: { marginBottom: '10px' } }, idear(t.usos), famTag(t.familia)),
      t.definicion ? h('p', { class: 'small' }, corta(t.definicion, 220)) : null,
      uso && !t.usos.includes(uso) ? h('p', { class: 'small muted' }, `No suele usarse para ${USOS[uso].verbo}.`) : null,
      vs.length ? [h('h4', { style: { fontSize: '.95rem', margin: '10px 0 6px' } }, plural(vs.length, 'relación', 'relaciones')),
        h('div', { class: 'chips' }, vs.map(v => h('button', { class: 'chip', type: 'button', onclick: () => elegir(v.id) },
          h('span', { class: 'dot', style: { '--c': famVar(v.familia) } }), v.lema)))] : h('p', { class: 'small muted' }, 'Sin relaciones registradas.'),
      h('p', { class: 'btns', style: { marginTop: '14px' } }, h('a', { class: 'btn small primary', href: `#/termino/${encodeURIComponent(t.id)}` }, 'Ver la ficha'),
        t.anio !== null ? h('a', { class: 'btn small', href: `#/viajar?t=${encodeURIComponent(t.id)}` }, 'Viajar a su época') : null));
  }

  let cy;
  function crear() {
    if (cy) cy.destroy();
    const c = { text: cssVar('--text'), text2: cssVar('--text-2'), line: cssVar('--line'), strong: cssVar('--muted'), surface: cssVar('--surface'), ink: cssVar('--ink') };
    const conPos = terms.every(t => Array.isArray(t.xy));
    // Posiciones del build, un poco abiertas desde el centro (donde se acumulan los puentes) para que se lean mejor
    const gx = conPos ? terms.reduce((s, t) => s + t.xy[0], 0) / terms.length : 0, gy = conPos ? terms.reduce((s, t) => s + t.xy[1], 0) / terms.length : 0;
    const R = conPos ? Math.max(1, ...terms.map(t => Math.hypot(t.xy[0] - gx, t.xy[1] - gy))) : 1;
    const xy = new Map(conPos ? terms.map(t => {
      const dx = t.xy[0] - gx, dy = t.xy[1] - gy, r = Math.hypot(dx, dy), k = r ? (R * Math.pow(r / R, 0.8)) / r : 1;
      return [t.id, [gx + dx * k, gy + dy * k]];
    }) : []);
    const nodos = terms.map(t => ({ group: 'nodes', data: { id: t.id, label: rotulo(t.lema), fam: t.familia, color: famColor(t.familia) || c.strong, g: grado(t.id) }, position: conPos ? { x: xy.get(t.id)[0], y: xy.get(t.id)[1] } : undefined }));
    // rótulo de familia: fuera del grupo, en la dirección que lo aleja del centro del mapa
    // en pantallas estrechas, sin rótulos de familia (la leyenda ya los da) para que la red ocupe todo el ancho
    const etiquetas = conPos && cyEl.clientWidth >= 520 ? familias.map(f => {
      const ps = terms.filter(t => t.familia === f).map(t => xy.get(t.id));
      const cx = ps.reduce((s, p) => s + p[0], 0) / ps.length, cyy = ps.reduce((s, p) => s + p[1], 0) / ps.length;
      let dx = cx - gx, dy = cyy - gy; const L = Math.hypot(dx, dy) || 1; dx /= L; dy /= L;
      const alcance = Math.max(...ps.map(p => (p[0] - cx) * dx + (p[1] - cyy) * dy));
      return { group: 'nodes', data: { id: `fam:${f}`, label: f }, position: { x: cx + dx * (alcance + 30), y: cyy + dy * (alcance + 24) }, classes: 'famlabel', selectable: false, grabbable: false };
    }) : [];
    const aristas = rels.filter(r => byId.has(r.o) && byId.has(r.d))
      .map((r, i) => ({ group: 'edges', data: { id: `e${i}`, source: r.o, target: r.d }, classes: famDe(r.o) !== famDe(r.d) ? 'puente' : '' }));
    cy = cytoscape({
      container: cyEl, elements: [...nodos, ...etiquetas, ...aristas],
      layout: conPos ? { name: 'preset', fit: true, padding: 30 } : { name: 'cose', animate: false, padding: 30 },
      minZoom: 0.15, maxZoom: 3, boxSelectionEnabled: false, autoungrabify: true,
      style: [
        { selector: 'node[color]', style: { 'background-color': 'data(color)', width: `mapData(g, 0, ${maxG}, 9, 30)`, height: `mapData(g, 0, ${maxG}, 9, 30)`,
          'border-width': 1.5, 'border-color': c.surface, label: 'data(label)', 'font-family': 'Inter, system-ui, sans-serif', 'font-size': `mapData(g, 0, ${maxG}, 9, 15)`,
          color: c.text, 'text-valign': 'bottom', 'text-margin-y': 3, 'text-outline-color': c.surface, 'text-outline-width': 2.5, 'min-zoomed-font-size': 11,
          'text-wrap': 'ellipsis', 'text-max-width': 170 } },
        { selector: 'node.famlabel', style: { label: 'data(label)', 'text-outline-color': c.surface, 'text-outline-width': 3, 'background-opacity': 0, 'border-width': 0, width: 1, height: 1, 'font-size': 22, 'font-weight': 600, color: c.text2,
          'text-valign': 'center', 'font-family': 'Fraunces, Georgia, serif', 'min-zoomed-font-size': 6, events: 'no' } },
        { selector: 'edge', style: { width: 1, 'line-color': c.line, 'curve-style': 'haystack', opacity: 0.9 } },
        { selector: 'edge.puente', style: { width: 1.2, 'line-color': c.strong, opacity: 0.45 } },
        { selector: 'node.enuso', style: { 'border-color': 'data(uc)', 'border-width': 3 } },
        { selector: '.fuerauso', style: { opacity: 0.13, 'text-opacity': 0 } },
        { selector: 'edge.fuerauso', style: { opacity: 0.05 } },
        { selector: '.oculto', style: { display: 'none' } },
        { selector: '.tenue', style: { opacity: 0.1 } },
        { selector: 'node.foco', style: { 'border-color': c.ink, 'border-width': 3, 'font-weight': 700, 'z-index': 10, opacity: 1, 'text-opacity': 1 } },
        { selector: 'node.vecino', style: { 'font-weight': 600, 'z-index': 9, 'min-zoomed-font-size': 0 } },
        { selector: 'edge.vecino', style: { 'line-color': c.ink, width: 2.2, opacity: 1, 'z-index': 8 } },
      ],
    });
    cy.on('tap', 'node', e => { if (!e.target.hasClass('famlabel')) elegir(e.target.id()); });
    cy.on('tap', e => { if (e.target === cy) limpiar(); });
    cy.on('mouseover', 'node', e => { if (!e.target.hasClass('famlabel')) cyEl.style.cursor = 'pointer'; });
    cy.on('mouseout', 'node', () => { cyEl.style.cursor = ''; });
    aplicarFiltros();
  }

  function aplicarFiltros() {
    cy.batch(() => {
      cy.elements().removeClass('oculto tenue enuso fuerauso');
      if (soloPuentes) cy.edges().not('.puente').addClass('oculto');
      if (famSolo) {
        cy.nodes().filter(n => !n.hasClass('famlabel') && n.data('fam') !== famSolo).addClass('tenue');
        cy.edges().filter(e => e.source().data('fam') !== famSolo && e.target().data('fam') !== famSolo).addClass('tenue');
      }
      if (uso) {
        const col = usoColor(uso);
        cy.nodes().not('.famlabel').forEach(n => {
          if (byId.get(n.id())?.usos.includes(uso)) n.data('uc', col).addClass('enuso'); else n.addClass('fuerauso');
        });
        cy.edges().filter(e => e.source().hasClass('fuerauso') || e.target().hasClass('fuerauso')).addClass('fuerauso');
      }
    });
  }

  function elegir(id) {
    const n = cy.getElementById(id);
    if (!n || n.empty()) return;
    const t = byId.get(id);
    cy.batch(() => {
      cy.elements().removeClass('foco vecino tenue');
      const barrio = n.closedNeighborhood();
      cy.elements().not(barrio).not('.famlabel').addClass('tenue');
      barrio.addClass('vecino'); n.addClass('foco');
    });
    cy.animate({ center: { eles: n }, zoom: Math.max(cy.zoom(), 1.1) }, { duration: matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 350 });
    buscar.value = id;
    panelTermino(t);
    history.replaceState(null, '', `#/visualizar/mapa?t=${encodeURIComponent(id)}`);
  }
  function limpiar() {
    cy.elements().removeClass('foco vecino tenue');
    aplicarFiltros(); buscar.value = ''; panelInicio();
    history.replaceState(null, '', '#/visualizar/mapa');
  }

  function pintarLeyenda() {
    poner(leyenda, familias.map(f => h('button', { type: 'button', class: famSolo === f ? 'solo' : '', 'aria-pressed': famSolo ? String(famSolo === f) : 'true',
      onclick: () => { famSolo = famSolo === f ? null : f; cy.elements().removeClass('foco vecino'); pintarLeyenda(); aplicarFiltros(); panelInicio(); buscar.value = ''; } },
      h('i', { style: { '--c': famVar(f) } }), h('span', { class: 'nl-largo' }, f), h('span', { class: 'nl-corto' }, FAM_CORTA[f] || f), ` (${terms.filter(t => t.familia === f).length})`)));
  }

  function pintarUso() {
    const opciones = [[null, 'Todos los usos', terms.length], ...CODIGOS.map(k => [k, USOS[k].nombre, terms.filter(t => t.usos.includes(k)).length])];
    poner(usoBtns, opciones.map(([k, l, n]) => h('button', { class: 'toggle', type: 'button', 'aria-pressed': String(uso === k), 'data-v': k,
      onclick: () => { uso = k; pintarUso(); const sel = buscar.value; aplicarFiltros(); if (sel) elegir(sel); else if (cy.$('.foco').empty()) panelInicio(); } },
      k ? h('span', { class: 'dot', 'aria-hidden': 'true' }) : null, `${l} (${n})`)));
    if (!uso) usoTexto.textContent = 'Elige un uso para ver qué términos circulan en él. Los demás se apagan, pero no desaparecen.';
    else {
      const n = terms.filter(t => t.usos.includes(uso)).length;
      poner(usoTexto, h('b', null, `${plural(n, 'término circula', 'términos circulan')} en ${USOS[uso].nombre} `), `(${USOS[uso].para}). `,
        h('span', null, 'Lo que hay que probar ahí: '), USOS[uso].prueba);
    }
  }

  buscar.addEventListener('change', () => (buscar.value ? elegir(buscar.value) : limpiar()));
  bPuentes.addEventListener('click', () => { soloPuentes = !soloPuentes; bPuentes.setAttribute('aria-pressed', String(soloPuentes)); aplicarFiltros(); });
  bReset.addEventListener('click', () => { famSolo = null; soloPuentes = false; uso = null; bPuentes.setAttribute('aria-pressed', 'false'); pintarLeyenda(); pintarUso(); limpiar(); cy.fit(undefined, 30); });

  panelInicio(); crear(); pintarLeyenda(); pintarUso();
  const inicial = q.get('t');
  let t0 = 0;
  if (inicial && byId.has(inicial)) t0 = setTimeout(() => elegir(inicial), 60);
  return {
    destroy: () => { clearTimeout(t0); cy?.destroy(); },
    retema: () => { const sel = buscar.value; crear(); if (sel) elegir(sel); },
  };
}
