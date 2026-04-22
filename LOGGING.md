# Logging Configuration

This application includes conditional logging that automatically disables all console output in production environments.

## How It Works

### Frontend (React/Vite)
- **Development**: All logging is enabled by default
- **Production**: All logging is disabled by default
- Logging can be explicitly enabled in production by setting `VITE_ENABLE_LOGGING=true` in your `.env` file (not recommended)

### Backend (Python/FastAPI)
- **Development**: All logging is enabled by default (when `ENVIRONMENT=development`)
- **Production**: All logging is disabled by default (when `ENVIRONMENT=production`)
- Logging can be explicitly enabled in production by setting `ENABLE_LOGGING=true` in your `.env` file (not recommended)

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

When deploying to production:

1. **Frontend (Vercel/Netlify)**:
   - Vite automatically sets `MODE=production` during build
   - Make sure `VITE_ENABLE_LOGGING` is not set or is set to `false`
   - All console logs will be automatically stripped from production builds

2. **Backend (Render/Railway)**:
   - Set `ENVIRONMENT=production` in your production environment variables
   - Make sure `ENABLE_LOGGING` is not set or is set to `false`
   - All print statements using the logger will be suppressed

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
