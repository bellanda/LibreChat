"""Reusable enterprise-clean builders for dynamic artifact generation.

Use these helpers when the assistant needs to generate business files
with consistent HPE Corporate Clean visual style across all formats.

Supports: PDF (Jinja2), PPTX (6 slide types), XLSX (multi-sheet with charts), DOCX (programmatic).
"""

from __future__ import annotations

from pathlib import Path
from typing import Any

import pandas as pd
from jinja2 import Environment, FileSystemLoader
from xhtml2pdf import pisa
from pptx import Presentation
from pptx.util import Inches, Pt as PptPt
from pptx.enum.text import PP_ALIGN
from pptx.dml.color import RGBColor as PptxRGBColor
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.chart import BarChart, Reference
from docx import Document
from docx.shared import Pt, RGBColor, Inches as DocxInches
from docx.enum.text import WD_PARAGRAPH_ALIGNMENT

from style import get_theme

TEMPLATES_DIR = Path(__file__).parent / "pdf_templates"


def _pptx_rgb(hex_color: str) -> PptxRGBColor:
    """Convert hex color to pptx RGB color."""
    hex_clean = hex_color.lstrip("#")
    return PptxRGBColor.from_string(hex_clean)


def _style_pptx_slide_with_title(slide, theme_cfg, title: str, subtitle: str = ""):
    """Add HPE-styled title bar to a slide."""
    # Blue background shape for title area
    bg_shape = slide.shapes.add_shape(
        1,  # RECTANGLE
        Inches(0),
        Inches(0),
        Inches(13.333),
        Inches(1.2),
    )
    bg_shape.fill.solid()
    bg_shape.fill.fore_color.rgb = _pptx_rgb(theme_cfg.primary)
    bg_shape.line.fill.background()

    # Title text
    title_box = slide.shapes.add_textbox(Inches(0.5), Inches(0.2), Inches(12), Inches(0.7))
    title_frame = title_box.text_frame
    title_frame.text = title
    title_p = title_frame.paragraphs[0]
    title_p.font.name = theme_cfg.font_main
    title_p.font.size = PptPt(32)
    title_p.font.bold = True
    title_p.font.color.rgb = _pptx_rgb("FFFFFF")

    # Subtitle text if provided
    if subtitle:
        sub_box = slide.shapes.add_textbox(Inches(0.5), Inches(1.0), Inches(12), Inches(0.4))
        sub_frame = sub_box.text_frame
        sub_frame.text = subtitle
        sub_p = sub_frame.paragraphs[0]
        sub_p.font.name = theme_cfg.font_main
        sub_p.font.size = PptPt(14)
        sub_p.font.color.rgb = _pptx_rgb(theme_cfg.accent)


def create_pptx_document(
    output_path: str | Path,
    *,
    theme: str = "executivo",
    slides: list[dict[str, Any]] | None = None,
) -> Path:
    """Create a PPTX presentation with 6 slide types.

    Slide types:
    - cover: Full-bleed HPE blue, title + subtitle + date, accent bar
    - kpi_grid: 2x2 grid of metric cards
    - bullets: Section header bar + bullet list
    - chart: Title + matplotlib PNG image
    - table: Title + HPE-styled table
    - timeline: Horizontal milestone timeline
    """
    theme_cfg = get_theme(theme)
    prs = Presentation()
    prs.slide_width = Inches(10)
    prs.slide_height = Inches(7.5)

    for slide_spec in slides or []:
        slide_type = slide_spec.get("type", "bullets")

        if slide_type == "cover":
            _add_cover_slide(prs, theme_cfg, slide_spec)
        elif slide_type == "kpi_grid":
            _add_kpi_grid_slide(prs, theme_cfg, slide_spec)
        elif slide_type == "bullets":
            _add_bullets_slide(prs, theme_cfg, slide_spec)
        elif slide_type == "chart":
            _add_chart_slide(prs, theme_cfg, slide_spec)
        elif slide_type == "table":
            _add_table_slide(prs, theme_cfg, slide_spec)
        elif slide_type == "timeline":
            _add_timeline_slide(prs, theme_cfg, slide_spec)

    out = Path(output_path)
    prs.save(str(out))
    return out


