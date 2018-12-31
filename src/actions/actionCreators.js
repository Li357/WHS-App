import { AsyncStorage } from 'react-native';
import { load } from 'react-native-cheerio';
import fetch from 'react-native-fetch-polyfill';
import { mapValues } from 'lodash';
import moment from 'moment';

import processSchedule from '../util/processSchedule';
import { getDayInfo } from '../util/querySchedule';
import { API, REQUEST_TIMEOUT, SCHOOL_WEBSITE } from '../constants/constants';
import {
  SET_LOGIN_ERROR,
  SET_USER_INFO,
  SET_CREDENTIALS,
  SET_PROFILE_PHOTO,
  SET_SCHOOL_PICTURE,
  SET_SPECIAL_DATES,
  SET_DAY_INFO,
  SET_SCHEDULE,
  SET_REFRESHED,
  SET_OTHER_SCHEDULES,
  SET_QR,
  LOG_OUT,
} from './actions';
import { generateBase64Link } from '../util/qr';
import { triggerScheduleCaution } from '../util/misc';

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
  'name', 'classOf', 'schedule', 'schoolPicture', 'isTeacher', 'homeroom', 'counselor', 'dean', 'id', 'qr',
);
const setCredentials = createActionCreator(
  SET_CREDENTIALS,
  'username', 'password',
);
const setProfilePhoto = createActionCreator(SET_PROFILE_PHOTO, 'profilePhoto');
const setSchoolPicture = createActionCreator(SET_SCHOOL_PICTURE, 'schoolPicture');
const setSpecialDates = createActionCreator(SET_SPECIAL_DATES, 'specialDates');
const setDayInfo = createActionCreator(
  SET_DAY_INFO,
  'dayStart', 'dayEnd', 'daySchedule', 'lastDayInfoUpdate',
  'dayIsSummer', 'dayIsBreak', 'dayHasAssembly', 'dayIsFinals',
);
const setSchedule = createActionCreator(SET_SCHEDULE, 'schedule');
const setRefreshed = createActionCreator(SET_REFRESHED, 'refreshedSemesterOne', 'refreshedSemesterTwo');
const setOtherSchedules = createActionCreator(SET_OTHER_SCHEDULES, 'otherSchedules');
const setQR = createActionCreator(SET_QR, 'qr');
const logOut = createActionCreator(LOG_OUT);

/* eslint-disable function-paren-newline */
const fetchUserInfo = (
  username, password, beforeStartRefresh = false, onlyFetchSchoolPicture = false,
) => (
/* eslint-enable function-paren-newline */
  async (dispatch, getState) => {
    const loginURL = `${SCHOOL_WEBSITE}/account/login?Username=${username}&Password=${password}`;

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

    if (!userpageResponse.ok) {
      return false;
    }

    const $ = load(userpageHTML);
    const error = $('.alert.alert-danger').text().trim();
    const name = $('title').text().split('|')[0].replace(/overview/ig, '').trim();

    if (error !== '') { // If error exists
      dispatch(setLoginError(true));
      return false;
    }

    const jsonPrefix = 'window._pageDataJson = \'';
    const profilePhotoPrefix = 'background-image: url(';

    const pictureURL = $('.profile-picture').attr('style').slice(profilePhotoPrefix.length, -2);
    const schoolPicture = pictureURL.includes('blank-user') // Blank user images have urls of /dist/img/blank-user.png
      ? 'blank-user'
      : pictureURL;

    if (onlyFetchSchoolPicture) {
      dispatch(setSchoolPicture(schoolPicture));
      return true;
    }

    // This is either 'Class of 20XX' or 'Teacher'
    const nameSubtitle = $('.header-title > h6').text();
    const infoCard = $('.card-header + .card-block');
    const scheduleString = $('.page-content + script').contents()[0].data.trim();
    const { schedule } = JSON.parse(scheduleString.slice(jsonPrefix.length, -2));
    const isNewUser = schedule.length === 0;
    // Maps elements in infoCard to text, splitting and splicing handles 'School Number: '
    const isTeacher = nameSubtitle === 'Teacher';
    /* eslint-disable indent */
    const info = !isTeacher
      ? infoCard
          .find('.card-subtitle a, .card-text:last-child')
          .contents()
          .map((index, { data }) => data.split(':').slice(-1)[0].trim())
          .toArray()
      : Array(4).fill(null);
    /* eslint-enable indent */
    const processedInfo = isNewUser && !isTeacher
      ? [null, ...info] // New users will only not be able to see their homeroom yet, so first is null
      : info;

    /**
     *  Do all heavy lifting before setting credentials in case user interrupts user info fetching
     *  so they're technically not logged in and refetch can happen as necessary
     */

    const processedSchedule = processSchedule(schedule);

    // This prevents the erasure of profile photos on a user info fetch (for manual refreshes)
    const profilePhoto = await AsyncStorage.getItem(`${username}:profilePhoto`);
    dispatch(setProfilePhoto(profilePhoto || schoolPicture));
    // Directly call fetchSpecialDates here for setDaySchedule
    const success = await dispatch(fetchSpecialDates());
    if (!success) return false;

    const {
      specialDates,
      specialDates: { semesterOneStart, semesterTwoStart, lastDay },
    } = getState();
    const date = moment();

    if (date.isBefore(semesterOneStart)) {
      triggerScheduleCaution(semesterOneStart);
    }

    // Set day info in user info fetch
    dispatch(setDayInfo(...getDayInfo(specialDates, date)));

    // Generate QR Code
    const qr = await generateBase64Link(processedSchedule, name);

    /* eslint-disable function-paren-newline */
    dispatch(setUserInfo(
      name, nameSubtitle, processedSchedule, schoolPicture, isTeacher,
      ...processedInfo, // Teachers have all-null info array
      qr,
    ));
    /* eslint-enable function-paren-newline */

    if (date.isSameOrAfter(semesterTwoStart, 'day') && date.isSameOrBefore(lastDay, 'day')) {
      dispatch(setRefreshed(true, true));
    } else if (
      (date.isSameOrAfter(semesterOneStart, 'day') && date.isSameOrBefore(semesterTwoStart, 'day'))
      || beforeStartRefresh
    ) {
      dispatch(setRefreshed(true, false));
    } else {
      dispatch(setRefreshed(false, false));
    }
    dispatch(setCredentials(username, password));

    return true;
  }
);

const mapValuesToMoment = json => (
  mapValues(json, valueOrValues => (
    Array.isArray(valueOrValues)
      ? valueOrValues.map(value => moment(value))
      : moment(valueOrValues)
  ))
);
// Function returns false on failed fetch of dates
const fetchSpecialDates = () => async (dispatch) => {
  const now = moment();
  const month = now.month();
  const currentYear = now.year();
  const startYear = month < 5 ? currentYear - 1 : currentYear;

  // Connect to express server which gets school dates
  const specialDatesResponse = await fetch(
    `${API}/specialDates?year=${startYear}&onlyDates=true`,
    { timeout: REQUEST_TIMEOUT },
  );
  if (specialDatesResponse.ok) {
    const json = await specialDatesResponse.json();
    dispatch(setSpecialDates(mapValuesToMoment(json)));
    return true;
  }
  return false;
};

export {
  setUserInfo, setQR, setProfilePhoto, setSchedule,
  setDayInfo, setRefreshed, setOtherSchedules,
  fetchUserInfo, fetchSpecialDates,
  logOut,
};
