# Login API Examples

## User Login API

### Login with Username
```bash
curl -X POST http://localhost:4000/user/login \
  -H "Content-Type: application/json" \
  -d '{
    "loginCredential": "testuser",
    "password": "password123"
  }'
```

### Login with Email
```bash
curl -X POST http://localhost:4000/user/login \
  -H "Content-Type: application/json" \
  -d '{
    "loginCredential": "test@example.com",
    "password": "password123"
  }'
```

## Successful Login Response

**Note: The JWT token is automatically set as an HTTP-only cookie named `auth_token` and also returned in the response.**

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

**Cookie Details:**
- **Cookie Name**: `auth_token`
- **Security**: HTTP-only (prevents XSS attacks)
- **Same-Site**: Strict (prevents CSRF attacks)
- **Secure**: HTTPS only in production
- **Max-Age**: 24 hours
```

## Error Responses

### Invalid Credentials
```bash
curl -X POST http://localhost:4000/user/login \
  -H "Content-Type: application/json" \
  -d '{
    "loginCredential": "wronguser",
    "password": "wrongpassword"
  }'
```

**Response (401):**
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

### Missing Fields
```bash
curl -X POST http://localhost:4000/user/login \
  -H "Content-Type: application/json" \
  -d '{
    "loginCredential": "testuser"
  }'
```

**Response (400):**
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

**Response (401):**
```json
{
  "success": false,
  "message": "Account is inactive"
}
```

## Using Authentication

After successful login, you have **TWO ways** to authenticate:

### Method 1: Using Cookie (Automatic - Recommended for Web Apps)
```bash
# The cookie is automatically included in subsequent requests
# Save cookies during login using -c flag
curl -X POST http://localhost:4000/user/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "loginCredential": "testuser",
    "password": "password123"
  }'

# Use saved cookies in subsequent requests with -b flag
curl -X GET http://localhost:4000/customer \
  -b cookies.txt
```

### Method 2: Using Authorization Header (Manual - For APIs/Mobile)
```bash
# Extract token from login response and use in Authorization header
curl -X GET http://localhost:4000/customer \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NGY3YjhjOWUxMjM0NTY3ODkwYWJjZGUiLCJ1c2VybmFtZSI6InRlc3R1c2VyIiwicm9sZSI6ImVtcGxveWVlIiwiaWF0IjoxNzI2ODM3NzAwLCJleHAiOjE3MjY5MjQxMDB9.XYZ123ABC456DEF789GHI012JKL345MNO678PQR901STU234"
```

### Browser Integration
For web applications, the cookie is automatically managed by the browser:
```javascript
// Frontend JavaScript - cookie is automatically sent
fetch('/api/customer', {
  method: 'GET',
  credentials: 'include' // Important: include cookies
})
```

## JWT Token Details

The JWT token contains the following payload:
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
- `userId`: Unique user identifier
- `username`: User's username
- `role`: User role (admin, manager, employee)
- `iat`: Token issued at timestamp
- `exp`: Token expiration timestamp (24 hours from issue)

## Complete Login Flow Examples

### Cookie-Based Flow (Recommended for Web Apps)
```bash
# 1. Register a user (if not already registered)
curl -X POST http://localhost:4000/user/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "email": "newuser@example.com",
    "password": "securepass123",
    "firstName": "New",
    "lastName": "User",
    "role": "employee"
  }'

# 2. Login and save cookies
curl -X POST http://localhost:4000/user/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "loginCredential": "newuser",
    "password": "securepass123"
  }'

# 3. Make authenticated requests using cookies
curl -X GET http://localhost:4000/work-step \
  -b cookies.txt

curl -X GET http://localhost:4000/customer \
  -b cookies.txt

# 4. Logout (clears the cookie)
curl -X POST http://localhost:4000/user/logout \
  -b cookies.txt
```

### Token-Based Flow (For APIs/Mobile Apps)
```bash
# 1. Login and extract token from response
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:4000/user/login \
  -H "Content-Type: application/json" \
  -d '{
    "loginCredential": "newuser",
    "password": "securepass123"
  }')

# 2. Extract token (you can use jq for JSON parsing)
TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.token')

# 3. Use token in Authorization header
curl -X GET http://localhost:4000/work-step \
  -H "Authorization: Bearer $TOKEN"

curl -X GET http://localhost:4000/customer \
  -H "Authorization: Bearer $TOKEN"

# 4. Logout with token
curl -X POST http://localhost:4000/user/logout \
  -H "Authorization: Bearer $TOKEN"
```

## Testing Different User Roles

### Admin User Login
```bash
curl -X POST http://localhost:4000/user/login \
  -H "Content-Type: application/json" \
  -d '{
    "loginCredential": "adminuser",
    "password": "adminpass123"
  }'
```

### Manager User Login
```bash
curl -X POST http://localhost:4000/user/login \
  -H "Content-Type: application/json" \
  -d '{
    "loginCredential": "manager@company.com",
    "password": "managerpass123"
  }'
```

### Employee User Login
```bash
curl -X POST http://localhost:4000/user/login \
  -H "Content-Type: application/json" \
  -d '{
    "loginCredential": "employee@company.com",
    "password": "employeepass123"
  }'
```

Each role will receive the same token structure but with their respective role value in the JWT payload.
