import { Dimensions } from 'react-native';

const REQUEST_TIMEOUT = 6000; // Universal timeout for requests

const { width: WIDTH, height: HEIGHT } = Dimensions.get('window');

const MOD_ITEM_FACTOR = 0.2;
const MOD_ITEM_HEIGHT = HEIGHT * MOD_ITEM_FACTOR;
const MOD_ITEMS_HEIGHT = MOD_ITEM_HEIGHT * 11; // HR + 6 regular mods + 8 half mods

const PASSING_PERIOD_FACTOR = 1000; // Passing period IDs are 1000 + next mod #
const BEFORE_SCHOOL = 5000;
const AFTER_SCHOOL = 5001;
const BREAK = -1; // ID for break is -1 (essentially N/A)

export {
  REQUEST_TIMEOUT,
  WIDTH, HEIGHT, MOD_ITEM_HEIGHT, MOD_ITEMS_HEIGHT,
  PASSING_PERIOD_FACTOR, AFTER_SCHOOL, BEFORE_SCHOOL, BREAK,
};
export { default as SCHEDULES } from './schedules';
