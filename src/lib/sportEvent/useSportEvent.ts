import { DateTime } from 'luxon';
import { Player } from 'types/player';
import { MatchGender, MatchType, SportEvent } from 'types/sportEvent';
import { create } from 'zustand';

type SportEventStore = {
  players: Player[];
  playerSwapPosition?: PlayerSwapPosition;
  sportEvent: SportEvent;
  resetSportEvent: () => void;
  updatePlayers: (players: Player[]) => void;
  updatePlayerSwapPosition: (playerPosition?: PlayerSwapPosition) => void;
  updateScheduleRounds: (rounds: Player[][][][]) => void;
  updateSportEvent: (sportEvent: SportEvent) => void;
};

export type PlayerSwapPosition = {
  r: number; // round
  c: number; // court
  t: number; // team
  p: number; // player
};

const now = DateTime.now().toISO();
const defaultSportEvent: SportEvent = {
  createdOn: now,
  updatedOn: now,
  name: '',
  date: now,
  location: '',
  numberOfCourts: 1,
  typeOfMatch: MatchType.Singles,
  gender: MatchGender.Mens,
  owners: [],
  players: [],
};

export const useSportEvent = create<SportEventStore>(set => ({
  players: [],
  playerSwapPosition: undefined,
  sportEvent: defaultSportEvent,
  resetSportEvent: () => set({ sportEvent: defaultSportEvent }),
  updatePlayers: players => set({ players }),
  updatePlayerSwapPosition: playerSwapPosition => set({ playerSwapPosition }),
  updateScheduleRounds: rounds =>
    set(state => ({
      sportEvent: { ...state.sportEvent, allRounds: rounds },
    })),
  updateSportEvent: sportEvent => set({ sportEvent }),
}));
