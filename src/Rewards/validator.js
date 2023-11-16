import Reward from '../models/Reward.js'
import { setTimestampFormat } from '../utils/index.js'
import schedule from 'node-schedule'
import {
    getBlockTime,
    fetchLatestEpoch,
    getInflationReward,
    fetchSolanaPriceAtDate,
} from '../repository/network.repository.js'
import logger from '../logger/logger.js'
import dotenv from 'dotenv'

// Load environment variables from .env file
dotenv.config()

const LAMPORTS_PER_SOL = 1000000000

const VALIDATOR_PUB_KEY = process.env.VALIDATOR_PUB_KEY
const VALIDATOR_ID = process.env.VALIDATOR_ID
const START_EPOCH = parseInt(process.env.START_EPOCH)

/**
 * Initializes the function for rewards cron job.
 * @returns {Object} - A schedule job to run every day at 1am.
 */
const validatorRewardsCron = async () => {
    logger.info('Validator rewards cron started')

    // Schedule a daily job to run at 1am
    return schedule.scheduleJob('0 1 * * *', async () => {
        await validatorRewardsJob()
    })
}

/**
 * Job to populate validator rewards from the start epoch to the latest epoch
 */
const validatorRewardsJob = async () => {
    try {
        // Get the latest validator reward's epoch number
        const latestReward = await Reward.findOne({
            delegatorId: VALIDATOR_ID,
        }).sort({ epochNum: -1, timestamp: -1 })

        // Set initial epoch to the epoch where validator became active
        let currentEpoch = START_EPOCH
        if (latestReward) {
            currentEpoch = latestReward.epochNum + 1
        }
        // Get the latest epoch info
        const latestEpoch = await fetchLatestEpoch()

        // Loop through all epochs starting from the current one
        for (; currentEpoch <= latestEpoch; currentEpoch++) {
            if (latestEpoch === currentEpoch) {
                logger.info(`Reached latest Epoch: ${latestEpoch}`)
                break
            }
            // Fetch the validator's reward for the specific epoch
            const data = await getInflationReward(
                [VALIDATOR_PUB_KEY],
                currentEpoch
            )
            const rewards = data.result[0]
            if (rewards) {
                await processReward(rewards, currentEpoch)
            } else {
                logger.info('no rewards for epoch:', currentEpoch)
            }
        }
    } catch (e) {
        logger.error(`Validator rewards cron job failed: ${e.message}`)
    }
}

/**
 * Processes reward information and stores it in the database.
 * @param {Object} rewards - The reward object containing information about rewards.
 * @param {number} rewards.effectiveSlot - The effective slot number for the reward.
 * @param {number} rewards.amount - The amount of the reward in lamports.
 * @param {number} rewards.postBalance - The post balance in lamports after receiving the reward.
 * @param {number} rewards.epoch - The epoch number for the reward.
 * @param {number} epoch - The epoch number being processed.
 * @returns {Promise<void>} A promise that resolves once the reward has been processed.
 */
const processReward = async (rewards, epoch) => {
    const blockTime = await getBlockTime(rewards.effectiveSlot)
    const timestamp = setTimestampFormat(
        new Date(blockTime * 1000) // convert to milliseconds
    )
    const solUsd = await fetchSolanaPriceAtDate(timestamp)

    const { postBalance } = rewards
    const postBalanceUsd = (postBalance / LAMPORTS_PER_SOL) * solUsd

    const reward = rewards.amount
    const rewardUsd = (rewards.amount / LAMPORTS_PER_SOL) * solUsd

    let totalReward = rewards.amount
    let pendingRewards = rewards.amount

    // Get the previous reward
    const previousReward = await Reward.findOne({
        delegatorId: VALIDATOR_ID,
    })
        .sort({ timestamp: -1 })
        .exec()
    // If previous reward exists, add it to the current reward
    if (previousReward) {
        totalReward += previousReward.totalReward
        pendingRewards += previousReward.pendingRewards
    }
    const totalRewardUsd = (totalReward / LAMPORTS_PER_SOL) * solUsd
    const pendingRewardsUsd = (pendingRewards / LAMPORTS_PER_SOL) * solUsd

    await Reward.create({
        delegatorId: VALIDATOR_ID,
        epochNum: rewards.epoch,
        solUsd,
        timestamp,
        postBalance,
        postBalanceUsd,
        userAction: 'REWARD',
        reward,
        rewardUsd,
        totalReward,
        totalRewardUsd,
        pendingRewards,
        pendingRewardsUsd,
        stakedAmount: -1,
        stakedAmountUsd: -1,
    })

    logger.info(`processed reward for epoch [${epoch}]`)
}

export default validatorRewardsCron
