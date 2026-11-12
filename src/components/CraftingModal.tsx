import React, { useState } from 'react';
import { InventorySlot, Recipe } from '../game/types';
import { RECIPES, ITEMS } from '../game/constants';
import { canCraftRecipe } from '../game/rules';
import { X, Hammer, Check, AlertCircle } from 'lucide-react';
import { soundEngine } from '../game/audio';
import { ItemIcon } from './ItemIcon';

interface CraftingModalProps {
  inventory: (InventorySlot | null)[];
  nearbyStations?: string[];
  onClose: () => void;
  onCraft: (recipe: Recipe) => void;
}

export const CraftingModal: React.FC<CraftingModalProps> = ({
  inventory,
  nearbyStations = ['none'],
  onClose,
  onCraft,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>(RECIPES[0].id);
  const [craftMultiplier, setCraftMultiplier] = useState<number>(1);

  const categories = [
    { id: 'all', label: 'Tudo', icon: '✨' },
    { id: 'firearms', label: 'Armas de Fogo', icon: '🔫' },
    { id: 'workbench', label: 'Bancada', icon: '🛠️' },
    { id: 'survival', label: 'Sobrevivência', icon: '🏕️' },
    { id: 'tools', label: 'Ferramentas', icon: '🪓' },
    { id: 'weapons', label: 'Armas Brancas', icon: '🗡️' },
    { id: 'building', label: 'Construção', icon: '🧱' },
    { id: 'cooking', label: 'Culinária', icon: '🍖' },
  ];

  const filteredRecipes = RECIPES.filter(r => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'firearms') {
      return r.requiresStation === 'weapon_workbench' || r.id === 'craft_weapon_workbench' || r.id === 'craft_gunpowder';
    }
    if (selectedCategory === 'workbench') return r.requiresStation === 'workbench';
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

  const getStationLabel = (station?: string) => {
    if (!station || station === 'none') return null;
    if (station === 'weapon_workbench') return '🔫 Bancada de Armas';
    if (station === 'workbench') return '🛠️ Bancada de Trabalho';
    if (station === 'sawmill') return '🪚 Serraria';
    if (station === 'furnace') return '♨️ Fornalha';
    if (station === 'anvil') return '⚓ Bigorna';
    if (station === 'campfire') return '🔥 Fogueira';
    return station;
  };

  const hasRequiredStation = (recipe: Recipe) => {
    if (!recipe.requiresStation) return true;
    return nearbyStations.includes(recipe.requiresStation);
  };

  const maxCraftCount = selectedRecipe
    ? Math.min(
        ...selectedRecipe.ingredients.map(ing => {
          const avail = countAvailable(ing.itemId);
          return Math.floor(avail / ing.quantity);
        })
      )
    : 0;

  const effectiveMultiplier = Math.max(1, Math.min(craftMultiplier, maxCraftCount || 1));
  const isStationNear = selectedRecipe ? hasRequiredStation(selectedRecipe) : true;
  const canCraft = selectedRecipe ? (canCraftRecipe(inventory, selectedRecipe, nearbyStations) && isStationNear) : false;

  const handleCraft = () => {
    if (!selectedRecipe || !canCraft) return;
    soundEngine.playCraft();
    const times = Math.min(effectiveMultiplier, maxCraftCount || 1);
    for (let i = 0; i < times; i++) {
      onCraft(selectedRecipe);
    }
  };

  const woodCount = countAvailable('wood');
  const stoneCount = countAvailable('stone');
  const branchCount = countAvailable('branch');
  const fiberCount = countAvailable('fiber');

  return (
    <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-2 sm:p-4 select-none touch-none">
      <div className="bg-neutral-950 border-2 border-neutral-700/80 rounded-2xl w-full max-w-4xl h-[94vh] max-h-[500px] flex flex-col shadow-2xl overflow-hidden font-sans">
        
        {/* Header */}
        <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 bg-black border-b border-neutral-800 shrink-0">
          <div className="flex items-center gap-2">
            <Hammer className="w-4 h-4 text-amber-400" />
            <h2 className="font-pixel text-xs sm:text-sm text-white tracking-wide">
              FABRICAÇÃO & FORJA
            </h2>
            {nearbyStations.includes('workbench') ? (
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/80 text-emerald-300 text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                🛠️ Bancada Conectada
              </span>
            ) : (
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-neutral-900 border border-neutral-700 text-neutral-300 text-[10px]">
                🎒 Manual
              </span>
            )}
          </div>

          {/* Quick material counters */}
          <div className="hidden sm:flex items-center gap-2.5 text-[10px] text-neutral-300 font-bold bg-neutral-900/80 px-2.5 py-1 rounded-lg border border-neutral-700">
            <span>🪵 {woodCount}</span>
            <span>🪨 {stoneCount}</span>
            <span>🥢 {branchCount}</span>
            <span>🌿 {fiberCount}</span>
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

        {/* Category Tabs */}
        <div className="flex items-center gap-1 sm:gap-1.5 px-3 py-1.5 bg-neutral-900/90 border-b border-neutral-800 overflow-x-auto shrink-0">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => {
                soundEngine.playUiClick();
                setSelectedCategory(cat.id);
                const firstInCat = RECIPES.find(r => cat.id === 'all' || r.category === cat.id);
                if (firstInCat) setSelectedRecipeId(firstInCat.id);
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-bold shrink-0 cursor-pointer transition-all ${
                selectedCategory === cat.id
                  ? 'bg-neutral-100 text-black shadow-md'
                  : 'bg-black/60 text-neutral-400 hover:text-white border border-neutral-800'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Body: 2 Columns */}
        <div className="flex flex-row flex-1 min-h-0 overflow-hidden">
          {/* Left Column: Recipe List */}
          <div className="w-[42%] sm:w-[44%] border-r border-neutral-800 flex flex-col min-h-0 bg-black/60">
            <div className="px-3 py-1 bg-black text-[9px] font-bold text-neutral-400 uppercase tracking-wider border-b border-neutral-800 flex justify-between">
              <span>Receitas</span>
              <span className="text-yellow-400">{filteredRecipes.length}</span>
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
                    className={`flex items-center justify-between p-1.5 sm:p-2 rounded-xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'border-yellow-400 bg-neutral-800 shadow-md ring-1 ring-yellow-400/50'
                        : affordable
                          ? 'border-neutral-700 bg-neutral-900/80 hover:border-neutral-500'
                          : 'border-neutral-800 bg-black/40 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                        affordable ? 'bg-neutral-800 border-neutral-600' : 'bg-neutral-950 border-neutral-800'
                      }`}>
                        <ItemIcon id={item.id} fallbackIcon={item.icon} size="sm" />
                      </div>
                      <div className="flex flex-col truncate">
                        <span className={`font-bold text-[11px] truncate ${isSelected ? 'text-white' : 'text-neutral-200'}`}>
                          {item.name}
                        </span>
                        <span className="text-[9px] text-neutral-400 font-mono">
                          x{recipe.outputQuantity}
                        </span>
                        {recipe.requiresStation && (
                          <span className={`text-[8px] font-semibold mt-0.5 ${hasRequiredStation(recipe) ? 'text-blue-400' : 'text-amber-400'}`}>
                            {getStationLabel(recipe.requiresStation)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 ml-1">
                      {affordable && hasRequiredStation(recipe) ? (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[8px] font-bold">
                          ✓ Pronto
                        </span>
                      ) : !hasRequiredStation(recipe) ? (
                        <span className="px-1 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800 text-[8px]">
                          Estação
                        </span>
                      ) : (
                        <span className="text-red-400 text-[8px] font-mono">
                          Falta
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Recipe Details & Craft Action */}
          {selectedRecipe && outputItem ? (
            <div className="w-[58%] sm:w-[56%] flex flex-col justify-between min-h-0 p-3 sm:p-4 bg-black/90">
              <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2">
                {/* Recipe Header */}
                <div className="flex items-start gap-2.5 pb-2 border-b border-neutral-800">
                  <div className="w-12 h-12 rounded-xl bg-neutral-900 border-2 border-neutral-700 flex items-center justify-center shadow-md shrink-0">
                    <ItemIcon id={outputItem.id} fallbackIcon={outputItem.icon} size="lg" />
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-xs sm:text-sm text-white truncate">
                        {outputItem.name}
                      </h3>
                      <span className="px-1.5 py-0.5 bg-neutral-800 border border-neutral-600 text-yellow-300 rounded text-[9px] font-pixel shrink-0">
                        +{selectedRecipe.outputQuantity}
                      </span>
                    </div>
                    <p className="text-[10px] text-neutral-300 mt-0.5 leading-snug line-clamp-2">
                      {outputItem.description}
                    </p>

                    {selectedRecipe.requiresStation && (
                      <div className={`mt-1 text-[9px] font-bold px-2 py-0.5 rounded border flex items-center gap-1 ${
                        isStationNear
                          ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                          : 'bg-amber-950/60 border-amber-800 text-amber-300'
                      }`}>
                        <span>{isStationNear ? '✓' : '⚠️'}</span>
                        <span>{isStationNear ? 'Estação Próxima:' : 'Requer Estação:'} {getStationLabel(selectedRecipe.requiresStation)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Materials Required */}
                <div className="flex flex-col gap-1.5 mt-1">
                  <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                    <span>Materiais Necessários:</span>
                    <span className={canCraft ? 'text-emerald-400' : 'text-red-400'}>
                      {canCraft ? 'Recursos Suficientes' : !isStationNear ? 'Estação Ausente' : 'Recursos Insuficientes'}
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
                          className={`flex items-center justify-between px-2 py-1.5 rounded-lg border text-[11px] ${
                            hasEnough
                              ? 'bg-neutral-900 border-neutral-700 text-neutral-200'
                              : 'bg-red-950/30 border-red-900/60 text-red-300'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <ItemIcon id={ing.itemId} fallbackIcon={ingItem?.icon} size="sm" />
                            <span className="font-medium truncate">{ingItem?.name}</span>
                          </div>
                          <div className="flex items-center gap-1.5 font-bold tabular-nums shrink-0 font-mono text-[10px]">
                            <span>{available} / {required}</span>
                            {hasEnough ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Bottom: Quantity Selector & Craft Button */}
              <div className="pt-2 border-t border-neutral-800 flex flex-col gap-1.5 shrink-0">
                {maxCraftCount > 1 && isStationNear && (
                  <div className="flex items-center justify-between text-[10px] text-neutral-400">
                    <span className="font-medium">Quantidade a fabricar:</span>
                    <div className="flex items-center gap-1">
                      {[1, 3, 5, maxCraftCount].filter((v, i, a) => v <= maxCraftCount && a.indexOf(v) === i).map(qty => (
                        <button
                          key={qty}
                          onClick={() => setCraftMultiplier(qty)}
                          className={`px-2 py-0.5 rounded text-[9px] font-bold cursor-pointer transition-all ${
                            effectiveMultiplier === qty
                              ? 'bg-neutral-100 text-black'
                              : 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800'
                          }`}
                        >
                          {qty === maxCraftCount ? `Max (${qty})` : `x${qty}`}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={handleCraft}
                  disabled={!canCraft}
                  className={`w-full py-2.5 sm:py-3 rounded-xl font-bold font-pixel text-[11px] sm:text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg ${
                    canCraft
                      ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white border-2 border-yellow-400 active:scale-95 shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                      : 'bg-neutral-900 text-neutral-500 border border-neutral-800 cursor-not-allowed opacity-60'
                  }`}
                >
                  <Hammer className="w-4 h-4" />
                  <span>
                    {canCraft 
                      ? `FABRICAR ${outputItem.name.toUpperCase()} (+${selectedRecipe.outputQuantity * effectiveMultiplier})` 
                      : !isStationNear
                        ? `REQUER ${getStationLabel(selectedRecipe.requiresStation)?.toUpperCase()}`
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
