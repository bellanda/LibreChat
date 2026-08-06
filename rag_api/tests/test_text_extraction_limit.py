"""Token ceiling for the /text ("Upload as Text") extraction endpoint.

The ceiling is a memory guard against absurdly large files, not a business rule:
LibreChat truncates gracefully on its side at `fileConfig.fileTokenLimit`
(see `processTextWithTokenLimit`). A ceiling below that limit turns a file that
LibreChat would have happily truncated into a hard 413 -> 500 upload failure.
"""

import pytest
from fastapi import HTTPException


def test_token_limit_is_configurable_and_above_legacy_ceiling():
    from app.config import TEXT_EXTRACTION_TOKEN_LIMIT

    assert isinstance(TEXT_EXTRACTION_TOKEN_LIMIT, int)
    # The legacy hardcoded ceiling was 30_000, a third of LibreChat's own
    # default fileTokenLimit (100_000), so it rejected files LibreChat handles.
    assert TEXT_EXTRACTION_TOKEN_LIMIT > 30_000


def test_text_under_limit_is_accepted():
    from app.routes.document_routes import enforce_text_extraction_token_limit

    token_count = enforce_text_extraction_token_limit("col_a,col_b\n1,2\n", "small.csv")

    assert token_count > 0


def test_text_over_limit_raises_413_naming_the_token_count(monkeypatch):
    from app.routes import document_routes

    monkeypatch.setattr(document_routes, "TEXT_EXTRACTION_TOKEN_LIMIT", 5)

    with pytest.raises(HTTPException) as exc_info:
        document_routes.enforce_text_extraction_token_limit(
            "col_a,col_b\n" + "1,2\n" * 100, "big.csv"
        )

    assert exc_info.value.status_code == 413
    assert "5" in str(exc_info.value.detail)
