const http = require('http');

function checkUrl(url) {
  return new Promise((resolve) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data.substring(0, 100) }));
    }).on('error', (err) => resolve({ status: 'ERROR', error: err.message }));
  });
}

async function runTests() {
  console.log('Testing Papar.Edu endpoints...');
  const frontend = await checkUrl('http://localhost:3000');
  console.log('Frontend (http://localhost:3000):', frontend.status);

  const backendCourses = await checkUrl('http://localhost:5000/api/courses');
  console.log('Backend /api/courses:', backendCourses.status);

  const backendProviders = await checkUrl('http://localhost:5000/api/providers');
  console.log('Backend /api/providers:', backendProviders.status);

  const backendNotifications = await checkUrl('http://localhost:5000/api/notifications');
  console.log('Backend /api/notifications:', backendNotifications.status);
}

runTests();
