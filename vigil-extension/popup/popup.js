// Vigil AI - Popup Script

console.log('🔍 Vigil AI popup loaded');

// DOM Elements
const checkPageBtn = document.getElementById('check-page');
const viewHistoryBtn = document.getElementById('view-history');
const settingsBtn = document.getElementById('settings');
const aboutBtn = document.getElementById('about');
const statusDot = document.querySelector('.status-dot');
const statusText = document.querySelector('.status-text');
const checksToday = document.getElementById('checks-today');
const totalChecks = document.getElementById('total-checks');

// Configuration
const API_URL = 'http://localhost:8000';

// Initialize popup
async function initialize() {
  // Check backend status
  await checkBackendStatus();
  
  // Load statistics
  loadStatistics();
  
  // Setup event listeners
  setupEventListeners();
}

// Check if backend is running
async function checkBackendStatus() {
  try {
    const response = await fetch(`${API_URL}/`, {
      method: 'GET',
      signal: AbortSignal.timeout(3000)
    });
    
    if (response.ok) {
      setStatus('online', 'Backend Connected');
    } else {
      setStatus('offline', 'Backend Error');
    }
  } catch (error) {
    setStatus('offline', 'Backend Offline');
  }
}

// Set status indicator
function setStatus(status, text) {
  statusDot.className = `status-dot ${status}`;
  statusText.textContent = text;
}

// Load statistics from storage
async function loadStatistics() {
  try {
    const result = await chrome.storage.local.get(['checksToday', 'totalChecks', 'lastCheckDate']);
    
    const today = new Date().toDateString();
    const lastDate = result.lastCheckDate || '';
    
    // Reset daily counter if it's a new day
    if (today !== lastDate) {
      checksToday.textContent = '0';
      await chrome.storage.local.set({ checksToday: 0, lastCheckDate: today });
    } else {
      checksToday.textContent = result.checksToday || 0;
    }
    
    totalChecks.textContent = result.totalChecks || 0;
  } catch (error) {
    console.error('Error loading statistics:', error);
  }
}

// Update statistics
async function updateStatistics() {
  try {
    const result = await chrome.storage.local.get(['checksToday', 'totalChecks']);
    
    const newChecksToday = (result.checksToday || 0) + 1;
    const newTotalChecks = (result.totalChecks || 0) + 1;
    
    await chrome.storage.local.set({
      checksToday: newChecksToday,
      totalChecks: newTotalChecks,
      lastCheckDate: new Date().toDateString()
    });
    
    checksToday.textContent = newChecksToday;
    totalChecks.textContent = newTotalChecks;
  } catch (error) {
    console.error('Error updating statistics:', error);
  }
}

// Setup event listeners
function setupEventListeners() {
  checkPageBtn.addEventListener('click', handleCheckPage);
  viewHistoryBtn.addEventListener('click', handleViewHistory);
  settingsBtn.addEventListener('click', handleSettings);
  aboutBtn.addEventListener('click', handleAbout);
}

// Handle check page button click
async function handleCheckPage() {
  try {
    // Get active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab) {
      showNotification('Error', 'No active tab found');
      return;
    }
    
    // Show loading state
    checkPageBtn.classList.add('loading');
    checkPageBtn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M12 6v6l4 2"></path>
      </svg>
      <span>Analyzing...</span>
    `;
    
    // Send message to content script
    chrome.tabs.sendMessage(tab.id, { action: 'triggerAnalysis' }, async (response) => {
      // Reset button
      checkPageBtn.classList.remove('loading');
      checkPageBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
        <span>Fact Check This Page</span>
      `;
      
      if (chrome.runtime.lastError) {
        console.error('Error:', chrome.runtime.lastError);
        showNotification('Error', 'Could not analyze page. Please refresh and try again.');
        return;
      }
      
      // Update statistics
      await updateStatistics();
      
      // Close popup (analysis will show in page overlay)
      window.close();
    });
    
  } catch (error) {
    console.error('Error checking page:', error);
    showNotification('Error', error.message);
    
    // Reset button
    checkPageBtn.classList.remove('loading');
    checkPageBtn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"></circle>
        <path d="m21 21-4.35-4.35"></path>
      </svg>
      <span>Fact Check This Page</span>
    `;
  }
}

// Handle view history
function handleViewHistory() {
  // TODO: Implement history view
  showNotification('Coming Soon', 'History feature will be available in the next update!');
}

// Handle settings
function handleSettings() {
  // TODO: Implement settings page
  showNotification('Settings', 'Configure your Vigil AI preferences here (coming soon)');
}

// Handle about
function handleAbout() {
  const message = `
    Vigil AI v1.0.0
    
    AI-powered fact-checking extension that helps you verify content across the web.
    
    Supports: YouTube videos, Instagram reels, news articles, Twitter posts, documents, and images.
    
    Built with ❤️ for truth and transparency.
  `;
  alert(message);
}

// Show notification (simple version - can be enhanced)
function showNotification(title, message) {
  alert(`${title}\n\n${message}`);
}

// Initialize when popup opens
initialize();

// Refresh status every 10 seconds
setInterval(checkBackendStatus, 10000);
