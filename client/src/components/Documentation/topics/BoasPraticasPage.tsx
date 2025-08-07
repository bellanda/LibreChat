export default function BoasPraticasPage() {
  return (
    <div className="mx-auto space-y-8 text-gray-100">
      {/* Título da Página */}
      <h1 className="mb-2 text-3xl font-bold text-white">Guia de Boas Práticas</h1>
      <p className="text-lg text-gray-300">
        Siga estas dicas para extrair o máximo da nossa IA e garantir resultados incríveis.
      </p>

      {/* 1. Organização das Conversas */}
      <section>
        <h2 className="mb-3 flex items-center text-2xl font-semibold">
          <span className="mr-3 text-2xl">🗂️</span> Mantenha Suas Conversas Organizadas
        </h2>
        <ul className="list-inside list-disc space-y-2">
          <li>
            <strong>Comece do zero para novos temas:</strong> Mudou de assunto? Use o botão “Nova
            Conversa”. Isso mantém a IA focada e as respostas mais precisas.
          </li>
          <li>
            <strong>Dê títulos claros:</strong> Nomeie seus chats (ex: “Resumo do contrato X”) para
            encontrar o que precisa rapidamente.
          </li>
          <li>
            <strong>Faça uma limpeza periódica:</strong> Arquive ou exclua conversas antigas para
            manter sua área de trabalho limpa e organizada.
          </li>
        </ul>
      </section>

      {/* 3. Verificação de Conteúdo */}
      <section>
        <h2 className="mb-3 flex items-center text-2xl font-semibold">
          <span className="mr-3 text-2xl">✅</span> Confie, mas Verifique
        </h2>
        <ul className="list-inside list-disc space-y-2">
          <li>
            <strong>A IA pode errar:</strong> Sempre cheque fatos, números e dados importantes
            gerados pelo modelo.
          </li>
          <li>
            <strong>Valide com fontes externas:</strong> Confirme dados estatísticos ou informações
            críticas em sites oficiais e fontes confiáveis.
          </li>
          <li>
            <strong>Peça por fontes:</strong> Se a resposta parecer vaga, peça para a IA citar de
            onde tirou a informação ou reformular com mais certeza.
          </li>
        </ul>
      </section>

      {/* 4. Segurança de Dados */}
      <section>
        <h2 className="mb-3 flex items-center text-2xl font-semibold">
          <span className="mr-3 text-2xl">🔒</span> Proteja Suas Informações
        </h2>
        <ul className="list-inside list-disc space-y-2">
          <li>
            <strong>NÃO insira dados sensíveis:</strong> Evite colocar CPFs, números de cartão,
            senhas ou informações detalhadas.
          </li>
          <li>
            <strong>Anonimize quando necessário:</strong> Antes de colar um texto, substitua nomes e
            dados confidenciais por pseudônimos (ex: "Cliente A").
          </li>
        </ul>
      </section>

      {/* 6. Feedback */}
      <section>
        <h2 className="mb-3 flex items-center text-2xl font-semibold">
          <span className="mr-3 text-2xl">👍</span> Ajude a IA a Melhorar
        </h2>
        <ul className="list-inside list-disc space-y-2">
          <li>
            <strong>Avalie as respostas:</strong> Use os botões de “Gostei / Não Gostei” para nos
            ajudar a calibrar o modelo. Seu feedback é valioso!
          </li>
          <li>
            <strong>Reporte problemas:</strong> Encontrou uma resposta estranha, incorreta ou
            enviesada? Informe nossa equipe de suporte.
          </li>
          <li>
            <strong>Compartilhe o que funciona:</strong> Crie e compartilhe com seu time os prompts
            que geram os melhores resultados.
          </li>
        </ul>
      </section>
    </div>
  );
}
