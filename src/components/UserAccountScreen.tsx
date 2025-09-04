import React, { useEffect } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { useSelector } from 'react-redux';

import {
  Divider,
  ListItem,
  ThemeManager,
  useTheme,
} from '@react-native-hello/ui';
import { CompositeScreenProps } from '@react-navigation/core';
import { StackActions } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Avatar } from 'components/atoms/Avatar';
import { Button } from 'components/atoms/Button';
import { EmptyView } from 'components/molecules/EmptyView';
import { signOut } from 'lib/auth';
import { biometricAuthentication } from 'lib/biometricAuthentication';
import { UserRoundPen } from 'lucide-react-native';
import { DateTime } from 'luxon';
import { selectUserProfile } from 'store/selectors/userSelectors';
import {
  MainNavigatorParamList,
  SetupNavigatorParamList,
} from 'types/navigation';

type Props = CompositeScreenProps<
  NativeStackScreenProps<SetupNavigatorParamList, 'UserAccount'>,
  NativeStackScreenProps<MainNavigatorParamList>
>;

const UserAccountScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const s = useStyles();

  const userProfile = useSelector(selectUserProfile);

  useEffect(() => {
    // Wait for sign out to complete before navigating away.
    if (!userProfile) {
      navigation.dispatch(StackActions.popToTop());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userProfile]);

  const confirmSignOut = async () => {
    await biometricAuthentication()
      .then(() => {
        Alert.alert(
          'Confirm Signing Out',
          'Are you sure you want to signout?',
          [
            {
              text: 'Yes, sign out',
              style: 'destructive',
              onPress: signOut,
            },
            {
              text: 'No',
              style: 'cancel',
            },
          ],
          { cancelable: false },
        );
      })
      .catch();
  };

  if (!userProfile) {
    return <EmptyView error message={'User Profile Not Found!'} />;
  }

  return (
    <ScrollView
      style={theme.styles.view}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior={'automatic'}>
      <View style={s.header}>
        <Avatar
          userProfile={userProfile}
          size={'giant'}
          avatarStyle={s.avatar}
        />
        <Text style={s.title}>{userProfile.name}</Text>
        <Text style={s.subtitle}>{userProfile.email}</Text>
        <Text style={s.subtitle}>
          {`Since ${DateTime.fromISO(userProfile.createdOn).toFormat('MMMM yyyy')}`}
        </Text>
      </View>
      <Divider />
      <ListItem
        title={'Edit User Profile'}
        leftContent={<UserRoundPen color={theme.colors.listItemIcon} />}
        rightContent={'chevron-right'}
        position={['first', 'last']}
        onPress={() => navigation.navigate('UserProfileEditor')}
      />
      <Divider />
      <Button
        title={'Sign Out'}
        titleStyle={theme.styles.buttonOutlineTitle}
        buttonStyle={theme.styles.buttonOutline}
        containerStyle={theme.styles.buttonContainer}
        outline
        onPress={confirmSignOut}
      />
    </ScrollView>
  );
};

const useStyles = ThemeManager.createStyleSheet(({ theme }) => ({
  avatar: {
    marginVertical: 15,
    overflow: 'hidden',
  },
  header: {
    alignItems: 'center',
  },
  signInButtonContainer: {
    width: '80%',
    alignSelf: 'center',
    marginBottom: 15,
  },
  signOut: {
    fontFamily: theme.fonts.bold,
    width: '100%',
    color: theme.colors.brandPrimary,
  },
  subtitle: {
    ...theme.text.small,
  },
  title: {
    ...theme.text.h4,
    fontFamily: theme.fonts.bold,
    marginBottom: 5,
  },
}));

export default UserAccountScreen;
