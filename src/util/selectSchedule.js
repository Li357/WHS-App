import moment from 'moment';

import { SCHEDULES } from '../constants/constants';

const selectSchedule = ({ lastDay: secondFinalsDay }, date = moment()) => {
  const formattedDate = date.format('MMMM D');
  const firstFinalsDay = moment(secondFinalsDay, 'MMMM D').subtract(1, 'd').format('MMMM D');

  if (formattedDate === secondFinalsDay || formattedDate === firstFinalsDay) {
    return SCHEDULES.FINALS;
  } else if (date.day() === 3) {
    // TODO: Handle late start Wednesday here

    return SCHEDULES.WEDNESDAY;
  }

  // TODO: Handle assembly, late start, and early dismissal days

  return SCHEDULES.REGULAR;
};
export default selectSchedule;
