import { h, poner, cabeza, recuadro, descargar, fecha, plural, corta, toggles, URL_BASE } from '../lib.js';
import * as cuaderno from '../cuaderno.js';
import { EJES, ORDEN_EJES, PELDANOS, INSIGNIAS } from '../cuaderno.js';
import { RUTAS, preguntaEntrada, semaforo, REV } from '../metodo.js';

// Las emociones de las fichas vienen de ficha.js. Se cargan aparte para que, si esa vista fallara,
// el cuaderno siga funcionando (las reacciones se mostrarían con su clave).
let EMO = {};
const emocionesListas = import('./ficha.js').then(m => { EMO = Object.fromEntries(m.EMOCIONES || []); }).catch(() => {});

// Adónde ir para subir cada peldaño (el índice es el peldaño actual; -1 cuenta como 0)
const IR = {
  ser: ['#/pensar/termometro', '#/pensar/termometro', '#/pensar/termometro', '#/pensar/situaciones', '#/pensar/situaciones'],
  saber: ['#/explorar', '#/aprender/ruta', '#/jugar', '#/aprender/saltos', '#/pensar/caza'],
  hacer: ['#/jugar', '#/jugar', '#/pensar/caza', '#/pensar/paso', '#/pensar/paso'],
  crear: ['#/pensar/relato', '#/pensar/relato', '#/pensar/relato', '#/pensar/relato', '#/pensar/ciclo'],
};
const IR_INSIGNIA = {
  primera: '#/explorar', coleccion: '#/explorar', viajero: '#/viajar', cartografo: '#/visualizar', ruta: '#/aprender/ruta', idear: '#/jugar/usos',
  lince: '#/aprender/saltos', racha: '#/jugar/antes', mitos: '#/jugar/mito', seis: '#/pensar/laboratorio', termometro: '#/pensar/termometro', brujula: '#/',
  cazador: '#/pensar/caza', consejo: '#/pensar/situaciones', ciclo: '#/pensar/ciclo', narrador: '#/pensar/relato', antesdespues: '#/pensar/relato',
  paso: '#/pensar/paso', revision: '#/pensar/paso',
};
const TIPOS = {
  sap: { uno: 'Termómetro', varios: 'Termómetros', eje: 'ser', ir: '#/pensar/termometro' },
  seis: { uno: 'Seis preguntas', varios: 'Laboratorio de las seis preguntas', eje: 'saber', ir: '#/pensar/laboratorio' },
  caza: { uno: 'Caza', varios: 'Saltos cazados', eje: 'hacer', ir: '#/pensar/caza' },
  ciclo: { uno: 'Ciclo', varios: 'De la etiqueta al ciclo', eje: 'crear', ir: '#/pensar/ciclo' },
  amv: { uno: 'Paso mínimo', varios: 'Pasos mínimos', eje: 'hacer', ir: '#/pensar/paso' },
};
const ORDEN_TIPOS = ['amv', 'sap', 'seis', 'caza', 'ciclo'];
const COLOR_RUTA = { A: '#2E9E5B', B: '#3B6CC4', C: '#D89614' };
const DIA_MS = 864e5;
const diaISO = ms => new Date(ms).toISOString().slice(0, 10); // igual que el cuaderno: día en UTC
const diaFecha = d => new Date(`${d}T12:00:00Z`);

function resumen(e) {
  const d = e.datos || {};
  if (Array.isArray(d.resumen)) return d.resumen.filter(([, v]) => v);
  if (e.tipo === 'amv') return [['Haré', d.hare], ['El día', d.dia], ['Durante', d.durante], ['Comprobaré', d.comprobare], ['Qué cambiaría fuera', d.rev]].filter(([, v]) => v);
  return [];
}

