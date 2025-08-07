// Adicione esta linha no topo do arquivo. É essencial para o Next.js entender
// que este componente usa interatividade (hooks como useState).
'use client';

import { decode, encode } from 'gpt-tokenizer';
import { useEffect, useState } from 'react';

// --- Componente do Visualizador de Tokens ---
// Encapsula toda a lógica do nosso tokenizer
function TokenizerVisualizer() {
  const [text, setText] = useState('Olá, mundo! Isso é um teste.');
  const [tokens, setTokens] = useState<string[]>([]);
  const [tokenCount, setTokenCount] = useState(0);

  // Paleta de cores para os tokens (usando classes do Tailwind)
  const colors = [
    'bg-blue-500/30',
    'bg-green-500/30',
    'bg-yellow-500/30',
    'bg-purple-500/30',
    'bg-pink-500/30',
    'bg-indigo-500/30',
  ];

  // Função para processar o texto sempre que ele mudar
  const handleTextChange = (e) => {
    const newText = e.target.value;
    setText(newText);

    if (newText.trim() === '') {
      setTokens([]);
      setTokenCount(0);
      return;
    }

    // 1. Codifica o texto em uma lista de IDs de token
    const encodedTokens = encode(newText);

    // 2. Decodifica cada ID de volta para texto para podermos exibi-lo
    const decodedTokens = encodedTokens.map((id) => decode([id]));

    // 3. Atualiza os estados
    setTokens(decodedTokens);
    setTokenCount(encodedTokens.length);
  };

  // Efeito para inicializar a contagem no primeiro render
  useEffect(() => {
    handleTextChange({ target: { value: text } });
  }, ['', '']);

  return (
    <div className="mt-2 space-y-3 rounded bg-gray-800 p-3 text-sm">
      <textarea
        className="w-full rounded border border-gray-700 bg-gray-900 p-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
        value={text}
        onChange={handleTextChange}
        rows={3}
        placeholder="Digite algo aqui..."
      />
      <div className="font-semibold text-white">
        Total de Tokens: <span className="text-green-400">{tokenCount}</span>
      </div>
      <div className="min-h-[60px] rounded border border-gray-700 bg-gray-900 p-3">
        {tokens.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {tokens.map((token: string, index: number) => (
              <span
                key={index}
                className={`rounded px-1.5 py-0.5 text-white ${colors[index % colors.length]}`}
                title={`Token ${index + 1}`}
              >
                {/* Substitui espaços por um caractere visível para não colapsar */}
                {token.replace(/ /g, ' ')}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">A visualização dos tokens aparecerá aqui.</p>
        )}
      </div>
    </div>
  );
}

// --- Sua Página Principal ---
export default function GlossarioPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-4 text-xl font-semibold text-white">Termos Técnicos Essenciais</h3>

        <div className="space-y-6">
          <div className="border-l-4 border-blue-500 pl-4">
            <h4 className="mb-2 font-semibold text-white">🤖 O que é um prompt?</h4>
            <p className="text-gray-300">
              Um prompt é a pergunta, comando ou instrução que você envia para a inteligência
              artificial. Quanto mais claro e específico for o seu prompt, melhor será a resposta da
              IA.
            </p>
            <div className="mt-2 rounded bg-gray-800 p-3 text-sm">
              <strong>Exemplo:</strong> "Escreva um resumo de 3 parágrafos sobre inteligência
              artificial"
            </div>
          </div>

          {/* Seção de Token Atualizada com o Componente Interativo */}
          <div className="border-l-4 border-green-500 pl-4">
            <h4 className="mb-2 font-semibold text-white">🔤 O que é um token?</h4>
            <p className="text-gray-300">
              A IA processa texto em pedaços chamados tokens. Um token pode ser uma palavra, parte
              de uma palavra ou um caractere de pontuação. Experimente abaixo!
            </p>
            {/* Aqui usamos nosso novo componente! */}
            <TokenizerVisualizer />
          </div>

          <div className="border-l-4 border-orange-500 pl-4">
            <h4 className="mb-2 font-semibold text-white">⚙️ O que é um Modelo?</h4>
            <p className="text-gray-300">
              O "cérebro" da IA que processa suas solicitações. Diferentes modelos têm diferentes
              capacidades, velocidades e custos.
            </p>
            <div className="rounded bg-gray-800 p-3 text-sm">
              <strong>Exemplo:</strong> o3, Gemini 2.5 Pro, Claude Sonnet 4, etc.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
