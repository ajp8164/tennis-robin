import { Player } from 'types/player';
import { Schedule } from 'types/tournament';

type ScheduleRaw = Player[][][][];

export const uniquePartnerDoubles = (players: Player[], courts: number) => {
  let n = players.length;

  if (courts <= 0) return;

  // Add dummy player if odd count
  const byePlayer: Partial<Player> = { firstName: '(Bye)', lastName: '' };
  const balancedPlayers: Player[] =
    n % 2 === 0 ? [...players] : [...players, byePlayer as Player];
  n = balancedPlayers.length;

  const numRounds = n - 1;
  const rounds: Player[][][] = [];

  // Circle method round robin
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

  // Split into court-limited subrounds
  const schedule: ScheduleRaw = [];
  for (const round of rounds) {
    for (let i = 0; i < round.length; i += courts * 2) {
      const subroundPairs = round.slice(i, i + courts * 2);
      const subround = [];

      for (let j = 0; j < subroundPairs.length; j += 2) {
        const team1 = subroundPairs[j];
        const team2 = subroundPairs[j + 1] || [byePlayer, byePlayer];
        subround.push([team1, team2]);
      }

      schedule.push(subround);
    }
  }

  return transformSchedule(schedule);
};

// export const uniquePartnerDoubles = (players: Player[], courts: number) => {
//   let n = players.length;

//   // Number of players must be even.
//   // Number of courts must be at least 1.
//   if (n % 2 !== 0) return;
//   if (courts <= 0) return;

//   // Add a dummy "bye" player to force byes.
//   const byePlayer = { firstName: '(Bye)', lastName: '' };

//   const balancedPlayers: Player[] = [...players, byePlayer as Player];
//   n = balancedPlayers.length;

//   const numRounds = n - 1;
//   const rounds: Player[][][] = [];

//   for (let r = 0; r < numRounds; r++) {
//     const round: Player[][] = [];
//     for (let i = 0; i < n / 2; i++) {
//       const p1 = balancedPlayers[(r + i) % (n - 1)];
//       const p2 =
//         i === 0
//           ? balancedPlayers[n - 1]
//           : balancedPlayers[(n - 1 - i + r) % (n - 1)];
//       round.push([p1, p2]);
//     }
//     rounds.push(round);
//   }

//   // Split into court-limited subrounds.
//   const schedule: ScheduleRaw = [];
//   for (const round of rounds) {
//     for (let i = 0; i < round.length; i += courts * 2) {
//       const subroundPairs = round.slice(i, i + courts * 2);
//       const subround = [];

//       for (let j = 0; j < subroundPairs.length; j += 2) {
//         const team1 = subroundPairs[j];
//         const team2 = subroundPairs[j + 1] || [byePlayer, byePlayer];
//         subround.push([team1, team2]);
//       }

//       schedule.push(subround);
//     }
//   }

//   return transformSchedule(schedule);
// };

export const transformSchedule = (scheduleRaw: ScheduleRaw) => {
  const schedule: Schedule = {
    numberOfCourts: 0,
    numberOfRounds: 0,
    rounds: [],
  };

  scheduleRaw.forEach((rounds, r) => {
    schedule.rounds[r] = [];

    rounds.forEach((_courts, c) => {
      schedule.rounds[r][c] = {
        team1: {
          player1: scheduleRaw[r][c][0][0],
          player2: scheduleRaw[r][c][0][1],
        },
        team2: {
          player1: scheduleRaw[r][c][1][0],
          player2: scheduleRaw[r][c][1][1],
        },
      };
    });
  });

  schedule.numberOfCourts = schedule.rounds[0].length;
  schedule.numberOfRounds = schedule.rounds.length;

  return schedule;
};

// export const summary = (schedule, players) => {
//   console.log(schedule);
//   console.log(
//     '| Round | Court 1                                | Court 2                                |',
//   );
//   console.log(
//     '|-------|----------------------------------------|----------------------------------------|',
//   );

//   schedule.forEach((round, idx) => {
//     const formatTeam = team =>
//       `${team[0].firstName} ${team[0].lastName}`.trim() +
//       ' & ' +
//       `${team[1].firstName} ${team[1].lastName}`.trim();

//     const court1 = round[0]
//       ? `${formatTeam(round[0][0])} vs ${formatTeam(round[0][1])}`
//       : '';
//     const court2 = round[1]
//       ? `${formatTeam(round[1][0])} vs ${formatTeam(round[1][1])}`
//       : '';

//     console.log(
//       `| ${String(idx + 1).padEnd(5)} | ${court1.padEnd(38)} | ${court2.padEnd(38)} |`,
//     );
//   });

//   //////////////

//   // Build bye summary
//   const byeSummary = {};
//   players.forEach(p => {
//     byeSummary[`${p.firstName} ${p.lastName}`] = [];
//   });

//   schedule.forEach((round, idx) => {
//     const allPlayersInRound = new Set();
//     round.forEach(match => {
//       match.forEach(team => {
//         if (team[0].firstName !== '(Bye)' && team[1].firstName !== '(Bye)') {
//           team.forEach(player => {
//             allPlayersInRound.add(`${player.firstName} ${player.lastName}`);
//           });
//         }
//       });
//     });

//     // Any real player not in this round gets a bye
//     players.forEach(p => {
//       const name = `${p.firstName} ${p.lastName}`;
//       if (!allPlayersInRound.has(name)) {
//         byeSummary[name].push(idx + 1);
//       }
//     });
//   });

//   // Print bye summary as a table
//   console.log('\n### Bye Summary');
//   console.log('| Player             | Rounds With Bye |');
//   console.log('|--------------------|-----------------|');
//   Object.entries(byeSummary).forEach(([player, rounds]) => {
//     console.log(`| ${player.padEnd(18)} | ${rounds.join(', ').padEnd(15)} |`);
//   });
// };
