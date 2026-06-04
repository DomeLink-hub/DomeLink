const http = require('http');

const data = JSON.stringify({ email: 'test.user@domelink.local', password: 'Test1234!' });

const options = {
  hostname: 'localhost',
  port: 5001,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data),
  },
};

const req = http.request(options, (res) => {
  console.log('status', res.statusCode);
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log(body);
  });
});

req.on('error', (err) => console.error('error', err));
req.write(data);
req.end();