def _add_cover_slide(prs, theme_cfg, spec: dict):
    """Create cover slide with HPE blue background."""
    slide = prs.slides.add_slide(prs.slide_layouts[6])  # Blank layout
    background = slide.background
    fill = background.fill
    fill.solid()
    fill.fore_color.rgb = _pptx_rgb(theme_cfg.primary)

    # Title
    title_box = slide.shapes.add_textbox(Inches(0.5), Inches(2.5), Inches(9), Inches(1.5))
    title_frame = title_box.text_frame
    title_frame.text = spec.get("title", "")
    title_frame.word_wrap = True
    for para in title_frame.paragraphs:
        para.font.size = PptPt(54)
        para.font.bold = True
        para.font.color.rgb = _pptx_rgb("FFFFFF")
        para.font.name = theme_cfg.font_main

    # Subtitle
    if spec.get("subtitle"):
        sub_box = slide.shapes.add_textbox(Inches(0.5), Inches(4.1), Inches(9), Inches(1))
        sub_frame = sub_box.text_frame
        sub_frame.text = spec.get("subtitle")
        for para in sub_frame.paragraphs:
            para.font.size = PptPt(28)
            para.font.color.rgb = _pptx_rgb(theme_cfg.accent)
            para.font.name = theme_cfg.font_main

    # Date
    if spec.get("date"):
        date_box = slide.shapes.add_textbox(Inches(0.5), Inches(5.5), Inches(9), Inches(0.5))
        date_frame = date_box.text_frame
        date_frame.text = spec.get("date")
        for para in date_frame.paragraphs:
            para.font.size = PptPt(14)
            para.font.color.rgb = _pptx_rgb(theme_cfg.muted)
            para.font.name = theme_cfg.font_main


def _add_kpi_grid_slide(prs, theme_cfg, spec: dict):
    """Create KPI grid slide (2x2 layout)."""
    slide = prs.slides.add_slide(prs.slide_layouts[6])  # Blank
    _style_pptx_slide_with_title(slide, theme_cfg, spec.get("title", "KPIs"))

    kpis = spec.get("kpis", [])
    positions = [
        (0.5, 1.5), (5.25, 1.5),
        (0.5, 4.5), (5.25, 4.5),
    ]

    for idx, kpi in enumerate(kpis[:4]):
        x, y = positions[idx]
        box = slide.shapes.add_textbox(Inches(x), Inches(y), Inches(4.25), Inches(2.5))
        tf = box.text_frame

        # Value
        p_val = tf.paragraphs[0]
        p_val.text = kpi.get("value", "N/A")
        p_val.font.size = PptPt(36)
        p_val.font.bold = True
        p_val.font.color.rgb = _pptx_rgb(theme_cfg.primary)
        p_val.alignment = PP_ALIGN.CENTER

        # Label
        p_label = tf.add_paragraph()
        p_label.text = kpi.get("label", "")
        p_label.font.size = PptPt(12)
        p_label.font.color.rgb = _pptx_rgb(theme_cfg.muted)
        p_label.alignment = PP_ALIGN.CENTER


def _add_bullets_slide(prs, theme_cfg, spec: dict):
    """Create bullets slide with section header bar."""
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    _style_pptx_slide_with_title(slide, theme_cfg, spec.get("title", ""))

    bullets = spec.get("bullets", [])
    content_box = slide.shapes.add_textbox(Inches(1), Inches(1.8), Inches(8), Inches(5))
    tf = content_box.text_frame
    tf.word_wrap = True

    for idx, bullet in enumerate(bullets):
        if idx == 0:
            p = tf.paragraphs[0]
        else:
            p = tf.add_paragraph()
        p.text = f"• {bullet}"
        p.font.size = PptPt(18)
        p.font.color.rgb = _pptx_rgb(theme_cfg.text)
        p.font.name = theme_cfg.font_main
        p.level = 0


def _add_chart_slide(prs, theme_cfg, spec: dict):
    """Create chart slide with embedded PNG image."""
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    _style_pptx_slide_with_title(slide, theme_cfg, spec.get("title", ""))

    if spec.get("chart_path"):
        try:
            pic = slide.shapes.add_picture(
                spec.get("chart_path"),
                Inches(1),
                Inches(1.8),
                width=Inches(8),
            )
        except Exception as e:
            print(f"Error adding chart image: {e}")


