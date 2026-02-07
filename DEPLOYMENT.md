# Deployment Guide: Ryaion Platform

This guide outlines how to deploy the Ryaion AI Stock Intelligence Platform. For the best experience, we recommend a **Hybrid Deployment**.

---

## 🚀 Option 1: Hybrid Deployment (Recommended)

### Frontend (Vercel)
Vercel is the best platform for hosting the Vite/React frontend due to its global CDN and edge performance.

1.  **Push your code** to GitHub.
2.  Go to [Vercel](https://vercel.com) and click **"Add New"** -> **"Project"**.
3.  Select your `ryaion` repository.
4.  **Configuration**:
    *   Framework Preset: `Vite`
    *   Root Directory: `./` (Root)
5.  **Environment Variables**:
    *   `VITE_SUPABASE_URL`: Your Supabase URL
    *   `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon Key
    *   `VITE_BASE_URL`: The URL of your deployed backend (e.g., `https://ryaion-api.ondigitalocean.app`)
6.  Click **Deploy**.

### Backend (DigitalOcean App Platform)
The backend requires a persistent server to handle WebSockets (Socket.io) and the real-time Market Simulator. DigitalOcean App Platform is recommended for this.

1.  **Preparation**: Ensure the `app.yaml` in the root reflects your GitHub repo name.
2.  **Create App**: In DigitalOcean, go to **Apps** -> **Create**.
3.  **Source**: Select GitHub and choose your repository.
4.  **Components**: It will detect the `backend` directory (via Dockerfile).
5.  **Environment Variables**: Set these in the DO Console:
    *   `VITE_SUPABASE_URL`
    *   `VITE_SUPABASE_ANON_KEY`
    *   `SUPABASE_SERVICE_ROLE_KEY`
    *   `GEMINI_API_KEY`
    *   `GENAI_AGENT_URL`
    *   `GENAI_AGENT_KEY`

---

## 🛠 Option 2: Full DigitalOcean Deployment
You can host both the frontend and backend on DigitalOcean using the provided `app.yaml`.

1.  **Update `app.yaml`**: Set your GitHub repo path.
2.  **Push to GitHub**: DigitalOcean will build both the Static Site (Frontend) and the Web Service (Backend).
3.  The frontend will automatically link to the backend via the `${ryaion-backend.PUBLIC_URL}` variable.

---

## 💻 Local Testing with Docker
Test the production environment locally:

```bash
cd backend
docker-compose up --build
```

The API will be available at `http://localhost:3001`.

## ⚠️ Important Note on Vercel for Backend
While Vercel supports Node.js functions, it **does not support persistent WebSockets (Socket.io)** or long-running background intervals (like our Market Simulator). If you deploy the backend to Vercel, the real-time price updates and the "Battle Arena" timers will not function correctly. **Always host the backend on a platform that supports persistent processes (DigitalOcean, Render, Railway, etc.).**
