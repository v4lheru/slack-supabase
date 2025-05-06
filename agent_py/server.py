from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.responses import StreamingResponse
import json
import asyncio
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

# --- Streaming generator for agent events ---
async def stream_agent_events(agent, messages, mcp_server_instance=None):
    server_connected = False
    try:
        if mcp_server_instance:
            await mcp_server_instance.connect()
            server_connected = True
            print("MCP Server Connected")
        stream = await Runner.run_streamed(agent, messages)
        print("Agent stream started")
        async for event in stream:
            try:
                event_type = event.type
                event_data = event.data
                output_event = {"type": event_type, "data": event_data}
                print(f"Streaming event: {event_type}")
            except Exception as serialization_error:
                print(f"Error preparing event data: {serialization_error}")
                output_event = {"type": "error", "data": f"Failed to serialize event: {getattr(event, 'type', 'unknown')}"}
            try:
                yield f"{json.dumps(output_event)}\n"
                await asyncio.sleep(0.01)
            except TypeError as json_error:
                print(f"Error serializing event to JSON: {json_error}")
                yield f"{json.dumps({'type': 'error', 'data': f'JSON serialization error for event type {getattr(event, 'type', 'unknown')}'})}\n"
                await asyncio.sleep(0.01)
    except Exception as e:
        print(f"Error during agent streaming: {e}")
        yield f"{json.dumps({'type': 'error', 'data': str(e)})}\n"
        await asyncio.sleep(0.01)
    finally:
        if server_connected and mcp_server_instance:
            await mcp_server_instance.cleanup()
            print("MCP Server Cleaned Up")

# --- Streaming endpoint for /generate ---
@app.post("/generate")
async def generate_stream(req: ChatRequest):
    cleaned_messages = []
    for hist_msg in req.history:
        if isinstance(hist_msg, dict) and "role" in hist_msg and "content" in hist_msg:
            cleaned_msg = {"role": hist_msg["role"], "content": hist_msg["content"]}
            if hist_msg["role"] == "tool":
                if "tool_call_id" in hist_msg:
                    cleaned_msg["tool_call_id"] = hist_msg["tool_call_id"]
                if "name" in hist_msg:
                    cleaned_msg["name"] = hist_msg["name"]
            elif hist_msg["role"] == "assistant" and "tool_calls" in hist_msg:
                cleaned_msg["tool_calls"] = hist_msg["tool_calls"]
            cleaned_messages.append(cleaned_msg)
    cleaned_messages.append({"role": "user", "content": req.prompt})

    server_instance_to_manage = None
    if hasattr(_agent, 'mcp_servers') and _agent.mcp_servers and railway_mcp_server in _agent.mcp_servers:
        server_instance_to_manage = railway_mcp_server

    return StreamingResponse(
        stream_agent_events(_agent, cleaned_messages, server_instance_to_manage),
        media_type="application/x-json-stream"
    )
