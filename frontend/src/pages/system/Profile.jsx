import { useState } from 'react'
import {
  Form,
  Input,
  Button,
  Card,
  Avatar,
  Tag,
  Divider,
  message,
  Descriptions,
  Space,
} from 'antd'
import {
  UserOutlined,
  SaveOutlined,
  TeamOutlined,
  IdcardOutlined,
  PhoneOutlined,
  MailOutlined,
  EditOutlined,
} from '@ant-design/icons'

const INITIAL_PROFILE = {
  username: 'zhangwei',
  name: '张伟',
  phone: '138****8888',
  email: 'zhangwei@donghu.gov.cn',
  department: '区投促局',
  role: '区投促局',
  lastLogin: '2025-08-26 08:30:15',
  createdAt: '2025-02-15 14:30:00',
}

export default function Profile() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState(INITIAL_PROFILE)
  const [editing, setEditing] = useState(false)

  const handleSave = () => {
    form.validateFields().then(values => {
      setLoading(true)
      setTimeout(() => {
        setProfile(prev => ({ ...prev, ...values }))
        setLoading(false)
        setEditing(false)
        message.success('个人信息已更新')
      }, 500)
    })
  }

  const handleEdit = () => {
    form.setFieldsValue({
      name: profile.name,
      phone: profile.phone,
      email: profile.email,
      department: profile.department,
    })
    setEditing(true)
  }

  const handleCancel = () => {
    setEditing(false)
    form.resetFields()
  }

  return (
    <div className="page-container">
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        <div style={{ width: '33.33%', minWidth: 280 }}>
          <Card style={{ borderRadius: 4 }} bodyStyle={{ textAlign: 'center', padding: '32px 24px' }}>
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: 16 }}>
              <Avatar
                size={96}
                icon={<UserOutlined />}
                style={{
                  backgroundColor: '#1677ff',
                  fontSize: 40,
                  border: '4px solid #e6f4ff',
                }}
              />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 600, color: '#262626', margin: '0 0 8px' }}>
              {profile.name}
            </h3>
            <div style={{ marginBottom: 4 }}>
              <Tag color="blue" style={{ fontSize: 13, padding: '2px 10px', marginBottom: 4 }}>
                <TeamOutlined style={{ marginRight: 4 }} />
                {profile.role}
              </Tag>
            </div>
            <div style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>
              <IdcardOutlined style={{ marginRight: 6, color: '#1677ff' }} />
              {profile.department}
            </div>
            <Divider style={{ margin: '16px 0' }} />
            <Descriptions column={1} size="small" labelStyle={{ color: '#999', fontSize: 12, width: 80, justifyContent: 'flex-end' }} contentStyle={{ fontSize: 13, color: '#333' }}>
              <Descriptions.Item label="用户名">{profile.username}</Descriptions.Item>
              <Descriptions.Item label="上次登录">{profile.lastLogin}</Descriptions.Item>
              <Descriptions.Item label="创建时间">{profile.createdAt}</Descriptions.Item>
            </Descriptions>
          </Card>
        </div>

        <div style={{ flex: 1 }}>
          <Card
            title={
              <span style={{ fontSize: 16, fontWeight: 600 }}>
                <UserOutlined style={{ color: '#1677ff', marginRight: 8 }} />
                基本信息
              </span>
            }
            extra={
              !editing && (
                <Button type="link" icon={<EditOutlined />} onClick={handleEdit} style={{ padding: 0 }}>
                  编辑资料
                </Button>
              )
            }
            style={{ borderRadius: 4 }}
          >
            {!editing ? (
              <div>
                <Descriptions
                  column={1}
                  labelStyle={{ width: 100, color: '#666', fontSize: 14, padding: '12px 0' }}
                  contentStyle={{ fontSize: 14, color: '#333', padding: '12px 0' }}
                  bordered
                >
                  <Descriptions.Item label="姓名">{profile.name}</Descriptions.Item>
                  <Descriptions.Item label="手机">
                    <PhoneOutlined style={{ color: '#1677ff', marginRight: 6 }} />
                    {profile.phone}
                  </Descriptions.Item>
                  <Descriptions.Item label="邮箱">
                    <MailOutlined style={{ color: '#1677ff', marginRight: 6 }} />
                    {profile.email}
                  </Descriptions.Item>
                  <Descriptions.Item label="部门">
                    <TeamOutlined style={{ color: '#1677ff', marginRight: 6 }} />
                    {profile.department}
                  </Descriptions.Item>
                  <Descriptions.Item label="角色">
                    <Tag color="blue" style={{ margin: 0 }}>{profile.role}</Tag>
                  </Descriptions.Item>
                </Descriptions>
              </div>
            ) : (
              <Form
                form={form}
                layout="horizontal"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 14 }}
                initialValues={{
                  name: profile.name,
                  phone: profile.phone,
                  email: profile.email,
                  department: profile.department,
                }}
                style={{ marginTop: 8 }}
              >
                <Form.Item
                  name="name"
                  label="姓名"
                  rules={[{ required: true, message: '请输入姓名' }]}
                >
                  <Input placeholder="请输入姓名" prefix={<UserOutlined />} />
                </Form.Item>
                <Form.Item
                  name="phone"
                  label="手机"
                  rules={[
                    { required: true, message: '请输入手机号' },
                    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' },
                  ]}
                >
                  <Input placeholder="请输入手机号" prefix={<PhoneOutlined />} maxLength={11} />
                </Form.Item>
                <Form.Item
                  name="email"
                  label="邮箱"
                  rules={[
                    { required: true, message: '请输入邮箱' },
                    { type: 'email', message: '请输入正确的邮箱格式' },
                  ]}
                >
                  <Input placeholder="请输入邮箱" prefix={<MailOutlined />} />
                </Form.Item>
                <Form.Item
                  name="department"
                  label="部门"
                  rules={[{ required: true, message: '请输入部门' }]}
                >
                  <Input placeholder="请输入部门" prefix={<TeamOutlined />} />
                </Form.Item>
                <Form.Item wrapperCol={{ offset: 4, span: 14 }} style={{ marginTop: 24 }}>
                  <Space size={12}>
                    <Button type="primary" icon={<SaveOutlined />} loading={loading} onClick={handleSave}>
                      保存
                    </Button>
                    <Button onClick={handleCancel}>取消</Button>
                  </Space>
                </Form.Item>
              </Form>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
