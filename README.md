# NeuroLab

**Una etiqueta no pide lo mismo en la consulta, en el aula o en una ayuda. NeuroLab te enseña qué pide cada uso.**

*Cambia el uso, cambia la prueba.*

Web: https://oasa10.github.io/NeuroLab/

TDAH, autismo, altas capacidades, dislexia, neurodiversidad… NeuroLab reúne los términos de este debate con su historia, sus fuentes y lo que significan hoy, y enseña una idea: la misma etiqueta hace cinco trabajos distintos (**IDEAR**: investigar, diagnosticar, educar, acceder y reconocerse), y cada uso necesita su propia prueba.

NeuroLab no diagnostica ni sustituye a profesionales. Si lo estás pasando muy mal: 024 (España, gratis, 24 horas) o 112.

## Qué hay dentro

Se entra por una sola puerta: **el episodio de hoy**, una etiqueta en siete tiempos y unos siete minutos (Choque, Reflejo, Giro, Peldaño, Misión, Tu historia y Vuelta). Antes de empezar pregunta cómo llegas hoy; si llegas con la cabeza a mil, el episodio se acorta a una pregunta y una acción pequeña. Hay treinta episodios, uno nuevo al día, que cubren las once etiquetas y los cinco usos. Junto a la puerta están el reto **¿Para qué se usa?**, con tu marca y tu peldaño, y el **modo clase** (`#/clase`): quien enseña u orienta elige una etiqueta y un uso, lo proyecta y el grupo vota sin nombres, con la ficha como guion. En modo clase no se guarda nada.

Las 129 fichas se ordenan por **once etiquetas** (`#/explorar` y `#/etiqueta/<id>`): eliges una, eliges para qué se usa y ves qué prueba pide ese uso; alrededor, quién la nombró, dónde se fija y con qué se piensa. Cada ficha y cada pregunta del reto llevan las imágenes de sus usos, las fichas abren con una historia humana y tienen un botón **Escuchar** que usa la voz del dispositivo.

Debajo, todo lo demás, en dos niveles: **Enterarte** (Explorar, Viajar y Visualizar) e **Implicarte** (Aprender, Jugar y Pensar y aplicar). Lo que se hace queda en **Tu cuaderno**, con los cuatro ejes (ser, saber, hacer, creer y crear), las insignias y los episodios: misiones, vueltas e historias. La racha se pausa, no se pierde.

## Cómo está hecho

- Sitio estático sin compilar: `index.html`, `assets/js/main.js` (rutas `#/…`), `lib.js`, `metodo.js`, `cuaderno.js`, `etiquetas.js`, `episodio.js` y una vista por sección en `assets/js/views/`. D3, Cytoscape.js y Fuse.js van copiados en `assets/vendor/`. El episodio usa un motor común a las webs del proyecto, sin dependencias, en `assets/vendor/episodio/`.
- Datos: `data/fuente/` es la fuente de verdad (fichas, hitos y series en JSON). `python3 tools/build_data.py` genera los JSON que lee la web y los CSV de `data/csv/` (necesita numpy para el mapa). Los textos de Aprender y de Pensar y aplicar están en `tools/aprender_src.py` y `tools/pensar_src.py`. Los treinta episodios están en `data/episodios.json`; salen de las fichas, y cada Giro lleva un hecho con su fuente.
- Tu cuaderno, tus episodios, tus marcas y el tema se guardan solo en tu navegador (`localStorage`). Sin cookies, analítica ni llamadas a terceros.
- Sin servidor ni conexión, la web entera cabe en un solo archivo que se abre con doble clic: `python3 tools/build_html.py` crea `dist/NeuroLab.html`.
- Web hermana: [PostLab](https://oasa10.github.io/PostLab/).

Hecha con el Método BrainBox.

## Versiones

- **2.1** (octubre de 2026): la promesa, el episodio del día con la pregunta de llegada dentro, el orden por once etiquetas, el reto con su marcador, el modo clase, las historias humanas, las cinco imágenes de los usos, «Escuchar», el buscador que baja al resultado, la acción mínima y el HTML de doble clic.
- **2.0** (12 de octubre de 2026): fichas con contexto, ejemplos e implicaciones, los dos niveles, los juegos, Pensar y aplicar y Tu cuaderno.

## Cómo citar

Salazar, Osman (2026). *NeuroLab. Consulta, juega y aprende sobre neurodiversidad, diagnósticos y etiquetas*. Con el Método BrainBox. https://oasa10.github.io/NeuroLab/

## Licencias

Datos y textos: [CC BY 4.0](data/LICENCIA.md). Código: [MIT](LICENSE), también el del motor del episodio. Tipografías Inter y Fraunces: SIL Open Font License.

## Errores

Abre una incidencia en este repositorio; cada ficha tiene su enlace «Avísanos». Si propones una corrección, añade una fuente.
