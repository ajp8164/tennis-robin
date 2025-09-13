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

export type Pairing = {
  player1: Player;
  player2: Player;
};

export type Court = {
  team1: Pairing;
  team2: Pairing;
};

export type RoundPlayers = Player[][];

export type Round = Court[];

export type Schedule = {
  numberOfCourts: number;
  numberOfRounds: number;
  rounds: Round[];
};
