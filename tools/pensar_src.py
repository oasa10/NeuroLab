"""Fuente del contenido de la sección Pensar y aplicar de NeuroLab. Genera data/pensar.json.

Uso: python3 tools/pensar_src.py

Las actividades usan también lib.SEIS (las seis preguntas), lib.SALTOS (los saltos de inferencia),
lib.USOS (IDEAR) y metodo.js (rutas, recorrido, paso mínimo y transversales): aquí solo va el texto propio.
Los «termino» son id de la lista maestra; si una ficha no existe, la actividad no enlaza y sigue funcionando.
"""
import json, os
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Las siete actividades. «sube» = puntos que cada una suma en el cuaderno (lo que pasa a cuaderno.entrada)
actividades = [
  {"id": "termometro", "n": "El termómetro", "ejes": ["ser", "saber"], "min": 5, "sube": {"ser": 6, "saber": 2},
   "d": "Elige un término o una situación y sepáralo en tres: qué sientes, qué te sale hacer y qué piensas cuando te paras."},
  {"id": "laboratorio", "n": "Laboratorio de las seis preguntas", "ejes": ["saber", "hacer"], "min": 10, "sube": {"saber": 6, "hacer": 4},
   "d": "Una etiqueta, un uso y seis preguntas. Después comparas tus respuestas con las de NeuroLab."},
  {"id": "caza", "n": "Cazadores de saltos", "ejes": ["hacer", "saber"], "min": 10, "sube": {"hacer": 6, "saber": 3},
   "d": "Sal ahí fuera y caza tres saltos de inferencia en titulares, conversaciones o redes. Y di cómo lo dirías mejor."},
  {"id": "situaciones", "n": "¿Y tú qué harías?", "ejes": ["hacer", "ser"], "min": 10, "sube": {"hacer": 4, "crear": 2},
   "d": "Seis escenas reales (familia, aula, consulta, trabajo, redes y amistad) en las que alguien da un salto. Elige tu respuesta; si te atreves, con reloj."},
  {"id": "ciclo", "n": "De la etiqueta al ciclo", "ejes": ["crear", "ser"], "min": 8, "sube": {"crear": 6, "ser": 3, "saber": 2},
   "d": "Convierte una frase-etiqueta («es que es TDAH») en un ciclo que se puede cambiar: situación, lo que siente, lo que hace, consecuencia y qué lo cambia."},
  {"id": "relato", "n": "Tu relato", "ejes": ["crear", "ser"], "min": 15, "sube": {"crear": 6},
   "d": "Escribe lo que crees sobre los diagnósticos de hoy, reencuádralo, añade lo que faltaba y cuéntalo de nuevo. Al final, compara tu antes y tu después."},
  {"id": "paso", "n": "Tu paso mínimo y tu retorno", "ejes": ["hacer", "crear"], "min": 3, "sube": {"hacer": 6, "crear": 2},
   "d": "Un paso pequeño fuera de la pantalla, con día y forma de comprobarlo. Y la vuelta: ¿qué cambió fuera de tu explicación?"},
]

# Qué actividades convienen más según cómo llegas hoy (metodo.RUTAS)
rutas = {
  "A": {"ids": ["laboratorio", "relato", "caza"], "por": "Con calma y con ganas puedes ir a fondo: analizar una etiqueta, escribir tu relato o salir a cazar saltos. Cuida el ritmo para no quemarte."},
  "B": {"ids": ["situaciones", "paso", "termometro"], "por": "Sin mucha energía, mejor algo corto y concreto: una situación de dos minutos o un solo paso. Dos minutos cuentan."},
  "C": {"ids": ["termometro", "paso", "ciclo"], "por": "Con la cabeza a mil, más lectura no ayuda: tómate la temperatura, elige un solo paso o convierte en un ciclo la etiqueta que te ronda."},
}

# El recorrido de cinco pasos (metodo.RECORRIDO), contado con un caso
recorrido = {
  "titulo": "Un ejemplo: la nota de la tutora",
  "pasos": [
    "La tutora dice que Leo, de 7 años, «no para quieto» en clase. Su madre nota inquietud (siente), le sale buscar «síntomas de TDAH» a medianoche (actúa) y, cuando se para, piensa que quizá se está adelantando (piensa).",
    "¿Qué sabe de verdad? Que Leo se mueve en clase. No sabe cuándo, ni con qué tareas, ni si pasa también en casa. Elige una sola pregunta: ¿en qué momentos le pasa?",
    "Su paso mínimo: «Haré una tutoría con su profesora, el jueves, durante media hora, y comprobaré si apuntamos tres momentos concretos».",
    "Va a la tutoría. Resulta que pasa sobre todo en la última hora y con las tareas largas. Lo observan dos semanas.",
    "Algo ha cambiado fuera de la explicación: ya no lee foros de madrugada y en clase prueban pausas cortas. Lo revisarán en un mes y, si sigue costando, lo hablarán con su pediatra.",
  ],
}

