import { useState } from 'react'
import {
  Tabs,
  List,
  Button,
  Tag,
  Space,
  Badge,
  Empty,
  message,
  Popconfirm,
  Divider,
} from 'antd'
import {
  BellOutlined,
  CheckCircleOutlined,
  EyeOutlined,
  DeleteOutlined,
  CheckOutlined,
  FileTextOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  ScheduleOutlined,
} from '@ant-design/icons'

const INIT_SYSTEM_NOTICES = [
  { key: 1, title: '系统版本更新通知：新增字段管理模块', time: '2025-08-26 09:00:00', read: false, type: 'info' },
  { key: 2, title: '超期预警：「某新能源汽车零部件项目」已超过30天未更新', time: '2025-08-25 14:30:00', read: false, type: 'warning' },
  { key: 3, title: '超期预警：「某高端装备制造项目」已超过20天未更新', time: '2025-08-25 10:15:00', read: true, type: 'warning' },
  { key: 4, title: '系统维护通知：本周六凌晨2:00-4:00系统维护', time: '2025-08-24 16:00:00', read: true, type: 'info' },
  { key: 5, title: '操作提醒：超期设置参数已由系统管理员修改', time: '2025-08-23 11:20:00', read: true, type: 'info' },
  { key: 6, title: '数据备份完成通知', time: '2025-08-22 23:00:00', read: true, type: 'success' },
]

const INIT_TODOS = [
  { key: 1, title: '请审核「某生物医药产业园项目」签约信息', time: '2025-08-26 08:45:00', read: false, type: 'audit' },
  { key: 2, title: '请更新「某智能制造装备项目」进展汇报（剩余3天）', time: '2025-08-25 15:00:00', read: false, type: 'report' },
  { key: 3, title: '请处理「某集成电路封测项目」落地信息补录', time: '2025-08-25 09:30:00', read: true, type: 'task' },
  { key: 4, title: '请研判「某人工智能产业园项目」准入申请', time: '2025-08-24 14:00:00', read: true, type: 'audit' },
  { key: 5, title: '月度绩效考核数据待录入（截止8月31日）', time: '2025-08-22 10:00:00', read: true, type: 'task' },
]

const typeIcon = (type) => {
  switch (type) {
    case 'warning': return <WarningOutlined style={{ color: '#faad14', fontSize: 18 }} />
    case 'success': return <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 18 }} />
    case 'audit': return <FileTextOutlined style={{ color: '#1677ff', fontSize: 18 }} />
    case 'report': return <ScheduleOutlined style={{ color: '#722ed1', fontSize: 18 }} />
    case 'task': return <InfoCircleOutlined style={{ color: '#13c2c2', fontSize: 18 }} />
    default: return <BellOutlined style={{ color: '#1677ff', fontSize: 18 }} />
  }
}

