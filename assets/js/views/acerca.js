import { h, plural, cabeza, recuadro, LOGO, USOS, CODIGOS, REPO, URL_BASE } from '../lib.js';
import { EJES, ORDEN_EJES } from '../cuaderno.js';
import { semaforo, RUTAS, RECORRIDO, TRANSVERSALES } from '../metodo.js';

export function render(root, ctx, parts) {
  if (parts[0] === 'ayuda') return ayuda(root);
  document.title = 'Conocer NeuroLab · NeuroLab';
  const { terms, hitos, rels } = ctx;
  const n = e => terms.filter(t => t.estado === e).length;
  const hoy = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  root.append(h('div', { style: { maxWidth: '760px' } },
    cabeza(0, 'Conocer NeuroLab', 'NeuroLab es un laboratorio abierto sobre las etiquetas del neurodesarrollo y la neurodiversidad: de dónde vienen, para qué sirven, qué se discute y qué no se sigue de ellas, contado de forma clara y con las fuentes a la vista.'),
    h('p', null, 'Está pensado para cualquier persona con curiosidad, para familias, docentes y estudiantes, y para profesionales de la salud y la educación que quieran una herramienta para explicar y explicarse. No hace falta saber psicología ni psiquiatría: hace falta querer pensar con calma un debate que suele hacerse a gritos.'),
    recuadro('atencion', 'Lo que NeuroLab no es', 'No es una herramienta de diagnóstico, no aconseja tratamientos y no sustituye a ningún profesional. No etiqueta a quien la usa: describe palabras, usos y situaciones, nunca personas. ', h('a', { href: '#/conocer/ayuda' }, 'Dónde pedir ayuda'), '.'),

    h('h2', null, 'La idea'),
    h('p', null, 'Una etiqueta como «TDAH», «autismo» o «altas capacidades» no es una cosa: es una herramienta, y la misma palabra hace trabajos distintos. NeuroLab los ordena en cinco usos, que se recuerdan con el verbo ', h('b', null, 'IDEAR'), ':'),
    h('ul', null, CODIGOS.map(k => h('li', null, h('b', null, `${k} · ${USOS[k].nombre}`), `: ${USOS[k].para}. `, h('span', { class: 'muted' }, USOS[k].prueba)))),
    h('p', null, 'Lo que justifica una etiqueta en un uso no la justifica automáticamente en otro. A eso lo llamamos ', h('b', null, 'validez de uso'), ', y se resume en una frase: ', h('b', null, 'cambia el uso, cambia la prueba'), '. Los problemas suelen aparecer en los saltos (del grupo al individuo, de la asociación a la causa, del nombre al mecanismo…), y hay dos errores que pesan lo mismo: ampliar sin justificación y dejar fuera a quien necesita apoyo.'),

    h('h2', null, 'El logo'),
    h('div', { class: 'logo-explica' },
      h('div', { class: 'logo-grande', html: LOGO }),
      h('p', null, 'Es la tesis en un dibujo. A la izquierda, una ', h('b', null, 'etiqueta'), ': lo que se nombra, sólido y con su agujero para colgarla de algo. A la derecha, ', h('b', null, 'cinco puntos'), ', uno por cada uso de IDEAR, cada uno de su color: la misma etiqueta sale hacia cinco sitios distintos, y en cada uno tiene que demostrar algo diferente. Es pariente de ', h('a', { href: 'https://oasa10.github.io/PostLab/', rel: 'noopener', target: '_blank' }, 'PostLab'), ', la web hermana sobre todo lo post.')),

    h('h2', null, 'Dos niveles'),
    h('p', null, h('b', { style: { color: 'var(--n1)' } }, 'Enterarte'), ' (Explorar, Viajar y Visualizar) es el nivel de la información: lees las fichas, recorres la historia y miras los datos. ',
      h('b', { style: { color: 'var(--n2)' } }, 'Implicarte'), ' (Aprender, Jugar y Pensar y aplicar) es el nivel de la práctica: aprendes herramientas, las pones a prueba y las aplicas a tu vida. El color de cada página te dice en qué nivel estás.'),

    h('h2', null, 'Cómo funciona por dentro'),
    h('p', null, 'NeuroLab no solo informa: acompaña. Por dentro sigue un método sencillo que se nota en cada página.'),
    h('ul', null,
      h('li', null, h('b', null, 'Cuatro ejes que siempre van juntos. '), ORDEN_EJES.map((e, i) => [i ? '; ' : '', h('i', null, EJES[e].nombre), ` (${EJES[e].sub.toLowerCase()})`]), '. Lo que haces en el nivel 2 te hace subir peldaños en tu cuaderno. Sentir y reaccionar (el reflejo) no es lo mismo que hacer (lo que decides), y saber y contarse bien la historia no se quitan nunca.'),
      h('li', null, h('b', null, 'Una pregunta de entrada. '), '«¿Cómo llegas hoy a este tema?» abre tres rutas: ', Object.values(RUTAS).map((r, i) => [i ? ', ' : '', h('i', null, r.ruta.toLowerCase()), ` si llegas ${r.opcion.toLowerCase()}`]), '. Describe cómo llegas hoy, no cómo eres.'),
      h('li', null, h('b', null, 'Un recorrido de cinco pasos. '), RECORRIDO.map(p => p.n).join(', '), '. Las actividades de Pensar y aplicar lo siguen.'),
      h('li', null, h('b', null, 'Un paso mínimo antes que diez lecturas. '), '«Haré ___, el día ___, durante ___, y comprobaré ___», y una pregunta de retorno: ¿qué cambiará fuera de mi explicación si esto funciona?'),
      h('li', null, h('b', null, 'Tres preguntas que acompañan cualquier decisión. '), TRANSVERSALES.map(t => `${t.n}: ${t.p.split('?')[0]}?`).join(' ')),
      h('li', null, h('b', null, 'Ciclos, no personas. '), 'En lugar de «es así», mirar qué pasa: la situación, lo que se siente, lo que se hace, lo que ocurre después y qué lo cambia.'),
      h('li', null, h('b', null, 'Siempre hay salida. '), 'El semáforo está en todas las páginas, al pie.')),

    h('h2', null, 'Qué hay dentro'),
    h('ul', null,
      h('li', null, `${plural(terms.length, 'término', 'términos')}: categorías diagnósticas, conceptos, personas, leyes y movimientos, con su año, su obra o hito, sus usos, su familia, sus conexiones y sus fuentes.`),
      h('li', null, `${plural(rels.length, 'conexión', 'conexiones')} entre términos y ${plural(hitos.length, 'hito', 'hitos')} con fuente, de España y del resto del mundo.`),
      h('li', null, 'Para cada término: cómo surgió, cinco ejemplos de para qué sirve, qué tiene que ver con hoy, qué se discute, un dato curioso, una frase que se oye (¿mito, matiz o cierto?), una pregunta para pensar y un paso pequeño fuera de la pantalla.'),
      h('li', null, 'Una ruta guiada, los cinco usos, las seis preguntas, un detector de saltos, los dos errores, un glosario, cinco juegos y siete actividades para pensar y aplicar.')),

    h('h2', null, 'De dónde sale'),
    h('p', null, 'NeuroLab nace de un proyecto de investigación documental sobre la validez de las categorías del neurodesarrollo (TDAH, autismo, altas capacidades y sus fronteras) y sobre cómo circulan entre la ciencia, la clínica, la escuela, las instituciones y la identidad. Su conclusión, todavía provisional, es la que ordena la web: no hay pruebas de que más inclusión produzca necesariamente más error clínico, ni de que todo sea una moda; lo que hace falta es que cada uso tenga su propia justificación.'),

    h('h2', null, 'Cómo se han hecho los datos'),
    h('p', null, 'Las fichas se han escrito con ayuda de inteligencia artificial en octubre de 2026, con una regla por encima de todas: no incluir nada que no sea seguro. Cada ficha se ha contrastado con fuentes públicas (organismos sanitarios y educativos, leyes publicadas en el BOE, artículos indexados, enciclopedias académicas y, cuando no había más, Wikipedia). Por eso cada ficha muestra su estado:'),
    h('div', { class: 'table-wrap' }, h('table', null,
      h('thead', null, h('tr', null, h('th', { scope: 'col' }, 'Estado'), h('th', { scope: 'col' }, 'Qué significa'), h('th', { scope: 'col', class: 'num' }, 'Fichas'))),
      h('tbody', null,
        h('tr', null, h('td', null, h('b', null, 'Verificada')), h('td', null, 'El año y la obra coinciden en al menos una fuente fiable.'), h('td', { class: 'num' }, n('verificada'))),
        h('tr', null, h('td', null, h('b', null, 'Probable')), h('td', null, 'Solo coinciden fuentes generales.'), h('td', { class: 'num' }, n('probable'))),
        h('tr', null, h('td', null, h('b', null, 'Del proyecto')), h('td', null, 'Concepto propio de NeuroLab, explicado con sus razones.'), h('td', { class: 'num' }, n('propia'))),
        h('tr', null, h('td', null, h('b', { style: { color: 'var(--danger)' } }, 'Dudosa')), h('td', null, 'Las fuentes se contradicen o no se ha encontrado fuente. No entra en los juegos.'), h('td', { class: 'num' }, n('dudosa')))))),
    h('p', { class: 'small muted', style: { marginTop: '8px' } }, 'Los años son los de la obra, la ley o el hecho que fija cada término; en las personas, el de su aportación principal. Las cifras de Tendencias tienen su propia fuente, indicada en cada gráfico.'),
    recuadro('aclaracion', 'Una advertencia honesta', 'La inteligencia artificial ayuda mucho y se equivoca a veces. Por eso la verificación se ha hecho ficha a ficha y una persona revisa una muestra antes de cada publicación. Si una IA te cuenta algo sobre un diagnóstico, compruébalo: aquí también.'),

    h('h2', null, '¿Has visto un error?'),
    h('p', null, 'Seguro que los hay. Puedes avisar abriendo una incidencia en ', h('a', { href: `${REPO}/issues`, rel: 'noopener', target: '_blank' }, 'el repositorio de GitHub'),
      ' (cada ficha tiene su enlace «Avísanos»). Si propones una corrección, añade una fuente.'),

    h('h2', null, 'Descarga los datos'),
    h('ul', null,
      h('li', null, h('a', { href: 'data/csv/terminos.csv', download: '' }, 'terminos.csv'), ': un término por fila, con todos sus apartados, sus conexiones y sus fuentes.'),
      h('li', null, h('a', { href: 'data/csv/hitos.csv', download: '' }, 'hitos.csv'), ': los hitos, con su fuente.')),

    h('h2', null, 'Licencias'),
    h('p', null, 'Los datos y los textos de NeuroLab se publican con la licencia ', h('a', { href: 'https://creativecommons.org/licenses/by/4.0/deed.es', rel: 'license noopener', target: '_blank' }, 'Creative Commons Atribución 4.0 (CC BY 4.0)'),
      ': puedes copiarlos, adaptarlos y usarlos para lo que quieras, siempre que cites la fuente. El código del sitio se publica con la licencia MIT. NeuroLab usa D3 (ISC), Cytoscape.js (MIT) y Fuse.js (Apache 2.0), y las tipografías Inter y Fraunces (SIL Open Font License). Todo se sirve desde el propio sitio, sin llamadas a terceros.'),

    h('h2', null, 'Cómo citar NeuroLab'),
    h('p', { class: 'cite' }, `NeuroLab. Consulta, juega y aprende sobre neurodiversidad, diagnósticos y etiquetas (2026). ${URL_BASE} [consulta: ${hoy}].`),

    h('h2', null, 'Privacidad'),
    h('p', null, 'NeuroLab no usa cookies, no tiene analítica ni publicidad y no recoge datos personales. Tu cuaderno, lo que escribes en las actividades, tus marcas en los juegos y el modo claro u oscuro se guardan solo en tu navegador: no viajan a ningún servidor y puedes borrarlos cuando quieras desde ', h('a', { href: '#/cuaderno' }, 'tu cuaderno'), '.'),
  ));
}

