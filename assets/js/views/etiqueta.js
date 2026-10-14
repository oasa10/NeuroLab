// Una etiqueta, ordenada (L6): para qué se usa, qué prueba pide ese uso y, alrededor, lo que la sostiene o la discute.
import { h, USOS, CODIGOS, anio, recuadro, imgUso, inline, poner } from '../lib.js';
import { POR_ID, alrededor } from '../etiquetas.js';
import { episodios } from '../episodio.js';

export function render(root, ctx, parts, q) {
  const E = POR_ID.get(parts[0]);
  const t = E && ctx.byId.get(E.id);
  if (!t) { location.replace('#/explorar'); return; }
  document.title = `${E.corto}, por su uso · NeuroLab`;
  const ficha = id => `#/termino/${encodeURIComponent(id)}`;
  let uso = CODIGOS.includes(q.get('uso')) ? q.get('uso') : null;

  const historia = h('div');
  const prueba = h('div', { class: 'et-prueba', 'aria-live': 'polite' });
  const botones = CODIGOS.map(k => h('button', { class: `et-uso${t.usos.includes(k) ? '' : ' apenas'}`, type: 'button', 'data-v': k, style: { '--c': `var(--v-${k})` },
    'aria-pressed': String(k === uso), onclick: () => { uso = uso === k ? null : k; pintar(); } },
    imgUso(k), h('b', null, USOS[k].nombre), h('small', null, USOS[k].donde)));

  function pintar() {
    botones.forEach((b, i) => b.setAttribute('aria-pressed', String(CODIGOS[i] === uso)));
    history.replaceState(null, '', `#/etiqueta/${encodeURIComponent(E.id)}${uso ? '?uso=' + uso : ''}`);
    if (!uso) { poner(prueba, h('p', { class: 'muted small', style: { margin: 0 } }, 'Elige un uso y verás qué prueba pide.')); return; }
    const U = USOS[uso], circula = t.usos.includes(uso);
    poner(prueba, h('div', { class: 'card et-prueba-card', style: { '--c': `var(--v-${uso})` } },
      h('div', { class: 'et-prueba-cab' }, imgUso(uso, { grande: true }),
        h('div', null, h('p', { class: 'eyebrow', style: { margin: 0 } }, `${E.corto} · para ${U.verbo}`), h('h3', { style: { margin: '2px 0 0' } }, U.pregunta))),
      h('p', null, h('b', null, 'La prueba que pide: '), U.prueba),
      h('p', { class: 'small muted', style: { margin: 0 } }, circula ? `Aquí «${E.corto}» sí circula: se usa para ${U.verbo}.` : `Aquí «${E.corto}» apenas circula. Si alguien la usara para ${U.verbo}, esa sería la prueba.`)));
  }

  const grupos = alrededor(ctx, E.id).filter(g => g.fichas.length);
  root.append(
    h('nav', { class: 'crumbs', 'aria-label': 'Ruta' }, h('a', { href: '#/explorar' }, 'Explorar'), ' › Por etiqueta › ', E.corto),
    h('p', { class: 'nivel' }, 'Nivel 1 · Enterarte'),
    h('h1', null, E.corto),
    h('p', { class: 'lead', style: { maxWidth: '40em' } }, E.una),
    historia,
    h('section', { class: 'et-paso' },
      h('h2', null, h('span', { class: 'et-n' }, '1'), '¿Para qué se usa?'),
      h('p', { class: 'muted' }, 'Una etiqueta no pide lo mismo en la consulta, en el aula o en una ayuda. Cambia el uso, cambia la prueba.'),
      h('div', { class: 'et-usos', role: 'group', 'aria-label': 'Los cinco usos' }, botones),
      prueba),
    h('section', { class: 'et-paso' },
      h('h2', null, h('span', { class: 'et-n' }, '2'), 'Alrededor'),
      h('div', { class: 'et-grupos' }, grupos.map(g => h('div', { class: 'card et-grupo' },
        h('h3', null, g.titulo), h('p', { class: 'small muted' }, g.d),
        h('ul', null, g.fichas.map(x => h('li', null, h('a', { href: ficha(x.id) }, x.lema), x.anio !== null ? h('span', { class: 'muted small' }, ` · ${anio(x.anio)}`) : null))))))),
    h('section', { class: 'et-paso' },
      h('h2', null, h('span', { class: 'et-n' }, '3'), 'El salto que conviene evitar'),
      t.salto ? recuadro('atencion', null, h('b', null, t.salto.charAt(0).toUpperCase() + t.salto.slice(1)), '. ', h('a', { href: '#/aprender/saltos' }, 'Qué falta para cruzarlo →'))
        : h('p', null, 'Esta etiqueta no tiene un salto típico registrado. Los que valen para todas están en el ', h('a', { href: '#/aprender/saltos' }, 'detector de saltos'), '.')),
    h('div', { class: 'btns', style: { marginTop: '18px' } },
      h('a', { class: 'btn primary', href: ficha(t.id) }, `La ficha completa de ${E.corto}`),
      h('a', { class: 'btn', href: `#/explorar?etiqueta=${encodeURIComponent(E.id)}` }, `Sus ${grupos.reduce((n, g) => n + g.fichas.length, 1)} fichas en Explorar`)),
  );
  pintar();

  episodios(ctx).then(lista => {
    if (!historia.isConnected) return;
    const eps = lista.filter(e => e.etiqueta === E.id);
    if (!eps.length) return;
    const ep = eps[0];
    historia.replaceChildren(h('aside', { class: 'historia-humana', style: { '--c': `var(--v-${ep.uso || 'E'})` } },
      h('b', { class: 'ct' }, 'Una historia'),
      h('p', null, inline(ep.historia_humana)),
      h('div', { class: 'btns' }, eps.map(e => h('a', { class: 'btn small', href: `#/episodio/${encodeURIComponent(e.id)}` }, `▶ Episodio: ${e.palabra}`)))));
  }).catch(() => {});
}
