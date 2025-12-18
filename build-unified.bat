@echo off
echo ==========================================
echo  Cloverton Homes - Unified Production Build
echo  (Single App Deployment)
echo ==========================================
echo.

REM Create deploy directory
if exist "deploy" rmdir /S /Q deploy
mkdir deploy
mkdir deploy\app

echo.
echo [1/3] Building Backend (with Next.js integration)...
echo ------------------------------------------
cd server
call npm run build
cd ..

echo.
echo [2/3] Building Frontend (Standard Build)...
echo ------------------------------------------
REM Ensure standard config is used
if exist "next.config.production.js" (
    del next.config.production.js
)
REM Just run standard build which outputs to .next
call npm run build

echo.
echo [3/3] Packaging Unified App...
echo ------------------------------------------

REM Copy Server build (this is the entry point)
xcopy /E /Y /I server\dist deploy\app\dist >nul
echo   - Copied Server code

REM Copy Frontend build (.next)
xcopy /E /Y /I .next deploy\app\.next >nul
echo   - Copied Next.js build (.next)

REM Copy Public assets
xcopy /E /Y /I public deploy\app\public >nul
echo   - Copied public folder

REM Copy Package files
copy server\package.json deploy\app\ >nul
copy server\package-lock.json deploy\app\ >nul
copy server\ecosystem.config.cjs deploy\app\ >nul
copy server\.env.example deploy\app\.env.example >nul

REM Create production .env from example (user needs to fill this)
copy server\.env.example deploy\app\.env >nul

echo.
echo Creating Deployment README...
echo ------------------------------------------

(
echo # Cloverton Homes - Unified App Deployment
echo.
echo Generated: %date% %time%
echo.
echo This folder contains the **Single Unified Application**.
echo It runs both the Express API and the Next.js Frontend in one process.
echo.
echo ## Deployment Instructions (Hostinger API/Node.js)
echo.
echo 1. **Upload**: Upload ALL files in this folder to your Hostinger Node.js application root.
echo.
echo 2. **Environment**:
echo    - Open `.env` file.
echo    - Fill in your database details ^(Supabase^).
echo    - Set `NODE_ENV=production`.
echo    - Set `PORT` ^(if not provided by Hostinger^).
echo    - IMPORTANT: Ensure `BETTER_AUTH_URL` matches your domain.
echo.
echo 3. **Install**: Run `npm install --production` in the console.
echo.
echo 4. **Start**:
echo    - Startup File: `dist/index.js`
echo    - Start command: `npm start` or `pm2 start ecosystem.config.cjs`
echo.
echo ## Troubleshooting
echo - If static files handling fails, ensure the `public` folder is in the root.
echo - If Next.js fails to start, check `NODE_ENV=production`.
) > deploy\app\README.md

echo   - Created README.md

echo.
echo ==========================================
echo  UNIFIED BUILD COMPLETE!
echo ==========================================
echo.
echo Deployment package ready in: deploy/app
echo.
echo Upload just this ONE folder to Hostinger.
echo.
pause
