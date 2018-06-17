import { Alert, AsyncStorage } from 'react-native';
import fetch from 'react-native-fetch-polyfill';
import { load } from 'react-native-cheerio';

import {
  SET_LOGIN_ERROR,
  SET_USER_INFO,
  SET_CREDENTIALS,
  SET_PROFILE_PHOTO,
  SET_SPECIAL_DATES,
  LOG_OUT,
} from './actions.js';

const createActionCreator = (type, ...argNames) => (...args) => ({
  type,
  ...argNames.reduce((argObj, argName, index) => ({
    ...argObj,
    argName: args[index],
  }), {}),
});

const setLoginError = createActionCreator(SET_LOGIN_ERROR, 'error');
const setUserInfo = createActionCreator(
  SET_USER_INFO,
  'name', 'classOf', 'homeroom', 'counselor', 'dean', 'id', 'schedule', 'schoolPicture'
);
const setCredentials = createActionCreator(
  SET_CREDENTIALS,
  'username', 'password'
);
const setProfilePhoto = createActionCreator(SET_PROFILE_PHOTO, 'profilePhoto');
const setSpecialDates = createActionCreator(SET_SPECIAL_DATES, 'specialDates');
const logOut = createActionCreator(LOG_OUT);

const fetchUserInfo = (username, password) => async dispatch => {
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
      dispatch(setLoginError(error));
      return;
    } else if (name === 'Login') { // If login failed (page has Login as <title>)
      // TODO: Logout then alert error
      return;
    }
    dispatch(setCredentials(username, password));

    const jsonPrefix = 'window._pageDataJson = \'';
    const profilePhotoPrefix = 'background-image: url(';

    const nameSubtitle = $('.header-title > h6').text();
    const infoCard = $('.card-header + .card-block');
    const scheduleString = $('.page-content + script').contents()[0];
    const { schedule } = JSON.parse(scheduleString.slice(jsonPrefix.length, -2));
    const studentPicture = $('.profile-picture').attr('style').slice(profilePhotoPrefix.length, -2);
    // This is either 'Class of 20XX' or 'Teacher'

    const studentInfo = nameSubtitle !== 'Teacher'
      ? infoCard
        .find('.card-subtitle:not(.text-muted), .card-text:last-child')
        .contents()
      : [null, null, null];

    dispatch(setUserInfo(name, nameSubtitle, ...studentInfo, schedule, studentPicture));

    // This prevents the erasure of profile photos on a user info fetch
    const profilePhoto = await AsyncStorage.getItem('profilePhoto');
    dispatch(setProfilePhoto(profilePhoto || studentPicture));
  } catch (error) {
    // TODO: Better error reporting
    Alert.alert(
      'Error', 'An error occurred, please check your internet connection.',
      [{ text: 'OK' }]
    );
    dispatch(setLoginError(error));
  }
};

const fetchSpecialDates = () => {
  // TODO: Finish up calendar scraping
};

export {
  setUserInfo,
  setProfilePhoto,
  logOut,
  fetchUserInfo,
  fetchSpecialDates,
};
