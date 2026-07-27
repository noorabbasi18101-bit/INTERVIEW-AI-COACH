import React from 'react';
import { Screen } from '../types';

interface BottomNavProps {
  currentScreen: Screen;
  onScreenChange: (screen: Screen) => void;
}

const navItems: Array<{ id: Screen; label: string; icon: string }> = [
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'selection', label: 'Selection', icon: 'list_alt' },
  { id: 'practice', label: 'Practice', icon: 'psychology' },
  { id: 'feedback', label: 'Feedback', icon: 'forum' },
  { id: 'analysis', label: 'Analysis', icon: 'monitoring' },
  { id: 'result', label: 'Result', icon: 'emoji_events' },
];

export const BottomNav: React.FC<BottomNavProps> = ({ currentScreen, onScreenChange }) => {
  return (
    <nav className="fixed bottom-0 w-full z-50 bg-[#f8f9fd]/80 backdrop-blur-xl pb-safe shadow-[0_-1px_12px_rgba(0,0,0,0.06)]">
      <div className="h-20 flex items-center justify-around px-4 max-w-lg sm:max-w-xl mx-auto">
        {navItems.map((item) => {
          const isActive = currentScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onScreenChange(item.id)}
              className={`flex flex-col items-center gap-1 transition-colors min-w-[52px] py-1 cursor-pointer ${
                isActive ? 'text-[#4b53bb] font-bold' : 'text-[#464652] hover:text-[#4b53bb]/70'
              }`}
            >
              <span className="material-symbols-outlined text-[24px]">
                {item.icon}
              </span>
              <span className="text-[10px] font-medium leading-none">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
