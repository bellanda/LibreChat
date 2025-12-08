import asyncio

from markdown_html_pdf.tools import markdown_to_html, markdown_to_pdf_file


def main():
    with open("./src/markdown_html_pdf/_docs/markdown/example.md", "r") as f:
        markdown_text = f.read()

    html_content = markdown_to_html(markdown_text, "Example")

    with open("./src/markdown_html_pdf/_docs/html/example.html", "w") as f:
        f.write(html_content)

    asyncio.run(
        markdown_to_pdf_file(
            markdown_file_path="./src/markdown_html_pdf/_docs/markdown/example.md",
            pdf_output_file_path="./src/markdown_html_pdf/_docs/pdf/example.pdf",
        )
    )


if __name__ == "__main__":
    main()
