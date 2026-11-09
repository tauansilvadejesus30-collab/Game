import { 
  PlayerEntity, 
  WorldState, 
  Direction, 
  Quest, 
  Particle, 
  LightSource, 
  StructureEntity, 
  InventorySlot,
  EnemyEntity
} from './types';
import { 
  TILE_SIZE, 
  ITEMS, 
  INITIAL_QUESTS, 
  TILE_TYPES, 
  WORLD_PIXEL_WIDTH, 
  WORLD_PIXEL_HEIGHT 
} from './constants';
import { generateWorld } from './worldGenerator';
import { spriteRenderer } from './sprites';
import { soundEngine } from './audio';
import { 
  calculateDamage, 
  calculateTargetTemperature, 
  updateSurvivalStats, 
  isTileSolid 
} from './rules';
import { saveGame, loadGame } from './saveManager';

export class GameEngine {
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  private lightCanvas: HTMLCanvasElement;
  private lightCtx: CanvasRenderingContext2D;

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
        stats: saved.player.stats,
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

    return {
      x: 60 * TILE_SIZE,
      y: 60 * TILE_SIZE,
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
        xp: 0,
        level: 1,
        skillPoints: 0,
      },
      inventory,
      selectedHotbarIndex: 0,
      equipment: {
        helmet: null,
        armor: null,
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

    this.canvas.width = w * dpr;
    this.canvas.height = h * dpr;
    this.ctx.scale(dpr, dpr);
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
      if (e.code === 'KeyE') this.onOpenInventory?.();
      if (e.code === 'KeyC') this.onOpenCrafting?.();
      if (e.code === 'KeyB') this.onOpenBuilding?.();
      if (e.code === 'KeyM') this.onOpenMap?.();
      if (e.code === 'KeyK') this.onOpenSkills?.();
      if (e.code === 'Space') {
        e.preventDefault();
        this.triggerAttackOrInteract();
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
        this.triggerAttackOrInteract();
      }
    });

    this.canvas.addEventListener('mouseup', () => {
      this.isMouseDown = false;
    });

    this.canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      // Right-click cancels building mode
      if (this.isBuildingMode) {
        this.cancelBuildingMode();
      }
    });
  }

  private updateMouseWorldPos() {
    const halfW = (this.canvas.width / (window.devicePixelRatio || 1)) / 2;
    const halfH = (this.canvas.height / (window.devicePixelRatio || 1)) / 2;
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

    // Sound
    if (equipped && equipped.item.id === 'bow') {
      this.shootBowArrow();
    } else {
      soundEngine.playSwing();
    }

    // Interact with nearby structures (e.g. Chest, Bed, Well, Door, Farm)
    this.checkStructureInteraction();

    // Check hits against resources or enemies
    this.checkHitBox();
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
    const interactRange = 55;
    for (const struct of this.world.structures) {
      const dist = Math.hypot(struct.x - this.player.x, struct.y - this.player.y);
      if (dist <= interactRange) {
        if (struct.type === 'chest') {
          this.onOpenChest?.(struct);
          return;
        } else if (struct.type === 'campfire' || struct.type === 'furnace') {
          this.onOpenCooking?.(struct);
          return;
        } else if (struct.type === 'bed') {
          this.sleepInBed();
          return;
        } else if (struct.type === 'well') {
          this.drinkFromWell();
          return;
        } else if (struct.type === 'wood_door') {
          struct.isOpen = !struct.isOpen;
          soundEngine.playBuild();
          this.addFloatingText(struct.x, struct.y - 10, struct.isOpen ? 'Porta Aberta' : 'Porta Fechada', '#ffcc00');
          return;
        } else if (struct.type === 'farmland' && struct.cropStage && struct.cropStage >= 3) {
          // Harvest ripe crop!
          struct.cropStage = 1;
          const yieldItem = struct.cropYieldItemId ? ITEMS[struct.cropYieldItemId] : ITEMS.tomato;
          this.addItemToInventory(yieldItem, 2);
          soundEngine.playPickup();
          this.addFloatingText(struct.x, struct.y - 10, `+2 ${yieldItem.name}`, '#44ff44');
          this.checkQuestProgress('gather', 'crop', 1);
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
          this.spawnLoot(animal.x, animal.y, 'raw_meat', 2);
          this.spawnLoot(animal.x, animal.y, 'leather', 1);
          const idx = this.world.animals.indexOf(animal);
          this.world.animals.splice(idx, 1);
        }
        return;
      }
    }

    // 3. Check Resources (Trees, Rocks, Ores, Loose items, Bushes)
    for (const res of this.world.resources) {
      if (res.hp <= 0) continue;
      const dist = Math.hypot(res.x - attackX, res.y - attackY);
      if (dist <= attackReach) {
        // Instant manual pickup for loose branches and stones scattered on ground
        if (res.type === 'loose_branch' || res.type === 'loose_stone') {
          const yieldCount = Math.floor(res.yieldMin + Math.random() * (res.yieldMax - res.yieldMin + 1));
          const targetItem = ITEMS[res.resourceId];
          const added = this.addItemToInventory(targetItem, yieldCount);
          if (!added) {
            this.spawnLoot(res.x, res.y, res.resourceId, yieldCount);
          }
          soundEngine.playPickup();
          this.spawnBurst(res.x, res.y, res.type === 'loose_branch' ? '#8f5d34' : '#9ca3af', 5);
          this.addFloatingText(res.x, res.y - 15, `+${yieldCount} ${targetItem?.name || res.resourceId}`, '#fbbf24');
          this.checkQuestProgress('gather', res.resourceId, yieldCount);

          const idx = this.world.resources.indexOf(res);
          this.world.resources.splice(idx, 1);
          return;
        }

        let isToolMatch = false;
        if (res.type.includes('tree') && equipped?.item.toolType === 'axe') {
          isToolMatch = true;
          damage = (equipped.item.damage || 20) * 1.5;
        } else if (res.type.includes('rock') && equipped?.item.toolType === 'pickaxe') {
          isToolMatch = true;
          damage = (equipped.item.damage || 20) * 1.5;
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
          this.spawnBurst(res.x, res.y, '#8f5d34', 6);
        } else if (res.type.includes('bush') || res.type.includes('plant')) {
          soundEngine.playPickup();
          this.spawnBurst(res.x, res.y, '#22c55e', 5);
        } else {
          soundEngine.playMine();
          this.spawnBurst(res.x, res.y, '#7a7a85', 6);
        }

        if (res.hp <= 0) {
          const yieldCount = Math.floor(res.yieldMin + Math.random() * (res.yieldMax - res.yieldMin + 1));
          this.spawnLoot(res.x, res.y, res.resourceId, yieldCount);
          if (res.secondaryResourceId && res.secondaryYield) {
            this.spawnLoot(res.x, res.y, res.secondaryResourceId, res.secondaryYield);
          }
          this.gainPlayerXp(15);
          this.checkQuestProgress('gather', res.resourceId, yieldCount);

          const idx = this.world.resources.indexOf(res);
          this.world.resources.splice(idx, 1);
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

  public tryPlaceStructure() {
    if (!this.selectedBuildingStructureId) return;

    const tileX = Math.floor(this.mouseWorldX / TILE_SIZE);
    const tileY = Math.floor(this.mouseWorldY / TILE_SIZE);

    // Validate bounds
    if (tileX < 2 || tileX >= this.world.width - 2 || tileY < 2 || tileY >= this.world.height - 2) return;

    // Check if tile is water
    const tileType = this.world.tiles[tileY * this.world.width + tileX];
    if (tileType === TILE_TYPES.WATER || tileType === TILE_TYPES.DEEP_WATER) {
      this.addFloatingText(this.mouseWorldX, this.mouseWorldY, 'Não pode construir na água!', '#ff5555');
      return;
    }

    // Check if another structure occupies this tile
    const exists = this.world.structures.some(s => s.tileX === tileX && s.tileY === tileY);
    if (exists) {
      this.addFloatingText(this.mouseWorldX, this.mouseWorldY, 'Espaço ocupado!', '#ff5555');
      return;
    }

    // Consume 1 item from hotbar
    const equipped = this.player.inventory[this.player.selectedHotbarIndex];
    if (equipped) {
      equipped.quantity--;
      if (equipped.quantity <= 0) {
        this.player.inventory[this.player.selectedHotbarIndex] = null;
        this.cancelBuildingMode();
      }
    }

    soundEngine.playBuild();
    this.world.structures.push({
      id: `struct_${Date.now()}_${Math.random()}`,
      type: this.selectedBuildingStructureId as StructureEntity['type'],
      tileX,
      tileY,
      x: tileX * TILE_SIZE + TILE_SIZE / 2,
      y: tileY * TILE_SIZE + TILE_SIZE / 2,
      width: TILE_SIZE,
      height: TILE_SIZE,
      hp: 150,
      maxHp: 150,
      lit: true,
      chestInventory: this.selectedBuildingStructureId === 'chest' ? new Array(16).fill(null) : undefined,
    });

    this.checkQuestProgress('build', this.selectedBuildingStructureId, 1);
    this.onStateChange?.();
  }

  public cancelBuildingMode() {
    this.isBuildingMode = false;
    this.selectedBuildingStructureId = null;
    this.onStateChange?.();
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

    const isSprinting = (this.keys.has('ShiftLeft') || this.keys.has('ShiftRight') || this.isTouchSprint) && this.player.stats.energy > 5;
    let speed = isSprinting ? 160 : 105;
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

      // Footstep sound
      if (Math.random() < dt * 3.5) {
        soundEngine.playFootstep();
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

    // Hit flash decay
    if (this.player.hitFlash > 0) {
      this.player.hitFlash -= dt;
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

    const targetTemp = calculateTargetTemperature({
      isNight,
      isRaining: this.world.weather === 'rain' || this.world.weather === 'thunderstorm',
      biome: 'forest',
      nearCampfire,
      nearTorch,
      insideCabin: false,
      equippedArmorDefense: this.player.equipment.armor?.item.defense ?? 0,
    });

    this.player.stats.bodyTemp += (targetTemp - this.player.stats.bodyTemp) * 0.05 * dt;

    this.player.stats = updateSurvivalStats(this.player.stats, dt, {
      isSprinting: this.player.isMoving && isSprinting,
      isResting: !this.player.isMoving,
      hasMetabolismSkill: !!this.player.skills['skill_metabolism'],
      currentTemperature: this.player.stats.bodyTemp,
    });

    if (this.player.stats.hp <= 0) {
      this.onGameOver?.();
    }

    // 5. Day & Night clock progression (24 hours in ~10 minutes)
    this.world.timeOfDay = (this.world.timeOfDay + dt * 2.5) % 1440;

    // 6. Weather updates
    this.world.weatherTimer -= dt;
    if (this.world.weatherTimer <= 0) {
      this.world.weatherTimer = 240 + Math.random() * 180;
      const weathers: WorldState['weather'][] = ['sunny', 'cloudy', 'rain', 'thunderstorm'];
      this.world.weather = weathers[Math.floor(Math.random() * weathers.length)];
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

    // 7. Update Enemies (AI)
    for (const enemy of this.world.enemies) {
      if (enemy.hp <= 0) continue;
      if (enemy.hitFlash > 0) enemy.hitFlash -= dt;

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
    const defense = (this.player.equipment.armor?.item.defense ?? 0) + (this.player.equipment.helmet?.item.defense ?? 0);
    const finalDmg = calculateDamage(amount, defense);

    this.player.stats.hp = Math.max(0, this.player.stats.hp - finalDmg);
    this.player.hitFlash = 0.2;
    this.shakeDuration = 0.25;
    this.shakeMagnitude = 6;
    soundEngine.playPlayerHurt();
    this.spawnBurst(this.player.x, this.player.y, '#ff1111', 12);
    this.addFloatingText(this.player.x, this.player.y - 25, `-${finalDmg}`, '#ff2222');

    if (this.player.stats.hp <= 0) {
      this.onGameOver?.();
    }
    this.onStateChange?.();
  }

  private checkPlayerCollision(x: number, y: number): boolean {
    const tileX = Math.floor(x / TILE_SIZE);
    const tileY = Math.floor(y / TILE_SIZE);
    if (tileX < 0 || tileX >= this.world.width || tileY < 0 || tileY >= this.world.height) return true;

    const t = this.world.tiles[tileY * this.world.width + tileX];
    if (isTileSolid(t)) return true;

    // Structure collision
    for (const s of this.world.structures) {
      if (s.type === 'wood_door' && s.isOpen) continue;
      if (s.type === 'farmland' || s.type === 'floor_torch') continue;
      if (Math.hypot(s.x - x, s.y - y) < 22) {
        return true;
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

    // 2. Collect All Renderable Entities & Sort by Y (Depth buffer)
    const renderList: { y: number; draw: () => void }[] = [];

    // Structures
    for (const s of this.world.structures) {
      if (s.x >= this.cameraX - viewW && s.x <= this.cameraX + viewW && s.y >= this.cameraY - viewH && s.y <= this.cameraY + viewH) {
        renderList.push({
          y: s.y,
          draw: () => spriteRenderer.drawStructure(this.ctx, s, this.gameTimeMs),
        });
      }
    }

    // Natural Resources
    for (const r of this.world.resources) {
      if (r.x >= this.cameraX - viewW && r.x <= this.cameraX + viewW && r.y >= this.cameraY - viewH && r.y <= this.cameraY + viewH) {
        renderList.push({
          y: r.y + 10,
          draw: () => spriteRenderer.drawResource(this.ctx, r, this.gameTimeMs),
        });
      }
    }

    // Animals
    for (const animal of this.world.animals) {
      renderList.push({
        y: animal.y,
        draw: () => spriteRenderer.drawAnimal(this.ctx, animal, this.gameTimeMs * 0.005),
      });
    }

    // Enemies
    for (const enemy of this.world.enemies) {
      if (enemy.hp <= 0) continue;
      renderList.push({
        y: enemy.y,
        draw: () => spriteRenderer.drawEnemy(this.ctx, enemy, this.gameTimeMs * 0.005),
      });
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
        this.gameTimeMs * 0.005,
        this.player.isAttacking,
        this.player.swingProgress,
        equippedWeaponId,
        this.player.hitFlash
      ),
    });

    // Sort and execute draw
    renderList.sort((a, b) => a.y - b.y);
    for (const item of renderList) {
      item.draw();
    }

    // 3. Draw Loot Drops
    for (const loot of this.world.lootDrops) {
      const itemDef = ITEMS[loot.itemId];
      if (itemDef) {
        spriteRenderer.drawLootDrop(this.ctx, loot, this.gameTimeMs, itemDef.icon);
      }
    }

    // 4. Draw Projectiles (Arrows)
    for (const p of this.world.projectiles) {
      this.ctx.fillStyle = '#f0c050';
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // 5. Ghost Building Placement Preview
    if (this.isBuildingMode && this.selectedBuildingStructureId) {
      const tileX = Math.floor(this.mouseWorldX / TILE_SIZE);
      const tileY = Math.floor(this.mouseWorldY / TILE_SIZE);
      const canPlace = !this.checkPlayerCollision(tileX * TILE_SIZE + TILE_SIZE / 2, tileY * TILE_SIZE + TILE_SIZE / 2);

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

    // Lightning Flash
    if (this.world.lightningTimer > 0) {
      this.ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(0.8, this.world.lightningTimer * 5)})`;
      this.ctx.fillRect(0, 0, viewW, viewH);
    }
  }
}
