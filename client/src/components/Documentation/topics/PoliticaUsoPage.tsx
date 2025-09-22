export default function PoliticaUsoPage() {
  return (
    <main className="space-y-6 text-gray-300">
      {/* Cabeçalho da Política */}
      <section className="text-center">
        <h1 className="mb-4 text-3xl font-bold text-white">
          POLÍTICA INTERNA DE USO DE INTELIGÊNCIA ARTIFICIAL
        </h1>
        <div className="mb-6 grid grid-cols-1 gap-4 rounded-lg border border-gray-700 bg-[#1c1c1c] p-6 md:grid-cols-3">
          <div>
            <strong className="text-white">Código:</strong>
            <p>POL-CORP-COMPL-0005</p>
          </div>
          <div>
            <strong className="text-white">Revisão:</strong>
            <p>00</p>
          </div>
          <div>
            <strong className="text-white">Categoria:</strong>
            <p>POLÍTICA</p>
          </div>
        </div>
      </section>

      {/* Sumário */}
      <section className="rounded-lg border border-gray-700 bg-[#1c1c1c] p-6">
        <h2 className="mb-4 text-2xl font-semibold text-white">Sumário</h2>
        <div className="space-y-2 text-gray-300">
          <div className="flex justify-between items-center">
            <a
              href="/documentation/politica-de-uso-de-ia#objetivo"
              className="text-left transition-colors hover:text-white"
            >
              1. OBJETIVO
            </a>
            <span className="text-right">2</span>
          </div>
          <div className="flex justify-between items-center">
            <a
              href="/documentation/politica-de-uso-de-ia#abrangencia"
              className="text-left transition-colors hover:text-white"
            >
              2. ABRANGÊNCIA
            </a>
            <span className="text-right">2</span>
          </div>
          <div className="flex justify-between items-center">
            <a
              href="/documentation/politica-de-uso-de-ia#definicoes"
              className="text-left transition-colors hover:text-white"
            >
              3. DEFINIÇÕES
            </a>
            <span className="text-right">2</span>
          </div>
          <div className="flex justify-between items-center">
            <a
              href="/documentation/politica-de-uso-de-ia#inteligencia-artificial"
              className="text-left transition-colors hover:text-white"
            >
              4. INTELIGÊNCIA ARTIFICIAL
            </a>
            <span className="text-right">3</span>
          </div>
          <div className="flex justify-between items-center">
            <a
              href="/documentation/politica-de-uso-de-ia#principios-orientadores"
              className="text-left transition-colors hover:text-white"
            >
              5. PRINCÍPIOS ORIENTADORES DO USO ÉTICO DE FERRAMENTAS DE IA
            </a>
            <span className="text-right">3</span>
          </div>
          <div className="flex justify-between items-center">
            <a
              href="/documentation/politica-de-uso-de-ia#comite-ia"
              className="text-left transition-colors hover:text-white"
            >
              6. COMITÊ DE IA
            </a>
            <span className="text-right">4</span>
          </div>
          <div className="flex justify-between items-center">
            <a
              href="/documentation/politica-de-uso-de-ia#plataformas-ia"
              className="text-left transition-colors hover:text-white"
            >
              7. PLATAFORMAS DE IA AUTORIZADAS PARA USO
            </a>
            <span className="text-right">4</span>
          </div>
          <div className="flex justify-between items-center">
            <a
              href="/documentation/politica-de-uso-de-ia#diretrizes-uso"
              className="text-left transition-colors hover:text-white"
            >
              8. DIRETRIZES DE USO
            </a>
            <span className="text-right">5</span>
          </div>
          <div className="flex justify-between items-center">
            <a
              href="/documentation/politica-de-uso-de-ia#seguranca-informacao"
              className="text-left transition-colors hover:text-white"
            >
              9. SEGURANÇA DA INFORMAÇÃO
            </a>
            <span className="text-right">6</span>
          </div>
          <div className="flex justify-between items-center">
            <a
              href="/documentation/politica-de-uso-de-ia#armazenamento-retencao"
              className="text-left transition-colors hover:text-white"
            >
              10. ARMAZENAMENTO E RETENÇÃO DE DADOS
            </a>
            <span className="text-right">6</span>
          </div>
          <div className="flex justify-between items-center">
            <a
              href="/documentation/politica-de-uso-de-ia#monitoramento-auditoria"
              className="text-left transition-colors hover:text-white"
            >
              11. MONITORAMENTO, AUDITORIA E PENALIDADES
            </a>
            <span className="text-right">7</span>
          </div>
          <div className="flex justify-between items-center">
            <a
              href="/documentation/politica-de-uso-de-ia#referencias"
              className="text-left transition-colors hover:text-white"
            >
              12. REFERÊNCIAS
            </a>
            <span className="text-right">7</span>
          </div>
          <div className="flex justify-between items-center">
            <a
              href="/documentation/politica-de-uso-de-ia#atualizacoes"
              className="text-left transition-colors hover:text-white"
            >
              13. ATUALIZAÇÕES
            </a>
            <span className="text-right">7</span>
          </div>
          <div className="flex justify-between items-center">
            <a
              href="/documentation/politica-de-uso-de-ia#controle-documento"
              className="text-left transition-colors hover:text-white"
            >
              14. CONTROLE DO DOCUMENTO
            </a>
            <span className="text-right">7</span>
          </div>
          <div className="flex justify-between items-center">
            <a
              href="/documentation/politica-de-uso-de-ia#niveis-aprovacao"
              className="text-left transition-colors hover:text-white"
            >
              15. NÍVEIS DE APROVAÇÃO
            </a>
            <span className="text-right">7</span>
          </div>
        </div>
      </section>

      {/* 1. OBJETIVO */}
      <section id="objetivo" className="text-justify">
        <h2 className="mb-4 text-2xl font-semibold text-white">1. OBJETIVO</h2>
        <p>
          Esta política ("Política de IA") tem como objetivo estabelecer diretrizes claras e
          abrangentes para o uso seguro, transparente e responsável de ferramentas de Inteligência
          Artificial no âmbito organizacional.
        </p>
        <p className="mt-2">
          O uso responsável da IA permite ganhos significativos em produtividade, criatividade e
          suporte à tomada de decisão, atuando como ferramenta estratégica de apoio aos processos
          internos.
        </p>
        <p className="mt-2">
          Esse uso deverá estar sempre alinhado aos valores da HPE – conforme constam no nosso
          Código de Ética e Conduta dos Colaboradores – ou seja, em estrita conformidade com os
          princípios éticos e demais políticas internas.
        </p>
      </section>

      {/* 2. ABRANGÊNCIA */}
      <section id="abrangencia" className="text-justify">
        <h2 className="mb-4 text-2xl font-semibold text-white">2. ABRANGÊNCIA</h2>
        <p>
          Esta política se aplica a todos os colaboradores da HPE Automotores do Brasil Ltda.
          ("HPE") e das demais empresas do Grupo. Também se estende, quando aplicável, a terceiros,
          prestadores de serviço e parceiros que utilizem, direta ou indiretamente, as ferramentas
          de IA fornecidas ou autorizadas pela HPE, identificados nesta política como ("Usuários").
        </p>
      </section>

      {/* 3. DEFINIÇÕES */}
      <section id="definicoes" className="text-justify">
        <h2 className="mb-4 text-2xl font-semibold text-white">3. DEFINIÇÕES</h2>
        <div className="space-y-4">
          <div>
            <strong className="text-white">Agentes de IA:</strong>
            <p className="mt-1">
              Programas ou sistemas que utilizam Inteligência Artificial para executar atividades de
              forma autônoma ou semiautônoma. Eles podem interagir com pessoas, outros sistemas ou
              até com outros agentes de IA. Exemplos: chatbots que atendem clientes, assistentes
              virtuais que organizam tarefas ou softwares que monitoram e ajustam processos
              automaticamente.
            </p>
          </div>
          <div>
            <strong className="text-white">Algoritmos:</strong>
            <p className="mt-1">
              Conjuntos de instruções lógicas e matemáticas que orientam como um dispositivo ou
              sistema deve processar informações para alcançar determinado resultado.
            </p>
          </div>
          <div>
            <strong className="text-white">Alucinações:</strong>
            <p className="mt-1">
              Refere-se à geração de conteúdo falso, incoerente ou inventado por um modelo de IA,
              mesmo que pareça plausível. Isso acontece quando o modelo "preenche lacunas" de
              conhecimento com informações que não são baseadas em dados reais, mas sim em padrões
              aprendidos durante o treinamento. Em vez de simplesmente fornecer informações
              precisas, a IA pode "alucinar" e criar respostas que parecem convincentes, mas são
              incorretas, inventadas ou até mesmo absurdas.
            </p>
          </div>
          <div>
            <strong className="text-white">Ataques Cibernéticos:</strong>
            <p className="mt-1">
              Ações maliciosas realizadas por indivíduos ou grupos com o objetivo de comprometer
              sistemas, redes ou dados. Esses ataques podem ter diferentes finalidades, como roubo
              de informações, interrupção de serviços, fraude financeira ou espionagem. Exemplos
              comuns incluem phishing (tentativas de enganar usuários para obter senhas), ransomware
              (sequestro de dados mediante pagamento.
            </p>
          </div>
          <div>
            <strong className="text-white">Backup:</strong>
            <p className="mt-1">
              Cópia de segurança das informações, realizada para evitar perdas em caso de falhas
              técnicas, exclusão acidental, ataques cibernéticos ou desastres. O backup pode ser
              armazenado em diferentes mídias ou serviços, como nuvem, servidores externos ou
              dispositivos físicos, garantindo que as informações possam ser recuperadas quando
              necessário.
            </p>
          </div>
          <div>
            <strong className="text-white">Criptografia:</strong>
            <p className="mt-1">
              Técnica de proteção que transforma informações em um código indecifrável para quem não
              possui a chave correta de leitura. É amplamente utilizada em troca de mensagens,
              transações bancárias e armazenamento, garantindo sigilo, autenticidade e integridade
              das informações.
            </p>
          </div>
          <div>
            <strong className="text-white">Dados Pessoais:</strong>
            <p className="mt-1">
              Informações que identificam ou permitem identificar uma pessoa, direta ou
              indiretamente. Isso inclui dados como nome, CPF, RG, e-mail, telefone, endereço,
              geolocalização, além de identificadores digitais. São dados protegidos por leis
              específicas, como a Lei Geral de Proteção de Dados ("LGPD").
            </p>
          </div>
          <div>
            <strong className="text-white">IA Generativa:</strong>
            <p className="mt-1">
              Tipo de Inteligência Artificial projetada para desenvolver conteúdo a partir de
              grandes volumes de dados já existentes. Ela pode produzir textos, imagens, músicas,
              vídeos ou códigos de programação. Exemplos comuns são ferramentas que escrevem textos
              automaticamente, geram imagens realistas a partir de descrições ou criam vídeos de
              forma automatizada.
            </p>
          </div>
          <div>
            <strong className="text-white">Identificadores Digitais:</strong>
            <p className="mt-1">
              Informações eletrônicas que permitem reconhecer ou diferenciar um usuário, dispositivo
              ou conexão na internet. Esses identificadores podem ser usados para personalizar
              experiências online, analisar comportamentos de navegação ou oferecer publicidade
              direcionada. Em muitos casos, são considerados dados pessoais, pois podem revelar ou
              contribuir para a identificação de uma pessoa.
            </p>
          </div>
          <div>
            <strong className="text-white">Incidentes de Segurança:</strong>
            <p className="mt-1">
              Eventos que afetam a confidencialidade, integridade ou disponibilidade de informações
              e sistemas. Podem incluir acessos não autorizados, vazamento de dados, roubo de
              credenciais, falhas em servidores ou ataques cibernéticos. A gestão adequada desses
              incidentes é essencial para reduzir riscos e danos à organização.
            </p>
          </div>
          <div>
            <strong className="text-white">Modelos de IA:</strong>
            <p className="mt-1">
              Estruturas matemáticas e computacionais treinadas com grandes volumes de dados para
              reconhecer padrões, tomar decisões ou gerar resultados de forma automática. Os modelos
              são a base de funcionamento da Inteligência Artificial e podem ser usados para
              diversas finalidades, como classificar imagens, prever comportamentos, analisar textos
              ou na criação de conteúdo. Exemplos de modelos de IA incluem sistemas de recomendação
              em plataformas digitais, assistentes virtuais e modelos generativos que produzem
              textos ou imagens.
            </p>
          </div>
          <div>
            <strong className="text-white">Prompt:</strong>
            <p className="mt-1">
              Comando, pergunta ou instrução fornecida a um sistema de Inteligência Artificial para
              direcionar sua resposta ou ação. Quanto mais claro e detalhado for o prompt, maior a
              chance de o sistema gerar um resultado útil e adequado. Exemplo: pedir para a IA
              "escreva um resumo de uma notícia em 5 linhas" ou "crie uma imagem de veículo com
              tração 4x4".
            </p>
          </div>
        </div>
      </section>

      {/* 4. INTELIGÊNCIA ARTIFICIAL */}
      <section id="inteligencia-artificial" className="text-justify">
        <h2 className="mb-4 text-2xl font-semibold text-white">4. INTELIGÊNCIA ARTIFICIAL</h2>
        <p>
          Inteligência Artificial ("IA") é um ramo da ciência da computação voltado ao
          desenvolvimento de sistemas capazes de executar tarefas que tradicionalmente requerem a
          inteligência humana, tais como raciocínio, aprendizado, percepção e tomada de decisão.
        </p>
        <p className="mt-2">
          No contexto corporativo, a IA generativa pode ser utilizada para diversas finalidades,
          como, por exemplo, o apoio à redação de documentos, elaboração de relatórios, criação de
          apresentações, personalização de campanhas de marketing, automação de atendimento ao
          cliente e geração de insights estratégicos a partir de padrões aprendidos em grandes
          volumes de dados.
        </p>
      </section>

      {/* 5. PRINCÍPIOS ORIENTADORES */}
      <section id="principios-orientadores" className="text-justify">
        <h2 className="mb-4 text-2xl font-semibold text-white">
          5. PRINCÍPIOS ORIENTADORES DO USO ÉTICO DE FERRAMENTAS DE IA
        </h2>
        <p className="mb-4">
          O uso da IA deverá estar sempre alinhado aos seguintes princípios orientadores:
        </p>
        <ul className="ml-6 space-y-2 list-disc list-inside text-gray-300">
          <li>
            <strong className="text-white">Diversidade, Equidade e Não Discriminação:</strong>{' '}
            garantir que seus resultados não reforcem preconceitos ou discriminações contra
            indivíduos ou grupos nos dados de entrada e nas respostas geradas, respeitando a
            dignidade, igualdade e diversidade;
          </li>
          <li>
            <strong className="text-white">Melhoria Contínua:</strong> garantir que os sistemas de
            IA sejam revisados e aprimorados regularmente, ajustando-os continuamente as novas
            necessidades de negócio, bem como os desafios e requisitos éticos e tecnológicos;
          </li>
          <li>
            <strong className="text-white">Privacidade e Governança dos Dados:</strong> garantir que
            os dados pessoais sejam tratados com respeito à privacidade dos indivíduos respeitando a
            atual legislação de proteção de dados;
          </li>
          <li>
            <strong className="text-white">Responsabilidade:</strong> garantir supervisão humana
            adequada em toda decisão relevante, especialmente aquelas que possam impactar pessoas,
            processos ou resultados críticos;
          </li>
          <li>
            <strong className="text-white">Segurança e Confiabilidade:</strong> proteger dados
            sensíveis e sigilosos; a não exposição de dados pessoais de clientes e colaboradores,
            direitos individuais ou interesses estratégicos da empresa, com o compromisso de
            utilizar a IA apenas em dispositivos e redes corporativas seguras e homologadas pela
            HPE;
          </li>
          <li>
            <strong className="text-white">Transparência:</strong> garantir a definição clara dos
            modelos utilizados e a finalidade de sua utilização, principalmente quanto à origem e à
            lógica por trás dos conteúdos produzidos, garantindo rastreabilidade, documentação e
            atribuição clara de responsabilidade em todo ciclo de uso da IA.
          </li>
        </ul>
      </section>

      {/* 6. COMITÊ DE IA */}
      <section id="comite-ia" className="text-justify">
        <h2 className="mb-4 text-2xl font-semibold text-white">6. COMITÊ DE IA</h2>
        <p className="mb-4">
          O Comitê de Inteligência Artificial será responsável por coordenar e supervisionar o uso
          das tecnologias de IA na organização, assegurando que sua aplicação esteja alinhada aos
          princípios éticos, à proteção de dados pessoais, às exigências legais e às diretrizes
          estratégicas da empresa.
        </p>
        <p className="mb-4">
          Integrará o comitê os departamentos de "Compliance e Privacidade de Dados", "Tecnologia da
          Informação" e "Gente Gestão", atuando de forma integrada na avaliação, desenvolvimento e
          monitoramento das iniciativas de utilização e integração de IA na HPE, promovendo inovação
          responsável, mitigando ameaças e prevenindo a utilização indevida das ferramentas de IA.
        </p>
        <p className="mb-4">São atribuições do Comitê de IA:</p>
        <ul className="ml-6 space-y-2 list-disc list-inside text-gray-300">
          <li>
            Orientar e treinar os colaboradores no uso de IA promovendo a conscientização sobre
            riscos, responsabilidades e limitações da tecnologia;
          </li>
          <li>
            Definir critérios de homologação para plataformas de IA autorizadas, avaliando riscos
            técnicos e regulatórios;
          </li>
          <li>
            Validar o ambiente de uso das ferramentas de IA garantindo que as soluções operem em
            infraestrutura segura, com controle de acesso, criptografia, políticas de backup e
            demais requisitos de segurança;
          </li>
          <li>
            Monitorar o uso das ferramentas de IA assegurando rastreabilidade, prevenção de
            incidentes e conformidade com os controles estabelecidos;
          </li>
          <li>
            Avaliar impactos em segurança e privacidade decorrentes da adoção da IA em projetos,
            produtos, processos ou iniciativas estratégicas.
          </li>
        </ul>
      </section>

      {/* 7. PLATAFORMAS DE IA AUTORIZADAS */}
      <section id="plataformas-ia" className="text-justify">
        <h2 className="mb-4 text-2xl font-semibold text-white">
          7. PLATAFORMAS DE IA AUTORIZADAS PARA USO
        </h2>
        <p className="mb-4">
          Os colaboradores da HPE devem utilizar exclusivamente as plataformas e sistemas
          oficialmente autorizados nesta política (conforme item 6.1 e 6.2), sendo expressamente
          proibido utilizar modelos de IA que não sejam a HPE-IA ou não homologados.
        </p>

        <div className="mb-6 ml-6">
          <h3 className="mb-3 text-xl font-semibold text-white">7.1 HPE-IA</h3>
          <p>
            Este é o modelo oficial para uso de IA generativa da HPE, criada como uma solução
            interna, esta plataforma disponibiliza acesso a diversos modelos de IA de alto nível
            encontrados no mercado, como, p.ex.: ChatGPT; Gemini; Grok etc., sendo todos eles
            integrados em um ambiente seguro e fácil de usar, garantindo maior segurança e
            integridade na governança do uso dos dados corporativos, bem como alta capacidade de
            auditoria e transparência.
          </p>
        </div>

        <div className="mb-6 ml-6">
          <h3 className="mb-3 text-xl font-semibold text-white">
            7.2 OUTRAS PLATAFORMAS HOMOLOGADAS
          </h3>
          <p className="mb-4">
            Caso surja necessidade de utilização de outras plataformas e sistemas que não seja a
            HPE-IA, devem ser analisados os seguintes critérios:
          </p>
          <ol className="ml-6 space-y-2 list-decimal list-inside text-gray-300">
            <li>
              Se o sistema utiliza em sua totalidade o uso de IA e seu produto ou serviço não
              consiga ter sua aplicabilidade ou solução contemplada na plataforma HPE-IA;
            </li>
            <li>
              Se o sistema não utiliza em sua totalidade o uso de IA, mas tenha uma utilização de
              recursos de IA significativos;
            </li>
            <li>
              Sendo fornecedor da HPE que não foi contratado originalmente para fornecimento de
              produto ou serviços que faziam utilização de recursos de IA.
            </li>
          </ol>
          <p className="mt-4">
            Nos itens acima, as plataformas que oferecem produtos ou serviços deverão ser validadas
            pelo Comitê de IA, que fará uma análise da utilização ou contratação pelo departamento,
            que irá fazer um requerimento direcionado ao e-mail: ia.comite@hpeautos.com.br, para
            devida análise e aprovação.
          </p>
          <p className="mt-4">No requerimento, deverão constar de forma detalhada:</p>
          <ol className="ml-6 space-y-2 list-decimal list-inside text-gray-300">
            <li>
              Aprovação prévia do gestor do departamento (apenas no caso de a plataforma não ser um
              fornecedor já contratado pela HPE);
            </li>
            <li>
              Finalidade e necessidade do uso da plataforma ou sistema, ou seja, qual será o produto
              ou serviço que ela irá produzir;
            </li>
          </ol>
          <p className="mt-4">
            O SLA para análise e devida homologação da plataforma deverá ser de: (i) XX dias úteis
            para plataformas que não precisem de testes de uso em sua análise; e, (ii) XX dias úteis
            para plataformas que necessitem de testes de uso em sua análise.
          </p>
          <p className="mt-4">
            O uso de plataformas não homologadas poderá ser configurado como uma atitude antiética,
            conforme previsto no item 7.2.9, do Código de Ética e Conduta dos Colaboradores da HPE,
            podendo acarretar infração passível de medidas disciplinares.
          </p>
        </div>
      </section>

      {/* 8. DIRETRIZES DE USO */}
      <section id="diretrizes-uso" className="text-justify">
        <h2 className="mb-4 text-2xl font-semibold text-white">8. DIRETRIZES DE USO</h2>
        <p className="mb-4">
          O uso da plataforma HPE-IA e demais sistemas homologados devem estar em conformidade com
          Código de Ética e Conduta dos Colaboradores, Política de Privacidade e Proteção de Dados
          Pessoais, Política de Segurança da Informação, bem como demais políticas e normas da HPE.
        </p>

        <div className="mb-6 ml-6">
          <h3 className="mb-3 text-xl font-semibold text-white">É permitido utilizar a IA para:</h3>
          <ul className="ml-6 space-y-2 list-disc list-inside text-gray-300">
            <li>
              Apoiar a criação de conteúdos (e-mails, relatórios, apresentações, documentos técnicos
              etc.);
            </li>
            <li>
              Otimizar tarefas administrativas, revisão textual, traduções e análise de dados;
            </li>
            <li>Explorar soluções e conceitos inovadores relacionados ao setor automotivo;</li>
            <li>
              Desenvolver ideias e realizar simulações, desde que sem incluir dados pessoais
              sensíveis ou informações confidenciais da HPE;
            </li>
            <li>
              Apoiar capacitação interna, mediante uso da IA para simulação de cenários e
              aprendizado;
            </li>
            <li>
              Auxiliar na tomada de decisões, desde que com validação humana e supervisão técnica
              apropriada.
            </li>
          </ul>
        </div>

        <div className="mb-6 ml-6">
          <h3 className="mb-3 text-xl font-semibold text-white">É expressamente proibido:</h3>
          <ul className="ml-6 space-y-2 list-disc list-inside text-gray-300">
            <li>
              Compartilhar informações confidenciais da empresa, clientes, fornecedores ou parceiros
              (contratos, estratégias de mercado, projetos, patentes etc.);
            </li>
            <li>
              Inserir conteúdos protegidos por propriedade industrial, como desenhos técnicos,
              códigos-fonte e algoritmos;
            </li>
            <li>
              Utilizar IA que violem leis de direitos autorais ou a Lei da Propriedade Industrial
              (Lei nº 9.279/1996);
            </li>
            <li>
              Tomar decisões automatizadas com impacto financeiro, jurídico, regulatório ou
              operacional sem revisão humana;
            </li>
            <li>
              Usar IA como substituto de conhecimento técnico especializado em áreas reguladas, sem
              revisão humana;
            </li>
            <li>
              Submeter dados da empresa para treinar "agentes de IA" sem requisição e devida
              autorização do Comitê de IA;
            </li>
            <li>
              Utilizar IA para treinar modelos externos com dados da HPE sem expressa autorização;
            </li>
            <li>
              Realizar treinamentos, demonstrações externas ou publicações com uso de IA sem
              aprovação das áreas responsáveis pelo conteúdo;
            </li>
            <li>
              Utilizar as ferramentas disponibilizadas pela empresa para uso pessoal, considera-se
              uso pessoal qualquer interação com ferramentas de IA que não esteja vinculada a
              atividades ou finalidade adequada ao exercício laboral do colaborador na HPE;
            </li>
            <li>
              Utilizar e-mails, números de telefone, qualquer outra credencial institucional ou
              senha institucional ao criar contas em ferramentas de IA generativa disponíveis
              publicamente e não homologadas pela HPE, sem autorização expressa do Comitê de IA.
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-xl font-semibold text-white">
            8.1 RESPONSABILIDADE DOS USUÁRIOS
          </h3>
          <p className="mb-4">
            O uso de ferramentas de IA generativa exige que o usuário atue com responsabilidade,
            integridade. Cabe ao usuário interpretar criticamente as informações geradas, revisar
            seu conteúdo e garantir sua precisão, relevância e conformidade com as diretrizes
            institucionais.
          </p>
          <p className="mb-4">
            Como as ferramentas de IA estão em constante evolução e, às vezes, podem fornecer
            informações imprecisas, ofensivas ou inapropriadas que não refletem as opiniões e
            posições da HPE, cada usuário deve:
          </p>
          <ul className="ml-6 space-y-2 list-disc list-inside text-gray-300">
            <li>
              Ser capaz de explicar e justificar qualquer resultado impreciso, validando
              criticamente o conteúdo gerado antes de utilizar, prevenindo – com a revisão do
              conteúdo – e mitigando a criação de informações decorrentes de "alucinações";
            </li>
            <li>Validar criticamente o conteúdo gerado antes de utilizar;</li>
            <li>
              Revisar o conteúdo gerado para garantir que não contenha elementos discriminatórios
              com base em raça, cor, religião, sexo, nacionalidade, idade, deficiência, estado
              civil, afiliação política, orientação sexual ou qualquer outra forma de discriminação
              vedada por lei;
            </li>
            <li>
              Reportar quaisquer incidentes de segurança, dúvidas, usos indevidos ou vazamento de
              informações à área de Segurança da Informação imediatamente por meio do e-mail
              incidentes@hpeautos.com.br.
            </li>
          </ul>
        </div>
      </section>

      {/* 9. SEGURANÇA DA INFORMAÇÃO */}
      <section id="seguranca-informacao" className="text-justify">
        <h2 className="mb-4 text-2xl font-semibold text-white">9. SEGURANÇA DA INFORMAÇÃO</h2>
        <p>
          A área de Segurança da Informação da HPE atuará no controle da infraestrutura técnica,
          controle de incidentes e cibersegurança.
        </p>
      </section>

      {/* 10. ARMAZENAMENTO E RETENÇÃO DE DADOS */}
      <section id="armazenamento-retencao" className="text-justify">
        <h2 className="mb-4 text-2xl font-semibold text-white">
          10. ARMAZENAMENTO E RETENÇÃO DE DADOS
        </h2>
        <p className="mb-4">
          Com o objetivo de garantir a segurança da informação, a privacidade e a conformidade com
          legislações aplicáveis, todas as interações realizadas com as ferramentas de Inteligência
          Artificial generativa, por meio dos sistemas homologados pelo Comitê de IA estarão
          sujeitas às seguintes diretrizes de temporalidade e retenção de dados:
        </p>
        <ul className="ml-6 space-y-2 list-disc list-inside text-gray-300">
          <li>
            <strong className="text-white">Retenção de dados:</strong> As informações inseridas e
            geradas durante o uso das plataformas de Inteligência Artificial serão armazenadas
            temporariamente, apenas pelo tempo estritamente necessário para o cumprimento da
            finalidade da interação. O prazo de retenção poderá variar conforme a arquitetura,
            configuração e política de armazenamento adotada por cada modelo ou sistema utilizado.
            Entretanto, sempre que possível, a HPE adotará medidas para limitar a retenção de dados
            ao mínimo necessário, promovendo a eliminação automática dos registros após seu uso.
            Salvo exceções justificadas, de natureza técnica, legal ou operacional, previamente
            aprovadas pelas áreas competentes, os registros das conversas não serão mantidos de
            forma permanente.
          </li>
          <li>
            <strong className="text-white">Exceções e Auditoria:</strong> Em casos de auditoria,
            análise de segurança, ou investigação formal, os dados poderão ser preservados por
            período superior, conforme determinação legal ou regulamentar, sempre mediante
            autorização expressa da sempre mediante autorização expressa das diretorias envolvidas
            no Comitê de IA, conforme suas orientações para auditorias técnicas dos departamentos
            que fazem parte deste comitê.
          </li>
        </ul>
      </section>

      {/* 11. MONITORAMENTO, AUDITORIA E PENALIDADES */}
      <section id="monitoramento-auditoria" className="text-justify">
        <h2 className="mb-4 text-2xl font-semibold text-white">
          11. MONITORAMENTO, AUDITORIA E PENALIDADES
        </h2>
        <p className="mb-4">
          A HPE poderá monitorar o uso das ferramentas de IA com fins de auditoria, segurança e
          conformidade com normas e políticas internas.
        </p>
        <p>
          Violações desta política podem resultar em sanções disciplinares, incluindo advertências,
          suspensão do contrato de trabalho e demissão sem ou por justa causa, além de
          responsabilização civil, administrativa e/ou criminal conforme a gravidade do caso.
        </p>
      </section>

      {/* 12. REFERÊNCIAS */}
      <section id="referencias" className="text-justify">
        <h2 className="mb-4 text-2xl font-semibold text-white">12. REFERÊNCIAS</h2>
        <ul className="ml-6 space-y-2 list-disc list-inside text-gray-300">
          <li>ISO/IEC 27001:2022 – Sistema de Gestão de Segurança da Informação;</li>
          <li>ISO/IEC 42001:2023 – Sistema de Gestão de IA;</li>
          <li>Lei Geral de Proteção de Dados (LGPD – Lei nº 13.709/2018);</li>
          <li>Regulamento (EU) 224/1689, ("IA Act"), de 13 de junho de 2024.</li>
        </ul>
      </section>

      {/* 13. ATUALIZAÇÕES */}
      <section id="atualizacoes" className="text-justify">
        <h2 className="mb-4 text-2xl font-semibold text-white">13. ATUALIZAÇÕES</h2>
        <p>
          Esta política poderá ser atualizada sempre que houver mudanças em regulamentações, avanços
          tecnológicos ou alterações nas necessidades e diretrizes da organização.
        </p>
      </section>

      {/* 14. CONTROLE DO DOCUMENTO */}
      <section id="controle-documento" className="text-justify">
        <h2 className="mb-4 text-2xl font-semibold text-white">14. CONTROLE DO DOCUMENTO</h2>
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-600 border-collapse">
            <thead>
              <tr className="bg-gray-800">
                <th className="p-2 text-left text-white border border-gray-600">Revisão</th>
                <th className="p-2 text-left text-white border border-gray-600">
                  Data de Publicação
                </th>
                <th className="p-2 text-left text-white border border-gray-600">Alterações</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-2 text-gray-300 border border-gray-600">00</td>
                <td className="p-2 text-gray-300 border border-gray-600">16/09/2025</td>
                <td className="p-2 text-gray-300 border border-gray-600">Publicação</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 15. NÍVEIS DE APROVAÇÃO */}
      <section id="niveis-aprovacao" className="text-justify">
        <h2 className="mb-4 text-2xl font-semibold text-white">15. NÍVEIS DE APROVAÇÃO</h2>
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-600 border-collapse">
            <thead>
              <tr className="bg-gray-800">
                <th className="p-2 text-left text-white border border-gray-600">
                  Nível de Aprovação
                </th>
                <th className="p-2 text-left text-white border border-gray-600">Nome</th>
                <th className="p-2 text-left text-white border border-gray-600">Processo</th>
              </tr>
            </thead>
            <tbody>
              {/* Elaboradores */}
              <tr>
                <td className="p-3 font-semibold text-gray-300 border border-gray-600" rowSpan={5}>
                  Elaborador(es):
                </td>
                <td className="p-3 text-gray-300 border border-gray-600">Camila Reis Ferreira</td>
                <td className="p-3 text-gray-300 border border-gray-600">
                  Compliance e Privacidade de Dados
                </td>
              </tr>
              <tr>
                <td className="p-3 text-gray-300 border border-gray-600">
                  Everton da Silva Barbosa
                </td>
                <td className="p-3 text-gray-300 border border-gray-600">
                  Compliance e Privacidade de Dados
                </td>
              </tr>
              <tr>
                <td className="p-3 text-gray-300 border border-gray-600">
                  Janaina Selvino Gonçalves Siqueira
                </td>
                <td className="p-3 text-gray-300 border border-gray-600">
                  Compliance e Privacidade de Dados
                </td>
              </tr>
              <tr>
                <td className="p-3 text-gray-300 border border-gray-600">
                  João Emmanuel Lima de Oliveira
                </td>
                <td className="p-3 text-gray-300 border border-gray-600">
                  Compliance e Privacidade de Dados
                </td>
              </tr>
              <tr>
                <td className="p-3 text-gray-300 border border-gray-600">
                  Gustavo Casadei Bellanda
                </td>
                <td className="p-3 text-gray-300 border border-gray-600">
                  TI – Tecnologia da Informação (Sistemas)
                </td>
              </tr>

              {/* Aprovadores */}
              <tr>
                <td className="p-3 font-semibold text-gray-300 border border-gray-600" rowSpan={5}>
                  Aprovador(es):
                </td>
                <td className="p-3 text-gray-300 border border-gray-600">
                  Eduardo Mauricio Zalamena
                </td>
                <td className="p-3 text-gray-300 border border-gray-600">
                  TI – Tecnologia da Informação
                </td>
              </tr>
              <tr>
                <td className="p-3 text-gray-300 border border-gray-600">
                  Felipe Frota. de A. Koury
                </td>
                <td className="p-3 text-gray-300 border border-gray-600">
                  Jurídico, Compliance e Privacidade de Dados
                </td>
              </tr>
              <tr>
                <td className="p-3 text-gray-300 border border-gray-600">
                  Leticia Gonçalves Borges
                </td>
                <td className="p-3 text-gray-300 border border-gray-600">
                  Gente & Gestão (Treinamentos)
                </td>
              </tr>
              <tr>
                <td className="p-3 text-gray-300 border border-gray-600">Ailton Coimbra Bonfim</td>
                <td className="p-3 text-gray-300 border border-gray-600">
                  Jurídico, Compliance e Privacidade de Dados
                </td>
              </tr>
              <tr>
                <td className="p-3 text-gray-300 border border-gray-600">Mauro Luís Correia</td>
                <td className="p-3 text-gray-300 border border-gray-600">Presidência</td>
              </tr>

              {/* Homologadora */}
              <tr>
                <td className="p-3 font-semibold text-gray-300 border border-gray-600">
                  Homologadora:
                </td>
                <td className="p-3 text-gray-300 border border-gray-600">
                  Fabiola Fernandes Barbosa
                </td>
                <td className="p-3 text-gray-300 border border-gray-600">Sistema de Gestão Lean</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
