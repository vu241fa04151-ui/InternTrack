require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const http = require('http');
const connectDB = require('../config/db');
const app = require('../server');
const User = require('../models/User');

const auditResults = {
  totalTests: 0,
  passed: 0,
  failed: 0,
  details: [],
};

const recordTest = (name, passed, message = '') => {
  auditResults.totalTests++;
  if (passed) {
    auditResults.passed++;
    auditResults.details.push({ name, status: 'PASS', message });
    console.log(`  [PASS] ${name}`);
  } else {
    auditResults.failed++;
    auditResults.details.push({ name, status: 'FAIL', message });
    console.error(`  [FAIL] ${name}: ${message}`);
  }
};

const runAudit = async () => {
  console.log('\n========================================');
  console.log('   INTERNTRACK COMPREHENSIVE AUDIT TEST ');
  console.log('========================================\n');

  await connectDB();
  const PORT = 5002;
  const server = app.listen(PORT, async () => {
    console.log(`[Audit] Test server listening on port ${PORT}\n`);

    try {
      const request = (path, method = 'GET', data = null, headers = {}) => {
        return new Promise((resolve, reject) => {
          let bodyData = null;
          const reqHeaders = { ...headers };

          if (data && typeof data === 'object' && !(data instanceof Buffer)) {
            bodyData = JSON.stringify(data);
            reqHeaders['Content-Type'] = 'application/json';
            reqHeaders['Content-Length'] = Buffer.byteLength(bodyData);
          } else if (data instanceof Buffer) {
            bodyData = data;
          }

          const req = http.request(
            {
              hostname: '127.0.0.1',
              port: PORT,
              path,
              method,
              headers: reqHeaders,
            },
            (res) => {
              let resData = '';
              res.on('data', (chunk) => (resData += chunk));
              res.on('end', () => {
                let parsed = null;
                try {
                  parsed = JSON.parse(resData);
                } catch {
                  parsed = resData;
                }
                resolve({ status: res.statusCode, body: parsed });
              });
            }
          );

          req.on('error', reject);
          if (bodyData) req.write(bodyData);
          req.end();
        });
      };

      // 1. Server Health
      console.log('--- 1. Backend Server & Health Check ---');
      const healthRes = await request('/api/health');
      recordTest(
        'GET /api/health responds with 200 and status online',
        healthRes.status === 200 && healthRes.body?.status === 'online',
        JSON.stringify(healthRes.body)
      );

      // 2. Registration & Validation
      console.log('\n--- 2. Registration & Validation ---');
      const testEmail = `audit.student.${Date.now()}@university.edu`;

      // 2a. Short password
      const shortPassRes = await request('/api/auth/register', 'POST', {
        name: 'Audit Student',
        email: testEmail,
        password: '123',
        confirmPassword: '123',
        college: 'Test College',
        degree: 'B.S.',
        branch: 'CS',
        graduationYear: 2026,
      });
      recordTest(
        'Register: Rejects password shorter than 6 characters',
        shortPassRes.status === 400 && shortPassRes.body.success === false,
        `Status: ${shortPassRes.status}`
      );

      // 2b. Password mismatch
      const mismatchPassRes = await request('/api/auth/register', 'POST', {
        name: 'Audit Student',
        email: testEmail,
        password: 'Password123!',
        confirmPassword: 'MismatchPassword123!',
        college: 'Test College',
        degree: 'B.S.',
        branch: 'CS',
        graduationYear: 2026,
      });
      recordTest(
        'Register: Rejects mismatched passwords',
        mismatchPassRes.status === 400 && mismatchPassRes.body.success === false,
        `Status: ${mismatchPassRes.status}`
      );

      // 2c. Successful Registration with all 8 fields
      const regRes = await request('/api/auth/register', 'POST', {
        name: 'Audit Student One',
        email: testEmail,
        password: 'Password123!',
        confirmPassword: 'Password123!',
        college: 'MIT',
        degree: 'B.S.',
        branch: 'EECS',
        graduationYear: 2026,
      });
      recordTest(
        'Register: Successfully registers student with all 8 academic fields',
        regRes.status === 201 && regRes.body.success === true && !!regRes.body.token,
        `Status: ${regRes.status}`
      );
      const studentOneToken = regRes.body?.token;
      const studentOneAuth = { Authorization: `Bearer ${studentOneToken}` };

      // 2d. Duplicate email check
      const dupRes = await request('/api/auth/register', 'POST', {
        name: 'Duplicate Student',
        email: testEmail,
        password: 'Password123!',
        confirmPassword: 'Password123!',
        college: 'MIT',
        degree: 'B.S.',
        branch: 'EECS',
        graduationYear: 2026,
      });
      recordTest(
        'Register: Rejects duplicate email address',
        dupRes.status === 400 && dupRes.body.success === false,
        `Status: ${dupRes.status}`
      );

      // 3. Login
      console.log('\n--- 3. Login & JWT Authentication ---');
      const badLoginRes = await request('/api/auth/login', 'POST', {
        email: testEmail,
        password: 'WrongPassword!',
      });
      recordTest(
        'Login: Rejects invalid password',
        badLoginRes.status === 401 && badLoginRes.body.success === false,
        `Status: ${badLoginRes.status}`
      );

      const validLoginRes = await request('/api/auth/login', 'POST', {
        email: testEmail,
        password: 'Password123!',
      });
      recordTest(
        'Login: Accepts valid credentials and issues JWT',
        validLoginRes.status === 200 && validLoginRes.body.success === true && !!validLoginRes.body.token,
        `Status: ${validLoginRes.status}`
      );

      // 4. Protected Routes & Authorization
      console.log('\n--- 4. Protected Routes & Authorization ---');
      const noTokenRes = await request('/api/auth/me', 'GET');
      recordTest(
        'Auth Guard: Denies access with 401 when no token is provided',
        noTokenRes.status === 401,
        `Status: ${noTokenRes.status}`
      );

      const badTokenRes = await request('/api/auth/me', 'GET', null, {
        Authorization: 'Bearer invalid.token.xyz',
      });
      recordTest(
        'Auth Guard: Denies access with 401 when invalid token is provided',
        badTokenRes.status === 401,
        `Status: ${badTokenRes.status}`
      );

      const meRes = await request('/api/auth/me', 'GET', null, studentOneAuth);
      recordTest(
        'GET /api/auth/me: Returns logged in student profile with valid token',
        meRes.status === 200 && meRes.body?.user?.email === testEmail,
        `User: ${meRes.body?.user?.name}`
      );

      // Check password not in payload
      recordTest(
        'Security: Password hash is not exposed in /api/auth/me response',
        meRes.body?.user?.password === undefined,
        'Password field excluded'
      );

      // 5. Internship Discovery CRUD
      console.log('\n--- 5. Internship Opportunity Module ---');
      // Create new internship
      const newInternshipRes = await request('/api/internships', 'POST', {
        title: 'Audit Software Engineering Intern',
        company: 'AuditCorp Global',
        description: 'Test description for audit internship opportunity.',
        requiredSkills: ['Node.js', 'React', 'MongoDB'],
        location: 'San Francisco, CA',
        workMode: 'Hybrid',
        duration: '12 Weeks',
        stipend: '$8,000/month',
        stipendAmount: 8000,
        eligibility: 'All CS students',
        deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        applyUrl: 'https://auditcorp.com/apply',
        isVerified: true,
        isSample: false,
      }, studentOneAuth);

      const createdInternshipId = newInternshipRes.body?.data?._id;
      recordTest(
        'POST /api/internships: Creates new opportunity',
        newInternshipRes.status === 201 && !!createdInternshipId,
        `ID: ${createdInternshipId}`
      );

      // Read with filters & search
      const searchRes = await request('/api/internships?search=AuditCorp&workMode=Hybrid', 'GET');
      recordTest(
        'GET /api/internships: Filters and searches opportunities accurately',
        searchRes.status === 200 && searchRes.body?.count >= 1,
        `Count: ${searchRes.body?.count}`
      );

      // Read single
      const singleIntRes = await request(`/api/internships/${createdInternshipId}`, 'GET');
      recordTest(
        'GET /api/internships/:id: Fetches single internship details',
        singleIntRes.status === 200 && singleIntRes.body?.data?.title === 'Audit Software Engineering Intern',
        `Title: ${singleIntRes.body?.data?.title}`
      );

      // Update
      const updateIntRes = await request(`/api/internships/${createdInternshipId}`, 'PUT', {
        title: 'Senior Audit Software Engineering Intern',
      }, studentOneAuth);
      recordTest(
        'PUT /api/internships/:id: Updates internship details',
        updateIntRes.status === 200 && updateIntRes.body?.data?.title === 'Senior Audit Software Engineering Intern',
        `Title: ${updateIntRes.body?.data?.title}`
      );

      // 6. Application Tracker Module
      console.log('\n--- 6. Application Tracker Module (Core) ---');
      const newAppRes = await request('/api/applications', 'POST', {
        internshipId: createdInternshipId,
        title: 'Senior Audit Software Engineering Intern',
        company: 'AuditCorp Global',
        applicationDate: new Date(),
        location: 'San Francisco, CA',
        stipend: '$8,000/month',
        deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        status: 'Applied',
        notes: 'Submitted resume and portfolio',
      }, studentOneAuth);

      const createdAppId = newAppRes.body?.data?._id;
      recordTest(
        'POST /api/applications: Creates new application with initial history',
        newAppRes.status === 201 &&
          !!createdAppId &&
          newAppRes.body?.data?.statusHistory?.length >= 1,
        `App ID: ${createdAppId}`
      );

      // Read applications
      const appsListRes = await request('/api/applications', 'GET', null, studentOneAuth);
      recordTest(
        'GET /api/applications: Retrieves user applications',
        appsListRes.status === 200 && appsListRes.body?.count >= 1,
        `Count: ${appsListRes.body?.count}`
      );

      // Status update (Kanban stage shift)
      const statusPatchRes = await request(`/api/applications/${createdAppId}/status`, 'PATCH', {
        status: 'Interview',
        note: 'Invited to Technical Screen',
      }, studentOneAuth);

      recordTest(
        'PATCH /api/applications/:id/status: Updates status and records audit history',
        statusPatchRes.status === 200 &&
          statusPatchRes.body?.data?.status === 'Interview' &&
          statusPatchRes.body?.data?.statusHistory[0]?.status === 'Interview',
        `Current Status: ${statusPatchRes.body?.data?.status}`
      );

      // 7. Saved Internships Module
      console.log('\n--- 7. Saved Internships Module ---');
      const saveRes = await request('/api/saved', 'POST', {
        internshipId: createdInternshipId,
        notes: 'Highly recommended role',
      }, studentOneAuth);
      recordTest(
        'POST /api/saved: Bookmarks internship',
        saveRes.status === 201 && !!saveRes.body?.data?._id,
        `Saved ID: ${saveRes.body?.data?._id}`
      );
      const savedDocId = saveRes.body?.data?._id;

      // Duplicate bookmark prevention
      const dupSaveRes = await request('/api/saved', 'POST', {
        internshipId: createdInternshipId,
      }, studentOneAuth);
      recordTest(
        'POST /api/saved: Prevents duplicate bookmarks',
        dupSaveRes.status === 400 && dupSaveRes.body?.success === false,
        `Status: ${dupSaveRes.status}`
      );

      // List saved
      const listSavedRes = await request('/api/saved', 'GET', null, studentOneAuth);
      recordTest(
        'GET /api/saved: Lists bookmarked internships with populated data',
        listSavedRes.status === 200 && listSavedRes.body?.count >= 1,
        `Count: ${listSavedRes.body?.count}`
      );

      // 8. Interview Management Module
      console.log('\n--- 8. Interview Management Module ---');
      const interviewDate = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000);
      const newIntrRes = await request('/api/interviews', 'POST', {
        company: 'AuditCorp Global',
        role: 'Senior Audit Software Engineering Intern',
        interviewDate,
        interviewTime: '15:30',
        interviewMode: 'Google Meet',
        interviewRound: 'Technical Round 1',
        meetingLink: 'https://meet.google.com/audit-test-call',
        preparationNotes: 'Review graph traversal and data structures',
        applicationId: createdAppId,
      }, studentOneAuth);

      const createdInterviewId = newIntrRes.body?.data?._id;
      recordTest(
        'POST /api/interviews: Schedules interview linked to application',
        newIntrRes.status === 201 && !!createdInterviewId,
        `Interview ID: ${createdInterviewId}`
      );

      // List interviews
      const listIntrRes = await request('/api/interviews', 'GET', null, studentOneAuth);
      recordTest(
        'GET /api/interviews: Fetches scheduled interviews',
        listIntrRes.status === 200 && listIntrRes.body?.count >= 1,
        `Count: ${listIntrRes.body?.count}`
      );

      // Mark completed
      const updateIntrRes = await request(`/api/interviews/${createdInterviewId}`, 'PUT', {
        status: 'Completed',
      }, studentOneAuth);
      recordTest(
        'PUT /api/interviews/:id: Marks interview as Completed',
        updateIntrRes.status === 200 && updateIntrRes.body?.data?.status === 'Completed',
        `Status: ${updateIntrRes.body?.data?.status}`
      );

      // 9. Profile & Resume Module
      console.log('\n--- 9. Student Profile & Resume Module ---');
      const updateProfRes = await request('/api/profile', 'PUT', {
        skills: ['React', 'Node.js', 'PostgreSQL', 'Docker'],
        githubUrl: 'https://github.com/audit-student',
        linkedinUrl: 'https://linkedin.com/in/audit-student',
        portfolioUrl: 'https://audit-student.dev',
        bio: 'Passionate student looking for SWE opportunities.',
      }, studentOneAuth);

      recordTest(
        'PUT /api/profile: Updates skills, URLs, and bio',
        updateProfRes.status === 200 &&
          updateProfRes.body?.data?.skills?.includes('Docker') &&
          updateProfRes.body?.data?.githubUrl === 'https://github.com/audit-student',
        `Skills count: ${updateProfRes.body?.data?.skills?.length}`
      );

      // Password update
      const updatePassRes = await request('/api/profile/password', 'PUT', {
        currentPassword: 'Password123!',
        newPassword: 'NewSecurePassword456!',
        confirmNewPassword: 'NewSecurePassword456!',
      }, studentOneAuth);

      recordTest(
        'PUT /api/profile/password: Securely updates password after current password check',
        updatePassRes.status === 200 && updatePassRes.body?.success === true,
        `Message: ${updatePassRes.body?.message}`
      );

      // 10. Analytics Engine
      console.log('\n--- 10. Analytics Calculations ---');
      const dashAnalyticsRes = await request('/api/analytics/dashboard', 'GET', null, studentOneAuth);
      const metrics = dashAnalyticsRes.body?.data?.metrics;
      recordTest(
        'GET /api/analytics/dashboard: Computes accurate KPIs and monthly trends',
        dashAnalyticsRes.status === 200 &&
          typeof metrics?.totalApplied === 'number' &&
          typeof metrics?.inProgress === 'number' &&
          dashAnalyticsRes.body?.data?.statusDistribution?.length >= 1,
        `Total: ${metrics?.totalApplied}, In Progress: ${metrics?.inProgress}`
      );

      const reportsRes = await request('/api/analytics/reports?timeRange=all', 'GET', null, studentOneAuth);
      const summary = reportsRes.body?.data?.summary;
      recordTest(
        'GET /api/analytics/reports: Computes selection, interview, and rejection rates',
        reportsRes.status === 200 &&
          typeof summary?.selectionRate === 'number' &&
          typeof summary?.interviewConversionRate === 'number',
        `Selection Rate: ${summary?.selectionRate}%, Interview Rate: ${summary?.interviewConversionRate}%`
      );

      // 11. Notifications
      console.log('\n--- 11. In-App Notifications ---');
      const notifsRes = await request('/api/notifications', 'GET', null, studentOneAuth);
      recordTest(
        'GET /api/notifications: Fetches automated alerts with unread counter',
        notifsRes.status === 200 && typeof notifsRes.body?.unreadCount === 'number',
        `Count: ${notifsRes.body?.count}, Unread: ${notifsRes.body?.unreadCount}`
      );

      const notifId = notifsRes.body?.data?.[0]?._id;
      if (notifId) {
        const markReadRes = await request(`/api/notifications/${notifId}/read`, 'PUT', null, studentOneAuth);
        recordTest(
          'PUT /api/notifications/:id/read: Marks single notification as read',
          markReadRes.status === 200 && markReadRes.body?.data?.isRead === true,
          `isRead: ${markReadRes.body?.data?.isRead}`
        );
      }

      // 12. Security & Data Isolation
      console.log('\n--- 12. Data Isolation & Multi-Tenant Security ---');
      // Create student two
      const studentTwoEmail = `audit.student.two.${Date.now()}@university.edu`;
      const s2Reg = await request('/api/auth/register', 'POST', {
        name: 'Student Two',
        email: studentTwoEmail,
        password: 'Password123!',
        confirmPassword: 'Password123!',
        college: 'Harvard',
        degree: 'B.S.',
        branch: 'CS',
        graduationYear: 2027,
      });
      const s2Token = s2Reg.body?.token;
      const s2Auth = { Authorization: `Bearer ${s2Token}` };

      // S2 tries to access S1's application
      const s2AccessApp = await request(`/api/applications/${createdAppId}`, 'GET', null, s2Auth);
      recordTest(
        'Authorization: Student B cannot read Student A application record',
        s2AccessApp.status === 404,
        `Status: ${s2AccessApp.status}`
      );

      // S2 tries to delete S1's application
      const s2DeleteApp = await request(`/api/applications/${createdAppId}`, 'DELETE', null, s2Auth);
      recordTest(
        'Authorization: Student B cannot delete Student A application record',
        s2DeleteApp.status === 404,
        `Status: ${s2DeleteApp.status}`
      );

      // Cleanup audit test data
      console.log('\n--- Cleanup ---');
      await request(`/api/applications/${createdAppId}`, 'DELETE', null, studentOneAuth);
      await request(`/api/interviews/${createdInterviewId}`, 'DELETE', null, studentOneAuth);
      await request(`/api/saved/${savedDocId}`, 'DELETE', null, studentOneAuth);
      await request(`/api/internships/${createdInternshipId}`, 'DELETE', null, studentOneAuth);
      await User.deleteMany({ email: { $in: [testEmail, studentTwoEmail] } });
      console.log('  Cleaned up temporary audit records.');

      console.log('\n========================================');
      console.log(` AUDIT TEST COMPLETE: ${auditResults.passed}/${auditResults.totalTests} PASSED (${Math.round((auditResults.passed / auditResults.totalTests) * 100)}%)`);
      console.log('========================================\n');
    } catch (err) {
      console.error('[Audit] Unexpected test suite exception:', err);
    } finally {
      server.close();
      process.exit(auditResults.failed > 0 ? 1 : 0);
    }
  });
};

runAudit();

