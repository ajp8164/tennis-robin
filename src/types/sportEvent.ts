import { ISODateString } from '@react-native-hello/common';
import { Player } from 'types/player';

export type SportEvent = {
  id?: string;
  createdOn?: ISODateString;
  updatedOn?: ISODateString;
  archivedOn?: ISODateString;
  name: string;
  date: string;
  location: string;
  numberOfCourts: number;
  numberOfSets: number;
  courtSurface: CourtSurface;
  owners: string[];
  players: string[];
  schedule?: Schedule;
};

export const CourtSurfaces = ['Hard', 'Clay', 'Grass', 'Other'] as const;
export type CourtSurface = (typeof CourtSurfaces)[number];

export const EventCategories = ['Match', 'Round Robin', 'Other'] as const;
export type EventCategory = (typeof EventCategories)[number];

export const MatchTypes = ['Singles', 'Doubles'] as const;
export type MatchType = (typeof MatchTypes)[number];

export const TeamSides = ['Home', 'Away'] as const;
export type TeamSide = (typeof TeamSides)[number];

export type Rounds = Player[][][][]; // Round, court, team, player
export type Scores = number[][][][]; // Round, court, set, team (see enum TeamName for value)

export type Schedule = {
  schedulerId: string;
  numberOfRounds: number;
  numberOfCourtsUsed: number;
  allRounds: Rounds; // Includes all player and bye-placeholder assignments on all courts.
  byes: Player[][]; // Round, player
  scores: Scores;
};

// Encoded types provide firestore compatibility since firestore does not allow next arrays.
// Nested array are stringified for storage.
export type SportEventEncoded = {
  id?: string;
  createdOn?: ISODateString;
  updatedOn?: ISODateString;
  archivedOn?: ISODateString;
  name: string;
  date: string;
  location: string;
  numberOfCourts: number;
  numberOfSets: number;
  owners: string[];
  players: string[];
  schedule?: ScheduleEncoded;
};

export type ScheduleEncoded = {
  schedulerId: string;
  numberOfRounds: number;
  numberOfCourtsUsed: number;
  allRounds: string; // Stringified
  byes: string; // Stringified
  scores: string; // Stringified
};
