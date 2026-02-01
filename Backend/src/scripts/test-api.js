const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/problems',
  method: 'GET',
  headers: {
    'Authorization': 'Bearer test-token' // Auth is optional in dev, but sending it anyway
  }
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('BODY:', data.substring(0, 200) + '...');
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.end();
