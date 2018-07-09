import { Alert } from 'react-native';

import { addErrorToQueue } from '../actions/actionCreators';

const reportError = (msg, { name, message }, shouldReportError, dispatch, state) => {
  if (shouldReportError) {
    // Filter out unnecessary parts of state for reporting
    const {
      username, password, navigation, dispatch: d, ...currentState
    } = state;

    dispatch(addErrorToQueue({
      timestamp: new Date(),
      currentState,
      error: `${name} ${message}`,
    }));
  }
  Alert.alert(
    'Error', `${msg}`,
    [{ text: 'OK' }],
  );
};

export default reportError;
