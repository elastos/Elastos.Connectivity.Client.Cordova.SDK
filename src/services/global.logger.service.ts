import type { ILogger } from "../interfaces";
import { DefaultLogger } from "../internal/defaultlogger";
import { getGlobalSingleton } from "../singleton";

class GlobalLoggerService {
    public logger: ILogger = new DefaultLogger();

    constructor() {}

    /**
     * Overrides the default console logger with a custom logger.
     */
    public setLoggerLayer(logger: ILogger) {
        this.logger = logger;
    }

    log(...args: any) {
        this.logger.log.apply(this.logger, args);
    }

    warn(...args: any) {
        this.logger.warn.apply(this.logger, args);
    }

    error(...args: any) {
        this.logger.error.apply(this.logger, args);
    }
}

export const globalLoggerService = getGlobalSingleton<GlobalLoggerService>("logger", ()=>new GlobalLoggerService());

