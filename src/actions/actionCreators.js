import { AsyncStorage } from 'react-native';
import { load } from 'react-native-cheerio';
import fetch from 'react-native-fetch-polyfill';
import { mapValues } from 'lodash';
import moment from 'moment';

import processSchedule from '../util/processSchedule';
import { getDayInfo } from '../util/querySchedule';
import { REQUEST_TIMEOUT } from '../constants/constants';
import {
  SET_LOGIN_ERROR,
  SET_USER_INFO,
  SET_CREDENTIALS,
  SET_PROFILE_PHOTO,
  SET_SPECIAL_DATES,
  SET_DAY_INFO,
  SET_SETTINGS,
  SET_REFRESHED,
  LOG_OUT,
} from './actions';

const createActionCreator = (type, ...argNames) => (...args) => ({
  type,
  ...argNames.reduce((argObj, argName, index) => ({
    ...argObj,
    [argName]: args[index],
  }), {}),
});

// Login error represents a credential mismatch, not an internal error
const setLoginError = createActionCreator(SET_LOGIN_ERROR, 'loginError');
const setUserInfo = createActionCreator(
  SET_USER_INFO,
  'name', 'classOf', 'homeroom', 'counselor', 'dean', 'id', 'schedule', 'schoolPicture', 'isTeacher',
);
const setCredentials = createActionCreator(
  SET_CREDENTIALS,
  'username', 'password',
);
const setProfilePhoto = createActionCreator(SET_PROFILE_PHOTO, 'profilePhoto');
const setSpecialDates = createActionCreator(SET_SPECIAL_DATES, 'specialDates');
const setDayInfo = createActionCreator(
  SET_DAY_INFO,
  'dayStart', 'dayEnd', 'daySchedule', 'lastDayInfoUpdate',
  'dayIsSummer', 'dayIsBreak', 'dayHasAssembly', 'dayIsLast',
);
const setSettings = createActionCreator(SET_SETTINGS, 'settings');
const setRefreshed = createActionCreator(SET_REFRESHED, 'refreshedSemesterOne', 'refreshedSemesterTwo');
const logOut = createActionCreator(LOG_OUT);

/**
 * Function returns false on failed login
 * NOTE: This cannot be migrated to the express server because Node's HTTPS module is fundamentally
 * different from the client-side XMLHttpRequest
 */
const fetchUserInfo = (username, password, beforeStartRefresh = false) => (
  async (dispatch, getState) => {
    const loginURL = `https://westside-web.azurewebsites.net/account/login?Username=${username}&Password=${password}`;

    // First request clears the user from previous signin
    await fetch(loginURL, {
      method: 'POST',
      timeout: REQUEST_TIMEOUT,
    });

    const userpageResponse = await fetch(loginURL, {
      method: 'POST',
      timeout: REQUEST_TIMEOUT,
    });
    const userpageHTML = await userpageResponse.text();

    const $ = load(userpageHTML);
    const error = $('.alert.alert-danger').text().trim();
    const name = $('title').text().split('|')[0].trim();

    if (error !== '') { // If error exists
      dispatch(setLoginError(true));
      return false;
    }

    const jsonPrefix = 'window._pageDataJson = \'';
    const profilePhotoPrefix = 'background-image: url(';

    // This is either 'Class of 20XX' or 'Teacher'
    const nameSubtitle = $('.header-title > h6').text();
    const infoCard = $('.card-header + .card-block');
    const scheduleString = $('.page-content + script').contents()[0].data.trim();
    const { schedule } = JSON.parse(scheduleString.slice(jsonPrefix.length, -2));
    const studentPicture = $('.profile-picture').attr('style').slice(profilePhotoPrefix.length, -2);

    // Maps elements in infoCard to text, splitting and splicing handles 'School Number: '
    const isTeacher = nameSubtitle === 'Teacher';
    const studentInfo = !isTeacher
      ? infoCard
        .find('.card-subtitle a, .card-text:last-child')
        .contents()
        .map((index, { data }) => data.split(':').slice(-1)[0].trim())
      : [null, null, null];

    /**
     *  Do all heavy lifting before setting credentials in case user interrupts user info fetching
     *  so they're technically not logged in and refetch can happen as necessary
     */

    const processedSchedule = processSchedule(schedule);

    // This prevents the erasure of profile photos on a user info fetch (for manual refreshes)
    const profilePhoto = await AsyncStorage.getItem(`${username}:profilePhoto`);
    dispatch(setProfilePhoto(profilePhoto || studentPicture));
    // Directly call fetchSpecialDates here for setDaySchedule
    await fetchSpecialDates()(dispatch);

    const {
      specialDates,
      specialDates: { semesterOneStart, semesterTwoStart, lastDay },
    } = getState();
    const date = moment();

    // Set day info in user info fetch
    dispatch(setDayInfo(...getDayInfo(specialDates, date, isTeacher)));
    /* eslint-disable function-paren-newline */
    dispatch(setUserInfo(
      name, nameSubtitle, ...studentInfo, processedSchedule, studentPicture, isTeacher,
    ));
    /* eslint-enable function-paren-newline */

    if (date.isAfter(semesterTwoStart) && date.isBefore(lastDay)) {
      dispatch(setRefreshed(true, true));
    } else if (
      (date.isAfter(semesterOneStart) && date.isBefore(semesterTwoStart))
      || beforeStartRefresh
    ) {
      dispatch(setRefreshed(true, false));
    }
    dispatch(setCredentials(username, password));

    return true;
  }
);

// Function returns false on failed fetch of dates
const fetchSpecialDates = () => async (dispatch) => {
  // Connect to express server which gets school calendar PDF
  const specialDatesResponse = await fetch(
    'https://whs-server.herokuapp.com/specialDates',
    { timeout: REQUEST_TIMEOUT },
  );
  if (specialDatesResponse.ok) {
    const json = await specialDatesResponse.json();
    const toMoment = date => moment(date, 'MMMM D YYYY');
    dispatch(setSpecialDates(mapValues(json, value => (
      Array.isArray(value) ? value.map(toMoment) : toMoment(value)
    ))));
    return true;
  }
  return false;
};

export {
  setUserInfo,
  setProfilePhoto,
  setDayInfo,
  setSettings,
  setRefreshed,
  logOut,
  fetchUserInfo,
  fetchSpecialDates,
};
