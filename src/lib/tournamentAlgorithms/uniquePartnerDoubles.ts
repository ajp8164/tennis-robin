import { Player } from 'types/player';
import { Rounds, Schedule } from 'types/tournament';

export const uniquePartnerDoubles = (
  players: Player[],
  courts: number,
): Schedule | undefined => {
  let n = players.length;
  if (courts <= 0) return;

  // Add dummy bye player if odd count.
  const byePlayer: Partial<Player> = { firstName: '(Bye)', lastName: '' };
  const balancedPlayers: Player[] =
    n % 2 === 0 ? [...players] : [...players, byePlayer as Player];
  n = balancedPlayers.length;

  const numRounds = n - 1;
  const rounds: Player[][][] = [];

  // Circle method round robin.
  for (let r = 0; r < numRounds; r++) {
    const round: Player[][] = [];
    for (let i = 0; i < n / 2; i++) {
      const p1 = balancedPlayers[(r + i) % (n - 1)];
      const p2 =
        i === 0
          ? balancedPlayers[n - 1]
          : balancedPlayers[(n - 1 - i + r) % (n - 1)];

      round.push([p1, p2]);
    }
    rounds.push(round);
  }
  console.log('rounds', rounds);

  // Split into court-limited subrounds.
  const scheduleRounds: Rounds = [];
  for (const round of rounds) {
    const playablePairs: Player[][] = [];
    const byePlayers: Player[] = [];

    for (const pair of round) {
      if (pair.includes(byePlayer as Player)) {
        // Collect the real player(s) who got paired with (Bye)
        const realOnes = pair.filter(p => p !== byePlayer);
        byePlayers.push(...realOnes);
      } else {
        playablePairs.push(pair);
      }
    }
    console.log('xxxx', playablePairs, byePlayers);
    // Slice into courts
    for (let i = 0; i < playablePairs.length; i += courts * 2) {
      const subroundPairs = playablePairs.slice(i, i + courts * 2);
      const subround: Player[][][] = [];

      for (let j = 0; j < subroundPairs.length; j += 2) {
        const team1 = subroundPairs[j];
        const team2 = subroundPairs[j + 1];

        if (team1 && team2) {
          subround.push([team1, team2]);
        }
      }

      // If there are bye players, put them together in a dummy "court"
      if (byePlayers.length > 0) {
        const byeTeams: Player[][] = byePlayers.map(p => [
          p,
          byePlayer as Player,
        ]);

        // Group bye teams into matches of two
        for (let k = 0; k < byeTeams.length; k += 2) {
          const team1 = byeTeams[k];
          const team2 = byeTeams[k + 1] || [
            byePlayer as Player,
            byePlayer as Player,
          ];
          subround.push([team1, team2]);
        }
      }

      if (subround.length > 0) {
        scheduleRounds.push(subround);
      }
    }
  }

  const resolved = resolveByesByRound(scheduleRounds);

  return {
    kind: 'doubles',
    numberOfRounds: resolved.playableSchedule.length,
    numberOfCourts: resolved.maxCourtsUsed,
    allRounds: scheduleRounds,
    playableRounds: resolved.playableSchedule,
    byes: resolved.byePlayers,
  };
};

const resolveByesByRound = (scheduleRounds: Rounds) => {
  const byePlayers: Player[][] = [];
  const playableSchedule: Rounds = [];

  scheduleRounds.forEach((round, r) => {
    round.forEach((court, c) => {
      const courtPlayers = court.flat();

      // If at least one bye-placeholder player exists on this court/round then all
      // real players are bye for this round.
      const byeIndex = courtPlayers.findIndex(p => p.firstName === '(Bye)');
      if (byeIndex >= 0) {
        // This court/round is not playable (not enough players).
        // All real players on this court/round are bye for this round.
        byePlayers[r] = [
          ...(byePlayers[r] || []),
          ...courtPlayers.filter(p => p.firstName !== '(Bye)'),
        ];
      } else {
        // All real players, include this round/court in the schedule.
        playableSchedule[r] = playableSchedule[r] || [];
        playableSchedule[r][c] = scheduleRounds[r][c];
      }
    });
  });

  // We're reducing court usage by removing non-playable matches. Determine the maxiumum
  // number of courts used - will always be <= to courts made available.
  const maxCourtsUsed = Math.max(...playableSchedule.map(r => r.length));

  return { byePlayers, playableSchedule: scheduleRounds, maxCourtsUsed };
};
