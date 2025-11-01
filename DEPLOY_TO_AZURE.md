# Deploy Frontend to Azure Static Web Apps

## The Problem
You were getting this error after deployment:
```
Failed to load module script: Expected a JavaScript-or-Wasm module script but the server responded with a MIME type of "application/octet-stream". Strict MIME type checking is enforced for module scripts per HTML spec.
```

This was caused by Azure Static Web Apps not setting the correct `Content-Type` headers for JavaScript files in the `/assets/` directory.

## The Fix
The following files have been updated to fix the issue:

### 1. `public/staticwebapp.config.json`
Added explicit `Content-Type` headers for JavaScript and CSS files in the routes configuration.

### 2. `vite.config.ts`
Added `copyPublicDir: true` to ensure the staticwebapp.config.json is copied to the dist folder.

## Deployment Steps for Separate Repository

Since your frontend is in a **separate GitHub repository**, follow these steps:

### Step 1: Copy Updated Files to Your Frontend Repository

Copy these files from your local workspace to your separate frontend repository:

1. **public/staticwebapp.config.json** - Updated with correct MIME type headers
2. **vite.config.ts** - Updated to explicitly copy public directory
3. **.github/workflows/azure-static-web-apps-black-bay-012d4530f.yml** - Your existing workflow (should be correct)

### Step 2: Verify Your Frontend Repository Structure

Your frontend repository should have this structure:
```
frontend-repo/
├── .github/
│   └── workflows/
│       └── azure-static-web-apps-black-bay-012d4530f.yml
├── public/
│   ├── staticwebapp.config.json  ← UPDATED
│   ├── logo.svg
│   ├── location-pin.svg
│   └── ...
├── src/
│   ├── components/
│   ├── pages/
│   └── ...
├── package.json
├── vite.config.ts  ← UPDATED
├── tsconfig.json
└── ...
```

### Step 3: Commit and Push

In your **separate frontend repository**:

```bash
# Navigate to your frontend repository
cd /path/to/your/frontend-repo

# Add the updated files
git add public/staticwebapp.config.json
git add vite.config.ts

# Commit the changes
git commit -m "Fix MIME type error for Azure Static Web Apps deployment"

# Push to trigger deployment
git push origin main
```

### Step 4: Monitor Deployment

1. Go to your GitHub repository
2. Click on "Actions" tab
3. Watch the "Azure Static Web Apps CI/CD" workflow run
4. Wait for it to complete (usually 2-5 minutes)

### Step 5: Verify the Fix

After deployment completes:

1. Open your Azure Static Web App URL in a browser
2. Open Developer Tools (F12)
3. Go to the Network tab
4. Refresh the page
5. Check that JavaScript files from `/assets/` have `Content-Type: text/javascript`
6. The blank page error should be gone!

## What Changed in staticwebapp.config.json

Before:
```json
"routes": [
  {
    "route": "/assets/*",
    "headers": {
      "Cache-Control": "public, max-age=31536000, immutable"
    }
  }
]
```

After:
```json
"routes": [
  {
    "route": "/assets/*.js",
    "headers": {
      "Content-Type": "text/javascript",
      "Cache-Control": "public, max-age=31536000, immutable"
    }
  },
  {
    "route": "/assets/*.mjs",
    "headers": {
      "Content-Type": "text/javascript",
      "Cache-Control": "public, max-age=31536000, immutable"
    }
  },
  {
    "route": "/assets/*.css",
    "headers": {
      "Content-Type": "text/css",
      "Cache-Control": "public, max-age=31536000, immutable"
    }
  },
  {
    "route": "/assets/*",
    "headers": {
      "Cache-Control": "public, max-age=31536000, immutable"
    }
  }
]
```

## Backend Changes

**No backend changes are needed** - this is purely a frontend configuration issue.

## Troubleshooting

### If the error persists after deployment:

1. **Clear browser cache**: Hard refresh with Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)

2. **Check the deployed config**: Verify that staticwebapp.config.json was deployed correctly by visiting:
   ```
   https://your-app.azurestaticapps.net/staticwebapp.config.json
   ```

3. **Check build logs**: Review the GitHub Actions logs to ensure the build completed without errors

4. **Verify file headers**: In browser DevTools Network tab, click on a JavaScript file and check the Response Headers for `Content-Type`

### If deployment fails:

1. Check that your GitHub secret `AZURE_STATIC_WEB_APPS_API_TOKEN_BLACK_BAY_012D4530F` is set correctly
2. Verify that the workflow file is in `.github/workflows/` directory
3. Check that Node.js version 18 is available in the workflow

## Success Indicators

✅ GitHub Actions workflow completes successfully
✅ No console errors in browser
✅ Application loads correctly
✅ JavaScript files have correct Content-Type headers
✅ Your app displays normally (no blank page)

---

**Note**: The local version works because local development servers (Vite) automatically set correct MIME types. This only affects production deployment to Azure Static Web Apps.

