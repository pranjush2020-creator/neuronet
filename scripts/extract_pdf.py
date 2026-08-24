from pypdf import PdfReader

reader = PdfReader("data/pdfs/Plc.pdf")

print("PDF Loaded Successfully")

print("Number of Pages:", len(reader.pages))

page = reader.pages[0]

text = page.extract_text()

print(text)