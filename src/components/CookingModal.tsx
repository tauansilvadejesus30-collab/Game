import React from 'react';
import { InventorySlot, StructureEntity } from '../game/types';
import { ITEMS } from '../game/constants';
import { X, Flame } from 'lucide-react';
import { soundEngine } from '../game/audio';
import { ItemIcon } from './ItemIcon';

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
        {
          name: 'Barra de Ouro Valiosa',
          inputItemId: 'gold_ore',
          inputQty: 2,
          fuelItemId: 'coal',
          fuelQty: 1,
          outputItemId: 'gold_ingot',
          desc: 'Funde ouro extraído das cavernas em barras douradas reluzentes.',
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
    <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-3 select-none touch-none">
      <div className="bg-neutral-950 border-2 border-neutral-700/80 rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-sans">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-black border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-400" />
            <h2 className="font-pixel text-xs sm:text-sm text-white">
              {isFurnace ? 'FORNALHA DE FUNDIÇÃO' : 'FOGUEIRA & CULINÁRIA'}
            </h2>
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
        <div className="p-3 sm:p-5 flex flex-col gap-3 overflow-y-auto">
          <p className="text-xs text-neutral-300">
            {isFurnace
              ? 'Use carvão como combustível para transformar minérios das cavernas em barras puras.'
              : 'Asse carnes e peixes crus para obter o máximo de nutrientes e cura.'}
          </p>

          <div className="flex flex-col gap-2.5">
            {recipes.map((r, idx) => {
              const inputItem = ITEMS[r.inputItemId];
              const fuelItem = r.fuelItemId ? ITEMS[r.fuelItemId] : null;
              const outputItem = ITEMS[r.outputItemId];

              const hasInput = getQty(r.inputItemId) >= r.inputQty;
              const hasFuel = fuelItem ? getQty(r.fuelItemId!) >= r.fuelQty : true;
              const canCook = hasInput && hasFuel;

              return (
                <div
                  key={idx}
                  className="bg-black/60 border border-neutral-800 rounded-xl p-3 flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-lg bg-neutral-900 border border-neutral-700 flex items-center justify-center">
                        <ItemIcon id={outputItem?.id} fallbackIcon={outputItem?.icon} size="md" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-xs sm:text-sm text-white">{r.name}</span>
                        <span className="text-[10px] text-neutral-400 font-mono">
                          Requer: {inputItem?.name} (x{r.inputQty}) {fuelItem ? `+ ${fuelItem.name} (x${r.fuelQty})` : ''}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (!canCook) return;
                        soundEngine.playEat();
                        onCookItem(r.inputItemId, r.outputItemId, r.fuelItemId);
                      }}
                      disabled={!canCook}
                      className={`px-3 py-1.5 rounded-xl font-pixel text-[9px] sm:text-[10px] transition-all cursor-pointer ${
                        canCook
                          ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white border border-yellow-400 active:scale-95 shadow-md'
                          : 'bg-neutral-900 text-neutral-500 border border-neutral-800 cursor-not-allowed opacity-60'
                      }`}
                    >
                      {canCook ? 'PREPARAR' : 'FALTAM ITENS'}
                    </button>
                  </div>

                  <p className="text-[10px] text-neutral-400 font-sans leading-tight">
                    {r.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
