from fastapi import FastAPI
from pydantic import BaseModel
# The Agents SDK usually installs an *agents* top-level package.
# If it isnt importable (e.g. the wheel exposes `openai_agents`
# instead), fall back gracefully:
try:
    from agents import Runner          # normal path (openai-agents  0.0.7)
except ModuleNotFoundError:
    from openai_agents import Runner   # fallback for some installs
from custom_slack_agent import _agent
from agents_mcp import RunnerContext

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
    mcp_context = RunnerContext(mcp_config_path="mcp_agent.config.yaml")
    run = await Runner.run(_agent, messages, context=mcp_context)
    out = await run.final_output()
    return ChatResponse(content=out.content, metadata={"model": _agent.model})