termometro = {
  "ideas": [
    "La tutora me dice que mi hijo «no para quieto».",
    "Leo un titular: «Los diagnósticos de autismo se disparan».",
    "Un compañero dice que el TDAH es una excusa para no trabajar.",
    "Me veo en un vídeo de «señales de que eres autista».",
    "En la reunión de familias alguien dice que las altas capacidades son cosa de padres pesados.",
  ],
  "emociones": [["curiosidad", "Curiosidad"], ["alivio", "Alivio"], ["preocupacion", "Preocupación"], ["miedo", "Miedo"], ["enfado", "Enfado"],
                ["culpa", "Culpa"], ["tristeza", "Tristeza"], ["verguenza", "Vergüenza"], ["esperanza", "Esperanza"], ["cansancio", "Cansancio"],
                ["rechazo", "Rechazo"], ["confusion", "Confusión"], ["indiferencia", "Indiferencia"]],
  "cuerpo": [["pecho", "En el pecho"], ["estomago", "En el estómago"], ["garganta", "En la garganta"], ["cabeza", "En la cabeza"], ["hombros", "En los hombros"],
             ["manos", "En las manos"], ["nada", "No lo noto"]],
  "acciones": [["buscar", "Seguir buscando información"], ["compartir", "Compartirlo tal cual"], ["rebatir", "Rebatirlo"], ["defender", "Defenderme o defender a alguien"],
               ["quitar", "Quitarle importancia"], ["callar", "Callarme o cambiar de tema"], ["broma", "Hacer una broma"], ["preguntar", "Preguntar a alguien de confianza"],
               ["cerrar", "Cerrarlo y no pensar en ello"]],
  "pensar": [
    {"k": "se", "l": "¿Qué sé de verdad?", "ayuda": "Lo que podrías comprobar o explicar con una fuente. Si es poco, también vale: es un dato."},
    {"k": "supongo", "l": "¿Qué estoy suponiendo?", "ayuda": "Lo que das por hecho porque encaja con lo que ya pensabas, o porque da miedo."},
    {"k": "pregunta", "l": "Si solo pudiera hacer una pregunta, ¿cuál sería?", "ayuda": "Una sola. Por ejemplo: «¿para qué se usa aquí la etiqueta?»."},
    {"k": "haria", "l": "Pensándolo, ¿qué haría?", "ayuda": "Una acción pequeña que puedas hacer de verdad."},
  ],
  "lecturas": {
    "sentir": {"t": "Va delante lo que sientes", "pista": "Es lo más habitual: primero sentimos. No es un fallo, es información. La pista: antes de decidir nada, ponle nombre a lo que sientes y dale un minuto. Nombrarlo ya es empezar a separarlo de lo que haces."},
    "actuar": {"t": "Va delante lo que te sale hacer", "pista": "El impulso de hacer algo ya (buscar, contestar, compartir) empuja más que lo demás. La pista: mete una pausa entre el impulso y el gesto. Diez segundos o una pregunta («¿para qué lo haría?») bastan para que decidas tú y no el reflejo."},
    "pensar": {"t": "Va delante lo que piensas", "pista": "Has llegado a pensar con bastante claridad. La pista: que pensar no se convierta en dar vueltas. Elige una sola pregunta y un paso pequeño, y deja el resto para otro día."},
    "empate": {"t": "Van a la par", "pista": "Ninguno se impone claramente. La pista: fíjate en cuál te ha costado más rellenar; suele ser el que menos atiendes."},
  },
}

# Guía por uso: lo que cada uso suele pedir a cada una de las seis preguntas (para comparar casos propios)
guia = {
  "I": {
    "define": "Un grupo con un criterio operativo: qué rasgos o puntuaciones cuentan para entrar en la muestra y cuáles no.",
    "identifica": "Con pruebas estandarizadas, cuestionarios o registros, y un punto de corte que el estudio declara.",
    "aplica": "A la muestra estudiada: su edad, su país, su lengua, cómo se reclutó. Fuera de ahí, con cautela.",
    "habilita": "Comparar grupos, estimar cuántos hay o buscar asociaciones. No decide nada sobre una persona concreta.",
    "consecuencias": "Conocimiento sobre grupos, que depende del corte y de la muestra. El salto típico: del grupo al individuo.",
    "revisa": "Otros equipos (revisión y réplica), quien reanaliza los datos y, cada vez más, las propias personas estudiadas.",
  },
  "D": {
    "define": "Un cuadro clínico con criterios: qué tiene que pasar, desde cuándo, en qué ámbitos y con qué grado de dificultad.",
    "identifica": "Una evaluación profesional: entrevista, historia, observación, pruebas e información de varios contextos, además del diagnóstico diferencial.",
    "aplica": "A esta persona, con su edad, su lengua y su historia. Las pruebas tienen que estar validadas para gente como ella.",
    "habilita": "Orientar la atención: explicar, acompañar, proponer o descartar intervenciones. Un tratamiento pide además beneficios, daños y alternativas.",
    "consecuencias": "Comprensión, alivio y acceso a apoyos; también riesgo de error en las dos direcciones y de que la etiqueta parezca explicarlo todo.",
    "revisa": "La persona y su familia (con derecho a otra opinión), el equipo profesional y las revisiones periódicas del diagnóstico.",
  },
  "E": {
    "define": "Una necesidad de apoyo para aprender: qué le cuesta, en qué tareas y con qué barreras del entorno.",
    "identifica": "Observación en el aula, evaluación psicopedagógica y lo que cuentan el alumno y su familia. No siempre hace falta un diagnóstico.",
    "aplica": "A este alumno, en este centro y en este curso. Las reglas cambian según la comunidad autónoma.",
    "habilita": "Apoyos y ajustes: tiempo, formato, materiales, agrupamientos, refuerzo o enriquecimiento.",
    "consecuencias": "Que aprenda mejor, o no: hay que mirarlo. También expectativas que cambian con la etiqueta, para bien o para mal.",
    "revisa": "El equipo docente y de orientación, la familia, el propio alumno y la inspección educativa si hay desacuerdo.",
  },
  "A": {
    "define": "Una condición de elegibilidad: quién tiene derecho a un recurso, una adaptación o una prestación.",
    "identifica": "Con la documentación que pide la regla (informe, dictamen, certificado) y con quien la valida.",
    "aplica": "A quien cumple la regla. Importa quién se queda fuera aunque lo necesite y quién entra sin necesitarlo.",
    "habilita": "Un derecho o un recurso concreto: más tiempo, una plaza, una ayuda, un ajuste en el puesto.",
    "consecuencias": "Un reparto de recursos con efectos reales. Los incentivos existen, pero un incentivo no prueba una trampa.",
    "revisa": "El órgano que decide, con una vía de reclamación; y quien evalúa si la regla reparte bien.",
  },
  "R": {
    "define": "Una identidad: una manera de entenderse y de nombrar una experiencia compartida.",
    "identifica": "Por autoadscripción: se reconoce quien se reconoce. Puede apoyarse en un diagnóstico o no.",
    "aplica": "A quien la adopta para sí. No se impone a otros ni se le retira a nadie desde fuera.",
    "habilita": "Pertenencia, comunidad y palabras para explicarse y pedir lo que necesitas.",
    "consecuencias": "Alivio y comunidad; a veces también exposición o sospecha. No confirma un diagnóstico ni lo sustituye.",
    "revisa": "La propia persona y su comunidad. Si se quiere pasar a otro uso (diagnóstico, derechos), ese uso pide su propia prueba.",
  },
}

