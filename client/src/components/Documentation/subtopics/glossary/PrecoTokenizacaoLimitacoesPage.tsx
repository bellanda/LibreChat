// src/pages/PrecoTokenizacaoLimitacoesPage.jsx
import { models } from '../../utils';

const Section = ({ id, title, children }) => (
  <section id={id} className="mt-12">
    <h2 className="text-2xl font-semibold text-white mb-4">{title}</h2>
    {children}
  </section>
);

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

const PriceTable = () => (
  <div className="overflow-x-auto rounded-lg shadow-lg">
    <table className="min-w-full bg-gray-800">
      <thead>
        <tr className="border-b border-gray-700">
          <th className="px-4 py-2 text-left text-white">Empresa</th>
          <th className="px-4 py-2 text-left text-white">Modelo</th>
          <th className="px-4 py-2 text-left text-white">Descrição</th>
          <th className="px-4 py-2 text-left text-white">Preço Entrada</th>
          <th className="px-4 py-2 text-left text-white">Preço Saída</th>
        </tr>
      </thead>
      <tbody>
        {models.map((company) =>
          company.models.map((model) => (
            <tr
              key={`${company.company}-${model.name}`}
              className="hover:bg-gray-700 transition-colors"
            >
              <td className="px-4 py-2 text-gray-300">{company.company}</td>
              <td className="px-4 py-2 font-semibold text-green-300">{model.name}</td>
              <td className="px-4 py-2 text-gray-300">{model.description}</td>
              <td className="px-4 py-2 text-gray-200">
                {model.price_input} {model.price_currency}
              </td>
              <td className="px-4 py-2 text-gray-200">
                {model.price_output} {model.price_currency}
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

const TipsList = () => (
  <ul className="list-disc list-inside space-y-2 text-gray-200">
    <li>
      <span className="font-semibold">Seja objetivo:</span> Use prompts curtos e claros para reduzir
      tokens de entrada.
    </li>
    <li>
      <span className="font-semibold">Limite a resposta:</span> Formule a resposta conforme sua preferência, a fim de restringir o escopo das respostas.
    </li>
    <li>
      <span className="font-semibold">Escolha o modelo certo:</span> Siga a tabela de preços por modelo e verifique necessidades específicas.
    </li>
    <li>
      <span className="font-semibold">Batching:</span> Agrupe múltiplas solicitações em uma só quando
      possível.
    </li>
  </ul>
);

const ProfileRecommendations = () => (
  <div className="space-y-2 text-gray-200">
    <div>
      <h4 className="text-lg font-semibold text-green-400">Requisições Simples</h4>
      <p className="ml-4 text-gray-300 text-sm">
        Modelos: GPT-4.1-nano, Gemini 2.5 Flash Lite
      </p>
    </div>
    <div>
      <h4 className="text-lg font-semibold text-yellow-400">Requisições Médias</h4>
      <p className="ml-4 text-gray-300 text-sm">
        Modelos: GPT-o4-mini, Gemini 2.5 Flash, Kimi K2 (Groq)
      </p>
    </div>
    <div>
      <h4 className="text-lg font-semibold text-red-400">Requisições Complexas</h4>
      <p className="ml-4 text-gray-300 text-sm">
        Modelos: Claude Sonnet 4, Gemini 2.5 Pro, GPT-4.1
      </p>
    </div>
  </div>
);

export default function PrecoTokenizacaoLimitacoesPage() {
  return (
    <div className="mx-auto ">
      <header>
        <h1 className="text-4xl font-bold text-white">Preço e Limitações de Tokenização</h1>
      </header>

      <Section id="custo-token" title="Custos por Token">
        <p className="text-gray-200 leading-relaxed">
          Cada modelo de IA possui um preço calculado por{' '}
          <span className="font-semibold text-green-300">tokens</span>, tanto na entrada (prompt) quanto na saída
          (resposta). Entender esses valores é chave para manter o orçamento sob controle.
        </p>
      </Section>

      <Section id="impacto-custo" title="Como os Tokens Impactam no Custo">
        <p className="text-gray-200 leading-relaxed mb-4">
          O valor total de uma chamada API é a soma dos tokens de entrada e saída multiplicados pelo preço
          unitário de cada modelo. Prompts mais longos e respostas detalhadas consomem mais tokens, elevando
          o custo.
        </p>
        <CostExample />
      </Section>

      <Section id="tabela-precos" title="Tabela de Preços por Modelo">
        <PriceTable />
      </Section>

      <Section id="dicas-otimizacao" title="Dicas para Otimizar Custos">
        <TipsList />
      </Section>

      <Section id="perfis-uso" title="Recomendações por Perfil de Uso">
        <ProfileRecommendations />
      </Section>
    </div>
  );
}
