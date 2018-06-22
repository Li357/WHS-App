import _, { minBy, maxBy, sortBy } from 'lodash';

// This function is inclusive
const range = (start, end) => Array((end + 1) - start).fill().map((x, i) => i + start);

const getMods = ({ startMod, endMod }) => range(startMod, endMod);

const getOccupiedMods = (scheduleItems) => {
  const min = minBy(scheduleItems, 'startMod');
  const max = maxBy(scheduleItems, 'endMod');
  return range(min, max);
};

const interpolateOpenMods = scheduleItems => (
  scheduleItems.reduce((withOpenMods, { endMod }, index, array) => {
    const newArray = [...withOpenMods, array[index]];
    const next = array[index + 1];
    if (
      next && endMod < next.startMod // Either next exists and endMod < next startMod
      || !next && endMod != 15 // Or next does not exist and endMod is not 15 (last mod(s) are open)
    ) {
      return [
        ...newArray,
        {
          title: 'Open Mod',
          length: (next ? next.startMod : 15) - endMod, // If next does not exist, use 15
        },
      ];
    }
    return newArray;
  }, [])
);

const interpolateCrossSectionedMods = scheduleItems => (
  scheduleItems.reduce((withCrossSections, { endMod }, index, array) => {
    const newArray = [...withCrossSections, array[index]];
    const next = array[index + 1];
    if (next && endMod > next.startMod) {
      const crossSectioned = array.slice(index).filter((item, i, arr) => {
        const nextItem = arr[i + 1];
        return nextItem && item.endMod > nextItem.startMod;
      });
      const occupiedMods = getOccupiedMods(crossSectioned);
      return [
        ...newArray,
        {
          crossSectionBlock: true,
          modOccupiedMatrix: occupiedMods.map(modNumber => (
            crossSectioned.map(item => getMods(item).includes(modNumber))
          )),
          crossSectionedMods: crossSectioned,
        },
      ];
    }
    return newArray;
  }, [])
);

/**
 * Schedule processing algorithm
 * If current startMod + length < next startMod, fill with open mod(s)
 * If current startMod + length === next startMod, do nothing
 * If current startMod + length > next startMod, cross sectioned
 *    Iff in a cross sectioned situation, cross-sectioned mods are expanded:
 *
 *         1         2         3
 *    ┌─────────┬─────────┬─────────┐      ┌─────────┐   1     2    3
 *    │  OPEN   │         │         | ---> |         | FALSE TRUE  TRUE
 *    ├─────────┤- - - - -|- - - - -|      ├─────────┤
 *    |         |         |         | ---> |         | TRUE  TRUE  TRUE
 *    |- - - - -├─────────┤- - - - -|      ├─────────┤
 *    |         |  OPEN   |         | ---> |         | TRUE  FALSE TRUE
 *    └─────────┴─────────┴─────────┘      └─────────┘
 */
const processSchedule = schedule => (
  _(schedule)
    .groupBy('day')
    .values()
    .map(dayArray => interpolateOpenMods(
      interpolateCrossSectionedMods(
        sortBy(dayArray, ['startMod', 'length'])
      )
    ))
    .value()
);

export default processSchedule;
