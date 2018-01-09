import { Alert } from 'react-native';

const alertCrossSectioned = (scheduleItem, currentCrossSectioned) => {
  Alert.alert(
    'Schedule',
    `You are cross sectioned for this mod with:

    - ${currentCrossSectioned.map(({ title, body, ...modObj }) =>
      `${title} in ${body} for mod(s) ${getOverlappingMods(scheduleItem, modObj).join(', ')}`
    ).join('\n - ')}`
  );
}

const getClassMods = ({ length, startMod }) => Array.from(new Array(length), (x, i) => i).map(key => key + startMod);

const getOverlappingMods = (firstMod, secondMod) => {
  return getClassMods(firstMod).filter(mod => getClassMods(secondMod).includes(mod));
}

const getTodayCrossSectioned = (schedule, day) => schedule.filter((scheduleItem, index, array) =>
  scheduleItem && scheduleItem.day === day && index !== array.findIndex(anotherItem =>
    anotherItem.day === scheduleItem.day && (
      anotherItem.startMod === scheduleItem.startMod || getOverlappingMods(scheduleItem, anotherItem).length > 0
    )
  )
);

const getCurrentCrossSectioned = (scheduleItem, todayCrossSectioned) => todayCrossSectioned.filter(item =>
  getOverlappingMods(scheduleItem, item).length > 0
);

export {
  alertCrossSectioned,
  getOverlappingMods,
  getTodayCrossSectioned,
  getCurrentCrossSectioned,
  getClassMods
};
