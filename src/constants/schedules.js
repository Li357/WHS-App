const REGULAR = [
  ['8:00', '8:15'],
  ['8:20', '9:00'],
  ['9:05', '9:40'],
  ['9:45', '10:20'],
  ['10:25', '10:40'],
  ['10:45', '11:00'],
  ['11:05', '11:22'],
  ['11:27', '11:44'],
  ['11:49', '12:06'],
  ['12:11', '12:28'],
  ['12:33', '12:50'],
  ['12:55', '13:10'],
  ['13:15', '13:50'],
  ['13:55', '14:30'],
  ['14:35', '15:10'],
];

const WEDNESDAY = [
  ['8:00', '8:40'],
  ['8:45', '9:20'],
  ['9:25', '10:00'],
  ['10:05', '10:20'],
  ['10:25', '10:40'],
  ['10:45', '11:02'],
  ['11:07', '11:24'],
  ['11:29', '11:46'],
  ['11:51', '12:08'],
  ['12:13', '12:30'],
  ['12:35', '12:50'],
  ['12:55', '13:30'],
  ['13:50', '14:10'],
  ['14:15', '14:50'],
];

const EARLY_DISMISSAL = [
  ['8:00', '8:05'],
  ['8:10', '8:40'],
  ['8:45', '9:10'],
  ['9:15', '9:40'],
  ['9:45', '9:55'],
  ['10:00', '10:10'],
  ['10:15', '10:25'],
  ['10:30', '10:40'],
  ['10:45', '10:55'],
  ['11:00', '11:10'],
  ['11:15', '11:25'],
  ['11:30', '11:40'],
  ['11:45', '12:10'],
  ['12:15', '12:40'],
  ['12:45', '13:10'],
];

const LATE_START = [
  ['10:00', '10:05'],
  ['10:10', '10:40'],
  ['10:45', '11:10'],
  ['11:15', '11:40'],
  ['11:45', '11:55'],
  ['12:00', '12:10'],
  ['12:15', '12:25'],
  ['12:30', '12:40'],
  ['12:45', '12:55'],
  ['13:00', '13:10'],
  ['13:15', '13:25'],
  ['13:30', '13:40'],
  ['13:45', '14:10'],
  ['14:15', '14:40'],
  ['14:45', '15:10'],
];

const LATE_START_WEDNESDAY = [
  ['10:00', '10:25'],
  ['10:30', '10:55'],
  ['11:00', '11:25'],
  ['11:30', '11:40'],
  ['11:45', '11:55'],
  ['12:00', '12:10'],
  ['12:15', '12:25'],
  ['12:30', '12:40'],
  ['12:45', '12:55'],
  ['13:00', '13:10'],
  ['13:15', '13:25'],
  ['13:30', '13:55'],
  ['14:00', '14:25'],
  ['14:30', '14:50'],
];

// TODO: Set assembly index in actual special date items
const ASSEMBLY = [
  ['8:00', '8:15'],
  ['8:20', '8:50'],
  ['8:55', '9:25'],
  ['9:30', '10:10'],
  ['10:15', '10:45'],
  ['10:50', '11:05'],
  ['11:10', '11:25'],
  ['11:30', '11:45'],
  ['11:50', '12:05'],
  ['12:10', '12:25'],
  ['12:30', '12:45'],
  ['12:50', '13:05'],
  ['13:10', '13:25'],
  ['13:30', '14:00'],
  ['14:05', '14:35'],
  ['14:40', '15:10'],
];

const FINALS = [
  ['8:00', '8:05'],
  ['8:10', '9:10'],
  ['9:15', '10:15'],
  ['10:20', '11:20'],
  ['11:25', '12:25'],
  ['12:25', '16:00'],
];

export default {
  REGULAR,
  WEDNESDAY,
  EARLY_DISMISSAL,
  LATE_START,
  LATE_START_WEDNESDAY,
  ASSEMBLY,
  FINALS,
};
