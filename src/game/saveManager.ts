import { SaveGameData, PlayerEntity, WorldState, Quest } from './types';

const SAVE_KEY = 'lost_world_save_data_v1';

export function saveGame(player: PlayerEntity, world: WorldState, quests: Quest[]): boolean {
  try {
    const data: SaveGameData = {
      version: 1,
      timestamp: Date.now(),
      player: {
        x: player.x,
        y: player.y,
        stats: player.stats,
        inventory: player.inventory,
        selectedHotbarIndex: player.selectedHotbarIndex,
        equipment: player.equipment,
        skills: player.skills,
      },
      world: {
        timeOfDay: world.timeOfDay,
        dayCount: world.dayCount,
        weather: world.weather,
        structures: world.structures,
        resources: world.resources.map(r => ({ id: r.id, hp: r.hp, tileX: r.tileX, tileY: r.tileY })),
      },
      quests,
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    return true;
  } catch (err) {
    console.error('Failed to save game to localStorage', err);
    return false;
  }
}

export function loadGame(): SaveGameData | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SaveGameData;
  } catch (err) {
    console.error('Failed to load save data', err);
    return null;
  }
}

export function hasSavedGame(): boolean {
  return localStorage.getItem(SAVE_KEY) !== null;
}

export function clearSavedGame() {
  localStorage.removeItem(SAVE_KEY);
}
