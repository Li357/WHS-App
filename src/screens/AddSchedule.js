import React, { PureComponent } from 'react';
import { View, InteractionManager } from 'react-native';
import { connect } from 'react-redux';
import { CircleSnail } from 'react-native-progress';
import QRCode from 'react-native-qrcode';
import EStyleSheet from 'react-native-extended-stylesheet';
import { Button, Text, Icon, ListItem, Left, Body, Thumbnail, Right } from 'native-base';
import { debounce } from 'lodash';
import { load } from 'react-native-cheerio';

import { selectProps, reportError } from '../util/misc';
import { generateBase64Link, decodeScheduleQRCode } from '../util/qr';
import processSchedule from '../util/processSchedule';
import { setQR, setOtherSchedules } from '../actions/actionCreators';
import withHamburger from '../util/withHamburger';
import QRCamera from '../components/QRCamera';
import SearchBar from '../components/SearchBar';
import { SCHOOL_WEBSITE, WIDTH } from '../constants/constants';

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
          console.log(error);
          reportError(
            'Something went wrong while generating your QR code. Please check your internet connection.',
            error,
          );
        }
      });
    }
  }

  addSchedule = ({ url, name, schedule }) => {
    const processed = processSchedule(schedule);
    const { otherSchedules, dispatch } = this.props;

    dispatch(setOtherSchedules([
      ...otherSchedules,
      { name, url, schedule: processed },
    ]));
  }

  startScanning = () => {
    this.setState({ scanning: true });
  }

  stopScanning = () => {
    this.setState({ scanning: false });
  }

  onRead = async ({ data }) => {
    this.stopScanning();
    const scheduleAndName = await decodeScheduleQRCode(data);
    this.addSchedule(scheduleAndName);
  }

  // response is HTML content type that has title "Login | Westside" when not logged in
  // Checks if a certain response (such as searching or teacher schedule getting) was successful
  loginIfNot = async (notLoggedIn, ifNotCallback = () => {}) => {
    if (notLoggedIn) {
      const { username, password } = this.props;
      await fetch(
        `${SCHOOL_WEBSITE}/account/login?Username=${username}&Password=${password}`,
        { method: 'POST', credentials: 'include' },
      );
      await ifNotCallback();
    }
  }

  /* handlers for teacher searching */
  search = debounce(async (query) => {
    if (query.length === 0) {
      this.cancelSearch();
      return;
    }

    // Recursive call to retry fetch if not logged in the first time
    const response = await fetch(
      `${SCHOOL_WEBSITE}/api/search?query=${query}&limit=5`,
      { credentials: 'include' },
    );
    await this.loginIfNot(
      response.headers.get('content-type').includes('html'), 
      () => this.search(query)
    );

    const { teachers } = await response.json();
    const alreadySelectedTeacherKeys = this.props.otherSchedules.map(o => o.key); // keys are teacher ids
    this.setState({
      teachers: teachers.filter(({ id }) => !alreadySelectedTeacherKeys[id])
    });
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

  addTeacherSchedule = async (id, name) => {
    const url = `${SCHOOL_WEBSITE}/teachers/${id}`;
    const response = await fetch(url, { credentials: 'include' });
    const teacherHTML = await response.text();
    const $ = load(teacherHTML);

    await this.loginIfNot(
      $('title').text().includes('Login'),
      () => this.addTeacherSchedule(id),
    );

    // TODO: Fix repetition
    const jsonPrefix = 'window._pageDataJson = \'';
    const scheduleString = $('.page-content + script').contents()[0].data.trim();
    const { schedule } = JSON.parse(scheduleString.slice(jsonPrefix.length, -2));
    this.addSchedule({ name, schedule, url });
    this.cancelSearch();
  }

  renderTeacher = ({ firstName, lastName, profilePictureUri, id }) => {
    const source = profilePictureUri ? { uri: profilePictureUri } : BlankUser;
    const name = `${firstName} ${lastName}`;

    return (
      <ListItem key={id} avatar onPress={() => this.addTeacherSchedule(id, name)} style={styles.resultRow}>
        <Left style={styles.avatarContainer}><Thumbnail source={source} /></Left>
        <Body style={styles.teacherContainer}>
          <Text style={styles.teacherInfo}>{name}</Text>
        </Body>
        <Right style={styles.addContainer}><Icon type="MaterialIcons" name="add" /></Right>
      </ListItem>
    );
  };

  render() {
    const { qr } = this.props;
    const { query, teachers } = this.state;

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
                    <Text style={[styles.text, { marginVertical: 0 }]}>
                      Student schedules will not automatically refresh.
                    </Text>
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
  avatarContainer: { paddingTop: 0 },
  addContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultRow: { paddingVertical: 10 },
});