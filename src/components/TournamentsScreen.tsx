import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  ListRenderItem,
  SectionList,
  SectionListData,
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
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from 'components/atoms/Button';
import { EmptyView } from 'components/molecules/EmptyView';
import { archiveDocument, useCollection } from 'firebase/firestore';
import { groupItems } from 'lib/sectionList';
import { useSelectedTeam } from 'lib/team';
import { useConfirmAction } from 'lib/useConfirmAction';
import { CircleMinus, Plus, Trash2 } from 'lucide-react-native';
import { DateTime } from 'luxon';
import { TournamentsNavigatorParamList } from 'types/navigation';
import { Tournament } from 'types/tournament';

type Section = {
  title?: string;
  data: Tournament[];
};

export type Props = NativeStackScreenProps<
  TournamentsNavigatorParamList,
  'Tournaments'
>;

const TournamentsScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const headerHeight = useHeaderHeight();
  const confirmAction = useConfirmAction();

  const selectedTeam = useSelectedTeam();

  const { docs: allTournaments } = useCollection<Tournament>('Tournaments', {
    where: [
      {
        fieldPath: documentId(),
        opStr: 'in',
        value: selectedTeam?.tournaments || [],
      },
    ],
    orderBy: [{ fieldPath: 'name', directionStr: 'asc' }],
  });

  const listEditorRef = useRef<ListEditorMethods>(null);
  const [listEditorState, setListEditorState] = useState<ListEditorState>();

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => {
        return (
          <>
            {allTournaments.length ? (
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
            onPress={() => navigation.navigate('NewTournament', {})}
          />
        );
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listEditorState, allTournaments]);

  const archiveTournament = async (tournament: Tournament) => {
    try {
      await archiveDocument('Tournaments', tournament);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      Alert.alert(
        'Tournament Not Deleted',
        'Something went wrong. Please try again.',
        [{ text: 'OK' }],
        {
          cancelable: false,
        },
      );
    }
  };

  const groupTournaments = (
    tournaments?: Tournament[],
  ): SectionListData<Tournament, Section>[] => {
    return groupItems<Tournament, Section>(tournaments || [], tournaments => {
      const date = tournaments.date;
      return date
        ? DateTime.fromISO(date).toFormat('MMMM yyyy').toUpperCase()
        : '';
    });
  };

  const renderTournament: ListRenderItem<Tournament> = ({
    item: tournament,
    index,
  }) => {
    return (
      <ListItemSwipeable
        key={tournament.id}
        title={tournament.name}
        subtitle={`${tournament.players.length} Player${tournament.players.length !== 1 ? 's' : ''}`}
        value={`${tournament.location}\n${DateTime.fromISO(tournament.date).toFormat("M/d 'at' h:mm")}`}
        valueStyle={theme.text.medium}
        position={listItemPosition(index, allTournaments.length)}
        rightContent={'chevron-right'}
        listEditor={listEditorRef.current}
        onPress={() =>
          navigation.navigate('TournamentEditor', {
            tournamentId: tournament.id || '',
            screenTitle: tournament.name,
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
            color: theme.colors.assertive,
            ButtonComponent: <Trash2 color={theme.colors.stickyWhite} />,
            op: 'remove',
            confirmation: () => {
              listEditorRef.current?.reset();
              return confirmAction({
                label: `Delete Tournament`,
                title:
                  'This action cannot be undone.\nAre you sure you want to delete this tournament?',
              });
            },
            onPress: () => tournament.id && archiveTournament(tournament),
          },
        ]}
      />
    );
  };
  const renderTournamentsEmpty = () => (
    <>
      <Divider />
      <EmptyView
        type={'info'}
        message={'No Tournaments'}
        details={'Add a Tournament and go play!'}
        positionTop
        buttonTitle={'Add Tournament'}
        onButtonPress={() => navigation.navigate('NewTournament', {})}
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
          sections={groupTournaments([...allTournaments].reverse())} // Most recent tournament at the top
          keyExtractor={(item, index) => `${index}${item.id}`}
          renderItem={renderTournament}
          renderSectionHeader={({ section: { title } }) => (
            <View style={theme.styles.listSectionHeader}>
              <Divider text={title} />
            </View>
          )}
          ListFooterComponent={<Divider />}
          ListEmptyComponent={renderTournamentsEmpty()}
        />
      </ListEditor>
    </ScrollView>
  );
};

export default TournamentsScreen;
