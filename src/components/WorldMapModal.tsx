import React from 'react';
import { WorldState } from '../game/types';
import { X, MapPin, Compass, ShieldAlert, Home, Sparkles } from 'lucide-react';
import { soundEngine } from '../game/audio';

interface WorldMapModalProps {
  world: WorldState;
  playerX: number;
  playerY: number;
  onClose: () => void;
}

export const WorldMapModal: React.FC<WorldMapModalProps> = ({
  world,
  playerX,
  playerY,
  onClose,
}) => {
  const mapWidthPx = world.width * world.tileSize;
  const mapHeightPx = world.height * world.tileSize;

  const playerPercentX = (playerX / mapWidthPx) * 100;
  const playerPercentY = (playerY / mapHeightPx) * 100;

  const basePercentX = (60 / world.width) * 100;
  const basePercentY = (60 / world.height) * 100;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-3">
      <div className="bg-[#171926] border-2 border-[#4b4e6d] rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#12141f] border-b border-[#2b2e42]">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-amber-400" />
            <h2 className="font-pixel text-sm md:text-base text-amber-400">MAPA DO MUNDO — LOST WORLD</h2>
          </div>
          <button
            onClick={() => {
              soundEngine.playUiClick();
              onClose();
            }}
            className="w-8 h-8 rounded-lg bg-[#25283b] hover:bg-rose-900/60 text-gray-300 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Map Area */}
        <div className="p-4 md:p-6 flex flex-col gap-4 overflow-y-auto">
          <div className="relative w-full aspect-video bg-[#1c2918] rounded-xl border-2 border-[#3b3e59] overflow-hidden shadow-inner">
            {/* Biomes Background Representation */}
            {/* 1. Lake & Beach (South West) */}
            <div className="absolute bottom-0 left-0 w-[45%] h-[40%] bg-[#214f7d] rounded-tr-[80px] border-t-4 border-r-4 border-[#d4ae61]" />

            {/* 2. Rocky Mountain (North) */}
            <div className="absolute top-0 left-0 right-0 h-[22%] bg-[#4f4f5c] border-b-2 border-[#3a3a42] flex items-center justify-around text-gray-400 text-[10px] font-pixel opacity-70">
              <span>▲ MONTANHAS ROCHOSAS & MINÉRIOS ▲</span>
            </div>

            {/* 3. Desert (East) */}
            <div className="absolute top-0 right-0 bottom-0 w-[22%] bg-[#b89553] border-l-2 border-[#94743c] flex items-center justify-center rotate-90 text-[#54411f] text-[10px] font-pixel opacity-80">
              DESERTO ÁRIDO
            </div>

            {/* 4. Ancient Ruins (North-West) */}
            <div className="absolute top-[22%] left-0 w-[28%] h-[35%] bg-[#363640] border-r-2 border-b-2 border-purple-900/60 p-2 flex flex-col justify-center items-center text-purple-300 text-[9px] font-pixel text-center">
              <ShieldAlert className="w-4 h-4 text-purple-400 mb-1" />
              RUÍNAS ANTIGAS
              <span className="text-[8px] text-red-400">(Área do Espectro)</span>
            </div>

            {/* 5. Central Forest Label */}
            <div className="absolute top-[52%] left-[48%] -translate-x-1/2 -translate-y-1/2 text-green-300/40 font-pixel text-xs pointer-events-none select-none">
              FLORESTA TEMPERADA
            </div>

            {/* Base Camp Marker */}
            <div
              className="absolute z-10 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer"
              style={{ left: `${basePercentX}%`, top: `${basePercentY}%` }}
            >
              <div className="w-6 h-6 bg-yellow-500 border-2 border-white rounded-full flex items-center justify-center text-black shadow-lg animate-bounce">
                <Home className="w-3.5 h-3.5" />
              </div>
              <span className="bg-black/80 px-1.5 py-0.5 rounded text-[8px] font-pixel text-yellow-300 mt-0.5">
                BASE
              </span>
            </div>

            {/* Player Marker */}
            <div
              className="absolute z-20 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none"
              style={{ left: `${playerPercentX}%`, top: `${playerPercentY}%` }}
            >
              <div className="w-4 h-4 bg-red-600 border-2 border-white rounded-full shadow-[0_0_8px_rgba(239,68,68,1)] animate-pulse" />
              <span className="bg-red-950/90 border border-red-500 px-1.5 py-0.5 rounded text-[8px] font-pixel text-white mt-0.5">
                VOCÊ
              </span>
            </div>
          </div>

          {/* Map Legend */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs bg-[#10121a] p-3 rounded-xl border border-[#26283b]">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-yellow-400" />
              <span className="text-gray-300">Base / Cabana</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-gray-300">Sua Posição</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-gray-300">Lago & Praia</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-purple-500" />
              <span className="text-gray-300">Ruínas do Chefe</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
