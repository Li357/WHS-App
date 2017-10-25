import {
  SET_CREDENTIALS,
  RECEIVE_USER_INFO,
  SET_PROFILE_PHOTO,
  RECEIVE_DATES,
  SET_REFRESHED,
  SET_LAST_SUMMER,
  LOG_OUT
} from '../actions/actions.js';

const whsApp = (state = {
  username: ' ',
  password: ' ',
  error: '',
  name: ' ',
  classOf: ' ',
  homeroom: ' ',
  counselor: ' ',
  dean: ' ',
  id: ' ',
  schedule: [],
  profilePhoto: ' ',
  dates: [],
  refreshedOne: false,
  refreshedTwo: false,
  lastSummerStart: null
}, {
  type,
  username,
  password,
  error,
  name,
  classOf,
  homeroom,
  counselor,
  dean,
  id,
  schedule,
  profilePhoto,
  dates,
  semester,
  refreshed,
  lastSummerStart
}) => {
  switch(type) {
    case SET_CREDENTIALS:
      return {
        ...state,
        username,
        password
      };
    case SET_PROFILE_PHOTO:
      return {
        ...state,
        profilePhoto
      };
    case RECEIVE_USER_INFO:
      return {
        ...state,
        error,
        ...(!error ? {
          name,
          classOf,
          homeroom,
          counselor,
          dean,
          id,
          schedule
        } : {})
      };
    case RECEIVE_DATES:
      return {
        ...state,
        dates
      };
    case SET_REFRESHED:
      return {
        ...state,
        [`refreshed${semester[0].toUpperCase()}${semester.slice(1)}`]: refreshed
      };
    case SET_LAST_SUMMER:
      return {
        ...state,
        lastSummerStart
      }
    case LOG_OUT:
      return whsApp(undefined, {});
    default:
      return state;
  }
}

export default whsApp;
