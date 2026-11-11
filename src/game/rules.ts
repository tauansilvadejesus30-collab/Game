import { InventorySlot, PlayerStats, Recipe } from './types';
import { TILE_TYPES } from './constants';

/**
 * Calculates XP threshold required to reach the next level
 */
export function calculateNextLevelXp(level: number): number {
  return Math.floor(80 * Math.pow(1.25, Math.max(1, level) - 1));
}

/**
 * Calculates damage dealt factoring in armor defense and critical strikes
 */
export function calculateDamage(
  baseDamage: number, 
  targetDefense: number = 0, 
  isCritical: boolean = false
): number {
  const critMultiplier = isCritical ? 1.5 : 1.0;
  // Standard defense reduction curve: defense / (defense + 40)
  const defenseReduction = targetDefense > 0 ? targetDefense / (targetDefense + 40) : 0;
  const rawDamage = baseDamage * critMultiplier * (1 - defenseReduction);
  return Math.max(1, Math.round(rawDamage));
}

/**
 * Calculates current body temperature in Celsius based on environment and fire sources
 */
export function calculateTargetTemperature(params: {
  isNight: boolean;
  isRaining: boolean;
  biome: 'forest' | 'beach' | 'mountain' | 'desert' | 'ruins' | 'snow';
  nearCampfire: boolean;
  nearTorch: boolean;
  insideCabin: boolean;
  equippedArmorDefense: number;
  isSnowing?: boolean;
  isBlizzard?: boolean;
  isHeatwave?: boolean;
}): number {
  const { 
    isNight, 
    isRaining, 
    biome, 
    nearCampfire, 
    nearTorch, 
    insideCabin, 
    equippedArmorDefense,
    isSnowing,
    isBlizzard,
    isHeatwave,
  } = params;

  let ambient = 36.5; // Normal body temperature

  // Biome base effect
  if (biome === 'desert') {
    ambient = isNight ? 28 : 41;
  } else if (biome === 'mountain') {
    ambient = isNight ? 22 : 31;
  } else if (biome === 'snow') {
    ambient = isNight ? 14 : 22;
  } else if (biome === 'forest') {
    ambient = isNight ? 30 : 36.5;
  } else if (biome === 'beach') {
    ambient = isNight ? 32 : 37;
  }

  // Weather effects
  if (isRaining) {
    ambient -= 4.0;
  }
  if (isSnowing) {
    ambient -= 6.0;
  }
  if (isBlizzard) {
    ambient -= 14.0;
  }
  if (isHeatwave) {
    ambient += 10.0;
  }

  // Shelter protection
  if (insideCabin) {
    ambient = Math.max(34.0, ambient + 3.0);
  }

  // Armor warmth
  if (equippedArmorDefense > 0) {
    ambient += Math.min(3.0, equippedArmorDefense * 0.1);
  }

  // Heat sources
  if (nearCampfire) {
    ambient += 7.0;
  } else if (nearTorch) {
    ambient += 2.5;
  }

  // Clamp between safe and extreme ranges
  return Math.min(43.0, Math.max(20.0, ambient));
}

/**
 * Checks if a tile is blocking movement
 */
export function isTileSolid(tileType: number): boolean {
  return tileType === TILE_TYPES.WATER || tileType === TILE_TYPES.DEEP_WATER || tileType === TILE_TYPES.CAVE_WALL;
}

/**
 * Checks if the currently equipped item is a hammer eligible to dismantle placed structures
 */
export function canDismantleWithTool(equippedItem?: { toolType?: string; id?: string } | null): boolean {
  if (!equippedItem) return false;
  return equippedItem.toolType === 'hammer' || (typeof equippedItem.id === 'string' && equippedItem.id.includes('hammer'));
}


/**
 * Checks if inventory contains required recipe ingredients and nearby station if required
 */
export function canCraftRecipe(
  inventory: (InventorySlot | null)[], 
  recipe: Recipe,
  nearbyStations?: string[]
): boolean {
  if (recipe.requiresStation) {
    if (!nearbyStations || !nearbyStations.includes(recipe.requiresStation)) {
      return false;
    }
  }

  for (const req of recipe.ingredients) {
    let availableCount = 0;
    for (const slot of inventory) {
      if (slot && slot.item && slot.item.id === req.itemId) {
        availableCount += slot.quantity;
      }
    }
    if (availableCount < req.quantity) {
      return false;
    }
  }
  return true;
}

