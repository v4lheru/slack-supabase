/**
 * MCP Client
 * 
 * This module implements the client for communicating with the MCP server.
 * It handles authentication, request formatting, and response parsing.
 */

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { env } from '../config/environment';
import { logger, logEmoji } from '../utils/logger';
import { Readable } from 'node:stream';
import { createParser } from 'eventsource-parser';

/**
 * MCP client configuration
 */
interface MCPClientConfig {
    serverUrl: string;
    authToken: string;
    timeout: number;
    retryCount: number;
    retryDelay: number;
    /** when set, enables SSE streaming for long-running ops */
    sseUrl?: string;
}

/**
 * MCP request interface
 */
export interface MCPRequest {
    action: string;
    parameters: Record<string, any>;
}

/**
 * MCP response interface
 */
export interface MCPResponse {
    status: 'success' | 'error' | 'pending';
    data?: any;
    error?: {
        code: string;
        message: string;
    };
    operationId?: string;
}

/**
 * MCP client for communicating with the MCP server
 */
export class MCPClient {
    private readonly client: AxiosInstance;
    private readonly config: MCPClientConfig;

    /**
     * Create a new MCP client
     * 
     * @param config Optional configuration overrides
     */
    constructor(config?: Partial<MCPClientConfig>) {
        this.config = {
            serverUrl: config?.serverUrl || env.MCP_SERVER_URL,
            authToken: config?.authToken || env.MCP_AUTH_TOKEN,
            timeout: config?.timeout || 30000, // 30 seconds
            retryCount: config?.retryCount || 3,
            retryDelay: config?.retryDelay || 1000, // 1 second
            // < new line
            sseUrl: config?.sseUrl || env.MCP_SSE_URL,
        };

        // Create axios client with default configuration
        // Only set Authorization header if authToken is present
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };
        if (this.config.authToken) {
            headers['Authorization'] = `Bearer ${this.config.authToken}`;
        }

        this.client = axios.create({
            baseURL: this.config.serverUrl,
            timeout: this.config.timeout,
            headers,
        });

