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
  Flame, 
  ChevronRight,
  ChevronDown,
  Sparkles,
  Maximize,
  Minimize
} from 'lucide-react';
import { soundEngine } from '../game/audio';

interface HUDProps {
  stats: PlayerStats;
  world: WorldState;
  quests: Quest[];
  inventory: (InventorySlot | null)[];
  selectedHotbarIndex: number;
  playerX: number;
  playerY: number;
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

  // Time format (e.g. 08:45)
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

  // True Multi-Touch Joystick Handlers (Tracks touch.identifier)
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
      {/* 1. TOP-LEFT CLUSTER: Player Avatar & 5 Compact Meters */}
      {/* ========================================================= */}
      <div className="absolute top-1.5 left-2 sm:top-2.5 sm:left-3 pl-[env(safe-area-inset-left)] pointer-events-auto flex items-start gap-1.5 sm:gap-2">
        {/* 16-Bit Pixel Art Avatar */}
        <div className="flex flex-col items-center">
          <div className="w-11 h-11 sm:w-14 sm:h-14 bg-[#141724] border-2 border-[#52567a] rounded-lg p-0.5 shadow-xl relative overflow-hidden flex items-center justify-center">
            {/* Detailed 16-Bit Anime Survivalist Face */}
            <svg viewBox="0 0 32 32" className="w-full h-full pixelated">
              {/* Background gradient */}
              <rect width="32" height="32" fill="#1b2033" />
              {/* Skin */}
              <rect x="7" y="11" width="18" height="15" fill="#ffd5b0" />
              {/* Red Hoodie Collar */}
              <rect x="4" y="24" width="24" height="8" fill="#c72323" />
              <rect x="13" y="24" width="6" height="8" fill="#1e1e24" />
              <rect x="14" y="26" width="1" height="5" fill="#ffffff" />
              <rect x="17" y="26" width="1" height="5" fill="#ffffff" />
              {/* Anime Spiky Black Hair */}
              <path d="M5 11 L10 4 L14 8 L18 3 L22 8 L27 5 L28 14 L26 18 L24 13 L22 15 L18 12 L14 15 L10 12 L8 16 L6 14 Z" fill="#18151c" />
              <path d="M10 6 L14 9 L18 5 L22 9 L25 7 L25 11 L21 10 L18 7 L14 10 L10 8 Z" fill="#322c3b" />
              {/* Eyes */}
              <rect x="9" y="16" width="4" height="4" fill="#0f111a" />
              <rect x="19" y="16" width="4" height="4" fill="#0f111a" />
              <rect x="10" y="16" width="2" height="2" fill="#ffffff" />
              <rect x="20" y="16" width="2" height="2" fill="#ffffff" />
              {/* Eyebrows */}
              <rect x="9" y="14" width="4" height="1" fill="#18151c" />
              <rect x="19" y="14" width="4" height="1" fill="#18151c" />
              {/* Blush */}
              <rect x="8" y="20" width="3" height="1" fill="#f87171" opacity="0.6" />
              <rect x="21" y="20" width="3" height="1" fill="#f87171" opacity="0.6" />
            </svg>
          </div>
          {/* Level Badge */}
          <div className="mt-0.5 px-1.5 py-0.2 bg-[#121420] border border-[#444866] rounded text-[9px] font-pixel text-yellow-400 font-bold shadow">
            Lv.{stats.level}
          </div>
        </div>

        {/* 5 Survival Meters (Compact 16-bit style) */}
        <div className="flex flex-col gap-0.5 w-28 sm:w-36 md:w-44 text-[9px] sm:text-[10px] font-bold">
          {/* 1. Health (Red) */}
          <div className={`flex items-center gap-1 bg-[#10121d]/90 px-1.5 py-0.2 rounded border shadow transition-colors ${stats.hp <= 25 ? 'border-red-500 animate-pulse bg-red-950/50' : 'border-[#2b2e42]'}`}>
            <Heart className={`w-3 h-3 text-red-500 fill-red-500 shrink-0 ${stats.hp <= 25 ? 'animate-bounce' : ''}`} />
            <div className="w-full bg-[#30161a] h-2 rounded-sm overflow-hidden relative border border-[#4a181f]">
              <div 
                className="h-full bg-gradient-to-r from-red-600 to-rose-400 transition-all duration-300"
                style={{ width: `${Math.max(0, (stats.hp / stats.maxHp) * 100)}%` }}
              />
            </div>
            <span className="text-[9px] text-red-200 tabular-nums w-10 text-right shrink-0">
              {Math.round(stats.hp)}
            </span>
          </div>

