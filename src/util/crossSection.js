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

const getCurrentCrossSectioned = ({ startMod }, crossSectionedMods) => crossSectionedMods.filter(item =>
  item.startMod === startMod
);

export {
  alertCrossSectioned,
  getCurrentCrossSectioned
};
