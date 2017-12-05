import { Alert } from 'react-native';

const alertCrossSectioned = currentCrossSectionedMods => {
  Alert.alert(
    'Schedule',
    `You are cross sectioned for this mod with:

    - ${currentCrossSectionedMods.map(({ title, body, length, startMod }) =>
      `${title} in ${body} for mod(s) ${Array.from(new Array(length), (x, i) => i).map(key => key + startMod).join(', ')}`
    ).join('\n - ')}`
  );
}

const getClassMods = (length, startMod) => Array.from(new Array(length), (x, i) => i).map(key => key + startMod);

const isOverlapping = ({
  startMod: firstStart,
  length: firstLength
}, {
  startMod: secondStart,
  length: secondLength
}) => getClassMods(firstLength, firstStart).some(mod => getClassMods(secondLength, secondStart).includes(mod));

const getCrossSectioned = (schedule, day) => schedule.filter((scheduleItem, index, array) =>
  scheduleItem.day === day && index !== array.findIndex(anotherItem =>
    anotherItem.day === scheduleItem.day && (
      anotherItem.startMod === scheduleItem.startMod || isOverlapping(scheduleItem, anotherItem)
    )
  )
);

const getCurrentCrossSectioned = ({ startMod }, crossSectionedMods) => crossSectionedMods.filter(item =>
  item.startMod === startMod // instead of startmod use current mod-ish?
);

export {
  alertCrossSectioned,
  getCrossSectioned,
  getCurrentCrossSectioned
};
