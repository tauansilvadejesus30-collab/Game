export type Direction = 'down' | 'up' | 'left' | 'right';

export type BiomeType = 'forest' | 'beach' | 'mountain' | 'desert' | 'ruins';

export type WeatherType = 'sunny' | 'cloudy' | 'rain' | 'thunderstorm' | 'snow';

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
  toolType?: 'axe' | 'pickaxe' | 'hoe' | 'rod';
  toolTier?: number;
  damage?: number;
  defense?: number;
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
  requiresStation?: 'workbench' | 'campfire' | 'furnace';
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
  stats: PlayerStats;
  inventory: (InventorySlot | null)[];
  selectedHotbarIndex: number;
  equipment: Equipment;
  skills: Record<string, boolean>;
}

export type EnemyType = 'wolf' | 'zombie' | 'skeleton' | 'bear' | 'boss_spectre';

export type AnimalType = 'cow' | 'chicken';

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
    | 'farmland' 
    | 'scarecrow' 
    | 'wall_torch' 
    | 'floor_torch'
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
  type: 'tree' | 'pine_tree' | 'rock' | 'iron_ore' | 'gold_ore' | 'berry_bush' | 'fallen_log' | 'medicinal_plant' | 'loose_branch' | 'loose_stone';
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
  type: 'pixel' | 'smoke' | 'fire' | 'spark' | 'water' | 'blood' | 'star' | 'rain' | 'text';
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
  windAngle: number;
  lightningTimer: number;
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
