/**
 * Document type schemas for sandbox JS builders.
 * Mirror of templates/document_types.py
 */

export const DOCUMENT_TYPES = {
  relatorio: {
    required: ['title'],
    optional: ['executive_summary', 'kpis', 'sections', 'footer_text', 'subtitle', 'date', 'classification'],
    pptxSlideTypes: ['cover', 'kpi_grid', 'bullets', 'chart', 'table'],
    description: 'Relatório genérico com KPIs e seções',
  },
  tutorial: {
    required: ['title', 'steps'],
    optional: ['summary', 'tips', 'warnings', 'footer_text', 'subtitle', 'date'],
    pptxSlideTypes: ['cover', 'bullets', 'table'],
    description: 'Guia passo a passo com código e dicas',
  },
  brainstorm: {
    required: ['title', 'ideas'],
    optional: ['context', 'next_steps', 'categories', 'footer_text', 'date'],
    pptxSlideTypes: ['cover', 'kpi_grid', 'table'],
    description: 'Sessão de ideação com categorias e prioridades',
  },
  ata: {
    required: ['title', 'attendees', 'decisions'],
    optional: ['action_items', 'date', 'location', 'footer_text'],
    pptxSlideTypes: ['cover', 'bullets', 'table'],
    description: 'Ata de reunião com decisões e action items',
  },
  proposta: {
    required: ['title', 'scope', 'deliverables'],
    optional: ['pricing', 'timeline', 'terms', 'footer_text', 'subtitle', 'date', 'client'],
    pptxSlideTypes: ['cover', 'bullets', 'table', 'timeline'],
    description: 'Proposta comercial com escopo e entregas',
  },
  spec_tecnica: {
    required: ['title', 'requirements'],
    optional: ['architecture', 'decisions', 'open_questions', 'footer_text', 'subtitle', 'date', 'version'],
    pptxSlideTypes: ['cover', 'bullets', 'table'],
    description: 'Especificação técnica com requisitos e decisões',
  },
  plano_projeto: {
    required: ['title', 'milestones'],
    optional: ['raci', 'risks', 'timeline', 'footer_text', 'subtitle', 'date'],
    pptxSlideTypes: ['cover', 'timeline', 'table', 'bullets'],
    description: 'Plano de projeto com marcos e riscos',
  },
  onboarding: {
    required: ['title', 'steps'],
    optional: ['contacts', 'resources', 'checklist', 'footer_text', 'subtitle', 'date'],
    pptxSlideTypes: ['cover', 'bullets', 'table'],
    description: 'Guia de integração com passos e recursos',
  },
};

export const DEFAULT_DOCUMENT_TYPE = 'relatorio';

export function getDocumentType(name) {
  const key = (name || DEFAULT_DOCUMENT_TYPE).toLowerCase();
  const dt = DOCUMENT_TYPES[key];
  if (!dt) {
    const valid = Object.keys(DOCUMENT_TYPES).join(', ');
    throw new Error(`documentType '${name}' inválido. Válidos: ${valid}`);
  }
  return dt;
}

export function validateFields(documentType, fields) {
  const dt = getDocumentType(documentType);
  const missing = dt.required.filter(f => !(f in fields));
  if (missing.length > 0) {
    throw new Error(
      `documentType='${documentType}' requer os campos: [${missing.join(', ')}]. ` +
      `Campos opcionais: [${dt.optional.join(', ')}]`
    );
  }
}
