# Vigil AI - Browser Extension

🔍 **AI-powered fact-checking extension for Chrome/Edge**

Instantly verify content on YouTube, Instagram, Twitter, news websites, and more!

---

## 📦 Installation

### Method 1: Load Unpacked (Development)

1. **Open Chrome/Edge Extensions Page:**
   - Chrome: Navigate to `chrome://extensions/`
   - Edge: Navigate to `edge://extensions/`

2. **Enable Developer Mode:**
   - Toggle the "Developer mode" switch in the top-right corner

3. **Load the Extension:**
   - Click "Load unpacked"
   - Select the `vigil-extension` folder
   - The extension should now appear in your browser!

### Method 2: Chrome Web Store (Coming Soon)
We'll publish to the Chrome Web Store after testing!

---

## 🚀 Setup

### 1. Start Your Backend

```bash
cd backend
python main.py
```

Your backend should be running on `http://localhost:8000`

### 2. Use the Extension

- Visit any supported website (YouTube, Instagram, Twitter, news sites)
- Click the floating **"🔍 Fact Check"** button on the page
- Or click the extension icon and select **"Fact Check This Page"**
- Wait for AI analysis (30-60 seconds)
- View detailed results in the overlay!

---

## ✨ Features

### Current Features:
- ✅ **Floating Fact-Check Button** on every webpage
- ✅ **Beautiful Results Overlay** with trust scores
- ✅ **Popup Dashboard** with statistics
- ✅ **Backend Status Indicator**
- ✅ **Support for Multiple Content Types:**
  - YouTube videos & shorts
  - Instagram reels & posts
  - Twitter/X posts
  - News articles & webpages
  - Documents (PDF)
  - Images

### Coming Soon:
- 📊 Analysis history & saved reports
- 🔔 Real-time notifications
- 🎨 Customizable themes
- 🌐 Multi-language support
- 🤝 Community fact-check sharing

---

## 🎯 Supported Platforms

| Platform | Status |
|----------|--------|
| YouTube Videos | ✅ Full Support |
| YouTube Shorts | ✅ Full Support |
| Instagram Reels | ✅ Full Support |
| Twitter/X Posts | ✅ Full Support |
| News Websites | ✅ Full Support |
| Documents (PDF) | ✅ Full Support |
| Images | ✅ Full Support |
| Audio Files | ⏳ Coming Soon |

---

## 🛠️ Technical Details

### Architecture:
```
Browser Extension (Frontend)
    ↓
Content Script (Injected into webpages)
    ↓
Background Service Worker
    ↓
FastAPI Backend (localhost:8000)
    ↓
Gemini AI API + SerpAPI
```

### Files Structure:
```
vigil-extension/
├── manifest.json              # Extension configuration
├── popup/
│   ├── popup.html            # Extension popup UI
│   ├── popup.js              # Popup logic
│   └── popup.css             # Popup styles
├── content/
│   ├── content.js            # Page injection script
│   └── content.css           # Page styles
├── background/
│   └── service-worker.js     # Background tasks
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md
```

---

## 🔧 Configuration

### Backend URL
The extension is configured to connect to `http://localhost:8000` by default.

To change this, edit:
- `background/service-worker.js` - Line 7: `API_URL`
- `popup/popup.js` - Line 13: `API_URL`

### CORS Setup
Make sure your backend has CORS enabled:

```python
# In backend/main.py
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 🐛 Troubleshooting

### "Backend Offline" Error
**Solution:** Make sure your backend is running:
```bash
cd backend
python main.py
```

### "Cannot connect to backend" Error
**Solution:** Check that:
1. Backend is running on `http://localhost:8000`
2. CORS is properly configured
3. No firewall blocking the connection

### Button doesn't appear on page
**Solution:**
1. Refresh the webpage
2. Check browser console for errors (F12)
3. Try reloading the extension

### Analysis takes too long
**Solution:**
- Video analysis takes 30-60 seconds
- Documents take 15-30 seconds
- Webpages take 10-20 seconds
- This is normal due to AI processing time

---

## 🎨 Customization

### Change Button Position
Edit `content/content.js` line 55-57:
```javascript
bottom: 20px;  // Distance from bottom
right: 20px;   // Distance from right
```

### Change Theme Colors
Edit `content/content.js` and `popup/popup.css` to customize:
- Primary gradient: `#667eea` to `#764ba2`
- Trust score colors (red/yellow/green)
- Background colors

---

## 📊 Privacy & Security

- ✅ **No data collection** - All analysis stays between you and your backend
- ✅ **Local processing** - Your backend handles everything
- ✅ **No tracking** - We don't track your browsing
- ✅ **Open source** - Full transparency

---

## 🤝 Contributing

Want to improve Vigil AI? Here's how:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

## 📄 License

[Your License Here]

---

## 🌟 Support

If you find Vigil AI useful, please:
- ⭐ Star the repository
- 🐛 Report bugs
- 💡 Suggest features
- 📢 Share with others

---

## 🔮 Roadmap

- [ ] Chrome Web Store publication
- [ ] Firefox support
- [ ] Safari support
- [ ] History & saved reports
- [ ] Batch analysis
- [ ] Export reports as PDF
- [ ] Browser notifications
- [ ] Dark/Light theme toggle
- [ ] Keyboard shortcuts
- [ ] Community fact-check database

---

**Built with ❤️ by the Vigil AI Team**

For questions or support, open an issue on GitHub!
