import pandas as pd
from tabulate import tabulate


def excel_to_markdown(file_path, output_path):
    # Lê todas as planilhas
    excel_file = pd.ExcelFile(file_path)

    with open(output_path, "w", encoding="utf-8") as f:
        for sheet_name in excel_file.sheet_names:
            df = pd.read_excel(file_path, sheet_name=sheet_name)

            # Cabeçalho da planilha
            f.write(f"\n# 📋 Planilha: {sheet_name}\n\n")

            # Converte para markdown
            f.write(tabulate(df, headers="keys", tablefmt="pipe", showindex=False))
            f.write("\n\n")


SRC = "/mnt/c/Users/OU000150/OneDrive - HPE Automotores do Brasil Ltda/Planejamento Estratégico IA/Gestão AI & Data Science Team/TO DO.xlsx"
# SRC = "/mnt/c/Users/OU000150/OneDrive/Finances/Despesas Mensais.xlsx"
# SRC = "/mnt/c/Users/OU000150/OneDrive - HPE Automotores do Brasil Ltda/Projeto HUB/TESTES INTEGRADOS/Roteiro de Testes - MIT045/Roteiro de Testes - MIT045 - HPE - HUB HPE - Integrados_v1.xlsx"

excel_to_markdown(SRC, "output.md")
