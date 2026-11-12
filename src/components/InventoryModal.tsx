import React, { useState } from 'react';
import { InventorySlot, Equipment, PlayerStats } from '../game/types';
import { X, Shield, Swords, Sparkles, Trash2, Split } from 'lucide-react';
import { soundEngine } from '../game/audio';

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
    <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-3">
      <div className="bg-[#171926] border-2 border-[#4b4e6d] rounded-2xl w-full max-w-4xl h-[92vh] max-h-[460px] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 sm:py-2.5 bg-[#12141f] border-b border-[#2b2e42] shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎒</span>
            <h2 className="font-pixel text-xs sm:text-sm text-amber-400">INVENTÁRIO & EQUIPAMENTO</h2>
          </div>
          <div className="flex items-center gap-2">
            {onOrganize && (
              <button
                onClick={() => {
                  soundEngine.playUiClick();
                  onOrganize();
                }}
                className="px-2.5 py-1 bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-white font-pixel text-[10px] rounded-lg shadow flex items-center gap-1 cursor-pointer transition-transform active:scale-95"
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
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#25283b] hover:bg-rose-900/60 text-gray-300 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 overflow-y-auto flex-1 min-h-0">
          {/* Column 1 & 2: 24 Slots Grid */}
          <div className="sm:col-span-2 flex flex-col gap-2 min-h-0 overflow-y-auto">
            <div className="flex items-center justify-between text-xs text-gray-400 font-bold px-1">
              <span className="flex items-center gap-1.5">
                MOCHILA ({inventory.filter(Boolean).length}/24)
                {movingFromIndex !== null && (
                  <span className="text-[10px] text-cyan-400 animate-pulse font-normal">
                    (Selecione o destino para mover/trocar)
                  </span>
                )}
              </span>
              <span className="text-[10px] text-yellow-400/80 font-pixel">1-8 Barra Rápida</span>
            </div>

            <div className="grid grid-cols-6 gap-1.5 sm:gap-2 bg-[#10121a] p-2.5 rounded-xl border border-[#26283b]">
              {inventory.map((slot, idx) => {
                const isSelected = selectedSlotIndex === idx;
                const isMoving = movingFromIndex === idx;
                const isHotbar = idx < 8;

                return (
                  <button
                    key={idx}
                    onClick={() => handleSlotClick(idx)}
                    className={`relative aspect-square rounded-lg border-2 flex items-center justify-center transition-all cursor-pointer ${
                      isMoving
                        ? 'border-cyan-400 bg-[#164e63] scale-105 shadow-[0_0_12px_rgba(34,211,238,0.7)] animate-pulse'
                        : isSelected 
                          ? 'border-yellow-400 bg-[#2d334d] scale-105 shadow-[0_0_8px_rgba(250,204,21,0.5)]' 
                          : isHotbar 
                            ? 'border-[#3b3f5c] bg-[#1a1c29] hover:border-[#5a608a]' 
                            : 'border-[#26283b] bg-[#141622] hover:border-[#434766]'
                    }`}
                  >
                    {isHotbar && (
                      <span className="absolute top-0.5 left-1 text-[8px] font-pixel text-yellow-500/70">
                        {idx + 1}
                      </span>
                    )}

                    {slot ? (
                      <>
                        <span className="text-2xl select-none">{slot.item.icon}</span>
                        {slot.quantity > 1 && (
                          <span className="absolute bottom-0.5 right-1 text-xs font-bold text-white tabular-nums drop-shadow">
                            {slot.quantity}
                          </span>
                        )}
                      </>
                    ) : null}
                  </button>
                );
              })}
            </div>

            {/* Equipment Sockets (5 Columns: Capacete, Armadura, Botas, Mão, Atributos) */}
            <div className="mt-2">
              <span className="text-xs font-bold text-gray-400 px-1">EQUIPAMENTOS</span>
              <div className="grid grid-cols-5 gap-1.5 mt-1.5">
                {/* Helmet */}
                <div className="bg-[#12141f] border border-[#2b2e42] p-1.5 rounded-xl flex items-center gap-1.5">
                  <div className="w-8 h-8 rounded-lg bg-[#1a1c29] border border-[#3b3e59] flex items-center justify-center text-base shrink-0">
                    {equipment.helmet ? equipment.helmet.item.icon : '🧢'}
                  </div>
                  <div className="flex flex-col text-[9px] min-w-0">
                    <span className="text-gray-400">Capacete</span>
                    <span className="font-bold text-gray-200 truncate">{equipment.helmet?.item.name || 'Nenhum'}</span>
                  </div>
                </div>

                {/* Armor */}
                <div className="bg-[#12141f] border border-[#2b2e42] p-1.5 rounded-xl flex items-center gap-1.5">
                  <div className="w-8 h-8 rounded-lg bg-[#1a1c29] border border-[#3b3e59] flex items-center justify-center text-base shrink-0">
                    {equipment.armor ? equipment.armor.item.icon : '🦺'}
                  </div>
                  <div className="flex flex-col text-[9px] min-w-0">
                    <span className="text-gray-400">Armadura</span>
                    <span className="font-bold text-gray-200 truncate">{equipment.armor?.item.name || 'Nenhum'}</span>
                  </div>
                </div>

                {/* Boots */}
                <div className="bg-[#12141f] border border-[#2b2e42] p-1.5 rounded-xl flex items-center gap-1.5">
                  <div className="w-8 h-8 rounded-lg bg-[#1a1c29] border border-[#3b3e59] flex items-center justify-center text-base shrink-0">
                    {equipment.boots ? equipment.boots.item.icon : '🥾'}
                  </div>
                  <div className="flex flex-col text-[9px] min-w-0">
                    <span className="text-gray-400">Botas</span>
                    <span className="font-bold text-gray-200 truncate">{equipment.boots?.item.name || 'Nenhuma'}</span>
                  </div>
                </div>

                {/* Weapon */}
                <div className="bg-[#12141f] border border-[#2b2e42] p-1.5 rounded-xl flex items-center gap-1.5">
                  <div className="w-8 h-8 rounded-lg bg-[#1a1c29] border border-[#3b3e59] flex items-center justify-center text-base shrink-0">
                    {equipment.weapon ? equipment.weapon.item.icon : '🗡️'}
                  </div>
                  <div className="flex flex-col text-[9px] min-w-0">
                    <span className="text-gray-400">Arma</span>
                    <span className="font-bold text-gray-200 truncate">{equipment.weapon?.item.name || 'Nenhum'}</span>
                  </div>
                </div>

                {/* Stats Summary */}
                <div className="bg-[#12141f] border border-[#2b2e42] p-1.5 rounded-xl flex flex-col justify-center text-[9px]">
                  <div className="flex items-center justify-between text-red-300">
                    <span className="flex items-center gap-0.5"><Swords className="w-2.5 h-2.5" /> Dano:</span>
                    <span className="font-bold">{equipment.weapon?.item.damage || 10}</span>
                  </div>
                  <div className="flex items-center justify-between text-blue-300">
                    <span className="flex items-center gap-0.5"><Shield className="w-2.5 h-2.5" /> Def:</span>
                    <span className="font-bold">{totalDefense}</span>
                  </div>
                  {bootsSpeed > 0 && (
                    <div className="flex items-center justify-between text-emerald-300">
                      <span className="flex items-center gap-0.5">⚡ Vel:</span>
                      <span className="font-bold">+{bootsSpeed}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Column 3: Item Inspector Card & Action Buttons */}
          <div className="bg-[#10121a] border border-[#2b2e42] rounded-xl p-4 flex flex-col justify-between">
            {selectedSlot ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 pb-3 border-b border-[#2b2e42]">
                  <div className="w-14 h-14 rounded-xl bg-[#1c1f2e] border-2 border-yellow-400/40 flex items-center justify-center text-3xl shadow">
                    {selectedSlot.item.icon}
                  </div>
                  <div className="flex flex-col">
                    <h3 className="font-bold text-sm text-yellow-300">{selectedSlot.item.name}</h3>
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                      {selectedSlot.item.category} • Qtd: {selectedSlot.quantity}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-gray-300 leading-relaxed">
                  {selectedSlot.item.description}
                </p>

                {/* Attributes breakdown */}
                <div className="flex flex-col gap-1.5 bg-[#171926] p-2.5 rounded-lg border border-[#26283b] text-xs">
                  {selectedSlot.item.damage && (
                    <div className="flex justify-between text-red-400">
                      <span>Poder de Ataque</span>
                      <span className="font-bold">+{selectedSlot.item.damage}</span>
                    </div>
                  )}
                  {selectedSlot.item.defense && (
                    <div className="flex justify-between text-blue-400">
                      <span>Defesa / Armadura</span>
                      <span className="font-bold">+{selectedSlot.item.defense}</span>
                    </div>
                  )}
                  {selectedSlot.item.hunger && (
                    <div className="flex justify-between text-amber-400">
                      <span>Recupera Fome</span>
                      <span className="font-bold">+{selectedSlot.item.hunger}</span>
                    </div>
                  )}
                  {selectedSlot.item.thirst && (
                    <div className="flex justify-between text-cyan-400">
                      <span>Recupera Sede</span>
                      <span className="font-bold">+{selectedSlot.item.thirst}</span>
                    </div>
                  )}
                  {selectedSlot.item.health && (
                    <div className="flex justify-between text-rose-400">
                      <span>Cura Vida</span>
                      <span className="font-bold">+{selectedSlot.item.health}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 mt-2">
                  {selectedSlot.item.placeableStructureId && (
                    <button
                      onClick={() => {
                        if (selectedSlot.item.placeableStructureId) {
                          soundEngine.playBuild();
                          onStartBuilding?.(selectedSlot.item.placeableStructureId);
                        }
                      }}
                      className="w-full py-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 font-bold text-xs rounded-lg text-white shadow cursor-pointer active:scale-95 flex items-center justify-center gap-1.5 border border-emerald-400/50"
                    >
                      <Sparkles className="w-4 h-4 text-emerald-200" /> Posicionar no Mapa
                    </button>
                  )}

                  {selectedSlot.item.category === 'food' && (
                    <button
                      onClick={() => selectedSlotIndex !== null && onUseItem(selectedSlotIndex)}
                      className="w-full py-2 bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 font-bold text-xs rounded-lg text-white shadow cursor-pointer active:scale-95"
                    >
                      Consumir / Usar
                    </button>
                  )}

                  {selectedSlot.item.category === 'equipment' && (
                    <button
                      onClick={() => selectedSlotIndex !== null && onEquipItem(selectedSlotIndex)}
                      className="w-full py-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 font-bold text-xs rounded-lg text-white shadow cursor-pointer active:scale-95"
                    >
                      Equipar
                    </button>
                  )}

                  {selectedSlot.quantity > 1 && (
                    <button
                      onClick={() => selectedSlotIndex !== null && onSplitStack(selectedSlotIndex)}
                      className="w-full py-1.5 bg-[#202436] hover:bg-[#2c324b] text-gray-200 font-bold text-xs rounded-lg border border-[#3b3f5c] flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Split className="w-3.5 h-3.5" /> Dividir Metade
                    </button>
                  )}

                  <button
                    onClick={() => {
                      if (selectedSlotIndex !== null) {
                        setMovingFromIndex(movingFromIndex === selectedSlotIndex ? null : selectedSlotIndex);
                        soundEngine.playUiClick();
                      }
                    }}
                    className={`w-full py-1.5 font-bold text-xs rounded-lg border flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                      movingFromIndex === selectedSlotIndex 
                        ? 'bg-cyan-900/60 border-cyan-400 text-cyan-200' 
                        : 'bg-[#202436] hover:bg-[#2c324b] text-gray-200 border-[#3b3f5c]'
                    }`}
                  >
                    ⇄ {movingFromIndex === selectedSlotIndex ? 'Cancelar Movimento' : 'Mover / Trocar Slot'}
                  </button>

                  <button
                    onClick={() => selectedSlotIndex !== null && onDropItem(selectedSlotIndex)}
                    className="w-full py-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 font-bold text-xs rounded-lg border border-rose-900/50 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Descartar no Chão
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-gray-500 text-xs text-center">
                <Sparkles className="w-8 h-8 mb-2 opacity-30" />
                Selecione um item da mochila para ver detalhes e ações.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
