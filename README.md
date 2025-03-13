# Multi-Provider AI Slack Bot

A Slack bot that leverages multiple AI service providers (primarily OpenRouter) and makes function calls to an MCP (Mission Control Platform) server. The bot serves as an AI assistant within Slack workspaces, allowing users to interact with various AI models and trigger specific actions on the MCP server.

## Features

- Integration with Slack's API using Bolt framework
- Support for multiple AI providers through OpenRouter
- Function calling capabilities with MCP server
- Conversation context management
- Rich message formatting with Block Kit
- Comprehensive error handling and logging

## Prerequisites

- Node.js 16+ installed
- npm 7+ installed
- Slack workspace with admin access
- OpenRouter API key
- MCP server access (optional)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/multi-provider-ai-slack-bot.git
   cd multi-provider-ai-slack-bot
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

This project includes configuration files for deploying on Railway:

1. `railway.json` - Configuration for Railway deployment
2. `Procfile` - Process file for Railway

To deploy on Railway:

1. Push your code to a GitHub repository
2. Create a new project on Railway from the GitHub repository
3. Set up the environment variables in the Railway dashboard
4. Deploy the project

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

## Testing

```bash
npm test
```

## License

ISC
