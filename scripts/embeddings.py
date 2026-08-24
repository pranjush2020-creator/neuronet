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

print("Total Characters:", len(all_text))
print("Total Chunks:", len(chunks))

print("\nLoading embedding model...")

model = SentenceTransformer("all-MiniLM-L6-v2")

print("Model loaded successfully!")

print("\nCreating embeddings...")

embeddings = model.encode(
    chunks[:100],          
    batch_size=16,
    show_progress_bar=True,
    convert_to_numpy=True
)

print("\nEmbedding creation completed!")

print("Total Embeddings:", len(embeddings))
print("Length of One Embedding:", len(embeddings[0]))

print("\nFirst 10 values of the first embedding:")
print(embeddings[0][:10])