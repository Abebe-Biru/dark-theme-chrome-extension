// DOM Elements
const darkModeToggle = document.getElementById('darkModeToggle');
const websiteDarkModeToggle = document.getElementById('websiteDarkModeToggle');
const forceDarkModeBtn = document.getElementById('forceDarkMode');
const openOptionsBtn = document.getElementById('openOptions');
const statusMessage = document.getElementById('statusMessage');

// Initialize popup
document.addEventListener('DOMContentLoaded', initializePopup);

async function initializePopup() {
    console.log('Popup initialized');
    
    // Load saved data
    await loadSavedData();
    
    // Set up event listeners
    setupEventListeners();
    
    showStatus('Extension loaded successfully!', 'success');
}

function setupEventListeners() {
    // Dark mode toggle
    darkModeToggle.addEventListener('change', toggleDarkMode);
    
    // Website-specific dark mode toggle
    websiteDarkModeToggle.addEventListener('change', toggleWebsiteDarkMode);
    
    // Force dark mode
    forceDarkModeBtn.addEventListener('click', forceDarkMode);
    
    // Open options page
    openOptionsBtn.addEventListener('click', openOptionsPage);
}

async function loadSavedData() {
    try {
        // Load multiple items from storage
        const result = await chrome.storage.local.get([
            'darkModeEnabled',
            'websiteSettings'
        ]);
        
        // Set dark mode toggle
        if (result.darkModeEnabled !== undefined) {
            darkModeToggle.checked = result.darkModeEnabled;
        }
        
        // Set website-specific dark mode toggle
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        // Check if we can access the tab's URL
        if (tab.url) {
            try {
                const domain = new URL(tab.url).hostname;
                
                if (result.websiteSettings && result.websiteSettings[domain]) {
                    websiteDarkModeToggle.checked = result.websiteSettings[domain].darkModeEnabled;
                } else {
                    // Default to global setting if no website-specific setting exists
                    websiteDarkModeToggle.checked = result.darkModeEnabled || false;
                }
            } catch (urlError) {
                // Invalid URL, use global setting
                websiteDarkModeToggle.checked = result.darkModeEnabled || false;
            }
        } else {
            // No URL available, use global setting
            websiteDarkModeToggle.checked = result.darkModeEnabled || false;
        }
        
        console.log('Data loaded from storage');
    } catch (error) {
        console.error('Error loading data:', error);
        showStatus('Error loading saved data', 'error');
    }
}

async function togglePageColor() {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        // Check if we're on a chrome:// URL
        if (tab.url && (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://'))) {
            showStatus('This feature is not available on Chrome internal pages.', 'error');
            return;
        }
        
        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
                // Toggle between colors
                const currentColor = document.body.style.backgroundColor;
                const colors = ['#FF6B6B', '#4ECDC4', '#FFD166', '#06D6A0', '#118AB2'];
                
                if (!currentColor || currentColor === 'white' || currentColor === '') {
                    const randomColor = colors[Math.floor(Math.random() * colors.length)];
                    document.body.style.backgroundColor = randomColor;
                    return `Changed to ${randomColor}`;
                } else {
                    document.body.style.backgroundColor = 'white';
                    return 'Reset to white';
                }
            }
        });
        
        showStatus('Page color changed!', 'success');
    } catch (error) {
        console.error('Error changing color:', error);
        showStatus('Error changing page color. This feature may not be available on this page.', 'error');
    }
}

async function showAlertOnPage() {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        // Check if we're on a chrome:// URL
        if (tab.url && (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://'))) {
            showStatus('This feature is not available on Chrome internal pages.', 'error');
            return;
        }
        
        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
                alert('Hello from My Chrome Extension!\n\n' +
                      `Current URL: ${window.location.href}\n` +
                      `Page Title: ${document.title}`);
            }
        });
        
        showStatus('Alert shown on page!', 'success');
    } catch (error) {
        console.error('Error showing alert:', error);
        showStatus('Error showing alert. This feature may not be available on this page.', 'error');
    }
}

