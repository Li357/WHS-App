import {
  SET_CREDENTIALS,
  REQUEST_USER_INFO,
  RECEIVE_USER_INFO,
  SET_PROFILE_PHOTO
} from '../actions/actions.js';

const whsApp = (state = {
  username: '',
  password: '',
  error: '',
  name: '',
  classOf: '',
  homeroom: '',
  counselor: '',
  dean: '',
  id: '',
  schedule: {},
  profilePhoto: '',
  isFetching: false
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
    case REQUEST_USER_INFO:
      return {
        ...state,
        isFetching: true
      };
    case RECEIVE_USER_INFO:
      return {
        ...state,
        isFetching: false,
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
    default:
      return state;
  }
}

export default whsApp;
