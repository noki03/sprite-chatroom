// This interface is used by both Server and Client
export interface Player {
  id: string;
  x: number;
  y: number;
  sprite: string;
}

export interface GameState {
  players: { [id: string]: Player };
}
