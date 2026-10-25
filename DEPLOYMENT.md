# 🚀 Coding Wallah Skills - Production Deployment & Custom Domain Guide

This document provides complete instructions for publishing **Coding Wallah Skills** to a public hosting provider, eliminating `localhost:8080`, and attaching your custom domain (e.g., `codingwallahskills.com` or `codingwallahskills.in`).

---

## 🏗️ 1. Technical Architecture Overview

| Layer | Technology | Details |
|---|---|---|
| **Frontend Framework** | Semantic HTML5 + Tailwind CSS + Vanilla JS | Single-Page Architecture with client-side views, FontAwesome 6, Google Fonts |
| **Telemetry & Analytics** | Chart.js | Proctored Test Portal performance charts (Topic accuracy & Time per question) |
| **AI Doubt Solver** | Dual Engine | Client-side neural simulation heuristics + optional OpenAI API proxy |
| **Auth System** | Client-side Session Engine | LocalStorage database persistence, role guards (Student/Admin), Google OAuth simulator |
| **Runtime Config** | `config.js` | Dynamically detects environment, eliminating hardcoded `localhost:8080` in production |
| **Local Dev Server** | PowerShell HttpListener (`serve.ps1`) | Local development server on port 8080 with try-catch loop protection |
| **Cloud Hosting Targets**| Netlify, Vercel, Cloudflare Pages | Edge CDN, automatic free SSL (`https://`), 99.99% uptime SLA |

---

## 📋 2. What Has Been Configured in Your Codebase

✅ **No Hardcoded `localhost:8080` in Production:**  
Created `config.js` which detects `window.location.hostname`. In production, API calls resolve to dynamic relative URLs (`/api/...`), and links never reference localhost.

✅ **Original Branding:**  
Updated across all pages to **Coding Wallah Skills** (`CODING WALLAH SKILLS`), with an original engineering motto:  
> *"Master Real-World Engineering • From Code to Career"*

✅ **Platform Routing & Redirects:**  
* `vercel.json`: Clean URL routing (`/test-portal` -> `test-portal.html`), immutable static asset caching, and strict security headers (`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`).
* `netlify.toml`: 200 rewrite rules for clean routes, asset cache-control, and security headers.
* `server.js`: Zero-dependency Node.js HTTP fallback server with `/health` endpoint and error catchers for container/VPS hosting.

✅ **Production Archive:**  
`coding-wallah-production.zip` packaged with all files needed for 1-click cloud deployment.

---

## 🌐 3. Steps to Deploy to Public Hosting (Zero Downtime)

### Option A: Netlify Drop (Fastest — 30 Seconds, No CLI Needed)

1. Open **[app.netlify.com/drop](https://app.netlify.com/drop)** in your web browser.
2. Sign up or log in (free).
3. Drag and drop the `coding-wallah` folder (or upload `coding-wallah-production.zip`).
4. Netlify will immediately deploy your site with a temporary live URL (e.g., `https://coding-wallah-skills.netlify.app`).

### Option B: Vercel (Fast Edge CDN)

1. Go to **[vercel.com](https://vercel.com/)** and sign in.
2. Click **Add New Project** → Import your repository (or drag project).
3. The included `vercel.json` will automatically configure routing, caching, and headers.
4. Click **Deploy**. Your site will be live on `https://coding-wallah-skills.vercel.app`.

---

## 🔑 4. Environment Variables Configuration

If you configure backend API integrations (e.g. OpenAI key for the AI Doubt Solver), set these in your hosting dashboard (**Settings → Environment Variables**):

| Variable | Recommended Value | Purpose |
|---|---|---|
| `NODE_ENV` | `production` | Tells libraries to run in production mode |
| `SITE_URL` | `https://codingwallahskills.com` | Canonical production domain URL |
| `OPENAI_API_KEY` | `sk-...` *(optional)* | Custom OpenAI API key for live GPT doubt solver |

*(Note: If no API key is provided, the platform automatically uses the built-in offline neural coding heuristic engine with zero errors).*

---

## 🌍 5. Connecting Your Custom Domain Name (`codingwallahskills.com`)

To replace `localhost:8080` (or the default `.netlify.app` / `.vercel.app` address) with your brand name in the browser address bar:

### Step 1: Purchase the Domain
If you have not already registered your domain, purchase it at any registrar (e.g. Namecheap, GoDaddy, Hostinger, Cloudflare Registrar, Google Domains/Squarespace).

### Step 2: Add Domain in Hosting Dashboard
* **On Netlify:** Go to **Site configuration** → **Domain management** → **Add a custom domain** → enter `codingwallahskills.com` (or your chosen domain).
* **On Vercel:** Go to **Project Settings** → **Domains** → enter `codingwallahskills.com`.

### Step 3: Configure DNS Records at Your Domain Registrar
Log into your domain registrar's DNS Management panel and add the following two DNS records:

#### If using Netlify:
| Record Type | Name / Host | Value / Target | TTL |
|---|---|---|---|
| **A** | `@` (or leave blank) | `75.2.60.5` | Automatic / 3600 |
| **CNAME** | `www` | `<your-site-name>.netlify.app` | Automatic / 3600 |

#### If using Vercel:
| Record Type | Name / Host | Value / Target | TTL |
|---|---|---|---|
| **A** | `@` (or leave blank) | `76.76.21.21` | Automatic / 3600 |
| **CNAME** | `www` | `cname.vercel-dns.com` | Automatic / 3600 |

### Step 4: Automatic HTTPS / SSL Certificate
Once the DNS records point to your host, Netlify/Vercel will automatically request and install a free **Let's Encrypt SSL certificate**. This secures your website with `https://` and ensures browser padlock trust.

> ⚠️ **Verification Notice:** DNS propagation worldwide typically takes between **5 minutes to 48 hours** depending on your registrar. The custom domain will become active only after your registrar's DNS records have been verified by the hosting provider.

---

## 💻 6. Local Development Mode

`localhost:8080` remains configured strictly for your local workstation:
* To run locally:
  ```powershell
  powershell -ExecutionPolicy Bypass -File "serve.ps1" -Port 8080
  ```
* To run locally under `http://codingwallahskills.local/` on standard port 80:
  ```powershell
  powershell -ExecutionPolicy Bypass -File "setup-local-domain.ps1"
  ```

---

## 📌 Checklist: Steps Still Requiring Your Action

- [ ] **Action 1:** Register your desired domain (e.g. `codingwallahskills.com`) at your preferred domain registrar if you haven't already.
- [ ] **Action 2:** Create a free account at [Netlify](https://app.netlify.com/drop) or [Vercel](https://vercel.com).
- [ ] **Action 3:** Upload the `coding-wallah` folder or `coding-wallah-production.zip` to deploy your site.
- [ ] **Action 4:** Add your custom domain in the host dashboard and add the **A** and **CNAME** records in your registrar's DNS panel.
- [ ] **Action 5:** Allow DNS to propagate; your host will automatically issue the free SSL certificate.
