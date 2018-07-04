import React from 'react';
import { Text } from 'react-native';
import { ListItem } from 'native-base';
import EStyleSheet from 'react-native-extended-stylesheet';

const DashboardBlock = ({ title, subtitle, value }) => (
  <ListItem noIndent style={styles.item}>
    <Text style={styles.value}>{value}</Text>
    {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    {title && <Text style={styles.title}>{title}</Text>}
  </ListItem>
);
export default DashboardBlock;

const styles = EStyleSheet.create({
  item: {
    flexDirection: 'column',
    paddingTop: 30,
    paddingBottom: 30,
    borderBottomWidth: 0,
  },
  title: {
    fontFamily: '$fontThin',
    fontSize: 20,
    width: '100%',
    textAlign: 'center',
    paddingVertical: 5,
  },
  subtitle: {
    fontFamily: '$fontLight',
    fontSize: 25,
    width: '100%',
    textAlign: 'center',
  },
  value: {
    fontFamily: '$fontRegular',
    fontSize: 42,
    width: '100%',
    textAlign: 'center',
    paddingVertical: 5,
  },
});
