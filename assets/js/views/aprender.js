// Aprender: la tesis de NeuroLab en siete apartados. Cambia el uso, cambia la prueba.
import { h, poner, USOS, CODIGOS, IDEAR_FRASE, SEIS, SALTOS, ERRORES, FAMILIAS, FASES, faseDe, FAM_CORTA, famVar, famTag,
  shuffle, storage, plural, norm, cabeza, recuadro, dialogo, pasos, toggles, inline, idear, marcaEstado } from '../lib.js';
import * as cuaderno from '../cuaderno.js';

const SECCIONES = [
  ['ruta', 'Ruta en diez paradas'], ['idear', 'Cinco usos (IDEAR)'], ['seis', 'Seis preguntas'],
  ['saltos', 'Detector de saltos'], ['errores', 'Dos errores'], ['glosario', 'Glosario'],
];
const SAL = Object.fromEntries(SALTOS.map(s => [s.id, s]));
// Nombres con guion opcional, para que quepan en las teclas del móvil
const CORTE = { I: 'Inves\u00ADtigar', D: 'Diagnos\u00ADticar', E: 'Educar', A: 'Acceder', R: 'Recono\u00ADcerse' };

export function render(root, ctx, parts) {
  const sec = parts[0] || '';
  const A = ctx.aprender || {};
  const tabs = h('nav', { class: 'tabs', 'aria-label': 'Apartados de Aprender' },
    h('a', { href: '#/aprender', 'aria-current': sec === '' ? 'page' : null }, 'Inicio'),
    SECCIONES.map(([k, l]) => h('a', { href: `#/aprender/${k}`, 'aria-current': sec === k ? 'page' : null }, l)));
  root.append(cabeza(2, 'Aprender', 'Una etiqueta no es una cosa: es una herramienta. Aquí aprendes a ver qué trabajo hace cada palabra y qué prueba necesita para hacerlo bien. Con ejemplos, juegos cortos y ningún examen obligatorio.'), tabs);
  const cuerpo = h('div', { class: 'aprender' });
  root.append(cuerpo);
  const f = { '': inicio, ruta, idear: usos, seis, saltos, errores, glosario }[sec];
  if (!f) {
    document.title = 'Aprender · NeuroLab';
    cuerpo.append(h('div', { class: 'empty' }, h('p', null, 'Este apartado no existe. '), h('a', { class: 'btn', href: '#/aprender' }, 'Volver a Aprender')));
    return { retema() {} };
  }
  document.title = `${sec ? SECCIONES.find(s => s[0] === sec)[1] + ' · ' : ''}Aprender · NeuroLab`;
  requestAnimationFrame(() => {
    centrar(tabs, tabs.querySelector('[aria-current="page"]'));
  });
  const r = f(cuerpo, ctx, A, parts.slice(1));
  return { retema() { r?.retema?.(); }, destroy() { r?.destroy?.(); } };
}

// ---------- utilidades ----------
// Añade al final saltándose los huecos y aplanando listas (Element.append no lo hace)
const meter = (el, ...kids) => { el.append(...kids.flat(Infinity).filter(k => k !== null && k !== undefined && k !== false)); return el; };
const enlaceT = (ctx, id) => {
  const t = ctx.byId.get(id);
  return t ? h('a', { class: 'chip', href: `#/termino/${encodeURIComponent(id)}` }, t.lema.replace(/\s*\(.*\)$/, '')) : null;
};
const sinDatos = el => meter(el, h('div', { class: 'empty' }, h('p', null, 'Este contenido todavía no está disponible. Prueba a recargar la página dentro de un rato.')));
const letraUso = c => h('span', { class: 'apr-l', 'data-v': c, 'aria-hidden': 'true' }, c);
function saltoBox(s) {
  return h('div', { class: 'salto-box' },
    h('span', { class: 'orilla' }, s.de), h('span', { class: 'vacio', 'aria-hidden': 'true' }, '→'), h('span', { class: 'orilla' }, s.a),
    h('div', { class: 'falta' }, h('b', null, 'Lo que falta para cruzar: '), s.falta));
}
function fuentesDe(lista) {
  if (!lista?.length) return null;
  return h('p', { class: 'small muted apr-fuentes' }, lista.length > 1 ? 'Fuentes: ' : 'Fuente: ',
    lista.map((f, k) => [k ? ' · ' : '', f.url ? h('a', { href: f.url, rel: 'noopener', target: '_blank' }, f.titulo) : f.titulo]));
}
// Centra un elemento dentro de una tira con desplazamiento horizontal (pestañas, años de la ruta en el móvil)
function centrar(tira, a) {
  if (!a || tira.scrollWidth <= tira.clientWidth) return;
  tira.scrollLeft += a.getBoundingClientRect().left - tira.getBoundingClientRect().left - (tira.clientWidth - a.offsetWidth) / 2;
}
function bajarA(el) {
  const y = el.getBoundingClientRect().top + window.scrollY - 76;
  if (window.scrollY > y) window.scrollTo({ top: Math.max(0, y) });
}

