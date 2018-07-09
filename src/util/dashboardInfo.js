import moment from 'moment';

/**
 * Need Math.abs because sometimes may be negative due to decrementing by 1000 when ms may not
 * necessarily be a multiple of 1000 and may end up negative
 */
const format = ms => moment.duration(Math.abs(ms)).format('h:*mm:ss');

/* eslint-disable function-paren-newline */
const getDuringModInfo = (
  currentMod, { title, body, ...item }, untilModEnd, untilDayEnd, isHalfMod,
) => [
  {
    title: `Current${isHalfMod ? ' half' : ''} mod`,
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
    ...item,
  },
  {
    title: 'Until day ends',
    value: format(untilDayEnd),
  },
];


const getDuringPassingPeriodInfo = (
  nextMod, { title, body, ...item }, untilPassingPeriodEnd, untilDayEnd, isNextHalfMod,
) => [
  /* eslint-enable function-paren-newline */
  {
    title: 'Next class',
    value: title,
    subtitle: body,
    ...item,
  },
  {
    title: 'Until passing period ends',
    value: format(untilPassingPeriodEnd),
  },
  {
    title: `Next${isNextHalfMod ? ' half' : ''} mod`,
    value: nextMod,
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
