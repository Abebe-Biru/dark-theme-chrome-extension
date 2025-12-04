# Modern Dark Theme Browser

A Chrome extension that provides a sleek dark mode browsing experience with website-specific controls. Transform your browsing experience with customizable dark themes that can be tailored for individual websites.

## Key Features

- **Global Dark Mode**: Enable/disable dark mode across all websites with a single toggle
- **Website-Specific Controls**: Customize dark mode settings for individual websites
- **Multiple Intensity Levels**: Choose from Light Dark, Medium Dark, or Deep Black themes
- **Keyboard Shortcut**: Quickly toggle dark mode with `Ctrl+Shift+D`
- **Automatic Application**: Optionally apply dark mode to newly opened tabs automatically
- **Persistent Settings**: All preferences saved and applied across browsing sessions
- **Force Dark Mode**: Aggressive dark mode for stubborn websites that resist styling

## Installation

### For Developers

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the extension directory
5. The extension icon will appear in your Chrome toolbar

### From Chrome Web Store

*(Coming soon)*

## Usage Guide

### Popup Interface

The popup provides quick access to essential dark mode controls:

1. **Global Toggle**: Enable or disable the modern dark theme for all websites
2. **Website-Specific Toggle**: Enable or disable dark mode for the current website only
3. **Force Dark Mode**: Apply aggressive dark styling for resistant websites
4. **Keyboard Shortcut Reminder**: Shows the快捷键 for quick access

### Options Page

Access advanced settings through the popup's "Open Settings" link:

1. **Dark Mode Settings**:
   - Enable/Disable extension globally
   - Set default dark mode state
   - Choose intensity level (Light, Medium, Deep)
   - Enable automatic application to new tabs

2. **Website Management**:
   - Add exceptions for specific websites
   - Enable or disable dark mode per domain
   - View and manage all website-specific settings

## Technical Architecture

### Core Components

- **Background Script**: Manages extension lifecycle, handles events, and coordinates communication between components
- **Content Script**: Injects dark mode styles into web pages and applies website-specific settings
- **Popup Interface**: Provides user interaction point for quick toggles and access to settings
- **Options Page**: Offers advanced configuration and website-specific management
- **Storage System**: Uses Chrome's storage API to persist user preferences

### Key Technologies

- **Manifest V3**: Utilizes the latest Chrome extension platform
- **Chrome APIs**: Leverages storage, scripting, tabs, and commands APIs
- **Vanilla JavaScript**: No external dependencies for optimal performance
- **Modern CSS**: Uses contemporary styling techniques for smooth dark themes

### Data Storage

All settings are stored using `chrome.storage.local`:
- Global extension settings (enabled state, intensity levels)
- Website-specific configurations
- User preferences and customization options

## Development

### Project Structure

```
modern-dark-theme-browser/
├── background/
│   └── background.js          # Extension lifecycle management
├── content/
│   └── content.js             # Dark mode injection and website logic
├── popup/
│   ├── popup.html             # Popup UI structure
│   ├── popup.css              # Popup styling
│   └── popup.js               # Popup functionality
├── options/
│   ├── options.html           # Options page structure
│   └── options.js             # Options page functionality
├── icons/                     # Extension icons in various sizes
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── manifest.json              # Extension configuration
└── README.md                  # This file
```

### Building

No build process required - this is a pure JavaScript Chrome extension.

### Testing

Manual testing recommended:
1. Load the extension in Chrome developer mode
2. Navigate to various websites
3. Test global and website-specific toggles
4. Verify keyboard shortcut functionality
5. Check options page settings persistence

## Contribution Guidelines

We welcome contributions to improve the Modern Dark Theme Browser extension!

### How to Contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Best Practices

- Follow atomic commit principles with descriptive messages
- Ensure code is well-commented and readable
- Test changes thoroughly across different websites
- Adhere to the existing code style and structure
- Update documentation as needed

### Reporting Issues

Please report bugs or suggest enhancements by creating GitHub issues with:
- Clear description of the problem or feature request
- Steps to reproduce (for bugs)
- Expected vs. actual behavior
- Screenshots if applicable

## Screenshots

*(Screenshots would be placed here showing:)*
1. Popup interface with dark mode toggles
2. Options page with settings and website management
3. Example of dark mode applied to a popular website
4. Website-specific settings management interface

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.