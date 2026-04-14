"""Testes para CorporateTheme e paleta HPE."""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from style import get_theme, THEMES


def test_board_theme_primary_color():
    theme = get_theme("board")
    assert theme.primary == "0F2D5C"


def test_board_theme_accent_is_hpe_red():
    theme = get_theme("board")
    assert theme.accent == "A92525"


def test_accent_light_exists():
    theme = get_theme("board")
    assert theme.accent_light == "A94545"


def test_all_themes_have_accent_light():
    for name, theme in THEMES.items():
        assert hasattr(theme, 'accent_light'), f"Theme {name} missing accent_light"


def test_get_theme_default():
    theme = get_theme()
    assert theme.name == "board"  # novo padrão HPE


def test_get_theme_unknown_fallback():
    theme = get_theme("nao_existe")
    assert theme.name == "board"
