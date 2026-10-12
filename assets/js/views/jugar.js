// Jugar: cinco juegos para poner a prueba lo aprendido. Cada partida suma en tu cuaderno.
// Solo juegan las fichas aptas (ctx.juego): las dudosas se quedan en el banquillo, no sería justo.
import { h, USOS, CODIGOS, VEREDICTOS, anio, shuffle, storage, corta, cabeza, recuadro, marcaVeredicto, famTag, norm, plural } from '../lib.js';
import * as cuaderno from '../cuaderno.js';
import { pasoMinimo } from '../metodo.js';

const JUEGOS = {
  etiqueta: {
    titulo: '¿Qué etiqueta es?', eje: 'saber', rondas: '10 rondas',
    texto: 'Lee una definición con el nombre tapado y elige la etiqueta (o la persona) entre cuatro parecidas.',
    entrena: 'pasar de nombres sueltos a datos con su definición.', f: juegoEtiqueta,
  },
  historia: {
    titulo: 'Ordena la historia', eje: 'saber', rondas: '5 rondas',
    texto: 'Cinco fichas con año: ordénalas de la más antigua a la más reciente, arrastrando o con las flechas.',
    entrena: 'ordenar los datos en el tiempo, que es cuando empiezan a ser información.', f: juegoHistoria,
  },
  usos: {
    titulo: '¿Para qué se usa?', eje: 'hacer', rondas: '10 rondas',
    texto: 'Una situación concreta y cinco usos: ¿la etiqueta está investigando, diagnosticando, educando, abriendo un acceso o ayudando a reconocerse?',
    entrena: 'aplicar IDEAR a casos reales. Con 8 de 10, insignia «Manos a IDEAR».', f: juegoUsos,
  },
  mito: {
    titulo: '¿Mito, matiz o cierto?', eje: 'saber', rondas: '10 rondas · unos dos minutos',
    texto: 'Frases que se oyen a menudo. Decide si son mito, matiz o cierto, y mira qué dice la evidencia.',
    entrena: 'separar evidencia, controversia y opinión. Con 8 de 10, insignia «Separador de mitos».', f: juegoMito,
  },
  antes: {
    titulo: '¿Antes o después?', eje: 'hacer', rondas: 'hasta que falles',
    texto: 'Dos fichas: ¿la segunda es de antes o de después que la primera? Sigue hasta que falles. ¿Llegarás a diez?',
    entrena: 'soltura con la cronología. Con 10 seguidas, insignia «En racha».', f: juegoAntes,
  },
};

const EJE_NOMBRE = { saber: 'Saber', hacer: 'Hacer' };
const ficha = t => `#/termino/${encodeURIComponent(t.id)}`;

export function render(root, ctx, parts) {
  // Atajos de teclado del juego en curso (se quitan al salir de la página)
  let teclas = null;
  const onKey = e => {
    if (!teclas || e.altKey || e.ctrlKey || e.metaKey || e.repeat) return;
    if (e.target.closest?.('input, textarea, select, [contenteditable]')) return;
    teclas(e);
  };
  document.addEventListener('keydown', onKey);
  const vista = { destroy() { document.removeEventListener('keydown', onKey); teclas = null; }, retema() { /* todo va con variables CSS */ } };
  const k = parts[0];
  if (k && JUEGOS[k]) {
    const J = JUEGOS[k];
    document.title = `${J.titulo} · NeuroLab`;
    const el = h('div', { class: 'jg-zona' });
    const vivo = h('div', { class: 'sr-only', 'aria-live': 'polite', 'aria-atomic': 'true' });
    root.append(
      h('nav', { class: 'crumbs', 'aria-label': 'Migas' }, h('a', { href: '#/jugar' }, 'Jugar'), ' › ', J.titulo),
      cabeza(2, J.titulo, J.texto),
      h('nav', { class: 'subtabs jg-tabs', 'aria-label': 'Los cinco juegos' }, Object.entries(JUEGOS).map(([c, x]) =>
        h('a', { href: `#/jugar/${c}`, 'aria-current': c === k ? 'page' : null }, x.titulo))),
      h('div', { class: 'game jg' }, el, vivo));
    const api = {
      clave: k, juego: J,
      teclas: f => { teclas = f; },
      anunciar: txt => { vivo.textContent = ''; setTimeout(() => { vivo.textContent = txt; }, 60); },
    };
    J.f(el, ctx, api);
    return vista;
  }
  portada(root, ctx);
  return vista;
}

// ——— Portada ———
function portada(root, ctx) {
  document.title = 'Jugar · NeuroLab';
  const n = ctx.terms.filter(ctx.juego).length;
  root.append(
    cabeza(2, 'Jugar', `Cinco juegos para poner a prueba lo aprendido con ${plural(n, 'ficha', 'fichas')}. Las dudosas no juegan: no sería justo. Cada partida suma en tu cuaderno, y tus marcas se quedan solo en este navegador.`),
    h('div', { class: 'actividades jg-portada' }, Object.entries(JUEGOS).map(([k, J], i) => {
      const m = marcaTexto(k);
      return h('a', { class: 'actividad', href: `#/jugar/${k}` },
        h('span', { class: 'num', 'aria-hidden': 'true' }, i + 1),
        h('h3', null, J.titulo),
        h('p', null, J.texto),
        h('div', { class: 'pie' }, cuaderno.chipEje(J.eje), h('span', null, J.rondas)),
        h('p', { class: 'small jg-marca' }, m ? ['Tu mejor marca: ', h('b', null, m)] : 'Aún no has jugado'));
    })),
    recuadro('aclaracion', '¿Qué eje sube cada juego?',
      h('p', { style: { margin: '0 0 6px' } }, 'Terminar cualquier juego te sube en ', h('b', null, 'Hacer'), ': acabar uno es el peldaño Habilidad y sacar un 80 % o más, Destreza. Sacar un 60 % o más es uno de los requisitos de Conocimiento en ', h('b', null, 'Saber'), '. Además, cada juego entrena algo propio:'),
      h('ul', { class: 'jg-ejes' }, Object.values(JUEGOS).map(J => h('li', null, h('b', null, J.titulo), ' ', cuaderno.chipEje(J.eje), ' ', J.entrena)))),
    recuadro('piensa', '¿Te quedas con ganas?',
      h('p', { style: { margin: 0 } }, 'Prueba el ', h('a', { href: '#/aprender/saltos' }, 'detector de saltos'), ', que te pone delante frases para cazar los saltos de inferencia, o las ',
        h('a', { href: '#/pensar/situaciones' }, 'situaciones con reloj'), ', conversaciones en las que hay que responder antes de que se calienten.')));
}

