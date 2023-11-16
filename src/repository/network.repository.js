import request from '../config/axiosInstance.js'
import { populateBody } from '../utils/index.js'
import logger from '../logger/logger.js'
import dotenv from 'dotenv'

// Load environment variables from .env file
dotenv.config()

const SOLANA_ENDPOINT = process.env.SOLANA_ENDPOINT
const EXCHANGE_URL = 'https://api.coingecko.com/api/v3'
const STAKE_PROGRAM_ID = 'Stake11111111111111111111111111111111111111'

/**
 * Fetch the current epoch number from the Solana network.
 * @returns {Promise<number|undefined>} The current epoch number, or undefined if an error occurs.
 * @throws {Error} - If the network request failed.
 */
export const fetchLatestEpoch = async () => {
    try {
        const body = populateBody('getEpochInfo')
        const data = await request.POST(SOLANA_ENDPOINT, body)
        return data.result.epoch
    } catch (e) {
        logger.error(`Failed to fetch latest epoch number: ${e.message}`)
        throw e
    }
}

/**
 * Get the accounts associated with a given program.
 * @param {string} validatorId - The public key of the validator.
 * @returns {Promise<Object|undefined>} An object containing the accounts associated with the program, or undefined if an error occurs.
 * @throws {Error} - If the network request failed.
 */
export const getProgramAccounts = async (validatorId) => {
    try {
        const params = [
            STAKE_PROGRAM_ID,
            {
                commitment: 'confirmed',
                encoding: 'base64',
                dataSize: 200,
                filters: [
                    {
                        memcmp: {
                            offset: 124,
                            bytes: validatorId,
                        },
                    },
                ],
            },
        ]
        const data = await request.POST(
            SOLANA_ENDPOINT,
            populateBody('getProgramAccounts', params)
        )
        return data
    } catch (e) {
        logger.error(`Failed to fetch program accounts: ${e.message}`)
        throw e
    }
}

/**
 * Get information about a specific account.
 * @param {string} pubkey - The public key of the account to query.
 * @returns {Promise<Object|undefined>} An object containing the account information, or undefined if an error occurs.
 * @throws {Error} - If the network request failed.
 */
export const getAccountInfo = async (pubkey) => {
    try {
        const data = await request.POST(
            SOLANA_ENDPOINT,
            populateBody('getAccountInfo', [pubkey, { encoding: 'jsonParsed' }])
        )
        return data
    } catch (e) {
        logger.error(`Failed to fetch account info [${pubkey}]: ${e.message}`)
        throw e
    }
}

/**
 * Fetch the Solana price at a specific date.
 * @param {string} timestamp - The timestamp (in ISO 8601 format) for which to fetch the price.
 * @returns {Promise<number|undefined>} The price of Solana in USD at the specified date, or undefined if an error occurs.
 * @throws {Error} - If the network request failed.
 */
export const fetchSolanaPriceAtDate = async (timestamp) => {
    try {
        const d = new Date(timestamp)
        const date = d.getUTCDate()
        const month = d.getUTCMonth() + 1
        const year = d.getUTCFullYear()
        const dateParam = `${date}-${month}-${year}`

        const url = `${EXCHANGE_URL}/coins/solana/history`
        const data = await request.GET(url, {
            params: { localization: false, date: dateParam },
        })
        return data.market_data.current_price.usd
    } catch (e) {
        logger.error(`Failed to fetch Solana price: ${e.message}`)
        throw e
    }
}

/**
 * Fetch the inflation rewards of delegators for a specific epoch.
 * @param {string[]} delegatorPubKeys - An array of public keys of the delegators.
 * @param {number} epoch - The epoch number for which to fetch the rewards.
 * @returns {Promise<Object|undefined>} An object containing the rewards information, or undefined if an error occurs.
 * @throws {Error} - If the network request failed.
 */
export const getInflationReward = async (delegatorPubKeys, epoch) => {
    try {
        const body = populateBody('getInflationReward', [
            delegatorPubKeys,
            { epoch },
        ])
        const data = await request.POST(SOLANA_ENDPOINT, body)
        return data
    } catch (e) {
        logger.error(
            `Failed to fetch delegator rewards for epoch: ${epoch} [${delegatorPubKeys.join(
                ', '
            )}]: ${e.message}`
        )
        throw e
    }
}

/**
 * Fetch the block time of a given effective slot.
 * @param {number} effectiveSlot - The effective slot number.
 * @returns {Promise<number|undefined>} The block time in Unix timestamp format, or undefined if an error occurs.
 * @throws {Error} - If the network request failed.
 */
export const getBlockTime = async (effectiveSlot) => {
    try {
        const body = populateBody('getBlockTime', [effectiveSlot])
        const { result } = await request.POST(SOLANA_ENDPOINT, body)
        if (!result) logger.error('Block time not found')
        return result
    } catch (e) {
        logger.error(`Failed to fetch block time: ${e.message}`)
        throw e
    }
}

/**
 * Fetch transaction signatures related to an address.
 * @param {string} address - The public key of the account.
 * @returns {Promise<Object|undefined>} An object containing the transaction signatures, or undefined if an error occurs.
 * @throws {Error} - If the network request failed.
 */
export const getSignaturesForAddress = async (address) => {
    try {
        const body = populateBody('getSignaturesForAddress', [address])
        const data = await request.POST(SOLANA_ENDPOINT, body)
        return data
    } catch (e) {
        logger.error(
            `Failed to fetch transaction signatures [${address}]: ${e.message}`
        )
        throw e
    }
}

/**
 * Fetch details of a transaction by its signature.
 * @param {string} signature - The transaction signature.
 * @returns {Promise<Object|undefined>} An object containing the transaction details, or undefined if an error occurs.
 * @throws {Error} - If the network request failed.
 */
export const getTransaction = async (signature) => {
    try {
        const body = populateBody('getTransaction', [signature, 'json'])
        const data = await request.POST(SOLANA_ENDPOINT, body)
        return data
    } catch (e) {
        logger.error(
            `Failed to fetch transaction details [${signature}]: ${e.message}`
        )
        throw e
    }
}
