export default function VisaoGeralPage() {
  return (
    <div className="space-y-6 text-gray-300">
      {/* <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200"> */}
      {/* <h3 className="text-xl font-semibold text-slate-800 mb-4">Objetivo da Plataforma</h3> */}
      <div className="text-justify text-gray-300">
        <p>
          A presente plataforma tem como principal objetivo democratizar o acesso a modelos de
          Inteligência Artificial no ambiente corporativo, promovendo inovação, agilidade e
          autonomia nas atividades diárias dos colaboradores.
        </p>
        <br />
        <p>
          Por meio de uma interface simples e acessível, disponibilizamos gratuitamente diversos
          modelos de IA integrados ao LibreOffice, permitindo que todos os usuários da empresa
          possam gerar conteúdos, revisar textos, automatizar tarefas e tomar decisões com apoio
          inteligente, sem a necessidade de conhecimento técnico avançado.
        </p>
        <br />
        <p>
          Ao centralizar essas ferramentas em um único ambiente, buscamos fomentar a cultura digital
          na organização, otimizando fluxos de trabalho, ampliando a produtividade e reduzindo o
          retrabalho, sempre com foco na segurança da informação e no uso ético das tecnologias
          emergentes.
        </p>
      </div>

      <div className="rounded-lg border border-gray-700 bg-[#1c1c1c] p-6 shadow-sm">
        <h3 className="mb-4 text-xl font-semibold text-white">Benefícios de uso</h3>
        <ul className="list-inside list-disc text-gray-300">
          <li>Aumento significativo de produtividade</li>
          <li>Geração de insights a partir de textos complexos</li>
          <li>Otimização de processos repetitivos</li>
          <li>Interface intuitiva e fácil de usar</li>
        </ul>
      </div>

      <div className="rounded-lg border border-gray-700 bg-[#1c1c1c] p-6 shadow-sm">
        <h3 className="mb-4 text-xl font-semibold text-white">Exemplos Rápidos de Uso</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg bg-blue-50 p-4">
            <h4 className="mb-2 font-semibold text-blue-800">📄 Resumo de Documentos</h4>
            <p className="text-blue-700">
              Gerar um resumo de um artigo longo ou relatório complexo
            </p>
          </div>
          <div className="rounded-lg bg-green-50 p-4">
            <h4 className="mb-2 font-semibold text-green-800">📧 E-mails Profissionais</h4>
            <p className="text-green-700">Criar e-mails de marketing ou comunicação corporativa</p>
          </div>
          <div className="rounded-lg bg-purple-50 p-4">
            <h4 className="mb-2 font-semibold text-purple-800">💻 Código Simples</h4>
            <p className="text-purple-700">
              Escrever código básico em Python, JavaScript ou outras linguagens
            </p>
          </div>
          <div className="rounded-lg bg-orange-50 p-4">
            <h4 className="mb-2 font-semibold text-orange-800">📊 Análise de Dados</h4>
            <p className="text-orange-700">Interpretar e explicar dados ou gráficos</p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-gray-700 bg-gray-800 p-6">
        <h3 className="mb-4 text-lg font-semibold text-white">📞 Suporte e Feedback</h3>
        <p className="text-gray-300">
          Para reportar bugs, sugerir melhorias ou obter suporte, entre em contato com a equipe
          através dos canais oficiais da empresa.
        </p>
        <div className="flex gap-6">
          <ul className="list-inside list-disc text-gray-300">
            <li>
              <a
                target="_blank"
                href="https://teams.microsoft.com/l/chat/0/0?users=gb810437@hpeautos.com.br"
              >
                Gustavo Bellanda
              </a>
            </li>
          </ul>
          <ul className="list-inside list-disc text-gray-300">
            <li>
              <a
                target="_blank"
                href="https://teams.microsoft.com/l/chat/0/0?users=rm8107@hpeautos.com.br"
              >
                Rafael Melo
              </a>
            </li>
          </ul>
        </div>
      </div>
      {/* <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-200">
            <h3 className="text-xl font-semibold text-indigo-800 mb-4">Modelo de IA Utilizado</h3>
            <p className="text-indigo-700">
              Atualmente, a plataforma utiliza o modelo <span className="font-semibold">GPT‑4o</span>, 
              otimizado para velocidade e precisão, oferecendo respostas rápidas e de alta qualidade.
            </p>
          </div> */}
    </div>
  );
}
