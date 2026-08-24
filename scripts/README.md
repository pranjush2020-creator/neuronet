# Industrial AI - RAG Module

This project implements a Retrieval-Augmented Generation (RAG) pipeline for Industrial AI applications.

## Features

- Extract text from PDF documents
- Read and process multiple PDF pages
- Split extracted text into chunks
- Generate text embeddings
- Store embeddings in ChromaDB
- Search for relevant information using user queries

## Project Structure

```text
Industrial AI/
│
├── data/              # PDF documents
├── src/
│   ├── extract_pdf.py
│   ├── read_all_pages.py
│   ├── chunk_text.py
│   ├── embeddings.py
│   ├── store_chroma.py
│   └── search_db.py
│
├── requirements.txt
├── .gitignore
└── README.md