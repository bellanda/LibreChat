"""Testes dos builders HPE Corporate Clean."""
import sys
import tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

import pytest


# ── document_types ────────────────────────────────────────────────────────────

def test_get_document_type_valid():
    from document_types import get_document_type
    dt = get_document_type("tutorial")
    assert dt["required"] == ["title", "steps"]
    assert "tips" in dt["optional"]


def test_get_document_type_default():
    from document_types import get_document_type
    dt = get_document_type(None)
    assert dt["required"] == ["title"]  # relatorio


def test_get_document_type_invalid():
    from document_types import get_document_type
    with pytest.raises(ValueError, match="inválido"):
        get_document_type("nao_existe")


def test_validate_fields_ok():
    from document_types import validate_fields
    validate_fields("tutorial", {"title": "T", "steps": [{"title": "S1", "content": "C"}]})


def test_validate_fields_missing():
    from document_types import validate_fields
    with pytest.raises(ValueError, match="steps"):
        validate_fields("tutorial", {"title": "T"})


def test_all_types_defined():
    from document_types import DOCUMENT_TYPES
    expected = {"relatorio", "tutorial", "brainstorm", "ata", "proposta",
                "spec_tecnica", "plano_projeto", "onboarding"}
    assert set(DOCUMENT_TYPES.keys()) == expected


def test_create_pdf_document_executivo():
    from corporate_builders import create_pdf_document
    with tempfile.TemporaryDirectory() as tmp:
        out = Path(tmp) / "test.pdf"
        result = create_pdf_document(
            str(out),
            theme="executivo",
            title="Relatório de Teste",
            subtitle="Q1 2026",
            date="2026-04-02",
            classification="CONFIDENTIAL",
            executive_summary="Sumário de teste para validação.",
            kpis=[
                {"value": "R$ 4.2M", "label": "Receita", "delta": "+12%"},
                {"value": "+12%", "label": "Crescimento"},
                {"value": "3.1%", "label": "Churn"},
            ],
            sections=[{"title": "Análise", "content": "Conteúdo de análise."}],
        )
        assert result.exists()


def test_create_pdf_document_operacional():
    from corporate_builders import create_pdf_document
    with tempfile.TemporaryDirectory() as tmp:
        out = Path(tmp) / "test_op.pdf"
        result = create_pdf_document(
            str(out),
            theme="operacional",
            title="Dashboard Operacional",
            date="2026-04-02",
            executive_summary="Status dos serviços.",
            sections=[],
        )
        assert result.exists()


# ── create_pdf_document (nova interface por document_type) ────────────────────

def test_pdf_tutorial():
    from corporate_builders import create_pdf_document
    with tempfile.TemporaryDirectory() as tmp:
        out = Path(tmp) / "tutorial.pdf"
        result = create_pdf_document(
            str(out),
            theme="tecnico",
            document_type="tutorial",
            title="Como configurar o ambiente",
            steps=[
                {"title": "Instalar deps", "content": "Execute npm install", "code": "npm install"},
                {"title": "Configurar .env", "content": "Copie o .env.example"},
            ],
            tips=["Use Node 18+"],
            warnings=["Não commite o .env"],
        )
        assert result.exists()


def test_pdf_ata():
    from corporate_builders import create_pdf_document
    with tempfile.TemporaryDirectory() as tmp:
        out = Path(tmp) / "ata.pdf"
        result = create_pdf_document(
            str(out),
            theme="executivo",
            document_type="ata",
            title="Reunião de Planejamento Q2",
            date="06/04/2026",
            attendees=["Rafael", "Ana", "João"],
            decisions=["Migrar para novo ambiente em maio"],
            action_items=[{"task": "Criar RFP", "owner": "Rafael", "due": "15/04"}],
        )
        assert result.exists()


def test_pdf_brainstorm():
    from corporate_builders import create_pdf_document
    with tempfile.TemporaryDirectory() as tmp:
        out = Path(tmp) / "brainstorm.pdf"
        result = create_pdf_document(
            str(out),
            document_type="brainstorm",
            title="Novas Features Q3",
            context="Sessão de ideação do time de produto.",
            ideas=[
                {"title": "Dark mode", "category": "UX", "priority": "alta", "description": "Reduzir fadiga visual"},
                {"title": "Export CSV", "category": "Dados", "priority": "media", "description": "Exportar relatórios"},
            ],
            next_steps=["Votar nas ideias na próxima sprint"],
        )
        assert result.exists()


def test_pdf_proposta():
    from corporate_builders import create_pdf_document
    with tempfile.TemporaryDirectory() as tmp:
        out = Path(tmp) / "proposta.pdf"
        result = create_pdf_document(
            str(out),
            document_type="proposta",
            title="Proposta de Desenvolvimento",
            client="Acme Corp",
            date="06/04/2026",
            scope="Desenvolvimento de portal interno de gestão.",
            deliverables=["Portal web", "API REST", "Documentação"],
            pricing=[{"item": "Desenvolvimento", "description": "3 meses", "value": "R$90.000"}],
        )
        assert result.exists()


def test_pdf_spec_tecnica():
    from corporate_builders import create_pdf_document
    with tempfile.TemporaryDirectory() as tmp:
        out = Path(tmp) / "spec.pdf"
        result = create_pdf_document(
            str(out),
            theme="tecnico",
            document_type="spec_tecnica",
            title="Spec: Sistema de Autenticação",
            version="1.0",
            requirements=[
                {"id": "REQ-01", "description": "Login com e-mail e senha", "priority": "alta"},
                {"id": "REQ-02", "description": "Suporte a SSO", "priority": "media"},
            ],
            decisions=[
                {"decision": "Usar JWT", "rationale": "Stateless e portável", "status": "fechada"},
            ],
        )
        assert result.exists()


