import React from 'react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';

import { network, walletConnectBridge, walletConnectDeepLink } from './config';

import {
  DappProvider,
  AuthenticatedRoutesWrapper,
  getIsLoggedIn
} from 'dapp-core';

import AuthenticatedRoute from './pages/AuthenticatedRoute';
import Unlock from './pages/UnlockRoute';

const routes = [
  {
    path: '/home',
    title: 'Home',
    authenticatedRoute: true,
    component: AuthenticatedRoute
  }
];

const App = () => {
  React.useEffect(() => {
    console.log(getIsLoggedIn());
  });

  return (
    <Router>
      <DappProvider
        networkConfig={{ network, walletConnectBridge, walletConnectDeepLink }}
      >
        <AuthenticatedRoutesWrapper routes={routes} unlockRoute={'unlock'}>
          <Routes>
            <Route path='/' element={<p>home</p>} />

            <Route path={'/home'} element={<AuthenticatedRoute />} />

            <Route path={'/unlock'} element={<Unlock />} />

            <Route path='*' element={<div>404</div>} />
          </Routes>
        </AuthenticatedRoutesWrapper>
      </DappProvider>
    </Router>
  );
};

export default App;
