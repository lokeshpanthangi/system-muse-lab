# API Endpoints Documentation

## Base URL
```
http://localhost:8000
```

---

## 🔐 Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <access_token>
```

### Token Expiration
- **Access Token**: 24 hours (configurable via `JWT_ACCESS_TOKEN_EXPIRE_HOURS`)
- **Refresh Token**: 7 days (configurable via `JWT_REFRESH_TOKEN_EXPIRE_DAYS`)

---

## 📚 Table of Contents
1. [Users API](#users-api)
2. [Problems API](#problems-api)
3. [Submissions API](#submissions-api)

---

## 👤 Users API

### 1. Sign Up
Create a new user account.

**Endpoint:** `POST /users/signup`

**Authentication:** Not required

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@example.com",
  "password": "securePassword123"
}
```

**Response:** `201 Created`
```json
{
  "message": "User created successfully",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "created_at": "2024-01-15T10:30:00"
  }
}
```

**Error Responses:**
- `400 Bad Request` - User already exists
- `422 Unprocessable Entity` - Invalid email format

---

### 2. Login
Authenticate user and receive access & refresh tokens.

**Endpoint:** `POST /users/login`

**Authentication:** Not required

**Request Body:** (OAuth2 form data)
```
username: john.doe@example.com
password: securePassword123
```

**Response:** `200 OK`
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 86400,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "created_at": "2024-01-15T10:30:00"
  }
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid credentials

---

### 3. Refresh Access Token
Generate a new access token using a refresh token.

**Endpoint:** `POST /users/refresh`

**Authentication:** Not required (refresh token in body)

**Request Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:** `200 OK`
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 86400
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or expired refresh token

---

### 4. Get Current User Profile
Retrieve the authenticated user's profile information.

**Endpoint:** `GET /users/me`

**Authentication:** Required 🔒

**Request Headers:**
```
Authorization: Bearer <access_token>
```

**Response:** `200 OK`
```json
{
  "id": "507f1f77bcf86cd799439011",
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@example.com",
  "created_at": "2024-01-15T10:30:00"
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or missing token
- `404 Not Found` - User not found

---

## 📝 Problems API

### 1. Create Problem
Create a new system design problem.

**Endpoint:** `POST /problems/`

**Authentication:** Required 🔒

**Request Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "title": "Design a URL Shortener Service",
  "description": "Design a scalable URL shortening service like bit.ly that can handle millions of requests per day.",
  "difficulty": "medium",
  "categories": ["Web Services", "Databases", "Caching"],
  "estimated_time": "45 mins",
  "requirements": [
    "Generate unique short URLs for any given long URL",
    "Redirect users from short URL to original URL with minimal latency",
    "Track click analytics for each short URL"
  ],
  "constraints": [
    "Short URLs should be 6-8 characters long",
    "System should be highly available (99.9% uptime)",
    "Read-heavy workload (100:1 read-to-write ratio)"
  ],
  "hints": [
    "Consider using a hash function or base62 encoding for URL generation",
    "Think about how to handle cache invalidation",
    "Consider using a CDN for global distribution"
  ]
}
```