def _add_table_slide(prs, theme_cfg, spec: dict):
    """Create table slide with HPE-styled table."""
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    _style_pptx_slide_with_title(slide, theme_cfg, spec.get("title", ""))

    headers = spec.get("headers", [])
    rows = spec.get("rows", [])

    if not headers:
        return

    table_shape = slide.shapes.add_table(len(rows) + 1, len(headers), Inches(0.5), Inches(1.8), Inches(9), Inches(4.5))
    table = table_shape.table

    # Header row
    for col_idx, header in enumerate(headers):
        cell = table.cell(0, col_idx)
        cell.text = str(header)
        # Style header
        for paragraph in cell.text_frame.paragraphs:
            for run in paragraph.runs:
                run.font.bold = True
                run.font.color.rgb = _pptx_rgb("FFFFFF")
                run.font.size = PptPt(11)
            paragraph.font.name = theme_cfg.font_main

    # Body rows
    for row_idx, row_data in enumerate(rows, 1):
        for col_idx, cell_value in enumerate(row_data):
            cell = table.cell(row_idx, col_idx)
            cell.text = str(cell_value)
            for paragraph in cell.text_frame.paragraphs:
                for run in paragraph.runs:
                    run.font.size = PptPt(10)
                paragraph.font.name = theme_cfg.font_main


def _add_timeline_slide(prs, theme_cfg, spec: dict):
    """Create timeline slide with milestone markers."""
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    _style_pptx_slide_with_title(slide, theme_cfg, spec.get("title", ""))

    milestones = spec.get("milestones", [])
    if not milestones:
        return

    # Draw timeline line
    line = slide.shapes.add_connector(1, Inches(1), Inches(3.5), Inches(9), Inches(3.5))
    line.line.color.rgb = _pptx_rgb(theme_cfg.primary)
    line.line.width = PptPt(2)

    # Add milestone markers
    step = 8 / len(milestones)
    for idx, milestone in enumerate(milestones):
        x = 1 + (step * idx)

        # Dot
        dot = slide.shapes.add_shape(1, Inches(x - 0.15), Inches(3.35), Inches(0.3), Inches(0.3))
        dot.fill.solid()
        dot.fill.fore_color.rgb = _pptx_rgb(theme_cfg.primary)
        dot.line.color.rgb = _pptx_rgb("FFFFFF")
        dot.line.width = PptPt(2)

        # Label
        label_box = slide.shapes.add_textbox(Inches(x - 0.5), Inches(4), Inches(1), Inches(0.5))
        label_frame = label_box.text_frame
        label_frame.text = milestone.get("label", "")
        for para in label_frame.paragraphs:
            para.font.size = PptPt(10)
            para.font.bold = True
            para.alignment = PP_ALIGN.CENTER
            para.font.color.rgb = _pptx_rgb(theme_cfg.text)

        # Description
        if milestone.get("text"):
            desc_box = slide.shapes.add_textbox(Inches(x - 0.7), Inches(4.7), Inches(1.4), Inches(1.5))
            desc_frame = desc_box.text_frame
            desc_frame.word_wrap = True
            desc_frame.text = milestone.get("text")
            for para in desc_frame.paragraphs:
                para.font.size = PptPt(9)
                para.alignment = PP_ALIGN.CENTER
                para.font.color.rgb = _pptx_rgb(theme_cfg.muted)


def create_xlsx_document(
    output_path: str | Path,
    *,
    theme: str = "executivo",
    sheets: list[dict[str, Any]] | None = None,
) -> Path:
    """Create multi-sheet XLSX with charts and HPE styling.

    Each sheet can be:
    - type: 'dashboard' (KPIs + data table + chart)
    - type: 'data' (simple data table)
    - type: 'chart' (data + embedded bar chart)
    """
    theme_cfg = get_theme(theme)
    wb = Workbook()
    wb.remove(wb.active)  # Remove default sheet

    for sheet_spec in sheets or []:
        sheet_name = sheet_spec.get("name", "Sheet")[:31]  # Max 31 chars in Excel
        sheet_type = sheet_spec.get("type", "data")

        if sheet_type == "dashboard":
            _add_dashboard_sheet(wb, theme_cfg, sheet_name, sheet_spec)
        elif sheet_type == "data":
            _add_data_sheet(wb, theme_cfg, sheet_name, sheet_spec)
        elif sheet_type == "chart":
            _add_chart_sheet(wb, theme_cfg, sheet_name, sheet_spec)

    out = Path(output_path)
    wb.save(str(out))
    return out