          {/* 2. Hunger (Orange) */}
          <div className={`flex items-center gap-1 bg-[#10121d]/90 px-1.5 py-0.2 rounded border shadow transition-colors ${stats.hunger <= 15 ? 'border-amber-500 animate-pulse bg-amber-950/50' : 'border-[#2b2e42]'}`}>
            <Utensils className="w-3 h-3 text-amber-500 shrink-0" />
            <div className="w-full bg-[#332212] h-2 rounded-sm overflow-hidden relative border border-[#523315]">
              <div 
                className="h-full bg-gradient-to-r from-amber-600 to-yellow-400 transition-all duration-300"
                style={{ width: `${Math.max(0, (stats.hunger / stats.maxHunger) * 100)}%` }}
              />
            </div>
            <span className="text-[9px] text-amber-200 tabular-nums w-10 text-right shrink-0">
              {Math.round(stats.hunger)}
            </span>
          </div>

          {/* 3. Thirst (Cyan) */}
          <div className={`flex items-center gap-1 bg-[#10121d]/90 px-1.5 py-0.2 rounded border shadow transition-colors ${stats.thirst <= 15 ? 'border-cyan-400 animate-pulse bg-cyan-950/50' : 'border-[#2b2e42]'}`}>
            <Droplets className="w-3 h-3 text-cyan-400 shrink-0" />
            <div className="w-full bg-[#122838] h-2 rounded-sm overflow-hidden relative border border-[#19405c]">
              <div 
                className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-300"
                style={{ width: `${Math.max(0, (stats.thirst / stats.maxThirst) * 100)}%` }}
              />
            </div>
            <span className="text-[9px] text-cyan-200 tabular-nums w-10 text-right shrink-0">
              {Math.round(stats.thirst)}
            </span>
          </div>

          {/* 4. Energy (Yellow) */}
          <div className="flex items-center gap-1 bg-[#10121d]/90 px-1.5 py-0.2 rounded border border-[#2b2e42] shadow">
            <Zap className="w-3 h-3 text-yellow-400 fill-yellow-400 shrink-0" />
            <div className="w-full bg-[#383314] h-2 rounded-sm overflow-hidden relative border border-[#5c541c]">
              <div 
                className="h-full bg-gradient-to-r from-yellow-600 to-amber-300 transition-all duration-300"
                style={{ width: `${Math.max(0, (stats.energy / stats.maxEnergy) * 100)}%` }}
              />
            </div>
            <span className="text-[9px] text-yellow-200 tabular-nums w-10 text-right shrink-0">
              {Math.round(stats.energy)}
            </span>
          </div>

          {/* 5. Temperature (Purple / 36°C) */}
          <div className={`flex items-center gap-1 bg-[#10121d]/90 px-1.5 py-0.2 rounded border shadow transition-colors ${(stats.bodyTemp < 24 || stats.bodyTemp > 41) ? 'border-orange-500 animate-pulse bg-orange-950/50' : 'border-[#2b2e42]'}`}>
            <Thermometer className="w-3 h-3 text-purple-400 shrink-0" />
            <div className="w-full bg-[#2b1636] h-2 rounded-sm overflow-hidden relative border border-[#48205c]">
              <div 
                className="h-full bg-gradient-to-r from-purple-600 to-fuchsia-400 transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(0, ((stats.bodyTemp - 20) / 25) * 100))}%` }}
              />
            </div>
            <span className="text-[9px] text-purple-200 tabular-nums w-10 text-right shrink-0">
              {stats.bodyTemp.toFixed(1)}°
            </span>
          </div>

