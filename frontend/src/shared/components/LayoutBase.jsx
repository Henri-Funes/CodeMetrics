import React from 'react';
import { Layout, Menu, Space, Tag, Typography } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AppstoreOutlined } from '@ant-design/icons';
import { RoleSwitcher } from './RoleSwitcher';
import { MiniWalletWidget } from './MiniWalletWidget';
import { useAuth } from '../../app/AuthContext';
import './LayoutBase.css';

const { Header, Content, Footer } = Layout;
const { Text, Title } = Typography;

export const LayoutBase = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Menú dinámico según el rol
  const menuItems = currentUser.role === 'admin' 
    ? [
        { key: '/admin', label: 'Dashboard' },
        { key: '/admin/rewards', label: 'Catálogo Tienda' },
        { key: '/admin/redemptions', label: 'Canjes' },
      ]
    : [
        { key: '/dashboard', label: 'Mi Desempeño' },
        { key: '/store', label: 'Tienda' },
        { key: '/wallet', label: 'Billetera' },
      ];

  return (
    <Layout className="app-shell">
      <Header className="app-header">
        <div className="app-header__left">
          <div className="app-brand" onClick={() => navigate('/')} role="button" tabIndex={0}>
            <span className="app-brand__icon">
              <AppstoreOutlined />
            </span>
            <div>
              <Title level={4} className="app-brand__title">
                CodeMetrics
              </Title>
              <Text className="app-brand__subtitle">SGDLI Workforce Rewards</Text>
            </div>
          </div>
          <Menu 
            className="app-menu"
            theme="dark" 
            mode="horizontal" 
            selectedKeys={[location.pathname]} 
            items={menuItems}
            onClick={({ key }) => navigate(key)}
          />
        </div>
        
        <Space size="middle" className="app-header__right">
          <Tag color={currentUser.role === 'admin' ? 'gold' : 'cyan'}>
            {currentUser.role === 'admin' ? 'Admin' : 'Employee'}
          </Tag>
          {currentUser.role === 'employee' && <MiniWalletWidget />}
          <RoleSwitcher />
        </Space>
      </Header>
      
      <Content className="app-content">
        {/* Aquí se renderiza la vista hija de las rutas (AdminDashboard, EmployeeDashboard, etc.) */}
        <Outlet />
      </Content>
      
      <Footer className="app-footer">
        CodeMetrics ©2026 - SGDLI Academic MVP
      </Footer>
    </Layout>
  );
};
