import { AsyncStorage } from 'react-native';
import fetch from 'react-native-fetch-polyfill';
import { load } from 'react-native-cheerio';

import processSchedule from '../util/processSchedule';
import { SCHEDULES } from '../constants/constants';

import {
  SET_LOGIN_ERROR,
  SET_USER_INFO,
  SET_CREDENTIALS,
  SET_PROFILE_PHOTO,
  SET_SPECIAL_DATES,
  SET_DAY_SCHEDULE,
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
const setDaySchedule = createActionCreator(SET_DAY_SCHEDULE, 'daySchedule');
const logOut = createActionCreator(LOG_OUT);

// Function returns false on failed login
const fetchUserInfo = (username, password) => async (dispatch, getState) => {
  try {
    const loginURL = `https://westside-web.azurewebsites.net/account/login?Username=${username}&Password=${password}`;
    const timeout = 6000;

    // First request clears the user from previous signin
    await fetch(loginURL, {
      method: 'POST',
      timeout,
    });

    const user = await fetch(loginURL, {
      method: 'POST',
      timeout,
    });
    const userpageHTML = await user.text();
    const $ = load(userpageHTML);
    const error = $('.alert.alert-danger').text().trim();
    const name = $('title').text().split('|')[0].trim();

    if (error !== '') { // If error exists
      dispatch(setLoginError(!!error)); // Convert error to boolean
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

    // This prevents the erasure of profile photos on a user info fetch
    const profilePhoto = await AsyncStorage.getItem(`${username}:profilePhoto`);
    dispatch(setProfilePhoto(profilePhoto || studentPicture));
    // TODO: Call fetchSpecialDates here too
    // And also calculate the day schedule
    dispatch(setDaySchedule(SCHEDULES.REGULAR))
    dispatch(setUserInfo(name, nameSubtitle, ...studentInfo, processedSchedule, studentPicture));
    dispatch(setCredentials(username, password));

    return true;
  } catch (error) {
    // TODO: Better error reporting
    throw error; // Throw back to show alert UIs
  }
};

const fetchSpecialDates = () => {
  // TODO: Finish up calendar scraping
  // May decide to parse PDFs instead of
  // relying solely on school calendars
  // for more stable sources
};

export {
  setUserInfo,
  setProfilePhoto,
  setDaySchedule,
  logOut,
  fetchUserInfo,
  fetchSpecialDates,
};
