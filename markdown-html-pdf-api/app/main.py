# main.py
import os
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse
from app.converter import Converter
from fastapi.middleware.cors import CORSMiddleware

# Debug flag
# DEBUG = os.environ.get("DEBUG_CONSOLE_MARKDOWN_HTML_PDF_API") == "true"
DEBUG = True

app = FastAPI(title="Markdown to PDF/HTML Converter")
converter = Converter()





# Adicionar CORS para permitir o frontend acessar a API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3090"],  # ou ["*"] para liberar geral
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

print(f"[DEBUG] ATIVOU")

@app.post("/convert/md-to-pdf", response_class=StreamingResponse)
async def convert_md_to_pdf(file: UploadFile = File(...)):
    """
    Upload a Markdown file and receive a PDF.
    """
    
    if DEBUG:
        print(f"[DEBUG] convert_pdf called with filename: {file.filename}")
    if not file.filename.lower().endswith(('.md', '.markdown')):
        if DEBUG:
            print(f"[DEBUG] Invalid file type for PDF: {file.filename}")
        raise HTTPException(status_code=400, detail="Invalid file type. Use .md or .markdown files.")
    data = await file.read()
    if DEBUG:
        print(f"[DEBUG] Read {len(data)} bytes from uploaded file for PDF")
    try:
        pdf_bytes = await converter.to_pdf_bytes(data)
    except Exception as e:
        if DEBUG:
            print(f"[DEBUG] PDF conversion error: {e}")
        raise HTTPException(status_code=500, detail=f"PDF conversion failed: {e}")
    if DEBUG:
        print(f"[DEBUG] Returning PDF of size {len(pdf_bytes)} bytes")

    return StreamingResponse(
        iter([pdf_bytes]),
        media_type='application/pdf',
        headers={
            'Content-Disposition': f'attachment; filename="{file.filename.rsplit(".",1)[0]}.pdf"'
        }
    )

@app.post("/convert/md-to-html", response_class=StreamingResponse)
async def convert_md_to_html(file: UploadFile = File(...)):
    """
    Upload a Markdown file and receive an HTML.
    """
    if DEBUG:
        print(f"[DEBUG] convert_html called with filename: {file.filename}")
    if not file.filename.lower().endswith(('.md', '.markdown')):
        if DEBUG:
            print(f"[DEBUG] Invalid file type for HTML: {file.filename}")
        raise HTTPException(status_code=400, detail="Invalid file type. Use .md or .markdown files.")
    data = await file.read()
    if DEBUG:
        print(f"[DEBUG] Read {len(data)} bytes from uploaded file for HTML")
    try:
        html_bytes = await converter.to_html_bytes(data)
    except Exception as e:
        if DEBUG:
            print(f"[DEBUG] HTML conversion error: {e}")
        raise HTTPException(status_code=500, detail=f"HTML conversion failed: {e}")
    if DEBUG:
        print(f"[DEBUG] Returning HTML of size {len(html_bytes)} bytes")

    return StreamingResponse(
        iter([html_bytes]),
        media_type='text/html',
        headers={
            'Content-Disposition': f'attachment; filename="{file.filename.rsplit(".",1)[0]}.html"'
        }
    )
