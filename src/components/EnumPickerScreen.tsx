import React, { ReactElement, useEffect } from 'react';
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
import { EmptyView } from 'components/molecules/EmptyView';
import { useScreenEditHeader } from 'lib/useScreenEditHeader';
import lodash from 'lodash';
import { MultipleNavigatorParamList } from 'types/navigation';

export type EnumPickerIconProps = {
  hideTitle?: boolean;
  leftContent?: ReactElement;
  name?: string;
} | null;

export type EnumPickerInterface = {
  mode?: 'one' | 'one-or-none' | 'many' | 'many-or-none';
  title: string;
  itemPlural?: string;
  headerBackTitle?: string;
  icons?: { [key in string]: EnumPickerIconProps }; // Key is a enum value as 'name:id'
  sectionName?: string;
  footer?: string;
  // Values may optionally include text wrapped in curly braces, this text is not shown on the UI.
  // The text wrapped in curly braces may be used for object id's for example. The whole string is
  // returned in the selection result.
  // values = ['A{0}', 'B{1}'] displays as 'A' and 'B'.
  values: string[];
  selected?: string | string[]; // The literal value(s) as 'name:id'
  eventName: string;
};

export type EnumPickerResult = {
  value: string[];
};

export type Props = NativeStackScreenProps<
  MultipleNavigatorParamList,
  'EnumPicker'
>;

const EnumPickerScreen = ({ route, navigation }: Props) => {
  const {
    // enumName,
    mode = 'one',
    title,
    itemPlural = 'Items',
    headerBackTitle,
    icons,
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
    values: string[];
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
        event.emit(eventName, { value: list.selected } as EnumPickerResult);
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

  const toggleSelect = (value?: string) => {
    if (mode === 'one' || mode === 'one-or-none') {
      value
        ? setList({ selected: [value] })
        : setList({ selected: [] }, { assign: true });
    } else if (value) {
      if (list.selected.includes(value)) {
        setList(
          { selected: list.selected.filter(v => v !== value) },
          { assign: true },
        );
      } else {
        setList({ selected: list.selected.concat(value) }, { assign: true });
      }
    }

    // For single selection mode we send the selected value immediately.
    if (mode === 'one' || mode === 'one-or-none') {
      event.emit(eventName, {
        value: value ? [value] : [],
      } as EnumPickerResult);
    }
  };

  const selectAll = () => {
    setList({ selected: list.values }, { assign: true });
  };

  const selectNone = () => {
    setList({ selected: [] }, { assign: true });
  };

  const getIconEl = (value: string) => {
    return icons?.[value] ? (
      <View key={value}>{icons[value]?.leftContent}</View>
    ) : undefined;
  };

  const renderValue: ListRenderItem<string> = ({ item: value, index }) => {
    const name = value;
    return (
      <ListItemCheckBox
        key={`${value}${index}`}
        title={icons?.[value]?.hideTitle ? '' : name.replace(/\{[^}]*\}/g, '')}
        leftContent={getIconEl(value)}
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
        checked={list.selected?.includes(value)}
        onChange={() => toggleSelect(value)}
      />
    );
  };

  if (!list.values.length) {
    return (
      <EmptyView
        info
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
  divider: {
    marginBottom: 15,
  },
}));

export default EnumPickerScreen;
