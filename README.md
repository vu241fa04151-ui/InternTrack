# InternTrack – Student Internship & Opportunity Tracker

A modern, production-grade, full-stack **MERN** web platform designed to help college students discover verified internship opportunities, track multi-stage job applications, organize interview schedules, monitor approaching deadlines on an interactive calendar, and review actionable career analytics.

---

## 🌟 Key Features

### 1. 🎓 Student Authentication & Academic Profiles
- **Academic Registration**: Student onboarding with Full Name, Email, College/University, Degree, Branch/Major, and Graduation Year.
- **Secure Authentication**: Bcrypt password hashing (10 salt rounds), stateless JWT session tokens, and protected routes.
- **Resume Management**: Secure resume uploads (PDF, DOC, DOCX up to 5MB) powered by Multer disk storage, in-browser preview, and download links.
- **Technical Skills Cloud**: Interactive skills manager with tag chip badges and portfolio URLs (GitHub, LinkedIn, Personal Site).
- **Security Hub**: In-app secure password update with current password verification.

### 2. 📊 Real-Time Student Dashboard
- **Personalized Banner**: Welcome greeting displaying the student's name, graduation year, degree, and institution.
- **Live Database KPIs**: Total Applied, In Progress, Shortlisted, Interviews Scheduled, Offers Received, and Rejected.
- **Data Visualizations (Recharts)**:
  - **Pipeline Status Donut Chart**: Visual breakdown across all active and finished application stages.
  - **Monthly Velocity Bar Chart**: Submissions and offer milestones tracked over the past 6 months.
- **Approaching Deadlines Widget**: Immediate visibility of application deadlines closing within 14 days.
- **Recent Activities Feed**: Timeline feed displaying the student's latest application status transitions.

### 3. 🔍 Internship Opportunity Discovery
- **Rich Opportunity Catalog**: Discover verified opportunities at leading companies (Google, Stripe, Microsoft, Meta, Notion, Spotify, Datadog, etc.) and clearly labeled sample demonstration listings.
- **Multi-Parameter Filtering**: Filter by Work Mode (*Remote, Hybrid, On-site*), Location, Duration, and minimum Stipend.
- **Keyword Search**: Instant search across titles, companies, and required technical skills.
- **Bookmarking & Saved List**: One-click bookmark toggle with duplicate prevention.
- **Quick Apply & Convert**: Direct links to external application portals, plus a one-click button to log the role directly into the student's Application Tracker.

### 4. 📋 Application Tracker (Kanban Board & Table)
- **Dual Visual Modes**:
  - **Interactive Kanban Board**: 8 stages (*Interested, Applied, Assessment, Shortlisted, Interview, Selected, Rejected, Withdrawn*) with stage-shifting controls that synchronize with MongoDB in real time.
  - **Sortable Table View**: Clean tabular display with status badges, compensation, deadlines, and actions.
- **Audit Timeline History**: Preserves an immutable history log of all status transitions with timestamps and notes.
- **Application CRUD**: Full add, edit, and delete functionality protected by confirmation dialogs.

### 5. 📅 Deadline Calendar & Event Scheduling
- **Monthly Interactive Calendar**: Full monthly grid with previous/next month navigation and "Today" button.
- **Color-Coded Event Markers**:
  - 🔴 **Red**: Application Deadlines
  - 🟣 **Purple**: Interview Rounds
  - 🟡 **Amber**: Next Follow-up Dates
- **Approaching Deadlines Spotlight**: Urgent warning banner alerting students to deadlines closing within 7 days.
- **Event Drawer**: Click on any date to inspect scheduled events and access meeting links.

### 6. 💼 Interview Management
- **Interview Scheduling**: Log interview rounds (*Screening, Technical 1, Technical 2, System Design, Managerial, HR*), date, time, mode (*Google Meet, Zoom, MS Teams, In-Person*), and preparation notes.
- **Direct Meeting Launch**: One-click "Join Meeting" launcher.
- **Status Lifecycle**: Track interviews as `Scheduled`, `Completed`, or `Cancelled`.

### 7. 📈 Career Analytics & CSV Reports
- **Conversion Metrics**: Automatic calculation of Selection Rate (%), Interview Conversion Rate (%), and Rejection Rate (%).
- **Advanced Visualizations**: Applications by company (Horizontal Bar Chart) and Work Mode distribution (Donut Chart).
- **Date Range Filters**: All Time, Last 30 Days, Last 90 Days, This Year.
- **Standardized CSV Export**: Export all student applications into a clean, downloadable `.csv` file.

