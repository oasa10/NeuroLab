// Utilidades comunes de NeuroLab: datos, DOM, colores, formatos y las piezas del método que se repiten en toda la web.

export const URL_BASE = 'https://oasa10.github.io/NeuroLab/';
export const REPO = 'https://github.com/oasa10/NeuroLab';

// IDEAR: los cinco usos de una etiqueta. Cambia el uso, cambia la prueba.
export const USOS = {
  I: { nombre: 'Investigar', verbo: 'investigar', para: 'describir y estudiar grupos', donde: 'la ciencia',
       pregunta: '¿Sirve para describir y comparar grupos de forma fiable?',
       prueba: 'Fiabilidad y validez para describir y comparar grupos. No necesita acertar con cada persona.' },
  D: { nombre: 'Diagnosticar', verbo: 'diagnosticar', para: 'orientar la atención clínica de una persona', donde: 'la consulta',
       pregunta: '¿Ayuda a entender y atender a esta persona concreta?',
       prueba: 'Criterios claros, evaluación diferencial y validación para esa población y esa finalidad. Si lleva a un tratamiento, también beneficios, daños y alternativas.' },
  E: { nombre: 'Educar', verbo: 'educar', para: 'decidir apoyos y ajustes en la escuela', donde: 'el aula',
       pregunta: '¿Orienta apoyos útiles para aprender?',
       prueba: 'Que oriente apoyos útiles, proporcionados y revisables. Muchas veces basta con describir la necesidad, sin diagnóstico.' },
  A: { nombre: 'Acceder', verbo: 'acceder', para: 'abrir derechos, recursos o prestaciones', donde: 'las instituciones',
       pregunta: '¿Reparte recursos con reglas claras y revisables?',
       prueba: 'Reglas de elegibilidad claras, razones para repartir así y una vía para revisar las decisiones.' },
  R: { nombre: 'Reconocerse', verbo: 'reconocerse', para: 'identidad, pertenencia y comunidad', donde: 'la vida de cada cual',
       pregunta: '¿Ayuda a alguien a entenderse y a encontrar a los suyos?',
       prueba: 'Claridad y respeto. No necesita una prueba clínica, pero tampoco la sustituye.' },
};
export const CODIGOS = Object.keys(USOS);
export const IDEAR_FRASE = 'Investigar, Diagnosticar, Educar, Acceder y Reconocerse: la misma palabra, cinco trabajos distintos.';

export const FAMILIAS = ['Clasificar y medir', 'Neurodesarrollo', 'Altas capacidades y excepcionalidades', 'Coexistencias y fronteras',
  'Saltos de inferencia', 'Identidad y comunidad', 'Escuela, apoyos e instituciones', 'Cerebro, cuerpo y tratamiento'];

export const TIPOS = {
  categoria: 'Categoría diagnóstica', concepto: 'Concepto', persona: 'Persona', documento: 'Documento o ley', movimiento: 'Movimiento', institucion: 'Institución',
};

export const FASES = [
  { n: 0, nombre: 'Antes de los nombres', corto: 'Antes de 1900', desde: -10000, hasta: 1899 },
  { n: 1, nombre: 'Primeros retratos', corto: '1900–1979', desde: 1900, hasta: 1979 },
  { n: 2, nombre: 'La era de los criterios', corto: '1980–1993', desde: 1980, hasta: 1993 },
  { n: 3, nombre: 'Espectros y neurodiversidad', corto: '1994–2012', desde: 1994, hasta: 2012 },
  { n: 4, nombre: 'Un espectro, muchas voces', corto: '2013–hoy', desde: 2013, hasta: 2100 },
];
export const faseDe = a => (a === null || a === undefined ? null : FASES.find(f => a >= f.desde && a <= f.hasta)?.n ?? null);

export const ESTADOS = {
  verificada: { nombre: 'Verificada', ayuda: 'El año y la obra coinciden en al menos una fuente fiable.' },
  probable: { nombre: 'Probable', ayuda: 'Solo coinciden fuentes generales.' },
  propia: { nombre: 'Del proyecto', ayuda: 'Concepto propio de NeuroLab: no lo fija una fuente externa, se explica con sus razones.' },
  dudosa: { nombre: 'Dudosa', ayuda: 'Las fuentes se contradicen o no hay fuente: no entra en los juegos.' },
  'sin verificar': { nombre: 'Por verificar', ayuda: 'Todavía no se ha comprobado.' },
};

