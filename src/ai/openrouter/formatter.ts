/**
 * OpenRouter Message Formatter
 * 
 * This module provides utilities for formatting messages for the OpenRouter API.
 * It handles different formatting requirements for various models.
 */

import { ConversationMessage, MessageContent, TextContent, ImageContent } from '../interfaces/provider';
import { OpenRouterModelId } from './models';
import { logger, logEmoji } from '../../utils/logger';

/**
 * Maximum number of messages to include in conversation history
 * This helps prevent exceeding token limits
 */
const MAX_CONVERSATION_MESSAGES = 20;

/**
 * Format conversation history for OpenRouter API
 * 
 * @param messages Array of conversation messages
 * @param modelId The model ID to format for
 * @returns Formatted messages for the OpenRouter API
 */
export function formatConversationHistory(
    messages: ConversationMessage[],
    modelId: string = OpenRouterModelId.MISTRAL_SMALL
): ConversationMessage[] {
    try {
        // Limit the number of messages to prevent exceeding token limits
        const limitedMessages = messages.slice(-MAX_CONVERSATION_MESSAGES);

        // Apply model-specific formatting
        if (modelId.startsWith('anthropic/')) {
            return formatForAnthropic(limitedMessages);
        } else if (modelId.startsWith('google/')) {
            return formatForGoogle(limitedMessages);
        } else {
            // Default formatting (works for OpenAI, Meta, Mistral, etc.)
            return limitedMessages;
        }
    } catch (error) {
        logger.error(`${logEmoji.error} Error formatting conversation history`, { error });
        // Return original messages as fallback
        return messages;
    }
}

/**
 * Format messages for Anthropic models
 * 
 * @param messages Array of conversation messages
 * @returns Formatted messages for Anthropic models
 */
function formatForAnthropic(messages: ConversationMessage[]): ConversationMessage[] {
    // Anthropic models require alternating user/assistant messages
    // Ensure we don't have consecutive messages from the same role
    const formattedMessages: ConversationMessage[] = [];

    for (let i = 0; i < messages.length; i++) {
        const currentMessage = messages[i];
        const prevMessage = formattedMessages[formattedMessages.length - 1];

        // If this message has the same role as the previous one, combine them
        if (prevMessage && prevMessage.role === currentMessage.role) {
            prevMessage.content += `\n\n${currentMessage.content}`;
        } else {
            formattedMessages.push({ ...currentMessage });
        }
    }

    return formattedMessages;
}

/**
 * Format messages for Google models
 * 
 * @param messages Array of conversation messages
 * @returns Formatted messages for Google models
 */
function formatForGoogle(messages: ConversationMessage[]): ConversationMessage[] {
    // Google models have specific requirements for system messages
    // Convert system messages to user messages with a special prefix
    return messages.map(message => {
        if (message.role === 'system') {
            return {
                role: 'user',
                content: `<system>\n${message.content}\n</system>`,
                name: message.name,
                timestamp: message.timestamp,
            };
        }
        return { ...message };
    });
}

/**
 * Create a system message with appropriate instructions
 * 
 * @param instructions System instructions for the AI
 * @returns A system message
 */
export function createSystemMessage(instructions: string): ConversationMessage {
    return {
        role: 'system',
        content: instructions,
        timestamp: new Date().toISOString(),
    };
}

/**
 * Create a text content object
 * 
 * @param text The text content
 * @returns A text content object
 */
export function createTextContent(text: string): TextContent {
    return {
        type: 'text',
        text,
    };
}

/**
 * Create an image content object
 * 
 * @param imageUrl The image URL
 * @param detail Optional detail level
 * @returns An image content object
 */
export function createImageContent(imageUrl: string, detail: 'low' | 'high' | 'auto' = 'auto'): ImageContent {
    return {
        type: 'image_url',
        image_url: {
            url: imageUrl,
            detail,
        },
    };
}

/**
 * Default system message for the Slack bot
 */
export const DEFAULT_SYSTEM_MESSAGE = createSystemMessage(
    `You are an AI assistant in a Slack workspace. You are helpful, concise, and friendly.
    
    When responding:
    - Be clear and to the point
    - Format responses using Slack's markdown
    - Use bullet points and headings for organization
    - Include code blocks with syntax highlighting when sharing code
    - Cite sources when providing factual information
    
    You can call functions when needed to perform actions or retrieve information.`
);

/**
 * Create a user message
 * 
 * @param content Message content (text or multimodal)
 * @param name Optional user name
 * @returns A user message
 */
export function createUserMessage(
    content: string | MessageContent[],
    name?: string
): ConversationMessage {
    return {
        role: 'user',
        content,
        name,
        timestamp: new Date().toISOString(),
    };
}

/**
 * Create an assistant message
 * 
 * @param content Message content
 * @returns An assistant message
 */
export function createAssistantMessage(content: string): ConversationMessage {
    return {
        role: 'assistant',
        content,
        timestamp: new Date().toISOString(),
    };
}

/**
 * Create a multimodal user message with text and images
 * 
 * @param text The text content
 * @param imageUrls Array of image URLs
 * @param name Optional user name
 * @returns A multimodal user message
 */
export function createMultimodalUserMessage(
    text: string,
    imageUrls: string[],
    name?: string
): ConversationMessage {
    const content: MessageContent[] = [createTextContent(text)];

    // Add image content for each image URL
    for (const imageUrl of imageUrls) {
        content.push(createImageContent(imageUrl));
    }

    return {
        role: 'user',
        content,
        name,
        timestamp: new Date().toISOString(),
    };
}
