/**
 * PDF Text Extractor - Uses Python executor to extract text from PDFs
 */

const executor = require('./executor');
const { logger } = require('./logger');

/**
 * Extract text from PDF using Python libraries (PyPDF, pdfplumber)
 * @param {Object} options
 * @param {string} options.storageRoot
 * @param {string} options.userId
 * @param {string} options.sessionId
 * @param {string} options.fileId - File ID of uploaded PDF
 * @param {string} options.filename - Original filename
 * @returns {Promise<{ text: string; pageCount: number; metadata?: object }>}
 */
async function extractPdfText({ 
  storageRoot, 
  userId, 
  sessionId, 
  fileId, 
  filename,
}) {
  const pythonCode = `
import json
import sys
from pathlib import Path

try:
    import pdfplumber
    USE_PDFPLUMBER = True
except ImportError:
    USE_PDFPLUMBER = False
    try:
        from pypdf import PdfReader
        USE_PYPDF = True
    except ImportError:
        USE_PYPDF = False

if not USE_PDFPLUMBER and not USE_PYPDF:
    print(json.dumps({"error": "No PDF library available. Install pdfplumber or pypdf."}), file=sys.stderr)
    sys.exit(1)

# Find PDF file in /mnt/data
data_dir = Path("/mnt/data")
pdf_files = list(data_dir.glob("*.pdf"))
if not pdf_files:
    print(json.dumps({"error": "No PDF file found in /mnt/data"}), file=sys.stderr)
    sys.exit(1)

pdf_path = pdf_files[0]
text_parts = []
metadata = {}
page_count = 0

try:
    if USE_PDFPLUMBER:
        # pdfplumber is better for tables and complex layouts
        with pdfplumber.open(pdf_path) as pdf:
            page_count = len(pdf.pages)
            metadata = {
                "total_pages": page_count,
                "title": pdf.metadata.get("Title", ""),
                "author": pdf.metadata.get("Author", ""),
                "subject": pdf.metadata.get("Subject", ""),
            }
            
            for i, page in enumerate(pdf.pages):
                page_text = page.extract_text()
                if page_text:
                    text_parts.append(f"--- Page {i+1} ---\\n{page_text}")
    else:
        # Fallback to PyPDF
        reader = PdfReader(str(pdf_path))
        page_count = len(reader.pages)
        metadata = {
            "total_pages": page_count,
            "title": reader.metadata.get("/Title", "") if reader.metadata else "",
            "author": reader.metadata.get("/Author", "") if reader.metadata else "",
        }
        
        for i, page in enumerate(reader.pages):
            page_text = page.extract_text()
            if page_text:
                text_parts.append(f"--- Page {i+1} ---\\n{page_text}")
    
    full_text = "\\n\\n".join(text_parts)
    
    result = {
        "text": full_text,
        "pageCount": page_count,
        "metadata": metadata,
        "charCount": len(full_text),
    }
    
    print(json.dumps(result))
    sys.exit(0)
    
except Exception as e:
    error_msg = f"Error extracting PDF: {str(e)}"
    print(json.dumps({"error": error_msg}), file=sys.stderr)
    sys.exit(1)
`;

  try {
    logger.info('Extracting PDF text', {
      userId,
      sessionId,
      fileId,
      filename,
    });

    const result = await executor.execute({
      storageRoot,
      userId,
      sessionId,
      lang: 'py',
      code: pythonCode,
      files: [{ id: fileId, name: filename }],
      timeoutMs: 60_000, // 60 seconds for PDF processing
      memoryMB: 1024, // More memory for PDF processing
    });

    if (result.exitCode !== 0) {
      const errorMsg = result.stderr || result.stdout || 'Unknown error';
      logger.error('PDF extraction failed', {
        userId,
        sessionId,
        fileId,
        error: errorMsg,
      });
      throw new Error(`PDF extraction failed: ${errorMsg}`);
    }

    // Parse JSON output from Python script
    const output = result.stdout.trim();
    let extractedData;
    
    try {
      extractedData = JSON.parse(output);
    } catch (parseError) {
      // If JSON parsing fails, try to extract from stdout
      logger.warn('Failed to parse JSON output, using raw text', {
        userId,
        sessionId,
        fileId,
        stdout: output.substring(0, 200),
      });
      extractedData = {
        text: output,
        pageCount: 0,
        charCount: output.length,
      };
    }

    if (extractedData.error) {
      throw new Error(extractedData.error);
    }

    logger.info('PDF extraction successful', {
      userId,
      sessionId,
      fileId,
      pageCount: extractedData.pageCount,
      charCount: extractedData.charCount,
    });

    return {
      text: extractedData.text || '',
      pageCount: extractedData.pageCount || 0,
      metadata: extractedData.metadata || {},
      charCount: extractedData.charCount || 0,
    };
  } catch (error) {
    logger.error('PDF extraction error', {
      userId,
      sessionId,
      fileId,
      error: error.message,
      stack: error.stack,
    });
    throw error;
  }
}

module.exports = {
  extractPdfText,
};
