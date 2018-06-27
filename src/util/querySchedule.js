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
    const [modStart, modEnd] = timePair.map(time => moment(`${time}:00`, 'kk:mm:ss'));
    const modNumber = index + (date.day() === 3 ? 1 : 0);
    const isBetween = date.isAfter(modStart) && date.isBefore(modEnd);

    if (isBetween) {
      return modNumber;
    }

    const lastMod = array[index - 1];
    if (lastMod) {
      const lastModEnd = moment(`${lastMod[1]}:00`, 'kk:mm:ss');
      const isPassingPeriod = date.isBefore(modStart) && date.isAfter(lastModEnd);

      return isPassingPeriod
        ? PASSING_PERIOD_FACTOR + modNumber
        : currentMod;
    }
    return currentMod;
  }, 0);
};

/**
 * Get next class based on next mod
 * Returns N/A when there is no next class
 */
const getNextClass = (schedule, currentMod, date = moment()) => {
  const normalizedDay = date.day() - 1;
  const userDaySchedule = schedule[normalizedDay];

  return userDaySchedule.find(item => (
    getMods(item).includes(
      currentMod > PASSING_PERIOD_FACTOR
        ? currentMod - PASSING_PERIOD_FACTOR
        : currentMod + 1,
    )
  )) || { title: 'N/A' };
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

/**
 * Returns array of dates as strings in the form "January 4"
 */
const rangeOfDates = (month, first, last) => (
  Array(last - first).fill().map((_, i) => `${month} ${i + Number(first)}`)
);

export { getCurrentMod, getNextClass, selectSchedule, rangeOfDates };
