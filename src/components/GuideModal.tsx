import React from 'react';
import { X, HelpCircle, Shield, Flame, Heart, Droplets, Zap, Sparkles } from 'lucide-react';
import { soundEngine } from '../game/audio';

interface GuideModalProps {
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-3 select-none touch-none">
      <div className="bg-neutral-950 border-2 border-neutral-700/80 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden font-sans">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-black border-b border-neutral-800 shrink-0">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-yellow-400" />
            <h2 className="font-pixel text-xs sm:text-sm text-white">GUIA DE SOBREVIVÊNCIA & CAVERNAS</h2>
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

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex flex-col gap-4 text-xs text-neutral-300 leading-relaxed">
          {/* Cave Exploration Banner */}
          <div className="relative rounded-xl overflow-hidden border border-neutral-700 h-32 sm:h-40 bg-cover bg-center shadow-lg"
            style={{ backgroundImage: `url('/assets/images/cave_exploration_bg_1794483133593.jpg')` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent p-3 flex flex-col justify-end">
              <span className="font-pixel text-xs sm:text-sm text-yellow-300">🕳️ EXPLORAÇÃO SUBTERRÂNEA</span>
              <p className="text-[10px] sm:text-[11px] text-neutral-200 font-sans mt-0.5">
                Desça às cavernas escuras para minerar diamantes, ouro e cristais raros. Leve sempre tochas para não ficar no escuro!
              </p>
            </div>
          </div>

          {/* Mobile Touch Controls (100% Mobile focused) */}
          <div>
            <h3 className="font-pixel text-[11px] text-yellow-400 mb-2">📱 CONTROLES TOUCH MOBILE</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-black/60 p-3 rounded-xl border border-neutral-800">
              <div><strong className="text-white">Analógico Virtual (Esquerda):</strong> Mover o personagem em qualquer direção.</div>
              <div><strong className="text-white">Botão de AÇÃO (Direita):</strong> Atacar monstros, cortar árvores, minerar rochas ou interagir.</div>
              <div><strong className="text-white">Botão de CORRER:</strong> Ativa corrida para escapar rápido (gasta energia).</div>
              <div><strong className="text-white">Barra Inferior (1-8):</strong> Toque no item para equipar na mão do personagem.</div>
              <div><strong className="text-white">Botão [🕳️ ENTRAR]:</strong> Aparece automaticamente ao se aproximar de cavernas ou baús.</div>
              <div><strong className="text-white">Ícones Laterais:</strong> Mochila (🎒), Forja (🔨), Construção (✨) e Habilidades (⭐).</div>
            </div>
          </div>

          {/* Survival Mechanics */}
          <div>
            <h3 className="font-pixel text-[11px] text-yellow-400 mb-2">❤️ STATUS VITAIS</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800">
                <strong className="text-red-400">Vida (HP):</strong> Se zerar, você é derrotado. Recupera naturalmente quando estiver alimentado e hidratado.
              </div>
              <div className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800">
                <strong className="text-amber-400">Fome:</strong> Coma maçãs, tomates ou asse carnes e peixes na fogueira para restaurar.
              </div>
              <div className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800">
                <strong className="text-sky-400">Sede:</strong> Beba água no poço da base, beba direto dos rios ou consuma água engarrafada.
              </div>
              <div className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800">
                <strong className="text-purple-400">Temperatura:</strong> À noite o corpo esfria. Fique perto de fogueiras ou tochas para se aquecer.
              </div>
            </div>
          </div>

          {/* Tips */}
          <div>
            <h3 className="font-pixel text-[11px] text-yellow-400 mb-2">💡 DICAS DE MESTRE</h3>
            <ul className="list-disc list-inside space-y-1 text-neutral-400 font-sans">
              <li>Use a <strong className="text-white">Picareta</strong> para rochas e minérios, e o <strong className="text-white">Machado</strong> para troncos.</li>
              <li>A <strong className="text-white">Picareta de Ferro</strong> minera minérios pesados com muito mais rapidez nas profundezas.</li>
              <li>Encontre baús antigos escondidos nas cavernas para obter equipamentos e suprimentos raros.</li>
              <li>Para sair da caverna, basta se aproximar da <strong className="text-white">Escada Central</strong> e tocar em Subir.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
