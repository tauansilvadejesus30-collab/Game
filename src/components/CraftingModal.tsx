import React, { useState } from 'react';
import { InventorySlot, Recipe } from '../game/types';
import { RECIPES, ITEMS } from '../game/constants';
import { canCraftRecipe } from '../game/rules';
import { X, Hammer, Check, AlertCircle, Sparkles } from 'lucide-react';
import { soundEngine } from '../game/audio';

interface CraftingModalProps {
  inventory: (InventorySlot | null)[];
  onClose: () => void;
  onCraft: (recipe: Recipe) => void;
}

export const CraftingModal: React.FC<CraftingModalProps> = ({
  inventory,
  onClose,
  onCraft,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>(RECIPES[0].id);

  const categories = [
    { id: 'all', label: 'Tudo', icon: '✨' },
    { id: 'tools', label: 'Ferramentas', icon: '🪓' },
    { id: 'weapons', label: 'Armas', icon: '🗡️' },
    { id: 'survival', label: 'Sobrevivência', icon: '🏕️' },
    { id: 'building', label: 'Construção', icon: '🧱' },
    { id: 'cooking', label: 'Culinária', icon: '🍖' },
  ];

  const filteredRecipes = RECIPES.filter(r => {
    if (selectedCategory === 'all') return true;
    return r.category === selectedCategory;
  });

  const selectedRecipe = RECIPES.find(r => r.id === selectedRecipeId) || filteredRecipes[0];
  const outputItem = selectedRecipe ? ITEMS[selectedRecipe.outputItemId] : null;
  const canCraft = selectedRecipe ? canCraftRecipe(inventory, selectedRecipe) : false;

  const countAvailable = (itemId: string) => {
    let count = 0;
    for (const slot of inventory) {
      if (slot && slot.item.id === itemId) count += slot.quantity;
    }
    return count;
  };

  const handleCraft = () => {
    if (!selectedRecipe || !canCraft) return;
    soundEngine.playCraft();
    onCraft(selectedRecipe);
  };

  return (
    <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-3">
      <div className="bg-[#171926] border-2 border-[#4b4e6d] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#12141f] border-b border-[#2b2e42]">
          <div className="flex items-center gap-2">
            <Hammer className="w-5 h-5 text-yellow-400" />
            <h2 className="font-pixel text-sm md:text-base text-yellow-400">BANCADA DE FABRICAÇÃO</h2>
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

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 px-4 py-2.5 bg-[#12141f]/70 border-b border-[#26283b] overflow-x-auto">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => {
                soundEngine.playUiClick();
                setSelectedCategory(cat.id);
              }}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 cursor-pointer transition-all ${
                selectedCategory === cat.id
                  ? 'bg-yellow-500 text-black shadow'
                  : 'bg-[#1e2235] text-gray-300 hover:bg-[#2a304a]'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-5 overflow-y-auto">
          {/* Left: Recipe List */}
          <div className="flex flex-col gap-2 max-h-[380px] overflow-y-auto pr-1">
            {filteredRecipes.map(recipe => {
              const item = ITEMS[recipe.outputItemId];
              if (!item) return null;
              const affordable = canCraftRecipe(inventory, recipe);
              const isSelected = selectedRecipe?.id === recipe.id;

              return (
                <button
                  key={recipe.id}
                  onClick={() => {
                    soundEngine.playUiClick();
                    setSelectedRecipeId(recipe.id);
                  }}
                  className={`flex items-center justify-between p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'border-yellow-400 bg-[#2d334d] shadow'
                      : 'border-[#26283b] bg-[#12141f] hover:border-[#434766]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#1a1c29] border border-[#3b3e59] flex items-center justify-center text-2xl">
                      {item.icon}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-xs text-gray-200">{item.name}</span>
                      <span className="text-[10px] text-gray-400">
                        Rendimento: x{recipe.outputQuantity}
                      </span>
                    </div>
                  </div>

                  <div>
                    {affordable ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-950/70 text-emerald-400 border border-emerald-800 text-[10px] font-bold">
                        Pronto
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-rose-950/40 text-rose-400 border border-rose-900/60 text-[10px] font-bold">
                        Faltam Itens
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right: Recipe Details & Crafting Action */}
          {selectedRecipe && outputItem ? (
            <div className="bg-[#10121a] border border-[#2b2e42] rounded-xl p-4 flex flex-col justify-between">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 pb-3 border-b border-[#26283b]">
                  <div className="w-14 h-14 rounded-xl bg-[#1c1f2e] border-2 border-yellow-400/40 flex items-center justify-center text-3xl shadow">
                    {outputItem.icon}
                  </div>
                  <div className="flex flex-col">
                    <h3 className="font-bold text-sm text-yellow-300">{outputItem.name}</h3>
                    <span className="text-[10px] text-gray-400">
                      Gera: {selectedRecipe.outputQuantity} unidade(s)
                    </span>
                  </div>
                </div>

                <p className="text-xs text-gray-300 leading-relaxed">
                  {outputItem.description}
                </p>

                {/* Ingredients Required */}
                <div className="flex flex-col gap-2 mt-2">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Materiais Necessários:
                  </span>
                  <div className="flex flex-col gap-1.5">
                    {selectedRecipe.ingredients.map(ing => {
                      const ingItem = ITEMS[ing.itemId];
                      const available = countAvailable(ing.itemId);
                      const hasEnough = available >= ing.quantity;

                      return (
                        <div
                          key={ing.itemId}
                          className={`flex items-center justify-between p-2 rounded-lg border text-xs ${
                            hasEnough
                              ? 'bg-emerald-950/20 border-emerald-800/60 text-emerald-300'
                              : 'bg-rose-950/20 border-rose-900/50 text-rose-300'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span>{ingItem?.icon}</span>
                            <span className="font-medium">{ingItem?.name}</span>
                          </div>
                          <span className="font-bold tabular-nums">
                            {available} / {ing.quantity}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Craft Button */}
              <button
                onClick={handleCraft}
                disabled={!canCraft}
                className={`w-full py-3 mt-4 rounded-xl font-bold font-pixel text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  canCraft
                    ? 'bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black shadow-lg shadow-yellow-500/20 active:scale-95'
                    : 'bg-[#202436] text-gray-500 border border-[#2b2e42] cursor-not-allowed opacity-60'
                }`}
              >
                <Hammer className="w-4 h-4" />
                FABRICAR {outputItem.name.toUpperCase()}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
