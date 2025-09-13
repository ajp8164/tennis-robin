import { SectionListData } from 'react-native';

export type Options = {
  reverse?: boolean;
  reverseSectionData?: boolean;
};

// Creates groups of items for a SectionList.
export const groupItems = <T, S>(
  items: T[],
  groupTitle: (item: T, index: number, array: readonly T[]) => string,
  options?: Options,
): SectionListData<T, S>[] => {
  const reverseSectionData = !!options?.reverseSectionData;

  const groupedItems: {
    [key in string]: T[];
  } = {};

  // Create and fill sections.
  items.forEach((item, index, array) => {
    const title = groupTitle(item, index, array);
    groupedItems[title] = groupedItems[title] || [];
    groupedItems[title].push(item);
  });

  // Create the section list shape.
  const sectionData: SectionListData<T, S>[] = [];
  Object.keys(groupedItems).forEach(group => {
    let data = groupedItems[group].sort();
    data = reverseSectionData ? data.reverse() : data;
    return sectionData.push({
      title: group,
      data,
    } as unknown as SectionListData<T, S>);
  });

  return options?.reverse ? sectionData.reverse() : sectionData;
};
