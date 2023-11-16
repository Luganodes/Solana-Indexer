import Transaction from '../models/Transaction.js'
import logger from '../logger/logger.js'
import {
    fetchSolanaPriceAtDate,
    getTransaction,
    getSignaturesForAddress,
} from '../repository/network.repository.js'

const VALIDATOR_PUB_KEY = process.env.VALIDATOR_PUB_KEY
const LAMPORTS_PER_SOL = 1000000000

/**
 * Create and persist a delegate transaction
 * @param {string} address - The delegator's public key
 * @param {number} stakedAmount - The amount of SOL the user staked
 */
export const createDelegateTransaction = async (address, stakedAmount) => {
    try {
        const data = await getSignaturesForAddress(address)
        const transactionSignatures = data.result

        for (const signature of transactionSignatures) {
            const transactionData = await getTransaction(signature.signature)
            if (!transactionData.result) continue
            const result =
                transactionData.result.transaction.message.accountKeys.filter(
                    (key) => key === VALIDATOR_PUB_KEY
                )

            if (result.length > 0) {
                const solUsd = await fetchSolanaPriceAtDate(
                    transactionData.result.blockTime * 1000
                )
                const transactionFee =
                    transactionData.result.meta.fee / LAMPORTS_PER_SOL

                await Transaction.create({
                    delegatorId: address,
                    timestamp: transactionData.result.blockTime * 1000,
                    type: 'STAKE',
                    amount: stakedAmount,
                    solUsd,
                    fee: transactionFee,
                    transactionHash: signature.signature,
                    transactionCount: transactionSignatures.length,
                })
                logger.info(`Transaction created [${address}]`)
            }
        }
    } catch (e) {
        logger.error(
            `Error creating delegate transaction [${address}]: ${e.message}`
        )
    }
}
