import { 
  WORLD_WIDTH_TILES, 
  WORLD_HEIGHT_TILES, 
  TILE_TYPES, 
  TILE_SIZE,
  ITEMS
} from './constants';
import { 
  WorldState, 
  ResourceNode, 
  StructureEntity, 
  EnemyEntity, 
  AnimalEntity 
} from './types';

export function generateWorld(): WorldState {
  const width = WORLD_WIDTH_TILES;
  const height = WORLD_HEIGHT_TILES;
  const tiles = new Uint8Array(width * height);

  const resources: ResourceNode[] = [];
  const structures: StructureEntity[] = [];
  const enemies: EnemyEntity[] = [];
  const animals: AnimalEntity[] = [];

  // Helper for 2D tile index
  const idx = (x: number, y: number) => y * width + x;

  // 1. Generate Biome Base Tiles for 220x220 Expanded World
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // Coastal Ocean on South and West margins for natural oceanic shoreline
      if (y >= height - 6 || x <= 4) {
        tiles[idx(x, y)] = TILE_TYPES.DEEP_WATER;
        continue;
      } else if (y >= height - 12 || x <= 8) {
        tiles[idx(x, y)] = TILE_TYPES.WATER;
        continue;
      } else if (y >= height - 16 || x <= 12) {
        tiles[idx(x, y)] = TILE_TYPES.SAND;
        continue;
      }

      // Grand Lake in South-West (centered at x=65, y=150)
      const distToLake = Math.hypot(x - 65, y - 150);
      if (distToLake < 24) {
        tiles[idx(x, y)] = TILE_TYPES.DEEP_WATER;
        continue;
      } else if (distToLake < 32) {
        tiles[idx(x, y)] = TILE_TYPES.WATER;
        continue;
      } else if (distToLake < 38) {
        tiles[idx(x, y)] = TILE_TYPES.SAND;
        continue;
      }

      // Desert Oasis (hidden in the eastern desert at x=195, y=145)
      const distToOasis = Math.hypot(x - 195, y - 145);
      if (distToOasis < 5) {
        tiles[idx(x, y)] = TILE_TYPES.WATER;
        continue;
      } else if (distToOasis < 8) {
        tiles[idx(x, y)] = TILE_TYPES.GRASS;
        continue;
      }

      // Meandering River 1: North-West Mountain springs flowing down to Grand Lake
      if (y >= 28 && y <= 126) {
        const river1CenterX = 48 + Math.sin(y * 0.08) * 12 + Math.cos(y * 0.03) * 6;
        const distToRiver1 = Math.abs(x - river1CenterX);
        if (distToRiver1 <= 1.4) {
          // River water
          tiles[idx(x, y)] = TILE_TYPES.WATER;
          continue;
        } else if (distToRiver1 <= 2.2 && Math.random() < 0.6) {
          tiles[idx(x, y)] = TILE_TYPES.SAND;
          continue;
        }
      }

      // Meandering River 2: Central Snowmelt River snaking through Savanna to South Coast
      if (y >= 45 && y <= height - 16) {
        const river2CenterX = 135 + Math.sin(y * 0.07) * 14 + (y - 45) * 0.12;
        const distToRiver2 = Math.abs(x - river2CenterX);
        if (distToRiver2 <= 1.5) {
          // River water
          tiles[idx(x, y)] = TILE_TYPES.WATER;
          continue;
        } else if (distToRiver2 <= 2.4 && Math.random() < 0.55) {
          tiles[idx(x, y)] = TILE_TYPES.SAND;
          continue;
        }
      }

      // Vast Desert in Far East (x >= 165)
      if (x >= 165) {
        tiles[idx(x, y)] = TILE_TYPES.SAND;
        continue;
      }

      // Savanna Biome (warm golden grassland with acacias) between Forest and Desert
      if (x >= 120 && x < 165 && y >= 50) {
        tiles[idx(x, y)] = TILE_TYPES.SAVANNA_GRASS;
        continue;
      }

      // Snow Biome (Tundra & Frozen Peaks) in North-East
      if (y < 55 && x >= 70 && x < 165) {
        if (y < 26 && Math.random() < 0.45) {
          tiles[idx(x, y)] = TILE_TYPES.STONE_GROUND;
        } else {
          tiles[idx(x, y)] = TILE_TYPES.SNOW_GROUND;
        }
        continue;
      }

      // Rocky Mountain in North-West
      if (y < 50 && x < 70) {
        if (Math.random() < 0.68) {
          tiles[idx(x, y)] = TILE_TYPES.STONE_GROUND;
        } else {
          tiles[idx(x, y)] = TILE_TYPES.GRASS;
        }
        continue;
      }

      // Ancient Ruins in West
      if (x < 45 && y >= 50 && y < 110) {
        if (Math.random() < 0.72) {
          tiles[idx(x, y)] = TILE_TYPES.RUINS_FLOOR;
        } else {
          tiles[idx(x, y)] = TILE_TYPES.GRASS;
        }
        continue;
      }

      // Default Lush Forest Grass
      tiles[idx(x, y)] = TILE_TYPES.GRASS;
    }
  }

  // Wooden Bridges across rivers for smooth crossings
  // Bridge 1 on River 1 (Northern forest crossing around y=75)
  for (let bx = -2; bx <= 2; bx++) {
    const rx = Math.round(48 + Math.sin(75 * 0.08) * 12 + Math.cos(75 * 0.03) * 6) + bx;
    tiles[idx(rx, 75)] = TILE_TYPES.WOOD_FLOOR;
    tiles[idx(rx, 76)] = TILE_TYPES.WOOD_FLOOR;
  }
  // Bridge 2 on River 2 (Savanna trail crossing around y=110)
  for (let bx = -2; bx <= 2; bx++) {
    const rx = Math.round(135 + Math.sin(110 * 0.07) * 14 + (110 - 45) * 0.12) + bx;
    tiles[idx(rx, 110)] = TILE_TYPES.WOOD_FLOOR;
    tiles[idx(rx, 111)] = TILE_TYPES.WOOD_FLOOR;
  }

  // 2. Wilderness Spawn Clearing at (x=60, y=60)
  const baseX = 60;
  const baseY = 60;

  // Gentle dirt path leading from the forest clearing south towards the river/lake
  for (let dy = -6; dy <= 16; dy++) {
    for (let dx = -8; dx <= 10; dx++) {
      const tx = baseX + dx;
      const ty = baseY + dy;
      if (tx >= 0 && tx < width && ty >= 0 && ty < height) {
        if (dx === 0 && dy > 2 && dy <= 16) {
          tiles[idx(tx, ty)] = TILE_TYPES.DIRT_PATH;
        }
      }
    }
  }

  // Wooden pier at the river/lake shore for fishing and drinking fresh water
  structures.push({
    id: 'wild_pier',
    type: 'pier',
    tileX: baseX,
    tileY: baseY + 16,
    x: baseX * TILE_SIZE + TILE_SIZE / 2,
    y: (baseY + 16) * TILE_SIZE + TILE_SIZE / 2,
    width: TILE_SIZE * 2,
    height: TILE_SIZE,
    hp: 200,
    maxHp: 200,
  });

  // Helper to construct ruined houses with lootable chests
  const createRuinedHouse = (
    rx: number,
    ry: number,
    houseType: 'ruins' | 'wood' | 'snow' | 'shore' | 'desert' | 'savanna'
  ) => {
    const wallType = (houseType === 'ruins' || houseType === 'snow' || houseType === 'desert') ? 'stone_wall' : 'wood_wall';
    const floorType = (houseType === 'ruins' || houseType === 'desert') ? TILE_TYPES.RUINS_FLOOR : TILE_TYPES.WOOD_FLOOR;

    for (let dy = 0; dy < 5; dy++) {
      for (let dx = 0; dx < 5; dx++) {
        const tx = rx + dx;
        const ty = ry + dy;
        if (tx >= 0 && tx < width && ty >= 0 && ty < height) {
          tiles[idx(tx, ty)] = floorType;

          const isBorder = dx === 0 || dx === 4 || dy === 0 || dy === 4;
          const isDoor = dy === 4 && dx === 2;
          const isGap = (dx === 1 && dy === 0) || (dx === 4 && dy === 2);

          if (isBorder && !isDoor && !isGap) {
            structures.push({
              id: `ruin_wall_${rx}_${ry}_${dx}_${dy}`,
              type: wallType,
              tileX: tx,
              tileY: ty,
              x: tx * TILE_SIZE + TILE_SIZE / 2,
              y: ty * TILE_SIZE + TILE_SIZE / 2,
              width: TILE_SIZE,
              height: TILE_SIZE,
              hp: 120,
              maxHp: 120,
            });
          }
        }
      }
    }

    // Chest with survival loot tailored to each biome
    const chestInv = new Array(16).fill(null);
    if (houseType === 'desert') {
      chestInv[0] = { item: ITEMS['gunpowder'], quantity: 4 };
      chestInv[1] = { item: ITEMS['pistol_ammo'], quantity: 12 };
      chestInv[2] = { item: ITEMS['ancient_cloth'], quantity: 6 };
      chestInv[3] = { item: ITEMS['gold_ore'], quantity: 4 };
      chestInv[4] = { item: ITEMS['cactus_fruit'], quantity: 5 };
      chestInv[5] = { item: ITEMS['water_canteen'], quantity: 1 };
    } else if (houseType === 'savanna') {
      chestInv[0] = { item: ITEMS['pistol_ammo'], quantity: 8 };
      chestInv[1] = { item: ITEMS['rifle_ammo'], quantity: 6 };
      chestInv[2] = { item: ITEMS['bandage'], quantity: 3 };
      chestInv[3] = { item: ITEMS['acacia_wood'], quantity: 8 };
      chestInv[4] = { item: ITEMS['cooked_meat'], quantity: 4 };
    } else if (houseType === 'ruins') {
      chestInv[0] = { item: ITEMS['bandage'], quantity: 4 };
      chestInv[1] = { item: ITEMS['torch'], quantity: 6 };
      chestInv[2] = { item: ITEMS['iron_ingot'], quantity: 4 };
      chestInv[3] = { item: ITEMS['iron_pickaxe'], quantity: 1 };
      chestInv[4] = { item: ITEMS['bread'], quantity: 3 };
    } else if (houseType === 'wood') {
      chestInv[0] = { item: ITEMS['wooden_hammer'], quantity: 1 };
      chestInv[1] = { item: ITEMS['wood_plank'], quantity: 12 };
      chestInv[2] = { item: ITEMS['apple'], quantity: 5 };
      chestInv[3] = { item: ITEMS['torch'], quantity: 4 };
    } else if (houseType === 'snow') {
      chestInv[0] = { item: ITEMS['leather_boots'], quantity: 1 };
      chestInv[1] = { item: ITEMS['torch'], quantity: 8 };
      chestInv[2] = { item: ITEMS['cooked_meat'], quantity: 4 };
      chestInv[3] = { item: ITEMS['gold_ore'], quantity: 3 };
    } else {
      chestInv[0] = { item: ITEMS['bandage'], quantity: 3 };
      chestInv[1] = { item: ITEMS['wood_plank'], quantity: 8 };
      chestInv[2] = { item: ITEMS['cooked_meat'], quantity: 3 };
      chestInv[3] = { item: ITEMS['torch'], quantity: 4 };
    }

    structures.push({
      id: `ruin_chest_${rx}_${ry}`,
      type: 'chest',
      tileX: rx + 2,
      tileY: ry + 1,
      x: (rx + 2) * TILE_SIZE + TILE_SIZE / 2,
      y: (ry + 1) * TILE_SIZE + TILE_SIZE / 2,
      width: TILE_SIZE,
      height: TILE_SIZE,
      hp: 150,
      maxHp: 150,
      chestInventory: chestInv,
    });
  };

  // Generate Diverse Ruined Houses & Cabins across all biomes
  createRuinedHouse(24, 64, 'ruins');
  createRuinedHouse(30, 105, 'ruins');
  createRuinedHouse(85, 45, 'wood');
  createRuinedHouse(72, 115, 'wood');
  createRuinedHouse(115, 35, 'snow');
  createRuinedHouse(95, 145, 'shore');
  createRuinedHouse(142, 95, 'savanna');
  createRuinedHouse(185, 75, 'desert');
  createRuinedHouse(195, 160, 'desert');

  // Cave Entrances: Starter clearing cave, Mountain depths, Snow Peaks, and Eastern Desert
  structures.push({
    id: 'cave_entrance_starter',
    type: 'cave_entrance',
    tileX: 65,
    tileY: 52,
    x: 65 * TILE_SIZE + TILE_SIZE / 2,
    y: 52 * TILE_SIZE + TILE_SIZE / 2,
    width: TILE_SIZE * 1.5,
    height: TILE_SIZE * 1.5,
    hp: 9999,
    maxHp: 9999,
  });

  structures.push({
    id: 'cave_entrance_mountain',
    type: 'cave_entrance',
    tileX: 38,
    tileY: 28,
    x: 38 * TILE_SIZE + TILE_SIZE / 2,
    y: 28 * TILE_SIZE + TILE_SIZE / 2,
    width: TILE_SIZE * 1.5,
    height: TILE_SIZE * 1.5,
    hp: 9999,
    maxHp: 9999,
  });

  structures.push({
    id: 'cave_entrance_snow',
    type: 'cave_entrance',
    tileX: 130,
    tileY: 24,
    x: 130 * TILE_SIZE + TILE_SIZE / 2,
    y: 24 * TILE_SIZE + TILE_SIZE / 2,
    width: TILE_SIZE * 1.5,
    height: TILE_SIZE * 1.5,
    hp: 9999,
    maxHp: 9999,
  });

  structures.push({
    id: 'cave_entrance_desert',
    type: 'cave_entrance',
    tileX: 195,
    tileY: 88,
    x: 195 * TILE_SIZE + TILE_SIZE / 2,
    y: 88 * TILE_SIZE + TILE_SIZE / 2,
    width: TILE_SIZE * 1.5,
    height: TILE_SIZE * 1.5,
    hp: 9999,
    maxHp: 9999,
  });

  // Scatter loose branches and loose stones right around the clearing so the player can collect by hand
  const starterPickables = [
    { type: 'loose_branch', res: 'branch', count: 12 },
    { type: 'loose_stone', res: 'stone', count: 10 },
    { type: 'berry_bush', res: 'berries', count: 6 },
    { type: 'medicinal_plant', res: 'medicinal_herb', count: 5 },
  ] as const;

  let pickId = 0;
  for (const item of starterPickables) {
    for (let i = 0; i < item.count; i++) {
      const ox = (Math.random() - 0.5) * 16;
      const oy = (Math.random() - 0.5) * 16;
      const tx = Math.floor(baseX + ox);
      const ty = Math.floor(baseY + oy);
      if (tx >= 2 && tx < width - 2 && ty >= 2 && ty < height - 2) {
        resources.push({
          id: `starter_${item.type}_${pickId++}`,
          type: item.type,
          tileX: tx,
          tileY: ty,
          x: tx * TILE_SIZE + TILE_SIZE / 2 + (Math.random() - 0.5) * 12,
          y: ty * TILE_SIZE + TILE_SIZE / 2 + (Math.random() - 0.5) * 12,
          width: TILE_SIZE * 0.7,
          height: TILE_SIZE * 0.7,
          hp: 1, // Instant pickup upon interaction/punch
          maxHp: 1,
          hitFlash: 0,
          resourceId: item.res,
          yieldMin: item.type === 'berry_bush' ? 2 : 1,
          yieldMax: item.type === 'berry_bush' ? 3 : 2,
          secondaryResourceId: item.type === 'berry_bush' ? 'fiber' : undefined,
          secondaryYield: item.type === 'berry_bush' ? 1 : undefined,
        });
      }
    }
  }

  // Wild passive cows and chickens grazing in the clearing
  animals.push({
    id: 'wild_cow_1',
    type: 'cow',
    x: (baseX + 5) * TILE_SIZE,
    y: (baseY - 4) * TILE_SIZE,
    vx: 0,
    vy: 0,
    facing: 'right',
    hp: 60,
    maxHp: 60,
    state: 'graze',
    stateTimer: 4,
    hitFlash: 0,
  });

  animals.push({
    id: 'wild_chicken_1',
    type: 'chicken',
    x: (baseX - 4) * TILE_SIZE,
    y: (baseY + 3) * TILE_SIZE,
    vx: 0,
    vy: 0,
    facing: 'left',
    hp: 20,
    maxHp: 20,
    state: 'idle',
    stateTimer: 3,
    hitFlash: 0,
  });

  // Wild beasts roaming in the perimeter forest
  enemies.push({
    id: 'starter_wolf',
    type: 'wolf',
    x: (baseX - 16) * TILE_SIZE,
    y: (baseY + 8) * TILE_SIZE,
    vx: 0,
    vy: 0,
    facing: 'right',
    hp: 45,
    maxHp: 45,
    damage: 12,
    speed: 75,
    attackRange: 32,
    aggroRange: 160,
    attackCooldown: 1.2,
    attackTimer: 0,
    telegraphTimer: 0,
    hitFlash: 0,
    state: 'wander',
    stateTimer: 4,
    deathTimer: 0,
  });

  enemies.push({
    id: 'starter_zombie',
    type: 'zombie',
    x: (baseX + 16) * TILE_SIZE,
    y: (baseY + 10) * TILE_SIZE,
    vx: 0,
    vy: 0,
    facing: 'left',
    hp: 60,
    maxHp: 60,
    damage: 15,
    speed: 40,
    attackRange: 28,
    aggroRange: 180,
    attackCooldown: 1.5,
    attackTimer: 0,
    telegraphTimer: 0,
    hitFlash: 0,
    state: 'wander',
    stateTimer: 3,
    deathTimer: 0,
  });

  enemies.push({
    id: 'starter_skeleton',
    type: 'skeleton',
    x: (baseX + 18) * TILE_SIZE,
    y: (baseY - 14) * TILE_SIZE,
    vx: 0,
    vy: 0,
    facing: 'left',
    hp: 40,
    maxHp: 40,
    damage: 14,
    speed: 50,
    attackRange: 180,
    aggroRange: 220,
    attackCooldown: 2.0,
    attackTimer: 0,
    telegraphTimer: 0,
    hitFlash: 0,
    state: 'idle',
    stateTimer: 3,
    deathTimer: 0,
  });

  // Boss Spectre in Ancient Ruins
  enemies.push({
    id: 'boss_ruins_spectre',
    type: 'boss_spectre',
    x: 18 * TILE_SIZE,
    y: 22 * TILE_SIZE,
    vx: 0,
    vy: 0,
    facing: 'down',
    hp: 350,
    maxHp: 350,
    damage: 28,
    speed: 60,
    attackRange: 60,
    aggroRange: 260,
    attackCooldown: 1.8,
    attackTimer: 0,
    telegraphTimer: 0,
    hitFlash: 0,
    state: 'idle',
    stateTimer: 5,
    deathTimer: 0,
  });

  // 3. Scatter Natural Resources (Trees, Rocks, Ores, Bushes, Herbs)
  let resCount = 0;
  for (let ty = 4; ty < height - 4; ty++) {
    for (let tx = 4; tx < width - 4; tx++) {
      // Avoid placing over starter base structures or water
      const t = tiles[idx(tx, ty)];
      if (t === TILE_TYPES.WATER || t === TILE_TYPES.DEEP_WATER || t === TILE_TYPES.WOOD_FLOOR || t === TILE_TYPES.DIRT_PATH) {
        continue;
      }
      const distToBase = Math.hypot(tx - baseX, ty - baseY);
      if (distToBase < 7) continue;

      const rand = Math.random();

      // Rocky Mountain Area (High iron, copper, gold, flint)
      if (ty < 25 && rand < 0.22) {
        if (rand < 0.06) {
          resources.push({
            id: `copper_${resCount++}`,
            type: 'copper_ore',
            tileX: tx,
            tileY: ty,
            x: tx * TILE_SIZE + TILE_SIZE / 2,
            y: ty * TILE_SIZE + TILE_SIZE / 2,
            width: TILE_SIZE,
            height: TILE_SIZE,
            hp: 50,
            maxHp: 50,
            hitFlash: 0,
            resourceId: 'copper_ore',
            yieldMin: 2,
            yieldMax: 4,
            secondaryResourceId: 'flint',
            secondaryYield: 1,
          });
        } else if (rand < 0.12) {
          resources.push({
            id: `iron_${resCount++}`,
            type: 'iron_ore',
            tileX: tx,
            tileY: ty,
            x: tx * TILE_SIZE + TILE_SIZE / 2,
            y: ty * TILE_SIZE + TILE_SIZE / 2,
            width: TILE_SIZE,
            height: TILE_SIZE,
            hp: 60,
            maxHp: 60,
            hitFlash: 0,
            resourceId: 'iron_ore',
            yieldMin: 2,
            yieldMax: 4,
            secondaryResourceId: 'stone',
            secondaryYield: 2,
          });
        } else if (rand < 0.16) {
          resources.push({
            id: `gold_${resCount++}`,
            type: 'gold_ore',
            tileX: tx,
            tileY: ty,
            x: tx * TILE_SIZE + TILE_SIZE / 2,
            y: ty * TILE_SIZE + TILE_SIZE / 2,
            width: TILE_SIZE,
            height: TILE_SIZE,
            hp: 80,
            maxHp: 80,
            hitFlash: 0,
            resourceId: 'gold_ore',
            yieldMin: 1,
            yieldMax: 3,
          });
        } else {
          resources.push({
            id: `rock_${resCount++}`,
            type: 'rock',
            tileX: tx,
            tileY: ty,
            x: tx * TILE_SIZE + TILE_SIZE / 2,
            y: ty * TILE_SIZE + TILE_SIZE / 2,
            width: TILE_SIZE,
            height: TILE_SIZE,
            hp: 40,
            maxHp: 40,
            hitFlash: 0,
            resourceId: 'stone',
            yieldMin: 2,
            yieldMax: 4,
            secondaryResourceId: 'coal',
            secondaryYield: 1,
          });
        }
        continue;
      }

      // Savanna Biome Resources (Acacia Trees, Savanna Rocks, Wild Shrubs)
      if (t === TILE_TYPES.SAVANNA_GRASS && rand < 0.16) {
        if (rand < 0.08) {
          // Umbrella Acacia Tree
          const scale = 0.95 + Math.random() * 0.35;
          resources.push({
            id: `acacia_${resCount++}`,
            type: 'acacia_tree',
            tileX: tx,
            tileY: ty,
            x: tx * TILE_SIZE + TILE_SIZE / 2,
            y: ty * TILE_SIZE + TILE_SIZE / 2,
            width: TILE_SIZE * 1.4,
            height: TILE_SIZE * 1.5,
            scale,
            hp: 60,
            maxHp: 60,
            hitFlash: 0,
            resourceId: 'acacia_wood',
            yieldMin: 3,
            yieldMax: 6,
            secondaryResourceId: 'wood',
            secondaryYield: 2,
          });
        } else if (rand < 0.12) {
          // Savanna Boulder
          resources.push({
            id: `savanna_rock_${resCount++}`,
            type: 'rock',
            tileX: tx,
            tileY: ty,
            x: tx * TILE_SIZE + TILE_SIZE / 2,
            y: ty * TILE_SIZE + TILE_SIZE / 2,
            width: TILE_SIZE,
            height: TILE_SIZE,
            scale: 0.9 + Math.random() * 0.3,
            hp: 40,
            maxHp: 40,
            hitFlash: 0,
            resourceId: 'stone',
            yieldMin: 2,
            yieldMax: 4,
            secondaryResourceId: 'iron_ore',
            secondaryYield: 1,
          });
        } else {
          // Dry Savanna Shrub
          resources.push({
            id: `savanna_shrub_${resCount++}`,
            type: 'wild_shrub',
            tileX: tx,
            tileY: ty,
            x: tx * TILE_SIZE + TILE_SIZE / 2,
            y: ty * TILE_SIZE + TILE_SIZE / 2,
            width: TILE_SIZE * 0.7,
            height: TILE_SIZE * 0.7,
            hp: 14,
            maxHp: 14,
            hitFlash: 0,
            resourceId: 'fiber',
            yieldMin: 1,
            yieldMax: 3,
            secondaryResourceId: 'branch',
            secondaryYield: 1,
          });
        }
        continue;
      }

      // Shore / Beach / Desert areas (Cacti, Clay, Sand & Desert Rocks)
      if (t === TILE_TYPES.SAND && rand < 0.16) {
        if (tx >= 165 && rand < 0.08) {
          // Giant Desert Saguaro Cactus
          const scale = 0.9 + Math.random() * 0.35;
          resources.push({
            id: `cactus_${resCount++}`,
            type: 'cactus',
            tileX: tx,
            tileY: ty,
            x: tx * TILE_SIZE + TILE_SIZE / 2,
            y: ty * TILE_SIZE + TILE_SIZE / 2,
            width: TILE_SIZE * 0.9,
            height: TILE_SIZE * 1.3,
            scale,
            hp: 35,
            maxHp: 35,
            hitFlash: 0,
            resourceId: 'cactus_fruit',
            yieldMin: 2,
            yieldMax: 4,
            secondaryResourceId: 'fiber',
            secondaryYield: 2,
          });
        } else if (rand < 0.09) {
          resources.push({
            id: `clay_${resCount++}`,
            type: 'clay_deposit',
            tileX: tx,
            tileY: ty,
            x: tx * TILE_SIZE + TILE_SIZE / 2,
            y: ty * TILE_SIZE + TILE_SIZE / 2,
            width: TILE_SIZE * 0.9,
            height: TILE_SIZE * 0.9,
            hp: 30,
            maxHp: 30,
            hitFlash: 0,
            resourceId: 'clay',
            yieldMin: 2,
            yieldMax: 4,
            secondaryResourceId: 'sand',
            secondaryYield: 1,
          });
        } else {
          resources.push({
            id: `sand_${resCount++}`,
            type: 'sand_pile',
            tileX: tx,
            tileY: ty,
            x: tx * TILE_SIZE + TILE_SIZE / 2,
            y: ty * TILE_SIZE + TILE_SIZE / 2,
            width: TILE_SIZE * 0.8,
            height: TILE_SIZE * 0.8,
            hp: 25,
            maxHp: 25,
            hitFlash: 0,
            resourceId: 'sand',
            yieldMin: 2,
            yieldMax: 5,
          });
        }
        continue;
      }

      // Snow Biome Resources (Snowy Pines, Diamond Ore, Frozen Rocks)
      if (t === TILE_TYPES.SNOW_GROUND && rand < 0.16) {
        if (rand < 0.03) {
          // Rare Diamond Ore Vein
          resources.push({
            id: `diamond_${resCount++}`,
            type: 'diamond_ore',
            tileX: tx,
            tileY: ty,
            x: tx * TILE_SIZE + TILE_SIZE / 2,
            y: ty * TILE_SIZE + TILE_SIZE / 2,
            width: TILE_SIZE,
            height: TILE_SIZE,
            scale: 1.0 + Math.random() * 0.2,
            hp: 90,
            maxHp: 90,
            hitFlash: 0,
            resourceId: 'diamond_ore_item',
            yieldMin: 1,
            yieldMax: 2,
            secondaryResourceId: 'diamond',
            secondaryYield: 1,
          });
        } else if (rand < 0.10) {
          // Snowy Pine Tree
          const scale = 0.9 + Math.random() * 0.4;
          resources.push({
            id: `snow_pine_${resCount++}`,
            type: 'snowy_pine',
            tileX: tx,
            tileY: ty,
            x: tx * TILE_SIZE + TILE_SIZE / 2,
            y: ty * TILE_SIZE + TILE_SIZE / 2,
            width: TILE_SIZE * 1.1,
            height: TILE_SIZE * 1.5,
            scale,
            hp: 55,
            maxHp: 55,
            hitFlash: 0,
            resourceId: 'wood',
            yieldMin: 3,
            yieldMax: 5,
            secondaryResourceId: 'resin',
            secondaryYield: 2,
          });
        } else {
          // Frozen Rock
          resources.push({
            id: `snow_rock_${resCount++}`,
            type: 'rock',
            tileX: tx,
            tileY: ty,
            x: tx * TILE_SIZE + TILE_SIZE / 2,
            y: ty * TILE_SIZE + TILE_SIZE / 2,
            width: TILE_SIZE,
            height: TILE_SIZE,
            scale: 0.9 + Math.random() * 0.3,
            hp: 45,
            maxHp: 45,
            hitFlash: 0,
            resourceId: 'stone',
            yieldMin: 2,
            yieldMax: 4,
            secondaryResourceId: 'flint',
            secondaryYield: 1,
          });
        }
        continue;
      }

      // Temperate Forest (Diverse Oak, Birch, Pine, Willow, Bushes)
      if (t === TILE_TYPES.GRASS && rand < 0.16) {
        if (rand < 0.05) {
          // Sturdy Oak Tree
          const scale = 1.0 + Math.random() * 0.35;
          resources.push({
            id: `oak_${resCount++}`,
            type: 'oak_tree',
            tileX: tx,
            tileY: ty,
            x: tx * TILE_SIZE + TILE_SIZE / 2,
            y: ty * TILE_SIZE + TILE_SIZE / 2,
            width: TILE_SIZE * 1.3,
            height: TILE_SIZE * 1.6,
            scale,
            hp: 55,
            maxHp: 55,
            hitFlash: 0,
            resourceId: 'wood',
            yieldMin: 3,
            yieldMax: 5,
            secondaryResourceId: 'apple',
            secondaryYield: 1,
          });
        } else if (rand < 0.08) {
          // Elegant Birch Tree (White bark)
          const scale = 0.85 + Math.random() * 0.3;
          resources.push({
            id: `birch_${resCount++}`,
            type: 'birch_tree',
            tileX: tx,
            tileY: ty,
            x: tx * TILE_SIZE + TILE_SIZE / 2,
            y: ty * TILE_SIZE + TILE_SIZE / 2,
            width: TILE_SIZE * 1.0,
            height: TILE_SIZE * 1.4,
            scale,
            hp: 40,
            maxHp: 40,
            hitFlash: 0,
            resourceId: 'wood',
            yieldMin: 2,
            yieldMax: 4,
            secondaryResourceId: 'branch',
            secondaryYield: 2,
          });
        } else if (rand < 0.11) {
          // Towering Pine tree
          const scale = 0.95 + Math.random() * 0.35;
          resources.push({
            id: `pine_${resCount++}`,
            type: 'pine_tree',
            tileX: tx,
            tileY: ty,
            x: tx * TILE_SIZE + TILE_SIZE / 2,
            y: ty * TILE_SIZE + TILE_SIZE / 2,
            width: TILE_SIZE * 1.1,
            height: TILE_SIZE * 1.5,
            scale,
            hp: 48,
            maxHp: 48,
            hitFlash: 0,
            resourceId: 'wood',
            yieldMin: 2,
            yieldMax: 4,
            secondaryResourceId: 'resin',
            secondaryYield: 2,
          });
        } else if (rand < 0.125) {
          // Weeping Willow tree
          const scale = 1.0 + Math.random() * 0.3;
          resources.push({
            id: `willow_${resCount++}`,
            type: 'willow_tree',
            tileX: tx,
            tileY: ty,
            x: tx * TILE_SIZE + TILE_SIZE / 2,
            y: ty * TILE_SIZE + TILE_SIZE / 2,
            width: TILE_SIZE * 1.3,
            height: TILE_SIZE * 1.5,
            scale,
            hp: 50,
            maxHp: 50,
            hitFlash: 0,
            resourceId: 'wood',
            yieldMin: 3,
            yieldMax: 5,
            secondaryResourceId: 'fiber',
            secondaryYield: 3,
          });
        } else if (rand < 0.14) {
          // Berry bush
          const scale = 0.8 + Math.random() * 0.3;
          resources.push({
            id: `bush_${resCount++}`,
            type: 'berry_bush',
            tileX: tx,
            tileY: ty,
            x: tx * TILE_SIZE + TILE_SIZE / 2,
            y: ty * TILE_SIZE + TILE_SIZE / 2,
            width: TILE_SIZE * 0.8,
            height: TILE_SIZE * 0.8,
            scale,
            hp: 20,
            maxHp: 20,
            hitFlash: 0,
            resourceId: 'berries',
            yieldMin: 2,
            yieldMax: 4,
            secondaryResourceId: 'fiber',
            secondaryYield: 2,
          });
        } else if (rand < 0.15) {
          // Flowering bush
          const scale = 0.8 + Math.random() * 0.3;
          resources.push({
            id: `flowering_${resCount++}`,
            type: 'flowering_bush',
            tileX: tx,
            tileY: ty,
            x: tx * TILE_SIZE + TILE_SIZE / 2,
            y: ty * TILE_SIZE + TILE_SIZE / 2,
            width: TILE_SIZE * 0.8,
            height: TILE_SIZE * 0.8,
            scale,
            hp: 18,
            maxHp: 18,
            hitFlash: 0,
            resourceId: 'fiber',
            yieldMin: 2,
            yieldMax: 3,
            secondaryResourceId: 'medicinal_herb',
            secondaryYield: 1,
          });
        } else {
          // Wild Shrub / Herb
          const scale = 0.75 + Math.random() * 0.3;
          resources.push({
            id: `shrub_${resCount++}`,
            type: 'wild_shrub',
            tileX: tx,
            tileY: ty,
            x: tx * TILE_SIZE + TILE_SIZE / 2,
            y: ty * TILE_SIZE + TILE_SIZE / 2,
            width: TILE_SIZE * 0.7,
            height: TILE_SIZE * 0.7,
            scale,
            hp: 16,
            maxHp: 16,
            hitFlash: 0,
            resourceId: 'fiber',
            yieldMin: 1,
            yieldMax: 2,
            secondaryResourceId: 'branch',
            secondaryYield: 1,
          });
        }
      }
    }
  }

  // 4. Populate world with diverse scattered animals (rabbits, pigs, deer, cows, chickens, foxes)
  const animalTypes: ('rabbit' | 'chicken' | 'pig' | 'deer' | 'fox' | 'cow')[] = [
    'rabbit', 'rabbit', 'chicken', 'pig', 'deer', 'deer', 'fox', 'cow'
  ];
  for (let i = 0; i < 28; i++) {
    const rx = 8 + Math.floor(Math.random() * (width - 16));
    const ry = 8 + Math.floor(Math.random() * (height - 16));
    const t = tiles[idx(rx, ry)];
    if (t === TILE_TYPES.WATER || t === TILE_TYPES.DEEP_WATER) continue;

    const aType = animalTypes[i % animalTypes.length];
    animals.push({
      id: `wild_${aType}_${i}`,
      type: aType,
      x: rx * TILE_SIZE,
      y: ry * TILE_SIZE,
      vx: 0,
      vy: 0,
      facing: Math.random() < 0.5 ? 'left' : 'right',
      hp: aType === 'chicken' || aType === 'rabbit' ? 20 : aType === 'fox' ? 30 : aType === 'pig' ? 45 : 60,
      maxHp: aType === 'chicken' || aType === 'rabbit' ? 20 : aType === 'fox' ? 30 : aType === 'pig' ? 45 : 60,
      state: 'graze',
      stateTimer: 2 + Math.random() * 4,
      hitFlash: 0,
    });
  }

  // 5. Populate world with diverse scattered enemies according to biome
  for (let i = 0; i < 48; i++) {
    const rx = 10 + Math.floor(Math.random() * (width - 20));
    const ry = 10 + Math.floor(Math.random() * (height - 20));
    const dist = Math.hypot(rx - baseX, ry - baseY);
    if (dist < 14) continue; // Safe starter zone buffer

    const t = tiles[idx(rx, ry)];
    if (t === TILE_TYPES.WATER || t === TILE_TYPES.DEEP_WATER) continue;

    // Check biome to pick appropriate enemy
    if (rx >= 165 || t === TILE_TYPES.SAND) {
      // Vast Desert Mobs: Scorpion, Mummy, Desert Snake
      const r = Math.random();
      if (r < 0.4) {
        enemies.push({
          id: `wild_scorpion_${i}`,
          type: 'scorpion',
          x: rx * TILE_SIZE,
          y: ry * TILE_SIZE,
          vx: 0,
          vy: 0,
          facing: 'down',
          hp: 48,
          maxHp: 48,
          damage: 18,
          speed: 68,
          attackRange: 32,
          aggroRange: 165,
          attackCooldown: 1.2,
          attackTimer: 0,
          telegraphTimer: 0,
          hitFlash: 0,
          state: 'wander',
          stateTimer: 3,
          deathTimer: 0,
        });
      } else if (r < 0.72) {
        enemies.push({
          id: `wild_mummy_${i}`,
          type: 'mummy',
          x: rx * TILE_SIZE,
          y: ry * TILE_SIZE,
          vx: 0,
          vy: 0,
          facing: 'down',
          hp: 85,
          maxHp: 85,
          damage: 22,
          speed: 40,
          attackRange: 34,
          aggroRange: 150,
          attackCooldown: 1.5,
          attackTimer: 0,
          telegraphTimer: 0,
          hitFlash: 0,
          state: 'wander',
          stateTimer: 4,
          deathTimer: 0,
        });
      } else {
        enemies.push({
          id: `wild_snake_${i}`,
          type: 'desert_snake',
          x: rx * TILE_SIZE,
          y: ry * TILE_SIZE,
          vx: 0,
          vy: 0,
          facing: 'right',
          hp: 36,
          maxHp: 36,
          damage: 16,
          speed: 82,
          attackRange: 28,
          aggroRange: 175,
          attackCooldown: 1.0,
          attackTimer: 0,
          telegraphTimer: 0,
          hitFlash: 0,
          state: 'wander',
          stateTimer: 2.5,
          deathTimer: 0,
        });
      }
    } else if (t === TILE_TYPES.SAVANNA_GRASS) {
      // Savanna Mobs: Desert Snake, Wolf, Scorpion
      const r = Math.random();
      if (r < 0.45) {
        enemies.push({
          id: `wild_snake_${i}`,
          type: 'desert_snake',
          x: rx * TILE_SIZE,
          y: ry * TILE_SIZE,
          vx: 0,
          vy: 0,
          facing: 'right',
          hp: 36,
          maxHp: 36,
          damage: 16,
          speed: 82,
          attackRange: 28,
          aggroRange: 175,
          attackCooldown: 1.0,
          attackTimer: 0,
          telegraphTimer: 0,
          hitFlash: 0,
          state: 'wander',
          stateTimer: 2.5,
          deathTimer: 0,
        });
      } else {
        enemies.push({
          id: `wild_wolf_${i}`,
          type: 'wolf',
          x: rx * TILE_SIZE,
          y: ry * TILE_SIZE,
          vx: 0,
          vy: 0,
          facing: 'down',
          hp: 50,
          maxHp: 50,
          damage: 15,
          speed: 72,
          attackRange: 32,
          aggroRange: 175,
          attackCooldown: 1.2,
          attackTimer: 0,
          telegraphTimer: 0,
          hitFlash: 0,
          state: 'wander',
          stateTimer: 3,
          deathTimer: 0,
        });
      }
    } else if (t === TILE_TYPES.SNOW_GROUND || (ry < 50 && rx < 70)) {
      // Frozen Peaks / Rocky Mountains: Skeletons & Frost Wolves
      enemies.push({
        id: `wild_skel_${i}`,
        type: 'skeleton',
        x: rx * TILE_SIZE,
        y: ry * TILE_SIZE,
        vx: 0,
        vy: 0,
        facing: 'down',
        hp: 50,
        maxHp: 50,
        damage: 16,
        speed: 55,
        attackRange: 170,
        aggroRange: 210,
        attackCooldown: 1.8,
        attackTimer: 0,
        telegraphTimer: 0,
        hitFlash: 0,
        state: 'wander',
        stateTimer: 3,
        deathTimer: 0,
      });
    } else {
      // Lush Temperate Forest: Wolves & Shambling Zombies
      if (Math.random() < 0.5) {
        enemies.push({
          id: `wild_wolf_${i}`,
          type: 'wolf',
          x: rx * TILE_SIZE,
          y: ry * TILE_SIZE,
          vx: 0,
          vy: 0,
          facing: 'down',
          hp: 45,
          maxHp: 45,
          damage: 14,
          speed: 70,
          attackRange: 32,
          aggroRange: 170,
          attackCooldown: 1.2,
          attackTimer: 0,
          telegraphTimer: 0,
          hitFlash: 0,
          state: 'wander',
          stateTimer: 3,
          deathTimer: 0,
        });
      } else {
        enemies.push({
          id: `wild_zombie_${i}`,
          type: 'zombie',
          x: rx * TILE_SIZE,
          y: ry * TILE_SIZE,
          vx: 0,
          vy: 0,
          facing: 'down',
          hp: 55,
          maxHp: 55,
          damage: 16,
          speed: 42,
          attackRange: 28,
          aggroRange: 160,
          attackCooldown: 1.4,
          attackTimer: 0,
          telegraphTimer: 0,
          hitFlash: 0,
          state: 'wander',
          stateTimer: 4,
          deathTimer: 0,
        });
      }
    }
  }

  return {
    width,
    height,
    tileSize: TILE_SIZE,
    tiles,
    resources,
    structures,
    enemies,
    animals,
    projectiles: [],
    lootDrops: [],
    timeOfDay: 8 * 60, // 08:00 AM Morning Sun (Dia 1)
    dayCount: 1,
    weather: 'sunny',
    weatherTimer: 180,
    rainIntensity: 0,
    snowIntensity: 0,
    disasterType: 'none',
    disasterTimer: 0,
    disasterWarning: '',
    windAngle: Math.PI / 6,
    lightningTimer: 0,
  };
}

