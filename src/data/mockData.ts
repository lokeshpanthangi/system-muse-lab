export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string;
  joinedDate: string;
  stats: {
    totalAttempts: number;
    averageScore: number;
    completionRate: number;
  };
}

export interface Question {
  id: string;
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  categories: string[];
  estimatedTime: string;
  requirements: string[];
  constraints: string[];
  expectedComponents: string[];
  hints: string[];
}

export interface Attempt {
  id: string;
  questionId: string;
  userId: string;
  diagramData: any;
  score: number;
  feedback: {
    strengths: string[];
    improvements: string[];
    missingComponents: string[];
  };
  submittedAt: string;
  timeSpent: number;
  status: "completed" | "in-progress";
}

export const mockUser: User = {
  id: "user-1",
  email: "demo@systemdesign.com",
  name: "Alex Chen",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
  joinedDate: "2024-01-15",
  stats: {
    totalAttempts: 12,
    averageScore: 78,
    completionRate: 67,
  },
};

export const mockQuestions: Question[] = [
  {
    id: "q1",
    title: "Design a URL Shortener Service",
    description: "Design a scalable URL shortening service like bit.ly that can handle millions of requests per day. The system should be able to generate short URLs, redirect users to original URLs, and track analytics.",
    difficulty: "medium",
    categories: ["Web Services", "Databases", "Caching"],
    estimatedTime: "45 mins",
    requirements: [
      "Generate unique short URLs for any given long URL",
      "Redirect users from short URL to original URL with minimal latency",
      "Track click analytics for each short URL",
      "Handle 1000+ requests per second",
      "Ensure short URLs don't collide",
    ],
    constraints: [
      "Short URLs should be 6-8 characters long",
      "System should be highly available (99.9% uptime)",
      "Read-heavy workload (100:1 read-to-write ratio)",
    ],
    expectedComponents: [
      "Load Balancer",
      "Application Servers",
      "Database (SQL or NoSQL)",
      "Cache Layer (Redis/Memcached)",
      "URL Generation Service",
      "Analytics Service",
    ],
    hints: [
      "Consider using a hash function or base62 encoding for URL generation",
      "Think about how to handle cache invalidation",
      "Consider using a CDN for global distribution",
    ],
  },
  {
    id: "q2",
    title: "Design Instagram Feed",
    description: "Design the backend system for Instagram's news feed feature. Users should see posts from people they follow in reverse chronological order with efficient loading.",
    difficulty: "hard",
    categories: ["Social Media", "Feeds", "Scalability"],
    estimatedTime: "60 mins",
    requirements: [
      "Display posts from followed users in reverse chronological order",
      "Support pagination for infinite scroll",
      "Handle millions of active users",
      "Real-time updates when new posts are available",
      "Support images and videos",
    ],
    constraints: [
      "Feed generation should take < 500ms",
      "System should handle 100M daily active users",
      "Average user follows 500 people",
    ],
    expectedComponents: [
      "API Gateway",
      "Feed Generation Service",
      "Post Storage",
      "User Graph Database",
      "Cache Layer",
      "Message Queue",
      "CDN for media",
    ],
    hints: [
      "Consider fan-out on write vs fan-out on read",
      "Think about celebrity user problem (millions of followers)",
      "Consider hybrid approach for different user types",
    ],
  },
  {
    id: "q3",
    title: "Design a Rate Limiter",
    description: "Design a distributed rate limiting system that can prevent abuse by limiting the number of requests a user can make within a time window.",
    difficulty: "easy",
    categories: ["Security", "Distributed Systems"],
    estimatedTime: "30 mins",
    requirements: [
      "Limit requests per user per time window",
      "Support different rate limits for different API endpoints",
      "Work in distributed environment",
      "Low latency (< 10ms overhead)",
      "Accurate counting",
    ],
    constraints: [
      "Must work across multiple servers",
      "Handle 10K+ requests per second",
      "Time windows: 1 minute, 1 hour, 1 day",
    ],
    expectedComponents: [
      "Rate Limiting Service",
      "Redis or similar fast storage",
      "Token bucket or sliding window algorithm",
      "API Gateway integration",
    ],
    hints: [
      "Consider token bucket, leaky bucket, or sliding window algorithms",
      "Think about using Redis for distributed counter",
      "Consider trade-offs between accuracy and performance",
    ],
  },
  {
    id: "q4",
    title: "Design Netflix Video Streaming",
    description: "Design a video streaming platform that can serve millions of concurrent users with adaptive bitrate streaming and minimal buffering.",
    difficulty: "hard",
    categories: ["Video Streaming", "CDN", "Scalability"],
    estimatedTime: "60 mins",
    requirements: [
      "Stream videos with adaptive bitrate",
      "Minimize buffering and latency",
      "Handle millions of concurrent streams",
      "Support multiple device types",
      "Resume playback across devices",
    ],
    constraints: [
      "99.99% uptime required",
      "Support 4K video streaming",
      "Global user base",
      "Peak traffic during evenings",
    ],
    expectedComponents: [
      "Content Delivery Network (CDN)",
      "Origin Servers",
      "Transcoding Service",
      "User Service",
      "Recommendation Engine",
      "Analytics Service",
      "Database",
    ],
    hints: [
      "Think about video encoding formats (HLS, DASH)",
      "Consider using CDN for content distribution",
      "Think about how to handle popular content vs long-tail",
    ],
  },
];

export const mockAttempts: Attempt[] = [
  {
    id: "a1",
    questionId: "q1",
    userId: "user-1",
    diagramData: {},
    score: 82,
    feedback: {
      strengths: [
        "Good use of caching layer for read optimization",
        "Proper separation of URL generation and redirect services",
      ],
      improvements: [
        "Consider adding more robust analytics pipeline",
        "Missing discussion on database sharding strategy",
      ],
      missingComponents: ["Analytics data warehouse", "Monitoring system"],
    },
    submittedAt: "2024-03-10T14:30:00Z",
    timeSpent: 2700,
    status: "completed",
  },
  {
    id: "a2",
    questionId: "q3",
    userId: "user-1",
    diagramData: {},
    score: 75,
    feedback: {
      strengths: ["Good choice of Redis for distributed counting"],
      improvements: ["Could improve algorithm choice explanation"],
      missingComponents: ["Fallback mechanism"],
    },
    submittedAt: "2024-03-08T10:15:00Z",
    timeSpent: 1800,
    status: "completed",
  },
];

// Helper functions
export const getQuestionById = (id: string): Question | undefined => {
  return mockQuestions.find((q) => q.id === id);
};

export const getAttemptsByUserId = (userId: string): Attempt[] => {
  return mockAttempts.filter((a) => a.userId === userId);
};

export const getAttemptByQuestionId = (questionId: string, userId: string): Attempt | undefined => {
  return mockAttempts.find((a) => a.questionId === questionId && a.userId === userId);
};
