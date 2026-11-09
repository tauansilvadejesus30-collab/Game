import React from 'react';
import { InventorySlot, StructureEntity } from '../game/types';
import { ITEMS } from '../game/constants';
import { X, Flame, Sparkles } from 'lucide-react';
import { soundEngine } from '../game/audio';

interface CookingModalProps {
  station: StructureEntity;
  inventory: (InventorySlot | null)[];
  onClose: () => void;
  onCookItem: (inputItemId: string, outputItemId: string, fuelItemId?: string) => void;
}

export const CookingModal: React.FC<CookingModalProps> = ({
  station,
  inventory,
  onClose,
  onCookItem,
}) => {
  const isFurnace = station.type === 'furnace';

  const recipes = isFurnace
    ? [
        {
          name: 'Barra de Ferro Puro',
          inputItemId: 'iron_ore',
          inputQty: 2,
          fuelItemId: 'coal',
          fuelQty: 1,
          outputItemId: 'iron_ingot',
          desc: 'Funde o minério bruto de ferro para criar barras metálicas fortes.',
        },
      ]
    : [
        {
          name: 'Carne Assada Suculenta',
          inputItemId: 'raw_meat',
          inputQty: 1,
          fuelItemId: 'wood',
          fuelQty: 1,
          outputItemId: 'cooked_meat',
          desc: 'Assa carne fresca na brasa. Restaura +45 Fome, +30 Energia e +20 Vida.',
        },
        {
          name: 'Peixe Grelhado no Fogo',
          inputItemId: 'raw_fish',
          inputQty: 1,
          fuelItemId: 'wood',
          fuelQty: 1,
          outputItemId: 'cooked_fish',
          desc: 'Peixe dourado no fogo com alto valor nutricional.',
        },
      ];

  const getQty = (itemId: string) => {
    let count = 0;
    for (const s of inventory) {
      if (s && s.item.id === itemId) count += s.quantity;
    }
    return count;
  };

  return (
    <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-3">
      <div className="bg-[#171926] border-2 border-[#4b4e6d] rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#12141f] border-b border-[#2b2e42]">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-400" />
            <h2 className="font-pixel text-sm md:text-base text-orange-400">
              {isFurnace ? 'FORNALHA DE FUNDIÇÃO' : 'FOGUEIRA & CULINÁRIA'}
            </h2>
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
        <div className="p-4 md:p-6 flex flex-col gap-3 overflow-y-auto">
          <p className="text-xs text-gray-300">
            {isFurnace
              ? 'Use carvão como combustível para transformar minérios em barras puras para armas e armaduras.'
              : 'Asse carnes e peixes crus para eliminar bactérias e obter o máximo de nutrientes e cura.'}
          </p>

          <div className="flex flex-col gap-3 mt-2">
            {recipes.map(r => {
              const inputItem = ITEMS[r.inputItemId];
              const fuelItem = r.fuelItemId ? ITEMS[r.fuelItemId] : null;
              const outputItem = ITEMS[r.outputItemId];

              const hasInput = getQty(r.inputItemId) >= r.inputQty;
              const hasFuel = fuelItem ? getQty(r.fuelItemId!) >= r.fuelQty : true;
              const canCook = hasInput && hasFuel;

              return (
                <div
                  key={r.name}
                  className="bg-[#10121a] border border-[#2b2e42] rounded-xl p-3.5 flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{outputItem.icon}</span>
                      <div>
                        <h4 className="font-bold text-xs text-yellow-300">{r.name}</h4>
                        <span className="text-[10px] text-gray-400">{r.desc}</span>
                      </div>
                    </div>
                  </div>

                  {/* Requirements bar */}
                  <div className="flex items-center justify-between bg-[#171926] p-2 rounded-lg text-xs">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <span>{inputItem.icon}</span>
                        <span className={hasInput ? 'text-emerald-400' : 'text-rose-400'}>
                          {getQty(r.inputItemId)}/{r.inputQty}
                        </span>
                      </div>
                      {fuelItem && (
                        <div className="flex items-center gap-1">
                          <span>{fuelItem.icon}</span>
                          <span className={hasFuel ? 'text-emerald-400' : 'text-rose-400'}>
                            {getQty(r.fuelItemId!)}/{r.fuelQty}
                          </span>
                        </div>
                      )}
                    </div>

                    <button
                      disabled={!canCook}
                      onClick={() => {
                        soundEngine.playEat();
                        onCookItem(r.inputItemId, r.outputItemId, r.fuelItemId);
                      }}
                      className={`px-3 py-1.5 rounded-lg font-bold font-pixel text-[10px] transition-all cursor-pointer ${
                        canCook
                          ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-black shadow active:scale-95'
                          : 'bg-[#202436] text-gray-500 border border-[#2b2e42] cursor-not-allowed'
                      }`}
                    >
                      {isFurnace ? 'FUNDIR' : 'PREPARAR'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
