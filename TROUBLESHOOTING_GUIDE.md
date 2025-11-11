# 🎯 Submit Feature - Complete Overview

## ✅ What I Fixed

### 1. **Removed Submit Modal (213 lines of dead code)**
   - Modal was never triggering because navigation happens before state update
   - Cleaned up `Practice.tsx` lines 1363-1576

### 2. **Removed ALL Fallback Logic**
   
   #### YouTube Fetcher (`youtube_fetcher.py`)
   - ❌ **REMOVED:** LLM-based video suggestions
   - ❌ **REMOVED:** Hardcoded fallback URLs
   - ✅ **KEPT:** Only YouTube Data API v3
   - **Result:** Returns empty array if `YOUTUBE_API_KEY` not configured
   
   #### Scoring Tool (`scoring.py`)
   - ❌ **REMOVED:** Deterministic fallback (component counting)
   - ✅ **KEPT:** Only GPT-4 LLM evaluation
   - **Result:** Returns score=0 with error if `OPENAI_API_KEY` missing
   
   #### Tips Generator (`tips_generator.py`)
   - ❌ **REMOVED:** Generic tips based on score brackets
   - ✅ **KEPT:** Only GPT-4 personalized tips
   - **Result:** Returns empty array if `OPENAI_API_KEY` not configured

### 3. **Updated Environment Configuration**
   - Added `YOUTUBE_API_KEY` to `.env.example`
   - Added clear documentation on where to get API keys
   - Added comments explaining what each key is used for

### 4. **Enhanced Error Logging**
   - Added console logs in `Practice.tsx` handleSubmit
   - Added console logs in `Results.tsx` to debug state
   - Added detailed error messages in backend tools

### 5. **Cleared Python Cache**
   - Removed all `__pycache__` directories
   - Ensures latest code changes are used

---

## 📊 What Gets Sent to LLM When You Submit

### Overview
When you click Submit, here's the flow:

```
Frontend (Practice.tsx)
    ↓
    Autosave diagram
    ↓
    POST /sessions/{sessionId}/submit
    ↓
Backend (session_routes.py)
    ↓
    Get problem data + diagram data
    ↓
Submit Agent (submit_agent.py)
    ↓
    ┌─────────────────────────────────┐
    │ 1. Extract Diagram Summary      │
    │    - Components with names      │
    │    - Arrows (connections)       │
    │    - Text labels                │
    └─────────────────────────────────┘
    ↓
    ┌─────────────────────────────────┐
    │ 2. LLM Scoring (GPT-4)          │
    │    INPUT:                       │
    │    - Problem title              │
    │    - Requirements (5-7 items)   │
    │    - Diagram summary            │
    │    OUTPUT:                      │
    │    - Score (0-100)              │
    │    - What's implemented         │
    │    - What's missing             │
    │    - Breakdown per requirement  │
    └─────────────────────────────────┘
    ↓
    ┌─────────────────────────────────┐
    │ 3. Generate Tips (GPT-4)        │
    │    INPUT:                       │
    │    - Score + feedback           │
    │    - Missing concepts           │
    │    OUTPUT:                      │
    │    - 4-6 actionable tips        │
    └─────────────────────────────────┘
    ↓
    ┌─────────────────────────────────┐
    │ 4. Fetch Resources (Parallel)   │
    │    A) YouTube API:              │
    │       - Search videos           │
    │       - Get real titles/URLs    │
    │    B) Docs LLM (GPT-4):         │
    │       - Suggest official docs   │
    │       - Provide reasons         │
    └─────────────────────────────────┘
    ↓
Return Complete Result
    ↓
Frontend displays in Results page
```

---

## 🔍 Detailed: What's Sent to Each LLM Call

### Call #1: Scoring (GPT-4)

**Sent to LLM:**
```
Problem: Design URL Shortener

Description:
Create a scalable URL shortening service that can handle 
millions of requests...

Requirements:
1. Generate unique short URLs from long URLs
2. Redirect users to original URL when accessing short URL
3. Handle 1000 requests per second
4. Store URL mappings persistently
5. Provide basic analytics on URL usage

Student's Diagram:
=== DIAGRAM SUMMARY ===
Total: 15 elements
Components: 6
Connections: 4

=== COMPONENTS ===
- RECTANGLE(abc123): "Load Balancer"
- RECTANGLE(def456): "Web Server"
- ELLIPSE(ghi789): "PostgreSQL Database"
- RECTANGLE(jkl012): "Redis Cache"
- RECTANGLE(mno345): "URL Generator Service"
- RECTANGLE(pqr678): "Analytics Service"

=== CONNECTIONS ===
- Arrow(arr001): abc123 → def456 "HTTP Requests"
- Arrow(arr002): def456 → ghi789 "Store/Fetch URLs"
- Arrow(arr003): def456 → jkl012 "Cache Check"
- Arrow(arr004): def456 → pqr678 "Track Clicks"

=== LABELS ===
- Text: "User Traffic"
- Text: "Redis 6.2"
- Text: "Rate: 1000 req/s"

Diagram Statistics:
- Total elements: 15
- Components: 6
- Arrows: 4
- Text labels: 3

Evaluate this diagram and score 0-100.
```

