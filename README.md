# PRO TV PLUS | Next-Gen IPTV Hub & EPG Client

Stream premium live channels in spectacular HD with an elegant, responsive, and low-latency interface. Featuring sandbox M3U parsing, dynamic Electronic Program Guide (EPG) views, interactive category hubs, and custom-styled Android mobile presentation slides.

---

## 🚀 Cloudflare Pages Deployment Guide

PRO TV PLUS is built as a highly performant Single Page Application (SPA) using React, TypeScript, and Vite. This makes it an ideal fit for **Cloudflare Pages**, offering global edge delivery, sub-second load times, and DDoS protection.

Follow these simple steps to deploy your application to Cloudflare Pages:

### Step 1: Push Code to GitHub / GitLab
1. Initialize a Git repository in your project folder (if not already done):
   ```bash
   git init
   git add .
   git commit -m "feat: initial commit for PRO TV PLUS"
   ```
2. Create a repository on GitHub (e.g., `protvplus-iptv-client`).
3. Link and push your local repository:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Connect to Cloudflare Pages
1. Log in to your [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. In the sidebar, navigate to **Workers & Pages** > **Pages** > **Create a project**.
3. Select **Connect to Git** and choose your provider (GitHub or GitLab).
4. Authorize Cloudflare and select your newly created repository.

### Step 3: Configure Build & Deployment Settings
Cloudflare Pages will automatically detect standard repository structures, but make sure to input or verify the following configuration fields:

*   **Project Name:** `protvplus` (or any custom identifier)
*   **Production Branch:** `main` (or `master`)
*   **Framework Preset:** `Vite`
*   **Build Command:** `npm run build`
*   **Build Output Directory:** `dist`

#### ⚙️ Build Environment Variables
Vite requires Node.js version 18 or higher to bundle assets properly. Ensure this is configured:
1. Under **Environment variables (advanced)**, add a new variable:
    *   **Variable Name:** `NODE_VERSION`
    *   **Value:** `20` (or `18.x` / `22.x`)

### Step 4: Save and Deploy
1. Click **Save and Deploy**.
2. Cloudflare will provision a secure container, download your repository dependencies, compile assets using Vite, and deploy them across their global CDN edge nodes in seconds.
3. Once the build succeeds, you will receive a free, SSL-secured `*.pages.dev` subdomain (e.g., `protvplus.pages.dev`).

---

## 🌐 Setting Up a Custom Domain (e.g., `protvplus.online`)

To serve your next-gen IPTV client on a professional branded domain:

1. Inside your Cloudflare Pages project panel, click the **Custom Domains** tab.
2. Click **Set up a custom domain**.
3. Enter your domain name (e.g., `protvplus.online`).
4. If your domain's DNS is managed by Cloudflare, it will automatically configure the appropriate CNAME records for you. Otherwise, follow the displayed instructions to add a CNAME record pointing to your `*.pages.dev` URL at your registrar.

---

## 🔧 Local Development & Building

To run or build the application on your local machine:

### Installation
```bash
npm install
```

### Dev Server
Starts a local development server on port `3000` with hot-reload:
```bash
npm run dev
```

### Production Bundling
Compiles and optimizes all TypeScript, JSX, and CSS files into standard, highly compressed static assets in the `/dist` folder:
```bash
npm run build
```

---

## 🛠️ Tech Stack & Key Architectures

*   **Core:** React 18, Vite, TypeScript
*   **Animations:** `motion/react` (Framer Motion) for fluid UI transitions and interactive mobile mockup sliders
*   **Icons:** Elegant layout elements using `lucide-react` vectors
*   **Styling:** Modern utility classes powered by **Tailwind CSS**
*   **Data Structure:** Declarative channels list, dynamic category groupings, and mock screens
