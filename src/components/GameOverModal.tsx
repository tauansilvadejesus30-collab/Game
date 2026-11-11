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
    <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4">
      <div className="bg-[#171926] border-2 border-red-700/80 rounded-2xl w-full max-w-sm p-6 flex flex-col items-center text-center shadow-[0_0_30px_rgba(220,38,38,0.3)]">
        <div className="w-16 h-16 rounded-full bg-red-950/60 border-2 border-red-600 flex items-center justify-center mb-3">
          <Skull className="w-8 h-8 text-red-500 animate-pulse" />
        </div>

        <h2 className="font-pixel text-xl text-red-500 mb-1">VOCÊ MORREU</h2>
        <p className="text-xs text-gray-300 mb-5">
          As forças selvagens de Lost World superaram sua resistência.
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 w-full bg-[#10121a] p-3 rounded-xl border border-[#2b2e42] mb-3">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400">Dias Sobrevividos</span>
            <span className="font-pixel text-base text-yellow-400">{dayCount}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400">Nível do Sobrevivente</span>
            <span className="font-pixel text-base text-purple-400">Lv. {level}</span>
          </div>
        </div>

        <div className="w-full bg-red-950/40 border border-red-800/60 p-2.5 rounded-xl mb-5 text-[11px] text-red-200">
          ⚠️ <strong>Você perdeu todos os seus itens!</strong> Eles caíram no local onde você foi derrotado.
        </div>

        <button
          data-start="true"
          onClick={() => {
            soundEngine.playLevelUp();
            onRespawn();
          }}
          className="w-full py-3.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-pixel text-xs rounded-xl shadow-xl shadow-red-950/50 border-2 border-yellow-400 cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          RENASCER NA BASE
        </button>
      </div>
    </div>
  );
};
