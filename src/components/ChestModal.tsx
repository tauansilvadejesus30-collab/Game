import React, { useState } from 'react';
import { InventorySlot, StructureEntity } from '../game/types';
import { X, ArrowDownUp, Package } from 'lucide-react';
import { soundEngine } from '../game/audio';

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
    <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-3">
      <div className="bg-[#171926] border-2 border-[#4b4e6d] rounded-2xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#12141f] border-b border-[#2b2e42]">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-amber-400" />
            <h2 className="font-pixel text-sm md:text-base text-amber-400">BAÚ DE MADEIRA</h2>
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
        <div className="p-4 md:p-6 overflow-y-auto flex flex-col gap-4">
          {/* Top: Chest Slots (16) */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-amber-300">COMPARTIMENTO DO BAÚ (16 Slots)</span>
            <div className="grid grid-cols-8 gap-1.5 bg-[#10121a] p-3 rounded-xl border border-[#26283b]">
              {chestSlots.map((slot, idx) => (
                <button
                  key={idx}
                  onClick={() => transferChestToPlayer(idx)}
                  className="relative aspect-square rounded-lg border border-[#3b3f5c] bg-[#1a1c29] hover:border-yellow-400 flex items-center justify-center cursor-pointer transition-all"
                  title={slot ? `${slot.item.name} (Clique para pegar)` : 'Vazio'}
                >
                  {slot ? (
                    <>
                      <span className="text-xl select-none">{slot.item.icon}</span>
                      {slot.quantity > 1 && (
                        <span className="absolute bottom-0.5 right-1 text-[10px] font-bold text-white tabular-nums drop-shadow">
                          {slot.quantity}
                        </span>
                      )}
                    </>
                  ) : null}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center text-xs text-gray-500 font-bold gap-2">
            <ArrowDownUp className="w-4 h-4 text-gray-400" />
            <span>Clique nos itens para transferir entre baú e mochila</span>
          </div>

          {/* Bottom: Player Inventory (24) */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-gray-300">SUA MOCHILA</span>
            <div className="grid grid-cols-8 gap-1.5 bg-[#10121a] p-3 rounded-xl border border-[#26283b]">
              {playerSlots.map((slot, idx) => (
                <button
                  key={idx}
                  onClick={() => transferPlayerToChest(idx)}
                  className="relative aspect-square rounded-lg border border-[#26283b] bg-[#141622] hover:border-yellow-400 flex items-center justify-center cursor-pointer transition-all"
                  title={slot ? `${slot.item.name} (Clique para guardar)` : 'Vazio'}
                >
                  {slot ? (
                    <>
                      <span className="text-xl select-none">{slot.item.icon}</span>
                      {slot.quantity > 1 && (
                        <span className="absolute bottom-0.5 right-1 text-[10px] font-bold text-white tabular-nums drop-shadow">
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
