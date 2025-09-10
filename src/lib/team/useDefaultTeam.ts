import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import { addDocument, getDocuments } from 'firebase/firestore';
import { useUserProfile } from 'lib/auth';
import { saveSelectedTeam } from 'store/slices/team';
import { Team } from 'types/team';

export const defaultTeamName = 'Default Team';

export const useDefaultTeam = () => {
  const dispatch = useDispatch();
  const userProfile = useUserProfile();

  const [defaultTeam, setDefaultTeam] = useState<Team>();

  useEffect(() => {
    if (!userProfile) return;

    (async () => {
      const { result: defaultTeam } = await getDocuments<Team>('Teams', {
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

      let team = defaultTeam?.[0];

      if (!team) {
        // Lazily create the default team.
        team = await addDocument<Team>('Teams', {
          name: defaultTeamName,
          owners: [userProfile?.id],
          users: [userProfile?.id],
          groups: [],
          defaultTeam: true,
        });

        // Set default team as the selection.
        dispatch(
          saveSelectedTeam({
            teamId: team.id,
          }),
        );
      }

      setDefaultTeam(team);
    })();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userProfile]);

  return defaultTeam;
};