// ---------- Inicio ----------
function inicio(el, ctx, A) {
  const c = cuaderno.leer();
  const nRuta = A.ruta?.length || 10;
  const tarjetas = [
    ['ruta', '1', 'Ruta en diez paradas', 'De 1798 a 2022: cómo las etiquetas cambiaron de uso, parada a parada.', `${Math.min(c.paradas.length, nRuta)} de ${nRuta} paradas`],
    ['idear', '2', 'Cinco usos (IDEAR)', 'Investigar, diagnosticar, educar, acceder y reconocerse: qué prueba pide cada uno.', 'Ejercicio de 8 frases'],
    ['seis', '3', 'Seis preguntas', 'Una herramienta para examinar cualquier etiqueta en cualquier uso, con un caso resuelto.', 'Ejemplo paso a paso'],
    ['saltos', '4', 'Detector de saltos', `Diez saltos de razonamiento muy comunes y ${cuaderno.DETECTOR_TOTAL} frases para entrenar el ojo.`, c.detector ? `Tu mejor marca: ${c.detector} de ${cuaderno.DETECTOR_TOTAL}` : 'Sin jugar todavía'],
    ['errores', '5', 'Dos errores', 'Etiquetar de más y dejar fuera a quien lo necesita: una balanza para verlos a la vez.', 'Con una balanza interactiva'],
    ['glosario', '6', 'Glosario', `Las ${plural(ctx.terms.length, 'palabra', 'palabras')} de NeuroLab, con su definición y su ficha.`, 'Filtra por letra o familia'],
  ];
  meter(el, 
    h('h2', { class: 'apr-h2-0' }, 'Una discusión de sobremesa'),
    A.dialogo ? dialogo(A.dialogo) : null,
    h('p', { class: 'lead' }, 'Todo Moda y Todo Cerebro discuten sobre la cosa. Para Qué pregunta por el uso, y ahí está la clave: la misma palabra puede servir para un estudio, una consulta, un aula, un certificado o una identidad. Lo que la justifica en un sitio no la justifica, sin más, en otro.'),
    h('div', { class: 'apr-lema', role: 'note' }, h('span', null, 'Cambia el uso,'), ' ', h('b', null, 'cambia la prueba.')),
    h('h2', null, 'Qué vas a aprender'),
    h('ul', { class: 'apr-aprendes' },
      [['◆', 'Por qué una etiqueta puede ser útil en un sitio y engañosa en otro.'],
        ['I', 'Los cinco usos de IDEAR y qué prueba pide cada uno.'],
        ['6', 'Seis preguntas para examinar cualquier etiqueta, en cualquier uso.'],
        ['↷', 'A reconocer diez saltos de razonamiento y lo que falta para darlos con red.'],
        ['⚖', 'Por qué mover un criterio cambia los errores de sitio, pero no los borra.'],
        ['⏳', 'Cómo han cambiado de uso estas palabras en algo más de doscientos años.']]
        .map(([i, t]) => h('li', null, h('span', { class: 'ico', 'aria-hidden': 'true' }, i), t))),
    h('h2', null, 'Seis apartados'),
    h('div', { class: 'actividades' }, tarjetas.map(([k, n, t, p, pie]) => h('a', { class: 'actividad', href: `#/aprender/${k}` },
      h('span', { class: 'num', 'aria-hidden': 'true' }, n), h('h3', null, t), h('p', null, p), h('div', { class: 'pie' }, pie)))),
    recuadro('recuerda', 'Para recordar: IDEAR',
      h('div', { class: 'apr-idear-recuerda' }, CODIGOS.map(k => h('div', { 'data-v': k }, h('b', null, k), h('span', null, USOS[k].nombre), h('small', null, USOS[k].para)))),
      h('p', null, IDEAR_FRASE, ' Y cada trabajo pide su prueba.')),
    recuadro('piensa', '¿Por dónde empiezo?',
      h('p', null, 'Si tienes cinco minutos, empieza por ', h('a', { href: '#/aprender/idear' }, 'los cinco usos'), '. Si tienes veinte, recorre ', h('a', { href: '#/aprender/ruta' }, 'la ruta'), '. Si te apetece jugar, prueba ', h('a', { href: '#/aprender/saltos' }, 'el detector de saltos'), '.')),
    h('p', { class: 'small muted' }, 'NeuroLab no diagnostica ni aconseja tratamientos. Enseña a preguntar para qué se usa una palabra y qué hace falta para usarla bien.'));
}

// ---------- Ruta en diez paradas ----------
function ruta(el, ctx, A, parts) {
  const R = A.ruta || [];
  if (!R.length) return sinDatos(el);
  let i = Math.min(Math.max(parseInt(parts[0] || '1', 10) || 1, 1), R.length) - 1;
  let fin = false;
  const resp = {};
  const lista = h('ol', { 'aria-label': 'Paradas de la ruta' });
  const parada = h('div', { class: 'parada', 'aria-live': 'polite' });
  const prog = h('div', { class: 'apr-prog' });
  const caja = h('div', { class: 'ruta' }, h('nav', { 'aria-label': 'Paradas' }, lista), parada);
  let contenido = null;
  ctx.contenido().then(m => { contenido = m; if (!fin) pintar(); }).catch(() => {});
  meter(el, h('p', { class: 'lead' }, 'Una historia de las etiquetas en diez momentos. En cada parada, una pregunta rápida: ¿qué uso de IDEAR pesa más? Al contestarla verás qué cambió de uso, y la parada contará en tu cuaderno.'), prog, caja);

  const hechas = () => cuaderno.leer().paradas;
  function pintarProg() {
    const H = hechas();
    poner(prog,
      h('div', { class: 'apr-prog-t' }, h('b', null, `${R.filter((_, k) => H.includes(k + 1)).length} de ${R.length}`), ' paradas hechas'),
      h('div', { class: 'apr-segs', 'aria-hidden': 'true' }, R.map((p, k) => h('i', { class: `${H.includes(k + 1) ? 'on' : ''}${k === i && !fin ? ' aqui' : ''}`, 'data-v': p.uso, title: `${p.anio}: ${p.titulo}` }))));
  }
  function pintarLista() {
    const H = hechas();
    lista.replaceChildren(...R.map((p, k) => h('li', null, h('a', {
      href: `#/aprender/ruta/${k + 1}`, 'aria-current': k === i && !fin ? 'step' : null,
      onclick: e => { e.preventDefault(); ir(k); },
    }, h('b', null, p.anio), h('span', null, p.titulo), H.includes(k + 1) ? h('i', { class: 'hecha', 'data-v': p.uso, title: 'Parada hecha' }, '✓') : null))));
  }
  function pintar() {
    pintarProg(); pintarLista();
    requestAnimationFrame(() => centrar(lista, lista.querySelector('[aria-current="step"]')));
    if (fin) return pintarFin();
    const p = R[i], n = i + 1;
    const fase = FASES[faseDe(p.a)];
    const elegido = resp[i];
    const fb = h('div');
    const quiz = h('div', { class: 'card apr-quiz' },
      h('p', { class: 'apr-quiz-q' }, hechas().includes(n) && !elegido ? '✓ Parada hecha. ¿Lo recuerdas? ' : 'Pregunta rápida: ',
        h('b', null, '¿qué uso de IDEAR pesa más en esta parada?')),
      h('div', { class: 'apr-letras', role: 'group', 'aria-label': 'Los cinco usos' }, CODIGOS.map(c => {
        const b = h('button', { class: 'vbtn', type: 'button', 'data-v': c, disabled: elegido ? true : null,
          onclick: () => { resp[i] = c; cuaderno.parada(n); pintar(); parada.querySelector('.apr-quiz .feedback')?.focus(); } },
          h('b', null, c, ' · ', USOS[c].nombre), h('span', null, USOS[c].para));
        if (elegido) { if (c === p.uso) b.classList.add('ok'); else if (c === elegido) b.classList.add('ko'); }
        return b;
      })), fb);
    if (elegido) {
      const ok = elegido === p.uso;
      fb.append(h('div', { class: `feedback ${ok ? 'ok' : 'ko'}`, tabindex: '-1' },
        h('b', { class: 't' }, ok ? '¡Eso es!' : `Pesa más ${p.uso}, ${USOS[p.uso].nombre.toLowerCase()}.`), p.porque),
      h('div', { class: 'apr-cambio', 'data-v': p.uso },
        h('div', { class: 'apr-cambio-h' }, h('b', null, 'Qué cambió de uso'), idear(p.usos)), h('p', null, inline(p.cambio))));
    }
    const sabe = !p.extra && contenido ? (p.terminos || []).map(id => ({ id, c: contenido.get(id) })).find(x => x.c?.sabias_que && ctx.byId.get(x.id)) : null;
    poner(parada, 
      h('p', { class: 'eyebrow' }, `Parada ${n} de ${R.length}`, fase ? ` · ${fase.nombre}` : ''),
      h('div', { class: 'anio' }, p.anio),
      h('h2', { class: 'apr-parada-h', tabindex: '-1' }, p.titulo),
      h('p', { class: 'txt' }, inline(p.texto)),
      p.terminos?.length ? h('div', { class: 'chips apr-terms' }, h('span', { class: 'small muted' }, 'En las fichas:'), p.terminos.map(id => enlaceT(ctx, id))) : null,
      quiz,
      recuadro('piensa', 'Para pensar', p.pregunta),
      p.extra ? recuadro(p.extra.tipo, p.extra.titulo, inline(p.extra.texto)) : null,
      sabe ? recuadro('sabias', null, inline(sabe.c.sabias_que), h('div', { class: 'small', style: { marginTop: '4px' } },
        h('a', { href: `#/termino/${encodeURIComponent(sabe.id)}` }, `De la ficha de ${ctx.byId.get(sabe.id).lema} →`))) : null,
      fuentesDe(p.fuentes),
      h('div', { class: 'btns apr-nav' },
        i > 0 ? h('button', { class: 'btn', type: 'button', onclick: () => ir(i - 1) }, '← Anterior') : null,
        i < R.length - 1
          ? h('button', { class: 'btn primary', type: 'button', onclick: () => { cuaderno.parada(n); ir(i + 1); } }, 'Siguiente parada →')
          : h('button', { class: 'btn primary', type: 'button', onclick: () => { cuaderno.parada(n); fin = true; pintar(); bajarA(caja); parada.querySelector('h2')?.focus({ preventScroll: true }); } }, 'Terminar la ruta ✓')));
  }
  function pintarFin() {
    const H = hechas();
    poner(parada, 
      h('p', { class: 'eyebrow' }, 'Fin de la ruta'),
      h('h2', { class: 'apr-parada-h', tabindex: '-1' }, H.length >= R.length ? 'Has recorrido las diez paradas' : `Llevas ${R.filter((_, k) => H.includes(k + 1)).length} de ${R.length} paradas`),
      h('p', { class: 'txt' }, 'Mira cómo se movió la etiqueta: de la consulta a la investigación, de ahí a la identidad, y luego al aula y a la administración. Cada color es el uso que más pesó en cada parada.'),
      h('div', { class: 'apr-linea', role: 'list' }, R.map((p, k) => h('a', { role: 'listitem', 'data-v': p.uso, href: `#/aprender/ruta/${k + 1}`, onclick: e => { e.preventDefault(); fin = false; ir(k); } },
        h('span', { class: 'apr-linea-h' }, h('b', null, p.anio), h('span', { class: 'apr-l', title: USOS[p.uso].nombre }, p.uso)), h('small', null, p.titulo)))),
      recuadro('recuerda', 'Lo que enseña la ruta', 'La etiqueta no se quedó quieta. Cada vez que cambió de uso, debería haber cambiado también la prueba: lo que vale para describir a un grupo no basta para diagnosticar a una persona, y lo que basta para reconocerse no abre por sí solo un derecho.'),
      h('div', { class: 'btns apr-nav' },
        h('button', { class: 'btn', type: 'button', onclick: () => { fin = false; ir(R.length - 1); } }, '← Volver a la última parada'),
        h('a', { class: 'btn primary', href: '#/aprender/idear' }, 'Sigue con los cinco usos →')));
  }
  function ir(k) {
    i = k; fin = false; pintar();
    history.replaceState(null, '', `#/aprender/ruta/${k + 1}`);
    bajarA(caja);
    parada.querySelector('h2')?.focus({ preventScroll: true });
  }
  pintar();
}

