import { Alert } from 'react-native';
import { Client, Configuration } from 'bugsnag-react-native';

import { store } from './initializeStore';

// Bugsnag client singleton for app-wide use
const config = new Configuration();
const bugsnag = new Client(config);

config.codeBundleId = '2.0-b3';
config.registerBeforeSendCallback((report) => {
  // Filter out private information to keep reports anonymous
  const {
    username, name, password, id, ...currentState
  } = store.getState();
  const newState = Object.keys(currentState).reduce((stateObj, key) => {
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
  if (error) {
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

export { reportError, selectProps, bugsnag };
