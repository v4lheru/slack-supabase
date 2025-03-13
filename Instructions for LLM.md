# Instructions for LLM Integration in Synaptic Slack Bot

This document provides guidance on working with the AI integration in the Synaptic Slack Bot, particularly focusing on the OpenRouter client and function/tool calling capabilities.

## OpenRouter Integration

The bot uses OpenRouter as an AI provider gateway, which allows access to various AI models from different providers (OpenAI, Anthropic, etc.) through a unified API.

### Key Components

1. **OpenRouter Client** (`src/ai/openrouter/client.ts`): Handles communication with the OpenRouter API
2. **Function Calling** (`src/mcp/function-calling.ts`): Defines functions that can be called by the AI
3. **Context Management** (`src/ai/context/manager.ts`): Manages conversation context for AI interactions

## Tool Calling Implementation

OpenRouter supports tool calling (previously known as function calling) which allows the AI to trigger specific functions in your application. Here are important details about the implementation:

### Tool Calling Requirements

1. The OpenRouter API requires specific configuration to use tool calling:
   - You must use a model that supports tool calls (e.g., `openai/gpt-4o`)
   - You must configure provider routing to ensure you use a provider that supports tool calls
   - You must use the `tools` parameter instead of the deprecated `functions` parameter

### Implementation Details

The OpenRouter client is configured to:

1. Use the `tools` parameter to define available functions
2. Override the model to `openai/gpt-4o` when tool calling is needed
3. Configure provider routing with:
   ```javascript
   provider: {
     require_parameters: true,
     sort: 'throughput'
   }
   ```

### Response Handling

When the AI calls a tool, the response will include a `tool_calls` array in the message. The client parses this into a `functionCalls` array that can be processed by the application.

## Troubleshooting

Common issues and their solutions:

### "No endpoints found that support tool use"

This error occurs when:
1. The model you're using doesn't support tool calls
2. The provider routing isn't configured correctly

Solution: Ensure you're using a model that supports tool calls (like GPT-4o) and that provider routing is configured to require support for all parameters.

### "Cannot read properties of undefined (reading '0')"

This error typically occurs when the response structure from OpenRouter doesn't match what's expected.

Solution: Add robust error handling to check for the existence of properties before accessing them.

## Making Changes

When modifying the OpenRouter client:

1. Update the interfaces if you're adding new parameters or response fields
2. Add appropriate error handling for all API calls
3. Test with simple function calls before implementing complex functionality
4. Check the OpenRouter documentation for any API changes: https://openrouter.ai/docs

## OpenRouter API Key

The bot uses an OpenRouter API key stored in the `.env` file. Make sure this key has sufficient credits and permissions for the models you want to use.

## Deployment Considerations

When deploying:

1. Ensure your OpenRouter API key is properly set in the environment
2. Consider the cost implications of using different models
3. Implement rate limiting to prevent excessive API usage
4. Monitor API responses for errors and implement appropriate fallbacks

## Future Improvements

Potential enhancements to consider:

1. Implement streaming responses for real-time AI interactions
2. Add support for multimodal inputs (images, etc.)
3. Implement a model fallback strategy for when preferred models are unavailable
4. Add caching for common queries to reduce API costs
