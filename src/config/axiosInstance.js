import axios from 'axios'
import logger from '../logger/logger.js'

// Constant to denote maximum retry delay
const INITIAL_DELAY = 5000
const MAX_RETRY_DELAY = 5 * 60 * 1000 // 5 minutes

/**
 * Makes a delay for a given amount of time.
 * @param {number} milliseconds - Time to delay in milliseconds.
 * @returns {Promise<void>}
 */
const sleep = async (milliseconds) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve()
        }, milliseconds)
    })
}

const request = {
    /**
     * Sends a GET request to the given URL.
     * Implements exponential retry on failure up to a max of 5 minutes.
     * @param {string} url - The endpoint URL.
     * @param {Object} params - Optional parameters for the request.
     * @param {number} retryDelay - Initial delay for the retry. Defaults to 5 seconds.
     * @returns {Promise<Object>} - Response data from the request.
     * @throws {Error} - If the maximum retry limit is exceeded.
     */
    GET: async (url, params = {}, retryDelay = INITIAL_DELAY) => {
        try {
            console.info(url, params)
            if (retryDelay !== INITIAL_DELAY) {
                logger.debug(
                    `GET request to ${url} in ${retryDelay / 1000} seconds`
                )
                await sleep(retryDelay)
            }
            const response = await axios.get(url, params)
            return response.data
        } catch (e) {
            if (retryDelay <= MAX_RETRY_DELAY)
                return await request.GET(url, params, retryDelay * 2)
            const info = {
                url,
                error: e.message,
            }
            logger.error('GET request failed', info)
            throw e
        }
    },

    /**
     * Sends a POST request to the given URL.
     * Implements exponential retry on failure up to a max of 5 minutes.
     * @param {string} url - The endpoint URL.
     * @param {Object} body - Body of the request.
     * @param {number} retryDelay - Initial delay for the retry. Defaults to 5 seconds.
     * @returns {Promise<Object>} - Response data from the request.
     * @throws {Error} - If the maximum retry limit is exceeded.
     */
    POST: async (url, body, retryDelay = INITIAL_DELAY) => {
        try {
            console.log(url, body)
            if (retryDelay !== INITIAL_DELAY) {
                logger.debug(
                    `POST request to ${url} in ${retryDelay / 1000} seconds`
                )
                await sleep(retryDelay)
            }
            const response = await axios.post(url, body)
            return response.data
        } catch (e) {
            if (retryDelay <= MAX_RETRY_DELAY)
                return await request.POST(url, body, retryDelay * 2)

            const info = {
                url,
                body,
                error: e.message,
            }
            logger.error('POST request failed', info)
            throw e
        }
    },
}

export default request