// ---------- Cinco usos (IDEAR) ----------
function usos(el, ctx, A) {
  const T = A.trabajos, F = A.frasesIdear || [];
  let sel = 'I';
  const panel = h('div', { class: 'apr-uso-panel', 'aria-live': 'polite' });
  const teclas = CODIGOS.map(c => h('button', { type: 'button', class: 'apr-tecla', 'data-v': c, 'aria-pressed': String(c === sel),
    onclick: () => { sel = c; teclas.forEach((b, k) => b.setAttribute('aria-pressed', String(CODIGOS[k] === sel))); pintarPanel(); } },
    h('b', null, c), h('span', null, CORTE[c] || USOS[c].nombre)));
  const cuenta = c => ctx.terms.filter(t => (t.usos || []).includes(c)).length;
  function pintarPanel() {
    const U = USOS[sel], fila = T?.filas?.[sel], s = fila && SAL[fila.salto];
    poner(panel, h('div', { class: 'apr-uso-card', 'data-v': sel },
      h('p', { class: 'eyebrow' }, `${sel} · ${U.nombre}`),
      h('p', { class: 'apr-uso-para' }, `Sirve para ${U.para}. Su sitio: ${U.donde}.`),
      h('p', { class: 'apr-uso-q' }, U.pregunta),
      h('div', { class: 'apr-uso-dl' },
        h('div', null, h('b', null, 'Qué prueba necesita'), h('p', null, U.prueba)),
        fila ? h('div', null, h('b', null, `Con «${T.palabra}»`), h('p', null, fila.escena)) : null,
        s ? h('div', null, h('b', null, 'El salto que acecha'), h('p', null, `${s.de} ${s.a}. `, h('span', { class: 'muted' }, s.falta))) : null),
      h('p', { class: 'small', style: { margin: '10px 0 0' } }, h('a', { href: `#/explorar?uso=${sel}` }, `Ver los ${plural(cuenta(sel), 'término', 'términos')} que se usan para ${U.verbo} →`))));
  }
  pintarPanel();

  meter(el, 
    h('p', { class: 'lead' }, 'Cinco letras, cinco trabajos. La misma etiqueta puede estar investigando, diagnosticando, educando, abriendo un derecho o diciendo quién eres. Pulsa cada letra para ver su pregunta y la prueba que necesita.'),
    h('div', { class: 'apr-teclas', role: 'group', 'aria-label': 'Elige un uso' }, teclas),
    panel,
    T ? [
      h('h2', null, `La misma palabra, cinco trabajos: «${T.palabra}»`),
      h('p', { class: 'muted' }, 'Una sola palabra, cinco escenas. En cada una decide algo distinto, y por eso pide una prueba distinta.'),
      h('div', { class: 'apr-trabajos', role: 'table', 'aria-label': `La palabra ${T.palabra} en cinco usos` },
        h('div', { class: 'fila cab', role: 'row' }, ['Uso', 'La escena', 'Qué decide', 'Qué prueba pide'].map(x => h('span', { role: 'columnheader' }, x))),
        CODIGOS.map(c => T.filas[c] && h('div', { class: 'fila', role: 'row', 'data-v': c },
          h('span', { role: 'cell', class: 'uso' }, letraUso(c), h('b', null, USOS[c].nombre)),
          h('span', { role: 'cell' }, h('small', null, 'La escena'), T.filas[c].escena),
          h('span', { role: 'cell' }, h('small', null, 'Qué decide'), T.filas[c].decide),
          h('span', { role: 'cell' }, h('small', null, 'Qué prueba pide'), USOS[c].prueba)))),
    ] : null,
    A.proporcion ? [
      h('h2', null, 'Cuánta prueba pide cada trabajo'),
      h('p', { class: 'muted' }, 'La exigencia es proporcional a lo que se decide. Pedir lo mismo a todo sería tan raro como no pedir nada.'),
      h('ol', { class: 'apr-escalera' }, A.proporcion.map((p, k) => h('li', { 'data-v': p.v, style: { '--w': `${40 + k * 20}%` } },
        h('span', { class: 'barra-p', 'aria-hidden': 'true' }), h('b', null, p.que), h('span', null, p.pide)))),
    ] : null,
    recuadro('aclaracion', 'Validez de uso', h('p', null, 'Es la idea que sostiene todo esto: la justificación que conecta una etiqueta, y la forma de identificarla, con una decisión concreta. Lo que la justifica en un uso no la justifica automáticamente en otro. Una palabra de la comunidad no necesita una prueba clínica, pero tampoco la sustituye.')),
    F.length ? ejercicioIdear(F) : null,
    recuadro('piensa', '¿Quieres más práctica?', h('p', null, 'En ', h('a', { href: '#/jugar/usos' }, '«¿Para qué se usa?»'), ' tienes un juego con frases que se oyen todos los días.')));
}

