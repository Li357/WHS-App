import React from 'react';
import { Item, Input, Icon, Button, List } from 'native-base';
import EStyleSheet from 'react-native-extended-stylesheet';

const SearchBar = ({ renderItem, value, onChange, onCancel, data, ...props }) => (
  <>
    <Item style={styles.searchBar}>
      <Icon type="MaterialIcons" name="search" />
      <Input placeholder="Search teachers" onChangeText={onChange} value={value} />
      <Button transparent style={styles.cancelButton} onPress={onCancel}>
        <Icon type="MaterialIcons" name="close" style={styles.cancelIcon} />
      </Button>
    </Item>
    {
      data.length > 0 &&
        <List data={data} style={styles.searchResults}>
          {data.map(renderItem)}
        </List>
    }
  </>
);

export default SearchBar;

const styles = EStyleSheet.create({
  searchResults: {
    width: '100%',
    position: 'absolute',
    height: '85%',
    bottom: 0,
    backgroundColor: 'white',
    zIndex: 1,
  },
  searchBar: {
    position: 'absolute',
    top: '5%',
    right: '7.5%',
    width: '70%',
  },
  cancelButton: { alignSelf: 'center' },
  cancelIcon: { marginRight: 0 },
});