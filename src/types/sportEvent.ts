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
  numberOfGamesPerSet: number;
  courtSurface: CourtSurface;
  owners: string[];
  players: string[];
  schedule?: Schedule;
};

export const CourtSurfaces = ['Hard', 'Clay', 'Grass', 'Other'] as const;
export type CourtSurface = (typeof CourtSurfaces)[number];

export const EventFormats = [
  'Single Elimination Match',
  'Round Robin',
  'Other',
] as const;
export type EventFormat = (typeof EventFormats)[number];

export type MatchDetail = {
  timer: MatchTimer;
};

export type MatchTimer = {
  hours: number;
  minutes: number;
  state: MatchTimerState;
};

export type MatchTimerState =
  | 'initial'
  | 'running'
  | 'paused'
  | 'ended'
  | 'abandoned';

export type MatchDetails = MatchDetail[][]; // Round, court

export const MatchTypes = ['Singles', 'Doubles'] as const;
export type MatchType = (typeof MatchTypes)[number];

export const TeamSides = ['Team1', 'Team2'] as const;
export type TeamSide = (typeof TeamSides)[number];

export type Rounds = Player[][][][]; // Round, court, team, player

// Scores are an array of scoring progression.
// [r][c][s][g][t][scores]
//
// [0][0][0][0][0] [0,  15, 30, 40, 40, 50] // Winner
// [0][0][0][0][1] [0,   0,  0,  0,  0,  0]
//
// 50 is game winner if win is 50/30
// [0][0][0][0][0] [0,  15, 30, 40, 40, 50] // Winner
// [0][0][0][0][1] [15, 15, 15, 15, 30, 30]
//
// 60 is game winner if win is 60/40
// [0][0][0][0][0] [0,  15, 30, 40, 40, 40, 50, 60] // Ad, winner
// [0][0][0][0][1] [15, 15, 15, 15, 30, 40, 40, 40]
//
// 50/40 is ad, win is 60/40
// [0][0][0][0][0] [0,  15, 30, 40, 40, 40, 50, 40, 50, 60] // Ad (x2), winner
// [0][0][0][0][1] [15, 15, 15, 15, 30, 40, 40, 40, 40, 40]
//
// 3 game set example
// [r][c][s][g][t] [scores]
//
// [0][0][0][0][0] [0,  15, 30, 40, 40, 50] // set 1, game 1 (0 index)
// [0][0][0][0][1] [0,   0,  0,  0,  0,  0]
//
// [0][0][0][1][0] [0,  15, 30, 40, 40, 50] // set 1, game 2
// [0][0][0][1][1] [0,   0,  0,  0,  0,  0]
//
// [0][0][0][2][0] [0,  15, 30, 40, 40, 50] // set 1, game 3
// [0][0][0][2][1] [0,   0,  0,  0,  0,  0]
//
// [0][0][1][0][0] [0,  15, 30, 40, 40, 50] // set 2, game 1
// [0][0][1][0][1] [0,   0,  0,  0,  0,  0]
//
// [0][0][1][1][0] [0,  15, 30, 40, 40, 50] // set 2, game 2
// [0][0][1][1][1] [0,   0,  0,  0,  0,  0]
//
// [0][0][1][2][0] [0,  15, 30, 40, 40, 50] // set 2, game 3
// [0][0][1][2][1] [0,   0,  0,  0,  0,  0]
//
// [0][0][2][0][0] [0,  15, 30, 40, 40, 50] // set 3, game 1
// [0][0][2][0][1] [0,   0,  0,  0,  0,  0]
//
// [0][0][2][1][0] [0,  15, 30, 40, 40, 50] // set 3, game 2
// [0][0][2][1][1] [0,   0,  0,  0,  0,  0]
//
// [0][0][2][2][0] [0,  15, 30, 40, 40, 50] // set 3, game 3
// [0][0][2][2][1] [0,   0,  0,  0,  0,  0]

export type Scores = number[][][][][][]; // Round, court, set, game, team, scores

export type Schedule = {
  schedulerId: string;
  numberOfRounds: number;
  numberOfCourtsUsed: number;
  rounds: Rounds; // Includes all player and bye-placeholder assignments on all courts.
  byes: Player[][]; // Round, player
  scores: Scores;
  matchDetails: MatchDetails;
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
  numberOfGamesPerSet: number;
  courtSurface: CourtSurface;
  owners: string[];
  players: string[];
  schedule?: ScheduleEncoded;
};

export type ScheduleEncoded = {
  schedulerId: string;
  numberOfRounds: number;
  numberOfCourtsUsed: number;
  rounds: string; // Stringified
  byes: string; // Stringified
  scores: string; // Stringified
  matchDetails: string; // Stringified;
};
