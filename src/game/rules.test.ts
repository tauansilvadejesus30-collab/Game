import test from 'node:test';
import assert from 'node:assert/strict';
import { 
  calculateNextLevelXp, 
  calculateDamage, 
  calculateTargetTemperature, 
  isTileSolid, 
  canCraftRecipe, 
  updateSurvivalStats,
  updateSwimmingBreath,
  calculateMovementSpeed,
  canDismantleWithTool
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
    breath: 100,
    maxBreath: 100,
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

test('station proximity enforces tiered crafting requirements', () => {
  const planksRecipe = RECIPES.find(r => r.id === 'craft_wood_planks')!;
  assert.equal(planksRecipe.requiresStation, 'workbench', 'Wood planks require workbench');

  const inventoryWithWood: (InventorySlot | null)[] = [
    { item: ITEMS.wood, quantity: 5 },
  ];

  // Without workbench nearby: cannot craft
  assert.equal(canCraftRecipe(inventoryWithWood, planksRecipe, []), false);
  // With workbench nearby: can craft
  assert.equal(canCraftRecipe(inventoryWithWood, planksRecipe, ['workbench']), true);

  // Sawmill recipe
  const canoeRecipe = RECIPES.find(r => r.id === 'craft_canoe')!;
  const inventoryForCanoe: (InventorySlot | null)[] = [
    { item: ITEMS.wood_plank, quantity: 12 },
    { item: ITEMS.resin, quantity: 4 },
    { item: ITEMS.rope, quantity: 4 },
  ];
  assert.equal(canCraftRecipe(inventoryForCanoe, canoeRecipe, ['workbench']), false, 'Canoe requires sawmill, not just workbench');
  assert.equal(canCraftRecipe(inventoryForCanoe, canoeRecipe, ['workbench', 'sawmill']), true, 'Canoe craftable near sawmill');
});

test('swimming breath drains in water and boat protects from drowning', () => {
  const dummyStats: PlayerStats = {
    hp: 100, maxHp: 100, hunger: 100, maxHunger: 100, thirst: 100, maxThirst: 100,
    energy: 100, maxEnergy: 100, bodyTemp: 36.5, sleep: 0, breath: 100, maxBreath: 100,
    xp: 0, level: 1, skillPoints: 0
  };

  // Swimming for 5 seconds drains breath
  const swimmingResult = updateSwimmingBreath(dummyStats, 5, true, false);
  assert.ok(swimmingResult.breath < 100, 'Breath drains when swimming');
  assert.equal(swimmingResult.drowningDamage, 0, 'No drowning damage when breath > 0');

  // Boating protects and recovers breath
  const depletedStats = { ...dummyStats, breath: 20 };
  const boatResult = updateSwimmingBreath(depletedStats, 2, false, true);
  assert.ok(boatResult.breath > 20, 'Breath recovers in boat');
  assert.equal(boatResult.drowningDamage, 0, 'No drowning in boat');

  // Movement speed modifiers
  const landSpeed = calculateMovementSpeed(100, false, false, false);
  const swimSpeed = calculateMovementSpeed(100, true, false, false);
  const boatSpeed = calculateMovementSpeed(100, false, true, false);

  assert.ok(swimSpeed < landSpeed, 'Swimming has water drag slowdown');
  assert.ok(boatSpeed > landSpeed, 'Boating provides fast water traversal');
});

test('cave ground is walkable and cave wall is solid', () => {
  assert.equal(isTileSolid(TILE_TYPES.CAVE_WALL), true, 'Cave walls must block movement');
  assert.equal(isTileSolid(TILE_TYPES.CAVE_GROUND), false, 'Cave ground must be walkable');
});

test('canDismantleWithTool requires a hammer tool', () => {
  assert.equal(canDismantleWithTool(null), false, 'Empty hand cannot dismantle structures');
  assert.equal(canDismantleWithTool(undefined), false);
  assert.equal(canDismantleWithTool({ id: 'stone_pickaxe', toolType: 'pickaxe' }), false, 'Pickaxe cannot dismantle structures');
  assert.equal(canDismantleWithTool({ id: 'stone_axe', toolType: 'axe' }), false, 'Axe cannot dismantle structures');
  assert.equal(canDismantleWithTool({ id: 'wood_hammer', toolType: 'hammer' }), true, 'Wood hammer can dismantle structures');
  assert.equal(canDismantleWithTool({ id: 'iron_hammer', toolType: 'hammer' }), true, 'Iron hammer can dismantle structures');
});


