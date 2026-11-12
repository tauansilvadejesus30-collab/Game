import { 
  PlayerEntity, 
  WorldState, 
  Direction, 
  Quest, 
  Particle, 
  LightSource, 
  StructureEntity, 
  InventorySlot,
  EnemyEntity,
  BiomeType
} from './types';
import { 
  TILE_SIZE, 
  ITEMS, 
  INITIAL_QUESTS, 
  TILE_TYPES, 
  WORLD_PIXEL_WIDTH, 
  WORLD_PIXEL_HEIGHT 
} from './constants';
import { generateWorld, generateCaveWorld, findRandomSafeSpawn } from './worldGenerator';
import { spriteRenderer } from './sprites';
import { soundEngine } from './audio';
import { 
  calculateDamage, 
  calculateTargetTemperature, 
  updateSurvivalStats, 
  isTileSolid,
  calculateMovementSpeed,
  updateSwimmingBreath,
  canDismantleWithTool
} from './rules';
import { saveGame, loadGame } from './saveManager';

export class GameEngine {
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  private lightCanvas: HTMLCanvasElement;
  private lightCtx: CanvasRenderingContext2D;
  public cssWidth: number = 0;
  public cssHeight: number = 0;

  public player: PlayerEntity;
  public world: WorldState;
  public quests: Quest[];

  // Camera
  public cameraX: number = 0;
  public cameraY: number = 0;
  public zoom: number = 1.0;

  // Input states
  public keys: Set<string> = new Set();
  public mouseScreenX: number = 0;
  public mouseScreenY: number = 0;
  public mouseWorldX: number = 0;
  public mouseWorldY: number = 0;
  public isMouseDown: boolean = false;

  // Virtual Joystick / Touch input
  public joystickVector: { x: number; y: number } = { x: 0, y: 0 };
  public isTouchSprint: boolean = false;

  // Building mode
  public isBuildingMode: boolean = false;
  public selectedBuildingStructureId: string | null = null;

  // Cave subworld & overworld state
  public caveWorld: WorldState | null = null;
  public overworldWorld: WorldState | null = null;
  public overworldPos: { x: number; y: number } | null = null;

  // Particle pool
  public particles: Particle[] = [];

  // Hitstop & screen shake
  public hitstopTimer: number = 0;
  public shakeDuration: number = 0;
  public shakeMagnitude: number = 0;

  // Animation & time
  private lastTime: number = 0;
  private isRunning: boolean = false;
  private animFrameId: number | null = null;
  public gameTimeMs: number = 0;

  // Modals & UI Callbacks
  public onOpenInventory?: () => void;
  public onOpenCrafting?: () => void;
  public onOpenBuilding?: () => void;
  public onOpenMap?: () => void;
  public onOpenSkills?: () => void;
  public onOpenChest?: (chest: StructureEntity) => void;
  public onOpenCooking?: (station: StructureEntity) => void;
  public onStateChange?: () => void;
  public onGameOver?: () => void;

  // Auto-save timer
  private autoSaveTimer: number = 0;

