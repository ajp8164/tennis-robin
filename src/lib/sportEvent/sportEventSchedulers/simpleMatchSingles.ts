import { Player } from 'types/player';
import { Rounds, Schedule } from 'types/sportEvent';

export const simpleMatchSingles = (
  players: Player[],
  _courts?: number,
): Schedule | undefined => {
  // One round on one court. Each team has one player.
  const rounds: Rounds = {
    r0: {
      courts: {
        c0: {
          teams: {
            t0: {
              players: {
                p0: players[0],
              },
            },
            t1: {
              players: {
                p0: players[1],
              },
            },
          },
        },
      },
    },
  };

  return {
    schedulerId: 'simple-match-singles',
    numberOfRounds: 1,
    numberOfCourtsUsed: 1,
    rounds,
  };
};
