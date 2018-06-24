import { Dimensions } from 'react-native';

const REQUEST_TIMEOUT = 6000; // Universal timeout for requests

const { width: WIDTH, height: HEIGHT } = Dimensions.get('window');

const MOD_ITEM_FACTOR = 0.2;
const MOD_ITEM_HEIGHT = HEIGHT * MOD_ITEM_FACTOR;
const MOD_ITEMS_HEIGHT = MOD_ITEM_HEIGHT * 11; // HR + 6 regular mods + 8 half mods

export { REQUEST_TIMEOUT, WIDTH, HEIGHT, MOD_ITEM_HEIGHT, MOD_ITEMS_HEIGHT };
export { default as SCHEDULES } from './schedules';
