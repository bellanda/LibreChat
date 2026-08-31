# hpe_brand.py — identidade visual no code interpreter

Helper que garante **a marca** e deixa **conteúdo e layout livres**. Não é
template fechado: `slide_livre()` dá um slide em branco já marcado e
`aplicar_marca(slide, prs)` estampa a marca em qualquer slide montado à mão —
justamente para o modelo nunca ficar preso a um formato.

Tudo aqui foi extraído do `template-original.pptx` real (21 slides), não
adivinhado.

## 1. De onde vem a marca: dois modos automáticos

A descoberta que orienta o desenho do módulo: **a marca da HPE mora no
`slideMaster`**, não no tema. O master carrega, e portanto todo slide herda:

| Elemento | Posição no master | Arquivo |
| --- | --- | --- |
| Fundo texturizado full-bleed | 0, 0.02in — 13.33 × 7.46in | `image1` |
| Faixa de logos dos parceiros (HPE, BW&P, HPE Seguros, MIT Locadora) | 0.76, 6.98in — 4.13 × 0.31in | `image2` |
| 5 bolinhas + badge INTEGRAR | 10.58, 6.83in — 2.30 × 0.52in | `image3` |
| Duas réguas horizontais | y = 0.85in e y = 6.69in | shapes |

O badge **HPE IA** é o único elemento aplicado por slide (idêntico nos 21
originais: 12.07, 0.217in — 0.939 × 0.545in) — e vem **embutido em base64 no
próprio `hpe_brand.py`**, então nunca falta.

Daí os dois modos, escolhidos sozinhos:

- **MODO TEMPLATE** (preferido) — com `template-base.pptx` presente, o deck
  nasce do master real: fundo, faixas e badge INTEGRAR com fidelidade
  pixel-perfect, de graça, em todo slide.
- **MODO FALLBACK** — sem o template, o deck é construído do zero e a marca é
  desenhada (fundo claro + as 5 bolinhas). Fica próximo, não idêntico. Nada
  quebra.

`hb.diagnostico()` diz em qual modo você está e avisa se caiu no fallback.

## 2. Anexar ao agente (escopo `kind: 'agent'`)

Arquivo enviado pelo **Agent Builder** vai com o `agent_id`, e
`api/server/services/Files/Code/crud.js` o manda ao code interpreter como
`kind: 'agent'` + `id: <agent_id>`. Consequências:

- **injetado em toda execução** daquele agente (não precisa reenviar por conversa);
- **compartilhado entre todos os usuários** do agente — um upload serve o time;
- persiste no agente, não na sessão (as sessões do sandbox são efêmeras: o
  `/mnt/data` de um `/exec` não sobrevive para o próximo).

Anexo pelo **campo de mensagem do chat** vai como `kind: 'user'` — só daquele
usuário, só daquela conversa. Para o helper, use sempre o Agent Builder.

Passos:

1. Painel lateral → **Agents** → selecione ou crie o agente (agentes efêmeros
   não aceitam code files).
2. Ative a capability **Code Interpreter** (`execute_code`).
3. **Upload Code Files**, enviando:
   - `hpe_brand.py` — 60 KB (obrigatório; já contém o badge HPE IA)
   - `assets/template-base.pptx` — 239 KB (opcional, mas é o que dá fidelidade total)
4. Salve o agente.

Custo por execução: **~300 KB**. Os arquivos chegam em `/mnt/data`, que é o
diretório de trabalho, então `import hpe_brand` funciona direto. Se o import
falhar por `sys.path`, use `sys.path.insert(0, "/mnt/data")`.

## 3. Trecho de prompt sugerido para o agente

