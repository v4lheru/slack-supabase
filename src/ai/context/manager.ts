/**
 * Context Manager
 * 
 * This module manages conversation context for AI interactions.
 * It handles storing, retrieving, and updating conversation history.
 */

import { ConversationMessage } from '../interfaces/provider';
import { logger, logEmoji } from '../../utils/logger';
import { createSystemMessage, DEFAULT_SYSTEM_MESSAGE } from '../openrouter/formatter';

/**
 * Conversation context interface
 */
export interface ConversationContext {
    threadId: string;
    channelId: string;
    userId?: string;
    messages: ConversationMessage[];
    lastUpdated: Date;
}

/**
 * Context manager for handling conversation history
 */
export class ContextManager {
    private contexts: Map<string, ConversationContext>;
    private readonly maxContexts: number;
    private readonly maxMessagesPerContext: number;
    private readonly contextTtlMs: number; // Time to live in milliseconds

    /**
     * Create a new context manager
     * 
     * @param maxContexts Maximum number of contexts to store
     * @param maxMessagesPerContext Maximum number of messages per context
     * @param contextTtlHours Time to live for contexts in hours
     */
    constructor(
        maxContexts: number = 1000,
        maxMessagesPerContext: number = 50,
        contextTtlHours: number = 24
    ) {
        this.contexts = new Map();
        this.maxContexts = maxContexts;
        this.maxMessagesPerContext = maxMessagesPerContext;
        this.contextTtlMs = contextTtlHours * 60 * 60 * 1000;

        logger.info(`${logEmoji.ai} Context manager initialized with max ${maxContexts} contexts, ${maxMessagesPerContext} messages per context, TTL ${contextTtlHours}h`);

        // Set up periodic cleanup
        setInterval(() => this.cleanupExpiredContexts(), this.contextTtlMs / 2);
    }

    /**
     * Get a context key from thread and channel IDs
     * 
     * @param threadId Thread ID
     * @param channelId Channel ID
     * @returns Context key
     */
    private getContextKey(threadId: string, channelId: string): string {
        return `${channelId}:${threadId}`;
    }

    /**
     * Get conversation context
     * 
     * @param threadId Thread ID
     * @param channelId Channel ID
     * @returns Conversation context or undefined if not found
     */
    public getContext(threadId: string, channelId: string): ConversationContext | undefined {
        const key = this.getContextKey(threadId, channelId);
        return this.contexts.get(key);
    }

    /**
     * Create a new conversation context
     * 
     * @param threadId Thread ID
     * @param channelId Channel ID
     * @param userId Optional user ID
     * @param systemMessage Optional system message
     * @returns The new conversation context
     */
    public createContext(
        threadId: string,
        channelId: string,
        userId?: string,
        systemMessage: ConversationMessage = DEFAULT_SYSTEM_MESSAGE
    ): ConversationContext {
        // Check if we need to evict old contexts
        if (this.contexts.size >= this.maxContexts) {
            this.evictOldestContext();
        }

        const key = this.getContextKey(threadId, channelId);
        const context: ConversationContext = {
            threadId,
            channelId,
            userId,
            messages: [systemMessage],
            lastUpdated: new Date(),
        };

        this.contexts.set(key, context);
        logger.debug(`${logEmoji.ai} Created new context for thread ${threadId} in channel ${channelId}`);
        return context;
    }

    /**
     * Get or create a conversation context
     * 
     * @param threadId Thread ID
     * @param channelId Channel ID
     * @param userId Optional user ID
     * @returns The conversation context
     */
    public getOrCreateContext(
        threadId: string,
        channelId: string,
        userId?: string
    ): ConversationContext {
        const existingContext = this.getContext(threadId, channelId);
        if (existingContext) {
            return existingContext;
        }
        return this.createContext(threadId, channelId, userId);
    }

    /**
     * Add a message to a conversation context
     * 
     * @param threadId Thread ID
     * @param channelId Channel ID
     * @param message Message to add
     * @returns The updated conversation context
     */
    public addMessage(
        threadId: string,
        channelId: string,
        message: ConversationMessage
    ): ConversationContext {
        const context = this.getOrCreateContext(threadId, channelId);

        // Add the message, ensuring we don't exceed the maximum
        context.messages.push(message);
        if (context.messages.length > this.maxMessagesPerContext) {
            // Keep the system message (first message) and remove the oldest messages
            const systemMessage = context.messages[0];
            context.messages = [
                systemMessage,
                ...context.messages.slice(-(this.maxMessagesPerContext - 1)),
            ];
        }

        // Update the last updated timestamp
        context.lastUpdated = new Date();

        // Update the context in the map
        const key = this.getContextKey(threadId, channelId);
        this.contexts.set(key, context);

        logger.debug(`${logEmoji.ai} Added ${message.role} message to context for thread ${threadId}`);
        return context;
    }

