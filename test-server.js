const http = require('http')

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/memory/stats',
  method: 'GET'
}

const req = http.request(options, (res) => {
  let data = ''
  res.on('data', (chunk) => { data += chunk })
  res.on('end', () => {
    console.log('Server response:', data)
  })
})

req.on('error', (e) => {
  console.error('Server not running:', e.message)
})

req.end()