**Response:** `201 Created`
```json
{
  "message": "Problem created successfully",
  "problem": {
    "id": "507f1f77bcf86cd799439011",
    "title": "Design a URL Shortener Service",
    "description": "Design a scalable URL shortening service...",
    "difficulty": "medium",
    "categories": ["Web Services", "Databases", "Caching"],
    "estimated_time": "45 mins",
    "requirements": [...],
    "constraints": [...],
    "hints": [...],
    "created_by": "john.doe@example.com",
    "created_at": "2024-01-15T10:30:00",
    "updated_at": "2024-01-15T10:30:00"
  }
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or missing token
- `500 Internal Server Error` - Failed to create problem

---

### 2. Get Problem by ID
Retrieve a specific problem by its ID.

**Endpoint:** `GET /problems/{problem_id}`

**Authentication:** Not required

**Path Parameters:**
- `problem_id` (string) - The problem's unique identifier

**Response:** `200 OK`
```json
{
  "id": "507f1f77bcf86cd799439011",
  "title": "Design a URL Shortener Service",
  "description": "Design a scalable URL shortening service...",
  "difficulty": "medium",
  "categories": ["Web Services", "Databases", "Caching"],
  "estimated_time": "45 mins",
  "requirements": [...],
  "constraints": [...],
  "hints": [...],
  "created_by": "john.doe@example.com",
  "created_at": "2024-01-15T10:30:00",
  "updated_at": "2024-01-15T10:30:00"
}
```

**Error Responses:**
- `404 Not Found` - Problem not found

---

### 3. List All Problems
Retrieve a paginated list of all problems.

**Endpoint:** `GET /problems/`

**Authentication:** Not required

**Query Parameters:**
- `skip` (integer, optional) - Number of records to skip (default: 0)
- `limit` (integer, optional) - Maximum number of records to return (default: 100, max: 100)

**Example Request:**
```
GET /problems/?skip=0&limit=10
```

**Response:** `200 OK`
```json
{
  "total": 10,
  "skip": 0,
  "limit": 10,
  "problems": [
    {
      "id": "507f1f77bcf86cd799439011",
      "title": "Design a URL Shortener Service",
      "description": "Design a scalable URL shortening service...",
      "difficulty": "medium",
      "categories": ["Web Services", "Databases", "Caching"],
      "estimated_time": "45 mins",
      "requirements": [...],
      "constraints": [...],
      "hints": [...],
      "created_by": "john.doe@example.com",
      "created_at": "2024-01-15T10:30:00",
      "updated_at": "2024-01-15T10:30:00"
    }
    // ... more problems
  ]
}
```

---

### 4. Get My Problems
Retrieve all problems created by the authenticated user.

**Endpoint:** `GET /problems/user/my-problems`

**Authentication:** Required 🔒

**Request Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `skip` (integer, optional) - Number of records to skip (default: 0)
- `limit` (integer, optional) - Maximum number of records to return (default: 100, max: 100)

**Response:** `200 OK`
```json
{
  "total": 5,
  "skip": 0,
  "limit": 100,
  "problems": [
    {
      "id": "507f1f77bcf86cd799439011",
      "title": "Design a URL Shortener Service",
      "description": "Design a scalable URL shortening service...",
      "difficulty": "medium",
      "categories": ["Web Services", "Databases", "Caching"],
      "estimated_time": "45 mins",
      "requirements": [...],
      "constraints": [...],
      "hints": [...],
      "created_by": "john.doe@example.com",
      "created_at": "2024-01-15T10:30:00",
      "updated_at": "2024-01-15T10:30:00"
    }
    // ... more problems
  ]
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or missing token

---

### 5. Update Problem
Update an existing problem. Only the creator can update.

**Endpoint:** `PUT /problems/{problem_id}`

**Authentication:** Required 🔒

**Request Headers:**
```
Authorization: Bearer <access_token>
```

**Path Parameters:**
- `problem_id` (string) - The problem's unique identifier

**Request Body:** (all fields optional)
```json
{
  "title": "Updated Title",
  "description": "Updated description...",
  "difficulty": "hard",
  "categories": ["Updated Category"],
  "estimated_time": "60 mins",
  "requirements": ["Updated requirement"],
  "constraints": ["Updated constraint"],
  "hints": ["Updated hint"]
}
```

**Response:** `200 OK`
```json
{
  "message": "Problem updated successfully",
  "problem": {
    "id": "507f1f77bcf86cd799439011",
    "title": "Updated Title",
    "description": "Updated description...",
    "difficulty": "hard",
    "categories": ["Updated Category"],
    "estimated_time": "60 mins",
    "requirements": [...],
    "constraints": [...],
    "hints": [...],
    "created_by": "john.doe@example.com",
    "created_at": "2024-01-15T10:30:00",
    "updated_at": "2024-01-15T11:45:00"
  }
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or missing token
- `403 Forbidden` - Not authorized to update this problem
- `404 Not Found` - Problem not found

---

### 6. Delete Problem
Delete a problem. Only the creator can delete.

**Endpoint:** `DELETE /problems/{problem_id}`

**Authentication:** Required 🔒

**Request Headers:**
```
Authorization: Bearer <access_token>
```

**Path Parameters:**
- `problem_id` (string) - The problem's unique identifier

**Response:** `204 No Content`

**Error Responses:**
- `401 Unauthorized` - Invalid or missing token
- `404 Not Found` - Problem not found or not authorized to delete

---

### 7. Search Problems
Search for problems by title or description.

**Endpoint:** `GET /problems/search/query`

**Authentication:** Not required

**Query Parameters:**
- `q` (string, required) - Search query (minimum 1 character)
- `skip` (integer, optional) - Number of records to skip (default: 0)
- `limit` (integer, optional) - Maximum number of records to return (default: 100, max: 100)

**Example Request:**
```
GET /problems/search/query?q=url+shortener&skip=0&limit=10
```

**Response:** `200 OK`
```json
{
  "total": 3,
  "query": "url shortener",
  "skip": 0,
  "limit": 10,
  "problems": [
    {
      "id": "507f1f77bcf86cd799439011",
      "title": "Design a URL Shortener Service",
      "description": "Design a scalable URL shortening service...",
      "difficulty": "medium",
      "categories": ["Web Services", "Databases", "Caching"],
      "estimated_time": "45 mins",
      "requirements": [...],
      "constraints": [...],
      "hints": [...],
      "created_by": "john.doe@example.com",
      "created_at": "2024-01-15T10:30:00",
      "updated_at": "2024-01-15T10:30:00"
    }
    // ... more matching problems
  ]
}
```

**Error Responses:**
- `422 Unprocessable Entity` - Missing or invalid query parameter

---

## 📤 Submissions API

### 1. Create Submission
Create a new submission for a problem.

**Endpoint:** `POST /submissions/`

**Authentication:** Required 🔒

**Request Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "problem_id": "507f1f77bcf86cd799439011",
  "diagram_data": {
    "elements": [],
    "appState": {}
  },
  "status": "in-progress"
}
```

**Response:** `201 Created`
```json
{
  "message": "Submission created successfully",
  "submission": {
    "id": "507f1f77bcf86cd799439012",
    "user_id": "john.doe@example.com",
    "problem_id": "507f1f77bcf86cd799439011",
    "diagram_data": {
      "elements": [],
      "appState": {}
    },
    "score": 0,
    "time_spent": 0,
    "status": "in-progress",
    "feedback": {
      "strengths": [],
      "improvements": [],
      "missing_components": []
    },
    "chat_messages": [],
    "submitted_at": "2024-01-15T10:30:00",
    "updated_at": "2024-01-15T10:30:00"
  }
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or missing token
- `500 Internal Server Error` - Failed to create submission

---

### 2. Get Submission by ID
Retrieve a specific submission. User can only access their own submissions.

**Endpoint:** `GET /submissions/{submission_id}`

**Authentication:** Required 🔒

**Request Headers:**
```
Authorization: Bearer <access_token>
```

**Path Parameters:**
- `submission_id` (string) - The submission's unique identifier

**Response:** `200 OK`
```json
{
  "id": "507f1f77bcf86cd799439012",
  "user_id": "john.doe@example.com",
  "problem_id": "507f1f77bcf86cd799439011",
  "diagram_data": {
    "elements": [],
    "appState": {}
  },
  "score": 85,
  "time_spent": 2700,
  "status": "completed",
  "feedback": {
    "strengths": ["Good use of caching layer", "Proper load balancing"],
    "improvements": ["Consider adding database replication"],
    "missing_components": ["CDN for static assets"]
  },
  "chat_messages": [
    {
      "role": "user",
      "content": "How can I improve my design?",
      "timestamp": "2024-01-15T10:35:00"
    },
    {
      "role": "assistant",
      "content": "Consider adding a CDN for better global distribution.",
      "timestamp": "2024-01-15T10:35:05"
    }
  ],
  "submitted_at": "2024-01-15T10:30:00",
  "updated_at": "2024-01-15T11:15:00"
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or missing token
- `403 Forbidden` - Not authorized to view this submission
- `404 Not Found` - Submission not found

---

### 3. Get My Submissions
Retrieve all submissions by the authenticated user.

**Endpoint:** `GET /submissions/user/my-submissions`

**Authentication:** Required 🔒

**Request Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `skip` (integer, optional) - Number of records to skip (default: 0)
- `limit` (integer, optional) - Maximum number of records to return (default: 100, max: 100)

**Response:** `200 OK`
```json
{
  "total": 12,
  "skip": 0,
  "limit": 100,
  "submissions": [
    {
      "id": "507f1f77bcf86cd799439012",
      "user_id": "john.doe@example.com",
      "problem_id": "507f1f77bcf86cd799439011",
      "score": 85,
      "time_spent": 2700,
      "status": "completed",
      "submitted_at": "2024-01-15T10:30:00",
      "updated_at": "2024-01-15T11:15:00"
    }
    // ... more submissions
  ]
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or missing token

---

### 4. Get My Submission for Problem
Retrieve the authenticated user's submission for a specific problem.

**Endpoint:** `GET /submissions/problem/{problem_id}`

**Authentication:** Required 🔒

**Request Headers:**
```
Authorization: Bearer <access_token>
```

**Path Parameters:**
- `problem_id` (string) - The problem's unique identifier

**Response:** `200 OK`
```json
{
  "id": "507f1f77bcf86cd799439012",
  "user_id": "john.doe@example.com",
  "problem_id": "507f1f77bcf86cd799439011",
  "diagram_data": {
    "elements": [],
    "appState": {}
  },
  "score": 85,
  "time_spent": 2700,
  "status": "completed",
  "feedback": {
    "strengths": [...],
    "improvements": [...],
    "missing_components": [...]
  },
  "chat_messages": [...],
  "submitted_at": "2024-01-15T10:30:00",
  "updated_at": "2024-01-15T11:15:00"
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or missing token
- `404 Not Found` - No submission found for this problem

---

### 5. Update Submission
Update an existing submission. Only the owner can update.

**Endpoint:** `PUT /submissions/{submission_id}`

**Authentication:** Required 🔒

**Request Headers:**
```
Authorization: Bearer <access_token>
```

**Path Parameters:**
- `submission_id` (string) - The submission's unique identifier

**Request Body:** (all fields optional)
```json
{
  "diagram_data": {
    "elements": [...],
    "appState": {...}
  },
  "score": 90,
  "time_spent": 3000,
  "status": "completed",
  "feedback": {
    "strengths": ["Excellent scalability design"],
    "improvements": ["Add monitoring and alerting"],
    "missing_components": []
  }
}
```

**Response:** `200 OK`
```json
{
  "message": "Submission updated successfully",
  "submission": {
    "id": "507f1f77bcf86cd799439012",
    "user_id": "john.doe@example.com",
    "problem_id": "507f1f77bcf86cd799439011",
    "diagram_data": {...},
    "score": 90,
    "time_spent": 3000,
    "status": "completed",
    "feedback": {...},
    "chat_messages": [...],
    "submitted_at": "2024-01-15T10:30:00",
    "updated_at": "2024-01-15T12:00:00"
  }
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or missing token
- `403 Forbidden` - Not authorized to update this submission
- `404 Not Found` - Submission not found

---

### 6. Add Chat Message
Add a chat message to a submission. Only the owner can add messages.

**Endpoint:** `POST /submissions/{submission_id}/chat`

**Authentication:** Required 🔒

**Request Headers:**
```
Authorization: Bearer <access_token>
```

**Path Parameters:**
- `submission_id` (string) - The submission's unique identifier

**Request Body:**
```json
{
  "role": "user",
  "content": "Can you explain how to scale this better?"
}
```

**Response:** `200 OK`
```json
{
  "message": "Chat message added successfully",
  "submission": {
    "id": "507f1f77bcf86cd799439012",
    "chat_messages": [
      {
        "role": "user",
        "content": "How can I improve my design?",
        "timestamp": "2024-01-15T10:35:00"
      },
      {
        "role": "assistant",
        "content": "Consider adding a CDN for better global distribution.",
        "timestamp": "2024-01-15T10:35:05"
      },
      {
        "role": "user",
        "content": "Can you explain how to scale this better?",
        "timestamp": "2024-01-15T12:00:00"
      }
    ]
  }
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or missing token
- `403 Forbidden` - Not authorized to update this submission
- `404 Not Found` - Submission not found

---

### 7. Delete Submission
Delete a submission. Only the owner can delete.

**Endpoint:** `DELETE /submissions/{submission_id}`

**Authentication:** Required 🔒

**Request Headers:**
```
Authorization: Bearer <access_token>
```

**Path Parameters:**
- `submission_id` (string) - The submission's unique identifier

**Response:** `204 No Content`

**Error Responses:**
- `401 Unauthorized` - Invalid or missing token
- `404 Not Found` - Submission not found or not authorized to delete

---

## 📊 Summary

### Endpoint Count
- **Users**: 4 endpoints
- **Problems**: 7 endpoints
- **Submissions**: 7 endpoints
- **Total**: 18 endpoints

### Authentication Distribution
- **Public Endpoints**: 5 (Root, Sign Up, Login, Refresh Token, List Problems, Get Problem, Search Problems)
- **Protected Endpoints**: 13 (All others require JWT authentication)

### HTTP Methods Used
- **GET**: 9 endpoints
- **POST**: 6 endpoints
- **PUT**: 2 endpoints
- **DELETE**: 2 endpoints

---

## 🔧 Common Status Codes

### Success Codes
- `200 OK` - Request succeeded
- `201 Created` - Resource created successfully
- `204 No Content` - Request succeeded with no content to return

### Error Codes
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Missing or invalid authentication
- `403 Forbidden` - Authenticated but not authorized
- `404 Not Found` - Resource not found
- `422 Unprocessable Entity` - Validation error
- `500 Internal Server Error` - Server error

---

## 📝 Notes

1. All timestamps are in ISO 8601 format (UTC)
2. All IDs are MongoDB ObjectId strings
3. The API supports CORS for all origins (configured in production)
4. Token refresh should be handled automatically before access token expiration
5. Pagination is available on list endpoints with `skip` and `limit` parameters
6. Search is case-insensitive and uses regex matching

---

**API Version:** 1.0.0  
**Last Updated:** January 15, 2024
