# PDF Text Extraction no Sandbox

## Visão Geral

O sandbox agora inclui um endpoint `/extract-pdf` que permite extrair texto de PDFs **sem custos de embeddings** da RAG API. Isso é útil quando você só precisa do texto do PDF, não de busca semântica vetorial.

## Como Funciona

1. **Upload do PDF**: Primeiro, faça upload do PDF via endpoint `/upload`
2. **Extração**: Use o endpoint `/extract-pdf` para extrair o texto
3. **Processamento**: O texto é extraído usando bibliotecas Python gratuitas (PyPDF/pdfplumber)

## Endpoint

### POST /extract-pdf

Extrai texto de um PDF já enviado via `/upload`.

**Headers:**
```
X-API-Key: sua-chave-api
Content-Type: application/json
```

**Body:**
```json
{
  "file_id": "abc123def456",
  "session_id": "sess123"
}
```

**Resposta de Sucesso:**
```json
{
  "success": true,
  "text": "Conteúdo extraído do PDF...",
  "pageCount": 10,
  "metadata": {
    "total_pages": 10,
    "title": "Título do Documento",
    "author": "Autor"
  },
  "charCount": 50000
}
```

**Resposta de Erro:**
```json
{
  "success": false,
  "message": "Mensagem de erro"
}
```

## Exemplo de Uso

### 1. Upload do PDF

```bash
curl -X POST http://localhost:3081/upload \
  -H "X-API-Key: sua-chave-api" \
  -F "file=@documento.pdf" \
  -F "entity_id=conversation123"
```

**Resposta:**
```json
{
  "message": "success",
  "session_id": "sess123",
  "files": [{
    "fileId": "abc123def456",
    "filename": "documento.pdf"
  }]
}
```

### 2. Extrair Texto

```bash
curl -X POST http://localhost:3081/extract-pdf \
  -H "X-API-Key: sua-chave-api" \
  -H "Content-Type: application/json" \
  -d '{
    "file_id": "abc123def456",
    "session_id": "sess123"
  }'
```

## Vantagens vs RAG API

| Recurso | Sandbox `/extract-pdf` | RAG API |
|---------|------------------------|---------|
| **Custo** | ✅ Gratuito | ❌ Requer API key paga (OpenAI, Azure, etc.) |
| **Velocidade** | ✅ Rápido (processamento local) | ⚠️ Depende da API externa |
| **Busca Semântica** | ❌ Não | ✅ Sim (embeddings vetoriais) |
| **Uso Ideal** | Extração simples de texto | Busca inteligente em documentos |

## Quando Usar

✅ **Use `/extract-pdf` quando:**
- Você só precisa do texto do PDF
- Quer evitar custos de embeddings
- Precisa processar muitos PDFs
- Quer processamento rápido e local

❌ **Use RAG API quando:**
- Precisa de busca semântica
- Quer encontrar informações relacionadas por significado
- Precisa de contexto inteligente nas conversas

## Dependências

O executor Docker já inclui as bibliotecas necessárias:
- `pypdf` - Extração básica de PDF
- `pdfplumber` - Extração avançada (melhor para tabelas)

Essas bibliotecas são instaladas automaticamente quando você reconstrói a imagem Docker do executor.

## Rebuild do Executor

Após adicionar as dependências, você precisa reconstruir a imagem Docker:

```bash
cd packages/sandbox
docker build -t librechat/sandbox-executor:latest -f docker/Dockerfile.executor docker/
```

## Limitações

- PDFs muito grandes podem levar mais tempo (timeout padrão: 60s)
- PDFs escaneados (imagens) precisam de OCR (não incluído)
- PDFs com proteção por senha podem falhar
- Complexidade de layout pode afetar qualidade da extração
