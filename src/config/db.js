import mongoose from 'mongoose'
import dotenv from 'dotenv'
import logger from '../logger/logger.js'

// Load environment variables from .env file
dotenv.config()

/**
 * Establishes a connection to the MongoDB using the provided configurations.
 * Connection configurations are sourced from environment variables.
 *
 * @returns {Promise} A promise object that resolves once the connection is established.
 * @throws {Error} - If the connection couldn't be established.
 */
export const connectDB = async () => {
    try {
        mongoose.set('strictQuery', false)
        const connection = await mongoose.connect(process.env.DB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            user: process.env.MONGO_USER,
            pass: process.env.MONGO_PASSWORD,
            dbName: process.env.DB_NAME,
        })
        logger.info('Successfully connected to the database')
        return connection
    } catch (e) {
        logger.error(`Error connecting to the database: ${e.message}`)
        throw e
    }
}
