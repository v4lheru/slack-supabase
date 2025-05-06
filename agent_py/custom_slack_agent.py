import os
from agents_mcp import Agent
from agents.mcp import MCPServerSse
from dotenv import load_dotenv

load_dotenv()

railway_server_url = "https://primary-nj0x-production.up.railway.app/mcp/5ecc97d5-7413-4f29-97c1-c7f0aae41a59/sse"
railway_mcp_server = MCPServerSse(name="railway", params={"url": railway_server_url})

_agent = Agent(
    name="SlackAssistant",
    model=os.getenv("AGENT_MODEL", "gpt-4o-mini"),
    instructions="""You are an AI assistant for a Slack workspace.
Be concise, use Slack-style markdown, and solve the user's request.
""",
    mcp_servers=[railway_mcp_server],
)
