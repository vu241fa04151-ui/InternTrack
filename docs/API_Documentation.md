# InternTrack – REST API Documentation

All API endpoints reside under `/api` and return standardized JSON responses.

### Standard Response Envelope
```json
{
  "success": true,
  "data": {},
  "message": "Operation completed successfully"
}
```

---

## 1. Authentication Endpoints

### 1.1 Register Student
- **Endpoint**: `POST /api/auth/register`
- **Access**: Public
- **Rate Limit**: 30 requests / 15 minutes
- **Request Body**:
```json
{
  "name": "Alex Morgan",
  "email": "alex.morgan@stanford.edu",
  "password": "Password123!",
  "confirmPassword": "Password123!",
  "college": "Stanford University",
  "degree": "B.S.",
  "branch": "Computer Science",
  "graduationYear": 2026
}
```
- **Response (201 Created)**:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsIn...",
  "user": {
    "id": "6639b7...",
    "name": "Alex Morgan",
    "email": "alex.morgan@stanford.edu",
    "college": "Stanford University",
    "degree": "B.S.",
    "branch": "Computer Science",
    "graduationYear": 2026,
    "role": "student"
  },
  "message": "Registration successful! Welcome to InternTrack."
}
```

### 1.2 Login Student
- **Endpoint**: `POST /api/auth/login`
- **Access**: Public
- **Request Body**:
```json
{
  "email": "alex.morgan@stanford.edu",
  "password": "Password123!"
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsIn...",
  "user": { "id": "...", "name": "Alex Morgan", "email": "..." },
  "message": "Login successful!"
}
```

### 1.3 Get Current User Session
- **Endpoint**: `GET /api/auth/me`
- **Access**: Private (Bearer JWT)
- **Response (200 OK)**: Returns full student profile payload.

---

## 2. Internship Discovery Endpoints

### 2.1 Get Internships
- **Endpoint**: `GET /api/internships`
- **Access**: Public
- **Query Parameters**:
  - `search` (string): Keywords matching title, company, skills, or description
  - `workMode` (string): `Remote`, `Hybrid`, `On-site`
  - `location` (string): City or state regex match
  - `minStipend` (number): Minimum numerical stipend threshold
  - `duration` (string): Duration filter
  - `sort` (string): `newest`, `deadline`, `stipendHigh`
  - `page` (number): Default: 1
  - `limit` (number): Default: 12
- **Response (200 OK)**:
```json
{
  "success": true,
  "count": 12,
  "total": 12,
  "totalPages": 1,
  "currentPage": 1,
  "data": [
    {
      "_id": "6639...",
      "title": "Software Engineering Intern (Summer 2026)",
      "company": "Google",
      "companyLogo": "https://...",
      "requiredSkills": ["C++", "Java", "Python"],
      "workMode": "Hybrid",
      "duration": "12 Weeks",
      "stipend": "$8,500/month",
      "deadline": "2026-11-30T00:00:00.000Z",
      "isVerified": true,
      "isSample": false,
      "isSaved": true
    }
  ]
}
```

### 2.2 Get Single Internship
- **Endpoint**: `GET /api/internships/:id`
- **Access**: Public

---

## 3. Application Tracker Endpoints

### 3.1 Get Applications
- **Endpoint**: `GET /api/applications`
- **Access**: Private (Bearer JWT)
- **Query Parameters**:
  - `status` (string): Filter by pipeline status
  - `search` (string): Search title or company
  - `sort` (string): `dateDesc`, `dateAsc`, `deadlineAsc`, `companyAsc`

### 3.2 Create Application
- **Endpoint**: `POST /api/applications`
- **Access**: Private (Bearer JWT)
- **Request Body**:
```json
{
  "title": "Full Stack Engineer Intern",
  "company": "Notion",
  "applicationDate": "2026-11-05",
  "applicationLink": "https://notion.so/careers",
  "location": "Remote",
  "stipend": "$7,800/month",
  "deadline": "2026-11-20",
  "status": "Applied",
  "notes": "Applied via referral"
}
```

### 3.3 Quick Update Application Status (Kanban D&D)
- **Endpoint**: `PATCH /api/applications/:id/status`
- **Access**: Private (Bearer JWT)
- **Request Body**:
```json
{
  "status": "Interview",
  "note": "Scheduled technical pairing screen"
}
```

### 3.4 Update Application Details
- **Endpoint**: `PUT /api/applications/:id`
- **Access**: Private (Bearer JWT)

### 3.5 Delete Application
- **Endpoint**: `DELETE /api/applications/:id`
- **Access**: Private (Bearer JWT)

---

## 4. Saved Opportunities Endpoints

### 4.1 Get Bookmarked Internships
- **Endpoint**: `GET /api/saved`
- **Access**: Private

### 4.2 Save / Bookmark Internship
- **Endpoint**: `POST /api/saved`
- **Access**: Private
- **Request Body**: `{ "internshipId": "...", "notes": "..." }`

### 4.3 Remove Bookmark
- **Endpoint**: `DELETE /api/saved/:id`
- **Access**: Private

### 4.4 Convert Saved Opportunity into Tracked Application
- **Endpoint**: `POST /api/saved/:id/convert`
- **Access**: Private
- **Request Body**:
```json
{
  "status": "Applied",
  "removeFromSaved": true
}
```

---

## 5. Interview Management Endpoints

### 5.1 Get Interviews
- **Endpoint**: `GET /api/interviews`
- **Access**: Private
- **Query Parameters**: `status` (`Scheduled`, `Completed`, `Cancelled`), `sort` (`upcoming`, `past`)

### 5.2 Schedule Interview
- **Endpoint**: `POST /api/interviews`
- **Access**: Private
- **Request Body**:
```json
{
  "company": "Google",
  "role": "Software Engineering Intern",
  "interviewDate": "2026-11-10",
  "interviewTime": "14:00",
  "interviewMode": "Google Meet",
  "interviewRound": "Technical Round 1",
  "meetingLink": "https://meet.google.com/xyz",
  "preparationNotes": "Practice dynamic programming and graphs",
  "applicationId": "6639..."
}
```

### 5.3 Update Interview
- **Endpoint**: `PUT /api/interviews/:id`
- **Access**: Private

### 5.4 Delete Interview
- **Endpoint**: `DELETE /api/interviews/:id`
- **Access**: Private

---

## 6. Student Profile & Resume Endpoints

### 6.1 Get Profile
- **Endpoint**: `GET /api/profile`
- **Access**: Private

### 6.2 Update Profile
- **Endpoint**: `PUT /api/profile`
- **Access**: Private
- **Request Body**: `{ "name": "...", "college": "...", "skills": [...], "githubUrl": "..." }`

### 6.3 Upload Resume Document
- **Endpoint**: `POST /api/profile/resume`
- **Access**: Private
- **Content-Type**: `multipart/form-data`
- **Form Field**: `resume` (Binary file, max 5MB, PDF/DOC/DOCX)

### 6.4 Delete Resume
- **Endpoint**: `DELETE /api/profile/resume`
- **Access**: Private

### 6.5 Update Password
- **Endpoint**: `PUT /api/profile/password`
- **Access**: Private
- **Request Body**: `{ "currentPassword": "...", "newPassword": "...", "confirmNewPassword": "..." }`

---

## 7. Analytics & Notification Endpoints

### 7.1 Dashboard Metrics
- **Endpoint**: `GET /api/analytics/dashboard`
- **Access**: Private

### 7.2 Detailed Reports
- **Endpoint**: `GET /api/analytics/reports`
- **Access**: Private
- **Query Parameters**: `timeRange` (`all`, `30days`, `90days`, `year`)

### 7.3 Get Notifications
- **Endpoint**: `GET /api/notifications`
- **Access**: Private

### 7.4 Mark Notification Read
- **Endpoint**: `PUT /api/notifications/:id/read`
- **Access**: Private

### 7.5 Mark All Read
- **Endpoint**: `PUT /api/notifications/read-all`
- **Access**: Private

### 7.6 Clear All Notifications
- **Endpoint**: `DELETE /api/notifications/clear-all`
- **Access**: Private
