import Reward from '../models/Reward.js'
import logger from '../logger/logger.js'
import { fetchSolanaPriceAtDate } from '../repository/network.repository.js'

/**
 * Populate the solUsd field in all Reward model instances
 */
export const populateSolUsd = async () => {
    try {
        // Fetch all rewards from the database
        const rewards = await Reward.find()

        // Loop through each reward to populate solUsd
        for (let i = 0; i < rewards.length; i++) {
            // Introduce a delay of 1 second to avoid rate limiting
            await new Promise((resolve) => setTimeout(resolve, 1000))

            // Fetch the current SOL to USD conversion rate
            const solUsd = await fetchSolanaPriceAtDate(rewards[i].timestamp)

            // Update the solUsd field for the current reward
            rewards[i].solUsd = solUsd
            await rewards[i].save()

            logger.info(
                `Successfully updated solUsd for reward ID: ${rewards[i]._id}`
            )
        }

        logger.info('SOL-USD population task is DONE.')
    } catch (e) {
        logger.error(`An error occurred while populating SOL-USD: ${e.message}`)
    }
}
