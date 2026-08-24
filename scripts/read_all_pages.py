from pypdf import PdfReader

reader = PdfReader("data/pdfs/Plc.pdf")

print("PDF Loaded Successfully")

all_text = ""

for page in reader.pages:
    text = page.extract_text()

    if text:
        all_text += text + "\n"

print("Total Pages:", len(reader.pages))
print("Total Characters:", len(all_text))