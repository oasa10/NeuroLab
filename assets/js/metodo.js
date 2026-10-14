// El método que sostiene NeuroLab por dentro: la pregunta de entrada, las tres rutas, el semáforo,
// el recorrido de cinco pasos, la acción mínima con su retorno y las tres preguntas transversales.
// No diagnostica ni etiqueta a nadie: lee situaciones, no personas.
import { h, recuadro } from './lib.js';
import * as cuaderno from './cuaderno.js';

export const PREGUNTA = '¿Cómo llegas hoy a este tema?';
export const PREGUNTA_AYUDA = 'Piensa en dos cosas: cómo te sientes y reaccionas (tu ser) y lo que te ves con ganas de ponerte a hacer (tu hacer). No hay respuesta buena ni mala, y puede cambiar mañana.';

// Tres estados de una situación (no de una persona) y la ruta que conviene a cada uno
export const RUTAS = {
  A: {
    estado: 'Integrados', opcion: 'Con calma y con ganas', como: 'Me siento bien y me apetece ponerme a ello.',
    ruta: 'Ruta de cuidado', idea: 'Ser y hacer van de la mano. Aprovéchalo: entiende a fondo, ponlo a prueba y cuida el ritmo para no quemarte.',
    sug: [['#/aprender', 'Haz la ruta de Aprender'], ['#/jugar', 'Pon a prueba lo que sabes'], ['#/pensar/laboratorio', 'Analiza una etiqueta con las seis preguntas']],
  },
  B: {
    estado: 'Desconectados', opcion: 'Sin mucha energía', como: 'Me cuesta conectar o no sé por dónde empezar.',
    ruta: 'Ruta de apoyo', idea: 'Cuando cuesta arrancar, lo que ayuda es algo pequeño y concreto. Dos minutos cuentan. No hace falta entenderlo todo hoy.',
    sug: [['#/azar', 'Una ficha al azar'], ['#/jugar/mito', '¿Mito, matiz o cierto? (dos minutos)'], ['#/pensar/paso', 'Elige una acción mínima']],
  },
  C: {
    estado: 'Desbordados', opcion: 'Con la cabeza a mil', como: 'Le doy muchas vueltas, me preocupa algo concreto o he leído demasiado.',
    ruta: 'Ruta de gestión', idea: 'Cuando lo que sabes o lo que te cuentas pesa más que lo que sientes y lo que puedes hacer, más información no ayuda. Para, nota qué sientes, elige una sola pregunta y una acción pequeña.',
    sug: [['#/pensar/termometro', 'Tómate la temperatura'], ['#/pensar/paso', 'Elige una sola acción'], ['#/conocer/ayuda', 'Dónde pedir ayuda']],
  },
};

export function semaforo({ compacto = false } = {}) {
  if (compacto) {
    return h('p', { class: 'aviso-pie' }, h('span', { class: 'luz', 'aria-hidden': 'true' }),
      h('span', null, 'NeuroLab no diagnostica ni sustituye a profesionales. Si lo estás pasando muy mal, llama al ', h('a', { class: 'tel', href: 'tel:024' }, '024'),
        ' (gratis, 24 horas). Emergencias: ', h('a', { class: 'tel', href: 'tel:112' }, '112'), '.'));
  }
  return h('div', { class: 'semaforo', role: 'list', 'aria-label': 'Semáforo: cuándo seguir, cuándo parar y dónde pedir ayuda' },
    h('div', { class: 'verde', role: 'listitem' }, h('span', { class: 'luz', 'aria-hidden': 'true' }), h('div', null, h('b', null, 'Verde'), 'Curiosidad y calma: sigue a tu ritmo.')),
    h('div', { class: 'ambar', role: 'listitem' }, h('span', { class: 'luz', 'aria-hidden': 'true' }), h('div', null, h('b', null, 'Ámbar'), 'Si algo te inquieta de ti o de alguien cercano, para y háblalo con alguien de confianza o con tu médico, orientador o psicóloga.')),
    h('div', { class: 'rojo', role: 'listitem' }, h('span', { class: 'luz', 'aria-hidden': 'true' }), h('div', null, h('b', null, 'Rojo'), 'Si sufres mucho o temes por tu seguridad: ',
      h('a', { class: 'tel', href: 'tel:024' }, '024'), ' (atención a la conducta suicida, gratis y 24 horas) o ', h('a', { class: 'tel', href: 'tel:112' }, '112'), '.')),
    h('div', { class: 'stop', role: 'listitem' }, h('span', { class: 'luz', 'aria-hidden': 'true' }), h('div', null, h('b', null, 'Stop'), 'Esta web no diagnostica, no etiqueta a nadie y no sustituye a profesionales.')));
}