# Seis casos preparados con su respuesta modelo
casos = [
  {"id": "examen", "termino": "tdah", "uso": "A", "titulo": "«TDAH» para tener más tiempo en un examen",
   "situacion": "Nerea tiene un diagnóstico de TDAH y va a presentarse a la prueba de acceso a la universidad. Pide más tiempo para hacer los exámenes.",
   "salto": "trampa",
   "modelo": {
     "define": "No «el TDAH» entero, sino una necesidad concreta: la dificultad para sostener la atención y gestionar el tiempo bajo presión, que puede hacer que la prueba mida su velocidad y no lo que sabe.",
     "identifica": "Con la documentación que pide quien organiza la prueba: un informe clínico o psicopedagógico. Cada universidad o comunidad fija qué acepta y en qué plazo.",
     "aplica": "A quien acredita esa necesidad, persona a persona: no todas las personas con TDAH necesitan lo mismo, ni solo ellas pueden necesitarlo.",
     "habilita": "Una adaptación de la forma (más tiempo, pausas, un aula con menos distracciones), no del contenido ni de la nota que se exige.",
     "consecuencias": "Si funciona, el examen mide mejor lo que sabe. Riesgos: que se quede fuera quien no tiene informe, porque evaluarse cuesta tiempo y dinero, y la sospecha de trampa sin pruebas.",
     "revisa": "El órgano que organiza la prueba, con vía de reclamación. Y, a escala general, quien comprueba si la regla llega a quien lo necesita.",
   },
   "clave": "Para acceder hace falta una regla clara y revisable, no sospechar de quien la usa. La pregunta útil es si la adaptación compensa una dificultad real sin cambiar lo que se evalúa."},
  {"id": "enriquecimiento", "termino": "altas-capacidades", "uso": "E", "titulo": "«Altas capacidades» para entrar en un programa de enriquecimiento",
   "situacion": "El instituto de Hugo, de 12 años, ofrece un programa de enriquecimiento por las tardes. Su tutora cree que encajaría y propone evaluarle.",
   "salto": "grupo",
   "modelo": {
     "define": "Depende del modelo que use cada comunidad: capacidad intelectual alta, creatividad, implicación en la tarea, talento en un ámbito… La palabra no significa lo mismo en todas partes.",
     "identifica": "Con una evaluación psicopedagógica del equipo de orientación, que suele combinar pruebas de capacidad, información de docentes y familia y observación. Criterios y puntos de corte cambian según la comunidad autónoma.",
     "aplica": "Al alumnado identificado con esos criterios. Ojo a quien suele quedarse fuera: chicas, alumnado de entornos con menos recursos o con otra dificultad que tapa la capacidad (doble excepcionalidad).",
     "habilita": "Una plaza en el programa y, si hace falta, ajustes en clase (ampliación, flexibilización). No dice qué actividades le convienen: eso se decide con él.",
     "consecuencias": "Bien hecho, más reto y más ganas. Mal hecho, expectativas que pesan, comparaciones y la idea de que «aburrirse» lo explica todo.",
     "revisa": "El equipo de orientación y el docente, con seguimiento; la familia y el propio Hugo pueden pedir revisión; la inspección educativa si hay desacuerdo.",
   },
   "clave": "Para educar, la etiqueta vale si orienta un apoyo útil para este alumno. Lo que se dice del grupo («se aburren en clase») no dice qué le pasa a Hugo."},
  {"id": "perfil", "termino": "autismo", "uso": "R", "titulo": "«Autista» en un perfil de redes",
   "situacion": "Sara, de 24 años, escribe en su perfil: «Autista. Hablo de lo que me costó entenderme». No tiene un diagnóstico formal.",
   "salto": "auto",
   "modelo": {
     "define": "Una identidad: una manera de entenderse y de explicar una forma de percibir, relacionarse o procesar. No afirma que haya un diagnóstico.",
     "identifica": "Por autoadscripción: Sara se reconoce, quizá después de leer, escuchar a otras personas autistas y repasar su historia.",
     "aplica": "A ella misma. No se la aplica a quien la sigue, y nadie tiene que aplicársela o quitársela desde fuera.",
     "habilita": "Pertenencia, comunidad y palabras para contar su experiencia y pedir cómo quiere que la traten. No abre derechos formales: eso es otro uso.",
     "consecuencias": "Alivio, encontrar a gente parecida, entenderse mejor. También comentarios que hablan de «moda» y la tentación de leer cualquier rasgo como prueba.",
     "revisa": "Ella, que puede cambiar cómo se nombra, y su comunidad. Nadie en redes puede confirmarlo ni desmentirlo; si quisiera un apoyo formal, ese uso pide una evaluación.",
   },
   "clave": "Reconocerse pide claridad y respeto, no un informe. Pero no sustituye a una evaluación: si Sara pidiera un apoyo formal, ese otro uso le pediría su propia prueba."},
  {"id": "investigacion", "termino": "dislexia", "uso": "I", "titulo": "«Dislexia» en una investigación",
   "situacion": "Un equipo universitario estudia si los niños con dislexia leen más despacio las palabras largas. Selecciona a 120 niños de primaria con pruebas de lectura.",
   "salto": "grupo",
   "modelo": {
     "define": "Un grupo con un criterio operativo: dificultades persistentes en la lectura precisa o fluida, medidas con pruebas concretas.",
     "identifica": "Con pruebas estandarizadas de lectura y un punto de corte que el estudio declara (por ejemplo, un percentil), además de criterios de exclusión.",
     "aplica": "A esta muestra: su edad, su lengua y sus colegios. En español, de ortografía muy regular, la dislexia suele notarse más en la lentitud que en los errores, así que no todo resultado viaja desde otras lenguas.",
     "habilita": "Comparar el grupo con otros y proponer explicaciones. No diagnostica a ningún niño ni decide sus apoyos.",
     "consecuencias": "Conocimiento sobre el grupo, que cambia si cambia el punto de corte. El riesgo: leer el promedio como el retrato de cada niño con dislexia.",
     "revisa": "La revisión por pares, otros equipos que repiten el estudio, quien reanaliza los datos y las familias y personas con dislexia que participan.",
   },
   "clave": "En investigación, la etiqueta es un criterio de selección: hay que decir cuál, porque cambiar el corte cambia el grupo. Y lo que vale para el grupo no dice cómo lee cada niño."},
  {"id": "logopedia", "termino": "tdl", "uso": "D", "titulo": "«Trastorno del desarrollo del lenguaje» en un informe de logopedia",
   "situacion": "Tras varias sesiones, la logopeda escribe en el informe de Mateo, de 5 años: «Compatible con un trastorno del desarrollo del lenguaje». En casa, la familia habla español y rumano.",
   "salto": "rasgo",
   "modelo": {
     "define": "Dificultades del lenguaje que persisten, afectan a la vida diaria o al aprendizaje y no se explican mejor por otra condición, como una pérdida auditiva.",
     "identifica": "Con una evaluación logopédica: pruebas estandarizadas, muestras de habla espontánea, la historia del desarrollo y lo que cuentan la familia y la escuela. Se descartan otras explicaciones.",
     "aplica": "A Mateo, en sus dos lenguas. Si solo se mira el español, se puede confundir el aprendizaje de una segunda lengua con un trastorno: el TDL se nota también en la lengua de casa.",
     "habilita": "Orientar la intervención logopédica, coordinar apoyos en el aula y explicar a la familia qué pasa (y que no es culpa de nadie).",
     "consecuencias": "Apoyo a tiempo en lugar de «ya hablará». También la posibilidad de error en las dos direcciones: por eso «compatible con» invita a seguir mirando.",
     "revisa": "La familia, que puede pedir otra opinión; la propia logopeda, en revisiones periódicas; y el equipo del colegio con el que se coordina.",
   },
   "clave": "El informe orienta la atención de Mateo. Vale si explica cómo se llegó a él, si se miraron sus dos lenguas y si dice qué apoyos propone y cuándo se revisa."},
  {"id": "identidad", "termino": "audhd", "uso": "R", "titulo": "«AuDHD» como identidad",
   "situacion": "En un foro, Álex se presenta así: «Soy AuDHD». Tiene un diagnóstico de autismo desde niño y otro de TDAH desde hace un año.",
   "salto": "nueva",
   "modelo": {
     "define": "Una palabra de la comunidad para la experiencia de vivir con autismo y TDAH a la vez. No está en el DSM ni en la CIE: no es un diagnóstico.",
     "identifica": "Por autoadscripción. En el caso de Álex se apoya en dos diagnósticos; otras personas la usan sin ellos.",
     "aplica": "A quien la adopta para sí. No convierte en «AuDHD» a todas las personas con los dos diagnósticos si no quieren llamarse así.",
     "habilita": "Pertenencia y un lenguaje compartido para explicar cómo se combinan las dos cosas en el día a día.",
     "consecuencias": "Alivio y comunidad. El riesgo es el salto de la coexistencia a una entidad nueva: leer la palabra como si probara un tercer trastorno.",
     "revisa": "Álex y su comunidad, que deciden cómo nombrarse. Si alguien propusiera AuDHD como categoría clínica, tendría que demostrar que se distingue de sus partes y que nombrarla aporta algo.",
   },
   "sabias": "Hasta el DSM-5, publicado en 2013, el manual no permitía diagnosticar a la vez autismo y TDAH. Desde entonces se pueden diagnosticar juntos.",
   "clave": "Como palabra de comunidad, AuDHD da nombre a una experiencia compartida. Lo que no hace es crear un tercer diagnóstico."},
]

