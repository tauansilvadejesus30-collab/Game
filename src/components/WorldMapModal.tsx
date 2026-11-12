import React from 'react';
import { WorldState } from '../game/types';
import { X, Compass, ShieldAlert, Home, Sparkles } from 'lucide-react';
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
  const isInsideCave = world.width === 60; // Cave world is 60x60
  const mapWidthPx = world.width * world.tileSize;
  const mapHeightPx = world.height * world.tileSize;

  const playerPercentX = (playerX / mapWidthPx) * 100;
  const playerPercentY = (playerY / mapHeightPx) * 100;

  const basePercentX = (60 / world.width) * 100;
  const basePercentY = (60 / world.height) * 100;

  // Cave locations in Overworld
  const caveLocations = [
    { name: 'Caverna Inicial', tx: 65, ty: 52 },
    { name: 'Caverna da Montanha', tx: 38, ty: 28 },
    { name: 'Caverna da Neve', tx: 130, ty: 24 },
    { name: 'Caverna do Deserto', tx: 195, ty: 88 },
  ];

  return (
    <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-3 select-none touch-none">
      <div className="bg-neutral-950 border-2 border-neutral-700/80 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden font-sans">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-black border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-cyan-400" />
            <h2 className="font-pixel text-xs sm:text-sm text-white">
              {isInsideCave ? 'MAPA DA CAVERNA SUBTERRÂNEA' : 'MAPA DE SOBREVIVÊNCIA — LOST WORLD'}
            </h2>
          </div>
          <button
            onClick={() => {
              soundEngine.playUiClick();
              onClose();
            }}
            className="w-8 h-8 rounded-lg bg-neutral-900 hover:bg-red-950 text-neutral-400 hover:text-white flex items-center justify-center border border-neutral-800 cursor-pointer transition-colors active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Map Area */}
        <div className="p-3 sm:p-5 flex flex-col gap-3 overflow-y-auto">
          <div className="relative w-full aspect-video bg-neutral-900 rounded-xl border-2 border-neutral-700 overflow-hidden shadow-2xl">
            {isInsideCave ? (
              /* Underground Cavern Map View */
              <div className="absolute inset-0 bg-[#090b14] flex flex-col items-center justify-center">
                <div className="absolute inset-4 border border-purple-900/50 rounded-lg flex items-center justify-center">
                  <div className="text-center font-pixel text-xs text-purple-400/80">
                    <p className="text-sm text-purple-300">🕳️ GRANDE CAVERNA SUBTERRÂNEA</p>
                    <p className="text-[9px] text-neutral-400 mt-1 font-sans">
                      Rica em diamantes, ouro, ferro e cristais arcanos
                    </p>
                  </div>
                </div>

                {/* Cave exit ladder marker */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                  <span className="text-xl animate-bounce">🪜</span>
                  <span className="bg-black/90 px-1.5 py-0.5 rounded text-[8px] font-pixel text-yellow-300 border border-neutral-700">
                    ESCADA DE SUBIDA
                  </span>
                </div>
              </div>
            ) : (
              /* Overworld Map View */
              <>
                {/* 1. Lake & Beach (South West) */}
                <div className="absolute bottom-0 left-0 w-[45%] h-[40%] bg-[#1e3a5f] rounded-tr-[80px] border-t-2 border-r-2 border-[#b59d57]" />

                {/* 2. Rocky Mountain (North) */}
                <div className="absolute top-0 left-0 right-0 h-[22%] bg-[#2a2d34] border-b border-neutral-600 flex items-center justify-around text-neutral-400 text-[9px] font-pixel opacity-70">
                  <span>▲ MONTANHAS ROCHOSAS & PICOS NEVADOS ▲</span>
                </div>

                {/* 3. Desert (East) */}
                <div className="absolute top-0 right-0 bottom-0 w-[22%] bg-[#6e5831] border-l border-neutral-700 flex items-center justify-center rotate-90 text-neutral-300 text-[9px] font-pixel opacity-75">
                  DESERTO ÁRIDO
                </div>

                {/* 4. Ancient Ruins (North-West) */}
                <div className="absolute top-[22%] left-0 w-[28%] h-[35%] bg-[#1a1c23] border-r border-b border-purple-900/70 p-2 flex flex-col justify-center items-center text-purple-300 text-[8px] font-pixel text-center">
                  <ShieldAlert className="w-4 h-4 text-purple-400 mb-0.5" />
                  RUÍNAS DO CHEFE
                </div>

                {/* 5. Central Forest Label */}
                <div className="absolute top-[52%] left-[48%] -translate-x-1/2 -translate-y-1/2 text-neutral-500 font-pixel text-xs pointer-events-none select-none">
                  FLORESTA TEMPERADA
                </div>

                {/* Cave Entrance Markers */}
                {caveLocations.map((cave, i) => {
                  const cx = (cave.tx / world.width) * 100;
                  const cy = (cave.ty / world.height) * 100;
                  return (
                    <div
                      key={i}
                      className="absolute z-10 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer group"
                      style={{ left: `${cx}%`, top: `${cy}%` }}
                    >
                      <div className="w-5 h-5 bg-purple-950 border border-purple-400 rounded-full flex items-center justify-center text-[10px] shadow-[0_0_8px_rgba(168,85,247,0.7)] animate-pulse">
                        🕳️
                      </div>
                      <span className="bg-black/90 px-1 py-0.5 rounded text-[7px] font-pixel text-purple-300 mt-0.5 whitespace-nowrap border border-neutral-800">
                        {cave.name}
                      </span>
                    </div>
                  );
                })}

                {/* Base Camp Marker */}
                <div
                  className="absolute z-10 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer"
                  style={{ left: `${basePercentX}%`, top: `${basePercentY}%` }}
                >
                  <div className="w-5 h-5 bg-yellow-500 border-2 border-white rounded-full flex items-center justify-center text-black shadow-md">
                    <Home className="w-3 h-3" />
                  </div>
                  <span className="bg-black/90 px-1 py-0.5 rounded text-[7px] font-pixel text-yellow-300 mt-0.5 border border-neutral-800">
                    BASE
                  </span>
                </div>
              </>
            )}

            {/* Player Marker */}
            <div
              className="absolute z-20 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none"
              style={{ left: `${playerPercentX}%`, top: `${playerPercentY}%` }}
            >
              <div className="w-4 h-4 bg-red-600 border-2 border-white rounded-full shadow-[0_0_10px_rgba(239,68,68,1)] animate-ping" />
              <div className="w-3.5 h-3.5 bg-red-600 border border-white rounded-full absolute top-0" />
              <span className="bg-black/90 border border-red-500 px-1 py-0.5 rounded text-[7px] font-pixel text-white mt-1">
                VOCÊ
              </span>
            </div>
          </div>

          {/* Map Legend */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px] bg-black/60 p-2.5 rounded-xl border border-neutral-800 font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span className="text-neutral-300">Sua Posição</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs">🕳️</span>
              <span className="text-purple-300 font-bold">Cavernas Subterrâneas</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
              <span className="text-neutral-300">Base / Refúgio</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
              <span className="text-neutral-300">Ruínas do Chefe</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
