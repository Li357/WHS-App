# WHS

A schedule & mod information app for [WHS](http://whs.westside66.org/). Created
with [React Native](https://facebook.github.io/react-native/) by Andrew Li. © 2018 Andrew Li, MIT License.

## v2.0.0

Complete rewrite and redesign with NativeBase. Getting rid of CodePush for app version uniformity.
Making the app less crappy and bug prone, with linting and  testing (I hope). Less sloppy code.

Rewrite Roadmap:

- [x] Update dependencies and React/React Native
- [ ] Consistent code and linting
  - [x] Refactor components and screens for less file congestion and more reuse
  - [ ] Better error handling for server request exceptions
  - [ ] Better error reporting for AsyncStorage accesses
  - [ ] Consistent typing and explicit code
  - [ ] Consistent actions and action creators
  - [x] Use ESLint
- [ ] Unit testing with Jest
  - [ ] Login system
  - [ ] Dashboard date handling/operations
  - [ ] Schedule display of cross-sectioned mods and other irregularities
  - [ ] Setting display for customization options
- [x] Redo refreshing system
- [ ] UI Redesign with Native Base
  - [ ] Login
    - [x] Native Base inputs and buttons
    - [x] Vector icon for loading animation
    - [x] Better UI for login failure
    - [ ] [NEEDS ANDROID TESTS] Keyboard avoiding view for all phone sizes
  - [ ] Dashboard
    - [x] Parallax scroll view
    - [ ] [UNDER CONSTRUCTION] Customizable information to be shown on dashboard
    - [x] Upload own photo
    - [x] Option to reset to school photo
  - [x] Schedule
    - [x] Preprocess data in action creators before rendering in Schedule to reduce lag
    - [x] Wait for drawer animation to finish to reduce choppiness
    - [x] Vertical progress bar to signify relative position in day
    - [x] Better approach to showing time tables for mods
  - [ ] Settings
    - [x] Make manual refresh more prominent and user friendly
    - [ ] [UNDER CONSTRUCTION] Customize information to shown on dashboard via drag and drop lists
  - [x] Drawer
    - [x] Banner to show current date for better look
    - [x] Icons for different screens (and tint colors)
    - [x] Logout span full width with same style as screens

Server things to fix/add:
- [ ] Add caching for special date requests to prevent timeouts

## To Do List

- [ ] v2.0.0 Rewrite
- [ ] Notification system for mod ends
