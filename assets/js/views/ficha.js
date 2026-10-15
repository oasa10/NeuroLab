import { h, poner, USOS, CODIGOS, ESTADOS, TIPOS, VEREDICTOS, FASES, URL_BASE, REPO, anio, idear, famTag, famColor, marcaEstado, marcaVeredicto, recuadro, parrafos, inline, toggles, tip, tipTerm, imgUso, botonEscuchar } from '../lib.js';
import * as cuaderno from '../cuaderno.js';
import { pasoMinimo } from '../metodo.js';
import { deTermino } from '../episodio.js';
import { POR_ID } from '../etiquetas.js';

export { URL_BASE };
// Autoría para «Cómo citar»: el origen es el Método BrainBox, que no se explica aquí
export const AUTORIA = 'Salazar, Osman (2026)';
// Una historia humana (L14): de los cinco ejemplos, el primero que empieza por una persona
const HUMANOS = 'tutora|tutor|madre|padre|familia|alumna|alumno|maestra|maestro|profesora|profesor|orientadora|orientador|psicóloga|psicólogo|psiquiatra|pediatra|neuropediatra|médica|médico|persona|trabajadora|trabajador|opositora|opositor|estudiante|adolescente|niña|niño|chica|chico|joven|mujer|hombre|adulta|adulto|abuela|abuelo|hermana|hermano|empleada|empleado|investigadora|investigador|periodista|docente|logopeda|enfermera|enfermero|asesora|asesor|jueza|juez|vecina|vecino|paciente|alguien|pareja|activista|usuaria|usuario|terapeuta|educadora|educador|directora|director';
const CON_PERSONA = new RegExp(`^(?:En [^,]{1,40}, )?(?:Una?|El|La|Alguien)\\b(?:\\s+\\S+){0,2}?\\s*\\b(${HUMANOS})\\b`, 'i');
const textoEjemplo = e => (typeof e === 'string' ? e : `${e.titulo}: ${e.texto}`);
export const EMOCIONES = [['curiosidad', 'Curiosidad'], ['alivio', 'Alivio'], ['inquietud', 'Inquietud'], ['rechazo', 'Rechazo'], ['confusion', 'Confusión'], ['indiferencia', 'Indiferencia']];

