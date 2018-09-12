import _, { minBy, maxBy, sortBy } from 'lodash';
import moment from 'moment';

import { findClassWithMod, isScheduleEmpty } from './querySchedule';
import { ASSEMBLY_MOD } from '../constants/constants';

// Internal function (for getMods) to get range of numbers, [start, end)
const range = (start, end) => Array(end - start).fill().map((x, i) => i + start);

// Returns an array of numbers signifying a class' mods, startMod <= x < endMod
const getMods = ({ startMod, endMod }) => range(startMod, endMod);

// Returns an array of occupied mods for cross-sectioned blocks, [start, end] inclusive
const getOccupiedMods = (scheduleItems) => {
  const { startMod } = minBy(scheduleItems, 'startMod');
  const { endMod } = maxBy(scheduleItems, 'endMod');
  return range(startMod, endMod + 1);
};

/**
 * Interpolates open mods into an array of schedule items, accomplishing by reducing scheduleItems
 * and searching the next item. If the next item's startMod is greater than the current item's
 * endMod, then there must be an open mod
 */
const interpolateOpenMods = (scheduleItems, day) => {
  // Handle staff members that have no classes in a particular day
  if (scheduleItems.length === 0) {
    return [{
      sourceId: 50000,
      title: 'Open Mod',
      startMod: 0,
      endMod: 15,
      day: day + 1, // indices are 0-based
    }];
  }

  return scheduleItems.reduce((withOpenMods, {
    crossSectionedBlock, occupiedMods, endMod, sourceId, startMod, day: itemDay,
  }, index, array) => {
    // Handles case where homeroom is not first mod, i.e. for staff who don't have homerooms
    let prevOpenMod = [];
    // If first class in array and does not start at homeroom, then pad with open mod
    if (index === 0 && startMod !== 0) {
      prevOpenMod = [{
        sourceId: sourceId + 9999,
        title: 'Open Mod',
        startMod: 0,
        length: startMod,
        endMod: startMod,
        day: itemDay,
      }];
    }

    const newArray = [...withOpenMods, array[index]];
    const next = array[index + 1];
    const nextStartMod = next && (next.startMod || next.occupiedMods[0]);
    const adjustedEndMod = crossSectionedBlock ? occupiedMods.slice(-1)[0] : endMod;
    const lessThanNext = adjustedEndMod < nextStartMod;
    if (
      lessThanNext // Either next exists and endMod < next startMod or cross-sectioned block
      || (!next && endMod !== 15) // Or next does not exist and endMod not 15 (last mod(s) are open)
    ) {
      const openModLength = (next ? nextStartMod : 15) - adjustedEndMod;
      return [
        ...prevOpenMod,
        ...newArray,
        {
          sourceId: sourceId + 10000, // Set sourceId of open mods for keys in React iterations
          title: 'Open Mod',
          startMod: adjustedEndMod,
          length: openModLength, // If next does not exist, use 15
          endMod: adjustedEndMod + openModLength,
          day: itemDay,
        },
      ];
    }
    return newArray;
  }, []);
};

// Internal function to return an array of scheduleItems between the specified bounds
const getModsInBetween = (start, end, scheduleItems) => (
  scheduleItems.filter((item) => {
    const mods = getMods(item);
    return start <= mods[0] && end >= mods.slice(-1)[0];
  })
);
/**
 * Interpolates cross sectioned blocks into an array of scheduleItems. The algorithm itself finds
 * the first cross-sectioned mod within the array, by checking if the next item's startMod is less
 * than that of the current endMod signifying cross-sectioning. Then, if a cross-section block
 * exists, it finds the remaining cross sectioned blocks, splits them into consecutive blocks to
 * handle multiple cross sectioned blocks. After, it finds the items between each block, then
 * interpolates the cross sectioned blocks before and after the items in between
 */
