/**
 * Environment Configuration
 * 
 * This module loads and validates environment variables required for the application.
 * It uses dotenv to load variables from the .env file and provides a type-safe way
 * to access them throughout the application.
 */

import dotenv from 'dotenv';
import { logger } from '../utils/logger';

export interface EnvironmentVariables {
    // Slack
    SLACK_BOT_TOKEN: string;
    SLACK_SIGNING_SECRET: string;
    SLACK_APP_TOKEN: string;

    // OpenAI
    OPENAI_API_KEY: string;

    // MCP
    MCP_SERVER_URL: string;
    MCP_AUTH_TOKEN: string;
    /**
     * Optional: base URL for an SSE-style MCP (e.g.
     * https://primary-nj0x-production.up.railway.app/mcp/)
     */
    MCP_SSE_URL?: string;

    // Python Agent API
    PY_AGENT_URL: string;

    // App Configuration
    NODE_ENV: 'development' | 'production' | 'test';
    LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error';
}

const DEFAULT_ENV = {
    NODE_ENV: 'development',
    LOG_LEVEL: 'info',
} as const;

const REQUIRED_ENV_VARS = [
    'SLACK_BOT_TOKEN',
    'SLACK_SIGNING_SECRET',
    'SLACK_APP_TOKEN',
    'PY_AGENT_URL',
];

/**
 * Load environment variables from .env file and validate required variables
 */
export function loadEnvironment(): EnvironmentVariables {
    // Load environment variables from .env file
    dotenv.config();

    // Check for required environment variables
    const missingVars = REQUIRED_ENV_VARS.filter(
        (name) => !process.env[name]
    );

    if (missingVars.length > 0) {
        const errorMessage = `Missing required environment variables: ${missingVars.join(', ')}`;
        logger.error(errorMessage);
        throw new Error(errorMessage);
    }

    // Return environment variables with defaults for optional ones
    return {
        // Slack
        SLACK_BOT_TOKEN: process.env.SLACK_BOT_TOKEN!,
        SLACK_SIGNING_SECRET: process.env.SLACK_SIGNING_SECRET!,
        SLACK_APP_TOKEN: process.env.SLACK_APP_TOKEN!,

        // OpenAI
        OPENAI_API_KEY: process.env.OPENAI_API_KEY!,

        // MCP
        MCP_SERVER_URL: process.env.MCP_SERVER_URL || 'http://localhost:3000',
        MCP_AUTH_TOKEN: process.env.MCP_AUTH_TOKEN || '',
        // new  leave undefined if you dont use SSE
        MCP_SSE_URL: process.env.MCP_SSE_URL,

        // Python Agent API
        PY_AGENT_URL: process.env.PY_AGENT_URL!,

        // App Configuration
        NODE_ENV: (process.env.NODE_ENV as EnvironmentVariables['NODE_ENV']) || DEFAULT_ENV.NODE_ENV,
        LOG_LEVEL: (process.env.LOG_LEVEL as EnvironmentVariables['LOG_LEVEL']) || DEFAULT_ENV.LOG_LEVEL,
    };
}

// Export singleton instance of environment variables
export const env = loadEnvironment();
