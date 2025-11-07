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
4. [Sessions API](#sessions-api)

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
Create a new submission for a problem (manual creation).

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

**Note:** For practice sessions with auto-save, use `POST /submissions/from-session/{session_id}` instead.

---

### 2. Create Submission from Session
Convert a practice session to a final submission for evaluation.

**Endpoint:** `POST /submissions/from-session/{session_id}`

**Authentication:** Required 🔒

**Request Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:** None

**Response:** `201 Created`
```json
{
  "message": "Submission created from session successfully",
  "submission": {
    "id": "507f1f77bcf86cd799439013",
    "user_id": "john.doe@example.com",
    "problem_id": "507f1f77bcf86cd799439011",
    "diagram_data": {
      "elements": [
        {
          "type": "rectangle",
          "x": 100,
          "y": 100,
          "width": 200,
          "height": 100
        }
      ],
      "appState": {
        "viewBackgroundColor": "#ffffff"
      }
    },
    "score": 0,
    "time_spent": 1200,
    "status": "completed",
    "feedback": {
      "strengths": [],
      "improvements": [],
      "missing_components": []
    },
    "chat_messages": [
      {
        "role": "user",
        "content": "How should I handle caching?",
        "timestamp": "2024-01-15T10:35:00.000Z"
      },
      {
        "role": "assistant",
        "content": "Consider using Redis...",
        "timestamp": "2024-01-15T10:35:05.000Z"
      }
    ],
    "submitted_at": "2024-01-15T10:50:00",
    "updated_at": "2024-01-15T10:50:00"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Session already submitted
- `401 Unauthorized` - Invalid or missing token
- `403 Forbidden` - Session belongs to another user
- `404 Not Found` - Session not found
- `500 Internal Server Error` - Failed to create submission

**Workflow:**
1. Fetches session data (diagram_data, time_spent, chat_messages)
2. Creates submission with status "completed"
3. Copies chat messages from session
4. Marks session as "submitted"
5. Returns submission ready for AI evaluation

---

### 3. Get Submission by ID
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

## � Sessions API

Practice sessions track user's active work on a problem with auto-save functionality.

### 1. Create Session (or Resume Existing)
Start a new practice session or return existing active session for a problem.

**Endpoint:** `POST /sessions/`

**Authentication:** Required

**Request Body:**
```json
{
  "problem_id": "507f1f77bcf86cd799439011"
}
```

**Response:** `201 Created` (or `200 OK` if resuming existing)
```json
{
  "id": "507f1f77bcf86cd799439012",
  "user_id": "user@example.com",
  "problem_id": "507f1f77bcf86cd799439011",
  "diagram_data": {},
  "diagram_hash": "d41d8cd98f00b204e9800998ecf8427e",
  "time_spent": 0,
  "status": "active",
  "chat_messages": [],
  "last_saved_at": "2024-01-15T10:30:00.000Z",
  "started_at": "2024-01-15T10:30:00.000Z",
  "ended_at": null,
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses:**
- `401 Unauthorized` - Missing or invalid token

**Notes:**
- Auto-resume: If user has an active/paused session for this problem, returns that session instead of creating new one
- Only one active session per problem per user

---

### 2. Get Session by ID
Retrieve a specific practice session.

**Endpoint:** `GET /sessions/{session_id}`

**Authentication:** Required

**Response:** `200 OK`
```json
{
  "id": "507f1f77bcf86cd799439012",
  "user_id": "user@example.com",
  "problem_id": "507f1f77bcf86cd799439011",
  "diagram_data": {
    "elements": [],
    "appState": {}
  },
  "diagram_hash": "a1b2c3d4e5f6...",
  "time_spent": 1200,
  "status": "active",
  "chat_messages": [
    {
      "role": "user",
      "content": "How should I handle caching?",
      "timestamp": "2024-01-15T10:35:00.000Z"
    },
    {
      "role": "assistant",
      "content": "Consider using Redis for caching...",
      "timestamp": "2024-01-15T10:35:05.000Z"
    }
  ],
  "last_saved_at": "2024-01-15T10:50:00.000Z",
  "started_at": "2024-01-15T10:30:00.000Z",
  "ended_at": null,
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-15T10:50:00.000Z"
}
```

**Error Responses:**
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Session belongs to another user
- `404 Not Found` - Session not found

---

### 3. Get Active Session for Problem
Get user's active or paused session for a specific problem.

**Endpoint:** `GET /sessions/problem/{problem_id}`

**Authentication:** Required

**Response:** `200 OK` (or `null` if no active session)
```json
{
  "id": "507f1f77bcf86cd799439012",
  "user_id": "user@example.com",
  "problem_id": "507f1f77bcf86cd799439011",
  "diagram_data": {},
  "diagram_hash": "d41d8cd98f00b204e9800998ecf8427e",
  "time_spent": 300,
  "status": "active",
  "chat_messages": [],
  "last_saved_at": "2024-01-15T10:35:00.000Z",
  "started_at": "2024-01-15T10:30:00.000Z",
  "ended_at": null,
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-15T10:35:00.000Z"
}
```

**Notes:**
- Use this before starting practice to check if session already exists
- Returns `null` if no active/paused session found

---

### 4. Auto-save Session
Save session progress (called every 10 seconds from frontend).

**Endpoint:** `PUT /sessions/{session_id}/autosave`

**Authentication:** Required

**Request Body:**
```json
{
  "diagram_data": {
    "elements": [
      {
        "type": "rectangle",
        "x": 100,
        "y": 100,
        "width": 200,
        "height": 100
      }
    ],
    "appState": {
      "viewBackgroundColor": "#ffffff"
    }
  },
  "time_spent": 120
}
```

**Response:** `200 OK`
```json
{
  "id": "507f1f77bcf86cd799439012",
  "user_id": "user@example.com",
  "problem_id": "507f1f77bcf86cd799439011",
  "diagram_data": {
    "elements": [...],
    "appState": {...}
  },
  "diagram_hash": "new_hash_value",
  "time_spent": 120,
  "status": "active",
  "chat_messages": [],
  "last_saved_at": "2024-01-15T10:32:00.000Z",
  "started_at": "2024-01-15T10:30:00.000Z",
  "ended_at": null,
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-15T10:32:00.000Z"
}
```

**Error Responses:**
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - Session not found or access denied

**Notes:**
- Only saves if diagram data changed (hash comparison)
- Always updates time_spent and last_saved_at
- Prevents unnecessary database writes

---

### 5. Pause Session
Pause a session when user navigates away.

**Endpoint:** `PUT /sessions/{session_id}/pause`

**Authentication:** Required

**Request Body:**
```json
{
  "time_spent": 600
}
```

**Response:** `200 OK`
```json
{
  "id": "507f1f77bcf86cd799439012",
  "user_id": "user@example.com",
  "problem_id": "507f1f77bcf86cd799439011",
  "diagram_data": {...},
  "diagram_hash": "a1b2c3d4...",
  "time_spent": 600,
  "status": "paused",
  "chat_messages": [],
  "last_saved_at": "2024-01-15T10:40:00.000Z",
  "started_at": "2024-01-15T10:30:00.000Z",
  "ended_at": null,
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-15T10:40:00.000Z"
}
```

---

### 6. Resume Session
Resume a paused session.

**Endpoint:** `PUT /sessions/{session_id}/resume`

**Authentication:** Required

**Request Body:** None

**Response:** `200 OK`
```json
{
  "id": "507f1f77bcf86cd799439012",
  "user_id": "user@example.com",
  "problem_id": "507f1f77bcf86cd799439011",
  "diagram_data": {...},
  "diagram_hash": "a1b2c3d4...",
  "time_spent": 600,
  "status": "active",
  "chat_messages": [],
  "last_saved_at": "2024-01-15T10:40:00.000Z",
  "started_at": "2024-01-15T10:30:00.000Z",
  "ended_at": null,
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-15T10:45:00.000Z"
}
```

---

### 7. Add Chat Message to Session
Add AI chat message during practice.

**Endpoint:** `POST /sessions/{session_id}/chat`

**Authentication:** Required

**Request Body:**
```json
{
  "role": "user",
  "content": "How should I implement load balancing?"
}
```

**Response:** `200 OK`
```json
{
  "id": "507f1f77bcf86cd799439012",
  "user_id": "user@example.com",
  "problem_id": "507f1f77bcf86cd799439011",
  "diagram_data": {...},
  "diagram_hash": "a1b2c3d4...",
  "time_spent": 300,
  "status": "active",
  "chat_messages": [
    {
      "role": "user",
      "content": "How should I implement load balancing?",
      "timestamp": "2024-01-15T10:35:00.000Z"
    }
  ],
  "last_saved_at": "2024-01-15T10:32:00.000Z",
  "started_at": "2024-01-15T10:30:00.000Z",
  "ended_at": null,
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-15T10:35:00.000Z"
}
```

**Notes:**
- Chat messages stored in session during practice
- Copied to submission when user submits for evaluation

---

### 8. Abandon Session
Mark session as abandoned (user wants to start fresh).

**Endpoint:** `DELETE /sessions/{session_id}`

**Authentication:** Required

**Request Body:** None

**Response:** `204 No Content`

**Error Responses:**
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - Session not found or access denied

**Notes:**
- Session is marked as "abandoned", not deleted (for analytics)
- User can create new session for same problem after abandoning

---

### 9. Get My Sessions
Get all sessions for the current user.

**Endpoint:** `GET /sessions/user/my-sessions`

**Authentication:** Required

**Query Parameters:**
- `skip` (optional): Number of sessions to skip (default: 0)
- `limit` (optional): Maximum sessions to return (default: 100)

**Response:** `200 OK`
```json
[
  {
    "id": "507f1f77bcf86cd799439012",
    "user_id": "user@example.com",
    "problem_id": "507f1f77bcf86cd799439011",
    "diagram_data": {...},
    "diagram_hash": "a1b2c3d4...",
    "time_spent": 1200,
    "status": "submitted",
    "chat_messages": [...],
    "last_saved_at": "2024-01-15T10:50:00.000Z",
    "started_at": "2024-01-15T10:30:00.000Z",
    "ended_at": "2024-01-15T10:50:00.000Z",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:50:00.000Z"
  }
]
```

---

### Session Status Values
- `active` - Currently being worked on
- `paused` - User navigated away, can resume
- `submitted` - Converted to submission for evaluation
- `abandoned` - User chose to start fresh

---

### Session Workflow Example

```
1. User clicks "Start Practice"
   → POST /sessions/ (creates or returns existing session)

2. Every 10 seconds while practicing
   → PUT /sessions/{id}/autosave (saves progress)

3. User asks AI for help
   → POST /sessions/{id}/chat (adds message)

4. User navigates away
   → PUT /sessions/{id}/pause

5. User returns
   → PUT /sessions/{id}/resume

6. User submits solution
   → POST /submissions/from-session/{session_id}
   (Session marked as "submitted", creates Submission)
```

---

## �📝 Notes

1. All timestamps are in ISO 8601 format (UTC)
2. All IDs are MongoDB ObjectId strings
3. The API supports CORS for all origins (configured in production)
4. Token refresh should be handled automatically before access token expiration
5. Pagination is available on list endpoints with `skip` and `limit` parameters
6. Search is case-insensitive and uses regex matching

---

**API Version:** 1.0.0  
**Last Updated:** January 15, 2024
