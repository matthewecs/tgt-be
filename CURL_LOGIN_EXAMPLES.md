# Complete Login API Examples with Responses

## Basic Login Request

### Login with Username
```bash
curl -X POST http://localhost:4000/user/login \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -v \
  -d '{
    "loginCredential": "testuser",
    "password": "password123"
  }'
```

**Complete Response (with Headers):**
```
* Connected to localhost (127.0.0.1) port 4000 (#0)
> POST /user/login HTTP/1.1
> Host: localhost:4000
> User-Agent: curl/7.68.0
> Accept: */*
> Content-Type: application/json
> Content-Length: 62

< HTTP/1.1 200 OK
< X-Powered-By: Express
< Access-Control-Allow-Origin: *
< Set-Cookie: auth_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NGY3YjhjOWUxMjM0NTY3ODkwYWJjZGUiLCJ1c2VybmFtZSI6InRlc3R1c2VyIiwicm9sZSI6ImVtcGxveWVlIiwiaWF0IjoxNzI2ODM3NzAwLCJleHAiOjE3MjY5MjQxMDB9.XYZ123ABC456DEF789GHI012JKL345MNO678PQR901STU234; Max-Age=86400; Path=/; HttpOnly; SameSite=Strict
< Content-Type: application/json; charset=utf-8
< Content-Length: 589
< ETag: W/"24d-abc123def456"
< Date: Fri, 20 Sep 2025 10:35:00 GMT
< Connection: keep-alive
< Keep-Alive: timeout=5

{
  "success": true,
  "data": {
    "user": {
      "_id": "64f7b8c9e1234567890abcde",
      "username": "testuser",
      "email": "test@example.com",
      "firstName": "Test",
      "lastName": "User",
      "role": "employee",
      "status": "active",
      "lastLogin": "2025-09-20T10:35:00.000Z",
      "createdAt": "2025-09-20T10:30:00.000Z",
      "updatedAt": "2025-09-20T10:35:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NGY3YjhjOWUxMjM0NTY3ODkwYWJjZGUiLCJ1c2VybmFtZSI6InRlc3R1c2VyIiwicm9sZSI6ImVtcGxveWVlIiwiaWF0IjoxNzI2ODM3NzAwLCJleHAiOjE3MjY5MjQxMDB9.XYZ123ABC456DEF789GHI012JKL345MNO678PQR901STU234"
  },
  "message": "Login successful"
}
```

### Login with Email
```bash
curl -X POST http://localhost:4000/user/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "loginCredential": "test@example.com",
    "password": "password123"
  }'
```

**Response Body:**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "64f7b8c9e1234567890abcde",
      "username": "testuser",
      "email": "test@example.com",
      "firstName": "Test",
      "lastName": "User",
      "role": "employee",
      "status": "active",
      "lastLogin": "2025-09-20T10:35:00.000Z",
      "createdAt": "2025-09-20T10:30:00.000Z",
      "updatedAt": "2025-09-20T10:35:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NGY3YjhjOWUxMjM0NTY3ODkwYWJjZGUiLCJ1c2VybmFtZSI6InRlc3R1c2VyIiwicm9sZSI6ImVtcGxveWVlIiwiaWF0IjoxNzI2ODM3NzAwLCJleHAiOjE3MjY5MjQxMDB9.XYZ123ABC456DEF789GHI012JKL345MNO678PQR901STU234"
  },
  "message": "Login successful"
}
```

**Cookie File (cookies.txt):**
```
# Netscape HTTP Cookie File
# This is a generated file!  Do not edit.

localhost	FALSE	/	FALSE	1726924100	auth_token	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NGY3YjhjOWUxMjM0NTY3ODkwYWJjZGUiLCJ1c2VybmFtZSI6InRlc3R1c2VyIiwicm9zZSI6ImVtcGxveWVlIiwiaWF0IjoxNzI2ODM3NzAwLCJleHAiOjE3MjY5MjQxMDB9.XYZ123ABC456DEF789GHI012JKL345MNO678PQR901STU234
```

## Error Response Examples

### Invalid Credentials
```bash
curl -X POST http://localhost:4000/user/login \
  -H "Content-Type: application/json" \
  -v \
  -d '{
    "loginCredential": "wronguser",
    "password": "wrongpassword"
  }'
