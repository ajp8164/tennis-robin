import React, { ReactNode, createContext, useRef } from 'react';

import { DateTime } from 'luxon';
import { Player } from 'types/player';
import { MatchGender, MatchType, SportEvent } from 'types/sportEvent';

export type SportEventEditorContext = {
  sportEvent: SportEvent;
  players: Player[];
};

export const SportEventEditorContext = createContext<SportEventEditorContext>({
  sportEvent: {} as SportEvent,
  players: [],
});

// This provider is used to share sport event creation across multiple screens.
export const SportEventEditorProvider = ({
  children,
}: {
  children: ReactNode;
}): ReactNode => {
  const now = DateTime.now().toISO();

  const sportEventRef = useRef<SportEvent>({
    // id: sportEventId,
    createdOn: now,
    updatedOn: now,
    // archivedOn: undefined,
    name: '',
    date: now,
    location: '',
    numberOfCourts: 1,
    typeOfMatch: MatchType.Singles,
    gender: MatchGender.Mens,
    owners: [],
    players: [],
    // schedule: undefined,
  });

  const playersRef = useRef<Player[]>([]);

  return (
    <SportEventEditorContext.Provider
      value={{
        sportEvent: sportEventRef.current,
        players: playersRef.current,
      }}>
      {children}
    </SportEventEditorContext.Provider>
  );
};
