// Simple sentiment analysis without complex NLP
function analyzeSentiment(reviews) {
    const positiveWords = [
        'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic',
        'love', 'perfect', 'best', 'awesome', 'brilliant', 'outstanding',
        'superb', 'exceptional', 'impressive', 'satisfied', 'happy',
        'recommend', 'worth', 'quality', 'comfortable', 'beautiful'
    ];
    
    const negativeWords = [
        'bad', 'terrible', 'awful', 'hate', 'worst', 'horrible', 'poor',
        'disappointing', 'useless', 'waste', 'broken', 'failed', 'unhappy',
        'regret', 'avoid', 'defective', 'cheap', 'flimsy', 'frustrated',
        'annoying', 'problem', 'issue', 'fault', 'disappointed'
    ];
    
    let positive = 0;
    let negative = 0;
    let neutral = 0;
    
    reviews.forEach(review => {
        const words = review.toLowerCase().split(/\s+/);
        let reviewPositive = 0;
        let reviewNegative = 0;
        
        words.forEach(word => {
            if (positiveWords.includes(word)) reviewPositive++;
            if (negativeWords.includes(word)) reviewNegative++;
        });
        
        if (reviewPositive > reviewNegative) positive++;
        else if (reviewNegative > reviewPositive) negative++;
        else neutral++;
    });
    
    return { positive, negative, neutral };
}

function generateInsights(sentimentResults, reviews) {
    const insights = [];
    const suggestions = [];
    
    const total = sentimentResults.positive + sentimentResults.negative + sentimentResults.neutral;
    const positivePercent = (sentimentResults.positive / total) * 100;
    const negativePercent = (sentimentResults.negative / total) * 100;
    
    // Generate insights based on sentiment distribution
    if (positivePercent > 70) {
        insights.push("🎉 Customers are highly satisfied with this product");
        insights.push("⭐ Strong positive sentiment indicates good product-market fit");
    } else if (positivePercent > 50) {
        insights.push("👍 Overall positive reception from customers");
        insights.push("📊 Majority of customers are satisfied");
    }
    
    if (negativePercent > 30) {
        insights.push("⚠️ Significant number of customers are dissatisfied");
        insights.push("🔍 Quality concerns need immediate attention");
    }
    
    // Generate suggestions
    if (negativePercent > 20) {
        suggestions.push("📋 Conduct detailed analysis of negative reviews");
        suggestions.push("🛠️ Implement quality improvement measures");
        suggestions.push("💬 Enhance customer support response");
    }
    
    if (positivePercent < 50) {
        suggestions.push("🎯 Focus on addressing common complaints");
        suggestions.push("📈 Implement customer feedback loop");
        suggestions.push("🏷️ Consider pricing strategy adjustment");
    } else {
        suggestions.push("✨ Maintain current quality standards");
        suggestions.push("📣 Leverage positive reviews in marketing");
        suggestions.push("🎁 Consider loyalty programs for satisfied customers");
    }
    
    // Analyze common themes
    const commonWords = analyzeCommonThemes(reviews);
    if (commonWords.length > 0) {
        insights.push(`🔑 Key topics: ${commonWords.join(', ')}`);
    }
    
    return { insights, suggestions };
}

function analyzeCommonThemes(reviews) {
    const wordCount = {};
    const stopWords = ['the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but', 'in', 'with', 'to', 'for', 'of', 'as', 'by'];
    
    reviews.forEach(review => {
        const words = review.toLowerCase().split(/\s+/);
        words.forEach(word => {
            if (word.length > 3 && !stopWords.includes(word)) {
                wordCount[word] = (wordCount[word] || 0) + 1;
            }
        });
    });
    
    // Get top 5 common words
    const sortedWords = Object.entries(wordCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(entry => entry[0]);
    
    return sortedWords;
}

module.exports = {
    analyzeSentiment,
    generateInsights
};
