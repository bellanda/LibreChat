// src/pages/PrecoTokenizacaoLimitacoesPage.jsx
import { useModelDescriptions } from '../../../../hooks/useModelDescriptions';
import SectionRecommendations from '../../components/SectionRecommendations';




const CostExample = () => (
  <div className="bg-gray-800 p-6 ">
    <h3 className="text-xl font-semibold text-white mb-2">Exemplo de Cálculo de Custo</h3>
    <ul className="list-disc list-inside mt-2 text-gray-200 space-y-1">
      <li>
        <span className="font-semibold">Prompt:</span> 5.000 tokens
      </li>
      <li>
        <span className="font-semibold">Resposta:</span> 10.000 tokens
      </li>
      <li>
        <span className="font-semibold">Modelo:</span> GPT-4.1
      </li>
      <li>
        <span className="font-semibold">Cálculo Entrada:</span> 5.000 / 1.000.000 × $2,00 = <span className="font-semibold">$0,01</span>
      </li>
      <li>
        <span className="font-semibold">Cálculo Saída:</span> 10.000 / 1.000.000 × $8,00 = <span className="font-semibold">$0,08</span>
      </li>
      <li>
        <span className="font-semibold">Total:</span> <span className="text-green-300 font-bold">$0,09</span> (15.000 tokens)
      </li>
    </ul>
  </div>
);