async function toggleDarkMode() {
    const isEnabled = darkModeToggle.checked;
    
    try {
        // Get dark mode intensity setting
        const settings = await chrome.storage.local.get(['darkModeIntensity']);
        const intensity = settings.darkModeIntensity || 'deep';
        
        // Send message to background script to set global dark mode
        const response = await chrome.runtime.sendMessage({
            action: 'setGlobalDarkMode',
            enabled: isEnabled,
            intensity: intensity
        });
        
        if (response && response.success) {
            showStatus(`Dark mode ${isEnabled ? 'enabled' : 'disabled'} globally`, 'success');
        } else {
            // Fallback to local storage if background script fails
            await chrome.storage.local.set({ 
                darkModeEnabled: isEnabled,
                darkModeIntensity: intensity
            });
            
            // Send message to current tab only
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            // Check if we're on a chrome:// URL
            if (tab.url && (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://'))) {
                showStatus(`Dark mode setting saved (${isEnabled ? 'enabled' : 'disabled'})`, 'success');
                return;
            }
            
            try {
                await chrome.tabs.sendMessage(tab.id, {
                    action: 'toggleDarkMode',
                    enabled: isEnabled
                });
                
                showStatus(`Dark mode ${isEnabled ? 'enabled' : 'disabled'}`, 'success');
            } catch (error) {
                // Handle different types of errors
                if (error.message && error.message.includes('Could not establish connection')) {
                    console.warn('Content script not loaded yet, but setting saved');
                    showStatus(`Dark mode setting saved (${isEnabled ? 'enabled' : 'disabled'})`, 'success');
                } else {
                    console.warn('Content script not available on this page:', error);
                    showStatus(`Dark mode setting saved (${isEnabled ? 'enabled' : 'disabled'})`, 'success');
                }
            }
        }
    } catch (error) {
        console.error('Error toggling dark mode:', error);
        showStatus('Error toggling dark mode', 'error');
    }
}

async function toggleWebsiteDarkMode() {
    const isEnabled = websiteDarkModeToggle.checked;
    
    try {
        // Get current tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        // Check if tab URL is accessible
        if (!tab.url) {
            showStatus('Unable to access this page', 'error');
            return;
        }
        
        // Check if we're on a chrome:// URL
        if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
            showStatus('This feature is not available on Chrome internal pages.', 'error');
            return;
        }
        
        let domain;
        try {
            domain = new URL(tab.url).hostname;
        } catch (urlError) {
            showStatus('Invalid URL', 'error');
            return;
        }
        
        // Get existing website settings
        const result = await chrome.storage.local.get(['websiteSettings']);
        let websiteSettings = result.websiteSettings || {};
        
        // Update website settings
        websiteSettings[domain] = {
            darkModeEnabled: isEnabled,
            addedDate: new Date().toISOString()
        };
        
        // Save updated settings
        await chrome.storage.local.set({ websiteSettings });
        
        // Send message to current tab to apply the setting
        try {
            await chrome.tabs.sendMessage(tab.id, {
                action: 'toggleDarkMode',
                enabled: isEnabled
            });
            
            showStatus(`Dark mode ${isEnabled ? 'enabled' : 'disabled'} for ${domain}`, 'success');
        } catch (error) {
            // Handle different types of errors more specifically
            if (error.message && error.message.includes('Could not establish connection')) {
                console.warn('Content script not loaded yet, but setting saved');
                showStatus(`Setting saved for ${domain}`, 'success');
            } else {
                console.warn('Content script not available on this page:', error);
                showStatus(`Setting saved for ${domain}`, 'success');
            }
        }
    } catch (error) {
        console.error('Error toggling website dark mode:', error);
        showStatus('Error saving website setting', 'error');
    }
}

async function forceDarkMode() {
    try {
        // Get current tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        // Check if tab URL is accessible
        if (!tab.url) {
            showStatus('Unable to access this page', 'error');
            return;
        }
        
        // Check if we're on a chrome:// URL
        if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
            showStatus('This feature is not available on Chrome internal pages.', 'error');
            return;
        }
        
        // Execute a more aggressive dark mode script
        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
                // Create a more aggressive dark mode stylesheet
                const style = document.createElement('style');
                style.id = 'aggressive-dark-mode';
                style.textContent = `
                    html, body, div, span, applet, object, iframe,
                    h1, h2, h3, h4, h5, h6, p, blockquote, pre,
                    a, abbr, acronym, address, big, cite, code,
                    del, dfn, em, img, ins, kbd, q, s, samp,
                    small, strike, strong, sub, sup, tt, var,
                    b, u, i, center,
                    dl, dt, dd, ol, ul, li,
                    fieldset, form, label, legend,
                    table, caption, tbody, tfoot, thead, tr, th, td,
                    article, aside, canvas, details, embed, 
                    figure, figcaption, footer, header, hgroup, 
                    menu, nav, output, ruby, section, summary,
                    time, mark, audio, video {
                        background-color: #000000 !important;
                        color: #e0e0e0 !important;
                        border-color: #333333 !important;
                    }
                    
                    a {
                        color: #4dabf7 !important;
                    }
                    
                    a:hover {
                        color: #74c0fc !important;
                    }
                    
                    input, textarea, select, button {
                        background-color: #1a1a1a !important;
                        color: #e0e0e0 !important;
                        border-color: #444444 !important;
                    }
                    
                    ::-webkit-scrollbar {
                        width: 8px;
                        height: 8px;
                    }
                    
                    ::-webkit-scrollbar-track {
                        background: #1a1a1a;
                    }
                    
                    ::-webkit-scrollbar-thumb {
                        background: #444444;
                        border-radius: 4px;
                    }
                    
                    ::-webkit-scrollbar-thumb:hover {
                        background: #555555;
                    }
                    
                    img {
                        filter: brightness(0.8) contrast(1.2);
                    }
                `;
                
                // Remove existing aggressive dark mode if present
                const existingStyle = document.getElementById('aggressive-dark-mode');
                if (existingStyle) {
                    existingStyle.remove();
                }
                
                // Add the new style
                document.head.appendChild(style);
                
                return 'Aggressive dark mode applied';
            }
        });
        
        showStatus('Aggressive dark mode applied!', 'success');
    } catch (error) {
        console.error('Error applying aggressive dark mode:', error);
        showStatus('Error applying dark mode. This feature may not be available on this page.', 'error');
    }
}

function openOptionsPage() {
    chrome.runtime.openOptionsPage();
}

function showStatus(message, type = 'success') {
    statusMessage.textContent = message;
    statusMessage.className = `status ${type}`;
    statusMessage.style.display = 'block';
    
    // Auto-hide after 5 seconds for success messages
    if (type === 'success') {
        setTimeout(() => {
            statusMessage.style.display = 'none';
        }, 5000);
    }
}

// Export functions if needed (for testing)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializePopup,
        toggleDarkMode,
        forceDarkMode
    };
}