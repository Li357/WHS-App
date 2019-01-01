import { load } from 'react-native-cheerio';
import fetch from 'react-native-fetch-polyfill';

import {
  SCHEDULE_JSON_PREFIX, PROFILE_PHOTO_PREFIX,
  SCHOOL_WEBSITE, REQUEST_TIMEOUT,
} from '../constants/constants';

/**
 * Fetches a schedule from the URL and attempts to parse it
 * Returns null if unsucessful, $ otherwise
 */
const parseHTMLFromURL = async (url, options) => {
  const userpageResponse = await fetch(url, {
    timeout: REQUEST_TIMEOUT,
    ...options,
  });
  if (!userpageResponse.ok) {
    return null;
  }

  const userpageHTML = await userpageResponse.text();
  return load(userpageHTML);
};

/**
 * Gets and parses schedule JSON from HTML
 */
const getScheduleFromHTML = ($) => {
  const scheduleString = $('.page-content + script').contents()[0].data.trim();
  const { schedule } = JSON.parse(scheduleString.slice(SCHEDULE_JSON_PREFIX.length, -2));
  return schedule;
};

/**
 * Gets user info from HTML
 */
const getUserInfoFromHTML = ($, schedule) => {
  const name = $('title').text().split('|')[0].replace(/overview/ig, '').trim();

  // This is either 'Class of 20XX' or 'Teacher'
  const nameSubtitle = $('.header-title > h6').text();
  const infoCard = $('.card-header + .card-block');
  const isNewUser = schedule.length === 0;
  // Maps elements in infoCard to text, splitting and splicing handles 'School Number: '
  const isTeacher = nameSubtitle === 'Teacher';
  /* eslint-disable indent */
  const info = !isTeacher
    ? infoCard
        .find('.card-subtitle a, .card-text:last-child')
        .contents()
        .map((index, { data }) => data.split(':').slice(-1)[0].trim())
        .toArray()
    : Array(4).fill(null);
  /* eslint-enable indent */
  const processedInfo = isNewUser && !isTeacher
    ? [null, ...info] // New users will only not be able to see their homeroom yet, so first is null
    : info;

  return [name, nameSubtitle, isTeacher, processedInfo];
};

/**
 * Gets user's profile photo from HTML
 */
const getSchoolPictureFromHTML = ($) => {
  const pictureURL = $('.profile-picture').attr('style').slice(PROFILE_PHOTO_PREFIX.length, -2);
  const schoolPicture = pictureURL.includes('blank-user') // Blank user images have urls of /dist/img/blank-user.png
    ? 'blank-user'
    : pictureURL;
  return schoolPicture;
};

/**
 * Wrapper around parseHTMLFromURL that uses the school website
 */
const fetchUserHTML = async (username, password) => {
  const loginURL = `${SCHOOL_WEBSITE}/account/login?Username=${username}&Password=${password}`;
  const $ = await parseHTMLFromURL(loginURL, { method: 'POST' });
  return $;
};

/**
 * Fetch all other schedules (for refreshes)
 */
const fetchOtherTeacherSchedules = async (otherSchedules) => {
  const selectors = await Promise.all(otherSchedules.map(({ url }) => (
    url
      ? parseHTMLFromURL(url)
      : Promise.resolve(null)
  )));
  return selectors.map(($OrNull, i) => {
    if ($OrNull === null) { // If a student schedule without url, ignore
      return otherSchedules[i];
    }

    // Else, refresh teacher schedule
    return {
      ...otherSchedules[i],
      schedule: getScheduleFromHTML($OrNull),
    };
  });
};

export {
  parseHTMLFromURL,
  getScheduleFromHTML,
  getUserInfoFromHTML,
  getSchoolPictureFromHTML,
  fetchUserHTML,
  fetchOtherTeacherSchedules,
};