```
FERRAMENTAS DE MARCA
O ambiente de execução de código tem o módulo `hpe_brand.py` em /mnt/data.
SEMPRE use-o ao gerar .pptx, .xlsx ou .docx e ao gerar gráficos — ele aplica a
identidade visual da HPE Autos / HPE IA (fundo texturizado, badge HPE IA, faixa
de parceiros, paleta, tipografia).

    import sys; sys.path.insert(0, "/mnt/data")
    import hpe_brand as hb

Ele NÃO é um template fechado: layout e conteúdo são sua escolha. Use as funções
prontas quando servirem e, quando não servirem, monte o slide do zero com
`hb.slide_livre(prs)` ou aplique a marca a um slide seu com
`hb.aplicar_marca(slide, prs)`. Nunca abra mão de um layout melhor só para caber
numa função pronta.

Apresentações:
    prs = hb.novo_deck()                      # 16:9, marca do master aplicada
    hb.slide_capa(prs, titulo, subtitulo)
    hb.slide_secao(prs, titulo, numero="02")
    hb.slide_conteudo(prs, titulo, ["bullet", ("sub-bullet", 1)])
    hb.slide_cards(prs, titulo, [{"rotulo":"RECEITA","valor":"R$ 1,2M",
                                  "descricao":"+8% a/a"}])
    hb.slide_grafico(prs, titulo, fig_ou_df, nota="Fonte: ...")
    hb.slide_tabela(prs, titulo, df)
    s = hb.slide_livre(prs)                   # canvas livre, já marcado
    hb.caixa_texto(s, "texto", esq, topo, larg, alt, tamanho=24, cor=hb.AZUL)
    hb.card(s, esq, topo, larg, alt, "ROTULO", "VALOR", cor=hb.TEAL)
    hb.salvar(prs, "nome.pptx")

IMPORTANTE — área útil do slide: o master desenha arte no rodapé. Mantenha todo
conteúdo entre y=0.85in e y=6.69in (use hb.GEO["corpo"], que já respeita isso).
Nunca posicione nada abaixo de hb.GEO["rodape_y"].

Gráficos: chame `plt = hb.estilo_grafico()` ANTES de plotar e use `hb.cores(n)`
para as séries — são as 5 bolinhas da marca, então o gráfico combina com o
rodapé. As figuras saem com fundo transparente para a textura do slide aparecer.
Passe a figura direto para `hb.slide_grafico`, que também aceita um DataFrame.

Excel:
    wb, ws = hb.nova_planilha("Dados", titulo="Relatório")
    hb.escrever_tabela(ws, df, formato_numero="#,##0.00")
    hb.salvar_planilha(wb, "nome.xlsx")

Word:
    doc = hb.novo_documento("Título", "Subtítulo")
    hb.salvar_documento(doc, "nome.docx")

Cores: hb.AZUL (#1F4E79, títulos), hb.VERMELHO, hb.LARANJA, hb.VERDE, hb.TEAL,
hb.AZUL_MEDIO (as 5 bolinhas), hb.PALETA, hb.GRAFITE, hb.CINZA.
Em dúvida sobre o que carregou, chame hb.diagnostico().
```

## 4. API

| Função | O que faz |
| --- | --- |
| `diagnostico()` | modo (template/fallback), template, logo, fonte, paleta, aviso |
| `configurar(**kw)` | sobrescreve cores/fonte/logo/template em runtime |
| `template_disponivel()` | caminho do template real, ou `None` |
| `cores(n)` | n cores da marca (as 5 bolinhas, depois extras) |
| `estilo_grafico()` | rcParams da marca; devolve `plt` |
| `novo_deck(usar_template=True)` | `Presentation` 16:9 exato (12192000 × 6858000 EMU) |
| `slide_livre(prs)` | slide em branco **com** a marca |
| `aplicar_marca(slide, prs, logo=, fundo=, faixa=)` | primitivo, idempotente |
| `caixa_texto(slide, texto, esq, topo, larg, alt, ...)` | texto na tipografia da marca |
| `card(slide, esq, topo, larg, alt, rotulo, valor, descricao, cor)` | bloco KPI colorido |
| `slide_capa` (= `slide_titulo`) / `slide_secao` / `slide_conteudo` | capa 45pt / divisor / bullets |
| `slide_grafico(prs, titulo, fig_ou_df, nota=, kind=)` | figura matplotlib, DataFrame/Series ou caminho `.png` |
| `slide_cards(prs, titulo, cards, subtitulo=, altura=)` | linha de cards (dicts ou tuplas) |
| `slide_tabela(prs, titulo, dados)` | tabela zebrada |
| `salvar(prs, nome)` | salva em `/mnt/data`, devolve o caminho |
| `nova_planilha` / `escrever_tabela` / `salvar_planilha` | Excel marcado |
| `novo_documento` / `salvar_documento` | Word marcado |

