export interface PlayerInput {
  playerId: string;
  moveX: number;
  moveY: number;
  isAttacking: boolean;
  inputSequence: number;
  openChest: boolean;
  targetPlayerId?: string;
  aimX: number;
  aimY: number;
}

export interface GameState {
  tick?: number | string;
  players?: PlayerSnapshot[];
  chests?: ChestSnapshot[];
  safeZone?: SafeZoneSnapshot;
  ranking?: RankingEntry[];
  matchEnded?: boolean;
  remainingTicks?: number | string;
}

export interface PlayerSnapshot {
  playerId: string;
  x?: number;
  y?: number;
  isAlive?: boolean;
  health?: number;
  weapon?: string;
  eliminations?: number;
  damageDealt?: number;
  damageTaken?: number;
  survivedTicks?: number | string;
}

export interface ChestSnapshot {
  chestId: string;
  x?: number;
  y?: number;
  isOpened?: boolean;
  weapon?: string;
  openedByPlayerId?: string;
}

export interface SafeZoneSnapshot {
  centerX?: number;
  centerY?: number;
  radius?: number;
  phase?: number | string;
}

export interface RankingEntry {
  playerId: string;
  place?: number;
  isAlive?: boolean;
  health?: number;
  eliminations?: number;
  damageDealt?: number;
  survivedTicks?: number | string;
}

const DEFAULT_API_BASE_URL = "http://localhost:8080";
const DEFAULT_REQUEST_TIMEOUT_MS = 3000;

export const submitPlayerInput = async (
  input: PlayerInput,
  apiBaseUrl = DEFAULT_API_BASE_URL,
  timeoutMs = DEFAULT_REQUEST_TIMEOUT_MS
): Promise<GameState> => {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${apiBaseUrl}/v1/match/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
      signal: controller.signal,
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(`Gateway returned ${response.status}: ${message}`);
    }

    return response.json();
  } finally {
    window.clearTimeout(timeout);
  }
};
