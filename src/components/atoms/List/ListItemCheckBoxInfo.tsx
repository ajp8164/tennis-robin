import React, { useImperativeHandle, useRef } from 'react';

import {
  CollapsibleView,
  ListItemSwipeable,
  ListItemSwipeableMethods,
  ThemeManager,
  useTheme,
} from '@react-native-hello/ui';
import { Check, Square, SquareCheckBig } from 'lucide-react-native';

interface ListItemCheckBoxInfo extends ListItemSwipeable {
  checked: boolean;
  checkBox?: boolean;
  expanded?: boolean;
  ExpandableComponent?: React.ReactElement;
  onPressInfo?: () => void;
  hideInfo?: boolean;
}

export interface ListItemCheckBoxInfoMethods extends ListItemSwipeableMethods {}

const ListItemCheckBoxInfo = React.forwardRef<
  ListItemCheckBoxInfoMethods,
  ListItemCheckBoxInfo
>((props, ref) => {
  const {
    checked,
    checkBox,
    expanded = false,
    ExpandableComponent,
    onPressInfo,
    hideInfo,
    ...rest
  } = props;

  const theme = useTheme();
  const s = useStyles();
  const liRef = useRef<ListItemSwipeableMethods>(null);

  useImperativeHandle(ref, () => ({
    //  These functions exposed to the parent component through the ref.
    close,
  }));

  const close = () => {
    liRef.current?.close();
  };

  return (
    <>
      <ListItemSwipeable
        ref={liRef}
        {...rest}
        leftContent={
          <>
            {checkBox ? (
              checked ? (
                <SquareCheckBig color={theme.colors.listItemIcon} />
              ) : (
                <Square color={theme.colors.listItemIcon} />
              )
            ) : (
              <Check
                color={theme.colors.listItemIcon}
                style={[checked ? {} : s.unchecked]}
              />
            )}
          </>
        }
        rightContent={hideInfo ? undefined : 'info'}
        onPressRight={onPressInfo}
      />
      <CollapsibleView expanded={expanded}>
        {ExpandableComponent}
      </CollapsibleView>
    </>
  );
});

const useStyles = ThemeManager.createStyleSheet(() => ({
  unchecked: {
    opacity: 0,
  },
}));

export { ListItemCheckBoxInfo };
