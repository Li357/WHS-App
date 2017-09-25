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

  return {
    regular,
    wednesday
  }
})();

export default SCHEDULE;
