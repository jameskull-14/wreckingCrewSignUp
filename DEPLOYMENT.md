# Deployment Guide

## Backend Deployment (Render)

### 1. Create a new Web Service on Render
- Go to [Render Dashboard](https://dashboard.render.com/)
- Click "New" → "Web Service"
- Connect your GitHub repository

### 2. Configure the service
- **Name**: `karaoke-backend` (or your choice)
- **Region**: Choose closest to your users
- **Root Directory**: `backend`
- **Environment**: `Docker`
- **Plan**: Choose your plan (Free tier available)

### 3. Set Environment Variables
In Render, add these environment variables:

```
DATABASE_URL=postgresql://postgres:#13Tpdnm@karaoke-instance.cri4ay2kuztf.us-west-2.rds.amazonaws.com/karaoke
FRONTEND_URL=https://your-project.vercel.app
JWT_SECRET_KEY=iVYaMySaQKYAdu17bC9L59mALfdtPxvtVUs-A3JYFeY
```

**Notes**:
- You'll need to update `FRONTEND_URL` after deploying the frontend to Vercel (step 4 of Frontend Deployment).
- `JWT_SECRET_KEY` is used for authentication tokens - keep this secret!

### 4. Deploy
- Click "Create Web Service"
- Render will automatically build and deploy using the Dockerfile
- Note the URL (e.g., `https://karaoke-backend.onrender.com`)

---

## Frontend Deployment (Vercel)

### 1. Create a new project on Vercel
- Go to [Vercel Dashboard](https://vercel.com/dashboard)
- Click "Add New" → "Project"
- Import your GitHub repository

### 2. Configure the project
- **Framework Preset**: Vite
- **Root Directory**: `frontend`
- **Build Command**: `npm run build` (auto-detected)
- **Output Directory**: `dist` (auto-detected)

### 3. Set Environment Variables
In Vercel, add this environment variable:

```
VITE_API_URL=https://karaoke-backend.onrender.com
```

Replace with your actual Render backend URL from step 1.

### 4. Deploy
- Click "Deploy"
- Vercel will build and deploy automatically
- Your frontend will be live at `https://your-project.vercel.app`

---

## Database Setup (AWS RDS - Already configured)

Your database is already set up at:
```
karaoke-instance.cri4ay2kuztf.us-west-2.rds.amazonaws.com
```

The connection string is already configured in your backend `.env` file.

---

## Testing Your Deployment

1. **Backend Health Check**:
   ```bash
   curl https://your-backend-url.onrender.com/
   ```

2. **Frontend**: Visit your Vercel URL in a browser

3. **WebSocket**: The frontend will automatically connect to the backend WebSocket

---

## Important Notes

- **CORS**: Automatically configured via `FRONTEND_URL` environment variable
- **WebSocket**: Render supports WebSockets on all plans (wss:// for https)
- **Environment Variables**: Never commit `.env` files - use platform environment variables
- **SSL**: Both Render and Vercel provide automatic HTTPS
- **Database**: Your AWS RDS database is already configured and running
- **First Deploy**: Deploy backend first, then frontend (you need the backend URL for frontend env vars)

---

## Local Development

To run locally with Docker:

```bash
# Backend
cd backend
docker build -t karaoke-backend .
docker run -p 8000:8000 -e DATABASE_URL="postgresql://postgres:#13Tpdnm@karaoke-instance.cri4ay2kuztf.us-west-2.rds.amazonaws.com/karaoke" karaoke-backend

# Frontend
cd frontend
npm install
npm run dev
```

---

## Files Created for Deployment

- ✓ `backend/Dockerfile` - Production backend container
- ✓ `backend/.dockerignore` - Excludes unnecessary files from Docker build
- ✓ `frontend/vercel.json` - Vercel configuration for SPA routing
- ✓ `frontend/.dockerignore` - Excludes unnecessary files from Docker build
