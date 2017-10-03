import {
  SET_CREDENTIALS,
  RECEIVE_USER_INFO,
  SET_PROFILE_PHOTO,
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
  profilePhoto: ' '
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
  profilePhoto
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
    case LOG_OUT:
      return whsApp(undefined, {});
    default:
      return state;
  }
}

export default whsApp;
