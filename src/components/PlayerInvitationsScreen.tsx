import React, { useEffect, useState } from 'react';
import { Alert, FlatList, ListRenderItem, ScrollView } from 'react-native';
import Contacts from 'react-native-contacts';

import { useEvent } from '@react-native-hello/core';
import {
  Chip,
  Divider,
  ListItemCheckBox,
  ThemeManager,
  listItemPosition,
  useTheme,
} from '@react-native-hello/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from 'components/atoms/Button';
import { EmptyView } from 'components/molecules/EmptyView';
import { appConfig } from 'config';
import { addDocument, useCollection } from 'firebase/firestore';
import { useUserProfile } from 'lib/auth';
import { generateCode } from 'lib/generateCode';
import { usePlayerStatusDecoration } from 'lib/player';
import { useSelectedTeam } from 'lib/team';
import { Ban, Plus } from 'lucide-react-native';
import { DateTime } from 'luxon';
import { Contact } from 'types/contact';
import { SetupNavigatorParamList } from 'types/navigation';
import { PlayerStatus } from 'types/player';
import { Token } from 'types/token';

export type Props = NativeStackScreenProps<
  SetupNavigatorParamList,
  'PlayerInvitations'
>;

const PlayerInvitationsScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const event = useEvent();
  const s = useStyles();
  const playerStatusDecoration = usePlayerStatusDecoration();

  const { doc: userProfile } = useUserProfile();
  const { doc: selectedTeam } = useSelectedTeam();

  const [contactsPermission, setContactsPermission] = useState<
    'undefined' | 'authorized' | 'denied'
  >('undefined');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(
    new Set(),
  );

  const contactsApp = contacts
    .filter(c => c.type === 'contacts-app')
    .sort((a, b) => {
      if (a.lastName < b.lastName) return -1;
      if (a.lastName > b.lastName) return 1;
      return 0;
    });

  const entered = contacts
    .filter(c => c.type === 'entered')
    .sort((a, b) => {
      if (a.lastName < b.lastName) return -1;
      if (a.lastName > b.lastName) return 1;
      return 0;
    });

  const { docs: invites } = useCollection<Token>('Tokens', {
    where: [
      {
        fieldPath: 'teamId',
        opStr: '==',
        value: selectedTeam?.id || '',
      },
    ],
  });

  useEffect(() => {
    Contacts.checkPermission().then(permission => {
      setContactsPermission(permission);
    });

    Contacts.requestPermission().then(permission => {
      setContactsPermission(permission);

      if (permission === 'authorized') {
        Contacts.getAll().then(contacts => {
          try {
            const c = contacts.map(c => {
              return {
                id: c.recordID,
                type: 'contacts-app',
                firstName: c.givenName || '',
                lastName: c.familyName || '',
                email: c.emailAddresses?.[0]?.email || '',
              } as Contact;
            });
            setContacts(c);
          } catch (e) {
            // Failed to process contacts
          }
        });
      } else if (permission === 'denied') {
        Alert.alert(
          'Cannot Access Contacts',
          `You can choose players from your phone contacts. You can authorize ${appConfig.appName} to access your contacts using your Settings app.`,
          [{ text: 'OK' }],
          { cancelable: false },
        );
      }
    });
  }, []);

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => {
        return (
          <Button
            title={'Cancel'}
            titleStyle={theme.styles.buttonScreenHeaderTitle}
            buttonStyle={theme.styles.buttonScreenHeader}
            onPress={navigation.goBack}
          />
        );
      },
      headerRight: () => {
        return (
          <Button
            title={'Send'}
            titleStyle={theme.styles.buttonScreenHeaderTitle}
            buttonStyle={theme.styles.buttonScreenHeader}
            disabledTitleStyle={theme.styles.buttonScreenHeaderTitle}
            disabledStyle={theme.styles.buttonScreenHeaderDisabled}
            disabled={
              selectedContacts.size === 0 || !selectedTeam || !userProfile
            }
            onPress={() => sendInvitations()}
          />
        );
      },
    });
  });

  useEffect(() => {
    // Event handlers for EnumPicker
    event.on('entered-contact', onEnteredContact);

    return () => {
      event.removeListener('entered-contact', onEnteredContact);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contacts]);

  const onEnteredContact = (contact: Contact) => {
    setContacts([...contacts, contact]);
  };

  const sendInvitations = () => {
    // Add player in invited status and send email.
    selectedContacts.forEach(id => {
      // Get the contact object.
      const contact = contacts.find(c => c.id === id);
      if (contact && selectedTeam && userProfile) {
        // Process each contact invitation async.
        (async () => {
          // Send email...
          //
          //

          // Create an invite token and save it using the code as the document id.
          const code = generateCode();

          await addDocument<Token>(
            'Tokens',
            {
              type: 'player-invitation',
              value: code,
              expiration: DateTime.now().plus({ days: 30 }).toISO(),
              firstName: contact.firstName,
              lastName: contact.lastName,
              email: contact.email,
              teamId: selectedTeam?.id,
              inviterUserId: userProfile?.id,
            },
            { id: code },
          );
        })();
      }
    });

    navigation.goBack();
  };

  const renderAppContact: ListRenderItem<Contact> = ({
    item: contact,
    index,
  }) => {
    const isInvited = invites.find(i => i.email === contact.email);
    return (
      <ListItemCheckBox
        key={contact.id}
        title={`${contact.lastName}, ${contact.firstName}`}
        subtitle={
          !contact.email ? 'Contact has no email address' : contact.email
        }
        value={
          !contact.email ? (
            <Ban size={24} color={theme.colors.warning} style={s.rightOffset} />
          ) : isInvited ? (
            <Chip
              text={playerStatusDecoration[PlayerStatus.Invited].label}
              color={playerStatusDecoration[PlayerStatus.Invited].color}
              textColor={theme.colors.stickyWhite}
              style={s.rightOffset}
            />
          ) : (
            <></>
          )
        }
        position={listItemPosition(index, contactsApp.length)}
        onChange={() => {
          if (contact.email && !isInvited) {
            const updated = new Set(selectedContacts);
            selectedContacts.has(contact.id)
              ? updated.delete(contact.id)
              : updated.add(contact.id);
            setSelectedContacts(updated);
          }
        }}
        checked={selectedContacts.has(contact.id)}
      />
    );
  };

  const renderEnteredContact: ListRenderItem<Contact> = ({
    item: contact,
    index,
  }) => {
    return (
      <ListItemCheckBox
        key={contact.id}
        title={`${contact.lastName}, ${contact.firstName}`}
        position={listItemPosition(index, entered.length)}
        onChange={() => {
          const updated = new Set(selectedContacts);
          selectedContacts.has(contact.id)
            ? updated.delete(contact.id)
            : updated.add(contact.id);
          setSelectedContacts(updated);
        }}
        checked={selectedContacts.has(contact.id)}
      />
    );
  };

  const renderEnteredEmpty = () => (
    <EmptyView
      type={'none'}
      positionTop
      details={'Tap ' + ' to add more contacts.'}
    />
  );

  return (
    <ScrollView
      style={theme.styles.view}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior={'automatic'}>
      <Divider
        text={'MORE'}
        rightComponent={
          <Button
            titleStyle={theme.styles.buttonScreenHeaderTitle}
            icon={
              <Plus color={theme.colors.screenHeaderButtonText} size={28} />
            }
            buttonStyle={theme.styles.dividerTextButton}
            onPress={() => navigation.navigate('PlayerInvitationEditor')}
          />
        }
      />
      <FlatList
        data={entered}
        renderItem={renderEnteredContact}
        keyExtractor={item => `${item.id}`}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEnteredEmpty()}
      />

      {contactsPermission === 'authorized' ? (
        <FlatList
          data={contactsApp}
          renderItem={renderAppContact}
          keyExtractor={item => `${item.id}`}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={<Divider text={'MY CONTACTS'} />}
          ListFooterComponent={<Divider />}
        />
      ) : null}
    </ScrollView>
  );
};

const useStyles = ThemeManager.createStyleSheet(() => ({
  rightOffset: {
    marginRight: -15,
  },
}));

export default PlayerInvitationsScreen;
