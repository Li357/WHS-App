import { bugsnag } from './misc';
import { logOut } from '../actions/actionCreators';

const teacherInvalidScheduleHandler = (store) => {
  const { schedule } = store.getState();
  // Handle case where teacher's schedules have at least one day completely class-less, causing dashboard bug
  if (schedule.length !== 5) {
    bugsnag.leaveBreadcrumb('Logging invalid teacher out');
    store.dispatch(logOut());
  }
};

const lackingDayScheduleHandler = (store) => {
  const { schedule } = store.getState();
  // Handle typo that open mods and first open mods have no day properties
  const lacksDay = schedule.some(([firstClass]) => !firstClass.day);
  if (lacksDay) {
    bugsnag.leaveBreadcrumb('Logging invalid schedule out');
    store.dispatch(logOut());
  }
};

const scheduleStringHandler = (store) => {
  const { schedule } = store.getState();
  if (typeof schedule === 'string') {
    bugsnag.leaveBreadcrumb('Logging invalid user out');
    store.dispatch(logOut());
  }
};

export default [
  teacherInvalidScheduleHandler,
  lackingDayScheduleHandler,
  scheduleStringHandler,
];
