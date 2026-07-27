import React, { useState, useEffect } from 'react';
import { Language, Screen } from '../types';
import { getSavedSessions, get7DayAnalytics, SavedSession } from '../utils/history';

interface ResultScreenProps {
  onNavigate: (screen: Screen) => void;
  language: Language;
  latestSession?: SavedSession | null;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  onNavigate,
  language,
  latestSession,
}) => {
  const isUrdu = language === 'UR';
  const [copied, setCopied] = useState(false);

  const savedSessions = getSavedSessions();
  const currentSession = latestSession || (savedSessions.length > 0 ? savedSessions[0] : null);
  const analytics7Days = get7DayAnalytics(savedSessions);

  // Confetti particles effect on mount if session exists
  useEffect(() => {
    if (!currentSession) return;
    const container = document.getElementById('confetti-container');
    if (!container) return;

    const colors = ['#4b53bb', '#88487d', '#8b93ff', '#feb0ed', '#1a667e'];
    const particlesCount = 28;

    for (let i = 0; i < particlesCount; i++) {
      const particle = document.createElement('div');
      const size = Math.random() * 8 + 4;
      const color = colors[Math.floor(Math.random() * colors.length)];

      particle.style.position = 'absolute';
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.backgroundColor = color;
      particle.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = '-10px';
      particle.style.opacity = `${Math.random()}`;

      container.appendChild(particle);

      const duration = Math.random() * 2000 + 2500;
      particle.animate(
        [
          { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
          { transform: `translateY(360px) rotate(${Math.random() * 720}deg)`, opacity: 0 },
        ],
        {
          duration,
          easing: 'cubic-bezier(0.1, 0.8, 0.3, 1)',
        }
      );
    }
  }, [currentSession]);

  const handleShare = () => {
    const score = currentSession ? currentSession.overallScore : 0;
    const shareText = isUrdu
      ? `میں نے InterviewAI Coach پر ${score}% اسکور حاصل کیا! اپنے اگلے انٹرویو کے لیے تیار ہوں۔`
      : `I achieved an overall score of ${score}% on InterviewAI Coach! Ready for my next interview!`;

    if (navigator.share) {
      navigator
        .share({
          title: 'InterviewAI Coach Results',
          text: shareText,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // If user has not completed an interview session, display Empty State
  if (!currentSession) {
    return (
      <div className="flex flex-col w-full px-6 pt-8 pb-28 gap-6 max-w-lg sm:max-w-xl mx-auto text-center items-center">
        <div className="w-20 h-20 bg-[#4b53bb]/10 rounded-full flex items-center justify-center text-[#4b53bb] mt-6">
          <span className="material-symbols-outlined text-4xl">quiz</span>
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-[#191c1f]">
            {isUrdu ? 'انٹرویو سیشن مکمل کریں' : 'Complete Your Interview First'}
          </h1>
          <p className="text-sm text-[#464652] max-w-sm leading-relaxed">
            {isUrdu
              ? 'اپنا ذاتی اسکور، ترقی کی رپورٹ اور اے آئی کوچ کے تاثرات حاصل کرنے کے لیے پہلے مشق انٹرویو کا سیشن مکمل کریں۔'
              : 'Complete a practice interview session first to receive your personalized performance score, progress metrics, and AI coaching analysis.'}
          </p>
        </div>

        <button
          onClick={() => onNavigate('selection')}
          className="w-full max-w-sm bg-[#4b53bb] hover:bg-[#3239a2] text-white font-semibold text-sm py-4 rounded-2xl shadow-lg shadow-[#4b53bb]/20 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer mt-2"
        >
          <span className="material-symbols-outlined text-lg">play_arrow</span>
          <span>{isUrdu ? 'مشق انٹرویو شروع کریں' : 'Start Practice Interview'}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full px-6 pt-5 pb-28 gap-6 max-w-lg sm:max-w-xl mx-auto">
      {/* Hero Celebration Section */}
      <div className="relative w-full rounded-3xl overflow-hidden shadow-xl bg-gradient-to-b from-[#4b53bb] via-[#3239a2] to-[#121656] border border-[#4b53bb]/20 flex flex-col items-center">
        <div className="absolute inset-0 bg-gradient-to-t from-[#000140]/90 via-transparent to-transparent z-10" />

        {/* Confetti Particle Layer */}
        <div id="confetti-container" className="absolute inset-0 z-20 pointer-events-none" />

        <div className="w-full h-[240px] sm:h-[270px] flex items-center justify-center p-2 relative">
          <img
            alt="Candidate Achievement"
            className="h-full w-full object-cover object-[center_15%] sm:object-[center_10%] rounded-2xl opacity-90"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBHVjpX3x2-2av8-53O8Yj1nPL6ThS5KKcKsNsmCcoBj0Wl0k7esIqhJ0vhkj7c8Mp0DcElinBJBIUrWePTnOdFzqn_srdQPLPho0-OA8b46IEEMbfN6N0GSBnBsrZg4W1K6WdU6r4zXO1faWoY4Vcg5I-6oXCWJ6oy6xXj64YLZ04Gsekbzap0X-aDBFlMluhTpgOv-lKRslwFHQOwwzne7IpG4BUSKn7PCThiX35FURdYF7gHiLEmlPuOzGpNu4-vY77WRdozPdOR"
          />
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 z-30 text-white flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-[#88487d] p-1 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">stars</span>
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-white/90">
                {currentSession.field} • {currentSession.level}
              </span>
            </div>
            <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white">
              {currentSession.overallScore}% Score
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold leading-snug mt-1">
            {isUrdu
              ? 'انٹرویو کامیابی کے ساتھ مکمل ہو گیا!'
              : 'Interview Session Completed Successfully!'}
          </h1>
        </div>
      </div>

      {/* Growth Report Bento Card (Real analytics from user sessions) */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-base font-bold text-[#191c1f]">
              {isUrdu ? 'ترقی کی رپورٹ' : 'Growth Report'}
            </span>
            <span className="text-xs text-[#464652]">
              {analytics7Days
                ? isUrdu
                  ? `${analytics7Days.totalSessions} انٹرویو سیشنز پر مبنی`
                  : `Based on ${analytics7Days.totalSessions} completed session(s)`
                : isUrdu
                ? 'موجودہ سیشن کا ڈیٹا'
                : 'Current session performance'}
            </span>
          </div>
          <div className="h-11 w-11 rounded-full bg-[#1a667e]/15 flex items-center justify-center text-[#1a667e]">
            <span className="material-symbols-outlined">trending_up</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Real Confidence score */}
          <div className="bg-[#4b53bb]/5 rounded-2xl p-4 flex flex-col gap-1 border border-[#4b53bb]/10">
            <span className="text-[11px] font-bold text-[#464652] uppercase">
              {isUrdu ? 'اعتماد' : 'Confidence'}
            </span>
            <div className="flex items-end gap-1">
              <span className="text-xl font-extrabold text-[#4b53bb]">
                {analytics7Days
                  ? `${analytics7Days.avgConfidence}%`
                  : `${currentSession.analysis.radarSkills?.confidence || currentSession.overallScore}%`}
              </span>
            </div>
            <div className="w-full bg-[#c6c5d5]/30 h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div
                className="bg-[#4b53bb] h-full rounded-full"
                style={{
                  width: `${
                    analytics7Days
                      ? analytics7Days.avgConfidence
                      : currentSession.analysis.radarSkills?.confidence || currentSession.overallScore
                  }%`,
                }}
              />
            </div>
          </div>

          {/* Real Tone / Clarity score */}
          <div className="bg-[#88487d]/5 rounded-2xl p-4 flex flex-col gap-1 border border-[#88487d]/10">
            <span className="text-[11px] font-bold text-[#464652] uppercase">
              {isUrdu ? 'وضاحت' : 'Clarity'}
            </span>
            <div className="flex items-end gap-1">
              <span className="text-xl font-extrabold text-[#88487d]">
                {analytics7Days
                  ? `${analytics7Days.avgClarity}%`
                  : `${currentSession.analysis.radarSkills?.tone || currentSession.overallScore}%`}
              </span>
            </div>
            <div className="w-full bg-[#c6c5d5]/30 h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div
                className="bg-[#88487d] h-full rounded-full"
                style={{
                  width: `${
                    analytics7Days
                      ? analytics7Days.avgClarity
                      : currentSession.analysis.radarSkills?.tone || currentSession.overallScore
                  }%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Real AI Coach Summary */}
      <div className="bg-[#f2f3f7] rounded-3xl p-5 flex items-start gap-3.5 shadow-2xs border border-gray-200/50">
        <div className="bg-white p-3 rounded-full shadow-xs shrink-0 text-[#4b53bb]">
          <span className="material-symbols-outlined">auto_awesome</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs font-bold text-[#191c1f]">
            {isUrdu ? 'کوچ الیکس کا تبصرہ' : "Coach Alex's Summary"}
          </span>
          <p className="text-xs text-[#464652] leading-relaxed">
            {currentSession.analysis.overallFeedback}
          </p>
        </div>
      </div>

      {/* Main Strengths & Growth Areas Card */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex flex-col gap-4">
        {/* Strengths */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-[#2e7d32]">
            <span className="material-symbols-outlined text-lg">check_circle</span>
            <span className="text-xs font-bold uppercase tracking-wider">
              {isUrdu ? 'اہم صلاحیتیں (Main Strengths)' : 'Main Strengths'}
            </span>
          </div>
          <div className="bg-[#e8f5e9] p-3 rounded-2xl flex flex-col gap-1">
            <span className="text-xs font-semibold text-[#1b5e20]">
              {isUrdu ? 'مضبوط ساخت اور منطق' : 'Logical Structure & Domain Knowledge'}
            </span>
            <p className="text-xs text-[#2e7d32] leading-relaxed">
              {currentSession.analysis.growthPoints && currentSession.analysis.growthPoints[0]
                ? currentSession.analysis.growthPoints[0].feedback
                : isUrdu
                ? 'سوالات کا جواب دیتے وقت ساخت اور بنیادی تصورات واضح تھے۔'
                : 'Clear response structure with good alignment to field requirements.'}
            </p>
          </div>
        </div>

        {/* Growth Areas / Weaknesses */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-[#c62828]">
            <span className="material-symbols-outlined text-lg">track_changes</span>
            <span className="text-xs font-bold uppercase tracking-wider">
              {isUrdu ? 'اصلاح کی ضرورت (Growth Areas)' : 'Growth & Weak Areas'}
            </span>
          </div>
          <div className="bg-[#ffebee] p-3 rounded-2xl flex flex-col gap-1">
            <span className="text-xs font-semibold text-[#b71c1c]">
              {isUrdu ? 'مثالیں اور حاشیائی حالات' : 'Quantified Metrics & Edge Cases'}
            </span>
            <p className="text-xs text-[#c62828] leading-relaxed">
              {currentSession.analysis.growthPoints && currentSession.analysis.growthPoints[1]
                ? currentSession.analysis.growthPoints[1].feedback
                : isUrdu
                ? 'جوابات میں مزید ٹھوس مثالیں اور اعداد و شمار شامل کریں۔'
                : 'Incorporate concrete project metrics and trade-off comparisons.'}
            </p>
          </div>
        </div>
      </div>

      {/* Copied Toast Banner */}
      {copied && (
        <div className="bg-[#4b53bb] text-white text-xs font-medium py-2 px-4 rounded-xl text-center shadow-md animate-fade-in">
          {isUrdu ? 'نتائج کلپ بورڈ پر کاپی ہو گئے!' : 'Results copied to clipboard!'}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col gap-2.5 pt-1">
        <button
          onClick={() => onNavigate('analysis')}
          className="w-full bg-[#4b53bb] hover:bg-[#3239a2] text-white font-semibold text-xs uppercase tracking-wider h-14 rounded-full shadow-lg shadow-[#4b53bb]/20 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-lg">insights</span>
          <span>{isUrdu ? 'تفصیلی تجزئیہ دیکھیں' : 'View Deep Analysis'}</span>
        </button>

        <button
          onClick={() => onNavigate('selection')}
          className="w-full bg-white border border-[#4b53bb] hover:bg-[#4b53bb]/5 text-[#4b53bb] font-semibold text-xs uppercase tracking-wider h-14 rounded-full flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer shadow-xs"
        >
          <span className="material-symbols-outlined text-lg">replay</span>
          <span>{isUrdu ? 'دوبارہ مشق کریں' : 'Practice Again'}</span>
        </button>

        <button
          onClick={handleShare}
          className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-[#191c1f] font-semibold text-xs uppercase tracking-wider h-12 rounded-full flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer shadow-xs"
        >
          <span className="material-symbols-outlined text-lg">share</span>
          <span>{isUrdu ? 'نتائج شیئر کریں' : 'Share Results'}</span>
        </button>
      </div>
    </div>
  );
};
