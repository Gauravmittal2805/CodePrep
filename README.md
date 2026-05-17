# 🚀 CodePrep — Elite Coding & Interview Preparation Platform

CodePrep is a premium, high-performance coding preparation platform designed to help developers ace technical interviews, crack company online assessments (OAs), and master algorithmic problem-solving. Built with a stunning dark-themed, glassmorphic UI, CodePrep combines competitive programming, interactive company roadmaps, live contests, and dynamic leaderboards into a cohesive technical environment.

---

## ✨ Features

### 💻 1. Algorithmic Practice Arena
* **Diverse Problem Set:** Curated coding questions categorized by difficulty (Easy, Medium, Hard) and topics.
* **Topic-Specific Filtering:** Instantly filter problems by company, tags, and status.
* **Interactive Code Editor:** Full-fledged coding environment with support for multiple languages and real-time execution.

### 🏆 2. Competitive Arena (Contests)
* **Real-time Contests:** Join ongoing competitive events or register for upcoming contests.
* **Invite-only / Private Contests:** Participate in recursive private contests secured by invite codes.
* **Past Events Catalog:** Practice with past contest problems and view dynamic historical leaderboards.

### 🏢 3. Company-Specific OA Roadmaps
* **OA Patterns:** Deep-dive into company-specific OA question patterns, percentage focuses, and timelines.
* **Simulated Assessments:** Mock Online Assessment simulation specifying duration, debug count, and MCQ distributions.
* **Personalized Prep Roadmaps:** Stage-by-stage preparation guide tailored to crack companies like Google, Microsoft, Amazon, etc.

### 👤 4. Elite Public Profiles & Leaderboard
* **Visual Timelines:** Show off your developer journey, achievements, and technical milestones.
* **Dynamic Leaderboard:** Real-time user streaks, rating improvements, solved-problem counts, and interview activity.
* **Interactive Aura System:** Sleek, customizable visual banners showing technical specialties and certifications.

---

## 🛠️ Tech Stack

### 🎨 Frontend
* **Core:** Vite + React + TypeScript
* **Styling:** Tailwind CSS + Vanilla CSS (Glassmorphism & premium dark mode accents)
* **Components:** Shadcn UI (Radix Primitives)
* **Icons & Animation:** Lucide Icons + Framer Motion
* **Authentication:** Firebase Client SDK
* **Network Client:** Axios (Interceptors for Firebase authorization headers)

### ⚙️ Backend
* **Runtime:** Node.js + Express + TypeScript
* **Database:** MongoDB Atlas (Mongoose ODM)
* **Security:** Helmet, Dynamic CORS Origin resolving (supports Vercel previews & multi-origins)
* **Authentication & Authorization:** Firebase Admin SDK (token audience validation & session forced-logout check)

---

## 🚀 Getting Started

### 📂 Prerequisites
* **Node.js** (v18.x or above recommended)
* **npm** or **yarn**
* **MongoDB Atlas account**
* **Firebase Project**

---

### 🔧 1. Clone & Install Dependencies

Clone the repository to your local machine:
```bash
git clone https://github.com/Gauravmittal2805/CodePrep.git
cd CodePrep
```

#### Install Frontend Dependencies:
```bash
cd Frontend
npm install
```

#### Install Backend Dependencies:
```bash
cd ../Backend
npm install
```

---

### 📝 2. Environment Variables Configuration

Create a `.env` file in both directories.

#### **Frontend Environment Variables (`Frontend/.env`):**
```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=codeprep-d8400.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=codeprep-d8400
VITE_FIREBASE_STORAGE_BUCKET=codeprep-d8400.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Local Development Endpoint
VITE_API_URL=http://localhost:5001/api

# Production Endpoint (Uncomment when deploying)
# VITE_API_URL=https://codeprep-4-k73y.onrender.com/api
```

#### **Backend Environment Variables (`Backend/.env`):**
```env
PORT=5001
NODE_ENV=development

# MongoDB Atlas Connection
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/CodePrep?retryWrites=true&w=majority

# Firebase Admin SDK Credentials (Dynamic config)
FIREBASE_PROJECT_ID=codeprep-d8400
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@codeprep-d8400.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC7...\n-----END PRIVATE KEY-----\n"
```

---

### 💻 3. Running Locally

#### Run Backend Server:
```bash
cd Backend
npm run dev
```

#### Run Frontend Client:
```bash
cd Frontend
npm run dev
```

---

## 🌐 Production Deployment Guide

### 🧱 1. Backend Deployment (Render)
1. Link your GitHub repository to **Render** and create a new **Web Service**.
2. Set **Build Command** to `npm run build` and **Start Command** to `npm start`.
3. In **Environment Variables**, add:
   * `MONGODB_URI` (Your MongoDB Atlas connection string)
   * `FIREBASE_PROJECT_ID`
   * `FIREBASE_CLIENT_EMAIL`
   * `FIREBASE_PRIVATE_KEY`

### 💻 2. Frontend Deployment (Vercel)
1. Link your GitHub repository to **Vercel** and select the `Frontend` folder.
2. In **Environment Variables**, add:
   * `VITE_API_URL` = `https://<your-render-backend-url>/api` (e.g., `https://codeprep-4-k73y.onrender.com/api`)
3. Hit **Deploy**.

---

## 🔒 License
This project is licensed under the MIT License. Built with 💖 for competitive programmers and interview aspirants.
