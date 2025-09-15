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
  owners: string[];
  players: string[];
  schedule?: Schedule;
};

export type MatchKind = 'singles' | 'doubles';

export type Rounds = Player[][][][]; // Round, court, team, player

export type Schedule = {
  kind: MatchKind;
  numberOfRounds: number;
  numberOfCourts: number;
  // allRounds is important for player swap ui.
  allRounds: Rounds; // Includes all player and bye-placeholder assignments on all courts.
  // playableRounds is simpler to render if the player swap ui is needed.
  playableRounds: Rounds; // Excludes courts having bye-placeholder assignments.
  byes: Player[][]; // Round, player
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
  owners: string[];
  players: string[];
  schedule?: ScheduleEncoded;
};

export type ScheduleEncoded = {
  kind: MatchKind;
  numberOfRounds: number;
  numberOfCourts: number;
  allRounds: string;
  playableRounds: string;
  byes: string;
};
