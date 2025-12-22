@echo off
echo ========================================
echo Vigil AI Extension - Icon Setup Helper
echo ========================================
echo.

echo This script will help you set up placeholder icons for testing.
echo.
echo You need 3 PNG files named:
echo   - icon16.png (16x16 pixels)
echo   - icon48.png (48x48 pixels)
echo   - icon128.png (128x128 pixels)
echo.

:MENU
echo What would you like to do?
echo.
echo 1. Check if icons exist
echo 2. Instructions for creating icons
echo 3. Open icons folder
echo 4. Exit
echo.
set /p choice="Enter your choice (1-4): "

if "%choice%"=="1" goto CHECK
if "%choice%"=="2" goto INSTRUCTIONS
if "%choice%"=="3" goto OPEN
if "%choice%"=="4" goto EXIT

echo Invalid choice. Please try again.
echo.
goto MENU

:CHECK
echo.
echo Checking for icon files...
echo.

if exist "icons\icon16.png" (
    echo [OK] icon16.png found
) else (
    echo [MISSING] icon16.png NOT found
)

if exist "icons\icon48.png" (
    echo [OK] icon48.png found
) else (
    echo [MISSING] icon48.png NOT found
)

if exist "icons\icon128.png" (
    echo [OK] icon128.png found
) else (
    echo [MISSING] icon128.png NOT found
)

echo.
if exist "icons\icon16.png" if exist "icons\icon48.png" if exist "icons\icon128.png" (
    echo All icons found! You're ready to load the extension!
) else (
    echo Some icons are missing. Please add them to the icons folder.
)
echo.
pause
goto MENU

:INSTRUCTIONS
echo.
echo ========================================
echo Icon Creation Instructions
echo ========================================
echo.
echo OPTION 1 - Quick Test (Recommended for now):
echo   1. Find ANY 3 PNG files on your computer
echo   2. Copy them to the 'icons' folder
echo   3. Rename them to: icon16.png, icon48.png, icon128.png
echo   4. The extension will work fine for testing!
echo.
echo OPTION 2 - Generate Proper Icons:
echo   1. Visit: https://www.favicon-generator.org/
echo   2. Upload a logo or create one
echo   3. Download in 3 sizes (16x16, 48x48, 128x128)
echo   4. Rename and place in 'icons' folder
echo.
echo OPTION 3 - Use Design Tool:
echo   1. Open Figma, Canva, or Photoshop
echo   2. Create 128x128px icon with:
echo      - Magnifying glass symbol
echo      - Purple/blue gradient (#667eea to #764ba2)
echo   3. Export in 3 sizes
echo.
echo See icons\ICON_INSTRUCTIONS.md for more details!
echo.
pause
goto MENU

:OPEN
echo.
echo Opening icons folder...
start "" "%cd%\icons"
echo.
echo Please add 3 PNG files named:
echo   - icon16.png
echo   - icon48.png
echo   - icon128.png
echo.
pause
goto MENU

:EXIT
echo.
echo Thanks for using Vigil AI!
echo.
exit /b
