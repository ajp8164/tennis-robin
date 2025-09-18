import { Player } from 'types/player';
import { Schedule } from 'types/sportEvent';

import { uniquePartnerDoubles } from './uniquePartnerDoubles';

export * from './uniquePartnerDoubles';

export type Scheduler = {
  id: string;
  name: string;
  description: string;
  icon: string;
  fn: (players: Player[], courts: number) => Schedule | undefined;
};

export const schedulers = [
  {
    id: 'singles',
    name: 'Singles',
    description: 'One player each team.',
    icon: 'Users',
    fn: uniquePartnerDoubles,
  },
  {
    id: 'unique-partner-doubles',
    name: 'Unique Partner Doubles',
    description:
      'Players are grouped into pairs. Each player partners with every other player exactly once. No pair repeats.',
    icon: 'Users',
    fn: uniquePartnerDoubles,
  },
];