def _add_dashboard_sheet(wb, theme_cfg, sheet_name: str, spec: dict):
    """Create dashboard sheet with KPIs, data, and optional chart."""
    ws = wb.create_sheet(sheet_name)
    row = 1

    # Title
    if spec.get("title"):
        ws[f"A{row}"] = spec.get("title")
        ws[f"A{row}"].font = Font(name=theme_cfg.font_main, size=14, bold=True, color=theme_cfg.primary)
        row += 2

    # KPIs
    if spec.get("kpis"):
        for kpi in spec.get("kpis", []):
            ws[f"A{row}"] = kpi.get("label", "")
            ws[f"B{row}"] = kpi.get("value", "")
            if kpi.get("delta"):
                ws[f"C{row}"] = kpi.get("delta")
            row += 1
        row += 1

    # Data table
    headers = spec.get("headers", [])
    rows_data = spec.get("rows", [])

    if headers:
        for col_idx, header in enumerate(headers, 1):
            cell = ws.cell(row, col_idx)
            cell.value = header
            cell.font = Font(name=theme_cfg.font_main, bold=True, color="FFFFFF", size=10)
            cell.fill = PatternFill(start_color=theme_cfg.primary, end_color=theme_cfg.primary, fill_type="solid")
            cell.alignment = Alignment(horizontal="center", vertical="center")

        # Data rows
        for row_idx, row_data in enumerate(rows_data, row + 1):
            for col_idx, cell_value in enumerate(row_data, 1):
                cell = ws.cell(row_idx, col_idx)
                cell.value = cell_value
                cell.font = Font(name=theme_cfg.font_main, size=9)
                # Alternating row colors
                if row_idx % 2 == 0:
                    cell.fill = PatternFill(start_color="F9FAFC", end_color="F9FAFC", fill_type="solid")

        # Add chart if requested
        if spec.get("add_chart") and len(rows_data) > 0:
            chart = BarChart()
            chart.title = spec.get("chart_title", "Chart")
            data = Reference(ws, min_col=2, min_row=row, max_row=row + len(rows_data))
            chart.add_data(data)
            ws.add_chart(chart, f"A{row + len(rows_data) + 3}")

    # Auto column width
    for col_idx, header in enumerate(headers, 1):
        ws.column_dimensions[chr(64 + col_idx)].width = 18


def _add_data_sheet(wb, theme_cfg, sheet_name: str, spec: dict):
    """Create simple data table sheet."""
    ws = wb.create_sheet(sheet_name)
    row = 1

    # Title
    if spec.get("title"):
        ws[f"A{row}"] = spec.get("title")
        ws[f"A{row}"].font = Font(name=theme_cfg.font_main, size=12, bold=True, color=theme_cfg.primary)
        row += 2

    # Headers
    headers = spec.get("headers", [])
    rows_data = spec.get("rows", [])

    for col_idx, header in enumerate(headers, 1):
        cell = ws.cell(row, col_idx)
        cell.value = header
        cell.font = Font(name=theme_cfg.font_main, bold=True, color="FFFFFF", size=10)
        cell.fill = PatternFill(start_color=theme_cfg.primary, end_color=theme_cfg.primary, fill_type="solid")
        cell.alignment = Alignment(horizontal="center", vertical="center")

    # Data rows
    for row_idx, row_data in enumerate(rows_data, row + 1):
        for col_idx, cell_value in enumerate(row_data, 1):
            cell = ws.cell(row_idx, col_idx)
            cell.value = cell_value
            cell.font = Font(name=theme_cfg.font_main, size=9)
            if row_idx % 2 == 0:
                cell.fill = PatternFill(start_color="F9FAFC", end_color="F9FAFC", fill_type="solid")

    # Auto column width
    for col_idx in range(1, len(headers) + 1):
        ws.column_dimensions[chr(64 + col_idx)].width = 18


def _add_chart_sheet(wb, theme_cfg, sheet_name: str, spec: dict):
    """Create sheet with data and embedded chart."""
    _add_dashboard_sheet(wb, theme_cfg, sheet_name, {**spec, "add_chart": True})


def create_pdf_document(
    output_path: str | Path,
    *,
    template: str = "executivo",
    theme: str = "executivo",
    data: dict[str, Any] | None = None,
) -> Path:
    """Create PDF using Jinja2 templates + xhtml2pdf.

    Available templates: executivo, operacional, tecnico
    """
    theme_cfg = get_theme(theme)
    out = Path(output_path)

    # Load Jinja2 template
    env = Environment(loader=FileSystemLoader(str(TEMPLATES_DIR)))
    template_file = f"{template}.html"

    try:
        jinja_template = env.get_template(template_file)
    except Exception as e:
        raise ValueError(f"Template '{template}' not found: {e}")

    # Render template with data
    context = data or {}
    context.setdefault("document_title", "Relatório")
    html_content = jinja_template.render(**context)

    # Convert HTML to PDF
    with open(out, "w+b") as pdf_file:
        pisa.CreatePDF(html_content, pdf_file)

    return out


