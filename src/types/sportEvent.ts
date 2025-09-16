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
  typeOfMatch: MatchType;
  gender: MatchGender;
  owners: string[];
  players: string[];
  schedule?: Schedule;
};

export enum MatchGender {
  Mens = 'Mens',
  Womens = 'Womens',
  Mixed = 'Mixed',
}

export enum MatchType {
  Singles = 'Singles',
  Doubles = 'Doubles',
}

export enum TeamName {
  Home = 0,
  Away = 1,
}

export type Rounds = Player[][][][]; // Round, court, team, player
export type Scores = number[][][][]; // Round, court, set, team (see enum TeamName for value)

export type Schedule = {
  name: string;
  description: string;
  numberOfRounds: number;
  numberOfCourts: number;
  // allRounds is important for player swap ui.
  allRounds: Rounds; // Includes all player and bye-placeholder assignments on all courts.
  // playableRounds is simpler to render if the player swap ui is needed.
  playableRounds: Rounds; // Excludes courts having bye-placeholder assignments.
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
  typeOfMatch: MatchType;
  gender: MatchGender;
  owners: string[];
  players: string[];
  schedule?: ScheduleEncoded;
};

export type ScheduleEncoded = {
  name: string;
  description: string;
  numberOfRounds: number;
  numberOfCourts: number;
  allRounds: string; // Stringified
  playableRounds: string; // Stringified
  byes: string; // Stringified
  scores: string; // Stringified
};
