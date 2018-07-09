import { Dimensions } from 'react-native';

const REQUEST_TIMEOUT = 6000; // Universal timeout for requests

const { width: WIDTH, height: HEIGHT } = Dimensions.get('window');

const MOD_ITEM_FACTOR = 0.2;
const MOD_ITEM_HEIGHT = HEIGHT * MOD_ITEM_FACTOR;
const MOD_ITEMS_HEIGHT = MOD_ITEM_HEIGHT * 10.5; // HR (1/2) + 6 regular mods + 8 half mods

const PASSING_PERIOD_FACTOR = 1000; // Passing period IDs are 1000 + next mod #
const BEFORE_SCHOOL = 5000;
const AFTER_SCHOOL = 5001;
const BREAK = -1; // ID for break is -1 (essentially N/A)
const ASSEMBLY_MOD = 3;

export {
  REQUEST_TIMEOUT,
  WIDTH, HEIGHT, MOD_ITEM_HEIGHT, MOD_ITEMS_HEIGHT,
  PASSING_PERIOD_FACTOR, AFTER_SCHOOL, BEFORE_SCHOOL, BREAK, ASSEMBLY_MOD,
};
export { default as SCHEDULES } from './schedules';