export const VEREDICTOS = {
  mito: { nombre: 'Mito', ico: '✗', ayuda: 'La evidencia no lo sostiene.' },
  matiz: { nombre: 'Matiz', ico: '≈', ayuda: 'Tiene parte de verdad, pero así dicho engaña.' },
  cierto: { nombre: 'Cierto', ico: '✓', ayuda: 'La evidencia lo sostiene, con sus límites.' },
};

// Las seis preguntas para cualquier etiqueta, en cualquier uso
export const SEIS = [
  { k: 'define', p: '¿Qué se define?', ayuda: 'Qué rasgo, conducta o necesidad nombra la etiqueta, y qué deja fuera.' },
  { k: 'identifica', p: '¿Cómo se identifica?', ayuda: 'Con qué criterios, pruebas o testimonios, y quién lo hace.' },
  { k: 'aplica', p: '¿A quién se aplica?', ayuda: 'A qué población, edad o situación; si se probó con gente parecida.' },
  { k: 'habilita', p: '¿Qué decisión habilita?', ayuda: 'Qué cambia por llevarla: un tratamiento, un apoyo, un derecho, una pertenencia.' },
  { k: 'consecuencias', p: '¿Qué consecuencias se observan?', ayuda: 'Qué pasa de verdad después: beneficios, daños, efectos inesperados.' },
  { k: 'revisa', p: '¿Quién puede revisar el uso?', ayuda: 'Quién puede discutirlo, corregirlo o retirarlo, incluida la persona etiquetada.' },
];

// Los saltos de inferencia: lo que falta para pasar de una orilla a otra
export const SALTOS = [
  { id: 'rasgo', de: 'Del rasgo', a: 'al diagnóstico', falta: 'Criterios, umbral y evaluación diferencial: tener un rasgo no es tener un trastorno.', ej: '«Se distrae mucho: seguro que tiene TDAH».' },
  { id: 'tratamiento', de: 'Del diagnóstico', a: 'al tratamiento', falta: 'Pertinencia: beneficios, daños y alternativas para esa persona.', ej: '«Si tiene el diagnóstico, necesita medicación».' },
  { id: 'auto', de: 'De la autoadscripción', a: 'a la confirmación', falta: 'Exactitud: reconocerse en algo es valioso, pero no es una evaluación clínica.', ej: '«Me he visto en diez vídeos, así que lo tengo».' },
  { id: 'nueva', de: 'De la coexistencia', a: 'a una nueva entidad', falta: 'Que el combinado se distinga de sus partes y sea útil por sí mismo.', ej: '«TDAH más autismo es un trastorno nuevo».' },
  { id: 'norma', de: 'De la norma', a: 'al resultado', falta: 'Implementación y efectos: una ley escrita no es un apoyo recibido.', ej: '«La ley ya obliga a hacer ajustes, así que el problema está resuelto».' },
  { id: 'grupo', de: 'Del grupo', a: 'al individuo', falta: 'Lo que el promedio no dice de cada persona.', ej: '«Los estudios dicen que son menos empáticos, así que tu hijo también».' },
  { id: 'causa', de: 'De la asociación', a: 'a la causa', falta: 'Un diseño que descarte otras explicaciones.', ej: '«Los niños con más pantallas tienen más TDAH: las pantallas lo causan».' },
  { id: 'cosa', de: 'De la etiqueta', a: 'al mecanismo', falta: 'Pruebas del mecanismo: nombrar algo no lo explica (reificación).', ej: '«No hace los deberes porque tiene TDAH».' },
  { id: 'moda', de: 'Del aumento de diagnósticos', a: 'a «moda» o «epidemia»', falta: 'Separar mejor detección, criterios nuevos y cambio real.', ej: '«Si hay el triple de diagnósticos, es que ahora es moda».' },
  { id: 'trampa', de: 'Del incentivo', a: 'a la trampa', falta: 'Pruebas de mal uso, no solo de que exista un incentivo.', ej: '«Si el diagnóstico da más tiempo en el examen, la gente lo busca para hacer trampa».' },
];

