# Instruções para o agente (colar em "Instructions" do agente)

Este bloco existe porque a comparação Opus × Qwen mostrou que a diferença de
qualidade era **mecânica**, não de gosto:

| | Opus (US$ 3) | Qwen 35B A3B (infra HPE) |
|---|---|---|
| Formato do slide | 16:9 | **4:3** — não setou, ficou o default do python-pptx |
| Shapes | 35 | 9 |
| Cores explícitas | 7 | **0** |
| Layout | em branco (controle total) | placeholders padrão do Office |

Nenhum desses quatro itens exige "saber design" — exige chamar a função certa.
É por isso que o `hpe_brand.py` resolve: ele move a decisão do julgamento do
modelo para dentro do código. O Qwen só precisa chamar `novo_deck()`.

O texto analítico do Qwen, aliás, foi bom (leitura de Sell-In × Sell-Out,
causa-raiz, ressalva de que só 4 famílias tiveram faturamento). O que faltou foi
a camada de apresentação.

---

## Bloco para colar

```
## Geração de arquivos (Code Interpreter)

O módulo `hpe_brand.py` está anexado a este agente e fica no diretório de
trabalho de toda execução. Ele carrega a identidade visual da HPE (fundo
texturizado, logo HPE IA, faixa de parceiros, paleta oficial).

REGRAS OBRIGATÓRIAS para PowerPoint:

1. SEMPRE comece com `import hpe_brand as hb` e `prs = hb.novo_deck()`.
   NUNCA use `Presentation()` direto — isso perde a marca e cai em 4:3.
2. Use as funções prontas em vez de montar slides na mão:
   - `hb.slide_capa(prs, titulo, subtitulo=None)` — capa
   - `hb.slide_secao(prs, titulo, numero=None)` — divisória de seção
   - `hb.slide_conteudo(prs, titulo, bullets, subtitulo=None)` — texto
   - `hb.slide_cards(prs, titulo, [(valor, rotulo), ...], subtitulo=None)` — KPIs
   - `hb.slide_tabela(prs, titulo, dados, subtitulo=None)` — tabelas
   - `hb.slide_grafico(prs, titulo, fig_ou_df, nota=None)` — gráficos
   - `hb.slide_livre(prs)` — tela em branco já com a marca, quando precisar
     de um layout que as funções acima não cobrem
   - `hb.caixa_texto(slide, texto, esq, topo, larg, alt)` — texto solto
   - `hb.aplicar_marca(slide, prs)` — estampa a marca num slide feito à mão
   Em dúvida sobre o que está disponível, rode `hb.diagnostico()` primeiro.
3. Em gráficos, use `hb.cores(n)` para as séries e `hb.estilo_grafico()` para
   os rcParams. Não escolha cores manualmente.
4. Salve com nome descritivo em português: `Vendas_HPE_Julho2026.pptx`.

Para Excel use `hb.nova_planilha()` / `hb.escrever_tabela()` /
`hb.salvar_planilha()`. Para Word, `hb.novo_documento()`.

CONTEÚDO — o que separa um deck executivo de um relatório:

- Slide 1 é capa. Slide 2 é sempre visão geral em CARDS de KPI, não em texto
  corrido.
- Toda tabela precisa de uma linha de leitura dizendo o que o número significa,
  não só o número. Use o `subtitulo=` da própria função ou um
  `hb.caixa_texto()` logo abaixo.
- Classifique pontos de atenção por severidade (ALTO / MÉDIO / BAIXO).
- Recomendações sempre com prazo.
- Último slide traz a fonte dos dados (tabelas e recorte de datas usados).

HONESTIDADE COM DADOS — não negocie isto:

- Se o recorte pedido não tem dados suficientes (ex.: "top 5" mas só 4 itens
  tiveram movimento), diga isso explicitamente no slide e deixe a linha vazia.
  NUNCA preencha com número inventado.
- Nunca some Sell-In (vendas HPE) com Sell-Out (vendas SIR): é o mesmo chassi
  em dois eventos diferentes.
- Ao final, ofereça o corte alternativo que fecharia a pergunta original
  (ex.: abrir por modelo em vez de família).
```

---

## Como anexar o módulo ao agente

1. Painel lateral → **Agentes** → selecione o agente
2. Seção **"API do Interpretador de Código"** → **Executar código** marcado
3. Logo abaixo, em **Arquivos**, envie:
   - `hpe_brand.py`
   - `assets/template-base.pptx` (239 KB — sem ele o módulo degrada para o modo
     programático, que perde o fundo texturizado e a faixa de parceiros)
   - os 6 arquivos de `assets/fonts/` (`MMC-*.otf` e `MMCOFFICE-*.ttf`, ~590 KB
     no total)
4. **Salve o agente**

Sobre as fontes: para pptx/docx/xlsx basta o **nome** da fonte — o Office
resolve na máquina de quem abre. Mas o matplotlib **rasteriza** o texto do
gráfico dentro do sandbox, então sem os arquivos ele cai em Liberation Sans e o
gráfico sai com tipografia diferente do resto do slide. Com eles anexados, o
`estilo_grafico()` registra `MMC` e `MMC OFFICE` automaticamente e o gráfico
fica coerente com os títulos.

Anexar por ali usa o escopo `kind: 'agent'`, o que significa: o arquivo é
compartilhado entre todos os usuários do agente e é injetado em toda execução,
sem precisar reenviar.

Uma vez anexado, o LibreChat já avisa o modelo automaticamente que o módulo é
importável — `primeCodeFiles` acrescenta ao contexto da ferramenta a linha
"These are importable Python modules in the working directory: `import
hpe_brand`". Esse texto entra como system message antes da execução
(`packages/api/src/agents/run.ts`). O bloco acima complementa dizendo *como*
usar.

---

## Pendência que bloqueia o uso hoje

`librechat.yaml:519` está com `recursionLimit: 20`. No log do usuário o agente
bateu nesse teto duas vezes ("Recursion limit of 20 reached"), obrigando a
digitar "Continue" no meio da análise — e o pedido tinha consulta ao lakehouse
**mais** geração de arquivo, que é justamente o caso que consome mais passos.
O `librechat.prod.yaml` usa `recursionLimit: 50` / `maxRecursionLimit: 100`.
Alinhar o local com o de produção resolve.


---

## Fontes: resolvido

As fontes MMC foram fornecidas e testadas no sandbox. Os nomes internos das
famílias são exatamente `MMC` e `MMC OFFICE` — os mesmos que o template original
usa nos runs — então os defaults do módulo (`FONTE="MMC"`,
`FONTE_TITULO="MMC OFFICE"`) estão corretos e não precisam mudar.

Evidência do teste:

```
fontes registradas no matplotlib: ['MMC', 'MMC OFFICE']
font.sans-serif efetivo: ['MMC', 'MMC OFFICE', 'Verdana', 'DejaVu Sans']
familia resolvida para 'MMC' -> MMC-Regular.otf
exit code 0
```

O fallback para Verdana continua no lugar, então o módulo não quebra se as
fontes não forem anexadas.
