import asyncio
from markdown_html_pdf.tools import markdown_to_pdf
import fastapi





async def convert():
    await markdown_to_pdf(
        markdown_file_path="input.md",
        pdf_output_file_path="output.pdf"
    )



asyncio.run(convert())