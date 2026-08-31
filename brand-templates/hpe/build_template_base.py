#!/usr/bin/env python3
"""Gera assets/template-base.pptx a partir de assets/origem/template-original.pptx.

Mantem master + 11 layouts + tema (onde vive a marca: fundo texturizado,
faixa de logos dos parceiros, badge INTEGRAR) e descarta o que so pesa:
os 21 slides de conteudo, as 4.1 MB de fontes embutidas e as midias nao
usadas pelo master. Troca o fundo de 1.8 MB por um JPEG visualmente
identico. Roda com stdlib apenas; nao precisa de python-pptx.

Uso:  python3 build_template_base.py
"""
import os
import re
import shutil
import zipfile

AQUI = os.path.dirname(os.path.abspath(__file__))
ASSETS = os.path.join(AQUI, "assets")
# O .pptx que o time entregou fica em assets/origem/ junto com as artes de que
# ele foi extraido, para separar o material de partida do que e realmente
# consumido em execucao (assets/template-base.pptx + logo + fonts).
ORIG = os.path.join(ASSETS, "origem", "template-original.pptx")
SAIDA = os.path.join(ASSETS, "template-base.pptx")
FUNDO_OTIMIZADO = os.path.join(ASSETS, "fundo-otimizado.jpg")

# Midias referenciadas pelo slideMaster (as unicas que precisam sobreviver):
#   image1.png -> fundo texturizado full-bleed
#   image2.png -> faixa de logos dos parceiros (rodape esquerdo)
#   image3.png -> 5 bolinhas + badge INTEGRAR (rodape direito)
MEDIA_MANTER = {"image1.png", "image2.png", "image3.png"}

# accent1..5 = as 5 bolinhas da marca; accent6 = azul dos titulos.
ACCENTS = ["EB2F23", "F58634", "A1CC38", "009A93", "1F60AC", "1F4E79"]


def _limpa_presentation(xml: str) -> str:
    xml = re.sub(r"<p:sldIdLst>.*?</p:sldIdLst>", "<p:sldIdLst/>", xml, flags=re.S)
    xml = re.sub(r"<p:embeddedFontLst>.*?</p:embeddedFontLst>", "", xml, flags=re.S)
    return xml


def _limpa_rels_presentation(xml: str) -> str:
    # remove as relationships de slide e de fonte embutida
    return re.sub(
        r'<Relationship[^>]*Type="[^"]*/(?:slide|font)"[^>]*/>', "", xml)


def _limpa_content_types(xml: str, fundo_jpeg: bool) -> str:
    xml = re.sub(r'<Override PartName="/ppt/slides/slide\d+\.xml"[^>]*/>', "", xml)
    xml = re.sub(r'<Default Extension="fntdata"[^>]*/>', "", xml)
    if fundo_jpeg and 'Extension="jpeg"' not in xml:
        xml = xml.replace("<Types ", '<Types ', 1)  # jpeg Default ja existe no original
    return xml


def _troca_accents(xml: str) -> str:
    """Aponta accent1..6 do tema para as cores reais da marca."""
    def sub(m):
        idx = int(m.group(1))
        return '<a:accent%d><a:srgbClr val="%s"/></a:accent%d>' % (
            idx, ACCENTS[idx - 1], idx)
    return re.sub(r'<a:accent([1-6])><a:srgbClr val="[0-9A-Fa-f]{6}"/></a:accent\1>',
                  sub, xml)


def main():
    if not os.path.isfile(ORIG):
        raise SystemExit("faltando %s" % ORIG)
    usar_jpeg = os.path.isfile(FUNDO_OTIMIZADO)

    zin = zipfile.ZipFile(ORIG)
    nomes = zin.namelist()

    with zipfile.ZipFile(SAIDA, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as zout:
        for nome in nomes:
            # ---- descarta ----
            if nome.startswith("ppt/slides/"):
                continue
            if nome.startswith("ppt/fonts/"):
                continue
            if nome.startswith("ppt/media/") and os.path.basename(nome) not in MEDIA_MANTER:
                continue
            if nome == "docProps/thumbnail.jpeg":
                continue

            dados = zin.read(nome)

            # ---- fundo otimizado ----
            if nome == "ppt/media/image1.png" and usar_jpeg:
                # mantem o nome .png? nao: o content type vem da extensao.
                # gravamos como image1.jpeg e corrigimos o rel do master.
                with open(FUNDO_OTIMIZADO, "rb") as fh:
                    zout.writestr("ppt/media/image1.jpeg", fh.read())
                continue

            # ---- edicoes de XML ----
            if nome == "ppt/presentation.xml":
                dados = _limpa_presentation(dados.decode("utf8")).encode("utf8")
            elif nome == "ppt/_rels/presentation.xml.rels":
                dados = _limpa_rels_presentation(dados.decode("utf8")).encode("utf8")
            elif nome == "[Content_Types].xml":
                dados = _limpa_content_types(dados.decode("utf8"), usar_jpeg).encode("utf8")
            elif nome == "ppt/slideMasters/_rels/slideMaster1.xml.rels" and usar_jpeg:
                dados = dados.decode("utf8").replace(
                    "../media/image1.png", "../media/image1.jpeg").encode("utf8")
            elif nome == "ppt/theme/theme1.xml":
                dados = _troca_accents(dados.decode("utf8")).encode("utf8")
            elif nome == "docProps/app.xml":
                # zera as contagens/titulos dos 21 slides antigos
                d = dados.decode("utf8")
                d = re.sub(r"<TitlesOfParts>.*?</TitlesOfParts>", "", d, flags=re.S)
                d = re.sub(r"<Slides>\d+</Slides>", "<Slides>0</Slides>", d)
                d = re.sub(r"<HeadingPairs>.*?</HeadingPairs>", "", d, flags=re.S)
                dados = d.encode("utf8")
            elif nome == "_rels/.rels":
                dados = re.sub(
                    r'<Relationship[^>]*Target="docProps/thumbnail\.jpeg"[^>]*/>',
                    "", dados.decode("utf8")).encode("utf8")

            zout.writestr(nome, dados)

    print("gerado: %s  (%.0f KB)" % (SAIDA, os.path.getsize(SAIDA) / 1024))
    print("original:                (%.0f KB)" % (os.path.getsize(ORIG) / 1024))


if __name__ == "__main__":
    main()
