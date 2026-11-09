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
    <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-3">
      <div className="bg-[#171926] border-2 border-[#4b4e6d] rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#12141f] border-b border-[#2b2e42]">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-400" />
            <h2 className="font-pixel text-sm md:text-base text-yellow-400">DIÁRIO DE MISSÕES</h2>
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

        {/* Quests List */}
        <div className="p-4 md:p-6 overflow-y-auto flex flex-col gap-3">
          {quests.map(quest => {
            const pct = Math.min(100, (quest.currentCount / quest.targetCount) * 100);

            return (
              <div
                key={quest.id}
                className={`p-3.5 rounded-xl border flex flex-col gap-2 transition-all ${
                  quest.completed
                    ? 'border-emerald-600/50 bg-emerald-950/20'
                    : 'border-[#26283b] bg-[#12141f]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {quest.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <Clock className="w-4 h-4 text-yellow-400 shrink-0" />
                    )}
                    <h4 className="font-bold text-xs text-gray-100">{quest.title}</h4>
                  </div>
                  <span className="text-[10px] font-bold text-yellow-400 font-pixel">
                    +{quest.rewardXp} XP
                  </span>
                </div>

                <p className="text-[11px] text-gray-300 leading-snug">
                  {quest.description}
                </p>

                {/* Progress Bar */}
                <div className="flex items-center gap-3 mt-1">
                  <div className="w-full bg-[#1b1e2e] h-2 rounded-full overflow-hidden border border-[#3b3e59]">
                    <div
                      className={`h-full transition-all duration-300 ${
                        quest.completed ? 'bg-emerald-500' : 'bg-yellow-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-gray-300 tabular-nums shrink-0">
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