def create_docx_document(
    output_path: str | Path,
    *,
    theme: str = "executivo",
    data: dict[str, Any] | None = None,
) -> Path:
    """Create DOCX programmatically with HPE styling.

    No external template required. Builds document structure from data dict.
    """
    theme_cfg = get_theme(theme)
    doc = Document()

    # Set default font
    style = doc.styles["Normal"]
    font = style.font
    font.name = theme_cfg.font_main
    font.size = Pt(11)
    font.color.rgb = RGBColor.from_string(theme_cfg.text)

    data = data or {}

    # Document title
    if data.get("document_title"):
        title = doc.add_paragraph()
        title_run = title.add_run(data.get("document_title"))
        title_run.font.size = Pt(24)
        title_run.font.bold = True
        title_run.font.color.rgb = RGBColor.from_string(theme_cfg.primary)
        title.alignment = WD_PARAGRAPH_ALIGNMENT.CENTER

    # Author / Date / Classification
    if data.get("author") or data.get("date") or data.get("classification"):
        meta = doc.add_paragraph()
        if data.get("author"):
            meta.add_run(f"Autor: {data.get('author')} | ")
        if data.get("date"):
            meta.add_run(f"Data: {data.get('date')} | ")
        if data.get("classification"):
            meta.add_run(f"Classificação: {data.get('classification')}")
        for run in meta.runs:
            run.font.size = Pt(9)
            run.font.color.rgb = RGBColor.from_string(theme_cfg.muted)
        meta.paragraph_format.space_after = Pt(12)

    # Abstract
    if data.get("abstract"):
        abstract = doc.add_paragraph(data.get("abstract"))
        abstract.paragraph_format.left_indent = DocxInches(0.25)
        for run in abstract.runs:
            run.font.italic = True
            run.font.color.rgb = RGBColor.from_string(theme_cfg.secondary)
        abstract.paragraph_format.space_after = Pt(12)

    # Sections
    for section in data.get("sections", []):
        # Section title
        if section.get("title"):
            section_title = doc.add_heading(section.get("title"), level=1)
            section_title.style.font.color.rgb = RGBColor.from_string(theme_cfg.primary)

        # Section content
        if section.get("content"):
            doc.add_paragraph(section.get("content"))

        # Table
        if section.get("table"):
            table_spec = section.get("table")
            headers = table_spec.get("headers", [])
            rows = table_spec.get("rows", [])

            if headers:
                table = doc.add_table(rows=len(rows) + 1, cols=len(headers))
                table.style = "Light Grid Accent 1"

                # Header row
                header_cells = table.rows[0].cells
                for col_idx, header in enumerate(headers):
                    cell = header_cells[col_idx]
                    cell.text = str(header)
                    # Style header
                    for paragraph in cell.paragraphs:
                        for run in paragraph.runs:
                            run.font.bold = True
                            run.font.color.rgb = RGBColor.from_string("FFFFFF")
                        paragraph.style.font.color.rgb = RGBColor.from_string("FFFFFF")

                # Data rows
                for row_idx, row_data in enumerate(rows, 1):
                    row_cells = table.rows[row_idx].cells
                    for col_idx, cell_value in enumerate(row_data):
                        row_cells[col_idx].text = str(cell_value)

    # Page header/footer (programmatically for DOCX is limited, so we note the requirement)
    section = doc.sections[0]
    header = section.header
    header_para = header.paragraphs[0]
    header_para.text = "HPE Intelligence Platform"

    footer = section.footer
    footer_para = footer.paragraphs[0]
    footer_para.text = f"HPE Confidential | {data.get('document_title', 'Document')}"

    out = Path(output_path)
    doc.save(str(out))
    return out


def create_csv_document(output_path: str | Path, *, rows: list[dict[str, Any]]) -> Path:
    """Create simple CSV file from row data."""
    out = Path(output_path)
    pd.DataFrame(rows if rows else [{"coluna": "sem_dados"}]).to_csv(out, index=False, encoding="utf-8")
    return out
