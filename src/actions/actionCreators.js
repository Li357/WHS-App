import {
  Alert,
  AsyncStorage
} from 'react-native';

import cheerio from 'react-native-cheerio';
import fetch from 'react-native-fetch-polyfill';

import {
  SET_CREDENTIALS,
  RECEIVE_USER_INFO,
  SET_PROFILE_PHOTO,
  SET_SCHOOL_PICTURE,
  RECEIVE_DATES,
  SET_REFRESHED,
  SET_LAST_SUMMER,
  LOG_OUT
} from './actions.js';

const setCredentials = (username, password) => ({
  type: SET_CREDENTIALS,
  username,
  password
});

const receiveUserInfo = (error, name, classOf, homeroom, counselor, dean, id, schedule, schoolPicture) => ({
  type: RECEIVE_USER_INFO,
  error,
  name,
  classOf,
  homeroom,
  counselor,
  dean,
  id,
  schedule,
  schoolPicture
});

const setProfilePhoto = profilePhoto => ({
  type: SET_PROFILE_PHOTO,
  profilePhoto
});

const receiveDates = dates => ({
  type: RECEIVE_DATES,
  dates
});

const logOut = () => ({
  type: LOG_OUT
});

const setSchoolPicture = schoolPicture => ({
  type: SET_SCHOOL_PICTURE,
  schoolPicture
});

const setRefreshed = (semester, refreshed) => ({
  type: SET_REFRESHED,
  semester,
  refreshed
});

const setLastSummer = lastSummerStart => ({
  type: SET_LAST_SUMMER,
  lastSummerStart
});

const saveProfilePhoto = (username, profilePhoto) => async dispatch => {
  dispatch(setProfilePhoto(profilePhoto));
  try {
    await AsyncStorage.setItem(`${username}:profilePhoto`, profilePhoto);
  } catch(error) {
    Alert.alert(
      'Error',
      `An error occurred: ${error}`,
      [
        { text: 'OK' }
      ]
    );
  }
};

const fetchUserInfo = (username, password, refresh, hasProfilePhoto) => async dispatch => {
  try {
    await fetch( //This is needed to clear the current user
      `https://westside-web.azurewebsites.net/account/login?Username=${username}&Password=${password}`,
      {
        method: 'POST',
        timeout: 6000
      }
    );
    const user = await fetch(
      `https://westside-web.azurewebsites.net/account/login?Username=${username}&Password=${password}`,
      {
        method: 'POST',
        timeout: 6000
      }
    );
    const userHTML = await user.text();

    const $ = cheerio.load(userHTML);
    const error = $('.alert.alert-danger').text().trim();
    const name = $('title').text().split('|')[0].trim();
    if(error) {
      dispatch(receiveUserInfo(error));
    } else if(name === 'Login') { //Not sure this will happen but always good to prepare
      const logout = () => {
        dispatch(logOut());
        navigate('Login');
      }

      Alert.alert(
        'Error',
        `An error occurred while logging in. ${refresh ? 'Your username and/or password may have changed.' : ''} Please try again.`,
        [
          {
            text: 'OK',
            onPress: logout
          }
        ]
      );
      dispatch(receiveUserInfo(' '));
    } else {
      dispatch(setCredentials(username, password));

      const studentOverview = $('.card-header + .card-block');
      const children = studentOverview.children('p.card-subtitle:not(.text-muted)');
      const rawJSON = $('.page-content + script')[0].children[0].data.trim();
      const id = studentOverview.children().eq(13).text().slice(15);
      const schedule = JSON.parse(rawJSON.slice(24, -2)).schedule;
      const studentPicture = $('.profile-picture')[0].attribs.style.slice(22, -2);

      const classOf = $('.header-title > h6').text();

      let mentors = [
        children.eq(0).text().trim(), //Fixes weird bug on Android
        children.eq(1).text().trim(),
        children.eq(2).text().trim()
      ];
      if(classOf === 'Teacher') {
        mentors = [null, null, null];
      }

      const values = [
        name,
        $('.header-title > h6').text(),
        ...mentors,
        id,
        schedule,
        studentPicture
      ];

      dispatch(receiveUserInfo('', ...values));

      const profilePhoto = await AsyncStorage.getItem(`${username}:profilePhoto`);
      dispatch(setProfilePhoto(profilePhoto ? profilePhoto : studentPicture));
    }
  } catch(error) {
    Alert.alert(
      'Error',
      'An error occurred, please check your internet connection.',
      [
        { text: 'OK' }
      ]
    );
    dispatch(receiveUserInfo(' '));
  }
};

