import React from 'react';

export interface NeuInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  prefixIcon?: React.ReactNode;
  suffixIcon?: React.ReactNode;
  wrapperClassName?: string;
}

export const NeuInput: React.FC<NeuInputProps> = ({
  prefixIcon,
  suffixIcon,
  wrapperClassName = '',
  className = '',
  ...props
}) => {
  return (
    <div
      className={`neu-input rounded-xl px-3.5 py-2.5 flex items-center gap-2.5 text-[#1A202C] dark:text-[#F0F4F8] ${wrapperClassName}`}
    >
      {prefixIcon && <span className="text-[#5A6A80] dark:text-[#8B9BB4] shrink-0">{prefixIcon}</span>}
      <input
        className={`w-full bg-transparent outline-none text-sm placeholder:text-[#5A6A80]/70 dark:placeholder:text-[#8B9BB4]/70 ${className}`}
        {...props}
      />
      {suffixIcon && <span className="text-[#5A6A80] dark:text-[#8B9BB4] shrink-0">{suffixIcon}</span>}
    </div>
  );
};
