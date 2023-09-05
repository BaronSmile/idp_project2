import React, { useState } from 'react';
import { Avatar, Button, Input, Space, Tooltip } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import Tasks from '../../components/Tasks/Tasks';
import { useAppSelector } from '../../hooks/redux';
import ModalForm from '../../components/ModalForm/ModalForm';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createTask, getTasks } from '../../services/tasks';
import './MainPage.scss';
import { ITask } from '../../types/taskTypes';

const MainPage = () => {
  const [searchValue, setSearchValue] = useState('');
  const [isOpenModal, setIsOpenModal] = useState(false);
  const { tasks } = useAppSelector((state) => state.stateReducer);

  const client = useQueryClient();

  const { data } = useQuery({
    queryFn: () => getTasks(),
    queryKey: ['tasks', 'all'],
  });

  const { mutate: create } = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['tasks', 'all'] });
    },
  });

  const onFinish = (values: any) => {
    if (values) {
      create({ ...values, completed: false, point: Number(values.point) });
      setIsOpenModal(false);
    }
  };
  const getCompletedTasksSum = () => {
    let sum = 0;
    data?.forEach((task) => {
      if (task.completed) {
        sum += Number(task.point);
      }
    });
    return sum;
  };

  return (
    <div className={'main_page'}>
      <Input.Search
        allowClear
        size={'large'}
        placeholder={'Поиск задач'}
        style={{ marginBottom: '20px' }}
        onSearch={(value) => setSearchValue(value)}
      />
      <div className={'main_page__header'}>
        <Button onClick={() => setIsOpenModal(true)}>Создать задачу</Button>
        <p className={'data_length'}>
          Количество задач: <b>{tasks && tasks.length}</b>
        </p>
        <Space wrap size={16}>
          <Tooltip placement={'bottom'} title={'Общая оценка выполненых задач'}>
            <p className={'point_label'}>
              Оценка:
              <b className="point">{getCompletedTasksSum()}</b>
            </p>
          </Tooltip>
          <Tooltip placement={'bottom'} title={'Аватар пользователя'}>
            <Avatar size="large" icon={<UserOutlined />} />
          </Tooltip>
        </Space>
      </div>
      <ModalForm isOpen={isOpenModal} setIsOpen={setIsOpenModal} onFinish={onFinish} />
      <Tasks searchValue={searchValue} />
    </div>
  );
};

export default MainPage;
