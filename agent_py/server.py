from fastapi import FastAPI
from pydantic import BaseModel
# The Agents SDK usually installs an *agents* top-level package.
# If it isnt importable (e.g. the wheel exposes `openai_agents`
# instead), fall back gracefully:
try:
    from agents import Runner          # normal path (openai-agents  0.0.7)
except ModuleNotFoundError:
    from openai_agents import Runner   # fallback for some installs
from custom_slack_agent import _agent, railway_mcp_server

app = FastAPI(title="Slack-Agent API")

class ChatRequest(BaseModel):
    prompt: str | list
    history: list

class ChatResponse(BaseModel):
    content: str
    metadata: dict = {}

@app.post("/generate", response_model=ChatResponse)
async def generate(req: ChatRequest):
    # Clean messages to remove any keys not accepted by OpenAI API
    cleaned_messages = []
    for hist_msg in req.history:
        if isinstance(hist_msg, dict) and "role" in hist_msg and "content" in hist_msg:
            cleaned_msg = {"role": hist_msg["role"], "content": hist_msg["content"]}
            # Only add fields allowed for each role
            if hist_msg["role"] == "tool":
                if "tool_call_id" in hist_msg:
                    cleaned_msg["tool_call_id"] = hist_msg["tool_call_id"]
                if "name" in hist_msg:
                    cleaned_msg["name"] = hist_msg["name"]
            elif hist_msg["role"] == "assistant":
                if "tool_calls" in hist_msg:
                    cleaned_msg["tool_calls"] = hist_msg["tool_calls"]
            cleaned_messages.append(cleaned_msg)
    cleaned_messages.append({"role": "user", "content": req.prompt})

    # Explicitly manage the lifecycle of the railway_mcp_server
    if _agent.mcp_servers and railway_mcp_server in _agent.mcp_servers:
        await railway_mcp_server.connect()
        try:
            run = await Runner.run(_agent, cleaned_messages)
            out = await run.final_output()
        finally:
            await railway_mcp_server.cleanup()
        return ChatResponse(content=out.content, metadata={"model": _agent.model})
    else:
        run = await Runner.run(_agent, cleaned_messages)
        out = await run.final_output()
        return ChatResponse(content=out.content, metadata={"model": _agent.model})
