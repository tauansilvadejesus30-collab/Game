import React from 'react';
import { InventorySlot } from '../game/types';
import { X, Sparkles } from 'lucide-react';
import { soundEngine } from '../game/audio';
import { ItemIcon } from './ItemIcon';

interface BuildingModalProps {
  inventory: (InventorySlot | null)[];
  onClose: () => void;
  onSelectStructure: (structureId: string) => void;
}

export const BuildingModal: React.FC<BuildingModalProps> = ({
  inventory,
  onClose,
  onSelectStructure,
}) => {
  const buildables = [
    { id: 'workbench', itemId: 'workbench_item', name: 'Bancada de Trabalho', icon: '🛠️', desc: 'Estação principal para fabricar ferramentas avançadas e equipamentos.' },
    { id: 'weapon_workbench', itemId: 'weapon_workbench_item', name: 'Bancada de Armas', icon: '🔫', desc: 'Estação bélica para forjar pistolas 9mm, rifles de caça e prensar munições.' },
    { id: 'sawmill', itemId: 'sawmill_item', name: 'Mesa de Carpintaria', icon: '🪚', desc: 'Processa toras brutas em tábuas nobres e peças para barcos.' },
    { id: 'furnace', itemId: 'furnace_item', name: 'Fornalha de Pedra', icon: '♨️', desc: 'Fundição para transformar minérios brutos em barras metálicas puras.' },
    { id: 'anvil', itemId: 'anvil_item', name: 'Bigorna Pesada', icon: '⚓', desc: 'Forja equipamentos resistentes de ferro, ouro e diamante.' },
    { id: 'campfire', itemId: 'campfire_item', name: 'Fogueira', icon: '🏕️', desc: 'Fornece calor vital à noite, luz e permite assar carnes e peixes.' },
    { id: 'bed', itemId: 'bed_item', name: 'Cama Confortável', icon: '🛏️', desc: 'Permite dormir à noite para restaurar vida, energia e marca seu ponto de renascimento.' },
    { id: 'chest', itemId: 'chest_item', name: 'Baú de Madeira', icon: '📦', desc: 'Armazenamento seguro com 16 compartimentos para seus itens.' },
    { id: 'well', itemId: 'well_item', name: 'Poço Artesiano', icon: '⛲', desc: 'Fonte inesgotável de água pura para beber e regar plantações.' },
    { id: 'wood_wall', itemId: 'wood_wall_item', name: 'Parede de Madeira', icon: '🧱', desc: 'Barricada resistente para erguer sua casa e repelir monstros.' },
    { id: 'stone_wall', itemId: 'stone_wall_item', name: 'Parede de Pedra', icon: '🪨', desc: 'Fortificação pesada de alta durabilidade contra ataques.' },
    { id: 'wood_door', itemId: 'wood_door_item', name: 'Porta de Madeira', icon: '🚪', desc: 'Porta articulada com trinco. Pode ser aberta e fechada.' },
    { id: 'fence', itemId: 'fence_item', name: 'Cerca de Madeira', icon: '🚧', desc: 'Perfeita para currais de animais e cercar sua horta.' },
    { id: 'scarecrow', itemId: 'scarecrow_item', name: 'Espantalho', icon: '🌾', desc: 'Protege seus vegetais contra pragas na plantação.' },
    { id: 'floor_torch', itemId: 'torch', name: 'Tocha de Chão', icon: '🔥', desc: 'Ilumina grandes áreas escuras e afasta criaturas da noite.' },
  ];

  const getInventoryQuantity = (itemId: string) => {
    let count = 0;
    for (const slot of inventory) {
      if (slot && slot.item.id === itemId) count += slot.quantity;
    }
    return count;
  };

  return (
    <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-2 sm:p-4 select-none touch-none">
      <div className="bg-neutral-950 border-2 border-neutral-700/80 rounded-2xl w-full max-w-2xl h-[92vh] max-h-[460px] flex flex-col shadow-2xl overflow-hidden font-sans">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 sm:py-2.5 bg-black border-b border-neutral-800 shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <h2 className="font-pixel text-xs sm:text-sm text-white">CONSTRUÇÃO DE BASE</h2>
          </div>
          <button
            onClick={() => {
              soundEngine.playUiClick();
              onClose();
            }}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-neutral-900 hover:bg-red-950 text-neutral-400 hover:text-white flex items-center justify-center border border-neutral-800 cursor-pointer transition-colors active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-4 overflow-y-auto flex flex-col gap-2 flex-1 min-h-0">
          <p className="text-xs text-neutral-300">
            Selecione uma estrutura para posicionar no mapa. No mapa, toque onde deseja construir.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mt-1">
            {buildables.map(b => {
              const qty = getInventoryQuantity(b.itemId);
              const hasItem = qty > 0;

              return (
                <button
                  key={b.id}
                  disabled={!hasItem}
                  onClick={() => {
                    soundEngine.playUiClick();
                    onSelectStructure(b.id);
                  }}
                  className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-left transition-all ${
                    hasItem 
                      ? 'border-neutral-700 bg-neutral-900/90 hover:border-emerald-400 hover:bg-neutral-800 cursor-pointer active:scale-95' 
                      : 'border-neutral-900 bg-black/40 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-black border border-neutral-700 flex items-center justify-center shrink-0">
                    <ItemIcon id={b.itemId} fallbackIcon={b.icon} size="md" />
                  </div>

                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-white truncate">{b.name}</span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-mono ${hasItem ? 'bg-emerald-950 text-emerald-400' : 'bg-red-950 text-red-400'}`}>
                        Qtd: {qty}
                      </span>
                    </div>
                    <p className="text-[10px] text-neutral-400 mt-0.5 line-clamp-2">
                      {b.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