```

**Response:**
```
< HTTP/1.1 401 Unauthorized
< X-Powered-By: Express
< Access-Control-Allow-Origin: *
< Content-Type: application/json; charset=utf-8
< Content-Length: 58
< ETag: W/"3a-def789ghi012"
< Date: Fri, 20 Sep 2025 10:36:00 GMT
< Connection: keep-alive
< Keep-Alive: timeout=5

{
  "success": false,
  "message": "Invalid credentials"
}
```

### Missing Password
```bash
curl -X POST http://localhost:4000/user/login \
  -H "Content-Type: application/json" \
  -d '{
    "loginCredential": "testuser"
  }'
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Login credential (username or email) and password are required"
}
```

### Inactive Account
```bash
curl -X POST http://localhost:4000/user/login \
  -H "Content-Type: application/json" \
  -d '{
    "loginCredential": "inactiveuser",
    "password": "password123"
  }'
```

**Response (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Account is inactive"
}
```

## Using the Authentication Cookie

### Test Authentication with Cookie
```bash
# 1. Login and save cookies
curl -X POST http://localhost:4000/user/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "loginCredential": "testuser",
    "password": "password123"
  }'

# 2. Use cookie for authenticated request
curl -X GET http://localhost:4000/customer \
  -b cookies.txt \
  -v
```

**Authenticated Request Headers:**
```
> GET /customer HTTP/1.1
> Host: localhost:4000
> User-Agent: curl/7.68.0
> Accept: */*
> Cookie: auth_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NGY3YjhjOWUxMjM0NTY3ODkwYWJjZGUiLCJ1c2VybmFtZSI6InRlc3R1c2VyIiwicm9zZSI6ImVtcGxveWVlIiwiaWF0IjoxNzI2ODM3NzAwLCJleHAiOjE3MjY5MjQxMDB9.XYZ123ABC456DEF789GHI012JKL345MNO678PQR901STU234
```

## Using the JWT Token Manually

### Extract Token and Use in Header
```bash
# 1. Login and extract token
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:4000/user/login \
  -H "Content-Type: application/json" \
  -d '{
    "loginCredential": "testuser",
    "password": "password123"
  }')

# 2. Extract token (requires jq)
TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.token')

# 3. Use token in Authorization header
curl -X GET http://localhost:4000/customer \
  -H "Authorization: Bearer $TOKEN" \
  -v
```

**Manual Token Request Headers:**
```
> GET /customer HTTP/1.1
> Host: localhost:4000
> User-Agent: curl/7.68.0
> Accept: */*
> Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NGY3YjhjOWUxMjM0NTY3ODkwYWJjZGUiLCJ1c2VybmFtZSI6InRlc3R1c2VyIiwicm9zZSI6ImVtcGxveWVlIiwiaWF0IjoxNzI2ODM3NzAwLCJleHAiOjE3MjY5MjQxMDB9.XYZ123ABC456DEF789GHI012JKL345MNO678PQR901STU234
```

## Logout Examples

### Logout with Cookie
```bash
curl -X POST http://localhost:4000/user/logout \
  -b cookies.txt \
  -v
```

**Logout Response:**
```
< HTTP/1.1 200 OK
< X-Powered-By: Express
< Access-Control-Allow-Origin: *
< Set-Cookie: auth_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT
< Content-Type: application/json; charset=utf-8
< Content-Length: 89
< ETag: W/"59-jkl456mno789"
< Date: Fri, 20 Sep 2025 10:40:00 GMT
< Connection: keep-alive
< Keep-Alive: timeout=5

{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  },
  "message": "Logout successful"
}
```

### Logout with Token
```bash
curl -X POST http://localhost:4000/user/logout \
  -H "Authorization: Bearer $TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  },
  "message": "Logout successful"
}
```

