import { Alert } from 'react-native';

const reportError = (message, error, shouldReportError) => {
  console.log(error);
  if (shouldReportError) {
    // TODO: Post error to database
  }
  Alert.alert(
    'Error', `${message}`,
    [{ text: 'OK' }],
  );
};

export default reportError;
