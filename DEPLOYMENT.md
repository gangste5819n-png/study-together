# Study Together — Production Deployment Guide

This guide provides the complete, authoritative step-by-step procedure to deploy the **Study Together** full-stack application to production.

---

## 1. System Architecture Overview

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS + PWA (Service Worker & Web App Manifest).
  - High-performance client-side Single Page Application (SPA).
  - Deployed to global static edge CDN (e.g. Render Static Site, Vercel, Netlify, Cloudflare Pages).
  - Client-side routing rewrite enabled via `public/_redirects`.
- **Backend**: Node.js (ESM) + Express 5 + Socket.IO 4.8 + Mongoose 9.
  - Stateful real-time backend running in a persistent Node.js environment.
  - In-process smart reminder scheduler running alongside the API server.
  - Production-hardened with Helmet security headers, rate limiting, and sanitized error responses.
- **Database**: MongoDB Atlas.
  - 9 indexed models (`User`, `Task`, `CheckIn`, `StudySession`, `TomorrowPact`, `Dare`, `Notification`, `NotificationPreference`, `PartnerConnection`).
- **Real-Time Communication**:
  - Room-isolated Socket.IO for two-partner presence, task synchronization, timer coordination, and reactions.
- **Audio/Video Peer-to-Peer**:
  - WebRTC PeerConnection via Google STUN defaults with optional TURN server relay support.
  - Requires valid HTTPS on the frontend for browser media device access.

---

## 2. Production Deployment Sequence

### Step 1: MongoDB Setup (MongoDB Atlas)
1. Sign in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create or select a cluster (Free M0 or Dedicated M10+).
3. Under **Database Access**, create a user (e.g. `study_prod_user`) with `readWrite` permissions on the `studytogether` database.
4. Under **Network Access**, add an IP Access Entry:
   - For managed platforms with dynamic outbound IPs (Render, Railway, Fly.io), allow access from anywhere (`0.0.0.0/0`) with your strong password.
   - For dedicated servers/VPS, enter your server's static public IP address.
5. In your cluster dashboard, click **Connect** > **Drivers** > **Node.js** to obtain the SRV connection URI:
   ```
   mongodb+srv://<username>:<password>@<cluster-domain>.mongodb.net/studytogether?retryWrites=true&w=majority
   ```
6. **Zero-Migration Verification**: The Mongoose schemas automatically create all required indexes on startup (including `metadata.dedupeKey` for notification deduplication and `roomCode` indexes).

---

### Step 2: Backend Deployment
The backend requires a persistent Node.js runtime to maintain stateful WebSocket and WebRTC signaling connections.

