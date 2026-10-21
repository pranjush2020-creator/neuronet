import os

import ollama
from dotenv import load_dotenv

load_dotenv()

OLLAMA_HOST = os.getenv(
    "OLLAMA_HOST",
    "http://localhost:11434"
)

OLLAMA_MODEL = os.getenv(
    "OLLAMA_MODEL",
    "qwen2.5:0.5b"
)

client = ollama.Client(host=OLLAMA_HOST)


SYSTEM_PROMPT = """
You are PLANT-GPT, an Industrial AI Assistant for engineers and technicians.

Answer the user's question using ONLY the provided context from technical
manuals, procedures, and equipment documentation.

Rules:
- Do not invent technical information.
- If the context does not contain enough information, clearly say so.
- Cite the source document when using information from the context.
- Be concise and technically precise.
- Use step-by-step formatting for procedures.
- You may use previous conversation messages to understand follow-up questions,
  but factual answers must still be based on the provided technical context.
"""


def generate_answer(
    question: str,
    language: str = "en-IN",
    chunks: list[dict] = None,
    history: list[dict] = None
) -> str:

    chunks = chunks or []
    history = history or []

    if not chunks:
        return (
            "I couldn't find relevant information in the uploaded "
            "technical documents to answer this question."
        )

    context_blocks = []

    for i, chunk in enumerate(chunks, start=1):
        context_blocks.append(
            f"[Source {i}: {chunk.get('source', 'unknown')}]\n"
            f"{chunk.get('text', '')}"
        )

    context = "\n\n".join(context_blocks)

    messages = [
        {
            "role": "system",
            "content": SYSTEM_PROMPT
        }
    ]

    # Previous questions/answers from the same chat
    for item in history:
        if item.get("role") in ("user", "assistant") and item.get("content"):
            messages.append({
                "role": item["role"],
                "content": item["content"]
            })

    user_message = f"""
Context from technical documents:

{context}

Current Question:
{question}

Answer the current question using ONLY the technical context above.
Use previous conversation only to understand what the user is referring to.
"""

    messages.append({
        "role": "user",
        "content": user_message
    })

    response = client.chat(
        model=OLLAMA_MODEL,
        messages=messages
    )

    return response["message"]["content"]