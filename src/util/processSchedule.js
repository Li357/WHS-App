import _, { minBy, maxBy, sortBy } from 'lodash';

import { findClassWithMod } from './querySchedule';

// This function is exclusive
const range = (start, end) => Array(end - start).fill().map((x, i) => i + start);

const getMods = ({ startMod, endMod }) => range(startMod, endMod);

const getOccupiedMods = (scheduleItems) => {
  const min = minBy(scheduleItems, 'startMod');
  const max = maxBy(scheduleItems, 'endMod');
  return range(min, max + 1);
};

const interpolateOpenMods = scheduleItems => (
  scheduleItems.reduce((withOpenMods, { endMod, sourceId }, index, array) => {
    const newArray = [...withOpenMods, array[index]];
    const next = array[index + 1];
    if (
      (next && endMod < next.startMod) // Either next exists and endMod < next startMod
      || (!next && endMod !== 15) // Or next does not exist and endMod not 15 (last mod(s) are open)
    ) {
      const openModLength = (next ? next.startMod : 15) - endMod;
      return [
        ...newArray,
        {
          sourceId: sourceId + 10000, // Set sourceType of open mods for keys in React iterations
          title: 'Open Mod',
          startMod: endMod,
          length: openModLength, // If next does not exist, use 15
          endMod: endMod + openModLength,
        },
      ];
    }
    return newArray;
  }, [])
);

const interpolateCrossSectionedMods = scheduleItems => (
  scheduleItems.slice().reduce((withCrossSections, { endMod, sourceId }, index, array) => {
    const newArray = [...withCrossSections, array[index]];
    const next = array[index + 1];
    if (next && endMod > next.startMod) {
      const crossSectioned = array.slice(index).filter((item, i, arr) => {
        const nextItem = arr[i + 1];
        return nextItem && item.endMod > nextItem.startMod;
      });
      array.splice(index, crossSectioned.length); // Skip over cross-sectioned mods
      const occupiedMods = getOccupiedMods(crossSectioned);

      const groupedByColumn = crossSectioned.reduce((grouped, item) => {
        const availableColumn = grouped.findIndex(sub => (
          sub.find(subItem => subItem.endMod < item.startMod)
        ));
        if (availableColumn) {
          grouped[availableColumn].push(item);
          return grouped;
        }
        grouped.push([item]);
        return grouped;
      }, []);

      return [
        ...newArray,
        {
          sourceId: sourceId + 20000,
          crossSectionedBlock: true,
          crossSectionedColumns: groupedByColumn,
          occupiedMods,
        },
      ];
    }
    return newArray;
  }, [])
);

// TODO: Clean up this mess
const shiftItem = ({ crossSectionedBlock, occupiedMods, startMod, endMod, ...scheduleItem }, by) => ({
  ...scheduleItem,
  ...(
    crossSectionedBlock
      ? {
          // Shifts occupied mods by one
          occupiedMods: occupiedMods.map(mod => mod + 1),
          crossSectionedColumns: crossSectionedColumns.map(column => (
            column.map(item => shiftItem(item, 1))
          )),
        }
      : {
          startMod: startMod + 1,
          endMod: endMod + 1,
        }
  ),
});

const splitItem = (item, splitMod) => [
  { ...item, length: splitMod - item.startMod, endMod: splitMod },
  shiftItem({
    ...item,
    sourceId: item.sourceId + 1,
    length: (item.endMod + 1) - splitMod,
    startMod: splitMod
  }, 1),
];

const interpolateAssembly = (content) => {
  const assemblyMod = 3;
  // This calculates the actual index of the assembly in relation the user's schedule
  const assemblyIndex = content.findIndex(({
    crossSectionedBlock, occupiedMods, ...scheduleItem,
  }) => (
    (crossSectionedBlock && occupiedMods.includes(assemblyMod))
    || (findClassWithMod(scheduleItem, assemblyMod))
  ));
  const unshifted = content.slice(0, assemblyIndex);
  /**
   * Since this essentially splices the user's schedule, inserting an assembly scheduleItem,
   * a shift is needed to shift all startMods and endMods by one to accomodate the new scheduleItem
   */
  const shifted = content.slice(assemblyIndex + 1).map(item => shiftItem(item, 1));
  // This item is the scheduleItem either overlapping or after the assembly
  const afterAssemblyItem = content[assemblyIndex];

  const assemblyItem = {
    title: 'Assembly',
    length: 1,
    sourceId: sourceId + 30000,
    startMod: assemblyMod,
    endMod: assemblyMod + 1,
  };

  // Handles cross-section case (where assembly cuts through cross-section block)
  if (afterAssemblyItem.crossSectionedBlock) {
    const { crossSectionedColumns, occupiedMods, sourceId } = afterAssemblyItem;
    const [before, after] = crossSectionedColumns.reduce((both, column) => (
      //TODO: Finish this block
      // Subtract 1 because we want all cross sectioned mods before assembly
      column
        .filter(item => findClassWithMod(item, assemblyMod - 1))
        // This will split cross-sectioned mods that do overlap the assembly
        .map(item => item.endMod !== assemblyMod ? splitItem(item, assemblyMod)[0] : item)
    ), [[], []]);

    return [
      ...unshifted,
      {
        ...afterAssemblyItem,
        crossSectionedColumns: before,
        occupiedMods: [occupiedMods[0], assemblyMod],
      },
      assemblyItem,
      {
        ...afterAssemblyItem,
        crossSectionedColumns: after,
        occupiedMods: [assemblyMod + 1, occupiedMods[1] + 1],
        sourceId: sourceId + 1,
      },
      ...shifted,
    ];
  }
  // Handles case where assembly cuts through a singular class (such as a double mod)
  if (afterAssemblyItem.startMod !== assemblyMod) {
    const [beforeAssembly, afterAssembly] = splitItem(afterAssemblyItem, assemblyMod);
    return [
      ...unshifted,
      beforeAssembly,
      assemblyItem,
      afterAssembly,
      ...shifted,
    ];
  }

  return [
    ...unshifted,
    assemblyItem, // Inserts assembly item
    shiftItem(afterAssemblyItem, 1),
    ...shifted,
  ];
};

const mapToFinals = content => [
  content[0], // Homeroom info
  ...Array(4).fill().map((item, index) => ({
    title: 'Finals',
    length: 1,
    startMod: index + 1, // index + 1 because index starts at 0, and HR is already filled
    endMod: index + 2,
  })), // 4 final mods
];

/**
 * Schedule processing algorithm
 * If current startMod + length < next startMod, fill with open mod(s)
 * If current startMod + length === next startMod, do nothing
 * If current startMod + length > next startMod, cross sectioned
 *    Iff in a cross sectioned situation, cross-sectioned mods are sorted into columns,
 *    in such a way to facilitate ScheduleCard UI display; each column has no overlap and are
 *    layed out optimally based on the assumption of sorting by startMod then length
 */
const processSchedule = schedule => (
  _(schedule)
    .groupBy('day')
    .values()
    /* eslint-disable function-paren-newline */
    .map(dayArray => interpolateOpenMods(
      interpolateCrossSectionedMods(
        sortBy(dayArray, ['startMod', 'length']),
      ),
    ))
    /* eslint-enable function-paren-newline */
    .value()
);

export default processSchedule;
export { getMods, mapToFinals, interpolateAssembly };
