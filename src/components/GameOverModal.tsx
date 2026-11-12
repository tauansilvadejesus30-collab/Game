import React from 'react';
import { Skull, RotateCcw } from 'lucide-react';
import { soundEngine } from '../game/audio';

interface GameOverModalProps {
  dayCount: number;
  level: number;
  onRespawn: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  dayCount,
  level,
  onRespawn,
}) => {
  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 select-none touch-none">
      <div className="bg-neutral-950 border-2 border-red-700/80 rounded-2xl w-full max-w-sm p-6 flex flex-col items-center text-center shadow-[0_0_35px_rgba(220,38,38,0.4)] font-sans">
        <div className="w-14 h-14 rounded-full bg-red-950/70 border-2 border-red-600 flex items-center justify-center mb-3">
          <Skull className="w-7 h-7 text-red-500 animate-pulse" />
        </div>

        <h2 className="font-pixel text-xl text-red-500 mb-1">VOCÊ MORREU</h2>
        <p className="text-xs text-neutral-300 mb-4 font-sans">
          As forças selvagens de Lost World superaram sua resistência.
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 w-full bg-black/70 p-3 rounded-xl border border-neutral-800 mb-3">
          <div className="flex flex-col">
            <span className="text-[10px] text-neutral-400 font-mono">Dias Sobrevividos</span>
            <span className="font-pixel text-base text-yellow-400">{dayCount}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-neutral-400 font-mono">Nível</span>
            <span className="font-pixel text-base text-purple-400">Lv. {level}</span>
          </div>
        </div>

        <div className="w-full bg-red-950/30 border border-red-900/60 p-2.5 rounded-xl mb-4 text-[10px] sm:text-[11px] text-red-300 font-sans">
          ⚠️ <strong>Seus itens caíram onde você morreu!</strong> Você pode voltar lá para recuperar.
        </div>

        <button
          data-start="true"
          onClick={() => {
            soundEngine.playLevelUp();
            onRespawn();
          }}
          className="w-full py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-pixel text-xs rounded-xl shadow-xl border-2 border-yellow-400 cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          RENASCER NO ACAMPAMENTO
        </button>
      </div>
    </div>
  );
};
