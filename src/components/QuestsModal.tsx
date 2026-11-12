import React from 'react';
import { Quest } from '../game/types';
import { X, Award, CheckCircle2, Clock } from 'lucide-react';
import { soundEngine } from '../game/audio';

interface QuestsModalProps {
  quests: Quest[];
  onClose: () => void;
}

export const QuestsModal: React.FC<QuestsModalProps> = ({ quests, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-3 select-none touch-none">
      <div className="bg-neutral-950 border-2 border-neutral-700/80 rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-sans">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-black border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-400" />
            <h2 className="font-pixel text-xs sm:text-sm text-white">DIÁRIO DE MISSÕES DO SOBREVIVENTE</h2>
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

        {/* Quests List */}
        <div className="p-3 sm:p-5 overflow-y-auto flex flex-col gap-2.5">
          {quests.map(quest => {
            const pct = Math.min(100, (quest.currentCount / quest.targetCount) * 100);

            return (
              <div
                key={quest.id}
                className={`p-3 rounded-xl border flex flex-col gap-1.5 transition-all ${
                  quest.completed
                    ? 'border-emerald-600/60 bg-emerald-950/20'
                    : 'border-neutral-800 bg-black/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {quest.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <Clock className="w-4 h-4 text-yellow-400 shrink-0" />
                    )}
                    <h4 className="font-bold text-xs text-white">{quest.title}</h4>
                  </div>
                  <span className="text-[9px] font-bold text-yellow-400 font-pixel">
                    +{quest.rewardXp} XP
                  </span>
                </div>

                <p className="text-[10px] sm:text-[11px] text-neutral-300 leading-snug">
                  {quest.description}
                </p>

                {/* Progress Bar */}
                <div className="flex items-center gap-3 mt-0.5">
                  <div className="w-full bg-neutral-900 h-2 rounded-full overflow-hidden border border-neutral-700">
                    <div
                      className={`h-full transition-all duration-300 ${
                        quest.completed ? 'bg-emerald-500' : 'bg-yellow-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-[9px] font-bold text-neutral-300 tabular-nums shrink-0 font-mono">
                    {quest.currentCount} / {quest.targetCount}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
