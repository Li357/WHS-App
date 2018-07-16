# WHS

A schedule & mod information app for [WHS](http://whs.westside66.org/). Created
with [React Native](https://facebook.github.io/react-native/) by Andrew Li. © 2018 Andrew Li, MIT License.

## v2

Complete rewrite and redesign with NativeBase. Now with linting and better code. Using multiple
deployment targets for CodePush testing and Bugsnag for crashlytics.

## v1 (latest 1.0.2)

The source for version 1.0.2 and history for v1 is in [the v1 branch](https://github.com/Li357/WHS/tree/v1).

### Rewrite Roadmap:

Next up:
- [x] Integration with [bugsnag](https://docs.bugsnag.com/platforms/react-native/) for better error reporting, more conservative use of CodePush to prevent uneven versioning between users
- [x] Handle different types of dates (need to manually add in meantime)
  - [x] Test no-overlap on assembly dates
  - [x] Test overlap on assembly dates
  - [x] Test cross sectioned overlap on assembly dates
  - [x] Test finals display on ScheduleCard and Dashboard
    - [x] For last day of finals, start at mod 5 on Dashboard
  - [x] Test early dismissal dates
  - [x] Test late start dates
- [x] Fix bug to handle multiple cross sections per day
- [x] Decode encoded JSON (i.e. \\u0026)

- [x] Update dependencies and React/React Native
- [x] Consistent code and linting
  - [x] Refactor components and screens for less file congestion and more reuse
  - [x] Better error handling for server request exceptions
  - [x] Better error reporting for AsyncStorage accesses
  - [x] Consistent actions and action creators
  - [x] Use ESLint
- [ ] Unit testing with Jest
  - [ ] Login system
  - [ ] Dashboard date handling/operations
  - [ ] Schedule display of cross-sectioned mods and other irregularities
- [x] Redo refreshing system
- [x] UI Redesign with Native Base
  - [x] Login
    - [x] Native Base inputs and buttons
    - [x] Vector icon for loading animation
    - [x] Better UI for login failure
    - [x] Keyboard avoiding view for all phone sizes
  - [x] Dashboard
    - [x] Parallax scroll view
    - [x] Upload own photo
    - [x] Option to reset to school photo
    - [x] Display cross-sectioned warning
  - [x] Schedule
    - [x] Preprocess data in action creators before rendering in Schedule to reduce lag
    - [x] Wait for drawer animation to finish to reduce choppiness
    - [x] Vertical progress bar to signify relative position in day
    - [x] Better approach to showing time tables for mods
    - [x] Display cross-sectioned mods
  - [x] Settings
    - [x] Make manual refresh more prominent and user friendly
  - [x] Drawer
    - [x] Banner to show current date for better look
    - [x] Icons for different screens (and tint colors)
    - [x] Logout span full width with same style as screens