          {/* 6. Breath / Fôlego Meter (Displays when swimming or breath < 100) */}
          {(stats.breath ?? 100) < 100 && (
            <div className="flex items-center gap-1 bg-[#0a1b2a]/95 px-1.5 py-0.2 rounded border border-[#0284c7] shadow animate-pulse">
              <span className="text-[10px] leading-none shrink-0">🫧</span>
              <div className="w-full bg-[#082f49] h-2 rounded-sm overflow-hidden relative border border-[#0369a1]">
                <div 
                  className="h-full bg-gradient-to-r from-sky-500 to-cyan-300 transition-all duration-150"
                  style={{ width: `${Math.max(0, ((stats.breath ?? 100) / (stats.maxBreath ?? 100)) * 100)}%` }}
                />
              </div>
              <span className="text-[9px] text-cyan-200 tabular-nums w-10 text-right shrink-0">
                {Math.round(stats.breath ?? 100)}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. TOP-RIGHT CLUSTER: Clock, Fullscreen, Pause, Minimap */}
      {/* ========================================================= */}
      <div className="absolute top-1.5 right-2 sm:top-2.5 sm:right-3 pr-[env(safe-area-inset-right)] pointer-events-auto flex items-start gap-1 sm:gap-1.5">
        {/* Day & Time Pill */}
        <div className="flex items-center gap-1.5 bg-[#121521]/95 px-2 py-1 rounded-lg border border-[#3b3e59] shadow-lg">
          <WeatherIcon className={`w-3.5 h-3.5 ${world.weather === 'rain' ? 'text-cyan-400' : 'text-amber-400'}`} />
          <div className="flex flex-col">
            <span className="text-[8px] font-pixel text-yellow-400">Dia {world.dayCount}</span>
            <span className="text-[10px] font-bold text-gray-200 tabular-nums leading-none">{timeFormatted}</span>
          </div>
        </div>

        {/* Fullscreen Button */}
        <button 
          onClick={toggleFullscreen}
          className="w-8 h-8 sm:w-9 sm:h-9 bg-[#1a1d2e] hover:bg-[#252a42] active:scale-95 border border-[#4b4e6d] rounded-lg flex items-center justify-center text-yellow-300 shadow cursor-pointer"
          title={isFullscreen ? 'Sair da Tela Cheia' : 'Modo Tela Cheia (F11)'}
        >
          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
        </button>

        {/* Pause Button */}
        <button 
          onClick={onPause}
          className="w-8 h-8 sm:w-9 sm:h-9 bg-[#1a1d2e] hover:bg-[#252a42] active:scale-95 border border-[#4b4e6d] rounded-lg flex items-center justify-center text-gray-200 shadow cursor-pointer"
          title="Pausar Jogo (Esc)"
        >
          <Pause className="w-4 h-4 fill-current" />
        </button>

        {/* Mini-map Radar */}
        <div 
          onClick={onOpenMap}
          className="w-12 h-12 sm:w-14 sm:h-14 bg-[#162319] border-2 border-[#52567a] rounded-lg overflow-hidden relative shadow-lg cursor-pointer group"
          title="Abrir Mapa (M)"
        >
          <div className="absolute bottom-0 left-0 w-5 h-5 bg-[#224e75] rounded-tr-full opacity-80" />
          <div className="absolute top-0 right-0 w-3 h-full bg-[#a38048] opacity-60" />
          <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-yellow-400 rounded-sm animate-ping" />
          <div 
            className="absolute w-2 h-2 bg-red-500 border border-white rounded-full shadow"
            style={{
              left: `${Math.min(90, Math.max(10, (playerX / (world.width * 48)) * 100))}%`,
              top: `${Math.min(90, Math.max(10, (playerY / (world.height * 48)) * 100))}%`,
            }}
          />
          <div className="absolute bottom-0 inset-x-0 bg-black/70 text-[7px] text-center text-gray-300 font-pixel py-0.1">
            MAPA
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. LEFT-SIDE: Compact Collapsible Quest Card */}
      {/* ========================================================= */}
      {activeQuest && (
        <div className="absolute top-[62px] sm:top-[74px] left-2 sm:left-3 pl-[env(safe-area-inset-left)] pointer-events-auto max-w-[175px] sm:max-w-[220px]">
          <div 
            onClick={() => setIsQuestCollapsed(!isQuestCollapsed)}
            className="bg-[#141724]/90 hover:bg-[#1a1e2e] border border-[#474b69] rounded-lg p-1.5 shadow-lg cursor-pointer transition-all duration-150"
          >
            <div className="flex items-center gap-1 text-yellow-400 font-bold text-[9px] sm:text-[10px]">
              <span className="w-3.5 h-3.5 bg-yellow-500/20 text-yellow-400 rounded-full flex items-center justify-center text-[8px]">!</span>
              <span className="truncate">{activeQuest.title}</span>
              <span className="text-yellow-300 ml-auto shrink-0 font-pixel text-[8px]">
                {activeQuest.currentCount}/{activeQuest.targetCount}
              </span>
              {isQuestCollapsed ? <ChevronRight className="w-3 h-3 text-gray-400 shrink-0" /> : <ChevronDown className="w-3 h-3 text-gray-400 shrink-0" />}
            </div>
            {!isQuestCollapsed && (
              <div 
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenQuests();
                }}
                className="text-[9px] text-gray-300 mt-1 leading-tight line-clamp-2 hover:text-white"
              >
                {activeQuest.description}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. RIGHT-SIDE: Vertical Menu Icons (Backpack, Craft, Build, Skills) */}
      {/* ========================================================= */}
      <div className="absolute top-[62px] sm:top-[70px] right-2 sm:right-3 pr-[env(safe-area-inset-right)] pointer-events-auto flex flex-col gap-1.5 items-end">
        {/* Inventory */}
        <button
          onClick={onOpenInventory}
          className="w-9 h-9 sm:w-10 sm:h-10 bg-[#202436]/90 hover:bg-[#2c324b] active:scale-95 border-2 border-[#595d82] rounded-xl shadow-lg flex items-center justify-center text-amber-200 cursor-pointer"
          title="Mochila / Inventário (E)"
        >
          <Backpack className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
        </button>

        {/* Crafting */}
        <button
          onClick={onOpenCrafting}
          className="w-9 h-9 sm:w-10 sm:h-10 bg-[#202436]/90 hover:bg-[#2c324b] active:scale-95 border-2 border-[#595d82] rounded-xl shadow-lg flex items-center justify-center text-yellow-200 cursor-pointer"
          title="Fabricação (C)"
        >
          <Hammer className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
        </button>

        {/* Building */}
        <button
          onClick={onOpenBuilding}
          className="w-9 h-9 sm:w-10 sm:h-10 bg-[#202436]/90 hover:bg-[#2c324b] active:scale-95 border-2 border-[#595d82] rounded-xl shadow-lg flex items-center justify-center text-emerald-200 cursor-pointer"
          title="Construção (B)"
        >
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
        </button>

        {/* Skills */}
        <button
          onClick={onOpenSkills}
          className="w-9 h-9 sm:w-10 sm:h-10 bg-[#202436]/90 hover:bg-[#2c324b] active:scale-95 border-2 border-[#595d82] rounded-xl shadow-lg flex items-center justify-center text-purple-200 cursor-pointer relative"
          title="Habilidades (K)"
        >
          <Award className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
          {stats.skillPoints > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-purple-600 border border-white text-white rounded-full text-[8px] flex items-center justify-center font-bold">
              {stats.skillPoints}
            </span>
          )}
        </button>
      </div>

