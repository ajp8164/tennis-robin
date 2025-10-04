import { ISODateString } from '@react-native-hello/common';
import { Player } from 'types/player';

// Doc path - /SportEvents/{eventId}
export type SportEvent = {
  id?: string;
  createdOn?: ISODateString;
  updatedOn?: ISODateString;
  archivedOn?: ISODateString;
  name: string;
  date: string;
  location: string;
  numberOfCourts: number;
  numberOfSetsPerMatch: number;
  numberOfGamesPerSet: number;
  courtSurface: CourtSurface;
  owners: string[]; // ids
  players: string[]; // ids
  matches: string[]; // ids
  schedule?: Schedule;
  state: SportEventState;
};

export const CourtSurfaces = ['Hard', 'Clay', 'Grass', 'Other'] as const;
export type CourtSurface = (typeof CourtSurfaces)[number];

export const EventFormats = [
  'Single Elimination Match',
  'Round Robin',
  'Other',
] as const;
export type EventFormat = (typeof EventFormats)[number];

export const MatchTypes = ['Singles', 'Doubles'] as const;
export type MatchType = (typeof MatchTypes)[number];

export type SportEventState = {
  status: SportEventStatus;
  startDate?: ISODateString;
  endDate?: ISODateString;
};

export type SportEventStatus =
  | 'in-progress'
  | 'not-started'
  | 'ended'
  | 'abandoned';

export const TeamSides = ['Team1', 'Team2'] as const;
export type TeamSide = (typeof TeamSides)[number];

export type Schedule = {
  schedulerId: string;
  numberOfRounds: number;
  numberOfCourtsUsed: number;
  rounds: Rounds;
};

export type Rounds = Record<string, Round>; // key = round number
export type Courts = Record<string, Court>; // key = court number
export type Teams = Record<string, Team>; // key = team number
export type Players = Record<string, Player>; // key = player number

export type ScoreKeeper = {
  name: string;
  playerId: string;
};

export type Round = {
  number?: number; // Round number for internal use only
  courts: Courts;
};

export type Court = {
  number?: number; // Court number for internal use only
  teams: Teams;
  byes?: Player[];
  scoreKeeper?: ScoreKeeper;
};

export type Team = {
  players: Players;
};
