import moment from 'moment';

import { getMods } from './processSchedule';
import {
  PASSING_PERIOD_FACTOR, AFTER_SCHOOL, BEFORE_SCHOOL,
  SCHEDULES,
} from '../constants/constants';

/**
 * Get current mod based on passed date, defaults to now
 */
const getCurrentMod = ({
  start, end, schedule,
}, date = moment()) => {
  if (date.isAfter(end)) {
    return AFTER_SCHOOL;
  } else if (date.isBefore(start)) {
    return BEFORE_SCHOOL;
  }

  return schedule.reduce((currentMod, timePair, index, array) => {
    const [modStart, modEnd] = timePair.map(time => moment(`${time}:00`, 'k:mm:ss'));
    // Add 1 to modNumber if Wednesday (because no homeroom so day starts at mod 1 not 0 (HR))
    const modNumber = index + Number(date.day() === 3);
    const isBetween = date.isAfter(modStart) && date.isBefore(modEnd);

    if (isBetween) {
      return modNumber;
    }

    const prevMod = array[index - 1];
    if (prevMod) {
      const prevModEnd = moment(`${prevMod[1]}:00`, 'k:mm:ss');
      const isPassingPeriod = date.isSameOrBefore(modStart) && date.isSameOrAfter(prevModEnd);

      if (isPassingPeriod) {
        return PASSING_PERIOD_FACTOR + modNumber;
      }
    }
    return currentMod;
  }, 0);
};

/**
 * Internal function that is intended to be used as a callback
 * in finding the class in the user's schedule that has mods
 * containing the current mod, i.e. startMod <= currentMod < endMod
 * To handle cross-sectioned situations, it checks for occupiedMods array,
 * and since getMods is [startMod, endMod), the last element of occupiedMods is ignored
 * as it is inclusive
 */
const findClassWithMod = ({ occupiedMods, ...item }, currentMod) => (
  ((occupiedMods && occupiedMods.slice(0, -1)) || getMods(item)).includes(currentMod)
);

/**
 * Internal function that gets current cross sectioned mods based on the passed currentMod
 * by iterating through the columns and checking class mods
 */
const getCurrentCrossSectioned = (crossSectionedColumns, currentMod) => (
  crossSectionedColumns.reduce((current, column) => {
    // Since this is by column, it can be assumed there is either 0 or 1 in each column
    const currentInColumn = column.find(item => findClassWithMod(item, currentMod));
    if (currentInColumn) {
      current.push(currentInColumn);
    }
    return current;
  }, [])
);

/**
 * Get next class based on next mod
 * Returns N/A when there is no next class
 */
const getNextClass = (schedule, currentMod, date) => {
  // Since arrays are 0-based and the days start at 1 (for Monday), need to -1
  const normalizedDay = date.day() - 1;

  if (normalizedDay < 0 || normalizedDay > 4) {
    return null;
  }

  const userDaySchedule = schedule[normalizedDay];
  const nextMod = currentMod > PASSING_PERIOD_FACTOR
    ? currentMod - PASSING_PERIOD_FACTOR
    : currentMod + 1;

  const nextClass = userDaySchedule.find(item => findClassWithMod(item, nextMod));

  if (!nextClass) {
    return { title: 'N/A' };
  }

  if (nextClass.crossSectionedBlock) {
    /**
     * In a cross-sectioned situation, find the list of current cross sectioned mods
     * and display as a separate component on the dashboard
     */
    const { crossSectionedColumns, sourceId } = nextClass;
    const currentCrossSectioned = getCurrentCrossSectioned(crossSectionedColumns, nextMod);

    return {
      crossSectionedBlock: true,
      currentCrossSectioned,
      sourceId,
    };
  }
  return nextClass;
};

// Internal function to find item in array which is same date as target
const hasDayMatch = (array, target) => array.some(day => day.isSame(target, 'day'));

/**
 * This selects the schedule of the day, depending on specialDates in the store, which retrieves
 * info from express server
 */
const selectSchedule = ({
  lastDay: secondSemSecondDay, semesterOneEnd, assemblyDates, lateStartDates, earlyDismissalDates,
}, date) => {
  let schedule;
  const secondSemFirstDay = secondSemSecondDay.clone().subtract(1, 'd');
  const isSecondSemFinals = date.isSame(secondSemSecondDay, 'day') || date.isSame(secondSemFirstDay, 'day');

  const firstSemFirstDay = semesterOneEnd && semesterOneEnd.clone().subtract(1, 'd');
  const isFirstSemFinals = semesterOneEnd
    ? date.isSame(semesterOneEnd, 'day') || date.isSame(firstSemFirstDay, 'day')
    : false;
  const isFinals = isFirstSemFinals || isSecondSemFinals;

  const isLateStart = hasDayMatch(lateStartDates, date);
  const hasAssembly = hasDayMatch(assemblyDates, date);

  if (isFinals) {
    // Since teachers have an extra "mod" of grading on finals day
    schedule = SCHEDULES.FINALS;
  } else if (date.day() === 3) {
    schedule = SCHEDULES[isLateStart ? 'LATE_START_WEDNESDAY' : 'WEDNESDAY'];
  } else if (isLateStart) {
    schedule = SCHEDULES.LATE_START;
  } else if (hasAssembly) {
    schedule = SCHEDULES.ASSEMBLY;
  } else {
    schedule = SCHEDULES[hasDayMatch(earlyDismissalDates, date) ? 'EARLY_DISMISSAL' : 'REGULAR'];
  }

  return {
    schedule,
    isFinals,
    hasAssembly,
  };
};

const isHalfMod = modNumber => modNumber >= 4 && modNumber <= 11;

/**
 * Returns day info, i.e. the start and end times of current day,
 * the schedule for the day, the last update time (current date) of
 * the day info, if it's Summer or a break
 */
const getDayInfo = (specialDates, date) => {
  const {
    semesterOneStart, lastDay, noSchoolDates,
  } = specialDates;
  const { schedule, isFinals, hasAssembly } = selectSchedule(specialDates, date);
  const range = [
    schedule[0][0],
    schedule.slice(-1)[0][1],
  ].map(time => moment(`${time}:00`, 'k:mm:ss'));

  const isBreak = noSchoolDates.some(day => day.isSame(date, 'day'));
  /**
   * This check either checks if it is after the last day, because around two months after
   * last day, dates are refreshed and lastDay is next year, so then can check if date is before
   * the date of semester one's start
   */
  const isSummer = date.isAfter(lastDay, 'day')
    || (lastDay.year() === date.year() + 1 && date.isBefore(semesterOneStart, 'day'));

  return [...range, schedule, date, isSummer, isBreak, hasAssembly, isFinals];
};

const decodeUnicode = string => JSON.parse(`"${string}"`);
const isScheduleEmpty = schedule => schedule.length === 0;

export {
  getCurrentMod, getNextClass,
  selectSchedule, getDayInfo,
  isHalfMod, findClassWithMod,
  isScheduleEmpty,
  decodeUnicode,
};
