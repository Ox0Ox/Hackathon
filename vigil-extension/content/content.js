// Vigil AI - Content Script
// This script runs on every webpage and adds fact-checking functionality

console.log('🔍 Vigil AI extension loaded');

// Detect what type of page we're on
function detectPageType() {
  const url = window.location.href;
  
  if (url.includes('youtube.com/watch')) {
    return { 
      type: 'youtube-video', 
      url: url,
      title: document.title
    };
  } else if (url.includes('youtube.com/shorts')) {
    return { 
      type: 'youtube-shorts', 
      url: url,
      title: document.title
    };
  } else if (url.includes('instagram.com/reel') || url.includes('instagram.com/p')) {
    return { 
      type: 'instagram', 
      url: url,
      title: document.title
    };
  } else if (url.includes('twitter.com') || url.includes('x.com')) {
    return { 
      type: 'twitter', 
      url: url,
      title: document.title
    };
  } else {
    // Generic article/webpage
    return { 
      type: 'webpage', 
      url: url,
      title: document.title
    };
  }
}

// Add floating fact-check button to the page
function addFactCheckButton() {
  // Check if button already exists
  if (document.getElementById('vigil-fact-check-btn')) {
    return;
  }

  const pageInfo = detectPageType();
  
  // Create floating button
  const button = document.createElement('button');
  button.id = 'vigil-fact-check-btn';
  button.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="11" cy="11" r="8"></circle>
      <path d="m21 21-4.35-4.35"></path>
    </svg>
    <span>Fact Check</span>
  `;
  button.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 999999;
    padding: 12px 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 50px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
    font-size: 14px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.3s ease;
    opacity: 0;
    animation: slideIn 0.5s forwards 0.5s;
  `;
  
  // Add hover effect
  button.addEventListener('mouseenter', () => {
    button.style.transform = 'scale(1.05)';
    button.style.boxShadow = '0 6px 25px rgba(102, 126, 234, 0.6)';
  });
  
  button.addEventListener('mouseleave', () => {
    button.style.transform = 'scale(1)';
    button.style.boxShadow = '0 4px 20px rgba(102, 126, 234, 0.4)';
  });
  
  button.addEventListener('click', () => {
    analyzeCurrentPage(pageInfo);
  });
  
  document.body.appendChild(button);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);

