const SCHEDULE = (() => {
  const regular = [
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
    ['14:35', '15:10']
  ];

  const wednesday = regular.slice(1).map(timePair =>
    timePair.map(time => {
      const [hours, minutes] = time.split(':');
      const lessThan20 = minutes < 20;
      const subtracted = `${+minutes + (lessThan20 && 60) - 20}`;
      return `${hours - lessThan20}:${subtracted.length < 2 ? '0' : ''}${subtracted}`;
    })
  );

  const oneOClock = [
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
    ['11:45',	'12:10'],
    ['12:15', '12:40'],
    ['12:45',	'13:10']
  ];

  const lateStart = [
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
    ['14:45', '15:10']
  ];

  const lateStartWednesday = [
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
    ['14:30', '14:50']
  ];

  const assembly = [
    ['8:00', '8:15'],
    ['8:20', '8:50'],
    ['8:55', '9:25'],
    ['9:30', '10:10', 'ASSEMBLY'],
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
    ['14:40', '15:10']
  ];

  const finals = [
    ['8:00', '8:05'],
    ['8:10', '9:10'],
    ['9:15', '10:15'],
    ['10:20', '11:20'],
    ['11:25', '12:25'],
    ['12:25', '4:00']
  ];

  return {
    regular,
    wednesday,
    oneOClock,
    lateStart,
    lateStartWednesday,
    assembly,
    finals
  };
})();

const selectSchedule = (dates, now, isTeacher) => {;
  const today = now.getDay();

  const isDate = dateKey => !!dates.find(({
    [dateKey]: key,
    day,
    month,
    year
  }) =>
    key && +new Date(year, month - 1, day) === now.setHours(0, 0, 0, 0)
  );

  const isFirst = isDate('first');
  const isLate = isDate('late');
  const isSecond = isDate('second');
  const isLast = isDate('last');
  const hasAssembly = isDate('assembly');
  const isFinals = isDate('finals');
  const isEarly = isDate('early');

  const schedule = isLast || isEarly ?
    'oneOClock'
  :
    !hasAssembly ?
      today === 3 ?
        isLate ?
          'lateStartWednesday'
        :
          'wednesday'
      :
        isLate ?
          'lateStart'
        :
          isFinals ?
            'finals'
          :
            'regular'
    :
      'assembly';

  return {
    hasAssembly,
    isFinals,
    schedule: schedule === 'finals' && !isTeacher ? SCHEDULE[schedule].slice(0, -1) : SCHEDULE[schedule],
    string: schedule,
    isBreak: !(isFirst || isSecond || isFinals || hasAssembly || isLast || isLate),
    isFinals
  };
}

export default selectSchedule;
