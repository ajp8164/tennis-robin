import React, { useEffect, useMemo } from 'react';
import { ScrollView, View } from 'react-native';

import { Divider, ThemeManager, useTheme } from '@react-native-hello/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from 'components/atoms/Button';
import { useDocument } from 'firebase/firestore';
import { decodeSportEvent } from 'lib/sportEvent';
import { SportEventScoreboardNavigatorParamList } from 'types/navigation';
import { SportEventEncoded } from 'types/sportEvent';

export type Props = NativeStackScreenProps<
  SportEventScoreboardNavigatorParamList,
  'SportEventStart'
>;

const SportEventStartScreen = ({ navigation, route }: Props) => {
  const { sportEventId } = route.params || {};

  const theme = useTheme();
  const s = useStyles();

  const { doc: sportEventEncoded } = useDocument<SportEventEncoded>(
    'SportEvents',
    sportEventId,
  );

  const sportEvent = useMemo(
    () => decodeSportEvent(sportEventEncoded),
    [sportEventEncoded],
  );

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => {
        return (
          <Button
            title={'Cancel'}
            titleStyle={theme.styles.buttonScreenHeaderTitle}
            buttonStyle={theme.styles.buttonScreenHeader}
            onPress={() => navigation.goBack()}
          />
        );
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <ScrollView
        style={theme.styles.view}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior={'automatic'}>
        <Divider />
      </ScrollView>
      <View style={s.bottomButton}>
        <Button
          title={'Begin Event'}
          titleStyle={theme.styles.buttonTitle}
          buttonStyle={theme.styles.button}
          containerStyle={theme.styles.buttonContainer}
          onPress={() =>
            navigation.navigate('SportEventScoreboard', {
              sportEventId,
              screenTitle: sportEvent?.name || 'Event',
            })
          }
        />
      </View>
    </>
  );
};

const useStyles = ThemeManager.createStyleSheet(({ device, theme }) => ({
  bottomButton: {
    height: 80,
    marginBottom: device.insets.bottom,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: theme.colors.subtleGray,
  },
}));

export default SportEventStartScreen;
