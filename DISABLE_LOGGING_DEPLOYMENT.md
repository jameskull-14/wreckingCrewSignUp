# Quick Guide: Disable Logging in Production

## ⚠️ Action Required for Backend (Render)

To disable all logging in your production backend, you MUST add this environment variable in Render:

### Steps:
1. Go to https://dashboard.render.com
2. Click on your backend service
3. Click "Environment" in the left sidebar
4. Click "Add Environment Variable"
5. Add:
   - **Key**: `ENVIRONMENT`
   - **Value**: `production`
6. Click "Save Changes"
7. Render will automatically redeploy (wait 2-3 minutes)

### Verify Backend Logging is Disabled:
1. Go to your service in Render
2. Click "Logs" tab
3. You should NO LONGER see print statements like:
   - `🎭 Featured act:`
   - `💾 Saving featured act:`
   - `📥 Session data fetched`
   - `⏭️ Skipping slot`
   - etc.
4. You WILL still see system logs like:
   - `Started server process`
   - `Application startup complete`
   - HTTP request logs (these are from uvicorn, not your code)

## ✅ Frontend (Vercel) - No Action Required

The frontend logging is automatically disabled in production builds. Vercel sets `NODE_ENV=production` automatically.

### Verify Frontend Logging is Disabled:
1. Visit your production site on Vercel
2. Open browser DevTools (F12)
3. Go to Console tab
4. You should see NO logs from your application code
5. Refresh the page - still no logs!

## Summary

| Platform | Action Required | Environment Variable |
|----------|----------------|---------------------|
| **Vercel** (Frontend) | ❌ None - automatic | Already set by Vercel |
| **Render** (Backend) | ✅ **YES - Add variable** | `ENVIRONMENT=production` |

## Testing

After setting `ENVIRONMENT=production` in Render:
1. Make a small change to your code (add a comment)
2. Push to main branch: `git push origin main`
3. Wait for both deployments to complete
4. Check frontend console: Should be empty ✅
5. Check backend Render logs: Should only show system logs ✅
