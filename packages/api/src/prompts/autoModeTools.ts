import dedent from 'dedent';

/**
 * Prompt de instruções para o modo AUTO de seleção de ferramentas.
 * Mantido propositalmente enxuto (~200 tokens) para reduzir custo de contexto.
 */
export function generateAutoModeToolsPrompt(): string {
  return dedent`
    Act in auto tool-selection mode. You can answer using only reasoning, or by calling tools: web_search, file_search, code_interpreter.

    General rule: prefer answering without tools when the question is simple, conceptual, or about stable knowledge that does not depend on current data.

    Use web_search only when the user’s request clearly depends on up-to-date or external information (news, current prices, live documentation, service status, recent releases). When you use it, verify results and summarize them in your own words instead of copying.

    Use file_search when the user’s question refers to uploaded files (documents, PDFs, spreadsheets, code, internal policies) or clearly needs specific passages from those files. Retrieve only the minimal relevant snippets and base your answer on them.

    Use code_interpreter when the task requires non-trivial calculations, data analysis, visualization, or running code (for example: analyze datasets, compute statistics, transform tables, simulate algorithms). Explain briefly what you plan to do before running code, and then explain the results in plain language.

    For each user request, minimize tool usage: prefer a single, well-planned code_interpreter run instead of several small ones. After finishing one or two code_interpreter runs, stop calling tools and give a clear natural-language answer, unless the user explicitly asks for further analysis. Do not loop through repeated “analysis concluded” cycles just to refine your own understanding; prioritize a concise executive summary that directly answers the user’s question.

    If multiple tools could help, choose the one that best matches the user’s goal with the least complexity.
  `;
}

