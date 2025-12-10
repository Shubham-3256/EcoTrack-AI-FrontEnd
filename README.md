📄 EcoTrack AI – Frontend

A modern, AI-powered energy monitoring and analytics dashboard built using Next.js 16, React 19, TailwindCSS, Recharts, and TypeScript.
The frontend provides a seamless UI for real-time energy insights, predictions, company-level breakdowns, forecasting, and anomaly detection.

🚀 Live Demo

🔗https://eco-track-ai-front-end.vercel.app/

🌟 Key Features
📊 Energy Usage Visualization

Daily, weekly, monthly trends

Company-wise consumption breakdown

Actual vs predicted energy usage graphs

Smart anomaly detection highlights

🤖 AI-Powered Forecasting

Predictive ML graph from backend

Future energy demand estimation

Adjustable date range

Company-specific forecasting

📁 CSV Upload + ML Training

Upload CSV data directly from the UI

Backend retrains ML model

Predictions update automatically

🧠 Insights Engine

Peak usage detection

Cost estimation

Carbon emissions estimation

Alerts for unusual patterns

🔐 Secure Authentication

JWT-based login + registration

Protected dashboard routes

Auto-logout on invalid token

🎨 Beautiful UI

TailwindCSS 4

Dark mode

Smooth charts & transitions

Modular dashboard layout

🏗 Tech Stack
Area	Technology
Framework	Next.js 16 (App Router)
Language	TypeScript
UI	TailwindCSS, ShadCN UI
Charts	Recharts
State / Utils	React Hooks, Context API
Auth	JWT ( Bearer token )
Deployment	Vercel
🔌 Environment Variables

Create a .env.local in the frontend root:

```NEXT_PUBLIC_API_BASE=https://ecotrack-ai-backend-afvp.onrender.com```

📂 Project Structure
```
EcoTrack-AI-FrontEnd/
│
├── app/
│   ├── auth/
│   ├── dashboard/
│   └── layout.tsx
│
├── components/
│   ├── dashboard/
│   ├── charts/
│   ├── ui/
│   └── shared/
│
├── public/
├── next.config.js
├── tailwind.config.ts
├── package.json
└── README.md
```
🧪 Running Locally
1️⃣ Install dependencies
``npm install``

2️⃣ Start the development server
```npm run dev```

3️⃣ Open in browser
```http://localhost:3000```

🛠 Deployment (Vercel)

Push frontend to GitHub

Import repository into Vercel

Add environment variable:

```NEXT_PUBLIC_API_BASE=https://ecotrack-ai-backend-afvp.onrender.com>```


Deploy 🚀

🤝 Contributing

Feel free to open issues, contribute code, or suggest features.
