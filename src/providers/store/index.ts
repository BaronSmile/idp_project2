import { combineReducers, configureStore } from '@reduxjs/toolkit';
import stateReducer from './reducers/StateSlice';

const rootReducer = combineReducers({
  stateReducer,
});

export const store = configureStore({
  reducer: rootReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
