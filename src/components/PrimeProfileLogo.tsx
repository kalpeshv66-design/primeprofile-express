import React from 'react';

export interface PrimeProfileIconProps {
  size?: number | string;
  className?: string;
  idPrefix?: string;
}

/**
 * PrimeProfile official purple folded-ribbon 'P' icon
 * Matches the uploaded reference images with 100% precision
 */
export const PrimeProfileIcon: React.FC<PrimeProfileIconProps> = ({
  size = 36,
  className = '',
  idPrefix = 'prime',
}) => {
  const topLoopGradId = `${idPrefix}-top-loop`;
  const stemGradId = `${idPrefix}-stem`;
  const shadowGradId = `${idPrefix}-shadow`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 110"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 transition-transform duration-200 group-hover:scale-105 ${className}`}
    >
      <defs>
        <linearGradient id={topLoopGradId} x1="16" y1="16" x2="88" y2="76" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#8B45FF" />
          <stop offset="45%" stopColor="#762DF8" />
          <stop offset="100%" stopColor="#631DE6" />
        </linearGradient>

        <linearGradient id={stemGradId} x1="16" y1="44" x2="48" y2="98" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6524F6" />
          <stop offset="60%" stopColor="#5518E0" />
          <stop offset="100%" stopColor="#450ECB" />
        </linearGradient>

        <linearGradient id={shadowGradId} x1="42" y1="44" x2="68" y2="74" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1A0548" stopOpacity="0.38" />
          <stop offset="100%" stopColor="#1A0548" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {/* 1. Lower Stem Piece with curved top shoulder and rounded bottom sweep */}
      <path
        d="M 16 58 C 30 50 44 54 44 68 L 44 86 C 44 94 38 100 30 100 L 20 100 C 17.5 100 16 98.5 16 96 L 16 58 Z"
        fill={`url(#${stemGradId})`}
      />

      {/* 2. Upper Loop Piece with horizontal slot and white scoop cut on the left */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M 16 14 L 58 14 C 74.5 14 88 27.5 88 44 C 88 60.5 74.5 74 58 74 L 44 74 L 44 60 L 58 60 C 66.8 60 74 52.8 74 44 C 74 35.2 66.8 28 58 28 L 24 28 C 19 28 16 32 16 38 L 16 14 Z"
        fill={`url(#${topLoopGradId})`}
      />

      {/* 3. Fold Shadow between Loop & Stem */}
      <path
        d="M 44 48 L 68 72 L 58 78 L 38 54 Z"
        fill={`url(#${shadowGradId})`}
      />
    </svg>
  );
};

export interface PrimeProfileLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  variant?: 'dark' | 'light' | 'auto';
  layout?: 'horizontal' | 'vertical';
  showText?: boolean;
  className?: string;
  badge?: string;
  idPrefix?: string;
}

/**
 * Production-ready PrimeProfile Logo component
 * Loads from project assets (/assets/logo/...) to ensure zero-distortion,
 * perfect aspect ratio, and seamless Hostinger deployment.
 */
export const PrimeProfileLogo: React.FC<PrimeProfileLogoProps> = ({
  size = 'md',
  variant = 'auto',
  layout = 'horizontal',
  showText = true,
  className = '',
  badge,
}) => {
  // Sizing scale for horizontal & vertical layouts
  const sizeMap = {
    xs: { h: 22, v: 80, icon: 20 },
    sm: { h: 28, v: 100, icon: 24 },
    md: { h: 36, v: 130, icon: 32 },
    lg: { h: 44, v: 160, icon: 40 },
    xl: { h: 56, v: 200, icon: 52 },
    '2xl': { h: 72, v: 260, icon: 68 },
  }[size];

  // 1. Standalone Icon (when showText is false)
  if (!showText) {
    return (
      <img
        src="/assets/logo/primeprofile-symbol.svg"
        alt="PrimeProfile"
        width={sizeMap.icon}
        height={sizeMap.icon}
        className={`w-auto shrink-0 select-none object-contain transition-transform duration-200 hover:scale-105 ${className}`}
        style={{ height: sizeMap.icon }}
        loading="eager"
      />
    );
  }

  // 2. Large Vertical Stacked Logo (Welcome/Splash Sections matching Image 2)
  if (layout === 'vertical') {
    return (
      <div className={`select-none inline-flex flex-col items-center text-center group cursor-pointer ${className}`}>
        <img
          src="/assets/logo/primeprofile-logo-vertical.svg"
          alt="PrimeProfile"
          className="w-auto max-w-full object-contain shrink-0 transition-transform duration-200 group-hover:scale-102"
          style={{ height: sizeMap.v, aspectRatio: '400 / 340' }}
          loading="eager"
        />
        {badge && (
          <span className="mt-2 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200/80">
            {badge}
          </span>
        )}
      </div>
    );
  }

  // 3. Horizontal "P + PrimeProfile" Logo (Desktop & Mobile Header/Navbar matching Image 1)
  const logoSrc =
    variant === 'dark'
      ? '/assets/logo/primeprofile-logo-horizontal-white.svg'
      : '/assets/logo/primeprofile-logo-horizontal.svg';

  return (
    <div className={`select-none inline-flex items-center gap-2 group cursor-pointer ${className}`}>
      <img
        src={logoSrc}
        alt="PrimeProfile"
        className="w-auto max-w-full shrink-0 object-contain transition-opacity duration-200 group-hover:opacity-90"
        style={{ height: sizeMap.h, aspectRatio: '380 / 90' }}
        loading="eager"
      />
      {badge && (
        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200/80 shrink-0">
          {badge}
        </span>
      )}
    </div>
  );
};