// Analyze the current page
async function analyzeCurrentPage(pageInfo) {
  try {
    const button = document.getElementById('vigil-fact-check-btn');
    const originalHTML = button.innerHTML;
    
    // Show loading state
    button.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;">
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M12 6v6l4 2"></path>
      </svg>
      <span>Analyzing...</span>
    `;
    button.disabled = true;
    button.style.cursor = 'wait';
    
    // Send to background script which will call your API
    chrome.runtime.sendMessage({
      action: 'analyzeContent',
      data: pageInfo
    }, (response) => {
      button.innerHTML = originalHTML;
      button.disabled = false;
      button.style.cursor = 'pointer';
      
      if (response && response.success) {
        showResults(response.data);
      } else {
        showError(response ? response.error : 'Connection failed');
      }
    });
  } catch (error) {
    console.error('Analysis failed:', error);
    showError(error.message);
  }
}

// Show results in a beautiful overlay
function showResults(data) {
  // Remove existing overlay if any
  const existingOverlay = document.getElementById('vigil-results-overlay');
  if (existingOverlay) {
    existingOverlay.remove();
  }

  // Create overlay
  const overlay = document.createElement('div');
  overlay.id = 'vigil-results-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(5px);
    z-index: 1000000;
    display: flex;
    justify-content: center;
    align-items: center;
    animation: fadeIn 0.3s ease;
  `;
  
  // Create results card
  const card = document.createElement('div');
  card.style.cssText = `
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    color: white;
    padding: 30px;
    border-radius: 20px;
    max-width: 700px;
    width: 90%;
    max-height: 85vh;
    overflow-y: auto;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    animation: slideUp 0.4s ease;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  `;
  
  // Extract data
  const trustScore = data.overall_trust_score || data.trust_score || 'N/A';
  const verdict = data.overall_verdict || data.verdict || 'Unknown';
  const analysis = data.analysis_summary || data.summary || 'No detailed analysis available.';
  const warnings = data.red_flags || data.warnings || [];
  const verifiedInfo = data.verified_information || [];
  
  // Determine color based on trust score
  let scoreColor = '#ef4444'; // red
  if (trustScore >= 70) scoreColor = '#10b981'; // green
  else if (trustScore >= 40) scoreColor = '#f59e0b'; // yellow
  
  // Build results HTML
  card.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
      <h2 style="
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        font-size: 28px;
        margin: 0;
        font-weight: 700;
      ">Vigil AI Analysis</h2>
      <button id="vigil-close-btn" style="
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        color: white;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        cursor: pointer;
        font-size: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
      " onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='rgba(255,255,255,0.1)'">×</button>
    </div>
    
    <!-- Trust Score -->
    <div style="
      background: rgba(255, 255, 255, 0.05);
      border-radius: 15px;
      padding: 20px;
      margin-bottom: 20px;
      border: 1px solid rgba(255, 255, 255, 0.1);
    ">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
        <span style="font-size: 16px; color: #9ca3af;">Trust Score</span>
        <span style="
          font-size: 32px;
          font-weight: 700;
          color: ${scoreColor};
        ">${trustScore}${typeof trustScore === 'number' ? '/100' : ''}</span>
      </div>
      <div style="
        height: 8px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 10px;
        overflow: hidden;
      ">
        <div style="
          height: 100%;
          width: ${typeof trustScore === 'number' ? trustScore : 0}%;
          background: ${scoreColor};
          transition: width 0.5s ease;
        "></div>
      </div>
    </div>
    
    <!-- Verdict -->
    <div style="
      background: rgba(102, 126, 234, 0.1);
      border-left: 4px solid #667eea;
      padding: 15px;
      border-radius: 10px;
      margin-bottom: 20px;
    ">
      <div style="font-size: 14px; color: #9ca3af; margin-bottom: 5px;">Verdict</div>
      <div style="font-size: 18px; font-weight: 600;">${verdict}</div>
    </div>
    
    <!-- Analysis Summary -->
    ${analysis ? `
      <div style="margin-bottom: 20px;">
        <h3 style="font-size: 16px; color: #9ca3af; margin-bottom: 10px;">Analysis Summary</h3>
        <p style="line-height: 1.6; color: #e5e7eb; font-size: 14px;">${analysis}</p>
      </div>
    ` : ''}
    
    <!-- Warnings -->
    ${warnings.length > 0 ? `
      <div style="margin-bottom: 20px;">
        <h3 style="font-size: 16px; color: #ef4444; margin-bottom: 10px;">⚠️ Red Flags</h3>
        <ul style="list-style: none; padding: 0; margin: 0;">
          ${warnings.map(warning => `
            <li style="
              background: rgba(239, 68, 68, 0.1);
              border-left: 3px solid #ef4444;
              padding: 10px;
              margin-bottom: 8px;
              border-radius: 5px;
              font-size: 13px;
            ">${warning}</li>
          `).join('')}
        </ul>
      </div>
    ` : ''}
    
    <!-- Verified Info -->
    ${verifiedInfo.length > 0 ? `
      <div style="margin-bottom: 20px;">
        <h3 style="font-size: 16px; color: #10b981; margin-bottom: 10px;">✓ Verified Information</h3>
        <ul style="list-style: none; padding: 0; margin: 0;">
          ${verifiedInfo.map(info => `
            <li style="
              background: rgba(16, 185, 129, 0.1);
              border-left: 3px solid #10b981;
              padding: 10px;
              margin-bottom: 8px;
              border-radius: 5px;
              font-size: 13px;
            ">${info}</li>
          `).join('')}
        </ul>
      </div>
    ` : ''}
    
    <!-- Footer -->
    <div style="
      margin-top: 25px;
      padding-top: 20px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      text-align: center;
      color: #6b7280;
      font-size: 12px;
    ">
      Powered by Vigil AI • AI-driven fact-checking
    </div>
  `;
  
  overlay.appendChild(card);
  document.body.appendChild(overlay);
  
  // Close button functionality
  document.getElementById('vigil-close-btn').addEventListener('click', () => {
    overlay.style.animation = 'fadeOut 0.3s ease';
    setTimeout(() => overlay.remove(), 300);
  });
  
  // Click outside to close
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.style.animation = 'fadeOut 0.3s ease';
      setTimeout(() => overlay.remove(), 300);
    }
  });
}

// Show error message
function showError(errorMessage) {
  const existingOverlay = document.getElementById('vigil-results-overlay');
  if (existingOverlay) {
    existingOverlay.remove();
  }

  const overlay = document.createElement('div');
  overlay.id = 'vigil-results-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(5px);
    z-index: 1000000;
    display: flex;
    justify-content: center;
    align-items: center;
    animation: fadeIn 0.3s ease;
  `;
  
  const card = document.createElement('div');
  card.style.cssText = `
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    color: white;
    padding: 30px;
    border-radius: 20px;
    max-width: 500px;
    width: 90%;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    animation: slideUp 0.4s ease;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    text-align: center;
  `;
  
  card.innerHTML = `
    <div style="
      width: 60px;
      height: 60px;
      background: rgba(239, 68, 68, 0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
    ">
      <span style="font-size: 32px;">⚠️</span>
    </div>
    <h2 style="color: #ef4444; margin-bottom: 15px; font-size: 24px;">Analysis Failed</h2>
    <p style="color: #9ca3af; margin-bottom: 20px; line-height: 1.6;">${errorMessage}</p>
    <p style="color: #6b7280; font-size: 13px; margin-bottom: 20px;">
      Make sure your Vigil AI backend is running on http://localhost:8000
    </p>
    <button id="vigil-error-close-btn" style="
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 12px 30px;
      border-radius: 10px;
      cursor: pointer;
      font-weight: 600;
      font-size: 14px;
    ">Close</button>
  `;
  
  overlay.appendChild(card);
  document.body.appendChild(overlay);
  
  document.getElementById('vigil-error-close-btn').addEventListener('click', () => {
    overlay.style.animation = 'fadeOut 0.3s ease';
    setTimeout(() => overlay.remove(), 300);
  });
  
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.style.animation = 'fadeOut 0.3s ease';
      setTimeout(() => overlay.remove(), 300);
    }
  });
}

// Add fadeIn and slideUp animations
const animStyle = document.createElement('style');
animStyle.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }
  
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
document.head.appendChild(animStyle);

// Initialize when page loads
function initialize() {
  if (document.body) {
    addFactCheckButton();
  } else {
    setTimeout(initialize, 100);
  }
}

// Start initialization
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}

// Re-add button when navigating on single-page apps (YouTube, etc.)
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    setTimeout(addFactCheckButton, 1000);
  }
}).observe(document, { subtree: true, childList: true });
