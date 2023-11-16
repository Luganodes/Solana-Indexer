import mongoose from 'mongoose'
import logger from '../logger/logger.js'

// Define the schema for a Transaction
const transactionSchema = new mongoose.Schema({
    delegatorId: {
        type: String,
        required: [true, 'Delegator ID is required.'],
    },
    timestamp: {
        type: Number,
        required: [true, 'Timestamp of the transaction is required.'],
    },
    type: {
        type: String,
        required: [true, 'Transaction type is required.'],
    },
    amount: {
        type: Number,
        required: [true, 'Transaction amount is required.'],
    },
    solUsd: {
        type: Number,
        required: [
            true,
            'Solana price in USD at the time of transaction is required.',
        ],
    },
    transactionCount: {
        type: Number,
        required: [true, 'Transaction count for the delegator is required.'],
    },
    transactionHash: {
        type: String,
        required: [true, 'Transaction hash is required.'],
    },
    fee: {
        type: Number,
        required: [true, 'Transaction fee is required.'],
    },
})

// Compile the schema into a model or retrieve the existing model
const Transaction =
    mongoose.models.Transaction ||
    mongoose.model('Transaction', transactionSchema)

export default Transaction
