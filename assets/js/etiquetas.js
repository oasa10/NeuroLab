// El orden por etiqueta (L6): once etiquetas; para qué se usa cada una (IDEAR) y qué prueba pide ese uso;
// alrededor, quién la nombró, dónde se fija y con qué se piensa. Las 129 fichas no cambian: se ordenan.
export const ETIQUETAS = [
  { id: 'tdah', corto: 'TDAH', una: 'Atención, actividad e impulsividad que pesan en la vida diaria.' },
  { id: 'autismo', corto: 'Autismo', una: 'Otra manera de comunicarse y de relacionarse, con intereses intensos, en un espectro.' },
  { id: 'altas-capacidades', corto: 'Altas capacidades', una: 'Una etiqueta educativa para capacidades muy por encima de la media.' },
  { id: 'dislexia', corto: 'Dislexia', una: 'Dificultad específica y persistente para leer palabras con soltura.' },
  { id: 'tdl', corto: 'TDL', una: 'Dificultades persistentes para comprender o usar el lenguaje.' },
  { id: 'discalculia', corto: 'Discalculia', una: 'Dificultad específica y persistente para aprender aritmética.' },
  { id: 'tdc', corto: 'Dispraxia (TDC)', una: 'Dificultad para aprender y hacer movimientos coordinados.' },
  { id: 'tourette', corto: 'Tourette y tics', una: 'Movimientos o sonidos repentinos que se repiten.' },
  { id: 'discapacidad-intelectual', corto: 'Discapacidad intelectual', una: 'Limitaciones en el funcionamiento intelectual y en la vida diaria, desde la infancia.' },
  { id: 'sindrome-asperger', corto: 'Asperger', una: 'Un nombre que los manuales retiraron y que mucha gente sigue usando para reconocerse.' },
  { id: 'trastornos-neurodesarrollo', corto: 'Trastornos del neurodesarrollo', una: 'El grupo que las reúne en los manuales desde 2013.' },
];
export const POR_ID = new Map(ETIQUETAS.map(e => [e.id, e]));

export const ALREDEDOR = [
  { k: 'quien', titulo: 'Quién la nombró', d: 'Las personas que la describieron, la discutieron o la cambiaron.', tipos: ['persona'] },
  { k: 'donde', titulo: 'Dónde se fija', d: 'Los manuales, las leyes, las instituciones y los movimientos que la definen o la usan.', tipos: ['documento', 'institucion', 'movimiento'] },
  { k: 'con', titulo: 'Con qué se piensa', d: 'Las ideas que hacen falta para usarla bien, y los saltos que conviene evitar.', tipos: ['concepto'] },
  { k: 'vecinas', titulo: 'Etiquetas vecinas', d: 'Con las que comparte frontera, historia o grupo.', tipos: ['categoria'] },
];

// Las fichas que rodean a una etiqueta, agrupadas
export function alrededor(ctx, id) {
  const vec = [...(ctx.vecinos.get(id) || [])].map(x => ctx.byId.get(x)).filter(Boolean)
    .sort((a, b) => (a.anio ?? 9999) - (b.anio ?? 9999) || a.lema.localeCompare(b.lema, 'es'));
  return ALREDEDOR.map(g => ({ ...g, fichas: vec.filter(t => g.tipos.includes(t.tipo)) }));
}

// Las fichas de una etiqueta: ella misma y las que la rodean
export function fichasDe(ctx, id) {
  return new Set([id, ...(ctx.vecinos.get(id) || [])]);
}

// Las que no cuelgan de ninguna etiqueta: valen para todas
export function transversales(ctx) {
  const ya = new Set();
  for (const e of ETIQUETAS) for (const x of fichasDe(ctx, e.id)) ya.add(x);
  return ctx.terms.filter(t => !ya.has(t.id));
}
