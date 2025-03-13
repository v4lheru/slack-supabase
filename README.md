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

ISC

## Acknowledgments

- [OpenRouter](https://openrouter.ai/) for providing access to multiple AI models
- [Slack Bolt Framework](https://slack.dev/bolt-js/concepts) for simplifying Slack app development
