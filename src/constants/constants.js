import { Dimensions } from 'react-native';

const { width: WIDTH, height: HEIGHT } = Dimensions.get('window');

const MOD_ITEM_FACTOR = 0.1;
const MOD_ITEM_HEIGHT = HEIGHT * MOD_ITEM_FACTOR;
const MOD_ITEMS_HEIGHT = MOD_ITEM_HEIGHT * 11; // HR + 6 regular mods + 8 half mods

export { WIDTH, HEIGHT, MOD_ITEM_HEIGHT, MOD_ITEMS_HEIGHT };
