from pypdf import PdfReader

reader = PdfReader("data/pdfs/Plc.pdf")

all_text = ""

for page in reader.pages:
    text = page.extract_text()

    if text:
        all_text += text + "\n"

print(len(all_text))

chunk_size = 1000

chunks = []

for i in range(0, len(all_text), chunk_size):
    chunk = all_text[i:i + chunk_size]
    chunks.append(chunk)

print("Total Chunks:", len(chunks))

print("\nFirst Chunk:\n")

print(chunks[0])