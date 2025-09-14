import { ISODateString } from '@react-native-hello/common';
import { Player } from 'types/player';

export type Tournament = {
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
};

// Round, court, team, player
export type Rounds = Player[][][][];

export type Schedule = {
  numberOfRounds: number;
  numberOfCourts: number;
  rounds: Rounds;
};
