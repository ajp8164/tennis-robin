import { useCollection } from 'firebase/firestore';
import { useUserProfile } from 'lib/auth';
import { Team } from 'types/team';

export const defaultTeamName = 'Default Team';

export const useDefaultTeam = () => {
  const { doc: userProfile } = useUserProfile();

  const { docs: teams } = useCollection<Team>('Teams', {
    where: [
      {
        fieldPath: 'defaultTeam',
        opStr: '==',
        value: true,
      },
      {
        fieldPath: 'owners',
        opStr: 'array-contains',
        value: userProfile?.id || '',
      },
    ],
  });

  return teams[0];
};
