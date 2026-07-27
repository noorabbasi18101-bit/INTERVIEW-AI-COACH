import { FullAnalysisResult, InterviewType, ExperienceLevel, JobField } from '../types';

export interface SavedSession {
  id: string;
  timestamp: number; // Date.now()
  field: JobField;
  type: InterviewType;
  level: ExperienceLevel;
  totalQuestions: number;
  overallScore: number;
  analysis: FullAnalysisResult;
}

const STORAGE_KEY = 'interview_ai_coach_history_v1';

export function getSavedSessions(): SavedSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to load session history:', err);
    return [];
  }
}

export function saveCompletedSession(session: Omit<SavedSession, 'id' | 'timestamp'>): SavedSession {
  const newSession: SavedSession = {
    ...session,
    id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    timestamp: Date.now(),
  };

  const current = getSavedSessions();
  const updated = [newSession, ...current];
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated.slice(0, 30))); // keep last 30 sessions
  } catch (err) {
    console.error('Failed to save session:', err);
  }

  return newSession;
}

export function clearSessionHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear history:', err);
  }
}

export function get7DayAnalytics(sessions: SavedSession[]) {
  const now = Date.now();
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  const recentSessions = sessions.filter((s) => now - s.timestamp <= sevenDaysMs);

  if (recentSessions.length === 0) {
    return null;
  }

  const totalScore = recentSessions.reduce((acc, s) => acc + s.overallScore, 0);
  const avgScore = Math.round(totalScore / recentSessions.length);

  // Confidence & Clarity averages from radar / sub-scores
  const avgConfidence = Math.round(
    recentSessions.reduce((acc, s) => acc + (s.analysis.radarSkills?.confidence || s.overallScore), 0) /
      recentSessions.length
  );

  const avgClarity = Math.round(
    recentSessions.reduce((acc, s) => acc + (s.analysis.radarSkills?.tone || s.overallScore), 0) /
      recentSessions.length
  );

  return {
    totalSessions: recentSessions.length,
    avgScore,
    avgConfidence,
    avgClarity,
    recentSessions,
  };
}
