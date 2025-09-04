import { useEffect, useState } from 'react';
import { TextStyle, ViewStyle } from 'react-native';
import RNFS from 'react-native-fs';

import {
  Avatar as RNHAvatar,
  ThemeManager,
  useTheme,
} from '@react-native-hello/ui';
import { CircleUserRound } from 'lucide-react-native';
import { UserProfile } from 'types/user';

interface AvatarInterface {
  avatarStyle?: ViewStyle;
  onPress?: () => void;
  size?: 'tiny' | 'small' | 'medium' | 'large' | 'giant' | 'list';
  titleStyle?: TextStyle;
  userProfile?: UserProfile;
}

export const Avatar = (props: AvatarInterface) => {
  const {
    avatarStyle,
    onPress,
    size = 'list',
    titleStyle,
    userProfile,
  } = props;

  const theme = useTheme();
  const s = useStyles();

  const [profileImageExists, setProfileImageExists] = useState(true);

  const _avatarStyle =
    size === 'list'
      ? s.avatarList
      : size === 'tiny'
        ? s.avatarTiny
        : size === 'small'
          ? s.avatarSmall
          : size === 'medium'
            ? s.avatarMedium
            : size === 'large'
              ? s.avatarLarge
              : s.avatarGiant;

  const _titleStyle =
    size === 'list'
      ? s.avatarTitleList
      : size === 'tiny'
        ? s.avatarTitleTiny
        : size === 'small'
          ? s.avatarTitleSmall
          : size === 'medium'
            ? s.avatarTitleMedium
            : size === 'large'
              ? s.avatarTitleLarge
              : s.avatarTitleGiant;

  useEffect(() => {
    if (!userProfile || !userProfile.photoUrl) return;

    RNFS.exists(userProfile.photoUrl)
      .then(setProfileImageExists)
      .catch(() => {
        // Ignore errors
      });
  }, [userProfile]);

  const renderUserAvatar = (userProfile?: UserProfile) => {
    if (!userProfile) {
      // Icon image
      return (
        <RNHAvatar
          Icon={
            <CircleUserRound
              color={theme.colors.white}
              size={_avatarStyle.width}
            />
          }
          imageProps={{ resizeMode: 'cover' }}
          containerStyle={{
            ..._avatarStyle,
            backgroundColor: theme.colors.subtleGray,
            ...avatarStyle,
          }}
          onPress={onPress}
        />
      );
    } else {
      if (userProfile.photoUrl.length && profileImageExists) {
        // A profile image
        return (
          <RNHAvatar
            source={{
              uri: userProfile.photoUrl,
            }}
            imageProps={{ resizeMode: 'cover' }}
            containerStyle={[_avatarStyle, avatarStyle]}
            onPress={onPress}
          />
        );
      } else if (userProfile.photoUrlDefault.length) {
        // A profile image
        return (
          <RNHAvatar
            source={{
              uri: userProfile.photoUrlDefault,
            }}
            imageProps={{ resizeMode: 'cover' }}
            containerStyle={[_avatarStyle, avatarStyle]}
            onPress={onPress}
          />
        );
      } else {
        // A default avatar (name initials)
        return (
          <RNHAvatar
            title={userProfile?.avatar.title}
            titleStyle={[_titleStyle, titleStyle]}
            containerStyle={{
              ..._avatarStyle,
              ...s.avatarPlaceholder,
              backgroundColor:
                userProfile?.avatar.color || theme.colors.subtleGray,
              ...avatarStyle,
            }}
            onPress={onPress}
          />
        );
      }
    }
  };

  return renderUserAvatar(userProfile);
};

const useStyles = ThemeManager.createStyleSheet(({ theme }) => ({
  avatarPlaceholder: {
    alignItems: 'center',
  },
  avatarGiant: {
    width: 100,
    height: 100,
    borderRadius: 100,
    overflow: 'hidden',
  },
  avatarLarge: {
    width: 55,
    height: 55,
    borderRadius: 55,
    overflow: 'hidden',
  },
  avatarList: {
    width: 24,
    height: 24,
    borderRadius: 24,
    overflow: 'hidden',
  },
  avatarMedium: {
    width: 42,
    height: 42,
    borderRadius: 42,
    overflow: 'hidden',
  },
  avatarSmall: {
    width: 34,
    height: 34,
    borderRadius: 34,
    overflow: 'hidden',
  },
  avatarTiny: {
    width: 30,
    height: 30,
    borderRadius: 30,
    overflow: 'hidden',
  },
  avatarTitleGiant: {
    ...theme.text.giant,
    lineHeight: 0,
    color: theme.colors.stickyWhite,
  },
  avatarTitleLarge: {
    ...theme.text.xl,
    color: theme.colors.stickyWhite,
  },
  avatarTitleList: {
    ...theme.text.small,
    color: theme.colors.stickyWhite,
  },
  avatarTitleMedium: {
    ...theme.text.large,
    color: theme.colors.stickyWhite,
  },
  avatarTitleSmall: {
    ...theme.text.normal,
    color: theme.colors.stickyWhite,
  },
  avatarTitleTiny: {
    ...theme.text.normal,
    color: theme.colors.stickyWhite,
  },
}));
