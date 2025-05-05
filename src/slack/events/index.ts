/**
 * Slack Event Handlers
 * 
 * This module registers event handlers for various Slack events.
 * It serves as the entry point for all event-related functionality.
 */

import { app } from '../app';
import { logger, logEmoji } from '../../utils/logger';
import { OpenRouterClient } from '../../ai/openrouter/client';
import { contextManager } from '../../ai/context/manager';
import * as conversationUtils from '../utils/conversation';
import * as blockKit from '../utils/block-kit';
import { AVAILABLE_FUNCTIONS, handleFunctionCall, formatFunctionCallResult } from '../../mcp/function-calling';
import { DEFAULT_MODEL } from '../../ai/openrouter/models';
import { FunctionCall } from '../../ai/interfaces/provider';
import { ThreadInfo } from '../utils/conversation';

// Create an instance of the OpenRouter client
const aiClient = new OpenRouterClient();

// Get the bot's user ID (will be populated after the app starts)
let botUserId: string | undefined;

// Initialize the bot user ID
app.event('app_home_opened', async ({ client }) => {
    try {
        if (!botUserId) {
            const authInfo = await client.auth.test();
            botUserId = authInfo.user_id;
            logger.info(`${logEmoji.slack} Bot user ID initialized: ${botUserId}`);
        }
    } catch (error) {
        logger.error(`${logEmoji.error} Error initializing bot user ID`, { error });
    }
});

/**
 * Process a message and generate an AI response
 * 
 * @param threadInfo Thread information
 * @param messageText Message text
 * @param client Slack client
 * @returns Promise resolving to the AI response
 */
async function processMessageAndGenerateResponse(
    threadInfo: ThreadInfo,
    messageText: string,
    client: any
): Promise<void> {
    try {
        // Send a thinking message
        const thinkingMessageTs = await conversationUtils.sendThinkingMessage(app, threadInfo);

        // Initialize context from history if needed
        if (!botUserId) {
            const authInfo = await client.auth.test();
            botUserId = authInfo.user_id || '';
            logger.info(`${logEmoji.slack} Bot user ID initialized: ${botUserId}`);
        }
        await conversationUtils.initializeContextFromHistory(app, threadInfo, botUserId || '');

        // Add the user message to the conversation context
        conversationUtils.addUserMessageToThread(threadInfo, messageText);

        // Get the conversation history
        const conversationHistory = conversationUtils.getThreadHistory(threadInfo);

        // Generate a response from the AI
        const aiResponse = await aiClient.generateResponse(
            messageText,
            conversationHistory,
            AVAILABLE_FUNCTIONS
        );

        // Handle function calls if present
        let functionResults: string[] = [];
        if (aiResponse.functionCalls && aiResponse.functionCalls.length > 0) {
            functionResults = await processFunctionCalls(aiResponse.functionCalls);
        }

        // Update the thinking message with the AI response
        await conversationUtils.updateThinkingMessageWithAIResponse(
            app,
            threadInfo,
            thinkingMessageTs,
            aiResponse.content,
            aiResponse.metadata,
            functionResults
        );
    } catch (error) {
        logger.error(`${logEmoji.error} Error processing message and generating response`, { error });
        await conversationUtils.sendErrorMessage(
            app,
            threadInfo,
            'Error Generating Response',
            'There was an error generating a response. Please try again later.',
            error instanceof Error ? error.message : String(error)
        );
    }
}

/**
 * Process function calls from the AI
 * 
 * @param functionCalls Array of function calls
 * @returns Promise resolving to an array of function results
 */
