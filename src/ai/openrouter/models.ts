/**
 * OpenRouter Models
 * 
 * This module defines the available models from OpenRouter and their capabilities.
 * It provides a mapping of model IDs to their metadata.
 */

import { ModelInfo } from '../interfaces/provider';

/**
 * OpenRouter model IDs
 */
export enum OpenRouterModelId {
    // Qwen models
    QWEN3_235B_A22B = 'qwen/qwen3-235b-a22b',

    // OpenAI models
    GPT4O_LATEST = 'openai/chatgpt-4o-latest',
    GPT4_TURBO = 'openai/gpt-4-turbo',
    GPT4_VISION = 'openai/gpt-4-vision',
    GPT4 = 'openai/gpt-4',
    GPT35_TURBO = 'openai/gpt-3.5-turbo',

    // Anthropic models
    CLAUDE_3_7_SONNET = 'anthropic/claude-3.7-sonnet',
    CLAUDE_3_OPUS = 'anthropic/claude-3-opus',
    CLAUDE_3_SONNET = 'anthropic/claude-3-sonnet',
    CLAUDE_3_HAIKU = 'anthropic/claude-3-haiku',
    CLAUDE_2 = 'anthropic/claude-2',

    // Google models
    GEMINI_PRO = 'google/gemini-pro',
    GEMINI_PRO_VISION = 'google/gemini-pro-vision',

    // Meta models
    LLAMA3_70B = 'meta/llama-3-70b',
    LLAMA3_8B = 'meta/llama-3-8b',

    // Mistral models
    MISTRAL_LARGE = 'mistral/mistral-large',
    MISTRAL_MEDIUM = 'mistral/mistral-medium',
    MISTRAL_SMALL = 'mistral/mistral-small',
}

/**
 * Default model to use if none specified
 */
export const DEFAULT_MODEL = OpenRouterModelId.QWEN3_235B_A22B;

/**
 * Model information for OpenRouter models
 */
