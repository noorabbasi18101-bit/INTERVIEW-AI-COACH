import React, { useEffect, useState } from 'react';
import { EvaluationResult, Language, Screen } from '../types';

interface FeedbackScreenProps {
  evaluation: EvaluationResult | null;
  currentIndex?: number;
  totalQuestions?: number;
  onNextQuestion?: () => void;
  onCompleteInterview?: () => void;
  onStartNewPractice?: () => void;
  onNavigate: (screen: Screen) => void;
  language: Language;
}

export const FeedbackScreen: React.FC<FeedbackScreenProps> = ({
  evaluation,
  currentIndex = 0,
  totalQuestions = 5,
  onNextQuestion,
  onCompleteInterview,
  onStartNewPractice,
  onNavigate,
  language,
}) => {
  const isUrdu = language === 'UR';
  const [scoreDisplay, setScoreDisplay] = useState(0);

  // If no evaluation exists for current answer, render clean empty state
  if (!evaluation) {
    return (
      <div className="flex flex-col w-full px-6 pt-8 pb-28 gap-6 max-w-lg sm:max-w-xl mx-auto text-center items-center">
        <div className="w-20 h-20 bg-[#4b53bb]/10 rounded-full flex items-center justify-center text-[#4b53bb] mt-6">
          <span className="material-symbols-outlined text-4xl">rate_review</span>
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-[#191c1f]">
            {isUrdu ? 'تاثرات کی دستیابی کے لیے سوال حل کریں' : 'No Feedback Available Yet'}
          </h1>
          <p className="text-sm text-[#464652] max-w-sm leading-relaxed">
            {isUrdu
              ? 'اپنا جواب جمع کروائیں تاکہ جنیائی اے آئی آپ کی کارکردگی اور وضاحت کا حقیقی تجزیہ فراہم کر سکے۔'
              : 'Submit an answer to an interview question first to receive real AI evaluation and actionable suggestions.'}
          </p>
        </div>

        <button
          onClick={() => onNavigate('practice')}
          className="w-full max-w-sm bg-[#4b53bb] hover:bg-[#3239a2] text-white font-semibold text-sm py-4 rounded-2xl shadow-lg shadow-[#4b53bb]/20 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer mt-2"
        >
          <span className="material-symbols-outlined text-lg">play_arrow</span>
          <span>{isUrdu ? 'سوال پر واپس جائیں' : 'Go to Practice Question'}</span>
        </button>
      </div>
    );
  }

  const evalData = evaluation;
  const targetScore = evalData.score || 0;
  const isLastQuestion = currentIndex + 1 >= totalQuestions;

  useEffect(() => {
    let start = 0;
    const duration = 1200;
    const interval = 20;
    const step = Math.max(1, targetScore / (duration / interval));

    const timer = setInterval(() => {
      start += step;
      if (start >= targetScore) {
        setScoreDisplay(targetScore);
        clearInterval(timer);
      } else {
        setScoreDisplay(Math.floor(start));
      }
    }, interval);

    return () => clearInterval(timer);
  }, [targetScore]);

  return (
    <div className="flex flex-col w-full px-6 pt-5 pb-28 gap-6 max-w-lg sm:max-w-xl mx-auto">
      {/* Celebration Header */}
      <div className="relative overflow-hidden rounded-3xl bg-[#8b93ff] p-6 flex flex-col items-center text-center gap-2 shadow-xl shadow-[#4b53bb]/10">
        <div className="w-14 h-14 bg-[#1d238f]/10 rounded-full flex items-center justify-center mb-1">
          <span className="material-symbols-outlined text-[#1d238f] text-[36px]">
            emoji_events
          </span>
        </div>
        <h2 className="text-2xl font-bold text-[#1d238f]">
          {evalData.celebrationMessage}
        </h2>
        <p className="text-xs text-[#1d238f]/90 max-w-[280px] leading-relaxed">
          {evalData.celebrationSubtext}
        </p>
      </div>

      {/* Score Visualization */}
      <div className="bg-white rounded-3xl p-6 flex flex-col items-center gap-4 shadow-sm border border-gray-100">
        <div className="relative flex items-center justify-center">
          <svg className="w-44 h-44 transform -rotate-90">
            <circle
              className="text-[#edeef2]"
              cx="88"
              cy="88"
              fill="transparent"
              r="76"
              stroke="currentColor"
              strokeWidth="12"
            />
            <circle
              className="text-[#4b53bb] transition-all duration-1000 ease-out"
              cx="88"
              cy="88"
              fill="transparent"
              r="76"
              stroke="currentColor"
              strokeDasharray={2 * Math.PI * 76}
              strokeDashoffset={2 * Math.PI * 76 - (scoreDisplay / 100) * (2 * Math.PI * 76)}
              strokeLinecap="round"
              strokeWidth="12"
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-4xl font-extrabold text-[#4b53bb]">{scoreDisplay}</span>
            <span className="text-[10px] font-bold text-[#464652] uppercase tracking-wider">
              {isUrdu ? 'سوال سکور' : 'Question Score'}
            </span>
          </div>
        </div>

        {/* Sub Score Bars */}
        <div className="grid grid-cols-3 w-full gap-2 pt-2">
          <div className="flex flex-col items-center gap-1">
            <span className="text-[11px] font-medium text-[#464652]">
              {isUrdu ? 'منطق' : 'Logic'}
            </span>
            <div className="h-1.5 w-full bg-[#edeef2] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#1a667e] rounded-full transition-all duration-700"
                style={{ width: `${evalData.logicScore}%` }}
              />
            </div>
          </div>

          <div className="flex flex-col items-center gap-1">
            <span className="text-[11px] font-medium text-[#464652]">
              {isUrdu ? 'وضاحت' : 'Clarity'}
            </span>
            <div className="h-1.5 w-full bg-[#edeef2] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#1a667e] rounded-full transition-all duration-700"
                style={{ width: `${evalData.clarityScore}%` }}
              />
            </div>
          </div>

          <div className="flex flex-col items-center gap-1">
            <span className="text-[11px] font-medium text-[#464652]">
              {isUrdu ? 'گفتگو کی مہارت' : 'Soft Skills'}
            </span>
            <div className="h-1.5 w-full bg-[#edeef2] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#1a667e] rounded-full transition-all duration-700"
                style={{ width: `${evalData.softSkillsScore}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Key Strengths */}
      {evalData.strengths && evalData.strengths.length > 0 && (
        <div className="bg-[#f2f3f7] p-5 rounded-2xl flex flex-col gap-3">
          <div className="flex items-center gap-2 text-[#1a667e]">
            <span className="material-symbols-outlined text-lg">verified</span>
            <h3 className="text-xs font-bold uppercase tracking-wider">
              {isUrdu ? 'اہم خوبیاں' : 'Key Strengths'}
            </h3>
          </div>
          <ul className="flex flex-col gap-2">
            {evalData.strengths.map((str, idx) => (
              <li key={idx} className="flex gap-2.5 items-start">
                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#1a667e] shrink-0" />
                <p className="text-xs text-[#191c1f] leading-relaxed">{str}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Watch Out For / Critical Feedback */}
      {evalData.watchOutFor && evalData.watchOutFor.length > 0 && (
        <div className="bg-[#ffdad6]/40 p-5 rounded-2xl flex flex-col gap-3 border border-[#ffdad6]">
          <div className="flex items-center gap-2 text-[#ba1a1a]">
            <span className="material-symbols-outlined text-lg">warning</span>
            <h3 className="text-xs font-bold uppercase tracking-wider">
              {isUrdu ? 'توجہ طلب نکات' : 'Watch Out For'}
            </h3>
          </div>
          <div className="flex flex-col gap-3">
            {evalData.watchOutFor.map((item, idx) => (
              <div key={idx} className="bg-white p-3.5 rounded-xl flex flex-col gap-1 shadow-2xs">
                <span className="text-xs font-bold text-[#ba1a1a]">{item.title}</span>
                <p className="text-xs text-[#464652] leading-relaxed">{item.feedback}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Personalized Coach Tip */}
      {evalData.coachTip && (
        <div className="relative bg-[#edeef2] rounded-3xl p-5 overflow-hidden">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-full overflow-hidden bg-[#8b93ff] ring-2 ring-white shrink-0">
              <img
                alt="Coach Alex"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCdFsUt9BlP9UAUcL3ZhFsuqoR_2ksCneTTPcepa3dWJ0sxr-OuyZsgORGIfcUH-pxJRdIzdQ-9glYx6plTyJSW_h5QRMWQnmWEk664dagodz57fs947ym07_YD1JcwN1xkasl8jX0nyK2Dn04udpz7_9XuB6VBzBYFooGH0f5LNSa3iCHAKGeexLyaCbFg5VcDusjsLCz46mkk_V43fIsyREi4zHJ6rXzQDah4FoPgODqEjXJEH8T4Or-yLt5HO5dq_MNv2cC6Fw-0"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-[#4b53bb]">{evalData.coachTitle || "Coach's Tip"}</span>
              <span className="text-[11px] text-[#464652]">{evalData.coachSubtitle || "Performance Guidance"}</span>
            </div>
          </div>
          <p className="text-xs text-[#464652] italic leading-relaxed">
            {evalData.coachTip}
          </p>
        </div>
      )}

      {/* Growth Plan */}
      {evalData.growthPlan && evalData.growthPlan.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-bold text-[#191c1f] px-1">
            {isUrdu ? 'آپ کا ترقیاتی منصوبہ' : 'Your Growth Plan'}
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {evalData.growthPlan.map((plan, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-2xl flex flex-col gap-1.5 ${
                  idx === 0 ? 'bg-[#8ed0eb]' : 'bg-[#ffd7f3]'
                }`}
              >
                <span className="material-symbols-outlined text-gray-800 text-lg">
                  {idx === 0 ? 'timer' : 'terminal'}
                </span>
                <span className="text-xs font-bold text-gray-900">{plan.title}</span>
                <p className="text-[11px] text-gray-700 leading-tight">{plan.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col gap-2.5 pt-2">
        {/* Main Flow Progression Button */}
        {!isLastQuestion ? (
          <button
            onClick={onNextQuestion}
            className="w-full bg-[#4b53bb] hover:bg-[#3239a2] text-white h-14 rounded-full flex items-center justify-center gap-2 shadow-lg shadow-[#4b53bb]/20 active:scale-[0.98] transition-all cursor-pointer font-semibold text-xs uppercase tracking-wider"
          >
            <span>
              {isUrdu
                ? `اگلا سوال (سوال ${currentIndex + 2} از ${totalQuestions})`
                : `Next Question (${currentIndex + 2} of ${totalQuestions})`}
            </span>
            <span className="material-symbols-outlined text-lg">arrow_forward</span>
          </button>
        ) : (
          <button
            onClick={onCompleteInterview}
            className="w-full bg-[#4b53bb] hover:bg-[#3239a2] text-white h-14 rounded-full flex items-center justify-center gap-2 shadow-lg shadow-[#4b53bb]/20 active:scale-[0.98] transition-all cursor-pointer font-semibold text-xs uppercase tracking-wider"
          >
            <span className="material-symbols-outlined text-lg">emoji_events</span>
            <span>
              {isUrdu
                ? 'انٹرویو مکمل کریں (نتیجہ دیکھیں)'
                : 'View Result'}
            </span>
          </button>
        )}

        {/* Secondary: Practice Again with Fresh Questions */}
        <button
          onClick={onStartNewPractice}
          className="w-full h-14 rounded-full flex items-center justify-center gap-2 bg-[#e7e8ec] text-[#464652] hover:bg-gray-300 active:scale-[0.98] transition-all cursor-pointer font-semibold text-xs uppercase tracking-wider"
        >
          <span className="material-symbols-outlined text-lg">refresh</span>
          <span>{isUrdu ? 'نئے سوالات کی دوبارہ مشق کریں' : 'Practice Again (Fresh Questions)'}</span>
        </button>

        {/* View Full Analysis So Far */}
        {!isLastQuestion && (
          <button
            onClick={() => onNavigate('analysis')}
            className="w-full py-2.5 text-[#4b53bb] font-semibold text-xs uppercase tracking-wider hover:underline transition-all cursor-pointer text-center"
          >
            {isUrdu ? 'اب تک کا تجزیہ دیکھیں' : 'View Analysis So Far'}
          </button>
        )}
      </div>
    </div>
  );
};
