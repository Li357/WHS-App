# WHS

A schedule & mod information app for [WHS](http://whs.westside66.org/). Created
with [React Native](https://facebook.github.io/react-native/) by Andrew Li. © 2018 Andrew Li, MIT License.

## v2.0.0

Complete rewrite and redesign with NativeBase. Getting rid of CodePush for app version uniformity.
Making the app less crappy and bug prone, with linting and  testing (I hope). Less sloppy code.

### Rewrite Roadmap:

Next up:
- [ ] [IN PROGRESS] Handle different types of dates (need to manually add in meantime)

- [x] Update dependencies and React/React Native
- [ ] Consistent code and linting
  - [x] Refactor components and screens for less file congestion and more reuse
  - [x] Better error handling for server request exceptions
  - [x] Better error reporting for AsyncStorage accesses
  - [ ] Consistent typing and explicit code
  - [x] Consistent actions and action creators
  - [x] Use ESLint
- [ ] Unit testing with Jest
  - [ ] Login system
  - [ ] Dashboard date handling/operations
  - [ ] Schedule display of cross-sectioned mods and other irregularities
- [x] Redo refreshing system
- [x] UI Redesign with Native Base
  - [ ] Login
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
