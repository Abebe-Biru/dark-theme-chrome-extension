// Options page JavaScript

document.addEventListener('DOMContentLoaded', initializeOptionsPage);

async function initializeOptionsPage() {
    console.log('Options page initialized');
    
    // Load saved settings
    await loadSettings();
    
    // Set up event listeners
    setupEventListeners();
    
    // Set version info
    setVersionInfo();
    
    showStatus('Settings loaded successfully!', 'success');
}

async function loadSettings() {
    try {
        // Load all settings from storage
        const result = await chrome.storage.local.get([
            'extensionEnabled',
            'darkModeEnabled',
            'darkModeIntensity',
            'autoApplyDarkMode',
            'websiteSettings'
        ]);
        
        // Set toggle states
        const enableExtensionEl = document.getElementById('enableExtension');
        if (enableExtensionEl) {
            enableExtensionEl.checked = result.extensionEnabled !== false;
        }
        
        const darkModeEl = document.getElementById('darkMode');
        if (darkModeEl) {
            darkModeEl.checked = result.darkModeEnabled || false;
        }
        
        const darkModeIntensityEl = document.getElementById('darkModeIntensity');
        if (darkModeIntensityEl) {
            darkModeIntensityEl.value = result.darkModeIntensity || 'medium';
        }
        
        const autoApplyDarkModeEl = document.getElementById('autoApplyDarkMode');
        if (autoApplyDarkModeEl) {
            autoApplyDarkModeEl.checked = result.autoApplyDarkMode !== false;
        }
        
        // Set last updated
        const lastUpdatedEl = document.getElementById('lastUpdated');
        if (lastUpdatedEl && result.lastUpdated) {
            lastUpdatedEl.textContent = new Date(result.lastUpdated).toLocaleString();
        }
        
        // Load website settings
        loadWebsiteSettings(result.websiteSettings || {});
        
    } catch (error) {
        console.error('Error loading settings:', error);
        showStatus('Error loading settings', 'error');
    }
}

function loadWebsiteSettings(websiteSettings) {
    try {
        const websiteList = document.getElementById('websiteList');
        if (!websiteList) {
            console.warn('Website list element not found');
            return;
        }
        
        websiteList.innerHTML = '';
        
        if (Object.keys(websiteSettings).length === 0) {
            websiteList.innerHTML = '<p style="color: #aaa; text-align: center; padding: 20px;">No website exceptions configured</p>';
            return;
        }
        
        for (const [domain, settings] of Object.entries(websiteSettings)) {
            const websiteItem = document.createElement('div');
            websiteItem.className = 'setting';
            websiteItem.innerHTML = `
                <div>
                    <div class="setting-label">${domain}</div>
                    <div class="setting-description">
                        Dark mode ${settings.darkModeEnabled ? 'enabled' : 'disabled'} 
                        (${new Date(settings.addedDate).toLocaleDateString()})
                    </div>
                </div>
                <button class="btn btn-danger remove-website" data-domain="${domain}" style="padding: 5px 10px; font-size: 12px;">
                    Remove
                </button>
            `;
            websiteList.appendChild(websiteItem);
        }
        
        // Add event listeners to remove buttons
        document.querySelectorAll('.remove-website').forEach(button => {
            button.addEventListener('click', function() {
                const domain = this.getAttribute('data-domain');
                removeWebsiteSetting(domain);
            });
        });
    } catch (error) {
        console.error('Error loading website settings:', error);
        showStatus('Error loading website settings', 'error');
    }
}

async function loadStatistics() {
    // Placeholder function - statistics removed for simplicity
}

function setupEventListeners() {
    try {
        // Save button
        const saveAllBtn = document.getElementById('saveAll');
        if (saveAllBtn) {
            saveAllBtn.addEventListener('click', saveAllSettings);
        }
        
        // Reset button
        const resetToDefaultBtn = document.getElementById('resetToDefault');
        if (resetToDefaultBtn) {
            resetToDefaultBtn.addEventListener('click', resetToDefault);
        }
        
        // Add website exception button
        const addWebsiteExceptionBtn = document.getElementById('addWebsiteException');
        if (addWebsiteExceptionBtn) {
            addWebsiteExceptionBtn.addEventListener('click', addWebsiteException);
        }
        
        // Auto-save on toggle changes
        document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', saveAllSettings);
        });
        
        // Auto-save on select changes
        document.querySelectorAll('select').forEach(select => {
            select.addEventListener('change', saveAllSettings);
        });
    } catch (error) {
        console.error('Error setting up event listeners:', error);
    }
}

function setActiveColor(color) {
    // Placeholder function - color picker removed for simplicity
}

async function saveAllSettings() {
    try {
        // Gather all settings
        const settings = {};
        
        const enableExtensionEl = document.getElementById('enableExtension');
        if (enableExtensionEl) {
            settings.extensionEnabled = enableExtensionEl.checked;
        }
        
        const darkModeEl = document.getElementById('darkMode');
        if (darkModeEl) {
            settings.darkModeEnabled = darkModeEl.checked;
        }
        
        const darkModeIntensityEl = document.getElementById('darkModeIntensity');
        if (darkModeIntensityEl) {
            settings.darkModeIntensity = darkModeIntensityEl.value;
        }
        
        const autoApplyDarkModeEl = document.getElementById('autoApplyDarkMode');
        if (autoApplyDarkModeEl) {
            settings.autoApplyDarkMode = autoApplyDarkModeEl.checked;
        }
        
        settings.lastUpdated = new Date().toISOString();
        
        // Save to storage
        await chrome.storage.local.set(settings);
        
        // Show success message
        showStatus('Settings saved successfully!', 'success');
        
        // Update last updated display
        const lastUpdatedEl = document.getElementById('lastUpdated');
        if (lastUpdatedEl) {
            lastUpdatedEl.textContent = new Date().toLocaleString();
        }
        
        // Notify other parts of the extension
        chrome.runtime.sendMessage({
            action: 'settingsUpdated',
            settings: settings
        });
        
    } catch (error) {
        console.error('Error saving settings:', error);
        showStatus('Error saving settings', 'error');
    }
}

