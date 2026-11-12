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
    <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 select-none touch-none">
      <div className="bg-neutral-950 border-2 border-neutral-700/80 rounded-2xl w-full max-w-sm p-5 flex flex-col items-center text-center shadow-2xl font-sans">
        <h2 className="font-pixel text-lg text-white mb-1">JOGO PAUSADO</h2>
        <div className="flex items-center gap-3 text-xs text-neutral-400 font-mono mb-5">
          <span>Dia: {dayCount}</span>
          <span>•</span>
          <span>Nível: {playerLevel}</span>
        </div>

        <div className="flex flex-col gap-2 w-full">
          <button
            onClick={() => {
              soundEngine.playUiClick();
              onResume();
            }}
            className="w-full py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-pixel text-xs rounded-xl shadow-lg border-2 border-yellow-400 cursor-pointer flex items-center justify-center gap-2 active:scale-95"
          >
            <Play className="w-4 h-4 fill-current" />
            CONTINUAR JOGO
          </button>

          <button
            onClick={() => {
              soundEngine.playUiClick();
              onSave();
            }}
            className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 text-emerald-400 font-pixel text-xs rounded-xl border border-neutral-700 cursor-pointer flex items-center justify-center gap-2 active:scale-95"
          >
            <Save className="w-4 h-4" />
            SALVAR JOGO
          </button>

          <button
            onClick={() => {
              soundEngine.playUiClick();
              onOpenSettings();
            }}
            className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-pixel text-xs rounded-xl border border-neutral-700 cursor-pointer flex items-center justify-center gap-2 active:scale-95"
          >
            <Volume2 className="w-4 h-4 text-yellow-400" />
            AJUSTES DE ÁUDIO
          </button>

          <button
            onClick={() => {
              soundEngine.playUiClick();
              onRestart();
            }}
            className="w-full py-2.5 bg-neutral-900 hover:bg-red-950/80 text-red-400 font-pixel text-xs rounded-xl border border-neutral-800 hover:border-red-800 cursor-pointer flex items-center justify-center gap-2 active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            RECOMEÇAR DO ZERO
          </button>

          <button
            onClick={() => {
              soundEngine.playUiClick();
              onTitle();
            }}
            className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white font-pixel text-xs rounded-xl border border-neutral-800 cursor-pointer flex items-center justify-center gap-2 active:scale-95"
          >
            <Home className="w-4 h-4" />
            MENU PRINCIPAL
          </button>
        </div>
      </div>
    </div>
  );
};
