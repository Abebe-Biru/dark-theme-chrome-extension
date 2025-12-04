// Background Service Worker for Chrome Extension

console.log('Background service worker started');

// Extension installation or update
chrome.runtime.onInstalled.addListener((details) => {
    console.log('Extension installed/updated:', details.reason);
    
    // Initialize storage with default values
    chrome.storage.local.set({
        extensionEnabled: true,
        darkModeEnabled: false, // Keep as false by default to respect user preference
        installationDate: new Date().toISOString()
    }).then(() => {
        console.log('Default settings initialized');
    });
});

// Handle messages from popup or content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Message received:', message);
    
    switch (message.action) {
        case 'setGlobalDarkMode':
            // Set dark mode preference and apply to all tabs
            chrome.storage.local.set({ 
                darkModeEnabled: message.enabled,
                darkModeIntensity: message.intensity || 'deep'
            }, async () => {
                if (message.enabled) {
                    console.log('Global dark mode enabled');
                } else {
                    console.log('Global dark mode disabled');
                }
                
                // Notify all tabs about the change
                try {
                    const tabs = await chrome.tabs.query({});
                    for (const tab of tabs) {
                        try {
                            // Skip chrome:// and chrome-extension:// URLs
                            if (tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('chrome-extension://')) {
                                await chrome.tabs.sendMessage(tab.id, {
                                    action: 'toggleDarkMode',
                                    enabled: message.enabled
                                });
                            }
                        } catch (error) {
                            // Tab might not have content script loaded, that's okay
                            console.debug('Could not send message to tab:', tab.id);
                        }
                    }
                    
                    sendResponse({ success: true });
                } catch (error) {
                    console.error('Error notifying tabs:', error);
                    sendResponse({ success: false, error: 'Failed to notify tabs' });
                }
            });
            return true;
    }
});

// Handle tab updates to apply dark mode automatically
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {
        try {
            // Get settings including website-specific settings
            const result = await chrome.storage.local.get(['darkModeEnabled', 'darkModeIntensity', 'websiteSettings']);
            
            // Determine if dark mode should be applied for this specific website
            let shouldApplyDarkMode = result.darkModeEnabled || false;
            
            if (tab.url && result.websiteSettings) {
                try {
                    const domain = new URL(tab.url).hostname;
                    if (result.websiteSettings[domain] !== undefined) {
                        // Use website-specific setting
                        shouldApplyDarkMode = result.websiteSettings[domain].darkModeEnabled;
                    }
                } catch (e) {
                    // Invalid URL, use global setting
                    console.debug('Invalid URL, using global setting');
                }
            }
            
            if (shouldApplyDarkMode) {
                // Apply dark mode to the new tab
                try {
                    // Skip chrome:// and chrome-extension:// URLs
                    if (tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('chrome-extension://')) {
                        await chrome.tabs.sendMessage(tabId, {
                            action: 'toggleDarkMode',
                            enabled: true
                        });
                    }
                } catch (error) {
                    // Content script might not be loaded yet, that's okay
                    console.debug('Could not apply dark mode to new tab:', tabId);
                }
            }
        } catch (error) {
            console.error('Error in tab update handler:', error);
        }
    }
});

// Handle commands (keyboard shortcuts)
chrome.commands.onCommand.addListener(async (command) => {
    if (command === 'toggle-dark-mode') {
        try {
            // Get current dark mode setting
            const result = await chrome.storage.local.get(['darkModeEnabled', 'darkModeIntensity']);
            const newSetting = !(result.darkModeEnabled || false);
            const intensity = result.darkModeIntensity || 'deep';
            
            // Set the new setting and apply globally
            await chrome.storage.local.set({ 
                darkModeEnabled: newSetting,
                darkModeIntensity: intensity
            });
            
            if (newSetting) {
                console.log('Global dark mode enabled via keyboard shortcut');
            } else {
                console.log('Global dark mode disabled via keyboard shortcut');
            }
            
            // Notify all tabs about the change
            const tabs = await chrome.tabs.query({});
            for (const tab of tabs) {
                try {
                    // Skip chrome:// and chrome-extension:// URLs
                    if (tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('chrome-extension://')) {
                        await chrome.tabs.sendMessage(tab.id, {
                            action: 'toggleDarkMode',
                            enabled: newSetting
                        });
                    }
                } catch (error) {
                    // Tab might not have content script loaded, that's okay
                    console.debug('Could not send message to tab:', tab.id);
                }
            }
        } catch (error) {
            console.error('Error in command handler:', error);
        }
    }
});