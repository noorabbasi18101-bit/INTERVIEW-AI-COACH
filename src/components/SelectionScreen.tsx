import React from 'react';
import { InterviewType, ExperienceLevel, JobField, Language } from '../types';

interface SelectionScreenProps {
  selectedType: InterviewType;
  selectedLevel: ExperienceLevel;
  selectedField: JobField;
  onSelectType: (type: InterviewType) => void;
  onSelectLevel: (level: ExperienceLevel) => void;
  onSelectField: (field: JobField) => void;
  onContinue: () => void;
  isLoading: boolean;
  language: Language;
}

export const SelectionScreen: React.FC<SelectionScreenProps> = ({
  selectedType,
  selectedLevel,
  selectedField,
  onSelectType,
  onSelectLevel,
  onSelectField,
  onContinue,
  isLoading,
  language,
}) => {
  const isUrdu = language === 'UR';

  const fields: Array<{
    id: JobField;
    title: string;
    icon: string;
  }> = [
    {
      id: 'Software Engineering',
      title: isUrdu ? 'سافٹ ویئر انجینئرنگ' : 'Software Engineering',
      icon: 'code',
    },
    {
      id: 'Data Science & AI',
      title: isUrdu ? 'ڈیٹا سائنس اور اے آئی' : 'Data Science & AI',
      icon: 'analytics',
    },
    {
      id: 'Product Management',
      title: isUrdu ? 'پروڈکٹ مینجمنٹ' : 'Product Management',
      icon: 'inventory_2',
    },
    {
      id: 'Marketing & Sales',
      title: isUrdu ? 'مارکیٹنگ اور سیلز' : 'Marketing & Sales',
      icon: 'campaign',
    },
    {
      id: 'Finance & Business',
      title: isUrdu ? 'فنانس اور بزنس' : 'Finance & Business',
      icon: 'payments',
    },
    {
      id: 'Design & UX',
      title: isUrdu ? 'ڈیزائن اور یو ایکس' : 'Design & UX',
      icon: 'palette',
    },
    {
      id: 'Healthcare & Medical',
      title: isUrdu ? 'ہیلتھ کیئر اور میڈیکل' : 'Healthcare & Medical',
      icon: 'medical_services',
    },
    {
      id: 'General Business',
      title: isUrdu ? 'جنرل بزنس' : 'General Business',
      icon: 'business_center',
    },
    {
      id: 'Other',
      title: isUrdu ? 'دیگر (عام انٹرویو)' : 'Other (General)',
      icon: 'interests',
    },
  ];

  const types: Array<{
    id: InterviewType;
    title: string;
    subtitle: string;
    icon: string;
    colorClass: string;
    activeBg: string;
    activeText: string;
  }> = [
    {
      id: 'HR Interview',
      title: isUrdu ? 'ایچ آر انٹرویو' : 'HR Interview',
      subtitle: isUrdu ? 'رویے اور ثقافت' : 'Behavioral & Culture',
      icon: 'groups',
      colorClass: 'text-[#4b53bb] bg-[#4b53bb]/10',
      activeBg: 'group-[.selected]:bg-[#4b53bb]',
      activeText: 'group-[.selected]:text-white',
    },
    {
      id: 'Technical',
      title: isUrdu ? 'ٹیکنیکل' : 'Technical',
      subtitle: isUrdu ? 'مہارتیں اور منطق' : 'Skills & Logic',
      icon: 'terminal',
      colorClass: 'text-[#1a667e] bg-[#1a667e]/10',
      activeBg: 'group-[.selected]:bg-[#1a667e]',
      activeText: 'group-[.selected]:text-white',
    },
    {
      id: 'Internship',
      title: isUrdu ? 'انٹرنشپ' : 'Internship',
      subtitle: isUrdu ? 'ابتدائی کیریئر' : 'Early Career',
      icon: 'school',
      colorClass: 'text-[#88487d] bg-[#88487d]/10',
      activeBg: 'group-[.selected]:bg-[#88487d]',
      activeText: 'group-[.selected]:text-white',
    },
    {
      id: 'Job Interview',
      title: isUrdu ? 'ملازمت انٹرویو' : 'Job Interview',
      subtitle: isUrdu ? 'مکمل وقت کے کردار' : 'Full-time Roles',
      icon: 'work',
      colorClass: 'text-[#4b53bb] bg-[#4b53bb]/10',
      activeBg: 'group-[.selected]:bg-[#4b53bb]',
      activeText: 'group-[.selected]:text-white',
    },
  ];

  const levels: Array<{
    id: ExperienceLevel;
    title: string;
    subtitle: string;
    icon: string;
  }> = [
    {
      id: 'Beginner',
      title: isUrdu ? 'مبتدی' : 'Beginner',
      subtitle: isUrdu ? '0 - 1 سال کا تجربہ' : '0 - 1 years experience',
      icon: 'signal_cellular_1_bar',
    },
    {
      id: 'Intermediate',
      title: isUrdu ? 'درمیانہ' : 'Intermediate',
      subtitle: isUrdu ? '2 - 5 سال کا تجربہ' : '2 - 5 years experience',
      icon: 'signal_cellular_3_bar',
    },
    {
      id: 'Advanced',
      title: isUrdu ? 'ماہر' : 'Advanced',
      subtitle: isUrdu ? '5+ سال کا تجربہ' : '5+ years experience',
      icon: 'signal_cellular_4_bar',
    },
  ];

  return (
    <div className="flex flex-col w-full px-6 pt-5 pb-28 gap-7 max-w-lg sm:max-w-xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col gap-1 pt-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#191c1f]">
          {isUrdu ? 'اپنا راستہ منتخب کریں' : 'Choose Your Path'}
        </h1>
        <p className="text-sm text-[#464652]">
          {isUrdu
            ? 'اپنے اگلے انٹرویو کے مطابق فیلڈ، قسم اور تجربے کی سطح منتخب کریں۔'
            : 'Tailor your practice session by choosing your domain, interview style, and target level.'}
        </p>
      </div>

      {/* Section 1: Field / Domain */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold text-[#4b53bb] uppercase tracking-wider">
            {isUrdu ? 'شعبہ / فیلڈ منتخب کریں' : 'Select Field / Domain'}
          </h2>
          <span className="text-xs font-medium text-[#464652] bg-[#e7e8ec] px-3 py-0.5 rounded-full">
            {isUrdu ? 'مرحلہ 1 از 3' : 'Step 1 of 3'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {fields.map((field) => {
            const isSelected = selectedField === field.id;
            return (
              <button
                key={field.id}
                onClick={() => onSelectField(field.id)}
                className={`flex items-center gap-3 p-3.5 rounded-2xl bg-white shadow-sm transition-all duration-200 text-left cursor-pointer border ${
                  isSelected
                    ? 'border-[#4b53bb] bg-[#4b53bb]/5 shadow-md shadow-[#4b53bb]/10 font-semibold'
                    : 'border-transparent hover:border-gray-200 hover:shadow-md'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-[#4b53bb] text-white' : 'bg-gray-100 text-[#464652]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">{field.icon}</span>
                </div>
                <span className="text-xs sm:text-sm text-[#191c1f] leading-tight">
                  {field.title}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Section 2: Interview Type */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold text-[#4b53bb] uppercase tracking-wider">
            {isUrdu ? 'انٹرویو کی قسم منتخب کریں' : 'Choose Interview Type'}
          </h2>
          <span className="text-xs font-medium text-[#464652] bg-[#e7e8ec] px-3 py-0.5 rounded-full">
            {isUrdu ? 'مرحلہ 2 از 3' : 'Step 2 of 3'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3" id="interview-type-grid">
          {types.map((type) => {
            const isSelected = selectedType === type.id;
            return (
              <button
                key={type.id}
                onClick={() => onSelectType(type.id)}
                className={`flex flex-col items-start p-4 gap-3 rounded-2xl bg-white shadow-sm transition-all duration-300 text-left group cursor-pointer ${
                  isSelected
                    ? 'selected ring-2 ring-[#4b53bb] shadow-md shadow-[#4b53bb]/10'
                    : 'hover:border-gray-200 hover:shadow-md'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    type.colorClass
                  } ${isSelected ? `${type.activeBg} ${type.activeText}` : ''}`}
                >
                  <span className="material-symbols-outlined">{type.icon}</span>
                </div>
                <div>
                  <div className="font-semibold text-sm text-[#191c1f]">{type.title}</div>
                  <div className="text-xs text-[#464652]">{type.subtitle}</div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Section 3: Experience Level */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold text-[#4b53bb] uppercase tracking-wider">
            {isUrdu ? 'تجربے کی سطح منتخب کریں' : 'Choose Experience Level'}
          </h2>
          <span className="text-xs font-medium text-[#464652] bg-[#e7e8ec] px-3 py-0.5 rounded-full">
            {isUrdu ? 'مرحلہ 3 از 3' : 'Step 3 of 3'}
          </span>
        </div>

        <div className="flex flex-col gap-2.5">
          {levels.map((level) => {
            const isSelected = selectedLevel === level.id;
            return (
              <button
                key={level.id}
                onClick={() => onSelectLevel(level.id)}
                className={`flex items-center gap-4 p-4 rounded-2xl bg-white shadow-sm transition-all duration-300 group cursor-pointer ${
                  isSelected ? 'selected ring-2 ring-[#4b53bb]' : 'hover:shadow-md'
                }`}
              >
                <div
                  className={`relative flex items-center justify-center w-5 h-5 rounded-full border-2 transition-colors ${
                    isSelected ? 'border-[#4b53bb]' : 'border-[#c6c5d5]'
                  }`}
                >
                  <div
                    className={`w-2.5 h-2.5 rounded-full bg-[#4b53bb] transition-opacity ${
                      isSelected ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                </div>

                <div className="flex-1 text-left">
                  <div className="font-semibold text-sm text-[#191c1f]">{level.title}</div>
                  <div className="text-xs text-[#464652]">{level.subtitle}</div>
                </div>

                <span
                  className={`material-symbols-outlined transition-colors ${
                    isSelected ? 'text-[#4b53bb]' : 'text-[#e1e2e6]'
                  }`}
                >
                  {level.icon}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Coach Tip */}
      <div className="p-4 rounded-2xl bg-[#64a6c0]/15 flex items-start gap-3">
        <span className="material-symbols-outlined text-[#1a667e] text-xl">lightbulb</span>
        <p className="text-xs text-[#003a4a] leading-relaxed">
          <span className="font-bold">{isUrdu ? 'کوچ کا مشورہ: ' : "Coach's Tip: "}</span>
          {isUrdu
            ? 'مخصوص فیلڈ اور درمیانہ سطح کے سوالات آپ کے حقیقی انٹرویو کی تیاری میں 2 گنا بہتری لاتے ہیں۔'
            : 'Selecting your specific field generates hyper-relevant questions tailored to real workplace scenarios.'}
        </p>
      </div>

      {/* Action Button */}
      <div className="mt-2">
        <button
          onClick={onContinue}
          disabled={isLoading}
          className="w-full bg-[#4b53bb] hover:bg-[#3239a2] text-white h-14 rounded-full font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#4b53bb]/20 active:scale-95 transition-all cursor-pointer disabled:opacity-60"
        >
          {isLoading ? (
            <>
              <span className="material-symbols-outlined animate-spin">progress_activity</span>
              <span>{isUrdu ? 'سوالات تیار ہو رہے ہیں...' : 'Generating Dynamic Questions...'}</span>
            </>
          ) : (
            <>
              <span>{isUrdu ? 'مشق پر جائیں' : 'Continue to Practice'}</span>
              <span className="material-symbols-outlined">arrow_forward</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
