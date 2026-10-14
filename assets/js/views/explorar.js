import { h, USOS, CODIGOS, FAMILIAS, ESTADOS, TIPOS, termCard, plural, norm, cabeza, recuadro, imgUso } from '../lib.js';
import { ETIQUETAS, POR_ID, fichasDe, transversales } from '../etiquetas.js';

const FILTROS = ['etiqueta', 'familia', 'uso', 'tipo', 'decada', 'estado'];

export function render(root, ctx, parts, q) {
  document.title = 'Explorar · NeuroLab';
  const { terms, fuse } = ctx;
  const estado = { q: q.get('q') || '', orden: q.get('orden') || '' };
  for (const f of FILTROS) estado[f] = q.get(f) || '';

  const decadas = [...new Set(terms.map(t => t.decada).filter(d => d !== null))].sort((a, b) => a - b);
  const opts = {
    etiqueta: [['', 'Todas las etiquetas'], ...ETIQUETAS.map(e => [e.id, e.corto])],
    familia: [['', 'Todas las familias'], ...FAMILIAS.filter(f => terms.some(t => t.familia === f)).map(f => [f, f])],
    uso: [['', 'Todos los usos'], ...CODIGOS.map(c => [c, `${c} · ${USOS[c].nombre}`])],
    tipo: [['', 'Todos los tipos'], ...Object.entries(TIPOS).filter(([k]) => terms.some(t => t.tipo === k)).map(([k, v]) => [k, v])],
    decada: [['', 'Todas las décadas'], ['antes', 'Antes de 1900'], ...decadas.map(d => [String(d), `${d}s`])],
    estado: [['', 'Todos los estados'], ...Object.entries(ESTADOS).filter(([k]) => terms.some(t => t.estado === k)).map(([k, v]) => [k, v.nombre])],
  };
  const etiquetas = { etiqueta: 'Etiqueta', familia: 'Familia', uso: 'Uso (IDEAR)', tipo: 'Tipo', decada: 'Década', estado: 'Verificación' };

  const input = h('input', { type: 'search', value: estado.q, placeholder: 'Busca una etiqueta, una persona, una obra o una idea', 'aria-label': 'Buscar términos', autocomplete: 'off', enterkeyhint: 'search' });
  const selects = {};
  const filtros = h('div', { class: 'filters' }, FILTROS.map(f => {
    const s = h('select', { 'aria-label': etiquetas[f] }, opts[f].map(([v, l]) => h('option', { value: v, selected: v === estado[f] }, l)));
    s.addEventListener('change', () => { estado[f] = s.value; pintar(); });
    selects[f] = s;
    return h('label', { class: 'f' }, etiquetas[f], s);
  }));
  const orden = h('select', { 'aria-label': 'Ordenar por' },
    [['', 'Orden: relevancia o alfabético'], ['anio', 'Orden: del más antiguo al más reciente'], ['-anio', 'Orden: del más reciente al más antiguo'], ['lema', 'Orden: alfabético']]
      .map(([v, l]) => h('option', { value: v, selected: v === estado.orden }, l)));
  orden.addEventListener('change', () => { estado.orden = orden.value; pintar(); });
  const cuenta = h('span', { class: 'cuenta', 'aria-live': 'polite' });
  const nFiltros = h('span', { class: 'n-filtros' });
  const suave = () => (matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth');
  // Al buscar (L12): se cierra el teclado y la pantalla baja al resultado
  const alResultado = () => { input.blur(); resbar.scrollIntoView({ behavior: suave(), block: 'start' }); };
  const limpiar = h('button', { class: 'btn small', type: 'button', onclick: () => {
    estado.q = ''; input.value = ''; for (const f of FILTROS) { estado[f] = ''; selects[f].value = ''; } pintar(); input.focus();
  } }, 'Quitar filtros');
  const lista = h('div', { class: 'results' });
  const mas = h('div', { class: 'btns', style: { justifyContent: 'center', marginTop: '18px' } });

  const plegable = h('details', { class: 'plegable-filtros' },
    h('summary', null, h('span', { 'aria-hidden': 'true' }, '⚙ '), 'Filtros y orden', nFiltros),
    filtros, h('div', { class: 'btns', style: { marginTop: '10px' } }, orden, limpiar));
  const resbar = h('div', { class: 'resbar' }, plegable);
  // Primero, las once etiquetas (L6); después, lo que vale para todas y el buscador con todas las fichas
  const trans = transversales(ctx);
  const famTrans = FAMILIAS.filter(f => trans.some(t => t.familia === f));
  root.append(
    cabeza(1, 'Explorar', `Las ${terms.length} fichas de NeuroLab, ordenadas como llega la gente: por la etiqueta. Elige una y verás para qué se usa, qué prueba pide cada uso y, alrededor, quién la nombró, dónde se fija y con qué se piensa.`),
    h('section', { class: 'et-lista', 'aria-label': 'Las once etiquetas' }, ETIQUETAS.map(e => {
      const t = ctx.byId.get(e.id);
      if (!t) return null;
      return h('a', { class: 'card et-card', href: `#/etiqueta/${encodeURIComponent(e.id)}` },
        h('b', null, e.corto), h('span', null, e.una),
        h('span', { class: 'et-imgs', title: 'Para qué se usa: ' + t.usos.map(u => USOS[u].nombre.toLowerCase()).join(', ') }, t.usos.map(u => imgUso(u))),
        h('span', { class: 'n' }, `${fichasDe(ctx, e.id).size} fichas`));
    })),
    h('p', { class: 'small muted', style: { margin: '12px 0 0' } }, `Y ${trans.length} fichas que valen para todas: `,
      famTrans.map((f, i) => [i ? ' · ' : '', h('a', { href: `#/explorar?familia=${encodeURIComponent(f)}` }, f.toLowerCase())]), '.'),
    h('h2', { style: { marginTop: '30px' } }, 'Todas las fichas'),
    recuadro('aclaracion', 'Las cinco letras de cada tarjeta', 'Son los cinco usos de IDEAR: ', CODIGOS.map((c, i) => [i ? ', ' : '', h('b', null, c), ' ', USOS[c].nombre.toLowerCase()]), '. Las encendidas indican dónde circula de verdad ese término. Filtra por uso para ver, por ejemplo, qué etiquetas abren derechos (A).'),
    h('form', { class: 'search-big buscador', role: 'search', onsubmit: e => { e.preventDefault(); clearTimeout(t0); estado.q = input.value.trim(); pintar(); alResultado(); } }, input, cuenta),
    resbar,
    lista, mas);

  let t0;
  input.addEventListener('input', () => { clearTimeout(t0); t0 = setTimeout(() => { estado.q = input.value.trim(); pintar(); }, 120); });

  // Primero coincidencias literales (sin tildes), por orden de importancia del campo; si hay pocas, se añaden las aproximadas
  const CAMPOS = [t => [t.lema], t => t.variantes, t => t.figuras.concat(t.obra), t => [t.definicion, t.familia]];
  const indice = new Map(terms.map(t => [t, CAMPOS.map(f => norm(f(t).join(' | ')))]));
  function buscar(q) {
    const nq = norm(q);
    const exactos = [];
    for (const t of terms) {
      const k = indice.get(t).findIndex(c => c.includes(nq));
      if (k >= 0) exactos.push([k, norm(t.lema).startsWith(nq) ? 0 : 1, t]);
    }
    exactos.sort((a, b) => a[0] - b[0] || a[1] - b[1] || (a[0] === 0 ? a[2].lema.length - b[2].lema.length : 0) || a[2].lema.localeCompare(b[2].lema, 'es'));
    const res = exactos.map(x => x[2]);
    if (res.length < 6) {
      const ya = new Set(res);
      for (const r of fuse.search(q)) if (!ya.has(r.item) && r.score < 0.3) res.push(r.item);
    }
    return res;
  }

  const PAG = 60;
  let visibles = PAG;
  function pintar(reset = true) {
    if (reset) visibles = PAG;
    let res;
    if (estado.q.length >= 2) res = buscar(estado.q);
    else res = terms.slice();
    const deEtiqueta = estado.etiqueta && POR_ID.has(estado.etiqueta) ? fichasDe(ctx, estado.etiqueta) : null;
    res = res.filter(t =>
      (!deEtiqueta || deEtiqueta.has(t.id)) && (!estado.familia || t.familia === estado.familia) && (!estado.uso || t.usos.includes(estado.uso)) && (!estado.tipo || t.tipo === estado.tipo) &&
      (!estado.decada || (estado.decada === 'antes' ? (t.anio !== null && t.anio < 1900) : String(t.decada) === estado.decada)) &&
      (!estado.estado || t.estado === estado.estado));
    const yr = t => t.anio ?? 99999;
    if (estado.orden === 'anio') res.sort((a, b) => yr(a) - yr(b));
    else if (estado.orden === '-anio') res.sort((a, b) => (b.anio ?? -99999) - (a.anio ?? -99999));
    else if (estado.orden === 'lema' || estado.q.length < 2) res.sort((a, b) => a.lema.localeCompare(b.lema, 'es'));
    cuenta.textContent = res.length === terms.length ? `${plural(res.length, 'término', 'términos')}` : `${plural(res.length, 'resultado', 'resultados')} de ${terms.length}`;
    const activos = FILTROS.filter(f => estado[f]).length;
    nFiltros.textContent = activos ? ` · ${activos} ${activos === 1 ? 'activo' : 'activos'}` : '';
    lista.replaceChildren(...res.slice(0, visibles).map(termCard));
    if (!res.length) lista.replaceChildren(h('div', { class: 'empty', style: { gridColumn: '1 / -1' } },
      h('p', null, 'Nada por aquí con esa búsqueda y esos filtros. Que no esté en NeuroLab no significa que no exista: quizá aún no tiene ficha. ', h('a', { href: `${'https://github.com/oasa10/NeuroLab'}/issues/new?title=${encodeURIComponent('Propuesta de término: ' + estado.q)}`, rel: 'noopener', target: '_blank' }, 'Propón que la tenga'), '.'), h('p', null, limpiarCopia())));
    mas.replaceChildren(...(res.length > visibles ? [h('button', { class: 'btn', type: 'button', onclick: () => { visibles += PAG; pintar(false); } },
      `Ver ${Math.min(PAG, res.length - visibles)} más`)] : []));
    const p = new URLSearchParams();
    if (estado.q) p.set('q', estado.q);
    for (const f of FILTROS) if (estado[f]) p.set(f, estado[f]);
    if (estado.orden) p.set('orden', estado.orden);
    const qs = p.toString();
    history.replaceState(null, '', `#/explorar${qs ? '?' + qs : ''}`);
  }
  function limpiarCopia() { return h('button', { class: 'btn small', type: 'button', onclick: () => limpiar.click() }, 'Quitar filtros'); }
  pintar();
  // Si se llega con una búsqueda o con filtros, se baja directamente al resultado
  const tactil = matchMedia('(pointer: coarse)').matches;
  if (FILTROS.some(f => estado[f]) && !tactil) plegable.open = true;
  if (estado.q || FILTROS.some(f => estado[f])) requestAnimationFrame(() => { if (tactil) input.blur(); resbar.scrollIntoView({ block: 'start' }); });
}
