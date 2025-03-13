/**
 * Context Storage
 * 
 * This module provides storage implementations for conversation contexts.
 * It defines interfaces and implementations for storing and retrieving contexts.
 */

import { ConversationContext } from './manager';
import { logger, logEmoji } from '../../utils/logger';

/**
 * Interface for context storage providers
 */
export interface ContextStorage {
    /**
     * Save a context
     * 
     * @param key Unique key for the context
     * @param context The context to save
     * @returns Promise resolving to true if successful
     */
    saveContext(key: string, context: ConversationContext): Promise<boolean>;

    /**
     * Get a context by key
     * 
     * @param key The key to look up
     * @returns Promise resolving to the context or undefined if not found
     */
    getContext(key: string): Promise<ConversationContext | undefined>;

    /**
     * Delete a context
     * 
     * @param key The key to delete
     * @returns Promise resolving to true if successful
     */
    deleteContext(key: string): Promise<boolean>;

    /**
     * Get all contexts
     * 
     * @returns Promise resolving to an array of all contexts
     */
    getAllContexts(): Promise<ConversationContext[]>;

    /**
     * Get all context keys
     * 
     * @returns Promise resolving to an array of all context keys
     */
    getAllKeys(): Promise<string[]>;
}

/**
 * In-memory implementation of context storage
 * 
 * This is a simple implementation that stores contexts in memory.
 * It's suitable for development and testing, but not for production use
 * as contexts will be lost when the application restarts.
 */
export class InMemoryContextStorage implements ContextStorage {
    private storage: Map<string, ConversationContext>;

    constructor() {
        this.storage = new Map();
        logger.info(`${logEmoji.ai} Initialized in-memory context storage`);
    }

    /**
     * Save a context
     * 
     * @param key Unique key for the context
     * @param context The context to save
     * @returns Promise resolving to true if successful
     */
    public async saveContext(key: string, context: ConversationContext): Promise<boolean> {
        try {
            this.storage.set(key, { ...context });
            return true;
        } catch (error) {
            logger.error(`${logEmoji.error} Error saving context to in-memory storage`, { error });
            return false;
        }
    }

    /**
     * Get a context by key
     * 
     * @param key The key to look up
     * @returns Promise resolving to the context or undefined if not found
     */
    public async getContext(key: string): Promise<ConversationContext | undefined> {
        try {
            const context = this.storage.get(key);
            if (context) {
                return { ...context };
            }
            return undefined;
        } catch (error) {
            logger.error(`${logEmoji.error} Error getting context from in-memory storage`, { error });
            return undefined;
        }
    }

    /**
     * Delete a context
     * 
     * @param key The key to delete
     * @returns Promise resolving to true if successful
     */
    public async deleteContext(key: string): Promise<boolean> {
        try {
            return this.storage.delete(key);
        } catch (error) {
            logger.error(`${logEmoji.error} Error deleting context from in-memory storage`, { error });
            return false;
        }
    }

    /**
     * Get all contexts
     * 
     * @returns Promise resolving to an array of all contexts
     */
    public async getAllContexts(): Promise<ConversationContext[]> {
        try {
            return Array.from(this.storage.values()).map(context => ({ ...context }));
        } catch (error) {
            logger.error(`${logEmoji.error} Error getting all contexts from in-memory storage`, { error });
            return [];
        }
    }

    /**
     * Get all context keys
     * 
     * @returns Promise resolving to an array of all context keys
     */
    public async getAllKeys(): Promise<string[]> {
        try {
            return Array.from(this.storage.keys());
        } catch (error) {
            logger.error(`${logEmoji.error} Error getting all keys from in-memory storage`, { error });
            return [];
        }
    }

    /**
     * Clear all contexts
     * 
     * @returns Promise resolving to true if successful
     */
    public async clearAll(): Promise<boolean> {
        try {
            this.storage.clear();
            return true;
        } catch (error) {
            logger.error(`${logEmoji.error} Error clearing in-memory storage`, { error });
            return false;
        }
    }

    /**
     * Get the number of contexts in storage
     * 
     * @returns Promise resolving to the number of contexts
     */
    public async getCount(): Promise<number> {
        return this.storage.size;
    }
}

/**
 * Factory function to create a context storage instance
 * 
 * @param type The type of storage to create
 * @returns A context storage instance
 */
export function createContextStorage(type: 'memory' = 'memory'): ContextStorage {
    switch (type) {
        case 'memory':
        default:
            return new InMemoryContextStorage();
    }
}

// Export a singleton instance
export const contextStorage = createContextStorage();
