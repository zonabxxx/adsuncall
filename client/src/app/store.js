import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import clientReducer from '../features/clients/clientSlice';
import callReducer from '../features/calls/callSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    clients: clientReducer,
    calls: callReducer,
  },
}); 