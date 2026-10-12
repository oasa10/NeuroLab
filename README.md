# NeuroLab

**Consulta, juega y aprende sobre neurodiversidad, diagnósticos y etiquetas.**
Web: https://oasa10.github.io/NeuroLab/

TDAH, autismo, altas capacidades, dislexia, neurodiversidad… NeuroLab reúne los términos de este debate con su historia, sus fuentes y lo que significan hoy, y enseña una idea: la misma etiqueta hace cinco trabajos distintos (**IDEAR**: investigar, diagnosticar, educar, acceder y reconocerse), y cada uso necesita su propia prueba. *Cambia el uso, cambia la prueba.*

NeuroLab no diagnostica ni sustituye a profesionales. Si lo estás pasando muy mal: 024 (España, gratis, 24 horas) o 112.

## Cómo está hecho

- Sitio estático sin compilar: `index.html`, `assets/js/main.js` (rutas `#/…`), `lib.js`, `metodo.js`, `cuaderno.js` y una vista por sección en `assets/js/views/`. D3, Cytoscape.js y Fuse.js van copiados en `assets/vendor/`.
- Datos: `data/fuente/` es la fuente de verdad (fichas, hitos y series en JSON). `python3 tools/build_data.py` genera los JSON que lee la web y los CSV de `data/csv/` (necesita numpy para el mapa). Los textos de Aprender y de Pensar y aplicar están en `tools/aprender_src.py` y `tools/pensar_src.py`.
- Tu cuaderno, tus marcas y el tema se guardan solo en tu navegador (`localStorage`). Sin cookies, analítica ni llamadas a terceros.
- Web hermana: [PostLab](https://oasa10.github.io/PostLab/).

## Licencias

Datos y textos: [CC BY 4.0](data/LICENCIA.md). Código: [MIT](LICENSE). Tipografías Inter y Fraunces: SIL Open Font License.

## Errores

Abre una incidencia en este repositorio; cada ficha tiene su enlace «Avísanos». Si propones una corrección, añade una fuente.
