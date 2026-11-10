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
    'bg-[var(--palette-accent,#B6FF2E)] border-[var(--palette-accent-lip,#8ACC1D)] text-[var(--palette-text-on-accent,#0A0A0A)] font-bold hover:brightness-105 active:border-b-0 shadow-sm',
  secondary:
    'bg-[#3D7EFF] border-[#2B66DB] text-white font-bold hover:brightness-105 active:border-b-0 shadow-sm',
  danger:
    'bg-[#FF4B4B] border-[#EA2B2B] text-white font-bold hover:brightness-105 active:border-b-0 shadow-sm',
  gold:
    'bg-[#FFC328] border-[#CC9816] text-[#0A0A0A] font-bold hover:brightness-105 active:border-b-0 shadow-sm',
  locked:
    'bg-[#282C34] border-[#3E4451] text-[#94A3B8] cursor-not-allowed active:border-b-2 active:translate-y-0 opacity-60',
  ghost:
    'bg-transparent border-[#3E4451] border-b hover:bg-[var(--palette-surface,#282C34)] active:border-b text-slate-300 active:translate-y-0 shadow-none'
};

const sizeStyles: Record<DuoButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-xl font-bold border-b-[2px]',
  md: 'px-4 py-2 text-xs rounded-xl font-bold tracking-wide border-b-[3px]',
  lg: 'px-6 py-2.5 text-sm rounded-xl font-extrabold tracking-wide border-b-[3px]'
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
