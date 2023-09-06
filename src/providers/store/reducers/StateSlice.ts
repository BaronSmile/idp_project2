import { createSlice } from '@reduxjs/toolkit';
import { ITask } from '../../../types/taskTypes';

interface ITaskState {
  tasks: ITask[];
  task: ITask | null;
}

const initialState: ITaskState = {
  tasks: [],
  task: null,
};

const stateSlice = createSlice({
  name: 'localState',
  initialState,
  reducers: {
    setTasks(state, { payload }) {
      state.tasks = payload;
    },
    setTask(state, { payload }) {
      state.task = payload;
    },
  },
});

export const { setTasks, setTask } = stateSlice.actions;
export default stateSlice.reducer;
