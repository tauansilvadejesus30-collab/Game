import React, { useState } from 'react';
import { InventorySlot, Equipment, PlayerStats } from '../game/types';
import { X, Shield, Swords, Trash2, Split, Move, ArrowDownCircle } from 'lucide-react';
import { soundEngine } from '../game/audio';
import { ItemIcon } from './ItemIcon';

interface InventoryModalProps {
  inventory: (InventorySlot | null)[];
  equipment: Equipment;
  stats: PlayerStats;
  onClose: () => void;
  onUseItem: (slotIndex: number) => void;
  onEquipItem: (slotIndex: number) => void;
  onDropItem: (slotIndex: number) => void;
  onSplitStack: (slotIndex: number) => void;
  onSwapSlots?: (fromIndex: number, toIndex: number) => void;
  onOrganize?: () => void;
  onStartBuilding?: (structureId: string) => void;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({
  inventory,
  equipment,
  stats,
  onClose,
  onUseItem,
  onEquipItem,
  onDropItem,
  onSplitStack,
  onSwapSlots,
  onOrganize,
  onStartBuilding,
}) => {
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(0);
  const [movingFromIndex, setMovingFromIndex] = useState<number | null>(null);

  const selectedSlot = selectedSlotIndex !== null ? inventory[selectedSlotIndex] : null;

  const handleSlotClick = (idx: number) => {
    soundEngine.playUiClick();
    if (movingFromIndex !== null) {
      if (movingFromIndex !== idx && onSwapSlots) {
        onSwapSlots(movingFromIndex, idx);
      }
      setSelectedSlotIndex(idx);
      setMovingFromIndex(null);
    } else {
      setSelectedSlotIndex(idx);
    }
  };

  const bootsSpeed = equipment.boots?.item.speedBonus ?? 0;
  const totalDefense = (equipment.armor?.item.defense || 0) + (equipment.helmet?.item.defense || 0) + (equipment.boots?.item.defense || 0);

  return (
    <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-2 sm:p-4 select-none touch-none">
      <div className="bg-neutral-950 border-2 border-neutral-700/80 rounded-2xl w-full max-w-4xl h-[94vh] max-h-[500px] flex flex-col shadow-2xl overflow-hidden font-sans">
        {/* Header - Survival Black and White */}
        <div className="flex items-center justify-between px-3 py-2 sm:px-4 sm:py-2.5 bg-black border-b border-neutral-800 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-white text-base sm:text-lg">🎒</span>
            <h2 className="font-pixel text-xs sm:text-sm text-white tracking-wider">MOCHILA DO SOBREVIVENTE</h2>
          </div>
          <div className="flex items-center gap-2">
            {onOrganize && (
              <button
                onClick={() => {
                  soundEngine.playUiClick();
                  onOrganize();
                }}
                className="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 text-yellow-300 font-pixel text-[9px] sm:text-[10px] rounded-lg border border-neutral-700 shadow-md flex items-center gap-1 cursor-pointer active:scale-95 transition-all"
                title="Agrupar e organizar itens automaticamente"
              >
                ✨ Organizar
              </button>
            )}
            <button
              onClick={() => {
                soundEngine.playUiClick();
                onClose();
              }}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-neutral-900 hover:bg-red-950/80 text-neutral-400 hover:text-white flex items-center justify-center border border-neutral-800 cursor-pointer transition-colors active:scale-95"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-2 sm:p-3 grid grid-cols-1 sm:grid-cols-3 gap-2.5 overflow-y-auto flex-1 min-h-0">
          {/* Column 1 & 2: 24 Slots Grid */}
          <div className="sm:col-span-2 flex flex-col gap-2 min-h-0 overflow-y-auto">
            <div className="flex items-center justify-between text-[11px] text-neutral-400 font-bold px-1">
              <span className="flex items-center gap-1.5 font-mono">
                ITENS ({inventory.filter(Boolean).length}/24)
                {movingFromIndex !== null && (
                  <span className="text-[10px] text-cyan-400 animate-pulse font-normal">
                    (Toque no slot de destino para mover)
                  </span>
                )}
              </span>
              <span className="text-[9px] text-yellow-400 font-pixel">1-8 Barra Rápida</span>
            </div>

            <div className="grid grid-cols-6 gap-1.5 sm:gap-2 bg-black/60 p-2 sm:p-2.5 rounded-xl border border-neutral-800">
              {inventory.map((slot, idx) => {
                const isSelected = selectedSlotIndex === idx;
                const isMoving = movingFromIndex === idx;
                const isHotbar = idx < 8;

                return (
                  <button
                    key={idx}
                    onClick={() => handleSlotClick(idx)}
                    className={`relative aspect-square rounded-xl border-2 flex items-center justify-center transition-all cursor-pointer ${
                      isMoving
                        ? 'border-cyan-400 bg-cyan-950/60 scale-105 shadow-[0_0_12px_rgba(34,211,238,0.7)] animate-pulse'
                        : isSelected 
                          ? 'border-yellow-400 bg-neutral-800 scale-105 shadow-[0_0_10px_rgba(250,204,21,0.5)]' 
                          : isHotbar 
                            ? 'border-neutral-700 bg-neutral-900/90 hover:border-neutral-500' 
                            : 'border-neutral-800/80 bg-neutral-950 hover:border-neutral-700'
                    }`}
                  >
                    {isHotbar && (
                      <span className="absolute top-0.5 left-1 text-[7px] sm:text-[8px] font-pixel text-yellow-500/80">
                        {idx + 1}
                      </span>
                    )}

                    {slot ? (
                      <>
                        <ItemIcon id={slot.item.id} fallbackIcon={slot.item.icon} size="md" />
                        {slot.quantity > 1 && (
                          <span className="absolute bottom-0.5 right-1 text-[9px] sm:text-[10px] font-bold text-white tabular-nums drop-shadow-[0_1px_2px_rgba(0,0,0,1)]">
                            {slot.quantity}
                          </span>
                        )}
                      </>
                    ) : null}
                  </button>
                );
              })}
            </div>

            {/* Equipment Sockets */}
            <div className="mt-1">
              <span className="text-[10px] sm:text-xs font-bold text-neutral-400 px-1 font-mono">EQUIPAMENTOS</span>
              <div className="grid grid-cols-5 gap-1 sm:gap-1.5 mt-1">
                {/* Helmet */}
                <div className="bg-black/70 border border-neutral-800 p-1 rounded-xl flex items-center gap-1.5">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-neutral-900 border border-neutral-700 flex items-center justify-center shrink-0">
                    {equipment.helmet ? <ItemIcon id={equipment.helmet.item.id} fallbackIcon={equipment.helmet.item.icon} size="sm" /> : <span className="text-xs">🧢</span>}
                  </div>
                  <div className="flex flex-col text-[8px] min-w-0">
                    <span className="text-neutral-500">Capacete</span>
                    <span className="font-bold text-neutral-200 truncate">{equipment.helmet?.item.name || 'Nenhum'}</span>
                  </div>
                </div>

                {/* Armor */}
                <div className="bg-black/70 border border-neutral-800 p-1 rounded-xl flex items-center gap-1.5">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-neutral-900 border border-neutral-700 flex items-center justify-center shrink-0">
                    {equipment.armor ? <ItemIcon id={equipment.armor.item.id} fallbackIcon={equipment.armor.item.icon} size="sm" /> : <span className="text-xs">🦺</span>}
                  </div>
                  <div className="flex flex-col text-[8px] min-w-0">
                    <span className="text-neutral-500">Armadura</span>
                    <span className="font-bold text-neutral-200 truncate">{equipment.armor?.item.name || 'Nenhuma'}</span>
                  </div>
                </div>

                {/* Boots */}
                <div className="bg-black/70 border border-neutral-800 p-1 rounded-xl flex items-center gap-1.5">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-neutral-900 border border-neutral-700 flex items-center justify-center shrink-0">
                    {equipment.boots ? <ItemIcon id={equipment.boots.item.id} fallbackIcon={equipment.boots.item.icon} size="sm" /> : <span className="text-xs">🥾</span>}
                  </div>
                  <div className="flex flex-col text-[8px] min-w-0">
                    <span className="text-neutral-500">Botas</span>
                    <span className="font-bold text-neutral-200 truncate">{equipment.boots?.item.name || 'Nenhuma'}</span>
                  </div>
                </div>

                {/* Weapon */}
                <div className="bg-black/70 border border-neutral-800 p-1 rounded-xl flex items-center gap-1.5">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-neutral-900 border border-neutral-700 flex items-center justify-center shrink-0">
                    {equipment.weapon ? <ItemIcon id={equipment.weapon.item.id} fallbackIcon={equipment.weapon.item.icon} size="sm" /> : <span className="text-xs">🗡️</span>}
                  </div>
                  <div className="flex flex-col text-[8px] min-w-0">
                    <span className="text-neutral-500">Arma</span>
                    <span className="font-bold text-neutral-200 truncate">{equipment.weapon?.item.name || 'Nenhuma'}</span>
                  </div>
                </div>

                {/* Stats Summary */}
                <div className="bg-black/70 border border-neutral-800 p-1 rounded-xl flex flex-col justify-center text-[8px] font-mono">
                  <div className="flex items-center justify-between text-red-400">
                    <span className="flex items-center gap-0.5"><Swords className="w-2.5 h-2.5" /> Dano:</span>
                    <span className="font-bold">{equipment.weapon?.item.damage || 10}</span>
                  </div>
                  <div className="flex items-center justify-between text-blue-400">
                    <span className="flex items-center gap-0.5"><Shield className="w-2.5 h-2.5" /> Def:</span>
                    <span className="font-bold">{totalDefense}</span>
                  </div>
                  {bootsSpeed > 0 && (
                    <div className="flex items-center justify-between text-emerald-400">
                      <span>⚡ Vel:</span>
                      <span className="font-bold">+{bootsSpeed}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Column 3: Item Inspector Card & Action Buttons */}
          <div className="bg-black/80 border border-neutral-800 rounded-xl p-3 flex flex-col justify-between">
            {selectedSlot ? (
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center gap-2.5 pb-2.5 border-b border-neutral-800">
                  <div className="w-12 h-12 rounded-xl bg-neutral-900 border-2 border-neutral-700 flex items-center justify-center shadow-lg shrink-0">
                    <ItemIcon id={selectedSlot.item.id} fallbackIcon={selectedSlot.item.icon} size="lg" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <h3 className="font-bold text-xs sm:text-sm text-white truncate">{selectedSlot.item.name}</h3>
                    <span className="text-[9px] text-neutral-400 uppercase tracking-wider font-mono">
                      {selectedSlot.item.category} · Qtd: {selectedSlot.quantity}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-neutral-300 leading-relaxed font-sans line-clamp-3">
                  {selectedSlot.item.description}
                </p>

                {/* Attributes breakdown */}
                <div className="flex flex-col gap-1 bg-neutral-900/80 p-2 rounded-lg border border-neutral-800 text-[10px] font-mono">
                  {selectedSlot.item.damage && (
                    <div className="flex justify-between text-red-400">
                      <span>Poder de Ataque</span>
                      <span className="font-bold">+{selectedSlot.item.damage}</span>
                    </div>
                  )}
                  {selectedSlot.item.defense && (
                    <div className="flex justify-between text-blue-400">
                      <span>Defesa Blindada</span>
                      <span className="font-bold">+{selectedSlot.item.defense}</span>
                    </div>
                  )}
                  {selectedSlot.item.hunger && (
                    <div className="flex justify-between text-amber-400">
                      <span>Sacia Fome</span>
                      <span className="font-bold">+{selectedSlot.item.hunger}</span>
                    </div>
                  )}
                  {selectedSlot.item.thirst && (
                    <div className="flex justify-between text-sky-400">
                      <span>Sacia Sede</span>
                      <span className="font-bold">+{selectedSlot.item.thirst}</span>
                    </div>
                  )}
                  {selectedSlot.item.health && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Cura Vida</span>
                      <span className="font-bold">+{selectedSlot.item.health}</span>
                    </div>
                  )}
                  {selectedSlot.item.toolType && (
                    <div className="flex justify-between text-yellow-300">
                      <span>Ferramenta</span>
                      <span className="font-bold uppercase">{selectedSlot.item.toolType} T{selectedSlot.item.toolTier || 1}</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-neutral-500 py-6">
                <span className="text-3xl mb-2 opacity-50">🎒</span>
                <p className="text-xs font-pixel">SELECIONE UM ITEM</p>
                <p className="text-[10px] mt-1 font-sans">Toque em qualquer slot para ver detalhes e usar</p>
              </div>
            )}

            {/* Action Buttons */}
            {selectedSlot && selectedSlotIndex !== null && (
              <div className="flex flex-col gap-1.5 mt-2 pt-2 border-t border-neutral-800">
                <div className="grid grid-cols-2 gap-1.5">
                  {/* Use / Consume / Build */}
                  {selectedSlot.item.placeableStructureId ? (
                    <button
                      onClick={() => {
                        soundEngine.playUiClick();
                        onStartBuilding?.(selectedSlot.item.placeableStructureId!);
                        onClose();
                      }}
                      className="py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-pixel text-[9px] rounded-lg border border-emerald-500 shadow-md flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                    >
                      <ArrowDownCircle className="w-3 h-3" />
                      CONSTRUIR
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        soundEngine.playUiClick();
                        onUseItem(selectedSlotIndex);
                      }}
                      className="py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white font-pixel text-[9px] rounded-lg border border-neutral-600 shadow-md flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                    >
                      USAR
                    </button>
                  )}

                  {/* Equip */}
                  {(selectedSlot.item.category === 'equipment' || selectedSlot.item.category === 'tool') ? (
                    <button
                      onClick={() => {
                        soundEngine.playUiClick();
                        onEquipItem(selectedSlotIndex);
                      }}
                      className="py-1.5 bg-blue-700 hover:bg-blue-600 text-white font-pixel text-[9px] rounded-lg border border-blue-500 shadow-md flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                    >
                      <Shield className="w-3 h-3" />
                      EQUIPAR
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        soundEngine.playUiClick();
                        setMovingFromIndex(movingFromIndex === selectedSlotIndex ? null : selectedSlotIndex);
                      }}
                      className={`py-1.5 text-white font-pixel text-[9px] rounded-lg border shadow-md flex items-center justify-center gap-1 cursor-pointer active:scale-95 ${
                        movingFromIndex === selectedSlotIndex 
                          ? 'bg-cyan-700 border-cyan-400' 
                          : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-600'
                      }`}
                    >
                      <Move className="w-3 h-3" />
                      {movingFromIndex === selectedSlotIndex ? 'MOVER...' : 'MOVER'}
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  {/* Split Stack */}
                  {selectedSlot.quantity > 1 ? (
                    <button
                      onClick={() => {
                        soundEngine.playUiClick();
                        onSplitStack(selectedSlotIndex);
                      }}
                      className="py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-pixel text-[8px] rounded-lg border border-neutral-700 flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                    >
                      <Split className="w-3 h-3" />
                      DIVIDIR
                    </button>
                  ) : (
                    <div />
                  )}

                  {/* Drop Item */}
                  <button
                    onClick={() => {
                      soundEngine.playUiClick();
                      onDropItem(selectedSlotIndex);
                    }}
                    className="py-1.5 bg-neutral-900 hover:bg-red-950 text-red-400 hover:text-white font-pixel text-[8px] rounded-lg border border-neutral-800 hover:border-red-800 flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                  >
                    <Trash2 className="w-3 h-3" />
                    DESCARTAR
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
