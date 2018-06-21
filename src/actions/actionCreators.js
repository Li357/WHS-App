import { AsyncStorage } from 'react-native';
import fetch from 'react-native-fetch-polyfill';
import { load } from 'react-native-cheerio';
import _, { sortBy } from 'lodash';

import {
  SET_LOGIN_ERROR,
  SET_USER_INFO,
  SET_CREDENTIALS,
  SET_PROFILE_PHOTO,
  SET_SPECIAL_DATES,
  LOG_OUT,
} from './actions';

const createActionCreator = (type, ...argNames) => (...args) => ({
  type,
  ...argNames.reduce((argObj, argName, index) => ({
    ...argObj,
    [argName]: args[index],
  }), {}),
});

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
const logOut = createActionCreator(LOG_OUT);

// Function returns false on failed login
const fetchUserInfo = (username, password) => async (dispatch) => {
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

    // Group schedule based on day of week and sort based on start mod
    const grouped = _(schedule)
      .groupBy('day')
      .values()
      .map(dayArray => sortBy(dayArray, 'startMod'))
      .value();

    dispatch(setCredentials(username, password));
    dispatch(setUserInfo(name, nameSubtitle, ...studentInfo, grouped, studentPicture));

    // This prevents the erasure of profile photos on a user info fetch
    const profilePhoto = await AsyncStorage.getItem(`${username}:profilePhoto`);
    dispatch(setProfilePhoto(profilePhoto || studentPicture));
    return true;
  } catch (error) {
    // TODO: Better error reporting
    dispatch(setLoginError(error));
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
  logOut,
  fetchUserInfo,
  fetchSpecialDates,
};