export function generateCaveWorld(): WorldState {
  const width = 60;
  const height = 60;
  const tiles = new Uint8Array(width * height);
  const resources: ResourceNode[] = [];
  const structures: StructureEntity[] = [];
  const enemies: EnemyEntity[] = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (x < 3 || x >= width - 3 || y < 3 || y >= height - 3 || (Math.random() < 0.12 && Math.hypot(x - 30, y - 30) > 8)) {
        tiles[y * width + x] = TILE_TYPES.CAVE_WALL;
      } else {
        tiles[y * width + x] = TILE_TYPES.CAVE_GROUND;
      }
    }
  }

  // Cave exit ladder at center
  structures.push({
    id: 'cave_exit_ladder',
    type: 'cave_exit',
    tileX: 30,
    tileY: 30,
    x: 30 * TILE_SIZE + TILE_SIZE / 2,
    y: 30 * TILE_SIZE + TILE_SIZE / 2,
    width: TILE_SIZE,
    height: TILE_SIZE,
    hp: 9999,
    maxHp: 9999,
  });

  // Glowing floor torches near the entrance
  structures.push({
    id: 'cave_torch_1',
    type: 'floor_torch',
    tileX: 28,
    tileY: 30,
    x: 28 * TILE_SIZE + TILE_SIZE / 2,
    y: 30 * TILE_SIZE + TILE_SIZE / 2,
    width: TILE_SIZE,
    height: TILE_SIZE,
    hp: 100,
    maxHp: 100,
    lit: true,
  });

  // Ancient underground chest with rare exploration rewards
  structures.push({
    id: 'cave_ancient_chest',
    type: 'chest',
    tileX: 32,
    tileY: 28,
    x: 32 * TILE_SIZE + TILE_SIZE / 2,
    y: 28 * TILE_SIZE + TILE_SIZE / 2,
    width: TILE_SIZE,
    height: TILE_SIZE,
    hp: 300,
    maxHp: 300,
    chestInventory: [
      { item: ITEMS.iron_pickaxe, quantity: 1 },
      { item: ITEMS.torch, quantity: 5 },
      { item: ITEMS.health_potion, quantity: 3 },
      { item: ITEMS.cooked_meat, quantity: 4 },
      { item: ITEMS.diamond_gem, quantity: 2 },
      { item: ITEMS.cave_crystal, quantity: 4 },
      ...new Array(10).fill(null),
    ],
  });

  // Dense rare ores & crystals in the cavern
  let resId = 0;
  for (let ty = 4; ty < height - 4; ty++) {
    for (let tx = 4; tx < width - 4; tx++) {
      if (Math.hypot(tx - 30, ty - 30) < 6) continue;
      if (tiles[ty * width + tx] !== TILE_TYPES.CAVE_GROUND) continue;

      const r = Math.random();
      if (r < 0.05) {
        resources.push({
          id: `cave_diamond_${resId++}`,
          type: 'diamond_ore',
          tileX: tx,
          tileY: ty,
          x: tx * TILE_SIZE + TILE_SIZE / 2,
          y: ty * TILE_SIZE + TILE_SIZE / 2,
          width: TILE_SIZE,
          height: TILE_SIZE,
          hp: 120,
          maxHp: 120,
          hitFlash: 0,
          resourceId: 'diamond_gem',
          yieldMin: 1,
          yieldMax: 2,
        });
      } else if (r < 0.10) {
        resources.push({
          id: `cave_crystal_${resId++}`,
          type: 'cave_crystal',
          tileX: tx,
          tileY: ty,
          x: tx * TILE_SIZE + TILE_SIZE / 2,
          y: ty * TILE_SIZE + TILE_SIZE / 2,
          width: TILE_SIZE,
          height: TILE_SIZE,
          hp: 50,
          maxHp: 50,
          hitFlash: 0,
          resourceId: 'cave_crystal',
          yieldMin: 2,
          yieldMax: 4,
        });
      } else if (r < 0.16) {
        resources.push({
          id: `cave_gold_${resId++}`,
          type: 'gold_ore',
          tileX: tx,
          tileY: ty,
          x: tx * TILE_SIZE + TILE_SIZE / 2,
          y: ty * TILE_SIZE + TILE_SIZE / 2,
          width: TILE_SIZE,
          height: TILE_SIZE,
          hp: 80,
          maxHp: 80,
          hitFlash: 0,
          resourceId: 'gold_ore',
          yieldMin: 2,
          yieldMax: 4,
        });
      } else if (r < 0.22) {
        resources.push({
          id: `cave_iron_${resId++}`,
          type: 'iron_ore',
          tileX: tx,
          tileY: ty,
          x: tx * TILE_SIZE + TILE_SIZE / 2,
          y: ty * TILE_SIZE + TILE_SIZE / 2,
          width: TILE_SIZE,
          height: TILE_SIZE,
          hp: 60,
          maxHp: 60,
          hitFlash: 0,
          resourceId: 'iron_ore',
          yieldMin: 2,
          yieldMax: 5,
        });
      } else if (r < 0.28) {
        resources.push({
          id: `cave_stalag_${resId++}`,
          type: 'stalagmite',
          tileX: tx,
          tileY: ty,
          x: tx * TILE_SIZE + TILE_SIZE / 2,
          y: ty * TILE_SIZE + TILE_SIZE / 2,
          width: TILE_SIZE,
          height: TILE_SIZE,
          hp: 40,
          maxHp: 40,
          hitFlash: 0,
          resourceId: 'stone',
          yieldMin: 2,
          yieldMax: 4,
        });
      }
    }
  }

  // Dangerous underground enemies
  enemies.push(
    {
      id: 'cave_skel_1',
      type: 'skeleton',
      x: 18 * TILE_SIZE,
      y: 20 * TILE_SIZE,
      vx: 0, vy: 0, facing: 'right',
      hp: 50, maxHp: 50, damage: 16, speed: 55, attackRange: 180, aggroRange: 220,
      attackCooldown: 1.8, attackTimer: 0, telegraphTimer: 0, hitFlash: 0, state: 'wander', stateTimer: 3, deathTimer: 0
    },
    {
      id: 'cave_skel_2',
      type: 'skeleton',
      x: 42 * TILE_SIZE,
      y: 38 * TILE_SIZE,
      vx: 0, vy: 0, facing: 'left',
      hp: 50, maxHp: 50, damage: 16, speed: 55, attackRange: 180, aggroRange: 220,
      attackCooldown: 1.8, attackTimer: 0, telegraphTimer: 0, hitFlash: 0, state: 'wander', stateTimer: 3, deathTimer: 0
    },
    {
      id: 'cave_zombie_1',
      type: 'zombie',
      x: 35 * TILE_SIZE,
      y: 18 * TILE_SIZE,
      vx: 0, vy: 0, facing: 'down',
      hp: 80, maxHp: 80, damage: 20, speed: 45, attackRange: 32, aggroRange: 190,
      attackCooldown: 1.4, attackTimer: 0, telegraphTimer: 0, hitFlash: 0, state: 'wander', stateTimer: 4, deathTimer: 0
    }
  );

  return {
    width,
    height,
    tileSize: TILE_SIZE,
    tiles,
    resources,
    structures,
    enemies,
    animals: [],
    projectiles: [],
    lootDrops: [],
    timeOfDay: 12 * 60,
    dayCount: 1,
    weather: 'cloudy',
    weatherTimer: 9999,
    rainIntensity: 0,
    snowIntensity: 0,
    disasterType: 'none',
    disasterTimer: 0,
    disasterWarning: '',
    windAngle: 0,
    lightningTimer: 0,
  };
}

export function findRandomSafeSpawn(tiles: Uint8Array, width: number, height: number): { x: number; y: number } {
  for (let attempt = 0; attempt < 50; attempt++) {
    const tx = 50 + Math.floor(Math.random() * (width - 100));
    const ty = 50 + Math.floor(Math.random() * (height - 100));
    const t = tiles[ty * width + tx];
    if (t === TILE_TYPES.GRASS || t === TILE_TYPES.DIRT_PATH) {
      let safe = true;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const neighbor = tiles[(ty + dy) * width + (tx + dx)];
          if (neighbor === TILE_TYPES.WATER || neighbor === TILE_TYPES.DEEP_WATER) {
            safe = false;
            break;
          }
        }
        if (!safe) break;
      }
      if (safe) {
        return {
          x: tx * TILE_SIZE + TILE_SIZE / 2,
          y: ty * TILE_SIZE + TILE_SIZE / 2,
        };
      }
    }
  }
  return {
    x: 60 * TILE_SIZE + TILE_SIZE / 2,
    y: 60 * TILE_SIZE + TILE_SIZE / 2,
  };
}
