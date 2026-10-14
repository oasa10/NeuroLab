// El episodio del día: une el motor común de las webs del proyecto (assets/vendor/episodio) con NeuroLab.
// Todo se guarda solo en este navegador, con la clave «neurolab:cuaderno» del motor.
import { RUTAS, PREGUNTA, PREGUNTA_AYUDA } from './metodo.js';
import * as cuaderno from './cuaderno.js';

let motor = null, porTermino = null;

export async function episodios(ctx) {
  const lista = await ctx.episodios();
  if (!porTermino) porTermino = new Map(lista.map(e => [e.termino, e]));
  return lista;
}

// El episodio que corresponde a un término, si lo tiene (para la historia humana de la ficha)
export async function deTermino(ctx, id) {
  await episodios(ctx);
  return porTermino.get(id) || null;
}

export async function obtener(ctx) {
  if (motor) return motor;
  const datos = await episodios(ctx);
  if (!window.Episodio) throw new Error('Falta el motor del episodio');
  motor = window.Episodio.crear({
    sitio: 'neurolab', nombre: 'NeuroLab', episodios: datos,
    porDentro: false, grupo: true, demo: true, unoAlDia: true, minutos: 7,
    // La pregunta de llegada (L5): quien llega «con la cabeza a mil» recibe una pregunta y una acción pequeña
    llegada: {
      pregunta: PREGUNTA, ayuda: PREGUNTA_AYUDA,
      opciones: Object.entries(RUTAS).map(([id, r]) => ({ id, t: r.opcion, s: r.como })),
      corta: 'C',
      hoy: () => cuaderno.llegadaHoy(),
      elegir: k => cuaderno.llegada(k),
      cuidado: 'Si lo estás pasando muy mal, llama al <a href="tel:024"><b>024</b></a> (gratis, 24 horas). Emergencias: <a href="tel:112"><b>112</b></a>. <a href="#/conocer/ayuda">Dónde pedir ayuda</a>.',
    },
    // al terminar: desde el episodio, a la ficha (primero el juego, después la enciclopedia); desde la vuelta, al cuaderno
    alSalir: ep => {
      const ruta = location.hash.replace(/^#\/?/, '').split(/[/?]/)[0];
      if (ruta === 'vuelta') location.hash = '#/cuaderno';
      else if (ruta === 'clase') location.hash = '#/clase';
      else location.hash = `#/termino/${encodeURIComponent(ep.termino)}?tras=episodio`;
    },
  });
  return motor;
}
