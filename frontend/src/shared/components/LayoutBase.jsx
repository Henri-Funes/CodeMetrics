import React from 'react';
import { Layout, Menu, Space, Tag, Typography } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppstoreOutlined,
  DashboardOutlined,
  ShopOutlined,
  SwapOutlined,
  WalletOutlined
} from '@ant-design/icons';
import { RoleSwitcher } from './RoleSwitcher';
import { MiniWalletWidget } from './MiniWalletWidget';
import { GoalInspectorDock } from './GoalInspectorDock';
import { useAuth } from '../../app/AuthContext';
import './LayoutBase.css';

const { Header, Content, Footer, Sider } = Layout;
const { Text, Title } = Typography;

const employeeMenuItems = [
  { key: '/dashboard', label: 'Mi Desempeño' },
  { key: '/goals', label: 'Objetivos' },
  { key: '/evaluations', label: 'Evaluaciones' },
  { key: '/store', label: 'Tienda' },
  { key: '/wallet', label: 'Billetera' }
];

const adminMenuItems = [
  { key: '/admin', icon: <DashboardOutlined />, label: 'Resumen' },
  { key: '/admin/goals', label: 'Planificacion' },
  { key: '/admin/evaluations', label: 'Evaluaciones' },
  { key: '/admin/rewards', icon: <ShopOutlined />, label: 'Gestion de Tienda' },
  { key: '/admin/redemptions', icon: <SwapOutlined />, label: 'Canjes Pendientes' },
  { key: '/admin/wallet', icon: <WalletOutlined />, label: 'Billetera' }
];

function AppHeader({ showEmployeeMenu = false, menuItems = [] }) {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return (
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
        {showEmployeeMenu ? (
          <Menu
            className="app-menu"
            theme="dark"
            mode="horizontal"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={({ key }) => navigate(key)}
          />
        ) : null}
      </div>

      <Space size="middle" className="app-header__right">
        <Tag color={currentUser.role === 'admin' ? 'gold' : 'cyan'}>
          {currentUser.role === 'admin' ? 'Admin' : 'Employee'}
        </Tag>
        {currentUser.role === 'employee' && <MiniWalletWidget />}
        <RoleSwitcher />
      </Space>
    </Header>
  );
}

export const LayoutBase = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = currentUser.role === 'admin';

  if (isAdmin) {
    return (
      <Layout className="app-shell">
        <AppHeader />
        <Layout className="app-body">
          <Sider className="app-sider" width={248} breakpoint="lg" collapsedWidth={0}>
            <Menu
              className="app-sider-menu"
              theme="dark"
              mode="inline"
              selectedKeys={[location.pathname]}
              items={adminMenuItems}
              onClick={({ key }) => navigate(key)}
            />
          </Sider>
          <Layout>
            <Content className="app-content app-content--with-sider">
              <Outlet />
            </Content>
            <Footer className="app-footer">CodeMetrics ©2026 - SGDLI Academic MVP</Footer>
          </Layout>
        </Layout>
        <GoalInspectorDock />
      </Layout>
    );
  }

  return (
    <Layout className="app-shell">
      <AppHeader showEmployeeMenu menuItems={employeeMenuItems} />
      <Content className="app-content">
        <Outlet />
      </Content>
      <Footer className="app-footer">CodeMetrics ©2026 - SGDLI Academic MVP</Footer>
    </Layout>
  );
};
