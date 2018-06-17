import React, { Component } from 'react';
import { applyMiddleware, createStore } from 'redux';
import { Provider } from 'react-redux';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { PersistGate } from 'redux-persist/integration/react';
import thunk from 'redux-thunk';

import WHSApp from './src/reducers/reducer';

const persistConfig = {
  key: 'root',
  storage,
};
const persistedReducer = persistReducer(persistConfig, WHSApp);
const store = createStore(
  persistedReducer,
  applyMiddleware(
    thunk,
    createLogger()
  ),
);
const persistor = persistStore(store);

export default class App extends Component {
  render() {
    return (
      <Provider>
        <PersistGate loading={null} persistor={persistor}>
          {/* TODO */}
        </PersistGate>
      </Provider>
    );
  }
};
