import React from 'react';

export interface NeuSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export const NeuSwitch: React.FC<NeuSwitchProps> = ({
  checked,
  onChange,
  label,
  disabled = false,
  className = '',
}) => {
  return (
    <label
      className={`inline-flex items-center gap-3 cursor-pointer select-none ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
    >
      <div
        onClick={() => !disabled && onChange(!checked)}
        className={`relative w-12 h-6.5 rounded-full transition-colors duration-200 p-0.5 neu-pressed ${
          checked ? 'bg-[#FF5A1F]/20' : 'bg-[#E5ECF6] dark:bg-[#171F2E]'
        }`}
      >
        <div
          className={`w-5.5 h-5.5 rounded-full transition-all duration-200 flex items-center justify-center ${
            checked
              ? 'translate-x-5.5 bg-[#FF5A1F] text-white shadow-[0_2px_8px_rgba(255,90,31,0.4)]'
              : 'translate-x-0 neu-button bg-[#F8FAFF] dark:bg-[#111722]'
          }`}
        />
      </div>
      {label && (
        <span className="text-sm font-medium text-[#1A202C] dark:text-[#F0F4F8]">
          {label}
        </span>
      )}
    </label>
  );
};
