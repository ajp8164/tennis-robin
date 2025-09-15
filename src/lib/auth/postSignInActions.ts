import { addDocument, getDocuments } from 'firebase/firestore';
import { defaultTeamName } from 'lib/team';
import { store } from 'store';
import { saveSelectedTeam } from 'store/slices/team';
import { Player, PlayerStatus } from 'types/player';
import { Team } from 'types/team';
import { UserProfile } from 'types/user';

export const postSignInActions = async (userProfile: UserProfile) => {
  const player = await initializeMyPlayer(userProfile);
  initializeMyDefaultTeam(userProfile, player);
};

const initializeMyPlayer = async (userProfile: UserProfile) => {
  // Make sure there is a player document for me.
  const { result } = await getDocuments<Player>('Players', {
    where: [{ fieldPath: 'user', opStr: '==', value: userProfile?.id }],
  });

  // First time signin there will be no player doc. Create one here.
  if (!result.length) {
    const player = await addDocument<Player>('Players', {
      firstName: userProfile.firstName,
      lastName: userProfile.lastName,
      email: userProfile.email,
      user: userProfile.id,
      status: PlayerStatus.Active,
    });
    return player;
  }
  return result[0];
};

const initializeMyDefaultTeam = async (
  userProfile: UserProfile,
  player: Player,
) => {
  const { result } = await getDocuments<Team>('Teams', {
    where: [
      {
        fieldPath: 'defaultTeam',
        opStr: '==',
        value: true,
      },
      {
        fieldPath: 'owners',
        opStr: 'array-contains',
        value: userProfile.id,
      },
    ],
  });

  if (!result.length) {
    // Create my default team.
    const team = await addDocument<Team>('Teams', {
      name: defaultTeamName,
      owners: [userProfile.id],
      players: [player.id!],
      sportEvents: [],
      defaultTeam: true,
    });

    // Set default team as the selection.
    store.dispatch(saveSelectedTeam({ teamId: team.id }));
  } else {
    // Ensure a team is selected.
    if (!store.getState().team.teamId) {
      store.dispatch(saveSelectedTeam({ teamId: result[0].id }));
    }
  }
};
