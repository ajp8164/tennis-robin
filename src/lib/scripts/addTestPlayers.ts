import { addDocument, getDocument, updateDocument } from 'firebase/firestore';
import { Player, PlayerStatus } from 'types/player';
import { Team } from 'types/team';

export const addTestPlayers = async (teamId: string) => {
  const players: Player[] = [];

  players.push(
    await addDocument<Player>('Players', {
      firstName: 'Andy',
      lastName: 'Phillipson',
      email: 'andyphillipson@gmail.com',
      user: '1Eofw7OMH6TFqjqDaHiZf8g08zr2',
      status: PlayerStatus.Active,
    }),
  );
  players.push(
    await addDocument<Player>('Players', {
      firstName: 'John',
      lastName: 'Appleseed',
      email: 'John-Appleseed@mac.com',
      user: '',
      status: PlayerStatus.Active,
    }),
  );
  players.push(
    await addDocument<Player>('Players', {
      firstName: 'Kate',
      lastName: 'Bell',
      email: 'kate-bell@mac.com',
      user: '',
      status: PlayerStatus.Active,
    }),
  );
  players.push(
    await addDocument<Player>('Players', {
      firstName: 'Anna',
      lastName: 'Haro',
      email: 'anna-haro@mac.com',
      user: '',
      status: PlayerStatus.Active,
    }),
  );
  players.push(
    await addDocument<Player>('Players', {
      firstName: 'Daniel',
      lastName: 'Higgins',
      email: 'd-higgins@mac.com',
      user: '',
      status: PlayerStatus.Active,
    }),
  );
  players.push(
    await addDocument<Player>('Players', {
      firstName: 'Hank',
      lastName: 'Zakroff',
      email: 'hank-zakroff@mac.com',
      user: '',
      status: PlayerStatus.Active,
    }),
  );
  players.push(
    await addDocument<Player>('Players', {
      firstName: 'Pluto',
      lastName: 'Dog',
      email: 'pluto@wdw.com',
      user: '',
      status: PlayerStatus.Active,
    }),
  );
  players.push(
    await addDocument<Player>('Players', {
      firstName: 'Mickey',
      lastName: 'Mouse',
      email: 'mickey@wdw.com',
      user: '',
      status: PlayerStatus.Active,
    }),
  );
  players.push(
    await addDocument<Player>('Players', {
      firstName: 'Donald',
      lastName: 'Duck',
      email: 'donald@wdw.com',
      user: '',
      status: PlayerStatus.Active,
    }),
  );

  const team = await getDocument<Team>('Teams', teamId);

  if (team) {
    await updateDocument<Team>('Teams', {
      ...team,
      // players: [...new Set([...team.players, ...players.map(p => p.id)])],
      players: [...new Set([...players.map(p => p.id)])],
    } as Team);
  }
};
