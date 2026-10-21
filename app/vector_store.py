import uuid
import chromadb
from sentence_transformers import SentenceTransformer
from app.config import CHROMA_DB_PATH, COLLECTION_NAME, EMBEDDING_MODEL, TOP_K


# Load embedding model once at startup
_embedder = SentenceTransformer(EMBEDDING_MODEL)


# Connect to the existing persistent Chroma database
_client = chromadb.PersistentClient(path=CHROMA_DB_PATH)
_collection = _client.get_or_create_collection(name=COLLECTION_NAME)


def embed_texts(texts: list[str]) -> list[list[float]]:
    embeddings = _embedder.encode(texts, show_progress_bar=False)
    return embeddings.tolist()


def add_chunks(chunks: list[str], source: str) -> int:
    """Embed and store chunks from one document into the vector DB."""
    if not chunks:
        return 0

    ids = [f"{source}__{uuid.uuid4().hex[:8]}" for _ in chunks]

    metadatas = [
        {
            "source": source,
            "chunk_id": ids[i]
        }
        for i in range(len(chunks))
    ]

    embeddings = embed_texts(chunks)

    _collection.add(
        ids=ids,
        embeddings=embeddings,
        documents=chunks,
        metadatas=metadatas,
    )

    return len(chunks)


def query_similar(question: str, top_k: int = None):
    """Return the most relevant chunks for a question."""

    top_k = top_k or TOP_K

    query_embedding = embed_texts([question])[0]

    results = _collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k,
    )

    matches = []

    docs = results.get("documents", [[]])[0]
    metas = results.get("metadatas", [[]])[0]
    ids = results.get("ids", [[]])[0]
    distances = results.get("distances", [[]])[0]

    for doc, meta, chunk_id, dist in zip(
        docs,
        metas,
        ids,
        distances
    ):

        # Existing database has None metadata.
        # Therefore safely handle missing metadata.
        meta = meta or {}

        source = meta.get("source")

        # If no source metadata exists, use a readable fallback.
        if not source:
            source = "Industrial Manual"

        matches.append({
            "text": doc,
            "source": source,
            "chunk_id": meta.get("chunk_id", chunk_id),
            "score": dist,
        })

    return matches


def list_documents():
    """Return distinct source filenames and their chunk counts."""

    all_items = _collection.get()

    counts = {}

    for meta in all_items.get("metadatas", []):

        meta = meta or {}

        source = meta.get("source")

        if not source:
            source = "Industrial Manual"

        counts[source] = counts.get(source, 0) + 1

    return [
        {
            "filename": filename,
            "chunk_count": count
        }
        for filename, count in counts.items()
    ]