caza = {
  "lugares": [["titular", "Un titular"], ["redes", "Redes sociales"], ["conversacion", "Una conversación"], ["aula", "El aula o el trabajo"],
              ["consulta", "Una consulta o un informe"], ["anuncio", "Un anuncio o un producto"], ["otro", "Otro sitio"]],
  "misiones": [
    {"n": "Primera presa", "d": "Caza un salto en cualquier sitio y anótalo."},
    {"n": "Cambio de terreno", "d": "Caza otro en un sitio distinto del primero."},
    {"n": "Ojo fino", "d": "Caza un tipo de salto que aún no tengas."},
  ],
  "practica": [
    {"frase": "«Un estudio relaciona dormir poco con el TDAH: acuéstalos antes y se acabó el problema.»", "salto": "causa",
     "por": "Que dos cosas vayan juntas no dice cuál causa cuál, ni si las causa una tercera. Y aunque dormir mejor ayude, eso no prueba que el sueño fuera la causa."},
    {"frase": "«Los diagnósticos de autismo se han multiplicado: está claro que es una moda.»", "salto": "moda",
     "por": "Un aumento puede deberse a mejor detección, a criterios más amplios o a un cambio real. Hay que separar las tres cosas antes de concluir nada."},
    {"frase": "«Las niñas con TDAH sacan peores notas de media; tu hija tiene TDAH, así que sacará malas notas.»", "salto": "grupo",
     "por": "Un promedio describe a un grupo, no a cada persona. Muchas niñas con TDAH sacan buenas notas, y el promedio no dice cuál será el caso de tu hija."},
  ],
  "nota": "Se cazan frases, no personas: no hace falta apuntar quién lo dijo, y la caza no consiste en reírse de nadie. Todos damos saltos; la gracia está en verlos.",
}

