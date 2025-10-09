export interface Coordinates {
  id: number | null,
  x: number;
  y: number;
}

export interface Location {
  id: number | null,
  x: number;
  y: number;
  name: string;
}

export enum PersonState {
  UPDATED = 'UPDATED',
  DELETED = 'DELETED'
}

export enum Color {
  RED = 'RED',
  BLACK = 'BLACK',
  BLUE = 'BLUE',
  YELLOW = 'YELLOW',
  BROWN = 'BROWN'
}

export enum Country {
  RUSSIA = 'RUSSIA',
  UNITED_KINGDOM = 'UNITED_KINGDOM',
  GERMANY = 'GERMANY',
  SPAIN = 'SPAIN',
  SOUTH_KOREA = 'SOUTH_KOREA'
}

export interface Person {
  id: number | null;
  name: string;
  coordinates: Coordinates | null;
  creationTime: Date | null;
  eyeColor: Color;
  hairColor: Color;
  location: Location | null;
  height: number;
  weight: number;
  nationality?: Country;
}

export interface BroadcastMessage {
  state: PersonState;
  person: Person;
}