#### Option A: Render (Recommended PaaS)
1. Connect your repository to [Render](https://render.com).
2. Click **New** > **Web Service**.
3. Configure:
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start` (or `node server/server.js`)
   - **Health Check Path**: `/api/health`
4. Set the backend environment variables listed below.
5. Deploy the service and copy the public URL (e.g., `https://study-together-api.onrender.com`).

#### Option B: Railway
1. Click **New Project** > **Deploy from GitHub repo**.
2. Railway detects `package.json` and runs `npm start`.
3. Add Environment Variables in the project settings.
4. Under Settings, generate a public domain (e.g. `https://study-together-api.up.railway.app`).

#### Option C: Self-Hosted VPS (Ubuntu 22.04 / 24.04)
```bash
# 1. Install Node.js 20+ LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. Clone project and install dependencies
cd /var/www/study-together
npm ci --omit=dev

# 3. Configure environment variables in /etc/study-together.env
# (Ensure permissions: chmod 600 /etc/study-together.env)

# 4. Start with PM2
npm install -g pm2
pm2 start server/server.js --name "study-together-api" --env NODE_ENV=production
pm2 save && pm2 startup
```

---

### Step 3: Backend Environment Variables
Configure these variables in your backend hosting environment dashboard:

> [!WARNING]
> Never commit actual production secrets into git.

| Variable | Description | Required | Example |
| :--- | :--- | :---: | :--- |
| `NODE_ENV` | Enables production error sanitization, security checks, and strict CORS | **Yes** | `production` |
| `PORT` | Listening port (typically assigned dynamically by host) | **Yes** | `5001` (or host provided) |
| `CLIENT_URL` | Allowed frontend origin for CORS and Socket.IO (supports comma-separated list) | **Yes** | `https://studytogether.app` |
| `MONGODB_URI` | MongoDB Atlas SRV connection string | **Yes** | `mongodb+srv://...` |
| `JWT_SECRET` | 32+ character high-entropy secret string | **Yes** | Generate via `openssl rand -base64 32` |
| `JWT_EXPIRES_IN` | Token expiration duration | No | `7d` (default) |

---

### Step 4: Frontend Deployment
The frontend compiles into static assets in `dist/`.

#### Option A: Render Static Site
1. On Render, click **New** > **Static Site**.
2. Configure:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
3. Add the Frontend Environment Variables in the Environment tab.
4. In **Redirects / Rewrites**, verify the rewrite rule:
   - Source: `/*`
   - Destination: `/index.html`
   - Status: `Rewrite` (200)

#### Option B: Netlify
1. Connect repository.
2. Build command: `npm run build`.
3. Publish directory: `dist`.
4. Netlify automatically reads `public/_redirects` to handle SPA routes.

#### Option C: Vercel
1. Import project.
2. Framework preset: `Vite`.
3. Output directory: `dist`.
4. Set environment variables.

---

### Step 5: Frontend Environment Variables
Set these variables in the frontend host dashboard before triggering the build:

| Variable | Description | Required | Example |
| :--- | :--- | :---: | :--- |
| `VITE_API_URL` | Base URL for REST API (must end with `/api`) | **Yes** | `https://study-together-api.onrender.com/api` |
| `VITE_SOCKET_URL` | Origin for Socket.IO connections (base domain without `/api`) | **Yes** | `https://study-together-api.onrender.com` |
| `VITE_TURN_SERVER_URL` | Optional WebRTC TURN relay server for symmetric NATs | Optional | `turn:turn.example.com:3478` |
| `VITE_TURN_USERNAME` | TURN username | Optional | `turn_user` |
| `VITE_TURN_CREDENTIAL` | TURN password/credential | Optional | `turn_pass` |

---

### Step 6: CORS & Origins Configuration
- In `server/server.js` and `server/socket/socketHandler.js`, allowed origins are controlled by `CLIENT_URL` / `CLIENT_ORIGIN`.
- For multiple domains (e.g. `https://studytogether.app` and `https://www.studytogether.app`), separate them with commas:
  ```env
  CLIENT_URL=https://studytogether.app,https://www.studytogether.app
  ```
- In production (`NODE_ENV=production`), arbitrary or unauthorized origins are rejected with a CORS policy error.

---

### Step 7: HTTPS Requirements
- Modern browsers strictly restrict `navigator.mediaDevices.getUserMedia()` to secure contexts (`https://`).
- Both frontend and backend hosts must enforce HTTPS.
- Service Worker (`public/sw.js`) registration is also restricted to HTTPS in production.
- Render, Netlify, Railway, and Vercel automatically provision free TLS/SSL certificates via Let's Encrypt.

---

### Step 8: Socket.IO Verification
1. Open the deployed frontend in your browser.
2. Check the browser Network tab under **WS** (WebSocket).
3. Confirm connection to `wss://<your-backend-domain>/socket.io/?...`.
4. Verify the TopBar shows the green **Online** status indicator.
5. In two tabs or browsers with paired users:
   - Verify task completion triggers real-time progress update on the partner's screen.
   - Verify focus timer start/pause/reset updates instantaneously.
   - Verify cheer emojis broadcast with audio/visual feedback.

---

### Step 9: WebRTC Multi-Device Verification
> [!IMPORTANT]
> WebRTC cannot be verified on a single tab or mocked browser. Complete verification requires two separate physical devices or browsers over HTTPS.

1. Device A and Device B log in with paired partner accounts.
2. Both navigate to **Study Room** (`/study-room`).
3. Device A clicks **Start Call** / camera preview.
4. Browser prompts for camera and microphone permissions; click **Allow**.
5. Device B receives the incoming call prompt and clicks **Accept**.
6. Confirm:
   - Video feed appears in the Polaroid video frame.
   - Two-way audio is clear without feedback loops.
   - Mute microphone and disable camera buttons work smoothly.
   - Disconnecting properly cleans up media streams and returns to the ready state.

---

### Step 10: PWA Verification
1. In Chrome DevTools, open **Application** > **Manifest**.
2. Confirm:
   - `name`: "Study Together"
   - `start_url`: `/`
   - `display`: `standalone`
   - Icons render at 192x192 and 512x512.
3. In **Application** > **Service Workers**, confirm `sw.js` status is `Active and running`.
4. Check **Offline** checkbox in DevTools and refresh; verify the cute stationery offline shell renders gracefully.

---

### Step 11: Rollback Procedure

If any critical issue arises during deployment:

#### Frontend Rollback:
- **Render / Netlify / Vercel**: Go to the **Deploys** tab, find the previous successful build commit, and click **Rollback to this deploy** (instantaneous edge switchover).

#### Backend Rollback:
- **Render / Railway**: Go to **Activity** / **Deployments**, select the previous stable build, and click **Rollback**.
- Alternatively, redeploy the known stable git commit hash.

#### Database Rollback:
- MongoDB Atlas provides continuous point-in-time recovery (PITR) and automated daily snapshots.
- Under **Backup** > **Restore**, select the point in time before the deployment event.

---

## 3. Production Smoke-Test Checklist

| Test Area | Action | Expected Result | Verified |
| :--- | :--- | :--- | :---: |
| **A. Auth** | Register new user | Account created with JWT stored | [ ] |
| | Login with credentials | Redirects to Dashboard, header populated | [ ] |
| | Invalid password | Returns 401 with sanitized message | [ ] |
| | Logout | Clears token, redirects to `/login` | [ ] |
| **B. Partner** | User A generates invite | Returns 6-character room code | [ ] |
| | User B joins room | Both users show `Paired`, TopBar shows `Online` | [ ] |
| | Third user access | Third user cannot view or mutate room data | [ ] |
| **C. Tasks** | Create task | Task saved in MongoDB and displayed on lined card | [ ] |
| | Complete task | Task strikethrough, hug celebration, partner synced | [ ] |
| **D. Study Room** | Start 50m Focus timer | Countdown begins synchronously on both screens | [ ] |
| | Pause / Resume | Timer state updates on partner screen in real time | [ ] |
| **E. Tomorrow Pact**| Propose commitment | Partner sees proposed goal immediately | [ ] |
| | Confirm & Lock | Pact locked, cannot be overwritten until completed | [ ] |
| **F. Dares** | Pick Random Dare | Dare card displays prompt with high-contrast text | [ ] |
| | Mark Done | Chaos counter increments, syncs to partner | [ ] |
| **G. Progress** | View analytics | Daily, 7-day, 30-day aggregations render cleanly | [ ] |
| **H. Notifications**| Trigger smart reminder | Reminder created with deduplication | [ ] |
| **I. WebRTC** | Two-device call over HTTPS | Two-way audio/video functional | [ ] |
| **J. PWA** | Install to Home Screen | Opens as standalone app without browser chrome | [ ] |

---

## 4. Security Verification Audit

- [x] No `.env` or secret files committed (`.gitignore` enforces `.env*` exclusion).
- [x] No hardcoded passwords, MongoDB URIs, or JWT secrets in client code.
- [x] All client variables are strictly prefixed with `VITE_`.
- [x] `server/middleware/error.middleware.js` masks internal 500 stack traces in production.
- [x] `server/controllers/health.controller.js` outputs sanitized `{ connected: true, state: 'connected' }` without database hostnames.
- [x] Strict CORS origin validation blocks unauthorized web clients in production.
- [x] Helmet security headers active.
- [x] Rate limiting active on `/api` (300 req/15m) and `/api/auth` (100 req/15m).