// Los dos errores que se pesan por igual
export const ERRORES = {
  ampliar: { nombre: 'Ampliar sin justificación', corto: 'Etiquetar de más', ej: 'Llamar trastorno a una variación que no causa dificultad, o dar un tratamiento que no hace falta.' },
  excluir: { nombre: 'Dejar fuera a quien lo necesita', corto: 'Etiquetar de menos', ej: 'Negar un apoyo o un diagnóstico a quien sí lo necesita porque «no da el perfil».' },
};

export function h(tag, attrs, ...kids) {
  const el = document.createElement(tag);
  if (attrs) for (const [k, v] of Object.entries(attrs)) {
    if (v === null || v === undefined || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'html') el.innerHTML = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (k === 'style' && typeof v === 'object') { for (const [p, x] of Object.entries(v)) { if (p.startsWith('--')) el.style.setProperty(p, x); else el.style[p] = x; } }
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const k of kids.flat(Infinity)) {
    if (k === null || k === undefined || k === false) continue;
    el.append(k instanceof Node ? k : document.createTextNode(String(k)));
  }
  return el;
}

export const $ = (s, r = document) => r.querySelector(s);
export const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export function anio(a, tipo) {
  if (a === null || a === undefined) return 's. f.';
  if (a <= -5000) return `h. ${Math.abs(a).toLocaleString('es-ES')} a. C.`;
  if (a < 0) return `${Math.abs(a)} a. C.`;
  return String(a);
}

