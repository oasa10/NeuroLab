// El episodio del día (L5, L7), la vuelta y el modo clase (L3). El motor es común a las webs del proyecto.
import { h, USOS, cabeza, recuadro, imgUso } from '../lib.js';
import { obtener, episodios } from '../episodio.js';
import { ETIQUETAS, POR_ID } from '../etiquetas.js';

export async function render(root, ctx, parts, q, ruta) {
  const E = await obtener(ctx);
  if (ruta === 'clase') return parts[0] ? proyectar(root, ctx, E, parts[0]) : clase(root, ctx, E);
  if (ruta === 'vuelta') {
    document.title = 'Tu vuelta · NeuroLab';
    root.append(h('nav', { class: 'crumbs' }, h('a', { href: '#/cuaderno' }, 'Tu cuaderno'), ' › Tu vuelta'));
    const caja = h('div', { class: 'ep-sitio' });
    root.append(caja);
    E.vuelta(caja, parts[0]);
    return { destroy: () => E.parar() };
  }
  // #/episodio y #/episodio/<id>
  const lista = await episodios(ctx);
  const ep = lista.find(e => e.id === parts[0]) || E.deHoy();
  document.title = `${ep ? ep.palabra + ' · ' : ''}Episodio · NeuroLab`;
  const caja = h('div', { class: 'ep-sitio' });
  const todos = h('div');
  root.append(
    h('nav', { class: 'crumbs' }, h('a', { href: '#/' }, 'Inicio'), ' › Episodio'),
    caja,
    h('details', { class: 'ep-todos' }, h('summary', null, `Los ${lista.length} episodios`),
      h('p', { class: 'small muted' }, 'Uno nuevo al día, y nada caduca: los que ya abriste se pueden repetir siempre. Para una clase, mejor el ', h('a', { href: '#/clase' }, 'modo clase'), ', que abre cualquiera.'),
      todos));
  E.abrir(caja, ep && ep.id);
  E.lista(todos, { alAbrir: id => { location.hash = `#/episodio/${encodeURIComponent(id)}`; } });
  return { destroy: () => E.parar() };
}

// Modo clase: quien enseña u orienta elige una etiqueta y un uso, lo proyecta y el grupo vota sin nombres
async function clase(root, ctx, E) {
  document.title = 'Para clases y grupos · NeuroLab';
  const lista = await episodios(ctx);
  const tarjeta = e => {
    const U = USOS[e.uso];
    return h('article', { class: 'card clase-card', style: { '--c': `var(--v-${e.uso})` } },
      h('div', { class: 'clase-cab' }, imgUso(e.uso), h('div', null, h('h3', null, e.palabra), h('p', { class: 'small muted' }, U ? `Para ${U.verbo}` : ''))),
      h('p', null, e.resumen),
      h('div', { class: 'btns' },
        h('a', { class: 'btn small primary', href: `#/clase/${encodeURIComponent(e.id)}` }, '▶ Proyectar'),
        h('a', { class: 'btn small', href: `#/termino/${encodeURIComponent(e.termino)}`, target: '_blank', rel: 'noopener' }, 'Ficha (guion)')));
  };
  root.append(
    cabeza(0, 'Para clases y grupos', 'NeuroLab cabe en una sesión de clase, de tutoría o de una asociación: una etiqueta, un uso, siete tiempos y la conversación que salga. Funciona en un proyector o en una pantalla grande, sin cuentas y sin que nadie dé su nombre.'),
    h('ol', { class: 'clase-pasos' },
      h('li', null, h('b', null, 'Elige una etiqueta y un uso. '), `Abajo están los ${lista.length} episodios, ordenados por etiqueta; cada uno mira la etiqueta desde un uso: investigar, diagnosticar, educar, acceder o reconocerse.`),
      h('li', null, h('b', null, 'Proyecta el episodio. '), 'En el Choque y en el Reflejo el grupo vota a mano alzada y tú cuentas los votos en la pantalla. Se cuenta el grupo, nunca a una persona.'),
      h('li', null, h('b', null, 'Usa la ficha como guion. '), 'Cada etiqueta tiene su ficha verificada: cómo surgió, cinco ejemplos, qué se discute y qué prueba pide cada uso. Ábrela en otra pestaña.'),
      h('li', null, h('b', null, 'Vuelve otro día. '), 'La misión es del grupo y se cuenta en la sesión siguiente.')),
    recuadro('atencion', 'Nunca se habla de un alumno concreto', 'El episodio mira etiquetas y usos, no personas del grupo. Si alguien cuenta algo suyo, se agradece y se sigue con el caso del episodio. Si algo preocupa de verdad, se habla después, en privado, con quien corresponda. ', h('a', { href: '#/conocer/ayuda' }, 'Dónde pedir ayuda'), '.'),
    recuadro('aclaracion', 'Lo que no se guarda', 'En modo clase no se guarda nada en el dispositivo: ni votos, ni misiones, ni historias. Y el Reflejo no lleva reloj en los episodios que tocan temas delicados', lista.some(e => e.riesgo) ? [' (', lista.filter(e => e.riesgo).map(e => e.palabra).join(', '), ')'] : '', ': ahí se decide con calma.'),
    h('h2', null, 'Elige una etiqueta y un uso'),
    ETIQUETAS.map(et => {
      const eps = lista.filter(e => e.etiqueta === et.id);
      if (!eps.length) return null;
      return h('section', { class: 'clase-grupo' }, h('h3', null, h('a', { href: `#/etiqueta/${encodeURIComponent(et.id)}` }, et.corto)), h('div', { class: 'clase-grid' }, eps.map(tarjeta)));
    }),
    (() => { const otros = lista.filter(e => !POR_ID.has(e.etiqueta)); return otros.length ? h('section', { class: 'clase-grupo' }, h('h3', null, 'Para todas las etiquetas'), h('div', { class: 'clase-grid' }, otros.map(tarjeta))) : null; })(),
    h('p', { class: 'small muted', style: { marginTop: '18px' } }, 'Las fichas que no tienen episodio todavía sirven igual de guion: ', h('a', { href: '#/explorar' }, 'búscalas en Explorar'), '.'));
}

async function proyectar(root, ctx, E, id) {
  const lista = await episodios(ctx);
  const ep = lista.find(e => e.id === id);
  if (!ep) { location.replace('#/clase'); return; }
  document.title = `${ep.palabra} · Modo clase · NeuroLab`;
  const caja = h('div', { class: 'ep-sitio' });
  root.append(
    h('nav', { class: 'crumbs' }, h('a', { href: '#/clase' }, 'Para clases y grupos'), ` › ${ep.palabra}`),
    caja,
    h('p', { class: 'small muted', style: { textAlign: 'center' } }, 'Guion para quien guía: ',
      h('a', { href: `#/termino/${encodeURIComponent(ep.termino)}`, target: '_blank', rel: 'noopener' }, `la ficha de «${ep.palabra}», en otra pestaña`), '.'));
  E.abrir(caja, ep.id, { grupo: true });
  return { destroy: () => E.parar() };
}