async function resetToDefault() {
    if (!confirm('Are you sure you want to reset all settings to default?')) {
        return;
    }
    
    try {
        const defaultSettings = {
            extensionEnabled: true,
            darkModeEnabled: false,
            darkModeIntensity: 'medium',
            autoApplyDarkMode: true
        };
        
        // Apply default settings to UI
        const enableExtensionEl = document.getElementById('enableExtension');
        if (enableExtensionEl) {
            enableExtensionEl.checked = defaultSettings.extensionEnabled;
        }
        
        const darkModeEl = document.getElementById('darkMode');
        if (darkModeEl) {
            darkModeEl.checked = defaultSettings.darkModeEnabled;
        }
        
        const darkModeIntensityEl = document.getElementById('darkModeIntensity');
        if (darkModeIntensityEl) {
            darkModeIntensityEl.value = defaultSettings.darkModeIntensity;
        }
        
        const autoApplyDarkModeEl = document.getElementById('autoApplyDarkMode');
        if (autoApplyDarkModeEl) {
            autoApplyDarkModeEl.checked = defaultSettings.autoApplyDarkMode;
        }
        
        // Save defaults
        await chrome.storage.local.set(defaultSettings);
        
        showStatus('Settings reset to default!', 'success');
        
    } catch (error) {
        console.error('Error resetting settings:', error);
        showStatus('Error resetting settings', 'error');
    }
}

function addWebsiteException() {
    try {
        const domainInput = document.getElementById('newWebsiteDomain');
        const settingSelect = document.getElementById('newWebsiteSetting');
        
        if (!domainInput || !settingSelect) {
            showStatus('Required form elements not found', 'error');
            return;
        }
        
        const domain = domainInput.value.trim();
        const setting = settingSelect.value;
        
        if (!domain) {
            showStatus('Please enter a domain name', 'error');
            return;
        }
        
        // Validate domain format (simple validation)
        if (!domain.includes('.') || domain.startsWith('.') || domain.endsWith('.')) {
            showStatus('Please enter a valid domain name', 'error');
            return;
        }
        
        saveWebsiteSetting(domain, setting === 'enable');
        domainInput.value = '';
    } catch (error) {
        console.error('Error adding website exception:', error);
        showStatus('Error adding website exception', 'error');
    }
}

async function saveWebsiteSetting(domain, enabled) {
    try {
        // Get existing website settings
        const result = await chrome.storage.local.get(['websiteSettings']);
        let websiteSettings = result.websiteSettings || {};
        
        // Update website settings
        websiteSettings[domain] = {
            darkModeEnabled: enabled,
            addedDate: new Date().toISOString()
        };
        
        // Save updated settings
        await chrome.storage.local.set({ websiteSettings });
        
        // Reload the website settings list
        loadWebsiteSettings(websiteSettings);
        
        showStatus(`Website exception saved for ${domain}`, 'success');
    } catch (error) {
        console.error('Error saving website setting:', error);
        showStatus('Error saving website setting', 'error');
    }
}

async function removeWebsiteSetting(domain) {
    try {
        // Get existing website settings
        const result = await chrome.storage.local.get(['websiteSettings']);
        let websiteSettings = result.websiteSettings || {};
        
        // Remove the website setting
        delete websiteSettings[domain];
        
        // Save updated settings
        await chrome.storage.local.set({ websiteSettings });
        
        // Reload the website settings list
        loadWebsiteSettings(websiteSettings);
        
        showStatus(`Removed exception for ${domain}`, 'success');
    } catch (error) {
        console.error('Error removing website setting:', error);
        showStatus('Error removing website setting', 'error');
    }
}

function showStatus(message, type = 'success') {
    try {
        const statusElement = document.getElementById('statusMessage');
        if (!statusElement) {
            console.warn('Status message element not found');
            return;
        }
        
        statusElement.textContent = message;
        statusElement.className = `status-message ${type}`;
        statusElement.style.display = 'block';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            if (statusElement) {
                statusElement.style.display = 'none';
            }
        }, 5000);
    } catch (error) {
        console.error('Error showing status:', error);
    }
}

function setVersionInfo() {
    try {
        const versionInfoEl = document.getElementById('versionInfo');
        if (!versionInfoEl) {
            console.warn('Version info element not found');
            return;
        }
        
        const manifest = chrome.runtime.getManifest();
        versionInfoEl.textContent = manifest.version;
    } catch (error) {
        console.error('Error setting version info:', error);
        const versionInfoEl = document.getElementById('versionInfo');
        if (versionInfoEl) {
            versionInfoEl.textContent = 'Unknown';
        }
    }
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeOptionsPage,
        loadSettings,
        saveAllSettings,
        resetToDefault,
        setVersionInfo
    };
}