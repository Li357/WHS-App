import { AsyncStorage } from 'react-native';
import { load } from 'react-native-cheerio';
import fetch from 'react-native-fetch-polyfill';
import moment from 'moment';

import processSchedule from '../util/processSchedule';
import selectSchedule from '../util/selectSchedule';
import { REQUEST_TIMEOUT } from '../constants/constants';
import {
  SET_LOGIN_ERROR,
  SET_USER_INFO,
  SET_CREDENTIALS,
  SET_PROFILE_PHOTO,
  SET_SPECIAL_DATES,
  SET_DAY_INFO,
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
  'name', 'classOf', 'homeroom', 'counselor', 'dean', 'id', 'schedule', 'schoolPicture',
);
const setCredentials = createActionCreator(
  SET_CREDENTIALS,
  'username', 'password',
);
const setProfilePhoto = createActionCreator(SET_PROFILE_PHOTO, 'profilePhoto');
const setSpecialDates = createActionCreator(SET_SPECIAL_DATES, 'specialDates');
const setDayInfo = createActionCreator(SET_DAY_INFO, 'dayStart', 'dayEnd', 'daySchedule', 'lastDayInfoUpdate');
const logOut = createActionCreator(LOG_OUT);

/**
 * Function returns false on failed login
 * NOTE: This cannot be migrated to the express server because Node's HTTPS module is fundamentally
 * different from the client-side XMLHttpRequest
 */
const fetchUserInfo = (username, password) => async (dispatch, getState) => {
  try {
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
      dispatch(setLoginError(true)); // Specifically 401 Unauthorized
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
    const studentInfo = nameSubtitle !== 'Teacher'
      ? infoCard
        .find('.card-subtitle a, .card-text:last-child')
        .contents()
        .map((index, { data }) => data.split(':').slice(-1)[0].trim())
      : [null, null, null];

    /**
     *  Do all heavy lifting before setting credentials in case user interrupts user info fetching,
     *  so they're technically not logged in and refetch can happen as necessary
     */

    const processedSchedule = processSchedule(schedule);

    // This prevents the erasure of profile photos on a user info fetch (for manual refreshes)
    const profilePhoto = await AsyncStorage.getItem(`${username}:profilePhoto`);
    dispatch(setProfilePhoto(profilePhoto || studentPicture));
    // Directly call fetchSpecialDates here for setDaySchedule
    await fetchSpecialDates()(dispatch);

    // Set day info in user info fetch
    const { specialDates } = getState();
    const date = moment();
    const daySchedule = selectSchedule(specialDates, date);
    const range = [
      daySchedule[0][0].split(':'),
      daySchedule.slice(-1)[0][1].split(':'),
    ].map(time => moment(`${time}:00`, 'kk:mm:ss'));

    dispatch(setDayInfo(...range, daySchedule, date));
    dispatch(setUserInfo(name, nameSubtitle, ...studentInfo, processedSchedule, studentPicture));
    dispatch(setCredentials(username, password));

    return true;
  } catch (error) {
    // TODO: Better error reporting
    throw error; // Throw back to show alert UIs
  }
};

// Function returns false on failed fetch of dates
const fetchSpecialDates = () => async (dispatch) => {
  try {
    // Connect to express server which does the heavy lifting
    const specialDatesResponse = await fetch(
      'https://whs-server.herokuapp.com/specialDates',
      { /* timeout: REQUEST_TIMEOUT */ }, // TODO: Adjust timeout
    );
    if (specialDatesResponse.ok) {
      const json = await specialDatesResponse.json();
      dispatch(setSpecialDates(json));
      return true;
    }
    return false;
  } catch (error) {
    // TODO: Better error reporting
    throw error;
  }
};

export {
  setUserInfo,
  setProfilePhoto,
  setDayInfo,
  logOut,
  fetchUserInfo,
  fetchSpecialDates,
};
