import { h, poner, USOS, CODIGOS, FAMILIAS, FAM_CORTA, famVar, tip, tipTerm, famColor, anio, recuadro, dialogo, inline, LOGO, SALTOS } from '../lib.js';
import * as cuaderno from '../cuaderno.js';
import { EJES, ORDEN_EJES, PELDANOS } from '../cuaderno.js';
import { preguntaEntrada, semaforo } from '../metodo.js';

export function render(root, ctx) {
  document.title = 'NeuroLab · Consulta, juega y aprende sobre neurodiversidad, diagnósticos y etiquetas';
  const { terms, hitos, rels } = ctx;
  const fiables = terms.filter(t => t.estado === 'verificada' || t.estado === 'probable').length;
  const cuenta = c => terms.filter(t => t.usos.includes(c)).length;

  const q = h('input', { type: 'search', name: 'q', placeholder: 'Busca una etiqueta, una persona o una idea', 'aria-label': 'Buscar en NeuroLab', autocomplete: 'off' });
  const form = h('form', { class: 'search-big', role: 'search', onsubmit: e => { e.preventDefault(); location.hash = `#/explorar?q=${encodeURIComponent(q.value.trim())}`; } }, q);

  const art = h('div', { class: 'hero-art' });
  const dato = h('div');
  const c = cuaderno.leer();
  const salto = SALTOS[Math.floor(Math.random() * SALTOS.length)];
  root.append(
    h('section', { class: 'hero' },
      h('div', null,
        h('p', { class: 'eyebrow' }, 'Cambia el uso, cambia la prueba'),
        h('h1', { class: 'marca', html: `${LOGO}<span>Neuro<b>Lab</b></span>` }),
        h('p', { class: 'sub' }, 'Consulta, juega y aprende sobre neurodiversidad, diagnósticos y etiquetas'),
        h('p', { class: 'lead' }, `TDAH, autismo, altas capacidades, dislexia, neurodiversidad… Cada vez oímos más estas palabras, y cada vez discutimos más sobre ellas. NeuroLab reúne ${terms.length} términos con su historia, sus fuentes y lo que significan hoy, para que entiendas una idea sencilla y poderosa: la misma etiqueta sirve para cosas distintas, y cada uso necesita su propia prueba.`),
        form,
        h('div', { class: 'btns', style: { marginTop: '14px' } },
          h('a', { class: 'btn primary', href: '#/explorar' }, 'Explorar los términos'),
          h('a', { class: 'btn', href: '#/azar' }, '🎲 Un término al azar'),
          h('a', { class: 'btn', href: '#/aprender' }, 'Aprender en diez paradas')),
        h('div', { class: 'stats' },
          h('div', { class: 'stat' }, h('b', null, terms.length), h('span', null, 'términos')),
          h('div', { class: 'stat' }, h('b', null, hitos.length), h('span', null, 'hitos')),
          h('div', { class: 'stat' }, h('b', null, rels.length), h('span', null, 'conexiones')),
          h('div', { class: 'stat' }, h('b', null, fiables), h('span', null, 'fichas verificadas o probables')))),
      art),
    preguntaEntrada(),
    h('section', null,
      h('h2', null, 'Una etiqueta, cinco trabajos'),
      h('p', { class: 'lead' }, 'Una etiqueta no es una cosa: es una herramienta. La misma palabra puede estar haciendo cinco trabajos distintos, y lo que la justifica en uno no la justifica automáticamente en otro. Se recuerdan con un verbo: IDEAR.'),
      h('div', { class: 'ucards' }, CODIGOS.map(k => h('a', { class: 'ucard', 'data-v': k, href: `#/explorar?uso=${k}` },
        h('span', { class: 'letra', 'aria-hidden': 'true' }, k), h('b', null, USOS[k].nombre), h('span', null, USOS[k].para),
        h('span', { class: 'n' }, `${cuenta(k)} términos circulan aquí`)))),
      recuadro('recuerda', 'Cambia el uso, cambia la prueba',
        'Para investigar basta con describir bien a un grupo. Para diagnosticar hace falta acertar con una persona. Para educar, que el apoyo sirva. Para acceder a un derecho, reglas claras y revisables. Para reconocerse, claridad y respeto. ',
        h('a', { href: '#/aprender/idear' }, 'Los cinco usos, despacio →'))),
    h('section', null,
      h('h2', null, 'Dos maneras de usar NeuroLab'),
      h('p', { class: 'lead' }, 'Puedes venir a enterarte o venir a implicarte. Las dos valen, y lo mejor es pasar de una a otra.'),
      h('div', { class: 'dos-niveles' },
        h('div', { class: 'nivel-box n1' },
          h('p', { class: 'nivel' }, 'Nivel 1'), h('h2', null, 'Enterarte'),
          h('p', null, 'Para saber qué hay: lees, recorres y miras. Tú pones la curiosidad; NeuroLab, los datos y las fuentes.'),
          h('div', { class: 'tiles' },
            tile('#/explorar', '⌕', 'Explorar', 'Los términos con filtros y una ficha para cada uno: cómo surgió, para qué sirve, qué se discute y qué tiene que ver con hoy.'),
            tile('#/viajar', '⟿', 'Viajar', 'Una máquina del tiempo desde 1798 hasta hoy, con viaje guiado en cinco paradas.'),
            tile('#/visualizar', '✳', 'Visualizar', 'El mapa de relaciones, las tendencias y el pulso de las etiquetas.'))),
        h('div', { class: 'nivel-box n2' },
          h('p', { class: 'nivel' }, 'Nivel 2'), h('h2', null, 'Implicarte'),
          h('p', null, 'Para hacer algo con ello: aprendes, juegas, piensas y lo aplicas a tu vida. Lo que hagas queda en tu cuaderno.'),
          h('div', { class: 'tiles' },
            tile('#/aprender', '◎', 'Aprender', 'Una ruta de diez paradas, los cinco usos, las seis preguntas, los saltos y los dos errores.'),
            tile('#/jugar', '★', 'Jugar', 'Cinco juegos para poner a prueba lo aprendido, con marcas que superar.'),
            tile('#/pensar', '✎', 'Pensar y aplicar', 'Siete actividades para pensar con calma, cazar saltos y dar un paso pequeño fuera de la pantalla.'))))),
    h('section', null,
      h('h2', null, 'La idea en una conversación'),
      dialogo([
        ['moda', 'Ahora a todo el mundo le diagnostican algo. Es una moda.'],
        ['cerebro', 'Qué va. Es neurobiología: antes no se veía y ahora sí. Punto.'],
        ['uso', '¿Y si los dos tenéis parte de razón y os falta una pregunta? ¿Para qué se está usando la etiqueta: para investigar, para atender a alguien, para un apoyo en clase, para un derecho o para entenderse?'],
        ['moda', '¿Y eso qué cambia?'],
        ['uso', 'Todo. Cambia el uso, cambia la prueba.'],
      ]),
      h('p', { class: 'kicker', style: { fontSize: '1.25rem', maxWidth: '38em' } }, 'Ni «todo es una moda» ni «todo es biología»: cada uso de una etiqueta necesita su propia justificación.'),
      h('p', null, h('a', { href: '#/aprender' }, 'Empieza la ruta guiada →'))),
    h('section', null,
      h('h2', null, 'Cuidado con el salto'),
      h('p', { class: 'muted' }, 'Muchas discusiones se tuercen en el mismo sitio: cuando pasamos de una orilla a otra sin puente. Aquí tienes uno, al azar.'),
      h('div', { class: 'salto-box' },
        h('span', { class: 'orilla' }, salto.de), h('span', { class: 'vacio', 'aria-hidden': 'true' }, '⤳'), h('span', { class: 'orilla' }, salto.a),
        h('div', { class: 'falta' }, h('i', null, salto.ej), ' ', h('b', null, 'Lo que falta: '), salto.falta)),
      h('p', { class: 'small', style: { marginTop: '10px' } }, h('a', { href: '#/aprender/saltos' }, 'Entrena tu ojo con el detector de saltos →'))),
    dato,
    h('section', null,
      h('h2', null, 'Tu recorrido, en cuatro ejes'),
      h('p', { class: 'muted' }, 'NeuroLab no solo informa: te acompaña por cuatro caminos que siempre van juntos. Cada cosa que haces aquí te hace subir un peldaño en alguno.'),
      h('div', { class: 'ejes' }, ORDEN_EJES.map(e => {
        const P = PELDANOS[e], p = cuaderno.peldano(e, c);
        return h('a', { class: 'eje', 'data-eje': e, href: '#/cuaderno', style: { textDecoration: 'none', color: 'var(--text)' } },
          h('h3', null, h('span', { 'aria-hidden': 'true', style: { color: 'var(--c)' } }, EJES[e].ico, ' '), EJES[e].nombre),
          h('div', { class: 'sub' }, EJES[e].sub),
          h('div', { class: 'barra', 'aria-hidden': 'true' }, h('i', { style: { '--w': `${Math.round(100 * (p + 1) / P.length)}%` } })),
          h('p', { class: 'small', style: { margin: '8px 0 0' } }, p >= 0 ? ['Estás en ', h('b', null, P[p].n.toLowerCase()), '.'] : 'Sin empezar.'));
      })),
      h('p', { class: 'small', style: { marginTop: '10px' } }, h('a', { href: '#/cuaderno' }, 'Abrir tu cuaderno →'))),
    h('section', null,
      h('h2', null, 'Antes de seguir: el semáforo'),
      h('p', { class: 'muted' }, 'Hablar de diagnósticos remueve. Si en algún momento algo te pesa, aquí está la salida.'),
      semaforo()),
  );
  ctx.contenido().then(m => {
    const con = terms.filter(t => m.get(t.id)?.sabias_que && t.estado !== 'dudosa');
    const otro = () => {
      const t = con[Math.floor(Math.random() * con.length)];
      poner(dato, recuadro('sabias', null, inline(m.get(t.id).sabias_que),
        h('div', { class: 'btns', style: { marginTop: '8px' } }, h('a', { class: 'btn small', href: `#/termino/${encodeURIComponent(t.id)}` }, `Ficha: ${t.lema}`),
          h('button', { class: 'btn small', type: 'button', onclick: otro }, 'Otro dato'))));
    };
    if (con.length) otro();
  }).catch(() => {});
  waffle(art, ctx);
}

