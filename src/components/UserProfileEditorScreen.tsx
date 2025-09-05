import React, { useEffect, useRef, useState } from 'react';
import { Alert, Keyboard, ScrollView, Text, View } from 'react-native';
import { AvoidSoftInputView } from 'react-native-avoid-softinput';
import RNFS from 'react-native-fs';
import { useSelector } from 'react-redux';

import {
  Divider,
  InputMethods,
  KeyboardAccessory,
  KeyboardAccessoryMethods,
  ListItemInputMethods,
  ThemeManager,
  selectImage,
  useTheme,
} from '@react-native-hello/ui';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Avatar } from 'components/atoms/Avatar';
import { Button } from 'components/atoms/Button';
import {
  FormikStateWatcher,
  FormikWatcherState,
} from 'components/atoms/FormikStateWatcher';
import { ListItemInput } from 'components/atoms/List';
import { updateUser as remoteUpdateUser } from 'firebase/firestore';
import { Formik, FormikProps } from 'formik';
import { Camera } from 'lucide-react-native';
import { selectUser } from 'store/selectors/userSelectors';
import {
  MainNavigatorParamList,
  SetupNavigatorParamList,
} from 'types/navigation';
import { UserProfile } from 'types/user';
import * as Yup from 'yup';

// Order of fields for accessory view.
enum Fields {
  firstName,
  lastName,
  email,
}

type FormValues = {
  firstName: string;
  lastName: string;
  email: string;
};

type Props = CompositeScreenProps<
  NativeStackScreenProps<SetupNavigatorParamList, 'UserProfileEditor'>,
  NativeStackScreenProps<MainNavigatorParamList>
>;

const UserProfileEditorScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const s = useStyles();

  const { profile: userProfile } = useSelector(selectUser);

  const [photoUrl, setPhotoUrl] = useState(userProfile?.photoUrl || '');

  const initialValues = {
    firstName: userProfile?.firstName,
    lastName: userProfile?.lastName,
    email: userProfile?.email,
  } as FormValues;

  const schema = Yup.object().shape({
    firstName: Yup.string().required(),
    lastName: Yup.string().required(),
    email: Yup.string().required(),
  });

  const formikRef = useRef<FormikProps<FormValues>>(null);
  const keyboardAccessory = useRef<
    KeyboardAccessoryMethods & KeyboardAccessory
  >(null);
  const firstNameFieldRef = useRef<ListItemInputMethods>(null);
  const lastNameFieldRef = useRef<ListItemInputMethods>(null);
  const [resolvedRefs, setResolvedRefs] = useState<(InputMethods | null)[]>([]);

  // Supports keyboard accessory view.
  // Ensures all refs are set.
  useEffect(() => {
    setResolvedRefs(
      [firstNameFieldRef.current, lastNameFieldRef.current].filter(Boolean),
    );
  }, []);

  const cancel = () => {
    Keyboard.dismiss();
    formikRef.current?.resetForm();
    navigation.goBack();
  };

  const save = (opts?: { nav?: boolean }) => {
    formikRef.current?.handleSubmit();
    formikRef.current?.resetForm({ values: formikRef.current?.values });
    Keyboard.dismiss();
    opts?.nav && navigation.goBack();
  };

  const onSubmit = async (values: FormValues) => {
    const u: UserProfile = {
      ...userProfile!,
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      photoUrl,
    };

    try {
      await remoteUpdateUser(u);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      Alert.alert('Profile Not Saved', 'Please try again.', [{ text: 'OK' }], {
        cancelable: false,
      });
    }
  };

  const selectPhoto = () => {
    selectImage({
      onSuccess: imageAssets => {
        savePhoto(`file://${imageAssets[0].uri.replace('file://', '')}`);
      },
      onError: () => {
        // Ignore errors
      },
    });
  };

  const savePhoto = (url: string) => {
    setPhotoUrl(url);
    setTimeout(() => {
      save({ nav: false });
    });
  };

  const deleteUserProfileImage = async () => {
    if (userProfile?.photoUrl.length) {
      RNFS.unlink(userProfile.photoUrl)
        .then(() => {
          savePhoto(userProfile.photoUrlDefault);
        })
        .catch(() => {
          // Ignore errors
        });
    }
  };

  const onFormikWatcherStateChange = (
    state: FormikWatcherState<FormValues>,
  ) => {
    const { next, isValid = false } = state;
    const canSubmit = next.dirty && isValid;

    navigation.setOptions({
      headerLeft: () => {
        if (canSubmit) {
          return (
            <>
              {canSubmit ? (
                <Button
                  title={'Cancel'}
                  titleStyle={theme.styles.buttonScreenHeaderTitle}
                  buttonStyle={theme.styles.buttonScreenHeader}
                  onPress={cancel}
                />
              ) : null}
            </>
          );
        } else {
          return null;
        }
      },
      headerRight: () => {
        return (
          <Button
            title={'Save'}
            titleStyle={theme.styles.buttonScreenHeaderTitle}
            buttonStyle={theme.styles.buttonScreenHeader}
            disabledTitleStyle={theme.styles.buttonScreenHeaderTitle}
            disabledStyle={theme.styles.buttonScreenHeaderDisabled}
            disabled={!canSubmit}
            onPress={() => save()}
          />
        );
      },
    });
  };

  const renderHeader = () => {
    return (
      <View>
        <View style={s.avatarContainer}>
          <Avatar
            userProfile={userProfile}
            size={'giant'}
            avatarStyle={s.avatar}
          />
          <View style={s.imageEdit}>
            <Button
              buttonStyle={s.imageEditButton}
              icon={
                <Camera
                  color={theme.colors.screenHeaderButtonText}
                  size={18}
                  style={s.editIcon}
                />
              }
              onPress={selectPhoto}
            />
          </View>
        </View>
        {userProfile?.photoUrl &&
        userProfile.photoUrl !== userProfile.photoUrlDefault ? (
          <Button
            title={'Delete photo'}
            titleStyle={theme.styles.buttonScreenHeaderTitle}
            buttonStyle={theme.styles.buttonScreenHeader}
            containerStyle={s.imageDeleteContainer}
            onPress={deleteUserProfileImage}
          />
        ) : null}
        <Text style={s.nameText}>{userProfile?.name}</Text>
      </View>
    );
  };

  return (
    <>
      <AvoidSoftInputView>
        <ScrollView
          style={theme.styles.view}
          contentContainerStyle={{ flex: 1 }}
          showsVerticalScrollIndicator={false}>
          {renderHeader()}
          <Formik
            innerRef={formik => {
              if (formik) {
                formikRef.current = formik;
              }
            }}
            initialValues={initialValues}
            validationSchema={schema}
            validateOnMount
            onSubmit={onSubmit}>
            {({ errors, handleChange, values }) => (
              <View>
                <FormikStateWatcher<FormValues>
                  onChange={onFormikWatcherStateChange}
                />
                <ListItemInput
                  error={!!errors.email}
                  position={['first', 'last']}
                  inputProps={{
                    label: 'User Name',
                    onChangeText: (_, unformatted) =>
                      handleChange('email')(unformatted),
                    onFocus: () =>
                      keyboardAccessory.current?.focusedField(Fields.email),
                    value: values.email,
                    editable: false,
                  }}
                />
                <Divider />
                <ListItemInput
                  error={!!errors.firstName}
                  position={['first']}
                  inputProps={{
                    label: 'First Name',
                    onChangeText: (_, unformatted) =>
                      handleChange('firstName')(unformatted),
                    onFocus: () =>
                      keyboardAccessory.current?.focusedField(Fields.firstName),
                    value: values.firstName,
                  }}
                />
                <ListItemInput
                  error={!!errors.lastName}
                  position={['last']}
                  inputProps={{
                    label: 'Last Name',
                    onChangeText: (_, unformatted) =>
                      handleChange('lastName')(unformatted),
                    onFocus: () =>
                      keyboardAccessory.current?.focusedField(Fields.lastName),
                    value: values.lastName,
                  }}
                />
              </View>
            )}
          </Formik>
        </ScrollView>
      </AvoidSoftInputView>
      <KeyboardAccessory
        ref={keyboardAccessory}
        id={'keyboardAccessory'}
        fieldRefs={resolvedRefs}
        doneText={'Done'}
        onDone={Keyboard.dismiss}
      />
    </>
  );
};

const useStyles = ThemeManager.createStyleSheet(({ theme }) => ({
  avatar: {
    marginVertical: 15,
    overflow: 'hidden',
  },
  avatarContainer: {
    alignSelf: 'center',
  },
  editIcon: {
    width: 30,
    height: 30,
  },
  imageDeleteContainer: {
    marginTop: -10,
    alignSelf: 'center',
  },
  imageEdit: {
    position: 'absolute',
    bottom: 7,
    right: 0,
  },
  imageEditButton: {
    ...theme.styles.buttonScreenHeader,
    borderRadius: 20,
    width: 30,
    height: 30,
    backgroundColor: theme.colors.viewBackground,
  },
  nameText: {
    ...theme.text.xl,
    fontFamily: theme.fonts.bold,
    textAlign: 'center',
    height: 50,
  },
}));

export default UserProfileEditorScreen;