async function processFunctionCalls(functionCalls: FunctionCall[]): Promise<string[]> {
    const results: string[] = [];

    for (const functionCall of functionCalls) {
        try {
            logger.info(`${logEmoji.mcp} Processing function call: ${functionCall.name}`);

            // Execute the function call
            const result = await handleFunctionCall(functionCall);

            // Format the result
            const formattedResult = formatFunctionCallResult(functionCall.name, result);
            results.push(formattedResult);
        } catch (error) {
            logger.error(`${logEmoji.error} Error processing function call: ${functionCall.name}`, { error });
            results.push(`Error executing function ${functionCall.name}: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    return results;
}

// Handle message events
import axios from 'axios';

async function transcribeAudioWithOpenAI(fileUrl: string, prompt?: string): Promise<string> {
    // Download the file to a temp location
    const tempFilePath = `/tmp/${Date.now()}-audio-upload`;
    const writer = require('fs').createWriteStream(tempFilePath);

    // Add Slack auth header if needed
    const headers: Record<string, string> = {};
    if (process.env.SLACK_BOT_TOKEN) {
        headers['Authorization'] = `Bearer ${process.env.SLACK_BOT_TOKEN}`;
    }

    logger.info(`${logEmoji.info} Downloading audio file from Slack: ${fileUrl}`);
    const response = await axios.get(fileUrl, { responseType: 'stream', headers });
    response.data.pipe(writer);
    await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
    });

    logger.info(`${logEmoji.info} Audio file downloaded to: ${tempFilePath}`);

    // Prepare form data for OpenAI API
    const FormData = require('form-data');
    const formData = new FormData();
    formData.append('file', require('fs').createReadStream(tempFilePath));
    formData.append('model', 'gpt-4o-transcribe');
    if (prompt) {
        formData.append('prompt', prompt);
    }
    formData.append('response_format', 'text');

    logger.info(`${logEmoji.info} Sending audio file to OpenAI for transcription...`);
    // Call OpenAI API
    const openaiResponse = await axios.post(
        'https://api.openai.com/v1/audio/transcriptions',
        formData,
        {
            headers: {
                ...formData.getHeaders(),
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY}`,
            },
        }
    );

    logger.info(`${logEmoji.info} Received transcription from OpenAI`);

    // Clean up temp file
    require('fs').unlinkSync(tempFilePath);

    return openaiResponse.data.text;
}

app.message(async ({ message, client, context }) => {
    try {
        logger.debug(`${logEmoji.slack} Received message event: ${JSON.stringify(message)}`);

        // Ensure we have a proper message with a user
        if (!('user' in message) || !message.user) {
            logger.debug(`${logEmoji.slack} Ignoring message without user`);
            return;
        }

        // Ignore messages from the bot itself
        if (botUserId && message.user === botUserId) {
            return;
        }

        // Check for file uploads
        const files = (message.files && Array.isArray(message.files)) ? message.files : [];
        let transcript: string | undefined;
        let postedTranscript = false;

        if (files.length > 0) {
            // Only process audio files
            const audioFile = files.find((f: any) =>
                ['mp3', 'mp4', 'mpeg', 'mpga', 'm4a', 'wav', 'webm'].includes((f.filetype || '').toLowerCase())
            );
            if (audioFile && audioFile.url_private_download) {
                // Download and transcribe
                const fileUrl = audioFile.url_private_download;
                // Use the user's message as prompt if present
                const userPrompt = message.text || undefined;
                logger.info(`${logEmoji.info} Starting transcription for uploaded audio file: ${fileUrl}`);
                transcript = await transcribeAudioWithOpenAI(fileUrl, userPrompt);

                // Post the raw transcript in a code block
                const threadInfo: ThreadInfo = {
                    channelId: message.channel,
                    threadTs: 'thread_ts' in message && message.thread_ts ? message.thread_ts : message.ts,
                    userId: message.user,
                };
                logger.info(`${logEmoji.info} Posting transcript to Slack thread ${threadInfo.threadTs}`);
                await client.chat.postMessage({
                    channel: threadInfo.channelId,
                    thread_ts: threadInfo.threadTs,
                    text: `Transcript:\n\`\`\`\n${transcript}\n\`\`\``,
                });
                postedTranscript = true;

                // Only for DMs and "wiz" channels, also send transcript+user message to the AI model
                let shouldRespond = false;
                let isWizChannel = false;
                if (message.channel_type === 'im') {
                    shouldRespond = true;
                } else if (message.channel_type === 'channel' || message.channel_type === 'group') {
                    try {
                        const channelInfo = await client.conversations.info({ channel: message.channel });
                        const channelName = channelInfo.channel?.name || '';
                        if (channelName.startsWith('wiz')) {
                            shouldRespond = true;
                            isWizChannel = true;
                        }
                    } catch (err) {
                        logger.error(`${logEmoji.error} Failed to fetch channel info for channel ${message.channel}`, { err });
                    }
                }

                if (shouldRespond) {
                    // Compose input: transcript + user message (if any)
                    let aiInput = transcript;
                    if (message.text && message.text.trim()) {
                        aiInput = `${transcript}\n\nUser message: ${message.text}`;
                    }
                    logger.info(`${logEmoji.info} Sending transcript and user message to AI model for thread ${threadInfo.threadTs}`);
                    await processMessageAndGenerateResponse(threadInfo, aiInput, client);
                } else {
                    logger.info(`${logEmoji.info} Not sending transcript to AI model (not a DM or wiz channel)`);
                }
                // For non-wiz channels and non-DMs, do not send to AI, only post transcript
                return;
            }
        }

        // Only respond in DMs or if channel name starts with "wiz"
        let shouldRespond = false;
        if (message.channel_type === 'im') {
            shouldRespond = true;
        } else if (message.channel_type === 'channel' || message.channel_type === 'group') {
            try {
                const channelInfo = await client.conversations.info({ channel: message.channel });
                const channelName = channelInfo.channel?.name || '';
                if (channelName.startsWith('wiz')) {
                    shouldRespond = true;
                }
            } catch (err) {
                logger.error(`${logEmoji.error} Failed to fetch channel info for channel ${message.channel}`, { err });
            }
        }

        if (!shouldRespond) {
            logger.debug(`${logEmoji.slack} Not responding: not a DM and channel name does not start with "wiz"`);
            return;
        }

        // Only process text if not already handled as audio
        if (!postedTranscript && message.text) {
            const threadInfo: ThreadInfo = {
                channelId: message.channel,
                threadTs: 'thread_ts' in message && message.thread_ts ? message.thread_ts : message.ts,
                userId: message.user,
            };
            await processMessageAndGenerateResponse(threadInfo, message.text, client);
        }
    } catch (error) {
        logger.error(`${logEmoji.error} Error handling message event`, { error });
    }
});

