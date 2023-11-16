import Delegator from '../models/Delegator.js'
import schedule from 'node-schedule'
import { fetchLatestEpoch } from '../repository/network.repository.js'
import { findAPRValue, findDelegators } from '../utils/index.js'
import { createDelegateTransaction } from './utils.js'
import logger from '../logger/logger.js'
import Transaction from '../models/Transaction.js'

/**
 * Scheduled job to manage delegators.
 */
const delegatorCron = async () => {
    logger.info('Delegator cron started')

    // Schedule a job to run every 30 minutes
    return schedule.scheduleJob('*/30 * * * *', async () => {
        await delegatorJob()
    })
}

/**
 * Job to create new delegators and update already populated ones.
 */
const delegatorJob = async () => {
    try {
        const delegators = await findDelegators()
        const latestEpoch = await fetchLatestEpoch()
        console.table(delegators)

        // Loop over each delegator create or update their entry
        for (const delegator of delegators) {
            await processDelegator(delegator, latestEpoch)
        }
        await processUnstaking(delegators, latestEpoch)

        logger.info('Delegator cron job successfully executed')
    } catch (e) {
        logger.error(
            `Delegator cron job failed [${new Date().getTime()}]: ${e.message}`
        )
    }
}

/**
 * Process individual delegator.
 */
const processDelegator = async (delegator, latestEpoch) => {
    const { pubkey, activationEpoch, deactivationEpoch, stake } = delegator

    const storedDelegator = await Delegator.findOne({
        delegatorId: pubkey,
    })

    if (!storedDelegator) {
        const unstaked = latestEpoch >= deactivationEpoch
        const apr = unstaked ? 0 : await findAPRValue(pubkey, latestEpoch)
        await Delegator.create({
            delegatorId: pubkey,
            timestamp: new Date().getTime(),
            unstaked,
            apr,
            stakedAmount: stake,
            activationEpoch,
            unstakedEpoch: deactivationEpoch,
        })

        logger.info(`Created delegator: ${pubkey}`)
        await createDelegateTransaction(pubkey, stake)
        return
    }

    if (!(await Transaction.findOne({ delegatorId: pubkey })))
        await createDelegateTransaction(pubkey, stake)

    if (latestEpoch > deactivationEpoch) {
        if (
            storedDelegator.unstaked &&
            storedDelegator.unstakedEpoch === deactivationEpoch
        )
            return
        storedDelegator.unstaked = true
        storedDelegator.unstakedEpoch = deactivationEpoch
        await storedDelegator.save()

        logger.info(`Unstaked delegator: ${pubkey}`)
        return
    }

    const apr = await findAPRValue(pubkey, latestEpoch)
    storedDelegator.apr = apr
    await storedDelegator.save()
    logger.info(`APR updated for delegator: ${pubkey}`)
}

/**
 * Handle unstaking based on epoch conditions.
 */
const processUnstaking = async (delegators, latestEpoch) => {
    const delegatorPubKeys = delegators.map((delegator) => delegator.pubkey)

    await Delegator.updateMany(
        { delegatorId: { $nin: delegatorPubKeys } },
        {
            unstaked: true,
            unstakedTimestamp: new Date().getTime(),
            unstakedEpoch: latestEpoch - 1,
        }
    )
    logger.info(`Unstaking processed for delegators removed from the API`)
}

export default delegatorCron