**Estimated Tokens:** ~800-1200 tokens

**LLM Response:**
```json
{
  "score": 82,
  "implemented": [
    "Load balancer included for distributing traffic",
    "Separate URL Generator Service for creating unique IDs",
    "Redis cache for frequently accessed URLs",
    "PostgreSQL for persistent storage",
    "Analytics service for tracking usage",
    "Proper data flow connections shown"
  ],
  "missing": [
    "No rate limiting mechanism visible",
    "Missing CDN for global distribution",
    "No database replication/sharding shown for scale"
  ],
  "breakdown": [
    {
      "requirement": "Generate unique short URLs",
      "achieved": true,
      "points": 20,
      "note": "URL Generator Service present"
    },
    {
      "requirement": "Redirect users to original URL",
      "achieved": true,
      "points": 18,
      "note": "Cache + DB flow shown correctly"
    },
    {
      "requirement": "Handle 1000 requests/second",
      "achieved": false,
      "points": 12,
      "note": "Load balancer present but no horizontal scaling shown"
    },
    {
      "requirement": "Store mappings persistently",
      "achieved": true,
      "points": 20,
      "note": "PostgreSQL database included"
    },
    {
      "requirement": "Provide analytics",
      "achieved": true,
      "points": 12,
      "note": "Analytics service present but integration unclear"
    }
  ]
}
```

---

### Call #2: Tips Generation (GPT-4)

**Sent to LLM:**
```
Problem: Design URL Shortener

Requirements:
1. Generate unique short URLs from long URLs
2. Redirect users to original URL
3. Handle 1000 requests per second
4. Store URL mappings persistently
5. Provide basic analytics

Student's Score: 82/100

What they did well:
- Load balancer included
- Separate URL Generator Service
- Redis cache for frequently accessed URLs
- PostgreSQL for persistent storage
- Analytics service for tracking usage

What's missing or needs improvement:
- No rate limiting mechanism visible
- Missing CDN for global distribution
- No database replication/sharding shown

Their current diagram summary:
[First 600 characters of diagram summary...]

Generate 4-6 specific, actionable tips to help improve.
```

**Estimated Tokens:** ~600-900 tokens

**LLM Response:**
```json
[
  "Add a rate limiting layer (e.g., Redis + sliding window algorithm) at the API Gateway level to prevent abuse and ensure fair usage",
  "Implement database sharding by URL ID hash to distribute load across multiple PostgreSQL instances - this will help you scale beyond 1000 req/s",
  "Add a CDN (CloudFront/CloudFlare) in front of your Load Balancer to cache redirect responses globally and reduce latency for users worldwide",
  "Consider using Cassandra or DynamoDB instead of PostgreSQL for better write throughput if you expect millions of URLs",
  "Add a message queue (Kafka/RabbitMQ) between your web servers and analytics service to decouple click tracking from request serving",
  "Include monitoring/alerting components (Prometheus, Grafana) to track system health and performance metrics"
]
```

---

### Call #3: Documentation Links (GPT-4)

**Sent to LLM:**
```
Problem: Design URL Shortener

Missing concepts that need documentation:
- Rate limiting mechanisms
- CDN for global distribution
- Database replication/sharding

Suggest 5-7 official documentation links that would help.
```

**Estimated Tokens:** ~300-500 tokens

**LLM Response:**
```json
[
  {
    "title": "Redis Rate Limiting Patterns",
    "url": "https://redis.io/docs/manual/patterns/rate-limiting/",
    "source": "Redis.io",
    "reason": "Learn how to implement rate limiting using Redis"
  },
  {
    "title": "AWS CloudFront for Content Delivery",
    "url": "https://docs.aws.amazon.com/cloudfront/",
    "source": "AWS",
    "reason": "Understand CDN setup for global distribution"
  },
  {
    "title": "PostgreSQL Replication",
    "url": "https://www.postgresql.org/docs/current/replication.html",
    "source": "PostgreSQL.org",
    "reason": "Learn database replication for high availability"
  }
]
```

