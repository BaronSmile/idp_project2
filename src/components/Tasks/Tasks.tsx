import React, { useEffect, useState } from 'react';
import { Button, Modal, Space, Table, Typography } from 'antd';
import { CheckCircleOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useMutation } from '@tanstack/react-query';
import Highlighter from 'react-highlight-words';
import { completeTask, deleteTask, updateTask } from '../../services/tasks';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { setTask, setTasks } from '../../providers/store/reducers/StateSlice';
import { ITask } from '../../types/taskTypes';
import ModalForm from '../ModalForm/ModalForm';
import { SortOrder } from 'antd/lib/table/interface';
import './Tasks.scss';

interface TasksProps {
  searchValue: string;
  dataSource: ITask[];
  isLoading?: boolean;
  refetch?: any;
}

const Tasks: React.FC<TasksProps> = ({ searchValue, dataSource, isLoading, refetch }) => {
  const [isEditingModal, setIsEditingModal] = useState(false);

  const dispatch = useAppDispatch();
  const { tasks, task } = useAppSelector((state) => state.stateReducer);

  useEffect(() => {
    dispatch(setTasks(dataSource ?? []));
  }, [dataSource, dispatch]);

  useEffect(() => {
    if (searchValue) {
      const filterSearchTasks = (dataSource ?? []).filter((task) =>
        task.title.toLowerCase().includes(searchValue.toLowerCase()),
      );
      dispatch(setTasks(filterSearchTasks));
    } else {
      dispatch(setTasks(dataSource ?? []));
    }
  }, [searchValue]);

  const { mutate: remove } = useMutation(['delete task'], deleteTask, {
    onSuccess: () => {
      refetch();
    },
  });

  const { mutate: update } = useMutation(['update task'], updateTask, {
    onSuccess: () => {
      refetch();
    },
  });

  const { mutate: completed } = useMutation(
    ['complete task'],
    // Это оставил как подсказку на будущее
    // (args: { id: string; completed: boolean }) => {
    //   const { id, completed } = args;
    //   return completeTask(id, completed);
    // },
    completeTask,
    {
      onSuccess: () => {
        refetch();
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
    setIsEditingModal(true);
    dispatch(setTask(task));
  };

  const onUpdateTask = (newTask: ITask) => {
    if (task) {
      update({ id: task?.id, ...newTask });
    }
    setIsEditingModal(false);
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
    dispatch(setTasks(filteredTasks));
  };

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
        <Button onClick={() => dispatch(setTasks(dataSource ?? []))} className={'btn_completed'}>
          Все задачи
        </Button>
        <Button
          onClick={() => filterTasksByCompleted(dataSource, false)}
          className={'btn_completed'}
        >
          Активные задачи
        </Button>
        <Button
          onClick={() => filterTasksByCompleted(dataSource, true)}
          className={'btn_completed'}
        >
          Завершенные задачи
        </Button>
      </Space>
      <Table
        rowKey={(record) => record.id || Date.now()}
        rowClassName={rowStyle}
        loading={isLoading}
        className="tasks_table"
        dataSource={tasks}
        columns={columns}
      />
      <ModalForm isOpen={isEditingModal} setIsOpen={setIsEditingModal} onFinish={onUpdateTask} />
    </div>
  );
};

export default Tasks;
