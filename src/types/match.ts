import { ISODateString } from '@react-native-hello/common';

// Doc path - /SportEvents/{eventId}/Matches/{matchId}
export type Match = {
  id?: string;
  sportEventId: string;
  roundNumber: number;
  courtNumber: number;
  sets: Sets;
  // byes: Player[];
  timer: MatchTimer;
};

export type ElapsedTime = {
  hours: number;
  minutes: number;
};

export type MatchTimer = {
  elapsedTime: ElapsedTime;
  resumeTime: ISODateString;
  status: MatchTimerState;
};

export type MatchTimerState =
  | 'initial'
  | 'running'
  | 'paused'
  | 'ended'
  | 'abandoned';

export type Sets = Record<string, Set>; // key = set number
export type Games = Record<string, Game>; // key = game number
export type Teams = Record<string, Team>; // key = team number

export type Score = {
  sets: Sets;
};

export type Set = {
  games: Games;
};

export type Game = {
  teams: Teams;
};

export type Team = {
  points: Point[];
};

export type Point = {
  v: number; // Point value
};
