import lodash from 'lodash';
import { DateTime } from 'luxon';
import { Player } from 'types/player';
import { SportEvent } from 'types/sportEvent';
import { create } from 'zustand';

type SportEventStore = {
  players: Player[];
  playersInitialValue: Player[];
  playerSwapPosition?: PlayerSwapPosition;
  scheduleRoundsVersion: number;
  sportEvent: SportEvent;
  sportEventInitialValue: SportEvent;
  clear: () => void;
  initializePlayers: (players: Player[]) => void;
  initializeSportEvent: (sportEvent: SportEvent) => void;
  reset: () => void;
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
  numberOfSets: 2,
  courtSurface: 'Other',
  owners: [],
  players: [],
};

const initialState = {
  players: [],
  playersInitialValue: [],
  playerSwapPosition: undefined,
  scheduleRoundsVersion: 0,
  sportEvent: defaultSportEvent,
  sportEventInitialValue: defaultSportEvent,
};

export const useSportEvent = create<SportEventStore>(set => ({
  ...initialState,
  clear: () =>
    set(_state => ({
      ...initialState,
    })),

  initializePlayers: players =>
    set({
      players,
      playersInitialValue: lodash.cloneDeep(players),
    }),

  initializeSportEvent: sportEvent =>
    set({
      sportEvent,
      sportEventInitialValue: lodash.cloneDeep(sportEvent),
    }),

  reset: () =>
    set(state => ({
      ...state,
      players: lodash.cloneDeep(state.playersInitialValue),
      sportEvent: lodash.cloneDeep(state.sportEventInitialValue),
    })),

  updatePlayers: players => set({ players }),

  updatePlayerSwapPosition: playerSwapPosition => set({ playerSwapPosition }),

  updateScheduleRounds: rounds =>
    set(state => ({
      sportEvent: {
        ...state.sportEvent,
        schedule: {
          ...state.sportEvent.schedule!,
          allRounds: rounds,
        },
      },
      scheduleRoundsVersion: state.scheduleRoundsVersion + 1,
    })),

  updateSportEvent: sportEvent =>
    set({ sportEvent: lodash.cloneDeep(sportEvent) }),
}));
