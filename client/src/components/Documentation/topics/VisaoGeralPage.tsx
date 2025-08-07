export default function VisaoGeralPage() {
  return (
    <main className="space-y-6 text-gray-300">
      {/* Objetivo da Plataforma */}
      <section className="text-justify">
        <h2 className="mb-4 text-2xl font-semibold text-white">Objetivo da Plataforma</h2>
        <p>
          A <strong>LibreChat</strong> é a solução interna da HPE que democratiza o acesso a{' '}
          <abbr title="Inteligência Artificial">IA</abbr> no ambiente corporativo, entregando
          inovação, agilidade e autonomia para os colaboradores.
        </p>
        <p className="mt-2">
          Oferecemos, de forma gratuita, <strong>todos os modelos de IA de alto nível</strong> que
          normalmente são pagos, integrados a um ambiente seguro e fácil de usar, sem necessidade de
          conhecimento técnico avançado.
        </p>
        <p className="mt-2">
          Ao centralizar dados, fomentamos a cultura de IA, otimizamos processos, ampliamos a
          produtividade e garantimos segurança da informação e uso ético.
        </p>
      </section>

      {/* Benefícios */}
      <section className="rounded-lg border border-gray-700 bg-[#1c1c1c] p-6">
        <h3 className="mb-4 text-xl font-semibold text-white">Benefícios</h3>
        <ol className="list-inside list-decimal space-y-2 text-gray-300">
          <li>Centralização segura de dados corporativos</li>
          <li>
            Disponibilização de<strong> modelos pagos de alto nível</strong> para todos os
            colaboradores HPE
          </li>
          <li>Fomento à cultura de IA e boas práticas de uso</li>
          <li>Possibilidade futura de criar agentes de IA personalizados da HPE</li>
          <li>Base open‑source: fork do projeto LibreChat</li>
          <li>Interface simples, acessível e responsiva</li>
          <li>Conformidade com segurança da informação e princípios éticos</li>
        </ol>
      </section>

      {/* Exemplos de Uso */}
      <section className="rounded-lg border border-gray-700 bg-[#1c1c1c] p-6">
        <h3 className="mb-4 text-xl font-semibold text-white">Exemplos rápidos de uso</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded bg-blue-50 p-4">
            <h4 className="mb-1 flex items-center font-medium text-blue-800">
              📄 Resumo de Documentos
            </h4>
            <p className="text-blue-800">Gera resumos claros de relatórios e artigos extensos</p>
          </div>
          <div className="rounded bg-green-50 p-4">
            <h4 className="mb-1 flex items-center font-medium text-green-800">
              📧 E‑mail Profissional
            </h4>
            <p className="text-green-800">
              Cria e‑mails de marketing, comunicação interna e respostas automáticas
            </p>
          </div>
          <div className="bg-purple-50 p-4">
            <h4 className="mb-1 flex items-center font-medium text-purple-800">
              💻 Engenharia de Software e Código
            </h4>
            <p className="text-purple-800">
              Escreve trechos de código em Python, JavaScript ou outras linguagens
            </p>
          </div>
          <div className="bg-orange-50 p-4">
            <h4 className="mb-1 flex items-center font-medium text-orange-800">
              📊 Análise de Dados
            </h4>
            <p className="text-orange-800">Interpreta e explica dados, gráficos e dashboards</p>
          </div>

          <div className="bg-red-50 p-4">
            <h4 className="mb-1 flex items-center font-medium text-red-800">
              📊 Aprendizado, estudo, conhecimento geral, etc.
            </h4>
            <p className="text-red-800">
              Responde perguntas sobre assuntos diversos, como história, filosofia, etc.
            </p>
          </div>

          <div className="bg-green-50 p-4">
            <h4 className="mb-1 flex items-center font-medium text-green-800">
              📊 Matemática, Estatística, Física (Problemas complexos que exigem cálculos)
            </h4>
            <p className="text-green-800">
              Responde perguntas sobre matemática, estatística, física, etc.
            </p>
          </div>
        </div>
      </section>

      {/* Futuro: agentes personalizados */}
      <section className="rounded border border-gray-700 bg-gray-800 p-6">
        <h3 className="mb-4 text-lg font-semibold text-white">
          🚀 Futuro: agentes de IA personalizados
        </h3>
        <p className="text-gray-300">
          Em breve, a plataforma permitirá que equipes criem
          <strong> agentes de IA customizados</strong>
          para áreas específicas (suporte técnico, análise de contratos, automação de processos
          etc.), publicados e gerenciados via LibreChat, mantendo controle de segurança e
          governança.
        </p>
      </section>

      {/* Suporte e Feedback */}
      <section className="rounded border border-gray-700 bg-[#1c1c1c] p-6">
        <h3 className="mb-4 text-lg font-semibold text-white">📞 Suporte & Feedback</h3>
        <p className="text-gray-300">Para reportar bugs ou solicitar melhorias, contate:</p>
        <ul className="mt-2 space-y-2">
          <li>
            <a
              href="https://teams.microsoft.com/l/chat/0/0?users=gb810437@hpeautos.com.br"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 underline"
            >
              Gustavo Bellanda
            </a>
          </li>
          <li>
            <a
              href="https://teams.microsoft.com/l/chat/0/0?users=rm8107@hpeautos.com.br"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 underline"
            >
              Rafael Melo
            </a>
          </li>
        </ul>
      </section>
    </main>
  );
}
