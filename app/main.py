from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from app.vector_store import query_similar
from backend.ollama_service import generate_answer


app = FastAPI(
    title="PLANT-GPT RAG",
    description="Industrial AI Assistant using RAG and Ollama",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:8080",
        "http://localhost:8080",
        "http://51.0.0.31:8080",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class QuestionRequest(BaseModel):
    question: str
    language: str = "en-IN"
    session_id: str = ""
    history: list[dict] = Field(default_factory=list)


class AnswerResponse(BaseModel):
    answer: str
    sources: list = Field(default_factory=list)


@app.get("/")
def root():
    return {
        "message": "PLANT-GPT RAG server is running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


@app.post("/ask", response_model=AnswerResponse)
def ask_question(request: QuestionRequest):

    chunks = query_similar(request.question)

    answer = generate_answer(
        request.question,
        request.language,
        chunks,
        request.history
    )

    sources = [
        {
            "source": chunk["source"],
            "score": chunk["score"]
        }
        for chunk in chunks
    ]

    return {
        "answer": answer,
        "sources": sources
    }