export function norm(s) {
  return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

export function shuffle(arr, rnd = Math.random) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

export function chipUso(code, opts = {}) {
  const v = USOS[code];
  if (!v) return null;
  return h('span', { class: 'chip chip-v', 'data-v': code, title: `${v.nombre}: ${v.para}` },
    h('span', { class: 'dot', 'aria-hidden': 'true' }), opts.corto ? code : v.nombre);
}

// Las cinco letras de IDEAR, encendidas las que tocan
export function idear(usos, opts = {}) {
  const set = new Set(usos || []);
  return h('span', { class: `idear${opts.grande ? ' grande' : ''}`, role: 'img', 'aria-label': `Usos: ${CODIGOS.filter(c => set.has(c)).map(c => USOS[c].nombre).join(', ') || 'ninguno'}` },
    CODIGOS.map(c => h('i', { 'data-v': c, class: set.has(c) ? 'on' : '', title: `${USOS[c].nombre}: ${USOS[c].para}`, 'aria-hidden': 'true' }, c)));
}

export function marcaVeredicto(v) {
  const x = VEREDICTOS[v];
  return x ? h('span', { class: `veredicto v-${v}`, title: x.ayuda }, h('b', { 'aria-hidden': 'true' }, x.ico), x.nombre) : null;
}

export function marcaEstado(estado) {
  if (estado === 'verificada') return null;
  const e = ESTADOS[estado] || ESTADOS['sin verificar'];
  return h('span', { class: `estado estado-${norm(estado).replace(/\s+/g, '-')}`, title: e.ayuda }, e.nombre);
}

export function link(href, ...kids) { return h('a', { href }, ...kids); }

export function storage(key, val) {
  try {
    if (val === undefined) return JSON.parse(localStorage.getItem('neurolab:' + key));
    localStorage.setItem('neurolab:' + key, JSON.stringify(val));
  } catch (e) { return null; }
}

export function cssVar(name, el = document.documentElement) {
  return getComputedStyle(el).getPropertyValue(name).trim();
}

export function plural(n, uno, varios) { return `${n.toLocaleString('es-ES')} ${n === 1 ? uno : varios}`; }

export function corta(s, n = 140) {
  s = String(s || '');
  if (s.length <= n) return s;
  return s.slice(0, s.lastIndexOf(' ', n - 1)).replace(/[,;:.]$/, '') + '…';
}

// Familias: clase de color y nombre corto
export const FAM_SLUG = {
  'Clasificar y medir': 'clasificar', 'Neurodesarrollo': 'neurodesarrollo', 'Altas capacidades y excepcionalidades': 'capacidades',
  'Coexistencias y fronteras': 'fronteras', 'Saltos de inferencia': 'saltos', 'Identidad y comunidad': 'identidad',
  'Escuela, apoyos e instituciones': 'escuela', 'Cerebro, cuerpo y tratamiento': 'cerebro',
};
export const FAM_CORTA = {
  'Clasificar y medir': 'Clasificar', 'Neurodesarrollo': 'Neurodesarrollo', 'Altas capacidades y excepcionalidades': 'Altas capacidades',
  'Coexistencias y fronteras': 'Fronteras', 'Saltos de inferencia': 'Saltos', 'Identidad y comunidad': 'Identidad',
  'Escuela, apoyos e instituciones': 'Escuela', 'Cerebro, cuerpo y tratamiento': 'Cerebro y cuerpo',
};
// Orden del anillo del mapa (los vecinos tienen colores distinguibles)
export const FAM_ANILLO = ['Clasificar y medir', 'Neurodesarrollo', 'Coexistencias y fronteras', 'Altas capacidades y excepcionalidades',
  'Identidad y comunidad', 'Escuela, apoyos e instituciones', 'Cerebro, cuerpo y tratamiento', 'Saltos de inferencia'];
export const famVar = f => `var(--f-${FAM_SLUG[f] || 'clasificar'})`;
export const famColor = f => cssVar(`--f-${FAM_SLUG[f] || 'clasificar'}`);
export const usoColor = v => cssVar(`--v-${v}`);

export function famTag(f) {
  return h('span', { class: 'fam', style: { '--fc': famVar(f) } }, f);
}

export function termCard(t) {
  return h('a', { class: `tcard${t.estado === 'dudosa' ? ' dudosa' : ''}`, href: `#/termino/${encodeURIComponent(t.id)}` },
    h('div', { class: 'row' }, h('h3', null, t.lema), h('span', { class: 'yr' }, anio(t.anio))),
    h('p', null, corta(t.definicion, 150)),
    h('div', { class: 'meta' }, idear(t.usos), famTag(t.familia), t.tipo === 'persona' ? h('span', { class: 'chip' }, 'Persona') : null, marcaEstado(t.estado)));
}

// Ventana flotante para los gráficos
export const tip = {
  el: null,
  show(content, x, y) {
    const el = this.el || (this.el = document.getElementById('tip'));
    el.replaceChildren(...(Array.isArray(content) ? content : [content]));
    el.classList.add('on');
    const r = el.getBoundingClientRect();
    let left = x + 14, top = y + 14;
    if (left + r.width > innerWidth - 8) left = Math.max(8, x - r.width - 14);
    if (top + r.height > innerHeight - 8) top = Math.max(8, y - r.height - 14);
    el.style.left = left + 'px'; el.style.top = top + 'px';
  },
  hide() { (this.el || document.getElementById('tip'))?.classList.remove('on'); },
};

export function tipTerm(t) {
  return [h('b', null, t.lema), h('div', { class: 'm' }, [anio(t.anio), t.familia, t.usos.join('')].filter(Boolean).join(' · ')),
    h('div', null, corta(t.definicion, 120))];
}

export function seccion(titulo, ...kids) { return h('section', null, h('h2', null, titulo), ...kids); }

// Aleatorio con semilla (para que una partida se pueda repetir si hace falta)
export function rng(seed = Date.now()) {
  let s = seed >>> 0;
  return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

// Texto legible sobre un color de relleno: blanco o tinta oscura, el que más contraste
export function tintaSobre(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex).trim());
  if (!m) return '#fff';
  const n = parseInt(m[1], 16), ch = [n >> 16, (n >> 8) & 255, n & 255].map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
  const L = 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
  return (1.05 / (L + 0.05)) >= ((L + 0.05) / 0.0277) ? '#fff' : '#14202A';
}

// Cabecera de página con su nivel
export const NIVELES = { 1: 'Nivel 1 · Enterarte', 2: 'Nivel 2 · Implicarte' };
export function cabeza(nivel, titulo, lead, ...extra) {
  return h('header', { class: 'page-head' }, nivel ? h('p', { class: 'nivel' }, NIVELES[nivel]) : null, h('h1', null, titulo),
    lead ? h('p', { class: 'lead' }, lead) : null, ...extra);
}

