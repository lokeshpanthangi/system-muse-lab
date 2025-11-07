import { apiClient } from '../lib/apiClient';
import type {
  Submission,
  SubmissionCreate,
  SubmissionUpdate,
  SubmissionsListResponse,
  SubmissionResponse,
  ChatMessageRequest,
} from '../types/api';

export const submissionService = {
  // Create a new submission
  async createSubmission(data: SubmissionCreate): Promise<SubmissionResponse> {
    return await apiClient.post<SubmissionResponse>('/submissions/', data);
  },

  // Get a specific submission by ID
  async getSubmissionById(submissionId: string): Promise<Submission> {
    return await apiClient.get<Submission>(`/submissions/${submissionId}`);
  },

  // Get all submissions by current user
  async getMySubmissions(skip: number = 0, limit: number = 100): Promise<SubmissionsListResponse> {
    return await apiClient.get<SubmissionsListResponse>(
      `/submissions/user/my-submissions?skip=${skip}&limit=${limit}`
    );
  },

  // Get current user's submission for a specific problem
  async getMySubmissionForProblem(problemId: string): Promise<Submission> {
    return await apiClient.get<Submission>(`/submissions/problem/${problemId}`);
  },

  // Update a submission
  async updateSubmission(submissionId: string, data: SubmissionUpdate): Promise<SubmissionResponse> {
    return await apiClient.put<SubmissionResponse>(`/submissions/${submissionId}`, data);
  },

  // Add a chat message to a submission
  async addChatMessage(submissionId: string, message: ChatMessageRequest): Promise<SubmissionResponse> {
    return await apiClient.post<SubmissionResponse>(
      `/submissions/${submissionId}/chat`,
      message
    );
  },

  // Delete a submission
  async deleteSubmission(submissionId: string): Promise<void> {
    return await apiClient.delete<void>(`/submissions/${submissionId}`);
  },
};
