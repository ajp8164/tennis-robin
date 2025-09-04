import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';

import {
  ContentView,
  Divider,
  ListItemCollapsible,
  ListItemCollapsibleMethods,
  ThemeManager,
  listItemPosition,
  useTheme,
} from '@react-native-hello/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ContentContainer } from 'types/content';
import { SetupNavigatorParamList } from 'types/navigation';

export type Props = NativeStackScreenProps<SetupNavigatorParamList, 'Content'>;

const ContentScreen = ({ route, navigation }: Props) => {
  const theme = useTheme();
  const s = useStyles();

  const contentView = route.params.content;

  const [refs, setRefs] = useState<
    Record<string, ListItemCollapsibleMethods | null>
  >({});

  useEffect(() => {
    navigation.setOptions({
      title: contentView.name || '',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderContent = (section: ContentContainer) => {
    if (section.items) {
      return (
        <View style={s.content}>
          <ContentView items={section.items} />
        </View>
      );
    } else {
      return <></>;
    }
  };

  return (
    <View style={theme.styles.view}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior={'automatic'}>
        {contentView.lists.map((list, listIndex) => {
          return (
            <View key={listIndex}>
              {list.map((section, index: number, arr: ContentContainer[]) => {
                const key = `${listIndex}-${index}`;
                return (
                  <View key={key}>
                    {index === 0 && <Divider />}
                    <ListItemCollapsible
                      ref={ref => {
                        if (ref !== null && refs[key] === undefined) {
                          setRefs({ ...refs, [key]: ref });
                        }
                      }}
                      title={section.title}
                      position={listItemPosition(index, arr.length)}
                      onPress={() => {
                        // Close all collapsibles. This collapsible will open itself.
                        Object.keys(refs).forEach(key => refs[key]?.close());
                      }}>
                      {renderContent(section)}
                    </ListItemCollapsible>
                  </View>
                );
              })}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const useStyles = ThemeManager.createStyleSheet(() => ({
  content: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
}));

export default ContentScreen;
