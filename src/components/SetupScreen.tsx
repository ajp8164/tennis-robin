import React, { useContext, useEffect } from 'react';
import { ScrollView } from 'react-native';
import {  useSelector } from 'react-redux';

import {
  Divider,
  ListItem,
  useTheme,
} from '@react-native-hello/ui';
import { CompositeScreenProps } from '@react-navigation/core';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { appConfig } from 'config';
import { AuthContext } from 'lib/auth';
import {
  CircleUserRound,
  Info,
  Settings,
} from 'lucide-react-native';
import { selectUserProfile } from 'store/selectors/userSelectors';
import {
  SetupNavigatorParamList,
  TabNavigatorParamList,
} from 'types/navigation';
import { Avatar } from 'components/atoms/Avatar';

export type Props = CompositeScreenProps<
  NativeStackScreenProps<SetupNavigatorParamList, 'Setup'>,
  NativeStackScreenProps<TabNavigatorParamList>
>;

const SetupScreen = ({ navigation, route }: Props) => {
  const theme = useTheme();

  const auth = useContext(AuthContext);
  const userProfile = useSelector(selectUserProfile);

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
      contentInsetAdjustmentBehavior={'automatic'}>
      <Divider text={'ACCOUNT'} />
      {userProfile ? (
        <ListItem
          title={userProfile.name || userProfile.email || 'My Account'}
          leftContent={<Avatar userProfile={userProfile} size={'list'} />}
          position={['first', 'last']}
          rightContent={'chevron-right'}
          onPress={() => navigation.navigate('UserAccount')}
        />
      ) : (
        <ListItem
          title={'Sign In or Sign Up'}
          leftContent={<CircleUserRound color={theme.colors.listItemIcon} />}
          position={['first', 'last']}
          rightContent={'chevron-right'}
          onPress={() => auth.presentSignInModal()}
        />
      )}
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
