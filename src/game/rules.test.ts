import test from 'node:test';
import assert from 'node:assert/strict';
import { 
  calculateNextLevelXp, 
  calculateDamage, 
  calculateTargetTemperature, 
  isTileSolid, 
  canCraftRecipe, 
  updateSurvivalStats 
} from './rules';
import { TILE_TYPES, ITEMS, RECIPES } from './constants';
import { PlayerStats, InventorySlot } from './types';

test('calculateNextLevelXp increases with higher levels', () => {
  const lvl1Xp = calculateNextLevelXp(1);
  const lvl2Xp = calculateNextLevelXp(2);
  const lvl5Xp = calculateNextLevelXp(5);

  assert.equal(lvl1Xp, 80);
  assert.ok(lvl2Xp > lvl1Xp, 'Level 2 requires more XP than Level 1');
  assert.ok(lvl5Xp > lvl2Xp, 'Level 5 requires more XP than Level 2');
});

test('calculateDamage applies defense mitigation and critical hit correctly', () => {
  const unarmoredDamage = calculateDamage(20, 0, false);
  assert.equal(unarmoredDamage, 20);

  const armoredDamage = calculateDamage(20, 20, false);
  assert.ok(armoredDamage < unarmoredDamage, 'Armored target takes less damage');

  const critDamage = calculateDamage(20, 0, true);
  assert.equal(critDamage, 30, 'Critical hit deals 1.5x damage');
});

test('calculateTargetTemperature reacts to fire, weather and shelter', () => {
  const baseCold = calculateTargetTemperature({
    isNight: true,
    isRaining: true,
    biome: 'forest',
    nearCampfire: false,
    nearTorch: false,
    insideCabin: false,
    equippedArmorDefense: 0,
  });

  const warmedByFire = calculateTargetTemperature({
    isNight: true,
    isRaining: true,
    biome: 'forest',
    nearCampfire: true,
    nearTorch: false,
    insideCabin: false,
    equippedArmorDefense: 0,
  });

  assert.ok(warmedByFire > baseCold, 'Campfire increases body temperature');
});

test('isTileSolid marks water tiles as solid', () => {
  assert.equal(isTileSolid(TILE_TYPES.WATER), true);
  assert.equal(isTileSolid(TILE_TYPES.DEEP_WATER), true);
  assert.equal(isTileSolid(TILE_TYPES.GRASS), false);
  assert.equal(isTileSolid(TILE_TYPES.DIRT_PATH), false);
});

test('canCraftRecipe checks inventory quantities', () => {
  const recipe = RECIPES.find(r => r.id === 'craft_campfire')!;
  assert.ok(recipe, 'Campfire recipe exists');

  const emptyInventory: (InventorySlot | null)[] = [null, null];
  assert.equal(canCraftRecipe(emptyInventory, recipe), false);

  const sufficientInventory: (InventorySlot | null)[] = [
    { item: ITEMS.wood, quantity: 10 },
    { item: ITEMS.stone, quantity: 8 },
  ];
  assert.equal(canCraftRecipe(sufficientInventory, recipe), true);
});

test('updateSurvivalStats drains hunger and thirst over time and penalizes starvation', () => {
  const initialStats: PlayerStats = {
    hp: 100,
    maxHp: 100,
    hunger: 50,
    maxHunger: 100,
    thirst: 50,
    maxThirst: 100,
    energy: 100,
    maxEnergy: 100,
    bodyTemp: 36.5,
    sleep: 0,
    xp: 0,
    level: 1,
    skillPoints: 0,
  };

  const updated = updateSurvivalStats(initialStats, 10, {});
  assert.ok(updated.hunger < initialStats.hunger, 'Hunger drained');
  assert.ok(updated.thirst < initialStats.thirst, 'Thirst drained');

  // Starving stats
  const starvingStats: PlayerStats = {
    ...initialStats,
    hunger: 0,
    thirst: 0,
  };
  const starvedResult = updateSurvivalStats(starvingStats, 5, {});
  assert.ok(starvedResult.hp < starvingStats.hp, 'Health drops when starving/dehydrated');
});

test('sobrivivencia do zero: craft stone axe and campfire from ground forage', () => {
  // Player starts with empty inventory
  const emptyInventory = new Array(24).fill(null);
  const stoneAxeRecipe = RECIPES.find(r => r.id === 'craft_stone_axe')!;
  assert.equal(canCraftRecipe(emptyInventory, stoneAxeRecipe), false, 'Cannot craft without collecting');

  // Player collects loose branches and stones from ground
  const collectedInventory: (InventorySlot | null)[] = [
    { item: ITEMS.branch, quantity: 4 },
    { item: ITEMS.stone, quantity: 4 },
    { item: ITEMS.fiber, quantity: 3 },
  ];
  assert.equal(canCraftRecipe(collectedInventory, stoneAxeRecipe), true, 'Can craft stone axe from ground resources');
});

