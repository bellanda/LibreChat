# converter.py
from markdown_html_pdf.tools import markdown_to_html, markdown_to_pdf

# Debug flag
# DEBUG = os.environ.get("DEBUG_CONSOLE_MARKDOWN_HTML_PDF_API") == "true"
DEBUG = True


class Converter:
    """
    Wrapper around markdown-html-pdf to convert markdown bytes to PDF or HTML bytes.
    """

    async def to_pdf_bytes(self, markdown_bytes: bytes) -> bytes:
        """
        Convert Markdown content (bytes) to PDF content (bytes).

        :param markdown_bytes: Markdown file content in bytes
        :return: Generated PDF file content in bytes
        """
        if DEBUG:
            print(f"[DEBUG] to_pdf_bytes called with markdown_bytes size: {len(markdown_bytes)} bytes")

        # Save to temporary files
        import tempfile

        with tempfile.NamedTemporaryFile(suffix=".md", delete=False) as md_tmp:
            md_tmp.write(markdown_bytes)
            md_path = md_tmp.name
            if DEBUG:
                print(f"[DEBUG] Temporary markdown file created at: {md_path}")
        with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as pdf_tmp:
            pdf_path = pdf_tmp.name
            if DEBUG:
                print(f"[DEBUG] Temporary PDF file will be: {pdf_path}")

        # Perform conversion
        await markdown_to_pdf(markdown_file_path=md_path, pdf_output_file_path=pdf_path)
        if DEBUG:
            print("[DEBUG] markdown_to_pdf conversion completed")

        # Read PDF bytes
        with open(pdf_path, "rb") as f:
            pdf_bytes = f.read()
        if DEBUG:
            print(f"[DEBUG] PDF bytes size: {len(pdf_bytes)} bytes")

        return pdf_bytes

    async def to_html_bytes(self, markdown_bytes: bytes) -> bytes:
        """
        Convert Markdown content (bytes) to HTML content (bytes).

        :param markdown_bytes: Markdown file content in bytes
        :return: Generated HTML file content in bytes
        """
        if DEBUG:
            print(f"[DEBUG] to_html_bytes called with markdown_bytes size: {len(markdown_bytes)} bytes")

        # Save to temporary files
        import tempfile

        with tempfile.NamedTemporaryFile(suffix=".md", delete=False) as md_tmp:
            md_tmp.write(markdown_bytes)
            md_path = md_tmp.name
            if DEBUG:
                print(f"[DEBUG] Temporary markdown file created at: {md_path}")
        with tempfile.NamedTemporaryFile(suffix=".html", delete=False) as html_tmp:
            html_path = html_tmp.name
            if DEBUG:
                print(f"[DEBUG] Temporary HTML file will be: {html_path}")

        # Perform conversion to HTML
        markdown_to_html(markdown_file_path=md_path, html_output_file_path=html_path, html_output_title="Output")
        if DEBUG:
            print("[DEBUG] markdown_to_html conversion completed")

        # Read HTML bytes
        with open(html_path, "rb") as f:
            html_bytes = f.read()
        if DEBUG:
            print(f"[DEBUG] HTML bytes size: {len(html_bytes)} bytes")

        return html_bytes
