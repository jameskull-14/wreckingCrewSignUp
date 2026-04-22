# Logging Configuration

This application automatically disables all console/print logging in production environments.

## How It Works

### Frontend (React/Vite)
- **Development**: All logging is enabled by default
- **Production**: All logging is disabled via THREE methods:
  1. Runtime console override in `main.tsx` (disables console methods)
  2. Build-time removal via esbuild `drop` option in `vite.config.js` (strips console statements from bundle)
  3. Environment check for explicit override

### Backend (Python/FastAPI)
- **Development**: All logging is enabled by default (when `ENVIRONMENT=development`)
- **Production**: All logging is disabled by overriding the built-in `print` function in `main.py`
- Requires `ENVIRONMENT=production` to be set in production environment variables

## Usage

### Frontend
Instead of using `console.log()`, import and use the logger:

```typescript
import logger from '@/utils/logger';

// Use logger instead of console
logger.log('This message only shows in development');
logger.error('Error message');
logger.warn('Warning message');
logger.info('Info message');
```

### Backend
Instead of using `print()`, import and use the logger:

```python
from utils.logger import logger

# Use logger instead of print
logger.log('This message only shows in development')
logger.error('Error message')
logger.warn('Warning message')
logger.info('Info message')
```

## Environment Variables

### Frontend (.env)
```bash
# Logging is always enabled in development mode
# Set to 'true' to enable logging in production (not recommended)
VITE_ENABLE_LOGGING=false
```

### Backend (.env)
```bash
# Environment: development or production
ENVIRONMENT=development

# Set to 'true' to enable logging in production (not recommended)
ENABLE_LOGGING=false
```

## Production Deployment

### Frontend (Vercel)

**IMPORTANT**: No environment variables needed! Logging is automatically disabled when Vercel builds with `NODE_ENV=production`.

Optional environment variable (only if you need to force enable logging):
- `VITE_ENABLE_LOGGING=true` (NOT recommended)

**How to verify**:
1. Deploy to Vercel
2. Open browser console on your production site
3. You should see NO console logs

### Backend (Render)

**REQUIRED**: You MUST set this environment variable in Render:

1. Go to your Render dashboard
2. Select your backend service
3. Go to "Environment" tab
4. Add environment variable:
   ```
   ENVIRONMENT=production
   ```
5. Click "Save Changes"
6. Render will automatically redeploy

Optional environment variable (only if you need to force enable logging):
- `ENABLE_LOGGING=true` (NOT recommended)

**How to verify**:
1. Check Render logs after deployment
2. You should see NO print statements from your code
3. Only system/server logs will appear

## Migration Guide

To migrate existing code:

### Frontend
Replace all instances of:
- `console.log()` → `logger.log()`
- `console.error()` → `logger.error()`
- `console.warn()` → `logger.warn()`
- `console.info()` → `logger.info()`

### Backend
Replace all instances of:
- `print()` → `logger.log()`

Add the import at the top of each file:
- Frontend: `import logger from '@/utils/logger';`
- Backend: `from utils.logger import logger`

## Benefits

1. **Cleaner Production Logs**: No debug messages cluttering production logs
2. **Better Performance**: Fewer console operations in production
3. **Security**: Prevents accidentally exposing sensitive data in browser console
4. **Easy Toggle**: Can temporarily enable logging in production for debugging if needed
