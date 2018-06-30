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

/**
 * This selects the schedule of the day
 */
const selectSchedule = ({ lastDay: secondFinalsDay }, date = moment()) => {
  const firstFinalsDay = secondFinalsDay.clone().subtract(1, 'd');

  if (date.isSame(secondFinalsDay, 'month') || date.isSame(firstFinalsDay, 'month')) {
    return SCHEDULES.FINALS;
  } else if (date.day() === 3) {
    // TODO: Handle late start Wednesday here

    return SCHEDULES.WEDNESDAY;
  }

  // TODO: Handle assembly, late start, and early dismissal days

  return SCHEDULES.REGULAR;
};

const isHalfMod = modNumber => modNumber >= 4 && modNumber <= 11;

export { getCurrentMod, getNextClass, selectSchedule, isHalfMod };
