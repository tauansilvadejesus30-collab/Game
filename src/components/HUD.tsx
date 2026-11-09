import React, { useState } from 'react';
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
  Map as MapIcon, 
  Award, 
  Swords, 
  Flame, 
  ChevronRight,
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
  const [touchActive, setTouchActive] = useState(false);
  const [joystickStart, setJoystickStart] = useState<{ x: number; y: number } | null>(null);
  const [joystickCurrent, setJoystickCurrent] = useState<{ x: number; y: number } | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);

  React.useEffect(() => {
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

  // Time format (e.g. 18:45)
  const hours = Math.floor(world.timeOfDay / 60);
  const minutes = Math.floor(world.timeOfDay % 60);
  const timeFormatted = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

  // Weather icon
  const isNight = world.timeOfDay >= 19 * 60 || world.timeOfDay < 5 * 60;
  const WeatherIcon = world.weather === 'rain' || world.weather === 'thunderstorm' 
    ? CloudRain 
    : world.weather === 'cloudy' 
      ? Cloud 
      : Sun;

  // Touch joystick handlers
  const handleJoystickTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setJoystickStart({ x: touch.clientX, y: touch.clientY });
    setJoystickCurrent({ x: touch.clientX, y: touch.clientY });
    setTouchActive(true);
  };

  const handleJoystickTouchMove = (e: React.TouchEvent) => {
    if (!joystickStart) return;
    const touch = e.touches[0];
    const dx = touch.clientX - joystickStart.x;
    const dy = touch.clientY - joystickStart.y;
    const dist = Math.hypot(dx, dy);
    const maxRadius = 45;
    const clampedDist = Math.min(dist, maxRadius);
    const angle = Math.atan2(dy, dx);

    const nx = Math.cos(angle) * (clampedDist / maxRadius);
    const ny = Math.sin(angle) * (clampedDist / maxRadius);

    setJoystickCurrent({
      x: joystickStart.x + Math.cos(angle) * clampedDist,
      y: joystickStart.y + Math.sin(angle) * clampedDist,
    });
    onJoystickMove({ x: nx, y: ny });
  };

  const handleJoystickTouchEnd = () => {
    setJoystickStart(null);
    setJoystickCurrent(null);
    setTouchActive(false);
    onJoystickMove({ x: 0, y: 0 });
  };

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-10 flex flex-col justify-between p-3 md:p-5">
      {/* --- TOP ROW: Status Cluster & Minimap / Time --- */}
      <div className="flex justify-between items-start w-full gap-2">
        {/* Left: Player Profile & 5 Survival Bars (Matching User Reference Image!) */}
        <div className="flex items-start gap-2.5 pointer-events-auto">
          {/* Avatar Box */}
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-[#1a1c29] border-2 border-[#4b4e6d] rounded-lg p-0.5 shadow-xl relative overflow-hidden flex items-center justify-center">
              {/* Pixel art head thumbnail */}
              <div className="w-10 h-10 bg-[#ffd1a4] relative rounded-sm shadow-inner">
                {/* Anime Messy Black Hair */}
                <div className="absolute -top-2 -left-1 w-12 h-6 bg-[#18151c] rounded-t-sm" />
                <div className="absolute top-2 left-1 w-2.5 h-2.5 bg-[#111111] rounded-sm" />
                <div className="absolute top-2 right-1 w-2.5 h-2.5 bg-[#111111] rounded-sm" />
                {/* Red hoodie collar */}
                <div className="absolute bottom-0 inset-x-0 h-3 bg-[#c72323]" />
              </div>
            </div>
            {/* Level Badge */}
            <div className="mt-1 px-2.5 py-0.5 bg-[#151722] border border-[#3b3e59] rounded-md text-[10px] md:text-xs font-pixel text-yellow-400 font-bold shadow">
              Lv. {stats.level}
            </div>
          </div>

          {/* 5 Status Meters (Life, Hunger, Thirst, Energy, Temperature) */}
          <div className="flex flex-col gap-1 w-36 md:w-48 text-[11px] font-bold">
            {/* 1. Health (Red) */}
            <div className="flex items-center gap-1.5 bg-[#11131c]/90 px-2 py-0.5 rounded-md border border-[#2b2e42] shadow">
              <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 shrink-0" />
              <div className="w-full bg-[#30161a] h-2.5 rounded-sm overflow-hidden relative border border-[#4a181f]">
                <div 
                  className="h-full bg-gradient-to-r from-red-600 to-rose-400 transition-all duration-300"
                  style={{ width: `${Math.max(0, (stats.hp / stats.maxHp) * 100)}%` }}
                />
              </div>
              <span className="text-[10px] text-red-200 tabular-nums w-12 text-right">
                {Math.round(stats.hp)}/{stats.maxHp}
              </span>
            </div>

            {/* 2. Hunger (Orange) */}
            <div className="flex items-center gap-1.5 bg-[#11131c]/90 px-2 py-0.5 rounded-md border border-[#2b2e42] shadow">
              <Utensils className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <div className="w-full bg-[#332212] h-2.5 rounded-sm overflow-hidden relative border border-[#523315]">
                <div 
                  className="h-full bg-gradient-to-r from-amber-600 to-yellow-400 transition-all duration-300"
                  style={{ width: `${Math.max(0, (stats.hunger / stats.maxHunger) * 100)}%` }}
                />
              </div>
              <span className="text-[10px] text-amber-200 tabular-nums w-12 text-right">
                {Math.round(stats.hunger)}/{stats.maxHunger}
              </span>
            </div>

            {/* 3. Thirst (Cyan) */}
            <div className="flex items-center gap-1.5 bg-[#11131c]/90 px-2 py-0.5 rounded-md border border-[#2b2e42] shadow">
              <Droplets className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <div className="w-full bg-[#122838] h-2.5 rounded-sm overflow-hidden relative border border-[#19405c]">
                <div 
                  className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-300"
                  style={{ width: `${Math.max(0, (stats.thirst / stats.maxThirst) * 100)}%` }}
                />
              </div>
              <span className="text-[10px] text-cyan-200 tabular-nums w-12 text-right">
                {Math.round(stats.thirst)}/{stats.maxThirst}
              </span>
            </div>

            {/* 4. Energy (Yellow) */}
            <div className="flex items-center gap-1.5 bg-[#11131c]/90 px-2 py-0.5 rounded-md border border-[#2b2e42] shadow">
              <Zap className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400 shrink-0" />
              <div className="w-full bg-[#383314] h-2.5 rounded-sm overflow-hidden relative border border-[#5c541c]">
                <div 
                  className="h-full bg-gradient-to-r from-yellow-600 to-amber-300 transition-all duration-300"
                  style={{ width: `${Math.max(0, (stats.energy / stats.maxEnergy) * 100)}%` }}
                />
              </div>
              <span className="text-[10px] text-yellow-200 tabular-nums w-12 text-right">
                {Math.round(stats.energy)}/{stats.maxEnergy}
              </span>
            </div>

            {/* 5. Temperature (Purple / 36°C) */}
            <div className="flex items-center gap-1.5 bg-[#11131c]/90 px-2 py-0.5 rounded-md border border-[#2b2e42] shadow">
              <Thermometer className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <div className="w-full bg-[#2b1636] h-2.5 rounded-sm overflow-hidden relative border border-[#48205c]">
                <div 
                  className="h-full bg-gradient-to-r from-purple-600 to-fuchsia-400 transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(0, ((stats.bodyTemp - 20) / 25) * 100))}%` }}
                />
              </div>
              <span className="text-[10px] text-purple-200 tabular-nums w-12 text-right">
                {stats.bodyTemp.toFixed(1)}°C
              </span>
            </div>
          </div>
        </div>

        {/* Top Center: Game Branding Badge */}
        <div className="hidden lg:flex flex-col items-center">
          <div className="bg-black/60 px-4 py-1 rounded-full border border-yellow-600/40 flex items-center gap-2 shadow-2xl backdrop-blur-none">
            <Flame className="w-4 h-4 text-amber-500 animate-pulse" />
            <span className="font-pixel text-xs text-amber-400 tracking-wider">LOST WORLD</span>
            <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Sobrevivência</span>
          </div>
        </div>

        {/* Top Right: Clock, Weather, Pause Button & Minimap Radar */}
        <div className="flex items-start gap-2 pointer-events-auto">
          {/* Day & Time Pill */}
          <div className="flex items-center gap-2 bg-[#121521]/95 px-3 py-1.5 rounded-lg border border-[#3b3e59] shadow-xl">
            <WeatherIcon className={`w-4 h-4 ${world.weather === 'rain' ? 'text-cyan-400' : 'text-amber-400'}`} />
            <div className="flex flex-col">
              <span className="text-[10px] font-pixel text-yellow-400">Dia {world.dayCount}</span>
              <span className="text-xs font-bold text-gray-200 tabular-nums">{timeFormatted}</span>
            </div>
          </div>

          {/* Fullscreen Button */}
          <button 
            onClick={toggleFullscreen}
            className="w-10 h-10 bg-[#1a1d2e] hover:bg-[#252a42] active:scale-95 border-2 border-[#4b4e6d] rounded-lg flex items-center justify-center text-yellow-300 shadow-xl cursor-pointer"
            title={isFullscreen ? 'Sair da Tela Cheia' : 'Modo Tela Cheia (F11)'}
          >
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>

          {/* Pause Button */}
          <button 
            onClick={onPause}
            className="w-10 h-10 bg-[#1a1d2e] hover:bg-[#252a42] active:scale-95 border-2 border-[#4b4e6d] rounded-lg flex items-center justify-center text-gray-200 shadow-xl cursor-pointer"
            title="Pausar Jogo (Esc)"
          >
            <Pause className="w-5 h-5 fill-current" />
          </button>

          {/* Mini-map Radar */}
          <div 
            onClick={onOpenMap}
            className="w-16 h-16 md:w-20 md:h-20 bg-[#162319] border-2 border-[#52567a] rounded-lg overflow-hidden relative shadow-2xl cursor-pointer group"
            title="Abrir Mapa (M)"
          >
            {/* Water lake in corner */}
            <div className="absolute bottom-0 left-0 w-8 h-8 bg-[#224e75] rounded-tr-full opacity-80" />
            {/* Desert in east */}
            <div className="absolute top-0 right-0 w-4 h-full bg-[#a38048] opacity-60" />
            {/* Base camp yellow marker */}
            <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-yellow-400 rounded-sm animate-ping" />
            {/* Player red pointer */}
            <div 
              className="absolute w-2.5 h-2.5 bg-red-500 border border-white rounded-full shadow"
              style={{
                left: `${(playerX / (world.width * world.tileSize)) * 100}%`,
                top: `${(playerY / (world.height * world.tileSize)) * 100}%`,
                transform: 'translate(-50%, -50%)',
              }}
            />
            <div className="absolute bottom-0 inset-x-0 bg-black/60 text-[8px] text-center text-gray-300 font-pixel py-0.2">
              MAPA
            </div>
          </div>
        </div>
      </div>

      {/* --- MIDDLE ROW: Left Quest Tracker & Right Action Buttons --- */}
      <div className="flex justify-between items-center w-full mt-2">
        {/* Left: Quest Card */}
        {activeQuest && (
          <div 
            onClick={onOpenQuests}
            className="pointer-events-auto bg-[#141724]/90 hover:bg-[#1a1e2e] border-2 border-[#474b69] rounded-lg p-2.5 max-w-[210px] md:max-w-xs shadow-2xl cursor-pointer transition-all duration-150"
          >
            <div className="flex items-center gap-1.5 text-yellow-400 font-bold text-[11px] md:text-xs">
              <span className="w-4 h-4 bg-yellow-500/20 text-yellow-400 rounded-full flex items-center justify-center text-[10px]">!</span>
              <span>Missão Principal</span>
              <ChevronRight className="w-3.5 h-3.5 ml-auto text-gray-400" />
            </div>
            <div className="text-[11px] text-gray-200 mt-1 font-medium leading-tight">
              {activeQuest.title}
            </div>
            <div className="flex items-center justify-between text-[10px] text-gray-400 mt-1">
              <span>{activeQuest.description}</span>
              <span className="font-bold text-yellow-300 ml-1 shrink-0">
                ({activeQuest.currentCount} / {activeQuest.targetCount})
              </span>
            </div>
          </div>
        )}

        {/* Right: Round Action Buttons (Inventário, Construir, Mapa, Habilidades) */}
        <div className="flex flex-col gap-2 pointer-events-auto items-end">
          <button
            onClick={onOpenInventory}
            className="flex items-center gap-2 bg-[#202436] hover:bg-[#2c324b] active:scale-95 border-2 border-[#595d82] p-2 rounded-xl shadow-xl text-amber-200 cursor-pointer"
            title="Inventário (E)"
          >
            <Backpack className="w-5 h-5 text-amber-400" />
            <span className="text-[11px] font-bold hidden md:inline">Inventário</span>
          </button>

          <button
            onClick={onOpenCrafting}
            className="flex items-center gap-2 bg-[#202436] hover:bg-[#2c324b] active:scale-95 border-2 border-[#595d82] p-2 rounded-xl shadow-xl text-yellow-200 cursor-pointer"
            title="Fabricação (C)"
          >
            <Hammer className="w-5 h-5 text-yellow-400" />
            <span className="text-[11px] font-bold hidden md:inline">Fabricar</span>
          </button>

          <button
            onClick={onOpenBuilding}
            className="flex items-center gap-2 bg-[#202436] hover:bg-[#2c324b] active:scale-95 border-2 border-[#595d82] p-2 rounded-xl shadow-xl text-emerald-200 cursor-pointer"
            title="Construção (B)"
          >
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <span className="text-[11px] font-bold hidden md:inline">Construir</span>
          </button>

          <button
            onClick={onOpenSkills}
            className="flex items-center gap-2 bg-[#202436] hover:bg-[#2c324b] active:scale-95 border-2 border-[#595d82] p-2 rounded-xl shadow-xl text-purple-200 cursor-pointer"
            title="Habilidades (K)"
          >
            <Award className="w-5 h-5 text-purple-400" />
            <span className="text-[11px] font-bold hidden md:inline">Habilidades</span>
            {stats.skillPoints > 0 && (
              <span className="w-4 h-4 bg-purple-600 text-white rounded-full text-[9px] flex items-center justify-center font-bold">
                {stats.skillPoints}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* --- BOTTOM ROW: Virtual Joystick (Left) + Hotbar (Center) + Attack/Sprint Buttons (Right) --- */}
      <div className="flex justify-between items-end w-full pb-2 px-2 md:px-4">
        {/* Left: Mobile Touch Virtual Joystick (Elevated for ergonomic landscape play) */}
        <div className="mb-12 sm:mb-14 md:mb-16 ml-1 sm:ml-3 pointer-events-auto">
          <div 
            className="relative w-28 h-28 sm:w-32 sm:h-32 bg-black/55 backdrop-blur-sm border-2 border-white/30 rounded-full flex items-center justify-center touch-none shadow-[0_4px_24px_rgba(0,0,0,0.7)] select-none"
            onTouchStart={handleJoystickTouchStart}
            onTouchMove={handleJoystickTouchMove}
            onTouchEnd={handleJoystickTouchEnd}
          >
            {/* D-Pad Directional Arrows matching reference */}
            <span className="absolute top-1.5 text-[11px] text-white/50 font-bold select-none pointer-events-none">▲</span>
            <span className="absolute bottom-1.5 text-[11px] text-white/50 font-bold select-none pointer-events-none">▼</span>
            <span className="absolute left-2 text-[11px] text-white/50 font-bold select-none pointer-events-none">◀</span>
            <span className="absolute right-2 text-[11px] text-white/50 font-bold select-none pointer-events-none">▶</span>

            {/* Inner stick / Thumb knob */}
            <div 
              className="w-12 h-12 bg-white/40 hover:bg-white/50 border-2 border-white/70 rounded-full shadow-lg transition-transform duration-75 flex items-center justify-center pointer-events-none"
              style={{
                transform: joystickCurrent && joystickStart 
                  ? `translate(${joystickCurrent.x - joystickStart.x}px, ${joystickCurrent.y - joystickStart.y}px)` 
                  : 'translate(0px, 0px)',
              }}
            >
              <div className="w-3.5 h-3.5 bg-white/70 rounded-full shadow-inner" />
            </div>
            <span className="absolute -bottom-5 text-[9px] font-pixel text-yellow-300/80 drop-shadow">MOVER</span>
          </div>
        </div>

        {/* Center: 8-Slot Hotbar (Matching Reference Image) */}
        <div className="pointer-events-auto flex items-center gap-1 md:gap-1.5 bg-[#141724]/95 p-1.5 md:p-2 rounded-xl border-2 border-[#4b4e6d] shadow-2xl">
          {Array.from({ length: 8 }).map((_, idx) => {
            const slot = inventory[idx];
            const isSelected = selectedHotbarIndex === idx;

            return (
              <button
                key={idx}
                onClick={() => onSelectHotbar(idx)}
                className={`relative w-10 h-10 md:w-12 md:h-12 bg-[#202436] rounded-lg border-2 flex items-center justify-center transition-all cursor-pointer ${
                  isSelected 
                    ? 'border-yellow-400 bg-[#323854] scale-105 shadow-[0_0_12px_rgba(250,204,21,0.6)]' 
                    : 'border-[#3b3f5c] hover:border-[#60658a]'
                }`}
              >
                {/* Number Key 1-8 */}
                <span className="absolute top-0.5 left-1 text-[9px] font-pixel text-yellow-300/80">
                  {idx + 1}
                </span>

                {/* Item Icon */}
                {slot ? (
                  <span className="text-xl md:text-2xl select-none leading-none">
                    {slot.item.icon}
                  </span>
                ) : null}

                {/* Stack Quantity Badge */}
                {slot && slot.quantity > 1 ? (
                  <span className="absolute bottom-0.5 right-1 text-[10px] md:text-xs font-bold text-white tabular-nums drop-shadow-[0_1px_2px_rgba(0,0,0,1)]">
                    {slot.quantity}
                  </span>
                ) : null}
              </button>
            );
          })}

          {/* More menu button */}
          <button
            onClick={onOpenInventory}
            className="w-8 h-10 md:w-9 md:h-12 bg-[#1b1e2e] hover:bg-[#252a40] border-2 border-[#3b3f5c] rounded-lg flex items-center justify-center text-gray-300 font-bold text-xs cursor-pointer"
            title="Inventário Completo"
          >
            •••
          </button>
        </div>

        {/* Right: Melee Attack & Sprint/Roll Touch Buttons */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Sprint / Roll Toggle Button */}
          <button
            onClick={() => onToggleSprint(!isSprinting)}
            className={`w-12 h-12 md:w-14 md:h-14 rounded-full border-2 flex flex-col items-center justify-center shadow-xl cursor-pointer active:scale-95 transition-all ${
              isSprinting 
                ? 'bg-amber-600 border-yellow-300 shadow-yellow-500/40' 
                : 'bg-[#1e2235] border-[#4b4e6d] text-gray-300'
            }`}
            title="Correr / Rolar (Shift)"
          >
            <Zap className="w-5 h-5 text-yellow-400" />
            <span className="text-[8px] font-bold mt-0.5">{isSprinting ? 'CORRENDO' : 'CORRER'}</span>
          </button>

          {/* Attack / Use Big Action Button */}
          <button
            onClick={onAttack}
            className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-tr from-red-700 to-rose-500 hover:from-red-600 hover:to-rose-400 active:scale-90 border-2 border-yellow-400 rounded-full flex flex-col items-center justify-center shadow-[0_0_16px_rgba(239,68,68,0.5)] cursor-pointer"
            title="Atacar / Interagir (Espaço / Clique)"
          >
            <Swords className="w-6 h-6 md:w-7 md:h-7 text-white" />
            <span className="text-[8px] font-bold text-yellow-200 font-pixel mt-0.5">AÇÃO</span>
          </button>
        </div>
      </div>
    </div>
  );
};
