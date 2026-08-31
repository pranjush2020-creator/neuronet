from fastapi import FastAPI
from pydantic import BaseModel

from ollama_service import generate_answer


app = FastAPI(
    title="PLANT-GPT",
    description="Industrial AI Assistant using Ollama",
    version="1.0.0"
)


class QuestionRequest(BaseModel):
    question: str
    language: str = "en-IN"


class AnswerResponse(BaseModel):
    answer: str


@app.get("/")
def root():
    return {
        "message": "PLANT-GPT backend is running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


@app.post("/ask", response_model=AnswerResponse)
def ask_question(request: QuestionRequest):

    answer = generate_answer(
        request.question,
        request.language
    )

    return {
        "answer": answer
    }