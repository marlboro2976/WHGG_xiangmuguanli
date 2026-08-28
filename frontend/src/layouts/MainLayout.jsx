import { useState, useMemo } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Avatar, Dropdown, Breadcrumb, Badge } from 'antd'
import {
  ProjectOutlined,
  BarChartOutlined,
  DashboardOutlined,
  SettingOutlined,
  UserOutlined,
  BellOutlined,
  SearchOutlined,
  AppstoreOutlined,
  TeamOutlined,
  FileTextOutlined,
  WarningOutlined,
  StopOutlined,
  PullRequestOutlined,
  AuditOutlined,
  PieChartOutlined,
  LineChartOutlined,
  UsergroupAddOutlined,
  SafetyCertificateOutlined,
  FileProtectOutlined,
  FieldTimeOutlined,
  NotificationOutlined,
  IdcardOutlined,
  LogoutOutlined,
} from '@ant-design/icons'

const { Header, Sider, Content } = Layout

const menuItems = [
  {
    key: 'project',
    icon: <ProjectOutlined />,
    label: '项目全生命周期管理',
    children: [
      { key: '/project/mouhua', icon: <AppstoreOutlined />, label: '项目谋划' },
      { key: '/project/zaitan', icon: <TeamOutlined />, label: '跟踪洽谈（在谈）' },
      { key: '/project/qianyue', icon: <FileTextOutlined />, label: '签约注册' },
      { key: '/project/luodi', icon: <AuditOutlined />, label: '项目落地' },
      { key: '/project/yanpan', icon: <WarningOutlined />, label: '项目重复研判' },
      { key: '/project/tuiku', icon: <StopOutlined />, label: '项目退库' },
    ],
  },
  {
    key: 'performance',
    icon: <BarChartOutlined />,
    label: '绩效考核',
    children: [
      { key: '/performance', icon: <PullRequestOutlined />, label: '绩效考核' },
    ],
  },
  {
    key: 'dashboard',
    icon: <DashboardOutlined />,
    label: '统计看板',
    children: [
      { key: '/dashboard/project', icon: <PieChartOutlined />, label: '项目维度看板' },
      { key: '/dashboard/perf', icon: <LineChartOutlined />, label: '绩效维度看板' },
    ],
  },
  {
    key: 'system',
    icon: <SettingOutlined />,
    label: '系统管理',
    children: [
      { key: '/system/account', icon: <UsergroupAddOutlined />, label: '账号管理' },
      { key: '/system/role', icon: <SafetyCertificateOutlined />, label: '角色管理' },
      { key: '/system/log', icon: <FileProtectOutlined />, label: '日志管理' },
      { key: '/system/field', icon: <AppstoreOutlined />, label: '字段管理' },
      { key: '/system/overdue', icon: <FieldTimeOutlined />, label: '超期设置' },
      { key: '/system/notice', icon: <NotificationOutlined />, label: '消息通知' },
      { key: '/system/profile', icon: <IdcardOutlined />, label: '个人中心' },
    ],
  },
]

// 面包屑映射
const breadcrumbMap = {
  '/project/mouhua': ['项目全生命周期管理', '项目谋划'],
  '/project/mouhua/detail': ['项目全生命周期管理', '项目谋划', '项目详情'],
  '/project/zaitan': ['项目全生命周期管理', '跟踪洽谈（在谈）'],
  '/project/qianyue': ['项目全生命周期管理', '签约注册'],
  '/project/luodi': ['项目全生命周期管理', '项目落地'],
  '/project/yanpan': ['项目全生命周期管理', '项目重复研判'],
  '/project/tuiku': ['项目全生命周期管理', '项目退库'],
  '/performance': ['绩效考核', '绩效考核'],
  '/dashboard/project': ['统计看板', '项目维度看板'],
  '/dashboard/perf': ['统计看板', '绩效维度看板'],
  '/system/account': ['系统管理', '账号管理'],
  '/system/role': ['系统管理', '角色管理'],
  '/system/log': ['系统管理', '日志管理'],
  '/system/field': ['系统管理', '字段管理'],
  '/system/overdue': ['系统管理', '超期设置'],
  '/system/notice': ['系统管理', '消息通知'],
  '/system/profile': ['系统管理', '个人中心'],
}

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [openKeys, setOpenKeys] = useState(['project'])
  const navigate = useNavigate()
  const location = useLocation()

  // 根据当前路径确定展开的菜单
  const currentOpenKeys = useMemo(() => {
    const path = location.pathname
    for (const item of menuItems) {
      if (item.children?.some(c => path.startsWith(c.key))) {
        return [item.key]
      }
    }
    return openKeys
  }, [location.pathname])

  const getBreadcrumbKey = (path) => {
    if (path.startsWith('/project/mouhua/detail')) return '/project/mouhua/detail'
    return path
  }

  const breadcrumbItems = (breadcrumbMap[getBreadcrumbKey(location.pathname)] || []).map((title, i, arr) => ({
    title: i === arr.length - 1 ? <span style={{ color: '#333' }}>{title}</span> : title,
  }))

  const userMenuItems = [
    { key: 'profile', icon: <UserOutlined />, label: '个人中心' },
    { type: 'divider' },
    { key: 'logout', icon: <LogoutOutlined />, label: '退出登录' },
  ]

  const getMenuKey = (path) => {
    if (path.startsWith('/project/mouhua')) return '/project/mouhua'
    return path
  }

  return (
    <Layout style={{ height: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={220}
        theme="dark"
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          background: '#001529',
        }}
      >
        <div
          style={{
            height: 56,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: collapsed ? 14 : 15,
            fontWeight: 700,
            letterSpacing: collapsed ? 0 : 1,
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
          }}
        >
          {collapsed ? '光谷' : '光谷项目全周期管理平台'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[getMenuKey(location.pathname)]}
          openKeys={currentOpenKeys}
          onOpenChange={(keys) => setOpenKeys(keys)}
          items={menuItems}
          onClick={({ key }) => {
            if (key.startsWith('/')) navigate(key)
          }}
          style={{ borderRight: 0, paddingTop: 8 }}
        />
      </Sider>
      <Layout style={{ marginLeft: collapsed ? 80 : 220, transition: 'margin-left 0.2s' }}>
        <Header
          style={{
            padding: '0 24px',
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 4px rgba(0,21,41,.08)',
            position: 'sticky',
            top: 0,
            zIndex: 10,
            height: 56,
          }}
        >
          <Breadcrumb items={breadcrumbItems} style={{ fontSize: 13 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <SearchOutlined style={{ fontSize: 16, color: '#8c8c8c', cursor: 'pointer' }} />
            <Badge count={3} size="small">
              <BellOutlined style={{ fontSize: 16, color: '#8c8c8c', cursor: 'pointer' }} />
            </Badge>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <Avatar size="small" icon={<UserOutlined />} style={{ background: '#1677ff' }} />
                <span style={{ fontSize: 13, color: '#333' }}>投促局管理员</span>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content
          style={{
            margin: 0,
            background: '#f0f2f5',
            overflow: 'auto',
            height: 'calc(100vh - 56px)',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
