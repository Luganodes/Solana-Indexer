import { connectDB } from './config/db.js'
import delegatorCron from './Delegator/delegatorCron.js'
import rewardsCron from './Rewards/index.js'
import validatorRewardsCron from './Rewards/validator.js'
import logger from './logger/logger.js'

/**
 * Initialize and run essential services.
 */
const cronHandles = []
const main = async () => {
    try {
        // Connect to the database
        await connectDB()

        // Start necessary cron jobs
        cronHandles.push(await delegatorCron())
        cronHandles.push(await validatorRewardsCron())
        cronHandles.push(await rewardsCron())
    } catch (e) {
        logger.error(`Error in main initialization: ${e}`)
    }
}

main()

process.on('SIGINT', async () => {
    try {
        for (const handle of cronHandles) {
            await handle.cancel()
            logger.info('Cron job successfully cancelled.')
        }
        // eslint-disable-next-line no-process-exit
        process.exit(0)
    } catch (e) {
        logger.error(`Error during graceful shutdown: ${e}`)
        // eslint-disable-next-line no-process-exit
        process.exit(1) // Exit with an error code
    }
})
