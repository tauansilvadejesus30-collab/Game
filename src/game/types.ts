export type Direction = 'down' | 'up' | 'left' | 'right';

export type BiomeType = 'forest' | 'beach' | 'mountain' | 'desert' | 'ruins' | 'snow';

export type WeatherType = 'sunny' | 'cloudy' | 'rain' | 'thunderstorm' | 'snow' | 'blizzard' | 'heatwave' | 'earthquake';

export type ItemCategory = 
  | 'tool' 
  | 'weapon' 
  | 'resource' 
  | 'food' 
  | 'building' 
  | 'equipment' 
  | 'seed';

export interface ItemDef {
  id: string;
  name: string;
  description: string;
  category: ItemCategory;
  stackable: boolean;
  maxStack: number;
  icon: string;
  toolType?: 'axe' | 'pickaxe' | 'hoe' | 'rod' | 'knife' | 'saw' | 'hammer' | 'spear' | 'sword' | 'bow' | 'shovel';
  toolTier?: number;
  damage?: number;
  defense?: number;
  speedBonus?: number;
  hunger?: number;
  thirst?: number;
  energy?: number;
  health?: number;
  temperatureEffect?: number;
  placeableStructureId?: string;
  cropType?: 'tomato' | 'corn' | 'wheat';
}

export interface InventorySlot {
  item: ItemDef;
  quantity: number;
}

export interface Equipment {
  helmet: InventorySlot | null;
  armor: InventorySlot | null;
  boots: InventorySlot | null;
  weapon: InventorySlot | null;
  accessory: InventorySlot | null;
}

export interface RecipeRequirement {
  itemId: string;
  quantity: number;
}

export interface Recipe {
  id: string;
  outputItemId: string;
  outputQuantity: number;
  ingredients: RecipeRequirement[];
  category: 'tools' | 'weapons' | 'survival' | 'building' | 'cooking';
  requiresStation?: 'workbench' | 'campfire' | 'furnace' | 'sawmill' | 'anvil';
}

export interface SkillNode {
  id: string;
  name: string;
  description: string;
  cost: number;
  unlocked: boolean;
  icon: string;
  effect: 'woodcutting' | 'mining' | 'metabolism' | 'combat' | 'builder' | 'speed';
  value: number;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  targetCount: number;
  currentCount: number;
  completed: boolean;
  claimed: boolean;
  rewardXp: number;
  rewardItems: { itemId: string; quantity: number }[];
  type: 'gather' | 'craft' | 'build' | 'kill' | 'survive' | 'explore';
  targetKey: string;
}

export interface PlayerStats {
  hp: number;
  maxHp: number;
  hunger: number;
  maxHunger: number;
  thirst: number;
  maxThirst: number;
  energy: number;
  maxEnergy: number;
  bodyTemp: number; // 36°C normal
  sleep: number;    // 0 (fully rested) to 100 (exhausted)
  breath: number;   // 0 to 100 for swimming
  maxBreath: number;
  xp: number;
  level: number;
  skillPoints: number;
}

export interface PlayerEntity {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  facing: Direction;
  isMoving: boolean;
  isAttacking: boolean;
  attackTimer: number;
  attackCooldown: number;
  swingProgress: number; // 0 to 1
  isRolling: boolean;
  rollTimer: number;
  hitFlash: number;
  isSwimming: boolean;
  isBoating: boolean;
  boatType?: 'raft' | 'canoe' | 'wood_boat' | null;
  stats: PlayerStats;
  inventory: (InventorySlot | null)[];
  selectedHotbarIndex: number;
  equipment: Equipment;
  skills: Record<string, boolean>;
  spawnPoint?: { x: number; y: number } | null;
  isInsideCave?: boolean;
}

export type EnemyType = 'wolf' | 'zombie' | 'skeleton' | 'bear' | 'boss_spectre';

export type AnimalType = 'cow' | 'chicken' | 'rabbit' | 'pig' | 'deer' | 'fox';

export interface EnemyEntity {
  id: string;
  type: EnemyType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width?: number;
  height?: number;
  facing: Direction;
  hp: number;
  maxHp: number;
  damage: number;
  speed: number;
  attackRange: number;
  aggroRange: number;
  attackCooldown: number;
  attackTimer: number;
  telegraphTimer: number;
  hitFlash: number;
  state: 'idle' | 'wander' | 'alert' | 'chase' | 'attack' | 'dead';
  stateTimer: number;
  targetX?: number;
  targetY?: number;
  deathTimer: number;
  onFire?: boolean;
  fireTimer?: number;
}

