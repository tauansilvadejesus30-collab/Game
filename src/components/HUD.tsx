import React, { useState, useEffect } from 'react';
import { PlayerStats, Quest, WorldState, InventorySlot } from '../game/types';
import { 
  Heart, 
  Utensils, 
  Droplets, 
  Zap, 
  Thermometer, 
  Sun, 
  CloudRain, 
  Cloud, 
  Pause, 
  Backpack, 
  Hammer, 
  Award, 
  Swords, 
  ChevronRight,
  ChevronDown,
  Sparkles,
  Maximize,
  Minimize,
  Compass
} from 'lucide-react';
import { soundEngine } from '../game/audio';
import { ItemIcon } from './ItemIcon';

interface HUDProps {
  stats: PlayerStats;
  world: WorldState;
  quests: Quest[];
  inventory: (InventorySlot | null)[];
  selectedHotbarIndex: number;
  playerX: number;
  playerY: number;
  isInsideCave?: boolean;
  nearbyInteractiveLabel?: string | null;
  onInteract?: () => void;
  onSelectHotbar: (index: number) => void;
  onOpenInventory: () => void;
  onOpenCrafting: () => void;
  onOpenBuilding: () => void;
  onOpenMap: () => void;
  onOpenSkills: () => void;
  onOpenQuests: () => void;
  onPause: () => void;
  onAttack: () => void;
  onToggleSprint: (sprinting: boolean) => void;
  isSprinting: boolean;
  onJoystickMove: (vec: { x: number; y: number }) => void;
}

