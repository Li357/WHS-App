import { AsyncStorage } from 'react-native';
import fetch from 'react-native-fetch-polyfill';
import { mapValues } from 'lodash';
import moment from 'moment';

import processSchedule from '../util/processSchedule';
import { getDayInfo } from '../util/querySchedule';
import {
  parseHTMLFromURL,
  fetchUserHTML,
  getUserInfoFromHTML,
  getScheduleFromHTML,
  getSchoolPictureFromHTML,
  fetchOtherTeacherSchedules,
} from '../util/fetchSchedule';
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

const fetchSchoolPicture = (...credentials) => (
  async (dispatch) => {
    const $ = await fetchUserHTML(...credentials);
    if ($ === null) {
      return false;
    }

    const schoolPicture = await fetchSchoolPicture($);
    dispatch(setSchoolPicture(schoolPicture));
    return true;
  }
);

const fetchUserInfo = (username, password) => (
  async (dispatch, getState) => {
    const loginURL = `${SCHOOL_WEBSITE}/account/login?Username=${username}&Password=${password}`;

    const { username: oldUsername } = getState();
    if (username !== oldUsername) {
      // Extra fetch needed to clear current user for some reason
      await fetch(loginURL, {
        method: 'POST',
        timeout: REQUEST_TIMEOUT,
      });
    }

    const $ = await parseHTMLFromURL(loginURL, { method: 'POST' });
    if ($ === null) { // If the response was not okay, abort
      return false;
    }

    const error = $('.alert.alert-danger').text().trim();
    if (error !== '') { // If error exists on login, either user/pass was wrong
      dispatch(setLoginError(true));
      return false;
    }

    /**
     *  Do all heavy lifting before setting credentials in case user interrupts user info fetching
     *  so they're technically not logged in and refetch can happen as necessary
     */

    const schedule = getScheduleFromHTML($);
    const [name, nameSubtitle, isTeacher, processedInfo] = getUserInfoFromHTML($, schedule);
    const schoolPicture = getSchoolPictureFromHTML($);
    const processedSchedule = processSchedule(schedule);

    // This prevents the erasure of profile photos on a user info fetch (for manual refreshes)
    const profilePhoto = await AsyncStorage.getItem(`${username}:profilePhoto`);
    dispatch(setProfilePhoto(profilePhoto || schoolPicture));

    // Directly call fetchSpecialDates here for setDaySchedule
    const success = await dispatch(fetchSpecialDates());
    if (!success) {
      return false;
    }

    // Set today's information
    const { specialDates, otherSchedules } = getState();
    const now = moment();
    dispatch(setDayInfo(...getDayInfo(specialDates, now)));

    // Fetch other schedules
    const newOtherSchedules = await fetchOtherTeacherSchedules(otherSchedules);
    dispatch(setOtherSchedules(newOtherSchedules));

    // Generate QR Code
    const qr = await generateBase64Link(processedSchedule, name);
    dispatch(setUserInfo(
      name, nameSubtitle, processedSchedule, schoolPicture, isTeacher,
      ...processedInfo, // Teachers have all-null info array
      qr,
    ));

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
  fetchUserInfo, fetchSpecialDates, fetchSchoolPicture,
  logOut,
};