function ayuda(root) {
  document.title = 'Dónde pedir ayuda · NeuroLab';
  const tel = (num, txt) => h('a', { class: 'tel', href: `tel:${num.replace(/\s/g, '')}` }, txt || num);
  root.append(h('div', { style: { maxWidth: '760px' } },
    h('nav', { class: 'crumbs', 'aria-label': 'Ruta' }, h('a', { href: '#/conocer' }, 'Conocer NeuroLab'), ' › Dónde pedir ayuda'),
    cabeza(0, 'Dónde pedir ayuda', 'Leer sobre diagnósticos remueve, y a veces lo que hace falta no es otra ficha sino hablar con alguien. Aquí tienes por dónde empezar, en España.'),
    semaforo(),
    h('h2', null, 'Si es urgente'),
    h('ul', null,
      h('li', null, h('b', null, 'Emergencias: '), tel('112'), '.'),
      h('li', null, h('b', null, 'Línea 024, de atención a la conducta suicida: '), tel('024'), '. Gratuita, confidencial y disponible las 24 horas, todos los días.'),
      h('li', null, h('b', null, 'Teléfono de la Esperanza: '), tel('717 003 717'), ', para hablar cuando lo estás pasando mal.'),
      h('li', null, h('b', null, 'Fundación ANAR, para niños, niñas y adolescentes: '), tel('900 20 20 10'), '.')),
    h('h2', null, 'Si te preocupa algo de ti o de alguien cercano'),
    h('ul', null,
      h('li', null, h('b', null, 'Tu centro de salud. '), 'El médico o la médica de familia, o el pediatra si es un niño o una niña, es la puerta de entrada a una evaluación y, si hace falta, a salud mental o a neurología.'),
      h('li', null, h('b', null, 'El centro educativo. '), 'El tutor o la tutora y el departamento de orientación pueden observar, ajustar y, si procede, pedir una evaluación psicopedagógica. Muchos apoyos no necesitan esperar a un diagnóstico.'),
      h('li', null, h('b', null, 'Asociaciones. '), 'Las asociaciones de familias y de personas con cada condición conocen los recursos de tu comunidad autónoma y tienen experiencia de primera mano. Algunas de ámbito estatal: ',
        h('a', { href: 'https://autismo.org.es/', rel: 'noopener', target: '_blank' }, 'Autismo España'), ', ',
        h('a', { href: 'https://www.feaadah.org/', rel: 'noopener', target: '_blank' }, 'FEAADAH'), ' (TDAH) y ',
        h('a', { href: 'https://www.plenainclusion.org/', rel: 'noopener', target: '_blank' }, 'Plena inclusión'), ' (discapacidad intelectual y del desarrollo).')),
    recuadro('recuerda', 'Para recordar', 'Un diagnóstico lo hace un profesional, con una evaluación, nunca un test de internet, un vídeo ni una web como esta. Y reconocerse en una descripción es valioso, pero no es lo mismo que una evaluación.'),
    h('h2', null, 'Si lo que te pasa es que has leído demasiado'),
    h('p', null, 'Pasa mucho. Cuando lo que sabes o lo que te cuentas pesa más que lo que sientes y lo que puedes hacer, más información no ayuda. Prueba esto: para, nota qué sientes, elige una sola pregunta y un paso pequeño para esta semana.'),
    h('div', { class: 'btns' }, h('a', { class: 'btn primary', href: '#/pensar/termometro' }, 'Tomarme la temperatura'), h('a', { class: 'btn', href: '#/pensar/paso' }, 'Elegir un paso pequeño')),
  ));
}
