import React from 'react';
import { Text, View } from 'react-native';
import { Bar, CircleSnail } from 'react-native-progress';
import EStyleSheet from 'react-native-extended-stylesheet';

const Loading = ({ rehydrationStatus, codePushStatus, codePushProgress }) => (
  <View style={styles.container}>
    <CircleSnail indeterminate size={50} />
    <Text style={styles.text}>{rehydrationStatus}</Text>
    <Text style={styles.text}>{codePushStatus}</Text>
    {
      codePushStatus !== 'Checking for updates...' &&
        <Bar progress={codePushProgress} style={styles.bar} width={200} />
    }
  </View>
);
export default Loading;

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontFamily: '$fontLight',
    fontSize: 17,
    marginTop: 10,
  },
  bar: { marginTop: 10 },
});
