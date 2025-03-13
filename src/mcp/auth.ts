/**
 * MCP Authentication
 * 
 * This module handles authentication between the Slack bot and the MCP server.
 * It provides utilities for token management, validation, and refresh.
 */

import { env } from '../config/environment';
import { logger, logEmoji } from '../utils/logger';

/**
 * Authentication token interface
 */
export interface AuthToken {
    token: string;
    expiresAt?: Date;
    refreshToken?: string;
}

/**
 * Authentication manager for MCP server
 */
export class MCPAuthManager {
    private token: AuthToken;
    private readonly refreshIntervalMs: number;
    private refreshInterval: NodeJS.Timeout | null = null;

    /**
     * Create a new authentication manager
     * 
     * @param initialToken Initial authentication token
     * @param refreshIntervalMs Interval for token refresh in milliseconds
     */
    constructor(
        initialToken: string = env.MCP_AUTH_TOKEN,
        refreshIntervalMs: number = 24 * 60 * 60 * 1000 // 24 hours
    ) {
        this.token = { token: initialToken };
        this.refreshIntervalMs = refreshIntervalMs;

        logger.info(`${logEmoji.mcp} MCP authentication manager initialized`);

        // Set up token refresh if needed
        if (this.refreshIntervalMs > 0) {
            this.startRefreshInterval();
        }
    }

    /**
     * Get the current authentication token
     * 
     * @returns The current authentication token
     */
    public getToken(): string {
        return this.token.token;
    }

    /**
     * Set a new authentication token
     * 
     * @param token The new authentication token
     * @param expiresAt Optional expiration date
     * @param refreshToken Optional refresh token
     */
    public setToken(token: string, expiresAt?: Date, refreshToken?: string): void {
        this.token = {
            token,
            expiresAt,
            refreshToken,
        };

        logger.info(`${logEmoji.mcp} MCP authentication token updated`);
    }

    /**
     * Check if the token is expired
     * 
     * @returns True if the token is expired, false otherwise
     */
    public isTokenExpired(): boolean {
        if (!this.token.expiresAt) {
            return false;
        }

        return new Date() >= this.token.expiresAt;
    }

    /**
     * Start the token refresh interval
     */
    private startRefreshInterval(): void {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }

        this.refreshInterval = setInterval(async () => {
            try {
                await this.refreshTokenIfNeeded();
            } catch (error) {
                logger.error(`${logEmoji.error} Error refreshing MCP token`, { error });
            }
        }, this.refreshIntervalMs);

        logger.debug(`${logEmoji.mcp} MCP token refresh interval started (${this.refreshIntervalMs}ms)`);
    }

    /**
     * Stop the token refresh interval
     */
    public stopRefreshInterval(): void {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
            logger.debug(`${logEmoji.mcp} MCP token refresh interval stopped`);
        }
    }

    /**
     * Refresh the token if needed
     * 
     * @returns Promise resolving to true if the token was refreshed, false otherwise
     */
    public async refreshTokenIfNeeded(): Promise<boolean> {
        // If the token doesn't have an expiration date or refresh token, we can't refresh it
        if (!this.token.expiresAt || !this.token.refreshToken) {
            return false;
        }

        // If the token is not expired, we don't need to refresh it
        if (!this.isTokenExpired()) {
            return false;
        }

        try {
            logger.info(`${logEmoji.mcp} Refreshing MCP token`);

            // In a real implementation, this would make a request to the MCP server
            // to refresh the token using the refresh token
            // For now, we'll just simulate a successful refresh
            const newToken = `refreshed_${Date.now()}`;
            const expiresAt = new Date(Date.now() + this.refreshIntervalMs);

            this.setToken(newToken, expiresAt, this.token.refreshToken);

            logger.info(`${logEmoji.mcp} MCP token refreshed successfully`);
            return true;
        } catch (error) {
            logger.error(`${logEmoji.error} Error refreshing MCP token`, { error });
            return false;
        }
    }

    /**
     * Create authentication headers for requests
     * 
     * @returns Authentication headers
     */
    public createAuthHeaders(): Record<string, string> {
        return {
            'Authorization': `Bearer ${this.getToken()}`,
        };
    }
}

// Export a singleton instance
export const mcpAuthManager = new MCPAuthManager();
