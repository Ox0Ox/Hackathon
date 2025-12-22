# 🚀 Quick Start Guide - Vigil AI Extension

Follow these simple steps to get your fact-checking extension running!

---

## Step 1: Install Icons (Important!)

The extension needs 3 icon files to work properly:

### Quick Fix (For Testing):
1. Find any 3 small PNG images on your computer
2. Copy them to the `icons/` folder
3. Rename them to:
   - `icon16.png`
   - `icon48.png`
   - `icon128.png`

### Proper Icons (Recommended):
- See `icons/ICON_INSTRUCTIONS.md` for detailed icon creation guide
- Use the SVG provided to generate proper icons

---

## Step 2: Update Backend CORS

Make sure your backend allows extension requests:

1. Open `backend/main.py`
2. Add this code after `app = FastAPI()`:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (development only)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

3. Restart your backend:
```bash
cd backend
python main.py
```

---

## Step 3: Load Extension in Browser

### Chrome:
1. Open `chrome://extensions/`
2. Enable "Developer mode" (top-right toggle)
3. Click "Load unpacked"
4. Select the `vigil-extension` folder
5. Done! 🎉

### Edge:
1. Open `edge://extensions/`
2. Enable "Developer mode" (left sidebar)
3. Click "Load unpacked"
4. Select the `vigil-extension` folder
5. Done! 🎉

---

## Step 4: Test It Out!

1. **Start Backend:**
   ```bash
   cd backend
   python main.py
   ```
   Should show: `INFO: Uvicorn running on http://127.0.0.1:8000`

2. **Visit a Webpage:**
   - Go to YouTube and open any video
   - Or visit any news website

3. **Look for the Button:**
   - You should see a floating **"🔍 Fact Check"** button in the bottom-right
   - If not, refresh the page

4. **Click to Analyze:**
   - Click the button
   - Wait 30-60 seconds for analysis
   - View beautiful results overlay!

5. **Try the Popup:**
   - Click the extension icon in your toolbar
   - See the dashboard with stats
   - Check backend connection status

---

## Troubleshooting

### ❌ Extension won't load
**Problem:** Missing icon files  
**Solution:** Add 3 PNG files named `icon16.png`, `icon48.png`, `icon128.png` to `icons/` folder

### ❌ "Backend Offline" in popup
**Problem:** Backend not running  
**Solution:** 
```bash
cd backend
python main.py
```

### ❌ Button doesn't appear on webpage
**Problem:** Content script not injecting  
**Solution:**
1. Refresh the webpage (F5)
2. Check console for errors (F12 → Console)
3. Reload extension in chrome://extensions

### ❌ "Cannot connect to backend" error
**Problem:** CORS not configured  
**Solution:** Add CORS middleware to `backend/main.py` (see Step 2)

### ❌ Analysis fails
**Problem:** API keys missing or rate limit  
**Solution:**
1. Check your `.env` file has API keys
2. Check Gemini API quota
3. Wait 4-5 seconds between requests (rate limiting)

---

## 🎯 What to Test

1. **YouTube Video:** https://www.youtube.com/watch?v=dQw4w9WgXcQ
2. **News Article:** Any BBC, CNN, or Reuters article
3. **Instagram:** Any public reel or post
4. **Twitter/X:** Any public post

---

## 📊 Expected Behavior

### First Click:
- Button shows "⏳ Analyzing..."
- Popup shows "Backend Connected" (green dot)
- Analysis takes 30-60 seconds
- Beautiful overlay appears with:
  - Trust score (0-100)
  - Verdict
  - Analysis summary
  - Red flags (if any)
  - Verified information

### Popup Stats:
- "Checks Today" increases by 1
- "Total Checks" increases by 1
- Stats persist even after closing browser

---

## 🔥 Pro Tips

1. **Keep Backend Running:** The extension needs your backend at `http://localhost:8000`

2. **Wait Between Checks:** Rate limiting means 4.5 seconds between API calls

3. **Check Console:** Press F12 to see extension logs and debug issues

4. **Reload Extension:** After making changes, click the reload icon in chrome://extensions

5. **Test Different Content:** Try videos, articles, images - each type works differently!

---

## 🎨 Customization Ideas

- Change button position in `content/content.js`
- Modify colors in CSS files
- Add keyboard shortcuts
- Create custom notification sounds
- Build a history page

---

## ✅ Success Checklist

- [ ] Icons added to `icons/` folder
- [ ] CORS enabled in backend
- [ ] Backend running on port 8000
- [ ] Extension loaded in browser
- [ ] Button appears on webpages
- [ ] Popup shows "Backend Connected"
- [ ] First analysis completed successfully
- [ ] Results overlay displays properly

---

**You're all set! Start fact-checking! 🎉**

Need help? Check the main README.md or open an issue on GitHub.
