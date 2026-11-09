import { 
  WORLD_WIDTH_TILES, 
  WORLD_HEIGHT_TILES, 
  TILE_TYPES, 
  TILE_SIZE 
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

  // 1. Generate Biome Base Tiles
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // Lake / River in South-West
      const distToLake = Math.hypot(x - 45, y - 90);
      if (distToLake < 18) {
        tiles[idx(x, y)] = TILE_TYPES.DEEP_WATER;
        continue;
      } else if (distToLake < 24) {
        tiles[idx(x, y)] = TILE_TYPES.WATER;
        continue;
      } else if (distToLake < 28) {
        tiles[idx(x, y)] = TILE_TYPES.SAND;
        continue;
      }

      // Desert in Far East
      if (x > 95) {
        tiles[idx(x, y)] = TILE_TYPES.SAND;
        continue;
      }

      // Rocky Mountain in North
      if (y < 25) {
        if (Math.random() < 0.6) {
          tiles[idx(x, y)] = TILE_TYPES.STONE_GROUND;
        } else {
          tiles[idx(x, y)] = TILE_TYPES.GRASS;
        }
        continue;
      }

      // Ancient Ruins in North-West
      if (x < 30 && y < 45) {
        if (Math.random() < 0.7) {
          tiles[idx(x, y)] = TILE_TYPES.RUINS_FLOOR;
        } else {
          tiles[idx(x, y)] = TILE_TYPES.GRASS;
        }
        continue;
      }

      // Default Forest Grass
      tiles[idx(x, y)] = TILE_TYPES.GRASS;
    }
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

      // Rocky Mountain Area (High iron and gold)
      if (ty < 25 && rand < 0.18) {
        if (rand < 0.08) {
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
        } else if (rand < 0.12) {
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

      // Temperate Forest
      if (t === TILE_TYPES.GRASS && rand < 0.15) {
        if (rand < 0.08) {
          // Oak tree
          resources.push({
            id: `tree_${resCount++}`,
            type: 'tree',
            tileX: tx,
            tileY: ty,
            x: tx * TILE_SIZE + TILE_SIZE / 2,
            y: ty * TILE_SIZE + TILE_SIZE / 2,
            width: TILE_SIZE * 1.2,
            height: TILE_SIZE * 1.5,
            hp: 50,
            maxHp: 50,
            hitFlash: 0,
            resourceId: 'wood',
            yieldMin: 3,
            yieldMax: 5,
            secondaryResourceId: 'apple',
            secondaryYield: 1,
          });
        } else if (rand < 0.11) {
          // Pine tree
          resources.push({
            id: `pine_${resCount++}`,
            type: 'pine_tree',
            tileX: tx,
            tileY: ty,
            x: tx * TILE_SIZE + TILE_SIZE / 2,
            y: ty * TILE_SIZE + TILE_SIZE / 2,
            width: TILE_SIZE,
            height: TILE_SIZE * 1.4,
            hp: 45,
            maxHp: 45,
            hitFlash: 0,
            resourceId: 'wood',
            yieldMin: 2,
            yieldMax: 4,
            secondaryResourceId: 'branch',
            secondaryYield: 2,
          });
        } else if (rand < 0.13) {
          // Berry bush
          resources.push({
            id: `bush_${resCount++}`,
            type: 'berry_bush',
            tileX: tx,
            tileY: ty,
            x: tx * TILE_SIZE + TILE_SIZE / 2,
            y: ty * TILE_SIZE + TILE_SIZE / 2,
            width: TILE_SIZE * 0.8,
            height: TILE_SIZE * 0.8,
            hp: 20,
            maxHp: 20,
            hitFlash: 0,
            resourceId: 'berries',
            yieldMin: 2,
            yieldMax: 4,
            secondaryResourceId: 'fiber',
            secondaryYield: 2,
          });
        } else {
          // Herb or fallen log
          resources.push({
            id: `herb_${resCount++}`,
            type: 'medicinal_plant',
            tileX: tx,
            tileY: ty,
            x: tx * TILE_SIZE + TILE_SIZE / 2,
            y: ty * TILE_SIZE + TILE_SIZE / 2,
            width: TILE_SIZE * 0.6,
            height: TILE_SIZE * 0.6,
            hp: 15,
            maxHp: 15,
            hitFlash: 0,
            resourceId: 'medicinal_herb',
            yieldMin: 1,
            yieldMax: 2,
          });
        }
      }
    }
  }

  // 4. Populate world with scattered animals & wild enemies
  for (let i = 0; i < 25; i++) {
    const rx = 10 + Math.floor(Math.random() * (width - 20));
    const ry = 10 + Math.floor(Math.random() * (height - 20));
    const dist = Math.hypot(rx - baseX, ry - baseY);
    if (dist < 14) continue;

    const t = tiles[idx(rx, ry)];
    if (t === TILE_TYPES.WATER || t === TILE_TYPES.DEEP_WATER) continue;

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
    windAngle: Math.PI / 6,
    lightningTimer: 0,
  };
}