export function render(root, ctx, parts, q) {
  const t = ctx.byId.get(parts[0]);
  if (!t) {
    document.title = 'Término no encontrado · NeuroLab';
    root.append(h('div', { class: 'empty' }, h('h1', null, 'Término no encontrado'), h('p', null, 'Puede que haya cambiado de nombre. A las etiquetas les pasa a menudo: pregúntale a «síndrome de Asperger».'),
      h('p', null, h('a', { class: 'btn', href: '#/explorar' }, 'Ir a Explorar'))));
    return;
  }
  document.title = `${t.lema} · NeuroLab`;
  cuaderno.fichaLeida(t.id);
  const est = ESTADOS[t.estado] || ESTADOS['sin verificar'];
  const conexiones = [...(ctx.vecinos.get(t.id) || [])].map(id => ctx.byId.get(id)).filter(Boolean).sort((a, b) => (a.anio ?? 9999) - (b.anio ?? 9999));
  const i = ctx.cronologico.indexOf(t);
  const prev = i > 0 ? ctx.cronologico[i - 1] : null, next = i >= 0 && i < ctx.cronologico.length - 1 ? ctx.cronologico[i + 1] : null;
  const url = `${URL_BASE}#/termino/${encodeURIComponent(t.id)}`;
  const hoy = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  const persona = t.tipo === 'persona';

  const datos = [];
  const fila = (k, ...v) => { if (v.flat().some(x => x !== '' && x !== null && x !== undefined)) datos.push(h('dt', null, k), h('dd', null, ...v)); };
  fila('Año', t.anio !== null ? h('span', null, h('b', null, anio(t.anio)), t.anioNota ? [' ', h('span', { class: 'muted small' }, `(${t.anioNota})`)] : null) : 'Sin fecha fiable');
  fila(persona ? 'Aportación' : 'Obra o hito', t.obra);
  fila(persona ? 'Con' : 'Figuras', t.figuras.join(' · '));
  fila('Tipo', TIPOS[t.tipo] || t.tipo);
  fila('Familia', h('a', { href: `#/explorar?familia=${encodeURIComponent(t.familia)}` }, famTag(t.familia)));
  fila('Usos', h('span', null, idear(t.usos), ' ', h('span', { class: 'small muted' }, t.usos.map(u => USOS[u].nombre.toLowerCase()).join(', ') || '—')));

  // Los cinco usos de este término: dónde circula y qué prueba necesitaría en cada sitio
  const usosTabla = h('div', { class: 'usos-tabla' }, CODIGOS.map(k => {
    const on = t.usos.includes(k);
    return h('div', { class: on ? 'on' : 'off', 'data-v': k },
      h('b', null, `${k} · ${USOS[k].nombre}`, h('small', null, on ? 'Aquí sí circula' : 'Aquí apenas circula')),
      h('div', null, on ? USOS[k].prueba : `${USOS[k].pregunta} Si alguien lo usara aquí, necesitaría esto: ${USOS[k].prueba.charAt(0).toLowerCase() + USOS[k].prueba.slice(1)}`));
  }));

  const sec = {
    porque: h('section', { class: 'bloque-q', id: 's-porque' }, h('h2', null, h('span', { class: 'q' }, '¿Por qué? ¿Cómo?'), persona ? 'Su época y su aportación' : 'Cómo surgió'), h('p', { class: 'muted' }, 'Cargando…')),
    paraque: h('section', { class: 'bloque-q', id: 's-paraque', hidden: true }),
    ahora: h('section', { class: 'bloque-q', id: 's-ahora', hidden: true }),
    sabias: h('div'),
    piensa: h('section', { class: 'bloque-q', id: 's-piensa' }),
    paso: h('div'),
  };
  const suave = () => (matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth');
  const indice = h('nav', { class: 'ficha-toc', 'aria-label': 'En esta ficha' },
    h('span', { class: 'muted small' }, 'Ir a:'),
    [['s-porque', '¿Por qué y cómo?'], ['s-paraque', '¿Para qué?'], ['s-ahora', '¿Y ahora qué?'], ['s-debate', 'Qué se discute'], ['s-usos', 'Cinco usos'], ['s-mito', '¿Mito o no?'], ['s-piensa', 'Piénsalo']]
      .filter(([id]) => id !== 's-mito' || (t.frase && t.veredicto))
      .map(([id, l]) => h('button', { type: 'button', onclick: () => document.getElementById(id)?.scrollIntoView({ behavior: suave(), block: 'start' }) }, l)));
  const conLinea = t.anio !== null && t.anio >= 1790;
  const linea = conLinea ? h('figure', { class: 'mini-tl' }) : null;
  // Primero una persona, después la definición (L14)
  const historia = h('div');
  let ejemploArriba = null;
  const art = h('article');
  // Escuchar la ficha (L9): lo que se ve, de arriba abajo, sin los datos de la tabla
  const escuchar = botonEscuchar(() => art.querySelectorAll('h1, .historia-humana p, .nucleo, #s-porque .prosa, #s-paraque li, #s-ahora .prosa, #s-debate > p'), 'Escuchar la ficha', t.lema);
  const tras = q && q.get('tras') === 'episodio';
  const etiqueta = POR_ID.get(t.id);

  root.append(
    h('nav', { class: 'crumbs', 'aria-label': 'Ruta' }, h('a', { href: '#/explorar' }, 'Explorar'), ' › ', h('a', { href: `#/explorar?familia=${encodeURIComponent(t.familia)}` }, t.familia)),
    h('div', { class: 'ficha' },
      poner(art,
        tras ? recuadro('recuerda', 'Episodio terminado', `Esta es la ficha completa de «${t.lema}»: lo que hay detrás de la etiqueta, con sus fuentes. Tu misión y tu historia están en `, h('a', { href: '#/cuaderno' }, 'tu cuaderno'), '.') : null,
        h('p', { class: 'nivel' }, 'Nivel 1 · Enterarte'),
        h('div', { class: 'ficha-titulo' },
          h('h1', null, t.lema),
          t.usos.length ? h('div', { class: 'ficha-imgs', title: 'Para qué se usa: ' + t.usos.map(u => USOS[u].nombre.toLowerCase()).join(', ') }, t.usos.map(u => imgUso(u))) : null),
        t.variantes.length ? h('p', { class: 'vars' }, 'También: ', t.variantes.join(' · ')) : null,
        h('div', { class: 'chips' }, idear(t.usos, { grande: true }), marcaEstado(t.estado), escuchar),
        etiqueta ? h('p', { class: 'small', style: { margin: '10px 0 0' } }, h('a', { href: `#/etiqueta/${encodeURIComponent(t.id)}` }, `${etiqueta.corto}, por su uso: qué prueba pide cada uno y quién la rodea →`)) : null,
        historia,
        t.definicion ? h('p', { class: 'nucleo', style: { '--c': famColor(t.familia) || 'var(--accent)' } }, t.definicion) : null,
        indice,
        t.estado === 'dudosa' ? recuadro('atencion', 'Ficha dudosa', 'Las fuentes se contradicen o no hemos encontrado una que confirme el año o la obra. Tómala con cautela: por eso no sale en los juegos.') : null,
        t.estado === 'propia' ? recuadro('aclaracion', 'Término de NeuroLab', 'Este concepto no lo fija una fuente externa: lo usamos aquí para ordenar el debate, y en la ficha explicamos por qué.') : null,
        h('dl', { class: 'datos' }, datos),
        linea,
        sec.porque, sec.paraque, sec.ahora, sec.sabias,
        h('section', { class: 'bloque-q', id: 's-debate' }, h('h2', null, h('span', { class: 'q' }, 'Debate'), 'Qué se discute hoy'),
          h('p', null, t.controversia || 'Sin controversia relevante.'),
          t.salto ? recuadro('atencion', 'Cuidado con el salto', h('b', null, t.salto.charAt(0).toUpperCase() + t.salto.slice(1)), '. Es el atajo de razonamiento que más se repite con este término. ', h('a', { href: '#/aprender/saltos' }, 'Qué falta para cruzarlo →')) : null),
        h('section', { class: 'bloque-q', id: 's-usos' }, h('h2', null, h('span', { class: 'q' }, 'Herramienta'), 'Cambia el uso, cambia la prueba'),
          h('p', { class: 'muted small' }, `Dónde circula «${t.lema}» y qué haría falta para usarlo bien en cada sitio. `, h('a', { href: '#/aprender/idear' }, '¿Qué es IDEAR?')),
          usosTabla),
        t.frase && t.veredicto ? h('section', { class: 'bloque-q', id: 's-mito' }, h('h2', null, h('span', { class: 'q' }, 'Ponte a prueba'), '¿Mito, matiz o cierto?'), mitoMatiz(t)) : null,
        sec.piensa, sec.paso,
        conexiones.length ? h('section', { class: 'bloque-q' }, h('h2', null, h('span', { class: 'q' }, 'Red'), 'Conexiones'),
          h('div', { class: 'chips' }, conexiones.map(c => h('a', { class: 'chip', href: `#/termino/${encodeURIComponent(c.id)}` }, c.lema, h('span', { class: 'muted' }, anio(c.anio))))),
          h('p', { class: 'small', style: { marginTop: '10px' } }, h('a', { href: `#/visualizar/mapa?t=${encodeURIComponent(t.id)}` }, 'Ver sus conexiones en el mapa →'))) : null,
        h('nav', { class: 'pager', 'aria-label': 'Términos vecinos en el tiempo' },
          prev ? h('a', { class: 'btn', href: `#/termino/${encodeURIComponent(prev.id)}` }, `← ${prev.lema} (${anio(prev.anio)})`) : h('span'),
          next ? h('a', { class: 'btn', href: `#/termino/${encodeURIComponent(next.id)}` }, `${next.lema} (${anio(next.anio)}) →`) : h('span'))),
      h('aside', { class: 'side' },
        h('div', { class: 'card' },
          h('h2', null, 'Verificación'),
          h('p', null, h('b', null, est.nombre), ' · ', est.ayuda),
          t.fuentes.length ? h('ul', { style: { paddingLeft: '18px', margin: '0 0 8px' } }, t.fuentes.map(f => h('li', null,
            f.url ? h('a', { href: f.url, rel: 'noopener', target: '_blank' }, f.titulo || f.url) : f.titulo))) : h('p', { class: 'muted small' }, 'Sin fuente registrada.'),
          h('p', { class: 'small muted', style: { margin: 0 } }, '¿Ves un error? ', h('a', { href: `${REPO}/issues/new?title=${encodeURIComponent('Error en la ficha: ' + t.lema)}`, rel: 'noopener', target: '_blank' }, 'Avísanos'))),
        h('div', { class: 'card' },
          h('h2', null, 'Sigue por aquí'),
          h('div', { class: 'btns' },
            t.anio !== null ? h('a', { class: 'btn small', href: `#/viajar?t=${encodeURIComponent(t.id)}` }, 'Viajar a su época') : null,
            h('a', { class: 'btn small', href: `#/visualizar/mapa?t=${encodeURIComponent(t.id)}` }, 'Verlo en el mapa'),
            h('a', { class: 'btn small', href: `#/explorar?familia=${encodeURIComponent(t.familia)}` }, 'Su familia')),
          h('p', { class: 'small', style: { margin: '12px 0 0' } }, h('b', null, 'Nivel 2: '), h('a', { href: `#/pensar/laboratorio?t=${encodeURIComponent(t.id)}` }, 'analízalo tú con las seis preguntas'), '.')),
        h('div', { class: 'card nota-salud' },
          h('h2', null, 'Una cosa importante'),
          h('p', { class: 'small', style: { margin: 0 } }, 'Esta ficha explica un término; no sirve para diagnosticar a nadie. Si te preocupa algo de ti o de alguien cercano, háblalo con un profesional. ', h('a', { href: '#/conocer/ayuda' }, 'Dónde pedir ayuda'), '.')),
        h('div', { class: 'card' },
          h('h2', null, 'Cómo citar esta ficha'),
          h('p', { class: 'cite' }, `${AUTORIA}. «${t.lema}». En NeuroLab. Consulta, juega y aprende sobre neurodiversidad, diagnósticos y etiquetas. Con el Método BrainBox. ${url} [consulta: ${hoy}].`)))),
  );

  const ponHistoria = (texto, ep) => {
    if (!historia.isConnected || historia.firstChild) return;
    historia.replaceChildren(h('aside', { class: 'historia-humana', style: { '--c': `var(--v-${(ep && ep.uso) || t.usos[0] || 'E'})` } },
      h('b', { class: 'ct' }, 'Una historia'),
      h('p', null, inline(texto)),
      ep && !tras ? h('a', { class: 'btn small', href: `#/episodio/${encodeURIComponent(ep.id)}` }, '▶ Vívelo en un episodio de siete minutos') : null));
  };
  const historiaEp = deTermino(ctx, t.id).catch(() => null);

  if (linea) lineaTiempo(linea, t, conexiones);

  ctx.contenido().then(mapa => {
    if (!sec.porque.isConnected) return;
    const c = mapa.get(t.id);
    const tituloPorque = h('h2', null, h('span', { class: 'q' }, '¿Por qué? ¿Cómo?'), persona ? 'Su época y su aportación' : 'Cómo surgió');
    if (!c || !c.contexto) {
      sec.porque.replaceChildren(tituloPorque, h('p', { class: 'muted' }, 'Esta ficha todavía no tiene contexto escrito.'));
      sec.piensa.replaceChildren(...piensa(t, null));
      return;
    }
    sec.porque.replaceChildren(tituloPorque, h('div', { class: 'prosa' }, parrafos(c.contexto)));
    // La historia de arriba: la del episodio, si la palabra tiene; si no, el primer ejemplo con una persona (no en las fichas de personas)
    historiaEp.then(ep => {
      if (ep && ep.historia_humana) ponHistoria(ep.historia_humana, ep);
    });
    if (!persona && c.ejemplos?.length) {
      ejemploArriba = c.ejemplos.find(e => CON_PERSONA.test(textoEjemplo(e))) || null;
      historiaEp.then(ep => { if (!(ep && ep.historia_humana) && ejemploArriba) ponHistoria(textoEjemplo(ejemploArriba), null); });
    }
    if (c.ejemplos?.length) {
      sec.paraque.hidden = false;
      const n = c.ejemplos.length;
      sec.paraque.replaceChildren(h('h2', null, h('span', { class: 'q' }, '¿Para qué?'), n === 5 ? 'Cinco ejemplos' : `${['', 'Un ejemplo', 'Dos ejemplos', 'Tres ejemplos', 'Cuatro ejemplos'][n] || n + ' ejemplos'}`),
        h('ol', { class: 'ejemplos' }, c.ejemplos.map(e => {
          const txt = textoEjemplo(e);
          const m = /^([^:.]{3,60}):\s+(.+)$/s.exec(txt);
          return h('li', null, h('div', null, m ? [h('b', null, inline(m[1])), h('span', null, inline(m[2]))] : h('span', null, inline(txt))));
        })));
    }
    if (c.implicaciones) {
      sec.ahora.hidden = false;
      sec.ahora.replaceChildren(h('h2', null, h('span', { class: 'q' }, '¿Y ahora qué?'), 'Qué tiene que ver con hoy'), h('div', { class: 'prosa' }, parrafos(c.implicaciones)));
    }
    if (c.sabias_que) sec.sabias.replaceChildren(recuadro('sabias', null, inline(c.sabias_que)));
    sec.piensa.replaceChildren(...piensa(t, c));
    if (c.paso) sec.paso.replaceChildren(h('section', { class: 'bloque-q', id: 's-paso' }, h('h2', null, h('span', { class: 'q' }, 'Fuera de la pantalla'), 'Una acción mínima'),
      recuadro('recuerda', 'Esta semana, si quieres', inline(c.paso)),
      h('details', null, h('summary', null, 'Convertirla en tu acción mínima'), pasoMinimo({ sugerencia: c.paso.replace(/\.$/, ''), titulo: 'Tu acción mínima', origen: t.id }))));
  }).catch(() => { sec.porque.replaceChildren(h('p', { class: 'muted' }, 'No se ha podido cargar el resto de la ficha. Prueba a recargar la página.')); sec.piensa.replaceChildren(...piensa(t, null)); });
}

// ¿Mito, matiz o cierto? La frase que se oye, antes de ver la respuesta
function mitoMatiz(t) {
  const res = h('div', { class: 'resultado', 'aria-live': 'polite' });
  const botones = Object.entries(VEREDICTOS).map(([k, v]) => h('button', { class: 'btn', type: 'button', onclick: () => elegir(k) }, v.ico, ' ', v.nombre));
  function elegir(k) {
    botones.forEach((b, i) => { const kk = Object.keys(VEREDICTOS)[i]; b.disabled = true; if (kk === t.veredicto) b.classList.add('acierto'); else if (kk === k) b.classList.add('fallo'); });
    const ok = k === t.veredicto;
    if (ok) cuaderno.sumar('saber', 2);
    res.replaceChildren(h('p', { style: { margin: '0 0 6px' } }, h('b', null, ok ? '¡Bien visto! ' : 'Casi. '), 'La respuesta es ', marcaVeredicto(t.veredicto), '.'),
      t.matiz ? h('p', { style: { margin: 0 } }, inline(t.matiz)) : null,
      h('p', { class: 'small', style: { margin: '8px 0 0' } }, h('a', { href: '#/jugar/mito' }, 'Juega diez rondas →')));
  }
  return h('div', { class: 'mmc' }, h('p', { class: 'muted small', style: { margin: '0 0 6px' } }, 'Una frase que se oye a menudo:'),
    h('p', { class: 'frase' }, t.frase), h('div', { class: 'opciones' }, botones), res);
}

// Piénsalo: la pregunta y una primera reacción (eje Ser: sentir antes de pensar)
function piensa(t, c) {
  const previa = cuaderno.leer().entradas.find(e => e.tipo === 'reaccion' && e.datos?.id === t.id);
  const eco = h('p', { class: 'small muted', 'aria-live': 'polite', style: { margin: '8px 0 0' } });
  let espera, anotada = false;
  const tg = toggles(EMOCIONES, { multiple: true, valor: previa?.datos?.emociones || [], alCambiar: v => {
    clearTimeout(espera);
    if (!v.length) { eco.textContent = ''; return; }
    espera = setTimeout(() => {
      if (!anotada) {
        if (previa) cuaderno.borrarEntrada(previa.id);
        cuaderno.entrada('reaccion', t.lema, { id: t.id, emociones: v }, { ser: 2 });
        cuaderno.sentir();
        anotada = true;
      }
      eco.textContent = 'Anotado en tu cuaderno. Sentir algo no demuestra nada, pero es un buen sitio desde el que empezar a pensar.';
    }, 600);
  } });
  return [
    h('h2', null, h('span', { class: 'q' }, 'Tu turno'), 'Piénsalo'),
    recuadro('piensa', 'Una pregunta para ti', inline(c?.pregunta || `¿Dónde te has cruzado con «${t.lema}»? ¿Para qué se estaba usando?`)),
    h('div', { class: 'reaccion' },
      h('p', { style: { margin: '6px 0 8px', fontWeight: 600 } }, previa ? 'Ya anotaste lo que te provoca. ¿Sigue igual?' : 'Antes de pensar, sentir: ¿qué te provoca este término? Marca una o varias.'),
      tg, eco),
    h('div', { class: 'btns', style: { marginTop: '14px' } },
      h('a', { class: 'btn primary', href: `#/pensar/termometro?t=${encodeURIComponent(t.id)}` }, 'Tómate la temperatura →'),
      h('a', { class: 'btn', href: `#/pensar/laboratorio?t=${encodeURIComponent(t.id)}` }, 'Analízalo con las seis preguntas')),
  ];
}

// Línea temporal de la ficha: el término, sus conexiones con fecha y las fases
function lineaTiempo(el, t, conexiones) {
  const d3 = window.d3;
  if (!d3) return;
  const W = Math.max(300, Math.round(el.clientWidth || 640)), H = 66, Y = 36, A0 = 1790, A1 = 2030;
  const x = d3.scaleLinear().domain([A0, 1900, A1]).range([6, W * 0.16, W - 6]);
  const fases = FASES;
  const svg = d3.select(el).append('svg').attr('viewBox', `0 0 ${W} ${H}`).attr('role', 'img');
  const ini = f => Math.max(f.desde, A0), fin = f => Math.min(f.hasta + 1, A1);
  const ancho = f => x(fin(f)) - x(ini(f));
  svg.selectAll('rect.f').data(fases).join('rect').attr('class', 'f')
    .attr('x', f => x(ini(f)) + 1).attr('width', f => Math.max(0, ancho(f) - 2)).attr('y', Y - 8).attr('height', 16).attr('rx', 4)
    .attr('fill', (f, k) => (k % 2 ? 'var(--accent-bg)' : 'var(--surface-2)'));
  const vec = conexiones.filter(c => c.anio !== null && c.anio >= A0);
  const puntos = [t.anio, ...vec.map(c => c.anio)].map(a => x(a));
  const rotuloFase = f => {
    const n = f.nombre.split(' ').slice(-1)[0], c = x(ini(f)) + ancho(f) / 2, m = n.length * 3 + 8;
    return ancho(f) > n.length * 6 + 16 && !puntos.some(px => Math.abs(px - c) < m) ? n : '';
  };
  svg.selectAll('text.f').data(fases).join('text').attr('class', 'f').attr('x', f => x(ini(f)) + ancho(f) / 2).attr('y', Y + 4)
    .attr('text-anchor', 'middle').style('font-size', '10px').style('fill', 'var(--muted)').text(rotuloFase);
  (W < 520 ? [1800, 1900, 1980, 2026] : [1800, 1900, 1950, 1980, 1994, 2013, 2026]).forEach(a => svg.append('text').attr('x', x(a)).attr('y', H - 4)
    .attr('text-anchor', a === 2026 ? 'end' : 'middle').style('font-size', '10px').style('fill', 'var(--muted)').text(a));
  svg.selectAll('circle.v').data(vec).join('circle').attr('class', 'v').attr('cx', c => x(c.anio)).attr('cy', Y).attr('r', 5)
    .attr('fill', c => famColor(c.familia)).attr('stroke', 'var(--surface)').attr('stroke-width', 2).style('cursor', 'pointer')
    .on('mousemove', (e, c) => tip.show(tipTerm(c), e.clientX, e.clientY)).on('mouseleave', () => tip.hide())
    .on('click', (e, c) => { tip.hide(); location.hash = `#/termino/${encodeURIComponent(c.id)}`; });
  const cx = x(t.anio), g = svg.append('g').attr('transform', `translate(${cx},${Y})`);
  g.append('line').attr('y1', -22).attr('y2', -9).attr('stroke', 'var(--ink)').attr('stroke-width', 2);
  g.append('circle').attr('r', 8).attr('fill', famColor(t.familia)).attr('stroke', 'var(--surface)').attr('stroke-width', 2.5);
  const corto = t.lema.replace(/\s*\(.*\)\s*$/, '');
  const rotulo = `${corto.length > 34 ? corto.slice(0, 32) + '…' : corto} · ${anio(t.anio)}`;
  const txt = g.append('text').attr('y', -26).attr('text-anchor', 'middle')
    .style('font-size', '12px').style('font-weight', 700).style('fill', 'var(--ink)').text(rotulo);
  const ancho_ = txt.node().getComputedTextLength?.() || rotulo.length * 7;
  if (cx + ancho_ / 2 > W - 2) txt.attr('text-anchor', 'end').attr('x', W - 2 - cx);
  else if (cx - ancho_ / 2 < 2) txt.attr('text-anchor', 'start').attr('x', 2 - cx);
  svg.attr('aria-label', `Línea temporal de ${A0} a hoy: ${t.lema} en ${anio(t.anio)}${vec.length ? `, con ${vec.length} términos conectados` : ''}.`);
  el.append(Object.assign(document.createElement('figcaption'), {
    className: 'small muted',
    textContent: (vec.length ? `El punto grande es este término; los pequeños, sus ${vec.length} conexiones con fecha. Pulsa uno para ir a su ficha.` : 'Dónde cae este término en la historia de las etiquetas.') + ' El siglo XIX va comprimido a la izquierda para dar sitio al XX y al XXI.',
  }));
}