export function render(root, ctx) {
  document.title = 'Tu cuaderno · NeuroLab';
  const cuerpo = h('div');
  root.append(
    cabeza(2, 'Tu cuaderno', 'Aquí queda lo que haces en NeuroLab, ordenado en cuatro ejes: lo que sientes y te sale hacer, lo que sabes, lo que haces y lo que crees. Vive solo en este navegador: nadie más lo ve, ni siquiera quien hizo NeuroLab.'),
    cuerpo,
  );
  let P = null, filtro = null, abierto = null, confirmar = null, borrarTodo = false, aviso = '';
  ctx.pensar().then(p => { P = p; pintar(); }).catch(() => {});
  emocionesListas.then(() => pintar());

  function pintar() {
    const c = cuaderno.leer();
    const total = Object.values(c.xp).reduce((s, n) => s + n, 0);
    const propias = c.entradas.filter(e => TIPOS[e.tipo]);
    const reacciones = c.entradas.filter(e => e.tipo === 'reaccion');
    const pendientes = c.entradas.filter(e => e.tipo === 'amv' && !e.revision);
    poner(cuerpo,
      aviso ? h('p', { class: 'feedback ok', role: 'status' }, aviso) : null,
      total || c.entradas.length || c.llegadas.length ? null : recuadro('aclaracion', 'Tu cuaderno está en blanco', 'Como todos los buenos cuadernos al principio. Se irá llenando solo a medida que leas fichas, juegues y pienses. ',
        h('a', { href: '#/explorar' }, 'Empieza por una ficha'), ' o ', h('a', { href: '#/pensar' }, 've directo a Pensar y aplicar'), '.'),
      h('h2', null, 'Tus cuatro ejes'),
      h('div', { class: 'ejes' }, ORDEN_EJES.map(e => eje(e, c))),
      recuadro('profundizar', 'Cómo se leen los ejes',
        h('p', { style: { margin: '0 0 6px' } }, h('b', null, 'Ser. '), 'Ante algo que nos toca solemos sentir primero, actuar después y pensar al final. No se trata de dejar de sentir, sino de notar el orden y, cuando conviene, darle la vuelta.'),
        h('p', { style: { margin: '0 0 6px' } }, h('b', null, 'Saber. '), 'Una escalera: del ruido a los datos, de ahí a la información, al conocimiento y, arriba, al entendimiento, que es saber cuándo sirve lo que sabes y qué no se sigue de ello.'),
        h('p', { style: { margin: '0 0 6px' } }, h('b', null, 'Hacer. '), 'Otra escalera, de la aptitud a la experiencia cultivada. Ojo: actuar no es hacer. Actuar es lo que sale solo; hacer es lo que eliges, practicas y revisas.'),
        h('p', { style: { margin: 0 } }, h('b', null, 'Creer y crear. '), 'La historia que te cuentas sobre las etiquetas y sobre ti. Se revisa reencuadrando, recontextualizando y resignificando, hasta escribir una más informada. Saber y relato son los pedales: nunca se quitan.')),
      llegadas(c),
      h('h2', null, 'Pasos mínimos pendientes de retorno ', pendientes.length ? h('span', { class: 'muted', style: { fontSize: '1rem' } }, `${pendientes.length}`) : null),
      pendientes.length ? h('div', null, h('p', { class: 'muted small' }, 'Lo que te propusiste hacer fuera de la pantalla. Cuando lo hayas hecho (o no), cuenta qué pasó: es el retorno, y es donde más se aprende.'),
        h('div', { class: 'entradas' }, pendientes.map(e => nota(e, true))))
        : h('p', { class: 'muted' }, c.entradas.some(e => e.tipo === 'amv') ? 'Ninguno pendiente: has contado qué pasó con todos tus pasos.' : 'Aún no tienes pasos mínimos. ',
          c.entradas.some(e => e.tipo === 'amv') ? null : h('a', { href: '#/pensar/paso' }, 'Prepara uno: tres minutos'), c.entradas.some(e => e.tipo === 'amv') ? null : '.'),
      insignias(c),
      entradas(propias),
      situaciones(c),
      reacciones.length ? h('section', null, h('h2', null, 'Lo que te provocan las fichas'),
        h('p', { class: 'muted small' }, 'Tus primeras reacciones, tal como las marcaste en cada ficha. Vuelve a ellas dentro de un tiempo: a veces lo que cambia no es la etiqueta, sino quien la mira.'),
        h('div', { class: 'chips' }, reacciones.map(e => h('a', { class: 'chip', href: `#/termino/${encodeURIComponent(e.datos?.id || '')}` }, h('b', null, corta(e.titulo, 40)), ' ',
          (e.datos?.emociones || []).map(x => EMO[x] || x).join(', ').toLowerCase())))) : null,
      relato(c),
      h('h2', null, 'Llévatelo'),
      h('div', { class: 'btns no-print' },
        h('button', { class: 'btn primary', type: 'button', onclick: () => descargar('mi-cuaderno-neurolab.txt', texto(cuaderno.leer())) }, 'Descargar en texto'),
        h('button', { class: 'btn', type: 'button', onclick: () => print() }, 'Imprimir o guardar en PDF'),
        h('button', { class: 'btn peligro', type: 'button', 'aria-expanded': String(borrarTodo), onclick: () => { borrarTodo = true; pintar(); cuerpo.querySelector('.confirmar-todo .btn')?.focus(); } }, 'Borrar mi cuaderno')),
      borrarTodo ? h('div', { class: 'confirmar confirmar-todo', role: 'group', 'aria-label': 'Confirmar el borrado' },
        h('p', { style: { margin: '0 0 8px' } }, h('b', null, '¿Borrar todo tu cuaderno? '), 'Se perderán tus ejes, insignias, entradas, llegadas y tu relato, y no se puede deshacer. Si quieres conservarlo, descárgalo antes.'),
        h('div', { class: 'btns' },
          h('button', { class: 'btn', type: 'button', onclick: () => { borrarTodo = false; pintar(); } }, 'No, mantenerlo'),
          h('button', { class: 'btn peligro-lleno', type: 'button', onclick: () => { borrarTodo = false; aviso = 'Cuaderno borrado. Empiezas de cero.'; cuaderno.borrarTodo(); } }, 'Sí, borrarlo todo'))) : null,
      h('p', { class: 'small muted' }, 'Todo se guarda en el almacenamiento de este navegador, en este dispositivo. No viaja a ningún servidor. Si borras los datos del navegador, cambias de dispositivo o usas una ventana privada, empieza de cero.'),
    );
    aviso = '';
  }

  function eje(e, c) {
    const P_ = PELDANOS[e], p = cuaderno.peldano(e, c), E = EJES[e], arriba = p === P_.length - 1;
    const pista = P_[Math.max(p, 0)].pista;
    return h('article', { class: 'eje', 'data-eje': e },
      h('span', { class: 'xp' }, plural(c.xp[e] || 0, 'punto', 'puntos')),
      h('h3', null, h('span', { 'aria-hidden': 'true', style: { color: 'var(--c)' } }, E.ico, ' '), E.nombre),
      h('div', { class: 'sub' }, E.sub),
      h('div', { class: 'barra', role: 'img', 'aria-label': `${p + 1} de ${P_.length} peldaños` }, h('i', { style: { '--w': `${Math.round(100 * (p + 1) / P_.length)}%` } })),
      e === 'ser' ? h('div', { class: 'sap3' }, [['sentir', 'Sentir'], ['actuar', 'Actuar'], ['pensar', 'Pensar']].map(([k, l]) => h('div', null, h('b', null, c.sap[k] || 0), l))) : null,
      h('ol', { class: 'escalera', style: { marginTop: '10px' } }, P_.map((x, i) => h('li', { class: i < p ? 'hecho' : i === p ? 'aqui' : '', style: { '--i': i }, title: x.d },
        x.n, i === p ? h('span', { class: 'sr-only' }, ' (estás aquí)') : null))),
      h('p', { class: 'siguiente' },
        p >= 0 ? [h('b', null, `Estás en «${P_[p].n}». `), P_[p].d] : [h('b', null, 'Sin empezar. '), 'Este eje arranca cuando escribes lo que crees.'],
        h('br'), h('b', null, arriba ? 'Y ahora: ' : 'Para subir: '), h('a', { href: IR[e][Math.max(p, 0)] }, pista)),
      h('p', { class: 'small muted', style: { margin: '6px 0 0', fontStyle: 'italic' } }, E.pregunta));
  }

  // Cómo has llegado estos días: una tira de catorce días y una lectura de situaciones, nunca de la persona
  function llegadas(c) {
    const ahora = Date.now();
    const dias = Array.from({ length: 14 }, (_, i) => diaISO(ahora - (13 - i) * DIA_MS));
    const mapa = new Map(c.llegadas.map(l => [l.dia, l.ruta]));
    const semana = dias.slice(-7).map(d => mapa.get(d)).filter(Boolean);
    const n = k => semana.filter(x => x === k).length;
    const hoy = mapa.get(dias[13]);
    let lectura = null;
    if (n('C') >= 2) lectura = [`Esta semana has llegado ${n('C') >= 4 ? 'muchas' : 'varias'} veces con la cabeza a mil: quizá convenga menos lectura y un paso pequeño.`, [['#/pensar/paso', 'Elegir un solo paso'], ['#/pensar/termometro', 'Tomarme la temperatura']], 'C'];
    else if (n('B') >= 2) lectura = ['Esta semana ha habido varios días con poca energía. Lo pequeño cuenta: una ficha al azar o un juego de dos minutos bastan, y no hace falta más.', [['#/azar', 'Una ficha al azar'], ['#/jugar/mito', 'Un juego de dos minutos']], 'B'];
    else if (n('A') >= 3) lectura = ['Esta semana has llegado casi siempre con calma y con ganas: buen momento para algo a fondo. Y para cuidar el ritmo, que las ganas también se gastan.', [['#/pensar/laboratorio', 'Analizar una etiqueta'], ['#/pensar/relato', 'Escribir tu relato']], 'A'];
    else if (semana.length) lectura = ['Días distintos, rutas distintas: es lo normal. La ruta se elige cada día, según cómo llegas.', [], null];
    else if (c.llegadas.length) lectura = ['Hace unos días que no cuentas cómo llegas. No pasa nada: cuando vuelvas a hacerlo, aquí aparecerá la tira.', [], null];
    const etiqueta = d => diaFecha(d).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });
    return h('section', null,
      h('h2', null, 'Cómo has llegado estos días'),
      c.llegadas.length ? h('div', null,
        h('ol', { class: 'tira', 'aria-label': 'Cómo has llegado en los últimos catorce días' }, dias.map((d, i) => {
          const k = mapa.get(d), f = diaFecha(d);
          return h('li', { class: `${k ? `r-${k}` : 'vacio'}${i === 13 ? ' hoy' : ''}`, style: k ? { '--oc': COLOR_RUTA[k] } : null, title: `${etiqueta(d)}: ${k ? RUTAS[k].opcion.toLowerCase() : 'sin respuesta'}` },
            h('span', { class: 'sd' }, i === 13 ? 'hoy' : f.toLocaleDateString('es-ES', { weekday: 'narrow', timeZone: 'UTC' })),
            h('span', { class: 'cel', 'aria-hidden': 'true' }, k || ''), h('span', { class: 'dn' }, f.getUTCDate()),
            h('span', { class: 'sr-only' }, `${etiqueta(d)}: ${k ? RUTAS[k].opcion.toLowerCase() : 'sin respuesta'}`));
        })),
        h('div', { class: 'leyenda-rutas small' }, Object.entries(RUTAS).map(([k, r]) => h('span', { style: { '--oc': COLOR_RUTA[k] } }, h('i', { 'aria-hidden': 'true' }, k), r.opcion))),
        lectura ? h('div', { class: 'lectura-dias', style: lectura[2] ? { '--oc': COLOR_RUTA[lectura[2]] } : null },
          h('p', { style: { margin: 0 } }, lectura[0]),
          lectura[1].length ? h('div', { class: 'btns', style: { marginTop: '8px' } }, lectura[1].map(([href, l], i) => h('a', { class: `btn small${i === 0 ? ' primary' : ''}`, href }, l))) : null,
          lectura[2] === 'C' ? h('div', { style: { marginTop: '8px' } }, semaforo({ compacto: true })) : null) : null)
        : h('p', { class: 'muted' }, 'Todavía no has contado cómo llegas. Cada día que respondas a la pregunta de entrada, aparecerá aquí una casilla.'),
      hoy ? null : preguntaEntrada({ compacta: true, titulo: '¿Y hoy, cómo llegas?' }),
      h('p', { class: 'small muted' }, 'Esto lee situaciones, no a ti: describe cómo llegaste esos días, no cómo eres. Mañana puede ser distinto.'));
  }

  function insignias(c) {
    const ganadas = INSIGNIAS.filter(i => c.insignias[i.id]).sort((a, b) => c.insignias[b.id].localeCompare(c.insignias[a.id]));
    const faltan = INSIGNIAS.filter(i => !c.insignias[i.id]);
    const med = (i, ok) => h(ok ? 'div' : 'a', { class: `insignia${ok ? '' : ' bloq'}`, href: ok ? null : IR_INSIGNIA[i.id] || null, style: { '--c': `var(--e-${i.eje})` } },
      h('div', { class: 'med', 'aria-hidden': 'true' }, i.ico), h('b', null, i.n), h('span', null, ok ? `Conseguida el ${fecha(c.insignias[i.id])}` : i.d));
    return h('section', null,
      h('h2', null, 'Insignias ', h('span', { class: 'muted', style: { fontSize: '1rem' } }, `${ganadas.length} de ${INSIGNIAS.length}`)),
      ganadas.length ? h('div', null, h('h3', { class: 'sub-h' }, 'Conseguidas'), h('div', { class: 'insignias' }, ganadas.map(i => med(i, true))))
        : h('p', { class: 'muted' }, 'Aún ninguna. La primera llega en cuanto abras una ficha.'),
      faltan.length ? h('div', null, h('h3', { class: 'sub-h' }, 'Por conseguir'), h('p', { class: 'small muted', style: { margin: '0 0 8px' } }, 'Pulsa una para ir adonde se consigue.'),
        h('div', { class: 'insignias' }, faltan.map(i => med(i, false)))) : h('p', null, '¡Las tienes todas! Ahora enséñale a alguien a preguntar «¿para qué?».'));
  }

  function entradas(propias) {
    const tipos = ORDEN_TIPOS.filter(t => propias.some(e => e.tipo === t));
    if (filtro && !tipos.includes(filtro)) filtro = null;
    const vis = filtro ? [filtro] : tipos;
    return h('section', null,
      h('h2', null, 'Tus entradas ', propias.length ? h('span', { class: 'muted', style: { fontSize: '1rem' } }, `${propias.length}`) : null),
      propias.length ? [
        tipos.length > 1 ? toggles([['todas', 'Todas'], ...tipos.map(t => [t, `${TIPOS[t].varios} (${propias.filter(e => e.tipo === t).length})`])], { valor: filtro || 'todas', alCambiar: v => { filtro = v && v !== 'todas' ? v : null; pintar(); } }) : null,
        vis.map(t => h('div', { class: 'grupo-entradas' }, h('h3', { class: 'sub-h' }, TIPOS[t].varios, ' ', h('a', { class: 'small', href: TIPOS[t].ir }, 'hacer otra →')),
          h('div', { class: 'entradas' }, propias.filter(e => e.tipo === t).map(e => nota(e)))))]
        : h('p', { class: 'muted' }, 'Aún no hay entradas. Las crean las actividades de ', h('a', { href: '#/pensar' }, 'Pensar y aplicar'), ': termómetros, análisis, cazas, ciclos y pasos mínimos.'));
  }

  function nota(e, compacta = false) {
    const T = TIPOS[e.tipo] || { uno: e.tipo, eje: 'saber' };
    const esPaso = e.tipo === 'amv';
    const d = e.datos || {};
    const filas = resumen(e);
    const abiertaAqui = abierto === `${e.id}${compacta ? ':p' : ''}`;
    let caja = null;
    if (abiertaAqui) {
      const ta = h('textarea', { 'aria-label': esPaso ? '¿Qué pasó?' : 'Tu revisión', placeholder: esPaso ? `${REV.replace('cambiará', 'ha cambiado').replace('funciona', 'ha funcionado')} Si no lo hiciste, también vale: ¿qué lo impidió?` : '¿Qué ves ahora que no veías entonces? ¿Lo harías igual?' });
      caja = h('div', { class: 'revisar' }, ta, h('div', { class: 'btns', style: { marginTop: '8px' } },
        h('button', { class: 'btn small primary', type: 'button', onclick: () => { const t = ta.value.trim(); if (!t) { ta.focus(); return; } abierto = null; cuaderno.revisar(e.id, t); } }, esPaso ? 'Guardar el retorno' : 'Guardar la revisión'),
        h('button', { class: 'btn small', type: 'button', onclick: () => { abierto = null; pintar(); } }, 'Cancelar')));
      setTimeout(() => ta.focus({ preventScroll: true }), 0);
    }
    const pidiendo = confirmar === e.id && !compacta;
    return h('article', { class: 'cu-nota', 'data-tipo': e.tipo },
      h('div', { class: 'meta' }, h('span', { class: 'chip chip-e', 'data-eje': T.eje }, T.uno), h('span', { class: 'muted small' }, fecha(e.fecha))),
      h('h3', null, esPaso ? `Haré ${d.hare || e.titulo}` : e.titulo),
      esPaso && compacta ? h('p', { class: 'small', style: { margin: '0 0 6px' } }, [d.dia && `El día ${d.dia}`, d.durante && `durante ${d.durante}`, d.comprobare && `y comprobaré ${d.comprobare}`].filter(Boolean).join(', ') || null)
        : filas.length ? h('dl', { class: 'datos' }, filas.map(([k, v]) => [h('dt', null, k), h('dd', null, v)])) : null,
      e.revision ? recuadro('recuerda', `${esPaso ? 'Lo que pasó' : 'Revisada'} el ${fecha(e.revision.fecha)}`, e.revision.texto) : null,
      caja || h('div', { class: 'btns no-print' },
        h('button', { class: `btn small${esPaso && !e.revision ? ' primary' : ''}`, type: 'button', onclick: () => { abierto = `${e.id}${compacta ? ':p' : ''}`; confirmar = null; pintar(); } },
          esPaso ? (e.revision ? 'Contar algo más' : '¿Qué pasó?') : (e.revision ? 'Revisar otra vez' : 'Revisar')),
        compacta ? null : pidiendo ? [h('span', { class: 'small' }, '¿Seguro?'),
          h('button', { class: 'btn small peligro-lleno', type: 'button', onclick: () => { confirmar = null; cuaderno.borrarEntrada(e.id); } }, 'Sí, borrar'),
          h('button', { class: 'btn small', type: 'button', onclick: () => { confirmar = null; pintar(); } }, 'No')]
          : h('button', { class: 'btn small', type: 'button', onclick: () => { confirmar = e.id; abierto = null; pintar(); } }, 'Borrar')));
  }

  function situaciones(c) {
    if (!P || !Object.keys(c.situaciones).length) return null;
    const S = P.situaciones;
    const hechas = S.filter(s => c.situaciones[s.id] !== undefined);
    return h('section', null, h('h2', null, '¿Y tú qué harías? ', h('span', { class: 'muted', style: { fontSize: '1rem' } }, `${hechas.length} de ${S.length}`)),
      h('ul', { class: 'lista-sit' }, S.map(s => {
        const k = c.situaciones[s.id], o = k !== undefined ? s.opciones[k] : null;
        return h('li', { class: o ? (o.ok ? 'ok' : 'otra') : 'pend' },
          h('span', { class: 'ic', 'aria-hidden': 'true' }, o ? (o.ok ? '✓' : '↻') : '○'),
          h('span', null, h('b', null, s.titulo), ` · ${s.ambito}. `, o ? (o.ok ? 'Elegiste la que mejor funciona.' : 'Elegiste otra: puedes repetirla.') : 'Sin resolver.'),
          h('a', { class: 'small', href: `#/pensar/situaciones?s=${s.id}` }, o ? 'Repetir' : 'Resolver'));
      })),
      c.sap.modos.reto ? h('p', { class: 'small muted' }, 'Has resuelto alguna con el reloj en marcha: eso cuenta para el eje Ser.') : null);
  }

  function relato(c) {
    const r = c.relato, cr = c.creencias;
    if (!r.texto && !cr.antes) return null;
    const CR = P?.creencias || [];
    const filas = CR.length && cr.antes ? CR.map((x, i) => h('tr', null, h('td', null, x.texto), h('td', { class: 'num' }, cr.antes.resp[i] ?? '—'),
      h('td', { class: 'num' }, cr.despues ? (cr.despues.resp[i] ?? '—') : '—'))) : [];
    return h('section', null, h('h2', null, 'Tu relato'),
      r.texto ? h('div', { class: 'tarjeta-relato' },
        h('p', { class: 'nivel', style: { color: 'var(--e-crear)' } }, 'Lo que creo ahora'),
        h('p', { class: 'texto' }, r.texto), r.bolsillo ? h('p', { class: 'bolsillo' }, r.bolsillo) : null,
        r.reencuadre || r.contexto || r.sentido ? h('dl', { class: 'datos', style: { marginTop: '12px' } },
          [['Reencuadre', r.reencuadre], ['Contexto', r.contexto], ['Sentido', r.sentido]].filter(([, v]) => v).map(([k, v]) => [h('dt', null, k), h('dd', null, v)])) : null)
        : h('p', { class: 'muted' }, 'Has empezado. ', h('a', { href: '#/pensar/relato' }, 'Sigue con tu relato'), '.'),
      filas.length ? h('div', { class: 'table-wrap', style: { marginTop: '14px' } }, h('table', null,
        h('caption', { class: 'small muted', style: { textAlign: 'left', padding: '8px 10px' } }, 'Lo que creo: de 1 (nada de acuerdo) a 5 (muy de acuerdo)'),
        h('thead', null, h('tr', null, h('th', { scope: 'col' }, 'Afirmación'), h('th', { scope: 'col', class: 'num' }, 'Antes'), h('th', { scope: 'col', class: 'num' }, 'Después'))),
        h('tbody', null, filas))) : null);
  }

  function texto(c) {
    const L = ['MI CUADERNO DE NEUROLAB', `Descargado el ${fecha(new Date().toISOString())}`, 'Lo que hay aquí describe un recorrido y unas situaciones, no a una persona.', ''];
    L.push('LOS CUATRO EJES');
    for (const e of ORDEN_EJES) { const p = cuaderno.peldano(e, c); L.push(`${EJES[e].nombre}: ${p >= 0 ? PELDANOS[e][p].n : 'sin empezar'} (${c.xp[e] || 0} puntos)`); }
    L.push('', `Fichas leídas: ${c.fichas.length}`, `Insignias: ${INSIGNIAS.filter(i => c.insignias[i.id]).map(i => i.n).join(', ') || 'ninguna todavía'}`, '');
    if (c.llegadas.length) {
      L.push('CÓMO HE LLEGADO');
      for (const l of c.llegadas.slice(0, 30)) L.push(`${fecha(diaFecha(l.dia).toISOString())}: ${RUTAS[l.ruta]?.opcion || l.ruta}`);
      L.push('');
    }
    for (const t of ORDEN_TIPOS) {
      const es = c.entradas.filter(e => e.tipo === t);
      if (!es.length) continue;
      L.push(TIPOS[t].varios.toUpperCase());
      for (const e of es) {
        L.push(`— ${fecha(e.fecha)} · ${e.tipo === 'amv' ? `Haré ${e.datos?.hare || e.titulo}` : e.titulo}`);
        for (const [k, v] of resumen(e)) L.push(`   ${k}: ${v}`);
        if (e.revision) L.push(`   ${e.tipo === 'amv' ? 'Lo que pasó' : 'Revisión'} (${fecha(e.revision.fecha)}): ${e.revision.texto}`);
      }
      L.push('');
    }
    if (P && Object.keys(c.situaciones).length) {
      L.push('¿Y TÚ QUÉ HARÍAS?');
      for (const s of P.situaciones) { const k = c.situaciones[s.id]; if (k !== undefined) L.push(`— ${s.titulo}: ${s.opciones[k]?.ok ? 'la que mejor funciona' : 'otra opción'} («${corta(s.opciones[k]?.t || '', 90)}»)`); }
      L.push('');
    }
    const reac = c.entradas.filter(e => e.tipo === 'reaccion');
    if (reac.length) { L.push('LO QUE ME PROVOCAN LAS FICHAS'); for (const e of reac) L.push(`— ${e.titulo}: ${(e.datos?.emociones || []).map(x => EMO[x] || x).join(', ').toLowerCase()}`); L.push(''); }
    if (c.relato.texto || c.creencias.antes) {
      L.push('MI RELATO');
      if (c.relato.reencuadre) L.push(`Reencuadre: ${c.relato.reencuadre}`);
      if (c.relato.contexto) L.push(`Contexto: ${c.relato.contexto}`);
      if (c.relato.sentido) L.push(`Sentido: ${c.relato.sentido}`);
      if (c.relato.texto) L.push('', c.relato.texto);
      if (c.relato.bolsillo) L.push('', c.relato.bolsillo);
      if (P && c.creencias.antes) { L.push('', 'Lo que creo (1 a 5), antes y después:'); P.creencias.forEach((x, i) => L.push(`   ${x.texto} · ${c.creencias.antes.resp[i] ?? '—'} → ${c.creencias.despues?.resp[i] ?? '—'}`)); }
      L.push('');
    }
    L.push(`NeuroLab · ${URL_BASE}`);
    return L.join('\n');
  }

  pintar();
  const quitar = cuaderno.alCambiar(() => pintar());
  return { destroy: quitar };
}
