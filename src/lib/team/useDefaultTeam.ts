import { useEffect, useState } from 'react';

import { getDocuments } from 'firebase/firestore';
import { useUserProfile } from 'lib/auth';
import { useMyPlayer } from 'lib/player';
import { Team } from 'types/team';

export const defaultTeamName = 'Default Team';

export const useDefaultTeam = () => {
  const { doc: userProfile } = useUserProfile();
  const { doc: myPlayer } = useMyPlayer();

  const [defaultTeam, setDefaultTeam] = useState<Team>();

  useEffect(() => {
    if (!userProfile || !myPlayer) return;

    (async () => {
      const { result: teams } = await getDocuments<Team>('Teams', {
        where: [
          {
            fieldPath: 'defaultTeam',
            opStr: '==',
            value: true,
          },
          {
            fieldPath: 'owners',
            opStr: 'array-contains',
            value: userProfile?.id,
          },
        ],
      });

      if (teams.length) {
        setDefaultTeam(teams[0]);
      } else {
        // Should never get here.
      }
    })();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myPlayer, userProfile]);

  return defaultTeam;
};