function tile(href, ico, titulo, texto) {
  return h('a', { class: 'card tile', href }, h('span', { class: 'ico', 'aria-hidden': 'true' }, ico), h('h3', null, titulo), h('p', null, texto));
}

// Retrato de los datos: un punto por término, del más antiguo al más reciente, coloreado por familia
function waffle(el, ctx) {
  const d3 = window.d3;
  const ts = ctx.cronologico.concat(ctx.terms.filter(t => t.anio === null));
  if (!ts.length) return;
  const cols = 13, cell = 22, r = 8, rows = Math.ceil(ts.length / cols);
  const W = cols * cell, H = rows * cell + 26;
  const svg = d3.select(el).append('svg').attr('viewBox', `0 0 ${W} ${H}`).attr('role', 'img')
    .attr('aria-label', `Un punto por término, ordenados del más antiguo (${anio(ts[0].anio)}) al más reciente, coloreados por familia.`);
  svg.selectAll('circle').data(ts).join('circle')
    .attr('cx', (d, i) => (i % cols) * cell + cell / 2).attr('cy', (d, i) => Math.floor(i / cols) * cell + cell / 2).attr('r', r)
    .attr('fill', d => famColor(d.familia))
    .attr('stroke', 'var(--bg)').attr('stroke-width', 2).style('cursor', 'pointer')
    .on('mousemove', (e, d) => tip.show(tipTerm(d), e.clientX, e.clientY)).on('mouseleave', () => tip.hide())
    .on('click', (e, d) => { tip.hide(); location.hash = `#/termino/${encodeURIComponent(d.id)}`; });
  el.append(h('div', { class: 'legend', style: { justifyContent: 'center', marginTop: '6px' }, 'aria-hidden': 'true' },
    FAMILIAS.filter(f => ctx.terms.some(t => t.familia === f)).map(f => h('span', null, h('i', { style: { '--c': famVar(f) } }), FAM_CORTA[f]))));
  svg.append('text').attr('x', 0).attr('y', H - 6).attr('class', 'lbl').style('font-size', '11px').style('fill', 'var(--muted)')
    .text(`${anio(ts[0].anio)} → ${anio(ctx.cronologico.at(-1).anio)} · cada punto, un término`);
}
