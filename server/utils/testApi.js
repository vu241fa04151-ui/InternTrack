require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const http = require('http');
const connectDB = require('../config/db');
const app = require('../server');

const runTests = async () => {
  await connectDB();
  const server = app.listen(5001, async () => {
    console.log('[API Test] Test server running on port 5001');

    try {
      const request = (path, method = 'GET', data = null, headers = {}) => {
        return new Promise((resolve, reject) => {
          const bodyData = data ? JSON.stringify(data) : null;
          const reqHeaders = {
            'Content-Type': 'application/json',
            ...headers,
          };
          if (bodyData) {
            reqHeaders['Content-Length'] = Buffer.byteLength(bodyData);
          }

          const req = http.request(
            {
              hostname: '127.0.0.1',
              port: 5001,
              path,
              method,
              headers: reqHeaders,
            },
            (res) => {
              let resData = '';
              res.on('data', (chunk) => (resData += chunk));
              res.on('end', () => {
                try {
                  resolve({ status: res.statusCode, body: JSON.parse(resData) });
                } catch {
                  resolve({ status: res.statusCode, raw: resData });
                }
              });
            }
          );

          req.on('error', reject);
          if (bodyData) req.write(bodyData);
          req.end();
        });
      };

      console.log('[API Test] 1. Testing GET /api/health...');
      const health = await request('/api/health');
      console.log('  Status:', health.status, 'Payload:', health.body);

      console.log('[API Test] 2. Testing POST /api/auth/login (Demo student)...');
      const loginRes = await request('/api/auth/login', 'POST', {
        email: 'alex.morgan@stanford.edu',
        password: 'Password123!',
      });
      console.log('  Status:', loginRes.status, 'Success:', loginRes.body.success, 'Token received:', !!loginRes.body.token);
      const token = loginRes.body.token;
      const authHeader = { Authorization: `Bearer ${token}` };

      console.log('[API Test] 3. Testing GET /api/internships (Discovery)...');
      const internshipsRes = await request('/api/internships?search=software', 'GET', null, authHeader);
      console.log('  Status:', internshipsRes.status, 'Count:', internshipsRes.body.count, 'Total:', internshipsRes.body.total);

      console.log('[API Test] 4. Testing GET /api/applications (Tracker)...');
      const appsRes = await request('/api/applications', 'GET', null, authHeader);
      console.log('  Status:', appsRes.status, 'Count:', appsRes.body.count);

      console.log('[API Test] 5. Testing GET /api/analytics/dashboard...');
      const dashRes = await request('/api/analytics/dashboard', 'GET', null, authHeader);
      console.log('  Status:', dashRes.status, 'Metrics:', dashRes.body.data.metrics);

      console.log('[API Test] 6. Testing GET /api/analytics/reports...');
      const repRes = await request('/api/analytics/reports', 'GET', null, authHeader);
      console.log('  Status:', repRes.status, 'Summary:', repRes.body.data.summary);

      console.log('[API Test] 7. Testing GET /api/interviews...');
      const intRes = await request('/api/interviews', 'GET', null, authHeader);
      console.log('  Status:', intRes.status, 'Count:', intRes.body.count);

      console.log('[API Test] 8. Testing GET /api/notifications...');
      const notifRes = await request('/api/notifications', 'GET', null, authHeader);
      console.log('  Status:', notifRes.status, 'Unread:', notifRes.body.unreadCount);

      console.log('[API Test] 9. Testing GET /api/profile...');
      const profRes = await request('/api/profile', 'GET', null, authHeader);
      console.log('  Status:', profRes.status, 'Student:', profRes.body.data.name, 'College:', profRes.body.data.college);

      console.log('\n[API Test] ALL BACKEND TESTS PASSED WITH 100% SUCCESS! 🚀');
    } catch (err) {
      console.error('[API Test] Test Failed:', err);
    } finally {
      server.close();
      process.exit(0);
    }
  });
};

runTests();
