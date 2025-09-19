import lodash from 'lodash';
import { DateTime } from 'luxon';
import { Player } from 'types/player';
import { MatchGender, MatchType, SportEvent } from 'types/sportEvent';
import { create } from 'zustand';

type SportEventStore = {
  players: Player[];
  playerSwapPosition?: PlayerSwapPosition;
  scheduleRoundsChanged: boolean;
  sportEvent: SportEvent;
  sportEventInitialValue: SportEvent;
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
  typeOfMatch: MatchType.Singles,
  gender: MatchGender.Mens,
  owners: [],
  players: [],
};

const initialState = {
  players: [],
  playerSwapPosition: undefined,
  scheduleRoundsChanged: false,
  sportEvent: defaultSportEvent,
  sportEventInitialValue: defaultSportEvent,
};

export const useSportEvent = create<SportEventStore>(set => ({
  ...initialState,
  initializeSportEvent: sportEvent =>
    set({
      sportEvent,
      sportEventInitialValue: lodash.cloneDeep(sportEvent),
    }),
  reset: () =>
    set(state => ({
      ...state,
      sportEvent: lodash.cloneDeep(state.sportEventInitialValue),
      scheduleRoundsChanged: false,
    })),
  updatePlayers: players => set({ players }),
  updatePlayerSwapPosition: playerSwapPosition => set({ playerSwapPosition }),
  updateScheduleRounds: rounds =>
    set(state => ({
      sportEvent: { ...state.sportEvent, allRounds: rounds },
      scheduleRoundsChanged: true,
    })),
  updateSportEvent: sportEvent =>
    set({ sportEvent: lodash.cloneDeep(sportEvent) }),
}));
