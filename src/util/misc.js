import { Alert } from 'react-native';
import { Client, Configuration } from 'bugsnag-react-native';
import moment from 'moment';
import { mapValues } from 'lodash';

import { store } from './initializeStore';

const containsMoments = ['dayInfo', 'specialDates'];

// Bugsnag client singleton for app-wide use
const config = new Configuration();
const bugsnag = new Client(config);

config.registerBeforeSendCallback((report) => {
  config.codeBundleId = '2.0-b13';
  // Filter out private information to keep reports anonymous
  const {
    username, name, password, id, ...currentState
  } = store.getState();
  const newState = Object.keys(currentState).reduce((stateObj, key) => {
    if (containsMoments.includes(key)) {
      // eslint-disable-next-line no-param-reassign
      stateObj[key] = mapValues(currentState[key], (value) => {
        /* eslint-disable no-underscore-dangle */
        if (value && value._isValid) {
          return value.toDate().toString();
        } else if (Array.isArray(value) && value[0]._isValid) {
          return value.map(date => date.toDate().toString());
        }
        /* eslint-enable no-underscore-dangle */
        return value;
      });
      return stateObj;
    }

    if (typeof currentState[key] !== 'object') {
      // Bugsnag will only record tabs that are object-ified
      /* eslint-disable no-param-reassign */
      stateObj[key] = {
        [key]: currentState[key],
      };
      return stateObj;
    }
    stateObj[key] = currentState[key];
    return stateObj;
  }, {});
  report.metadata = newState;
  /* eslint-enable no-param-reassign */
});

const reportError = (message, error) => {
  Alert.alert(
    'Error', message,
    [{ text: 'OK' }],
  );

  // If actual error caught, then notify
  if (error && error.message !== 'Network request failed') {
    bugsnag.notify(error);
  }
};

// Selects state properties for component to pass to mapStateToProps
const selectProps = (...props) => state => (
  props.reduce((mapObj, currProp) => {
    // eslint-disable-next-line no-param-reassign
    mapObj[currProp] = state[currProp];
    return mapObj;
  }, {})
);

const triggerScheduleCaution = (firstDay) => {
  // Assume schedules are 'final' two days before first formal day of school
  const schedulesFinalDay = firstDay.clone().subtract(1, 'day');
  // Since incoming freshman have the first day reserved, the 'adjusted day' is the first formal day
  const adjustedFirstDay = firstDay.clone().add(1, 'day');
  if (moment().isBefore(schedulesFinalDay)) {
    // Convert moment objects to human readable strings
    const finalDate = schedulesFinalDay.format('MMMM Do');
    const firstDate = adjustedFirstDay.format('MMMM Do');

    /* eslint-disable indent */
    Alert.alert(
      'Caution',
      `Many schedules are still changing and will not be considered final until ${finalDate}. ${''
      }Please be sure to refresh your schedule on ${finalDate} so you attend the correct classes${''
      } starting ${firstDate}.`,
      [{ text: 'OK' }],
    );
    /* eslint-enable indent */
  }
};

export { reportError, selectProps, bugsnag, triggerScheduleCaution };
