import lodash from 'lodash';
import { DateTime } from 'luxon';
import { Player } from 'types/player';
import { MatchDetails, SportEvent } from 'types/sportEvent';
import { create } from 'zustand';

type SportEventStore = {
  players: Player[];
  playersInitialValue: Player[];
  playerSwapPosition?: PlayerSwapPosition;
  sportEvent: SportEvent;
  sportEventInitialValue: SportEvent;
  version: number;
  clear: () => void;
  initializePlayers: (players: Player[]) => void;
  initializeSportEvent: (sportEvent: SportEvent) => void;
  reset: () => void;
  updateMatchDetails: (matchDetails: MatchDetails) => void;
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
  numberOfSetsPerMatch: 2,
  numberOfGamesPerSet: 3,
  courtSurface: 'Other',
  owners: [],
  players: [],
  state: { status: 'not-started' },
};

const initialState = {
  players: [],
  playersInitialValue: [],
  playerSwapPosition: undefined,
  sportEvent: defaultSportEvent,
  sportEventInitialValue: defaultSportEvent,
  version: 0,
};

export const useSportEventStore = create<SportEventStore>(set => ({
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

  updateMatchDetails: matchDetails =>
    set(state => ({
      sportEvent: {
        ...state.sportEvent,
        schedule: {
          ...state.sportEvent.schedule!,
          matchDetails,
        },
      },
      version: state.version + 1,
    })),

  updatePlayers: players => set({ players }),

  updatePlayerSwapPosition: playerSwapPosition => set({ playerSwapPosition }),

  updateScheduleRounds: rounds =>
    set(state => ({
      sportEvent: {
        ...state.sportEvent,
        schedule: {
          ...state.sportEvent.schedule!,
          rounds,
        },
      },
      version: state.version + 1,
    })),

  // Since version is listened to for knowing when changes occur do not bump version here.
  // Doing so creates an endless loop of updates to sport event.
  updateSportEvent: sportEvent =>
    set({ sportEvent: lodash.cloneDeep(sportEvent) }),
}));
