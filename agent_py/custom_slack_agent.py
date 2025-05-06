import os
from agents import Agent
from agents.mcp import MCPServerSse
from dotenv import load_dotenv

load_dotenv()

railway_server_url = "https://eu1.make.com/mcp/api/v1/u/2a183f33-4498-4ebe-b558-49e956ee0c29/sse"
railway_mcp_server = MCPServerSse(
    name="railway",
    params={"url": railway_server_url},
    client_session_timeout_seconds=30.0  # Increase timeout to 30 seconds
)

with open(os.path.join(os.path.dirname(__file__), "system_prompt.md"), "r", encoding="utf-8") as f:
    system_prompt = f.read()

_agent = Agent(
    name="SlackAssistant",
    model=os.getenv("AGENT_MODEL", "gpt-4o-mini"),
    instructions=system_prompt,
    # mcp_servers=[railway_mcp_server], # <-- Temporarily commented out for MCP isolation test
)
