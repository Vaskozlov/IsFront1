export interface Coordinates {
  id: number,
  x: number;
  y: number;
}

export interface Location {
  id: number,
  x: number;
  y: number;
  name: string;
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
  id: number;
  name: string;
  coordinates: Coordinates;
  creationTime: Date;
  eyeColor: Color;
  hairColor: Color;
  location: Location;
  height: number;
  weight: number;
  nationality?: Country;
}
