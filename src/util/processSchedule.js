import _, { minBy, maxBy, sortBy } from 'lodash';
import moment from 'moment';

import { findClassWithMod } from './querySchedule';
import { ASSEMBLY_MOD } from '../constants/constants';

// This function is exclusive
const range = (start, end) => Array(end - start).fill().map((x, i) => i + start);

const getMods = ({ startMod, endMod }) => range(startMod, endMod);

const getOccupiedMods = (scheduleItems) => {
  const { startMod } = minBy(scheduleItems, 'startMod');
  const { endMod } = maxBy(scheduleItems, 'endMod');
  return range(startMod, endMod + 1);
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

const getModsInBetween = (start, end, scheduleItems) => (
  scheduleItems.filter(item => {
    const mods = getMods(item);
    return start <= mods[0] && end >= mods.slice(-1)[0];
  })
);
const interpolateCrossSectionedMods = (scheduleItems) => {
  const firstCrossSectionIndex = scheduleItems.findIndex(({ endMod }, index, array) => {
    const next = array[index + 1];
    return next && endMod > next.startMod;
  });

  if (firstCrossSectionIndex > -1) {
    const { sourceId } = scheduleItems[firstCrossSectionIndex];
    const crossSectioned = scheduleItems.slice(firstCrossSectionIndex).filter((item, i, arr) => {
      const prevItem = arr[i - 1];
      const nextItem = arr[i + 1];
      return (prevItem && prevItem.endMod > item.startMod)
        || (nextItem && item.endMod > nextItem.startMod);
    });

    let currentBlock = 0;
    const crossSectionedBlocks = crossSectioned.reduce((blocks, item, i, arr) => {
      const prevItem = arr[i - 1];

      if (prevItem && prevItem.endMod < item.startMod) {
        blocks.push([item]);
        currentBlock++;
        return blocks;
      }
      blocks[currentBlock] = blocks[currentBlock] || [];
      blocks[currentBlock].push(item);
      return blocks;
    }, []);

    const withBetweens = crossSectionedBlocks.reduce((withBetween, block, i, arr) => {
      const occupiedMods = getOccupiedMods(block);

      const groupedByColumn = block.reduce((grouped, item) => {
        const availableColumn = grouped.findIndex(sub => (
          sub.find(subItem => subItem.endMod <= item.startMod)
        ));

        if (availableColumn > -1) {
          grouped[availableColumn] = grouped[availableColumn] || [];
          grouped[availableColumn].push(item);
          return grouped;
        }
        grouped.push([item]);
        return grouped;
      }, []);

      const nextBlock = arr[i + 1];
      const nextOccupiedMods = nextBlock && getOccupiedMods(nextBlock);
      const between = nextBlock
        ? getModsInBetween(occupiedMods.slice(-1)[0], nextOccupiedMods[0], scheduleItems)
        : [];

      return [
        ...withBetween,
        {
          sourceId: sourceId + 20000 + i,
          crossSectionedBlock: true,
          crossSectionedColumns: groupedByColumn,
          occupiedMods,
        },
        ...between,
      ];
    }, []);

    const { occupiedMods } = withBetweens.slice(-1)[0];
    const afterIndex = scheduleItems.findIndex(item => (
      occupiedMods && item.startMod >= occupiedMods.slice(-1)[0]
    ));

    return [
      ...scheduleItems.slice(0, firstCrossSectionIndex),
      ...withBetweens,
      ...scheduleItems.slice(afterIndex),
    ];
  }

  return scheduleItems;
};

const shiftItem = ({
  crossSectionedBlock, crossSectionedColumns, occupiedMods, startMod, endMod, ...scheduleItem
}, by) => ({
  ...scheduleItem,
  ...(
    crossSectionedBlock
      /* eslint-disable indent */
      ? {
          // Shifts occupied mods by one
          crossSectionedBlock,
          occupiedMods: occupiedMods.map(mod => mod + 1),
          crossSectionedColumns: crossSectionedColumns.map(column => (
            column.map(item => shiftItem(item, by))
          )),
        }
      : {
          startMod: startMod + by,
          endMod: endMod + by,
        }
      /* eslint-enable indent */
  ),
});

const splitItem = (item, splitMod) => [
  { ...item, length: splitMod - item.startMod, endMod: splitMod },
  shiftItem({
    ...item,
    sourceId: item.sourceId + 1,
    length: item.endMod - splitMod,
    startMod: splitMod,
  }, 1),
];

const interpolateAssembly = (content) => {
  // This calculates the actual index of the assembly in relation the user's schedule
  const assemblyIndex = content.findIndex(({
    crossSectionedBlock, occupiedMods, ...scheduleItem
  }) => (
    (crossSectionedBlock && occupiedMods.includes(ASSEMBLY_MOD))
    || (!crossSectionedBlock && findClassWithMod(scheduleItem, ASSEMBLY_MOD))
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
    sourceId: afterAssemblyItem.sourceId + 30000,
    startMod: ASSEMBLY_MOD,
    endMod: ASSEMBLY_MOD + 1,
  };

  // Handles cross-section case (where assembly cuts through cross-section block)
  if (afterAssemblyItem.crossSectionedBlock) {
    const { crossSectionedColumns, occupiedMods, sourceId } = afterAssemblyItem;
    const [before, after] = Array(2).fill(crossSectionedColumns).map((array, index) => (
      array.map(column => (
        /**
         * Subtract 1 because we want all cross sectioned mods before assembly
         * and 0 because we want all cross-sectioned mods after assembly, not shifted by one
         */
        column
          .filter(item => findClassWithMod(item, ASSEMBLY_MOD - [1, 0][index]))
          // This will split cross-sectioned mods that do overlap the assembly
          .map(item => (
            !(item.endMod === ASSEMBLY_MOD || item.startMod === ASSEMBLY_MOD)
              ? splitItem(item, ASSEMBLY_MOD)[index]
              : shiftItem(item, 1)
          ))
      ))
    ));

    return [
      ...unshifted,
      {
        ...afterAssemblyItem,
        crossSectionedColumns: before,
        occupiedMods: [occupiedMods[0], ASSEMBLY_MOD],
      },
      assemblyItem,
      {
        ...afterAssemblyItem,
        crossSectionedColumns: after,
        occupiedMods: [ASSEMBLY_MOD + 1, occupiedMods.slice(-1)[0] + 1],
        sourceId: sourceId + 1,
      },
      ...shifted,
    ];
  }
  // Handles case where assembly cuts through a singular class (such as a double mod)
  if (afterAssemblyItem.startMod !== ASSEMBLY_MOD) {
    const [beforeAssembly, afterAssembly] = splitItem(afterAssemblyItem, ASSEMBLY_MOD);
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

const onlyIfCurrentDay = fn => (content) => {
  const day = moment().day();
  if (content[0].day === day) {
    return fn(content);
  }
  return content;
};
const processFinalsOrAssembly = (schedule, hasAssembly, isFinals) => {
  if (!hasAssembly && !isFinals) {
    return schedule;
  }

  /* eslint-disable function-paren-newline */
  return schedule.map(onlyIfCurrentDay(
    hasAssembly
      ? interpolateAssembly
      : mapToFinals,
  ));
  /* eslint-enable function-paren-newline */
};

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
export { getMods, mapToFinals, interpolateAssembly, processFinalsOrAssembly };
