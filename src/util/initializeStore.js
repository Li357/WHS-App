import { applyMiddleware, createStore } from 'redux';
import { persistStore, persistReducer, createTransform } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import thunk from 'redux-thunk';
import { createLogger } from 'redux-logger';
import moment from 'moment';

import WHSApp from '../reducers/reducer';

// This transform is needed to rehydrate dates as moment objects
const transformMoments = createTransform(
  inboundState => inboundState,
  (outboundState) => {
    const copy = { ...outboundState };
    Object.keys(copy).forEach((key) => {
      const value = copy[key];
      // If either string or array, then convert to moment object, do not convert if schedule!
      if (['string', 'object'].includes(typeof value) && key !== 'schedule') {
        copy[key] = Array.isArray(value)
          ? value.map(date => moment(date))
          : moment(value);
      }
    });
    return copy;
  },
  { whitelist: ['specialDates', 'dayInfo'] },
);
const persistConfig = {
  key: 'root',
  storage,
  blacklist: ['profilePhoto', 'loginError'],
  transforms: [transformMoments],
};
const persistedReducer = persistReducer(persistConfig, WHSApp);

let middleware = [thunk];
if (process.env.NODE_ENV === 'development') {
  middleware = [...middleware, createLogger()]; // Only apply logger middleware in development
}
const store = createStore(
  persistedReducer,
  applyMiddleware(...middleware),
);
const persistor = persistStore(store);

export { store, persistor, storage };