    /**
     * Update the system message for a conversation context
     * 
     * @param threadId Thread ID
     * @param channelId Channel ID
     * @param systemMessage New system message
     * @returns The updated conversation context
     */
    public updateSystemMessage(
        threadId: string,
        channelId: string,
        systemMessage: string
    ): ConversationContext {
        const context = this.getOrCreateContext(threadId, channelId);

        // Replace the first message if it's a system message, otherwise add a new one
        if (context.messages.length > 0 && context.messages[0].role === 'system') {
            context.messages[0] = createSystemMessage(systemMessage);
        } else {
            context.messages.unshift(createSystemMessage(systemMessage));
        }

        // Update the last updated timestamp
        context.lastUpdated = new Date();

        // Update the context in the map
        const key = this.getContextKey(threadId, channelId);
        this.contexts.set(key, context);

        logger.debug(`${logEmoji.ai} Updated system message for thread ${threadId}`);
        return context;
    }

    /**
     * Clear a conversation context
     * 
     * @param threadId Thread ID
     * @param channelId Channel ID
     * @param keepSystemMessage Whether to keep the system message
     * @returns True if the context was cleared, false if it wasn't found
     */
    public clearContext(
        threadId: string,
        channelId: string,
        keepSystemMessage: boolean = true
    ): boolean {
        const key = this.getContextKey(threadId, channelId);
        const context = this.contexts.get(key);

        if (!context) {
            return false;
        }

        if (keepSystemMessage && context.messages.length > 0 && context.messages[0].role === 'system') {
            const systemMessage = context.messages[0];
            context.messages = [systemMessage];
        } else {
            context.messages = [];
        }

        context.lastUpdated = new Date();
        this.contexts.set(key, context);

        logger.debug(`${logEmoji.ai} Cleared context for thread ${threadId}`);
        return true;
    }

    /**
     * Delete a conversation context
     * 
     * @param threadId Thread ID
     * @param channelId Channel ID
     * @returns True if the context was deleted, false if it wasn't found
     */
    public deleteContext(threadId: string, channelId: string): boolean {
        const key = this.getContextKey(threadId, channelId);
        const deleted = this.contexts.delete(key);

        if (deleted) {
            logger.debug(`${logEmoji.ai} Deleted context for thread ${threadId}`);
        }

        return deleted;
    }

    /**
     * Evict the oldest context
     */
    private evictOldestContext(): void {
        if (this.contexts.size === 0) {
            return;
        }

        let oldestKey: string | null = null;
        let oldestDate: Date | null = null;

        for (const [key, context] of this.contexts.entries()) {
            if (oldestDate === null || context.lastUpdated < oldestDate) {
                oldestKey = key;
                oldestDate = context.lastUpdated;
            }
        }

        if (oldestKey) {
            this.contexts.delete(oldestKey);
            logger.debug(`${logEmoji.ai} Evicted oldest context due to capacity limit`);
        }
    }

    /**
     * Clean up expired contexts
     */
    private cleanupExpiredContexts(): void {
        const now = new Date();
        let expiredCount = 0;

        for (const [key, context] of this.contexts.entries()) {
            const age = now.getTime() - context.lastUpdated.getTime();
            if (age > this.contextTtlMs) {
                this.contexts.delete(key);
                expiredCount++;
            }
        }

        if (expiredCount > 0) {
            logger.debug(`${logEmoji.ai} Cleaned up ${expiredCount} expired contexts`);
        }
    }

    /**
     * Get the number of contexts currently stored
     * 
     * @returns Number of contexts
     */
    public getContextCount(): number {
        return this.contexts.size;
    }

    /**
     * Get all contexts
     * 
     * @returns Array of all contexts
     */
    public getAllContexts(): ConversationContext[] {
        return Array.from(this.contexts.values());
    }
}

// Export a singleton instance
export const contextManager = new ContextManager();
