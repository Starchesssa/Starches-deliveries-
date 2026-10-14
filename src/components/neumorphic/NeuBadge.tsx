import React from 'react';

export interface NeuBadgeProps {
  active?: boolean;
  clickable?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const NeuBadge: React.FC<NeuBadgeProps> = ({
  active = false,
  clickable = false,
  icon,
  children,
  onClick,
  className = '',
}) => {
  // In light theme, NEVER use black background. When active, use vibrant orange with soft glow or soft tactile orange tint.
  const activeStyle = active
    ? 'bg-[#FF5A1F] text-white shadow-[0_3px_10px_rgba(255,90,31,0.3)] border-transparent'
    : 'neu-button text-[#5A6A80] dark:text-[#8B9BB4] hover:text-[#1A202C] dark:hover:text-[#F0F4F8]';

  const interactiveStyle = clickable || onClick ? 'cursor-pointer active:scale-95' : '';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!clickable && !onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 select-none ${activeStyle} ${interactiveStyle} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};
