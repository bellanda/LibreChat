// Enterprise-clean JS builders (dynamic content, fixed design system)
import { Document, HeadingLevel, Packer, Paragraph, TextRun } from 'docx';
import ExcelJS from 'exceljs';
import fs from 'fs/promises';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import PptxGenJS from 'pptxgenjs';

const THEMES = {
  executivo: { primary: '1F4E79', text: '1E1E1E' },
  operacional: { primary: '005A9C', text: '1F2937' },
  board: { primary: '0F2D5C', text: '111827' },
  tecnico: { primary: '264653', text: '102A43' },
};

const getTheme = (name = 'executivo') => THEMES[name] || THEMES.executivo;

export async function createPptxDocument({
  outputPath,
  title,
  subtitle = '',
  bullets = [],
  sections = [],
  theme = 'executivo',
}) {
  const t = getTheme(theme);
  const pptx = new PptxGenJS();
  const s1 = pptx.addSlide();
  s1.background = { color: 'FFFFFF' };
  s1.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 13.333,
    h: 0.9,
    fill: { color: t.primary },
    line: { color: t.primary },
  });
  s1.addText(title, { x: 0.6, y: 0.2, w: 11.5, h: 0.5, fontSize: 24, bold: true, color: 'FFFFFF' });
  s1.addText(subtitle, { x: 0.6, y: 1.6, w: 11.5, h: 0.6, fontSize: 16, color: '666666' });

  if (bullets.length) {
    const s2 = pptx.addSlide();
    s2.addText('Conteudo', {
      x: 0.6,
      y: 0.6,
      w: 3,
      h: 0.6,
      fontSize: 24,
      bold: true,
      color: t.primary,
    });
    bullets.forEach((item, idx) => {
      s2.addText(`• ${item}`, {
        x: 0.9,
        y: 1.4 + idx * 0.5,
        w: 11,
        h: 0.4,
        fontSize: 14,
        color: t.text,
      });
    });
  }

  sections.forEach((section) => {
    const s = pptx.addSlide();
    s.addText(String(section.title || 'Secao'), {
      x: 0.6,
      y: 0.6,
      w: 11.5,
      h: 0.6,
      fontSize: 24,
      bold: true,
      color: t.primary,
    });
    (section.items || []).forEach((item, idx) => {
      s.addText(`• ${String(item)}`, {
        x: 0.9,
        y: 1.4 + idx * 0.45,
        w: 11,
        h: 0.4,
        fontSize: 14,
        color: t.text,
      });
    });
  });

  await pptx.writeFile({ fileName: outputPath });
}

export async function createXlsxDocument({
  outputPath,
  rows = [],
  theme = 'executivo',
  sheetName = 'Resumo',
}) {
  const t = getTheme(theme);
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet(sheetName.slice(0, 31));
  if (!rows.length) rows = [{ Indicador: 'KPI', Valor: 'N/A' }];
  ws.columns = Object.keys(rows[0]).map((k) => ({ header: k, key: k, width: 30 }));
  rows.forEach((r) => ws.addRow(r));
  ws.getRow(1).eachCell((c) => {
    c.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${t.primary}` } };
  });
  await wb.xlsx.writeFile(outputPath);
}

export async function createDocxDocument({ outputPath, title, subtitle = '', paragraphs = [] }) {
  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            children: [new TextRun({ text: title, bold: true })],
          }),
          new Paragraph({ children: [new TextRun(subtitle)] }),
          ...paragraphs.map((p) => new Paragraph(String(p))),
        ],
      },
    ],
  });
  const buffer = await Packer.toBuffer(doc);
  await fs.writeFile(outputPath, buffer);
}

export async function createPdfDocument({ outputPath, title, lines = [] }) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  page.drawText(title, { x: 40, y: 790, size: 22, font, color: rgb(0.12, 0.31, 0.47) });
  lines.forEach((line, idx) => {
    page.drawText(String(line), {
      x: 40,
      y: 750 - idx * 20,
      size: 12,
      font,
      color: rgb(0.12, 0.12, 0.12),
    });
  });
  const bytes = await pdfDoc.save();
  await fs.writeFile(outputPath, bytes);
}

// Backward-compatible aliases for old integrations
export const createPptxReport = createPptxDocument;
export const createXlsxReport = createXlsxDocument;
export const createDocxReport = createDocxDocument;
export const createPdfReport = createPdfDocument;
