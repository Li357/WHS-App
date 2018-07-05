import moment from 'moment';

import { getMods } from './processSchedule';
import { PASSING_PERIOD_FACTOR, AFTER_SCHOOL, BEFORE_SCHOOL, SCHEDULES } from '../constants/constants';

/**
 * Get current mod based on passed date, defaults to now
 */
const getCurrentMod = ({ start, end, schedule }, date = moment()) => {
  if (date.isAfter(end)) {
    return AFTER_SCHOOL;
  } else if (date.isBefore(start)) {
    return BEFORE_SCHOOL;
  }

  return schedule.reduce((currentMod, timePair, index, array) => {
    const [modStart, modEnd] = timePair.map(time => moment(`${time}:00`, 'k:mm:ss'));
    const modNumber = index + Number(date.day() === 3);
    const isBetween = date.isAfter(modStart) && date.isBefore(modEnd);

    if (isBetween) {
      return modNumber;
    }

    const prevMod = array[index - 1];
    if (prevMod) {
      const prevModEnd = moment(`${prevMod[1]}:00`, 'k:mm:ss');
      const isPassingPeriod = date.isBefore(modStart) && date.isAfter(prevModEnd);

      return isPassingPeriod
        ? PASSING_PERIOD_FACTOR + modNumber
        : currentMod;
    }
    return currentMod;
  }, 0);
};

/**
 * Internal function that is intended to be used as a callback
 * in finding the class in the user's schedule that has mods
 * containing the current mod, i.e. startMod < currentMod < endMod
 */
const findClassWithMod = (item, currentMod) => getMods(item).includes(currentMod);

/**
 * Get next class based on next mod
 * Returns N/A when there is no next class
 */
const getNextClass = (schedule, currentMod, date = moment()) => {
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
    const currentCrossSectioned = crossSectionedColumns.reduce((current, column) => {
      // Since this is by column, it can be assumed there is either 0 or 1 in each column
      const currentInColumn = column.find(item => findClassWithMod(item, nextMod));
      if (currentInColumn) {
        current.push(currentInColumn);
      }
      return current;
    }, []);

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
  lastDay: secondFinalsDay, assemblyDates, lateStartDates, earlyDismissalDates,
}, date) => {
  let schedule;
  const firstFinalsDay = secondFinalsDay.clone().subtract(1, 'd');
  const isLateStart = hasDayMatch(lateStartDates, date);
  const isFinals = date.isSame(secondFinalsDay, 'day') || date.isSame(firstFinalsDay, 'day');
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
  const { semesterOneStart, lastDay, noSchoolDates } = specialDates;
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
  const isSummer = date.isAfter(lastDay)
    || (lastDay.year() === date.year() + 1 && date.isBefore(semesterOneStart));

  return [...range, schedule, date, isSummer, isBreak, hasAssembly, isFinals];
};

export { getCurrentMod, getNextClass, selectSchedule, isHalfMod, getDayInfo };
