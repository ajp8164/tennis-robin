import React, { useEffect } from 'react';
import { FlatList, ListRenderItem, ScrollView, View } from 'react-native';

import { useEvent, useSetState } from '@react-native-hello/core';
import {
  Divider,
  ListItemCheckBox,
  ThemeManager,
  useTheme,
} from '@react-native-hello/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from 'components/atoms/Button';
import { DynamicIcon } from 'components/atoms/DynamicIcon';
import { EmptyView } from 'components/molecules/EmptyView';
import { appIcons } from 'lib/appIcons';
import { useScreenEditHeader } from 'lib/useScreenEditHeader';
import lodash from 'lodash';
import { MultipleNavigatorParamList } from 'types/navigation';

export type IconName = keyof typeof appIcons;

export type EnumPickerIconProps = {
  icon: IconName;
  color?: string;
} | null;

export type EnumPickerValue = {
  id: string;
  title: string;
  subtitle?: string;
  leftIcon?: EnumPickerIconProps;
  rightIcon?: EnumPickerIconProps;
};

export type EnumPickerInterface = {
  mode?: 'one' | 'one-or-none' | 'many' | 'many-or-none';
  title: string;
  itemPlural?: string;
  headerBackTitle?: string;
  sectionName?: string;
  footer?: string;
  values: EnumPickerValue[];
  selected?: string[]; // Array of enum id, values[].id
  eventName: string;
};

export type EnumPickerResult = {
  value: string[]; // Array of enum id
};

export type Props = NativeStackScreenProps<
  MultipleNavigatorParamList,
  'EnumPicker'
>;

const EnumPickerScreen = ({ route, navigation }: Props) => {
  const {
    mode = 'one',
    title,
    itemPlural = 'Items',
    headerBackTitle,
    sectionName,
    footer,
    values,
    selected,
    eventName,
  } = route.params;

  const theme = useTheme();
  const s = useStyles();
  const event = useEvent();
  const setScreenEditHeader = useScreenEditHeader();

  // All of these strings are object ids or enum values.
  const [list, setList] = useSetState<{
    values: EnumPickerValue[];
    selected: string[];
    initial: string[];
  }>({
    values,
    // Use an empty array if empty string is set.
    selected: lodash.isString(selected) ? [selected] : selected ? selected : [],
    initial: lodash.isString(selected) ? [selected] : selected ? selected : [],
  });

  useEffect(() => {
    // Check if arrays contain the same elements.
    const canSubmit = !lodash.isEmpty(lodash.xor(list.selected, list.initial));

    const onDone = () => {
      // For multi-selection mode we send the selected values only when done.
      if (mode.includes('many')) {
        event.emit(eventName, { value: list.selected });
        navigation.goBack();
      }
    };

    navigation.setOptions({
      title,
      headerBackTitle,
    });

    if (mode.includes('many')) {
      setScreenEditHeader({ enabled: canSubmit, action: onDone });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list]);

  const toggleSelect = (value?: EnumPickerValue) => {
    if (mode === 'one' || mode === 'one-or-none') {
      value
        ? setList({ selected: [value.id] })
        : setList({ selected: [] }, { assign: true });
    } else if (value) {
      if (list.selected.includes(value.id)) {
        setList(
          { selected: list.selected.filter(id => id !== value.id) },
          { assign: true },
        );
      } else {
        setList({ selected: list.selected.concat(value.id) }, { assign: true });
      }
    }

    // For single selection mode we send the selected value immediately.
    if (mode === 'one' || mode === 'one-or-none') {
      event.emit(eventName, {
        value: value ? [value.id] : [],
      } as EnumPickerResult);
    }
  };

  const selectAll = () => {
    setList({ selected: list.values.map(v => v.id) }, { assign: true });
  };

  const selectNone = () => {
    setList({ selected: [] }, { assign: true });
  };

  const renderValue: ListRenderItem<EnumPickerValue> = ({
    item: value,
    index,
  }) => {
    return (
      <ListItemCheckBox
        key={`${value}${index}`}
        title={value.title}
        subtitle={value.subtitle}
        subtitleLines={5}
        rightContentStyle={s.checkSpace}
        leftContent={
          value.leftIcon ? (
            <DynamicIcon
              icon={appIcons[value.leftIcon.icon]}
              color={value.leftIcon.color}
            />
          ) : (
            <></>
          )
        }
        value={
          value.rightIcon ? (
            <DynamicIcon
              icon={appIcons[value.rightIcon.icon]}
              color={value.rightIcon.color}
            />
          ) : (
            <></>
          )
        }
        position={
          mode === 'one-or-none'
            ? index === 0
              ? ['first']
              : []
            : list.values.length === 1
              ? ['first', 'last']
              : index === 0
                ? ['first']
                : index === list.values.length - 1
                  ? ['last']
                  : []
        }
        checked={list.selected?.includes(value.id)}
        onChange={() => toggleSelect(value)}
      />
    );
  };

  if (!list.values.length) {
    return (
      <EmptyView
        type={'info'}
        message={`No ${itemPlural}`}
        details={`Create ${itemPlural} on the Setup tab.`}
      />
    );
  }

  return (
    <ScrollView
      style={theme.styles.view}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior={'automatic'}>
      {sectionName ? (
        <Divider
          note
          light
          style={s.divider}
          subHeaderStyle={theme.text.medium}
          text={sectionName}
        />
      ) : null}
      <Divider
        text={title}
        rightComponent={
          mode === 'many-or-none' ? (
            <View style={{ flexDirection: 'row' }}>
              <Button
                title={'All'}
                titleStyle={theme.styles.buttonScreenHeaderTitle}
                buttonStyle={theme.styles.dividerTextButton}
                onPress={selectAll}
              />
              <Button
                title={'None'}
                titleStyle={theme.styles.buttonScreenHeaderTitle}
                buttonStyle={theme.styles.dividerTextButton}
                onPress={selectNone}
              />
            </View>
          ) : null
        }
      />
      <FlatList
        data={list.values}
        renderItem={renderValue}
        keyExtractor={(_item, index) => `${index}`}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
      />
      {mode === 'one-or-none' && (
        <ListItemCheckBox
          title={'None'}
          position={list.values.length === 0 ? ['first', 'last'] : ['last']}
          checked={!list.selected.length}
          onChange={() => toggleSelect()}
        />
      )}
      <Divider note light subHeaderStyle={theme.text.medium} text={footer} />
    </ScrollView>
  );
};

const useStyles = ThemeManager.createStyleSheet(() => ({
  checkSpace: {
    minWidth: 60,
  },
  divider: {
    marginBottom: 15,
  },
}));

export default EnumPickerScreen;
