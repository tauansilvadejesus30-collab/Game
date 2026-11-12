import React, { useState } from 'react';
import { InventorySlot, StructureEntity } from '../game/types';
import { X, Package, ArrowDownUp } from 'lucide-react';
import { soundEngine } from '../game/audio';
import { ItemIcon } from './ItemIcon';

interface ChestModalProps {
  chest: StructureEntity;
  playerInventory: (InventorySlot | null)[];
  onClose: () => void;
  onUpdateInventories: (chestInv: (InventorySlot | null)[], playerInv: (InventorySlot | null)[]) => void;
}

export const ChestModal: React.FC<ChestModalProps> = ({
  chest,
  playerInventory,
  onClose,
  onUpdateInventories,
}) => {
  const [chestSlots, setChestSlots] = useState<(InventorySlot | null)[]>(
    chest.chestInventory || new Array(16).fill(null)
  );
  const [playerSlots, setPlayerSlots] = useState<(InventorySlot | null)[]>([...playerInventory]);

  // Transfer item from chest to player
  const transferChestToPlayer = (index: number) => {
    const itemSlot = chestSlots[index];
    if (!itemSlot) return;

    // Find empty slot in player inventory
    const pIdx = playerSlots.findIndex(s => s === null);
    if (pIdx === -1) return; // Player inventory full

    const newChest = [...chestSlots];
    const newPlayer = [...playerSlots];
    newPlayer[pIdx] = itemSlot;
    newChest[index] = null;

    soundEngine.playPickup();
    setChestSlots(newChest);
    setPlayerSlots(newPlayer);
    onUpdateInventories(newChest, newPlayer);
  };

  // Transfer item from player to chest
  const transferPlayerToChest = (index: number) => {
    const itemSlot = playerSlots[index];
    if (!itemSlot) return;

    // Find empty slot in chest
    const cIdx = chestSlots.findIndex(s => s === null);
    if (cIdx === -1) return; // Chest full

    const newChest = [...chestSlots];
    const newPlayer = [...playerSlots];
    newChest[cIdx] = itemSlot;
    newPlayer[index] = null;

    soundEngine.playBuild();
    setChestSlots(newChest);
    setPlayerSlots(newPlayer);
    onUpdateInventories(newChest, newPlayer);
  };

  return (
    <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-3 select-none touch-none">
      <div className="bg-neutral-950 border-2 border-neutral-700/80 rounded-2xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden font-sans">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-black border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-amber-400" />
            <h2 className="font-pixel text-xs sm:text-sm text-white">BAÚ DE ARMAZENAMENTO</h2>
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
        <div className="p-3 sm:p-5 overflow-y-auto flex flex-col gap-3">
          {/* Top: Chest Slots (16) */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-bold text-neutral-300 font-mono">COMPARTIMENTO DO BAÚ (16 Slots)</span>
            <div className="grid grid-cols-8 gap-1.5 bg-black/60 p-2.5 rounded-xl border border-neutral-800">
              {chestSlots.map((slot, idx) => (
                <button
                  key={idx}
                  onClick={() => transferChestToPlayer(idx)}
                  className="relative aspect-square rounded-lg border border-neutral-700 bg-neutral-900/90 hover:border-yellow-400 flex items-center justify-center cursor-pointer transition-all active:scale-95"
                  title={slot ? `${slot.item.name} (Toque para pegar)` : 'Vazio'}
                >
                  {slot ? (
                    <>
                      <ItemIcon id={slot.item.id} fallbackIcon={slot.item.icon} size="sm" />
                      {slot.quantity > 1 && (
                        <span className="absolute bottom-0 right-1 text-[9px] font-bold text-white tabular-nums drop-shadow">
                          {slot.quantity}
                        </span>
                      )}
                    </>
                  ) : null}
                </button>
              ))}
            </div>
          </div>

          {/* Transfer Indicator */}
          <div className="flex items-center justify-center gap-2 text-[10px] text-neutral-400 py-1">
            <ArrowDownUp className="w-3.5 h-3.5 text-neutral-500" />
            <span>Toque no item para transferir entre baú e mochila</span>
          </div>

          {/* Bottom: Player Inventory (24) */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-bold text-neutral-300 font-mono">SUA MOCHILA (24 Slots)</span>
            <div className="grid grid-cols-8 gap-1.5 bg-black/60 p-2.5 rounded-xl border border-neutral-800">
              {playerSlots.map((slot, idx) => (
                <button
                  key={idx}
                  onClick={() => transferPlayerToChest(idx)}
                  className="relative aspect-square rounded-lg border border-neutral-800 bg-neutral-950 hover:border-yellow-400 flex items-center justify-center cursor-pointer transition-all active:scale-95"
                  title={slot ? `${slot.item.name} (Toque para guardar)` : 'Vazio'}
                >
                  {slot ? (
                    <>
                      <ItemIcon id={slot.item.id} fallbackIcon={slot.item.icon} size="sm" />
                      {slot.quantity > 1 && (
                        <span className="absolute bottom-0 right-1 text-[9px] font-bold text-white tabular-nums drop-shadow">
                          {slot.quantity}
                        </span>
                      )}
                    </>
                  ) : null}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