situaciones = [
  {"id": "foros", "ambito": "Familia", "titulo": "Una noche de foros", "termino": "tdah", "salto": "rasgo",
   "escena": "Son las dos de la mañana. Marta lleva desde la cena leyendo foros porque la tutora le ha dicho que Leo, su hijo de 7 años, «no para quieto». Te escribe por WhatsApp:",
   "dialogo": [["Marta", "Lo he leído todo. Es TDAH clarísimo: tiene nueve de los diez síntomas. Mañana pido que le den medicación."]],
   "pregunta": "¿Qué le contestas?",
   "ruta": "C", "ruta_t": "Marta llega con la cabeza a mil. En la ruta de gestión, más información no ayuda: primero parar y nombrar lo que siente; después, una sola pregunta y un paso pequeño.",
   "opciones": [
     {"t": "«Si lo tienes tan claro, cuanto antes mejor.»", "ok": False,
      "fb": "Das por buenos dos saltos a la vez: del rasgo al diagnóstico (moverse en clase no es tener TDAH) y del diagnóstico al tratamiento (un tratamiento pide una evaluación y valorar beneficios, daños y alternativas con su pediatra)."},
     {"t": "«Eso del TDAH es una moda. Leo es un niño, y los niños se mueven.»", "ok": False,
      "fb": "Quieres tranquilizarla, pero caes en el otro error: dejar fuera a quien quizá necesite apoyo. Y das otro salto: que haya más diagnósticos no demuestra que sobren."},
     {"t": "«Se nota que estás agotada. Esta noche no hace falta decidir nada. ¿Qué te dijo exactamente la tutora? Mañana podrías pedirle una tutoría y, si sigues preocupada, hablarlo con su pediatra.»", "ok": True,
      "fb": "Primero, lo que siente; luego, una sola pregunta concreta y un paso pequeño con personas que conocen a Leo. No niegas la preocupación ni confirmas el diagnóstico: llevas la decisión a quien puede evaluar."},
     {"t": "Le mandas cinco artículos más para que se informe bien.", "ok": False,
      "fb": "Con buena intención, pero a las dos de la mañana y con la cabeza a mil, más lectura suele dar más angustia, no más claridad. Lo que ayuda ahora es parar, no acumular."},
   ]},
  {"id": "aburre", "ambito": "Aula", "titulo": "El que se aburre", "termino": "altas-capacidades", "salto": "cosa",
   "escena": "En la sala de profesores, un compañero comenta el caso de Lucas, de 2.º de ESO, que hace meses que no entrega los deberes.",
   "dialogo": [["Un compañero", "Lucas tiene altas capacidades, ya lo sabemos. No hace los deberes porque se aburre. No hay nada que hacer."]],
   "pregunta": "Eres su tutora. ¿Qué dices?",
   "ruta": None, "ruta_t": "",
   "opciones": [
     {"t": "«Claro. Habrá que darle más nivel y ya está.»", "ok": False,
      "fb": "Puede que más reto le ayude, pero lo das por hecho: conviertes la etiqueta en la explicación de todo. «Se aburre porque tiene altas capacidades» nombra, no explica."},
     {"t": "«Si suspende, es que no tiene altas capacidades. Alguien se equivocó.»", "ok": False,
      "fb": "Es el salto contrario. Capacidad y rendimiento no son lo mismo, y a veces otra dificultad tapa la capacidad (doble excepcionalidad). Quitarle la etiqueta de un plumazo es otra forma de dejarle fuera."},
     {"t": "«Puede que se aburra, o puede que haya otra cosa. ¿Cuándo deja de hacerlos, con qué tareas y desde cuándo? Describamos qué pasa y hablemos con orientación y con él.»", "ok": True,
      "fb": "Cambias la etiqueta por un ciclo: situación, lo que siente, lo que hace y qué pasa después. Así aparecen cosas que se pueden cambiar. Y cuentas con Lucas, que sabe cosas que no están en su expediente."},
   ]},
  {"id": "test", "ambito": "Consulta", "titulo": "El test de internet", "termino": "autodiagnostico", "salto": "auto",
   "escena": "Trabajas en un centro de salud. Entra Iván, de 19 años, con el móvil en la mano.",
   "dialogo": [["Iván", "He hecho un test en internet y me sale un 92 % de autismo. Llevo toda la vida sintiéndome distinto. Solo necesito que me lo pongas en el informe."]],
   "pregunta": "¿Qué le respondes?",
   "ruta": None, "ruta_t": "",
   "opciones": [
     {"t": "«Si el test lo dice, te lo apunto.»", "ok": False,
      "fb": "Es el salto de la autoadscripción a la confirmación. Un cuestionario en internet puede ser un buen punto de partida, pero no es una evaluación: no mira su historia, ni otros contextos, ni otras explicaciones posibles."},
     {"t": "«Esos tests no valen para nada. Seguro que no es eso.»", "ok": False,
      "fb": "Descartas el test y, de paso, su experiencia. Iván lleva años sintiéndose distinto, y eso merece atención. Cerrar la puerta es el error de dejar fuera a quien puede necesitar apoyo."},
     {"t": "«Me interesa lo que te ha hecho reconocerte. El test no basta para un diagnóstico, pero lo que cuentas puede merecer una evaluación. ¿Qué te cuesta en tu día a día? Veamos cómo derivarte.»", "ok": True,
      "fb": "Tomas en serio su experiencia sin convertir el test en un diagnóstico. Separas los usos: reconocerse es cosa suya; diagnosticar pide una evaluación, y la pones en marcha."},
   ]},
  {"id": "auriculares", "ambito": "Trabajo", "titulo": "Los auriculares de Ana", "termino": "ajustes-razonables", "salto": "trampa",
   "escena": "Ana, que tiene un diagnóstico de TDAH, ha pedido trabajar con auriculares que aíslan del ruido y recibir por escrito los acuerdos de las reuniones. En la reunión de coordinación, un responsable de equipo levanta la mano.",
   "dialogo": [["Un responsable", "Si se lo damos a ella, mañana todo el mundo dirá que tiene TDAH para pedir privilegios."]],
   "pregunta": "Te toca hablar. ¿Qué propones?",
   "ruta": None, "ruta_t": "",
   "opciones": [
     {"t": "«Tiene razón: mejor no abrir esa puerta.»", "ok": False,
      "fb": "Es el salto del incentivo a la trampa. Que una medida pueda atraer a más gente no prueba que se vaya a usar mal. Y negar un ajuste sencillo deja fuera a quien sí lo necesita."},
     {"t": "«¿Tenemos algún dato de que alguien abuse? Lo que pide cuesta poco y puede servir a más gente. Probémoslo un mes y revisemos si funciona.»", "ok": True,
      "fb": "Pides pruebas en vez de sospechas, valoras el coste y propones una revisión. Además, los acuerdos por escrito y menos ruido suelen ayudar a todo el equipo: el ajuste no tiene por qué ser un privilegio."},
     {"t": "«Si tiene un diagnóstico, hay que darle todo lo que pida, sin más preguntas.»", "ok": False,
      "fb": "Te vas al otro extremo. Para acceder a un ajuste hacen falta reglas claras y revisables: qué se pide, para qué y cómo saber si sirve. El diagnóstico no lo justifica todo automáticamente."},
   ]},
  {"id": "senales", "ambito": "Redes", "titulo": "Diez señales", "termino": "redes-sociales", "salto": "rasgo",
   "escena": "Un vídeo con millones de visitas: «10 señales de que eres autista y no lo sabes». Algunas: odiar las llamadas, perder las llaves, necesitar ratos a solas. Tu primo lo comparte en el grupo de la familia.",
   "dialogo": [["Tu primo", "Me pasan ocho de diez. Lo sabía."]],
   "pregunta": "¿Qué haces?",
   "ruta": "B", "ruta_t": "Si llegas sin mucha energía, no hace falta ganar ningún debate: un mensaje breve y amable vale más que un hilo de veinte respuestas. Algo pequeño y concreto.",
   "opciones": [
     {"t": "Respondes en el grupo: «Pues entonces todos somos autistas».", "ok": False,
      "fb": "La broma deja en evidencia a tu primo y, de paso, trivializa una experiencia real de mucha gente. Además da otro salto: de que muchos se reconozcan a que sea una moda."},
     {"t": "Le escribes en privado: «Si te ves ahí, puede merecer la pena mirarlo con calma. Ojo: casi todo el mundo tiene alguna de esas señales; lo que cuenta es cuánto te cuestan en tu vida. ¿Lo hablamos?»", "ok": True,
      "fb": "Separas el rasgo del diagnóstico sin quitarle valor a lo que siente. En privado y con una pregunta, dejas la puerta abierta: a reconocerse, a informarse mejor o a pedir una evaluación si le hace falta."},
     {"t": "Lo compartes tú también: a ti te pasan seis.", "ok": False,
      "fb": "Te sale en automático: el vídeo engancha porque casi todos nos vemos en algo. Pero tener rasgos sueltos no es lo mismo que cumplir unos criterios ni que tener dificultades en la vida diaria."},
     {"t": "No dices nada: no es asunto tuyo.", "ok": False,
      "fb": "A veces es lo más prudente, y no pasa nada. Pero tenías algo útil y amable que decir, y en privado no habrías puesto a nadie en evidencia."},
   ]},
  {"id": "cena", "ambito": "Amistad", "titulo": "La cena de amigas", "termino": "inflacion-diagnostica", "salto": "moda",
   "escena": "En una cena, tu amiga Lucía cuenta que le han diagnosticado TDAH a los 34 años. Le ha costado decirlo. Antes de que termine, otra amiga la interrumpe.",
   "dialogo": [["Otra amiga", "Ahora a todo el mundo le diagnostican algo. Es la moda."]],
   "pregunta": "Lucía se queda callada. ¿Qué haces tú?",
   "ruta": "A", "ruta_t": "Si llegas con calma, tienes margen para algo más que callar o atacar: separar lo que explica el aumento y devolverle la palabra a Lucía. Es la ruta de cuidado: cuidar la conversación también cuenta.",
   "opciones": [
     {"t": "Te ríes para que no haya tensión.", "ok": False,
      "fb": "Se entiende: la tensión en una cena incomoda. Pero Lucía acaba de contar algo importante y se queda sola. Y la frase da un salto que conviene no dejar pasar sin más."},
     {"t": "«Que haya más diagnósticos no demuestra que sobren: antes se evaluaba mucho menos a adultos y a mujeres. Lucía, ¿cómo estás tú con esto?»", "ok": True,
      "fb": "Separas lo que puede explicar el aumento (mejor detección, criterios nuevos, cambios reales) de la conclusión «es una moda». Y devuelves la palabra a quien la tenía: Lucía."},
     {"t": "«Moda es lo tuyo, que opinas de todo sin saber.»", "ok": False,
      "fb": "Te sale defender a Lucía, y es comprensible. Pero atacar a la otra persona convierte la cena en una pelea, y nadie piensa mejor después."},
   ]},
]