// La pregunta de entrada: devuelve la ruta elegida y la guarda en el cuaderno
export function preguntaEntrada({ titulo = PREGUNTA, alElegir, compacta = false } = {}) {
  const hoy = cuaderno.llegadaHoy();
  const caja = h('div', { class: 'ruta-hoy', 'aria-live': 'polite' });
  const botones = Object.entries(RUTAS).map(([k, r]) => h('button', { class: `opt r-${k}`, type: 'button', 'aria-pressed': String(hoy === k), onclick: () => elegir(k) },
    h('b', null, r.opcion), h('span', null, r.como)));
  function pintar(k) {
    botones.forEach((b, i) => b.setAttribute('aria-pressed', String(Object.keys(RUTAS)[i] === k)));
    if (!k) { caja.replaceChildren(); return; }
    const r = RUTAS[k];
    caja.replaceChildren(h('div', { class: `ruta-box r-${k}` },
      h('h3', null, r.ruta), h('p', { style: { margin: '0 0 10px' } }, r.idea),
      h('div', { class: 'btns' }, r.sug.map(([href, l], i) => h('a', { class: `btn small${i === 0 ? ' primary' : ''}`, href }, l))),
      k === 'C' ? h('div', { style: { marginTop: '10px' } }, semaforo({ compacto: true })) : null,
      h('p', { class: 'small muted', style: { margin: '10px 0 0' } }, 'Lo que eliges describe cómo llegas hoy, no cómo eres. Queda en tu cuaderno, solo en este navegador.')));
  }
  function elegir(k) { cuaderno.llegada(k); pintar(k); alElegir?.(k); }
  pintar(hoy);
  return h('section', { class: 'entrada' },
    h('h2', null, titulo),
    compacta ? null : h('p', { class: 'muted', style: { margin: 0 } }, PREGUNTA_AYUDA),
    h('div', { class: 'opts' }, botones), caja);
}

// El recorrido de cinco pasos que siguen las actividades de Pensar y aplicar
export const RECORRIDO = [
  { n: 'Situar', d: '¿Qué está pasando y cómo llego? ¿Qué siento, cómo me sale actuar y qué pienso?' },
  { n: 'Comprender y elegir', d: '¿Qué sé de verdad y qué supongo? Elijo una sola pregunta.' },
  { n: 'Preparar', d: 'Una acción mínima, con día y forma de comprobarlo.' },
  { n: 'Hacer y observar', d: 'Lo hago fuera de la pantalla y miro qué pasa.' },
  { n: 'Revisar y decidir', d: '¿Qué cambió fuera de mi explicación? Sigo, ajusto o paro.' },
];
export function recorrido(actual = -1) {
  return h('div', { class: 'recorrido', 'aria-label': 'Recorrido en cinco pasos' }, RECORRIDO.map((p, i) => h('div', { class: i === actual ? 'aqui' : '' }, h('b', null, p.n), p.d)));
}

// Las tres preguntas que acompañan a cualquier decisión
export const TRANSVERSALES = [
  { k: 'etica', n: 'Ética', p: '¿Para quién es bueno esto? ¿A quién podría dañar?' },
  { k: 'entorno', n: 'Entorno', p: '¿Dónde y con qué cuento? ¿Qué depende del sitio y no de la persona?' },
  { k: 'ia', n: 'IA', p: '¿Con qué ayuda lo he pensado? Si una IA me lo ha dicho, ¿lo he comprobado?' },
];
export function transversales() {
  return recuadro('aclaracion', 'Antes de decidir, tres preguntas más', h('ul', { style: { margin: '4px 0 0', paddingLeft: '18px' } },
    TRANSVERSALES.map(t => h('li', null, h('b', null, t.n, ': '), t.p))));
}

// La acción mínima viable: «Haré ___, el día ___, durante ___, y comprobaré ___». Y su retorno.
export const REV = '¿Qué cambiará fuera de mi explicación si esto funciona?';
export function pasoMinimo({ sugerencia = '', titulo = 'Tu acción mínima', origen = '', alGuardar } = {}) {
  const campo = (ph, ancho) => h('input', { type: 'text', placeholder: ph, style: { width: ancho }, 'aria-label': ph });
  const hare = campo(sugerencia ? 'lo que harás' : 'lo que harás (algo pequeño)', '16em');
  if (sugerencia) hare.value = sugerencia;
  const dia = campo('qué día', '7em'), durante = campo('cuánto rato', '7em'), comprobare = campo('cómo sabrás si ha servido', '15em');
  const rev = h('textarea', { rows: 2, placeholder: 'Por ejemplo: «hablaré con su tutora en lugar de seguir buscando en internet»', 'aria-label': REV });
  const eco = h('p', { class: 'small', 'aria-live': 'polite', style: { margin: '8px 0 0' } });
  const guardar = h('button', { class: 'btn primary', type: 'button', onclick: () => {
    if (!hare.value.trim()) { eco.textContent = 'Escribe al menos qué harás.'; hare.focus(); return; }
    const datos = { hare: hare.value.trim(), dia: dia.value.trim(), durante: durante.value.trim(), comprobare: comprobare.value.trim(), rev: rev.value.trim(), origen };
    cuaderno.entrada('amv', datos.hare, datos, { hacer: 6, crear: 2 });
    eco.replaceChildren('Anotado en tu cuaderno. Cuando lo hayas hecho, vuelve y cuéntale qué pasó: ', h('a', { href: '#/cuaderno' }, 'abrir el cuaderno'), '.');
    alGuardar?.(datos);
  } }, 'Guardar en mi cuaderno');
  return h('div', { class: 'card' },
    h('h3', { style: { marginTop: 0 } }, titulo),
    h('p', { class: 'amv' }, 'Haré ', hare, ', el día ', dia, ', durante ', durante, ', y comprobaré ', comprobare, '.'),
    h('label', { class: 'small', style: { display: 'block', marginTop: '6px', fontWeight: 600 } }, REV, rev),
    h('div', { class: 'btns', style: { marginTop: '10px' } }, guardar), eco);
}