const fetchDates = refresh => async dispatch => {
  try {
    const now = new Date();
    const fullYear = now.getFullYear();
    const year = fullYear - (now.getMonth() + 1 < 8) + Boolean(refresh);
    const reasons = [
        'NO SCHOOL',
        'LATE START',
        'NO SCHOOL (PROFESSIONAL DEVELOPMENT)',
        'FIRST DAY OF SCHOOL',
        'LAST DAY OF SCHOOL'
    ];
    const dates = [];

    for(const month of Array.from(new Array(12), (_, i) => i + 1)) {
      const paddedMonth = `${month > 9 ? '' : '0'}${month}`;
      const modifiedYear = year + (month < 8);

      const calendar = await fetch(
        `https://calendar.google.com/calendar/htmlembed?src=westside66.net_pq4vhhqt81f6no85undm0pr22k%40group.calendar.google.com&ctz=America/Chicago&dates=${modifiedYear}${paddedMonth}01/${modifiedYear}${paddedMonth}28`,
        { timeout: 7000 }
      );
      const calendarHTML = await calendar.text();

      const whsCalendar = await fetch(
        `https://calendar.google.com/calendar/htmlembed?src=westside66.net_qsgj2c0p7acid5c9t7dhe1q100@group.calendar.google.com&ctz=America/Chicago&dates=${modifiedYear}${paddedMonth}01/${modifiedYear}${paddedMonth}28`,
        { timeout: 7000 }
      );
      const whsCalendarHTML = await whsCalendar.text();

      [calendarHTML, whsCalendarHTML].forEach(html => {
        const $ = cheerio.load(html);
        $('.tbg').each(function() {
          const eventText = $(this).find('span').text();
          if(reasons.includes(eventText.toUpperCase()) || reasons.some(reason => eventText.toUpperCase().includes(reason)) && html === whsCalendarHTML) {
            const td = $(this).parent().parent();
            let extraSpans = 0; //# of extra colSpans in previous tds in each calendar row
            td.prevAll().each(function() {
                const colSpan = $(this)[0].attribs.colspan || 1;
                extraSpans += colSpan - 1
            });
            const index = td.index() + extraSpans;
            const datelines = td.parent().prevAll().not('.grid-row').not('col');
            const closestTr = datelines.first(); //the closest tr to the current element has the day

            const day = +closestTr.children().eq(index).text();
            if(!(day < 7 && datelines.length > 5)) {
              const obj = {
                month,
                day,
                year: modifiedYear,
                first: false,
                second: false,
                last: false,
                late: false,
                assembly: false,
                finals: false,
                early: false
              };
              if(eventText.toUpperCase() === reasons[3]) {
                obj.first = true;
                dates.push(obj);
              } else if(eventText.toUpperCase() === reasons[4]) {
                [1, 0].forEach(extraDay => {
                  dates.push({
                    ...obj,
                    finals: true,
                    day: day - extraDay,
                    last: extraDay === 0
                  });
                });
              } else if(eventText.toUpperCase().includes(reasons[1])) {
                obj.late = true;
                dates.push(obj);
              } else {
                if(month === 12 && day > 14) {
                  [1, 0].forEach(extraDay => {
                    dates.push({
                      ...obj,
                      finals: true,
                      day: day - (3 + extraDay)
                    });
                  });
                }

                Array.from(new Array(+td.toArray()[0].attribs.colspan || 1), (_, i) => i + 1).forEach(extraDay => {
                  dates.push({
                    ...obj,
                    day: day + extraDay - 1
                  });
                });
              }
            }
          }
        });
      });
    }

    dates.push({ //Nov 2 assembly - hardcoded (BAD!)
      month: 11,
      day: 2,
      year: 2017,
      first: false,
      second: false,
      last: false,
      late: false,
      assembly: true,
      early: false
    });
    [0, 1].forEach(num => {
      dates.push({ //Counselor days for next year schedule
        month: 1,
        day: 22 + num,
        year: 2018,
        first: false,
        second: false,
        last: false,
        late: false,
        assembly: false,
        early: true
      });
    });

    let pass = false; //only want check to run once
    const withSecondSemester = dates.reduce((newArray, { //find date of second semester start
      year,
      month,
      day
    }, index) => {
      if(month === 1) { //Second semester is in January
        if(dates[index + 1] && dates[index + 1].day !== day + 1 && new Date(year, month - 1, day + 1).getDay() === 6 && !pass) { //if not consecutive and next day isn't weekend
          pass = true;
          return [
            ...newArray,
            dates[index],
            {
              month,
              day: day + 3, //Skip weekend
              year,
              first: false,
              second: true,
              last: false
            }
          ];
        }
      }
      return [
        ...newArray,
        dates[index]
      ];
    }, []);

    dispatch(receiveDates(withSecondSemester));
  } catch(error) {
    Alert.alert(
      'Error',
      `An error occurred, please check your internet connection.`,
      [
        { text: 'OK' }
      ]
    );
  }
};

export {
  setCredentials,
  receiveUserInfo,
  setProfilePhoto,
  setSchoolPicture,
  setRefreshed,
  logOut,
  saveProfilePhoto,
  fetchUserInfo,
  receiveDates,
  fetchDates
};