ciclo = {
  "frases": ["«Es que es TDAH.»", "«Soy muy autista para esto.»", "«Tiene altas capacidades, se aburre.»", "«Es disléxico: no le pidas que lea en voz alta.»", "«Es que es muy vago.»"],
  "campos": [
    {"k": "situacion", "n": "Situación", "q": "¿Cuándo, dónde y con quién pasa?", "ph": "Por ejemplo: en los deberes de mates, después de cenar"},
    {"k": "siente", "n": "Lo que siente", "q": "¿Qué se siente en ese momento?", "ph": "Agobio, aburrimiento, ruido, cansancio…"},
    {"k": "hace", "n": "Lo que hace", "q": "¿Qué se hace, casi sin pensarlo?", "ph": "Se levanta, se bloquea, discute, lo deja…"},
    {"k": "consecuencia", "n": "Consecuencia", "q": "¿Qué pasa justo después? ¿Por qué vuelve a empezar?", "ph": "Discusión, la tarea se alarga, al día siguiente igual…"},
    {"k": "cambia", "n": "Qué lo cambia", "q": "¿Qué pequeño cambio en la situación rompería el ciclo?", "ph": "Partir la tarea, cambiar la hora, pactar una pausa…"},
  ],
  "ejemplo": {
    "frase": "«Es que es TDAH.»",
    "situacion": "Los deberes de mates, después de cenar, cuando ya está cansado.",
    "siente": "Agobio y aburrimiento: la tarea es larga y no ve el final.",
    "hace": "Se levanta, juega con el lápiz, pide agua tres veces.",
    "consecuencia": "Discutimos, la tarea dura una hora y al día siguiente nadie quiere empezar.",
    "cambia": "Hacerla antes de cenar, en trozos de diez minutos, con una pausa pactada.",
    "gana": "La etiqueta puede ser útil en la consulta, pero en casa no dice qué hacer. El ciclo, sí: señala la hora, el tamaño de la tarea y la pausa, que son cosas que se pueden cambiar.",
  },
}

