import { useEffect, useState } from 'react';

import { getDocuments, useDocument } from 'firebase/firestore';
import { useUserProfile } from 'lib/auth';
import { Player } from 'types/player';

export const useMyPlayer = () => {
  const { doc: userProfile } = useUserProfile();
  const [playerId, setPlayerId] = useState<string>();

  // Watch changes to my player.
  const { doc: player, loading } = useDocument<Player>('Players', playerId);

  // Get my player when my user profile is knowm.
  useEffect(() => {
    if (!userProfile) return;

    (async () => {
      const { result } = await getDocuments<Player>('Players', {
        where: [{ fieldPath: 'user', opStr: '==', value: userProfile?.id }],
      });

      if (result.length) {
        setPlayerId(result[0].id);
      } else {
        // Should never get here.
      }
    })();
  }, [userProfile, userProfile?.id]);

  return { doc: player, loading };
};
