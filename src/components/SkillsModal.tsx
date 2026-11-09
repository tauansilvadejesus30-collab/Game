import React from 'react';
import { PlayerStats, SkillNode } from '../game/types';
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
    <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-3">
      <div className="bg-[#171926] border-2 border-[#4b4e6d] rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#12141f] border-b border-[#2b2e42]">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-400" />
            <h2 className="font-pixel text-sm md:text-base text-purple-400">ÁRVORE DE HABILIDADES</h2>
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

        {/* Skill Points Status */}
        <div className="px-5 py-3 bg-[#11131c] border-b border-[#26283b] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-xs text-gray-300">Pontos de Habilidade Disponíveis:</span>
          </div>
          <span className="font-pixel text-xs text-yellow-400 px-2 py-0.5 rounded bg-yellow-950/60 border border-yellow-700">
            {stats.skillPoints} PONTOS
          </span>
        </div>

        {/* Skills List */}
        <div className="p-4 md:p-6 overflow-y-auto flex flex-col gap-3">
          {SKILL_TREE.map(skill => {
            const isUnlocked = !!unlockedSkills[skill.id];
            const canAfford = stats.skillPoints >= skill.cost;

            return (
              <div
                key={skill.id}
                className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                  isUnlocked
                    ? 'border-purple-600/60 bg-purple-950/20 shadow-[0_0_12px_rgba(168,85,247,0.15)]'
                    : 'border-[#26283b] bg-[#12141f]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#1a1c29] border border-[#3b3e59] flex items-center justify-center text-2xl shrink-0">
                    {skill.icon}
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-xs text-gray-100">{skill.name}</h4>
                      {isUnlocked && (
                        <span className="flex items-center gap-0.5 text-[9px] font-pixel text-purple-400 bg-purple-900/40 px-1.5 py-0.5 rounded">
                          <Check className="w-3 h-3" /> ATIVO
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">
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
                    className={`ml-3 px-3 py-2 rounded-xl font-bold font-pixel text-[10px] shrink-0 transition-all cursor-pointer ${
                      canAfford
                        ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white shadow active:scale-95'
                        : 'bg-[#202436] text-gray-500 border border-[#2b2e42] cursor-not-allowed'
                    }`}
                  >
                    APRENDER ({skill.cost} PTS)
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
