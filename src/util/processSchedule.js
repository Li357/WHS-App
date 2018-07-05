import _, { minBy, maxBy, sortBy } from 'lodash';

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
          sourceId: sourceId + 1000, // Set sourceType of open mods for keys in React iterations
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
          sourceId: sourceId + 2000,
          crossSectionedBlock: true,
          crossSectionedColumns: groupedByColumn,
          occupiedMods,
        },
      ];
    }
    return newArray;
  }, [])
);

const interpolateAssembly = (content) => {
  // TODO: Handle adding assembly to user schedule,
  // Also handle cases where assembly cuts through classes or cross-sectioned blocks
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
