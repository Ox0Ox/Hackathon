# Icon Generation Instructions

Since we can't generate PNG files directly, here's how to create your extension icons:

## Option 1: Use Online Icon Generator
1. Go to https://www.favicon-generator.org/
2. Upload a logo or create one
3. Generate icons in sizes: 16x16, 48x48, 128x128
4. Download and rename them to:
   - icon16.png
   - icon48.png
   - icon128.png
5. Place them in the `icons/` folder

## Option 2: Use Figma/Canva
1. Create a square canvas (512x512px recommended)
2. Design your icon with:
   - Magnifying glass symbol 🔍
   - Vigil AI branding
   - Purple/blue gradient (#667eea to #764ba2)
3. Export in 3 sizes:
   - 16x16px (toolbar icon)
   - 48x48px (extension management)
   - 128x128px (Chrome Web Store)

## Option 3: Quick SVG to PNG Conversion
Use this SVG code and convert it online:

```svg
<svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="128" height="128" rx="24" fill="url(#grad)"/>
  <circle cx="50" cy="50" r="20" fill="none" stroke="white" stroke-width="6"/>
  <line x1="65" y1="65" x2="85" y2="85" stroke="white" stroke-width="6" stroke-linecap="round"/>
  <line x1="50" y1="40" x2="50" y2="50" stroke="white" stroke-width="4" stroke-linecap="round"/>
  <line x1="55" y1="55" x2="50" y2="50" stroke="white" stroke-width="4" stroke-linecap="round"/>
</svg>
```

Convert at: https://svgtopng.com/

## Temporary Solution
For testing, you can use any 3 PNG files (just rename them). The extension will still work!

## Icon Design Tips
- Use clear, recognizable symbols
- Keep it simple (looks good at small sizes)
- Use brand colors (purple/blue gradient)
- Make sure it stands out in the toolbar
- Test on both light and dark browser themes
