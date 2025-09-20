# Frontend Login Integration - Automatic Cookie Setup

## How the Backend Automatically Sets Cookies

When you call the login API from your frontend, the backend will automatically set the `auth_token` cookie. Here's how to implement it properly:

## Frontend Login Implementation

### 1. JavaScript/Vanilla JS Login Form

```html
<!DOCTYPE html>
<html>
<head>
    <title>Login Page</title>
</head>
<body>
    <form id="loginForm">
        <input type="text" id="loginCredential" placeholder="Username or Email" required>
        <input type="password" id="password" placeholder="Password" required>
        <button type="submit">Login</button>
    </form>

    <script>
        document.getElementById('loginForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const loginCredential = document.getElementById('loginCredential').value;
            const password = document.getElementById('password').value;
            
            try {
                const response = await fetch('http://localhost:4000/user/login', {
                    method: 'POST',
                    credentials: 'include', // ✅ CRITICAL: This allows cookies to be set
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        loginCredential: loginCredential,
                        password: password
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    alert('Login successful! Cookie has been set automatically.');
                    // Cookie is now set automatically by the browser
                    // Redirect to dashboard or protected page
                    window.location.href = '/dashboard.html';
                } else {
                    alert('Login failed: ' + data.message);
                }
            } catch (error) {
                console.error('Login error:', error);
                alert('Login failed: ' + error.message);
            }
        });
    </script>
</body>
</html>
```

### 2. React Login Component

```jsx
import React, { useState } from 'react';

function LoginPage() {
    const [loginCredential, setLoginCredential] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            const response = await fetch('http://localhost:4000/user/login', {
                method: 'POST',
                credentials: 'include', // ✅ CRITICAL: This allows cookies to be set
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    loginCredential,
                    password
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Cookie is automatically set by browser
                console.log('Login successful! User:', data.data.user);
                
                // Redirect to protected page
                window.location.href = '/dashboard';
                // or use React Router: navigate('/dashboard');
            } else {
                alert('Login failed: ' + data.message);
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('Login failed: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleLogin}>
            <input
                type="text"
                placeholder="Username or Email"
                value={loginCredential}
                onChange={(e) => setLoginCredential(e.target.value)}
                required
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
            <button type="submit" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
            </button>
        </form>
    );
}

export default LoginPage;
```

### 3. Axios Configuration (Alternative)

```javascript
// axios-config.js
import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
    baseURL: 'http://localhost:4000',
    withCredentials: true, // ✅ CRITICAL: This allows cookies to be set/sent
    headers: {
        'Content-Type': 'application/json'
    }
});

export default api;

// login.js
import api from './axios-config';

async function login(loginCredential, password) {
    try {
        const response = await api.post('/user/login', {
            loginCredential,
            password
        });
        
        // Cookie is automatically set by browser
        console.log('Login successful!', response.data);
        return response.data;
    } catch (error) {
        console.error('Login failed:', error.response?.data || error.message);
        throw error;
    }
}
```

## After Login - Making Authenticated Requests

Once logged in, all subsequent requests will automatically include the cookie:

### Fetch API
```javascript
// Make authenticated request - cookie is sent automatically
async function getCustomers() {
    try {
        const response = await fetch('http://localhost:4000/customer', {
            method: 'GET',
            credentials: 'include' // ✅ Include cookies in request
        });
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching customers:', error);
    }
}
```

### Axios
```javascript
// Cookie is automatically included with axios instance configured above
async function getCustomers() {
    try {
        const response = await api.get('/customer');
        return response.data;
    } catch (error) {
        console.error('Error fetching customers:', error);
    }
}
```

## Logout Implementation

```javascript
async function logout() {
    try {
        const response = await fetch('http://localhost:4000/user/logout', {
            method: 'POST',
            credentials: 'include' // ✅ Include cookie for logout
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Cookie is automatically cleared by backend
            console.log('Logged out successfully');
            window.location.href = '/login.html';
        }
    } catch (error) {
        console.error('Logout error:', error);
    }
}
```

## Check Authentication Status

```javascript
// Check if user is authenticated
async function checkAuthStatus() {
    try {
        const response = await fetch('http://localhost:4000/customer', {
            method: 'GET',
            credentials: 'include'
        });
        
        if (response.status === 401 || response.status === 403) {
            // Not authenticated - redirect to login
            window.location.href = '/login.html';
            return false;
        }
        
        return true; // Authenticated
    } catch (error) {
        console.error('Auth check failed:', error);
        return false;
    }
}
```

## Complete React App Example

```jsx
import React, { useState, useEffect } from 'react';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check authentication on app load
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const response = await fetch('http://localhost:4000/customer', {
                credentials: 'include'
            });
            
            if (response.ok) {
                setIsAuthenticated(true);
                // You could also make a separate API to get current user info
            } else {
                setIsAuthenticated(false);
            }
        } catch (error) {
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async (loginCredential, password) => {
        try {
            const response = await fetch('http://localhost:4000/user/login', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ loginCredential, password })
            });
            
            const data = await response.json();
            
            if (data.success) {
                setIsAuthenticated(true);
                setUser(data.data.user);
            } else {
                alert('Login failed: ' + data.message);
            }
        } catch (error) {
            alert('Login failed: ' + error.message);
        }
    };

    const handleLogout = async () => {
        try {
            await fetch('http://localhost:4000/user/logout', {
                method: 'POST',
                credentials: 'include'
            });
            
            setIsAuthenticated(false);
            setUser(null);
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            {isAuthenticated ? (
                <Dashboard user={user} onLogout={handleLogout} />
            ) : (
                <LoginForm onLogin={handleLogin} />
            )}
        </div>
    );
}
```

## Important Notes

### ✅ What Happens Automatically:
1. **Login API Call** → Backend sets `auth_token` cookie
2. **Browser Stores Cookie** → Automatically saved for domain
3. **Subsequent Requests** → Cookie sent automatically with `credentials: 'include'`
4. **Backend Authenticates** → Reads cookie and validates token
5. **Logout API Call** → Backend clears cookie automatically

### ✅ Key Frontend Requirements:
- **Always use** `credentials: 'include'` in fetch requests
- **Or use** `withCredentials: true` in axios
- **Frontend and backend** must be on allowed CORS origins
- **No manual cookie management** needed - browser handles everything

### ✅ Cookie Configuration (Backend):
- **HttpOnly**: ✅ Prevents XSS attacks (JavaScript can't read it)
- **SameSite**: `lax` for development, `strict` for production
- **Secure**: Only HTTPS in production
- **Domain**: Set to localhost for development
- **Path**: `/` (available for all routes)
- **MaxAge**: 24 hours

The cookie will be set automatically when you call the login API with `credentials: 'include'`. No manual token management required! 🚀
