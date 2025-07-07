document.addEventListener('DOMContentLoaded', function() {
    checkProduct();
    
    document.getElementById('analyzeBtn').addEventListener('click', analyzeReviews);
});

function checkProduct() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {action: "getProductInfo"}, function(response) {
            if (chrome.runtime.lastError) {
                console.log('Error:', chrome.runtime.lastError);
                document.getElementById('productName').textContent = "Please refresh the page";
                return;
            }
            if (response && response.productName) {
                document.getElementById('productName').textContent = response.productName;
            }
        });
    });
}

async function analyzeReviews() {
    const btn = document.getElementById('analyzeBtn');
    const loading = document.getElementById('loading');
    const results = document.getElementById('results');
    
    btn.style.display = 'none';
    loading.classList.remove('hidden');
    
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {action: "getReviews"}, async function(response) {
            if (chrome.runtime.lastError || !response) {
                loading.classList.add('hidden');
                btn.style.display = 'block';
                alert('Error: Please refresh the page and try again');
                return;
            }
            
            try {
                console.log('Sending to backend:', response);
                
                const result = await fetch('http://localhost:3000/api/analyze', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        reviews: response.reviews,
                        productName: response.productName,
                        url: tabs[0].url
                    })
                });
                
                if (!result.ok) {
                    throw new Error('Analysis failed');
                }
                
                const data = await result.json();
                displayResults(data);
                
            } catch (error) {
                console.error('Error:', error);
                alert('Analysis failed. Make sure backend is running on port 3000');
            } finally {
                loading.classList.add('hidden');
                btn.style.display = 'block';
            }
        });
    });
}

function displayResults(data) {
    document.getElementById('results').classList.remove('hidden');
    
    // Update score
    document.getElementById('scoreNumber').textContent = data.overallScore;
    
    // Update bars with animation
    setTimeout(() => {
        document.getElementById('positiveBar').style.width = data.positive + '%';
        document.getElementById('neutralBar').style.width = data.neutral + '%';
        document.getElementById('negativeBar').style.width = data.negative + '%';
    }, 100);
    
    document.getElementById('positiveVal').textContent = data.positive + '%';
    document.getElementById('neutralVal').textContent = data.neutral + '%';
    document.getElementById('negativeVal').textContent = data.negative + '%';
    
    // Display insights
    const insightsList = document.getElementById('insightsList');
    insightsList.innerHTML = '';
    data.insights.forEach(insight => {
        const li = document.createElement('li');
        li.textContent = insight;
        insightsList.appendChild(li);
    });
    
    // Display suggestions
    const suggestionsList = document.getElementById('suggestionsList');
    suggestionsList.innerHTML = '';
    data.suggestions.forEach(suggestion => {
        const li = document.createElement('li');
        li.textContent = suggestion;
        suggestionsList.appendChild(li);
    });
}
