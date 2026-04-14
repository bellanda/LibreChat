"""Document type schemas for sandbox builders."""

from __future__ import annotations

DOCUMENT_TYPES: dict[str, dict] = {
    "relatorio": {
        "required": ["title"],
        "optional": [
            "executive_summary", "kpis", "sections",
            "footer_text", "subtitle", "date", "classification",
        ],
        "pptx_slide_types": ["cover", "kpi_grid", "bullets", "chart", "table"],
        "description": "Relatório genérico com KPIs e seções",
    },
    "tutorial": {
        "required": ["title", "steps"],
        "optional": ["summary", "tips", "warnings", "footer_text", "subtitle", "date"],
        "pptx_slide_types": ["cover", "bullets", "table"],
        "description": "Guia passo a passo com código e dicas",
    },
    "brainstorm": {
        "required": ["title", "ideas"],
        "optional": ["context", "next_steps", "categories", "footer_text", "date"],
        "pptx_slide_types": ["cover", "kpi_grid", "table"],
        "description": "Sessão de ideação com categorias e prioridades",
    },
    "ata": {
        "required": ["title", "attendees", "decisions"],
        "optional": ["action_items", "date", "location", "footer_text"],
        "pptx_slide_types": ["cover", "bullets", "table"],
        "description": "Ata de reunião com decisões e action items",
    },
    "proposta": {
        "required": ["title", "scope", "deliverables"],
        "optional": [
            "pricing", "timeline", "terms",
            "footer_text", "subtitle", "date", "client",
        ],
        "pptx_slide_types": ["cover", "bullets", "table", "timeline"],
        "description": "Proposta comercial com escopo e entregas",
    },
    "spec_tecnica": {
        "required": ["title", "requirements"],
        "optional": [
            "architecture", "decisions", "open_questions",
            "footer_text", "subtitle", "date", "version",
        ],
        "pptx_slide_types": ["cover", "bullets", "table"],
        "description": "Especificação técnica com requisitos e decisões",
    },
    "plano_projeto": {
        "required": ["title", "milestones"],
        "optional": ["raci", "risks", "timeline", "footer_text", "subtitle", "date"],
        "pptx_slide_types": ["cover", "timeline", "table", "bullets"],
        "description": "Plano de projeto com marcos e riscos",
    },
    "onboarding": {
        "required": ["title", "steps"],
        "optional": ["contacts", "resources", "checklist", "footer_text", "subtitle", "date"],
        "pptx_slide_types": ["cover", "bullets", "table"],
        "description": "Guia de integração com passos e recursos",
    },
}

DEFAULT_DOCUMENT_TYPE = "relatorio"


def get_document_type(name: str | None = None) -> dict:
    if not name:
        return DOCUMENT_TYPES[DEFAULT_DOCUMENT_TYPE]
    dt = DOCUMENT_TYPES.get(name.lower())
    if dt is None:
        valid = ", ".join(DOCUMENT_TYPES.keys())
        raise ValueError(
            f"document_type '{name}' inválido. Válidos: {valid}"
        )
    return dt


def validate_fields(document_type: str, fields: dict) -> None:
    """Raise ValueError if any required field for the type is missing."""
    dt = get_document_type(document_type)
    missing = [f for f in dt["required"] if f not in fields]
    if missing:
        raise ValueError(
            f"document_type='{document_type}' requer os campos: {missing}. "
            f"Campos opcionais: {dt['optional']}"
        )