// Recuadros didácticos: sabias, atencion, aclaracion, recuerda, piensa, profundizar
const TITULOS = { sabias: '¿Sabías que…?', atencion: 'Atención', aclaracion: 'Aclaración', recuerda: 'Para recordar', piensa: 'Piénsalo', profundizar: 'Para profundizar' };
export function recuadro(tipo, titulo, ...kids) {
  return h('aside', { class: `callout ${tipo}` }, h('b', { class: 'ct' }, titulo || TITULOS[tipo]), h('div', null, ...kids));
}

// Cuadros de diálogo entre Todo Moda (todo es exageración), Todo Cerebro (todo es biología) y Para Qué (pregunta por el uso)
export const PERSONAJES = {
  moda: { nombre: 'Todo Moda', av: 'TM', c: 'var(--e-crear)' },
  cerebro: { nombre: 'Todo Cerebro', av: 'TC', c: 'var(--e-saber)' },
  uso: { nombre: 'Para Qué', av: '¿?', c: 'var(--e-hacer)' },
  tu: { nombre: 'Tú', av: 'TÚ', c: 'var(--n2)' },
};
export function dialogo(lineas, anima = true) {
  return h('div', { class: `dialogo${anima ? ' anima' : ''}` }, lineas.map(([quien, texto], i) => {
    const p = PERSONAJES[quien] || { nombre: quien, av: quien.slice(0, 2).toUpperCase(), c: 'var(--muted)' };
    return h('div', { class: `burbuja${i % 2 ? ' der' : ''}`, style: { animationDelay: `${i * 0.35}s` } },
      h('span', { class: 'av', style: { '--c': p.c }, 'aria-hidden': 'true' }, p.av), h('div', { class: 'txt' }, h('b', null, p.nombre), texto));
  }));
}

// Pasos de una actividad
export function pasos(nombres, actual) {
  const out = [];
  nombres.forEach((n, i) => {
    if (i) out.push(h('span', { class: 'sep', 'aria-hidden': 'true' }));
    out.push(h('span', { class: i < actual ? 'hecho' : i === actual ? 'aqui' : '' }, h('i', null, i < actual ? '✓' : i + 1), n));
  });
  return h('div', { class: 'pasos', 'aria-label': `Paso ${actual + 1} de ${nombres.length}: ${nombres[actual] || 'hecho'}` }, out);
}

// Botones que se activan y desactivan
export function toggles(opciones, { multiple = false, alCambiar, valor = multiple ? [] : null } = {}) {
  let sel = multiple ? new Set(valor) : valor;
  const wrap = h('div', { class: 'toggles', role: 'group' });
  const btns = opciones.map(([v, l]) => {
    const b = h('button', { class: 'toggle', type: 'button', 'aria-pressed': String(multiple ? sel.has(v) : sel === v) }, l);
    b.addEventListener('click', () => {
      if (multiple) { sel.has(v) ? sel.delete(v) : sel.add(v); } else sel = sel === v ? null : v;
      btns.forEach((x, k) => x.setAttribute('aria-pressed', String(multiple ? sel.has(opciones[k][0]) : sel === opciones[k][0])));
      alCambiar?.(multiple ? [...sel] : sel);
    });
    return b;
  });
  wrap.append(...btns);
  wrap.valor = () => (multiple ? [...sel] : sel);
  return wrap;
}

// Descargar un texto como archivo, sin servidor
export function descargar(nombre, texto, tipo = 'text/plain') {
  const url = URL.createObjectURL(new Blob([texto], { type: `${tipo};charset=utf-8` }));
  const a = h('a', { href: url, download: nombre });
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function fecha(iso) { try { return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }); } catch (e) { return ''; } }

// Texto con *cursiva* y párrafos separados por una línea en blanco
export function inline(texto) {
  const out = [];
  String(texto || '').split(/(\*[^*\n]+\*)/g).forEach(trozo => {
    if (/^\*[^*\n]+\*$/.test(trozo)) out.push(h('i', null, trozo.slice(1, -1))); else if (trozo) out.push(trozo);
  });
  return out;
}
export function parrafos(texto) {
  return String(texto || '').split(/\n\s*\n/).map(p => p.trim()).filter(Boolean).map(p => h('p', null, inline(p)));
}

// Sustituye el contenido de un elemento, saltándose los huecos (null, undefined, false)
export function poner(el, ...kids) {
  el.replaceChildren(...kids.flat(Infinity).filter(k => k !== null && k !== undefined && k !== false));
  return el;
}

