# Synaptic Bridge - Multi-Provider AI Slack Bot

## Project Overview

Synaptic Bridge is an intelligent Slack bot that connects your team's conversations with powerful AI capabilities. It serves as a bridge between your Slack workspace and various AI models, allowing seamless access to AI assistance without leaving your communication platform.

The bot leverages OpenRouter as a gateway to multiple AI service providers (including OpenAI, Anthropic, and others) and can make function calls to an MCP (Mission Control Platform) server to perform custom actions based on user requests.

## Why Synaptic Bridge?

Traditional AI assistants often require users to switch contexts, leaving their workflow to access AI capabilities. Synaptic Bridge brings AI directly into your team's communication flow, enabling:

- **Instant AI assistance** within Slack threads and channels
- **Consistent AI access** across the organization with shared context
- **Custom actions** through function calling to integrate with your tools
- **Flexible model selection** to optimize for cost, speed, or capabilities

## Use Cases

- **Knowledge Base Queries**: Ask questions about company documentation, policies, or technical information
- **Content Generation**: Create drafts, summaries, or creative content directly in Slack
- **Data Analysis**: Request analysis of data shared in conversations
- **Custom Workflows**: Trigger specific actions in your systems through function calling
- **Meeting Summaries**: Generate concise summaries of meeting transcripts shared in Slack
- **Code Assistance**: Get help with coding problems or generate code snippets

## Features

- Integration with Slack's API using Bolt framework
- Support for multiple AI providers through OpenRouter
- Function calling capabilities with MCP server
- Conversation context management for coherent multi-turn interactions
- Rich message formatting with Block Kit
- Comprehensive error handling and logging
- Configurable model selection based on task requirements

## Technical Architecture

Synaptic Bridge is built with a modular architecture that separates concerns and allows for easy extension:

1. **Slack Integration Layer**: Handles all communication with the Slack API
2. **AI Provider Layer**: Manages connections to AI services through OpenRouter
3. **Context Management**: Maintains conversation history for coherent interactions
4. **Function Calling System**: Enables the AI to trigger specific actions in your systems
5. **Configuration Layer**: Provides flexible configuration options

## Prerequisites

