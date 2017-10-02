# WHS

A schedule & mod information app for [WHS](http://whs.westside66.org/). Created
with [Expo](https://expo.io/)/[CRNA](https://github.com/react-community/create-react-native-app)
& [React Native](https://facebook.github.io/react-native/) by Andrew Li. This has
been ejected. © 2017 Andrew Li, MIT License.

Note: The school clock is roughly 18 - 22 seconds behind your phone time. The mod
timers have a roughly 20 second discrepancy (as of 9/16/17).

# Known Bugs

- react-native-blur does not work correctly on Android

# To Do List

This is the list of everything I want to get done in the app:

- [x] Login screen
- [x] Logout
- [x] Current mod
- [x] Next class
- [x] Mod & day timers
- [x] Schedule viewer
- [x] Handle cross-sectioned mods
- [ ] Handle late-start and holidays/breaks
- [ ] Handle end of the school year & summer
- [x] Upload profile photo
- [ ] Auto-refresh on student details/schedule
- [x] Redux rewrite for better performance
- [ ] Finish Android startup screens & icons

Note that auto-refreshing will follow these rules:

- Names will not be auto-refreshed
- IDs will not be auto-refreshed
- Graduation Year will be auto-refreshed every year
- Mentors will be auto-refreshed every year (Homeroom will need a manual refresh)
- Schedule is auto-refreshed every semester

If your username or password changes, you will still be able to see your information.
This is because all your information is stored when you first sign in. It's recommended
that you sign out if your credentials have changed.

Bug wise:

- [x] Fix the hamburger menu problem with state and double clicking
- [x] Update from react-native-swiper to an Android-compatible library
- [ ] Wait for update on react-native-blur so that the BlurView is rendered with Image, not after
- [ ] Components apparently don't unmount when navigating. Will have to workaround no lifecycle hooks

Here are some app-OS goals:

- [x] iOS Version
- [x] Android Version (Some bugs!)
