import cheerio from 'react-native-cheerio';
import {
  SET_CREDENTIALS,
  REQUEST_USER_INFO,
  RECEIVE_USER_INFO,
  SET_PROFILE_PHOTO
} from './actions.js';

const setCredentials = (username, password) => ({
  type: SET_CREDENTIALS,
  username,
  password
});

const requestUserInfo = (username, password) => ({
  type: REQUEST_USER_INFO,
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

const fetchUserInfo = (username, password) => (dispatch) => {
  dispatch(setCredentials(username, password));
  dispatch(requestUserInfo(username, password));
  return fetch(
    `https://westside-web.azurewebsites.net/account/login?Username=${username}&Password=${password}`,
    {
      method: 'POST'
    }
  )
    .then(
      response => response.text(),
      error => console.log('An error occured!', error)
    )
    .then(text => {
      const $ = cheerio.load(text);
      const error = $('.alert.alert-danger').text().trim();
      if(error) {
        dispatch(receiveUserInfo(error));
      } else {
        const studentOverview = $('.card-header + .card-block');
        const studentMentorAttrs = [
          'name',
          'phone',
          'email'
        ];
        const children = studentOverview.children('p.card-subtitle:not(.text-muted)');
        const rawJSON = $('.page-content + script')[0].children[0].data.trim();

        const mentors = [...Array(3).keys()].map(key =>
          children.eq(key).text().trim()
        );

        const values = [
          $('title').text().split('|')[0].trim(),
          $('.header-title > h6').text(),
          ...mentors,
          studentOverview.children().eq(13).text().slice(15),
          JSON.parse(rawJSON.slice(24, -2)).schedule
        ];

        dispatch(receiveUserInfo('', ...values))
      }
    });
}

export {
  setCredentials,
  requestUserInfo,
  receiveUserInfo,
  setProfilePhoto,
  fetchUserInfo
};
