import Delegator from '../models/Delegator.js'
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

/**
 * Important Notes on Delegation and Rewards:
 *
 * - Activation Epoch:
 *    The epoch when a delegation is activated.
 *
 * - Reward Beginning Epoch:
 *    Rewards start accruing one epoch after the Activation Epoch.
 *
 * - Withdrawal Implications:
 *    Upon withdrawal, the 'postBalance' will be less than the balance from the previous reward.
 *
 */

const LAMPORTS_PER_SOL = 1000000000
const START_EPOCH = parseInt(process.env.START_EPOCH)

/**
 * Initializes the function for rewards cron job.
 * @returns {Object} - A schedule job to run every day at 1am.
 */
const rewardsCron = async () => {
    logger.info('Rewards cron started')

    // Schedule a daily job to run at 1am
    return schedule.scheduleJob('0 1 * * *', async () => {
        await rewardsJob()
    })
}

/**
 * Job to populate rewards from the start epoch to the latest epoch for all delegators
 */
const rewardsJob = async () => {
    try {
        const delegators = await Delegator.find({ unstaked: false })
        const delegatorPubKeys = []

        // populate pubKeys
        delegators.forEach((delegator) => {
            delegatorPubKeys.push(delegator.delegatorId)
        })

        // finding the latest reward's epoch number
        const reward = await Reward.findOne({
            delegatorId: { $in: delegatorPubKeys },
        }).sort({ epochNum: -1, timestamp: -1 })

        // initial epoch where validator became active
        let currentEpoch = START_EPOCH
        if (reward !== null) {
            currentEpoch = reward.epochNum + 1
        }
        const latestEpoch = await fetchLatestEpoch()

        for (; currentEpoch <= latestEpoch; currentEpoch++) {
            logger.info(
                `current epoch: ${currentEpoch}, latest epoch: ${latestEpoch}`
            )
            if (currentEpoch === latestEpoch) {
                logger.info(`Reached latest Epoch: ${latestEpoch}`)
                break
            }
            const data = await getInflationReward(
                delegatorPubKeys,
                currentEpoch
            )
            if (data.result.length > 0) {
                // loop through each delegator's reward
                for (let j = 0; j < data.result.length; j++) {
                    const delegatorReward = data.result[j]
                    if (
                        !isRewardValidForEpoch(
                            delegatorReward,
                            currentEpoch,
                            delegators[j].activationEpoch,
                            delegators[j].unstakedEpoch
                        )
                    )
                        continue

                    const blockTime = await getBlockTime(
                        delegatorReward.effectiveSlot
                    )
                    const timestamp = setTimestampFormat(
                        new Date(blockTime * 1000) // seconds to milliseconds
                    )
                    const solUsd = await fetchSolanaPriceAtDate(timestamp)

                    const pubkey = delegatorPubKeys[j]

                    const redundantReward = await Reward.findOne({
                        delegatorId: pubkey,
                        timestamp,
                    })
                    if (redundantReward) {
                        await Reward.deleteOne({
                            delegatorId: pubkey,
                            timestamp,
                        })
                    }

                    // initialization of reward props
                    let {
                        reward,
                        rewardUsd,
                        totalReward,
                        totalRewardUsd,
                        pendingRewards,
                        pendingRewardsUsd,
                        postBalance,
                        postBalanceUsd,
                        stakedAmount,
                        stakedAmountUsd,
                    } = await initializeRewardData(
                        pubkey,
                        delegatorReward,
                        delegators[j].stakedAmount,
                        solUsd
                    )
                    const { epoch: epochNum } = delegatorReward

                    await Reward.create({
                        delegatorId: pubkey,
                        epochNum,
                        solUsd,
                        timestamp,
                        userAction: 'REWARD',
                        reward,
                        rewardUsd,
                        totalReward,
                        totalRewardUsd,
                        pendingRewards,
                        pendingRewardsUsd,
                        postBalance,
                        postBalanceUsd,
                        stakedAmount,
                        stakedAmountUsd,
                    })
                }
                logger.info(`processed rewards for epoch [${currentEpoch}]`)
            } else {
                logger.info(`no rewards for epoch [${currentEpoch}]`)
            }
        }
    } catch (e) {
        console.log(e)
        logger.error(`Rewards cron job failed: ${e.message}`)
        const lastReward = await Reward.findOne().sort({ epochNum: -1 }).exec()
        const data = await Reward.deleteMany({ epochNum: lastReward.epochNum })
        logger.info(`Deleted ${data.deletedCount} rewards`)
        console.info(JSON.stringify(data, null, 2))
    }
}

/**
 * Checks if the reward is valid for the specified epoch based on activation and deactivation epochs.
 * @param {RewardOfDelegation|null} delegatorReward - The reward object containing information about the delegator's reward.
 * @param {number} epoch - The current epoch number being evaluated.
 * @param {number} activationEpoch - The epoch number when the delegator's stake was activated.
 * @param {number} deactivationEpoch - The epoch number when the delegator's stake was deactivated.
 * @returns {boolean} - Returns true if the reward is valid for the specified epoch, otherwise false.
 */
const isRewardValidForEpoch = (
    delegatorReward,
    epoch,
    activationEpoch,
    deactivationEpoch
) => {
    return (
        delegatorReward !== null &&
        epoch > activationEpoch &&
        epoch < deactivationEpoch
    )
}

/**
 * Calculates the USD value of the post balance, reward, and staked amount.
 * @param {number} amount - Amount to be converted to USD.
 * @param {number} solUsd - Current value of 1 SOL in USD.
 * @returns {Object} - An object containing the USD values of the post balance, reward, and staked amount.
 */
const convertSolUsd = (amount, solUsd) => {
    return (amount / LAMPORTS_PER_SOL) * solUsd
}

/**
 * Initializes reward data for a delegator based on the reward amount and staked SOL.
 * @param {number} pubkey - The public key of the delegator.
 * @param {RewardOfDelegation} delegatorReward - The reward object containing the reward amount.
 * @param {number} stakedAmount - The amount staked in lamports.
 * @param {number} solUsd - Current value of 1 SOL in USD.
 * @returns {Object} - An object containing initialized reward data, including total days, total reward, and pending rewards in both SOL and USD.
 */
const initializeRewardData = async (
    pubkey,
    delegatorReward,
    stakedAmount,
    solUsd
) => {
    const { amount: reward, postBalance } = delegatorReward
    let totalReward = reward,
        pendingRewards = reward

    const previousReward = await Reward.findOne({
        delegatorId: pubkey,
    })
        .sort({ epochNum: -1, timestamp: -1 })
        .exec()
    if (previousReward) {
        totalReward += previousReward.totalReward
        pendingRewards += previousReward.pendingRewards
    }

    const rewardUsd = convertSolUsd(reward, solUsd)
    const totalRewardUsd = convertSolUsd(totalReward, solUsd)
    const pendingRewardsUsd = convertSolUsd(pendingRewards, solUsd)
    const postBalanceUsd = convertSolUsd(postBalance, solUsd)
    const stakedAmountUsd = convertSolUsd(stakedAmount, solUsd)

    return {
        reward,
        rewardUsd,
        totalReward,
        totalRewardUsd,
        pendingRewards,
        pendingRewardsUsd,
        postBalance,
        postBalanceUsd,
        stakedAmount,
        stakedAmountUsd,
    }
}

export default rewardsCron