creencias = [
  {"id": "cualquiera", "texto": "Hoy se diagnostica TDAH o autismo a casi cualquiera.", "termino": "sobrediagnostico"},
  {"id": "moda", "texto": "Si hay más diagnósticos que antes, es que se han puesto de moda.", "termino": "inflacion-diagnostica"},
  {"id": "explica", "texto": "Un diagnóstico explica por qué alguien se comporta como se comporta.", "termino": "reificacion"},
  {"id": "cerebro", "texto": "Si algo se ve en el cerebro, es que no se puede cambiar.", "termino": "neuroencanto"},
  {"id": "reconocerse", "texto": "Si alguien se reconoce autista, nadie tiene por qué confirmarlo.", "termino": "autoadscripcion"},
  {"id": "ventajas", "texto": "Mucha gente busca un diagnóstico para conseguir ventajas.", "termino": "incentivos"},
  {"id": "marca", "texto": "Ponerle una etiqueta a un niño le marca para siempre.", "termino": "efecto-expectativa"},
  {"id": "apoyo", "texto": "Para dar un apoyo en clase no hace falta un diagnóstico.", "termino": "neae"},
]

relato = {
  "intro": [["moda", "Las etiquetas son un invento para venderte algo."], ["cerebro", "Las etiquetas son el cerebro hablando. Punto."],
            ["uso", "¿Y tú qué crees? Antes de discutir, escríbelo. Luego lo miramos con calma."]],
  "pasos": [
    {"k": "reencuadre", "n": "Reencuadrar", "q": "Elige la afirmación de la que estabas más segura o más seguro y cámbiale la pregunta. En lugar de «¿es verdad?», prueba con «¿para qué uso?», «¿con qué prueba?» o «¿para quién?».",
     "ej": "Por ejemplo: en vez de «¿se diagnostica a cualquiera?», «¿qué ha cambiado en cómo y a quién se evalúa?»."},
    {"k": "contexto", "n": "Recontextualizar", "q": "Abre la ficha relacionada y apunta un dato o un contexto que no tenías en cuenta. ¿Qué faltaba en la foto?",
     "ej": "Por ejemplo: «No sabía que hasta 2013 el manual no permitía diagnosticar a la vez autismo y TDAH»."},
    {"k": "sentido", "n": "Resignificar", "q": "Con esa pieza nueva, ¿qué significa ahora para ti? ¿Qué harás distinto la próxima vez que oigas esa idea?",
     "ej": "Por ejemplo: «Cuando alguien diga “es una moda”, preguntaré qué uso de la etiqueta le preocupa»."},
  ],
  "crear": {
    "q": "Con lo que has reencuadrado, recontextualizado y resignificado, escribe lo que crees ahora sobre las etiquetas. Cinco líneas bastan: más informado, más realista y más tuyo que lo que traías.",
    "ph": "Puedes empezar por «Una etiqueta, para mí, es…»",
    "bolsillo": "Tu frase de bolsillo: una línea para recordarlo",
    "bolsillo_ej": "«Antes de discutir si es verdad, pregunto para qué se usa»",
  },
}

