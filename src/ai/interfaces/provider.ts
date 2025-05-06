/**
 * AI Provider Interface
 * 
 * This module defines the interface for AI providers.
 * It establishes a common contract that all AI providers must implement.
 */

/**
 * Message role in a conversation
 */
export type MessageRole = 'user' | 'assistant' | 'system';

/**
 * Content types for multimodal messages
 */
export type ContentType = 'text' | 'image_url';

/**
 * Text content for a message
 */
export interface TextContent {
    type: 'text';
    text: string;
}

/**
 * Image content for a message
 */
export interface ImageContent {
    type: 'image_url';
    image_url: string;
}

/**
 * Content for a message (can be text or image)
 */
export type MessageContent = TextContent | ImageContent;

/**
 * Represents a message in a conversation
 */
export interface ConversationMessage {
    role: MessageRole;
    content: string | MessageContent[];
    name?: string;
    timestamp?: string;
}

/**
 * Function parameter schema using JSON Schema
 */
export interface JSONSchema {
    type: string;
    properties?: Record<string, any>;
    required?: string[];
    items?: JSONSchema;
    enum?: any[];
    [key: string]: any;
}

/**
 * Function definition for AI function calling
 */
export interface FunctionDefinition {
    name: string;
    description: string;
    parameters: JSONSchema;
}

/**
 * Function call result from AI
 */
export interface FunctionCall {
    name: string;
    arguments: Record<string, any>;
}

/**
 * Response from an AI provider
 */
export interface AIResponse {
    content: string;
    functionCalls?: FunctionCall[];
    metadata?: Record<string, any>;
}

/**
 * Information about an AI model
 */
export interface ModelInfo {
    id: string;
    name: string;
    provider: string;
    capabilities: {
        functionCalling: boolean;
        vision: boolean;
        streaming: boolean;
    };
    contextWindow: number;
    maxOutputTokens?: number;
}

/**
 * Options for generating a response
 */
export interface GenerateOptions {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    stream?: boolean;
}

/**
 * Interface that all AI providers must implement
 */
export interface AIProvider {
    /**
     * Name of the provider
     */
    name: string;

    /**
     * Generate a response from the AI provider
     * 
     * @param prompt The user's prompt or query (text or multimodal content)
     * @param conversationHistory Previous messages in the conversation
     * @param functions Optional function definitions for function calling
     * @param options Optional generation parameters
     * @returns A promise resolving to the AI response
     */
    generateResponse(
        prompt: string | MessageContent[],
        conversationHistory: ConversationMessage[],
        functions?: FunctionDefinition[],
        options?: GenerateOptions
    ): Promise<AIResponse>;

    /**
     * Check if the provider supports function calling
     * 
     * @returns True if function calling is supported
     */
    supportsFunctionCalling(): boolean;

    /**
     * Get available models from this provider
     * 
     * @returns A promise resolving to an array of model information
     */
    getAvailableModels(): Promise<ModelInfo[]>;
}
