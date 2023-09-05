export type ITask = {
  id?: number;
  title: string;
  description: string;
  point: number | string;
  level: string;
  completed?: boolean;
};
