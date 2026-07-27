import React from 'react';
import { FullAnalysisResult, Language, Screen } from '../types';
import { getSavedSessions } from '../utils/history';

interface AnalysisScreenProps {
  analysis: FullAnalysisResult | null;
  onRePractice: () => void;
  onNavigate: (screen: Screen) => void;
  language: Language;
}

export const AnalysisScreen: React.FC<AnalysisScreenProps> = ({
  analysis,
  onRePractice,
  onNavigate,
  language,
}) => {
  const isUrdu = language === 'UR';

  // Load from props or most recent saved session
  const savedSessions = getSavedSessions();
  const currentAnalysis: FullAnalysisResult | null =
    analysis || (savedSessions.length > 0 ? savedSessions[0].analysis : null);

  // If user has not completed an interview, render Empty State
  if (!currentAnalysis) {
    return (
      <div className="flex flex-col w-full px-6 pt-8 pb-28 gap-6 max-w-lg sm:max-w-xl mx-auto text-center items-center">
        <div className="w-20 h-20 bg-[#4b53bb]/10 rounded-full flex items-center justify-center text-[#4b53bb] mt-6">
          <span className="material-symbols-outlined text-4xl">analytics</span>
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-[#191c1f]">
            {isUrdu ? 'تجزیہ کے لیے انٹرویو مکمل کریں' : 'Complete Interview For Analysis'}
          </h1>
          <p className="text-sm text-[#464652] max-w-sm leading-relaxed">
            {isUrdu
              ? 'تکنیکی سکور، مہارت کا نقشہ اور انفرادی سوالات کی تجاویز دیکھنے کے لیے پہلے مشق انٹرویو مکمل کریں۔'
              : 'Complete a practice interview session first to receive your personalized score, skill radar map, and detailed question-by-question AI advice.'}
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

  const analysisData = currentAnalysis;

  return (
    <div className="flex flex-col w-full px-6 pt-5 pb-28 gap-6 max-w-lg sm:max-w-xl mx-auto">
      {/* Header Summary Section */}
      <section className="pt-1">
        <div className="bg-[#8b93ff] rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          <div className="relative z-10 flex flex-col gap-2 text-[#1d238f]">
            <span className="text-xs font-semibold uppercase tracking-wider opacity-80">
              {isUrdu ? 'کارکردگی کا سکور' : 'Performance Score'}
            </span>
            <div className="flex items-end gap-2">
              <span className="text-5xl font-extrabold">{analysisData.overallScore}</span>
              <span className="text-sm font-semibold mb-2">/ 100</span>
              {analysisData.scoreVsLastWeek && (
                <div className="ml-auto bg-white/20 px-3 py-1 rounded-full flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">trending_up</span>
                  <span className="text-xs font-medium">{analysisData.scoreVsLastWeek}</span>
                </div>
              )}
            </div>
            <p className="text-xs mt-1 leading-relaxed opacity-90 font-medium">
              {analysisData.overallFeedback}
            </p>
          </div>
        </div>
      </section>

      {/* Skill Map Radar Visualization */}
      <section>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-3">
          <h3 className="text-base font-bold text-[#191c1f]">
            {isUrdu ? 'مہارت کا نقشہ (Skill Map)' : 'Skill Map'}
          </h3>
          <div className="relative aspect-square w-full max-w-[260px] mx-auto flex items-center justify-center py-2">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 200 200">
              {/* Web circles */}
              <circle cx="100" cy="100" r="90" fill="none" stroke="#c6c5d5" strokeWidth="1" strokeOpacity="0.4" />
              <circle cx="100" cy="100" r="60" fill="none" stroke="#c6c5d5" strokeWidth="1" strokeOpacity="0.4" />
              <circle cx="100" cy="100" r="30" fill="none" stroke="#c6c5d5" strokeWidth="1" strokeOpacity="0.4" />

              {/* Axes */}
              <line x1="100" y1="10" x2="100" y2="190" stroke="#c6c5d5" strokeWidth="1" strokeOpacity="0.4" />
              <line x1="10" y1="100" x2="190" y2="100" stroke="#c6c5d5" strokeWidth="1" strokeOpacity="0.4" />

              {/* Dynamic Radar Shape calculated from actual radarSkills */}
              {(() => {
                const tech = (analysisData.radarSkills?.technical || 70) / 100;
                const tone = (analysisData.radarSkills?.tone || 70) / 100;
                const conf = (analysisData.radarSkills?.confidence || 70) / 100;
                const pace = (analysisData.radarSkills?.pacing || 70) / 100;

                const topY = 100 - tech * 80;
                const rightX = 100 + tone * 80;
                const bottomY = 100 + conf * 80;
                const leftX = 100 - pace * 80;

                return (
                  <path
                    d={`M100 ${topY} L${rightX} 100 L100 ${bottomY} L${leftX} 100 Z`}
                    fill="rgba(75, 83, 187, 0.25)"
                    stroke="#4b53bb"
                    strokeWidth="3"
                    strokeLinejoin="round"
                  />
                );
              })()}

              {/* Labels */}
              <text x="100" y="5" textAnchor="middle" className="text-[11px] font-semibold fill-[#464652]">
                {isUrdu ? 'ٹیکنیکل' : 'Technical'} ({analysisData.radarSkills?.technical}%)
              </text>
              <text x="195" y="104" textAnchor="start" className="text-[11px] font-semibold fill-[#464652]">
                {isUrdu ? 'لہجہ' : 'Tone'} ({analysisData.radarSkills?.tone}%)
              </text>
              <text x="100" y="200" textAnchor="middle" className="text-[11px] font-semibold fill-[#464652]">
                {isUrdu ? 'اعتماد' : 'Confidence'} ({analysisData.radarSkills?.confidence}%)
              </text>
              <text x="5" y="104" textAnchor="end" className="text-[11px] font-semibold fill-[#464652]">
                {isUrdu ? 'رفتار' : 'Pacing'} ({analysisData.radarSkills?.pacing}%)
              </text>
            </svg>
          </div>
        </div>
      </section>

      {/* Growth Points Section */}
      <section className="flex flex-col gap-3">
        <h3 className="text-base font-bold text-[#191c1f]">
          {isUrdu ? 'نمو کے اہم نقاط' : 'Growth Points'}
        </h3>

        {analysisData.growthPoints?.map((gp, idx) => {
          const colors = [
            { bg: 'bg-[#feb0ed]', text: 'text-[#7c3e72]', bar: 'bg-[#88487d]', icon: 'bolt' },
            { bg: 'bg-[#8b93ff]', text: 'text-[#1d238f]', bar: 'bg-[#4b53bb]', icon: 'code' },
            { bg: 'bg-[#64a6c0]', text: 'text-[#003a4a]', bar: 'bg-[#1a667e]', icon: 'record_voice_over' },
          ];
          const color = colors[idx % colors.length];

          return (
            <div key={idx} className="bg-[#f2f3f7] p-4 rounded-2xl flex gap-3.5 items-start">
              <div className={`w-10 h-10 rounded-full ${color.bg} flex items-center justify-center ${color.text} shrink-0`}>
                <span className="material-symbols-outlined text-xl">{color.icon}</span>
              </div>
              <div className="flex flex-col gap-1 w-full">
                <span className="text-xs font-bold text-[#191c1f]">
                  {gp.category} ({gp.percentage}%)
                </span>
                <p className="text-xs text-[#464652] leading-relaxed">
                  {gp.feedback}
                </p>
                <div className="w-full bg-[#c6c5d5]/30 h-1.5 rounded-full mt-1.5 overflow-hidden">
                  <div
                    className={`${color.bar} h-full rounded-full transition-all duration-500`}
                    style={{ width: `${gp.percentage}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* Tactical Review */}
      {analysisData.tacticalReview && analysisData.tacticalReview.length > 0 && (
        <section className="flex flex-col gap-3">
          <h3 className="text-base font-bold text-[#191c1f]">
            {isUrdu ? 'سوال وار جائزہ' : 'Tactical Review'}
          </h3>

          {analysisData.tacticalReview.map((item, idx) => (
            <div key={idx} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
              <div className="p-3.5 bg-[#edeef2]">
                <span className="text-[11px] font-bold text-[#4b53bb] uppercase tracking-wider">
                  {isUrdu ? `سوال ${item.questionNumber}` : `Question ${item.questionNumber}`}
                </span>
                <p className="text-xs font-semibold text-[#191c1f] mt-0.5">{item.question}</p>
              </div>

              <div className="p-4 flex flex-col gap-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] text-[#464652] italic font-medium">
                    {isUrdu ? 'آپ کا جواب:' : 'Your Answer:'}
                  </span>
                  <p className="text-xs text-[#191c1f] bg-[#f2f3f7] p-2.5 rounded-xl leading-relaxed">
                    "{item.userAnswer || (isUrdu ? '(جواب فراہم نہیں کیا گیا)' : '(No response provided)')}"
                  </p>
                </div>

                <div className="bg-[#4b53bb]/5 p-3.5 rounded-xl border-l-4 border-[#4b53bb] flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-[#4b53bb]">
                    <span className="material-symbols-outlined text-base">smart_toy</span>
                    <span className="text-xs font-bold">
                      {isUrdu ? 'اے آئی تجویز' : 'AI Suggestion'}
                    </span>
                  </div>
                  <p className="text-xs text-[#464652] leading-relaxed">{item.aiSuggestion}</p>
                </div>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Bottom Action Area */}
      <div className="flex flex-col gap-2.5 pt-2">
        <button
          onClick={onRePractice}
          className="w-full bg-[#4b53bb] hover:bg-[#3239a2] text-white h-14 rounded-full font-semibold text-xs uppercase tracking-wider shadow-lg shadow-[#4b53bb]/20 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-lg">refresh</span>
          <span>{isUrdu ? 'ان سوالات کی دوبارہ مشق کریں' : 'Re-practice These Questions'}</span>
        </button>

        <button
          onClick={() => onNavigate('result')}
          className="w-full h-12 rounded-full text-[#4b53bb] font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 hover:bg-[#4b53bb]/10 transition-all cursor-pointer"
        >
          <span>{isUrdu ? 'فائنل رزلٹ دیکھیں' : 'View Final Milestone Result'}</span>
          <span className="material-symbols-outlined text-lg">emoji_events</span>
        </button>
      </div>
    </div>
  );
};
