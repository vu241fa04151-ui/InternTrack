# InternTrack – System Requirements Specification (SRS)

## 1. Project Overview
**InternTrack** is a full-stack MERN (MongoDB, Express.js, React.js, Node.js) web application designed for university students to streamline their internship discovery, application management, interview schedules, deadline alerts, and career analytics.

---

## 2. User Roles & Personas
- **Student User**: Primary actor who registers with university academic details, searches verified opportunities, tracks job applications through a visual Kanban board, schedules interviews, uploads resumes, monitors upcoming deadlines, and reviews career analytics.
- **System / Admin**: Seeds verified and demo internships, maintains opportunity integrity, and manages notification triggers.

---

## 3. Functional Requirements

### 3.1 Authentication & Security Module
- **FR-AUTH-1**: Students must register with Name, Email, Password, College, Degree, Branch, and Graduation Year.
- **FR-AUTH-2**: Email must be unique; duplicate registrations must be rejected with informative alerts.
- **FR-AUTH-3**: Passwords must be securely hashed using bcrypt (minimum 10 salt rounds) before database storage.
- **FR-AUTH-4**: Authenticated sessions must issue stateless JSON Web Tokens (JWT) with a 7-day expiration.
- **FR-AUTH-5**: Protected API endpoints and frontend routes must verify JWT tokens; expired tokens must gracefully redirect to login.
- **FR-AUTH-6**: Rate limiting must protect authentication endpoints against brute-force attacks.

### 3.2 Student Dashboard Module
- **FR-DASH-1**: Display a personalized greeting banner showing the student's name, college, degree, and graduation year.
- **FR-DASH-2**: Present real-time KPI cards: Total Applied, In Progress, Shortlisted, Interviews Scheduled, Offers Received, and Rejected.
- **FR-DASH-3**: Render real-time Recharts visualizations: Application Status Distribution (Donut Chart) and Monthly Velocity (Bar Chart).
- **FR-DASH-4**: List approaching application deadlines (due within 14 days) with urgent badge counters.
- **FR-DASH-5**: Display an audit trail of recent application activity with timestamps.
- **FR-DASH-6**: Provide quick actions to explore opportunities, log applications, view the calendar, and update profile.

### 3.3 Internship Discovery Module
- **FR-DISC-1**: Browse a repository of tech internships with pagination.
- **FR-DISC-2**: Live search across title, company, required technical skills, and job description.
- **FR-DISC-3**: Multi-parameter filtering by Work Mode (Remote, Hybrid, On-site), Location, and Duration.
- **FR-DISC-4**: Sort opportunities by Newest, Application Deadline, or Highest Stipend.
- **FR-DISC-5**: Display detailed view modal with requirements, eligibility criteria, and external application URL.
- **FR-DISC-6**: Toggle bookmarks to save/unsave opportunities with duplicate prevention.
- **FR-DISC-7**: Clearly distinguish verified opportunities from sample demonstration opportunities.
- **FR-DISC-8**: One-click action to add any opportunity directly to the student's Application Tracker.

### 3.4 Application Tracker Module (Core)
- **FR-APP-1**: Manually log applied internships with Title, Company, Application Date, Application Link, Location, Stipend, Deadline, Status, Notes, and Next Follow-up Date.
- **FR-APP-2**: Support 8 discrete pipeline stages: `Interested`, `Applied`, `Assessment`, `Shortlisted`, `Interview`, `Selected`, `Rejected`, `Withdrawn`.
- **FR-APP-3**: Dual presentation modes:
  - **Kanban Board**: Drag or move cards between stage columns with real-time MongoDB synchronization.
  - **Table View**: Sortable columns, stage selectors, and inline action menus.
- **FR-APP-4**: Maintain an immutable audit timeline history of all stage transitions with timestamps and notes.
- **FR-APP-5**: Full CRUD operations with modal edit forms and confirmation dialogs for deletions.

### 3.5 Saved Opportunities Module
- **FR-SAV-1**: Dedicated view of all bookmarked internships for the authenticated student.
- **FR-SAV-2**: One-click **"Convert to Application"** feature that copies opportunity data into an active tracked application and optionally clears the bookmark.
- **FR-SAV-3**: Direct access to external application links.

### 3.6 Calendar & Deadline Management Module
- **FR-CAL-1**: Interactive monthly grid calendar with previous, next, and current month navigation.
- **FR-CAL-2**: Color-coded event markers: Application Deadlines (Red), Interviews (Purple), Follow-ups (Amber).
- **FR-CAL-3**: Approaching deadlines spotlight banner alerting students to deadlines within 7 days.
- **FR-CAL-4**: Day selection modal showing all scheduled events for that date.
- **FR-CAL-5**: Event detail popover with external links and preparation notes.

### 3.7 Interview Management Module
- **FR-INT-1**: Schedule interviews with Company, Role, Date, Time, Mode (Google Meet, Zoom, MS Teams, In-Person, Phone), Round (Screening, Technical 1, Technical 2, System Design, Managerial, HR), Meeting Link, Location, and Preparation Notes.
- **FR-INT-2**: Filter interviews by status: `Scheduled`, `Completed`, `Cancelled`.
- **FR-INT-3**: One-click "Join Meeting" launcher.
- **FR-INT-4**: Mark interviews as completed and sync linked application status.

### 3.8 Student Profile & Resume Module
- **FR-PROF-1**: View and edit student personal and academic details.
- **FR-PROF-2**: Interactive technical skills cloud (add and remove skill chip badges).
- **FR-PROF-3**: Social and portfolio links (GitHub, LinkedIn, Personal Website).
- **FR-PROF-4**: Resume document upload supporting PDF, DOC, and DOCX up to 5MB using Multer file storage.
- **FR-PROF-5**: In-browser resume download and replacement.
- **FR-PROF-6**: Secure password update form requiring current password verification.

### 3.9 Analytics & Reports Module
- **FR-ANL-1**: Compute real-time performance indicators: Selection Rate (%), Interview Conversion Rate (%), Rejection Rate (%).
- **FR-ANL-2**: Visualizations using Recharts: Monthly Submissions, Status Distribution, Top Companies Applied, Work Mode Distribution.
- **FR-ANL-3**: Date-range filtering: All Time, Last 30 Days, Last 90 Days, This Year.
- **FR-ANL-4**: Export complete application records to a standardized downloadable CSV file.

### 3.10 In-App Notifications Module
- **FR-NOT-1**: Automated reminders generated for upcoming deadlines (≤ 3 days) and scheduled interviews.
- **FR-NOT-2**: Notification bell in top navigation with live unread badge counter.
- **FR-NOT-3**: Dropdown drawer with mark as read, mark all read, and clear all actions.

---

## 4. Non-Functional Requirements
- **Performance**: API responses under 100ms for indexed MongoDB queries. Initial bundle load optimized via Vite code splitting.
- **Security**: OWASP compliance, Helmet security headers, CORS origin protection, JWT bearer authentication, input sanitization, parameterized queries.
- **Reliability**: Graceful error boundary, centralized Express error handler, auto-reconnecting MongoDB client.
- **Responsive Design**: Mobile-first fluid layout compatible with desktop, tablet, and mobile viewport widths.
