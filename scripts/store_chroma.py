import chromadb
from pypdf import PdfReader
from sentence_transformers import SentenceTransformer


reader = PdfReader("data/pdfs/Plc.pdf")

all_text = ""

for page in reader.pages:
    text = page.extract_text()

    if text:
        all_text += text + "\n"


chunk_size = 1000
chunks = []

for i in range(0, len(all_text), chunk_size):
    chunks.append(all_text[i:i + chunk_size])

print("Total Chunks:", len(chunks))


print("Loading embedding model...")

model = SentenceTransformer("all-MiniLM-L6-v2")

print("Creating embeddings...")

embeddings = model.encode(
    chunks,
    batch_size=16,
    show_progress_bar=True,
    convert_to_numpy=True
)

print("Embeddings Created!")


client = chromadb.PersistentClient(path="chroma_db")

collection = client.get_or_create_collection(
    name="industrial_manuals"
)

print("Connected to ChromaDB!")
print("\nStoring data into ChromaDB...")

for i in range(len(chunks)):
    collection.add(
        ids=[str(i)],
        documents=[chunks[i]],
        embeddings=[embeddings[i].tolist()]
    )

print("Data Stored Successfully!")