// El logo: una etiqueta (lo que se nombra) y cinco puntos (los cinco usos de IDEAR, cada uno con su prueba)
export const LOGO = '<svg class="logo" viewBox="0 0 40 40" aria-hidden="true" focusable="false"><path class="lleno" fill-rule="evenodd" d="M2.5 20 9.6 11h11.2a2.2 2.2 0 0 1 2.2 2.2v13.6a2.2 2.2 0 0 1-2.2 2.2H9.6ZM8.1 20a2.1 2.1 0 1 0 4.2 0a2.1 2.1 0 1 0-4.2 0Z"/><g class="puntos"><circle cx="28.70" cy="9.30" r="2.3" style="--i:0;--c:var(--v-I)"/><circle cx="33.40" cy="14.00" r="2.3" style="--i:1;--c:var(--v-D)"/><circle cx="35.20" cy="20.00" r="2.3" style="--i:2;--c:var(--v-E)"/><circle cx="33.40" cy="26.00" r="2.3" style="--i:3;--c:var(--v-A)"/><circle cx="28.70" cy="30.70" r="2.3" style="--i:4;--c:var(--v-R)"/></g></svg>';

// Cinco imágenes, una por uso (L13): un dibujo por clase de trabajo de la etiqueta, no uno por ficha
const DIBUJOS = {
  I: '<circle cx="20" cy="20" r="12"/><path d="M29 29l11 11"/><circle cx="15" cy="23" r="2.4" fill="currentColor" stroke="none"/><circle cx="20" cy="16" r="2.4" fill="currentColor" stroke="none"/><circle cx="25" cy="23" r="2.4" fill="currentColor" stroke="none"/>',
  D: '<circle cx="18" cy="15" r="6"/><path d="M6 39c0-7.5 5.4-12.5 12-12.5S30 31.5 30 39"/><path d="M38 12v13"/><path d="M31.5 18.5h13"/>',
  E: '<path d="M24 13c-5-3.6-11.5-3.8-17-1.6v25c5.5-2.2 12-2 17 1.6c5-3.6 11.5-3.8 17-1.6v-25c-5.5-2.2-12-2-17 1.6z"/><path d="M24 13v25"/>',
  A: '<circle cx="15" cy="24" r="7.5"/><path d="M22.5 24H41"/><path d="M35 24v7"/><path d="M40.5 24v5"/>',
  R: '<circle cx="24" cy="15" r="5.5" fill="currentColor" stroke="none"/><path d="M14.5 37c0-6 4.2-10 9.5-10s9.5 4 9.5 10"/><circle cx="9.5" cy="20" r="4"/><circle cx="38.5" cy="20" r="4"/><path d="M3 36c0-5 2.8-8.2 6.5-8.2M45 36c0-5-2.8-8.2-6.5-8.2"/>',
};
export function imgUso(c, { grande = false } = {}) {
  if (!DIBUJOS[c]) return null;
  return h('span', { class: `vimg${grande ? ' grande' : ''}`, style: { '--c': `var(--v-${c})` }, 'aria-hidden': 'true',
    html: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" focusable="false">${DIBUJOS[c]}</svg>` });
}

// Escuchar con el Lector común (assets/vendor/lector): lee por párrafos, con pausas, la voz elegida y un reproductor
const LECTOR = typeof window !== 'undefined' ? window.Lector : null;
export const HAY_VOZ = !!(LECTOR && LECTOR.ok);
if (HAY_VOZ) LECTOR.configurar({ sitio: 'neurolab', subir: '.toasts', color: '#AFA4F2' });
export function pararVoz() { if (HAY_VOZ) LECTOR.parar(); }
export function leerEnVoz(fuente, alFin) { if (HAY_VOZ) LECTOR.leer(fuente, { alCambiar: on => { if (!on && alFin) alFin(); } }); }
// Botón «Escuchar»: fuente() devuelve los nodos que se leen, de arriba abajo; vuelve a pulsarse para parar
export function botonEscuchar(fuente, etiqueta = 'Escuchar', titulo) {
  return HAY_VOZ ? LECTOR.boton(fuente, { etiqueta, titulo, clase: 'btn small escuchar' }) : null;
}
