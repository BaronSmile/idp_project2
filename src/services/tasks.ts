import { ITask } from '../types/taskTypes';
import axios from 'axios';

const urlBASE = 'https://64da687be947d30a260b3a0f.mockapi.io/tasks';

export async function getTasks(): Promise<ITask[]> {
  const res = await axios(urlBASE);
  if (res.status !== 200) {
    throw new Error('Something went wrong');
  }
  return res.data;
}

export async function createTask(task: ITask[]) {
  const res = await axios.post(urlBASE, task);
  return res.data;
}

export async function deleteTask(id: string) {
  const res = await axios.delete(`${urlBASE}/${id}`);
  return res.data;
}

export async function updateTask(task: ITask) {
  console.log('FETCH:', task);
  const res = await axios.put(`${urlBASE}/${task.id}`, task);
  return res.data;
}

export async function completeTask(task: ITask) {
  const res = await axios.put(`${urlBASE}/${task.id}`, { completed: !task.completed });
  return res.data;
}

// export async function deleteTask(ids: string[]) {
//   const deleteRequests = ids.map((id) => axios.delete(`${urlBASE}/${id}`));
//
//   try {
//     const res = await Promise.all(deleteRequests);
//     return res.map((res) => res.data);
//   } catch (error) {
//     throw new Error('Failed to update task');
//   }
// }

// export const completeTask = async (
//   ids: string[],
//   completed: boolean | undefined,
// ): Promise<any[]> => {
//   console.log('PUT:', ids, completed);
//   const completeRequest = ids.map(async (id) => {
//     try {
//       const resp = await axios.put(`${urlBASE}/${id}`, { completed: !completed });
//       return resp.data;
//     } catch (error) {
//       console.error('Error in PUT request:', error);
//       throw new Error('Failed to update task');
//     }
//   });
//   const res = await Promise.allSettled(completeRequest);
//   return res.map((res) => (res.status === 'fulfilled' ? res.value.data : null));
// };
