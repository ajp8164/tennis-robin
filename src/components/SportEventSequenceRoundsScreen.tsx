import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import {
  Carousel,
  CarouselMethods,
  Divider,
  ThemeManager,
  useDevice,
  useTheme,
} from '@react-native-hello/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from 'components/atoms/Button';
import { EmptyView } from 'components/molecules/EmptyView';
import ScheduleRoundView from 'components/molecules/ScheduleRoundView';
import { useDocument } from 'firebase/firestore';
import { decodeSportEvent } from 'lib/sportEvent';
import { ChevronRight } from 'lucide-react-native';
import { SportEventSequenceNavigatorParamList } from 'types/navigation';
import { SportEventEncoded } from 'types/sportEvent';

export type Props = NativeStackScreenProps<
  SportEventSequenceNavigatorParamList,
  'SportEventRounds'
>;

const SportEventRoundsScreen = ({ navigation, route }: Props) => {
  const { sportEventId } = route.params || {};

  const theme = useTheme();
  const s = useStyles();
  const device = useDevice();

  const { doc: sportEventEncoded } = useDocument<SportEventEncoded>(
    'SportEvents',
    sportEventId,
  );

  const sportEvent = useMemo(
    () => decodeSportEvent(sportEventEncoded),
    [sportEventEncoded],
  );

  const carouselRef = useRef<CarouselMethods>(null);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => {
        return (
          <Button
            title={'End Event'}
            titleStyle={{
              ...theme.styles.buttonScreenHeaderTitle,
              color: theme.colors.stickyWhite,
              backgroundColor: theme.colors.screenHeaderButtonText,
              fontWeight: '700',
              right: 25,
              borderRadius: 30,
              paddingHorizontal: 10,
              paddingTop: 3,
              paddingBottom: 5,
            }}
            buttonStyle={theme.styles.buttonScreenHeader}
            iconRight
            icon={
              <ChevronRight
                color={theme.colors.screenHeaderButtonText}
                size={30}
                style={{ right: -20 }}
              />
            }
            onPress={() => null}
          />
        );
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pages =
    sportEvent?.schedule?.allRounds.map((_round, r) => {
      return (
        <>
          <View style={s.carouselPage}>
            <Divider text={`ROUND ${r + 1}`} />
          </View>
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={s.carouselPageTop}>
            <ScheduleRoundView
              r={r}
              sportEventId={sportEvent.id || ''}
              roundLabel={false}
              showScores
              containerStyle={s.roundViewContainer}
            />
          </ScrollView>
          <View style={s.carouselFooter} />
        </>
      );
    }) || [];

  const renderPagination = () => {
    return (
      <View style={s.paginationContainer}>
        {sportEvent.schedule?.allRounds.map((_, index) => (
          <Pressable
            key={`${index}`}
            style={[
              s.paginationButton,
              activeSlide === index
                ? s.paginationButtonActive
                : s.paginationButtonInactive,
            ]}
            onPress={() => {
              carouselRef.current?.scrollTo({ index });
              setActiveSlide(index);
            }}>
            <Text
              style={[
                s.paginationButtonText,
                activeSlide === index
                  ? s.paginationButtonActiveText
                  : s.paginationButtonInactiveText,
              ]}>
              {index + 1}
            </Text>
          </Pressable>
        ))}
      </View>
    );
  };

  if (!sportEvent?.schedule?.allRounds.length) {
    return (
      <EmptyView
        type={'info'}
        message={'No Rounds Scheduled'}
        details={'This event likely has no players.'}
      />
    );
  }

  return (
    <Animated.View
      style={{ height: '100%' }}
      entering={FadeIn.delay(500).duration(200)}>
      <Carousel
        ref={carouselRef}
        pages={pages}
        width={device.screen.width}
        height={
          device.screen.height -
          device.insets.top -
          device.insets.bottom -
          device.bottomTabBarHeight
        }
        style={{ paddingHorizontal: 20 }}
        onSnapToItem={index => setActiveSlide(index)}
        CustomPagination={renderPagination()}
      />
    </Animated.View>
  );
};

const useStyles = ThemeManager.createStyleSheet(({ theme }) => ({
  carouselFooter: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.brandSecondary,
  },
  carouselPage: {
    ...theme.styles.view,
    height: 'auto',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.listItemBorder,
    backgroundColor: theme.colors.viewAltBackground,
  },
  carouselPageTop: {
    paddingTop: 10,
  },
  paginationButton: {
    width: 30,
    height: 30,
    borderRadius: 5,
    marginHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  paginationButtonActive: {
    backgroundColor: theme.colors.brandSecondary,
    borderColor: theme.colors.brandSecondary,
  },
  paginationButtonInactive: {
    borderColor: theme.colors.listItemBorder,
  },
  paginationButtonText: {
    ...theme.text.normal,
  },
  paginationButtonActiveText: {
    color: theme.colors.stickyWhite,
    fontWeight: '700',
  },
  paginationButtonInactiveText: {},
  paginationContainer: {
    flexDirection: 'row',
    marginTop: 10,
    alignSelf: 'center',
  },
  roundViewContainer: {
    marginHorizontal: 10,
  },
}));

export default SportEventRoundsScreen;
