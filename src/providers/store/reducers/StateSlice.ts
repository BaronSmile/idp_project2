import { createSlice } from '@reduxjs/toolkit';
import { ITask } from '../../../types/taskTypes';

interface ITaskState {
  tasks: ITask[];
  isModalOpen: boolean;
  taskIds: string[];
}

const initialState: ITaskState = {
  tasks: [],
  isModalOpen: false,
  taskIds: [],
};

const stateSlice = createSlice({
  name: 'localState',
  initialState,
  reducers: {
    setTasks(state, { payload }) {
      state.tasks = payload;
    },
    toggleModal(state, { payload }) {
      state.isModalOpen = payload;
    },
    setTaskId(state, { payload }) {
      state.taskIds = payload;
    },
  },
});

export const { toggleModal, setTaskId, setTasks } = stateSlice.actions;
export default stateSlice.reducer;
