import { Player } from 'types/player';
import { Rounds, Schedule } from 'types/sportEvent';

export const simpleMatchDoubles = (
  players: Player[],
  _courts?: number,
): Schedule | undefined => {
  // One round on one court. Each team has two players.
  const rounds: Rounds = {
    '0': {
      courts: {
        '0': {
          teams: {
            '0': {
              players: {
                '0': players[0],
                '1': players[1],
              },
            },
            '1': {
              players: {
                '0': players[0],
                '1': players[1],
              },
            },
          },
        },
      },
    },
  };

  return {
    schedulerId: 'simple-match-doubles',
    numberOfRounds: 1,
    numberOfCourtsUsed: 1,
    rounds,
  };
};
