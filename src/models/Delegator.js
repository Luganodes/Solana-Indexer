import mongoose from 'mongoose'
import logger from '../logger/logger.js'

// Define the schema for a Delegator
const delegatorSchema = new mongoose.Schema({
    delegatorId: {
        type: String,
        required: [true, 'Delegator ID is required'],
    },
    timestamp: {
        type: Number,
        required: [true, 'Timestamp is required'],
    },
    unstaked: {
        type: Boolean,
        default: false,
    },
    unstakedTimestamp: {
        type: Number,
        default: -1,
    },
    unstakedEpoch: {
        type: Number,
        default: -1,
    },
    apr: {
        type: Number,
        default: 0,
    },
    stakedAmount: {
        type: Number,
        default: 0,
    },
    activationEpoch: {
        type: Number,
        default: 0,
    },
})

// Compile the schema into a model or retrieve the existing model
const Delegator =
    mongoose.models.Delegator || mongoose.model('Delegator', delegatorSchema)

export default Delegator
