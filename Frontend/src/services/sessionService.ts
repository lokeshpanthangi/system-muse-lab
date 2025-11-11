import { apiClient } from '@/lib/apiClient';
import type { 
  Session, 
  SessionCreate, 
  SessionAutosave, 
  SessionPause, 
  ChatMessageCreate,
  SessionsListResponse 
} from '@/types/api';

export const sessionService = {
  /**
   * Create a new session or resume existing active session for a problem
   */
  async createSession(data: SessionCreate): Promise<Session> {
    const response = await apiClient.post<Session>('/sessions/', data);
    return response;
  },

  /**
   * Get session by ID
   */
  async getSessionById(sessionId: string): Promise<Session> {
    const response = await apiClient.get<Session>(`/sessions/${sessionId}`);
    return response;
  },

  /**
   * Get active session for a specific problem
   * Returns null if no active session exists
   */
  async getActiveSessionForProblem(problemId: string): Promise<Session | null> {
    try {
      const response = await apiClient.get<Session | null>(`/sessions/problem/${problemId}`);
      return response;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Auto-save session progress (called every 10 seconds)
   */
  async autosaveSession(sessionId: string, data: SessionAutosave): Promise<Session> {
    const response = await apiClient.put<Session>(`/sessions/${sessionId}/autosave`, data);
    return response;
  },

  /**
   * Pause session (user navigates away)
   */
  async pauseSession(sessionId: string, data: SessionPause): Promise<Session> {
    const response = await apiClient.put<Session>(`/sessions/${sessionId}/pause`, data);
    return response;
  },

  /**
   * Resume a paused session
   */
  async resumeSession(sessionId: string): Promise<Session> {
    const response = await apiClient.put<Session>(`/sessions/${sessionId}/resume`, {});
    return response;
  },

  /**
   * Add chat message to session
   */
  async addChatMessage(sessionId: string, data: ChatMessageCreate): Promise<Session> {
    const response = await apiClient.post<Session>(`/sessions/${sessionId}/chat`, data);
    return response;
  },

  /**
   * Abandon session (start fresh)
   */
  async abandonSession(sessionId: string): Promise<void> {
    await apiClient.delete(`/sessions/${sessionId}`);
  },

  /**
   * Get all sessions for current user
   */
  async getMySessions(skip: number = 0, limit: number = 100): Promise<SessionsListResponse> {
    const response = await apiClient.get<Session[]>(
      `/sessions/user/my-sessions?skip=${skip}&limit=${limit}`
    );
    return {
      sessions: response,
      total: response.length
    };
  },

  /**
   * Submit session for evaluation (converts to submission)
   */
  async submitSession(sessionId: string): Promise<any> {
    const response = await apiClient.post(`/submissions/from-session/${sessionId}`);
    return response;
  }
};
