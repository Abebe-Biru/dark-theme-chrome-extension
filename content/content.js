// Content script - runs in web page context
console.log('Content script loaded');

// Example: Add a red border to all images
const style = document.createElement('style');
style.textContent = `
  .extension-highlight {
    border: 2px solid red !important;
  }
`;
document.head.appendChild(style);
// Content Script - Runs in the context of web pages

console.log('Content script loaded for:', window.location.href);

// Initialize content script
initializeContentScript();

function initializeContentScript() {
    console.log('Initializing content script...');
    
    // Listen for messages from popup/background
    setupMessageListeners();
    
    // Apply saved settings
    applySavedSettings();
    
    // Add custom styles
    addCustomStyles();
    
    // Modify page if needed
    enhancePageContent();
}

function setupMessageListeners() {
    // Listen for messages from popup/background
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        console.log('Content script received message:', message);
        
        // Handle different message types
        switch (message.action) {
            case 'toggleDarkMode':
                try {
                    toggleDarkMode(message.enabled);
                    sendResponse({ success: true, message: 'Dark mode toggled' });
                } catch (error) {
                    console.error('Error toggling dark mode:', error);
                    sendResponse({ success: false, error: 'Failed to toggle dark mode' });
                }
                break;
                
            default:
                sendResponse({ success: false, error: 'Unknown action: ' + message.action });
        }
        
        // Return true to indicate we will send a response asynchronously
        return true;
    });
}

async function applySavedSettings() {
    try {
        // Get settings from storage
        const result = await chrome.storage.local.get(['darkModeEnabled', 'websiteSettings']);
        
        // Check if there's a website-specific setting
        const domain = window.location.hostname;
        let shouldApplyDarkMode = false;
        
        if (result.websiteSettings && result.websiteSettings[domain]) {
            // Use website-specific setting
            shouldApplyDarkMode = result.websiteSettings[domain].darkModeEnabled;
        } else {
            // Use global setting
            shouldApplyDarkMode = result.darkModeEnabled || false;
        }
        
        // Apply dark mode if enabled
        if (shouldApplyDarkMode) {
            // Small delay to ensure page is fully loaded
            setTimeout(() => {
                try {
                    toggleDarkMode(true);
                } catch (error) {
                    console.error('Error applying dark mode:', error);
                }
            }, 100);
        }
        
    } catch (error) {
        console.error('Error applying settings:', error);
    }
}