function ejercicioIdear(F) {
  let orden = shuffle(F), aciertos = 0, hechas = 0, premiado = false;
  const marcador = h('p', { class: 'apr-marcador', 'aria-live': 'polite' });
  const lista = h('ol', { class: 'apr-frases' });
  const final = h('div', { 'aria-live': 'polite' });
  const pintarMarcador = () => { marcador.replaceChildren(h('b', null, `${aciertos} de ${hechas}`), ` aciertos · ${F.length - hechas} por responder`); };
  function item(f) {
    const fb = h('div');
    const btns = CODIGOS.map(c => h('button', { type: 'button', class: 'apr-mini', 'data-v': c, title: USOS[c].nombre, onclick: () => responder(c) },
      h('b', null, c), h('span', null, USOS[c].nombre)));
    const li = h('li', { class: 'apr-frase' }, h('p', { class: 'fr' }, `«${f.frase}»`), h('div', { class: 'apr-minis', role: 'group', 'aria-label': 'Elige el uso' }, btns), fb);
    function responder(c) {
      const ok = c === f.uso;
      hechas++; if (ok) aciertos++;
      btns.forEach((b, k) => { b.disabled = true; if (CODIGOS[k] === f.uso) b.classList.add('ok'); else if (CODIGOS[k] === c) b.classList.add('ko'); });
      li.classList.add(ok ? 'bien' : 'mal');
      fb.replaceChildren(h('div', { class: `feedback ${ok ? 'ok' : 'ko'}` }, h('b', { class: 't' }, ok ? `Bien: ${f.uso}, ${USOS[f.uso].nombre.toLowerCase()}.` : `Es ${f.uso}, ${USOS[f.uso].nombre.toLowerCase()}.`), f.explica));
      pintarMarcador();
      if (hechas === F.length) terminar();
    }
    return li;
  }
  function terminar() {
    if (!premiado) { cuaderno.sumar('saber', 2 + aciertos); premiado = true; }
    final.replaceChildren(h('div', { class: 'card apr-final' },
      h('div', { class: 'score-big' }, `${aciertos}/${F.length}`),
      h('p', null, aciertos === F.length ? '¡Pleno! Distingues los cinco trabajos de una etiqueta.' : aciertos >= F.length * .6 ? 'Muy bien. Repasa las que fallaste: suelen ser las que se parecen a otro uso.' : 'Las frases se parecen mucho entre sí: ese es justo el problema. Repasa las explicaciones y vuelve a probar.'),
      h('button', { class: 'btn primary', type: 'button', onclick: empezar }, 'Otra vez, en otro orden')));
  }
  function empezar() {
    orden = shuffle(F); aciertos = 0; hechas = 0;
    lista.replaceChildren(...orden.map(item)); final.replaceChildren(); pintarMarcador();
  }
  empezar();
  return [h('h2', null, 'Ahora tú: ¿en qué uso está cada frase?'),
    h('p', { class: 'muted' }, 'Lee cada frase y elige su uso. Verás al momento si aciertas y por qué.'), marcador, lista, final];
}

// ---------- Seis preguntas ----------
function seis(el, ctx, A) {
  const S = A.seis;
  const cortos = ['Define', 'Identifica', 'Aplica', 'Habilita', 'Consecuencias', 'Revisa'];
  meter(el, 
    h('p', { class: 'lead' }, 'Seis preguntas sirven para cualquier etiqueta, en cualquier uso. No dan una nota: señalan dónde falta algo. Las respuestas cambian según el uso, y ahí está la gracia.'),
    h('ol', { class: 'apr-seis' }, SEIS.map((s, k) => h('li', null, h('span', { class: 'n', 'aria-hidden': 'true' }, k + 1), h('b', null, s.p), h('span', null, s.ayuda)))));
  if (!S) return;
  let paso = 0;
  const caja = h('div', { class: 'panel apr-paso', 'aria-live': 'polite' });
  const pintar = (foco) => {
    if (paso >= SEIS.length) {
      poner(caja, pasos(cortos, SEIS.length),
        h('p', { class: 'eyebrow' }, 'Conclusión'),
        h('h3', { class: 'apr-paso-h', tabindex: '-1' }, `¿Qué pide «${S.etiqueta}» en este uso?`),
        h('p', null, S.conclusion),
        recuadro('recuerda', null, 'Cambia el uso, cambia la prueba. Para dar una plaza en un programa basta una regla clara y revisable; para diagnosticar haría falta otra cosa; para reconocerse, otra distinta.'),
        h('div', { class: 'btns' }, h('button', { class: 'btn', type: 'button', onclick: () => { paso = 0; pintar(true); } }, '↺ Volver a empezar'),
          h('a', { class: 'btn primary', href: '#/pensar/laboratorio' }, 'Hazlo tú en el laboratorio →')));
    } else {
      const s = SEIS[paso];
      poner(caja, pasos(cortos, paso),
        h('p', { class: 'eyebrow' }, `Pregunta ${paso + 1} de ${SEIS.length}`),
        h('h3', { class: 'apr-paso-h', tabindex: '-1' }, s.p),
        h('p', { class: 'small muted' }, s.ayuda),
        h('div', { class: 'apr-respuesta' }, h('b', null, `Con el caso de Nora`), h('p', null, S.respuestas[s.k])),
        h('div', { class: 'btns' },
          paso > 0 ? h('button', { class: 'btn', type: 'button', onclick: () => { paso--; pintar(true); } }, '← Anterior') : null,
          h('button', { class: 'btn primary', type: 'button', onclick: () => { paso++; pintar(true); } }, paso < SEIS.length - 1 ? 'Siguiente pregunta →' : 'Ver la conclusión →')));
    }
    if (foco) caja.querySelector('.apr-paso-h')?.focus({ preventScroll: true });
  };
  pintar(false);
  meter(el, 
    h('h2', null, 'Un ejemplo resuelto, paso a paso'),
    h('div', { class: 'apr-caso' }, h('p', { class: 'eyebrow' }, `El caso · «${S.etiqueta}» para entrar en un programa`), h('p', null, S.caso)),
    caja,
    h('details', { class: 'apr-todas' }, h('summary', null, 'Ver las seis respuestas juntas'),
      h('div', { class: 'usos-tabla' }, SEIS.map(s => h('div', { class: 'on', style: { '--c': 'var(--accent)' } }, h('b', null, s.p, h('small', null, s.ayuda)), h('div', null, S.respuestas[s.k]))))),
    recuadro('aclaracion', 'Por qué no hay puntuación', 'Sería tentador sumar las seis respuestas y sacar una nota de rigor. NeuroLab no lo hace: son respuestas de naturaleza distinta y un número fingiría una precisión que no existe. Las preguntas sirven para localizar huecos y decidir qué comprobar.'),
    h('p', null, h('a', { class: 'btn primary', href: '#/pensar/laboratorio' }, 'Analiza otra etiqueta en el laboratorio de las seis preguntas →')));
}

