const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5001,
  path: '/api/dashboard/failed-submissions',
  method: 'GET',
  headers: {
    'Authorization': 'Bearer test'
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Body: ${data}`);
  });
});

req.on('error', (error) => {
  console.error(error);
});

req.end();