export interface AnimalEntity {
  id: string;
  type: AnimalType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  facing: Direction;
  hp: number;
  maxHp: number;
  state: 'idle' | 'walk' | 'graze';
  stateTimer: number;
  hitFlash: number;
  insidePen?: boolean;
}

export interface Projectile {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
  isEnemy: boolean;
  lifespan: number;
}

export interface LootDrop {
  id: string;
  itemId: string;
  quantity: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  lifespan: number;
}

export interface StructureEntity {
  id: string;
  type: 
    | 'cabin_wall' 
    | 'wood_wall' 
    | 'wood_door' 
    | 'fence' 
    | 'chest' 
    | 'campfire' 
    | 'furnace' 
    | 'bed' 
    | 'well' 
    | 'workbench' 
    | 'sawmill'
    | 'anvil'
    | 'raft'
    | 'canoe'
    | 'wood_boat'
    | 'stone_wall'
    | 'farmland' 
    | 'scarecrow' 
    | 'wall_torch' 
    | 'floor_torch'
    | 'cave_entrance'
    | 'cave_exit'
    | 'pier';
  tileX: number;
  tileY: number;
  x: number;
  y: number;
  width: number;
  height: number;
  hp: number;
  maxHp: number;
  isOpen?: boolean; // for doors
  lit?: boolean;   // for campfires, torches, furnaces
  fuelTimer?: number;
  chestInventory?: (InventorySlot | null)[];
  cropStage?: number; // 0: planted, 1: sprouting, 2: growing, 3: mature
  cropGrowthTimer?: number;
  isWatered?: boolean;
  cropYieldItemId?: string;
  smeltingTimer?: number;
  smeltingInput?: InventorySlot | null;
  smeltingOutput?: InventorySlot | null;
}

export interface ResourceNode {
  id: string;
  type: 
    | 'tree' 
    | 'pine_tree' 
    | 'birch_tree'
    | 'oak_tree'
    | 'snowy_pine'
    | 'willow_tree'
    | 'rock' 
    | 'copper_ore' 
    | 'iron_ore' 
    | 'gold_ore' 
    | 'diamond_ore'
    | 'cave_crystal'
    | 'stalagmite'
    | 'berry_bush' 
    | 'flowering_bush'
    | 'wild_shrub'
    | 'fallen_log' 
    | 'medicinal_plant' 
    | 'loose_branch' 
    | 'loose_stone'
    | 'clay_deposit'
    | 'sand_pile';
  tileX: number;
  tileY: number;
  x: number;
  y: number;
  width: number;
  height: number;
  hp: number;
  maxHp: number;
  hitFlash: number;
  resourceId: string;
  yieldMin: number;
  yieldMax: number;
  secondaryResourceId?: string;
  secondaryYield?: number;
  respawnTime?: number;
  scale?: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  alpha: number;
  type: 'pixel' | 'smoke' | 'fire' | 'spark' | 'water' | 'blood' | 'star' | 'rain' | 'snow' | 'leaf' | 'ember' | 'rubble' | 'splash' | 'text';
  text?: string;
}

export interface LightSource {
  x: number;
  y: number;
  radius: number;
  color: string; // rgba
  intensity: number;
  flicker?: boolean;
}

export interface GameSettings {
  masterVolume: number;
  sfxVolume: number;
  musicVolume: number;
  dayLengthMinutes: number;
  showTouchControls: boolean;
  smoothLighting: boolean;
  screenShake: boolean;
}

export interface WorldState {
  width: number;
  height: number;
  tileSize: number;
  tiles: Uint8Array; // tile type id
  resources: ResourceNode[];
  structures: StructureEntity[];
  enemies: EnemyEntity[];
  animals: AnimalEntity[];
  projectiles: Projectile[];
  lootDrops: LootDrop[];
  timeOfDay: number; // 0 to 1440 minutes (24h)
  dayCount: number;
  weather: WeatherType;
  weatherTimer: number;
  rainIntensity: number;
  snowIntensity: number;
  windAngle: number;
  lightningTimer: number;
  disasterType?: 'blizzard' | 'heatwave' | 'earthquake' | 'storm' | 'none';
  disasterTimer?: number;
  disasterWarning?: string | null;
}

export interface SaveGameData {
  version: number;
  timestamp: number;
  player: {
    x: number;
    y: number;
    stats: PlayerStats;
    inventory: (InventorySlot | null)[];
    selectedHotbarIndex: number;
    equipment: Equipment;
    skills: Record<string, boolean>;
  };
  world: {
    timeOfDay: number;
    dayCount: number;
    weather: WeatherType;
    structures: StructureEntity[];
    resources: { id: string; hp: number; tileX: number; tileY: number }[];
  };
  quests: Quest[];
}
