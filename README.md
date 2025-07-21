# Perplexity TOC - Table of Contents Extension

**Version:** 1.0.0  
**Author:** Enrique Cardoza

## 📝 Description

A Chrome extension that adds an **interactive table of contents** to Perplexity.ai search pages. It enhances navigation through long conversations and improves user experience by providing a visual and functional content index.

<img width="1733" height="1147" alt="perplexity-toc-extension-ss" src="https://github.com/user-attachments/assets/063f57aa-ee9f-4539-8afe-405e246f9e27" />


## ✨ Features

- ✅ **Automatic TOC generation** from page content
- ✅ **Dynamic highlighting** of current section while scrolling
- ✅ **Smooth navigation** with animated scrolling
- ✅ **Real-time updates** when new content is added
- ✅ **Smart activation** only on search pages (/search/)
- ✅ **Responsive design** that adapts to content
- ✅ **Dark mode support**
- ✅ **Deterministic IDs** for consistent navigation
- ✅ **Intersection Observer** for efficient scroll tracking

## 🎯 Functionality

### Detected Elements:
- **User prompts** (`.group\/query` selector)
- **Response titles** (`h1` in markdown content)
- **Response subtitles** (`h2` in markdown content)

### Technical Features:
- **MutationObserver** with debounce for change detection
- **Intersection Observer** for scroll tracking
- **Click navigation** with visual feedback
- **Automatic cleanup** of resources when changing pages

## 🚀 Installation

### Method 1: Load as Unpacked Extension (Development)

1. **Download** or clone this repository:
   ```bash
   git clone [repository-url]
   cd perplexity-toc-extension
   ```

2. **Open Chrome** and navigate to `chrome://extensions`

3. **Enable** "Developer mode" (toggle in the top right corner)

4. **Click** "Load unpacked"

5. **Select** the `perplexity-toc-extension` folder

6. **Done!** The extension will be installed and active

### Method 2: Install from .crx file (when available)

1. Download the `.crx` file from the release
2. Drag the file to `chrome://extensions`
3. Confirm installation

## 📖 Usage

1. **Navigate** to [perplexity.ai](https://www.perplexity.ai)
2. **Perform** a search that generates a conversation
3. **The table of contents will appear automatically** on the right side
4. **Click** any item in the index to navigate to that section
5. **The active item is highlighted** as you scroll through the page

## 📁 Project Structure

```
perplexity-toc-extension/
├── manifest.json          # Extension configuration
├── content.js             # Main script with TOC logic
├── styles.css             # Sidebar styles
├── icons/                 # Extension icons
│   ├── icon16.png        # 16x16px for toolbar
│   ├── icon48.png        # 48x48px for extensions page
│   └── icon128.png       # 128x128px for web store
└── README.md             # This file
```

## 🛠️ Development

### Technologies Used:
- **Manifest V3** (Chrome Extensions)
- **Vanilla JavaScript** (ES6+)
- **CSS3** with custom properties
- **Chrome APIs**: Content Scripts, Host Permissions

### APIs and Techniques:
- `MutationObserver` - DOM change detection
- `IntersectionObserver` - Efficient scroll tracking
- `querySelector/querySelectorAll` - Element selection
- CSS Custom Properties - Theming and variables
- Event delegation - Efficient event handling

## 🐛 Troubleshooting

### Sidebar doesn't appear:
- ✅ Verify you're on a search page (`/search/...`)
- ✅ Verify there's content on the page
- ✅ Check the DevTools console for errors
- ✅ Reload the page

### Sidebar doesn't update:
- ✅ Wait a few seconds (there's a 100ms debounce)
- ✅ Verify new content matches the selectors
- ✅ Reload the extension at `chrome://extensions`

### Navigation issues:
- ✅ Verify elements have correct IDs
- ✅ Check for conflicts with other extensions
- ✅ Clear browser cache

## 🔒 Privacy and Permissions

This extension:
- ✅ **Does NOT require special permissions** beyond access to perplexity.ai
- ✅ **Does NOT collect personal data**
- ✅ **Does NOT send information** to external servers
- ✅ **Only works** on Perplexity.ai pages
- ✅ **All processing is local** in your browser

### Requested Permissions:
- `host_permissions: ["https://www.perplexity.ai/*"]` - Only for Perplexity access

## 📊 Performance

- ⚡ **Lightweight**: < 10KB total
- ⚡ **Efficient**: Uses Intersection Observer for tracking
- ⚡ **Debounced**: Prevents excessive processing (100ms debounce)
- ⚡ **Clean**: Cleans up resources when changing pages
- ⚡ **Optimized**: Only activates when necessary

## 🎨 Customization

You can modify `styles.css` to change:
- **Colors** of sidebar and links
- **Position** and size of sidebar
- **Fonts** and typography
- **Animations** and transitions
- **Dark mode support**

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a branch for your feature: `git checkout -b feature/new-functionality`
3. **Commit** your changes: `git commit -m 'Add new functionality'`
4. **Push** to the branch: `git push origin feature/new-functionality`
5. **Open** a Pull Request

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for more details.

## 🌟 Like the project?

If you find this extension useful:
- ⭐ Give it a star on the repository
- 🐛 Report bugs or suggest improvements
- 💡 Contribute with new functionalities
- 📢 Share it with other Perplexity users

---

**Enjoy navigating your Perplexity conversations more efficiently!** 🚀
