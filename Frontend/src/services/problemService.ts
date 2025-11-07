import { apiClient } from '../lib/apiClient';
import type {
  Problem,
  ProblemCreate,
  ProblemUpdate,
  ProblemsListResponse,
  ProblemResponse,
} from '../types/api';

export const problemService = {
  // Create a new problem
  async createProblem(data: ProblemCreate): Promise<ProblemResponse> {
    return await apiClient.post<ProblemResponse>('/problems/', data);
  },

  // Get a specific problem by ID
  async getProblemById(problemId: string): Promise<Problem> {
    return await apiClient.get<Problem>(`/problems/${problemId}`);
  },

  // Get all problems with pagination
  async getAllProblems(skip: number = 0, limit: number = 100): Promise<ProblemsListResponse> {
    return await apiClient.get<ProblemsListResponse>(
      `/problems/?skip=${skip}&limit=${limit}`
    );
  },

  // Get problems created by current user
  async getMyProblems(skip: number = 0, limit: number = 100): Promise<ProblemsListResponse> {
    return await apiClient.get<ProblemsListResponse>(
      `/problems/user/my-problems?skip=${skip}&limit=${limit}`
    );
  },

  // Update a problem
  async updateProblem(problemId: string, data: ProblemUpdate): Promise<ProblemResponse> {
    return await apiClient.put<ProblemResponse>(`/problems/${problemId}`, data);
  },

  // Delete a problem
  async deleteProblem(problemId: string): Promise<void> {
    return await apiClient.delete<void>(`/problems/${problemId}`);
  },

  // Search problems
  async searchProblems(query: string, skip: number = 0, limit: number = 100): Promise<ProblemsListResponse> {
    return await apiClient.get<ProblemsListResponse>(
      `/problems/search/query?q=${encodeURIComponent(query)}&skip=${skip}&limit=${limit}`
    );
  },
};
