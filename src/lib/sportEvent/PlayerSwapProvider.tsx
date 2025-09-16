import React, { ReactNode, createContext, useState } from 'react';

export type PlayerPosition = {
  r: number; // round
  c: number; // court
  t: number; // team
  p: number; // player
};

export type PlayerSwapContext = {
  swapSelection?: PlayerPosition;
  setSwapSelection: (position?: PlayerPosition) => void;
};

export const PlayerSwapContext = createContext<PlayerSwapContext>({
  swapSelection: undefined,
  setSwapSelection: () => {
    return;
  },
});

// This provider is used to coordinate player swaps across rounds since the component that renders
// selectable players renders only one round. This then requires somoe shared state to be able to
// swap players across rounds.
export const PlayerSwapProvider = ({
  children,
}: {
  children: ReactNode;
}): ReactNode => {
  const [swapSelection, setSwapSelection] = useState<PlayerPosition>();

  return (
    <PlayerSwapContext.Provider
      value={{
        swapSelection,
        setSwapSelection,
      }}>
      {children}
    </PlayerSwapContext.Provider>
  );
};
