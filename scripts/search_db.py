import chromadb
from sentence_transformers import SentenceTransformer

print("===== THIS IS THE NEW search_db.py =====")
print("Loading embedding model...")
model = SentenceTransformer("all-MiniLM-L6-v2")


print("Connecting to ChromaDB...")

client = chromadb.PersistentClient(path="chroma_db")

collection = client.get_collection(
    name="industrial_manuals"
)

print("Connected Successfully!")


question = "How does a PLC CPU execute a program?"

print("\nUser Question:")
print(question)


print("\nCreating question embedding...")

question_embedding = model.encode(question)

print("Question embedding created!")


print("\nSearching database...")

results = collection.query(
    query_embeddings=[question_embedding.tolist()],
    n_results=3
)

print("Search completed!")


print("\n==============================")
print("TOP 3 SEARCH RESULTS")
print("==============================\n")

documents = results["documents"][0]

for i, doc in enumerate(documents):
    print(f"Result {i+1}")
    print("-" * 60)
    print(doc)
    print()