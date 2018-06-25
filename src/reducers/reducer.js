import {
  SET_LOGIN_ERROR,
  SET_USER_INFO,
  SET_CREDENTIALS,
  SET_PROFILE_PHOTO,
  SET_SPECIAL_DATES,
  SET_DAY_INFO,
  LOG_OUT,
} from '../actions/actions';

const initialState = {
  loginError: false,
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
  dayInfo: {
    start: null,
    end: null,
    schedule: [],
    lastUpdate: null,
  },
  specialDates: {
    semesterOneStart: '',
    semesterTwoStart: '',
    lastDay: '',
    noSchoolDates: [],
  },
};

const WHSApp = (state = initialState, {
  type,
  loginError,
  username,
  password,
  schedule,
  profilePhoto,
  schoolPicture,
  dayStart,
  dayEnd,
  daySchedule,
  lastDayInfoUpdate,
  specialDates,
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
        specialDates,
      };
    case SET_PROFILE_PHOTO:
      return {
        ...state,
        profilePhoto,
      };
    case SET_DAY_INFO:
      return {
        ...state,
        dayInfo: {
          start: dayStart,
          end: dayEnd,
          schedule: daySchedule,
          lastUpdate: lastDayInfoUpdate,
        },
      };
    case LOG_OUT:
      return WHSApp(undefined, {});
    default:
      return state;
  }
};

export default WHSApp;
