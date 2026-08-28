import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Tabs, Descriptions, Button, Space, Tag, Modal, Form, Input, Select, Row, Col,
  Timeline, message, Popconfirm, Typography, Empty
} from 'antd'
import {
  ArrowLeftOutlined, EditOutlined, PlusOutlined, DeleteOutlined,
  ExportOutlined, PauseCircleOutlined
} from '@ant-design/icons'
import mockData from '../mock/data.json'
import TransferToZaitanModal from '../components/TransferToZaitanModal'

const { TextArea } = Input
const { Option } = Select
const { Text } = Typography

const PROJECT_CATEGORY_OPTIONS = ['政策类', '投资类', '供地类', '其他']
const CAPITAL_NATURE_OPTIONS = ['内资', '外资']
const INDUSTRY_TYPE_OPTIONS = ['农业', '工业', '服务业']

const CURRENT_USER = '投促局管理员'

function formatTime(date) {
  const d = new Date(date)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

export default function MouhuaDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [basicForm] = Form.useForm()
  const [progressForm] = Form.useForm()

  const [project, setProject] = useState(() => {
    const mockFormValues = [
      { capitalNature: '内资', sourceRegion: ['上海', '上海市'], industryType: '工业', industryCategory: ['大健康和生物技术', '生物医药'], chainType965: ['生命健康', '生物医药'], investorContactPerson: '陶维红', investorContactPhone: '18612345625', investAmount: 1.2, projectDescription: '' },
      { capitalNature: '内资', sourceRegion: ['安徽', '合肥市'], industryType: '工业', industryCategory: ['超级计算和人工智能', '智能机器人'], chainType965: ['人工智能', '智能机器人'], investorContactPerson: '施海仁', investorContactPhone: '13800000002', investAmount: 1.5, projectDescription: '' },
      { capitalNature: '内资', sourceRegion: ['江苏', '苏州市'], industryType: '工业', industryCategory: ['"光芯屏端网"新一代信息技术', '先进半导体'], chainType965: ['光电子信息', '集成电路'], investorContactPerson: '许昂', investorContactPhone: '13900000003', investAmount: 1.1, projectDescription: '' },
      { capitalNature: '内资', sourceRegion: ['江苏', '南京市'], industryType: '工业', industryCategory: ['大健康和生物技术', '高端医疗器械'], chainType965: ['生命健康', '高端医疗器械'], investorContactPerson: '费良江', investorContactPhone: '13700000004', investAmount: 2, projectDescription: '' },
    ]
    const base = mockData.zaitan.slice(0, 4).map((item, idx) => ({
      key: `mouhua-${idx + 1}`,
      index: idx + 1,
      reporter: item['申报人'] || '-',
      projectStatus: '谋划中',
      projectName: item['项目名称'] || '-',
      sourceArea: item['来源地'] || '-',
      industryCategory: item['产业类别'] || '-',
      industryType: item['行业类别'] || '-',
      projectDesc: item['项目简介'] || '-',
      investorEntity: item['投资主体'] || '-',
      investorContactPerson: mockFormValues[idx].investorContactPerson,
      investorContactPhone: mockFormValues[idx].investorContactPhone,
      investAmount: item['投资金额（亿元）'] || mockFormValues[idx].investAmount,
      reportTime: item['申报时间'] || '-',
      projectCategory: PROJECT_CATEGORY_OPTIONS[idx % PROJECT_CATEGORY_OPTIONS.length],
      capitalNature: mockFormValues[idx].capitalNature,
      chainType965: item['对应"965"产业链类别'] || '-',
      _formValues: mockFormValues[idx],
    }))
    return base.find(p => p.key === id) || base[0]
  })

  const [progressList, setProgressList] = useState([
    {
      id: 'prog-1',
      content: '已完成项目初步方案，提交内部评审。',
      reporter: CURRENT_USER,
      updateTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'prog-2',
      content: '对接企业方确认投资意向，企业表示将在下周实地考察。',
      reporter: '驻沪办 蔡威',
      updateTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ])

  const [activeTab, setActiveTab] = useState('basic')
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [progressModalVisible, setProgressModalVisible] = useState(false)
  const [transferModalVisible, setTransferModalVisible] = useState(false)
  const [editingProgress, setEditingProgress] = useState(null)
  const [editLoading, setEditLoading] = useState(false)
  const [progressLoading, setProgressLoading] = useState(false)

  const sortedProgressList = useMemo(() => {
    return [...progressList].sort((a, b) => new Date(b.updateTime) - new Date(a.updateTime))
  }, [progressList])

  const handleBack = () => navigate('/project/mouhua')

  const handleEditBasic = () => {
    basicForm.setFieldsValue({
      projectName: project.projectName,
      projectCategory: project.projectCategory,
      capitalNature: project.capitalNature,
      industryType: project.industryCategory,
      investorEntity: project.investorEntity,
      investorContactPerson: project.investorContactPerson,
      investorContactPhone: project.investorContactPhone,
      projectDescription: project.projectDesc,
    })
    setEditModalVisible(true)
  }

  const handleEditOk = async () => {
    try {
      const values = await basicForm.validateFields()
      setEditLoading(true)
      setProject(prev => ({
        ...prev,
        projectName: values.projectName,
        projectCategory: values.projectCategory,
        capitalNature: values.capitalNature,
        industryCategory: values.industryType,
        investorEntity: values.investorEntity,
        investorContactPerson: values.investorContactPerson,
        investorContactPhone: values.investorContactPhone,
        projectDesc: values.projectDescription,
      }))
      message.success('基础信息已更新')
      setEditModalVisible(false)
    } catch (e) {
      // validation error
    } finally {
      setEditLoading(false)
    }
  }

  const handleAddProgress = () => {
    setEditingProgress(null)
    progressForm.resetFields()
    setProgressModalVisible(true)
  }

  const handleEditProgress = (record) => {
    setEditingProgress(record)
    progressForm.setFieldsValue({ content: record.content })
    setProgressModalVisible(true)
  }

  const handleProgressOk = async () => {
    try {
      const values = await progressForm.validateFields()
      setProgressLoading(true)
      const now = new Date().toISOString()
      if (editingProgress) {
        setProgressList(prev => prev.map(p =>
          p.id === editingProgress.id
            ? { ...p, content: values.content, updateTime: now }
            : p
        ))
        message.success('进展已更新')
      } else {
        setProgressList(prev => [
          { id: `prog-${Date.now()}`, content: values.content, reporter: CURRENT_USER, updateTime: now },
          ...prev,
        ])
        message.success('进展已添加')
      }
      setProgressModalVisible(false)
      progressForm.resetFields()
    } catch (e) {
      // validation
    } finally {
      setProgressLoading(false)
    }
  }

  const handleDeleteProgress = (record) => {
    setProgressList(prev => prev.filter(p => p.id !== record.id))
    message.success('进展已删除')
  }

  const handleToZaitan = () => {
    Modal.confirm({
      title: '转在谈',
      content: `确定将谋划项目「${project.projectName}」转入在谈阶段吗？需要补充在谈阶段必填字段。`,
      okText: '去补充信息', cancelText: '取消',
      onOk: () => setTransferModalVisible(true),
    })
  }
  const handleTransferOk = () => {
    setTransferModalVisible(false)
    message.success('该项目已从谋划列表移至在谈列表，正在跳转...')
    setTimeout(() => navigate('/project/zaitan'), 1000)
  }

  const handleTuiku = () => {
    Modal.confirm({
      title: '确认退库',
      content: `确定将项目「${project.projectName}」标记为退库吗？退库后不可恢复。`,
      okText: '确认退库', cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: () => { message.success('已标记为退库（demo示意）'); navigate('/project/mouhua') },
    })
  }

  const formItemLayout = { labelCol: { span: 8 }, wrapperCol: { span: 16 } }

  return (
    <div className="page-container">
      <div className="table-card" style={{ padding: '16px 24px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: 16, borderBottom: '1px solid #f0f0f0', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Button type="text" icon={<ArrowLeftOutlined />} onClick={handleBack} style={{ marginLeft: -8 }}>
              返回
            </Button>
            <span style={{ fontSize: 18, fontWeight: 600 }}>{project.projectName}</span>
            <Tag color="blue" style={{ background: '#e6f4ff', color: '#1677ff', border: '1px solid #91caff', margin: 0 }}>{project.projectStatus}</Tag>
          </div>
          <Space size={8}>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddProgress}>
              进展汇报
            </Button>
            <Button icon={<EditOutlined />} onClick={handleEditBasic}>
              编辑
            </Button>
            <Button icon={<ExportOutlined />} onClick={handleToZaitan}>
              转在谈
            </Button>
            <Button danger icon={<PauseCircleOutlined />} onClick={handleTuiku}>
              标记退库
            </Button>
          </Space>
        </div>

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'basic',
              label: '基础信息',
              children: (
                <div>
                  <Descriptions
                    bordered
                    column={2}
                    labelStyle={{ width: 140, background: '#fafafa', fontWeight: 500 }}
                    contentStyle={{ minWidth: 200 }}
                  >
                    <Descriptions.Item label="项目名称">{project.projectName}</Descriptions.Item>
                    <Descriptions.Item label="项目分类">{project.projectCategory}</Descriptions.Item>
                    <Descriptions.Item label="内外资">{project.capitalNature}</Descriptions.Item>
                    <Descriptions.Item label="来源地">{project.sourceArea}</Descriptions.Item>
                    <Descriptions.Item label="产业类别">{project.industryCategory}</Descriptions.Item>
                    <Descriptions.Item label="行业类别">{project.industryType}</Descriptions.Item>
                    <Descriptions.Item label="965产业链类别">{project.chainType965}</Descriptions.Item>
                    <Descriptions.Item label="投资主体">{project.investorEntity}</Descriptions.Item>
                    <Descriptions.Item label="投资主体联系人">{project.investorContactPerson}</Descriptions.Item>
                    <Descriptions.Item label="联系电话">{project.investorContactPhone}</Descriptions.Item>
                    <Descriptions.Item label="申报人">{project.reporter}</Descriptions.Item>
                    <Descriptions.Item label="申报时间">{project.reportTime}</Descriptions.Item>
                    <Descriptions.Item label="项目简介" span={2}>
                      <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>{project.projectDesc}</div>
                    </Descriptions.Item>
                  </Descriptions>
                </div>
              ),
            },
            {
              key: 'progress',
              label: '进展信息',
              children: (
                <div>
                  <div style={{ marginBottom: 20 }}>
                    <Text type="secondary" style={{ fontSize: 13, color: '#8c8c8c' }}>共 {progressList.length} 条进展记录（按更新时间倒序）</Text>
                  </div>
                  {sortedProgressList.length === 0 ? (
                    <Empty description="暂无进展记录，点击顶部「进展汇报」添加" style={{ padding: '60px 0' }} />
                  ) : (
                    <Timeline
                      items={sortedProgressList.map(item => ({
                        children: (
                          <div style={{ paddingBottom: 24 }}>
                            <div style={{
                              background: '#fff',
                              borderLeft: '3px solid #1677ff',
                              padding: '12px 16px 10px',
                              borderRadius: '0 4px 4px 0',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                            }}>
                              <div style={{
                                fontSize: 15,
                                color: '#262626',
                                lineHeight: 1.8,
                                whiteSpace: 'pre-wrap',
                                marginBottom: item.reporter === CURRENT_USER ? 10 : 8,
                              }}>
                                {item.content}
                              </div>
                              <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                fontSize: 12,
                                color: '#bfbfbf',
                              }}>
                                <span>—— {item.reporter} · {formatTime(item.updateTime)}</span>
                                {item.reporter === CURRENT_USER && (
                                  <Space size={0}>
                                    <Button
                                      type="text"
                                      size="small"
                                      style={{ fontSize: 12, color: '#bfbfbf', padding: '0 4px', height: 'auto' }}
                                      onClick={() => handleEditProgress(item)}
                                      onMouseEnter={e => e.currentTarget.style.color = '#1677ff'}
                                      onMouseLeave={e => e.currentTarget.style.color = '#bfbfbf'}
                                    >
                                      编辑
                                    </Button>
                                    <Popconfirm
                                      title="确定删除这条进展记录吗？"
                                      okText="删除" cancelText="取消"
                                      okButtonProps={{ danger: true, size: 'small' }}
                                      onConfirm={() => handleDeleteProgress(item)}
                                    >
                                      <Button
                                        type="text"
                                        size="small"
                                        style={{ fontSize: 12, color: '#bfbfbf', padding: '0 4px', height: 'auto' }}
                                        onMouseEnter={e => e.currentTarget.style.color = '#ff4d4f'}
                                        onMouseLeave={e => e.currentTarget.style.color = '#bfbfbf'}
                                      >
                                        删除
                                      </Button>
                                    </Popconfirm>
                                  </Space>
                                )}
                              </div>
                            </div>
                          </div>
                        ),
                      }))}
                    />
                  )}
                </div>
              ),
            },
          ]}
        />
      </div>

      <Modal
        title="编辑基础信息"
        open={editModalVisible}
        onOk={handleEditOk}
        onCancel={() => setEditModalVisible(false)}
        confirmLoading={editLoading}
        okText="保存" cancelText="取消"
        width={960}
        destroyOnClose
        bodyStyle={{ padding: '24px', maxHeight: '70vh', overflowY: 'auto' }}
      >
        <Form form={basicForm} {...formItemLayout} layout="horizontal" requiredMark={true} colon={false}>
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item label="项目名称" name="projectName" rules={[{ required: true, message: '请输入项目名称' }, { max: 40, message: '项目名称不超过40个字符' }]}>
                <Input placeholder="请输入项目名称" maxLength={40} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="项目分类" name="projectCategory" rules={[{ required: true, message: '请选择项目分类' }]}>
                <Select placeholder="请选择项目分类">
                  {PROJECT_CATEGORY_OPTIONS.map(o => <Option key={o} value={o}>{o}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="内外资" name="capitalNature" rules={[{ required: true, message: '请选择内外资' }]}>
                <Select placeholder="请选择内外资">
                  {CAPITAL_NATURE_OPTIONS.map(o => <Option key={o} value={o}>{o}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="产业类别" name="industryType" rules={[{ required: true, message: '请选择产业类别' }]}>
                <Select placeholder="请选择产业类别">
                  {INDUSTRY_TYPE_OPTIONS.map(o => <Option key={o} value={o}>{o}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="投资主体" name="investorEntity" rules={[{ required: true, message: '请输入投资主体' }]}>
                <Input placeholder="请输入投资主体" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="投资主体联系人" name="investorContactPerson" rules={[{ required: true, message: '请输入联系人' }]}>
                <Input placeholder="请输入联系人姓名" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="联系电话" name="investorContactPhone" rules={[
                { required: true, message: '请输入联系电话' },
                { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
              ]}>
                <Input placeholder="请输入联系电话" maxLength={15} />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="项目简介" name="projectDescription" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }} rules={[{ required: true, message: '请输入项目简介' }, { max: 999, message: '项目简介不超过999个字符' }]}>
                <TextArea rows={4} placeholder="请输入项目简介，最多999字" maxLength={999} showCount />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      <Modal
        title={editingProgress ? '编辑进展' : '新增进展'}
        open={progressModalVisible}
        onOk={handleProgressOk}
        onCancel={() => { setProgressModalVisible(false); progressForm.resetFields() }}
        confirmLoading={progressLoading}
        okText="保存" cancelText="取消"
        width={600}
        destroyOnClose
      >
        <Form form={progressForm} layout="vertical" requiredMark={true} style={{ marginTop: 16 }}>
          <Form.Item
            label="进展内容"
            name="content"
            rules={[{ required: true, message: '请输入进展内容' }, { max: 500, message: '进展内容不超过500个字符' }]}
          >
            <TextArea rows={6} placeholder="请输入进展内容，最多500字" maxLength={500} showCount />
          </Form.Item>
        </Form>
      </Modal>
      <TransferToZaitanModal
        open={transferModalVisible}
        onCancel={() => setTransferModalVisible(false)}
        onOk={handleTransferOk}
        projectData={project}
      />
    </div>
  )
}