      {/* ========================================================= */}
      {/* 5. BOTTOM-LEFT: Virtual Joystick (Elevated & 100% On-Screen) */}
      {/* ========================================================= */}
      <div className="absolute bottom-7 sm:bottom-9 left-4 sm:left-7 pl-[env(safe-area-inset-left)] pb-[env(safe-area-inset-bottom)] pointer-events-auto">
        <div 
          className="relative w-24 h-24 sm:w-28 sm:h-28 bg-black/55 backdrop-blur-sm border-2 border-white/30 rounded-full flex items-center justify-center touch-none shadow-[0_4px_24px_rgba(0,0,0,0.7)] select-none"
          onTouchStart={handleJoystickTouchStart}
          onTouchMove={handleJoystickTouchMove}
          onTouchEnd={handleJoystickTouchEnd}
        >
          {/* D-Pad Directional Arrows matching reference */}
          <span className="absolute top-1 text-[10px] text-white/50 font-bold select-none pointer-events-none">▲</span>
          <span className="absolute bottom-1 text-[10px] text-white/50 font-bold select-none pointer-events-none">▼</span>
          <span className="absolute left-1.5 text-[10px] text-white/50 font-bold select-none pointer-events-none">◀</span>
          <span className="absolute right-1.5 text-[10px] text-white/50 font-bold select-none pointer-events-none">▶</span>

