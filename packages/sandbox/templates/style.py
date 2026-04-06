"""Shared enterprise-clean themes and style constants — HPE Corporate Clean palette."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class CorporateTheme:
    name: str
    primary: str        # Header, titles
    secondary: str      # Sub-headers, secondary KPIs
    accent: str         # Alerts, highlights — HPE red
    accent_light: str   # Lighter accent variant
    light: str          # Light tint of primary
    surface: str        # Card/section background
    text: str           # Body text
    muted: str          # Footer, labels, captions
    success: str        # Positive deltas (green)
    font_main: str = "Arial"
    font_mono: str = "Courier New"


THEMES: dict[str, CorporateTheme] = {
    "board": CorporateTheme(
        name="board",
        primary="0F2D5C",
        secondary="1D4E89",
        accent="A92525",
        accent_light="A94545",
        light="D9E2F0",
        surface="F5F7FB",
        text="475569",
        muted="94A3B8",
        success="166534",
    ),
    "executivo": CorporateTheme(
        name="executivo",
        primary="0F2D5C",
        secondary="1D4E89",
        accent="A92525",
        accent_light="A94545",
        light="DCE6F2",
        surface="F7F9FC",
        text="475569",
        muted="94A3B8",
        success="166534",
    ),
    "operacional": CorporateTheme(
        name="operacional",
        primary="0F2D5C",
        secondary="166534",
        accent="A92525",
        accent_light="A94545",
        light="D7E9F7",
        surface="F6FAFD",
        text="475569",
        muted="94A3B8",
        success="166534",
    ),
    "tecnico": CorporateTheme(
        name="tecnico",
        primary="0F2D5C",
        secondary="1D4E89",
        accent="A92525",
        accent_light="A94545",
        light="D9E2F0",
        surface="F5F7FB",
        text="475569",
        muted="94A3B8",
        success="166534",
    ),
}

DEFAULT_THEME = "board"


def get_theme(name: str | None = None) -> CorporateTheme:
    if not name:
        return THEMES[DEFAULT_THEME]
    return THEMES.get(name.lower(), THEMES[DEFAULT_THEME])
