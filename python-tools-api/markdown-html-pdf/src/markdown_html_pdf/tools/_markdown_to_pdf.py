"""Main module for converting Markdown to PDF."""

import asyncio
import pathlib
import tempfile
from typing import Union

from markdown_html_pdf._constants import paths
from markdown_html_pdf.tools import html_to_pdf, markdown_to_html


async def markdown_to_pdf(
    markdown_text: str, pdf_output_file_path: Union[str, pathlib.Path], html_output_title: str = "Markdown to PDF"
) -> None:
    """Convert Markdown text to PDF with syntax highlighting and emoji support.

    Args:
        markdown_text: Markdown text content
        pdf_output_file_path: Path where the PDF file will be saved
        html_output_title: Title for the HTML document and PDF
    """
    # Create a temporary directory for HTML files
    with tempfile.TemporaryDirectory() as temp_dir:
        temp_html_file_path = pathlib.Path(temp_dir) / "temp.html"

        # Convert markdown to html
        html_content = markdown_to_html(markdown_text, html_output_title)

        # Write HTML content to temporary file
        with open(temp_html_file_path, "w", encoding="utf-8") as f:
            f.write(html_content)

        # Convert html to pdf
        await html_to_pdf(temp_html_file_path, pdf_output_file_path)

        # Temporary file is automatically cleaned up when exiting the context


async def markdown_to_pdf_file(
    markdown_file_path: Union[str, pathlib.Path],
    pdf_output_file_path: Union[str, pathlib.Path],
    html_output_title: str = "Markdown to PDF",
) -> None:
    """Convert Markdown file to PDF with syntax highlighting and emoji support.

    Args:
        markdown_file_path: Path to the input Markdown file
        pdf_output_file_path: Path where the PDF file will be saved
        html_output_title: Title for the HTML document and PDF
    """
    # Read the markdown file
    with open(markdown_file_path, "r", encoding="utf-8") as f:
        markdown_text = f.read()

    # Convert markdown text to PDF
    await markdown_to_pdf(markdown_text, pdf_output_file_path, html_output_title)


if __name__ == "__main__":
    asyncio.run(
        markdown_to_pdf_file(
            markdown_file_path=paths.MARKDOWN_DIR / "example.md",
            pdf_output_file_path=paths.PDF_DIR / "example.pdf",
        )
    )
