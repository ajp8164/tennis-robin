import React, { useEffect } from 'react';
import { ScrollView } from 'react-native';

import { Divider, ListItem, useTheme } from '@react-native-hello/ui';
import { CompositeScreenProps } from '@react-navigation/core';
import { useHeaderHeight } from '@react-navigation/elements';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Avatar } from 'components/atoms/Avatar';
import { appConfig } from 'config';
import { useUserProfile } from 'lib/auth';
import { useSelectedTeam } from 'lib/team';
import { Info, Settings, Users } from 'lucide-react-native';
import {
  SetupNavigatorParamList,
  TabNavigatorParamList,
} from 'types/navigation';

export type Props = CompositeScreenProps<
  NativeStackScreenProps<SetupNavigatorParamList, 'Setup'>,
  NativeStackScreenProps<TabNavigatorParamList>
>;

const SetupScreen = ({ navigation, route }: Props) => {
  const theme = useTheme();
  const headerHeight = useHeaderHeight();

  const userProfile = useUserProfile();

  const selectedTeam = useSelectedTeam();

  useEffect(() => {
    if (route.params?.subNav) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      navigation.navigate(route.params.subNav as any); // Could not discern type.
      navigation.setParams({ subNav: undefined });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route.params?.subNav]);

  return (
    <ScrollView
      style={theme.styles.view}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior={'automatic'}
      contentContainerStyle={{ flexGrow: 1, marginBottom: headerHeight }}>
      <Divider />
      <ListItem
        title={'Current Team'}
        subtitle={'Tap to select or create a team'}
        value={selectedTeam?.name}
        leftContent={<Users color={theme.colors.listItemIcon} />}
        position={['first', 'last']}
        rightContent={'chevron-right'}
        onPress={() => navigation.navigate('Teams')}
      />
      <Divider />
      <ListItem
        title={'Players'}
        leftContent={<Users color={theme.colors.listItemIcon} />}
        position={['first', 'last']}
        rightContent={'chevron-right'}
        onPress={() => navigation.navigate('Players')}
      />
      <Divider text={'ACCOUNT'} />
      <ListItem
        title={userProfile?.name || userProfile?.email || 'My Account'}
        leftContent={<Avatar userProfile={userProfile} size={'list'} />}
        position={['first', 'last']}
        rightContent={'chevron-right'}
        onPress={() => navigation.navigate('UserAccount')}
      />
      <Divider />
      <ListItem
        title={'App Settings'}
        position={['first']}
        leftContent={<Settings color={theme.colors.listItemIcon} />}
        rightContent={'chevron-right'}
        onPress={() => navigation.navigate('AppSettings')}
      />
      <ListItem
        title={`About ${appConfig.appName}`}
        position={['last']}
        leftContent={<Info color={theme.colors.listItemIcon} />}
        rightContent={'chevron-right'}
        onPress={() => navigation.navigate('About')}
      />
      <Divider />
    </ScrollView>
  );
};

export default SetupScreen;
