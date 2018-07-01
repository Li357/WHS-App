import moment from 'moment';

const format = ms => moment.duration(ms).format('h:*mm:ss');

const getDuringModInfo = (currentMod, { title, body }, untilModEnd, untilDayEnd, isHalfMod) => [
  {
    title: `Current ${isHalfMod ? 'half' : ''} mod`,
    value: currentMod,
  },
  {
    title: 'Until mod ends',
    value: format(untilModEnd),
  },
  {
    title: 'Next class',
    value: title,
    subtitle: body,
  },
  {
    title: 'Until day ends',
    value: format(untilDayEnd),
  },
];

/* eslint-disable function-paren-newline */
const getDuringPassingPeriodInfo = (
  { title, body }, untilPassingPeriodEnd, untilDayEnd, isNextHalfMod,
) => [
  /* eslint-enable function-paren-newline */
  {
    title: `Next ${isNextHalfMod ? 'half' : ''} mod`,
    value: title,
    subtitle: body,
  },
  {
    title: 'Until passing period ends',
    value: format(untilPassingPeriodEnd),
  },
  {
    title: 'Until day ends',
    value: format(untilDayEnd),
  },
];

const getBeforeSchoolInfo = untilDayStart => [
  {
    title: 'Until school day starts',
    value: format(untilDayStart),
  },
];

const getAfterSchoolInfo = () => [{ value: 'You\'re done for the day!' }];
const getDuringWeekendInfo = () => [{ value: 'Enjoy your weekend!' }];
const getDuringBreakInfo = isSummer => [
  { value: `Enjoy your ${isSummer ? 'summer' : 'break'}!` },
];

export {
  getBeforeSchoolInfo,
  getAfterSchoolInfo,
  getDuringPassingPeriodInfo,
  getDuringModInfo,
  getDuringWeekendInfo,
  getDuringBreakInfo,
};