- Node.js 16+ installed
- npm 7+ installed
- Slack workspace with admin access
- OpenRouter API key ([Get one here](https://openrouter.ai/))
- MCP server access (optional, for custom function calling)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/v4lheru/Synaptic-Slack-Bot.git
   cd Synaptic-Slack-Bot
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with the required environment variables:
   ```
   # Slack Credentials
   SLACK_BOT_TOKEN=xoxb-your-token
   SLACK_SIGNING_SECRET=your-signing-secret
   SLACK_APP_TOKEN=xapp-your-app-token

   # OpenRouter API Key
   OPENROUTER_API_KEY=your-openrouter-key

   # MCP Configuration
   MCP_SERVER_URL=your-mcp-server-url
   MCP_AUTH_TOKEN=your-mcp-auth-token

   # App Configuration
   NODE_ENV=development
   LOG_LEVEL=debug
   ```

## Running the Bot

### Development Mode

```bash
npm run dev
```

This will start the bot in development mode with hot reloading.

### Production Mode

```bash
npm run build
npm start
```

This will build the TypeScript code and start the bot in production mode.

## Deployment on Railway

This project requires two separate deployments on Railway:

1. **Node.js Slack Bot** (root directory)
2. **Python Agent** (agent_py directory)

For detailed deployment instructions, see [RAILWAY_DEPLOYMENT.md](RAILWAY_DEPLOYMENT.md).

### Quick Deployment Steps

1. **Deploy the Python Agent**:
   - Create a new project in Railway
   - Set root directory to `agent_py`
   - Set start command to `uvicorn server:app --host 0.0.0.0 --port 8001`
   - Configure environment variables
   - Generate a public domain

2. **Deploy the Node.js Slack Bot**:
   - Create another new project in Railway
   - Use the root directory
   - Set `PY_AGENT_URL` to the Python Agent's public URL
   - Configure other environment variables
   - Generate a public domain

3. **Configure Slack App**:
   - Set the Request URL to your Node.js Slack Bot URL + `/slack/events`

## Project Structure

```
src/
├── index.ts                # Main entry point
├── ai/                     # AI provider implementations
│   ├── interfaces/         # Common interfaces
│   ├── openrouter/         # OpenRouter implementation
│   └── context/            # Conversation context management
├── slack/                  # Slack integration
│   ├── app.ts              # Slack app configuration
│   ├── events/             # Event handlers
│   ├── middleware/         # Middleware functions
│   └── utils/              # Slack utilities
├── mcp/                    # MCP integration
│   ├── client.ts           # MCP client
│   ├── auth.ts             # Authentication
│   └── function-calling.ts # Function calling
├── config/                 # Configuration
│   ├── environment.ts      # Environment variables
│   └── constants.ts        # Application constants
└── utils/                  # Shared utilities
    ├── logger.ts           # Logging
    └── error-handler.ts    # Error handling
```

## Interacting with the Bot

Once deployed, you can interact with Synaptic Bridge in several ways:

1. **Direct Messages**: Send a DM to the bot for private conversations
2. **Mentions**: Mention the bot in a channel using `@Synaptic Bridge`
3. **Threads**: The bot can participate in conversation threads

Example interactions:

- `@Synaptic Bridge What's the status of our server deployment?`
- `@Synaptic Bridge Can you summarize this document for me? [document link]`
- `@Synaptic Bridge Generate a weekly report based on this data: [data]`

## Extending Functionality

Synaptic Bridge is designed to be extensible. You can:

1. **Add Custom Functions**: Extend the function calling system to add new capabilities
2. **Integrate New AI Providers**: Add support for additional AI providers
3. **Customize Response Formatting**: Modify how responses are presented in Slack

See the `Instructions for LLM.md` file for detailed guidance on working with the AI integration.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Testing

```bash
npm test
```

## License

MIT

## Acknowledgments

- [OpenRouter](https://openrouter.ai/) for providing access to multiple AI models
- [Slack Bolt Framework](https://slack.dev/bolt-js/concepts) for simplifying Slack app development
# Multi-Provider AI Slack Bot with MCP and Python Agent Integration

## Overview

This project is a Slack bot that leverages OpenAI's capabilities, the Model-Context-Protocol (MCP) tool interface, and a Python-based agent service to provide advanced AI-powered interactions in Slack. The architecture is designed to be modular and extensible, allowing for integration with both OpenAI and custom MCP tools via a Python microservice.

## What We're Trying to Do

- **Enable advanced AI in Slack:** Users can interact with an AI assistant in Slack, which can answer questions, perform actions, and call external tools.
- **Integrate MCP tools:** The bot can call tools exposed via the MCP protocol, allowing for dynamic function calling and automation.
- **Use a Python Agent Service:** Instead of handling all AI logic in Node.js, a Python FastAPI service runs an OpenAI Agent (with MCP tool support) and exposes a simple HTTP API for the Node.js Slack bot to call.
- **Separation of concerns:** Node.js handles Slack events and messaging, while Python handles AI reasoning and tool invocation.

## Architecture

```
Slack  <--->  Node.js (Bolt)  <--HTTP-->  Python Agent (FastAPI, OpenAI Agents SDK)  <--->  MCP Tools
```

- **Node.js:** Listens for Slack events, manages context, and relays user messages to the Python agent.
- **Python (FastAPI):** Runs an OpenAI Agent with MCP tool integration, processes messages, and returns AI responses.
- **MCP Tools:** Exposed via the MCP protocol, allowing the agent to perform actions like fetching sales data, creating tickets, etc.

## Key Components

- `src/ai/agent-api/client.ts`: Node.js client for communicating with the Python agent service.
- `agent_py/server.py`: FastAPI server exposing the `/generate` endpoint for AI responses.
- `agent_py/custom_slack_agent.py`: Defines the OpenAI Agent with MCP tool integration.
- `src/slack/events/index.ts`: Handles Slack events and routes messages to the AI provider.
- `src/config/environment.ts`: Loads and validates environment variables.
- `mcp.config.json`: Configuration for MCP servers, including the Supabase MCP server.

## Setup

### 1. Python Agent Service

1. Go to the `agent_py/` directory.
2. Copy `.env.example` to `.env` and fill in your OpenAI, Slack, and Supabase credentials.
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the FastAPI server:
   ```bash
   uvicorn server:app --host 0.0.0.0 --port 8001
   ```

### 2. Supabase MCP Server Setup

1. Create a Supabase personal access token (PAT) in your Supabase dashboard.
2. Add the following environment variables to your `.env` file:
   ```
   SUPABASE_URL=https://your-project-ref.supabase.co
   SUPABASE_KEY=your-supabase-service-role-key
   SUPABASE_ACCESS_TOKEN=your-personal-access-token
   ```
3. For more details on the Supabase MCP server integration, see [SUPABASE_MCP.md](SUPABASE_MCP.md).

### 2. Node.js Slack Bot

1. Set `PY_AGENT_URL` in your `.env` to the Python agent's URL (e.g., `http://localhost:8001`).
2. Install Node.js dependencies:
   ```bash
   npm install
   ```
3. Build and start the bot:
   ```bash
   npm run build
   npm start
   ```

## How It Works

- When a user sends a message in Slack, the Node.js bot receives it and sends the message (plus conversation history) to the Python agent.
- The Python agent uses OpenAI's Agents SDK and the MCP tools to process the message, call any necessary tools, and generate a response.
- The agent can use various MCP servers, including the Supabase MCP server, to access external data and perform actions.
- The response is sent back to Node.js, which posts it in the Slack thread.

## Why This Approach?

- **Flexibility:** Easily add or update tools in the MCP server without changing the Node.js code.
- **Separation:** Keep Slack/event logic in Node.js and AI/tool logic in Python.
- **Future-proof:** Ready for new OpenAI Agent SDK features and tool integrations.
- **Database Integration:** Direct access to your Supabase database through the Supabase MCP server.

## Requirements

- Node.js 18+
- Python 3.10+
- Slack App credentials
- OpenAI API key
- Supabase account and personal access token
- MCP server (for tool integration)

## License

MIT
