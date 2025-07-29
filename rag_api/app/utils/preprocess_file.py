import os
import tempfile

from markdown_html_pdf.tools import pdf_to_markdown


def preprocess_pdf(pdf_path: str) -> tuple[str, str, str]:
    """
    Preprocessa um arquivo PDF convertendo-o para Markdown.

    Args:
        pdf_path (str): Caminho do arquivo PDF original

    Returns:
        tuple[str, str, str]: (new_file_name, new_content_type, temp_file_path)
    """
    try:
        # Cria um arquivo temporário para o markdown
        with tempfile.NamedTemporaryFile(suffix=".md", delete=False) as tmp_md:
            temp_md_path = tmp_md.name

        # Converte PDF para Markdown
        pdf_to_markdown(pdf_path, temp_md_path)

        # Prepara os novos valores
        new_file_name = os.path.splitext(os.path.basename(pdf_path))[0] + ".md"
        new_content_type = "text/markdown"

        # Remove o arquivo PDF original e renomeia o markdown
        os.unlink(pdf_path)

        return new_file_name, new_content_type, temp_md_path

    except Exception as e:
        # Em caso de erro, remove o arquivo temporário se existir
        if "temp_md_path" in locals() and os.path.exists(temp_md_path):
            os.unlink(temp_md_path)
        raise e