// Handle app_mention events
app.event('app_mention', async ({ event, client }) => {
    try {
        logger.debug(`${logEmoji.slack} Received app_mention event: ${JSON.stringify(event)}`);

        // Create thread info
        const threadInfo: ThreadInfo = {
            channelId: event.channel,
            threadTs: 'thread_ts' in event && event.thread_ts ? event.thread_ts : event.ts,
            userId: event.user,
        };

        // Process the message and generate a response
        await processMessageAndGenerateResponse(threadInfo, event.text, client);
    } catch (error) {
        logger.error(`${logEmoji.error} Error handling app_mention event`, { error });
    }
});

// Handle assistant_thread_started events
app.event('assistant_thread_started', async ({ event, client }) => {
    try {
        logger.debug(`${logEmoji.slack} Received assistant_thread_started event: ${JSON.stringify(event)}`);

        // Type assertion for the event object to handle potential structure variations
        const assistantEvent = event as any;
        const channelId = assistantEvent.channel || '';
        const threadTs = assistantEvent.ts || '';
        const userId = assistantEvent.user || '';

        if (!channelId || !threadTs) {
            logger.warn(`${logEmoji.warning} Missing channel or thread info in assistant_thread_started event`);
            return;
        }

        // Create thread info
        const threadInfo: ThreadInfo = {
            channelId,
            threadTs,
            userId,
        };

        // Create a new context for this thread
        contextManager.createContext(threadTs, channelId, userId);

        // Send a welcome message
        await client.chat.postMessage({
            channel: channelId,
            thread_ts: threadTs,
            ...blockKit.aiResponseMessage(
                "Hello! I'm your AI assistant. How can I help you today?"
            )
        });
    } catch (error) {
        logger.error(`${logEmoji.error} Error handling assistant_thread_started event`, { error });
    }
});

// Handle assistant_thread_context_changed events
app.event('assistant_thread_context_changed', async ({ event }) => {
    try {
        logger.debug(`${logEmoji.slack} Received assistant_thread_context_changed event: ${JSON.stringify(event)}`);

        // Type assertion for the event object
        const contextEvent = event as any;
        const channelId = contextEvent.channel || '';
        const threadTs = contextEvent.thread_ts || '';
        const contextPayload = contextEvent.context_payload;

        if (!channelId || !threadTs) {
            logger.warn(`${logEmoji.warning} Missing channel or thread info in assistant_thread_context_changed event`);
            return;
        }

        // Update the system message if context payload is provided
        if (contextPayload && typeof contextPayload === 'string') {
            conversationUtils.updateSystemMessageForThread(
                { channelId, threadTs },
                contextPayload
            );
            logger.info(`${logEmoji.slack} Updated system message for thread ${threadTs} with new context`);
        }
    } catch (error) {
        logger.error(`${logEmoji.error} Error handling assistant_thread_context_changed event`, { error });
    }
});

logger.info(`${logEmoji.slack} Slack event handlers registered`);
