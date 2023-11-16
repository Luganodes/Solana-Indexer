import DebugLogger from './debugLogger.js'
import ProductionLogger from './productionLogger.js'
import dotenv from 'dotenv'

dotenv.config()

const logger =
    process.env.NODE_ENV !== 'production'
        ? new DebugLogger()
        : new ProductionLogger()

export default logger
