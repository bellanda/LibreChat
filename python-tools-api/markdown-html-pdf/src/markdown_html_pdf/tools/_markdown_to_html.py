"""Convert Markdown to HTML with syntax highlighting."""

import pathlib
from typing import Union

import cmarkgfm

from markdown_html_pdf._constants import paths


def markdown_to_html(markdown_text: str, html_output_title: str) -> str:
    """Convert Markdown text to HTML with syntax highlighting.

    Args:
        markdown_text: Markdown text content
        html_output_title: Title for the HTML document

    Returns:
        HTML content as string
    """
    # 1. Render to HTML using cmarkgfm
    html_body = cmarkgfm.github_flavored_markdown_to_html(markdown_text)

    # 2. Read the HTML template to render the markdown at github style
    with open(paths.HTML_DIR / "template.html", "r", encoding="utf-8") as f:
        html_template = f.read()

    # 3. Replace the placeholders with the actual content
    html_template = html_template.replace("||MARKDOWN_TO_BE_RENDERED_HERE||", html_body)
    html_template = html_template.replace("||TITLE_TO_BE_RENDERED_HERE||", html_output_title)

    return html_template


def markdown_to_html_file(
    markdown_file_path: Union[str, pathlib.Path], html_output_file_path: Union[str, pathlib.Path], html_output_title: str
) -> None:
    """Convert Markdown file to HTML file with syntax highlighting.

    Args:
        markdown_file_path: Path to the input Markdown file
        html_output_file_path: Path where the HTML file will be saved
        html_output_title: Title for the HTML document
    """
    # 1. Read the markdown file
    with open(markdown_file_path, "r", encoding="utf-8") as f:
        markdown_text = f.read()

    # 2. Convert to HTML
    html_content = markdown_to_html(markdown_text, html_output_title)

    # 3. Create output directory if it doesn't exist
    pathlib.Path(html_output_file_path).parent.mkdir(parents=True, exist_ok=True)

    # 4. Save the HTML file
    with open(html_output_file_path, "w", encoding="utf-8") as f:
        f.write(html_content)


if __name__ == "__main__":
    markdown_to_html_file(
        markdown_file_path=paths.MARKDOWN_DIR / "example.md",
        html_output_file_path=paths.HTML_DIR / "example.html",
        html_output_title="Example",
    )
