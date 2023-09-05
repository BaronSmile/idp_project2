import React, { useEffect, useState } from 'react';
import { Table, Typography, Modal, Space, Button } from 'antd';
import { DeleteOutlined, EditOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Highlighter from 'react-highlight-words';
import { completeTask, deleteTask, getTasks, updateTask } from '../../services/tasks';
import { useAppDispatch } from '../../hooks/redux';
import { setTasks } from '../../providers/store/reducers/StateSlice';
import EditableCell from './EditableCell';
import { ITask } from '../../types/taskTypes';
import ModalForm from '../ModalForm/ModalForm';
import { SortOrder } from 'antd/lib/table/interface';
import './Tasks.scss';

interface TasksProps {
  searchValue: string;
}

const Tasks: React.FC<TasksProps> = ({ searchValue }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [stateTask, setStateTask] = useState<ITask | null>(null);
  const [stateTasks, setStateTasks] = useState<any[]>([]);
  const client = useQueryClient();
  const dispatch = useAppDispatch();
  const { data, isLoading } = useQuery({
    queryFn: () => getTasks(),
    queryKey: ['tasks', 'all'],
  });

  useEffect(() => {
    setStateTasks(data ?? []);
  }, [data]);

  useEffect(() => {
    dispatch(setTasks(stateTasks));
  }, [stateTasks]);

  useEffect(() => {
    if (searchValue) {
      const filterSearchTasks = (data ?? []).filter((task) =>
        task.title.toLowerCase().includes(searchValue.toLowerCase()),
      );
      setStateTasks(filterSearchTasks);
    } else {
      setStateTasks(data ?? []);
    }
  }, [searchValue]);

  const { mutate: remove } = useMutation(['delete task'], deleteTask, {
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['tasks', 'all'] });
    },
  });

  const { mutate: update } = useMutation(['update task'], updateTask, {
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['tasks', 'all'] });
    },
  });

  const { mutate: completed } = useMutation(
    ['complete task'],
    // (args: { id: string; completed: boolean }) => {
    //   const { id, completed } = args;
    //   return completeTask(id, completed);
    // },
    completeTask,
    {
      onSuccess: () => {
        client.invalidateQueries({ queryKey: ['tasks', 'all'] });
      },
    },
  );

  const rowStyle = (record: any) => {
    return record.completed ? 'opacity_row' : '';
  };

  const onDeleteTask = (id: string) => {
    Modal.confirm({
      title: 'Вы уверены что хотите удалить задачу?',
      okType: 'danger',
      okText: 'Да',
      cancelText: 'Нет',
      onOk: () => {
        remove(id);
      },
    });
  };

  const onEditTask = (task: ITask) => {
    setIsEditing(true);
    setStateTask(task);
  };

  const onUpdateTask = (task: ITask) => {
    update({ id: stateTask?.id, ...task });
    setIsEditing(false);
  };

  const onCompleteTask = (taskValue: ITask) => {
    completed(taskValue);
  };

  const sortByTitle = (a: ITask, b: ITask): number => {
    const aTitle = a.title.toLowerCase();
    const bTitle = b.title.toLowerCase();

    if (/^[а-яё]/i.test(aTitle) && /^[а-яё]/i.test(bTitle)) {
      return aTitle.localeCompare(bTitle);
    }

    if (/^[a-z]/i.test(aTitle) && /^[a-z]/i.test(bTitle)) {
      return aTitle.localeCompare(bTitle);
    }

    if (/^[а-яё]/i.test(aTitle)) {
      return -1;
    }

    if (/^[а-яё]/i.test(bTitle)) {
      return 1;
    }

    return aTitle.localeCompare(bTitle);
  };

  const sortByLevel = (a: ITask, b: ITask): number => {
    const levelOrder: { [key: string]: number } = { easy: 1, medium: 2, hard: 3 };

    const aLevel = levelOrder[a.level] || Number.MAX_SAFE_INTEGER;
    const bLevel = levelOrder[b.level] || Number.MAX_SAFE_INTEGER;

    return aLevel - bLevel;
  };

  const getLevelColor = (level: string) => {
    const levelColors: { [key: string]: string } = {
      easy: '#578f57',
      medium: 'yellow',
      hard: '#DA6F6F',
    };

    return levelColors[level];
  };

  const filterTasksByCompleted = (tasks: ITask[] | undefined, completed: boolean): void => {
    const filteredTasks = (tasks ?? []).filter((task) => task.completed === completed);
    setStateTasks(filteredTasks);
  };

  // const filterSearchTasks = (tasks: ITask[] | undefined, search: string): ITask[] => {
  //   return (tasks ?? []).filter((task) => task.title.toLowerCase().includes(search.toLowerCase()));
  // };

  const columns = [
    {
      title: '#',
      dataIndex: 'id',
      key: 'id',
      defaultSortOrder: 'descend' as SortOrder,
      sorter: (a: any, b: any) => a.id - b.id,
    },
    {
      title: 'Задача',
      dataIndex: 'title',
      key: 'title',
      sorter: sortByTitle,
      defaultSortOrder: 'ascend' as SortOrder,
      render: (title: string) =>
        searchValue ? <Highlighter searchWords={[searchValue]} textToHighlight={title} /> : title,
    },
    {
      title: 'Описание',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Оценка',
      dataIndex: 'point',
      key: 'point',
      render: (point: string) => (
        <span style={{ color: '#4dd7a2', fontWeight: 'bold' }}>{point}</span>
      ),
      sorter: (a: any, b: any) => a.point - b.point,
      defaultSortOrder: 'ascend' as SortOrder,
    },
    {
      title: 'Уровень',
      dataIndex: 'level',
      key: 'level',
      defaultSortOrder: 'descend' as SortOrder,
      sorter: sortByLevel,
      render: (level: string) => <span style={{ color: getLevelColor(level) }}>{level}</span>,
    },
    {
      title: 'Действие',
      dataIndex: 'operation',
      key: 'operation',

      render: (_: any, record: any) => {
        return (
          <>
            <EditOutlined onClick={() => onEditTask(record)} />
            <DeleteOutlined
              onClick={() => onDeleteTask(record.id)}
              style={{ color: '#DA6F6F', margin: ' 0 15px' }}
            />
            <CheckCircleOutlined
              onClick={() => onCompleteTask(record)}
              style={{ color: '#578f57' }}
            />
          </>
        );
      },
    },
  ];
  return (
    <div className="tasks">
      <Space align={'center'} size={'middle'} className={'table_title'}>
        <Typography.Title>Таблица Задач</Typography.Title>
        <Button onClick={() => setStateTasks(data ?? [])} className={'btn_completed'}>
          Все задачи
        </Button>
        <Button onClick={() => filterTasksByCompleted(data, false)} className={'btn_completed'}>
          Активные задачи
        </Button>
        <Button onClick={() => filterTasksByCompleted(data, true)} className={'btn_completed'}>
          Завершенные задачи
        </Button>
      </Space>
      <Table
        components={{
          body: {
            cell: EditableCell,
          },
        }}
        rowKey={(record) => record.id || Date.now()}
        rowClassName={rowStyle}
        loading={isLoading}
        className="tasks_table"
        dataSource={stateTasks}
        columns={columns}
      />
      <ModalForm
        isOpen={isEditing}
        setIsOpen={setIsEditing}
        onFinish={onUpdateTask}
        taskItem={stateTask}
      />
    </div>
  );
};

export default Tasks;
