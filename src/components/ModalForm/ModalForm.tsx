import React, { useEffect } from 'react';
import { Button, Form, Input, Modal, Select } from 'antd';
import './ModalForm.scss';
import { ITask } from '../../types/taskTypes';
import { useAppSelector } from '../../hooks/redux';

const { Option } = Select;

interface IProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onFinish: (values: any, id?: any) => void;
  taskItem?: ITask | null;
}

const ModalForm = ({ isOpen, onFinish, setIsOpen }: IProps) => {
  const [form] = Form.useForm();
  const { task } = useAppSelector((state) => state.stateReducer);

  useEffect(() => {
    form.setFieldsValue(task);
  }, [task]);

  const handleFinish = (values: any) => {
    onFinish(values);
    if (!isOpen) {
      form.resetFields();
    }
  };

  return (
    <Modal
      title={task ? 'Изменить задачу' : 'Создать задачу'}
      open={isOpen}
      onCancel={() => setIsOpen(false)}
      footer={null}
    >
      <Form
        form={form}
        onFinish={handleFinish}
        className="form_task"
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 24 }}
        initialValues={{ remember: true }}
        autoComplete="off"
      >
        <Form.Item name="title" label="Задача">
          <Input />
        </Form.Item>
        <Form.Item name="description" label="Описание">
          <Input />
        </Form.Item>
        <Form.Item name="point" label="Оценка">
          <Input type="number" />
        </Form.Item>
        <Form.Item name="level" label="Уровень">
          <Select>
            <Option value="easy">Легкий</Option>
            <Option value="medium">Средний</Option>
            <Option value="hard">Трудный</Option>
          </Select>
        </Form.Item>
        <Form.Item className="form_btn">
          <Button htmlType="submit">{task ? `Изменить` : `Создать`}</Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ModalForm;
