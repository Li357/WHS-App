import { Alert } from 'react-native';

const reportError = (message, error) => {
  Alert.alert(
    'Error', message,
    [{ text: 'OK' }],
  );

  // If actual error caught, then notify
  if (error) {
    // TODO: Integrate Bugsnag
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

export { reportError, selectProps };