const interpolateCrossSectionedMods = (scheduleItems) => {
  const firstCrossSectionIndex = scheduleItems.findIndex(({ endMod }, index, array) => {
    const next = array[index + 1];
    return next && endMod > next.startMod;
  });

  if (firstCrossSectionIndex > -1) { // If cross-sectioned block exists in current user day schedule
    const { sourceId } = scheduleItems[firstCrossSectionIndex];
    const crossSectioned = scheduleItems.slice(firstCrossSectionIndex).filter((item, i, arr) => {
      /**
       * Bidirectional inspection is needed because we want both the first and last items in each
       * consecutive cross-sectioned block
       */
      const prevItem = arr[i - 1];
      const nextItem = arr[i + 1];
      return (prevItem && prevItem.endMod > item.startMod)
        || (nextItem && item.endMod > nextItem.startMod);
    });

    /**
     * A naive approach to split cross sectioned mods into consecutive blocks by keeping a record
     * of the current block, and checking each next element until the block is over
     */
    let currentBlock = 0;
    const crossSectionedBlocks = crossSectioned.reduce((blocks, item, i, arr) => {
      const prevItem = arr[i - 1];

      if (prevItem && prevItem.endMod < item.startMod) {
        blocks.push([item]);
        currentBlock += 1;
        return blocks;
      }
      /* eslint-disable no-param-reassign */
      blocks[currentBlock] = blocks[currentBlock] || [];
      blocks[currentBlock].push(item);
      /* eslint-enable no-param-reassign */
      return blocks;
    }, []);

    /**
     * Interpolates the mods in between each cross sectioned block, and organizes each block
     * optimally into columns for display (see CrossSectionItem)
     */
    const withBetweens = crossSectionedBlocks.reduce((withBetween, block, i, arr) => {
      const occupiedMods = getOccupiedMods(block);

      const groupedByColumn = block.reduce((grouped, item) => {
        // Finds available column to insert next item in block
        const availableColumn = grouped.findIndex(sub => (
          sub.find(subItem => subItem.endMod <= item.startMod)
        ));

        if (availableColumn > -1) { // If there is an available column
          /* eslint-disable no-param-reassign */
          grouped[availableColumn] = grouped[availableColumn] || [];
          grouped[availableColumn].push(item);
          /* eslint-enable no-param-reassign */
          return grouped;
        }
        // If not, start a new column
        grouped.push([item]);
        return grouped;
      }, []);

      // Gets the mods in between the current block and the next block
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

    /**
     * Since each block contains >1 mod, we cannot just slice at firstCrossSectionIndex
     * to get all the mods after withBetweens
     */
    const { occupiedMods } = withBetweens.slice(-1)[0];
    // Finds the index where withBetweens ends
    const afterIndex = scheduleItems.findIndex(item => (
      occupiedMods && item.startMod >= occupiedMods.slice(-1)[0]
    ));

    // Reconstruct scheduleItems by inserting withBetweens which includes the cross-sectioned blocks
    return [
      ...scheduleItems.slice(0, firstCrossSectionIndex),
      ...withBetweens,
      ...scheduleItems.slice(afterIndex),
    ];
  }

  return scheduleItems;
};

// Internal function to shift each scheduleItem's start and end mods by one during assemblies
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

// Interal function to split a scheduleItem in two in case of overlapping mods in an assembly
const splitItem = (item, splitMod) => [
  { ...item, length: splitMod - item.startMod, endMod: splitMod },
  shiftItem({
    ...item,
    sourceId: item.sourceId + 1,
    length: item.endMod - splitMod,
    startMod: splitMod,
  }, 1),
];

/**
 * Interpolates an assembly scheduleItem in an assembly situation. It handles three cases:
 * 1. Assembly doesn't cut through any current classes (i.e. double mods or cross sectioned blocks)
 *    in which case a simple insertion is sufficient
 * 2. Assembly cuts through singular class (i.e. double mod) in which splitItems is called to split
 *    the class in two chunks, before and after the assembly
 * 3. Assembly cuts through cross-sectioned block, in which case it splits items in each column
 */
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

// Returns an array of finals schedule items
const mapToFinals = content => [
  content[0], // Homeroom info
  ...Array(4).fill().map((item, index) => ({
    title: 'Finals',
    length: 1,
    startMod: index + 1, // index + 1 because index starts at 0, and HR is already filled
    endMod: index + 2,
  })), // 4 final mods
];

// Curried function to only apply passed function if day of the scheduleItem array is current day
const onlyIfCurrentDay = fn => (content) => {
  const day = moment().day();
  if (content[0].day === day) {
    return fn(content);
  }
  return content;
};
// On finals or assembly days, map the schedules into assembly or finals schedules
const processFinalsOrAssembly = (schedule, hasAssembly, isFinals) => {
  if (isScheduleEmpty(schedule) || (!hasAssembly && !isFinals)) {
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
    .defaults({
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
    })
    .values()
    /* eslint-disable function-paren-newline */
    .map((dayArray, day) => interpolateOpenMods(
      interpolateCrossSectionedMods(
        sortBy(dayArray, ['startMod', 'length']),
      ),
      day,
    ))
    /* eslint-enable function-paren-newline */
    .value()
);

export default processSchedule;
export { getMods, mapToFinals, interpolateAssembly, processFinalsOrAssembly };
