import { Direction } from './types';
import { TILE_SIZE, TILE_TYPES } from './constants';

export class SpriteRenderer {
  // We cache offscreen patterns for tiles
  private grassVariants: HTMLCanvasElement[];
  private waterCanvas: HTMLCanvasElement;
  private sandCanvas: HTMLCanvasElement;
  private dirtCanvas: HTMLCanvasElement;
  private ruinsCanvas: HTMLCanvasElement;
  private snowCanvas: HTMLCanvasElement;
  private savannaCanvas: HTMLCanvasElement;

  constructor() {
    this.grassVariants = this.createGrassTileVariants();
    this.waterCanvas = this.createWaterTile();
    this.sandCanvas = this.createSandTile();
    this.dirtCanvas = this.createDirtTile();
    this.ruinsCanvas = this.createRuinsTile();
    this.snowCanvas = this.createSnowTile();
    this.savannaCanvas = this.createSavannaTile();
  }

  // --- Tile Generators (Rich 16-Bit Pixel Art) ---
  private createGrassTileVariants(): HTMLCanvasElement[] {
    const variants: HTMLCanvasElement[] = [];

    for (let v = 0; v < 6; v++) {
      const c = document.createElement('canvas');
      c.width = TILE_SIZE;
      c.height = TILE_SIZE;
      const ctx = c.getContext('2d')!;

      // Rich layered meadow base
      ctx.fillStyle = v === 2 || v === 4 ? '#3b7822' : '#428526';
      ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);

      // Deep shadow grass blades
      ctx.fillStyle = '#2c5c1a';
      ctx.fillRect(2, 6, 3, 5);
      ctx.fillRect(18, 14, 3, 6);
      ctx.fillRect(34, 8, 3, 5);
      ctx.fillRect(10, 30, 3, 6);
      ctx.fillRect(26, 34, 3, 5);
      ctx.fillRect(42, 22, 3, 5);

      // Mid vibrant grass tufts
      ctx.fillStyle = '#55a630';
      ctx.fillRect(3, 5, 2, 4);
      ctx.fillRect(19, 13, 2, 5);
      ctx.fillRect(35, 7, 2, 4);
      ctx.fillRect(11, 29, 2, 5);
      ctx.fillRect(27, 33, 2, 4);

      // Highlights
      ctx.fillStyle = '#70c73a';
      ctx.fillRect(7, 22, 2, 3);
      ctx.fillRect(23, 8, 2, 3);
      ctx.fillRect(39, 38, 2, 3);

      if (v === 0) {
        // Variant 0: Tiny clovers
        ctx.fillStyle = '#5fb334';
        ctx.fillRect(12, 16, 2, 2);
        ctx.fillRect(14, 15, 2, 2);
        ctx.fillRect(13, 18, 2, 2);
        ctx.fillRect(32, 28, 2, 2);
      } else if (v === 1) {
        // Variant 1: White Daisy with yellow center
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(14, 18, 5, 5);
        ctx.fillStyle = '#facc15';
        ctx.fillRect(15, 19, 3, 3);
      } else if (v === 2) {
        // Variant 2: Yellow wild buttercup
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(30, 24, 4, 4);
        ctx.fillStyle = '#d97706';
        ctx.fillRect(31, 25, 2, 2);
      } else if (v === 3) {
        // Variant 3: Little earth pebble and grass cluster
        ctx.fillStyle = '#524538';
        ctx.fillRect(22, 26, 3, 2);
        ctx.fillStyle = '#786959';
        ctx.fillRect(23, 26, 2, 1);
      } else if (v === 4) {
        // Variant 4: Blue Forest Forget-me-nots
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(18, 12, 4, 4);
        ctx.fillStyle = '#fde047';
        ctx.fillRect(19, 13, 2, 2);
      } else if (v === 5) {
        // Variant 5: Dappled forest moss
        ctx.fillStyle = '#2f591e';
        ctx.fillRect(6, 20, 4, 3);
        ctx.fillRect(36, 12, 5, 3);
        ctx.fillStyle = '#65a30d';
        ctx.fillRect(7, 21, 2, 1);
      }

      variants.push(c);
    }

