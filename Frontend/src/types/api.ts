// User Types
export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  created_at: string;
}

export interface UserSignup {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}

export interface UserLogin {
  username: string; // email
  password: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

// Problem Types
export interface Problem {
  id: string;
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  categories: string[];
  estimated_time: string;
  requirements: string[];
  constraints: string[];
  hints: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ProblemCreate {
  title: string;
  description: string;
  difficulty: string;
  categories: string[];
  estimated_time: string;
  requirements: string[];
  constraints: string[];
  hints: string[];
}

export interface ProblemUpdate {
  title?: string;
  description?: string;
  difficulty?: string;
  categories?: string[];
  estimated_time?: string;
  requirements?: string[];
  constraints?: string[];
  hints?: string[];
}

export interface ProblemsListResponse {
  total: number;
  skip: number;
  limit: number;
  problems: Problem[];
}

// Submission Types
export interface Feedback {
  strengths: string[];
  improvements: string[];
  missing_components: string[];
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface Submission {
  id: string;
  user_id: string;
  problem_id: string;
  diagram_data: any;
  score: number;
  time_spent: number;
  status: "completed" | "in-progress";
  feedback: Feedback;
  chat_messages: ChatMessage[];
  submitted_at: string;
  updated_at: string;
}

export interface SubmissionCreate {
  problem_id: string;
  diagram_data?: any;
  status?: string;
}

export interface SubmissionUpdate {
  diagram_data?: any;
  score?: number;
  time_spent?: number;
  status?: string;
  feedback?: Feedback;
}

export interface ChatMessageRequest {
  role: string;
  content: string;
}

export interface SubmissionsListResponse {
  total: number;
  skip: number;
  limit: number;
  submissions: Submission[];
}

// API Response Types
export interface ApiResponse<T> {
  message?: string;
  data?: T;
  error?: string;
}

export interface ProblemResponse {
  message: string;
  problem: Problem;
}

export interface SubmissionResponse {
  message: string;
  submission: Submission;
}

// Session Types
export interface Session {
  id: string;
  user_id: string;
  problem_id: string;
  diagram_data: any;
  diagram_hash: string;
  time_spent: number;
  status: "active" | "paused" | "submitted" | "abandoned";
  chat_messages: ChatMessage[];
  created_at: string;
  updated_at: string;
  ended_at?: string;
}

export interface SessionCreate {
  problem_id: string;
  diagram_data?: any;
}

export interface SessionAutosave {
  diagram_data: any;
  time_spent: number;
}

export interface SessionCheckResponse {
  session_id: string;
  problem_id: string;
  feedback: {
    implemented: string[];
    missing: string[];
    next_steps: string[];
  };
  diagram_hash: string;
  cached: boolean;
  timestamp: string;
}

export interface SessionResponse {
  message?: string;
  session?: Session;
  id?: string;
  user_id?: string;
  problem_id?: string;
  diagram_data?: any;
  diagram_hash?: string;
  time_spent?: number;
  status?: string;
  chat_messages?: ChatMessage[];
  created_at?: string;
  updated_at?: string;
  ended_at?: string;
}
