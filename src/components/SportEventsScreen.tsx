import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  SectionList,
  SectionListData,
  SectionListRenderItem,
  View,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Animated, { FadeIn } from 'react-native-reanimated';

import { documentId } from '@react-native-firebase/firestore';
import {
  Divider,
  ListEditor,
  ListEditorMethods,
  ListEditorState,
  ListItemSwipeable,
  listItemPosition,
  useTheme,
} from '@react-native-hello/ui';
import { useHeaderHeight } from '@react-navigation/elements';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from 'components/atoms/Button';
import { EmptyView } from 'components/molecules/EmptyView';
import { archiveDocument, useCollection } from 'firebase/firestore';
import { groupItems } from 'lib/sectionList';
import { useSelectedTeam } from 'lib/team';
import { useConfirmAction } from 'lib/useConfirmAction';
import { CircleMinus, Plus, Trash2 } from 'lucide-react-native';
import { DateTime } from 'luxon';
import {
  SportEventEditorTabNavigatorParamList,
  SportEventsNavigatorParamList,
} from 'types/navigation';
import { SportEvent } from 'types/sportEvent';

type Section = {
  title?: string;
  data: SportEvent[];
};

export type Props = CompositeScreenProps<
  NativeStackScreenProps<SportEventsNavigatorParamList, 'SportEvents'>,
  NativeStackScreenProps<SportEventEditorTabNavigatorParamList>
>;

const SportEventsScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const headerHeight = useHeaderHeight();
  const confirmAction = useConfirmAction();

  const { doc: selectedTeam } = useSelectedTeam();

  const { docs: allSportEvents } = useCollection<SportEvent>(
    'SportEvents',
    {
      where: [
        {
          fieldPath: documentId(),
          opStr: 'in',
          value: selectedTeam?.sportEvents || [],
        },
      ],
      orderBy: [{ fieldPath: 'name', directionStr: 'asc' }],
    },
    [selectedTeam],
  );

  const listEditorRef = useRef<ListEditorMethods>(null);
  const [listEditorState, setListEditorState] = useState<ListEditorState>();

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => {
        return (
          <>
            {allSportEvents.length ? (
              <Button
                title={listEditorState?.enabled ? 'Done' : 'Edit'}
                titleStyle={theme.styles.buttonScreenHeaderTitle}
                buttonStyle={theme.styles.buttonScreenHeader}
                onPress={() => listEditorRef.current?.onToggleEditMode()}
              />
            ) : null}
          </>
        );
      },
      headerRight: () => {
        return (
          <Button
            buttonStyle={theme.styles.buttonScreenHeader}
            headerRight
            icon={
              <Plus color={theme.colors.screenHeaderButtonText} size={28} />
            }
            onPress={() =>
              navigation.navigate('NewSportEventNavigator', {
                screen: 'NewSportEvent',
                params: { sportEventId: undefined },
              })
            }
          />
        );
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listEditorState, allSportEvents]);

  const archiveSportEvent = async (sportEvent: SportEvent) => {
    try {
      await archiveDocument('SportEvents', sportEvent);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      Alert.alert(
        'SportEvent Not Deleted',
        'Something went wrong. Please try again.',
        [{ text: 'OK' }],
        {
          cancelable: false,
        },
      );
    }
  };

  const groupSportEvents = (
    sportEvents?: SportEvent[],
  ): SectionListData<SportEvent, Section>[] => {
    return groupItems<SportEvent, Section>(
      sportEvents || [],
      sportEvents => {
        const date = sportEvents.date;
        return date
          ? DateTime.fromISO(date).toFormat('MMMM yyyy').toUpperCase()
          : '';
      },
      { reverse: true },
    );
  };

  const renderSportEvent: SectionListRenderItem<SportEvent, Section> = ({
    item: sportEvent,
    section,
    index,
  }) => {
    const playerCount = `${sportEvent.players.length} Player${sportEvent.players.length !== 1 ? 's' : ''}`;
    const locationTime = `${sportEvent.location ? sportEvent.location + '\n' : ''}${DateTime.fromISO(
      sportEvent.date,
    ).toFormat('MMM d')}${DateTime.fromISO(sportEvent.date)
      .toFormat(" 'at' h:mma")
      .toLowerCase()}`;
    const status =
      sportEvent.state.status === 'not-started'
        ? locationTime
        : sportEvent.state.status === 'in-progress'
          ? 'In Progress'
          : 'Ended';

    return (
      <ListItemSwipeable
        key={sportEvent.id}
        title={sportEvent.name}
        subtitle={playerCount}
        value={status}
        valueStyle={[
          theme.text.medium,
          { color: theme.colors.listItemSubtitle },
        ]}
        position={listItemPosition(index, section.data.length)}
        rightContent={'info'}
        listEditor={listEditorRef.current}
        onPressRight={() => {
          sportEvent.state.status === 'not-started'
            ? navigation.navigate('SportEventEditorTopTabs', {
                screen: 'ScheduleTab',
                title: sportEvent.name,
              })
            : navigation.navigate('SportEventSummary', {
                sportEventId: sportEvent.id || '',
                screenTitle: sportEvent.name,
              });
        }}
        onPress={() =>
          navigation.navigate('SportEventStart', {
            sportEventId: sportEvent.id || '',
            screenTitle: sportEvent.name,
          })
        }
        showEditor={listEditorState?.show}
        editAction={{
          ButtonComponent: <CircleMinus color={theme.colors.assertive} />,
          op: 'open-swipeable',
          draggable: true,
        }}
        swipeableActionsRight={[
          {
            text: 'Delete',
            color: theme.colors.warning,
            ButtonComponent: <Trash2 color={theme.colors.stickyWhite} />,
            op: 'remove',
            confirmation: () => {
              listEditorRef.current?.reset();
              return confirmAction({
                label: `Archive Event`,
                title:
                  'Archived sport events can be retrieved later by changing your settings.\nAre you sure you want to archive this sportEvent?',
              });
            },
            onPress: () => sportEvent.id && archiveSportEvent(sportEvent),
          },
        ]}
      />
    );
  };
  const renderSportEventsEmpty = () => (
    <>
      <Divider />
      <EmptyView
        type={'info'}
        message={'No Events'}
        details={'Add an Event and go play!'}
        positionTop
        buttonTitle={'Add Event'}
        onButtonPress={() =>
          navigation.navigate('NewSportEventNavigator', {
            screen: 'NewSportEvent',
            params: { sportEventId: undefined },
          })
        }
      />
    </>
  );

  return (
    <ScrollView
      style={theme.styles.view}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior={'automatic'}
      contentContainerStyle={{ flexGrow: 1, marginBottom: headerHeight }}>
      <Animated.Text
        style={[theme.text.medium, { paddingLeft: 10 }]}
        entering={FadeIn}>
        {selectedTeam?.name || ''}
      </Animated.Text>
      <ListEditor ref={listEditorRef} onChangeState={setListEditorState}>
        <SectionList
          showsVerticalScrollIndicator={false}
          contentInsetAdjustmentBehavior={'automatic'}
          stickySectionHeadersEnabled={true}
          scrollEnabled={false}
          sections={groupSportEvents([...allSportEvents])}
          keyExtractor={(item, index) => `${index}${item.id}`}
          renderItem={renderSportEvent}
          renderSectionHeader={({ section: { title } }) => (
            <View style={theme.styles.listSectionHeader}>
              <Divider text={title} />
            </View>
          )}
          ListFooterComponent={<Divider />}
          ListEmptyComponent={renderSportEventsEmpty()}
        />
      </ListEditor>
    </ScrollView>
  );
};

export default SportEventsScreen;
