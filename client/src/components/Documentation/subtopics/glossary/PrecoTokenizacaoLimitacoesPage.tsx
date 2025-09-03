// src/pages/PrecoTokenizacaoLimitacoesPage.jsx
import { useModelDescriptions } from '../../../../hooks/useModelDescriptions';
import SectionRecommendations from '../../components/SectionRecommendations';

const CostExample = () => (
  <div className="p-6 bg-gray-800">
    <h3 className="mb-2 text-xl font-semibold text-white">Exemplo de Cálculo de Custo</h3>
    <ul className="mt-2 space-y-1 list-disc list-inside text-gray-200">
      <li>
        <span className="font-semibold">Prompt:</span> 5.000 tokens
      </li>
      <li>
        <span className="font-semibold">Resposta:</span> 10.000 tokens
      </li>
      <li>
        <span className="font-semibold">Modelo:</span> GPT-5
      </li>
      <li>
        <span className="font-semibold">Cálculo Entrada:</span> 5.000 / 1.000.000 × $1,25 ={' '}
        <span className="font-semibold">$0,00625</span>
      </li>
      <li>
        <span className="font-semibold">Cálculo Saída:</span> 10.000 / 1.000.000 × $10,00 ={' '}
        <span className="font-semibold">$0,1</span>
      </li>
      <li>
        <span className="font-semibold">Total:</span>{' '}
        <span className="font-bold text-green-300">$0,1</span> (15.000 tokens) - Cotação R$5.50 =
        R$0,55
      </li>
    </ul>
  </div>
);

const PriceTable = () => {
  const { descriptions, loading } = useModelDescriptions();

  if (loading) {
    return (
      <div className="overflow-x-auto rounded-lg shadow-lg">
        <div className="p-8 min-w-full text-center bg-gray-800">
          <p className="text-gray-300">Carregando descrições dos modelos…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg shadow-lg">
      <table className="min-w-full bg-gray-800">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="px-4 py-2 text-left text-white">Modelo</th>
            <th className="px-4 py-2 text-left text-white">Descrição</th>
            <th className="px-4 py-2 text-left text-white">Preço Entrada</th>
            <th className="px-4 py-2 text-left white">Preço Saída</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(descriptions).map((model) => {
            const info = descriptions[model];
            if (info.shortUseCase) {
              return (
                <tr key={model} className="transition-colors hover:bg-gray-700">
                  <td className="flex items-center px-4 py-2 mr-2 font-semibold text-green-300">
                    <img src={info.image} className="mr-2 h-[70px] w-[100px]" />
                    <span>
                      {info.name}
                      <br></br>
                      <span className="text-sm text-gray-400">
                        Criador: {info.creator}
                        <br></br>
                        Provedor: {info.provider}
                      </span>
                    </span>
                  </td>
                  <td className="px-4 py-2 text-gray-300">{info.shortUseCase}</td>
                  <td className="px-4 py-2 text-gray-200">${info.prompt?.toFixed(2) ?? 'N/A'}</td>
                  <td className="px-4 py-2 text-gray-200">
                    ${info.completion?.toFixed(2) ?? 'N/A'}
                  </td>
                </tr>
              );
            }
            return null;
          })}
        </tbody>
      </table>
    </div>
  );
};

/* -------------------------------------------------------------------------
   LISTAS DE ITENS (exemplos) – permanecem iguais ao que estava antes
   ------------------------------------------------------------------------- */
const models_task_day_to_day_items = [
  'Escrever e-mails formais',
  'Resumir textos longos',
  'Fazer pesquisas de senso-comum',
  'Tirar dúvidas de curiosidade',
  'Gerar rascunhos de posts',
  'Reformular frases',
  'Traduzir trechos rápidos',
];
const models_web_search_items = [
  'Checar notícias de última hora',
  'Comparar preços de produtos',
  'Coletar estatísticas atualizadas',
  'Confirmar fatos históricos ou científicos',
  'Encontrar referências acadêmicas',
  'Descobrir tendências de mercado',
];
const models_code_and_software_engineering_items = [
  'Gerar & rodar scripts Python',
  'Depurar código JavaScript',
  'Converter APIs REST → GraphQL',
  'Criar planilhas dinâmicas',
  'Automatizar relatórios',
  'Plotar gráficos',
  'Analisar CSVs',
  'Produzir testes unitários',
  'Refatorar monólitos',
];
const models_maximum_complexity_items = [
  'Raciocínio multietapa',
  'Análises estratégicas',
  'Pesquisa científica avançada',
  'Design de algoritmos',
  'Simulações de cenários',
  'Provas matemáticas',
  'Elaboração de políticas públicas',
  'Arquitetura de sistemas',
];
const models_ultra_velocity_items = [
  'Respostas instantâneas',
  'Chat-bots em tempo real',
  'Autocompletar',
  'Geração de texto curto',
  'Brainstorming rápido',
  'Sem execução de código nem busca na web',
];

