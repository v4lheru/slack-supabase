import os
from agents_mcp import Agent
from dotenv import load_dotenv

load_dotenv()

_agent = Agent(
    name="SlackAssistant",
    model=os.getenv("AGENT_MODEL", "gpt-4o-mini"),
    instructions="""You are an AI assistant for a Slack workspace.
Be concise, use Slack-style markdown, and solve the user's request.
""",
    mcp_servers=["railway"],
)
