#!/usr/bin/env python3
"""Gera src/roster_data.js a partir das ilustrações originais.

As ilustrações são quadradas e de corpo inteiro, então recortamos a faixa
superior (72% da altura, centrada) para pegar cabeça e torso — sem isso, num
ladrilho de 78px o personagem vira uma manchinha colorida.

Uso:  python3 tools/gerar_thumbs.py <pasta-com-as-imagens>
Requer: pip install Pillow
"""
import os, io, re, sys, json, base64, unicodedata
from PIL import Image

LADO, QUALIDADE, FAIXA = 168, 70, 0.72

def slug(s):
    s = unicodedata.normalize('NFKD', s)
    s = ''.join(c for c in s if not unicodedata.combining(c))
    s = s.replace('\u2019', '').replace('’', '')
    return re.sub(r'[^a-z0-9]', '', s.lower())

def corta(caminho):
    im = Image.open(caminho).convert('RGB')
    W, H = im.size
    h = int(H * FAIXA); w = h; x = max(0, (W - w) // 2)
    im = im.crop((x, 0, x + min(w, W), h)).resize((LADO, LADO), Image.LANCZOS)
    b = io.BytesIO(); im.save(b, 'WEBP', quality=QUALIDADE, method=6)
    return b.getvalue()

def main(pasta):
    raiz = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    kits = json.load(open(os.path.join(raiz, 'data/kits.json'), encoding='utf-8'))
    prov = {p['key']: p for p in json.load(open(os.path.join(raiz, 'data/provacoes.json'), encoding='utf-8'))}
    ini  = {i['key'] for i in json.load(open(os.path.join(raiz, 'data/iniciais.json'), encoding='utf-8'))}
    arqs = {slug(os.path.splitext(f)[0]): f for f in os.listdir(pasta) if not f.startswith('.')}

    roster, imgs, faltando = [], {}, []
    for k in kits:
        e = {"key": k['key'], "nome": k['nome'], "faccao": k['faccao'], "elem": k['elemento'],
             "classe": k['tipo'], "funcao": k['funcao'], "inicial": k['key'] in ini}
        p = prov.get(k['key'])
        if p: e["prov"] = {"nome": p['titulo'], "nivel": p['nivel'],
                           "dif": p['dificuldade'], "cond": p['condicao'], "req": p['requisito']}
        roster.append(e)
        f = arqs.get(k['key'])
        if not f: faltando.append(k['nome']); continue
        imgs[k['key']] = "data:image/webp;base64," + base64.b64encode(corta(os.path.join(pasta, f))).decode()

    destino = os.path.join(raiz, 'src/roster_data.js')
    open(destino, 'w', encoding='utf-8').write(
        "/* GERADO por tools/gerar_thumbs.py — não editar à mão */\n"
        "const ROSTER=" + json.dumps(roster, ensure_ascii=False, separators=(',', ':')) + ";\n"
        "const IMG=" + json.dumps(imgs, separators=(',', ':')) + ";\n")
    print(f"{len(roster)} deuses, {len(imgs)} imagens -> src/roster_data.js "
          f"({os.path.getsize(destino)/1024/1024:.2f} MB)")
    if faltando: print("SEM IMAGEM:", faltando)

if __name__ == '__main__':
    if len(sys.argv) < 2: print(__doc__); sys.exit(1)
    main(sys.argv[1])
