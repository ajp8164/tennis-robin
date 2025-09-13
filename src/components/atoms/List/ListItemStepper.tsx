import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import {
  ListItem,
  ListItemSwipeable,
  ThemeManager,
  useTheme,
} from '@react-native-hello/ui';
import { Button } from 'components/atoms/Button';
import { CircleMinus, CirclePlus } from 'lucide-react-native';

interface ListItemStepper extends ListItem {
  min?: number;
  max?: number;
  initialValue?: number;
  onChange: (value: number) => void;
}

const ListItemStepper = (props: ListItemStepper) => {
  const { min = 0, max = 10, initialValue = 0, onChange, ...rest } = props;

  const theme = useTheme();
  const s = useStyles();

  const [val, setVal] = useState(initialValue);

  useEffect(() => {
    setVal(initialValue);
  }, [initialValue]);

  const decrement = () => {
    const newVal = Math.max(val - 1, min);
    setVal(newVal);
    onChange(newVal);
  };

  const increment = () => {
    const newVal = Math.min(val + 1, max);
    setVal(newVal);
    onChange(newVal);
  };

  return (
    <>
      <ListItemSwipeable
        {...rest}
        rightContent={
          <View style={s.stepper}>
            <Button
              buttonStyle={theme.styles.buttonScreenHeader}
              disabledStyle={theme.styles.buttonScreenHeader}
              disabled={val === min}
              icon={
                <CircleMinus
                  color={theme.colors.screenHeaderButtonText}
                  size={28}
                />
              }
              onPress={() => decrement()}
            />
            <Text style={s.value}>{val}</Text>
            <Button
              buttonStyle={theme.styles.buttonScreenHeader}
              disabledStyle={theme.styles.buttonScreenHeader}
              disabled={val === max}
              icon={
                <CirclePlus
                  color={theme.colors.screenHeaderButtonText}
                  size={28}
                />
              }
              onPress={() => increment()}
            />
          </View>
        }
      />
    </>
  );
};

const useStyles = ThemeManager.createStyleSheet(({ theme }) => ({
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.hintGray,
    borderRadius: 20,
  },
  value: {
    ...theme.text.normal,
    paddingHorizontal: 10,
    width: 50,
    textAlign: 'center',
  },
}));

export { ListItemStepper };