const PriceTable = () => {
  const { descriptions, loading } = useModelDescriptions();

  if (loading) {
    return (
      <div className="overflow-x-auto rounded-lg shadow-lg">
        <div className="min-w-full bg-gray-800 p-8 text-center">
          <div className="text-gray-300">Carregando descrições dos modelos...</div>
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
            <th className="px-4 py-2 text-left text-white">Preço Saída</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(descriptions).map((model) => {
            if (descriptions[model].shortUseCase !== undefined) {
              return (
                <tr key={model} className="hover:bg-gray-700 transition-colors">
                  <td className="px-4 py-2 text-gray-300 font-semibold text-green-300">{descriptions[model].name}</td>
                  <td className="px-4 py-2 text-gray-300">{descriptions[model].shortUseCase}</td>
                  <td className="px-4 py-2 text-gray-200">{descriptions[model].prompt?.toFixed(1) || 'N/A'}</td>
                  <td className="px-4 py-2 text-gray-200">{descriptions[model].completion?.toFixed(1) || 'N/A'}</td>
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

const models_task_day_to_day_items = [
  'Escrever e-mails formais',
  'Resumir textos longos',
  'Fazer pesquisas de senso-comum',
  'Tirar dúvidas de curiosidade',
  'Gerar rascunhos de posts',
  'Reformular frases',
  'Traduzir trechos rápidos',
]
const models_task_day_to_day = [
  { emoji: '🟢', name: 'Qwen3 235B Instruct', cost: '0.2 / 0.9', speed: '⚡⚡⚡', capacity: '🧩🧩🧩',},
  { emoji: '🟢', name: 'DeepSeek V3.1', cost: '0.9 / 0.9', speed: '⚡⚡', capacity: '🧩🧩',},
  { emoji: '🟢', name: 'Gemini 2.5 Flash', cost: '0.3 / 2.5', speed: '⚡⚡⚡', capacity: '🧩🧩',},
  { emoji: '🟢', name: 'GPT-4.1 Mini', cost: '0.4 / 1.6', speed: '⚡⚡', capacity: '🧩🧩🧩', },
  { emoji: '🟢', name: 'Llama 4 Maverick',cost: '0.2 / 0.6',speed: '⚡⚡⚡',capacity: '🧩🧩',
  },
]

const models_web_search_items = [
  'Checar notícias de última hora',
  'Comparar preços de produtos',
  'Coletar estatísticas atualizadas',
  'Confirmar fatos históricos ou científicos',
  'Encontrar referências acadêmicas',
  'Descobrir tendências de mercado',
]

const models_web_search = [
  { emoji: '🟡', name: 'GPT-4.1', cost: '2.0 / 8.0', speed: '⚡⚡', capacity: '🧩🧩🧩🧩' },
  { emoji: '🟡', name: 'o4-Mini', cost: '1.1 / 4.4', speed: '⚡⚡⚡', capacity: '🧩🧩🧩' },
  { emoji: '🟡', name: 'Gemini 2.5 Flash', cost: '0.3 / 2.5', speed: '⚡⚡⚡', capacity: '🧩🧩' },
]

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
]
const models_code_and_software_engineering = [
  { emoji: '🔵', name: 'Claude Sonnet 4', cost: '3.0 / 15.0', speed: '⚡⚡', capacity: '🧩🧩🧩🧩🧩' },
  { emoji: '🔵', name: 'Qwen3 Coder 480B', cost: '0.5 / 1.8', speed: '⚡⚡⚡', capacity: '🧩🧩🧩🧩' },
  { emoji: '🔵', name: 'GPT-4.1', cost: '2.0 / 8.0', speed: '⚡⚡', capacity: '🧩🧩🧩🧩' },
  { emoji: '🔵', name: 'o3', cost: '2.0 / 8.0', speed: '⚡⚡', capacity: '🧩🧩🧩🧩' },
  { emoji: '🔵', name: 'Grok 4', cost: '3.0 / 15.0', speed: '⚡⚡', capacity: '🧩🧩🧩🧩' },
  { emoji: '🔵', name: 'Gemini 2.5 Pro', cost: '2.0 / 12.5', speed: '⚡⚡', capacity: '🧩🧩🧩🧩' },
]

const models_maximum_complexity_items = [
  'Raciocínio multietapa',
  'Análises estratégicas',
  'Pesquisa científica avançada',
  'Design de algoritmos',
  'Simulações de cenários',
  'Provas matemáticas',
  'Elaborações de políticas públicas',
  'Arquitetura de sistemas',
]
const models_maximum_complexity = [
  { emoji: '🔴', name: 'Grok 4', cost: '3.0 / 15.0', speed: '⚡⚡', capacity: '🧩🧩🧩🧩🧩' },
  { emoji: '🔴', name: 'o3', cost: '2.0 / 8.0', speed: '⚡⚡', capacity: '🧩🧩🧩🧩🧩' },
  { emoji: '🔴', name: 'Gemini 2.5 Pro', cost: '2.0 / 12.5', speed: '⚡⚡', capacity: '🧩🧩🧩🧩🧩' },
  { emoji: '🔴', name: 'Claude Sonnet 4', cost: '3.0 / 15.0', speed: '⚡⚡', capacity: '🧩🧩🧩🧩🧩' },
  { emoji: '🔴', name: 'DeepSeek R1', cost: '3.0 / 8.0', speed: '⚡⚡', capacity: '🧩🧩🧩🧩' },
]

const models_ultra_velocity_items = [
  'Respostas instantâneas',
  'Chat-bots em tempo real',
  'Autocompletar',
  'Geração de texto curto',
  'Brainstorming rápido',
  'Sem execução de código nem busca na web',
]
const models_ultra_velocity = [
  { emoji: '⚪', name: 'Llama 4 Maverick', cost: '0.2 / 0.6', speed: '⚡⚡⚡⚡', capacity: '🧩🧩' },
  { emoji: '⚪', name: 'Llama 4 Scout', cost: '0.1 / 0.3', speed: '⚡⚡⚡⚡⚡', capacity: '🧩' },
]



export default function PrecoTokenizacaoLimitacoesPage() {
  return (
    <div className="mx-auto">
      <section className="mt-12" id="custo-token" title="Custos por Token">
        <h2 className="text-2xl font-semibold text-white mb-4">Custos por Token</h2>
        <p className="text-gray-200 leading-relaxed">
          Cada modelo de IA possui um preço calculado por{' '}
          <span className="font-semibold text-green-300">tokens</span>, tanto na entrada (prompt) quanto na saída
          (resposta). Entender esses valores é chave para manter o orçamento sob controle.
        </p>
      </section>

      <section className='mt-12' id="impacto-custo" title="Como os Tokens Impactam no Custo">
        <h2 className="text-2xl font-semibold text-white mb-4">Como os Tokens Impactam no Custo</h2>
        <p className="text-gray-200 leading-relaxed mb-4">
          O valor total de uma chamada API é a soma dos tokens de entrada e saída multiplicados pelo preço
          unitário de cada modelo. Prompts mais longos e respostas detalhadas consomem mais tokens, elevando
          o custo.
        </p>
        <CostExample />
      </section>

      <section className='mt-12' id="tabela-precos" title="Tabela de Preços por Modelo ($USD/1M tokens)">
        <h2 className="text-2xl font-semibold text-white mb-4">Tabela de Preços por Modelo ($USD/1M tokens)</h2>
        <PriceTable />
      </section>


      <section className='mt-12' id="perfis-uso" title="Recomendações por Perfil de Uso">
        <h2 className="text-2xl font-semibold text-white mb-4">Recomendações por Perfil de Uso</h2>
        <SectionRecommendations title="Tarefas Comuns do Dia a Dia" items={models_task_day_to_day_items} models={models_task_day_to_day} />
        <SectionRecommendations title="Pesquisa na Web" items={models_web_search_items} models={models_web_search} />
        <SectionRecommendations title="Código & Engenharia de Software" items={models_code_and_software_engineering_items} models={models_code_and_software_engineering} />
        <SectionRecommendations title="Máxima Complexidade" items={models_maximum_complexity_items} models={models_maximum_complexity} />
        <SectionRecommendations title="Ultra-Velocidade" items={models_ultra_velocity_items} models={models_ultra_velocity} />

        <div className="mt-12 text-gray-200">
          <p>💡 <span className="font-semibold">Dicas Extras de Economia</span></p>
          <div className="pl-4 pb-4">
            <li>Prompt enxuto = menos tokens de entrada (💵)</li>
            <li>Crie sempre novos chats após 2-3 interações.</li>
            <li>Agrupe perguntas em lotes sempre que possível (“batching”)</li>
            <li>Combine modelos: use um Llama 4 Scout para rascunhar e depois refine com Claude Sonnet 4.</li>
          </div>
        </div>
      </section>
    </div>
  );
}
