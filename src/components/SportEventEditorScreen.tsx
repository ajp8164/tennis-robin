import React, { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Keyboard,
  ListRenderItem,
  ScrollView,
  View,
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { documentId } from '@react-native-firebase/firestore';
import { ISODateString } from '@react-native-hello/common';
import { useEvent } from '@react-native-hello/core';
import {
  Divider,
  InputMethods,
  KeyboardAccessory,
  KeyboardAccessoryMethods,
  ListEditor,
  ListEditorMethods,
  ListEditorState,
  ListItem,
  ListItemDateTime,
  ListItemSegmented,
  ListItemSwipeable,
  ThemeManager,
  listItemPosition,
  useTheme,
} from '@react-native-hello/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { EnumPickerResult, EnumPickerValue } from 'components/EnumPickerScreen';
import { Button } from 'components/atoms/Button';
import { DynamicIcon } from 'components/atoms/DynamicIcon';
import {
  FormikStateWatcher,
  FormikWatcherState,
} from 'components/atoms/FormikStateWatcher';
import {
  ListItemCheckBoxInfo,
  ListItemInput,
  ListItemInputMethods,
  ListItemStepper,
} from 'components/atoms/List';
import { EmptyView } from 'components/molecules/EmptyView';
import {
  addDocument,
  getDocuments,
  updateDocument,
  useCollection,
  useDocument,
} from 'firebase/firestore';
import { Formik, FormikProps } from 'formik';
import { appIcons } from 'lib/appIcons';
import { useUserProfile } from 'lib/auth';
import { usePlayerStatusDecoration } from 'lib/player';
import { decodeSportEvent, encodeSportEvent } from 'lib/sportEvent';
import { uniquePartnerDoubles } from 'lib/sportEvent/sportEventAlgorithms';
import { useSelectedTeam } from 'lib/team';
import { CircleMinus, EyeOff } from 'lucide-react-native';
import { DateTime } from 'luxon';
import { SportEventsNavigatorParamList } from 'types/navigation';
import { Player } from 'types/player';
import {
  MatchGender,
  MatchKind,
  Schedule,
  SportEventEncoded,
} from 'types/sportEvent';
import { Team } from 'types/team';
import * as Yup from 'yup';

// CompositeScreenProps not working here since NewSportEvent is also in the SetupNavigator
// just using a different presentation (didn't create a new navigator for a single screen).
export type Props =
  | NativeStackScreenProps<SportEventsNavigatorParamList, 'SportEventEditor'>
  | NativeStackScreenProps<SportEventsNavigatorParamList, 'NewSportEvent'>;

// Order of fields for accessory view.
enum Fields {
  name,
  location,
}

type FormValues = {
  name: string;
  date: ISODateString;
  location: string;
  numberOfCourts: number;
  gender: MatchGender;
  typeOfMatch: MatchKind;
};

const SportEventEditorScreen = ({ navigation, route }: Props) => {
  const { sportEventId } = route.params || {};

  const theme = useTheme();
  const s = useStyles();
  const event = useEvent();
  const playerStatusDecoration = usePlayerStatusDecoration();
  const userProfile = useUserProfile();
  const selectedTeam = useSelectedTeam();
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [schedule, setSchedule] = useState<Schedule>();

  const { doc: sportEventEncoded } = useDocument<SportEventEncoded>(
    'SportEvents',
    sportEventId,
  );
  const sportEvent = decodeSportEvent(sportEventEncoded);

  const { docs: sportEventPlayers } = useCollection<Player>('Players', {
    where: [
      {
        fieldPath: documentId(),
        opStr: 'in',
        value: sportEvent?.players || [],
      },
    ],
    orderBy: [
      { fieldPath: 'lastName', directionStr: 'asc' },
      { fieldPath: 'firstName', directionStr: 'asc' },
    ],
  });

  // For building the player picker enum.
  const [playerEnum, setPlayerEnum] = useState<EnumPickerValue[]>([]);

  const { docs: allPlayers } = useCollection<Player>('Players', {
    where: [
      {
        fieldPath: documentId(),
        opStr: 'in',
        value: selectedTeam?.players || [],
      },
    ],
    orderBy: [
      { fieldPath: 'lastName', directionStr: 'asc' },
      { fieldPath: 'firstName', directionStr: 'asc' },
    ],
  });

  const [initialValues, setInitialValues] = useState<FormValues>({
    name: '',
    date: DateTime.now().toISO(),
    location: '',
    numberOfCourts: 1,
    gender: 'mens',
    typeOfMatch: 'singles',
  });

  const schema = Yup.object().shape({
    name: Yup.string().required(),
    date: Yup.string().required(),
    location: Yup.string().required(),
    numberOfCourts: Yup.number().min(1).required(),
    gender: Yup.string().required(),
    typeOfMatch: Yup.string().required(),
  });

  const [expandedDate, setExpandedDate] = useState(false);

  const formikRef = useRef<FormikProps<FormValues>>(null);
  const [formikCanSubmit, setFormikCanSubmit] = useState(false);
  const keyboardAccessory = useRef<
    KeyboardAccessoryMethods & KeyboardAccessory
  >(null);
  const nameFieldRef = useRef<ListItemInputMethods>(null);
  const locationFieldRef = useRef<ListItemInputMethods>(null);
  const [resolvedRefs, setResolvedRefs] = useState<(InputMethods | null)[]>([]);

  const listEditorRef = useRef<ListEditorMethods>(null);
  const [listEditorState, setListEditorState] = useState<ListEditorState>();

  // Supports keyboard accessory view.
  // Ensures all refs are set.
  useEffect(() => {
    setResolvedRefs(
      [nameFieldRef.current, locationFieldRef.current].filter(Boolean),
    );
  }, []);

  useEffect(() => {
    if (sportEvent && !initialValues.name) {
      setInitialValues({
        name: sportEvent.name,
        date: sportEvent.date,
        location: sportEvent.location || '',
        numberOfCourts: sportEvent.numberOfCourts,
        gender: sportEvent.gender || 'mens',
        typeOfMatch: sportEvent.typeOfMatch || 'singles',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sportEvent]);

  useEffect(() => {
    setSelectedPlayers(sportEventPlayers);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sportEventPlayers]);

  // Create an enumeration of players for selection into the sportEvent.
  useEffect(() => {
    const playerEnum = allPlayers.map<EnumPickerValue>(p => {
      return {
        id: p.id!,
        title: `${p.firstName} ${p.lastName}`,
        subtitle: playerStatusDecoration[p.status].label,
        leftIcon: {
          icon: playerStatusDecoration[p.status].icon,
          color: playerStatusDecoration[p.status].color,
        },
      };
    });

    setPlayerEnum(playerEnum);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allPlayers]);

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => {
        // if (formikCanSubmit) {
        return (
          <Button
            title={'Cancel'}
            titleStyle={theme.styles.buttonScreenHeaderTitle}
            buttonStyle={theme.styles.buttonScreenHeader}
            // onPress={() => formikRef.current?.resetForm()}
            onPress={() => navigation.goBack()}
          />
        );
        // }
        // return null;
      },
      headerRight: () => {
        return (
          <>
            {selectedPlayers.length ? (
              <Button
                title={listEditorState?.enabled ? 'Done' : 'Edit'}
                titleStyle={theme.styles.buttonScreenHeaderTitle}
                buttonStyle={theme.styles.buttonScreenHeader}
                onPress={() => listEditorRef.current?.onToggleEditMode()}
              />
            ) : null}
            <Button
              title={'Save'}
              titleStyle={theme.styles.buttonScreenHeaderTitle}
              buttonStyle={theme.styles.buttonScreenHeader}
              disabledTitleStyle={theme.styles.buttonScreenHeaderTitle}
              disabledStyle={theme.styles.buttonScreenHeaderDisabled}
              disabled={!formikCanSubmit}
              headerRight
              onPress={save}
            />
          </>
        );
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listEditorState, formikCanSubmit, selectedPlayers]);

  useEffect(() => {
    // Event handlers for EnumPicker
    event.on('change-players', onChangePlayers);

    return () => {
      event.removeListener('change-players', onChangePlayers);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sportEvent]);

  const onChangePlayers = async (result: EnumPickerResult) => {
    const { result: players } = await getDocuments<Player>('Players', {
      where: [{ fieldPath: documentId(), opStr: 'in', value: result.value }],
    });

    // Update the schedule when player selections change.
    const updatedSchedule = updateSchedule();

    // Replace the player selections.
    if (sportEvent) {
      updateDocument<SportEventEncoded>(
        'SportEvents',
        encodeSportEvent({
          ...sportEvent,
          players: players.map(p => p.id!),
          schedule: updatedSchedule,
        }),
      );
    } else {
      setSelectedPlayers(players);
      setSchedule(updatedSchedule);
    }
  };

  const save = () => {
    formikRef.current?.handleSubmit();
    formikRef.current?.resetForm({ values: formikRef.current?.values });
    Keyboard.dismiss();
    navigation.goBack();
  };

  const onSubmit = async (values: FormValues) => {
    // Update the schedule when the number of courts changes.
    let updatedSchedule = Object.assign({}, schedule);
    if (values.numberOfCourts !== sportEvent?.numberOfCourts) {
      const u = updateSchedule();
      if (u) {
        updatedSchedule = u;
      }
    }

    if (sportEvent) {
      updateDocument<SportEventEncoded>(
        'SportEvents',
        encodeSportEvent({
          ...sportEvent,
          name: values.name,
          date: values.date,
          location: values.location,
          numberOfCourts: values.numberOfCourts,
          gender: values.gender,
          typeOfMatch: values.typeOfMatch,
          schedule: updatedSchedule,
        }),
      );
    } else {
      const newSportEvent = await addDocument<SportEventEncoded>(
        'SportEvents',
        encodeSportEvent({
          name: values.name,
          date: values.date,
          location: values.location,
          numberOfCourts: values.numberOfCourts,
          gender: values.gender,
          typeOfMatch: values.typeOfMatch,
          owners: [userProfile!.id],
          players: selectedPlayers.map(p => p.id!),
          schedule: updatedSchedule,
        }),
      );

      // Associate the new sportEvent with my selected team.
      if (selectedTeam && newSportEvent.id) {
        updateDocument<Team>('Teams', {
          ...selectedTeam,
          sportEvents: [
            ...new Set([...selectedTeam.sportEvents, newSportEvent.id]),
          ],
        } as Team);
      }
    }
  };

  const choosePlayers = () => {
    navigation.navigate('EnumPicker', {
      title: 'Players',
      values: playerEnum,
      selected: selectedPlayers.map(p => p.id!),
      itemPlural: 'Players',
      eventName: 'change-players',
      mode: 'many-or-none',
    });
  };

  const removePlayer = async (playerId: string) => {
    if (sportEvent) {
      updateDocument<SportEventEncoded>(
        'SportEvents',
        encodeSportEvent({
          ...sportEvent,
          players: sportEvent.players.filter(p => p !== playerId),
        }),
      );
    } else {
      // Remove the player from our selections.
      setSelectedPlayers(selectedPlayers.filter(p => p.id !== playerId));
    }
  };

  const onDateChange = (date?: Date) => {
    if (date) {
      formikRef.current?.setFieldValue(
        'date',
        DateTime.fromJSDate(date).toISO(),
      );
    }
  };

  const onGenderSelect = (index: number) => {
    formikRef.current?.setFieldValue('gender', index === 0 ? 'mens' : 'womens');
  };

  const onTypeOfMatchSelect = (index: number) => {
    formikRef.current?.setFieldValue(
      'typeOfMatch',
      index === 0 ? 'singles' : 'doubles',
    );
  };

  const updateSchedule = () => {
    // TODO need to choose proper algorithm...
    return uniquePartnerDoubles(
      selectedPlayers,
      formikRef.current?.values.numberOfCourts || 1,
    );
  };

  const onFormikWatcherStateChange = (
    state: FormikWatcherState<FormValues>,
  ) => {
    const { next, isValid = false } = state;
    const canSubmit = next.dirty && isValid;
    setFormikCanSubmit(canSubmit);
  };

  const renderPlayer: ListRenderItem<Player> = ({ item: player, index }) => {
    return (
      <ListItemSwipeable
        key={player.id}
        title={`${player.lastName} ${player.firstName}`}
        subtitle={playerStatusDecoration[player.status].label}
        value={
          <DynamicIcon
            icon={appIcons[playerStatusDecoration[player.status].icon]}
            color={playerStatusDecoration[player.status].color}
          />
        }
        position={listItemPosition(index, selectedPlayers.length)}
        rightContent={'chevron-right'}
        listEditor={listEditorRef.current}
        onPress={() =>
          navigation.navigate('Player', {
            playerId: player.id!,
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
            text: 'Remove',
            color: theme.colors.brandSecondary,
            ButtonComponent: <EyeOff color={theme.colors.stickyWhite} />,
            op: 'remove',
            onPress: () => player.id && removePlayer(player.id),
          },
        ]}
      />
    );
  };

  const renderPlayersHeader = () => (
    <Divider
      text={`${sportEvent?.players.length || ''} PLAYER${sportEvent?.players.length !== 1 ? 'S' : ''}`}
      rightComponent={
        <Button
          title={'Choose Players'}
          titleStyle={theme.styles.buttonScreenHeaderTitle}
          buttonStyle={theme.styles.dividerTextButton}
          onPress={choosePlayers}
        />
      }
    />
  );

  const renderPlayersEmpty = () => (
    <>
      <Divider />
      <EmptyView
        type={'info'}
        message={'No Players'}
        details={'Add Players to your Event.'}
        positionTop
        buttonTitle={'Choose Players'}
        onButtonPress={choosePlayers}
      />
    </>
  );

  return (
    <View style={{ height: '100%' }}>
      <View style={{ flex: 1 }}>
        <ScrollView
          style={theme.styles.view}
          showsVerticalScrollIndicator={false}
          contentInsetAdjustmentBehavior={'automatic'}
          contentContainerStyle={{ flexGrow: 1 }}>
          <Divider text={'TYPE'} />
          <ListItemCheckBoxInfo
            title={'Unique Partner Doubles'}
            position={['first', 'last']}
            checkRight
            checked={true}
            onPressInfo={
              () => null
              // navigation.navigate('SportEventNavigator', {
              //   screen: 'SportEventSchedule',
              //   params: {
              //     sportEventId: sportEventId,
              //     screenTitle: sportEvent?.name || 'Event',
              //   },
              // })
            }
          />
          <Divider
            note
            light
            text={
              'Players are grouped into pairs. Each player partners with every other player exactly once. No pair repeats.'
            }
            subHeaderStyle={s.dividerText}
          />
          <Divider text={'DETAILS'} />
          <Formik
            innerRef={formik => {
              if (formik) {
                formikRef.current = formik;
              }
            }}
            initialValues={initialValues}
            enableReinitialize
            validationSchema={schema}
            validateOnMount
            onSubmit={onSubmit}>
            {({ errors, values, handleChange, setFieldValue }) => (
              <View>
                <FormikStateWatcher<FormValues>
                  onChange={onFormikWatcherStateChange}
                />
                <ListItemInput
                  ref={nameFieldRef}
                  position={['first']}
                  error={!!errors.name}
                  inputProps={{
                    inputAccessoryViewID: 'keyboardAccessory',
                    onChangeText: handleChange('name'),
                    onFocus: () =>
                      keyboardAccessory.current?.focusedField(Fields.name),
                    value: values.name,
                    label: 'Event Name',
                    placeholder: 'Event Name',
                    autoCapitalize: 'words',
                  }}
                />
                <ListItemDateTime
                  title={'Date'}
                  value={DateTime.fromISO(values.date).toFormat(
                    "MMM d, yyyy 'at' h:mm a",
                  )}
                  minimumDate={DateTime.now().toJSDate()}
                  maximumDate={DateTime.now().plus({ years: 100 }).toJSDate()}
                  mode={'datetime'}
                  pickerValue={values.date}
                  expanded={expandedDate}
                  accentColor={theme.colors.brandSecondary}
                  onPress={() => setExpandedDate(!expandedDate)}
                  onChange={onDateChange}
                />
                <ListItemInput
                  ref={locationFieldRef}
                  error={!!errors.location}
                  inputProps={{
                    inputAccessoryViewID: 'keyboardAccessory',
                    onChangeText: handleChange('location'),
                    onFocus: () =>
                      keyboardAccessory.current?.focusedField(Fields.location),
                    value: values.location,
                    label: 'Location',
                    placeholder: 'Location',
                    autoCapitalize: 'words',
                  }}
                />
                <ListItemStepper
                  title={'Number of Courts'}
                  position={['last']}
                  initialValue={values.numberOfCourts}
                  min={1}
                  max={10}
                  onChange={value => setFieldValue('numberOfCourts', value)}
                />
                <ListItemSegmented
                  title={'Gender'}
                  segmentWidth={80}
                  index={values.gender === 'mens' ? 0 : 1}
                  onChangeIndex={onGenderSelect}
                  segments={['Mens', 'Womens']}
                />
                <ListItemSegmented
                  title={'Type of Match'}
                  segmentWidth={80}
                  index={values.typeOfMatch === 'singles' ? 0 : 1}
                  onChangeIndex={onTypeOfMatchSelect}
                  segments={['Singles', 'Doubles']}
                />
              </View>
            )}
          </Formik>
          <Animated.View entering={FadeIn}>
            {selectedPlayers.length ? (
              <>
                <Divider />
                <ListItem
                  title={'Schedule'}
                  subtitle={'Rounds, Courts, Assignments'}
                  position={['first', 'last']}
                  rightContent={'chevron-right'}
                  onPress={() =>
                    navigation.navigate('SportEventSchedule', {
                      sportEventId: sportEventId || '',
                      screenTitle: sportEvent?.name || 'Event',
                    })
                  }
                />
              </>
            ) : null}
            <ListEditor ref={listEditorRef} onChangeState={setListEditorState}>
              <FlatList
                contentInsetAdjustmentBehavior={'automatic'}
                data={selectedPlayers}
                renderItem={renderPlayer}
                keyExtractor={item => `${item.id}`}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={
                  selectedPlayers.length ? renderPlayersHeader() : null
                }
                ListFooterComponent={<Divider />}
                ListEmptyComponent={renderPlayersEmpty()}
              />
            </ListEditor>
          </Animated.View>
        </ScrollView>
      </View>
      {/* <View
        style={{
          height: 80,
          paddingVertical: 15,
          borderTopWidth: 1,
          borderTopColor: theme.colors.subtleGray,
        }}>
        <Button
          title={'Begin Event'}
          titleStyle={theme.styles.buttonTitle}
          buttonStyle={theme.styles.button}
          containerStyle={theme.styles.buttonContainer}
          disabled={formikCanSubmit}
          onPress={() => null}
        />
      </View> */}
      <KeyboardAccessory
        ref={keyboardAccessory}
        id={'keyboardAccessory'}
        fieldRefs={resolvedRefs}
        doneText={'Done'}
        disabledDone={!formikCanSubmit}
        onDone={Keyboard.dismiss}
      />
    </View>
  );
};

const useStyles = ThemeManager.createStyleSheet(({ theme }) => ({
  dividerText: {
    ...theme.text.medium,
    marginBottom: -10,
  },
}));

export default SportEventEditorScreen;
