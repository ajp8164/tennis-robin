import { useSelector } from 'react-redux';

import { useDocument } from 'firebase/firestore';
import { selectTeam } from 'store/selectors/teamSelectors';
import { Team } from 'types/team';

export const useSelectedTeam = () => {
  const selectedTeamId = useSelector(selectTeam).teamId;
  return useDocument<Team>('Teams', selectedTeamId);
};
