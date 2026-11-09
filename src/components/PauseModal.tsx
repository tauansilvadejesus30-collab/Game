import React from 'react';
import { Play, RotateCcw, Home, Save, Volume2 } from 'lucide-react';
import { soundEngine } from '../game/audio';

interface PauseModalProps {
  onResume: () => void;
  onSave: () => void;
  onRestart: () => void;
  onTitle: () => void;
  onOpenSettings: () => void;
  dayCount: number;
  playerLevel: number;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onSave,
  onRestart,
  onTitle,
  onOpenSettings,
  dayCount,
  playerLevel,
}) => {
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-[#171926] border-2 border-[#4b4e6d] rounded-2xl w-full max-w-sm p-6 flex flex-col items-center text-center shadow-2xl">
        <h2 className="font-pixel text-xl text-yellow-400 mb-1">JOGO PAUSADO</h2>
        <div className="flex items-center gap-4 text-xs text-gray-400 font-bold mb-6">
          <span>Dia Sobrevivido: {dayCount}</span>
          <span>•</span>
          <span>Nível: {playerLevel}</span>
        </div>

        <div className="flex flex-col gap-2.5 w-full">
          <button
            onClick={() => {
              soundEngine.playUiClick();
              onResume();
            }}
            className="w-full py-3 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black font-pixel text-xs rounded-xl shadow-lg cursor-pointer flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-current" />
            CONTINUAR (ESC)
          </button>

          <button
            onClick={() => {
              soundEngine.playUiClick();
              onSave();
            }}
            className="w-full py-2.5 bg-[#1f2438] hover:bg-[#2b324d] text-emerald-300 font-pixel text-xs rounded-xl border border-emerald-700/60 cursor-pointer flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            SALVAR JOGO
          </button>

          <button
            onClick={() => {
              soundEngine.playUiClick();
              onOpenSettings();
            }}
            className="w-full py-2.5 bg-[#1a1c29] hover:bg-[#25283b] text-gray-300 font-pixel text-xs rounded-xl border border-[#3b3e59] cursor-pointer flex items-center justify-center gap-2"
          >
            <Volume2 className="w-4 h-4" />
            AJUSTES DE ÁUDIO
          </button>

          <button
            onClick={() => {
              soundEngine.playUiClick();
              onRestart();
            }}
            className="w-full py-2.5 bg-[#1a1c29] hover:bg-rose-950/60 text-rose-300 font-pixel text-xs rounded-xl border border-rose-900/60 cursor-pointer flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            RECOMEÇAR DO ZERO
          </button>

          <button
            onClick={() => {
              soundEngine.playUiClick();
              onTitle();
            }}
            className="w-full py-2.5 bg-[#12141f] hover:bg-[#1a1c29] text-gray-400 font-pixel text-xs rounded-xl border border-[#2b2e42] cursor-pointer flex items-center justify-center gap-2 mt-1"
          >
            <Home className="w-4 h-4" />
            MENU PRINCIPAL
          </button>
        </div>
      </div>
    </div>
  );
};
