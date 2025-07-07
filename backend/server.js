const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sentiment-analyzer', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('✅ Connected to MongoDB');
}).catch(err => {
    console.error('❌ MongoDB connection error:', err);
});

// Import models
const Analysis = require('./models/Analysis');

// Import sentiment engine
const { analyzeSentiment, generateInsights } = require('./utils/sentimentEngine');

// API Routes
app.post('/api/analyze', async (req, res) => {
    try {
        const { reviews, productName, url } = req.body;
        
        if (!reviews || reviews.length === 0) {
            return res.status(400).json({ error: 'No reviews provided' });
        }
        
        // Perform sentiment analysis
        const sentimentResults = analyzeSentiment(reviews);
        const insights = generateInsights(sentimentResults, reviews);
        
        // Calculate overall score (0-100)
        const overallScore = Math.round(
            (sentimentResults.positive * 100 + sentimentResults.neutral * 50) / 
            (sentimentResults.positive + sentimentResults.neutral + sentimentResults.negative)
        );
        
        // Save to database
        const analysis = new Analysis({
            productName,
            productUrl: url,
            totalReviews: reviews.length,
            sentimentScores: {
                positive: Math.round((sentimentResults.positive / reviews.length) * 100),
                neutral: Math.round((sentimentResults.neutral / reviews.length) * 100),
                negative: Math.round((sentimentResults.negative / reviews.length) * 100)
            },
            overallScore,
            insights: insights.insights,
            suggestions: insights.suggestions,
            reviewSamples: reviews.slice(0, 5)
        });
        
        await analysis.save();
        
        // Send response
        res.json({
            positive: analysis.sentimentScores.positive,
            neutral: analysis.sentimentScores.neutral,
            negative: analysis.sentimentScores.negative,
            overallScore,
            insights: insights.insights,
            suggestions: insights.suggestions,
            totalAnalyzed: reviews.length
        });
        
    } catch (error) {
        console.error('Analysis error:', error);
        res.status(500).json({ error: 'Analysis failed' });
    }
});

// Get analysis history
app.get('/api/history', async (req, res) => {
    try {
        const analyses = await Analysis.find()
            .sort({ createdAt: -1 })
            .limit(10);
        res.json(analyses);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
