import {
  SET_LOGIN_ERROR,
  SET_USER_INFO,
  SET_CREDENTIALS,
  SET_PROFILE_PHOTO,
  SET_SPECIAL_DATES,
  LOG_OUT,
} from '../actions/actions';

const initialState = {
  loginError: '',
  username: '',
  password: '',
  name: '',
  classOf: '',
  homeroom: null,
  counselor: null,
  dean: null,
  id: '',
  schedule: [],
  profilePhoto: null,
  schoolPicture: null,
  dates: [],
};

const WHSApp = (state = initialState, {
  type,
  loginError,
  username,
  password,
  schedule,
  profilePhoto,
  schoolPicture,
  dates,
  ...userInfo
}) => {
  switch (type) {
    case SET_LOGIN_ERROR:
      return {
        ...state,
        loginError,
      };
    case SET_USER_INFO:
      return {
        ...state,
        ...userInfo,
        schedule,
        schoolPicture,
      };
    case SET_CREDENTIALS:
      return {
        ...state,
        username,
        password,
      };
    case SET_SPECIAL_DATES:
      return {
        ...state,
        dates,
      };
    case SET_PROFILE_PHOTO:
      return {
        ...state,
        profilePhoto,
      };
    case LOG_OUT:
      return WHSApp(undefined, {});
    default:
      return state;
  }
};

export default WHSApp;
