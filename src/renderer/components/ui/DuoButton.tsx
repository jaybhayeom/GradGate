// ==============================================================================
// TACTILE 3D DUOLINGO-GRADE BUTTON
// 3D lip-down spring physics: border-b-4 with active translate-y-1
// ==============================================================================

import React from 'react';
import { soundEngine } from '../../audio/soundEngine';

export type DuoButtonVariant = 'primary' | 'secondary' | 'danger' | 'gold' | 'locked' | 'ghost';
export type DuoButtonSize = 'sm' | 'md' | 'lg';

export interface DuoButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: DuoButtonVariant;
  size?: DuoButtonSize;
  shortcut?: string;
  fullWidth?: boolean;
  playSound?: boolean;
  icon?: React.ReactNode;
}

const variantStyles: Record<DuoButtonVariant, string> = {
  primary:
    'bg-[#58CC02] border-[#46A302] text-slate-950 font-black hover:bg-[#61E002] active:border-b-0 active:translate-y-1 shadow-md',
  secondary:
    'bg-[#1CB0F6] border-[#1899D6] text-white font-black hover:bg-[#2BD0FF] active:border-b-0 active:translate-y-1 shadow-md',
  danger:
    'bg-[#FF4B4B] border-[#EA2B2B] text-white font-black hover:bg-[#FF6666] active:border-b-0 active:translate-y-1 shadow-md',
  gold:
    'bg-[#FFC800] border-[#E5A500] text-slate-950 font-black hover:bg-[#FFD22E] active:border-b-0 active:translate-y-1 shadow-md',
  locked:
    'bg-[#2B3D45] border-[#202F36] text-[#8B9BA2] cursor-not-allowed active:border-b-4 active:translate-y-0 opacity-70 shadow-none',
  ghost:
    'bg-transparent border-[#2B3D45] border-b hover:bg-[#1B272D] active:border-b text-slate-300 active:translate-y-0 shadow-none'
};

const sizeStyles: Record<DuoButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-2xl font-black border-b-[3px] tracking-wide',
  md: 'px-4 py-2 text-xs rounded-2xl font-black tracking-wide border-b-[4px]',
  lg: 'px-6 py-2.5 text-sm rounded-2xl font-black tracking-wider border-b-[4px]'
};

export const DuoButton: React.FC<DuoButtonProps> = ({
  variant = 'primary',
  size = 'md',
  shortcut,
  fullWidth = false,
  playSound = true,
  icon,
  children,
  onClick,
  disabled,
  className = '',
  ...props
}) => {
  const isLocked = variant === 'locked' || disabled;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>): void => {
    if (isLocked) {
      e.preventDefault();
      return;
    }
    if (playSound) {
      soundEngine.playClick();
    }
    onClick?.(e);
  };

  return (
    <button
      type="button"
      disabled={isLocked}
      onClick={handleClick}
      className={`
        relative inline-flex items-center justify-center gap-2 select-none
        transition-all duration-75 active:translate-y-[4px]
        focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950
        shadow-md
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {icon && <span className="flex items-center text-lg">{icon}</span>}
      <span>{children}</span>
      {shortcut && (
        <kbd className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-black/25 text-white/90 border border-white/20">
          {shortcut}
        </kbd>
      )}
    </button>
  );
};
