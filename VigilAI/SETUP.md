# Vigil AI - Quick Setup Guide

## 📁 What's Included

This is a **clean, production-ready** copy of your Vigil AI fact-checking application with only the essential files.

### Backend Files:
- `main.py` - FastAPI server
- `fact_checker.py` - AI analysis with rate limiting (updated to use gemini-2.0-flash-exp)
- `video_processor.py` - Video frame extraction
- `requirements.txt` - Python dependencies

### Frontend Files:
- `src/` - All React components
- `package.json` - Node dependencies
- `vite.config.js` - Vite configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `postcss.config.js` - PostCSS configuration

---

## 🚀 Setup Instructions

### 1. Backend Setup

```bash
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Set your API keys (create a .env file or set environment variables)
# GOOGLE_API_KEY=your_gemini_api_key
# SERPAPI_KEY=your_serpapi_key

# Run the backend
python main.py
```

Backend will run on: **http://localhost:8000**

### 2. Frontend Setup

```bash
cd frontend

# Install Node dependencies
npm install

# Run the development server
npm run dev
```

Frontend will run on: **http://localhost:5173**

---

## 🔑 API Keys Required

1. **Gemini API Key** - Get from: https://ai.google.dev/
2. **SerpAPI Key** (optional)** - Get from: https://serpapi.com/

Set them as environment variables or create a `.env` file in the backend folder:

```
GOOGLE_API_KEY=your_key_here
SERPAPI_KEY=your_key_here
```

---

## ✅ Recent Updates

- ✅ **Rate limiting** added to prevent 429 errors (4.5s between API calls)
- ✅ **Model updated** from gemini-2.5-pro to gemini-2.0-flash-exp (free tier compatible)
- ✅ Supports: Videos, Audio, Documents, Images, Webpages, YouTube URLs

---

## 📝 Usage

1. Start backend: `python main.py`
2. Start frontend: `npm run dev`
3. Open browser: http://localhost:5173
4. Upload media or paste URL to analyze

---

## 🎯 What Was Removed

- `__pycache__/` folders
- `node_modules/` folder (reinstall with npm install)
- `analysis/` folder (old test results)
- `temp_media/` folder (temporary files)
- Debug scripts and test files
- Documentation markdown files

---

## 💡 Tips

- First run might take time to install dependencies
- Videos take ~30-60 seconds to analyze
- Stay under 13 requests/minute to avoid rate limits
- Check logs for detailed analysis progress

---

**Ready to use! 🎉**
