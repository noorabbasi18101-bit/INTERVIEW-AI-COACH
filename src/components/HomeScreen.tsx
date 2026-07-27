import React from 'react';
import { Screen, Language } from '../types';
import { getSavedSessions } from '../utils/history';

interface HomeScreenProps {
  onNavigate: (screen: Screen) => void;
  language: Language;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate, language }) => {
  const isUrdu = language === 'UR';
  const savedSessions = getSavedSessions();
  const completedCount = savedSessions.length;

  return (
    <div className="flex flex-col w-full px-6 pt-5 pb-28 gap-6 max-w-lg sm:max-w-xl mx-auto">
      {/* Hero Section */}
      <section className="relative pt-2 pb-8 overflow-hidden">
        {/* Background Decorative Blob */}
        <div className="absolute top-0 right-0 -z-10 opacity-20 pointer-events-none">
          <svg height="260" viewBox="0 0 200 200" width="260" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M44.7,-76.4C58.1,-69.2,69.5,-57.4,77.3,-43.8C85.1,-30.2,89.2,-15.1,87.3,-0.8C85.4,13.5,77.4,26.9,68.4,39.3C59.4,51.7,49.4,63.1,36.7,71.1C24,79.1,8.7,83.7,-5.7,80.4C-20.1,77.1,-33.6,65.9,-46,55.9C-58.4,45.9,-69.7,37.1,-76.2,25.3C-82.7,13.5,-84.4,-1.3,-80.6,-14.8C-76.8,-28.3,-67.5,-40.5,-56.3,-48.9C-45.1,-57.3,-32,-61.9,-19.7,-69.8C-7.4,-77.7,4.1,-88.9,18.9,-89.2C33.7,-89.5,31.3,-83.6,44.7,-76.4Z"
              fill="#4b53bb"
              transform="translate(100 100)"
            />
          </svg>
        </div>

        <div className="flex flex-col gap-6">
          {/* Welcome Text */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#4b53bb]/10 rounded-full">
              <span className="material-symbols-outlined text-[16px] text-[#4b53bb]">
                auto_awesome
              </span>
              <span className="text-xs font-semibold text-[#4b53bb] uppercase tracking-wider">
                {isUrdu ? 'اے آئی سے بااختیار کوچنگ' : 'AI Powered Coaching'}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-[#191c1f] leading-tight">
              {isUrdu ? (
                <>
                  ہوشیاری سے تیاری کریں۔
                  <br />
                  بہتر مشق کریں۔
                </>
              ) : (
                <>
                  Prepare smarter.
                  <br />
                  Practice better.
                </>
              )}
            </h1>
            <p className="text-sm text-[#464652] max-w-[300px] leading-relaxed">
              {isUrdu
                ? 'مصنوعی ذہانت کے ساتھ انٹرویو کی بہترین تیاری کریں۔ فوری تاثرات اور حقیقی وقت کی کوچنگ۔'
                : 'Get interview ready with Gemini AI. Real-time feedback and dynamic questions tailored for you.'}
            </p>
          </div>

          {/* Hero Image & CTA */}
          <div className="relative group">
            <div className="w-full aspect-[4/5] rounded-[32px] overflow-hidden shadow-xl shadow-[#4b53bb]/10 bg-[#edeef2] relative">
              <img
                alt="Interview Coach"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD-cD6sSHokH_S_Khh8FRJvRhnzGJeQ9TuMzVI8cWRNveQT7E6RIWGWZ2cTJeOxORQZ6cN2gWfr_SN4l4nkKxvuyAuY34nju9sxMAUIaDjEYO_mvp6YBzcfITF2uuiQ14qVrpUSWrHL5n6ZasXHQXHWek3TRuYEufNqwqCjSqSUuMEfL-Aeq_2MQXtg0Qju2XUVAONLbpPyx6fPZOKedTe2kUTp3NoT8npR_ELT_q_8zJ8DlNGLFAp6fqrtUB9D00c0eirNGPOdx8LG"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <button
                  onClick={() => onNavigate('selection')}
                  className="w-full py-4 bg-[#4b53bb] text-white rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#4b53bb]/30 active:scale-95 transition-all cursor-pointer hover:bg-[#3239a2]"
                >
                  <span>{isUrdu ? 'مشق شروع کریں' : 'Start Practice'}</span>
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </button>
              </div>
            </div>

            {/* Floating Stat based on real data */}
            <div className="absolute -top-3 -right-2 bg-white/90 backdrop-blur-md p-3 px-4 rounded-2xl shadow-lg flex items-center gap-3 border border-white/50">
              <div className="w-9 h-9 rounded-full bg-[#feb0ed] flex items-center justify-center text-[#7c3e72]">
                <span className="material-symbols-outlined text-lg">verified</span>
              </div>
              <div>
                <div className="text-[11px] font-medium text-[#464652]">
                  {isUrdu ? 'مکمل انٹرویوز' : 'Completed Sessions'}
                </div>
                <div className="text-xs font-bold text-[#191c1f]">{completedCount}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-2 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#191c1f]">
            {isUrdu ? 'اہم خصوصیات' : 'Core Features'}
          </h2>
          <button
            onClick={() => onNavigate('selection')}
            className="text-[#4b53bb] font-semibold text-xs hover:underline cursor-pointer"
          >
            {isUrdu ? 'سب دیکھیں' : 'View All'}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {/* Feature Card 1 */}
          <div
            onClick={() => onNavigate('selection')}
            className="bg-white p-5 rounded-[24px] shadow-sm flex items-start gap-4 transition-all hover:shadow-md active:scale-[0.98] cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#8b93ff] flex items-center justify-center text-[#1d238f] shrink-0">
              <span className="material-symbols-outlined">quiz</span>
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="font-semibold text-sm text-[#191c1f]">
                {isUrdu ? 'اے آئی انٹرویو سوالات' : 'AI Interview Questions'}
              </h3>
              <p className="text-xs text-[#464652] leading-relaxed">
                {isUrdu
                  ? 'آپ کے منتخب کردہ فیلڈ اور لیول کے مطابق سوالات جنیریٹ کریں۔'
                  : 'Tailored questions generated dynamically for your chosen field and experience level.'}
              </p>
            </div>
          </div>

          {/* Feature Card 2 */}
          <div
            onClick={() => onNavigate('selection')}
            className="bg-white p-5 rounded-[24px] shadow-sm flex items-start gap-4 transition-all hover:shadow-md active:scale-[0.98] cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#feb0ed] flex items-center justify-center text-[#7c3e72] shrink-0">
              <span className="material-symbols-outlined">bolt</span>
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="font-semibold text-sm text-[#191c1f]">
                {isUrdu ? 'حقیقی تاثرات' : 'Accurate Real Feedback'}
              </h3>
              <p className="text-xs text-[#464652] leading-relaxed">
                {isUrdu
                  ? 'اپنے حقیقی جوابات کے مواد اور وضاحت کا تجزیہ حاصل کریں۔'
                  : 'Receive individualized analysis based exclusively on your actual typed answers.'}
              </p>
            </div>
          </div>

          {/* Feature Card 3 */}
          <div
            onClick={() => onNavigate('analysis')}
            className="bg-white p-5 rounded-[24px] shadow-sm flex items-start gap-4 transition-all hover:shadow-md active:scale-[0.98] cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#64a6c0] flex items-center justify-center text-[#003a4a] shrink-0">
              <span className="material-symbols-outlined">auto_graph</span>
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="font-semibold text-sm text-[#191c1f]">
                {isUrdu ? 'اپنی پیشرفت ٹریک کریں' : 'Track Real Progress'}
              </h3>
              <p className="text-xs text-[#464652] leading-relaxed">
                {isUrdu
                  ? 'اپنی حقیقی کارکردگی اور سکور کا تفصیلی رپورٹ دیکھیں۔'
                  : 'Review your complete session reports and skill radar maps after every completed interview.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Progress / History Card */}
      <section className="pt-2">
        <div className="bg-[#4b53bb] p-5 rounded-[32px] text-white relative overflow-hidden shadow-lg shadow-[#4b53bb]/20">
          <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-xs opacity-80">{isUrdu ? 'مشق کا ریکارڈ' : 'Practice Progress'}</span>
              <span className="text-lg font-bold">
                {completedCount > 0
                  ? isUrdu
                    ? `${completedCount} سیشنز مکمل`
                    : `${completedCount} Session(s) Completed`
                  : isUrdu
                  ? 'پہلا سیشن شروع کریں'
                  : 'Ready for First Session'}
              </span>
            </div>
            <button
              onClick={() => onNavigate(completedCount > 0 ? 'analysis' : 'selection')}
              className="px-3.5 py-2 bg-white text-[#4b53bb] rounded-full text-xs font-bold shadow-md hover:bg-gray-100 active:scale-95 transition-all cursor-pointer"
            >
              {completedCount > 0
                ? isUrdu
                  ? 'رپورٹ دیکھیں'
                  : 'View Report'
                : isUrdu
                ? 'شروع کریں'
                : 'Start Now'}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
