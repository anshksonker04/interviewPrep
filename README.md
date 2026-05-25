# 🎓 placementPrep: Technical Interview Preparation Portal

A premium, production-grade, full-stack **Interview Preparation Portal** designed to help students prepare for technical mock exams and placement evaluations. The application is built using a modern **React-Vite-TypeScript** frontend and a robust **Flask-SQLAlchemy-SQLite** backend, unified with a polished, high-performance Obsidian-dark theme.

---

## ✨ Features Overview

### 🔒 Secure Authentication & Role-Based Access
- **Double-Agent Routing**: Distinct, protected routing structures for **Students** and **Administrators**.
- **JWT Protection**: Tokens issued by the Flask REST API with sliding session longevity stored in `localStorage` for robust, persistent user states.
- **Bcrypt Encryption**: High-entropy password hashing on the server-side ensuring absolute database privacy.

### 📊 Interactive Student Dashboard & Performance Analytics
- **Analytical Metrics**: Visualize active preparation streaks, overall accuracy ratios, total mock exam completions, and question logs.
- **Dynamic Charts**: Integrated **Recharts** widgets demonstrating visual analytics (Line graphs of performance over time, pie charts breaking down subjects, and bar charts for category-wise accuracy).
- **Diagnostics Bubble**: Automated cognitive diagnostic categorizer highlighting your **Strong Topics** (score > 80%) vs. **Focus Modules** (score < 60%) to guide revision.

### 📝 Placement-Style Testing Engine
- **Mock Exam Center**: Select from subject modules (DBMS, DSA, OOPs, OS) with various difficulties (Easy, Medium, Hard).
- **Exam HUD**: Custom single-question navigation view accompanied by:
  - An active, real-time ticking exam countdown timer.
  - An **Instant Feedback** tool allowing students to check the answer on-demand, rendering green/red alerts alongside exhaustive conceptual explanations.
- **Exhaustive Questions**: Seeded with **40 unique questions per quiz** (ranging from core algorithms to database queries) to simulate realistic technical test sets.
- **Polished Scorecards**: Visual post-exam summaries listing overall scores, timing metrics, accuracy indices, and a review panel to toggle bookmarks.

### 🛡️ Unified Admin Control Center
- **Quiz Management**: Full CRUD interface to instantly create, update, or remove placement exams.
- **Question Control**: Dropdown-linked question editor with full CRUD capability.
- **Standardized Bulk JSON Importer**: Allows administrators to import entire question banks with one click using the structured bulk loader.
- **User Control Panel**: Dynamic student roster allowing administrators to delete test user logs or instantly elevate student accounts to Administrator roles.

---

## 🎨 Design Philosophy: *Obsidian Dark*

The frontend features a stunning, premium visual overhaul inspired by modern, distraction-free markdown suites like Obsidian:
- **Pure Obsidian Palette**: Built around a `#0c0c0c` absolute pitch-black canvas, paired with obsidian-gray cards (`#161616`), sleek borders (`#262626`), and soft neon accents (Vibrant Purple for interactive highlights, Emerald Green for correctness, Rose Red for errors).
- **Glassmorphism**: Dropdown boxes, score indicators, and sidebar elements implement multi-layered glass styling (subtle transparent backdrops coupled with backdrop filters and fine border lines).
- **Fluid Micro-Animations**: Hover-triggered scaling, active slide transformations, glowing buttons, and smooth sidebar transitions that make the portal feel responsive and alive.
- **Tailwind CSS v4 Styling**: Leveraging the modern Tailwind v4 compilation pipeline to deliver blazing-fast CSS delivery and a highly responsive responsive grid layout.

---

## 🛠️ Technology Stack

### ⚛️ Frontend Portal
- **Framework**: React 18 with Vite and TypeScript (Strictly typed schemas)
- **Styling**: Tailwind CSS v4 & Lucide React Icon suite
- **State Management**: Zustand (Thread-safe, reactive store for Auth & Quiz states)
- **Routing**: React Router DOM (Declarative client-side router with protected/guest wrappers)
- **Data Visualization**: Recharts (High-fidelity SVGs)
- **Form Validation**: React Hook Form coupled with Zod Schema validations

### 🐍 Backend API
- **Language**: Python 3.10+
- **Web Server**: Flask (3.0.3)
- **ORM & DB**: Flask-SQLAlchemy (3.1.1) mapping an optimized SQLite3 layout
- **Authentication**: Flask-JWT-Extended (4.6.0)
- **CORS Handling**: Flask-CORS (4.0.1) for secure cross-origin communication
- **Hashing**: Bcrypt (4.1.3)

---

## 📂 Project Directory Structure

