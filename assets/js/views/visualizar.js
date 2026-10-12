import { h, cabeza } from '../lib.js';
import * as cuaderno from '../cuaderno.js';

// Visualizar: el mapa de relaciones, las tendencias y el pulso de las etiquetas, en una sola pestaña
const SUB = {
  mapa: { t: 'Mapa de relaciones', m: () => import('./mapa.js') },
  tendencias: { t: 'Tendencias', m: () => import('./tendencias.js') },
  pulso: { t: 'El pulso de las etiquetas', m: () => import('./pulso.js') },
};

export async function render(root, ctx, parts, q) {
  const k = SUB[parts[0]] ? parts[0] : 'mapa';
  const cuerpo = h('div');
  root.append(
    cabeza(1, 'Visualizar', 'Las etiquetas, de un vistazo y desde tres ángulos: con quién se relaciona cada una, qué cuentan las cifras cuando pasan los años y a qué ritmo nacen los nombres. Tres gráficos, cero diagnósticos. Y en cada uno, un aviso de lo que no dice.'),
    h('nav', { class: 'subtabs', 'aria-label': 'Visualizaciones' },
      Object.entries(SUB).map(([clave, s]) => h('a', { href: `#/visualizar/${clave}`, 'aria-current': clave === k ? 'page' : null }, s.t))),
    cuerpo,
  );
  const mod = await SUB[k].m();
  const vista = await mod.render(cuerpo, ctx, parts.slice(1), q);
  cuaderno.vista(k);
  return vista;
}
