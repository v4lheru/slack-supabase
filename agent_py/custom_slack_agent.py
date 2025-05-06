import os
from dotenv import load_dotenv
load_dotenv()  # Load environment variables first

from agents import Agent
from agents.mcp import MCPServerSse

# Define your MCP server(s)
railway_server_url = "https://eu1.make.com/mcp/api/v1/u/2a183f33-4498-4ebe-b558-49e956ee0c29/sse"
primary_railway_server_url = "https://primary-nj0x-production.up.railway.app/mcp/1b39de32-b22f-4323-ad9e-e332c41930ce/sse"

# Original Make.com MCP server
railway_mcp_server = MCPServerSse(
    name="railway",
    params={"url": railway_server_url},
    client_session_timeout_seconds=60.0,  # Increased timeout to 60 seconds
    cache_tools_list=True
)

# Your primary Railway-hosted MCP server
primary_railway_mcp_server = MCPServerSse(
    name="primary_railway",
    params={"url": primary_railway_server_url},
    client_session_timeout_seconds=60.0,  # Increased timeout to 60 seconds
    cache_tools_list=True
)

with open(os.path.join(os.path.dirname(__file__), "system_prompt.md"), "r", encoding="utf-8") as f:
    system_prompt = f.read()

_agent = Agent(
    name="SlackAssistant",
    model=os.getenv("AGENT_MODEL", "gpt-4o"),
    instructions=system_prompt,
    mcp_servers=[primary_railway_mcp_server],  # Example: using only primary_railway
    # mcp_servers=[railway_mcp_server, primary_railway_mcp_server],  # If using both
)

# For easier access in server.py, you can create a list of active servers
ACTIVE_MCP_SERVERS = _agent.mcp_servers if _agent.mcp_servers else []
