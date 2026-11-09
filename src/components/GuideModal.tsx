import React from 'react';
import { X, HelpCircle, Shield, Flame, Heart, Droplets, Zap, Sparkles } from 'lucide-react';
import { soundEngine } from '../game/audio';

interface GuideModalProps {
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-3">
      <div className="bg-[#171926] border-2 border-[#4b4e6d] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#12141f] border-b border-[#2b2e42]">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-amber-400" />
            <h2 className="font-pixel text-sm md:text-base text-amber-400">GUIA DE SOBREVIVÊNCIA</h2>
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

        {/* Content */}
        <div className="p-5 overflow-y-auto flex flex-col gap-5 text-xs text-gray-300 leading-relaxed">
          {/* Controls table */}
          <div>
            <h3 className="font-pixel text-xs text-yellow-300 mb-2">🎮 CONTROLES DO TECLADO & MOUSE</h3>
            <div className="grid grid-cols-2 gap-2 bg-[#10121a] p-3 rounded-xl border border-[#2b2e42]">
              <div><strong className="text-white">W, A, S, D</strong> ou <strong className="text-white">Setas</strong>: Movimentação</div>
              <div><strong className="text-white">Espaço</strong> ou <strong className="text-white">Clique Esquerdo</strong>: Atacar / Coletar / Interagir</div>
              <div><strong className="text-white">Shift</strong>: Correr rápido (gasta energia)</div>
              <div><strong className="text-white">1 a 8</strong>: Selecionar item da Barra Rápida</div>
              <div><strong className="text-white">E</strong>: Abrir Mochila / Equipamentos</div>
              <div><strong className="text-white">C</strong>: Abrir Menu de Fabricação</div>
              <div><strong className="text-white">B</strong>: Modo Construção de Base</div>
              <div><strong className="text-white">M</strong>: Abrir Mapa do Mundo</div>
              <div><strong className="text-white">K</strong>: Árvore de Habilidades</div>
              <div><strong className="text-white">Esc / P</strong>: Pausar o Jogo</div>
            </div>
          </div>

          {/* Survival Mechanics */}
          <div>
            <h3 className="font-pixel text-xs text-yellow-300 mb-2">❤️ SISTEMA DE SOBREVIVÊNCIA</h3>
            <div className="flex flex-col gap-2">
              <div className="p-2.5 rounded-lg bg-[#141624] border border-[#2b2e42]">
                <strong className="text-red-400">Vida (HP):</strong> Se chegar a zero, você é derrotado. Recupera naturalmente quando estiver bem alimentado, hidratado e com temperatura normal.
              </div>
              <div className="p-2.5 rounded-lg bg-[#141624] border border-[#2b2e42]">
                <strong className="text-amber-400">Fome:</strong> Diminui gradualmente. Coma maçãs, frutas vermelhas ou assar carne na fogueira para restaurar.
              </div>
              <div className="p-2.5 rounded-lg bg-[#141624] border border-[#2b2e42]">
                <strong className="text-cyan-400">Sede:</strong> Beba água no poço da base, beba do cantil ou colha frutas suculentas.
              </div>
              <div className="p-2.5 rounded-lg bg-[#141624] border border-[#2b2e42]">
                <strong className="text-purple-400">Temperatura Corporal:</strong> À noite e na chuva o corpo esfria. Fique perto de fogueiras, tochas ou dentro de cabanas para se aquecer.
              </div>
            </div>
          </div>

          {/* Tips */}
          <div>
            <h3 className="font-pixel text-xs text-yellow-300 mb-2">💡 DICAS IMPORTANTES</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-400">
              <li>Use o <strong className="text-white">Machado</strong> para cortar árvores e a <strong className="text-white">Picareta</strong> para minerar rochas.</li>
              <li>À noite, monstros perigosos (Zumbis e Lobos) aparecem com mais frequência. Durma na <strong className="text-white">Cama</strong> para avançar para o amanhecer.</li>
              <li>A agricultura permite colher tomates que saciam fome e sede ao mesmo tempo.</li>
              <li>Construa muros e portas ao redor da sua base para mantê-la segura.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
