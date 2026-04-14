import { z } from 'zod';

const DEFAULT_XLSX_READ_DESCRIPTION =
  `Leitura estruturada de planilhas Excel (arquivos .xlsx) já anexadas à conversa.

Quando usar \`xlsx_read_sheet\`:
- Quando o usuário pedir para inspecionar, resumir, filtrar ou analisar uma planilha Excel já enviada.
- Prefira uma única chamada com a aba (sheet_name) e o intervalo (range ou max_rows) necessários para responder à pergunta atual.

Quando NÃO usar \`xlsx_read_sheet\`:
- Para texto simples, PDFs ou outros formatos não Excel.
- Para chamar várias vezes com pequenos ranges que poderiam ser obtidos em uma única chamada.

Controles de gasto:
- Para planilhas grandes, SEMPRE use \`max_rows\` ou \`range\` para limitar o volume retornado.
- Evite devolver a planilha inteira; peça apenas as linhas/colunas relevantes para a tarefa atual.` as const;

const getXlsxReadDescription = () => {
  return process.env.XLSX_READ_DESCRIPTION || DEFAULT_XLSX_READ_DESCRIPTION;
};

export const xlsxToolkit = {
  xlsx_read_sheet: {
    name: 'xlsx_read_sheet' as const,
    description: getXlsxReadDescription(),
    schema: z.object({
      file_id: z
        .string()
        .min(1)
        .describe(
          'ID do arquivo .xlsx já anexado na conversa e disponível no contexto. Use apenas IDs presentes no contexto atual; nunca invente um file_id.',
        ),
      sheet_name: z
        .string()
        .min(1)
        .optional()
        .describe(
          'Nome da planilha (aba) a ser lida. Se omitido, a primeira planilha do arquivo será usada.',
        ),
      max_rows: z
        .number()
        .int()
        .min(1)
        .max(1000)
        .optional()
        .describe(
          'Número máximo de linhas a retornar a partir do topo do intervalo solicitado. Use para limitar o volume de dados em planilhas grandes. Se omitido, o padrão é 100 linhas.',
        ),
      range: z
        .string()
        .min(2)
        .optional()
        .describe(
          'Intervalo opcional no formato A1-notation (por exemplo, "A1:E50") para restringir a leitura a um subconjunto da planilha. Use este campo ou max_rows para evitar retornar a planilha inteira.',
        ),
    }),
  },
} as const;

export type XlsxToolkit = typeof xlsxToolkit;

