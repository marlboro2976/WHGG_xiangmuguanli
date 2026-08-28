import { useState, useMemo } from 'react'
import {
  Table,
  Button,
  Input,
  Select,
  Space,
  Tag,
  Modal,
  Form,
  message,
  Switch,
  Popconfirm,
} from 'antd'
import {
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
} from '@ant-design/icons'

const ROLE_OPTIONS = [
  { label: '全部角色', value: '' },
  { label: '系统管理员', value: 'admin' },
  { label: '区级领导', value: 'district_leader' },
  { label: '区投促局', value: 'district_bureau' },
  { label: '园区管理员', value: 'park_admin' },
  { label: '项目专员', value: 'specialist' },
]

const DEPT_OPTIONS = [
  { label: '区级领导', value: '区级领导' },
  { label: '区投促局', value: '区投促局' },
  { label: '光谷园区', value: '光谷园区' },
  { label: '东湖园区', value: '东湖园区' },
  { label: '经开园区', value: '经开园区' },
]

const MOCK_DATA = [
  { key: 1, username: 'admin', name: '系统管理员', department: '区投促局', role: 'admin', status: 'enabled', createdAt: '2025-01-10 09:00:00' },
  { key: 2, username: 'zhangwei', name: '张伟', department: '区投促局', role: 'district_bureau', status: 'enabled', createdAt: '2025-02-15 14:30:00' },
  { key: 3, username: 'liming', name: '李明', department: '区级领导', role: 'district_leader', status: 'enabled', createdAt: '2025-03-01 10:20:00' },
  { key: 4, username: 'wangfang', name: '王芳', department: '光谷园区', role: 'park_admin', status: 'enabled', createdAt: '2025-03-12 16:45:00' },
  { key: 5, username: 'chenqiang', name: '陈强', department: '区投促局', role: 'specialist', status: 'disabled', createdAt: '2025-04-05 11:00:00' },
  { key: 6, username: 'liuyang', name: '刘洋', department: '东湖园区', role: 'park_admin', status: 'enabled', createdAt: '2025-04-20 09:30:00' },
  { key: 7, username: 'zhaomin', name: '赵敏', department: '区投促局', role: 'specialist', status: 'enabled', createdAt: '2025-05-08 13:15:00' },
  { key: 8, username: 'sunlei', name: '孙磊', department: '区级领导', role: 'district_leader', status: 'enabled', createdAt: '2025-05-22 15:00:00' },
  { key: 9, username: 'zhoujing', name: '周静', department: '经开园区', role: 'park_admin', status: 'disabled', createdAt: '2025-06-01 08:45:00' },
  { key: 10, username: 'wuhua', name: '吴华', department: '区投促局', role: 'district_bureau', status: 'enabled', createdAt: '2025-06-15 10:30:00' },
  { key: 11, username: 'zhenglin', name: '郑琳', department: '光谷园区', role: 'specialist', status: 'enabled', createdAt: '2025-07-01 14:00:00' },
  { key: 12, username: 'huangtao', name: '黄涛', department: '区投促局', role: 'specialist', status: 'enabled', createdAt: '2025-07-20 16:20:00' },
]

