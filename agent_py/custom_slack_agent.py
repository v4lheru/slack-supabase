import os
from agents import Agent
from agents.mcp import MCPServerSse
from dotenv import load_dotenv

load_dotenv()

railway_server_url = "https://eu1.make.com/mcp/api/v1/u/2a183f33-4498-4ebe-b558-49e956ee0c29/sse"
railway_mcp_server = MCPServerSse(name="railway", params={"url": railway_server_url})

_agent = Agent(
    name="SlackAssistant",
    model=os.getenv("AGENT_MODEL", "gpt-4o-mini"),
    instructions="""You are an AI assistant for a Slack workspace.
Be concise, use Slack-style markdown, and solve the user's request.
""",
    mcp_servers=[railway_mcp_server],
)