// ---------- Detector de saltos ----------
function saltos(el, ctx, A) {
  const banco = A.detector || [];
  const juego = h('div', { class: 'game apr-detector' });
  meter(el, 
    h('p', { class: 'lead' }, 'Un salto es pasar de una orilla a otra sin puente: de un rasgo a un diagnóstico, de una asociación a una causa, de una ley a un resultado. Lee cada frase y decide si se sostiene o si salta, y en ese caso cuál es el salto. Spoiler: no todas son trampas.'),
    juego,
    h('h2', null, 'Los diez saltos'),
    h('p', { class: 'muted' }, 'Cada salto tiene dos orillas y algo que falta en medio. Si consigues lo que falta, ya no es un salto: es un puente.'),
    h('div', { class: 'apr-saltos' }, SALTOS.map(s => h('div', { class: 'apr-salto' }, saltoBox(s), h('p', { class: 'small apr-ej' }, h('b', null, 'Se oye: '), s.ej)))),
    h('p', null, h('a', { href: '#/pensar/caza' }, 'Caza un salto en el mundo real, en Pensar y aplicar →')));
  if (!banco.length) { sinDatos(juego); return; }
  const TOTAL = cuaderno.DETECTOR_TOTAL;
  const ronda = () => {
    const sin = shuffle(banco.filter(d => !d.salto));
    const porId = new Map();
    for (const d of shuffle(banco.filter(d => d.salto))) if (!porId.has(d.salto)) porId.set(d.salto, d);
    const nSin = Math.min(4, sin.length);
    const con = shuffle([...porId.values()]).slice(0, TOTAL - nSin);
    const usadas = new Set(con);
    // si faltan frases con salto distinto, completa con repetidas
    for (const d of shuffle(banco.filter(x => x.salto && !usadas.has(x)))) { if (con.length + nSin >= TOTAL) break; con.push(d); }
    return shuffle([...con, ...sin.slice(0, nSin)]).slice(0, TOTAL);
  };
  let orden = ronda(), i = 0, aciertos = 0;
  function pintar() {
    if (i >= orden.length) return resultado();
    const d = orden[i];
    const fb = h('div', { 'aria-live': 'polite' });
    const paso2 = h('div');
    const b1 = h('button', { class: 'opt', type: 'button' }, h('span', { class: 'k' }, '✓'), 'Se sostiene');
    const b2 = h('button', { class: 'opt', type: 'button' }, h('span', { class: 'k' }, '↷'), 'Hay un salto');
    const cerrar = (ok, titulo) => {
      if (ok) aciertos++;
      top.querySelector('.ac').textContent = `${aciertos} ${aciertos === 1 ? 'acierto' : 'aciertos'}`;
      fb.replaceChildren(h('div', { class: `feedback ${ok ? 'ok' : 'ko'}`, tabindex: '-1' },
        h('b', { class: 't' }, titulo), h('p', { style: { margin: d.salto ? '0 0 10px' : 0 } }, d.explica), d.salto ? saltoBox(SAL[d.salto]) : null),
      h('button', { class: 'btn primary', type: 'button', onclick: () => { i++; pintar(); juego.querySelector('.clue')?.focus({ preventScroll: true }); } }, i < orden.length - 1 ? 'Siguiente frase →' : 'Ver el resultado'));
      fb.querySelector('.feedback').focus({ preventScroll: true });
    };
    b1.addEventListener('click', () => {
      b1.disabled = b2.disabled = true;
      if (!d.salto) { b1.classList.add('ok'); cerrar(true, '¡Bien visto! Se sostiene:'); } else { b1.classList.add('ko'); b2.classList.add('ok'); cerrar(false, `Aquí hay un salto: ${SAL[d.salto].de.toLowerCase()} ${SAL[d.salto].a}.`); }
    });
    b2.addEventListener('click', () => {
      b1.disabled = b2.disabled = true;
      if (!d.salto) { b2.classList.add('ko'); b1.classList.add('ok'); cerrar(false, 'Esta se sostiene, no hay salto:'); return; }
      b2.classList.add('ok');
      const ops = shuffle([d.salto, ...shuffle(SALTOS.map(s => s.id).filter(x => x !== d.salto)).slice(0, 3)]);
      const bs = ops.map(id => h('button', { class: 'opt apr-op-salto', type: 'button', onclick: () => {
        bs.forEach((b, k) => { b.disabled = true; if (ops[k] === d.salto) b.classList.add('ok'); else if (ops[k] === id) b.classList.add('ko'); });
        cerrar(id === d.salto, id === d.salto ? '¡Exacto! Salto cazado.' : `Hay salto, pero es otro: ${SAL[d.salto].de.toLowerCase()} ${SAL[d.salto].a}.`);
      } }, h('span', null, h('b', null, SAL[id].de), ' ', SAL[id].a)));
      paso2.replaceChildren(h('p', { class: 'apr-paso2' }, h('b', null, 'Bien, hay salto. ¿Cuál?')), h('div', { class: 'quiz-opts apr-ops' }, bs));
      bs[0].focus({ preventScroll: true });
    });
    const top = h('div', { class: 'game-top' }, h('span', null, `Frase ${i + 1} de ${orden.length}`),
      h('div', { class: 'progress', 'aria-hidden': 'true' }, h('i', { style: { width: `${100 * i / orden.length}%` } })),
      h('span', { class: 'ac' }, `${aciertos} ${aciertos === 1 ? 'acierto' : 'aciertos'}`));
    juego.replaceChildren(top, h('p', { class: 'clue', tabindex: '-1' }, `«${d.frase}»`), h('div', { class: 'quiz-opts two' }, b1, b2), paso2, fb);
  }
  function resultado() {
    cuaderno.detector(aciertos);
    const mejor = Math.max(aciertos, storage('detector') || 0); storage('detector', mejor);
    const n = orden.length;
    juego.replaceChildren(h('div', { class: 'card apr-final' }, h('p', { class: 'eyebrow' }, 'Resultado'),
      h('div', { class: 'score-big' }, `${aciertos}/${n}`),
      h('p', null, aciertos === n ? 'Ojo de lince: ningún salto se te ha escapado, y tampoco has visto saltos donde no los había.'
        : aciertos >= 9 ? 'Muy buen ojo. Repasa las orillas de los saltos que se te escaparon.'
          : 'Los saltos se disfrazan bien. Repasa la lista de abajo y vuelve a intentarlo: cada ronda trae frases distintas.'),
      h('p', { class: 'small muted' }, `Tu mejor resultado en este navegador: ${mejor}/${n}.`),
      h('div', { class: 'btns' }, h('button', { class: 'btn primary', type: 'button', onclick: () => { orden = ronda(); i = 0; aciertos = 0; pintar(); bajarA(juego); } }, 'Otra ronda'),
        h('a', { class: 'btn', href: '#/cuaderno' }, 'Ver tu cuaderno'))));
  }
  pintar();
}