export default function Account() {
  const [searchText, setSearchText] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 })
  const [modalOpen, setModalOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)
  const [form] = Form.useForm()
  const [data, setData] = useState(MOCK_DATA)

  const roleLabel = (roleKey) => {
    const r = ROLE_OPTIONS.find(o => o.value === roleKey)
    return r ? r.label : roleKey
  }

  const filteredData = useMemo(() => {
    return data.filter(r => {
      if (searchText && !r.username.includes(searchText) && !r.name.includes(searchText)) return false
      if (roleFilter && r.role !== roleFilter) return false
      return true
    })
  }, [data, searchText, roleFilter])

  const pageData = useMemo(() => {
    const start = (pagination.current - 1) * pagination.pageSize
    return filteredData.slice(start, start + pagination.pageSize)
  }, [filteredData, pagination])

  const handleAdd = () => {
    setEditingRecord(null)
    form.resetFields()
    setModalOpen(true)
  }

  const handleEdit = (record) => {
    setEditingRecord(record)
    form.setFieldsValue(record)
    setModalOpen(true)
  }

  const handleToggleStatus = (record, checked) => {
    setData(prev => prev.map(item =>
      item.key === record.key ? { ...item, status: checked ? 'enabled' : 'disabled' } : item
    ))
    message.success(`已${checked ? '启用' : '禁用'}账号「${record.name}」`)
  }

  const handleDelete = (record) => {
    setData(prev => prev.filter(item => item.key !== record.key))
    message.success('删除成功')
  }

  const handleReset = () => {
    setSearchText('')
    setRoleFilter('')
    setPagination({ current: 1, pageSize: 10 })
  }

  const handleModalOk = () => {
    form.validateFields().then(values => {
      if (editingRecord) {
        setData(prev => prev.map(item =>
          item.key === editingRecord.key ? { ...item, ...values } : item
        ))
        message.success('编辑成功')
      } else {
        const newKey = Math.max(...data.map(d => d.key)) + 1
        setData(prev => [...prev, {
          key: newKey,
          ...values,
          status: 'enabled',
          createdAt: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
        }])
        message.success('新增成功')
      }
      setModalOpen(false)
    })
  }

  const columns = [
    { title: '用户名', dataIndex: 'username', key: 'username', width: 120 },
    { title: '姓名', dataIndex: 'name', key: 'name', width: 100 },
    { title: '部门', dataIndex: 'department', key: 'department', width: 120 },
    {
      title: '角色', dataIndex: 'role', key: 'role', width: 120, align: 'center',
      render: (v) => <Tag color="blue">{roleLabel(v)}</Tag>,
    },
    {
      title: '状态', dataIndex: 'status', key: 'status', width: 100, align: 'center',
      render: (_, record) => (
        <Switch
          checked={record.status === 'enabled'}
          checkedChildren="启用"
          unCheckedChildren="禁用"
          size="small"
          onChange={(checked) => handleToggleStatus(record, checked)}
        />
      ),
    },
    { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', width: 180, align: 'center' },
    {
      title: '操作', key: 'action', width: 200, align: 'center', fixed: 'right',
      render: (_, record) => (
        <Space size={0} split={<span style={{ color: '#d9d9d9', margin: '0 6px' }}>|</span>}>
          <span className="action-link" onClick={() => handleEdit(record)}>
            <EditOutlined /> 编辑
          </span>
          <Popconfirm
            title={`确定要删除账号「${record.name}」吗？`}
            onConfirm={() => handleDelete(record)}
            okText="确定"
            cancelText="取消"
          >
            <span className="action-link danger">
              <DeleteOutlined /> 删除
            </span>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div className="page-container">
      <div className="filter-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增账号
          </Button>
          <Input
            style={{ width: 240 }}
            placeholder="搜索用户名/姓名"
            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
            value={searchText}
            onChange={(e) => { setSearchText(e.target.value); setPagination(p => ({ ...p, current: 1 })) }}
            allowClear
          />
          <Select
            style={{ width: 160 }}
            placeholder="筛选角色"
            value={roleFilter}
            onChange={(v) => { setRoleFilter(v); setPagination(p => ({ ...p, current: 1 })) }}
            options={ROLE_OPTIONS}
          />
          <Button icon={<ReloadOutlined />} onClick={handleReset}>
            重置
          </Button>
        </div>
      </div>

      <div className="table-card">
        <div className="table-toolbar">
          <div className="table-toolbar-left" style={{ fontSize: 14, color: '#666' }}>
            共 <span style={{ color: '#1677ff', fontWeight: 600 }}>{filteredData.length}</span> 个账号
          </div>
        </div>
        <Table
          columns={columns}
          dataSource={pageData}
          rowKey="key"
          size="middle"
          pagination={{
            ...pagination,
            total: filteredData.length,
            showSizeChanger: true,
            showQuickJumper: true,
            pageSizeOptions: ['10', '20', '50'],
            showTotal: (total) => `共 ${total} 条`,
            onChange: (page, pageSize) => setPagination({ current: page, pageSize }),
          }}
        />
      </div>

      <Modal
        title={editingRecord ? '编辑账号' : '新增账号'}
        open={modalOpen}
        onOk={handleModalOk}
        onCancel={() => setModalOpen(false)}
        okText="确定"
        cancelText="取消"
        destroyOnClose
        width={500}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="username" label="用户名" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input prefix={<UserOutlined />} placeholder="请输入用户名" />
          </Form.Item>
          <Form.Item name="name" label="姓名" rules={[{ required: true, message: '请输入姓名' }]}>
            <Input placeholder="请输入姓名" />
          </Form.Item>
          <Form.Item name="department" label="部门" rules={[{ required: true, message: '请选择部门' }]}>
            <Select placeholder="请选择部门" options={DEPT_OPTIONS} />
          </Form.Item>
          <Form.Item name="role" label="角色" rules={[{ required: true, message: '请选择角色' }]}>
            <Select placeholder="请选择角色" options={ROLE_OPTIONS.filter(o => o.value)} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
