import React from 'react';
import { Select, Space, Typography } from 'antd';
import { useAuth } from '../../app/AuthContext';
import { useNavigate } from 'react-router-dom';

const { Text } = Typography;

export const RoleSwitcher = () => {
  const { currentUser, switchRole, selectUser, users, loadingUsers } = useAuth();
  const navigate = useNavigate();

  const handleChange = (value) => {
    switchRole(value);
    if (value === 'admin') {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
  };

  const handleUserChange = (userId) => {
    const selectedUser = users.find((user) => user._id === userId);
    selectUser(userId);

    if (selectedUser?.role === 'admin') {
      navigate('/admin');
      return;
    }

    navigate('/dashboard');
  };

  const roleOptions = [
    { value: 'employee', label: 'Empleado' },
    { value: 'admin', label: 'Admin' }
  ];

  const userOptions = users.map((user) => ({
    value: user._id,
    label: `${user.name} (${user.role})`
  }));

  return (
    <Space size={8}>
      <Text type="secondary" style={{ fontSize: 12 }}>
        Sesion
      </Text>
      <Select
        value={currentUser.role}
        onChange={handleChange}
        style={{ width: 130 }}
        options={roleOptions}
      />
      <Select
        showSearch
        placeholder="Seleccionar usuario"
        optionFilterProp="label"
        value={currentUser.id}
        loading={loadingUsers}
        onChange={handleUserChange}
        style={{ width: 260 }}
        options={userOptions}
      />
    </Space>
  );
};
