import os
from agents import Agent
from agents_mcp import McpTool
from dotenv import load_dotenv

load_dotenv()

_agent = Agent(
    name="SlackAssistant",
    model=os.getenv("AGENT_MODEL", "gpt-4o-mini"),
    instructions="""You are an AI assistant for a Slack workspace.
Be concise, use Slack-style markdown, and solve the user's request.
""",
    tools=[McpTool(
        server_url=os.environ["MCP_SERVER_URL"],
        auth_token=os.getenv("MCP_AUTH_TOKEN", "")
    )],
)
