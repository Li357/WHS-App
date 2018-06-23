import React from 'react';
import { Text } from 'react-native';
import { List, ListItem } from 'native-base';
import EStyleSheet from 'react-native-extended-stylesheet';

const DashboardInfo = ({ title, value }) => (
  <List style={styles.infoContainer}>
    <ListItem noIndent style={styles.item}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.title}>{title}</Text>
    </ListItem>
  </List>
);
export default DashboardInfo;

const styles = EStyleSheet.create({
  infoContainer: { width: '80%' },
  item: {
    flexDirection: 'column',
    paddingTop: 30,
    paddingBottom: 30,
  },
  title: {
    fontFamily: '$fontThin',
    fontSize: 20,
    width: '100%',
    textAlign: 'center',
  },
  value: {
    fontFamily: '$fontRegular',
    fontSize: 55,
    width: '100%',
    textAlign: 'center',
  },
});