---

### Call #4: YouTube Videos (YouTube Data API v3)

**API Request:**
```
GET https://www.googleapis.com/youtube/v3/search?
  part=snippet
  &q=URL Shortener system design tutorial
  &type=video
  &maxResults=5
  &key=YOUR_API_KEY
  &relevanceLanguage=en
  &safeSearch=strict
```

**Response:** Real YouTube videos (NOT from LLM)
```json
{
  "items": [
    {
      "id": {"videoId": "fMZMm_0ZhK4"},
      "snippet": {
        "title": "System Design Interview - URL Shortener",
        "channelTitle": "System Design Interview"
      }
    },
    ...
  ]
}
```

**Formatted Result:**
```json
[
  {
    "title": "System Design Interview - URL Shortener",
    "url": "https://www.youtube.com/watch?v=fMZMm_0ZhK4",
    "channel": "System Design Interview",
    "reason": "Recommended video about URL Shortener"
  }
]
```

---

## 📝 Total Data Sent to LLM

### Summary
- **3 LLM calls** (scoring, tips, docs) using GPT-4
- **1 API call** to YouTube (not LLM)

### Per Submission:
- **Total input tokens:** ~1,700-2,600 tokens
- **Total output tokens:** ~800-1,200 tokens
- **Total tokens:** ~2,500-3,800 tokens
- **Estimated cost:** $0.015-0.025 USD per submission

### What's Included:
✅ Problem title, description, requirements
✅ Diagram component names and types
✅ Connection patterns (arrows)
✅ Text labels
✅ Component statistics

### What's NOT Sent:
❌ Raw Excalidraw coordinates (x, y positions)
❌ Visual styling (colors, stroke width)
❌ Canvas size or zoom level
❌ Your entire project codebase
❌ Other files or previous submissions
❌ User personal information

---

## 🔑 Required Environment Variables

Create `Backend/.env` file:

```bash
# Required for ALL AI features (scoring, tips, docs)
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx

# Required for YouTube video recommendations ONLY
# Without this, videos array will be empty
YOUTUBE_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxx

# Other existing configs
MONGO_URL=mongodb://localhost:27017
DATABASE_NAME=system_design_practice
JWT_SECRET=your-secret-key
```

### How to Get API Keys:

**OpenAI API Key:**
1. Go to https://platform.openai.com/
2. Sign up / Log in
3. Go to API Keys section
4. Create new key
5. Copy the key (starts with `sk-proj-` or `sk-`)

**YouTube Data API v3 Key:**
1. Go to https://console.developers.google.com/
2. Create a new project or select existing
3. Enable "YouTube Data API v3"
4. Go to Credentials → Create Credentials → API Key
5. Copy the key

---

## 🐛 Troubleshooting

### Issue: Results page shows "No Results Found"

**Possible Causes:**
1. Backend server not running
2. Submit API call failed (check browser console)
3. OPENAI_API_KEY not configured
4. Navigation state was lost

**Debug Steps:**
1. Open browser DevTools (F12)
2. Go to Console tab
3. Click Submit button
4. Look for logs:
   ```
   Submit button clicked
   Saving current state...
   Calling submit API...
   Submit response received: {...}
   Navigating to results with feedbackContent: {...}
   ```
5. Check Results page logs:
   ```
   Results page - location.state: {...}
   Results page - feedbackContent: {...}
   ```

### Issue: Submit button hangs/loading forever

**Check:**
1. Backend terminal for errors
2. OPENAI_API_KEY is set in `.env`
3. Internet connection (for API calls)
4. MongoDB is running

### Issue: Empty videos array

**Solution:**
- Set `YOUTUBE_API_KEY` in `Backend/.env`
- This is optional - other features work without it

---

## ✨ Next Steps

1. **Start Backend:**
   ```bash
   cd Backend
   python main.py
   ```

2. **Check Environment:**
   - Verify `.env` file exists
   - Confirm OPENAI_API_KEY is set
   - (Optional) Set YOUTUBE_API_KEY

3. **Test Submit Flow:**
   - Go to Practice page
   - Draw a simple diagram (2-3 components with arrows)
   - Click Submit
   - Check browser console for logs
   - Should navigate to Results page with data

4. **If Issues:**
   - Check browser console (F12)
   - Check backend terminal output
   - Look for error messages in logs
