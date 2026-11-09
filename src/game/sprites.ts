import { Direction } from './types';
import { TILE_SIZE, TILE_TYPES } from './constants';

export class SpriteRenderer {
  // We can cache offscreen patterns for tiles
  private grassCanvas: HTMLCanvasElement;
  private waterCanvas: HTMLCanvasElement;
  private sandCanvas: HTMLCanvasElement;
  private dirtCanvas: HTMLCanvasElement;
  private ruinsCanvas: HTMLCanvasElement;

  constructor() {
    this.grassCanvas = this.createGrassTile();
    this.waterCanvas = this.createWaterTile();
    this.sandCanvas = this.createSandTile();
    this.dirtCanvas = this.createDirtTile();
    this.ruinsCanvas = this.createRuinsTile();
  }

  // --- Tile Generators ---
  private createGrassTile(): HTMLCanvasElement {
    const c = document.createElement('canvas');
    c.width = TILE_SIZE;
    c.height = TILE_SIZE;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = '#4b8e2b';
    ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);

    // Pixel details
    ctx.fillStyle = '#3c7a20';
    ctx.fillRect(4, 6, 4, 6);
    ctx.fillRect(20, 16, 4, 8);
    ctx.fillRect(36, 8, 4, 6);
    ctx.fillRect(12, 32, 4, 6);
    ctx.fillRect(28, 36, 4, 8);

    ctx.fillStyle = '#5ca835';
    ctx.fillRect(8, 20, 3, 5);
    ctx.fillRect(24, 6, 3, 5);
    ctx.fillRect(40, 32, 3, 5);

