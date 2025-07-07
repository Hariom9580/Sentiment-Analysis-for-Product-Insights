const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema({
    productName: {
        type: String,
        required: true
    },
    productUrl: String,
    totalReviews: Number,
    sentimentScores: {
        positive: Number,
        neutral: Number,
        negative: Number
    },
    overallScore: Number,
    insights: [String],
    suggestions: [String],
    reviewSamples: [String],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Analysis', analysisSchema);
