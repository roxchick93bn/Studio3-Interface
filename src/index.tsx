import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import { PersistGate } from 'redux-persist/integration/react';
import { Toaster } from 'react-hot-toast';

import App from './App';
import reportWebVitals from './reportWebVitals';

import store, { persistor } from '@/state/store';
import Web3Provider from '@/providers/Web3Provider';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  // <React.StrictMode>
  <Router>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Web3Provider>
          <Toaster />
          <App />
        </Web3Provider>
      </PersistGate>
    </Provider>
  </Router>
  // </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
