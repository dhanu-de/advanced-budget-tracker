# 💰 BudgetFlow — Smart Budget Tracker

<div align="center">

![BudgetFlow Banner](https://img.shields.io/badge/BudgetFlow-v1.0.0-10b981?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0id2hpdGUiIGQ9Ik0xMiAyQzYuNDggMiAyIDYuNDggMiAxMnM0LjQ4IDEwIDEwIDEwIDEwLTQuNDggMTAtMTBTMTcuNTIgMiAxMiAyem0xIDE0LjVoLTJ2LTJoMnYyem0wLTRoLTJWN2gydjUuNXoiLz48L3N2Zz4=)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-blue?style=for-the-badge&logo=github)](https://dhanu-de.github.io/advanced-budget-tracker/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3-38B2AC?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com)

**A beautiful, AI-powered personal finance tracker — works on mobile & desktop.**

[🌐 Live Demo](https://dhanu-de.github.io/advanced-budget-tracker/) · [🐛 Report Bug](https://github.com/dhanu-de/advanced-budget-tracker/issues) · [💡 Request Feature](https://github.com/dhanu-de/advanced-budget-tracker/issues)

</div>

---

## 📱 Screenshots

| Sign In | Dashboard | Transactions |
|---------|-----------|--------------|
| Dark themed auth | Financial overview | Track expenses |

| Goals | AI Chat | Profile |
|-------|---------|---------|
| Savings goals | Groq AI advisor | User profile & stats |

---

## ✨ Features

- 🔐 **Auth** — Register / Login / Guest mode (stored securely in browser)
- 📊 **Dashboard** — Net balance, income vs expense charts, recent activity
- 💸 **Transactions** — Add, filter, and delete income & expense records
- 🎯 **Goals** — Set savings goals and track progress with contributions
- ✂️ **Split Bill** — Calculate fair splits between friends
- 👥 **Group Split** — Manage group expenses with multiple participants
- 🤖 **AI Advisor** — Groq-powered financial advisor with real data context
- 👤 **Profile** — View financial stats, edit name, manage account
- 📱 **PWA** — Install on Android/iOS home screen like a native app
- 🌙 **Dark Mode** — Premium dark theme throughout
- 💾 **Offline** — All data stored in localStorage, works without internet

---

## 🚀 Live Demo

👉 **[https://dhanu-de.github.io/advanced-budget-tracker/](https://dhanu-de.github.io/advanced-budget-tracker/)**

### Install on Mobile
| Android | iOS |
|---------|-----|
| Open in Chrome → Menu → **"Add to Home Screen"** | Open in Safari → Share → **"Add to Home Screen"** |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite 8, TailwindCSS 3 |
| **Charts** | Chart.js + react-chartjs-2 |
| **Icons** | Lucide React |
| **AI** | Groq API (llama-3.3-70b-versatile) |
| **Storage** | Browser localStorage |
| **Hosting** | GitHub Pages |
| **CI/CD** | GitHub Actions |

---

## 🏃 Run Locally

```bash
# 1. Clone the repo
git clone https://github.com/dhanu-de/advanced-budget-tracker.git
cd advanced-budget-tracker

# 2. Install dependencies
npm install --legacy-peer-deps

# 3. Create .env file
cp .env.example .env
# Add your Groq API key → get one free at https://console.groq.com/keys

# 4. Start development server
npm run dev
```

Open **http://localhost:3000** in your browser.

---

## ⚙️ Environment Variables

Create a `.env` file in the root:

```env
# Required for AI chat feature
VITE_GROQ_API_KEY=gsk_your_key_here
```

Get a free Groq API key at **[console.groq.com/keys](https://console.groq.com/keys)**

---

## 📦 Project Structure

```
advanced-budget-tracker/
├── client/src/
│   ├── pages/
│   │   ├── Auth/          # Sign in / Sign up
│   │   ├── Dashboard/     # Overview & charts
│   │   ├── Transactions/  # Income & expense list
│   │   ├── Goals/         # Savings goals
│   │   ├── Split/         # Bill splitting
│   │   └── Profile/       # User profile
│   ├── components/
│   │   ├── charts/        # Chart components
│   │   ├── forms/         # Reusable forms
│   │   └── shared/        # AI chatbot, shared UI
│   └── services/
│       ├── firebaseService.js  # localStorage data layer
│       └── geminiService.js    # Groq AI service
├── public/
│   ├── manifest.json      # PWA manifest
│   └── sw.js              # Service worker
├── .github/workflows/
│   └── deploy.yml         # Auto-deploy to GitHub Pages
└── server/                # Express backend (optional, for self-hosting)
```

---

## 🚢 Deploy Your Own

1. **Fork** this repository
2. Go to **Settings → Pages → Source → GitHub Actions**
3. Go to **Settings → Secrets → Actions** and add:
   - `VITE_GROQ_API_KEY` = your Groq API key
4. Push any commit — it auto-deploys!

Your app will be live at:
```
https://YOUR_USERNAME.github.io/advanced-budget-tracker/
```

---

## 📝 How Data Works

> All data is stored in your **browser's localStorage** — no server or database needed.
> This means data is private to your device and browser.

| Action | Storage |
|--------|---------|
| Register/Login | localStorage (`bf_users`) |
| Transactions | localStorage (`bf_tx_<userId>`) |
| Goals | localStorage (`bf_goal_<userId>`) |
| Session | localStorage (`bf_current_user`) |

---

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License.

---

<div align="center">

Made with ❤️ by [dhanu-de](https://github.com/dhanu-de)

⭐ **Star this repo if you found it useful!**

</div>