### 8. 🔔 In-App Notifications & Reminders
- **Automated Triggers**: Notifications created automatically for deadlines within 3 days, interviews within 48 hours, and status updates.
- **Navbar Bell with Badge**: Real-time unread counter badge.
- **Notification Drawer**: Mark as read, mark all read, and clear all.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, React Router DOM v6, Tailwind CSS, Lucide React, Recharts, Axios |
| **Backend** | Node.js, Express.js, JWT, Bcrypt.js, Multer, Helmet, CORS, Morgan, Express Rate Limit |
| **Database** | MongoDB 8.2 / MongoDB Atlas, Mongoose ODM |
| **Testing & Tools** | Node HTTP Test Suite, Postman, Git |

---

## 📁 Project Structure

```
intern_tracker/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── common/         # Button, Badge, Modal, ConfirmDialog, Skeleton, EmptyState
│   │   │   └── notifications/  # NotificationBell dropdown
│   │   ├── context/            # AuthContext, ToastContext
│   │   ├── layouts/            # DashboardLayout (Sidebar, Navbar)
│   │   ├── pages/              # Login, Register, Dashboard, Applications, Internships, Saved, Calendar, Interviews, Profile, Analytics
│   │   ├── services/           # Axios API client
│   │   ├── App.jsx             # Router configuration & protected routes
│   │   ├── main.jsx            # Application entrypoint
│   │   └── index.css           # Tailwind directives & custom CSS
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/
│   ├── config/                 # db.js (MongoDB auto-connector & local process launcher)
│   ├── controllers/            # Auth, Internships, Applications, Saved, Interviews, Profile, Notifications, Analytics
│   ├── middleware/             # Auth JWT guard, ErrorHandler, Multer resume upload
│   ├── models/                 # User, Internship, Application, SavedInternship, Interview, Notification
│   ├── routes/                 # REST API route declarations
│   ├── uploads/resumes/        # Local disk storage for resumes
│   ├── utils/                  # seeder.js, testApi.js
│   ├── .env.example
│   ├── package.json
│   └── server.js               # Express application entrypoint
│
├── docs/
│   ├── Requirements.md         # System requirements specification (SRS)
│   ├── Architecture.md         # 3-tier architecture & data flow diagrams
│   ├── Database_Design.md      # Data dictionary, ER diagram & index strategy
│   ├── API_Documentation.md   # Complete REST API reference
│   ├── AI_Development_Log.md   # Architectural decisions & engineering log
│   └── Testing_Report.md       # Integration test results & verification
│
├── package.json                # Root monorepo orchestrator
├── .gitignore
└── README.md
```

---

## 🚀 Quickstart & Local Setup

### 1. Prerequisites
- **Node.js** v18+ (tested on Node v24)
- **MongoDB** local instance running on port 27017 or a **MongoDB Atlas** connection URI

### 2. Clone & Install Dependencies
```bash
# Clone the repository
git clone https://github.com/your-username/intern_tracker.git
cd intern_tracker

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install --legacy-peer-deps

# Return to root
cd ..
```

### 3. Configure Environment Variables
Create a `.env` file in the `server/` directory:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/interntrack
JWT_SECRET=interntrack_super_secret_jwt_key_2026_xyz_!@#
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

### 4. Seed the Database
Populate the database with realistic verified internships and a pre-configured demo student profile:
```bash
node server/utils/seeder.js
```

### 5. Start the Application
Run both backend API and frontend Vite server concurrently:
```bash
# Terminal 1: Start Backend (Port 5000)
cd server
npm run dev

# Terminal 2: Start Frontend (Port 5173)
cd client
npm run dev
```

Visit **`http://localhost:5173`** in your browser.

---

## 🔑 Demo Student Credentials

For instant demonstration and testing, use the built-in demo credentials (or click **"Fill Demo Student Credentials"** on the login page):

- **Email**: `alex.morgan@stanford.edu`
- **Password**: `Password123!`
- **Role**: Student (Stanford University, B.S. in Computer Science, Class of 2026)

---

## 🧪 Testing

Run the automated backend test suite:
```bash
node server/utils/testApi.js
```

Run frontend production bundle compilation:
```bash
npm run build --prefix client
```

---

## 🌐 Production Deployment Guide

### Frontend (Vercel)
1. Push repository to GitHub.
2. Import project into Vercel and set the Root Directory to `client`.
3. Framework Preset: **Vite**.
4. Set Environment Variable: `VITE_API_BASE_URL=https://your-backend-api.onrender.com/api`.
5. Deploy.

### Backend (Render)
1. Create a new **Web Service** on Render pointing to your GitHub repository.
2. Root Directory: `server`.
3. Build Command: `npm install`.
4. Start Command: `node server.js`.
5. Environment Variables:
   - `NODE_ENV`: `production`
   - `MONGO_URI`: `mongodb+srv://<user>:<password>@cluster.mongodb.net/interntrack`
   - `JWT_SECRET`: `<your-random-64-character-secret>`
   - `CLIENT_URL`: `https://your-frontend.vercel.app`
6. Deploy.

---

## 📄 License
This project is open-source and licensed under the [MIT License](LICENSE).