// ---------- Dos errores ----------
// Normal estándar: función de distribución e inversa (por bisección; basta para el ejemplo)
const erf = x => { const t = 1 / (1 + .3275911 * Math.abs(x)); const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - .284496736) * t + .254829592) * t * Math.exp(-x * x); return x >= 0 ? y : -y; };
const Phi = z => .5 * (1 + erf(z / Math.SQRT2));
const PhiInv = p => { let lo = -8, hi = 8; for (let k = 0; k < 60; k++) { const m = (lo + hi) / 2; if (Phi(m) < p) lo = m; else hi = m; } return (lo + hi) / 2; };
const puntuaciones = (n, media, sd) => Array.from({ length: n }, (_, k) => media + sd * PhiInv((k + .5) / n)).reverse();
const NS = 'http://www.w3.org/2000/svg';
const s = (tag, attrs = {}, ...kids) => { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs)) if (v !== null && v !== undefined) e.setAttribute(k, v); e.append(...kids); return e; };

function errores(el, ctx, A) {
  const E = A.errores;
  meter(el, 
    h('p', { class: 'lead' }, 'Cuando se decide quién lleva una etiqueta, se puede fallar de dos maneras. Las dos pesan, siempre. Quien solo mira una, siempre encuentra una solución fácil.'),
    h('div', { class: 'apr-dos' },
      h('div', { class: 'apr-err amp' }, h('p', { class: 'eyebrow' }, ERRORES.ampliar.corto), h('h3', null, ERRORES.ampliar.nombre), h('p', null, ERRORES.ampliar.ej)),
      h('div', { class: 'apr-err exc' }, h('p', { class: 'eyebrow' }, ERRORES.excluir.corto), h('h3', null, ERRORES.excluir.nombre), h('p', null, ERRORES.excluir.ej))));
  if (!E) return;
  let mejor = false, corte = E.inicio;
  let si = [], no = [];
  const calcular = () => { si = puntuaciones(E.necesitan, mejor ? E.media_si_mejor : E.media_si, E.sd); no = puntuaciones(E.total - E.necesitan, E.media_no, E.sd); };
  calcular();

  // Controles
  const valor = h('output', { class: 'apr-corte-v' });
  const rango = h('input', { type: 'range', min: E.min, max: E.max, step: 1, value: corte, 'aria-label': 'Punto de corte de la prueba' });
  rango.addEventListener('input', () => { corte = +rango.value; presets.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.c === corte))); pintar(); });
  const presets = h('div', { class: 'toggles', role: 'group', 'aria-label': 'Criterios de ejemplo' },
    [[45, 'Criterio amplio'], [55, 'Intermedio'], [65, 'Criterio estricto']].map(([c, l]) => h('button', { class: 'toggle', type: 'button', 'data-c': c, 'aria-pressed': String(c === corte),
      onclick: () => { corte = c; rango.value = c; presets.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.c === corte))); pintar(); } }, l)));
  const bMejor = h('button', { class: 'toggle', type: 'button', 'aria-pressed': 'false', onclick: () => { mejor = !mejor; bMejor.setAttribute('aria-pressed', String(mejor)); calcular(); pintar(); } }, 'Usar una prueba mejor');

  // Balanza
  const viga = s('g', { class: 'viga' }, s('rect', { x: 40, y: 56, width: 240, height: 8, rx: 4 }));
  const platoI = s('g', { class: 'plato amp' }), platoD = s('g', { class: 'plato exc' });
  const nI = s('text', { class: 'num', 'text-anchor': 'middle', x: 0, y: 66 }), nD = s('text', { class: 'num', 'text-anchor': 'middle', x: 0, y: 66 });
  for (const [g, n, t] of [[platoI, nI, 'de más'], [platoD, nD, 'fuera']]) {
    g.append(s('line', { x1: 0, y1: 0, x2: -26, y2: 30 }), s('line', { x1: 0, y1: 0, x2: 26, y2: 30 }), s('path', { class: 'cuenco', d: 'M-38 30 Q0 54 38 30 Z' }), n, s('text', { class: 'lbl', 'text-anchor': 'middle', x: 0, y: 84 }, t));
  }
  const balanza = s('svg', { viewBox: '0 0 320 196', class: 'apr-balanza', role: 'img' },
    s('path', { class: 'pie', d: 'M160 62 L138 168 L182 168 Z' }), s('rect', { class: 'pie', x: 112, y: 168, width: 96, height: 8, rx: 4 }),
    viga, platoI, platoD, s('circle', { class: 'eje', cx: 160, cy: 60, r: 6 }));

  // Campanas: se dibujan al ancho real del contenedor para que el texto no encoja en el móvil
  let W = 600;
  const H = 170, x0 = 18, x1 = 102, base = H - 22, alto = H - 62;
  const X = v => 14 + (v - x0) / (x1 - x0) * (W - 28);
  const yDe = (v, m) => base - Math.exp(-.5 * ((v - m) / E.sd) ** 2) * alto;
  const curva = m => { let d = ''; for (let v = x0; v <= x1 + .001; v += .5) d += `${d ? 'L' : 'M'}${X(v).toFixed(1)} ${yDe(v, m).toFixed(1)}`; return d; };
  const area = (m, desde, hasta) => { let d = `M${X(desde).toFixed(1)} ${base}`; for (let v = desde; v <= hasta + .001; v += .5) d += `L${X(v).toFixed(1)} ${yDe(v, m).toFixed(1)}`; return d + `L${X(hasta).toFixed(1)} ${base}Z`; };
  const campanas = s('svg', { class: 'apr-curvas', role: 'img', 'aria-label': 'Dos campanas de puntuaciones que se solapan, cortadas por una línea' });
  const campWrap = h('div', { class: 'apr-curvas-w' }, campanas, h('p', { class: 'small muted' }, 'Puntuaciones de los dos grupos. Lo coloreado a la derecha del corte son los etiquetados de más; lo coloreado a la izquierda, los que se quedan fuera. Cada campana está a su escala.'));
  function pintarCampanas() {
    const mSi = mejor ? E.media_si_mejor : E.media_si;
    campanas.setAttribute('viewBox', `0 0 ${W} ${H}`);
    campanas.replaceChildren(
      s('line', { class: 'base', x1: 14, x2: W - 14, y1: base, y2: base }),
      s('path', { class: 'zona amp', d: area(E.media_no, Math.max(corte, x0), x1) }),
      s('path', { class: 'zona exc', d: area(mSi, x0, Math.min(corte, x1)) }),
      s('path', { class: 'c-no', d: curva(E.media_no) }), s('path', { class: 'c-si', d: curva(mSi) }),
      s('text', { class: 'lbl', x: X(E.media_no) + 4, y: 32, 'text-anchor': 'end' }, `No lo necesitan (${E.total - E.necesitan})`),
      s('text', { class: 'lbl fuerte', x: X(mSi) - 4, y: 16, 'text-anchor': 'start' }, `Lo necesitan (${E.necesitan})`),
      s('line', { class: 'corte', x1: X(corte), x2: X(corte), y1: 22, y2: base + 6 }),
      s('text', { class: 'lbl corte-t', x: X(corte) + (X(corte) > W - 90 ? -6 : 6), y: base - 6, 'text-anchor': X(corte) > W - 90 ? 'end' : 'start' }, `corte: ${corte}`),
      s('text', { class: 'eje-t', x: 14, y: H - 4 }, '← menos puntos'), s('text', { class: 'eje-t', x: W - 14, y: H - 4, 'text-anchor': 'end' }, 'más puntos →'));
  }
  const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(() => {
    const w = Math.max(280, Math.min(820, Math.round(campWrap.clientWidth || 600)));
    if (Math.abs(w - W) > 3) { W = w; pintarCampanas(); }
  }) : null;
  ro?.observe(campWrap);

  // Rejillas de puntos
  const rejilla = (n, cols) => { const filas = Math.ceil(n / cols); const g = s('svg', { viewBox: `0 0 ${cols * 10} ${filas * 10}`, class: 'apr-puntos', 'aria-hidden': 'true' }); const celdas = []; for (let k = 0; k < n; k++) { const r = s('rect', { x: (k % cols) * 10 + 1, y: Math.floor(k / cols) * 10 + 1, width: 8, height: 8, rx: 2 }); celdas.push(r); g.append(r); } g.celdas = celdas; return g; };
  const gSi = rejilla(E.necesitan, 10), gNo = rejilla(E.total - E.necesitan, 30);
  const txtSi = h('p', { class: 'apr-rej-t' }), txtNo = h('p', { class: 'apr-rej-t' });
  const resumen = h('p', { class: 'apr-resumen', 'aria-live': 'polite' });
  const lectura = h('div');

  function pintar() {
    const TP = si.filter(v => v >= corte).length, FN = si.length - TP, FP = no.filter(v => v >= corte).length;
    valor.textContent = `${corte} puntos`;
    // balanza: baja el plato con más casos
    const ang = Math.max(-16, Math.min(16, (FP - FN) / Math.max(1, FP + FN) * 16));
    const rad = ang * Math.PI / 180;
    viga.style.transform = `rotate(${-ang}deg)`;
    platoI.style.transform = `translate(${160 - 120 * Math.cos(rad)}px, ${60 + 120 * Math.sin(rad)}px)`;
    platoD.style.transform = `translate(${160 + 120 * Math.cos(rad)}px, ${60 - 120 * Math.sin(rad)}px)`;
    nI.textContent = FP; nD.textContent = FN;
    balanza.setAttribute('aria-label', `Balanza: ${FP} etiquetados de más frente a ${FN} dejados fuera`);
    pintarCampanas();
    // rejillas
    gSi.celdas.forEach((r, k) => r.setAttribute('class', si[k] >= corte ? 'det' : 'fuera'));
    gNo.celdas.forEach((r, k) => r.setAttribute('class', no[k] >= corte ? 'demas' : 'neutro'));
    txtSi.replaceChildren(h('b', null, `${E.necesitan} que sí necesitan apoyo`), h('span', null, h('i', { class: 'sw det' }), `${TP} detectados`), h('span', null, h('i', { class: 'sw fuera' }), `${FN} dejados fuera`));
    txtNo.replaceChildren(h('b', null, `${E.total - E.necesitan} que no lo necesitan`), h('span', null, h('i', { class: 'sw demas' }), `${FP} etiquetados de más`), h('span', null, h('i', { class: 'sw neutro' }), `${E.total - E.necesitan - FP} bien descartados`));
    resumen.replaceChildren('Con el corte en ', h('b', null, corte), ': de los ', E.necesitan, ' niños que necesitan apoyo, la prueba encuentra a ', h('b', null, TP), ' y deja fuera a ', h('b', { class: 't-exc' }, FN),
      '. De los ', E.total - E.necesitan, ' que no lo necesitan, marca de más a ', h('b', { class: 't-amp' }, FP), '.');
    const cuarto = corte <= 48 ? 'amplio' : corte >= 62 ? 'estricto' : 'medio';
    poner(lectura, recuadro(cuarto === 'medio' ? 'aclaracion' : 'piensa', cuarto === 'amplio' ? 'Criterio amplio' : cuarto === 'estricto' ? 'Criterio estricto' : 'Un punto intermedio',
      cuarto === 'amplio' ? 'Casi nadie que lo necesita se queda fuera, pero la etiqueta llega a muchos que no la necesitan. Si después no hay una evaluación cuidadosa, eso es ampliar sin justificación.'
        : cuarto === 'estricto' ? 'Casi nadie lleva la etiqueta de más, pero muchos que necesitan apoyo se quedan fuera. Endurecer el criterio también es un error, aunque haga menos ruido.'
          : 'Ningún corte hace desaparecer los dos errores: moverlo solo los cambia de sitio. ' + (mejor ? 'Con una prueba mejor, los dos bajan a la vez.' : 'Prueba a pulsar «Usar una prueba mejor».')));
  }
  pintar();

  const usosE = h('div', { 'aria-live': 'polite' });
  const tUsos = toggles(E.usos.map(u => [u.v, `${u.v} · ${u.nombre}`]), { valor: E.usos[0].v, alCambiar: v => pintarUso(v) });
  const pintarUso = v => { const u = E.usos.find(x => x.v === v); poner(usosE, u ? h('div', { class: 'apr-cambio', 'data-v': u.v }, h('div', { class: 'apr-cambio-h' }, h('b', null, u.nombre)), h('p', null, u.texto)) : h('p', { class: 'small muted' }, 'Elige un uso para ver qué cuesta cada error.')); };
  pintarUso(E.usos[0].v);

  meter(el, 
    h('h2', null, 'La balanza: 1.000 niños y una prueba de cribado'),
    recuadro('atencion', 'Ejemplo inventado', h('p', null, E.aviso, ' Imagina 1.000 niños de un colegio, de los que 100 necesitan de verdad un apoyo. Una prueba de cribado da a cada uno una puntuación, y quien supera el corte pasa a una evaluación completa. Las puntuaciones de los dos grupos se solapan, como pasa casi siempre.')),
    h('div', { class: 'apr-lab' },
      h('div', { class: 'apr-ctrl' },
        h('label', { class: 'apr-corte' }, h('span', null, 'Mueve el corte: '), valor),
        rango, h('div', { class: 'apr-rango-t small muted', 'aria-hidden': 'true' }, h('span', null, '← más amplio'), h('span', null, 'más estricto →')),
        presets, h('div', { class: 'toggles' }, bMejor)),
      h('div', { class: 'apr-bal' }, balanza, h('p', { class: 'small muted apr-bal-t' }, h('span', { class: 't-amp' }, 'Etiquetados de más'), ' frente a ', h('span', { class: 't-exc' }, 'dejados fuera'), '. Baja el plato con más casos.')),
      campWrap),
    resumen,
    h('div', { class: 'apr-rejillas' }, h('div', { class: 'si' }, txtSi, gSi), h('div', { class: 'no' }, txtNo, gNo)),
    h('p', { class: 'small muted' }, 'Cada cuadrado es un niño. Aquí sí se respetan las cantidades: el grupo que no necesita apoyo es nueve veces mayor, y por eso un pequeño porcentaje de error en él son muchos niños.'),
    lectura,
    h('h2', null, '¿Qué error cuesta más? Depende del uso'),
    h('p', { class: 'muted' }, 'Pesar igual no significa que cuesten lo mismo en cada uso: significa que los dos entran siempre en la balanza.'),
    tUsos, usosE,
    recuadro('profundizar', 'Lo que encontró el proyecto', h('p', null, E.hallazgo),
      h('p', { style: { marginTop: '8px' } }, 'Por eso la conclusión no es «todo es una moda» ni «todo es biología», sino ', h('b', null, '«cada uso necesita su propia justificación»'), '.')),
    h('div', { class: 'chips apr-terms' }, h('span', { class: 'small muted' }, 'En las fichas:'),
      ['errores-simetricos', 'sensibilidad-especificidad', 'cribado', 'umbral', 'sobrediagnostico', 'infradiagnostico'].map(id => enlaceT(ctx, id))));
  return { destroy() { ro?.disconnect(); } };
}

