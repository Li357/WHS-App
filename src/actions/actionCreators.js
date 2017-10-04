import {
  Alert,
  AsyncStorage
} from 'react-native';

import cheerio from 'react-native-cheerio';

import {
  SET_CREDENTIALS,
  RECEIVE_USER_INFO,
  SET_PROFILE_PHOTO,
  LOG_OUT
} from './actions.js';

const setCredentials = (username, password) => ({
  type: SET_CREDENTIALS,
  username,
  password
});

const receiveUserInfo = (error, name, classOf, homeroom, counselor, dean, id, schedule) => ({
  type: RECEIVE_USER_INFO,
  error,
  name,
  classOf,
  homeroom,
  counselor,
  dean,
  id,
  schedule
});

const setProfilePhoto = profilePhoto => ({
  type: SET_PROFILE_PHOTO,
  profilePhoto
});

const logOut = () => ({
  type: LOG_OUT
});

const saveProfilePhoto = (username, profilePhoto) => async dispatch => {
  dispatch(setProfilePhoto(profilePhoto));
  try {
    await AsyncStorage.setItem(`${username}:profilePhoto`, profilePhoto);
  } catch(error) {
    Alert.alert('Error', `An error occurred: ${error}`)
  }
};

const fetchUserInfo = (username, password) => async dispatch => {
  dispatch(setCredentials(username, password));
  try {
    await fetch( //This is needed to clear the current user
      `https://westside-web.azurewebsites.net/account/login?Username=${username}&Password=${password}`,
      {
        method: 'POST'
      }
    );
    const user = await fetch(
      `https://westside-web.azurewebsites.net/account/login?Username=${username}&Password=${password}`,
      {
        method: 'POST'
      }
    );
    const userHTML = await user.text();

    const $ = cheerio.load(userHTML);
    const error = $('.alert.alert-danger').text().trim();
    if(error) {
      dispatch(receiveUserInfo(error));
    } else {
      const studentOverview = $('.card-header + .card-block');
      const children = studentOverview.children('p.card-subtitle:not(.text-muted)');
      const rawJSON = $('.page-content + script')[0].children[0].data.trim();
      const mentors = [...Array(3).keys()].map(key =>
        children.eq(key).text().trim()
      );
      const id = studentOverview.children().eq(13).text().slice(15);
      const schedule = JSON.parse(rawJSON.slice(24, -2)).schedule;

      const values = [
        $('title').text().split('|')[0].trim(),
        $('.header-title > h6').text(),
        ...mentors,
        id,
        schedule
      ];

      dispatch(receiveUserInfo('', ...values));

      const profilePhoto = await AsyncStorage.getItem(`${username}:profilePhoto`);
      dispatch(setProfilePhoto(profilePhoto ? profilePhoto : `https://westsidestorage.blob.core.windows.net/student-pictures/${id}.jpg`));
    }
  } catch(error) {
    Alert.alert('Error', `An error occurred: ${error}`);
  }
};

export {
  setCredentials,
  receiveUserInfo,
  setProfilePhoto,
  logOut,
  saveProfilePhoto,
  fetchUserInfo
};
