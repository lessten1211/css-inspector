import { configureStore } from '@reduxjs/toolkit';
import requestReducer from './features/requestSlice';
import { rtkQueryApi } from './features/rtkQueryApi';

export const store = configureStore({
  reducer: {
    requests: requestReducer,
    [rtkQueryApi.reducerPath]: rtkQueryApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(rtkQueryApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
