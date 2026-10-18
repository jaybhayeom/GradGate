// ==============================================================================
// ASSET SLOT COMPONENT (Anti-Hallucination Visual Contract)
// Provides clean, typed placeholder for official Phosphor/Lucide vector icons
// and verified human-designed Lottie files without generating procedural SVG slop.
// ==============================================================================

import React from 'react';

export interface AssetSlotProps {
  id: string;
  fallbackIcon: React.ReactNode;
  label?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-12 h-12 text-base',
  lg: 'w-16 h-16 text-xl',
  xl: 'w-24 h-24 text-3xl'
};

export const AssetSlot: React.FC<AssetSlotProps> = ({
  id,
  fallbackIcon,
  label,
  className = '',
  size = 'md'
}) => {
  return (
    <div
      data-asset-slot-id={id}
      className={`inline-flex flex-col items-center justify-center rounded-2xl bg-slate-800/60 border border-slate-700/60 p-2 text-slate-300 shadow-inner ${sizeClasses[size]} ${className}`}
    >
      <div className="flex items-center justify-center">{fallbackIcon}</div>
      {label && <span className="mt-1 text-[10px] font-semibold text-slate-400">{label}</span>}
    </div>
  );
};