export const OPENROUTER_MODELS: Record<OpenRouterModelId, ModelInfo> = {
    // Qwen models
    [OpenRouterModelId.QWEN3_235B_A22B]: {
        id: OpenRouterModelId.QWEN3_235B_A22B,
        name: 'Qwen3 235B A22B',
        provider: 'Qwen',
        capabilities: {
            functionCalling: true,
            vision: false,
            streaming: true,
        },
        contextWindow: 128000,
        maxOutputTokens: 4096,
    },

    // OpenAI models
    [OpenRouterModelId.GPT4O_LATEST]: {
        id: OpenRouterModelId.GPT4O_LATEST,
        name: 'GPT-4o Latest',
        provider: 'OpenAI',
        capabilities: {
            functionCalling: true,
            vision: true,
            streaming: true,
        },
        contextWindow: 128000,
        maxOutputTokens: 4096,
    },
    [OpenRouterModelId.GPT4_TURBO]: {
        id: OpenRouterModelId.GPT4_TURBO,
        name: 'GPT-4 Turbo',
        provider: 'OpenAI',
        capabilities: {
            functionCalling: true,
            vision: false,
            streaming: true,
        },
        contextWindow: 128000,
        maxOutputTokens: 4096,
    },
    [OpenRouterModelId.GPT4_VISION]: {
        id: OpenRouterModelId.GPT4_VISION,
        name: 'GPT-4 Vision',
        provider: 'OpenAI',
        capabilities: {
            functionCalling: true,
            vision: true,
            streaming: true,
        },
        contextWindow: 128000,
        maxOutputTokens: 4096,
    },
    [OpenRouterModelId.GPT4]: {
        id: OpenRouterModelId.GPT4,
        name: 'GPT-4',
        provider: 'OpenAI',
        capabilities: {
            functionCalling: true,
            vision: false,
            streaming: true,
        },
        contextWindow: 8192,
        maxOutputTokens: 4096,
    },
    [OpenRouterModelId.GPT35_TURBO]: {
        id: OpenRouterModelId.GPT35_TURBO,
        name: 'GPT-3.5 Turbo',
        provider: 'OpenAI',
        capabilities: {
            functionCalling: true,
            vision: false,
            streaming: true,
        },
        contextWindow: 16385,
        maxOutputTokens: 4096,
    },

    // Anthropic models
    [OpenRouterModelId.CLAUDE_3_7_SONNET]: {
        id: OpenRouterModelId.CLAUDE_3_7_SONNET,
        name: 'Claude 3.7 Sonnet',
        provider: 'Anthropic',
        capabilities: {
            functionCalling: true,
            vision: true,
            streaming: true,
        },
        contextWindow: 200000,
        maxOutputTokens: 4096,
    },
    [OpenRouterModelId.CLAUDE_3_OPUS]: {
        id: OpenRouterModelId.CLAUDE_3_OPUS,
        name: 'Claude 3 Opus',
        provider: 'Anthropic',
        capabilities: {
            functionCalling: true,
            vision: true,
            streaming: true,
        },
        contextWindow: 200000,
        maxOutputTokens: 4096,
    },
    [OpenRouterModelId.CLAUDE_3_SONNET]: {
        id: OpenRouterModelId.CLAUDE_3_SONNET,
        name: 'Claude 3 Sonnet',
        provider: 'Anthropic',
        capabilities: {
            functionCalling: true,
            vision: true,
            streaming: true,
        },
        contextWindow: 200000,
        maxOutputTokens: 4096,
    },
    [OpenRouterModelId.CLAUDE_3_HAIKU]: {
        id: OpenRouterModelId.CLAUDE_3_HAIKU,
        name: 'Claude 3 Haiku',
        provider: 'Anthropic',
        capabilities: {
            functionCalling: true,
            vision: true,
            streaming: true,
        },
        contextWindow: 200000,
        maxOutputTokens: 4096,
    },
    [OpenRouterModelId.CLAUDE_2]: {
        id: OpenRouterModelId.CLAUDE_2,
        name: 'Claude 2',
        provider: 'Anthropic',
        capabilities: {
            functionCalling: false,
            vision: false,
            streaming: true,
        },
        contextWindow: 100000,
        maxOutputTokens: 4096,
    },

    // Google models
    [OpenRouterModelId.GEMINI_PRO]: {
        id: OpenRouterModelId.GEMINI_PRO,
        name: 'Gemini Pro',
        provider: 'Google',
        capabilities: {
            functionCalling: true,
            vision: false,
            streaming: true,
        },
        contextWindow: 32768,
        maxOutputTokens: 8192,
    },
    [OpenRouterModelId.GEMINI_PRO_VISION]: {
        id: OpenRouterModelId.GEMINI_PRO_VISION,
        name: 'Gemini Pro Vision',
        provider: 'Google',
        capabilities: {
            functionCalling: true,
            vision: true,
            streaming: true,
        },
        contextWindow: 32768,
        maxOutputTokens: 8192,
    },

    // Meta models
    [OpenRouterModelId.LLAMA3_70B]: {
        id: OpenRouterModelId.LLAMA3_70B,
        name: 'Llama 3 70B',
        provider: 'Meta',
        capabilities: {
            functionCalling: false,
            vision: false,
            streaming: true,
        },
        contextWindow: 8192,
        maxOutputTokens: 4096,
    },
    [OpenRouterModelId.LLAMA3_8B]: {
        id: OpenRouterModelId.LLAMA3_8B,
        name: 'Llama 3 8B',
        provider: 'Meta',
        capabilities: {
            functionCalling: false,
            vision: false,
            streaming: true,
        },
        contextWindow: 8192,
        maxOutputTokens: 4096,
    },

    // Mistral models
    [OpenRouterModelId.MISTRAL_LARGE]: {
        id: OpenRouterModelId.MISTRAL_LARGE,
        name: 'Mistral Large',
        provider: 'Mistral',
        capabilities: {
            functionCalling: true,
            vision: false,
            streaming: true,
        },
        contextWindow: 32768,
        maxOutputTokens: 4096,
    },
    [OpenRouterModelId.MISTRAL_MEDIUM]: {
        id: OpenRouterModelId.MISTRAL_MEDIUM,
        name: 'Mistral Medium',
        provider: 'Mistral',
        capabilities: {
            functionCalling: true,
            vision: false,
            streaming: true,
        },
        contextWindow: 32768,
        maxOutputTokens: 4096,
    },
    [OpenRouterModelId.MISTRAL_SMALL]: {
        id: OpenRouterModelId.MISTRAL_SMALL,
        name: 'Mistral Small',
        provider: 'Mistral',
        capabilities: {
            functionCalling: false,
            vision: false,
            streaming: true,
        },
        contextWindow: 32768,
        maxOutputTokens: 4096,
    },
};

/**
 * Get model info by ID
 * 
 * @param modelId The model ID to look up
 * @returns The model info or undefined if not found
 */
export function getModelInfo(modelId: string): ModelInfo | undefined {
    return OPENROUTER_MODELS[modelId as OpenRouterModelId];
}

/**
 * Get all available models
 * 
 * @returns Array of all model info objects
 */
export function getAllModels(): ModelInfo[] {
    return Object.values(OPENROUTER_MODELS);
}

/**
 * Get models that support function calling
 * 
 * @returns Array of models that support function calling
 */
export function getFunctionCallingModels(): ModelInfo[] {
    return getAllModels().filter(model => model.capabilities.functionCalling);
}

/**
 * Get models that support vision
 * 
 * @returns Array of models that support vision
 */
export function getVisionModels(): ModelInfo[] {
    return getAllModels().filter(model => model.capabilities.vision);
}