export const HUD: React.FC<HUDProps> = ({
  stats,
  world,
  quests,
  inventory,
  selectedHotbarIndex,
  playerX,
  playerY,
  isInsideCave = false,
  nearbyInteractiveLabel = null,
  onInteract,
  onSelectHotbar,
  onOpenInventory,
  onOpenCrafting,
  onOpenBuilding,
  onOpenMap,
  onOpenSkills,
  onOpenQuests,
  onPause,
  onAttack,
  onToggleSprint,
  isSprinting,
  onJoystickMove,
}) => {
  const [, setTouchActive] = useState(false);
  const [joystickStart, setJoystickStart] = useState<{ x: number; y: number } | null>(null);
  const [joystickCurrent, setJoystickCurrent] = useState<{ x: number; y: number } | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);
  const [isQuestCollapsed, setIsQuestCollapsed] = useState(false);
  const joystickTouchIdRef = React.useRef<number | null>(null);

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const toggleFullscreen = () => {
    soundEngine.playUiClick();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      if (screen.orientation && 'lock' in screen.orientation) {
        (screen.orientation as any).lock('landscape').catch(() => {});
      }
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Active Main Quest
  const activeQuest = quests.find(q => !q.completed) || quests[quests.length - 1];

  // Time format
  const hours = Math.floor(world.timeOfDay / 60);
  const minutes = Math.floor(world.timeOfDay % 60);
  const timeFormatted = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

  // Weather icon
  const WeatherIcon = world.weather === 'rain' || world.weather === 'thunderstorm' 
    ? CloudRain 
    : world.weather === 'cloudy' 
      ? Cloud 
      : Sun;

  // Active Equipped Firearm Detection
  const selectedSlot = inventory[selectedHotbarIndex];
  const isGun = selectedSlot && (selectedSlot.item.id === 'pistol' || selectedSlot.item.id === 'rifle');
  const ammoCount = isGun ? inventory.reduce((total, s) => {
    if (s && s.item.id === (selectedSlot.item.id === 'pistol' ? 'pistol_ammo' : 'rifle_ammo')) {
      return total + s.quantity;
    }
    return total;
  }, 0) : 0;

  // True Multi-Touch Joystick Handlers
  const handleJoystickTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    if (joystickTouchIdRef.current !== null) return;
    const touch = e.changedTouches[0];
    if (!touch) return;
    joystickTouchIdRef.current = touch.identifier;
    setJoystickStart({ x: touch.clientX, y: touch.clientY });
    setJoystickCurrent({ x: touch.clientX, y: touch.clientY });
    setTouchActive(true);
  };

  const handleJoystickTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    if (joystickTouchIdRef.current === null || !joystickStart) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === joystickTouchIdRef.current) {
        const dx = touch.clientX - joystickStart.x;
        const dy = touch.clientY - joystickStart.y;
        const dist = Math.hypot(dx, dy);
        const maxRadius = 38;
        const clampedDist = Math.min(dist, maxRadius);
        const angle = Math.atan2(dy, dx);

        const nx = Math.cos(angle) * (clampedDist / maxRadius);
        const ny = Math.sin(angle) * (clampedDist / maxRadius);

        setJoystickCurrent({
          x: joystickStart.x + Math.cos(angle) * clampedDist,
          y: joystickStart.y + Math.sin(angle) * clampedDist,
        });
        onJoystickMove({ x: nx, y: ny });
        break;
      }
    }
  };

  const handleJoystickTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === joystickTouchIdRef.current) {
        joystickTouchIdRef.current = null;
        setJoystickStart(null);
        setJoystickCurrent(null);
        setTouchActive(false);
        onJoystickMove({ x: 0, y: 0 });
        break;
      }
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none select-none z-20 overflow-hidden font-sans">
      {/* ========================================================= */}
      {/* 1. TOP-LEFT: Survival Stats Meters (Black & White Survival Theme) */}
      {/* ========================================================= */}
      <div className="absolute top-1.5 left-2 sm:top-2.5 sm:left-3 pl-[env(safe-area-inset-left)] pointer-events-auto flex items-start gap-1.5 sm:gap-2">
        {/* Avatar */}
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-black/90 border-2 border-neutral-700 rounded-xl p-0.5 shadow-2xl relative overflow-hidden flex items-center justify-center">
            <svg viewBox="0 0 32 32" className="w-full h-full pixelated">
              <rect width="32" height="32" fill="#0c0d14" />
              <rect x="7" y="11" width="18" height="15" fill="#ffd5b0" />
              <rect x="4" y="24" width="24" height="8" fill="#c72323" />
              <rect x="13" y="24" width="6" height="8" fill="#18181b" />
              <path d="M5 11 L10 4 L14 8 L18 3 L22 8 L27 5 L28 14 L26 18 L24 13 L22 15 L18 12 L14 15 L10 12 L8 16 L6 14 Z" fill="#18181b" />
              <rect x="9" y="16" width="4" height="4" fill="#09090b" />
              <rect x="19" y="16" width="4" height="4" fill="#09090b" />
              <rect x="10" y="16" width="2" height="2" fill="#ffffff" />
              <rect x="20" y="16" width="2" height="2" fill="#ffffff" />
            </svg>
            <span className="absolute bottom-0 right-0 px-1 bg-black text-[7px] font-pixel text-yellow-400 border-t border-l border-neutral-800">
              {stats.level}
            </span>
          </div>
        </div>

        {/* Meters (HP, Hunger, Thirst, Energy, Temp) */}
        <div className="flex flex-col gap-1 bg-black/85 p-1.5 rounded-xl border border-neutral-800 shadow-xl backdrop-blur-xs min-w-[125px] sm:min-w-[155px]">
          {/* Health */}
          <div className="flex items-center gap-1.5">
            <Heart className="w-3 h-3 text-red-500 fill-red-500 shrink-0" />
            <div className="flex-1 h-2 bg-neutral-900 rounded-xs overflow-hidden border border-neutral-700 relative">
              <div 
                className="h-full bg-gradient-to-r from-red-600 to-rose-500 transition-all duration-300"
                style={{ width: `${Math.max(0, Math.min(100, (stats.hp / stats.maxHp) * 100))}%` }}
              />
            </div>
            <span className="text-[8px] sm:text-[9px] font-mono text-white tabular-nums w-6 text-right font-bold">
              {Math.round(stats.hp)}
            </span>
          </div>

          {/* Hunger */}
          <div className="flex items-center gap-1.5">
            <Utensils className="w-3 h-3 text-amber-500 shrink-0" />
            <div className="flex-1 h-2 bg-neutral-900 rounded-xs overflow-hidden border border-neutral-700 relative">
              <div 
                className="h-full bg-amber-500 transition-all duration-300"
                style={{ width: `${Math.max(0, Math.min(100, (stats.hunger / stats.maxHunger) * 100))}%` }}
              />
            </div>
            <span className="text-[8px] sm:text-[9px] font-mono text-white tabular-nums w-6 text-right">
              {Math.round(stats.hunger)}
            </span>
          </div>

          {/* Thirst */}
          <div className="flex items-center gap-1.5">
            <Droplets className="w-3 h-3 text-sky-400 shrink-0" />
            <div className="flex-1 h-2 bg-neutral-900 rounded-xs overflow-hidden border border-neutral-700 relative">
              <div 
                className="h-full bg-sky-500 transition-all duration-300"
                style={{ width: `${Math.max(0, Math.min(100, (stats.thirst / stats.maxThirst) * 100))}%` }}
              />
            </div>
            <span className="text-[8px] sm:text-[9px] font-mono text-white tabular-nums w-6 text-right">
              {Math.round(stats.thirst)}
            </span>
          </div>

          {/* Energy */}
          <div className="flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-emerald-400 shrink-0" />
            <div className="flex-1 h-2 bg-neutral-900 rounded-xs overflow-hidden border border-neutral-700 relative">
              <div 
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${Math.max(0, Math.min(100, (stats.energy / stats.maxEnergy) * 100))}%` }}
              />
            </div>
            <span className="text-[8px] sm:text-[9px] font-mono text-white tabular-nums w-6 text-right">
              {Math.round(stats.energy)}
            </span>
          </div>

          {/* Temperature */}
          <div className="flex items-center justify-between text-[7.5px] sm:text-[8.5px] font-mono text-neutral-300 px-0.5 pt-0.5 border-t border-neutral-800">
            <div className="flex items-center gap-1">
              <Thermometer className="w-2.5 h-2.5 text-neutral-400" />
              <span>TEMP</span>
            </div>
            <span className={`font-bold ${stats.bodyTemp < 35.5 ? 'text-sky-400' : stats.bodyTemp > 38 ? 'text-rose-400' : 'text-neutral-200'}`}>
              {stats.bodyTemp.toFixed(1)}°C
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. TOP-CENTER: Biome & Cave Status Indicator */}
      {/* ========================================================= */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 pointer-events-auto flex flex-col items-center gap-1 z-10">
        <div className={`flex items-center gap-2 px-3 py-1 rounded-xl border shadow-xl backdrop-blur-xs ${
          isInsideCave 
            ? 'bg-black/95 border-purple-500/80 shadow-[0_0_15px_rgba(168,85,247,0.4)]' 
            : 'bg-black/85 border-neutral-700'
        }`}>
          {isInsideCave ? (
            <span className="text-purple-400 text-xs sm:text-sm animate-pulse">🕳️</span>
          ) : (
            <WeatherIcon className="w-3.5 h-3.5 text-yellow-400" />
          )}
          <span className="font-pixel text-[8px] sm:text-[9px] text-white tracking-wider uppercase">
            {isInsideCave ? 'CAVERNA SUBTERRÂNEA — NÍVEL 1' : `DIA ${world.dayCount} · ${timeFormatted}`}
          </span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. TOP-RIGHT: Quick Action & Pause Controls */}
      {/* ========================================================= */}
      <div className="absolute top-1.5 right-2 sm:top-2.5 sm:right-3 pr-[env(safe-area-inset-right)] pointer-events-auto flex items-center gap-1.5 sm:gap-2">
        <button
          onClick={onOpenMap}
          className="p-2 sm:p-2.5 bg-black/85 hover:bg-neutral-900 border border-neutral-700 rounded-xl shadow-lg text-white active:scale-95 transition-all cursor-pointer"
          title="Mapa do Mundo"
        >
          <Compass className="w-4 h-4 text-cyan-400" />
        </button>

        <button
          onClick={toggleFullscreen}
          className="p-2 sm:p-2.5 bg-black/85 hover:bg-neutral-900 border border-neutral-700 rounded-xl shadow-lg text-white active:scale-95 transition-all cursor-pointer"
          title="Tela Cheia"
        >
          {isFullscreen ? <Minimize className="w-4 h-4 text-yellow-400" /> : <Maximize className="w-4 h-4 text-yellow-400" />}
        </button>

        <button
          onClick={onPause}
          className="p-2 sm:p-2.5 bg-black/85 hover:bg-neutral-900 border border-neutral-700 rounded-xl shadow-lg text-white active:scale-95 transition-all cursor-pointer"
          title="Pausar Jogo"
        >
          <Pause className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* ========================================================= */}
      {/* 4. ACTIVE QUEST TRACKER (Collapsible) */}
      {/* ========================================================= */}
      {activeQuest && (
        <div className="absolute top-16 left-2 sm:left-3 pointer-events-auto z-10 max-w-[210px] sm:max-w-xs">
          <div className="bg-black/90 p-2 rounded-xl border border-neutral-800 shadow-xl backdrop-blur-xs">
            <div 
              onClick={() => setIsQuestCollapsed(!isQuestCollapsed)}
              className="flex items-center justify-between cursor-pointer text-[8px] sm:text-[9px] font-pixel text-yellow-400 pb-1"
            >
              <span className="truncate pr-1">MISSÃO: {activeQuest.title}</span>
              {isQuestCollapsed ? <ChevronRight className="w-3 h-3 text-neutral-400 shrink-0" /> : <ChevronDown className="w-3 h-3 text-neutral-400 shrink-0" />}
            </div>
            {!isQuestCollapsed && (
              <div className="mt-1 flex flex-col gap-1 text-[8px] text-neutral-300 font-sans">
                <p className="line-clamp-2 leading-tight">{activeQuest.description}</p>
                <div className="flex items-center justify-between font-mono text-[7.5px] text-neutral-400 pt-0.5 border-t border-neutral-900">
                  <span>PROGRESSO:</span>
                  <span className="text-yellow-300 font-bold">{activeQuest.currentCount} / {activeQuest.targetCount}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. RIGHT SIDEBAR BUTTONS (Mobile Survival Icons) */}
      {/* ========================================================= */}
      <div className="absolute right-2 sm:right-3 top-16 sm:top-20 pr-[env(safe-area-inset-right)] pointer-events-auto flex flex-col gap-2 z-10">
        <button
          onClick={onOpenInventory}
          className="w-10 h-10 sm:w-11 sm:h-11 bg-black/90 hover:bg-neutral-900 border-2 border-neutral-700 active:scale-90 rounded-xl shadow-xl flex items-center justify-center text-white cursor-pointer"
          title="Mochila"
        >
          <Backpack className="w-5 h-5 text-neutral-200" />
        </button>

        <button
          onClick={onOpenCrafting}
          className="w-10 h-10 sm:w-11 sm:h-11 bg-black/90 hover:bg-neutral-900 border-2 border-neutral-700 active:scale-90 rounded-xl shadow-xl flex items-center justify-center text-white cursor-pointer"
          title="Fabricação"
        >
          <Hammer className="w-5 h-5 text-amber-400" />
        </button>

        <button
          onClick={onOpenBuilding}
          className="w-10 h-10 sm:w-11 sm:h-11 bg-black/90 hover:bg-neutral-900 border-2 border-neutral-700 active:scale-90 rounded-xl shadow-xl flex items-center justify-center text-white cursor-pointer"
          title="Construção"
        >
          <Sparkles className="w-5 h-5 text-emerald-400" />
        </button>

        <button
          onClick={onOpenSkills}
          className="w-10 h-10 sm:w-11 sm:h-11 bg-black/90 hover:bg-neutral-900 border-2 border-neutral-700 active:scale-90 rounded-xl shadow-xl flex items-center justify-center text-white cursor-pointer relative"
          title="Habilidades"
        >
          <Award className="w-5 h-5 text-purple-400" />
          {stats.skillPoints > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-purple-600 border border-white text-white rounded-full text-[8px] flex items-center justify-center font-bold">
              {stats.skillPoints}
            </span>
          )}
        </button>
      </div>

      {/* ========================================================= */}
      {/* 6. CONTEXT ACTION PROMPT (When near Cave Entrance, Chest, Furnace) */}
      {/* ========================================================= */}
      {nearbyInteractiveLabel && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 pointer-events-auto z-20 animate-bounce">
          <button
            onClick={() => {
              if (onInteract) {
                onInteract();
              } else {
                onAttack();
              }
            }}
            onTouchStart={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (onInteract) {
                onInteract();
              } else {
                onAttack();
              }
            }}
            className="px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-pixel text-xs sm:text-sm rounded-2xl border-2 border-yellow-300 shadow-[0_0_20px_rgba(239,68,68,0.7)] flex items-center gap-2 cursor-pointer active:scale-95 transition-transform"
          >
            <span>{nearbyInteractiveLabel}</span>
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* 7. BOTTOM-LEFT: Virtual Joystick for Mobile Movement */}
      {/* ========================================================= */}
      <div className="absolute bottom-6 sm:bottom-8 left-4 sm:left-7 pl-[env(safe-area-inset-left)] pb-[env(safe-area-inset-bottom)] pointer-events-auto">
        <div 
          className="relative w-24 h-24 sm:w-28 sm:h-28 bg-black/70 backdrop-blur-xs border-2 border-neutral-700 rounded-full flex items-center justify-center touch-none shadow-2xl select-none"
          onTouchStart={handleJoystickTouchStart}
          onTouchMove={handleJoystickTouchMove}
          onTouchEnd={handleJoystickTouchEnd}
        >
          {/* Arrow indicators */}
          <span className="absolute top-1 text-[9px] text-white/40 font-bold pointer-events-none">▲</span>
          <span className="absolute bottom-1 text-[9px] text-white/40 font-bold pointer-events-none">▼</span>
          <span className="absolute left-1.5 text-[9px] text-white/40 font-bold pointer-events-none">◀</span>
          <span className="absolute right-1.5 text-[9px] text-white/40 font-bold pointer-events-none">▶</span>

          {/* Stick Knob */}
          <div 
            className="w-10 h-10 sm:w-12 sm:h-12 bg-white/30 hover:bg-white/40 border-2 border-white/60 rounded-full shadow-lg transition-transform duration-75 flex items-center justify-center pointer-events-none"
            style={{
              transform: joystickCurrent && joystickStart 
                ? `translate(${joystickCurrent.x - joystickStart.x}px, ${joystickCurrent.y - joystickStart.y}px)` 
                : 'translate(0px, 0px)',
            }}
          >
            <div className="w-3 h-3 bg-white/80 rounded-full" />
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 8. BOTTOM-CENTER: 8-Slot Hotbar with ItemIcon Renderers */}
      {/* ========================================================= */}
      <div className="absolute bottom-1.5 sm:bottom-2.5 left-1/2 -translate-x-1/2 pb-[env(safe-area-inset-bottom)] pointer-events-auto z-10">
        <div className="flex items-center gap-1 sm:gap-1.5 bg-black/90 p-1 sm:p-1.5 rounded-2xl border-2 border-neutral-700 shadow-2xl">
          {Array.from({ length: 8 }).map((_, idx) => {
            const slot = inventory[idx];
            const isSelected = selectedHotbarIndex === idx;

            return (
              <button
                key={idx}
                onClick={() => onSelectHotbar(idx)}
                className={`relative w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-xl border-2 flex items-center justify-center transition-all cursor-pointer ${
                  isSelected 
                    ? 'border-yellow-400 bg-neutral-800 scale-105 shadow-[0_0_12px_rgba(250,204,21,0.6)]' 
                    : 'border-neutral-800 bg-neutral-950/80 hover:border-neutral-700'
                }`}
              >
                {/* Item Icon Component */}
                {slot ? (
                  <ItemIcon id={slot.item.id} fallbackIcon={slot.item.icon} size="md" />
                ) : null}

                {/* Stack Quantity Badge */}
                {slot && slot.quantity > 1 ? (
                  <span className="absolute bottom-0 right-0.5 text-[8px] sm:text-[9px] font-bold text-white tabular-nums drop-shadow-[0_1px_2px_rgba(0,0,0,1)]">
                    {slot.quantity}
                  </span>
                ) : null}
              </button>
            );
          })}

          {/* More menu button */}
          <button
            onClick={onOpenInventory}
            className="w-7 h-8 sm:w-8 sm:h-10 md:w-9 md:h-11 bg-neutral-900 hover:bg-neutral-800 border-2 border-neutral-700 rounded-xl flex items-center justify-center text-white font-bold text-xs cursor-pointer active:scale-95"
            title="Mochila Completa"
          >
            •••
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 9. BOTTOM-RIGHT: Attack & Sprint Buttons */}
      {/* ========================================================= */}
      <div className="absolute bottom-6 sm:bottom-8 right-4 sm:right-7 pr-[env(safe-area-inset-right)] pb-[env(safe-area-inset-bottom)] pointer-events-auto flex items-center gap-2 sm:gap-2.5">
        {/* Sprint / Roll Toggle Button */}
        <button
          onClick={() => onToggleSprint(!isSprinting)}
          onTouchStart={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleSprint(!isSprinting);
          }}
          className={`w-11 h-11 sm:w-13 sm:h-13 rounded-full border-2 flex flex-col items-center justify-center shadow-xl cursor-pointer active:scale-95 transition-all ${
            isSprinting 
              ? 'bg-amber-600 border-yellow-300 shadow-yellow-500/50' 
              : 'bg-black/85 border-neutral-700 text-neutral-300'
          }`}
          title="Correr"
        >
          <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
          <span className="text-[7px] sm:text-[8px] font-bold mt-0.5">{isSprinting ? 'CORRENDO' : 'CORRER'}</span>
        </button>

        {/* Action Button */}
        <button
          onClick={onAttack}
          onTouchStart={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onAttack();
          }}
          className={`w-13 h-13 sm:w-15 sm:h-15 active:scale-90 border-2 rounded-full flex flex-col items-center justify-center cursor-pointer transition-all ${
            isGun
              ? 'bg-gradient-to-tr from-amber-700 to-yellow-500 hover:from-amber-600 hover:to-yellow-400 border-yellow-300 shadow-[0_0_18px_rgba(245,158,11,0.7)]'
              : 'bg-gradient-to-tr from-red-700 to-rose-600 hover:from-red-600 hover:to-rose-500 border-yellow-400 shadow-[0_0_16px_rgba(239,68,68,0.7)]'
          }`}
          title={isGun ? `Disparar Arma (${ammoCount} munições)` : "Ação / Atacar / Interagir"}
        >
          {isGun ? (
            <>
              <ItemIcon id="pistol" size="sm" />
              <span className="text-[7px] sm:text-[8px] font-bold text-yellow-100 font-pixel mt-0.5 tabular-nums drop-shadow-[0_1px_2px_rgba(0,0,0,1)]">
                {ammoCount}
              </span>
            </>
          ) : (
            <>
              <Swords className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              <span className="text-[7px] sm:text-[8px] font-bold text-yellow-200 font-pixel mt-0.5">AÇÃO</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
