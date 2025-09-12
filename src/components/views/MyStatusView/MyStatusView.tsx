import React from 'react';
import { View } from 'react-native';

import {
  Divider,
  ListItemCheckBox,
  ThemeManager,
  useTheme,
} from '@react-native-hello/ui';
import { DynamicIcon } from 'components/atoms/DynamicIcon';
import { updateDocument } from 'firebase/firestore';
import { appIcons } from 'lib/appIcons';
import { useMyPlayer, usePlayerStatusDecoration } from 'lib/player';
import { Player, PlayerStatus } from 'types/player';

interface MyStatusViewInterface {
  onChangeStatus?: (status: PlayerStatus) => void;
}

export const MyStatusView = (props: MyStatusViewInterface) => {
  const { onChangeStatus } = props;

  const theme = useTheme();
  const s = useStyles();

  const playerStatusDecoration = usePlayerStatusDecoration();
  const myPlayer = useMyPlayer();

  const setStatus = (status: PlayerStatus) => {
    if (myPlayer) {
      updateDocument<Player>('Players', {
        ...myPlayer,
        status,
      });
      onChangeStatus?.(status);
    }
  };

  return (
    <View style={theme.styles.viewAlt}>
      <Divider />
      <View style={s.container}>
        {(Object.keys(playerStatusDecoration) as Array<PlayerStatus>).map(
          status => {
            if (!playerStatusDecoration[status].userSettable) return null;
            return (
              <ListItemCheckBox
                key={playerStatusDecoration[status].label}
                title={playerStatusDecoration[status].label}
                titleStyle={s.title}
                containerStyle={s.statusContainer}
                checkedColor={theme.colors.stickyWhite}
                position={['first', 'last']}
                leftContent={
                  <DynamicIcon
                    icon={appIcons[playerStatusDecoration[status].icon]}
                    color={theme.colors.stickyWhite}
                  />
                }
                checked={myPlayer?.status === status}
                onChange={() => setStatus(status)}
              />
            );
          },
        )}
      </View>
    </View>
  );
};

const useStyles = ThemeManager.createStyleSheet(({ device, theme }) => ({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statusContainer: {
    backgroundColor: theme.colors.button,
    // Subtract view margins to get two in each row. Subtract a gap between.
    width: device.screen.width / 2 - 7 - 3,
    marginBottom: 6, // Gap * 2
  },
  title: {
    color: theme.colors.stickyWhite,
  },
}));

export default MyStatusView;
