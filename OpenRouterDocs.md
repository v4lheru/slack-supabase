---
title: "API Error Handling - Complete Guide to OpenRouter Errors"
description: "API Errors"
clipdate: 2025-03-03
source: "https://openrouter.ai/docs/api-reference/errors"
published:
tags:
  - "apiErrorHandling"
  - "openRouterApi"
  - "errorCodes"
  - "apiIntegration"
  - "requestManagement"
  - "modelRouting"
  - "apiAuthentication"
  - "errorParsing"
---
> [!summary]- Summary
> - OpenRouter returns JSON error responses with `code`, `message`, and optional `metadata`
> - HTTP response status matches the error code for request-level errors
> - Error codes include:
>     * 400: Bad Request
>     * 401: Invalid credentials
>     * 402: Insufficient credits
>     * 403: Input moderation failure
>     * 408: Request timeout
>     * 429: Rate limit exceeded
>     * 502: Model provider down
>     * 503: No available model providers
> - Moderation errors provide reasons, flagged input, and provider details
> - Provider errors include raw error information
> - Occasional no-content generation can occur during model warm-up or scaling

For errors, OpenRouter returns a JSON response with the following shape:

The HTTP Response will have the same status code as `error.code`, forming a request error if:

- Your original request is invalid
- Your API key/account is out of credits

Otherwise, the returned HTTP response status will be `200` and any error occurred while the LLM is producing the output will be emitted in the response body or as an SSE data event.

Example code for printing errors in JavaScript:

## Error Codes

- **400**: Bad Request (invalid or missing params, CORS)
- **401**: Invalid credentials (OAuth session expired, disabled/invalid API key)
- **402**: Your account or API key has insufficient credits. Add more credits and retry the request.
- **403**: Your chosen model requires moderation and your input was flagged
- **408**: Your request timed out
- **429**: You are being rate limited
- **502**: Your chosen model is down or we received an invalid response from it
- **503**: There is no available model provider that meets your routing requirements

## Moderation Errors

If your input was flagged, the `error.metadata` will contain information about the issue. The shape of the metadata is as follows:

## Provider Errors

If the model provider encounters an error, the `error.metadata` will contain information about the issue. The shape of the metadata is as follows:

## When No Content is Generated

Occasionally, the model may not generate any content. This typically occurs when:

- The model is warming up from a cold start
- The system is scaling up to handle more requests

Warm-up times usually range from a few seconds to a few minutes, depending on the model and provider.

If you encounter persistent no-content issues, consider implementing a simple retry mechanism or trying again with a different provider or model that has more recent activity.

Additionally, be aware that in some cases, you may still be charged for the prompt processing cost by the upstream provider, even if no content is generated.

**Example**
```javascript
// Error handling example
async function makeOpenRouterRequest() {
    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${YOUR_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'openai/gpt-3.5-turbo',
                messages: [{ role: 'user', content: 'Hello' }]
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error:', errorData.error.message);
            console.error('Error Code:', errorData.error.code);
            return;
        }

        const data = await response.json();
        console.log(data);
    } catch (error) {
        console.error('Request failed:', error);
    }
}
```


> [!summary]- Summary
> - OpenRouter provides various API parameters to configure AI model generation
> - Parameters include temperature, top_p, top_k, frequency/presence/repetition penalties
> - Key sampling parameters control response diversity and predictability
> - Optional parameters like max_tokens, logit_bias, and response_format provide fine-tuning options
> - Tool calling and max price parameters enable advanced request configuration
> - Default values are provided if parameters are not explicitly set

Sampling parameters shape the token generation process of the model. You may send any parameters from the following list, as well as others, to OpenRouter.

OpenRouter will default to the values listed below if certain parameters are absent from your request (for example, `temperature` to 1.0). We will also transmit some provider-specific parameters, such as `safe_prompt` for Mistral or `raw_mode` for Hyperbolic directly to the respective providers if specified.