function toggleDarkMode(enabled) {
    if (enabled) {
        // Get dark mode intensity from storage (default to 'deep')
        chrome.storage.local.get(['darkModeIntensity'], function(result) {
            const intensity = result.darkModeIntensity || 'deep';
            
            // Define color schemes based on intensity
            let bgColor, textColor, borderColor;
            
            switch(intensity) {
                case 'light':
                    bgColor = '#1a1a1a';
                    textColor = '#e0e0e0';
                    borderColor = '#444444';
                    break;
                case 'medium':
                    bgColor = '#121212';
                    textColor = '#d0d0d0';
                    borderColor = '#333333';
                    break;
                case 'deep':
                default:
                    bgColor = '#000000';
                    textColor = '#e0e0e0';
                    borderColor = '#333333';
                    break;
            }
            
            // Add modern dark mode styles with configurable intensity
            const darkModeCSS = `
                /* Modern Day Black Theme - ${intensity} intensity */
                body.dark-mode, 
                body.dark-mode * {
                    background-color: ${bgColor} !important;
                    color: ${textColor} !important;
                    border-color: ${borderColor} !important;
                }
                
                body.dark-mode a {
                    color: #4dabf7 !important;
                }
                
                body.dark-mode a:hover {
                    color: #74c0fc !important;
                }
                
                body.dark-mode input,
                body.dark-mode textarea,
                body.dark-mode select {
                    background-color: #1a1a1a !important;
                    color: ${textColor} !important;
                    border-color: ${borderColor} !important;
                }
                
                body.dark-mode input:focus,
                body.dark-mode textarea:focus,
                body.dark-mode select:focus {
                    border-color: #4dabf7 !important;
                    box-shadow: 0 0 0 2px rgba(77, 171, 247, 0.3) !important;
                }
                
                body.dark-mode button {
                    background-color: #212121 !important;
                    color: ${textColor} !important;
                    border-color: ${borderColor} !important;
                }
                
                body.dark-mode button:hover {
                    background-color: #333333 !important;
                }
                
                body.dark-mode ::-webkit-scrollbar {
                    width: 8px;
                    height: 8px;
                }
                
                body.dark-mode ::-webkit-scrollbar-track {
                    background: #1a1a1a;
                }
                
                body.dark-mode ::-webkit-scrollbar-thumb {
                    background: ${borderColor};
                    border-radius: 4px;
                }
                
                body.dark-mode ::-webkit-scrollbar-thumb:hover {
                    background: #555555;
                }
                
                body.dark-mode img {
                    filter: brightness(0.9) contrast(1.1);
                }
                
                body.dark-mode code,
                body.dark-mode pre {
                    background-color: #1a1a1a !important;
                    border: 1px solid ${borderColor} !important;
                }
                
                /* Force dark mode for stubborn elements */
                body.dark-mode *[style*="background"] {
                    background-color: ${bgColor} !important;
                }
                
                body.dark-mode *[style*="color"] {
                    color: ${textColor} !important;
                }
            `;
            
            // Add or update dark mode style tag
            let styleTag = document.getElementById('extension-dark-mode');
            if (!styleTag) {
                styleTag = document.createElement('style');
                styleTag.id = 'extension-dark-mode';
                document.head.appendChild(styleTag);
            }
            styleTag.textContent = darkModeCSS;
            
            // Add dark mode class to body
            document.body.classList.add('dark-mode');
            
            console.log(`Modern dark mode enabled with ${intensity} intensity`);
        });
    } else {
        // Remove dark mode
        const styleTag = document.getElementById('extension-dark-mode');
        if (styleTag) {
            styleTag.remove();
        }
        document.body.classList.remove('dark-mode');
        
        console.log('Dark mode disabled');
    }
}

function addCustomStyles() {
    const customStyles = `
        .extension-highlight {
            background-color: rgba(255, 215, 0, 0.3) !important;
            border: 2px dashed #ffd700 !important;
            padding: 2px !important;
            transition: all 0.3s ease !important;
        }
        
        .extension-notification {
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            z-index: 10000;
            font-family: Arial, sans-serif;
            max-width: 300px;
            animation: slideIn 0.5s ease-out;
        }
        
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    
    const styleTag = document.createElement('style');
    styleTag.textContent = customStyles;
    document.head.appendChild(styleTag);
}

function enhancePageContent() {
    // Make external links open in new tab
    makeExternalLinksOpenInNewTab();
    
    // Add hover effects to images
    addImageHoverEffects();
}

function makeExternalLinksOpenInNewTab() {
    const links = document.querySelectorAll('a[href^="http"]:not([href*="' + window.location.hostname + '"])');
    links.forEach(link => {
        if (!link.target) {
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
        }
    });
}

function addImageHoverEffects() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.addEventListener('mouseenter', () => {
            img.style.transition = 'transform 0.3s ease';
            img.style.transform = 'scale(1.02)';
        });
        
        img.addEventListener('mouseleave', () => {
            img.style.transform = 'scale(1)';
        });
    });
}

function showTextSavedNotification(text) {
    // Placeholder function - text saving feature removed
}

function showNotification(message) {
    // Placeholder function - notifications removed
}

function checkForSavedText(savedText) {
    // Placeholder function - text saving feature removed
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeContentScript,
        toggleDarkMode
    };
}
// Send message to background script
chrome.runtime.sendMessage({ 
  type: "contentScriptLoaded", 
  url: window.location.href 
});