const NoticeList = ({ data, onRead, onReadAll, onDelete, type }) => {
  const unreadCount = data.filter(d => !d.read).length

  if (data.length === 0) {
    return <Empty description="暂无消息" style={{ padding: '40px 0' }} />
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontSize: 13, color: '#666' }}>
          共 <span style={{ color: '#1677ff', fontWeight: 600 }}>{data.length}</span> 条消息
          {unreadCount > 0 && (
            <span style={{ marginLeft: 8 }}>
              未读 <Badge count={unreadCount} style={{ backgroundColor: '#ff4d4f' }} />
            </span>
          )}
        </span>
        {unreadCount > 0 && (
          <Button type="link" icon={<CheckOutlined />} onClick={onReadAll} style={{ padding: 0 }}>
            一键已读
          </Button>
        )}
      </div>
      <List
        dataSource={data}
        renderItem={(item) => (
          <List.Item
            key={item.key}
            style={{
              padding: '12px 16px',
              background: item.read ? '#fff' : '#f0f7ff',
              borderRadius: 4,
              marginBottom: 8,
              border: '1px solid #f0f0f0',
              transition: 'all 0.2s',
            }}
            actions={[
              <span key="view" className="action-link" onClick={() => onRead(item)}>
                <EyeOutlined /> 查看
              </span>,
              <Popconfirm
                key="del"
                title="确定删除这条消息吗？"
                onConfirm={() => onDelete(item)}
                okText="确定"
                cancelText="取消"
              >
                <span className="action-link danger">
                  <DeleteOutlined /> 删除
                </span>
              </Popconfirm>,
            ]}
          >
            <List.Item.Meta
              avatar={
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: item.read ? '#f5f5f5' : '#e6f4ff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {typeIcon(item.type)}
                </div>
              }
              title={
                <span style={{
                  fontWeight: item.read ? 400 : 600,
                  fontSize: 14,
                  color: item.read ? '#666' : '#262626',
                }}>
                  {!item.read && <Badge color="#ff4d4f" style={{ marginRight: 6 }} />}
                  {item.title}
                </span>
              }
              description={
                <span style={{ fontSize: 12, color: '#bfbfbf' }}>{item.time}</span>
              }
            />
          </List.Item>
        )}
      />
    </div>
  )
}

export default function Notice() {
  const [systemNotices, setSystemNotices] = useState(INIT_SYSTEM_NOTICES)
  const [todos, setTodos] = useState(INIT_TODOS)

  const handleRead = (list, setList, item) => {
    setList(prev => prev.map(n => n.key === item.key ? { ...n, read: true } : n))
    message.info('已标记为已读')
  }

  const handleReadAll = (setList) => {
    setList(prev => prev.map(n => ({ ...n, read: true })))
    message.success('已全部标记为已读')
  }

  const handleDelete = (list, setList, item) => {
    setList(prev => prev.filter(n => n.key !== item.key))
    message.success('删除成功')
  }

  const systemUnread = systemNotices.filter(n => !n.read).length
  const todoUnread = todos.filter(n => !n.read).length

  const tabItems = [
    {
      key: 'system',
      label: (
        <span>
          <BellOutlined /> 系统通知
          {systemUnread > 0 && <Badge count={systemUnread} size="small" style={{ marginLeft: 6, backgroundColor: '#ff4d4f' }} />}
        </span>
      ),
      children: (
        <NoticeList
          data={systemNotices}
          onRead={(item) => handleRead(systemNotices, setSystemNotices, item)}
          onReadAll={() => handleReadAll(setSystemNotices)}
          onDelete={(item) => handleDelete(systemNotices, setSystemNotices, item)}
          type="system"
        />
      ),
    },
    {
      key: 'todo',
      label: (
        <span>
          <ScheduleOutlined /> 待办事项
          {todoUnread > 0 && <Badge count={todoUnread} size="small" style={{ marginLeft: 6, backgroundColor: '#ff4d4f' }} />}
        </span>
      ),
      children: (
        <NoticeList
          data={todos}
          onRead={(item) => handleRead(todos, setTodos, item)}
          onReadAll={() => handleReadAll(setTodos)}
          onDelete={(item) => handleDelete(todos, setTodos, item)}
          type="todo"
        />
      ),
    },
  ]

  return (
    <div className="page-container">
      <div style={{ background: '#fff', borderRadius: 4, padding: '16px 24px 24px' }}>
        <div style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: '#262626', margin: 0 }}>
            <BellOutlined style={{ color: '#1677ff', marginRight: 8 }} />
            消息通知
          </h3>
          <p style={{ fontSize: 13, color: '#999', marginTop: 4, marginBottom: 0 }}>
            查看系统通知与待办事项，及时处理相关业务
          </p>
        </div>
        <Divider style={{ margin: '0 0 16px' }} />
        <Tabs
          defaultActiveKey="system"
          items={tabItems}
          size="middle"
        />
      </div>
    </div>
  )
}
