// Vigil AI - Background Service Worker
// Handles communication between content scripts and backend API

console.log('🔍 Vigil AI background service worker started');

// Configuration
const CONFIG = {
  API_URL: 'http://localhost:8000',
  TIMEOUT: 120000 // 2 minutes timeout for analysis
};

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'analyzeContent') {
    console.log('📨 Received analysis request:', request.data);
    
    analyzeContent(request.data)
      .then(result => {
        console.log('✅ Analysis complete:', result);
        sendResponse({ success: true, data: result });
      })
      .catch(error => {
        console.error('❌ Analysis failed:', error);
        sendResponse({ 
          success: false, 
          error: error.message || 'Analysis failed. Please try again.' 
        });
      });
    
    return true; // Keep message channel open for async response
  }
});

// Call Vigil AI backend
async function analyzeContent(pageInfo) {
  try {
    console.log('🚀 Sending request to backend:', pageInfo);
    
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.TIMEOUT);
    
    const response = await fetch(`${CONFIG.API_URL}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        video_url: pageInfo.url
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Server error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('📦 Received response from backend:', data);
    
    return data;
    
  } catch (error) {
    console.error('❌ API Error:', error);
    
    if (error.name === 'AbortError') {
      throw new Error('Analysis timed out. The content may be too large or complex.');
    }
    
    if (error.message.includes('Failed to fetch')) {
      throw new Error('Cannot connect to backend. Make sure Vigil AI server is running on http://localhost:8000');
    }
    
    throw error;
  }
}

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  console.log('🖱️ Extension icon clicked on tab:', tab.id);
  
  // Send message to content script to trigger analysis
  chrome.tabs.sendMessage(tab.id, { action: 'triggerAnalysis' }, (response) => {
    if (chrome.runtime.lastError) {
      console.error('Error communicating with content script:', chrome.runtime.lastError);
    }
  });
});

// Optional: Update badge based on analysis results
function updateBadge(trustScore) {
  if (typeof trustScore !== 'number') return;
  
  let color = '#ef4444'; // red
  let text = '!';
  
  if (trustScore >= 70) {
    color = '#10b981'; // green
    text = '✓';
  } else if (trustScore >= 40) {
    color = '#f59e0b'; // yellow
    text = '?';
  }
  
  chrome.action.setBadgeText({ text: text });
  chrome.action.setBadgeBackgroundColor({ color: color });
}

// Clear badge after some time
function clearBadge() {
  setTimeout(() => {
    chrome.action.setBadgeText({ text: '' });
  }, 5000);
}
