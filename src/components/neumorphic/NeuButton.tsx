import React from 'react';

export interface NeuButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'pressed' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export const NeuButton: React.FC<NeuButtonProps> = ({
  variant = 'secondary',
  size = 'md',
  fullWidth = false,
  children,
  icon,
  className = '',
  disabled = false,
  ...props
}) => {
  let sizeStyles = 'px-4 py-2.5 text-sm gap-2';
  if (size === 'sm') sizeStyles = 'px-3 py-1.5 text-xs gap-1.5';
  if (size === 'lg') sizeStyles = 'px-6 py-3.5 text-base gap-2.5 font-semibold';

  let variantStyles = 'neu-button text-[#1A202C] dark:text-[#F0F4F8]';
  if (variant === 'primary') {
    variantStyles = 'neu-button-primary';
  } else if (variant === 'pressed') {
    variantStyles = 'neu-pressed text-[#FF5A1F] font-semibold';
  } else if (variant === 'ghost') {
    variantStyles = 'bg-transparent hover:bg-[#E5ECF6]/60 dark:hover:bg-[#171F2E]/60 text-[#5A6A80] dark:text-[#8B9BB4]';
  }

  return (
    <button
      disabled={disabled}
      className={`inline-flex items-center justify-center font-medium rounded-xl cursor-pointer select-none transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${
        fullWidth ? 'w-full' : ''
      } ${sizeStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};

export interface NeuIconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'secondary' | 'primary' | 'pressed' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  active?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const NeuIconButton: React.FC<NeuIconButtonProps> = ({
  variant = 'secondary',
  size = 'md',
  active = false,
  children,
  className = '',
  disabled = false,
  ...props
}) => {
  let sizeClass = 'w-10 h-10';
  if (size === 'sm') sizeClass = 'w-8 h-8';
  if (size === 'lg') sizeClass = 'w-12 h-12';

  let variantClass = 'neu-button text-[#1A202C] dark:text-[#F0F4F8]';
  if (variant === 'primary') {
    variantClass = 'neu-button-primary';
  } else if (variant === 'glass') {
    variantClass = 'neu-glass text-[#1A202C] dark:text-[#F0F4F8] hover:bg-[#F8FAFF] dark:hover:bg-[#111722]';
  } else if (active || variant === 'pressed') {
    variantClass = 'neu-pressed text-[#FF5A1F]';
  }

  return (
    <button
      disabled={disabled}
      className={`inline-flex items-center justify-center rounded-xl cursor-pointer select-none transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${sizeClass} ${variantClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
