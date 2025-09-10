import { useSelector } from 'react-redux';

import { useDocument } from 'firebase/firestore';
import { selectTeam } from 'store/selectors/teamSelectors';
import { Team } from 'types/team';

export const useSelectedTeam = () => {
  const selectedTeamId = useSelector(selectTeam).teamId;
  const { doc: selectedTeam } = useDocument<Team>('Teams', selectedTeamId);
  return selectedTeam;
};