// ——— Marcas (solo en este navegador) ———
function leerMarca(k) {
  const m = storage(`mejor:${k}`);
  if (m && typeof m === 'object' && Number.isFinite(m.p)) return m;
  if (Number.isFinite(m)) return { p: m, t: k === 'antes' ? null : 10 };
  return null;
}
function marcaTexto(k) {
  const m = leerMarca(k);
  if (!m) return null;
  return k === 'antes' ? `racha de ${m.p}` : `${m.p}/${m.t}`;
}
const pct = m => (m && m.t ? m.p / m.t : 0);
function guardarMarca(k, p, t) {
  const previo = leerMarca(k);
  const mejora = k === 'antes' ? !previo || p > previo.p : !previo || p / t > pct(previo) || (p / t === pct(previo) && p > previo.p);
  if (mejora) storage(`mejor:${k}`, { p, t: k === 'antes' ? null : t, fecha: new Date().toISOString() });
  return { previo, mejora };
}

// ——— Piezas comunes ———
function marcador(i, total, puntos, etiqueta = 'Ronda') {
  return h('div', { class: 'game-top' }, h('span', null, `${etiqueta} ${i + 1} de ${total}`),
    h('div', { class: 'progress', 'aria-hidden': 'true' }, h('i', { style: { width: `${100 * i / total}%` } })),
    h('span', null, plural(puntos, 'punto', 'puntos')));
}

