import moment from 'moment';

const format = ms => moment.duration(ms).format('h:*mm:ss');

const getDuringModInfo = (currentMod, { title, body }, untilModEnd, untilDayEnd) => [
  {
    title: 'Current mod',
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

const getDuringPassingPeriodInfo = ({ title, body }, untilPassingPeriodEnd, untilDayEnd) => [
  {
    title: 'Next mod',
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

export { getBeforeSchoolInfo, getAfterSchoolInfo, getDuringPassingPeriodInfo, getDuringModInfo };
