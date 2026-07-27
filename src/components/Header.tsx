import React from 'react';
import { Screen, Language } from '../types';

interface HeaderProps {
  currentScreen: Screen;
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

const screenTitles: Record<Screen, string> = {
  home: 'Home',
  selection: 'Selection',
  practice: 'Practice',
  feedback: 'Feedback',
  analysis: 'Analysis',
  result: 'Result',
};

export const Header: React.FC<HeaderProps> = ({ currentScreen, language, onLanguageChange }) => {
  return (
    <header className="fixed top-0 w-full z-50 bg-[#f8f9fd]/80 backdrop-blur-xl pt-safe shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="h-16 px-6 flex items-center justify-between max-w-lg sm:max-w-xl mx-auto">
        <div className="flex items-center gap-3">
          <img
            alt="InterviewAI Coach Logo"
            className="h-8 w-auto object-contain"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBHNuVvY3JG1Dc5TfSm0uJb7xRKWoB1yjjHF4Of65Ifnv4S-rktsxPjL6kejSr52lqH-JV8F1edXL4iNuUO4KBs9pOjL_Qpl1kC1g-_mxTSw_2gAUsMqxr1_uSifOpWXtof1buqRhlIW3oiYiShkXsTUy5UdjACxx3aIHG8R-8H9D7n6eVbvI_TGolRnGW6aO2fVkeEEft_dVj8oz3T6falGib-EY9xMaMK9T-8p2YKXZ9_z6vGBO0qc4coQVbfaaXhwRD8TCLXwQQz"
          />
          <span className="font-semibold text-2xl text-[#4b53bb]">
            {screenTitles[currentScreen]}
          </span>
        </div>
        <button
          onClick={() => onLanguageChange(language === 'EN' ? 'UR' : 'EN')}
          className="flex items-center bg-[#e7e8ec] rounded-full p-1 border border-[#c6c5d5] min-w-[80px] cursor-pointer hover:opacity-90 transition-opacity"
          title="Switch Language"
        >
          <div
            className={`flex-1 py-1 px-2 text-center rounded-full text-xs font-medium transition-all ${
              language === 'EN'
                ? 'bg-[#4b53bb] text-white shadow-sm'
                : 'text-[#464652]'
            }`}
          >
            EN
          </div>
          <div
            className={`flex-1 py-1 px-2 text-center rounded-full text-xs font-medium transition-all ${
              language === 'UR'
                ? 'bg-[#4b53bb] text-white shadow-sm'
                : 'text-[#464652]'
            }`}
          >
            UR
          </div>
        </button>
      </div>
    </header>
  );
};
