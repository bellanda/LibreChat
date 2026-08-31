# brand-templates

Módulos de identidade visual para o Code Interpreter. Cada subpasta é uma marca
(ou cliente) e é anexada a um agente do LibreChat como recurso do
`execute_code`, ficando disponível em toda execução daquele agente.

A ideia é que o modelo não precise "saber design": ele importa o módulo e chama
funções. A comparação que motivou isso está em `hpe/INSTRUCOES-AGENTE.md` — um
modelo grande e caro e um modelo local produziram decks muito diferentes, e a
diferença toda era mecânica (formato do slide, layout, cores). Colocar isso em
código empata os dois.

## Marcas disponíveis

| Pasta | Marca | Estado |
|---|---|---|
| `hpe/` | HPE Automotores / HPE IA | pronto e testado no sandbox |

## Estrutura de uma marca

```
<marca>/
  <marca>_brand.py          módulo importado pelo modelo (autocontido)
  INSTRUCOES-AGENTE.md      bloco para colar em "Instructions" do agente
  README.md                 decisões, valores da marca, evidência dos testes
  build_template_base.py    (opcional) regenera o template enxuto
  assets/
    template-base.pptx      base enxuta consumida em execução
    logo-*.png              logo aplicado por slide
    fundo-*.jpg             fundo otimizado
    fonts/                  arquivos de fonte, para o matplotlib
    origem/                 material de partida — NÃO vai para o sandbox
```

A separação `assets/` × `assets/origem/` importa: só o primeiro nível é anexado
ao agente. `origem/` guarda o `.pptx` original entregue pelo time e as artes de
que os assets foram extraídos — material de referência, geralmente pesado
(o original da HPE tem 8 MB contra 239 KB da base enxuta).

## Convenções

**Autocontido.** O módulo só pode depender do que existe no sandbox: stdlib,
`python-pptx`, `openpyxl`, `xlsxwriter`, `python-docx`, `matplotlib`, `pandas`,
`pillow`, `reportlab`.

**Degrade, não quebre.** Todo asset é opcional. Sem o template, sem o logo ou
sem as fontes, o módulo continua gerando arquivo — só perde fidelidade. Exponha
um `diagnostico()` que diga em que modo está rodando.

**Escape hatch de primeira classe.** Sempre ofereça uma tela em branco já
marcada (`slide_livre`) e um primitivo que estampa a marca num slide feito à mão
(`aplicar_marca`). Template rígido foi justamente a limitação do sandbox
anterior; não recriar esse erro.

**Peso.** O conteúdo de `assets/` (fora `origem/`) é injetado em toda execução
do agente. A HPE fica em ~1,1 MB somando base (245 KB) + fundo (172 KB) + logo (24 KB) + fontes (604 KB). Vale medir antes
de adicionar coisa grande.

**Fontes.** Para pptx/docx/xlsx basta o *nome* da fonte — o Office resolve na
máquina de quem abre. Mas o matplotlib rasteriza o texto do gráfico dentro do
sandbox, então sem os arquivos o gráfico sai com tipografia diferente do resto
do slide. Registre-as no `font_manager` no início do estilo de gráfico.

## Como adicionar uma marca nova

1. Copie `hpe/` como ponto de partida — a estrutura e o `diagnostico()` já estão
   resolvidos ali.
2. Ponha o `.pptx` de referência em `assets/origem/` e extraia dele os valores
   reais em vez de adivinhar: `unzip -q arquivo.pptx -d x` e depois olhe
   `x/ppt/slideMasters/_rels/` (as artes herdadas por todo slide),
   `x/ppt/theme/theme1.xml` (cores e fontes do tema) e conte as cores dos runs
   em `x/ppt/slides/`. No caso da HPE o tema era o padrão do Office e a marca
   estava toda no `slideMaster` — adivinhar teria errado tudo.
3. Teste executando de verdade no code interpreter, não só estruturalmente.
4. Escreva o `INSTRUCOES-AGENTE.md` conferindo cada nome de função contra o
   módulo. Nome errado no prompt faz o modelo falhar.

## Um aviso sobre versionamento

`hpe/assets/fonts/` contém as fontes MMC, que são proprietárias da Mitsubishi.
Antes de commitar, confirme com quem cuida de licenciamento se elas podem ir
para o repositório — se não puderem, o caminho é adicioná-las ao `.gitignore` e
distribuí-las por outro meio, com o módulo degradando para Verdana quando
ausentes (já é o comportamento).
