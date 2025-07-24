Com base na minha pesquisa em todos os documentos do sistema LibreChat, aqui estão as informações sobre os limites máximos de tokens definidos pelo sistema:
Limites Máximos de Tokens por Modelo
�� Resumo dos Limites:
Categoria	Modelo	Limite Máximo	Limite de Saída
OpenAI	GPT-4o	127.500 tokens	32.268 tokens
OpenAI	GPT-4o-mini	127.500 tokens	65.136 tokens
OpenAI	GPT-4	8.187 tokens	32.268 tokens
OpenAI	GPT-4-32k	32.758 tokens	32.268 tokens
OpenAI	GPT-3.5-turbo	16.375 tokens	32.268 tokens
Anthropic	Claude-3.5-sonnet	200.000 tokens	8.192 tokens
Anthropic	Claude-3.7-sonnet	200.000 tokens	128.000 tokens
Google	Gemini-2.5	1.000.000 tokens	64.000 tokens
Google	Gemini-1.5	1.000.000 tokens	64.000 tokens
Meta	Llama-3	8.000 tokens	32.268 tokens
Meta	Llama-2	4.000 tokens	32.268 tokens
�� Configurações Padrão do Sistema:
Google (Gemini):
Padrão: 8.192 tokens de saída
Mínimo: 1 token
Máximo: 64.000 tokens
Anthropic (Claude):
Padrão: 8.192 tokens de saída
Mínimo: 1 token
Máximo: 128.000 tokens
Legado: 4.096 tokens (para modelos antigos)
OpenAI:
Padrão: 32.268 tokens de saída
Mínimo: 1 token
Máximo: Varia por modelo
�� Observações Importantes:
Limite Combinado: O sistema considera o limite total como prompt + resposta, não separadamente
Configuração Dinâmica: Os limites podem ser ajustados nas configurações de cada endpoint
Validação: O sistema automaticamente ajusta valores que excedem os limites máximos
Padrão Atual: A documentação menciona 8.000 tokens como padrão, mas o código mostra valores diferentes por modelo
�� Recomendações de Uso:
Para respostas curtas: Use 1.000-4.000 tokens
Para respostas médias: Use 4.000-8.000 tokens
Para respostas longas: Use 8.000-16.000 tokens
Para documentos extensos: Use 16.000+ tokens (verificar limite do modelo específico)
Os valores exatos dependem do modelo específico que você está usando e podem ser configurados nas opções de cada endpoint.