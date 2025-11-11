# Submit Button Flow - What Gets Sent to LLM

## When You Click Submit Button

### 1. **Frontend Saves Your Work**
```
Practice.tsx → handleSubmit()
├── Saves current diagram to database (autosave)
├── Gets all Excalidraw elements (shapes, arrows, text)
└── Calls backend API: POST /sessions/{sessionId}/submit
```

### 2. **Backend Receives Your Diagram**
```
session_routes.py → submit endpoint
├── Validates session exists and belongs to you
├── Gets problem data (title, requirements, description)
├── Gets your diagram data (all elements)
└── Calls Submit Agent
```

### 3. **Submit Agent Processes Your Submission**

#### Step 1: Extract Diagram Summary
The agent converts your visual diagram into text description:
```python
# Example of what gets extracted:
=== DIAGRAM SUMMARY ===
Total: 15 elements
Components: 6
Connections: 4

=== COMPONENTS ===
- RECTANGLE(abc123): "Load Balancer"
- RECTANGLE(def456): "Web Server"
- ELLIPSE(ghi789): "Database"
- RECTANGLE(jkl012): "Cache"
- RECTANGLE(mno345): "Queue"
- DIAMOND(pqr678): "API Gateway"

=== CONNECTIONS ===
- Arrow(arr001): abc123 → def456 "HTTP Requests"
- Arrow(arr002): def456 → ghi789 "SQL Queries"
- Arrow(arr003): def456 → jkl012 "Cache Lookup"
- Arrow(arr004): mno345 → def456 "Process Jobs"

=== LABELS ===
- Text: "User Traffic"
- Text: "Redis Cache"
- Text: "PostgreSQL"
```

**What's Sent to LLM:**
- ✅ **Problem title** (e.g., "Design URL Shortener")
- ✅ **Problem description** (what the system should do)
- ✅ **Problem requirements** (all 5-7 requirements listed)
- ✅ **Diagram summary** (components, arrows, text labels)
- ✅ **Component names** (what you labeled them)
- ✅ **Connection patterns** (how things are connected)
- ❌ **NOT sent:** Raw coordinates, colors, exact positions
- ❌ **NOT sent:** Your entire codebase or other files

#### Step 2: LLM Scoring (GPT-4)
```python
Prompt to GPT-4:
"""
Problem: Design URL Shortener

Requirements:
1. Generate unique short URLs
2. Redirect users to original URL
3. Handle 1000 requests/second
4. Store URL mappings persistently
5. Provide analytics on URL usage

Student's Diagram:
[The diagram summary from above]

Evaluate and score 0-100, provide breakdown.
"""
```

**LLM Returns:**
```json
{
  "score": 75,
  "implemented": [
    "Load balancer for traffic distribution",
    "Database for persistent storage",
    "Proper connection between components"
  ],
  "missing": [
    "No caching layer for frequently accessed URLs",
    "Missing analytics/monitoring component",
    "No consideration for rate limiting"
  ],
  "breakdown": [
    {"requirement": "Generate unique short URLs", "achieved": true, "points": 20},
    {"requirement": "Handle 1000 requests/second", "achieved": false, "points": 10}
  ]
}
```

#### Step 3: Generate Tips (GPT-4)
```python
Prompt to GPT-4:
"""
Problem: Design URL Shortener
Score: 75/100

What they did well:
- Load balancer for traffic distribution
- Database for persistent storage

What's missing:
- No caching layer
- Missing analytics component

Generate 4-6 specific tips to improve.
"""
```

**LLM Returns:**
```json
[
  "Add Redis cache between load balancer and database to reduce database load for popular URLs",
  "Include an analytics service (e.g., Kafka + stream processor) to track click events",
  "Consider consistent hashing for URL generation to avoid collisions",
  "Add rate limiting at API Gateway to prevent abuse"
]
```

#### Step 4: Fetch YouTube Videos (YouTube API)
```python
YouTube Data API Search:
Query: "URL Shortener system design tutorial"
Results: 5 real videos with titles, URLs, channels
```

**Only if YOUTUBE_API_KEY is configured!**
If not configured → returns empty array (no fake/fallback data).

#### Step 5: Fetch Documentation Links (GPT-4)
```python
Prompt to GPT-4:
"""
Problem: URL Shortener
Missing concepts: caching, analytics, rate limiting

Suggest official documentation links.
"""
```

**LLM Returns:**
```json
[
  {"title": "Redis Caching Guide", "url": "https://redis.io/docs/...", "reason": "Learn caching patterns"},
  {"title": "AWS DynamoDB", "url": "https://docs.aws.amazon.com/...", "reason": "Scalable key-value store"}
]
```

### 4. **Response Sent Back to Frontend**
```json
{
  "submission_id": "abc123...",
  "session_id": "session_xyz",
  "problem_id": "problem_789",
  "score": 75,
  "max_score": 100,
  "breakdown": [...],
  "feedback": {
    "implemented": ["Load balancer...", "Database..."],
    "missing": ["Caching layer...", "Analytics..."],
    "next_steps": ["Add Redis cache...", "Include analytics service..."]
  },
  "tips": ["Add Redis cache...", "Include analytics...", ...],
  "resources": {
    "videos": [{title, url, channel, reason}, ...],
    "docs": [{title, url, source, reason}, ...]
  }
}
```

### 5. **Frontend Shows Results Page**
```
Results.tsx displays:
├── Score with color coding
├── Strengths (implemented)
├── Weaknesses (missing)
├── Learning Resources (videos + docs)
└── Tips for improvement
```

---

## Summary: What's Sent to LLM

### Total Data Sent:
1. **Problem Context** (~500 words)
   - Title
   - Description
   - Requirements (5-7 items)

2. **Your Diagram Summary** (~200-500 words)
   - Component names and types
   - Connection patterns
   - Text labels

3. **Scoring Context** (~300 words)
   - Current score
   - What's implemented
   - What's missing

**Total tokens to GPT-4:** ~1,000-2,000 tokens per evaluation
**Cost per submission:** ~$0.01-0.02 USD

### NOT Sent:
- ❌ Raw pixel coordinates
- ❌ Canvas colors/styling
- ❌ Your entire project code
- ❌ Other users' solutions
- ❌ Previous submission history

---

## Required Environment Variables

```bash
# Required for scoring, tips, and doc suggestions
OPENAI_API_KEY=sk-...

# Required for real YouTube video recommendations
YOUTUBE_API_KEY=AIza...
```

Without these keys:
- No OPENAI_API_KEY → Score returns 0, error message shown
- No YOUTUBE_API_KEY → Videos array is empty (no fallbacks)