```
interviewPrep/
├── client/                     # React Vite Frontend Core
│   ├── src/
│   │   ├── components/         # Reusable UI component libraries (Button, Card, Modal, Input, Toast)
│   │   ├── context/            # Global theme context (Light/Dark themes)
│   │   ├── layouts/            # Page frames (AppLayout, DashboardLayout, AdminLayout)
│   │   ├── pages/              # View endpoints (Dashboard, Analytics, Quiz, Bookmarks, Profile, Admin)
│   │   ├── services/           # Axios REST endpoint integration
│   │   ├── store/              # Zustand global state (authStore, quizStore)
│   │   ├── types/              # Type-safe TypeScript schemas
│   │   ├── App.tsx             # Route management & global providers
│   │   └── main.tsx            # DOM mounting entry
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
├── server/                     # Flask REST API Core
│   ├── database/
│   │   └── seed.py             # Generates mock database logs & 40+ structured questions per quiz
│   ├── models/                 # SQLAlchemy schemas
│   │   ├── user.py             # Credentials & Role permissions
│   │   ├── quiz.py             # Exam topics & Metadata
│   │   ├── question.py         # Questions, multi-choice options, and explanations
│   │   ├── attempt.py          # Attempt logs, timings, & detailed user choices
│   │   └── bookmark.py         # Flagged items for student revision
│   ├── routes/                 # Flask Blueprints (auth, quizzes, questions, attempts, bookmarks)
│   ├── app.py                  # API initiation entry point
│   ├── config.py               # Environments & security configurations
│   └── requirements.txt        # Backend dependencies
├── start.sh                    # Automated dual-server bootloader
├── .gitignore                  # Monorepo version bypass file
└── README.md                   # This detailed project guide
```

---

## ⚡ Quick-Start Installation & Launch

You can boot both servers concurrently in a single command using the custom bootloader, or run them manually in separate shells.

### Option A: 🚀 Automated Dual-Server Start (Recommended)
We have written a smart bash bootloader `start.sh` in the project root. It handles database verification, seeds the SQLite schemas if they are missing, boots both servers concurrently, pipes output to local logs, and handles clean process termination.

1. **Verify executable permissions** at the project root:
   ```bash
   chmod +x start.sh
   ```
2. **Execute the script**:
   ```bash
   ./start.sh
   ```
3. Open `http://localhost:5173` to explore the application!
4. To shut down both active servers cleanly, simply press `Ctrl+C` in your terminal.

---

### Option B: 🔧 Manual Server Initiation (Alternative)

If you prefer to run the servers independently to view raw terminal outputs:

#### 1. Configure the Python Flask Backend
```bash
# Navigate to backend directory
cd server

# Setup local Python virtual environment & activate it
python3 -m venv venv
source venv/bin/activate

# Install required backend dependencies
pip install -r requirements.txt

# Run the seeding script to compile SQLite & mock records
PYTHONPATH=. python3 database/seed.py

# Boot Flask development server
python3 app.py
```
> [!NOTE]
> The Flask API will spin up on standard address `http://127.0.0.1:5000`.

#### 2. Configure the React TypeScript Frontend
```bash
# In a separate shell terminal, navigate to client directory
cd client

# Install frontend dependencies
npm install --legacy-peer-deps

# Spin up Vite's lightning-fast development server
npm run dev
```
> [!TIP]
> Open `http://localhost:5173` in your browser. Live changes in styling or state will compile and hot-reload instantly.

---

## 🔑 Seeding & Evaluation Credentials

To make evaluating the platform extremely convenient, the `seed.py` script populates the database with two standard mock accounts:

### 👨‍🎓 1. Student Account
Ideal for testing student dashboard statistics, quiz timers, diagnostic analytical cards, streaking modules, scoring graphs, and bookmarking systems.
- **Email**: `student@prep.com`
- **Password**: `student123`

### 🛡️ 2. Administrator Account
Ideal for testing full system privileges, adding or editing quizzes/questions, bulk loading items, and viewing aggregated platform metrics.
- **Email**: `admin@prep.com`
- **Password**: `admin123`

---

## 📡 REST API Blueprints Reference

All API calls are prefixed with `/api` and require a valid JWT header (`Authorization: Bearer <token>`) except guest endpoints:

| Endpoint | Method | Authentication | Description |
| :--- | :--- | :--- | :--- |
| `/api/auth/register` | `POST` | None (Guest) | Register a new placement candidate |
| `/api/auth/login` | `POST` | None (Guest) | Authenticate user & return JWT token + user details |
| `/api/auth/profile` | `GET`/`PUT` | Required | Retrieve or update credentials & profile metadata |
| `/api/quizzes` | `GET` | Required | Fetch all active quizzes |
| `/api/quizzes` | `POST`/`PUT`/`DELETE`| Admin Only | Create, modify, or delete placement quizzes |
| `/api/questions` | `GET` | Required | Fetch all questions or query by Quiz ID |
| `/api/questions` | `POST`/`PUT`/`DELETE`| Admin Only | Create, modify, or delete quiz questions |
| `/api/questions/bulk` | `POST` | Admin Only | Bulk import a JSON array of questions into a quiz |
| `/api/attempts` | `GET` | Required | Retrieve list of historical quiz attempts for student |
| `/api/attempts` | `POST` | Required | Submit completed quiz details, calculate score and save |
| `/api/bookmarks` | `GET` | Required | List all bookmarked questions for revision |
| `/api/bookmarks` | `POST` | Required | Toggle bookmark status on a specific question |
| `/api/admin/users` | `GET`/`DELETE` | Admin Only | View student roster or delete records |
| `/api/admin/users/<id>/role` | `PUT` | Admin Only | Toggle user permissions between student and admin |
