import { Button, Icon } from 'native-base';

const Hamburger = ({ navigate }) => (
  <Button transparent onPress={navigate('Drawer')}>
    <Icon name="md-menu" />
  </Button>
);
