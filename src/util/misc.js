import { Alert } from 'react-native';
import { Client, Configuration } from 'bugsnag-react-native';
import { mapValues } from 'lodash';

import { store } from './initializeStore';

// Bugsnag client singleton for app-wide use
const bugsnag = (() => {
  const containsMoments = ['dayInfo', 'specialDates'];
  const config = new Configuration();

  config.releaseStage = process.env.NODE_ENV;
  config.notifyReleaseStages = ['production'];
  config.registerBeforeSendCallback((report) => {
    config.codeBundleId = '2.0-b12';
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
          }

          if (Array.isArray(value) && value[0] && value[0]._isValid) {
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

  return new Client(config);
})();

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

export {
  reportError, selectProps, bugsnag,
};
