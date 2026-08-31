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
    "llama3.1:8b"
)

client = ollama.Client(
    host=OLLAMA_HOST
)


def generate_answer(question: str, language: str = "en-IN") -> str:

    system_prompt = """
You are PLANT-GPT, an Industrial AI Assistant.

You assist engineers and technicians with:
- industrial equipment
- maintenance
- SOPs
- troubleshooting
- equipment faults
- plant operations

Give clear, professional and useful answers.

Do not invent technical information.
If the required information is not available, say so clearly.
"""

    response = client.chat(
        model=OLLAMA_MODEL,
        messages=[
            {
                "role": "system",
                "content": system_prompt
            },
            {
                "role": "user",
                "content": question
            }
        ]
    )

    return response["message"]["content"]
