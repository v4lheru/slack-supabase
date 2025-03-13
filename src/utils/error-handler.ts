/**
 * Error Handler
 * 
 * This module provides centralized error handling for the application.
 * It defines custom error types, error handling utilities, and error reporting.
 */

import { logger, logEmoji } from './logger';

/**
 * Custom error types
 */
export enum ErrorType {
    VALIDATION = 'VALIDATION_ERROR',
    AUTHENTICATION = 'AUTHENTICATION_ERROR',
    AUTHORIZATION = 'AUTHORIZATION_ERROR',
    NOT_FOUND = 'NOT_FOUND_ERROR',
    RATE_LIMIT = 'RATE_LIMIT_ERROR',
    TIMEOUT = 'TIMEOUT_ERROR',
    EXTERNAL_API = 'EXTERNAL_API_ERROR',
    INTERNAL = 'INTERNAL_ERROR',
    UNKNOWN = 'UNKNOWN_ERROR',
}

/**
 * Custom application error
 */
export class AppError extends Error {
    public readonly type: ErrorType;
    public readonly statusCode: number;
    public readonly isOperational: boolean;
    public readonly context?: Record<string, any>;

    /**
     * Create a new application error
     * 
     * @param message Error message
     * @param type Error type
     * @param statusCode HTTP status code
     * @param isOperational Whether the error is operational
     * @param context Additional context for the error
     */
    constructor(
        message: string,
        type: ErrorType = ErrorType.UNKNOWN,
        statusCode: number = 500,
        isOperational: boolean = true,
        context?: Record<string, any>
    ) {
        super(message);
        this.name = this.constructor.name;
        this.type = type;
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.context = context;

        // Capture stack trace
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Validation error
 */
export class ValidationError extends AppError {
    constructor(message: string, context?: Record<string, any>) {
        super(message, ErrorType.VALIDATION, 400, true, context);
    }
}

/**
 * Authentication error
 */
export class AuthenticationError extends AppError {
    constructor(message: string, context?: Record<string, any>) {
        super(message, ErrorType.AUTHENTICATION, 401, true, context);
    }
}

/**
 * Authorization error
 */
export class AuthorizationError extends AppError {
    constructor(message: string, context?: Record<string, any>) {
        super(message, ErrorType.AUTHORIZATION, 403, true, context);
    }
}

/**
 * Not found error
 */
export class NotFoundError extends AppError {
    constructor(message: string, context?: Record<string, any>) {
        super(message, ErrorType.NOT_FOUND, 404, true, context);
    }
}

/**
 * Rate limit error
 */
export class RateLimitError extends AppError {
    constructor(message: string, context?: Record<string, any>) {
        super(message, ErrorType.RATE_LIMIT, 429, true, context);
    }
}

/**
 * Timeout error
 */
export class TimeoutError extends AppError {
    constructor(message: string, context?: Record<string, any>) {
        super(message, ErrorType.TIMEOUT, 408, true, context);
    }
}

/**
 * External API error
 */
export class ExternalApiError extends AppError {
    constructor(message: string, context?: Record<string, any>) {
        super(message, ErrorType.EXTERNAL_API, 502, true, context);
    }
}

/**
 * Internal error
 */
export class InternalError extends AppError {
    constructor(message: string, context?: Record<string, any>) {
        super(message, ErrorType.INTERNAL, 500, false, context);
    }
}

/**
 * Handle an error
 * 
 * @param error The error to handle
 * @param source The source of the error
 * @returns Formatted error object
 */
export function handleError(error: any, source: string = 'app'): Record<string, any> {
    try {
        // If the error is already an AppError, use it directly
        if (error instanceof AppError) {
            logError(error, source);
            return formatError(error);
        }

        // If the error is from an external API, wrap it in an ExternalApiError
        if (source.includes('api') || source.includes('external')) {
            const apiError = new ExternalApiError(
                error.message || 'External API error',
                { originalError: error }
            );
            logError(apiError, source);
            return formatError(apiError);
        }

        // Otherwise, wrap it in an InternalError
        const internalError = new InternalError(
            error.message || 'Internal server error',
            { originalError: error }
        );
        logError(internalError, source);
        return formatError(internalError);
    } catch (e) {
        // If error handling itself fails, log and return a generic error
        logger.error(`${logEmoji.error} Error in error handler`, { error: e });
        return {
            error: {
                type: ErrorType.UNKNOWN,
                message: 'An unknown error occurred',
                statusCode: 500,
            },
        };
    }
}

/**
 * Log an error
 * 
 * @param error The error to log
 * @param source The source of the error
 */
export function logError(error: AppError | Error, source: string = 'app'): void {
    const errorContext = error instanceof AppError ? error.context : undefined;
    const errorType = error instanceof AppError ? error.type : ErrorType.UNKNOWN;
    const statusCode = error instanceof AppError ? error.statusCode : 500;
    const isOperational = error instanceof AppError ? error.isOperational : false;

    logger.error(`${logEmoji.error} [${source}] ${error.message}`, {
        errorType,
        statusCode,
        isOperational,
        stack: error.stack,
        ...errorContext,
    });
}

/**
 * Format an error for response
 * 
 * @param error The error to format
 * @returns Formatted error object
 */
export function formatError(error: AppError): Record<string, any> {
    return {
        error: {
            type: error.type,
            message: error.message,
            statusCode: error.statusCode,
            ...(error.context ? { context: error.context } : {}),
        },
    };
}

/**
 * Create a user-friendly error message
 * 
 * @param error The error to format
 * @returns User-friendly error message
 */
export function getUserFriendlyErrorMessage(error: AppError | Error): string {
    if (error instanceof ValidationError) {
        return `Invalid input: ${error.message}`;
    }

    if (error instanceof AuthenticationError) {
        return 'Authentication failed. Please sign in again.';
    }

    if (error instanceof AuthorizationError) {
        return 'You do not have permission to perform this action.';
    }

    if (error instanceof NotFoundError) {
        return `Not found: ${error.message}`;
    }

    if (error instanceof RateLimitError) {
        return 'Too many requests. Please try again later.';
    }

    if (error instanceof TimeoutError) {
        return 'The request timed out. Please try again.';
    }

    if (error instanceof ExternalApiError) {
        return 'There was an error communicating with an external service. Please try again later.';
    }

    // For internal errors or unknown errors, don't expose details
    return 'Something went wrong. Please try again later.';
}
