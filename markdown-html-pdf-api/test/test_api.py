# tests/test_api.py
import os
import pytest
from fastapi.testclient import TestClient
from app.main import app


INPUT_MD_FILE = "./archives/input.md"



# Debug flag
# DEBUG = os.environ.get("DEBUG_CONSOLE_MARKDOWN_HTML_PDF_API") == "true"
DEBUG = True

client = TestClient(app)

def test_convert_pdf_success(tmp_path):
    if DEBUG:
        print("[DEBUG] Running test_convert_pdf_success")
    md = tmp_path / "test.md"
    md.write_text("# PDF Test\nSample")
    with open(md, 'rb') as f:
        response = client.post(
            "/convert/md-to-pdf",
            files={"file": (INPUT_MD_FILE, f, "text/markdown")}
        )
    if DEBUG:
        print(f"[DEBUG] PDF Response status: {response.status_code}")
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
    assert len(response.content) > 0

def test_convert_html_success(tmp_path):
    if DEBUG:
        print("[DEBUG] Running test_convert_html_success")
    md = tmp_path / "test.md"
    md.write_text("# HTML Test\nSample")
    with open(md, 'rb') as f:
        response = client.post(
            "/convert/md-to-html",
            files={"file": (INPUT_MD_FILE, f, "text/markdown")}
        )
    if DEBUG:
        print(f"[DEBUG] HTML Response status: {response.status_code}")
    assert response.status_code == 200
    assert response.headers["content-type"].startswith("text/html")
    assert b"<h1>HTML Test</h1>" in response.content

@pytest.mark.parametrize("endpoint,name,content_type,expected_status", [
    ("/convert/md-to-pdf", "test.txt", "text/plain", 400),
    ("/convert/md-to-html", "test.jpg", "image/jpeg", 400),
])
def test_invalid_file(endpoint, name, content_type, expected_status):
    if DEBUG:
        print(f"[DEBUG] Running test_invalid_file on {endpoint} with {name}")
    response = client.post(
        endpoint,
        files={"file": (name, b"data", content_type)}
    )
    if DEBUG:
        print(f"[DEBUG] Response: {response.status_code}, detail: {response.json().get('detail')}")
    assert response.status_code == expected_status
    assert "Invalid file type" in response.json()["detail"]