    return variants;
  }

  private createWaterTile(): HTMLCanvasElement {
    const c = document.createElement('canvas');
    c.width = TILE_SIZE;
    c.height = TILE_SIZE;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = '#2f689e';
    ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);

    ctx.fillStyle = '#214e7a';
    ctx.fillRect(0, 0, TILE_SIZE, 6);
    ctx.fillRect(12, 20, 24, 4);

    ctx.fillStyle = '#4890d4';
    ctx.fillRect(6, 10, 16, 3);
    ctx.fillRect(28, 32, 16, 3);

    return c;
  }

  private createSandTile(): HTMLCanvasElement {
    const c = document.createElement('canvas');
    c.width = TILE_SIZE;
    c.height = TILE_SIZE;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = '#d9b46e';
    ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);

    ctx.fillStyle = '#c29d56';
    ctx.fillRect(8, 12, 6, 3);
    ctx.fillRect(32, 24, 6, 3);
    ctx.fillRect(18, 38, 6, 3);

    ctx.fillStyle = '#ebd294';
    ctx.fillRect(4, 28, 4, 2);
    ctx.fillRect(26, 8, 4, 2);

    return c;
  }

  private createDirtTile(): HTMLCanvasElement {
    const c = document.createElement('canvas');
    c.width = TILE_SIZE;
    c.height = TILE_SIZE;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = '#8f683a';
    ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);

    ctx.fillStyle = '#735029';
    ctx.fillRect(6, 6, 8, 5);
    ctx.fillRect(24, 18, 6, 4);
    ctx.fillRect(12, 34, 8, 5);
    ctx.fillRect(36, 36, 6, 4);

    ctx.fillStyle = '#aa804c';
    ctx.fillRect(16, 10, 5, 3);
    ctx.fillRect(32, 12, 5, 3);

    return c;
  }

  private createRuinsTile(): HTMLCanvasElement {
    const c = document.createElement('canvas');
    c.width = TILE_SIZE;
    c.height = TILE_SIZE;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = '#4f4f59';
    ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);

    ctx.fillStyle = '#3a3a42';
    // Cobblestone grid
    ctx.strokeRect(1, 1, TILE_SIZE - 2, TILE_SIZE - 2);
    ctx.fillRect(6, 8, 16, 12);
    ctx.fillRect(26, 8, 16, 12);
    ctx.fillRect(6, 26, 16, 12);
    ctx.fillRect(26, 26, 16, 12);

    ctx.fillStyle = '#32593b'; // moss
    ctx.fillRect(12, 18, 4, 6);
    ctx.fillRect(28, 32, 6, 4);

    return c;
  }

  private createSnowTile(): HTMLCanvasElement {
    const c = document.createElement('canvas');
    c.width = TILE_SIZE;
    c.height = TILE_SIZE;
    const ctx = c.getContext('2d')!;
    // Crisp snowy white with soft icy powder tones
    ctx.fillStyle = '#e8f0fe';
    ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);

    // Frost blue shadow drifts
    ctx.fillStyle = '#cad9f0';
    ctx.fillRect(4, 8, 8, 4);
    ctx.fillRect(24, 20, 12, 5);
    ctx.fillRect(10, 34, 14, 4);

    // Sparkling crystalline flakes
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(8, 6, 2, 2);
    ctx.fillRect(28, 18, 2, 2);
    ctx.fillRect(14, 32, 2, 2);
    ctx.fillRect(38, 10, 2, 2);
    ctx.fillRect(34, 38, 2, 2);

    return c;
  }

  private createSavannaTile(): HTMLCanvasElement {
    const c = document.createElement('canvas');
    c.width = TILE_SIZE;
    c.height = TILE_SIZE;
    const ctx = c.getContext('2d')!;

    // Sun-baked golden amber savanna loam
    ctx.fillStyle = '#b59349';
    ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);

    // Warm ochre soil spots
    ctx.fillStyle = '#9e7d38';
    ctx.fillRect(4, 6, 8, 4);
    ctx.fillRect(28, 22, 10, 5);
    ctx.fillRect(14, 36, 6, 4);

    // Dry golden grass blades
    ctx.fillStyle = '#d4aa48';
    ctx.fillRect(8, 12, 2, 6);
    ctx.fillRect(10, 10, 2, 8);
    ctx.fillRect(24, 6, 2, 7);
    ctx.fillRect(36, 28, 2, 8);
    ctx.fillRect(38, 26, 2, 10);
    ctx.fillRect(16, 24, 2, 6);

    // Earth pebbles
    ctx.fillStyle = '#7a5e27';
    ctx.fillRect(22, 18, 3, 2);
    ctx.fillRect(6, 32, 2, 2);
    ctx.fillRect(40, 14, 2, 2);

    return c;
  }

  // --- Draw Tile Function ---
  public drawTile(ctx: CanvasRenderingContext2D, type: number, x: number, y: number, timeMs: number) {
    switch (type) {
      case TILE_TYPES.SAVANNA_GRASS:
        ctx.drawImage(this.savannaCanvas, x, y);
        break;
      case TILE_TYPES.GRASS: {
        const tileIdx = Math.abs(Math.floor(x / TILE_SIZE) * 31 + Math.floor(y / TILE_SIZE) * 17) % this.grassVariants.length;
        ctx.drawImage(this.grassVariants[tileIdx], x, y);
        break;
      }
      case TILE_TYPES.WATER:
      case TILE_TYPES.DEEP_WATER:
        ctx.drawImage(this.waterCanvas, x, y);
        // Animated wave glint
        const waveOffset = Math.sin(timeMs * 0.003 + x * 0.1) * 3;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.fillRect(x + 10 + waveOffset, y + 16, 12, 2);
        break;
      case TILE_TYPES.SAND:
        ctx.drawImage(this.sandCanvas, x, y);
        break;
      case TILE_TYPES.DIRT_PATH:
        ctx.drawImage(this.dirtCanvas, x, y);
        break;
      case TILE_TYPES.FARMLAND:
        ctx.fillStyle = '#4a2f13'; // rich moist soil
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = '#36210c';
        ctx.fillRect(x + 2, y + 6, TILE_SIZE - 4, 4);
        ctx.fillRect(x + 2, y + 18, TILE_SIZE - 4, 4);
        ctx.fillRect(x + 2, y + 30, TILE_SIZE - 4, 4);
        ctx.fillRect(x + 2, y + 42, TILE_SIZE - 4, 4);
        break;
      case TILE_TYPES.RUINS_FLOOR:
        ctx.drawImage(this.ruinsCanvas, x, y);
        break;
      case TILE_TYPES.WOOD_FLOOR:
        ctx.fillStyle = '#875d36';
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = '#634224';
        for (let i = 0; i < TILE_SIZE; i += 12) {
          ctx.fillRect(x, y + i, TILE_SIZE, 2);
        }
        break;
      case TILE_TYPES.STONE_GROUND:
        ctx.fillStyle = '#6b6b75';
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = '#52525c';
        ctx.fillRect(x + 4, y + 8, 12, 10);
        ctx.fillRect(x + 24, y + 26, 14, 10);
        break;
      case TILE_TYPES.SNOW_GROUND:
        ctx.drawImage(this.snowCanvas, x, y);
        break;
      case TILE_TYPES.CAVE_GROUND:
        ctx.fillStyle = '#161824';
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = '#232738';
        ctx.fillRect(x + 6, y + 8, 14, 8);
        ctx.fillRect(x + 26, y + 26, 14, 10);
        ctx.fillStyle = '#0f1018';
        ctx.fillRect(x + 16, y + 18, 6, 4);
        break;
      case TILE_TYPES.CAVE_WALL:
        ctx.fillStyle = '#0a0b10';
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = '#171926';
        ctx.fillRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
        ctx.fillStyle = '#2b2f42';
        ctx.fillRect(x + 6, y + 6, 14, 14);
        ctx.fillRect(x + 22, y + 22, 18, 16);
        break;
      default: {
        const tileIdx = Math.abs(Math.floor(x / TILE_SIZE) * 31 + Math.floor(y / TILE_SIZE) * 17) % this.grassVariants.length;
        ctx.drawImage(this.grassVariants[tileIdx], x, y);
      }
    }
  }

  // --- Draw Player Matching Attachment Art ---
  public drawPlayer(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    facing: Direction,
    isMoving: boolean,
    animFrame: number,
    isAttacking: boolean,
    swingProgress: number,
    equippedWeapon: string | null,
    hitFlash: number,
    isSwimming: boolean = false,
    isBoating: boolean = false,
    boatType: string | null = null
  ) {
    ctx.save();
    ctx.translate(x, y);

    // Boating hull under player
    if (isBoating) {
      ctx.save();
      const boatBob = Math.sin(animFrame * 5) * 2;
      ctx.translate(0, 10 + boatBob);

      // Foam wake ripples
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.beginPath();
      ctx.ellipse(0, 8, 26, 9, 0, 0, Math.PI * 2);
      ctx.fill();

      if (boatType === 'wood_boat') {
        // High quality sailboat
        ctx.fillStyle = '#5c3818';
        ctx.fillRect(-22, -6, 44, 14);
        ctx.fillStyle = '#784a22';
        ctx.fillRect(-20, -4, 40, 10);
        // Canvas Sail
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.moveTo(0, -32);
        ctx.lineTo(16, -10);
        ctx.lineTo(0, -10);
        ctx.fill();
        ctx.fillStyle = '#64748b'; // Mast
        ctx.fillRect(-1, -34, 2, 26);
      } else if (boatType === 'canoe') {
        // Sleek canoe
        ctx.fillStyle = '#7c4a27';
        ctx.beginPath();
        ctx.ellipse(0, 0, 24, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#9a5d32';
        ctx.beginPath();
        ctx.ellipse(0, 0, 20, 5, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Wooden Raft
        ctx.fillStyle = '#5c3a1d';
        ctx.fillRect(-18, -6, 36, 12);
        ctx.fillStyle = '#855227';
        ctx.fillRect(-16, -4, 32, 8);
        ctx.fillStyle = '#d4af37'; // Ropes
        ctx.fillRect(-12, -6, 2, 12);
        ctx.fillRect(10, -6, 2, 12);
      }
      ctx.restore();
    } else if (isSwimming) {
      // Water ripple rings around player
      const ripple = (Math.sin(animFrame * 8) + 1) * 3;
      ctx.strokeStyle = 'rgba(125, 211, 252, 0.7)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, 6, 16 + ripple, 6 + ripple * 0.4, 0, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      // Normal Ground Drop shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      ctx.ellipse(0, 18, 14, 6, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Hit flash white filter
    if (hitFlash > 0) {
      ctx.filter = 'brightness(2.5)';
    }

    // Walking & breathing animation bob
    const idleBob = isMoving ? 0 : Math.sin(animFrame * 4) * 0.8;
    const walkBob = (isMoving ? Math.sin(animFrame * 12) * 2 : 0) + idleBob;
    const legOffset = isMoving ? Math.sin(animFrame * 12) * 5 : 0;

    const flip = facing === 'left';
    if (flip) {
      ctx.scale(-1, 1);
    }

    // 1. Legs & Boots (Submerged when swimming)
    if (!isSwimming) {
      // Jeans with knee seam
      ctx.fillStyle = '#1e293b'; // Denim blue
      ctx.fillRect(-7, 6 + walkBob, 5, 8 + legOffset);
      ctx.fillRect(2, 6 + walkBob, 5, 8 - legOffset);
      ctx.fillStyle = '#334155'; // Knee crease
      ctx.fillRect(-7, 9 + walkBob + legOffset * 0.5, 5, 1.5);
      ctx.fillRect(2, 9 + walkBob - legOffset * 0.5, 5, 1.5);

      // Sturdy Leather Boots with soles
      ctx.fillStyle = '#451a03'; // Deep brown leather
      ctx.fillRect(-8, 13 + walkBob + legOffset, 6, 5);
      ctx.fillRect(2, 13 + walkBob - legOffset, 6, 5);
      ctx.fillStyle = '#1c1917'; // Rubber sole
      ctx.fillRect(-8, 17 + walkBob + legOffset, 6, 1.5);
      ctx.fillRect(2, 17 + walkBob - legOffset, 6, 1.5);
      ctx.fillStyle = '#d97706'; // Boot lace detail
      ctx.fillRect(-7, 14 + walkBob + legOffset, 4, 1);
      ctx.fillRect(3, 14 + walkBob - legOffset, 4, 1);
    }

    // 2. Torso: High-Quality Red Hoodie Jacket with Belt and Pouch
    // Main hoodie body
    ctx.fillStyle = '#dc2626'; // Vivid crimson red
    ctx.fillRect(-9, -8 + walkBob, 18, 15);
    // Darker shadow sides and folds
    ctx.fillStyle = '#991b1b';
    ctx.fillRect(-9, -8 + walkBob, 2, 15);
    ctx.fillRect(7, -8 + walkBob, 2, 15);
    ctx.fillRect(-9, 5 + walkBob, 18, 2);

    // Leather utility belt with brass buckle
    ctx.fillStyle = '#3e2312';
    ctx.fillRect(-9, 3 + walkBob, 18, 3);
    ctx.fillStyle = '#fbbf24'; // Brass buckle
    ctx.fillRect(-2, 3 + walkBob, 4, 3);
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(-1, 4 + walkBob, 2, 1);
    // Side survival pouch
    ctx.fillStyle = '#5c3818';
    ctx.fillRect(6, 4 + walkBob, 3, 4);

    // Dark grey undershirt notch
    ctx.fillStyle = '#1e1e24';
    ctx.fillRect(-3, -7 + walkBob, 6, 6);
    // Silver zipper pull
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(-0.5, -5 + walkBob, 1, 6);
    // White drawstrings
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-2, -2 + walkBob, 1, 5);
    ctx.fillRect(1, -2 + walkBob, 1, 5);

    // 3. Head & Face (Expressive anime aesthetic)
    ctx.fillStyle = '#ffd5b0'; // Warm skin tone
    ctx.fillRect(-7, -20 + walkBob, 14, 12);

    if (facing === 'up') {
      // Back of head - full spiky black anime hair with deep violet highlights
      ctx.fillStyle = '#18151c';
      ctx.fillRect(-8, -23 + walkBob, 16, 16);
      ctx.fillStyle = '#312e81';
      ctx.fillRect(-6, -21 + walkBob, 12, 4);
      ctx.fillStyle = '#4338ca';
      ctx.fillRect(-4, -19 + walkBob, 8, 2);
    } else {
      // Anime Eyes: Sapphire iris, dark pupil, dual reflection glints
      // Eye whites
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-5, -15 + walkBob, 4, 5);
      ctx.fillRect(1, -15 + walkBob, 4, 5);
      // Iris & pupil
      ctx.fillStyle = '#0284c7'; // Sapphire blue iris
      ctx.fillRect(-4, -15 + walkBob, 3, 4);
      ctx.fillRect(2, -15 + walkBob, 3, 4);
      ctx.fillStyle = '#0f172a'; // Pupil
      ctx.fillRect(-4, -14 + walkBob, 2, 3);
      ctx.fillRect(2, -14 + walkBob, 2, 3);
      // Specular reflections
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-3, -15 + walkBob, 1, 2);
      ctx.fillRect(3, -15 + walkBob, 1, 2);

      // Eyebrows
      ctx.fillStyle = '#18151c';
      ctx.fillRect(-5, -17 + walkBob, 4, 1.5);
      ctx.fillRect(1, -17 + walkBob, 4, 1.5);

      // Soft cheek blush
      ctx.fillStyle = 'rgba(248, 113, 113, 0.6)';
      ctx.fillRect(-6, -10 + walkBob, 3, 1.5);
      ctx.fillRect(3, -10 + walkBob, 3, 1.5);

      // Messy black anime hair with layered violet-slate sheen
      ctx.fillStyle = '#18151c';
      ctx.fillRect(-9, -24 + walkBob, 18, 7);
      ctx.fillRect(-9, -20 + walkBob, 4, 5);
      ctx.fillRect(-1, -19 + walkBob, 3, 4);
      ctx.fillRect(5, -20 + walkBob, 4, 5);
      ctx.fillRect(-8, -27 + walkBob, 6, 4);
      ctx.fillRect(1, -26 + walkBob, 7, 3);
      // Hair rim highlights
      ctx.fillStyle = '#3730a3';
      ctx.fillRect(-6, -25 + walkBob, 8, 2);
      ctx.fillRect(-7, -22 + walkBob, 3, 2);
    }

    // 4. Arms & Held Item / Weapon Swing Arc
    let weaponAngle = 0.2;
    if (isAttacking) {
      weaponAngle = -Math.PI * 0.35 + swingProgress * Math.PI * 0.95;
      // Glowing combat motion swoosh arc
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(6, -2 + walkBob, 28, -Math.PI * 0.4, weaponAngle);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(96, 165, 250, 0.35)';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(6, -2 + walkBob, 26, -Math.PI * 0.35, weaponAngle);
      ctx.stroke();
      ctx.restore();
    }

    ctx.save();
    ctx.translate(6, -2 + walkBob);
    ctx.rotate(weaponAngle);

    // Arm (red sleeve with shadow)
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(-2, -3, 6, 9);
    ctx.fillStyle = '#991b1b';
    ctx.fillRect(-2, 4, 6, 2);
    ctx.fillStyle = '#ffd5b0'; // Hand
    ctx.fillRect(0, 5, 4, 4);

    // Draw Held Weapon/Tool with Dedicated Sprites
    if (equippedWeapon) {
      if (equippedWeapon.includes('knife')) {
        // Knife handle
        ctx.fillStyle = '#5c3a21';
        ctx.fillRect(1, 2, 3, 6);
        // Blade
        ctx.fillStyle = equippedWeapon.includes('iron') ? '#cbd5e1' : equippedWeapon.includes('bone') ? '#fef08a' : '#94a3b8';
        ctx.fillRect(1, -10, 3, 12);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(3, -10, 1, 12);
      } else if (equippedWeapon.includes('saw')) {
        // D-handle
        ctx.fillStyle = '#8f5d34';
        ctx.fillRect(0, 2, 6, 7);
        // Blade
        ctx.fillStyle = equippedWeapon.includes('iron') ? '#94a3b8' : '#64748b';
        ctx.fillRect(1, -16, 5, 18);
        ctx.fillStyle = '#ffffff';
        for (let t = -14; t < 0; t += 3) {
          ctx.fillRect(6, t, 2, 2);
        }
      } else if (equippedWeapon.includes('hammer')) {
        // Handle
        ctx.fillStyle = '#8f5d34';
        ctx.fillRect(2, -10, 3, 22);
        // Mallet Head
        ctx.fillStyle = equippedWeapon.includes('iron') ? '#334155' : equippedWeapon.includes('stone') ? '#78716c' : '#a16207';
        ctx.fillRect(-4, -16, 14, 8);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-4, -16, 2, 8);
      } else if (equippedWeapon.includes('spear')) {
        // Long shaft
        ctx.fillStyle = '#8f5d34';
        ctx.fillRect(2, -24, 3, 36);
        // Spearhead
        ctx.fillStyle = equippedWeapon.includes('iron') ? '#93c5fd' : equippedWeapon.includes('flint') ? '#e2e8f0' : '#d97706';
        ctx.fillRect(1, -32, 5, 8);
        ctx.fillRect(2, -35, 3, 3);
      } else if (equippedWeapon.includes('axe')) {
        // Wooden handle
        ctx.fillStyle = '#8f5d34';
        ctx.fillRect(2, -14, 3, 26);
        // Axe Blade (Copper, Iron or Stone)
        ctx.fillStyle = equippedWeapon.includes('copper') ? '#ea580c' : equippedWeapon.includes('iron') ? '#9ec7d9' : '#8a8f94';
        ctx.fillRect(5, -16, 9, 8);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(13, -16, 2, 8);
      } else if (equippedWeapon.includes('pickaxe')) {
        ctx.fillStyle = '#8f5d34';
        ctx.fillRect(2, -14, 3, 26);
        ctx.fillStyle = equippedWeapon.includes('copper') ? '#ea580c' : equippedWeapon.includes('iron') ? '#9ec7d9' : '#8a8f94';
        ctx.fillRect(-4, -16, 16, 4);
      } else if (equippedWeapon.includes('sword') || equippedWeapon.includes('club')) {
        if (equippedWeapon.includes('club')) {
          ctx.fillStyle = '#78350f';
          ctx.fillRect(1, -18, 6, 26);
        } else {
          // Hilt
          ctx.fillStyle = equippedWeapon.includes('gold') ? '#f59e0b' : '#d4af37';
          ctx.fillRect(-2, 3, 9, 3);
          ctx.fillStyle = '#5c3a21';
          ctx.fillRect(1, 6, 3, 5);
          // Blade
          ctx.fillStyle = equippedWeapon.includes('gold') ? '#fbbf24' : equippedWeapon.includes('iron') ? '#b8d8e8' : '#a8b0b5';
          ctx.fillRect(1, -22, 4, 25);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(2, -22, 1, 23);
        }
      } else if (equippedWeapon.includes('torch')) {
        ctx.fillStyle = '#734b26';
        ctx.fillRect(2, -10, 3, 20);
        ctx.fillStyle = '#ff9900';
        ctx.fillRect(0, -16, 7, 7);
        ctx.fillStyle = '#ffff33';
        ctx.fillRect(2, -14, 3, 4);
      } else if (equippedWeapon.includes('bow')) {
        ctx.strokeStyle = '#8f5d34';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(2, 0, 14, -Math.PI * 0.4, Math.PI * 0.4);
        ctx.stroke();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(11, -10);
        ctx.lineTo(11, 10);
        ctx.stroke();
      }
    }
    ctx.restore();

    ctx.restore();
  }

  // --- Draw Natural Resources ---
  public drawResource(ctx: CanvasRenderingContext2D, res: any, timeMs: number) {
    const { x, y, type, hitFlash } = res;
    ctx.save();
    ctx.translate(x, y);

    if (res.scale && res.scale !== 1) {
      ctx.scale(res.scale, res.scale);
    }

    if (hitFlash > 0) {
      ctx.filter = 'brightness(2.2)';
    }

    if (type === 'tree' || type === 'oak_tree') {
      // Firmly Rooted Sturdy Oak Tree (Ground-anchored with zero floating gap)
      // 1. Ground contact shadow & roots
      ctx.fillStyle = 'rgba(0,0,0,0.34)';
      ctx.beginPath();
      ctx.ellipse(0, 18, 24, 9, 0, 0, Math.PI * 2);
      ctx.fill();

      // Root flares anchored to the earth
      ctx.fillStyle = '#361e0c';
      ctx.beginPath();
      ctx.moveTo(-12, 18);
      ctx.lineTo(-4, 4);
      ctx.lineTo(4, 4);
      ctx.lineTo(12, 18);
      ctx.closePath();
      ctx.fill();

      // 2. Trunk continuing straight up into the foliage canopy (y=18 up to y=-24)
      ctx.fillStyle = '#4a2b13';
      ctx.fillRect(-7, -24, 14, 40);
      ctx.fillStyle = '#663c1c';
      ctx.fillRect(-5, -22, 10, 38);
      ctx.fillStyle = '#7d4c26'; // Bark highlight
      ctx.fillRect(-2, -20, 4, 34);

      // 3. Heavy structural branches connecting trunk to foliage clusters
      ctx.strokeStyle = '#4a2b13';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, -10);
      ctx.lineTo(-14, -22);
      ctx.moveTo(0, -8);
      ctx.lineTo(14, -20);
      ctx.moveTo(0, -18);
      ctx.lineTo(-10, -32);
      ctx.moveTo(0, -18);
      ctx.lineTo(10, -30);
      ctx.stroke();

      // 4. Canopy Foliage - overlapping well below the top of the trunk (no floating gap)
      const sway = Math.sin(timeMs * 0.002 + x * 0.05) * 2;

      // Dark undergrowth / shadow canopy
      ctx.fillStyle = '#1c4714';
      ctx.beginPath();
      ctx.arc(-14 + sway, -20, 16, 0, Math.PI * 2);
      ctx.arc(14 + sway, -18, 16, 0, Math.PI * 2);
      ctx.arc(-16 + sway, -32, 18, 0, Math.PI * 2);
      ctx.arc(16 + sway, -30, 18, 0, Math.PI * 2);
      ctx.arc(sway, -38, 22, 0, Math.PI * 2);
      ctx.fill();

      // Main lush green foliage
      ctx.fillStyle = '#2c731f';
      ctx.beginPath();
      ctx.arc(-12 + sway, -22, 14, 0, Math.PI * 2);
      ctx.arc(12 + sway, -20, 14, 0, Math.PI * 2);
      ctx.arc(-14 + sway, -34, 16, 0, Math.PI * 2);
      ctx.arc(14 + sway, -32, 16, 0, Math.PI * 2);
      ctx.arc(sway, -40, 20, 0, Math.PI * 2);
      ctx.fill();

      // Sunlit leaf highlights
      ctx.fillStyle = '#489e34';
      ctx.beginPath();
      ctx.arc(-14 + sway, -38, 11, 0, Math.PI * 2);
      ctx.arc(4 + sway, -44, 13, 0, Math.PI * 2);
      ctx.arc(10 + sway, -36, 10, 0, Math.PI * 2);
      ctx.fill();

      // Bright tips
      ctx.fillStyle = '#6bc44b';
      ctx.fillRect(-6 + sway, -52, 12, 5);
      ctx.fillRect(-18 + sway, -44, 6, 4);
      ctx.fillRect(10 + sway, -40, 6, 4);

      // Red apples peeking through
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(-10 + sway, -26, 3, 0, Math.PI * 2);
      ctx.arc(12 + sway, -24, 3, 0, Math.PI * 2);
      ctx.arc(2 + sway, -34, 3, 0, Math.PI * 2);
      ctx.fill();

    } else if (type === 'birch_tree') {
      // Elegant White Birch Tree
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.ellipse(0, 17, 20, 7, 0, 0, Math.PI * 2);
      ctx.fill();

      // White Trunk with black horizontal lenticels
      ctx.fillStyle = '#e5e7eb';
      ctx.fillRect(-5, -24, 10, 40);
      ctx.fillStyle = '#f9fafb';
      ctx.fillRect(-3, -22, 4, 36);
      // Black notches
      ctx.fillStyle = '#1f2937';
      ctx.fillRect(-5, 8, 4, 2);
      ctx.fillRect(1, 2, 4, 2);
      ctx.fillRect(-5, -6, 5, 2);
      ctx.fillRect(0, -14, 5, 2);
      ctx.fillRect(-5, -20, 3, 2);

      // Connecting branches
      ctx.strokeStyle = '#374151';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, -10);
      ctx.lineTo(-12, -22);
      ctx.moveTo(0, -12);
      ctx.lineTo(12, -20);
      ctx.stroke();

      const sway = Math.sin(timeMs * 0.0025 + x * 0.06) * 2;

      // Bright fresh yellow-green foliage
      ctx.fillStyle = '#3f7823';
      ctx.beginPath();
      ctx.arc(-10 + sway, -26, 14, 0, Math.PI * 2);
      ctx.arc(10 + sway, -24, 14, 0, Math.PI * 2);
      ctx.arc(sway, -36, 18, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#5fb334';
      ctx.beginPath();
      ctx.arc(-8 + sway, -28, 12, 0, Math.PI * 2);
      ctx.arc(8 + sway, -26, 12, 0, Math.PI * 2);
      ctx.arc(sway, -38, 16, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#8ce04a';
      ctx.beginPath();
      ctx.arc(-6 + sway, -34, 8, 0, Math.PI * 2);
      ctx.arc(4 + sway, -42, 10, 0, Math.PI * 2);
      ctx.fill();

    } else if (type === 'pine_tree') {
      // Sturdy Evergreen Pine / Spruce
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.ellipse(0, 17, 18, 7, 0, 0, Math.PI * 2);
      ctx.fill();

      // Deep anchored trunk
      ctx.fillStyle = '#3d2511';
      ctx.fillRect(-5, -16, 10, 33);

      const sway = Math.sin(timeMs * 0.002 + x * 0.05) * 1.5;

      // Tier 1 (Bottom)
      ctx.fillStyle = '#143818';
      ctx.beginPath();
      ctx.moveTo(sway, -24);
      ctx.lineTo(20 + sway, -4);
      ctx.lineTo(-20 + sway, -4);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#205926';
      ctx.beginPath();
      ctx.moveTo(sway, -24);
      ctx.lineTo(16 + sway, -8);
      ctx.lineTo(-16 + sway, -8);
      ctx.closePath();
      ctx.fill();

      // Tier 2 (Middle)
      ctx.fillStyle = '#18451d';
      ctx.beginPath();
      ctx.moveTo(sway, -36);
      ctx.lineTo(16 + sway, -18);
      ctx.lineTo(-16 + sway, -18);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#286e30';
      ctx.beginPath();
      ctx.moveTo(sway, -36);
      ctx.lineTo(13 + sway, -22);
      ctx.lineTo(-13 + sway, -22);
      ctx.closePath();
      ctx.fill();

      // Tier 3 (Top)
      ctx.fillStyle = '#1f5424';
      ctx.beginPath();
      ctx.moveTo(sway, -48);
      ctx.lineTo(12 + sway, -32);
      ctx.lineTo(-12 + sway, -32);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#37873f';
      ctx.beginPath();
      ctx.moveTo(sway, -48);
      ctx.lineTo(8 + sway, -36);
      ctx.lineTo(-8 + sway, -36);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#52b05b';
      ctx.fillRect(-1 + sway, -48, 2, 4);

    } else if (type === 'snowy_pine') {
      // Snow-capped Pine Tree (Snow Biome)
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.ellipse(0, 17, 18, 7, 0, 0, Math.PI * 2);
      ctx.fill();

      // Trunk
      ctx.fillStyle = '#332014';
      ctx.fillRect(-5, -16, 10, 33);

      const sway = Math.sin(timeMs * 0.002 + x * 0.05) * 1.5;

      // Tier 1 (Bottom)
      ctx.fillStyle = '#123018';
      ctx.beginPath();
      ctx.moveTo(sway, -24);
      ctx.lineTo(20 + sway, -4);
      ctx.lineTo(-20 + sway, -4);
      ctx.closePath();
      ctx.fill();
      // Snow Cap Tier 1
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.moveTo(-18 + sway, -4);
      ctx.lineTo(18 + sway, -4);
      ctx.lineTo(12 + sway, -10);
      ctx.lineTo(-12 + sway, -10);
      ctx.closePath();
      ctx.fill();

      // Tier 2 (Middle)
      ctx.fillStyle = '#173d1f';
      ctx.beginPath();
      ctx.moveTo(sway, -36);
      ctx.lineTo(16 + sway, -18);
      ctx.lineTo(-16 + sway, -18);
      ctx.closePath();
      ctx.fill();
      // Snow Cap Tier 2
      ctx.fillStyle = '#f1f5f9';
      ctx.beginPath();
      ctx.moveTo(-14 + sway, -18);
      ctx.lineTo(14 + sway, -18);
      ctx.lineTo(9 + sway, -24);
      ctx.lineTo(-9 + sway, -24);
      ctx.closePath();
      ctx.fill();

      // Tier 3 (Top)
      ctx.fillStyle = '#1f4d27';
      ctx.beginPath();
      ctx.moveTo(sway, -48);
      ctx.lineTo(12 + sway, -32);
      ctx.lineTo(-12 + sway, -32);
      ctx.closePath();
      ctx.fill();
      // Snow Crown
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(sway, -50);
      ctx.lineTo(10 + sway, -33);
      ctx.lineTo(-10 + sway, -33);
      ctx.closePath();
      ctx.fill();

    } else if (type === 'willow_tree') {
      // Ancient Weeping Willow
      ctx.fillStyle = 'rgba(0,0,0,0.32)';
      ctx.beginPath();
      ctx.ellipse(0, 18, 26, 9, 0, 0, Math.PI * 2);
      ctx.fill();

      // Gnarled wide trunk
      ctx.fillStyle = '#3a200f';
      ctx.fillRect(-8, -20, 16, 38);
      ctx.fillStyle = '#543017';
      ctx.fillRect(-6, -18, 12, 34);

      const sway = Math.sin(timeMs * 0.0018 + x * 0.05) * 2.5;

      // Broad canopy
      ctx.fillStyle = '#235921';
      ctx.beginPath();
      ctx.arc(sway, -34, 26, 0, Math.PI * 2);
      ctx.arc(-16 + sway, -28, 18, 0, Math.PI * 2);
      ctx.arc(16 + sway, -28, 18, 0, Math.PI * 2);
      ctx.fill();

      // Weeping vines draping down towards the earth
      ctx.strokeStyle = '#3a8736';
      ctx.lineWidth = 3;
      for (let i = -20; i <= 20; i += 8) {
        const vineSway = Math.sin(timeMs * 0.003 + i) * 3;
        ctx.beginPath();
        ctx.moveTo(i + sway, -20);
        ctx.quadraticCurveTo(i + vineSway, -4, i + sway * 0.5, 8);
        ctx.stroke();
      }

    } else if (type === 'rock') {
      // Stone Boulder
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.ellipse(0, 10, 18, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#737380';
      ctx.beginPath();
      ctx.arc(0, 0, 16, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#8c8c9c';
      ctx.beginPath();
      ctx.arc(-4, -4, 10, 0, Math.PI * 2);
      ctx.fill();

      // Cracks
      ctx.strokeStyle = '#474752';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-6, -2);
      ctx.lineTo(2, 6);
      ctx.lineTo(8, 2);
      ctx.stroke();

    } else if (type === 'diamond_ore') {
      // Sparkling Diamond Ore
      ctx.fillStyle = 'rgba(0,0,0,0.32)';
      ctx.beginPath();
      ctx.ellipse(0, 10, 19, 7, 0, 0, Math.PI * 2);
      ctx.fill();

      // Dark crystalline bedrock
      ctx.fillStyle = '#374151';
      ctx.beginPath();
      ctx.arc(0, 0, 16, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#4b5563';
      ctx.beginPath();
      ctx.arc(-3, -3, 11, 0, Math.PI * 2);
      ctx.fill();

      // Radiant Cyan Diamonds with glint
      ctx.fillStyle = '#0ea5e9';
      ctx.fillRect(-7, -7, 6, 6);
      ctx.fillRect(3, 1, 7, 7);
      ctx.fillRect(-2, 5, 5, 5);

      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(-6, -6, 4, 4);
      ctx.fillRect(4, 2, 5, 5);

      // Star sparkle glints
      const sparkle = Math.sin(timeMs * 0.006 + x * 0.1);
      if (sparkle > 0.3) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-5, -5, 2, 2);
        ctx.fillRect(6, 3, 2, 2);
      }

    } else if (type === 'iron_ore') {
      // Iron Ore boulder
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.ellipse(0, 10, 18, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#5c5450';
      ctx.beginPath();
      ctx.arc(0, 0, 16, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#d48b4f';
      ctx.fillRect(-6, -6, 6, 5);
      ctx.fillRect(3, 2, 7, 5);
      ctx.fillStyle = '#ffcf9e';
      ctx.fillRect(-4, -4, 3, 2);

    } else if (type === 'gold_ore') {
      // Gold ore
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.ellipse(0, 10, 18, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#4a4440';
      ctx.beginPath();
      ctx.arc(0, 0, 16, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffcc00';
      ctx.fillRect(-8, -4, 5, 5);
      ctx.fillRect(2, -8, 6, 6);
      ctx.fillRect(4, 4, 5, 5);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(3, -7, 2, 2);

    } else if (type === 'berry_bush') {
      // Berry Bush
      ctx.fillStyle = '#266122';
      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#398233';
      ctx.beginPath();
      ctx.arc(-3, -3, 9, 0, Math.PI * 2);
      ctx.fill();

      // Red berries
      ctx.fillStyle = '#d92323';
      ctx.beginPath();
      ctx.arc(-6, -2, 3, 0, Math.PI * 2);
      ctx.arc(4, -5, 3, 0, Math.PI * 2);
      ctx.arc(5, 5, 3, 0, Math.PI * 2);
      ctx.arc(-2, 6, 3, 0, Math.PI * 2);
      ctx.fill();

    } else if (type === 'flowering_bush') {
      // Flowering Wild Bush
      ctx.fillStyle = '#235921';
      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#3b8a37';
      ctx.beginPath();
      ctx.arc(-3, -3, 10, 0, Math.PI * 2);
      ctx.fill();

      // Colorful flowers (yellow, pink, purple)
      ctx.fillStyle = '#facc15';
      ctx.fillRect(-6, -4, 3, 3);
      ctx.fillStyle = '#ec4899';
      ctx.fillRect(4, -6, 3, 3);
      ctx.fillStyle = '#a855f7';
      ctx.fillRect(3, 4, 3, 3);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-3, 5, 3, 3);

    } else if (type === 'wild_shrub') {
      // Wild leafy shrub
      ctx.fillStyle = '#2f5926';
      ctx.beginPath();
      ctx.arc(0, 0, 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#4c8c3e';
      ctx.beginPath();
      ctx.arc(-2, -2, 8, 0, Math.PI * 2);
      ctx.fill();
      // Little twigs
      ctx.strokeStyle = '#4a2f14';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-4, 4);
      ctx.lineTo(-8, 8);
      ctx.moveTo(3, 3);
      ctx.lineTo(7, 7);
      ctx.stroke();

    } else if (type === 'fallen_log') {
      // Fallen wood log
      ctx.fillStyle = '#613e1f';
      ctx.fillRect(-18, -6, 36, 12);
      ctx.fillStyle = '#8f6137';
      ctx.fillRect(-16, -4, 32, 8);
      ctx.fillStyle = '#d4aa79';
      ctx.beginPath();
      ctx.ellipse(-18, 0, 4, 6, 0, 0, Math.PI * 2);
      ctx.fill();

    } else if (type === 'medicinal_plant') {
      // Herb
      ctx.fillStyle = '#39a84d';
      ctx.fillRect(-2, -6, 4, 12);
      ctx.fillRect(-8, -2, 16, 3);
      ctx.fillStyle = '#b844d6';
      ctx.beginPath();
      ctx.arc(0, -8, 4, 0, Math.PI * 2);
      ctx.fill();

    } else if (type === 'loose_branch') {
      ctx.fillStyle = '#5c3818';
      ctx.save();
      ctx.rotate(0.35);
      ctx.fillRect(-10, -2, 20, 4);
      ctx.fillRect(-2, -6, 3, 5);
      ctx.fillStyle = '#458f32';
      ctx.fillRect(0, -7, 3, 3);
      ctx.restore();

    } else if (type === 'loose_stone') {
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.beginPath();
      ctx.ellipse(0, 3, 8, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#787882';
      ctx.beginPath();
      ctx.ellipse(0, 0, 7, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#a1a1ad';
      ctx.fillRect(-2, -2, 3, 2);

    } else if (type === 'copper_ore') {
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.ellipse(0, 10, 18, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#4a4440';
      ctx.beginPath();
      ctx.arc(0, 0, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ea580c';
      ctx.fillRect(-6, -6, 7, 5);
      ctx.fillRect(2, 2, 8, 6);
      ctx.fillStyle = '#fdba74';
      ctx.fillRect(-4, -4, 3, 2);

    } else if (type === 'clay_deposit') {
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.beginPath();
      ctx.ellipse(0, 8, 16, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.ellipse(0, 0, 14, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.ellipse(-3, -2, 8, 6, 0, 0, Math.PI * 2);
      ctx.fill();

    } else if (type === 'sand_pile') {
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.beginPath();
      ctx.ellipse(0, 6, 14, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ca8a04';
      ctx.beginPath();
      ctx.ellipse(0, 0, 12, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.ellipse(-2, -2, 7, 5, 0, 0, Math.PI * 2);
      ctx.fill();

    } else if (type === 'acacia_tree') {
      // African Savanna Umbrella Acacia Tree
      // Ground shadow
      ctx.fillStyle = 'rgba(0,0,0,0.32)';
      ctx.beginPath();
      ctx.ellipse(0, 16, 26, 9, 0, 0, Math.PI * 2);
      ctx.fill();

      // Slender reddish-brown bent trunk
      ctx.fillStyle = '#3d200e';
      ctx.beginPath();
      ctx.moveTo(-6, 16);
      ctx.quadraticCurveTo(-2, 0, -4, -14);
      ctx.lineTo(4, -14);
      ctx.quadraticCurveTo(6, 0, 8, 16);
      ctx.closePath();
      ctx.fill();

      // Large spreading umbrella branches
      ctx.strokeStyle = '#4a2813';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, -14);
      ctx.lineTo(-24, -28);
      ctx.moveTo(0, -14);
      ctx.lineTo(24, -26);
      ctx.moveTo(0, -14);
      ctx.lineTo(0, -32);
      ctx.stroke();

      // Sprawling flat-topped acacia canopy foliage
      ctx.fillStyle = '#4d7328';
      ctx.beginPath();
      ctx.ellipse(-14, -30, 20, 9, 0, 0, Math.PI * 2);
      ctx.ellipse(14, -29, 22, 9, 0, 0, Math.PI * 2);
      ctx.ellipse(0, -35, 26, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      // Sunlit golden-green foliage highlights
      ctx.fillStyle = '#729e34';
      ctx.beginPath();
      ctx.ellipse(-12, -32, 16, 6, 0, 0, Math.PI * 2);
      ctx.ellipse(12, -31, 17, 6, 0, 0, Math.PI * 2);
      ctx.ellipse(0, -37, 20, 6, 0, 0, Math.PI * 2);
      ctx.fill();

    } else if (type === 'cactus') {
      // Desert Saguaro Cactus with arms & pink flower
      // Ground shadow
      ctx.fillStyle = 'rgba(0,0,0,0.28)';
      ctx.beginPath();
      ctx.ellipse(0, 14, 14, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Main trunk
      ctx.fillStyle = '#216327';
      ctx.beginPath();
      ctx.roundRect(-7, -24, 14, 38, [6, 6, 2, 2]);
      ctx.fill();

      // Left arm
      ctx.fillStyle = '#216327';
      ctx.beginPath();
      ctx.roundRect(-18, -14, 13, 6, [2, 2, 2, 2]);
      ctx.roundRect(-18, -26, 6, 14, [4, 4, 2, 2]);
      ctx.fill();

      // Right arm
      ctx.fillStyle = '#28732f';
      ctx.beginPath();
      ctx.roundRect(5, -8, 13, 6, [2, 2, 2, 2]);
      ctx.roundRect(12, -20, 6, 14, [4, 4, 2, 2]);
      ctx.fill();

      // Vertical spine ridges
      ctx.fillStyle = '#164d1c';
      ctx.fillRect(-3, -22, 1.5, 34);
      ctx.fillRect(2, -22, 1.5, 34);
      ctx.fillRect(-16, -24, 1.5, 10);
      ctx.fillRect(14, -18, 1.5, 10);

      // White prickly spines
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-8, -18, 1.5, 1.5);
      ctx.fillRect(-8, -8, 1.5, 1.5);
      ctx.fillRect(7, -14, 1.5, 1.5);
      ctx.fillRect(7, -4, 1.5, 1.5);

      // Pink Desert Cactus Blossom on top
      ctx.fillStyle = '#ec4899';
      ctx.beginPath();
      ctx.arc(0, -26, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fde047';
      ctx.fillRect(-1, -27, 2, 2);

    } else if (type === 'cave_crystal') {
      // Glowing amethyst/cyan cave crystal cluster
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.ellipse(0, 8, 14, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      const pulse = Math.sin(timeMs * 0.005) * 3;
      // Ambient glow
      ctx.fillStyle = 'rgba(168, 85, 247, 0.25)';
      ctx.beginPath();
      ctx.arc(0, -6, 16 + pulse, 0, Math.PI * 2);
      ctx.fill();

      // Sharp crystal spikes
      ctx.fillStyle = '#7e22ce';
      ctx.beginPath();
      ctx.moveTo(-10, 4);
      ctx.lineTo(-4, -18);
      ctx.lineTo(2, 4);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#a855f7';
      ctx.beginPath();
      ctx.moveTo(-2, 4);
      ctx.lineTo(6, -24);
      ctx.lineTo(12, 4);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#c084fc';
      ctx.beginPath();
      ctx.moveTo(-6, 4);
      ctx.lineTo(0, -14);
      ctx.lineTo(6, 4);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(4, -18, 2, 8);
      ctx.fillRect(-3, -12, 2, 4);

    } else if (type === 'stalagmite') {
      // Pointed rocky cave stalagmite
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.beginPath();
      ctx.ellipse(0, 8, 16, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#2b2d42';
      ctx.beginPath();
      ctx.moveTo(-14, 8);
      ctx.lineTo(0, -22);
      ctx.lineTo(14, 8);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#4a4e69';
      ctx.beginPath();
      ctx.moveTo(-6, 8);
      ctx.lineTo(0, -20);
      ctx.lineTo(10, 8);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#8d99ae';
      ctx.fillRect(-2, -14, 4, 16);
    }

    ctx.restore();
  }

  // --- Draw Base Structures (Matching Reference Image) ---
  public drawStructure(ctx: CanvasRenderingContext2D, s: any, timeMs: number) {
    const { x, y, type, isOpen, lit, cropStage } = s;
    ctx.save();
    ctx.translate(x, y);

    if (type === 'wood_wall' || type === 'cabin_wall') {
      // Wooden Log Wall
      ctx.fillStyle = '#613f1e';
      ctx.fillRect(-24, -24, 48, 48);
      ctx.fillStyle = '#7d5228';
      ctx.fillRect(-22, -22, 44, 44);
      // Horizontal logs with nails
      ctx.fillStyle = '#4a2f14';
      ctx.fillRect(-24, -10, 48, 3);
      ctx.fillRect(-24, 6, 48, 3);
      ctx.fillStyle = '#1c1c1c';
      ctx.fillRect(-18, -6, 2, 2);
      ctx.fillRect(18, -6, 2, 2);
      ctx.fillRect(-18, 10, 2, 2);
      ctx.fillRect(18, 10, 2, 2);
    } else if (type === 'wood_door') {
      if (isOpen) {
        // Open door frame
        ctx.fillStyle = '#4a2f14';
        ctx.fillRect(-24, -24, 6, 48);
        ctx.fillRect(18, -24, 6, 48);
        ctx.fillStyle = '#6b4522';
        ctx.fillRect(-24, -24, 48, 6);
      } else {
        // Closed solid door with iron handle
        ctx.fillStyle = '#734b26';
        ctx.fillRect(-22, -24, 44, 48);
        ctx.fillStyle = '#573619';
        ctx.fillRect(-18, -20, 36, 40);
        // Iron handle
        ctx.fillStyle = '#e0a92f'; // gold/brass knob
        ctx.fillRect(10, -2, 4, 6);
      }
    } else if (type === 'fence') {
      // Wooden fence posts & crossbars
      ctx.fillStyle = '#754b24';
      ctx.fillRect(-22, -18, 6, 36);
      ctx.fillRect(16, -18, 6, 36);
      // Crossbars
      ctx.fillStyle = '#8c5d31';
      ctx.fillRect(-24, -10, 48, 5);
      ctx.fillRect(-24, 6, 48, 5);
    } else if (type === 'campfire' || type === 'campfire_item') {
      // Warm ambient radial glow under the campfire
      const pulse = Math.sin(timeMs * 0.012) * 2;
      const groundGlow = ctx.createRadialGradient(0, 4, 4, 0, 4, 30 + pulse);
      groundGlow.addColorStop(0, 'rgba(249, 115, 22, 0.45)');
      groundGlow.addColorStop(0.5, 'rgba(234, 88, 12, 0.2)');
      groundGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = groundGlow;
      ctx.beginPath();
      ctx.arc(0, 4, 30 + pulse, 0, Math.PI * 2);
      ctx.fill();

      // Stone ring with 8 textured chiseled river stones
      for (let i = 0; i < 8; i++) {
        const ang = (i / 8) * Math.PI * 2;
        const sx = Math.cos(ang) * 15;
        const sy = Math.sin(ang) * 12 + 4;
        ctx.fillStyle = i % 2 === 0 ? '#3f3f46' : '#52525b';
        ctx.beginPath();
        ctx.arc(sx, sy, 5.5, 0, Math.PI * 2);
        ctx.fill();
        // Stone bevel highlight
        ctx.fillStyle = '#71717a';
        ctx.fillRect(sx - 2, sy - 4, 3, 2);
      }

      // Hot embers and glowing coals bed
      ctx.fillStyle = '#1c1917';
      ctx.beginPath();
      ctx.ellipse(0, 4, 11, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#7f1d1d';
      ctx.beginPath();
      ctx.ellipse(0, 4, 9, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Charred crossed logs
      ctx.fillStyle = '#291b12';
      ctx.save();
      ctx.rotate(0.35);
      ctx.fillRect(-12, -3 + 2, 24, 6);
      ctx.fillStyle = '#452918';
      ctx.fillRect(-10, -2 + 2, 20, 3);
      ctx.restore();

      ctx.save();
      ctx.rotate(-0.4);
      ctx.fillStyle = '#291b12';
      ctx.fillRect(-12, -3 + 4, 24, 6);
      ctx.fillStyle = '#452918';
      ctx.fillRect(-10, -2 + 4, 20, 3);
      ctx.restore();

      // Procedural 3-tier leaping animated flames
      const f1 = Math.sin(timeMs * 0.015) * 2;
      const f2 = Math.cos(timeMs * 0.022) * 2.5;
      const f3 = Math.sin(timeMs * 0.03 + 1.2) * 1.5;

      // Outer Crimson Flame
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.moveTo(-10, 5);
      ctx.quadraticCurveTo(-12 + f1, -6, f1 * 1.5, -18 + f2);
      ctx.quadraticCurveTo(12 + f2, -6, 10, 5);
      ctx.closePath();
      ctx.fill();

      // Mid Vibrant Orange Flame
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.moveTo(-7, 4);
      ctx.quadraticCurveTo(-8 + f2, -4, f2, -14 + f1);
      ctx.quadraticCurveTo(8 + f1, -4, 7, 4);
      ctx.closePath();
      ctx.fill();

      // Inner Blazing Yellow Flame
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.moveTo(-4, 3);
      ctx.quadraticCurveTo(-4 + f3, -2, f3, -9 + f2 * 0.5);
      ctx.quadraticCurveTo(4 + f3, -2, 4, 3);
      ctx.closePath();
      ctx.fill();

      // White-hot core
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(f3 * 0.5, 0, 2.5, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Rising spark particles drifting upward
      const spark1Y = ((timeMs * 0.04) % 24);
      const spark1X = Math.sin(timeMs * 0.008) * 6;
      ctx.fillStyle = '#facc15';
      ctx.fillRect(spark1X - 1, -12 - spark1Y, 2, 2);

      const spark2Y = ((timeMs * 0.035 + 12) % 24);
      const spark2X = Math.cos(timeMs * 0.009) * 8;
      ctx.fillStyle = '#fb923c';
      ctx.fillRect(spark2X - 1, -10 - spark2Y, 1.5, 1.5);
    } else if (type === 'chest' || type === 'chest_item') {
      // Storage Chest
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.ellipse(0, 14, 18, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Wood chest body
      ctx.fillStyle = '#73461e';
      ctx.fillRect(-18, -12, 36, 24);
      ctx.fillStyle = '#8a5729';
      ctx.fillRect(-16, -10, 32, 20);

      // Iron corner brackets
      ctx.fillStyle = '#2b2b33';
      ctx.fillRect(-18, -12, 5, 24);
      ctx.fillRect(13, -12, 5, 24);
      ctx.fillRect(-18, -3, 36, 4);

      // Gold latch
      ctx.fillStyle = '#ffcc00';
      ctx.fillRect(-3, -4, 6, 7);
    } else if (type === 'bed' || type === 'bed_item') {
      // Bed with red blanket and white pillow
      ctx.fillStyle = '#59381c'; // frame
      ctx.fillRect(-16, -24, 32, 48);
      // Mattress & Red Blanket (Matching reference image)
      ctx.fillStyle = '#a82020';
      ctx.fillRect(-14, -8, 28, 30);
      // Folded white sheet
      ctx.fillStyle = '#e8e8e8';
      ctx.fillRect(-14, -12, 28, 5);
      // Pillow
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-12, -22, 24, 9);
    } else if (type === 'furnace' || type === 'furnace_item') {
      // Stone Furnace
      ctx.fillStyle = '#4f4f57';
      ctx.fillRect(-18, -22, 36, 42);
      ctx.fillStyle = '#6e6e78';
      ctx.fillRect(-15, -19, 30, 36);

      // Firebox opening
      ctx.fillStyle = '#1c1b1a';
      ctx.fillRect(-10, 0, 20, 16);
      // Glowing embers
      const emberGlow = Math.sin(timeMs * 0.01) * 2;
      ctx.fillStyle = '#ff5500';
      ctx.fillRect(-8, 3, 16, 11);
      ctx.fillStyle = '#ffcc00';
      ctx.fillRect(-5, 6, 10, 6 + emberGlow);
    } else if (type === 'well') {
      // Stone water well
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.ellipse(0, 16, 22, 7, 0, 0, Math.PI * 2);
      ctx.fill();

      // Stone ring
      ctx.fillStyle = '#5c5c6b';
      ctx.beginPath();
      ctx.arc(0, 0, 18, 0, Math.PI * 2);
      ctx.fill();

      // Inner water
      ctx.fillStyle = '#1e4873';
      ctx.beginPath();
      ctx.arc(0, 0, 12, 0, Math.PI * 2);
      ctx.fill();

      // Wooden roof beams & bucket
      ctx.fillStyle = '#5e3c1e';
      ctx.fillRect(-18, -16, 4, 32);
      ctx.fillRect(14, -16, 4, 32);
      ctx.fillRect(-18, -16, 36, 4);
    } else if (type === 'scarecrow') {
      // Cute Scarecrow (Matching reference image)
      ctx.fillStyle = '#8f6134';
      ctx.fillRect(-2, -18, 4, 36); // pole
      ctx.fillRect(-16, -6, 32, 4); // arms

      // Blue tunic
      ctx.fillStyle = '#2d68c4';
      ctx.fillRect(-8, -8, 16, 16);

      // Straw head & hat
      ctx.fillStyle = '#deb964'; // straw
      ctx.beginPath();
      ctx.arc(0, -14, 6, 0, Math.PI * 2);
      ctx.fill();

      // Hat
      ctx.fillStyle = '#8f5524';
      ctx.fillRect(-10, -19, 20, 3);
      ctx.fillRect(-6, -26, 12, 8);
    } else if (type === 'farmland' || cropStage !== undefined) {
      // Growing crops in garden
      const stage = cropStage ?? 0;
      if (stage === 1) {
        // Small sprouts
        ctx.fillStyle = '#5fb33f';
        ctx.fillRect(-4, -4, 3, 6);
        ctx.fillRect(2, -4, 3, 6);
      } else if (stage === 2) {
        // Taller plant
        ctx.fillStyle = '#39822a';
        ctx.fillRect(-6, -10, 12, 14);
        ctx.fillStyle = '#5fb33f';
        ctx.fillRect(-4, -14, 8, 6);
      } else if (stage >= 3) {
        // Mature with red tomatoes or corn!
        ctx.fillStyle = '#26611c';
        ctx.fillRect(-8, -16, 16, 20);
        // Tomatoes
        ctx.fillStyle = '#d62020';
        ctx.beginPath();
        ctx.arc(-4, -8, 4, 0, Math.PI * 2);
        ctx.arc(4, -12, 4, 0, Math.PI * 2);
        ctx.arc(2, -2, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (type === 'floor_torch' || type === 'wall_torch') {
      // Floor or wall torch
      ctx.fillStyle = '#59381c';
      ctx.fillRect(-2, -6, 4, 18);
      // Flame
      const f = Math.sin(timeMs * 0.02) * 2;
      ctx.fillStyle = '#ff7700';
      ctx.beginPath();
      ctx.arc(0, -10 + f * 0.5, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffea00';
      ctx.beginPath();
      ctx.arc(0, -11 + f * 0.5, 3, 0, Math.PI * 2);
    } else if (type === 'workbench' || type === 'workbench_item') {
      // Drop shadow on ground
      ctx.fillStyle = 'rgba(0,0,0,0.36)';
      ctx.beginPath();
      ctx.ellipse(0, 16, 24, 7, 0, 0, Math.PI * 2);
      ctx.fill();

      // Wood shavings / sawdust scattered on grass
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(-18, 14, 3, 2);
      ctx.fillRect(14, 15, 3, 2);
      ctx.fillRect(-6, 17, 2, 2);
      ctx.fillRect(8, 16, 2, 2);

      // Sturdy 4 timber legs with dark joinery
      ctx.fillStyle = '#2e1809'; // Shadow wood
      ctx.fillRect(-21, 0, 7, 20);
      ctx.fillRect(14, 0, 7, 20);
      ctx.fillRect(-17, -4, 5, 12);
      ctx.fillRect(12, -4, 5, 12);

      // Lower storage shelf with stored wood blocks & rope
      ctx.fillStyle = '#45250f';
      ctx.fillRect(-18, 10, 36, 4);
      ctx.fillStyle = '#78350f';
      ctx.fillRect(-14, 7, 12, 3);
      ctx.fillStyle = '#d97706'; // Coiled rope
      ctx.fillRect(4, 7, 8, 3);

      // Heavy wooden tabletop with bevel and planks
      ctx.fillStyle = '#45250f'; // Table edge shadow
      ctx.fillRect(-25, -18, 50, 22);
      ctx.fillStyle = '#78350f'; // Table base
      ctx.fillRect(-23, -16, 46, 18);
      ctx.fillStyle = '#92400e'; // Tabletop surface
      ctx.fillRect(-23, -16, 46, 14);

      // Plank separator grooves
      ctx.fillStyle = '#45250f';
      ctx.fillRect(-23, -11, 46, 1.5);
      ctx.fillRect(-23, -6, 46, 1.5);

      // Heavy Iron Bench Vise on left corner
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-24, -22, 10, 12);
      ctx.fillStyle = '#334155';
      ctx.fillRect(-22, -24, 6, 5);
      ctx.fillStyle = '#64748b';
      ctx.fillRect(-26, -20, 4, 7);
      ctx.fillStyle = '#94a3b8'; // Metal screw spindle
      ctx.fillRect(-20, -18, 2, 4);

      // Steel Claw Hammer lying on table
      ctx.fillStyle = '#78350f'; // Handle
      ctx.fillRect(2, -10, 13, 2.5);
      ctx.fillStyle = '#475569'; // Head
      ctx.fillRect(13, -13, 6, 8);
      ctx.fillStyle = '#cbd5e1'; // Metal sheen
      ctx.fillRect(15, -12, 2, 6);

      // Hand Saw on table
      ctx.fillStyle = '#94a3b8'; // Saw blade
      ctx.fillRect(-6, -14, 7, 10);
      ctx.fillStyle = '#45250f'; // Handle
      ctx.fillRect(-8, -13, 3, 5);

      // Rolled Blueprint scroll with blue markings
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(-12, -14, 9, 5);
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(-10, -13, 6, 2);
    } else if (type === 'weapon_workbench' || type === 'weapon_workbench_item') {
      // Gunsmith Workbench with gunmetal frame, rifle rack, ammo boxes & vise
      // Drop shadow
      ctx.fillStyle = 'rgba(0,0,0,0.38)';
      ctx.beginPath();
      ctx.ellipse(0, 16, 26, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      // Spent brass casings on floor
      ctx.fillStyle = '#facc15';
      ctx.fillRect(-16, 15, 3, 1.5);
      ctx.fillRect(15, 14, 2, 1.5);
      ctx.fillRect(8, 17, 3, 1.5);

      // Heavy industrial steel legs
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-22, 0, 8, 20);
      ctx.fillRect(14, 0, 8, 20);
      ctx.fillStyle = '#334155';
      ctx.fillRect(-20, 2, 4, 18);
      ctx.fillRect(16, 2, 4, 18);

      // Steel lower tier shelf with ammo crates
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-19, 10, 38, 4);
      // Ammo box on lower shelf
      ctx.fillStyle = '#15803d'; // Military olive drab ammo can
      ctx.fillRect(-14, 4, 12, 8);
      ctx.fillStyle = '#facc15';
      ctx.fillRect(-12, 6, 8, 2); // Yellow stencil

      // Solid walnut bench top
      ctx.fillStyle = '#311b0b';
      ctx.fillRect(-26, -18, 52, 22);
      ctx.fillStyle = '#45220c';
      ctx.fillRect(-24, -16, 48, 18);
      ctx.fillStyle = '#5c2e10';
      ctx.fillRect(-24, -16, 48, 14);

      // Rear wooden gun rack
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(-20, -32, 40, 15);
      ctx.fillStyle = '#292524';
      ctx.fillRect(-18, -30, 36, 12);

      // Mounted hunting rifle on rack
      ctx.fillStyle = '#44403c'; // Dark barrel
      ctx.fillRect(-16, -26, 32, 3);
      ctx.fillStyle = '#78350f'; // Walnut rifle stock
      ctx.fillRect(-16, -25, 9, 5);
      ctx.fillStyle = '#ca8a04'; // Brass trigger guard
      ctx.fillRect(-6, -23, 3, 2);
      ctx.fillStyle = '#0f172a'; // Telescopic scope
      ctx.fillRect(-2, -29, 12, 3);

      // Heavy rotary gunsmith vise on left
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-25, -22, 11, 12);
      ctx.fillStyle = '#475569';
      ctx.fillRect(-24, -25, 8, 5);
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(-22, -20, 3, 4);

      // Gun schematic blueprint on bench
      ctx.fillStyle = '#1e3a8a';
      ctx.fillRect(-4, -14, 14, 10);
      ctx.fillStyle = '#60a5fa';
      ctx.fillRect(-2, -12, 10, 1.5);
      ctx.fillRect(-2, -9, 8, 1.5);

      // Pistol slide & parts being assembled
      ctx.fillStyle = '#18181b';
      ctx.fillRect(12, -13, 8, 4);
      ctx.fillStyle = '#facc15';
      ctx.fillRect(13, -8, 2, 3); // 9mm brass cartridge
    } else if (type === 'sawmill') {
      // Sawmill / Carpentry bench
      ctx.fillStyle = '#452a15';
      ctx.fillRect(-20, 2, 8, 18);
      ctx.fillRect(12, 2, 8, 18);
      ctx.fillStyle = '#7a4821';
      ctx.fillRect(-24, -12, 48, 16);
      // Large Steel Saw Blade
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(-4, -22, 8, 24);
      ctx.fillStyle = '#f8fafc';
      for (let b = -20; b < 0; b += 4) {
        ctx.fillRect(4, b, 2, 2);
      }
      // Yellow sawdust scatter on floor
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(-16, 14, 32, 4);
    } else if (type === 'anvil') {
      // Heavy iron blacksmith anvil on stout oak stump
      ctx.fillStyle = '#54361e';
      ctx.fillRect(-14, 0, 28, 18);
      ctx.fillStyle = '#6b4528';
      ctx.fillRect(-12, 2, 24, 14);
      // Anvil horn & body
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-16, -12, 32, 14);
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.moveTo(16, -12);
      ctx.lineTo(24, -6);
      ctx.lineTo(16, -2);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#64748b';
      ctx.fillRect(-14, -14, 26, 4);
    } else if (type === 'stone_wall') {
      // Stone masonry wall
      ctx.fillStyle = '#334155';
      ctx.fillRect(-24, -24, 48, 48);
      ctx.fillStyle = '#475569';
      ctx.fillRect(-22, -22, 44, 44);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-24, -10, 48, 3);
      ctx.fillRect(-24, 6, 48, 3);
      ctx.fillRect(-6, -22, 3, 12);
      ctx.fillRect(10, -10, 3, 16);
      ctx.fillRect(-12, 6, 3, 16);
    } else if (type === 'raft') {
      // Floating wooden raft on water
      ctx.fillStyle = '#5c3a1d';
      ctx.fillRect(-20, -10, 40, 20);
      ctx.fillStyle = '#784d26';
      ctx.fillRect(-18, -8, 36, 16);
      ctx.fillStyle = '#eab308';
      ctx.fillRect(-12, -10, 3, 20);
      ctx.fillRect(10, -10, 3, 20);
    } else if (type === 'canoe') {
      ctx.fillStyle = '#7c4a27';
      ctx.beginPath();
      ctx.ellipse(0, 0, 24, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#9a5d32';
      ctx.beginPath();
      ctx.ellipse(0, 0, 20, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#d97706';
      ctx.fillRect(-14, -1, 28, 2);
    } else if (type === 'wood_boat') {
      ctx.fillStyle = '#5c3818';
      ctx.fillRect(-24, -10, 48, 20);
      ctx.fillStyle = '#784a22';
      ctx.fillRect(-22, -8, 44, 16);
      ctx.fillStyle = '#64748b';
      ctx.fillRect(-1, -34, 3, 26);
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.moveTo(1, -32);
      ctx.lineTo(20, -12);
      ctx.lineTo(1, -12);
      ctx.fill();
    } else if (type === 'pier') {
      ctx.fillStyle = '#573719';
      ctx.fillRect(-24, -12, 48, 24);
      ctx.fillStyle = '#734b26';
      ctx.fillRect(-22, -10, 44, 20);
      ctx.fillStyle = '#42270f';
      for (let px = -20; px < 24; px += 8) {
        ctx.fillRect(px, -12, 2, 24);
      }
    } else if (type === 'cave_entrance') {
      // Large dark cavern mouth with rocky archway and lanterns
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.beginPath();
      ctx.ellipse(0, 16, 32, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      // Outer rock archway
      ctx.fillStyle = '#222533';
      ctx.beginPath();
      ctx.arc(0, 0, 30, Math.PI, 0);
      ctx.lineTo(30, 20);
      ctx.lineTo(-30, 20);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#373c52';
      ctx.beginPath();
      ctx.arc(0, -2, 26, Math.PI, 0);
      ctx.lineTo(26, 18);
      ctx.lineTo(-26, 18);
      ctx.closePath();
      ctx.fill();

      // Deep dark cavern void
      ctx.fillStyle = '#090a10';
      ctx.beginPath();
      ctx.arc(0, 4, 18, Math.PI, 0);
      ctx.lineTo(18, 20);
      ctx.lineTo(-18, 20);
      ctx.closePath();
      ctx.fill();

      // Stalactites hanging from arch
      ctx.fillStyle = '#1e2230';
      ctx.beginPath();
      ctx.moveTo(-12, -8);
      ctx.lineTo(-9, 0);
      ctx.lineTo(-6, -8);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(6, -8);
      ctx.lineTo(9, 2);
      ctx.lineTo(12, -8);
      ctx.fill();

      // Glowing blue cavern lantern on left
      ctx.fillStyle = '#475569';
      ctx.fillRect(-24, -4, 3, 16);
      const glow = Math.sin(timeMs * 0.008) * 2;
      ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.beginPath();
      ctx.arc(-22, -4, 8 + glow, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(-24, -6, 4, 6);

    } else if (type === 'cave_exit') {
      // Wooden ladder & rope going up toward daylight beam
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.beginPath();
      ctx.moveTo(-16, -30);
      ctx.lineTo(16, -30);
      ctx.lineTo(24, 20);
      ctx.lineTo(-24, 20);
      ctx.closePath();
      ctx.fill();

      // Rope ladder
      ctx.fillStyle = '#78350f';
      ctx.fillRect(-8, -28, 2, 48);
      ctx.fillRect(8, -28, 2, 48);
      ctx.fillStyle = '#b45309';
      for (let y = -24; y < 20; y += 8) {
        ctx.fillRect(-8, y, 18, 2.5);
      }
    } else {
      // Safe visual fallback for any structure: clean wooden / stone station with icon
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.beginPath();
      ctx.ellipse(0, 14, 20, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#5c3a1e';
      ctx.fillRect(-18, -14, 36, 28);
      ctx.fillStyle = '#784d28';
      ctx.fillRect(-16, -12, 32, 24);
      ctx.fillStyle = '#38200d';
      ctx.strokeRect(-16, -12, 32, 24);
      ctx.fillStyle = '#eab308';
      ctx.fillRect(-3, -6, 6, 12);
      ctx.fillRect(-7, -8, 14, 4);
    }

    ctx.restore();
  }

  // --- Draw Enemies & Animals ---
  public drawEnemy(ctx: CanvasRenderingContext2D, enemy: any, animFrame: number) {
    const { x, y, type, facing, hp, maxHp, hitFlash, state, telegraphTimer } = enemy;
    ctx.save();
    ctx.translate(x, y);

    // Drop shadow
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 14, 14, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    if (hitFlash > 0) {
      ctx.filter = 'brightness(2.2)';
    }

    const flip = facing === 'left';
    if (flip) ctx.scale(-1, 1);

    const bob = Math.sin(animFrame * 8) * 2;

    // Telegraph red glow ring
    if (telegraphTimer > 0) {
      ctx.strokeStyle = 'rgba(255, 30, 30, 0.7)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 24, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (type === 'zombie') {
      // Shambling green zombie with torn clothes
      // Legs
      ctx.fillStyle = '#2b2940';
      ctx.fillRect(-6, 4 + bob, 4, 10);
      ctx.fillRect(2, 4 + bob, 4, 10);

      // Body (torn ragged blue shirt)
      ctx.fillStyle = '#3f596b';
      ctx.fillRect(-8, -8 + bob, 16, 14);

      // Outstretched green arms
      ctx.fillStyle = '#4d8a54';
      ctx.fillRect(4, -6 + bob, 12, 4);

      // Head
      ctx.fillStyle = '#4d8a54'; // zombie green skin
      ctx.fillRect(-7, -20 + bob, 14, 12);
      // Dark sunken eyes
      ctx.fillStyle = '#1c241d';
      ctx.fillRect(0, -16 + bob, 4, 4);
      ctx.fillStyle = '#e03434'; // red pupil
      ctx.fillRect(2, -15 + bob, 2, 2);
    } else if (type === 'wolf') {
      // Grey Dire Wolf with glowing red eyes
      // Body
      ctx.fillStyle = '#54545e';
      ctx.fillRect(-16, -6 + bob, 32, 14);
      // Legs
      ctx.fillStyle = '#3e3e47';
      ctx.fillRect(-14, 8 + bob, 5, 8);
      ctx.fillRect(-6, 8 + bob, 5, 8);
      ctx.fillRect(6, 8 + bob, 5, 8);
      ctx.fillRect(12, 8 + bob, 5, 8);

      // Head & Snout
      ctx.fillStyle = '#666673';
      ctx.fillRect(10, -14 + bob, 12, 10);
      ctx.fillRect(18, -10 + bob, 8, 6); // muzzle

      // Ears
      ctx.fillStyle = '#42424d';
      ctx.fillRect(12, -19 + bob, 4, 6);

      // Menacing Glowing Red Eyes
      ctx.fillStyle = '#ff1111';
      ctx.fillRect(16, -13 + bob, 3, 3);
    } else if (type === 'skeleton') {
      // Ivory skeleton archer
      ctx.fillStyle = '#d6d6d6';
      // Spine and ribs
      ctx.fillRect(-2, -6 + bob, 4, 12);
      ctx.fillRect(-6, -4 + bob, 12, 2);
      ctx.fillRect(-5, -1 + bob, 10, 2);
      // Legs
      ctx.fillRect(-5, 6 + bob, 3, 10);
      ctx.fillRect(2, 6 + bob, 3, 10);
      // Skull
      ctx.fillRect(-6, -18 + bob, 12, 10);
      ctx.fillStyle = '#111111';
      ctx.fillRect(0, -15 + bob, 3, 3);
      // Bow
      ctx.strokeStyle = '#855628';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(8, -2 + bob, 10, -Math.PI * 0.4, Math.PI * 0.4);
      ctx.stroke();
    } else if (type === 'bear') {
      // Heavy Forest Bear
      ctx.fillStyle = '#4a2c16';
      ctx.fillRect(-22, -14 + bob, 44, 24);
      // Thick legs
      ctx.fillStyle = '#361e0d';
      ctx.fillRect(-18, 8 + bob, 8, 12);
      ctx.fillRect(-6, 8 + bob, 8, 12);
      ctx.fillRect(8, 8 + bob, 8, 12);
      // Big head
      ctx.fillStyle = '#543219';
      ctx.fillRect(14, -20 + bob, 18, 16);
      ctx.fillStyle = '#1f1107';
      ctx.fillRect(26, -14 + bob, 6, 6);
    } else if (type === 'boss_spectre') {
      // Ethereal boss
      const floatBob = Math.sin(animFrame * 4) * 6;
      ctx.fillStyle = 'rgba(40, 120, 220, 0.85)';
      ctx.beginPath();
      ctx.arc(0, -10 + floatBob, 18, 0, Math.PI * 2);
      ctx.fill();

      // Shadowy robes
      ctx.fillStyle = '#15243b';
      ctx.fillRect(-12, -4 + floatBob, 24, 26);

      // Glowing spectral eyes
      ctx.fillStyle = '#42e6f5';
      ctx.fillRect(-4, -12 + floatBob, 3, 4);
      ctx.fillRect(3, -12 + floatBob, 3, 4);

      // Giant scythe
      ctx.strokeStyle = '#2b2b38';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(12, -26 + floatBob);
      ctx.lineTo(12, 24 + floatBob);
      ctx.stroke();

      ctx.fillStyle = '#42e6f5';
      ctx.beginPath();
      ctx.arc(12, -26 + floatBob, 16, Math.PI * 0.8, Math.PI * 1.5);
      ctx.fill();
    } else if (type === 'scorpion') {
      // Deadly Desert Scorpion with venomous tail and snapping pincers
      // Chitin abdomen & thorax
      ctx.fillStyle = '#5c2b09';
      ctx.beginPath();
      ctx.ellipse(-2, 0 + bob, 12, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#85420d';
      ctx.beginPath();
      ctx.ellipse(-2, -1 + bob, 10, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Multi-jointed crawling legs (4 on each side)
      ctx.strokeStyle = '#5c2b09';
      ctx.lineWidth = 1.8;
      for (let i = -3; i <= 3; i += 2) {
        const legSway = Math.sin(animFrame * 12 + i) * 3;
        // Top legs
        ctx.beginPath();
        ctx.moveTo(i * 3, -4 + bob);
        ctx.lineTo(i * 4, -12 + bob + legSway);
        ctx.stroke();
        // Bottom legs
        ctx.beginPath();
        ctx.moveTo(i * 3, 4 + bob);
        ctx.lineTo(i * 4, 12 + bob - legSway);
        ctx.stroke();
      }

      // Large forward snapping claws / pincers
      ctx.fillStyle = '#9a3412';
      ctx.beginPath();
      ctx.moveTo(8, -4 + bob);
      ctx.lineTo(16, -10 + bob);
      ctx.lineTo(20, -7 + bob);
      ctx.lineTo(14, -2 + bob);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(8, 4 + bob);
      ctx.lineTo(16, 10 + bob);
      ctx.lineTo(20, 7 + bob);
      ctx.lineTo(14, 2 + bob);
      ctx.closePath();
      ctx.fill();

      // Sharp pincer tips
      ctx.fillStyle = '#ea580c';
      ctx.fillRect(19, -8 + bob, 3, 2);
      ctx.fillRect(19, 6 + bob, 3, 2);

      // Curved arched stinger tail over body
      const tailCurl = Math.sin(animFrame * 6) * 2;
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-12, 0 + bob);
      ctx.quadraticCurveTo(-18, -14 + bob, -8, -20 + bob + tailCurl);
      ctx.lineTo(2, -18 + bob + tailCurl);
      ctx.stroke();

      // Bulbous venom gland & razor stinger
      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.arc(3, -18 + bob + tailCurl, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ef4444'; // Glowing poison barb
      ctx.fillRect(6, -20 + bob + tailCurl, 4, 2);

      // Eyes
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(6, -2 + bob, 2, 2);
      ctx.fillRect(6, 1 + bob, 2, 2);

    } else if (type === 'mummy') {
      // Ancient Desert Undead Mummy with gold pharaoh relic & wrapped bandages
      // Legs
      ctx.fillStyle = '#d4c79f';
      ctx.fillRect(-6, 4 + bob, 4, 10);
      ctx.fillRect(2, 4 + bob, 4, 10);
      ctx.fillStyle = '#a69871';
      ctx.fillRect(-6, 7 + bob, 4, 1.5);
      ctx.fillRect(2, 10 + bob, 4, 1.5);

      // Torso wrapped in weathered linen
      ctx.fillStyle = '#dfd3ab';
      ctx.fillRect(-8, -8 + bob, 16, 14);
      ctx.fillStyle = '#b3a379';
      ctx.fillRect(-8, -5 + bob, 16, 1.5);
      ctx.fillRect(-8, -1 + bob, 16, 1.5);

      // Golden Pharaoh Pectoral Amulet
      ctx.fillStyle = '#facc15';
      ctx.fillRect(-5, -7 + bob, 10, 4);
      ctx.fillStyle = '#2563eb'; // Lapis lazuli jewel
      ctx.fillRect(-1, -6 + bob, 2, 2);

      // Reaching mummy arms
      ctx.fillStyle = '#d4c79f';
      ctx.fillRect(4, -6 + bob, 13, 4);
      ctx.fillStyle = '#9e8f66';
      ctx.fillRect(8, -6 + bob, 2, 4);

      // Mummy head wrapped with linen hood
      ctx.fillStyle = '#d4c79f';
      ctx.fillRect(-7, -20 + bob, 14, 12);
      ctx.fillStyle = '#a69871';
      ctx.fillRect(-7, -18 + bob, 14, 1.5);
      ctx.fillRect(-7, -13 + bob, 14, 1.5);

      // Menacing amber glowing eyes from the dark depths
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(0, -17 + bob, 5, 4);
      ctx.fillStyle = '#f59e0b'; // Amber eye
      ctx.fillRect(2, -16 + bob, 2, 2);

      // Unraveling linen ribbon fluttering behind
      const ribbon = Math.sin(animFrame * 8) * 3;
      ctx.fillStyle = '#f5eedb';
      ctx.fillRect(-12, -4 + bob + ribbon, 5, 1.5);
      ctx.fillRect(-15, -2 + bob - ribbon, 4, 1.5);

    } else if (type === 'desert_snake') {
      // Coiled Desert Rattlesnake with diamondback pattern & flickering tongue
      const slither = Math.sin(animFrame * 14) * 4;

      // S-curve sinuous body
      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.ellipse(-10, 4 + bob, 6, 4, 0, 0, Math.PI * 2);
      ctx.ellipse(-4, -2 + bob + slither * 0.5, 7, 5, 0, 0, Math.PI * 2);
      ctx.ellipse(4, 2 + bob - slither * 0.5, 8, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Diamondback yellow scales
      ctx.fillStyle = '#fde047';
      ctx.fillRect(-8, 3 + bob, 2, 2);
      ctx.fillRect(-4, -3 + bob + slither * 0.5, 3, 3);
      ctx.fillRect(3, 1 + bob - slither * 0.5, 3, 3);

      // Flattened viper head
      ctx.fillStyle = '#92400e';
      ctx.beginPath();
      ctx.moveTo(8, -4 + bob);
      ctx.lineTo(18, 0 + bob);
      ctx.lineTo(8, 4 + bob);
      ctx.closePath();
      ctx.fill();

      // Slit reptilian eye
      ctx.fillStyle = '#facc15';
      ctx.fillRect(11, -2 + bob, 2, 2);
      ctx.fillStyle = '#000000';
      ctx.fillRect(12, -2 + bob, 1, 2);

      // Flickering red forked tongue
      if (Math.sin(animFrame * 18) > 0.2) {
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(18, -0.5 + bob, 5, 1);
        ctx.fillRect(22, -1.5 + bob, 2, 1);
        ctx.fillRect(22, 0.5 + bob, 2, 1);
      }

      // Rattle tail vibrating with blur
      const rattleVibe = (Math.random() - 0.5) * 3;
      ctx.fillStyle = '#ca8a04';
      ctx.fillRect(-15, 3 + bob + rattleVibe, 3, 2);
      ctx.fillRect(-17, 3 + bob + rattleVibe, 2, 2);
    }

    // Daytime Sunlight Fire & Smoke Burning Effect
    if (enemy.onFire) {
      const flicker = Math.sin(animFrame * 24) * 3;
      // Vibrant fire flames
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(-4, -14 + flicker, 8, 0, Math.PI * 2);
      ctx.arc(4, -18 - flicker, 9, 0, Math.PI * 2);
      ctx.arc(0, -8 + flicker, 11, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(-2, -12 + flicker, 5, 0, Math.PI * 2);
      ctx.arc(2, -15 - flicker, 6, 0, Math.PI * 2);
      ctx.fill();

      // Smoke particles rising
      ctx.fillStyle = 'rgba(60, 60, 60, 0.65)';
      ctx.beginPath();
      ctx.arc(flicker, -26 - Math.abs(flicker) * 1.5, 6, 0, Math.PI * 2);
      ctx.arc(-flicker, -34 - Math.abs(flicker), 8, 0, Math.PI * 2);
      ctx.fill();
    }

    // Health Bar overhead
    if (hp < maxHp) {
      if (flip) ctx.scale(-1, 1); // unflip for text/bars
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(-16, -30, 32, 5);
      const hpWidth = Math.max(0, (hp / maxHp) * 30);
      ctx.fillStyle = '#e62727';
      ctx.fillRect(-15, -29, hpWidth, 3);
    }

    ctx.restore();
  }

  // --- Draw Passive Livestock ---
  public drawAnimal(ctx: CanvasRenderingContext2D, animal: any, animFrame: number) {
    const { x, y, type, facing, hitFlash } = animal;
    ctx.save();
    ctx.translate(x, y);

    // Drop shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(0, 14, 16, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    if (hitFlash > 0) ctx.filter = 'brightness(2.2)';

    const flip = facing === 'left';
    if (flip) ctx.scale(-1, 1);

    const bob = Math.sin(animFrame * 6) * 1.5;

    if (type === 'cow') {
      // Black & White Dairy Cow (Matching reference image)
      ctx.fillStyle = '#f0f0f5'; // white body
      ctx.fillRect(-18, -10 + bob, 36, 20);

      // Black patches
      ctx.fillStyle = '#1f1e24';
      ctx.fillRect(-12, -8 + bob, 10, 10);
      ctx.fillRect(4, -6 + bob, 12, 12);
      ctx.fillRect(-2, 2 + bob, 6, 6);

      // Legs
      ctx.fillStyle = '#dcdce3';
      ctx.fillRect(-14, 10 + bob, 5, 8);
      ctx.fillRect(-6, 10 + bob, 5, 8);
      ctx.fillRect(6, 10 + bob, 5, 8);
      ctx.fillRect(12, 10 + bob, 5, 8);
      // Black hooves
      ctx.fillStyle = '#222226';
      ctx.fillRect(-14, 16 + bob, 5, 2);
      ctx.fillRect(-6, 16 + bob, 5, 2);
      ctx.fillRect(6, 16 + bob, 5, 2);
      ctx.fillRect(12, 16 + bob, 5, 2);

      // Head
      ctx.fillStyle = '#f0f0f5';
      ctx.fillRect(12, -18 + bob, 14, 14);
      // Pink muzzle
      ctx.fillStyle = '#f7b0c7';
      ctx.fillRect(18, -12 + bob, 9, 8);
      ctx.fillStyle = '#b05470';
      ctx.fillRect(24, -10 + bob, 2, 2); // nostril
      // Horns & Ears
      ctx.fillStyle = '#e0cf99';
      ctx.fillRect(14, -22 + bob, 3, 5);
      ctx.fillStyle = '#f0f0f5';
      ctx.fillRect(10, -18 + bob, 4, 3); // ear
      // Eye
      ctx.fillStyle = '#111111';
      ctx.fillRect(16, -15 + bob, 3, 3);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(17, -15 + bob, 1, 1);
    } else if (type === 'chicken') {
      // 16-Bit Pixel Art White Hen
      ctx.fillStyle = '#f4f4f8';
      ctx.fillRect(-6, -6 + bob, 12, 10);
      ctx.fillRect(-8, -4 + bob, 16, 7);
      // Wing
      ctx.fillStyle = '#e1e1ea';
      ctx.fillRect(-3, -3 + bob, 7, 5);

      // Red Comb on head
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(4, -13 + bob, 4, 4);
      // Red Wattle
      ctx.fillRect(7, -6 + bob, 2, 4);

      // Head & Eye
      ctx.fillStyle = '#f4f4f8';
      ctx.fillRect(3, -10 + bob, 6, 6);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(6, -9 + bob, 2, 2);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(6, -9 + bob, 1, 1);

      // Yellow/Orange Beak
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(9, -7 + bob, 4, 3);

      // Tail feathers
      ctx.fillStyle = '#e1e1ea';
      ctx.fillRect(-10, -7 + bob, 4, 4);

      // Orange Walking Feet
      ctx.fillStyle = '#d97706';
      ctx.fillRect(-3, 4 + bob, 2, 4);
      ctx.fillRect(2, 4 + bob, 2, 4);
      ctx.fillRect(-4, 7 + bob, 4, 1);
      ctx.fillRect(1, 7 + bob, 4, 1);
    } else if (type === 'rabbit') {
      // 16-Bit Pixel Art Rabbit
      const hop = Math.abs(Math.sin(animFrame * 10)) * 4;
      // Body
      ctx.fillStyle = '#c7926b';
      ctx.fillRect(-8, -4 - hop, 14, 10);
      // Puffy White Tail
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-10, -2 - hop, 4, 4);
      // Head
      ctx.fillStyle = '#c7926b';
      ctx.fillRect(4, -8 - hop, 8, 8);
      // Long Ears with pink inside
      ctx.fillStyle = '#b07954';
      ctx.fillRect(5, -16 - hop, 3, 9);
      ctx.fillRect(9, -15 - hop, 3, 8);
      ctx.fillStyle = '#fca5a5';
      ctx.fillRect(6, -14 - hop, 1, 6);
      ctx.fillRect(10, -13 - hop, 1, 5);
      // Eye & Pink Nose
      ctx.fillStyle = '#111111';
      ctx.fillRect(8, -6 - hop, 2, 2);
      ctx.fillStyle = '#f472b6';
      ctx.fillRect(11, -4 - hop, 2, 2);
      // Paws
      ctx.fillStyle = '#a16d47';
      ctx.fillRect(-6, 6 - hop, 4, 2);
      ctx.fillRect(4, 6 - hop, 4, 2);
    } else if (type === 'pig') {
      // 16-Bit Pixel Art Pink Pig
      ctx.fillStyle = '#f472b6';
      ctx.fillRect(-14, -8 + bob, 26, 16);
      ctx.fillStyle = '#f9a8d4';
      ctx.fillRect(-12, -6 + bob, 22, 12);
      // Short legs & hooves
      ctx.fillStyle = '#db2777';
      ctx.fillRect(-10, 8 + bob, 4, 5);
      ctx.fillRect(4, 8 + bob, 4, 5);
      // Head
      ctx.fillStyle = '#f472b6';
      ctx.fillRect(10, -12 + bob, 12, 12);
      // Snout with nostrils
      ctx.fillStyle = '#ec4899';
      ctx.fillRect(18, -8 + bob, 6, 6);
      ctx.fillStyle = '#831843';
      ctx.fillRect(20, -6 + bob, 1, 2);
      ctx.fillRect(22, -6 + bob, 1, 2);
      // Floppy ear
      ctx.fillStyle = '#db2777';
      ctx.fillRect(11, -15 + bob, 4, 4);
      // Eye
      ctx.fillStyle = '#111111';
      ctx.fillRect(14, -10 + bob, 2, 2);
      // Curly tail
      ctx.fillStyle = '#ec4899';
      ctx.fillRect(-16, -2 + bob, 3, 2);
      ctx.fillRect(-17, -5 + bob, 2, 3);
    } else if (type === 'deer') {
      // 16-Bit Graceful Forest Deer
      // Body
      ctx.fillStyle = '#92400e';
      ctx.fillRect(-16, -10 + bob, 30, 16);
      ctx.fillStyle = '#b45309';
      ctx.fillRect(-14, -8 + bob, 26, 12);
      // White spots
      ctx.fillStyle = '#fef3c7';
      ctx.fillRect(-8, -6 + bob, 2, 2);
      ctx.fillRect(-2, -4 + bob, 2, 2);
      ctx.fillRect(4, -6 + bob, 2, 2);
      // Slender legs
      ctx.fillStyle = '#78350f';
      ctx.fillRect(-12, 6 + bob, 3, 11);
      ctx.fillRect(-6, 6 + bob, 3, 11);
      ctx.fillRect(6, 6 + bob, 3, 11);
      ctx.fillRect(10, 6 + bob, 3, 11);
      // Long Neck & Head
      ctx.fillStyle = '#b45309';
      ctx.fillRect(10, -18 + bob, 6, 12);
      ctx.fillRect(12, -22 + bob, 10, 8);
      // Branched Antlers
      ctx.fillStyle = '#451a03';
      ctx.fillRect(13, -29 + bob, 2, 8);
      ctx.fillRect(11, -27 + bob, 6, 2);
      ctx.fillRect(16, -28 + bob, 2, 7);
      // Eye & Muzzle
      ctx.fillStyle = '#111111';
      ctx.fillRect(16, -20 + bob, 2, 2);
      ctx.fillStyle = '#fef3c7';
      ctx.fillRect(20, -19 + bob, 3, 4);
    } else if (type === 'fox') {
      // 16-Bit Swift Red Fox
      // Body
      ctx.fillStyle = '#ea580c';
      ctx.fillRect(-14, -6 + bob, 26, 12);
      // White Belly
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(-8, 2 + bob, 16, 4);
      // Paws
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-10, 6 + bob, 3, 6);
      ctx.fillRect(6, 6 + bob, 3, 6);
      // Head
      ctx.fillStyle = '#ea580c';
      ctx.fillRect(8, -12 + bob, 10, 10);
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(10, -6 + bob, 6, 4);
      // Pointed black-tipped ears
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(8, -16 + bob, 3, 5);
      ctx.fillRect(14, -16 + bob, 3, 5);
      // Eye & Black Nose
      ctx.fillStyle = '#111111';
      ctx.fillRect(12, -9 + bob, 2, 2);
      ctx.fillRect(17, -7 + bob, 2, 2);
      // Big Bushy Tail with white tip
      ctx.fillStyle = '#ea580c';
      ctx.fillRect(-22, -8 + bob, 9, 8);
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(-25, -6 + bob, 4, 5);
    }

    ctx.restore();
  }

  // --- Draw Floating Loot Drops ---
  public drawLootDrop(ctx: CanvasRenderingContext2D, drop: any, timeMs: number, icon: string) {
    const { x, y } = drop;
    const floatY = Math.sin(timeMs * 0.005 + x) * 3;

    ctx.save();
    ctx.translate(x, y + floatY);

    // Drop shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(0, 8 - floatY, 8, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Icon
    ctx.font = '16px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(icon, 0, 0);

    ctx.restore();
  }
}

export const spriteRenderer = new SpriteRenderer();
