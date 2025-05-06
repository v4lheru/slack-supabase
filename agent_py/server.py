from fastapi import FastAPI
from pydantic import BaseModel
from agents import Runner
from mcp_agent import _agent

app = FastAPI(title="Slack-Agent API")

class ChatRequest(BaseModel):
    prompt: str | list
    history: list

class ChatResponse(BaseModel):
    content: str
    metadata: dict = {}

@app.post("/generate", response_model=ChatResponse)
async def generate(req: ChatRequest):
    messages = req.history + [{"role": "user", "content": req.prompt}]
    run = await Runner.run(_agent, messages)
    out = await run.final_output()
    return ChatResponse(content=out.content, metadata={"model": _agent.model})
