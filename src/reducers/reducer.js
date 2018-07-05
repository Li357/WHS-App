import {
  SET_LOGIN_ERROR,
  SET_USER_INFO,
  SET_CREDENTIALS,
  SET_PROFILE_PHOTO,
  SET_SPECIAL_DATES,
  SET_DAY_INFO,
  SET_SETTINGS,
  SET_REFRESHED,
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
  isTeacher: false,
  schedule: [],
  profilePhoto: null,
  schoolPicture: null,
  dayInfo: {
    start: null,
    end: null,
    schedule: [],
    lastUpdate: null,
    isSummer: false,
    isBreak: false,
    isFinals: false,
    hasAssembly: false,
  },
  specialDates: {
    semesterOneStart: null,
    semesterTwoStart: null,
    lastDay: null,
    noSchoolDates: [],
  },
  settings: { errorReporting: true },
  refreshedSemesterOne: false,
  refreshedSemesterTwo: false,
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
  dayIsSummer,
  dayIsBreak,
  dayHasAssembly,
  dayIsFinals,
  lastDayInfoUpdate,
  specialDates,
  settings,
  refreshedSemesterOne,
  refreshedSemesterTwo,
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
          isSummer: dayIsSummer,
          isBreak: dayIsBreak,
          hasAssembly: dayHasAssembly,
          isFinals: dayIsFinals,
        },
      };
    case SET_SETTINGS:
      return {
        ...state,
        settings,
      };
    case SET_REFRESHED:
      return {
        ...state,
        refreshedSemesterOne,
        refreshedSemesterTwo,
      };
    case LOG_OUT:
      return initialState;
    default:
      return state;
  }
};

export default WHSApp;
