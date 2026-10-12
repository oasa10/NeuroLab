"""Convierte las fichas, los hitos y las series de data/fuente (la fuente de verdad) en los JSON que lee la web
y en los CSV que se pueden descargar y reutilizar (CC BY 4.0).

Uso: python3 tools/build_data.py   (desde la raíz del repositorio; necesita numpy para el mapa)
"""
import csv, glob, json, math, os

R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(R, 'data', 'fuente')
OUT = os.path.join(R, 'data')
CSV = os.path.join(OUT, 'csv')

FAMILIAS = ['Clasificar y medir', 'Neurodesarrollo', 'Coexistencias y fronteras', 'Altas capacidades y excepcionalidades',
            'Identidad y comunidad', 'Escuela, apoyos e instituciones', 'Cerebro, cuerpo y tratamiento', 'Saltos de inferencia']
USOS = 'IDEAR'
ESTADOS = {'verificada', 'probable', 'dudosa', 'propia'}


def fase(a):
    if a is None: return None
    return 0 if a < 1900 else 1 if a < 1980 else 2 if a < 1994 else 3 if a < 2013 else 4


def num(x):
    try: return int(x)
    except (TypeError, ValueError): return None


fichas = []
for f in sorted(glob.glob(os.path.join(SRC, 'fichas', '*.json'))):
    fichas += json.load(open(f, encoding='utf-8'))
