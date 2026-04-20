const http = require('http');
http.get('http://localhost:5000/api/auth/users', (res) => {
    let rawData = '';
    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => console.log('Status:', res.statusCode, 'Body:', rawData));
}).on('error', (e) => console.error(e));
