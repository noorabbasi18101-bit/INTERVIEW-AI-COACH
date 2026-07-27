import React from 'react';
import { QuestionItem, Language } from '../types';

interface PracticeScreenProps {
  questions: QuestionItem[];
  currentIndex: number;
  userAnswer: string;
  onAnswerChange: (text: string) => void;
  onSubmitAnswer: () => void;
  isEvaluating: boolean;
  language: Language;
  onSkipQuestion?: () => void;
}

export const PracticeScreen: React.FC<PracticeScreenProps> = ({
  questions,
  currentIndex,
  userAnswer,
  onAnswerChange,
  onSubmitAnswer,
  isEvaluating,
  language,
}) => {
  const isUrdu = language === 'UR';

  const currentQuestion = questions[currentIndex] || {
    id: 1,
    category: 'Behavioral Question',
    question:
      'Tell me about a time when you had to deal with a difficult team member. How did you handle the situation and what was the outcome?',
    quickTip:
      'Try using the STAR method (Situation, Task, Action, Result) to structure this behavioral response.',
  };

  const totalQuestions = questions.length || 5;
  const progressPercent = Math.round(((currentIndex + 1) / totalQuestions) * 100);

  return (
    <div className="flex flex-col w-full px-6 pt-5 pb-28 gap-5 max-w-lg sm:max-w-xl mx-auto">
      {/* Header/Coach Status */}
      <div className="flex items-center gap-4 mb-1">
        <div className="relative">
          <div className="w-14 h-14 rounded-full overflow-hidden shadow-md bg-[#edeef2] border-2 border-white">
            <img
              alt="AI Interview Coach"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida/AP1WRLtImq_dxO11OWXpvdZg3TVWMMC6QYfJdiyIndMx-tTfuyFl-k7HUEK7O7KPms6x8qNMGNoMP7rk-wuJrzRERJPMHQiPadplbZOxijpFffuL3Sj04T8LbliLV-e7wM3p42LxQLkBH81NNWnfoP_PVWwSRcO5LewAmR6Q0acq7sjW_aOl64sVdKSUyMvoGnA9L24PLZnQKBve4djkdnNw8JomAA74VPIA27UkVloDnRWbpi2MLk-TPFx7G9_e"
            />
          </div>
          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#4b53bb] rounded-full border-2 border-white animate-pulse" />
        </div>

        <div className="flex flex-col">
          <span className="font-semibold text-lg text-[#4b53bb]">AI Interview Coach</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#4b53bb]/60 animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 rounded-full bg-[#4b53bb]/60 animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 rounded-full bg-[#4b53bb]/60 animate-bounce" style={{ animationDelay: '300ms' }} />
            <span className="text-xs text-[#464652] ml-1">
              {isEvaluating
                ? isUrdu ? 'تجزیہ کیا جا رہا ہے...' : 'Evaluating answer...'
                : isUrdu ? 'سوال تیار ہے' : 'Ready for text response'}
            </span>
          </div>
        </div>
      </div>

      {/* Progress Tracker */}
      <div className="bg-[#f2f3f7] rounded-2xl p-4 shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-semibold text-[#464652]">
            {isUrdu ? 'انٹرویو کی پیشرفت' : 'Interview Progress'}
          </span>
          <span className="text-xs font-bold text-[#4b53bb]">
            {currentIndex + 1} {isUrdu ? 'از' : 'of'} {totalQuestions} {isUrdu ? 'سوالات' : 'Questions'}
          </span>
        </div>
        <div className="h-2 w-full bg-[#e1e2e6] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#4b53bb] rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-2xl p-5 shadow-sm relative overflow-hidden border border-gray-100">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-[#4b53bb]" />
        <div className="flex items-center gap-2 mb-2">
          <span className="material-symbols-outlined text-[#4b53bb] text-lg">psychology</span>
          <span className="text-xs font-bold text-[#4b53bb] uppercase tracking-wider">
            {currentQuestion.category || 'Behavioral Question'}
          </span>
        </div>
        <p className="text-base text-[#191c1f] leading-relaxed font-medium">
          "{currentQuestion.question}"
        </p>
      </div>

      {/* Response Area */}
      <div className="flex flex-col gap-3">
        <textarea
          value={userAnswer}
          onChange={(e) => onAnswerChange(e.target.value)}
          disabled={isEvaluating}
          className="w-full min-h-[160px] p-4 rounded-2xl bg-[#f2f3f7] text-[#191c1f] text-sm placeholder:text-[#464652]/60 focus:outline-none focus:ring-2 focus:ring-[#4b53bb]/30 transition-all resize-none font-sans border border-gray-200/60"
          placeholder={
            isUrdu
              ? 'اپنا تفصیلی جواب یہاں ٹائپ کریں...'
              : 'Type your response here...'
          }
        />

        {/* Submit Button */}
        <button
          onClick={onSubmitAnswer}
          disabled={isEvaluating || !userAnswer.trim()}
          className="w-full h-14 rounded-full bg-gradient-to-r from-[#4b53bb] to-[#8b93ff] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
        >
          {isEvaluating ? (
            <>
              <span className="material-symbols-outlined animate-spin">progress_activity</span>
              <span>{isUrdu ? 'تجزیہ کر رہا ہے...' : 'Evaluating Response...'}</span>
            </>
          ) : (
            <>
              <span>{isUrdu ? 'جواب جمع کروائیں' : 'Submit Answer'}</span>
              <span className="material-symbols-outlined text-lg">send</span>
            </>
          )}
        </button>
      </div>

      {/* Contextual Quick Tip */}
      <div className="p-4 rounded-2xl bg-[#64a6c0]/15 flex items-start gap-3 mt-1">
        <span className="material-symbols-outlined text-[#1a667e] text-xl shrink-0">lightbulb</span>
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-bold text-[#1a667e]">
            {isUrdu ? 'فوری مشورہ' : 'Quick Tip'}
          </span>
          <p className="text-xs text-[#464652] leading-relaxed">
            {currentQuestion.quickTip ||
              'Try using the STAR method (Situation, Task, Action, Result) to structure your response.'}
          </p>
        </div>
      </div>
    </div>
  );
};

