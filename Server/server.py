from fastapi import FastAPI
from pydantic import BaseModel
from pipeline import research_pipeline
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# ✅ Enable CORS (VERY IMPORTANT)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TopicRequest(BaseModel):
    topic: str

@app.post("/research")
def run_research(req: TopicRequest):
    result = research_pipeline(req.topic)
    return result