  // Invulnerability & Survival warnings
  public invulnerabilityTimer: number = 0;
  private survivalWarningTimer: number = 0;
  private oceanAudioTimer: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false })!;
    this.ctx.imageSmoothingEnabled = false;

    this.lightCanvas = document.createElement('canvas');
    this.lightCtx = this.lightCanvas.getContext('2d')!;

    // Load or generate world
    const saved = loadGame();
    if (saved) {
      this.world = {
        ...generateWorld(),
        timeOfDay: saved.world.timeOfDay,
        dayCount: saved.world.dayCount,
        weather: saved.world.weather,
        structures: saved.world.structures,
      };
      this.quests = saved.quests;
      this.player = {
        x: saved.player.x,
        y: saved.player.y,
        vx: 0,
        vy: 0,
        width: 24,
        height: 24,
        facing: 'down',
        isMoving: false,
        isAttacking: false,
        attackTimer: 0,
        attackCooldown: 0.35,
        swingProgress: 0,
        isRolling: false,
        rollTimer: 0,
        hitFlash: 0,
        isSwimming: false,
        isBoating: false,
        boatType: null,
        stats: {
          ...saved.player.stats,
          breath: saved.player.stats.breath ?? 100,
          maxBreath: saved.player.stats.maxBreath ?? 100,
        },
        inventory: saved.player.inventory,
        selectedHotbarIndex: saved.player.selectedHotbarIndex,
        equipment: saved.player.equipment,
        skills: saved.player.skills,
      };
    } else {
      this.world = generateWorld();
      this.quests = JSON.parse(JSON.stringify(INITIAL_QUESTS));
      this.player = this.createDefaultPlayer();
    }

    this.resizeCanvas();
    this.bindEvents();
  }

  private createDefaultPlayer(): PlayerEntity {
    // Starting completely from scratch: 0 wood, 0 stone, 0 tools, empty inventory!
    const inventory: (InventorySlot | null)[] = new Array(24).fill(null);
    const spawn = this.world 
      ? findRandomSafeSpawn(this.world.tiles, this.world.width, this.world.height)
      : { x: 75 * TILE_SIZE, y: 75 * TILE_SIZE };

    return {
      x: spawn.x,
      y: spawn.y,
      vx: 0,
      vy: 0,
      width: 24,
      height: 24,
      facing: 'down',
      isMoving: false,
      isAttacking: false,
      attackTimer: 0,
      attackCooldown: 0.35,
      swingProgress: 0,
      isRolling: false,
      rollTimer: 0,
      hitFlash: 0,
      isSwimming: false,
      isBoating: false,
      boatType: null,
      stats: {
        hp: 100,
        maxHp: 100,
        hunger: 100,
        maxHunger: 100,
        thirst: 100,
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
      },
      inventory,
      selectedHotbarIndex: 0,
      equipment: {
        helmet: null,
        armor: null,
        boots: null,
        weapon: null,
        accessory: null,
      },
      skills: {},
    };
  }

  public resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = this.canvas.getBoundingClientRect();
    const w = Math.floor(rect.width || window.innerWidth);
    const h = Math.floor(rect.height || window.innerHeight);

    this.cssWidth = w;
    this.cssHeight = h;
    this.canvas.width = Math.floor(w * dpr);
    this.canvas.height = Math.floor(h * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.ctx.imageSmoothingEnabled = false;

    this.lightCanvas.width = this.canvas.width;
    this.lightCanvas.height = this.canvas.height;
    this.lightCtx.imageSmoothingEnabled = true;
  }

  private bindEvents() {
    window.addEventListener('resize', () => this.resizeCanvas());

    window.addEventListener('keydown', (e) => {
      this.keys.add(e.code);

      // Hotbar selection 1-8
      if (e.key >= '1' && e.key <= '8') {
        const slotIdx = parseInt(e.key) - 1;
        this.selectHotbarSlot(slotIdx);
      }

      // Action hotkeys
      if (e.code === 'KeyE') {
        const nearbyStruct = this.getNearbyInteractiveStructure();
        if (nearbyStruct) {
          this.interactWithStructure(nearbyStruct);
        } else {
          this.onOpenInventory?.();
        }
      }
      if (e.code === 'KeyC') this.onOpenCrafting?.();
      if (e.code === 'KeyB') this.onOpenBuilding?.();
      if (e.code === 'KeyM') this.onOpenMap?.();
      if (e.code === 'KeyK') this.onOpenSkills?.();
      if (e.code === 'Space') {
        e.preventDefault();
        const nearbyStruct = this.getNearbyInteractiveStructure();
        if (nearbyStruct && !this.isBuildingMode) {
          this.interactWithStructure(nearbyStruct);
        } else {
          this.triggerAttackOrInteract();
        }
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.code);
    });

    window.addEventListener('blur', () => {
      this.keys.clear();
      this.isMouseDown = false;
      this.joystickVector = { x: 0, y: 0 };
    });

    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouseScreenX = e.clientX - rect.left;
      this.mouseScreenY = e.clientY - rect.top;
      this.updateMouseWorldPos();
    });

    this.canvas.addEventListener('mousedown', (e) => {
      if (e.button === 0) {
        this.isMouseDown = true;
        this.handleClickOrInteract(false);
      }
    });

    this.canvas.addEventListener('mouseup', () => {
      this.isMouseDown = false;
    });

    const handleTouchUpdate = (touch: Touch) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouseScreenX = touch.clientX - rect.left;
      this.mouseScreenY = touch.clientY - rect.top;
      this.updateMouseWorldPos();
    };

    this.canvas.addEventListener('touchstart', (e) => {
      const touch = e.changedTouches[0];
      if (touch) {
        handleTouchUpdate(touch);
        if (this.handleClickOrInteract(true)) {
          e.preventDefault();
        }
      }
    }, { passive: false });

    this.canvas.addEventListener('touchmove', (e) => {
      const touch = e.changedTouches[0];
      if (touch) {
        handleTouchUpdate(touch);
      }
    }, { passive: true });

    this.canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      // Right-click cancels building mode
      if (this.isBuildingMode) {
        this.cancelBuildingMode();
      }
    });
  }

  private updateMouseWorldPos() {
    const rect = this.canvas.getBoundingClientRect();
    const halfW = (rect.width || this.cssWidth || 800) / 2;
    const halfH = (rect.height || this.cssHeight || 450) / 2;
    this.mouseWorldX = this.cameraX + (this.mouseScreenX - halfW) / this.zoom;
    this.mouseWorldY = this.cameraY + (this.mouseScreenY - halfH) / this.zoom;
  }

  public selectHotbarSlot(index: number) {
    if (index >= 0 && index < 8) {
      this.player.selectedHotbarIndex = index;
      const itemSlot = this.player.inventory[index];
      this.player.equipment.weapon = itemSlot;
      soundEngine.playUiClick();
      this.onStateChange?.();
    }
  }

  public handleClickOrInteract(isTouch = false): boolean {
    // 1. If in Building Mode: try to place structure
    if (this.isBuildingMode && this.selectedBuildingStructureId) {
      this.tryPlaceStructure();
      return true;
    }

    // 2. Direct click / tap on interactive structures in the world (Workbench, Campfire, Chest, Bed, Door, Furnace, Well)
    const clickTolerance = TILE_SIZE * 0.85;
    const clickedStruct = this.world.structures.find(s => {
      return Math.hypot(s.x - this.mouseWorldX, s.y - this.mouseWorldY) <= clickTolerance;
    });

    if (clickedStruct) {
      const dist = Math.hypot(clickedStruct.x - this.player.x, clickedStruct.y - this.player.y);
      const MAX_CLICK_REACH = 150;
      if (dist <= MAX_CLICK_REACH) {
        return this.interactWithStructure(clickedStruct);
      } else {
        const sType = clickedStruct.type as string;
        const name = (sType === 'workbench' || sType === 'workbench_item') 
          ? 'Bancada' 
          : (sType === 'campfire' || sType === 'campfire_item') 
            ? 'Fogueira' 
            : 'Estrutura';
        this.addFloatingText(clickedStruct.x, clickedStruct.y - 20, `Aproxime-se da ${name}!`, '#f59e0b');
        return true;
      }
    }

    // 3. Normal attack or hotbar item interact
    this.triggerAttackOrInteract();
    return false;
  }

  public getNearbyInteractiveStructure(maxDist = 80): StructureEntity | null {
    let closest: StructureEntity | null = null;
    let closestDist = maxDist;
    for (const struct of this.world.structures) {
      const dist = Math.hypot(struct.x - this.player.x, struct.y - this.player.y);
      if (dist < closestDist) {
        closest = struct;
        closestDist = dist;
      }
    }
    return closest;
  }

  public interactWithStructure(struct: StructureEntity): boolean {
    const equipped = this.player.inventory[this.player.selectedHotbarIndex];
    const isHammer = canDismantleWithTool(equipped?.item);

    // If holding a hammer, dismantle and return item to player!
    if (isHammer && struct.type !== 'cave_entrance' && struct.type !== 'cave_exit' && struct.type !== 'farmland') {
      this.dismantleStructure(struct);
      return true;
    }

    const sType = struct.type as string;
    if (sType === 'cave_entrance') {
      this.enterCave();
      return true;
    } else if (sType === 'cave_exit') {
      this.exitCave();
      return true;
    } else if (sType === 'chest') {
      soundEngine.playUiClick();
      this.onOpenChest?.(struct);
      return true;
    } else if (sType === 'campfire' || sType === 'campfire_item' || sType === 'furnace' || sType === 'furnace_item') {
      soundEngine.playUiClick();
      this.addFloatingText(struct.x, struct.y - 20, '🔥 Culinária / Forja', '#fb923c');
      this.onOpenCooking?.(struct);
      return true;
    } else if (sType === 'weapon_workbench' || sType === 'weapon_workbench_item') {
      soundEngine.playUiClick();
      this.addFloatingText(struct.x, struct.y - 20, '🔫 Bancada de Armas Aberta!', '#38bdf8');
      this.onOpenCrafting?.();
      return true;
    } else if (sType === 'workbench' || sType === 'workbench_item' || sType === 'sawmill' || sType === 'sawmill_item' || sType === 'anvil' || sType === 'anvil_item') {
      soundEngine.playUiClick();
      this.addFloatingText(struct.x, struct.y - 20, '🛠️ Bancada Aberta!', '#facc15');
      this.onOpenCrafting?.();
      return true;
    } else if (sType === 'raft' || sType === 'canoe' || sType === 'wood_boat') {
      if (this.player.isBoating) {
        this.player.isBoating = false;
        this.player.boatType = null;
        this.addFloatingText(this.player.x, this.player.y - 15, 'Desembarcou do Barco', '#ffffff');
      } else {
        this.player.isBoating = true;
        this.player.boatType = sType as 'raft' | 'canoe' | 'wood_boat';
        this.player.isSwimming = false;
        soundEngine.playCollect();
        this.addFloatingText(this.player.x, this.player.y - 15, 'Embarcou no Barco!', '#38bdf8');
      }
      this.onStateChange?.();
      return true;
    } else if (sType === 'bed') {
      this.player.spawnPoint = { x: struct.x, y: struct.y };
      this.addFloatingText(this.player.x, this.player.y - 25, 'Cama vinculada! Ponto de renascimento salvo.', '#38bdf8');
      this.sleepInBed();
      return true;
    } else if (sType === 'well') {
      this.drinkFromWell();
      return true;
    } else if (sType === 'wood_door') {
      struct.isOpen = !struct.isOpen;
      soundEngine.playBuild();
      this.addFloatingText(struct.x, struct.y - 10, struct.isOpen ? 'Porta Aberta' : 'Porta Fechada', '#ffcc00');
      this.onStateChange?.();
      return true;
    } else if (sType === 'farmland' && struct.cropStage && struct.cropStage >= 3) {
      struct.cropStage = 1;
      const yieldItem = struct.cropYieldItemId ? ITEMS[struct.cropYieldItemId] : ITEMS.tomato;
      this.addItemToInventory(yieldItem, 2);
      soundEngine.playPickup();
      this.addFloatingText(struct.x, struct.y - 10, `+2 ${yieldItem.name}`, '#44ff44');
      this.checkQuestProgress('gather', 'crop', 1);
      return true;
    }
    return false;
  }

  public triggerAttackOrInteract() {
    if (this.player.isAttacking || this.player.isRolling) return;

    // Check if in Building Mode
    if (this.isBuildingMode && this.selectedBuildingStructureId) {
      this.tryPlaceStructure();
      return;
    }

    const equipped = this.player.inventory[this.player.selectedHotbarIndex];

    // Check if consumable
    if (equipped && equipped.item.category === 'food') {
      this.consumeItem(this.player.selectedHotbarIndex);
      return;
    }

    // Check if building item
    if (equipped && equipped.item.placeableStructureId) {
      this.isBuildingMode = true;
      this.selectedBuildingStructureId = equipped.item.placeableStructureId;
      this.tryPlaceStructure();
      return;
    }

    // Melee attack or harvesting swing
    this.player.isAttacking = true;
    this.player.attackTimer = this.player.attackCooldown;
    this.player.swingProgress = 0;

    // Directional facing towards mouse
    const dx = this.mouseWorldX - this.player.x;
    const dy = this.mouseWorldY - this.player.y;
    if (Math.abs(dx) > Math.abs(dy)) {
      this.player.facing = dx > 0 ? 'right' : 'left';
    } else {
      this.player.facing = dy > 0 ? 'down' : 'up';
    }

    // Sound & Ranged Weapons
    if (equipped && (equipped.item.id === 'pistol' || equipped.item.id === 'rifle')) {
      this.shootFirearm(equipped.item.id as 'pistol' | 'rifle');
      return;
    } else if (equipped && equipped.item.id === 'bow') {
      this.shootBowArrow();
    } else {
      soundEngine.playSwing();
    }

    // Interact with nearby structures (e.g. Chest, Bed, Well, Door, Farm)
    this.checkStructureInteraction();

    // Check hits against resources or enemies
    this.checkHitBox();
  }

  private shootFirearm(gunId: 'pistol' | 'rifle') {
    const requiredAmmoId = gunId === 'pistol' ? 'pistol_ammo' : 'rifle_ammo';
    const ammoSlot = this.player.inventory.find(s => s && s.item.id === requiredAmmoId);

    if (!ammoSlot || ammoSlot.quantity <= 0) {
      soundEngine.playEmptyGun();
      const ammoName = gunId === 'pistol' ? 'Munição 9mm' : 'Cartucho .308';
      this.addFloatingText(this.player.x, this.player.y - 25, `Sem ${ammoName}!`, '#ef4444');
      return;
    }

    // Deduct 1 ammo
    ammoSlot.quantity--;
    if (ammoSlot.quantity <= 0) {
      const idx = this.player.inventory.indexOf(ammoSlot);
      this.player.inventory[idx] = null;
    }

    // Gunshot audio & recoil screenshake
    if (gunId === 'pistol') {
      soundEngine.playPistolShot();
      this.triggerShake(5, 0.18);
    } else {
      soundEngine.playRifleShot();
      this.triggerShake(9, 0.26);
    }

    const angle = Math.atan2(this.mouseWorldY - this.player.y, this.mouseWorldX - this.player.x);
    const speed = gunId === 'pistol' ? 820 : 1150;
    const damage = gunId === 'pistol' ? 48 : 95;

    // Spawn Muzzle Flash Spark Particles
    for (let k = 0; k < 6; k++) {
      const pAngle = angle + (Math.random() - 0.5) * 0.45;
      const pSpeed = 80 + Math.random() * 120;
      this.particles.push({
        x: this.player.x + Math.cos(angle) * 16,
        y: this.player.y + Math.sin(angle) * 16,
        vx: Math.cos(pAngle) * pSpeed,
        vy: Math.sin(pAngle) * pSpeed,
        life: 0.12,
        maxLife: 0.12,
        color: k % 2 === 0 ? '#fef08a' : '#f97316',
        size: 2.5,
        alpha: 1,
        type: 'spark',
      });
    }

    // Muzzle smoke puff
    this.particles.push({
      x: this.player.x + Math.cos(angle) * 18,
      y: this.player.y + Math.sin(angle) * 18,
      vx: Math.cos(angle) * 20,
      vy: Math.sin(angle) * 20,
      life: 0.35,
      maxLife: 0.35,
      color: '#94a3b8',
      size: 4.5,
      alpha: 0.6,
      type: 'smoke',
    });

    // Spawn ballistic projectile
    this.world.projectiles.push({
      id: `proj_bullet_${Date.now()}_${Math.random()}`,
      x: this.player.x + Math.cos(angle) * 14,
      y: this.player.y + Math.sin(angle) * 14,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      damage,
      isEnemy: false,
      lifespan: gunId === 'pistol' ? 1.0 : 1.4,
      projectileType: gunId === 'pistol' ? 'bullet_pistol' : 'bullet_rifle',
    });

    this.onStateChange?.();
  }

  private consumeItem(slotIndex: number) {
    const slot = this.player.inventory[slotIndex];
    if (!slot) return;
    const item = slot.item;

    if (item.hunger) this.player.stats.hunger = Math.min(this.player.stats.maxHunger, this.player.stats.hunger + item.hunger);
    if (item.thirst) this.player.stats.thirst = Math.min(this.player.stats.maxThirst, this.player.stats.thirst + item.thirst);
    if (item.energy) this.player.stats.energy = Math.min(this.player.stats.maxEnergy, this.player.stats.energy + item.energy);
    if (item.health) this.player.stats.hp = Math.min(this.player.stats.maxHp, this.player.stats.hp + item.health);
    if (item.temperatureEffect) this.player.stats.bodyTemp += item.temperatureEffect;

    soundEngine.playEat();
    this.addFloatingText(this.player.x, this.player.y - 20, `+${item.name}`, '#55ff55');

    slot.quantity--;
    if (slot.quantity <= 0) {
      this.player.inventory[slotIndex] = null;
    }
    this.onStateChange?.();
  }

  private shootBowArrow() {
    const arrowSlot = this.player.inventory.find(s => s && s.item.id === 'arrow');
    if (!arrowSlot || arrowSlot.quantity <= 0) {
      this.addFloatingText(this.player.x, this.player.y - 20, 'Sem flechas!', '#ff5555');
      return;
    }

    arrowSlot.quantity--;
    if (arrowSlot.quantity <= 0) {
      const idx = this.player.inventory.indexOf(arrowSlot);
      this.player.inventory[idx] = null;
    }

    soundEngine.playBowShot();
    const angle = Math.atan2(this.mouseWorldY - this.player.y, this.mouseWorldX - this.player.x);
    const speed = 400;

    this.world.projectiles.push({
      id: `proj_${Date.now()}_${Math.random()}`,
      x: this.player.x,
      y: this.player.y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      damage: 25,
      isEnemy: false,
      lifespan: 1.5,
    });
    this.onStateChange?.();
  }

  private checkStructureInteraction() {
    const interactRange = 75;
    for (const struct of this.world.structures) {
      const dist = Math.hypot(struct.x - this.player.x, struct.y - this.player.y);
      if (dist <= interactRange) {
        if (this.interactWithStructure(struct)) {
          return;
        }
      }
    }

    // Check if player is near any natural lake or river water tile to drink fresh water
    const pTileX = Math.floor(this.player.x / TILE_SIZE);
    const pTileY = Math.floor(this.player.y / TILE_SIZE);
    let nearNaturalWater = false;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const checkX = pTileX + dx;
        const checkY = pTileY + dy;
        if (checkX >= 0 && checkX < this.world.width && checkY >= 0 && checkY < this.world.height) {
          const tile = this.world.tiles[checkY * this.world.width + checkX];
          if (tile === TILE_TYPES.WATER || tile === TILE_TYPES.DEEP_WATER) {
            nearNaturalWater = true;
            break;
          }
        }
      }
      if (nearNaturalWater) break;
    }

    if (nearNaturalWater && this.player.stats.thirst < 98) {
      this.player.stats.thirst = Math.min(this.player.stats.maxThirst, this.player.stats.thirst + 35);
      soundEngine.playEat();
      this.addFloatingText(this.player.x, this.player.y - 20, 'Bebeu água fresca do rio! +35', '#38bdf8');
      this.onStateChange?.();
      return;
    }
  }

  public sleepInBed() {
    // Only sleep during dusk/night (19:00 - 05:00)
    const time = this.world.timeOfDay;
    if (time >= 19 * 60 || time < 5 * 60) {
      this.world.timeOfDay = 6 * 60; // 06:00 Dawn
      this.world.dayCount++;
      this.player.stats.sleep = 0;
      this.player.stats.hp = this.player.stats.maxHp;
      this.player.stats.energy = this.player.stats.maxEnergy;
      soundEngine.playLevelUp();
      this.addFloatingText(this.player.x, this.player.y - 30, 'Novo Dia! Descansado 100%', '#ffff55');
      this.onStateChange?.();
    } else {
      this.addFloatingText(this.player.x, this.player.y - 20, 'Você só pode dormir à noite!', '#ff8888');
    }
  }

  public drinkFromWell() {
    this.player.stats.thirst = this.player.stats.maxThirst;
    soundEngine.playEat();
    this.addFloatingText(this.player.x, this.player.y - 20, 'Sede saciada! 100%', '#44ccff');
    this.onStateChange?.();
  }

  public dismantleStructure(struct: StructureEntity) {
    const refundMap: Record<string, string> = {
      workbench: 'workbench_item',
      sawmill: 'sawmill_item',
      anvil: 'anvil_item',
      furnace: 'furnace_item',
      bed: 'bed_item',
      chest: 'chest_item',
      campfire: 'campfire_item',
      well: 'well_item',
      wood_wall: 'wood_wall_item',
      cabin_wall: 'wood_wall_item',
      stone_wall: 'stone_wall_item',
      wood_door: 'wood_door_item',
      fence: 'fence_item',
      scarecrow: 'scarecrow_item',
      floor_torch: 'torch',
      wall_torch: 'torch',
      pier: 'wood_plank',
      raft: 'raft',
      canoe: 'canoe',
      wood_boat: 'wood_boat',
    };

    const itemId = refundMap[struct.type];
    if (!itemId || !ITEMS[itemId]) {
      this.addFloatingText(struct.x, struct.y - 15, 'Não pode ser desmontado!', '#ff5555');
      return;
    }

    // Spill any items in chest so player does not lose loot
    if (struct.chestInventory) {
      for (const slot of struct.chestInventory) {
        if (slot) {
          this.spawnLoot(struct.x, struct.y, slot.item.id, slot.quantity);
        }
      }
    }

    // Remove structure from world
    const idx = this.world.structures.indexOf(struct);
    if (idx !== -1) {
      this.world.structures.splice(idx, 1);
    }

    // Return item to inventory or drop on ground
    const itemDef = ITEMS[itemId];
    const added = this.addItemToInventory(itemDef, 1);
    if (!added) {
      this.spawnLoot(struct.x, struct.y, itemId, 1);
    }

    soundEngine.playBuild();
    this.spawnBurst(struct.x, struct.y, '#f59e0b', 14);
    this.addFloatingText(struct.x, struct.y - 25, `Desmontado: +1 ${itemDef.name}`, '#4ade80');
    this.onStateChange?.();
  }

  public enterCave() {
    if (!this.caveWorld) {
      this.caveWorld = generateCaveWorld();
    }
    // Save overworld state & position
    this.overworldWorld = this.world;
    this.overworldPos = { x: this.player.x, y: this.player.y + 45 };

    // Transition into cavern
    this.world = this.caveWorld;
    this.player.isInsideCave = true;
    this.player.x = 30 * TILE_SIZE + TILE_SIZE / 2;
    this.player.y = 31 * TILE_SIZE + TILE_SIZE / 2;
    this.cameraX = this.player.x;
    this.cameraY = this.player.y;

    soundEngine.playLevelUp();
    this.triggerShake(5, 0.4);
    this.addFloatingText(this.player.x, this.player.y - 30, 'Entrou na Caverna Sombria...', '#67e8f9');
    this.onStateChange?.();
  }

  public exitCave() {
    if (this.overworldWorld) {
      this.world = this.overworldWorld;
    }
    this.player.isInsideCave = false;
    if (this.overworldPos) {
      this.player.x = this.overworldPos.x;
      this.player.y = this.overworldPos.y;
    }
    this.cameraX = this.player.x;
    this.cameraY = this.player.y;

    soundEngine.playLevelUp();
    this.triggerShake(3, 0.3);
    this.addFloatingText(this.player.x, this.player.y - 30, 'Retornou à Superfície!', '#facc15');
    this.onStateChange?.();
  }

  private checkHitBox() {
    const equipped = this.player.inventory[this.player.selectedHotbarIndex];
    let damage = equipped?.item.damage ?? 10;
    if (this.player.skills['skill_combat']) damage *= 1.25;

    const attackReach = 56;
    const attackX = this.player.x + (this.player.facing === 'right' ? 24 : this.player.facing === 'left' ? -24 : 0);
    const attackY = this.player.y + (this.player.facing === 'down' ? 24 : this.player.facing === 'up' ? -24 : 0);

    // 1. Check Enemies
    for (const enemy of this.world.enemies) {
      if (enemy.hp <= 0) continue;
      const dist = Math.hypot(enemy.x - attackX, enemy.y - attackY);
      if (dist <= attackReach) {
        enemy.hp -= damage;
        enemy.hitFlash = 0.15;
        this.hitstopTimer = 0.05;
        this.shakeDuration = 0.2;
        this.shakeMagnitude = 4;
        soundEngine.playHit();
        soundEngine.playMonsterHurt();

        // Blood particles
        this.spawnBurst(enemy.x, enemy.y, '#cc2222', 8);
        this.addFloatingText(enemy.x, enemy.y - 20, `-${damage}`, '#ff4444');

        if (enemy.hp <= 0) {
          this.handleEnemyDeath(enemy);
        }
        return;
      }
    }

    // 2. Check Animals
    for (const animal of this.world.animals) {
      if (animal.hp <= 0) continue;
      const dist = Math.hypot(animal.x - attackX, animal.y - attackY);
      if (dist <= attackReach) {
        animal.hp -= damage;
        animal.hitFlash = 0.15;
        soundEngine.playHit();
        this.spawnBurst(animal.x, animal.y, '#cc2222', 6);
        this.addFloatingText(animal.x, animal.y - 20, `-${damage}`, '#ff4444');

        if (animal.hp <= 0) {
          soundEngine.playMonsterHurt();
          if (animal.type === 'chicken') {
            this.spawnLoot(animal.x, animal.y, 'feather', 2);
            this.spawnLoot(animal.x, animal.y, 'raw_meat', 1);
          } else if (animal.type === 'rabbit') {
            this.spawnLoot(animal.x, animal.y, 'animal_pelt', 1);
            this.spawnLoot(animal.x, animal.y, 'raw_meat', 1);
          } else if (animal.type === 'pig') {
            this.spawnLoot(animal.x, animal.y, 'raw_meat', 2);
            this.spawnLoot(animal.x, animal.y, 'animal_pelt', 1);
          } else if (animal.type === 'deer') {
            this.spawnLoot(animal.x, animal.y, 'animal_pelt', 2);
            this.spawnLoot(animal.x, animal.y, 'raw_meat', 2);
            this.spawnLoot(animal.x, animal.y, 'bone', 2);
          } else if (animal.type === 'fox') {
            this.spawnLoot(animal.x, animal.y, 'animal_pelt', 2);
          } else if (animal.type === 'cow') {
            this.spawnLoot(animal.x, animal.y, 'raw_meat', 3);
            this.spawnLoot(animal.x, animal.y, 'leather', 2);
          } else {
            this.spawnLoot(animal.x, animal.y, 'raw_meat', 2);
            this.spawnLoot(animal.x, animal.y, 'leather', 1);
          }
          const idx = this.world.animals.indexOf(animal);
          this.world.animals.splice(idx, 1);
        }
        return;
      }
    }

    // 3. Check Resources (Trees, Rocks, Ores, Loose items, Bushes)
    for (const res of this.world.resources) {
      if (res.hp <= 0) continue;
      // Fast AABB bounding box check to eliminate distance math for off-target resources
      if (Math.abs(res.x - attackX) > attackReach || Math.abs(res.y - attackY) > attackReach) continue;

      const dist = Math.hypot(res.x - attackX, res.y - attackY);
      if (dist <= attackReach) {
        // Instant manual pickup for loose branches, stones, clay, and sand
        if (res.type === 'loose_branch' || res.type === 'loose_stone' || res.type === 'clay_deposit' || res.type === 'sand_pile') {
          const yieldCount = Math.floor(res.yieldMin + Math.random() * (res.yieldMax - res.yieldMin + 1));
          const targetItem = ITEMS[res.resourceId];
          const added = this.addItemToInventory(targetItem, yieldCount);
          if (!added) {
            this.spawnLoot(res.x, res.y, res.resourceId, yieldCount);
          }
          soundEngine.playPickup();
          const burstCol = res.type === 'loose_branch' ? '#8f5d34' : res.type === 'clay_deposit' ? '#c2623b' : res.type === 'sand_pile' ? '#f4d06f' : '#9ca3af';
          this.spawnBurst(res.x, res.y, burstCol, 5);
          this.addFloatingText(res.x, res.y - 15, `+${yieldCount} ${targetItem?.name || res.resourceId}`, '#fbbf24');
          this.checkQuestProgress('gather', res.resourceId, yieldCount);

          const idx = this.world.resources.indexOf(res);
          if (idx !== -1) {
            this.world.resources.splice(idx, 1);
          }
          return;
        }

        let isToolMatch = false;
        if (res.type.includes('tree') && equipped?.item.toolType === 'axe') {
          isToolMatch = true;
          damage = (equipped.item.damage || 20) * 1.5;
        } else if ((res.type.includes('rock') || res.type.includes('ore')) && equipped?.item.toolType === 'pickaxe') {
          isToolMatch = true;
          damage = (equipped.item.damage || 20) * 1.5;
        } else if ((res.type.includes('clay') || res.type.includes('sand')) && equipped?.item.toolType === 'shovel') {
          isToolMatch = true;
          damage = 35;
        } else if (!equipped) {
          // Punching with bare hands (Sobrevivência do Zero)
          if (res.type.includes('tree')) {
            damage = 8; // Punch trees to harvest wood and branches!
          } else if (res.type.includes('bush') || res.type.includes('plant')) {
            damage = 15; // Easily pluck berries and medicinal herbs by hand
          } else {
            damage = 3; // Bare hands against rocks
            this.addFloatingText(this.player.x, this.player.y - 20, 'Precisa de Picareta!', '#f87171');
          }
        }

        res.hp -= damage;
        res.hitFlash = 0.1;
        this.shakeDuration = 0.1;
        this.shakeMagnitude = 2;

        if (res.type.includes('tree')) {
          soundEngine.playChop();
          this.spawnBurst(res.x, res.y, '#8f5d34', 5);
        } else if (res.type.includes('bush') || res.type.includes('plant')) {
          soundEngine.playPickup();
          this.spawnBurst(res.x, res.y, '#22c55e', 4);
        } else {
          soundEngine.playMine();
          this.spawnBurst(res.x, res.y, '#7a7a85', 5);
        }

        if (res.hp <= 0) {
          const yieldCount = Math.floor(res.yieldMin + Math.random() * (res.yieldMax - res.yieldMin + 1));
          this.spawnLoot(res.x, res.y, res.resourceId, yieldCount);
          if (res.secondaryResourceId && res.secondaryYield) {
            this.spawnLoot(res.x, res.y, res.secondaryResourceId, res.secondaryYield);
          }
          if (res.type === 'pine_tree') {
            this.spawnLoot(res.x, res.y, 'resin', 1);
          }
          this.gainPlayerXp(15);
          this.checkQuestProgress('gather', res.resourceId, yieldCount);
          const targetItem = ITEMS[res.resourceId];
          this.addFloatingText(res.x, res.y - 20, `+${yieldCount} ${targetItem?.name || 'Madeira'}`, '#4ade80');

          const idx = this.world.resources.indexOf(res);
          if (idx !== -1) {
            this.world.resources.splice(idx, 1);
          }
        }
        return;
      }
    }
  }

  private handleEnemyDeath(enemy: EnemyEntity) {
    enemy.state = 'dead';
    this.gainPlayerXp(enemy.type === 'boss_spectre' ? 250 : 40);
    this.checkQuestProgress('kill', 'enemy', 1);

    if (enemy.type === 'wolf') {
      this.spawnLoot(enemy.x, enemy.y, 'raw_meat', 2);
      this.spawnLoot(enemy.x, enemy.y, 'leather', 2);
    } else if (enemy.type === 'zombie') {
      this.spawnLoot(enemy.x, enemy.y, 'cloth', 1);
      this.spawnLoot(enemy.x, enemy.y, 'iron_ore', 1);
    } else if (enemy.type === 'skeleton') {
      this.spawnLoot(enemy.x, enemy.y, 'bone', 2);
      this.spawnLoot(enemy.x, enemy.y, 'arrow', 4);
    } else if (enemy.type === 'boss_spectre') {
      this.spawnLoot(enemy.x, enemy.y, 'gold_ore', 5);
      this.spawnLoot(enemy.x, enemy.y, 'iron_sword', 1);
    } else if (enemy.type === 'scorpion') {
      this.spawnLoot(enemy.x, enemy.y, 'scorpion_stinger', Math.random() < 0.6 ? 2 : 1);
      this.spawnLoot(enemy.x, enemy.y, 'stone', 2);
    } else if (enemy.type === 'mummy') {
      this.spawnLoot(enemy.x, enemy.y, 'ancient_cloth', 3);
      this.spawnLoot(enemy.x, enemy.y, 'bandage', 2);
      if (Math.random() < 0.45) this.spawnLoot(enemy.x, enemy.y, 'pistol_ammo', 6);
      if (Math.random() < 0.35) this.spawnLoot(enemy.x, enemy.y, 'gold_ore', 2);
    } else if (enemy.type === 'desert_snake') {
      this.spawnLoot(enemy.x, enemy.y, 'snake_venom', 2);
      this.spawnLoot(enemy.x, enemy.y, 'raw_meat', 1);
    }

    const idx = this.world.enemies.indexOf(enemy);
    if (idx !== -1) {
      this.world.enemies.splice(idx, 1);
    }
  }

  public gainPlayerXp(amount: number) {
    this.player.stats.xp += amount;
    const reqXp = this.player.stats.level * 100;
    if (this.player.stats.xp >= reqXp) {
      this.player.stats.xp -= reqXp;
      this.player.stats.level++;
      this.player.stats.skillPoints++;
      this.player.stats.maxHp += 10;
      this.player.stats.hp = this.player.stats.maxHp;
      soundEngine.playLevelUp();
      this.spawnBurst(this.player.x, this.player.y, '#ffdd44', 20);
      this.addFloatingText(this.player.x, this.player.y - 30, `NÍVEL ${this.player.stats.level}!`, '#ffff44');
    }
    this.onStateChange?.();
  }

  public checkQuestProgress(type: Quest['type'], key: string, count: number) {
    for (const q of this.quests) {
      if (q.completed) continue;
      if (q.type === type && (q.targetKey === key || q.targetKey === 'tool' || q.targetKey === 'enemy' || q.targetKey === 'shelter')) {
        q.currentCount = Math.min(q.targetCount, q.currentCount + count);
        if (q.currentCount >= q.targetCount) {
          q.completed = true;
          this.gainPlayerXp(q.rewardXp);
          for (const rew of q.rewardItems) {
            this.addItemToInventory(ITEMS[rew.itemId], rew.quantity);
          }
          soundEngine.playLevelUp();
          this.addFloatingText(this.player.x, this.player.y - 40, `Missão Concluída: ${q.title}!`, '#44ff44');
        }
      }
    }
    this.onStateChange?.();
  }

  public spawnLoot(x: number, y: number, itemId: string, quantity: number) {
    this.world.lootDrops.push({
      id: `loot_${Date.now()}_${Math.random()}`,
      itemId,
      quantity,
      x: x + (Math.random() - 0.5) * 16,
      y: y + (Math.random() - 0.5) * 16,
      vx: (Math.random() - 0.5) * 40,
      vy: (Math.random() - 0.5) * 40,
      lifespan: 120, // 2 minutes
    });
  }

  public addItemToInventory(item: typeof ITEMS[string], quantity: number): boolean {
    if (!item) return false;
    // 1. Try stacking into existing slot
    if (item.stackable) {
      for (const slot of this.player.inventory) {
        if (slot && slot.item.id === item.id && slot.quantity < item.maxStack) {
          const space = item.maxStack - slot.quantity;
          const add = Math.min(space, quantity);
          slot.quantity += add;
          quantity -= add;
          if (quantity <= 0) {
            this.onStateChange?.();
            return true;
          }
        }
      }
    }

    // 2. Find empty slot
    for (let i = 0; i < this.player.inventory.length; i++) {
      if (!this.player.inventory[i]) {
        this.player.inventory[i] = { item, quantity };
        this.onStateChange?.();
        return true;
      }
    }
    return false;
  }

  public getNearbyStations(): string[] {
    const stations: Set<string> = new Set(['none']);
    const range = 150;
    for (const s of this.world.structures) {
      const dist = Math.hypot(s.x - this.player.x, s.y - this.player.y);
      if (dist <= range) {
        const sType = s.type as string;
        if (sType === 'workbench' || sType === 'workbench_item') stations.add('workbench');
        if (sType === 'weapon_workbench' || sType === 'weapon_workbench_item') stations.add('weapon_workbench');
        if (sType === 'sawmill' || sType === 'sawmill_item') stations.add('sawmill');
        if (sType === 'furnace' || sType === 'furnace_item') stations.add('furnace');
        if (sType === 'anvil' || sType === 'anvil_item') stations.add('anvil');
        if ((sType === 'campfire' || sType === 'campfire_item') && s.lit) stations.add('campfire');
      }
    }
    return Array.from(stations);
  }

  public tryPlaceStructure() {
    if (!this.selectedBuildingStructureId) return;

    // Normalize structure type string (e.g. workbench_item -> workbench, campfire_item -> campfire)
    let rawType = this.selectedBuildingStructureId;
    if (rawType.endsWith('_item')) {
      rawType = rawType.replace('_item', '');
    }
    const finalStructureType = rawType as StructureEntity['type'];

    // 1. Clamp placement position to be close to the player (max 96px reach)
    const MAX_BUILD_REACH = 96;
    let targetX = this.mouseWorldX;
    let targetY = this.mouseWorldY;
    const distFromPlayer = Math.hypot(targetX - this.player.x, targetY - this.player.y);

    if (distFromPlayer > MAX_BUILD_REACH || (targetX === 0 && targetY === 0)) {
      let forwardX = 0;
      let forwardY = 0;
      if (this.player.facing === 'down') forwardY = 48;
      else if (this.player.facing === 'up') forwardY = -48;
      else if (this.player.facing === 'left') forwardX = -48;
      else if (this.player.facing === 'right') forwardX = 48;

      if (distFromPlayer > MAX_BUILD_REACH && (targetX !== 0 || targetY !== 0)) {
        const angle = Math.atan2(targetY - this.player.y, targetX - this.player.x);
        targetX = this.player.x + Math.cos(angle) * MAX_BUILD_REACH;
        targetY = this.player.y + Math.sin(angle) * MAX_BUILD_REACH;
      } else {
        targetX = this.player.x + forwardX;
        targetY = this.player.y + forwardY;
      }
    }

    const tileX = Math.floor(targetX / TILE_SIZE);
    const tileY = Math.floor(targetY / TILE_SIZE);

    // Validate bounds
    if (tileX < 2 || tileX >= this.world.width - 2 || tileY < 2 || tileY >= this.world.height - 2) return;

    const isWatercraft = finalStructureType === 'raft' || 
                         finalStructureType === 'canoe' || 
                         finalStructureType === 'wood_boat' || 
                         finalStructureType === 'pier';

    // Check if tile is water
    const tileType = this.world.tiles[tileY * this.world.width + tileX];
    const isWaterTile = tileType === TILE_TYPES.WATER || tileType === TILE_TYPES.DEEP_WATER;

    if (isWatercraft && !isWaterTile) {
      this.addFloatingText(targetX, targetY, 'Embarcação deve ser colocada na água!', '#38bdf8');
      return;
    }
    if (!isWatercraft && isWaterTile) {
      this.addFloatingText(targetX, targetY, 'Não pode construir na água!', '#ff5555');
      return;
    }

    // Check if another structure occupies this tile
    const exists = this.world.structures.some(s => s.tileX === tileX && s.tileY === tileY);
    if (exists) {
      this.addFloatingText(targetX, targetY, 'Espaço ocupado!', '#ff5555');
      return;
    }

    // Check and consume 1 matching item from hotbar or inventory
    let itemFound = false;
    let shouldExitBuildingMode = false;
    const hotbarSlot = this.player.inventory[this.player.selectedHotbarIndex];

    if (hotbarSlot && (
      hotbarSlot.item.placeableStructureId === this.selectedBuildingStructureId || 
      hotbarSlot.item.placeableStructureId === finalStructureType ||
      hotbarSlot.item.id === this.selectedBuildingStructureId ||
      hotbarSlot.item.id.includes(rawType)
    )) {
      itemFound = true;
      hotbarSlot.quantity--;
      if (hotbarSlot.quantity <= 0) {
        this.player.inventory[this.player.selectedHotbarIndex] = null;
        shouldExitBuildingMode = true;
      }
    } else {
      for (let i = 0; i < this.player.inventory.length; i++) {
        const slot = this.player.inventory[i];
        if (slot && (
          slot.item.placeableStructureId === this.selectedBuildingStructureId || 
          slot.item.placeableStructureId === finalStructureType ||
          slot.item.id === this.selectedBuildingStructureId ||
          slot.item.id.includes(rawType)
        )) {
          itemFound = true;
          slot.quantity--;
          if (slot.quantity <= 0) {
            this.player.inventory[i] = null;
            shouldExitBuildingMode = true;
          }
          break;
        }
      }
    }

    if (!itemFound) {
      this.addFloatingText(targetX, targetY, 'Item não está no inventário!', '#ff5555');
      this.cancelBuildingMode();
      return;
    }

    // Remove any ground forage / loose item on that tile so it doesn't obstruct or clip
    this.world.resources = this.world.resources.filter(r => {
      const rx = Math.floor(r.x / TILE_SIZE);
      const ry = Math.floor(r.y / TILE_SIZE);
      return rx !== tileX || ry !== tileY;
    });

    const placedX = tileX * TILE_SIZE + TILE_SIZE / 2;
    const placedY = tileY * TILE_SIZE + TILE_SIZE / 2;

    soundEngine.playBuild();
    this.world.structures.push({
      id: `struct_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type: finalStructureType,
      tileX,
      tileY,
      x: placedX,
      y: placedY,
      width: TILE_SIZE,
      height: TILE_SIZE,
      hp: 150,
      maxHp: 150,
      lit: true,
      chestInventory: finalStructureType === 'chest' ? new Array(16).fill(null) : undefined,
    });

    // Visual feedback
    this.spawnBurst(placedX, placedY, '#4ade80', 10);
    const structName = finalStructureType === 'workbench' ? 'Bancada' : finalStructureType === 'campfire' ? 'Fogueira' : 'Estrutura';
    this.addFloatingText(placedX, placedY - 24, `${structName} Posicionada!`, '#4ade80');

    if (finalStructureType === 'bed') {
      this.player.spawnPoint = { x: placedX, y: placedY };
      this.addFloatingText(this.player.x, this.player.y - 25, 'Ponto de Renascimento Definido!', '#38bdf8');
    }

    this.checkQuestProgress('build', finalStructureType, 1);

    if (shouldExitBuildingMode) {
      this.cancelBuildingMode();
    }
    this.onStateChange?.();
  }

  public cancelBuildingMode() {
    this.isBuildingMode = false;
    this.selectedBuildingStructureId = null;
    this.onStateChange?.();
  }

  public triggerShake(magnitude: number, duration: number) {
    this.shakeMagnitude = magnitude;
    this.shakeDuration = duration;
  }

  public spawnBurst(x: number, y: number, color: string, count: number = 10) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 20 + Math.random() * 80;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.4 + Math.random() * 0.3,
        maxLife: 0.7,
        color,
        size: 3 + Math.random() * 3,
        alpha: 1,
        type: 'pixel',
      });
    }
  }

  public addFloatingText(x: number, y: number, text: string, color: string = '#ffffff') {
    this.particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 10,
      vy: -35,
      life: 0.9,
      maxLife: 0.9,
      color,
      size: 13,
      alpha: 1,
      type: 'text',
      text,
    });
  }

  // --- Main Simulation Loop ---
  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    soundEngine.startAmbientMusic();
    this.loop(this.lastTime);
  }

  public stop() {
    this.isRunning = false;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    soundEngine.stopAmbientMusic();
  }

  private loop = (timestamp: number) => {
    if (!this.isRunning) return;
    const rawDt = (timestamp - this.lastTime) / 1000;
    this.lastTime = timestamp;
    const dt = Math.min(rawDt, 0.05); // Clamped dt

    this.gameTimeMs = timestamp;

    if (this.hitstopTimer > 0) {
      this.hitstopTimer -= dt;
    } else {
      this.update(dt);
    }

    this.render();

    this.animFrameId = requestAnimationFrame(this.loop);
  };

  private update(dt: number) {
    this.updateMouseWorldPos();

    // 1. Player Movement & Input
    let moveX = 0;
    let moveY = 0;

    if (this.keys.has('KeyW') || this.keys.has('ArrowUp')) moveY -= 1;
    if (this.keys.has('KeyS') || this.keys.has('ArrowDown')) moveY += 1;
    if (this.keys.has('KeyA') || this.keys.has('ArrowLeft')) moveX -= 1;
    if (this.keys.has('KeyD') || this.keys.has('ArrowRight')) moveX += 1;

    // Merge virtual joystick
    if (Math.abs(this.joystickVector.x) > 0.1 || Math.abs(this.joystickVector.y) > 0.1) {
      moveX = this.joystickVector.x;
      moveY = this.joystickVector.y;
    }

    // Check if player is on water
    const pTileX = Math.floor(this.player.x / TILE_SIZE);
    const pTileY = Math.floor(this.player.y / TILE_SIZE);
    const pTile = (pTileX >= 0 && pTileX < this.world.width && pTileY >= 0 && pTileY < this.world.height)
      ? this.world.tiles[pTileY * this.world.width + pTileX]
      : TILE_TYPES.GRASS;
    const isOnWater = pTile === TILE_TYPES.WATER || pTile === TILE_TYPES.DEEP_WATER;

    if (this.player.isBoating) {
      this.player.isSwimming = false;
      if (!isOnWater) {
        this.player.isBoating = false;
        this.player.boatType = null;
        this.addFloatingText(this.player.x, this.player.y - 15, 'Desembarcou na margem', '#ffffff');
      }
    } else {
      this.player.isSwimming = isOnWater;
    }

    const isSprinting = (this.keys.has('ShiftLeft') || this.keys.has('ShiftRight') || this.isTouchSprint) && this.player.stats.energy > 5;
    let baseSpeed = 105;
    if (this.player.equipment.boots) {
      const bootsDef = ITEMS[this.player.equipment.boots.item.id];
      if (bootsDef?.speedBonus) {
        baseSpeed += bootsDef.speedBonus;
      }
    }
    let speed = calculateMovementSpeed(baseSpeed, this.player.isSwimming, this.player.isBoating, isSprinting);
    if (this.player.skills['skill_speed']) speed *= 1.2;

    const len = Math.hypot(moveX, moveY);
    if (len > 0) {
      moveX /= len;
      moveY /= len;
      this.player.isMoving = true;
      if (!this.player.isAttacking) {
        if (Math.abs(moveX) > Math.abs(moveY)) {
          this.player.facing = moveX > 0 ? 'right' : 'left';
        } else {
          this.player.facing = moveY > 0 ? 'down' : 'up';
        }
      }

      // Realistic footstep sound with surface acoustic detection!
      if (Math.random() < dt * 3.5) {
        const surf = isOnWater ? 'water' : (pTile === TILE_TYPES.STONE_GROUND || pTile === TILE_TYPES.RUINS_FLOOR) ? 'stone' : 'grass';
        soundEngine.playFootstep(surf);
      }
    } else {
      this.player.isMoving = false;
    }

    // Potential new positions with collision checking
    const newX = this.player.x + moveX * speed * dt;
    const newY = this.player.y + moveY * speed * dt;

    if (!this.checkPlayerCollision(newX, this.player.y)) {
      this.player.x = Math.max(TILE_SIZE, Math.min(WORLD_PIXEL_WIDTH - TILE_SIZE, newX));
    }
    if (!this.checkPlayerCollision(this.player.x, newY)) {
      this.player.y = Math.max(TILE_SIZE, Math.min(WORLD_PIXEL_HEIGHT - TILE_SIZE, newY));
    }

    // Attack timer & swing curve
    if (this.player.isAttacking) {
      this.player.attackTimer -= dt;
      this.player.swingProgress = 1 - Math.max(0, this.player.attackTimer / this.player.attackCooldown);
      if (this.player.attackTimer <= 0) {
        this.player.isAttacking = false;
      }
    }

    // Hit flash & Invulnerability decay
    if (this.player.hitFlash > 0) {
      this.player.hitFlash -= dt;
    }
    if (this.invulnerabilityTimer > 0) {
      this.invulnerabilityTimer -= dt;
    }

    // 2. Camera tracking
    this.cameraX += (this.player.x - this.cameraX) * 0.1;
    this.cameraY += (this.player.y - this.cameraY) * 0.1;

    // 3. Screen shake decay
    if (this.shakeDuration > 0) {
      this.shakeDuration -= dt;
      if (this.shakeDuration <= 0) this.shakeMagnitude = 0;
    }

    // 4. Survival stats update
    const isNight = this.world.timeOfDay >= 19 * 60 || this.world.timeOfDay < 5 * 60;
    const nearCampfire = this.world.structures.some(s => s.type === 'campfire' && s.lit && Math.hypot(s.x - this.player.x, s.y - this.player.y) < 160);
    const nearTorch = this.world.structures.some(s => (s.type === 'floor_torch' || s.type === 'wall_torch') && Math.hypot(s.x - this.player.x, s.y - this.player.y) < 90);

    const curTileX = Math.floor(this.player.x / TILE_SIZE);
    const curTileY = Math.floor(this.player.y / TILE_SIZE);
    const curTile = (curTileX >= 0 && curTileX < this.world.width && curTileY >= 0 && curTileY < this.world.height)
      ? this.world.tiles[curTileY * this.world.width + curTileX]
      : TILE_TYPES.GRASS;
    let currentBiome: BiomeType = 'forest';
    if (curTile === TILE_TYPES.SNOW_GROUND) currentBiome = 'snow';
    else if (curTile === TILE_TYPES.SAND) currentBiome = 'desert';
    else if (curTile === TILE_TYPES.STONE_GROUND) currentBiome = 'mountain';
    else if (curTile === TILE_TYPES.RUINS_FLOOR) currentBiome = 'ruins';

    const targetTemp = calculateTargetTemperature({
      isNight,
      isRaining: this.world.weather === 'rain' || this.world.weather === 'thunderstorm',
      biome: currentBiome,
      nearCampfire,
      nearTorch,
      insideCabin: false,
      equippedArmorDefense: (this.player.equipment.armor?.item.defense ?? 0) + (this.player.equipment.boots?.item.defense ?? 0),
      isSnowing: this.world.weather === 'snow',
      isBlizzard: this.world.weather === 'blizzard',
      isHeatwave: this.world.weather === 'heatwave',
    });

    this.player.stats.bodyTemp += (targetTemp - this.player.stats.bodyTemp) * 0.05 * dt;

    this.player.stats = updateSurvivalStats(this.player.stats, dt, {
      isSprinting: this.player.isMoving && isSprinting,
      isResting: !this.player.isMoving,
      hasMetabolismSkill: !!this.player.skills['skill_metabolism'],
      currentTemperature: this.player.stats.bodyTemp,
    });

    // Swimming breath & drowning simulation
    const breathResult = updateSwimmingBreath(
      this.player.stats,
      dt,
      this.player.isSwimming,
      this.player.isBoating
    );
    this.player.stats.breath = breathResult.breath;
    if (breathResult.drowningDamage > 0) {
      this.damagePlayer(breathResult.drowningDamage);
      this.addFloatingText(this.player.x, this.player.y - 25, 'Afogando!', '#38bdf8');
    }

    // Periodic survival warnings if health/stats are in danger so player is never taken by surprise
    this.survivalWarningTimer += dt;
    if (this.survivalWarningTimer >= 5.0) {
      this.survivalWarningTimer = 0;
      if (this.player.stats.thirst <= 0) {
        this.addFloatingText(this.player.x, this.player.y - 30, '⚠️ SEDE CRÍTICA! Beba no rio ou poço!', '#38bdf8');
        soundEngine.playPlayerHurt();
      } else if (this.player.stats.hunger <= 0) {
        this.addFloatingText(this.player.x, this.player.y - 30, '⚠️ FOME EXTREMA! Coma frutas ou carne!', '#f97316');
        soundEngine.playPlayerHurt();
      } else if (this.player.stats.bodyTemp < 22.0) {
        this.addFloatingText(this.player.x, this.player.y - 30, '⚠️ CONGELANDO! Aproxime-se de fogueira!', '#67e8f9');
        soundEngine.playPlayerHurt();
      } else if (this.player.stats.bodyTemp > 42.5) {
        this.addFloatingText(this.player.x, this.player.y - 30, '⚠️ CALOR ESCALDANTE! Busque sombra!', '#fb923c');
      }
    }

    if (this.player.stats.hp <= 0) {
      this.handlePlayerDeath();
      this.onGameOver?.();
    }

    // 5. Day & Night clock progression (24 hours in ~10 minutes)
    this.world.timeOfDay = (this.world.timeOfDay + dt * 2.5) % 1440;

    // Synchronize realistic day/night music and soundscapes
    soundEngine.setNightMode(isNight);

    // 6. Weather updates & Natural Disasters
    this.world.weatherTimer -= dt;
    if (this.world.weatherTimer <= 0) {
      this.world.weatherTimer = 180 + Math.random() * 120;
      const weathers: WorldState['weather'][] = [
        'sunny', 'sunny', 'cloudy', 'rain', 'thunderstorm', 'snow', 'blizzard', 'heatwave', 'earthquake'
      ];
      const nextWeather = weathers[Math.floor(Math.random() * weathers.length)];
      this.world.weather = nextWeather;

      if (nextWeather === 'blizzard') {
        this.world.disasterType = 'blizzard';
        this.world.disasterTimer = 75;
        this.world.disasterWarning = 'ALERTA: Nevasca Violenta se aproxima!';
        this.addFloatingText(this.player.x, this.player.y - 30, 'ALERTA DE NEVASCA!', '#67e8f9');
      } else if (nextWeather === 'heatwave') {
        this.world.disasterType = 'heatwave';
        this.world.disasterTimer = 75;
        this.world.disasterWarning = 'ALERTA: Onda de Calor Escaldante! Beba água!';
        this.addFloatingText(this.player.x, this.player.y - 30, 'ONDA DE CALOR EXTREMA!', '#f97316');
      } else if (nextWeather === 'earthquake') {
        this.world.disasterType = 'earthquake';
        this.world.disasterTimer = 45;
        this.world.disasterWarning = 'ALERTA: Terremoto! O solo está tremendo!';
        this.addFloatingText(this.player.x, this.player.y - 30, 'TERREMOTO!', '#eab308');
        this.triggerShake(12, 3);
      } else {
        this.world.disasterType = 'none';
        this.world.disasterTimer = 0;
        this.world.disasterWarning = '';
      }
    }

    if (this.world.weather === 'snow' || this.world.weather === 'blizzard' || currentBiome === 'snow') {
      this.world.snowIntensity = Math.min(1, this.world.snowIntensity + dt * 0.4);
    } else {
      this.world.snowIntensity = Math.max(0, this.world.snowIntensity - dt * 0.4);
    }

    if (this.world.disasterType === 'earthquake' && Math.random() < dt * 0.4) {
      this.triggerShake(7, 0.6);
      soundEngine.playThunder();
    }

    if (this.world.weather === 'rain' || this.world.weather === 'thunderstorm') {
      this.world.rainIntensity = Math.min(1, this.world.rainIntensity + dt * 0.5);
      if (this.world.weather === 'thunderstorm' && Math.random() < dt * 0.08) {
        soundEngine.playThunder();
        this.world.lightningTimer = 0.15;
      }
    } else {
      this.world.rainIntensity = Math.max(0, this.world.rainIntensity - dt * 0.5);
    }
    if (this.world.lightningTimer > 0) {
      this.world.lightningTimer -= dt;
    }

    // Synchronize rain intensity audio
    soundEngine.setRainIntensity(this.world.rainIntensity);

    // Synchronize ocean wave audio (throttled to 3Hz to eliminate frame drops)
    this.oceanAudioTimer += dt;
    if (this.oceanAudioTimer >= 0.35) {
      this.oceanAudioTimer = 0;
      if (this.player.isInsideCave) {
        soundEngine.updateOceanWaves(9999);
      } else {
        const pTileX = Math.floor(this.player.x / TILE_SIZE);
        const pTileY = Math.floor(this.player.y / TILE_SIZE);
        let closestWaterDistSq = 99999999;
        const searchRadius = 14;
        for (let dy = -searchRadius; dy <= searchRadius; dy += 2) {
          for (let dx = -searchRadius; dx <= searchRadius; dx += 2) {
            const cx = pTileX + dx;
            const cy = pTileY + dy;
            if (cx >= 0 && cx < this.world.width && cy >= 0 && cy < this.world.height) {
              const t = this.world.tiles[cy * this.world.width + cx];
              if (t === TILE_TYPES.DEEP_WATER || t === TILE_TYPES.WATER) {
                const dSq = (dx * TILE_SIZE) * (dx * TILE_SIZE) + (dy * TILE_SIZE) * (dy * TILE_SIZE);
                if (dSq < closestWaterDistSq) {
                  closestWaterDistSq = dSq;
                }
              }
            }
          }
        }
        soundEngine.updateOceanWaves(Math.sqrt(closestWaterDistSq));
      }
    }

    // 7. Update Enemies (AI & Daytime Undead Burning)
    const isDayTime = this.world.timeOfDay >= 6 * 60 && this.world.timeOfDay < 18 * 60;
    const SIM_RADIUS = 750;
    for (const enemy of this.world.enemies) {
      if (enemy.hp <= 0) continue;
      if (enemy.hitFlash > 0) enemy.hitFlash -= dt;

      // Skip heavy AI and shade checks for enemies far offscreen
      if (Math.abs(enemy.x - this.player.x) > SIM_RADIUS || Math.abs(enemy.y - this.player.y) > SIM_RADIUS) {
        continue;
      }

      // Undead burning in direct sunlight unless under canopy shade
      if (isDayTime && (enemy.type === 'zombie' || enemy.type === 'skeleton')) {
        let inShade = false;
        for (const res of this.world.resources) {
          if (res.hp <= 0) continue;
          if (Math.abs(res.x - enemy.x) > 46 || Math.abs(res.y - enemy.y) > 46) continue;
          if (
            res.type === 'tree' || 
            res.type === 'oak_tree' || 
            res.type === 'pine_tree' || 
            res.type === 'birch_tree' || 
            res.type === 'snowy_pine' || 
            res.type === 'willow_tree' ||
            res.type === 'acacia_tree'
          ) {
            if (Math.hypot(res.x - enemy.x, res.y - enemy.y) < 46) {
              inShade = true;
              break;
            }
          }
        }
        if (!inShade) {
          enemy.onFire = true;
          enemy.hp -= 9 * dt;
          if (Math.random() < dt * 3) {
            this.particles.push({
              x: enemy.x + (Math.random() - 0.5) * 12,
              y: enemy.y - 12 + (Math.random() - 0.5) * 8,
              vx: (Math.random() - 0.5) * 15,
              vy: -25 - Math.random() * 20,
              color: Math.random() < 0.5 ? '#f97316' : '#facc15',
              size: 3,
              alpha: 1,
              life: 0.5,
              maxLife: 0.5,
              type: 'ember',
            });
          }
          if (enemy.hp <= 0) {
            this.handleEnemyDeath(enemy);
            continue;
          }
        } else {
          enemy.onFire = false;
        }
      } else {
        enemy.onFire = false;
      }

      const distToPlayer = Math.hypot(this.player.x - enemy.x, this.player.y - enemy.y);

      // Aggro check
      if (distToPlayer <= enemy.aggroRange) {
        enemy.state = 'chase';
        const angle = Math.atan2(this.player.y - enemy.y, this.player.x - enemy.x);
        enemy.vx = Math.cos(angle) * enemy.speed;
        enemy.vy = Math.sin(angle) * enemy.speed;
        enemy.facing = enemy.vx > 0 ? 'right' : 'left';

        // Attack telegraph & strike
        if (distToPlayer <= enemy.attackRange) {
          enemy.attackTimer -= dt;
          if (enemy.attackTimer <= 0) {
            enemy.telegraphTimer = 0.3;
            enemy.attackTimer = enemy.attackCooldown;
          }
          if (enemy.telegraphTimer > 0) {
            enemy.telegraphTimer -= dt;
            if (enemy.telegraphTimer <= 0) {
              // Deal damage to player
              this.damagePlayer(enemy.damage);
            }
          }
        }
      } else {
        // Wander
        enemy.state = 'wander';
        enemy.stateTimer -= dt;
        if (enemy.stateTimer <= 0) {
          enemy.stateTimer = 2 + Math.random() * 3;
          const a = Math.random() * Math.PI * 2;
          enemy.vx = Math.cos(a) * (enemy.speed * 0.4);
          enemy.vy = Math.sin(a) * (enemy.speed * 0.4);
          enemy.facing = enemy.vx > 0 ? 'right' : 'left';
        }
      }

      enemy.x += enemy.vx * dt;
      enemy.y += enemy.vy * dt;
    }

    // 8. Update Animals
    for (const animal of this.world.animals) {
      if (animal.hitFlash > 0) animal.hitFlash -= dt;
      if (Math.abs(animal.x - this.player.x) > SIM_RADIUS || Math.abs(animal.y - this.player.y) > SIM_RADIUS) {
        continue;
      }
      animal.stateTimer -= dt;
      if (animal.stateTimer <= 0) {
        animal.stateTimer = 3 + Math.random() * 4;
        if (animal.insidePen) {
          animal.vx = (Math.random() - 0.5) * 15;
          animal.vy = (Math.random() - 0.5) * 15;
        } else {
          animal.vx = (Math.random() - 0.5) * 25;
          animal.vy = (Math.random() - 0.5) * 25;
        }
        animal.facing = animal.vx > 0 ? 'right' : 'left';
      }
      animal.x += animal.vx * dt;
      animal.y += animal.vy * dt;
    }

    // 9. Update Projectiles
    for (let i = this.world.projectiles.length - 1; i >= 0; i--) {
      const p = this.world.projectiles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.lifespan -= dt;

      // Check hit enemy
      let hit = false;
      for (const enemy of this.world.enemies) {
        if (enemy.hp <= 0) continue;
        if (Math.hypot(enemy.x - p.x, enemy.y - p.y) < 22) {
          enemy.hp -= p.damage;
          enemy.hitFlash = 0.15;
          soundEngine.playHit();
          this.spawnBurst(p.x, p.y, '#cc2222', 6);
          this.addFloatingText(enemy.x, enemy.y - 20, `-${p.damage}`, '#ff4444');
          if (enemy.hp <= 0) this.handleEnemyDeath(enemy);
          hit = true;
          break;
        }
      }

      if (hit || p.lifespan <= 0) {
        this.world.projectiles.splice(i, 1);
      }
    }

    // 10. Loot Magnet & Pickups
    const magnetDist = 70;
    for (let i = this.world.lootDrops.length - 1; i >= 0; i--) {
      const loot = this.world.lootDrops[i];
      const dist = Math.hypot(this.player.x - loot.x, this.player.y - loot.y);
      if (dist < magnetDist) {
        loot.x += (this.player.x - loot.x) * 10 * dt;
        loot.y += (this.player.y - loot.y) * 10 * dt;

        if (dist < 20) {
          const itemDef = ITEMS[loot.itemId];
          if (itemDef && this.addItemToInventory(itemDef, loot.quantity)) {
            soundEngine.playPickup();
            this.addFloatingText(this.player.x, this.player.y - 20, `+${loot.quantity} ${itemDef.name}`, '#ffff55');
            this.world.lootDrops.splice(i, 1);
            continue;
          }
        }
      }
    }

    // 11. Particles Update
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      p.alpha = Math.max(0, p.life / p.maxLife);
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Auto-save every 30 seconds
    this.autoSaveTimer += dt;
    if (this.autoSaveTimer >= 30) {
      this.autoSaveTimer = 0;
      saveGame(this.player, this.world, this.quests);
    }
  }

  private damagePlayer(amount: number) {
    if (this.invulnerabilityTimer > 0) return;

    const defense = (this.player.equipment.armor?.item.defense ?? 0) + 
                    (this.player.equipment.helmet?.item.defense ?? 0) +
                    (this.player.equipment.boots?.item.defense ?? 0);
    const finalDmg = calculateDamage(amount, defense);

    this.player.stats.hp = Math.max(0, this.player.stats.hp - finalDmg);
    this.player.hitFlash = 0.35;
    this.invulnerabilityTimer = 0.65; // 0.65s invulnerability i-frames to prevent rapid burst deaths
    this.shakeDuration = 0.25;
    this.shakeMagnitude = 6;
    soundEngine.playPlayerHurt();
    this.spawnBurst(this.player.x, this.player.y, '#ff1111', 10);
    this.addFloatingText(this.player.x, this.player.y - 25, `-${finalDmg}`, '#ff2222');

    if (this.player.stats.hp <= 0) {
      this.handlePlayerDeath();
      this.onGameOver?.();
    }
    this.onStateChange?.();
  }

  public handlePlayerDeath() {
    // Drop all inventory items at the death spot as loot
    for (const slot of this.player.inventory) {
      if (slot) {
        this.spawnLoot(this.player.x, this.player.y, slot.item.id, slot.quantity);
      }
    }
    // Drop all equipped gear
    const eq = this.player.equipment;
    for (const key of ['weapon', 'helmet', 'armor', 'boots', 'accessory'] as const) {
      const slot = eq[key];
      if (slot) {
        this.spawnLoot(this.player.x, this.player.y, slot.item.id, slot.quantity);
      }
    }
    // Clear player inventory and equipment
    this.player.inventory = new Array(24).fill(null);
    this.player.equipment = { weapon: null, helmet: null, armor: null, boots: null, accessory: null };
    // Immediately persist empty state so reloading cannot restore items
    saveGame(this.player, this.world, this.quests);
  }

  public respawnPlayer() {
    // 1. Ensure inventory and equipment are completely wiped clean
    this.player.inventory = new Array(24).fill(null);
    this.player.equipment = { weapon: null, helmet: null, armor: null, boots: null, accessory: null };

    // 2. If died inside a cave, restore overworld
    if (this.player.isInsideCave && this.overworldWorld) {
      this.world = this.overworldWorld;
      this.player.isInsideCave = false;
    }

    let respawnX = 60 * TILE_SIZE;
    let respawnY = 60 * TILE_SIZE;

    // Check if player has an active bed that still exists
    let foundBed = false;
    if (this.player.spawnPoint) {
      const bed = this.world.structures.find(s => s.type === 'bed' && Math.hypot(s.x - this.player.spawnPoint!.x, s.y - this.player.spawnPoint!.y) < 60);
      if (bed) {
        respawnX = bed.x;
        respawnY = bed.y + 24;
        foundBed = true;
        this.addFloatingText(respawnX, respawnY - 30, 'Renasceu na sua Cama!', '#38bdf8');
      }
    }

    if (!foundBed) {
      const safeSpawn = findRandomSafeSpawn(this.world.tiles, this.world.width, this.world.height);
      respawnX = safeSpawn.x;
      respawnY = safeSpawn.y;
      this.addFloatingText(respawnX, respawnY - 30, 'Renasceu no Ermo!', '#facc15');
    }

    this.player.x = respawnX;
    this.player.y = respawnY;
    this.cameraX = respawnX;
    this.cameraY = respawnY;

    // 3. Reset survival stats
    this.player.stats.hp = this.player.stats.maxHp;
    this.player.stats.hunger = 80;
    this.player.stats.thirst = 80;
    this.player.stats.energy = 100;
    this.player.stats.bodyTemp = 36.5;
    this.player.stats.sleep = 0;
    this.player.stats.breath = 100;
    this.player.isBoating = false;
    this.player.isSwimming = false;
    this.player.hitFlash = 0;

    saveGame(this.player, this.world, this.quests);
    this.onStateChange?.();
  }

  private checkPlayerCollision(x: number, y: number): boolean {
    const tileX = Math.floor(x / TILE_SIZE);
    const tileY = Math.floor(y / TILE_SIZE);
    if (tileX < 0 || tileX >= this.world.width || tileY < 0 || tileY >= this.world.height) return true;

    const t = this.world.tiles[tileY * this.world.width + tileX];
    const isWater = t === TILE_TYPES.WATER || t === TILE_TYPES.DEEP_WATER;
    if (!isWater && isTileSolid(t)) return true;

    // Structure collision
    for (const s of this.world.structures) {
      if (s.type === 'wood_door' && s.isOpen) continue;
      if (s.type === 'farmland' || s.type === 'floor_torch') continue;
      // Watercraft & Piers do not block the player
      if (s.type === 'pier' || s.type === 'raft' || s.type === 'canoe' || s.type === 'wood_boat') continue;
      if (Math.abs(s.x - x) > 30 || Math.abs(s.y - y) > 30) continue;
      if (Math.hypot(s.x - x, s.y - y) < 22) {
        return true;
      }
    }

    // Physical collision for Trees and Rocks (optimized with AABB pre-filter)
    for (const res of this.world.resources) {
      if (res.hp <= 0) continue;
      if (Math.abs(res.x - x) > 28 || Math.abs(res.y - y) > 28) continue;
      if (
        res.type === 'tree' || 
        res.type === 'oak_tree' || 
        res.type === 'pine_tree' || 
        res.type === 'birch_tree' || 
        res.type === 'snowy_pine' || 
        res.type === 'willow_tree' ||
        res.type === 'acacia_tree'
      ) {
        // Collide with rooted trunk base
        if (Math.hypot(res.x - x, (res.y + 12) - y) < 14) {
          return true;
        }
      } else if (
        res.type === 'rock' || 
        res.type === 'iron_ore' || 
        res.type === 'copper_ore' || 
        res.type === 'gold_ore' || 
        res.type === 'diamond_ore'
      ) {
        if (Math.hypot(res.x - x, res.y - y) < 14) {
          return true;
        }
      }
    }

    return false;
  }

  // --- Rendering Pipeline ---
  private render() {
    const dpr = window.devicePixelRatio || 1;
    const viewW = this.canvas.width / dpr;
    const viewH = this.canvas.height / dpr;

    this.ctx.clearRect(0, 0, viewW, viewH);

    // Screen Shake Offset
    let shakeX = 0;
    let shakeY = 0;
    if (this.shakeDuration > 0) {
      shakeX = (Math.random() - 0.5) * this.shakeMagnitude;
      shakeY = (Math.random() - 0.5) * this.shakeMagnitude;
    }

    this.ctx.save();
    this.ctx.translate(Math.floor(viewW / 2 + shakeX), Math.floor(viewH / 2 + shakeY));
    this.ctx.scale(this.zoom, this.zoom);
    this.ctx.translate(-Math.floor(this.cameraX), -Math.floor(this.cameraY));

    // Visible tile boundaries
    const startTileX = Math.max(0, Math.floor((this.cameraX - viewW / 2 / this.zoom) / TILE_SIZE));
    const endTileX = Math.min(this.world.width - 1, Math.ceil((this.cameraX + viewW / 2 / this.zoom) / TILE_SIZE));
    const startTileY = Math.max(0, Math.floor((this.cameraY - viewH / 2 / this.zoom) / TILE_SIZE));
    const endTileY = Math.min(this.world.height - 1, Math.ceil((this.cameraY + viewH / 2 / this.zoom) / TILE_SIZE));

    // 1. Draw Ground Tiles
    for (let ty = startTileY; ty <= endTileY; ty++) {
      for (let tx = startTileX; tx <= endTileX; tx++) {
        const type = this.world.tiles[ty * this.world.width + tx];
        spriteRenderer.drawTile(this.ctx, type, tx * TILE_SIZE, ty * TILE_SIZE, this.gameTimeMs);
      }
    }

    // 2. Collect All Renderable Entities with Tighter Viewport Culling & Sort by Y
    const halfViewW = (viewW / 2) / this.zoom + 64;
    const halfViewH = (viewH / 2) / this.zoom + 64;
    const animTime = this.gameTimeMs * 0.005;

    const renderList: { y: number; draw: () => void }[] = [];

    // Structures (Viewport culled)
    for (const s of this.world.structures) {
      if (Math.abs(s.x - this.cameraX) <= halfViewW && Math.abs(s.y - this.cameraY) <= halfViewH) {
        renderList.push({
          y: s.y,
          draw: () => spriteRenderer.drawStructure(this.ctx, s, this.gameTimeMs),
        });
      }
    }

    // Natural Resources (Viewport culled)
    for (const r of this.world.resources) {
      if (r.hp <= 0) continue;
      if (Math.abs(r.x - this.cameraX) <= halfViewW && Math.abs(r.y - this.cameraY) <= halfViewH) {
        renderList.push({
          y: r.y + 10,
          draw: () => spriteRenderer.drawResource(this.ctx, r, this.gameTimeMs),
        });
      }
    }

    // Animals (Viewport culled)
    for (const animal of this.world.animals) {
      if (Math.abs(animal.x - this.cameraX) <= halfViewW && Math.abs(animal.y - this.cameraY) <= halfViewH) {
        renderList.push({
          y: animal.y,
          draw: () => spriteRenderer.drawAnimal(this.ctx, animal, animTime),
        });
      }
    }

    // Enemies (Viewport culled)
    for (const enemy of this.world.enemies) {
      if (enemy.hp <= 0) continue;
      if (Math.abs(enemy.x - this.cameraX) <= halfViewW && Math.abs(enemy.y - this.cameraY) <= halfViewH) {
        renderList.push({
          y: enemy.y,
          draw: () => spriteRenderer.drawEnemy(this.ctx, enemy, animTime),
        });
      }
    }

    // Player
    const equippedWeaponId = this.player.inventory[this.player.selectedHotbarIndex]?.item.id || null;
    renderList.push({
      y: this.player.y,
      draw: () => spriteRenderer.drawPlayer(
        this.ctx,
        this.player.x,
        this.player.y,
        this.player.facing,
        this.player.isMoving,
        animTime,
        this.player.isAttacking,
        this.player.swingProgress,
        equippedWeaponId,
        this.player.hitFlash,
        this.player.isSwimming,
        this.player.isBoating,
        this.player.boatType
      ),
    });

    // Sort and execute draw
    renderList.sort((a, b) => a.y - b.y);
    for (let i = 0; i < renderList.length; i++) {
      renderList[i].draw();
    }

    // 2.5. Draw Interactive Action Prompt Badges above nearby structures
    for (const s of this.world.structures) {
      if (Math.abs(s.x - this.cameraX) <= halfViewW && Math.abs(s.y - this.cameraY) <= halfViewH) {
        const dist = Math.hypot(s.x - this.player.x, s.y - this.player.y);
        if (dist <= 95) {
          const sType = s.type as string;
          let label = '';
          if (sType === 'workbench' || sType === 'workbench_item') label = '🛠️ Bancada [Toque / E]';
          else if (sType === 'weapon_workbench' || sType === 'weapon_workbench_item') label = '🔫 Bancada de Armas [Toque / E]';
          else if (sType === 'campfire' || sType === 'campfire_item') label = '🔥 Cozinhar [Toque / E]';
          else if (sType === 'chest') label = '📦 Baú [Toque / E]';
          else if (sType === 'furnace') label = '♨️ Fornalha [Toque / E]';
          else if (sType === 'sawmill') label = '🪚 Serraria [Toque / E]';
          else if (sType === 'anvil') label = '⚓ Bigorna [Toque / E]';
          else if (sType === 'bed') label = '🛏️ Dormir [Toque / E]';
          else if (sType === 'wood_door') label = s.isOpen ? '🚪 Fechar' : '🚪 Abrir';
          else if (sType === 'well') label = '⛲ Beber Água';
          else if (sType === 'cave_entrance') label = '🕳️ Caverna [Toque / E]';
          else if (sType === 'cave_exit') label = '🪜 Subir [Toque / E]';

          if (label) {
            const bob = Math.sin(this.gameTimeMs * 0.007) * 3;
            const bubbleY = s.y - 32 + bob;
            this.ctx.save();
            this.ctx.font = 'bold 10px monospace';
            const textWidth = this.ctx.measureText(label).width;
            this.ctx.fillStyle = 'rgba(15, 17, 28, 0.88)';
            this.ctx.strokeStyle = '#facc15';
            this.ctx.lineWidth = 1.5;
            this.ctx.beginPath();
            this.ctx.roundRect(s.x - textWidth / 2 - 6, bubbleY - 12, textWidth + 12, 18, 6);
            this.ctx.fill();
            this.ctx.stroke();

            this.ctx.fillStyle = '#fef08a';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(label, s.x, bubbleY - 3);
            this.ctx.restore();
          }
        }
      }
    }

    // 3. Draw Loot Drops
    for (const loot of this.world.lootDrops) {
      const itemDef = ITEMS[loot.itemId];
      if (itemDef) {
        spriteRenderer.drawLootDrop(this.ctx, loot, this.gameTimeMs, itemDef.icon);
      }
    }

    // 4. Draw Projectiles (Arrows & Bullets)
    for (const p of this.world.projectiles) {
      if (p.projectileType === 'bullet_pistol' || p.projectileType === 'bullet_rifle') {
        const angle = Math.atan2(p.vy, p.vx);
        const len = p.projectileType === 'bullet_rifle' ? 18 : 12;
        this.ctx.strokeStyle = '#fef08a';
        this.ctx.lineWidth = p.projectileType === 'bullet_rifle' ? 3 : 2;
        this.ctx.beginPath();
        this.ctx.moveTo(p.x, p.y);
        this.ctx.lineTo(p.x - Math.cos(angle) * len, p.y - Math.sin(angle) * len);
        this.ctx.stroke();

        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.projectileType === 'bullet_rifle' ? 2.5 : 2, 0, Math.PI * 2);
        this.ctx.fill();
      } else {
        this.ctx.fillStyle = '#f0c050';
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }

    // 5. Ghost Building Placement Preview (Clamped to player vicinity)
    if (this.isBuildingMode && this.selectedBuildingStructureId) {
      const MAX_BUILD_REACH = 96;
      let targetX = this.mouseWorldX;
      let targetY = this.mouseWorldY;
      const distFromPlayer = Math.hypot(targetX - this.player.x, targetY - this.player.y);

      if (distFromPlayer > MAX_BUILD_REACH || (targetX === 0 && targetY === 0)) {
        let forwardX = 0;
        let forwardY = 0;
        if (this.player.facing === 'down') forwardY = 48;
        else if (this.player.facing === 'up') forwardY = -48;
        else if (this.player.facing === 'left') forwardX = -48;
        else if (this.player.facing === 'right') forwardX = 48;

        if (distFromPlayer > MAX_BUILD_REACH && (targetX !== 0 || targetY !== 0)) {
          const angle = Math.atan2(targetY - this.player.y, targetX - this.player.x);
          targetX = this.player.x + Math.cos(angle) * MAX_BUILD_REACH;
          targetY = this.player.y + Math.sin(angle) * MAX_BUILD_REACH;
        } else {
          targetX = this.player.x + forwardX;
          targetY = this.player.y + forwardY;
        }
      }

      const tileX = Math.floor(targetX / TILE_SIZE);
      const tileY = Math.floor(targetY / TILE_SIZE);
      const isWatercraft = this.selectedBuildingStructureId === 'raft' || 
                           this.selectedBuildingStructureId === 'canoe' || 
                           this.selectedBuildingStructureId === 'wood_boat' || 
                           this.selectedBuildingStructureId === 'pier';
      const tileType = (tileX >= 0 && tileX < this.world.width && tileY >= 0 && tileY < this.world.height)
        ? this.world.tiles[tileY * this.world.width + tileX]
        : TILE_TYPES.GRASS;
      const isWaterTile = tileType === TILE_TYPES.WATER || tileType === TILE_TYPES.DEEP_WATER;
      const occupied = this.world.structures.some(s => s.tileX === tileX && s.tileY === tileY);
      const canPlace = (isWatercraft ? isWaterTile : !isWaterTile) && !occupied && tileX >= 2 && tileX < this.world.width - 2 && tileY >= 2 && tileY < this.world.height - 2;

      this.ctx.fillStyle = canPlace ? 'rgba(50, 255, 50, 0.35)' : 'rgba(255, 50, 50, 0.35)';
      this.ctx.fillRect(tileX * TILE_SIZE, tileY * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      this.ctx.strokeStyle = canPlace ? '#44ff44' : '#ff4444';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(tileX * TILE_SIZE, tileY * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    }

    // 6. Draw Particles & Floating Text
    for (const p of this.particles) {
      if (p.type === 'text' && p.text) {
        this.ctx.font = `bold ${p.size}px monospace`;
        this.ctx.fillStyle = p.color;
        this.ctx.globalAlpha = p.alpha;
        this.ctx.textAlign = 'center';
        this.ctx.fillText(p.text, p.x, p.y);
        this.ctx.globalAlpha = 1;
      } else {
        this.ctx.fillStyle = p.color;
        this.ctx.globalAlpha = p.alpha;
        this.ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
        this.ctx.globalAlpha = 1;
      }
    }

    this.ctx.restore();

    // 7. Dynamic Lighting & Atmospheric Color Shading
    this.renderLighting(viewW, viewH);

    // 8. Weather Overlay (Rain streaks & lightning)
    this.renderWeather(viewW, viewH);
  }

  private renderLighting(viewW: number, viewH: number) {
    const time = this.world.timeOfDay;
    // Calculate ambient darkness (0: full daylight, ~0.85: deep midnight)
    let darkness = 0;
    if (time >= 20 * 60 || time < 4 * 60) {
      darkness = 0.85; // Deep Night
    } else if (time >= 18 * 60 && time < 20 * 60) {
      // Sunset (18:00 to 20:00)
      darkness = ((time - 18 * 60) / (2 * 60)) * 0.85;
    } else if (time >= 4 * 60 && time < 6 * 60) {
      // Dawn (04:00 to 06:00)
      darkness = (1 - (time - 4 * 60) / (2 * 60)) * 0.85;
    }

    if (this.world.weather === 'thunderstorm') {
      darkness = Math.min(0.9, darkness + 0.35);
    } else if (this.world.weather === 'rain') {
      darkness = Math.min(0.8, darkness + 0.2);
    }

    if (darkness <= 0.05) return;

    this.lightCtx.clearRect(0, 0, this.lightCanvas.width, this.lightCanvas.height);

    // Fill darkness with atmospheric deep midnight blue
    this.lightCtx.fillStyle = `rgba(10, 15, 35, ${darkness})`;
    this.lightCtx.fillRect(0, 0, this.lightCanvas.width, this.lightCanvas.height);

    // Carve out light circles with destination-out
    this.lightCtx.globalCompositeOperation = 'destination-out';

    const dpr = window.devicePixelRatio || 1;
    const halfW = viewW / 2;
    const halfH = viewH / 2;

    const toScreen = (wx: number, wy: number) => ({
      x: (halfW + (wx - this.cameraX) * this.zoom) * dpr,
      y: (halfH + (wy - this.cameraY) * this.zoom) * dpr,
    });

    // 1. Light from Player (Held torch or base ambient glow)
    const equipped = this.player.inventory[this.player.selectedHotbarIndex]?.item.id;
    const playerRadius = equipped === 'torch' ? 180 : 80;
    const pScreen = toScreen(this.player.x, this.player.y);

    const grad = this.lightCtx.createRadialGradient(pScreen.x, pScreen.y, 10, pScreen.x, pScreen.y, playerRadius * this.zoom * dpr);
    grad.addColorStop(0, 'rgba(0,0,0,1)');
    grad.addColorStop(0.7, 'rgba(0,0,0,0.6)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    this.lightCtx.fillStyle = grad;
    this.lightCtx.beginPath();
    this.lightCtx.arc(pScreen.x, pScreen.y, playerRadius * this.zoom * dpr, 0, Math.PI * 2);
    this.lightCtx.fill();

    // 2. Light from Campfires & Furnaces & Torches in view
    for (const s of this.world.structures) {
      if (s.lit || s.type === 'campfire' || s.type === 'furnace' || s.type === 'floor_torch' || s.type === 'wall_torch') {
        const rad = s.type === 'campfire' ? 220 : s.type === 'furnace' ? 160 : 130;
        const pos = toScreen(s.x, s.y);
        const g = this.lightCtx.createRadialGradient(pos.x, pos.y, 5, pos.x, pos.y, rad * this.zoom * dpr);
        g.addColorStop(0, 'rgba(0,0,0,1)');
        g.addColorStop(0.75, 'rgba(0,0,0,0.5)');
        g.addColorStop(1, 'rgba(0,0,0,0)');
        this.lightCtx.fillStyle = g;
        this.lightCtx.beginPath();
        this.lightCtx.arc(pos.x, pos.y, rad * this.zoom * dpr, 0, Math.PI * 2);
        this.lightCtx.fill();
      }
    }

    this.lightCtx.globalCompositeOperation = 'source-over';

    // Draw lighting canvas onto main canvas
    this.ctx.drawImage(this.lightCanvas, 0, 0, viewW, viewH);
  }

  private renderWeather(viewW: number, viewH: number) {
    // 1. Rain Streaks
    if (this.world.rainIntensity > 0) {
      this.ctx.strokeStyle = `rgba(180, 210, 255, ${0.45 * this.world.rainIntensity})`;
      this.ctx.lineWidth = 1.5;
      this.ctx.beginPath();
      const dropCount = Math.floor(120 * this.world.rainIntensity);
      for (let i = 0; i < dropCount; i++) {
        const rx = (Math.sin(i * 99 + this.gameTimeMs * 0.005) * 0.5 + 0.5) * viewW;
        const ry = (Math.cos(i * 33 + this.gameTimeMs * 0.008) * 0.5 + 0.5) * viewH;
        this.ctx.moveTo(rx, ry);
        this.ctx.lineTo(rx - 8, ry + 16);
      }
      this.ctx.stroke();
    }

    // 2. Snowflakes
    if (this.world.snowIntensity > 0) {
      this.ctx.fillStyle = `rgba(255, 255, 255, ${0.8 * this.world.snowIntensity})`;
      const flakeCount = Math.floor(90 * this.world.snowIntensity);
      for (let i = 0; i < flakeCount; i++) {
        const fx = Math.abs((Math.sin(i * 77 + this.gameTimeMs * 0.001) * 0.5 + 0.5) * viewW + Math.sin(this.gameTimeMs * 0.002 + i) * 20) % viewW;
        const fy = Math.abs((i * 29 + this.gameTimeMs * 0.06) % viewH);
        const sz = (i % 3) + 2;
        this.ctx.fillRect(fx, fy, sz, sz);
      }
    }

    // 3. Heatwave Amber Shimmer
    if (this.world.weather === 'heatwave') {
      const shimmer = Math.sin(this.gameTimeMs * 0.004) * 0.03;
      this.ctx.fillStyle = `rgba(249, 115, 22, ${0.14 + shimmer})`;
      this.ctx.fillRect(0, 0, viewW, viewH);
    }

    // 4. Lightning Flash
    if (this.world.lightningTimer > 0) {
      this.ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(0.8, this.world.lightningTimer * 5)})`;
      this.ctx.fillRect(0, 0, viewW, viewH);
    }

    // 5. Disaster Alert Banner Overhead
    if (this.world.disasterWarning) {
      this.ctx.save();
      this.ctx.fillStyle = 'rgba(20, 20, 30, 0.85)';
      this.ctx.fillRect(viewW / 2 - 160, 10, 320, 26);
      this.ctx.strokeStyle = '#f59e0b';
      this.ctx.lineWidth = 1.5;
      this.ctx.strokeRect(viewW / 2 - 160, 10, 320, 26);
      this.ctx.fillStyle = '#fbbf24';
      this.ctx.font = 'bold 11px monospace';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(`⚠️ ${this.world.disasterWarning}`, viewW / 2, 27);
      this.ctx.restore();
    }

    // 6. Atmospheric Neblina (Fog & Mist) in Lake/Swamp, Ancient Ruins, and Morning Dawn
    const pTileX = Math.floor(this.player.x / TILE_SIZE);
    const pTileY = Math.floor(this.player.y / TILE_SIZE);
    const distToLake = Math.hypot(pTileX - 60, pTileY - 135);
    const isSwampOrLake = distToLake < 46;
    const isRuins = pTileX < 45 && pTileY >= 45 && pTileY < 95;
    const isMorningFog = this.world.timeOfDay >= 5 * 60 && this.world.timeOfDay <= 8.5 * 60;

    if (!this.player.isInsideCave && (isSwampOrLake || isRuins || isMorningFog)) {
      const fogAlpha = isSwampOrLake ? 0.16 : isMorningFog ? 0.10 : 0.14;
      this.ctx.save();
      this.ctx.fillStyle = `rgba(215, 228, 238, ${fogAlpha})`;
      this.ctx.fillRect(0, 0, viewW, viewH);
      this.ctx.restore();
    }

    // 7. Danger & Low Health Warning Vignette
    const isCriticalHp = this.player.stats.hp < this.player.stats.maxHp * 0.35;
    if (isCriticalHp || this.invulnerabilityTimer > 0) {
      const pulse = 0.2 + Math.sin(this.gameTimeMs * 0.008) * 0.12;
      this.ctx.save();
      this.ctx.lineWidth = 14;
      this.ctx.strokeStyle = `rgba(239, 68, 68, ${pulse + 0.25})`;
      this.ctx.strokeRect(0, 0, viewW, viewH);
      if (isCriticalHp) {
        this.ctx.fillStyle = `rgba(220, 38, 38, ${pulse * 0.35})`;
        this.ctx.fillRect(0, 0, viewW, viewH);
      }
      this.ctx.restore();
    }
  }
}
