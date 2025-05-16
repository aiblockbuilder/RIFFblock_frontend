// Define log levels
type LogLevel = "debug" | "info" | "warn" | "error"

// Logger configuration
const config = {
    level: process.env.NODE_ENV === "production" ? "info" : "debug",
    enableConsole: true,
}

// Logger implementation
class Logger {
    private static instance: Logger
    private logLevel: { [key in LogLevel]: number } = {
        debug: 0,
        info: 1,
        warn: 2,
        error: 3,
    }

    private constructor() { }

    public static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger()
        }
        return Logger.instance
    }

    private shouldLog(level: LogLevel): boolean {
        return config.enableConsole && this.logLevel[level] >= this.logLevel[config.level as LogLevel]
    }

    private formatMessage(message: string, data?: any): string {
        return data ? `${message} ${JSON.stringify(data)}` : message
    }

    public debug(message: string, data?: any): void {
        if (this.shouldLog("debug")) {
            console.debug(`[DEBUG] ${this.formatMessage(message, data)}`)
        }
    }

    public info(message: string, data?: any): void {
        if (this.shouldLog("info")) {
            console.info(`[INFO] ${this.formatMessage(message, data)}`)
        }
    }

    public warn(message: string, data?: any): void {
        if (this.shouldLog("warn")) {
            console.warn(`[WARN] ${this.formatMessage(message, data)}`)
        }
    }

    public error(message: string, error?: any): void {
        if (this.shouldLog("error")) {
            console.error(`[ERROR] ${message}`, error || "")
        }
    }

    public group(name: string): void {
        if (config.enableConsole) {
            console.group(name)
        }
    }

    public groupEnd(): void {
        if (config.enableConsole) {
            console.groupEnd()
        }
    }

    public time(label: string): void {
        if (config.enableConsole) {
            console.time(label)
        }
    }

    public timeEnd(label: string): void {
        if (config.enableConsole) {
            console.timeEnd(label)
        }
    }
}

export const logger = Logger.getInstance()