// ---------- Glosario ----------
function glosario(el, ctx, A) {
  const letraDe = t => (norm(t.lema).replace(/[^a-z0-9ñ]/g, '')[0] || '#').toUpperCase();
  const clave = t => t.lema.replace(/^[^\p{L}\p{N}]+/u, '');
  const terms = ctx.terms.slice().sort((a, b) => clave(a).localeCompare(clave(b), 'es'));
  const letras = [...new Set(terms.map(letraDe))].sort((a, b) => a.localeCompare(b, 'es'));
  const fams = FAMILIAS.filter(f => terms.some(t => t.familia === f));
  let letra = null, familia = null, q = '';
  const buscar = h('input', { type: 'search', placeholder: 'Busca una palabra', 'aria-label': 'Buscar en el glosario' });
  const tLetras = toggles(letras.map(l => [l, l]), { alCambiar: v => { letra = v; pintar(); } });
  tLetras.classList.add('apr-letras-gl'); tLetras.setAttribute('aria-label', 'Filtrar por letra');
  const tFams = toggles(fams.map(f => [f, h('span', { class: 'apr-fam', style: { '--fc': famVar(f) } }, FAM_CORTA[f] || f)]), { alCambiar: v => { familia = v; pintar(); } });
  tFams.setAttribute('aria-label', 'Filtrar por familia');
  const cuenta = h('p', { class: 'small muted', 'aria-live': 'polite' });
  const lista = h('div', { class: 'apr-gl' });
  buscar.addEventListener('input', () => { q = norm(buscar.value.trim()); pintar(); });
  function pintar() {
    const ok = terms.filter(t => (!letra || letraDe(t) === letra) && (!familia || t.familia === familia) &&
      (!q || norm([t.lema, ...(t.variantes || []), t.definicion].join(' ')).includes(q)));
    cuenta.textContent = `${plural(ok.length, 'término', 'términos')}${letra || familia || q ? ' con estos filtros' : ''}.`;
    const grupos = new Map();
    for (const t of ok) { const l = letraDe(t); if (!grupos.has(l)) grupos.set(l, []); grupos.get(l).push(t); }
    lista.replaceChildren(...(ok.length ? [...grupos].map(([l, ts]) => h('section', { class: 'apr-gl-l' }, h('h3', null, l),
      h('dl', null, ts.flatMap(t => [
        h('dt', null, h('a', { href: `#/termino/${encodeURIComponent(t.id)}` }, t.lema), ' ', marcaEstado(t.estado)),
        h('dd', null, h('p', null, t.definicion), h('div', { class: 'meta' }, famTag(t.familia), idear(t.usos)))]))))
      : [h('div', { class: 'empty' }, h('p', null, 'Ningún término con estos filtros.'), h('button', { class: 'btn', type: 'button', onclick: limpiar }, 'Quitar los filtros'))]));
  }
  function limpiar() {
    letra = familia = null; q = ''; buscar.value = '';
    tLetras.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', 'false'));
    tFams.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', 'false'));
    pintar();
  }
  meter(el, 
    h('p', { class: 'lead' }, 'Todas las palabras de NeuroLab con su definición breve. Filtra por letra o por familia, o busca, y entra en la ficha para leer más.'),
    A.palabras?.length ? h('details', { class: 'apr-casa' }, h('summary', null, 'Las palabras de la casa: IDEAR, validez de uso, saltos…'),
      h('dl', { class: 'gl' }, A.palabras.flatMap(([t, d]) => [h('dt', null, t), h('dd', null, d)]))) : null,
    h('div', { class: 'apr-gl-filtros' },
      h('div', { class: 'apr-buscar' }, buscar),
      h('div', null, h('p', { class: 'apr-flabel' }, 'Por letra'), tLetras),
      h('div', null, h('p', { class: 'apr-flabel' }, 'Por familia'), tFams)),
    cuenta, lista);
  pintar();
}
