# Sandbox Layout Design System

This folder provides a reusable enterprise-clean design system for any business area.
The assistant should import builders and pass dynamic content (never rely on fixed demo scripts).

## Included modules

- `style.py` - fixed themes and visual tokens
- `corporate_builders.py` - Python builders for generic artifacts (PPTX/XLSX/DOCX/PDF/CSV)
- `ai_usage_guide_ptbr.md` - operational guide and guardrails for AI use
- `js/corporate_builders.mjs` - JS builders for PPTX/XLSX/DOCX/PDF

## Themes (fixed in code)

- `executivo`
- `operacional`
- `board`
- `tecnico`

## Python usage example

```python
from corporate_builders import create_pptx_document

create_pptx_document(
    "/mnt/data/Plano_Expansao.pptx",
    title="Plano de Expansao",
    subtitle="Diretoria Comercial",
    bullets=["Meta trimestral acima do esperado"],
    sections=[{"title": "Acoes", "items": ["Expandir cobertura", "Otimizar operacao"]}],
    theme="board",
)
```

## JavaScript usage example

```javascript
import { createPptxDocument } from '/opt/templates/js/corporate_builders.mjs';

await createPptxDocument({
  outputPath: '/mnt/data/plano_expansao_js.pptx',
  title: 'Plano de Expansao',
  subtitle: 'Diretoria Comercial',
  bullets: ['Meta trimestral acima do esperado'],
  sections: [{ title: 'Acoes', items: ['Expandir cobertura', 'Otimizar operacao'] }],
  theme: 'board',
});
```

## Guardrails

- Keep content dynamic; keep layout tokens fixed.
- Generate one final file by default unless user asks for multiple outputs.
- Do not create manual download links in text output.
