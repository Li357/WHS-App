# WHS



A schedule & mod information app for [WHS](http://whs.westside66.org/). Created
with [Expo](https://expo.io/)/[CRNA](https://github.com/react-community/create-react-native-app)
& [React Native](https://facebook.github.io/react-native/) by Andrew Li. This has
been ejected. © 2018 Andrew Li, MIT License.

# Known Bugs

- react-native-blur does not work correctly on Android. Not using on Android currently

# To Do List

This is the list of everything I want to get done in the app:

- [x] Login screen
- [x] Logout
- [x] Current mod
- [x] Next class
- [x] Mod & day timers
- [x] Schedule viewer
- [x] Handle cross-sectioned mods
- [x] Handle late-start/early dismissals
- [x] Handle holidays/breaks
- [x] Handle end of the school year & summer
- [x] Upload profile photo
- [x] Auto-refresh on student details/schedule
- [x] Redux rewrite for better performance
- [x] Finish Android startup screens & icons
- [ ] Notification system for mod ends

Currently pending (definitely implemented soon):

- [x] Querying of school calendar to get days off, auto-refresh
- [ ] Adding notification system of next class at mod end
- [x] Add cross-section warning on dashboard

Auto-refresh depends on the fact *the school calendar updates for the next year by the end of the year!*

If your username or password changes, you will still be able to see your information.
This is because all your information is stored when you first sign in. It's recommended
that you sign out if your credentials have changed. Auto-refresh will not work if your
credentials change.

Bug wise:

- [x] Fix the hamburger menu problem with state and double clicking
- [x] Update from react-native-swiper to an Android-compatible library
- [ ] Wait for update on react-native-blur so that the BlurView is rendered with Image, not after

Here are some app-OS goals:

- [x] iOS Version
- [x] Android Version
