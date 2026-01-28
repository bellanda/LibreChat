#!/usr/bin/env python3
"""
Script para revisar arquivos do faltam.txt um por um usando git difftool.
"""

import argparse
import subprocess
import sys
from pathlib import Path


def extract_file_from_line(line: str) -> str | None:
    """Extrai o nome do arquivo de uma linha do faltam.txt."""
    line = line.strip()
    if not line:
        return None
    
    # Se a linha já é apenas um caminho de arquivo, retorna diretamente
    if not line.startswith('git difftool'):
        return line
    
    # Se é um comando git difftool, extrai o arquivo (último argumento)
    parts = line.split()
    if len(parts) >= 3 and parts[0] == 'git' and parts[1] == 'difftool':
        # Pega o último elemento (o arquivo)
        return parts[-1]
    
    return None


def move_to_foram(faltam_file: Path, foram_file: Path, linha_completa: str) -> bool:
    """Move a linha do faltam.txt para o final do foram.txt."""
    try:
        # Adiciona ao final do foram.txt
        with open(foram_file, 'a', encoding='utf-8') as f:
            f.write(linha_completa)
            if not linha_completa.endswith('\n'):
                f.write('\n')
        
        # Remove do faltam.txt
        with open(faltam_file, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        # Remove a primeira linha não vazia (que corresponde à linha_completa)
        removed = False
        new_lines = []
        for line in lines:
            if not removed and line.strip() and line.strip() == linha_completa.strip():
                removed = True
                continue
            new_lines.append(line)
        
        if removed:
            with open(faltam_file, 'w', encoding='utf-8') as f:
                f.writelines(new_lines)
            return True
        return False
    except Exception as e:
        print(f"Erro ao mover para foram.txt: {e}", file=sys.stderr)
        return False


def main():
    parser = argparse.ArgumentParser(
        description='Revisa arquivos do faltam.txt um por um usando git difftool'
    )
    parser.add_argument(
        '--auto-remove',
        action='store_true',
        help='Move automaticamente o arquivo para foram.txt após revisar (sem perguntar)'
    )
    args = parser.parse_args()
    
    script_dir = Path(__file__).parent
    faltam_file = script_dir / 'faltam.txt'
    foram_file = script_dir / 'foram.txt'
    
    if not faltam_file.exists():
        print(f"Erro: {faltam_file} não encontrado!", file=sys.stderr)
        sys.exit(1)
    
    # Cria foram.txt se não existir
    if not foram_file.exists():
        foram_file.touch()
    
    # Lê a primeira linha não vazia completa (não só o arquivo)
    with open(faltam_file, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    arquivo = None
    linha_completa = None
    for line in lines:
        linha_completa = line
        arquivo = extract_file_from_line(line)
        if arquivo:
            break
    
    if not arquivo or not linha_completa:
        print("Nenhum arquivo encontrado em faltam.txt!")
        sys.exit(0)
    
    print(f"Verificando: {arquivo}")
    
    # Verifica se o arquivo existe
    arquivo_path = script_dir / arquivo
    if not arquivo_path.exists():
        print(f"Aviso: Arquivo {arquivo} não existe no sistema de arquivos.")
        print("Executando difftool mesmo assim...")
    
    # Executa o git difftool
    try:
        result = subprocess.run(
            ['git', 'difftool', 'upstream/main', '--', arquivo],
            cwd=script_dir,
            check=False
        )
        
        # Com --auto-remove, move automaticamente para foram.txt sem perguntar
        if args.auto_remove:
            if move_to_foram(faltam_file, foram_file, linha_completa):
                print(f"✓ Movido para foram.txt: {arquivo}")
            else:
                print("Erro ao mover para foram.txt.")
        else:
            # Sem --auto-remove, pergunta se quer mover
            if result.returncode == 0:
                resposta = input("\nDeseja mover este arquivo para foram.txt? (s/N): ").strip().lower()
                if resposta in ['s', 'sim', 'y', 'yes']:
                    if move_to_foram(faltam_file, foram_file, linha_completa):
                        print(f"✓ Movido para foram.txt: {arquivo}")
                    else:
                        print("Erro ao mover para foram.txt.")
            else:
                print(f"\nDifftool retornou código {result.returncode}")
    
    except KeyboardInterrupt:
        # Se foi interrompido, só move se --auto-remove estiver ativo
        if args.auto_remove:
            if move_to_foram(faltam_file, foram_file, linha_completa):
                print(f"\n✓ Movido para foram.txt: {arquivo}")
        else:
            print("\n\nInterrompido pelo usuário.")
        sys.exit(1)
    except Exception as e:
        print(f"Erro ao executar git difftool: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == '__main__':
    main()
