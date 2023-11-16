import mongoose from 'mongoose'
import logger from '../logger/logger.js'

// Define the schema for Rewards
const rewardSchema = new mongoose.Schema({
    delegatorId: {
        type: String,
        required: [true, 'Delegator ID is required.'],
    },
    solUsd: {
        type: Number,
        default: 0,
    },
    epochNum: {
        type: Number,
        required: [true, 'Epoch number is required.'],
    },
    timestamp: {
        type: Number,
        required: [true, 'Timestamp is required.'],
    },
    postBalance: {
        type: Number,
        required: [true, 'Post balance is required.'],
    },
    postBalanceUsd: {
        type: Number,
        default: 0,
    },
    userAction: {
        type: String,
        enum: ['WITHDRAW', 'REWARD'],
    },
    reward: {
        type: Number,
        required: [true, 'Reward amount is required.'],
    },
    rewardUsd: {
        type: Number,
        required: [true, 'Reward amount in USD is required.'],
    },
    totalReward: {
        type: Number,
        required: [true, 'Total reward is required.'],
    },
    totalRewardUsd: {
        type: Number,
        default: 0,
    },
    pendingRewards: {
        type: Number,
        required: [true, 'Pending rewards are required.'],
    },
    pendingRewardsUsd: {
        type: Number,
        default: 0,
    },
    stakedAmount: {
        type: Number,
        required: [true, 'Staked amount is required.'],
    },
    stakedAmountUsd: {
        type: Number,
        required: [true, 'Staked amount in USD is required.'],
    },
})

// Compile the schema into a model or retrieve the existing model
const Reward = mongoose.models.Reward || mongoose.model('Reward', rewardSchema)

export default Reward
