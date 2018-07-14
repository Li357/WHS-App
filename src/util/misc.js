import { Alert } from 'react-native';
import { Client } from 'bugsnag-react-native';

import { store } from './initializeStore';

// Bugsnag client singleton for app-wide use
const bugsnag = new Client();

const reportError = (message, error) => {
  Alert.alert(
    'Error', message,
    [{ text: 'OK' }],
  );

  // If actual error caught, then notify
  if (error) {
    bugsnag.notify(error, (report) => {
      // Filter out private information to keep reports anonymous
      const {
        username, password, id, ...currentState
      } = store.getState();
      // eslint-disable-next-line no-param-reassign
      report.metadata = currentState;
    });
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
