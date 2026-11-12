import React from 'react';
import { PlayerStats } from '../game/types';
import { SKILL_TREE } from '../game/constants';
import { X, Award, Check, Sparkles } from 'lucide-react';
import { soundEngine } from '../game/audio';

interface SkillsModalProps {
  stats: PlayerStats;
  unlockedSkills: Record<string, boolean>;
  onClose: () => void;
  onUnlockSkill: (skillId: string, cost: number) => void;
}

export const SkillsModal: React.FC<SkillsModalProps> = ({
  stats,
  unlockedSkills,
  onClose,
  onUnlockSkill,
}) => {
  return (
    <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-3 select-none touch-none">
      <div className="bg-neutral-950 border-2 border-neutral-700/80 rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-sans">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-black border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-400" />
            <h2 className="font-pixel text-xs sm:text-sm text-white">ÁRVORE DE HABILIDADES</h2>
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

        {/* Skill Points Status */}
        <div className="px-4 py-2.5 bg-neutral-900/80 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-xs text-neutral-300">Pontos de Habilidade Disponíveis:</span>
          </div>
          <span className="font-pixel text-[10px] text-yellow-300 px-2 py-0.5 rounded bg-black border border-neutral-700">
            {stats.skillPoints} PONTOS
          </span>
        </div>

        {/* Skills List */}
        <div className="p-3 sm:p-5 overflow-y-auto flex flex-col gap-2.5">
          {SKILL_TREE.map(skill => {
            const isUnlocked = !!unlockedSkills[skill.id];
            const canAfford = stats.skillPoints >= skill.cost;

            return (
              <div
                key={skill.id}
                className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                  isUnlocked
                    ? 'border-purple-600/70 bg-purple-950/20 shadow-md'
                    : 'border-neutral-800 bg-black/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-700 flex items-center justify-center text-xl shrink-0">
                    {skill.icon}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-xs text-white truncate">{skill.name}</h4>
                      {isUnlocked && (
                        <span className="flex items-center gap-0.5 text-[8px] font-pixel text-purple-300 bg-purple-950 px-1.5 py-0.5 rounded border border-purple-800">
                          <Check className="w-3 h-3" /> ATIVO
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-neutral-400 mt-0.5 leading-snug">
                      {skill.description}
                    </p>
                  </div>
                </div>

                {!isUnlocked && (
                  <button
                    disabled={!canAfford}
                    onClick={() => {
                      soundEngine.playLevelUp();
                      onUnlockSkill(skill.id, skill.cost);
                    }}
                    className={`px-3 py-1.5 rounded-xl font-pixel text-[9px] transition-all cursor-pointer shrink-0 ml-2 ${
                      canAfford
                        ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white border border-yellow-400 active:scale-95 shadow-md'
                        : 'bg-neutral-900 text-neutral-500 border border-neutral-800 cursor-not-allowed opacity-60'
                    }`}
                  >
                    DESBLOQUEAR ({skill.cost} Pts)
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
