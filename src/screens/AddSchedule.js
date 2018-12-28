import React, { PureComponent } from 'react';
import { View, Dimensions, InteractionManager } from 'react-native';
import { connect } from 'react-redux';
import { CircleSnail } from 'react-native-progress';
import QRCode from 'react-native-qrcode';
import EStyleSheet from 'react-native-extended-stylesheet';
import { Button, Text, Icon, ListItem, Left, Body, Thumbnail, Right } from 'native-base';
import { debounce } from 'lodash';

import { selectProps, reportError } from '../util/misc';
import { generateBase64Link, decodeScheduleQRCode } from '../util/qr';
import { setQR } from '../actions/actionCreators';
import withHamburger from '../util/withHamburger';
import QRCamera from '../components/QRCamera';
import SearchBar from '../components/SearchBar';
import { SCHOOL_WEBSITE } from '../constants/constants';

import BlankUser from '../../assets/images/blank-user.png';

const mapStateToProps = selectProps('qr', 'schedule', 'name', 'username', 'password', 'otherSchedules');

// TODO: React Hooks
@withHamburger
@connect(mapStateToProps)
export default class AddSchedule extends PureComponent {
  state = {
    scanning: false,
    teachers: [],
    query: '',
  }

  componentDidMount() {
    const { qr, dispatch, schedule } = this.props;

    if (!qr) {
      InteractionManager.runAfterInteractions(async () => {
        try {
          const shortLink = await generateBase64Link(schedule, name);
          dispatch(setQR(shortLink));
        } catch(error) {
          reportError(
            'Something went wrong while generating your QR code. Please check your internet connection.',
            error,
          );
        }
      });
    }
  }

  addSchedule = () => {
    // TODO: Add schedules to Redux store
  }

  startScanning = () => {
    this.setState({ scanning: true });
  }

  stopScanning = () => {
    this.setState({ scanning: false });
  }

  onRead = async ({ data }) => {
    this.stopScanning();
    const { name, schedule } = await decodeScheduleQRCode(data);
  }

  /* handlers for teacher searching */
  search = debounce(async (query) => {
    if (query.length === 0) {
      this.cancelSearch();
      return;
    }

    const response = await fetch(
      `${SCHOOL_WEBSITE}/api/search?query=${query}&limit=5`,
      { credentials: 'include' },
    );

    if (response.headers.get('content-type').includes('html')) { // Not logged in
      const { username, password } = this.props;
      await fetch(
        `${SCHOOL_WEBSITE}/login?Username=${username}&Password=${password}`,
        { method: 'POST', credentials: 'include' },
      );
      await this.search(query);
    }
    const { teachers } = await response.json();
    this.setState(prevState => ({ 
      teachers: prevState.query.length > 0 ? teachers : [],
    }));
  }, 500)
  
  onChange = (query) => {
    this.setState({ query });
    this.search(query);
  }

  cancelSearch = () => {
    this.setState({
      teachers: [],
      query: '',
    });
  }

  renderTeacher = ({ firstName, lastName, profilePictureUri, id }) => {
    const source = profilePictureUri ? { uri: profilePictureUri } : BlankUser;

    return (
      <ListItem avatar key={id}>
        <Left><Thumbnail source={source} /></Left>
        <Body style={styles.teacherContainer}>
          <Text style={styles.teacherInfo}>{firstName} {lastName}</Text>
        </Body>
        <Right><Icon type="MaterialIcons" name="add" /></Right>
      </ListItem>
    );
  };

  render() {
    const { qr } = this.props;
    const { query, teachers } = this.state;
    const { width: WIDTH } = Dimensions.get('window');

    return (
      this.state.scanning
        ? <QRCamera onRead={this.onRead} onCancel={this.stopScanning} />
        : <View style={styles.container}>
            <SearchBar
              value={query}
              onCancel={this.cancelSearch}
              onChange={this.onChange}
              data={teachers}
              renderItem={this.renderTeacher}
            />
            {
              qr
                ? <>
                    <Text style={styles.text}>
                      Let other students scan this code to share your schedule.
                    </Text>
                    <QRCode value={qr} size={WIDTH * 0.7} />
                    <Button primary onPress={this.startScanning} style={styles.scanButton}>
                      <Text style={styles.scanText}>Scan code</Text>
                    </Button>
                  </>
                : <>
                    <CircleSnail indeterminate size={50} />
                    <Text style={styles.text}>Generating QR code...</Text>
                  </>
            }
          </View>
    );
  }
}

AddSchedule.navigationOptions = {
  drawerIcon: ({ tintColor }) => (
    <Icon type="MaterialIcons" name="add" style={[styles.icon, { color: tintColor }]} />
  ),
};

const styles = EStyleSheet.create({
  icon: { fontSize: 20 },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  scanButton: {
    alignSelf: 'center',
    marginVertical: 30,
    width: '70%',
  },
  scanText: {
    fontFamily: '$fontRegular',
    textAlign: 'center',
    fontSize: 18,
    width: '100%',
  },
  text: {
    fontFamily: '$fontRegular',
    fontSize: 18,
    marginVertical: 30,
    width: '70%',
    textAlign: 'center',
  },
  teacherContainer: {
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  teacherInfo: {
    fontFamily: '$fontRegular',
    fontSize: 18,
  },
});