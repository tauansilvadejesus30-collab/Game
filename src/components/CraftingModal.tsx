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
  const [craftMultiplier, setCraftMultiplier] = useState<number>(1);

  const categories = [
    { id: 'all', label: 'Tudo', icon: '✨' },
    { id: 'survival', label: 'Sobrevivência', icon: '🏕️' },
    { id: 'tools', label: 'Ferramentas', icon: '🪓' },
    { id: 'weapons', label: 'Armas', icon: '🗡️' },
    { id: 'building', label: 'Construção', icon: '🧱' },
    { id: 'cooking', label: 'Culinária', icon: '🍖' },
  ];

  const filteredRecipes = RECIPES.filter(r => {
    if (selectedCategory === 'all') return true;
    return r.category === selectedCategory;
  });

  const selectedRecipe = RECIPES.find(r => r.id === selectedRecipeId) || filteredRecipes[0];
  const outputItem = selectedRecipe ? ITEMS[selectedRecipe.outputItemId] : null;

  const countAvailable = (itemId: string) => {
    let count = 0;
    for (const slot of inventory) {
      if (slot && slot.item.id === itemId) count += slot.quantity;
    }
    return count;
  };

  // Check how many times the recipe can be crafted
  const maxCraftCount = selectedRecipe
    ? Math.min(
        ...selectedRecipe.ingredients.map(ing => {
          const avail = countAvailable(ing.itemId);
          return Math.floor(avail / ing.quantity);
        })
      )
    : 0;

  const effectiveMultiplier = Math.max(1, Math.min(craftMultiplier, maxCraftCount || 1));
  const canCraft = selectedRecipe ? canCraftRecipe(inventory, selectedRecipe) : false;

  const handleCraft = () => {
    if (!selectedRecipe || !canCraft) return;
    soundEngine.playCraft();
    // Execute crafting for multiplier times
    const times = Math.min(effectiveMultiplier, maxCraftCount || 1);
    for (let i = 0; i < times; i++) {
      onCraft(selectedRecipe);
    }
  };

  // Quick core material tally
  const woodCount = countAvailable('wood');
  const stoneCount = countAvailable('stone');
  const branchCount = countAvailable('branch');
  const fiberCount = countAvailable('fiber');

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-2 sm:p-4 select-none animate-in fade-in duration-200">
      <div className="bg-[#141624] border-2 border-[#4b4e6d] rounded-2xl w-full max-w-4xl h-[92vh] max-h-[460px] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header: Title + Quick Material Tally + Close Button */}
        <div className="flex items-center justify-between px-3 sm:px-5 py-2 sm:py-2.5 bg-[#10121d] border-b border-[#26283b] shrink-0">
          <div className="flex items-center gap-2">
            <Hammer className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
            <h2 className="font-pixel text-xs sm:text-sm text-yellow-400 tracking-wide">
              BANCADA DE FABRICAÇÃO
            </h2>
          </div>

          {/* Quick material counters */}
          <div className="hidden sm:flex items-center gap-2.5 text-[10px] text-gray-300 font-bold bg-black/40 px-2.5 py-1 rounded-lg border border-white/10">
            <span title="Madeira">🪵 {woodCount}</span>
            <span title="Pedra">🪨 {stoneCount}</span>
            <span title="Graveto">🥢 {branchCount}</span>
            <span title="Fibras">🌿 {fiberCount}</span>
          </div>

          <button
            onClick={() => {
              soundEngine.playUiClick();
              onClose();
            }}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#222538] hover:bg-rose-900/60 text-gray-300 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Category Tabs: Slim and scrollable */}
        <div className="flex items-center gap-1 sm:gap-1.5 px-3 py-1.5 bg-[#0f111a] border-b border-[#26283b] overflow-x-auto shrink-0">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => {
                soundEngine.playUiClick();
                setSelectedCategory(cat.id);
                // Select first recipe in new category if current is not in it
                const firstInCat = RECIPES.find(r => cat.id === 'all' || r.category === cat.id);
                if (firstInCat) setSelectedRecipeId(firstInCat.id);
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] sm:text-xs font-bold shrink-0 cursor-pointer transition-all ${
                selectedCategory === cat.id
                  ? 'bg-yellow-500 text-black shadow'
                  : 'bg-[#1b1e2c] text-gray-300 hover:bg-[#252a3d]'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Body: ALWAYS 2 COLUMNS (Left 42%: Recipe List, Right 58%: Recipe Details & Pinned Action) */}
        <div className="flex flex-row flex-1 min-h-0 overflow-hidden">
          
          {/* Left Column: Recipe List */}
          <div className="w-[42%] sm:w-[44%] border-r border-[#26283b] flex flex-col min-h-0 bg-[#121420]">
            <div className="px-3 py-1 bg-[#0d0e17] text-[9px] font-bold text-gray-400 uppercase tracking-wider border-b border-[#1f2233] flex justify-between">
              <span>Receitas Disponíveis</span>
              <span className="text-yellow-400/80">{filteredRecipes.length}</span>
            </div>

            <div className="flex-1 overflow-y-auto p-1.5 sm:p-2 flex flex-col gap-1.5">
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
                    className={`flex items-center justify-between p-1.5 sm:p-2 rounded-lg border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'border-yellow-400 bg-[#282d42] shadow-sm ring-1 ring-yellow-400/50'
                        : affordable
                          ? 'border-[#2d3247] bg-[#161826] hover:border-yellow-500/60 hover:bg-[#1f2336]'
                          : 'border-[#1f2233] bg-[#10121c] opacity-70 hover:opacity-100 hover:border-[#333852]'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg shrink-0 border ${
                        affordable ? 'bg-[#1e2338] border-yellow-500/40' : 'bg-[#141624] border-[#292c3f]'
                      }`}>
                        {item.icon}
                      </div>
                      <div className="flex flex-col truncate">
                        <span className={`font-bold text-[11px] truncate ${isSelected ? 'text-yellow-300' : 'text-gray-200'}`}>
                          {item.name}
                        </span>
                        <span className="text-[9px] text-gray-400">
                          x{recipe.outputQuantity}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0 ml-1">
                      {affordable ? (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-700/80 text-[8px] font-bold">
                          ✓ Pronto
                        </span>
                      ) : (
                        <span className="text-rose-400/80 text-[8px] font-semibold">
                          Falta
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Recipe Details & Pinned Craft Action */}
          {selectedRecipe && outputItem ? (
            <div className="w-[58%] sm:w-[56%] flex flex-col justify-between min-h-0 p-3 sm:p-4 bg-[#0d0f17]">
              
              {/* Scrollable details if screen is extra short */}
              <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2">
                {/* Recipe Header */}
                <div className="flex items-start gap-2.5 pb-2 border-b border-[#222538]">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-[#181b2b] border-2 border-yellow-400/50 flex items-center justify-center text-2xl sm:text-3xl shadow shrink-0">
                    {outputItem.icon}
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-xs sm:text-sm text-yellow-300">
                        {outputItem.name}
                      </h3>
                      <span className="px-1.5 py-0.2 bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 rounded text-[9px] font-pixel">
                        +{selectedRecipe.outputQuantity}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-300 mt-0.5 leading-snug line-clamp-2">
                      {outputItem.description}
                    </p>
                  </div>
                </div>

                {/* Materials Required (Compact Chips) */}
                <div className="flex flex-col gap-1.5 mt-1">
                  <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    <span>Materiais Necessários:</span>
                    <span className={canCraft ? 'text-emerald-400' : 'text-rose-400'}>
                      {canCraft ? 'Recursos Suficientes' : 'Recursos Insuficientes'}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1">
                    {selectedRecipe.ingredients.map(ing => {
                      const ingItem = ITEMS[ing.itemId];
                      const available = countAvailable(ing.itemId);
                      const required = ing.quantity * (canCraft ? effectiveMultiplier : 1);
                      const hasEnough = available >= required;

                      return (
                        <div
                          key={ing.itemId}
                          className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-[11px] ${
                            hasEnough
                              ? 'bg-emerald-950/20 border-emerald-800/60 text-emerald-200'
                              : 'bg-rose-950/25 border-rose-900/60 text-rose-300'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="text-base leading-none">{ingItem?.icon}</span>
                            <span className="font-medium truncate">{ingItem?.name}</span>
                          </div>
                          <div className="flex items-center gap-1.5 font-bold tabular-nums shrink-0">
                            <span>{available} / {required}</span>
                            {hasEnough ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Bottom: Quantity Selector & Pinned Craft Button */}
              <div className="pt-2 border-t border-[#222538] flex flex-col gap-1.5 shrink-0">
                {/* Multiplier buttons if multiple can be crafted */}
                {maxCraftCount > 1 && (
                  <div className="flex items-center justify-between text-[10px] text-gray-400">
                    <span className="font-medium">Quantidade a fabricar:</span>
                    <div className="flex items-center gap-1">
                      {[1, 3, 5, maxCraftCount].filter((v, i, a) => v <= maxCraftCount && a.indexOf(v) === i).map(qty => (
                        <button
                          key={qty}
                          onClick={() => setCraftMultiplier(qty)}
                          className={`px-2 py-0.5 rounded text-[9px] font-bold cursor-pointer transition-all ${
                            effectiveMultiplier === qty
                              ? 'bg-yellow-500 text-black shadow'
                              : 'bg-[#1c2033] text-gray-300 hover:bg-[#282e4a]'
                          }`}
                        >
                          {qty === maxCraftCount ? `Max (${qty})` : `x${qty}`}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* BIG CRAFT BUTTON - 100% Guaranteed Visible */}
                <button
                  onClick={handleCraft}
                  disabled={!canCraft}
                  className={`w-full py-2.5 sm:py-3 rounded-xl font-bold font-pixel text-[11px] sm:text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg ${
                    canCraft
                      ? 'bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black border-2 border-yellow-300 shadow-yellow-500/25 active:scale-95'
                      : 'bg-[#1a1d2c] text-gray-500 border border-[#2b2e42] cursor-not-allowed opacity-60'
                  }`}
                >
                  <Hammer className="w-4 h-4" />
                  <span>
                    {canCraft 
                      ? `FABRICAR ${outputItem.name.toUpperCase()} (+${selectedRecipe.outputQuantity * effectiveMultiplier})` 
                      : 'FALTAM MATERIAIS'}
                  </span>
                </button>
              </div>

            </div>
          ) : null}

        </div>
      </div>
    </div>
  );
};
