export type Screen = 'home' | 'selection' | 'practice' | 'feedback' | 'analysis' | 'result';

export type Language = 'EN' | 'UR';

export type InterviewType = 'HR Interview' | 'Technical' | 'Internship' | 'Job Interview';

export type ExperienceLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export type JobField =
  | 'Software Engineering'
  | 'Data Science & AI'
  | 'Product Management'
  | 'Marketing & Sales'
  | 'Finance & Business'
  | 'Design & UX'
  | 'Healthcare & Medical'
  | 'General Business'
  | 'Other';

export interface QuestionItem {
  id: number;
  category: string;
  question: string;
  quickTip: string;
}

export interface EvaluationResult {
  score: number;
  logicScore: number;
  clarityScore: number;
  softSkillsScore: number;
  celebrationMessage: string;
  celebrationSubtext: string;
  strengths: string[];
  watchOutFor: Array<{ title: string; feedback: string }>;
  coachTip: string;
  coachTitle: string;
  coachSubtitle: string;
  growthPlan: Array<{ title: string; description: string }>;
}

export interface QuestionAnswerPair {
  questionId: number;
  category: string;
  question: string;
  userAnswer: string;
  evaluation?: EvaluationResult;
}

export interface FullAnalysisResult {
  overallScore: number;
  scoreVsLastWeek: string;
  overallFeedback: string;
  radarSkills: {
    technical: number;
    tone: number;
    confidence: number;
    pacing: number;
  };
  growthPoints: Array<{
    category: string;
    percentage: number;
    feedback: string;
  }>;
  tacticalReview: Array<{
    questionNumber: number;
    question: string;
    userAnswer: string;
    aiSuggestion: string;
  }>;
}
