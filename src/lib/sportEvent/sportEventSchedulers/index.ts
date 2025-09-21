import { Player } from 'types/player';
import { EventFormat, MatchType, Schedule } from 'types/sportEvent';

import { simpleMatchDoubles } from './simpleMatchDoubles';
import { simpleMatchSingles } from './simpleMatchSingles';
import { uniquePartnerDoubles } from './uniquePartnerDoubles';

export * from './uniquePartnerDoubles';

export type Scheduler = {
  id: string;
  name: string;
  description: string;
  typeOfMatch: MatchType;
  eventFormat: EventFormat;
  icon: string;
  fn: (players: Player[], courts: number) => Schedule | undefined;
};

export const schedulers: Scheduler[] = [
  {
    id: 'simple-match-singles',
    name: 'Singles',
    description: 'One player each team.',
    typeOfMatch: 'Singles',
    eventFormat: 'Single Elimination Match',
    icon: 'Users',
    fn: simpleMatchSingles,
  },
  {
    id: 'simple-match-doubles',
    name: 'Doubles',
    description: 'Two players each team.',
    typeOfMatch: 'Doubles',
    eventFormat: 'Single Elimination Match',
    icon: 'Users',
    fn: simpleMatchDoubles,
  },
  {
    id: 'unique-partner-doubles',
    name: 'Unique Partner Doubles',
    description:
      'Players are grouped into pairs. Each player partners with every other player exactly once. No pair repeats.',
    typeOfMatch: 'Doubles',
    eventFormat: 'Round Robin',
    icon: 'Users',
    fn: uniquePartnerDoubles,
  },
];