Please refer to the model’s provider section to confirm which parameters are supported. For detailed guidance on managing provider-specific parameters, [click here](https://openrouter.ai/docs/features/provider-routing#requiring-providers-to-support-all-parameters-beta).

## Temperature

- Key: `temperature`
- Optional, **float**, 0.0 to 2.0
- Default: 1.0
- Explainer Video: [Watch](https://youtu.be/ezgqHnWvua8)

This setting influences the variety in the model’s responses. Lower values lead to more predictable and typical responses, while higher values encourage more diverse and less common responses. At 0, the model always gives the same response for a given input.

## Top P

- Key: `top_p`
- Optional, **float**, 0.0 to 1.0
- Default: 1.0
- Explainer Video: [Watch](https://youtu.be/wQP-im_HInk)

This setting limits the model’s choices to a percentage of likely tokens: only the top tokens whose probabilities add up to P. A lower value makes the model’s responses more predictable, while the default setting allows for a full range of token choices. Think of it like a dynamic Top-K.

## Top K

- Key: `top_k`
- Optional, **integer**, 0 or above
- Default: 0
- Explainer Video: [Watch](https://youtu.be/EbZv6-N8Xlk)

This limits the model’s choice of tokens at each step, making it choose from a smaller set. A value of 1 means the model will always pick the most likely next token, leading to predictable results. By default this setting is disabled, making the model to consider all choices.

## Frequency Penalty

- Key: `frequency_penalty`
- Optional, **float**, -2.0 to 2.0
- Default: 0.0
- Explainer Video: [Watch](https://youtu.be/p4gl6fqI0_w)

This setting aims to control the repetition of tokens based on how often they appear in the input. It tries to use less frequently those tokens that appear more in the input, proportional to how frequently they occur. Token penalty scales with the number of occurrences. Negative values will encourage token reuse.

## Presence Penalty

- Key: `presence_penalty`
- Optional, **float**, -2.0 to 2.0
- Default: 0.0
- Explainer Video: [Watch](https://youtu.be/MwHG5HL-P74)

Adjusts how often the model repeats specific tokens already used in the input. Higher values make such repetition less likely, while negative values do the opposite. Token penalty does not scale with the number of occurrences. Negative values will encourage token reuse.

## Repetition Penalty

- Key: `repetition_penalty`
- Optional, **float**, 0.0 to 2.0
- Default: 1.0
- Explainer Video: [Watch](https://youtu.be/LHjGAnLm3DM)

Helps to reduce the repetition of tokens from the input. A higher value makes the model less likely to repeat tokens, but too high a value can make the output less coherent (often with run-on sentences that lack small words). Token penalty scales based on original token’s probability.

## Min P

- Key: `min_p`
- Optional, **float**, 0.0 to 1.0
- Default: 0.0

Represents the minimum probability for a token to be considered, relative to the probability of the most likely token. (The value changes depending on the confidence level of the most probable token.) If your Min-P is set to 0.1, that means it will only allow for tokens that are at least 1/10th as probable as the best possible option.

## Top A

- Key: `top_a`
- Optional, **float**, 0.0 to 1.0
- Default: 0.0

Consider only the top tokens with “sufficiently high” probabilities based on the probability of the most likely token. Think of it like a dynamic Top-P. A lower Top-A value focuses the choices based on the highest probability token but with a narrower scope. A higher Top-A value does not necessarily affect the creativity of the output, but rather refines the filtering process based on the maximum probability.

## Seed

- Key: `seed`
- Optional, **integer**

If specified, the inferencing will sample deterministically, such that repeated requests with the same seed and parameters should return the same result. Determinism is not guaranteed for some models.

## Max Tokens

- Key: `max_tokens`
- Optional, **integer**, 1 or above

This sets the upper limit for the number of tokens the model can generate in response. It won’t produce more than this limit. The maximum value is the context length minus the prompt length.

## Logit Bias

- Key: `logit_bias`
- Optional, **map**

Accepts a JSON object that maps tokens (specified by their token ID in the tokenizer) to an associated bias value from -100 to 100. Mathematically, the bias is added to the logits generated by the model prior to sampling. The exact effect will vary per model, but values between -1 and 1 should decrease or increase likelihood of selection; values like -100 or 100 should result in a ban or exclusive selection of the relevant token.

## Logprobs

- Key: `logprobs`
- Optional, **boolean**

Whether to return log probabilities of the output tokens or not. If true, returns the log probabilities of each output token returned.

## Top Logprobs

- Key: `top_logprobs`
- Optional, **integer**

An integer between 0 and 20 specifying the number of most likely tokens to return at each token position, each with an associated log probability. logprobs must be set to true if this parameter is used.

## Response Format

- Key: `response_format`
- Optional, **map**

Forces the model to produce specific output format. Setting to `{ "type": "json_object" }` enables JSON mode, which guarantees the message the model generates is valid JSON.

**Note**: when using JSON mode, you should also instruct the model to produce JSON yourself via a system or user message.

## Structured Outputs

- Key: `structured_outputs`
- Optional, **boolean**

If the model can return structured outputs using response\_format json\_schema.

## Stop

- Key: `stop`
- Optional, **array**

Stop generation immediately if the model encounter any token specified in the stop array.

- Key: `tools`
- Optional, **array**

Tool calling parameter, following OpenAI’s tool calling request shape. For non-OpenAI providers, it will be transformed accordingly. [Click here to learn more about tool calling](https://openrouter.ai/docs/requests#tool-calls)

- Key: `tool_choice`
- Optional, **array**

Controls which (if any) tool is called by the model. ‘none’ means the model will not call any tool and instead generates a message. ‘auto’ means the model can pick between generating a message or calling one or more tools. ‘required’ means the model must call one or more tools. Specifying a particular tool via `{"type": "function", "function": {"name": "my_function"}}` forces the model to call that tool.

## Max Price

- Key: `max_price`
- Optional, **map**

A JSON object specifying the highest provider pricing you will accept. For example, the value `{"completion": "1", "prompt": "2"}` will route to any provider with a price of `<= $1/m` prompt tokens, and `<= $2/m` completion tokens or less. Some providers support per request pricing, in which case you can use the “request” attribute of max\_price. Lastly, “image” is also available, which specifies the max price per image you will accept. Practically, this field is often combined with a provider “sort” to e.g. state “Use the provider with the highest throughput, as long as it doesn’t cost more than `$x/m` tokens.”

**Example**
```python
import openrouter

response = openrouter.chat.completions.create(
    model='anthropic/claude-2',
    messages=[{'role': 'user', 'content': 'Write a poem'}],
    temperature=0.7,  # More creative responses
    max_tokens=150,   # Limit response length
    top_p=0.9,        # Balanced token selection
    stop=['

']     # Stop generation at double newline
)
print(response.choices[0].message.content)
```


> [!summary]- Summary
> - Chat Completion API for sending requests to selected AI models
> - Requires a model ID and list of messages
> - Supports optional streaming
> - Requires authentication with Bearer token
> - Returns generation with assistant's response
> - Flexible for different model interactions

- Overview

- [Quickstart](https://openrouter.ai/docs/quickstart)
- [Principles](https://openrouter.ai/docs/overview/principles)
- [Models](https://openrouter.ai/docs/overview/models)
- Features

- [Model Routing](https://openrouter.ai/docs/features/model-routing)
- [Provider Routing](https://openrouter.ai/docs/features/provider-routing)
- [Prompt Caching](https://openrouter.ai/docs/features/prompt-caching)
- [Structured Outputs](https://openrouter.ai/docs/features/structured-outputs)
- [Message Transforms](https://openrouter.ai/docs/features/message-transforms)
- [Uptime Optimization](https://openrouter.ai/docs/features/uptime-optimization)
- [Web Search](https://openrouter.ai/docs/features/web-search)
- [Programmatic API Key Management](https://openrouter.ai/docs/features/programmatic-api-key-management)
- API Reference

- [Overview](https://openrouter.ai/docs/api-reference/overview)
- [Streaming](https://openrouter.ai/docs/api-reference/streaming)
- [Authentication](https://openrouter.ai/docs/api-reference/authentication)
- [Parameters](https://openrouter.ai/docs/api-reference/parameters)
- [Limits](https://openrouter.ai/docs/api-reference/limits)
- [Errors](https://openrouter.ai/docs/api-reference/errors)
- [POSTCompletion](https://openrouter.ai/docs/api-reference/completion)
- [POSTChat completion](https://openrouter.ai/docs/api-reference/chat-completion)
- [GETGet a generation](https://openrouter.ai/docs/api-reference/get-a-generation)
- [GETList available models](https://openrouter.ai/docs/api-reference/list-available-models)
- [GETList endpoints for a model](https://openrouter.ai/docs/api-reference/list-endpoints-for-a-model)
- [GETGet credits](https://openrouter.ai/docs/api-reference/get-credits)
- [POSTCreate a Coinbase charge](https://openrouter.ai/docs/api-reference/create-a-coinbase-charge)
- Use Cases

- [BYOK](https://openrouter.ai/docs/use-cases/byok)
- [Crypto API](https://openrouter.ai/docs/use-cases/crypto-api)
- [OAuth PKCE](https://openrouter.ai/docs/use-cases/oauth-pkce)
- [For Providers](https://openrouter.ai/docs/use-cases/for-providers)
- [Reasoning Tokens](https://openrouter.ai/docs/use-cases/reasoning-tokens)
- Community

- [Frameworks](https://openrouter.ai/docs/community/frameworks)
- [Discord](https://discord.gg/fVyRaUDgxW)

[API](https://openrouter.ai/docs/api-reference/overview)[Models](https://openrouter.ai/models)[Chat](https://openrouter.ai/chat)[Ranking](https://openrouter.ai/rankings)[Login](https://openrouter.ai/credits)

[API Reference](https://openrouter.ai/docs/api-reference/overview)

POST

Send a chat completion request to a selected model

### Request

This endpoint expects an object.

modelstringRequired

The model ID to use

messageslist of objectsRequired

streambooleanOptionalDefaults to `false`

### Response

Successful completion

idstringOptional

choiceslist of objectsOptional

[

Get a generation

Up Next](https://openrouter.ai/docs/api-reference/get-a-generation)

[Built with](https://buildwithfern.com/?utm_campaign=buildWith&utm_medium=docs&utm_source=openrouter.ai)

**Example**
```python
import requests

# OpenRouter Chat Completion Example
url = 'https://openrouter.ai/api/v1/chat/completions'
headers = {
    'Authorization': 'Bearer YOUR_API_TOKEN',
    'Content-Type': 'application/json'
}
payload = {
    'model': 'openai/gpt-3.5-turbo',
    'messages': [
        {
            'role': 'user', 
            'content': 'Explain quantum computing in simple terms'
        }
    ]
}

response = requests.post(url, headers=headers, json=payload)
print(response.json())
```


> [!summary]- Summary
> - Endpoint for sending text-only completion requests to selected AI models
> - Required parameters: `model` (model ID) and `prompt` (text to complete)
> - Optional parameter `stream` (defaults to false)
> - Supports authentication via Bearer token
> - Returns a response with an ID and list of choices
> - Each choice includes text, index, and finish reason

- Overview

- [Quickstart](https://openrouter.ai/docs/quickstart)
- [Principles](https://openrouter.ai/docs/overview/principles)
- [Models](https://openrouter.ai/docs/overview/models)
- Features

- [Model Routing](https://openrouter.ai/docs/features/model-routing)
- [Provider Routing](https://openrouter.ai/docs/features/provider-routing)
- [Prompt Caching](https://openrouter.ai/docs/features/prompt-caching)
- [Structured Outputs](https://openrouter.ai/docs/features/structured-outputs)
- [Message Transforms](https://openrouter.ai/docs/features/message-transforms)
- [Uptime Optimization](https://openrouter.ai/docs/features/uptime-optimization)
- [Web Search](https://openrouter.ai/docs/features/web-search)
- [Programmatic API Key Management](https://openrouter.ai/docs/features/programmatic-api-key-management)
- API Reference

- [Overview](https://openrouter.ai/docs/api-reference/overview)
- [Streaming](https://openrouter.ai/docs/api-reference/streaming)
- [Authentication](https://openrouter.ai/docs/api-reference/authentication)
- [Parameters](https://openrouter.ai/docs/api-reference/parameters)
- [Limits](https://openrouter.ai/docs/api-reference/limits)
- [Errors](https://openrouter.ai/docs/api-reference/errors)
- [POSTCompletion](https://openrouter.ai/docs/api-reference/completion)
- [POSTChat completion](https://openrouter.ai/docs/api-reference/chat-completion)
- [GETGet a generation](https://openrouter.ai/docs/api-reference/get-a-generation)
- [GETList available models](https://openrouter.ai/docs/api-reference/list-available-models)
- [GETList endpoints for a model](https://openrouter.ai/docs/api-reference/list-endpoints-for-a-model)
- [GETGet credits](https://openrouter.ai/docs/api-reference/get-credits)
- [POSTCreate a Coinbase charge](https://openrouter.ai/docs/api-reference/create-a-coinbase-charge)
- Use Cases

- [BYOK](https://openrouter.ai/docs/use-cases/byok)
- [Crypto API](https://openrouter.ai/docs/use-cases/crypto-api)
- [OAuth PKCE](https://openrouter.ai/docs/use-cases/oauth-pkce)
- [For Providers](https://openrouter.ai/docs/use-cases/for-providers)
- [Reasoning Tokens](https://openrouter.ai/docs/use-cases/reasoning-tokens)
- Community

- [Frameworks](https://openrouter.ai/docs/community/frameworks)
- [Discord](https://discord.gg/fVyRaUDgxW)

[API](https://openrouter.ai/docs/api-reference/overview)[Models](https://openrouter.ai/models)[Chat](https://openrouter.ai/chat)[Ranking](https://openrouter.ai/rankings)[Login](https://openrouter.ai/credits)

[API Reference](https://openrouter.ai/docs/api-reference/overview)

POST

Send a completion request to a selected model (text-only format)

### Request

This endpoint expects an object.

modelstringRequired

The model ID to use

promptstringRequired

The text prompt to complete

streambooleanOptionalDefaults to `false`

### Response

Successful completion

idstringOptional

choiceslist of objectsOptional

[

Chat completion

Up Next](https://openrouter.ai/docs/api-reference/chat-completion)

[Built with](https://buildwithfern.com/?utm_campaign=buildWith&utm_medium=docs&utm_source=openrouter.ai)

**Example**
```python
import requests

url = 'https://openrouter.ai/api/v1/completions'
headers = {
    'Authorization': 'Bearer YOUR_API_TOKEN',
    'Content-Type': 'application/json'
}

payload = {
    'model': 'anthropic/claude-2',
    'prompt': 'Write a short story about a robot discovering friendship'
}

response = requests.post(url, headers=headers, json=payload)
print(response.json()['choices'][0]['text'])
```


> [!summary]- Summary
> - Endpoint for retrieving metadata about a specific generation request
> - Requires an `id` query parameter
> - Returns detailed generation metadata including:
>     * Cost information
>     * Model details
>     * Token usage
>     * Streaming status
>     * Performance metrics
> - Requires authentication via Bearer token
> - Provides comprehensive insights into a single generation request

```block
$curl -G https://openrouter.ai/api/v1/generation \>     -H "Authorization: Bearer <token>" \>     -d id=id
```

```block
1{2  "data": {3    "id": "id",4    "total_cost": 1.1,5    "created_at": "created_at",6    "model": "model",7    "origin": "origin",8    "usage": 1.1,9    "is_byok": true,10    "upstream_id": "upstream_id",11    "cache_discount": 1.1,12    "app_id": 1,13    "streamed": true,14    "cancelled": true,15    "provider_name": "provider_name",16    "latency": 1,17    "moderation_latency": 1,18    "generation_time": 1,19    "finish_reason": "finish_reason",20    "native_finish_reason": "native_finish_reason",21    "tokens_prompt": 1,22    "tokens_completion": 1,23    "native_tokens_prompt": 1,24    "native_tokens_completion": 1,25    "native_tokens_reasoning": 1,26    "num_media_prompt": 1,27    "num_media_completion": 1,28    "num_search_results": 129  }30}
```

**Example**
```bash
# Curl example to retrieve generation metadata
curl -G https://openrouter.ai/api/v1/generation \
     -H \\"Authorization: Bearer YOUR_API_TOKEN\\" \
     -d id=generation_123456

# Hypothetical Python example using requests
import requests

headers = {
    'Authorization': 'Bearer YOUR_API_TOKEN'
}
params = {
    'id': 'generation_123456'
}

response = requests.get(
    'https://openrouter.ai/api/v1/generation', 
    headers=headers, 
    params=params
)
print(response.json())
```


> [!summary]- Summary
> - Endpoint: GET /api/v1/models
> - Purpose: Retrieve a list of available AI models through OpenRouter API
> - Response includes details for each model:
>   * Model ID
>   * Model name
>   * Model description
>   * Pricing details (prompt and completion costs)
> - Returns a JSON object with a `data` array containing model information

- Overview

- [Quickstart](https://openrouter.ai/docs/quickstart)
- [Principles](https://openrouter.ai/docs/overview/principles)
- [Models](https://openrouter.ai/docs/overview/models)
- Features

- [Model Routing](https://openrouter.ai/docs/features/model-routing)
- [Provider Routing](https://openrouter.ai/docs/features/provider-routing)
- [Prompt Caching](https://openrouter.ai/docs/features/prompt-caching)
- [Structured Outputs](https://openrouter.ai/docs/features/structured-outputs)
- [Message Transforms](https://openrouter.ai/docs/features/message-transforms)
- [Uptime Optimization](https://openrouter.ai/docs/features/uptime-optimization)
- [Web Search](https://openrouter.ai/docs/features/web-search)
- [Programmatic API Key Management](https://openrouter.ai/docs/features/programmatic-api-key-management)
- API Reference

- [Overview](https://openrouter.ai/docs/api-reference/overview)
- [Streaming](https://openrouter.ai/docs/api-reference/streaming)
- [Authentication](https://openrouter.ai/docs/api-reference/authentication)
- [Parameters](https://openrouter.ai/docs/api-reference/parameters)
- [Limits](https://openrouter.ai/docs/api-reference/limits)
- [Errors](https://openrouter.ai/docs/api-reference/errors)
- [POSTCompletion](https://openrouter.ai/docs/api-reference/completion)
- [POSTChat completion](https://openrouter.ai/docs/api-reference/chat-completion)
- [GETGet a generation](https://openrouter.ai/docs/api-reference/get-a-generation)
- [GETList available models](https://openrouter.ai/docs/api-reference/list-available-models)
- [GETList endpoints for a model](https://openrouter.ai/docs/api-reference/list-endpoints-for-a-model)
- [GETGet credits](https://openrouter.ai/docs/api-reference/get-credits)
- [POSTCreate a Coinbase charge](https://openrouter.ai/docs/api-reference/create-a-coinbase-charge)
- Use Cases

- [BYOK](https://openrouter.ai/docs/use-cases/byok)
- [Crypto API](https://openrouter.ai/docs/use-cases/crypto-api)
- [OAuth PKCE](https://openrouter.ai/docs/use-cases/oauth-pkce)
- [For Providers](https://openrouter.ai/docs/use-cases/for-providers)
- [Reasoning Tokens](https://openrouter.ai/docs/use-cases/reasoning-tokens)
- Community

- [Frameworks](https://openrouter.ai/docs/community/frameworks)
- [Discord](https://discord.gg/fVyRaUDgxW)

[API](https://openrouter.ai/docs/api-reference/overview)[Models](https://openrouter.ai/models)[Chat](https://openrouter.ai/chat)[Ranking](https://openrouter.ai/rankings)[Login](https://openrouter.ai/credits)

[API Reference](https://openrouter.ai/docs/api-reference/overview)

GET

Returns a list of models available through the API

### Response

List of available models

datalist of objects

[

List endpoints for a model

Up Next](https://openrouter.ai/docs/api-reference/list-endpoints-for-a-model)

[Built with](https://buildwithfern.com/?utm_campaign=buildWith&utm_medium=docs&utm_source=openrouter.ai)

**Example**
```python
import requests

url = 'https://openrouter.ai/api/v1/models'
headers = {
    'Authorization': 'Bearer YOUR_API_KEY'
}

response = requests.get(url, headers=headers)
models = response.json()['data']

for model in models:
    print(f\\"Model: {model['name']}\\")
    print(f\\"Pricing - Prompt: ${model['pricing']['prompt']}, Completion: ${model['pricing']['completion']}\\")
```


> [!summary]- Summary
> - Endpoint: GET /api/v1/models/:author/:slug/endpoints
> - Purpose: Retrieve detailed information about specific model endpoints
> - Required Path Parameters:
>   * `author`: string (required)
>   * `slug`: string (required)
> - Response includes:
>   * Model metadata (ID, name, description)
>   * Model architecture details
>   * Endpoint-specific information:
>     - Endpoint name
>     - Context length
>     - Pricing details
>     - Provider name
>     - Supported parameters

```block
$curl https://openrouter.ai/api/v1/models/author/slug/endpoints
```

```block
1{2  "data": {3    "id": "id",4    "name": "name",5    "created": 1.1,6    "description": "description",7    "architecture": {8      "tokenizer": "tokenizer",9      "instruct_type": "instruct_type",10      "modality": "modality"11    },12    "endpoints": [13      {14        "name": "name",15        "context_length": 1.1,16        "pricing": {17          "request": "request",18          "image": "image",19          "prompt": "prompt",20          "completion": "completion"21        },22        "provider_name": "provider_name",23        "supported_parameters": [24          "supported_parameters"25        ]26      }27    ]28  }29}
```

**Example**
```python
import requests

# Example request to get endpoints for a specific model
response = requests.get(
    'https://openrouter.ai/api/v1/models/anthropic/claude-2/endpoints',
    headers={'Authorization': 'Bearer YOUR_API_KEY'}
)

# Parse and print model endpoint details
model_endpoints = response.json()['data']
for endpoint in model_endpoints['endpoints']:
    print(f\\"Endpoint Name: {endpoint['name']}\\")
    print(f\\"Context Length: {endpoint['context_length']}\\")
    print(f\\"Provider: {endpoint['provider_name']}\\")
```


> [!summary]- Summary
> - OpenRouter provides a normalized API schema across different AI model providers
> - Supports chat completions, streaming, multimodal inputs (images), and tool calls
> - Normalizes model responses, token counting, and finish reasons
> - Offers advanced features like model/provider routing, prompt transforms, and web search
> - Provides detailed API documentation with TypeScript type definitions
> - Supports various parameters like temperature, max_tokens, and tool selection
> - Allows querying generation stats and costs after API calls

OpenRouter’s request and response schemas are very similar to the OpenAI Chat API, with a few small differences. At a high level, **OpenRouter normalizes the schema across models and providers** so you only need to learn one.

## Requests

### Completions Request Format

Here is the request schema as a TypeScript type. This will be the body of your `POST` request to the `/api/v1/chat/completions` endpoint (see the [quick start](https://openrouter.ai/docs/quick-start) above for an example).

For a complete list of parameters, see the [Parameters](https://openrouter.ai/docs/api-reference/parameters).

The `response_format` parameter ensures you receive a structured response from the LLM. The parameter is only supported by OpenAI models, Nitro models, and some others - check the providers on the model page on openrouter.ai/models to see if it’s supported, and set `require_parameters` to true in your Provider Preferences. See [Provider Routing](https://openrouter.ai/docs/features/provider-routing)

OpenRouter allows you to specify some optional headers to identify your app and make it discoverable to users on our site.

- `HTTP-Referer`: Identifies your app on openrouter.ai
- `X-Title`: Sets/modifies your app’s title

##### Model routing

If the `model` parameter is omitted, the user or payer’s default is used. Otherwise, remember to select a value for `model` from the [supported models](https://openrouter.ai/models) or [API](https://openrouter.ai/api/v1/models), and include the organization prefix. OpenRouter will select the least expensive and best GPUs available to serve the request, and fall back to other providers or GPUs if it receives a 5xx response code or if you are rate-limited.

##### Streaming

[Server-Sent Events (SSE)](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events#event_stream_format) are supported as well, to enable streaming *for all models*. Simply send `stream: true` in your request body. The SSE stream will occasionally contain a “comment” payload, which you should ignore (noted below).

##### Non-standard parameters

If the chosen model doesn’t support a request parameter (such as `logit_bias` in non-OpenAI models, or `top_k` for OpenAI), then the parameter is ignored. The rest are forwarded to the underlying model API.

### Assistant Prefill

OpenRouter supports asking models to complete a partial response. This can be useful for guiding models to respond in a certain way.

To use this features, simply include a message with `role: "assistant"` at the end of your `messages` array.

### Images & Multimodal

Multimodal requests are only available via the `/api/v1/chat/completions` API with a multi-part `messages` parameter. The `image_url` can either be a URL or a data-base64 encoded image.

Sample LLM response:

#### Uploading base64 encoded images

For locally stored images, you can send them to the model using base64 encoding. Here’s an example:

When sending data-base64 string, ensure it contains the content-type of the image. Example:

Supported content types are:

- `image/png`
- `image/jpeg`
- `image/webp`

### Tool Calls

Tool calls (also known as function calling) allow you to give an LLM access to external tools. The LLM does not call the tools directly. Instead, it suggests the tool to call. The user then calls the tool separately and provides the results back to the LLM. Finally, the LLM formats the response into an answer to the user’s original question.

An example of the five-turn sequence:

1. The user asks a question, while supplying a list of available `tools` in a JSON schema format:

2. The LLM responds with tool suggestion, together with appropriate arguments:

3. The user calls the tool separately:

4. The user provides the tool results back to the LLM:

5. The LLM formats the tool result into a natural language response:

OpenRouter standardizes the tool calling interface. However, different providers and models may support less tool calling features and arguments. (ex: `tool_choice`, `tool_use`, `tool_result`)

## Responses

### CompletionsResponse Format

OpenRouter normalizes the schema across models and providers to comply with the [OpenAI Chat API](https://platform.openai.com/docs/api-reference/chat).

This means that `choices` is always an array, even if the model only returns one completion. Each choice will contain a `delta` property if a stream was requested and a `message` property otherwise. This makes it easier to use the same code for all models.

Here’s the response schema as a TypeScript type:

Here’s an example:

### Finish Reason

OpenRouter normalizes each model’s `finish_reason` to one of the following values: `tool_calls`, `stop`, `length`, `content_filter`, `error`.

Some models and providers may have additional finish reasons. The raw finish\_reason string returned by the model is available via the `native_finish_reason` property.

### Querying Cost and Stats

The token counts that are returned in the completions API response are **not** counted via the model’s native tokenizer. Instead it uses a normalized, model-agnostic count (accomplished via the GPT4o tokenizer). This is because some providers do not reliably return native token counts. This behavior is becoming more rare, however, and we may add native token counts to the response object in the future.

Credit usage and model pricing are based on the **native** token counts (not the ‘normalized’ token counts returned in the API response).

For precise token accounting using the model’s native tokenizer, you can retrieve the full generation information via the `/api/v1/generation` endpoint.

You can use the returned `id` to query for the generation stats (including token counts and cost) after the request is complete. This is how you can get the cost and tokens for *all models and requests*, streaming and non-streaming.

Note that token counts are also available in the `usage` field of the response body for non-streaming completions.

**Example**
```python
import requests

# OpenRouter API call example
response = requests.post(
    'https://openrouter.ai/api/v1/chat/completions',
    headers={
        'Authorization': 'Bearer YOUR_OPENROUTER_API_KEY',
        'Content-Type': 'application/json'
    },
    json={
        'model': 'openai/gpt-4o',
        'messages': [
            {
                'role': 'user',
                'content': 'Explain quantum computing in simple terms'
            }
        ],
        'temperature': 0.7,
        'max_tokens': 150
    }
)

# Print the AI's response
print(response.json()['choices'][0]['message']['content'])
```


> [!summary]- Summary
> - Prompt caching helps reduce AI model inference costs across different providers
> - Most providers automatically enable caching, but some require manual configuration
> - Caching does not work when switching between providers
> - You can inspect cache usage through the OpenRouter Activity page or API
> - Different providers have unique cache write and read pricing models
> - OpenAI requires minimum 1024 tokens for caching
> - Anthropic allows up to four cache breakpoints with a five-minute expiration
> - DeepSeek offers automated caching with minimal configuration

To save on inference costs, you can enable prompt caching on supported providers and models.

Most providers automatically enable prompt caching, but note that some (see Anthropic below) require you to enable it on a per-message basis. Note that prompt caching does not work when switching between providers. In order to cache the prompt, LLM engines must store a memory snapshot of the processed prompt, which is not shared with other providers.

## Inspecting cache usage

To see how much caching saved on each generation, you click the detail button on the [Activity](https://openrouter.ai/activity) page, or you can use the `/api/v1/generation` API, [documented here](https://openrouter.ai/docs/api-reference/overview#querying-cost-and-stats).

The `cache_discount` field in the response body will tell you how much the response saved on cache usage. Some providers, like Anthropic, will have a negative discount on cache writes, but a positive discount (which reduces total cost) on cache reads.

## OpenAI

Caching price changes:

- **Cache writes**: no cost
- **Cache reads**: charged at 0.5x the price of the original input pricing

Prompt caching with OpenAI is automated and does not require any additional configuration. There is a minimum prompt size of 1024 tokens.

[Click here to read more about OpenAI prompt caching and its limitation.](https://openai.com/index/api-prompt-caching/)

## Anthropic Claude

Caching price changes:

- **Cache writes**: charged at 1.25x the price of the original input pricing
- **Cache reads**: charged at 0.1x the price of the original input pricing

Prompt caching with Anthropic requires the use of `cache_control` breakpoints. There is a limit of four breakpoints, and the cache will expire within five minutes. Therefore, it is recommended to reserve the cache breakpoints for large bodies of text, such as character cards, CSV data, RAG data, book chapters, etc.

[Click here to read more about Anthropic prompt caching and its limitation.](https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching)

The `cache_control` breakpoint can only be inserted into the text part of a multipart message.

System message caching example:

User message caching example:

## DeepSeek

Caching price changes:

- **Cache writes**: charged at the same price as the original input pricing
- **Cache reads**: charged at 0.1x the price of the original input pricing

Prompt caching with DeepSeek is automated and does not require any additional configuration.

**Example**
```python
# Anthropic Claude prompt caching example
messages = [
    {
        \\"role\\": \\"system\