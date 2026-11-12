import React from 'react';

interface ItemIconProps {
  id?: string;
  fallbackIcon?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

// Map item IDs to custom SVG pixel art or atlas coordinates
export const ItemIcon: React.FC<ItemIconProps> = ({
  id = '',
  fallbackIcon = '📦',
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-5 h-5 text-xs',
    md: 'w-7 h-7 text-base',
    lg: 'w-9 h-9 text-xl',
    xl: 'w-12 h-12 text-2xl',
  }[size];

  // Specific pixel-art SVG renderers for key game items
  if (id.includes('pickaxe')) {
    const isIron = id.includes('iron');
    const isGold = id.includes('gold');
    const isCopper = id.includes('copper');
    const headColor = isGold ? '#fbbf24' : isIron ? '#cbd5e1' : isCopper ? '#f97316' : '#94a3b8';
    const tipColor = isGold ? '#fef08a' : isIron ? '#ffffff' : '#e2e8f0';

    return (
      <svg viewBox="0 0 32 32" className={`${sizeClasses} ${className} pixelated`} fill="none">
        {/* Handle */}
        <line x1="8" y1="24" x2="22" y2="10" stroke="#78350f" strokeWidth="3" strokeLinecap="round" />
        <line x1="9" y1="23" x2="21" y2="11" stroke="#92400e" strokeWidth="1.5" strokeLinecap="round" />
        {/* Curved Pick Head */}
        <path d="M12 7 Q21 8 26 18" stroke={headColor} strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <path d="M18 12 Q21 16 26 18" stroke={headColor} strokeWidth="3.5" fill="none" strokeLinecap="round" />
        {/* Sharp Tips */}
        <circle cx="12" cy="7" r="1.5" fill={tipColor} />
        <circle cx="26" cy="18" r="1.5" fill={tipColor} />
        {/* Binding ring */}
        <rect x="18" y="10" width="3" height="3" fill="#451a03" />
      </svg>
    );
  }

  if (id.includes('axe') && !id.includes('pickaxe')) {
    const isIron = id.includes('iron');
    const headColor = isIron ? '#cbd5e1' : '#94a3b8';
    const edgeColor = isIron ? '#ffffff' : '#e2e8f0';

    return (
      <svg viewBox="0 0 32 32" className={`${sizeClasses} ${className} pixelated`} fill="none">
        {/* Handle */}
        <line x1="9" y1="25" x2="21" y2="9" stroke="#78350f" strokeWidth="3" strokeLinecap="round" />
        {/* Axe Blade */}
        <path d="M18 7 L26 9 L25 18 L19 14 Z" fill={headColor} stroke="#475569" strokeWidth="0.8" />
        <line x1="26" y1="9" x2="25" y2="18" stroke={edgeColor} strokeWidth="1.5" />
      </svg>
    );
  }

  if (id.includes('sword')) {
    const isIron = id.includes('iron');
    const isGold = id.includes('gold');
    const bladeColor = isGold ? '#fbbf24' : isIron ? '#cbd5e1' : '#94a3b8';
    const hiltColor = isGold ? '#f59e0b' : '#d4af37';

    return (
      <svg viewBox="0 0 32 32" className={`${sizeClasses} ${className} pixelated`} fill="none">
        {/* Pommel & Grip */}
        <circle cx="8" cy="24" r="2" fill={hiltColor} />
        <line x1="8" y1="24" x2="13" y2="19" stroke="#5c3a21" strokeWidth="2.5" />
        {/* Crossguard */}
        <line x1="11" y1="22" x2="16" y2="17" stroke={hiltColor} strokeWidth="3" strokeLinecap="round" />
        {/* Blade */}
        <line x1="14" y1="18" x2="25" y2="7" stroke={bladeColor} strokeWidth="3" strokeLinecap="round" />
        <line x1="14" y1="18" x2="25" y2="7" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" />
        <path d="M24 6 L26 8 L27 5 Z" fill="#ffffff" />
      </svg>
    );
  }

  if (id.includes('spear')) {
    return (
      <svg viewBox="0 0 32 32" className={`${sizeClasses} ${className} pixelated`} fill="none">
        <line x1="5" y1="27" x2="23" y2="9" stroke="#78350f" strokeWidth="2.5" />
        <polygon points="21,11 27,5 25,13" fill="#cbd5e1" stroke="#475569" strokeWidth="0.8" />
        <line x1="22" y1="10" x2="27" y2="5" stroke="#ffffff" strokeWidth="1" />
      </svg>
    );
  }

  if (id.includes('hammer')) {
    return (
      <svg viewBox="0 0 32 32" className={`${sizeClasses} ${className} pixelated`} fill="none">
        <line x1="8" y1="24" x2="21" y2="11" stroke="#78350f" strokeWidth="3" />
        <rect x="16" y="7" width="10" height="7" rx="1" transform="rotate(-45 21 10.5)" fill="#64748b" stroke="#334155" strokeWidth="1" />
      </svg>
    );
  }

  if (id.includes('bow')) {
    return (
      <svg viewBox="0 0 32 32" className={`${sizeClasses} ${className} pixelated`} fill="none">
        <path d="M9 7 Q23 16 9 25" stroke="#92400e" strokeWidth="3" fill="none" strokeLinecap="round" />
        <line x1="9" y1="7" x2="9" y2="25" stroke="#e2e8f0" strokeWidth="1" />
      </svg>
    );
  }

  if (id.includes('arrow')) {
    return (
      <svg viewBox="0 0 32 32" className={`${sizeClasses} ${className} pixelated`} fill="none">
        <line x1="6" y1="26" x2="24" y2="8" stroke="#78350f" strokeWidth="2" />
        <polygon points="21,11 26,6 23,13" fill="#94a3b8" />
        <path d="M7 23 L5 27 L9 25" fill="#f8fafc" />
      </svg>
    );
  }

  if (id.includes('pistol')) {
    return (
      <svg viewBox="0 0 32 32" className={`${sizeClasses} ${className} pixelated`} fill="none">
        <rect x="7" y="10" width="16" height="5" rx="1" fill="#475569" stroke="#1e293b" strokeWidth="1" />
        <rect x="7" y="12" width="18" height="2" fill="#94a3b8" />
        <path d="M14 15 L11 23 L15 24 L18 15 Z" fill="#334155" />
      </svg>
    );
  }

  if (id.includes('torch')) {
    return (
      <svg viewBox="0 0 32 32" className={`${sizeClasses} ${className} pixelated`} fill="none">
        <line x1="10" y1="24" x2="19" y2="13" stroke="#78350f" strokeWidth="3" strokeLinecap="round" />
        <circle cx="21" cy="10" r="5" fill="#f97316" filter="drop-shadow(0 0 4px #fbbf24)" />
        <circle cx="21" cy="10" r="2.5" fill="#fef08a" />
      </svg>
    );
  }

  if (id === 'cave_crystal') {
    return (
      <svg viewBox="0 0 32 32" className={`${sizeClasses} ${className} pixelated`} fill="none">
        <polygon points="16,4 21,12 18,25 14,25 11,12" fill="#a855f7" stroke="#7e22ce" strokeWidth="1" />
        <polygon points="16,4 18,12 16,25" fill="#c084fc" />
        <polygon points="10,13 14,9 12,24" fill="#9333ea" />
        <polygon points="22,13 18,9 20,24" fill="#c084fc" />
        <circle cx="16" cy="14" r="7" fill="#c084fc" opacity="0.3" filter="blur(2px)" />
      </svg>
    );
  }

  if (id.includes('diamond')) {
    return (
      <svg viewBox="0 0 32 32" className={`${sizeClasses} ${className} pixelated`} fill="none">
        <polygon points="10,11 22,11 26,16 16,26 6,16" fill="#38bdf8" stroke="#0284c7" strokeWidth="1" />
        <polygon points="10,11 16,16 16,26" fill="#7dd3fc" />
        <polygon points="13,11 16,16 19,11" fill="#bae6fd" />
      </svg>
    );
  }

  if (id.includes('gold')) {
    return (
      <svg viewBox="0 0 32 32" className={`${sizeClasses} ${className} pixelated`} fill="none">
        <polygon points="6,20 10,12 22,12 26,20" fill="#f59e0b" stroke="#b45309" strokeWidth="1" />
        <polygon points="10,12 22,12 20,15 8,15" fill="#fbbf24" />
        <line x1="8" y1="14" x2="19" y2="14" stroke="#fef08a" strokeWidth="1.5" />
      </svg>
    );
  }

  if (id.includes('iron_ore') || id.includes('coal') || id === 'stone') {
    const baseColor = id.includes('coal') ? '#1e293b' : id.includes('iron') ? '#64748b' : '#78716c';
    const highlight = id.includes('iron') ? '#cbd5e1' : id.includes('coal') ? '#475569' : '#a8a29e';

    return (
      <svg viewBox="0 0 32 32" className={`${sizeClasses} ${className} pixelated`} fill="none">
        <polygon points="7,22 6,13 13,8 24,9 26,18 20,24 10,24" fill={baseColor} stroke="#292524" strokeWidth="1" />
        <polygon points="13,9 23,10 21,15 11,14" fill={highlight} />
      </svg>
    );
  }

  if (id.includes('potion')) {
    return (
      <svg viewBox="0 0 32 32" className={`${sizeClasses} ${className} pixelated`} fill="none">
        <rect x="14" y="6" width="4" height="4" fill="#94a3b8" />
        <path d="M13 10 L19 10 L24 21 Q24 26 16 26 Q8 26 8 21 Z" fill="#ef4444" stroke="#991b1b" strokeWidth="1" />
        <ellipse cx="14" cy="18" rx="2" ry="4" fill="#fca5a5" opacity="0.6" />
      </svg>
    );
  }

  if (id.includes('meat') || id.includes('fish')) {
    const isCooked = id.includes('cooked');
    const color = isCooked ? '#92400e' : '#ef4444';
    const boneColor = '#fef3c7';

    return (
      <svg viewBox="0 0 32 32" className={`${sizeClasses} ${className} pixelated`} fill="none">
        <ellipse cx="15" cy="16" rx="8" ry="6" fill={color} stroke="#78350f" strokeWidth="1" />
        {isCooked ? (
          <>
            <line x1="12" y1="13" x2="18" y2="13" stroke="#451a03" strokeWidth="1.5" />
            <line x1="11" y1="16" x2="19" y2="16" stroke="#451a03" strokeWidth="1.5" />
            <line x1="13" y1="19" x2="17" y2="19" stroke="#451a03" strokeWidth="1.5" />
          </>
        ) : (
          <ellipse cx="14" cy="16" rx="3" ry="2" fill="#fca5a5" />
        )}
        <line x1="21" y1="18" x2="26" y2="22" stroke={boneColor} strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }

  // Fallback to emoji with clean container
  return (
    <span className={`inline-flex items-center justify-center select-none ${sizeClasses} ${className}`}>
      {fallbackIcon}
    </span>
  );
};
