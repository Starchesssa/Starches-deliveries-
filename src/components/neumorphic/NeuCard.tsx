import React from 'react';

export interface NeuCardProps extends React.HTMLAttributes<HTMLDivElement> {
  elevation?: 'sm' | 'flat' | 'lg' | 'pressed' | 'glass';
  convex?: boolean;
  clickable?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const NeuCard: React.FC<NeuCardProps> = ({
  elevation = 'flat',
  convex = false,
  clickable = false,
  children,
  className = '',
  ...props
}) => {
  let elevationClass = 'neu-flat';
  if (elevation === 'sm') elevationClass = 'neu-flat-sm';
  if (elevation === 'lg') elevationClass = 'neu-flat-lg';
  if (elevation === 'pressed') elevationClass = 'neu-pressed';
  if (elevation === 'glass') elevationClass = 'neu-glass';

  const interactiveClass = clickable
    ? 'cursor-pointer transition-all duration-200 active:scale-[0.98] hover:-translate-y-0.5'
    : '';

  return (
    <div
      className={`rounded-2xl transition-colors duration-200 ${elevationClass} ${interactiveClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