        logger.info(`${logEmoji.mcp} MCP client initialized with server URL: ${this.config.serverUrl}`);
    }

    /**
     * Call the MCP server
     * 
     * @param request The request to send
     * @returns Promise resolving to the MCP response
     */
    public async call(request: MCPRequest): Promise<MCPResponse> {
        try {
            logger.debug(`${logEmoji.mcp} Calling MCP action: ${request.action}`, {
                parameters: Object.keys(request.parameters),
            });

            // Make the API request
            // Build request body, only add authentication if authToken is present
            const requestBody: any = {
                ...request,
            };
            if (this.config.authToken) {
                (requestBody as any).authentication = {
                    token: this.config.authToken,
                };
            }

            const response = await this.client.post<MCPResponse>(
                '/call',
                requestBody
            );

            // Extract the response
            const result = response.data;

            logger.debug(`${logEmoji.mcp} MCP response for action ${request.action}: ${result.status}`);

            return result;
        } catch (error) {
            logger.error(`${logEmoji.error} Error calling MCP action: ${request.action}`, { error });

            // Return a formatted error response
            return {
                status: 'error',
                error: {
                    code: 'mcp_call_failed',
                    message: `Failed to call MCP: ${error instanceof Error ? error.message : String(error)}`,
                },
            };
        }
    }

    /**
     * Call the MCP server with retry logic
     * 
     * @param request The request to send
     * @returns Promise resolving to the MCP response
     */
    public async callWithRetry(request: MCPRequest): Promise<MCPResponse> {
        let lastError: MCPResponse | null = null;

        for (let attempt = 0; attempt < this.config.retryCount; attempt++) {
            try {
                // Make the call
                const response = await this.call(request);

                // If successful, return the response
                if (response.status !== 'error') {
                    return response;
                }

                // Store the error for potential retry
                lastError = response;

                // Log the retry attempt
                logger.warn(`${logEmoji.warning} MCP call failed, retrying (${attempt + 1}/${this.config.retryCount}): ${response.error?.message}`);

                // Wait before retrying
                await new Promise(resolve => setTimeout(resolve, this.config.retryDelay));
            } catch (error) {
                // Unexpected error
                logger.error(`${logEmoji.error} Unexpected error in MCP retry logic`, { error });

                // Store the error for potential retry
                lastError = {
                    status: 'error',
                    error: {
                        code: 'unexpected_error',
                        message: `Unexpected error: ${error instanceof Error ? error.message : String(error)}`,
                    },
                };

                // Wait before retrying
                await new Promise(resolve => setTimeout(resolve, this.config.retryDelay));
            }
        }

        // All retries failed, return the last error
        logger.error(`${logEmoji.error} MCP call failed after ${this.config.retryCount} retries`);
        return lastError || {
            status: 'error',
            error: {
                code: 'max_retries_exceeded',
                message: `Failed after ${this.config.retryCount} retries`,
            },
        };
    }

    /**
     * Check the status of an asynchronous operation
     * 
     * @param operationId The operation ID to check
     * @returns Promise resolving to the MCP response
     */
    public async checkOperationStatus(operationId: string): Promise<MCPResponse> {
        try {
            logger.debug(`${logEmoji.mcp} Checking MCP operation status: ${operationId}`);

            // Make the API request
            const response = await this.client.get<MCPResponse>(
                `/operations/${operationId}`
            );

            // Extract the response
            const result = response.data;

            logger.debug(`${logEmoji.mcp} MCP operation ${operationId} status: ${result.status}`);

            return result;
        } catch (error) {
            logger.error(`${logEmoji.error} Error checking MCP operation status: ${operationId}`, { error });

            // Return a formatted error response
            return {
                status: 'error',
                error: {
                    code: 'operation_status_check_failed',
                    message: `Failed to check operation status: ${error instanceof Error ? error.message : String(error)}`,
                },
            };
        }
    }

    /**
     * Consume a Server-Sent-Events stream and pass each JSON chunk to the caller.
     */
    private async streamFromSSE(onMessage: (msg: MCPResponse) => void): Promise<void> {
        if (!this.config.sseUrl) throw new Error('SSE URL not configured');

        const res = await this.client.get<Readable>(this.config.sseUrl, {
            responseType: 'stream',
            headers: { Accept: 'text/event-stream' },
        });

        // Cast to `any` so it works with every released signature of
        // `eventsource-parser` (object-based or function-based).
        const parser: any = (createParser as any)((event: any) => {
            if (event.type === 'event' && event.data) {
                try { onMessage(JSON.parse(event.data)); } catch { /* ignore non-JSON */ }
            }
        });

        (res.data as Readable).on('data', (chunk: Buffer) => parser.feed(chunk.toString()));
    }

    /**
     * Replacement for waitForOperation that prefers SSE when available.
     */
    public async waitForOperation(
        operationId: string,
        maxWaitTimeMs: number = 60000, // 1 minute
        pollIntervalMs: number = 1000 // 1 second
    ): Promise<MCPResponse> {
        // If the server gave us an SSE endpoint, just sit on it.
        if (this.config.sseUrl) {
            return new Promise<MCPResponse>((resolve) => {
                this.streamFromSSE((data) => {
                    if (data.status !== 'pending') resolve(data);
                }).catch((err) => {
                    logger.error(`${logEmoji.error} SSE stream failed  falling back to polling`, { err });
                    this.pollOperation(operationId, maxWaitTimeMs, pollIntervalMs).then(resolve);
                });
            });
        }

        // original behaviour (unchanged)
        return this.pollOperation(operationId, maxWaitTimeMs, pollIntervalMs);
    }

    /**
     * Fallback to the original polling logic when SSE isnt available.
     */
    private async pollOperation(
        operationId: string,
        maxWaitTimeMs: number = 60_000,
        pollIntervalMs: number = 1_000,
    ): Promise<MCPResponse> {
        const start = Date.now();

        while (Date.now() - start < maxWaitTimeMs) {
            const res = await this.checkOperationStatus(operationId);
            if (res.status !== 'pending') return res;
            await new Promise(r => setTimeout(r, pollIntervalMs));
        }

        return {
            status: 'error',
            error: {
                code: 'operation_timeout',
                message: `Operation timed out after ${maxWaitTimeMs} ms`,
            },
            operationId,
        };
    }
}

// Export a singleton instance
export const mcpClient = new MCPClient();