paso = {
  "sugerencias": {
    "A": ["Explicarle a alguien la diferencia entre diagnosticar y reconocerse, con un ejemplo",
          "Leer la ficha de una etiqueta que uso a menudo y comprobar una de sus fuentes",
          "Preguntar «¿para qué?» la próxima vez que oiga una etiqueta en una conversación"],
    "B": ["Leer una sola ficha, cinco minutos, y apuntar una idea",
          "Anotar una frase con etiqueta que oiga hoy, sin analizarla todavía",
          "Mandar un mensaje a alguien de confianza para hablar de lo que me preocupa"],
    "C": ["Escribir en un papel la única pregunta que más me preocupa y dejar de buscar por hoy",
          "Pedir una cita (tutoría, pediatra, médico de familia) en lugar de leer otro foro",
          "Caminar diez minutos antes de decidir nada"],
    "ninguna": ["Preguntar «¿para qué se usa aquí la etiqueta?» en la próxima conversación en que salga",
                "Leer una ficha y contarle a alguien una cosa que no sabía",
                "Apuntar durante una semana las frases con etiqueta que oiga"],
  },
  "decisiones": [["seguir", "Sigo"], ["ajustar", "Ajusto"], ["parar", "Paro"]],
}

json.dump({"actividades": actividades, "rutas": rutas, "recorrido": recorrido, "termometro": termometro, "guia": guia, "casos": casos,
           "caza": caza, "situaciones": situaciones, "ciclo": ciclo, "creencias": creencias, "relato": relato, "paso": paso},
          open(os.path.join(R, 'data', 'pensar.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('pensar.json:', len(actividades), 'actividades,', len(casos), 'casos,', len(situaciones), 'situaciones,', len(creencias), 'creencias')