/**
 * Calculates effective movement speed based on terrain and boating/swimming state
 */
export function calculateMovementSpeed(baseSpeed: number, isSwimming: boolean, isBoating: boolean, isSprinting: boolean): number {
  let speed = baseSpeed;
  if (isBoating) {
    speed *= 1.55; // Fast navigation on water
  } else if (isSwimming) {
    speed *= 0.65; // Water resistance drag
  } else if (isSprinting) {
    speed *= 1.45; // Sprint on land
  }
  return speed;
}

/**
 * Updates swimming breath and drowning penalties
 */
export function updateSwimmingBreath(
  stats: PlayerStats,
  dt: number,
  isSwimming: boolean,
  isBoating: boolean
): { breath: number; drowningDamage: number } {
  let breath = stats.breath ?? 100;
  const maxBreath = stats.maxBreath ?? 100;
  let drowningDamage = 0;

  if (isBoating) {
    // Restored while safely inside boat
    breath = Math.min(maxBreath, breath + 35 * dt);
  } else if (isSwimming) {
    // Breath consumed while swimming
    breath = Math.max(0, breath - 8.5 * dt);
    if (breath <= 0) {
      // Drowning damage
      drowningDamage = 6.0 * dt;
    }
  } else {
    // Rapidly recover on dry land
    breath = Math.min(maxBreath, breath + 30 * dt);
  }

  return {
    breath: Math.round(breath * 10) / 10,
    drowningDamage: Math.round(drowningDamage * 10) / 10,
  };
}

/**
 * Updates survival stats based on elapsed time (dt in seconds)
 */
export function updateSurvivalStats(
  stats: PlayerStats,
  dt: number,
  options: {
    isSprinting?: boolean;
    isResting?: boolean;
    hasMetabolismSkill?: boolean;
    currentTemperature?: number;
  }
): PlayerStats {
  const metabolismModifier = options.hasMetabolismSkill ? 0.7 : 1.0;
  const hungerDrainRate = 0.3 * metabolismModifier; // hunger points per second
  const thirstDrainRate = 0.5 * metabolismModifier; // thirst points per second
  const sprintEnergyDrain = options.isSprinting ? 12 : 0;
  const restingEnergyRegen = options.isResting ? 8 : 1.5;

  let newHunger = Math.max(0, stats.hunger - hungerDrainRate * dt);
  let newThirst = Math.max(0, stats.thirst - thirstDrainRate * dt);
  
  let newEnergy = stats.energy;
  if (options.isSprinting) {
    newEnergy = Math.max(0, stats.energy - sprintEnergyDrain * dt);
  } else {
    newEnergy = Math.min(stats.maxEnergy, stats.energy + restingEnergyRegen * dt);
  }

  let newHp = stats.hp;

  // Starvation & Dehydration penalties
  if (newHunger <= 0) {
    newHp = Math.max(0, newHp - 2.5 * dt);
  }
  if (newThirst <= 0) {
    newHp = Math.max(0, newHp - 4.0 * dt);
  }

  // Freezing penalty (hypothermia < 32°C) or Overheating (> 40°C)
  const temp = options.currentTemperature ?? stats.bodyTemp;
  if (temp < 30.0) {
    newHp = Math.max(0, newHp - 3.0 * dt);
  } else if (temp > 41.5) {
    newHp = Math.max(0, newHp - 2.5 * dt);
  }

  // Natural health regeneration when well fed and hydrated
  if (newHunger > 75 && newThirst > 65 && temp >= 34.0 && temp <= 38.0) {
    newHp = Math.min(stats.maxHp, newHp + 1.2 * dt);
  }

  return {
    ...stats,
    hp: Math.round(newHp * 10) / 10,
    hunger: Math.round(newHunger * 10) / 10,
    thirst: Math.round(newThirst * 10) / 10,
    energy: Math.round(newEnergy * 10) / 10,
  };
}