## Complete Workflow Example

```bash
#!/bin/bash

echo "=== User Registration ==="
curl -X POST http://localhost:4000/user/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "demouser",
    "email": "demo@example.com",
    "password": "demopass123",
    "firstName": "Demo",
    "lastName": "User",
    "role": "employee"
  }'

echo -e "\n\n=== User Login ==="
curl -X POST http://localhost:4000/user/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -v \
  -d '{
    "loginCredential": "demouser",
    "password": "demopass123"
  }'

echo -e "\n\n=== Authenticated Request ==="
curl -X GET http://localhost:4000/customer \
  -b cookies.txt

echo -e "\n\n=== User Logout ==="
curl -X POST http://localhost:4000/user/logout \
  -b cookies.txt

echo -e "\n\n=== Test After Logout (Should Fail) ==="
curl -X GET http://localhost:4000/customer \
  -b cookies.txt
```

## JWT Token Decoded

The JWT token contains this payload:
```json
{
  "userId": "64f7b8c9e1234567890abcde",
  "username": "testuser", 
  "role": "employee",
  "iat": 1726837700,
  "exp": 1726924100
}
```

**Token Properties:**
- `userId`: MongoDB ObjectId of the user
- `username`: User's login username
- `role`: User role (admin/manager/employee)
- `iat`: Issued at timestamp (Unix timestamp)
- `exp`: Expiration timestamp (24 hours later)

## Cookie Properties

The `auth_token` cookie is set with these properties:
- **HttpOnly**: Cannot be accessed by JavaScript (XSS protection)
- **SameSite=Strict**: Prevents CSRF attacks
- **Secure**: Only sent over HTTPS in production
- **Max-Age**: 86400 seconds (24 hours)
- **Path**: `/` (available for all routes)

## CORS Troubleshooting

### If you're getting CORS errors:

#### From Browser/Frontend Applications:
Make sure your frontend includes credentials:

**JavaScript/Fetch:**
```javascript
fetch('http://localhost:4000/user/login', {
  method: 'POST',
  credentials: 'include', // Important: This allows cookies
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    loginCredential: 'testuser',
    password: 'password123'
  })
})
```

**Axios:**
```javascript
axios.post('http://localhost:4000/user/login', {
  loginCredential: 'testuser',
  password: 'password123'
}, {
  withCredentials: true // Important: This allows cookies
})
```

#### From curl (Testing):
Include the Origin header to simulate browser requests:

```bash
# Login with Origin header
curl -X POST http://localhost:4000/user/login \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -c cookies.txt \
  -d '{
    "loginCredential": "testuser",
    "password": "password123"
  }'

# Use cookies with Origin header
curl -X GET http://localhost:4000/customer \
  -H "Origin: http://localhost:3000" \
  -b cookies.txt
```

#### Preflight OPTIONS Request:
Browsers may send OPTIONS requests first:

```bash
# Test preflight request
curl -X OPTIONS http://localhost:4000/user/login \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type" \
  -v
```

**Expected OPTIONS Response:**
```
< HTTP/1.1 200 OK
< Access-Control-Allow-Origin: http://localhost:3000
< Access-Control-Allow-Methods: GET,POST,PUT,DELETE,OPTIONS
< Access-Control-Allow-Headers: Content-Type,Authorization,X-Requested-With
< Access-Control-Allow-Credentials: true
```

#### Allowed Origins (Development):
The backend allows these origins by default:
- `http://localhost:3000`
- `http://localhost:3001`
- `http://localhost:8080`
- `http://127.0.0.1:3000`
- `http://127.0.0.1:3001`
- `http://127.0.0.1:8080`

If your frontend runs on a different port, you can:
1. **Add it to the allowedOrigins array** in `src/app.js`
2. **Or set NODE_ENV to development** to allow all origins

#### Production CORS:
In production, update the `allowedOrigins` array with your actual domain:
```javascript
const allowedOrigins = [
    'https://your-frontend-domain.com',
    'https://www.your-frontend-domain.com'
];
```
