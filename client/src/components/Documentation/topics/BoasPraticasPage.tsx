export default function BoasPraticasPage() {
  return (
    <div className="mx-auto text-gray-100 space-y-8">
      {/* Título da Página */}
      <h1 className="text-3xl font-bold text-white mb-2">Guia de Boas Práticas</h1>
      <p className="text-lg text-gray-300">
        Siga estas dicas para extrair o máximo da nossa IA e garantir resultados incríveis.
      </p>

      {/* 1. Organização das Conversas */}
      <section>
        <h2 className="text-2xl font-semibold mb-3 flex items-center">
          <span className="text-2xl mr-3">🗂️</span> Mantenha Suas Conversas Organizadas
        </h2>
        <ul className="list-disc list-inside space-y-2">
          <li><strong>Comece do zero para novos temas:</strong> Mudou de assunto? Use o botão “Nova Conversa”. Isso mantém a IA focada e as respostas mais precisas.</li>
          <li><strong>Dê títulos claros:</strong> Nomeie seus chats (ex: “Resumo do contrato X”) para encontrar o que precisa rapidamente.</li>
          <li><strong>Faça uma limpeza periódica:</strong> Arquive ou exclua conversas antigas para manter sua área de trabalho limpa e organizada.</li>
        </ul>
      </section>


      {/* 3. Verificação de Conteúdo */}
      <section>
        <h2 className="text-2xl font-semibold mb-3 flex items-center">
          <span className="text-2xl mr-3">✅</span> Confie, mas Verifique
        </h2>
        <ul className="list-disc list-inside space-y-2">
          <li><strong>A IA pode errar:</strong> Sempre cheque fatos, números e dados importantes gerados pelo modelo.</li>
          <li><strong>Valide com fontes externas:</strong> Confirme dados estatísticos ou informações críticas em sites oficiais e fontes confiáveis.</li>
          <li><strong>Peça por fontes:</strong> Se a resposta parecer vaga, peça para a IA citar de onde tirou a informação ou reformular com mais certeza.</li>
        </ul>
      </section>

      {/* 4. Segurança de Dados */}
      <section>
        <h2 className="text-2xl font-semibold mb-3 flex items-center">
          <span className="text-2xl mr-3">🔒</span> Proteja Suas Informações
        </h2>
        <ul className="list-disc list-inside space-y-2">
          <li><strong>NÃO insira dados sensíveis:</strong> Evite colocar CPFs, números de cartão, senhas ou informações detalhadas.</li>
          <li><strong>Anonimize quando necessário:</strong> Antes de colar um texto, substitua nomes e dados confidenciais por pseudônimos (ex: "Cliente A").</li>
        </ul>
      </section>

      {/* 6. Feedback */}
      <section>
        <h2 className="text-2xl font-semibold mb-3 flex items-center">
          <span className="text-2xl mr-3">👍</span> Ajude a IA a Melhorar
        </h2>
        <ul className="list-disc list-inside space-y-2">
          <li><strong>Avalie as respostas:</strong> Use os botões de “Gostei / Não Gostei” para nos ajudar a calibrar o modelo. Seu feedback é valioso!</li>
          <li><strong>Reporte problemas:</strong> Encontrou uma resposta estranha, incorreta ou enviesada? Informe nossa equipe de suporte.</li>
          <li><strong>Compartilhe o que funciona:</strong> Crie e compartilhe com seu time os prompts que geram os melhores resultados.</li>
        </ul>
      </section>

      {/* 7. Suporte */}
      <section>
        <h2 className="text-2xl font-semibold mb-3 flex items-center">
          <span className="text-2xl mr-3">🆘</span> Precisa de Ajuda?
        </h2>
        <ul className="list-disc list-inside space-y-2">
          <li><strong>Perguntas Frequentes (FAQ):</strong> Dê uma olhada no nosso FAQ. Sua dúvida já pode ter sido respondida lá.</li>
          <li><strong>O que há de novo (Changelog):</strong> Fique por dentro das últimas atualizações de modelos e funcionalidades.</li>
          <li><strong>Fale conosco:</strong> Use nosso canal de suporte (e-mail ou teams) para resolver qualquer problema.</li>
        </ul>
      </section>

      {/* 8. Acessibilidade */}
      <section>
        <h2 className="text-2xl font-semibold mb-3 flex items-center">
          <span className="text-2xl mr-3">⌨️</span> Use com Mais Conforto
        </h2>
        <ul className="list-disc list-inside space-y-2">
          <li><strong>Descubra os atalhos:</strong> Agilize seu trabalho com atalhos de teclado, como <code>Ctrl+Enter</code> para enviar.</li>
          <li><strong>Exporte suas conversas:</strong> Salve um registro de seus chats em PDF ou Markdown para consultar depois.</li>
          <li><strong>Favorite chats:</strong> Salve suas conversas favoritas para acesso rápido.</li>
        </ul>
      </section>

    </div>
  );
}