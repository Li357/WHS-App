import moment from 'moment';

import { SCHEDULES } from '../constants/constants';

const selectSchedule = ({ lastDay }, date = moment()) => {
  const secondFinalsDay = moment(lastDay, 'MMMM D');
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
export default selectSchedule;
