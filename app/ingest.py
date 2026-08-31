import os
from pypdf import PdfReader
from app.config import CHUNK_SIZE, CHUNK_OVERLAP


def load_text_from_file(file_path: str) -> str:
    """Extract raw text from a PDF or TXT file."""
    ext = os.path.splitext(file_path)[1].lower()

    if ext == ".pdf":
        reader = PdfReader(file_path)
        text = ""
        for page in reader.pages:
            page_text = page.extract_text() or ""
            text += page_text + "\n"
        return text

    elif ext in (".txt", ".md"):
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            return f.read()

    else:
        raise ValueError(f"Unsupported file type: {ext}")


def chunk_text(text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> list[str]:
    """
    Split text into overlapping chunks by character count.
    Simple sliding-window chunker — good enough for manuals/procedures.
    """
    text = " ".join(text.split())  # normalize whitespace
    if not text:
        return []

    chunks = []
    start = 0
    text_len = len(text)

    while start < text_len:
        end = min(start + chunk_size, text_len)
        chunk = text[start:end]
        chunks.append(chunk)
        if end == text_len:
            break
        start = end - overlap  # slide window with overlap

    return chunks


def process_document(file_path: str) -> list[str]:
    """Load a document and return its list of text chunks."""
    raw_text = load_text_from_file(file_path)
    return chunk_text(raw_text)
