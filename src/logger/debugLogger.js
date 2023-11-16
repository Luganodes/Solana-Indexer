import { createLogger, format, transports } from 'winston'
const { combine, timestamp, colorize } = format
import { getFileAndLineNumber, consoleFormat, fileFormat } from './utils.js'

class DebugLogger {
    constructor() {
        this.logger = this.initLogger()
    }

    initLogger() {
        return createLogger({
            level: 'debug',
            format: combine(
                timestamp({ format: 'YYYY-MM-DD HH:mm:ss [UTC]Z' }),
                fileFormat
            ),
            transports: [
                new transports.Console({
                    format: combine(colorize(), consoleFormat),
                }),
                new transports.File({
                    filename: 'combined.log',
                    level: 'info',
                }),
                new transports.File({ filename: 'error.log', level: 'error' }),
            ],
        })
    }

    debug(message) {
        const fileInfo = getFileAndLineNumber()
        this.logger.debug(message, { meta: fileInfo })
    }

    info(message) {
        const fileInfo = getFileAndLineNumber()
        this.logger.info(message, { meta: fileInfo })
    }

    error(message) {
        const fileInfo = getFileAndLineNumber()
        this.logger.error(message, { meta: fileInfo })
    }
}

export default DebugLogger