    // Little flowers
    ctx.fillStyle = '#ffdf4a';
    ctx.fillRect(16, 12, 3, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(32, 28, 3, 3);

    return c;
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

  // --- Draw Tile Function ---
  public drawTile(ctx: CanvasRenderingContext2D, type: number, x: number, y: number, timeMs: number) {
    switch (type) {
      case TILE_TYPES.GRASS:
        ctx.drawImage(this.grassCanvas, x, y);
        break;
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
      default:
        ctx.drawImage(this.grassCanvas, x, y);
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
    hitFlash: number
  ) {
    ctx.save();
    ctx.translate(x, y);

    // Drop shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 18, 14, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Hit flash white filter
    if (hitFlash > 0) {
      ctx.filter = 'brightness(2.5)';
    }

    // Walking vertical bob
    const walkBob = isMoving ? Math.sin(animFrame * 12) * 2 : 0;
    const legOffset = isMoving ? Math.sin(animFrame * 12) * 5 : 0;

    const flip = facing === 'left';
    if (flip) {
      ctx.scale(-1, 1);
    }

    // 1. Legs / Boots (Navy jeans + brown boots)
    ctx.fillStyle = '#1c2638'; // Dark jeans
    ctx.fillRect(-7, 6 + walkBob, 5, 8 + legOffset);
    ctx.fillRect(2, 6 + walkBob, 5, 8 - legOffset);

    ctx.fillStyle = '#422817'; // Boots
    ctx.fillRect(-8, 14 + walkBob + legOffset, 6, 4);
    ctx.fillRect(2, 14 + walkBob - legOffset, 6, 4);

    // 2. Torso: Red Hoodie Jacket with dark undershirt & white drawstrings (Matching reference image!)
    ctx.fillStyle = '#c72323'; // Bright vivid red hoodie
    ctx.fillRect(-9, -8 + walkBob, 18, 15);
    // Darker red hoodie trim
    ctx.fillStyle = '#9e1919';
    ctx.fillRect(-9, 5 + walkBob, 18, 2);
    // Dark grey undershirt notch
    ctx.fillStyle = '#222225';
    ctx.fillRect(-3, -7 + walkBob, 6, 6);
    // White drawstrings
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-2, -2 + walkBob, 1, 5);
    ctx.fillRect(1, -2 + walkBob, 1, 5);

    // 3. Head & Face (Boy with pale skin, bright eyes)
    ctx.fillStyle = '#ffd1a4'; // Skin tone
    ctx.fillRect(-7, -20 + walkBob, 14, 12);

    if (facing === 'up') {
      // Back of head - full spiky black hair
      ctx.fillStyle = '#18151c';
      ctx.fillRect(-8, -23 + walkBob, 16, 16);
      ctx.fillStyle = '#2b2633'; // Hair highlights
      ctx.fillRect(-5, -21 + walkBob, 10, 4);
    } else {
      // Eyes
      ctx.fillStyle = '#111111';
      ctx.fillRect(-4, -15 + walkBob, 3, 4);
      ctx.fillRect(2, -15 + walkBob, 3, 4);
      // Eye glint
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-3, -15 + walkBob, 1, 2);
      ctx.fillRect(3, -15 + walkBob, 1, 2);

      // Messy black anime hair
      ctx.fillStyle = '#18151c';
      // Hair bangs and top
      ctx.fillRect(-9, -24 + walkBob, 18, 7);
      ctx.fillRect(-8, -20 + walkBob, 4, 5);
      ctx.fillRect(-1, -19 + walkBob, 3, 4);
      ctx.fillRect(5, -20 + walkBob, 4, 5);
      // Spikes
      ctx.fillRect(-7, -27 + walkBob, 5, 4);
      ctx.fillRect(1, -26 + walkBob, 6, 3);
      // Highlights
      ctx.fillStyle = '#3a3345';
      ctx.fillRect(-5, -25 + walkBob, 8, 2);
    }

    // 4. Arms & Held Item / Weapon Swing
    let weaponAngle = 0.2;
    if (isAttacking) {
      // Swing arc from -45 deg to +90 deg
      weaponAngle = -Math.PI * 0.3 + swingProgress * Math.PI * 0.9;
    }

    ctx.save();
    ctx.translate(6, -2 + walkBob);
    ctx.rotate(weaponAngle);

    // Arm (red sleeve)
    ctx.fillStyle = '#c72323';
    ctx.fillRect(-2, -3, 6, 9);
    ctx.fillStyle = '#ffd1a4'; // Hand
    ctx.fillRect(0, 5, 4, 4);

    // Draw Held Weapon/Tool
    if (equippedWeapon) {
      if (equippedWeapon.includes('axe')) {
        // Wooden handle
        ctx.fillStyle = '#8f5d34';
        ctx.fillRect(2, -14, 3, 26);
        // Axe Blade (Steel with highlight)
        ctx.fillStyle = equippedWeapon.includes('iron') ? '#9ec7d9' : '#8a8f94';
        ctx.fillRect(5, -16, 9, 8);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(13, -16, 2, 8);
      } else if (equippedWeapon.includes('pickaxe')) {
        ctx.fillStyle = '#8f5d34';
        ctx.fillRect(2, -14, 3, 26);
        ctx.fillStyle = equippedWeapon.includes('iron') ? '#9ec7d9' : '#8a8f94';
        ctx.fillRect(-4, -16, 16, 4);
      } else if (equippedWeapon.includes('sword')) {
        // Hilt
        ctx.fillStyle = '#d4af37'; // gold guard
        ctx.fillRect(-2, 3, 9, 3);
        ctx.fillStyle = '#5c3a21'; // pommel
        ctx.fillRect(1, 6, 3, 5);
        // Blade
        ctx.fillStyle = equippedWeapon.includes('iron') ? '#b8d8e8' : '#a8b0b5';
        ctx.fillRect(1, -22, 4, 25);
        ctx.fillStyle = '#ffffff'; // Blade gleam
        ctx.fillRect(2, -22, 1, 23);
      } else if (equippedWeapon.includes('torch')) {
        // Torch stick
        ctx.fillStyle = '#734b26';
        ctx.fillRect(2, -10, 3, 20);
        // Fire head
        ctx.fillStyle = '#ff9900';
        ctx.fillRect(0, -16, 7, 7);
        ctx.fillStyle = '#ffff33';
        ctx.fillRect(2, -14, 3, 4);
      } else if (equippedWeapon.includes('bow')) {
        // Wooden bow arc
        ctx.strokeStyle = '#8f5d34';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(2, 0, 14, -Math.PI * 0.4, Math.PI * 0.4);
        ctx.stroke();
        // String
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

    if (hitFlash > 0) {
      ctx.filter = 'brightness(2.2)';
    }

    if (type === 'tree') {
      // Big Oak Tree
      // Ground shadow
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.ellipse(0, 18, 22, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      // Trunk
      ctx.fillStyle = '#59381c';
      ctx.fillRect(-6, -4, 12, 22);
      ctx.fillStyle = '#3b230e';
      ctx.fillRect(-6, -4, 4, 22);

      // Swaying canopy
      const sway = Math.sin(timeMs * 0.002 + x * 0.05) * 2;
      ctx.fillStyle = '#2d6a1d';
      ctx.beginPath();
      ctx.arc(sway, -28, 26, 0, Math.PI * 2);
      ctx.fill();

      // Mid highlights
      ctx.fillStyle = '#418a2d';
      ctx.beginPath();
      ctx.arc(-8 + sway, -32, 16, 0, Math.PI * 2);
      ctx.arc(8 + sway, -30, 16, 0, Math.PI * 2);
      ctx.fill();

      // Top sun-lit leaves
      ctx.fillStyle = '#5fb33f';
      ctx.beginPath();
      ctx.arc(-2 + sway, -40, 14, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === 'pine_tree') {
      // Pine / Spruce Tree
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.ellipse(0, 16, 16, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#4d3018';
      ctx.fillRect(-4, 0, 8, 16);

      // 3 Tier Cones
      ctx.fillStyle = '#1e5222';
      ctx.beginPath();
      ctx.moveTo(0, -42);
      ctx.lineTo(18, -12);
      ctx.lineTo(-18, -12);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#2c6e32';
      ctx.beginPath();
      ctx.moveTo(0, -42);
      ctx.lineTo(14, -20);
      ctx.lineTo(-14, -20);
      ctx.closePath();
      ctx.fill();
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

      // Metallic iron streaks
      ctx.fillStyle = '#d48b4f'; // rust / iron shimmer
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

      // Sparkling gold nuggets
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
    } else if (type === 'fallen_log') {
      // Fallen wood log
      ctx.fillStyle = '#613e1f';
      ctx.fillRect(-18, -6, 36, 12);
      ctx.fillStyle = '#8f6137';
      ctx.fillRect(-16, -4, 32, 8);
      // Ring end
      ctx.fillStyle = '#d4aa79';
      ctx.beginPath();
      ctx.ellipse(-18, 0, 4, 6, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === 'medicinal_plant') {
      // Herb
      ctx.fillStyle = '#39a84d';
      ctx.fillRect(-2, -6, 4, 12);
      ctx.fillRect(-8, -2, 16, 3);
      // Purple blossom
      ctx.fillStyle = '#b844d6';
      ctx.beginPath();
      ctx.arc(0, -8, 4, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === 'loose_branch') {
      // Loose ground branch/stick
      ctx.fillStyle = '#5c3818';
      ctx.save();
      ctx.rotate(0.35);
      ctx.fillRect(-10, -2, 20, 4);
      ctx.fillRect(-2, -6, 3, 5); // twig fork
      ctx.fillStyle = '#458f32'; // little leaf
      ctx.fillRect(0, -7, 3, 3);
      ctx.restore();
    } else if (type === 'loose_stone') {
      // Loose ground pebble/stone
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
    } else if (type === 'campfire') {
      // Stone ring with roaring fire
      ctx.fillStyle = '#4f4f57';
      // Stone circle
      for (let i = 0; i < 8; i++) {
        const ang = (i / 8) * Math.PI * 2;
        const sx = Math.cos(ang) * 14;
        const sy = Math.sin(ang) * 14;
        ctx.beginPath();
        ctx.arc(sx, sy, 5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Charcoal and logs
      ctx.fillStyle = '#2e1c0e';
      ctx.fillRect(-10, -4, 20, 6);
      ctx.fillRect(-4, -10, 8, 20);

      // Animated Flames
      const flameFlicker = Math.sin(timeMs * 0.015) * 2;
      const flameHeight = 12 + Math.cos(timeMs * 0.02) * 3;

      ctx.fillStyle = '#ff3700'; // outer red
      ctx.beginPath();
      ctx.arc(0, 0, 9 + flameFlicker, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ff9900'; // orange
      ctx.beginPath();
      ctx.arc(0, -3, 6 + flameFlicker, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffea00'; // bright yellow core
      ctx.beginPath();
      ctx.arc(0, -5, 3 + flameFlicker * 0.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === 'chest') {
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
    } else if (type === 'bed') {
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
    } else if (type === 'furnace') {
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
      ctx.fill();
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

      // Legs
      ctx.fillStyle = '#dcdce3';
      ctx.fillRect(-14, 10 + bob, 5, 8);
      ctx.fillRect(-6, 10 + bob, 5, 8);
      ctx.fillRect(6, 10 + bob, 5, 8);
      ctx.fillRect(12, 10 + bob, 5, 8);

      // Head
      ctx.fillStyle = '#f0f0f5';
      ctx.fillRect(12, -18 + bob, 14, 14);
      // Pink muzzle
      ctx.fillStyle = '#f7b0c7';
      ctx.fillRect(18, -12 + bob, 8, 8);
      // Horns
      ctx.fillStyle = '#e0cf99';
      ctx.fillRect(14, -22 + bob, 3, 5);
    } else if (type === 'chicken') {
      // White chicken
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0 + bob, 8, 0, Math.PI * 2);
      ctx.fill();
      // Red comb
      ctx.fillStyle = '#e02828';
      ctx.fillRect(-2, -10 + bob, 4, 3);
      // Yellow beak
      ctx.fillStyle = '#ffaa00';
      ctx.fillRect(6, -2 + bob, 4, 3);
      // Legs
      ctx.fillStyle = '#ffaa00';
      ctx.fillRect(-3, 6 + bob, 2, 5);
      ctx.fillRect(2, 6 + bob, 2, 5);
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
