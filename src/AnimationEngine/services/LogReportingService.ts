export enum LogLevel {
    INFO = 'info',
    WARN = 'warn',
    ERROR = 'error',
    FATAL = `error`
}


interface LogContext {
    module?: string;
    functionName?: string;
    additionalData?: any;
}

class LogReportingService {
    private _IS_PRODUCTION: boolean;

    constructor(isProduction: boolean = false) {
        this._IS_PRODUCTION = isProduction;
    }


    log(level: LogLevel, message: string, context?: LogContext): void {
        const logMessage = `VXEngine ${context?.module && context.module}: ${message}`
        const logEntry = {
            context
        };

        // For development, you might want to log to the console:
        // if (!this._IS_PRODUCTION) {
        // }
        console[level](`${logMessage}`, context && logEntry);

        

        // In production, you might send this log entry to a remote logging service
        // For example, using fetch or a library like Sentry:
        // this.sendToRemoteService(logEntry);
    }

    logInfo(message: string, context?: LogContext): void {
        this.log(LogLevel.INFO, message, context);
    }

    logWarning(message: string, context?: LogContext): void {
        this.log(LogLevel.WARN, message, context);
    }

    logError(error: Error | string, context?: LogContext): void {
        const message = typeof error === 'string' ? error : error.message;
        this.log(LogLevel.ERROR, message, context);
    }

    logFatal(error: Error | string, context?: LogContext): never {
        const message = typeof error === 'string' ? error : error.message;
        this.log(LogLevel.FATAL, message, context);

        throw new Error(message);
    }


    // private async sendToRemoteService(logEntry: any): Promise<void> {
    //     // Example using fetch:
    //     try {
    //         await fetch('https://your-logging-endpoint.com/logs', {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //             },
    //             body: JSON.stringify(logEntry),
    //         });
    //     } catch (sendError) {
    //         console.error('Failed to send log entry to remote service', sendError);
    //     }
    // }
}

export const logReportingService = new LogReportingService;