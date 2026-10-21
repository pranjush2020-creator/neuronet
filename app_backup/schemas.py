from pydantic import BaseModel
from typing import List, Optional


class UploadResponse(BaseModel):
    filename: str
    chunks_added: int
    status: str


class SourceChunk(BaseModel):
    text: str
    source: str
    chunk_id: str
    score: Optional[float] = None


class QueryRequest(BaseModel):
    question: str
    top_k: Optional[int] = None


class QueryResponse(BaseModel):
    question: str
    answer: str
    sources: List[SourceChunk]


class DocumentInfo(BaseModel):
    filename: str
    chunk_count: int
