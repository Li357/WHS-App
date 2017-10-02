import {
  Alert,
  AsyncStorage
} from 'react-native';

import cheerio from 'react-native-cheerio';

import {
  SET_CREDENTIALS,
  RECEIVE_USER_INFO,
  SET_PROFILE_PHOTO
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

const saveProfilePhoto = (username, profilePhoto) => dispatch => {
  dispatch(setProfilePhoto(profilePhoto));
  return AsyncStorage.setItem(`${username}:profilePhoto`, profilePhoto)
    .catch(
      error => Alert.alert('Error', `An error occured while saving your profile photo: ${error}`)
    );
};

const fetchUserInfo = (username, password) => dispatch => {
  dispatch(setCredentials(username, password));
  console.log(username, password);
  return fetch(
    `https://westside-web.azurewebsites.net/account/login?Username=${username}&Password=${password}`,
    {
      method: 'POST'
    }
  )
    .then(
      response => response.text(),
      error => Alert.alert('Error', `An error occurred: ${error}`)
    )
    .then(async text => {
      console.log(text, username, password);

      const $ = cheerio.load(text);
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
        const schedule = JSON.parse(rawJSON.slice(24, -2)).schedule;

        const values = [
          $('title').text().split('|')[0].trim(),
          $('.header-title > h6').text(),
          ...mentors,
          studentOverview.children().eq(13).text().slice(15),
          schedule
        ];

        dispatch(receiveUserInfo('', ...values));

        try {
          const profilePhoto = await AsyncStorage.getItem(`${username}:profilePhoto`);
          dispatch(setProfilePhoto(profilePhoto ? profilePhoto : 'BlankUser'));
        } catch(error) {
          Alert.alert('Error', `An error occurred: ${error}`);
        }
      }
    });
};

export {
  setCredentials,
  receiveUserInfo,
  setProfilePhoto,
  saveProfilePhoto,
  fetchUserInfo
};
