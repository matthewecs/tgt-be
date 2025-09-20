# Create Admin User - curl Example

## Register New Admin User

```bash
curl -X POST http://localhost:4000/user/register \
  -H "Content-Type: application/json" \
  -v \
  -d '{
    "username": "admin",
    "email": "admin@company.com",
    "password": "admin",
    "firstName": "System",
    "lastName": "Administrator",
    "role": "admin"
  }'
```

## Expected Response

**Success Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "_id": "64f7b8c9e1234567890abcde",
    "username": "admin",
    "email": "admin@company.com",
    "firstName": "System",
    "lastName": "Administrator",
    "role": "admin",
    "status": "active",
    "createdAt": "2025-09-20T10:30:00.000Z",
    "updatedAt": "2025-09-20T10:30:00.000Z"
  },
  "message": "User created successfully"
}
```

## Login with Admin User

After registration, login with the admin credentials:

```bash
curl -X POST http://localhost:4000/user/login \
  -H "Content-Type: application/json" \
  -c admin_cookies.txt \
  -v \
  -d '{
    "loginCredential": "admin",
    "password": "admin"
  }'
```

**Login Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "64f7b8c9e1234567890abcde",
      "username": "admin",
      "email": "admin@company.com",
      "firstName": "System",
      "lastName": "Administrator",
      "role": "admin",
      "status": "active",
      "lastLogin": "2025-09-20T10:35:00.000Z",
      "createdAt": "2025-09-20T10:30:00.000Z",
      "updatedAt": "2025-09-20T10:35:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NGY3YjhjOWUxMjM0NTY3ODkwYWJjZGUiLCJ1c2VybmFtZSI6ImFkbWluIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzI2ODM3NzAwLCJleHAiOjE3MjY5MjQxMDB9.ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234"
  },
  "message": "Login successful"
}
```

## Test Admin Authentication

Use the admin cookie to access protected endpoints:

```bash
# Test accessing customers with admin privileges
curl -X GET http://localhost:4000/customer \
  -b admin_cookies.txt \
  -v
```

## Complete Setup Script

Here's a complete bash script to create and test the admin user:

```bash
#!/bin/bash

echo "=== Creating Admin User ==="
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:4000/user/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@company.com",
    "password": "admin",
    "firstName": "System",
    "lastName": "Administrator",
    "role": "admin"
  }')

echo $REGISTER_RESPONSE | jq '.'

echo -e "\n=== Logging in as Admin ==="
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:4000/user/login \
  -H "Content-Type: application/json" \
  -c admin_cookies.txt \
  -d '{
    "loginCredential": "admin",
    "password": "admin"
  }')

echo $LOGIN_RESPONSE | jq '.'

echo -e "\n=== Testing Admin Authentication ==="
curl -s -X GET http://localhost:4000/customer \
  -b admin_cookies.txt | jq '.'

echo -e "\n=== Admin user setup completed! ==="
```

## Alternative Registration (Different Email)

If you need a different email format:

```bash
curl -X POST http://localhost:4000/user/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@localhost.com",
    "password": "admin",
    "firstName": "Admin",
    "lastName": "User",
    "role": "admin"
  }'
```

## Possible Error Responses

### Username Already Exists
```json
{
  "success": false,
  "message": "Username already exists"
}
```

### Email Already Exists
```json
{
  "success": false,
  "message": "Email already exists"
}
```

### Missing Required Fields
```json
{
  "success": false,
  "message": "Username, email, and password are required"
}
```

## JWT Token for Admin User

The admin JWT token will contain:
```json
{
  "userId": "64f7b8c9e1234567890abcde",
  "username": "admin",
  "role": "admin",
  "iat": 1726837700,
  "exp": 1726924100
}
```

Note: The `role: "admin"` gives this user administrative privileges in your system.
