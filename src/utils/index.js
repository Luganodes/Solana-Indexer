import logger from '../logger/logger.js'
import Reward from '../models/Reward.js'
import {
    getProgramAccounts,
    getAccountInfo,
} from '../repository/network.repository.js'
import dotenv from 'dotenv'

// Load environment variables from .env file
dotenv.config()

const VALIDATOR_PUB_KEY = process.env.VALIDATOR_PUB_KEY

/**
 * Helper function to create a JSON-RPC request body.
 * @param {string} method - JSON-RPC method name.
 * @param {Array} [params] - Optional parameters for the method.
 * @returns {Object} Formatted JSON-RPC request body.
 */
export const populateBody = (method, params = null) => {
    const body = {
        jsonrpc: '2.0',
        id: 1,
        method,
    }
    if (params) {
        body.params = params
    }
    return body
}

/**
 * Sets the timestamp format to UTC 00:00:00.
 * @param {Date} currentDate - The date object to format.
 * @returns {number} The formatted timestamp in milliseconds.
 */
export const setTimestampFormat = (currentDate) => {
    try {
        currentDate.setUTCHours(0)
        currentDate.setUTCMinutes(0)
        currentDate.setUTCSeconds(0)
        currentDate.setUTCMilliseconds(0)
        return currentDate.getTime()
    } catch (e) {
        logger.error(`Failed to set timestamp format: ${e.message}`)
        throw e
    }
}

/**
 * Fetches the inflation reward for a given delegatorId and epoch.
 * @param {string} delegatorId - The public key of the delegator.
 * @param {number} epoch - The epoch number.
 * @returns {Promise<{reward: number, postBalance: number}>} The reward and post balance.
 */
const findRewards = async (delegatorId, epoch) => {
    try {
        const data = await Reward.findOne({
            delegatorId,
            epochNum: epoch,
            duplicate: false,
        })
        if (!data) return { reward: 0, postBalance: 0 }
        const { reward, postBalance } = data
        return {
            reward,
            postBalance,
        }
    } catch (e) {
        logger.error(`Failed to fetch rewards: ${e.message}`)
        throw e
    }
}

/**
 * Calculates and returns the APR value for a given delegator ID based on the rewards from the last month until the latestEpoch.
 * @param {string} delegatorId - The ID of the delegator.
 * @param {number} latestEpoch - The latest epoch number.
 * @returns {Promise<number>} The APR value.
 */
export const findAPRValue = async (delegatorId, latestEpoch) => {
    try {
        const currentDate = new Date()
        const lastMonthDate = new Date(
            currentDate.setMonth(currentDate.getMonth() - 1)
        )

        const previousRewards = await Reward.find({
            delegatorId,
            timestamp: { $gte: lastMonthDate },
        }).sort({ timestamp: 1 })

        if (!previousRewards.length) return 0
        const startEpoch = rewards[rewards.length - 1].epochNum
        const numEpochs = latestEpoch - startEpoch + 1

        const rewardsPromises = []
        for (let epoch = startEpoch; epoch < latestEpoch; epoch++) {
            rewardsPromises.push(findRewards(delegatorId, epoch))
        }
        const rewards = await Promise.all(rewardsPromises)

        let totalAmount = 0,
            totalPostBalance = 0
        rewards.forEach((reward, index) => {
            if (index !== 0) totalAmount += reward.reward
            if (index !== rewards.length - 1)
                totalPostBalance += reward.postBalance
        })

        const apr = (totalAmount / totalPostBalance) * (numEpochs * 12) * 100
        return isNaN(apr) ? 0 : apr
    } catch (e) {
        logger.error(`Failed to calculate APR value: ${e.message}`)
        throw e
    }
}

/**
 * Fetches stake information for a given public key.
 * @param {string} pubkey - The public key to fetch stake info for.
 * @returns {Promise<{pubkey: string, activationEpoch: number, deactivationEpoch: number, stake: number}|undefined>} The stake information or undefined if not found.
 */
const findStakeInfo = async (pubkey) => {
    try {
        const data = await getAccountInfo(pubkey)

        if (data && data.result) {
            const { delegation } = data.result.value.data.parsed.info.stake
            const { activationEpoch, deactivationEpoch, stake } = delegation
            return {
                pubkey,
                activationEpoch: parseInt(activationEpoch),
                deactivationEpoch: parseInt(deactivationEpoch),
                stake: parseFloat(stake),
            }
        }
    } catch (e) {
        logger.error(`Failed to fetch stake info [${pubkey}]: ${e.message}`)
        throw e
    }
}

/**
 * Fetches and returns active delegators for a given validator.
 * @param {string} [validatorId=VALIDATOR_PUB_KEY] - The public key of the validator.
 * @returns {Promise<Array>} An array of active delegators.
 */
export const findDelegators = async (validatorId = VALIDATOR_PUB_KEY) => {
    try {
        const data = await getProgramAccounts(validatorId)

        if (data && data.result) {
            const delegators = data.result.map((obj) => obj.pubkey)
            const activeDelegatorChecks = delegators.map((delegator) =>
                findStakeInfo(delegator)
            )
            const activeDelegators = (
                await Promise.all(activeDelegatorChecks)
            ).filter(Boolean)
            return activeDelegators
        }
    } catch (e) {
        logger.error(`Failed to retrieve program accounts: ${e.message}`)
        throw e
    }
}
