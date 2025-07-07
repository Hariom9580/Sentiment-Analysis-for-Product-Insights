// Listen for messages from popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "getProductInfo") {
        const productInfo = extractProductInfo();
        sendResponse(productInfo);
    } else if (request.action === "getReviews") {
        const reviews = extractReviews();
        const productName = extractProductInfo().productName;
        sendResponse({reviews: reviews, productName: productName});
    }
    return true; // Important for async response
});

function extractProductInfo() {
    let productName = "Unknown Product";
    let price = "N/A";
    let rating = "N/A";
    
    // Amazon.com & Amazon.in
    const amazonTitle = document.querySelector('#productTitle, [data-feature-name="title"]');
    const amazonPrice = document.querySelector('.a-price-whole, .a-price.a-text-price.a-size-medium.apexPriceToPay');
    const amazonRating = document.querySelector('[data-hook="rating-out-of-text"], .a-icon-alt');
    
    if (amazonTitle) {
        productName = amazonTitle.textContent.trim();
        if (amazonPrice) price = amazonPrice.textContent.trim();
        if (amazonRating) rating = amazonRating.textContent.trim();
    }
    
    // Flipkart
    const flipkartTitle = document.querySelector('.B_NuCI, h1.yhB1nd');
    const flipkartPrice = document.querySelector('._30jeq3._16Jk6d, ._25b18c ._30jeq3');
    const flipkartRating = document.querySelector('._3LWZlK, div._3LWZlK._138NNC');
    
    if (flipkartTitle) {
        productName = flipkartTitle.textContent.trim();
        if (flipkartPrice) price = flipkartPrice.textContent.trim();
        if (flipkartRating) rating = flipkartRating.textContent.trim();
    }
    
    // Myntra
    const myntraTitle = document.querySelector('.pdp-title, .pdp-name');
    const myntraPrice = document.querySelector('.pdp-price strong, .pdp-discount-container .pdp-price');
    
    if (myntraTitle) {
        productName = myntraTitle.textContent.trim();
        if (myntraPrice) price = myntraPrice.textContent.trim();
    }
    
    // Snapdeal
    const snapdealTitle = document.querySelector('.pdp-e-i-head, h1[itemprop="name"]');
    const snapdealPrice = document.querySelector('.pdp-final-price, .payBlkBig');
    
    if (snapdealTitle) {
        productName = snapdealTitle.textContent.trim();
        if (snapdealPrice) price = snapdealPrice.textContent.trim();
    }
    
    return { 
        productName: productName,
        price: price,
        rating: rating
    };
}

function extractReviews() {
    let reviews = [];
    
    // Amazon.com reviews
    const amazonReviews = document.querySelectorAll('[data-hook="review-body"], .review-text-content, [data-hook="review-collapsed"], .cr-original-review-content');
    amazonReviews.forEach(review => {
        const text = review.textContent.trim();
        if (text && text.length > 10) {
            reviews.push(text);
        }
    });
    
    // Amazon.in specific selectors
    const amazonINReviews = document.querySelectorAll('.review-text, .review-text-content span, .a-expander-content.reviewText');
    amazonINReviews.forEach(review => {
        const text = review.textContent.trim();
        if (text && text.length > 10 && !reviews.includes(text)) {
            reviews.push(text);
        }
    });
    
    // Flipkart reviews - Updated selectors
    const flipkartReviews = document.querySelectorAll('.t-ZTKy, ._6K-7Co, .qwjRop div:nth-child(2) div div:nth-child(3), [class*="review-text"], ._11pzQk');
    flipkartReviews.forEach(review => {
        const text = review.textContent.trim();
        if (text && text.length > 10 && !reviews.includes(text)) {
            reviews.push(text);
        }
    });
    
    // Myntra reviews
    const myntraReviews = document.querySelectorAll('.user-review-reviewDetail, .review-comment, .detailed-reviews-userReviewDetail');
    myntraReviews.forEach(review => {
        const text = review.textContent.trim();
        if (text && text.length > 10 && !reviews.includes(text)) {
            reviews.push(text);
        }
    });
    
    // Snapdeal reviews
    const snapdealReviews = document.querySelectorAll('.user-review, .reviewcommentreference, .Lght-height');
    snapdealReviews.forEach(review => {
        const text = review.textContent.trim();
        if (text && text.length > 10 && !reviews.includes(text)) {
            reviews.push(text);
        }
    });
    
    // Remove duplicates and empty reviews
    reviews = [...new Set(reviews)].filter(review => review.length > 20);
    
    // If no reviews found, add a message
    if (reviews.length === 0) {
        console.log('No reviews found on this page');
        return ["No reviews found. Please make sure you're on a product page with customer reviews."];
    }
    
    console.log(`Found ${reviews.length} reviews`);
    return reviews.slice(0, 20); // Limit to 20 reviews for performance
}

// Helper function to wait for elements to load
function waitForElement(selector, timeout = 5000) {
    return new Promise((resolve) => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }

        const observer = new MutationObserver(() => {
            if (document.querySelector(selector)) {
                resolve(document.querySelector(selector));
                observer.disconnect();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        setTimeout(() => {
            observer.disconnect();
            resolve(null);
        }, timeout);
    });
}

// Log when content script loads
console.log('SmartReview Pro content script loaded on:', window.location.href);
