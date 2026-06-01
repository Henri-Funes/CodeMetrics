import React from 'react';
import { ConfigProvider } from 'antd';
import { RouterProvider } from 'react-router-dom';
import { cartonTheme } from './theme';
import { router } from './routes';
import { AuthProvider } from './AuthContext';

export const App = () => {
  return (
    <AuthProvider>
      <ConfigProvider theme={cartonTheme}>
        <RouterProvider router={router} />
      </ConfigProvider>
    </AuthProvider>
  );
};

