# Builders Corporativos HPE — Guia Rápido

**Regra:** Sempre use builders em `/opt/templates/corporate_builders.py` para visual HPE consistente.

## 🎨 Temas

- `executivo`: Relatórios diretoria (azul + vermelho)
- `operacional`: Dashboards & status (azul + verde)
- `tecnico`: Docs técnicas (azul + cinza)
- `board`: Board presentations (azul escuro + vermelho)

## 📦 Pré-instalado

Python: numpy, pandas, matplotlib, seaborn, pillow, python-pptx, openpyxl, python-docx, xhtml2pdf, jinja2, reportlab, pypdf, pdfplumber, scikit-learn, tabulate

JavaScript (Bun): pptxgenjs, exceljs, docx, pdf-lib

## 📝 PDF (Jinja2 Templates)

```python
from corporate_builders import create_pdf_document

create_pdf_document(
    "/mnt/data/relatorio.pdf",
    template="executivo",  # executivo|operacional|tecnico
    theme="executivo",
    data={
        "document_title": "Q4 Performance",
        "date": "06/04/2025",
        "executive_summary": "Crescimento 12% acima da meta...",
        "kpis": [
            {"value": "R$ 4.2M", "label": "Receita", "delta": "+12%"},
            {"value": "94%", "label": "Margin", "delta": "-2pp"},
        ],
        "sections": [
            {"title": "Resultados", "content": "...", "chart_path": "/mnt/data/chart.png"},
            {"title": "Riscos", "table": {"headers": [...], "rows": [...]}},
        ]
    }
)
```

## 🎪 PPTX (6 Slide Types)

```python
from corporate_builders import create_pptx_document

create_pptx_document(
    "/mnt/data/apresentacao.pptx",
    theme="executivo",
    slides=[
        {"type": "cover", "title": "Estratégia 2025", "subtitle": "Executiva", "date": "06/04"},
        {"type": "kpi_grid", "title": "KPIs", "kpis": [
            {"value": "R$ 12.4B", "label": "Receita"},
            {"value": "+18%", "label": "Crescimento"}
        ]},
        {"type": "bullets", "title": "Pilares", "bullets": ["Ponto 1", "Ponto 2"]},
        {"type": "chart", "title": "Trend", "chart_path": "/mnt/data/chart.png"},
        {"type": "table", "title": "Roadmap", "headers": [...], "rows": [...]},
        {"type": "timeline", "title": "Milestones", "milestones": [
            {"label": "Q1", "text": "Launch"},
            {"label": "Q2", "text": "Scale"}
        ]},
    ]
)
```

## 📊 XLSX (Multi-Sheet + Charts)

```python
from corporate_builders import create_xlsx_document

create_xlsx_document(
    "/mnt/data/dashboard.xlsx",
    theme="operacional",
    sheets=[
        {
            "type": "dashboard",
            "name": "Executive",
            "kpis": [{"label": "Revenue", "value": "R$ 420M", "delta": "+12%"}],
            "headers": ["Month", "Revenue", "Growth %"],
            "rows": [["Jan", 380, 10.5], ["Feb", 395, 11.2], ["Mar", 420, 12.0]],
            "add_chart": True
        },
        {
            "type": "data",
            "name": "Raw",
            "headers": ["Region", "Sales"],
            "rows": [["North", 145], ["South", 189]]
        }
    ]
)
```

## 📄 DOCX (Programático)

```python
from corporate_builders import create_docx_document

create_docx_document(
    "/mnt/data/relatorio.docx",
    theme="tecnico",
    data={
        "document_title": "API Gateway Review",
        "author": "Arquitetura",
        "date": "06/04/2025",
        "abstract": "Recomendação: Kong Enterprise...",
        "sections": [
            {
                "title": "1. Visão Geral",
                "content": "Gateway atual não suporta...",
                "bullets": ["Throughput: 10K req/s", "Latency p99: 250ms"],
                "code": "apiVersion: v1\nkind: Deployment",
                "table": {"headers": ["Solução", "Throughput"], "rows": [["Kong", "100K"], ["Envoy", "150K"]]}
            }
        ]
    }
)
```

## 🖼️ Chart Workflow

1. Gerar com matplotlib: `plt.savefig("/mnt/data/chart.png", dpi=100)`
2. Passar path ao builder: `"chart_path": "/mnt/data/chart.png"`

## ✅ Regras

- Sempre use builders (não raw canvas, pptxgenjs, ou openpyxl)
- Especifique `theme=` sempre
- Nenhum `pip install` em runtime (pacotes pré-instalados)
- Nenhum link manual de download (chat mostra automaticamente)
- 1 arquivo final por resposta (a menos que solicitado)
