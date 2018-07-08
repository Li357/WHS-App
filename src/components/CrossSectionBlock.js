import React from 'react';
import { Text } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import { List, ListItem, Left, Right } from 'native-base';

import { decodeUnicode } from '../util/querySchedule';

const CrossSectionBlock = ({ currentCrossSectioned }) => (
  <ListItem noIndent style={styles.itemContainer}>
    <Text style={styles.headerText}>You&apos;re cross sectioned with these classes next mod:</Text>
    <List style={styles.modList}>
      {
        currentCrossSectioned.map(({ title, body }) => (
          <ListItem noIndent style={styles.modItem}>
            <Left><Text style={styles.modText}>{decodeUnicode(title)}</Text></Left>
            <Right><Text style={styles.modText}>{body}</Text></Right>
          </ListItem>
        ))
      }
    </List>
    <Text style={styles.title}>Next class</Text>
  </ListItem>
);
export default CrossSectionBlock;

const styles = EStyleSheet.create({
  itemContainer: {
    flexDirection: 'column',
    borderBottomWidth: 0,
  },
  modList: {
    width: '100%',
    marginVertical: 10,
  },
  headerText: {
    fontFamily: '$fontRegular',
    fontSize: 20,
    textAlign: 'center',
  },
  modItem: {
    paddingRight: 0,
    paddingLeft: 0,
    paddingTop: 15,
    paddingBottom: 15,
  },
  modText: { fontFamily: '$fontLight' },
  title: {
    fontFamily: '$fontThin',
    fontSize: 20,
    width: '100%',
    textAlign: 'center',
    paddingVertical: 5,
  },
});
