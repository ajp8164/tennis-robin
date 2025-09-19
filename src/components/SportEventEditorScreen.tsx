import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Keyboard,
  ListRenderItem,
  ScrollView,
  Text,
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
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { EnumPickerResult, EnumPickerValue } from 'components/EnumPickerScreen';
import { Button } from 'components/atoms/Button';
import { DynamicIcon } from 'components/atoms/DynamicIcon';
import {
  FormikStateWatcher,
  FormikWatcherState,
} from 'components/atoms/FormikStateWatcher';
import {
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
import {
  Scheduler,
  decodeSportEvent,
  encodeSportEvent,
  schedulers,
  useSportEvent,
} from 'lib/sportEvent';
import { useSelectedTeam } from 'lib/team';
import { CircleMinus, EyeOff } from 'lucide-react-native';
import { DateTime } from 'luxon';
import {
  NewSportEventNavigatorParamList,
  SportEventsNavigatorParamList,
} from 'types/navigation';
import { Player } from 'types/player';
import { MatchGender, MatchType, SportEventEncoded } from 'types/sportEvent';
import { Team } from 'types/team';
import * as Yup from 'yup';

export type Props = CompositeScreenProps<
  NativeStackScreenProps<SportEventsNavigatorParamList, 'SportEventEditor'>,
  NativeStackScreenProps<NewSportEventNavigatorParamList, 'NewSportEvent'>
>;

// Order of fields for accessory view.
enum Fields {
  name,
  location,
}

type FormValues = {
  schedulerId: string;
  name: string;
  date: ISODateString;
  location: string;
  numberOfCourts: number;
  gender: MatchGender;
  typeOfMatch: MatchType;
  players: string[];
  scheduleRoundsChanged: boolean;
};

const SportEventEditorScreen = ({ navigation, route }: Props) => {
  const { sportEventId } = route.params || {};

  const theme = useTheme();
  const s = useStyles();
  const event = useEvent();

  const playerStatusDecoration = usePlayerStatusDecoration();
  const { doc: userProfile } = useUserProfile();
  const { doc: selectedTeam } = useSelectedTeam();

  const workingState = useSportEvent();
  const [scheduler, setScheduler] = useState<Scheduler>();

  // *** Live sportEvent data ***
  //
  const { doc: sportEventEncoded, loading: sportEventLoading } =
    useDocument<SportEventEncoded>('SportEvents', sportEventId);

  const sportEvent = useMemo(
    () => decodeSportEvent(sportEventEncoded),
    [sportEventEncoded],
  );

  const { docs: sportEventPlayers, loading: sportEventPlayersLoading } =
    useCollection<Player>('Players', {
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
  //
  // ***

  // For building the player picker enum.
  // Show all players on the selected team.
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
    schedulerId: '',
    name: workingState.sportEvent.name,
    date: workingState.sportEvent.date,
    location: workingState.sportEvent.location,
    numberOfCourts: workingState.sportEvent.numberOfCourts,
    gender: workingState.sportEvent.gender,
    typeOfMatch: workingState.sportEvent.typeOfMatch,
    players: workingState.sportEvent.players,
    scheduleRoundsChanged: false,
  });

  const schema = Yup.object().shape({
    schedulerId: Yup.string().min(1).required(),
    name: Yup.string().required(),
    date: Yup.string().required(),
    location: Yup.string(),
    numberOfCourts: Yup.number().min(1).required(),
    gender: Yup.string().required(),
    typeOfMatch: Yup.string().required(),
    players: Yup.array().of(Yup.string()),
    scheduleRoundsChanged: Yup.boolean(),
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
    if (!sportEventLoading) {
      if (sportEvent) {
        workingState.initializeSportEvent(sportEvent);

        // Reinitialize state with a loaded sportEvent.
        const schedulerId = sportEvent.schedule?.schedulerId || '';
        setInitialValues({
          schedulerId,
          name: sportEvent.name,
          date: sportEvent.date,
          location: sportEvent.location,
          numberOfCourts: sportEvent.numberOfCourts,
          gender: sportEvent.gender,
          typeOfMatch: sportEvent.typeOfMatch,
          players: sportEvent.players,
          scheduleRoundsChanged: false,
        });

        const scheduler = schedulers.find(s => s.id === schedulerId);
        setScheduler(scheduler);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sportEvent, sportEventLoading]); // Do not want workingState here

  useEffect(() => {
    formikRef.current?.setFieldValue(
      'scheduleRoundsChanged',
      workingState.scheduleRoundsChanged,
    );
  }, [workingState.scheduleRoundsChanged]);

  useEffect(() => {
    if (!sportEventPlayersLoading) {
      workingState.updatePlayers(sportEventPlayers);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sportEventPlayers, sportEventPlayersLoading]); // Do not want workingState here

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
        if (formikCanSubmit || !sportEventId) {
          return (
            <Button
              title={'Cancel'}
              titleStyle={theme.styles.buttonScreenHeaderTitle}
              buttonStyle={theme.styles.buttonScreenHeader}
              onPress={cancel}
            />
          );
        }
      },
      headerRight: () => {
        return (
          <>
            <Button
              title={listEditorState?.enabled ? 'Done' : 'Edit'}
              titleStyle={theme.styles.buttonScreenHeaderTitle}
              buttonStyle={theme.styles.buttonScreenHeader}
              disabledTitleStyle={theme.styles.buttonScreenHeaderTitle}
              disabledStyle={theme.styles.buttonScreenHeaderDisabled}
              disabled={!workingState.players.length}
              onPress={() => listEditorRef.current?.onToggleEditMode()}
            />
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
  }, [listEditorState, formikCanSubmit, workingState.players]);

  useEffect(() => {
    // Event handlers for EnumPicker
    event.on('change-players', onChangePlayers);
    event.on('change-scheduler', onChangeScheduler);

    return () => {
      event.removeListener('change-players', onChangePlayers);
      event.removeListener('change-scheduler', onChangeScheduler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChangePlayers = async (result: EnumPickerResult) => {
    const { result: players } = await getDocuments<Player>('Players', {
      where: [{ fieldPath: documentId(), opStr: 'in', value: result.value }],
    });

    // Set the array of ids on the form, set the populated player objects and update
    // our working state.
    formikRef.current?.setFieldValue(
      'players',
      players.map(p => p.id),
    );

    workingState.updateSportEvent({
      ...workingState.sportEvent,
      players: formikRef.current?.values.players || [],
    });

    workingState.updatePlayers(players);
    updateSchedule({ players });
  };

  const onChangeScheduler = async (result: EnumPickerResult) => {
    const schedulerId = result.value[0];
    formikRef.current?.setFieldValue('schedulerId', schedulerId);
    updateSchedule({ schedulerId });

    const scheduler = schedulers.find(s => s.id === schedulerId);
    setScheduler(scheduler);
  };

  const cancel = () => {
    // Reset our working state.
    workingState.reset();
    !sportEventId ? navigation.goBack() : formikRef.current?.resetForm();
  };

  const save = () => {
    formikRef.current?.handleSubmit();
    formikRef.current?.resetForm({ values: formikRef.current?.values });
    Keyboard.dismiss();
    if (!sportEventId) navigation.goBack();
  };

  const onSubmit = async (values: FormValues) => {
    if (sportEventId) {
      updateDocument<SportEventEncoded>(
        'SportEvents',
        encodeSportEvent({
          ...workingState.sportEvent,
          name: values.name,
          date: values.date,
          location: values.location,
          numberOfCourts: values.numberOfCourts,
          gender: values.gender,
          typeOfMatch: values.typeOfMatch,
          players: values.players,
        }),
      );
    } else {
      const newSportEvent = await addDocument<SportEventEncoded>(
        'SportEvents',
        encodeSportEvent({
          ...workingState.sportEvent,
          name: values.name,
          date: values.date,
          location: values.location,
          numberOfCourts: values.numberOfCourts,
          gender: values.gender,
          typeOfMatch: values.typeOfMatch,
          owners: userProfile ? [userProfile.id!] : [], // Should always be an id
          players: values.players,
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

    // Reset our working state.
    workingState.reset();
  };

  const choosePlayers = () => {
    navigation.navigate('EnumPicker', {
      title: 'Players',
      values: playerEnum,
      selected: workingState.players.map(p => p.id!),
      itemPlural: 'Players',
      eventName: 'change-players',
      mode: 'many-or-none',
    });
  };

  const removePlayer = async (playerId: string) => {
    // Remove the populated player.
    const index = workingState.players.findIndex(p => p.id === playerId);
    if (index >= 0) {
      const wsep = [...workingState.players];
      wsep.splice(index, 1);

      workingState.updatePlayers(wsep);

      formikRef.current?.setFieldValue(
        'players',
        wsep.map(p => p.id!),
      );

      workingState.updateSportEvent({
        ...workingState.sportEvent,
        players: formikRef.current?.values.players || [],
      });
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
    formikRef.current?.setFieldValue(
      'gender',
      index === 0
        ? MatchGender.Mens
        : index === 1
          ? MatchGender.Womens
          : MatchGender.Mixed,
    );
  };

  const onTypeOfMatchSelect = (index: number) => {
    formikRef.current?.setFieldValue(
      'typeOfMatch',
      index === 0 ? MatchType.Singles : MatchType.Doubles,
    );
  };

  const updateSchedule = ({
    numberOfCourts,
    players,
    schedulerId,
  }: {
    numberOfCourts?: number;
    players?: Player[];
    schedulerId?: string;
  } = {}) => {
    // Get the schedular details.
    const id = schedulerId || workingState.sportEvent.schedule?.schedulerId;
    const scheduler = schedulers.find(s => s.id === id);

    // Run the scheduler function.
    const updated = scheduler?.fn(
      players || workingState.players,
      numberOfCourts || workingState.sportEvent.numberOfCourts,
    );

    workingState.sportEvent.schedule = updated;
  };

  const onFormikWatcherStateChange = (
    state: FormikWatcherState<FormValues>,
  ) => {
    const { next, isValid = false, changedFields } = state;
    const canSubmit = next.dirty && isValid;
    setFormikCanSubmit(canSubmit);

    // Update the populated players list to match the player ids on the form.
    if (changedFields.includes('players')) {
      getDocuments<Player>('Players', {
        where: [
          { fieldPath: documentId(), opStr: 'in', value: next.values.players },
        ],
      }).then(({ result: players }) => {
        // Set the players and update the schedule.
        workingState.updatePlayers(players);
        updateSchedule({ players });
      });
    }
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
        position={listItemPosition(index, workingState.players.length)}
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
      text={`${workingState.players.length || ''} PLAYER${workingState.players.length !== 1 ? 'S' : ''}`}
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
    <EmptyView
      type={'loading'}
      waitFor={sportEventId ? sportEvent : true}
      fadeIn>
      <View style={{ height: '100%' }}>
        <View style={{ flex: 1 }}>
          <ScrollView
            style={theme.styles.view}
            showsVerticalScrollIndicator={false}
            contentInsetAdjustmentBehavior={'automatic'}
            contentContainerStyle={{ flexGrow: 1 }}>
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
                  <Divider text={'SCHEDULER'} />
                  <ListItem
                    title={scheduler?.name || 'Choose Your Match Scheduler'}
                    subtitle={
                      scheduler?.description ||
                      'The scheduler calculates all match round, court, and player assignments. If desired, you can make manual chnages later.'
                    }
                    subtitleLines={5}
                    position={['first', 'last']}
                    rightContent={'chevron-right'}
                    footerContent={
                      !values.schedulerId ? (
                        <Text style={s.requiredText}>
                          {'Selection required'}
                        </Text>
                      ) : (
                        <></>
                      )
                    }
                    onPress={() =>
                      navigation.navigate('EnumPicker', {
                        title: 'Match Schedulers',
                        values: schedulers.map(s => {
                          return {
                            id: s.id,
                            title: s.name,
                            subtitle: s.description,
                            leftIcon: { icon: s.icon },
                          };
                        }) as EnumPickerValue[],
                        selected: [values.schedulerId],
                        eventName: 'change-scheduler',
                        mode: 'one',
                        closeOnSelect: true,
                      })
                    }
                  />
                  <Divider text={'DETAILS'} />
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
                  <ListItemSegmented
                    title={'Gender'}
                    segmentWidth={80}
                    index={
                      values.gender === MatchGender.Mens
                        ? 0
                        : values.gender === MatchGender.Womens
                          ? 1
                          : 2
                    }
                    onChangeIndex={onGenderSelect}
                    segments={['Mens', 'Womens', 'Mixed']}
                  />
                  <ListItemSegmented
                    title={'Type of Match'}
                    segmentWidth={80}
                    index={values.typeOfMatch === MatchType.Singles ? 0 : 1}
                    onChangeIndex={onTypeOfMatchSelect}
                    segments={['Singles', 'Doubles']}
                  />
                  <ListItemInput
                    ref={locationFieldRef}
                    error={!!errors.location}
                    inputProps={{
                      inputAccessoryViewID: 'keyboardAccessory',
                      onChangeText: handleChange('location'),
                      onFocus: () =>
                        keyboardAccessory.current?.focusedField(
                          Fields.location,
                        ),
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
                    onChange={value => {
                      setFieldValue('numberOfCourts', value);
                      updateSchedule({ numberOfCourts: value });
                    }}
                  />
                </View>
              )}
            </Formik>
            <Animated.View entering={FadeIn}>
              {workingState.players.length ? (
                <>
                  <Divider />
                  <ListItem
                    title={'Schedule'}
                    subtitle={`${workingState.sportEvent.schedule?.numberOfRounds} Round${workingState.sportEvent.schedule?.numberOfRounds !== 1 ? 's' : ''} on ${workingState.sportEvent.schedule?.numberOfCourtsUsed} Court${workingState.sportEvent.schedule?.numberOfCourtsUsed !== 1 ? 's' : ''}`}
                    position={['first', 'last']}
                    rightContent={'chevron-right'}
                    onPress={() => {
                      navigation.navigate('SportEventSchedule', {
                        screenTitle: workingState.sportEvent.name || 'Event',
                      });
                    }}
                  />
                  {sportEvent?.numberOfCourts !==
                  sportEvent?.schedule?.numberOfCourtsUsed ? (
                    <Divider
                      note
                      light
                      text={
                        'The number of courts required by the schedule is less than the number of courts available. Not all courts can be used for match play.'
                      }
                      subHeaderStyle={theme.text.medium}
                    />
                  ) : null}
                </>
              ) : null}
              <ListEditor
                ref={listEditorRef}
                onChangeState={v => {
                  setListEditorState(v);
                }}>
                <FlatList
                  contentInsetAdjustmentBehavior={'automatic'}
                  data={workingState.players}
                  renderItem={renderPlayer}
                  keyExtractor={item => `${item.id}`}
                  scrollEnabled={false}
                  showsVerticalScrollIndicator={false}
                  ListHeaderComponent={
                    workingState.players.length ? renderPlayersHeader() : null
                  }
                  ListFooterComponent={<Divider />}
                  ListEmptyComponent={renderPlayersEmpty()}
                />
              </ListEditor>
            </Animated.View>
          </ScrollView>
        </View>
        <KeyboardAccessory
          ref={keyboardAccessory}
          id={'keyboardAccessory'}
          fieldRefs={resolvedRefs}
          doneText={'Done'}
          disabledDone={!formikCanSubmit}
          onDone={Keyboard.dismiss}
        />
      </View>
    </EmptyView>
  );
};

const useStyles = ThemeManager.createStyleSheet(({ theme }) => ({
  requiredText: {
    ...theme.text.small,
    color: theme.colors.assertive,
    marginLeft: 15,
  },
}));

export default SportEventEditorScreen;
