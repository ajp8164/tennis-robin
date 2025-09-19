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
  gender: MatchGender;
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
