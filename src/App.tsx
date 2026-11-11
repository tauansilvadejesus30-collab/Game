/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from './game/engine';
import { HUD } from './components/HUD';
import { TitleScreen } from './components/TitleScreen';
import { InventoryModal } from './components/InventoryModal';
import { CraftingModal } from './components/CraftingModal';
import { BuildingModal } from './components/BuildingModal';
import { WorldMapModal } from './components/WorldMapModal';
import { ChestModal } from './components/ChestModal';
import { CookingModal } from './components/CookingModal';
import { SkillsModal } from './components/SkillsModal';
import { QuestsModal } from './components/QuestsModal';
import { PauseModal } from './components/PauseModal';
import { GameOverModal } from './components/GameOverModal';
import { SettingsModal } from './components/SettingsModal';
import { GuideModal } from './components/GuideModal';
import { Recipe, StructureEntity, InventorySlot } from './game/types';
import { ITEMS } from './game/constants';
import { saveGame, clearSavedGame } from './game/saveManager';
import { soundEngine } from './game/audio';

type GameState = 'title' | 'playing' | 'paused' | 'gameover';

type ModalType = 
  | null 
  | 'inventory' 
  | 'crafting' 
  | 'building' 
  | 'map' 
  | 'skills' 
  | 'quests' 
  | 'chest' 
  | 'cooking' 
  | 'settings' 
  | 'guide';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // High-level game state
  const [gameState, setGameState] = useState<GameState>('title');
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [activeChest, setActiveChest] = useState<StructureEntity | null>(null);
  const [activeCookingStation, setActiveCookingStation] = useState<StructureEntity | null>(null);

  // Sync state for HUD re-renders (throttled)
  const [, setTick] = useState(0);
  const forceUpdate = useCallback(() => setTick(t => t + 1), []);

  // Orientation / Landscape mode detection
  const [isPortrait, setIsPortrait] = useState<boolean>(false);
  const [dismissPortraitWarning, setDismissPortraitWarning] = useState<boolean>(false);

  useEffect(() => {
    const checkOrientation = () => {
      const portrait = window.innerHeight > window.innerWidth && window.innerWidth < 900;
      setIsPortrait(portrait);
    };
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  // Update document.body.dataset.state
  useEffect(() => {
    document.body.dataset.state = gameState;
  }, [gameState]);

  // Check URL params for ?autostart=1
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('autostart') === '1') {
      startGame(false);
    }
  }, []);

  // Initialize Game Engine on Canvas mount
  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new GameEngine(canvasRef.current);
    engineRef.current = engine;

    // Connect Engine callbacks to React UI
    engine.onStateChange = () => forceUpdate();
    engine.onOpenInventory = () => setActiveModal('inventory');
    engine.onOpenCrafting = () => setActiveModal('crafting');
    engine.onOpenBuilding = () => setActiveModal('building');
    engine.onOpenMap = () => setActiveModal('map');
    engine.onOpenSkills = () => setActiveModal('skills');
    engine.onOpenChest = (chest) => {
      setActiveChest(chest);
      setActiveModal('chest');
    };
    engine.onOpenCooking = (station) => {
      setActiveCookingStation(station);
      setActiveModal('cooking');
    };
    engine.onGameOver = () => {
      setGameState('gameover');
      engine.stop();
    };

    return () => {
      engine.stop();
    };
  }, [forceUpdate]);

  // Pause / Resume with Esc key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Escape' || e.code === 'KeyP') {
        if (activeModal !== null) {
          setActiveModal(null);
          return;
        }
        if (gameState === 'playing') {
          setGameState('paused');
          engineRef.current?.stop();
        } else if (gameState === 'paused') {
          setGameState('playing');
          engineRef.current?.start();
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [gameState, activeModal]);

  // Actions
  const startGame = (isNew: boolean) => {
    if (isNew) {
      clearSavedGame();
    }
    setGameState('playing');
    setActiveModal(null);
    if (canvasRef.current && !engineRef.current) {
      const engine = new GameEngine(canvasRef.current);
      engineRef.current = engine;
    }
    engineRef.current?.start();
  };

  const handleResume = () => {
    setGameState('playing');
    engineRef.current?.start();
  };

  const handleManualSave = () => {
    if (engineRef.current) {
      const success = saveGame(engineRef.current.player, engineRef.current.world, engineRef.current.quests);
      if (success) {
        engineRef.current.addFloatingText(engineRef.current.player.x, engineRef.current.player.y - 30, 'Jogo Salvo com Sucesso!', '#44ff44');
      }
    }
  };

  const handleRestart = () => {
    clearSavedGame();
    window.location.reload();
  };

  const handleTitle = () => {
    handleManualSave();
    engineRef.current?.stop();
    setGameState('title');
    setActiveModal(null);
  };

  const handleRespawn = () => {
    if (engineRef.current) {
      engineRef.current.respawnPlayer();
      setGameState('playing');
      engineRef.current.start();
      forceUpdate();
    }
  };

  // Inventory actions
  const handleUseItem = (slotIndex: number) => {
    if (!engineRef.current) return;
    const slot = engineRef.current.player.inventory[slotIndex];
    if (!slot) return;
    const item = slot.item;

    if (item.hunger) engineRef.current.player.stats.hunger = Math.min(engineRef.current.player.stats.maxHunger, engineRef.current.player.stats.hunger + item.hunger);
    if (item.thirst) engineRef.current.player.stats.thirst = Math.min(engineRef.current.player.stats.maxThirst, engineRef.current.player.stats.thirst + item.thirst);
    if (item.energy) engineRef.current.player.stats.energy = Math.min(engineRef.current.player.stats.maxEnergy, engineRef.current.player.stats.energy + item.energy);
    if (item.health) engineRef.current.player.stats.hp = Math.min(engineRef.current.player.stats.maxHp, engineRef.current.player.stats.hp + item.health);
    if (item.temperatureEffect) engineRef.current.player.stats.bodyTemp += item.temperatureEffect;

    soundEngine.playEat();
    slot.quantity--;
    if (slot.quantity <= 0) {
      engineRef.current.player.inventory[slotIndex] = null;
    }
    forceUpdate();
  };

  const handleEquipItem = (slotIndex: number) => {
    if (!engineRef.current) return;
    const slot = engineRef.current.player.inventory[slotIndex];
    if (!slot) return;

    if (slot.item.category === 'equipment') {
      if (slot.item.id.includes('helmet')) {
        const old = engineRef.current.player.equipment.helmet;
        engineRef.current.player.equipment.helmet = slot;
        engineRef.current.player.inventory[slotIndex] = old;
      } else if (slot.item.id.includes('armor')) {
        const old = engineRef.current.player.equipment.armor;
        engineRef.current.player.equipment.armor = slot;
        engineRef.current.player.inventory[slotIndex] = old;
      } else if (slot.item.id.includes('boots')) {
        const old = engineRef.current.player.equipment.boots;
        engineRef.current.player.equipment.boots = slot;
        engineRef.current.player.inventory[slotIndex] = old;
      }
      soundEngine.playBuild();
      forceUpdate();
    }
  };

  const handleSwapSlots = (fromIndex: number, toIndex: number) => {
    if (!engineRef.current) return;
    const inv = engineRef.current.player.inventory;
    const temp = inv[fromIndex];
    inv[fromIndex] = inv[toIndex];
    inv[toIndex] = temp;
    soundEngine.playUiClick();
    forceUpdate();
  };

  const handleOrganizeInventory = () => {
    if (!engineRef.current) return;
    const inv = engineRef.current.player.inventory;

    // 1. Merge identical stackable items
    for (let i = 0; i < inv.length; i++) {
      const slot = inv[i];
      if (!slot || !slot.item.stackable || slot.quantity >= slot.item.maxStack) continue;
      for (let j = i + 1; j < inv.length; j++) {
        const other = inv[j];
        if (other && other.item.id === slot.item.id) {
          const space = slot.item.maxStack - slot.quantity;
          const transfer = Math.min(space, other.quantity);
          slot.quantity += transfer;
          other.quantity -= transfer;
          if (other.quantity <= 0) {
            inv[j] = null;
          }
          if (slot.quantity >= slot.item.maxStack) break;
        }
      }
    }

    // 2. Sort by category priority
    const categoryPriority: Record<string, number> = {
      tool: 1,
      weapon: 2,
      equipment: 3,
      food: 4,
      survival: 5,
      building: 6,
      resource: 7,
      seed: 8,
    };

    const items = inv.filter((s): s is InventorySlot => s !== null);
    items.sort((a, b) => {
      const catA = categoryPriority[a.item.category] ?? 99;
      const catB = categoryPriority[b.item.category] ?? 99;
      if (catA !== catB) return catA - catB;
      return a.item.name.localeCompare(b.item.name);
    });

    const newInv = new Array(24).fill(null);
    for (let i = 0; i < items.length; i++) {
      newInv[i] = items[i];
    }
    engineRef.current.player.inventory = newInv;
    soundEngine.playLevelUp();
    forceUpdate();
  };

  const handleDropItem = (slotIndex: number) => {
    if (!engineRef.current) return;
    const slot = engineRef.current.player.inventory[slotIndex];
    if (!slot) return;

    engineRef.current.spawnLoot(engineRef.current.player.x, engineRef.current.player.y, slot.item.id, slot.quantity);
    engineRef.current.player.inventory[slotIndex] = null;
    soundEngine.playPickup();
    forceUpdate();
  };

  const handleSplitStack = (slotIndex: number) => {
    if (!engineRef.current) return;
    const slot = engineRef.current.player.inventory[slotIndex];
    if (!slot || slot.quantity <= 1) return;

    const emptyIdx = engineRef.current.player.inventory.findIndex(s => s === null);
    if (emptyIdx === -1) return;

    const half = Math.floor(slot.quantity / 2);
    slot.quantity -= half;
    engineRef.current.player.inventory[emptyIdx] = { item: slot.item, quantity: half };
    soundEngine.playUiClick();
    forceUpdate();
  };

  // Crafting action
  const handleCraft = (recipe: Recipe) => {
    if (!engineRef.current) return;

    // Deduct ingredients
    for (const req of recipe.ingredients) {
      let needed = req.quantity;
      for (const slot of engineRef.current.player.inventory) {
        if (slot && slot.item.id === req.itemId) {
          const take = Math.min(slot.quantity, needed);
          slot.quantity -= take;
          needed -= take;
          if (slot.quantity <= 0) {
            const idx = engineRef.current.player.inventory.indexOf(slot);
            engineRef.current.player.inventory[idx] = null;
          }
          if (needed <= 0) break;
        }
      }
    }

    // Add crafted item
    const output = ITEMS[recipe.outputItemId];
    if (output) {
      engineRef.current.addItemToInventory(output, recipe.outputQuantity);
      engineRef.current.checkQuestProgress('craft', recipe.category === 'tools' ? 'tool' : recipe.outputItemId, recipe.outputQuantity);
      engineRef.current.addFloatingText(engineRef.current.player.x, engineRef.current.player.y - 25, `+${recipe.outputQuantity} ${output.name}`, '#44ff44');
    }
    forceUpdate();
  };

  // Cooking action
  const handleCookItem = (inputItemId: string, outputItemId: string, fuelItemId?: string) => {
    if (!engineRef.current) return;

    // Deduct input
    const inSlot = engineRef.current.player.inventory.find(s => s && s.item.id === inputItemId);
    if (inSlot) {
      inSlot.quantity--;
      if (inSlot.quantity <= 0) {
        const idx = engineRef.current.player.inventory.indexOf(inSlot);
        engineRef.current.player.inventory[idx] = null;
      }
    }

    // Deduct fuel if any
    if (fuelItemId) {
      const fuelSlot = engineRef.current.player.inventory.find(s => s && s.item.id === fuelItemId);
      if (fuelSlot) {
        fuelSlot.quantity--;
        if (fuelSlot.quantity <= 0) {
          const idx = engineRef.current.player.inventory.indexOf(fuelSlot);
          engineRef.current.player.inventory[idx] = null;
        }
      }
    }

    const output = ITEMS[outputItemId];
    if (output) {
      engineRef.current.addItemToInventory(output, 1);
      engineRef.current.addFloatingText(engineRef.current.player.x, engineRef.current.player.y - 25, `+1 ${output.name}`, '#ffaa44');
    }
    forceUpdate();
  };

  // Skill unlock
  const handleUnlockSkill = (skillId: string, cost: number) => {
    if (!engineRef.current) return;
    if (engineRef.current.player.stats.skillPoints >= cost) {
      engineRef.current.player.stats.skillPoints -= cost;
      engineRef.current.player.skills[skillId] = true;
      engineRef.current.addFloatingText(engineRef.current.player.x, engineRef.current.player.y - 30, 'Habilidade Desbloqueada!', '#d946ef');
      forceUpdate();
    }
  };

  const engine = engineRef.current;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black select-none font-sans">
      {/* 60fps Isolated Canvas Viewport */}
      <canvas
        ref={canvasRef}
        className="w-full h-full block cursor-crosshair touch-none"
      />

      {/* Title Screen Overlay */}
      {gameState === 'title' && (
        <TitleScreen
          onStartGame={startGame}
          onOpenSettings={() => setActiveModal('settings')}
          onOpenGuide={() => setActiveModal('guide')}
        />
      )}

      {/* Active Playing HUD */}
      {gameState === 'playing' && engine && (
        <HUD
          stats={engine.player.stats}
          world={engine.world}
          quests={engine.quests}
          inventory={engine.player.inventory}
          selectedHotbarIndex={engine.player.selectedHotbarIndex}
          playerX={engine.player.x}
          playerY={engine.player.y}
          onSelectHotbar={(idx) => engine.selectHotbarSlot(idx)}
          onOpenInventory={() => setActiveModal('inventory')}
          onOpenCrafting={() => setActiveModal('crafting')}
          onOpenBuilding={() => setActiveModal('building')}
          onOpenMap={() => setActiveModal('map')}
          onOpenSkills={() => setActiveModal('skills')}
          onOpenQuests={() => setActiveModal('quests')}
          onPause={() => {
            setGameState('paused');
            engine.stop();
          }}
          onAttack={() => engine.triggerAttackOrInteract()}
          onToggleSprint={(sprinting) => {
            engine.isTouchSprint = sprinting;
            forceUpdate();
          }}
          isSprinting={engine.isTouchSprint}
          onJoystickMove={(vec) => {
            engine.joystickVector = vec;
          }}
        />
      )}

      {/* Modals */}
      {activeModal === 'inventory' && engine && (
        <InventoryModal
          inventory={engine.player.inventory}
          equipment={engine.player.equipment}
          stats={engine.player.stats}
          onClose={() => setActiveModal(null)}
          onUseItem={handleUseItem}
          onEquipItem={handleEquipItem}
          onDropItem={handleDropItem}
          onSplitStack={handleSplitStack}
          onSwapSlots={handleSwapSlots}
          onOrganize={handleOrganizeInventory}
        />
      )}

      {activeModal === 'crafting' && engine && (
        <CraftingModal
          inventory={engine.player.inventory}
          nearbyStations={engine.getNearbyStations()}
          onClose={() => setActiveModal(null)}
          onCraft={handleCraft}
        />
      )}

      {activeModal === 'building' && engine && (
        <BuildingModal
          inventory={engine.player.inventory}
          onClose={() => setActiveModal(null)}
          onSelectStructure={(structureId) => {
            engine.isBuildingMode = true;
            engine.selectedBuildingStructureId = structureId;
            setActiveModal(null);
            soundEngine.playBuild();
            engine.addFloatingText(engine.player.x, engine.player.y - 20, 'Modo Construção Ativo', '#44ff44');
          }}
        />
      )}

      {activeModal === 'map' && engine && (
        <WorldMapModal
          world={engine.world}
          playerX={engine.player.x}
          playerY={engine.player.y}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'chest' && engine && activeChest && (
        <ChestModal
          chest={activeChest}
          playerInventory={engine.player.inventory}
          onClose={() => setActiveModal(null)}
          onUpdateInventories={(chestInv, playerInv) => {
            activeChest.chestInventory = chestInv;
            engine.player.inventory = playerInv;
            forceUpdate();
          }}
        />
      )}

      {activeModal === 'cooking' && engine && activeCookingStation && (
        <CookingModal
          station={activeCookingStation}
          inventory={engine.player.inventory}
          onClose={() => setActiveModal(null)}
          onCookItem={handleCookItem}
        />
      )}

      {activeModal === 'skills' && engine && (
        <SkillsModal
          stats={engine.player.stats}
          unlockedSkills={engine.player.skills}
          onClose={() => setActiveModal(null)}
          onUnlockSkill={handleUnlockSkill}
        />
      )}

      {activeModal === 'quests' && engine && (
        <QuestsModal
          quests={engine.quests}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'settings' && (
        <SettingsModal onClose={() => setActiveModal(null)} />
      )}

      {activeModal === 'guide' && (
        <GuideModal onClose={() => setActiveModal(null)} />
      )}

      {/* Paused Modal */}
      {gameState === 'paused' && engine && (
        <PauseModal
          onResume={handleResume}
          onSave={handleManualSave}
          onRestart={handleRestart}
          onTitle={handleTitle}
          onOpenSettings={() => setActiveModal('settings')}
          dayCount={engine.world.dayCount}
          playerLevel={engine.player.stats.level}
        />
      )}

      {/* Game Over Modal */}
      {gameState === 'gameover' && engine && (
        <GameOverModal
          dayCount={engine.world.dayCount}
          level={engine.player.stats.level}
          onRespawn={handleRespawn}
        />
      )}

      {/* Landscape Mode Required / Recommended Overlay */}
      {isPortrait && !dismissPortraitWarning && (
        <div className="fixed inset-0 z-50 bg-[#0a0d16]/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center select-none animate-in fade-in duration-300">
          <div className="relative mb-6">
            <div className="w-16 h-28 border-4 border-yellow-400 rounded-2xl flex items-center justify-center relative shadow-[0_0_25px_rgba(250,204,21,0.4)] animate-pulse">
              <div className="w-2 h-2 bg-yellow-400 rounded-full absolute bottom-2" />
              <div className="w-8 h-1 bg-yellow-400/60 rounded absolute top-2" />
              <span className="text-2xl text-yellow-300 font-pixel">↻</span>
            </div>
          </div>

          <div className="bg-black/60 border border-yellow-500/40 rounded-xl px-4 py-2 mb-3">
            <h2 className="font-pixel text-base text-yellow-400">GIRE SEU APARELHO</h2>
          </div>

          <p className="text-xs text-gray-300 max-w-xs mb-6 leading-relaxed font-sans font-medium">
            LOST WORLD foi construído para ser jogado no <strong className="text-white">Modo Paisagem (Horizontal)</strong> e <strong className="text-white">Tela Cheia</strong> para visualização completa do mapa e dos controles.
          </p>

          <div className="flex flex-col gap-3 w-64">
            <button
              onClick={() => {
                if (!document.fullscreenElement) {
                  document.documentElement.requestFullscreen().catch(() => {});
                  if (screen.orientation && 'lock' in screen.orientation) {
                    (screen.orientation as any).lock('landscape').catch(() => {});
                  }
                }
                setDismissPortraitWarning(true);
              }}
              className="w-full py-3.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-pixel text-xs rounded-xl shadow-xl shadow-red-950/50 border border-yellow-400 cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <span>TELA CHEIA & GIRAR</span>
            </button>
            <button
              onClick={() => setDismissPortraitWarning(true)}
              className="text-[11px] text-gray-400 hover:text-gray-200 underline cursor-pointer py-1"
            >
              Continuar no modo atual
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