          {/* Inner stick / Thumb knob */}
          <div 
            className="w-10 h-10 sm:w-12 sm:h-12 bg-white/40 hover:bg-white/50 border-2 border-white/70 rounded-full shadow-lg transition-transform duration-75 flex items-center justify-center pointer-events-none"
            style={{
              transform: joystickCurrent && joystickStart 
                ? `translate(${joystickCurrent.x - joystickStart.x}px, ${joystickCurrent.y - joystickStart.y}px)` 
                : 'translate(0px, 0px)',
            }}
          >
            <div className="w-3 h-3 bg-white/70 rounded-full shadow-inner" />
          </div>
          <span className="absolute -bottom-4 text-[8px] font-pixel text-yellow-300/80 drop-shadow">MOVER</span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 6. BOTTOM-CENTER: 8-Slot Hotbar (Guaranteed Visible) */}
      {/* ========================================================= */}
      <div className="absolute bottom-1.5 sm:bottom-2.5 left-1/2 -translate-x-1/2 pb-[env(safe-area-inset-bottom)] pointer-events-auto z-10">
        <div className="flex items-center gap-1 sm:gap-1.5 bg-[#141724]/95 p-1 sm:p-1.5 rounded-xl border-2 border-[#4b4e6d] shadow-2xl">
          {Array.from({ length: 8 }).map((_, idx) => {
            const slot = inventory[idx];
            const isSelected = selectedHotbarIndex === idx;

            return (
              <button
                key={idx}
                onClick={() => onSelectHotbar(idx)}
                className={`relative w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 bg-[#202436] rounded-lg border-2 flex items-center justify-center transition-all cursor-pointer ${
                  isSelected 
                    ? 'border-yellow-400 bg-[#323854] scale-105 shadow-[0_0_12px_rgba(250,204,21,0.6)]' 
                    : 'border-[#3b3f5c] hover:border-[#60658a]'
                }`}
              >
                {/* Number Key 1-8 */}
                <span className="absolute top-0.5 left-0.5 text-[8px] sm:text-[9px] font-pixel text-yellow-300/80">
                  {idx + 1}
                </span>

                {/* Item Icon */}
                {slot ? (
                  <span className="text-base sm:text-lg md:text-xl select-none leading-none">
                    {slot.item.icon}
                  </span>
                ) : null}

                {/* Stack Quantity Badge */}
                {slot && slot.quantity > 1 ? (
                  <span className="absolute bottom-0 right-0.5 text-[9px] sm:text-[10px] font-bold text-white tabular-nums drop-shadow-[0_1px_2px_rgba(0,0,0,1)]">
                    {slot.quantity}
                  </span>
                ) : null}
              </button>
            );
          })}

          {/* More menu button */}
          <button
            onClick={onOpenInventory}
            className="w-7 h-8 sm:w-8 sm:h-10 md:w-9 md:h-11 bg-[#1b1e2e] hover:bg-[#252a40] border-2 border-[#3b3f5c] rounded-lg flex items-center justify-center text-gray-300 font-bold text-[10px] cursor-pointer"
            title="Inventário Completo"
          >
            •••
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 7. BOTTOM-RIGHT: Attack & Sprint Buttons (Guaranteed Visible) */}
      {/* ========================================================= */}
      <div className="absolute bottom-7 sm:bottom-9 right-4 sm:right-7 pr-[env(safe-area-inset-right)] pb-[env(safe-area-inset-bottom)] pointer-events-auto flex items-center gap-2 sm:gap-2.5">
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
              ? 'bg-amber-600 border-yellow-300 shadow-yellow-500/40' 
              : 'bg-[#1e2235] border-[#4b4e6d] text-gray-300'
          }`}
          title="Correr / Rolar (Shift)"
        >
          <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
          <span className="text-[7px] sm:text-[8px] font-bold mt-0.5">{isSprinting ? 'CORRENDO' : 'CORRER'}</span>
        </button>

        {/* Attack / Action Button */}
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
              : 'bg-gradient-to-tr from-red-700 to-rose-500 hover:from-red-600 hover:to-rose-400 border-yellow-400 shadow-[0_0_16px_rgba(239,68,68,0.6)]'
          }`}
          title={isGun ? `Disparar Arma (${ammoCount} munições restantes)` : "Atacar / Interagir (Espaço / Toque)"}
        >
          {isGun ? (
            <>
              <span className="text-xl sm:text-2xl leading-none select-none">🔫</span>
              <span className="text-[7px] sm:text-[8px] font-bold text-yellow-100 font-pixel mt-0.5 tabular-nums drop-shadow-[0_1px_2px_rgba(0,0,0,1)]">
                {ammoCount} BALAS
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
