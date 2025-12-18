@echo off
echo ==========================================
echo  Cloverton Homes - Production Build
echo  (Node.js Standalone Mode)
echo ==========================================
echo.

REM Create deploy directory
if exist "deploy" rmdir /S /Q deploy
mkdir deploy
mkdir deploy\frontend
mkdir deploy\backend

echo.
echo [1/4] Building Frontend (Next.js Standalone)...
echo ------------------------------------------

REM Backup original config and use production config
copy next.config.js next.config.backup.js >nul
copy next.config.production.js next.config.js >nul

REM Clear cache and build
if exist ".next" rmdir /S /Q .next >nul 2>&1
call npm run build

REM Restore original config
copy next.config.backup.js next.config.js >nul
del next.config.backup.js >nul

echo.
echo [2/4] Building Backend (Express API)...
echo ------------------------------------------
cd server
call npm run build
cd ..

echo.
echo [3/4] Copying Frontend Files for Deployment...
echo ------------------------------------------

REM Copy standalone server
xcopy /E /Y /I .next\standalone deploy\frontend >nul
echo   - Copied Next.js standalone server

REM Copy static files
xcopy /E /Y /I .next\static deploy\frontend\.next\static >nul
echo   - Copied static assets

REM Copy public folder
xcopy /E /Y /I public deploy\frontend\public >nul
echo   - Copied public folder

REM Create frontend package.json for Hostinger
(
echo {
echo   "name": "cloverton-homes-frontend",
echo   "version": "1.0.0",
echo   "scripts": {
echo     "start": "node server.js"
echo   },
echo   "engines": {
echo     "node": "^18.0.0 || ^20.0.0"
echo   }
echo }
) > deploy\frontend\package.json
echo   - Created frontend package.json

REM Create ecosystem config for PM2
(
echo module.exports = {
echo   apps: [{
echo     name: 'cloverton-frontend',
echo     script: 'server.js',
echo     instances: 1,
echo     autorestart: true,
echo     watch: false,
echo     max_memory_restart: '512M',
echo     env: {
echo       NODE_ENV: 'production',
echo       PORT: 3000
echo     }
echo   }]
echo }
) > deploy\frontend\ecosystem.config.cjs
echo   - Created PM2 config

echo.
echo [4/4] Copying Backend Files for Deployment...
echo ------------------------------------------

REM Copy backend dist folder
xcopy /E /Y /I server\dist deploy\backend\dist >nul
echo   - Copied backend dist

REM Copy backend package files
copy server\package.json deploy\backend\ >nul
copy server\package-lock.json deploy\backend\ >nul
copy server\ecosystem.config.cjs deploy\backend\ >nul
copy server\.env.example deploy\backend\.env.example >nul
echo   - Copied backend package files

echo.
echo Creating Deployment README...
echo ------------------------------------------

(
echo # Cloverton Homes - Deployment Package
echo.
echo Generated: %date% %time%
echo.
echo This package contains two deployable applications:
echo - Frontend: Next.js standalone server ^(Node.js^)
echo - Backend: Express API server ^(Node.js^)
echo.
echo ---
echo.
echo ## Frontend Deployment ^(deploy/frontend^)
echo.
echo Deploy to Hostinger Node.js hosting.
echo.
echo ### Setup Steps:
echo 1. Upload all files from deploy/frontend/ to your Node.js app root
echo 2. Set Node.js version to 18+ in Hostinger settings
echo 3. Set startup file to: server.js
echo 4. Set environment variables:
echo    - NODE_ENV=production
echo    - PORT=3000 ^(or as assigned by Hostinger^)
echo    - NEXT_PUBLIC_API_URL=https://your-backend-domain.com/api
echo 5. Start the application
echo.
echo The frontend is a self-contained Next.js server that handles all routes.
echo.
echo ---
echo.
echo ## Backend Deployment ^(deploy/backend^)
echo.
echo Deploy to a separate Node.js hosting or subdomain.
echo.
echo ### Setup Steps:
echo 1. Upload all files from deploy/backend/ to your Node.js app root
echo 2. Rename .env.example to .env and fill in your values:
echo    - DATABASE_URL: Your Supabase PostgreSQL connection string
echo    - SUPABASE_URL: Your Supabase project URL
echo    - SUPABASE_ANON_KEY: Your Supabase anon key
echo    - SUPABASE_SERVICE_ROLE_KEY: Your Supabase service role key
echo    - BETTER_AUTH_SECRET: A secure random string ^(32+ chars^)
echo    - BETTER_AUTH_URL: Your backend URL ^(e.g., https://api.yourdomain.com^)
echo    - BETTER_AUTH_TRUSTED_ORIGINS: Your frontend URLs, comma-separated
echo    - FRONTEND_URL: Your frontend URL
echo 3. Run: npm install --production
echo 4. Set startup file to: dist/index.js
echo 5. Start the application
echo.
echo ---
echo.
echo ## Configuration Notes
echo.
echo 1. BEFORE building, update .env.production in project root:
echo    Set NEXT_PUBLIC_API_URL to your backend URL
echo.
echo 2. Update backend CORS settings to allow your frontend domain
echo.
echo 3. Ensure Supabase database has all tables ^(run npm run db:push locally first^)
echo.
echo ---
echo.
echo ## Hostinger Node.js Hosting Guide
echo.
echo 1. Go to Hostinger hPanel
echo 2. Navigate to Website ^-^> Node.js
echo 3. Create a new Node.js application
echo 4. Upload files via FTP or Git
echo 5. Configure environment variables
echo 6. Set startup file and start
) > deploy\README.md

echo   - Created README.md

echo.
echo ==========================================
echo  BUILD COMPLETE!
echo ==========================================
echo.
echo Deployment files created in: deploy\
echo.
echo   Frontend: deploy\frontend\ ^(Node.js standalone^)
echo   Backend:  deploy\backend\  ^(Express API^)
echo.
echo NEXT STEPS:
echo 1. Edit .env.production with your backend URL
echo 2. Run this script again if you changed .env.production
echo 3. Upload frontend to Hostinger Node.js hosting
echo 4. Upload backend to Hostinger Node.js hosting ^(separate app^)
echo.
echo See deploy\README.md for detailed instructions.
echo.
pause