vistos, terms, contenido, avisos = set(), [], [], []
for r in fichas:
    if r['id'] in vistos:
        avisos.append(f"repetida: {r['id']}"); continue
    vistos.add(r['id'])
    a = num(r.get('anio'))
    usos = [u for u in USOS if u in (r.get('usos') or [])]
    estado = r.get('estado') if r.get('estado') in ESTADOS else 'dudosa'
    if r.get('familia') not in FAMILIAS: avisos.append(f"familia rara en {r['id']}: {r.get('familia')}")
    terms.append({
        'id': r['id'], 'lema': r['lema'], 'variantes': r.get('variantes') or [], 'tipo': r.get('tipo') or 'concepto', 'familia': r.get('familia'),
        'anio': a, 'anioNota': r.get('anio_nota') or '', 'obra': r.get('obra') or '', 'figuras': r.get('figuras') or [],
        'definicion': r.get('definicion') or '', 'usos': usos, 'controversia': r.get('controversia') or '',
        'frase': r.get('frase') or '', 'veredicto': r.get('veredicto') if r.get('veredicto') in ('mito', 'matiz', 'cierto') else '',
        'matiz': r.get('matiz') or '', 'salto': r.get('salto') or '', 'relacionados': r.get('relacionados') or [],
        'fuentes': [x for x in (r.get('fuentes') or []) if x.get('titulo') or x.get('url')], 'estado': estado,
        'juego': bool(r.get('nucleo')) and estado in ('verificada', 'probable', 'propia'),
        'fase': fase(a), 'decada': None if a is None or a < 1900 else (a // 10) * 10,
    })
    contenido.append({'id': r['id'], 'contexto': r.get('contexto') or '', 'ejemplos': r.get('ejemplos') or [], 'implicaciones': r.get('implicaciones') or '',
                      'sabias_que': r.get('sabias') or '', 'pregunta': r.get('piensalo') or '', 'paso': r.get('paso') or ''})
ids = {t['id'] for t in terms}

# Relaciones: no dirigidas y sin repetir
rels, pares = [], set()
for t in terms:
    for d in t['relacionados']:
        if d == t['id']: continue
        if d not in ids: avisos.append(f"relacionado inexistente en {t['id']}: {d}"); continue
        k = tuple(sorted((t['id'], d)))
        if k in pares: continue
        pares.add(k); rels.append({'o': k[0], 'd': k[1], 't': 'rel'})
for t in terms: t['relacionados'] = [d for d in t['relacionados'] if d in ids and d != t['id']]

hitos = []
p = os.path.join(SRC, 'hitos.json')
if os.path.exists(p):
    for x in json.load(open(p, encoding='utf-8')):
        if not (x.get('fuente') or {}).get('url'):
            avisos.append(f"hito sin fuente (no se publica): {x.get('anio')} {x.get('titulo')}"); continue
        hitos.append({'anio': num(x.get('anio')), 'mes': num(x.get('mes')), 'titulo': x.get('titulo', ''), 'texto': x.get('texto', ''),
                      'tipo': x.get('tipo', 'sociedad'), 'ambito': x.get('ambito', 'internacional'),
                      'terminos': [i for i in (x.get('terminos') or []) if i in ids], 'fuente': x['fuente'], 'estado': x.get('estado', 'probable')})
    hitos.sort(key=lambda x: (x['anio'] or 0, x['mes'] or 0))
series = []
p = os.path.join(SRC, 'series.json')
if os.path.exists(p):
    series = json.load(open(p, encoding='utf-8'))


# Posiciones del mapa: cada familia tiene su ancla en un anillo; repulsión entre todos, atracción por las conexiones
# y un muelle hacia el ancla de la familia (Fruchterman-Reingold con enfriamiento). Determinista (semilla fija).
def layout(K=34, RAD=360, G=0.10, IT=500):
    import numpy as np
    rnd = np.random.default_rng(7)
    n = len(terms); idx = {t['id']: i for i, t in enumerate(terms)}
    fams = [f for f in FAMILIAS if any(t['familia'] == f for t in terms)]
    anc = {}
    for k, f in enumerate(fams):
        ang = -math.pi / 2 + 2 * math.pi * k / len(fams)
        anc[f] = np.array([math.cos(ang) * RAD * 1.25, math.sin(ang) * RAD])
    A = np.array([anc.get(t['familia'], np.zeros(2)) for t in terms])
    P = A + rnd.normal(0, 30, (n, 2))
    E = np.array([(idx[r['o']], idx[r['d']]) for r in rels]).reshape(-1, 2)
    temp = K * 3
    for it in range(IT):
        D = P[:, None, :] - P[None, :, :]
        d = np.sqrt((D ** 2).sum(-1)) + 1e-6
        rep = (D / d[..., None] * (K * K / d)[..., None]).sum(1)
        att = np.zeros_like(P)
        if len(E):
            v = P[E[:, 1]] - P[E[:, 0]]; L_ = np.linalg.norm(v, axis=1, keepdims=True) + 1e-6
            f = v / L_ * (L_ ** 2 / K) * 0.5
            np.add.at(att, E[:, 0], f); np.add.at(att, E[:, 1], -f)
        disp = rep + att + (A - P) * G * K
        Ln = np.linalg.norm(disp, axis=1, keepdims=True) + 1e-9
        P += disp / Ln * np.minimum(Ln, temp)
        temp = max(1.0, temp * 0.985)
    return {t['id']: [round(float(P[i, 0]), 1), round(float(P[i, 1]), 1)] for i, t in enumerate(terms)}


try:
    pos = layout()
    for t in terms: t['xy'] = pos[t['id']]
except ImportError:
    print('Sin numpy: el mapa usará la disposición automática.')

dump = lambda obj, name: json.dump(obj, open(os.path.join(OUT, name), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
dump(terms, 'terminos.json'); dump(rels, 'relaciones.json'); dump(hitos, 'hitos.json'); dump(contenido, 'contenido.json'); dump(series, 'series.json')

# CSV para descargar y reutilizar
os.makedirs(CSV, exist_ok=True)
cont = {c['id']: c for c in contenido}
with open(os.path.join(CSV, 'terminos.csv'), 'w', encoding='utf-8', newline='') as fh:
    w = csv.writer(fh)
    w.writerow(['id', 'lema', 'variantes', 'tipo', 'familia', 'anio', 'anio_nota', 'obra', 'figuras', 'definicion', 'usos_idear', 'controversia',
                'contexto', 'ejemplos', 'implicaciones', 'sabias_que', 'pregunta', 'paso', 'frase', 'veredicto', 'matiz', 'salto', 'relacionados', 'fuentes', 'estado'])
    for t in terms:
        c = cont[t['id']]
        w.writerow([t['id'], t['lema'], ' ; '.join(t['variantes']), t['tipo'], t['familia'], t['anio'] if t['anio'] is not None else '', t['anioNota'], t['obra'],
                    ' ; '.join(t['figuras']), t['definicion'], ''.join(t['usos']), t['controversia'], c['contexto'], ' ; '.join(c['ejemplos']), c['implicaciones'],
                    c['sabias_que'], c['pregunta'], c['paso'], t['frase'], t['veredicto'], t['matiz'], t['salto'], ' ; '.join(t['relacionados']),
                    ' ; '.join(f"{x.get('titulo', '')} | {x.get('url', '')}" for x in t['fuentes']), t['estado']])
with open(os.path.join(CSV, 'hitos.csv'), 'w', encoding='utf-8', newline='') as fh:
    w = csv.writer(fh)
    w.writerow(['anio', 'mes', 'titulo', 'texto', 'tipo', 'ambito', 'terminos', 'fuente_titulo', 'fuente_url', 'estado'])
    for x in hitos:
        w.writerow([x['anio'], x['mes'] or '', x['titulo'], x['texto'], x['tipo'], x['ambito'], ' ; '.join(x['terminos']), x['fuente'].get('titulo', ''), x['fuente'].get('url', ''), x['estado']])

from collections import Counter
print(len(terms), 'términos ·', len(rels), 'relaciones ·', len(hitos), 'hitos ·', len(series), 'series')
print('estados:', dict(Counter(t['estado'] for t in terms)), '· para juegos:', sum(t['juego'] for t in terms))
for a in avisos[:40]: print('  aviso:', a)
if len(avisos) > 40: print(f'  … y {len(avisos) - 40} avisos más')
