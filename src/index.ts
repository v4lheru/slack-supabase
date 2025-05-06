/**
 * Multi-Provider AI Slack Bot with MCP Integration
 * Main Entry Point
 * 
 * This file initializes the Slack bot application, sets up error handling,
 * and starts the bot listening for events.
 */

import { app } from './slack/app';
import { logger, logEmoji } from './utils/logger';
import { loadEnvironment, env } from './config/environment';
import { PythonAgentClient } from './ai/agent-api/client';
import { contextManager } from './ai/context/manager';

// Import event handlers
import './slack/events';

// Load environment variables
loadEnvironment();

// Initialize components
async function initializeComponents() {
    try {
        logger.info(`${logEmoji.info} Initializing application components...`);

        // Verify environment variables
        if (!env.SLACK_BOT_TOKEN || !env.SLACK_SIGNING_SECRET || !env.SLACK_APP_TOKEN) {
            throw new Error('Missing required Slack environment variables');
        }

        if (!env.PY_AGENT_URL) {
            throw new Error('Missing required Python Agent API URL');
        }

        // Initialize AI client
        const aiClient = new PythonAgentClient();
        const models = await aiClient.getAvailableModels();
        logger.info(`${logEmoji.ai} AI client initialized with ${models.length} available models`);

        // Initialize context manager
        logger.info(`${logEmoji.ai} Context manager initialized with capacity for ${contextManager.getContextCount()} contexts`);

        logger.info(`${logEmoji.info} All components initialized successfully`);
        return true;
    } catch (error) {
        logger.error(`${logEmoji.error} Error initializing components`, { error });
        throw error;
    }
}

// Start the app
(async () => {
    try {
        // Initialize components
        await initializeComponents();

        // Start the Slack app
        const port = Number(process.env.PORT) || 3000;
        await app.start(port);
        logger.info(`${logEmoji.info} ⚡️ Multi-Provider AI Slack Bot is running on port ${port}!`);
        logger.info(`${logEmoji.info} Environment: ${env.NODE_ENV}`);
        logger.info(`${logEmoji.info} Log level: ${env.LOG_LEVEL}`);
    } catch (error) {
        logger.error(`${logEmoji.error} Unable to start app`, { error });
        process.exit(1);
    }
})();

// Handle graceful shutdown
const gracefulShutdown = async () => {
    logger.info(`${logEmoji.info} Shutting down gracefully...`);
    try {
        // Perform cleanup tasks
        logger.info(`${logEmoji.info} Cleaning up resources...`);

        // Stop the Slack app
        await app.stop();
        logger.info(`${logEmoji.info} Slack app stopped successfully`);

        // Log final stats
        logger.info(`${logEmoji.ai} Final context count: ${contextManager.getContextCount()}`);

        logger.info(`${logEmoji.info} Shutdown complete`);
        process.exit(0);
    } catch (error) {
        logger.error(`${logEmoji.error} Error during shutdown`, { error });
        process.exit(1);
    }
};

// Listen for termination signals
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
process.on('uncaughtException', (error) => {
    logger.error(`${logEmoji.error} Uncaught exception`, { error });
    gracefulShutdown();
});
process.on('unhandledRejection', (reason) => {
    logger.error(`${logEmoji.error} Unhandled rejection`, { reason });
});

// Log startup
logger.info(`${logEmoji.info} Multi-Provider AI Slack Bot starting up...`);