def test_pdf_plano_projeto():
    from corporate_builders import create_pdf_document
    with tempfile.TemporaryDirectory() as tmp:
        out = Path(tmp) / "plano.pdf"
        result = create_pdf_document(
            str(out),
            document_type="plano_projeto",
            title="Plano de Migração para Cloud",
            milestones=[
                {"label": "Kick-off", "owner": "Rafael", "date": "01/05/2026", "status": "pendente"},
                {"label": "Deploy Staging", "owner": "Ana", "date": "15/06/2026", "status": "pendente"},
            ],
            risks=[{"risk": "Downtime na migração", "probability": "Média", "impact": "Alto", "mitigation": "Blue-green deploy"}],
        )
        assert result.exists()


def test_pdf_onboarding():
    from corporate_builders import create_pdf_document
    with tempfile.TemporaryDirectory() as tmp:
        out = Path(tmp) / "onboarding.pdf"
        result = create_pdf_document(
            str(out),
            document_type="onboarding",
            title="Bem-vindo à HPE Intelligence Platform",
            steps=[
                {"title": "Criar conta", "content": "Acesse o portal e registre-se."},
                {"title": "Configurar VPN", "content": "Baixe o cliente e importe o perfil."},
            ],
            contacts=[{"name": "Suporte TI", "role": "Helpdesk", "contact": "ti@hpe.com"}],
            checklist=["Conta criada", "VPN configurada", "Slack instalado"],
        )
        assert result.exists()


def test_pdf_relatorio_default():
    from corporate_builders import create_pdf_document
    with tempfile.TemporaryDirectory() as tmp:
        out = Path(tmp) / "relatorio.pdf"
        result = create_pdf_document(
            str(out),
            theme="executivo",
            title="Relatório Q1 2026",
            executive_summary="Bom trimestre.",
            kpis=[{"value": "R$4M", "label": "Receita", "delta": "+12%"}],
            sections=[{"title": "Análise", "content": "Crescimento sólido."}],
        )
        assert result.exists()


# ── create_pptx_document (document_type) ─────────────────────────────────────

def test_pptx_tutorial_auto_slides():
    from corporate_builders import create_pptx_document
    with tempfile.TemporaryDirectory() as tmp:
        out = Path(tmp) / "tutorial.pptx"
        result = create_pptx_document(
            str(out),
            theme="tecnico",
            document_type="tutorial",
            title="Como usar a plataforma",
            steps=[
                {"title": "Login", "content": "Acesse o portal"},
                {"title": "Configurar perfil", "content": "Preencha seus dados"},
            ],
            tips=["Use Chrome ou Edge"],
        )
        assert result.exists() and result.stat().st_size > 5000


def test_pptx_ata_auto_slides():
    from corporate_builders import create_pptx_document
    with tempfile.TemporaryDirectory() as tmp:
        out = Path(tmp) / "ata.pptx"
        result = create_pptx_document(
            str(out),
            document_type="ata",
            title="Reunião de Alinhamento",
            attendees=["Rafael", "Ana"],
            decisions=["Aprovar o orçamento Q2"],
            action_items=[{"task": "Criar relatório", "owner": "Ana", "due": "20/04"}],
        )
        assert result.exists() and result.stat().st_size > 5000


def test_pptx_explicit_slides_still_works():
    from corporate_builders import create_pptx_document
    with tempfile.TemporaryDirectory() as tmp:
        out = Path(tmp) / "explicit.pptx"
        result = create_pptx_document(
            str(out),
            theme="executivo",
            slides=[
                {"type": "cover", "title": "Relatório Anual", "date": "2026"},
                {"type": "bullets", "title": "Destaques", "bullets": ["Item A", "Item B"]},
            ],
        )
        assert result.exists() and result.stat().st_size > 5000


# ── create_docx_document (document_type) ─────────────────────────────────────

def test_docx_tutorial():
    from corporate_builders import create_docx_document
    with tempfile.TemporaryDirectory() as tmp:
        out = Path(tmp) / "tutorial.docx"
        result = create_docx_document(
            str(out),
            theme="tecnico",
            document_type="tutorial",
            title="Guia de Uso da API",
            steps=[
                {"title": "Autenticar", "content": "Obtenha o token via POST /auth", "code": "curl -X POST /auth"},
                {"title": "Chamar endpoint", "content": "Use o token no header"},
            ],
            tips=["Tokens expiram em 1h"],
        )
        assert result.exists() and result.stat().st_size > 5000


def test_docx_ata():
    from corporate_builders import create_docx_document
    with tempfile.TemporaryDirectory() as tmp:
        out = Path(tmp) / "ata.docx"
        result = create_docx_document(
            str(out),
            document_type="ata",
            title="Reunião de Status",
            date="06/04/2026",
            attendees=["Rafael", "Ana"],
            decisions=["Manter cronograma atual"],
            action_items=[{"task": "Atualizar roadmap", "owner": "Rafael", "due": "13/04"}],
        )
        assert result.exists() and result.stat().st_size > 5000


def test_docx_relatorio_default():
    from corporate_builders import create_docx_document
    with tempfile.TemporaryDirectory() as tmp:
        out = Path(tmp) / "relatorio.docx"
        result = create_docx_document(
            str(out),
            theme="executivo",
            title="Relatório Mensal",
            executive_summary="Resultados dentro do esperado.",
            sections=[{"title": "Análise", "content": "Crescimento de 10%."}],
        )
        assert result.exists() and result.stat().st_size > 5000
