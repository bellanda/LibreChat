export default function PassoAPassoPage() {
    return (
        <div className="space-y-6">
          

          <div className="space-y-4">
            {/* Passo 1 */}
            <div className="bg-[#1c1c1c] p-6 rounded-lg shadow-sm border border-gray-700">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-indigo-900 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🔗</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-indigo-600 text-white text-sm font-bold px-3 py-1 rounded-full">
                      Passo 1
                    </span>
                    <h3 className="text-lg font-semibold text-white">Acesse a Plataforma</h3>
                  </div>
                  <p className="text-gray-300 mb-2">Navegue para a página principal da plataforma através do link interno da empresa <a href="https://www.google.com" className="text-blue-500">aqui</a>.</p>
                  <img
                        src="/assets/passo1.png"
                        alt="passo1.png"
                        className="h-auto w-full p-2"
                    />

                  <p className="text-gray-300 mb-2"><strong>Acesso com login e senha da empresa</strong></p>
                  <div className="bg-gray-800 p-3 rounded text-sm text-gray-300">
                    <strong>💡 Dica:</strong> Certifique-se de estar conectado à VPN corporativa se necessário.
                  </div>
                </div>
              </div>
            </div>

            {/* Passo 2 */}
            <div className="bg-[#1c1c1c] p-6 rounded-lg shadow-sm border border-gray-700">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-indigo-900 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🧠</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-indigo-600 text-white text-sm font-bold px-3 py-1 rounded-full">
                      Passo 2
                    </span>
                    <h3 className="text-lg font-semibold text-white">Escolha o Modelo</h3>
                  </div>
                  <p className="text-gray-300 mb-2">Selecione o modelo de IA desejado no menu suspenso disponível.</p>
                  <img
                        src="/assets/passo2.png"
                        alt="passo2.png"
                        className="h-auto w-full p-2"
                    />
                  <div className="bg-gray-800 p-3 rounded text-sm text-gray-300">
                    <strong>💡 Dica:</strong> Para iniciantes, recomendamos ler o glossário e escolher o modelo que oferece bom equilíbrio entre velocidade e qualidade.
                  </div>
                </div>
              </div>
            </div>

            {/* Passo 3 */}
            <div className="bg-[#1c1c1c] p-6 rounded-lg shadow-sm border border-gray-700">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-indigo-900 rounded-full flex items-center justify-center">
                  <span className="text-2xl">📝</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-indigo-600 text-white text-sm font-bold px-3 py-1 rounded-full">
                      Passo 3
                    </span>
                    <h3 className="text-lg font-semibold text-white">Digite seu Prompt</h3>
                  </div>
                  <p className="text-gray-300 mb-2">Escreva sua instrução na caixa de texto ou selecione um template pronto da biblioteca.</p>
                  <img
                        src="/assets/passo3.png"
                        alt="passo3.png"
                        className="h-auto w-full p-2"
                    />
                  <div className="bg-gray-800 p-3 rounded text-sm text-gray-300">
                    <strong>💡 Dica:</strong> Seja específico e claro sobre o que você quer que a IA faça.
                  </div>
                </div>
              </div>
            </div>

            {/* Passo 4 */}
            <div className="bg-[#1c1c1c] p-6 rounded-lg shadow-sm border border-gray-700">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-indigo-900 rounded-full flex items-center justify-center">
                  <span className="text-2xl">▶️</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-indigo-600 text-white text-sm font-bold px-3 py-1 rounded-full">
                      Passo 4
                    </span>
                    <h3 className="text-lg font-semibold text-white">Execute a Solicitação</h3>
                  </div>
                  <p className="text-gray-300 mb-2">Clique no botão 'Executar' para enviar seu prompt para processamento.</p>
                  <div className="bg-gray-800 p-3 rounded text-sm text-gray-300">
                    <strong>💡 Dica:</strong> Aguarde alguns segundos enquanto a IA processa sua solicitação.
                  </div>
                </div>
              </div>
            </div>

            {/* Passo 5 */}
            <div className="bg-[#1c1c1c] p-6 rounded-lg shadow-sm border border-gray-700">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-indigo-900 rounded-full flex items-center justify-center">
                  <span className="text-2xl">📥</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-indigo-600 text-white text-sm font-bold px-3 py-1 rounded-full">
                      Passo 5
                    </span>
                    <h3 className="text-lg font-semibold text-white">Copie ou Baixe</h3>
                  </div>
                  <p className="text-gray-300 mb-2">Use os botões disponíveis para copiar a resposta ou fazer download como arquivo.</p>
                  <img
                        src="/assets/passo5.png"
                        alt="passo5.png"
                        className="h-auto w-full p-2"
                    />
                  <div className="bg-gray-800 p-3 rounded text-sm text-gray-300">
                    <strong>💡 Dica:</strong> As respostas podem ser copiadas para a área de transferência ou salvas como arquivos de texto.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
}