// Lleva a la vista un elemento si se ha quedado fuera de la pantalla
function aLaVista(node, bloque = 'start') {
  if (!node) return;
  const r = node.getBoundingClientRect();
  if (r.top < 0 || r.bottom > innerHeight) node.scrollIntoView({ block: bloque, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
}

function siguienteBtn(texto, alPulsar) {
  return h('button', { class: 'btn primary jg-next', type: 'button', onclick: alPulsar }, texto);
}

function vacio(el, texto) {
  el.replaceChildren(recuadro('aclaracion', 'Aún no hay fichas suficientes', h('p', { style: { margin: '0 0 8px' } }, texto),
    h('p', { style: { margin: 0 } }, h('a', { class: 'btn small', href: '#/jugar' }, 'Ver los otros juegos'))));
}

function mensaje(r, clave) {
  if (r === 1) return { usos: 'Pleno. Cambia el uso, cambia la prueba: lo tienes. Ahora toca notarlo fuera, que es donde se complica.',
    mito: 'Pleno. Ni una frase hecha te ha pillado con el paso cambiado. Las sobremesas familiares tiemblan.' }[clave]
    || 'Pleno. Ni un titular te pilla con el paso cambiado. El reto de verdad viene ahora: usarlo fuera.';
  if (r >= 0.8) return 'Muy bien. Los pocos fallos son justo los que más enseñan: repásalos con calma.';
  if (r >= 0.6) return 'Buen trabajo. Ya sabes más que el titular medio (no es mucho pedir, pero cuenta).';
  if (r >= 0.4) return 'Vas bien. Fallar aquí sale barato y enseña mucho: mejor aquí que en una tertulia.';
  if (r > 0) return 'Hoy las etiquetas han jugado en casa. Les pasa a los mejores, y a más de un tertuliano. Mira los fallos: ahí está lo jugoso.';
  return 'Cero, y con estilo. Estas palabras son más escurridizas de lo que parecen; por eso existe este juego. Repasa los fallos y vuelve.';
}

function mensajeRacha(n) {
  if (n >= 10) return 'En racha de verdad: tienes la cronología en la cabeza. Ni un manual de historia te sigue el ritmo.';
  if (n >= 5) return 'Muy bien. Ya tienes un buen trozo de la historia ordenado. A por los diez.';
  if (n >= 1) return 'Buen calentamiento. Las fechas engañan: muchas palabras que suenan nuevas son más viejas de lo que parecen.';
  return 'Racha de cero. Tranquilidad: la historia de estas etiquetas es tan enrevesada que hasta los manuales diagnósticos se revisan una y otra vez.';
}

// Pantalla final: puntuación, mensaje amable, fallos con sus fichas, repetir y un paso fuera de la pantalla
function final(el, api, { puntos, total, totalCuaderno = total, racha = false, fallos = [], paso, otra }) {
  const clave = api.clave;
  cuaderno.juego(clave, puntos, totalCuaderno);
  const { previo, mejora } = guardarMarca(clave, puntos, total);
  const msg = racha ? mensajeRacha(puntos) : mensaje(total ? puntos / total : 0, clave);
  const marca = leerMarca(clave);
  const titulo = h('h2', { class: 'jg-score', tabindex: '-1' },
    h('span', { class: 'eyebrow' }, racha ? 'Tu racha' : 'Resultado'),
    h('span', { class: 'score-big' }, racha ? puntos : `${puntos}/${total}`));
  const notaMarca = previo && mejora ? '¡Nueva mejor marca en este navegador!'
    : marca ? `Tu mejor marca en este navegador: ${marcaTexto(clave)}.` : null;
  const pasoCaja = h('div');
  const abrirPaso = h('button', { class: 'btn small', type: 'button', 'aria-expanded': 'false', onclick: () => {
    if (pasoCaja.childElementCount) { pasoCaja.replaceChildren(); abrirPaso.setAttribute('aria-expanded', 'false'); return; }
    pasoCaja.append(pasoMinimo({ sugerencia: paso.sugerencia, titulo: 'Tu paso mínimo', origen: `jugar:${clave}` }));
    abrirPaso.setAttribute('aria-expanded', 'true');
    pasoCaja.querySelector('input')?.focus();
  } }, 'Convertirlo en mi paso mínimo');

  el.replaceChildren(
    h('section', { class: 'card jg-final' },
      titulo,
      h('p', { class: 'jg-msg' }, msg),
      notaMarca ? h('p', { class: 'small muted' }, notaMarca) : null,
      h('div', { class: 'btns' }, h('button', { class: 'btn primary', type: 'button', onclick: otra }, 'Jugar otra vez'), h('a', { class: 'btn', href: '#/jugar' }, 'Otros juegos'))),
    h('section', { class: 'jg-repaso' },
      h('h3', null, fallos.length ? 'Para repasar' : 'Nada que repasar'),
      fallos.length ? h('ul', { class: 'jg-fallos' }, fallos) : h('p', { class: 'muted' }, 'Ni un fallo. Si quieres más, cambia de juego: cada uno mira las etiquetas desde un sitio distinto.')),
    recuadro('piensa', 'Un paso fuera de la pantalla', h('p', { style: { margin: '0 0 8px' } }, paso.texto), h('div', { class: 'btns' }, abrirPaso), pasoCaja));
  api.teclas(null);
  api.anunciar(`${racha ? `Fin de la partida. Racha de ${puntos}.` : `Resultado: ${puntos} de ${total}.`} ${msg}`);
  titulo.focus({ preventScroll: true });
  aLaVista(titulo);
}

// Un fallo en la lista de repaso
function fallo(...kids) { return h('li', null, ...kids); }

// ——— 1. ¿Qué etiqueta es? ———
// Tapa el nombre (y sus variantes) dentro de la definición
const SUF = ['idades', 'idad', 'aciones', 'acion', 'ciones', 'cion', 'ismos', 'ismo', 'istas', 'ista', 'icos', 'icas', 'ico', 'ica',
  'ados', 'adas', 'ado', 'ada', 'ias', 'ios', 'ia', 'io', 'es', 'os', 'as', 's', 'o', 'a', 'e'];
function raiz(w) {
  if (w.length <= 3) return null; // palabra corta: tal cual
  let r = w;
  for (const s of SUF) if (w.endsWith(s) && w.length - s.length >= 4) { r = w.slice(0, -s.length); break; }
  const p = w.slice(0, Math.max(4, Math.ceil(w.length * 0.7)));
  return p.length < r.length ? p : r;
}
const escRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
function patron(frase) {
  const toks = norm(frase).replace(/[«»"“”'’]/g, ' ').split(/[^a-z0-9]+/).filter(Boolean);
  if (!toks.length) return null;
  return toks.map(w => { const r = raiz(w); return r ? `${escRe(r)}[a-z0-9]*` : escRe(w); }).join('[^a-z0-9]{1,3}');
}
function frasesDe(t) {
  const lema = String(t.lema || '').replace(/[«»"“”]/g, '').trim();
  const out = new Set([lema, ...(t.variantes || [])]);
  // Partes del lema: lo de fuera y lo de dentro del paréntesis, y lo de antes y después de los dos puntos
  for (const p of lema.split(/[()]|:\s/)) if (p.trim().length >= 2) out.add(p.trim());
  // Nombres propios y siglas sueltas (Asperger, Flynn, ENIGMA, ONU…) y, en las personas, cada parte del nombre
  for (const parte of lema.split(/[()]|:\s/)) {
    parte.trim().split(/\s+/).forEach((w, i) => {
      const limpio = w.replace(/[^\p{L}\p{N}-]/gu, '');
      if (limpio.length < 2) return;
      const siglas = (limpio.match(/\p{Lu}/gu) || []).length >= 2;
      const propio = /^\p{Lu}/u.test(limpio) && (i > 0 || t.tipo === 'persona');
      if (siglas || (propio && limpio.length >= 3)) out.add(limpio);
    });
  }
  return [...out].filter(Boolean);
}
function tapar(texto, t) {
  texto = String(texto || '').replace(/\*([^*\n]+)\*/g, '$1');
  const n = norm(texto);
  if (n.length !== texto.length) return [texto];
  const rangos = [];
  for (const f of frasesDe(t)) {
    const p = patron(f);
    if (!p) continue;
    const re = new RegExp(`(^|[^a-z0-9])(${p})(?![a-z0-9])`, 'g');
    let m;
    while ((m = re.exec(n))) { const ini = m.index + m[1].length; rangos.push([ini, ini + m[2].length]); if (m[0].length === 0) re.lastIndex++; }
  }
  rangos.sort((a, b) => a[0] - b[0]);
  const unidos = [];
  for (const r of rangos) { const u = unidos.at(-1); if (u && r[0] <= u[1]) u[1] = Math.max(u[1], r[1]); else unidos.push(r.slice()); }
  const out = [];
  let k = 0;
  for (const [a, b] of unidos) {
    if (a > k) out.push(texto.slice(k, a));
    out.push(h('span', { class: 'jg-tapa' }, h('span', { class: 'sr-only' }, '(nombre tapado)')));
    k = b;
  }
  if (k < texto.length) out.push(texto.slice(k));
  return out;
}

function juegoEtiqueta(el, ctx, api) {
  const pool = ctx.terms.filter(t => ctx.juego(t) && String(t.definicion || '').trim());
  const personas = pool.filter(t => t.tipo === 'persona').length, otras = pool.length - personas;
  if (otras < 4 && personas < 4) return vacio(el, 'Este juego necesita al menos cuatro fichas con definición.');
  const valida = t => (t.tipo === 'persona' ? personas : otras) >= 4;
  const RONDAS = 10;
  let rondas, i, puntos, fallos;
  const nueva = () => { rondas = shuffle(pool.filter(valida)).slice(0, RONDAS); i = 0; puntos = 0; fallos = []; pintar(); };
  const base = s => norm(String(s).replace(/\s*\(.*$/, '')).trim();
  function opciones(t) {
    const persona = t.tipo === 'persona', bt = base(t.lema);
    const parecido = x => { const b = base(x.lema); return b.startsWith(bt) || bt.startsWith(b); };
    const cand = pool.filter(x => x.id !== t.id && (x.tipo === 'persona') === persona && !parecido(x));
    const orden = [
      ...shuffle(cand.filter(x => x.familia === t.familia)),
      ...shuffle(cand.filter(x => x.familia !== t.familia && x.tipo === t.tipo)),
      ...shuffle(cand.filter(x => x.familia !== t.familia && x.tipo !== t.tipo)),
    ];
    const dist = [];
    for (const x of orden) if (dist.length < 3 && !dist.includes(x)) dist.push(x);
    if (dist.length < 3) for (const x of shuffle(pool.filter(x => x.id !== t.id && (x.tipo === 'persona') === persona))) if (dist.length < 3 && !dist.includes(x)) dist.push(x);
    return shuffle([t, ...dist]);
  }
  function pintar() {
    if (i >= rondas.length) {
      return final(el, api, { puntos, total: rondas.length, fallos, otra: nueva, paso: {
        texto: 'Elige una de las etiquetas de hoy y explícasela a alguien en una frase, sin tecnicismos. Si no te sale, ya sabes qué ficha releer.',
        sugerencia: 'explicar a alguien en una frase una etiqueta de las de hoy' } });
    }
    const t = rondas[i], persona = t.tipo === 'persona';
    const ops = opciones(t);
    const fb = h('div', { class: 'jg-fb', 'aria-live': 'polite' });
    const sig = h('div', { class: 'btns jg-sig' });
    const botones = ops.map((o, k) => h('button', { class: 'opt', type: 'button', onclick: () => elegir(k) },
      h('span', { class: 'k', 'aria-hidden': 'true' }, k + 1), h('span', null, o.lema)));
    function elegir(k) {
      if (botones[0].disabled) return;
      const o = ops[k], ok = o.id === t.id;
      if (ok) puntos++;
      else fallos.push(fallo(h('a', { href: ficha(t) }, t.lema), ` · elegiste «${o.lema}». `, h('span', { class: 'muted' }, corta(t.definicion, 140))));
      botones.forEach((b, j) => { b.disabled = true; if (ops[j].id === t.id) b.classList.add('ok'); });
      if (!ok) botones[k].classList.add('ko');
      fb.replaceChildren(h('div', { class: `feedback ${ok ? 'ok' : 'ko'}` },
        h('b', { class: 't' }, ok ? `¡Correcto! ${persona ? 'Es' : 'Era'} ${t.lema}.` : `No: ${persona ? 'es' : 'era'} ${t.lema}.`),
        h('p', { style: { margin: 0 } }, [anio(t.anio), t.obra].filter(x => x && x !== 's. f.').join(' · ') || null),
        h('p', { class: 'small', style: { margin: '6px 0 0' } }, h('a', { href: ficha(t) }, persona ? 'Ver su ficha' : 'Ver la ficha'))));
      sig.replaceChildren(siguienteBtn(i < rondas.length - 1 ? 'Siguiente →' : 'Ver resultado', () => { i++; pintar(); }));
      sig.firstChild.focus({ preventScroll: true });
      aLaVista(sig, 'end');
    }
    api.teclas(e => { const n = parseInt(e.key, 10); if (n >= 1 && n <= botones.length && !botones[0].disabled) { e.preventDefault(); elegir(n - 1); } });
    const clue = h('div', { class: 'clue jg-clue', tabindex: '-1' }, tapar(t.definicion, t));
    el.replaceChildren(marcador(i, rondas.length, puntos),
      h('p', { class: 'jg-pregunta', id: 'jg-q' }, persona ? '¿Quién es?' : '¿Qué etiqueta es?'),
      clue,
      h('p', { class: 'small muted jg-pista' }, famTag(t.familia), h('span', { class: 'jg-atajo' }, ' · También con las teclas 1 a 4.')),
      h('div', { class: 'quiz-opts jg-ops', role: 'group', 'aria-labelledby': 'jg-q' }, botones), fb, sig);
    clue.focus({ preventScroll: true });
    if (i > 0) aLaVista(el);
  }
  nueva();
}

// ——— 2. Ordena la historia ———
function juegoHistoria(el, ctx, api) {
  const pool = ctx.terms.filter(t => ctx.juego(t) && Number.isFinite(t.anio));
  const N = 5, RONDAS = 5;
  if (new Set(pool.map(t => t.anio)).size < N) return vacio(el, 'Este juego necesita al menos cinco fichas con años distintos.');
  let ronda, puntos, lista, fallos, usados;
  const nueva = () => { ronda = 0; puntos = 0; fallos = []; usados = new Set(); repartir(); };
  function elegir() {
    for (const sep of [3, 2, 1]) {
      for (const fuente of [pool.filter(t => !usados.has(t.id)), pool]) {
        const out = [];
        for (const t of shuffle(fuente)) { if (out.every(e => Math.abs(e.anio - t.anio) >= sep)) out.push(t); if (out.length === N) return out; }
      }
    }
    return null;
  }
  function repartir() {
    const elegidos = elegir();
    elegidos.forEach(t => usados.add(t.id));
    lista = shuffle(elegidos);
    // que no salga ya ordenada
    if (lista.every((t, k) => k === 0 || lista[k - 1].anio < t.anio)) lista.reverse();
    pintar(false);
  }
  function pintar(resuelto, foco) {
    const correcto = lista.slice().sort((a, b) => a.anio - b.anio);
    const ul = h('ol', { class: 'order-list jg-orden', 'aria-label': 'Fichas, de la más antigua a la más reciente' });
    lista.forEach((t, k) => {
      const ok = resuelto && correcto[k].id === t.id;
      ul.append(h('li', { class: resuelto ? (ok ? 'ok' : 'ko') : '' },
        resuelto ? null : h('span', { class: 'jg-asa', 'aria-hidden': 'true', title: 'Arrastra para mover' }, '⠿'),
        h('span', { class: 'pos' }, k + 1),
        h('span', { class: 'name' }, t.lema, resuelto
          ? h('small', null, h('b', null, anio(t.anio)), t.anioNota ? ` · ${t.anioNota}` : '', ok ? '' : ` · va en el puesto ${correcto.indexOf(t) + 1}`)
          : h('small', null, t.familia)),
        resuelto ? h('span', { class: 'jg-anio' }, anio(t.anio)) : [
          h('button', { type: 'button', 'aria-label': `Subir ${t.lema}`, disabled: k === 0, onclick: () => mover(k, k - 1, true) }, '↑'),
          h('button', { type: 'button', 'aria-label': `Bajar ${t.lema}`, disabled: k === lista.length - 1, onclick: () => mover(k, k + 1, true) }, '↓')]));
    });
    if (!resuelto) arrastre(ul, (de, a) => mover(de, a, false));
    const aciertos = resuelto ? lista.filter((t, k) => correcto[k].id === t.id).length : 0;
    const fb = h('div', { class: 'jg-fb', 'aria-live': 'polite' }, resuelto ? h('div', { class: `feedback ${aciertos === N ? 'ok' : 'ko'}` },
      h('b', { class: 't' }, aciertos === N ? '¡Orden perfecto!' : `${aciertos} de ${N} en su sitio.`),
      h('p', { style: { margin: 0 } }, aciertos === N ? 'Del más antiguo al más reciente, sin una duda.' : ['El orden correcto: ', correcto.map(t => `${t.lema} (${anio(t.anio)})`).join(' → '), '.'])) : null);
    const sig = h('div', { class: 'btns jg-sig' }, resuelto
      ? siguienteBtn(ronda < RONDAS - 1 ? 'Siguiente ronda →' : 'Ver resultado', () => {
        ronda++;
        if (ronda < RONDAS) return repartir();
        final(el, api, { puntos, total: RONDAS * N, fallos, otra: nueva, paso: {
          texto: 'Pregunta a alguien de otra generación cómo se llamaba esto cuando iba al colegio, y compáralo con cómo se llama hoy. Las palabras también tienen fecha.',
          sugerencia: 'preguntar a alguien mayor cómo se nombraba esto en su época' } });
      })
      : h('button', { class: 'btn primary', type: 'button', onclick: comprobar }, 'Comprobar'));
    el.replaceChildren(
      h('div', { class: 'game-top' }, h('span', null, `Ronda ${ronda + 1} de ${RONDAS}`), h('div', { class: 'progress', 'aria-hidden': 'true' }, h('i', { style: { width: `${100 * ronda / RONDAS}%` } })), h('span', null, plural(puntos, 'punto', 'puntos'))),
      h('p', { class: 'jg-pregunta', id: 'jg-q' }, resuelto ? 'Así quedaba la historia' : 'Ordena del más antiguo (arriba) al más reciente (abajo)'),
      resuelto ? null : h('p', { class: 'small muted', style: { margin: 0 } }, 'Arrastra desde el asa ⠿ o usa las flechas. Cuenta el año que fija cada ficha; lo verás al comprobar.'),
      ul, fb, sig);
    if (resuelto) { sig.querySelector('button').focus({ preventScroll: true }); aLaVista(fb, 'nearest'); }
    else if (foco !== undefined) {
      const li = el.querySelectorAll('.jg-orden li')[foco.k];
      (li?.querySelector(`button[aria-label^="${foco.d < 0 ? 'Subir' : 'Bajar'}"]:not([disabled])`) || li?.querySelector('button:not([disabled])'))?.focus();
    } else if (ronda > 0) { el.querySelector('.jg-pregunta').setAttribute('tabindex', '-1'); el.querySelector('.jg-pregunta').focus({ preventScroll: true }); aLaVista(el); }
  }
  function mover(de, a, conTeclado) {
    if (a < 0 || a >= lista.length || de === a) return;
    const [x] = lista.splice(de, 1);
    lista.splice(a, 0, x);
    pintar(false, conTeclado ? { k: a, d: a - de } : undefined);
    api.anunciar(`${x.lema}, ahora en el puesto ${a + 1} de ${lista.length}.`);
  }
  function comprobar() {
    const correcto = lista.slice().sort((a, b) => a.anio - b.anio);
    lista.forEach((t, k) => {
      if (correcto[k].id === t.id) puntos++;
      else fallos.push(fallo(h('a', { href: ficha(t) }, t.lema), ` (${anio(t.anio)}) · lo pusiste en el puesto ${k + 1} y va en el ${correcto.indexOf(t) + 1}, en la ronda ${ronda + 1}.`));
    });
    pintar(true);
  }
  api.teclas(null);
  nueva();
}

// Arrastrar para ordenar, con ratón, dedo o lápiz (las flechas hacen lo mismo con teclado)
function arrastre(ul, alSoltar) {
  ul.addEventListener('pointerdown', e => {
    const asa = e.target.closest('.jg-asa');
    if (!asa || (e.pointerType === 'mouse' && e.button !== 0)) return;
    const li = asa.closest('li'), items = [...ul.children], de = items.indexOf(li);
    e.preventDefault();
    const rects = items.map(x => x.getBoundingClientRect());
    const hueco = rects.length > 1 ? rects[1].top - rects[0].bottom : 8;
    const paso = rects[de].height + hueco;
    const y0 = e.clientY;
    let a = de;
    try { asa.setPointerCapture(e.pointerId); } catch (err) { /* nada */ }
    li.classList.add('arrastra');
    ul.classList.add('arrastrando');
    const mover = ev => {
      const dy = Math.max(rects[0].top - rects[de].top - 6, Math.min(rects.at(-1).bottom - rects[de].bottom + 6, ev.clientY - y0));
      li.style.transform = `translateY(${dy}px)`;
      const centro = rects[de].top + rects[de].height / 2 + dy;
      a = 0;
      rects.forEach((r, k) => { if (k !== de && centro > r.top + r.height / 2) a++; });
      items.forEach((x, k) => {
        if (k === de) return;
        const s = de < a && k > de && k <= a ? -paso : de > a && k >= a && k < de ? paso : 0;
        x.style.transform = s ? `translateY(${s}px)` : '';
      });
    };
    const fin = ev => {
      asa.removeEventListener('pointermove', mover);
      asa.removeEventListener('pointerup', fin);
      asa.removeEventListener('pointercancel', fin);
      items.forEach(x => { x.style.transform = ''; });
      li.classList.remove('arrastra');
      ul.classList.remove('arrastrando');
      if (ev.type === 'pointerup' && a !== de) alSoltar(de, a);
    };
    asa.addEventListener('pointermove', mover);
    asa.addEventListener('pointerup', fin);
    asa.addEventListener('pointercancel', fin);
  });
}

// ——— 3. ¿Para qué se usa? ———
// Banco de situaciones: la misma etiqueta, cinco trabajos distintos. «fichas» enlaza fichas relacionadas si existen.
const SITUACIONES = [
  // Investigar
  { u: 'I', txt: 'Un equipo de una universidad compara el sueño de 300 adolescentes con diagnóstico de TDAH con el de otros 300 sin diagnóstico.',
    por: 'Describe y compara grupos. Lo que salga será un promedio: no dirá nada seguro de cada chico concreto.', fichas: ['tdah', 'inferencia-ecologica'] },
  { u: 'I', txt: 'Una investigadora revisa historias clínicas de diez hospitales para ver si a las chicas se las diagnostica de autismo más tarde que a los chicos.',
    por: 'Busca patrones en grupos grandes. No decide nada sobre ninguna de esas niñas; sirve para saber si el sistema mira peor a unas que a otros.', fichas: ['brecha-genero', 'autismo'] },
  { u: 'I', txt: 'Un consorcio internacional junta miles de resonancias magnéticas para buscar diferencias promedio en el cerebro entre grupos con y sin diagnóstico.',
    por: 'Son diferencias de grupo, y a menudo pequeñas. Sirven para estudiar; por ahora no sirven para diagnosticar a una persona con una resonancia.', fichas: ['neuroimagen', 'enigma'] },
  { u: 'I', txt: 'Una tesis analiza cómo ha cambiado en diez años el número de alumnos con altas capacidades que aparecen en la estadística educativa.',
    por: 'Estudia registros. Ojo: cuentan a quien se ha identificado, y eso depende de cómo lo hace cada comunidad. No es lo mismo que cuántos hay.', fichas: ['altas-capacidades', 'diferencias-autonomicas'] },
  { u: 'I', txt: 'Al salir de la consulta, el hospital pide permiso a una familia para incluir los datos anónimos de su hijo en un registro que estudia los tics.',
    por: 'El sitio es una consulta, pero el uso es otro: esos datos servirán para estudiar grupos, no para decidir nada sobre este niño.', fichas: ['tourette'] },
  // Diagnosticar
  { u: 'D', txt: 'En el centro de salud, el pediatra ve que Pablo, de dos años y medio, apenas habla y no señala lo que quiere, y lo deriva a una evaluación especializada.',
    por: 'Orienta la atención clínica de una persona concreta. Que lo derive no es un diagnóstico: es el primer paso para evaluarlo bien.', fichas: ['autismo', 'cribado'] },
  { u: 'D', txt: 'Una psiquiatra valora a una mujer de 38 años que se ha reconocido en el TDAH desde que diagnosticaron a su hijo: le pregunta por su infancia, su sueño y su ánimo.',
    por: 'Reconocerse es valioso, pero no confirma nada. Para diagnosticar hace falta ver la historia completa y descartar otras explicaciones.', fichas: ['tdah-adulto', 'autoadscripcion'] },
  { u: 'D', txt: 'Un médico de familia no tiene claro si el cansancio y los despistes de un paciente se deben a una depresión, a apneas del sueño o a un TDAH, y pide más pruebas.',
    por: 'Es el corazón del diagnóstico: comparar explicaciones antes de poner un nombre (diagnóstico diferencial).', fichas: ['diagnostico-diferencial', 'solapamiento'] },
  { u: 'D', txt: 'Tras el diagnóstico, el neuropediatra explica a la familia qué opciones hay, qué beneficios y efectos secundarios cabe esperar y qué pasa si deciden esperar.',
    por: 'Del diagnóstico al tratamiento hay otro salto: la prueba pasa a ser beneficios, daños y alternativas para este niño.', fichas: ['psicoestimulantes', 'entrenamiento-padres'] },
  { u: 'D', txt: 'Una neuropsicóloga combina entrevistas, cuestionarios a la familia y al colegio y observación antes de redactar su informe sobre Irene, de nueve años.',
    por: 'Un cuestionario solo no diagnostica. Juntar fuentes distintas es lo que da solidez a una evaluación individual.', fichas: ['escalas-valoracion', 'criterio-diagnostico'] },
  // Educar
  { u: 'E', txt: 'La tutora de 2.º de primaria ve que Ana se pierde con las instrucciones largas y empieza a dárselas por pasos y por escrito, sin esperar a ningún informe.',
    por: 'Un apoyo útil y barato. Para educar muchas veces basta con describir la necesidad; no hace falta un diagnóstico.', fichas: ['educacion-inclusiva', 'funciones-ejecutivas'] },
  { u: 'E', txt: 'El departamento de orientación propone que Hugo haga los exámenes del instituto en un aula más tranquila, con algo más de tiempo, y revisarlo en la siguiente evaluación.',
    por: 'Decide un ajuste en la escuela y lo deja revisable. La pregunta es si le ayuda a aprender y a demostrar lo que sabe.', fichas: ['neae', 'adaptaciones-curriculares'] },
  { u: 'E', txt: 'El claustro decide preparar los materiales en varios formatos (texto, audio y vídeo) para toda la clase, tenga o no alguien un diagnóstico.',
    por: 'Es diseño para todos: el apoyo llega sin que nadie tenga que acreditar nada.', fichas: ['dua'] },
  { u: 'E', txt: 'La orientadora hace una evaluación psicopedagógica para decidir si a Leo, que va muy por delante en matemáticas, le conviene una adaptación de ampliación.',
    por: 'La evaluación está al servicio de una decisión escolar: qué le conviene aprender y cómo.', fichas: ['evaluacion-psicopedagogica', 'altas-capacidades'] },
  { u: 'E', txt: 'En la sesión de evaluación, el equipo docente mira si los apoyos que pusieron en octubre han servido y decide cuáles mantiene y cuáles cambia.',
    por: 'Revisar es parte de educar: un apoyo que no sirve se cambia, aunque la etiqueta siga siendo la misma.', fichas: ['educacion-inclusiva'] },
  // Acceder
  { u: 'A', txt: 'Una familia solicita el certificado de discapacidad para su hija y el equipo de valoración de su comunidad autónoma la cita para valorar el grado.',
    por: 'Abre derechos y recursos con reglas propias. El certificado no es un diagnóstico: valora cómo afecta a la vida diaria.', fichas: ['certificado-discapacidad', 'modelo-social'] },
  { u: 'A', txt: 'Para pedir la ayuda del Ministerio para alumnado con necesidad específica de apoyo educativo, una familia adjunta el certificado que acredita la necesidad.',
    por: 'Es una regla de reparto: quién puede pedir la ayuda y con qué papel. Que exista un incentivo no significa que haya trampa.', fichas: ['neae', 'incentivos'] },
  { u: 'A', txt: 'Un estudiante pide más tiempo en la prueba de acceso a la universidad y la comisión organizadora le pide un informe que acredite su necesidad.',
    por: 'Aquí la etiqueta es una llave: la comisión no diagnostica, aplica una regla de acceso que debería ser clara y revisable.', fichas: ['ajustes-razonables'] },
  { u: 'A', txt: 'Un trabajador autista pide a su empresa ajustes razonables (menos ruido y entrada flexible) y la empresa le pregunta qué documentación debe aportar.',
    por: 'Es un derecho que se activa con ciertas condiciones. Lo que se discute es la regla de acceso, no quién es él.', fichas: ['ajustes-razonables', 'convencion-onu'] },
  { u: 'A', txt: 'Una asociación de familias pide a la consejería que publique con qué criterios se reparten las horas de profesorado de apoyo entre colegios y cómo se reclama.',
    por: 'Pide justo lo que exige este uso: reglas claras, razones para repartir así y una vía para revisar las decisiones.', fichas: ['diferencias-autonomicas', 'incentivos'] },
  // Reconocerse
  { u: 'R', txt: 'Tras años sintiéndose «rara», Laura lee la palabra «neurodivergente» en un foro y por fin encuentra gente que describe cómo vive ella.',
    por: 'Identidad y pertenencia. No necesita una prueba clínica, pero tampoco la sustituye: si busca apoyos clínicos, hará falta una evaluación.', fichas: ['neurodivergente', 'autoadscripcion'] },
  { u: 'R', txt: 'Un grupo de adultos con TDAH queda cada mes en la sede de una asociación para compartir trucos y apoyarse.',
    por: 'La etiqueta junta a gente que se entiende. Aquí lo que se pide es claridad y respeto, no un informe.', fichas: ['movimiento-neurodiversidad', 'nada-sobre-nosotros'] },
  { u: 'R', txt: 'En su perfil de redes, una creadora se presenta como «AuDHD» y cuenta a sus seguidores cómo vive el autismo y el TDAH a la vez.',
    por: 'Es una palabra de comunidad. A quien la ve y se reconoce le ayuda a entenderse, pero no le diagnostica.', fichas: ['audhd', 'redes-sociales'] },
  { u: 'R', txt: 'Un chico de 16 años decide si prefiere decir «soy autista» o «tengo autismo» cuando habla de sí mismo en clase.',
    por: 'El sitio es un aula, pero el uso es reconocerse: cómo se nombra cada cual lo decide la propia persona.', fichas: ['lenguaje-identidad'] },
];

function juegoUsos(el, ctx, api) {
  const RONDAS = 10;
  let rondas, i, puntos, fallos;
  // dos situaciones de cada uso, en orden aleatorio
  const nueva = () => {
    rondas = shuffle(CODIGOS.flatMap(c => shuffle(SITUACIONES.filter(s => s.u === c)).slice(0, 2))).slice(0, RONDAS);
    i = 0; puntos = 0; fallos = []; pintar();
  };
  const enlaces = s => (s.fichas || []).map(id => ctx.byId.get(id)).filter(Boolean);
  function pintar() {
    if (i >= rondas.length) {
      return final(el, api, { puntos, total: rondas.length, fallos, otra: nueva, paso: {
        texto: 'Esta semana, cuando oigas una etiqueta (en clase, en la consulta, en el grupo de la familia), pregúntate: ¿para qué uso la están usando? ¿Y qué prueba haría falta para ese uso?',
        sugerencia: 'preguntarme «¿para qué uso?» la próxima vez que oiga una etiqueta' } });
    }
    const s = rondas[i];
    const fb = h('div', { class: 'jg-fb', 'aria-live': 'polite' });
    const sig = h('div', { class: 'btns jg-sig' });
    const botones = CODIGOS.map(c => h('button', { class: 'vbtn jg-uso', type: 'button', 'data-v': c, onclick: () => elegir(c) },
      h('span', { class: 'jg-letra', 'aria-hidden': 'true' }, c), h('span', null, h('b', null, USOS[c].nombre), h('small', null, USOS[c].para))));
    function elegir(c) {
      if (botones[0].disabled) return;
      const ok = c === s.u, U = USOS[s.u];
      if (ok) puntos++;
      else fallos.push(fallo(h('span', null, corta(s.txt, 120)), ' · ', h('b', null, U.nombre), ` (elegiste ${USOS[c].nombre.toLowerCase()}). `,
        h('a', { href: '#/aprender/idear' }, 'Repasar IDEAR'), enlaces(s).map(t => [' · ', h('a', { href: ficha(t) }, t.lema)])));
      botones.forEach((b, j) => { b.disabled = true; if (CODIGOS[j] === s.u) b.classList.add('ok'); });
      if (!ok) botones[CODIGOS.indexOf(c)].classList.add('ko');
      const fichas = enlaces(s);
      fb.replaceChildren(h('div', { class: `feedback ${ok ? 'ok' : 'ko'}` },
        h('b', { class: 't' }, ok ? `¡Eso es! ${U.nombre}.` : `No exactamente: aquí la etiqueta trabaja para ${U.verbo}.`),
        h('p', { style: { margin: '0 0 8px' } }, s.por),
        h('p', { class: 'jg-prueba', 'data-v': s.u, style: { margin: 0 } }, h('b', null, `La prueba que necesita para ${U.verbo}: `), U.prueba),
        ok ? null : h('p', { class: 'small', style: { margin: '8px 0 0' } }, `Si fuera para ${USOS[c].verbo}, la prueba sería otra: ${USOS[c].prueba.charAt(0).toLowerCase()}${USOS[c].prueba.slice(1)}`),
        fichas.length ? h('p', { class: 'small', style: { margin: '8px 0 0' } }, 'Fichas: ', fichas.map((t, k) => [k ? ' · ' : '', h('a', { href: ficha(t) }, t.lema)])) : null));
      sig.replaceChildren(siguienteBtn(i < rondas.length - 1 ? 'Siguiente →' : 'Ver resultado', () => { i++; pintar(); }));
      sig.firstChild.focus({ preventScroll: true });
      aLaVista(sig, 'end');
    }
    api.teclas(e => { const c = e.key.toUpperCase(); if (CODIGOS.includes(c) && !botones[0].disabled) { e.preventDefault(); elegir(c); } });
    const clue = h('div', { class: 'clue jg-clue', tabindex: '-1' }, s.txt);
    el.replaceChildren(marcador(i, rondas.length, puntos),
      h('p', { class: 'jg-pregunta' }, 'La situación'),
      clue,
      h('p', { class: 'jg-pregunta', id: 'jg-q' }, '¿En qué uso está trabajando la etiqueta?', h('span', { class: 'small muted jg-atajo' }, ' También con las teclas I, D, E, A y R.')),
      h('div', { class: 'jg-usos', role: 'group', 'aria-labelledby': 'jg-q' }, botones), fb, sig);
    clue.focus({ preventScroll: true });
    if (i > 0) aLaVista(el);
  }
  nueva();
}

// ——— 4. ¿Mito, matiz o cierto? ———
const VCOLOR = { mito: 'var(--danger)', matiz: 'var(--v-E)', cierto: 'var(--ok)' };
const sinComillas = s => String(s || '').trim().replace(/^[«"“]+|[»"”]+$/g, '').trim();

function juegoMito(el, ctx, api) {
  const pool = ctx.terms.filter(t => ctx.juego(t) && String(t.frase || '').trim() && VEREDICTOS[t.veredicto]);
  if (!pool.length) return vacio(el, 'Todavía no hay fichas con una frase que se oye y su veredicto.');
  const RONDAS = Math.min(10, pool.length);
  const OPS = Object.keys(VEREDICTOS);
  let rondas, i, puntos, fallos;
  const nueva = () => { rondas = shuffle(pool).slice(0, RONDAS); i = 0; puntos = 0; fallos = []; pintar(); };
  function pintar() {
    if (i >= rondas.length) {
      const f = sinComillas((fallos.length ? fallos[0].frase : shuffle(rondas)[0].frase));
      return final(el, api, { puntos, total: rondas.length, fallos: fallos.map(x => x.li), otra: nueva, paso: {
        texto: `La próxima vez que oigas «${f}», no discutas de entrada: pregunta «¿para qué uso lo dices?» y escucha la respuesta.`,
        sugerencia: 'preguntar «¿para qué uso?» la próxima vez que oiga una frase así' } });
    }
    const t = rondas[i];
    const fb = h('div', { class: 'jg-fb', 'aria-live': 'polite' });
    const sig = h('div', { class: 'btns jg-sig' });
    const botones = OPS.map((v, k) => h('button', { class: 'vbtn jg-ver', type: 'button', style: { '--c': VCOLOR[v] }, onclick: () => elegir(v) },
      h('span', { class: 'jg-letra', 'aria-hidden': 'true' }, VEREDICTOS[v].ico), h('span', null, h('b', null, VEREDICTOS[v].nombre), h('small', null, VEREDICTOS[v].ayuda))));
    function elegir(v) {
      if (botones[0].disabled) return;
      const ok = v === t.veredicto, cerca = !ok && (v === 'matiz' || t.veredicto === 'matiz');
      if (ok) puntos++;
      else fallos.push({ frase: t.frase, li: fallo(h('span', { class: 'jg-frase-mini' }, `«${sinComillas(t.frase)}»`), ' · ', marcaVeredicto(t.veredicto), ` (elegiste ${VEREDICTOS[v].nombre.toLowerCase()}) · `, h('a', { href: ficha(t) }, t.lema)) });
      botones.forEach((b, j) => { b.disabled = true; if (OPS[j] === t.veredicto) b.classList.add('ok'); });
      if (!ok) botones[OPS.indexOf(v)].classList.add('ko');
      fb.replaceChildren(h('div', { class: `feedback ${ok ? 'ok' : 'ko'}` },
        h('b', { class: 't' }, ok ? '¡Bien visto!' : cerca ? 'Cerca, pero no.' : 'No esta vez.'),
        h('p', { style: { margin: '0 0 8px' } }, marcaVeredicto(t.veredicto), ' ', VEREDICTOS[t.veredicto].ayuda),
        t.matiz ? h('p', { style: { margin: '0 0 6px' } }, t.matiz) : null,
        h('p', { class: 'small', style: { margin: 0 } }, h('a', { href: ficha(t) }, `Ficha: ${t.lema}`))));
      sig.replaceChildren(siguienteBtn(i < rondas.length - 1 ? 'Siguiente →' : 'Ver resultado', () => { i++; pintar(); }));
      sig.firstChild.focus({ preventScroll: true });
      aLaVista(sig, 'end');
    }
    api.teclas(e => { const n = parseInt(e.key, 10); if (n >= 1 && n <= 3 && !botones[0].disabled) { e.preventDefault(); elegir(OPS[n - 1]); } });
    const clue = h('blockquote', { class: 'clue jg-clue jg-frase', tabindex: '-1' }, `«${sinComillas(t.frase)}»`);
    el.replaceChildren(marcador(i, rondas.length, puntos),
      h('p', { class: 'jg-pregunta' }, 'Se oye a menudo', h('span', { class: 'small muted' }, ` · sobre ${t.lema}`)),
      clue,
      h('p', { class: 'jg-pregunta', id: 'jg-q' }, '¿Qué dice la evidencia?', h('span', { class: 'small muted jg-atajo' }, ' También con las teclas 1, 2 y 3.')),
      h('div', { class: 'jg-vers', role: 'group', 'aria-labelledby': 'jg-q' }, botones), fb, sig);
    clue.focus({ preventScroll: true });
    if (i > 0) aLaVista(el);
  }
  nueva();
}

// ——— 5. ¿Antes o después? Una racha que sigue hasta el primer fallo ———
function juegoAntes(el, ctx, api) {
  const pool = ctx.terms.filter(t => ctx.juego(t) && Number.isFinite(t.anio));
  if (new Set(pool.map(t => t.anio)).size < 2) return vacio(el, 'Este juego necesita fichas con años distintos.');
  let a, b, racha, usados, cadena;
  // Se pone más difícil a medida que crece la racha: años cada vez más cercanos
  const siguiente = () => {
    const libres = pool.filter(t => !usados.has(t.id) && t.anio !== a.anio);
    const base = libres.length ? libres : pool.filter(t => t.id !== a.id && t.anio !== a.anio);
    const lejos = base.filter(t => Math.abs(t.anio - a.anio) >= 2);
    let cand = lejos.length ? lejos : base;
    if (racha >= 5) { const cerca = cand.filter(t => Math.abs(t.anio - a.anio) <= (racha >= 8 ? 15 : 30)); if (cerca.length) cand = cerca; }
    return shuffle(cand)[0];
  };
  const nueva = () => { racha = 0; usados = new Set(); a = shuffle(pool)[0]; usados.add(a.id); cadena = [a]; b = siguiente(); usados.add(b.id); pintar(); };
  function pintar() {
    const fb = h('div', { class: 'jg-fb', 'aria-live': 'polite' });
    const sig = h('div', { class: 'btns jg-sig' });
    const boton = (txt, antes, ico) => h('button', { class: 'opt jg-ad', type: 'button', onclick: () => responder(antes) },
      h('span', { class: 'k', 'aria-hidden': 'true' }, ico), txt);
    const ops = [boton('Antes', true, '←'), boton('Después', false, '→')];
    function responder(antes) {
      if (ops[0].disabled) return;
      const ok = antes ? b.anio < a.anio : b.anio > a.anio;
      ops.forEach(o => { o.disabled = true; });
      (b.anio < a.anio ? ops[0] : ops[1]).classList.add('ok');
      if (!ok) (antes ? ops[0] : ops[1]).classList.add('ko');
      el.querySelector('.jg-oculto').textContent = anio(b.anio);
      if (ok) {
        racha++;
        cadena.push(b);
        fb.replaceChildren(h('div', { class: 'feedback ok' }, h('b', { class: 't' }, `¡Sí! ${b.lema} es de ${anio(b.anio)}.`),
          h('p', { style: { margin: 0 } }, `Racha: ${racha}.${racha === 10 ? ' ¡Diez! Eso ya es oficio.' : ''}`)));
        sig.replaceChildren(siguienteBtn('Siguiente →', () => { a = b; b = siguiente(); usados.add(b.id); pintar(); }));
        sig.firstChild.focus({ preventScroll: true });
        aLaVista(sig, 'end');
        return;
      }
      fb.replaceChildren(h('div', { class: 'feedback ko' }, h('b', { class: 't' }, `No: ${b.lema} es de ${anio(b.anio)}, ${b.anio < a.anio ? 'antes' : 'después'} que ${a.lema} (${anio(a.anio)}).`),
        b.obra ? h('p', { style: { margin: 0 } }, corta(b.obra, 120)) : null));
      sig.replaceChildren(siguienteBtn('Ver resultado', terminar));
      sig.firstChild.focus({ preventScroll: true });
      aLaVista(sig, 'end');
    }
    function terminar() {
      const fallos = [fallo(h('a', { href: ficha(b) }, b.lema), ` (${anio(b.anio)}) es de ${b.anio < a.anio ? 'antes' : 'después'} que `, h('a', { href: ficha(a) }, a.lema), ` (${anio(a.anio)}).`)];
      if (cadena.length > 1) {
        fallos.push(fallo(h('b', null, 'Tu racha, por orden de aparición: '), cadena.map((t, k) => [k ? ' → ' : '', h('a', { href: ficha(t) }, t.lema), ` (${anio(t.anio)})`])));
      }
      final(el, api, { puntos: racha, total: racha, totalCuaderno: Math.max(10, racha), racha: true, fallos, otra: nueva, paso: {
        texto: 'Elige una ficha de tu racha y cuéntale a alguien en qué año apareció y qué cambió con ella. Explicarlo en voz alta es la mejor forma de comprobar que lo sabes.',
        sugerencia: 'contarle a alguien en qué año apareció una de estas etiquetas y qué cambió' } });
    }
    api.teclas(e => {
      if (ops[0].disabled) return;
      if (e.key === 'ArrowLeft') { e.preventDefault(); responder(true); }
      if (e.key === 'ArrowRight') { e.preventDefault(); responder(false); }
    });
    const foco = h('b', { class: 'jg-lema foco', tabindex: '-1' }, b.lema);
    el.replaceChildren(
      h('div', { class: 'game-top' }, h('span', null, `Racha: ${racha}`), h('div', { class: 'progress', 'aria-hidden': 'true' }, h('i', { style: { width: `${Math.min(100, racha * 10)}%` } })), h('span', null, 'Meta: 10')),
      h('div', { class: 'comparar jg-pareja' },
        h('div', null, h('p', { class: 'small muted', style: { margin: 0 } }, 'Esta es de…'), h('b', { class: 'jg-lema' }, a.lema), h('div', { class: 'jg-anio-big' }, anio(a.anio))),
        h('div', { class: 'modelo' }, h('p', { class: 'small muted', style: { margin: 0 } }, '¿Y esta?'), foco, h('div', { class: 'jg-anio-big jg-oculto' }, '¿?'))),
      h('p', { class: 'jg-pregunta', id: 'jg-q' }, `¿${b.lema} es de antes o de después que ${a.lema}?`, h('span', { class: 'small muted jg-atajo' }, ' También con las flechas ← y →.')),
      h('div', { class: 'quiz-opts two jg-ops', role: 'group', 'aria-labelledby': 'jg-q' }, ops), fb, sig);
    foco.focus({ preventScroll: true });
    if (racha > 0) aLaVista(el);
  }
  nueva();
}
