from anthropic import Anthropic
from app.config import ANTHROPIC_API_KEY

_client = Anthropic(api_key=ANTHROPIC_API_KEY)

SYSTEM_PROMPT = """You are an Industrial AI Assistant for engineers and technicians.
Answer the user's question using ONLY the provided context chunks from technical
manuals, procedures, and equipment documentation.

Rules:
- If the context does not contain enough information to answer, say so clearly —
  do not make up equipment specs, procedures, or safety information.
- Cite which source document each piece of information comes from.
- Be concise and technically precise. Use step-by-step formatting for procedures.
"""


def build_context_block(chunks: list[dict]) -> str:
    blocks = []
    for i, c in enumerate(chunks, start=1):
        blocks.append(f"[Source {i}: {c['source']}]\n{c['text']}")
    return "\n\n".join(blocks)


def generate_answer(question: str, chunks: list[dict]) -> str:
    if not chunks:
        return ("I couldn't find any relevant information in the uploaded documents "
                "to answer this question. Please upload the relevant manual or procedure.")

    context_block = build_context_block(chunks)

    user_message = f"""Context from technical documents:

{context_block}

Question: {question}

Answer the question using only the context above."""

    response = _client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1000,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": user_message}],
    )

    return "".join(
        block.text for block in response.content if block.type == "text"
    )
