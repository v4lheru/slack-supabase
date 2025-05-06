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

from openai.types.responses import ResponseTextDeltaEvent

app = FastAPI(title="Slack-Agent API")

class ChatRequest(BaseModel):
    prompt: str | list
    history: list

class ChatResponse(BaseModel):
    content: str
    metadata: dict = {}

# --- Streaming generator for agent events ---
# (No longer manages connect/cleanup, only yields agent events)
async def stream_agent_events(agent, messages):
    try:
        # Runner.run_streamed returns a RunResultStreaming object.
        # Iterate over its async event stream.
        run_result = Runner.run_streamed(agent, messages)   # returns RunResultStreaming
        print("Agent stream started")
        async for event in run_result.stream_events():
            #  Map raw LLM deltas to the format expected by the Node client 
            if (
                event.type == "raw_response_event"
                and isinstance(event.data, ResponseTextDeltaEvent)
            ):
                yield f"{json.dumps({'type': 'llm_chunk', 'data': event.data.delta})}\n"
                await asyncio.sleep(0.01)
                continue  # skip to next streamed event

            # Ignore all other raw-response noise that isnt JSON-serialisable
            if event.type == "raw_response_event":
                continue

            # Ignore SDK-level agent update pings (the UI doesnt use them)
            if event.type == "agent_updated_stream_event":
                continue

            #  Existing fallback: convert any remaining event as before 
            output_event = None
            event_type = 'unknown'
            try:
                event_type = getattr(event, 'type', 'unknown')
                event_data = getattr(event, 'data', None)
                try:
                    json.dumps(event_data)
                except TypeError:
                    print(f"Warning: Event data for type '{event_type}' is not directly JSON serializable. Converting to string.")
                    event_data = str(event_data)
                output_event = {"type": event_type, "data": event_data}
                print(f"Streaming event: {event_type}")
            except Exception as processing_error:
                print(f"Error processing event structure: {processing_error}")
                output_event = {"type": "processing_error", "data": f"Failed to process event: {str(processing_error)}"}
            if output_event:
                try:
                    yield f"{json.dumps(output_event)}\n"
                    await asyncio.sleep(0.01)
                except TypeError as json_error:
                    print(f"Error serializing processed event to JSON: {json_error}")
                    yield f"{json.dumps({'type': 'error', 'data': f'JSON serialization error for event type {event_type}'})}\n"
                    await asyncio.sleep(0.01)
    except Exception as e:
        print(f"Error during agent streaming execution: {e}")
        yield f"{json.dumps({'type': 'error', 'data': f'Agent execution failed: {str(e)}'})}\n"
        await asyncio.sleep(0.01)
    finally:
        print("Agent stream generator finished.")

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

    async def managed_stream_wrapper():
        server_connected = False
        try:
            if server_instance_to_manage:
                await server_instance_to_manage.connect()
                server_connected = True
                print("MCP Server Connected (wrapper)")
            async for event_json_line in stream_agent_events(_agent, cleaned_messages):
                yield event_json_line
        except Exception as wrap_err:
            print(f"Error in managed stream wrapper: {wrap_err}")
            try:
                yield f"{json.dumps({'type': 'error', 'data': f'Stream wrapper error: {str(wrap_err)}'})}\n"
            except Exception:
                pass
        finally:
            if server_connected and server_instance_to_manage:
                await server_instance_to_manage.cleanup()
                print("MCP Server Cleaned Up (wrapper)")

    return StreamingResponse(
        managed_stream_wrapper(),
        media_type="application/x-json-stream"
    )