/* -------------------------------------------------------------------------
   RECOMENDAÇÕES DE MODELOS POR TIPO DE TAREFA
   ------------------------------------------------------------------------- */

/* 1️⃣ Tarefas Comuns do Dia a Dia 📨 */
const models_task_day_to_day = [
  {
    emoji: '🟢',
    name: 'Groq → GPT-OSS 20B',
    cost: '0.10 / 0.50',
    speed: '⚡⚡⚡⚡⚡',
    capacity: '45',
  },
  {
    emoji: '🟢',
    name: 'Groq → GPT-OSS 120B',
    cost: '0.15 / 0.75',
    speed: '⚡⚡⚡⚡',
    capacity: '58',
  },
  {
    emoji: '🟢',
    name: 'Google → Gemini 2.5 Flash',
    cost: '0.3  / 2.5',
    speed: '⚡⚡⚡⚡',
    capacity: '51',
  },
  {
    emoji: '🟢',
    name: 'Groq → Llama 4 Maverick',
    cost: '0.2  / 0.6',
    speed: '⚡⚡⚡⚡',
    capacity: '36',
  },
];

/* 2️⃣ Pesquisa na Web 🔍 */
const models_web_search = [
  {
    emoji: '🟡',
    name: 'Google → Gemini 2.5 Flash',
    cost: '0.3  / 2.5',
    speed: '⚡⚡⚡⚡',
    capacity: '51',
  },
  {
    emoji: '🟡',
    name: 'Azure OpenAI → GPT‑5',
    cost: '1.25  / 10.0',
    speed: '⚡⚡⚡',
    capacity: '62',
  },
  {
    emoji: '🟢',
    name: 'Groq → GPT-OSS 120B',
    cost: '0.15 / 0.75',
    speed: '⚡⚡⚡⚡',
    capacity: '58',
  },
];

/* 3️⃣ Código & Eng. Software 💻 */
const models_code_and_software_engineering = [
  {
    emoji: '🔵',
    name: 'Anthropic → Claude Sonnet 4',
    cost: '3.0  / 15.0',
    speed: '⚡⚡⚡',
    capacity: '57',
  },
  {
    emoji: '🔵',
    name: 'Fireworks → Qwen3 Coder 480B',
    cost: '0.5  / 1.8',
    speed: '⚡⚡⚡⚡',
    capacity: '45',
  },
  {
    emoji: '🔵',
    name: 'Groq → GPT-OSS 120B',
    cost: '0.15 / 0.75',
    speed: '⚡⚡⚡⚡',
    capacity: '58',
  },
  {
    emoji: '🔵',
    name: 'Azure OpenAI → GPT‑5 Raciocínio Alto',
    cost: '1.25  / 10.0',
    speed: '⚡⚡',
    capacity: '67',
  },
  { emoji: '🔵', name: 'XAI → Grok 4', cost: '3.0  / 15.0', speed: '⚡⚡', capacity: '65' },
  {
    emoji: '🔵',
    name: 'Google → Gemini 2.5 Pro',
    cost: '2.0  / 12.5',
    speed: '⚡⚡⚡',
    capacity: '60',
  },
];

/* 4️⃣ Máxima Complexidade 🧠 */
const models_maximum_complexity = [
  {
    emoji: '🔵',
    name: 'Azure OpenAI → GPT‑5 Raciocínio Alto',
    cost: '1.25  / 10.0',
    speed: '⚡⚡',
    capacity: '67',
  },
  { emoji: '🔵', name: 'XAI → Grok 4', cost: '3.0  / 15.0', speed: '⚡⚡', capacity: '65' },
  {
    emoji: '🔵',
    name: 'Google → Gemini 2.5 Pro',
    cost: '2.0  / 12.5',
    speed: '⚡⚡⚡',
    capacity: '60',
  },
  {
    emoji: '🔴',
    name: 'Fireworks → DeepSeek R1',
    cost: '3.0  / 8.0',
    speed: '⚡⚡⚡',
    capacity: '52',
  },
];

/* 5️⃣ Ultra‑Velocidade ⚡ */
const models_ultra_velocity = [
  {
    emoji: '🟢',
    name: 'Groq → GPT-OSS 20B',
    cost: '0.10 / 0.50',
    speed: '⚡⚡⚡⚡⚡',
    capacity: '45',
  },
  {
    emoji: '🟢',
    name: 'Groq → GPT-OSS 120B',
    cost: '0.15 / 0.75',
    speed: '⚡⚡⚡⚡',
    capacity: '58',
  },
  {
    emoji: '⚪',
    name: 'Groq → Llama 4 Scout',
    cost: '0.11  / 0.34',
    speed: '⚡⚡⚡⚡⚡',
    capacity: '28',
  },
  {
    emoji: '⚪',
    name: 'Groq → Llama 4 Maverick',
    cost: '0.2  / 0.6',
    speed: '⚡⚡⚡⚡',
    capacity: '36',
  },
];