Constantes: `AZUL`, `CINZA_BARRA`, `VERMELHO`, `LARANJA`, `VERDE`, `TEAL`,
`AZUL_MEDIO`, `PALETA`, `PALETA_EXT`, `GRAFITE`, `CINZA`, `FUNDO_SOLIDO`,
`BRANCO`, `FONTE`, `FONTE_TITULO`, `FONTE_FALLBACK`, `GEO`, `EMU_LARGURA`,
`EMU_ALTURA`, `PT_TITULO`/`PT_CAPA`/`PT_CORPO`/`PT_DESTAQUE`.

## 5. Valores de marca — o que está confirmado

Todos extraídos do arquivo real.

| Valor | Origem |
| --- | --- |
| `AZUL = #1F4E79` | 55 das 57 cores explícitas nos 21 slides — é *a* cor |
| `PALETA` = `#EB2F23 #F58634 #A1CC38 #009A93 #1F60AC` | amostrado pixel a pixel do centro de cada bolinha em `faixa-secundaria.png`; confirmado por `logos-parceiros.png` (4 primeiras batem exatamente) |
| `CINZA_BARRA = #C8C6BD` | 1 ocorrência, uso pontual |
| Geometria (`GEO`) | medida nos 21 slides; badge idêntico em todos |
| Escala de tipos | 24pt corpo/título (225 runs), 45pt capa, 70pt destaque, 20pt secundário |
| Slide | 12192000 × 6858000 EMU |

### Ainda precisa de decisão humana

1. **A fonte real é `MMC` / `MMC OFFICE`, não Calibri.** Calibri/Calibri Light é
   só o tema padrão do Office, que os slides nunca usam: os runs pedem `MMC`
   (170 runs a 24pt) e `MMC OFFICE` (53). MMC é proprietária e **não está
   embutida** no arquivo (o que está embutido é Calibri, Calibri Light e
   Verdana — 4.1 MB). Default do módulo: `FONTE = "MMC"`,
   `FONTE_TITULO = "MMC OFFICE"`, `FONTE_FALLBACK = "Verdana"`.
   **Confirmar:** as máquinas do time têm MMC instalada? Se não, troque para
   `hb.configurar(FONTE="Verdana", FONTE_TITULO="Verdana")` — sem MMC o
   PowerPoint substitui por conta própria e o resultado fica imprevisível.
   No sandbox não há MMC nem Verdana, então **gráficos saem em Liberation Sans**.
2. **`#D71920` foi descartado.** O vermelho real da marca é `#EB2F23` (a
   primeira bolinha). O `#D71920` que aparecia em gráficos antigos não vem do
   template.
3. **Neutros de corpo** (`GRAFITE #3B3B3B`, `CINZA #6E7679`) continuam sendo
   escolha minha: os slides originais quase não declaram cor de texto de corpo.

### Nomes de arquivo trocados nos assets

Os dois nomes não descrevem o conteúdo — vale renomear para não confundir:

- `faixa-bolinhas.png` (908×67) é na verdade a **faixa de logos dos parceiros**
- `logos-parceiros.png` (726×164) é na verdade as **5 bolinhas + badge INTEGRAR**
- `faixa-secundaria.png` (455×47) são as **5 bolinhas limpas** — a fonte correta
  para amostrar a paleta, e a que o módulo usa

## 6. Regerar o `template-base.pptx`

```bash
python3 brand-templates/hpe/build_template_base.py
```

Só stdlib. Lê `assets/template-original.pptx` e escreve
`assets/template-base.pptx`. Se `assets/fundo-otimizado.jpg` existir, usa-o como
fundo; senão mantém o PNG de 1.8 MB.