export default function PrecoTokenizacaoLimitacoesPage() {
  const { descriptions, loading } = useModelDescriptions();

  return (
    <div className="mx-auto">
      {/* ------------- Artificial Analysis - Intelligence Index Chart ----------------- */}
      <section className="mt-12" id="custo-token">
        <h2 className="mb-4 text-2xl font-semibold text-white">Gráfico de Nível de Inteligência</h2>
        <p className="leading-relaxed text-gray-200">
          O gráfico abaixo mostra o nível de inteligência de cada modelo de IA, com base em sua
          capacidade de resolver problemas complexos e gerar respostas precisas. Ele é uma média de
          todos os testes mais famosos de Inteligência Artificial.
        </p>
        <div className="mt-4">
          <img src="/assets/artificial-analysis-chart.png" alt="Gráfico de Nível de Inteligência" />
        </div>
      </section>
      {/* ------------- Título e Introdução ------------- */}
      <section className="mt-12" id="custo-token">
        <h2 className="mb-4 text-2xl font-semibold text-white">Custos por Token</h2>
        <p className="leading-relaxed text-gray-200">
          Cada modelo de IA possui um preço calculado por{' '}
          <span className="font-semibold text-green-300">tokens</span>, tanto na entrada (prompt)
          quanto na saída (resposta). Entender esses valores é essencial para manter o orçamento sob
          controle.
        </p>
      </section>

      {/* ------------- Como os Tokens Impactam ------------ */}
      <section className="mt-12" id="impacto-custo">
        <h2 className="mb-4 text-2xl font-semibold text-white">Como os Tokens Impactam no Custo</h2>
        <p className="mb-4 leading-relaxed text-gray-200">
          O valor total de uma chamada API é a soma dos tokens de entrada e saída multiplicados pelo
          preço unitário de cada modelo. Prompts longos e respostas detalhadas consomem mais tokens,
          aumentando o custo.
        </p>
        <CostExample />
      </section>

      {/* ----------------- Tabela de Preços ----------------- */}
      <section className="mt-12" id="tabela-precos">
        <h2 className="mb-4 text-2xl font-semibold text-white">
          Tabela de Preços por Modelo (Em dólar $ por 1 Milhão de tokens)
        </h2>
        <p className="mb-4 leading-relaxed text-gray-200">
          Total de modelos:{' '}
          <span className="font-semibold text-green-300">{Object.keys(descriptions).length}</span>
        </p>
        <PriceTable />
      </section>

      {/* -------------- Recomendações por Perfil -------------- */}
      <section className="mt-12" id="perfis-uso">
        <h2 className="mb-4 text-2xl font-semibold text-white">Recomendações por Perfil de Uso</h2>

        {/* 1️⃣ Tarefas do dia‑a‑dia */}
        <SectionRecommendations
          title="Tarefas Comuns do Dia a Dia"
          items={models_task_day_to_day_items}
          models={models_task_day_to_day}
        />

        {/* 2️⃣ Pesquisa na Web */}
        <SectionRecommendations
          title="Pesquisa na Web"
          items={models_web_search_items}
          models={models_web_search}
        />

        {/* 3️⃣ Código & Engenharia de Software */}
        <SectionRecommendations
          title="Código & Engenharia de Software"
          items={models_code_and_software_engineering_items}
          models={models_code_and_software_engineering}
        />

        {/* 4️⃣ Máxima Complexidade */}
        <SectionRecommendations
          title="Máxima Complexidade"
          items={models_maximum_complexity_items}
          models={models_maximum_complexity}
        />

        {/* 5️⃣ Ultra‑Velocidade */}
        <SectionRecommendations
          title="Ultra-Velocidade"
          items={models_ultra_velocity_items}
          models={models_ultra_velocity}
        />

        {/* Dicas Extras de Economia */}
        <div className="mt-12 text-gray-200">
          <p className="mb-2 font-semibold">💡 Dicas Extras de Economia</p>
          <ul className="pl-6 space-y-1 list-disc">
            <li>Prompt curto = menos tokens (💵)</li>
            <li>Abrir novo chat a cada 2‑3 interações para evitar histórico caro</li>
            <li>Agrupar perguntas em lotes ("batching")</li>
            <li>
              Combinar modelos: use GPT‑OSS 20B/120B para rascunho e refina com Claude Sonnet 4 –
              custo mínimo com alta qualidade 🚀
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
